// v15.10.11: spawn each kind of the Hollowed (walker, bloated, runner, elite) and check names/hp, no page errors.
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const page = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
await page.addInitScript(() => { window.__v13Quiet = true; window.__v14Skip = true; });
await page.goto("http://127.0.0.1:8112/", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.fill("#wanderer-name", "Justin");
await page.getByRole("button", { name: /Hunter/ }).click(); await page.getByRole("button", { name: "Next" }).click();
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
await page.getByRole("button", { name: "Next" }).click(); await page.getByRole("button", { name: /Keen eye/ }).click();
await page.getByRole("button", { name: /Begin as/ }).click(); await page.waitForTimeout(3000);
for (const k of ["walker", "bloated", "runner", "elite"]) await page.evaluate((k) => window.__controlsTest.l141Hollow(1, 400, 0, k), k);
await page.waitForTimeout(2000);
console.log(JSON.stringify(await page.evaluate(() => window.__controlsTest.l141Enemies().filter((e) => e.hollow).map((e) => [e.name, e.hp]))), errs.slice(0, 3));
await b.close();
