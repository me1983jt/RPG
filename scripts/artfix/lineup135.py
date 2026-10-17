"""Scale lineup: Justin (69 px) beside every world sprite at its in-game height. 1 ft = 11 px."""
import sys, json
from PIL import Image, ImageDraw, ImageFont
G = '/workspace/maine-rpg/v11/public/game/'
def justin():
    im = Image.open(G + 'v2/hero-idle.png').convert('RGBA')
    c = im.crop((0, 0, 88, 124)); return c.crop(c.getbbox())
def cell(img, rows=1, cols=1, r=0, c=0):
    im = Image.open(G + img + '.png').convert('RGBA')
    w, h = im.width // cols, im.height // rows
    return im.crop((c * w, r * h, c * w + w, r * h + h))
def render(items, out, title, maxw=1900):
    """items: list of (label, PIL image, drawH in world px of the full image/cell)"""
    J = justin(); font = ImageFont.load_default()
    tiles = []
    for label, im, dh in items:
        s = dh / im.height
        im2 = im.resize((max(1, round(im.width * s)), max(1, round(dh))), Image.LANCZOS)
        bb = im2.getbbox() or (0, 0, 1, 1)
        im2 = im2.crop((0, 0, im2.width, bb[3]))  # drop empty below the foot
        w = J.width + 6 + im2.width + 10; h = max(J.height, im2.height) + 30
        t = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        t.alpha_composite(im2, (J.width + 6, h - 18 - im2.height)); t.alpha_composite(J, (0, h - 18 - J.height))
        d = ImageDraw.Draw(t); d.text((2, h - 14), f'{label} {round(bb[3]-bb[1])}px', fill=(240, 236, 220, 255), font=font)
        tiles.append(t)
    rows, row, x = [], [], 0
    for t in tiles:
        if x + t.width > maxw and row: rows.append(row); row, x = [], 0
        row.append(t); x += t.width
    rows.append(row)
    H = sum(max(t.height for t in r) for r in rows) + 30
    o = Image.new('RGBA', (maxw, H), (52, 58, 50, 255)); d = ImageDraw.Draw(o); d.text((6, 6), title, fill=(255, 255, 255, 255), font=font)
    y = 26
    for r in rows:
        rh = max(t.height for t in r); x = 0
        for ft in range(0, rh, 55): d.line([(0, y + rh - 18 - ft), (maxw, y + rh - 18 - ft)], fill=(80, 90, 78, 255))
        for t in r: o.alpha_composite(t, (x, y + rh - t.height)); x += t.width
        y += rh
    o.convert('RGB').save(out); print(out, o.size)
