import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Tranche = sequelize.define("Tranche", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tranche_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "Tranche",
  timestamps: false,
});

export default Tranche;
