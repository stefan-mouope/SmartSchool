import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const { login, logout, user, access } = useAuthStore();

  return {
    isAuthenticated: !!access,
    user,
    login,
    logout,
  };
};
