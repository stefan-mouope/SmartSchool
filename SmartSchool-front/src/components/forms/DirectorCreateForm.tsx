import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Calendar, Users, Building2, X, Check, AlertCircle, CheckCircle, UserCircle } from 'lucide-react';
import { findAllSchoolWithoutDirector, getAllSchools } from '@/api/registration-service/school.api';
// import { Modal } from '../shared/Modal';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
// import { FormField } from '../ui/form';
import { Input } from '../ui/input';
import { createDirector } from '@/api/registration-service/director.api';
import { Label } from '../ui/label';
// import { Select } from '../ui/select';

// Composants réutilisables (mêmes que SchoolCreationForm)
// const Button = React.forwardRef(({ className = '', variant = 'default', size = 'default', children, disabled, ...props }, ref) => {
//   const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
//   const variants = {
//     default: "bg-primary text-primary-foreground hover:bg-primary/90",
//     outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
//     ghost: "hover:bg-accent hover:text-accent-foreground",
//     destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
//   };
  
//   const sizes = {
//     default: "h-10 px-4 py-2",
//     sm: "h-9 px-3",
//     lg: "h-11 px-8",
//     icon: "h-10 w-10",
//   };
  
//   return (
//     <button
//       ref={ref}
//       disabled={disabled}
//       className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// });

// const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
//   return (
//     <input
//       type={type}
//       className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
//       ref={ref}
//       {...props}
//     />
//   );
// });

// const Label = React.forwardRef(({ className = '', ...props }, ref) => (
//   <label
//     ref={ref}
//     className={`block text-sm font-medium text-foreground mb-2 ${className}`}
//     {...props}
//   />
// ));

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

// const Alert = ({ variant = 'default', children, className = '', icon: Icon }) => {
//   const variants = {
//     default: 'bg-blue-50 border-blue-500 text-blue-700',
//     destructive: 'bg-destructive/10 border-destructive text-destructive',
//     success: 'bg-green-50 border-green-500 text-green-700',
//   };

//   const DefaultIcon = Icon || AlertCircle;

//   return (
//     <div className={`p-4 border-l-4 rounded-r-lg flex items-start ${variants[variant]} ${className}`}>
//       <DefaultIcon size={20} className="mr-3 mt-0.5 flex-shrink-0" />
//       <div className="flex-1">{children}</div>
//     </div>
//   );
// };

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
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-background rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

interface DirecteurFormProps {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const DirectorCreationForm: React.FC<DirecteurFormProps> = ({ isOpen, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    school_id: '',
    last_name: '',
    first_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'directeur',
    birth_date: '',
    sex: '',
  });

  const [schools, setSchools] = useState<any[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Charger les écoles
  useEffect(() => {
    if (isOpen) {
      loadSchools();
      resetForm();
    }
  }, [isOpen]);

  const loadSchools = async () => {
    try {
      setIsLoadingSchools(true);
      const data = await findAllSchoolWithoutDirector();
      setSchools(data);
    } catch (error) {
      console.error('Erreur lors du chargement des écoles:', error);
      setErrors({ school_id: 'Impossible de charger les établissements' });
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const resetForm = () => {
    setFormData({
      school_id: '',
      last_name: '',
      first_name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'directeur',
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
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.school_id) {
      newErrors.school_id = 'Veuillez sélectionner un établissement';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Le nom est requis';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Le prénom est requis';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Seuls les lettres, chiffres et underscore sont autorisés';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'La date de naissance est requise';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 21 || age > 70) {
        newErrors.birth_date = 'L\'âge doit être entre 21 et 70 ans';
      }
    }

    if (!formData.sex) {
      newErrors.sex = 'Le sexe est requis';
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
      // Préparer les données pour l'API (sans confirmPassword)
      const { confirmPassword, ...dataToSend } = formData;
      const apiData = {
        ...dataToSend,
        school_id: parseInt(dataToSend.school_id),
        
      };

      const newDirecteur = await createDirector(apiData);
      
      setSubmitSuccess(true);
      setSuccessMessage(`Le directeur ${newDirecteur.first_name} ${newDirecteur.last_name} a été créé avec succès !`);
      
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
          } else if (data.username) {
            setErrors({ username: 'Ce nom d\'utilisateur est déjà pris' });
          } else {
            setErrors({ submit: data.message || 'Les données fournies sont invalides' });
          }
        } else if (status === 401) {
          setErrors({ submit: 'Session expirée. Veuillez vous reconnecter.' });
        } else if (status === 403) {
          setErrors({ submit: 'Vous n\'avez pas les permissions nécessaires.' });
        } else if (status === 404) {
          setErrors({ school_id: 'L\'établissement sélectionné n\'existe pas' });
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
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Créer un nouveau directeur</h2>
            <p className="text-muted-foreground text-sm mt-1">Attribuer un directeur à un établissement</p>
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

      {/* Content */}
      <div className="p-6">
        {submitSuccess && (
          <Alert variant="success" className="mb-6" icon={CheckCircle}>
            <div>
              <p className="font-semibold text-sm">Succès !</p>
              <p className="text-sm">{successMessage}</p>
            </div>
          </Alert>
        )}

        {errors.submit && (
          <Alert variant="destructive" className="mb-6">
            <div>
              <p className="font-semibold text-sm">Erreur de création</p>
              <p className="text-sm">{errors.submit}</p>
            </div>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Établissement */}
          <FormField 
            label="Établissement" 
            required 
            error={errors.school_id}
            icon={Building2}
          >
            <Select
              name="school_id"
              value={formData.school_id}
              onChange={handleChange}
              className="pl-10"
              disabled={isSubmitting || submitSuccess || isLoadingSchools}
            >
              <option value="">
                {isLoadingSchools ? 'Chargement...' : 'Sélectionner un établissement'}
              </option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} - {school.city}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Nom" 
              required 
              error={errors.last_name}
              icon={User}
            >
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="pl-10"
                placeholder="Ex: Ngassa"
                disabled={isSubmitting || submitSuccess}
              />
            </FormField>

            <FormField 
              label="Prénom" 
              required 
              error={errors.first_name}
              icon={User}
            >
              <Input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="pl-10"
                placeholder="Ex: Brigitte"
                disabled={isSubmitting || submitSuccess}
              />
            </FormField>
          </div>

          {/* Username et Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Nom d'utilisateur" 
              required 
              error={errors.username}
              icon={UserCircle}
            >
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="pl-10"
                placeholder="Ex: stefan"
                disabled={isSubmitting || submitSuccess}
              />
            </FormField>

            <FormField 
              label="Email" 
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
                placeholder="exemple@gmail.com"
                disabled={isSubmitting || submitSuccess}
              />
            </FormField>
          </div>

          {/* Mot de passe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Mot de passe" 
              required 
              error={errors.password}
              icon={Lock}
            >
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                placeholder="Minimum 8 caractères"
                disabled={isSubmitting || submitSuccess}
              />
            </FormField>

            <FormField 
              label="Confirmer le mot de passe" 
              required 
              error={errors.confirmPassword}
              icon={Lock}
            >
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10"
                placeholder="Répéter le mot de passe"
                disabled={isSubmitting || submitSuccess}
              />
            </FormField>
          </div>

          {/* Date de naissance et Sexe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Date de naissance" 
              required 
              error={errors.birth_date}
              icon={Calendar}
            >
              <Input
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                className="pl-10"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
                disabled={isSubmitting || submitSuccess}
              />
            </FormField>

            <FormField 
              label="Sexe" 
              required 
              error={errors.sex}
            >
              <Select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                disabled={isSubmitting || submitSuccess}
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </Select>
            </FormField>
          </div>
        </div>
      </div>

      {/* Footer */}
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
                Créer le directeur
              </>
            )}
          </Button>
        )}
      </div>
    </Modal>
  );
};