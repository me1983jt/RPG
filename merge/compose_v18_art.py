#!/usr/bin/env python3
"""Pick the best rows for the character sheets of the v18 merge (see NOTES-v18-merge.md).

Rows: 0 down, 1 down-left, 2 left, 3 up-left, 4 up, 5 up-right, 6 right, 7 down-right (88x124 cells).
v18's diagonals are real 8-direction walks (seams closed with repair_seams.py); v18's straight
rows were re-strided by cutting legs apart and are broken, so those come from the clean v9 /
combined sheets. Animals stay the combined (v7-style) art with a squash-and-stretch walk added.
usage: compose_v18_art.py <v9 game dir> <v18 game dir> <combined game dir> <out game dir>
"""
import os, sys, subprocess, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from repair_seams import repair
CW, CH = 88, 124
v9, v18, comb, out = sys.argv[1:5]
ld = lambda p: np.array(Image.open(p).convert("RGBA"))

def rows_from(dst, src, rows):
    for r in rows: dst[r * CH:(r + 1) * CH] = src[r * CH:(r + 1) * CH]

sys.path.insert(0, "/workspace/maine-rpg/apk-kit")
from clean_sheets import clean_cell

def fix_broken_frames(a, name):
    """Some v18 diagonal frames (mostly frame 0) have a shin/boot cut loose from the body; the build's
    sheet cleanup would delete it and leave a one-legged frame. Score each diagonal frame by how many
    pixels the cleanup would drop and replace badly broken ones with the opposite-phase frame."""
    for r in (1, 3, 5, 7):
        drop = []
        for c in range(4):
            cell = a[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW]
            drop.append(clean_cell(cell.copy())[1])
        for c in range(4):
            if drop[c] <= 120: continue
            alt = [(c + 2) % 4, (c + 1) % 4, (c + 3) % 4]
            good = [k for k in alt if drop[k] <= 120]
            if not good: continue
            k = good[0]
            a[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW] = a[r * CH:(r + 1) * CH, k * CW:(k + 1) * CW]
            print(f"   {name} row {r}: frame {c} (drops {drop[c]} px) <- frame {k}")

tmp = "/tmp/_v18rep.png"
for name in ["hero", "hero-axe", "hero-gun", "hero-knife", "hero-pick", "npc-sarah"]:
    repair(os.path.join(v18, name + ".png"), tmp)
    a = ld(tmp)
    if name == "npc-sarah": rows_from(a, ld(os.path.join(comb, name + ".png")), [0, 2, 4, 6])
    elif name == "hero-pick": rows_from(a, ld(os.path.join(v9, name + ".png")), [0, 4])
    else: rows_from(a, ld(os.path.join(v9, name + ".png")), [0, 2, 4, 6])
    fix_broken_frames(a, name)
    Image.fromarray(a).save(os.path.join(out, name + ".png"))
    print("composed", name)
subprocess.run([sys.executable, os.path.join(HERE, "pick_side.py"), os.path.join(v9, "hero.png"),
                os.path.join(v18, "hero-pick.png"), os.path.join(out, "hero-pick.png")], check=True)
# Justin: v18 sheet is broken in the straight rows and its diagonals are a different man; keep combined.
Image.open(os.path.join(comb, "npc-justin.png")).save(os.path.join(out, "npc-justin.png"))

def squash(cell, sy, sx, dx=0):
    """Rescale a cell's figure about its feet (bottom centre)."""
    al = cell[..., 3] > 24
    ys, xs = np.where(al)
    if len(ys) == 0: return cell
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    fig = Image.fromarray(cell[y0:y1, x0:x1])
    w, h = max(1, round((x1 - x0) * sx)), max(1, round((y1 - y0) * sy))
    fig = np.array(fig.resize((w, h), Image.NEAREST))
    o = np.zeros_like(cell)
    cx = (x0 + x1) // 2 + dx
    ny0, nx0 = max(0, y1 - h), max(0, cx - w // 2)
    fh, fw = min(h, CH - ny0), min(w, CW - nx0)
    o[ny0:ny0 + fh, nx0:nx0 + fw] = fig[h - fh:, :fw]
    return o

HOP = [(1.0, 1.0), (1.10, .94), (1.0, 1.0), (.90, 1.06)]
TROT = [(1.0, 1.0, 0), (1.035, .985, 1), (1.0, 1.0, 0), (.97, 1.015, -1)]
for name, rows, pat in [("rabbit", range(8), "hop"), ("squirrel", range(8), "hop"),
                        ("coyote", (0, 4), "trot"), ("wolf", (0, 4), "trot"), ("moose", (0, 4), "trot"), ("deer", (0, 4), "trot")]:
    a = ld(os.path.join(comb, name + ".png"))
    for r in rows:
        base = a[r * CH:(r + 1) * CH, 0:CW].copy()
        for c in range(4):
            if pat == "hop": sy, sx = HOP[c]; dx = 0
            else: sy, sx, dx = TROT[c]
            a[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW] = squash(base, sy, sx, dx)
    Image.fromarray(a).save(os.path.join(out, name + ".png"))
    print("animated", name, pat, list(rows))
