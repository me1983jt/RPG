# Rough Town Blockouts — Pass 1
Date: 2026-11-26
Status: layout blueprint only; not native .MAP implementation.

Full editable planning sheet: https://docs.google.com/document/d/17QmvNU79MQ3ORjJFycYJ_wShgPtizuLDGEIQKAK3AV4/edit

## Scope
Initial blockout coverage:
- Fort Kent: 4 maps (2 town sections, forest/tunnel approach, compact underground Brotherhood base)
- Skowhegan: 2 maps (downtown/barracks; Kennebec river/bridge/sawmill)
- Waterville: 3 maps (Augusta downtown; industrial/gang district; mixed residential)
- Old Orchard Beach: 2 maps (two connected beachside gambling/crime-district sections; further lore intentionally deferred)
- York: 5-map design target
- Kittery: 3-map design target
- Ogunquit: 1 compact coastal map
- Portland: 4 connected downtown/waterfront maps

## Construction rules
- Fallout 2 full-scale isometric geometry, not miniature or icon-based buildings.
- Build connected ground/floors, wall segments, door openings, roof visibility, entrances/exits and collision.
- Empty shells only in this pass: no furniture, loot, containers, NPCs, quests or shop scripts.
- Keep the original 22-town world-map roster; no new towns or markers.
- Preserve Alpha 27 and existing checkpoints. Keep original commercial game data private and out of GitHub.
- Verify native map IDs and prototype/art IDs before writing native map data. Never guess IDs.
- Exact map tile coordinates and native .MAP changes are not yet made or verified.

## First implementation gate
Audit the current York/Kittery native map assets and IDs. Verify one test building block in the native engine: walkable floor, connected walls, doorway, roof hiding and collision. Only after that passes should the validated construction method be expanded to complete town maps.

## Known blocker
The current York Alpha 30 playtest has known entrance/exit, automap-count and map-name registration defects, and the interior maps are not yet proper built interiors. Resolve/audit those issues before reusing or overwriting those map IDs.
