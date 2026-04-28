import json
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=1)
def _load_translations():
    """Load and cache English translation messages from JSON."""
    translation_file = Path(__file__).resolve().parent / "translations" / "en.json"
    with translation_file.open(encoding="utf-8") as file:
        return json.load(file)


def t(key):
    value = _load_translations()
    for part in key.split("."):
        if not isinstance(value, dict) or part not in value:
            return key
        value = value[part]
    return value if isinstance(value, str) else key
