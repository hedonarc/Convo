from functools import lru_cache
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


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
            logger.warning(f"Missing translation key: {key}")
            return key
        value = value[part]

    if isinstance(value, str):
        return value

    logger.warning(f"Invalid translation value for key: {key}")
    return key
