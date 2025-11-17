import { Router } from "express";
import { AcademicYearController } from "./academicYear.controller";

const router = Router();
const academicYearController = new AcademicYearController();

// Routes CRUD pour AcademicYear
router.post("/", (req, res) => academicYearController.create(req, res));
router.get("/", (req, res) => academicYearController.findAll(req, res));
router.get("/current", (req, res) => academicYearController.findCurrent(req, res));
router.get("/:id", (req, res) => academicYearController.findById(req, res));
router.put("/:id", (req, res) => academicYearController.update(req, res));
router.delete("/:id", (req, res) => academicYearController.delete(req, res));

export default router;


