import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { loginRequest, logoutRequest, refreshRequest, getMeRequest } from "../api/auth";
import { registerAuthInterceptors } from "../api/axios";

interface AuthState {
  access: string | null;
  refresh: string | null;
  user: any | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loadUser: () => Promise<void>;
}

// Crée un wrapper pour devtools + persist
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        access: null,
        refresh: null,
        user: null,

        login: async (username, password) => {
          const data = await loginRequest(username, password);
          set({ access: data.access, refresh: data.refresh }, false, "login");
          await get().loadUser();
          return true;
        },

        logout: async () => {
          try { await logoutRequest(); } catch {}
          set({ access: null, refresh: null, user: null }, false, "logout");
        },

        refreshToken: async () => {
          const refresh = get().refresh;
          if (!refresh) return false;

          try {
            const data = await refreshRequest(refresh);
            set({ access: data.access }, false, "refreshToken");
            return true;
          } catch {
            set({ access: null, refresh: null }, false, "refreshTokenFailed");
            return false;
          }
        },

        loadUser: async () => {
          try {
            const me = await getMeRequest();
            set({ user: me }, false, "loadUser");
          } catch {
            set({ user: null }, false, "loadUserFailed");
          }
        },
      }),
      { name: "auth-storage", version: 1 }
    ),
    { name: "AuthStore", anonymousActionType: "ANONYMOUS" }
  )
);

registerAuthInterceptors(
  () => useAuthStore.getState().access,
  () => useAuthStore.getState().refreshToken()
);
