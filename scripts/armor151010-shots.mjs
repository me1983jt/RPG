// v15.10.10: Justin wearing scrap plate + scrap helm (+ pack frame, boots) in several facings; and the warden vest.
import { chromium } from "playwright";
const out = process.argv[2] || "/workspace/maine-rpg/shots/v151010";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const page = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 })).newPage();
await page.addInitScript(() => { window.__v13Quiet = true; window.__v14Skip = true; window.__safeOff = true; });
await page.goto("http://127.0.0.1:8112/", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.fill("#wanderer-name", "Justin");
await page.getByRole("button", { name: /Hunter/ }).click(); await page.getByRole("button", { name: "Next" }).click();
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
await page.getByRole("button", { name: "Next" }).click(); await page.getByRole("button", { name: /Keen eye/ }).click();
await page.getByRole("button", { name: /Begin as/ }).click(); await page.waitForTimeout(3500);
await page.mouse.click(640, 300); await page.waitForTimeout(400);
const T = (f, ...a) => page.evaluate(([f, a]) => window.__controlsTest[f](...a), [f, a]);
await page.evaluate(() => { const c = window.__controlsTest; c.choose?.("close"); c.setHour(12); c.v13Weather?.("clear"); });
const ps = await T("props1510", "campfire"); await T("v15Tp", ps[0].x + 420, ps[0].y + 520); await T("setZoom", 2.6);
const sets = { plate: { coatId: "plate", headId: "scraphelm", backId: "packframe", feetId: "boots" }, warden: { coatId: "warden", headId: "huntcap", backId: null, feetId: "steeltoes" } };
for (const [k, f] of Object.entries(sets)) for (const d of k === "plate" ? [0, 2, 4, 6] : [1, 5]) {
  const layers = await T("wear1510", f, d); await page.waitForTimeout(1400);
  console.log(k, d, JSON.stringify(layers));
  await page.screenshot({ path: `${out}/armor-${k}-dir${d}.png`, clip: { x: 490, y: 0, width: 300, height: 440 } });
}
await b.close();
