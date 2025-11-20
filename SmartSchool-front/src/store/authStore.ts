import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  loginRequest, 
  logoutRequest, 
  refreshRequest, 
  getMeRequest,
  registerRequest
} from "../api/auth";

import { registerAuthInterceptors } from "../api/axios";

interface AuthState {
  access: string | null;
  refresh: string | null;
  user: any | null;

  login: (email: string, password: string) => Promise<boolean>;                      // 👈 email
  register: (data: { email: string; username: string; password: string,role:string }) => Promise<boolean>;

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

      // 🔥 LOGIN AVEC EMAIL
      login: async (email, password) => {
        const data = await loginRequest(email, password);
        set({ access: data.access, refresh: data.refresh });
        await get().loadUser();
        return true;
      },

      // 🔥 REGISTER
      register: async ({ email, username, password ,role}) => {
        try {
          console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',email, username, password ,role);
          await registerRequest({ email, username, password,role });
          return true;
        } catch (err) {
          console.log("Register error:", err);
          return false;
        }
      },

      // 🔥 LOGOUT
      logout: async () => {
        try { await logoutRequest(get().refresh); } catch {}
        set({ access: null, refresh: null, user: null });
      },

      // 🔥 REFRESH TOKEN
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

      // 🔥 LOAD USER
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

// Connect axios interceptors <-> auth store
registerAuthInterceptors(
  () => useAuthStore.getState().access,
  () => useAuthStore.getState().refreshToken()
);
