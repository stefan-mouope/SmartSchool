import { DataTypes, Model, Op } from "sequelize";
import sequelize from "../../../config/database";
import { School } from "../school/school.model";

export class Teacher extends Model {
  public id!: string;
  public school_id!: number;
  public user_id!: number;
  public last_name!: string;
  public first_name!: string;
  public password!: string;
  public birth_date!: Date;
  public sex!: string;
}

Teacher.init(
  {
    id: {
      type: DataTypes.STRING(20), // taille ajustée
      primaryKey: true
    },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER },
    last_name: { type: DataTypes.STRING, allowNull: false },
    first_name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    birth_date: { type: DataTypes.DATE },
    sex: { type: DataTypes.STRING },
  },
  {
    sequelize,
    modelName: "Teacher",
    tableName: "teachers",
    timestamps: false,

    hooks: {
      beforeCreate: async (teacher: any) => {
        try {
          const today = new Date();
          const y = String(today.getFullYear()).slice(2); // "25"
          const m = String(today.getMonth() + 1).padStart(2, "0");
          const d = String(today.getDate()).padStart(2, "0");

          const datePrefix = `${y}${m}${d}`; // "250505"

          // Chercher le dernier ID commençant par YYMMDD
          const lastTeacher = await Teacher.findOne({
            where: { id: { [Op.like]: `${datePrefix}%` } },
            order: [["id", "DESC"]],
            raw: true
          });

          let nextNumber = 1;

          if (lastTeacher?.id) {
            const lastId = String(lastTeacher.id);
            const lastCounter = parseInt(lastId.slice(6)); // après YYMMDD

            if (!isNaN(lastCounter)) {
              nextNumber = lastCounter + 1;
            }
          }

          // Format compteur sur 2 chiffres
          const counter = String(nextNumber).padStart(2, "0");

          const newId = `${datePrefix}${counter}`; // ex : 25050501

          console.log(`🆔 ID Teacher généré: ${newId}`);
          teacher.id = newId;

        } catch (e) {
          console.error("❌ Erreur génération ID Teacher :", e);
          throw new Error("Impossible de générer un ID pour le professeur");
        }
      }
    }
  }
);

Teacher.belongsTo(School, { foreignKey: "school_id", as: "school" });
