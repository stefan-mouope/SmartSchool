import { DataTypes, Model } from "sequelize";
import sequelize from "../../../config/database"; 

export class School extends Model {
  public id!: number;
  public name!: string;
  public school_name!: string;   // Nom affiché ou nom officiel
  public email!: string;
  public phone_school!: string;
  public region!: string;
  public city!: string;
  public location!: string;
  public founded_year!: number;
  public logo!: string;          // Logo de l'école
  public devise!: string;        // Devise monétaire
}

School.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    name: { type: DataTypes.STRING, allowNull: false },

    school_name: { type: DataTypes.STRING, allowNull: true },  // optionnel

    email: { type: DataTypes.STRING, allowNull: false },

    phone_school: { type: DataTypes.STRING, allowNull: false },

    region: { type: DataTypes.STRING },

    city: { type: DataTypes.STRING },

    location: { type: DataTypes.STRING },

    founded_year: { type: DataTypes.INTEGER },

    logo: { type: DataTypes.STRING, allowNull: true },   // URL ou path du fichier

    devise: { type: DataTypes.STRING, allowNull: true }, // ex: "XAF" ou "FCFA"
  },
  {
    sequelize, 
    modelName: "School",
    tableName: "schools",
    timestamps: false,
  }
);
