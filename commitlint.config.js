/**
 * Conventional Commits enforcement. Allowed types mirror CONTRIBUTING.md so
 * the documented convention is the lived convention.
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "perf", "chore", "refactor", "docs", "test", "ci", "build"],
    ],
    "body-max-line-length": [0, "always"],
    "footer-max-line-length": [0, "always"],
  },
};
