import { boot } from "./v4-lib.mjs";
const { browser, page, T, begin } = await boot("http://127.0.0.1:8112/", { vw: 1280, vh: 800, safe: true });
await begin(); await T("v14Set", { st: 5 }); await page.evaluate(() => window.__controlsTest.choose?.("close"));
await T("v13Act", 6);
await T("v15Open", "grokwoods"); await page.waitForTimeout(5000);
const fr = page.frames().find((f) => f.url().includes("/towns/"));
try { await fr.getByText("Woodsman").click(); await page.waitForTimeout(1500); for (let i = 0; i < 3; i++) { const b = fr.getByRole("button").filter({ hasText: /Begin|Start|Go|Continue|OK/i }).first(); if (await b.count()) { await b.click(); await page.waitForTimeout(1200); } } } catch (e) { console.log("town click", e.message); }
await page.waitForTimeout(2500);
await page.screenshot({ path: "beta30-shots/v15-town-grokwoods.png" });
await T("v15Leave"); await page.waitForTimeout(800);
const z = (await T("v15Safe")).zones.find((z) => z.id === "harmony"); await T("v15Tp", z.x + 160, z.y + 60); await page.waitForTimeout(1200);
await page.screenshot({ path: "beta30-shots/v15-safe-zone.png" });
await browser.close();
