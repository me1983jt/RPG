// v15.10.4/5: HUD shots: daytime world map with the full HUD (desktop) and phone landscape.
import { chromium } from "playwright";
const dir = process.argv[2] || "/workspace/maine-rpg/shots/hud";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
for (const [name, vw, vh, dsf, mobile] of [["hud-v15106-day", 1280, 800, 1.5, false], ["hud-v15106-phone", 844, 390, 3, true]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: dsf, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__v13Quiet = true; window.__v14Skip = true; });
  await page.goto("http://127.0.0.1:8112/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
  await page.fill("#wanderer-name", "Justin");
  await page.getByRole("button", { name: /Hunter/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Keen eye/ }).click();
  await page.getByRole("button", { name: /Begin as/ }).click();
  await page.waitForTimeout(3500);
  const day = () => page.evaluate(() => { const c = window.__controlsTest; c.choose?.("close"); c.setHour(12); c.v13Weather("clear"); });
  await day();
  // make sure the full (expanded) HUD shows
  for (const k of ["quest", "health", "mini"]) { const b = page.locator(`[data-hud-min="${k}"]`).first(); if (await b.count() && /^(Show|Expand)/.test(await b.getAttribute("aria-label") || "")) await b.click(); }
  await page.evaluate(() => window.__controlsTest.setZoom(2.2));
  await page.waitForTimeout(2500); await day(); await page.waitForTimeout(800);
  await page.screenshot({ path: `${dir}/${name}.png` });
  await ctx.close();
}
await browser.close();
