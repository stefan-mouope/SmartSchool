import { api, BASE_NOTE_SERVICE } from "@/api/axios";

export const genererBulletin = async (payload: {
  inscription_id: number;
  classe_id: number;
  trimestre?: number;
  sequence?: number;
}) => {
  const res = await api.post(`${BASE_NOTE_SERVICE}/api/bulletins/generer/`, payload);
  return res.data;
};

