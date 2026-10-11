import { createRequire } from "node:module";
const require = createRequire("/workspace/maine-rpg/run/package.json");
const { chromium } = require("playwright");
const [url, out = "/tmp", vw = 844, vh = 390] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const ctx = await browser.newContext({ viewport: { width: +vw, height: +vh }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", e => errs.push(e.message)); page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
const T = (fn, ...a) => page.evaluate(([f, a]) => window.__controlsTest[f](...a), [fn, a]);
await page.goto(url, { waitUntil: "networkidle" }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.fill("#wanderer-name", "Justin");
await page.getByRole("button", { name: /Hunter/ }).tap();
await page.getByRole("button", { name: "Next" }).tap();
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).tap();
await page.getByRole("button", { name: "Next" }).tap();
await page.getByRole("button", { name: /Keen eye/ }).tap();
await page.getByRole("button", { name: /Begin as/ }).tap();
await page.waitForTimeout(3000);
console.log("walk-in kinds", JSON.stringify(await T("walkInKinds")));
const kinds = (process.env.KINDS || "farmhouse,barn,hatch,shack,ruin").split(",");
console.log("exit doorsteps", JSON.stringify(await T("exitCheck")));
const enter = async (kind) => {
  const d = await T("doorOf", kind); if (!d) return null;
  await T("setPos", d.x, d.y); await page.waitForTimeout(300);
  await T("forceEnter", kind);
  for (let i = 0; i < 12; i++) { await page.waitForTimeout(500); const info = await T("insideInfo"); if (info) return info; }
  return null;
};
const walkAway0 = async () => { await page.waitForTimeout(900); const sp = await T("openSpotNear", 2); if (!sp) return -1; const sc = sp; const p0 = await T("getPos"); await page.touchscreen.tap(sc.sx, sc.sy); await page.waitForTimeout(1800); if (await T("insideInfo")) return "RE-ENTERED"; const p1 = await T("getPos"); return Math.round(Math.hypot(p1.x - p0.x, p1.y - p0.y)); };
const walkAway = async () => { await page.waitForTimeout(500); const sp = await T("openSpotNear", 2) ?? null; const p0 = await T("getPos"); let target = sp; if (!target) { target = { x: p0.x + 128, y: p0.y + 128 }; } const ok = await T("walkTo", target.x, target.y); await page.waitForTimeout(2000); const p1 = await T("getPos"); return (ok ? "" : "nopath:") + Math.round(Math.hypot(p1.x - p0.x, p1.y - p0.y)); };
const res = {};
for (const kind of kinds) {
  const r = res[kind] = {};
  let info = await enter(kind); if (!info) { r.enter = "none/failed"; continue; }
  if (process.env.HOUR) await T("setHour", +process.env.HOUR);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${vw}x${vh}-${kind}${process.env.HOUR ? "-night" : ""}.png` });
  const rs = info.scale || 1;
  // 1) tap the drawn door
  const door = await page.evaluate(() => { const c = document.querySelector("canvas"); return null; });
  const s2 = await page.evaluate(() => window.__controlsTest.insideInfo());
  const sc = await page.evaluate(() => (window.__roomScale ? window.__roomScale() : 1));
  const dx = (s2.origin.x + 160) * s2.scale, dy = (s2.origin.y + 214) * s2.scale;
  r.doorAt = [Math.round(dx), Math.round(dy)];
  r.onTop = await page.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return el ? el.tagName : null; }, [dx, dy]);
  await page.touchscreen.tap(dx, dy); await page.waitForTimeout(700);
  r.tapDoor = !(await T("insideInfo"));
  // 2) Leave button
  info = await enter(kind); await page.waitForTimeout(500);
  const btn = page.getByRole("button", { name: "Leave building" });
  const box = await btn.boundingBox(); r.leaveBtn = box ? [Math.round(box.width), Math.round(box.height)] : null;
  await btn.tap(); await page.waitForTimeout(600);
  r.leaveButton = !(await T("insideInfo"));
  // after leaving: can we walk away? tap 120px left of centre and see the hero move
  r.walkAfter = await walkAway();
  // 3) walk onto the door mat (tap floor just above the door)
  info = await enter(kind); await page.waitForTimeout(500);
  const s3 = await T("insideInfo");
  await page.touchscreen.tap((s3.origin.x + 160) * s3.scale, (s3.origin.y + 207) * s3.scale); await page.waitForTimeout(2500);
  r.walkOut = !(await T("insideInfo"));
  if (!r.walkOut) await T("leave");
  // 4) back button path: pause menu has Leave building
  info = await enter(kind); await page.waitForTimeout(400);
  await page.evaluate(() => window.__rpgBack && window.__rpgBack());
  await page.getByRole("button", { name: "Pause" }).tap(); await page.waitForTimeout(400);
  const pl = page.getByRole("button", { name: "Leave building" });
  r.pauseLeave = (await pl.count()) > 0;
  if (r.pauseLeave) { await pl.first().tap(); await page.waitForTimeout(500); }
  r.pauseLeaveWorked = !(await T("insideInfo"));
  if (!r.pauseLeaveWorked) { await T("leave"); }
  // 5) save inside, reload, continue
  info = await enter(kind); await page.waitForTimeout(400);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /Continue/ }).first().tap(); await page.waitForTimeout(2500);
  r.reloadInside = !!(await T("insideInfo"));
  r.walkAfterReload = await walkAway();
}
console.log(JSON.stringify(res, null, 1));
console.log("errors", JSON.stringify(errs));
await browser.close();
