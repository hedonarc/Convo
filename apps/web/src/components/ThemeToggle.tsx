import { Button } from "@shared/ui";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/providers";
import { sharedText } from "@shared/constants/strings/index.en";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button
      id="theme-toggle-button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Theme Toggle"
      className="focus-visible:ring-ring inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-gray-100 focus-visible:ring-1 focus-visible:outline-none dark:hover:bg-gray-800"
      title={sharedText.themeToggle}
    >
      {theme === "light" ? (
        <Moon size={16} strokeWidth={2} className="text-text-primary" />
      ) : (
        <Sun
          size={16}
          strokeWidth={2}
          className="text-amber-500 dark:text-amber-400"
        />
      )}
    </Button>
  );
}
