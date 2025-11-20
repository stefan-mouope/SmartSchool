import React, { useState } from 'react';
import { UserRole } from '@/types';
import { MainLayout } from '@/components/layout/MainLayout';
import { Modal } from '@/components/shared/Modal';

// Pages
import { SuperDashboard } from '@/pages/super/SuperDashboard';
import { EtablissementsPage } from '@/pages/super/EtablissementsPage';
import { DirecteurDashboard } from '@/pages/directeur/DirecteurDashboard';
import { EnseignantsPage } from '@/pages/directeur/EnseignantsPage';
import { ElevesPage } from '@/pages/directeur/ElevesPage';
import { PaiementsPage } from '@/pages/directeur/PaiementsPage';
import { BulletinsPage } from '@/pages/directeur/BulletinsPage';
import { EnseignantDashboard } from '@/pages/enseignant/EnseignantDashboard';
import { NotesPage } from '@/pages/enseignant/NotesPage';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<UserRole>('directeur');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const renderPage = () => {
    // Super user pages
    if (currentUser === 'super') {
      switch (currentPage) {
        case 'dashboard':
          return <SuperDashboard onAddEtablissement={() => { setModalType('etablissement'); setShowModal(true); }} />;
        case 'etablissements':
          return <EtablissementsPage onAddEtablissement={() => { setModalType('etablissement'); setShowModal(true); }} />;
        case 'directeurs':
          return (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Gestion des Directeurs</h2>
              <div className="bg-card rounded-lg shadow-md p-6">
                <p className="text-muted-foreground">Liste des directeurs avec leurs établissements assignés...</p>
              </div>
            </div>
          );
        default:
          return <SuperDashboard onAddEtablissement={() => { setModalType('etablissement'); setShowModal(true); }} />;
      }
    }

    // Directeur pages
    if (currentUser === 'directeur') {
      switch (currentPage) {
        case 'dashboard':
          return <DirecteurDashboard />;
        case 'enseignants':
          return <EnseignantsPage onAddEnseignant={() => { setModalType('enseignant'); setShowModal(true); }} />;
        case 'eleves':
          return <ElevesPage onAddEleve={() => { setModalType('eleve'); setShowModal(true); }} />;
        case 'paiements':
          return <PaiementsPage />;
        case 'bulletins':
          return <BulletinsPage />;
        case 'classes':
        case 'matieres':
        case 'annees':
          return (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h2>
              <div className="bg-card rounded-lg shadow-md p-6">
                <p className="text-muted-foreground">Cette page est en cours de développement...</p>
              </div>
            </div>
          );
        default:
          return <DirecteurDashboard />;
      }
    }

    // Enseignant pages
    if (currentUser === 'enseignant') {
      switch (currentPage) {
        case 'dashboard':
          return <EnseignantDashboard />;
        case 'notes':
          return <NotesPage />;
        case 'mes-classes':
        case 'bulletins':
          return (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {currentPage === 'mes-classes' ? 'Mes Classes' : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h2>
              <div className="bg-card rounded-lg shadow-md p-6">
                <p className="text-muted-foreground">Cette page est en cours de développement...</p>
              </div>
            </div>
          );
        default:
          return <EnseignantDashboard />;
      }
    }

    return null;
  };

  const handleUserChange = (newUser: UserRole) => {
    setCurrentUser(newUser);
    setCurrentPage('dashboard'); // Reset to dashboard when switching users
  };

  return (
    <>
      <MainLayout
        currentUser={currentUser}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onUserChange={handleUserChange}
      >
        {renderPage()}
      </MainLayout>

      {showModal && (
        <Modal 
          title={
            modalType === 'etablissement' ? 'Nouvel Établissement' :
            modalType === 'enseignant' ? 'Nouvel Enseignant' :
            modalType === 'eleve' ? 'Nouvel Élève' :
            'Formulaire'
          }
          onClose={() => setShowModal(false)}
        >
          <div className="text-muted-foreground">
            Formulaire en cours de développement...
          </div>
        </Modal>
      )}
    </>
  );
};

export default Index;
