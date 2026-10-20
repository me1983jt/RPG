// v13 (0.13.0): core stats, extra skills and perks, weather, moon, needs, sickness, cooking, armor wear,
// bounty board, caravans, town rebuilding, road events, wildlife migration, backstories and the main
// quest line "The Long Winter". Data and pure rules live here; engine.ts wires them in (search "v13").

export type CoreStat = "strength" | "endurance" | "agility" | "perception" | "wits" | "grit";
export const CORE_STATS: { id: CoreStat; name: string; does: string }[] = [
  { id: "strength", name: "Strength", does: "Carry weight +4 lb a point, melee hits harder." },
  { id: "endurance", name: "Endurance", does: "Stamina +16 a point, hunger and thirst drain slower." },
  { id: "agility", name: "Agility", does: "Stamina +6 and crit chance +1.5% a point." },
  { id: "perception", name: "Perception", does: "Sight +1 tile a point, gun accuracy +2%." },
  { id: "wits", name: "Wits", does: "Trader prices -1% a point, dialogue checks +2." },
  { id: "grit", name: "Grit", does: "Health +3 a point, colds and infection 4% less likely." },
];
export type Core = Record<CoreStat, number>;
export function coreEffects(c: Core) {
  return {
    carryLb: 40 + c.strength * 4,
    hpBonus: c.grit * 3,
    staminaBonus: c.agility * 6,
    critPct: 3 + c.agility * 1.5 + c.wits * 0.5,
    accuracyPct: c.perception * 2,
    barterPct: Math.min(15, c.wits),
    talkBonus: c.wits * 2 + Math.floor(c.grit / 2),
    sickResist: Math.min(0.4, c.grit * 0.04),
    drainMul: Math.max(0.6, 1 - c.endurance * 0.05),
  };
}

/** Skills added in v13 (the 9 v11.3 trade skills stay). Lockpicking stays on the old "lock" skill. */
export const NEW_SKILLS = [
  { id: "cooking", name: "Cooking", how: "Cook meals at the farm stove.", perk: "Meals fill 5% more and buffs last longer." },
  { id: "foraging", name: "Foraging", how: "Find greens, berries and mushrooms walking the woods.", perk: "+4% find chance." },
  { id: "fishing", name: "Fishing", how: "Land fish at the lake, river or through the ice.", perk: "The green zone is 2% wider." },
  { id: "survival", name: "Survival", how: "Get through cold nights, storms and black ice.", perk: "Cold and storms bite 5% less." },
  { id: "leadership", name: "Leadership", how: "Lead companions, free prisoners, rebuild towns.", perk: "Companions hit 4% harder and like you a bit quicker." },
  { id: "scavenging", name: "Scavenging", how: "Loot crates, cars and camps.", perk: "+3% chance of an extra find." },
  { id: "tracking", name: "Tracking", how: "Follow tracks and read sign.", perk: "Tracks show 1 tile farther every 2 levels." },
  { id: "firstaid", name: "First Aid", how: "Bandage cuts and set bones in the field.", perk: "Bandages heal 6% more; infection is 5% less likely." },
] as const;

/** Perks every 3 levels (3, 6, 9) for every trade skill. */
export const SKILL_PERKS: Record<string, [string, string, string]> = {
  hunting: ["Steady Breath: first shot on unaware game +25% damage.", "Field Dresser: +1 meat from every animal.", "Woodsman: game spooks 20% later."],
  trapping: ["Wire Hand: snares cost nothing to reset.", "Trapline: +10% catch chance.", "Fur Trade: pelts sell for +1 iron."],
  farming: ["Green Thumb: +1 crop each harvest.", "Root Stock: the cellar never spoils.", "Seed Saver: +1 crop each harvest again."],
  mechanics: ["Tinkerer: bike burns 10% less gas.", "Shade-Tree: repair armor for 1 less iron.", "Gearhead: broken-down cars always give gas."],
  barter: ["Haggler: 5% off.", "Old Friend: traders buy bones and hides for more.", "Silver Tongue: 5% off again."],
  medicine: ["Steady Hands: medicine cures sickness in one dose.", "Herbalist: brew greens into a tonic (cold cure).", "Doc: clinic visits are free."],
  stealth: ["Soft Step: camp raids +10% stealth.", "Shadow: new moon nights hide you twice as well.", "Ghost: a failed camp raid gets one more try."],
  carpentry: ["Square Cut: upgrades 5% cheaper.", "Joiner: town rebuilding 10% cheaper.", "Master Builder: palisade +20 more."],
  marksmanship: ["Sight Picture: +5% accuracy.", "Follow-Through: +5% crit.", "Dead Eye: crits hit x2."],
  cooking: ["Camp Cook: one extra serving per recipe.", "Stew Pot: stew warmth lasts all night.", "Chef: every meal also restores 10 thirst."],
  foraging: ["Berry Picker: +1 find.", "Mushroom Eye: chanterelles turn up.", "Forager: winter forage works too."],
  fishing: ["Patient: +1 fish per day.", "Fly Hand: rare fish twice as likely.", "Ice Man: ice fishing is never slower."],
  survival: ["Thick Skin: colds 20% less likely.", "Sure Foot: black ice can't drop you.", "Hardy: nor'easters don't slow you."],
  leadership: ["Steady Voice: companion loyalty gains +1.", "Captain: companions deal +15% damage.", "Rally: on siege night the towns send 2 more."],
  scavenging: ["Picker: +1 scrap from wrecks.", "Junk Man: a second roll on crates.", "Packrat: carry +10 lb."],
  tracking: ["Sign Reader: see tracks 2 tiles farther.", "Bloodhound: wounded game leaves a trail.", "Pathfinder: road events lean your way."],
  firstaid: ["Clean Cut: bandages stop infection.", "Splint: set a broken bone with wood and a bandage.", "Medic: +25% from every heal."],
};
export function perkCount(lv: number): number {
  return lv >= 9 ? 3 : lv >= 6 ? 2 : lv >= 3 ? 1 : 0;
}

// ---------------- backstories
export type BackstoryId = "veteran" | "mechanic" | "farmer" | "hunter";
export const BACKSTORIES: { id: BackstoryId; name: string; blurb: string; core: Partial<Core>; skills: Record<string, number>; gear: [string, number][] }[] = [
  { id: "veteran", name: "Veteran", blurb: "Came home from the Guard before the lights went. Knows a rifle and a chain of command.", core: { grit: 2, perception: 1 }, skills: { marksmanship: 2, leadership: 1, firstaid: 1 }, gear: [["carbine-std", 1], ["shells", 6], ["bandage-std", 1]] },
  { id: "mechanic", name: "Mechanic", blurb: "Ran the garage on Route 201. Can make a dead engine cough.", core: { wits: 2, agility: 1 }, skills: { mechanics: 2, scavenging: 1, carpentry: 1 }, gear: [["gas", 2], ["wire", 2]] },
  { id: "farmer", name: "Farmer", blurb: "Grew potatoes and kept hens on a back lot in Jackman. Patient as the frost.", core: { endurance: 2, grit: 1 }, skills: { farming: 2, cooking: 1, foraging: 1 }, gear: [["apple", 4], ["greens", 2], ["water", 2]] },
  { id: "hunter", name: "Woods guide", blurb: "Guided deer hunters out of Moose River every November. Reads sign like print.", core: { perception: 1, agility: 2 }, skills: { hunting: 2, tracking: 1, trapping: 1 }, gear: [["snare", 2], ["meat", 2], ["hide", 1]] },
];

// ---------------- weather and moon
export type WeatherId = "clear" | "snow" | "noreaster" | "fog" | "blackice" | "rain";
export const WEATHER: Record<WeatherId, { name: string; sight: number; speed: number; bike: number; cold: number; text: string }> = {
  clear: { name: "Clear", sight: 1, speed: 1, bike: 1, cold: 0, text: "Clear and still." },
  snow: { name: "Snow", sight: 0.85, speed: 0.92, bike: 0.85, cold: 1, text: "Snow coming down steady." },
  noreaster: { name: "Nor'easter", sight: 0.55, speed: 0.7, bike: 0, cold: 3, text: "A nor'easter. Wind off the coast, snow sideways. No bike in this." },
  fog: { name: "Fog", sight: 0.5, speed: 1, bike: 0.8, cold: 0, text: "Fog in off the river. You can't see the barn from the porch." },
  blackice: { name: "Black ice", sight: 1, speed: 0.85, bike: 0.55, cold: 1, text: "Black ice on every road. Walk careful. The bike slides." },
  rain: { name: "Rain", sight: 0.8, speed: 0.95, bike: 0.9, cold: 1, text: "Cold rain." },
};
/** Daily weather by season (0 spring, 1 summer, 2 fall, 3 winter) from a 0..1 roll. */
export function rollWeather(season: number, r: number): WeatherId {
  const table: [WeatherId, number][][] = [
    [["clear", 0.45], ["rain", 0.3], ["fog", 0.2], ["snow", 0.05]],
    [["clear", 0.7], ["rain", 0.2], ["fog", 0.1]],
    [["clear", 0.45], ["rain", 0.25], ["fog", 0.15], ["blackice", 0.08], ["snow", 0.07]],
    [["clear", 0.3], ["snow", 0.32], ["noreaster", 0.15], ["blackice", 0.15], ["fog", 0.08]],
  ];
  let acc = 0;
  for (const [id, p] of table[season] ?? table[0]) { acc += p; if (r < acc) return id; }
  return "clear";
}
export const MOON_DAYS = 8;
export const MOON_NAMES = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
export function moonPhase(day: number): number {
  return ((day % MOON_DAYS) + MOON_DAYS) % MOON_DAYS;
}
/** Night-darkness multiplier and raider boldness for a moon phase. */
export function moonEffect(phase: number) {
  if (phase === 4) return { dark: 0.62, bold: 1.25, waves: 1, stealth: -15 };
  if (phase === 0) return { dark: 1.12, bold: 0.9, waves: 0, stealth: 15 };
  if (phase === 3 || phase === 5) return { dark: 0.82, bold: 1.1, waves: 0, stealth: -5 };
  return { dark: 1, bold: 1, waves: 0, stealth: 0 };
}

// ---------------- needs
export const NEED_RATE = { normal: { hunger: 2.2, thirst: 2.6, sleep: 2.4, hurt: 0.5 }, hard: { hunger: 4, thirst: 5.5, sleep: 3.6, hurt: 1.5 } };
export const FOOD_VALUE: Record<string, { hunger?: number; thirst?: number; sleep?: number }> = {
  meat: { hunger: 18 }, apple: { hunger: 10, thirst: 4 }, smokedfish: { hunger: 22 }, jerky: { hunger: 20 }, greens: { hunger: 8, thirst: 3 }, water: { thirst: 45 },
  stew: { hunger: 55, thirst: 15 }, chowder: { hunger: 50, thirst: 20 }, pie: { hunger: 40 }, coffee: { thirst: 15, sleep: 30 }, tonic: { thirst: 20 }, venisonsteak: { hunger: 45 }, mushrooms: { hunger: 9 }, berries: { hunger: 7, thirst: 4 },
  // v14.1 balance: Sarah's kitchen, modest food plus a small stamina lift (engine.ts v13Use)
  cider: { hunger: 6, thirst: 20 }, donut: { hunger: 14 },
};

// ---------------- cooking
export type BuffId = "warm" | "strong" | "steady" | "awake" | "cheer";
export const RECIPES13: { id: string; name: string; need: [string, number][]; makes: string; buff?: BuffId; hours: number; text: string }[] = [
  { id: "stew", name: "Venison stew", need: [["meat", 2], ["greens", 1]], makes: "stew", buff: "warm", hours: 10, text: "Warm: the cold can't bite and you don't catch a chill." },
  { id: "chowder", name: "Fish chowder", need: [["smokedfish", 1], ["apple", 1], ["water", 1]], makes: "chowder", buff: "steady", hours: 8, text: "Steady: stamina comes back 50% faster." },
  { id: "steak", name: "Venison steak", need: [["meat", 3]], makes: "venisonsteak", buff: "strong", hours: 6, text: "Strong: +2 attack." },
  { id: "pie", name: "Apple pie", need: [["apple", 3], ["greens", 1]], makes: "pie", buff: "cheer", hours: 12, text: "Cheer: companions' loyalty +3 when you share it." },
  { id: "coffee", name: "Chicory coffee", need: [["greens", 1], ["water", 1]], makes: "coffee", buff: "awake", hours: 8, text: "Awake: sleep drains half as fast." },
  { id: "tonic", name: "Spruce tonic", need: [["greens", 2], ["water", 1]], makes: "tonic", hours: 0, text: "Cures a cold." },
];

// ---------------- sickness and injuries
export type AilId = "cold" | "bone" | "cut";
export const AILMENTS: Record<AilId, { name: string; text: string; cure: string; speed: number; stamina: number; hpDay: number }> = {
  cold: { name: "Winter cold", text: "Stuffed up and shivering.", cure: "Medicine, spruce tonic, or three days warm.", speed: 0.92, stamina: 0.6, hpDay: 0 },
  bone: { name: "Broken bone", text: "A cracked shin. Every step hurts.", cure: "A splint (bandage + wood) or the Harmony clinic.", speed: 0.7, stamina: 0.8, hpDay: 0 },
  cut: { name: "Infected cut", text: "Red, hot and swelling.", cure: "Medicine or the Harmony clinic.", speed: 1, stamina: 0.9, hpDay: 4 },
};

// ---------------- armor durability, dye, sets
export const DURA_MAX = 100;
export const DYES: { id: string; name: string; hex: string; need: [string, number] }[] = [
  { id: "red", name: "Barn red", hex: "#b04a3a", need: ["berries", 2] },
  { id: "blaze", name: "Blaze orange", hex: "#e08a3a", need: ["greens", 2] },
  { id: "spruce", name: "Spruce green", hex: "#5e8a5e", need: ["greens", 1] },
  { id: "navy", name: "Navy", hex: "#5a6a9a", need: ["berries", 1] },
  { id: "soot", name: "Soot black", hex: "#5a5a5a", need: ["bone", 1] },
];
export const SET_BONUS: Record<string, { name: string; def: number; text: string }> = {
  poor: { name: "Homespun set", def: 1, text: "+1 armor, and the cold bites 10% less." },
  standard: { name: "Woodsman's set", def: 2, text: "+2 armor, +5% speed." },
  good: { name: "Ironside set", def: 4, text: "+4 armor." },
  rare: { name: "Bunker set", def: 6, text: "+6 armor." },
};

// ---------------- loyalty
export const COMPANIONS = ["justin", "sarah", "jack", "mira", "marcel"] as const;
export type CompanionId = (typeof COMPANIONS)[number];
export const COMPANION_NAME: Record<CompanionId, string> = { justin: "Justin", sarah: "Sarah", jack: "Jack Ready", mira: "Mira", marcel: "Marcel" };
/** Loyalty change for a choice: who likes it, who doesn't. */
export const LOYALTY_FX: Record<string, Partial<Record<CompanionId, number>>> = {
  "rob-caravan": { justin: -12, sarah: -15, jack: 4, mira: -10, marcel: -20 },
  "guard-caravan": { justin: 6, sarah: 4, marcel: 10, mira: 3 },
  "free-prisoners": { justin: 8, sarah: 10, mira: 8, jack: 3, marcel: 4 },
  "rebuild": { sarah: 6, mira: 8, marcel: 5, justin: 3 },
  "bounty": { marcel: 4, jack: 2 },
  "lost-kid": { sarah: 8, mira: 5, justin: 4 },
  "deal-collector": { justin: -25, sarah: -30, mira: -25, jack: -10, marcel: 10 },
  "unite": { justin: 10, sarah: 10, mira: 12, jack: 6, marcel: 8 },
  "alone": { jack: 10, justin: -5, sarah: -5, mira: -10 },
  "trade-jack": { jack: 6 },
  "stranger-help": { sarah: 4, mira: 4 },
  "stranger-rob": { sarah: -10, justin: -8, mira: -8, jack: 2 },
};
export const LOYALTY_LEAVE = -40;
export const LOYALTY_HELP = 50;

// ---------------- bounty board
export type BountyKind = "raiders" | "deer" | "coyote" | "deliver";
export const BOUNTY_POOL: { kind: BountyKind; text: string; n: [number, number]; item?: string; pay: number }[] = [
  { kind: "raiders", text: "Thin out the raiders on the roads", n: [2, 4], pay: 4 },
  { kind: "deer", text: "Bring down deer for the Skowhegan smokehouse", n: [1, 2], pay: 5 },
  { kind: "coyote", text: "Coyotes are at the hens. Shoot some", n: [2, 3], pay: 4 },
  { kind: "deliver", text: "Hides wanted for winter coats", n: [2, 3], item: "hide", pay: 3 },
  { kind: "deliver", text: "Meat for the hospital kitchen", n: [2, 3], item: "meat", pay: 3 },
];
export function makeBounties(day: number): { id: string; kind: BountyKind; text: string; need: number; item?: string; pay: number; got: number; day: number }[] {
  const out = [];
  for (let i = 0; i < 3; i++) {
    const b = BOUNTY_POOL[(day * 7 + i * 3) % BOUNTY_POOL.length];
    const need = b.n[0] + ((day + i) % (b.n[1] - b.n[0] + 1));
    out.push({ id: `b${day}-${i}`, kind: b.kind, text: b.text, need, item: b.item, pay: b.pay * need, got: 0, day });
  }
  return out;
}

// ---------------- caravans
export const CARAVAN_ROUTES = [
  { id: "lowell-skow", from: "Lowelltown", to: "Skowhegan", every: 2, start: 9, end: 15, cargo: [["shells", 6], ["medicine", 1], ["jerky", 3]] as [string, number][] },
  { id: "skow-bangor", from: "Skowhegan", to: "Bangor", every: 3, start: 10, end: 16, cargo: [["gas", 2], ["bandage-std", 2], ["apple", 4]] as [string, number][] },
];
export function caravanOnRoad(day: number, hour: number) {
  return CARAVAN_ROUTES.find((r) => day % r.every === 0 && hour >= r.start && hour < r.end) ?? null;
}

// ---------------- town rebuilding (Harmony)
export const REBUILD: { id: "store" | "school" | "clinic"; name: string; cost: { wood: number; stone: number; iron: number; need?: [string, number][] }; effect: string }[] = [
  { id: "store", name: "Harmony store", cost: { wood: 20, stone: 6, iron: 12 }, effect: "Opens a trader in Harmony: 10% off, buys bones and hides." },
  { id: "school", name: "Harmony school", cost: { wood: 24, stone: 10, iron: 6 }, effect: "Cyndal and Loki get lessons: +10% XP from everything." },
  { id: "clinic", name: "Harmony clinic", cost: { wood: 16, stone: 12, iron: 10, need: [["medicine", 2]] }, effect: "Cures colds, bones and cuts for 4 iron. Heals you full." },
];

// ---------------- road events
export type RoadEventId = "car" | "stranger" | "ambush" | "lostkid";
export const ROAD_EVENTS: { id: RoadEventId; title: string; text: string }[] = [
  { id: "car", title: "Broken-down car", text: "An old Pemberton nosed into the snowbank, hood up. Nobody around, and no tracks." },
  { id: "stranger", title: "A stranger", text: "A man in a torn parka stands in the road with his hands where you can see them. \"Just passin' through. Got anything to swap?\"" },
  { id: "ambush", title: "Ambush", text: "A tree down across the road. Too neat. Then the shouting starts." },
  { id: "lostkid", title: "A lost kid", text: "A boy, maybe eight, sitting on a guardrail. \"I got turned around. We live out past the Forks.\"" },
];
export function pickRoadEvent(r: number): RoadEventId {
  return r < 0.3 ? "car" : r < 0.55 ? "stranger" : r < 0.82 ? "ambush" : "lostkid";
}

// ---------------- wildlife migration
/** Animal counts to keep on a map by season: home woods (0) and north woods (1). */
export const MIGRATION: Record<number, Record<number, Partial<Record<"deer" | "moose" | "coyote" | "rabbit" | "wolf", number>>>> = {
  0: { 0: { rabbit: 4, deer: 2 }, 1: { deer: 3, rabbit: 3 }, 2: { deer: 4, moose: 1 }, 3: { coyote: 3, deer: 1 } },
  1: { 0: { moose: 2, deer: 2 }, 1: { moose: 2, deer: 2 }, 2: { moose: 3, deer: 3 }, 3: { deer: 5, wolf: 3 } },
  2: { 0: { rabbit: 2 }, 1: { rabbit: 2 }, 2: { deer: 2 }, 3: { coyote: 2 } },
};
export const MIGRATION_TEXT = [
  "Spring: rabbits everywhere, and the deer move back down to the fields.",
  "Summer: deer browse the edges at dusk.",
  "Fall: the rut. Moose come down to the bogs, and deer are thick in the hardwoods.",
  "Winter: deer yard up in the cedar swamps up north. Coyotes come in close to the farms.",
];

// ---------------- fast travel
export const TOWNS13: { id: string; name: string; map: number; tx: number; ty: number }[] = [
  { id: "farm", name: "Cambridge Road farm", map: 0, tx: 0, ty: 0 },
  { id: "lowell", name: "Lowelltown", map: 0, tx: 30, ty: 60 },
  { id: "jack", name: "Jack Ready's stand", map: 0, tx: 80, ty: 40 },
  { id: "skow", name: "Skowhegan", map: 2, tx: 0, ty: 0 },
];
export function travelGas(a: { map: number; tx: number; ty: number }, b: { map: number; tx: number; ty: number }): number {
  if (a.map !== b.map) return 2;
  return Math.max(1, Math.round(Math.hypot(a.tx - b.tx, a.ty - b.ty) / 40));
}

// ---------------- main quest: The Long Winter
export type MainEnding = "union" | "deal" | "alone" | "fallen";
export const MAIN_ACTS: { n: number; title: string; goal: string; intro: [string, string]; done: string }[] = [
  { n: 1, title: "Cambridge Road", goal: "Fix up the farm with Justin and Sarah, and survive the first raid night.", intro: ["Sarah", "\"You'll do. Justin's splitting wood out back. We need the place tight before the snow, and they'll come at night. They always do.\""], done: "The farm held. Sarah puts the kettle on like it was any other morning." },
  { n: 2, title: "The Signal", goal: "Get Cyndal's radio working and listen to what's out there.", intro: ["Cyndal", "\"There's something on 147.3. Same voice every hour. Augusta. Fuel, medicine, order. Come and listen.\""], done: "The voice loops: \"Augusta has fuel. Augusta has medicine. Augusta has order. Come south.\" Justin doesn't like it." },
  { n: 3, title: "Jack Ready's Bunker", goal: "Earn Jack Ready's trust (loyalty 30) for his old survey maps.", intro: ["Jack Ready", "\"Maps cost trust, and trust costs time. Trade with me. Do me a favor or two. Then we'll talk.\""], done: "Jack unrolls the survey maps. \"That broadcast? It's a trap. Nobody's come back up the Kennebec who answered it.\"" },
  { n: 4, title: "The Kennebec", goal: "Cross the Kennebec to Skowhegan and talk to Marcel.", intro: ["Justin", "\"If you want answers, Marcel's in Skowhegan. Bridge is the only way across, and somebody's always watching it.\""], done: "Marcel lowers his voice. \"Caravans that answer that signal don't come back. Not one. The Collector takes them.\"" },
  { n: 5, title: "The Collector", goal: "Raid the Collector's camps at night and take down his lieutenants (3).", intro: ["Marcel", "\"The raiders answer to a man they call the Collector. He's got lieutenants at camps up and down the river. Hit them at night.\""], done: "The last lieutenant talks before he dies: the supply depot is north, past the Holeb woods. Past the Grok." },
  { n: 6, title: "The Grok's Woods", goal: "Go north through the Grok's territory and find the Collector's supply depot.", intro: ["Justin", "\"Only safe road north runs through the Grok's woods. Safe. That's a joke. Take shells.\""], done: "The depot: barrels of fuel, crates of medicine, and a ledger of every caravan he ever took." },
  { n: 7, title: "Choices", goal: "Decide: unite the towns, make a deal with the Collector, or go it alone.", intro: ["Sarah", "\"He'll come for the farm now. We can bring the towns in with us, or try his terms, or bar the door and hold on ourselves. Your call.\""], done: "It's decided. Winter's coming down hard, and so is he." },
  { n: 8, title: "Siege of Harmony", goal: "Hold the farm through the Collector's winter assault and bring him down.", intro: ["Justin", "\"Lanterns on the road. A wicked lot of them. This is it.\""], done: "The Collector is down in the snow by the woodpile. His army breaks for the road." },
  { n: 9, title: "The Long Winter", goal: "See how it ends.", intro: ["Sarah", "\"Spring comes eventually. Even here.\""], done: "The end." },
];
export const ENDINGS: Record<MainEnding, { title: string; slides: string[] }> = {
  union: { title: "The Valley Holds", slides: ["Lowelltown, Skowhegan and the Cambridge Road farm stood together, and the Collector's army broke on them.", "By spring the Harmony store had bread on the shelves again.", "Every year on the first snow the towns light lanterns on the road, so nobody forgets who came."] },
  deal: { title: "The Collector's Peace", slides: ["You paid his toll, and he left the farm alone.", "Others weren't so lucky. The broadcast still runs, and caravans still go south.", "The farm is quiet. Some nights you hear the radio and turn it off."] },
  alone: { title: "Alone on Cambridge Road", slides: ["You held the farm with what you had. No one came, and you asked no one.", "The towns rebuilt slow, each on its own.", "The farm is a fortress now. It's warm inside. It's lonely."] },
  fallen: { title: "The Long Dark", slides: ["The farm fell in the deep of winter.", "Some got out over the ridge to Jackman. Not all.", "The broadcast still loops: \"Augusta has order.\""] },
};
/** Ending from the act 7 choice, how the siege went, who's alive and how many towns were rebuilt. */
export function pickEnding(choice: "unite" | "deal" | "alone" | "", sieged: boolean, won: boolean, alive: number, rebuilt: number): MainEnding {
  if (choice === "deal") return "deal";
  if (!won || alive < 2) return "fallen";
  if (choice === "unite") return "union";
  void sieged; void rebuilt;
  return "alone";
}

// ---------------- v13.2: more to say about each act (Talk > "What do you make of it?") and journal notes
type Who = "justin" | "sarah" | "cyndal" | "loki" | "cal" | "marcel" | "mira";
export const MAIN_TALK: Record<number, Partial<Record<Who, string>>> = {
  1: {
    justin: "\"Stack the wood on the north side, it's a windbreak and it's dry. They come at night with torches. They want the hens and the stove more than they want us. Make it cost 'em.\"",
    cyndal: "\"Dad says the first raid's the worst one, because you don't know what it sounds like yet. I'm keeping Loki in the root cellar.\"",
    loki: "\"Can Biscuit sleep inside? He's scared of the dark.\" He is not asking about the dog.",
  },
  2: {
    sarah: "\"Calm voice. Too calm. Folks on the radio these days sound tired. That one sounds like he's reading a grocery list.\"",
    justin: "\"Augusta's ninety miles. Nobody walks ninety miles on a promise. Not this winter.\"",
    loki: "\"Cyndal let me hold the antenna. I'm the antenna now.\"",
  },
  3: {
    justin: "\"Jack Ready's been up that ridge since before the lights went. He trusts that dog more than people. Trade fair and don't push.\"",
    sarah: "\"Bring him something he can't make himself. Pie works on most men. Not Jack, but most men.\"",
    cal: "\"I had a cousin went south on a radio promise in '09. Different radio, same promise.\"",
  },
  4: {
    justin: "\"The bridge in Skowhegan's the only crossing left with the ice like this. Somebody's always watching a bridge.\"",
    mira: "\"Marcel knows every sled that comes up the river. If something's taking caravans, he's counted them.\"",
    sarah: "\"Bring back coffee if Marcel's got any. Real coffee. I'll owe you.\"",
  },
  5: {
    marcel: "\"Three camps. Gravel pit east of your place, the Holeb cut, and behind the mill here. Hit them on a dark night. A full moon'll get you shot.\"",
    justin: "\"No sense fighting the whole camp. Get in, cut the ropes, find the man in charge. Cold, I know. So's he.\"",
    mira: "\"The folks they're holding are from the Forks. If you get them out, send them to Harmony. We'll find room.\"",
    cyndal: "\"I can hear them on the radio at night. They talk about 'the Collector' like he's the weather.\"",
  },
  6: {
    sarah: "\"You're going past the Grok. I've heard it at night from the porch. Don't you get brave out there.\"",
    cal: "\"Grok's territory starts at the second beaver flowage. Walk the ridge, not the bottom. It hunts the bottom.\"",
    marcel: "\"If that depot's got fuel, half the valley could run a generator till spring. Think on that before you burn it.\"",
  },
  7: {
    justin: "\"I won't tell you what to do. I'll tell you I've never seen a deal with a man like that end with both sides standing.\"",
    mira: "\"Harmony will stand with you, if you've stood with Harmony. Fix the store, help the clinic. People remember.\"",
    marcel: "\"A deal keeps my store open. I won't lie to you about that. I won't like myself for it either.\"",
    cal: "\"Alone's how I've done it fourteen years. Ayuh. Works fine right up till it don't.\"",
  },
  8: {
    sarah: "\"Kids are in the root cellar with Biscuit and a lamp. Whatever happens up here, they're not coming out till it's quiet.\"",
    cyndal: "\"I'm calling the towns on the radio every ten minutes. If anyone's coming, they'll know where.\"",
    mira: "\"Lanterns on the Lowelltown road. Ours, I think. I hope.\"",
  },
};
export const MAIN_JOURNAL: Record<number, string[]> = {
  1: ["Justin and Sarah took me in at the Cambridge Road farm. Wood, walls, and a long first night."],
  2: ["Cyndal's radio picked up a broadcast from Augusta: fuel, medicine, order. Same words every hour."],
  3: ["Jack Ready has old survey maps of the river. He'll share them when he trusts me."],
  4: ["Jack thinks the broadcast is bait. Marcel in Skowhegan counts the sleds on the river. Go ask him."],
  5: ["The raiders answer to the Collector. He keeps three lieutenants at camps along the river.", "Best on a dark night. Fog helps. A full moon doesn't."],
  6: ["The last lieutenant pointed north, past the Holeb woods: a supply depot. The road runs through the Grok's ground."],
  7: ["The depot ledger lists every caravan he took. He'll come for the farm next. Unite the towns, take his deal, or hold alone."],
  8: ["The Collector is coming down the road with everything he's got. Hold the farm. Bring him down."],
  9: ["It's over, one way or the other."],
};
