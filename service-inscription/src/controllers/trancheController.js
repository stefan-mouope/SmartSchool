import { Tranche } from "../models/associations.js";

// ➕ Créer une tranche
export const createTranche = async (req, res) => {
  try {
    const { tranche_name, amount, school_id } = req.body;

    if (!tranche_name || !amount || !school_id) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const tranche = await Tranche.create({
      tranche_name,
      amount,
      school_id,
    });

    res.status(201).json({ message: "Tranche créée avec succès", tranche });
  } catch (error) {
    console.error("Erreur création tranche :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📄 Lister toutes les tranches
export const getAllTranches = async (req, res) => {
  try {
    const tranches = await Tranche.findAll();
    res.json(tranches);
  } catch (error) {
    console.error("Erreur récupération tranches :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔍 Obtenir une tranche par ID
export const getTrancheById = async (req, res) => {
  try {
    const { id } = req.params;
    const tranche = await Tranche.findByPk(id);
    if (!tranche) return res.status(404).json({ message: "Tranche non trouvée" });

    res.json(tranche);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🗑️ Supprimer une tranche
export const deleteTranche = async (req, res) => {
  try {
    const { id } = req.params;
    const tranche = await Tranche.findByPk(id);
    if (!tranche) return res.status(404).json({ message: "Tranche non trouvée" });

    await tranche.destroy();
    res.json({ message: "Tranche supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
