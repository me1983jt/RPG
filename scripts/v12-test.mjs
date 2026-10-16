// v12: gw14 art merge checks + screenshots
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.V12OUT || "/workspace/maine-rpg/beta22-shots/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 800 });
const R = {}; const fail = [];
const wait = (ms) => page.waitForTimeout(ms);
const check = (n, ok, info) => { R[n] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(n + " " + JSON.stringify(info ?? "").slice(0, 300)); };
const shot = (n) => page.screenshot({ path: out + n });
await begin();
await T("setZoom", 1.0);
for (let i = 0; i < 40 && !(await T("lazyDone")); i++) await wait(250);
const names = ["v2/holt-walk", "v2/jack-walk", "v2/mira-walk", "v2/nora-walk", "v2/sarah-walk", "v2/sarah-idle", "v2/cyndal-walk", "v2/loki-walk", "v2/cyndal-crouch", "v2/loki-carry", "v2/marcel-walk", "v2/marcel-talk",
  "v2/bandit-scout-walk", "v2/bandit-gray-walk", "v2/bandit-blue-walk", "v2/bandit-armor-walk", "v2/bandit-brute-walk", "v2/bandit-torch-walk",
  "v2/bandit-scout-walk-atk", "v2/bandit-scout-walk-dead", "v2/bandit-brute-walk-atk", "v2/bike-ride", "v2/bike-parked", "v2/hero-ride", "v2/tractor-drive", "v2/trees/pine2", "v2/trees/stump1", "v2/holt-gun-atk"];
const ok = await T("artLoaded", names);
names.forEach((n, i) => check(`loaded ${n}`, ok[i]));
check("cols bike-ride 6", (await T("artCols", "v2/bike-ride")) === 6);
check("cols hero-ride 6", (await T("artCols", "v2/hero-ride")) === 6);
check("cols tractor 4", (await T("artCols", "v2/tractor-drive")) === 4);
check("cols holt-walk 8", (await T("artCols", "v2/holt-walk")) === 8);
check("sarah new sheet", (await T("folkSheetOf", "sarah")) === "v2/sarah-walk");
check("cyndal new sheet", (await T("folkSheetOf", "cyndal")) === "v2/cyndal-walk");
// kids never posed as guards
const kidId = await T("guardPose", "cyndal");
check("no kid guard art loaded", !(await T("artLoaded", ["guard-cyndal", "guard-loki", "guard-watch-cyndal", "guard-watch-loki"])).some(Boolean));
const s = await T("npcOf", "sarah");
const cy = await T("npcOf", "cyndal"); await T("setZoom", 1.7); await T("setPos", (s.x + cy.x) / 2 + 40, (s.y + cy.y) / 2 + 60); await T("setHour", 11); await wait(1200);
await shot("01-farm-sarah-kids.png");
// Skowhegan: bandits + Marcel
await T("v3Travel", 2); await wait(1500);
for (let i = 0; i < 40 && !(await T("lazyDone")); i++) await wait(250);
const bs = await T("beastSheets");
check("bandits use gw14", bs.filter((b) => b.kind === "bandit").length > 0 && bs.filter((b) => b.kind === "bandit").every((b) => b.sheet.startsWith("v2/bandit-") || b.sheet.startsWith("boss-") || /raider-(jumper|shield|atv)/.test(b.sheet)), bs.map((b) => b.sheet));
const m = await T("npcOf", "marcel");
check("marcel in skowhegan", !!m && (await T("folkSheetOf", "marcel")) === "v2/marcel-walk", m);
if (m) {
  await T("setPos", m.x + 50, m.y + 50); await wait(300); await T("talk", "marcel"); await wait(400);
  const d = await T("dialogueNow");
  check("marcel trades", !!d && d.choices.some((c) => c.id === "q10-buy-shells"), d);
  await shot("02-skowhegan-marcel.png");
  await T("choose", "close"); await wait(200);
}
await T("v3Travel", 0); await wait(1500);
await T("setHour", 21); await T("startRaidNow"); await wait(3000);
const rs = (await T("beastSheets")).filter((b) => b.sheet.startsWith("v2/bandit-"));
check("raid bandits gw14", rs.length > 0, rs.length);
if (rs[0]) { await T("setZoom", 1.6); await T("setPos", rs[0].x - 150, rs[0].y + 120); await wait(700); await shot("03-raid-bandits-gw14.png"); }
check("no page errors", errs.length === 0, errs);
console.log(JSON.stringify(R, null, 0));
console.log(fail.length ? "FAILS:\n" + fail.join("\n") : "ALL PASS");
await browser.close();
