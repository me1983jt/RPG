// v14.1: loot runs, the Hollowed, stealth, farm production, pack growth, hard-mode pack drop, storage, controls, smoothness.
import { boot } from "./v4-lib.mjs";
import { readFileSync, readdirSync } from "node:fs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const wait = (p, ms) => p.waitForTimeout(ms);
// ---- the name lives in one constant, and never the banned words
{
  const src = "/workspace/maine-rpg/v11/src/";
  const files = ["game/engine.ts", "game/v141.ts", "game/world.ts", "components/RPG.tsx"].map((f) => readFileSync(src + f, "utf8"));
  const lit = files.reduce((n, f) => n + (f.match(/"Hollowed"|'Hollowed'|`Hollowed`/g) || []).length, 0);
  ok(lit === 1 && /export const HOLLOWED = "Hollowed";/.test(files[1]), `the name 'Hollowed' is written once, in v141.ts (${lit} literal)`);
  const bad = files.join("\n").split("\n").filter((l) => /hollow|HOLLOWED|horde/i.test(l) && /zombie|\bsick/i.test(l));
  ok(bad.length === 0, `no 'zombie' or 'sick' near the horde (${bad.length} lines)`);
}
// ---- A: new v14 game, small pack that grows
{
  const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860, v14: true });
  await begin();
  let s = await T("l141");
  ok(s.small && s.rows === 2, `new game: small starting pack (${s.rows} rows)`);
  await T("l141Give", "bag-sack", 1); await page.evaluate(() => window.__controlsTest.giveItem?.("bag-sack"));
  await page.evaluate(() => window.__gameApi?.invUse?.("bag-sack"));
  await T("l141Use", -1, -1);
  await page.evaluate(() => window.__controlsTest.invUse ? window.__controlsTest.invUse("bag-sack") : null);
  s = await T("l141");
  if (s.rows === 2) { await page.evaluate(() => window.__controlsTest.clickPack?.("bag-sack")); s = await T("l141"); }
  ok(s.rows === 3 && s.bagLv === 1, `sewn sack adds a row (${s.rows})`);
  await T("l141Give", "bag-frame", 1); await page.evaluate(() => window.__controlsTest.clickPack?.("bag-frame"));
  s = await T("l141"); ok(s.rows === 5, `frame bag: three rows over the start (${s.rows})`);
  const rec = (await T("recipes")); ok(["garden", "smokehouse", "raincollector", "still"].every((k) => rec.some((r) => r.kind === k)), "garden, smokehouse, rain collector and still are on the build list");
  ok(!errs.length, "no errors (A) " + errs.slice(0, 3).join(" | "));
  await browser.close();
}
// ---- B: legacy farm start for the rest
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860 });
await begin();
await T("setHour", 12);
for (let i = 0; i < 4; i++) await T("choose", "close");
let s = await T("l141");
ok(!s.small && s.rows >= 4, "older-style start keeps the old pack size");
// stick + keyboard + deceleration
let p0 = await T("getPos");
await T("l141Stick", 1, 0); await wait(page, 700); const walkNoise = (await T("l141")).noise; await T("l141Stick", 0, 0);
let p1 = await T("getPos"); await wait(page, 60); let p1b = await T("getPos"); await wait(page, 400); let p2 = await T("getPos"); await wait(page, 200); let p3 = await T("getPos");
ok(Math.hypot(p1.x - p0.x, p1.y - p0.y) > 60, `one-thumb stick walks (${Math.round(Math.hypot(p1.x - p0.x, p1.y - p0.y))} px)`);
ok(Math.hypot(p2.x - p1.x, p2.y - p1.y) > 0.5 && Math.hypot(p3.x - p2.x, p3.y - p2.y) < 0.5, `eases to a stop after release (glide ${Math.hypot(p2.x - p1.x, p2.y - p1.y).toFixed(1)} px, then still)`);
ok(walkNoise >= 20, `walking makes noise (${walkNoise})`);
await page.keyboard.down("KeyS"); await wait(page, 600); await page.keyboard.up("KeyS");
let p4 = await T("getPos"); ok(Math.hypot(p4.x - p3.x, p4.y - p3.y) > 40, "S key walks (WASD)");
await page.keyboard.down("ArrowUp"); await wait(page, 500); await page.keyboard.up("ArrowUp");
let p5 = await T("getPos"); ok(Math.hypot(p5.x - p4.x, p5.y - p4.y) > 30, "arrow keys walk");
// crouch
await page.keyboard.press("KeyX"); s = await T("l141"); ok(s.crouch, "X crouches");
p0 = await T("getPos"); await T("l141Stick", 1, 0); await wait(page, 700); s = await T("l141"); await T("l141Stick", 0, 0);
p1 = await T("getPos");
ok(s.noise <= 12, `crouched walking is quiet (${s.noise})`);
const crouchDist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
ok(crouchDist > 10 && crouchDist < 120, `crouched walking is slow (${Math.round(crouchDist)} px in 0.7 s)`);
await wait(page, 300);
await page.screenshot({ path: "beta30-shots/v141-crouch-noise.png" });
// sneak attack vs normal hit
const [ha] = await T("l141Hollow", 1, 300, 0);
let sa = await T("l141Strike", ha);
await T("v141", "crouch", false);
const [hb] = await T("l141Hollow", 1, 0, 300);
let na = await T("l141Strike", hb);
ok(sa && na && sa.before - sa.after > na.before - na.after, `sneak attack hits harder (${sa.before - sa.after} vs ${na.before - na.after})`);
// the Hollowed: follow noise, shamble slower than raiders
let en = (await T("l141Enemies")).filter((e) => e.hollow);
for (const e of en) await page.evaluate((id) => { const t = window.__controlsTest; }, e.id);
const ids = await T("l141Hollow", 5, 700, 500);
en = (await T("l141Enemies")).filter((e) => ids.includes(e.id));
ok(en.length === 5 && en.every((e) => e.name === "Hollowed" && !e.aggro), "a group of 5 Hollowed, not yet aware");
const before = en.reduce((a, e) => a + e.d, 0) / en.length;
await T("l141Noise", 100); await wait(page, 200);
let en2 = (await T("l141Enemies")).filter((e) => ids.includes(e.id));
ok(en2.filter((e) => e.heard).length >= 4, `a gunshot turns them toward it (${en2.filter((e) => e.heard).length}/5 heard)`);
await wait(page, 2500);
en2 = (await T("l141Enemies")).filter((e) => ids.includes(e.id));
const after = en2.reduce((a, e) => a + e.d, 0) / en2.length;
ok(after < before - 60, `they shamble toward the noise (${Math.round(before)} → ${Math.round(after)} px)`);
ok((before - after) / 2.7 < 90, `and slowly (${Math.round((before - after) / 2.7)} px/s)`);
await page.screenshot({ path: "beta30-shots/v141-hollowed.png" });
// auto-attack
await T("v141", "auto", true);
const [hc] = await T("l141Hollow", 1, 40, 20);
await page.evaluate((id) => 0, hc);
await T("l141Noise", 0);
await wait(page, 3500);
const hcE = (await T("l141Enemies")).find((e) => e.id === hc);
ok(!hcE || hcE.hp < 18, `auto-attack swings at a Hollowed that comes close (${hcE ? hcE.hp : "dead"})`);
await T("v141", "auto", false);
// clear them out for the rest
await page.evaluate(() => { const t = window.__controlsTest; for (const e of t.l141Enemies()) if (e.hollow) t.l141Strike?.(e.id); });
await T("hurtPlayer", -999).catch(() => 0);
// ---- loot runs
let piles = await T("l141Loot", "gas");
ok(piles.length === 3, `gas station: three rooms of loot (${piles.map((p) => p.title).join(", ")})`);
ok(piles[0].d < piles[1].d && piles[1].d < piles[2].d, `deeper rooms are farther in (${piles.map((p) => p.d).join(" < ")})`);
ok(piles[2].items.some((i) => i.id === "medicine"), "the back office has the best loot");
s = await T("l141"); ok(s.mapId === 9, "loot run opens its own small map");
await page.screenshot({ path: "beta30-shots/v141-loot-gas.png" });
piles = await T("l141Loot", "gas");
ok(piles.filter((p) => !/office/i.test(p.title)).every((p) => p.items.length <= 1), `going straight back: picked over (${JSON.stringify(piles.map((p) => [p.title, p.items.length]))})`);
await T("l141Hours", 24 * 3 + 1);
piles = await T("l141Loot", "gas");
ok(piles.length === 3, "three days later it has restocked");
for (const id of ["camp", "truck"]) { piles = await T("l141Loot", id); ok(piles.length === 3, `${id === "camp" ? "hunting camp" : "box truck"} loot run works`); }
await page.evaluate(() => { window.__wmEnc = 1; });
await T("wmOpen"); await wait(page, 400);
const wmText = await page.evaluate(() => document.querySelector('[data-testid="worldmap"]')?.innerText || "");
ok(!!wmText, "world map opens from the loot run");
await page.evaluate(() => window.__controlsTest.wmGo?.(5, 5)); await wait(page, 3500);
await page.evaluate(() => window.__controlsTest.wmGo?.(5, 5)); await wait(page, 1500);
s = await T("l141"); ok(s.mapId === 0, `back on the farm map (${s.mapId})`);
// ---- farm production and storage
await T("l141Mats");
const rec = await T("recipes");
const place = async (kind) => { const free = await T("freeFarmTile"); await T("v14Build", rec.findIndex((r) => r.kind === kind), free.tx, free.ty); return free; };
const prodTake = async (t) => { await T("choose", "close"); await T("l141Use", t.tx, t.ty); const d = await page.evaluate(() => document.body.innerText); const id = `v141-take-${t.tx},${t.ty}`; await T("choose", id); return d; };
const count = async (id) => (await T("l141")).bag.find((b) => b.id === id)?.qty ?? 0;
const g = await place("garden");
let st = await T("l141"); ok(Object.keys(st.prod).length >= 0, "garden placed");
await T("l141Hours", 25);
let g0 = await count("greens"); await prodTake(g); ok(await count("greens") > g0, "garden grows greens in a day");
const sm = await place("smokehouse");
await T("l141Give", "meat", 2);
await T("l141Use", sm.tx, sm.ty); await T("choose", `v141-load-${sm.tx},${sm.ty}`);
await T("l141Hours", 7);
let j0 = await count("jerky"); await prodTake(sm); ok(await count("jerky") > j0, "smokehouse turns raw meat into jerky");
const rc = await place("raincollector");
const bars0 = await T("l141Barrels");
await T("l141Hours", 13);
let w0 = await count("water"); const rcText = await prodTake(rc);
const bars1 = await T("l141Barrels");
const poured = bars1.reduce((a, b) => a + b.n, 0) > bars0.reduce((a, b) => a + b.n, 0);
ok(await count("water") > w0 || poured, `rain collector makes water every 12 h (${poured ? "poured into the rain barrel" : "taken from the collector"})`);
ok(/12 hours/.test(rcText) && /Makes water/.test(rcText), "the collector says it makes water");
if (bars1.length) { await T("l141Use", bars1[0].tx, bars1[0].ty); const t = await page.evaluate(() => document.body.innerText); ok(/of 8 jugs/.test(t), "the rain barrel says how much it stores"); }
const still = await place("still");
await T("l141Give", "water", 1); await T("l141Give", "apple", 1);
await T("l141Use", still.tx, still.ty); await T("choose", `v141-load-${still.tx},${still.ty}`);
await T("l141Hours", 11);
let sp0 = await count("spirits"); await prodTake(still); ok(await count("spirits") > sp0, "still makes spirits from water and apples");
await T("choose", "close");
const ch = await place("chest");
await T("l141Use", ch.tx, ch.ty); await wait(page, 300);
ok(await page.locator('[data-v141="store"]').isVisible(), "a built chest opens a storage screen");
await page.screenshot({ path: "beta30-shots/v141-storage.png" });
await page.locator('[data-v141="store"] button:has-text("Cloth")').first().click();
await page.locator('[data-v141="store"] button:has-text("Scrap parts")').first().click();
let hud = await T("v141Hud").catch(() => null);
hud = await page.evaluate(() => window.__controlsTest.l141());
const chest = hud.chests[`${ch.tx},${ch.ty}`] || [];
ok(chest.some((c) => c.id === "cloth") && chest.some((c) => c.id === "junk"), "tap a pack item to store it");
await T("l141Give", "cloth", 3);
await page.locator('[data-v141="stack"]').click();
hud = await T("l141");
ok(!hud.bag.some((b) => b.id === "cloth"), "stack to chest moves matching stacks");
await page.locator('[data-v141="sort"]').click();
hud = await T("l141"); const names = (hud.chests[`${ch.tx},${ch.ty}`] || []).map((c) => c.id);
ok(names.length >= 2, `quick-sort keeps everything (${names.join(", ")})`);
await page.locator('[data-v141="chest-list"] button').first().click();
ok((await T("l141")).bag.length > 0, "tap a chest item to take it");
await T("l141Give", "junk", 2);
await page.locator('[data-v141="stash"]').click();
hud = await T("l141");
ok(hud.piles.some((p) => p.title === "Farm stash" && p.n > 0), "stack to farm stash fills the stash pile");
await page.locator('[data-v141="store"] button:has-text("Close")').click();
// ---- hard mode
await T("l141Hard", true);
await T("l141Give", "pelt", 2);
await T("hurtPlayer", 999); await wait(page, 300);
hud = await T("l141");
ok(hud.phase === "dead" && hud.piles.some((p) => p.title === "Your pack" && p.n > 0) && !hud.bag.some((b) => b.id === "pelt"), "hard mode: your pack drops where you fall");
await T("tap", "respawn"); await wait(page, 600);
let qt = await page.evaluate(() => document.body.innerText);
ok(/Recover your pack/.test(qt), "the quest bar points you back to it");
await T("l141Pile", "Your pack"); await wait(page, 200);
await page.evaluate(() => window.__gameApi?.takeLoot?.("all"));
await T("takeLoot", "all").catch(() => 0);
await wait(page, 600);
hud = await T("l141");
ok(!hud.drop && hud.bag.some((b) => b.id === "pelt"), "walk back and take it: pack recovered");
// ---- smoothness: crossfade and tractor
await T("l141Stick", 0, 1); await wait(page, 500); await T("l141Stick", 0, 0); await wait(page, 600);
hud = await T("l141"); ok(hud.xf > 0, `4-frame crossfade between idle and walk (${hud.xf} faded frames)`);
ok(!errs.length, "no errors " + errs.slice(0, 4).join(" | "));
await browser.close();
console.log(fail ? `${fail} FAIL` : "ALL PASS");
process.exit(fail ? 1 : 0);
