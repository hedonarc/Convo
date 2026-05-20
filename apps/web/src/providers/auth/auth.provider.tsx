import { authApi } from "@shared/api";
import type { User } from "@shared/types/user";
import { useState } from "react";

import { AuthContext } from "./auth.context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
