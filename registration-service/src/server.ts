// server.ts ou index.ts
import app from "./app";
import { config } from "./config/env";
import sequelize from "./config/database";
import { startEureka } from "./config/eureka";

// 1. CHARGER LES MODÈLES ET LES ASSOCIATIONS D'ABORD
import "./modules/registration/models"; // ← Définit les modèles
import { setupAssociations } from "./modules/registration/association";

// 2. CONNEXION RABBITMQ + CONSUMER
import { connectRabbitMQ } from "./modules/registration/evnts/rabbitmq";
import { startInscriptionRequestConsumer } from "./modules/registration/evnts/consumers/inscriprionConsumer";

const PORT = config.port;

(async () => {
  try {
    // ÉTAPE 1 : INITIALISER LES ASSOCIATIONS
    setupAssociations();
    console.log("Associations Sequelize chargées");

    // ÉTAPE 2 : CONNEXION À RABBITMQ
    await connectRabbitMQ();
    console.log("RabbitMQ connecté");

    // ÉTAPE 3 : DÉMARRER LES CONSUMERS
    await startInscriptionRequestConsumer();
    console.log("Consommateur 'inscription.request' démarré");

    // ÉTAPE 4 : SYNCHRONISER LA BASE DE DONNÉES
    await sequelize.sync({ force: false });
    console.log("Base de données synchronisée");

    // ÉTAPE 5 : DÉMARRER LE SERVEUR
    app.listen(PORT, () => {
      startEureka();
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Environnement: ${config.nodeEnv}`);
      console.log(`API disponible sur: http://localhost:${PORT}`);
      console.log(`Documentation: http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.error("Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
})();

// Gestion de l'arrêt gracieux
process.on("SIGTERM", async () => {
  console.log("SIGTERM reçu, fermeture du serveur...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT reçu, fermeture du serveur...");
  await sequelize.close();
  process.exit(0);
});