// v15.7: close-up of feet/contact (hero, NPCs, a raider, a vehicle) at the current camera, 1000x700.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.FEETOUT || "/tmp/feet-after.png";
const { browser, page, T, begin, errs } = await boot(url, { vw: 1000, vh: 700, v14: true });
await begin(); await T("v14Set", { st: 5 }); await T("setHour", 11);
await page.evaluate(() => { window.__controlsTest.choose?.("close"); window.__controlsTest.setZoom?.(1.7); });
const st = await T("v15Start"); await T("v15Tp", st.farm.x + 120, st.farm.y + 220);
await T("v15Spawn", 120, -40);
await page.waitForTimeout(2500);
await page.screenshot({ path: out, clip: { x: 200, y: 150, width: 600, height: 420 } });
console.log("feet shot", out, "errors", errs.length); await browser.close();
