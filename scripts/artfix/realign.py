import numpy as np
from scipy import ndimage
def find_cut(al, top, bot):
    """A cut band: 1-6 rows in the 30-80% zone whose width drops well below the rows on both sides."""
    h = bot - top; w = al.sum(1).astype(float)
    best = None
    for y0 in range(int(top + .3 * h), int(top + .8 * h)):
        for bh in range(1, 7):
            y1 = y0 + bh
            if y1 + 1 >= al.shape[0]: break
            above, below = w[y0 - 1], w[y1]
            band = w[y0:y1].max()
            if above >= 8 and below >= 8 and band <= .55 * min(above, below):
                if best is None or band / min(above, below) < best[2]: best = (y0, y1, band / min(above, below))
    return best
def best_shift(ra, rb, maxs=10):
    def ext(r):
        xs = np.nonzero(r)[0]; return (xs.min(), xs.max()) if len(xs) else None
    ea, eb = ext(ra), ext(rb)
    if not ea or not eb: return 0
    sc = []
    for d in range(-maxs, maxs + 1):
        sc.append((abs(ea[0] - (eb[0] + d)) + abs(ea[1] - (eb[1] + d)), abs(d), d))
    return min(sc)[2]
def realign_cell(c):
    al = c[..., 3] > 60
    if al.sum() < 80: return c, None
    ys = np.nonzero(al.any(1))[0]; top, bot = ys.min(), ys.max()
    cut = find_cut(al, top, bot)
    if not cut: return c, None
    y0, y1, _ = cut
    # compare the 3 rows above the band to the 3 below
    ra = al[y0 - 3:y0].any(0); rb = al[y1:y1 + 3].any(0)
    d = best_shift(ra, rb)
    out = c.copy()
    if d:
        lower = c[y1:].copy(); sh = np.zeros_like(lower)
        if d > 0: sh[:, d:] = lower[:, :-d]
        else: sh[:, :d] = lower[:, -d:]
        out[y1:] = sh
    return out, (int(y0), int(y1), int(d))
def realign_sheet(a, cw, ch):
    out = a.copy(); done = []
    for r in range(a.shape[0] // ch):
        for k in range(a.shape[1] // cw):
            c = a[r*ch:(r+1)*ch, k*cw:(k+1)*cw]
            n, info = realign_cell(c)
            if info and info[2]:
                out[r*ch:(r+1)*ch, k*cw:(k+1)*cw] = n; done.append((r, k, info))
    return out, done

def edge_jumps(c, zone=(.3, .85)):
    al = c[..., 3] > 60
    if al.sum() < 80: return None
    ys = np.nonzero(al.any(1))[0]; top, bot = ys.min(), ys.max(); h = bot - top
    L = np.array([np.nonzero(al[y])[0].min() if al[y].any() else -99 for y in range(c.shape[0])])
    R = np.array([np.nonzero(al[y])[0].max() if al[y].any() else -99 for y in range(c.shape[0])])
    for y in range(int(top + zone[0] * h), int(top + zone[1] * h)):
        if min(L[y-3:y+5].min(), R[y-3:y+5].min()) < 0: continue
        dl, dr = L[y+1] - L[y], R[y+1] - R[y]
        if abs(dl) >= 3 and abs(dr) >= 3 and np.sign(dl) == np.sign(dr) and abs(dl - dr) <= 1 and (R[y]-L[y]) >= 25 and al[y].sum() >= .85*(R[y]-L[y]) and al[y+1].sum() >= .85*(R[y+1]-L[y+1]):
            if np.ptp(L[y-3:y+1]) <= 1 and np.ptp(R[y-3:y+1]) <= 1 and np.ptp(L[y+1:y+5]) <= 1 and np.ptp(R[y+1:y+5]) <= 1:
                return int(y + 1), int(round((dl + dr) / 2))
    return None
def shift_below(c, y, d):
    out = c.copy(); lower = c[y:].copy(); sh = np.zeros_like(lower)
    if d > 0: sh[:, d:] = lower[:, :-d]
    elif d < 0: sh[:, :d] = lower[:, -d:]
    out[y:] = sh; return out
