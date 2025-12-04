import { Request, Response } from "express";
import { TeacherService } from "./teacher.service";
import { publishDynamiqueEvent } from "../events/rabbitmq";
import { Director } from "../models";

const teacherService = new TeacherService();

export class TeacherController {

  async create(req: Request, res: Response) {
    try {
      const username = `${req.body.first_name.toLowerCase()}.${req.body.last_name.toLowerCase()}`;

      const newTeacher = await teacherService.create(req.body);

      const teacherId = newTeacher?.id;

      if (!teacherId) {
        return res.status(500).json({
          error: "Impossible de créer le professeur : ID non généré."
        });
      }

      // Vérifier si un directeur existe (si utile)
      const existingDirector = await Director.findOne({
        where: { id: teacherId }
      });

      const payload = {
        ...req.body,
        role: "enseignant",
        username,
        registrie_id: teacherId,
      };

      const rpcResponse = await publishDynamiqueEvent(
        "registration_events",
        payload,
        "registration.create.teacher"
      );

      console.log("📥 Réponse RPC Django :", rpcResponse);

      if (!rpcResponse.success) {
        await teacherService.delete(teacherId);
        return res.status(400).json({ error: rpcResponse.error });
      }

      return res.status(201).json({
        success: true,
        user_system: rpcResponse.user,
        teacher_service: newTeacher,
      });

    } catch (error: any) {
      console.error("❌ Erreur controller create_teacher:", error);
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const teachers = await teacherService.findAll();
      res.status(200).json(teachers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id; // 🔥 ID string
      const teacher = await teacherService.findById(id);
      res.status(200).json(teacher);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async findBySchool(req: Request, res: Response) {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const teachers = await teacherService.findBySchool(schoolId);
      res.status(200).json(teachers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id; // 🔥 string
      const teacher = await teacherService.update(id, req.body);
      res.status(200).json(teacher);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await teacherService.delete(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
