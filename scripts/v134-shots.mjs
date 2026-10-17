// v13.4 screenshots: farm by day, dusk with a lantern, Skowhegan, a raid. Usage: node v134-shots.mjs <tag> [url]
import { boot } from "./v4-lib.mjs";
const tag = process.argv[2] || "after"; const url = process.argv[3] || "http://127.0.0.1:8112/";
const out = (n) => `/workspace/maine-rpg/beta27-shots/${tag}-${n}.png`;
const { browser, page, T, begin, errs } = await boot(url, { vw: 1280, vh: 800 });
await begin();
const wait = (ms) => page.waitForTimeout(ms);
await T("setHour", 11); await wait(1500); await page.screenshot({ path: out("farm-day") });
await T("giveItem", "lantern", 1); await T("setHour", 19.6); await wait(1500); await page.screenshot({ path: out("dusk-lantern") });
await T("setHour", 12); await T("v3Travel", 0); await wait(3500); await page.screenshot({ path: out("skowhegan") });
await T("v3Travel", 1); await wait(3500);
await T("setHour", 21.5); await T("startRaidNow"); await wait(500);
for (let i = 0; i < 40; i++) { const r = await T("raidState"); if (r && r.phase === "wave" && (await T("enemies")).filter((e) => !e.dead && e.kind === "bandit").length >= 2) break; await T("addTime", 2); await wait(400); }
const foes = (await T("enemies")).filter((e) => !e.dead && e.kind === "bandit");
if (foes[0]) { await T("setPos", foes[0].x + 120, foes[0].y + 60); }
await wait(900); await page.screenshot({ path: out("raid") });
console.log(JSON.stringify({ tag, foes: foes.length, errs: errs.slice(0, 5) }));
await browser.close();
