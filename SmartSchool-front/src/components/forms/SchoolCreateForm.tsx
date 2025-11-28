import React, { useState, useEffect } from 'react';
import { 
  School, Mail, Phone, MapPin, Calendar, Building2, X, Check, 
  AlertCircle, CheckCircle, Image as ImageIcon 
} from 'lucide-react';
import { createSchool } from '@/api/registration-service/school.api';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// Select Component
const Select = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <select
    ref={ref}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
      disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
));

// FormField component
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
        <div className="absolute inset-y-0 left-0 pl-3 pr-4 flex items-center pointer-events-none">
          {/* <Icon size={20} className="text-muted-foreground p-8" /> */}
        </div>
      )}
      {children}
    </div>
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
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

const REGIONS = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
  'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
];

interface SchoolFormProps {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const SchoolCreationForm: React.FC<SchoolFormProps> = ({ isOpen, onCancel, onSuccess }) => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_school: '',
    region: '',
    city: '',
    location: '',
    founded_year: new Date().getFullYear(),
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone_school: '',
        region: '',
        city: '',
        location: '',
        founded_year: new Date().getFullYear(),
      });
      setErrors({});
      setLogoFile(null);
      setLogoPreview(null);
      setSubmitSuccess(false);
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ logo: "Le fichier doit être une image." });
      return;
    }

    setErrors(prev => ({ ...prev, logo: '' }));
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nom requis";
    if (!formData.email.trim()) newErrors.email = "Email requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email invalide";

    if (!formData.phone_school.trim()) newErrors.phone_school = "Téléphone requis";
    else if (!/^[0-9]{9}$/.test(formData.phone_school)) newErrors.phone_school = "9 chiffres";

    if (!formData.region) newErrors.region = "Région requise";
    if (!formData.city.trim()) newErrors.city = "Ville requise";
    if (!formData.location.trim()) newErrors.location = "Adresse requise";

    if (!logoFile) newErrors.logo = "Le logo est requis";

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setIsSubmitting(true);

    try {
      const form = new FormData();

      for (const key in formData) {
        form.append(key, formData[key] as any);
      }

      // Important: Ajouter le fichier logo
      if (logoFile) form.append("logo", logoFile);

      const newSchool = await createSchool(form);

      setSubmitSuccess(true);
      setSuccessMessage(`"${newSchool.name}" a été créé avec succès !`);

      setTimeout(() => {
        onSuccess?.();
      }, 1500);

    } catch (error: any) {
      setErrors({ submit: error?.response?.data?.message || "Erreur serveur" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      {/* HEADER */}
      <div className="sticky top-0 bg-background border-b p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-lg">
            <School className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Créer une école</h2>
            <p className="text-sm text-muted-foreground">Remplissez les informations</p>
          </div>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          <X size={20} />
        </Button>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-6">

        {/* Success */}
        {submitSuccess && (
          <Alert variant="success" icon={CheckCircle}>
            {successMessage}
          </Alert>
        )}

        {errors.submit && (
          <Alert variant="destructive">{errors.submit}</Alert>
        )}

        {/* LOGO */}
        <FormField label="Logo de l'établissement" required error={errors.logo} icon={ImageIcon}>
          <Input type="file" accept="image/*" onChange={handleLogoChange} />

          {logoPreview && (
            <img
              src={logoPreview}
              className="mt-3 w-32 h-32 object-cover rounded-md border"
            />
          )}
        </FormField>

        {/* Nom */}
        <FormField label="Nom" required error={errors.name} icon={Building2}>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </FormField>

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Email" required error={errors.email} icon={Mail}>
            <Input name="email" value={formData.email} onChange={handleChange} />
          </FormField>

          <FormField label="Téléphone" required error={errors.phone_school} icon={Phone}>
            <Input name="phone_school" value={formData.phone_school} onChange={handleChange} />
          </FormField>
        </div>

        {/* Région + Ville */}
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Région" required error={errors.region} icon={MapPin}>
            <Select name="region" value={formData.region} onChange={handleChange}>
              <option value="">Sélectionner une région</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </FormField>

          <FormField label="Ville" required error={errors.city}>
            <Input name="city" value={formData.city} onChange={handleChange} />
          </FormField>
        </div>

        {/* Adresse */}
        <FormField label="Adresse" required error={errors.location} icon={MapPin}>
          <Textarea name="location" value={formData.location} onChange={handleChange} rows={3} />
        </FormField>

        {/* Année */}
        <FormField label="Année de fondation" required error={errors.founded_year} icon={Calendar}>
          <Input
            name="founded_year"
            type="number"
            value={formData.founded_year}
            onChange={handleChange}
          />
        </FormField>
      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 border-t p-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>

        {!submitSuccess && (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer l'établissement"}
          </Button>
        )}
      </div>
    </Modal>
  );
};
