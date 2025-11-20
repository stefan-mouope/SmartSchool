import { Sequelize } from "sequelize";
import path from "path";

const storagePath =
  process.env.DATABASE_STORAGE || path.join(__dirname, "../../database.sqlite");

// Crée une instance Sequelize pour SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath, // le fichier local
  logging: false, // optionnel
});

export default sequelize;
