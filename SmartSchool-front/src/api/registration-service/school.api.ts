import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";

export interface schoolType {
  name: string;
  devise: string;
  email: string;
  phone_school: string;
  region: string;
  city: string;
  location: string;
  founded_year: number;
}

export interface schoolResult {
  id: number;
  name: string;
  devise: string;
  logo?: string;
  email: string;
  phone_school: string;
  region: string;
  city: string;
  location: string;
  founded_year: number;
}

// CRITIQUE : Modifier cette fonction pour accepter FormData
export const createSchool = async (formData: FormData): Promise<schoolResult> => {
  console.log('=== createSchool API ===');
  
  // Debug : Afficher le contenu du FormData
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
    } else {
      console.log(`${key}: ${value}`);
    }
  }
  
  // IMPORTANT : Envoyer avec le bon Content-Type pour FormData
  const response = await api.post<schoolResult>(
    `${BASE_REGISTRATION}/api/schools`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  console.log('Réponse serveur:', response.data);
  return response.data;
};

export const getAllSchools = async (): Promise<schoolResult[]> => {
  const response = await api.get<schoolResult[]>(`${BASE_REGISTRATION}/api/schools`);
  return response.data;
};

export const getSchoolById = async (id: number): Promise<schoolResult> => {
  const response = await api.get<schoolResult>(`${BASE_REGISTRATION}/api/schools/${id}`);
  return response.data;
};

export const findAllSchoolWithoutDirector = async (): Promise<schoolResult[]> => {
  const response = await api.get<schoolResult[]>(`${BASE_REGISTRATION}/api/schools/without-director`);
  console.log(response.data);
  return response.data;
};