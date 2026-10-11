import { boot } from "/workspace/maine-rpg/v4-lib.mjs";
const [url, out] = process.argv.slice(2);
const { browser, page, errs, T, begin } = await boot(url, { vw: 915, vh: 412 });
await begin(); await T("revealMap"); await T("setHp", 9999);
const tc = await T("tractorGo");
await T("setHour", 23); await T("setZoom", 1.3); await T("setPos", tc.x + 70, tc.y + 70); await page.waitForTimeout(600);
await T("tractorGo");
for (let i = 0; i < 4; i++) { await page.waitForTimeout(350); await page.screenshot({ path: `${out}/tractor-${i}.png` }); }
console.log(JSON.stringify({ tc, errors: errs })); await browser.close();
