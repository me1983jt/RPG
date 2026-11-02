// v15.13.0: Maine Seven creation, traits, tags, Maine perks, save/load and old-save defaults (phone landscape).
import { chromium } from "playwright";
const dir = process.argv[2] || "/workspace/maine-rpg/shots/v1513";
const url = process.argv[3] || "http://127.0.0.1:8112/";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
await page.addInitScript(() => { window.__v13Quiet = true; window.__safeOff = true; });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
let fail = 0; const ok = (v, m) => { console.log((v ? "PASS " : "FAIL ") + m); if (!v) fail++; };
await page.fill("#wanderer-name", "Justin");
await page.getByRole("button", { name: /Hunter/ }).click();
await page.getByRole("button", { name: "Next" }).click(); await page.waitForTimeout(300);
for (const n of ["Neighborly", "Neighborly", "Neighborly"]) await page.getByRole("button", { name: `Lower ${n}` }).click();
for (const n of ["Eye", "Eye", "Eye", "Quick", "Quick", "Quick", "Wind", "Back"]) await page.getByRole("button", { name: `Raise ${n}` }).click();
ok((await page.getByTestId("m7-left").textContent()).startsWith("0 points"), "pool spent");
ok(await page.getByRole("button", { name: "Raise Eye" }).isDisabled(), "raise disabled at 0 left");
await page.screenshot({ path: `${dir}/create-stats.png` });
await page.getByRole("button", { name: "Next" }).click(); await page.waitForTimeout(300);
for (const t of ["wicked", "dooryard", "milltown"]) await page.locator(`[data-trait2="${t}"]`).click();
ok(await page.locator('[data-trait2][aria-pressed="true"]').count() === 2, "max 2 traits");
// retag: clear class tags, pick rifle, sneak, trail
for (const id of await page.locator('[data-tag][aria-pressed="true"]').evaluateAll((els) => els.map((e) => e.dataset.tag))) await page.locator(`[data-tag="${id}"]`).click();
for (const t of ["rifle", "sneak", "trail"]) await page.locator(`[data-tag="${t}"]`).click();
ok(await page.locator('[data-tag][aria-pressed="true"]').count() === 3, "3 tags");
await page.screenshot({ path: `${dir}/create-traits.png` });
await page.getByRole("button", { name: /Begin as/ }).click();
await page.waitForTimeout(3500); await page.evaluate(() => window.__controlsTest.v14Set?.({ st: 5 }));
const c = (f, ...a) => page.evaluate(([f, a]) => window.__controlsTest[f]?.(...a), [f, a]);
await page.evaluate(() => { const c = window.__controlsTest; c.choose?.("close"); c.setHour(12); c.v13Weather("clear"); });
const sav = await page.evaluate(() => { for (const k of Object.keys(localStorage)) { try { const d = JSON.parse(localStorage.getItem(k)); if (d && d.m7) return { k, m7: d.m7, traits2: d.traits2, tags: d.tags }; } catch {} } return null; });
await page.evaluate(() => window.__controlsTest.v1513Save?.());
const sav2 = sav ?? await page.evaluate(() => { for (const k of Object.keys(localStorage)) { try { const d = JSON.parse(localStorage.getItem(k)); if (d && d.m7) return { k, m7: d.m7, traits2: d.traits2, tags: d.tags }; } catch {} } return null; });
console.log("save", JSON.stringify(sav2));
ok(sav2?.m7?.eye === 8 && sav2?.m7?.neighborly === 2 && sav2?.traits2?.join() === "wicked,dooryard" && sav2?.tags?.join() === "rifle,sneak,trail", "save has m7, traits, tags");
// level up to 3 and take perks
console.log("level", await c("v1513Xp", 400));
await page.waitForTimeout(500);
for (const k of ["quest", "health", "mini"]) { const x = page.locator(`[data-hud-min="${k}"]`).first(); if (await x.count() && /^(Show|Expand)/.test(await x.getAttribute("aria-label") || "")) await x.click(); }
const statsOpen = await page.locator('[data-testid="m7-panel"]').isVisible().catch(() => false);
if (!statsOpen) await page.locator('[data-fobar-btn="Char"]').click(); await page.waitForTimeout(700);
ok(await page.getByTestId("m7-panel").isVisible(), "Maine Seven in the character panel");
await page.screenshot({ path: `${dir}/char-m7.png` });
const pick = page.getByRole("button", { name: /First Light/ });
if (await pick.count()) { await pick.scrollIntoViewIfNeeded(); await page.screenshot({ path: `${dir}/perk-pick.png` }); await pick.click(); await page.waitForTimeout(400); }
ok(/First Light/.test(await page.getByTestId("m7-panel").textContent()), "perk First Light taken");
await page.screenshot({ path: `${dir}/char-perk.png` });
// reload -> continue keeps everything
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.getByTestId("continue-btn").click(); await page.waitForTimeout(3000);
const st = await page.evaluate(() => { const s = window.__hud?.getState?.() ?? null; return s; }).catch(() => null);
await page.evaluate(() => window.__controlsTest.choose?.("close"));
if (!(await page.getByTestId("m7-panel").isVisible().catch(() => false))) await page.locator('[data-fobar-btn="Char"]').click(); await page.waitForTimeout(700);
const txt = await page.getByTestId("m7-panel").textContent().catch(() => "");
ok(/First Light/.test(txt) && /Wicked Quick/.test(txt) && /Dooryard Lookout/.test(txt), "load keeps perks and traits");
// combat AP: quick 8 -> +1, wicked +1, plus class
ok(/AP in a fight \d+/.test(txt), `AP shown: ${txt.match(/AP in a fight \d+/)?.[0]}`);
await page.locator('[data-fobar-btn="Char"]').click().catch(() => {}); await page.waitForTimeout(300);
await page.evaluate(() => { window.__wmEnc = 1; window.__controlsTest.l141Calm?.(); window.__controlsTest.choose?.("close"); });
ok(await c("testScenario", "turnbased") === "ok", "turnbased scenario"); await page.waitForTimeout(1500);
let t = await c("tb15"); for (let i = 0; i < 40 && t?.on && !t.mine; i++) { await page.waitForTimeout(300); t = await c("tb15"); }
console.log("tb", JSON.stringify({ ap: t?.ap, maxAp: t?.maxAp }));
await page.screenshot({ path: `${dir}/combat-ap.png` });
await c("tbOff");
// old save without v15.13 fields loads with defaults
await page.addInitScript(() => { let n = 0; for (const k of Object.keys(localStorage)) { try { const d = JSON.parse(localStorage.getItem(k)); if (d && d.m7) { delete d.m7; delete d.traits2; localStorage.setItem(k, JSON.stringify(d)); n++; } } catch {} } window.__stripped = n; });
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.getByTestId("continue-btn").click(); await page.waitForTimeout(3000);
await page.evaluate(() => window.__controlsTest.choose?.("close"));
if (!(await page.getByTestId("m7-panel").isVisible().catch(() => false))) await page.locator('[data-fobar-btn="Char"]').click(); await page.waitForTimeout(700);
const t2 = await page.getByTestId("m7-panel").textContent().catch(() => "");
const old = await page.evaluate(() => window.__stripped);
ok(old > 0 && /Traits: none/.test(t2) && /Back5Eye5/.test(t2.replace(/\s/g, "")), "old save -> all 5, no traits");
await page.screenshot({ path: `${dir}/old-save.png` });
ok(!errs.length, `no errors ${errs.slice(0, 4).join(" | ")}`);
await b.close(); process.exit(fail ? 1 : 0);
