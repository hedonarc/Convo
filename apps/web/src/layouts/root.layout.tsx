import { Outlet } from "react-router";

import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/providers";
import { ThemeProvider } from "@/providers/theme";

export default function RootLayout() {
  const { isAuthenticated } = useAuth();
  return (
    <ThemeProvider>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
        <ThemeToggle />
        {isAuthenticated && <LogoutButton />}
      </div>
      <Outlet />
    </ThemeProvider>
  );
}
