from django.apps import AppConfig
from .eureka_client import start_eureka_registration

class AuthAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notes'

    def ready(self):
        print(" [Auth-Service] Démarrage du service...")
        start_eureka_registration()
