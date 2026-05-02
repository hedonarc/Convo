from functools import lru_cache
import json
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _load_translations() -> dict[str, Any]:
    """Load and cache English translation messages from JSON."""
    translation_file = (
        Path(__file__).resolve().parent.parent / "translations" / "en.json"
    )

    try:
        with translation_file.open(encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error("Translation file not found at: %s", translation_file)
    except json.JSONDecodeError:
        logger.error("Failed to decode translation file at: %s", translation_file)

    return {}


def _get_nested(data: dict[str, Any], key: str) -> Any:
    """Safely retrieve nested dictionary values using dot notation."""
    for part in key.split("."):
        if not isinstance(data, dict) or part not in data:
            return None
        data = data[part]
    return data


def t(key: str) -> str:
    """Translate a dotted key into a localized string."""
    translations = _load_translations()
    value = _get_nested(translations, key)

    if isinstance(value, str):
        return value

    logger.warning("Missing or invalid translation key: %s", key)
    return key
