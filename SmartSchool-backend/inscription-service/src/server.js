import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import sequelize from "./config/db.js";
import { Student, Inscription, Tranche, Payer } from "./models/associations.js";
import eurekaClient from "./eureka/eurekaClient.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startVerifyInscriptionConsumer } from "./consumers/verifyInscriptionConsumer.js";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // -------------------------
    // Synchronisation des modèles
    // -------------------------
    await Student.sync({ alter: true });
    await Tranche.sync({ alter: true });
    await Inscription.sync({ alter: true });
    await Payer.sync({ alter: true });
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

    // -------------------------
    // Démarrage du serveur HTTP
    // -------------------------
    app.listen(PORT, () => {
      console.log(`🚀 Service Inscription démarré sur le port ${PORT}`);

      // -------------------------
      // Enregistrement Eureka
      // -------------------------
      eurekaClient.start(error => {
        if (error) console.error("❌ Erreur Eureka :", error);
        else console.log("✅ Service enregistré sur Eureka !");
      });
    });

    // -------------------------
    // Arrêt propre
    // -------------------------
    process.on("SIGINT", () => {
      console.log("\n🛑 Arrêt du service...");
      eurekaClient.stop(() => {
        console.log("🧼 Service désenregistré d’Eureka");
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("❌ Erreur au démarrage du service :", error);
  }
})();
