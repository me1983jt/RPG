# Harmony town layer ↔ Maine RPG handoff (town side, protocol 1)

Entry: `/workspace/quest-harmony/index.html` (copy the folder minus `shots/`, `tests/`, `tools_ui.py`).

## In
- `{type:'enterTown',protocol:1,town,state}` from `window.parent` only; any number of times, latest wins.
  `town`: `harmony` (default) or an entry id below; `state.scene` (optional) picks an exact scene.
- `?state=<base64 JSON>`, `?town=<entry>`, `?scene=<sceneId>`; standalone also reads `localStorage['mainerpg.handoff']`.
- Read: inventory, hp/maxHp, injuries{blinded,crippledArm,crippledLeg}, companions, stats, day, time, questFlags, extra.
- story.* read: `story.act`, `story.stage`, `story.snow`, `story.raids`, `story.gooseFound`, `story.day`, `story.q10.*`, `story.q11.*`, `story.seen.*`; optional (wanted): `story.jackLoyal`.

## Entry ids → scene
| entry | scene | what |
|---|---|---|
| harmony | harmony (or farm/last scene) | Harmony village + farm, loft, store, clinic, church meeting |
| bunker | bunkerOut | Jack Ready's ridge → bunkerIn |
| kennebec | river | Ferry landing (Kennebec Crossing) |
| skow | bridge | Skowhegan bridge → Marcel's store → camp behind the mill |
| raiders | camp_gravel | Saw's gravel-pit camp |
| north | camp_holeb | Hole's Holeb cut camp |
| grokwoods | grokwoods | Act 6: The Grok's woods past the Kennebec (→ depot) |
| depot | depot | Act 6: the Collector's supply depot |

Act 7 has no entry of its own: the farmhouse opens the `kitchen` scene once the act is 7 or higher (`?scene=kitchen` also works).

## Out
- `{type:'ready',town:'harmony'}` on boot.
- `{type:'leaveTown',exit,state}` + `{type:'town-exit',exit,state}`; exits `worldmap`, `farm`, etc.; also writes `localStorage['mainerpg.handoff']`.
- state: full inventory (main item ids), hp, injuries object, questFlags (`harmony.*` only), stats echo, extra `{schema:'character/1',cls,score,skills,stats,save}`.
- `{type:'startQuest',id,target,label}`: see DESIGN.md "Scene entries".

## Flags the RPG should map (forward-only)
| town flag | RPG effect |
|---|---|
| `harmony.signal` heard\|debated | `w13.main.flags.signal = true` (act 2 → 3) |
| `harmony.jack` met\|inside\|maps | `w13.main.flags.jackTalk = true` |
| `harmony.jackTrust` (number, cumulative) | `loyal.jack += (value − last applied value)` |
| `harmony.jackMaps` true | if loyal.jack ≥ 30: act 3 done |
| `harmony.marcel` met\|briefed | `w13.main.flags.marcel = true` (act 4 → 5) |
| `harmony.ferryPlanks/Rope/Winch` true | `q10.planks/rope/winch = true`; `harmony.ferry` given → ferry 1, fixed → ferry 3 |
| `harmony.ltGravel/ltHoleb/ltMill` down\|gone | `w13.main.ltKills += 1` each (once) and `w13.camps[gravel\|holeb\|mill]` cleared |
| `harmony.prisoners` (number) | +N Harmony (rescued Forks folks), Mira loyalty |
| `harmony.collector` value | flavor (Collector's first visit); `paid` could cost Harmony food |
| `harmony.signalVerdict` split | flavor: Earl & two others went south |
| `harmony.act` | town's local act (informational) |
| `harmony.grok` dead | Q11 grok done (claw); `harmony.grokClaw` true → give `grokclaw` if wanted |
| `harmony.grok` snuck\|tricked\|friend | `main.flags.grokPath = true` (passed the Grok) |
| `harmony.grokFriend` true | Siege (act 8): the Grok fights for the farm / doesn't attack; ending flavor |
| `harmony.wolves` leader\|driven | Q11 wolves done |
| `harmony.depot` shared\|taken\|burned | `main.flags.depot = true` (act 6 → 7); shared: Harmony/Lowelltown/Skowhegan +loyalty; burned: no RPG gas reward |
| `harmony.ledger` true | +support for "unite" (ok to treat as a requirement waiver) |
| `harmony.choice` unite\|deal\|alone | `w13.main.choice` (act 7 → 8); deal + `harmony.dealTerms` haggled\|full sets the toll |
| `harmony.family` stay\|north | act 8: stay = the family defends the farm with you; north = Cyndal/Loki/Goose/Sarah wait it out at Jack's (`w13.left`?), endings 9 |
| `harmony.support` (number) | informational: towns behind you |

New markers: `harmony-grok`→`north`, `harmony-choice`→`farm`, `harmony-siege`→`farm`.
