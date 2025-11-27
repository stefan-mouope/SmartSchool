import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Calendar, Users, X, Check, CheckCircle, UserCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createTeacher } from '@/api/registration-service/teacher.api';
import {useAuthStore} from '@/store/authStore';

const Select = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
      focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

const FormField = ({ label, required, error, children, icon: Icon }) => (
  <div className="space-y-2">
    {label && (
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
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

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

interface TeacherFormProps {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const TeacherCreationForm: React.FC<TeacherFormProps> = ({ isOpen, onCancel, onSuccess }) => {
  const school_id = useAuthStore(state => state.school_id);

  const [formData, setFormData] = useState({
    school_id: '',
    last_name: '',
    first_name: '',
    email: '',
    password: '',
    birth_date: '',
    sex: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      school_id: '',
      last_name: '',
      first_name: '',
      email: '',
      password: '',
      birth_date: '',
      sex: '',
    });
    setErrors({});
    setSubmitSuccess(false);
    setSuccessMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.submit) setErrors(prev => ({ ...prev, submit: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.last_name.trim()) newErrors.last_name = 'Le nom est requis';
    if (!formData.first_name.trim()) newErrors.first_name = 'Le prénom est requis';

    if (!formData.email.trim()) newErrors.email = 'L’email est requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';

    if (!formData.password || formData.password.length < 6)
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';

    if (!formData.birth_date) newErrors.birth_date = 'La date de naissance est requise';
    if (!formData.sex) newErrors.sex = 'Le sexe est requis';

    return newErrors;
  };

  const handleSubmit = async () => {
    setErrors({});
    setSubmitSuccess(false);

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setIsSubmitting(true);

    try {
      const apiData = {
        school_id: school_id || null,
        last_name: formData.last_name,
        first_name: formData.first_name,
        email: formData.email,
        password: formData.password,
        birth_date: formData.birth_date,
        sex: formData.sex,
      };

      const newTeacher = await createTeacher(apiData);

      setSubmitSuccess(true);
      setSuccessMessage(`L'enseignant ${newTeacher.first_name} ${newTeacher.last_name} a été créé avec succès !`);

      setTimeout(() => onSuccess && onSuccess(), 1800);
    } catch (error: any) {
      console.error(error);
      setErrors({ submit: error?.response?.data?.message || 'Erreur inattendue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>

      {/* HEADER */}
      <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users size={24} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Créer un enseignant</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={20} />
        </Button>
      </div>

      <div className="p-6 space-y-6">

        {submitSuccess && (
          <Alert variant="success" className="mb-6" icon={CheckCircle}>
            <p className="text-sm">{successMessage}</p>
          </Alert>
        )}

        {errors.submit && (
          <Alert variant="destructive" className="mb-6">
            <p className="text-sm">{errors.submit}</p>
          </Alert>
        )}

  

        {/* NOM + PRENOM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nom" required icon={User} error={errors.last_name}>
            <Input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="pl-10"
            />
          </FormField>

          <FormField label="Prénom" required icon={User} error={errors.first_name}>
            <Input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="pl-10"
            />
          </FormField>
        </div>

        {/* EMAIL */}
        <FormField label="Email" required icon={Mail} error={errors.email}>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            placeholder="exemple@gmail.com"
          />
        </FormField>

        {/* PASSWORD */}
        <FormField label="Mot de passe" required icon={Lock} error={errors.password}>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="pl-10"
          />
        </FormField>

        {/* DATE + SEXE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Date de naissance" required icon={Calendar} error={errors.birth_date}>
            <Input
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleChange}
              className="pl-10"
            />
          </FormField>

          <FormField label="Sexe" required error={errors.sex}>
            <Select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
            >
              <option value="">Sélectionner</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </Select>
          </FormField>
        </div>

      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 bg-background border-t p-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>

        {!submitSuccess && (
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Création...' : 'Créer'}
          </Button>
        )}
      </div>

    </Modal>
  );
};
