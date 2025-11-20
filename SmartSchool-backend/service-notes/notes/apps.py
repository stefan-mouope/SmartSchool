from django.apps import AppConfig

class NotesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notes'

    def ready(self):
        # 🔗 Importer le client Eureka au démarrage
        try:
            import notes.eureka_client
        except Exception as e:
            print("❌ Impossible d'importer eureka_client:", e)