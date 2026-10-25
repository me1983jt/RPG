import type { LookId } from "@/game/gear";

export type HairId = "black" | "brown" | "gray" | "auburn";

export const HAIRS: { id: HairId; label: string; color: string }[] = [
  { id: "black", label: "Black", color: "#201c18" },
  { id: "brown", label: "Brown", color: "#56341e" },
  { id: "gray", label: "Gray", color: "#a8a49c" },
  { id: "auburn", label: "Auburn", color: "#842c20" },
];

export const COAT_PICKS: { id: "" | "canvas" | "waxed"; label: string }[] = [
  { id: "", label: "Shirt" },
  { id: "canvas", label: "Canvas" },
  { id: "waxed", label: "Waxed" },
];

export const HAT_PICKS: { id: "" | "toque" | "huntcap"; label: string }[] = [
  { id: "", label: "Bare" },
  { id: "toque", label: "Toque" },
  { id: "huntcap", label: "Cap" },
];

export type StartLook = {
  hair: HairId;
  coat: "" | "canvas" | "waxed";
  hat: "" | "toque" | "huntcap";
  trousers: boolean;
  boots: boolean;
  backstory?: "veteran" | "mechanic" | "farmer" | "hunter" | "";
  hard?: boolean;
  /** v15.10: play as Justin (default) or Sarah */
  hero?: "justin" | "sarah";
};

const LOOK_RGB: Record<LookId, [number, number, number]> = {
  wool: [140, 98, 66],
  spruce: [70, 104, 72],
  linen: [206, 192, 160],
  soot: [66, 68, 74],
};

const HAIR_RGB: Record<HairId, [number, number, number]> = {
  black: [32, 26, 22],
  brown: [86, 52, 30],
  gray: [168, 164, 156],
  auburn: [132, 52, 32],
};

const PANTS_RGB: Record<LookId, [number, number, number]> = {
  wool: [58, 46, 38],
  spruce: [44, 54, 44],
  linen: [96, 82, 66],
  soot: [34, 34, 38],
};

function mix(r: number, g: number, b: number, target: [number, number, number], amt: number, minScale = 0.45): [number, number, number] {
  const lum = r * 0.3 + g * 0.59 + b * 0.11;
  const tl = target[0] * 0.3 + target[1] * 0.59 + target[2] * 0.11 || 1;
  const scale = Math.max(minScale, Math.min(1.35, lum / tl));
  let nr = target[0] * scale;
  let ng = target[1] * scale;
  let nb = target[2] * scale;
  const top = Math.max(nr, ng, nb);
  if (top > 220) {
    const k = 220 / top;
    nr *= k;
    ng *= k;
    nb *= k;
  }
  return [r + (nr - r) * amt, g + (ng - g) * amt, b + (nb - b) * amt];
}

/** Recolor the painted player sheet in place: hair, shirt, trousers. Face and boots stay. */
export type BodyDyeOpts = { shirt?: [number, number, number] | null; pants?: [number, number, number] | null; hat?: [number, number, number] | null };
export function dyeBodySheet(data: ImageData, cols: number, look: LookId, hair: HairId, rows = 8, opts: BodyDyeOpts = {}): void {
  const px = data.data;
  const cw = data.width / cols;
  const ch = data.height / rows;
  const shirt = opts.shirt ?? LOOK_RGB[look] ?? LOOK_RGB.wool;
  const hairC = HAIR_RGB[hair] ?? HAIR_RGB.black;
  const pants = opts.pants ?? PANTS_RGB[look] ?? PANTS_RGB.wool;
  const hatC = opts.hat ?? null;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x0 = col * cw;
      const y0 = row * ch;
      let top = ch;
      let bottom = 0;
      let n = 0;
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          if (px[((y0 + y) * data.width + (x0 + x)) * 4 + 3] < 40) continue;
          n++;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
      if (n < 20) continue;
      const bh = Math.max(1, bottom - top);
      for (let y = top; y <= bottom; y++) {
        for (let x = 0; x < cw; x++) {
          const i = ((y0 + y) * data.width + (x0 + x)) * 4;
          const a = px[i + 3] ?? 0;
          if (a < 40) continue;
          const r = px[i] ?? 0;
          const g = px[i + 1] ?? 0;
          const b = px[i + 2] ?? 0;
          const lum = r * 0.3 + g * 0.59 + b * 0.11;
          const by = (y - top) / bh;
          const skin = r > 145 && r > g + 28 && g > b - 8 && by < 0.42 && lum > 70;
          if (skin) continue;
          let next: [number, number, number] | null = null;
          if (hatC && by < 0.1 && !skin) next = mix(r, g, b, hatC, 0.92, 0.75);
          else if (by < 0.17 && lum < 120) next = mix(r, g, b, hairC, 0.88);
          else if (by > 0.2 && by < 0.54 && lum > 22 && lum < 210) next = mix(r, g, b, shirt, opts.shirt ? 0.9 : 0.8, opts.shirt ? 0.72 : 0.45);
          else if (by > 0.56 && by < 0.86 && lum > 14 && lum < 170) next = mix(r, g, b, pants, 0.72);
          if (!next) continue;
          px[i] = next[0];
          px[i + 1] = next[1];
          px[i + 2] = next[2];
        }
      }
    }
  }
}
