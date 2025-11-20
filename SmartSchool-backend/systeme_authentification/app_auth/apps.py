from django.apps import AppConfig
from .utils.eureka_registration import start_eureka_registration

class AuthAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app_auth'

    def ready(self):
        print(" [Auth-Service] Démarrage du service...")
        start_eureka_registration()
