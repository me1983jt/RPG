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

/** Eight Diablo facings: down, down-left, left, up-left, up, up-right, right, down-right. */
export function facing8Screen(dsx: number, dsy: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const angle = Math.atan2(dsy, dsx);
  const n = Math.round((angle - Math.PI / 2) / (Math.PI / 4));
  return (((n % 8) + 8) % 8) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
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
