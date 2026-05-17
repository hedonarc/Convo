import { useAuth } from "../providers/auth.provider";
import { ROUTES } from "@shared/constants";
import { Navigate, Outlet } from "react-router";

export default function GuestLayout() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={ROUTES.CHAT} replace />;
  return <Outlet />;
}
