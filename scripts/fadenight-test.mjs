import { boot } from "/workspace/maine-rpg/v11/scripts/v4-lib.mjs";
const { browser, page, T, begin } = await boot("http://127.0.0.1:8112/", { vw: 412, vh: 915, v14: true });
await begin(); await T("v14Set", { st: 5 }); await page.evaluate(() => window.__controlsTest.choose?.("close"));
await T("setSnow", 4); await T("setHour", 22); await T("startRaidNow");
const st = await T("v15Start");
const trees = (await T("propsNear", st.farm.x, st.farm.y, 1500)).filter((p) => /tree/.test(p.kind));
let ok = 0; // v15.9: trees fade over the hero at night during a raid too
for (const t of trees.slice(0, 6)) { await T("setPos", t.x - 30, t.y - 30); await page.waitForTimeout(900); const f = (await T("propsNear", t.x, t.y, 3))[0]?.fade; console.log(t.kind, f?.toFixed(2)); if (f > .5) ok++; }
await page.screenshot({ path: "/tmp/fadenight.png" }); console.log(ok >= 5 ? "ALL PASS" : "FAIL"); console.log("faded", ok, "of", Math.min(6, trees.length), JSON.stringify(await T("raidState")));
await browser.close(); process.exit(ok >= 5 ? 0 : 1);
