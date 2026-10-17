"""Clean the vehicle props: magenta through the windows -> dark tinted glass; pink edge pixels removed."""
import sys, glob, os
sys.path.insert(0, '/workspace/maine-rpg/artfix')
import numpy as np
from scipy import ndimage
from lib import load, save, hsv
SRC = '/workspace/maine-rpg/vehicles-v1/'; OUT = '/workspace/maine-rpg/v11/public/game/v2/vehicles/'
for p in sorted(glob.glob(SRC + '*-[1-4]-s[ew].png')):
    f = os.path.basename(p); a = load(p); h, s, v = hsv(a); al = a[..., 3]
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    pink = (al > 0) & (h >= 285) & (h <= 345) & (s > .2) & (r > g + 18) & (b > g + 10)
    edge = ndimage.binary_dilation(al < 30, iterations=2)
    rim = pink & edge; glass = pink & ~edge
    lum = (a[..., :3] @ np.array([.3, .59, .11]))
    tint = np.array([34, 46, 52], np.float32)
    a[glass, :3] = tint * np.clip(lum[glass] / 90, .55, 1.5)[:, None] + np.array([6, 8, 8])
    a[rim, 3] = 0
    # any faint pink cast left in the outline
    h, s, v = hsv(a); rest = (a[..., 3] > 0) & (h >= 290) & (h <= 340) & (s > .15)
    a[rest, :3] = a[rest, :3] @ np.array([[.3, .3, .3], [.59, .59, .59], [.11, .11, .11]])
    save(a, OUT + f); print(f, 'glass', int(glass.sum()), 'edge', int(rim.sum()), 'cast', int(rest.sum()))
