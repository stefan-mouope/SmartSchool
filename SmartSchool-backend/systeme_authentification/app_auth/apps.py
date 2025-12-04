from django.apps import AppConfig
from .utils.eureka_registration import start_eureka_registration
import threading

class AuthAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app_auth'

    def ready(self):
        print(" [Auth-Service] Démarrage du service...")
        start_eureka_registration()

        # Imports retardés pour éviter AppRegistryNotReady
        from app_auth.consumers.rabbitmq_consumer import RabbitMQConsumer, RabbitMQRegistrationConsumer

        # Lancer les consumers en threads daemon
        threading.Thread(target=RabbitMQConsumer().start, daemon=True).start()
        threading.Thread(target=RabbitMQRegistrationConsumer().start, daemon=True).start()

        print('🔥 Consumers RabbitMQ démarrés (auth + registration)')
