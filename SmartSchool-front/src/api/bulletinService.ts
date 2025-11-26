import { api } from "@/api/axios";

const BASE_URL = "http://127.0.0.1:8081/api/bulletins";

// Générer bulletin individuel
export const genererBulletinEleve = async (eleveId: number, trimestre: string) => {
  const res = await api.post(`${BASE_URL}/generer/`, {
    eleve_id: eleveId,
    trimestre: trimestre
  });
  return res.data;
};

// Générer bulletins d'une classe
export const genererBulletinsClasse = async (classe: string, trimestre: string) => {
  const res = await api.post(`${BASE_URL}/generer/`, {
    classe: classe,
    trimestre: trimestre
  });
  return res.data;
};

// Générer pour toute l'année
export const genererBulletinsAnnee = async (annee: string) => {
  const res = await api.post(`${BASE_URL}/generer/`, {
    annee: annee,
  });
  return res.data;
};

// Exporter PDF

export const exportBulletinPDF = async (bulletinId: number): Promise<Blob> => {
  const response = await api.get<Blob>(`/bulletins/${bulletinId}/export/`, {
    responseType: 'blob', // ⚡ dit à Axios qu'on attend un Blob
  });
  return response.data; // ✅ type Blob
};
