import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";

export  interface teacherResponseType{
    id?: number;
    school_id: number;
    user_id: number;
    last_name: string;
    first_name: string;
    birth_date: string;
}

interface teacherType{
    school_id: number;
    last_name: string;
    first_name: string;
    email: string;
    password: string;
    birth_date: string;
}

export  const createTeacher = async (dataTeacher:teacherType):Promise<teacherResponseType> => {
    const response = await api.post<teacherResponseType>(`${BASE_REGISTRATION}/api/teachers`,dataTeacher)
    return response.data
}

export const getTeacherById = async (id: number):Promise<teacherResponseType>  => {
    const response = await api.get<teacherResponseType>(`${BASE_REGISTRATION}/api/teachers/${id}`);
    return response.data;
}
export const getTeacherBySchoolId = async (schoolId:number): Promise<teacherResponseType> => {
    const response = await api.get<teacherResponseType>(`${BASE_REGISTRATION}/api/teachers/school/${schoolId}`);
    return response.data
}