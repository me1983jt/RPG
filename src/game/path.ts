const DIRS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 0, 10],
  [-1, 0, 10],
  [0, 1, 10],
  [0, -1, 10],
  [1, 1, 14],
  [1, -1, 14],
  [-1, 1, 14],
  [-1, -1, 14],
];

class MinHeap {
  private n: number[] = [];
  private k: number[] = [];
  get length(): number {
    return this.n.length;
  }
  push(node: number, key: number): void {
    this.n.push(node);
    this.k.push(key);
    this.up(this.n.length - 1);
  }
  pop(): number {
    const top = this.n[0] ?? -1;
    const ln = this.n.pop();
    const lk = this.k.pop();
    if (this.n.length && ln !== undefined && lk !== undefined) {
      this.n[0] = ln;
      this.k[0] = lk;
      this.down(0);
    }
    return top;
  }
  private up(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.k[i]! >= this.k[p]!) break;
      this.swap(i, p);
      i = p;
    }
  }
  private down(i: number): void {
    const n = this.n.length;
    for (;;) {
      let s = i;
      const l = i * 2 + 1;
      const r = l + 1;
      if (l < n && this.k[l]! < this.k[s]!) s = l;
      if (r < n && this.k[r]! < this.k[s]!) s = r;
      if (s === i) break;
      this.swap(i, s);
      i = s;
    }
  }
  private swap(a: number, b: number): void {
    const nk = this.n[a]!;
    this.n[a] = this.n[b]!;
    this.n[b] = nk;
    const kk = this.k[a]!;
    this.k[a] = this.k[b]!;
    this.k[b] = kk;
  }
}

function octile(x: number, y: number, gx: number, gy: number): number {
  const dx = Math.abs(x - gx);
  const dy = Math.abs(y - gy);
  return 10 * (dx + dy) + (14 - 20) * Math.min(dx, dy);
}

/** Tile-coordinate A*. Returns tile centers from the step after start through the goal. */
export function findPath(
  blocked: Uint8Array,
  mapW: number,
  mapH: number,
  sx: number,
  sy: number,
  gx: number,
  gy: number,
  maxNodes = 14000,
): { x: number; y: number }[] | null {
  if (sx === gx && sy === gy) return [];
  if (sx < 0 || sy < 0 || gx < 0 || gy < 0 || sx >= mapW || sy >= mapH || gx >= mapW || gy >= mapH) return null;
  const start = sy * mapW + sx;
  const goal = gy * mapW + gx;
  if (blocked[start] || blocked[goal]) return null;

  const size = mapW * mapH;
  const gScore = new Float64Array(size);
  gScore.fill(Number.POSITIVE_INFINITY);
  gScore[start] = 0;
  const came = new Int32Array(size);
  came.fill(-1);
  const closed = new Uint8Array(size);
  const open = new MinHeap();
  open.push(start, octile(sx, sy, gx, gy));

  let expanded = 0;
  while (open.length && expanded < maxNodes) {
    const cur = open.pop();
    if (cur < 0 || closed[cur]) continue;
    expanded++;
    if (cur === goal) {
      const cells: { x: number; y: number }[] = [];
      let c = goal;
      while (c !== start && c !== -1) {
        cells.push({ x: (c % mapW) + 0.5, y: ((c / mapW) | 0) + 0.5 });
        c = came[c]!;
      }
      cells.reverse();
      return cells;
    }
    closed[cur] = 1;
    const cx = cur % mapW;
    const cy = (cur / mapW) | 0;
    for (const [dx, dy, cost] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= mapW || ny >= mapH) continue;
      const ni = ny * mapW + nx;
      if (blocked[ni] || closed[ni]) continue;
      if (dx !== 0 && dy !== 0 && (blocked[cy * mapW + nx] || blocked[ny * mapW + cx])) continue;
      const ng = gScore[cur]! + cost;
      if (ng < gScore[ni]!) {
        gScore[ni] = ng;
        came[ni] = cur;
        open.push(ni, ng + octile(nx, ny, gx, gy));
      }
    }
  }
  return null;
}
