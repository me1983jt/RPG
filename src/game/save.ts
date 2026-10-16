import type { BagStack, LookId, RoleId, TraitId } from "@/game/gear";
import type { BeastKind, Player, PropKind } from "@/game/types";

/** Slot 1 keeps the original key so older saves land in slot 1. */
export const SAVE_KEY = "maine-rpg-save-v2";
export const SAVE_SLOTS = 3;
const SLOT_KEY = "maine-rpg-slot";
let slot = 1;
try {
  slot = Math.min(SAVE_SLOTS, Math.max(1, Number(localStorage.getItem(SLOT_KEY)) || 1));
} catch {
  /* no storage */
}
function keyOf(n: number): string {
  return n === 1 ? SAVE_KEY : `${SAVE_KEY}-s${n}`;
}
export function getSlot(): number {
  return slot;
}
export function setSlot(n: number): void {
  slot = Math.min(SAVE_SLOTS, Math.max(1, Math.round(n) || 1));
  try {
    localStorage.setItem(SLOT_KEY, String(slot));
  } catch {
    /* private mode */
  }
}
export interface SlotInfo {
  slot: number;
  used: boolean;
  label: string;
}
export function slotInfos(): SlotInfo[] {
  migrateKey();
  const out: SlotInfo[] = [];
  for (let n = 1; n <= SAVE_SLOTS; n++) {
    let label = "Empty";
    let used = false;
    try {
      const raw = localStorage.getItem(keyOf(n));
      if (raw) {
        used = true;
        const d = JSON.parse(raw) as { name?: string; level?: number; role?: string; savedAt?: number };
        const when = d.savedAt ? new Date(d.savedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
        label = `${d.name || "Packer"} · Lv ${d.level ?? 1}${when ? " · " + when : ""}`;
      }
    } catch {
      label = "Unreadable";
    }
    out.push({ slot: n, used, label });
  }
  return out;
}
/** Storage key used by beta v1 and the Grok Build exports; read once and moved to SAVE_KEY. */
const OLD_SAVE_KEY = "tote-road-save-v2";

function migrateKey(): void {
  try {
    if (localStorage.getItem(SAVE_KEY)) return;
    const old = localStorage.getItem(OLD_SAVE_KEY);
    if (!old) return;
    localStorage.setItem(SAVE_KEY, old);
    localStorage.removeItem(OLD_SAVE_KEY);
  } catch {
    /* private mode */
  }
}

export interface SavedRegion {
  id: number;
  explored: string;
  removed: number[];
  slain: number[];
  placed: { kind: PropKind; tx: number; ty: number }[];
  opened?: number[];
  looted?: number[];
  goneNpcs?: number[];
  piles?: SavedPile[];
  bikes?: { id: number; tx: number; ty: number }[];
  scars?: SavedScar[];
}

export interface SavedScar {
  kind: "stump" | "pit";
  x: number;
  y: number;
  side: number;
}

export interface SavedParty {
  role: string;
  name: string;
  hp: number;
  maxHp: number;
  homeMap: number;
  homeId: number;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  dir: number;
}

export interface SavedPile {
  id: number;
  x: number;
  y: number;
  title: string;
  items: { id: string; qty: number }[];
  scrap: number;
  body: BeastKind | "";
  folk: string;
  dir: number;
  at: number;
}

export interface SaveData {
  v: 1;
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
  quest: number;
  questKills: number;
  respawnX: number;
  respawnY: number;
  dir: number;
  role?: RoleId;
  trait?: TraitId | "";
  baseAtk?: number;
  bag?: BagStack[];
  weaponId?: string;
  coatId?: string;
  headId?: string;
  legsId?: string;
  handsId?: string;
  aim?: "head" | "chest" | "arm" | "leg";
  turnBased?: boolean;
  strength?: number;
  vigor?: number;
  endurance?: number;
  intellect?: number;
  perception?: number;
  luck?: number;
  look?: LookId;
  hair?: "black" | "brown" | "gray" | "auburn";
  points?: number;
  opened?: number[];
  looted?: number[];
  removed: number[];
  slain: number[];
  placed: { kind: PropKind; tx: number; ty: number }[];
  explored: string;
  clock?: number;
  piles?: SavedPile[];
  goneNpcs?: number[];
  scars?: SavedScar[];
  seed?: number;
  map?: number;
  exits?: number[];
  questTotal?: number;
  regions?: SavedRegion[];
  tags?: string[];
  invested?: Record<string, number>;
  skillPoints?: number;
  perks?: string[];
  karma?: number;
  rep?: Record<string, number>;
  party?: SavedParty | null;
  partyReturn?: SavedParty | null;
  raidNight?: number;
  warden?: number;
  tractorReady?: boolean;
  snow?: number;
  jackTrust?: number;
  jackMet?: boolean;
  bunkerSeen?: boolean;
  kitchenDay?: number;
}

export function hasSave(): boolean {
  migrateKey();
  try {
    return !!localStorage.getItem(keyOf(slot));
  } catch {
    return false;
  }
}

export function readSave(): SaveData | null {
  migrateKey();
  try {
    const raw = localStorage.getItem(keyOf(slot));
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    if (!data || data.v !== 1 || !Array.isArray(data.removed)) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(keyOf(slot), JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {
    /* storage full or private mode — play continues */
  }
}

export function playerToSave(
  p: Player,
  quest: number,
  questKills: number,
  removed: number[],
  slain: number[],
  placed: SaveData["placed"],
  explored: Uint8Array,
): SaveData {
  return {
    v: 1,
    name: p.name,
    x: p.x,
    y: p.y,
    hp: p.hp,
    maxHp: p.maxHp,
    atk: p.atk,
    def: p.def,
    xp: p.xp,
    level: p.level,
    scrap: p.scrap,
    wood: p.wood,
    stone: p.stone,
    blade: p.blade,
    quest,
    questKills,
    respawnX: p.respawnX,
    respawnY: p.respawnY,
    dir: p.dir,
    role: p.role,
    trait: p.trait,
    baseAtk: p.baseAtk,
    bag: p.bag,
    weaponId: p.weaponId,
    coatId: p.coatId,
    headId: p.headId,
    legsId: p.legsId,
    handsId: p.handsId,
    strength: p.strength,
    vigor: p.vigor,
    endurance: p.endurance,
    intellect: p.intellect,
    perception: p.perception,
    luck: p.luck,
    look: p.look,
    hair: p.hair,
    points: p.points,
    removed,
    slain,
    placed,
    explored: bytesToB64(explored),
  };
}

export function bytesToB64(u: Uint8Array): string {
  let s = "";
  const step = 2000;
  for (let i = 0; i < u.length; i += step) {
    const slice = u.subarray(i, i + step);
    let part = "";
    for (let j = 0; j < slice.length; j++) part += String.fromCharCode(slice[j]!);
    s += part;
  }
  return btoa(s);
}

export function b64ToBytes(b64: string, size: number): Uint8Array {
  const out = new Uint8Array(size);
  try {
    const bin = atob(b64);
    const n = Math.min(size, bin.length);
    for (let i = 0; i < n; i++) out[i] = bin.charCodeAt(i);
  } catch {
    /* ignore corrupt fog */
  }
  return out;
}
