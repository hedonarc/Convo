/**
 * Pre-commit checks for staged files. Kept fast — no full tsc, no full eslint
 * sweep, no test run. Only changed files are touched.
 *
 * Single-package layout — eslint runs from the repo root against the root
 * `eslint.config.js`. Prettier runs from the same root so the
 * `prettier-plugin-tailwindcss` plugin resolves against the root config.
 */
export default {
  "src/**/*.{ts,tsx}": ["eslint --fix"],
  "**/*.{ts,tsx,json,md,yaml,yml,css,html}": ["prettier --write"],
};
