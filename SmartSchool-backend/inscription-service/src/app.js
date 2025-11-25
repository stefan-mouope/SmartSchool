import dotenv from "dotenv";
import morgan from "morgan";
import express from "express";
import cors from "cors";

import eleveRoutes from "./routes/eleveRoutes.js";
import trancheRoutes from "./routes/trancheRoutes.js";
import payementRoutes from "./routes/payementRoutes.js";
import inscriptionRoutes from "./routes/inscriptionRoutes.js";

dotenv.config();

const app = express();

// CLÉ : ON AUTORISE LE FRONTEND
app.use(cors({
  origin: ["http://localhost:8083", "http://127.0.0.1:8083"],
  credentials: true
}));

app.use(morgan("dev"));
app.use(express.json());

// ROUTES
app.use("/api/eleves", eleveRoutes);
app.use("/api/tranches", trancheRoutes);
app.use("/api/payements", payementRoutes);
app.use("/api/inscriptions", inscriptionRoutes);

// Test
app.get("/", (req, res) => {
  res.json({ message: "Service Inscription OK – CORS activé pour localhost:8083" });
});

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`Inscription-service running on http://localhost:${PORT}`);
});

export default app;
