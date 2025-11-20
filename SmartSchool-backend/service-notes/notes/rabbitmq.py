# notes/rabbitmq.py
import pika
import json
import uuid
import logging
from typing import Any
import time
logger = logging.getLogger(__name__)

class RabbitMQRPCClient:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.callback_queue = None
        self.responses = {}
        self._connect()

    def _connect(self):
        """Connexion + création de la callback queue"""
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host="localhost")
        )
        self.channel = self.connection.channel()

        # Queue exclusive pour recevoir les réponses RPC
        result = self.channel.queue_declare(queue="", exclusive=True)
        self.callback_queue = result.method.queue

        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self._on_response,
            auto_ack=True
        )

        logger.info(f"RabbitMQ connecté, callback queue: {self.callback_queue}")
        print(f"RabbitMQ connecté, callback queue: {self.callback_queue}")

    def _on_response(self, ch, method, props, body):
        """Callback appelée quand une réponse arrive"""
        if props.correlation_id in self.responses:
            self.responses[props.correlation_id] = json.loads(body.decode())

    def call(self, routing_key: str, payload: dict, timeout: int = 10) -> Any:
        """
        Envoie une requête RPC et attend la réponse
        """
        if self.channel is None or self.channel.is_closed:
            logger.warning("Connexion RabbitMQ fermée → reconnexion...")
            self._connect()

        corr_id = str(uuid.uuid4())
        self.responses[corr_id] = None

        try:
            self.channel.basic_publish(
                exchange="inscription_events",
                routing_key=routing_key,
                body=json.dumps(payload).encode(),
                properties=pika.BasicProperties(
                    reply_to=self.callback_queue,
                    correlation_id=corr_id,
                )
            )

            # Boucle d'attente ACTIVE (pas de start_consuming global !)
            start_time = time.time()
            while self.responses[corr_id] is None:
                if time.time() - start_time > timeout:
                    raise TimeoutError("Timeout : aucun retour des microservices.")
                
                # Cette ligne est MAGIQUE : elle pompe les événements SANS bloquer tout
                self.connection.process_data_events(time_limit=1)

            response = self.responses.pop(corr_id)
            return response

        except (pika.exceptions.AMQPConnectionError, 
                pika.exceptions.AMQPChannelError) as e:
            logger.error(f"Erreur RabbitMQ : {e} → tentative de reconnexion...")
            self._connect()
            raise TimeoutError("Connexion RabbitMQ perdue")

# Instance globale
rpc_client = RabbitMQRPCClient()


# ————————————————————————
# FONCTIONS UTILITAIRES
# ————————————————————————

def verify_inscription_exists(id_inscription: int):
    payload = {
        "data": { "id_inscription": id_inscription }
    }
    return rpc_client.call("inscription.verify", payload)


def verify_matiere_exists(id_matiere: int):
    payload = {
        "data": { "id_matiere": id_matiere }
    }
    return rpc_client.call("matiere.verify", payload)