"""Final HTML & asset validation."""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent

# File sizes
files = ['index.html', 'css/style.css', 'js/script.js', 'languages/en.json', 'languages/es.json']
print('=== File sizes ===')
for f in files:
    p = ROOT / f
    print(f'  {f:30s} {p.stat().st_size:>8} bytes')

html = (ROOT / 'index.html').read_text(encoding='utf-8')
print()
print('=== HTML structure checks ===')

# h1 should appear exactly once
h1_count = len(re.findall(r'<h1\b', html))
print(f'  {"OK" if h1_count == 1 else "WARN":4s} h1 count: {h1_count} (should be 1)')

# All <img> should have alt
imgs_no_alt = re.findall(r'<img(?![^>]*\salt=)[^>]*>', html, re.IGNORECASE)
print(f'  {"OK" if len(imgs_no_alt) == 0 else "WARN":4s} img without alt: {len(imgs_no_alt)}')

# Sections
sections = len(re.findall(r'<section', html))
print(f'  {"OK" if sections >= 6 else "WARN":4s} section count: {sections}')

# Required bits
for label, pattern in [
    ('lang="en"',            r'<html\s+lang="en"'),
    ('data-theme on html',   r'<html[^>]*data-theme'),
    ('OG title',             r'og:title'),
    ('Twitter card',         r'twitter:card'),
    ('JSON-LD',              r'application/ld\+json'),
    ('manifest link',        r'manifest\.json'),
    ('skip link',            r'class="skip-link"'),
    ('main tag',             r'<main\b'),
    ('lazy/eager loading',   r'loading="(?:lazy|eager)"'),
    ('aria-label flags',     r'aria-label="(?:English|Español)"'),
    ('noinline styles',      r'style="'),
    ('prefers-reduced-motion in CSS', None),
]:
    if pattern is None:
        css = (ROOT / 'css/style.css').read_text(encoding='utf-8')
        ok = 'prefers-reduced-motion' in css
        print(f'  {"OK" if ok else "FAIL":4s} {label}: {ok}')
    else:
        matches = re.findall(pattern, html, re.IGNORECASE)
        ok = len(matches) > 0
        print(f'  {"OK" if ok else "FAIL":4s} {label}: {len(matches)}')

# Check for broken refs
print()
print('=== Asset references ===')
refs = set(re.findall(r'(?:href|src)="([^"]+)"', html))
broken = []
for ref in refs:
    if ref.startswith(('http', 'mailto:', 'tel:', '#', 'data:')):
        continue
    if ref.startswith('/'):
        continue
    full = ROOT / ref
    if not full.exists():
        broken.append(ref)
if broken:
    print(f'  WARN broken local refs: {broken}')
else:
    print(f'  OK All {len([r for r in refs if not r.startswith(("http","mailto","tel","#","data:"))])} local refs resolve')
