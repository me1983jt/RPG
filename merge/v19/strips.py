import sys
from PIL import Image, ImageDraw
out = sys.argv[1]; sc = float(sys.argv[2]); paths = sys.argv[3:]
rows = []
for p in paths:
    im = Image.open(p).convert("RGBA"); W, H = im.size
    bg = Image.new("RGBA", (W, H), (110, 120, 110, 255)); d = ImageDraw.Draw(bg)
    n = 8 if W / H > 10 else 4
    for i in range(n):
        if i % 2: d.rectangle([i*W//n, 0, (i+1)*W//n-1, H], fill=(95, 104, 95, 255))
    bg.alpha_composite(im); bg = bg.resize((int(W*sc), int(H*sc)), Image.NEAREST)
    t = Image.new("RGBA", (bg.width, bg.height + 14), (25, 25, 25, 255)); t.paste(bg, (0, 14))
    ImageDraw.Draw(t).text((3, 1), p.split("/")[-1], fill=(255, 230, 160, 255)); rows.append(t)
W = max(r.width for r in rows); H = sum(r.height for r in rows)
s = Image.new("RGBA", (W, H), (20, 20, 20, 255)); y = 0
for r in rows: s.paste(r, (0, y)); y += r.height
s.save(out)
