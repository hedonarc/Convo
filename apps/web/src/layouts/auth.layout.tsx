import { ROUTES } from "@shared/constants";
import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/providers";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />;
}
