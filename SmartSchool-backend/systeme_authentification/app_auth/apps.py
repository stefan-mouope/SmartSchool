# app_auth/apps.py
import logging
import os
import sys
from django.apps import AppConfig
from app_auth.consumers.rabbitmq_consumer import RabbitMQConsumer, RabbitMQRegistrationConsumer
# from .utils.eureka_registration import start_eureka_registration
import threading

from django.conf import settings


logger = logging.getLogger(__name__)


class AppAuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app_auth'
    verbose_name = 'Authentification et Autorisation'
    
    # Flag pour éviter le double démarrage
    _consumers_started = False
    
    def ready(self):
        """
        Appelé au démarrage de Django
        Démarre automatiquement les consumers RabbitMQ
        """
        
        # Protection contre le double appel de ready()
        if AppAuthConfig._consumers_started:
            logger.debug("⏭️ Consumers déjà démarrés, skip...")
            return
        
        # En mode runserver, attendre le processus principal (pas le reloader)
        if 'runserver' in sys.argv:
            if os.environ.get('RUN_MAIN') != 'true':
                logger.debug("⏭️ Processus reloader détecté, skip...")
                return
        
      
        
        print("=" * 70)
        print("🚀 INITIALISATION DES SERVICES")
        print("=" * 70)
        
        # ========================================
        # 1. DÉMARRAGE EUREKA
        # ========================================
        try:
            from .utils.eureka_registration import start_eureka_registration
            print("🔍 Démarrage de l'enregistrement Eureka...")
            start_eureka_registration()
            print("✅ Eureka enregistré avec succès")
        except Exception as e:
            print(f"⚠️  Erreur Eureka (non bloquant): {e}")
            logger.warning(f"Erreur Eureka: {e}", exc_info=True)
        
        # ========================================
        # 2. DÉMARRAGE RABBITMQ CONSUMERS
        # ========================================
        # if not getattr(settings, 'ENABLE_RABBITMQ_CONSUMERS', True):
        #     print("⏸️  Consumers RabbitMQ désactivés (ENABLE_RABBITMQ_CONSUMERS=False)")
        #     print("=" * 70)
        #     return
        
        try:
            print("🐰 Démarrage des consumers RabbitMQ...")
            
            # ✅ Import ici uniquement, après que Django soit complètement chargé
            from app_auth.consumers.rabbitmq_consumer import init_consumers
            
            consumer_manager = init_consumers()
            
            # Marquer comme démarré
            AppAuthConfig._consumers_started = True
            self.consumer_manager = consumer_manager
            
            print("✅ Consumers RabbitMQ démarrés avec succès")
            print("   - AuthVerifyConsumer: auth_verify_queue")
            print("   - RegistrationConsumer: registration_queue")
            
        except ImportError as e:
            print(f"❌ Erreur d'import des consumers: {e}")
            logger.error(f"Erreur d'import: {e}", exc_info=True)
        except Exception as e:
            print(f"❌ Erreur lors du démarrage des consumers: {e}")
            logger.error(f"Erreur démarrage consumers: {e}", exc_info=True)
            print("⚠️  Django démarre sans les consumers RabbitMQ")
        
        print("=" * 70)
        print("")
