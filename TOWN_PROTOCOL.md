# Town layer protocol v1 (Maine RPG v14.6)

The RPG opens a town as a full-screen same-origin iframe when the player walks into its marker in the
isometric world (Harmony village: a cluster of houses beside the road, a short walk from the Cambridge Road
farm, on the farm map). The game is paused while the town is open. Default src: `/towns/harmony/index.html`;
at dev/build time `scripts/copy-town.mjs` copies the folder `/workspace/quest-harmony` (or `$TOWN_HARMONY_SRC`,
a file or a folder with index.html or harmony.html) to `public/towns/harmony/`, else the stub
`towns-stub/harmony.html`. The source folder is only read. Test override: `window.__townSrc = "url"` or `{ harmony: "url" }`.

All messages are plain objects sent with `postMessage(msg, "*")`. The RPG only accepts messages whose
`event.source` is the town iframe's window; the town should only accept messages from `window.parent`.

## Town -> RPG
1. `{ type: "ready", town: "harmony" }`: optional; send on startup. The RPG (re)sends `enterTown`.
   The RPG also sends `enterTown` on the iframe's `load` event, so the town must accept it more than once
   (use the latest one).
2. `{ type: "leaveTown", exit, state }`: closes the town layer.
   - `exit`: omitted, `"town"` or `"worldmap"` (all the same, the default): back in the iso world on the road
     beside the town marker. Or a location id to go straight there: `"farm"` (by the farmhouse),
     `"lowell"`, `"skow"`, `"kennebec"`, `"north"`, `"raiders"`, `"bunker"`. Unknown exits act as the default.
   - `state`: a (partial) TownState, see below. Every field is optional; a missing or malformed field leaves
     the RPG's value unchanged.
3. `{ type: "startQuest", id, target, label? }`: adds or replaces (same `id`) a town quest. In the iso world a gold
   arrow at the screen edge points to the exit toward the target (with the label), or "you're here" on its map;
   the old hex map shows a gold marker too.
   - `id`: non-empty string, e.g. `"harmony-mail"`.
   - `target`: a location id (as above) or loot-run id (`"gas"`, `"camp"`, `"truck"`), or `{ q, r }` with
     integer q 0-11, r 0-8. Anything else is refused.
   - `label`: shown on the map (max 40 chars); defaults to `id`.

## RPG -> Town
`{ type: "enterTown", protocol: 1, town: "harmony", state: TownState }`

## TownState
```
{
  inventory: [{ id: string, qty: number, name?: string }],  // the whole pack; name is sent, ignored on return
  hp: number, maxHp: number,                             // maxHp is read-only
  injuries: { blinded: boolean, crippledArm: boolean, crippledLeg: boolean },
  companions: [{ id: "cyndal"|"loki"|"goose", name: string, withYou: boolean }],   // read-only
  questFlags: { [key: string]: string | number | boolean },
  stats: { strength, vigor, endurance, intellect, perception, luck, agility, grit },  // numbers, read-only (v14.5)
  day: number,        // 1-based game day, read-only
  time: string,       // "HH:MM", read-only
  extra: { ... }      // the town game's own stats/score; any JSON object, stored per town and sent back next visit ({} the first time)
}
```
Applying a returned state:
- `inventory` is the new full pack: the RPG takes or gives the difference per item id. Unknown ids,
  non-positive or non-numeric qty are dropped; duplicate ids are summed. If the pack is full, extras go on the
  ground or in the farm stash. To remove everything of an item, leave it out of the list.
  Useful ids: `medkit`, `docbag`, `jerky`, `donut`, `cider`, `water`, `meat`, `apple`, `bandage`, `cloth`, `hide`, `junk`.
- `hp`: rounded and clamped to 1..maxHp.
- `injuries`: `false` heals it, `true` inflicts it; omit a key to leave it.
- `questFlags`: merged in (string/number/boolean values only). Keys starting with `story.` are the RPG's
  (`story.stage`, `story.gooseFound`, `story.day`, and `story.seen.<locationId>` for areas visited) and are read-only; use your own prefix, e.g. `harmony.*`.
- `extra`: replaces the saved extra for that town.
- The RPG saves the game right after `leaveTown` and `startQuest`.

v14.5: shots/ and tests/ are not copied in. Quest markers `harmony-salt` and `harmony-lostdog` clear when
`harmony.saltRun` is returned/done or `harmony.lostDog` is found/done (or Goose is found in the RPG).
`extra.skills` is stored and sent back as-is; the RPG doesn't apply town skill levels yet.

v14.6: main-quest stages go out read-only as `story.act`, `story.snow`, `story.raids`, `story.q10.<seed|ferry|dog|radio|moose>`,
`story.q10.radioPart<0-2>`, `story.q11.<questId>` (Q11 step s), plus `story.stage`, `story.gooseFound`, `story.day`, `story.seen.*`.
Returned `harmony.*` flags move our quests forward only (unknown values ignored):
firstSnow given|wood -> snow 1, done -> snow 2; dog ranOff 1, tracks 2, found 3, done 4; radio offered -> radio 1, tube|done (or
`harmony.radioTube: true`) -> radio 1 + part 1; meds away|returned|done -> Medicine Run step 1; school offered -> 1, cleared -> 2;
bike seen -> 1, looked -> 2. Markers `harmony-meds`, `harmony-dog`, `harmony-radio` clear when the town marks them returned/found/done.

## v15.1: three town games (Harmony, Pittsfield, Skowhegan)

`scripts/copy-town.mjs` copies each Quest RPG folder into `public/towns/<id>/` (skipping `shots/`, `tests/`, `*.py`, `node_modules`, `.git`):

| app | source (env override) | entry ids (`enterTown.town`) | RPG markers (`ISO_TOWNS`) |
|---|---|---|---|
| harmony | `/workspace/quest-harmony` (`TOWN_HARMONY_SRC`) | harmony, bunker, kennebec, skow, raiders, north, grokwoods, depot, barnyard, sugarbush (`?scene=`) | as before |
| pittsfield | `/workspace/quest-pittsfield` (`TOWN_PITTSFIELD_SRC`) | pittsfield, coop, depot | `pittsfield` (farm map, south-east of Harmony past the co-op), `pf-coop` (at the Seed Run co-op), `pf-depot` |
| skowhegan | `/workspace/quest-skowhegan` (`TOWN_SKOWHEGAN_SRC`) | skowhegan, hospital, mill, marcelstore | `skowhegan` (map 2, Water St between the hospital and mill), `sk-hospital`, `sk-mill`, `sk-marcel` |

- World map hexes: `pittsfield` (6,7), south-east of Harmony; `skowhegan` (3,6), west/south-west. Tapping one walks you to its marker and opens the town.
- Safe zones: the `pittsfield` and `skowhegan` markers get Harmony's 10-tile no-attack zone; the sub-entries (`sub: true`) do not, so the co-op, hospital and mill fights still happen.
- A marker's `entry` is what the town gets in `enterTown.town` and `?town=`; `pf-depot` sends `depot` to Pittsfield, not Harmony's Collector depot.
- **Flags:** `questFlags` carries every town's flags (`harmony.*`, `pittsfield.*`, `skowhegan.*`) to every town, plus the read-only `story.*`.
- **Extra:** each town still gets its own last `extra` back, with `schema/cls/skills/stats` from the most recent town on top, so the class and skills carry between towns. The full shared copy also rides as `state.sharedExtra`.
- **Bridge:** `leaveTown{exit:'bridge'}` from Skowhegan opens quest-harmony at `town:'skow'` (the bridge crossing) right away.
- **Autosave:** entering or leaving any town writes the autosave (`maine-rpg-save-v2-auto`).
- `startQuest` target `harmony` is an alias for the farm hex.

One-way mappings added:

| town flag | RPG effect |
|---|---|
| `pittsfield.seed` arrived / cleared / found | q10 `seed` 2 / 3 (seedLeft 0) / 4 |
| `skowhegan.meds` found | q11 `meds` at step 4 (back to Mira) |
| `skowhegan.mill` cleared / stripped | q11 `mill` steps 1 / 1+2 done |
| `pittsfield.beaulieu` ally | `main.flags.beaulieu`: +2 siege allies (farmhouse +60 HP) |
| `pittsfield.handcar` running | `main.flags.handcar`: world-map rail hop Pittsfield ↔ Skowhegan (1 hour) |
| `harmony.gooseGuard` true (or `gooseBark` done) | `main.flags.gooseGuard`: raids give 8 s more warning and you act first in turn-based raid fights |
| `harmony.fence` done | `main.flags.fence`: one raider fewer per wave |
| `harmony.gooseTricks` done / `harmony.tricks` | `main.flags.gooseHelps`: when Goose is with you, 30% per foe turn he costs it 2 AP |

Quest markers: `pittsfield-handcar` → `skow` (cleared after your first rail hop), `pittsfield-camp` → `raiders` (cleared when Saw's camp is cleared or visited), `skowhegan-meds` → `harmony` (cleared when `harmony.meds` is returned/done or the Medicine Run is turned in).

Test: `scripts/v151-towns-test.mjs` enters and leaves every town and sub-entry through the real iframe.
