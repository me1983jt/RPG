#!/usr/bin/env python3
"""v21 merge (Grok Build export grok-workspace-19.zip, Oct 11 9:16 PM) onto combined-v21/public/game.
Taken (cleaned / adapted):
 - item icons for the NEW items only (v21's flat icons, refit to 64 px per grid cell and given the same
   light-from-top-left shading + grain as the placeholder icons so they sit together);
 - armor overlays that read right on the hero: snowshoes, steeltoes (walk sheet + portrait) -> overlay/;
 - Mother Pelletier (walk + 8-dir attack/death), magenta fringe cleaned;
 - empty-slot hint silhouettes (ui-slot-*) -> ui/.
Built here instead of v21's art (v21's was crude / broken):
 - The Moose of Holeb: the game's own rendered moose, darkened and frosted (drawn 1.5x in game);
 - The Bangor Warden: a game warden recoloured from the painted v7 Holt figure (olive coat, dark
   trousers, tan cap) + a 4-frame fall strip.
Not taken: v21 hero/NPC/guard/animal sheets (unchanged from v20), building art (flat door rectangles
pasted on), the other armor overlays (flat patches / ghost outlines), portrait.png (magenta fringe; the
pack screen renders the dyed hero instead), Moose/Warden/Rail Baron art, railcar, ui-pack.
usage: compose_v21.py <v21 public/game> <combined public/game>"""
import sys, os, colorsys
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(__file__))
from compose_v19_art import clean_sheet, fall_strip, defringe

V, C = sys.argv[1], sys.argv[2]
os.makedirs(f"{C}/items", exist_ok=True); os.makedirs(f"{C}/overlay", exist_ok=True); os.makedirs(f"{C}/ui", exist_ok=True)

# item sizes in cells (must match src/game/inventory.ts itemSize)
# (v21's weapon / coat / hat icons were flat rectangles; make_item_icons.py paints those instead)
SIZE = {"syrup": (1, 1),
        "smokedfish": (1, 1), "dandelion": (1, 1), "radio": (1, 1), "binoculars": (1, 1), "lantern": (1, 2),
        "antlers": (2, 2), "sapbucket": (1, 1)}

def paint(im):
    """light from the top-left, a little grain, a soft dark rim: matches make_item_icons.py"""
    a = np.array(im).astype(float); al = a[..., 3] / 255
    H, W = al.shape; ys, xs = np.where(al > .1)
    if not len(ys): return im
    yy, xx = np.mgrid[0:H, 0:W]
    t = (yy - ys.min()) / max(1, ys.max() - ys.min()) * .7 + (xx - xs.min()) / max(1, xs.max() - xs.min()) * .3
    f = 1.18 - .5 * t
    g = np.random.default_rng(7).normal(0, 7, (H // 2 + 1, W // 2 + 1)).repeat(2, 0).repeat(2, 1)[:H, :W]
    a[..., :3] = np.clip(a[..., :3] * f[..., None] + g[..., None], 0, 255)
    er = np.array(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))).astype(float) / 255
    edge = np.clip(al - er, 0, 1)[..., None]
    a[..., :3] = a[..., :3] * (1 - edge * .55) + np.array([24, 18, 14]) * edge * .55
    return Image.fromarray(a.astype(np.uint8))

for n, (w, h) in SIZE.items():
    src = Image.open(f"{V}/icon-item-{n}.png").convert("RGBA")
    src = src.crop(src.getbbox())
    W, H = w * 64, h * 64
    s = min((W - 8) / src.width, (H - 8) / src.height)
    big = src.resize((max(1, round(src.width * s)), max(1, round(src.height * s))), Image.LANCZOS)
    out = Image.new("RGBA", (W, H)); out.alpha_composite(big, ((W - big.width) // 2, (H - big.height) // 2))
    paint(out).save(f"{C}/items/{n}.png")

for n in ("snowshoes", "steeltoes"):
    Image.open(f"{V}/armor-{n}.png").save(f"{C}/overlay/{n}.png")
    Image.open(f"{V}/armor-{n}-portrait.png").save(f"{C}/overlay/{n}-portrait.png")

for f in ("boss-pelletier", "boss-pelletier-atk", "boss-pelletier-dead"):
    print(f, clean_sheet(f"{V}/{f}.png", f"{C}/{f}.png", 8))

def dehalo(path):
    """drop the pale one-pixel rim v21 left around Pelletier (light, grey pixels touching transparency)"""
    a = np.array(Image.open(path).convert("RGBA")); al = a[..., 3] > 24
    for _ in range(2):
        er = np.array(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))) > 0
        rim = al & ~er
        r, g, b = (a[..., i].astype(int) for i in range(3))
        lum = r * .3 + g * .59 + b * .11; sat = np.max(a[..., :3], -1).astype(int) - np.min(a[..., :3], -1)
        kill = rim & (((lum > 128) & (sat < 60)) | ((r - g > 22) & (r - b > 10)))
        a[kill, 3] = 0; al = a[..., 3] > 24
    # the flat yellow lantern: shade it like glass with a flame (brighter centre, darker edges)
    r, g, b = (a[..., i].astype(int) for i in range(3))
    lamp = (r > 200) & (g > 150) & (b < 120) & (a[..., 3] > 200)
    from scipy import ndimage as ndi
    lab, n = ndi.label(lamp)
    for k in range(1, n + 1):
        ys, xs = np.where(lab == k)
        if len(ys) < 6: continue
        cy, cx = ys.mean(), xs.mean(); ry, rx = max(1, np.ptp(ys) / 2 + .5), max(1, np.ptp(xs) / 2 + .5)
        d = np.sqrt(((ys - cy) / ry) ** 2 + ((xs - cx) / rx) ** 2)
        k2 = np.clip(1.15 - d * .55, .55, 1.15)[:, None]
        a[ys, xs, :3] = np.clip(np.array([255, 214, 120]) * k2, 0, 255).astype(np.uint8)
    Image.fromarray(a).save(path)
for f in ("boss-pelletier", "boss-pelletier-atk", "boss-pelletier-dead"):
    dehalo(f"{C}/{f}.png")

for s in ("back", "boots", "coat", "gloves", "helmet", "pants", "weapon"):
    # keep only the silhouette: drop v21's frame and fill (the pack screen draws its own slot frame)
    a = np.array(Image.open(f"{V}/ui-slot-{s}.png").convert("RGBA"))
    bg = (np.abs(a[..., :3].astype(int) - [28, 20, 14]).sum(-1) < 14) | (a[..., 3] < 190)
    a[bg, 3] = 0; a[:7] = 0; a[-7:] = 0; a[:, :7] = 0; a[:, -7:] = 0
    a[..., 3] = np.where(a[..., 3] > 0, 255, 0)
    im = Image.fromarray(a); im.crop(im.getbbox()).save(f"{C}/ui/slot-{s}.png")

# The Moose of Holeb: our moose, darker hide, frost on the back and antlers
def holeb(src, dst):
    a = np.array(Image.open(src).convert("RGBA")).astype(float)
    rgb = a[..., :3]; lum = rgb @ [.3, .59, .11]
    rgb = rgb * .62 + lum[..., None] * .12
    hi = np.clip((lum - 120) / 90, 0, 1)[..., None]           # the lit top of the hide and the antlers
    rgb = rgb * (1 - hi * .55) + np.array([214, 222, 230]) * hi * .55
    a[..., :3] = np.clip(rgb, 0, 255)
    Image.fromarray(a.astype(np.uint8)).save(dst)
holeb(f"{C}/moose.png", f"{C}/boss-holeb.png")
holeb(f"{C}/moose-dead.png", f"{C}/boss-holeb-dead.png")

# The Bangor Warden from Holt: green coat -> olive drab, trousers -> charcoal, cap -> tan
def warden(src, dst):
    a = np.array(Image.open(src).convert("RGBA")); rgb = a[..., :3].astype(float) / 255
    H, W = a.shape[:2]; ch = H // 8
    hsv = np.zeros_like(rgb)
    flat = rgb.reshape(-1, 3)
    hsvf = np.array([colorsys.rgb_to_hsv(*p) for p in flat]).reshape(rgb.shape)
    h, s, v = hsvf[..., 0], hsvf[..., 1], hsvf[..., 2]
    yy = np.arange(H)[:, None] % ch / ch * np.ones((1, W))
    green = (h > .17) & (h < .45) & (s > .18)
    brown = (h < .12) & (s > .25) & (v < .6) & (yy > .55)
    cap = green & (yy < .2)
    h = np.where(green, .16, h); s = np.where(green, s * .75, s); v = np.where(green, v * .82, v)
    h = np.where(cap, .1, h); s = np.where(cap, .45, s); v = np.where(cap, np.minimum(1, v * 1.35), v)
    s = np.where(brown, s * .25, s); v = np.where(brown, v * .55, v)
    out = np.array([colorsys.hsv_to_rgb(*p) for p in np.dstack([h, s, v]).reshape(-1, 3)]).reshape(rgb.shape)
    a[..., :3] = np.clip(out * 255, 0, 255).astype(np.uint8)
    Image.fromarray(a).save(dst)
warden(f"{C}/npc-holt.png", f"{C}/boss-warden.png")
fall_strip(f"{C}/boss-warden.png", f"{C}/boss-warden-dead.png")
print("done")
