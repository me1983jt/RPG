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
  | "bike";

export type Resource = "scrap" | "wood" | "stone";

export interface PropSpec {
  w: number;
  h: number;
  blocks: boolean;
  drawH: number;
  image: string;
}

export const PROP_SPEC: Record<PropKind, PropSpec> = {
  "tree-dead": { w: 1, h: 1, blocks: true, drawH: 340, image: "tree-dead" },
  "tree-scrub": { w: 1, h: 1, blocks: true, drawH: 320, image: "tree-scrub" },
  "tree-pine": { w: 1, h: 1, blocks: true, drawH: 393, image: "tree-pine" },
  "tree-yellow": { w: 1, h: 1, blocks: true, drawH: 339, image: "tree-yellow" },
  "tree-orange": { w: 1, h: 1, blocks: true, drawH: 339, image: "tree-orange" },
  "tree-red": { w: 1, h: 1, blocks: true, drawH: 347, image: "tree-red" },
  "tree-spruce": { w: 1, h: 1, blocks: true, drawH: 410, image: "tree-spruce" },
  "tree-fir": { w: 1, h: 1, blocks: true, drawH: 400, image: "tree-fir" },
  "tree-birch": { w: 1, h: 1, blocks: true, drawH: 340, image: "tree-birch" },
  "tree-bare": { w: 1, h: 1, blocks: true, drawH: 320, image: "tree-bare" },
  "car-sedan": { w: 1, h: 1, blocks: true, drawH: 123, image: "car-sedan" },
  "car-truck": { w: 1, h: 1, blocks: true, drawH: 179, image: "car-truck" },
  rock: { w: 1, h: 1, blocks: true, drawH: 135, image: "rock" },
  shack: { w: 2, h: 2, blocks: true, drawH: 366, image: "shack" },
  ruin: { w: 2, h: 2, blocks: true, drawH: 274, image: "ruin" },
  wall: { w: 1, h: 1, blocks: true, drawH: 234, image: "wall" },
  workshop: { w: 2, h: 2, blocks: true, drawH: 287, image: "workshop" },
  campfire: { w: 1, h: 1, blocks: false, drawH: 47, image: "campfire" },
  scrap: { w: 1, h: 1, blocks: true, drawH: 72, image: "scrap" },
  logs: { w: 1, h: 1, blocks: true, drawH: 106, image: "logs" },
  shelter: { w: 2, h: 2, blocks: true, drawH: 366, image: "shack" },
  farmhouse: { w: 2, h: 2, blocks: true, drawH: 430, image: "farmhouse" },
  barn: { w: 2, h: 2, blocks: true, drawH: 400, image: "barn" },
  orchard: { w: 1, h: 1, blocks: true, drawH: 320, image: "orchard" },
  maple: { w: 1, h: 1, blocks: true, drawH: 390, image: "maple" },
  press: { w: 1, h: 1, blocks: true, drawH: 150, image: "press" },
  crates: { w: 1, h: 1, blocks: true, drawH: 110, image: "crates" },
  cot: { w: 1, h: 1, blocks: false, drawH: 92, image: "cot" },
  hatch: { w: 1, h: 1, blocks: false, drawH: 128, image: "hatch" },
  stall: { w: 1, h: 1, blocks: true, drawH: 168, image: "stall" },
  cache: { w: 1, h: 1, blocks: true, drawH: 168, image: "cache" },
  bike: { w: 1, h: 1, blocks: false, drawH: 92, image: "bike" },
};

export interface Recipe {
  kind: PropKind;
  wood: number;
  stone: number;
  scrap: number;
  label: string;
  blurb: string;
}

export const RECIPES: Recipe[] = [
  { kind: "shelter", wood: 8, stone: 4, scrap: 0, label: "Lean-to", blurb: "Spruce poles and canvas. You wake here if you fall." },
  { kind: "wall", wood: 2, stone: 0, scrap: 0, label: "Stake fence", blurb: "Sharpened spruce. A wall, not a charm." },
  { kind: "workshop", wood: 6, stone: 2, scrap: 8, label: "Smithy", blurb: "A stump forge. Camp iron in, nails out. Slowly." },
  { kind: "campfire", wood: 3, stone: 2, scrap: 0, label: "Cookfire", blurb: "Heat, dry wool, hot water. Rest, not a blessing." },
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
    | "walter";
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
  look: LookId;
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

export type Phase = "menu" | "play" | "pause" | "dialogue" | "dead";

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

export interface HudSnapshot {
  phase: Phase;
  ready: boolean;
  hasSave: boolean;
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
  aim: AimPart;
  turnBased: boolean;
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
