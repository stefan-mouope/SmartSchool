import React from 'react';
import { School, Users, GraduationCap, Plus } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { etablissements } from '@/constants/mockData';

interface SuperDashboardProps {
  onAddEtablissement: () => void;
}

export const SuperDashboard: React.FC<SuperDashboardProps> = ({ onAddEtablissement }) => {
  const columns = [
    { key: 'nom', label: 'Nom', align: 'left' as const },
    { key: 'ville', label: 'Ville', align: 'left' as const },
    { key: 'directeur', label: 'Directeur', align: 'left' as const },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Tableau de bord SuperUtilisateur</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Établissements" value={12} icon={School} gradient="primary" />
        <StatsCard title="Directeurs" value={12} icon={Users} gradient="success" />
        <StatsCard title="Élèves totaux" value="1,248" icon={GraduationCap} gradient="accent" />
      </div>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-card-foreground">Établissements récents</h3>
          <button 
            onClick={onAddEtablissement}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Ajouter un établissement
          </button>
        </div>
        <DataTable 
          columns={columns}
          data={etablissements}
          onEdit={(id) => console.log('Edit', id)}
          onDelete={(id) => console.log('Delete', id)}
        />
      </div>
    </div>
  );
};
