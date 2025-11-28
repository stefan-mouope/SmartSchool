import { DataTypes, Model, Op } from "sequelize";
import sequelize from "../../../config/database";
import { School } from "../school/school.model";

export class Teacher extends Model {
  public id!: string;   // ID deviens string !
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
      type: DataTypes.STRING,
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
      // 🧠 Générer un ID automatiquement avant l'insertion
      beforeCreate: async (teacher: any) => {
        try {
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, "0");
          const d = String(today.getDate()).padStart(2, "0");

          const datePrefix = `${y}${m}${d}`; // "20250228"

          // Trouver le dernier ID du jour
          const lastTeacher = await Teacher.findOne({
            where: {
              id: { [Op.like]: `${datePrefix}%` }
            },
            order: [["id", "DESC"]],
            raw: true // ✅ Important pour éviter les problèmes de type
          });

          let nextNumber = 1;

          if (lastTeacher && lastTeacher.id) {
            // ✅ Vérifier que l'ID existe et est bien une string
            const lastId = String(lastTeacher.id); // Forcer en string
            
            // ✅ Vérifier que l'ID a au moins 8 caractères (YYYYMMDD)
            if (lastId.length >= 8) {
              const lastCounter = parseInt(lastId.slice(8)); // récupérer les chiffres après la date
              
              // ✅ Vérifier que c'est un nombre valide
              if (!isNaN(lastCounter)) {
                nextNumber = lastCounter + 1;
              }
            }
          }

          const counter = String(nextNumber).padStart(3, "0");
          const newId = `${datePrefix}${counter}`; // ex : 20250228001

          console.log(`🆔 Génération nouvel ID Teacher: ${newId}`);
          
          teacher.id = newId;

        } catch (error) {
          console.error("❌ Erreur lors de la génération de l'ID Teacher:", error);
          throw new Error("Impossible de générer un ID pour le professeur");
        }
      }
    }
  }
);

Teacher.belongsTo(School, { foreignKey: "school_id", as: "school" });