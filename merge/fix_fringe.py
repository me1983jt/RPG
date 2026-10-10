#!/usr/bin/env python3
"""Remove leftover magenta backdrop fringe (v4 polish).
 - props/trees: the soft (semi-alpha) edge pixels that are magenta-tinted are recoloured from their
   non-pink neighbours (same rule as apk-kit/clean_sheets.py depink_prop);
 - character sheets: opaque magenta pixels on the outline (within 2 px of transparency) are recoloured
   from non-pink neighbours, or dropped when they have none. Interior colours are never touched.
usage: fix_fringe.py file.png ...   (in place)"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
def fix(path):
    a = np.array(Image.open(path).convert("RGBA")); r, g, b, al = (a[..., i].astype(int) for i in range(4))
    mag = (al > 0) & (r > 100) & (r > g + 40) & (b > g + 25)
    edge = ndi.binary_dilation(al < 24, iterations=2)
    bad = mag & (edge | (al < 250))
    out = a.copy(); H, W = bad.shape
    for y, x in zip(*np.nonzero(bad)):
        y0, y1, x0, x1 = max(0, y - 2), min(H, y + 3), max(0, x - 2), min(W, x + 3)
        win = a[y0:y1, x0:x1].reshape(-1, 4)
        ok = win[(win[:, 3] > 24) & ~bad[y0:y1, x0:x1].reshape(-1)]
        if len(ok) >= 3: out[y, x, :3] = np.median(ok[:, :3], axis=0).astype(np.uint8)
        else: out[y, x, 3] = 0
    Image.fromarray(out).save(path); return int(bad.sum())

def fix_interior(path):
    """Isolated saturated-magenta pixels inside figures (backdrop that showed through gaps)."""
    a = np.array(Image.open(path).convert("RGBA")); r, g, b, al = (a[..., i].astype(int) for i in range(4))
    mag = (al > 0) & (r > 140) & (g < 80) & (b > 95) & (b - g > 55) & (r - g > 90)
    lab, n = ndi.label(mag)
    sizes = ndi.sum(mag, lab, range(1, n + 1)) if n else []
    bad = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s <= 6])
    out = a.copy(); H, W = bad.shape
    for y, x in zip(*np.nonzero(bad)):
        y0, y1, x0, x1 = max(0, y - 2), min(H, y + 3), max(0, x - 2), min(W, x + 3)
        win = a[y0:y1, x0:x1].reshape(-1, 4)
        ok = win[(win[:, 3] > 24) & ~mag[y0:y1, x0:x1].reshape(-1)]
        if len(ok) >= 3: out[y, x, :3] = np.median(ok[:, :3], axis=0).astype(np.uint8)
        else: out[y, x, 3] = 0
    Image.fromarray(out).save(path); return int(bad.sum())

if __name__ == "__main__":
    for p in sys.argv[1:]: print(p.split("/")[-1], fix(p), fix_interior(p))
