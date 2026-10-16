import { createRequire } from "node:module";
import { existsSync } from "node:fs";
const require = createRequire(existsSync("/workspace/maine-rpg/run/node_modules/playwright") ? "/workspace/maine-rpg/run/package.json" : "/workspace/maine-rpg/v11/package.json");
const { chromium } = require("playwright");
export async function boot(url, { role = "Hunter", vw = 1280, vh = 800, clear = true, live = false } = {}) {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const page = await ctx.newPage();
  // v13: older suites run with the random v13 systems (weather, needs, sickness, foraging, road events) held still.
  if (!live) await page.addInitScript(() => { window.__v13Quiet = true; });
  const errs = [];
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") errs.push(m.type() + ": " + m.text()); });
  page.on("pageerror", e => errs.push("pageerror: " + e.message));
  page.on("response", r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()}: ${r.url()}`); });
  const T = (fn, ...a) => page.evaluate(([f, a]) => window.__controlsTest[f](...a), [fn, a]);
  await page.goto(url, { waitUntil: "networkidle" });
  if (clear) { await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); }
  await page.waitForTimeout(2500);
  const begin = async () => {
    await page.fill("#wanderer-name", "Justin");
    await page.getByRole("button", { name: new RegExp(role) }).click();
    await page.getByRole("button", { name: "Next" }).click();
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: /Keen eye/ }).click();
    await page.getByRole("button", { name: /Begin as/ }).click();
    await page.waitForTimeout(3000);
  };
  return { browser, page, errs, T, begin };
}
