import express from "express";
import {
  createPayer,
  getAllPayers,
  getPayerById,
} from "../controllers/payementController.js";

const router = express.Router();

// ➕ Créer un paiement
router.post("/", createPayer);

// 📄 Lister tous les paiements
router.get("/", getAllPayers);

// 🔍 Obtenir un paiement par ID
router.get("/:id", getPayerById);

export default router;
