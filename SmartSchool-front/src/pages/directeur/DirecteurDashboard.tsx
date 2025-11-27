import React, { useEffect, useState } from "react";
import { GraduationCap, Users, BookOpen } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import axios from "@/lib/axios";
import { getTeacherBySchoolId } from "@/api/registration-service/teacher.api";
import { useAuthStore } from "@/store/authStore";
import { getClassroomsBySchool } from "@/api/registration-service/classroom.api";
import { getStudentsBySchoolId } from "@/api/student.api";

interface RecentActivity {
  id: string;
  label: string;
  type: "payment" | "inscription";
}

export const DirecteurDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const school_id = useAuthStore(state => state.school_id);

  const [teachersCount, setTeachersCount] = useState<number>(0);
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [classesCount, setClassesCount] = useState<number>(0);
  const [pendingPayments, setPendingPayments] = useState<number>(0);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const fetchStats = async () => {
    try {
      const teachersRes = await getTeacherBySchoolId(school_id!);
      const studentsRes = await getStudentsBySchoolId(school_id!);
      const classesRes = await getClassroomsBySchool(school_id!);

      setTeachersCount(teachersRes.length);
      setStudentsCount(studentsRes.length);
      setClassesCount(classesRes.length);


    } catch (error) {
      console.error("Erreur lors du chargement du tableau de bord :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-center py-10">Chargement...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Tableau de bord Directeur
      </h2>

      {/* ----- Statistiques principales ----- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Enseignants"
          value={teachersCount}
          icon={GraduationCap}
          gradient="primary"
        />

        <StatsCard
          title="Élèves"
          value={studentsCount}
          icon={Users}
          gradient="success"
        />

        <StatsCard
          title="Classes"
          value={classesCount}
          icon={BookOpen}
          gradient="accent"
        />
      </div>

      {/* ----- Sections secondaires ----- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Activités récentes */}
        <div className="bg-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Activités récentes
          </h3>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune activité récente
              </p>
            ) : (
              activities.map((a) => (
                <div key={a.id} className="flex items-center text-sm">
                  <div
                    className={`w-2 h-2 rounded-full mr-3 ${
                      a.type === "payment"
                        ? "bg-success"
                        : "bg-primary"
                    }`}
                  ></div>
                  <span className="text-muted-foreground">{a.label}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Paiements en attente */}
        <div className="bg-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Paiements en attente
          </h3>

          <p className="text-3xl font-bold text-warning">{pendingPayments}</p>
          <p className="text-sm text-muted-foreground mt-1">
            élèves en retard de paiement
          </p>
        </div>
      </div>
    </div>
  );
};
