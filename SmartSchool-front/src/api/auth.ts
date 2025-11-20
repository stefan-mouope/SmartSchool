import { promises } from "dns";
import { api } from "./axios";
import { BASE_AUTH_SERVICE } from "./axios";

interface Loginresult{
  access:string,
  refresh:string

}

interface RegisterResult{
  email:string,
  username:string,
  password:string,
  role:string,
}

export const registerRequest = async (
 data:RegisterResult
): Promise<RegisterResult> => {
  const res = await api.post<RegisterResult>(`${BASE_AUTH_SERVICE}/api/auth/register/`,data );
  console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',res.data);
  return res.data
};


export const loginRequest = async (
  email: string,
  password: string
): Promise<Loginresult> => {
  const res = await api.post<Loginresult>(`${BASE_AUTH_SERVICE}/api/auth/login/`, { email, password });
  console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',res.data);
  return res.data;
};


export const logoutRequest = async (refresh: string) => {
  const res = await api.post(`${BASE_AUTH_SERVICE}/api/auth/logout/`, { refresh });
  return res.data;
};

export const refreshRequest = async (refresh: string) => {
  const res = await api.post(`${BASE_AUTH_SERVICE}/api/auth/token/refresh/`, { refresh });
  return res.data; // { access }
};

export const getMeRequest = async () => {
  const res = await api.get(`${BASE_AUTH_SERVICE}/api/auth/all_profils/`);
  return res.data; // user object
};
