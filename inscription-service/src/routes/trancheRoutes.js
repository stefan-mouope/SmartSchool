import express from "express";
import {
  createTranche,
  getAllTranches,
  getTrancheById,
  deleteTranche,
} from "../controllers/trancheController.js";

const router = express.Router();

// ➕ Créer une tranche
router.post("/", createTranche);

// 📄 Lister toutes les tranches
router.get("/", getAllTranches);

// 🔍 Obtenir une tranche par ID
router.get("/:id", getTrancheById);

// 🗑️ Supprimer une tranche
router.delete("/:id", deleteTranche);

export default router;
