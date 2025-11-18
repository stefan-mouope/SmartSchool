import pika
import json
import threading
import logging

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()
jwt_authenticator = JWTAuthentication()  # On l’instancie une seule fois (plus efficace)
logger = logging.getLogger(__name__)


def verify_jwt_token(token: str) -> dict:
    """
    Vérifie un token JWT de manière stricte (signature + expiration + etc.)
    Retourne un dict avec les infos si valide, sinon {'valid': False, 'error': ...}
    """
    if not token:
        return {"valid": False, "error": "Token manquant"}

    try:
        # Vérification complète : signature, expiration, algorithme, etc.
        validated_token = jwt_authenticator.get_validated_token(token)

        # Récupération de l'utilisateur (vérifie aussi que l'utilisateur existe toujours)
        user = jwt_authenticator.get_user(validated_token)

        payload = validated_token.payload

        return {
            "valid": True,
            "user_id": payload.get("user_id"),
            "username": getattr(user, "username", None) or payload.get("username"),
            "role": payload.get("role"),
            "user": user,  # optionnel, si tu veux l'objet User complet plus tard
            "payload": payload
        }

    except InvalidToken as e:
        return {"valid": False, "error": f"Token invalide ou expiré : {e}"}
    except TokenError as e:
        return {"valid": False, "error": f"Erreur de token : {e}"}
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la vérification du token : {e}")
        return {"valid": False, "error": "Erreur interne lors de la vérification du token"}


class RabbitMQConsumer(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.queue_name = "auth_verify_queue"

    def run(self):
        # Connexion RabbitMQ (auto-détection Docker)
        host = 'rabbitmq' if 'docker' in open('/proc/1/cgroup', 'r').read() else 'localhost'
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=host,
                port=5672,
                credentials=pika.PlainCredentials('guest', 'guest'),
                heartbeat=600,
                blocked_connection_timeout=300
            )
        )
        channel = connection.channel()

        # Déclaration de l'exchange utilisé par Node.js
        channel.exchange_declare(
            exchange="inscription_events",
            exchange_type="topic",
            durable=False
        )

        # Déclaration de la queue
        channel.queue_declare(queue=self.queue_name, durable=True)

        # Binding avec la routing key utilisée côté Node.js
        channel.queue_bind(
            exchange="inscription_events",
            queue=self.queue_name,
            routing_key="auth.verify"
        )

        print("Queue liée à l'exchange inscription_events (routing_key=auth.verify)")

        # Liste des actions autorisées par rôle
        ALLOWED_ACTIONS = {
            "directeur": ["create_eleve", "create_inscription", "delete_eleve"],
            "caissier": ["view_paiements"],
            "secretaire": ["view_eleves"],
        }

        def callback(ch, method, properties, body):
            try:
                data = json.loads(body)
                token = data.get("token")
                action = data.get("action", "").strip()

                # Réponse par défaut
                response = {"valid": False, "error": "Requête invalide"}

                if not token or not action:
                    response["error"] = "Token ou action manquant(e)"
                else:
                    verification = verify_jwt_token(token)

                    if not verification["valid"]:
                        response["error"] = verification["error"]
                    else:
                        role = verification.get("role", "")
                        user_id = verification.get("user_id")
                        username = verification.get("username")

                        if action not in ALLOWED_ACTIONS.get(role, []):
                            response = {
                                "valid": False,
                                "error": f"Action '{action}' non autorisée pour le rôle '{role}'"
                            }
                        else:
                            response = {
                                "valid": True,
                                "user_id": str(user_id),
                                "username": username,
                                "role": role
                            }

            except json.JSONDecodeError:
                response = {"valid": False, "error": "Payload JSON invalide"}
            except Exception as e:
                logger.error(f"Erreur dans le callback RabbitMQ : {e}")
                response = {"valid": False, "error": "Erreur interne du serveur"}

            # Réponse RPC obligatoire
            ch.basic_publish(
                exchange="",
                routing_key=properties.reply_to,
                properties=pika.BasicProperties(
                    correlation_id=properties.correlation_id
                ),
                body=json.dumps(response, ensure_ascii=False)
            )

            ch.basic_ack(delivery_tag=method.delivery_tag)

        print("Django Consumer RabbitMQ démarré et en écoute sur auth.verify...")
        channel.basic_consume(queue=self.queue_name, on_message_callback=callback)
        channel.start_consuming()