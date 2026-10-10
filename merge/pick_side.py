#!/usr/bin/env python3
"""hero-pick side rows (2 = left, 6 = right) for the v18 merge.

v18's own pick side rows have the requested coat outfit but the legs barely move and the
pickaxe floats above the head, not touching the hero. This builds them from the clean
tan-coat side walk in hero.png (same coat, real stride) with v18's pickaxe (the separate
blob in v18 hero-pick row 2) slung across the back, drawn behind the body.
usage: pick_side.py <v9 hero.png> <v18 hero-pick.png> <sheet to edit in place>
"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
CW, CH = 88, 124
hero = np.array(Image.open(sys.argv[1]).convert("RGBA"))
v18 = np.array(Image.open(sys.argv[2]).convert("RGBA"))
out = np.array(Image.open(sys.argv[3]).convert("RGBA"))
src = v18[2 * CH:3 * CH, 0:CW]
lab, n = ndimage.label(src[..., 3] > 24, structure=np.ones((3, 3)))
sl = ndimage.find_objects(lab)
# the pickaxe is the blob that starts at the top of the cell
k = min(range(n), key=lambda i: sl[i][0].start)
ys, xs = sl[k]
pick = src[ys, xs].copy()
pick[lab[ys, xs] != k + 1] = 0
pick = np.array(Image.fromarray(pick).rotate(-28, resample=Image.NEAREST, expand=True))
ph, pw = pick.shape[:2]
for row, mirror in ((2, False), (6, True)):
    for c in range(4):
        body = hero[row * CH:(row + 1) * CH, c * CW:(c + 1) * CW]
        al = body[..., 3] > 24
        yy, xx = np.where(al)
        top = yy.min()
        torso = al[top + 18:top + 40]
        tx = np.where(torso.any(0))[0]
        p = pick[:, ::-1] if mirror else pick
        # back of the torso: right edge when facing left (row 2), left edge when facing right
        cx = (tx.max() - 4) if not mirror else (tx.min() + 4)
        x0 = cx - pw // 2
        y0 = top + 4
        cell = np.zeros_like(body)
        for y in range(ph):
            for x in range(pw):
                if p[y, x, 3] > 24 and 0 <= y0 + y < CH and 0 <= x0 + x < CW:
                    cell[y0 + y, x0 + x] = p[y, x]
        m = body[..., 3] > 0
        cell[m] = body[m]
        out[row * CH:(row + 1) * CH, c * CW:(c + 1) * CW] = cell
Image.fromarray(out).save(sys.argv[3])
print("pick side rows rebuilt")
