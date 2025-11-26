import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";

// Ce que l'API renvoie
export interface TeacherType {
    id: number;
    school_id: number;
    user_id: number;
    last_name: string;
    first_name: string;
    birth_date: string;
}

// Ce qu'on envoie pour créer un enseignant
export interface TeacherCreateDTO {
    school_id: number;
    last_name: string;
    first_name: string;
    password: string;
    birth_date: string;
    sex: string;
}

export const createTeacher = async (dataTeacher: TeacherCreateDTO): Promise<TeacherType> => {
    const response = await api.post<TeacherType>(`${BASE_REGISTRATION}/teachers`, dataTeacher);
    return response.data;
};

export const getTeacherById = async (id: number): Promise<TeacherType> => {
    const response = await api.get<TeacherType>(`${BASE_REGISTRATION}/teachers/${id}`);
    return response.data;
};

export const getTeacherBySchoolId = async (schoolId: number): Promise<TeacherType[]> => {
    const response = await api.get<TeacherType[]>(`${BASE_REGISTRATION}/teachers/school/${schoolId}`);
    return response.data;
};
