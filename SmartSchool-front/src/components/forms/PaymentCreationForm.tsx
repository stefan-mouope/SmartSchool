import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/components/shared/FormField";
import { useAuthStore } from "@/store/authStore";
import { createPayment } from "@/api/payment.api";
import { getTranchesBySchool, TrancheResult } from "@/api/tranche.api";
import { InscriptionResult } from "@/api/inscription";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  preselectedInscription: InscriptionResult;
  tranchesPaid?: number[];
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
  const [tranches, setTranches] = useState<TrancheResult[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { toast } = useToast();
  const school_id = useAuthStore((state) => state.school_id);

  // --------------------------- LOAD DATA ------------------------------
  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const tranchesData = await getTranchesBySchool(school_id);
      setTranches(tranchesData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les tranches",
      });
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

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------- FILTRAGE DES TRANCHES ------------------------------
  const availableTranches = tranches.filter(
    (t) => !tranchesPaid.includes(t.id)
  );

  const selectedTranche = tranches.find(
    (t) => t.id === Number(formData.tranche_id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Paiement de {preselectedInscription?.Student?.first_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          
          {/* Select tranche */}
          <FormField label="Tranche" error={errors.tranche_id}>
            <select
              name="tranche_id"
              value={formData.tranche_id}
              onChange={handleChange}
              disabled={isSubmitting || isLoadingData}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Sélectionner une tranche</option>
              {availableTranches.length === 0 ? (
                <option value="" disabled>Aucune tranche disponible</option>
              ) : (
                availableTranches.map((tranche) => (
                  <option key={tranche.id} value={tranche.id}>
                    {tranche.tranche_name} - 
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                      minimumFractionDigits: 0,
                    }).format(tranche.amount)}
                  </option>
                ))
              )}
            </select>
          </FormField>

          {selectedTranche && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm font-medium">
                Montant attendu :{" "}
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "XOF",
                  minimumFractionDigits: 0,
                }).format(selectedTranche.amount)}
              </p>
            </div>
          )}

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
