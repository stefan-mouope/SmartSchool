import { DataTypes, Model } from "sequelize";
import sequelize from "../../../config/database";

export class ClassRoom extends Model {
  public id!: number;
  public name!: string;
  public level!: number;
  public school_id!: number;
}

ClassRoom.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    // level: { type: DataTypes.INTEGER, allowNull: false },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: "ClassRoom",
    tableName: "classrooms",
    timestamps: false,
  }
);
