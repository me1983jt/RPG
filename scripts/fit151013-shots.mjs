// v15.10.13: landscape full-screen fit at phone and tablet sizes (HUD inside the screen, canvas fills it).
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
for (const [n, w, h, dsf] of [["phone-small", 740, 360, 3], ["phone", 915, 412, 2.6], ["tablet", 1280, 800, 2]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36" })).newPage();
  await page.addInitScript(() => { window.__v13Quiet = true; window.__v14Skip = true; });
  await page.goto("http://127.0.0.1:8112/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
  await page.fill("#wanderer-name", "Justin");
  await page.getByRole("button", { name: /Hunter/ }).click(); await page.getByRole("button", { name: "Next" }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
  await page.getByRole("button", { name: "Next" }).click(); await page.getByRole("button", { name: /Keen eye/ }).click();
  await page.getByRole("button", { name: /Begin as/ }).click(); await page.waitForTimeout(4000);
  await page.evaluate(() => { const c = window.__controlsTest; c.choose?.("close"); c.setHour(12); }); await page.waitForTimeout(1500);
  const r = await page.evaluate(() => { const c = document.querySelector("canvas"); const out = []; for (const el of document.querySelectorAll("[data-hud], button")) { const q = el.getBoundingClientRect(); if (q.width && (q.bottom > innerHeight + 1 || q.right > innerWidth + 1)) out.push((el.textContent || el.getAttribute("aria-label") || "").slice(0, 20)); } const cr = c.getBoundingClientRect(); return { canvas: [cr.width, cr.height], view: [innerWidth, innerHeight], offscreen: out.slice(0, 8) }; });
  console.log(n, JSON.stringify(r));
  await page.screenshot({ path: `/workspace/maine-rpg/shots/v151012/fit-${n}.png` });
}
await b.close();
