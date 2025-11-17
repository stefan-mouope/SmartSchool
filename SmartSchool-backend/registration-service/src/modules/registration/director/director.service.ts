import { Director } from "./director.model";
import { School } from "../school/school.model";

export class DirectorService {
  // Créer un directeur
  async create(data: any) {
    try {
      const director = await Director.create(data);
      return await Director.findByPk(director.id, { include: [{ model: School, as: "school" }] });
    } catch (error) {
      throw error;
    }
  }

  // Récupérer tous les directeurs
  async findAll() {
    try {
      const directors = await Director.findAll({
        include: [{ model: School, as: "school" }],
      });
      return directors;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un directeur par ID
  async findById(id: number) {
    try {
      const director = await Director.findByPk(id, {
        include: [{ model: School, as: "school" }],
      });
      if (!director) {
        throw new Error("Directeur non trouvé");
      }
      return director;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les directeurs par école
  async findBySchool(schoolId: number) {
    try {
      const directors = await Director.findAll({
        where: { school_id: schoolId },
        include: [{ model: School, as: "school" }],
      });
      return directors;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un directeur
  async update(id: number, data: any) {
    try {
      const director = await Director.findByPk(id);
      if (!director) {
        throw new Error("Directeur non trouvé");
      }
      await director.update(data);
      return await Director.findByPk(id, { include: [{ model: School, as: "school" }] });
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un directeur
  async delete(id: number) {
    try {
      const director = await Director.findByPk(id);
      if (!director) {
        throw new Error("Directeur non trouvé");
      }
      await director.destroy();
      return { message: "Directeur supprimé avec succès" };
    } catch (error) {
      throw error;
    }
  }
}


