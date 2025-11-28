import { Request, Response } from "express";
import { SchoolService } from "./school.service";
import { and, where } from "sequelize";
import { Director, School } from "../models";
import fs from 'fs';

const schoolService = new SchoolService();

export class SchoolController {
  // Créer une école
  create = async (req: Request, res: Response) => {
    try {
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Le logo est requis' });
    }
    
    const data = {
      ...req.body,
      logo: req.file // Le fichier uploadé par multer
    };
    
    const school = await schoolService.create(data);
    
    // Nettoyer le fichier temporaire après upload
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(201).json(school);
  } catch (error: any) {
    // Nettoyer le fichier temporaire en cas d'erreur
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Erreur création école:', error);
    res.status(500).json({ message: error.message });
  }
}
async findAllSchoolWithoutDirector(req: Request, res: Response) {
  try {
    console.log("test"); // pour vérifier que la fonction est appelée

    const schools = await School.findAll({
      include: [
        {
          model: Director,
          as: "director",      // doit correspondre à l'alias de School.hasOne(Director)
          required: false,     // LEFT JOIN
          attributes: ["id"],  // on a juste besoin de savoir s'il existe
        },
      ],
      where: {
        '$director.school_id$': null, // aucune école n'a de directeur
      },
    });

    res.status(200).json(schools);
  } catch (error: any) {
    console.error("Erreur findAllSchoolWithoutDirector:", error);
    res.status(500).json({ error: error.message });
  }
}

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


