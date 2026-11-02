// v15.13.3: Build-Redo-3 gun poses, painted weapon icons, Build props on the outdoor maps.
import { chromium } from "playwright";
const dir = process.argv[2] || "/workspace/maine-rpg/shots/v15133";
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
const p0 = await T("getPos"); const oa = await T("openArea", p0.x, p0.y, 40); if (oa) await T("setPos", oa.x, oa.y);
await page.waitForTimeout(1200);
const clip = { x: 322, y: 40, width: 200, height: 200 };
const pose = async (weapon, d, fire, file) => {
  await T("wear1510", { weaponId: weapon }, d); await T("holdAim15", 30); await page.waitForTimeout(400);
  await T("heroLogStart");
  if (fire) { await T("swingNow"); await page.waitForTimeout(70); }
  await page.screenshot({ path: `${dir}/${file}`, clip });
  return (await T("heroLogTake")).map((l) => l.name);
};
let n = await pose("carbine", 2, false, "rifle-aim-a.png"); ok(n.includes("pl/rifle-aim"), `rifle aim drawn (${[...new Set(n)].join(",")})`);
n = await pose("carbine", 5, false, "rifle-aim-b.png"); ok(n.includes("pl/rifle-aim"), "rifle aim, 2nd direction");
n = await pose("shotgun", 1, true, "rifle-fire.png"); ok(n.includes("pl/rifle-fire"), `shotgun fires on rifle-fire (${[...new Set(n)].join(",")})`);
n = await pose("revolver", 6, false, "pistol-aim.png"); ok(n.includes("pl/pistol-aim"), "revolver holds pistol aim");
n = await pose("revolver", 1, true, "pistol-fire-flash.png"); ok(n.includes("pl/pistol-aim"), "revolver fire = aim + flash");
n = await pose("hatchet", 2, true, "melee-unchanged.png"); ok(!n.some((x) => /rifle|pistol/.test(x)), `melee stays on old sheets (${[...new Set(n)].join(",")})`);
await T("wear1510", { weaponId: "carbine" }, 2); await T("holdAim15", 0);
// pack with new icons
console.log("bag", await T("bagSet15", ["revolver", "carbine", "levergun", "scoped", "shotgun", "scatter", "knife", "hatchet", "hudson"]));
await page.locator('[data-fobar-btn="Pack"]').click(); await page.waitForTimeout(1500);
const icons = await page.evaluate(() => [...document.querySelectorAll("img")].map((i) => i.getAttribute("src")).filter((s) => s && s.includes("/items/v15133/")));
ok(new Set(icons).size >= 8, `pack shows Build icons (${[...new Set(icons.map((s) => s.split("/").pop().split("?")[0]))].join(",")})`);
await page.screenshot({ path: `${dir}/pack-icons.png` });
await page.locator('button:has-text("✕"), button[aria-label="Close"]').first().click().catch(() => {}); await page.waitForTimeout(500); if (await page.locator("text=Drag an item onto a slot").count()) await page.locator('[data-fobar-btn="Pack"]').click({ force: true }).catch(() => {}); await page.waitForTimeout(800);
// props on this map
const props = await T("props15"); console.log("props", JSON.stringify(props));
ok(props.length >= 3, `Build props on map (${props.map((p) => p.skin.slice(6)).join(",")})`);
const pick = props.find((p) => /rain-barrel/.test(p.skin)) || props[0];
if (pick) { await T("setPos", pick.x + 60, pick.y + 90); await page.waitForTimeout(1500); await page.screenshot({ path: `${dir}/map-props.png` }); }
const pick2 = props.find((p) => /fallen-log|boulder/.test(p.skin));
if (pick2) { await T("setPos", pick2.x + 60, pick2.y + 90); await page.waitForTimeout(1500); await page.screenshot({ path: `${dir}/map-props-2.png` }); }
ok(!errs.length, `no errors ${errs.slice(0, 4).join(" | ")}`);
await b.close(); process.exit(fail ? 1 : 0);
