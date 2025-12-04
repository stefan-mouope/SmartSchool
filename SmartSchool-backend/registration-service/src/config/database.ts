import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "smartschool_db2",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "root",
  {
    host: process.env.DB_HOST || "postgres",   // nom du service Docker
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;
