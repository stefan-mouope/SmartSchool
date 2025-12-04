import json
import threading
import logging
import pika
import os
from typing import Dict, Callable, Optional
from contextlib import contextmanager

from django.conf import settings

logger = logging.getLogger(__name__)

# ⚠️ LAZY IMPORTS: Ces imports sont faits dans les fonctions pour éviter les problèmes
# Ne pas importer au niveau module car Django n'est pas encore prêt
def get_django_dependencies():
    """Import lazy des dépendances Django"""
    from django.contrib.auth import get_user_model
    from django.db import transaction
    from rest_framework_simplejwt.authentication import JWTAuthentication
    from rest_framework_simplejwt.exceptions import InvalidToken
    from rest_framework_simplejwt.tokens import RefreshToken
    from rest_framework_simplejwt.settings import api_settings
    from app_auth.serializers import RegisterSerializer
    
    return {
        'User': get_user_model(),
        'jwt_auth': JWTAuthentication(),
        'transaction': transaction,
        'InvalidToken': InvalidToken,
        'RefreshToken': RefreshToken,
        'api_settings': api_settings,
        'RegisterSerializer': RegisterSerializer
    }


# =====================================================
# 🔧 CONFIGURATION RABBITMQ
# =====================================================
class RabbitMQConfig:
    """Configuration centralisée pour RabbitMQ"""
    
    HOST = getattr(settings, 'RABBITMQ_HOST', 'rabbitmq-service')
    PORT = getattr(settings, 'RABBITMQ_PORT', 5672)
    USERNAME = getattr(settings, 'RABBITMQ_USER', 'guest')
    PASSWORD = getattr(settings, 'RABBITMQ_PASSWORD', 'guest')
    EXCHANGE_NAME = 'inscription_events'
    EXCHANGE_TYPE = 'topic'
    
    # Détection automatique de l'environnement
    @classmethod
    def detect_host(cls):
        """Détecte si on est dans Docker ou en local"""
        try:
            if os.path.exists('/.dockerenv') or 'docker' in open('/proc/1/cgroup').read():
                return 'rabbitmq'
        except:
            pass
        return 'localhost'
    
    @classmethod
    def get_connection_params(cls):
        """Retourne les paramètres de connexion"""
        host = cls.detect_host() if cls.HOST == 'rabbitmq-service' else cls.HOST
        return pika.ConnectionParameters(
            host=host,
            port=cls.PORT,
            credentials=pika.PlainCredentials(cls.USERNAME, cls.PASSWORD),
            heartbeat=600,
            blocked_connection_timeout=300,
            connection_attempts=5,
            retry_delay=2
        )


# =====================================================
# 🔐 GESTION DES PERMISSIONS
# =====================================================
class PermissionManager:
    """Gestionnaire centralisé des permissions par rôle"""
    
    ALLOWED_ACTIONS = {
        "superuser": ["create_ecole", "create_director", "create_academicYear"],
        "directeur": [
            "create_eleve", "delete_eleve", "create_inscription",
            "create_teacher", "create_classroom", "create_matter",
            "create_academicYear"
        ],
        "enseignant": ["create_note", "update_note", "view_notes", "create_inscription"],
        "caissier": ["view_paiements", "create_paiement"],
        "secretaire": ["view_eleves", "create_eleve"]
    }
    
    @classmethod
    def is_action_allowed(cls, role: str, action: str) -> bool:
        """Vérifie si une action est autorisée pour un rôle"""
        return action in cls.ALLOWED_ACTIONS.get(role, [])
    
    @classmethod
    def get_allowed_actions(cls, role: str) -> list:
        """Retourne la liste des actions autorisées pour un rôle"""
        return cls.ALLOWED_ACTIONS.get(role, [])


# =====================================================
# 🎫 GESTION DES TOKENS JWT
# =====================================================
class TokenManager:
    """Gestionnaire centralisé pour les tokens JWT"""
    
    _deps = None
    
    @classmethod
    def _get_deps(cls):
        """Lazy loading des dépendances Django"""
        if cls._deps is None:
            cls._deps = get_django_dependencies()
        return cls._deps
    
    @classmethod
    def refresh_tokens(cls, refresh_token_str: str) -> dict:
        """Rafraîchit les tokens à partir d'un refresh token"""
        try:
            deps = cls._get_deps()
            RefreshToken = deps['RefreshToken']
            api_settings = deps['api_settings']
            
            refresh = RefreshToken(refresh_token_str)
            refresh.check_exp()
            
            if api_settings.BLACKLIST_AFTER_ROTATION:
                refresh.check_blacklist()

            return {
                "success": True,
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh)
            }
        except Exception as e:
            logger.error(f"Erreur lors du refresh des tokens: {e}")
            return {"success": False, "error": str(e)}

    @classmethod
    def verify_and_refresh_token(cls, access_token: str, refresh_token: str = None) -> dict:
        """Vérifie un access token et le rafraîchit si nécessaire"""
        try:
            deps = cls._get_deps()
            jwt_auth = deps['jwt_auth']
            InvalidToken = deps['InvalidToken']
            
            # Tentative de validation du token actuel
            validated = jwt_auth.get_validated_token(access_token)
            user = jwt_auth.get_user(validated)
            payload = validated.payload

            return {
                "valid": True,
                "needs_refresh": False,
                "user_id": payload.get("user_id"),
                "username": getattr(user, "username", payload.get("username")),
                "role": payload.get("role"),
                "access_token": access_token
            }

        except InvalidToken:
            # Token invalide, tentative de refresh
            if not refresh_token:
                return {"valid": False, "error": "Token expiré, refresh token manquant"}

            refreshed = cls.refresh_tokens(refresh_token)
            if not refreshed["success"]:
                return {"valid": False, "error": f"Échec du refresh: {refreshed['error']}"}

            # Validation du nouveau token
            new_access = refreshed["access_token"]
            validated = jwt_auth.get_validated_token(new_access)
            user = jwt_auth.get_user(validated)
            payload = validated.payload

            return {
                "valid": True,
                "needs_refresh": True,
                "user_id": payload.get("user_id"),
                "username": getattr(user, "username", payload.get("username")),
                "role": payload.get("role"),
                "new_access_token": new_access,
                "new_refresh_token": refreshed["refresh_token"]
            }
        except Exception as e:
            logger.error(f"Erreur lors de la vérification du token: {e}")
            return {"valid": False, "error": str(e)}


# =====================================================
# 🔌 GESTIONNAIRE DE CONNEXION RABBITMQ
# =====================================================
class RabbitMQConnectionManager:
    """Gestionnaire singleton pour les connexions RabbitMQ"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self._connection = None
        self._channels = {}
        self._lock = threading.Lock()
        self._initialized = True
        logger.info("RabbitMQConnectionManager initialisé")
    
    def get_connection(self):
        """Retourne ou crée une connexion RabbitMQ"""
        with self._lock:
            if self._connection is None or self._connection.is_closed:
                try:
                    params = RabbitMQConfig.get_connection_params()
                    self._connection = pika.BlockingConnection(params)
                    logger.info(f"Connexion RabbitMQ établie: {RabbitMQConfig.detect_host()}")
                except Exception as e:
                    logger.error(f"Erreur connexion RabbitMQ: {e}")
                    raise
            return self._connection
    
    def get_channel(self, channel_id: str):
        """Retourne ou crée un channel pour un consumer"""
        with self._lock:
            if channel_id not in self._channels or self._channels[channel_id].is_closed:
                connection = self.get_connection()
                self._channels[channel_id] = connection.channel()
                logger.info(f"Channel créé: {channel_id}")
            return self._channels[channel_id]
    
    def close(self):
        """Ferme tous les channels et la connexion"""
        with self._lock:
            for channel_id, channel in self._channels.items():
                try:
                    if not channel.is_closed:
                        channel.close()
                        logger.info(f"Channel fermé: {channel_id}")
                except Exception as e:
                    logger.error(f"Erreur fermeture channel {channel_id}: {e}")
            
            if self._connection and not self._connection.is_closed:
                try:
                    self._connection.close()
                    logger.info("Connexion RabbitMQ fermée")
                except Exception as e:
                    logger.error(f"Erreur fermeture connexion: {e}")
            
            self._channels = {}
            self._connection = None


# =====================================================
# 🏗️ CLASSE DE BASE POUR LES CONSUMERS
# =====================================================
class BaseRabbitMQConsumer(threading.Thread):
    """Classe de base pour tous les consumers RabbitMQ"""
    
    def __init__(self, queue_name: str, routing_key: str):
        super().__init__(daemon=True)
        self.queue_name = queue_name
        self.routing_key = routing_key
        self.connection_manager = RabbitMQConnectionManager()
        self.channel = None
        
    def setup_queue(self):
        """Configure la queue et les bindings"""
        try:
            self.channel = self.connection_manager.get_channel(self.queue_name)
            
            # Déclaration de l'exchange
            self.channel.exchange_declare(
                exchange=RabbitMQConfig.EXCHANGE_NAME,
                exchange_type=RabbitMQConfig.EXCHANGE_TYPE,
                durable=True
            )
            
            # Déclaration de la queue
            self.channel.queue_declare(queue=self.queue_name, durable=True)
            
            # Binding
            self.channel.queue_bind(
                exchange=RabbitMQConfig.EXCHANGE_NAME,
                queue=self.queue_name,
                routing_key=self.routing_key
            )
            
            # Configuration de la qualité de service
            self.channel.basic_qos(prefetch_count=1)
            
            logger.info(f"✅ Queue configurée: {self.queue_name} -> {self.routing_key}")
            
        except Exception as e:
            logger.error(f"❌ Erreur configuration queue {self.queue_name}: {e}")
            raise
    
    def send_rpc_response(self, properties, data: dict):
        """Envoie une réponse RPC"""
        if not properties.reply_to:
            return
            
        try:
            self.channel.basic_publish(
                exchange="",
                routing_key=properties.reply_to,
                properties=pika.BasicProperties(
                    correlation_id=properties.correlation_id,
                    content_type='application/json'
                ),
                body=json.dumps(data, ensure_ascii=False)
            )
            logger.debug(f"Réponse RPC envoyée: {properties.reply_to}")
        except Exception as e:
            logger.error(f"Erreur envoi réponse RPC: {e}")
    
    def handle_message(self, ch, method, properties, body):
        """Méthode à implémenter par les classes filles"""
        raise NotImplementedError("handle_message doit être implémentée")
    
    def run(self):
        """Démarre le consumer"""
        try:
            self.setup_queue()
            
            logger.info(f"🔥 Consumer démarré: {self.queue_name}")
            
            self.channel.basic_consume(
                queue=self.queue_name,
                on_message_callback=self.handle_message
            )
            
            self.channel.start_consuming()
            
        except KeyboardInterrupt:
            logger.info(f"Arrêt du consumer {self.queue_name}")
            self.stop()
        except Exception as e:
            logger.error(f"Erreur dans consumer {self.queue_name}: {e}")
            raise
    
    def stop(self):
        """Arrête le consumer proprement"""
        try:
            if self.channel and not self.channel.is_closed:
                self.channel.stop_consuming()
                logger.info(f"Consumer arrêté: {self.queue_name}")
        except Exception as e:
            logger.error(f"Erreur arrêt consumer {self.queue_name}: {e}")


# =====================================================
# 🔐 CONSUMER POUR L'AUTHENTIFICATION
# =====================================================
class AuthVerifyConsumer(BaseRabbitMQConsumer):
    """Consumer pour la vérification d'authentification et des permissions"""
    
    def __init__(self):
        super().__init__(
            queue_name="auth_verify_queue",
            routing_key="auth.verify"
        )
    
    def handle_message(self, ch, method, properties, body):
        """Traite les messages de vérification d'authentification"""
        try:
            data = json.loads(body)
            access_token = data.get("token")
            refresh_token = data.get("refresh_token")
            action = data.get("action", "")
            
            # Vérification du token
            result = TokenManager.verify_and_refresh_token(access_token, refresh_token)
            
            # Token invalide
            if not result["valid"]:
                self.send_rpc_response(properties, {
                    "valid": False,
                    "error": result["error"]
                })
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return
            
            role = result.get("role")
            
            # Vérification des permissions
            if action and not PermissionManager.is_action_allowed(role, action):
                self.send_rpc_response(properties, {
                    "valid": False,
                    "error": f"Action '{action}' non autorisée pour le rôle '{role}'",
                    "allowed_actions": PermissionManager.get_allowed_actions(role)
                })
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return
            
            # Réponse réussie
            response = {
                "valid": True,
                "user_id": result["user_id"],
                "username": result["username"],
                "role": role
            }
            
            # Ajout des nouveaux tokens si refresh nécessaire
            if result.get("needs_refresh"):
                response["refresh"] = {
                    "access_token": result["new_access_token"],
                    "refresh_token": result["new_refresh_token"],
                }
            
            self.send_rpc_response(properties, response)
            logger.info(f"Auth vérifiée: user={result['username']}, role={role}, action={action}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Erreur JSON: {e}")
            self.send_rpc_response(properties, {
                "valid": False,
                "error": "Format JSON invalide"
            })
        except Exception as e:
            logger.error(f"Erreur callback AuthVerifyConsumer: {e}", exc_info=True)
            self.send_rpc_response(properties, {
                "valid": False,
                "error": f"Erreur serveur: {str(e)}"
            })
        finally:
            ch.basic_ack(delivery_tag=method.delivery_tag)


# =====================================================
# 👤 CONSUMER POUR L'INSCRIPTION
# =====================================================
class RegistrationConsumer(BaseRabbitMQConsumer):
    """Consumer pour la création de comptes utilisateurs"""
    
    def __init__(self):
        super().__init__(
            queue_name="registration_queue",        # Queue dédiée à l'inscription
            routing_key="inscription.create.director"       # Routing key utilisée par Node
        )
    
    def handle_message(self, ch, method, properties, body):
        """Traite les messages RPC pour la création de compte"""

        response = None  # Toujours renvoyer quelque chose

        try:
            payload = json.loads(body)
            logger.info(f"📩 Message inscription reçu: {payload.get('username', 'N/A')}")

            deps = get_django_dependencies()
            transaction = deps['transaction']
            RegisterSerializer = deps['RegisterSerializer']

            with transaction.atomic():
                serializer = RegisterSerializer(data=payload)

                if not serializer.is_valid():
                    response = {
                        "success": False,
                        "error": "Données invalides",
                        "details": serializer.errors
                    }
                    return  # Le finally va gérer l’envoi et le ack

                user = serializer.save()

                response = {
                    "success": True,
                    "message": f"Compte {user.role} créé avec succès",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role
                    }
                }

                logger.info(f"👤 Utilisateur créé: {user.username} ({user.role})")

        except json.JSONDecodeError:
            response = {
                "success": False,
                "error": "Format JSON invalide"
            }

        except Exception as e:
            logger.error(f"❌ Erreur RegistrationConsumer: {e}", exc_info=True)
            response = {
                "success": False,
                "error": f"Erreur lors de la création: {str(e)}"
            }

        finally:
            # Toujours envoyer une réponse RPC, même en cas d’erreur
            try:
                if properties.reply_to:
                    self.send_rpc_response(properties, response)
            except Exception as e:
                logger.error(f"❌ Impossible d'envoyer la réponse RPC: {e}")

            # Toujours ACK pour éviter le retry infini
            try:
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                logger.error(f"❌ Impossible d'ACK le message: {e}")


# =====================================================
# 🚀 GESTIONNAIRE DE TOUS LES CONSUMERS
# =====================================================
class ConsumerManager:
    """Gestionnaire pour démarrer et arrêter tous les consumers"""
    
    def __init__(self):
        self.consumers = []
        self.connection_manager = RabbitMQConnectionManager()
    
    def register_consumer(self, consumer_class):
        """Enregistre un nouveau consumer"""
        consumer = consumer_class()
        self.consumers.append(consumer)
        return consumer
    
    def start_all(self):
        """Démarre tous les consumers"""
        logger.info("🚀 Démarrage de tous les consumers RabbitMQ...")
        
        for consumer in self.consumers:
            try:
                consumer.start()
                logger.info(f"✅ Consumer démarré: {consumer.queue_name}")
            except Exception as e:
                logger.error(f"❌ Erreur démarrage {consumer.queue_name}: {e}")
    
    def stop_all(self):
        """Arrête tous les consumers"""
        logger.info("🛑 Arrêt de tous les consumers...")
        
        for consumer in self.consumers:
            try:
                consumer.stop()
            except Exception as e:
                logger.error(f"Erreur arrêt consumer: {e}")
        
        self.connection_manager.close()
        logger.info("Tous les consumers arrêtés")
    
    def wait_for_all(self):
        """Attend que tous les consumers se terminent"""
        for consumer in self.consumers:
            if consumer.is_alive():
                consumer.join()


# =====================================================
# 📦 INITIALISATION DES CONSUMERS
# =====================================================
def init_consumers():
    """Fonction d'initialisation à appeler depuis Django"""
    manager = ConsumerManager()
    
    # Enregistrement des consumers
    manager.register_consumer(AuthVerifyConsumer)
    manager.register_consumer(RegistrationConsumer)
    
    # Démarrage
    manager.start_all()
    
    return manager


# Pour Django ready()
if __name__ != "__main__":
    try:
        consumer_manager = init_consumers()
        logger.info("✅ Tous les consumers RabbitMQ sont opérationnels")
    except Exception as e:
        logger.error(f"❌ Erreur initialisation consumers: {e}")