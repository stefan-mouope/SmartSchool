import { create } from "zustand";
import { persist } from "zustand/middleware";
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access: null,
      refresh: null,
      user: null,

      login: async (username, password) => {
        const data = await loginRequest(username, password);
        set({ access: data.access, refresh: data.refresh });
        await get().loadUser();
        return true;
      },

      logout: async () => {
        try { await logoutRequest(); } catch {}
        set({ access: null, refresh: null, user: null });
      },

      refreshToken: async () => {
        const refresh = get().refresh;
        if (!refresh) return false;

        try {
          const data = await refreshRequest(refresh);
          set({ access: data.access });
          return true;
        } catch {
          set({ access: null, refresh: null });
          return false;
        }
      },

      loadUser: async () => {
        try {
          const me = await getMeRequest();
          set({ user: me });
        } catch {
          set({ user: null });
        }
      }
    }),
    { name: "auth-storage" }
  )
);

registerAuthInterceptors(
  () => useAuthStore.getState().access,
  () => useAuthStore.getState().refreshToken()
);
