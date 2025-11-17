import React from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { eleves } from '@/constants/mockData';

interface ElevesPageProps {
  onAddEleve: () => void;
}

export const ElevesPage: React.FC<ElevesPageProps> = ({ onAddEleve }) => {
  const columns = [
    { key: 'nom', label: 'Nom complet', align: 'left' as const },
    { key: 'classe', label: 'Classe', align: 'left' as const },
    { 
      key: 'statut', 
      label: 'Statut paiement', 
      align: 'center' as const,
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'Payé' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'montant', label: 'Montant', align: 'right' as const },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Gestion des Élèves</h2>
      
      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-card-foreground">Liste des élèves inscrits</h3>
          <button 
            onClick={onAddEleve}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Inscrire un élève
          </button>
        </div>
        <DataTable 
          columns={columns}
          data={eleves}
          onEdit={(id) => console.log('Edit', id)}
        />
      </div>
    </div>
  );
};
