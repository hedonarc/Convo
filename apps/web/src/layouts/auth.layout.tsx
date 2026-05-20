import { ROUTES } from "@shared/constants";
import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/providers";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (!isAuthenticated && !loading) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <Outlet />;
}
