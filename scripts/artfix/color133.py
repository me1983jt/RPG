import numpy as np
from lib import hsv
LW = np.array([.3, .59, .11], np.float32)
def tint(rgb, target, amt=1.0, lo=.45, hi=1.5):
    lum = rgb @ LW; t = np.array(target, np.float32); tl = float(t @ LW)
    sc = np.clip(lum / tl, lo, hi)[..., None]
    return rgb + (np.clip(t * sc, 0, 255) - rgb) * amt
def rng(x, r): return (x >= r[0]) & (x <= r[1])
def hue_in(h, r):
    return ((h >= r[0]) & (h <= r[1])) if r[0] <= r[1] else ((h >= r[0]) | (h <= r[1]))
# rule: dict(h=(lo,hi) deg, s=(lo,hi), v=(lo,hi), y=(lo,hi) body fraction, to=(r,g,b), amt, skin=False)
def protect(a, h, s, v, yy):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    skin = (r > g) & (g >= b - 6) & (r - b > 28) & (v > .42) & rng(s, (.18, .66)) & hue_in(h, (4, 42))
    return skin
def recolor(a, rules, cw, ch, upright=True):
    out = a.copy(); H, W = a.shape[:2]
    h, s, v = hsv(a); h = h if h.max() > 2 else h * 360
    yy = np.full((H, W), -1.0, np.float32)
    for r0 in range(0, H, ch):
        for c0 in range(0, W, cw):
            al = a[r0:r0+ch, c0:c0+cw, 3] > 40
            if al.sum() < 30: continue
            ys = np.nonzero(al.any(1))[0]; t, b = ys.min(), ys.max()
            yy[r0:r0+ch, c0:c0+cw] = ((np.arange(ch) - t) / max(1, b - t))[:, None]
    skin = protect(a, h, s, v, yy); vis = a[..., 3] > 0; taken = np.zeros((H, W), bool); counts = {}
    for R in rules:
        if 'y' in R and not upright and not R.get('anyy'): continue
        m = vis & ~taken
        if not R.get('skin'): m &= ~skin
        if 'h' in R: m &= hue_in(h, R['h'])
        if 's' in R: m &= rng(s, R['s'])
        if 'v' in R: m &= rng(v, R['v'])
        if 'y' in R and upright: m &= rng(yy, R['y'])
        if 'pat' in R:
            yi, xi = np.mgrid[0:H, 0:W]
            if R['pat'] == 'plaid': m &= ((yi % 7) < 2) | ((xi % 7) < 2)
            else: m &= (((xi // 3) * 7 + (yi // 3) * 3 + (yi // 5)) % 5) < 2
        if not m.any(): continue
        out[m, :3] = tint(a[m, :3], R['to'], R.get('amt', .8), R.get('lo', .45), R.get('hi', 1.5))
        taken |= m; counts[R.get('n', '?')] = int(m.sum())
    return out, counts
