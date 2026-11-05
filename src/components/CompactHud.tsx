import { useEffect, useRef, useState } from "react";
import { Axe, Backpack, BookOpen, Crosshair, ScrollText, Syringe } from "lucide-react";
import type { GameApi } from "@/game/engine";
import type { HudSnapshot } from "@/game/types";

/**
 * Approved compact HUD.
 * Talk stays on the log (world taps and E still talk too). The world map opens from the minimap,
 * and again from the journal device. Player auto-attack moved to pause Options; companion Auto is per portrait.
 * Companion Attack/Defend are stored orders. The fight still uses the existing companion turn.
 * Weapon tap cycles slot 1, slot 2, aimed slot 1, aimed slot 2 via the existing swap and aim actions.
 * Combat calls the existing engage / end-combat / end-turn paths and does not replace the combat engine.
 */

type Api = GameApi | null;
type Comp = NonNullable<HudSnapshot["companions15"]>[number];
type PackRow = HudSnapshot["pack"][number];

const QUICK_IDS = ["medkit", "docbag", "medicine", "bandage", "kit", "tonic", "water", "cider", "stew", "pie", "apple", "smokedfish", "donut", "dandelion", "syrup"];

function quickItem(pack: PackRow[]): PackRow | null {
  const rows = pack.filter((s) => s.kind !== "weapon" && s.kind !== "coat" && !s.equipped && (s.heal > 0 || QUICK_IDS.includes(s.id)));
  rows.sort((a, b) => (QUICK_IDS.indexOf(a.id) < 0 ? 99 : QUICK_IDS.indexOf(a.id)) - (QUICK_IDS.indexOf(b.id) < 0 ? 99 : QUICK_IDS.indexOf(b.id)));
  return rows[0] ?? null;
}

function pct(n: number, d: number) {
  if (!(d > 0)) return 0;
  return Math.max(0, Math.min(100, (n / d) * 100));
}

export function HudCorner({
  onStats,
  onJournal,
  onPack,
  statsOn,
  journalOn,
  packOn,
}: {
  onStats: () => void;
  onJournal: () => void;
  onPack: () => void;
  statsOn: boolean;
  journalOn: boolean;
  packOn: boolean;
}) {
  const items = [
    ["Char", "Stats", <ScrollText key="s" className="size-4" aria-hidden />, statsOn, onStats],
    ["Journal", "Journal", <BookOpen key="j" className="size-4" aria-hidden />, journalOn, onJournal],
    ["Pack", "Backpack", <Backpack key="p" className="size-4" aria-hidden />, packOn, onPack],
  ] as const;
  return (
    <div className="hud-v5-corner" data-hud="corner">
      {items.map(([key, label, icon, on, fn]) => (
        <button key={key} type="button" data-fobar-btn={key} data-hud-btn={label.toLowerCase()} aria-label={label} aria-pressed={on} className={`hud-v5-plate hud-v5-btn ${on ? "on" : ""}`} style={{ touchAction: "manipulation" }} onClick={fn}>
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export function HudQuest({
  hud,
  open,
  badge,
  onToggle,
  trackerOpen,
  onTracker,
  showTracker,
}: {
  hud: HudSnapshot;
  open: boolean;
  badge: boolean;
  onToggle: () => void;
  trackerOpen: boolean;
  onTracker: () => void;
  showTracker: boolean;
}) {
  const act = hud.journal.filter((e) => !e.done && !e.id.startsWith("q11-season")).slice(0, 3);
  return (
    <div className="pointer-events-auto self-start" style={{ maxWidth: "min(20rem, calc(100% - var(--hud-mini) - 11rem))" }}>
      <button type="button" data-hud={open ? "quest" : "quest-min"} aria-expanded={open} className="hud-v5-plate hud-v5-tab relative text-left" onClick={onToggle}>
        <span className="truncate font-display text-sm uppercase tracking-wide">{hud.region}</span>
        <span aria-hidden className="text-xs opacity-80">{open ? "▾" : "▸"}</span>
        {badge && !open ? <span className="hud-v5-badge" data-hud="quest-badge" aria-label="Quest updated" /> : null}
      </button>
      {open ? (
        <section className="hud-v5-plate hud-v5-panel mt-1" data-testid="quest-panel">
          <p className="font-semibold leading-snug">{hud.questText}</p>
          <p className="mt-1 text-xs text-[#d5d0c4]">{hud.clock}</p>
          <p className="text-xs">{hud.karmaWord}</p>
          {hud.v13 ? (
            <div className="mt-1 border-t border-[#3c4348] pt-1 text-xs" data-testid="main-tracker">
              <p className="font-bold uppercase tracking-widest text-[#d5d0c4]">The Long Winter · Act {hud.v13.main.act}</p>
              <p className="leading-snug"><span className="font-semibold">{hud.v13.main.title}</span> · {hud.v13.main.goal}</p>
              <p className="mt-0.5 text-[#b7b2a6]" data-testid="weather-line">{hud.v13.weather.name} · {hud.v13.moon.name}{hud.v13.ail.length ? ` · ${hud.v13.ail.map((a: { name: string }) => a.name).join(", ")}` : ""}</p>
              <div className="mt-1 flex gap-1" data-testid="needs-bars">
                {([["hunger", "Food", "#c98a4a"], ["thirst", "Water", "#5a8ac0"], ["sleep", "Sleep", "#9a8ac0"]] as const).map(([k, l, c]) => (
                  <div key={k} className="flex-1" title={`${l} ${Math.round(hud.v13.needs[k])}`}>
                    <div className="h-1.5 bg-black/50"><div className="h-full" style={{ width: `${hud.v13.needs[k]}%`, background: c }} /></div>
                    <span className="text-[10px] text-[#b7b2a6]">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {showTracker && act.length ? (
            <div className="mt-1 border-t border-[#3c4348] pt-1" data-testid="quest-tracker">
              <button type="button" className="flex min-h-10 w-full items-center justify-between text-xs uppercase tracking-widest text-[#d5d0c4]" onClick={onTracker}>
                Tracking {act.length}{hud.v113?.wind ? ` · wind ${hud.v113.wind}` : ""} <span>{trackerOpen ? "–" : "+"}</span>
              </button>
              {trackerOpen ? (
                <ul className="space-y-0.5">
                  {act.map((e) => (
                    <li key={e.id} className="text-xs leading-snug">
                      <span className="font-semibold">{e.title}</span>
                      <span className="text-[#b7b2a6]"> · {e.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export function HudBar({ hud, api }: { hud: HudSnapshot; api: Api }) {
  const tb = (hud as HudSnapshot & { tb15?: { on?: boolean; mine?: boolean; ap?: number; maxAp?: number; cur?: string; canEnd?: boolean; mag?: { n: number; max: number } | null; cost?: Record<string, number> } }).tb15;
  const [cycle, setCycle] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const comps = hud.companions15 ?? [];
  const item = quickItem(hud.pack);
  const crouch = !!hud.v141?.crouch;
  const aimed = cycle >= 2;
  const apNow = tb?.on ? tb.ap ?? 0 : hud.ap;
  const apMax = Math.max(1, tb?.on ? tb.maxAp ?? hud.maxAp : hud.maxAp);
  const gun = !!hud.weaponGun;
  const apCost = tb?.on && tb.cost ? (gun ? tb.cost.gun : tb.cost.melee) + (aimed ? tb.cost.aimed ?? 0 : 0) : null;
  const lines = hud.log.length ? hud.log : [`${hud.name} · ${hud.roleTitle}`];

  useEffect(() => {
    try { if (!localStorage.getItem("maine-rpg-hint-touch")) setHint(true); } catch { /* private */ }
  }, []);
  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => {
      setHint(false);
      try { localStorage.setItem("maine-rpg-hint-touch", "1"); } catch { /* private */ }
    }, 7000);
    return () => window.clearTimeout(t);
  }, [hint]);
  useEffect(() => {
    const el = logRef.current;
    if (!el || !stick.current) return;
    el.scrollTop = el.scrollHeight;
  }, [hud.log.length, lines.length]);

  function cycleWeapon() {
    const next = (cycle + 1) % 4;
    if (cycle % 2 !== next % 2) api?.v141("swapSlots");
    api?.v141("setAim", next >= 2 ? "head" : "torso");
    setCycle(next);
  }

  function order(c: Comp, mode: "auto" | "attack" | "defend") {
    api?.v141("compOrder", [c.id, mode]);
    setOpenId(null);
  }

  return (
    <div data-fobar="1" data-hud="v5bar" className="pointer-events-auto z-40 mt-1 flex w-full flex-col gap-1">
      {hint ? <p data-hud="hint" className="pointer-events-none text-[11px] leading-snug text-[#e6e2d8] [text-shadow:0_1px_2px_#000]">Tap a person to talk, the ground to walk. Talk reaches whoever is closest.</p> : null}
      <div className="flex w-full items-end gap-1.5">
      <div className="hud-v5-plate hud-v5-cluster">
        <button type="button" data-hud="crouch" data-fobar-btn={crouch ? "Stand" : "Crouch"} aria-pressed={crouch} aria-label={crouch ? "Stand" : "Crouch, sneak"} className={`hud-v5-crouch ${crouch ? "on" : ""}`} style={{ touchAction: "manipulation" }} onClick={() => api?.v141("crouch")}>
          {crouch ? "Stand" : "Crouch"}
        </button>
        <div data-hud="meters" className="flex items-end gap-[3px]">
          <Meter k="hp" label={`Health ${Math.ceil(hud.hp)} of ${hud.maxHp}`} cls="hud-v5-hp" v={pct(hud.hp, hud.maxHp)} name="HP" />
          <Meter k="ap" label={`Action points ${apNow} of ${apMax}`} cls="hud-v5-ap" v={pct(apNow, apMax)} name="AP" />
          <Meter k="xp" label={`Level ${hud.level}, experience ${hud.xp} of ${hud.xpNext}`} cls="hud-v5-xp" v={pct(hud.xp, hud.xpNext)} name="XP" />
          <Meter k="noise" label={`Noise ${hud.v141?.noise ?? 0}`} cls="hud-v5-noise" v={hud.v141?.noise ?? 0} name="N" />
        </div>
      </div>
      <span data-hud="hp-text" className="sr-only">{Math.ceil(hud.hp)}/{hud.maxHp} · Lv {hud.level}</span>
      {hud.v141?.inj?.length ? (
        <span data-hud="injury" className="mb-1 flex flex-col gap-0.5">
          {hud.v141.inj.map((j: { id: string; name: string; text: string; cure: string }) => (
            <span key={j.id} title={`${j.name}: ${j.text} ${j.cure}`} aria-label={j.name} className="flex size-4 items-center justify-center border border-[#6b4a30] bg-[#1a120e] text-[9px] font-bold text-[#cbb892]">{j.id === "blind" ? "E" : j.id === "arms" ? "A" : "L"}</span>
          ))}
        </span>
      ) : null}
      <section data-hud="log" data-fobar="log" className="hud-v5-plate hud-v5-log" aria-label="Log">
        <div className="hud-v5-log-meta">
          <span data-safe15={hud.safe15 ? "1" : "0"} className={hud.safe15 ? "hud-v5-safe" : "hud-v5-danger"}>{hud.safe15 ? "Safe" : "Danger"}</span>
          <span>Lv {hud.level}</span>
          <button type="button" data-fobar-btn="Talk" data-hud="talk" aria-label="Talk to the nearest person" className="hud-v5-talk" style={{ touchAction: "manipulation" }} onClick={() => api?.tap("interact")}>Talk</button>
        </div>
        <div
          ref={logRef}
          className="hud-v5-log-screen"
          onScroll={(e) => {
            const el = e.currentTarget;
            stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
          }}
        >
          {lines.map((line, i) => (
            <p key={hud.logIds?.[Math.max(0, hud.log.length - lines.length) + i] ?? `${line}-${i}`}>{"\u203a "}{line}</p>
          ))}
        </div>
      </section>
      <div className="flex shrink-0 flex-col items-stretch">
        {tb?.on && tb.mag ? (
          <button type="button" data-tb15="reload" disabled={!tb.mine} className="hud-v5-plate mb-0.5 min-h-6 px-1 text-[9px] disabled:opacity-40" onClick={() => api?.v141("tbReload")}>Reload {tb.cost?.reload ?? ""}</button>
        ) : null}
        <button type="button" data-hud="weapon" data-fobar="slot-a" data-weapon-cycle={cycle} aria-pressed={aimed} title={hud.weaponName || "Empty hands"} className="hud-v5-plate hud-v5-act" style={{ touchAction: "manipulation" }}
          aria-label={`${aimed ? "Aimed " : ""}${hud.weaponName || "Empty hands"}. Cycles weapon one, weapon two, aimed weapon one, aimed weapon two.`}
          onClick={cycleWeapon}>
          {gun ? <Crosshair aria-hidden /> : <Axe aria-hidden />}
          <span className="text-[9px] leading-none text-[#cbb892]">
            {aimed ? <span className="hud-v5-aim">AIM </span> : null}
            {gun ? <span className="tabular-nums">{tb?.mag ? `${tb.mag.n}/${tb.mag.max}` : hud.shells}</span> : <span className="line-clamp-1 max-w-[3rem]">{hud.weaponName || "Hands"}</span>}
            {apCost != null ? <span> {apCost}</span> : null}
          </span>
        </button>
      </div>
      <button type="button" data-hud="item" title={item ? item.name : "Backpack"} aria-label={item ? `Use ${item.name}` : "Open backpack"} className="hud-v5-plate hud-v5-act hud-v5-item" style={{ touchAction: "manipulation" }}
        onClick={() => { if (item) api?.invUse(item.id); else api?.togglePack(); }}>
        <Syringe aria-hidden />
        <span className="text-[10px] leading-none">Item</span>
      </button>
      {tb?.on ? (
        <div data-hud="combat" data-tb15="bar" className="flex w-[3.35rem] shrink-0 flex-col gap-0.5">
          <button type="button" data-tb15="end" disabled={!tb.mine} className="hud-v5-plate hud-v5-end min-h-8 px-0.5 text-[10px] font-semibold disabled:opacity-40" onClick={() => api?.v141("tbEnd")}>End Turn</button>
          <button type="button" data-tb15="endcombat" data-hud="combat-break" disabled={!tb.mine || !tb.canEnd} className="hud-v5-plate min-h-7 px-0.5 text-[10px] disabled:opacity-40" onClick={() => api?.v141("tbEndCombat")}>Combat</button>
          <span data-tb15="turn" className="text-center text-[8px] text-[#a89070]">{tb.mine ? "Your turn" : tb.cur}</span>
        </div>
      ) : (
        <button type="button" data-hud="combat" aria-label="Combat" className="hud-v5-plate hud-v5-act" style={{ touchAction: "manipulation" }} onClick={() => api?.v141("tbEngage")}>
          Combat
        </button>
      )}
      {comps.length ? (
        <div data-hud="companions" className="ml-3 flex items-end gap-1.5">
          {comps.map((c) => (
            <div key={c.id} className="relative">
              {openId === c.id ? (
                <div className="hud-v5-orders" data-hud-orders={c.id} role="menu">
                  {(["auto", "attack", "defend"] as const).map((m) => (
                    <button key={m} type="button" role="menuitem" data-order={m} aria-pressed={c.order === m} className={`hud-v5-plate capitalize ${c.order === m ? "on" : ""}`} onClick={() => order(c, m)}>{m}</button>
                  ))}
                </div>
              ) : null}
              <button type="button" data-hud-companion={c.id} data-portrait={c.sheet ? "sprite" : "fallback"} aria-expanded={openId === c.id} aria-label={`${c.name}${c.down ? ", down" : ""}, ${c.order}`} className={`hud-v5-plate hud-v5-port ${c.down ? "down" : ""}`} style={{ touchAction: "manipulation" }} onClick={() => setOpenId((id) => id === c.id ? null : c.id)}>
                {c.sheet ? (
                  <span className="hud-v5-facebox" aria-hidden>
                    <span className={`hud-v5-face hud-v5-face-${c.grid === "dog" ? "dog" : c.grid === "tall" ? "tall" : "folk"}`} style={{ backgroundImage: `url(${c.sheet})` }} />
                  </span>
                ) : <span className="hud-v5-fallback" aria-hidden>{c.name.slice(0, 1)}</span>}
              </button>
            </div>
          ))}
        </div>
      ) : null}
      </div>
    </div>
  );
}

function Meter({ k, label, cls, v, name }: { k: string; label: string; cls: string; v: number; name: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div data-meter={k} role="meter" aria-label={label} aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} className="hud-v5-meter" title={label}>
        <i className={cls} style={{ height: `${v}%` }} />
      </div>
      <span className="hud-v5-mlab">{name}</span>
    </div>
  );
}
