import { api } from "./axios";

export interface StudentData {
  last_name: string;
  first_name: string;
  birth_date?: string;
  adress?: string;
  sex?: string;
  phone_parent?: string;
  school_id: number;
}

export interface InscriptionPayload {
  student: StudentData;
  academieYear_id: number;
  classRoom_id: number;
}

export interface InscriptionResult {
  id: number;
  student: {
    id: number;
    matricule: string;
    last_name: string;
    first_name: string;
    birth_date?: string;
    adress?: string;
    sex?: string;
    phone_parent?: string;
    school_id: number;
  };
  academieYear_id: number;
  classRoom_id: number;
}

// ➕ Créer une nouvelle inscription
export const createInscription = async (payload: InscriptionPayload): Promise<InscriptionResult> => {
  const res = await api.post<InscriptionResult>("http://localhost:5000/api/inscriptions", payload);
  return res.data;
};

// 📄 Récupérer toutes les inscriptions
export const getAllInscriptions = async (): Promise<InscriptionResult[]> => {
  const res = await api.get<InscriptionResult[]>("http://localhost:5000/api/inscriptions");
  return res.data;
};

// 🔍 Récupérer une inscription par ID
export const getInscriptionById = async (id: number): Promise<InscriptionResult> => {
  const res = await api.get<InscriptionResult>(`http://localhost:5000/api/inscriptions/${id}`);
  return res.data;
};

// 🗑️ Supprimer une inscription
export const deleteInscription = async (id: number): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(`http://localhost:5000/api/inscriptions/${id}`);
  return res.data;
};
