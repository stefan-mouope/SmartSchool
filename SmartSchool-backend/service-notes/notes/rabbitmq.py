import pika
import json
import uuid
import threading
import time

class RabbitMQRPCClient:
    def __init__(self):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host="localhost")
        )
        self.channel = self.connection.channel()

        # queue RPC de réponse
        result = self.channel.queue_declare(queue="", exclusive=True)
        self.callback_queue = result.method.queue

        self.responses = {}
        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.on_response,
            auto_ack=True
        )

        # Thread pour écouter RabbitMQ
        threading.Thread(target=self.start_consuming, daemon=True).start()

        # 🔔 Log de confirmation
        print(f"✅ RabbitMQ connecté, callback queue: {self.callback_queue}")


    def start_consuming(self):
        """Écoute en continu la queue de réponse"""
        self.channel.start_consuming()

    def on_response(self, ch, method, props, body):
        """Stocke la réponse reçue"""
        correlation_id = props.correlation_id
        self.responses[correlation_id] = json.loads(body.decode())

    def call(self, routing_key, payload, timeout=5):
        """Équivalent à publishEvent en Node.js"""
        correlation_id = str(uuid.uuid4())
        self.responses[correlation_id] = None

        self.channel.basic_publish(
            exchange="inscription_events",
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(
                reply_to=self.callback_queue,
                correlation_id=correlation_id,
            )
        )

        # Attendre la réponse RPC
        start = time.time()
        while self.responses[correlation_id] is None:
            if time.time() - start > timeout:
                raise TimeoutError("Timeout : aucun retour des microservices.")
            time.sleep(0.1)

        return self.responses.pop(correlation_id)

rpc_client = RabbitMQRPCClient()

# ------------------------------------------------------
#        FONCTIONS RPC UTILISANT LE CLIENT
# ------------------------------------------------------

def verify_inscription_exists(id_inscription):
    payload = {
        "event": "verify_inscription",
        "data": { "id_inscription": id_inscription }
    }
    return rpc_client.call("inscription.verify", payload)


def verify_matiere_exists(id_matiere):
    payload = {
        "event": "verify_matiere",
        "data": { "id_matiere": id_matiere }
    }
    return rpc_client.call("matiere.verify", payload)
