import { PIECES } from "./v14";
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
  "tree-dead": { w: 1, h: 1, blocks: true, drawH: 420, image: "tree-dead" },
  "tree-scrub": { w: 1, h: 1, blocks: true, drawH: 67, image: "tree-scrub" },
  "tree-pine": { w: 1, h: 1, blocks: true, drawH: 553, image: "tree-pine" },
  "tree-yellow": { w: 1, h: 1, blocks: true, drawH: 442, image: "tree-yellow" },
  "tree-orange": { w: 1, h: 1, blocks: true, drawH: 464, image: "tree-orange" },
  "tree-red": { w: 1, h: 1, blocks: true, drawH: 464, image: "tree-red" },
  "tree-spruce": { w: 1, h: 1, blocks: true, drawH: 552, image: "tree-spruce" },
  "tree-fir": { w: 1, h: 1, blocks: true, drawH: 531, image: "tree-fir" },
  "tree-birch": { w: 1, h: 1, blocks: true, drawH: 444, image: "tree-birch" },
  "tree-bare": { w: 1, h: 1, blocks: true, drawH: 420, image: "tree-bare" },
  "car-sedan": { w: 1, h: 1, blocks: true, drawH: 112, image: "car-sedan" },
  "car-truck": { w: 1, h: 1, blocks: true, drawH: 126, image: "car-truck" },
  rock: { w: 1, h: 1, blocks: true, drawH: 52, image: "rock" },
  shack: { w: 2, h: 2, blocks: true, drawH: 245, image: "shack" },
  ruin: { w: 2, h: 2, blocks: true, drawH: 420, image: "ruin" },
  wall: { w: 1, h: 1, blocks: true, drawH: 82, image: "wall" },
  workshop: { w: 2, h: 2, blocks: true, drawH: 46, image: "workshop" },
  campfire: { w: 1, h: 1, blocks: false, drawH: 30, image: "campfire" },
  scrap: { w: 1, h: 1, blocks: true, drawH: 43, image: "scrap" },
  logs: { w: 1, h: 1, blocks: true, drawH: 36, image: "logs" },
  shelter: { w: 2, h: 2, blocks: true, drawH: 245, image: "shack" },
  farmhouse: { w: 2, h: 2, blocks: true, drawH: 500, image: "farmhouse" },
  barn: { w: 2, h: 2, blocks: true, drawH: 450, image: "barn" },
  orchard: { w: 1, h: 1, blocks: true, drawH: 204, image: "orchard" },
  maple: { w: 1, h: 1, blocks: true, drawH: 498, image: "maple" },
  press: { w: 1, h: 1, blocks: true, drawH: 51, image: "press" },
  crates: { w: 1, h: 1, blocks: true, drawH: 30, image: "crates" },
  cot: { w: 1, h: 1, blocks: false, drawH: 60, image: "cot" },
  hatch: { w: 1, h: 1, blocks: false, drawH: 51, image: "hatch" },
  stall: { w: 1, h: 1, blocks: true, drawH: 91, image: "stall" },
  cache: { w: 1, h: 1, blocks: true, drawH: 97, image: "cache" },
  bike: { w: 1, h: 1, blocks: false, drawH: 32, image: "bike" },
  stand: { w: 1, h: 1, blocks: false, drawH: 67, image: "stand" },
  "stand-up": { w: 1, h: 1, blocks: false, drawH: 111, image: "stand-up" },
  blind: { w: 1, h: 1, blocks: true, drawH: 72, image: "blind" },
  "blind-up": { w: 1, h: 1, blocks: true, drawH: 84, image: "blind-up" },
  firepot: { w: 1, h: 1, blocks: false, drawH: 37, image: "firepot" },
  "firepot-up": { w: 1, h: 1, blocks: false, drawH: 35, image: "firepot-up" },
  nest: { w: 1, h: 1, blocks: true, drawH: 56, image: "nest" },
  "nest-up": { w: 1, h: 1, blocks: true, drawH: 66, image: "nest-up" },
  fence: { w: 1, h: 1, blocks: true, drawH: 66, image: "fence" },
  "fence-2": { w: 1, h: 1, blocks: true, drawH: 77, image: "fence-2" },
  "fence-3": { w: 1, h: 1, blocks: true, drawH: 88, image: "fence-3" },
  "fence-x": { w: 1, h: 1, blocks: false, drawH: 44, image: "fence-x" },
  "stand-3": { w: 1, h: 1, blocks: false, drawH: 132, image: "stand-3" },
  "stand-x": { w: 1, h: 1, blocks: false, drawH: 66, image: "stand-x" },
  "blind-3": { w: 1, h: 1, blocks: true, drawH: 110, image: "blind-3" },
  "blind-x": { w: 1, h: 1, blocks: false, drawH: 55, image: "blind-x" },
  "firepot-3": { w: 1, h: 1, blocks: false, drawH: 44, image: "firepot-3" },
  "firepot-x": { w: 1, h: 1, blocks: false, drawH: 24, image: "firepot-x" },
  "nest-3": { w: 1, h: 1, blocks: true, drawH: 82, image: "nest-3" },
  "nest-x": { w: 1, h: 1, blocks: false, drawH: 44, image: "nest-x" },
  "post-loft": { w: 1, h: 1, blocks: false, drawH: 99, image: "post-loft" },
  "post-porch": { w: 1, h: 1, blocks: false, drawH: 58, image: "post-porch" },
  "post-roof": { w: 1, h: 1, blocks: false, drawH: 77, image: "post-roof" },
  scarecrow: { w: 1, h: 1, blocks: false, drawH: 66, image: "scarecrow" },
  bait: { w: 1, h: 1, blocks: false, drawH: 29, image: "bait" },
  tractor: { w: 1, h: 1, blocks: false, drawH: 83, image: "tractor" },
  "wall-wood": { w: 1, h: 1, blocks: true, drawH: 125, image: "v14/wall-wood" },
  "wall-stone": { w: 1, h: 1, blocks: true, drawH: 125, image: "v14/wall-stone" },
  "wall-metal": { w: 1, h: 1, blocks: true, drawH: 125, image: "v14/wall-metal" },
  "gate-wood": { w: 1, h: 1, blocks: true, drawH: 129, image: "v14/gate-wood" },
  "gate-stone": { w: 1, h: 1, blocks: true, drawH: 129, image: "v14/gate-stone" },
  "gate-metal": { w: 1, h: 1, blocks: true, drawH: 129, image: "v14/gate-metal" },
  "wall-x": { w: 1, h: 1, blocks: false, drawH: 78, image: "v14/wall-x" },
  "spikes": { w: 1, h: 1, blocks: false, drawH: 26, image: "v14/spikes" },
  "chest": { w: 1, h: 1, blocks: true, drawH: 30, image: "v14/chest" },
  "rainbarrel": { w: 1, h: 1, blocks: true, drawH: 42, image: "v14/rainbarrel" },
  "sandbags": { w: 1, h: 1, blocks: true, drawH: 34, image: "v14/sandbags" },
  "sandbags-x": { w: 1, h: 1, blocks: false, drawH: 18, image: "v14/sandbags-x" },
  "workbench": { w: 1, h: 1, blocks: true, drawH: 46, image: "v14/workbench" },
  "wreck": { w: 1, h: 1, blocks: true, drawH: 62, image: "v14/wreck" },
  "firering": { w: 1, h: 1, blocks: false, drawH: 24, image: "v14/firering" },
  "stash": { w: 1, h: 1, blocks: false, drawH: 20, image: "v14/stash" },
  "sign-farm": { w: 1, h: 1, blocks: false, drawH: 66, image: "v14/sign-farm" },
  "lookout": { w: 1, h: 1, blocks: false, drawH: 154, image: "v14/lookout" },
  "lookout-x": { w: 1, h: 1, blocks: false, drawH: 154, image: "v14/lookout-x" },
  "garden": { w: 1, h: 1, blocks: true, drawH: 22, image: "v14/garden" },
  "smokehouse": { w: 1, h: 1, blocks: true, drawH: 88, image: "v14/smokehouse" },
  "raincollector": { w: 1, h: 1, blocks: true, drawH: 50, image: "v14/raincollector" },
  "still": { w: 1, h: 1, blocks: true, drawH: 52, image: "v14/still" },
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

export const RECIPES: Recipe[] = [
  { kind: "shelter", wood: 8, stone: 4, scrap: 0, label: "Lean-to", blurb: "Spruce poles and canvas. You wake here if you fall." },
  { kind: "wall", wood: 2, stone: 0, scrap: 0, label: "Log wall", blurb: "A solid crib of logs. It does not burn as fast." },
  { kind: "workshop", wood: 6, stone: 2, scrap: 8, label: "Smithy", blurb: "A stump forge. Camp iron in, nails out. Slowly." },
  { kind: "campfire", wood: 3, stone: 2, scrap: 0, label: "Cookfire", blurb: "Heat, dry wool, hot water. Rest, not a blessing." },
  { kind: "stand", wood: 6, stone: 2, scrap: 1, label: "Rifle stand", blurb: "A raised platform and sandbags. It fires on a raid." },
  { kind: "stand-up", wood: 4, stone: 2, scrap: 4, label: "Raised stand", blurb: "Higher sandbags and a cedar roof. Hits harder." },
  { kind: "blind", wood: 5, stone: 0, scrap: 1, label: "Hunting blind", blurb: "Brush and cedar. A long shot at night." },
  { kind: "blind-up", wood: 4, stone: 1, scrap: 3, label: "Cedar blind", blurb: "Thicker cover and a longer slit." },
  { kind: "firepot", wood: 1, stone: 2, scrap: 2, label: "Fire pot", blurb: "Burning pitch. Raiders slow when they pass it." },
  { kind: "firepot-up", wood: 1, stone: 3, scrap: 3, label: "Stone fire pot", blurb: "A wider pot in a ring of stone." },
  { kind: "nest", wood: 8, stone: 1, scrap: 4, label: "Gun nest", blurb: "Logs and a heavy gun. Mean at close range." },
  { kind: "nest-up", wood: 6, stone: 2, scrap: 6, label: "Camp gun", blurb: "Higher walls and a mounted camp gun." },
  { kind: "fence", wood: 2, stone: 0, scrap: 0, label: "Stake fence", blurb: "A section of sharpened spruce. Most raiders have to go around." },
  { kind: "scarecrow", wood: 2, stone: 0, scrap: 0, label: "Scarecrow", blurb: "Draws a raid toward the row, away from the house." },
  { kind: "bait", wood: 1, stone: 0, scrap: 1, label: "Bait cache", blurb: "Apples and a ham. They come for it." },
  { kind: "post-loft", wood: 4, stone: 0, scrap: 2, label: "Hayloft", blurb: "A rifle slit for the barn loft. It fires on a raid." },
  { kind: "post-porch", wood: 3, stone: 0, scrap: 1, label: "Porch post", blurb: "A chair and a lantern on the farmhouse porch." },
  { kind: "post-roof", wood: 4, stone: 1, scrap: 2, label: "Roof stand", blurb: "Planks and a sandbag on a shack roof." },
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

export function inFarm(tx: number, ty: number): boolean {
  return (tx - FARM.tx) ** 2 + (ty - FARM.ty) ** 2 <= FARM.r * FARM.r;
}
