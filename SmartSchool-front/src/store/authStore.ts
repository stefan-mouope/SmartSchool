import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import  jwtDecode  from "jwt-decode";

import { 
  loginRequest, 
  logoutRequest, 
  refreshRequest, 
  getMeRequest,
  registerRequest
} from "../api/auth";

import { registerAuthInterceptors } from "../api/axios";
import { getDirectorById } from "@/api/registration-service/director.api";
import { getTeacherById } from "@/api/registration-service/teacher.api";
import { getAcademicYearBySchoolId } from "@/api/registration-service/academicYear.api";

interface AuthState {
  access: string | null;
  refresh: string | null;
  user: any | null;
  school_id?: number | null;
  school_name?: string | null;
  academic_year_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; username: string; password: string; role: string }) => Promise<boolean>;

  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loadSchool: (role: string, id: number) => Promise<void>;
  loadAcademicYear: (school_id: number) => Promise<void>;
  updateFromEvent: (new_access: string, new_refresh: string) => void;

}

const handleGetMeRequest = (role: string, id: number) => {
  if (role === "directeur") {
    return getDirectorById(id);
  } else if (role === "enseignant") {
    return getTeacherById(id);
  }
  return null;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({

        access: null,
        refresh: null,
        user: null,
        school_id: null,
        school_name: null,
        start_date: null,
        end_date: null,
        academic_year_id: null,

        // LOGIN
       login: async (email, password) => {
        const data = await loginRequest(email, password);
        const decoded: any = jwtDecode(data.access); // <-- ici
        const user = {
          user_id: decoded.user_id,
          registrie_id: decoded.registrie_id,
          email: decoded.email,
          username: decoded.username,
          role: decoded.role,
        };
        set({ access: data.access, refresh: data.refresh, user });
        await get().loadSchool(user.role, user.registrie_id);
        if (get().school_id) {
          await get().loadAcademicYear(get().school_id);
        }
        return true;
      },

        // REGISTER
        register: async ({ email, username, password, role }) => {
          try {
            await registerRequest({ email, username, password, role });
            return true;
          } catch (err) {
            console.log("Register error:", err);
            return false;
          }
        },

        // LOGOUT
        logout: async () => {
          try { await logoutRequest(get().refresh); } catch {}
          set({ access: null, refresh: null, user: null, school_id: null, academic_year_id: null });
        },

        // REFRESH TOKEN
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

        // LOAD SCHOOL
        loadSchool: async (role: string, id: number) => {
          try {
            const school = await handleGetMeRequest(role, id);
            set({ school_id: school?.school_id ?? null, school_name: school?.school_name ?? null });
          } catch {
            set({ school_id: null, school_name: null });
          }
        },

        // LOAD ACADEMIC YEAR
        loadAcademicYear: async (school_id: number) => {
          try {
            const academicYear = await getAcademicYearBySchoolId(school_id);
            set({ academic_year_id: academicYear.id ?? null, start_date: academicYear.start_date ?? null, end_date: academicYear.end_date ?? null });
          } catch {
            set({ academic_year_id: null, start_date: null, end_date: null });
          }
        },

        // update evenment from socket
        updateFromEvent: (new_access, new_refresh) => {
          try {
            const decoded: any = jwtDecode(new_access);

            const user = {
              user_id: decoded.user_id,
              registrie_id: decoded.registrie_id,
              email: decoded.email,
              username: decoded.username,
              role: decoded.role,
            };

            set({
              access: new_access,
              refresh: new_refresh,
              user,
            });
          } catch (err) {
            console.log("Erreur updateFromEvent:", err);
          }
        },


      }),
      { name: "auth-storage", version: 1 }
    ),
    { name: "AuthStore" }
  )
);

// Connect axios interceptors
registerAuthInterceptors(
  () => useAuthStore.getState().access,
  () => useAuthStore.getState().refreshToken(),
  () => useAuthStore.getState().logout()
);
