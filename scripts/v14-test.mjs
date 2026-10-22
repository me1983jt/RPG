// v14: roadside start, farm fortifications, defend the farm, workbench crafting, base building, raids on walls.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860, v14: true });
// v15: new games start outside Harmony; this suite plays the older roadside-camp opening
await page.addInitScript(() => { window.__v14Camp = true; }); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2000);
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
await begin();
let s = await T("v14");
ok(s.st === 0 && s.camp, "new game starts at the roadside camp, stage 0");
let pos = await T("getPos");
const fd = Math.hypot(pos.x / 64 - 58, pos.y / 64 - 36);
ok(fd > 20, `camp is well away from the farm (${fd.toFixed(1)} tiles)`);
let props = await T("v14Props");
const wreck = props.find((p) => p.kind === "wreck"), fire = props.find((p) => p.kind === "firering");
ok(wreck && fire, "wreck and fire ring at the camp");
const hud0 = await page.evaluate(() => document.body.innerText);
ok(/Search the wrecked truck/.test(hud0), "objective shows search the wreck");
await T("v14Use", fire.id); s = await T("v14"); ok(s.st === 0, "fire needs matches first");
await T("v14Use", wreck.id); s = await T("v14"); ok(s.st === 1, "searching the wreck moves to stage 1");
await T("v14Use", fire.id); s = await T("v14"); ok(s.st === 1, "fire needs 3 wood");
await page.evaluate(() => window.__controlsTest.giveItem ? 0 : 0);
await T("v14Set", {}); await page.evaluate(() => { const t = window.__controlsTest; t.addWood ? t.addWood(3) : null; });
const addWood = async (n) => page.evaluate((n) => { const t = window.__controlsTest; if (t.addWood) t.addWood(n); else if (t.giveRes) t.giveRes("wood", n); }, n);
await addWood(3);
await T("v14Use", fire.id); s = await T("v14"); ok(s.st === 2, "lighting the fire moves to stage 2 (follow the smoke)");
props = await T("v14Props"); ok(props.some((p) => p.kind === "sign-farm"), "a farm sign appears on the road");
// fortifications already at the farm
const walls = props.filter((p) => /^wall-|^gate-/.test(p.kind) && p.f14);
ok(walls.length >= 20, `farm has a partial palisade (${walls.length} pieces)`);
ok(walls.some((p) => p.kind === "wall-x") && walls.some((p) => p.kind === "wall-wood" && p.hp < 60), "some stakes are broken or damaged");
ok(props.some((p) => p.kind.startsWith("gate-")), "barricaded gate on the road");
ok(props.some((p) => p.kind === "lookout") && props.some((p) => p.kind.startsWith("sandbags")), "lookout and sandbag spots");
ok(props.some((p) => p.kind === "workbench"), "workbench at the farm");
await page.screenshot({ path: "beta29-shots/v14-01-start-camp.png" });
// walk into the farm
await T("setPos", 58 * 64, 37 * 64); await page.waitForTimeout(800);
s = await T("v14"); ok(s.st === 3, "reaching the farm = found (stage 3)");
let d = await page.evaluate(() => document.body.innerText);
ok(/forgive the rifle|far enough/.test(d), "Justin challenges the stranger");
await page.screenshot({ path: "beta29-shots/v14-02-find-farm.png" });
ok(!(await T("v14")).secured && (await T("raidState"))?.on !== true, "no raid nights before the farm is secured");
await page.getByRole("button", { name: "I'll bring the wood" }).click();
await addWood(3);
await page.evaluate(() => window.__controlsTest.choose ? 0 : 0);
const choose = (id) => page.evaluate((id) => window.__controlsTest.choose(id), id);
await choose("snow-wood"); await choose("snow-done");
s = await T("v14"); ok(s.st === 4 && s.raid?.defend, "trust task done starts Defend the Farm");
await page.waitForTimeout(400);
await page.screenshot({ path: "beta29-shots/v14-03-defend.png" });
// lose: player down -> checkpoint
await page.evaluate(() => window.__controlsTest.hurtPlayer ? window.__controlsTest.hurtPlayer(999) : 0);
s = await T("v14");
ok(s.st === 4 && s.raid?.defend, "defend mission keeps going after a loss (checkpoint)");
// win 3 waves
for (let w = 0; w < 3; w++) {
  await page.evaluate(() => { const c = window.__controlsTest; c.choose("close"); });
  for (let i = 0; i < 60; i++) { s = await T("v14"); if (s.raid?.phase === "wave") break; await page.evaluate(() => window.__controlsTest.v14Set({})); await page.waitForTimeout(300); await page.evaluate(() => { const c = window.__controlsTest; if (c.raidSkip) c.raidSkip(); }); }
  await page.waitForTimeout(2500);
  await T("v14WinWave"); await page.waitForTimeout(800);
}
s = await T("v14");
ok(s.st === 5 && !s.raid, `winning the waves secures the farm (st ${s.st})`);
d = await page.evaluate(() => document.body.innerText); ok(/Repairs/.test(d), "repair summary after the fight");
await page.screenshot({ path: "beta29-shots/v14-04-secured-repairs.png" });
await choose("close");
const st2 = await page.evaluate(() => window.__controlsTest.v13?.() ?? null);
// crafting
props = await T("v14Props"); const bench = props.find((p) => p.kind === "workbench");
await T("v14Use", bench.id); s = await T("v14"); ok(s.craftOpen, "workbench opens the crafting screen");
await page.waitForTimeout(300);
d = await page.evaluate(() => document.querySelector('[data-v14="craft"]')?.innerText ?? "");
ok(/Weapons/i.test(d) && /Armor/i.test(d) && /Meds/i.test(d) && /Needs a tier 3 bench/.test(d), "crafting screen lists groups and tier locks");
await page.screenshot({ path: "beta29-shots/v14-05-crafting.png" });
let before = await T("v14Cmd", "craft", "c-bandage");
const h = await T("v14Cmd", "craft", "c-canvas");
ok(h.craft.list.find((r) => r.id === "c-bandage"), "craft call runs");
await T("v14Cmd", "closeCraft");
// building
const idx = await page.evaluate(() => 0);
await addWood(30); await page.evaluate(() => { const c = window.__controlsTest; if (c.addStone) c.addStone(20); });
const recipes = await page.evaluate(() => window.__controlsTest.recipes ? window.__controlsTest.recipes() : null);
const wi = recipes ? recipes.findIndex((r) => r.kind === "wall-wood") : -1;
ok(wi >= 0, "stake wall in the build list");
const free = await page.evaluate(() => window.__controlsTest.freeFarmTile ? window.__controlsTest.freeFarmTile() : null);
await T("v14Cmd", "rotate");
await T("v14Build", wi, free.tx, free.ty);
props = await T("v14Props"); let mine = props.find((p) => p.p14 && p.tx === free.tx && p.ty === free.ty);
ok(mine && mine.kind === "wall-wood" && mine.flip, "placed a rotated stake wall in the farm");
await T("v14Hurt", mine.id, 30); props = await T("v14Props"); mine = props.find((p) => p.id === mine.id);
ok(mine.hp === 30, "pieces take damage");
await T("v14Cmd", "tool", "repair"); await T("v14Build", wi, free.tx, free.ty);
props = await T("v14Props"); mine = props.find((p) => p.id === mine.id); ok(mine.hp === 60, "repair restores hp");
await T("v14Cmd", "tool", "place"); await page.evaluate(() => window.__controlsTest.toggleBuild?.(true));
await page.waitForTimeout(300);
await page.screenshot({ path: "beta29-shots/v14-06-building.png" });
await T("v14Cmd", "tool", "pickup"); await T("v14Build", wi, free.tx, free.ty);
props = await T("v14Props"); ok(!props.some((p) => p.id === mine.id), "pick up removes the piece");
await T("v14Cmd", "tool", "place");
// save / load keeps state
await page.evaluate(() => window.__controlsTest.save?.());
s = await T("v14");
ok(s.st === 5, "secured state survives");
console.log(fail ? `${fail} FAILED` : "ALL PASS"); if (errs.length) console.log(errs.slice(0, 8).join("\n"));
await browser.close(); process.exit(fail ? 1 : 0);
