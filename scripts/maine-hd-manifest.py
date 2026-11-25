"""Validate 2x PNG sprite sheets against native-resolution reference sheets.
Usage: python scripts/maine-hd-manifest.py ORIGINAL_DIR HD_DIR manifest.json
Requires Pillow. This is an asset preparation tool, not an engine renderer.
"""
import argparse
import json
from pathlib import Path
from PIL import Image

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("original", type=Path)
    p.add_argument("hd", type=Path)
    p.add_argument("output", type=Path)
    a = p.parse_args()
    if not a.original.is_dir() or not a.hd.is_dir():
        p.error("Both input directories must exist")
    entries = []
    errors = []
    for source in sorted(a.original.rglob("*.png")):
        relative = source.relative_to(a.original)
        target = a.hd / relative
        if not target.is_file():
            errors.append(f"Missing: {relative}")
            continue
        with Image.open(source) as original, Image.open(target) as hd:
            w, h = original.size
            if hd.size != (2*w, 2*h):
                errors.append(f"Incorrect 2x dimensions: {relative}")
                continue
            if "A" not in hd.getbands() and "transparency" not in hd.info:
                errors.append(f"Missing transparency: {relative}")
                continue
            hd.load()
            entries.append({"asset": relative.as_posix(), "logical_width": w,
                            "logical_height": h, "pixel_width": 2*w,
                            "pixel_height": 2*h, "scale": 2})
    if errors or not entries:
        p.error("\n".join(errors) or "No PNG assets found")
    a.output.write_text(json.dumps({"version": 1, "scale": 2, "assets": entries}, indent=2) + "\n", encoding="utf-8")
    print(f"Validated {len(entries)} HD sheets")

if __name__ == "__main__":
    main()
