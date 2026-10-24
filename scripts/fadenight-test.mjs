// v15.9: trees fade over the hero at night during a raid too. v15.9.2: url from argv/TEST_URL/PORT; sample after the
// fade has settled (1.6 s) and only real trees (no bushes/scrub, which are too short to cover the hero).
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 8112}/`;
const { browser, page, T, begin, errs } = await boot(url, { vw: 412, vh: 915, v14: true });
await begin(); await T("v14Set", { st: 5 }); await page.evaluate(() => window.__controlsTest.choose?.("close"));
await T("setSnow", 4); await T("setHour", 22); await T("startRaidNow");
const st = await T("v15Start");
const trees = (await T("propsNear", st.farm.x, st.farm.y, 1500)).filter((p) => /^tree-/.test(p.kind) && !/scrub|bush/.test(p.kind));
let ok = 0; const n = Math.min(6, trees.length);
for (const t of trees.slice(0, n)) { await T("setPos", t.x - 30, t.y - 30); await page.waitForTimeout(1600); const f = (await T("propsNear", t.x, t.y, 3))[0]?.fade; console.log(t.kind, f?.toFixed(2)); if (f > .5) ok++; }
const pass = n >= 4 && ok >= n - 1 && !errs.length;
console.log(pass ? "ALL PASS" : "FAIL"); console.log("faded", ok, "of", n, JSON.stringify(await T("raidState")), errs.slice(0, 2));
await browser.close(); process.exit(pass ? 0 : 1);
