# Town layer protocol v1 (Maine RPG v14.3)

The RPG opens a town as a full-screen same-origin iframe when the player enters its world-map hex
(Harmony village, hex q4 r4). Default src: `/towns/harmony/index.html`; at dev/build time
`scripts/copy-town.mjs` copies `/workspace/long-winter-demo/harmony.html` (or `$TOWN_HARMONY_SRC`, a file
or a folder; sibling files in the same folder come along) to `public/towns/harmony/index.html`, else the stub
`towns-stub/harmony.html`. Test override: `window.__townSrc = "url"` or `{ harmony: "url" }`.

All messages are plain objects sent with `postMessage(msg, "*")`. The RPG only accepts messages whose
`event.source` is the town iframe's window; the town should only accept messages from `window.parent`.

## Town -> RPG
1. `{ type: "ready", town: "harmony" }`: optional; send on startup. The RPG (re)sends `enterTown`.
   The RPG also sends `enterTown` on the iframe's `load` event, so the town must accept it more than once
   (use the latest one).
2. `{ type: "leaveTown", exit, state }`: closes the town layer.
   - `exit`: `"worldmap"` (default; back on the world map on the town's hex) or a world-map location id
     to walk straight into: `"farm"` (Cambridge Road farm), `"lowell"`, `"skow"`, `"kennebec"`, `"north"`,
     `"raiders"`, `"bunker"`. Unknown exits act as `"worldmap"`.
   - `state`: a (partial) TownState, see below. Every field is optional; a missing or malformed field leaves
     the RPG's value unchanged.
3. `{ type: "startQuest", id, target, label? }`: adds or replaces (same `id`) a gold quest marker on the world map.
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
  (`story.stage`, `story.gooseFound`, `story.day`) and are read-only; use your own prefix, e.g. `harmony.*`.
- `extra`: replaces the saved extra for that town.
- The RPG saves the game right after `leaveTown` and `startQuest`.
