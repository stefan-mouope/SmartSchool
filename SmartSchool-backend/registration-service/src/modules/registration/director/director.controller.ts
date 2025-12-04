import { Request, Response } from "express";
import { DirectorService } from "./director.service";
import { publishDynamiqueEvent } from "../events/rabbitmq";

const directorService = new DirectorService();

export class DirectorController {
  // ---------------------------------------------------------
  // 🧑‍💼 Créer un directeur
  // ---------------------------------------------------------
    async create(req: Request, res: Response) {
    let directorCreated: any | null = null;

    try {
      const username =
        `${req.body.first_name.toLowerCase()}.${req.body.last_name.toLowerCase()}`;

      directorCreated = await directorService.create({
        ...req.body,
        username,
      });

      if (!directorCreated) {
        return res.status(500).json({
          success: false,
          error: "La création du directeur a échoué côté Node.",
        });
      }

      const payload = {
        ...req.body,
        role: "directeur",
        username,
        registrie_id: directorCreated.id,
      };

        const rpcResponse = await publishDynamiqueEvent(
        "registration_events",
        payload,
        "registration.create.director"
      );

      if (!rpcResponse || !rpcResponse.success) {
        await directorService.delete(directorCreated.id);

        return res.status(400).json({
          success: false,
          error: rpcResponse?.error || "Erreur inconnue Django",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Directeur créé avec succès",
        account: rpcResponse.user,
        director: directorCreated,
      });

    } catch (error: any) {
      console.error("❌ Erreur controller create_director:", error);

      if (directorCreated !== null) {
        await directorService.delete(directorCreated.id);
      }

      return res.status(500).json({ error: error.message });
    }
  }
  // ---------------------------------------------------------
  // 📌 Récupérer tous les directeurs
  // ---------------------------------------------------------
  async findAll(req: Request, res: Response) {
    try {
      const directors = await directorService.findAll();
      res.status(200).json(directors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // ---------------------------------------------------------
  // 🔍 Récupérer un directeur par ID
  // ---------------------------------------------------------
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const director = await directorService.findById(id);
      res.status(200).json(director);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // ---------------------------------------------------------
  // 🏫 Récupérer les directeurs par école
  // ---------------------------------------------------------
  async findBySchool(req: Request, res: Response) {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const directors = await directorService.findBySchool(schoolId);
      res.status(200).json(directors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // ---------------------------------------------------------
  // ✏️ Mettre à jour un directeur
  // ---------------------------------------------------------
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const director = await directorService.update(id, req.body);
      res.status(200).json(director);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // ---------------------------------------------------------
  // ❌ Supprimer un directeur
  // ---------------------------------------------------------
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
