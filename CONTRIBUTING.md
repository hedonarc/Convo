# 🤝 Contributing to Convo

Thank you for contributing to Convo! To maintain a high-quality codebase and clean history, we follow these standards.

---

## Branches Structure

```
main → stable/production-ready code
dev → development branch

feature-* → feature branches
fix-* → bug fix branches
```

## 🧾 Commit Message Convention

We follow **Conventional Commits** to keep git history clean, readable, and automation-friendly.

### 📌 Format

```txt
type: short description
```

### 📏 Rules & Limitations

- ✔ Use lowercase only
- ✔ Maximum 72 characters total
- ✔ Keep description short and meaningful (recommended ≤ 50 chars)
- ✔ No full sentences (avoid "I fixed...", "I added...")
- ✔ No vague messages like "update", "fix bug", "final changes"

### 🧩 Allowed Types

- `feat` → new feature
- `fix` → bug fix
- `chore` → maintenance tasks (deps, config, etc.)
- `refactor` → code changes without behavior change
- `docs` → documentation changes
- `test` → adding or updating tests

### 🚀 Version Bumping (Semantic Versioning)

Because we use automated semantic versioning, your commit messages dictate the next version number. When your PR is merged to `main`, the version will be automatically bumped according to these rules:

- **MAJOR (Breaking Changes)** `x.0.0`: Add an exclamation mark `!` after the type (e.g., `feat!: new API`) or include `BREAKING CHANGE:` in the commit footer. This indicates an incompatible API change.
- **MINOR (Features)** `0.x.0`: Use the `feat` type (e.g., `feat: add user profile`). This indicates new, backwards-compatible functionality.
- **PATCH (Fixes & Perf)** `0.0.x`: Use the `fix` or `perf` type (e.g., `fix: resolve crash`). This indicates backwards-compatible bug fixes or performance improvements.
  _(Other types like `chore`, `docs`, `test`, `refactor` do not trigger a version release)._

### 💡 Examples

```bash
feat: add real-time messaging API
fix: resolve authentication token issue
chore: update ruff configuration
refactor: simplify chat serializer logic
```

---

## ⚙️ Pre-commit Hooks

We use pre-commit hooks to automatically enforce code quality and commit conventions across the entire repository. This ensures that:

- **Backend** code is linted and formatted with Ruff.
- **Frontend & Configs** are formatted with Prettier.
- **Frontend** code passes ESLint checks.
- **Commit Messages** follow the Conventional Commits standard.

### Installation

Run these commands from the **root** of the project:

```bash
# Install hooks (managed via the backend environment)
uv run --project backend pre-commit install --hook-type pre-commit
uv run --project backend pre-commit install --hook-type commit-msg
```

> **Note:** Frontend hooks require `pnpm` to be installed and available in your shell.

### Manual Execution

You can run the hooks manually at any time to verify your changes without making a commit:

```bash
# Run all hooks against all files
uv run --project backend pre-commit run --all-files

# Run only the frontend (ESLint) hook
uv run --project backend pre-commit run eslint --all-files

# Run only the backend (Ruff) hooks
uv run --project backend pre-commit run ruff --all-files
```
