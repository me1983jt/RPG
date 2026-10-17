import sys, json; sys.path.insert(0, '/workspace/maine-rpg/artfix')
from lineup135 import cell, render
from lineup135_items import specs_from_ts
from PIL import Image
tag = sys.argv[1]; G = sys.argv[2] if len(sys.argv) > 2 else '/workspace/maine-rpg/v11/public/game/'
import lineup135; lineup135.G = G
src = sys.argv[3] if len(sys.argv) > 3 else '/workspace/maine-rpg/v11/src/game/types.ts'
import re
s = open(src).read()
sp = {k: (img, int(dh)) for k, w, h, b, dh, img in re.findall(r'"?([\w-]+)"?: \{ w: (\d), h: (\d), blocks: (\w+), drawH: (\d+), image: "([\w-]+)" \}', s)}
O = lambda f: Image.open(G + f + '.png').convert('RGBA')
after = tag == 'after'
PX = 69 / 74
it = []
skip = {'car-sedan', 'car-truck', 'shelter'}
for k, (img, dh) in sp.items():
    if k in skip: continue
    it.append((k, O(img), dh))
it += [('tractor-drive', cell('v2/tractor-drive', 8, 4, 2, 0), 110 if after else 175),
       ('tractor-run', O('tractor-run').crop((0, 0, 240, 128)), 110 if after else 140),
       ('bike-parked', cell('v2/bike-parked', 8, 1, 2, 0), 76), ('bike-ride', cell('v2/bike-ride', 8, 6, 2, 0), 76 if after else 92),
       ('atv', cell('raider-atv', 8, 4, 2, 0), round((91 if after else 70) * PX / .839)),
       ('hot rod', O('v2/vehicles/car-rod-1-se'), 112), ('chevy', O('v2/vehicles/truck-chevy-1-sw'), 126),
       ('sack', O('sack'), 28 if after else 64), ('stump', O('v2/trees/stump1'), 46), ('log', O('v2/trees/log2'), 84),
       ('moose', cell('moose', 8, 4, 2, 0), round(92 * PX / .621)), ('deer', cell('deer', 8, 4, 2, 0), round(62 * PX / .661)),
       ('wolf', cell('wolf', 8, 4, 2, 0), round(37 * PX / .492)), ('coyote', cell('coyote', 8, 4, 2, 0), round(29 * PX / .476)),
       ('biscuit', cell('coyote', 8, 4, 2, 0), round(27 * PX / .476)), ('hare', cell('rabbit', 8, 4, 2, 0), round(10 * PX / .508)),
       ('sarah', cell('v2/sarah-walk', 8, 8, 0, 0), round(67 * PX / .508)), ('loki', cell('v2/loki-walk', 8, 8, 0, 0), round(61 * PX / .46))]
render(it, f'/workspace/maine-rpg/beta28-shots/lineup-{tag}.png', f'v13.5 {tag.upper()}: Justin (69 px) beside every world sprite at its in-game size. Lines every 5 ft (55 px). 1 ft = 11 px.')
