import { Spinner } from "@shared/ui";
import { Outlet } from "react-router";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/providers";
import { ThemeProvider } from "@/providers/theme";

export default function RootLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <ThemeProvider>
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {/* Floating chrome — only for guest routes (Landing / Login / Register /
          Invite). Authenticated routes get theme + logout from the UserMenu
          in the sidebar, so the chrome would just duplicate it. */}
      {!isAuthenticated && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
          <ThemeToggle />
        </div>
      )}
      <Outlet />
    </ThemeProvider>
  );
}
