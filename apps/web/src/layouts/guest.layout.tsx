import { ROUTES } from "@shared/constants";
import { Navigate, Outlet } from "react-router";

export default function GuestLayout() {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to={ROUTES.CHAT} replace />;
  return <Outlet />;
}
