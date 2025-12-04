import threading
import time
import requests
import socket
import atexit



# -------------------------
# Configuration du service
# -------------------------
APP_NAME = "NOTE-SERVICE"         # Nom du service pour Gateway
INSTANCE_PORT = 8002               # Port de ton service Django
HOST_NAME='registry-service'

def get_host_ip():
    """Retourne l'IP réelle de la machine accessible par Eureka/Gateway."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Connexion à Google DNS pour récupérer l'IP locale
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

HOST_IP = get_host_ip()
INSTANCE_ID = f"{HOST_IP}:{APP_NAME}:{INSTANCE_PORT}"  # ID unique Eureka

EUREKA_SERVER = f"http://{HOST_NAME}:8761/eureka/apps"

# -------------------------
# Fonctions Eureka
# -------------------------
def register_instance():
    """Enregistre le service dans Eureka avec URLs pour dashboard cliquable."""
    instance = {
        "instance": {
            "instanceId": INSTANCE_ID,
            "hostName": HOST_IP,
            "app": APP_NAME.upper(),
            "ipAddr": HOST_IP,
            "vipAddress": APP_NAME,
            "status": "UP",
            "port": {"$": INSTANCE_PORT, "@enabled": "true"},
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            },
            # URLs pour le dashboard Eureka
            "homePageUrl": f"http://{HOST_IP}:{INSTANCE_PORT}/",
            "statusPageUrl": f"http://{HOST_IP}:{INSTANCE_PORT}/actuator/health",
            "healthCheckUrl": f"http://{HOST_IP}:{INSTANCE_PORT}/actuator/health"
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
    """Envoie un heartbeat pour garder l'inscription active."""
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
    """Désinscrit le service à l'arrêt du serveur."""
    url = f"{EUREKA_SERVER}/{APP_NAME}/{INSTANCE_ID}"
    try:
        response = requests.delete(url)
        if response.status_code in (200, 204):
            print("🧹 [Eureka] Service désinscrit proprement.")
        else:
            print("⚠️ [Eureka] Erreur de désinscription :", response.status_code, response.text)
    except Exception as e:
        print("⚠️ [Eureka] Erreur de désinscription :", e)

# -------------------------
# Thread pour heartbeat
# -------------------------
def start_eureka_registration():
    register_instance()
    atexit.register(unregister_instance)

    def keep_alive():
        while True:
            renew_registration()
            time.sleep(30)  # toutes les 30 secondes

    thread = threading.Thread(target=keep_alive, daemon=True)
    thread.start()

# -------------------------
# Lancer l'enregistrement au démarrage
# -------------------------
if __name__ == "__main__":
    start_eureka_registration()
    # Ici tu peux démarrer ton serveur Django normalement
    # Exemple : python manage.py runserver 0.0.0.0:8000
