from django.apps import AppConfig
from .utils.eureka_registration import start_eureka_registration
from .consumers.rabbitmq_consumer import RabbitMQConsumer, RabbitMQRegistrationConsumer
import threading


class AuthAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app_auth'

    def ready(self):
        print(" [Auth-Service] Démarrage du service...")
        # Enregistrement auprès d'Eureka
        start_eureka_registration()

        # Lancer les consumers dans des threads séparés pour ne pas bloquer Django
        def start_consumers():
            print("Connexion à RabbitMQ (AuthConsumer)...")
            auth_consumer = RabbitMQConsumer()
            auth_consumer.start()

            print("Connexion à RabbitMQ (RegistrationConsumer)...")
            registration_consumer = RabbitMQRegistrationConsumer()
            registration_consumer.start()

            # Optionnel : attendre les threads
            auth_consumer.join()
            registration_consumer.join()

        # Lancer dans un thread daemon pour éviter de bloquer le ready()
        threading.Thread(target=start_consumers, daemon=True).start()
