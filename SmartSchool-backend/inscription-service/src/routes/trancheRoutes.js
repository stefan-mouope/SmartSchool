import express from "express";
import {
  createTranche,
  getAllTranches,
  getTrancheById,
  deleteTranche,
  computeTranchesByLevelController,
} from "../controllers/trancheController.js";

const router = express.Router();

// ➕ Créer une tranche
router.post("/", createTranche);

// 🧮 Calculer les tranches par niveau
router.post("/compute-by-level", computeTranchesByLevelController);


// 📄 Lister toutes les tranches
router.get("/", getAllTranches);

// 🔍 Obtenir une tranche par ID
router.get("/:id", getTrancheById);



// 🗑️ Supprimer une tranche
router.delete("/:id", deleteTranche);

export default router;
