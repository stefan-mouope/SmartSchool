import { api } from "../axios";
import { BASE_REGISTRATION } from "../axios";


interface AcademicYearType{
  
    start_data:string,
    end_data:string
}


interface AcademicYearTypeResponse{
    id:number,
    start_date:string,
    end_date:string
}


export const createAcademic = async (data: AcademicYearType):Promise<AcademicYearTypeResponse> =>{
    const response = await api.post<AcademicYearTypeResponse>(`${BASE_REGISTRATION}/api/academic-years`, data)
    return response.data
}


export const getAcademicYearBySchoolId = async (schoolId:number):Promise<AcademicYearTypeResponse> => {
    const response = await api.get<AcademicYearTypeResponse>(`${BASE_REGISTRATION}/api/academic-years/current/${schoolId}`);
    return response.data
}