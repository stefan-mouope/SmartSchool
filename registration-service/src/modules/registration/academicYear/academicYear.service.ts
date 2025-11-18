import { AcademicYear } from "./academicYear.model";
import { Op } from "sequelize";

export class AcademicYearService {
  // Créer une année académique
  async create(data: any) {
    try {
      const academicYear = await AcademicYear.create(data);
      return academicYear;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer toutes les années académiques
  async findAll() {
    try {
      const academicYears = await AcademicYear.findAll({
        order: [["start_date", "DESC"]],
      });
      return academicYears;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer une année académique par ID
  async findById(id: number) {
    try {
      const academicYear = await AcademicYear.findByPk(id);
      if (!academicYear) {
        throw new Error("Année académique non trouvée");
      }
      return academicYear;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer l'année académique actuelle
  async findCurrent() {
    try {
      const today = new Date();
      const academicYear = await AcademicYear.findOne({
        where: {
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today },
        },
      });
      return academicYear;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une année académique
  async update(id: number, data: any) {
    try {
      const academicYear = await AcademicYear.findByPk(id);
      if (!academicYear) {
        throw new Error("Année académique non trouvée");
      }
      await academicYear.update(data);
      return academicYear;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une année académique
  async delete(id: number) {
    try {
      const academicYear = await AcademicYear.findByPk(id);
      if (!academicYear) {
        throw new Error("Année académique non trouvée");
      }
      await academicYear.destroy();
      return { message: "Année académique supprimée avec succès" };
    } catch (error) {
      throw error;
    }
  }
}

