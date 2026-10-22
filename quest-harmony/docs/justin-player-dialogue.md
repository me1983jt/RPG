# Justin as the player: dialogue and narration rewrites

In the merged game **you are Justin**. The RPG (maine-rpg/v11, read-only) still treats Justin as an NPC quest-giver at the Cambridge Road farm and narrates him in third person. This sheet lists every such line with a drop-in replacement.

Rules used:
- **First Snow** is given by **Sarah**. Other Justin quests go to **Sarah** (adult, practical, trader) or **Loki** (kid). Cyndal keeps radio stuff.
- Narration speaks to the player as **you** (Sierra narrator: light, a bit dry, same meaning).
- Family (Sarah, Cyndal, Loki) talk to you as husband/Dad. The dog is **Goose**.
- Since you already live at the farm, "stranger gets taken in" lines become "family, home again" lines.
- "Current line" is the exact string in the source (inner text of the literal, without the surrounding quotes unless shown) so it can be search-replaced. Code-only uses (`role === "justin"`, `npc("justin")`, `COMPANION_NAME`, comments) are not listed; they're covered by PLAN-justin-player.md step 2.

## src/game/content.ts (8)

| File | Line no. | Current line | New line | New speaker |
|---|---|---|---|---|
| content.ts | 56 | `Justin is at the Cambridge Road farm. He wants a word before the snow comes in.` | `Sarah is at the Cambridge Road farm. She wants a word before the snow comes in.` | narration |
| content.ts | 58 | `` Bring Justin ${SNOW_WOOD} armloads of wood for the stove. `` | `` Bring Sarah ${SNOW_WOOD} armloads of wood for the stove. `` | narration |
| content.ts | 60 | `Justin has his wood. Go see Sarah at the farm.` | `The stove has its wood. Go see Sarah in the kitchen.` | narration |
| content.ts | 190 | `Justin. This is our ground on Cambridge Road: the farmhouse, the barn, the orchard, and the sugar maples. First snow is coming in tonight and the stove is down to kindling. Bring me three armloads of wood from the pile by the barn and you've got a place here.` | `There you are. First snow's coming in tonight and the stove's down to kindling. Bring me three armloads off the pile by the barn, would you? Then come inside and get warm.` | Sarah (move from `role === "justin"` branch to Sarah) |
| content.ts | 243 | `You got Justin his wood. Here: hot cider in a tin cup, and cider donuts from the kitchen. The cot under the eave is yours. This farm is your home now. Come back when you're hurt.` | `That's the stove fed. Here: hot cider in a tin cup, and cider donuts from the kitchen. Sit a minute. And come find me when you're hurt, don't be a hero about it.` | Sarah |
| content.ts | 250 | `Sarah. Justin and I run this place. I've got the kitchen and the cider press, and our two kids underfoot. First snow tonight. Help Justin with the wood, then come see me and we'll warm you up.` | `First snow tonight, and the kids are underfoot. Kitchen and press are mine. Wood's yours. Three armloads by the stove, then come see me and I'll warm you up.` | Sarah (choice label `I'll help him` -> `On it`) |
| content.ts | 277 | `Cyndal. I'm thirteen. Justin's my dad, and Loki's my little brother. I can reach the lower limbs on these two rows without a box. The high ones are Dad's. Raid nights I'm lookout from the loft window. I call the waves, then I help Mom with anyone hurt inside.` | `Hi, Dad. I can reach the lower limbs on these two rows without a box now. The high ones are yours. Raid nights I'm lookout from the loft window. I call the waves, then I help Mom with anyone hurt inside.` | Cyndal |
| content.ts | 287 | `Loki. I'm nine. Justin's my dad. I stacked the kindling and fed the hens already. Dad said the press is not a ladder, so I stay in the lane. Why do the apples go brown when you bite them? If they come at night I stay inside with the door barred and bring shells and lanterns to the porch. I don't go out.` | `Dad! I stacked the kindling and fed the hens already. You said the press is not a ladder, so I stay in the lane. Why do the apples go brown when you bite them? If they come at night I stay inside with the door barred and bring shells and lanterns to the porch. I don't go out.` | Loki |

## src/game/quests10.ts (13)

| File | Line no. | Current line | New line | New speaker |
|---|---|---|---|---|
| quests10.ts | 88 | `Justin says the old Kennebec ferry could run again. Talk to him.` | `Sarah thinks the old Kennebec ferry could run again. Talk to her.` | narration |
| quests10.ts | 121 | `Justin wants meat in the shed before the snow gets deep. Ask him about a moose.` | `Sarah wants meat in the shed before the snow gets deep. Ask her about a moose.` | narration |
| quests10.ts | 125 | `You're back with the meat. Tell Justin.` | `You're back with the meat. Tell Sarah.` | narration |
| quests10.ts | 137 | `"Moose Season: tell Justin."` | `"Moose Season: tell Sarah."` | HUD |
| quests10.ts | 161 | `if (role === "justin") {` (moose hand-in branch) | `if (role === "sarah") {` | code: moose giver -> Sarah |
| quests10.ts | 165 | `speaker: "Justin",` | `speaker: "Sarah",` | Sarah |
| quests10.ts | 167 | `Now that's a moose. Must dress out at six hundred pounds. We'll hang the quarters in the shed and I'll stretch the hide on the barn wall. That's the winter handled, ayuh.` | `Now that's a moose. Must dress out at six hundred pounds. Quarters go in the shed, hide goes on the barn wall. That's the winter handled, ayuh.` | Sarah |
| quests10.ts | 190 | `BISCUIT! You found him! He smells like a swamp. Good boy, good boy. Thank you. You can have my maple candy. Don't tell Mom.` | `GOOSE! You found him! He smells like a swamp. Good boy, good boy. Thanks, Dad. You can have my maple candy. Don't tell Mom.` | Loki (not Justin, but wrong dog name + now talking to Dad) |
| quests10.ts | 221 | `speaker: "Justin",` (ferryAsk) | `speaker: "Sarah",` | Sarah |
| quests10.ts | 222 | `The old Kennebec ferry up north of here. It's a cable barge, nothing fancy, but the deck's rotted and the winch is froze. Get me planks from the Lowelltown sawpile, a good coil of rope from the boathouse at Attean, and a winch pawl off that log truck in the ditch east of here. Fix her up and we've got a way into the north woods. Folks say The Grok walks up there. I'd want to know.` | `The old Kennebec ferry up north of here. It's a cable barge, nothing fancy, but the deck's rotted and the winch is froze. Get planks from the Lowelltown sawpile, a good coil of rope from the boathouse at Attean, and a winch pawl off that log truck in the ditch east of here. Fix her up and we've got a way into the north woods. Folks say The Grok walks up there. I'd rather know than wonder.` | Sarah |
| quests10.ts | 226 | `speaker: "Justin",` (mooseAsk; text at 227 fits Sarah unchanged) | `speaker: "Sarah",` | Sarah |
| quests10.ts | 182 | `I'm not allowed to go after him, Dad said.` | `I'm not allowed to go after him, you said so.` | Loki |
| quests10.ts | 232 | `Dad found it in the barn. It's a ham set, like before.` | `You found it in the barn, Dad. It's a ham set, like before.` | Cyndal |

## src/game/quests11.ts (10)

Quest text has no "Justin" name but is spoken by the Justin NPC via `giver: "justin"`; move the giver and fix voice.

| File | Line no. | Current line | New line | New speaker |
|---|---|---|---|---|
| quests11.ts | 149 | `giver: "justin", offer: "Belting off the Skowhegan mill",` | `giver: "sarah", offer: "Belting off the Skowhegan mill",` | Sarah |
| quests11.ts | 158 | `Justin's saw rig howls on the tractor's power take-off.` | `Your saw rig howls on the tractor's power take-off. Music, of a sort.` | narration |
| quests11.ts | 162 | `That's Justin's dad's old motor bicycle, a Whizzer,` | `That's your dad's old motor bicycle, a Whizzer,` | Sarah |
| quests11.ts | 191 | `giver: "justin", offer: "Tractor's near dry",` | `giver: "sarah", offer: "Tractor's near dry",` | Sarah |
| quests11.ts | 217 | `giver: "justin", offer: "Sap's running",` | `giver: "loki", offer: "Sap's running",` | Loki (text 218/225 below) |
| quests11.ts | 218 | `Days are warm and nights are freezing, so the sap's running. Tap the sugar bush out west, haul the buckets to the shack and boil it down. Forty gallon of sap for one of syrup. Keep the fire going after dark, the coyotes come in for the smell.` | `Dad! Days are warm and nights are freezing, so the sap's running! Can we tap the sugar bush out west? You haul the buckets to the shack and boil it down. Mom says it's forty gallons of sap for one of syrup. Keep the fire going after dark, the coyotes come in for the smell.` | Loki |
| quests11.ts | 225 | `Look at that color. That's Grade A, ayuh. Keep two jars and I'll trade the rest down the road for iron.` | `Look at that color! Mom says that's Grade A. She'll keep two jars and trade the rest down the road for iron. Can I lick the spoon?` | Loki |
| quests11.ts | 230 / 243 | `giver: "justin"` (Grok Hunt, Bridge Out) | `giver: "sarah"` | Sarah |
| quests11.ts | 238 | `That's... I'll be. That claw's longer than my hand. Here. My good rifle, and Sarah's had a coat put by for whoever earned it. You did.` | `That's... I'll be. That claw's longer than my hand. Here. Your grandfather's good rifle, cleaned and oiled, and I've had a coat put by for whoever earned it. You did.` | Sarah |
| quests11.ts | 360 | `justin: "Justin",` in `GIVER_NAME` | remove (no quest has giver justin; add `loki: "Loki"`) | code |

(230 and 243 share a row: 11 edits in all.)

## src/game/v13.ts (9)

| File | Line no. | Current line | New line | New speaker |
|---|---|---|---|---|
| v13.ts | 258 | `Fix up the farm with Justin and Sarah, and survive the first raid night.` | `Fix up the farm with Sarah and the kids, and survive the first raid night.` | goal |
| v13.ts | 258 | `\"You'll do. Justin's splitting wood out back. We need the place tight before the snow, and they'll come at night. They always do.\"` | `\"Split wood, mend stakes, kiss your wife. In that order, apparently. We need the place tight before the snow, and they'll come at night. They always do.\"` | Sarah |
| v13.ts | 259 | `Justin doesn't like it.` | `You don't like it. Nobody sounds that rested anymore.` | narration |
| v13.ts | 261 | `intro: ["Justin", "\"If you want answers, Marcel's in Skowhegan. Bridge is the only way across, and somebody's always watching it.\""]` | `intro: ["Sarah", "\"If you want answers, Marcel's in Skowhegan. Bridge is the only way across, and somebody's always watching it. Go careful.\""]` | Sarah |
| v13.ts | 263 | `intro: ["Justin", "\"Only safe road north runs through the Grok's woods. Safe. That's a joke. Take shells.\""]` | `intro: ["Loki", "\"Jack says the only safe road north goes through the Grok's woods. Safe! That's a joke, right? Take lots of shells, Dad.\""]` | Loki |
| v13.ts | 265 | `intro: ["Justin", "\"Lanterns on the road. A wicked lot of them. This is it.\""]` | `intro: ["Cyndal", "\"Dad. Lanterns on the road. A wicked lot of them. This is it.\""]` | Cyndal (lookout) |
| v13.ts | 288 | `justin: "\"Stack the wood on the north side,` (key only; text unchanged) | `sarah: "\"Stack the wood on the north side, it's a windbreak and it's dry. They come at night with torches. They want the hens and the stove more than they want us. Make it cost 'em.\"",` | Sarah |
| v13.ts | 289 | `Dad says the first raid's the worst one` | `You said the first raid's the worst one` | Cyndal |
| v13.ts | 330 | `Justin and Sarah took me in at the Cambridge Road farm. Wood, walls, and a long first night.` | `Home to the Cambridge Road farm before the snow. Wood, walls, and a long first night.` | journal |

Note: `COMPANION_NAME.justin` (163) is code; drop the `justin` companion (you can't recruit yourself). Act intros keyed by speaker name also drive `v13Talk` (engine 5431), so Loki/Cyndal need the intro menu there.

## src/game/engine.ts (28)

| File | Line no. | Current line | New line | New speaker |
|---|---|---|---|---|
| engine.ts | 633 | `First Snow: talk to Justin at the Cambridge Road farm.` | `First Snow: talk to Sarah at the Cambridge Road farm.` | HUD |
| engine.ts | 634 | `` First Snow: bring Justin ${SNOW_WOOD} wood. `` | `` First Snow: bring Sarah ${SNOW_WOOD} wood. `` | HUD |
| engine.ts | 1181 | `Justin is out by the farmhouse. First snow is coming.` | `Sarah is out by the farmhouse. First snow is coming.` | log |
| engine.ts | 1642 | `Hold the farm first. Then Justin lets you build.` | `Hold the farm first. Building can wait one night.` | log |
| engine.ts | 1725 | `speaker: "Justin",` (raid-ask) | `speaker: "Sarah",` | Sarah |
| engine.ts | 1726 | `Sarah and I take the posts.` | `You and I take the posts.` | Sarah |
| engine.ts | 1775 | `` Justin wants ${SNOW_WOOD} armloads of wood. The woodpile is by the barn. `` | `` Sarah wants ${SNOW_WOOD} armloads of wood. The woodpile is by the barn. `` | log |
| engine.ts | 1780 | `Justin stacks the wood by the stove. Sarah wants to see you.` | `You stack the wood by the stove. Sarah wants to see you.` | log |
| engine.ts | 2213 | `You drag the last of the moose into the yard. Tell Justin.` | `You drag the last of the moose into the yard. Tell Sarah.` | log |
| engine.ts | 2358 | `Justin cuts you a share: meat, a hide and jerky.` | `Sarah sets aside your share: meat, a hide and jerky.` | log |
| engine.ts | 3087 | `openD({ speaker: "Justin", text: "We've been out once today.` | `openD({ speaker: "Sarah", text: "You've been out once today.` | Sarah |
| engine.ts | 3088 | `speaker: "Justin", text: "Short trip or long? Mind the wind.` | `speaker: "Sarah", text: "Short trip or long? Mind the wind.` | Sarah |
| engine.ts | 3090 | `speaker: "Justin", text: "Bangor's a long day with the cart.` | `speaker: "Sarah", text: "Bangor's a long day with the cart.` | Sarah (also move menu at 3024 to `role === "sarah"`) |
| engine.ts | 4106 | `Justin: \"That's my bench. Earn it first.\"` | `Your workbench, under a tarp. Hold the farm first; then it's back in business.` | narration |
| engine.ts | 4220 | `Justin: \"Lanterns on the road. They've been back every night this week. Take the gate. Sarah's on the lookout.\"` | `Sarah: \"Lanterns on the road. They've been back every night this week. Take the gate. I've got the porch.\"` | Sarah |
| engine.ts | 4233 | `Justin hauls you up by the coat. "Again. They'll come the same way, they always do."` | `Sarah hauls you up by the coat. "Again. They'll come the same way, they always do."` | Sarah |
| engine.ts | 4244 | `Justin: \"You can use my bench. Build what you like inside the ring.\" The workbench and Build are open.` | `Sarah: \"Go on, use your bench. Build what you like inside the ring.\" The workbench and Build are open.` | Sarah |
| engine.ts | 4255 | `A man with a carbine steps out from the stakes. \"That's far enough.\"` | `Sarah steps out from the stakes with the carbine, then lowers it. \"Oh, it's you. Thank God.\"` | Sarah (and `role === "justin"` at 4256/4264 -> `"sarah"`) |
| engine.ts | 4265 | `speaker: "Justin", text: "Get on the gate! Shoot what comes over the stakes."` | `speaker: "Sarah", text: "Get on the gate! Shoot what comes over the stakes."` | Sarah |
| engine.ts | 4266 | `Justin. My wife Sarah, my kids in the house. We lost hens and a gas can to the road last week, so you'll forgive the rifle. You saw the stakes. Half of them are down. First snow tonight and the stove's down to kindling. Bring three armloads of wood off the pile by the barn and we'll talk about you staying.` | `You're back. We lost hens and a gas can to the road last week, so you'll forgive the rifle. You saw the stakes. Half of them are down. First snow tonight and the stove's down to kindling. Bring three armloads of wood off the pile by the barn and I'll have something hot waiting.` | Sarah |
| engine.ts | 4306 | `That's part of Justin's ring. Repair it instead.` | `That's part of the old ring. Repair it instead.` | log |
| engine.ts | 4863 | `Justin and Sarah held the house.` | `Sarah and the kids held the house. Nobody's thrilled about it.` | raid warning (you were away) |
| engine.ts | 6672 | `The old motor bicycle is missing half its parts. Justin knows what she needs.` | `Your dad's old motor bicycle is missing half its parts. Sarah has a list.` | narration |
| engine.ts | 7852 | `You go down by the porch. Justin drags you inside and they bar the door.` | `You go down by the porch. Sarah drags you inside and they bar the door.` | narration |
| engine.ts | 9092 | `` Raid night ${n}. Justin and Sarah take the posts. Hold the farm. `` | `` Raid night ${n}. You and Sarah take the posts. Hold the farm. `` | log |
| engine.ts | 9147 | `The farmhouse door splinters. Justin fires the last shells and they scatter with the woodpile and a sack of apples.` | `The farmhouse door splinters. Sarah fires the last shells and they scatter with the woodpile and a sack of apples.` | narration |
| engine.ts | 9289 | `Night on Cambridge Road. Talk to Justin when you're ready to hold the farm.` | `Night on Cambridge Road. Talk to Sarah when you're ready to hold the farm.` | log |
| engine.ts | 11476 | `Raid Mode. One night at Cambridge Road. Justin and Sarah take the posts; Cyndal watches from the loft, Loki runs shells.` | `Raid Mode. One night at Cambridge Road. You and Sarah take the posts; Cyndal watches from the loft, Loki runs shells.` | log |

Code follow-ups (not text): engine 3024, 4256, 4264, 5424, 8773 (`role === "justin"` -> `"sarah"`), 9470 (Justin raid damage, drop or give to Sarah), world.ts 623 `addNpc(world, "justin", ...)` remove.

Kid lines saying "Dad" (engine 5490, 9157, 9395) are already correct with Justin as player; no change.

## Other files checked
- **v113.ts, v14.ts, v141.ts, town.ts, look.ts:** no Justin dialogue. (No `v11.ts` in src/game.)
- **PLAN-justin-player.md:** design notes, not game text. Its items line up with this sheet.

## Town layer (quest-harmony/js) conflicts: suggested fixes only (don't edit, another worker is in there)

| File | Line | Current | Suggested |
|---|---|---|---|
| story.js | 30 | `mainStages:{0:'talk to Justin',1:'bring SNOW_WOOD wood',2:'see Sarah'}` | `{0:'talk to Sarah',1:'bring Sarah SNOW_WOOD wood',2:'see Sarah'}` |
| story.js | 68 | `moose:'Moose Season (Q10, Justin)'` | `moose:'Moose Season (Q10, Sarah)'` (also tag ferry/mill/fuel/grok/bridge Sarah, maple Loki) |
| story.js | 15 | `Justin, Sarah, Cyndal and Loki keep the Cambridge Road farm alive` | `You, Sarah, Cyndal and Loki keep...` (optional; summaries in 3rd person are OK) |
| scenes.js | 13 | `Dad's old motor bike is in there` | `Your dad's old motor bike is in there` (bike is Justin's father's; narrator saying "Dad's" reads as the player's kid talking) |
| game.js | 242 | `Dad's old Whizzer motor bicycle` | `Your dad's old Whizzer motor bicycle` |
| game.js | 248 | `Dad's old motor bike is in there.` | `Your dad's old motor bike is in there.` |
| game.js | 288 | `and Dad's old motor bike. Look it over.` | `and your dad's old motor bike. Look it over.` |
| story.js | 44 | `then look over Dad's Whizzer` | `then look over your dad's Whizzer` (doc text) |

Consistent already: game.js 204 ("You are Justin the ..."), 201, 13, 330 (HUD label), acts.js 87/202 (you introduce yourself as Justin), Loki/Cyndal calling you Dad (game.js 225, 258, 262; acts.js 175), Goose name everywhere.
