// v14 world map: exit grids, hex travel with time and fog, entering areas, encounters, raid warning, save.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860, v14: true });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
await begin();
await T("v14Set", { st: 5 });
await page.evaluate(() => { localStorage.setItem("maine-rpg-hud", JSON.stringify({ quest: true, health: true, aim: true })); });
const gates = await page.evaluate(() => window.__controlsTest.gatesFull()); ok(gates.length >= 1, `farm map has exit gates (${gates.length})`);
const g = gates[0];
for (const k of ["quest", "health", "aim"]) await page.locator(`[data-hud-min="${k}"]`).first().click();
await T("setHour", 12);
const ga = await page.evaluate(() => 0);
await T("setPos", g.tx * 64 + 32 + (g.arriveTx - g.tx) * 64 * 2.5, g.ty * 64 + 32 + (g.arriveTy - g.ty) * 64 * 2.5); await page.waitForTimeout(900);
await page.screenshot({ path: "beta29-shots/v14-wm-01-exit-grid.png" });
await T("setPos", g.tx * 64 + 32, g.ty * 64 + 32); await page.waitForTimeout(900);
let w = await T("wm"); ok(w.phase === "worldmap", "walking into the exit grid opens the world map");
ok(await page.getByTestId("hex-map").isVisible(), "hex map is drawn");
const c0 = w.clock, fog0 = w.map.fog.length;
await T("wmGo", 8, 7);
w = await T("wm"); ok(w.map.path.length > 0, "tapping Skowhegan plots a hex path");
await page.waitForTimeout(500);
await page.screenshot({ path: "beta29-shots/v14-wm-02-hex-map.png" });
await page.evaluate(() => { window.__wmEnc = 1; });
for (let i = 0; i < 40; i++) { w = await T("wm"); if (!w.map.path.length) break; await page.waitForTimeout(300); }
ok(w.map.q === 8 && w.map.r === 7, "marker walks hex by hex to Skowhegan");
ok(w.clock > c0, "time passes while traveling");
ok(w.map.fog.length > fog0, "fog lifts along the way");
await T("wmGo", 8, 7); await page.waitForTimeout(800);
w = await T("wm"); ok(w.phase === "play" && w.mapId === 2, `entering puts you in Skowhegan (${w.name})`);
// encounter
await T("wmOpen"); await page.evaluate(() => { window.__wmEnc = 0; window.__wmKind = "raiders"; });
await T("wmGo", 7, 7); for (let i = 0; i < 10; i++) { w = await T("wm"); if (w.phase !== "worldmap") break; await page.waitForTimeout(300); }
ok(w.mapId === 9 && w.phase !== "worldmap", "a random encounter drops you into a small encounter map");
const eg = await T("gates"); ok(eg.length > 0, "encounter map has exit grids back");
await page.waitForTimeout(400); await page.screenshot({ path: "beta29-shots/v14-wm-03-encounter.png" });
await page.evaluate(() => { window.__wmEnc = 1; window.__wmKind = null; window.__controlsTest.choose("close"); });
await T("setPos", eg[0].tx * 64 + 32, eg[0].ty * 64 + 32); await page.waitForTimeout(2600);
await T("setPos", eg[0].tx * 64 + 32, eg[0].ty * 64 + 32); await page.waitForTimeout(800);
w = await T("wm"); ok(w.phase === "worldmap", "exit grid in the encounter goes back to the world map");
// new areas
for (const [q, r, id] of [[2, 4, 3], [10, 3, 5], [3, 7, 6], [7, 5, 4]]) {
  await T("wmGo", q, r); for (let i = 0; i < 40; i++) { w = await T("wm"); if (!w.map.path.length) break; await page.waitForTimeout(300); }
  await T("wmGo", q, r); await page.waitForTimeout(800); w = await T("wm");
  ok(w.mapId === id, `entered ${w.name}`);
  await T("wmOpen");
}
// raid warning while away
await page.evaluate(() => { window.__wmRaid = true; window.__controlsTest.setHour(23); });
await T("wmGo", 4, 4); for (let i = 0; i < 30; i++) { w = await T("wm"); if (!w.map.path.length) break; await page.waitForTimeout(300); }
ok(await page.getByTestId("wm-warn").count() === 1, "raid on the farm while away shows a warning on the world map");
await page.screenshot({ path: "beta29-shots/v14-wm-04-raid-warning.png" });
await page.evaluate(() => window.__controlsTest.save());
console.log(fail ? `${fail} FAILED` : "ALL PASS"); if (errs.length) console.log(errs.slice(0, 8).join("\n"));
await browser.close(); process.exit(fail ? 1 : 0);
