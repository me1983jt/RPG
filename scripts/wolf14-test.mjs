// v14: only moose and deer leave tracks (sparser, faster fade); timber wolves in packs, world-map wolf encounter.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860 });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
await begin();
await page.waitForTimeout(6000);
const tr = (await T("v3Tracks")).filter((t) => t.n > 0);
ok(tr.every((t) => t.kind === "moose" || t.kind === "deer" || t.kind === "wolf"), `only moose, deer and wolves leave tracks (${[...new Set(tr.map((t) => t.kind))].join(",") || "none yet"})`);
ok(tr.every((t) => t.n <= (t.kind === "wolf" ? 3 : 5)), "at most 5 prints for deer/moose, 3 for wolves");
const src = await page.evaluate(async () => (await fetch("/game/v2/wolf-walk.png")).ok && (await fetch("/game/v2/tracks/wolf-left.png")).ok);
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
