import { Router } from "express";
import { TeacherController } from "./teacher.controller";

const router = Router();
const teacherController = new TeacherController();

// Routes CRUD pour Teacher
router.post("/", (req, res) => teacherController.create(req, res));
router.get("/", (req, res) => teacherController.findAll(req, res));
router.get("/school/:schoolId", (req, res) => teacherController.findBySchool(req, res));
router.get("/:id", (req, res) => teacherController.findById(req, res));
router.put("/:id", (req, res) => teacherController.update(req, res));
router.delete("/:id", (req, res) => teacherController.delete(req, res));

export default router;


