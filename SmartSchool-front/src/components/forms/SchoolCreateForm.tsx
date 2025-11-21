import React, { useState, useEffect } from 'react';
import { School, Mail, Phone, MapPin, Calendar, Building2, X, Check, AlertCircle, CheckCircle } from 'lucide-react';
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

// Composant Modal
const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Réinitialiser le formulaire quand le modal s'ouvre
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
      setSubmitSuccess(false);
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'établissement est requis';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.phone_school.trim()) {
      newErrors.phone_school = 'Le téléphone est requis';
    } else if (!/^\+237[0-9]{9}$/.test(formData.phone_school)) {
      newErrors.phone_school = 'Format: +237XXXXXXXXX';
    }

    if (!formData.region) {
      newErrors.region = 'La région est requise';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    const currentYear = new Date().getFullYear();
    if (!formData.founded_year) {
      newErrors.founded_year = 'L\'année de fondation est requise';
    } else if (formData.founded_year < 1900 || formData.founded_year > currentYear) {
      newErrors.founded_year = `L'année doit être entre 1900 et ${currentYear}`;
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    setErrors({});
    setSubmitSuccess(false);

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const newSchool = await createSchool(formData);
      
      setSubmitSuccess(true);
      setSuccessMessage(`L'établissement "${newSchool.name}" a été créé avec succès !`);
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          if (data.email) {
            setErrors({ email: 'Cet email est déjà utilisé' });
          } else if (data.phone_school) {
            setErrors({ phone_school: 'Ce numéro de téléphone est déjà utilisé' });
          } else if (data.name) {
            setErrors({ name: 'Un établissement avec ce nom existe déjà dans cette ville' });
          } else {
            setErrors({ submit: data.message || 'Les données fournies sont invalides' });
          }
        } else if (status === 401) {
          setErrors({ submit: 'Session expirée. Veuillez vous reconnecter.' });
        } else if (status === 403) {
          setErrors({ submit: 'Vous n\'avez pas les permissions nécessaires pour créer un établissement.' });
        } else if (status === 500) {
          setErrors({ submit: 'Erreur serveur. Veuillez réessayer plus tard.' });
        } else {
          setErrors({ submit: data.message || 'Une erreur est survenue lors de la création.' });
        }
      } else if (error.request) {
        setErrors({ submit: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.' });
      } else {
        setErrors({ submit: error.message || 'Une erreur inattendue est survenue.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      {/* Header du Modal */}
      <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
            <School size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Créer un nouvel établissement</h2>
            <p className="text-muted-foreground text-sm mt-1">Remplissez les informations de l'école</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-full"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Contenu du Modal */}
      <div className="p-6">
        {/* Message de succès */}
        {submitSuccess && (
          <Alert variant="success" className="mb-6" icon={CheckCircle}>
            <div>
              <p className="font-semibold text-sm">Succès !</p>
              <p className="text-sm">{successMessage}</p>
            </div>
          </Alert>
        )}

        {/* Message d'erreur général */}
        {errors.submit && (
          <Alert variant="destructive" className="mb-6">
            <div>
              <p className="font-semibold text-sm">Erreur de création</p>
              <p className="text-sm">{errors.submit}</p>
            </div>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Nom de l'établissement */}
          <FormField 
            label="Nom de l'établissement" 
            required 
            error={errors.name}
            icon={Building2}
          >
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="pl-10"
              placeholder="Ex: Lycée Bilingue de Yaoundé"
              disabled={isSubmitting || submitSuccess}
            />
          </FormField>

          {/* Email et Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Email de l'établissement" 
              required 
              error={errors.email}
              icon={Mail}
            >
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

            <FormField 
              label="Téléphone" 
              required 
              error={errors.phone_school}
              icon={Phone}
            >
              <Input
                name="phone_school"
                type="tel"
                value={formData.phone_school}
                onChange={handleChange}
                className="pl-10"
                placeholder="+237650123456"
                disabled={isSubmitting || submitSuccess}
              />
            </FormField>
          </div>

          {/* Région et Ville */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Région" 
              required 
              error={errors.region}
              icon={MapPin}
            >
              <Select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="pl-10"
                disabled={isSubmitting || submitSuccess}
              >
                <option value="">Sélectionner une région</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </Select>
            </FormField>

            <FormField 
              label="Ville" 
              required 
              error={errors.city}
            >
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
          <FormField 
            label="Adresse / Localisation" 
            required 
            error={errors.location}
            icon={MapPin}
          >
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

          {/* Année de fondation */}
          <FormField 
            label="Année de fondation" 
            required 
            error={errors.founded_year}
            icon={Calendar}
          >
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
      </div>

      {/* Footer du Modal */}
      <div className="sticky bottom-0 bg-background border-t border-border p-6 flex items-center justify-end gap-3">
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
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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