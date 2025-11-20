import { Request, Response } from "express";
import { AcademicYearService } from "./academicYear.service";

const academicYearService = new AcademicYearService();

export class AcademicYearController {
  // Créer une année académique
  async create(req: Request, res: Response) {
    try {
      const academicYear = await academicYearService.create(req.body);
      res.status(201).json(academicYear);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Récupérer toutes les années académiques
  async findAll(req: Request, res: Response) {
    try {
      const academicYears = await academicYearService.findAll();
      res.status(200).json(academicYears);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer une année académique par ID
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const academicYear = await academicYearService.findById(id);
      res.status(200).json(academicYear);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // Récupérer l'année académique actuelle
  async findCurrent(req: Request, res: Response) {
    try {
      const academicYear = await academicYearService.findCurrent();
      res.status(200).json(academicYear);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mettre à jour une année académique
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const academicYear = await academicYearService.update(id, req.body);
      res.status(200).json(academicYear);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Supprimer une année académique
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await academicYearService.delete(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}


