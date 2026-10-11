import sys
from PIL import Image, ImageDraw
ROWS = "S SW W NW N NE E SE".split()
def contact(paths, out, scale=2, labels=None):
    """paths: list of (label, path); 8-row 4-col sheets or 1-row 4-frame strips, side by side."""
    tiles = []
    for lab, p in paths:
        im = Image.open(p).convert("RGBA")
        W, H = im.size
        rows = 8 if H > W else 1
        bg = Image.new("RGBA", (W, H), (120, 128, 120, 255))
        # checker per cell
        cw, ch = W // 4, H // rows
        d = ImageDraw.Draw(bg)
        for r in range(rows):
            for c in range(4):
                if (r + c) % 2: d.rectangle([c*cw, r*ch, (c+1)*cw-1, (r+1)*ch-1], fill=(104, 112, 104, 255))
        bg.alpha_composite(im)
        bg = bg.resize((W*scale, H*scale), Image.NEAREST)
        lab_h = 18
        t = Image.new("RGBA", (bg.width + (34 if rows == 8 else 0), bg.height + lab_h), (30, 30, 30, 255))
        t.paste(bg, (34 if rows == 8 else 0, lab_h))
        dd = ImageDraw.Draw(t)
        dd.text((4, 3), lab, fill=(255, 230, 160, 255))
        if rows == 8:
            for r in range(8): dd.text((4, lab_h + r*ch*scale + ch*scale//2), ROWS[r], fill=(255, 255, 255, 255))
        tiles.append(t)
    W = sum(t.width for t in tiles) + 6*(len(tiles)-1); H = max(t.height for t in tiles)
    sheet = Image.new("RGBA", (W, H), (20, 20, 20, 255)); x = 0
    for t in tiles: sheet.paste(t, (x, 0)); x += t.width + 6
    sheet.save(out)
if __name__ == "__main__":
    out = sys.argv[1]; sc = int(sys.argv[2]); args = sys.argv[3:]
    contact([(a.split("=")[0], a.split("=")[1]) for a in args], out, sc)
