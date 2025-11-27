import express from "express";
import {
  // createClassRoomTranche,
  getAllClassRoomTranches,
  getClassRoomTranchesByClass,
  updateClassRoomTranche,
  deleteClassRoomTranche,
  setTranchesByLevel
} from "../controllers/classRoomTrancheController.js";

const router = express.Router();

// ➕ Créer un montant pour une classe et une tranche
router.post("/:school_id/", setTranchesByLevel);

// 📄 Lister tous les montants
router.get("/", getAllClassRoomTranches);

// 🔍 Voir les montants d'une classe
router.get("/class/:classRoom_id", getClassRoomTranchesByClass);

// 📝 Modifier un montant
router.put("/:id", updateClassRoomTranche);

// 🗑️ Supprimer un montant
router.delete("/:id", deleteClassRoomTranche);
//api/classroom-tranches/:id

export default router;
