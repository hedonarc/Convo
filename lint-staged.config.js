/**
 * Pre-commit checks for staged files. Kept fast — no full tsc, no full eslint
 * sweep, no test run. Only changed files are touched.
 *
 * - eslint runs inside `apps/web` so it picks up `apps/web/eslint.config.js`.
 *   `shared/**` is intentionally NOT linted (the eslint flat config there
 *   resolves to no config for files outside `apps/web`).
 * - prettier runs from the repo root (which now ships `prettier-plugin-
 *   tailwindcss` so the plugin resolves against the root `.prettierrc`).
 */
export default {
  "apps/web/src/**/*.{ts,tsx}": [
    "pnpm -F @convo/web exec eslint --fix",
  ],
  "**/*.{ts,tsx,json,md,yaml,yml,css,html}": ["prettier --write"],
};
