import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";

interface directorType{
    id: number;
    school_id: number;
    user_id: number;
    last_name: string;
    first_name: string;
    birth_date: string;
}

export  const createDirector = async (dataDiector:directorType):Promise<directorType> => {
    const response = await api.post<directorType>(`${BASE_REGISTRATION}/directors`,dataDiector)
    return response.data
}

export const getDirectorById = async (id: number):Promise<directorType>  => {
    const response = await api.get<directorType>(`${BASE_REGISTRATION}/directors/${id}`);
    return response.data;
}
export const getDirectorBySchoolId = async (schoolId:number): Promise<directorType> => {
    const response = await api.get<directorType>(`${BASE_REGISTRATION}/directors/school/${schoolId}`);
    return response.data
}