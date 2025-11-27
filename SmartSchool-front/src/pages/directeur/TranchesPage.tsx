// import React, { useEffect, useState } from "react";
// import { Plus } from "lucide-react";
// import { DataTable } from "@/components/shared/DataTable";
// import { TableSkeleton } from "@/components/shared/SkeletonLoading";
// import { TrancheResult, getTranchesBySchool } from "@/api/tranche.api";
// import { TrancheCreationForm } from "@/components/forms/TrancheCreationForm";
// import { useAuthStore } from "@/store/authStore";

// export const TranchesPage: React.FC = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [tranches, setTranches] = useState<TrancheResult[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   const school_id = useAuthStore(state => state.school_id);

//   const columns = [
//     {
//       key: "tranche_name",
//       label: "Nom de la tranche",
//       align: "left" as const,
//       render: (value: string, row: TrancheResult) => (
//         <span className="font-medium">{row.tranche_name}</span>
//       ),
//     },
//     {
//       key: "amount",
//       label: "Montant",
//       align: "right" as const,
//       render: (value: number, row: TrancheResult) => (
//         <span className="font-semibold text-primary">
//           {new Intl.NumberFormat('fr-FR', {
//             style: 'currency',
//             currency: 'XOF',
//             minimumFractionDigits: 0,
//           }).format(row.amount)}
//         </span>
//       ),
//     },
//     {
//       key: "created_at",
//       label: "Date de création",
//       align: "left" as const,
//       render: (value: string, row: TrancheResult) => (
//         <span className="text-muted-foreground">
//           {row.created_at 
//             ? new Date(row.created_at).toLocaleDateString('fr-FR', {
//                 day: '2-digit',
//                 month: 'long',
//                 year: 'numeric'
//               })
//             : "—"
//           }
//         </span>
//       ),
//     },
//   ];

//   const fetchTranches = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const data = await getTranchesBySchool(Number(school_id));
//       setTranches(data);
//     } catch (error) {
//       console.error("Erreur lors du chargement des tranches:", error);
//       setError("Impossible de charger les tranches. Veuillez réessayer.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTranches();
//   }, [school_id]);

//   // Calculer le total des montants
//   const totalAmount = tranches.reduce((sum, tranche) => sum + tranche.amount, 0);

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-foreground mb-6">
//         Gestion des Tranches de Paiement
//       </h2>

//       <div className="bg-card rounded-lg shadow-md">
//         <div className="p-6 border-b border-border flex justify-between items-center">
//           <div>
//             <h3 className="text-lg font-semibold text-card-foreground">
//               Liste des tranches
//             </h3>
//             {!isLoading && (
//               <div className="mt-1 space-y-1">
//                 <p className="text-sm text-muted-foreground">
//                   {tranches.length} tranche{tranches.length > 1 ? "s" : ""} enregistrée{tranches.length > 1 ? "s" : ""}
//                 </p>
//                 {tranches.length > 0 && (
//                   <p className="text-sm font-medium text-primary">
//                     Total: {new Intl.NumberFormat('fr-FR', {
//                       style: 'currency',
//                       currency: 'XOF',
//                       minimumFractionDigits: 0,
//                     }).format(totalAmount)}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//           <button
//             onClick={() => setShowModal(true)}
//             className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
//           >
//             <Plus size={20} className="mr-2" />
//             Ajouter une tranche
//           </button>
//         </div>

//         {isLoading ? (
//           <TableSkeleton rows={5} columns={3} />
//         ) : error ? (
//           <div className="p-8 text-center text-destructive">{error}</div>
//         ) : tranches.length === 0 ? (
//           <div className="p-8 text-center text-muted-foreground">
//             <p className="text-lg font-medium mb-2">Aucune tranche enregistrée</p>
//             <p className="text-sm">Commencez par ajouter une première tranche de paiement</p>
//           </div>
//         ) : (
//           <DataTable columns={columns} data={tranches} />
//         )}
//       </div>

//       <TrancheCreationForm
//         isOpen={showModal}
//         onCancel={() => setShowModal(false)}
//         onSuccess={() => {
//           setShowModal(false);
//           fetchTranches();
//         }}
//       />
//     </div>
//   );
// };

// Extended TranchesPage with button + modal for editing tranche amounts per level
// (Structure only — ready for customization)

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

  const columns = [
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
        const trancheNames = Object.keys(row.tranches);
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
        const montants = Object.values(row.tranches);
        return montants.length > 0 ? (
          <span className="font-medium">
            {montants
              .map((amount) => `${amount.toLocaleString("fr-FR")} XOF`)
              .join(", ")}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
  ];

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
          className="flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg"
        >
          <Table className="mr-2" size={18} /> Voir tranches par niveau
        </button>

        {/* <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center px-4 py-2 bg-primary/80 text-white rounded-lg"
        >
          Modifier les montants par niveau
        </button> */}
      </div>

      {showLevels && <LevelsTranchesTable data={levelsData} />}

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Liste des tranches</h3>
            {!isLoading && (
              <>
                <p className="text-sm text-muted-foreground">
                  {levelsData.length} niveau(x)
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

      {/* <EditTrancheByLevelModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        levelsData={levelsData}
        onRefresh={fetchLevels}
      /> */}
    </div>
  );
};