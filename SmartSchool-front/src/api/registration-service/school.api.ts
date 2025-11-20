import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";


interface schoolType{
  id: number;
   name: string;
   email: string;
   phone_school: string;
   region: string;
   city: string;
   location: string;
   founded_year: number;
}



export  const createSchool = async (schoolData: schoolType):Promise<schoolType>  => {
  const response = await api.post<schoolType>(`${BASE_REGISTRATION}/schools`, schoolData);
  return response.data;
}

export const getAllSchools = async ():Promise<schoolType[]>  => {
  const response = await api.get<schoolType[]>(`${BASE_REGISTRATION}/schools`);
  return response.data;
}

export const getSchoolById = async (id: number):Promise<schoolType>  => {
  const response = await api.get<schoolType>(`${BASE_REGISTRATION}/schools/${id}`);
  return response.data;
}

