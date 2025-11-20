import { promises } from "dns";
import { api } from "./axios";

interface Loginresult{
  access:string,
  refresh:string

}

export const loginRequest = async (
  email: string,
  password: string
): Promise<Loginresult> => {
  const res = await api.post<Loginresult>("/auth/login/", { email, password });
  return res.data;
};


export const logoutRequest = async (refresh: string) => {
  const res = await api.post("/auth/logout/", { refresh });
  return res.data;
};

export const refreshRequest = async (refresh: string) => {
  const res = await api.post("/auth/token/refresh/", { refresh });
  return res.data; // { access }
};

export const getMeRequest = async () => {
  const res = await api.get("/auth/all_profils/");
  return res.data; // user object
};
