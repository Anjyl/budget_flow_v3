import { useSheet } from "@/contexts/SheetContext";

export function useAuth() {
  const { auth, setAuth, isAuthenticated } = useSheet();

  const logout = async () => {
    setAuth(null);
  };

  return {
    user: auth ?? null,
    isAuthenticated,
    loading: false,
    logout,
  };
}
