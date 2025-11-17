import React from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { enseignants } from '@/constants/mockData';

interface EnseignantsPageProps {
  onAddEnseignant: () => void;
}

export const EnseignantsPage: React.FC<EnseignantsPageProps> = ({ onAddEnseignant }) => {
  const columns = [
    { key: 'nom', label: 'Nom', align: 'left' as const },
    { key: 'matiere', label: 'Matière principale', align: 'left' as const },
    { key: 'classes', label: 'Classes', align: 'left' as const },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Gestion des Enseignants</h2>
      
      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-card-foreground">Liste des enseignants</h3>
          <button 
            onClick={onAddEnseignant}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Ajouter un enseignant
          </button>
        </div>
        <DataTable 
          columns={columns}
          data={enseignants}
          onEdit={(id) => console.log('Edit', id)}
          onDelete={(id) => console.log('Delete', id)}
        />
      </div>
    </div>
  );
};
