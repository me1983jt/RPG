"""v13.4 world art: warmer fall trees, mossier stone, redder barn paint, less flat brown. From art-backup-v13.3."""
import sys, glob, json
sys.path.insert(0, '/workspace/maine-rpg/artfix')
import numpy as np
from lib import load, save, hsv
from polish134 import smooth_edges
O3 = '/workspace/maine-rpg/art-backup-v13.3/game/'; B = '/workspace/maine-rpg/v11/public/game/'
log = {}
def sat_shift(a, m, sat=1.2, hue=0.0, val=1.0):
    """Scale saturation (around luminance) and nudge hue toward red by mixing channels."""
    rgb = a[m, :3]; lum = (rgb @ np.array([.3, .59, .11]))[:, None]
    rgb = lum + (rgb - lum) * sat
    if hue: rgb = rgb + np.array([1, -.25, -.6]) * hue * (rgb.mean(1, keepdims=True) / 128)
    a[m, :3] = np.clip(rgb * val, 0, 255)
def noise(shape, seed):
    rng = np.random.default_rng(seed); n = rng.random((shape[0] // 3 + 2, shape[1] // 3 + 2))
    return np.kron(n, np.ones((3, 3)))[:shape[0], :shape[1]]
def run():
    for p in sorted(glob.glob(O3 + 'tree-*.png') + glob.glob(O3 + 'maple.png') + glob.glob(O3 + 'orchard.png') + glob.glob(O3 + 'v2/trees/*.png')):
        f = p[len(O3):]; a = load(p); h, s, v = hsv(a); al = a[..., 3] > 0
        fall = al & (((h >= 0) & (h <= 55)) | (h >= 340)) & (s > .3) & (v > .25)
        sat_shift(a, fall, 1.22, 10, 1.03)
        green = al & (h > 70) & (h < 170) & (s > .2)
        sat_shift(a, green, 1.08, 0, 1.0)
        a, _ = smooth_edges(a); save(a, B + f); log[f] = {'fall leaves warmed': int(fall.sum())}
    for f in ('rock.png', 'ruin.png', 'wall.png', 'fence.png', 'fence-2.png', 'fence-3.png'):
        try: a = load(O3 + f)
        except Exception: continue
        h, s, v = hsv(a); al = a[..., 3] > 100
        stone = al & (s < .22) & (v > .18)
        # moss on the top-facing faces: pixels with clear air a few px above, in soft patches
        up = np.zeros_like(al); up[6:] = ~al[:-6]
        n = noise(al.shape, 7)
        moss = stone & (up | (n > .78)) & (n > .42) if f in ('rock.png', 'ruin.png', 'wall.png') else stone & (n > .86)
        rgb = a[moss, :3]; lum = rgb @ np.array([.3, .59, .11])
        a[moss, :3] = rgb * .45 + np.stack([lum * .78, lum * 1.0, lum * .55], 1) * .55
        save(a, B + f); log[f] = {'moss': int(moss.sum())}
    for f in ('barn.png', 'shack.png', 'workshop.png', 'farmhouse.png', 'stall.png', 'post-porch.png', 'post-loft.png', 'post-roof.png', 'press.png', 'stand.png', 'crates.png', 'logs.png', 'cache.png', 'bench.png'):
        try: a = load(O3 + f)
        except Exception: continue
        h, s, v = hsv(a); al = a[..., 3] > 0
        red = al & ((h >= 345) | (h <= 14)) & (s > .3)
        if f == 'barn.png': sat_shift(a, red, 1.28, 14, 1.02)
        brown = al & (h > 14) & (h <= 48) & (s > .15) & (s < .75)
        n = noise(al.shape, hash(f) % 1000)
        # less flat brown: a little more colour, and gentle warm/cool variation board to board
        sat_shift(a, brown, 1.12)
        warm = brown & (n > .6); cool = brown & (n < .25)
        a[warm, 0] = np.clip(a[warm, 0] * 1.05, 0, 255); a[cool, 2] = np.clip(a[cool, 2] * 1.08, 0, 255); a[cool, 0] *= .97
        save(a, B + f); log[f] = {'red paint': int(red.sum()), 'brown varied': int(brown.sum())}
    json.dump(log, open('/workspace/maine-rpg/artfix/changes134-world.json', 'w'), indent=1); print(len(log), 'world files')
run()
