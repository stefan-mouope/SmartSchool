import { AcademicYear, ClassRoom, Matter, School } from "./models";


// 🧩 Associations
export function setupAssociations() {
  School.hasMany(ClassRoom, { foreignKey: "school_id", as: "classrooms" });
  ClassRoom.belongsTo(School, { foreignKey: "school_id", as: "school" });

  School.hasMany(Matter, { foreignKey: "school_id", as: "matters" });
  Matter.belongsTo(School, { foreignKey: "school_id", as: "school" });
  
  School.hasMany(AcademicYear, { foreignKey: "school_id", as: "academic_years" });
  AcademicYear.belongsTo(School, { foreignKey: "school_id", as: "school" });
}
