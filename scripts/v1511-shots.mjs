// v15.11.0: bottom interface bar, a combat turn, and the aimed-shot screen at phone landscape size.
import { chromium } from "playwright";
const dir = process.argv[2] || "/workspace/maine-rpg/shots/v1511";
const url = process.argv[3] || "http://127.0.0.1:8112/";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
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
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
ok(await page.locator('[data-fobar="1"]').isVisible(), "bottom bar visible");
for (const l of ["Char", "Pack", "Map", "Journal", "Options"]) ok(await page.locator(`[data-fobar-btn="${l}"]`).isVisible(), `button ${l}`);
ok(await page.locator('[data-fobar="slot-a"]').isVisible() && await page.locator('[data-fobar="slot-b"]').isVisible(), "two weapon slots");
ok(!(await page.locator('[data-fobar="ap"]').count()), "no AP lights out of combat");
const box = await page.locator('[data-fobar-btn="Char"]').boundingBox(); ok(box && box.height >= 36, `touch target ${box?.height}px tall`);
await page.screenshot({ path: `${dir}/bar.png` });
// swap slots
const before = await page.locator('[data-fobar="slot-a"]').innerText();
await page.locator('[data-fobar="slot-b"]').click(); await page.waitForTimeout(300);
const after = await page.locator('[data-fobar="slot-a"]').innerText();
ok(before !== after, `swap: "${before.replace(/\n/g, " ")}" -> "${after.replace(/\n/g, " ")}"`);
await page.locator('[data-fobar="slot-b"]').click(); await page.waitForTimeout(300);
// combat
await page.evaluate(() => { window.__wmEnc = 1; window.__controlsTest.l141Calm?.(); window.__controlsTest.choose?.("close"); });
ok(await c("testScenario", "turnbased") === "ok", "turnbased scenario");
await page.waitForTimeout(1200);
let t = await c("tb15");
const foe = t.foes?.[0];
ok(t?.on, `combat started, order: ${(t?.order || []).map((o) => o.name).join(", ")}`);
for (let i = 0; i < 40 && t?.on && !t.mine; i++) { await page.waitForTimeout(300); t = await c("tb15"); }
ok(await page.locator('[data-fobar="ap"]').isVisible(), "AP lights in combat");
ok(await page.locator('[data-tb15="end"]').isVisible() && await page.locator('[data-tb15="endcombat"]').isVisible(), "End Turn + End Combat");
await page.screenshot({ path: `${dir}/combat-turn.png` });
ok(!!(await c("tb15Popup", foe?.id)), "aim popup opens");
await page.waitForTimeout(500);
ok(await page.locator('[data-tb15="aim"] [data-zone="eyes"]').count() === 1, "body outline with eyes zone");
await page.screenshot({ path: `${dir}/aim-screen.png` });
const apBefore = (await c("tb15")).ap;
await page.locator('[data-tb15="aim"] [data-part="torso"]').click({ force: true }); await page.waitForTimeout(900);
t = await c("tb15"); ok(!t.on || t.ap < apBefore, `attack spent AP ${apBefore} -> ${t.ap}`);
await page.locator('[data-tb15="end"]').click().catch(() => {}); await page.waitForTimeout(2500);
t = await c("tb15"); ok(!t.on || t.round >= 1, `after End Turn: ${t.on ? (t.mine ? "your turn again, round " + t.round : t.cur + "'s turn") : "combat over"}`);
await page.screenshot({ path: `${dir}/combat-after-end-turn.png` });
// fallback to real time
await page.evaluate(() => window.__controlsTest && 0);
ok(!errs.length, `no page errors ${errs.slice(0, 3).join(" | ")}`);
await b.close(); process.exit(fail ? 1 : 0);
