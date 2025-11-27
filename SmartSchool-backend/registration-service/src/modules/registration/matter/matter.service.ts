// Remplace TOUTES les occurrences de as: "school" par as: "school"

import { Matter } from "./matter.model";
import { School } from "../school/school.model";

export class MatterService {
  async create(data: any) {
    try {
      const matter = await Matter.create(data);
      return await Matter.findByPk(matter.id, {
        include: [{ model: School, as: "school" }], // ← CORRIGÉ
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const matters = await Matter.findAll({
        include: [{ model: School, as: "school" }], // ← CORRIGÉ
      });
      return matters;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const matter = await Matter.findByPk(id, {
        include: [{ model: School, as: "school" }], // ← CORRIGÉ
      });
      if (!matter) throw new Error("Matière non trouvée");
      return matter;
    } catch (error) {
      throw error;
    }
  }

  async findBySchool(schoolId: number) {
    try {
      const matters = await Matter.findAll({
        where: { school_id: schoolId },
        include: [{ model: School, as: "school" }], // ← CORRIGÉ
      });
      return matters;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, data: any) {
    try {
      const matter = await Matter.findByPk(id);
      if (!matter) throw new Error("Matière non trouvée");
      await matter.update(data);
      return await Matter.findByPk(id, {
        include: [{ model: School, as: "school" }], // ← CORRIGÉ
      });
    } catch (error) {
      throw error;
    }
  }
}