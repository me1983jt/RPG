# Balance notes (beta v13; v11.2 notes kept below)

Goal: a tense but fair early game, where nothing can be farmed without limit.

## Reviewed

| Area | Numbers (as found) | Verdict |
|---|---|---|
| Raider loot (`rollDrop`) | Normal kill: 6% good, 20% standard, 36% poor, 38% nothing. Elite: 16/30/39/15%. Plus 2 iron (4 elite) and a 40% chance of cloth | Fair. A gun comes from about 1 normal kill in 25. Unchanged |
| Chests | Lockpick per chest, once each, 5 iron plus one roll | Fair, can't be repeated. Unchanged |
| Rocks, trees | Each node is removed after gathering | Can't be farmed. Unchanged |
| Raid scouts (14 HP, 4 atk) through Plate/Brute (46 HP, 8 atk) | Waves 3 to 5. Farmhouse HP 90+15n, +15 per stone wall | Night 1 is mostly scouts and night 5+ brings brutes. Unchanged |
| Raid reward | 6+4n iron and 20+10n XP per night held | Danger scales with n, so it's fair. Unchanged |
| Hunting trip | **Unlimited trips back to back.** A deer (18 HP, 5 atk, 8 XP in the woods; 16 HP, 2 atk in a road migration) gives 2 meat + 2 bone + 1 hide (v14.1: matched to the code), worth 3 iron at Bangor | **Farmable. Changed** |
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

## v13 (0.13.0)

Numbers live in `src/game/v13.ts`. Tests: `scripts/v13-test.mjs` (73 checks).

### Core stats (`coreEffects`)
| Stat | Each point |
|---|---|
| Strength | Carry +4 lb (base 40), melee hits harder |
| Endurance | Stamina +16, hunger/thirst drain −5% (floor ×0.6) |
| Agility | Stamina +6, crit +1.5% |
| Perception | Sight +1 tile, gun accuracy +2% |
| Wits | Trader prices −1% (cap 15%), dialogue checks +2, crit +0.5% |
| Grit | Health +3, colds/infection −4% (cap 40%) |

Base crit is 3%. Wits stacks with the barter perk, so `v113-test` now checks the price is at most 94 instead of exactly 94.

### Skills and perks
- 17 skills: the 9 trade skills from v11.3, plus Cooking, Foraging, Fishing, Survival, Leadership, Scavenging, Tracking and First Aid.
- Each skill earns a perk at levels 3, 6 and 9 (`SKILL_PERKS`, `perkCount`).

### Backstories
| Backstory | Stats | Skills | Gear |
|---|---|---|---|
| Veteran | Grit +2, Perception +1 | Marksmanship 2, Leadership 1, First Aid 1 | carbine + shells |
| Mechanic | Wits +2, Agility +1 | Mechanics 2, Scavenging 1, Carpentry 1 | 2 gas, 2 wire |
| Farmer | Endurance +2, Grit +1 | Farming 2, Cooking 1, Foraging 1 | 4 apples, 2 greens, 2 water |
| Woods guide | Perception +1, Agility +2 | Hunting 2, Tracking 1, Trapping 1 | 2 snares, 2 meat, 1 hide |

### Needs (per in-game hour; meters run 0 to 100)
- Rates:
  - Normal: hunger 2.2, thirst 3, sleep 2.4. Health loss when a meter is empty: 0.5 per hour.
  - Hard: hunger 4, thirst 5.5, sleep 3.6, health 1.5.
- Needs start after First Snow and are off in Raid Mode.
- Food values:
  - Stew: 55 hunger, 15 thirst.
  - Chowder: 50 hunger, 20 thirst.
  - Venison steak: 45 hunger.
  - Water: 45 thirst.
  - Coffee: 30 sleep.

### Weather (sight / walk speed / bike speed)
| Weather | Sight | Walk | Bike |
|---|---|---|---|
| Clear | ×1 | ×1 | ×1 |
| Snow | ×0.85 | ×0.92 | ×0.85 |
| Nor'easter | ×0.55 | ×0.7 | no riding |
| Fog | ×0.5 | ×1 | ×0.8 |
| Black ice | ×1 | ×0.85 | ×0.55, plus a chance to slip |
| Rain | ×0.8 | ×0.95 | ×0.9 |

Weather is rolled once a day from a table for each season.

### Moon (8-day cycle)
- Full moon: night darkness ×0.62, raiders 25% bolder, +1 raid wave, stealth −15.
- New moon: darkness ×1.12, raiders less bold, stealth +15.

### Cooking buffs
- Stew: Warm, 10 h.
- Chowder: Steady, 8 h.
- Steak: Strong (+2 attack), 6 h.
- Pie: Cheer, 12 h.
- Coffee: Awake, 8 h.
- Tonic: cures a cold.

### Sickness
- Winter cold: speed ×0.92, stamina ×0.6.
- Broken bone: speed ×0.7.
- Infected cut: −4 health a day.
- Cures: medicine, tonic (colds only), a splint (bones only), or the Harmony clinic for 4 iron.

### Armor
- Durability is 100. Each hit wears down one worn piece by 2 + dmg/4 points (at most 6).
- Repair at the workbench costs iron by tier. A hide patch adds 40.
- A full matching tier gives a set bonus: Homespun +1, Woodsman's +2 (and +5% speed), Ironside +4, Bunker +6.

### Bounties, caravans, rebuilding, travel
- Bounties: 3 jobs every 3 days, paying 3 to 6 iron per unit.
- Caravans:
  - Lowelltown to Skowhegan: every 2 days, 9 to 3.
  - Skowhegan to Bangor: every 3 days, 10 to 4.
  - Robbing one pays its cargo but costs loyalty (Sarah −15, Marcel −20). Guarding one pays iron and earns loyalty.
- Harmony rebuilding (wood / stone / iron):
  - Store: 20 / 6 / 12. Gives 10% off.
  - School: 24 / 10 / 6. Gives +10% XP.
  - Clinic: 16 / 12 / 10, plus 2 medicine.
- Fast travel: by bike only, to towns you've already visited. Costs gas by distance (`travelGas`) and can trigger a road event.
- Road events: at most 1 a day, with a 25% roll every 40 s of riding or walking on a road.
- Loyalty: companions leave at −40.

## v13.2 balance pass

A day is 12 real minutes (`DAY_LENGTH_SEC`), so the hourly rates below are per in-game hour.

| Area | Before | After | Why |
|---|---|---|---|
| Thirst, normal mode | 3 / h (72 a day) | **2.6 / h** (62 a day) | One water (45) plus a meal's worth is about a day. Normal mode should be gentle |
| Hunger | 2.2 / h normal, 4 / h hard | unchanged | One stew (55) about covers a day on normal |
| Black ice, slipping (checked every 6 s while moving) | 30% riding, 8% walking | **12% riding, 6% walking** | Riding meant a fall about every 20 s |
| Broken bone from a black-ice fall | 50% riding, 20% walking | **30% riding, 12% walking** | Together with the change above, a bone on almost every icy ride was too much |
| Infected cut from an animal bite | 15% a hit | **8% a hit** | A coyote pack gave a cut almost every fight |
| Broken bone from a big hit (30%+ of max HP) | 20% | **12%** | Too punishing |
| "Thin out the raiders" bounty | 6 iron each (up to 24) | **4 iron each (up to 16)** | It paid more than the risk, next to shells at 10 iron for 8 |
| Siege of Harmony | Ended at dawn and counted as a loss | **Runs until it's decided.** The Collector always walks in after the last wave | Bug: a held farm could get the "fallen" ending |
| Moose | 96 in tall | **92 in**, shoulder about 66 px | Realistic scale |

Prices and loot (camp raids, caravans, Marcel, Bangor) were reviewed and are unchanged.

## v14.1 balance (from the "RPG Balance v14" sheet)
| Item | Before | After |
|---|---|---|
| First Defend the Farm | Lost wave restored the walls | Can be lost: retry from the checkpoint, walls keep their damage |
| Farmhouse raid HP | 90+15n | 120+15n |
| Sheet-iron wall / iron gate | 3 / 4 iron | 5 / 6 iron |
| Rain collector | — | Makes 1 water per 12 h (twice as fast in rain); pours into a rain barrel within 6 tiles |
| Rain barrel | Endless water on tap | Stores up to 8 jugs; fills in rain and from collectors |
| Sewn sack / hide rucksack | 4 cloth / 4 hide | 3 cloth / 3 hide |
| Starting wreck cloth | 2 | 3 |
| The Grok | Claw only from the quest | Drops 2-3 Grok claws, 3 hide, 3 meat |
| Hot cider / cider donut | Heal only | +6 food +20 water / +14 food, each +15 stamina |
| Bob's lever gun | — | atk 10, slowest reload of any long gun (1.15 s), below the Wyndham (12) and scoped carbine (14) |
