import { BrowserRouter as Router, Route, Routes } from "react-router";

import { ROUTES } from "@/shared/constants";

import AuthLayout from "../layouts/auth.layout";
import GuestLayout from "../layouts/guest.layout";
import RootLayout from "../layouts/root.layout";
import Chat from "../pages/Chat";
import Invite from "../pages/Invite";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import Register from "../pages/Register";

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Root shell */}
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route element={<GuestLayout />}>
            <Route path={ROUTES.LANDING} element={<Landing />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.INVITE} element={<Invite />} />
          </Route>

          {/* Protected routes */}
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.CHAT} element={<Chat />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
