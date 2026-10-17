import numpy as np
from scipy import ndimage
from lib import hsv
LW = np.array([.3, .59, .11], np.float32)
def cells(a, cw, ch):
    H, W = a.shape[:2]
    for r0 in range(0, H - ch + 1, ch):
        for c0 in range(0, W - cw + 1, cw):
            yield r0 // ch, c0 // cw, (slice(r0, r0 + ch), slice(c0, c0 + cw))
def bbox(al):
    ys = np.nonzero(al.any(1))[0]; xs = np.nonzero(al.any(0))[0]
    return (ys.min(), ys.max(), xs.min(), xs.max()) if len(ys) else None
def skin_mask(a):
    h, s, v = hsv(a); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r > g) & (g >= b - 6) & (r - b > 28) & (v > .42) & (s >= .18) & (s <= .66) & (((h >= 4) & (h <= 42)))
def warm_skin(a, sk):
    out = a.copy(); out[sk, 0] = np.clip(a[sk, 0] * 1.05 + 3, 0, 255); out[sk, 2] = a[sk, 2] * .93
    return out
def shade(a, cw, ch, amt=.08):
    """Soft light from the upper left, shadow to the lower right, plus slight darkening near the edge."""
    out = a.copy()
    for _, _, sl in cells(a, cw, ch):
        al = a[sl][..., 3] > 40; bb = bbox(al)
        if not bb or al.sum() < 40: continue
        t, b, l, r = bb; yy, xx = np.mgrid[0:al.shape[0], 0:al.shape[1]]
        nx = (xx - (l + r) / 2) / max(1, (r - l) / 2); ny = (yy - (t + b) / 2) / max(1, (b - t) / 2)
        f = 1 - amt * np.clip((nx + ny * .6) / 1.6, -1, 1)
        d = ndimage.distance_transform_edt(al)
        f = f * (1 - .06 * np.clip(1 - (d - 1) / 3, 0, 1) * (nx > 0))  # rounder: lower-right rim a touch darker
        sub = out[sl]; sub[..., :3] = np.where(al[..., None], np.clip(sub[..., :3] * f[..., None], 0, 255), sub[..., :3])
    return out
def smooth_edges(a, dark_soften=.35):
    """Soft 1 px alpha edge without halos; soften over-dark outlines; interior untouched."""
    out = a.copy(); al = a[..., 3]; O = al >= 200
    k = np.ones((3, 3), np.float32) / 9
    cov = ndimage.convolve(O.astype(np.float32), k, mode='constant')
    inner = ndimage.binary_erosion(O, np.ones((3, 3)))
    rim = O & ~inner
    # colour of the opaque neighbours for each pixel (keeps edges free of halos)
    w = ndimage.convolve(O.astype(np.float32), np.ones((3, 3)), mode='constant')
    rgbn = np.stack([ndimage.convolve(a[..., c] * O, np.ones((3, 3)), mode='constant') for c in range(3)], -1) / np.maximum(w, 1)[..., None]
    wi = ndimage.convolve(inner.astype(np.float32), np.ones((5, 5)), mode='constant')
    rgbi = np.stack([ndimage.convolve(a[..., c] * inner, np.ones((5, 5)), mode='constant') for c in range(3)], -1) / np.maximum(wi, 1)[..., None]
    # over-dark rim: blend part way to the body colour just inside, keeping a subtle dark rim
    lum = a[..., :3] @ LW; lumi = rgbi @ LW
    dk = rim & (wi >= 3) & (lum < .55 * lumi)
    out[dk, :3] = a[dk, :3] * (1 - dark_soften) + rgbi[dk] * dark_soften * .8
    # stair-steps: rim pixels with few opaque neighbours get partial alpha
    soft = rim & (cov < .62)
    out[soft, 3] = np.minimum(al[soft], 255 * np.clip(cov[soft] + .25, .55, 1))
    # outside pixels in an inner corner get a faint fill in the neighbour colour
    corner = (al < 20) & (cov >= .55)
    out[corner, :3] = rgbn[corner]; out[corner, 3] = 255 * (cov[corner] - .35)
    return out, int(soft.sum() + corner.sum() + dk.sum())
