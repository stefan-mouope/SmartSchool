import Student from "./eleveModel.js";
import Inscription from "./inscriptionModel.js";
import Tranche from "./trancheModel.js";
import Payer from "./payementModel.js";



// 🧑‍🎓 Un étudiant a plusieurs inscriptions
Student.hasMany(Inscription, { foreignKey: "student_id" });
Inscription.belongsTo(Student, { foreignKey: "student_id" });



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



Payer.belongsTo(Inscription, { foreignKey: "inscription_id" });
Payer.belongsTo(Tranche, { foreignKey: "tranche_id" });



// ✅ Exporter tous les modèles
export { Student, Inscription, Tranche, Payer };
