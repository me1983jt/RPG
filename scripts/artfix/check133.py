"""v13.3 art check: no thin/small enclosed holes, no shifted lower bodies, no deep semi-alpha, grok-atk in one piece."""
import sys; sys.path.insert(0, '/workspace/maine-rpg/artfix')
import numpy as np
from scipy import ndimage
from lib import load
from audit import human_files, grid
from realign import edge_jumps
G = '/workspace/maine-rpg/v11/public/game/'; bad = []; n = 0
for f in human_files():
    a = load(G + f); O = a[..., 3] >= 200; holes = ~O
    lab, k = ndimage.label(holes); border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    dist = ndimage.distance_transform_edt(holes)
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        if i in border or sl is None: continue
        m = lab[sl] == i
        if m.sum() <= 14 or dist[sl][m].max() <= 1.6: bad.append((f, 'hole', sl[0].start, sl[1].start)); break
    deep = ndimage.distance_transform_edt(a[..., 3] >= 5) > 2.5
    if f != 'v2/bike-ride.png' and ((a[..., 3] < 120) & deep).sum() > 2: bad.append((f, 'semi-alpha'))  # bike-ride has a baked see-through ground shadow
    g = grid(f, a)
    if g:
        cw, ch = g
        for r in range(a.shape[0] // ch):
            for c in range(a.shape[1] // cw):
                if edge_jumps(a[r*ch:(r+1)*ch, c*cw:(c+1)*cw]): bad.append((f, 'shift', r, c))
    n += 1
a = load(G + 'boss-grok-atk.png')
for r in range(8):
    for c in range(4):
        al = a[r*124:(r+1)*124, c*88:(c+1)*88, 3] > 60
        lab, k = ndimage.label(al, np.ones((3, 3))); sz = sorted(ndimage.sum(al, lab, range(1, k + 1)), reverse=True)
        if len(sz) > 1 and sz[1] > 150: bad.append(('boss-grok-atk.png', 'split', r, c))
print(n, 'sheets checked;', len(bad), 'problems'); [print(b) for b in bad[:40]]
sys.exit(1 if bad else 0)
