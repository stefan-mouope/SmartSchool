import { publishEvent } from "../config/rabbitmq.js";
import { Student, Inscription, Tranche, Payer } from "../models/associations.js";

// ➕ Créer une nouvelle inscription
export const createInscription = async (req, res) => {
  try {
    const { student, academieYear_id, classRoom_id } = req.body;

    // ✅ Vérification des champs requis
    if (!student || !academieYear_id || !classRoom_id) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // 📢 Publication de l'événement pour vérifier la classe et l'année académique
    const event_data = {
      classRoom_id,
      academieYear_id,
      school_id: student.school_id,
    };

    // Publier l'événement sur RabbitMQ
    const response = await publishEvent({
      event: "verification_inscription",
      data: event_data,
    });

    console.log("📩 Réponse du service :", response);

    // ✅ Vérification de la validité de la réponse
    if (!response || response.status !== true) {
      return res.status(400).json({ message: "verifier que la classe et l'année académique sont valides" });
    }

    // ✅ Création de l'étudiant s'il n'existe pas déjà
    let nouveauStudent = await Student.findOne({ where: { matricule: student.matricule } });

    if (!nouveauStudent) {
      nouveauStudent = await Student.create(student);
      console.log("👤 Nouvel étudiant créé :", nouveauStudent.id);
    }

    // ✅ Création de l'inscription
    const inscription = await Inscription.create({
      student_id: nouveauStudent.id,
      academieYear_id,
      classRoom_id,
    });

    res.status(201).json({
      message: "Inscription créée avec succès ✅",
      inscription,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// 📄 Lister toutes les inscriptions
export const getAllInscriptions = async (req, res) => {
  try {
    const inscriptions = await Inscription.findAll({
      include: [
        {
          model: Student,
          attributes: ["id", "matricule", "last_name", "first_name", "adress", "phone_parent"],
        },
        {
          model: Tranche,
          as: "tranches_payees",
          attributes: ["id", "tranche_name", "amount"],
          through: { attributes: [] }, // ne renvoie pas la table pivot
        },
      ],
    });

    res.json(inscriptions);
  } catch (error) {
    console.error("Erreur récupération inscriptions :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔍 Récupérer une inscription spécifique
export const getInscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const inscription = await Inscription.findByPk(id, {
      include: [
        { model: Student },
        { model: Tranche, as: "tranches_payees" },
      ],
    });

    if (!inscription) {
      return res.status(404).json({ message: "Inscription non trouvée" });
    }

    res.json(inscription);
  } catch (error) {
    console.error("Erreur récupération inscription :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🗑️ Supprimer une inscription
export const deleteInscription = async (req, res) => {
  try {
    const { id } = req.params;

    const inscription = await Inscription.findByPk(id);
    if (!inscription) {
      return res.status(404).json({ message: "Inscription non trouvée" });
    }

    await inscription.destroy();
    res.json({ message: "Inscription supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression inscription :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// inscriptionController.js
export const getInscriptionsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { current_year } = req.query;

    // Si tu veux seulement l'année courante
    let query = `
      SELECT i.*, s.matricule, s.first_name, s.last_name 
      FROM Inscription i
      JOIN Student s ON i.student_id = s.id
      WHERE i.classRoom_id = ?
    `;

    const params = [classId];

    if (current_year === "true") {
      query += ` AND i.academieYear_id = (SELECT id FROM Annee_scolaire WHERE actuelle = 1 LIMIT 1)`;
    }

    const [rows] = await db.query(query, params);

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
