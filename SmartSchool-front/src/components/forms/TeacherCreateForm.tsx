import React, { useState, useEffect } from 'react';
import { User, Lock, Calendar, Users, Building2, X, Check, CheckCircle } from 'lucide-react';
import { getAllSchools } from '@/api/registration-service/school.api';
import { createTeacher, TeacherCreateDTO } from '@/api/registration-service/teache.api';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// ----------------------
// SELECT COMPONENT
// ----------------------
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => (
    <select
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
      ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
      focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

// ----------------------
// FORM FIELD
// ----------------------
interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, error, children, icon: Icon }) => (
  <div className="space-y-2">
    {label && (
      <Label>
        {label} {required && <span className="text-destructive ml-1">*</span>}
      </Label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={20} className="text-muted-foreground" />
        </div>
      )}
      {children}
    </div>
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

// ----------------------
// MODAL
// ----------------------
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

// ----------------------
// MAIN FORM COMPONENT
// ----------------------
interface TeacherCreationFormProps {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const TeacherCreationForm: React.FC<TeacherCreationFormProps> = ({ isOpen, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState<TeacherCreateDTO & { confirmPassword: string }>({
    school_id: 0,
    last_name: '',
    first_name: '',
    password: '',
    birth_date: '',
    sex: '',
    confirmPassword: '',
  });

  const [schools, setSchools] = useState<any[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSchools();
      resetForm();
    }
  }, [isOpen]);

  const loadSchools = async () => {
    try {
      setIsLoadingSchools(true);
      const data = await getAllSchools();
      setSchools(data);
    } catch {
      setErrors({ school_id: 'Impossible de charger les écoles' });
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const resetForm = () => {
    setFormData({
      school_id: 0,
      last_name: '',
      first_name: '',
      password: '',
      confirmPassword: '',
      birth_date: '',
      sex: '',
    });
    setErrors({});
    setSubmitSuccess(false);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'school_id' ? Number(value) : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.school_id) newErrors.school_id = 'Veuillez sélectionner un établissement';
    if (!formData.last_name.trim()) newErrors.last_name = 'Nom requis';
    if (!formData.first_name.trim()) newErrors.first_name = 'Prénom requis';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (formData.password.length < 8) newErrors.password = 'Minimum 8 caractères';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!formData.birth_date) newErrors.birth_date = 'Date de naissance requise';
    if (!formData.sex) newErrors.sex = 'Veuillez choisir le sexe';
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      await createTeacher(dataToSend);
      setSubmitSuccess(true);
      setTimeout(() => onSuccess?.(), 1500);
    } catch {
      setErrors({ submit: "Erreur lors de la création de l'enseignant" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      {/* HEADER */}
      <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Créer un enseignant</h2>
            <p className="text-muted-foreground text-sm">Ajouter un nouvel enseignant à un établissement</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={20} />
        </Button>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {submitSuccess && (
          <Alert variant="success" className="mb-6" icon={CheckCircle}>
            Enseignant créé avec succès !
          </Alert>
        )}

        {errors.submit && (
          <Alert variant="destructive" className="mb-6">
            {errors.submit}
          </Alert>
        )}

        <div className="space-y-6">
          {/* SCHOOL */}
          <FormField label="Établissement" required error={errors.school_id} icon={Building2}>
            <Select name="school_id" value={formData.school_id} onChange={handleChange} disabled={isLoadingSchools || isSubmitting} className="pl-10">
              <option value={0}>Sélectionner...</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} - {school.city}
                </option>
              ))}
            </Select>
          </FormField>

          {/* NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Nom" required error={errors.last_name} icon={User}>
              <Input name="last_name" value={formData.last_name} onChange={handleChange} className="pl-10" />
            </FormField>
            <FormField label="Prénom" required error={errors.first_name} icon={User}>
              <Input name="first_name" value={formData.first_name} onChange={handleChange} className="pl-10" />
            </FormField>
          </div>

          {/* PASSWORDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Mot de passe" required error={errors.password} icon={Lock}>
              <Input name="password" type="password" value={formData.password} onChange={handleChange} className="pl-10" />
            </FormField>
            <FormField label="Confirmer" required error={errors.confirmPassword} icon={Lock}>
              <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="pl-10" />
            </FormField>
          </div>

          {/* DATE + SEX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Date de naissance" required error={errors.birth_date} icon={Calendar}>
              <Input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} className="pl-10" />
            </FormField>
            <FormField label="Sexe" required error={errors.sex}>
              <Select name="sex" value={formData.sex} onChange={handleChange}>
                <option value="">Choisir...</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </Select>
            </FormField>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 bg-background border-t p-6 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        {!submitSuccess && (
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
            <Check size={18} className="mr-2" />
            Créer l’enseignant
          </Button>
        )}
      </div>
    </Modal>
  );
};
