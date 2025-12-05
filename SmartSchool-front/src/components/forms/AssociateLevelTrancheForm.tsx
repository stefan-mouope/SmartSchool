import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/components/shared/FormField";
import { useAuthStore } from "@/store/authStore";
import { getTranchesBySchool } from "@/api/tranche.api";
import { getLevelsWithTranches } from "@/api/registration-service/classroom.api";
import { api, BASE_INSCRIPTION_SERVICE } from "@/api/axios";

interface AssociateLevelTrancheFormProps {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AssociateLevelTrancheForm: React.FC<AssociateLevelTrancheFormProps> = ({
  isOpen,
  onCancel,
  onSuccess,
}) => {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [levels, setLevels] = useState<any[]>([]);
  const [tranches, setTranches] = useState<any[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  const { toast } = useToast();
  const school_id = useAuthStore(state => state.school_id);

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const levelsResponse = await getLevelsWithTranches(Number(school_id));
      const extractedLevels = levelsResponse?.data?.data || levelsResponse?.data || [];
      const validLevels = extractedLevels.filter((item: any) => item.level !== null);
      setLevels(validLevels);

      const tranchesData = await getTranchesBySchool(Number(school_id));
      setTranches(tranchesData);

      // reset
      setSelectedLevel("");
      setAmounts({});
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueLevels = Array.from(new Set(levels.map((i) => i.level))).sort((a, b) => a - b);

  const handleAmountChange = (trancheId: number, value: string) => {
    const numeric = value.replace(/[^0-9]/g, "");
    setAmounts((prev) => ({ ...prev, [trancheId]: numeric }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!selectedLevel) {
      newErrors.level = "Veuillez sélectionner un niveau";
    }

    const invalid = Object.keys(amounts).some(
      (key) => !amounts[Number(key)] || Number(amounts[Number(key)]) <= 0
    );

    if (invalid) newErrors.amounts = "Tous les montants doivent être remplis et > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        level: Number(selectedLevel),
        tranches: Object.keys(amounts).map((id) => ({
          tranche_id: Number(id),
          amount: Number(amounts[Number(id)]),
        })),
      };

      await api.post(
        `${BASE_INSCRIPTION_SERVICE}/api/classroom-tranches/${school_id}`,
        payload
      );

      toast({
        title: "✓ Succès",
        description: `Les montants des tranches ont été mis à jour pour le niveau ${selectedLevel}`,
        className: "bg-green-50 border-green-200 text-green-900",
      });

      onSuccess();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.response?.data?.message || "Échec de l'enregistrement",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------
  // UTILITAIRES POUR FILTRER LES TRANCHES
  // ---------------------------------
const getUsedTrancheIds = (level: number) => {
  const found = levels.find((l) => l.level === level);
  if (!found || !found.tranches) return [];
  // Object.values pour récupérer les objets {id, amount}, puis map sur id
  return Object.values(found.tranches).map((tranche: any) => tranche.id);
};

const availableTranches = selectedLevel
  ? tranches.filter((t) => {
      const used = getUsedTrancheIds(Number(selectedLevel));
      return !used.includes(t.id);
    })
  : tranches;

  // ---------------------------------
  // RENDU
  // ---------------------------------
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Définir les montants par niveau</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-6 text-muted-foreground">Chargement...</p>
        ) : (
          <div className="space-y-4">
            <FormField label="Niveau" error={errors.level}>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-2 border rounded-lg bg-background"
              >
                <option value="">Sélectionner un niveau</option>
                {uniqueLevels.map((level) => (
                  <option key={level} value={level}>
                    Niveau {level}
                  </option>
                ))}
              </select>
            </FormField>

            {selectedLevel && availableTranches.length > 0 && (
              <div className="space-y-3">
                <p className="font-medium">Montants des tranches pour ce niveau :</p>

                {availableTranches.map((t) => (
                  <FormField key={t.id} label={t.tranche_name} error={errors.amounts}>
                    <Input
                      type="text"
                      value={amounts[t.id] || ""}
                      onChange={(e) => handleAmountChange(t.id, e.target.value)}
                      placeholder="Ex: 50000"
                    />
                  </FormField>
                ))}
              </div>
            )}

            {selectedLevel && availableTranches.length === 0 && (
              <p className="text-muted-foreground">
                Toutes les tranches pour ce niveau ont déjà été définies.
              </p>
            )}

            {errors.amounts && (
              <p className="text-red-500 text-sm">{errors.amounts}</p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !selectedLevel}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
