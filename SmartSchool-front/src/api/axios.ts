import axios from "axios";


// Remplace tes anciennes constantes par ÇA :
export const BASE_REGISTRATION = "/registration-service"
export const BASE_NOTE_SERVICE = "/note-service"
export const BASE_AUTH_SERVICE = "/auth-service"
export const BASE_INSCRIPTION_SERVICE = "/inscription-service"

// Base URL: set VITE_API_BASE_URL in .env, default to Django local
// ==== BASE URL ====
// export const BASE_REGISTRATION = "REGISTRATION-SERVICE";
// export const BASE_NOTE_SERVICE = "NOTE-SERVICE";
// export const BASE_AUTH_SERVICE = "AUTH-SERVICE";
// export const BASE_ISCRIPTION_SERVICE = "SERVICE-INSCRIPTION";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ===== Injected functions =====
let getAccessToken: () => string | null = () => null;
let refreshTokens: () => Promise<boolean> = async () => false;
let logoutUser: () => void = () => {};

// ===== Export interceptors registration =====
export const registerAuthInterceptors = (
  getAccess: () => string | null,
  refresh: () => Promise<boolean>,
  logout: () => void // NEW !!!
) => {
  getAccessToken = getAccess;
  refreshTokens = refresh;
  logoutUser = logout;
};

// ==== Queue to prevent parallel refresh ====
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

// ==================== REQUEST INTERCEPTOR ======================

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ======================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    if (!original) return Promise.reject(error);

    const status = error.response?.status;

    // ------------ CAS 401 / 403 SUR REFRESH REQUEST ------------
    // Si la requête qui échoue est /token/refresh → refresh token invalide
    if (original.url?.includes("token/refresh") && (status === 401 || status === 403)) {
      logoutUser();      // 🔥 déconnexion immédiate
      return Promise.reject(error);
    }

    // ------------ CAS 401 SUR LES REQUÊTES NORMALES ------------
    if ((status === 401 || status === 403) && !original._retry) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = refreshTokens()
          .then((ok) => {
            if (!ok) {
              logoutUser();  // 🔥 logout si refresh échoue
              processQueue(new Error("refresh_failed"));
              return false;
            }

            processQueue(null);
            return true;
          })
          .catch(() => {
            logoutUser();  // 🔥 logout si erreur serveur
            processQueue(new Error("refresh_failed"));
            return false;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });

        refreshPromise!.then((ok) => {
          if (!ok) return reject(error);
          resolve(api(original));
        });
      });
    }

    return Promise.reject(error);
  }
);
