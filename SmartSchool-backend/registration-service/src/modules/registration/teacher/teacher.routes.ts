import { Router } from "express";
import { TeacherController } from "./teacher.controller";
import { verifyAuth } from "../events/middlewares/verifyAuth";

const router = Router();
const teacherController = new TeacherController();

// Routes CRUD pour Teacher
router.post("/", verifyAuth('create_teacher'), (req, res) => teacherController.create(req, res));
router.get("/", (req, res) => teacherController.findAll(req, res));
router.get("/school/:schoolId", (req, res) => teacherController.findBySchool(req, res));
router.get("/:id", (req, res) => teacherController.findById(req, res));
router.put("/:id", (req, res) => teacherController.update(req, res));
router.delete("/:id", (req, res) => teacherController.delete(req, res));

// Route dashboard temporaire
router.get("/:id/dashboard", (req, res) => {
  return res.json({
    statistiques: {
      nombreClasses: 6,
      nombreElevesTotal: 198,
      nombreNotesSaisies: 523
    },
    classes: [
      { id: "21", nom: "6ème A - Mathématiques", effectif: 33 },
      { id: "22", nom: "6ème A - Français", effectif: 33 },
      { id: "23", nom: "5ème B - Anglais", effectif: 32 },
      { id: "24", nom: "5ème B - Physique-Chimie", effectif: 32 },
      { id: "25", nom: "4ème C - Histoire-Géo", effectif: 34 },
      { id: "26", nom: "3ème D - SVT", effectif: 34 }
    ]
  });
});   // ← IL N'Y AVAIT QU'UNE SEULE PARENTHESE ICI !!!

export default router;