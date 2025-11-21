import { Teacher } from "./teacher.model";
import { School } from "../school/school.model";

export class TeacherService {
  // Créer un professeur
  async create(data: any) {
    try {
      const teacher = await Teacher.create(data);
      return await Teacher.findByPk(teacher.id, { include: [{ model: School, as: "school" }] });
    } catch (error) {
      throw error;
    }
  }

  // Récupérer tous les professeurs
  async findAll() {
    try {
      const teachers = await Teacher.findAll({
        include: [{ model: School, as: "school" }],
      });
      return teachers;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un professeur par ID
  async findById(id: number) {
    try {
      const teacher = await Teacher.findByPk(id, {
        include: [{ model: School, as: "school" }],
      });
      if (!teacher) {
        throw new Error("Professeur non trouvé");
      }
      return teacher;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les professeurs par école
  async findBySchool(schoolId: number) {
    try {
      const teachers = await Teacher.findAll({
        where: { school_id: schoolId },
        include: [{ model: School, as: "school" }],
      });
      return teachers;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un professeur
  async update(id: number, data: any) {
    try {
      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        throw new Error("Professeur non trouvé");
      }
      await teacher.update(data);
      return await Teacher.findByPk(id, { include: [{ model: School, as: "school" }] });
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un professeur
  async delete(id: number) {
    try {
      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        throw new Error("Professeur non trouvé");
      }
      await teacher.destroy();
      return { message: "Professeur supprimé avec succès" };
    } catch (error) {
      throw error;
    }
  }
}


