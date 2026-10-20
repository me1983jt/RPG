/** Isometric 2:1 projection. Screen axes are player-visible. */

export function screenDirToWorld(dsx: number, dsy: number): { vx: number; vy: number } {
  return { vx: dsy + dsx / 2, vy: dsy - dsx / 2 };
}

export function worldVelToScreen(vx: number, vy: number): { dsx: number; dsy: number } {
  return { dsx: vx - vy, dsy: (vx + vy) / 2 };
}

export function worldToScreen(x: number, y: number, camX: number, camY: number): { sx: number; sy: number } {
  return { sx: x - y - camX, sy: (x + y) / 2 - camY };
}

export function screenToWorld(sx: number, sy: number, camX: number, camY: number): { x: number; y: number } {
  const X = sx + camX;
  const Y = sy + camY;
  return { x: Y + X / 2, y: Y - X / 2 };
}

/** Facing rows on the four-direction sheets: 0 down, 1 left, 2 right, 3 up. */
export function facingFromWorld(vx: number, vy: number): 0 | 1 | 2 | 3 {
  const { dsx, dsy } = worldVelToScreen(vx, vy);
  if (Math.abs(dsx) > Math.abs(dsy)) return dsx >= 0 ? 2 : 1;
  return dsy >= 0 ? 0 : 3;
}

/** Facing indices stay in the old 8-way space (0 down, 1 down-left, 2 left, 3 up-left, 4 up, 5 up-right, 6 right,
 * 7 down-right) so 8-row sheets keep working. v14.1 characters use the 6 Fallout hex facings NE, E, SE, SW, W, NW
 * (5, 6, 7, 1, 2, 3); a pure N or S move snaps to the neighbouring diagonal on the side of the last facing. */
export const HEX_FACINGS = [5, 6, 7, 1, 2, 3] as const;
let lastHex: number = 1;
function snapHex(dsx: number, dsy: number, cur?: number | null): 1 | 2 | 3 | 5 | 6 | 7 {
  const prev = cur != null && cur !== 0 && cur !== 4 ? cur : lastHex;
  if (Math.abs(dsx) < 1e-6 && Math.abs(dsy) < 1e-6) return prev as 1 | 2 | 3 | 5 | 6 | 7;
  const n = (((Math.round((Math.atan2(dsy, dsx) - Math.PI / 2) / (Math.PI / 4)) % 8) + 8) % 8);
  const right = prev >= 5;
  const d = n === 0 ? (right ? 7 : 1) : n === 4 ? (right ? 5 : 3) : n;
  lastHex = d;
  return d as 1 | 2 | 3 | 5 | 6 | 7;
}
export function facing8Screen(dsx: number, dsy: number, cur?: number | null): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  return snapHex(dsx, dsy, cur);
}
/** Sheet row for a facing. 6-row sheets: NE, E, SE, SW, W, NW. 8-row sheets: their own row. 4-row diagonal
 * sheets (SW, NW, NE, SE): E and W take the nearest diagonal. */
export function facingRow(dir: number, rows: number, kind?: string | boolean): number {
  if (rows === 6) return ({ 5: 0, 6: 1, 7: 2, 1: 3, 2: 4, 3: 5, 0: 3, 4: 0 } as Record<number, number>)[dir] ?? 3;
  if (rows === 4 && kind) return ({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 3, 7: 3, 0: 0 } as Record<number, number>)[dir] ?? 0;
  return dir % rows;
}

export function facing8(vx: number, vy: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const { dsx, dsy } = worldVelToScreen(vx, vy);
  return facing8Screen(dsx, dsy);
}

export function assertIso(): void {
  const right = worldVelToScreen(screenDirToWorld(1, 0).vx, screenDirToWorld(1, 0).vy);
  const left = worldVelToScreen(screenDirToWorld(-1, 0).vx, screenDirToWorld(-1, 0).vy);
  const up = worldVelToScreen(screenDirToWorld(0, -1).vx, screenDirToWorld(0, -1).vy);
  const down = worldVelToScreen(screenDirToWorld(0, 1).vx, screenDirToWorld(0, 1).vy);
  if (right.dsx < 0.99 || Math.abs(right.dsy) > 0.02) throw new Error("D is not screen-right");
  if (left.dsx > -0.99 || Math.abs(left.dsy) > 0.02) throw new Error("A is not screen-left");
  if (up.dsy > -0.99 || Math.abs(up.dsx) > 0.02) throw new Error("W is not screen-up");
  if (down.dsy < 0.99 || Math.abs(down.dsx) > 0.02) throw new Error("S is not screen-down");
}

/** v14: 8-way facing with hysteresis. Keeps the current facing until the heading is clearly past the sector edge, so diagonals don't flicker. */
export function facing8Hys(cur: number, vx: number, vy: number, slack = 0.18): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const { dsx, dsy } = worldVelToScreen(vx, vy);
  const next = snapHex(dsx, dsy, cur);
  if (cur == null || cur === next || cur === 0 || cur === 4) return next;
  // hysteresis around the diagonal boundaries (the screen axes)
  const angle = Math.atan2(dsy, dsx) - Math.PI / 2;
  const center = cur * (Math.PI / 4);
  let d = Math.abs(angle - center) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d < Math.PI / 8 + slack ? (cur as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7) : next;
}
