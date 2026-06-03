"""Verify data-text keys are consistent between HTML, en.json, es.json."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
en = json.loads((ROOT / "languages" / "en.json").read_text(encoding="utf-8"))
es = json.loads((ROOT / "languages" / "es.json").read_text(encoding="utf-8"))

html_keys = set(re.findall(r'data-text="([^"]+)"', html))
en_keys = set(en.keys())
es_keys = set(es.keys())

print(f"HTML data-text keys:  {len(html_keys)}")
print(f"EN keys:              {len(en_keys)}")
print(f"ES keys:              {len(es_keys)}")

missing_en = html_keys - en_keys
missing_es = html_keys - es_keys

if missing_en:
    print(f"\n❌ Missing in EN.json ({len(missing_en)}):")
    for k in sorted(missing_en):
        print(f"   - {k}")
else:
    print("\n✓ All HTML keys present in EN.json")

if missing_es:
    print(f"\n❌ Missing in ES.json ({len(missing_es)}):")
    for k in sorted(missing_es):
        print(f"   - {k}")
else:
    print("✓ All HTML keys present in ES.json")

# Symmetric check
if en_keys != es_keys:
    print(f"\n⚠ EN/ES key mismatch:")
    print(f"   Only EN: {sorted(en_keys - es_keys)}")
    print(f"   Only ES: {sorted(es_keys - en_keys)}")
else:
    print("✓ EN and ES have identical key sets")

# Unused keys (not bad, just informational)
en_unused = en_keys - html_keys
if en_unused:
    print(f"\nℹ Keys in EN not referenced in HTML ({len(en_unused)}):")
    for k in sorted(en_unused):
        print(f"   - {k}")
