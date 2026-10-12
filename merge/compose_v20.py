"""v20 merge art step. Grok Build v20 art was reviewed and none of it is taken (see report);
this only strips the baked speck dust from the tractor charge frames, replaced by soft runtime dust clouds."""
from PIL import Image
import numpy as np, sys
root = sys.argv[1] if len(sys.argv) > 1 else "."
p = f"{root}/public/game/tractor-run.png"
a = np.array(Image.open(p).convert("RGBA"))
fw = a.shape[1] // 8
for f in range(8):
    a[:, f * fw: f * fw + 74, 3] = 0
Image.fromarray(a).save(p)
