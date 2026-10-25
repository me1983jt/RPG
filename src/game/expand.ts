// v15.10.3: the 3x world map. Every map is generated in the old 156-tile frame (world.ts, unchanged), then embedded at
// +MAP_OFF tiles in a 284 grid here. The home map (0) also gets a new ring of land out to HEX_R0: empty terrain only
// (no props, animals or people): its five gate roads, the Kennebec and the Sebasticook run on outward, Moosehead Lake to
// the north (the Kennebec flows out of it), hills rising to mountains north and west, wetlands by the new water, and a
// reserved castle-town lot in a notch on the far north-west edge with its lake (Lake Gloriette) right in front and cliffs behind.
import { DIRT, HEX_CX2, HEX_CY2, HEX_R, HEX_R0, MAP_H, MAP_H2, MAP_OFF, MAP_W, MAP_W2, ROAD, RUBBLE, SCRUB, SNOW, VOID, TILE } from "@/game/types";
import type { World } from "@/game/world";

const N = MAP_W2;
const S3 = Math.sqrt(3);
export function inHexR(tx: number, ty: number, r: number): boolean {
  const ax = Math.abs(tx - HEX_CX2), ay = Math.abs(ty - HEX_CY2);
  return ax <= (S3 / 2) * r && ay <= r - ax / S3;
}
/** Hex radius of a map in the runtime frame. */
export function hexRadius(mapId: number): number { return mapId === 0 ? HEX_R0 : HEX_R; }
/** The reserved castle town (the Balsams at Dixville Notch), runtime tiles. */
export const CASTLE_SPOT = { tx: 54, ty: 98, name: "Castle town (reserved)", lake: { tx: 60, ty: 103 } } as const;

function h(x: number, y: number, s = 0): number {
  let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((s + 7741) | 0, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function vn(x: number, y: number, sc: number, s: number): number {
  const gx = x / sc, gy = y / sc, x0 = Math.floor(gx), y0 = Math.floor(gy);
  let fx = gx - x0, fy = gy - y0; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const a = h(x0, y0, s), b = h(x0 + 1, y0, s), c = h(x0, y0 + 1, s), e = h(x0 + 1, y0 + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + e) * fx * fy;
}

/** Move a freshly generated (156-frame) world into the 284 runtime grid. Ids, kinds and order are untouched. */
export function embedWorld(w: World & { W?: number; keep?: Uint8Array }): void {
  if (w.W === N) return;
  const tiles = new Uint8Array(N * MAP_H2).fill(VOID), blocked = new Uint8Array(N * MAP_H2).fill(1), keep = new Uint8Array(N * MAP_H2);
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const i = (y + MAP_OFF) * N + x + MAP_OFF;
    tiles[i] = w.tiles[y * MAP_W + x]!; blocked[i] = w.blocked[y * MAP_W + x]!; keep[i] = 1;
  }
  w.tiles = tiles; w.blocked = blocked; w.keep = keep;
  const P = MAP_OFF * TILE;
  for (const p of w.props) { p.tx += MAP_OFF; p.ty += MAP_OFF; }
  for (const e of w.enemies) { e.x += P; e.y += P; e.homeX += P; e.homeY += P; e.path = null; }
  for (const n of w.npcs) { n.x += P; n.y += P; n.homeX += P; n.homeY += P; n.path = null; }
  for (const g of w.gates) { g.tx += MAP_OFF; g.ty += MAP_OFF; g.arriveTx += MAP_OFF; g.arriveTy += MAP_OFF; }
  w.startX += P; w.startY += P;
  if (w.flood) w.flood = { tx: w.flood.tx + MAP_OFF, ty: w.flood.ty + MAP_OFF };
  if (w.checkpoint) w.checkpoint = { tx: w.checkpoint.tx + MAP_OFF, ty: w.checkpoint.ty + MAP_OFF };
  w.W = N;
}

/** True where the old home map has real content (inside its hex; its outer void ring is free to fill). */
function oldLand(w: World & { keep?: Uint8Array }, x: number, y: number): boolean {
  const i = y * N + x;
  if (!w.keep?.[i]) return false;
  if (!inHexR(x, y, HEX_R)) return false;
  return w.tiles[i] !== VOID || inHexR(x, y, HEX_R - 3);
}

export function expandHome(w: World & { W?: number; keep?: Uint8Array; castle?: typeof CASTLE_SPOT; expanded?: boolean }): void {
  if (w.expanded) return;
  const T = w.tiles, B = w.blocked;
  const mine = new Uint8Array(N * MAP_H2); // new-ring cells
  for (let y = 0; y < MAP_H2; y++) for (let x = 0; x < N; x++) if (inHexR(x, y, HEX_R0 - 1) && !oldLand(w, x, y)) mine[y * N + x] = 1;
  const set = (x: number, y: number, t: number) => {
    if (x < 0 || y < 0 || x >= N || y >= MAP_H2) return; const i = y * N + x; if (!mine[i]) return;
    T[i] = t; B[i] = t === VOID || t === RUBBLE ? 1 : 0;
  };
  const CX = HEX_CX2, CY = HEX_CY2;
  // 1) land: elevation climbs to the north (low y) and west (low x): hills, broken ridges, snow on the high tops
  for (let y = 0; y < MAP_H2; y++) for (let x = 0; x < N; x++) {
    if (!mine[y * N + x]) continue;
    const north = Math.max(0, (CY - 30 - y) / 90), west = Math.max(0, (CX - 40 - x) / 80);
    const e = .55 * vn(x, y, 14, 1) + .3 * vn(x, y, 6, 2) + .15 * vn(x, y, 3, 3) + 1.1 * Math.max(north, west * .9) - .35;
    let t = vn(x, y, 9, 4) < .55 ? DIRT : SCRUB;
    if (e > 1.18 && (north > .45 || west > .6)) t = SNOW;
    else if (e > .92) t = h(x, y, 6) < .7 ? RUBBLE : SCRUB;
    else if (e > .72) t = h(x, y, 5) < .55 ? RUBBLE : SCRUB;
    else if (e > .55) t = SCRUB;
    set(x, y, t);
  }
  // 2) water
  const lake = (cx: number, cy: number, a: number, b: number, ang = .6, wob = .1) => {
    for (let y = Math.floor(cy - a - 3); y <= cy + a + 3; y++) for (let x = Math.floor(cx - a - 3); x <= cx + a + 3; x++) {
      const dx = x - cx, dy = y - cy, al = dx * Math.cos(ang) + dy * Math.sin(ang), ac = -dx * Math.sin(ang) + dy * Math.cos(ang);
      const th = Math.atan2(ac, al), s = 1 + Math.sin(th * 3 + 1) * wob + Math.sin(th * 7) * wob * .6;
      if ((al / a) ** 2 + (ac / b) ** 2 <= s) set(x, y, VOID);
    }
  };
  const river = (pts: [number, number][], wd: number) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i]!, [x1, y1] = pts[i + 1]!, n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2;
      for (let k = 0; k <= n; k++) {
        const t = k / n, x = x0 + (x1 - x0) * t + Math.sin((y0 + k) * .21) * 1.3, y = y0 + (y1 - y0) * t, r = wd + Math.sin((x - y) * .13) * .6;
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
          const ax = (dx - dy) / Math.SQRT2, ay = (dx + dy) / Math.SQRT2;
          if (Math.abs(ax) <= r && Math.abs(ay) <= 1.4) set(Math.round(x + dx), Math.round(y + dy), VOID);
        }
      }
    }
  };
  const o = (x: number, y: number): [number, number] => [x + MAP_OFF, y + MAP_OFF];
  lake(112, 40, 26, 9, 1.15, .14); // Moosehead Lake
  river([[112, 49], [96, 66], [84, 96], [78, 120], o(14, 69)], 2.6); // Kennebec out of Moosehead to the old river
  river([o(90, 147), [156, 228], [160, 250], [164, 268]], 2.8); // Kennebec on south to Waterville / Augusta
  river([o(139, 117), [196, 192], [172, 214], [158, 226]], 1.6); // Sebasticook joins it at Winslow
  const C = CASTLE_SPOT;
  lake(C.lake.tx, C.lake.ty, 6.5, 3.6, .7, .06); // Lake Gloriette, right in front of the castle
  for (const [px, py, a, b] of [[150, 64, 4, 2.5], [205, 120, 5, 3], [70, 150, 4, 2.5], [186, 250, 4, 2.6], [232, 160, 4, 3]] as const) lake(px, py, a, b);
  // 3) the notch: cliffs wrap the castle lot on the north-west; the lot itself stays flat, open ground
  for (let y = C.ty - 18; y <= C.ty + 18; y++) for (let x = C.tx - 18; x <= C.tx + 18; x++) {
    const dx = x - C.tx, dy = y - C.ty, r = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
    if (r > 7 && r < 16 && dx + dy < 4 && Math.abs(Math.sin(ang - Math.PI * .75)) > .18) set(x, y, r > 12 && h(x, y, 9) < .5 ? SNOW : RUBBLE);
    else if (r <= 5 && T[y * N + x] !== VOID) set(x, y, DIRT);
  }
  // 4) wetlands: scrub and small open pools around the new water
  const wet: number[] = [];
  for (let i = 0; i < T.length; i++) if (mine[i] && T[i] === VOID) wet.push(i);
  for (const i of wet) {
    const x = i % N, y = (i / N) | 0;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= MAP_H2) continue; const j = yy * N + xx;
      if (!mine[j] || T[j] === VOID) continue;
      if ((T[j] === DIRT || T[j] === SCRUB) && h(xx, yy, 7) < .55) set(xx, yy, SCRUB);
      if (T[j] === SCRUB && h(xx, yy, 8) < .03 && Math.hypot(dx, dy) > 2) set(xx, yy, VOID);
    }
  }
  // 5) roads: each gate road runs on to the new edge (the gate moves there); Route 26 through the notch to the castle lot
  const road = (pts: [number, number][]) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i]!, [x1, y1] = pts[i + 1]!, n = Math.max(1, Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
      for (let k = 0; k <= n; k++) { const x = Math.round(x0 + (x1 - x0) * k / n), y = Math.round(y0 + (y1 - y0) * k / n); for (const [a, b] of [[0, 0], [1, 0], [0, 1]]) set(x + a!, y + b!, ROAD); }
    }
  };
  const edge = (p: [number, number], q: [number, number], inset: number): [number, number] => {
    let [x, y] = p; let dx = q[0] - p[0], dy = q[1] - p[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    while (inHexR(Math.round(x + dx), Math.round(y + dy), HEX_R0 - inset)) { x += dx; y += dy; }
    return [Math.round(x), Math.round(y)];
  };
  const via: Record<number, [[number, number], [number, number]]> = { 0: [[150, 70], [138, 22]], 5: [[102, 60], [92, 46]], 1: [[230, 140], [262, 136]], 2: [[176, 230], [166, 270]], 3: [[100, 214], [70, 220]] };
  for (const g of w.gates) {
    const v = via[g.side]; if (!v) continue;
    const mouth = edge(v[0], v[1], 3), arrive = edge(v[0], v[1], 11);
    road([[g.tx, g.ty], v[0], mouth]);
    g.tx = mouth[0]; g.ty = mouth[1]; g.arriveTx = arrive[0]; g.arriveTy = arrive[1];
  }
  const g5 = w.gates.find((g) => g.side === 5);
  const old5: [number, number] = o(49, 25);
  road([old5, [88, 88], [72, 100], [C.tx + 4, C.ty + 4]]);
  road([[112, 52], [112, 60], old5]);
  void g5;
  // the outer edge beyond the new hex stays void
  w.castle = CASTLE_SPOT; w.expanded = true;
}
