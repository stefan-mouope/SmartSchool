import { Router } from "express";
import { DirectorController } from "./director.controller";

const router = Router();
const directorController = new DirectorController();

// Routes CRUD pour Director
router.post("/", (req, res) => directorController.create(req, res));
router.get("/", (req, res) => directorController.findAll(req, res));
router.get("/school/:schoolId", (req, res) => directorController.findBySchool(req, res));
router.get("/:id", (req, res) => directorController.findById(req, res));
router.put("/:id", (req, res) => directorController.update(req, res));
router.delete("/:id", (req, res) => directorController.delete(req, res));

export default router;


