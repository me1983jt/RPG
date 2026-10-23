// v15.6: same spot at several camera ISO_Y values (?isoy=), 1280x800.
import { boot } from "./v4-lib.mjs";
const base = process.argv[2] || "http://127.0.0.1:8112/";
for (const k of (process.env.ISOYS || "0.5,0.42,0.38,0.34").split(",")) {
  const { browser, page, T, begin, errs } = await boot(`${base}?isoy=${k}`, { vw: 1000, vh: 700, v14: true });
  await begin(); await T("v14Set", { st: 5 });
  await page.evaluate(() => { window.__controlsTest.choose?.("close"); window.__controlsTest.setZoom?.(.8); });
  const st = await T("v15Start"); await T("v15Tp", st.farm.x + 160, st.farm.y + 260);
  await page.waitForTimeout(2200); await page.screenshot({ path: `/tmp/angle-${k}.png` }); console.log("angle", k, "errors", errs.length);
  await browser.close();
}
