import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../../shared"),
      clsx: path.resolve(__dirname, "./node_modules/clsx"),
      "tailwind-merge": path.resolve(
        __dirname,
        "./node_modules/tailwind-merge",
      ),
      "lucide-react": path.resolve(__dirname, "./node_modules/lucide-react"),
      axios: path.resolve(__dirname, "./node_modules/axios"),
      "class-variance-authority": path.resolve(
        __dirname,
        "./node_modules/class-variance-authority",
      ),
      zod: path.resolve(__dirname, "./node_modules/zod"),
    },
  },
  publicDir: "public",
  server: {
    port: 3000,
  },
});
