import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "smartschool_db",
  process.env.DB_USER || "smartschool",
  process.env.DB_PASSWORD || "smartschool123",
  {
    host: process.env.DB_HOST || "postgres",   // nom du service Docker
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;
