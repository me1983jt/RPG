"""Prepare transparent 2x environmental PNG placeholders for Maine.
Usage: python scripts/maine-hd-prepare.py native_dir hd_dir
Requires Pillow. Existing HD artwork is never overwritten.
"""
import argparse
from pathlib import Path
from PIL import Image

def prepare(source, target):
    source, target = Path(source).resolve(), Path(target).resolve()
    if not source.is_dir():
        raise ValueError("Native directory does not exist")
    if source == target or source in target.parents or target in source.parents:
        raise ValueError("Use separate, non-nested directories")
    created = skipped = 0
    for path in sorted(source.rglob("*.png")):
        output = target / path.relative_to(source)
        if output.exists():
            skipped += 1
            continue
        with Image.open(path) as image:
            rgba = image.convert("RGBA")
            result = rgba.resize((rgba.width * 2, rgba.height * 2), Image.Resampling.NEAREST)
            output.parent.mkdir(parents=True, exist_ok=True)
            result.save(output)
        created += 1
    return created, skipped

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("native", type=Path)
    parser.add_argument("hd", type=Path)
    args = parser.parse_args()
    created, skipped = prepare(args.native, args.hd)
    print(f"Created {created} placeholders; preserved {skipped} existing assets")
