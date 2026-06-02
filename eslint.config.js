import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default defineConfig([
  globalIgnores(["dist", ".react-router/"]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  // shadcn-style UI primitives in src/shared/ui legitimately export both a
  // component AND its variants/helpers from the same file (Button + buttonVariants,
  // Toast + ToastProvider + useToast, …). The react-refresh "only export
  // components" rule fights that pattern; relax it here without affecting app
  // code where the rule's HMR benefit actually matters. Same for the
  // empty-interface pattern (`interface Foo extends BaseProps {}`) which is
  // a common shadcn shape kept for forward extensibility.
  {
    files: ["src/shared/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  eslintConfigPrettier,
]);
