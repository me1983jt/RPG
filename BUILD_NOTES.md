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

## v15.10.12 (Oct 29)
- APK smoke test fix: the not-yet-drawn Hollowed kind sheets are no longer preloaded (404s). When Build delivers
  v2/hollowed-{bloated,runner,elite}-walk.png, add them to the sprite list in engine.ts (comment marks the spot).

## v15.10.13 (Oct 29) — phone startup crash fix
- Cause (most likely; no JS errors in desktop/phone-emulated runs): memory/GPU pressure right after the menu opens.
  All ~600 sheets (~680 MB decoded) were decoded and soft-edged at once, every sprite stayed in a CPU-backed
  willReadFrequently canvas (re-uploaded to the GPU on every draw), and hero.png loaded twice (?v=2072 and ?v=ART_V).
  Fix: sprites are copied into plain GPU canvases and the work canvas freed; image loading is bounded (3 at a time
  on phones, 8 on desktop); the pack-screen hero uses ART_V.
- Armor overlays: only chest and head use the old overlay sheets; they are scaled to the body's figure height and
  stood on its foot line (fits the v2 Justin body). Legs/feet/hands wait for Build's redraw.

## v15.10.14 (Oct 29) — landscape only, full screen
- Landscape is a hard standard: APK locked to sensorLandscape (apk-kit/patch_android.py); PWA manifest orientation
  landscape + display fullscreen; touch devices held in portrait get a "Turn your phone sideways" cover over the game
  and any town iframe; first touch requests full screen + landscape lock in browsers. Town iframe allows fullscreen.
- Very short landscape phones (<= 400 px tall) shrink the HUD so nothing falls off the bottom (checked 740x360, 915x412, 1280x800).
- Quest note: towns are covered by the main shell's lock; their own pages should also assume landscape in their next pass.

## v15.13.0 (Nov 2) — Maine Seven, two-sided traits, tagged skills, Maine perks
- New game: 3 steps. Trade -> The Maine Seven (Back, Eye, Wind, Neighborly, Know-how, Quick, Fortune; start 5, 5-point pool, 1..10,
  lower one to raise another) -> up to 2 traits (each + and -) and 3 tagged skills (+15, invested points count double).
- Rules in src/game/v1513.ts (fx1513). Engine hooks search "fx15(": fx13 (carry, health, stamina, crit, gun aim, prices, talk, sickness),
  refreshGear (armor, melee), tbApMax (AP), tbStart (Sequence), tbChance (aim + Woodsman in trees), crits, loot luck, skill points/level, heals.
  The Maine Seven also fold into the old six stats + agility at creation (round((v-5)/2)), so skill scores move with them.
- Perks: one per 3 levels from 12 Maine perks (level + Maine Seven needs); old skill-based perks on old saves keep working.
- Save: data.m7, data.traits2. Old saves load as all 5 / no traits (no change). Town hand-off keeps the new perk ids.
- Test: scripts/v1513-shots.mjs (12 PASS), v15-test ALL PASS (v4-lib begin() updated for the new creation). Shots: shots/v1513/.

## v15.13.1 (Nov 2) — stat display names
- The Seven renamed (display only): Might (MT), Vigilance (VG), Vigor (VR), Influence (IN), Cunning (CN), Nimble (NB), Fortune (FT).
  Internal ids / save keys unchanged: back, eye, wind, neighborly, knowhow, quick, fortune (data.m7). Header "The Seven".

## v15.13.2 (Nov 2) — Build art merge (build-art-v15.12.3/.4/.5)
- v2/player-walk.png = Build's hero-walk (14x6, 88x124 cells; v15.12.4). The old v2/justin-walk stays as the fallback (plImg uses player-* first).
  Standing and running also use player-walk (frame 0 / walk) so the body and new overlays share one grid; gun/axe/hit poses stay on the old justin-* sheets.
  player-walk is not coat-dyed (the dye blackened its face). Feet re-measured on its 6 rows (it was measured as 4 rows elsewhere and floated).
- overlay/boots, gloves, trousers = v15.12.5 (14x6 walk grid); boots 7 / trousers 2 stray specks (<4 px) removed. NEW_OVERLAYS in armorLayerNames
  lets these legs/feet/hands overlays draw; an overlay the same size as the body draws with the body's own transform; N/S facing swap matches blit().
  Old overlays kept in /workspace/maine-rpg/gb-intake/v15132/backup-old/.
- Hollowed kinds (v141.ts): logger (30 hp, 8 atk, slow), icefisher (24/6), farmer (16/5, quick); sheets v2/hollowed-{logger,icefisher,farmer}-walk
  (logger/icefisher from .5, farmer from .4), listed in optional.json; figFamily/figScale handle the 6-row sheets.
- Goose: biscuit-goose-sheet (v15.12.3) cut to v2/biscuit-walk.png (6 run frames x 6 hex rows) + v2/biscuit-idle.png; drawn at 84.
- HUD: hud/btn-talk.png and hud/hud-journal.png replace the Talk and Journal cells of the bar icon strip.
- Rejected: v2/props/notice-board.png (v15.12.3) is a cook pot, not a notice board.
- Character panel: the old "Vigor" stat (key vigor) is shown as "Health".
- Test: scripts/v15132-shots.mjs 6 PASS; v15-test ALL PASS; v1513-shots PASS. ART_V 2077.

## v15.13.3 (Nov 2) — Build-Redo-3 gun poses, painted weapon icons, Build props
- New sheets (new files only; no existing sprite changed): v2/player-rifle-aim (1x6), v2/player-rifle-fire (4x6: aim, kick, recoil, settle),
  v2/player-pistol-aim (1x6). 132x186 cells, rows NE E SE SW W NW, feet y=181; listed in ART_SCALED (132 px cells) and optional.json.
  paintPlayerBody -> newPose(): carbine family (carbines, lever guns, scoped) and scatter (shotguns) hold rifle-aim and fire rifle-fire;
  revolver holds pistol-aim and fires from it with fx-muzzle at the measured barrel tip (POSE_TIP15). Melee and Sarah unchanged.
  Drawn at the walk's figure height (newPoseScale = figSpan(walk)/figSpan(pose)). Armor overlays (boots/gloves/trousers, old chest/head)
  are cut for the walk grid and float off these poses, so they are hidden only while a gun pose is shown.
- Item icons: items/v15133/<name>.png (Build Redo-1/2, painted) via ICON15 in itemIcon(); old icons stay on disk. rifle-bolt: 1 px speck cleared.
  carbine* -> rifle-bolt, levergun/winchester -> carbine-lever, scoped -> rifle-scoped, shotgun -> shotgun-pump, scatter -> shotgun-double,
  knives -> knife-hunting, hatchet -> hatchet, hatchet-std/good + hudson -> axe-felling. pistol-semi has no item yet.
- Props: v2/props/{boulder,rusty-barrel,supply-crate,burnt-campfire,sandbags,rain-barrel,fallen-log} as prop skins drawn at hero scale
  (art height x FIG_ADULT/66). Placed (new worlds only): Ashwell (fallen-log, rusty-barrel, boulder, rain-barrel, supply-crate),
  Skowhegan (some gorge boulders, rusty-barrel, supply-crate, sandbag line as hop-over fence, burnt campfire, rain barrel).
- Test: scripts/v15133-shots.mjs 9 PASS (hooks holdAim15, bagSet15, props15). ART_V 2078.

## v15.13.4 (Nov 2) — old-school character creation, Justin/Sarah premades, phone speed, smaller APK
- New game opens on three cards: Justin, Sarah, Make your own (portrait slot, short Harmony bio, Maine Seven, tags, trait, perk, gear;
  Take / Modify / Create). Old trade/class list, backstory, cloth/hair/coat/hat pickers are gone (src/components/CharCreate.tsx).
- One character sheet: name, age, sex; the Maine Seven with -/+ and Points Left; derived stats (Hit Points, Armor, Action Points,
  Carry Weight, Melee Damage, Sequence, Healing Rate, Critical Chance); skills with % (tag exactly 3, +15); up to 2 traits;
  a description panel for whatever you tap; Done / Cancel. Worn-paper sheet on a red plaid board.
- Skills shown as Rifles (rifle), Repair (mechanics), Foraging (trail); ids and saves unchanged.
- Justin: hunter kit + 14 shells + Mechanic's toolkit (new item "toolkit") + wire; MT7 VR7 NB7 FT6; tags Rifles/Repair/Sneak;
  trait Army Vet (+10 aim, +1 AP / heals 15% slower); perk Field Fix (use the toolkit from the pack: repairs worn gear anywhere for
  half the bench iron). Starts outside Pittsfield; first job "pittsfield-handcar" marker. Mechanic asides when he meets someone.
- Sarah: medic kit + dandelion tea, spruce tonic, berries, medicine, syrup, maple tins, a pelt; VG7 IN8 CN7; tags Foraging/Speech/
  Barter; trait Green Thumb (heals +30%, +10 Foraging / -2 melee dmg, -5 Melee); perk Farm Friend (+8 barter). Starts at Harmony;
  first job "skowhegan-meds". Plant-lore asides.
- Make your own: background (Logger, Lobsterman, Mechanic, Farmer, Hunter, Townie: +1 stat and a small item), start town
  (Harmony/Pittsfield), sex -> body slot generic_male/generic_female (no sheets yet: falls back to the Justin/Sarah hero sheet),
  coat color (the 4 existing coat dyes), Random. Signature perks are level 99 (never offered) and don't use a perk slot.
- Justin / Sarah as companions: whichever one you are not playing stands near their town (Justin: Pittsfield, Sarah: Harmony) with a
  recruit talk and their existing town job. Only one of them can be in the party; recruiting the other sends the first back.
  Save: data.hero15134 {premade, age, sex, body, tint, asides}; party.rc15134. story.m7 / story.traits / story.player unchanged.
- Phone speed / battery: hard frame cap now applies at 60 too (90/120 Hz phones were drawing 90-120 fps); title/creation screen idles
  at ~12 fps; background (visibilitychange) stops the frame loop and suspends music + sound, and resumes without a catch-up jump.
- APK size: scripts/copy-town.mjs drops Harmony's ~77 MB of unused concept PNGs in img/scenes (its loader only asks for <id>.jpg);
  v2/backup removed. Tests: scripts/v15134-shots.mjs, scripts/rc15134-test.mjs, scripts/perf15134.mjs; v4-lib begin() uses the new sheet.
- Follow-up (same release): the five town games carried ~37 MB of byte-identical art in the APK. copy-town.mjs now stores each
  image shared by 2+ towns once in public/towns/_shared/<hash>.<ext> and puts a small shim first in each town's index.html that
  maps the old relative img path to it (Image/img src only; anything named in .css/.html is left in place). Quest sources untouched.
  Check: scripts/towns15134-check.mjs (all 5 towns, 0 404s on a static server); towns15106-test ALL PASS; v15-test ALL PASS.
- Measured (844x390, Chrome, dev server): title/creation screen 60 -> 12 fps; background tab 51-68 -> 0 frames in 3 s;
  in-play render time unchanged within noise (4x CPU throttle: 15-22 fps both before and after).

## RPG v0.3 (Nov 2) — versionCode 26110213
- Towns pulled from GitHub me1983jt/quest-rpg-towns @ b5ac556 ("Story update v1.10.5 + strict ammo rule"): all five towns + shared-rules.
  The repo matched the local /workspace/quest-* folders file-for-file, so the town files are the same as in v0.2.
- townStory.ts STORY_KEYS: added story.cameo.gus.warned, story.cameo.mira.state, story.cameo.mira.route, story.cameo.mira.hideoutRevealed.
- Start-screen version line 0.3. No sprite, save-key or orientation change. Smoke: scripts/_v03smoke.mjs, shots/v03/.

## RPG v0.4 (Nov 5) — versionCode 26110501
- Towns pulled from GitHub me1983jt/quest-rpg-towns @ 1496b25 ("Add quest-ashfall town"): harmony, pittsfield, skowhegan, greenville, castle, ashfall + shared-rules.
  scripts/copy-town.mjs now copies quest-ashfall into public/towns/ashfall when present (stub otherwise).
- Lag trims (remaining from Justin's approved list; v0.2 already did 0.7x scale / 30fps / night light stamp):
  - Pause offscreen NPCs (folk AI) + tighter animal AI radius in Low graphics; fewer weather/farm particles.
  - Fade / see-through checks only for props and town houses near the hero.
  - Low graphics auto-on when Android power-save is on (MaineRpgNative.isPowerSaveMode via apk-kit/patch_android.py); Options "Low graphics" still overrides (maine-rpg-perf). Documented on the pause menu.
  - Sprite-sheet split / on-demand load: skipped (core+lazy already load bosses/atk/death; further splitting risks art).
- No sprite changes. Landscape fullscreen unchanged. story.* / story.cameo.* keys unchanged. Story features (farm opening, raids, Mira, guards) skipped.
- Smoke: scripts/_v04smoke.mjs, shots/v04/. APK RPG-v0.4.apk.
