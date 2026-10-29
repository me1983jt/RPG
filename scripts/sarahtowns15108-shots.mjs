// v15.10.8: Quest's playable-Sarah towns: the new-game pick, Harmony as Sarah (raccoon), Pittsfield as Justin; story.player handed over.
import { chromium } from "playwright";
const out = process.argv[2] || "/workspace/maine-rpg/shots/v15108";
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
for (const hero of ["sarah", "justin"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__v13Quiet = true; window.__v14Skip = true; window.__safeOff = true; });
  await page.goto("http://127.0.0.1:8112/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
  await page.getByTestId(`hero-${hero}`).click();
  if (hero === "sarah") await page.screenshot({ path: `${out}/title-pick-sarah.png` });
  await page.getByRole("button", { name: /Hunter/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Keen eye/ }).click();
  await page.getByRole("button", { name: /Begin as/ }).click();
  await page.waitForTimeout(3500);
  const town = hero === "sarah" ? "harmony" : "pittsfield";
  const msg = await page.evaluate((t) => { const c = window.__controlsTest; c.choose?.("close"); c.setHour(12); return c.v15Open(t).msg; }, town);
  ok(msg?.state?.questFlags?.["story.player"] === hero, `${town}: story.player = ${msg?.state?.questFlags?.["story.player"]}`);
  ok(hero !== "sarah" || msg.state.companions.some((c) => c.id === "raccoon" && c.withYou), "raccoon companion sent with Sarah");
  await page.waitForTimeout(6000);
  const fr = page.frames().find((f) => f.url().includes(`/towns/${town}/`));
  ok(!!fr, `${town} iframe loaded`);
  // pick the first class in the town's own first-visit picker, then let the scene settle
  if (fr) { const b = fr.locator("[data-c]").first(); if (await b.count()) await b.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(2500);
    for (let i = 0; i < 3; i++) { await page.mouse.click(640, 400); await page.waitForTimeout(700); } }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${town}-as-${hero}.png` });
  await ctx.close();
}
await browser.close(); console.log(fail ? `${fail} FAILED` : "ALL PASS"); process.exit(fail ? 1 : 0);
