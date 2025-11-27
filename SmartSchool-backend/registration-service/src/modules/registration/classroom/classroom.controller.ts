import { Request, Response } from "express";
import { ClassRoomService } from "./classroom.service";

const classRoomService = new ClassRoomService();

export class ClassRoomController {
  // Créer une classe
  async create(req: Request, res: Response) {
    try {
      const classroom = await classRoomService.create(req.body);
      res.status(201).json(classroom);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Récupérer toutes les classes
  async findAll(req: Request, res: Response) {
    try {
      const classrooms = await classRoomService.findAll();
      res.status(200).json(classrooms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer une classe par ID
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const classroom = await classRoomService.findById(id);
      res.status(200).json(classroom);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // Récupérer les classes par école
  async findBySchool(req: Request, res: Response) {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const classrooms = await classRoomService.findBySchool(schoolId);
      res.status(200).json(classrooms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer les classes par niveau
  async findByLevel(req: Request, res: Response) {
    try {
      const level = parseInt(req.params.level);
      const school_id = parseInt(req.params.school_id);
      const classrooms = await classRoomService.findByLevel(level, school_id);
      res.status(200).json(classrooms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

async getLevelsBySchool(req: Request, res: Response) {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const levels = await classRoomService.getLevelsBySchool(schoolId);
    res.status(200).json({ levels });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}


 getLevelsWithTranchesController = async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const data = await classRoomService.getLevelsWithTranches(schoolId);

    res.json({ status: true, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

  // Mettre à jour une classe
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const classroom = await classRoomService.update(id, req.body);
      res.status(200).json(classroom);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Supprimer une classe
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await classRoomService.delete(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}


