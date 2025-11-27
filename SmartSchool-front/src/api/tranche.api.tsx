import { api } from "./axios";
import { BASE_INSCRIPTION_SERVICE } from "./axios";

export interface TrancheData {
  id?: number;
  tranche_name: string;
  amount: number;
  school_id: number;
}

export interface TranchePayload {
  tranche_name: string;
  amount: number;
  school_id: number;
}

export interface TrancheResult {
  id: number;
  tranche_name: string;
  amount: number;
  school_id: number;
  created_at?: string;
  updated_at?: string;
}

// ➕ Créer une nouvelle tranche
export const createTranche = async (payload: TranchePayload): Promise<TrancheResult> => {
  const res = await api.post<TrancheResult>(`${BASE_INSCRIPTION_SERVICE}/api/tranches`, payload);
  return res.data;
};

// 📄 Récupérer toutes les tranches
export const getAllTranches = async (): Promise<TrancheResult[]> => {
  const res = await api.get<TrancheResult[]>(`${BASE_INSCRIPTION_SERVICE}/api/tranches`);
  console.log(res.data);
  return res.data;
};

// 📄 Récupérer les tranches par school_id
export const getTranchesBySchool = async (school_id: number): Promise<TrancheResult[]> => {
  const res = await api.get<TrancheResult[]>(`${BASE_INSCRIPTION_SERVICE}/api/tranches`, {
    params: { school_id }
  });
  return res.data;
};

// 🔍 Récupérer une tranche par ID
export const getTrancheById = async (id: number): Promise<TrancheResult> => {
  const res = await api.get<TrancheResult>(`${BASE_INSCRIPTION_SERVICE}/api/tranches/${id}`);
  return res.data;
};

// ✏️ Mettre à jour une tranche
export const updateTranche = async (id: number, payload: Partial<TranchePayload>): Promise<TrancheResult> => {
  const res = await api.put<TrancheResult>(`${BASE_INSCRIPTION_SERVICE}/api/tranches/${id}`, payload);
  return res.data;
};

// 🗑️ Supprimer une tranche
export const deleteTranche = async (id: number): Promise<void> => {
  await api.delete(`${BASE_INSCRIPTION_SERVICE}/api/tranches/${id}`);
};