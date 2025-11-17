import threading
import time
import requests
import socket
import atexit

# Configuration
EUREKA_SERVER = "http://localhost:8761/eureka/apps"
APP_NAME = "AUTH-SERVICE"
INSTANCE_PORT = 8000  # le port de ton service Django
HOSTNAME = socket.gethostname()
INSTANCE_ID = f"{HOSTNAME}:{APP_NAME}:{INSTANCE_PORT}"  # ID unique pour Eureka

def get_host_ip():
    return "127.0.0.1"  # ou ton IP réelle du PC


def register_instance():
    """Enregistre le service dans Eureka."""
    instance = {
        "instance": {
            "instanceId": INSTANCE_ID,
            "hostName": HOSTNAME,
            "app": APP_NAME,
            "ipAddr": get_host_ip(),
            "vipAddress": APP_NAME,
            "status": "UP",
            "port": {"$": INSTANCE_PORT, "@enabled": "true"},
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            }
        }
    }

    url = f"{EUREKA_SERVER}/{APP_NAME}"
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, json=instance, headers=headers)
        if response.status_code in (200, 204):
            print(f"✅ [Eureka] Service enregistré : {APP_NAME}")
        else:
            print(f"⚠️ [Eureka] Échec enregistrement : {response.status_code} {response.text}")
    except Exception as e:
        print("❌ [Eureka] Erreur de connexion :", e)

def renew_registration():
    """Envoie un battement de cœur (heartbeat) pour garder l’inscription active."""
    url = f"{EUREKA_SERVER}/{APP_NAME}/{INSTANCE_ID}"
    try:
        response = requests.put(url)
        if response.status_code == 200:
            print("💓 [Eureka] Heartbeat envoyé")
        else:
            print("⚠️ [Eureka] Heartbeat échoué :", response.status_code, response.text)
    except Exception as e:
        print("⚠️ [Eureka] Heartbeat échoué :", e)

def unregister_instance():
    """Supprime l’inscription du service à l’arrêt du serveur."""
    url = f"{EUREKA_SERVER}/{APP_NAME}/{INSTANCE_ID}"
    try:
        response = requests.delete(url)
        if response.status_code in (200, 204):
            print("🧹 [Eureka] Service désinscrit proprement.")
        else:
            print("⚠️ [Eureka] Erreur de désinscription :", response.status_code, response.text)
    except Exception as e:
        print("⚠️ [Eureka] Erreur de désinscription :", e)

def start_eureka_registration():
    """Lance le processus d’enregistrement et de renouvellement périodique."""
    register_instance()
    atexit.register(unregister_instance)

    def keep_alive():
        while True:
            renew_registration()
            time.sleep(30)  # heartbeat toutes les 30 secondes

    thread = threading.Thread(target=keep_alive, daemon=True)
    thread.start()
