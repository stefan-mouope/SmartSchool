import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";


export const createClassroom = async (schoolId: number, name: string):Promise<void>  => {
  const response = await api.post<void>(`${BASE_REGISTRATION}/api/classrooms`, {school_id: schoolId, name});
  return response.data;
}

export const getClassroomsBySchool = async (schoolId: number):Promise<{id:number}[]>  => {
  const response = await api.get<{id:number}[]>(`${BASE_REGISTRATION}/api/classrooms/school/${schoolId}`);
  return response.data;
}

export const getClassroomById = async (id: number):Promise<{id:number; name:string; school_id:number;}>  => {
  const response = await api.get<{id:number; name:string; school_id:number;}>(`${BASE_REGISTRATION}/api/classrooms/${id}`);
  return response.data;
}