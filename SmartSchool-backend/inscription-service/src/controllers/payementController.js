import { Payer, Inscription, Tranche } from "../models/associations.js";

// ➕ Enregistrer un paiement
export const createPayer = async (req, res) => {
  try {
    const { inscription_id, tranche_id } = req.body;

    if (!inscription_id || !tranche_id) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // Vérifie si les clés étrangères existent
    const inscription = await Inscription.findByPk(inscription_id);
    const tranche = await Tranche.findByPk(tranche_id);

    if (!inscription || !tranche) {
      return res.status(404).json({ message: "Inscription ou tranche introuvable" });
    }

    // Vérifie si le paiement existe déjà pour cette tranche
    const existant = await Payer.findOne({
      where: { inscription_id, tranche_id },
    });

    if (existant) {
      return res.status(400).json({ message: "Paiement déjà enregistré pour cette tranche" });
    }

    // Création du paiement sans montant, car il est fixe pour la tranche
    const payer = await Payer.create({ inscription_id, tranche_id });

    // Retourne le paiement avec le montant de la tranche inclus
    const payerAvecMontant = await Payer.findByPk(payer.id, {
      include: [
        { model: Inscription, attributes: ["id", "student_id", "classRoom_id"] },
        { model: Tranche, attributes: ["tranche_name", "amount"] }, // Montant ici vient de la tranche
      ],
    });

    res.status(201).json({ message: "Paiement enregistré avec succès", payer: payerAvecMontant });
  } catch (error) {
    console.error("Erreur création paiement :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 📄 Lister tous les paiements avec montant de la tranche
export const getAllPayers = async (req, res) => {
  try {
    const payers = await Payer.findAll({
      include: [
        { model: Inscription, attributes: ["id", "student_id", "classRoom_id"] },
        { model: Tranche, attributes: ["tranche_name", "amount"] },
      ],
    });
    res.json(payers);
  } catch (error) {
    console.error("Erreur récupération paiements :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// 🔍 Obtenir un paiement par ID avec montant de la tranche
export const getPayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const payer = await Payer.findByPk(id, {
      include: [
        { model: Inscription, attributes: ["id", "student_id", "classRoom_id"] },
        { model: Tranche, attributes: ["tranche_name", "amount"] },
      ],
    });

    if (!payer) return res.status(404).json({ message: "Paiement non trouvé" });

    res.json(payer);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
