import { Request, Response } from "express";
import { DirectorService } from "./director.service";
import { publishDynamiqueEvent } from "../events/rabbitmq";
const directorService = new DirectorService();

export class DirectorController {
  // Créer un directeur
    async create(req: Request, res: Response) {
    let directorCreated = null;

    try {
      // Générer automatiquement le username
      const username = `${req.body.first_name.toLowerCase()}.${req.body.last_name.toLowerCase()}`;

      

      // 1) Créer d'abord le directeur dans ta base Node
      directorCreated = await directorService.create({
        ...req.body,
        username: username,
      });
// Payload envoyé au microservice Django
      const payload = {
        ...req.body,
        role: "directeur",
        username: username,
        registrie_id:directorCreated ? directorCreated.id : undefined,
      };
      console.log("📌 Directeur créé côté Node :", directorCreated);

      // 2) Envoyer l’évènement RPC à Django (création du compte utilisateur)
      const rpcResponse = await publishDynamiqueEvent(
        "registration_events",
        payload,
        "registration.create.director"
      );

      console.log("📥 Réponse RPC Django :", rpcResponse);

      // 3) Si Django renvoie une erreur, rollback (supprimer le directeur Node)
      if (!rpcResponse.success) {
        console.log("❌ Django a échoué → suppression du directeur Node");

        await directorService.delete(directorCreated.id);

        return res.status(400).json({
          success: false,
          error: rpcResponse.error,
        });
      }

      // 4) Tout est OK → renvoyer la réponse réussie
      return res.status(201).json({
        success: true,
        message: "Directeur créé avec succès",
        account: rpcResponse.user,      // informations du compte Django
        director: directorCreated,      // données du directeur Node
      });

    } catch (error: any) {
      console.error("❌ Erreur controller create_director:", error);

      // Rollback en cas d’exception
      if (directorCreated) {
        await directorService.delete(directorCreated.id);
      }

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


