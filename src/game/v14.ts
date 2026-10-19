/** v14: the roadside start, the farm's rough defenses, the workbench and base pieces. Data only; engine.ts runs it. */
export type V14Mat = "wood" | "stone" | "iron" | "junk" | "cloth" | "hide" | "grokclaw";
export const MAT_NAME: Record<V14Mat, string> = { wood: "Wood", stone: "Stone", iron: "Iron", junk: "Scrap", cloth: "Cloth", hide: "Hide", grokclaw: "Grok claw" };
export type Cost = Partial<Record<V14Mat, number>>;

export interface V14State {
  /** 0 search the wreck, 1 light the fire, 2 follow the smoke, 3 trust task (First Snow), 4 defend the farm, 5 secured */
  st: number;
  camp: { tx: number; ty: number } | null;
  bench: number;
  /** fort pieces by key "tx,ty": kind and hp, so damage and repairs keep */
  fort: Record<string, { k: string; hp: number }>;
  /** pieces the player placed: kind, tile, hp, flipped */
  placed: { k: string; tx: number; ty: number; hp: number; f?: boolean }[];
  defendWave: number;
  tries: number;
  report: { night: number; items: { name: string; hp: number; max: number }[]; cost: Cost } | null;
}
export function freshV14(): V14State {
  return { st: 0, camp: null, bench: 1, fort: {}, placed: [], defendWave: 0, tries: 0, report: null };
}
/** Saves made before v14 already have the farm: count it found, held and built. */
export function loadV14(raw: Partial<V14State> | undefined): V14State {
  if (!raw) return { ...freshV14(), st: 5 };
  return { ...freshV14(), ...raw, fort: raw.fort ?? {}, placed: raw.placed ?? [] };
}
export const STAGE_TEXT = [
  "Search the wrecked truck by the road.",
  "Get 3 wood and light the fire ring.",
  "Follow the chimney smoke east to the farm.",
  "",
  "Defend the farm: hold the gate and the walls.",
];

/** Base pieces. kind = prop kind. Tiers go wood, stone, metal. */
export interface Piece { id: string; kind: string; name: string; cost: Cost; hp: number; up?: string; blurb: string }
export const PIECES: Piece[] = [
  { id: "wall-wood", kind: "wall-wood", name: "Stake wall", cost: { wood: 3 }, hp: 60, up: "wall-stone", blurb: "Sharpened spruce stakes, 7 ft." },
  { id: "wall-stone", kind: "wall-stone", name: "Stone wall", cost: { stone: 4, wood: 1 }, hp: 120, up: "wall-metal", blurb: "Fieldstone laid dry." },
  { id: "wall-metal", kind: "wall-metal", name: "Sheet-iron wall", cost: { iron: 3, junk: 2 }, hp: 200, blurb: "Roofing tin on posts." },
  { id: "gate-wood", kind: "gate-wood", name: "Plank gate", cost: { wood: 4 }, hp: 70, up: "gate-stone", blurb: "Tap to open or shut." },
  { id: "gate-stone", kind: "gate-stone", name: "Stone-post gate", cost: { stone: 4, wood: 2 }, hp: 130, up: "gate-metal", blurb: "Heavy door, stone posts." },
  { id: "gate-metal", kind: "gate-metal", name: "Iron gate", cost: { iron: 4, junk: 2 }, hp: 210, blurb: "Barred and riveted." },
  { id: "spikes", kind: "spikes", name: "Spike trap", cost: { wood: 2, junk: 1 }, hp: 40, blurb: "Hurts raiders who cross it. Wears down." },
  { id: "sandbags", kind: "sandbags", name: "Sandbags", cost: { cloth: 1, stone: 1 }, hp: 50, blurb: "Cover. Raiders have to break it." },
  { id: "chest", kind: "chest", name: "Storage chest", cost: { wood: 3, iron: 1 }, hp: 40, blurb: "Holds what the pack can't." },
  { id: "campfire", kind: "campfire", name: "Campfire", cost: { wood: 3, stone: 2 }, hp: 30, blurb: "Heat and a pot." },
  { id: "rainbarrel", kind: "rainbarrel", name: "Rain barrel", cost: { wood: 3, iron: 1 }, hp: 30, blurb: "Fills itself. Water for the jug." },
];
export const PIECE_HP: Record<string, number> = Object.fromEntries(PIECES.map((p) => [p.kind, p.hp]));
PIECE_HP["lookout"] = 70;
export const PIECE_BROKEN: Record<string, string> = {
  "wall-wood": "wall-x", "wall-stone": "wall-x", "wall-metal": "wall-x",
  "gate-wood": "wall-x", "gate-stone": "wall-x", "gate-metal": "wall-x",
  sandbags: "sandbags-x", lookout: "lookout-x", chest: "chest", rainbarrel: "rainbarrel", spikes: "spikes",
};
export const PIECE_UP: Record<string, string> = Object.fromEntries(PIECES.filter((p) => p.up).map((p) => [p.kind, p.up!]));
export const isWall14 = (k: string) => /^(wall|gate)-(wood|stone|metal)$/.test(k);
export const isGate14 = (k: string) => /^gate-(wood|stone|metal)$/.test(k);
/** What fixing a broken piece costs (rebuilds it as wood tier). */
export function repairCost(kind: string, hp: number, max: number): Cost {
  const p = PIECES.find((x) => x.kind === kind) ?? PIECES[0];
  const f = Math.max(0, 1 - hp / max);
  const out: Cost = {};
  for (const [m, n] of Object.entries(p.cost)) { const v = Math.ceil((n as number) * f * .6); if (v > 0) out[m as V14Mat] = v; }
  return out;
}

/** Workbench recipes, tiers 1-3. makes = GEAR id. */
export interface Craft14 { id: string; makes: string; qty: number; tier: 1 | 2 | 3; group: "Weapons" | "Tools" | "Armor" | "Traps" | "Ammo" | "Meds"; cost: Cost }
export const CRAFT14: Craft14[] = [
  { id: "c-knife", makes: "knife", qty: 1, tier: 1, group: "Weapons", cost: { junk: 1, wood: 1 } },
  { id: "c-hatchet", makes: "hatchet", qty: 1, tier: 1, group: "Tools", cost: { wood: 2, junk: 1 } },
  { id: "c-pick", makes: "pick", qty: 1, tier: 1, group: "Tools", cost: { wood: 2, stone: 2, junk: 1 } },
  { id: "c-cap", makes: "woolcap", qty: 1, tier: 1, group: "Armor", cost: { cloth: 2 } },
  { id: "c-canvas", makes: "canvas", qty: 1, tier: 1, group: "Armor", cost: { cloth: 4 } },
  { id: "c-trousers", makes: "trousers", qty: 1, tier: 1, group: "Armor", cost: { cloth: 3 } },
  { id: "c-snare", makes: "snare", qty: 1, tier: 1, group: "Traps", cost: { junk: 1, cloth: 1 } },
  { id: "c-bandage", makes: "bandage", qty: 2, tier: 1, group: "Meds", cost: { cloth: 2 } },
  { id: "c-shells", makes: "shells", qty: 4, tier: 1, group: "Ammo", cost: { iron: 2, junk: 1 } },
  { id: "c-knife2", makes: "knife-std", qty: 1, tier: 2, group: "Weapons", cost: { iron: 3, wood: 1, hide: 1 } },
  { id: "c-axe2", makes: "hatchet-std", qty: 1, tier: 2, group: "Weapons", cost: { iron: 4, wood: 2, junk: 2 } },
  { id: "c-pick2", makes: "pick-std", qty: 1, tier: 2, group: "Tools", cost: { iron: 4, wood: 2, stone: 2 } },
  { id: "c-chaps", makes: "chaps", qty: 1, tier: 2, group: "Armor", cost: { hide: 3, cloth: 1 } },
  { id: "c-bracers", makes: "bracers", qty: 1, tier: 2, group: "Armor", cost: { hide: 2, cloth: 1 } },
  { id: "c-waxed", makes: "waxed", qty: 1, tier: 2, group: "Armor", cost: { cloth: 4, hide: 2 } },
  { id: "c-steeltrap", makes: "steeltrap", qty: 1, tier: 2, group: "Traps", cost: { iron: 3, junk: 2 } },
  { id: "c-bandage2", makes: "bandage-std", qty: 2, tier: 2, group: "Meds", cost: { cloth: 2, hide: 1 } },
  { id: "c-kit", makes: "kit", qty: 1, tier: 2, group: "Meds", cost: { cloth: 3, iron: 1 } },
  { id: "c-shells2", makes: "shells", qty: 8, tier: 2, group: "Ammo", cost: { iron: 3, junk: 2 } },
  { id: "c-axe3", makes: "hatchet-good", qty: 1, tier: 3, group: "Weapons", cost: { iron: 6, grokclaw: 1, hide: 1 } },
  { id: "c-knife3", makes: "knife-good", qty: 1, tier: 3, group: "Weapons", cost: { iron: 4, grokclaw: 1 } },
  { id: "c-helm", makes: "scraphelm", qty: 1, tier: 3, group: "Armor", cost: { iron: 5, junk: 3, cloth: 1 } },
  { id: "c-plate", makes: "plate", qty: 1, tier: 3, group: "Armor", cost: { iron: 8, junk: 4, hide: 2 } },
  { id: "c-steeltoes", makes: "steeltoes", qty: 1, tier: 3, group: "Armor", cost: { iron: 4, hide: 2 } },
  { id: "c-bomb", makes: "bomb", qty: 1, tier: 3, group: "Traps", cost: { iron: 3, junk: 3, cloth: 1 } },
  { id: "c-medicine", makes: "medicine", qty: 1, tier: 3, group: "Meds", cost: { cloth: 2, grokclaw: 1 } },
];
export const BENCH_UP: Record<number, Cost> = { 1: { wood: 6, iron: 4, junk: 2 }, 2: { stone: 6, iron: 8, junk: 4, grokclaw: 1 } };

/** Where each v14 sprite meets the ground: [x frac, frac up from the bottom]. Art is 2x world px. */
export const ART14 = new Set(["wall-wood", "wall-stone", "wall-metal", "gate-wood", "gate-stone", "gate-metal", "wall-x", "spikes", "chest", "rainbarrel", "sandbags", "sandbags-x", "workbench", "wreck", "firering", "stash", "sign-farm", "lookout", "lookout-x"]);
export const ANCHOR14: Record<string, number> = { wall: .16, gate: .155, "wall-x": .256 };
export const anchorOf = (img: string) => (img.startsWith("wall-x") ? .256 : img.startsWith("wall-") ? .16 : img.startsWith("gate-") ? .155 : .06);
