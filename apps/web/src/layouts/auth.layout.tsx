import { ROUTES } from "@shared/constants";
import { Navigate, Outlet } from "react-router";

import { useAuth } from "../providers/auth.provider";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />;
}
