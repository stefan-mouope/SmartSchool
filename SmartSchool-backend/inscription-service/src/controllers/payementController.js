import { Payer, Inscription, Tranche, ClassRoomTranche } from "../models/associations.js";

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




export const getPaymentStatsByYear = async (req, res) => {
  try {
    const { academieYear_id } = req.params;

    if (!academieYear_id) {
      return res.status(400).json({ message: "Paramètre academieYear_id manquant" });
    }

    // Récupérer toutes les inscriptions
    const inscriptions = await Inscription.findAll({
      where: { academieYear_id },
      include: [
        // {
        //   model: Student,
        //   attributes: ["id", "matricule", "last_name", "first_name"]
        // },
        {
          model: Tranche,
          as: "tranches_payees",
          attributes: ["id", "amount"]
        }
      ]
    });

    if (inscriptions.length === 0) {
      return res.json({
        status: true,
        message: "Aucune inscription trouvée pour cette année",
        stats: {
          total_collected: 0,
          total_pending: 0,
          total_expected: 0,
          collection_rate: 0,
          total_students: 0,
          students_paid: 0,
          students_pending: 0
        }
      });
    }

    let total_students = inscriptions.length;
    let total_collected = 0;
    let total_expected = 0;
    let students_paid = 0;

    // Cache pour éviter les re-findAll
    const classTranchesCache = {};

    for (const ins of inscriptions) {
      const classRoomId = ins.classRoom_id;

      // Charger les tranches de la classe
      if (!classTranchesCache[classRoomId]) {
        const classTranches = await ClassRoomTranche.findAll({
          where: { classRoom_id: classRoomId },
          include: [
            {
              model: Tranche,
              attributes: ["id", "tranche_name"]
            }
          ]
        });

        // Total attendu pour cette classe = somme des montants ClassRoomTranche.amount
        classTranchesCache[classRoomId] = {
          total: classTranches.reduce((sum, t) => sum + t.amount, 0),
        };
      }

      const totalAmountForStudent = classTranchesCache[classRoomId].total;
      total_expected += totalAmountForStudent;

      // Montant déjà payé
      const paid_amount = ins.tranches_payees.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      total_collected += paid_amount;

      if (paid_amount >= totalAmountForStudent) {
        students_paid++;
      }
    }

    const students_pending = total_students - students_paid;
    const total_pending = total_expected - total_collected;

    const collection_rate =
      total_expected === 0
        ? 0
        : Number(((total_collected / total_expected) * 100).toFixed(2));

    return res.json({
      status: true,
      stats: {
        total_collected,
        total_pending,
        total_expected,
        collection_rate,
        total_students,
        students_paid,
        students_pending,
      },
    });

  } catch (error) {
    console.error("Erreur stats année :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
