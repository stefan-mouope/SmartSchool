import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClassroom } from "@/api/registration-service/classroom.api";
import { FormField } from "../shared/FormField";
import { useAuthStore } from "@/store/authStore";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ClassroomCreationForm: React.FC<Props> = ({
  isOpen,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    level: "", // nouveau champ
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const school_id = useAuthStore(state => state.school_id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Le nom de la classe est requis";
    if (!formData.level) newErrors.level = "Le niveau de la classe est requis";
    else if (!(parseInt(formData.level) >= 1 && parseInt(formData.level) <= 6))
      newErrors.level = "Le niveau doit être entre 1 et 6";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await createClassroom(
        school_id,
        formData.name,
        parseInt(formData.level),
       
      );
      onSuccess();
      setFormData({ name: "", level: "" });
    } catch (err) {
      console.error("Erreur création classe:", err);
      alert("Erreur lors de l'ajout de la classe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une classe</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <FormField label="Nom de la classe" error={errors.name}>
            <Input
              name="name"
              placeholder="Ex: 6ème A"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Niveau de la classe" error={errors.level}>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Sélectionner le niveau</option>
              {[1, 2, 3, 4, 5, 6].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
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
