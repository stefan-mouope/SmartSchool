// routes/inscriptionRoutes.js (MODIFIÉ)
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createInscription,
  getAllInscriptions,
  getInscriptionById,
  deleteInscription,
} from "../controllers/inscriptionController.js";

const router = express.Router();

// SEULEMENT LE DIRECTEUR PEUT CRÉER
router.post("/", requireAuth('create_inscription'), createInscription);

router.get("/", getAllInscriptions);
router.get("/:id", getInscriptionById);
router.delete("/:id", deleteInscription);

export default router;