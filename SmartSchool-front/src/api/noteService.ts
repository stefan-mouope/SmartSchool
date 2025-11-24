// src/services/noteService.ts

import { api } from "./axios";
import { BASE_NOTE_SERVICE } from "./axios";

// Types pour les notes
export interface NotePayload {
  sequence1?: number | null;
  sequence2?: number | null;
  sequence3?: number | null;
  sequence4?: number | null;
  sequence5?: number | null;
  sequence6?: number | null;
}

export interface NoteResponse {
  id?: number;
  inscription: number;
  matiere: number;
  sequence1: number;
  sequence2: number;
  sequence3: number;
  sequence4: number;
  sequence5: number;
  sequence6: number;
  created_at?: string;
  updated_at?: string;
}

// Créer ou mettre à jour les notes d'une matière pour un élève
export const saveNotes = async (
  idInscription: number,
  idMatiere: number,
  notes: NotePayload
): Promise<NoteResponse> => {
  const response = await api.post<NoteResponse>(
    `${BASE_NOTE_SERVICE}/notes/create/${idInscription}/${idMatiere}/`,
    notes
  );
  return response.data;
};

// Optionnel : Récupérer les notes existantes d'un élève pour une matière
export const getNotesByEleveAndMatiere = async (
  idInscription: number,
  idMatiere: number
): Promise<NoteResponse> => {
  const response = await api.get<NoteResponse>(
    `${BASE_NOTE_SERVICE}/notes/${idInscription}/${idMatiere}/`
  );
  return response.data;
};

// Optionnel : Récupérer toutes les notes d'un élève
export const getAllNotesByEleve = async (idInscription: number): Promise<NoteResponse[]> => {
  const response = await api.get<NoteResponse[]>(
    `${BASE_NOTE_SERVICE}/notes/eleve/${idInscription}/`
  );
  return response.data;
};