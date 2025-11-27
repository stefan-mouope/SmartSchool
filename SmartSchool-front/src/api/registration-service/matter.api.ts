import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";

export interface SubjectTypeResponse {
  id: number;
  name: string;
  school_id: number;
  school: {
    id: number;
    name: string;
  };
}

export const createMatter = async (schoolId: number, name: string):Promise<void>  => {
  const response = await api.post<void>(`${BASE_REGISTRATION}/api/matters`, {school_id: schoolId, name});
  return response.data;
}

export const getMattersBySchool = async (schoolId: number):Promise<SubjectTypeResponse[]>  => {
  const response = await api.get<SubjectTypeResponse[]>(`${BASE_REGISTRATION}/api/matters/school/${schoolId}`);
  return response.data;
}

export const getMatterById = async (id: number):Promise<{id:number; name:string; school_id:number;}>  => {
  const response = await api.get<{id:number; name:string; school_id:number;}>(`${BASE_REGISTRATION}/api/matters/${id}`);
  return response.data;
}