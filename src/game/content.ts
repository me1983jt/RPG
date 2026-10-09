import type { Dialogue, Npc } from "@/game/types";

export function xpNeed(level: number): number {
  return 24 + level * 18;
}

export function questText(quest: number, kills: number): string {
  if (quest <= 0) return "Speak with Mira Pelletier in Lowelltown, west along Cambridge Road.";
  if (quest === 1) return `Clear the choppers at the Chopping. ${Math.min(kills, 6)} of 6 down.`;
  if (quest === 2) return "The chopping is quiet. Return to Mira Pelletier in Lowelltown.";
  return "The road is open. Holeb still stands to the southeast. Raise a lean-to if you mean to stay.";
}

export function objectiveTile(quest: number): { tx: number; ty: number } {
  if (quest === 1) return { tx: 98, ty: 30 };
  if (quest >= 3) return { tx: 102, ty: 100 };
  return { tx: 18, ty: 22 };
}

export function npcLine(role: Npc["role"], name: string, quest: number, ciderGiven = false): Dialogue {
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
    return {
      speaker: name,
      text: "Cal MacInnis. I came down from the Saint John with more than a pack, and I keep the rest on the table. I don't haggle. Eight shells are 10. A clean bandage is 10. A quilted jacket is 16. A good carbine is 26. South of the Attean road there is a birch log I laid myself. If you get under it, take what keeps you breathing and shut the hatch.",
      choices: [
        { label: "Eight shells — 10 iron", id: "buy-cal-shells" },
        { label: "Clean bandage — 10 iron", id: "buy-cal-wrap" },
        { label: "Quilted jacket — 16 iron", id: "buy-cal-coat" },
        { label: "Good carbine — 26 iron", id: "buy-cal-gun" },
        { label: "That's all", id: "close" },
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
        { label: "That's all", id: "close" },
      ],
    };
  }
  if (role === "justin") {
    return {
      speaker: name,
      text: "This is our ground on the Chain of Ponds road. Twelve apple trees, two rows, and a lane between them. Sarah runs the press at the end of the row. The road you came in on goes back to Moose River.",
      choices: [{ label: "I'll leave the rows standing", id: "close" }],
    };
  }
  if (role === "sarah") {
    if (!ciderGiven) {
      return {
        speaker: name,
        text: "The press at the end of the row ran this week. Hot cider and cider donuts from these trees. I can put some in your pack.",
        choices: [
          { label: "I'll take them", id: "cider" },
          { label: "I'll sit a minute", id: "close" },
        ],
      };
    }
    return {
      speaker: name,
      text: "Leave the two rows standing. They're why the cups stay full.",
      choices: [{ label: "I will", id: "close" }],
    };
  }
  if (role === "cyndal") {
    return {
      speaker: name,
      text: "Cyndal. I'm thirteen. I can reach the lower limbs on these two rows without a box. The high ones are Justin's.",
      choices: [{ label: "I'll leave the high ones", id: "close" }],
    };
  }
  if (role === "loki") {
    return {
      speaker: name,
      text: "Loki. I'm nine. Justin said the press is not a ladder, so I stay in the lane. I can see over the crate if I stand on my toes.",
      choices: [{ label: "Stay off the press", id: "close" }],
    };
  }
  if (role === "mira") {
    if (quest <= 0) {
      return {
        speaker: name,
        text: "The Chopping took the old Canada Road east. Six choppers in patched dusters, with lever rifles and single-action revolvers, sitting on Ada Ladd's gravel. Clear them and Lowelltown can pack to Attean again.",
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
