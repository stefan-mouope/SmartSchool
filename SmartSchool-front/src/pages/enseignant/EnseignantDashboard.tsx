import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Edit2, Loader2 } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';

export const EnseignantDashboard: React.FC = () => {
  // États pour stocker les vraies données du backend
  const [classes, setClasses] = useState<any[]>([]);
  const [nombreClasses, setNombreClasses] = useState(0);
  const [nombreEleves, setNombreEleves] = useState(0);
  const [nombreNotes, setNombreNotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ID de l'enseignant connecté (à changer plus tard avec le vrai ID)
  // Pour tester maintenant, on met un ID fixe
  const teacherId = "5";  // Change ici avec un ID qui existe dans ta base

  // On appelle le backend quand la page se charge
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/teachers/${teacherId}/dashboard`,
          {
            method: "GET",
            credentials: "include", // très important si tu es connecté
          }
        );

        if (!response.ok) {
          throw new Error("Impossible de charger les données");
        }

        const data = await response.json();

        // On met à jour les états avec les vraies données
        setNombreClasses(data.statistiques.nombreClasses);
        setNombreEleves(data.statistiques.nombreElevesTotal);
        setNombreNotes(data.statistiques.nombreNotesSaisies);
        setClasses(data.classes);

        setLoading(false);
      } catch (err) {
        setError("Erreur de connexion au serveur");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Pendant le chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  // En cas d'erreur
  if (error) {
    return (
      <div className="text-red-500 text-center text-xl p-10 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  // Affichage final avec les vraies données
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Tableau de bord Enseignant</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Mes classes" value={nombreClasses} icon={BookOpen} gradient="primary" />
        <StatsCard title="Élèves" value={nombreEleves} icon={Users} gradient="success" />
        <StatsCard title="Notes saisies" value={nombreNotes} icon={Edit2} gradient="accent" />
      </div>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Mes classes et matières</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {classes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune classe assignée pour le moment.
              </p>
            ) : (
              classes.map((classe) => (
                <div
                  key={classe.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground">{classe.nom}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {classe.effectif} élève{classe.effectif > 1 ? "s" : ""}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                      Saisir les notes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};