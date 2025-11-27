import Student from "./eleveModel.js";
import Inscription from "./inscriptionModel.js";
import Tranche from "./trancheModel.js";
import Payer from "./payementModel.js";
import ClassRoomTranche from "./classRoomTrancheModel.js";


// 🧑‍🎓 Un étudiant a plusieurs inscriptions
Student.hasMany(Inscription, { foreignKey: "student_id" });
Inscription.belongsTo(Student, { foreignKey: "student_id" });

// 📝 Inscription et tranches payées (via Payer)
Inscription.belongsToMany(Tranche, {
  through: Payer,
  foreignKey: "inscription_id",
  otherKey: "tranche_id",
  as: "tranches_payees",
});

Tranche.belongsToMany(Inscription, {
  through: Payer,
  foreignKey: "tranche_id",
  otherKey: "inscription_id",
  as: "inscriptions_associees",
});

// 🔄 Payer référence inscription et tranche
Payer.belongsTo(Inscription, { foreignKey: "inscription_id" });
Payer.belongsTo(Tranche, { foreignKey: "tranche_id" });

Tranche.hasMany(ClassRoomTranche, { 
  foreignKey: "tranche_id",
  as: "classe_montants"
});

// Chaque configuration appartient à une tranche
ClassRoomTranche.belongsTo(Tranche, { 
  foreignKey: "tranche_id"
});


export { Student, Inscription, Tranche, Payer, ClassRoomTranche };
