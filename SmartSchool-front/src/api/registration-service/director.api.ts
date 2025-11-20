import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";
import { schoolResult } from "./school.api";

export interface directorType{
  school_id: number;
  last_name: string;
  first_name: string;
  password: string;
  username: string;
  email: string;
  role: string;
  birth_date: string;
  sex: string;
  

  }

export  interface DirectorTypeResponse{
  school:schoolResult;
  last_name: string;
  first_name: string;
  password: string;
  username: string;
  email: string;
  role: string;
  birth_date: string;
  sex: string;
}

export  const createDirector = async (dataDiector:directorType):Promise<directorType> => {
    const response = await api.post<directorType>(`${BASE_REGISTRATION}/api/directors`,dataDiector)
    return response.data
}

export const getDirectorById = async (id: number):Promise<directorType>  => {
    const response = await api.get<directorType>(`${BASE_REGISTRATION}/api/directors/${id}`);
    return response.data;
}
export const getDirectorBySchoolId = async (schoolId:number): Promise<directorType> => {
    const response = await api.get<directorType>(`${BASE_REGISTRATION}/api/directors/school/${schoolId}`);
    return response.data
}

export const getAllDirector = async (): Promise<directorType[]> => {
    const response = await api.get<directorType[]>(`${BASE_REGISTRATION}/api/directors`);
    return response.data
}