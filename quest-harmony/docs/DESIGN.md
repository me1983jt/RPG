# The Long Winter — Harmony town layer (design)

Sierra-style (QfG/KQ) point-and-click adventure-RPG, plain HTML/CSS/JS, no build. Entry: `index.html`.

## Files
- `index.html`, `style.css` — icon bar (Walk, Look, Hand, Talk, Item, Cycle, Inventory, Stats, Menu, Score), weathered wood + rusted riveted buttons (textures from /workspace/ui-kit/img).
- `js/story.js` — CLASSES (names/blurbs/stats configurable), ITEMS (RPG item ids), STORY: 9 acts, quests (ids, stages, class branches, markers), flags, endings.
- `js/scenes.js` — SCENES (bg path or `paint` placeholder, walk polygon, hotspots with look/hand/talk text or `fn:` actions, exits), NPCS, WORLD (stub map). Swap real art: set `bg:'img/scenes/farm.jpg'` per scene.
- `js/game.js` — engine, RPG systems, fight, handoff. Debug handle: `window.HARMONY`.
- `tests/test.py` + `tests/parent.html` — Playwright run (desktop + 915x412 touch, iframe protocol).

## Classes
Woodsman (Strength/Endurance), Scrounger (Stealth/Lockpicking/Climbing), Fixer (Charm/Barter), Tinker (Tinkering/Electronics). Stats grow with use (`useStat`). HP, stamina, hunger (ticks with time/walking; 100 = starving damage), injuries blinded/crippledArm/crippledLeg (dims screen / halves damage / slows walk). Doc Ellen cures.

## Act 1 (playable)
Scenes: Cambridge Road Farm, Harmony Main Street, Trading Post (Hal, barter with trade credit, Barter/Charm affect prices), Grange Hall Clinic (Doc Ellen: heal + medkits/food).
Quests mirror the main game (see mapping below): First Snow (Sarah), Lost Dog (Loki → Mira → tracks past the orchard → Goose → Loki), Cyndal's Radio (6V6 tube from Hal), Medicine Run (Mira → Skowhegan → Mira), School Days step 1 (school squatter), Bike Parts step 1 (stuck barn door, class alternates), Raid Nights warning.
School squatter (School Days step 1): fight or avoid (Sneak/Bribe/Talk/Goose bark). Fight: real-time, telegraphed pattern (jab→block, heavy→dodge, feint→don't attack), stamina costs, flee.
Deaths (Restore/Restart, "Thank you for playing The Long Winter. Try not to do that again."): stovepipe, downed wire (Tinker can detect it instead), mystery can, raider, starvation.

## Acts 1–9 (from RPG v13 MAIN_ACTS; skeleton in story.js)
1 Cambridge Road · 2 The Signal (Cyndal's radio, 147.3, Augusta) · 3 Jack Ready's Bunker (trust 30) · 4 The Kennebec (Skowhegan, Marcel) · 5 The Collector (3 lieutenants) · 6 The Grok's Woods (supply depot) · 7 Choices (unite / deal / alone) · 8 Siege of Harmony · 9 The Long Winter. Endings: union, deal, alone, fallen (+ a class epilogue line in town).

## Quest mapping (main-game quest → town role)
Town-local progress lives in `questFlags['harmony.<id>']`; `story.*` is read-only.

| main id (source) | name | RPG giver | town role | town stages |
|---|---|---|---|---|
| `snow` (engine.ts) | First Snow | Justin | Sarah asks; woodpile → house → Sarah (player is Justin here) | given, wood, done |
| `dog` (quests10 q.dog 0–4) | Lost Dog | Loki | Loki starts; Mira points past the orchard; marker `farm`; Goose found → Loki. Reads `story.gooseFound` | ranOff, tracks, found, done |
| `radio` (quests10) | Cyndal's Radio | Cyndal | Cyndal starts; Hal sells the 6V6 tube (or Speech); marker `lowell` for the other parts | offered, tube, done |
| `meds` (quests11) | Medicine Run | Mira | Mira offers in Harmony; marker `skow`; hand-in after the trip | offered, away, returned, done |
| `school` (quests11) | School Days | Sarah | Sarah offers; step 1 "clear the Harmony school" is the squatter encounter | offered, cleared |
| `bike` (quests11) | Bike Parts | Justin | step 1 "look over the bike by the barn" as the stuck barn-door class puzzle | seen, looked |
| `garden` (quests11) | Mira's Garden | Mira | mentioned only | heard |
| `sick` (quests11) | The Sick Neighbor | Sarah | mentioned only | heard |
| raid night (engine, v113 raid1/raid5) | Raid Nights | — | Sarah warns | warned |
| `seed`, `ferry`, `moose`, `mill`, `ice`, `fuel`, `grok`, `bridge`, `caches`, `light`, `wolves` | — | — | main game only (listed in `STORY.mainOnly`) | — |

Removed invented quests: saltRun → Medicine Run, firstChores → First Snow, shed → Bike Parts step 1, raider scout → School Days step 1, Mira's Letters → Mira's Garden / Medicine Run.

**RPG side, to make this two-way:** (1) send main quest stages as `story.q10.<id>` / `story.q11.<id>` / `story.snow` / `story.act` / `story.raids` (today only `story.stage`, `story.gooseFound`, `story.day`, `story.seen.*` are sent); (2) on return, map `harmony.<id>` flags to its own state (e.g. `harmony.meds:'away'` → Q11 meds s=1, `harmony.dog:'tracks'` → q10.dog=2, `harmony.school:'cleared'` → school step 1 done, `harmony.radioTube` → parts[0]=true, `harmony.firstSnow:'done'` → snow=2); (3) add `lowell`, `farm`, `skow` marker targets (already valid). Note the RPG has Justin as an NPC quest giver; in town Justin is the player, so his lines go to Sarah.

## Town protocol v1 (/workspace/maine-rpg/v11/TOWN_PROTOCOL.md)
- On boot: `postMessage({type:'ready',town:'harmony'},'*')`; accepts `enterTown` only from `window.parent`, many times, latest wins.
- State in: inventory (full pack), hp/maxHp, injuries object, companions (read-only), questFlags (`harmony.*` = ours, others kept read-only), day/time, extra `{cls,score,stats,save}`. If extra has no class → class select.
- Also accepted: `index.html?state=<base64 JSON>`, `localStorage['mainerpg.handoff']` (standalone).
- Out: `{type:'leaveTown',exit,state}` + `{type:'town-exit',exit,state}`; exits `worldmap` / `farm` / etc. Same JSON + `exit` written to `localStorage['mainerpg.handoff']`. Quest markers: `harmony-meds`→`skow`, `harmony-dog`→`farm`, `harmony-radio`→`lowell`.
- Medicine Run can be handed in once the day advanced or the last exit was `skow`; Lost Dog moves to found when `story.gooseFound` is true.
- Standalone: stub world map (SVG) with markers; travel to Skowhegan (meds) / the farm (dog tracks) resolves quests.

## Character system (shared with the Maine RPG) — `shared/character.js`
One plain-JS file (`window.CHARACTER` / `module.exports`) both games can load.
- **Stats = the RPG's own attributes, same keys**: `strength, vigor, endurance, intellect, perception, luck` (RPG `player.*`, start 1 + creation bonus) and `agility, grit` (RPG v13 `w13.core`; v13 "wits" = `intellect`). Range clamped 0–10, default 1.
- **Derived** (mirrors engine.ts): maxHp ≈ max(24, 44 + (vigor−1)·8) + grit·3; maxStamina = 70 + endurance·16 + agility·6; carry = 40 + strength·4.
- **Skills** sit on stats: base = c + Σ stat·weight (RPG skills copy `progress.ts skillScore` exactly), + invested levels (use-based: each use = 1 xp, level-up at 3+lv xp) + class bonus; 0–120. Checks use the RPG curve `chance = clamp(score − dc + 50, 5, 95)`.

| skill id | name | governing stats (weight) | in RPG? |
|---|---|---|---|
| melee | Melee | strength 6, endurance 2 | yes |
| rifle | Rifle | perception 6, luck 2 | yes |
| doctor | Doctor | intellect 5, vigor 2 | yes |
| lock | Lockpick | intellect 4, perception 3 | yes |
| speech | Speech | intellect 5, luck 2 | yes |
| barter | Barter | intellect 4, luck 3 | yes |
| sneak | Sneak | perception 4, luck 3 | yes |
| trail | Trail | perception 3, endurance 3 | yes |
| climbing | Climbing | agility 4, strength 3 | new |
| mechanics | Tinkering | intellect 4, agility 2 | v13 trade skill id |
| electronics | Electronics | intellect 5, perception 2 | new |

Old town names map via `ALIAS`: strength→melee, stealth→sneak, lockpicking→lock, charm→speech, tinkering→mechanics.
- **Classes = starting skill bonuses**: Woodsman melee+15 trail+10 climbing+5; Scrounger sneak/lock/climbing +15; Fixer speech/barter +15; Tinker mechanics/electronics +15, doctor+5. Small stat nudge only when the RPG sent no stats.
- **Handoff**: town reads RPG stats from `enterTown.state.stats` (or `state.core`); if absent uses defaults. Skills/class/score go back in `state.extra` (`{schema:'character/1',cls,score,skills:{id:{lv,xp,score}},stats,save}`).
- **RPG side needs to add**: send `stats:{strength,vigor,endurance,intellect,perception,luck,agility,grit}` in TownState (town.ts doesn't today); optionally read `extra.skills[id].lv` back into `player.invested` for the 8 shared skills, and add `climbing`/`electronics` if wanted.

## Acts 2–5 (playable) — `js/acts.js`
Town-side act = max(`story.act`, local `harmony.act`). Local acts advance: Act 1→2 when First Snow is done and Sarah has warned about raids; 2→3 when the town meeting is held; 3→4 at Jack's maps; 4→5 when you meet Marcel; 5→6 at 3 lieutenants.

| RPG main act / quest | RPG completion rule | town scenes | town flags written | class alternates | deaths |
|---|---|---|---|---|---|
| Act 2 The Signal (`main.flags.signal`) | Cyndal "what's on the radio?" | `loft` (farm loft window), `meeting` (Harmony church) | `harmony.signal` asked→heard→debated, `harmony.antenna` (climb/mast/dipole/loki), `harmony.signalVerdict` trap\|split, `harmony.signalHow` | antenna: Climbing / Melee / Electronics / Speech; meeting: Speech / Electronics / Trail / Sneak / Barter | battery, plate (350 V), coffee, augusta |
| Act 3 Jack Ready's Bunker (`jackTalk` + `loyal.jack>=30`) | talk Jack with loyalty 30 | `bunkerOut`, `bunkerIn` | `harmony.jack` marker→met→inside→maps, `harmony.jackTrust` (number, town-earned total), `harmony.jackMaps` | tripwires: Sneak / Trail / Electronics / Speech; favor: fix generator (Tinkering/Electronics) or split wood (Melee); radio talk (Electronics/Speech) | mat, button (bees), mre |
| Act 4 The Kennebec (`main.flags.marcel`) | talk Marcel in Skowhegan | `bridge` (Fur & Mask), `marcel` | `harmony.marcel` go→met→briefed, `harmony.bridge` fur-down\|bribed\|talked\|climbed\|snuck\|siren | fight Fur (QfG), toll (jerky/medkit), Speech, Barter, Climbing (girders), Sneak (ice), Electronics (siren) | swim, ice, mask, fur |
| Kennebec Crossing (q10 `ferry` 0–3) | planks, rope, winch → fixed | `river` | `harmony.ferry` given→fixed, `harmony.ferryPlanks/Rope/Winch` | winch: Tinkering / Melee / Lockpick; rope = 2 cloth | (swim, ice) |
| Act 5 The Collector (`main.ltKills>=3`) | 3 lieutenants down | `camp_gravel` (Saw), `camp_holeb` (Hole), `camp_mill` (Mask), Collector in `harmony` | `harmony.ltGravel/ltHoleb/ltMill` down\|gone, `harmony.collector` stalled\|paid\|fooled\|hid\|listened, `harmony.freed.<scene>`, `harmony.prisoners` (number) | each lieutenant: fight (QfG), Sneak, Speech, Electronics (flare), Melee (tree), Goose; cage: Lockpick / Melee / bribe | campfire, chair, collector, boss (fight) |

QfG fights: `startFight(cfg)` with readable patterns (jab→block, heavy→dodge, feint→don't swing): Squatter, Fur (heavy, fast), Saw (fast jabs), Hole (slow, huge hits), Mask (feints). All are avoidable.

## Scene entries (for the RPG)
- `enterTown.town` (or `?town=`): `harmony`→harmony, `bunker`→bunkerOut, `kennebec`→river, `skow`→bridge, `raiders`→camp_gravel, `north`→camp_holeb. `camp_mill` is reached from Marcel's store (east exit).
- Or `enterTown.state.scene` / `?scene=<sceneId>` for any scene id in SCENES.
- Every scene outside Harmony has a bottom exit `leaveTown` with `exit:'worldmap'`.
- startQuest markers: `harmony-jack`→`bunker`, `harmony-marcel`→`skow`, `harmony-ferry`→`kennebec`, `harmony-lt-gravel`→`raiders`, `harmony-lt-holeb`→`north`, `harmony-lt-mill`→`skow`, `harmony-depot`→`north` (plus Act 1's `harmony-dog`, `harmony-radio`, `harmony-meds`).

## Acts 6–7 — `js/acts67.js`
| RPG | town | flags | class/skill options | deaths |
|---|---|---|---|---|
| Act 6 The Grok's Woods (`grokPath`, `depot`) + Q11 grok, wolves | `grokwoods`, `depot` | `harmony.grok` tracks→dead\|snuck\|friend\|tricked, `harmony.grokFriend`, `harmony.grokClaw`, `harmony.wolves`, `harmony.depotGuard`, `harmony.depot` found→shared\|taken\|burned, `harmony.ledger`, `harmony.depotMeds` | Grok: fight (hp 150, slow heavy pattern), Sneak, befriend with apples/meat + Speech, class trick (Tinker noisemaker / Woodsman felled tree / Scrounger decoy coat / Fixer pantomime), Goose; scrape: Trail; wolves: fight or Trail; guard: fight/Sneak/Speech | flowage, grokhug, grokpoke, grokfight, match, ether |
| Act 7 Choices (`main.choice`) | `kitchen` | `harmony.choice` unite\|deal\|alone, `harmony.family` stay\|north, `harmony.support`, `harmony.uniteHow`, `harmony.dealTerms` | family talks (needed); unite if support ≥4, else class rally (Speech / Melee militia / Electronics radio net / Sneak caches); deal: Barter haggles | calmdown, stove, contract |
Support comes from: the signal ruled a trap, the ledger, freed prisoners, depot shared (+2), Medicine Run done, school cleared, Jack's maps, not paying the Collector, a friendly Grok.
