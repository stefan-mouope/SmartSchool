import React, { useEffect, useState } from "react";
import { Plus, Table } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { TableSkeleton } from "@/components/shared/SkeletonLoading";
import { TrancheResult, getTranchesBySchool } from "@/api/tranche.api";
import { getLevelsWithTranches } from "@/api/registration-service/classroom.api";
import { TrancheCreationForm } from "@/components/forms/TrancheCreationForm";
import { useAuthStore } from "@/store/authStore";
import { EditTrancheByLevelModal } from "../../components/forms/EditTrancheByLevelModal";
import { LevelsTranchesTable } from "./LevelsTranchesTable";
import { AssociateLevelTrancheForm } from "@/components/forms/AssociateLevelTrancheForm";
import { Button } from "@/components/ui/button";

export const TranchesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [showAssociateLevelTrancheForm, setShowAssociateLevelTrancheForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [levelsData, setLevelsData] = useState([]);
  const [tranches, setTranches] = useState<TrancheResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const school_id = useAuthStore((state) => state.school_id);

  // Colonnes compactes (tranches et montants séparés par des virgules)
  const compactColumns = [
    {
      key: "level",
      label: "Niveau",
      align: "left",
      render: (value, row) => (
        <span className="font-medium">{row.level ?? "Non défini"}</span>
      ),
    },
    {
      key: "tranches",
      label: "Tranches",
      align: "left",
      render: (value, row) => {
        const trancheNames = Object.keys(row.tranches || {});
        return trancheNames.length > 0 ? (
          <span className="text-sm">{trancheNames.join(", ")}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Aucune tranche</span>
        );
      },
    },
    {
      key: "montants",
      label: "Montants",
      align: "left",
      render: (value, row) => {
        const tranchesObj = row.tranches || {};
        const montants = Object.values(tranchesObj).map((data: any) => data.amount);
        return montants.length > 0 ? (
          <span className="font-medium">
            {montants
              .map((amount) => `${amount.toLocaleString("fr-FR")} XAF`)
              .join(", ")}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
  ];

  // Colonnes détaillées (une ligne par tranche avec ID)
  const detailedColumns = [
    {
      key: "level",
      label: "Niveau",
      align: "left",
      render: (value, row) => (
        <span className="font-medium text-lg">Niveau {row.level ?? "Non défini"}</span>
      ),
    },
    {
      key: "tranches",
      label: "Détails des Tranches",
      align: "left",
      render: (value, row) => {
        const tranchesObj = row.tranches || {};
        const trancheEntries = Object.entries(tranchesObj);
        
        return trancheEntries.length > 0 ? (
          <div className="space-y-2 py-2">
            {trancheEntries.map(([trancheName, data]: [string, any]) => (
              <div key={data.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                  {trancheName}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0,
                  }).format(data.amount)}
                </span>
              
              </div>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Aucune tranche</span>
        );
      },
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (value, row) => {
        const tranchesObj = row.tranches || {};
        const total = Object.values(tranchesObj).reduce(
          (sum: number, data: any) => sum + (data.amount || 0),
          0
        );
        
        return (
          <span className="font-bold text-lg text-primary">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XAF',
              minimumFractionDigits: 0,
            }).format(total)}
          </span>
        );
      },
    },
  ];

  // Choisir les colonnes selon le mode d'affichage
  const columns = showLevels ? detailedColumns : compactColumns;

  const fetchLevels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getLevelsWithTranches(Number(school_id));
      console.log("Levels with tranches:", response);
      
      // Extraction des données selon le format imbriqué
      const extractedData = response?.data?.data || response?.data || response || [];
      setLevelsData(extractedData);
    } catch (e) {
      setError("Impossible de charger les tranches.");
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, [school_id]);

  const totalAmount = tranches.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestion des Tranches</h2>

      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Plus size={20} className="mr-2" /> Ajouter une tranche
        </Button>

        <Button
          onClick={() => setShowAssociateLevelTrancheForm(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Plus size={20} className="mr-2" /> Associer un niveau à une tranche
        </Button>

        <button
          onClick={() => setShowLevels((prev) => !prev)}
          className="flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Table className="mr-2" size={18} /> 
          {showLevels ? "Affichage compact" : "Affichage détaillé"}
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              {showLevels ? "Vue détaillée par niveau" : "Liste des tranches"}
            </h3>
            {!isLoading && (
              <>
                <p className="text-sm text-muted-foreground">
                  {levelsData.length} niveau{levelsData.length > 1 ? "x" : ""}
                </p>
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : error ? (
          <div className="p-8 text-center text-destructive">{error}</div>
        ) : levelsData.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune tranche
          </div>
        ) : (
          <DataTable columns={columns} data={levelsData} />
        )}
      </div>

      <TrancheCreationForm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          fetchLevels();
        }}
      />
      <AssociateLevelTrancheForm
        isOpen={showAssociateLevelTrancheForm}
        onCancel={() => setShowAssociateLevelTrancheForm(false)}
        onSuccess={() => {
          setShowAssociateLevelTrancheForm(false);
          fetchLevels();
        }}
      />
    </div>
  );
};