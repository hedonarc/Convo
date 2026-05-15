import { ROUTES } from "@shared/constants";
import { BrowserRouter as Router, Route, Routes } from "react-router";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

// You can create an AuthLayout later if you wish, for now we will just render the routes.

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
      </Routes>
    </Router>
  );
}
