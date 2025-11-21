import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";


export interface schoolType{
   name: string;
   email: string;
   phone_school: string;
   region: string;
   city: string;
   location: string;
   founded_year: number;
}

export interface schoolResult{
  id: number;
   name: string;
   email: string;
   phone_school: string;
   region: string;
   city: string;
   location: string;
   founded_year: number;
}


export  const createSchool = async (schoolData: schoolType):Promise<schoolResult>  => {
  const response = await api.post<schoolResult>(`${BASE_REGISTRATION}/api/schools`, schoolData);
  return response.data;
}

export const getAllSchools = async ():Promise<schoolResult[]>  => {
  const response = await api.get<schoolResult[]>(`${BASE_REGISTRATION}/api/schools`);
  return response.data;
}

export const getSchoolById = async (id: number):Promise<schoolResult>  => {
  const response = await api.get<schoolResult>(`${BASE_REGISTRATION}/api/schools/${id}`);
  return response.data;
}

