// v14: only moose and deer leave tracks (sparser, faster fade); timber wolves in packs, world-map wolf encounter.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860 });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
await begin();
await page.waitForTimeout(6000);
const tr = await T("v3Tracks");
ok(tr.every((t) => t.kind === "moose" || t.kind === "deer"), `only moose and deer leave tracks (${[...new Set(tr.map((t) => t.kind))].join(",") || "none yet"})`);
ok(tr.every((t) => t.n <= 5), "at most 5 prints per animal");
const src = await page.evaluate(async () => { const r = await fetch("/game/v2/wolf-walk.png"); return r.ok; });
ok(src, "wolf stand-in art at /game/v2/wolf-walk.png");
await page.evaluate(() => { window.__controlsTest.v14Set({ st: 5 }); window.__v14Skip = false; });
await page.evaluate(() => { window.__wmEnc = 0; window.__wmKind = "wildlife"; });
await T("wmOpen"); await T("wmGo", 6, 5);
for (let i = 0; i < 10; i++) { const w = await T("wm"); if (w.mapId === 9) break; await page.waitForTimeout(300); }
const wolves = await page.evaluate(() => window.__controlsTest.enemies ? window.__controlsTest.enemies().filter((e) => e.kind === "wolf" && !e.dead).length : -1);
ok(wolves >= 3 && wolves <= 5, `world-map wolf encounter brings a pack of 3-5 (${wolves})`);
await page.waitForTimeout(500); await page.screenshot({ path: "beta29-shots/v14-wolves.png" });
console.log(fail ? `${fail} FAILED` : "ALL PASS"); if (errs.length) console.log(errs.slice(0, 6).join("\n"));
await browser.close(); process.exit(fail ? 1 : 0);
