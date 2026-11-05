import { WM_COLS, WM_LOCS, WM_ROWS } from "@/game/worldmap";
/** v15.8: world-map location id -> Quest RPG town icon (public/game/v4/icons/<name>_icon_v4.png). */
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import {
  Columns3,
  Flame,
  Hammer,
  House,
  Minus,
  Plus,
  DoorOpen,
} from "lucide-react";
import { mountGame, type GameApi } from "@/game/engine";
import { HudBar, HudCorner, HudQuest } from "@/components/CompactHud";
import { Inventory } from "@/components/Inventory";
import { CharCreate } from "@/components/CharCreate";
import { useHud, useModeResult } from "@/game/store";
import { RECIPES } from "@/game/types";
import { M7_STATS } from "@/game/v1513";
import { CRAFT, type LookId, type RoleId, type TraitId } from "@/game/gear";
import type { PerkId, SkillId } from "@/game/progress";

const RECIPE_ICON = [House, Columns3, Hammer, Flame] as const;


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
  // v15.10.13: phones/tablets go true full screen + landscape lock on the first touch (browsers need a gesture; the APK is already immersive)
  useEffect(() => {
    if (typeof window === "undefined" || !matchMedia("(pointer: coarse)").matches) return;
    const go = () => {
      const d = document as Document & { webkitFullscreenElement?: Element };
      const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
      try { if (!document.fullscreenElement && !d.webkitFullscreenElement) (el.requestFullscreen ? el.requestFullscreen({ navigationUI: "hide" }).catch(() => {}) : el.webkitRequestFullscreen?.()); } catch { /* not allowed */ }
      try { (screen.orientation as unknown as { lock?: (o: string) => Promise<void> }).lock?.("landscape")?.catch(() => {}); } catch { /* not supported */ }
    };
    window.addEventListener("pointerup", go);
    return () => window.removeEventListener("pointerup", go);
  }, []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);
  const pinchMid = useRef({ x: 0, y: 0 });
  const pinching = useRef(false);
  const hud = useHud();
  const modeResult = useModeResult((s) => s.result);
  // v15.10: who you play. Sarah gets her quests from Justin at the farm.
  const [jNotes, setJNotes] = useState<string | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);
  // v15.13: The Seven, two traits, three tags
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
    if (typeof v.quest !== "boolean") v.quest = true;
    if (portrait) { if (typeof v.health !== "boolean") v.health = true; }
    return v;
  });
  const saveHc = (next: Record<string, boolean>) => { setHc(next); try { localStorage.setItem("maine-rpg-hud", JSON.stringify(next)); } catch { /* private mode */ } };
  const flipHc = (k: string) => saveHc({ ...hcS, [k]: !hcS[k] });
  // v14.1: build mode auto-collapses the other panels (your saved choice comes back when you close Build)
  const hc: Record<string, boolean> = hud.buildOpen ? { ...hcS, quest: true, health: true, mini: true, aim: true, track: true } : hcS;
  const setTrackerOpen = (f: (o: boolean) => boolean) => { setTrackerOpen0((o) => { const n = f(o); saveHc({ ...hcS, track: !n }); return n; }); };
  const [flash, setFlash] = useState<Record<string, number>>({});
  const lastQ = useRef("");
  useEffect(() => {
    if (lastQ.current && hud.questText !== lastQ.current && hc.quest) setFlash((f) => ({ ...f, quest: Date.now() }));
    lastQ.current = hud.questText;
  }, [hud.questText, hc.quest]);
  useEffect(() => { const t = window.setInterval(() => setFlash((f) => { const n = { ...f }; let ch = false; for (const k in n) if (Date.now() - n[k] > 2400) { delete n[k]; ch = true; } return ch ? n : f; }), 600); return () => window.clearInterval(t); }, []);
  const mapRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!mapOpen) return;
    const draw = () => mapRef.current && apiRef.current?.drawMap(mapRef.current);
    draw();
    const t = window.setInterval(draw, 500);
    return () => window.clearInterval(t);
  }, [mapOpen]);
  const [confirmExit, setConfirmExit] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const devUi = typeof window !== "undefined" && /(?:\?|&)(?:dev|test)=/.test(window.location.search);
  const short = useShortScreen();
  const playing = hud.phase !== "menu";
  const tb = (hud as any).tb15 as Tb15 | undefined;
  const panelArt = useArt("/game/ui/char-panel.png");
  const headArt = useArt("/game/ui/head-frame.png"), tradeArt = useArt("/game/ui/trade-panel.png"), mapArt = useArt("/game/ui/worldmap-maine.jpg"), endArt = useArt("/game/ui/ending-harmony.jpg");
  const [mapTab, setMapTab] = useState<"area" | "maine">("area");

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
    if (cap?.isNativePlatform?.()) cap.nativeCallback?.("App", "exitApp", {});
    else apiRef.current?.tap("menu");
    setConfirmExit(false);
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


  // v14.1 URL test harness: ?test=worldmap&enc=caravan | guns starts a game and sets the scene
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


  return (
    <div className="fixed inset-0 h-dvh w-full overflow-hidden bg-bg text-fg touch-none">
      {/* v15.10.13: landscape-only standard (game and town iframes). Phones in portrait get a rotate prompt; the APK is locked to sensorLandscape. */}
      <div className="rotate-lock" data-testid="rotate-lock" role="alert" onPointerDown={() => { try { (screen.orientation as unknown as { lock?: (o: string) => Promise<void> }).lock?.("landscape")?.catch(() => {}); } catch { /* not supported */ } }}>
        <div className="rotate-lock-phone" aria-hidden />
        <p className="font-display text-2xl">Turn your phone sideways</p>
        <p className="text-sm opacity-80">Maine RPG plays in landscape only.</p>
      </div>
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
                {mapArt ? <span className="flex gap-1">{(["area", "maine"] as const).map((t) => <button key={t} type="button" data-map-tab={t} className={`fobar-btn min-h-9 px-2 text-xs ${mapTab === t ? "on" : ""}`} onClick={() => setMapTab(t)}>{t === "area" ? "Here" : "Maine"}</button>)}</span> : null}
                <button type="button" className="min-h-10 px-2 text-sm text-primary" onClick={() => setMapOpen(false)}>
                  Close
                </button>
              </div>
              <canvas ref={mapRef} width={468} height={468} data-testid="world-map" style={{ aspectRatio: "1 / 1" }} className={`mx-auto mt-1 min-h-0 max-w-full flex-1 plank border border-border bg-bg ${mapArt && mapTab === "maine" ? "hidden" : ""}`} />
              {mapArt && mapTab === "maine" ? <div className="mt-1 min-h-0 flex-1"><MaineMap wm={(hud as any).wmLite ?? null} /></div> : null}
              <p className="mt-1 text-xs text-muted short:hidden">Only ground you've seen is drawn. White dot: you. Gold: quest marks.</p>
            </section>
          ) : null}
          {hud.v13?.main.ending && hud.v13.main.slide < 99 ? (
            <div className="pointer-events-auto absolute inset-0 z-[70] flex items-center justify-center bg-black/85 p-6" data-testid="ending-screen">
              <div className="max-h-full max-w-lg overflow-y-auto plank border-2 border-primary bg-surface p-5 text-center short:max-w-2xl short:p-3">
                {endArt ? <img data-testid="ending-art" src={`/game/ui/ending-${ENDING_ART[hud.v13.main.slide % 4]}.jpg`} alt="" className="mb-3 aspect-video w-full max-h-[30vh] object-cover border border-[#3a2a18]" /> : null}
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
          {journalOpen || hud.statsOpen || hud.packOpen || hud.dialogue || mapOpen ? null : (
            <HudQuest
              hud={hud}
              open={!hc.quest}
              badge={!!flash.quest}
              onToggle={() => flipHc("quest")}
              trackerOpen={trackerOpen}
              onTracker={() => setTrackerOpen((o) => !o)}
              showTracker={!journalOpen && !hud.statsOpen && !hud.packOpen && !hud.dialogue && !mapOpen}
            />
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
            {hud.v113?.dog && hud.phase === "play" && hud.v113.dog.hp < 30 && !hud.v113.dog.down ? (
              <div className="pointer-events-auto flex items-center gap-1 self-center" data-testid="dog-cmds">
                <button type="button" data-testid="dog-heal" className="min-h-10 plank border border-accent bg-surface px-2 text-xs font-semibold" onClick={() => apiRef.current?.dogHeal()}>
                  Patch Goose up
                </button>
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
                    <section data-ui-dialogue={tradeArt && hud.dialogue.choices.some((c) => /\b(buy|sell|trade|iron)\b/i.test(c.label)) ? "trade" : headArt ? "head" : "plain"} className="ui-dialogue pointer-events-auto max-h-full w-full max-w-xl overflow-y-auto overscroll-contain plank border border-border bg-surface p-3 shadow-2xl sm:p-4">
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
              <DeviceFrame active="journal" onTab={(t) => { setJournalOpen(false); if (t === "journal") setJournalOpen(true); else if (t === "map") setMapOpen(true); else apiRef.current?.toggleStats(); }}>
              <section className="pointer-events-auto mx-auto max-h-[min(56vh,32rem)] w-full max-w-lg overflow-y-auto overscroll-contain plank border border-border bg-surface p-3 short:max-h-[62vh]" aria-label="Quest journal">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-xl">Journal</p>
                  <button type="button" className="min-h-10 min-w-10 px-2 text-sm text-primary" onClick={() => setJournalOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="mt-1 grid grid-cols-4 gap-1" role="tablist">
                  {([["main", "Main"], ["quests", "Quests"], ["skills", "Skills"], ["ach", "Awards"], ["allies", "Allies"], ["diary", "Diary"], ["gear", "Backpack"]] as const).map(([k, l]) => (
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
              </DeviceFrame>
            ) : null}

            {hud.statsOpen ? (
              <section data-ui-panel={panelArt ? "char" : undefined} className="pointer-events-auto mx-auto max-h-[min(36vh,32rem)] w-full max-w-lg overflow-y-auto overscroll-contain plank border border-border bg-surface p-3 short:max-h-[62vh]">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-xl">Stats</p>
                  <p className="text-sm text-primary">{hud.points} stat · {hud.skillPoints} skill</p>
                </div>
                <p className="mt-1 text-xs text-muted">{hud.karmaWord}. {hud.repLine}</p>
                {(hud as any).v1513 ? (
                  <div className="mt-2 plank border border-primary/60 bg-bg px-2 py-2 text-xs" data-testid="m7-panel">
                    <p className="font-semibold text-primary">The Seven</p>
                    <div className="mt-1 grid grid-cols-7 gap-1 text-center">
                      {M7_STATS.map((st) => (
                        <div key={st.id} className="plank border border-border bg-surface px-0.5 py-1" title={st.does}>
                          <span className="block text-[10px] uppercase text-muted">{st.name}</span>
                          <span className="block font-display text-lg leading-none">{(hud as any).v1513.m7[st.id]}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-muted">AP in a fight {(hud as any).v1513.apMax} · Sequence {(hud as any).v1513.fx.seq >= 0 ? "+" : ""}{(hud as any).v1513.fx.seq} · Armor {(hud as any).v1513.fx.armor ? `+${(hud as any).v1513.fx.armor}` : "+0"} · Melee {(hud as any).v1513.fx.melee ? `+${(hud as any).v1513.fx.melee}` : "+0"}</p>
                    <p className="mt-1"><span className="font-semibold text-primary">Traits: </span>{(hud as any).v1513.traits.length ? (hud as any).v1513.traits.map((t: { name: string; up: string; down: string }) => `${t.name} (${t.up} ${t.down})`).join(" · ") : "none"}</p>
                    <p className="mt-1"><span className="font-semibold text-primary">Maine perks: </span>{(hud as any).v1513.perks.length ? (hud as any).v1513.perks.map((p: { name: string }) => p.name).join(" · ") : "none yet (one every 3 levels)"}</p>
                  </div>
                ) : null}
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
                      ["vigor", "Health", hud.vigor, "More life"], // v15.13.2: shown as Health (key vigor kept)
                      ["endurance", "Endurance", hud.endurance, "More stamina"],
                      ["intellect", "Intellect", hud.intellect, "Skill points, better prices, sharper talk"],
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

            {journalOpen || hud.statsOpen || hud.packOpen || hud.dialogue || mapOpen || (hud.v13?.main.ending && hud.v13.main.slide < 99) ? null : (
              <>
                {tb?.on ? <div className="pointer-events-none"><Tb15Order tb={tb} /></div> : null}
                <HudBar hud={hud} api={apiRef.current} />
              </>
            )}
        </div>
      ) : null}
      {playing && hud.v141?.stick && hud.phase === "play" && !hud.buildOpen && !hud.dialogue && !hud.v141.store ? (
        <Stick141 onMove={(x, y) => apiRef.current?.setStick(x, y)} />
      ) : null}
      <button
        type="button"
        data-fobar-btn="Map"
        data-hud="minimap"
        aria-label="Open the world map"
        className={playing && !hc.mini ? "hud-v5-steel absolute z-10 p-1" : "hidden"}
        style={{ top: "max(0.5rem, env(safe-area-inset-top))", right: "max(0.5rem, env(safe-area-inset-right))" }}
        onClick={() => { if (hud.statsOpen) apiRef.current?.toggleStats(); if (hud.packOpen) apiRef.current?.togglePack(); setJournalOpen(false); setMapOpen(true); }}
      >
        <canvas ref={miniRef} width={132} height={132} aria-hidden className="hud-v5-mini pointer-events-none block bg-[#141816]" />
      </button>
      {playing && hud.phase === "play" && !mapOpen && !journalOpen && !hud.statsOpen && !hud.packOpen && !hud.dialogue ? (
        <HudCorner
          statsOn={hud.statsOpen}
          journalOn={journalOpen}
          packOn={hud.packOpen}
          onStats={() => apiRef.current?.toggleStats()}
          onJournal={() => { if (hud.statsOpen) apiRef.current?.toggleStats(); if (hud.packOpen) apiRef.current?.togglePack(); setMapOpen(false); setJournalOpen((open) => !open); }}
          onPack={() => apiRef.current?.togglePack()}
        />
      ) : null}

      {playing && hud.phase === "play" && !mapOpen ? (
        <div data-hud="zoom" className="absolute bottom-[6.4rem] left-[max(0.5rem,env(safe-area-inset-left))] z-20 flex flex-col gap-1">
          <ActionButton label="Zoom out" onClick={() => apiRef.current?.nudgeZoom(1 / 1.2)}><Minus className="size-4" aria-hidden /></ActionButton>
          <ActionButton label="Zoom in" onClick={() => apiRef.current?.nudgeZoom(1.2)}><Plus className="size-4" aria-hidden /></ActionButton>
        </div>
      ) : null}
      {playing ? (
        <button type="button" data-hud-min="mini" aria-label={hc.mini ? "Show the corner chart" : "Hide the corner chart"} className="hud-v5-steel absolute z-20 h-8 w-8 text-xs font-bold" style={hc.mini ? { top: "max(0.5rem, env(safe-area-inset-top))", right: "max(0.5rem, env(safe-area-inset-right))" } : { top: "calc(max(0.5rem, env(safe-area-inset-top)) + var(--hud-mini) - 0.4rem)", right: "max(0.35rem, env(safe-area-inset-right))" }} onClick={(e) => { e.stopPropagation(); flipHc("mini"); }}>{hc.mini ? "+" : "–"}</button>
      ) : null}
      {hud.phase === "menu" ? (
        <CharCreate
          hasSave={!!hud.hasSave}
          ready={!!hud.ready}
          onContinue={() => apiRef.current?.continueGame()}
          slots={hud.slots ?? []}
          slot={hud.slot ?? 1}
          onSlot={(n) => apiRef.current?.setSlot(n)}
          auto={hud.auto ?? null}
          onAuto={() => apiRef.current?.loadAutosave()}
          onBegin={(r) => apiRef.current?.begin(r.name, r.role, { strength: 0, vigor: 0, endurance: 0, intellect: 0, perception: 0, luck: 0 }, "" as TraitId, r.look,
            { hair: "black", coat: "", hat: "", trousers: true, boots: true, backstory: "", hard: false, hero: r.hero, m7: r.m7, traits2: r.traits2, tags: r.tags,
              age: r.age, sex: r.sex, bag: r.bag, premade: r.premade, perk: r.perk, firstJob: r.firstJob, startTown: r.startTown, background: r.background, body: r.body, tint: r.tint } as any)}
        />
      ) : null}

      {hud.phase === "menu" && modeResult ? (
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
          <button type="button" data-testid="pause-options" aria-expanded={optionsOpen} className="plank border border-border px-4 py-3 text-left" onClick={() => setOptionsOpen((o) => !o)}>
            Options
          </button>
          {optionsOpen ? (
            <div className="flex flex-col gap-2" data-testid="pause-options-panel">
              <button type="button" data-testid="one-thumb" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.v141("stickMode")}>
                {hud.v141?.stick ? "One-thumb stick: on" : "One-thumb stick: off"}
              </button>
              <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.v141("auto")}>
                Auto-attack: {hud.v141?.auto ? "on" : "off"}
              </button>
              <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.setTurnBased(!(hud as any).tb15?.enabled)}>
                {(hud as any).tb15?.enabled ? "Turn-based combat: on" : "Turn-based combat: off"}
              </button>
              <button type="button" data-testid="fps-cap" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.setFpsCap((hud.fpsCap ?? 60) === 60 ? 30 : 60)}>
                Frame rate cap: {hud.fpsCap ?? 60} fps
              </button>
              <button type="button" data-testid="perf-toggle" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.setPerfMode(!hud.perfMode)}>
                Low graphics: {hud.perfMode ? "On" : "Off"}{(hud as any).powerSave && (hud as any).perfAuto ? " (power saving)" : (hud as any).perfAuto ? " (auto)" : ""}
              </button>
              <p className="px-1 text-[10px] leading-snug text-muted">Low turns on automatically when the phone is in power saving (Android APK). Tap above to override.</p>
              <button type="button" data-testid="gfx-toggle" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.setGraphics(!(hud.gfxHigh ?? true))}>
                Graphics: {(hud.gfxHigh ?? true) ? "High" : "Low"}
              </button>
              <button type="button" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.tap("menu")}>
                Main menu
              </button>
              {devUi ? (
                <>
                  <button type="button" data-testid="fps-toggle" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.setShowFps(!hud.showFps)}>
                    FPS counter: {hud.showFps ? "On" : "Off"}
                  </button>
                  <div className="flex gap-2">
                    <button type="button" data-testid="hud-collapse-all" className="flex-1 plank border border-border px-3 py-3" onClick={() => { saveHc({ quest: true, track: true, health: true, aim: true, mini: true }); setTrackerOpen0(false); }}>Collapse HUD</button>
                    <button type="button" data-testid="hud-expand-all" className="flex-1 plank border border-border px-3 py-3" onClick={() => { saveHc({ quest: false, track: false, health: false, aim: false, mini: false }); setTrackerOpen0(true); }}>Expand HUD</button>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
          <button type="button" data-testid="pause-save" className="plank border border-border px-4 py-3" onClick={() => apiRef.current?.tap("save")}>
            Save
          </button>
          <button type="button" data-testid="pause-exit" className="plank border border-border px-4 py-3" onClick={() => { apiRef.current?.tap("save"); setConfirmExit(true); }}>
            Exit
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
      className={`flex select-none items-center justify-center hud-metal plank border ${wide ? "h-14 w-full min-w-0 px-1 short:h-12" : "h-12 w-12 short:h-11 short:w-11"} ${pressed ? "border-primary bg-primary text-bg" : "border-border bg-surface text-fg"}`}
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
      <iframe ref={frame} data-testid="town-frame" title={`Town: ${town.id}`} src={town.src} allow="fullscreen" className="block h-full w-full border-0" />
    </div>
  );
}

type Tb15 = { on: boolean; enabled: boolean; mine?: boolean; ap?: number; maxAp?: number; round?: number; cur?: string; canEnd?: boolean;
  order?: { me: boolean; ally?: boolean; name: string; cur: boolean }[]; mag?: { n: number; max: number } | null; cost?: Record<string, number>;
  popup?: { id: number; name: string; body?: "person" | "deer" | "moose"; parts: { part: string; label: string; hit: number; ap: number }[] } | null };
/** v15.11.0: turn order strip (AP, End Turn and End Combat live in the bottom bar). */
function Tb15Order({ tb }: { tb: Tb15 }) {
  return (
    <div data-tb15="order" className="pointer-events-none flex max-w-full flex-wrap items-center gap-1 text-[10px]">
      <span className="fobar-plate px-1.5 py-0.5 font-bold text-primary">Combat · R{tb.round}</span>
      {(tb.order ?? []).map((o, i) => (
        <span key={i} className={`fobar-plate px-1.5 py-0.5 ${o.cur ? "outline outline-2 outline-[#e0b050]" : "opacity-80"} ${o.me ? "text-primary" : o.ally ? "text-[#9fc080]" : "text-[#e07a5a]"}`}>{o.name}</span>
      ))}
    </div>
  );
}
/** v15.11.0: placeholder body outlines drawn in code (Grok Build art replaces them later). Zones are [part, cx, cy] in a 200x200 box. */
const AIM_BODY: Record<string, { path: string; zones: Record<string, [number, number]> }> = {
  person: {
    path: "M100 18 a16 16 0 1 1 -0.1 0 Z M82 52 h36 l14 10 l10 48 h-12 l-8 -36 v46 l6 62 h-14 l-8 -52 h-8 l-8 52 h-14 l6 -62 v-46 l-8 36 h-12 l10 -48 Z",
    zones: { head: [134, 20], eyes: [100, 30], arms: [140, 92], torso: [100, 80], groin: [100, 124], legs: [86, 162] },
  },
  deer: {
    path: "M38 70 l10 -30 l6 4 l-4 18 l14 -16 l4 4 l-12 22 h8 q4 14 18 16 h64 q18 0 20 18 v8 l-6 4 v46 h-10 l-2 -40 h-6 l-4 40 h-10 v-42 h-50 l-6 42 h-10 l2 -42 l-6 0 l-4 42 h-10 l4 -50 q-14 -6 -14 -22 l-12 -4 q-8 -4 -4 -12 Z",
    zones: { head: [44, 78], eyes: [40, 70], arms: [70, 150], torso: [120, 104], groin: [150, 124], legs: [140, 158] },
  },
  moose: {
    path: "M22 40 l12 -8 l4 10 l8 -12 l6 10 l6 -10 l4 14 h4 l-4 22 q-4 16 -14 22 q-8 6 -14 0 l-6 -10 q-4 -8 4 -14 Z M60 74 q20 -18 40 -14 h56 q20 4 22 26 v14 l-6 4 v54 h-11 l-2 -44 h-6 l-4 44 h-11 v-46 h-44 l-6 46 h-11 l2 -46 h-6 l-4 46 h-11 l4 -60 q-6 -10 -2 -24 Z",
    zones: { head: [40, 56], eyes: [36, 48], arms: [76, 156], torso: [120, 98], groin: [160, 122], legs: [150, 160] },
  },
};
/** v15.11.0 aimed-shot screen: tap a body part on the outline (or the list) to see and take the shot. */
function AimPopup({ tb, api }: { tb: Tb15; api: { current: any } }) {
  const p = tb.popup!;
  const body = AIM_BODY[p.body ?? "person"] ?? AIM_BODY.person;
  const fire = (part: string) => api.current?.v141("tbAttack", [p.id, part]);
  const ok = (q: { hit: number; ap: number }) => !!q.hit && q.ap <= (tb.ap ?? 0);
  return (
    <div data-tb15="aim" className="pointer-events-auto absolute inset-0 z-[65] flex items-center justify-center bg-black/55 p-2" onClick={() => api.current?.v141("tbClose")}>
      <div className="fobar flex max-h-full w-full max-w-[40rem] gap-2 p-2" onClick={(e) => e.stopPropagation()}>
        <div className="fobar-screen relative aspect-square h-[min(70vh,16rem)] shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full" aria-label={`Outline of the ${p.name}`}>
            <path d={body.path} fill="rgba(150,190,110,.16)" stroke="#9fc080" strokeWidth="2" strokeLinejoin="round" />
            {p.parts.map((q) => { const z = body.zones[q.part]; if (!z) return null; return (
              <g key={q.part} data-zone={q.part} className={ok(q) ? "cursor-pointer" : "opacity-40"} onClick={() => ok(q) && fire(q.part)}>
                <circle cx={z[0]} cy={z[1]} r="13" fill="rgba(0,0,0,.55)" stroke={ok(q) ? "#e0b050" : "#6a5a3a"} strokeWidth="2" />
                <text x={z[0]} y={z[1] + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f0dca0">{q.hit ? q.hit : "-"}</text>
              </g>); })}
          </svg>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between text-sm"><b className="truncate text-primary">Aim at the {p.name}</b><span className="text-xs text-muted">AP {tb.ap}/{tb.maxAp}</span></div>
          <div className="grid flex-1 grid-cols-2 gap-1">
            {p.parts.map((q) => (
              <button key={q.part} type="button" data-part={q.part} disabled={!ok(q)} className="fobar-btn flex min-h-10 items-center justify-between px-2 disabled:opacity-40" onClick={() => fire(q.part)}>
                <span className="font-semibold">{q.label}</span><span className="text-xs tabular-nums">{q.hit ? `${q.hit}%` : "—"} · {q.ap}AP</span>
              </button>
            ))}
          </div>
          <button type="button" className="fobar-btn min-h-10 w-full px-2 text-xs" onClick={() => api.current?.v141("tbClose")}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/** v15.12.0: Grok Build art loads; until (or unless) it does, the code-drawn look stays. */
const artCache: Record<string, boolean | undefined> = {};
function useArt(url: string) {
  const [ok, setOk] = useState(() => artCache[url] === true);
  useEffect(() => {
    if (artCache[url] !== undefined) { setOk(!!artCache[url]); return; }
    const im = new Image();
    im.onload = () => { artCache[url] = true; setOk(true); };
    im.onerror = () => { artCache[url] = false; setOk(false); };
    im.src = url;
  }, [url]);
  return ok;
}
const ENDING_ART = ["harmony", "skowhegan", "pittsfield", "greenville"];
/** v15.12.0: the trail radio (Build's device frame) around the Journal, with Journal / Map / Status tabs on its right side. */
function DeviceFrame({ children, onTab, active }: { children: ReactNode; onTab: (t: "journal" | "map" | "status") => void; active: string }) {
  const art = useArt("/game/ui/device-frame.png");
  if (!art) return <>{children}</>;
  return (
    <div data-ui="device" className="pointer-events-auto relative mx-auto w-full max-w-[min(94vw,calc((100vh-6rem)*1.97))]" style={{ aspectRatio: "1441 / 731" }}>
      <img src="/game/ui/device-frame.png" alt="" className="pointer-events-none absolute select-none" style={{ width: "111.03%", height: "123.12%", left: "-5.55%", top: "-12.31%", maxWidth: "none" }} />
      <div className="absolute overflow-hidden" style={{ left: "6.94%", top: "12.31%", width: "62.53%", height: "68.54%" }}>
        <div className="device-screen h-full overflow-y-auto overscroll-contain">{children}</div>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "url(/game/ui/device-scanlines.png)", backgroundSize: "100% 100%" }} />
      </div>
      <div className="absolute flex flex-col gap-1.5" style={{ left: "75%", top: "30%", width: "18%" }}>
        {(["journal", "map", "status"] as const).map((t) => (
          <button key={t} type="button" data-device-tab={t} className={`fobar-btn min-h-10 text-xs font-bold capitalize ${active === t ? "on" : ""}`} onClick={() => onTab(t)}>{t}</button>
        ))}
      </div>
    </div>
  );
}
/** v15.12.0: Build's Maine map with town markers on the travel hexes, fog on hexes you haven't seen, and you. */
function MaineMap({ wm }: { wm: { fog?: string[]; here?: { q: number; r: number } | null; locked?: string[] } | null }) {
  const fog = new Set(wm?.fog ?? []);
  const pos = (q: number, r: number) => ({ x: ((q + (r % 2 ? 0.5 : 0) + 0.5) / (WM_COLS + 0.5)) * 100, y: ((r + 0.5) / WM_ROWS) * 100 });
  const cells: { q: number; r: number }[] = [];
  for (let r = 0; r < WM_ROWS; r++) for (let q = 0; q < WM_COLS; q++) cells.push({ q, r });
  return (
    <div data-testid="maine-map" className="relative mx-auto aspect-square h-full max-h-full max-w-full overflow-hidden border-2 border-[#3a2a18]" style={{ backgroundImage: "url(/game/ui/worldmap-maine.jpg)", backgroundSize: "cover" }}>
      {fog.size ? cells.filter((c) => !fog.has(`${c.q},${c.r}`)).map((c) => { const p = pos(c.q, c.r); return <span key={`${c.q},${c.r}`} className="pointer-events-none absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${100 / WM_COLS + 1}%`, height: `${100 / WM_ROWS + 1}%`, transform: "translate(-50%,-50%)", backgroundImage: "url(/game/ui/map-fog.png)", backgroundSize: "64px 64px" }} />; }) : null}
      {WM_LOCS.filter((l) => !(wm?.locked ?? []).includes(l.id) && (!fog.size || fog.has(`${l.q},${l.r}`))).map((l) => { const p = pos(l.q, l.r); return (
        <span key={l.id} className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <img src={`/game/ui/map-marker-${l.id === "raiders" ? "camp" : "town"}.png`} alt="" className="size-6" />
          <span className="whitespace-nowrap bg-black/60 px-1 text-[9px] leading-tight text-[#f0e0b8]">{l.name.split(" · ")[0]}</span>
        </span>); })}
      {wm?.here ? (() => { const p = pos(wm.here.q, wm.here.r); return <img data-testid="maine-map-you" src="/game/ui/map-marker-player.png" alt="You" className="absolute size-7 -translate-x-1/2 -translate-y-full" style={{ left: `${p.x}%`, top: `${p.y}%` }} />; })() : null}
    </div>
  );
}
