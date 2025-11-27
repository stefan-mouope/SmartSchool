import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";

export interface ClassTypeResponse {
  id: number;
  name: string;
  school_id: number;
  school: {
    id: number;
    name: string;
  };
}


export const createClassroom = async (school_id: number ,name: string,level: number):Promise<ClassTypeResponse>  => {
  const response = await api.post<ClassTypeResponse>(`${BASE_REGISTRATION}/api/classrooms`, {school_id, name, level});
  return response.data;
}

export const getClassroomsBySchool = async (schoolId: number):Promise<ClassTypeResponse[]>  => {
  const response = await api.get<ClassTypeResponse[]>(`${BASE_REGISTRATION}/api/classrooms/school/${schoolId}`);
  return response.data;
}

export const getClassroomById = async (id: number):Promise<{id:number; name:string; school_id:number;}>  => {
  const response = await api.get<{id:number; name:string; school_id:number;}>(`${BASE_REGISTRATION}/api/classrooms/${id}`);
  return response.data;
}

// recupere les level d'une ecole


export const getLevelsBySchool = async (schoolId: number):Promise<number[]>  => {
  const response = await api.get<number[]>(`${BASE_REGISTRATION}/api/classrooms/levels/school/${schoolId}`);
  return response.data;
}

export const getLevelsWithTranches = async (schoolId: number):Promise<any>  => {
  const response = await api.get<any>(`${BASE_REGISTRATION}/api/classrooms/school/${schoolId}/levels-tranches`);
  return response.data;
}
// j'aiermai que sur cet page tu ajoute une bouton qui vas permettre d'affiche une pages dans cette page on doit avoit avoit un tableau quiaffiche tous les niveau avec les tranche et leur montanche pour cahque niveau  pis au dessus du tableau il doit avoir un bouton qui va permttre de mettre les montant des tranche pour chaue niveau se modal doit affiche un select pour les niveau et pour chaque niveau doit mapper pour affcihe ;es diiffent tranche dans un input ou on poura saisir le montant de chaque tranche  
