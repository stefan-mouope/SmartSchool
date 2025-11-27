import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/components/shared/FormField";
import { useAuthStore } from "@/store/authStore";
import { createMatter } from "@/api/registration-service/matter.api";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const SubjectCreationForm: React.FC<Props> = ({
  isOpen,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  // Use the useToast hook
  const { toast } = useToast();
  const school_id = useAuthStore(state => state.school_id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Le nom de la matière est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await createMatter(school_id, formData.name);
      
      // Show success toast
      toast({
        title: "✓ Succès",
        description: "Matière ajoutée avec succès !",
        className: "bg-green-50 border-green-200 text-green-900",
      });
      
      onSuccess();
      setFormData({ name: "" });
    } catch (err) {
      console.error("Erreur création matière:", err);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "✗ Erreur",
        description: "Erreur lors de l'ajout de la matière",
        className: "bg-red-50 border-red-200 text-red-900",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une matière</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <FormField label="Nom de la matière" error={errors.name}>
            <Input
              name="name"
              placeholder="Ex: Mathématiques"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>
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