import sys; sys.path.insert(0, '/workspace/maine-rpg/artfix')
from lib import *

def tint(rgb, target, amt=1.0, lo=.45, hi=1.4):
    lum = rgb @ np.array([.3, .59, .11]); t = np.array(target, np.float32); tl = float(t @ np.array([.3, .59, .11]))
    sc = np.clip(lum / tl, lo, hi)[..., None]
    return rgb + (np.clip(t * sc, 0, 255) - rgb) * amt

def recolor_sarah(a, cols, rows=8):
    out = a.copy(); H, W = a.shape[:2]; fw, fh = W // cols, H // rows
    h, s, v = hsv(a)
    for r in range(rows):
        for c in range(cols):
            y0, x0 = r * fh, c * fw
            al = a[y0:y0 + fh, x0:x0 + fw, 3] > 40
            if al.sum() < 30: continue
            ys = np.nonzero(al.any(1))[0]; top, bot = ys.min(), ys.max(); bh = max(1, bot - top)
            yy = (np.arange(fh)[:, None] - top) / bh * np.ones((1, fw))
            hh, ss, vv = h[y0:y0 + fh, x0:x0 + fw], s[y0:y0 + fh, x0:x0 + fw], v[y0:y0 + fh, x0:x0 + fw]
            rgb = out[y0:y0 + fh, x0:x0 + fw, :3]
            hair = al & (yy < .32) & (hh > 25) & (hh < 60) & (ss > .25) & (vv > .38)
            shirt = al & (yy > .15) & (yy < .56) & ((hh > 335) | (hh < 18)) & (ss > .3)
            skirt = al & (hh > 165) & (hh < 210) & (ss > .25)
            blazer = al & (yy > .14) & (yy < .6) & (ss < .16) & (vv > .22) & (vv < .8) & ~hair
            rgb[hair] = tint(rgb[hair], (58, 36, 26), 1.0, .5, 1.05)
            rgb[shirt] = tint(rgb[shirt], (44, 118, 116), .9)
            rgb[blazer] = tint(rgb[blazer], (122, 108, 94), .45)
            # red tartan: red base, dark green/black crossing lines every 4 px, a thin light line every 8
            if skirt.any():
                base = tint(rgb[skirt], (150, 34, 40), .95, .5, 1.3)
                ys_, xs_ = np.nonzero(skirt)
                gy, gx = (ys_ % 4 == 0), (xs_ % 4 == 0)
                dark = gy | gx
                base[dark] = base[dark] * np.array([.55, .7, .6])
                lite = (ys_ % 8 == 2) & (xs_ % 2 == 0)
                base[lite] = base[lite] * .6 + np.array([200, 170, 120]) * .4
                rgb[skirt] = base
            out[y0:y0 + fh, x0:x0 + fw, :3] = rgb
    return out
