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

* ✔ Use lowercase only
* ✔ Maximum 72 characters total
* ✔ Keep description short and meaningful (recommended ≤ 50 chars)
* ✔ No full sentences (avoid "I fixed...", "I added...")
* ✔ No vague messages like "update", "fix bug", "final changes"

### 🧩 Allowed Types

* `feat` → new feature
* `fix` → bug fix
* `chore` → maintenance tasks (deps, config, etc.)
* `refactor` → code changes without behavior change
* `docs` → documentation changes
* `test` → adding or updating tests

### 💡 Examples

```bash
feat: add real-time messaging API
fix: resolve authentication token issue
chore: update ruff configuration
refactor: simplify chat serializer logic
```

---

## ⚙️ Pre-commit Hooks

We use pre-commit hooks to automatically enforce code quality and commit conventions across the entire repository.

### Installation

Run these commands from the **root** of the project:

```bash
# Install hooks using the backend environment
uv run --project backend pre-commit install --hook-type pre-commit
uv run --project backend pre-commit install --hook-type commit-msg
```

These hooks will run automatically on every commit. If they fail, the commit will be rejected, and you'll need to fix the issues before trying again.
