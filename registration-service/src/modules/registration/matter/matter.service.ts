import { Matter } from "./matter.model";
import { School } from "../school/school.model";

export class MatterService {
  // Créer une matière
  async create(data: any) {
    try {
      const matter = await Matter.create(data);
      return await Matter.findByPk(matter.id, { include: [{ model: School, as: "school" }] });
    } catch (error) {
      throw error;
    }
  }

  // Récupérer toutes les matières
  async findAll() {
    try {
      const matters = await Matter.findAll({
        include: [{ model: School, as: "school" }],
      });
      return matters;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer une matière par ID
  async findById(id: number) {
    try {
      const matter = await Matter.findByPk(id, {
        include: [{ model: School, as: "school" }],
      });
      if (!matter) {
        throw new Error("Matière non trouvée");
      }
      return matter;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les matières par école
  async findBySchool(schoolId: number) {
    try {
      const matters = await Matter.findAll({
        where: { school_id: schoolId },
        include: [{ model: School, as: "school" }],
      });
      return matters;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une matière
  async update(id: number, data: any) {
    try {
      const matter = await Matter.findByPk(id);
      if (!matter) {
        throw new Error("Matière non trouvée");
      }
      await matter.update(data);
      return await Matter.findByPk(id, { include: [{ model: School, as: "school" }] });
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une matière
  async delete(id: number) {
    try {
      const matter = await Matter.findByPk(id);
      if (!matter) {
        throw new Error("Matière non trouvée");
      }
      await matter.destroy();
      return { message: "Matière supprimée avec succès" };
    } catch (error) {
      throw error;
    }
  }
}


