// EtablissementsPage.tsx
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { SchoolCreationForm } from '@/components/forms/SchoolCreateForm';
import { getAllSchools, schoolResult } from '@/api/registration-service/school.api';
import { TableSkeleton } from '@/components/shared/SkeletonLoading';

interface SchoolType {
  id: number;
  name: string;
  email: string;
  phone_school: string;
  region: string;
  city: string;
  location: string;
  founded_year: number;
}

export const EtablissementsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState<schoolResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Colonnes corrigées pour correspondre à SchoolType
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
      key: 'email', 
      label: 'Email', 
      align: 'left' as const,
      render: (value: string) => (
        <a 
          href={`mailto:${value}`}
          className="text-primary hover:underline transition-colors"
        >
          {value}
        </a>
      )
    },
    { 
      key: 'founded_year', 
      label: 'Année de fondation', 
      align: 'center' as const,
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {value}
        </span>
      )
    },
  ];

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllSchools();
      setSchools(data);
      console.log('Écoles chargées:', data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des écoles:', error);
      setError('Impossible de charger les établissements. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    console.log('École créée avec succès !');
    setShowModal(false);
    // Recharger la liste
    fetchSchools();
  };

  const handleEdit = (id: number) => {
    console.log('Modifier l\'école:', id);
    // TODO: Ouvrir modal d'édition
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
      try {
        // TODO: Appeler l'API de suppression
        // await deleteSchool(id);
        console.log('Supprimer l\'école:', id);
        fetchSchools();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'établissement');
      }
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Gestion des Établissements
      </h2>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Liste des établissements
            </h3>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                {schools.length} établissement{schools.length > 1 ? 's' : ''} enregistré{schools.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Ajouter un établissement
          </button>
        </div>

        {/* Affichage conditionnel: Loading / Error / Data */}
        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : error ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
              <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-destructive font-medium mb-2">{error}</p>
            <button 
              onClick={fetchSchools}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <DataTable 
            columns={columns}
            data={schools}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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