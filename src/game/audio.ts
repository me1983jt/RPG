let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0): void {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/**
 * v11.2 sound + music hooks. Real files are optional: public/game/audio/manifest.json lists the ones that exist
 * (written by scripts/gen-optional-art.mjs), e.g. "sfx/shoot", "music/day". Only listed files are ever requested,
 * so missing audio never 404s; sfx fall back to the built-in tones and music stays silent.
 */
const audioFiles = new Set<string>();
let manifestTried = false;
function loadManifest(): void {
  if (manifestTried || typeof window === "undefined") return;
  manifestTried = true;
  fetch("/game/audio/manifest.json")
    .then((r) => (r.ok ? r.json() : []))
    .then((list: unknown) => {
      if (Array.isArray(list)) for (const n of list) if (typeof n === "string") audioFiles.add(n);
      if (wantTrack) setMusic(wantTrack, true);
    })
    .catch(() => {});
}
if (typeof window !== "undefined") loadManifest();
const sfxCache = new Map<string, HTMLAudioElement>();
let musicEl: HTMLAudioElement | null = null;
let musicTrack = "";
let wantTrack = "";
let musicVol = 0.35;
export function audioState(): { files: string[]; track: string; playing: string } {
  return { files: [...audioFiles], track: wantTrack, playing: musicTrack };
}
/** Ask for a music track ("menu" | "day" | "night" | "raid"). Plays /game/audio/music/<track>.mp3 if it exists. */
export function setMusic(track: string, force = false): void {
  if (track === wantTrack && !force) return;
  wantTrack = track;
  const key = `music/${track}`;
  if (!audioFiles.has(key)) {
    if (musicEl) { musicEl.pause(); musicEl = null; musicTrack = ""; }
    return;
  }
  if (musicTrack === track && musicEl) return;
  try {
    if (musicEl) musicEl.pause();
    const el = new Audio(`/game/audio/${key}.mp3`);
    el.loop = true;
    el.volume = musicVol;
    void el.play().catch(() => {});
    musicEl = el;
    musicTrack = track;
  } catch {
    musicEl = null;
  }
}
export function setMusicVolume(v: number): void {
  musicVol = Math.max(0, Math.min(1, v));
  if (musicEl) musicEl.volume = musicVol;
}
function playFile(name: string): boolean {
  const key = `sfx/${name}`;
  if (!audioFiles.has(key)) return false;
  try {
    let base = sfxCache.get(key);
    if (!base) { base = new Audio(`/game/audio/${key}.mp3`); sfxCache.set(key, base); }
    const a = base.cloneNode() as HTMLAudioElement;
    a.volume = 0.6;
    void a.play().catch(() => {});
    return true;
  } catch {
    return false;
  }
}

export function sfx(name: "hit" | "hurt" | "build" | "talk" | "level" | "gather" | "die" | "click" | "chop" | "mine" | "shoot"): void {
  unlockAudio();
  if (playFile(name)) return;
  if (!ctx) return;
  switch (name) {
    case "hit":
      tone(180, 0.08, "square", 0.05);
      tone(90, 0.12, "triangle", 0.04, 0.02);
      break;
    case "hurt":
      tone(140, 0.14, "sawtooth", 0.04);
      break;
    case "build":
      tone(220, 0.1, "triangle", 0.05);
      tone(330, 0.14, "triangle", 0.04, 0.08);
      break;
    case "talk":
      tone(420, 0.05, "sine", 0.03);
      break;
    case "level":
      tone(392, 0.1, "triangle", 0.05);
      tone(523, 0.16, "triangle", 0.05, 0.09);
      break;
    case "gather":
      tone(300, 0.06, "square", 0.03);
      break;
    case "die":
      tone(160, 0.25, "sawtooth", 0.05);
      tone(80, 0.35, "triangle", 0.04, 0.1);
      break;
    case "click":
      tone(520, 0.04, "sine", 0.03);
      break;
    case "chop":
      tone(98, 0.07, "square", 0.06);
      tone(62, 0.14, "triangle", 0.05, 0.03);
      break;
    case "mine":
      tone(720, 0.04, "square", 0.04);
      tone(210, 0.1, "triangle", 0.05, 0.02);
      break;
    case "shoot":
      tone(140, 0.05, "sawtooth", 0.06);
      tone(60, 0.16, "triangle", 0.05, 0.01);
      break;
    default:
      break;
  }
}
