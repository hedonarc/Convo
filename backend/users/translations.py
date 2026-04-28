import json
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=1)
def _load_translations():
    translation_file = Path(__file__).resolve().parent / "translations" / "en.json"
    with translation_file.open(encoding="utf-8") as file:
        return json.load(file)


def t(key):
    return _load_translations().get(key, key)
