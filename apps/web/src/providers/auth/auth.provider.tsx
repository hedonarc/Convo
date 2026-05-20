import { authApi } from "@shared/api";
import type { User } from "@shared/types/user";
import { useEffect, useState } from "react";

import { AuthContext } from "./auth.context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const res = await authApi.me(); // 🔥 checks cookie
      console.log(res);
      setUser(res);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
