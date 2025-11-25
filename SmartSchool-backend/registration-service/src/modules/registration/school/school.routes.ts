import { Router } from "express";
import { SchoolController } from "./school.controller";
import { verifyAuth } from "../events/middlewares/verifyAuth";

const router = Router();
const schoolController = new SchoolController();

// Routes CRUD pour School
// router.post("/", verifyAuth('create_ecole') ,(req, res) => schoolController.create(req, res));

router.post("/",(req, res) => schoolController.create(req, res));
router.get('/without-director', (req, res) => schoolController.findAllSchoolWithoutDirector(req, res));
router.get("/", (req, res) => schoolController.findAll(req, res));
router.get("/:id", (req, res) => schoolController.findById(req, res));
router.put("/:id", (req, res) => schoolController.update(req, res));
router.delete("/:id", (req, res) => schoolController.delete(req, res));

export default router;


