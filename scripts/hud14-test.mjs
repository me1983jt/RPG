// v14 collapsible HUD: each box minimizes, state persists, Pause has collapse/expand all, updates flash.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860, v14: true });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
await begin();
await page.waitForTimeout(600);
await page.screenshot({ path: "beta29-shots/v14-hud-expanded.png" });
for (const k of ["quest", "health", "mini"]) // v15.9.2: the aim box has no minimize button any more
	 ok(await page.locator(`[data-hud-min="${k}"]`).count() > 0, `${k} has a minimize button`);
// v15.9.2: phones now start with quest/health collapsed, so only click the boxes that are still expanded
for (const k of ["quest", "health", "mini"]) { const b = page.locator(`[data-hud-min="${k}"]`).first(); if (/^(Minimize|Hide)/.test(await b.getAttribute("aria-label"))) await b.click(); }
await page.waitForTimeout(300);
ok(await page.locator('[data-hud="quest-min"]').count() === 1, "quest collapses to a one-line objective");
ok(await page.locator('[data-hud="health-min"] [aria-label="Water"]').count() === 1, "health collapses to thin HP/food/water/sleep bars");
// v15.9.2: aim buttons no longer collapse (no aim minimize button)
ok(!(await page.locator('canvas[aria-label="Minimap"]').isVisible()), "minimap hides behind an icon");
await page.screenshot({ path: "beta29-shots/v14-hud-collapsed.png" });
// flash on objective change without re-expanding
// v15.9.2: the wreck no longer moves the objective during the Cold-road intro, so bump the quest step directly
await T("v14Set", { st: 5 }); await page.waitForTimeout(300);
ok(await page.locator('[data-hud="quest-min"].animate-pulse').count() === 1, "objective change flashes the collapsed quest strip");
ok(await page.locator('[data-hud="quest"]').count() === 0, "and does not re-expand it");
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.getByRole("button", { name: /Continue/ }).first().click().catch(() => {}); await page.waitForTimeout(2500);
ok(await page.locator('[data-hud="quest-min"]').count() === 1 && await page.locator('[data-hud="health-min"]').count() === 1, "collapsed state is remembered after reload");
await page.locator('[data-hud="health-min"] button', { hasText: "Pause" }).click(); await page.waitForTimeout(300);
await page.getByTestId("hud-expand-all").click();
await page.getByRole("button", { name: "Resume" }).click(); await page.waitForTimeout(300);
ok(await page.locator('[data-hud="quest"]').count() === 1 && await page.locator('[data-hud="health"]').count() === 1, "Pause: expand all");
await page.locator('[data-hud="health"] button', { hasText: "Pause" }).click(); await page.waitForTimeout(300);
await page.getByTestId("hud-collapse-all").click();
await page.getByRole("button", { name: "Resume" }).click(); await page.waitForTimeout(300);
ok(await page.locator('[data-hud="quest-min"]').count() === 1 && await page.locator('[data-hud="health-min"]').count() === 1, "Pause: collapse all");
console.log(fail ? `${fail} FAILED` : "ALL PASS"); if (errs.length) console.log(errs.slice(0, 8).join("\n"));
await browser.close(); process.exit(fail ? 1 : 0);
