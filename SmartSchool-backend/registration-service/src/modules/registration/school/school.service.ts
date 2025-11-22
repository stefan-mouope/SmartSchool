import { School } from "./school.model";
import { ClassRoom } from "../classroom/classroom.model";
import { Transaction } from "sequelize";
import { AcademicYear, Matter } from "../models";
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

  // ➤ Créer une année scolaire en cours AUTOMATIQUEMENT
  private generateCurrentAcademicYear() {
    const currentYear = new Date().getFullYear();

    return {
      start_date: new Date(currentYear, 8, 1),  // 1er septembre
      end_date: new Date(currentYear + 1, 6, 30), // 30 juin
    };
  }

  // ➤ Créer une école + classes + matières + année scolaire
  async create(data: any) {
    const transaction: Transaction = await sequelize.transaction();

    try {
      // 1) Création de l'école
      const school = await School.create(data, { transaction });

      // 2) Création des classes
      const classrooms = this.defaultClasses.map((name) => ({
        name,
        school_id: school.id,
      }));
      await ClassRoom.bulkCreate(classrooms, { transaction });

      // 3) Création des matières
      const matters = this.defaultMatters.map((name) => ({
        name,
        school_id: school.id,
      }));
      await Matter.bulkCreate(matters, { transaction });

      // 4) Création automatique de l'année scolaire actuelle
      const currentYearData = this.generateCurrentAcademicYear();
      await AcademicYear.create(
        {
          ...currentYearData,
          school_id: school.id,
        },
        { transaction }
      );

      // 5) Valider la transaction
      await transaction.commit();

      // 6) Retourner l’école avec relations
      return await School.findByPk(school.id, {
        include: [
          { model: ClassRoom, as: "classrooms" },
          { model: Matter, as: "matters" },
          { model: AcademicYear, as: "academic_years" },
        ],
      });
    } catch (error: any) {
      await transaction.rollback();
      console.error("Erreur lors de la création de l'école :", error);
      throw new Error(error.message || "Erreur lors de la création de l'école");
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


