"""v13.5 real-size pass. 1 ft = 11 px; Justin 69 px.
Each world sprite gets a target for its visible art (alpha > 24): a height in ft ("h"), a width in px ("w"),
or a fixed drawH ("d", from a measured feature such as a door or a wheel). drawH is the full image height in
world px, so drawH = target_px * image_h / content_h. Files that would be downscaled past 2x the phone (dpr 2)
size are resampled once with LANCZOS to 2x the world size; the renderer then draws them 1:1 on a phone."""
import json, os, re, sys
import numpy as np
from PIL import Image
G = '/workspace/maine-rpg/v11/public/game/'
BK = '/workspace/maine-rpg/art-backup-v13.4/'
FT = 11
# kind: (mode, value, real-world assumption)
T = {
 'tree-dead': ('h', 38, 'dead pine snag, 38 ft'),
 'tree-scrub': ('h', 6, 'juniper/yew bush, 6 ft tall'),
 'tree-pine': ('h', 50, 'white pine, 50 ft (mature 50-80 ft; capped for the screen)'),
 'tree-yellow': ('h', 40, 'yellow aspen/birch crown, 40 ft'),
 'tree-orange': ('h', 42, 'sugar maple, 42 ft'),
 'tree-red': ('h', 42, 'red maple, 42 ft'),
 'tree-spruce': ('h', 50, 'red spruce, 50 ft'),
 'tree-fir': ('h', 48, 'balsam fir, 48 ft'),
 'tree-birch': ('h', 40, 'paper birch, 40 ft'),
 'tree-bare': ('h', 38, 'leafless hardwood, 38 ft'),
 'car-sedan': ('d', 112, 'drawn by the hot rod art (145x112 native)'),
 'car-truck': ('d', 126, 'drawn by the Chevy art (175x126 native)'),
 'rock': ('h', 4.5, 'field boulder, 4.5 ft'),
 'shack': ('d', 245, 'cabin: door 58 src px -> 77 px (7 ft), walls 8.5 ft'),
 'shelter': ('d', 245, 'same art as the cabin'),
 'ruin': ('d', 420, 'brick mill ruin: arched door ~77 px (7 ft), 38 ft tall'),
 'wall': ('h', 7, 'log/picket palisade, 7 ft'),
 'workshop': ('h', 4, 'stump forge: anvil on a stump with tongs, 4 ft'),
 'campfire': ('h', 2.5, 'stone ring and flames, 2.5 ft'),
 'scrap': ('h', 3.5, 'scrap pile, 3.5 ft'),
 'logs': ('h', 3, 'stacked firewood logs, 3 ft'),
 'farmhouse': ('d', 500, '2-storey farmhouse: door 32 src px -> 75 px (6.8 ft), walls ~21 ft, 43 ft to chimney'),
 'barn': ('d', 450, 'gambrel barn: side wall 15 ft, sliding door 8.4 ft, 41 ft to cupola'),
 'orchard': ('h', 18, 'apple tree, 18 ft'),
 'maple': ('h', 45, 'sugar maple, 45 ft'),
 'press': ('h', 4.5, 'cider press with screw, 4.5 ft'),
 'crates': ('h', 2.6, 'two stacked apple crates heaped with apples, 2.6 ft'),
 'cot': ('w', 72, 'camp cot, 6.5 ft long'),
 'hatch': ('w', 110, 'bunker hatch (3 ft door) in a 10 ft patch of turf'),
 'stall': ('h', 8, 'market stall with canopy, 8 ft'),
 'cache': ('h', 8.5, 'supply table under a camo canopy, 8.5 ft'),
 'bike': ('w', 66, 'motor bicycle, 6 ft long (legacy art; the v2 bike is drawn 1:1)'),
 'stand': ('h', 6, 'rifle stand: 4 ft crate platform, sandbags and rifle, 6 ft'),
 'stand-up': ('h', 10, 'raised stand with a cedar roof, 10 ft'),
 'stand-3': ('h', 12, 'sandbagged tower stand, 12 ft'),
 'stand-x': ('h', 6, 'wrecked stand, 6 ft heap'),
 'blind': ('h', 6.5, 'brush hunting blind, 6.5 ft'),
 'blind-up': ('h', 7.5, 'cedar blind, 7.5 ft'),
 'blind-3': ('h', 10, 'two-tier cedar blind, 10 ft'),
 'blind-x': ('h', 5, 'collapsed blind, 5 ft'),
 'firepot': ('h', 3, 'iron fire pot on legs with flame, 3 ft'),
 'firepot-up': ('h', 3.2, 'stone-ringed fire pot with flame, 3.2 ft'),
 'firepot-3': ('h', 4, 'big stone fire pit with flame, 4 ft'),
 'firepot-x': ('h', 2.2, 'cold broken pot, 2.2 ft'),
 'nest': ('h', 5, 'log and sandbag gun nest, 4 ft wall plus gun, 5 ft'),
 'nest-up': ('h', 6, 'camp gun nest, 6 ft'),
 'nest-3': ('h', 7.5, 'round log bunker with mounted gun, 7.5 ft'),
 'nest-x': ('h', 4, 'wrecked nest, 4 ft'),
 'fence': ('h', 6, 'sharpened stake fence, 6 ft'),
 'fence-2': ('h', 7, 'taller stake fence, 7 ft'),
 'fence-3': ('h', 8, 'heavy plank stockade, 8 ft'),
 'fence-x': ('h', 4, 'broken fence, 4 ft'),
 'post-loft': ('h', 9, 'hayloft gun post (small loft shed), 9 ft'),
 'post-porch': ('d', 58, 'porch deck: chair back 3.5 ft (38 px), rifle 3.4 ft, deck ~9 ft wide'),
 'post-roof': ('h', 7, 'roof stand: plank table, sandbags and a brush roof, 7 ft'),
 'scarecrow': ('h', 6, 'scarecrow on a post, 6 ft'),
 'bait': ('h', 2.6, 'bait crate with a ham and apples, 2.6 ft'),
 'tractor': ('d', 83, 'old farm tractor: rear wheel 72 src px -> 50 px (4.5 ft), 10.3 ft long, wheel 5.8 ft up'),
}
NO_RESAMPLE = {'logs', 'bench', 'shack', 'farmhouse', 'barn', 'ruin', 'car-sedan', 'car-truck'}  # interiors / painted door tables / unused
def content(im):
    a = np.array(im.convert('RGBA'))[..., 3] > 24
    ys, xs = np.nonzero(a)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
spec = dict((k, (int(dh), img)) for k, dh, img in re.findall(r'"?([\w-]+)"?: \{ w: \d, h: \d, blocks: \w+, drawH: (\d+), image: "([\w-]+)" \}', open('/workspace/maine-rpg/v11/src/game/types.ts').read()))
rows = []; done = set()
for k, (mode, val, note) in T.items():
    old, img = spec[k]
    src = Image.open(BK + img + '.png').convert('RGBA')  # always from the v13.4 art
    W, H = src.size; x0, y0, x1, y1 = content(src)
    if mode == 'h': new = val * FT * H / (y1 - y0)
    elif mode == 'w': new = val * H / (x1 - x0)
    else: new = val
    new = int(round(new))
    file_h = H
    if k not in NO_RESAMPLE and img not in done and 2 * new < H * .9:
        file_h = 2 * new
        out = src.resize((max(1, round(W * file_h / H)), file_h), Image.LANCZOS)
        out.save(G + img + '.png'); done.add(img)
    elif img in done: file_h = Image.open(G + img + '.png').height
    sc_old, sc_new = old / H, new / H
    rows.append(dict(kind=k, image=img, old_drawH=old, new_drawH=new,
                     old_px=[round((x1 - x0) * sc_old), round((y1 - y0) * sc_old)], new_px=[round((x1 - x0) * sc_new), round((y1 - y0) * sc_new)],
                     old_ft=round((y1 - y0) * sc_old / FT, 1), new_ft=round((y1 - y0) * sc_new / FT, 1), file=[W, H], file_new=file_h, real=note))
json.dump(rows, open('/workspace/maine-rpg/artfix/scale135.json', 'w'), indent=1)
for r in rows: print(f"{r['kind']:12s} drawH {r['old_drawH']:4d} -> {r['new_drawH']:4d}  art {r['old_px']} -> {r['new_px']}  {r['old_ft']} ft -> {r['new_ft']} ft  file {r['file'][1]}->{r['file_new']}")
