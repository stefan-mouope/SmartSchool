import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  deleteStudent,
} from "../controllers/eleveController.js";

const router = express.Router();

// ➕ Créer un étudiant
router.post("/", createStudent);

// 📄 Lister tous les étudiants
router.get("/", getAllStudents);

// 🔍 Obtenir un étudiant par ID
router.get("/:id", getStudentById);

// 🗑️ Supprimer un étudiant
router.delete("/:id", deleteStudent);

export default router;
