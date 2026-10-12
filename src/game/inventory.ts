// Diablo-style pack: equipment slots around the hero and a backpack grid where items take room.
// Items still live in player.bag (stacks by id); this module only decides sizes, which slot takes
// what, and where each stack sits in the grid. Positions are kept in player.gridPos and rebuilt
// automatically, so old saves (no positions) just get packed on first open.
import { GEAR, armorSlot, type GearDef } from "./gear";

export type EquipSlot = "head" | "body" | "legs" | "feet" | "hands" | "main" | "off" | "back";
export const EQUIP_SLOTS: EquipSlot[] = ["head", "body", "legs", "feet", "hands", "main", "off", "back"];
/** Player field that holds each slot (body/head/legs/hands are the original armor fields). */
export const SLOT_FIELD: Record<EquipSlot, string> = {
  head: "headId",
  body: "coatId",
  legs: "legsId",
  feet: "feetId",
  hands: "handsId",
  main: "weaponId",
  off: "offId",
  back: "backId",
};
export const SLOT_LABEL: Record<EquipSlot, string> = {
  head: "Head",
  body: "Body",
  legs: "Legs",
  feet: "Feet",
  hands: "Hands",
  main: "Weapon",
  off: "Off-hand",
  back: "Back",
};
export const GRID_COLS = 10;
export const GRID_ROWS = 4;

/** Footprint in grid cells: small things 1x1, coats 2x3, rifles 1x4, axes 1x3, and so on. */
export function itemSize(id: string): { w: number; h: number } {
  const g = GEAR[id];
  if (!g) return { w: 1, h: 1 };
  switch (g.family) {
    case "carbine":
    case "scatter":
      return { w: 1, h: 4 };
    case "axe":
    case "pickaxe":
    case "pry":
      return { w: 1, h: 3 };
    case "knife":
    case "revolver":
      return { w: 1, h: 2 };
    case "lockpick":
      return { w: 1, h: 1 };
    default:
      break;
  }
  if (g.kind === "coat") {
    const s = equipSlotOf(g);
    if (s === "body") return { w: 2, h: 3 };
    if (s === "back") return { w: 2, h: 3 };
    return { w: 2, h: 2 };
  }
  if (id === "hide" || id === "pelt") return { w: 2, h: 2 };
  if (id === "stew" || id === "trauma" || id === "kit" || id === "fuel") return { w: 1, h: 2 };
  return { w: 1, h: 1 };
}

/** The equipment slot a wearable goes in (weapons: main hand; knives/revolvers may also go off-hand). */
export function equipSlotOf(g: GearDef | undefined): EquipSlot | null {
  if (!g) return null;
  if (g.kind === "weapon") return "main";
  if (g.kind !== "coat") return null;
  const s = g.slot ?? armorSlot(g);
  if (s === "chest") return "body";
  return (s as EquipSlot) ?? null;
}
export function slotAccepts(slot: EquipSlot, id: string): boolean {
  const g = GEAR[id];
  if (!g) return false;
  if (slot === "main") return g.kind === "weapon";
  if (slot === "off") return g.kind === "weapon" && (g.family === "knife" || g.family === "revolver");
  return equipSlotOf(g) === slot;
}

export interface Placed {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
type Holder = { bag: { id: string; qty: number }[]; gridPos?: Record<string, [number, number]> } & Record<string, unknown>;

/** How many of a stack are worn (so only the rest needs room in the grid). */
export function wornCount(p: Holder, id: string): number {
  let n = 0;
  for (const s of EQUIP_SLOTS) if (p[SLOT_FIELD[s]] === id) n += 1;
  return n;
}
export function gridRows(p: Holder): number {
  return GRID_ROWS + (p.backId === "packframe" ? 2 : 0);
}

/** Place every loose stack: keep saved spots that still fit, then pack the rest top-left first
 * (column by column, like the old game). Stacks that cannot fit spill into extra rows below the
 * grid (overfull) rather than vanishing. */
export function layoutGrid(p: Holder): { items: Placed[]; rows: number; over: number } {
  const rows = gridRows(p);
  const pos = p.gridPos ?? {};
  const loose = p.bag.filter((s) => s.qty > 0 && GEAR[s.id] && s.qty - wornCount(p, s.id) > 0);
  let cap = rows;
  const taken: boolean[][] = [];
  const free = (x: number, y: number, w: number, h: number) => {
    if (x < 0 || y < 0 || x + w > GRID_COLS) return false;
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (taken[yy]?.[xx]) return false;
    return true;
  };
  const take = (x: number, y: number, w: number, h: number) => {
    for (let yy = y; yy < y + h; yy++) {
      taken[yy] = taken[yy] ?? [];
      for (let xx = x; xx < x + w; xx++) taken[yy]![xx] = true;
    }
  };
  const items: Placed[] = [];
  const rest: { id: string; w: number; h: number }[] = [];
  for (const s of loose) {
    const { w, h } = itemSize(s.id);
    const at = pos[s.id];
    if (at && at[1] + h <= rows && free(at[0], at[1], w, h)) {
      take(at[0], at[1], w, h);
      items.push({ id: s.id, x: at[0], y: at[1], w, h });
    } else rest.push({ id: s.id, w, h });
  }
  // big things first so they find room
  rest.sort((a, b) => b.w * b.h - a.w * a.h);
  for (const r of rest) {
    let done = false;
    for (let limit = rows; !done && limit < rows + 40; limit++) {
      for (let x = 0; x <= GRID_COLS - r.w && !done; x++)
        for (let y = 0; y + r.h <= limit && !done; y++)
          if (free(x, y, r.w, r.h)) {
            take(x, y, r.w, r.h);
            items.push({ id: r.id, x, y, w: r.w, h: r.h });
            cap = Math.max(cap, y + r.h);
            done = true;
          }
    }
  }
  const next: Record<string, [number, number]> = {};
  for (const it of items) next[it.id] = [it.x, it.y];
  p.gridPos = next;
  return { items, rows: Math.max(rows, cap), over: Math.max(0, cap - rows) };
}

/** Would a new stack of this item fit in the grid without spilling? */
export function canFit(p: Holder, id: string): boolean {
  const have = p.bag.find((s) => s.id === id && s.qty > 0);
  if (have && have.qty - wornCount(p, id) > 0) return true; // joins a stack already in the grid
  const bag = have ? p.bag.map((s) => (s === have ? { id, qty: s.qty + 1 } : s)) : [...p.bag, { id, qty: 1 }];
  const trial = { ...p, bag, gridPos: { ...(p.gridPos ?? {}) } } as Holder;
  const lay = layoutGrid(trial);
  return lay.over === 0;
}

/** Can this stack move to (x, y) without overlapping anything else? */
export function fitsAt(p: Holder, id: string, x: number, y: number): boolean {
  const { w, h } = itemSize(id);
  if (x < 0 || y < 0 || x + w > GRID_COLS || y + h > gridRows(p)) return false;
  const lay = layoutGrid(p);
  return !lay.items.some((it) => it.id !== id && x < it.x + it.w && it.x < x + w && y < it.y + it.h && it.y < y + h);
}
