import { Request, Response } from "express";
import { TeacherService } from "./teacher.service";

const teacherService = new TeacherService();

export class TeacherController {
  // Créer un professeur
  async create(req: Request, res: Response) {
    try {
      const teacher = await teacherService.create(req.body);
      res.status(201).json(teacher);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Récupérer tous les professeurs
  async findAll(req: Request, res: Response) {
    try {
      const teachers = await teacherService.findAll();
      res.status(200).json(teachers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer un professeur par ID
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const teacher = await teacherService.findById(id);
      res.status(200).json(teacher);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // Récupérer les professeurs par école
  async findBySchool(req: Request, res: Response) {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const teachers = await teacherService.findBySchool(schoolId);
      res.status(200).json(teachers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mettre à jour un professeur
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const teacher = await teacherService.update(id, req.body);
      res.status(200).json(teacher);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Supprimer un professeur
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await teacherService.delete(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}


