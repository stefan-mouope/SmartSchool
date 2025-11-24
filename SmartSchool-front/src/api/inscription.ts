import { api } from "./axios";
import { BASE_ISCRIPTION_SERVICE } from "./axios";


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

export interface InscriptionResult {
  id: number;
  student_id:number;
  Student: {
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
  const res = await api.post<InscriptionResult>(`${BASE_ISCRIPTION_SERVICE}/api/inscriptions`, payload);
  return res.data;
};

// 📄 Récupérer toutes les inscriptions
export const getAllInscriptions = async (): Promise<InscriptionResult[]> => {
  const res = await api.get<InscriptionResult[]>(`${BASE_ISCRIPTION_SERVICE}/api/inscriptions`);
  console.log(res.data)
  return res.data;
};

// 🔍 Récupérer une inscription par ID
export const getInscriptionById = async (id: number): Promise<InscriptionResult> => {
  const res = await api.get<InscriptionResult>(`${BASE_ISCRIPTION_SERVICE}/api/inscriptions/${id}`);
  return res.data;
};

// 🗑️ Supprimer une inscription
export const deleteInscription = async (id: number): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(`http://localhost:5000/api/api/inscriptions/${id}`);
  return res.data;
};
