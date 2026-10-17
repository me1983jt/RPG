"""v13.4 art touch-ups. Starts from /workspace/maine-rpg/art-backup-v13.3/game/ (lying frames rebuilt from the v13.2 originals)."""
import sys, json, re, glob
sys.path.insert(0, '/workspace/maine-rpg/artfix')
import numpy as np
from lib import load, save, hsv
from gaps133 import fix_gaps
from audit import human_files, grid
from apply133 import who
from lut134 import build, apply as lut_apply
from polish134 import cells, bbox, skin_mask, warm_skin, shade, smooth_edges
O2 = '/workspace/maine-rpg/art-backup-v13.2/game/'; O3 = '/workspace/maine-rpg/art-backup-v13.3/game/'; B = '/workspace/maine-rpg/v11/public/game/'
log = {}
def note(f, k, n):
    if n: log.setdefault(f, {})[k] = log.get(f, {}).get(k, 0) + int(n)
LYING = ('death', 'down', 'dead', 'crouch')
def is_lying(f): return any(k in f for k in LYING)
HUMAN = human_files()
# per-character colour masks from the upright sheets
luts = {}
def lut_for(k):
    if k not in luts:
        ups = [f for f in HUMAN if who(f) == k and not is_lying(f)]
        luts[k] = build(ups)
    return luts[k]
LEGACY_ACCENT = {  # bandana, belt buckle
    'raider-blue': (168, 30, 30), 'raider-gray': (176, 28, 30), 'raider-torch': (220, 110, 30), 'raider-scout': (70, 110, 50),
    'raider-armor': (170, 36, 30), 'raider-brute': (214, 180, 40), 'raider-shield': (160, 34, 40), 'raider-jumper': (40, 90, 170),
    'raider': (160, 40, 40), 'boss-fur': (120, 30, 34), 'boss-mask': (200, 190, 170), 'boss-saw': (214, 150, 30), 'boss-warden': (150, 40, 40)}
def tintpx(rgb, to, amt):
    lum = rgb @ np.array([.3, .59, .11]); t = np.array(to, float); tl = t @ np.array([.3, .59, .11])
    return rgb + (np.clip(t * np.clip(lum / tl, .5, 1.5)[..., None], 0, 255) - rgb) * amt
def legacy_accents(a, f, cw, ch, color):
    sk = skin_mask(a); n = 0
    for r, c, sl in cells(a, cw, ch):
        sub = a[sl]; al = sub[..., 3] > 100; bb = bbox(al)
        if not bb or al.sum() < 200: continue
        t, b, l, rr = bb; h = b - t; yy, xx = np.mgrid[0:al.shape[0], 0:al.shape[1]]; yy = (yy - t) / max(1, h)
        cols = al.any(0); cx = (l + rr) / 2
        sks = sk[sl]
        band = al & ~sks & (yy >= .135) & (yy <= .185)
        sub[band, :3] = tintpx(sub[band, :3], color, .85); n += band.sum()
        belt = al & ~sks & (yy >= .5) & (yy <= .53)
        sub[belt, :3] = tintpx(sub[belt, :3], (78, 48, 28), .8); n += belt.sum()
        buck = belt & (np.abs(xx - cx) <= 1.2)
        sub[buck, :3] = tintpx(sub[buck, :3], (200, 160, 70), .9)
        if 'armor' in f or 'shield' in f:
            hh, ss, vv = hsv(sub)
            metal = al & ~sks & (ss < .22) & (vv > .25) & (yy > .12)
            noise = ((xx * 7 + yy.astype(int) * 3 + (xx // 3) * (xx % 5)) % 7) < 2
            rust = metal & noise
            sub[rust, :3] = tintpx(sub[rust, :3], (150, 70, 30), .7); n += rust.sum()
        if 'gray' in f or 'boss-fur' in f or 'boss-mask' in f:
            # a sewn-on patch on the coat's lower left
            pt = al & ~sks & (yy >= .62) & (yy <= .68) & (xx >= l + (rr - l) * .22) & (xx <= l + (rr - l) * .34)
            sub[pt, :3] = tintpx(sub[pt, :3], (110, 80, 50), .75); n += pt.sum()
    return a, n
def south_details(a, f, k, cw, ch):
    """Front-facing row (row 0) only: buttons, laces, Sarah's whale, Holt's blaze hat."""
    n = 0; sk = skin_mask(a)
    for r, c, sl in cells(a, cw, ch):
        sub = a[sl]; al = sub[..., 3] > 150; bb = bbox(al)
        if not bb or al.sum() < 150: continue
        t, b, l, rr = bb; h = b - t; cx = int(round((l + rr) / 2))
        Y = lambda fr: int(t + fr * h)
        if k == 'holt':
            yy = (np.mgrid[0:al.shape[0], 0:al.shape[1]][0] - t) / max(1, h)
            hat = al & ~sk[sl] & (yy < .085)
            sub[hat, :3] = tintpx(sub[hat, :3], (236, 96, 18), .85); n += hat.sum()
        if r != 0: continue
        if k in ('marcel', 'justin', 'jack', 'nora'):
            for fr in (.24, .31, .38, .45):
                y = Y(fr)
                if al[y, cx] and not sk[sl][y, cx]: sub[y, cx, :3] = (196, 176, 130) if k != 'justin' else (60, 60, 58); n += 1
        if k == 'justin':  # zip line on the hoodie
            for y in range(Y(.16), Y(.5)):
                if al[y, cx] and not sk[sl][y, cx]: sub[y, cx, :3] = sub[y, cx, :3] * .7 + np.array([150, 150, 140]) * .3; n += 1
        if k == 'sarah':
            # a small whale on the teal shirt: body, tail flick
            y, x = Y(.33), cx + 1
            for dy, dx in ((0, 0), (0, 1), (0, 2), (-1, 3)):
                yy_, xx_ = y + dy, x + dx
                if al[yy_, xx_] and not sk[sl][yy_, xx_]: sub[yy_, xx_, :3] = sub[yy_, xx_, :3] * .35 + np.array([196, 214, 222]) * .65; n += 1
        # laces: a light dot near the top of each boot
        y = Y(.93); row = al[y]
        runs = np.split(np.nonzero(row)[0], np.nonzero(np.diff(np.nonzero(row)[0]) > 1)[0] + 1)
        for run in runs:
            if 3 <= len(run) <= 12:
                x = int(run.mean()); sub[y, x, :3] = (190, 170, 128); sub[y + 1, x, :3] = sub[y + 1, x, :3] * .5 + 60; n += 1
    return a, n
def jack_fists(a, orig, f):
    """Undo the vest orange on the hands: pixels that were skin before v13.3."""
    if orig.shape != a.shape: return a, 0
    h, s, v = hsv(orig); r, g, b = orig[..., 0], orig[..., 1], orig[..., 2]
    sk = (r > g + 8) & (g > b) & (r - b > 34) & (v > .38) & (h < 36)
    changed = np.abs(a[..., :3] - orig[..., :3]).sum(-1) > 30
    m = sk & changed & (a[..., 3] > 0)
    a[m, :3] = orig[m, :3]; return a, int(m.sum())
def sarah_old_look(a):
    """Sarah's lying sheets still carry the old look: blonde hair, red shirt, teal skirt. Swap by colour mask."""
    h, s, v = hsv(a); al = a[..., 3] > 0; sk = skin_mask(a)
    hair = al & (h >= 30) & (h <= 64) & (s > .26) & (v > .4) & ~(sk & (h < 34))
    if hair.sum() < 150: return a, 0
    shirt = al & ((h >= 340) | (h <= 14)) & (s > .35)
    skirt = al & (h >= 160) & (h <= 215) & (s > .18)
    out = a.copy()
    out[hair, :3] = tintpx(a[hair, :3], (64, 40, 28), 1.0)
    out[shirt, :3] = tintpx(a[shirt, :3], (40, 126, 120), .95)
    base = tintpx(a[skirt, :3], (152, 34, 40), .95)
    ys, xs = np.nonzero(skirt); dark = (ys % 4 == 0) | (xs % 4 == 0)
    base[dark] = base[dark] * np.array([.55, .7, .6]); lite = (ys % 8 == 2) & (xs % 2 == 0)
    base[lite] = base[lite] * .6 + np.array([200, 170, 120]) * .4
    out[skirt, :3] = base
    return out, int(hair.sum() + shirt.sum() + skirt.sum())

def main():
    for f in HUMAN:
        k = who(f); a = load(O3 + f); g = grid(f, a); cw, ch = g if g else (a.shape[1], a.shape[0])
        if is_lying(f) and k:
            base, _ = fix_gaps(load(O2 + f))
            if k == 'sarah':
                base, n = sarah_old_look(base); note(f, 'old look to new look by colour mask', n)
            if k != 'sarah' or not n:
                a, n = lut_apply(base, lut_for(k)); note(f, 'clothing colours by colour mask', n)
            else: a = base
        if k == 'jack':
            a, n = jack_fists(a, load(O2 + f), f); note(f, 'fists restored to skin', n)
        b = f.split('/')[-1][:-4]; lk = re.sub(r'-(atk|dead)$', '', b)
        if lk in LEGACY_ACCENT and not is_lying(f):
            a, n = legacy_accents(a, f, cw, ch, LEGACY_ACCENT[lk]); note(f, 'bandana/belt/rust/patch', n)
        if k and g and not is_lying(f) and f.startswith('v2/'):
            a, n = south_details(a, f, k, cw, ch); note(f, 'details', n)
        sk = skin_mask(a); a = warm_skin(a, sk); note(f, 'skin warmed', sk.sum())
        a = shade(a, cw, ch); note(f, 'shading', 1)
        a, n = smooth_edges(a); note(f, 'edge smoothing', n)
        save(a, B + f)
    # animals and overlays: edges only
    for p in sorted(glob.glob(O3 + '*.png')) + sorted(glob.glob(O3 + 'overlay/**/*.png', recursive=True)):
        f = p[len(O3):]
        if f in HUMAN: continue
        if not (f.startswith(('deer', 'moose', 'wolf', 'coyote', 'rabbit', 'squirrel', 'crow', 'overlay/', 'scarecrow', 'villager'))): continue
        a = load(p); a, n = smooth_edges(a); note(f, 'edge smoothing', n); save(a, B + f)
    json.dump(log, open('/workspace/maine-rpg/artfix/changes134.json', 'w'), indent=1)
    print(len(log), 'files')
if __name__ == '__main__': main()
