import threading
import time
import requests
import os
import atexit

# -------------------------
# Configuration du service
# -------------------------
APP_NAME = "authentification-service"  # Adapter selon le service
INSTANCE_PORT = 8001
EUREKA_HOST = os.getenv("EUREKA_HOST", "registry-service")
EUREKA_PORT = os.getenv("EUREKA_PORT", "8761")

# ✅ Flag pour suivre l'état d'enregistrement
is_registered = False

def get_pod_ip():
    """Retourne l'IP du pod depuis les variables d'environnement."""
    pod_ip = os.getenv("POD_IP") or os.getenv("HOSTNAME")
    
    if not pod_ip:
        print("❌ [Eureka] POD_IP non défini !")
        return "127.0.0.1"
    
    import re
    if not re.match(r'^\d+\.\d+\.\d+\.\d+$', pod_ip):
        print(f"❌ [Eureka] POD_IP invalide : {pod_ip}")
        return "127.0.0.1"
    
    print(f"📍 [Eureka] Pod IP détecté : {pod_ip}")
    return pod_ip

HOST_IP = get_pod_ip()
POD_NAME = os.getenv("POD_NAME", "unknown")
INSTANCE_ID = f"{HOST_IP}:{APP_NAME}:{INSTANCE_PORT}"
EUREKA_SERVER = f"http://{EUREKA_HOST}:{EUREKA_PORT}/eureka/apps"

# -------------------------
# Fonctions Eureka
# -------------------------
def register_instance():
    """Enregistre le service dans Eureka."""
    global is_registered
    
    instance = {
        "instance": {
            "instanceId": INSTANCE_ID,
            "hostName": HOST_IP,
            "app": APP_NAME.upper(),
            "ipAddr": HOST_IP,
            "vipAddress": APP_NAME,
            "secureVipAddress": APP_NAME,
            "status": "UP",
            "port": {"$": INSTANCE_PORT, "@enabled": "true"},
            "securePort": {"$": 443, "@enabled": "false"},
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            },
            "homePageUrl": f"http://{HOST_IP}:{INSTANCE_PORT}/",
            "statusPageUrl": f"http://{HOST_IP}:{INSTANCE_PORT}/health",
            "healthCheckUrl": f"http://{HOST_IP}:{INSTANCE_PORT}/health",
            "metadata": {
                "management.port": str(INSTANCE_PORT),
                "pod.name": POD_NAME
            }
        }
    }
    
    url = f"{EUREKA_SERVER}/{APP_NAME.upper()}"
    headers = {"Content-Type": "application/json"}
    
    try:
        print(f"🔄 [Eureka] Enregistrement en cours...")
        print(f"   - Instance ID: {INSTANCE_ID}")
        print(f"   - URL: {url}")
        
        response = requests.post(url, json=instance, headers=headers, timeout=5)
        
        if response.status_code in (200, 204):
            print(f"✅ [Eureka] Service enregistré avec succès !")
            is_registered = True  # ✅ Marquer comme enregistré
            return True
        else:
            print(f"⚠️ [Eureka] Échec enregistrement : {response.status_code} {response.text}")
            is_registered = False
            return False
    except Exception as e:
        print(f"❌ [Eureka] Erreur de connexion : {e}")
        is_registered = False
        return False

def renew_registration():
    """Envoie un heartbeat pour garder l'inscription active."""
    global is_registered
    
    # ✅ Ne pas envoyer de heartbeat si pas enregistré
    if not is_registered:
        print("⚠️ [Eureka] Pas encore enregistré, skip heartbeat")
        return
    
    url = f"{EUREKA_SERVER}/{APP_NAME.upper()}/{INSTANCE_ID}"
    
    try:
        response = requests.put(url, timeout=3)
        if response.status_code == 200:
            print("💓 [Eureka] Heartbeat envoyé")
        elif response.status_code == 404:
            # ✅ Si 404, se réenregistrer
            print("🔄 [Eureka] Instance non trouvée, réenregistrement...")
            is_registered = False
            register_instance()
        else:
            print(f"⚠️ [Eureka] Heartbeat échoué : {response.status_code}")
    except Exception as e:
        print(f"⚠️ [Eureka] Heartbeat échoué : {e}")

def unregister_instance():
    """Désinscrit le service à l'arrêt du serveur."""
    global is_registered
    
    if not is_registered:
        print("ℹ️ [Eureka] Service non enregistré, skip désinscription")
        return
    
    url = f"{EUREKA_SERVER}/{APP_NAME.upper()}/{INSTANCE_ID}"
    
    try:
        response = requests.delete(url, timeout=3)
        if response.status_code in (200, 204):
            print("🧹 [Eureka] Service désinscrit proprement.")
            is_registered = False
        else:
            print(f"⚠️ [Eureka] Erreur de désinscription : {response.status_code}")
    except Exception as e:
        print(f"⚠️ [Eureka] Erreur de désinscription : {e}")

# -------------------------
# Thread pour heartbeat
# -------------------------
def start_eureka_registration():
    """Démarre l'enregistrement Eureka et le heartbeat."""
    print(f"🚀 [Eureka] Démarrage du client Eureka")
    print(f"   - Service: {APP_NAME}")
    print(f"   - Pod IP: {HOST_IP}")
    print(f"   - Pod Name: {POD_NAME}")
    print(f"   - Port: {INSTANCE_PORT}")
    
    # ✅ IMPORTANT : Attendre la confirmation d'enregistrement
    success = register_instance()
    
    if not success:
        print("❌ [Eureka] Échec de l'enregistrement initial, retry dans 10s...")
        time.sleep(10)
        start_eureka_registration()
        return
    
    atexit.register(unregister_instance)
    
    def keep_alive():
        while True:
            time.sleep(30)
            renew_registration()
    
    thread = threading.Thread(target=keep_alive, daemon=True)
    thread.start()