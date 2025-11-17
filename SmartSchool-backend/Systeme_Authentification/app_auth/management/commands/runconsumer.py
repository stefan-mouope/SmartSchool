# management/commands/runconsumer.py
from django.core.management.base import BaseCommand
from app_auth.consumers.rabbitmq_consumer import RabbitMQConsumer

class Command(BaseCommand):
    help = 'Lance le consumer RabbitMQ'

    def handle(self, *args, **options):
        consumer = RabbitMQConsumer()
        consumer.start()
        self.stdout.write(self.style.SUCCESS('Consumer RabbitMQ démarré'))
        consumer.join()