import { School } from "./school.model";
import { ClassRoom } from "../classroom/classroom.model";
import { Transaction } from "sequelize";
import { Matter } from "../models";
import sequelize from "../../../config/database"; 

export class SchoolService {
  private defaultClasses = ["SIL", "CP", "CE1", "CE2", "CM1", "CM2"];
  private defaultMatters = [
    "Mathématiques",
    "Français",
    "Histoire-Géographie",
    "Sciences",
    "Anglais",
    "EPS",
  ];

  // Créer une école
  async create(data: any) {
    const transaction: Transaction = await sequelize.transaction();
    try {
      // ✅ On inclut la création de l’école dans la transaction
      const school = await School.create(data, { transaction });

      const classrooms = this.defaultClasses.map((name) => ({
        name,
        school_id: school.id,
      }));

      await ClassRoom.bulkCreate(classrooms, { transaction });

      const matters = this.defaultMatters.map((name) => ({
        name,
        school_id: school.id,
      }));

      await Matter.bulkCreate(matters, { transaction });

      await transaction.commit();

      // Retourne l’école avec ses classes et matières associées
      return await School.findByPk(school.id, {
        include: [
          { model: ClassRoom, as: "classrooms" },
          { model: Matter, as: "matters" },
        ],
      });
    } catch (error: any) {
      // await transaction.rollback();
      console.error("Erreur lors de la création de l'école :", error);
      throw new Error(error.message || "Erreur de création");
    }
  }

  // Récupérer toutes les écoles
  async findAll() {
    return await School.findAll({
      include: [
        { model: ClassRoom, as: "classrooms" },
        { model: Matter, as: "matters" },
      ],
    });
  }

  // Récupérer une école par ID
  async findById(id: number) {
    const school = await School.findByPk(id, {
      include: [
        { model: ClassRoom, as: "classrooms" },
        { model: Matter, as: "matters" },
      ],
    });
    if (!school) throw new Error("École non trouvée");
    return school;
  }

  // Mettre à jour une école
  async update(id: number, data: any) {
    const school = await School.findByPk(id);
    if (!school) throw new Error("École non trouvée");
    await school.update(data);
    return school;
  }

  // Supprimer une école
  async delete(id: number) {
    const school = await School.findByPk(id);
    if (!school) throw new Error("École non trouvée");
    await school.destroy();
    return { message: "École supprimée avec succès" };
  }
}


