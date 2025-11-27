import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { TableSkeleton } from "@/components/shared/SkeletonLoading";
import { SubjectTypeResponse, getMattersBySchool } from "@/api/registration-service/matter.api";
import { SubjectCreationForm } from "@/components/forms/SubjectForm";
import { useAuthStore } from "@/store/authStore";

export const SubjectsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [subjects, setSubjects] = useState<SubjectTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const school_id = useAuthStore(state => state.school_id);

  const columns = [
    {
      key: "name",
      label: "Nom de la matière",
      align: "left" as const,
      render: (value: string, row: SubjectTypeResponse) => (
        <span className="font-medium">{row.name}</span>
      ),
    },
    {
      key: "school_name",
      label: "Établissement",
      align: "left" as const,
      render: (value: string, row: SubjectTypeResponse) => (
        <span className="font-medium">{row.school?.name ?? "—"}</span>
      ),
    },
  ];

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getMattersBySchool(school_id);
      setSubjects(data);
    } catch (error) {
      console.error("Erreur lors du chargement des matières:", error);
      setError("Impossible de charger les matières. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Gestion des Matières
      </h2>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Liste des matières</h3>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                {subjects.length} matière{subjects.length > 1 ? "s" : ""} enregistrée{subjects.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Ajouter une matière
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : error ? (
          <div className="p-8 text-center text-destructive">{error}</div>
        ) : (
          <DataTable columns={columns} data={subjects} />
        )}
      </div>

      <SubjectCreationForm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          fetchSubjects();
        }}
      />
    </div>
  );
};
