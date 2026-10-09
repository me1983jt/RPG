export type SkillId = "rifle" | "melee" | "doctor" | "lock" | "speech" | "barter" | "sneak" | "trail";
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

export const SKILLS: SkillDef[] = [
  { id: "rifle", name: "Rifle", blurb: "Carbines, revolvers, scatterguns." },
  { id: "melee", name: "Melee", blurb: "Axes, knives, picks, iron bars." },
  { id: "doctor", name: "Doctor", blurb: "Bandages and kits do more." },
  { id: "lock", name: "Lockpick", blurb: "Pins, hatches, and stubborn doors." },
  { id: "speech", name: "Speech", blurb: "Talk a person into the hard choice." },
  { id: "barter", name: "Barter", blurb: "Iron goes further at a stall." },
  { id: "sneak", name: "Sneak", blurb: "Hostile eyes pick you up later." },
  { id: "trail", name: "Trail", blurb: "See farther. Pull a little more from a node." },
];

export const PERKS: PerkDef[] = [
  { id: "steady", name: "Steady hands", blurb: "Rifle +15, and a gun hits a little harder.", need: { skill: "rifle", score: 25 } },
  { id: "logger", name: "Logger", blurb: "Melee +15, and close work hits harder.", need: { skill: "melee", score: 25 } },
  { id: "stitch", name: "Field stitch", blurb: "Doctor +15. Wraps heal more.", need: { skill: "doctor", score: 25 } },
  { id: "soft", name: "Soft step", blurb: "Sneak +15.", need: { skill: "sneak", score: 25 } },
  { id: "haggle", name: "Horse trade", blurb: "Barter +15.", need: { skill: "barter", score: 20 } },
  { id: "pins", name: "Sure pins", blurb: "Lockpick +15. Picks slip less.", need: { skill: "lock", score: 25 } },
  { id: "deadeye", name: "Deadeye", blurb: "Called shots to the head land more often.", need: { skill: "rifle", score: 40 } },
  { id: "known", name: "Known face", blurb: "Speech +12. Towns take your word a little further.", need: { skill: "speech", score: 30 } },
  { id: "wool", name: "Thick wool", blurb: "Defense +2." },
  { id: "quick", name: "Quick hands", blurb: "Two more action points in a turn." },
];

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
}

export function clampScore(n: number, lo = -100, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

export function tagsForRole(role: string): SkillId[] {
  if (role === "hunter") return ["rifle", "sneak", "trail"];
  if (role === "medic") return ["doctor", "speech", "barter"];
  if (role === "thief") return ["lock", "sneak", "speech"];
  return ["melee", "trail", "doctor"];
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
  const s = stats;
  let base = 8;
  if (id === "rifle") base = 4 + s.perception * 6 + s.luck * 2;
  else if (id === "melee") base = 8 + s.strength * 6 + s.endurance * 2;
  else if (id === "doctor") base = 4 + s.intellect * 5 + s.vigor * 2;
  else if (id === "lock") base = 4 + s.intellect * 4 + s.perception * 3;
  else if (id === "speech") base = 8 + s.intellect * 5 + s.luck * 2;
  else if (id === "barter") base = 6 + s.intellect * 4 + s.luck * 3;
  else if (id === "sneak") base = 4 + s.perception * 4 + s.luck * 3;
  else base = 8 + s.perception * 3 + s.endurance * 3;
  if (s.trait === "eye" && id === "rifle") base += 12;
  if (s.trait === "eye" && id === "melee") base -= 8;
  if (s.trait === "camp" && id === "melee") base += 12;
  if (s.trait === "camp" && id === "rifle") base -= 8;
  if (s.trait === "step" && (id === "lock" || id === "sneak")) base += 12;
  const put = invested?.[id] ?? 0;
  const tagged = tags?.includes(id);
  let extra = 0;
  const owned = perks ?? [];
  if (id === "rifle" && owned.includes("steady")) extra += 15;
  if (id === "melee" && owned.includes("logger")) extra += 15;
  if (id === "doctor" && owned.includes("stitch")) extra += 15;
  if (id === "sneak" && owned.includes("soft")) extra += 15;
  if (id === "barter" && owned.includes("haggle")) extra += 15;
  if (id === "lock" && owned.includes("pins")) extra += 15;
  if (id === "speech" && owned.includes("known")) extra += 12;
  return clampScore(base + put * (tagged ? 2 : 1) + extra, 0, 120);
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
