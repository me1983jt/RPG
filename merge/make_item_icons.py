"""Placeholder item icons for the pack screen (public/game/items/<name>.png), painted-ish:
shaded shapes with a dark outline, sized to each item's grid footprint (64 px per cell).
Real art can replace any file by name. Tools reuse the game's tool-*.png / icon-*.png art."""
import sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np
root = sys.argv[1] if len(sys.argv) > 1 else "."
G = f"{root}/public/game"; OUT = f"{G}/items"; os.makedirs(OUT, exist_ok=True)
S = 4  # supersample

def canvas(w, h):
    return Image.new("RGBA", (w * 64 * S, h * 64 * S), (0, 0, 0, 0))

def shade(mask, base, light=(1.25), dark=0.6, noise=10, seed=0):
    """fill a mask with base color, lit from the top-left, a little paint grain, dark outline"""
    m = np.array(mask).astype(float) / 255
    H, W = m.shape
    yy, xx = np.mgrid[0:H, 0:W]
    ys, xs = np.where(m > .5)
    if len(ys) == 0: return Image.new("RGBA", mask.size)
    t = ((yy - ys.min()) / max(1, ys.max() - ys.min()) * .7 + (xx - xs.min()) / max(1, xs.max() - xs.min()) * .3)
    f = light + (dark - light) * t
    rng = np.random.default_rng(seed)
    grain = rng.normal(0, noise, (H // S + 1, W // S + 1)).repeat(S, 0).repeat(S, 1)[:H, :W]
    rgb = np.clip(np.array(base, float)[None, None, :] * f[..., None] + grain[..., None], 0, 255)
    # outline: mask minus eroded mask
    er = np.array(mask.filter(ImageFilter.MinFilter(S * 2 + 1))).astype(float) / 255
    edge = np.clip(m - er, 0, 1)
    rgb = rgb * (1 - edge[..., None] * .75) + np.array([24, 18, 14])[None, None, :] * edge[..., None] * .75
    out = np.dstack([rgb, m * 255]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")

def layer(img, draw_fn, base, seed=0, **kw):
    mask = Image.new("L", img.size, 0)
    draw_fn(ImageDraw.Draw(mask))
    img.alpha_composite(shade(mask, base, seed=seed, **kw))

def save(img, name):
    w, h = img.size
    img = img.resize((w // S, h // S), Image.LANCZOS)
    img.save(f"{OUT}/{name}.png")

def P(img, fx, fy):  # fractional point
    return (fx * img.size[0], fy * img.size[1])

def poly(img, pts):
    return lambda d: d.polygon([P(img, *p) for p in pts], fill=255)

def ell(img, x0, y0, x1, y1):
    return lambda d: d.ellipse([*P(img, x0, y0), *P(img, x1, y1)], fill=255)

def rect(img, x0, y0, x1, y1, r=0):
    return lambda d: d.rounded_rectangle([*P(img, x0, y0), *P(img, x1, y1)], radius=r * S, fill=255)

def coat(name, color, collar=(90, 70, 50), long=True):
    im = canvas(2, 3)
    bot = .94 if long else .8
    layer(im, poly(im, [(.3, .1), (.7, .1), (.92, .26), (.97, .62), (.84, .64), (.8, .4), (.8, bot), (.2, bot), (.2, .4), (.16, .64), (.03, .62), (.08, .26)]), color, seed=1)
    layer(im, poly(im, [(.38, .1), (.5, .3), (.62, .1), (.56, .08), (.44, .08)]), collar, seed=2)
    layer(im, rect(im, .485, .3, .515, bot - .02), tuple(int(c * .6) for c in color), seed=3)
    for y in (.4, .52, .64, .76):
        layer(im, ell(im, .44, y, .47, y + .02), (200, 180, 140), seed=4)
    save(im, name)

def plate(name, color):
    im = canvas(2, 3)
    layer(im, poly(im, [(.3, .1), (.7, .1), (.9, .25), (.88, .6), (.8, .9), (.2, .9), (.12, .6), (.1, .25)]), (95, 80, 60), seed=1)
    layer(im, rect(im, .24, .24, .76, .66, 6), color, seed=2, noise=14)
    for x, y in ((.3, .3), (.7, .3), (.3, .6), (.7, .6)):
        layer(im, ell(im, x - .025, y - .015, x + .025, y + .015), (60, 56, 52), seed=5)
    layer(im, rect(im, .22, .7, .42, .86, 4), (110, 96, 64), seed=6)
    layer(im, rect(im, .58, .7, .78, .86, 4), (110, 96, 64), seed=7)
    save(im, name)

def cap(name, color, brim=False, helm=False):
    im = canvas(2, 2)
    if helm:
        layer(im, ell(im, .15, .2, .85, .9), color, seed=1, noise=14)
        layer(im, rect(im, .1, .6, .9, .72, 4), tuple(int(c * .7) for c in color), seed=2)
    else:
        if brim: layer(im, ell(im, .05, .55, .95, .85), tuple(int(c * .8) for c in color), seed=2)
        layer(im, poly(im, [(.22, .7), (.25, .35), (.4, .2), (.6, .2), (.75, .35), (.78, .7)]), color, seed=1)
        if not brim: layer(im, rect(im, .2, .62, .8, .76, 3), tuple(int(c * .75) for c in color), seed=3)
    save(im, name)

def legs(name, color):
    im = canvas(2, 2)
    layer(im, poly(im, [(.22, .05), (.78, .05), (.82, .95), (.58, .95), (.5, .35), (.42, .95), (.18, .95)]), color, seed=1)
    layer(im, rect(im, .22, .05, .78, .13), tuple(int(c * .7) for c in color), seed=2)
    save(im, name)

def gloves(name, color):
    im = canvas(2, 2)
    for ox in (0, .46):
        layer(im, poly(im, [(ox + .08, .9), (ox + .1, .45), (ox + .14, .2), (ox + .24, .18), (ox + .26, .4), (ox + .33, .22), (ox + .42, .3), (ox + .44, .62), (ox + .4, .9)]), color, seed=int(ox * 10) + 1)
    save(im, name)

def boots(name, color):
    im = canvas(2, 2)
    for ox in (0, .44):
        layer(im, poly(im, [(ox + .1, .1), (ox + .32, .1), (ox + .34, .62), (ox + .5, .72), (ox + .52, .9), (ox + .06, .9)]), color, seed=int(ox * 10) + 2)
        layer(im, rect(im, ox + .06, .84, ox + .52, .92), (40, 30, 24), seed=3)
    save(im, name)

def frame(name):
    im = canvas(2, 3)
    wood = (150, 112, 70)
    layer(im, rect(im, .2, .05, .3, .95, 3), wood, seed=1)
    layer(im, rect(im, .7, .05, .8, .95, 3), wood, seed=2)
    for y in (.15, .5, .85):
        layer(im, rect(im, .2, y, .8, y + .06, 2), wood, seed=3)
    layer(im, rect(im, .3, .25, .7, .7, 8), (98, 104, 72), seed=4)
    save(im, name)

def bundle(name, color, w=1, h=1, kind="roll"):
    im = canvas(w, h)
    if kind == "roll":
        layer(im, ell(im, .15, .25, .85, .8), color, seed=1)
        layer(im, ell(im, .38, .42, .62, .63), tuple(int(c * .75) for c in color), seed=2)
    elif kind == "box":
        layer(im, rect(im, .12, .2, .88, .85, 6), color, seed=1)
        layer(im, rect(im, .42, .3, .58, .75), (230, 226, 216), seed=2)
        layer(im, rect(im, .25, .45, .75, .6), (230, 226, 216), seed=3)
    elif kind == "tin":
        layer(im, rect(im, .2, .2, .8, .85, 6), color, seed=1, noise=14)
        layer(im, ell(im, .2, .12, .8, .3), tuple(min(255, int(c * 1.2)) for c in color), seed=2)
    elif kind == "bottle":
        layer(im, rect(im, .25, .35, .75, .9, 10), color, seed=1)
        layer(im, rect(im, .4, .1, .6, .38, 3), tuple(int(c * .8) for c in color), seed=2)
    elif kind == "shells":
        for i, x in enumerate((.18, .42, .66)):
            layer(im, rect(im, x, .3, x + .18, .82, 4), (184, 60, 40), seed=i)
            layer(im, rect(im, x, .7, x + .18, .84), (196, 160, 70), seed=i + 3)
    elif kind == "meat":
        layer(im, ell(im, .12, .2, .88, .8), color, seed=1)
        layer(im, ell(im, .3, .35, .5, .55), (230, 210, 190), seed=2)
    elif kind == "apple":
        layer(im, ell(im, .18, .25, .82, .88), color, seed=1)
        layer(im, rect(im, .47, .1, .53, .3), (90, 60, 30), seed=2)
    elif kind == "hide":
        layer(im, poly(im, [(.2, .1), (.5, .2), (.8, .1), (.9, .4), (.8, .9), (.5, .8), (.2, .9), (.1, .4)]), color, seed=1)
    elif kind == "matches":
        layer(im, rect(im, .15, .3, .85, .75, 4), color, seed=1)
        for x in (.3, .45, .6):
            layer(im, rect(im, x, .15, x + .05, .4), (220, 200, 160), seed=2)
            layer(im, ell(im, x - .01, .1, x + .06, .18), (170, 40, 30), seed=3)
    elif kind == "key":
        layer(im, rect(im, .45, .12, .55, .88, 2), color, seed=1)
        layer(im, rect(im, .55, .74, .72, .8), color, seed=2)
        layer(im, ell(im, .32, .08, .68, .3), (110, 84, 50), seed=3)
    elif kind == "wire":
        d = ImageDraw.Draw(m := Image.new("L", im.size))
        for i in range(4):
            d.ellipse([*P(im, .2 + i * .04, .25 + i * .03), *P(im, .8 - i * .04, .75 - i * .03)], outline=255, width=6 * S)
        im.alpha_composite(shade(m, color, seed=4))
    elif kind == "stew":
        layer(im, ell(im, .08, .45, .92, .8), (80, 74, 70), seed=1)
        layer(im, ell(im, .14, .4, .86, .6), (150, 84, 44), seed=2)
    save(im, name)

def from_art(src, name, w, h, rot=0, crop=None):
    a = Image.open(f"{G}/{src}.png").convert("RGBA")
    if crop: a = a.crop(crop)
    a = a.crop(a.getbbox())
    if rot: a = a.rotate(rot, expand=True, resample=Image.BICUBIC); a = a.crop(a.getbbox())
    W, H = w * 64, h * 64
    s = min((W - 6) / a.width, (H - 6) / a.height)
    a = a.resize((max(1, int(a.width * s)), max(1, int(a.height * s))), Image.LANCZOS)
    out = Image.new("RGBA", (W, H)); out.alpha_composite(a, ((W - a.width) // 2, (H - a.height) // 2))
    out.save(f"{OUT}/{name}.png")

def longgun(name, stock=(120, 80, 46), scope=False, double=False):
    im = canvas(1, 4)
    layer(im, poly(im, [(.42, .03), (.58, .03), (.58, .55), (.42, .55)]), (70, 72, 76), seed=1, noise=6)
    if double: layer(im, poly(im, [(.6, .05), (.7, .05), (.7, .55), (.6, .55)]), (70, 72, 76), seed=2, noise=6)
    layer(im, poly(im, [(.36, .52), (.64, .52), (.66, .7), (.8, .95), (.5, .98), (.36, .7)]), stock, seed=3)
    if scope: layer(im, rect(im, .2, .3, .38, .48, 4), (40, 42, 46), seed=4)
    save(im, name)

def blade_tool(name, head, handle=(120, 84, 50), h=3, kind="axe"):
    im = canvas(1, h)
    layer(im, rect(im, .44, .08, .56, .96, 2), handle, seed=1)
    if kind == "axe": layer(im, poly(im, [(.5, .06), (.92, .02), (.98, .22), (.5, .2)]), head, seed=2, noise=6)
    elif kind == "pick": layer(im, poly(im, [(.04, .14), (.5, .04), (.96, .14), (.5, .1)]), head, seed=2, noise=6)
    elif kind == "pry": layer(im, poly(im, [(.44, .04), (.6, .02), (.75, .08), (.56, .1)]), head, seed=2, noise=6)
    elif kind == "knife": layer(im, poly(im, [(.42, .04), (.6, .1), (.58, .55), (.42, .55)]), head, seed=2, noise=6)
    elif kind == "revolver":
        layer(im, rect(im, .3, .1, .7, .5), (64, 66, 70), seed=2, noise=6)
        layer(im, ell(im, .32, .4, .68, .6), (80, 82, 86), seed=3, noise=6)
    save(im, name)

coat("wool", (122, 92, 64)); coat("linen", (200, 190, 160)); coat("quilt", (120, 70, 60)); coat("vest", (150, 128, 90), long=False)
coat("shirt", (156, 142, 104), long=False)
plate("plate", (120, 120, 124)); plate("rig", (92, 104, 76))
cap("woolcap", (120, 50, 40)); cap("soft", (98, 104, 120)); cap("felt", (90, 70, 50), brim=True); cap("ironhat", (110, 110, 116), helm=True)
legs("trousers", (80, 74, 70)); legs("chaps", (120, 80, 50))
gloves("gloves", (120, 100, 80)); gloves("bracers", (130, 90, 56))
boots("boots", (100, 70, 46)); frame("packframe")
longgun("carbine"); longgun("scoped", scope=True); longgun("scatter", (100, 70, 40), double=True)
blade_tool("hatchet", (150, 150, 156), kind="axe"); blade_tool("pick", (130, 130, 136), kind="pick"); blade_tool("pry", (90, 92, 98), h=3, kind="pry")
blade_tool("knife", (190, 190, 196), h=2, kind="knife"); blade_tool("revolver", (0, 0, 0), h=2, kind="revolver")
bundle("bandage", (226, 220, 204)); bundle("kit", (150, 50, 44), 1, 2, "box"); bundle("trauma", (70, 90, 70), 1, 2, "box")
bundle("shells", (0, 0, 0), kind="shells"); bundle("lockpick", (160, 160, 170), kind="key"); bundle("wire", (150, 140, 120), kind="wire")
bundle("pork", (196, 120, 110), kind="meat"); bundle("meat", (170, 60, 56), kind="meat"); bundle("jerky", (120, 60, 40), kind="meat")
bundle("maple", (176, 120, 50), kind="tin"); bundle("oil", (190, 150, 60), kind="bottle"); bundle("matches", (110, 80, 60), kind="matches")
bundle("pelt", (110, 74, 46), 2, 2, "hide"); bundle("hide", (150, 110, 80), 2, 2, "hide"); bundle("cloth", (170, 160, 140), kind="roll")
bundle("apple", (176, 44, 36), kind="apple"); bundle("stew", (0, 0, 0), 1, 2, "stew")
from_art("cider-cups", "cider", 1, 1); from_art("donuts", "donut", 1, 1)
from_art("icon-bomb", "bomb", 1, 1); from_art("icon-fuel", "fuel", 1, 2); from_art("icon-bait", "baitpack", 1, 1)
print(len(os.listdir(OUT)), "icons")
