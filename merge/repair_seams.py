#!/usr/bin/env python3
"""Close the seams Grok Build v18 left in its procedurally re-strided walk sheets.

v18 made legs move by cutting each figure at the hip/knee and shifting the pieces, which left
1-5 px fully transparent bands across the figure (and short see-through notches in single
columns). Per 88x124 cell:
  1. every fully empty horizontal band inside the figure's bbox that is <= MAXBAND px tall is
     filled: top half copies the row above, bottom half copies the row below;
  2. in the lower 65% of the figure, every column-wise transparent run <= MAXHOLE px with opaque
     pixels directly above and below is filled from the nearer neighbour.
Opaque pixels are never changed, so the art itself is untouched.
usage: repair_seams.py in.png out.png [cols rows]
"""
import sys, numpy as np
from PIL import Image
MAXBAND, MAXHOLE, A = 5, 3, 24

def repair_cell(c):
    al = c[..., 3] > A
    ys = np.where(al.any(1))[0]
    if len(ys) < 8: return 0
    y0, y1 = ys[0], ys[-1]
    n = 0
    band = al[y0:y1 + 1].any(1)
    y = y0
    while y <= y1:
        if not band[y - y0]:
            s = y
            while y <= y1 and not band[y - y0]: y += 1
            h = y - s
            if h <= MAXBAND:
                for k in range(h):
                    src = s - 1 if k < (h + 1) // 2 else y
                    c[s + k] = c[src]; n += c.shape[1]
        else: y += 1
    al = c[..., 3] > A
    top = int(y0 + (y1 - y0) * 0.35)
    for x in range(c.shape[1]):
        col = al[:, x]
        y = top
        while y <= y1:
            if not col[y] and col[y - 1]:
                s = y
                while y <= y1 and not col[y]: y += 1
                h = y - s
                if h <= MAXHOLE and y <= y1 and col[y]:
                    for k in range(h):
                        src = s - 1 if k < (h + 1) // 2 else y
                        c[s + k, x] = c[src, x]; n += 1
            else: y += 1
    return n

def repair(path, out, cols=4, rows=8):
    a = np.array(Image.open(path).convert("RGBA"))
    ch, cw = a.shape[0] // rows, a.shape[1] // cols
    tot = 0
    for r in range(rows):
        for q in range(cols):
            tot += repair_cell(a[r * ch:(r + 1) * ch, q * cw:(q + 1) * cw])
    Image.fromarray(a).save(out)
    return tot

if __name__ == "__main__":
    cols, rows = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (4, 8)
    print(sys.argv[1], "filled px:", repair(sys.argv[1], sys.argv[2], cols, rows))
