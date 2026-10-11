import sys
from PIL import Image, ImageDraw
out, cols = sys.argv[1], int(sys.argv[2]); files = sys.argv[3:]
ims = [Image.open(f).convert("RGB") for f in files]
w = max(i.width for i in ims); h = max(i.height for i in ims); rows = (len(ims) + cols - 1) // cols
M = Image.new("RGB", (cols * w, rows * (h + 16)), (20, 20, 20)); d = ImageDraw.Draw(M)
for k, (f, im) in enumerate(zip(files, ims)):
    x, y = (k % cols) * w, (k // cols) * (h + 16); M.paste(im, (x, y + 16)); d.text((x + 4, y + 2), f.split("/")[-1][:-4], fill=(255, 230, 160))
M.save(out)
