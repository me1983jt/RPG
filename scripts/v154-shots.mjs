// v15.4 phone-size shots (412x915): farm, road, combat, house door entry.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.V154OUT || "/workspace/maine-rpg/beta30-shots/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 915, v14: true });
const wait = (ms) => page.waitForTimeout(ms);
const shot = async (n) => { await wait(900); await page.screenshot({ path: `${out}v154-${n}.png` }); console.log("shot", n); };
await begin(); await T("v14Set", { st: 5 });
await page.evaluate(() => { window.__controlsTest.choose?.("close"); });
const st = await T("v15Start");
await T("v15Tp", st.farm.x + 60, st.farm.y + 200); await shot("farm");
const g = (await T("gatesFull"))[0];
await T("v15Tp", g.arriveTx * 64 + 32, g.arriveTy * 64 + 32); await shot("road");
await T("v15Tp", st.farm.x - 900, st.farm.y + 900);
await T("v15Spawn", 170, 30); await T("v15Spawn", 110, -120);
await page.evaluate(() => window.__controlsTest.tb15Force?.(true));
await wait(1500); await shot("combat");
await T("tb15Kill");
await T("v15Tp", st.farm.x, st.farm.y);
await page.evaluate(() => window.__controlsTest.enterKind("farmhouse"));
for (let i = 0; i < 40; i++) { const d = await T("dbg"); if (d.phase !== "play" || d.inside) break; await wait(150); }
await page.screenshot({ path: `${out}v154-door.png` }); console.log("shot door (opening)");
await wait(1500); await page.screenshot({ path: `${out}v154-door-inside.png` });
console.log("errors", errs.length, errs.slice(0, 3));
await browser.close();
