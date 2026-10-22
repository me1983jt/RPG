import { boot } from "./v4-lib.mjs";
const out = process.argv[2];
const { browser, page, T, begin } = await boot("http://127.0.0.1:8112/", { vw: 1280, vh: 900 });
await begin();
await page.evaluate(() => { const c = window.__controlsTest; c.choose?.("close"); c.setZoom?.(0.45); });
await page.waitForTimeout(1500);
await page.screenshot({ path: out });
await browser.close();
