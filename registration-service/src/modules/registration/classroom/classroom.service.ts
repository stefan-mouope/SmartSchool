import { ClassRoom } from "./classroom.model";
import { School } from "../school/school.model";

export class ClassRoomService {
  
  // Créer une classe
  async create(data: any) {
    try {
      const classroom = await ClassRoom.create(data);
      return await ClassRoom.findByPk(classroom.id, { include: [{ model: School, as: "school" }] });
    } catch (error) {
      throw error;
    }
  }

  // Récupérer toutes les classes
  async findAll() {
    try {
      const classrooms = await ClassRoom.findAll({
        include: [{ model: School, as: "school" }],
      });
      return classrooms;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer une classe par ID
  async findById(id: number) {
    try {
      const classroom = await ClassRoom.findByPk(id, {
        include: [{ model: School, as: "school" }],
      });
      if (!classroom) {
        throw new Error("Classe non trouvée");
      }
      return classroom;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les classes par école
  async findBySchool(schoolId: number) {
    try {
      const classrooms = await ClassRoom.findAll({
        where: { school_id: schoolId },
        include: [{ model: School, as: "school" }],
      });
      return classrooms;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les classes par niveau
  async findByLevel(level: string) {
    try {
      const classrooms = await ClassRoom.findAll({
        where: { level },
        include: [{ model: School, as: "school" }],
      });
      return classrooms;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une classe
  async update(id: number, data: any) {
    try {
      const classroom = await ClassRoom.findByPk(id);
      if (!classroom) {
        throw new Error("Classe non trouvée");
      }
      await classroom.update(data);
      return await ClassRoom.findByPk(id, { include: [{ model: School, as: "school" }] });
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une classe
  async delete(id: number) {
    try {
      const classroom = await ClassRoom.findByPk(id);
      if (!classroom) {
        throw new Error("Classe non trouvée");
      }
      await classroom.destroy();
      return { message: "Classe supprimée avec succès" };
    } catch (error) {
      throw error;
    }
  }
}





