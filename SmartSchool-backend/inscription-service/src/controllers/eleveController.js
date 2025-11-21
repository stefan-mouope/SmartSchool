import { Student } from "../models/associations.js";

// ➕ Créer un étudiant avec matricule auto
export const createStudent = async (req, res) => {
  try {
    const { last_name, first_name, birth_date, adress, sex, phone_parent, school_id } = req.body;

    if (!last_name || !first_name || !school_id) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // ⚡ On ne passe pas matricule, il sera généré automatiquement par Sequelize
    const student = await Student.create({
      last_name,
      first_name,
      birth_date,
      adress,
      sex,
      phone_parent,
      school_id,
    });
    
    res.status(201).json({ message: "Étudiant créé avec succès", student });
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
    if (!student) return res.status(404).json({ message: "Étudiant non trouvé" });

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
    if (!student) return res.status(404).json({ message: "Étudiant non trouvé" });

    await student.destroy();
    res.json({ message: "Étudiant supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
