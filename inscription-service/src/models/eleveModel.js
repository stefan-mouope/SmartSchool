import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Student = sequelize.define("Student", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  matricule: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  adress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sex: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone_parent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "Student",
  timestamps: false,
});

export default Student;
