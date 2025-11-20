import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";

interface teacherType{
    id: number;
    school_id: number;
    user_id: number;
    last_name: string;
    first_name: string;
    birth_date: string;
}

export  const createTeacher = async (dataTeacher:teacherType):Promise<teacherType> => {
    const response = await api.post<teacherType>(`${BASE_REGISTRATION}/tearches`,dataTeacher)
    return response.data
}

export const getTeacherById = async (id: number):Promise<teacherType>  => {
    const response = await api.get<teacherType>(`${BASE_REGISTRATION}/tearches/${id}`);
    return response.data;
}
export const getTeacherBySchoolId = async (schoolId:number): Promise<teacherType> => {
    const response = await api.get<teacherType>(`${BASE_REGISTRATION}/tearches/school/${schoolId}`);
    return response.data
}