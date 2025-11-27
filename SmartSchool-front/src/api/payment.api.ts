import { api } from "./axios";
import { BASE_INSCRIPTION_SERVICE } from "./axios";

export interface PaymentData {
  id?: number;
  inscription_id: number;
  tranche_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method?: string;
  reference?: string;
  school_id: number;
}

export interface PaymentPayload {
  inscription_id: number;
  tranche_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method?: string;
  reference?: string;
  school_id: number;
}

export interface PaymentResult {
  id: number;
  inscription_id: number;
  tranche_id: number;
  amount_paid: number;
  payment_date: string;
  payment_method?: string;
  reference?: string;
  school_id: number;
  created_at?: string;
  updated_at?: string;
  Inscription?: {
    id: number;
    Student: {
      id: number;
      matricule: string;
      first_name: string;
      last_name: string;
    };
    ClassRoom: {
      id: number;
      name: string;
    };
  };
  Tranche?: {
    id: number;
    tranche_name: string;
    amount: number;
  };
}

export interface PayementStats {
  total_collected: number;
  total_pending: number;
  total_expected: number;
  collection_rate: number;
  total_students: number;
  students_paid: number;
  students_pending: number;
}

// ➕ Créer un nouveau paiement
export const createPayment = async (inscription_id:number,tranche_id:number): Promise<PaymentResult> => {
  const res = await api.post<PaymentResult>(`${BASE_INSCRIPTION_SERVICE}/api/payements`, 
    { inscription_id, tranche_id }
  );
  return res.data;
};

// 📄 Récupérer tous les paiements
export const getAllPayements = async (): Promise<PaymentResult[]> => {
  const res = await api.get<PaymentResult[]>(`${BASE_INSCRIPTION_SERVICE}/api/payements`);
  return res.data;
};

// 📄 Récupérer les paiements par école
export const getPayementsBySchool = async (school_id: number): Promise<PaymentResult[]> => {
  const res = await api.get<PaymentResult[]>(`${BASE_INSCRIPTION_SERVICE}/api/payements`, {
    params: { school_id }
  });
  return res.data;
};

// 📊 Récupérer les statistiques des paiements
export const getPayementStats = async (school_id: number): Promise<PayementStats> => {
  const res = await api.get<PayementStats>(`${BASE_INSCRIPTION_SERVICE}/api/payements/stats`, {
    params: { school_id }
  });
  return res.data;
};

export const getPayementByYearStats = async (academieYear_id: number): Promise<PayementStats> => {
  const res = await api.get<PayementStats>(`${BASE_INSCRIPTION_SERVICE}/api/payements/stats/year/${academieYear_id}`);
console.log("🚀 ~ file: payment.api.ts:97 ~ getPayementByYearStats ~ res:", res.data);
  return res.data;
};


// 🔍 Récupérer un paiement par ID
export const getPaymentById = async (id: number): Promise<PaymentResult> => {
  const res = await api.get<PaymentResult>(`${BASE_INSCRIPTION_SERVICE}/api/payements/${id}`);
  return res.data;
};

// 📄 Récupérer les paiements d'une inscription
export const getPayementsByInscription = async (inscription_id: number): Promise<PaymentResult[]> => {
  const res = await api.get<PaymentResult[]>(`${BASE_INSCRIPTION_SERVICE}/api/payements/inscription/${inscription_id}`);
  return res.data;
};

// ✏️ Mettre à jour un paiement
export const updatePayment = async (id: number, payload: Partial<PaymentPayload>): Promise<PaymentResult> => {
  const res = await api.put<PaymentResult>(`${BASE_INSCRIPTION_SERVICE}/api/payements/${id}`, payload);
  return res.data;
};

// 🗑️ Supprimer un paiement
export const deletePayment = async (id: number): Promise<void> => {
  await api.delete(`${BASE_INSCRIPTION_SERVICE}/api/payements/${id}`);
};