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
    pink = (al > 0) & (h >= 200) & (h <= 345) & (s > .18) & (b > g + 10)
    edge = ndimage.binary_dilation(al < 30, iterations=2)
    rim = pink & edge; glass = pink & ~edge
    lum = (a[..., :3] @ np.array([.3, .59, .11]))
    tint = np.array([34, 46, 52], np.float32)
    a[glass, :3] = tint * np.clip(lum[glass] / 90, .55, 1.5)[:, None] + np.array([6, 8, 8])
    # edge specks (pure blue/magenta from the key): neutral dark grey, so no holes open up
    lum2 = (a[..., :3] @ np.array([.3, .59, .11]))
    a[rim, :3] = np.clip(lum2[rim] * .8, 10, 120)[:, None] * np.array([1, 1, .96])
    # pink fringe around the glass (anti-aliased key colour): dark glass edge
    h, s, v = hsv(a); r, g, b = [a[..., i].astype(int) for i in range(3)]
    near = ndimage.binary_dilation(glass, iterations=3)
    fr = (a[..., 3] > 0) & ((h >= 315) | (h <= 10)) & (s > .2) & (r > g + 20) & (b > g + 6)
    fringe = fr & near
    a[fringe, :3] = tint * .8
    loose = fr & ~near & (s > .35) & (b > g + 15)
    a[loose, :3] = a[loose, :3] @ np.array([[.3, .3, .3], [.59, .59, .59], [.11, .11, .11]])
    # second ring: muted pinks touching the glass -> dark window frame
    win = glass | fringe
    for _ in range(2):
        r, g, b = [a[..., i].astype(int) for i in range(3)]
        ring = ndimage.binary_dilation(win, iterations=1) & ~win & (a[..., 3] > 0) & (r > g + 18) & (b >= g - 4)
        a[ring, :3] = np.array([50, 44, 40]); win = win | ring; fringe = fringe | ring
    print(f, 'fringe', int(fringe.sum()), 'loose', int(loose.sum()))
    # any faint pink cast left in the outline
    h, s, v = hsv(a); rest = (a[..., 3] > 0) & (h >= 290) & (h <= 340) & (s > .15)
    a[rest, :3] = a[rest, :3] @ np.array([[.3, .3, .3], [.59, .59, .59], [.11, .11, .11]])
    save(a, OUT + f); print(f, 'glass', int(glass.sum()), 'edge', int(rim.sum()), 'cast', int(rest.sum()))
