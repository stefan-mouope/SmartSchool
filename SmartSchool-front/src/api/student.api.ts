import { api } from "./axios";
import { BASE_INSCRIPTION_SERVICE } from "./axios";

export interface StudentData {
  id: number;
  matricule: string;
  last_name: string;
  first_name: string;
  birth_date?: string;
  adress?: string;
    sex?: string;
  phone_parent?: string;
  school_id: number;
}

export interface StudentPayload {
  last_name: string;
  first_name: string;
  birth_date?: string;
  adress?: string;  
  sex?: string;
    phone_parent?: string;
    school_id: number;
}

export interface StudentResult {
  id: number;
  matricule: string;
  last_name: string;
  first_name: string;
  birth_date?: string;
  adress?: string;
    sex?: string;
  phone_parent?: string;
  school_id: number;
  created_at?: string;
  updated_at?: string;
}

// ➕ Créer un nouvel étudiant
export const createStudent = async (payload: StudentPayload): Promise<StudentResult> => {
  const res = await api.post<StudentResult>(`${BASE_INSCRIPTION_SERVICE}/api/eleves`, payload);
  return res.data;
};

// 📄 Récupérer tous les étudiants
export const getAllStudents = async (): Promise<StudentResult[]> => {
  const res = await api.get<StudentResult[]>(`${BASE_INSCRIPTION_SERVICE}/api/eleves`);
  console.log(res.data)
  return res.data;
};

// 🔍 Récupérer un étudiant par ID
export const getStudentById = async (id: number): Promise<StudentResult> => {
  const res = await api.get<StudentResult>(`${BASE_INSCRIPTION_SERVICE}/api/eleves/${id}`);
  return res.data;
};
// get student by school id
export const getStudentsBySchoolId = async (school_id: number): Promise<StudentResult[]> => {
  const res = await api.get<StudentResult[]>(`${BASE_INSCRIPTION_SERVICE}/api/eleves/school`, {
    params: { school_id }
  });
  return res.data;
}

// ✏️ Mettre à jour un étudiant
export const updateStudent = async (id: number, payload: Partial<StudentPayload>): Promise<StudentResult> => {
  const res = await api.put<StudentResult>(`${BASE_INSCRIPTION_SERVICE}/api/eleves/${id}`, payload);
  return res.data;
};

// 🗑️ Supprimer un étudiant
export const deleteStudent = async (id: number): Promise<void> => {
  await api.delete(`${BASE_INSCRIPTION_SERVICE}/api/eleves/${id}`);
};