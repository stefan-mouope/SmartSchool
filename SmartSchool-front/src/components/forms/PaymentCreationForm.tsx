import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/components/shared/FormField";
import { useAuthStore } from "@/store/authStore";
import { createPayment } from "@/api/payment.api";
import { InscriptionResult } from "@/api/inscription";
import { getClassroomById, getLevelsWithTranches } from "@/api/registration-service/classroom.api";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  preselectedInscription: InscriptionResult;
  tranchesPaid?: number[];
}

interface TrancheOption {
  id: number;
  tranche_name: string;
  amount: number;
}

export const PaymentCreationForm: React.FC<Props> = ({
  isOpen,
  onCancel,
  onSuccess,
  preselectedInscription,
  tranchesPaid = [],
}) => {

  const [formData, setFormData] = useState({
    tranche_id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [availableTranches, setAvailableTranches] = useState<TrancheOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { toast } = useToast();
  const school_id = useAuthStore((state) => state.school_id);

  // --------------------------- LOAD DATA ------------------------------
  useEffect(() => {
    if (isOpen && preselectedInscription) {
      loadData();
    }
  }, [isOpen, preselectedInscription]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      
      console.log("📊 Chargement des tranches pour l'inscription:", preselectedInscription);
      
      // Récupérer les tranches par niveau
      const levelsWithTranches = await getLevelsWithTranches(Number(school_id));
      console.log("📦 Données reçues:", levelsWithTranches);
      
      // Récupérer la classe de l'inscription pour obtenir le niveau
      const classRoom = await getClassroomById(preselectedInscription.classRoom_id);
      const studentLevel = classRoom.level;
      
      console.log("🎓 Niveau de l'étudiant:", studentLevel);

      // Trouver les tranches du niveau de l'étudiant
      const studentLevelData = levelsWithTranches.data.data.find(
        (levelData: any) => levelData.level === studentLevel
      );

      console.log("📋 Données du niveau trouvées:", studentLevelData);

      if (studentLevelData && studentLevelData.tranches) {
        // Convertir l'objet tranches en tableau
        // Format attendu: { tranche1: {id: 10, amount: 5000}, tranche2: {id: 11, amount: 2000} }
        const tranchesArray: TrancheOption[] = Object.entries(studentLevelData.tranches).map(
          ([trancheName, data]: [string, any]) => ({
            id: data.id,
            tranche_name: trancheName.charAt(0).toUpperCase() + trancheName.slice(1).replace(/([0-9]+)/, ' $1'),
            amount: data.amount,
          })
        );

        console.log("✅ Tranches converties:", tranchesArray);
        console.log("🚫 Tranches déjà payées:", tranchesPaid);

        // Filtrer les tranches non payées (comparer avec les IDs)
        const unpaidTranches = tranchesArray.filter(
          (tranche) => !tranchesPaid.includes(tranche.id)
        );

        console.log("💰 Tranches disponibles:", unpaidTranches);

        setAvailableTranches(unpaidTranches);
      } else {
        console.warn("⚠️ Aucune tranche trouvée pour ce niveau");
        setAvailableTranches([]);
      }

    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les tranches",
      });
      setAvailableTranches([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // --------------------------- HANDLE CHANGE ------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Réinitialiser l'erreur quand l'utilisateur sélectionne une valeur
    if (value && errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // --------------------------- VALIDATION ------------------------------
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.tranche_id) {
      newErrors.tranche_id = "La tranche est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --------------------------- SUBMIT ------------------------------
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      console.log("💳 Création du paiement:", {
        inscription_id: preselectedInscription.id,
        tranche_id: Number(formData.tranche_id)
      });

      await createPayment(
        preselectedInscription.id,
        Number(formData.tranche_id)
      );

      toast({
        title: "Succès",
        description: "Paiement enregistré avec succès",
      });

      onSuccess();
      setFormData({ tranche_id: "" });
      setErrors({});

    } catch (error: any) {
      console.error("❌ Erreur lors de l'enregistrement du paiement:", error.response.data['message']);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response.data['message'] || "Impossible d'enregistrer le paiement",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trouver la tranche sélectionnée
  const selectedTranche = availableTranches.find(
    (t) => t.id === Number(formData.tranche_id)
  );

  // Réinitialiser le formulaire lors de la fermeture
  const handleCancel = () => {
    setFormData({ tranche_id: "" });
    setErrors({});
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Paiement de {preselectedInscription?.Student?.first_name} {preselectedInscription?.Student?.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          
          {/* Affichage du matricule */}
          <div className="bg-gray-50 border rounded-md p-3">
            <p className="text-sm">
              <span className="font-medium">Matricule:</span> {preselectedInscription?.Student?.matricule}
            </p>
          </div>

          {/* Select tranche */}
          <FormField label="Tranche à payer" error={errors.tranche_id}>
            <select
              name="tranche_id"
              value={formData.tranche_id}
              onChange={handleChange}
              disabled={isSubmitting || isLoadingData}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sélectionner une tranche</option>
              {isLoadingData ? (
                <option value="" disabled>Chargement...</option>
              ) : availableTranches.length === 0 ? (
                <option value="" disabled>Toutes les tranches sont payées</option>
              ) : (
                availableTranches.map((tranche) => (
                  <option key={tranche.id} value={tranche.id}>
                    {tranche.tranche_name} - 
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XAF",
                      minimumFractionDigits: 0,
                    }).format(tranche.amount)}
                  </option>
                ))
              )}
            </select>
          </FormField>

          {/* Affichage du montant sélectionné */}
          {selectedTranche && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm font-medium text-blue-900">
                Montant à payer :{" "}
                <span className="text-base font-bold">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "XAF",
                    minimumFractionDigits: 0,
                  }).format(selectedTranche.amount)}
                </span>
              </p>
            </div>
          )}

          {/* Messages d'information */}
          {!isLoadingData && availableTranches.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                ✅ Toutes les tranches ont été payées pour cet étudiant.
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || availableTranches.length === 0 || !formData.tranche_id}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer le paiement"}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};