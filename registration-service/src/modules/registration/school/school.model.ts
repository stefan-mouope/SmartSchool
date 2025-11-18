import { DataTypes, Model } from "sequelize";
import sequelize from "../../../config/database"; 

export class School extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone_school!: string;
  public region!: string;
  public city!: string;
  public location!: string;
  public founded_year!: number;
}

School.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone_school: { type: DataTypes.STRING, allowNull: false },
    region: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    founded_year: { type: DataTypes.INTEGER },
  },
  {
    sequelize, 
    modelName: "School",
    tableName: "schools",
    timestamps: false,
  }
);

