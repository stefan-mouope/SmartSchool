import { Router } from "express";
import { ClassRoomController } from "./classroom.controller";

const router = Router();
const classRoomController = new ClassRoomController();

// Routes CRUD pour ClassRoom
router.post("/", (req, res) => classRoomController.create(req, res));
router.get("/", (req, res) => classRoomController.findAll(req, res));
router.get("/school/:schoolId", (req, res) => classRoomController.findBySchool(req, res));
router.get("/level/:level", (req, res) => classRoomController.findByLevel(req, res));
router.get("/:id", (req, res) => classRoomController.findById(req, res));
router.put("/:id", (req, res) => classRoomController.update(req, res));
router.delete("/:id", (req, res) => classRoomController.delete(req, res));

export default router;


