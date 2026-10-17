import json, sys
sys.path.insert(0, '/workspace/maine-rpg/artfix')
from lineup135 import cell, render
from PIL import Image
G = '/workspace/maine-rpg/v11/public/game/'
def items(spec, extra):
    out = []
    seen = set()
    for k, (img, dh) in spec.items():
        out.append((k, Image.open(G + img + '.png').convert('RGBA'), dh))
    for label, im, dh in extra: out.append((label, im, dh))
    return out
def specs_from_ts():
    import re
    s = open('/workspace/maine-rpg/v11/src/game/types.ts').read()
    return {k: (img, int(dh)) for k, w, h, b, dh, img in re.findall(r'"?([\w-]+)"?: \{ w: (\d), h: (\d), blocks: (\w+), drawH: (\d+), image: "([\w-]+)" \}', s)}
