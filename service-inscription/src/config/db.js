import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crée une instance Sequelize pour SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../database.sqlite"), // le fichier local
  logging: false, // désactive les logs SQL
});

// Test de connexion (fonction async pour pouvoir utiliser await)
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à la base SQLite réussie via Sequelize");
  } catch (error) {
    console.error("❌ Impossible de se connecter à la base SQLite :", error);
  }
})();

export default sequelize;
