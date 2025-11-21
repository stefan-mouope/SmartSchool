import { Request, Response, NextFunction } from "express";
import { publishEvent } from "../rabbitmq";

interface AuthResponse {
  valid: boolean;
  error?: string;
  [key: string]: any; // Pour les données utilisateur additionnelles
}

export const verifyAuth = (requiredAction: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const token = authHeader.split(" ")[1];

      // 📡 Envoi de la demande de vérification au service d'auth Django
      const response: AuthResponse = await publishEvent(
        {
          token,
          action: requiredAction,
        },
        "auth.verify" // routingKey vers Django Auth
      );

      console.log("🔐 Réponse Auth:", response);

      if (!response.valid) {
        return res.status(403).json({ message: response.error || "Accès refusé" });
      }

      // 🔥 On attache l’utilisateur validé à req.user
      (req as any).user = response; // Ou créer un type personnalisé pour req.user

      next();
    } catch (error: any) {
      console.error("Erreur middleware auth:", error);
      res.status(500).json({
        message: "Erreur authentification",
        error: error?.message || error,
      });
    }
  };
};
