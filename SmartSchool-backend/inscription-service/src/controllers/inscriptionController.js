import { publishEvent } from "../config/rabbitmq.js";
import { Student, Inscription, Tranche, Payer } from "../models/associations.js";
import axios from "axios";

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

// 📌 Récupérer les élèves d'une classe pour une année scolaire donnée
export const getStudentsByClassAndYear = async (req, res) => {
  try {
    const { classRoom_id, academieYear_id } = req.params;

    if (!classRoom_id || !academieYear_id) {
      return res.status(400).json({ message: "Paramètres manquants" });
    }

    const inscriptions = await Inscription.findAll({
      where: {
        classRoom_id,
        academieYear_id
      },
      include: [
        {
          model: Student,
          attributes: [
            "id",
            "matricule",
            "last_name",
            "first_name",
            "birth_date",
            "adress",
            "sex",
            "phone_parent"
          ]
        }
      ]
    });

    // 🔥 Ajouter l'id de l'inscription dans la réponse
    const result = inscriptions.map(i => ({
      inscription_id: i.id,
      ...i.Student.dataValues
    }));

    return res.json({
      status: true,
      count: result.length,
      students: result
    });

  } catch (error) {
    console.error("Erreur récupération élèves classe/année :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


export const getStudentsWithNotes = async (req, res) => {
  try {
    const { classRoom_id, academieYear_id } = req.params;

    const inscriptions = await Inscription.findAll({
      where: { classRoom_id, academieYear_id },
      include: [{ model: Student }]
    });

    const result = [];

    for (const ins of inscriptions) {
      const student = ins.Student;

    const notesResponse = await axios.get(
      `http://localhost:8081/note-service/notes/full/${ins.id}/`,
      { timeout: 5000 } // 5 secondes max
    ).catch(err => ({ data: { notes: [] } }));


      result.push({
        inscription_id: ins.id,
        student: {
          id: student.id,
          matricule: student.matricule,
          last_name: student.last_name,
          first_name: student.first_name,
          birth_date: student.birth_date,
          adress: student.adress,
          sex: student.sex,
          phone_parent: student.phone_parent
        },
        classRoom_id,
        academieYear_id,
        notes: notesResponse.data.notes   // 🔥 toutes les matières + notes
      });
    }

    res.json({
      status: true,
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error("Erreur récupération élèves+notes :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
