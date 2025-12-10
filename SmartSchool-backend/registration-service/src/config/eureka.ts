import axios from "axios";

const APP_NAME = "registration-service";
const PORT = parseInt(process.env.PORT || "3000", 10);
const EUREKA_HOST = process.env.EUREKA_HOST || "registry-service";
const EUREKA_PORT = parseInt(process.env.EUREKA_PORT || "8761", 10);

// ✅ CORRECTION : Récupérer l'IP du pod, PAS le nom du pod
function getPodIp(): string {
  const podIp = process.env.POD_IP || process.env.HOSTNAME;
  
  if (!podIp) {
    console.error("❌ [Eureka] POD_IP non défini !");
    return "127.0.0.1";
  }
  
  // Vérifier que c'est bien une IP valide
  if (!podIp.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    console.error(`❌ [Eureka] POD_IP invalide : ${podIp}`);
    return "127.0.0.1";
  }
  
  console.log(`📍 [Eureka] Pod IP détecté : ${podIp}`);
  return podIp;
}

const POD_IP = getPodIp();
const POD_NAME = process.env.POD_NAME || "unknown";
const INSTANCE_ID = `${POD_IP}:${APP_NAME}:${PORT}`;
const EUREKA_URL = `http://${EUREKA_HOST}:${EUREKA_PORT}/eureka/apps/${APP_NAME.toUpperCase()}`;

async function registerInstance() {
  const instance = {
    instance: {
      instanceId: INSTANCE_ID,
      hostName: POD_IP,              // ✅ IP du pod
      app: APP_NAME.toUpperCase(),
      ipAddr: POD_IP,                // ✅ IP du pod
      vipAddress: APP_NAME,
      secureVipAddress: APP_NAME,
      status: "UP",
      port: { $: PORT, "@enabled": "true" },
      securePort: { $: 443, "@enabled": "false" },
      dataCenterInfo: {
        "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
        name: "MyOwn",
      },
      homePageUrl: `http://${POD_IP}:${PORT}/`,
      statusPageUrl: `http://${POD_IP}:${PORT}/health`,
      healthCheckUrl: `http://${POD_IP}:${PORT}/health`,
      metadata: {
        "management.port": PORT.toString(),
        "pod.name": POD_NAME,
      },
    },
  };

  try {
    console.log(`🔄 [Eureka] Enregistrement en cours...`);
    console.log(`   - Instance ID: ${INSTANCE_ID}`);
    console.log(`   - URL: ${EUREKA_URL}`);
    
    await axios.post(EUREKA_URL, instance, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
    
    console.log(`✅ [Eureka] Enregistré avec succès !`);
  } catch (err: any) {
    console.error(`❌ [Eureka] Erreur d'enregistrement :`, err.message);
    if (err.response) {
      console.error(`   Status: ${err.response.status}`);
      console.error(`   Data:`, JSON.stringify(err.response.data, null, 2));
    }
  }
}

async function renewRegistration() {
  try {
    await axios.put(`${EUREKA_URL}/${INSTANCE_ID}`, {}, { timeout: 3000 });
    console.log(`💓 [Eureka] Heartbeat envoyé`);
  } catch (err: any) {
    console.error(`⚠️ [Eureka] Heartbeat échoué :`, err.message);
  }
}

async function unregisterInstance() {
  try {
    await axios.delete(`${EUREKA_URL}/${INSTANCE_ID}`, { timeout: 3000 });
    console.log(`🧹 [Eureka] Service désinscrit`);
  } catch (err: any) {
    console.warn(`⚠️ [Eureka] Erreur désinscription :`, err.message);
  }
}

export function startEureka() {
  console.log(`🚀 [Eureka] Démarrage du client Eureka`);
  console.log(`   - Service: ${APP_NAME}`);
  console.log(`   - Pod IP: ${POD_IP}`);
  console.log(`   - Pod Name: ${POD_NAME}`);
  console.log(`   - Port: ${PORT}`);
  
  // Enregistrement initial
  registerInstance();
  
  // Heartbeat toutes les 30s
  const heartbeatInterval = setInterval(() => {
    renewRegistration();
  }, 30_000);
  
  // Cleanup sur arrêt
  const cleanup = async () => {
    clearInterval(heartbeatInterval);
    await unregisterInstance();
  };
  
  process.on("SIGINT", () => {
    console.log("\n🛑 [Eureka] SIGINT reçu");
    cleanup().finally(() => process.exit(0));
  });
  
  process.on("SIGTERM", () => {
    console.log("\n🛑 [Eureka] SIGTERM reçu");
    cleanup().finally(() => process.exit(0));
  });
}