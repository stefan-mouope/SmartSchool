import { Sequelize } from "sequelize";
import path from "path";

// Crée une instance Sequelize pour SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../database.sqlite"), // le fichier local
  logging: false, // optionnel
});

export default sequelize;
