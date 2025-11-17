import dotenv from "dotenv"

import morgan from "morgan";

import express from "express";
import cors from "cors";
import eleveRoutes from "./routes/eleveRoutes.js";
import trancheRoutes from "./routes/trancheRoutes.js";
import payementRoutes from "./routes/payementRoutes.js";
import inscriptionRoutes from "./routes/inscriptionRoutes.js"; // si tu l’as déjà

const app = express();

dotenv.config();

//morgan pour afficher les reponses du serveur sur le termilal
app.use(morgan("dev"));
// Middleware
app.use(cors());
app.use(express.json());

// Routes principales
app.use("/api/eleves", eleveRoutes);
app.use("/api/tranches", trancheRoutes);
app.use("/api/payements", payementRoutes);
app.use("/api/inscriptions", inscriptionRoutes);

// Route test
app.get("/", (req, res) => {
  res.send("✅ Service Inscription opérationnel");
});

export default app;




