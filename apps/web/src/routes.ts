import { index, route, type RouteConfig } from "@react-router/dev/routes";

import { ROUTES } from "../../../shared/constants";

export default [
  index("pages/Home.tsx"),
  route(ROUTES.LOGIN, "pages/Login.tsx"),
  route(ROUTES.REGISTER, "pages/Register.tsx"),
] satisfies RouteConfig;
