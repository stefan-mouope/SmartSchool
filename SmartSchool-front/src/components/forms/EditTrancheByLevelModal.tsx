import React, { useEffect, useState } from "react";
import { getLevelsWithTranches } from "@/api/registration-service/classroom.api";
import { getTranchesBySchool } from "@/api/tranche.api";
import { 
  createClassRoomTranche, 
  updateClassRoomTranche,
  getClassRoomTranchesByClassRoom 
} from "@/api/classroom-tranche.api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";

interface EditTrancheByLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelsData: any[];
  onRefresh: () => void;
}

export const EditTrancheByLevelModal: React.FC<EditTrancheByLevelModalProps> = ({ 
  isOpen, 
  onClose, 
  levelsData,
  onRefresh 
}) => {
  const school_id = useAuthStore(state => state.school_id);
  const { toast } = useToast();

  const [tranches, setTranches] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [existingAssociations, setExistingAssociations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTranches();
    }
  }, [isOpen]);

  const loadTranches = async () => {
    try {
      setIsLoading(true);
      const tr = await getTranchesBySchool(Number(school_id));
      setTranches(tr);
    } catch (error) {
      console.error("Erreur lors du chargement des tranches:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les tranches",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelChange = async (level: string) => {
    const levelNum = level === "" ? null : Number(level);
    setSelectedLevel(levelNum);

    if (levelNum !== null) {
      const levelData = levelsData.find((item: any) => item.level === levelNum);
      
      if (!levelData?.classRoom_id) {
        setFormValues({});
        return;
      }

      try {
        // Charger les associations existantes pour ce classroom
        const associations = await getClassRoomTranchesByClassRoom(levelData.classRoom_id);
        
        // Créer un map des associations existantes
        const associationsMap: Record<string, any> = {};
        associations.forEach((assoc: any) => {
          const tranche = tranches.find(t => t.id === assoc.tranche_id);
          if (tranche) {
            associationsMap[tranche.tranche_name] = assoc;
          }
        });
        
        setExistingAssociations(associationsMap);

        // Créer un objet avec toutes les tranches disponibles
        const matched = tranches.reduce((acc: any, tranche: any) => {
          const existingAssoc = associationsMap[tranche.tranche_name];
          acc[tranche.tranche_name] = existingAssoc ? existingAssoc.amount : 0;
          return acc;
        }, {});
        
        setFormValues(matched);
      } catch (error) {
        console.error("Erreur lors du chargement des associations:", error);
        
        // Fallback: utiliser les données de levelsData
        const matched = tranches.reduce((acc: any, tranche: any) => {
          const existingAmount = levelData?.tranches?.[tranche.tranche_name] || 0;
          acc[tranche.tranche_name] = existingAmount;
          return acc;
        }, {});
        
        setFormValues(matched);
        setExistingAssociations({});
      }
    } else {
      setFormValues({});
      setExistingAssociations({});
    }
  };

  const handleChangeAmount = (key: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setFormValues({ ...formValues, [key]: numValue });
  };

  const handleSubmit = async () => {
    if (selectedLevel === null) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un niveau",
      });
      return;
    }

    const levelData = levelsData.find((item: any) => item.level === selectedLevel);
    
    if (!levelData?.classRoom_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "ClassRoom ID introuvable pour ce niveau",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Pour chaque tranche, créer ou mettre à jour l'association
      const promises = Object.entries(formValues).map(async ([trancheName, amount]) => {
        const tranche = tranches.find(t => t.tranche_name === trancheName);
        
        if (!tranche) return;

        const existingAssoc = existingAssociations[trancheName];

        if (existingAssoc) {
          // Mise à jour si le montant a changé
          if (existingAssoc.amount !== amount) {
            await updateClassRoomTranche(existingAssoc.id, {
              amount: Number(amount)
            });
          }
        } else if (amount > 0) {
          // Création seulement si le montant est > 0
          await createClassRoomTranche({
            classRoom_id: levelData.classRoom_id,
            tranche_id: tranche.id,
            amount: Number(amount)
          });
        }
      });

      await Promise.all(promises);

      toast({
        title: "✓ Succès",
        description: "Les montants ont été mis à jour avec succès",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      onRefresh();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        variant: "destructive",
        title: "✗ Erreur",
        description: "Erreur lors de la mise à jour des montants",
        className: "bg-red-50 border-red-200 text-red-900",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Extraire les niveaux uniques
  const uniqueLevels = Array.from(
    new Set(levelsData.map((item: any) => item.level).filter((lvl) => lvl !== null))
  ).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-xl shadow-xl w-[500px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Définir les montants par niveau</h2>

        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Chargement...</div>
        ) : (
          <>
            {/* Sélecteur de niveau */}
            <label className="text-sm font-medium block mb-2">Sélectionner un niveau</label>
            <select
              className="w-full p-2 border rounded-lg mb-4"
              value={selectedLevel ?? ""}
              onChange={(e) => handleLevelChange(e.target.value)}
              disabled={isSaving}
            >
              <option value="">Choisir un niveau</option>
              {uniqueLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Niveau {lvl}
                </option>
              ))}
            </select>

            {/* Champs des tranches */}
            {selectedLevel !== null && Object.keys(formValues).length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Définir les montants pour chaque tranche
                </p>
                {Object.entries(formValues).map(([name, amount]) => (
                  <div key={name} className="flex flex-col">
                    <label className="font-medium text-sm mb-1">
                      {name}
                      {existingAssociations[name] && (
                        <span className="text-xs text-green-600 ml-2">(existant)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      className="p-2 border rounded-lg"
                      value={amount}
                      min="0"
                      step="1000"
                      placeholder="Montant en XOF"
                      onChange={(e) => handleChangeAmount(name, e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedLevel !== null && Object.keys(formValues).length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Aucune tranche disponible
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedLevel === null || Object.keys(formValues).length === 0 || isSaving}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};