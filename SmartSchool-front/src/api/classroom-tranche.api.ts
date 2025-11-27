import { api } from "./axios";
import { BASE_INSCRIPTION_SERVICE } from "./axios";

export interface ClassRoomTrancheData {
  id?: number;
  classRoom_id: number;
  tranche_id: number;
  amount: number;
}
export interface ClassRoomTranchePayload {
  classRoom_id: number;
  tranche_id: number;
  amount: number;
}

export interface ClassRoomTrancheResult {
  id: number;
  classRoom_id: number;
  tranche_id: number;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

// ➕ Créer une nouvelle association classe-tranche
export const createClassRoomTranche = async (payload: ClassRoomTranchePayload): Promise<ClassRoomTrancheResult> => {
  const res = await api.post<ClassRoomTrancheResult>(`${BASE_INSCRIPTION_SERVICE}/api/classroom-tranches`, payload);
  return res.data;
};

// 📄 Récupérer toutes les associations classe-tranche
export const getAllClassRoomTranches = async (): Promise<ClassRoomTrancheResult[]> => {
  const res = await api.get<ClassRoomTrancheResult[]>(`${BASE_INSCRIPTION_SERVICE}/api/classroom-tranches`);
  console.log(res.data);
  return res.data;
};

// 📄 Récupérer les associations classe-tranche par classRoom_id
export const getClassRoomTranchesByClassRoom = async (classRoom_id: number): Promise<ClassRoomTrancheResult[]> => {
  const res = await api.get<ClassRoomTrancheResult[]>(`${BASE_INSCRIPTION_SERVICE}/api/classroom-tranches`, {
    params: { classRoom_id }
  });
  return res.data;
};
// update
export const updateClassRoomTranche = async (id: number, payload: Partial<ClassRoomTranchePayload>): Promise<ClassRoomTrancheResult> => {
  const res = await api.put<ClassRoomTrancheResult>(`${BASE_INSCRIPTION_SERVICE}/api/classroom-tranches/${id}`, payload);
  return res.data;
};

// 🗑️ Supprimer une association classe-tranche
export const deleteClassRoomTranche = async (id: number): Promise<void> => {
  await api.delete(`${BASE_INSCRIPTION_SERVICE}/api/classroom-tranches/${id}`);
};

