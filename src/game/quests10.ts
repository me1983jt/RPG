/**
 * Beta v10 side quests: Seed Run, Kennebec Crossing, Lost Dog, Cyndal's Radio, Moose Season.
 * Pure state + text. The engine owns spawning, markers and travel and calls in here for words and stages.
 * No new art: every body drawn for these quests uses an existing sheet.
 */
import type { Dialogue } from "@/game/types";

export interface Q10State {
  /** Seed Run: 0 not offered, 1 walk to the co-op, 2 clear it, 3 search the bins, 4 bring the seed to Sarah, 5 done. */
  seed: number;
  seedLeft: number;
  /** Kennebec Crossing: 0 not offered, 1 gather planks/rope/winch part, 2 fix the ferry, 3 done (ferry runs). */
  ferry: number;
  planks: boolean;
  rope: boolean;
  winch: boolean;
  /** Lost Dog: 0 dog home, 1 dog ran off (see Loki), 2 follow the tracks, 3 bring Biscuit home, 4 done. */
  dog: number;
  dogStep: number;
  /** Cyndal's Radio: 0 not offered, 1 find 3 parts, 2 bring them to Cyndal, 3 done (trader on the radio). */
  radio: number;
  parts: boolean[];
  /** Moose Season: 0 not offered, 1 walk to the bog, 2 take the bull, 3 haul it home, 4 tell Justin, 5 done. */
  moose: number;
  bearDone: boolean;
  /** Winter stores put up by the quests (shown in the journal). */
  stores: number;
  /** Next id for quest-spawned bodies (never reused, so the save's slain list can't hit a later one). */
  nextId: number;
}

export function freshQ10(): Q10State {
  return { seed: 0, seedLeft: 0, ferry: 0, planks: false, rope: false, winch: false, dog: 0, dogStep: 0, radio: 0, parts: [false, false, false], moose: 0, bearDone: false, stores: 0, nextId: 96000 };
}

export function loadQ10(raw: unknown): Q10State {
  const base = freshQ10();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Q10State>;
  return { ...base, ...r, parts: Array.isArray(r.parts) && r.parts.length === 3 ? r.parts.map(Boolean) : base.parts };
}

/** Quest sites on the home map, in world-relative tiles (the engine adds WORLD_OX/OY and finds open ground). */
export const Q10_SITES = {
  coop: { tx: 88, ty: 58, name: "Pittsfield co-op" },
  coopBins: { tx: 90, ty: 60, name: "Co-op seed bins" },
  ferry: { tx: 60, ty: 4, name: "Kennebec ferry landing" },
  planks: { tx: 14, ty: 28, name: "Lowelltown sawpile" },
  rope: { tx: 62, ty: 50, name: "Attean boathouse" },
  winch: { tx: 86, ty: 40, name: "Wrecked log truck" },
  part0: { tx: 22, ty: 16, name: "Lowelltown grange hall" },
  part1: { tx: 54, ty: 58, name: "Attean fire tower shed" },
  part2: { tx: 96, ty: 94, name: "Holeb camp road" },
  bog: { tx: 46, ty: 42, name: "Heald Stream bog" },
} as const;
export type Q10Site = keyof typeof Q10_SITES;

/** Where Biscuit's tracks run: a bent line out of the orchard into the spruce, ending where he's holed up. */
export const DOG_TRAIL: [number, number][] = [
  [42, 20], [45, 23], [47, 27], [46, 31], [49, 34], [52, 36], [55, 35], [57, 38],
];

export const RADIO_PARTS = ["a 6V6 tube in a sock", "a coil of copper wire on a spool", "a lantern battery that still kicks"];
export const RADIO_SITES: Q10Site[] = ["part0", "part1", "part2"];

/** Quest journal entries for the v10 quests (only quests that have started, or are on offer at the farm). */
export function q10Journal(q: Q10State, snowDone: boolean): { id: string; title: string; text: string; done: boolean }[] {
  const out: { id: string; title: string; text: string; done: boolean }[] = [];
  if (q.seed > 0 || snowDone)
    out.push({
      id: "seed",
      title: "Seed Run",
      done: q.seed >= 5,
      text:
        q.seed <= 0 ? "Sarah's been fretting over next year's potatoes. Ask her at the farm."
        : q.seed === 1 ? "Sarah needs seed potatoes from the old farmers' co-op in Pittsfield before the frost gets into them. Walk down the Pittsfield road."
        : q.seed === 2 ? `Somebody's camped at the co-op. Clear them out. ${q.seedLeft} left.`
        : q.seed === 3 ? "The co-op is quiet. Search the seed bins in back."
        : q.seed === 4 ? "You've got a sack of seed potatoes. Get them back to Sarah before they freeze."
        : `Sarah has her seed. Next spring's potatoes are in the root cellar, and the kitchen puts up camp stew now. Winter stores: ${q.stores}.`,
    });
  if (q.ferry > 0 || snowDone)
    out.push({
      id: "ferry",
      title: "Kennebec Crossing",
      done: q.ferry >= 3,
      text:
        q.ferry <= 0 ? "Justin says the old Kennebec ferry could run again. Talk to him."
        : q.ferry === 1 ? `Fix the old ferry: planks from the Lowelltown sawpile${q.planks ? " (got)" : ""}, rope from the Attean boathouse${q.rope ? " (got)" : ""}, and a winch pawl off the wrecked log truck${q.winch ? " (got)" : ""}.`
        : q.ferry === 2 ? "You've got planks, rope and the winch part. Take them to the ferry landing on the Kennebec, north of the farm."
        : "The ferry runs again. Pole across at the landing to reach the north woods, where they say The Grok walks.",
    });
  if (q.dog > 0)
    out.push({
      id: "dog",
      title: "Lost Dog",
      done: q.dog >= 4,
      text:
        q.dog === 1 ? "Loki's dog Biscuit bolted during the raid. Loki's upset. Go see him at the farm."
        : q.dog === 2 ? `Follow Biscuit's paw prints out past the orchard into the spruce. Track ${Math.min(q.dogStep + 1, DOG_TRAIL.length)} of ${DOG_TRAIL.length}.`
        : q.dog === 3 ? "You found Biscuit. Walk him home to Loki."
        : "Biscuit is home, muddy and pleased with himself. Loki hasn't let go of him since.",
    });
  if (q.radio > 0 || snowDone)
    out.push({
      id: "radio",
      title: "Cyndal's Radio",
      done: q.radio >= 3,
      text:
        q.radio <= 0 ? "Cyndal's been fiddling with an old set in the loft. Ask her about it."
        : q.radio === 1 ? `Cyndal needs three radio parts: ${RADIO_PARTS.map((p, i) => `${p}${q.parts[i] ? " (got)" : ""}`).join("; ")}. Look at the Lowelltown grange hall, the Attean fire tower shed and the Holeb camp road.`
        : q.radio === 2 ? "You've got all three parts. Bring them to Cyndal at the farm."
        : "The set works. Cyndal can raise Marcel Thibodeau, a trader out of Skowhegan, and he'll run a sled up to the farm.",
    });
  if (q.moose > 0 || snowDone)
    out.push({
      id: "moose",
      title: "Moose Season",
      done: q.moose >= 5,
      text:
        q.moose <= 0 ? "Justin wants meat in the shed before the snow gets deep. Ask him about a moose."
        : q.moose === 1 ? "Walk to the Heald Stream bog, south of the farm. A big bull's been feeding there mornings."
        : q.moose === 2 ? "The bull is in the bog. Take him down."
        : q.moose === 3 ? "The bull is down and quartered. Haul the meat home to the farm. Keep your eyes open, it's bear country."
        : q.moose === 4 ? "You're back with the meat. Tell Justin."
        : `A winter's worth of moose is hanging in the shed and the hide's stretched on the barn wall. Winter stores: ${q.stores}.`,
    });
  return out;
}

/** One-line HUD hint for the most pressing v10 quest, or "" when none is mid-way. */
export function q10Hud(q: Q10State): string {
  if (q.dog === 1) return "Lost Dog: Loki's dog ran off. Talk to Loki.";
  if (q.dog === 2) return `Lost Dog: follow the paw prints. ${Math.min(q.dogStep + 1, DOG_TRAIL.length)} of ${DOG_TRAIL.length}.`;
  if (q.dog === 3) return "Lost Dog: walk Biscuit home to Loki.";
  if (q.seed >= 1 && q.seed <= 4) return ["", "Seed Run: walk to the Pittsfield co-op.", `Seed Run: clear the co-op. ${q.seedLeft} left.`, "Seed Run: search the seed bins.", "Seed Run: bring the seed to Sarah."][q.seed]!;
  if (q.moose >= 1 && q.moose <= 4) return ["", "Moose Season: walk to the Heald Stream bog.", "Moose Season: take the bull.", "Moose Season: haul the meat home.", "Moose Season: tell Justin."][q.moose]!;
  if (q.ferry === 1) return `Kennebec Crossing: planks${q.planks ? " ✓" : ""}, rope${q.rope ? " ✓" : ""}, winch part${q.winch ? " ✓" : ""}.`;
  if (q.ferry === 2) return "Kennebec Crossing: fix the ferry at the landing.";
  if (q.radio === 1) return `Cyndal's Radio: ${q.parts.filter(Boolean).length} of 3 parts.`;
  if (q.radio === 2) return "Cyndal's Radio: bring the parts to Cyndal.";
  return "";
}

/** Extra talk for the family at the farm. Returns a full replacement line, or extra choices to add, or null. */
export function q10Talk(role: string, q: Q10State, snowDone: boolean, raidOn: boolean): { replace?: Dialogue; add?: { label: string; id: string }[] } | null {
  if (!snowDone || raidOn) return null;
  if (role === "sarah") {
    if (q.seed === 4)
      return {
        replace: {
          speaker: "Sarah",
          text: "Oh, you found them! Kennebec russets, and not a one gone soft. I'll lay these down in sand in the root cellar. Come spring we'll have a whole patch behind the barn. And there's stew on. Take some, you earned it.",
          choices: [{ label: "Glad they're good", id: "q10-seed-done" }],
        },
      };
    if (q.seed === 0)
      return { add: [{ label: "You look worried, Sarah", id: "q10-seed-ask" }] };
    return null;
  }
  if (role === "justin") {
    if (q.moose === 4 || q.moose === 3)
      return {
        replace: {
          speaker: "Justin",
          text: q.moose === 4
            ? "Now that's a moose. Must dress out at six hundred pounds. We'll hang the quarters in the shed and I'll stretch the hide on the barn wall. That's the winter handled, ayuh."
            : "You got him? Good. Get the meat the rest of the way up to the yard and we'll hang it.",
          choices: q.moose === 4 ? [{ label: "Hang it up", id: "q10-moose-done" }] : [{ label: "Bringing it", id: "close" }],
        },
      };
    const add: { label: string; id: string }[] = [];
    if (q.ferry === 0) add.push({ label: "Anything need doing?", id: "q10-ferry-ask" });
    if (q.moose === 0) add.push({ label: "Meat for the winter?", id: "q10-moose-ask" });
    return add.length ? { add } : null;
  }
  if (role === "loki") {
    if (q.dog === 1)
      return {
        replace: {
          speaker: "Loki",
          text: "Biscuit ran off when the shooting started! He went right under the fence and out past the orchard. I'm not allowed to go after him, Dad said. You can follow his paw prints. They're in the mud by the trees. Please?",
          choices: [{ label: "I'll find him, bud", id: "q10-dog-accept" }],
        },
      };
    if (q.dog === 3)
      return {
        replace: {
          speaker: "Loki",
          text: "BISCUIT! You found him! He smells like a swamp. Good boy, good boy. Thank you. You can have my maple candy. Don't tell Mom.",
          choices: [{ label: "Keep him close, bud", id: "q10-dog-done" }],
        },
      };
    if (q.dog === 2)
      return { replace: { speaker: "Loki", text: "Did you find him yet? Is he cold? His paw prints go out past the orchard toward the big spruce.", choices: [{ label: "Still looking", id: "close" }] } };
    return null;
  }
  if (role === "cyndal") {
    if (q.radio === 2)
      return {
        replace: {
          speaker: "Cyndal",
          text: "You got all three! The tube's a 6V6. That's the right one. Hold the lamp... okay. Okay! Listen. That's a man talking. \"...Thibodeau, Skowhegan, anybody on this band...\" He says he trades. He'll come up the road with his sled if we call.",
          choices: [{ label: "Nice work, Cyndal", id: "q10-radio-done" }],
        },
      };
    if (q.radio === 0) return { add: [{ label: "What's that radio?", id: "q10-radio-ask" }] };
    if (q.radio >= 3) return { add: [{ label: "Call Marcel on the radio", id: "q10-trader" }] };
    return null;
  }
  return null;
}

export const Q10_TEXT = {
  seedAsk: {
    speaker: "Sarah",
    text: "It's the seed. We ate last year's potatoes down to nothing, and if there's no seed there's no crop. The old farmers' co-op in Pittsfield had bins of seed potatoes in back, Kennebec russets. Nobody's been down that road since summer. If they freeze, they're done. Would you go?",
    choices: [{ label: "I'll get your seed", id: "q10-seed-accept" }, { label: "Not today", id: "close" }],
  },
  ferryAsk: {
    speaker: "Justin",
    text: "The old Kennebec ferry up north of here. It's a cable barge, nothing fancy, but the deck's rotted and the winch is froze. Get me planks from the Lowelltown sawpile, a good coil of rope from the boathouse at Attean, and a winch pawl off that log truck in the ditch east of here. Fix her up and we've got a way into the north woods. Folks say The Grok walks up there. I'd want to know.",
    choices: [{ label: "I'll fix the ferry", id: "q10-ferry-accept" }, { label: "Another time", id: "close" }],
  },
  mooseAsk: {
    speaker: "Justin",
    text: "A big bull's been feeding mornings in the Heald Stream bog, south of here. One moose is most of a winter for this family. Take him clean, quarter him, and haul him home. And watch yourself coming back. The bears haven't gone down yet.",
    choices: [{ label: "I'll get the moose", id: "q10-moose-accept" }, { label: "Not yet", id: "close" }],
  },
  radioAsk: {
    speaker: "Cyndal",
    text: "Dad found it in the barn. It's a ham set, like before. Last night I swear I heard somebody talking, really faint. It needs a tube, a coil and a battery. Mr. Kinney said the grange hall in Lowelltown had a radio, and there's an old fire tower shed by Attean, and a camp road down by Holeb with junk in the ditches. Can you look? I can't go that far, Mom won't let me.",
    choices: [{ label: "I'll find the parts", id: "q10-radio-accept" }, { label: "Maybe later", id: "close" }],
  },
} satisfies Record<string, Dialogue>;
