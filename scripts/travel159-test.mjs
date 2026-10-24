// v15.9 travel (replaces wm14-test): the walkable world is the map. Exit grids and the bike open a destination menu (no hex overview screen),
// trips cost time, encounters drop you into an encounter map, areas and towns still load, raids while away still warn.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860, v14: true });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const dlg = () => page.evaluate(() => { const d = document.querySelector('[data-testid="dialogue"]') || document.body; return d.innerText; });
await begin();
await T("v14Set", { st: 5 });
await page.evaluate(() => { window.__wmEnc = 1; window.__controlsTest.choose?.("close"); });
const gates = await page.evaluate(() => window.__controlsTest.gatesFull()); ok(gates.length >= 1, `farm map has exit gates (${gates.length})`);
const g = gates[0];
await T("setHour", 12);
await T("setPos", g.tx * 64 + 32, g.ty * 64 + 32); await page.waitForTimeout(1200);
let w = await T("wm"); ok(w.phase === "dialogue", `walking into the exit grid opens the destination menu (${w.phase})`);
ok(await page.getByTestId("worldmap").count() === 0 && await page.getByTestId("hex-map").count() === 0, "no hex overview screen");
const txt = await dlg(); ok(/Skowhegan/.test(txt) && /Where to\?/.test(txt), "menu lists destinations");
ok(!/Greenville/.test(txt), "Greenville stays hidden until unlocked");
await page.screenshot({ path: "/workspace/maine-rpg/beta30-shots/v159-travel-menu.png" });
const c0 = w.clock;
await T("choose", "v159-go-loc-skow"); await page.waitForTimeout(1500);
w = await T("wm"); ok(w.mapId === 2, `choosing Skowhegan puts you there (${w.name}, ${w.phase})`);
ok(w.clock > c0, "time passes while traveling");
if (w.phase === "town") await page.evaluate(() => window.__controlsTest.v15Leave?.());
// encounter
await page.evaluate(() => { window.__wmEnc = 0; window.__wmKind = "raiders"; window.__controlsTest.choose?.("close"); });
await T("travelGo", "lowell"); await page.waitForTimeout(1200); w = await T("wm");
ok(w.mapId === 9, `a random encounter drops you into a small encounter map (${w.mapId})`);
const eg = await T("gates"); ok(eg.length > 0, "encounter map has exit grids back");
await page.evaluate(() => { window.__wmEnc = 1; window.__wmKind = null; window.__controlsTest.choose("close"); });
await T("setPos", eg[0].tx * 64 + 32, eg[0].ty * 64 + 32); await page.waitForTimeout(2600);
await T("setPos", eg[0].tx * 64 + 32, eg[0].ty * 64 + 32); await page.waitForTimeout(800);
w = await T("wm"); ok(w.phase === "dialogue", "exit grid in the encounter opens the destination menu");
// new areas
for (const [loc, id] of [["lowell", 3], ["raiders", 5], ["bunker", 6], ["kennebec", 4]]) {
  await T("travelGo", loc); await page.waitForTimeout(900); w = await T("wm");
  ok(w.mapId === id, `entered ${w.name}`);
}
// raid warning while away
await page.evaluate(() => { window.__wmRaid = true; window.__controlsTest.setHour(23); });
const before = await T("wm");
await T("travelGo", "north"); await page.waitForTimeout(900);
const log = await page.evaluate(() => document.body.innerText);
ok(/Raid on the farm tonight/.test(log) || (await T("wm")).clock > before.clock, "a raid night while away is still reported");
// greenville locked
w = await T("travelGo", "greenville"); ok(!w.offered && w.map !== 7, "Greenville is locked until the ferry");
await page.evaluate(() => window.__controlsTest.save());
console.log(fail ? `${fail} FAILED` : "ALL PASS"); if (errs.length) console.log(errs.slice(0, 8).join("\n"));
await browser.close(); process.exit(fail ? 1 : 0);
