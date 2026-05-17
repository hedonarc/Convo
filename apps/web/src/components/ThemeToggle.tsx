import { useTheme } from "@/providers";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <span>🌙</span> : <span>☀️</span>}
    </button>
  );
}
