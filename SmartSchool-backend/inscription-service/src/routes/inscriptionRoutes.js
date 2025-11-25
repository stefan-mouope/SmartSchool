import express from "express";
import {
  createInscription,
  getAllInscriptions,
  getInscriptionById,
  deleteInscription,
  getInscriptionsByClass,
} from "../controllers/inscriptionController.js";
import { verifyAuth } from "../middlewares/verifyAuth.js";

const router = express.Router();


router.post("/", verifyAuth("create_inscription"), createInscription);

router.post("/", createInscription);
router.get("/", getAllInscriptions);
router.get("/:id", getInscriptionById);
router.delete("/:id", deleteInscription);
router.get("/class/:classId", getInscriptionsByClass);
export default router;
