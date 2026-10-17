// v13.5 real-size shots: farm (Justin by the tractor and the porch deck), Skowhegan, interiors, a road with vehicles,
// plus a walk-in check on every enterable building. Usage: node v135-shots.mjs <tag> [url]
import { boot } from "./v4-lib.mjs";
const tag = process.argv[2] || "after"; const url = process.argv[3] || "http://127.0.0.1:8112/";
const out = (n) => `/workspace/maine-rpg/beta28-shots/${tag}-${n}.png`;
const { browser, page, T, begin, errs } = await boot(url, { vw: 1280, vh: 800 });
await begin();
const wait = (ms) => page.waitForTimeout(ms);
const res = { tag, entered: {} };
await T("setHour", 11);
const fp = await T("farmProps");
const tr = fp.find((p) => p.kind === "tractor"), deck = fp.find((p) => p.kind === "post-porch");
res.tractor = tr; res.deck = deck;
// Justin between the tractor and the deck, a step in front
await T("setPos", (tr.x + deck.x) / 2 + 30, (tr.y + deck.y) / 2 + 40); await wait(1800);
await page.screenshot({ path: out("farm") });
await T("setZoom", 2); await wait(1200);
await page.screenshot({ path: out("farm-close"), clip: { x: 340, y: 160, width: 600, height: 420 } });
await T("setZoom", 1); await wait(400);
// a phone-sized view of the same spot
await page.setViewportSize({ width: 390, height: 844 }); await wait(1500);
await page.screenshot({ path: out("farm-phone") });
await page.setViewportSize({ width: 1280, height: 800 }); await wait(800);
// interiors
for (const kind of ["farmhouse", "barn"]) {
  await T("enterKind", kind);
  for (let i = 0; i < 60 && !(await T("insideInfo")); i++) await wait(100);
  await wait(800); await page.screenshot({ path: out(`inside-${kind}`) });
  await T("leave"); await wait(600);
}
// every walk-in building: walk to the door and go in
for (const kind of await T("walkInKinds")) {
  if (kind === "hatch") continue;
  const door = await T("doorOf", kind); if (!door) continue;
  await T("setPos", door.x + 40, door.y + 40); await wait(300);
  await T("enterKind", kind);
  for (let i = 0; i < 60 && !(await T("insideInfo")); i++) await wait(100);
  res.entered[kind] = !!(await T("insideInfo"));
  await T("leave"); await wait(500);
}
// road with vehicles
let v = []; for (let i = 0; i < 10; i++) { v = await T("vehicles"); if (v.length) break; await wait(400); }
const p0 = await T("getPos");
const near = v.slice().sort((a, b) => Math.hypot(a.x - p0.x, a.y - p0.y) - Math.hypot(b.x - p0.x, b.y - p0.y));
const tk = near.find((x) => x.kind === "car-truck") || near[0];
if (tk) { await T("setPos", tk.x + 160, tk.y + 30); await wait(1800); await page.screenshot({ path: out("road-vehicles") }); }
// Skowhegan
await T("setHour", 12); await T("v3Travel", 0); await wait(8000); await page.screenshot({ path: out("skowhegan") });
res.errs = errs.slice(0, 6);
console.log(JSON.stringify(res));
await browser.close();
