import json
import threading
import logging
import pika
from datetime import datetime

from django.contrib.auth import get_user_model
from django.db import transaction

# JWT
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.settings import api_settings

# Serializers
from app_auth.serializers import RegisterSerializer

User = get_user_model()
jwt_auth = JWTAuthentication()
logger = logging.getLogger(__name__)

# -----------------------------
# 🔥 ACTIONS AUTORISÉES PAR RÔLE
# -----------------------------
ALLOWED_ACTIONS = {
    "superuser": ["create_ecole", "create_director", "create_academicYear"],
    "directeur": [
        "create_eleve", "delete_eleve", "create_inscription",
        "create_teacher", "create_classroom", "create_matter",
        "create_academicYear"
    ],
    # "enseignant": ["create_note", "update_note", "view_notes",'create_inscription'],
    "caissier": ["view_paiements"],
    "secretaire": ["view_eleves"]
}

# ----------------------------------
# 🔥 FONCTIONS DE REFRESH DES TOKENS
# ----------------------------------
def get_refreshed_tokens(refresh_token_str: str) -> dict:
    try:
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
        return {"success": False, "error": str(e)}


def verify_and_refresh_token(access_token: str, refresh_token: str = None) -> dict:
    try:
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
        if not refresh_token:
            return {"valid": False, "error": "Token expiré, refresh manquant"}

        refreshed = get_refreshed_tokens(refresh_token)
        if not refreshed["success"]:
            return {"valid": False, "error": "Refresh échoué"}

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


# ---------------------------------------
# 🔥 CONSUMER 1 → AUTH VERIFY + ROLES
# ---------------------------------------
class RabbitMQConsumer(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.queue_name = "auth_verify_queue"

    def run(self):
        host = "rabbitmq" if "docker" in open("/proc/1/cgroup").read() else "localhost"

        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=host,
                port=5672,
                credentials=pika.PlainCredentials("guest", "guest")
            )
        )
        channel = connection.channel()

        channel.exchange_declare(exchange="inscription_events", exchange_type="topic", durable=False)
        channel.queue_declare(queue=self.queue_name, durable=True)
        channel.queue_bind(exchange="inscription_events", queue=self.queue_name, routing_key="auth.verify")

        print("🔥 AuthConsumer RabbitMQ démarré... (auth.verify)")

        def callback(ch, method, properties, body):
            try:
                data = json.loads(body)
                access = data.get("token")
                refresh = data.get("refresh_token")
                action = data.get("action", "")

                result = verify_and_refresh_token(access, refresh)

                # ❌ Token invalide
                if not result["valid"]:
                    self.send_rpc_response(ch, properties, {"valid": False, "error": result["error"]})
                    return

                role = result.get("role")

                # ❌ Action non autorisée
                if action not in ALLOWED_ACTIONS.get(role, []):
                    self.send_rpc_response(ch, properties, {
                        "valid": False,
                        "error": f"Action '{action}' interdite pour rôle '{role}'"
                    })
                    return

                # ✅ Réponse OK
                response = {
                    "valid": True,
                    "user_id": result["user_id"],
                    "username": result["username"],
                    "role": role
                }

                if result.get("needs_refresh"):
                    response["refresh"] = {
                        "access_token": result["new_access_token"],
                        "refresh_token": result["new_refresh_token"],
                    }

                self.send_rpc_response(ch, properties, response)

            except Exception as e:
                logger.error(f"Erreur callback AuthConsumer : {e}")
                self.send_rpc_response(ch, properties, {"valid": False, "error": str(e)})

            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_consume(queue=self.queue_name, on_message_callback=callback)
        channel.start_consuming()

    @staticmethod
    def send_rpc_response(ch, properties, data):
        ch.basic_publish(
            exchange="",
            routing_key=properties.reply_to,
            properties=pika.BasicProperties(correlation_id=properties.correlation_id),
            body=json.dumps(data, ensure_ascii=False)
        )


# ---------------------------------------
# 🔥 CONSUMER 2 → CREATE_DIRECTOR (INSCRIPTION)
# ---------------------------------------
class RabbitMQRegistrationConsumer(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.queue_name = "registration_queue"

    def run(self):
        host = "rabbitmq" if "docker" in open("/proc/1/cgroup").read() else "localhost"

        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=host,
                port=5672,
                credentials=pika.PlainCredentials("guest", "guest")
            )
        )
        channel = connection.channel()

        channel.exchange_declare(exchange="registration_events", exchange_type="topic", durable=True)
        channel.queue_declare(queue=self.queue_name, durable=True)
        channel.queue_bind(exchange="registration_events", queue=self.queue_name, routing_key="create_director")

        print("🔥 RegistrationConsumer RabbitMQ démarré... (create_director)")

        def callback(ch, method, properties, body):
            payload = json.loads(body)
            print(payload)
            try:
                with transaction.atomic():
                    serializer = RegisterSerializer(data=payload)
                    serializer.is_valid(raise_exception=True)
                    user = serializer.save()

                    response = {
                        "success": True,
                        "message": f"Compte {user.role} créé",
                        "user": serializer.data
                    }

            except Exception as e:
                response = {"success": False, "error": str(e)}

            if properties.reply_to:
                channel.basic_publish(
                    exchange="",
                    routing_key=properties.reply_to,
                    properties=pika.BasicProperties(correlation_id=properties.correlation_id),
                    body=json.dumps(response)
                )

            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_consume(queue=self.queue_name, on_message_callback=callback)
        channel.start_consuming()
