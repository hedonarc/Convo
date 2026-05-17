import { ROUTES } from "@shared/constants";
import { Navigate, Outlet } from "react-router";

export default function AuthLayout() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />;
}
