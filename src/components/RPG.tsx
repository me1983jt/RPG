import { WM_COLS, WM_HEX, WM_H, WM_LOCS, WM_ROWS, WM_W, hexAt, hexCenter } from "@/game/worldmap";
/** v15.8: world-map location id -> Quest RPG town icon (public/game/v4/icons/<name>_icon_v4.png). */
const TOWN_ICONS: Record<string, string> = { farm: "harmony", pittsfield: "pittsfield", skowhegan: "skowhegan", skow: "skowhegan", greenville: "greenville" };
import { createPortal } from "react-dom";
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
  DoorOpen,
  Map as MapIcon,
} from "lucide-react";
import { mountGame, type GameApi } from "@/game/engine";
import { Inventory } from "@/components/Inventory";
import { useHud, useModeResult, useRaidMode } from "@/game/store";
import { RECIPES } from "@/game/types";
import { GEAR, CRAFT, LOOKS, ROLES, TRAITS, defaultLook, roleStats, type LookId, type RoleId, type TraitId } from "@/game/gear";
import { COAT_PICKS, HAT_PICKS, HAIRS, dyeBodySheet, type HairId, type StartLook } from "@/game/look";
import type { PerkId, SkillId } from "@/game/progress";

const RECIPE_ICON = [House, Columns3, Hammer, Flame] as const;

function LookPreview({ look, hair, coat, hat, trousers, boots }: StartLook & { look: LookId }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let dead = false;
    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(src));
        img.src = src;
      });
    void (async () => {
      try {
        const hero = await load("/game/hero.png?v=2072");
        const ids = [trousers ? "trousers" : "", boots ? "boots" : "", coat, hat].filter(Boolean);
        const parts: HTMLImageElement[] = [];
        for (const id of ids) {
          try {
            parts.push(await load(`/game/overlay/${id}.png?v=2072`));
          } catch {
            /* missing sheet stays off the preview */
          }
        }
        if (dead || !ref.current) return;
        const cw = 88;
        const ch = 124;
        const tmp = document.createElement("canvas");
        tmp.width = cw;
        tmp.height = ch;
        const tg = tmp.getContext("2d", { willReadFrequently: true });
        const g = ref.current.getContext("2d");
        if (!tg || !g) return;
        tg.drawImage(hero, 0, 0, cw, ch, 0, 0, cw, ch);
        const dyed = tg.getImageData(0, 0, cw, ch);
        dyeBodySheet(dyed, 1, look, hair, 1);
        tg.putImageData(dyed, 0, 0);
        for (const part of parts) tg.drawImage(part, 0, 0, cw, ch, 0, 0, cw, ch);
        // v14.1: crop to the figure so the preview fills its box instead of a small hero lost at the bottom of an empty cell
        const px = tg.getImageData(0, 0, cw, ch).data;
        let x0 = cw, y0 = ch, x1 = 0, y1 = 0;
        for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (px[(y * cw + x) * 4 + 3] > 20) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        if (x1 < x0) { x0 = 0; y0 = 0; x1 = cw - 1; y1 = ch - 1; }
        const side = Math.max(x1 - x0, (y1 - y0) * 0.72) + 8, mx = (x0 + x1) / 2, sw = Math.round(side), sh = Math.round(side / 0.72);
        const sx = Math.round(mx - sw / 2), sy = Math.round(y1 + 4 - sh);
        const k = 4;
        ref.current.width = sw * k;
        ref.current.height = sh * k;
        g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, sw * k, sh * k);
        g.drawImage(tmp, sx, sy, sw, sh, 0, 0, sw * k, sh * k);
      } catch {
        /* preview is optional */
      }
    })();
    return () => {
      dead = true;
    };
  }, [look, hair, coat, hat, trousers, boots]);
  return <canvas ref={ref} aria-label="Character preview" className="h-36 w-auto short:h-24" />;
}

function WorldMap14({ wm, go }: { wm: any; go: (q: number, r: number) => void }) {
  // v14.1: fills its box; drag to pan, pinch or wheel to zoom, tap a hex to travel. Labels draw at screen size so they stay readable.
  const ref = useRef<HTMLCanvasElement | null>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const view = useRef<{ s: number; x: number; y: number; w: number; h: number; init: boolean }>({ s: 1, x: 0, y: 0, w: 0, h: 0, init: false });
  const ptr = useRef(new Map<number, { x: number; y: number; sx: number; sy: number }>());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const [tick, setTick] = useState(0);
  const redraw = () => setTick((n) => n + 1);
  useEffect(() => { const i = new Image(); i.onload = redraw; i.src = "/game/v14/worldmap.jpg"; img.current = i; }, []);
  // v15.8: Quest RPG painted town icons replace the plain house-block markers
  const icons = useRef<Record<string, HTMLImageElement>>({});
  useEffect(() => { for (const [loc, f] of Object.entries(TOWN_ICONS)) { const i = new Image(); i.onload = redraw; i.src = `/game/v4/icons/${f}_icon_v4.png`; icons.current[loc] = i; } }, []);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ro = new ResizeObserver(() => redraw()); ro.observe(c); return () => ro.disconnect();
  }, []);
  const clamp = () => {
    const v = view.current; const mw = WM_W * v.s, mh = WM_H * v.s;
    v.x = mw <= v.w ? (v.w - mw) / 2 : Math.min(0, Math.max(v.w - mw, v.x));
    v.y = mh <= v.h ? (v.h - mh) / 2 : Math.min(0, Math.max(v.h - mh, v.y));
  };
  const zoomAt = (f: number, px: number, py: number) => {
    const v = view.current; const min = Math.min(v.w / WM_W, v.h / WM_H), max = Math.max(min * 4, 2.2);
    const ns = Math.max(min, Math.min(max, v.s * f)); const k = ns / v.s;
    v.x = px - (px - v.x) * k; v.y = py - (py - v.y) * k; v.s = ns; clamp(); redraw();
  };
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const g = c.getContext("2d"); if (!g) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const W = c.clientWidth, H = c.clientHeight; if (!W || !H) return;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    const v = view.current; v.w = W; v.h = H;
    if (!v.init) {
      // fill the screen: scale so the map covers the box, then centre on where you are
      v.s = Math.max(W / WM_W, H / WM_H) * (H > W ? 1 : 1.15);
      const p = hexCenter(wm.q, wm.r); v.x = W / 2 - p.x * v.s; v.y = H / 2 - p.y * v.s; v.init = true;
    }
    clamp();
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#1c1814"; g.fillRect(0, 0, W, H);
    g.save(); g.translate(v.x, v.y); g.scale(v.s, v.s);
    if (img.current?.complete && img.current.naturalWidth) g.drawImage(img.current, 0, 0, WM_W, WM_H);
    const fog = new Set<string>(wm.fog);
    const hexPathD = (x: number, y: number, s: number) => { g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); g.lineTo(x + s * Math.cos(a), y + s * Math.sin(a)); } g.closePath(); };
    for (let r = 0; r < WM_ROWS; r++) for (let q = 0; q < WM_COLS; q++) {
      const { x, y } = hexCenter(q, r);
      hexPathD(x, y, WM_HEX);
      if (!fog.has(`${q},${r}`)) { g.fillStyle = "rgba(24,20,16,0.88)"; g.fill(); }
      g.strokeStyle = "rgba(240,220,170,0.4)"; g.lineWidth = 1.5 / v.s; g.stroke();
    }
    g.strokeStyle = "#f0d090"; g.lineWidth = 3 / v.s; g.setLineDash([6 / v.s, 6 / v.s]); g.beginPath();
    const st = hexCenter(wm.q, wm.r); g.moveTo(st.x, st.y);
    for (const [q, r] of wm.path) { const p = hexCenter(q, r); g.lineTo(p.x, p.y); }
    g.stroke(); g.setLineDash([]);
    for (const l of WM_LOCS) {
      const ic = icons.current[l.id];
      if (!ic?.complete || !ic.naturalWidth || !fog.has(`${l.q},${l.r}`) || (wm.locked ?? []).includes(l.id)) continue;
      const p = hexCenter(l.q, l.r), sz = WM_HEX * 1.55;
      g.save(); g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = 6; g.drawImage(ic, p.x - sz / 2, p.y - sz * .62, sz, sz); g.restore();
    }
    g.restore();
    const sc = (x: number, y: number) => ({ x: v.x + x * v.s, y: v.y + y * v.s });
    g.textAlign = "center"; g.textBaseline = "middle";
    const label = (name: string, q: number, r: number, color: string, sub?: string) => {
      const p = hexCenter(q, r); const o = sc(p.x, p.y);
      g.font = "600 15px sans-serif"; const w = Math.max(g.measureText(name).width, sub ? g.measureText(sub).width * 0.85 : 0) + 14;
      const h = sub ? 38 : 24; const y = o.y + 18 * Math.min(1.6, v.s * 1.1);
      g.fillStyle = "rgba(20,16,12,0.85)"; g.fillRect(o.x - w / 2, y, w, h);
      g.strokeStyle = color; g.lineWidth = 1; g.strokeRect(o.x - w / 2 + .5, y + .5, w - 1, h - 1);
      g.fillStyle = "#f4e6c4"; g.fillText(name, o.x, y + 12);
      if (sub) { g.font = "12px sans-serif"; g.fillStyle = color; g.fillText(sub, o.x, y + 28); }
    };
    for (const l of WM_LOCS) if (fog.has(`${l.q},${l.r}`) && !(wm.locked ?? []).includes(l.id)) label(l.name, l.q, l.r, l.lock ? "#7fb8d8" : "#c9a36a"); // v15.4: locked spots stay hidden
    for (const l of (wm.loot ?? [])) if (fog.has(`${l.q},${l.r}`)) label(l.name, l.q, l.r, l.ready ? "#9fd07a" : "#9a8a70", l.ready ? "Loot restocked" : `Picked over · ${l.days}d`);
    for (const t of (wm.tq ?? [])) { const p = hexCenter(t.q, t.r); const o = sc(p.x, p.y); g.fillStyle = "#f0c040"; g.strokeStyle = "#1c1814"; g.lineWidth = 3; g.beginPath(); g.moveTo(o.x, o.y - 30); g.lineTo(o.x + 9, o.y - 14); g.lineTo(o.x - 9, o.y - 14); g.closePath(); g.fill(); g.stroke(); g.font = "600 12px sans-serif"; g.fillStyle = "#f0c040"; g.fillText(t.label, o.x, o.y - 38); }
    const m = sc(st.x, st.y);
    g.fillStyle = "#d0644a"; g.strokeStyle = "#1c1814"; g.lineWidth = 3;
    g.beginPath(); g.arc(m.x, m.y - 4, 11, 0, Math.PI * 2); g.fill(); g.stroke();
  });
  const local = (e: React.PointerEvent | React.WheelEvent) => { const b = ref.current!.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  return (
    <canvas ref={ref} data-testid="hex-map" data-zoom={view.current.s.toFixed(3)} data-tick={tick} className="block h-full w-full plank border border-border" style={{ touchAction: "none" }}
      onWheel={(e) => { const p = local(e); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y); }}
      onPointerDown={(e) => { (e.target as HTMLCanvasElement).setPointerCapture?.(e.pointerId); const p = local(e); ptr.current.set(e.pointerId, { ...p, sx: p.x, sy: p.y });
        if (ptr.current.size === 2) { const [a, b] = [...ptr.current.values()]; pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.current.s }; } }}
      onPointerMove={(e) => { const o = ptr.current.get(e.pointerId); if (!o) return; const p = local(e); const v = view.current;
        if (ptr.current.size >= 2 && pinch.current) { o.x = p.x; o.y = p.y; const [a, b] = [...ptr.current.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
          zoomAt(pinch.current.s * d / Math.max(1, pinch.current.d) / v.s, (a.x + b.x) / 2, (a.y + b.y) / 2); return; }
        v.x += p.x - o.x; v.y += p.y - o.y; o.x = p.x; o.y = p.y; clamp(); redraw(); }}
      onPointerUp={(e) => { const o = ptr.current.get(e.pointerId); ptr.current.delete(e.pointerId); if (ptr.current.size < 2) pinch.current = null;
        if (!o || ptr.current.size) return; const p = local(e); if (Math.hypot(p.x - o.sx, p.y - o.sy) > 10) return;
        const v = view.current; const h = hexAt((p.x - v.x) / v.s, (p.y - v.y) / v.s); if (h) go(h[0], h[1]); }}
      onPointerCancel={(e) => { ptr.current.delete(e.pointerId); pinch.current = null; }} />
  );
}

/** v14.1 one-thumb stick: drag from the ring; the knob's offset is the walk direction and speed. */
function Stick141({ onMove }: { onMove: (x: number, y: number) => void }) {
  const [k, setK] = useState({ x: 0, y: 0 });
  const id = useRef<number | null>(null);
  const R = 52;
  const upd = (e: React.PointerEvent) => {
    const b = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x = e.clientX - (b.left + b.width / 2), y = e.clientY - (b.top + b.height / 2);
    const m = Math.hypot(x, y); if (m > R) { x = x / m * R; y = y / m * R; }
    setK({ x, y }); onMove(x / R, y / R);
  };
  const end = () => { id.current = null; setK({ x: 0, y: 0 }); onMove(0, 0); };
  return (
    <div data-v141="stick" aria-label="Move stick" className="pointer-events-auto absolute bottom-[calc(max(0.5rem,env(safe-area-inset-bottom))+9.5rem)] left-[max(0.75rem,env(safe-area-inset-left))] z-40 size-32 rounded-full border-2 border-border bg-bg/40 short:bottom-[calc(max(0.5rem,env(safe-area-inset-bottom))+3.5rem)] short:size-28"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => { id.current = e.pointerId; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); upd(e); e.stopPropagation(); }}
      onPointerMove={(e) => { if (id.current === e.pointerId) upd(e); }}
      onPointerUp={end} onPointerCancel={end}>
      <span className="pointer-events-none absolute left-1/2 top-1/2 size-14 rounded-full border-2 border-primary bg-surface/90" style={{ transform: `translate(calc(-50% + ${k.x}px), calc(-50% + ${k.y}px))` }} />
    </div>
  );
}

export function RPG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);
  const pinchMid = useRef({ x: 0, y: 0 });
  const pinching = useRef(false);
  const hud = useHud();
  const raidResult = useRaidMode((s) => s.result);
  const modeResult = useModeResult((s) => s.result);
  const [name, setName] = useState("Packer");
  const [role, setRole] = useState<RoleId>("fighter");
  const [look, setLook] = useState<LookId>("wool");
  const [hair, setHair] = useState<HairId>("black");
  const [coat, setCoat] = useState<StartLook["coat"]>("");
  const [hat, setHat] = useState<StartLook["hat"]>("");
  const [trousers, setTrousers] = useState(true);
  const [boots, setBoots] = useState(true);
  const [backstory, setBackstory] = useState<"veteran" | "mechanic" | "farmer" | "hunter">("hunter");
  const [hardMode, setHardMode] = useState(false);
  const [jNotes, setJNotes] = useState<string | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const [step, setStep] = useState<"trade" | "points" | "trait">("trade");
  const [trait, setTrait] = useState<TraitId | null>(null);
  const [bonus, setBonus] = useState({ strength: 0, vigor: 0, endurance: 0, intellect: 0, perception: 0, luck: 0 });
  const [packTab, setPackTab] = useState<"items" | "craft">("items");
  const [journalOpen, setJournalOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  // v14.1 Chromebook / keyboard: M map, J journal (the engine takes WASD, arrows, I, B, C, X, Space, Esc)
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.repeat || (e.target as HTMLElement)?.tagName === "INPUT") return;
      const h = useHud.getState();
      if (h.phase !== "play") return;
      if (e.code === "KeyM") setMapOpen((o) => !o);
      else if (e.code === "KeyJ") setJournalOpen((o) => !o);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);
  const [jTab, setJTab] = useState<"main" | "quests" | "skills" | "ach" | "farm" | "allies" | "diary" | "gear">("quests");
  const [toastN, setToastN] = useState(0);
  const toast = hud.v113?.toast;
  useEffect(() => {
    if (!toast) return;
    setToastN(toast.n);
    const t = window.setTimeout(() => setToastN(-toast.n), 3800);
    return () => window.clearTimeout(t);
  }, [toast?.n]);
  const [trackerOpen, setTrackerOpen0] = useState(() => { try { const v = JSON.parse(localStorage.getItem("maine-rpg-hud") || "{}"); if (typeof v.track === "boolean") return !v.track; } catch { /* none */ } return typeof window === "undefined" || (window.innerHeight >= 500 && !(window.innerWidth >= 1024 && window.innerWidth > window.innerHeight)); });
  // v14 collapsible HUD: quest, track, health, aim, mini. true = collapsed. Kept in localStorage.
  const [hcS, setHc] = useState<Record<string, boolean>>(() => {
    // v14.1: on portrait phones the quest panel and character panel start collapsed to one thin line each
    const portrait = typeof window !== "undefined" && window.innerHeight > window.innerWidth && window.innerWidth < 700;
    let v: Record<string, boolean> = {};
    try { v = JSON.parse(localStorage.getItem("maine-rpg-hud") || "{}"); } catch { v = {}; }
    if (portrait) { if (typeof v.quest !== "boolean") v.quest = true; if (typeof v.health !== "boolean") v.health = true; }
    return v;
  });
  const saveHc = (next: Record<string, boolean>) => { setHc(next); try { localStorage.setItem("maine-rpg-hud", JSON.stringify(next)); } catch { /* private mode */ } };
  const flipHc = (k: string) => saveHc({ ...hcS, [k]: !hcS[k] });
  // v14.1: build mode auto-collapses the other panels (your saved choice comes back when you close Build)
  const hc: Record<string, boolean> = hud.buildOpen ? { ...hcS, quest: true, health: true, mini: true, aim: true, track: true } : hcS;
  const setTrackerOpen = (f: (o: boolean) => boolean) => { setTrackerOpen0((o) => { const n = f(o); saveHc({ ...hcS, track: !n }); return n; }); };
  const [flash, setFlash] = useState<Record<string, number>>({});
  const lastQ = useRef("");
  const lastHp = useRef(0);
  useEffect(() => {
    if (lastQ.current && hud.questText !== lastQ.current && hc.quest) setFlash((f) => ({ ...f, quest: Date.now() }));
    lastQ.current = hud.questText;
  }, [hud.questText]);
  useEffect(() => {
    if (hc.health && hud.hp < lastHp.current - 0.5) setFlash((f) => ({ ...f, health: Date.now() }));
    lastHp.current = hud.hp;
  }, [hud.hp]);
  useEffect(() => { const t = window.setInterval(() => setFlash((f) => { const n = { ...f }; let ch = false; for (const k in n) if (Date.now() - n[k] > 2400) { delete n[k]; ch = true; } return ch ? n : f; }), 600); return () => window.clearInterval(t); }, []);
  const fl = (k: string) => (flash[k] ? "animate-pulse ring-2 ring-primary" : "");
  const MinBtn = ({ k, label, tight }: { k: string; label: string; tight?: boolean }) => (
    <button type="button" data-hud-min={k} aria-label={`${hc[k] ? "Expand" : "Minimize"} ${label}`} className={`${tight ? "" : "-my-2"} min-h-10 min-w-10 shrink-0 px-1 text-sm font-bold text-primary`} onClick={() => flipHc(k)}>{hc[k] ? "+" : "–"}</button>
  );
  const mapRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!mapOpen) return;
    const draw = () => mapRef.current && apiRef.current?.drawMap(mapRef.current);
    draw();
    const t = window.setInterval(draw, 500);
    return () => window.clearInterval(t);
  }, [mapOpen]);
  const [confirmExit, setConfirmExit] = useState(false);
  const short = useShortScreen();
  const playing = hud.phase !== "menu";
  const tb = (hud as any).tb15 as Tb15 | undefined;
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

  // Android back button (Capacitor App plugin): close the open panel or open/close the pause menu.
  // The app only exits from the main menu, after a confirm.
  const onBack = useRef<() => void>(() => {});
  onBack.current = () => {
    if (confirmExit) return setConfirmExit(false);
    if (hud.phase === "menu") {
      if (confirmNew) return setConfirmNew(false);
      if (step === "trait") return setStep("points");
      if (step === "points") return setStep("trade");
      return setConfirmExit(true);
    }
    if (journalOpen && hud.phase === "play" && !hud.dialogue) return setJournalOpen(false);
    apiRef.current?.back();
  };
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: CapBridge }).Capacitor;
    if (!cap?.isNativePlatform?.() || typeof cap.addListener !== "function") return;
    const sub = cap.addListener("App", "backButton", () => onBack.current());
    return () => {
      void sub?.remove?.();
    };
  }, []);

  function exitApp(): void {
    const cap = (window as unknown as { Capacitor?: CapBridge }).Capacitor;
    try {
      (window as unknown as { __maineSave?: () => void }).__maineSave?.();
    } catch {
      /* nothing to save on the main menu */
    }
    cap?.nativeCallback?.("App", "exitApp", {});
  }

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

  // v14.1 URL test harness: ?test=wave3 | nightraid | worldmap&enc=caravan | guns starts a game and sets the scene
  useEffect(() => {
    if (typeof location === "undefined") return;
    const q = new URLSearchParams(location.search);
    const test = q.get("test");
    if (!test) return;
    const w = window as unknown as Record<string, unknown>;
    if (q.get("skip") !== "0") w.__v14Skip = true;
    if (q.get("enc")) { w.__wmKind = q.get("enc"); w.__wmEnc = 0; }
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (!apiRef.current || tries > 60) { if (tries > 60) window.clearInterval(id); return; }
      window.clearInterval(id);
      apiRef.current.begin("Tester", "fighter" as RoleId, { strength: 1, vigor: 1, endurance: 1, intellect: 0, perception: 0, luck: 0 }, "eye" as TraitId, "wool" as LookId, { hair: "black", coat: "", hat: "", trousers: true, boots: true, backstory: "hunter", hard: false });
      window.setTimeout(() => {
        const ct = (window as unknown as { __controlsTest?: { testScenario?: (n: string, o: Record<string, string>) => string } }).__controlsTest;
        console.info("test harness:", test, ct?.testScenario?.(test, { enc: q.get("enc") ?? "" }));
      }, 1800);
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  function startNew(): void {
    if (!trait || pointsLeft !== 0) return;
    apiRef.current?.begin(name, role, bonus, trait, look, { hair, coat, hat, trousers, boots, backstory, hard: hardMode });
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
        onWheel={(e) => apiRef.current?.nudgeZoom(e.deltaY < 0 ? 1.1 : 1 / 1.1)}
      />

      {playing ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col p-2 short:p-1.5 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))]">
          {hud.inside && (hud.phase === "play" || hud.phase === "dialogue") ? (
            <button
              type="button"
              aria-label="Leave building"
              className="pointer-events-auto absolute right-2 top-1/2 z-40 flex min-h-14 min-w-24 -translate-y-1/2 items-center justify-center gap-2 plank border-2 border-primary bg-surface/95 px-4 py-3 text-base font-semibold text-fg shadow-lg active:bg-surface-2 short:right-1.5"
              onClick={() => apiRef.current?.leave()}
            >
              <DoorOpen className="size-5 text-primary" aria-hidden />
              Leave
            </button>
          ) : null}
          {mapOpen && !hud.statsOpen && !hud.packOpen && !hud.dialogue ? (
            <section className="pointer-events-auto absolute left-1/2 top-2 bottom-36 z-50 flex max-w-[94vw] -translate-x-1/2 flex-col plank border border-border bg-surface p-3 short:top-1 short:bottom-[3.6rem] short:p-2" aria-label="World map">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-display text-xl short:text-base">Map</p>
                <button type="button" className="min-h-10 px-2 text-sm text-primary" onClick={() => setMapOpen(false)}>
                  Close
                </button>
              </div>
              <canvas ref={mapRef} width={468} height={468} data-testid="world-map" style={{ aspectRatio: "1 / 1" }} className="mx-auto mt-1 min-h-0 max-w-full flex-1 plank border border-border bg-bg" />
              <p className="mt-1 text-xs text-muted short:hidden">Only ground you've seen is drawn. White dot: you. Gold: quest marks.</p>
            </section>
          ) : null}
          {hud.v13?.main.ending && hud.v13.main.slide < 99 ? (
            <div className="pointer-events-auto absolute inset-0 z-[70] flex items-center justify-center bg-black/85 p-6" data-testid="ending-screen">
              <div className="max-w-lg plank border-2 border-primary bg-surface p-5 text-center">
                <p className="text-xs uppercase tracking-widest text-primary">The Long Winter · Ending</p>
                <p className="mt-1 font-display text-2xl">{hud.v13.main.ending.title}</p>
                <p className="mt-3 text-base leading-relaxed" data-testid="ending-slide">{hud.v13.main.ending.slides[Math.min(hud.v13.main.slide, hud.v13.main.ending.slides.length - 1)]}</p>
                <button type="button" data-testid="ending-next" className="mt-4 min-h-11 plank bg-primary px-6 py-2 font-semibold text-bg" onClick={() => apiRef.current?.choose13(hud.v13.main.slide + 1 >= hud.v13.main.ending.slides.length ? "v13-ending-close" : "v13-ending-next")}>
                  {hud.v13.main.slide + 1 >= hud.v13.main.ending.slides.length ? "Keep playing" : "Next"}
                </button>
              </div>
            </div>
          ) : null}
          {toast && toastN === toast.n && !hud.buildOpen ? (
            <div role="status" data-testid="ach-toast" className="pointer-events-none absolute left-1/2 top-3 z-[60] -translate-x-1/2 plank border-2 border-primary bg-surface px-4 py-2 text-center shadow-lg">
              <p className="text-xs uppercase tracking-widest text-primary">Achievement</p>
              <p className="font-display text-lg leading-tight">{toast.name}</p>
              <p className="text-xs text-muted">{toast.text}</p>
            </div>
          ) : null}
          {hud.buildOpen && ((toast && toastN === toast.n) || hud.log.length > 0) ? (
            // v14.1: in build mode every message shares one spot under the slim quest bar, newest at the bottom, and fades out
            <div data-testid="toast-stack" className="pointer-events-none absolute left-1/2 top-[3.6rem] z-[60] flex w-[min(22rem,92vw)] -translate-x-1/2 flex-col items-stretch gap-1">
              {toast && toastN === toast.n ? (
                <div role="status" data-testid="ach-toast" className="log-fade plank border-2 border-primary bg-surface px-3 py-1 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-primary">Achievement · <span className="font-display text-sm normal-case tracking-normal text-fg">{toast.name}</span></p>
                </div>
              ) : null}
              {hud.log.slice(-2).map((line, i, arr) => (
                <p key={hud.logIds?.[hud.log.length - arr.length + i] ?? `${line}-${i}`} className="log-fade plank bg-bg/95 px-3 py-1 text-center text-sm font-semibold text-fg">{line}</p>
              ))}
            </div>
          ) : null}
          {hc.quest ? (
            <section data-hud="quest-min" className={`pointer-events-auto mr-24 flex max-w-xs items-center gap-1 self-start plank border border-border bg-surface/95 px-2 py-1 ${fl("quest")}`}>
              <ScrollText className="size-4 shrink-0 text-primary" aria-hidden />
              <p className="min-w-0 flex-1 truncate text-xs font-semibold">{hud.questText}</p>
              <MinBtn k="quest" label="quest panel" />
            </section>
          ) : (
          <section data-hud="quest" className="pointer-events-auto mr-24 max-w-xs self-start plank border border-border bg-surface/95 px-3 py-2 short:mr-[6.5rem] short:px-2 short:py-1">
            <p className="flex items-center gap-2 text-sm font-bold uppercase text-primary short:hidden">
              <ScrollText className="size-4" aria-hidden />
              <span className="flex-1">{hud.region}</span>
              <MinBtn k="quest" label="quest panel" />
            </p>
            <p className="mt-1 line-clamp-2 text-base font-semibold leading-snug short:mt-0 short:line-clamp-1 short:text-sm">{hud.questText}</p>
            <p className="mt-1 text-sm font-semibold text-primary short:mt-0.5">{hud.clock}</p>
            <p className="text-sm font-semibold text-fg">{hud.karmaWord}</p>
            {hud.v13 ? (
              <div className="mt-1 border-t border-border pt-1 text-xs" data-testid="main-tracker">
                <p className="font-bold uppercase tracking-widest text-primary">The Long Winter · Act {hud.v13.main.act}</p>
                <p className="leading-snug short:line-clamp-1"><span className="font-semibold">{hud.v13.main.title}</span><span className="text-muted short:hidden"> · {hud.v13.main.goal}</span></p>
                <p className="mt-0.5 text-muted" data-testid="weather-line">{hud.v13.weather.name} · {hud.v13.moon.name}{hud.v13.ail.length ? ` · ${hud.v13.ail.map((a: { name: string }) => a.name).join(", ")}` : ""}</p>
                <div className="mt-0.5 flex gap-1" data-testid="needs-bars">
                  {([["hunger", "Food", "#c98a4a"], ["thirst", "Water", "#5a8ac0"], ["sleep", "Sleep", "#9a8ac0"]] as const).map(([k, l, c]) => (
                    <div key={k} className="flex-1" title={`${l} ${Math.round(hud.v13.needs[k])}`}>
                      <div className="h-1.5 bg-bg"><div className="h-full" style={{ width: `${hud.v13.needs[k]}%`, background: c }} /></div>
                      <span className="text-[10px] text-muted">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {(() => {
              const act = hud.journal.filter((e) => !e.done && !e.id.startsWith("q11-season")).slice(0, 3);
              // v13.2 touch: the tracker toggle sat under open panels and dialogue on phones
              if (!act.length || journalOpen || hud.statsOpen || hud.packOpen || hud.dialogue || mapOpen) return null;
              return (
                <div className="mt-1 border-t border-border pt-1" data-testid="quest-tracker">
                  <button type="button" className="flex min-h-10 w-full items-center justify-between text-xs uppercase tracking-widest text-primary" onClick={() => setTrackerOpen((o) => !o)}>
                    Tracking {act.length}{hud.v113?.wind ? ` · wind ${hud.v113.wind}` : ""} <span>{trackerOpen ? "–" : "+"}</span>
                  </button>
                  {trackerOpen ? (
                    <ul className="space-y-0.5">
                      {act.map((e) => (
                        <li key={e.id} className="text-xs leading-snug short:line-clamp-1">
                          <span className="font-semibold">{e.title}</span>
                          <span className="text-muted short:hidden"> · {e.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })()}
            {hud.party ? (
              <p className="text-xs">
                {hud.party.name} with you · {hud.party.hp}/{hud.party.maxHp}
              </p>
            ) : null}
            </section>
          )}

          <div className="mt-auto flex min-h-0 flex-col gap-2 overflow-y-auto">
            {hud.riding ? (
              <button
                type="button"
                data-testid="dismount-btn"
                style={{ touchAction: "manipulation" }}
                className="pointer-events-auto self-center min-h-12 min-w-28 plank bg-primary px-6 py-2 text-base font-semibold text-bg"
                onClick={() => apiRef.current?.dismount()}
              >
                Dismount
              </button>
            ) : null}
            {hud.v113?.dog && hud.phase === "play" ? (
              <div className="pointer-events-auto flex items-center gap-1 self-center" data-testid="dog-cmds">
                <span className="px-1 text-xs font-semibold text-fg">Goose {hud.v113.dog.down ? "(laid up)" : `${hud.v113.dog.hp}/30`}</span>
                {(["stay", "follow", "track"] as const).map((m) => (
                  <button key={m} type="button" data-testid={`dog-${m}`} style={{ touchAction: "manipulation" }} className={`min-h-10 min-w-14 plank border px-2 text-xs font-semibold capitalize ${hud.v113?.dog?.mode === m ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`} onClick={() => apiRef.current?.dogCommand(m)}>
                    {m}
                  </button>
                ))}
                {hud.v113.dog.hp < 30 && !hud.v113.dog.down ? (
                  <button type="button" data-testid="dog-heal" className="min-h-10 plank border border-accent bg-surface px-2 text-xs font-semibold" onClick={() => apiRef.current?.dogHeal()}>
                    Patch up
                  </button>
                ) : null}
              </div>
            ) : null}
            {hud.riding && hud.v13?.canTravel ? (
              <button type="button" data-testid="travel-btn" className="pointer-events-auto self-center min-h-12 min-w-28 plank border-2 border-primary bg-surface px-6 py-2 text-base font-semibold" style={{ touchAction: "manipulation" }} onPointerDown={(e) => e.stopPropagation()} onClick={() => apiRef.current?.openTravel()}>
                Travel
              </button>
            ) : null}
            {!hud.riding && hud.canMount ? (
              <button
                type="button"
                data-testid="ride-btn"
                className="pointer-events-auto self-center min-h-12 min-w-28 plank bg-primary px-6 py-2 text-base font-semibold text-bg"
                style={{ touchAction: "manipulation" }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => apiRef.current?.mount?.()}
              >
                Ride
              </button>
            ) : null}
            {hud.log.length > 0 && !journalOpen && !mapOpen && !hud.buildOpen ? (
              // On short (phone landscape) screens the hero stands mid-screen right above this list, so show
              // only the two newest lines, smaller, at the left edge instead of centred over the hero.
              <ul
                className={
                  short
                    ? "pointer-events-none max-w-[38%] space-y-0.5 self-start text-left text-xs font-semibold"
                    : "pointer-events-none max-w-md space-y-1 self-center text-center text-base font-semibold"
                }
              >
                {(short ? hud.log.slice(-2) : hud.log).map((line, i) => (
                  <li key={hud.logIds?.[(short ? Math.max(0, hud.log.length - 2) : 0) + i] ?? `${line}-${i}`} className={short ? "log-fade plank bg-bg/90 px-2 py-1 text-fg" : "log-fade plank bg-bg/95 px-3 py-1.5 text-fg"}>
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}

            {hud.v141?.store ? (
              <section data-v141="store" className="pointer-events-auto mx-auto flex max-h-[min(70vh,34rem)] w-full max-w-2xl flex-col plank border border-border bg-surface p-3 short:max-h-[78vh] short:p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg text-primary short:text-base">Storage chest</p>
                  <button type="button" className="min-h-10 px-3 text-sm text-primary" onClick={() => apiRef.current?.v141("store", ["close"])}>Close</button>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  <button type="button" data-v141="sort" className="min-h-10 plank border border-border bg-bg px-2 text-xs" onClick={() => apiRef.current?.v141("store", ["sort"])}>Quick-sort</button>
                  <button type="button" data-v141="stack" className="min-h-10 plank border border-border bg-bg px-2 text-xs" onClick={() => apiRef.current?.v141("store", ["stack"])}>Stack to chest</button>
                  <button type="button" data-v141="stash" className="min-h-10 plank border border-border bg-bg px-2 text-xs" onClick={() => apiRef.current?.v141("store", ["stashAll"])}>Stack to farm stash</button>
                </div>
                <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-hidden">
                  <div className="flex min-h-0 flex-col">
                    <p className="text-xs uppercase tracking-widest text-muted">Pack · tap to store</p>
                    <ul className="mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto">
                      {hud.v141.store.pack.map((it: any) => (
                        <li key={it.id}><button type="button" className="flex min-h-10 w-full items-center justify-between plank border border-border bg-bg px-2 text-left text-sm" onClick={() => apiRef.current?.v141("store", ["put", it.id])}><span className="truncate">{it.name}</span><span className="text-muted">×{it.qty}</span></button></li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex min-h-0 flex-col">
                    <p className="text-xs uppercase tracking-widest text-muted">Chest · tap to take</p>
                    <ul data-v141="chest-list" className="mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto">
                      {hud.v141.store.chest.length ? hud.v141.store.chest.map((it: any) => (
                        <li key={it.id}><button type="button" className="flex min-h-10 w-full items-center justify-between plank border border-border bg-bg px-2 text-left text-sm" onClick={() => apiRef.current?.v141("store", ["take", it.id])}><span className="truncate">{it.name}</span><span className="text-muted">×{it.qty}</span></button></li>
                      )) : <li className="text-sm text-muted">Empty.</li>}
                    </ul>
                  </div>
                </div>
              </section>
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

            {hud.dialogue && typeof document !== "undefined"
              ? createPortal(
                  // over the HUD, and scrolls if the choices don't fit a short landscape phone
                  <div className="pointer-events-none fixed inset-0 z-[58] flex items-center justify-center p-2">
                    <section className="pointer-events-auto max-h-full w-full max-w-xl overflow-y-auto overscroll-contain plank border border-border bg-surface p-3 shadow-2xl sm:p-4">
                      <p className="font-display text-lg leading-tight text-primary">{hud.dialogue.speaker}</p>
                      <p className="mt-1.5 text-sm leading-snug sm:text-base sm:leading-relaxed">{hud.dialogue.text}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {hud.dialogue.choices.map((choice) => (
                          <button
                            key={choice.id}
                            type="button"
                            className="plank min-h-[40px] bg-primary px-3 py-2 text-left text-sm font-semibold leading-snug text-bg"
                            onClick={() => apiRef.current?.choose(choice.id)}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>,
                  document.body,
                )
              : null}

            {hud.packOpen && hud.inv ? (
              <Inventory
                inv={hud.inv}
                api={apiRef.current}
                turnBased={hud.turnBased}
                onClose={() => apiRef.current?.togglePack()}
                craft={
                  <ul className="space-y-1">
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
                }
              />
            ) : null}

            {journalOpen && !hud.statsOpen && !hud.packOpen && !hud.dialogue ? (
              <section className="pointer-events-auto mx-auto max-h-[min(56vh,32rem)] w-full max-w-lg overflow-y-auto overscroll-contain plank border border-border bg-surface p-3 short:max-h-[62vh]" aria-label="Quest journal">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-xl">Journal</p>
                  <button type="button" className="min-h-10 min-w-10 px-2 text-sm text-primary" onClick={() => setJournalOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="mt-1 grid grid-cols-4 gap-1" role="tablist">
                  {([["main", "Main"], ["quests", "Quests"], ["skills", "Skills"], ["ach", "Awards"], ["farm", "Farm"], ["allies", "Allies"], ["diary", "Diary"], ["gear", "Gear"]] as const).map(([k, l]) => (
                    <button key={k} type="button" role="tab" aria-selected={jTab === k} data-testid={`tab-${k}`} className={`min-h-10 plank border px-1 text-xs font-semibold ${jTab === k ? "border-primary bg-primary text-bg" : "border-border bg-bg"}`} onClick={() => setJTab(k)}>
                      {l}
                    </button>
                  ))}
                </div>
                {jTab === "main" && hud.v13 ? (
                  <ol className="mt-2 space-y-1" data-testid="main-screen">
                    {hud.v13.main.acts.map((a: { n: number; title: string; goal: string; done: boolean; notes?: string[] }) => (
                      <li key={a.n} className={`plank border px-3 py-2 ${a.n === hud.v13.main.act ? "border-primary bg-bg" : "border-border bg-bg"} ${a.n > hud.v13.main.act ? "opacity-40" : ""}`}>
                        <p className="font-semibold">{a.done ? "✓ " : ""}Act {a.n}: {a.title}</p>
                        <p className="text-xs text-muted">{a.n > hud.v13.main.act ? "…" : a.goal}</p>
                        {a.notes?.length ? <ul className="mt-1 space-y-0.5 text-xs italic" data-testid={`main-notes-${a.n}`}>{a.notes.map((t, i) => <li key={i}>{t}</li>)}</ul> : null}
                      </li>
                    ))}
                  </ol>
                ) : null}
                {jTab === "allies" && hud.v13 ? (
                  <ul className="mt-2 space-y-1" data-testid="allies-screen">
                    {hud.v13.loyal.map((c: { id: string; name: string; v: number; left: boolean; helps: boolean }) => (
                      <li key={c.id} className="plank border border-border bg-bg px-3 py-2">
                        <div className="flex items-baseline justify-between"><p className="font-semibold">{c.name}</p><p className="text-sm text-primary">{c.left ? "Gone" : `${c.v}`}</p></div>
                        <div className="mt-1 h-1.5 bg-surface"><div className="h-full bg-primary" style={{ width: `${Math.max(0, (c.v + 100) / 2)}%` }} /></div>
                        <p className="mt-1 text-xs text-muted">{c.left ? "Left after what you did." : c.helps ? "Loyal: helps more in a fight and on siege night." : c.v < 0 ? "Doesn't trust you. Below -40 they leave." : "Will stand with you."}</p>
                      </li>
                    ))}
                    <li className="text-xs text-muted">Harmony: store {hud.v13.rebuilt.store ? "open" : "closed"}, school {hud.v13.rebuilt.school ? "open" : "closed"}, clinic {hud.v13.rebuilt.clinic ? "open" : "closed"}.</li>
                    {hud.v13.bounties.map((b: { text: string; got: number; need: number; pay: number }, i: number) => <li key={i} className="text-xs">Bounty: {b.text} {Math.min(b.got, b.need)}/{b.need} ({b.pay} iron)</li>)}
                  </ul>
                ) : null}
                {jTab === "diary" && hud.v13 ? (
                  <div className="mt-2" data-testid="diary-screen">
                    <ul className="max-h-48 space-y-0.5 overflow-y-auto">
                      {[...hud.v13.diary].reverse().map((d: { day: number; text: string }, i: number) => <li key={i} className="text-xs"><span className="font-semibold text-primary">Day {d.day}.</span> {d.text}</li>)}
                    </ul>
                    <p className="mt-2 text-xs text-muted">Your own notes</p>
                    <textarea data-testid="diary-notes" className="mt-1 h-20 w-full plank border border-border bg-bg p-2 text-sm" value={jNotes ?? hud.v13.notes} onChange={(e) => setJNotes(e.target.value)} onBlur={(e) => { apiRef.current?.setNotes(e.target.value); }} />
                  </div>
                ) : null}
                {jTab === "gear" && hud.v13 ? (
                  <ul className="mt-2 space-y-1" data-testid="gear-screen">
                    <li className="text-xs text-muted">{hud.v13.set ? `${hud.v13.set.name}: ${hud.v13.set.text}` : "Wear a full matching set (head, chest, legs, hands, feet of one grade) for a bonus. Repair, patch and dye at the workbench through Sarah."}</li>
                    {hud.v13.armor.map((a: { id: string; name: string; dura: number; patched: boolean }) => (
                      <li key={a.id} className="plank border border-border bg-bg px-3 py-1.5 text-sm">
                        <div className="flex justify-between"><span>{a.name}{a.patched ? " (patched)" : ""}</span><span className="text-primary">{a.dura}/100</span></div>
                        <div className="mt-1 h-1 bg-surface"><div className="h-full bg-primary" style={{ width: `${a.dura}%` }} /></div>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {jTab === "skills" ? (
                  <ul className="mt-2 space-y-1" data-testid="skills-screen">
                    {(hud.v113?.skills ?? []).map((sk) => (
                      <li key={sk.id} className="plank border border-border bg-bg px-3 py-2">
                        <div className="flex items-baseline justify-between"><p className="font-semibold">{sk.name}</p><p className="text-sm text-primary">Lv {sk.lv}</p></div>
                        <div className="mt-1 h-1.5 bg-surface"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (sk.xp / sk.need) * 100)}%` }} /></div>
                        <p className="mt-1 text-xs text-muted">{sk.how} Per level: {sk.perk}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {jTab === "ach" ? (
                  <div data-testid="ach-screen">
                    <p className="mt-2 text-xs text-muted">{(hud.v113?.ach ?? []).filter((a) => a.got).length} of {(hud.v113?.ach ?? []).length} earned</p>
                    <ul className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {(hud.v113?.ach ?? []).map((a) => (
                        <li key={a.id} className={`plank border px-3 py-2 ${a.got ? "border-primary bg-bg" : "border-border bg-bg opacity-50"}`}>
                          <p className="text-sm font-semibold">{a.got ? "★ " : "☆ "}{a.name}</p>
                          <p className="text-xs text-muted">{a.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {jTab === "farm" ? (
                  <ul className="mt-2 space-y-1" data-testid="farm-screen">
                    <li className="text-xs text-muted">Build these through Sarah at the farm: "Bigger works".</li>
                    {(hud.v113?.ups ?? []).map((u) => (
                      <li key={u.id} className="plank border border-border bg-bg px-3 py-2">
                        <div className="flex items-baseline justify-between"><p className="font-semibold">{u.name}</p><p className="text-sm text-primary">{u.tier}/{u.max}</p></div>
                        <p className="text-xs text-muted">{u.next ? `Next: ${u.next}` : "Fully built."}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {jTab === "quests" ? <>
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
                </> : null}
              </section>
            ) : null}

            {hud.statsOpen ? (
              <section className="pointer-events-auto mx-auto max-h-[min(36vh,32rem)] w-full max-w-lg overflow-y-auto overscroll-contain plank border border-border bg-surface p-3 short:max-h-[62vh]">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-xl">Stats</p>
                  <p className="text-sm text-primary">{hud.points} stat · {hud.skillPoints} skill</p>
                </div>
                <p className="mt-1 text-xs text-muted">{hud.karmaWord}. {hud.repLine}</p>
                {hud.v13 ? (
                  <div className="mt-2 plank border border-border bg-bg px-2 py-2 text-xs" data-testid="core-stats">
                    <p className="font-semibold text-primary">{hud.v13.backstory ? `${hud.v13.backstory[0].toUpperCase()}${hud.v13.backstory.slice(1)} · ` : ""}What your stats do</p>
                    <ul className="mt-1 grid grid-cols-2 gap-x-3">
                      <li>Carry: {hud.v13.fx.carryLb} lb</li>
                      <li>Health bonus: +{hud.v13.fx.hpBonus}</li>
                      <li>Stamina bonus: +{hud.v13.fx.staminaBonus}</li>
                      <li>Crit chance: {hud.v13.fx.critPct.toFixed(1)}%</li>
                      <li>Gun accuracy: +{hud.v13.fx.accuracyPct}%</li>
                      <li>Trader prices: -{hud.v13.fx.barterPct}%</li>
                      <li>Talk checks: +{hud.v13.fx.talkBonus}</li>
                      <li>Sickness resist: {Math.round(hud.v13.fx.sickResist * 100)}%</li>
                    </ul>
                    <p className="mt-2 font-semibold text-primary">Perks (every 3 skill levels)</p>
                    <ul className="mt-1 space-y-0.5" data-testid="perk-list">
                      {hud.v13.perks.filter((p: { got: string[] }) => p.got.length).map((p: { skill: string; got: string[] }) => <li key={p.skill}>{p.got.join(" · ")}</li>)}
                      {!hud.v13.perks.some((p: { got: string[] }) => p.got.length) ? <li className="text-muted">None yet. Reach level 3 in any skill (Journal, Skills).</li> : null}
                    </ul>
                  </div>
                ) : null}
                <div className="mt-2 grid grid-cols-2 gap-2 short:grid-cols-3">
                  {(
                    [
                      ["strength", "Strength", hud.strength, "Harder hits"],
                      ["vigor", "Health", hud.vigor, "More life"],
                      ["endurance", "Endurance", hud.endurance, "More stamina"],
                      ["intellect", "Wits", hud.intellect, "Skill points, better prices, sharper talk"],
                      ["perception", "Perception", hud.perception, "See farther. Guns reach farther"],
                      ["luck", "Luck", hud.luck, "Better finds. The odd hard hit"],
                      ["agility", "Agility", hud.v13?.core.agility ?? 1, "Stamina, crits"],
                      ["grit", "Grit", hud.v13?.core.grit ?? 1, "Health, shrug off sickness"],
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
                        className="min-h-10 min-w-10 plank bg-primary px-3 py-2 text-sm font-semibold text-bg disabled:opacity-40"
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

            {hud.v14?.craft ? (
              <section data-v14="craft" className="pointer-events-auto fixed inset-x-2 top-2 bottom-2 z-50 mx-auto flex max-w-lg flex-col plank border border-border bg-surface/97 p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-lg leading-none">Workbench · tier {hud.v14.craft.tier}</h2>
                  <button type="button" className="min-h-10 min-w-12 plank border border-border px-3 text-sm" onClick={() => apiRef.current?.v14("closeCraft")}>Close</button>
                </div>
                <p className="mt-1 text-xs text-muted">{hud.v14.craft.mats.map((m: any) => `${m.m} ${m.have}`).join(" · ")}</p>
                <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
                  {["Weapons", "Tools", "Armor", "Traps", "Ammo", "Meds"].map((g) => (
                    <div key={g} className="mb-2">
                      <h3 className="text-xs uppercase tracking-wide text-primary">{g}</h3>
                      {hud.v14.craft.list.filter((r: any) => r.group === g).map((r: any) => (
                        <button key={r.id} type="button" data-craft={r.id} disabled={!r.can} className={`mt-1 flex w-full items-center justify-between gap-2 plank border px-2 py-2 text-left ${r.can ? "border-primary bg-surface-2" : "border-border bg-surface opacity-75"}`} onClick={() => apiRef.current?.v14("craft", r.id)}>
                          <span className="min-w-0">
                            <span className="block font-semibold">{r.name}{r.qty > 1 ? ` ×${r.qty}` : ""} <span className="text-xs text-muted">T{r.tier}{r.def ? ` · def ${r.def}` : ""}{r.atk ? ` · atk ${r.atk}` : ""}</span></span>
                            <span className="block text-xs">{r.locked ? `Needs a tier ${r.tier} bench` : r.need.map((n: any, i: number) => <span key={i} className={n.have >= n.n ? "text-primary" : "text-[#d0644a]"}>{i ? " · " : ""}{n.m} {Math.min(n.have, n.n)}/{n.n}</span>)}</span>
                          </span>
                          <span className="shrink-0 text-xs font-semibold">{r.can ? "Make" : r.locked ? "Locked" : "Short"}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                {hud.v14.craft.up ? (
                  <button type="button" disabled={!hud.v14.craft.canUp} className={`mt-1 plank border px-2 py-2 text-left text-xs ${hud.v14.craft.canUp ? "border-primary bg-surface-2" : "border-border opacity-75"}`} onClick={() => apiRef.current?.v14("benchUp")}>
                    Upgrade the bench to tier {hud.v14.craft.tier + 1}: {hud.v14.craft.up.map((n: any, i: number) => <span key={i} className={n.have >= n.n ? "text-primary" : "text-[#d0644a]"}>{i ? " · " : ""}{n.m} {Math.min(n.have, n.n)}/{n.n}</span>)}
                  </button>
                ) : null}
              </section>
            ) : null}
            {hud.buildOpen ? (
              <div className="pointer-events-auto mx-auto flex w-full max-w-lg gap-1" data-v14="buildtools">
                {(["place", "pickup", "repair"] as const).map((t) => (
                  <button key={t} type="button" className={`plank flex-1 border px-2 py-1 text-xs font-semibold ${hud.v14?.tool === t ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`} onClick={() => apiRef.current?.v14("tool", t)}>
                    {t === "place" ? "Place" : t === "pickup" ? "Pick up" : "Repair"}
                  </button>
                ))}
                <button type="button" className={`plank flex-1 border px-2 py-1 text-xs font-semibold ${hud.v14?.flip ? "border-primary bg-surface-2" : "border-border bg-surface"}`} onClick={() => apiRef.current?.v14("rotate")}>Rotate</button>
                {hud.v14?.damaged ? <button type="button" className="plank flex-1 border border-border bg-surface px-2 py-1 text-xs font-semibold" onClick={() => apiRef.current?.v14("repairAll")}>Fix all ({hud.v14.damaged})</button> : null}
              </div>
            ) : null}
            {hud.buildOpen ? (
              <section className="pointer-events-auto mx-auto grid max-h-[38vh] w-full max-w-lg grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
                {RECIPES.map((item, index) => {
                  const Icon = RECIPE_ICON[index] ?? House;
                  const afford = hud.wood >= item.wood && hud.stone >= item.stone && hud.scrap >= item.scrap;
                  if (item.v14 && !hud.v14?.secured) return null;
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
                        {item.need14 ? Object.entries(item.need14).map(([m, n]) => `${n} ${m === "junk" ? "scrap" : m}`).join(" · ") : `${item.wood} timber · ${item.stone} ledge · ${item.scrap} iron`}
                      </span>
                    </button>
                  );
                })}
              </section>
            ) : null}
            </div>

            <div className={`pointer-events-none z-40 flex flex-wrap items-center gap-1 [&>button]:pointer-events-auto ${journalOpen || hud.statsOpen || hud.packOpen || hud.dialogue || mapOpen || (hud.v13?.main.ending && hud.v13.main.slide < 99) ? "hidden" : ""}`}>
              {/* v14.1: no body-part tabs in the HUD; real-time hits roll their own location. The Fallout aimed-shot
                  popup is for v15 turn-based combat and stays off behind AIMED_POPUP. */}

              {hud.v141 ? (
                <>
                  <button type="button" data-v141="crouch" aria-pressed={hud.v141.crouch} style={{ touchAction: "manipulation" }} className={`min-h-10 min-w-12 plank border px-2 text-xs font-semibold ${hud.v141.crouch ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`} onClick={() => apiRef.current?.v141("crouch")}>{hud.v141.crouch ? "Crouched" : "Crouch"}</button>
                  <button type="button" data-v141="auto" aria-pressed={hud.v141.auto} style={{ touchAction: "manipulation" }} className={`min-h-10 min-w-12 plank border px-2 text-xs font-semibold ${hud.v141.auto ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`} onClick={() => apiRef.current?.v141("auto")}>Auto {hud.v141.auto ? "on" : "off"}</button>
                  <div data-v141="noise" role="meter" aria-label="Noise" aria-valuenow={hud.v141.noise} aria-valuemin={0} aria-valuemax={100} className="flex min-h-10 items-center gap-1 plank border border-border bg-surface/95 px-2 text-xs">
                    <span className="text-muted">Noise</span>
                    <span className="block h-2 w-14 bg-bg"><span className="block h-full" style={{ width: `${hud.v141.noise}%`, background: hud.v141.noise > 70 ? "#d0644a" : hud.v141.noise > 25 ? "#e0b050" : "#8fbf6a" }} /></span>
                  </div>
                </>
              ) : null}
{tb?.on ? <Tb15Bar tb={tb} api={apiRef} /> : null}
            </div>

            <div className={`pointer-events-none z-40 mt-2 flex w-full max-w-full flex-col gap-2 short:mt-1 short:flex-row short:items-end short:gap-1`}>
              <div className={`flex min-w-0 flex-1 items-stretch gap-2 ${journalOpen || hud.statsOpen ? "hidden" : ""} ${hud.dialogue ? "short:hidden" : ""}`}>
                {hc.health ? (
                  <section data-hud="health-min" className={`pointer-events-auto flex min-w-0 flex-1 items-center gap-2 self-end plank border border-border bg-surface/95 px-2 py-1 ${fl("health")}`}>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      {([["HP", hud.hp / Math.max(1, hud.maxHp) * 100, "#c4543a"], ["Food", hud.v13?.needs.hunger ?? 100, "#c98a4a"], ["Water", hud.v13?.needs.thirst ?? 100, "#5a8ac0"], ["Sleep", hud.v13?.needs.sleep ?? 100, "#9a8ac0"]] as const).map(([l, v, c]) => (
                        <div key={l} className="h-1 bg-bg" title={`${l} ${Math.round(v)}`} aria-label={l}><div className="h-full" style={{ width: `${Math.max(0, Math.min(100, v))}%`, background: c }} /></div>
                      ))}
                    </div>
                    <span data-hud="hp-text" className="shrink-0 text-[11px] font-semibold tabular-nums text-fg">{Math.ceil(hud.hp)}/{hud.maxHp} · Lv {hud.level}</span>
                    {hud.v141?.inj?.length ? <span data-hud="injury" className="flex shrink-0 gap-0.5">{hud.v141.inj.map((j: { id: string; name: string; text: string; cure: string }) => <span key={j.id} title={`${j.name}: ${j.text} ${j.cure}`} aria-label={j.name} className="flex size-6 items-center justify-center border border-[#d0644a] bg-[#3a1410] text-[11px] font-bold text-[#f0b0a0]">{j.id === "blind" ? "👁" : j.id === "arms" ? "✋" : "🦵"}</span>)}</span> : null}
                    <button type="button" className="min-h-10 px-1 text-xs text-primary" onClick={() => apiRef.current?.tap("pause")}>Pause</button>
                    <MinBtn k="health" label="health panel" />
                  </section>
                ) : (
                <section data-hud="health" className="pointer-events-auto min-w-0 flex-1 plank border border-border bg-surface/95 px-3 py-2 short:px-2 short:py-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h1 className="truncate font-display text-lg leading-none short:text-base">{hud.name}</h1>
                      <p className="mt-1 text-xs uppercase tracking-wide text-primary short:hidden">{hud.roleTitle}</p>
                    </div>
                    <div className="flex shrink-0 items-start">
                    {hud.v141?.inj?.length ? <span data-hud="injury" className="flex shrink-0 gap-0.5">{hud.v141.inj.map((j: { id: string; name: string; text: string; cure: string }) => <span key={j.id} title={`${j.name}: ${j.text} ${j.cure}`} aria-label={j.name} className="flex size-6 items-center justify-center border border-[#d0644a] bg-[#3a1410] text-[11px] font-bold text-[#f0b0a0]">{j.id === "blind" ? "👁" : j.id === "arms" ? "✋" : "🦵"}</span>)}</span> : null}
                    <button type="button" className="-my-2 min-h-10 min-w-12 shrink-0 px-2 text-sm text-primary short:-my-1" onClick={() => apiRef.current?.tap("pause")}>
                      Pause
                    </button>
                    <MinBtn k="health" label="health panel" tight />
                    </div>
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
                    {hud.safe15 ? <span data-safe15="1" className="ml-1 rounded-sm border border-border px-1 text-[10px] uppercase tracking-wide text-muted opacity-80">Safe zone</span> : null}
                    {hud.inside ? " · Inside" : ""} · Wood {hud.wood} · Stone {hud.stone} · Iron {hud.scrap} · Shells {hud.shells}
                  </p>
                </section>
                )}
                <div className="pointer-events-auto flex shrink-0 flex-col gap-2 short:flex-row short:gap-1">
                  <ActionButton label="Zoom out" onClick={() => apiRef.current?.nudgeZoom(1 / 1.2)}>
                    <Minus className="size-5 short:size-4" aria-hidden />
                  </ActionButton>
                  <ActionButton label="Zoom in" onClick={() => apiRef.current?.nudgeZoom(1.2)}>
                    <Plus className="size-5 short:size-4" aria-hidden />
                  </ActionButton>
                </div>
              </div>
              <div data-hud="actions" className="pointer-events-auto grid grid-cols-7 gap-1 short:w-[22rem] short:shrink-0">
                <ActionButton wide label="Talk" onClick={() => apiRef.current?.tap("interact")}>
                  <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none">
                    <MessageCircle className="size-4" aria-hidden />
                    Talk
                  </span>
                </ActionButton>
                <ActionButton wide label="Attack" onClick={() => apiRef.current?.tap("attack")}>
                  <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none">
                    <Axe className="size-4" aria-hidden />
                    Attack
                  </span>
                </ActionButton>
                <ActionButton wide label="Build" pressed={hud.buildOpen} onClick={() => apiRef.current?.tap("build")}>
                  <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none">
                    <House className="size-4" aria-hidden />
                    Build
                  </span>
                </ActionButton>
                <ActionButton wide label="Pack" pressed={hud.packOpen} onClick={() => apiRef.current?.togglePack()}>
                  <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none">
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
                  <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none">
                    <BookOpen className="size-4" aria-hidden />
                    Journal
                  </span>
                </ActionButton>
                <ActionButton
                  wide
                  label="Map"
                  pressed={mapOpen}
                  onClick={() => {
                    if (hud.statsOpen) apiRef.current?.toggleStats();
                    if (hud.packOpen) apiRef.current?.togglePack();
                    setJournalOpen(false);
                    setMapOpen((o) => !o);
                  }}
                >
                  <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none">
                    <MapIcon className="size-4" aria-hidden />
                    Map
                  </span>
                </ActionButton>
                <ActionButton wide label="Stats" pressed={hud.statsOpen} onClick={() => apiRef.current?.toggleStats()}>
                  <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none">
                    <ScrollText className="size-4" aria-hidden />
                    Stats
                  </span>
                </ActionButton>
              </div>
            </div>
        </div>
      ) : null}
      {playing && hud.v141?.stick && hud.phase === "play" && !hud.buildOpen && !hud.dialogue && !hud.v141.store ? (
        <Stick141 onMove={(x, y) => apiRef.current?.setStick(x, y)} />
      ) : null}
      <canvas
        ref={miniRef}
        width={132}
        height={132}
        aria-label="Minimap"
        className={playing && !hc.mini ? "pointer-events-none absolute top-[max(0.5rem,env(safe-area-inset-top))] right-[max(0.5rem,env(safe-area-inset-right))] z-10 h-20 w-20 plank border border-border bg-bg short:h-[clamp(4.5rem,24vh,5.5rem)] short:w-[clamp(4.5rem,24vh,5.5rem)]" : "hidden"}
      />

      {playing ? (
        <button type="button" data-hud-min="mini" aria-label={hc.mini ? "Show the corner chart" : "Hide the corner chart"} className={`absolute z-20 plank border border-border bg-surface/95 text-xs font-bold text-primary ${hc.mini ? "top-[max(0.5rem,env(safe-area-inset-top))] right-[max(0.5rem,env(safe-area-inset-right))] h-10 w-10" : "top-[calc(max(0.5rem,env(safe-area-inset-top))+5.2rem)] right-[max(0.5rem,env(safe-area-inset-right))] h-10 w-10 short:top-[calc(max(0.5rem,env(safe-area-inset-top))+clamp(4.5rem,24vh,5.5rem)+0.3rem)]"}`} onClick={() => flipHc("mini")}>{hc.mini ? "+" : "–"}</button>
      ) : null}
      {hud.phase === "menu" ? (
        <div className="menu-hero absolute inset-0 overflow-y-auto p-4 short:p-2 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] short:pt-[max(0.25rem,env(safe-area-inset-top))] short:pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex min-h-full w-full max-w-lg items-center py-4 short:max-w-5xl short:py-1">
          <div data-menu="card" className="w-full plank border border-border bg-surface/95 p-6 short:p-3 menu-cols">
            <p className="text-xs uppercase tracking-widest text-primary">Northwestern Maine</p>
            <h1 className="mt-1 font-display text-5xl leading-none short:text-3xl">Maine RPG</h1>
            {hud.hasSave && step === "trade" ? (
              <button
                type="button"
                data-testid="continue-btn"
                className="mt-2 w-full plank border border-primary bg-primary/20 px-4 py-3 text-lg font-semibold short:py-2"
                onClick={() => apiRef.current?.continueGame()}
              >
                Continue
              </button>
            ) : null}
            <p className="mt-3 leading-relaxed text-muted short:mt-1 short:line-clamp-2 short:text-sm">
              After the fall, the Moose River country went back to wool coats, lever guns, and cookfires. Name yourself, pick a trade, and set your clothes.
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
                <p className="mt-3 text-sm text-muted short:mt-2">Backstory</p>
                <div className="mt-1 grid grid-cols-4 gap-1" data-testid="backstory-pick">
                  {([["veteran", "Veteran", "Rifle, grit, first aid"], ["mechanic", "Mechanic", "Engines, gas, wits"], ["farmer", "Farmer", "Crops, cooking, endurance"], ["hunter", "Woods guide", "Tracks, traps, agility"]] as const).map(([id, l, h]) => (
                    <button key={id} type="button" data-testid={`backstory-${id}`} aria-pressed={backstory === id} className={`plank border px-1.5 py-1.5 text-left ${backstory === id ? "border-primary bg-surface-2" : "border-border bg-bg"}`} onClick={() => setBackstory(id)}>
                      <span className="block text-xs font-semibold">{l}</span>
                      <span className="block text-[10px] leading-tight text-muted">{h}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-end gap-3 short:mt-2">
                  <div className="plank border border-border bg-bg p-1">
                    <LookPreview look={look} hair={hair} coat={coat} hat={hat} trousers={trousers} boots={boots} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted">Cloth</p>
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {LOOKS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={look === item.id}
                          className={`plank border px-2 py-1.5 text-left ${look === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`}
                          onClick={() => setLook(item.id)}
                        >
                          <span
                            className="mb-1 block h-2 w-full border border-border"
                            style={{ background: item.id === "wool" ? "#8c6242" : item.id === "spruce" ? "#46684a" : item.id === "linen" ? "#cec0a0" : "#42444a" }}
                          />
                          <span className="block text-sm font-semibold">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted short:mt-2">Hair</p>
                <div className="mt-1 grid grid-cols-4 gap-1">
                  {HAIRS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={hair === item.id}
                      className={`plank border px-2 py-1.5 text-left ${hair === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`}
                      onClick={() => setHair(item.id)}
                    >
                      <span className="mb-1 block h-2 w-full border border-border" style={{ background: item.color }} />
                      <span className="block text-xs font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 short:mt-2">
                  <div>
                    <p className="text-sm text-muted">Coat</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {COAT_PICKS.map((item) => (
                        <button key={item.label} type="button" aria-pressed={coat === item.id} className={`plank border px-2 py-1 text-xs font-semibold ${coat === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`} onClick={() => setCoat(item.id)}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Hat</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {HAT_PICKS.map((item) => (
                        <button key={item.label} type="button" aria-pressed={hat === item.id} className={`plank border px-2 py-1 text-xs font-semibold ${hat === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`} onClick={() => setHat(item.id)}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button type="button" aria-pressed={trousers} className={`plank border px-3 py-1.5 text-sm ${trousers ? "border-primary bg-surface-2" : "border-border bg-bg"}`} onClick={() => setTrousers((v) => !v)}>
                    Trousers
                  </button>
                  <button type="button" aria-pressed={hardMode} data-testid="hard-mode" className={`plank border px-3 py-1.5 text-sm ${hardMode ? "border-primary bg-surface-2" : "border-border bg-bg"}`} onClick={() => setHardMode((v) => !v)}>
                    Hard needs
                  </button>
                  <button type="button" aria-pressed={boots} className={`plank border px-3 py-1.5 text-sm ${boots ? "border-primary bg-surface-2" : "border-border bg-bg"}`} onClick={() => setBoots((v) => !v)}>
                    Boots
                  </button>
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
                  {step === "trade" ? (
                    <button
                      type="button"
                      className="plank border border-accent bg-surface-2 px-4 py-3 font-semibold"
                      onClick={() => apiRef.current?.raidMode()}
                    >
                      Raid Mode
                    </button>
                  ) : null}
                  {step === "trade" ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" className="plank border border-accent bg-surface-2 px-2 py-3 text-sm font-semibold" onClick={() => apiRef.current?.startMode("winter")}>
                        Winter Survival
                      </button>
                      <button type="button" className="plank border border-accent bg-surface-2 px-2 py-3 text-sm font-semibold" onClick={() => apiRef.current?.startMode("endless")}>
                        Endless Raid
                      </button>
                      <button type="button" className="plank border border-accent bg-surface-2 px-2 py-3 text-sm font-semibold" onClick={() => apiRef.current?.startMode("watch")}>
                        Night Watch
                      </button>
                    </div>
                  ) : null}
                  {step === "trade" ? (
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Save slot" data-testid="save-slots">
                      {(hud.slots ?? []).map((sl) => (
                        <button
                          key={sl.slot}
                          type="button"
                          role="radio"
                          aria-checked={hud.slot === sl.slot}
                          data-testid={`slot-${sl.slot}`}
                          className={`min-h-14 plank border px-2 py-2 text-left text-xs ${hud.slot === sl.slot ? "border-primary bg-primary/20" : "border-border bg-surface-2"}`}
                          onClick={() => apiRef.current?.setSlot(sl.slot)}
                        >
                          <span className="block font-semibold">Slot {sl.slot}</span>
                          <span className="block truncate text-muted">{sl.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {hud.auto && step === "trade" ? (
                    <button
                      type="button"
                      data-testid="slot-auto"
                      className="min-h-12 plank border border-dashed border-accent bg-surface-2 px-3 py-2 text-left text-xs"
                      onClick={() => apiRef.current?.loadAutosave()}
                    >
                      <span className="block font-semibold">Autosave · Slot {hud.auto.slot}{hud.auto.where ? ` · ${hud.auto.where}` : ""}</span>
                      <span className="block truncate text-muted">{hud.auto.label} · tap to load</span>
                    </button>
                  ) : null}
                </>
              )}
            </div>
            <p className="mt-4 text-base font-semibold leading-relaxed text-fg short:hidden">
              Hold on the ground to run. Click a chopper to chase and keep swinging until they drop. Click the ground to break off. A carbine shoots from farther away. An axe in your hand takes three swings, then the tree falls. A pickaxe in your hand cracks a rock for iron.
            </p>
            {!hud.ready ? <p className="mt-2 text-xs text-muted">Painting the spruce…</p> : null}
          </div>
          </div>
        </div>
      ) : null}

      {hud.phase === "menu" && raidResult ? (
        <Overlay title={raidResult.won ? `Night ${raidResult.night}: the farm held` : `Night ${raidResult.night}: the farm fell`}>
          <p className="text-sm leading-relaxed text-muted">{raidResult.text}</p>
          <p className="text-sm">Raiders down: {raidResult.kills} · Waves held: {raidResult.wavesDone} of {raidResult.waves}</p>
          <button type="button" className="plank bg-primary px-4 py-3 font-semibold text-bg" onClick={() => apiRef.current?.raidMode()}>
            Raid again
          </button>
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => useRaidMode.setState({ result: null })}>
            Back to menu
          </button>
        </Overlay>
      ) : null}

      {hud.phase === "menu" && modeResult && !raidResult ? (
        <Overlay title={modeResult.title}>
          {modeResult.lines.map((line, i) => (
            <p key={i} className={i === 0 ? "text-sm leading-relaxed text-muted" : "text-sm"}>
              {line}
            </p>
          ))}
          <button type="button" className="plank bg-primary px-4 py-3 font-semibold text-bg" onClick={() => apiRef.current?.startMode(modeResult.mode)}>
            Play again
          </button>
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => useModeResult.setState({ result: null })}>
            Back to menu
          </button>
        </Overlay>
      ) : null}

      {confirmExit ? (
        <Overlay title="Leave Maine?">
          <p className="text-sm leading-relaxed text-muted">Close the game? Your packer is saved on this device.</p>
          <button type="button" className="plank bg-accent px-4 py-3 font-semibold text-fg" onClick={exitApp}>
            Exit
          </button>
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => setConfirmExit(false)}>
            Stay
          </button>
        </Overlay>
      ) : null}

      {AIMED_POPUP && tb?.on && tb.popup && hud.phase === "play" ? <AimPopup tb={tb} api={apiRef} /> : null}
      {hud.phase === "town" && (hud as any).town ? <TownLayer key={(hud as any).town.n} town={(hud as any).town} api={apiRef} /> : null}
      {hud.phase === "worldmap" && hud.wmap ? (
        <div data-testid="worldmap" className="absolute inset-0 z-50 bg-bg">
          <div className="absolute inset-0"><WorldMap14 wm={hud.wmap} go={(q, r) => apiRef.current?.v14("wmGo", [q, r])} /></div>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-1 p-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
            <div className="flex items-center justify-between gap-2 plank border border-border bg-surface/90 px-2 py-1">
              <h2 className="font-display text-base leading-none">Northwestern Maine · {hud.wmap.clock}</h2>
              <span className="text-xs text-muted">{hud.wmap.bike ? "Bike: roads go quick" : "On foot"}</span>
            </div>
            {hud.wmap.warn ? <p data-testid="wm-warn" className="animate-pulse plank border border-[#d0644a] bg-surface px-2 py-1 text-sm font-semibold text-[#e88a6a]">{hud.wmap.warn}</p> : null}
          </div>
          <div data-testid="wm-bottom" className="absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-border bg-surface/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <p className="text-sm">{hud.wmap.path.length ? `Traveling… ${hud.wmap.path.length} hex${hud.wmap.path.length > 1 ? "es" : ""} to go.` : hud.wmap.here ? `${hud.wmap.here}. Tap it again to go in.` : "Tap a hex to travel. Drag to look around, pinch to zoom. Roads are quick; woods and the river are slow."}</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" className="min-h-11 plank border border-border bg-bg px-2 text-sm" onClick={() => { const c = document.querySelector('[data-testid="hex-map"]') as HTMLCanvasElement | null; c?.dispatchEvent(new WheelEvent("wheel", { deltaY: 1, clientX: c.getBoundingClientRect().left + c.clientWidth / 2, clientY: c.getBoundingClientRect().top + c.clientHeight / 2, bubbles: true })); }}>Zoom out</button>
              <button type="button" className="min-h-11 plank border border-border bg-bg px-2 text-sm" onClick={() => { const c = document.querySelector('[data-testid="hex-map"]') as HTMLCanvasElement | null; c?.dispatchEvent(new WheelEvent("wheel", { deltaY: -1, clientX: c.getBoundingClientRect().left + c.clientWidth / 2, clientY: c.getBoundingClientRect().top + c.clientHeight / 2, bubbles: true })); }}>Zoom in</button>
              <button type="button" data-testid="wm-enter" disabled={!hud.wmap.here || hud.wmap.path.length > 0} className="min-h-11 plank bg-primary px-2 text-sm font-semibold text-bg disabled:opacity-40" onClick={() => apiRef.current?.v14("wmGo", [hud.wmap!.q, hud.wmap!.r])}>Go in</button>
            </div>
          </div>
        </div>
      ) : null}
      {hud.phase === "pause" ? (
        <Overlay title="Paused">
          <button type="button" className="plank bg-primary px-4 py-3 font-semibold text-bg" onClick={() => apiRef.current?.tap("resume")}>
            Resume
          </button>
          {hud.inside ? (
            <button type="button" className="plank border border-primary px-4 py-3 font-semibold" onClick={() => apiRef.current?.leave()}>
              Leave building
            </button>
          ) : null}
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.tap("save")}>
            Save
          </button>
          <div className="flex gap-2">
            <button type="button" data-testid="hud-collapse-all" className="flex-1 plank border border-border px-3 py-3" onClick={() => { saveHc({ quest: true, track: true, health: true, aim: true, mini: true }); setTrackerOpen0(false); }}>Collapse HUD</button>
            <button type="button" data-testid="hud-expand-all" className="flex-1 plank border border-border px-3 py-3" onClick={() => { saveHc({ quest: false, track: false, health: false, aim: false, mini: false }); setTrackerOpen0(true); }}>Expand HUD</button>
          </div>
          <button type="button" data-testid="one-thumb" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.v141("stickMode")}>
            {hud.v141?.stick ? "One-thumb stick: on" : "One-thumb stick: off"}
          </button>
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.setTurnBased(!(hud as any).tb15?.enabled)}>
            {(hud as any).tb15?.enabled ? "Turn-based combat: on" : "Turn-based combat: off"}
          </button>
          <button type="button" data-testid="gfx-toggle" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.setGraphics(!(hud.gfxHigh ?? true))}>
            Graphics: {(hud.gfxHigh ?? true) ? "High" : "Low"}
          </button>
          <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.tap("menu")}>
            Main menu
          </button>
        </Overlay>
      ) : null}

      {hud.phase === "dead" ? (
        <Overlay title="You fall" delayed>
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

type CapBridge = {
  isNativePlatform?: () => boolean;
  addListener?: (plugin: string, event: string, cb: () => void) => { remove?: () => unknown } | undefined;
  nativeCallback?: (plugin: string, method: string, options: object) => unknown;
};

/** Matches the `short:` Tailwind variant (max-height 520px): phones held sideways. */
function useShortScreen(): boolean {
  const [short, setShort] = useState(false);
  useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const mq = matchMedia("(max-height: 520px), (max-height: 640px) and (orientation: landscape)");
    const on = () => setShort(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return short;
}

function Overlay({ title, children, delayed = false }: { title: string; children: ReactNode; delayed?: boolean }) {
  return (
    <div className={`scrap-scrim absolute inset-0 z-40 flex items-center justify-center p-4${delayed ? " overlay-late" : ""}`}>
      <div className="flex w-full max-w-sm flex-col gap-2 plank border border-border bg-surface p-5">
        <h2 className="font-display text-3xl">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/** v15 stub: the aimed-shot (called-shot) picker for turn-based combat. Off in v14.1. */
/** v15: the Fallout aimed-shot popup, only in turn-based combat. */
const AIMED_POPUP = true;

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
      style={{ touchAction: "manipulation" }}
      className={`flex select-none items-center justify-center plank border ${wide ? "h-14 w-full min-w-0 px-1 short:h-12" : "h-12 w-12 short:h-11 short:w-11"} ${pressed ? "border-primary bg-primary text-bg" : "border-border bg-surface text-fg"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** v14.3: the town game in a full-screen iframe. We post {type:"enterTown"} on load (and again if it posts {type:"ready"});
 * it answers with {type:"leaveTown"} or {type:"startQuest"}. Only messages from this iframe's window are accepted. */
function TownLayer({ town, api }: { town: { id: string; src: string; n: number }; api: { current: any } }) {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const send = () => { const msg = api.current?.v141("townEnter"); if (msg) frame.current?.contentWindow?.postMessage(msg, "*"); };
    const on = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow || !e.data || typeof e.data !== "object") return;
      if (e.data.type === "ready") send();
      else if (e.data.type === "leaveTown" || e.data.type === "startQuest") api.current?.v141("townMsg", e.data);
    };
    window.addEventListener("message", on);
    const f = frame.current; f?.addEventListener("load", send);
    return () => { window.removeEventListener("message", on); f?.removeEventListener("load", send); };
  }, [api]);
  return (
    <div data-testid="town-layer" className="absolute inset-0 z-[70] bg-black">
      <iframe ref={frame} data-testid="town-frame" title={`Town: ${town.id}`} src={town.src} className="block h-full w-full border-0" />
    </div>
  );
}

type Tb15 = { on: boolean; enabled: boolean; mine?: boolean; ap?: number; maxAp?: number; round?: number; cur?: string;
  order?: { me: boolean; name: string; cur: boolean }[]; mag?: { n: number; max: number } | null; cost?: Record<string, number>;
  popup?: { id: number; name: string; parts: { part: string; label: string; hit: number; ap: number }[] } | null };
/** v15 turn-based HUD: whose turn, AP pips, reload and end turn. Narrow enough for a portrait phone. */
function Tb15Bar({ tb, api }: { tb: Tb15; api: { current: any } }) {
  const pips = Array.from({ length: tb.maxAp ?? 0 }, (_, i) => i < (tb.ap ?? 0));
  return (
    <div data-tb15="bar" className="pointer-events-auto flex max-w-full flex-wrap items-center gap-1 plank border border-primary bg-surface/95 px-2 py-1 text-xs">
      <span data-tb15="turn" className={`font-semibold ${tb.mine ? "text-primary" : "text-[#e07a5a]"}`}>{tb.mine ? "Your turn" : `${tb.cur}'s turn`}</span>
      <span className="text-muted">R{tb.round}</span>
      <span data-tb15="ap" aria-label={`Action points ${tb.ap} of ${tb.maxAp}`} className="flex items-center gap-0.5">
        <span className="text-muted">AP</span>
        {pips.map((on, i) => <span key={i} className="inline-block h-2.5 w-2.5 rounded-full border border-primary" style={{ background: on ? "#e0b050" : "transparent" }} />)}
      </span>
      {tb.mag ? (
        <button type="button" data-tb15="reload" disabled={!tb.mine} className="min-h-8 plank border border-border bg-surface px-2 font-semibold disabled:opacity-50" onClick={() => api.current?.v141("tbReload")}>Reload {tb.mag.n}/{tb.mag.max} · {tb.cost?.reload}AP</button>
      ) : null}
      <button type="button" data-tb15="end" disabled={!tb.mine} className="min-h-8 plank bg-primary px-3 font-semibold text-bg disabled:opacity-50" onClick={() => api.current?.v141("tbEnd")}>End turn</button>
    </div>
  );
}
function AimPopup({ tb, api }: { tb: Tb15; api: { current: any } }) {
  const p = tb.popup!;
  return (
    <div data-tb15="aim" className="pointer-events-auto absolute inset-x-2 bottom-28 z-[65] mx-auto max-w-sm plank border border-primary bg-surface/95 p-2 text-sm">
      <div className="mb-1 flex items-center justify-between"><b>Aim at the {p.name}</b><span className="text-xs text-muted">AP {tb.ap}/{tb.maxAp}</span></div>
      <div className="grid grid-cols-2 gap-1">
        {p.parts.map((q) => (
          <button key={q.part} type="button" data-part={q.part} disabled={!q.hit || q.ap > (tb.ap ?? 0)} className="flex min-h-10 items-center justify-between plank border border-border bg-bg/60 px-2 disabled:opacity-40" onClick={() => api.current?.v141("tbAttack", [p.id, q.part])}>
            <span className="font-semibold">{q.label}</span><span className="text-xs">{q.hit ? `${q.hit}%` : "—"} · {q.ap}AP</span>
          </button>
        ))}
      </div>
      <button type="button" className="mt-1 w-full plank border border-border px-2 py-1 text-xs" onClick={() => api.current?.v141("tbClose")}>Cancel</button>
    </div>
  );
}
