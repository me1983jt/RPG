import { RULES } from "./rules";

/** v15.9: skills, perks, class tags and stat weights come from the shared rules (/workspace/shared-rules/stats.json). */
export const STATS_RULES = RULES as any;
export type SkillId = "rifle" | "melee" | "doctor" | "lock" | "speech" | "barter" | "sneak" | "trail" | "mechanics" | "climbing" | "electronics";
export type PerkId = "steady" | "logger" | "stitch" | "soft" | "haggle" | "pins" | "deadeye" | "wool" | "quick" | "known";
export type TownId = "lowelltown" | "attean" | "holeb" | "ponds";

export interface SkillDef {
  id: SkillId;
  name: string;
  blurb: string;
}

export interface PerkDef {
  id: PerkId;
  name: string;
  blurb: string;
  need?: { skill: SkillId; score: number };
}

export const SKILLS: SkillDef[] = STATS_RULES.skills.list.map((x: any) => ({ id: x.id, name: x.name, blurb: x.blurb }));

export const PERKS: PerkDef[] = STATS_RULES.perks.map((x: any) => ({ id: x.id, name: x.name, blurb: x.blurb, ...(x.need ? { need: x.need } : {}) }));

export const TOWN_NAME: Record<TownId, string> = {
  lowelltown: "Lowelltown",
  attean: "Attean",
  holeb: "Holeb",
  ponds: "Chain of Ponds",
};

const TOWN_OF: Record<string, TownId> = {
  mira: "lowelltown",
  bram: "lowelltown",
  adele: "lowelltown",
  etta: "lowelltown",
  gus: "lowelltown",
  walter: "lowelltown",
  rejean: "lowelltown",
  sera: "attean",
  holt: "attean",
  pete: "attean",
  ruth: "attean",
  emile: "attean",
  cal: "attean",
  ivo: "holeb",
  nora: "holeb",
  paul: "holeb",
  mae: "holeb",
  justin: "ponds",
  sarah: "ponds",
  cyndal: "ponds",
  loki: "ponds",
};

export interface SkillStats {
  strength: number;
  vigor: number;
  endurance: number;
  intellect: number;
  perception: number;
  luck: number;
  trait: string;
  agility?: number;
  grit?: number;
  /** v15.9: trade-skill (learn-by-use) mechanics level, folded into the 0-120 Mechanics score */
  tradeMech?: number;
}

export function clampScore(n: number, lo = -100, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

export function tagsForRole(role: string): SkillId[] {
  const c = STATS_RULES.classes.find((x: any) => x.id === role) ?? STATS_RULES.classes.find((x: any) => x.id === STATS_RULES.classDefault);
  return [...c.tags];
}

export function townOf(role: string): TownId | null {
  return TOWN_OF[role] ?? null;
}

export function skillPointsOnLevel(intellect: number): number {
  return 3 + Math.max(0, intellect);
}

export function perkSlots(level: number): number {
  return Math.floor(Math.max(0, level) / 3);
}

export function skillScore(
  id: SkillId,
  stats: SkillStats,
  invested: Partial<Record<SkillId, number>> | undefined,
  tags: SkillId[] | undefined,
  perks: PerkId[] | undefined,
): number {
  const def = STATS_RULES.skills.list.find((x: any) => x.id === id);
  if (!def) return 0;
  const st: any = { agility: 1, grit: 1, ...stats };
  let base = def.base;
  for (const [k, w] of Object.entries(def.gov as Record<string, number>)) base += (Number(st[k]) || 0) * w;
  base += STATS_RULES.skills.traitMods[stats.trait]?.[id] ?? 0;
  if (def.tradeLvBonus) base += (stats.tradeMech ?? 0) * def.tradeLvBonus;
  const put = invested?.[id] ?? 0;
  const tagged = tags?.includes(id);
  let extra = 0;
  for (const p of perks ?? []) extra += STATS_RULES.perks.find((x: any) => x.id === p)?.bonus?.[id] ?? 0;
  return clampScore(base + put * (tagged ? 2 : 1) + extra, 0, def.max ?? 120);
}

export function checkChance(score: number, dc: number, rep: number, karma: number): number {
  const bonus = Math.round(rep / 4 + karma / 8);
  return clampScore(score - dc + 50 + bonus, 5, 95);
}

export function priceOf(base: number, barter: number, rep: number): number {
  const cut = Math.min(40, Math.floor(barter / 4) + Math.floor(Math.max(0, rep) / 5));
  const hike = rep < 0 ? Math.min(35, Math.floor(-rep / 4)) : 0;
  return Math.max(1, Math.round((base * (100 - cut + hike)) / 100));
}

export function townHostile(rep: number): boolean {
  return rep <= -15;
}

export function crimeShift(role: string): { karma: number; rep: number } {
  if (role === "cyndal" || role === "loki") return { karma: -30, rep: -40 };
  if (role === "villager") return { karma: -6, rep: -10 };
  return { karma: -12, rep: -18 };
}

export function karmaWord(karma: number): string {
  if (karma >= 25) return "Well spoken of";
  if (karma >= 8) return "Known for decent";
  if (karma <= -25) return "A hard name";
  if (karma <= -8) return "Talked about";
  return "No name yet";
}

export function perkOk(perk: PerkDef, score: (id: SkillId) => number): boolean {
  if (!perk.need) return true;
  return score(perk.need.skill) >= perk.need.score;
}
