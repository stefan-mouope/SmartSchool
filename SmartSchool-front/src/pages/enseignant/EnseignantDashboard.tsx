import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Edit2, Loader2 } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';

export const EnseignantDashboard: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [nombreClasses, setNombreClasses] = useState(0);
  const [nombreEleves, setNombreEleves] = useState(0);
  const [nombreNotes, setNombreNotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teacherId = "5"; // Change avec le vrai ID plus tard

  useEffect(() => {
    const fetchData = async () => {
      try {
        // URL RELATIVE + syntaxe corrigée
        const response = await fetch(`/api/teachers/${teacherId}/dashboard`, {
          method: "GET",
          credentials: "include",
        });

        // Si la réponse n'est pas du JSON → on affiche le HTML pour debug
        const text = await response.text();

        if (!response.ok) {
          console.error("Réponse HTML reçue :", text);
          throw new Error(`Erreur ${response.status} – Vérifiez le proxy ou le backend`);
        }

        // On parse seulement si c'est du vrai JSON
        const data = JSON.parse(text);

        setNombreClasses(data.statistiques.nombreClasses);
        setNombreEleves(data.statistiques.nombreElevesTotal);
        setNombreNotes(data.statistiques.nombreNotesSaisies);
        setClasses(data.classes);
        setLoading(false);
      } catch (err: any) {
        console.error("Erreur complète :", err);
        setError("Impossible de charger les données. Le backend est-il lancé ?");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-50 rounded-lg">
        <p className="text-red-600 text-xl font-bold mb-2">Erreur de chargement</p>
        <p className="text-muted-foreground">{error}</p>
        <p className="text-sm mt-4 text-gray-600">
          Vérifiez que le backend est lancé sur le port 3000 et que le proxy est configuré.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Tableau de bord Enseignant</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Mes classes" value={nombreClasses} icon={BookOpen} gradient="primary" />
        <StatsCard title="Élèves" value={nombreEleves} icon={Users} gradient="success" />
        <StatsCard title="Notes saisies" value={nombreNotes} icon={Edit2} gradient="accent" />
      </div>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Mes classes et matières</h3>
        </div>
        <div className="p-6">
          {classes.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Aucune classe assignée.</p>
          ) : (
            <div className="space-y-4">
              {classes.map((classe) => (
                <div key={classe.id} className="flex items-center justify-between p-5 border rounded-lg hover:bg-muted/50 transition">
                  <div>
                    <h4 className="font-semibold">{classe.nom}</h4>
                    <p className="text-sm text-muted-foreground">{classe.effectif} élèves</p>
                  </div>
                  <button className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
                    Saisir les notes
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};