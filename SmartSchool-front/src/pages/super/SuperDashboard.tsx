// SuperDashboard.tsx
import React, { useEffect, useState } from 'react';
import { School, Users, GraduationCap, Plus, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { SchoolCreationForm } from '@/components/forms/SchoolCreateForm';
import { getAllSchools } from '@/api/registration-service/school.api';
import { TableSkeleton, CardSkeleton } from '@/components/shared/SkeletonLoading';

interface SchoolType {
  id: number;
  name: string;
  email: string;
  phone_school: string;
  region: string;
  city: string;
  location: string;
  founded_year: number;
  created_at?: string; // Date de création pour trier par récent
}

export const SuperDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalDirecteurs: 0,
    totalEleves: 0,
  });

  // Colonnes adaptées pour SchoolType
  const columns = [
    { 
      key: 'name', 
      label: 'Nom de l\'établissement', 
      align: 'left' as const 
    },
    { 
      key: 'city', 
      label: 'Ville', 
      align: 'left' as const 
    },
    { 
      key: 'region', 
      label: 'Région', 
      align: 'left' as const 
    },
    { 
      key: 'phone_school', 
      label: 'Téléphone', 
      align: 'left' as const 
    },
    { 
      key: 'founded_year', 
      label: 'Année', 
      align: 'center' as const,
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {value}
        </span>
      )
    },
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const allSchools = await getAllSchools();
      
      // Trier par date de création (les plus récents en premier)
      const sortedSchools = allSchools.sort((a: SchoolType, b: SchoolType) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return b.id - a.id; // Fallback: trier par ID décroissant
      });

      // Prendre seulement les 3 plus récents
      const recentSchools = sortedSchools.slice(0, 3);
      setSchools(recentSchools);

      // Mettre à jour les statistiques
      setStats({
        totalSchools: allSchools.length,
        totalDirecteurs: allSchools.length, // 1 directeur par école
        totalEleves: allSchools.length * 100, // Simulation: ~100 élèves par école
      });

      console.log('Données chargées:', { allSchools, recentSchools });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    console.log('École créée avec succès !');
    setShowModal(false);
    fetchData(); // Recharger les données
  };

  const handleEdit = (id: number) => {
    console.log('Modifier l\'école:', id);
    // TODO: Ouvrir modal d'édition
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
      try {
        // TODO: Appeler l'API de suppression
        console.log('Supprimer l\'école:', id);
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Tableau de bord SuperUtilisateur
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Vue d'ensemble de la plateforme
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Chargement...
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatsCard 
              title="Établissements" 
              value={stats.totalSchools} 
              icon={School} 
              gradient="primary"
              // subtitle={`${schools.length} récents`}
              trend={stats.totalSchools > 0 ? '+12%' : undefined}
            />
            <StatsCard 
              title="Directeurs" 
              value={stats.totalDirecteurs} 
              icon={Users} 
              gradient="success"
              // subtitle="Actifs"
            />
            <StatsCard 
              title="Élèves totaux" 
              value={stats.totalEleves.toLocaleString()} 
              icon={GraduationCap} 
              gradient="accent"
              // subtitle="Tous établissements"
              trend="+8%"
            />
          </>
        )}
      </div>

      {/* Tableau des établissements récents */}
      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Établissements récents
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Les 3 derniers établissements ajoutés
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Ajouter un établissement
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={3} columns={5} />
        ) : schools.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <School size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun établissement
            </h3>
            <p className="text-muted-foreground mb-6">
              Commencez par ajouter votre premier établissement
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Ajouter un établissement
            </button>
          </div>
        ) : (
          <>
            <DataTable 
              columns={columns}
              data={schools}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <a 
                href="/super/etablissements"
                className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center transition-colors"
              >
                Voir tous les établissements ({stats.totalSchools})
                <TrendingUp size={16} className="ml-1" />
              </a>
            </div>
          </>
        )}
      </div>

      {/* Modal de création */}
      <SchoolCreationForm 
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};