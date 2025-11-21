import React, { useState } from 'react';
import { School, User, Lock, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/hooks/useAuth";  

const SignupPage = () => {
  const { register } = useAuth(); //  Appel API d'inscription

  const ROLE_OF_USER='directeur'; // rôle par défaut

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    // --- Validation ---
    if (!email || !username || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    // --- Appel backend ---
    try {
      const ok = await register({ email, username, password,role:ROLE_OF_USER });
      console.log('fgfgfgfggfgggggggggggggggggggg',ok);

      setIsLoading(false);

      if (ok) {
        window.location.href = "/login";
        return;
      }

      setError("Impossible de créer le compte");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création du compte");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      
      {/* Décor du fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-6">
            <School size={48} className="text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">SmartSchool</h1>
          <p className="text-blue-200">Création de compte</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Inscription</h2>

          {/* Erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start text-red-700 animate-slide-in">
              <AlertCircle size={20} className="mr-3 mt-1" />
              <div>{error}</div>
            </div>
          )}

          <div className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Adresse email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  type="email"
                  className="pl-10"
                  placeholder="exemple@ecole.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold mb-2">Nom d'utilisateur</label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="Votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  className="pl-10 pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="pl-10 pr-12"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 font-semibold shadow-lg hover:shadow-xl"
              size="lg"
            >
              {isLoading ? "Création du compte..." : "Créer un compte"}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            Déjà un compte ?{" "}
            <a href="/login" className="font-semibold text-blue-600 hover:underline">
              Se connecter
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SignupPage;
