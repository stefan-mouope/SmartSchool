import dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement depuis .env
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    storage: process.env.DATABASE_STORAGE || path.join(__dirname, "../../database.sqlite"),
  },
};


