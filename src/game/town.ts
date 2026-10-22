/** v14.3 town layer: a separate HTML/JS town game runs in a full-screen iframe and trades state with us by postMessage.
 * Protocol version 1. See TOWN_PROTOCOL.md in the repo root for the spec handed to the town agent. */
export const TOWN_PROTOCOL = 1;
export const TOWN_SRC: Record<string, string> = { harmony: "/towns/harmony/index.html" };
export interface TownItem { id: string; qty: number }
export interface TownInjuries { blinded: boolean; crippledArm: boolean; crippledLeg: boolean }
export interface TownCompanion { id: "cyndal" | "loki" | "goose"; name: string; withYou: boolean }
export interface TownState {
  inventory: TownItem[];
  hp: number;
  maxHp: number;
  injuries: TownInjuries;
  companions: TownCompanion[];
  questFlags: Record<string, string | number | boolean>;
  day: number;
  time: string;
  extra: Record<string, unknown>;
}
export interface EnterTown { type: "enterTown"; protocol: number; town: string; state: TownState }
export interface LeaveTown { type: "leaveTown"; exit?: string; state?: Partial<TownState> }
export interface StartQuest { type: "startQuest"; id: string; target: string | { q: number; r: number }; label?: string }
export interface TownQuest { id: string; town: string; q: number; r: number; label: string }
/** Our injury ids <-> protocol names. */
export const INJ_MAP: [keyof TownInjuries, "blind" | "arms" | "legs"][] = [["blinded", "blind"], ["crippledArm", "arms"], ["crippledLeg", "legs"]];
export function cleanInventory(raw: unknown, known: (id: string) => boolean): TownItem[] | null {
  if (!Array.isArray(raw)) return null;
  const out = new Map<string, number>();
  for (const it of raw) {
    if (!it || typeof it.id !== "string" || !known(it.id)) continue;
    const n = Math.floor(Number(it.qty));
    if (!(n > 0)) continue;
    out.set(it.id, Math.min(9999, (out.get(it.id) ?? 0) + n));
  }
  return [...out].map(([id, qty]) => ({ id, qty }));
}
