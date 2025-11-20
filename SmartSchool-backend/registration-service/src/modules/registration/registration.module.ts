import { Router } from "express";
import schoolRoutes from "./school/school.routes";
import teacherRoutes from "./teacher/teacher.routes";
import directorRoutes from "./director/director.routes";
import classroomRoutes from "./classroom/classroom.routes";
import matterRoutes from "./matter/matter.routes";
import academicYearRoutes from "./academicYear/academicYear.routes";

const router = Router();

// Routes pour chaque entité
router.use("/schools", schoolRoutes);
router.use("/teachers", teacherRoutes);
router.use("/directors", directorRoutes);
router.use("/classrooms", classroomRoutes);
router.use("/matters", matterRoutes);
router.use("/academic-years", academicYearRoutes);

export default router;





