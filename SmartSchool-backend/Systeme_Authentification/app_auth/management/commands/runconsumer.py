from django.core.management.base import BaseCommand
from app_auth.consumers.rabbitmq_consumer import RabbitMQConsumer, RabbitMQRegistrationConsumer

class Command(BaseCommand):
    help = 'Lance les consumers RabbitMQ'

    def handle(self, *args, **options):
        auth_consumer = RabbitMQConsumer()
        registration_consumer = RabbitMQRegistrationConsumer()

        # Lancer en parallèle
        auth_consumer.start()
        registration_consumer.start()

        self.stdout.write(self.style.SUCCESS('🔥 Consumers RabbitMQ démarrés (auth + registration)'))

        # Attendre les threads (facultatif mais recommandé)
        auth_consumer.join()
        registration_consumer.join()