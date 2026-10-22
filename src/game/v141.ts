/** v14.1: loot runs, the horde, stealth, farm production, pack growth, hard-mode pack drop, storage. Data and pure helpers; engine.ts runs it. */
import type { BagStack } from "./gear";

/** The horde's name lives here and nowhere else. Change it once and every line in the game follows. */
export const HOLLOWED = "Hollowed";

export interface LootRun { id: string; name: string; q: number; r: number; days: number; blurb: string;
  /** loot by depth: [near the road, partway in, the back room] */
  tiers: [string, number][][] }
export const LOOT_RUNS: LootRun[] = [
  { id: "gas", name: "The Ervin Fuel station", q: 9, r: 6, days: 3, blurb: "Pumps, a store and a locked back office.",
    tiers: [[["junk", 2], ["water", 1], ["cloth", 1]], [["donut", 2], ["junk", 2], ["fuel", 1], ["bandage", 1]], [["medicine", 1], ["shells", 6], ["kit", 1], ["medkit", 1]]] },
  { id: "camp", name: "The hunting camp", q: 1, r: 2, days: 4, blurb: "A tar-paper camp and a meat shed.",
    tiers: [[["cloth", 2], ["matches", 1]], [["jerky", 2], ["hide", 2], ["snare", 1]], [["shells", 8], ["binoculars", 1], ["steeltrap", 1]]] },
  { id: "truck", name: "The jackknifed box truck", q: 6, r: 3, days: 5, blurb: "Jackknifed on Route 27, back door chained.",
    tiers: [[["junk", 3], ["cloth", 2]], [["junk", 3], ["wire", 1], ["water", 2]], [["backpack", 1], ["medicine", 1], ["shells", 6], ["medkit", 1]]] },
];
export const lootRunAt = (q: number, r: number) => LOOT_RUNS.find((l) => l.q === q && l.r === r) ?? null;
/** Days left before a spot restocks (0 = ready). */
export function restockLeft(run: LootRun, lastDay: number | undefined, today: number): number {
  if (lastDay == null) return 0;
  return Math.max(0, run.days - (today - lastDay));
}

/** Noise, 0-100. What each action makes; the meter eases toward it. */
export const NOISE = { still: 0, crouch: 8, walk: 30, bike: 85, chop: 55, melee: 45, gun: 100 } as const;
/** How far (world px) a noise carries. */
export const noiseReach = (n: number) => n * 10;
/** Sneak attack: crouched, on something that hasn't noticed you. */
export const SNEAK_MULT = 2.5;
/** Crouching walks at this fraction of normal speed, and things see you from this fraction as far. */
export const CROUCH_SPEED = .5, CROUCH_SIGHT = .55;

/** Farm production buildings (placed from Build). per = game hours per batch. */
export interface Prod { kind: string; name: string; per: number; makes: string; qty: number; needs?: [string, number][]; cap: number; blurb: string }
export const PROD: Prod[] = [
  { kind: "garden", name: "Garden bed", per: 24, makes: "greens", qty: 2, cap: 6, blurb: "Kale and potatoes. Grows faster with a rain collector near it." },
  { kind: "smokehouse", name: "Smokehouse", per: 6, makes: "jerky", qty: 1, needs: [["meat", 1]], cap: 8, blurb: "Load raw meat; it comes out jerky. Burns a little wood." },
  { kind: "raincollector", name: "Rain collector", per: 12, makes: "water", qty: 1, cap: 6, blurb: "Makes water: a tarp funnel over two drums, 1 jug every 12 hours, twice as quick in rain or snow. A rain barrel nearby stores what it makes." },
  { kind: "still", name: "Still", per: 10, makes: "spirits", qty: 1, needs: [["water", 1], ["apple", 1]], cap: 4, blurb: "Water and windfalls into strong spirits. Cleans a wound." },
];
export const prodOf = (kind: string) => PROD.find((p) => p.kind === kind) ?? null;

/** Pack growth. New games start two rows short; each crafted bag adds a row (max 3). */
export const START_SHORT = 2;
export const BAGS: Record<string, number> = { "bag-sack": 1, "bag-hide": 2, "bag-frame": 3 };

/** Chest quick-sort: by kind, then name. */
const ORDER = ["weapon", "coat", "supply"];
export function sortStacks(items: BagStack[], gear: Record<string, { kind: string; name: string }>): BagStack[] {
  const merged = new Map<string, number>();
  for (const s of items) if (s.qty > 0) merged.set(s.id, (merged.get(s.id) ?? 0) + s.qty);
  return [...merged].map(([id, qty]) => ({ id, qty })).sort((a, b) => {
    const ga = gear[a.id], gb = gear[b.id];
    return (ORDER.indexOf(ga?.kind ?? "supply") - ORDER.indexOf(gb?.kind ?? "supply")) || (ga?.name ?? a.id).localeCompare(gb?.name ?? b.id);
  });
}
/** Quick-stack: move every pack stack the store already holds. Returns [newPack, newStore, moved]. */
export function quickStack(pack: BagStack[], store: BagStack[], keep: (id: string) => number): [BagStack[], BagStack[], number] {
  const have = new Set(store.map((s) => s.id));
  let moved = 0;
  const outStore = store.map((s) => ({ ...s }));
  const outPack: BagStack[] = [];
  for (const s of pack) {
    const free = s.qty - keep(s.id);
    if (have.has(s.id) && free > 0) {
      outStore.find((x) => x.id === s.id)!.qty += free; moved += free;
      if (s.qty - free > 0) outPack.push({ id: s.id, qty: s.qty - free });
    } else outPack.push({ ...s });
  }
  return [outPack, outStore, moved];
}

export interface V141State {
  crouch: boolean;
  noise: number;
  loot: Record<string, number>;
  chests: Record<string, BagStack[]>;
  prod: Record<string, { t: number; n: number; load: number }>;
  drop: { map: number; x: number; y: number; day: number } | null;
  stick: boolean;
  auto: boolean;
  /** loot-run side quests: stage per run, plus flags */
  sq: Record<string, number>;
  playT?: number;
  sqf: Record<string, boolean>;
  /** v14.3 town layer: town-owned quest flags, each town's own stats/score, town quests on the world map */
  tf?: Record<string, string | number | boolean>;
  tx?: Record<string, Record<string, unknown>>;
  tq?: { id: string; town: string; q: number; r: number; label: string }[];
  tapplied?: Record<string, number | boolean>;
}
export function freshV141(): V141State {
  return { crouch: false, noise: 0, loot: {}, chests: {}, prod: {}, drop: null, stick: false, auto: false, sq: {}, sqf: {} };
}
export function loadV141(raw: Partial<V141State> | undefined): V141State {
  return { ...freshV141(), ...(raw ?? {}), chests: raw?.chests ?? {}, prod: raw?.prod ?? {}, loot: raw?.loot ?? {}, sq: raw?.sq ?? {}, sqf: raw?.sqf ?? {}, tf: raw?.tf ?? {}, tx: raw?.tx ?? {}, tq: raw?.tq ?? [] };
}

/** Loot-run lore from the writers' handoff (gb-handoff/lootruns.md): descriptions, notes found in each room, and the side quest NPCs. */
export interface Note { title: string; text: string }
export const LOOT_LORE: Record<string, { desc: string; notes: Note[]; npc: { role: string; name: string }[] }> = {
  gas: {
    desc: "A two-pump Ervin Fuel station on the county road, canopy sagging under snow, ice machine tipped over by the door. The store's been picked over by everybody from here to Jackman, but the back office door is steel and still locked. Somebody spray-painted \"NO GAS NO FOOD NO KIDDING\" across the front window. They were mostly right.",
    notes: [
      { title: "Taped to the register", text: "To whoever comes in after me. Pumps are dry. I checked both. Underground tank's got maybe a foot left but you need the hand pump in the back office and Dale took the key home to Bingham the night it all went. Dale is not coming back. Don't wait on Dale.\nDonuts in the case are three weeks old. I ate two anyhow. Still better than the ones they sold fresh.\n— T." },
      { title: "Clipboard in the back office, shift log", text: "Oct 3. Power out again. Generator ran 4 hrs. Customer paid in deer meat, put it in the cooler, wrote IOU on the drawer slip.\nOct 6. Trucker says Augusta's got lights. Nobody believes him.\nOct 9. Folks walking past at night now. Not talking. Not looking at the lights. Just walking south. Locked the door.\nOct 10. They don't knock. Going out the back." },
      { title: "Kid's drawing on the cooler door (crayon)", text: "A stick-figure man with a big mustache holding a donut. Caption: \"DALE IS THE BEST BOSS. — Kaylee age 7.\" Somebody later wrote underneath in pen: \"he had his moments.\"" },
    ],
    npc: [{ role: "lr-tammy", name: "Tammy Bouchard" }],
  },
  camp: {
    desc: "A tar-paper camp on a beaver flowage, woodstove pipe out the side wall, meat shed on stilts out back. Buck pole by the door, empty. Inside: four bunks, a card table with a game of cribbage left mid-hand, and a calendar stuck on November of a year that doesn't matter anymore. Smells like woodsmoke, wet wool and old beans.",
    notes: [
      { title: "Camp log book on the card table", text: "Opening day. Gerry saw a doe and three squirrels. Bob saw the inside of his eyelids. Roy got lost going to the outhouse. A fine start.\nDay 3. Radio says stay put. Fine with us, we've got beans for a month.\nDay 9. Something got in the meat shed. Not a bear. Bear wouldn't leave the hide hanging that neat.\nDay 11. Roy went to check the trapline. Gerry went to look for Roy. I'm keeping the stove going. If you're reading this and you're not Roy or Gerry, the lever gun's under the bottom bunk. Use it on whatever needs it.\n— Bob Carrier" },
      { title: "Folded under the cribbage board", text: "Gerry — you owe me 14 dollars and a bottle of Allard's Brandy from last season. Don't pretend you forgot. I wrote it down this time. — R." },
      { title: "Pinned to the meat shed door (written on a paper plate)", text: "KEEP THIS SHUT. THE WOLVES CAN COUNT." },
    ],
    npc: [{ role: "lr-bob", name: "Bob Carrier" }],
  },
  truck: {
    desc: "A 26-foot box truck folded across both lanes of Route 27, cab in the ditch, trailer door chained shut from the outside. Logo's been scraped off with a knife. Snow drifted up one side, and a line of plastic grocery bags is tied to the antenna like a flag. Nobody chains a truck from the outside unless they mean to come back, or mean to keep something in.",
    notes: [
      { title: "On the driver's seat, in a fast-food bag", text: "Load sheet says paper towels. It is not paper towels. Boss said don't look and don't stop till Farmington. I looked. I'm stopping.\nIf the Collector's people find this truck, it was never mine. — Wendell" },
      { title: "Scratched inside the trailer wall", text: "6 of us. Day 2. Wendell left water. Wendell is OK.\nDay 4. Door's chained. Somebody outside, not Wendell.\nDay 5. Pried a slat. Going out the floor. Tell the Forks we tried." },
      { title: "Stuck under the windshield wiper (newer, raider handwriting)", text: "PROPERTY OF THE COLLECTOR. TOUCH IT AND HE'LL COUNT YOU TOO.\n(Underneath, in a different pen:) \"he can't count past 10 we've seen him try\"" },
    ],
    npc: [{ role: "lr-wendell", name: "Wendell Ouellette" }],
  },
};
