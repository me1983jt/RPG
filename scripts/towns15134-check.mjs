import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
for (const t of ["harmony","pittsfield","skowhegan","greenville","castle"]) {
  const page = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage();
  const bad = [], shared = []; page.on("response", (r) => { if (r.status() >= 400) bad.push(r.status() + " " + r.url()); if (r.url().includes("_shared")) shared.push(r.url()); });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(`http://127.0.0.1:8112/towns/${t}/index.html`, { waitUntil: "networkidle" }); await page.waitForTimeout(3000);
  await page.mouse.click(400, 200); await page.waitForTimeout(1500);
  await page.screenshot({ path: `/tmp/town-${t}.png` });
  console.log(t, "404s", bad.length, bad.slice(0, 3), "shared loaded", shared.length, "errs", errs.slice(0, 2));
}
await b.close();
