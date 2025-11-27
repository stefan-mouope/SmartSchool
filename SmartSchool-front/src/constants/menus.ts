import { Home, School, Users, GraduationCap, BookOpen, FileText, DollarSign, Calendar, Edit2 } from 'lucide-react';
import { UserRole, MenuItem } from '@/types';

export const menus: Record<UserRole, MenuItem[]> = {
  super: [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'etablissements', label: 'Établissements', icon: School },
    { id: 'directeurs', label: 'Directeurs', icon: Users }
  ],
  directeur: [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'enseignants', label: 'Gestion Enseignants', icon: GraduationCap },
    { id: 'classes', label: 'Gestion Classes', icon: BookOpen },
    { id: 'matieres', label: 'Gestion Matières', icon: FileText },
    { id: 'eleves', label: 'Gestion Élèves', icon: Users },
    { id: 'paiements', label: 'Gestion Paiements', icon: DollarSign },
    { id: 'tranches', label: 'Gestion des Tranches', icon: DollarSign },
    { id: 'bulletins', label: 'Bulletins', icon: FileText },
    { id: 'annees', label: 'Années scolaires', icon: Calendar }
  ],
  enseignant: [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'mes-classes', label: 'Mes Classes', icon: BookOpen },
    { id: 'notes', label: 'Saisie des notes', icon: Edit2 },
    { id: 'bulletins', label: 'Bulletins', icon: FileText }
  ]
};

export const userNames: Record<UserRole, string> = {
  super: 'SuperUtilisateur',
  directeur: 'Directeur - M. Mbarga',
  enseignant: 'Enseignant - Mme Ateba'
};
