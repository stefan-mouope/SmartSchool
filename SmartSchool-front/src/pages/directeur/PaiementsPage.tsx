import React from 'react';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';

export const PaiementsPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Gestion des Paiements</h2>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total perçu</p>
            <DollarSign className="w-5 h-5 text-stats-green" />
          </div>
          <p className="text-3xl font-bold text-stats-green">25,650,000 XAF</p>
        </div>

        <div className="bg-card rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">En attente</p>
            <AlertCircle className="w-5 h-5 text-stats-orange" />
          </div>
          <p className="text-3xl font-bold text-stats-orange">8,450,000 XAF</p>
        </div>

        <div className="bg-card rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Taux de recouvrement</p>
            <TrendingUp className="w-5 h-5 text-stats-blue" />
          </div>
          <p className="text-3xl font-bold text-stats-blue">75%</p>
        </div>
      </div>

      {/* Suivi des paiements */}
      <div className="bg-card rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">Suivi des paiements</h3>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground">
            Tableau de suivi détaillé des paiements par élève...
          </p>
        </div>
      </div>
    </div>
  );
};
