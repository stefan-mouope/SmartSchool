import { publishEvent } from "../config/rabbitmq.js";

export const verifyAuth = (requiredAction) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const token = authHeader.split(" ")[1];

      // 📡 Envoi de la demande de vérification au service d'auth Django
      const response = await publishEvent(
        {
          token,
          action: requiredAction,
        },
        "auth.verify" // routingKey vers Django Auth
      );

      console.log("🔐 Réponse Auth:", response);

      if (!response.valid) {
        return res.status(403).json({ message: response.error });
      }

      // 🔥 On attache l’utilisateur validé à req.user
      req.user = response;

      next();
    } catch (error) {
      console.error("Erreur middleware auth:", error);
      res.status(500).json({ message: "Erreur authentification", error: error.message });
    }
  };
};
