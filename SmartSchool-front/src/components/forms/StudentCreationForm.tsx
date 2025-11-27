import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/FormField";
import { useAuthStore } from "@/store/authStore";
import { createInscription } from "@/api/inscription";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  classrooms: any[];
  academieYearId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export const StudentCreationForm: React.FC<Props> = ({
  isOpen,
  classrooms,
  academieYearId,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    birth_date: "",
    adress: "",
    sex: "",
    phone_parent: "",
    classRoom_id: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const school_id = useAuthStore((state) => state.school_id);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.last_name.trim()) newErrors.last_name = "Le nom est requis";
    if (!formData.first_name.trim()) newErrors.first_name = "Le prénom est requis";
    if (!formData.classRoom_id) newErrors.classRoom_id = "La classe est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        student: {
          last_name: formData.last_name,
          first_name: formData.first_name,
          birth_date: formData.birth_date,
          adress: formData.adress,
          sex: formData.sex,
          phone_parent: formData.phone_parent,
          school_id: school_id,
        },
        academieYear_id: academieYearId,
        classRoom_id: Number(formData.classRoom_id),
      };

      await createInscription(payload);

      toast({
        title: "✓ Succès",
        description: "Élève inscrit avec succès !",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      onSuccess();
      setFormData({
        last_name: "",
        first_name: "",
        birth_date: "",
        adress: "",
        sex: "",
        phone_parent: "",
        classRoom_id: "",
      });
    } catch (err) {
      console.error("Erreur inscription élève:", err);
      toast({
        variant: "destructive",
        title: "✗ Erreur",
        description: "Erreur lors de l'inscription",
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
          <DialogTitle>Inscrire un nouvel élève</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <FormField label="Nom" error={errors.last_name}>
            <Input
              name="last_name"
              placeholder="Ex: Dupont"
              value={formData.last_name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Prénom" error={errors.first_name}>
            <Input
              name="first_name"
              placeholder="Ex: Jean"
              value={formData.first_name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Date de naissance">
            <Input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Adresse">
            <Input
              name="adress"
              placeholder="Ex:Bonas"
              value={formData.adress}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Sexe">
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              disabled={isSubmitting}
            >
              <option value="">Sélectionner</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </FormField>

          <FormField label="Téléphone parent">
            <Input
              name="phone_parent"
              placeholder="Ex: 673764789"
              value={formData.phone_parent}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Classe" error={errors.classRoom_id}>
            <select
              name="classRoom_id"
              value={formData.classRoom_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              disabled={isSubmitting}
            >
              <option value="">Sélectionner une classe</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Patientez..." : "Inscrire"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
