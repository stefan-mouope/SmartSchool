// EnseignantsPage.tsx
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { TableSkeleton } from '@/components/shared/SkeletonLoading';





import {  getTeacherBySchoolId, teacherResponseType } from '@/api/registration-service/teacher.api';

import { useAuthStore } from '@/store/authStore';
import { TeacherCreationForm } from '@/components/forms/TeacherCreateForm ';

export const EnseignantsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [teachers, setTeachers] = useState<teacherResponseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const school_id = useAuthStore(state => state.school_id);
  
  const columns = [
    { 
      key: 'last_name', 
      label: 'Nom', 
      align: 'left' as const,
      render: (value: string, row: teacherResponseType) => (
        <span className="font-medium">{`${row.last_name} ${row.first_name}`}</span>
      )
    },
    { 
      key: 'school_name', 
      label: 'Établissement', 
      align: 'left' as const,
      render: (value: string, row: teacherResponseType) => (
        <span className="font-medium">{row.school?.name ?? '—'}</span>
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

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await  getTeacherBySchoolId(school_id || null);
      setTeachers(data);
      console.log('Enseignants chargés:', data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des enseignants:', error);
      setError('Impossible de charger les enseignants. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    console.log('Enseignant créé avec succès !');
    setShowModal(false);
    fetchTeachers();
  };

  const handleEdit = (id: number) => {
    console.log('Modifier enseignant:', id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      try {
        console.log('Supprimer enseignant:', id);
        fetchTeachers();
      } catch (error) {
        console.error('Erreur suppression enseignant:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Gestion des Enseignants
      </h2>

      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Liste des enseignants
            </h3>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                {teachers.length} enseignant{teachers.length > 1 ? 's' : ''} enregistré{teachers.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Ajouter un enseignant
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
              onClick={fetchTeachers}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <DataTable 
            columns={columns}
            data={teachers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <TeacherCreationForm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
