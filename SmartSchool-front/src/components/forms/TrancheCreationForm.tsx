import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/components/shared/FormField";
import { useAuthStore } from "@/store/authStore";
import { createTranche } from "@/api/tranche.api";
import { createClassRoomTranche } from "@/api/classroom-tranche.api";
import { getLevelsWithTranches } from "@/api/registration-service/classroom.api";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const TrancheCreationForm: React.FC<Props> = ({
  isOpen,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    tranche_name: "",
    amount: "",
  });
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [levelAmounts, setLevelAmounts] = useState<Record<number, string>>({});
  const [levels, setLevels] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  const { toast } = useToast();
  const school_id = useAuthStore(state => state.school_id);

  useEffect(() => {
    if (isOpen) {
      loadLevels();
    }
  }, [isOpen]);

  const loadLevels = async () => {
    try {
      const response = await getLevelsWithTranches(Number(school_id));
      const extractedData = response?.data?.data || response?.data || response || [];
      
      // Filtrer les niveaux valides (non null)
      const validLevels = extractedData.filter((item: any) => item.level !== null);
      setLevels(validLevels);
    } catch (error) {
      console.error("Erreur lors du chargement des niveaux:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "amount") {
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLevelToggle = (level: number) => {
    setSelectedLevels(prev => {
      if (prev.includes(level)) {
        // Retirer le niveau
        const newLevels = prev.filter(l => l !== level);
        const newAmounts = { ...levelAmounts };
        delete newAmounts[level];
        setLevelAmounts(newAmounts);
        return newLevels;
      } else {
        // Ajouter le niveau avec le montant par défaut
        setLevelAmounts(prev => ({
          ...prev,
          [level]: formData.amount || "0"
        }));
        return [...prev, level];
      }
    });
  };

  const handleLevelAmountChange = (level: number, value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    setLevelAmounts(prev => ({
      ...prev,
      [level]: numericValue
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.tranche_name.trim()) {
      newErrors.tranche_name = "Le nom de la tranche est requis";
    }
    
    if (!formData.amount.trim()) {
      newErrors.amount = "Le montant par défaut est requis";
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Le montant doit être supérieur à 0";
    }

    // Vérifier que tous les niveaux sélectionnés ont un montant valide
    selectedLevels.forEach(level => {
      const amount = levelAmounts[level];
      if (!amount || parseFloat(amount) <= 0) {
        newErrors[`level_${level}`] = "Montant invalide";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      // 1. Créer la tranche principale
      const tranchePayload = {
        tranche_name: formData.tranche_name,
        amount: parseFloat(formData.amount),
        school_id: school_id,
      };
      
      const createdTranche = await createTranche(tranchePayload);
      
      // 2. Créer les associations avec les niveaux (classrooms)
      if (selectedLevels.length > 0) {
        const promises = selectedLevels.map(level => {
          const levelData = levels.find(l => l.level === level);
          if (levelData?.classRoom_id) {
            return createClassRoomTranche({
              classRoom_id: levelData.classRoom_id,
              tranche_id: createdTranche.id,
              amount: parseFloat(levelAmounts[level] || formData.amount)
            });
          }
          return Promise.resolve();
        });

        await Promise.all(promises);
      }
      
      toast({
        title: "✓ Succès",
        description: `Tranche créée avec succès${selectedLevels.length > 0 ? ` et associée à ${selectedLevels.length} niveau(x)` : ''}`,
        className: "bg-green-50 border-green-200 text-green-900",
      });
      
      onSuccess();
      // Reset form
      setFormData({ tranche_name: "", amount: "" });
      setSelectedLevels([]);
      setLevelAmounts({});
      setErrors({});
    } catch (err) {
      console.error("Erreur création tranche:", err);
      
      toast({
        variant: "destructive",
        title: "✗ Erreur",
        description: "Erreur lors de l'ajout de la tranche",
        className: "bg-red-50 border-red-200 text-red-900",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une tranche</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <FormField label="Nom de la tranche" error={errors.tranche_name}>
            <Input
              name="tranche_name"
              placeholder="Ex: Première tranche, Tranche 1"
              value={formData.tranche_name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Montant par défaut (FCFA)" error={errors.amount}>
            <Input
              name="amount"
              type="text"
              placeholder="Ex: 50000"
              value={formData.amount}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          {/* Sélection des niveaux */}
          <div className="border rounded-lg p-4 space-y-3">
            <label className="font-medium text-sm">
              Associer aux niveaux (optionnel)
            </label>
            <p className="text-xs text-muted-foreground">
              Vous pouvez définir des montants différents par niveau
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {levels.map((levelData) => (
                <div key={levelData.level} className="flex items-start gap-3 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(levelData.level)}
                    onChange={() => handleLevelToggle(levelData.level)}
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label className="font-medium text-sm">
                      Niveau {levelData.level}
                    </label>
                    {selectedLevels.includes(levelData.level) && (
                      <Input
                        type="text"
                        placeholder="Montant pour ce niveau"
                        value={levelAmounts[levelData.level] || ""}
                        onChange={(e) => handleLevelAmountChange(levelData.level, e.target.value)}
                        disabled={isSubmitting}
                        className="mt-2"
                      />
                    )}
                    {errors[`level_${levelData.level}`] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[`level_${levelData.level}`]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Patientez..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};