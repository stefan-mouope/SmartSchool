import { Request, Response, NextFunction } from "express";
import { publishEvent } from "../rabbitmq";

interface AuthResponse {
  valid: boolean;
  error?: string;
  [key: string]: any;
}

export const verifyAuth = (requiredAction: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const accessToken = authHeader.split(" ")[1];

      // Validation du refresh token optionnelle
    

      // 📡 Envoi au service Django Auth
      const response: AuthResponse = await publishEvent(
        {
          token: accessToken,
          action: requiredAction,
        },
        "auth.verify"
      );

      console.log("🔐 Réponse Auth:", response);

      if (!response.valid) {
        return res.status(403).json({ message: response.error || "Accès refusé" });
      }

      (req as any).user = response;
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
