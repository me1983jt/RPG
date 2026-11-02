// v15.13.0: "The Seven" core stats (Might, Vigilance, Vigor, Influence, Cunning, Nimble, Fortune), two-sided traits, three tagged skills and Maine perks (every 3 levels).
// Our own names, numbers and text. Pure data and rules here; engine.ts wires them in (search "v1513").

export type M7Id = "back" | "eye" | "wind" | "neighborly" | "knowhow" | "quick" | "fortune";
export type M7 = Record<M7Id, number>;

export const M7_MIN = 1, M7_MAX = 10, M7_START = 5, M7_POOL = 5;

export const M7_STATS: { id: M7Id; name: string; short: string; does: string }[] = [
  // v15.13.1: display names renamed; internal ids (and save keys) unchanged
  { id: "back", name: "Might", short: "MT", does: "Raw strength: carry +5 lb a point, harder swings, a little more health." },
  { id: "eye", name: "Vigilance", short: "VG", does: "Spotting game and trouble: gun aim, sight, who moves first in a fight." },
  { id: "wind", name: "Vigor", short: "VR", does: "Lungs for the long carry: health +2 a point, stamina, shrug off sickness." },
  { id: "neighborly", name: "Influence", short: "IN", does: "Folks listen to you: talk checks, store prices, companions." },
  { id: "knowhow", name: "Cunning", short: "CN", does: "Shop and woods smarts: skill points every level." },
  { id: "quick", name: "Nimble", short: "NB", does: "Light on your feet: action points in a fight, crits, stamina." },
  { id: "fortune", name: "Fortune", short: "FT", does: "The odd lucky break: crits and better finds." },
];

export function freshM7(): M7 {
  return { back: M7_START, eye: M7_START, wind: M7_START, neighborly: M7_START, knowhow: M7_START, quick: M7_START, fortune: M7_START };
}

/** Old saves (pre-v15.13) have no The Seven: every stat 5, which changes nothing. */
export function loadM7(raw: unknown): M7 {
  const out = freshM7();
  if (raw && typeof raw === "object") for (const s of M7_STATS) {
    const v = Number((raw as Record<string, unknown>)[s.id]);
    if (Number.isFinite(v)) out[s.id] = Math.max(M7_MIN, Math.min(M7_MAX, Math.round(v)));
  }
  return out;
}
export const m7Spent = (m: M7) => M7_STATS.reduce((n, s) => n + m[s.id] - M7_START, 0);
export const m7Left = (m: M7) => M7_POOL - m7Spent(m);

/** Folded into the old six stats at creation (they still drive skill scores): 5 = no change, 1 = -2, 10 = +3. */
export function m7Bonus(m: M7) {
  const d = (v: number) => Math.round((v - 5) / 2);
  return { strength: d(m.back), vigor: d(m.wind), endurance: d(m.wind), intellect: d(m.knowhow), perception: d(m.eye), luck: d(m.fortune), agility: d(m.quick) };
}

export type Trait2Id = "armyvet" | "greenthumb" | "milltown" | "downeast" | "wicked" | "heavyhands" | "uptocamp" | "ayuh" | "dooryard" | "mudseason";
export const TRAITS2: { id: Trait2Id; name: string; up: string; down: string }[] = [
  // v15.13.4: the premade heroes' traits (anyone can take them)
  { id: "armyvet", name: "Army Vet", up: "+10% gun aim and +1 action point.", down: "Healing items and rest work 15% slower." },
  { id: "greenthumb", name: "Green Thumb", up: "Herbs, teas and food heal 30% more; +10 Foraging.", down: "-2 melee damage, -5 Melee." },
  { id: "milltown", name: "Mill Town Tough", up: "+15 max health.", down: "-15 max stamina." },
  { id: "downeast", name: "Downeast Thrifty", up: "Store prices 10% better.", down: "Start with no iron, and worse luck on finds." },
  { id: "wicked", name: "Wicked Quick", up: "+1 action point in a fight.", down: "-8 max health." },
  { id: "heavyhands", name: "Heavy Hands", up: "+2 melee damage.", down: "-5% crit chance." },
  { id: "uptocamp", name: "Up to Camp", up: "+10 Trail and Sneak.", down: "-10 Speech and Barter." },
  { id: "ayuh", name: "Ayuh, Stubborn", up: "+2 armor.", down: "One less skill point each level." },
  { id: "dooryard", name: "Dooryard Lookout", up: "+10 Rifle, +3 Sequence.", down: "-10 Doctor." },
  { id: "mudseason", name: "Mud Season Mule", up: "Carry +25 lb.", down: "-2 Sequence and -5 Melee." },
];
export const TRAIT2_MAX = 2;
export function loadTraits2(raw: unknown): Trait2Id[] {
  return Array.isArray(raw) ? [...new Set(raw.filter((x) => TRAITS2.some((t) => t.id === x)))].slice(0, TRAIT2_MAX) as Trait2Id[] : [];
}

export type Perk2Id = "fieldfix" | "farmfriend" | "moosehide" | "woodsman" | "beansupper" | "packmule" | "firstlight" | "wickedgood" | "townmeeting" | "iceout" | "lumberjack" | "blackfly" | "lobsterluck" | "oldcamphand";
export interface Perk2 { id: Perk2Id; name: string; blurb: string; lv: number; need?: Partial<M7> }
export const PERKS2: Perk2[] = [
  // v15.13.4: signature perks, given at the start to Justin and Sarah only (level 99 = never offered on level-up)
  { id: "fieldfix", name: "Field Fix", blurb: "Use the toolkit from the pack to repair worn gear away from the bench.", lv: 99 },
  { id: "farmfriend", name: "Farm Friend", blurb: "Farmers and traders give you 8% better prices.", lv: 99 },
  { id: "moosehide", name: "Moose Hide", blurb: "+3 armor. Your skin's gone thick as a bull moose's.", lv: 3, need: { wind: 5 } },
  { id: "woodsman", name: "Woodsman", blurb: "+15% to hit when you fight in the trees.", lv: 3, need: { eye: 6 } },
  { id: "beansupper", name: "Bean Supper", blurb: "Food, bandages and medicine heal 25% more.", lv: 3, need: { wind: 4 } },
  { id: "packmule", name: "Pack Mule", blurb: "Carry +30 lb.", lv: 3, need: { back: 6 } },
  { id: "firstlight", name: "First Light", blurb: "+4 Sequence: you move first more often.", lv: 3, need: { quick: 6 } },
  { id: "townmeeting", name: "Town Meeting", blurb: "+15 Speech and 5% better prices.", lv: 3, need: { neighborly: 6 } },
  { id: "lumberjack", name: "Lumberjack Swing", blurb: "+3 melee damage.", lv: 3, need: { back: 7 } },
  { id: "wickedgood", name: "Wicked Good Shot", blurb: "+8% crit chance with guns.", lv: 6, need: { eye: 7 } },
  { id: "iceout", name: "Ice-Out", blurb: "+1 action point in a fight.", lv: 6, need: { quick: 7 } },
  { id: "blackfly", name: "Blackfly Bitten", blurb: "+10 max health, sickness 20% less likely.", lv: 6, need: { wind: 6 } },
  { id: "lobsterluck", name: "Lobsterman's Luck", blurb: "Better finds on bodies and in crates; +3% crit.", lv: 6, need: { fortune: 7 } },
  { id: "oldcamphand", name: "Old Camp Hand", blurb: "+2 skill points every level from now on.", lv: 9, need: { knowhow: 6 } },
];
export const perk2Slots = (level: number) => Math.floor(Math.max(0, level) / 3);
export function perk2Ok(p: Perk2, level: number, m: M7): boolean {
  if (level < p.lv) return false;
  for (const [k, v] of Object.entries(p.need ?? {})) if (m[k as M7Id] < (v as number)) return false;
  return true;
}
export function perk2Need(p: Perk2): string {
  return [`Level ${p.lv}`, ...Object.entries(p.need ?? {}).map(([k, v]) => `${M7_STATS.find((s) => s.id === k)!.name} ${v}`)].join(", ");
}

export const TAG_BONUS = 15;

/** Everything the The Seven, traits and perks add, in one place. */
export function fx1513(m: M7, traits: string[], perks: string[]) {
  const t = (id: Trait2Id) => traits.includes(id), p = (id: Perk2Id) => perks.includes(id);
  const skill: Record<string, number> = {};
  const add = (k: string, n: number) => { skill[k] = (skill[k] ?? 0) + n; };
  add("speech", (m.neighborly - 5) * 3); add("barter", (m.neighborly - 5) * 2);
  if (t("uptocamp")) { add("trail", 10); add("sneak", 10); add("speech", -10); add("barter", -10); }
  if (t("dooryard")) { add("rifle", 10); add("doctor", -10); }
  if (t("mudseason")) add("melee", -5);
  if (t("greenthumb")) { add("trail", 10); add("melee", -5); }
  if (p("townmeeting")) add("speech", 15);
  return {
    skill,
    hp: (m.wind - 5) * 2 + (m.back - 5) + (t("milltown") ? 15 : 0) + (t("wicked") ? -8 : 0) + (p("blackfly") ? 10 : 0),
    stamina: (m.wind - 5) * 5 + (m.quick - 5) * 3 + (t("milltown") ? -15 : 0),
    ap: Math.floor((m.quick - 5) / 2) + (t("wicked") ? 1 : 0) + (t("armyvet") ? 1 : 0) + (p("iceout") ? 1 : 0),
    carry: (m.back - 5) * 5 + (t("mudseason") ? 25 : 0) + (p("packmule") ? 30 : 0),
    crit: (m.fortune - 5) * 1 + (m.quick - 5) * 0.5 + (t("heavyhands") ? -5 : 0) + (p("lobsterluck") ? 3 : 0),
    gunCrit: p("wickedgood") ? 8 : 0,
    aim: (m.eye - 5) * 2 + (t("armyvet") ? 10 : 0),
    woods: p("woodsman") ? 15 : 0,
    seq: (m.eye - 5) + (m.quick - 5) + (t("dooryard") ? 3 : 0) + (t("mudseason") ? -2 : 0) + (p("firstlight") ? 4 : 0),
    melee: (t("heavyhands") ? 2 : 0) + (t("greenthumb") ? -2 : 0) + (p("lumberjack") ? 3 : 0) + Math.max(0, Math.floor((m.back - 5) / 2)),
    armor: (t("ayuh") ? 2 : 0) + (p("moosehide") ? 3 : 0),
    barter: (m.neighborly - 5) + (t("downeast") ? 10 : 0) + (p("farmfriend") ? 8 : 0) + (p("townmeeting") ? 5 : 0),
    talk: (m.neighborly - 5) * 2,
    sick: (m.wind - 5) * 0.02 + (p("blackfly") ? 0.2 : 0),
    heal: (p("beansupper") ? 1.25 : 1) * (t("greenthumb") ? 1.3 : 1) * (t("armyvet") ? 0.85 : 1),
    luck: (m.fortune - 5) / 2 + (t("downeast") ? -1 : 0) + (p("lobsterluck") ? 2 : 0),
    skillPts: Math.floor((m.knowhow - 5) / 2) + (t("ayuh") ? -1 : 0) + (p("oldcamphand") ? 2 : 0),
  };
}
