# Backend Translations

The backend uses a custom, lightweight JSON-based translation system for managing localized messages.

## File Structure

- **Implementation:** `backend/utils/translations.py`
- **Data Store:** `backend/translations/en.json`

## How to Add Translations

Add new keys to `backend/translations/en.json`. Use nested objects to group related messages.

Example `en.json`:
```json
{
  "auth": {
    "login_success": "Welcome back!",
    "login_failed": "Invalid credentials."
  }
}
```

## How to Use in Code

Import the `t` function from `utils.translations` and use dot-notation to access keys.

```python
from utils.translations import t

# Basic usage
message = t("auth.login_success")

# If a key is missing, it returns the key itself
error = t("non_existent.key") # returns "non_existent.key"
```

## Best Practices

- **Dotted Keys:** Always use lowercase dotted notation (e.g., `category.subcategory.message`).
- **Grouping:** Group translations by functional area (e.g., `validation`, `auth`, `conversations`).
- **Fallbacks:** The system currently returns the key itself if a translation is missing. Ensure keys are descriptive enough to be readable if the translation fails to load.
