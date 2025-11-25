
import { api } from "./axios";
import { BASE_REGISTRATION } from "./axios"; // ou BASE_ISCRIPTION_SERVICE selon ton choix


export interface Matiere {
  id: number;
  name: string;
  // Ajoute d'autres champs si besoin (coefficient, etc.)
}

export const getAllMatieres = async (): Promise<Matiere[]> => {
  try {
    const response = await api.get<Matiere[]>(`${BASE_REGISTRATION}/api/matters`);
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors du chargement des matières :", error);
    throw new Error(error.response?.data?.error || "Impossible de charger les matières");
  }
};



