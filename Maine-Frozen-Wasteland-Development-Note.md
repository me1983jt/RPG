# Maine: The Frozen Wasteland — Development note (2026-11-24)

Handoff archive: Maine-Frozen-Wasteland-Grok-Ready.zip. Read START-HERE.md and BUILD-INSTRUCTIONS.md inside it. Recorded prototype tests: 3/3 passed. Native integration and playable testing remain pending; APK later.

Use https://github.com/alexbatalov/fallout2-ce as the engine, the York-fixed Maine mod as the baseline, and port selected mechanics from this RPG repository and Maine Quest. Do not replace the engine. Preserve the original Maine story, timeline, maps, inventory and journal. Start in York; reaching Harmony completes chapter one and unlocks new regions.

## Confirmed scope
40 SPECIAL points, level cap 50, skills capped at 200%, six backgrounds, twelve professions, up to three professions, five ranks, practice/XP/training. Three competing York factions, multiple passage routes, persistent consequences, NPC schedules and migration, relationships and companions. Permanent winter, regional weather, survival, economy and shortages, multiple currencies, businesses, housing, motorized bicycles, cars, trucks and snowmobiles. Modular sprites and visible equipment, classic and modern mobile layouts, offline Android.

## Next steps
1. Verify engine version and real map/script IDs; run prototype tests.
2. Implement York new-game hook and migrate farm initialization.
3. Bind character rules and versioned saves to native engine state; harden save validation.
4. Integrate quests, NPCs, clock, economy, survival, housing and vehicles.
5. Implement missing graphics and mobile controls.
6. Test real York-to-Harmony gameplay and save/reload before APK compilation.

Prototype values and route IDs are provisional. Commercial Fallout data must be supplied locally and must not be published. This note is not a claim of completed engine integration.
