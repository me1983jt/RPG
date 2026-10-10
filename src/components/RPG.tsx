import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import {
  Axe,
  Backpack,
  BookOpen,
  Columns3,
  Flame,
  Hammer,
  House,
  MessageCircle,
  Minus,
  Plus,
  ScrollText,
} from "lucide-react";
import { mountGame, type GameApi } from "@/game/engine";
import { useHud } from "@/game/store";
import { RECIPES } from "@/game/types";
import { GEAR, CRAFT, LOOKS, ROLES, TRAITS, defaultLook, roleStats, type LookId, type RoleId, type TraitId } from "@/game/gear";
import type { PerkId, SkillId } from "@/game/progress";

const RECIPE_ICON = [House, Columns3, Hammer, Flame] as const;

export function RPG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);
  const pinchMid = useRef({ x: 0, y: 0 });
  const pinching = useRef(false);
  const hud = useHud();
  const [name, setName] = useState("Packer");
  const [role, setRole] = useState<RoleId>("fighter");
  const [look, setLook] = useState<LookId>("wool");
  const [confirmNew, setConfirmNew] = useState(false);
  const [step, setStep] = useState<"trade" | "points" | "trait">("trade");
  const [trait, setTrait] = useState<TraitId | null>(null);
  const [bonus, setBonus] = useState({ strength: 0, vigor: 0, endurance: 0, intellect: 0, perception: 0, luck: 0 });
  const [packTab, setPackTab] = useState<"items" | "craft">("items");
  const [journalOpen, setJournalOpen] = useState(false);
  const playing = hud.phase !== "menu";
  const pointsLeft = 3 - (bonus.strength + bonus.vigor + bonus.endurance + bonus.intellect + bonus.perception + bonus.luck);
  const base = roleStats(role);
  const kit = ROLES.find((item) => item.id === role) ?? ROLES[3]!;

  useEffect(() => {
    const canvas = canvasRef.current;
    const mini = miniRef.current;
    if (!canvas || !mini) return;
    const api = mountGame(canvas, mini);
    apiRef.current = api;
    return () => api.destroy();
  }, []);

  function worldPointer(e: PointerEvent<HTMLCanvasElement>, type: "move" | "down" | "up") {
    const rect = e.currentTarget.getBoundingClientRect();
    apiRef.current?.pointer(e.clientX - rect.left, e.clientY - rect.top, type);
  }

  function mapPointer(e: PointerEvent<HTMLCanvasElement>, type: "move" | "down" | "up") {
    if (type === "down") pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    else if (type === "up") pointers.current.delete(e.pointerId);
    else if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const midX = (a!.x + b!.x) / 2;
      const midY = (a!.y + b!.y) / 2;
      if (type === "move" && pinch.current > 8) {
        apiRef.current?.nudgeZoom(dist / pinch.current);
        apiRef.current?.pan(midX - pinchMid.current.x, midY - pinchMid.current.y);
      }
      pinch.current = dist;
      pinchMid.current = { x: midX, y: midY };
      pinching.current = true;
      return;
    }
    if (pinching.current) {
      if (pointers.current.size === 0) {
        pinching.current = false;
        pinch.current = 0;
      }
      return;
    }
    pinch.current = 0;
    worldPointer(e, type);
  }

  function bump(stat: "strength" | "vigor" | "endurance" | "intellect" | "perception" | "luck", dir: 1 | -1): void {
    setBonus((current) => {
      const next = current[stat] + dir;
      const spent = current.strength + current.vigor + current.endurance + current.intellect + current.perception + current.luck;
      if (dir > 0 && spent >= 3) return current;
      if (next < 0) return current;
      return { ...current, [stat]: next };
    });
  }

  function startNew(): void {
    if (!trait || pointsLeft !== 0) return;
    apiRef.current?.begin(name, role, bonus, trait, look);
  }

  return (
    <div className="fixed inset-0 h-dvh w-full overflow-hidden bg-bg text-fg touch-none">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="rough-edge" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="turbulence" baseFrequency="0.55" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <canvas
        ref={canvasRef}
        aria-label="Northwestern Maine map"
        className="absolute inset-0 h-full w-full"
        onPointerDown={(e) => {
          mapPointer(e, "down");
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* synthetic clicks have no pointer to capture */
          }
        }}
        onPointerMove={(e) => mapPointer(e, "move")}
        onPointerUp={(e) => mapPointer(e, "up")}
        onPointerCancel={(e) => mapPointer(e, "up")}
        onContextMenu={(e) => e.preventDefault()}
      />

      {playing ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col p-2 short:p-1.5 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))]">
          <section className="pointer-events-auto mr-24 max-w-xs self-start plank border border-border bg-surface/95 px-3 py-2 short:mr-16 short:px-2 short:py-1">
            <p className="flex items-center gap-2 text-sm font-bold uppercase text-primary short:hidden">
              <ScrollText className="size-4" aria-hidden />
              {hud.region}
            </p>
            <p className="mt-1 line-clamp-2 text-base font-semibold leading-snug short:mt-0 short:line-clamp-1 short:text-sm">{hud.questText}</p>
            <p className="mt-1 text-sm font-semibold text-primary short:mt-0.5">{hud.clock}</p>
            <p className="text-sm font-semibold text-fg">{hud.karmaWord}</p>
            {hud.party ? (
              <p className="text-xs">
                {hud.party.name} with you · {hud.party.hp}/{hud.party.maxHp}
              </p>
            ) : null}
          </section>

          <div className="mt-auto flex min-h-0 flex-col gap-2 overflow-y-auto">
            {hud.riding ? (
              <button
                type="button"
                className="pointer-events-auto self-center plank bg-primary px-4 py-2 text-sm font-semibold text-bg"
                onClick={() => apiRef.current?.dismount()}
              >
                Dismount
              </button>
            ) : null}
            {hud.log.length > 0 ? (
              <ul className="pointer-events-none max-w-md space-y-1 self-center text-center text-base font-semibold">
                {hud.log.map((line, i) => (
                  <li key={`${line}-${i}`} className="plank bg-bg/95 px-3 py-1.5 text-fg">
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}

            {hud.loot ? (
              <section className="pointer-events-auto mx-auto w-full max-w-lg plank border border-border bg-surface p-3 short:p-2">
                <p className="font-display text-lg text-primary short:text-base">{hud.loot.title}</p>
                <p className="mt-1 text-xs text-muted">Take what you want. It leaves the ground and goes into your pack. Anything left is gone after one day.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hud.loot.lines.map((line) => (
                    <button
                      key={line.key}
                      type="button"
                      className="plank border border-border bg-bg px-3 py-2 text-sm"
                      onClick={() => apiRef.current?.takeLoot(line.key)}
                    >
                      {line.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="plank bg-primary px-4 py-2 font-semibold text-bg" onClick={() => apiRef.current?.takeLoot("all")}>
                    Take all
                  </button>
                  <button type="button" className="plank border border-border px-4 py-2" onClick={() => apiRef.current?.takeLoot("close")}>
                    Leave
                  </button>
                </div>
              </section>
            ) : null}

            {hud.dialogue ? (
              <section className="pointer-events-auto mx-auto w-full max-w-lg plank border border-border bg-surface p-4">
                <p className="font-display text-lg text-primary">{hud.dialogue.speaker}</p>
                <p className="mt-2 leading-relaxed">{hud.dialogue.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {hud.dialogue.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      className="plank bg-primary px-4 py-3 text-left text-sm font-semibold leading-snug text-bg"
                      onClick={() => apiRef.current?.choose(choice.id)}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {hud.packOpen ? (
              <section className="pointer-events-auto mx-auto w-full max-w-3xl plank border border-border bg-surface p-3 short:p-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-xl short:text-lg">Pack</p>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className={`plank border px-3 py-2 text-xs font-semibold ${packTab === "items" ? "border-primary bg-primary text-bg" : "border-border bg-bg"}`}
                      onClick={() => setPackTab("items")}
                    >
                      Items
                    </button>
                    <button
                      type="button"
                      className={`plank border px-3 py-2 text-xs font-semibold ${packTab === "craft" ? "border-primary bg-primary text-bg" : "border-border bg-bg"}`}
                      onClick={() => setPackTab("craft")}
                    >
                      Craft
                    </button>
                    <button
                      type="button"
                      className={`plank border px-3 py-2 text-xs font-semibold ${hud.turnBased ? "border-primary bg-surface-2 text-primary" : "border-border bg-bg"}`}
                      onClick={() => apiRef.current?.setTurnBased(!hud.turnBased)}
                    >
                      {hud.turnBased ? "Turn-based" : "Real time"}
                    </button>
                  </div>
                </div>
                {packTab === "items" ? (
                  <div className="mt-2 flex gap-2">
                    <div className="flex w-32 shrink-0 flex-col gap-1 short:w-28">
                      {(
                        [
                          ["Head", hud.wornHead, hud.headName],
                          ["Chest", hud.wornChest, hud.coatName],
                          ["Legs", hud.wornLegs, hud.legsName],
                          ["Hands", hud.wornHands, hud.handsName],
                          ["Weapon", hud.wornWeapon, hud.weaponName],
                        ] as const
                      ).map(([label, id, name]) => (
                        <button
                          key={label}
                          type="button"
                          disabled={!id}
                          className="plank border border-border bg-bg px-2 py-1.5 text-left disabled:opacity-70"
                          onClick={() => id && apiRef.current?.clickPack(id)}
                        >
                          <span className="block text-[10px] uppercase tracking-wide text-muted">{label}</span>
                          <span className="block truncate text-xs font-semibold">{id ? name : "Empty"}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid min-w-0 flex-1 grid-cols-4 gap-1">
                      {Array.from({ length: 16 }, (_, i) => hud.pack[i] ?? null).map((slot, i) =>
                        slot ? (
                          <button
                            key={slot.id}
                            type="button"
                            className={`flex min-h-14 flex-col justify-between plank border px-1.5 py-1 text-left short:min-h-12 ${slot.equipped ? "border-primary bg-surface-2" : "border-border bg-bg"}`}
                            onClick={() => apiRef.current?.clickPack(slot.id)}
                          >
                            <span className="text-xs font-semibold leading-tight">{slot.name}</span>
                            <span className={`text-[10px] capitalize ${slot.quality === "rare" ? "text-[#e6c56a]" : slot.quality === "good" ? "text-primary" : "text-muted"}`}>
                              {slot.qty > 1 ? `×${slot.qty}` : slot.equipped ? "worn" : slot.quality}
                            </span>
                          </button>
                        ) : (
                          <div key={`empty-${i}`} className="min-h-14 plank border border-border bg-bg/70 short:min-h-12" />
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {CRAFT.map((recipe) => {
                      const stock = (id: string) => hud.pack.find((s) => s.id === id)?.qty ?? 0;
                      const afford = recipe.need.every((n) => stock(n.id) >= n.qty) && hud.scrap >= recipe.iron && hud.wood >= recipe.wood;
                      return (
                        <li key={recipe.id} className="flex items-center justify-between gap-2 plank border border-border bg-bg px-2 py-1.5">
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold leading-tight">{recipe.name}</span>
                            <span className="block text-xs text-muted">{recipe.blurb}</span>
                          </span>
                          <button
                            type="button"
                            className="shrink-0 plank bg-primary px-3 py-2 text-sm font-semibold text-bg disabled:opacity-40"
                            disabled={!afford}
                            onClick={() => apiRef.current?.craft(recipe.id)}
                          >
                            Make
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {packTab === "items" ? (
                  <p className="mt-2 text-xs text-muted">Tap a piece to wear it. Tap the doll to take it off. Weapons stay sheathed until you swing.</p>
                ) : null}
              </section>
            ) : null}

            {journalOpen && !hud.statsOpen && !hud.packOpen && !hud.dialogue ? (
              <section className="pointer-events-auto mx-auto max-h-[18rem] w-full max-w-lg overflow-y-auto plank border border-border bg-surface p-3 short:max-h-[14rem]" aria-label="Quest journal">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-xl">Journal</p>
                  <button type="button" className="text-sm text-primary" onClick={() => setJournalOpen(false)}>
                    Close
                  </button>
                </div>
                {(["active", "done"] as const).map((group) => {
                  const list = hud.journal.filter((entry) => (group === "done") === entry.done);
                  if (!list.length) return null;
                  return (
                    <div key={group} className="mt-2">
                      <p className="text-xs uppercase tracking-widest text-primary">{group === "active" ? "Active" : "Completed"}</p>
                      <ul className="mt-1 space-y-1">
                        {list.map((entry) => (
                          <li key={entry.id} className={`plank border border-border bg-bg px-3 py-2 ${entry.done ? "opacity-70" : ""}`}>
                            <p className="font-semibold">{entry.done ? "✓ " : ""}{entry.title}</p>
                            <p className="text-sm text-muted">{entry.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </section>
            ) : null}

            {hud.statsOpen ? (
              <section className="pointer-events-auto mx-auto max-h-[18rem] w-full max-w-lg overflow-y-auto plank border border-border bg-surface p-3 short:max-h-[14rem]">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-xl">Stats</p>
                  <p className="text-sm text-primary">{hud.points} stat · {hud.skillPoints} skill</p>
                </div>
                <p className="mt-1 text-xs text-muted">{hud.karmaWord}. {hud.repLine}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 short:grid-cols-3">
                  {(
                    [
                      ["strength", "Strength", hud.strength, "Harder hits"],
                      ["vigor", "Health", hud.vigor, "More life"],
                      ["endurance", "Endurance", hud.endurance, "More stamina"],
                      ["intellect", "Intelligence", hud.intellect, "More skill points"],
                      ["perception", "Perception", hud.perception, "See farther. Guns reach farther"],
                      ["luck", "Luck", hud.luck, "Better finds. The odd hard hit"],
                    ] as const
                  ).map(([key, label, value, hint]) => (
                    <div key={key} className="flex items-center justify-between gap-2 plank border border-border bg-bg px-2 py-2">
                      <span>
                        <span className="block text-sm font-semibold">{label}</span>
                        <span className="block text-xs text-muted">{hint}</span>
                      </span>
                      <span className="text-lg">{value}</span>
                      <button
                        type="button"
                        className="plank bg-primary px-3 py-2 text-sm font-semibold text-bg disabled:opacity-40"
                        disabled={hud.points < 1}
                        onClick={() => apiRef.current?.spend(key)}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold">Skills</p>
                <p className="text-xs text-muted">
                  {hud.canRetag ? "Tap a name to tag it. Three tags rise twice as fast, until you spend a skill point." : "Tagged skills rise twice as fast."}
                </p>
                <ul className="mt-2 grid grid-cols-2 gap-1">
                  {hud.skills.map((skill) => (
                    <li key={skill.id} className="flex items-center justify-between gap-2 plank border border-border bg-bg px-2 py-1.5">
                      <button
                        type="button"
                        className="min-w-0 text-left"
                        onClick={() => hud.canRetag && apiRef.current?.retag(skill.id as SkillId)}
                      >
                        <span className="block text-sm font-semibold">
                          {skill.name}
                          {skill.tagged ? " · tagged" : ""}
                        </span>
                      </button>
                      <span className="text-sm">{skill.score}</span>
                      <button
                        type="button"
                        className="plank bg-primary px-3 py-1 text-sm font-semibold text-bg disabled:opacity-40"
                        disabled={hud.skillPoints < 1}
                        onClick={() => apiRef.current?.spendSkill(skill.id as SkillId)}
                      >
                        +
                      </button>
                    </li>
                  ))}
                </ul>
                {hud.perkNames ? <p className="mt-3 text-sm">Perks: {hud.perkNames}</p> : null}
                {hud.perkReady ? (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Pick a perk</p>
                    <ul className="mt-1 space-y-1">
                      {hud.perkChoices.map((perk) => (
                        <li key={perk.id}>
                          <button
                            type="button"
                            disabled={!perk.ok}
                            className="w-full plank border border-border bg-bg px-2 py-2 text-left disabled:opacity-40"
                            onClick={() => apiRef.current?.takePerk(perk.id as PerkId)}
                          >
                            <span className="block text-sm font-semibold">{perk.name}</span>
                            <span className="block text-xs text-muted">{perk.blurb}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {hud.party ? (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-sm">
                      {hud.party.name} · {hud.party.hp}/{hud.party.maxHp}
                    </p>
                    <button type="button" className="plank border border-border px-3 py-2 text-sm" onClick={() => apiRef.current?.dismissParty()}>
                      Send home
                    </button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {hud.buildOpen ? (
              <section className="pointer-events-auto mx-auto grid w-full max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">
                {RECIPES.map((item, index) => {
                  const Icon = RECIPE_ICON[index] ?? House;
                  const afford = hud.wood >= item.wood && hud.stone >= item.stone && hud.scrap >= item.scrap;
                  const selected = hud.recipe === index;
                  return (
                    <button
                      key={item.kind}
                      type="button"
                      className={`plank border px-2 py-2 text-left ${selected ? "border-primary bg-surface-2" : "border-border bg-surface"} ${afford ? "" : "opacity-70"}`}
                      onClick={() => apiRef.current?.selectRecipe(index)}
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <Icon className="size-4 text-primary" aria-hidden />
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {item.wood} timber · {item.stone} ledge · {item.scrap} iron
                      </span>
                    </button>
                  );
                })}
              </section>
            ) : null}
            </div>

            <div className="pointer-events-auto z-40 flex flex-wrap items-center gap-1">
              <span className="px-1 text-[10px] uppercase tracking-wide text-muted">Aim</span>
              {(["head", "chest", "arm", "leg"] as const).map((part) => (
                <button
                  key={part}
                  type="button"
                  className={`plank border px-3 py-2 text-xs font-semibold capitalize short:px-2 short:py-1 ${hud.aim === part ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`}
                  onClick={() => apiRef.current?.setAim(part)}
                >
                  {part}
                </button>
              ))}
              {hud.turnBased ? (
                <button type="button" className="plank bg-primary px-3 py-2 text-xs font-semibold text-bg short:px-2 short:py-1" onClick={() => apiRef.current?.endTurn()}>
                  End turn · {hud.ap}/{hud.maxAp}
                </button>
              ) : null}
            </div>

            <div className="pointer-events-auto z-40 mt-2 flex w-full max-w-full flex-col gap-2 short:mt-1 short:flex-row short:items-end short:gap-1">
              <div className="flex min-w-0 flex-1 items-stretch gap-2">
                <section className="min-w-0 flex-1 plank border border-border bg-surface/95 px-3 py-2 short:px-2 short:py-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h1 className="truncate font-display text-lg leading-none short:text-base">{hud.name}</h1>
                      <p className="mt-1 text-xs uppercase tracking-wide text-primary short:hidden">{hud.roleTitle}</p>
                    </div>
                    <button type="button" className="shrink-0 text-sm text-primary" onClick={() => apiRef.current?.tap("pause")}>
                      Pause
                    </button>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden bg-bg scar short:mt-1" aria-label="Health">
                    <div className="h-full bg-accent scar" style={{ width: `${Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100))}%` }} />
                  </div>
                  <div className="mt-1 h-1 overflow-hidden bg-bg scar" aria-label="Experience">
                    <div className="h-full bg-primary scar" style={{ width: `${Math.max(0, Math.min(100, (hud.xp / hud.xpNext) * 100))}%` }} />
                  </div>
                  <div className="mt-1 h-1 overflow-hidden bg-bg scar" aria-label="Stamina">
                    <div className="h-full bg-fg scar" style={{ width: `${Math.max(0, Math.min(100, (hud.stamina / Math.max(1, hud.maxStamina)) * 100))}%` }} />
                  </div>
                  <p className="mt-1 truncate text-xs text-muted short:mt-0.5">
                    {Math.ceil(hud.hp)} / {hud.maxHp} · Lv {hud.level}
                    {hud.turnBased ? ` · AP ${hud.ap}/${hud.maxAp}` : ""}
                    {hud.inside ? " · Inside" : ""} · Wood {hud.wood} · Stone {hud.stone} · Iron {hud.scrap} · Shells {hud.shells}
                  </p>
                </section>
                <div className="flex shrink-0 flex-col gap-2 short:flex-row short:gap-1">
                  <ActionButton label="Zoom out" onClick={() => apiRef.current?.nudgeZoom(1 / 1.2)}>
                    <Minus className="size-5 short:size-4" aria-hidden />
                  </ActionButton>
                  <ActionButton label="Zoom in" onClick={() => apiRef.current?.nudgeZoom(1.2)}>
                    <Plus className="size-5 short:size-4" aria-hidden />
                  </ActionButton>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-1 short:w-72 short:shrink-0">
                <ActionButton wide label="Talk" onClick={() => apiRef.current?.tap("interact")}>
                  <span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold leading-none">
                    <MessageCircle className="size-4" aria-hidden />
                    Talk
                  </span>
                </ActionButton>
                <ActionButton wide label="Attack" onClick={() => apiRef.current?.tap("attack")}>
                  <span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold leading-none">
                    <Axe className="size-4" aria-hidden />
                    Attack
                  </span>
                </ActionButton>
                <ActionButton wide label="Build" pressed={hud.buildOpen} onClick={() => apiRef.current?.tap("build")}>
                  <span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold leading-none">
                    <House className="size-4" aria-hidden />
                    Build
                  </span>
                </ActionButton>
                <ActionButton wide label="Pack" pressed={hud.packOpen} onClick={() => apiRef.current?.togglePack()}>
                  <span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold leading-none">
                    <Backpack className="size-4" aria-hidden />
                    Pack
                  </span>
                </ActionButton>
                <ActionButton
                  wide
                  label="Journal"
                  pressed={journalOpen && !hud.statsOpen && !hud.packOpen}
                  onClick={() => {
                    if (hud.statsOpen) apiRef.current?.toggleStats();
                    if (hud.packOpen) apiRef.current?.togglePack();
                    setJournalOpen((open) => !(open && !hud.statsOpen && !hud.packOpen));
                  }}
                >
                  <span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold leading-none">
                    <BookOpen className="size-4" aria-hidden />
                    Journal
                  </span>
                </ActionButton>
                <ActionButton wide label="Stats" pressed={hud.statsOpen} onClick={() => apiRef.current?.toggleStats()}>
                  <span className="flex flex-col items-center gap-0.5 text-[10px] font-semibold leading-none">
                    <ScrollText className="size-4" aria-hidden />
                    Stats
                  </span>
                </ActionButton>
              </div>
            </div>
        </div>
      ) : null}
      <canvas
        ref={miniRef}
        width={132}
        height={132}
        aria-label="Minimap"
        className={playing ? "pointer-events-none absolute top-[max(0.5rem,env(safe-area-inset-top))] right-[max(0.5rem,env(safe-area-inset-right))] z-10 h-20 w-20 plank border border-border bg-bg short:h-12 short:w-12" : "hidden"}
      />

      {hud.phase === "menu" ? (
        <div className="menu-hero absolute inset-0 overflow-y-auto p-4 short:p-2 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex min-h-full w-full max-w-lg items-center py-4 short:max-w-3xl short:py-1">
          <div className="w-full plank border border-border bg-surface/95 p-6 short:p-3">
            <p className="text-xs uppercase tracking-widest text-primary">Northwestern Maine</p>
            <h1 className="mt-1 font-display text-5xl leading-none short:text-3xl">Maine RPG</h1>
            <p className="mt-3 leading-relaxed text-muted short:mt-1 short:line-clamp-2 short:text-sm">
              After the fall, the Moose River country went back to wool coats, lever guns, and cookfires. No charms. Pick a trade, place three points, and take one trait.
            </p>
            <p className="mt-3 text-xs uppercase tracking-widest text-primary short:mt-2">
              {step === "trade" ? "1 · Trade" : step === "points" ? "2 · Points" : "3 · Trait"}
            </p>
            <div className="mt-2 plank border border-border bg-bg px-3 py-2 text-sm">
              <p className="font-display text-lg leading-none">{kit.title}</p>
              <p className="mt-1 text-muted">
                {GEAR[kit.weapon]?.name} · {GEAR[kit.coat]?.name}
              </p>
              <p className="mt-1">
                Str {base.strength + bonus.strength} · Health {base.vigor + bonus.vigor} · End {base.endurance + bonus.endurance} · Int {base.intellect + bonus.intellect} · Per {base.perception + bonus.perception} · Luck {base.luck + bonus.luck}
              </p>
            </div>
            {step === "trade" ? (
              <>
                <label className="mt-4 block text-sm text-muted short:mt-2" htmlFor="wanderer-name">
                  Name
                </label>
                <input
                  id="wanderer-name"
                  value={name}
                  maxLength={18}
                  onChange={(e) => setName(e.target.value)}
                  suppressHydrationWarning
                  className="mt-1 w-full plank border border-border bg-bg px-3 py-3 text-fg outline-none focus:border-primary short:py-2"
                />
                <div className="mt-4 grid grid-cols-2 gap-2 short:mt-2 short:grid-cols-4 short:gap-1">
                  {ROLES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={role === item.id}
                      className={`plank border px-3 py-3 text-left short:px-2 short:py-2 ${role === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`}
                      onClick={() => {
                        setRole(item.id);
                        setLook(defaultLook(item.id));
                      }}
                    >
                      <span className="font-display text-lg short:text-base">{item.title}</span>
                      <span className="mt-1 block text-sm text-muted short:line-clamp-3 short:text-xs">{item.blurb}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted short:mt-2">Cloth</p>
                <div className="mt-1 grid grid-cols-4 gap-2">
                  {LOOKS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={look === item.id}
                      className={`plank border px-2 py-2 text-left ${look === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`}
                      onClick={() => setLook(item.id)}
                    >
                      <span
                        className="mb-1 block h-3 w-full border border-border"
                        style={{ background: item.id === "wool" ? "#8a6244" : item.id === "spruce" ? "#3d6a42" : item.id === "linen" ? "#e6d7b8" : "#3a3c42" }}
                      />
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block text-xs text-muted">{item.hint}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
            {step === "points" ? (
              <>
                <p className="mt-3 text-sm text-muted">{pointsLeft} to place. They sit on top of the trade.</p>
                <div className="mt-2 grid grid-cols-2 gap-2 short:grid-cols-3">
                  {(
                    [
                      ["strength", "Strength", "Harder hits"],
                      ["vigor", "Health", "More life"],
                      ["endurance", "Endurance", "More stamina"],
                      ["intellect", "Intelligence", "Surer locks, better prices"],
                      ["perception", "Perception", "See farther. Guns reach farther"],
                      ["luck", "Luck", "Better finds. Harder hits, sometimes"],
                    ] as const
                  ).map(([key, label, hint]) => (
                    <div key={key} className="plank border border-border bg-bg px-2 py-2">
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-muted">{hint}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <button type="button" className="plank border border-border px-3 py-1" onClick={() => bump(key, -1)} disabled={bonus[key] < 1}>
                          −
                        </button>
                        <span className="text-lg">{base[key] + bonus[key]}</span>
                        <button type="button" className="plank border border-border px-3 py-1" onClick={() => bump(key, 1)} disabled={pointsLeft < 1}>
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
            {step === "trait" ? (
              <div className="mt-3 grid grid-cols-2 gap-2 short:grid-cols-4 short:gap-1">
                {TRAITS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={trait === item.id}
                    className={`plank border px-3 py-3 text-left short:px-2 short:py-2 ${trait === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`}
                    onClick={() => setTrait(item.id)}
                  >
                    <span className="font-display text-lg short:text-base">{item.title}</span>
                    <span className="mt-1 block text-sm text-muted short:text-xs">{item.blurb}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-4 flex flex-col gap-2">
              {confirmNew ? (
                <>
                  <p className="text-sm text-muted">A saved packer is already on this device. Starting over replaces them.</p>
                  <button type="button" className="plank bg-accent px-4 py-3 font-semibold text-fg" onClick={startNew}>
                    Replace save
                  </button>
                  <button type="button" className="plank border border-border px-4 py-3" onClick={() => setConfirmNew(false)}>
                    Back
                  </button>
                </>
              ) : (
                <>
                  {step === "trade" ? (
                    <button type="button" className="plank bg-primary px-4 py-3 font-semibold text-bg" onClick={() => setStep("points")}>
                      Next
                    </button>
                  ) : null}
                  {step === "points" ? (
                    <div className="flex gap-2">
                      <button type="button" className="plank border border-border px-4 py-3" onClick={() => setStep("trade")}>
                        Back
                      </button>
                      <button
                        type="button"
                        className="flex-1 plank bg-primary px-4 py-3 font-semibold text-bg disabled:opacity-40"
                        disabled={pointsLeft !== 0}
                        onClick={() => setStep("trait")}
                      >
                        Next
                      </button>
                    </div>
                  ) : null}
                  {step === "trait" ? (
                    <div className="flex gap-2">
                      <button type="button" className="plank border border-border px-4 py-3" onClick={() => setStep("points")}>
                        Back
                      </button>
                      <button
                        type="button"
                        className="flex-1 plank bg-primary px-4 py-3 font-semibold text-bg disabled:opacity-40"
                        disabled={!trait}
                        onClick={() => {
                          if (hud.hasSave) setConfirmNew(true);
                          else startNew();
                        }}
                      >
                        Begin as {kit.title}
                      </button>
                    </div>
                  ) : null}
                  {hud.hasSave && step === "trade" ? (
                    <button
                      type="button"
                      className="plank border border-border bg-surface-2 px-4 py-3 font-semibold"
                      onClick={() => apiRef.current?.continueGame()}
                    >
                      Continue
                    </button>
                  ) : null}
                </>
              )}
            </div>
            <p className="mt-4 text-base font-semibold leading-relaxed text-fg">
              Hold on the ground to run. Click a chopper to chase and keep swinging until they drop. Click the ground to break off. A carbine shoots from farther away. An axe in your hand takes three swings, then the tree falls. A pickaxe in your hand cracks a rock for iron.
            </p>
            {!hud.ready ? <p className="mt-2 text-xs text-muted">Painting the spruce…</p> : null}
          </div>
          </div>
        </div>
      ) : null}

      {hud.phase === "pause" ? (
        <Overlay title="Paused">
          <button type="button" className="plank bg-primary px-4 py-3 font-semibold text-bg" onClick={() => apiRef.current?.tap("resume")}>
            Resume
          </button>
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.tap("save")}>
            Save
          </button>
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.setTurnBased(!hud.turnBased)}>
            {hud.turnBased ? "Switch to real time" : "Switch to turn-based"}
          </button>
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.tap("menu")}>
            Main menu
          </button>
        </Overlay>
      ) : null}

      {hud.phase === "dead" ? (
        <Overlay title="You fall">
          <p className="text-sm leading-relaxed text-muted">The spruce takes you. A lean-to, if you raised one, is where you wake. Otherwise you come to on the cot at Cambridge Road.</p>
          <button type="button" className="plank bg-primary px-4 py-3 font-semibold text-bg" onClick={() => apiRef.current?.tap("respawn")}>
            Wake
          </button>
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.tap("menu")}>
            Main menu
          </button>
        </Overlay>
      ) : null}
    </div>
  );
}

function Overlay({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="scrap-scrim absolute inset-0 flex items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-2 plank border border-border bg-surface p-5">
        <h2 className="font-display text-3xl">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  children,
  onClick,
  pressed,
  wide,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  pressed?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      className={`flex items-center justify-center plank border ${wide ? "h-14 w-full min-w-0 px-1 short:h-11" : "h-12 w-12 short:h-9 short:w-9"} ${pressed ? "border-primary bg-primary text-bg" : "border-border bg-surface text-fg"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
