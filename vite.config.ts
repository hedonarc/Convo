import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// Single-package layout — the workspace-era `@shared` alias and per-package
// node_modules pins (needed when `shared/` pulled deps through a sibling
// workspace) are gone. `@/shared/*` resolves under the single `@ → ./src`
// alias; dependencies resolve via the standard Node module-resolution chain.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: "public",
  server: {
    port: 3000,
  },
});
