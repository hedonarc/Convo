import { themes, type Theme, type ThemeName } from "./themes";

interface AppConfig {
  name: string;
  apiBaseUrl: string;
  font: string;
  theme: Theme;
}

const { VITE_API_URL, VITE_FONT, VITE_THEME, VITE_NAME } = import.meta.env;

export const config: AppConfig = {
  name: VITE_NAME,
  apiBaseUrl: VITE_API_URL,
  font: VITE_FONT,
  theme: themes[VITE_THEME as ThemeName],
} as const;
