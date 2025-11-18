// middlewares/verifyAuth.js
import { publishEvent } from "../config/rabbitmq.js";

export const verifyAuth = (requiredAction) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token manquant ou invalide" });
      }

      const accessToken = authHeader.split(" ")[1];

      // Récupération du refresh_token (depuis cookie ou header, selon ta stratégie)
      const refreshToken = req.cookies?.refresh_token || req.headers["x-refresh-token"];

      // Envoi vers Django (avec les deux tokens)
      const response = await publishEvent(
        {
          token: accessToken,           // access token (peut être expiré)
          refresh_token: refreshToken,  // refresh token (optionnel mais recommandé)
          action: requiredAction,
        },
        "auth.verify"
      );

      console.log("Réponse Auth Django :", response);

      // Token invalide (signature, blacklist, refresh échoué, etc.)
      if (!response.valid) {
        // Si refresh a échoué → on force la déconnexion côté client
        return res
          .status(401)
          .clearCookie("refresh_token")
          .json({
            message: "Session expirée, veuillez vous reconnecter",
            error: response.error,
            logout: true,
          });
      }

      // Token valide (avec ou sans refresh)
      req.user = {
        user_id: response.user_id,
        username: response.username,
        role: response.role,
      };

      // Si Django a rafraîchi les tokens → on les renvoie au frontend
      if (response.refresh) {
        const { access_token, refresh_token } = response.refresh;

        // Option 1 : via Set-Cookie (recommandé pour refresh_token)
        res.cookie("refresh_token", refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        });

        // Option 2 : via header ou body pour l'access_token
        res.setHeader("X-New-Access-Token", access_token);

        // Ou dans le body si tu veux (moins sécurisé mais pratique pour le frontend)
        // response.newAccessToken = access_token;
      }

      next();
    } catch (error) {
      console.error("Erreur middleware verifyAuth :", error);
      return res.status(500).json({
        message: "Erreur serveur d'authentification",
        error: error.message,
      });
    }
  };
};