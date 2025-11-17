import { DataTypes, Model } from "sequelize";
import sequelize from "../../../config/database";
import { School } from "../school/school.model";

export class Teacher extends Model {
  public id!: number;
  public school_id!: number;
  public user_id!: number; // externe
  public last_name!: string;
  public first_name!: string;
  public password!: string;
  public birth_date!: Date;
  public sex!: string;
}

Teacher.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER },
    last_name: { type: DataTypes.STRING, allowNull: false },
    first_name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    birth_date: { type: DataTypes.DATE },
    sex: { type: DataTypes.STRING },
  },
  { sequelize, modelName: "Teacher", tableName: "teachers", timestamps: false }
);

Teacher.belongsTo(School, { foreignKey: "school_id", as: "school" });
