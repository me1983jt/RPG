import sys, numpy as np
from PIL import Image
ROWS = "S SW W NW N NE E SE".split()
def load(p):
    a = np.array(Image.open(p).convert("RGBA")).astype(int); H, W = a.shape[:2]
    ch, cw = H // 8, W // 4
    return [[a[r*ch:(r+1)*ch, c*cw:(c+1)*cw] for c in range(4)] for r in range(8)]
def diff(x, y):
    m = (x[..., 3] > 30) | (y[..., 3] > 30)
    return np.abs(x[..., :4] - y[..., :4])[m].mean() if m.any() else 0
def mirror(x): return x[:, ::-1]
for p in sys.argv[1:]:
    g = load(p); name = p.split("/")[-1]
    out = []
    for r in range(8):
        fv = np.mean([diff(g[r][c], g[r][(c+1) % 4]) for c in range(4)])
        # leg motion: bottom 35% of figure bbox
        legs = []
        for c in range(4):
            a = g[r][c][..., 3] > 30; ys = np.where(a.any(1))[0]
            legs.append((ys.min(), ys.max()) if len(ys) else (0, 0))
        top = min(l[0] for l in legs); bot = max(l[1] for l in legs); cut = int(bot - (bot - top) * .35)
        lv = np.mean([diff(g[r][c][cut:], g[r][(c+1) % 4][cut:]) for c in range(4)])
        same = [ROWS[q] for q in range(8) if q != r and np.mean([diff(g[r][c], g[q][c]) for c in range(4)]) < 6]
        mir = [ROWS[q] for q in range(8) if q != r and np.mean([diff(g[r][c], mirror(g[q][c])) for c in range(4)]) < 6]
        # torso colour (middle band) mean RGB of opaque
        ts = []
        for c in range(4):
            x = g[r][c]; a = x[..., 3] > 200; ys = np.where(a.any(1))[0]
            if not len(ys): continue
            t0, t1 = ys.min(), ys.max(); band = x[int(t0 + (t1-t0)*.25):int(t0 + (t1-t0)*.5)]
            m = band[..., 3] > 200; ts.append(band[m][:, :3].mean(0))
        tc = np.mean(ts, 0).astype(int) if ts else None
        out.append(f"{ROWS[r]:2s} frameVar {fv:5.1f} legVar {lv:5.1f} torsoRGB {tc} same={same} mirror={mir}")
    print(name); print("\n".join("   " + o for o in out))
