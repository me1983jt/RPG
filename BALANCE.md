# Balance notes (beta v11.2)

Goal: a tense but fair early game, where nothing can be farmed without limit.

## Reviewed

| Area | Numbers (as found) | Verdict |
|---|---|---|
| Raider loot (`rollDrop`) | Normal kill: 6% good, 20% standard, 36% poor, 38% nothing. Elite: 16/30/39/15%. Plus 2 iron (4 elite) and a 40% chance of cloth | Fair. A gun comes from about 1 normal kill in 25. Unchanged |
| Chests | Lockpick per chest, once each, 5 iron plus one roll | Fair, can't be repeated. Unchanged |
| Rocks, trees | Each node is removed after gathering | Can't be farmed. Unchanged |
| Raid scouts (14 HP, 4 atk) through Plate/Brute (46 HP, 8 atk) | Waves 3 to 5. Farmhouse HP 90+15n, +15 per stone wall | Night 1 is mostly scouts and night 5+ brings brutes. Unchanged |
| Raid reward | 6+4n iron and 20+10n XP per night held | Danger scales with n, so it's fair. Unchanged |
| Hunting trip | **Unlimited trips back to back.** A deer (20 HP, 2 atk) gave 2 meat + 1 hide, worth 3 iron at Bangor | **Farmable. Changed** |
| Fishing | **Unlimited casts.** 12% chance of 3 smoked fish, otherwise 1 | **Farmable food. Changed** |
| Shell prices | Réjean 8 iron for 6, Marcel 10 for 8, **Bangor 8 for 8** | Bangor was the cheapest and needs no risk past the trip. Changed |
| Gas prices | Marcel 4 iron a can, **Bangor 2 for 6** | Changed to match Marcel |
| Gas use | 1 can per 40 tiles. Sources: loot (a standard-tier pool item), Marcel, Bangor, quest reward of 3 | Scarce but obtainable. Unchanged |
| Farm food | Plots × season multiplier, coop every 2 days, smokehouse turns meat into jerky | Built with materials and limited to once a day. Unchanged |

## Changes

- Hunting trips: one per in-game day (`q11.huntDay`). Justin says "We've been out once today."
- Whitetail buck: 20 HP / 2 atk → **26 HP / 3 atk**, so it's no longer a free kill.
- Fishing: **3 fish per in-game day** (`FISH_PER_DAY`, `q11.fish.day/today`). After that the line says "They've gone off the bite."
- Bangor market: shells 8 for **10** iron (was 8). Gas 2 cans for **8** iron (was 6), which is 4 a can, the same as Marcel.

Tests: `polish-test.mjs` covers `one-hunt-a-day` and `three-fish-a-day`.
