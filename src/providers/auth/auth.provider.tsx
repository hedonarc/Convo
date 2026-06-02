import axios from "axios";
import { useEffect, useState } from "react";

import { AUTH_EXPIRED_EVENT, authApi, usersApi } from "@/shared/api";
import type { User } from "@/shared/types/user";

import { AuthContext } from "./auth.context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const bootstrap = async () => {
      try {
        const me = await usersApi.me(controller.signal);
        if (!controller.signal.aborted) setUser(me);
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (!controller.signal.aborted) setUser(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    bootstrap();

    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);

    return () => {
      controller.abort();
      window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
    };
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
