import "./index.css";
import { config } from "./config";

const font = config.font;
switch (font) {
  case "Inter":
    import("@fontsource/inter");
    break;
  case "Roboto":
    import("@fontsource/roboto");
    break;
  case "Abel":
    import("@fontsource/abel");
    break;
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Apply global font and colors (from flavor system)
document.documentElement.style.setProperty("--app-font", config.font);
document.documentElement.style.setProperty(
  "--color-primary",
  config.theme.primary,
);
document.documentElement.style.setProperty(
  "--color-bg",
  config.theme.background,
);
document.documentElement.style.setProperty("--color-text", config.theme.text);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
