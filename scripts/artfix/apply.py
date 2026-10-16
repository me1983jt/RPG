"""v13.2 art pass. Edits PNGs in place under v11/public/game; originals in /workspace/maine-rpg/art-backup-v13/game/.
Writes a log of every change to artfix/changes.json."""
import sys, json, glob, os
sys.path.insert(0, '/workspace/maine-rpg/artfix')
from lib import *
from scipy import ndimage
from sarah import recolor_sarah
from PIL import Image
B = '/workspace/maine-rpg/v11/public/game/'
ORIG = '/workspace/maine-rpg/art-backup-v13/game/'
log = {}
def cols_of(p):
    w, h = Image.open(p).size
    return max(1, round(w / (h / 8))) if h >= 400 else None
def note(f, k, n):
    if n: log.setdefault(f, {})[k] = log.get(f, {}).get(k, 0) + int(n)
def src(f): return load(ORIG + f)  # always start from the original, so re-runs are stable

def remove_specks(a, minpx=12):
    al = a[..., 3] > 30
    lab, k = ndimage.label(al, structure=np.ones((3, 3)))
    if k <= 1: return a, 0
    sizes = ndimage.sum(al, lab, range(1, k + 1))
    out = a.copy(); n = 0
    for i, sz in enumerate(sizes, 1):
        if sz < minpx: out[lab == i, 3] = 0; n += int(sz)
    return out, n

def remove_marks_per_frame(a, cols, rows=8, keepfrac=.04):
    """Drop small detached bits in each frame (stray marks), keeping anything over keepfrac of the frame's largest part."""
    out = a.copy(); H, W = a.shape[:2]; fw, fh = W // cols, H // rows; n = 0
    for r in range(rows):
        for c in range(cols):
            sub = out[r*fh:(r+1)*fh, c*fw:(c+1)*fw]
            al = sub[..., 3] > 30
            lab, k = ndimage.label(al, structure=np.ones((3, 3)))
            if k <= 1: continue
            sizes = ndimage.sum(al, lab, range(1, k + 1)); big = sizes.max()
            for i, sz in enumerate(sizes, 1):
                if sz < big * keepfrac: sub[lab == i, 3] = 0; n += int(sz)
    return out, n

todo = {}
# 1) cut bands and death slits on the legacy raider sheets
for f in sorted(glob.glob(ORIG + 'raider-*.png')):
    f = f[len(ORIG):]
    if f in ('raider.png', 'raider-dead.png'): continue
    a = todo.get(f, src(f)); a, n = fix_cuts(a); note(f, 'cut bands', n)
    if 'dead' in f: a, n = fix_slits(a); note(f, 'death slits', n)
    # dark magenta linings / seat: recolor to dark leather
    m = magenta_mask(a, .3, .15); a = recolor_hue(a, m, (92, 56, 40)); note(f, 'magenta to leather', m.sum())
    todo[f] = a
# bench: magenta panel to wood
a = src('bench.png'); m = magenta_mask(a, .25, .1); a = recolor_hue(a, m, (118, 78, 48)); note('bench.png', 'magenta panel to wood', m.sum()); todo['bench.png'] = a
# defringe everything else that shows magenta/green fringe (not the purple-coat legacy raider, not hero-walk-green)
skip = {'raider.png', 'raider-dead.png', 'v2/hero-walk-green.png', 'bench.png'}
for p in sorted(glob.glob(ORIG + '**/*.png', recursive=True)):
    f = p[len(ORIG):]
    if f in skip or f.startswith('raider-'): continue
    if f.startswith('v2/sarah') or f.startswith('v2/holt') or f.startswith('boss-grok'): continue
    a = src(f)
    if f in ('hatch.png',): continue  # green there is paint, not fringe
    edge = ndimage.binary_dilation(a[..., 3] < 20, iterations=2)
    mag = magenta_mask(a, .3, .12)
    grn = green_mask(a) & edge  # bright green only counts as fringe on the outline (trees keep their needles)
    if mag.sum() + grn.sum() < 6: continue
    # big magenta areas are a mis-keyed panel: paint them as weathered wood; thin bits are fringe
    lab, k = ndimage.label(mag)
    big = np.zeros_like(mag)
    for i, sz in enumerate(ndimage.sum(mag, lab, range(1, k + 1)), 1):
        if sz >= 40: big |= lab == i
    if big.any(): a = recolor_hue(a, big, (104, 74, 52)); note(f, 'magenta area to wood', big.sum())
    bad = (mag & ~big) | grn
    if bad.any(): a = fill_from_neighbours(a, bad); note(f, 'fringe pixels', bad.sum())
    todo[f] = a
# 2) Holt: fill see-through plaid, patch heads
for p in sorted(glob.glob(ORIG + 'v2/holt-*.png')):
    f = p[len(ORIG):]; a = src(f)
    a, n = fill_holes(a, maxgap=2, passes=2); note(f, 'plaid holes filled', n)
    a, n = fix_cuts(a, maxgap=4, minlen=4); note(f, 'cut patches', n)
    todo[f] = a
for f in ('npc-holt.png', 'guard-holt.png', 'guard-watch-holt.png'):
    a = src(f); a, n = fill_holes(a, maxgap=1, passes=1); note(f, 'holes filled', n); todo[f] = a
# 3) The Grok: fill the lattice, drop stray marks
for p in sorted(glob.glob(ORIG + 'boss-grok*.png')):
    f = p[len(ORIG):]; a = src(f)
    c = cols_of(ORIG + f)
    # the stray marks are thin dash lines; erase them first so the lattice fill can't join them up
    lines = np.zeros(a.shape[:2], bool)
    al0 = a[..., 3] > 30
    lab, k = ndimage.label(al0, structure=np.ones((3, 3)))
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        hgt = sl[0].stop - sl[0].start; wid = sl[1].stop - sl[1].start
        if hgt <= 2 and wid >= 4 and (lab[sl] == i).sum() <= 2 * wid: lines |= lab == i
    # dashes touching a leg: 1 px rows with clear above and below along most of a 4+ px run
    up = np.roll(al0, 1, 0); dn = np.roll(al0, -1, 0)
    thin = al0 & ~up & ~dn
    lab2, k2 = ndimage.label(thin, structure=np.array([[0, 0, 0], [1, 1, 1], [0, 0, 0]]))
    for i, sl in enumerate(ndimage.find_objects(lab2), 1):
        if sl[1].stop - sl[1].start >= 4: lines |= lab2 == i
    a[lines, 3] = 0; note(f, 'stray marks removed', lines.sum())
    a, n = fill_holes(a, maxgap=2, passes=3); note(f, 'lattice filled', n)
    a, n = fix_vseams(a); note(f, 'seams filled', n)
    if c: a, n = remove_marks_per_frame(a, c); note(f, 'stray marks removed', n)
    todo[f] = a
# 4) Sarah's old-look sheets toward the new look
for f, c in (('v2/sarah-run.png', 8), ('v2/sarah-gun.png', 4), ('v2/sarah-gun-atk.png', 4), ('v2/sarah-axe.png', 6)):
    a = src(f); a = recolor_sarah(a, c); note(f, 'recolored to new look', 1); todo[f] = a
for f, a in todo.items(): save(a, B + f)
json.dump(log, open('/workspace/maine-rpg/artfix/changes.json', 'w'), indent=1)
print(len(todo), 'files'); [print(k, v) for k, v in sorted(log.items())]

# 6) duplicate frames: give held frames a small, believable change instead of a frozen copy
def frame_op(f, fn, cols, rows=8):
    a = todo.get(f, src(f)); H, W = a.shape[:2]; fh, fw = H // rows, W // cols
    for r in range(rows):
        fr = [a[r*fh:(r+1)*fh, c*fw:(c+1)*fw].copy() for c in range(cols)]
        fr = fn(fr)
        for c in range(cols): a[r*fh:(r+1)*fh, c*fw:(c+1)*fw] = fr[c]
    todo[f] = a; save(a, B + f)
def shift(fr, dx=0, dy=0):
    o = np.zeros_like(fr); H, W = fr.shape[:2]
    ys, yd = (slice(0, H - dy), slice(dy, H)) if dy >= 0 else (slice(-dy, H), slice(0, H + dy))
    xs, xd = (slice(0, W - dx), slice(dx, W)) if dx >= 0 else (slice(-dx, W), slice(0, W + dx))
    o[yd, xd] = fr[ys, xs]; return o
def same(a, b): return np.abs(a - b).sum() < 2000
def gun_kick(fr):  # Sarah gun-atk 0 == 1: frame 1 becomes the recoil (shoulder kicks up 1 px, 1 px back)
    if same(fr[0], fr[1]): fr[1] = shift(fr[0], 0, -1)
    return fr
def death_settle(fr):  # Sarah death 3 == 4 == 5: 3 is still sinking, 4 settles, 5 rests
    if same(fr[3], fr[4]) and same(fr[4], fr[5]):
        fr[3] = shift(fr[5], 0, -2); fr[4] = shift(fr[5], 0, -1)
    return fr
def crouch_breathe(fr):  # Cyndal crouch 2 == 3: 3 dips 1 px, so the hold breathes
    if same(fr[2], fr[3]): fr[3] = shift(fr[2], 0, 1)
    return fr
frame_op('v2/sarah-gun-atk.png', gun_kick, 4); note('v2/sarah-gun-atk.png', 'duplicate frame 1 -> recoil', 8)
frame_op('v2/sarah-death.png', death_settle, 6); note('v2/sarah-death.png', 'frozen frames 3-5 -> settle', 8)
frame_op('v2/cyndal-crouch.png', crouch_breathe, 4); note('v2/cyndal-crouch.png', 'duplicate frame 3 -> breathe', 8)
json.dump(log, open('/workspace/maine-rpg/artfix/changes.json', 'w'), indent=1)
