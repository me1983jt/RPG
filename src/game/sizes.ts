// v15.9.8 (size198): one real-world size table for everything drawn in the iso world.
// Every sprite type has a real *visible* height in inches (top of head / roof / crown to where it meets the ground,
// as seen in the iso view). Drawn size = inches x PX_PER_IN / fit, where fit is the share of the image"s height that is
// opaque (alpha bbox; scripts/size198-test.mjs re-measures it from the PNGs). So ratios between any two things hold exactly.
// Reference (Quest"s depth.ref idea): the hero is 6 ft 2 = 74 in, a door 80 in, a fence 48 in.

/** Screen px per real inch at zoom 1 in the iso world view (the hero"s 74 in figure is 104 px visible). */
export const PX_PER_IN = 1.405;

/** Real visible heights in inches. */
export const SIZE_IN: Record<string, number> = {
 // people (fine-grained per role in FOLK_IN)
 hero: 74, npc: 70.5, kid: 62, boss: 76, door: 80,
 // animals and bosses (full height, ears/antlers to hooves)
 moose: 92, deer: 62, bear: 40, wolf: 34, coyote: 29, rabbit: 10, squirrel: 8, crow: 10, grok: 98,
 // v15.10: Sarah's baby pet raccoon (10 in at the shoulder, ~12 in to the ear tips, ~21 in nose to tail), wild adult raccoons just under the coyote, painted turtles at rabbit size
 // v15.10.6: the baby drawn at 9 in (it read as big as the wild adults next to Sarah at 12)
 raccoon: 9, "raccoon-wild": 26, turtle: 10,
 // town buildings (Quest"s painted Harmony art). "Real doors": house ~4.3x the hero (x1.564 of the old 2.75x), so its door reads ~80 in.
 "town-house": 319, "town-church": 358, "town-farmhouse": 306, "town-farmhouse-lone": 288, "town-shed": 159, "town-sign": 114, "town-fence": 48,
 // world props (PROP_SPEC kinds)
 "tree-dead": 297,
 "tree-scrub": 48,
 "tree-pine": 391,
 "tree-yellow": 313,
 "tree-orange": 329,
 "tree-red": 329,
 "tree-spruce": 391,
 "tree-fir": 376,
 "tree-birch": 313,
 "tree-bare": 297,
 "car-sedan": 128, // size198: was 76 in (cars were drawn at an older 11 px/ft scale, ~0.65x the hero scale)
 "car-truck": 144, // size198: was 85 in
 "rock": 35,
 "shack": 169,
 "ruin": 288,
 "wall": 55,
 "workshop": 36,
 "campfire": 19,
 "scrap": 28,
 "logs": 24,
 "shelter": 169,
 "farmhouse": 333,
 "barn": 314,
 "orchard": 141,
 "maple": 352,
 "press": 35,
 "crates": 21,
 "cot": 40,
 "hatch": 34,
 "stall": 63,
 "cache": 66,
 "bike": 23,
 "stand": 47,
 "stand-up": 79,
 "blind": 51,
 "blind-up": 59,
 "firepot": 25,
 "firepot-up": 25,
 "nest": 39,
 "nest-up": 47,
 "fence": 48,
 "fence-2": 55,
 "fence-3": 63,
 "fence-x": 31,
 "stand-3": 94,
 "stand-x": 47,
 "blind-3": 78,
 "blind-x": 39,
 "firepot-3": 31,
 "firepot-x": 17,
 "nest-3": 58,
 "nest-x": 31,
 "post-loft": 70,
 "post-porch": 41,
 "post-roof": 55,
 "scarecrow": 47,
 "bait": 21,
 "tractor": 88, // size198: was 59 in (11 px/ft scale); rear wheel now ~54 in
 "wall-wood": 79,
 "wall-stone": 75,
 "wall-metal": 76,
 "gate-wood": 84,
 "gate-stone": 75,
 "gate-metal": 82,
 "wall-x": 34,
 "spikes": 19,
 "chest": 20,
 "rainbarrel": 28,
 "sandbags": 20,
 "sandbags-x": 7,
 "workbench": 30,
 "wreck": 40, // size198: was 22 in (a wrecked pickup lower than a knee)
 "firering": 12,
 "stash": 10,
 "sign-farm": 43,
 "lookout": 104,
 "lookout-x": 88,
 "garden": 15,
 "smokehouse": 59,
 "raincollector": 30,
 "still": 28,
};

/** Opaque share of each prop image"s height (alpha bbox / image height). */
export const PROP_FIT: Record<string, number> = {
 "tree-dead": 0.995,
 "tree-scrub": 1.0,
 "tree-pine": 0.994,
 "tree-yellow": 0.995,
 "tree-orange": 0.995,
 "tree-red": 0.995,
 "tree-spruce": 0.996,
 "tree-fir": 0.994,
 "tree-birch": 0.991,
 "tree-bare": 0.995,
 "car-sedan": 0.957,
 "car-truck": 0.947,
 "rock": 0.952,
 "shack": 0.971,
 "ruin": 0.965,
 "wall": 0.935,
 "workshop": 0.971,
 "campfire": 0.904,
 "scrap": 0.9,
 "logs": 0.919,
 "shelter": 0.971,
 "farmhouse": 0.935,
 "barn": 0.98,
 "orchard": 0.973,
 "maple": 0.993,
 "press": 0.962,
 "crates": 1.0,
 "cot": 0.941,
 "hatch": 0.94,
 "stall": 0.965,
 "cache": 0.962,
 "bike": 1.0,
 "stand": 0.995,
 "stand-up": 0.997,
 "blind": 1.0,
 "blind-up": 0.988,
 "firepot": 0.946,
 "firepot-up": 1.0,
 "nest": 0.988,
 "nest-up": 1.0,
 "fence": 1.0,
 "fence-2": 1.0,
 "fence-3": 1.0,
 "fence-x": 1.0,
 "stand-3": 1.0,
 "stand-x": 1.0,
 "blind-3": 1.0,
 "blind-x": 1.0,
 "firepot-3": 1.0,
 "firepot-x": 1.0,
 "nest-3": 1.0,
 "nest-x": 1.0,
 "post-loft": 1.0,
 "post-porch": 1.0,
 "post-roof": 1.0,
 "scarecrow": 1.0,
 "bait": 1.0,
 "tractor": 1.0,
 "wall-wood": 0.883,
 "wall-stone": 0.84,
 "wall-metal": 0.851,
 "gate-wood": 0.92,
 "gate-stone": 0.814,
 "gate-metal": 0.894,
 "wall-x": 0.611,
 "spikes": 1.0,
 "chest": 0.95,
 "rainbarrel": 0.929,
 "sandbags": 0.824,
 "sandbags-x": 0.556,
 "workbench": 0.92,
 "wreck": 0.5,
 "firering": 0.708,
 "stash": 0.717,
 "sign-farm": 0.924,
 "lookout": 0.95,
 "lookout-x": 0.807,
 "garden": 0.932,
 "smokehouse": 0.939,
 "raincollector": 0.84,
 "still": 0.75,
};
/** Same for the town art in public/game/town. */
export const TOWN_FIT: Record<string, number> = {"house": 1.0, "church": 1.0, "farmhouse": 1.0, "shed": 1.0, "sign": 1.0, "fence": 0.912};

/** People: visible height per NPC role, inches. */
export const FOLK_IN: Record<string, number> = {
 justin: 74, sarah: 67, cyndal: 61.5, loki: 61, villager: 69,
 rejean: 72, cal: 71, pete: 73, warden: 74, bram: 72, emile: 70, gus: 69, holt: 73, ivo: 70, paul: 71, walter: 69,
 marcel: 70, adele: 66, sera: 66, mira: 65, nora: 66, ruth: 65, mae: 64, etta: 66
};
/** Beasts, raiders and bosses: visible height (top of head/antlers to hooves), inches. v13.2: moose 92 puts the shoulder at ~66 px. */
export const BEAST_IN: Record<string, number> = {
 holeb: 120, grok: SIZE_IN.grok, warden: 74, collector: 77, pelletier: 67, fur: 76, saw: 74, armor: 75, mask: 72,
 // v13.5: atv 91 in puts the quad at ~72 px long (6.5 ft) with the rider seated at ~5.5 ft
 brute: 77, shield: 72, atv: 91, jumper: 69, scout: 68,
 bear: SIZE_IN.bear, moose: SIZE_IN.moose, deer: SIZE_IN.deer, wolf: SIZE_IN.wolf, coyote: SIZE_IN.coyote, rabbit: SIZE_IN.rabbit, squirrel: SIZE_IN.squirrel, crow: SIZE_IN.crow, raccoon: SIZE_IN["raccoon-wild"], turtle: SIZE_IN.turtle
};

/** Drawn (full image) height in px at zoom 1 for something `inches` tall whose image is `fit` opaque. */
export function sizedPx(inches: number, fit = 1): number {
 return Math.round(inches * PX_PER_IN / (fit || 1));
}
/** PROP_SPEC drawH for a prop kind. */
export function propH(kind: string): number {
 const inches = SIZE_IN[kind];
 if (inches == null) throw new Error(`size198: no real size for prop ${kind}`);
 return sizedPx(inches, PROP_FIT[kind] ?? 1);
}
/** Town art height for a SIZE_IN key like "town-house" drawing art `art`. */
export function townH(key: string, art: string): number {
 return sizedPx(SIZE_IN[key], TOWN_FIT[art] ?? 1);
}

/** Animal sheets: mean visible share of a frame"s height over every facing and frame (alpha > 60). Iso facings differ, so the
 * mean is the honest "how tall it reads" number; SPRITE_FIT (single facing) drew deer/moose ~13% short. */
export const BEAST_FIT: Record<string, number> = {"deer": 0.668, "moose": 0.612, "wolf": 0.487, "coyote": 0.487, "rabbit": 0.423, "squirrel": 0.389, "crow": 0.235, "v2/raccoon-walk": 0.398, "v2/raccoon-wild-walk": 0.351, "v2/raccoon-wild-idle": 0.351, "v2/turtle-walk": 0.288};
/** Trees vary per tile around their table height (natural spread), drawn at x0.84..x1.12. */
export const TREE_VARY = [0.84, 0.07, 5] as const; // min, step, steps
