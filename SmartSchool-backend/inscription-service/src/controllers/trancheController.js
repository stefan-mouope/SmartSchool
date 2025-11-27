import { Tranche } from "../models/associations.js";
import ClassRoomTranche from "../models/classRoomTrancheModel.js";

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





export const computeTranchesByLevelController = async (req, res) => {
  try {
    const classes = req.body.classes;

    console.log("Classes reçues pour calcul des tranches par niveau :", classes);

    if (!classes || classes.length === 0) {
      return res.json({ status: true, data: [] });
    }

    // Extraire les IDs des classes
    const classIds = classes.map(c => c.id);

    // Récupérer toutes les tranches liées aux classes
    const tranches = await ClassRoomTranche.findAll({
      where: { classRoom_id: classIds },
      include: [{ model: Tranche, as: "Tranche", attributes: ["tranche_name"] }],
      raw: true
    });

    // Regrouper par niveau
    const result = {};

    // Initialiser les niveaux trouvés
    for (let c of classes) {
      if (!result[c.level]) {
        result[c.level] = {};
      }
    }

    // Ajouter les montants dans les bons niveaux + tranches
    for (let item of tranches) {
      const classItem = classes.find(c => c.id === item.classRoom_id);
      if (!classItem) continue;

      const level = classItem.level;
      const trancheName = item["Tranche.tranche_name"];

      if (!result[level][trancheName]) {
        result[level][trancheName] = 0;
      }

      result[level][trancheName] += item.amount;
    }

    // Convertir l’objet en tableau
    const formatted = Object.entries(result).map(([level, tranches]) => ({
      level: Number(level),
      tranches
    }));

    return res.json({
      status: true,
      data: formatted
    });

  } catch (error) {
    console.error("Erreur computeTranchesByLevel :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

