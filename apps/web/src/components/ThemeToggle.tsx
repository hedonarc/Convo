import { Button } from "@shared/ui";
import { useTheme } from "@/providers";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button
      id="theme-toggle-button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Theme Toggle"
    >
      {theme === "light" ? (
        <Moon size={16} strokeWidth={2} className="text-text-primary" />
      ) : (
        <Sun size={16} strokeWidth={2} className="text-amber-500 dark:text-amber-400" />
      )}
    </Button>
  );
}
