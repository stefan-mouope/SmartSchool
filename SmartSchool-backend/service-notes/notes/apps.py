from django.apps import AppConfig
from .eureka_client import start_eureka_registration

class AuthAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notes'

    def ready(self):
        # 🔗 Importer le client Eureka au démarrage
        try:
            from notes.eureka_client import start_eureka_registration
            print(" [Note-Service] Démarrage du service...")
            start_eureka_registration()
        except Exception as e:
            print("❌ Impossible d'importer eureka_client:", e)
