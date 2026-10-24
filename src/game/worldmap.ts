/** v14 world map: a painted top-down map of the region with a pointy-top hex grid (odd-r offset). */
export const WM_COLS = 12, WM_ROWS = 9, WM_HEX = 50;
// R road, F field, W woods, V river, T town / area
export const WM_TERRAIN = [
  "WWWWWTWWWWWW",
  "WWWWWTWWWWWW",
  "WWWWWRWWWWFF",
  "FWWWWRWWVFTF",
  "FFTRRRWVVRRF",
  "FFFFRTRTWWFF",
  "WFFFFRWVFFWW",
  "WWWTRRRVTFWW",
  "WWWWWWWVWWWW",
];
export const WM_HOURS: Record<string, number> = { R: 0.6, T: 0.6, F: 1.2, W: 2, V: 2.5 };
export interface WmLoc { id: string; name: string; q: number; r: number; map: number; blurb: string; town?: string; lock?: "moosehead" }
export const WM_LOCS: WmLoc[] = [
  { id: "farm", name: "Harmony · Cambridge Road", q: 5, r: 5, map: 0, blurb: "The farm, Lowelltown road and Jack's." },
  { id: "lowell", name: "Lowelltown Woods", q: 2, r: 4, map: 3, blurb: "Spruce and old logging roads." },
  { id: "skow", name: "Skowhegan", q: 8, r: 7, map: 2, blurb: "Dead streetlights and one bridge." },
  { id: "kennebec", name: "The Kennebec", q: 7, r: 5, map: 4, blurb: "Wide water, a single crossing." },
  { id: "north", name: "North Woods · The Grok's woods", q: 5, r: 1, map: 1, blurb: "Chain of Ponds and deep timber." },
  { id: "raiders", name: "Raider Country", q: 10, r: 3, map: 5, blurb: "Camps along the ridge. Stay off the skyline." },
  { id: "bunker", name: "The Bunker", q: 3, r: 7, map: 6, blurb: "A hatch under the birches." },
  // v15.1: Quest RPG town games. Pittsfield lies south-east of Harmony on the rail line, Skowhegan (bridge + Water Street) south-east down the Kennebec.
  { id: "pittsfield", name: "Pittsfield", q: 6, r: 7, map: 0, town: "pittsfield", blurb: "Railroad town. Rusty Maine Central rails, a water tower, the farmers' co-op." },
  // v15.4: Greenville on Moosehead Lake, north of the North Woods. Hidden until the Harmony map + ferry flags are set.
  { id: "greenville", name: "Greenville · Moosehead Lake", q: 5, r: 0, map: 7, lock: "moosehead", blurb: "Cabins at the foot of the lake. The ferry dock is the only way north." },
  { id: "skowhegan", name: "Skowhegan · Water Street", q: 9, r: 7, /* v15.9.2: beside the Skowhegan bridge hex (8,7), same map */ map: 2, town: "skowhegan", blurb: "Redington hospital, the woolen mill, Marcel's store." },
];
/** Room for future loot spots: hexes that will open as small maps later. */
export const LOOT_SPOTS: { q: number; r: number; name: string; open: boolean }[] = [
  { q: 9, r: 6, name: "Burned-out store", open: false },
  { q: 1, r: 2, name: "Fire tower", open: false },
];
export const terrainAt = (q: number, r: number) => WM_TERRAIN[r]?.[q] ?? "W";
export const hexKey = (q: number, r: number) => `${q},${r}`;
export function hexCenter(q: number, r: number) {
  const s = WM_HEX;
  return { x: s * Math.sqrt(3) * (q + 0.5 * (r & 1)) + s * Math.sqrt(3) / 2 + 10, y: s * 1.5 * r + s + 10 };
}
export const WM_W = Math.ceil(WM_HEX * Math.sqrt(3) * (WM_COLS + 0.5) + 20), WM_H = Math.ceil(WM_HEX * 1.5 * (WM_ROWS - 1) + WM_HEX * 2 + 20);
export function hexNeighbors(q: number, r: number): [number, number][] {
  const odd = r & 1;
  const d = odd ? [[1, 0], [-1, 0], [0, -1], [1, -1], [0, 1], [1, 1]] : [[1, 0], [-1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]];
  return d.map(([dq, dr]) => [q + dq!, r + dr!] as [number, number]).filter(([a, b]) => a >= 0 && b >= 0 && a < WM_COLS && b < WM_ROWS);
}
export function hexAt(x: number, y: number): [number, number] | null {
  let best: [number, number] | null = null, bd = 1e9;
  for (let r = 0; r < WM_ROWS; r++) for (let q = 0; q < WM_COLS; q++) { const c = hexCenter(q, r); const d = (c.x - x) ** 2 + (c.y - y) ** 2; if (d < bd) { bd = d; best = [q, r]; } }
  return bd <= WM_HEX * WM_HEX ? best : null;
}
/** Cheapest hours path (Dijkstra). bike halves road and field. */
export function hexPath(from: [number, number], to: [number, number], bike: boolean): [number, number][] {
  const cost = (q: number, r: number) => { const t = terrainAt(q, r); const h = WM_HOURS[t] ?? 2; return bike && (t === "R" || t === "T" || t === "F") ? h * 0.5 : h; };
  const dist = new Map<string, number>([[hexKey(...from), 0]]), prev = new Map<string, string>();
  const open: [number, number, number][] = [[0, from[0], from[1]]];
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [d, q, r] = open.shift()!;
    if (q === to[0] && r === to[1]) break;
    for (const [nq, nr] of hexNeighbors(q, r)) {
      const nd = d + cost(nq, nr), k = hexKey(nq, nr);
      if (nd < (dist.get(k) ?? 1e9)) { dist.set(k, nd); prev.set(k, hexKey(q, r)); open.push([nd, nq, nr]); }
    }
  }
  const out: [number, number][] = [];
  let k = hexKey(...to);
  if (!prev.has(k) && k !== hexKey(...from)) return [];
  while (k !== hexKey(...from)) { const [q, r] = k.split(",").map(Number); out.unshift([q!, r!]); k = prev.get(k)!; }
  return out;
}
export const hexHours = (q: number, r: number, bike: boolean) => { const t = terrainAt(q, r); const h = WM_HOURS[t] ?? 2; return bike && (t === "R" || t === "T" || t === "F") ? h * 0.5 : h; };
export const locAt = (q: number, r: number) => WM_LOCS.find((l) => l.q === q && l.r === r) ?? null;
/** v15.4: Moosehead opens only with questFlags['harmony.hasMooseheadMap'] === true AND questFlags['harmony.ferry'] === 'fixed'. */
export const mooseheadOpen = (flags: Record<string, unknown> | null | undefined) => !!flags && flags["harmony.hasMooseheadMap"] === true && flags["harmony.ferry"] === "fixed";
export const locLocked = (l: WmLoc | null | undefined, flags: Record<string, unknown> | null | undefined) => !!l && l.lock === "moosehead" && !mooseheadOpen(flags);
export const locOfMap = (map: number) => WM_LOCS.find((l) => l.map === map && map >= 0) ?? WM_LOCS[0]!;
