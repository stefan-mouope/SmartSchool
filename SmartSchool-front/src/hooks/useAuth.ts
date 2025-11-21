import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const { login, logout, user,register, access } = useAuthStore();

  return {
    isAuthenticated: !!access,
    user,
    login,
    register,
    logout,
  };
};
