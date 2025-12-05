// src/services/noteService.ts
import { api } from "./axios";
import { BASE_NOTE_SERVICE } from "./axios";

// Types
export interface NotePayload {
  sequence1?: number | null;
  sequence2?: number | null;
  sequence3?: number | null;
  sequence4?: number | null;
  sequence5?: number | null;
  sequence6?: number | null;
  trimestre1?: number | null;
  trimestre2?: number | null;
  trimestre3?: number | null;
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
  trimestre1?: number;
  trimestre2?: number;
  trimestre3?: number;
  created_at?: string;
  updated_at?: string;
}

// === FONCTIONS ===

// Créer ou mettre à jour toutes les notes d'une matière
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


// Récupérer les notes d'un élève pour une matière

export const getNotesByEleveAndMatiere = async (
  idInscription: number,
  idMatiere: number
): Promise<NoteResponse | null> => {
  try {
    const response = await api.get<NoteResponse>(
      `${BASE_NOTE_SERVICE}/notes/notes/${idInscription}/${idMatiere}/`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};


export const updateNote = async (
  idInscription: number,
  idMatiere: number,
  updates: Partial<NotePayload>
): Promise<{ success: boolean; data?: NoteResponse; message?: string }> => {
  try {
    const response = await api.put<NoteResponse>(
      `${BASE_NOTE_SERVICE}/notes/update/${idInscription}/${idMatiere}/`,
      updates
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Erreur mise à jour note :", error.response?.data || error);
    return {
      success: false,
      message:
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Échec de la mise à jour de la note",
    };
  }
};


export const saveOrUpdateNote = async (
  idInscription: number,
  idMatiere: number,
  payload: NotePayload
): Promise<{
  success: boolean;
  created: boolean;
  data?: NoteResponse;
  message?: string;
}> => {
  try {
    const response = await api.post<NoteResponse>(
      `${BASE_NOTE_SERVICE}/notes/save/${idInscription}/${idMatiere}/`,
      payload
    );

    // Toujours renvoyer un objet avec success et created
    return {
      success: true,
      created: true, // ou false si tu implémentes update côté backend
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      created: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erreur inconnue lors de la sauvegarde",
    };
  }
};
