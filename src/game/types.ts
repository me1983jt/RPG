import { PIECES } from "./v14";
import { propH } from "./sizes";
import type { BagStack, LookId, Quality, RoleId, TraitId } from "@/game/gear";

export const TILE = 64;
export const MAP_W = 156;
export const MAP_H = 156;
export const SEED = 0x527047;
export const WORLD_OX = 22;
export const WORLD_OY = 20;
export const HEX_CX = 80;
export const HEX_CY = 78;
export const HEX_R = 74;

export const DIRT = 0;
export const SCRUB = 1;
export const ROAD = 2;
export const RUBBLE = 3;
export const SNOW = 4;
export const VOID = 5;

export type PropKind =
  | "tree-dead"
  | "tree-scrub"
  | "tree-pine"
  | "tree-yellow"
  | "tree-orange"
  | "tree-red"
  | "tree-spruce"
  | "tree-fir"
  | "tree-birch"
  | "tree-bare"
  | "car-sedan"
  | "car-truck"
  | "rock"
  | "shack"
  | "ruin"
  | "wall"
  | "workshop"
  | "campfire"
  | "scrap"
  | "logs"
  | "shelter"
  | "farmhouse"
  | "barn"
  | "orchard"
  | "maple"
  | "press"
  | "crates"
  | "cot"
  | "hatch"
  | "stall"
  | "cache"
  | "bike"
  | "stand"
  | "stand-up"
  | "blind"
  | "blind-up"
  | "firepot"
  | "firepot-up"
  | "nest"
  | "nest-up"
  | "fence"
  | "fence-2"
  | "fence-3"
  | "fence-x"
  | "stand-3"
  | "stand-x"
  | "blind-3"
  | "blind-x"
  | "firepot-3"
  | "firepot-x"
  | "nest-3"
  | "nest-x"
  | "post-loft"
  | "post-porch"
  | "post-roof"
  | "scarecrow"
  | "bait"
  | "tractor"
  | "wall-wood"
  | "wall-stone"
  | "wall-metal"
  | "gate-wood"
  | "gate-stone"
  | "gate-metal"
  | "wall-x"
  | "spikes"
  | "chest"
  | "rainbarrel"
  | "sandbags"
  | "sandbags-x"
  | "workbench"
  | "wreck"
  | "firering"
  | "stash"
  | "sign-farm"
  | "lookout"
  | "lookout-x"
  | "garden"
  | "smokehouse"
  | "raincollector"
  | "still";

export type Resource = "scrap" | "wood" | "stone";

export interface PropSpec {
  w: number;
  h: number;
  blocks: boolean;
  drawH: number;
  image: string;
}

export const PROP_SPEC: Record<PropKind, PropSpec> = {
  "tree-dead": { w: 1, h: 1, blocks: true, drawH: propH("tree-dead"), image: "tree-dead" },
  "tree-scrub": { w: 1, h: 1, blocks: true, drawH: propH("tree-scrub"), image: "tree-scrub" },
  "tree-pine": { w: 1, h: 1, blocks: true, drawH: propH("tree-pine"), image: "tree-pine" },
  "tree-yellow": { w: 1, h: 1, blocks: true, drawH: propH("tree-yellow"), image: "tree-yellow" },
  "tree-orange": { w: 1, h: 1, blocks: true, drawH: propH("tree-orange"), image: "tree-orange" },
  "tree-red": { w: 1, h: 1, blocks: true, drawH: propH("tree-red"), image: "tree-red" },
  "tree-spruce": { w: 1, h: 1, blocks: true, drawH: propH("tree-spruce"), image: "tree-spruce" },
  "tree-fir": { w: 1, h: 1, blocks: true, drawH: propH("tree-fir"), image: "tree-fir" },
  "tree-birch": { w: 1, h: 1, blocks: true, drawH: propH("tree-birch"), image: "tree-birch" },
  "tree-bare": { w: 1, h: 1, blocks: true, drawH: propH("tree-bare"), image: "tree-bare" },
  "car-sedan": { w: 1, h: 1, blocks: true, drawH: propH("car-sedan"), image: "car-sedan" },
  "car-truck": { w: 1, h: 1, blocks: true, drawH: propH("car-truck"), image: "car-truck" },
  rock: { w: 1, h: 1, blocks: true, drawH: propH("rock"), image: "rock" },
  shack: { w: 2, h: 2, blocks: true, drawH: propH("shack"), image: "shack" },
  ruin: { w: 2, h: 2, blocks: true, drawH: propH("ruin"), image: "ruin" },
  wall: { w: 1, h: 1, blocks: true, drawH: propH("wall"), image: "wall" },
  workshop: { w: 2, h: 2, blocks: true, drawH: propH("workshop"), image: "workshop" },
  campfire: { w: 1, h: 1, blocks: false, drawH: propH("campfire"), image: "campfire" },
  scrap: { w: 1, h: 1, blocks: true, drawH: propH("scrap"), image: "scrap" },
  logs: { w: 1, h: 1, blocks: true, drawH: propH("logs"), image: "logs" },
  shelter: { w: 2, h: 2, blocks: true, drawH: propH("shelter"), image: "shack" },
  farmhouse: { w: 2, h: 2, blocks: true, drawH: propH("farmhouse"), image: "farmhouse" },
  barn: { w: 2, h: 2, blocks: true, drawH: propH("barn"), image: "barn" },
  orchard: { w: 1, h: 1, blocks: true, drawH: propH("orchard"), image: "orchard" },
  maple: { w: 1, h: 1, blocks: true, drawH: propH("maple"), image: "maple" },
  press: { w: 1, h: 1, blocks: true, drawH: propH("press"), image: "press" },
  crates: { w: 1, h: 1, blocks: true, drawH: propH("crates"), image: "crates" },
  cot: { w: 1, h: 1, blocks: false, drawH: propH("cot"), image: "cot" },
  hatch: { w: 1, h: 1, blocks: false, drawH: propH("hatch"), image: "hatch" },
  stall: { w: 1, h: 1, blocks: true, drawH: propH("stall"), image: "stall" },
  cache: { w: 1, h: 1, blocks: true, drawH: propH("cache"), image: "cache" },
  bike: { w: 1, h: 1, blocks: false, drawH: propH("bike"), image: "bike" },
  stand: { w: 1, h: 1, blocks: false, drawH: propH("stand"), image: "stand" },
  "stand-up": { w: 1, h: 1, blocks: false, drawH: propH("stand-up"), image: "stand-up" },
  blind: { w: 1, h: 1, blocks: true, drawH: propH("blind"), image: "blind" },
  "blind-up": { w: 1, h: 1, blocks: true, drawH: propH("blind-up"), image: "blind-up" },
  firepot: { w: 1, h: 1, blocks: false, drawH: propH("firepot"), image: "firepot" },
  "firepot-up": { w: 1, h: 1, blocks: false, drawH: propH("firepot-up"), image: "firepot-up" },
  nest: { w: 1, h: 1, blocks: true, drawH: propH("nest"), image: "nest" },
  "nest-up": { w: 1, h: 1, blocks: true, drawH: propH("nest-up"), image: "nest-up" },
  fence: { w: 1, h: 1, blocks: true, drawH: propH("fence"), image: "fence" },
  "fence-2": { w: 1, h: 1, blocks: true, drawH: propH("fence-2"), image: "fence-2" },
  "fence-3": { w: 1, h: 1, blocks: true, drawH: propH("fence-3"), image: "fence-3" },
  "fence-x": { w: 1, h: 1, blocks: false, drawH: propH("fence-x"), image: "fence-x" },
  "stand-3": { w: 1, h: 1, blocks: false, drawH: propH("stand-3"), image: "stand-3" },
  "stand-x": { w: 1, h: 1, blocks: false, drawH: propH("stand-x"), image: "stand-x" },
  "blind-3": { w: 1, h: 1, blocks: true, drawH: propH("blind-3"), image: "blind-3" },
  "blind-x": { w: 1, h: 1, blocks: false, drawH: propH("blind-x"), image: "blind-x" },
  "firepot-3": { w: 1, h: 1, blocks: false, drawH: propH("firepot-3"), image: "firepot-3" },
  "firepot-x": { w: 1, h: 1, blocks: false, drawH: propH("firepot-x"), image: "firepot-x" },
  "nest-3": { w: 1, h: 1, blocks: true, drawH: propH("nest-3"), image: "nest-3" },
  "nest-x": { w: 1, h: 1, blocks: false, drawH: propH("nest-x"), image: "nest-x" },
  "post-loft": { w: 1, h: 1, blocks: false, drawH: propH("post-loft"), image: "post-loft" },
  "post-porch": { w: 1, h: 1, blocks: false, drawH: propH("post-porch"), image: "post-porch" },
  "post-roof": { w: 1, h: 1, blocks: false, drawH: propH("post-roof"), image: "post-roof" },
  scarecrow: { w: 1, h: 1, blocks: false, drawH: propH("scarecrow"), image: "scarecrow" },
  bait: { w: 1, h: 1, blocks: false, drawH: propH("bait"), image: "bait" },
  tractor: { w: 1, h: 1, blocks: false, drawH: propH("tractor"), image: "tractor" },
  "wall-wood": { w: 1, h: 1, blocks: true, drawH: propH("wall-wood"), image: "v14/wall-wood" },
  "wall-stone": { w: 1, h: 1, blocks: true, drawH: propH("wall-stone"), image: "v14/wall-stone" },
  "wall-metal": { w: 1, h: 1, blocks: true, drawH: propH("wall-metal"), image: "v14/wall-metal" },
  "gate-wood": { w: 1, h: 1, blocks: true, drawH: propH("gate-wood"), image: "v14/gate-wood" },
  "gate-stone": { w: 1, h: 1, blocks: true, drawH: propH("gate-stone"), image: "v14/gate-stone" },
  "gate-metal": { w: 1, h: 1, blocks: true, drawH: propH("gate-metal"), image: "v14/gate-metal" },
  "wall-x": { w: 1, h: 1, blocks: false, drawH: propH("wall-x"), image: "v14/wall-x" },
  "spikes": { w: 1, h: 1, blocks: false, drawH: propH("spikes"), image: "v14/spikes" },
  "chest": { w: 1, h: 1, blocks: true, drawH: propH("chest"), image: "v14/chest" },
  "rainbarrel": { w: 1, h: 1, blocks: true, drawH: propH("rainbarrel"), image: "v14/rainbarrel" },
  "sandbags": { w: 1, h: 1, blocks: true, drawH: propH("sandbags"), image: "v14/sandbags" },
  "sandbags-x": { w: 1, h: 1, blocks: false, drawH: propH("sandbags-x"), image: "v14/sandbags-x" },
  "workbench": { w: 1, h: 1, blocks: true, drawH: propH("workbench"), image: "v14/workbench" },
  "wreck": { w: 1, h: 1, blocks: true, drawH: propH("wreck"), image: "v14/wreck" },
  "firering": { w: 1, h: 1, blocks: false, drawH: propH("firering"), image: "v14/firering" },
  "stash": { w: 1, h: 1, blocks: false, drawH: propH("stash"), image: "v14/stash" },
  "sign-farm": { w: 1, h: 1, blocks: false, drawH: propH("sign-farm"), image: "v14/sign-farm" },
  "lookout": { w: 1, h: 1, blocks: false, drawH: propH("lookout"), image: "v14/lookout" },
  "lookout-x": { w: 1, h: 1, blocks: false, drawH: propH("lookout-x"), image: "v14/lookout-x" },
  "garden": { w: 1, h: 1, blocks: true, drawH: propH("garden"), image: "v14/garden" },
  "smokehouse": { w: 1, h: 1, blocks: true, drawH: propH("smokehouse"), image: "v14/smokehouse" },
  "raincollector": { w: 1, h: 1, blocks: true, drawH: propH("raincollector"), image: "v14/raincollector" },
  "still": { w: 1, h: 1, blocks: true, drawH: propH("still"), image: "v14/still" },
};

export interface Recipe {
  v14?: boolean;
  need14?: Partial<Record<string, number>>;
  kind: PropKind;
  wood: number;
  stone: number;
  scrap: number;
  label: string;
  blurb: string;
}

// v15.9.5: no turrets, fences, lures or spike traps (base defences went with raids)
export const RECIPES: Recipe[] = [
  { kind: "shelter", wood: 8, stone: 4, scrap: 0, label: "Lean-to", blurb: "Spruce poles and canvas. You wake here if you fall." },
  { kind: "wall", wood: 2, stone: 0, scrap: 0, label: "Log wall", blurb: "A solid crib of logs. It does not burn as fast." },
  { kind: "workshop", wood: 6, stone: 2, scrap: 8, label: "Smithy", blurb: "A stump forge. Camp iron in, nails out. Slowly." },
  { kind: "campfire", wood: 3, stone: 2, scrap: 0, label: "Cookfire", blurb: "Heat, dry wool, hot water. Rest, not a blessing." },
  ...PIECES.filter((p) => p.kind !== "campfire").map((p) => ({ kind: p.kind as PropKind, wood: p.cost.wood ?? 0, stone: p.cost.stone ?? 0, scrap: p.cost.iron ?? 0, label: p.name, blurb: p.blurb, v14: true, need14: p.cost })),
];

export interface Prop {
  id: number;
  kind: PropKind;
  tx: number;
  ty: number;
  resource?: Resource;
  amount?: number;
  loose?: boolean;
  built?: boolean;
  locked?: boolean;
  cool?: number;
  burn?: number;
  hp?: number;
  charge?: number;
  flash?: number;
  /** v11.3 art hook: draws public/game/v2/<skin>.png when it exists, else the kind's own art. */
  skin?: string;
  /** v11.3 stand-in sign painted over a building (Skowhegan). */
  label?: string;
}

export type BeastKind = "bandit" | "wolf" | "coyote" | "deer" | "moose" | "rabbit" | "squirrel";
export type AimPart = "head" | "chest" | "arm" | "leg";

export interface Npc {
  id: number;
  role:
    | "mira"
    | "bram"
    | "sera"
    | "holt"
    | "ivo"
    | "justin"
    | "sarah"
    | "cyndal"
    | "loki"
    | "rejean"
    | "cal"
    | "adele"
    | "pete"
    | "nora"
    | "villager"
    | "etta"
    | "gus"
    | "ruth"
    | "emile"
    | "paul"
    | "mae"
    | "walter"
    | "warden"
    | "marcel";
  name: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  dir: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  frame: number;
  anim: number;
  path: { x: number; y: number }[] | null;
  pause: number;
  hp: number;
  maxHp: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  hp: number;
  maxHp: number;
  atk: number;
  xp: number;
  elite: boolean;
  quest: boolean;
  kind: BeastKind;
  pack: number;
  temper: "hostile" | "wary" | "timid";
  crippleArm: number;
  crippleLeg: number;
  dir: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  frame: number;
  anim: number;
  cooldown: number;
  path: { x: number; y: number }[] | null;
  pathT: number;
  aggro: boolean;
  dead: boolean;
  hurt: number;
  name?: string;
  variant?: "fur" | "mask" | "saw" | "scout" | "brute" | "torch" | "jumper" | "armor" | "shield" | "atv" | "holeb" | "pelletier" | "warden" | "grok" | "bear";
  slow?: number;
  death?: number;
}

export interface Player {
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  xp: number;
  level: number;
  scrap: number;
  wood: number;
  stone: number;
  blade: boolean;
  role: RoleId;
  trait: TraitId | "";
  baseAtk: number;
  bag: BagStack[];
  weaponId: string;
  coatId: string;
  headId: string;
  legsId: string;
  handsId: string;
  /** Diablo-style pack (v0.6): extra equipment slots and backpack grid spots by item id. */
  feetId?: string;
  offId?: string;
  backId?: string;
  gridPos?: Record<string, [number, number]>;
  look: LookId;
  /** Hair dye from character creation. */
  hair?: "black" | "brown" | "gray" | "auburn";
  strength: number;
  vigor: number;
  endurance: number;
  intellect: number;
  perception: number;
  luck: number;
  points: number;
  stamina: number;
  maxStamina: number;
  dir: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  frame: number;
  anim: number;
  cooldown: number;
  hurt: number;
  invuln: number;
  respawnX: number;
  respawnY: number;
}

export type Phase = "worldmap" | "town" | "menu" | "play" | "pause" | "dialogue" | "dead";

export interface Choice {
  label: string;
  id: string;
  check?: { skill: "rifle" | "melee" | "doctor" | "lock" | "speech" | "barter" | "sneak" | "trail"; dc: number };
}

export interface Dialogue {
  speaker: string;
  text: string;
  choices: Choice[];
}

export interface InvItem {
  id: string;
  name: string;
  qty: number;
  quality: string;
  note: string;
  kind: string;
  family: string;
  atk: number;
  def: number;
  heal: number;
  worth: number;
  w: number;
  h: number;
  x: number;
  y: number;
  /** equipment slot this can go in ("" for things you use or keep) */
  fits: string[];
  icon: string;
}
export interface InvView {
  cols: number;
  rows: number;
  /** rows past the grid holding stacks that did not fit (old saves); nothing new goes in until cleared */
  over: number;
  items: InvItem[];
  slots: Record<string, InvItem | null>;
  figure: string;
  /** armor overlay art on the portrait, by slot, when a file exists */
  overlays: string[];
  atk: number;
  def: number;
}

export interface PackSlot {
  id: string;
  name: string;
  qty: number;
  kind: "weapon" | "coat" | "supply";
  slot: "head" | "chest" | "legs" | "hands" | "weapon" | "";
  note: string;
  quality: Quality;
  equipped: boolean;
  heal: number;
}

export interface LootLine {
  key: string;
  label: string;
}

export interface V113Hud {
  skills: { id: string; name: string; lv: number; xp: number; need: number; perk: string; how: string }[];
  ach: { id: string; name: string; text: string; got: boolean }[];
  ups: { id: string; name: string; tier: number; max: number; next: string }[];
  dog: { mode: string; hp: number; down: boolean } | null;
  wind: string;
  toast: { id: string; name: string; text: string; n: number } | null;
}
export interface HudSnapshot {
  v14?: any;
  wmap?: any;
  safe15?: boolean;
  v113?: V113Hud;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  v13?: any;
  phase: Phase;
  ready: boolean;
  hasSave: boolean;
  slot?: number;
  slots?: { slot: number; used: boolean; label: string }[];
  auto?: { slot: number; label: string; where: string } | null;
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpNext: number;
  scrap: number;
  wood: number;
  stone: number;
  shells: number;
  quest: number;
  questKills: number;
  questText: string;
  journal: { id: string; title: string; text: string; done: boolean }[];
  log: string[];
  logIds?: number[];
  v141?: any;
  buildOpen: boolean;
  recipe: number;
  canPlace: boolean;
  dialogue: Dialogue | null;
  loot: { title: string; lines: LootLine[] } | null;
  blade: boolean;
  roleTitle: string;
  atk: number;
  def: number;
  packOpen: boolean;
  pack: PackSlot[];
  inv: InvView | null;
  weaponName: string;
  coatName: string;
  headName: string;
  legsName: string;
  handsName: string;
  wornHead: string;
  wornChest: string;
  wornLegs: string;
  wornHands: string;
  wornWeapon: string;
  gun: boolean;
  riding: boolean;
  canMount?: boolean;
  aim: AimPart;
  turnBased: boolean;
  gfxHigh?: boolean;
  perfMode?: boolean;
  showFps?: boolean;
  fpsCap?: number;
  ap: number;
  maxAp: number;
  statsOpen: boolean;
  points: number;
  strength: number;
  vigor: number;
  endurance: number;
  intellect: number;
  perception: number;
  luck: number;
  stamina: number;
  maxStamina: number;
  inside: boolean;
  clock: string;
  region: string;
  skillPoints: number;
  skills: { id: string; name: string; score: number; tagged: boolean }[];
  perkReady: boolean;
  perkChoices: { id: string; name: string; blurb: string; ok: boolean }[];
  perkNames: string;
  karmaWord: string;
  repLine: string;
  canRetag: boolean;
  party: { name: string; hp: number; maxHp: number } | null;
}

export const PLACES = {
  ashwell: { tx: 18 + WORLD_OX, ty: 22 + WORLD_OY, name: "Lowelltown" },
  cambridge: { tx: 36 + WORLD_OX, ty: 16 + WORLD_OY, name: "Cambridge Road" },
  millcross: { tx: 58 + WORLD_OX, ty: 54 + WORLD_OY, name: "Attean" },
  rustyard: { tx: 98 + WORLD_OX, ty: 30 + WORLD_OY, name: "The Chopping" },
  bonehollow: { tx: 102 + WORLD_OX, ty: 100 + WORLD_OY, name: "Holeb" },
} as const;

export const FARM = { tx: 36 + WORLD_OX, ty: 16 + WORLD_OY, r: 12 } as const;

export function inFarm(_tx: number, _ty: number): boolean {
  // v15.9.5: the farm lives only in Quest RPG's Harmony town; FARM is kept as the map anchor Harmony's entrance is found from
  return false;
}

// v15.4: buildings are drawn 1.5x along with the 1.5x people (touch-up art). The big houses also get a
// 3x3 footprint so collision and doors match the bigger art. Walls, gates and small props stay grid-sized.
const BUILD_15: PropKind[] = ["shack", "ruin", "workshop", "shelter", "farmhouse", "barn", "orchard", "stall", "stand", "stand-up", "stand-3", "stand-x",
  "blind", "blind-up", "blind-3", "blind-x", "nest", "nest-up", "nest-3", "nest-x", "post-loft", "post-porch", "post-roof",
  "lookout", "lookout-x", "smokehouse", "raincollector", "still"];
for (const k of BUILD_15) PROP_SPEC[k].drawH = Math.round(PROP_SPEC[k].drawH * 1.5);
for (const k of ["shack", "ruin", "shelter", "farmhouse", "barn"] as PropKind[]) { PROP_SPEC[k].w = 3; PROP_SPEC[k].h = 3; }
