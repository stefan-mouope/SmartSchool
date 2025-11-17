import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Inscription = sequelize.define("Incription", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  academieYear_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  classRoom_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "Incription",
  timestamps: false,
});

export default Inscription;
