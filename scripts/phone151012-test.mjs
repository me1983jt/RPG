// v15.10.12: phone-landscape smoke: new game, run 20 s, save, reload + Continue, run 15 s; collect page errors.
import { chromium, devices } from "playwright";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await b.newContext({ ...devices["Pixel 7 landscape"] });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push("PAGEERR " + e.message + " @ " + (e.stack || "").split("\n")[1]));
page.on("console", (m) => { if (m.type() === "error") errs.push("console " + m.text().slice(0, 200)); });
page.on("crash", () => errs.push("PAGE CRASH"));
await page.addInitScript(() => { window.__v13Quiet = true; });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.fill("#wanderer-name", "Justin");
await page.getByRole("button", { name: /Hunter/ }).click(); await page.getByRole("button", { name: "Next" }).click();
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
await page.getByRole("button", { name: "Next" }).click(); await page.getByRole("button", { name: /Keen eye/ }).click();
await page.getByRole("button", { name: /Begin as/ }).click();
for (let i = 0; i < 10; i++) { await page.waitForTimeout(2000); await page.mouse.click(300 + i * 40, 200); }
await page.screenshot({ path: "/workspace/maine-rpg/shots/v151012/phone-newgame.png" });
console.log("phase", await page.evaluate(() => document.querySelector("[data-hud]") ? "hud" : "no-hud"));
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
const cont = page.getByRole("button", { name: /Continue/ }).first();
if (await cont.count()) { await cont.click(); for (let i = 0; i < 8; i++) { await page.waitForTimeout(2000); await page.mouse.click(500, 250); } }
else errs.push("no Continue button");
await page.screenshot({ path: "/workspace/maine-rpg/shots/v151012/phone-continue.png" });
console.log(JSON.stringify(errs.filter((e) => !/favicon/.test(e)).slice(0, 15), null, 1));
await b.close();
