import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import sequelize from "./config/db.js";
import {
  Student,
  Inscription,
  Tranche,
  Payer,
  ClassRoomTranche,  // ⬅️ IMPORT IMPORTANT
} from "./models/associations.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startVerifyInscriptionConsumer } from "./consumers/verifyInscriptionConsumer.js";
import { startGetInscriptionByClassRoomIdConsumer } from "./consumers/getInscriptionByClassRoomIdConsumer.js";
import { startEureka } from "./eureka/eurekaClient.js";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // -------------------------
    // Synchronisation des modèles
    // -------------------------
    await sequelize.sync(); 
    console.log("🗄️  Modèles synchronisés avec la base de données.");

    // -------------------------
    // Connexion à RabbitMQ
    // -------------------------
    console.log("⏳ Connexion à RabbitMQ...");
    await connectRabbitMQ();
    console.log("🐇 RabbitMQ connecté.");

    // -------------------------
    // Démarrage des consumers
    // -------------------------
    console.log("⏳ Démarrage du consumer verifyInscription...");
    await startVerifyInscriptionConsumer();
    console.log("👂 Consumer verifyInscription démarré.");
    
    console.log("⏳ Démarrage du consumer inscription en fonction des classes...");
    await startGetInscriptionByClassRoomIdConsumer();
    console.log("👂 Consumer get inscription by classroom démarré.");

    // -------------------------
    // Démarrage du serveur HTTP
    // -------------------------
    app.listen(PORT, () => {
      console.log(`🚀 Service Inscription démarré sur le port ${PORT}`);  // ✅ CORRIGÉ
      
      // ✅ Démarrage d'Eureka APRÈS que le serveur écoute
      startEureka();
    });

    // -------------------------
    // Arrêt propre
    // -------------------------
    process.on("SIGINT", () => {
      console.log("\n🛑 Arrêt du service...");
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n🛑 Arrêt du service...");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Erreur au démarrage du service :", error);
    process.exit(1);
  }
})();