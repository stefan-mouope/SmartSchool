import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";


export const createMatter = async (schoolId: number, name: string):Promise<void>  => {
  const response = await api.post<void>(`${BASE_REGISTRATION}/matters`, {school_id: schoolId, name});
  return response.data;
}

export const getMattersBySchool = async (schoolId: number):Promise<{id:number; name:string;}[]>  => {
  const response = await api.get<{id:number; name:string;}[]>(`${BASE_REGISTRATION}/matters/school/${schoolId}`);
  return response.data;
}

export const getMatterById = async (id: number):Promise<{id:number; name:string; school_id:number;}>  => {
  const response = await api.get<{id:number; name:string; school_id:number;}>(`${BASE_REGISTRATION}/matters/${id}`);
  return response.data;
}