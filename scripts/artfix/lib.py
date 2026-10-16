"""v13.2 art cleanup helpers (edit existing PNGs only; originals are in art-backup-v13/)."""
import numpy as np
from PIL import Image

def load(p): return np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
def save(a, p): Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA').save(p, optimize=True)

def hsv(a):
    rgb = a[..., :3] / 255.0; mx = rgb.max(-1); mn = rgb.min(-1); d = mx - mn + 1e-6
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, d / (mx + 1e-6), mx

def magenta_mask(a, smin=.35, vmin=.3):
    h, s, v = hsv(a); return (a[..., 3] > 20) & (h > 280) & (h < 340) & (s > smin) & (v > vmin)

def green_mask(a):
    h, s, v = hsv(a); return (a[..., 3] > 20) & (h > 95) & (h < 150) & (s > .55) & (v > .45)

def fill_from_neighbours(a, bad, r=3, keep_alpha=True):
    """Replace bad pixels with the mean of good opaque neighbours; with none, make them clear."""
    out = a.copy(); H, W = bad.shape
    good = (a[..., 3] > 150) & ~bad
    ys, xs = np.nonzero(bad)
    for y, x in zip(ys, xs):
        y0, y1, x0, x1 = max(0, y - r), min(H, y + r + 1), max(0, x - r), min(W, x + r + 1)
        m = good[y0:y1, x0:x1]
        if m.sum() >= 2:
            out[y, x, :3] = a[y0:y1, x0:x1, :3][m].mean(0)
            if not keep_alpha: out[y, x, 3] = 255
        else:
            out[y, x, 3] = 0
    return out

def defringe(a):
    bad = magenta_mask(a) | green_mask(a)
    return fill_from_neighbours(a, bad), int(bad.sum())

def fill_holes(a, maxgap=2, passes=2, region=None):
    """Fill thin see-through gaps (cut bands, lattice holes): a clear pixel with opaque pixels within
    maxgap on both sides vertically, horizontally or diagonally gets their average colour."""
    out = a.copy(); total = 0
    for _ in range(passes):
        al = out[..., 3] > 150; H, W = al.shape; fill = np.zeros_like(al)
        for dy, dx in [(1, 0), (0, 1), (1, 1), (1, -1)]:
            for k1 in range(1, maxgap + 1):
                for k2 in range(1, maxgap + 1):
                    if k1 + k2 - 1 > maxgap: continue
                    A = np.zeros_like(al); B = np.zeros_like(al)
                    A[max(0, k1*dy):H, :] = 0
                    sa = np.roll(np.roll(al, k1 * dy, 0), k1 * dx, 1)
                    sb = np.roll(np.roll(al, -k2 * dy, 0), -k2 * dx, 1)
                    fill |= sa & sb
        fill &= ~al
        if region is not None: fill &= region
        if not fill.any(): break
        ys, xs = np.nonzero(fill)
        for y, x in zip(ys, xs):
            y0, y1, x0, x1 = max(0, y - maxgap), min(H, y + maxgap + 1), max(0, x - maxgap), min(W, x + maxgap + 1)
            m = al[y0:y1, x0:x1]
            if m.sum():
                out[y, x, :3] = out[y0:y1, x0:x1, :3][m].mean(0); out[y, x, 3] = 255
        total += int(fill.sum())
    return out, total

def frames(a, cols, rows=8):
    H, W = a.shape[:2]; return W // cols, H // rows

def recolor_hue(a, mask, target, keep_shade=True):
    """Recolor masked pixels to target RGB, keeping their shading."""
    out = a.copy(); rgb = a[..., :3]
    lum = rgb @ np.array([.3, .59, .11]); t = np.array(target, np.float32); tl = t @ np.array([.3, .59, .11])
    ref = np.median(lum[mask]) if mask.any() else tl
    sc = np.clip(lum / max(ref, 1), .45, 1.5)[..., None]
    out[..., :3] = np.where(mask[..., None], np.clip(t * sc, 0, 255), rgb)
    return out

from scipy import ndimage

def _short_gap(al, axis, maxgap):
    """Clear pixels inside a run of clear of length <= maxgap bounded by opaque on both ends along axis.
    Returns mask and (for interpolation) arrays of the low/high opaque index."""
    A = al if axis == 0 else al.T
    H, W = A.shape; m = np.zeros_like(A); lo = np.zeros(A.shape, int); hi = np.zeros(A.shape, int)
    for x in range(W):
        col = A[:, x]; y = 0
        while y < H:
            if col[y]: y += 1; continue
            s = y
            while y < H and not col[y]: y += 1
            if s > 0 and y < H and (y - s) <= maxgap:
                m[s:y, x] = True; lo[s:y, x] = s - 1; hi[s:y, x] = y
    if axis == 1: return m.T, lo.T, hi.T
    return m, lo, hi

def fix_cuts(a, maxgap=5, minlen=6, vert=True, diag=True):
    """Patch straight cut bands: horizontal see-through lines through a figure (and the vertical or
    diagonal cut lines that join them). Fill by interpolating across the cut."""
    out = a.copy(); al = a[..., 3] > 120; n = 0
    hm, lo, hi = _short_gap(al, 0, maxgap)
    lab, k = ndimage.label(hm)
    keep = np.zeros_like(hm)
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        hgt = sl[0].stop - sl[0].start; wid = sl[1].stop - sl[1].start
        if wid >= minlen and hgt <= maxgap and wid >= 2 * hgt: keep |= lab == i
    ys, xs = np.nonzero(keep)
    for y, x in zip(ys, xs):
        l, h = lo[y, x], hi[y, x]; t = (y - l) / max(1, h - l)
        out[y, x] = a[l, x] * (1 - t) + a[h, x] * t; out[y, x, 3] = 255
    n += len(ys)
    if vert:
        al2 = out[..., 3] > 120
        vm, lo2, hi2 = _short_gap(al2, 1, 5)
        lab, k = ndimage.label(vm)
        near = ndimage.binary_dilation(keep, iterations=3)
        for i, sl in enumerate(ndimage.find_objects(lab), 1):
            hgt = sl[0].stop - sl[0].start; wid = sl[1].stop - sl[1].start
            comp = lab == i
            if hgt >= 6 and wid <= 5 and hgt >= 2 * wid and (comp & near).any():
                ys, xs = np.nonzero(comp)
                for y, x in zip(ys, xs):
                    l, h = lo2[y, x], hi2[y, x]; t = (x - l) / max(1, h - l)
                    out[y, x] = out[y, l] * (1 - t) + out[y, h] * t; out[y, x, 3] = 255
                n += len(ys)
    if diag:
        al3 = out[..., 3] > 120
        # 1-2 px diagonal slits: clear pixel with opaque on both sides in at least 3 of 4 directions
        cnt = np.zeros(al3.shape, int)
        for dy, dx in [(1, 0), (0, 1), (1, 1), (1, -1)]:
            a1 = np.roll(np.roll(al3, dy, 0), dx, 1) | np.roll(np.roll(al3, 2 * dy, 0), 2 * dx, 1)
            a2 = np.roll(np.roll(al3, -dy, 0), -dx, 1) | np.roll(np.roll(al3, -2 * dy, 0), -2 * dx, 1)
            cnt += (a1 & a2)
        slit = (~al3) & (cnt >= 3)
        lab, k = ndimage.label(slit, structure=np.ones((3, 3)))
        for i, sl in enumerate(ndimage.find_objects(lab), 1):
            hgt = sl[0].stop - sl[0].start; wid = sl[1].stop - sl[1].start
            comp = lab == i
            if max(hgt, wid) >= 5 and comp.sum() <= 2.5 * max(hgt, wid):
                out = fill_from_neighbours(out, comp, r=2, keep_alpha=False); n += int(comp.sum())
    return out, n

def fix_slits(a, close=7, minlen=12, maxw=5):
    """Long thin see-through slits (diagonal cuts in death sheets): pixels that a closing fills,
    in components that are long and thin."""
    al = a[..., 3] > 120
    st = np.ones((close, close), bool)
    cl = ndimage.binary_closing(al, structure=st, iterations=1)
    cand = cl & ~al
    lab, k = ndimage.label(cand, structure=np.ones((3, 3)))
    bad = np.zeros_like(al)
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        comp = lab == i; n = comp.sum()
        L = max(sl[0].stop - sl[0].start, sl[1].stop - sl[1].start, int(np.hypot(sl[0].stop - sl[0].start, sl[1].stop - sl[1].start)))
        if L >= minlen and n / L <= maxw: bad |= comp
    out = a.copy()
    for _ in range(4):
        if not bad.any(): break
        o2 = fill_from_neighbours(out, bad, r=2, keep_alpha=False)
        filled = (o2[..., 3] > 0) & bad
        out = o2; out[bad & ~filled, 3] = 0; bad &= ~filled
    return out, int(cand.sum())

def fix_vseams(a, maxw=5, minh=18):
    """Vertical see-through seams through a body (frame-slicing cuts)."""
    out = a.copy(); al = a[..., 3] > 120
    vm, lo, hi = _short_gap(al, 1, maxw)
    lab, k = ndimage.label(vm); n = 0
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        hgt = sl[0].stop - sl[0].start; wid = sl[1].stop - sl[1].start
        if hgt >= minh and wid <= maxw:
            ys, xs = np.nonzero(lab == i)
            for y, x in zip(ys, xs):
                l, h = lo[y, x], hi[y, x]; t = (x - l) / max(1, h - l)
                out[y, x] = a[y, l] * (1 - t) + a[y, h] * t; out[y, x, 3] = 255
            n += len(ys)
    return out, n
