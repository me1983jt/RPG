# Notes for Grok Build

## Who does what
- **Grok Build:** art only. That means sprites, terrain, buildings, items, icons, portraits and armor layers. Deliver them as PNGs in a small zip under 100 MB, one zip per task. Never write, change or send back code, quests, dialogue or story. If something needs code, put it in a `notes.txt` inside the zip.
- **RPG:** engine, the main world, combat, putting art into the game, and builds.
- **Quest RPG:** town scenes (in `quest-harmony/`) and all quests, dialogue and story.

## Base
- Start from the newest tag, `v15` (Quest-Master-RPG-v15.zip).
- Throw out older workspace copies.

## Zips RPG is waiting for
1. terrain-repaint: painted Baldur's Gate/Fallout-style ground, winding rivers and streams, dense mixed forest, boulders and hills. The hex grid stays. See `TERRAIN_SPEC.md`.
2. town-markers: simple house-cluster markers for each town.
3. batch1-fix: redo the failed batch 1 art. Cyndal has blonde hair and wears a long red dress.
4. armor-fix: paper-doll armor layers.
5. enemies-fix
6. batch2

## Rules
- Change only what's asked.
- Never alter existing sprites.
- Keep sheet layouts the same.
- No photos.

## Terrain update (Oct 22, 2026)
For the new terrain rules (no square ground; realistic dirt and paved roads with pebbles, cracks and graffiti spots; worn patchy grass; few repeats; scaled to the larger characters), see "Justin's additions" in `TERRAIN_SPEC.md`.

## v15.10.9 (Oct 29)
Pulled Quest RPG's latest five towns (NPC walk cycles for 30/31 NPCs, Justin walk L/R/turn/crouch-pickup, Goose trot, raccoon walk, Sarah farm sit) with npm run town. No RPG code change.

## v15.10.10 (Oct 29) — main RPG only (no new Quest town pull; towns stay at the v15.10.9 copies)
- Grok Build art merged (non-Sarah, files that open): v2/bedroll.png drawn beside every campfire (6 ft); v2/weapon-slot.png as the rusty weapon-slot frame.
  Build files btn-talk, hud-journal and notice-board are corrupt PNGs in Drive; cook-pot/trail-marker/hud-stats look mislabeled — not used.
- Phone speed: weak phones (<=4 cores or <=3 GB) start at 30 fps and a lower render scale; any phone with no saved cap drops to 30 fps
  after ~4 s under 40 fps; Low graphics caps weather particles at 35 on weak phones. Pause menu "Performance mode" renamed
  "Low graphics (phone speed)". How to: tap Pause (bottom name panel) -> "Frame rate cap: 60 fps" to switch to 30; "Low graphics (phone speed)" On.

## v15.10.11 (Oct 29) — armor shows on Justin, the Hollowed kinds
- Paper doll fix: the in-world hero is drawn from the v2 player sheets, but armor only looked for v2/armor/* layers
  (none exist), so overlay/<item>.png was never drawn. Now each worn piece (and the back slot) falls back to its
  overlay sheet, on the body's facing, with the frame mapped to the same share of the cycle and the body's foot line.
  A second function named paintOverlays (prop windows) was shadowing the old hero overlay painter; renamed.
  Pack-screen portraits now show for every worn piece the figure did not draw. ART_V 2076.
- The Hollowed: name still in src/game/v141.ts HOLLOWED (one spot). New HOLLOW_KINDS there: walker, Bloated (slow, tough),
  Gaunt runner (fast, frail), Old (elite, maps 3+). Optional sheets v2/hollowed-{bloated,runner,elite}-walk.png are
  picked up when Build delivers them; until then all use v2/hollowed-walk.
