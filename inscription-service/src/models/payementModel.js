import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Payer = sequelize.define("Payer", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tranche_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  inscription_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date_payement: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
}, {
  tableName: "Payer",
  timestamps: false,
});

export default Payer;
