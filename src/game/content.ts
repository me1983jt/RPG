import type { Dialogue, Npc } from "@/game/types";

export function xpNeed(level: number): number {
  return 24 + level * 18;
}

export function questText(quest: number, kills: number): string {
  if (quest <= 0) return "Speak with Mira Pelletier in Lowelltown, west along Cambridge Road.";
  if (quest === 1) return `Put down the Chopping's three bosses: Harland Poulin, René Gallant, Gil Michaud. ${Math.min(kills, 3)} of 3 down.`;
  if (quest === 2) return "The chopping is quiet. Return to Mira Pelletier in Lowelltown.";
  return "The road is open. Holeb still stands to the southeast. Raise a lean-to if you mean to stay.";
}

export function objectiveTile(quest: number): { tx: number; ty: number } {
  if (quest === 1) return { tx: 98, ty: 30 };
  if (quest >= 3) return { tx: 102, ty: 100 };
  return { tx: 18, ty: 22 };
}

/** Side-quest state the dialogue needs (combined beta v2 additions). */
export interface TalkState {
  /** First Snow on Cambridge Road: 0 not started, 1 bringing wood, 2 see Sarah, 3 done. */
  snow: number;
  wood: number;
  /** Purchases made from Jack Ready. One is enough to earn his trust. */
  jackTrust: number;
  bunkerSeen: boolean;
  /** The Bangor Warden's checkpoint: 0 not met, 1 paid or slipped past, 2+ fought. */
  warden?: number;
  scrap?: number;
}

export const SNOW_WOOD = 3;
export const JACK_SIGNOFF = "The strong endure, but the ready prosper. Jack Ready out.";

export interface JournalEntry {
  id: string;
  title: string;
  text: string;
  done: boolean;
}

/** Quest journal: active quests first, then completed ones. */
export function journalEntries(quest: number, kills: number, t: TalkState & { jackMet: boolean }): JournalEntry[] {
  const out: JournalEntry[] = [];
  out.push({
    id: "snow",
    title: "First Snow on Cambridge Road",
    done: t.snow >= 3,
    text:
      t.snow <= 0
        ? "Justin is at the Cambridge Road farm. He wants a word before the snow comes in."
        : t.snow === 1
          ? `Bring Justin ${SNOW_WOOD} armloads of wood for the stove. You have ${Math.min(t.wood, SNOW_WOOD)} of ${SNOW_WOOD}. There is a woodpile by the barn.`
          : t.snow === 2
            ? "Justin has his wood. Go see Sarah at the farm."
            : "The Cambridge Road farm is your base. You wake on the cot under the eave, and Sarah's kitchen keeps hot cider and cider donuts.",
  });
  out.push({
    id: "chopping",
    title: "The Chopping",
    done: quest >= 3,
    text: quest >= 3 ? "The Chopping is cleared. Mira gave you Ada's hatchet." : questText(quest, kills),
  });
  if (t.jackMet || t.bunkerSeen) {
    out.push({
      id: "jack",
      title: "Jack Ready's Bunker",
      done: t.bunkerSeen,
      text: t.bunkerSeen
        ? "You found the bunker under the birch log. Scopes, armor, and real medical kits."
        : t.jackTrust > 0
          ? "Jack trusts you now. His bunker is a hatch under a birch log in the woods southwest of Attean."
          : "Jack Ready keeps a stand south of Attean. Trade with him to earn his trust.",
    });
  }
  return [...out.filter((e) => !e.done), ...out.filter((e) => e.done)];
}

export function npcLine(role: Npc["role"], name: string, quest: number, ciderGiven = false, t: TalkState = { snow: 3, wood: 0, jackTrust: 0, bunkerSeen: false }): Dialogue {
  if (role === "villager") {
    return {
      speaker: "Villager",
      text: "They nod. Nothing to trade, and no news they want to give.",
      choices: [{ label: "All right", id: "close" }],
    };
  }
  const later: Partial<Record<Npc["role"], string>> = {
    etta: "Etta Beaulieu.",
    gus: "Gus Pomerleau.",
    ruth: "Ruth Cyr.",
    emile: "Emile Violette.",
    paul: "Paul Dufour.",
    mae: "Mae Lachance.",
    walter: "Walter Kinney.",
  };
  if (later[role]) {
    return {
      speaker: name,
      text: `${later[role]} There will be more to say when the time comes.`,
      choices: [{ label: "Another time", id: "close" }],
    };
  }
  if (role === "adele") {
    return {
      speaker: name,
      text: "Adele Roy. I walk the old Canada Road with a pack and not much else. Lowelltown is the last stove before the Chopping. If you see a motor bicycle by the gravel, it is yours to kick over. It drinks no shells.",
      choices: [
        { label: "Walk with me", id: "join-adele" },
        { label: "I'll remember", id: "close" },
      ],
    };
  }
  if (role === "pete") {
    return {
      speaker: name,
      text: "Pete Lagasse. Attean keeps its head down. The road south of here bends toward Holeb. I had a brother who rode a motor bicycle until the chain ate his cuff. Walk it slow through the spruce.",
      choices: [
        { label: "Come up the road with me", id: "join-pete", check: { skill: "speech", dc: 42 } },
        { label: "Noted", id: "close" },
      ],
    };
  }
  if (role === "nora") {
    return {
      speaker: name,
      text: "Nora Hebert. Holeb is a long porch and a longer winter. Mira Pelletier is my cousin's cousin. She still counts who comes back up the old Canada Road.",
      choices: [{ label: "I'll tell her you asked", id: "close" }],
    };
  }
  if (role === "cal") {
    const trusted = t.jackTrust > 0;
    return {
      speaker: name,
      text: trusted
        ? (t.bunkerSeen
            ? "Good to see you again, friend. Same table, best gear in the county. " + JACK_SIGNOFF
            : "Good to see you again, friend. Since you trade fair: there's a birch log in the woods southwest of Attean that isn't a log. Lift the hatch and take what keeps you breathing. " + JACK_SIGNOFF)
        : "Jack Ready. Came down from the Saint John with a full pack and a plan. Best gear in the county, fair prices, no haggling. " + JACK_SIGNOFF,
      choices: [
        { label: "Ten shells — 10 iron", id: "buy-cal-shells" },
        { label: "Trauma kit — 18 iron", id: "buy-cal-wrap" },
        { label: "Plate rig — 34 iron", id: "buy-cal-coat" },
        { label: "Scoped carbine — 42 iron", id: "buy-cal-gun" },
        ...(trusted ? [{ label: "Hand-crank radio on my channel — 12 iron", id: "buy-cal-radio" }] : []),
        { label: "That's all", id: "jack-bye" },
      ],
    };
  }
  if (role === "warden") {
    if ((t.warden ?? 0) >= 1)
      return {
        speaker: name,
        text: "\"Road's open for you. Don't make me write it down twice.\" He goes back to watching the tree line.",
        choices: [{ label: "Move along", id: "close" }],
      };
    return {
      speaker: name,
      text: "A green coat with the state patch still on it, a rifle across his arms, a pole gate dragged over the gravel. \"Bangor Warden. Nobody comes down to Holeb unchecked. Twelve iron covers the toll, and you keep walking.\"",
      choices: [
        { label: (t.scrap ?? 0) >= 12 ? "Pay the toll — 12 iron" : "Pay the toll — 12 iron (you have " + (t.scrap ?? 0) + ")", id: "warden-pay" },
        { label: "Slip past while he's on the radio", id: "warden-sneak" },
        { label: "Take the gate from him", id: "warden-fight" },
        { label: "Turn back", id: "close" },
      ],
    };
  }
  if (role === "rejean") {
    return {
      speaker: name,
      text: "Réjean Leblanc. I came down from the Saint John with what the pack would hold, and I kept the rest stocked. Iron buys from the stall. Six shells are 8. A field bandage is 6. A trail coat is 14. A service carbine is 18. I don't haggle, and I don't walk the woods southwest of Lowelltown. There's a birch log on the ground out there that isn't a log.",
      choices: [
        { label: "Six shells — 8 iron", id: "buy-shells" },
        { label: "Field bandage — 6 iron", id: "buy-wrap" },
        { label: "Trail coat — 14 iron", id: "buy-coat" },
        { label: "Service carbine — 18 iron", id: "buy-carbine" },
        { label: "Binoculars — 16 iron", id: "buy-binoculars" },
        { label: "That's all", id: "close" },
      ],
    };
  }
  if (role === "justin") {
    if (t.snow <= 0) {
      return {
        speaker: name,
        text: "Justin. This is our ground on Cambridge Road: the farmhouse, the barn, the orchard, and the sugar maples. First snow is coming in tonight and the stove is down to kindling. Bring me three armloads of wood from the pile by the barn and you've got a place here.",
        choices: [
          { label: "I'll bring the wood", id: "snow-accept" },
          { label: "Another time", id: "close" },
        ],
      };
    }
    if (t.snow === 1) {
      return t.wood >= SNOW_WOOD
        ? {
            speaker: name,
            text: "That's good dry wood. Stack it by the stove.",
            choices: [{ label: `Hand over the wood (${SNOW_WOOD})`, id: "snow-wood" }],
          }
        : {
            speaker: name,
            text: `Three armloads. You have ${t.wood}. The woodpile is by the barn.`,
            choices: [{ label: "On it", id: "close" }],
          };
    }
    if (t.snow === 2) {
      return {
        speaker: name,
        text: "Stove's going. Go see Sarah. She's got the kitchen and the press.",
        choices: [{ label: "I will", id: "close" }],
      };
    }
    return {
      speaker: name,
      text: "The stove stays lit and the cot is yours. Twelve apple trees, two rows. Leave them standing.",
      choices: [
        { label: "I'll leave the rows standing", id: "close" },
        { label: "Come hold the orchard", id: "join-justin" },
      ],
    };
  }
  if (role === "sarah") {
    if (t.snow === 2) {
      return {
        speaker: name,
        text: "You got Justin his wood. Here: hot cider in a tin cup, and cider donuts from the kitchen. The cot under the eave is yours. This farm is your home now. Come back when you're hurt.",
        choices: [{ label: "Thank you, Sarah", id: "snow-done" }],
      };
    }
    if (t.snow < 2) {
      return {
        speaker: name,
        text: "Sarah. I run the kitchen and the cider press. First snow tonight. Help Justin with the wood, then come see me and we'll warm you up.",
        choices: [{ label: "I'll help him", id: "close" }],
      };
    }
    if (!ciderGiven) {
      return {
        speaker: name,
        text: "The press ran this week. Hot cider and cider donuts from these trees. I can put some in your pack.",
        choices: [
          { label: "I'll take them", id: "cider" },
          { label: "I'll stand the night with you", id: "join-sarah" },
          { label: "I'll sit a minute", id: "close" },
        ],
      };
    }
    return {
      speaker: name,
      text: "The kitchen restocks every morning. Leave the two rows standing. They're why the cups stay full.",
      choices: [
        { label: "I will", id: "close" },
        { label: "Stand with me if they come", id: "join-sarah" },
      ],
    };
  }
  if (role === "cyndal") {
    return {
      speaker: name,
      text: "Cyndal. I'm thirteen. I can reach the lower limbs on these two rows without a box. The high ones are Justin's.",
      choices: [
        { label: "I'll leave the high ones", id: "close" },
        { label: "You can take a post", id: "join-cyndal" },
      ],
    };
  }
  if (role === "loki") {
    return {
      speaker: name,
      text: "Loki. I'm nine. Justin said the press is not a ladder, so I stay in the lane. I can see over the crate if I stand on my toes.",
      choices: [
        { label: "Stay off the press", id: "close" },
        { label: "Stay by me tonight", id: "join-loki" },
      ],
    };
  }
  if (role === "mira") {
    if (quest <= 0) {
      return {
        speaker: name,
        text: "The Chopping took the old Canada Road east. Six choppers in patched dusters, with lever rifles and single-action revolvers, sitting on Ada Ladd's gravel. Three of them run it: Harland Poulin in the fur coat, René Gallant behind the mask, and Gil Michaud with the saw. Put those three down and the Chopping breaks. Then Lowelltown can pack to Attean again.",
        choices: [
          { label: "I'll clear the chopping", id: "accept" },
          { label: "Tell me how they sit", id: "mira-brief", check: { skill: "speech", dc: 48 } },
          { label: "Not yet", id: "close" },
        ],
      };
    }
    if (quest === 1) {
      return {
        speaker: name,
        text: "Follow the gravel east. Do not cut across the ledge. The Boundary Mountains do not give boots back.",
        choices: [{ label: "Understood", id: "close" }],
      };
    }
    if (quest === 2) {
      return {
        speaker: name,
        text: "You came back breathing. This is Ada's hatchet. Ash handle, steel bit. She blazed this road with it. It is sharp. It is not lucky, and it is not holy. Lowelltown can hold a lean-to, if you raise one.",
        choices: [{ label: "I'll take the hatchet", id: "reward" }],
      };
    }
    return {
      speaker: name,
      text: "The road is yours to walk. Holeb is a long way southeast, on the pond. The ground west of their huts is clear if Lowelltown feels small. Ada died of cold on the Height of Land. Ordinary cold.",
      choices: [{ label: "I'll remember", id: "close" }],
    };
  }
  if (role === "bram") {
    return {
      speaker: name,
      text: "Spruce in the deadfalls, ledge in the loose rock, camp iron in the heaps — stove lids, spikes, axe heads. Ada's rule: a lean-to is where you fall down out of the weather. A stake fence keeps a night honest. A smithy makes more iron. A cookfire dries wool. You warm up because you stood still.",
      choices: [{ label: "I'll build", id: "close" }],
    };
  }
  if (role === "sera") {
    return {
      speaker: name,
      text: quest >= 1
        ? "Attean keeps its head down. If you are walking past the Chopping, I will come as far as the gravel holds. Stay on it. Ada Ladd blazed it. The ledge eats a straight line."
        : "Attean keeps its head down. If you are walking to the Chopping, stay on the gravel. Ada Ladd blazed it. The ledge eats a straight line. I am not leaving the stoves until that job is spoken for.",
      choices: quest >= 1
        ? [
            { label: "Come as far as the gravel", id: "join-sera" },
            { label: "Thanks", id: "close" },
          ]
        : [{ label: "Thanks", id: "close" }],
    };
  }
  if (role === "holt") {
    return {
      speaker: name,
      text: "I saw lamps at Holeb last month. Long walk southeast. Longer if a chopper with a lever gun wants a word. Ada overnighted there when the Moose River was high.",
      choices: [
        { label: "Walk it with me", id: "join-holt", check: { skill: "speech", dc: 46 } },
        { label: "Noted", id: "close" },
      ],
    };
  }
  if (quest < 3) {
    return {
      speaker: name,
      text: "Choppers own the middle of the road. I don't give strangers the long talk until that changes. Lowelltown's cook is Mira Pelletier. She still has her sister's hatchet.",
      choices: [{ label: "Fair", id: "close" }],
    };
  }
  return {
    speaker: name,
    text: "Mira's word travels, even here. Ada Ladd said the ground west of these huts will take a camp. She was right about the road and wrong about one winter. Raise a lean-to if you mean to stay.",
    choices: [{ label: "I might", id: "close" }],
  };
}
