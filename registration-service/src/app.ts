import express, { Application, Request, Response, NextFunction } from "express";
import { registrationRoutes } from "./modules/registration";
import { config } from "./config/env";

const app: Application = express();

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de santé
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Registration Service is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes de l'API
app.use("/api", registrationRoutes);

// Route par défaut
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Registration Service API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      schools: "/api/schools",
      students: "/api/students",
      teachers: "/api/teachers",
      directors: "/api/directors",
      classrooms: "/api/classrooms",
      matters: "/api/matters",
      academicYears: "/api/academic-years",
    },
  });
});

// Middleware de gestion des erreurs
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Middleware pour les routes non trouvées
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

export default app;

