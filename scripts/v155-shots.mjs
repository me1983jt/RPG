// v15.5 terrain shots (412x915 phone): farm, road, wide (zoomed out) + a frame-time probe.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.V155OUT || "/workspace/maine-rpg/beta30-shots/v155-";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 915, v14: true });
const wait = (ms) => page.waitForTimeout(ms);
const shot = async (n) => { await wait(1500); await page.screenshot({ path: `${out}${n}.png` }); console.log("shot", n); };
const fps = () => page.evaluate(() => new Promise((res) => { let n = 0, worst = 0, last = performance.now(); const t0 = last; const f = (t) => { worst = Math.max(worst, t - last); last = t; if (++n < 120) requestAnimationFrame(f); else res({ avg: (t - t0) / n, worst }); }; requestAnimationFrame(f); }));
await begin(); await T("v14Set", { st: 5 });
await page.evaluate(() => { window.__controlsTest.choose?.("close"); });
const st = await T("v15Start");
await T("v15Tp", st.farm.x + 60, st.farm.y + 200); await shot("farm");
console.log("frame ms farm", JSON.stringify(await fps()));
const g = (await T("gatesFull"))[0];
await T("v15Tp", g.arriveTx * 64 + 32, g.arriveTy * 64 + 32); await shot("road");
console.log("frame ms road", JSON.stringify(await fps()));
console.log("errors", errs.length, errs.slice(0, 3));
await browser.close();
// wide view on a desktop-size window
{ const b2 = await boot(url, { vw: 1600, vh: 1000, v14: true }); await b2.begin(); await b2.T("v14Set", { st: 5 });
  await b2.page.evaluate(() => { window.__controlsTest.choose?.("close"); window.__controlsTest.setZoom?.(.6); });
  const s2 = await b2.T("v15Start"); await b2.T("v15Tp", s2.farm.x + 300, s2.farm.y + 500);
  await b2.page.waitForTimeout(2000); await b2.page.screenshot({ path: `${out}wide.png` }); console.log("shot wide");
  console.log("errors2", b2.errs.length); await b2.browser.close(); }
