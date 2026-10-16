import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8111/";
const out = process.env.HEROOUT || "/workspace/maine-rpg/beta17-shots/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 800 });
const R = {}; const fail = [];
const wait = (ms) => page.waitForTimeout(ms);
const check = (n, ok, info) => { R[n] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(n + " " + JSON.stringify(info ?? "").slice(0, 400)); };
const take = async (ms) => { await T("heroLogTake"); await wait(ms); return await T("heroLogTake"); };
const sum = (l) => { const m = {}; for (const e of l) { const k = e.name; m[k] = m[k] || { frames: new Set(), dirs: new Set(), bad: 0, cols: e.cols }; m[k].frames.add(e.frame % (e.cols || 4)); m[k].dirs.add(e.dir); if (!e.ok) m[k].bad++; } return Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { frames: [...v.frames].sort(), dirs: [...v.dirs].sort(), bad: v.bad, cols: v.cols }])); };
await begin();
await T("heroLogStart"); await T("setZoom", 1.6);
const sheets = await page.evaluate(async () => { const out = {}; for (const n of ["hero", "hero-gun", "hero-gun-atk", "hero-hit", "hero-down", "v2/hero-idle", "v2/hero-axe", "v2/hero-death"]) { const r = await fetch(`/game/${n}.png`); out[n] = r.status; } return out; });
check("sheets-200", Object.values(sheets).every((s) => s === 200), sheets);
// v13: the player body draws through pl/<action> (v2/player-* art, else Justin's sheets dyed).
// idle
let l = sum(await take(1500)); check("idle-uses-v2-idle", l["pl/idle"] && l["pl/idle"].frames.length === 4 && !l["pl/idle"].bad, l);
await page.screenshot({ path: out + "01-idle.png" });
// walk 8 dirs
const p0 = await T("getPos"); const dirs = new Set(); let walkFrames = new Set(); let walkBad = 0;
const vec = [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]];
for (const [sx, sy] of vec) {
  const wx = sy + sx / 2, wy = sy - sx / 2; // screen dir -> world
  const p = await T("getPos"); await T("walkStraight", p.x + wx * 300, p.y + wy * 300);
  const s = sum(await take(900)); const h = s["pl/walk"]; if (h) { h.dirs.forEach((d) => dirs.add(d)); h.frames.forEach((f) => walkFrames.add(f)); walkBad += h.bad; }
  if (sx === 1 && sy === 0) await page.screenshot({ path: out + "02-walk-east.png" });
  await T("setPos", p0.x, p0.y); await wait(200);
}
check("walk-8-dirs", dirs.size === 8 && walkFrames.size === 8 && walkBad === 0, { dirs: [...dirs], frames: [...walkFrames], walkBad });
// gun
await T("giveItem", "carbine", 1); await T("invEquip", "carbine", "main"); await wait(200);
await T("swingNow"); l = sum(await take(450));
check("gun-shot", !!(l["pl/gun-atk"] || l["pl/gun"]) && !(l["pl/gun-atk"]?.bad), l);
for (let i = 0; i < 4; i++) { await T("swingNow"); await wait(100); }
await page.screenshot({ path: out + "03-rifle-shot.png" });
// axe
await T("giveItem", "hatchet", 1); await T("invUnequip", "main"); await T("invEquip", "hatchet", "main"); await wait(200); 
await T("swingNow"); l = sum(await take(500)); check("axe-swing-v2", l["pl/axe"] && l["pl/axe"].cols === 6 && l["pl/axe"].frames.length >= 4, l);
// hit
await T("hurtNow"); l = sum(await take(250)); check("hit", !!l["pl/hit"] && l["pl/hit"].cols === 3, l);
// die
await T("die"); l = sum(await take(1300)); check("death-v2", l["pl/death"] && l["pl/death"].frames.includes(5) && l["pl/death"].cols === 6, l);
await page.screenshot({ path: out + "04-death.png" });
check("no-console-errors", errs.length === 0, errs);
console.log(JSON.stringify({ ...R, fail, errs }, null, 1));
await browser.close();
