import express from "express";
import {
  createInscription,
  getAllInscriptions,
  getInscriptionById,
  deleteInscription,
  getStudentsWithNotes,
  getInscriptionByClassRoomId,

} from "../controllers/inscriptionController.js";
import { verifyAuth } from "../middlewares/verifyAuth.js";

import { getStudentsByClassAndYear } from "../controllers/inscriptionController.js";


const router = express.Router();


// router.post("/", verifyAuth("create_inscription"), createInscription);

router.post("/", createInscription);
router.get("/", getAllInscriptions);
router.get("/class/:classRoom_id", getInscriptionByClassRoomId);
router.get("/:id", getInscriptionById);
router.delete("/:id", deleteInscription);
// router.get(
//   "/class/:classRoom_id/year/:academieYear_id/students",
//   getStudentsByClassAndYear
// );

router.get(
  "/class/:classRoom_id/year/:academieYear_id/students",
  getStudentsWithNotes
);


export default router;
