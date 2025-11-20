import { Eureka } from "eureka-js-client";
import os from "os";

// Nom du service (comme dans ton Spring Eureka)
const SERVICE_NAME = "registration-service";

const client = new Eureka({
  instance: {
    app: SERVICE_NAME,
    instanceId: `${SERVICE_NAME}-${os.hostname()}:${process.env.PORT || 3000}`,
    hostName: os.hostname(),
    ipAddr: "127.0.0.1",
    statusPageUrl: `http://localhost:${process.env.PORT || 3000}/actuator/info`,
    port: {
      $: parseInt(process.env.PORT || "3000", 10),
      "@enabled": true,
    },
    vipAddress: SERVICE_NAME,
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },
  eureka: {
    host: "localhost", // Adresse du serveur Eureka
    port: 8761,        // Port de ton serveur Eureka
    servicePath: "/eureka/apps/",
  },
});

// Démarre la connexion à Eureka
export const startEureka = () => {
  client.start((error: any) => {
    if (error) {
      console.error("❌ Erreur d'enregistrement sur Eureka :", error);
    } else {
      console.log("✅ Enregistré sur Eureka !");
    }
  });
};

export default client;
