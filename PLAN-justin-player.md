# Plan (not done yet): Justin becomes the main player again, the custom player becomes a villager

No art or code is changed for this in v14.3. What it needs:
1. Player body: `plImg()` in engine.ts tries `v2/player-<act>` first, then `v2/justin-<act>`. Today there are
   no `player-*` sheets in v11, so the player already draws with Justin's sheets. Make it explicit (Justin first,
   and drop the `player-*` lookup or point it at the villager), so imported `player-*` art can't take over.
2. Justin NPC: he's also an NPC (`npc("justin")`, `V2_WHO.justin`, `role === "justin"`, the quest giver at the
   Cambridge Road farm). With Justin as the player, retire the Justin NPC: move his dialogue and quests
   (openD13/v14Talk paths that check `role === "justin"`, `nearestNpc` priority, the start quest "talk to
   Justin at the Cambridge Road farm", radio and raid lines that name him) to another NPC or to inner monologue.
   Remove or rewrite lines that talk about "Justin and Sarah" in third person (e.g. the raid warning in `wmAwayRaid`).
3. Family: Sarah, Cyndal, Loki and Goose become the player's family in text (they already are the farm household).
4. Custom player -> villager: add a villager NPC (e.g. `npc-<name>` or a `v2/<name>-*` family in `V2_FOLK`,
   `V2_WHO`, the height table, `FIG_ADULT`) that uses the custom player look once clean `player-*` sheets exist
   (short black hair, stubble, gray plaid flannel, dark jeans). Give them a home spot in Harmony or the village.
5. New-game flow: the title screen character choice/preview (`CharacterPreview`, role picker) should show
   Justin; roles stay as skills, not looks. Old saves: keep working (player body is chosen at draw time, no save change).
6. Paper doll armor (`v2/armor/man/*`) already fits the man body, so it carries over.
7. Tests to update: pt141 lineup (heights list), hero-test, any test that talks to the Justin NPC (lr141, v14-test).
