import { Router } from "express";
import { SchoolController } from "./school.controller";
import { verifyAuth } from "../events/middlewares/verifyAuth";
import upload from "../../../config/multer";
import cloudinary from "../../../config/cloudinary";
import multer from "multer";
import { SchoolService } from "./school.service";

const router = Router();
const schoolController = new SchoolController();

// Routes CRUD pour School
// router.post("/", verifyAuth('create_ecole') ,(req, res) => schoolController.create(req, res));



// // stockage temporaire
// const upload = multer({ dest: 'uploads/' });

// router.post('/', upload.single('logo'), async (req, res) => {
//   try {
//     const data = req.body; // tous les champs texte
//     console.log("Fichier reçu :", req.file);
//     if (req.file) {
//       // Upload sur Cloudinary
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: 'schools',
//       });
//       console.log("Résultat upload Cloudinary :", result);
//       data.logo = result.secure_url; // ✅ maintenant c’est une string
//       fs.unlinkSync(req.file.path); // supprime le fichier temporaire
//     }

//     // console.log("Données reçues pour la création de l'école :", data);

//     const school = await new SchoolService().create(data);
//     res.json(school);
//   } catch (err: any) {
//     console.error("Erreur lors de la création de l'école :", err);
//     res.status(500).json({ message: err.message || 'Erreur lors de la création de l’école' });
//   }
// });

router.post("/", upload.single('logo'),(req, res) => schoolController.create(req, res));
router.get('/without-director', (req, res) => schoolController.findAllSchoolWithoutDirector(req, res));
router.get("/", (req, res) => schoolController.findAll(req, res));
router.get("/:id", (req, res) => schoolController.findById(req, res));
router.put("/:id", (req, res) => schoolController.update(req, res));
router.delete("/:id", (req, res) => schoolController.delete(req, res));
// router.post("/schools", upload.single("logo"), schoolController.createSchool);
export default router;


