// v15.9.7: the world is one fixed, hand-made central-Maine map. New games all get the same layout; a save from the
// random-world days (its own seed, exits and removed-prop ids, standing where the lake now is) loads into the fixed map.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 720, v14: true });
await begin();
const a = await T("mapInfo");
ok(a.seed === 5402695 && JSON.stringify(a.exits) === "[0,1,2,3,5]", `new game uses the fixed map (seed ${a.seed}, exits ${a.exits})`);
const start = await T("v15Start");
ok(!!start.harmony, "Harmony's town spot exists on the fixed map");
await page.evaluate(() => window.__controlsTest.save()); await page.waitForTimeout(500);
// make it an old random-world save: other seed and exits, no layout tag, junk removed/slain ids, standing in Great Moose Lake
const lake = { x: (95 + .5) * 64, y: (64 + .5) * 64 };
await page.addInitScript((lake) => { for (const k of Object.keys(localStorage)) { try { const d = JSON.parse(localStorage.getItem(k)); if (!d || typeof d !== "object" || d.seed == null) continue; d.seed = 123456789; d.exits = [1, 4]; delete d.layout; d.removed = [1, 2, 3, 4, 5]; d.slain = [1, 2]; d.x = lake.x; d.y = lake.y; localStorage.setItem(k, JSON.stringify(d)); } catch {} } }, lake);
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.getByTestId("continue-btn").click(); await page.waitForTimeout(3000);
const b = await T("mapInfo");
ok(b.seed === 5402695 && JSON.stringify(b.exits) === "[0,1,2,3,5]", `old save loads into the fixed map (seed ${b.seed}, exits ${b.exits})`);
const s = await T("v15Start");
ok(Math.hypot(s.x - lake.x, s.y - lake.y) > 64, `hero moved out of the lake to dry ground (${Math.round(s.x)},${Math.round(s.y)})`);
ok(s.harmony && Math.abs(s.harmony.x - start.harmony.x) < 1 && Math.abs(s.harmony.y - start.harmony.y) < 1, "Harmony sits in the same place as in a new game");
ok(!errs.length, `no errors ${errs.slice(0, 2).join(" | ")}`);
console.log(fail ? `${fail} FAILED` : "ALL PASS");
await browser.close(); process.exit(fail ? 1 : 0);
