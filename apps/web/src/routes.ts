import { ROUTES } from "@convo/constants";
import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("pages/Home.tsx"),
  route(ROUTES.LOGIN, "pages/Login.tsx"),
  route(ROUTES.REGISTER, "pages/Register.tsx"),
] satisfies RouteConfig;
