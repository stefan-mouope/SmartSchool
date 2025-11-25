import dotenv from "dotenv";
import morgan from "morgan";
import express from "express";
// import cors from "cors";

import eleveRoutes from "./routes/eleveRoutes.js";
import trancheRoutes from "./routes/trancheRoutes.js";
import payementRoutes from "./routes/payementRoutes.js";
import inscriptionRoutes from "./routes/inscriptionRoutes.js";

dotenv.config();

const app = express();


// ===========================
app.use(morgan("dev"));
app.use(express.json());

// ===========================
//        ROUTES
// ===========================
app.use("/api/eleves", eleveRoutes);
app.use("/api/tranches", trancheRoutes);
app.use("/api/payements", payementRoutes);
app.use("/api/inscriptions", inscriptionRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Service Inscription OK");
});

export default app;
