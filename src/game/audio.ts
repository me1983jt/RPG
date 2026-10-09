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

export function sfx(name: "hit" | "hurt" | "build" | "talk" | "level" | "gather" | "die" | "click" | "chop" | "mine"): void {
  unlockAudio();
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
    default:
      break;
  }
}
