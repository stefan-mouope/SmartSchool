import React from 'react';
import { BookOpen, Users, Edit2 } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';

export const EnseignantDashboard: React.FC = () => {
  const classes = [
    { nom: 'CM2 A - Mathématiques', effectif: 35 },
    { nom: 'CM1 B - Mathématiques', effectif: 28 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Tableau de bord Enseignant</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Mes classes" value={3} icon={BookOpen} gradient="primary" />
        <StatsCard title="Élèves" value={87} icon={Users} gradient="success" />
        <StatsCard title="Notes saisies" value={234} icon={Edit2} gradient="accent" />
      </div>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Mes classes et matières</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {classes.map((classe, index) => (
              <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-foreground">{classe.nom}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{classe.effectif} élèves</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    Saisir les notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
