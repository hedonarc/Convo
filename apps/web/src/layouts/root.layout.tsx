import { Outlet } from "react-router";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/providers/theme";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Outlet />
    </ThemeProvider>
  );
}
