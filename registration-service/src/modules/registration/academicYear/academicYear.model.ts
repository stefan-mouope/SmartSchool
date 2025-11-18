import { DataTypes, Model } from "sequelize";
import sequelize from "../../../config/database";

export class AcademicYear extends Model {
  public id!: number;
  public start_date!: Date;
  public end_date!: Date;
}

AcademicYear.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    start_date: { type: DataTypes.DATE, allowNull: false },
    end_date: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: "AcademicYear", tableName: "academic_years", timestamps: false }
);
