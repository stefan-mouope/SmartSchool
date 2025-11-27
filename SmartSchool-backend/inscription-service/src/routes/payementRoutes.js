import express from "express";
import {
  createPayer,
  getAllPayers,
  getPayerById,
  getPaymentStatsByYear,
} from "../controllers/payementController.js";

const router = express.Router();

// ➕ Créer un paiement
router.post("/", createPayer);

// 📄 Lister tous les paiements
router.get("/", getAllPayers);

// 🔍 Obtenir un paiement par ID
router.get("/:id", getPayerById);

// router.get("/stats/:classRoom_id/:academieYear_id", getPaymentStats);

router.get("/stats/year/:academieYear_id", getPaymentStatsByYear);
// /api/payements/stats/year/:academieYear_id





export default router;
