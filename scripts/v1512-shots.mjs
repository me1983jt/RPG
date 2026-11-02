// v15.12.0: Build art in the bar, aim, journal device, Maine map, stats panel, dialogue frame and ending cards (phone landscape).
import { chromium } from "playwright";
const dir = process.argv[2] || "/workspace/maine-rpg/shots/v1512";
const url = process.argv[3] || "http://127.0.0.1:8112/";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(String(e))); page.on("response", (r) => { if (r.status() >= 400 && /\/game\/(hud|ui)\//.test(r.url())) errs.push(`HTTP ${r.status()} ${r.url()}`); });
await page.addInitScript(() => { window.__v13Quiet = true; window.__safeOff = true; });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.fill("#wanderer-name", "Justin");
await page.getByRole("button", { name: /Hunter/ }).click();
await page.getByRole("button", { name: "Next" }).click();
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
await page.getByRole("button", { name: "Next" }).click();
await page.getByRole("button", { name: /Keen eye/ }).click();
await page.getByRole("button", { name: /Begin as/ }).click();
await page.waitForTimeout(3500); await page.evaluate(() => window.__controlsTest.v14Set?.({ st: 5 }));
const c = (f, ...a) => page.evaluate(([f, a]) => window.__controlsTest[f]?.(...a), [f, a]);
await page.evaluate(() => { const c = window.__controlsTest; c.choose?.("close"); c.setHour(12); c.v13Weather("clear"); });
for (const k of ["quest", "health", "mini"]) { const x = page.locator(`[data-hud-min="${k}"]`).first(); if (await x.count() && /^(Show|Expand)/.test(await x.getAttribute("aria-label") || "")) await x.click(); }
await page.waitForTimeout(1500);
let fail = 0; const ok = (v, m) => { console.log((v ? "PASS " : "FAIL ") + m); if (!v) fail++; };
ok(await page.locator(".fobar-art").count() === 1, "bar uses Build art");
const bh = (await page.locator('[data-fobar="1"]').boundingBox()).height; ok(bh <= 0.21 * 390, `bar ${Math.round(bh / 3.9)}%`);
await page.screenshot({ path: `${dir}/bar.png` });
// journal device
await page.locator('[data-fobar-btn="Journal"]').click(); await page.waitForTimeout(800);
ok(await page.locator('[data-ui="device"]').isVisible(), "journal in the trail radio frame");
await page.screenshot({ path: `${dir}/journal-device.png` });
await page.locator('[data-device-tab="map"]').click(); await page.waitForTimeout(600);
ok(await page.getByTestId("world-map").count() > 0, "device Map tab opens the map");
await page.locator('[data-map-tab="maine"]').click(); await page.waitForTimeout(1200);
ok(await page.getByTestId("maine-map").isVisible(), "Maine map tab");
await page.screenshot({ path: `${dir}/maine-map.png` });
await page.locator('[data-map-tab="area"]').click(); await page.locator('[data-fobar-btn="Map"]').click(); await page.waitForTimeout(400);
// stats
await page.locator('[data-fobar-btn="Char"]').click(); await page.waitForTimeout(700);
ok(await page.locator('[data-ui-panel="char"]').isVisible(), "character panel art");
await page.screenshot({ path: `${dir}/char-panel.png` });
await page.locator('[data-fobar-btn="Char"]').click().catch(() => page.evaluate(() => window.__controlsTest)); await page.waitForTimeout(400);
// dialogue
let d = null; for (const r of ["cyndal", "loki", "cal", "mira", "pete", "holt"]) { d = await c("v15Talk", r); if (d) break; }
await page.waitForTimeout(700);
ok(!!d && await page.locator('[data-ui-dialogue="head"], [data-ui-dialogue="trade"]').count() === 1, `dialogue frame (${d?.speaker})`);
await page.screenshot({ path: `${dir}/dialogue.png` });
await page.evaluate(() => window.__controlsTest.choose?.("close")); await c("closeDialog"); await page.keyboard.press("Escape"); await page.waitForTimeout(400);
// combat + aim (code outline, Build aim art rejected)
await page.evaluate(() => { window.__wmEnc = 1; window.__controlsTest.l141Calm?.(); window.__controlsTest.choose?.("close"); });
ok(await c("testScenario", "turnbased") === "ok", "turnbased scenario"); await page.waitForTimeout(1200);
let t = await c("tb15"); for (let i = 0; i < 40 && t?.on && !t.mine; i++) { await page.waitForTimeout(300); t = await c("tb15"); }
ok(t?.on && await page.locator('[data-fobar="ap"]').isVisible(), "combat with Build AP lamps");
await page.screenshot({ path: `${dir}/combat.png` });
await c("tb15Popup", t.foes?.[0]?.id); await page.waitForTimeout(500);
await page.screenshot({ path: `${dir}/aim.png` });
await c("v141", "tbClose");
// ending card
await c("tbOff"); await page.evaluate(() => { try { window.__controlsTest.v13Reset("main", { act: 9, flags: {}, ltKills: 3, choice: "unite", siege: 1, won: true, ending: "union", slide: 0, collectorDown: true }); } catch (e) { console.log(e); } });
await page.waitForTimeout(900);
ok(await page.getByTestId("ending-art").isVisible().catch(() => false), "ending card art");
await page.screenshot({ path: `${dir}/ending.png` });
ok(!errs.length, `no errors ${errs.slice(0, 4).join(" | ")}`);
await b.close(); process.exit(fail ? 1 : 0);
