import axios from "axios";
import ClassRoomTranche from "../models/classRoomTrancheModel.js";
import Tranche from "../models/trancheModel.js";

/**
 * ➕ Créer une règle montant par classe
 */
export const setTranchesByLevel = async (req, res) => {
  try {
    const school_id = req.params.school_id;
    const { level, tranches } = req.body;

    if (!level || !Array.isArray(tranches) || tranches.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Paramètres invalides : { level, tranches[] } requis",
      });
    }

    // Récupérer toutes les classes du niveau
    const response = await axios.get(
      `http://localhost:3000/api/classrooms/level/${school_id}/${level}`
    );

    const classrooms = response.data;

    if (!classrooms || classrooms.length === 0) {
      return res.status(404).json({
        status: false,
        message: `Aucune classe trouvée pour le niveau ${level}`,
      });
    }

    const createdOrUpdated = [];
    console.log(classrooms)
    // Pour chaque classe → appliquer toutes les tranches
    for (const classroom of classrooms) {
      for (const t of tranches) {
        const { tranche_id, amount } = t;

        // Vérifier validité
        if (!tranche_id || !amount || Number(amount) <= 0) continue;
        // Vérifier si déjà existant
        const exists = await ClassRoomTranche.findOne({
          where: {
            classRoom_id: classroom.id,
            tranche_id,
          },
        });
        let record;

        if (exists) {
          // Mise à jour du montant
          exists.amount = amount;
          await exists.save();
          record = exists;
        } else {
          // Création nouvelle association
          record = await ClassRoomTranche.create({
            classRoom_id: classroom.id,
            tranche_id,
            amount,
          });
        }

        createdOrUpdated.push(record);
      }
    }

    return res.status(200).json({
      status: true,
      message: `Montants mis à jour pour ${classrooms.length} classes du niveau ${level}`,
      total_operations: createdOrUpdated.length,
      data: createdOrUpdated,
    });

  } catch (error) {
    console.error("Erreur setTranchesByLevel :", error);

    if (error.response) {
      return res.status(error.response.status).json({
        status: false,
        message: "Erreur lors de la récupération des classes",
        error: error.response.data,
      });
    }

    return res.status(500).json({
      status: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};


/**
 * 📄 Lister tous les montants définis
 */
export const getAllClassRoomTranches = async (req, res) => {
  try {
    const data = await ClassRoomTranche.findAll({
      include: [
        { model: Tranche, as: "Tranche" }
      ]
    });

    return res.json({ status: true, data });

  } catch (error) {
    console.error("Erreur récupération ClassRoomTranche :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


/**
 * 🔍 Récupérer les montants d'une classe
 */
export const getClassRoomTranchesByClass = async (req, res) => {
  try {
    const { classRoom_id } = req.params;

    const data = await ClassRoomTranche.findAll({
      where: { classRoom_id },
      include: [{ model: Tranche, as: "Tranche" }]
    });

    return res.json({ status: true, classRoom_id, data });

  } catch (error) {
    console.error("Erreur récupération montant classe :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


/**
 * 📝 Modifier un montant particulier
 */
export const updateClassRoomTranche = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const item = await ClassRoomTranche.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Enregistrement non trouvé" });
    }

    item.amount = amount ?? item.amount;
    await item.save();

    return res.json({
      status: true,
      message: "Montant mis à jour",
      data: item,
    });

  } catch (error) {
    console.error("Erreur mise à jour ClassRoomTranche :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


/**
 * 🗑️ Supprimer un montant spécifique
 */
export const deleteClassRoomTranche = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ClassRoomTranche.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Enregistrement non trouvé" });
    }

    await item.destroy();

    return res.json({
      status: true,
      message: "Montant supprimé",
    });

  } catch (error) {
    console.error("Erreur suppression ClassRoomTranche :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
