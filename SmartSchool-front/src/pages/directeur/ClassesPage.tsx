import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { TableSkeleton } from "@/components/shared/SkeletonLoading";
import { ClassroomCreationForm} from "@/components/forms/ClassroomCreateForm";
import { ClassTypeResponse, getClassroomsBySchool } from "@/api/registration-service/classroom.api";
import { useAuthStore } from "@/store/authStore";

export const ClassesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState<ClassTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const school_id = useAuthStore(state => state.school_id);

  const columns = [
    {
      key: "name",
      label: "Nom de la classe",
      align: "left" as const,
      render: (value: string, row: ClassTypeResponse) => (
        <span className="font-medium">{row.name}</span>
      ),
    },
    {
      key: "level",
      label: "Niveau",
      align: "left" as const,
      render: (value: string, row: ClassTypeResponse) => (
        <span className="font-medium">{row.level}</span>
      ),
    },
  ];

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getClassroomsBySchool(school_id);
      console.log(data)
      setClasses(data);
    } catch (error) {
      console.error("Erreur lors du chargement des classes:", error);
      setError("Impossible de charger les classes. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Gestion des Classes
      </h2>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Liste des classes</h3>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                {classes.length} classe{classes.length > 1 ? "s" : ""} enregistrée{classes.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Ajouter une classe
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : error ? (
          <div className="p-8 text-center text-destructive">{error}</div>
        ) : (
          <DataTable columns={columns} data={classes} />
        )}
      </div>

      <ClassroomCreationForm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          fetchClasses();
        }}
      />
    </div>
  );
};
