import { Student } from "../models/associations.js";

// ➕ Créer un étudiant (fusion HEAD + yves)
export const createStudent = async (req, res) => {
  try {
    const {
      matricule,
      last_name,
      first_name,
      birth_date,
      adress,
      sex,
      phone_parent,
      school_id,
    } = req.body;

    if (!last_name || !first_name || !school_id) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const student = await Student.create({
      matricule,
      last_name,
      first_name,
      birth_date,
      adress,
      sex,
      phone_parent,
      school_id,
    });

    // LOG SÉCURISÉ (reprend la logique HEAD)
    console.log(
      `Étudiant créé par ${req.user?.username} (${req.user?.role}) | ID: ${student.id}`
    );

    // Réponse détaillée (HEAD) + format simplifié
    res.status(201).json({
      message: "Étudiant créé avec succès",
      student,
      créé_par: {
        username: req.user?.username,
        role: req.user?.role,
      },
    });
  } catch (error) {
    console.error("Erreur création étudiant :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📄 Lister tous les étudiants
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (error) {
    console.error("Erreur récupération étudiants :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔍 Obtenir un étudiant par ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student)
      return res.status(404).json({ message: "Étudiant non trouvé" });

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🗑️ Supprimer un étudiant
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student)
      return res.status(404).json({ message: "Étudiant non trouvé" });

    await student.destroy();
    res.json({ message: "Étudiant supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
