// server.ts ou index.ts
import app from "./app";
import { config } from "./config/env";
import sequelize from "./config/database";
import { startEureka } from "./config/eureka";

// CHARGER LES MODÈLES AVANT TOUT
import "./modules/registration/models"; 
import { setupAssociations } from "./modules/registration/association";

// RABBITMQ
// import { connectRabbitMQ } from "./modules/registration/events/rabbitmq";
import { connectRabbitMQ } from "./modules/registration/evnts/rabbitmq"
import { startInscriptionRequestConsumer } from "./modules/registration/evnts/consumers/inscriprionConsumer";
import { startVerifyMatiereConsumer } from "./modules/registration/evnts/consumers/verifyMatiereConsumer";

const PORT = config.port;

(async () => {
  try {
    // 1) INITIALISER LES ASSOCIATIONS SEQUELIZE
    setupAssociations();
    console.log("Associations Sequelize chargées");

    // 2) CONNEXION À RABBITMQ
    await connectRabbitMQ();
    console.log("RabbitMQ connecté");

    // 3) DÉMARRER LES CONSUMERS
    startInscriptionRequestConsumer();
    console.log("Consumer 'inscription.request' démarré");

    startVerifyMatiereConsumer();
    console.log("Consumer 'verify.matiere' démarré");

    // 4) SYNCHRONISATION DB
    await sequelize.sync({ force: false });
    console.log("Base de données synchronisée");

    // 5) DÉMARRAGE DU SERVEUR HTTP
    app.listen(PORT, () => {
      startEureka();
      console.log(`➡ Serveur démarré sur le port ${PORT}`);
      console.log(`➡ Environnement : ${config.nodeEnv}`);
      console.log(`➡ API : http://localhost:${PORT}`);
      console.log(`➡ Swagger/Documentation : http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur :", error);
    process.exit(1);
  }
})();


// -------------------------------
// ARRÊT GRACIEUX
// -------------------------------
process.on("SIGTERM", async () => {
  console.log("SIGTERM reçu → fermeture du serveur...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT reçu → fermeture du serveur...");
  await sequelize.close();
  process.exit(0);
});
