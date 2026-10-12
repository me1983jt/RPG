// Diablo 2-style pack screen: the hero in the middle with equipment slots around him, a backpack
// grid where items take room, drag (mouse or finger) or tap-to-pick / tap-to-place, and a compare
// panel for whatever is picked.
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import type { GameApi } from "@/game/engine";
import type { InvItem, InvView } from "@/game/types";

type Slot = "head" | "body" | "legs" | "feet" | "hands" | "main" | "off" | "back";
const SLOT_BOX: Record<Slot, { x: number; y: number; w: number; h: number; label: string }> = {
  head: { x: 4, y: 0, w: 2, h: 2, label: "Head" },
  main: { x: 0, y: 1, w: 2, h: 4, label: "Weapon" },
  off: { x: 8, y: 1, w: 2, h: 4, label: "Off-hand" },
  hands: { x: 0, y: 6, w: 2, h: 2, label: "Hands" },
  body: { x: 8, y: 6, w: 2, h: 3, label: "Body" },
  back: { x: 0, y: 9, w: 2, h: 3, label: "Back" },
  legs: { x: 8, y: 9, w: 2, h: 2, label: "Legs" },
  feet: { x: 4, y: 10, w: 2, h: 2, label: "Feet" },
};
const SLOTS = Object.keys(SLOT_BOX) as Slot[];
type From = "grid" | Slot;
interface Pick {
  id: string;
  from: From;
}
interface Drag extends Pick {
  sx: number;
  sy: number;
  x: number;
  y: number;
  /** which cell of the item the finger grabbed */
  gx: number;
  gy: number;
  w: number;
  h: number;
  icon: string;
  live: boolean;
}

function useCell(rows: number) {
  const calc = () => {
    if (typeof window === "undefined") return 30;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const side = vw >= 620; // landscape phones and up: doll and pack side by side
    const byH = side ? (vh - 62) / 12 : (vh - 120) / (12 + rows + 4);
    const byW = side ? (vw - 48) / 21 : (vw - 32) / 10;
    return Math.max(18, Math.min(40, Math.floor(Math.min(byH, byW))));
  };
  const [cell, setCell] = useState(calc);
  useEffect(() => {
    const on = () => setCell(calc());
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [rows]);
  return cell;
}

const QUALITY_TINT: Record<string, string> = { rare: "#e6c56a", good: "#9fb46a", standard: "#c9b48a", poor: "#8a7f70" };

export function Inventory({ inv, api, turnBased, craft, onClose }: { inv: InvView; api: GameApi | null; turnBased: boolean; craft: ReactNode; onClose: () => void }) {
  const cell = useCell(inv.rows);
  const [pick, setPick] = useState<Pick | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [tab, setTab] = useState<"items" | "craft">("items");
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;

  const all: InvItem[] = [...inv.items, ...SLOTS.map((s) => inv.slots[s]).filter((x): x is InvItem => !!x)];
  const picked = pick ? (pick.from === "grid" ? inv.items.find((i) => i.id === pick.id) : inv.slots[pick.from]) ?? null : null;
  useEffect(() => {
    if (pick && !picked) setPick(null);
  }, [pick, picked]);
  const active = drag?.live ? drag : pick;
  const activeItem = active ? all.find((i) => i.id === active.id) : null;
  const canTake = (slot: Slot) => !!activeItem && activeItem.fits.includes(slot);

  // drop: onto a slot (wear), onto the grid (move / take off), anywhere else (nothing)
  const place = (p: Pick, target: { slot?: Slot; cx?: number; cy?: number }) => {
    if (!api) return;
    if (target.slot) {
      if (target.slot === p.from) return;
      api.invEquip(p.id, target.slot);
    } else if (target.cx !== undefined && target.cy !== undefined) {
      if (p.from === "grid") api.invMove(p.id, target.cx, target.cy);
      else api.invUnequip(p.from, target.cx, target.cy);
    }
  };
  const cellAt = (clientX: number, clientY: number, gx = 0, gy = 0) => {
    const g = gridRef.current?.getBoundingClientRect();
    if (!g || clientX < g.left || clientX > g.right || clientY < g.top || clientY > g.bottom) return null;
    return { cx: Math.floor((clientX - g.left) / cell) - gx, cy: Math.floor((clientY - g.top) / cell) - gy };
  };
  const slotAt = (clientX: number, clientY: number): Slot | null => {
    const el = document.elementFromPoint(clientX, clientY)?.closest("[data-slot]") as HTMLElement | null;
    return (el?.dataset.slot as Slot) ?? null;
  };

  const down = (e: RPointerEvent<HTMLElement>, item: InvItem, from: From) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const gx = from === "grid" ? Math.min(item.w - 1, Math.max(0, Math.floor((e.clientX - r.left) / cell))) : 0;
    const gy = from === "grid" ? Math.min(item.h - 1, Math.max(0, Math.floor((e.clientY - r.top) / cell))) : 0;
    setDrag({ id: item.id, from, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, gx, gy, w: item.w, h: item.h, icon: item.icon, live: false });
  };
  const move = (e: RPointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const live = d.live || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8;
    setDrag({ ...d, x: e.clientX, y: e.clientY, live });
  };
  const up = (e: RPointerEvent<HTMLElement>, item: InvItem, from: From) => {
    e.stopPropagation();
    const d = dragRef.current;
    setDrag(null);
    if (!d) return;
    if (d.live) {
      const slot = slotAt(e.clientX, e.clientY);
      const c = cellAt(e.clientX, e.clientY, d.gx, d.gy);
      if (slot) place(d, { slot });
      else if (c) place(d, c);
      setPick({ id: d.id, from: slot ?? "grid" });
      return;
    }
    // a tap: with something picked, tapping a slot that takes it wears it (swap); else pick this
    if (pick && pick.id !== item.id && from !== "grid" && activeItem?.fits.includes(from as Slot)) {
      place(pick, { slot: from as Slot });
      setPick(null);
      return;
    }
    setPick(pick && pick.id === item.id && pick.from === from ? null : { id: item.id, from });
  };
  const tapSlot = (slot: Slot) => {
    if (pick && canTake(slot)) {
      place(pick, { slot });
      setPick(null);
    }
  };
  const tapGrid = (e: RPointerEvent<HTMLDivElement>) => {
    if (!pick) return;
    const c = cellAt(e.clientX, e.clientY);
    if (!c) return;
    place(pick, c);
    setPick(null);
  };

  const ghostCell = drag?.live ? cellAt(drag.x, drag.y, drag.gx, drag.gy) : null;
  const S = (n: number) => n * cell;
  const equippedFor = (it: InvItem) => {
    const slot = it.fits[0] as Slot | undefined;
    const worn = slot ? inv.slots[slot] : null;
    return worn && worn.id !== it.id ? worn : null;
  };

  const itemBox = (it: InvItem, from: From, box: { x: number; y: number; w: number; h: number }) => {
    const isPicked = pick?.id === it.id && pick.from === from;
    const dragging = drag?.live && drag.id === it.id && drag.from === from;
    return (
      <button
        key={`${from}-${it.id}`}
        type="button"
        aria-label={it.name}
        className="absolute flex items-center justify-center"
        style={{
          left: S(box.x),
          top: S(box.y),
          width: S(box.w),
          height: S(box.h),
          touchAction: "none",
          opacity: dragging ? 0.35 : 1,
          background: from === "grid" ? "rgba(36,30,24,0.92)" : "transparent",
          boxShadow: isPicked ? "inset 0 0 0 2px #e6c56a" : from === "grid" ? `inset 0 0 0 1px ${QUALITY_TINT[it.quality] ?? "#6b6052"}55` : "none",
        }}
        onPointerDown={(e) => down(e, it, from)}
        onPointerMove={move}
        onPointerUp={(e) => up(e, it, from)}
        onPointerCancel={() => setDrag(null)}
      >
        <img src={it.icon} alt="" draggable={false} className="pointer-events-none max-h-[92%] max-w-[92%] object-contain" />
        {it.qty > 1 ? <span className="pointer-events-none absolute bottom-0 right-0.5 text-[10px] font-bold text-[#efe6d4] [text-shadow:0_1px_2px_#000]">{it.qty}</span> : null}
      </button>
    );
  };

  const statLine = (it: InvItem) => {
    const worn = equippedFor(it);
    const parts: ReactNode[] = [];
    const cmp = (label: string, a: number, b: number | null) => {
      const d = b === null ? null : a - b;
      parts.push(
        <div key={label} className="flex justify-between gap-2">
          <span className="text-muted">{label}</span>
          <span className="font-semibold">
            {a}
            {d !== null && d !== 0 ? <span className={d > 0 ? " text-[#9fb46a]" : " text-[#d0745a]"}> ({d > 0 ? "+" : ""}{d})</span> : null}
          </span>
        </div>,
      );
    };
    if (it.kind === "weapon") cmp("Attack", it.atk, worn ? worn.atk : inv.slots.main ? null : 0);
    if (it.kind === "coat") cmp("Armor", it.def, worn ? worn.def : 0);
    if (it.heal > 0) cmp("Heals", it.heal, null);
    if (it.worth > 0) cmp("Trades for", it.worth, null);
    return (
      <div className="space-y-0.5 text-xs">
        {parts}
        {worn ? <div className="text-[10px] text-muted">vs worn: {worn.name}</div> : null}
      </div>
    );
  };

  const slotOf = (it: InvItem): Slot | null => (SLOTS.find((s) => inv.slots[s]?.id === it.id) ?? null);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-1"
      onPointerMove={(e) => drag && move(e as unknown as RPointerEvent<HTMLElement>)}
      onPointerUp={() => drag && !drag.live && setDrag(null)}
    >
      <section className="plank flex max-h-full flex-col border border-border bg-surface p-2" style={{ touchAction: "none" }}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="font-display text-lg leading-none">Pack</p>
          <div className="flex items-center gap-1 text-xs">
            <span className="mr-1 text-muted">
              Atk <b className="text-text">{inv.atk}</b> · Armor <b className="text-text">{inv.def}</b>
            </span>
            {(["items", "craft"] as const).map((t) => (
              <button key={t} type="button" className={`plank border px-2.5 py-1.5 font-semibold capitalize ${tab === t ? "border-primary bg-primary text-bg" : "border-border bg-bg"}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
            <button type="button" className={`plank border px-2.5 py-1.5 font-semibold ${turnBased ? "border-primary bg-surface-2 text-primary" : "border-border bg-bg"}`} onClick={() => api?.setTurnBased(!turnBased)}>
              {turnBased ? "Turn-based" : "Real time"}
            </button>
            <button type="button" aria-label="Close pack" className="plank border border-border bg-bg px-3 py-1.5 font-bold" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        <div className="flex min-h-0 flex-wrap justify-center gap-2">
          {/* the doll */}
          <div className="relative shrink-0 rounded-sm bg-[#1b1611]" style={{ width: S(10), height: S(12) }}>
            <div className="pointer-events-none absolute flex items-end justify-center" style={{ left: S(2), top: S(2), width: S(6), height: S(8) }}>
              {inv.figure ? (
                <div className="relative h-full" style={{ aspectRatio: "88 / 124" }}>
                  <img src={inv.figure} alt="" className="absolute inset-0 h-full w-full [image-rendering:pixelated]" />
                  {inv.overlays.map((src) => (
                    <img key={src} src={src} alt="" className="absolute inset-0 h-full w-full [image-rendering:pixelated]" />
                  ))}
                </div>
              ) : null}
            </div>
            {SLOTS.map((slot) => {
              const b = SLOT_BOX[slot];
              const it = inv.slots[slot];
              const glow = activeItem && canTake(slot);
              return (
                <div
                  key={slot}
                  data-slot={slot}
                  className="absolute"
                  style={{
                    left: S(b.x),
                    top: S(b.y),
                    width: S(b.w),
                    height: S(b.h),
                    background: "rgba(14,11,8,0.85)",
                    boxShadow: glow ? "inset 0 0 0 2px #9fb46a, 0 0 8px #9fb46a88" : "inset 0 0 0 1px #5a4c3c, inset 0 0 0 2px #120e0a",
                  }}
                  onPointerUp={() => !drag?.live && tapSlot(slot)}
                >
                  {it ? itemBox(it, slot, { x: 0, y: 0, w: b.w, h: b.h }) : <span className="pointer-events-none absolute inset-x-0 bottom-0.5 text-center text-[9px] uppercase tracking-wide text-[#6f6252]">{b.label}</span>}
                </div>
              );
            })}
          </div>
          {/* the backpack grid and the info / craft side */}
          <div className="flex shrink-0 flex-col gap-2" style={{ width: S(10) + 2, height: S(12) }}>
            {tab === "items" ? (
              <>
                <div
                  ref={gridRef}
                  className="relative shrink-0"
                  style={{
                    width: S(10),
                    height: S(inv.rows),
                    backgroundColor: "#15110d",
                    backgroundImage: "linear-gradient(#3a3026 1px, transparent 1px), linear-gradient(90deg, #3a3026 1px, transparent 1px)",
                    backgroundSize: `${cell}px ${cell}px`,
                    boxShadow: "0 0 0 1px #5a4c3c",
                  }}
                  onPointerUp={(e) => !drag?.live && tapGrid(e)}
                >
                  {inv.over > 0 ? <div className="pointer-events-none absolute inset-x-0 bg-[#d0745a22]" style={{ top: S(inv.rows - inv.over), height: S(inv.over) }} /> : null}
                  {ghostCell ? (
                    <div className="pointer-events-none absolute" style={{ left: S(ghostCell.cx), top: S(ghostCell.cy), width: S(drag!.w), height: S(drag!.h), boxShadow: "inset 0 0 0 2px #e6c56a" }} />
                  ) : null}
                  {inv.items.map((it) => itemBox(it, "grid", it))}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto plank border border-border bg-bg p-2">
                  {picked ? (
                    <div className="flex h-full flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold leading-tight">{picked.name}</span>
                        <span className="text-[10px] capitalize" style={{ color: QUALITY_TINT[picked.quality] }}>
                          {picked.quality}
                        </span>
                      </div>
                      {statLine(picked)}
                      <p className="text-[11px] leading-snug text-muted">{picked.note}</p>
                      <div className="mt-auto flex flex-wrap gap-1">
                        {slotOf(picked) && pick?.from !== "grid" ? (
                          <button type="button" className="plank border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold" onClick={() => { api?.invUnequip(pick!.from); setPick(null); }}>
                            Take off
                          </button>
                        ) : null}
                        {pick?.from === "grid"
                          ? picked.fits.map((s) => (
                              <button key={s} type="button" className="plank bg-primary px-3 py-1.5 text-xs font-semibold text-bg" onClick={() => { api?.invEquip(picked.id, s); setPick(null); }}>
                                {s === "off" ? "Off-hand" : picked.kind === "weapon" ? "Wield" : "Wear"}
                              </button>
                            ))
                          : null}
                        {picked.kind !== "weapon" && picked.kind !== "coat" && (picked.heal > 0 || picked.worth > 0 || ["bomb", "fuel", "baitpack"].includes(picked.id)) ? (
                          <button type="button" className="plank bg-primary px-3 py-1.5 text-xs font-semibold text-bg" onClick={() => api?.invUse(picked.id)}>
                            {picked.worth > 0 ? "Trade for iron" : "Use"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] leading-snug text-muted">
                      Drag an item onto a slot to wear it, or back into the pack to take it off. Or tap an item, then tap where it goes.
                      {inv.over > 0 ? " The red rows are overfull: wear or use something before you pick up more." : ""}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">{craft}</div>
            )}
          </div>
        </div>
      </section>
      {drag?.live ? (
        <img
          src={drag.icon}
          alt=""
          className="pointer-events-none fixed z-50 object-contain opacity-90"
          style={{ left: drag.x - (drag.gx + 0.5) * cell, top: drag.y - (drag.gy + 0.5) * cell, width: S(drag.w), height: S(drag.h) }}
        />
      ) : null}
    </div>,
    document.body,
  );
}
