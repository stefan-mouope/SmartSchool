import { Request, Response } from "express";
import { DirectorService } from "./director.service";
import { publishDynamiqueEvent } from "../events/rabbitmq";
const directorService = new DirectorService();

export class DirectorController {
  // Créer un directeur
  async create(req: Request, res: Response) {
    try {
      // Générer automatiquement le username : prenom.nom en minuscules
      const username = `${req.body.first_name.toLowerCase()}.${req.body.last_name.toLowerCase()}`;

      // Préparer le payload pour Django
      const payload = {
        ...req.body,
        role: "directeur",
        username: username
      };

      // 1) Publier l'événement RPC et attendre la réponse Django
      const rpcResponse = await publishDynamiqueEvent(
        "registration_events",
        payload,
        "registration.create.director" // routing key conforme
      );

      console.log("📥 Réponse RPC Django :", rpcResponse);

      if (!rpcResponse.success) {
        return res.status(400).json({ error: rpcResponse.error });
      }

      // 2) Si Django OK → créer le directeur dans ta base Node
      const director = await directorService.create(req.body);

      return res.status(201).json({
        success: true,
        message: "Directeur créé avec succès",
        account: rpcResponse.user, // info renvoyée par Django
        director_service: director, // info du microservice Node
      });

    } catch (error: any) {
      console.error("❌ Erreur controller create_director:", error);
      return res.status(500).json({ error: error.message });
    }
  }


  // Récupérer tous les directeurs
  async findAll(req: Request, res: Response) {
    try {
      const directors = await directorService.findAll();
      res.status(200).json(directors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer un directeur par ID
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const director = await directorService.findById(id);
      res.status(200).json(director);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // Récupérer les directeurs par école
  async findBySchool(req: Request, res: Response) {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const directors = await directorService.findBySchool(schoolId);
      res.status(200).json(directors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mettre à jour un directeur
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const director = await directorService.update(id, req.body);
      res.status(200).json(director);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Supprimer un directeur
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await directorService.delete(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}


