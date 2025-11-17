import pika
import json
import threading
from rest_framework_simplejwt.tokens import AccessToken

class RabbitMQConsumer(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.queue_name = "auth_verify_queue"

    def run(self):
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host='rabbitmq' if 'docker' in open('/proc/1/cgroup').read() else 'localhost',
                port=5672,
                credentials=pika.PlainCredentials('guest', 'guest')
            )
        )
        channel = connection.channel()

        # 🔥 Node publie sur inscription_events → donc on déclare l'exchange
        channel.exchange_declare(
            exchange="inscription_events",
            exchange_type="topic",
            durable=False
        )

        # 🔥 Declare queue
        channel.queue_declare(queue=self.queue_name, durable=True)

        # 🔥 Bind queue → exchange
        channel.queue_bind(
            exchange="inscription_events",
            queue=self.queue_name,
            routing_key="auth.verify"  # même routingKey que Node.js
        )

        print("📌 Queue liée à l'exchange inscription_events (routingKey=auth.verify)")

        # --- CALLBACK RPC ---
        def callback(ch, method, properties, body):
            data = json.loads(body)
            token = data.get('token')
            action = data.get('action', '')

            response = {'valid': False, 'error': 'Token invalide'}

            try:
                decoded = AccessToken(token)
                role = decoded.get("role", "")
                username = decoded.get("username", "")
                user_id = decoded.get("user_id", "")

                print("🎫 TOKEN DECODE:", decoded)

                allowed = {
                    'directeur': ['create_eleve', 'create_inscription', 'delete_eleve'],
                    'caissier': ['view_paiements'],
                    'secretaire': ['view_eleves']
                }

                if action not in allowed.get(role, []):
                    response = {
                        'valid': False,
                        'error': "f'Action '{action}' non autorisée pour '{role}'"
                    }
                else:
                    response = {
                        'valid': True,
                        'user_id': user_id,
                        'username': username,
                        'role': role
                    }

            except Exception as e:
                response = {"valid": False, "error": str(e)}

            # 🔥 Réponse RPC obligatoire !!!
            ch.basic_publish(
                exchange="",
                routing_key=properties.reply_to,
                properties=pika.BasicProperties(
                    correlation_id=properties.correlation_id
                ),
                body=json.dumps(response)
            )

            ch.basic_ack(delivery_tag=method.delivery_tag)

        print("Django Consumer RabbitMQ démarré...")
        channel.basic_consume(queue=self.queue_name, on_message_callback=callback)
        channel.start_consuming()
