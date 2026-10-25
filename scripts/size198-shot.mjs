// size198: one world screenshot near Harmony (hero standing in front of the town). node scripts/size198-shot.mjs <out.png> [url]
import { boot } from "./v4-lib.mjs";
const out = process.argv[2] || "beta30-shots/size-after.png";
const url = process.argv[3] || "http://127.0.0.1:8112/";
const { browser, page, T, begin } = await boot(url, { vw: 1600, vh: 1000, v14: true });
await begin();
const s = await T("v15Start");
await T("v15Tp", s.harmony.x + 150, s.harmony.y + 150);
await page.waitForTimeout(3500);
await page.screenshot({ path: out });
try { const c = await T("sizeCheck"); console.log(JSON.stringify(c.out.map((r) => [r.key, r.inches, r.tableIn]))); } catch { /* hook missing on old builds */ }
await browser.close();
