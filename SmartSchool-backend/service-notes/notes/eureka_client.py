import requests
import os
import atexit

EUREKA_SERVER = os.environ.get("EUREKA_SERVER", "http://localhost:8761/eureka")
SERVICE_NAME = "SERVICE_NOTE"
HOST = os.environ.get("HOST", "localhost")
PORT = os.environ.get("PORT", 8000)
INSTANCE_ID = f"{SERVICE_NAME}-{HOST}-{PORT}"

def register():
    url = f"{EUREKA_SERVER}/apps/{SERVICE_NAME}"
    payload = {
        "instance": {
            "instanceId": INSTANCE_ID,
            "hostName": HOST,
            "app": SERVICE_NAME,
            "ipAddr": HOST,
            "status": "UP",
            "port": {"$": PORT, "@enabled": "true"},
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            }
        }
    }

    headers = {"Content-Type": "application/json"}
    try:
        r = requests.post(url, json=payload, headers=headers)
        r.raise_for_status()
        print(f"✅ Service {SERVICE_NAME} enregistré sur Eureka")
    except Exception as e:
        print("❌ Erreur d'enregistrement Eureka :", e)

def deregister():
    try:
        r = requests.delete(f"{EUREKA_SERVER}/apps/{SERVICE_NAME}/{INSTANCE_ID}")
        r.raise_for_status()
        print(f"🧼 Service {SERVICE_NAME} désenregistré de Eureka")
    except Exception as e:
        print("❌ Erreur lors du désenregistrement :", e)

# Enregistre le service au démarrage
register()

# Désenregistre au shutdown
atexit.register(deregister)
