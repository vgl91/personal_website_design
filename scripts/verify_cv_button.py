"""Verify the open-cv refactor."""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
js = (ROOT / "js" / "script.js").read_text(encoding="utf-8")

print("=== HTML checks ===")
id_count = len(re.findall(r'id="open-cv"', html))
print(f'  id="open-cv" count (should be 0): {id_count}')

data_count = len(re.findall(r"data-open-cv", html))
print(f"  data-open-cv count (should be 2): {data_count}")

hero_cta = re.search(r'<div class="hero-cta">(.*?)</div>', html, re.DOTALL)
if hero_cta:
    buttons = re.findall(r"<a\s+href|<button", hero_cta.group(1))
    print(f"  Hero CTA buttons (should be 3): {len(buttons)}")
    has_cv = "home_cta_download" in hero_cta.group(1)
    print(f"  Hero CTA has CV button: {has_cv}")
else:
    print("  WARNING: hero-cta not found")

print()
print("=== JS checks ===")
print(f'  Selector #open-cv still in JS: {"#open-cv" in js} (should be False)')
print(f"  Selector [data-open-cv] in JS: {'[data-open-cv]' in js} (should be True)")
print(f"  lastOpener var in JS: {'lastOpener' in js} (should be True)")

# Quick sanity: keys still consistent
import json
en = json.loads((ROOT / "languages" / "en.json").read_text(encoding="utf-8"))
es = json.loads((ROOT / "languages" / "es.json").read_text(encoding="utf-8"))
html_keys = set(re.findall(r'data-text="([^"]+)"', html))
en_keys = set(en.keys())
es_keys = set(es.keys())
print()
print("=== Translation keys ===")
print(f"  HTML data-text keys: {len(html_keys)}")
print(f"  Missing in EN: {html_keys - en_keys or 'none'}")
print(f"  Missing in ES: {html_keys - es_keys or 'none'}")
