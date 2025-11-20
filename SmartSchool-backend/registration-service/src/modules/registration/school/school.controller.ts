import { Request, Response } from "express";
import { SchoolService } from "./school.service";

const schoolService = new SchoolService();

export class SchoolController {
  // Créer une école
  async create(req: Request, res: Response) {
    try {
      const school = await schoolService.create(req.body);
      res.status(201).json(school);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Récupérer toutes les écoles
  async findAll(req: Request, res: Response) {
    try {
      const schools = await schoolService.findAll();
      res.status(200).json(schools);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer une école par ID
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const school = await schoolService.findById(id);
      res.status(200).json(school);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // Mettre à jour une école
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const school = await schoolService.update(id, req.body);
      res.status(200).json(school);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Supprimer une école
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await schoolService.delete(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}


