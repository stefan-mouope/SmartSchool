import axios from "axios";

// Base URL: set VITE_API_BASE_URL in .env, default to Django local
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json", 
  },
  timeout: 10000,
});


let getAccessToken: () => string | null = () => null;
let refreshTokens: () => Promise<boolean> = async () => false;

export const registerAuthInterceptors = (
  getAccess: () => string | null,
  refresh: () => Promise<boolean>
) => {
  getAccessToken = getAccess;
  refreshTokens = refresh;
};


let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

type Resolver = (value: unknown) => void;
const pendingQueue: { resolve: Resolver; reject: Resolver }[] = [];

const processQueue = (error: unknown | null) => {
  while (pendingQueue.length) {
    const { resolve, reject } = pendingQueue.shift()!;
    if (error) reject(error);
    else resolve(true);
  }
};


api.interceptors.request.use(
  (config) => {
    const token = getAccessToken?.();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error) 
);


api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (!original) {
      return Promise.reject(error);
    }

  
    if (error.response?.status === 401 && !original._retry) { 
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshTokens()
          .then((ok) => {
            processQueue(ok ? null : new Error("refresh_failed"));
            return ok;
          })
          .catch((err) => {
            processQueue(err);
            return false;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
        (refreshPromise as Promise<boolean>)
          .then((ok) => {
            if (!ok) {
              reject(error);
              return;
            }
        
            resolve(api(original));
          })
          .catch(reject);
      });
    }

    return Promise.reject(error);
  }
);
