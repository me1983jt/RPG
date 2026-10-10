#!/usr/bin/env python3
"""Render the five wild animals (+ deer) as one consistent family of 8-direction walk/hop sheets.

Every animal is the same kind of model: smooth-blended capsules and ellipsoids (SDF ray-marched,
orthographic, the game's 2:1 isometric camera), lit from the upper left, with fur mottling, a soft
dark rim and supersampled edges, so all five share one painterly look. Cycles are 4 frames:
quadrupeds trot (diagonal leg pairs, body bob, tail sway); rabbit and squirrel hop (crouch, push,
flight, land). Rows follow the engine: 0 S, 1 SW, 2 W, 3 NW, 4 N, 5 NE, 6 E, 7 SE.
Each animal uses one fixed scale for all 32 frames (no popping); feet sit on the same baseline the
old sheets used.  usage: render_animals.py <out_dir> [names...]
"""
import sys, math, numpy as np
from PIL import Image, ImageFilter

CW, CH, SS = 88, 124, 3            # cell, supersample
ELEV = math.radians(30)
D = np.array([0, math.cos(ELEV), -math.sin(ELEV)])        # view direction (looking north, down)
RIGHT = np.array([1.0, 0, 0]); UP = np.array([0, math.sin(ELEV), math.cos(ELEV)])
LIGHT = np.array([-0.55, -0.35, 0.76]); LIGHT /= np.linalg.norm(LIGHT)
DIRS = [(0, -1), (-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1)]   # S SW W NW N NE E SE

def capsule(p, a, b, r):
    pa = p - a; ba = b - a
    h = np.clip((pa @ ba) / (ba @ ba), 0, 1)
    return np.linalg.norm(pa - h[:, None] * ba, axis=1) - r

def ellip(p, c, rad, R=None):
    q = p - c
    if R is not None: q = q @ R
    q = q / rad
    k0 = np.linalg.norm(q, axis=1); k1 = np.linalg.norm(q / rad, axis=1)
    return k0 * (k0 - 1) / np.maximum(k1, 1e-6)

def rotz(a):
    c, s = math.cos(a), math.sin(a); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
def roty(a):
    c, s = math.cos(a), math.sin(a); return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])

def smin(a, b, k):
    if k <= 0: return np.minimum(a, b)
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)

def leg(hip, foot, l1, l2, bend):
    """two-bone leg in the x/z plane; bend=+1 knee forward (front), -1 hock back (hind)."""
    d = foot - hip; L = np.linalg.norm(d); L = min(L, l1 + l2 - 1e-4)
    a = (l1 * l1 - l2 * l2 + L * L) / (2 * L); h = math.sqrt(max(l1 * l1 - a * a, 0))
    u = d / np.linalg.norm(d); perp = np.array([u[2], 0, -u[0]]) * bend   # perpendicular in x/z
    if perp[0] * bend < 0: perp = -perp
    knee = hip + u * a + perp * h
    return knee

# ---------------------------------------------------------------- animal definitions
# units: shoulder height ~1 for quadrupeds. parts: (kind, args, colour key, blend)
PAL = {
  "coyote": dict(fur=(158, 124, 86), dark=(96, 74, 54), belly=(214, 196, 162), nose=(34, 28, 24), tip=(52, 42, 34), leg=(140, 108, 74)),
  "wolf":   dict(fur=(128, 126, 122), dark=(78, 76, 74), belly=(206, 202, 194), nose=(26, 24, 24), tip=(96, 94, 90), leg=(118, 114, 108)),
  "moose":  dict(fur=(74, 54, 40), dark=(42, 30, 24), belly=(98, 76, 58), nose=(36, 28, 24), tip=(60, 44, 34), leg=(132, 116, 96), antler=(164, 144, 108)),
  "deer":   dict(fur=(148, 102, 64), dark=(96, 66, 42), belly=(226, 214, 192), nose=(30, 24, 22), tip=(236, 230, 220), leg=(132, 92, 58), antler=(196, 178, 140)),
  "rabbit": dict(fur=(150, 116, 84), dark=(100, 76, 56), belly=(222, 210, 190), nose=(70, 44, 44), tip=(240, 236, 228), leg=(140, 108, 78), ear=(170, 132, 104)),
  "squirrel": dict(fur=(168, 92, 48), dark=(110, 58, 30), belly=(230, 210, 180), nose=(40, 26, 22), tip=(186, 108, 60), leg=(150, 82, 44), ear=(176, 100, 56)),
}
QUAD = {
  # body len, body radius(y,z), leg len, head size, snout len, neck up, ears, tail, extra
  "coyote": dict(bl=.62, br=(.17, .2), hl=.62, hs=.16, sn=.17, neck=.26, ear=(.1, .035), tail=(.42, .11, -0.7), slim=1.0),
  "wolf":   dict(bl=.68, br=(.2, .23), hl=.66, hs=.18, sn=.18, neck=.25, ear=(.09, .04), tail=(.44, .13, -0.8), slim=1.05),
  "moose":  dict(bl=.78, br=(.27, .33), hl=.82, hs=.2, sn=.26, neck=.18, ear=(.08, .04), tail=(.1, .05, -1.2), slim=.75, hump=True, antlers="palm"),
  "deer":   dict(bl=.62, br=(.17, .21), hl=.78, hs=.14, sn=.15, neck=.42, ear=(.1, .045), tail=(.12, .06, 0.4), slim=.7, antlers="tine"),
}

def quad_parts(n, frame):
    s = QUAD[n]; ph = frame / 4 * 2 * math.pi
    bl, (bry, brz), hl = s["bl"], s["br"], s["hl"]
    bob = 0.025 * math.cos(2 * ph) + 0.02
    bz = hl + brz * 0.55 + bob
    parts = []
    # body: two blended ellipsoids (chest, hips)
    parts.append(("e", (np.array([bl * .3, 0, bz + .02]), np.array([bl * .42, bry, brz * 1.05])), "fur", .12))
    parts.append(("e", (np.array([-bl * .3, 0, bz]), np.array([bl * .38, bry * .92, brz * .92])), "fur", .12))
    parts.append(("e", (np.array([0, 0, bz - brz * .45]), np.array([bl * .55, bry * .7, brz * .55])), "belly", .1))
    if s.get("hump"): parts.append(("e", (np.array([bl * .3, 0, bz + brz * .7]), np.array([bl * .28, bry * .6, brz * .55])), "fur", .12))
    # neck + head
    nb = np.array([bl * .58, 0, bz + brz * .25]); hc = nb + np.array([s["neck"] * .55, 0, s["neck"]])
    hc = hc + np.array([0, 0, 0.012 * math.sin(2 * ph)])
    parts.append(("c", (nb, hc, s["hs"] * .7), "fur", .1))
    parts.append(("e", (hc, np.array([s["hs"] * 1.05, s["hs"] * .85, s["hs"] * .9])), "fur", .08))
    sn_end = hc + np.array([s["sn"] + s["hs"] * .6, 0, -s["hs"] * .35])
    parts.append(("c", (hc + np.array([s["hs"] * .3, 0, -s["hs"] * .1]), sn_end, s["hs"] * .45), "fur", .06))
    parts.append(("s", (sn_end + np.array([s["hs"] * .28, 0, s["hs"] * .05]), s["hs"] * .2), "nose", 0))
    for side in (-1, 1):
        parts.append(("s", (hc + np.array([s["hs"] * .55, side * s["hs"] * .55, s["hs"] * .3]), s["hs"] * .14), "nose", 0))
        el, er = s["ear"]
        eb = hc + np.array([-s["hs"] * .2, side * s["hs"] * .5, s["hs"] * .6])
        parts.append(("c", (eb, eb + np.array([-el * .3, side * el * .4, el]), er), "dark", .02))
    if s.get("antlers") == "palm":
        for side in (-1, 1):
            base = hc + np.array([-s["hs"] * .1, side * s["hs"] * .6, s["hs"] * .7])
            parts.append(("c", (base, base + np.array([0, side * .14, .05]), .03), "antler", .02))
            tilt = side * .25
            R = np.array([[1, 0, 0], [0, math.cos(tilt), -math.sin(tilt)], [0, math.sin(tilt), math.cos(tilt)]])
            pc = base + np.array([-.02, side * .26, .1])
            parts.append(("e", (pc, np.array([.14, .17, .03]), R), "antler", .03))
            for k in range(3):   # tines along the paddle's outer edge
                tb = pc + np.array([-.1 + k * .1, side * .14, .02])
                parts.append(("c", (tb, tb + np.array([.0, side * .06, .09]), .018), "antler", .01))
    elif s.get("antlers") == "tine":
        for side in (-1, 1):
            base = hc + np.array([-s["hs"] * .1, side * s["hs"] * .45, s["hs"] * .75])
            top = base + np.array([.05, side * .12, .26])
            parts.append(("c", (base, top, .022), "antler", .01))
            parts.append(("c", (base + (top - base) * .5, base + (top - base) * .5 + np.array([.1, 0, .08]), .018), "antler", .01))
    # tail
    tl, tr, tang = s["tail"]
    tb = np.array([-bl * .66, 0, bz + brz * .25])
    sway = 0.12 * math.sin(ph)
    te = tb + np.array([-tl * math.cos(tang), tl * sway, tl * math.sin(tang)])
    parts.append(("c", (tb, te, tr), "fur", .05))
    parts.append(("s", (te, tr * 1.05), "tip", .04))
    # legs: trot
    stride, lift = .2 * (bl / .62), .1
    lr = bry * .55
    for fb, x0, bend in (("f", bl * .42, 1), ("h", -bl * .42, -1)):
        for side in (-1, 1):
            p = ph + (0 if (fb == "f") == (side > 0) else math.pi)
            hip = np.array([x0, side * lr, bz - brz * .15])
            foot = np.array([x0 + stride * math.sin(p), side * lr, max(0, lift * math.cos(p)) + .035])
            l1, l2 = hl * .52, hl * .58
            knee = leg(hip, foot, l1, l2, bend if fb == "f" else -1)
            thick = (.075 if fb == "f" else .09) * s["slim"] * (bl / .62) ** .5
            parts.append(("c", (hip + np.array([0, 0, .05]), knee, thick * 1.35), "fur", .07))
            parts.append(("c", (knee, foot, thick * .75), "leg", .03))
            parts.append(("s", (foot + np.array([.02, 0, -.01]), thick * .8), "dark", .02))
    return parts

SMALL = {
  "rabbit": dict(br=.24, ear=.32, tail="puff", head=.15),
  "squirrel": dict(br=.18, ear=.08, tail="bush", head=.13),
}
HOP = [  # (body lift, body pitch, hind extend, front reach)
  (0.00, 0.0, 0.0, 0.0),
  (0.10, -0.35, 1.0, 0.3),
  (0.22, -0.1, 0.6, 1.0),
  (0.06, 0.3, 0.1, 0.6),
]

def small_parts(n, frame):
    s = SMALL[n]; lift, pitch, hx, fr = HOP[frame]
    br = s["br"]; z0 = br * .9 + lift
    R = roty(pitch)
    def T(v): return R @ np.asarray(v, float) + np.array([0, 0, z0])
    parts = []
    parts.append(("e", (T([-br * .25, 0, 0]), np.array([br * 1.15, br * .85, br * .85]), R.T), "fur", .1))
    parts.append(("e", (T([-br * .2, 0, -br * .35]), np.array([br * .95, br * .6, br * .45]), R.T), "belly", .08))
    hc = T([br * .95, 0, br * .55]); hs = s["head"]
    parts.append(("e", (hc, np.array([hs * 1.1, hs * .85, hs * .9])), "fur", .08))
    parts.append(("s", (hc + np.array([hs * 1.0, 0, -hs * .15]), hs * .22), "nose", 0))
    for side in (-1, 1):
        parts.append(("s", (hc + np.array([hs * .5, side * hs * .6, hs * .25]), hs * .16), "nose", 0))
        eb = hc + np.array([-hs * .3, side * hs * .35, hs * .7])
        if n == "rabbit":
            et = eb + np.array([-s["ear"] * (.45 + .25 * hx), side * .04, s["ear"] * .85])
            parts.append(("c", (eb, et, .042), "ear", .03))
        else:
            parts.append(("c", (eb, eb + np.array([0, 0, s["ear"]]), .03), "ear", .02))
    # legs: fixed lengths, so a lifted body tucks or stretches them instead of growing stilts
    hipH = T([-br * .75, 0, -br * .25]); hipF = T([br * .55, 0, -br * .35])
    def reach(base, ang, ln):   # ang: 0 = straight down, + = forward, - = back
        return base + np.array([math.sin(ang) * ln, 0, -math.cos(ang) * ln])
    for side in (-1, 1):
        y = side * br * .55
        thigh = hipH + np.array([0, y, 0])
        lnH = hipH[2] - .03 if lift < .02 else br * 1.0
        angH = (.5 if lift < .02 else -.9 * hx - .2)
        footH = reach(thigh, angH, min(lnH, br * 1.1))
        if lift < .02: footH[2] = .03
        parts.append(("e", (thigh, np.array([br * .55, br * .3, br * .5])), "fur", .08))
        parts.append(("c", (thigh, footH, br * .2), "leg", .05))
        parts.append(("c", (footH, footH + np.array([br * .55, 0, 0]), br * .14), "dark", .03))
        sh = hipF + np.array([0, y * .8, 0])
        lnF = sh[2] - .03 if lift < .02 else br * .85
        footF = reach(sh, .9 * fr - .1, min(lnF, br * 1.0))
        if lift < .02: footF[2] = .03
        parts.append(("c", (sh, footF, br * .12), "leg", .04))
    tc = T([-br * 1.3, 0, br * .25])
    if s["tail"] == "puff": parts.append(("s", (tc, br * .3), "tip", .03))
    else:
        sway = .06 * math.sin(frame / 4 * 2 * math.pi)
        pts = [tc, tc + np.array([-.12, sway, .2]), tc + np.array([-.05, sway * 1.5, .42]), tc + np.array([.1, sway, .52])]
        for a, b, r in zip(pts, pts[1:], (.1, .13, .12)):
            parts.append(("c", (a, b, r), "tip" if r == .12 else "fur", .1))
    return parts

# ---------------------------------------------------------------- renderer
def _hash(ix, iy, iz):
    h = (ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791)
    h = (h ^ (h >> 13)) * 1274126177
    return ((h ^ (h >> 16)) & 0xffff) / 65535.0

def vnoise(q):
    f = np.floor(q); t = q - f; t = t * t * (3 - 2 * t); i = f.astype(np.int64)
    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (t[:, 0] if dx else 1 - t[:, 0]) * (t[:, 1] if dy else 1 - t[:, 1]) * (t[:, 2] if dz else 1 - t[:, 2])
                out = out + w * _hash(i[:, 0] + dx, i[:, 1] + dy, i[:, 2] + dz)
    return out

def field(parts, p):
    d = np.full(len(p), 1e9); ids = np.zeros(len(p), int); hard = np.full(len(p), 1e9)
    for i, (k, a, col, blend) in enumerate(parts):
        if k == "e": di = ellip(p, a[0], a[1], a[2] if len(a) > 2 else None)
        elif k == "c": di = capsule(p, a[0], a[1], a[2])
        else: di = np.linalg.norm(p - a[0], axis=1) - a[1]
        ids = np.where(di < hard, i, ids); hard = np.minimum(hard, di)
        d = smin(d, di, blend) if blend > 0 else np.minimum(d, di)
    return d, ids

def render(parts, yaw_f, scale, cx, cy, pal, SS=SS):
    W, H = CW * SS, CH * SS
    # rotate model (forward +x) to face ground direction yaw_f
    ang = math.atan2(yaw_f[1], yaw_f[0]); Rm = rotz(ang)
    wparts = []
    for k, a, col, bl in parts:
        if k == "e": wparts.append((k, (Rm @ a[0], a[1], (Rm @ (a[2] if len(a) > 2 else np.eye(3)))), col, bl))
        elif k == "c": wparts.append((k, (Rm @ a[0], Rm @ a[1], a[2]), col, bl))
        else: wparts.append((k, (Rm @ a[0], a[1]), col, bl))
    ys, xs = np.mgrid[0:H, 0:W]
    u = (xs - cx * SS) / (scale * SS); v = (cy * SS - ys) / (scale * SS)
    o = u.reshape(-1, 1) * RIGHT + v.reshape(-1, 1) * UP - D * 4
    # cull rays to a bounding region
    t = np.zeros(len(o)); alive = np.ones(len(o), bool); hit = np.zeros(len(o), bool)
    for _ in range(90):
        idx = np.nonzero(alive)[0]
        if not len(idx): break
        p = o[idx] + D * t[idx, None]
        d, _ = field(wparts, p)
        t[idx] += np.maximum(d * .9, 1e-3)
        h = d < 2e-3; hit[idx[h]] = True; alive[idx[h]] = False
        alive[idx[t[idx] > 9]] = False
    img = np.zeros((len(o), 4))
    idx = np.nonzero(hit)[0]
    if len(idx):
        p = o[idx] + D * t[idx, None]
        _, ids = field(wparts, p)
        e = 2e-3; nrm = np.zeros_like(p)
        for k in range(3):
            dp = np.zeros(3); dp[k] = e
            nrm[:, k] = field(wparts, p + dp)[0] - field(wparts, p - dp)[0]
        nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-9
        cols = np.array([pal.get(wparts[i][2], pal["fur"]) for i in ids], float)
        # fur: smooth value noise (two octaves) + fine streaks along the body, darker saddle on top
        q = p @ Rm
        noise = (vnoise(q * 14) - .5) * .16 + (vnoise(q * 38 + 7) - .5) * .1
        saddle = np.clip((nrm[:, 2] - .35) / .5, 0, 1) * np.array([wparts[i][2] == "fur" for i in ids])
        cols = cols * (1 - .32 * saddle[:, None] * pal.get("saddle", 1))
        lam = np.clip(nrm @ LIGHT, 0, 1)
        top = np.clip(nrm[:, 2], 0, 1)
        shade = .42 + .62 * lam + .1 * top + noise
        rim = np.clip(1 - np.abs(nrm @ -D), 0, 1) ** 3
        c = cols * shade[:, None]
        dark = np.array(pal["dark"], float)
        c = c * (1 - .45 * rim[:, None]) + dark * .45 * rim[:, None]
        img[idx, :3] = np.clip(c, 0, 255); img[idx, 3] = 255
    im = Image.fromarray(img.reshape(H, W, 4).astype(np.uint8), "RGBA").resize((CW, CH), Image.LANCZOS)
    a = np.array(im).astype(float)
    al = a[..., 3] / 255
    inner = np.minimum.reduce([np.roll(al, 1, 0), np.roll(al, -1, 0), np.roll(al, 1, 1), np.roll(al, -1, 1)])
    edge = np.clip(al - inner, 0, 1)[..., None]
    dk = np.array(pal["dark"], float) * .55
    a[..., :3] = a[..., :3] * (1 - .6 * edge) + dk * .6 * edge
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")

def build(n):
    pal = PAL[n]; small = n in SMALL
    frames = [(small_parts if small else quad_parts)(n, f) for f in range(4)]
    # one fixed scale per animal for all 32 frames: probe every frame cheaply, then fit the union
    # of all poses inside the cell (x 3..84, feet <= 118, head >= 3) at the wanted side-view width
    target_w = {"rabbit": 46, "squirrel": 42, "coyote": 74, "wolf": 76, "moose": 78, "deer": 70}[n]
    s0, cx0, cy0 = 30, CW / 2, 90
    L = R = T = B = 0; side = 0
    for r, d in enumerate(DIRS):
        for c, parts in enumerate(frames):
            a = np.array(render(parts, d, s0, cx0, cy0, pal, SS=1))[..., 3] > 24
            ys, xs = np.where(a)
            L = min(L, xs.min() - cx0); R = max(R, xs.max() - cx0); T = min(T, ys.min() - cy0); B = max(B, ys.max() - cy0)
            if r == 2 and c == 0: side = xs.max() - xs.min()
    k = min(target_w / max(side, 1), 41 / max(-L, R), 113 / max(B - T, 1))
    scale = s0 * k
    cy = 118 - B * k
    sheet = Image.new("RGBA", (CW * 4, CH * 8))
    for r, d in enumerate(DIRS):
        for c, parts in enumerate(frames):
            cell = render(parts, d, scale, CW / 2, cy, pal)
            sheet.alpha_composite(cell, (c * CW, r * CH))
    return sheet

if __name__ == "__main__":
    out = sys.argv[1]; names = sys.argv[2:] or ["rabbit", "squirrel", "coyote", "wolf", "moose", "deer"]
    for n in names:
        build(n).save(f"{out}/{n}.png"); print("rendered", n)
