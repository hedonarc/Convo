import { ROUTES } from "@shared/constants";
import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/providers";

export default function GuestLayout() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={ROUTES.CHAT} replace />;
  return <Outlet />;
}
