// v15.13.2: Build art merge: new hero walk + boots/gloves/trousers overlays, 3 Hollowed kinds, Goose sheet, HUD icons, Health label.
import { chromium } from "playwright";
const dir = process.argv[2] || "/workspace/maine-rpg/shots/v15132";
const url = process.argv[3] || "http://127.0.0.1:8112/";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(String(e))); page.on("response", (r) => { if (r.status() >= 400 && /\/game\//.test(r.url())) errs.push(`HTTP ${r.status()} ${r.url()}`); });
await page.addInitScript(() => { window.__v13Quiet = true; window.__safeOff = true; window.__tbOff = true; });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
let fail = 0; const ok = (v, m) => { console.log((v ? "PASS " : "FAIL ") + m); if (!v) fail++; };
await page.fill("#wanderer-name", "Justin");
await page.getByRole("button", { name: /Hunter/ }).click();
await page.getByRole("button", { name: "Next" }).click();
for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "Raise Might" }).click();
await page.getByRole("button", { name: "Next" }).click();
await page.getByRole("button", { name: /Begin as/ }).click();
await page.waitForTimeout(3500);
const T = (f, ...a) => page.evaluate(([f, a]) => window.__controlsTest[f]?.(...a), [f, a]);
await page.evaluate(() => { const c = window.__controlsTest; c.v14Set?.({ st: 5 }); c.choose?.("close"); c.setHour(12); c.v13Weather("clear"); c.l141Calm?.(); });
await T("wear", "feetId", "boots"); await T("wear", "legsId", "trousers"); await T("wear", "handsId", "gloves");
await page.waitForTimeout(1500);
ok(await page.locator('[data-bar-icon="Talk"]').count() === 1 && await page.locator('[data-bar-icon="Journal"]').count() === 1, "bar Talk/Journal use Build icons");
// walk
const p0 = await T("getPos"); const oa = await T("openArea", p0.x, p0.y, 40); if (oa) { await T("setPos", oa.x, oa.y); await page.waitForTimeout(800); }
const p = await T("getPos"); console.log("at", JSON.stringify(p), JSON.stringify(oa));
await T("heroLogStart");
await T("walkStraight", p.x - 600, p.y + 200); await page.waitForTimeout(500);
await page.screenshot({ path: `${dir}/hero-walk-overlays.png` });
await page.waitForTimeout(300);
await page.screenshot({ path: `${dir}/hero-walk-overlays-2.png`, clip: { x: 372, y: 90, width: 200, height: 170 } });
const log = await T("heroLogTake");
ok(log.some((l) => /pl\/walk/.test(l.name) && l.cols === 14), `hero draws the 14-frame Build walk (${[...new Set(log.map((l) => l.name + ":" + l.cols))].slice(0, 6).join(" ")})`);
await T("walkStraight", p.x - 400, p.y + 30); await page.waitForTimeout(2500);
await page.screenshot({ path: `${dir}/hero-idle-overlays.png`, clip: { x: 322, y: 60, width: 200, height: 170 } });
// hollowed kinds
const q = await T("getPos");
const ids = [...await T("l141Hollow", 1, 260, 60, "logger"), ...await T("l141Hollow", 1, 330, -60, "icefisher"), ...await T("l141Hollow", 1, 400, 60, "farmer")];
await page.waitForTimeout(600);
const en = await T("l141Enemies");
const names = en.filter((e) => ids.includes(e.id)).map((e) => e.name);
ok(names.some((n) => /Logger/.test(n)) && names.some((n) => /Ice-fisher/.test(n)) && names.some((n) => /Farmer/.test(n)), `3 Hollowed kinds: ${names.join(", ")}`);
await page.screenshot({ path: `${dir}/hollowed-kinds.png` });
// Goose
await T("q10Set", { dog: 4 }); await page.waitForTimeout(2500);
ok(!!(await T("q10Dog")), "Goose is out");
await page.screenshot({ path: `${dir}/goose.png` });
// character panel
await page.locator('[data-fobar-btn="Char"]').click(); await page.waitForTimeout(800);
const txt = await page.locator('[data-ui-panel="char"], section').filter({ hasText: "The Seven" }).first().textContent();
ok(/Health/.test(txt) && (txt.match(/Vigor/g) || []).length === 1, "old Vigor shown as Health, one Vigor left (The Seven)");
await page.screenshot({ path: `${dir}/char-panel.png` });
await page.locator('[data-testid="core-stats"]').scrollIntoViewIfNeeded().catch(() => {});
await page.getByText("Health", { exact: true }).scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
await page.screenshot({ path: `${dir}/char-panel-health.png` });
ok(!errs.length, `no errors ${errs.slice(0, 4).join(" | ")}`);
await b.close(); process.exit(fail ? 1 : 0);
