import { Router } from "express";
import { MatterController } from "./matter.controller";

const router = Router();
const matterController = new MatterController();

// Routes CRUD pour Matter
router.post("/", (req, res) => matterController.create(req, res));
router.get("/", (req, res) => matterController.findAll(req, res));
router.get("/school/:schoolId", (req, res) => matterController.findBySchool(req, res));
router.get("/:id", (req, res) => matterController.findById(req, res));
router.put("/:id", (req, res) => matterController.update(req, res));
router.delete("/:id", (req, res) => matterController.delete(req, res));

export default router;


