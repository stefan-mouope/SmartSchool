import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { useAuthStore } from "@/store/authStore";
import { getAllInscriptions, InscriptionResult } from "@/api/inscription";
import { getClassroomsBySchool } from "@/api/registration-service/classroom.api";
import { StudentCreationForm } from "@/components/forms/StudentCreationForm";

interface StudentTable {
  id: number;
  matricule: string;
  nom: string;
  classe: string;
  statut: string;
  montant: string;
}

export const ElevesPage: React.FC = () => {
  const schoolId = useAuthStore((state) => state.school_id);
  const academieYearId = useAuthStore((state) => state.academic_year_id);

  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [eleves, setEleves] = useState<StudentTable[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 🔹 Charger les classes de l'école
  const fetchClassRooms = async (schoolId: number) => {
    const response = await getClassroomsBySchool(schoolId);
    setClassrooms(response);
  };

  // 🔹 Charger les élèves
  const fetchEleves = async () => {
    try {
      const res: InscriptionResult[] = await getAllInscriptions();
      const data = res.map((s) => ({
        id: s.Student.id,
        matricule: s.Student.matricule,
        nom: `${s.Student.last_name} ${s.Student.first_name}`,
        classe: "N/A",
        statut: "Non payé",
        montant: "150 000 FCFA",
      }));
      setEleves(data);
    } catch (error) {
      console.error("Erreur lors du chargement des élèves:", error);
    }
  };

  useEffect(() => {
    fetchEleves();
    fetchClassRooms(schoolId!);
  }, [schoolId]);

  const columns = [
    { key: "matricule", label: "Matricule", align: "left" as const },
    { key: "nom", label: "Nom complet", align: "left" as const },
    // { key: "classe", label: "Classe", align: "left" as const },
    // { key: "statut", label: "Statut paiement", align: "center" as const },
    // { key: "montant", label: "Montant", align: "right" as const },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Gestion des Élèves</h2>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-card-foreground">
            Liste des élèves inscrits
          </h3>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Inscrire un élève
          </button>
        </div>

        <DataTable columns={columns} data={eleves} onEdit={(id) => console.log("Edit", id)} />
      </div>

      {/* 🔹 Formulaire modal */}
      <StudentCreationForm
        isOpen={isFormOpen}
        classrooms={classrooms}
        academieYearId={academieYearId!}
        onCancel={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          fetchEleves();
        }}
      />
    </div>
  );
};
