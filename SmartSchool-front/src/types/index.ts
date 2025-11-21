export type UserRole = 'super' | 'directeur' | 'enseignant';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export interface Etablissement {
  id: number;
  nom: string;
  ville: string;
  directeur: string;
}

export interface Enseignant {
  id: number;
  nom: string;
  matiere: string;
  classes: string;
}

export interface Classe {
  id: number;
  nom: string;
  effectif: number;
  enseignantPrincipal: string;
}

export interface Eleve {
  id: number;
  nom: string;
  classe: string;
  statut: 'Payé' | 'Partiel' | 'Impayé';
  montant: string;
}

export interface Note {
  id: number;
  nom: string;
  matricule: string;
  interrogation?: string;
  note?: string;
  appreciation?: string;
}

export interface BulletinFilter {
  annee: string;
  trimestre: string;
  classe: string;
  eleve?: string;
}
