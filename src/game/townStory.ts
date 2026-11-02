/** v15.13.3: shared town `story.*` save fields (Quest RPG shared/tiein.js, SAVE_KEY maps the Seven to story.m7 keys).
 * leaveTown keeps EVERY story.* key (unknown ones as is) in l1.ts; enterTown echoes them back, with the fields the RPG
 * owns (m7, traits, perks, karma, rep, player) taken from the RPG's own data. Pure: no engine imports, so it is unit-testable. */
export const M7_KEYS = ["back", "eye", "wind", "neighborly", "knowhow", "quick", "fortune"] as const;
/** RPG data.m7 key -> story.m7 key (identical to Quest's SAVE_KEY today; change here if either side renames). */
export const STORY_M7_KEY: Record<(typeof M7_KEYS)[number], string> = { back: "back", eye: "eye", wind: "wind", neighborly: "neighborly", knowhow: "knowhow", quick: "quick", fortune: "fortune" };
/** Display names the towns also accept (lowercased) on the way in. */
const M7_NAMES: Record<string, string> = { back: "might", eye: "vigilance", wind: "vigor", neighborly: "influence", knowhow: "cunning", quick: "nimble", fortune: "fortune" };
/** Every story.* save key Quest's town games write (tiein.js T.outgoing). */
export const STORY_KEYS = ["story.clock", "story.topics", "story.stamina", "story.hunger", "story.rep", "story.karma", "story.m7", "story.traits", "story.perks", "story.party", "story.player", "story.kills", "story.wear"] as const;

const clone = <T>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

/** Copy every story.* key from a leaveTown questFlags into the store (deep copy, any JSON type). */
export function keepStory(store: Record<string, unknown>, qf: unknown): Record<string, unknown> {
  if (qf && typeof qf === "object") for (const [k, v] of Object.entries(qf as Record<string, unknown>)) if (k.startsWith("story.") && v !== undefined && typeof v !== "function") store[k] = clone(v);
  return store;
}
/** story.m7 (save keys, raw keys or display names) -> RPG m7; only valid numbers move, clamped 1-10. */
export function m7FromStory(raw: unknown, into: Record<string, number>): Record<string, number> {
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    for (const k of M7_KEYS) {
      let v = r[STORY_M7_KEY[k]]; if (v === undefined) v = r[k]; if (v === undefined) v = r[M7_NAMES[k]];
      const n = Number(v); if (v !== undefined && v !== null && Number.isFinite(n)) into[k] = Math.max(1, Math.min(10, Math.round(n)));
    }
  }
  return into;
}
export function m7ToStory(m: Record<string, number> | undefined): Record<string, number> {
  const o: Record<string, number> = {}; for (const k of M7_KEYS) o[STORY_M7_KEY[k]] = Number(m?.[k] ?? 5); return o;
}
export interface StoryPlayer { m7?: Record<string, number>; traits2?: string[]; perks?: string[]; karma?: number; rep?: Record<string, number> }
/** Apply the RPG-owned story.* fields from a leaveTown back onto the player. */
export function applyStory(p: StoryPlayer, qf: Record<string, unknown>): void {
  if (qf["story.m7"] && typeof qf["story.m7"] === "object") p.m7 = m7FromStory(qf["story.m7"], { ...(p.m7 ?? {}) });
  if (Array.isArray(qf["story.traits"])) p.traits2 = (qf["story.traits"] as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 2);
  if (Array.isArray(qf["story.perks"])) { const have = new Set(p.perks ?? []); p.perks = [...(p.perks ?? []), ...(qf["story.perks"] as unknown[]).filter((x): x is string => typeof x === "string" && !have.has(x))]; }
  if (typeof qf["story.karma"] === "number" && Number.isFinite(qf["story.karma"])) p.karma = Math.max(-100, Math.min(100, Math.round(qf["story.karma"] as number)));
  const rp = qf["story.rep"];
  if (rp && typeof rp === "object" && !Array.isArray(rp)) { p.rep = { ...(p.rep ?? {}) }; for (const [k, v] of Object.entries(rp)) if (typeof v === "number" && Number.isFinite(v)) p.rep[k] = v; }
}
/** story.* for enterTown: everything kept from the towns, then the RPG-owned fields from the player. */
export function storyOut(store: Record<string, unknown> | undefined, p: StoryPlayer | null | undefined, who: string): Record<string, unknown> {
  const o: Record<string, unknown> = clone({ ...(store ?? {}) });
  if (p) {
    o["story.m7"] = { ...(o["story.m7"] && typeof o["story.m7"] === "object" ? (o["story.m7"] as object) : {}), ...m7ToStory(p.m7) };
    o["story.traits"] = [...(p.traits2 ?? [])]; o["story.perks"] = [...(p.perks ?? [])];
    o["story.karma"] = p.karma ?? 0; o["story.rep"] = { ...(o["story.rep"] && typeof o["story.rep"] === "object" ? (o["story.rep"] as object) : {}), ...(p.rep ?? {}) };
  }
  o["story.player"] = who;
  return o;
}
