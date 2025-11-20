import React, { useState } from 'react';
import { School, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setError('');
    setIsLoading(true);

    // Validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    // Simulation de connexion
    setTimeout(() => {
      setIsLoading(false);
      alert('Connexion réussie ! Redirection vers le tableau de bord...');
      // Ici, vous pouvez rediriger vers l'application principale
      // window.location.href = '/dashboard';
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      {/* Décoration de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo et titre */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
            <School size={48} className="text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">SmartSchool</h1>
          <p className="text-blue-200 text-lg">Système de Gestion Scolaire</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Connexion</h2>
            <p className="text-gray-500 text-center text-sm">Accédez à votre espace de travail</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start text-red-700 animate-slide-in">
              <AlertCircle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Erreur de connexion</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                  placeholder="exemple@ecole.com"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-12"
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 hover:bg-transparent"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Se souvenir de moi
                </span>
              </label>
              <Button
                variant="link"
                className="text-sm font-semibold p-0 h-auto"
              >
                Mot de passe oublié ?
              </Button>
            </div>

            {/* Bouton de connexion */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </Button>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Button variant="link" className="font-semibold p-0 h-auto">
                Contactez votre administrateur
              </Button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <Button variant="link" className="text-blue-200 hover:text-white p-0 h-auto">
              Aide
            </Button>
            <span className="text-blue-300">•</span>
            <Button variant="link" className="text-blue-200 hover:text-white p-0 h-auto">
              Support technique
            </Button>
            <span className="text-blue-300">•</span>
            <Button variant="link" className="text-blue-200 hover:text-white p-0 h-auto">
              Confidentialité
            </Button>
          </div>
          <p className="text-blue-300 text-sm">
            © 2024 SmartSchool. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;