import { ClassRoom } from "./classroom.model";
import { School } from "../school/school.model";
import axios from "axios";
import { Sequelize } from "sequelize";

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
      include: [
        {
          model: School,
          as: "school", // <-- alias correct
        },
      ],
    });
    return classrooms;
  } catch (error) {
    throw error;
  }
}


//recuperation des classes par niveau


// recupere les tous les niveau de la 

async getLevelsBySchool(schoolId: number): Promise<number[]> {
  try {
    // console.log("🚀 ~ file: classroom.service.ts:97 ~ ClassRoomService ~ schoolId:", schoolId);
    const levels = await ClassRoom.findAll({
      where: { school_id: schoolId },
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("level")), "level"]
      ],
      order: [[Sequelize.col("level"), "ASC"]],
      raw: true, // retourne directement un objet simple
    });

    // Avec raw:true, on peut accéder directement à level
    return levels.map((l: any) => l.level);
  } catch (error) {
    throw error;
  }
}



 async getLevelsWithTranches(schoolId: number) {
    // 1️⃣ Récupérer toutes les classes de l'école
    const classes = await ClassRoom.findAll({
      where: { school_id: schoolId },
      attributes: ["id", "name", "level"],
      raw: true
    });

    // 2️⃣ Appeler directement le service Tranche
    const response = await axios.post(
      "http://localhost:5000/api/tranches/compute-by-level",
      { classes }
    );

    // 3️⃣ Retourner au frontend
    return response.data;
  }

  // Récupérer les classes par niveau
  async findByLevel(level: number, school_id: number) {
    try {
      const classrooms = await ClassRoom.findAll({
        where: { level, school_id },
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





