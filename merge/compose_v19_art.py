#!/usr/bin/env python3
"""v19 art merge (Grok Build export of Oct 11) onto combined-v19/public/game.
 - hero walk sheets (5 weapons) + hero attack strips + Sarah: taken from v19, magenta outline
   fringe recoloured, stray detached specks removed (cell by cell);
 - boss / raid-raider attack + death strips, tractor-run, farm-room: taken from v19 as is
   (they're drawn from the same figures combined already uses);
 - death strips for the base raiders (v19 drew a different man than the combined raiders) are built here from the side (W) walk
   frame: 4 frames falling backwards onto the ground (176x124 cells like v19's).
Animal death strips come from render_animals.py --dead (same model as the walk sheets).
usage: compose_v19_art.py <v19 public/game> <combined public/game>"""
import sys, shutil, numpy as np
from PIL import Image
from scipy import ndimage as ndi

def magenta(a):
    r, g, b = (a[..., i].astype(int) for i in range(3))
    return (r - g > 30) & (b - g > 10)

def defringe(a):
    a = a.copy(); al = a[..., 3].astype(int)
    edge = ndi.binary_dilation(al < 24, iterations=2) & (al > 0)
    bad = magenta(a) & (edge | (al < 200))
    H, W = bad.shape; src = a.copy()
    for y, x in zip(*np.nonzero(bad)):
        y0, y1, x0, x1 = max(0, y - 2), min(H, y + 3), max(0, x - 2), min(W, x + 3)
        win = src[y0:y1, x0:x1].reshape(-1, 4)
        ok = win[(win[:, 3] > 24) & ~bad[y0:y1, x0:x1].reshape(-1)]
        if len(ok) >= 3 and src[y, x, 3] >= 128: a[y, x, :3] = np.median(ok[:, :3], axis=0).astype(np.uint8)
        else: a[y, x, 3] = 0
    return a, int(bad.sum())

def deinterior(a, maxsize=12):
    """small opaque magenta clusters inside the figure (backdrop seen through gaps by the hands)"""
    a = a.copy(); m = magenta(a) & (a[..., 3] > 24)
    lab, n = ndi.label(m)
    if not n: return a, 0
    sizes = ndi.sum(m, lab, range(1, n + 1))
    bad = np.isin(lab, [i + 1 for i, s_ in enumerate(sizes) if s_ <= maxsize])
    H, W = bad.shape; src = a.copy()
    for y, x in zip(*np.nonzero(bad)):
        y0, y1, x0, x1 = max(0, y - 2), min(H, y + 3), max(0, x - 2), min(W, x + 3)
        win = src[y0:y1, x0:x1].reshape(-1, 4)
        ok = win[(win[:, 3] > 24) & ~m[y0:y1, x0:x1].reshape(-1)]
        if len(ok) >= 3: a[y, x, :3] = np.median(ok[:, :3], axis=0).astype(np.uint8)
        else: a[y, x, 3] = 0
    return a, int(bad.sum())

def despeck(cell, keep=30, near=3):
    m = cell[..., 3] > 24
    lab, n = ndi.label(m, structure=np.ones((3, 3)))
    if n <= 1: return cell, 0
    sizes = ndi.sum(m, lab, range(1, n + 1)); big = int(np.argmax(sizes)) + 1
    grown = ndi.binary_dilation(lab == big, iterations=near)
    out = cell.copy(); removed = 0
    for i, s in enumerate(sizes, 1):
        if i == big or s >= keep: continue
        if (grown & (lab == i)).any(): continue
        out[lab == i, 3] = 0; removed += int(s)
    return out, removed

def clean_sheet(src, dst, rows):
    a = np.array(Image.open(src).convert("RGBA")); H, W = a.shape[:2]
    a, fr = defringe(a)
    a, fi = deinterior(a); fr += fi
    ch, cw = H // rows, W // 4; sp = 0
    for r in range(rows):
        for c in range(4):
            cell, k = despeck(a[r*ch:(r+1)*ch, c*cw:(c+1)*cw]); a[r*ch:(r+1)*ch, c*cw:(c+1)*cw] = cell; sp += k
    Image.fromarray(a).save(dst); return fr, sp

def fall_strip(sheet_path, dst, flip=False, cell=(176, 124)):
    """Side (W, row 2) frame 0 tipping backwards around the feet: 0, 28, 62, 88 degrees."""
    im = Image.open(sheet_path).convert("RGBA"); W, H = im.size; cw, ch = W // 4, H // 8
    # the W frame with the narrowest stance (legs together) falls flat; a mid-stride one lands crooked
    def width(c):
        m = np.array(im.crop((c * cw, 2 * ch, (c + 1) * cw, 3 * ch)))[..., 3] > 24; xs = np.where(m.any(0))[0]
        return xs.max() - xs.min()
    c0 = min(range(4), key=width)
    fig = im.crop((c0 * cw, 2 * ch, (c0 + 1) * cw, 3 * ch))
    if flip: fig = fig.transpose(Image.FLIP_LEFT_RIGHT)
    a = np.array(fig)[..., 3] > 24; ys, xs = np.where(a)
    fx, fy = (xs[ys >= ys.max() - 3].mean(), ys.max())          # feet
    CW, CH = cell; strip = Image.new("RGBA", (CW * 4, CH))
    top = ys <= ys.min() + (ys.max() - ys.min()) * .2; hx, hy = xs[top].mean(), ys[top].mean()
    low = ys >= ys.max() - (ys.max() - ys.min()) * .2; lx_, ly_ = xs[low].mean(), ys[low].mean()
    lean = np.degrees(np.arctan2(lx_ - hx, ly_ - hy))          # >0: head ahead (left) of the feet
    final = 88 + lean                                        # so the body ends lying flat
    for i, ang in enumerate((0, final * .32, final * .7, final)):
        big = Image.new("RGBA", (CW * 2, CH * 2)); px, py = CW * .62, CH * 1.5
        big.alpha_composite(fig, (int(px - fx), int(py - fy)))
        rot = big.rotate(-ang, resample=Image.BICUBIC, center=(px, py))   # head falls to the right (backwards for a W-facing figure)
        al = np.array(rot)[..., 3] > 24; yy, xx = np.where(al)
        drop = (CH - 6) - yy.max()                                      # rest on the cell floor
        x0 = int((xx.min() + xx.max()) / 2 - CW / 2)
        frame = rot.crop((x0, int(yy.max() - (CH - 6) + 0), x0 + CW, int(yy.max() + 6)))
        if i == 3:
            f = np.array(frame).astype(float); f[..., :3] *= .9; frame = Image.fromarray(f.astype(np.uint8), "RGBA")
        strip.alpha_composite(frame, (i * CW, 0))
    strip.save(dst)

if __name__ == "__main__":
    V, C = sys.argv[1], sys.argv[2]
    for n in ["hero", "hero-axe", "hero-pick", "hero-gun", "hero-knife"]:
        print(n, "walk fringe/specks", clean_sheet(f"{V}/{n}.png", f"{C}/{n}.png", 8))
        print(n, "atk fringe/specks", clean_sheet(f"{V}/{n}-atk.png", f"{C}/{n}-atk.png", 1))
        # hero death: drawn at runtime by tipping the dyed side frame (keeps the worn colours)
    print("npc-sarah fringe/specks", clean_sheet(f"{V}/npc-sarah.png", f"{C}/npc-sarah.png", 8))
    for n in ["raider", "raider-gray", "raider-blue"]:
        fall_strip(f"{C}/{n}.png", f"{C}/{n}-dead.png")
    for b in ["boss-fur", "boss-mask", "boss-saw"] + [f"raider-{k}" for k in ["armor", "atv", "brute", "jumper", "scout", "shield", "torch"]]:
        for s in ["atk", "dead"]: shutil.copyfile(f"{V}/{b}-{s}.png", f"{C}/{b}-{s}.png")
    for n in ["tractor-run", "farm-room"]: shutil.copyfile(f"{V}/{n}.png", f"{C}/{n}.png")
    print("done")
