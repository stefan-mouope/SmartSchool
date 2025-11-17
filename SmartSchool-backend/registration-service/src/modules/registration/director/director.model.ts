import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../../config/database";
import { School } from "../school/school.model";

// Interface pour définir les attributs de Director
interface DirectorAttributes {
  id: number;
  school_id: number;
  user_id?: number; // externe (UserService)
  last_name: string;
  first_name: string;
  password: string;
  birth_date: Date;
  sex: string;
}

// Interface pour la création (id auto-increment)
interface DirectorCreationAttributes extends Optional<DirectorAttributes, "id"> {}

export class Director extends Model<DirectorAttributes, DirectorCreationAttributes>
  implements DirectorAttributes {
  public id!: number;
  public school_id!: number;
  public user_id?: number;
  public last_name!: string;
  public first_name!: string;
  public password!: string;
  public birth_date!: Date;
  public sex!: string;

  // Associations
  public readonly school?: School;
}

// Initialisation du modèle
Director.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER }, // référence externe
    last_name: { type: DataTypes.STRING, allowNull: false },
    first_name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    birth_date: { type: DataTypes.DATE, allowNull: false },
    sex: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "Director",
    tableName: "directors",
    timestamps: false,
  }
);

// Association
Director.belongsTo(School, { foreignKey: "school_id", as: "school" });
