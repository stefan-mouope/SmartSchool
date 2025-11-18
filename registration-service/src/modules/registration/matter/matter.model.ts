import { DataTypes, Model } from "sequelize";
import sequelize from "../../../config/database";

export class Matter extends Model {
  public id!: number;
  public name!: string;
  public school_id!: number;
}

Matter.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: "Matter",
    tableName: "matters",
    timestamps: false,
  }
);
