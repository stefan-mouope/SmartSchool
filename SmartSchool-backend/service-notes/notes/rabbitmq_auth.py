import json
import pika
import uuid
from functools import wraps
from django.http import JsonResponse

HOST = "localhost"  # ou l'adresse de ton container
QUEUE_NAME = "auth_verify_queue"

# Connexion RabbitMQ persistante
class RabbitRPCClient:
    def __init__(self):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=HOST, heartbeat=600)  # heartbeat long pour éviter timeout
        )
        self.channel = self.connection.channel()
        result = self.channel.queue_declare(queue='', exclusive=True)
        self.callback_queue = result.method.queue
        self.response = None
        self.corr_id = None
        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.on_response,
            auto_ack=True
        )

    def on_response(self, ch, method, props, body):
        if self.corr_id == props.correlation_id:
            self.response = json.loads(body)

    def call(self, payload: dict):
        self.response = None
        self.corr_id = str(uuid.uuid4())
        self.channel.basic_publish(
            exchange="inscription_events",
            routing_key="auth.verify",
            properties=pika.BasicProperties(
                reply_to=self.callback_queue,
                correlation_id=self.corr_id,
            ),
            body=json.dumps(payload)
        )
        while self.response is None:
            self.connection.process_data_events()
        return self.response

# Instance globale réutilisable
rpc_client = RabbitRPCClient()

def verify_rabbitmq_action(action):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            auth_header = request.META.get("HTTP_AUTHORIZATION", "")
            if not auth_header.startswith("Bearer "):
                return JsonResponse({"error": "Token manquant"}, status=401)
            access_token = auth_header.split(" ")[1]
            refresh_token = request.META.get("HTTP_X_REFRESH_TOKEN")

            payload = {
                "token": access_token,
                "refresh_token": refresh_token,
                "action": action,
            }

            result = rpc_client.call(payload)
            print("RPC RESULT =", result)
            if not result.get("valid"):
                return JsonResponse({"error": result.get("error")}, status=403)

            request.user_info = {
                "user_id": result["user_id"],
                "username": result["username"],
                "role": result["role"]
            }

            return func(request, *args, **kwargs)
        return wrapper
    return decorator
