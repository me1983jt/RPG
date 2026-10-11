// v5 visual checks: hero walking in 8 directions, hero swing, deaths (raider, wolf, hero), tractor charge,
// farmhouse interior. usage: node v5-shots.mjs <url> <outdir> [vw vh]
import { boot } from "./v4-lib.mjs";
const [url, out, vw = "915", vh = "412"] = process.argv.slice(2);
const { browser, page, errs, T, begin } = await boot(url, { vw: +vw, vh: +vh });
await begin(); await T("revealMap"); await T("setHp", 9999); await T("setHour", 12);
const house = await T("propOf", "farmhouse");
const door = await T("doorOf", "farmhouse");
const base = (await T("openArea", door.x + 260, door.y + 260, 45)) || { x: door.x + 260, y: door.y + 260 };
await T("setZoom", 2.2);
// clear the area so the close-ups show just the hero
const allE = await T("enemies");
const keep = new Set();
for (const e of allE) if (!e.dead && !e.quest && Math.hypot(e.x - base.x, e.y - base.y) < 1400) keep.add(e.id);
await T("clearNear", base.x, base.y, 1400);
const W = +vw, H = +vh;
async function heroClip(name, size = 200, at = null) {
  const p = at || await T("getPos"); const s = await T("screenOf", p.x, p.y);
  const x = Math.max(0, Math.min(W - size, s.sx - size / 2)), y = Math.max(0, Math.min(H - size, s.sy - size * .72));
  await page.screenshot({ path: `${out}/${name}.png`, clip: { x, y, width: size, height: size } });
}
// screen directions -> world steps (2:1 iso: screen down = +x +y, screen right = +x -y)
const dirs = { S: [1, 1], SW: [0, 1.4], W: [-1, 1], NW: [-1.4, 0], N: [-1, -1], NE: [0, -1.4], E: [1, -1], SE: [1.4, 0] };
const facing = {};
async function walkDir(d, ms = 420) {
  const [dx, dy] = dirs[d];
  await T("setPos", base.x, base.y); await page.waitForTimeout(150);
  await T("walkStraight", base.x + dx * 220, base.y + dy * 220); await page.waitForTimeout(ms);
}
for (const d of Object.keys(dirs)) {
  await walkDir(d);
  await heroClip(`walk-${d}-a`); await page.waitForTimeout(110); await heroClip(`walk-${d}-b`);
  facing[d] = (await T("dbgDir"));
}
await page.screenshot({ path: `${out}/walk-context.png` });
// swing facing the camera (front strip) and facing west (lunge fallback)
await T("setPos", base.x, base.y);
for (const d of ["S", "W"]) {
  await walkDir(d, 200); { const p = await T("getPos"); await T("walkTo", p.x, p.y); } await page.waitForTimeout(350);
  await T("swingNow");
  for (let i = 0; i < 4; i++) { await heroClip(`swing-${d}-${i}`); await page.waitForTimeout(100); }
}
// deaths: a raider and a wolf next to the hero
const pool = (await T("enemies")).filter(e => !e.quest && !e.variant && (!e.dead || keep.has(e.id)));
const raider = pool.find(e => e.kind !== "rabbit" && e.kind !== "squirrel" && !["wolf", "coyote", "moose", "deer"].includes(e.kind));
const wolf = pool.find(e => e.kind === "wolf") || pool.find(e => e.kind === "coyote");
const res = { raider: raider?.kind, wolf: wolf?.kind, facing };
for (const [tag, e, kind] of [["raider", raider, raider?.kind], ["wolf", wolf, wolf?.kind]]) {
  if (!e) continue;
  const spot = tag === "raider" ? { x: base.x + 30, y: base.y - 30 } : { x: base.x - 30, y: base.y + 30 };
  await T("setPos", spot.x, spot.y); await T("walkTo", spot.x, spot.y);
  await T("beastAt", e.id, kind, spot.x - 70, spot.y + 70); await page.waitForTimeout(350);
  await T("strike", e.id, 9999);
  const mid = { x: spot.x - 35, y: spot.y + 35 };
  for (let i = 0; i < 5; i++) { await heroClip(`death-${tag}-${i}`, 260, mid); await page.waitForTimeout(240); }
}
// hero death fall
await T("setPos", base.x + 300, base.y + 300); await page.waitForTimeout(300);
await T("die");
for (let i = 0; i < 4; i++) { await heroClip(`death-hero-${i}`, 220); await page.waitForTimeout(230); }
res.phaseAfterDie = (await T("dbg")).phase;
await page.getByRole("button", { name: "Wake" }).click(); await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/after-die.png` });
res.phaseAfterRespawn = (await T("dbg")).phase;
// tractor charge at night
await T("setHp", 9999);
const tc = await T("tractorGo");
if (tc) {
  await T("setHour", 23); await T("setZoom", 1.6); await T("setPos", tc.x + 70, tc.y + 70); await T("setZoom", 1.3); await page.waitForTimeout(500);
  await T("tractorGo");
  for (let i = 0; i < 3; i++) { await page.waitForTimeout(450); await page.screenshot({ path: `${out}/tractor-${i}.png` }); }
}
// night on the farm (glows) and at dawn
await T("setZoom", 1.2); await T("setPos", door.x + 120, door.y + 140);
for (const h of [21, 2, 6]) { await T("setHour", h); await page.waitForTimeout(700); await page.screenshot({ path: `${out}/night-${h}h.png` }); }
await T("setHour", 12);
res.errors = errs;
console.log(JSON.stringify(res));
await browser.close();
