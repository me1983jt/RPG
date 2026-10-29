import { chromium, devices } from "playwright";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const page = await (await b.newContext({ ...devices["Pixel 7 landscape"] })).newPage();
await page.addInitScript(() => { window.__v13Quiet = true; });
await page.goto(process.argv[2], { waitUntil: "networkidle" }); await page.waitForTimeout(3000);
if (process.argv[3] === "game") { await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
  await page.fill("#wanderer-name", "Justin"); await page.getByRole("button", { name: /Hunter/ }).click(); await page.getByRole("button", { name: "Next" }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
  await page.getByRole("button", { name: "Next" }).click(); await page.getByRole("button", { name: /Keen eye/ }).click();
  await page.getByRole("button", { name: /Begin as/ }).click(); await page.waitForTimeout(12000); }
const r = await page.evaluate(async () => {
  const cvs = [...document.querySelectorAll("canvas")].map((c) => c.width + "x" + c.height);
  const urls = performance.getEntriesByType("resource").map((e) => e.name).filter((u) => /\.(png|jpg|webp)/.test(u));
  let px = 0; const big = [];
  for (const u of urls) { const im = new Image(); im.src = u; try { await im.decode(); } catch { continue; } const p = im.naturalWidth * im.naturalHeight; px += p; big.push([p, u.split("/game/")[1] || u]); }
  big.sort((a, b) => b[0] - a[0]);
  return { n: urls.length, mb: Math.round(px * 4 / 1048576), top: big.slice(0, 12).map(([p, u]) => `${Math.round(p * 4 / 1048576)}MB ${u}`), cvs, heap: Math.round(performance.memory.usedJSHeapSize / 1048576) };
});
console.log(JSON.stringify(r, null, 1)); await b.close();
