import json
import pika
import uuid
from functools import wraps
from django.http import JsonResponse

HOST = "localhost"  # "localhost" si pas docker
QUEUE_NAME = "auth_verify_queue"

def rpc_call_rabbitmq(payload: dict) -> dict:
    """Appel RPC vers le consumer Django pour vérifier le token et l'action"""
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=HOST))
    channel = connection.channel()

    result = channel.queue_declare(queue='', exclusive=True)
    callback_queue = result.method.queue
    corr_id = str(uuid.uuid4())
    response = None

    def on_response(ch, method, props, body):
        nonlocal response
        if props.correlation_id == corr_id:
            response = json.loads(body)

    channel.basic_consume(queue=callback_queue, on_message_callback=on_response, auto_ack=True)
    channel.basic_publish(
        exchange="inscription_events",
        routing_key="auth.verify",
        properties=pika.BasicProperties(
            reply_to=callback_queue,
            correlation_id=corr_id,
        ),
        body=json.dumps(payload)
    )

    while response is None:
        connection.process_data_events()
    
    connection.close()
    return response

def verify_rabbitmq_action(action):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):

            # 🔥 Django stocke "Authorization" dans HTTP_AUTHORIZATION
            auth_header = request.META.get("HTTP_AUTHORIZATION", "")

            print("HEADERS =", request.META)  # tu vas voir que c'est ici que ça se trouve

            if not auth_header.startswith("Bearer "):
                return JsonResponse({"error": "Token manquant"}, status=401)

            access_token = auth_header.split(" ")[1]

            refresh_token = request.META.get("HTTP_X_REFRESH_TOKEN")

            payload = {
                "token": access_token,
                "refresh_token": refresh_token,
                "action": action,
            }

            result = rpc_call_rabbitmq(payload)

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