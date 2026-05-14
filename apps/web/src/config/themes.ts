export type ThemeName = "green" | "blue" | "dark" | "purple";
export type Theme = { primary: string; background: string; text: string };

export type Themes = Record<ThemeName, Theme>;

export const themes: Themes = {
  green: {
    primary: "#25D366",
    background: "#ffffff",
    text: "#111111",
  },

  blue: {
    primary: "#2563EB",
    background: "#ffffff",
    text: "#111111",
  },

  dark: {
    primary: "#8B5CF6",
    background: "#0F0F0F",
    text: "#ffffff",
  },

  purple: {
    primary: "#7C3AED",
    background: "#111827",
    text: "#ffffff",
  },
};
