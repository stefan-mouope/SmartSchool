import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  deleteStudent,
  getStudentsBySchoolId,
} from "../controllers/eleveController.js";

const router = express.Router();

router.get("/school", getStudentsBySchoolId);


// ➕ Créer un étudiant
router.post("/", createStudent);

// 📄 Lister tous les étudiants
router.get("/", getAllStudents);

// 🔍 Obtenir un étudiant par ID
router.get("/:id", getStudentById);

// get students by school_id

// 🗑️ Supprimer un étudiant
router.delete("/:id", deleteStudent);

export default router;
