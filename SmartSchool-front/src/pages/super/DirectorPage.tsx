// DirecteursPage.tsx
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/SkeletonLoading';
import { DirectorCreationForm } from '@/components/forms/DirectorCreateForm';
import { DirectorTypeResponse, getAllDirector } from '@/api/registration-service/director.api';
import { findAllSchoolWithoutDirector } from '@/api/registration-service/school.api';

interface DirecteurType {
  id: number;
  school_id: number;
  school_name?: string;
  last_name: string;
  first_name: string;
  username: string;
  email: string;
  birth_date: string;
  sex: string;

}

export const DirecteursPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [directeurs, setDirecteurs] = useState<DirectorTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    { 
      key: 'last_name', 
      label: 'Nom', 
      align: 'left' as const,
      render: (value: string, row: DirecteurType) => (
        <span className="font-medium">{`${row.last_name} ${row.first_name}`}</span>
      )
    },
    // { 
    //   key: 'username', 
    //   label: 'Nom d\'utilisateur', 
    //   align: 'left' as const 
    // },
    // { 
    //   key: 'email', 
    //   label: 'Email', 
    //   align: 'left' as const,
    //   render: (value: string) => (
    //     <a 
    //       href={`mailto:${value}`}
    //       className="text-primary hover:underline transition-colors"
    //     >
    //       {value}
    //     </a>
    //   )
    // },
    { 
      key: 'school_name', 
      label: 'Établissement', 
      align: 'left' as const,
      render: (value: string, row: DirectorTypeResponse) => (
        <span className="font-medium">{`${row.school.name}`}</span>
      )
    },
    { 
      key: 'sex', 
      label: 'Sexe', 
      align: 'center' as const,
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
          {value === 'M' ? 'Masculin' : 'Féminin'}
        </span>
      )
    },
    { 
      key: 'birth_date', 
      label: 'Date de naissance', 
      align: 'center' as const,
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR')
    },
  ];

  const fetchDirecteurs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllDirector();
      setDirecteurs(data);
      console.log('Directeurs chargés:', data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des directeurs:', error);
      setError('Impossible de charger les directeurs. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    
    console.log('Directeur créé avec succès !');
    setShowModal(false);
    fetchDirecteurs();
  };

  const handleEdit = (id: number) => {
    console.log('Modifier le directeur:', id);
    // TODO: Ouvrir modal d'édition
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce directeur ?')) {
      try {
        // TODO: Appeler l'API de suppression
        console.log('Supprimer le directeur:', id);
        fetchDirecteurs();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du directeur');
      }
    }
  };

  useEffect(() => {
    fetchDirecteurs();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Gestion des Directeurs
      </h2>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Liste des directeurs
            </h3>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                {directeurs.length} directeur{directeurs.length > 1 ? 's' : ''} enregistré{directeurs.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Ajouter un directeur
          </button>
        </div>

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
              onClick={fetchDirecteurs}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <DataTable 
            columns={columns}
            data={directeurs}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <DirectorCreationForm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};