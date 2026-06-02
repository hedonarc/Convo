import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/providers";
import { ROUTES } from "@/shared/constants";

export default function GuestLayout() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={ROUTES.CHAT} replace />;
  return <Outlet />;
}
