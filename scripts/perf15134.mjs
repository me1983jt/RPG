import { boot } from "./v4-lib.mjs";
const url = process.argv[2];
const { browser, page, T, begin } = await boot(url, { vw: 844, vh: 390, role: process.argv[3] || "Hunter" });
const wait = (ms) => page.waitForTimeout(ms);
// frames drawn on the title / creation screen (canvas hidden behind it)
await wait(1500); const m0 = await T("frameStats"); await wait(4000); const m1 = await T("frameStats");
await begin();
const cdp = await page.context().newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await wait(2000); const a = await T("frameStats"); await wait(5000); const b = await T("frameStats");
// hidden tab: frames while in the background
await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
const h0 = await T("frameStats"); await wait(3000); const h1 = await T("frameStats");
console.log(JSON.stringify({ menuFps: ((m1?.n ?? 0) - (m0?.n ?? 0)) / 4, playFps4xCPU: (b.n - a.n) / 5, avgRenderMs: +b.avg.toFixed(2), p95: b.p95, hiddenFramesIn3s: h1.n - h0.n }));
await browser.close();
