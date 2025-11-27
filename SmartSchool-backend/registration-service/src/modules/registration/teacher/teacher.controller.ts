import { Request, Response } from "express";
import { TeacherService } from "./teacher.service";
import { publishDynamiqueEvent } from "../events/rabbitmq";

const teacherService = new TeacherService();

export class TeacherController {
  // Créer un professeur
  async create(req: Request, res: Response) {
    try {
      // Générer automatiquement le username
      const username = `${req.body.first_name.toLowerCase()}.${req.body.last_name.toLowerCase()}`;
      const newTeacher = await teacherService.create(req.body);

      // Préparer le payload pour Django
      const payload = {
        ...req.body,
        role: "enseignant",
        username: username,
        registrie_id:newTeacher ? newTeacher.id : null,
      };


      // Publier l'événement RPC et attendre la réponse Django
      const rpcResponse = await publishDynamiqueEvent(
        "registration_events",
        payload,
        "registration.create.teacher" // routing key
      );

      console.log("📥 Réponse RPC Django :", rpcResponse);

      if (!rpcResponse.success) {
        await teacherService.delete(newTeacher?.id);
        return res.status(400).json({ error: rpcResponse.error });
      }

      // Créer l'enseignant dans le microservice Node

      // Réponse finale
      res.status(201).json({
        success: true,
        user_system: rpcResponse.user,
        teacher_service: newTeacher,
      });
    } catch (error: any) {
      console.error("❌ Erreur controller create_teacher:", error);
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


