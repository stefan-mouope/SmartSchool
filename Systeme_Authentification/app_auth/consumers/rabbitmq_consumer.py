# rabbitmq_consumer.py
import pika
import json
import threading
import logging
from datetime import datetime

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings

User = get_user_model()
jwt_auth = JWTAuthentication()
logger = logging.getLogger(__name__)

# Actions autorisées par rôle
ALLOWED_ACTIONS = {
    "directeur": ["create_eleve", "create_inscription", "delete_eleve"],
    "caissier": ["view_paiements"],
    "secretaire": ["view_eleves"],
}


def get_refreshed_tokens(refresh_token_str: str) -> dict:
    """Essaie de rafraîchir un refresh token et renvoie access + refresh si succès"""
    try:
        refresh = RefreshToken(refresh_token_str)
        # Force la vérification (signature + exp + blacklist si activée)
        refresh.check_exp()
        if api_settings.BLACKLIST_AFTER_ROTATION:
            refresh.check_blacklist()

        new_access = str(refresh.access_token)
        new_refresh = str(refresh)

        return {
            "success": True,
            "access_token": new_access,
            "refresh_token": new_refresh,
        }
    except Exception as e:
        logger.warning(f"Échec du refresh token : {e}")
        return {"success": False, "error": str(e)}


def verify_and_refresh_token(access_token: str = None, refresh_token: str = None) -> dict:
    """
    Vérifie le token d'accès.
    Si expiré → tente de le rafraîchir avec le refresh_token fourni.
    Retourne un dict complet pour le callback.
    """
    # Cas 1 : Token d'accès valide → tout va bien
    try:
        validated_token = jwt_auth.get_validated_token(access_token)
        user = jwt_auth.get_user(validated_token)
        payload = validated_token.payload

        return {
            "valid": True,
            "needs_refresh": False,
            "user_id": payload.get("user_id"),
            "username": getattr(user, "username", payload.get("username")),
            "role": payload.get("role"),
            "access_token": access_token,   # on renvoie l'ancien (encore valide)
        }

    except InvalidToken as e:
        # Le token est invalide ou expiré → on tente le refresh
        if not refresh_token:
            return {
                "valid": False,
                "error": "Token expiré et aucun refresh_token fourni"
            }

        refresh_result = get_refreshed_tokens(refresh_token)
        if not refresh_result["success"]:
            return {
                "valid": False,
                "error": "Token expiré et refresh échoué",
                "refresh_error": refresh_result.get("error")
            }

        # Refresh réussi → on revérifie le NOUVEAU access token
        new_access = refresh_result["access_token"]
        try:
            validated_token = jwt_auth.get_validated_token(new_access)
            user = jwt_auth.get_user(validated_token)
            payload = validated_token.payload

            return {
                "valid": True,
                "needs_refresh": True,
                "user_id": payload.get("user_id"),
                "username": getattr(user, "username", payload.get("username")),
                "role": payload.get("role"),
                "new_access_token": new_access,
                "new_refresh_token": refresh_result["refresh_token"],
            }
        except Exception as e2:
            return {
                "valid": False,
                "error": "Refresh réussi mais nouveau token invalide",
                "details": str(e2)
            }

    except Exception as e:
        return {"valid": False, "error": f"Erreur inattendue : {str(e)}"}


class RabbitMQConsumer(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.queue_name = "auth_verify_queue"

    def run(self):
        host = 'rabbitmq' if 'docker' in open('/proc/1/cgroup', 'r').read() else 'localhost'
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=host, port=5672,
                credentials=pika.PlainCredentials('guest', 'guest'),
                heartbeat=600
            )
        )
        channel = connection.channel()

        channel.exchange_declare(exchange="inscription_events", exchange_type="topic", durable=False)
        channel.queue_declare(queue=self.queue_name, durable=True)
        channel.queue_bind(exchange="inscription_events", queue=self.queue_name, routing_key="auth.verify")

        print("Consumer RabbitMQ (auth.verify + auto-refresh) démarré")

        def callback(ch, method, properties, body):
            try:
                data = json.loads(body)
                access_token = data.get("token")          # access token actuel
                refresh_token = data.get("refresh_token") # refresh token (peut être absent)
                action = data.get("action", "").strip()

                response = {"valid": False, "error": "Requête invalide"}

                if not access_token or not action:
                    response["error"] = "token et action obligatoires"
                else:
                    result = verify_and_refresh_token(access_token, refresh_token)

                    if not result["valid"]:
                        response["error"] = result["error"]
                        if "refresh_error" in result:
                            response["refresh_error"] = result["refresh_error"]
                    else:
                        role = result.get("role", "")

                        if action not in ALLOWED_ACTIONS.get(role, []):
                            response = {
                                "valid": False,
                                "error": f"Action '{action}' non autorisée pour le rôle '{role}'"
                            }
                        else:
                            # Tout est OK
                            response = {
                                "valid": True,
                                "user_id": str(result["user_id"]),
                                "username": result["username"],
                                "role": role,
                            }

                            # Si on a rafraîchi le token → on le renvoie au frontend Node.js
                            if result.get("needs_refresh"):
                                response["refresh"] = {
                                    "access_token": result["new_access_token"],
                                    "refresh_token": result["new_refresh_token"]
                                }
                                response["message"] = "Token rafraîchi automatiquement"

            except json.JSONDecodeError:
                response = {"valid": False, "error": "JSON invalide"}
            except Exception as e:
                logger.error(f"Erreur callback RabbitMQ : {e}")
                response = {"valid": False, "error": "Erreur serveur"}

            # Réponse RPC
            ch.basic_publish(
                exchange="",
                routing_key=properties.reply_to,
                properties=pika.BasicProperties(correlation_id=properties.correlation_id),
                body=json.dumps(response, ensure_ascii=False)
            )
            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_consume(queue=self.queue_name, on_message_callback=callback)
        channel.start_consuming()