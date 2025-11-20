import { AcademicYear, ClassRoom, Director, Matter, School } from "./models";

// 🧩 Associations
export function setupAssociations() {
  // ClassRoom
  School.hasMany(ClassRoom, { foreignKey: "school_id", as: "classrooms" });
  ClassRoom.belongsTo(School, { foreignKey: "school_id", as: "school_for_classroom" });

  // Matter
  School.hasMany(Matter, { foreignKey: "school_id", as: "matters" });
  Matter.belongsTo(School, { foreignKey: "school_id", as: "school_for_matter" });

  // AcademicYear
  School.hasMany(AcademicYear, { foreignKey: "school_id", as: "academic_years" });
  AcademicYear.belongsTo(School, { foreignKey: "school_id", as: "school_for_academic_year" });

  // Director
  School.hasOne(Director, { foreignKey: "school_id", as: "director" });
  Director.belongsTo(School, { foreignKey: "school_id", as: "school_for_director" });
}
