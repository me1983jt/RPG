// v15.10.6: Greenville on the world map (map 7 landing) and the castle at Dixville Notch (NW of the 3x home map), both behind Moosehead.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.argv[3] || "/workspace/maine-rpg/shots/v15106";
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 800, v14: true, safe: true });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
await begin(); await T("v14Set", { st: 5 });
await page.evaluate(() => { window.__controlsTest.choose?.("close"); window.__wmEnc = 1; });
const day = () => page.evaluate(() => { const c = window.__controlsTest; c.choose?.("close"); c.setHour(12); c.v13Weather("clear"); });
let c = await T("v15Spot", "castle");
ok(c && !c.open, "castle closed before Moosehead opens");
const inv = await page.evaluate(() => window.__controlsTest.v15State().inventory);
await page.evaluate((inv) => { const t = window.__controlsTest; t.v15Open("harmony"); return t.town143Msg({ type: "leaveTown", exit: "town", state: { questFlags: { "harmony.hasMooseheadMap": true, "harmony.ferry": "fixed" }, inventory: [...inv, { id: "moosehead_map", qty: 1 }] } }); }, inv);
await page.waitForTimeout(800);
c = await T("v15Spot", "castle");
ok(c && c.open && c.spot, `castle open with Moosehead, spot ${JSON.stringify(c?.spot && { x: c.spot.x >> 6, y: c.spot.y >> 6 })}`);
ok(c.spot && Math.hypot((c.spot.x >> 6) - 54, (c.spot.y >> 6) - 98) < 30, "castle spot is at the NW notch lot");
if (c.spot) {
  await page.evaluate(([x, y]) => { const t = window.__controlsTest; t.revealMap?.(); t.v15Tp(x - 300, y + 260); t.setZoom(1.2); }, [c.spot.x, c.spot.y]);
  await page.waitForTimeout(2500); await day(); await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/castle-spot-day.png` });
}
const o = await page.evaluate(() => window.__controlsTest.v15Open("castle"));
ok(/\/towns\/castle\//.test(o.town.src || JSON.stringify(o)), "castle opens its own town page");
await page.waitForTimeout(6000);
await page.screenshot({ path: `${out}/castle-town.png` });
const fr = page.frames().find((f) => /towns\/castle/.test(f.url()));
ok(!!fr, "castle iframe loaded");
await page.evaluate(() => window.__controlsTest.town143Msg({ type: "leaveTown", exit: "worldmap", state: window.__controlsTest.v15State() })); await page.waitForTimeout(1200);
ok(!(await page.evaluate(() => window.__controlsTest.v15Open && document.querySelector("iframe[src*='towns/castle']"))), "castle worldmap exit puts you back outside");
const g = await T("travelGo", "greenville");
ok(g.map === 7, `travel to Greenville landing (map ${g.map})`);
await page.waitForTimeout(1500);
const gs = await T("v15Spot", "greenville");
ok(gs && gs.open && gs.spot, "Greenville town entrance at the landing");
if (gs?.spot) {
  await page.evaluate(([x, y]) => { const t = window.__controlsTest; t.revealMap?.(); t.v15Tp(x + 30, y + 200); t.setZoom(1.6); }, [gs.spot.x, gs.spot.y]);
  await page.waitForTimeout(2500); await day(); await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/greenville-landing-day.png` });
}
const go = await page.evaluate(() => window.__controlsTest.v15Open("greenville"));
await page.waitForTimeout(4000);
ok(page.frames().some((f) => /towns\/greenville/.test(f.url())), "Greenville town game loads in the iframe");
await page.screenshot({ path: `${out}/greenville-town.png` });
ok(errs.filter((e) => !/favicon/.test(e)).length === 0, `no errors ${errs.slice(0, 3).join(" | ")}`);
console.log(fail ? `${fail} FAILED` : "ALL PASS");
await browser.close(); process.exit(fail ? 1 : 0);
