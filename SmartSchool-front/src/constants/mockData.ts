import { Etablissement, Enseignant, Classe, Eleve } from '@/types';

export const etablissements: Etablissement[] = [
  { id: 1, nom: 'École Primaire La Sagesse', ville: 'Yaoundé', directeur: 'M. Mbarga Paul' },
  { id: 2, nom: 'Complexe Scolaire Saint-Michel', ville: 'Douala', directeur: 'Mme Ngono Marie' }
];

export const enseignants: Enseignant[] = [
  { id: 1, nom: 'Mme Ateba', matiere: 'Mathématiques', classes: 'CM1, CM2' },
  { id: 2, nom: 'M. Fopa', matiere: 'Français', classes: 'CE1, CE2' }
];

export const classes: Classe[] = [
  { id: 1, nom: 'CM2 A', effectif: 35, enseignantPrincipal: 'Mme Ateba' },
  { id: 2, nom: 'CE2 B', effectif: 28, enseignantPrincipal: 'M. Fopa' }
];

export const eleves: Eleve[] = [
  { id: 1, nom: 'Kamga Jean', classe: 'CM2 A', statut: 'Payé', montant: '75000 XAF' },
  { id: 2, nom: 'Nkolo Paul', classe: 'CM2 A', statut: 'Payé', montant: '75000 XAF' },
  { id: 3, nom: 'Mballa Sophie', classe: 'CM2 A', statut: 'Partiel', montant: '50000 XAF' },
  { id: 4, nom: 'Essomba Pierre', classe: 'CM2 A', statut: 'Payé', montant: '75000 XAF' },
  { id: 5, nom: 'Fotso Claudine', classe: 'CM2 A', statut: 'Impayé', montant: '0 XAF' },
  { id: 6, nom: 'Ngo Bik Marie', classe: 'CE2 B', statut: 'Partiel', montant: '45000 XAF' },
  { id: 7, nom: 'Onana Michel', classe: 'CE2 B', statut: 'Payé', montant: '60000 XAF' },
  { id: 8, nom: 'Tchoua Berthe', classe: 'CE2 B', statut: 'Payé', montant: '60000 XAF' }
];
