# Drop-in terrain art (v14.7)

Put PNGs in `public/game/terrain/` and list their names (without `.png`) in `public/game/terrain/terrain.json`,
e.g. `["ground-dirt-1", "ground-dirt-2", "tree-pine", "tree-pine-2", "rock-2"]`. Only listed files are requested.
No code change is needed. Delete a name from the list to go back to the built-in art.

Rules
- `<name>.png` with the exact name of a built-in image replaces it. `<name>-<n>.png` (n = 1, 2, 3...) adds a variant.
  When a name has variants (and/or an exact replacement), each tile or prop picks one by a stable hash, so the
  world looks the same every visit. The built-in image is used only when no file for that name is listed.
- PNG, sRGB, transparent background (except ground). No drawn drop shadow under props (the engine draws one).
- Lighting from the upper left, the same muted autumn/winter Maine palette as the current art.

Ground (seamless, tiling)
| file | replaces | size |
|---|---|---|
| `ground-dirt[-n].png` | farm/field dirt (tile 0) | 256x256, tiles seamlessly on all 4 sides |
| `ground-scrub[-n].png` | grass/scrub (tile 1) | 256x256 |
| `ground-road[-n].png` | gravel road (tile 2) | 256x256 |
| `ground-rubble[-n].png` | rubble/town lots (tile 3) | 256x256 |
| `ground-snow[-n].png` | snow, also laid over other ground when it snows | 256x256 |
Ground is drawn top-down (square), then the engine skews it into the 2:1 isometric view and blends neighboring
ground types with its own noise fade, so paint it flat, top-down, with no perspective and no hard borders.
Edge blending between types is done by the engine; per-pair edge pieces (`edge-<a>-<b>-<n>.png`, 256x256, the
`a` type fading out over transparent toward the bottom) are a reserved name for a later version.

Props (isometric, drawn standing, foot at the bottom center)
| file | replaces | size (keep the built-in proportions) |
|---|---|---|
| `tree-pine`, `tree-spruce`, `tree-fir`, `tree-birch`, `tree-maple`... `[-n].png` | the matching tree | about 224x480 |
| `tree-dead`, `tree-bare`, `tree-scrub`, `tree-yellow`, `tree-orange`, `tree-red` | same | about 224x480 |
| `rock[-n].png` | boulders | about 88x84 (bigger is fine; the engine scales by its own draw height) |
| `wall[-n].png` | stone walls | about 164x124 |
| `logs`, `crates`, `scrap`, `ruin`, `shack`, `car-sedan`, `car-truck` `[-n].png` | same | same aspect as built-in |
The engine draws each prop at its own fixed height, so the image's aspect ratio sets the width.

Water and details (reserved, loaded but not drawn yet)
- `river-<straight|bend|fork|end>-<n>.png`, `stream-<straight|bend|end>-<n>.png`: 256x256 top-down pieces, transparent around the water.
- `detail-<dirt|scrub|road|rubble|snow>-<n>.png`: small top-down decals (64x64 to 128x128) to scatter on that ground.
