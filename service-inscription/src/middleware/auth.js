// middleware/auth.js
import { verifyToken } from '../utils/auth.js';

export const requireAuth = (requiredAction) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const result = await verifyToken(token, requiredAction);

      if (!result.valid) {
        return res.status(401).json({ message: result.error || 'Token invalide' });
      }

      // Vérifie le rôle selon l'action
      if (requiredAction === 'create_eleve' && result.role !== 'directeur') {
        return res.status(403).json({ message: 'Accès refusé : rôle directeur requis' });
      }

      req.user = {
        id: result.user_id,
        role: result.role,
        username: result.username
      };

      next();
    } catch (err) {
      console.error('Erreur auth:', err);
      res.status(500).json({ message: 'Service authentification indisponible' });
    }
  };
};