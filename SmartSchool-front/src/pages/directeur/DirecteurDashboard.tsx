import React from 'react';
import { GraduationCap, Users, BookOpen, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';

export const DirecteurDashboard: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Tableau de bord Directeur</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Enseignants" value={18} icon={GraduationCap} gradient="primary" />
        <StatsCard title="Élèves" value={342} icon={Users} gradient="success" />
        <StatsCard title="Classes" value={12} icon={BookOpen} gradient="accent" />
        <StatsCard title="Paiements" value="87%" icon={DollarSign} gradient="warning" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Activités récentes</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
              <span className="text-muted-foreground">Nouveau paiement - Kamga Jean</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              <span className="text-muted-foreground">Nouvelle inscription - Ngo Bik Marie</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Paiements en attente</h3>
          <p className="text-3xl font-bold text-warning">45</p>
          <p className="text-sm text-muted-foreground mt-1">élèves en retard de paiement</p>
        </div>
      </div>
    </div>
  );
};
