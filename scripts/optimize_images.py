"""Convert images to WebP with quality optimization."""
from pathlib import Path
from PIL import Image

IMG_DIR = Path(__file__).parent.parent / "img"
ASSETS_DIR = IMG_DIR / "portfolio"

# Portfolio images: lossy, q=80, max width 1200
for src in IMG_DIR.glob("portfolio*.jpg"):
    dst = src.with_suffix(".webp")
    with Image.open(src) as im:
        if im.width > 1200:
            ratio = 1200 / im.width
            new_size = (1200, int(im.height * ratio))
            im = im.resize(new_size, Image.LANCZOS)
        im.save(dst, "WEBP", quality=82, method=6)
    src_size = src.stat().st_size
    dst_size = dst.stat().st_size
    savings = (1 - dst_size / src_size) * 100
    print(f"{src.name} -> {dst.name}: {src_size//1024}KB -> {dst_size//1024}KB ({savings:.0f}% smaller)")

# Profile picture: q=85
src = IMG_DIR / "perfil.png"
dst = src.with_suffix(".webp")
with Image.open(src) as im:
    if im.width > 800:
        ratio = 800 / im.width
        new_size = (800, int(im.height * ratio))
        im = im.resize(new_size, Image.LANCZOS)
    im.save(dst, "WEBP", quality=85, method=6)
src_size = src.stat().st_size
dst_size = dst.stat().st_size
savings = (1 - dst_size / src_size) * 100
print(f"{src.name} -> {dst.name}: {src_size//1024}KB -> {dst_size//1024}KB ({savings:.0f}% smaller)")

print("\nDone!")
