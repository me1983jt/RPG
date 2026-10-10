#!/usr/bin/env python3
"""Key out the magenta backdrop Grok Build left in some v18 art (stand-up, blind, *-atk poses...).
Magenta-hued pixels (red and blue both well above green) become transparent, then up to two rings of
pink-tinted edge pixels next to them. Reds, oranges (fire), browns and greens are untouched.
usage: key_magenta.py file.png ...   (in place; prints pixels removed)
"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
for p in sys.argv[1:]:
    a = np.array(Image.open(p).convert("RGBA"))
    r, g, b, al = (a[..., i].astype(int) for i in range(4))
    mag = (al > 0) & (r > 120) & (b > 90) & (r - g > 50) & (b - g > 40)
    n = int(mag.sum())
    a[mag] = 0
    for _ in range(2):
        r, g, b, al = (a[..., i].astype(int) for i in range(4))
        ring = (al > 0) & ndi.binary_dilation(al == 0) & (r > g + 25) & (b > g + 15)
        n += int(ring.sum()); a[ring] = 0
    Image.fromarray(a).save(p)
    print(p.split("/")[-1], "keyed", n)
