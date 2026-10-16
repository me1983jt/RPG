"""v13.3 human-sheet pass: realign shifted lower bodies, replace clipped frames, fill gaps/holes, recolor.
Always starts from /workspace/maine-rpg/art-backup-v13.2/game/."""
import sys, json, re
sys.path.insert(0, '/workspace/maine-rpg/artfix')
import numpy as np
from lib import load, save, fix_vseams
from gaps133 import fix_gaps
from realign import edge_jumps, shift_below
from color133 import recolor
from rules133 import R
from audit import human_files, grid
ORIG = '/workspace/maine-rpg/art-backup-v13.2/game/'; B = '/workspace/maine-rpg/v11/public/game/'
log = {}; frames = []
def note(f, k, n):
    if n: log.setdefault(f, {})[k] = log.get(f, {}).get(k, 0) + int(n)
def who(f):
    b = f.split('/')[-1][:-4]
    m = re.match(r'bandit-(\w+)-', b) or re.match(r'raider-(blue|gray|torch|scout|armor|brute)(?:-|$)', b)
    if m: return m.group(1)
    m = re.match(r'boss-(fur|saw|mask|warden|pelletier)(?:-|$)', b)
    if m: return m.group(1)
    for k in ('justin', 'sarah', 'cyndal', 'loki', 'jack', 'holt', 'mira', 'nora', 'marcel'):
        if re.search(r'(^|-)' + k + r'(-|$)', b): return k
    return None
# clipped frames: replace with the same row's opposite stride frame (index 2); viewed by hand
REPLACE = {'boss-fur.png': [(3, 0, 2), (5, 0, 2)], 'boss-saw.png': [(3, 0, 2), (5, 0, 2)], 'boss-mask.png': [(3, 0, 2), (5, 0, 2)],
           'boss-grok-atk.png': [(0, 2, 1), (4, 2, 1), (5, 2, 1)], 'raider-armor.png': [(3, 0, 2), (5, 2, 0)], 'raider-brute.png': [(3, 0, 2), (5, 0, 2)]}
def close_vseam(a, cw, ch, f):
    """A see-through vertical slice through the whole body: pull the right half over to close it."""
    for r in range(a.shape[0] // ch):
        for c in range(a.shape[1] // cw):
            cell = a[r*ch:(r+1)*ch, c*cw:(c+1)*cw]; al = cell[..., 3] > 60
            if al.sum() < 80: continue
            ys = np.nonzero(al.any(1))[0]; xs = np.nonzero(al.any(0))[0]
            t, b = ys.min(), ys.max(); band = al[t + int(.2 * (b - t)):t + int(.62 * (b - t))]
            col = band.sum(0) > 2; x0, x1 = xs.min(), xs.max()
            empt = [x for x in range(x0 + 4, x1 - 3) if not col[x]]
            if not empt or len(empt) > 6: continue
            g0, g1 = min(empt), max(empt)
            if g1 - g0 + 1 != len(empt): continue
            w = g1 - g0 + 1; new = cell.copy()
            new[:, g0:cw - w] = cell[:, g1 + 1:]; new[:, cw - w:] = 0
            a[r*ch:(r+1)*ch, c*cw:(c+1)*cw] = new
            frames.append((f, r, c, f'see-through vertical slice {w}px wide closed by pulling the right half over')); note(f, 'seam closed', 1)
    return a

def main(only=None):
    for f in human_files():
        if only and f not in only: continue
        a = load(ORIG + f); g = grid(f, a)
        if g and f in REPLACE:
            cw, ch = g
            for r, c, src in REPLACE[f]:
                a[r*ch:(r+1)*ch, c*cw:(c+1)*cw] = a[r*ch:(r+1)*ch, src*cw:(src+1)*cw]
                frames.append((f, r, c, f'clipped at cell edge; replaced with frame {src} of the same row')); note(f, 'frames replaced', 1)
        if g and not f.startswith('v2/hero-walk-green'):
            cw, ch = g
            for r in range(a.shape[0] // ch):
                for c in range(a.shape[1] // cw):
                    cell = a[r*ch:(r+1)*ch, c*cw:(c+1)*cw]; j = edge_jumps(cell)
                    if j:
                        y, d = j; a[r*ch:(r+1)*ch, c*cw:(c+1)*cw] = shift_below(cell, y, -d)
                        frames.append((f, r, c, f'lower body shifted {-d:+d}px at y{y} to sit under the torso')); note(f, 'frames realigned', 1)
        if f.startswith('boss-grok-atk'): a = close_vseam(a, 88, 124, f)
        a, st = fix_gaps(a)
        for k, v in st.items(): note(f, k, v)
        k = who(f)
        if k and k in R:
            cw, ch = g if g else (a.shape[1], a.shape[0])
            up = not any(x in f for x in ('death', 'down', 'dead', 'crouch'))
            a, cnt = recolor(a, R[k], cw, ch, up)
            for n_, v in cnt.items(): note(f, 'recolor ' + n_, v)
        save(a, B + f)
    json.dump({'files': log, 'frames': frames}, open('/workspace/maine-rpg/artfix/changes133.json', 'w'), indent=1)
    print(len(log), 'files changed;', len(frames), 'frames')
if __name__ == '__main__': main(sys.argv[1:] or None)
