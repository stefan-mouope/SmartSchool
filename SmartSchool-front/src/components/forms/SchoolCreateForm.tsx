import React, { useState, useEffect } from 'react';
import { School, Mail, Phone, MapPin, Calendar, Building2, X, Check, CheckCircle, Quote, Image as ImageIcon } from 'lucide-react';
import { createSchool } from '@/api/registration-service/school.api';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// Composants réutilisables
const Select = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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

// Modal
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

    devise: '',
    devise_en: '',
    name_en: '',
    email: '',
    phone_school: '',
    region: '',
    city: '',
    location: '',
    founded_year: new Date().getFullYear(),
  });

  const [logo, setLogo] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        devise: '',
        devise_en: '',
        name_en: '',
        email: '',
        phone_school: '',
        region: '',
        city: '',
        location: '',
        founded_year: new Date().getFullYear(),
      });
      setLogo(null);
      setErrors({});
      setSubmitSuccess(false);
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.submit) setErrors(prev => ({ ...prev, submit: '' }));
  };

  // const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     setLogo(e.target.files[0]);
  //   }
  // };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';


    if (!formData.devise.trim()) newErrors.devise = 'La devise est requise';

    if (!formData.devise_en.trim()) newErrors.devise_en = 'La devise en anglais est requise';

    if (!formData.name_en.trim()) newErrors.name_en = "Le nom en anglais est requis";

    if (!formData.email.trim()) newErrors.email = 'L’email est requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email invalide';

    if (!formData.phone_school.trim()) newErrors.phone_school = 'Téléphone requis';
    else if (!/^[0-9]{9}$/.test(formData.phone_school))
      newErrors.phone_school = 'Format: 9 chiffres';

    if (!formData.region) newErrors.region = 'La région est requise';

    if (!formData.city.trim()) newErrors.city = 'La ville est requise';

    if (!formData.location.trim()) newErrors.location = 'Localisation requise';

    const currentYear = new Date().getFullYear();
    if (formData.founded_year < 1900 || formData.founded_year > currentYear)
      newErrors.founded_year = `L'année doit être entre 1900 et ${currentYear}`;

    if (!logo) newErrors.logo = "Le logo est requis";

    return newErrors;
  };
// 1. Modifier handleLogoChange pour ajouter des logs
const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    setLogo(file);
    console.log('Fichier sélectionné:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Effacer l'erreur logo si elle existe
    if (errors.logo) {
      setErrors(prev => ({ ...prev, logo: '' }));
    }
  }
};

// 2. Modifier handleSubmit - CRITIQUE : Ajouter le nom du fichier
const handleSubmit = async () => {
  setErrors({});
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsSubmitting(true);

  try {
    const payload = new FormData();
    
    // Ajouter les champs texte
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value.toString());
    });
    
    // CRITIQUE : Ajouter le fichier avec son nom explicite
    if (logo) {
      payload.append("logo", logo, logo.name);
      console.log('Logo ajouté au FormData:', {
        name: logo.name,
        size: logo.size,
        type: logo.type
      });
    }
    
    // Debug : Afficher le contenu du FormData
    console.log('=== Contenu du FormData ===');
    for (let [key, value] of payload.entries()) {
      if (value instanceof File) {
        console.log(key, ':', value.name, `(${value.size} bytes)`);
      } else {
        console.log(key, ':', value);
      }
    }
    console.log('==========================');
    
    const newSchool = await createSchool(payload);

    setSubmitSuccess(true);
    setSuccessMessage(`L'école "${newSchool.name}" a été créée avec succès !`);

    setTimeout(() => { onSuccess?.(); }, 2000);

  } catch (err: any) {
    console.error('Erreur complète:', err);
    setErrors({ submit: err.response?.data?.message || err.message || "Erreur inconnue" });
  }

  setIsSubmitting(false);
};

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      {/* HEADER */}
      <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
            <School size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Créer un nouvel établissement</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Remplissez les informations de l'école
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSubmitting}>
          <X size={20} />
        </Button>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-6">

        {/* SUCCESS */}
        {submitSuccess && (
          <Alert variant="success" className="mb-6" icon={CheckCircle}>
            <div>
              <p className="font-semibold text-sm">Succès</p>
              <p className="text-sm">{successMessage}</p>
            </div>
          </Alert>
        )}

        {/* ERROR */}
        {errors.submit && (
          <Alert variant="destructive" className="mb-6">
            <div>
              <p className="font-semibold text-sm">Erreur</p>
              <p className="text-sm">{errors.submit}</p>
            </div>
          </Alert>
        )}

        {/* Nom */}
        <FormField label="Nom de l'établissement" required error={errors.name} icon={Building2}>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="pl-10"
            placeholder="Ex: Lycée Général"
            disabled={isSubmitting || submitSuccess}
          />
        </FormField>
 <FormField label="Nom de l'établissement en anglais" required error={errors.name_en} icon={Building2}>
          <Input
            name="name_en"
            value={formData.name_en}
            onChange={handleChange}
            className="pl-10"
            placeholder="Ex: General High School"
            disabled={isSubmitting || submitSuccess}
          />
        </FormField>

    
        {/* Devise */}
        <FormField label="Devise de l'école" required error={errors.devise} icon={Quote}>
          <Input
            name="devise"
            value={formData.devise}
            onChange={handleChange}
            className="pl-10"
            placeholder="Ex: Paix – Travail – Patrie"
            disabled={isSubmitting || submitSuccess}
          />
        </FormField>
         <FormField label="Devise de l'école en anglais" required error={errors.devise_en} icon={Quote}>
          <Input
            name="devise_en"
            value={formData.devise_en}
            onChange={handleChange}
            className="pl-10"
            placeholder="Ex: Peace – Work – Fatherland"
            disabled={isSubmitting || submitSuccess}
          />
        </FormField>

        {/* Logo */}
        <FormField label="Logo de l'école" required error={errors.logo} icon={ImageIcon}>
          <Input
            name="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="pl-10"
            disabled={isSubmitting || submitSuccess}
          />
        </FormField>

        {/* Email + phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Email" required error={errors.email} icon={Mail}>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10"
              placeholder="contact@ecole.cm"
              disabled={isSubmitting || submitSuccess}
            />
          </FormField>

          <FormField label="Téléphone" required error={errors.phone_school} icon={Phone}>
            <Input
              name="phone_school"
              type="tel"
              value={formData.phone_school}
              onChange={handleChange}
              className="pl-10"
              placeholder="650123456"
              disabled={isSubmitting || submitSuccess}
            />
          </FormField>
        </div>

        {/* Région + ville */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <FormField label="Région" required error={errors.region} icon={MapPin}>
            <Select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="pl-10"
              disabled={isSubmitting || submitSuccess}
            >
              <option value="">Sélectionner une région</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </FormField>

          <FormField label="Ville" required error={errors.city}>
            <Input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ex: Yaoundé"
              disabled={isSubmitting || submitSuccess}
            />
          </FormField>

        </div>

        {/* Localisation */}
        <FormField label="Localisation" required error={errors.location} icon={MapPin}>
          <Textarea
            name="location"
            value={formData.location}
            onChange={handleChange}
            rows={3}
            className="pl-10"
            placeholder="Ex: Nkolbisson, face entrée ENS"
            disabled={isSubmitting || submitSuccess}
          />
        </FormField>

        {/* Année */}
        <FormField label="Année de fondation" required error={errors.founded_year} icon={Calendar}>
          <Input
            name="founded_year"
            type="number"
            value={formData.founded_year}
            onChange={handleChange}
            className="pl-10"
            min="1900"
            max={new Date().getFullYear()}
            disabled={isSubmitting || submitSuccess}
          />
        </FormField>

      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 bg-background border-t p-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X size={18} />
          {submitSuccess ? 'Fermer' : 'Annuler'}
        </Button>

        {!submitSuccess && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="min-w-[180px]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : (
              <>
                <Check size={18} />
                Créer l'établissement
              </>
            )}
          </Button>
        )}
      </div>
    </Modal>
  );
};
