import { Request, Response } from "express";
import { MatterService } from "./matter.service";

const matterService = new MatterService();

export class MatterController {
  // Créer une matière
  async create(req: Request, res: Response) {
    try {
      const matter = await matterService.create(req.body);
      res.status(201).json(matter);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Récupérer toutes les matières
  async findAll(req: Request, res: Response) {
    try {
      const matters = await matterService.findAll();
      res.status(200).json(matters);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer une matière par ID
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const matter = await matterService.findById(id);
      res.status(200).json(matter);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // Récupérer les matières par école
  async findBySchool(req: Request, res: Response) {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const matters = await matterService.findBySchool(schoolId);
      res.status(200).json(matters);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mettre à jour une matière
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const matter = await matterService.update(id, req.body);
      res.status(200).json(matter);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Supprimer une matière
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await matterService.delete(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}


