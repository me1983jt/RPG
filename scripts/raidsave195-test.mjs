// v15.9.5: an old save made on raid night at the farm (raidNight/raidsHeld/raidOn, defend step v14.st 4, standing in the
// farmyard) loads cleanly: no errors, base steps done, moved to Harmony's entrance, and the raid fields are not written back.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 720, v14: true });
await begin(); await page.evaluate(() => window.__controlsTest.save()); await page.waitForTimeout(500);
const farm = (await T("v15Start")).farm;
await page.addInitScript((f) => {
  if (sessionStorage.getItem("raidPatched")) return; sessionStorage.setItem("raidPatched", "1");
  for (const k of Object.keys(localStorage)) {
    let d; try { d = JSON.parse(localStorage.getItem(k)); } catch { continue; }
    if (!d || typeof d !== "object" || !d.player) continue;
    Object.assign(d, { raidNight: 6, raidsHeld: 5, raidOn: true });
    if (d.v14) d.v14.st = 4;
    d.player.x = f.x + 40; d.player.y = f.y + 40; d.player.respawnX = f.x; d.player.respawnY = f.y;
    localStorage.setItem(k, JSON.stringify(d));
  }
}, farm);
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.getByTestId("continue-btn").click(); await page.waitForTimeout(2500);
const s = await T("v15Start"); const v = await T("v14");
ok(v.st === 5, `farm-only intro steps closed (v14.st ${v.st})`);
const dh = Math.hypot(s.x - s.harmony.x, s.y - s.harmony.y), df = Math.hypot(s.x - farm.x, s.y - farm.y);
ok(dh >= 260 && dh < 700, `moved to Harmony's entrance (${Math.round(dh)} px from Harmony)`);
ok(df > 300, `moved off the old farmyard spot (${Math.round(df)} px)`);
const kinds = (await T("propKinds")).kinds;
ok(!kinds.farmhouse && !kinds.barn && !kinds["sign-farm"] && !kinds.workbench, "no farmhouse, barn, farm sign or farm workbench on the map");
await page.evaluate(() => window.__controlsTest.save()); await page.waitForTimeout(300);
const left = await page.evaluate(() => Object.keys(localStorage).some((k) => { try { const d = JSON.parse(localStorage.getItem(k)); return d && d.player && ("raidOn" in d || "raidNight" in d) && d.savedAt == null; } catch { return false; } }));
ok(!left, "raid fields are not written back on save");
ok(!errs.length, `no errors ${errs.slice(0, 2).join(" | ")}`);
console.log(fail ? `${fail} FAILED` : "ALL PASS");
await browser.close(); process.exit(fail ? 1 : 0);
