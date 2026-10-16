// v11.2 polish + balance checks
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.POLOUT || "/workspace/maine-rpg/beta20-shots/";
const R = {}; const fail = [];
const check = (n, ok, info) => { R[n] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(n + " " + JSON.stringify(info ?? "").slice(0, 300)); };
const allErrs = [];
{
  const t0 = Date.now();
  const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 800 });
  const wait = (ms) => page.waitForTimeout(ms);
  const closeDlg = async () => { for (let i = 0; i < 3; i++) { const d = await T("dialogueNow"); if (!d) return; await T("choose", "close"); await wait(120); } };
  const pick = async (id) => { const d = await T("dialogueNow"); if (!d || !d.choices.some((c) => c.id === id)) { fail.push(`no choice ${id}: ${JSON.stringify(d)?.slice(0, 200)}`); return false; } await T("choose", id); await wait(200); return true; };
  const talk = async (role) => { await closeDlg(); const n = await T("npcOf", role); await T("setPos", n.x + 50, n.y + 50); await wait(250); await T("talk", role); await wait(250); };
  const shot = (n) => page.screenshot({ path: out + n });
  check("lazy-sheets-streamed", (await T("lazyPending")) === 0);
  // save slots
  check("three-slots", (await page.locator('[data-testid^="slot-"]').count()) === 3);
  await page.getByTestId("slot-2").click(); await wait(200);
  check("slot2-selected", (await page.getByTestId("slot-2").getAttribute("aria-checked")) === "true");
  await shot("01-save-slots.png");
  await begin();
  await T("saveNow"); await wait(200);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  check("slot2-saved-own-key", keys.includes("maine-rpg-save-v2-s2") && !keys.includes("maine-rpg-save-v2"), keys);
  // quest tracker
  await T("talk", "justin"); await pick("snow-accept"); await closeDlg(); await wait(300);
  check("tracker-visible", await page.getByTestId("quest-tracker").isVisible());
  await shot("02-quest-tracker.png");
  // map with fog
  { const p0 = await T("getPos"); for (const [dx, dy] of [[-900, 0], [-1800, 300], [-2600, 600], [-1800, 1400], [0, 1200]]) { await T("setPos", p0.x + dx, p0.y + dy); await wait(350); } await T("setPos", p0.x, p0.y); await wait(300); }
  await page.getByRole("button", { name: "Map" }).click(); await wait(800);
  check("map-open", await page.getByTestId("world-map").isVisible());
  const fog = await page.evaluate(() => { const c = document.querySelector('[data-testid="world-map"]'); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let lit = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 60) lit++; return lit / (d.length / 4); });
  check("map-fog", fog > 0.002 && fog < 0.6, fog);
  await shot("03-map-fog.png");
  await page.getByRole("button", { name: "Map" }).click(); await wait(200);
  // audio hooks: no files, no requests, game runs
  const au = await T("audio");
  check("audio-hooks", Array.isArray(au.files) && ["day", "night", "raid"].includes(au.track), au);
  // balance: one hunt a day, three fish a day
  await T("talk", "justin"); await closeDlg();
  await T("q10Set", {}).catch(() => {});
  const s = await T("questState");
  await T("addWood", 3); await talk("justin"); await pick("snow-wood"); await talk("sarah"); await pick("snow-done"); await closeDlg();
  await talk("justin"); await pick("q11-hunt"); await pick("q11-hunt-deer"); await wait(300);
  await T("q11Set", { hunt: null }); await closeDlg();
  await talk("justin"); await pick("q11-hunt");
  const d2 = await T("dialogueNow");
  check("one-hunt-a-day", d2 && !d2.choices.some((c) => c.id === "q11-hunt-deer"), d2);
  await closeDlg();
  await T("q11Force", { fish: true });
  const fsp = await T("q11Spot", "fishPond");
  let caught = 0;
  for (let i = 0; i < 4; i++) {
    await closeDlg(); const p = await T("getPos"); await T("setPos", p.x + 600, p.y); await wait(200); await T("setPos", fsp.x, fsp.y); await wait(800);
    const d = await T("dialogueNow");
    if (d?.choices.some((c) => c.id === "q11-fish-cast-fishPond")) { await T("choose", "q11-fish-cast-fishPond"); await wait(200); }
    const d3 = await T("dialogueNow");
    if (d3?.choices.some((c) => c.id === "q11-fish-hook")) { await T("choose", "q11-fish-hook"); await wait(200); caught++; }
  }
  check("three-fish-a-day", caught === 3, caught);
  await T("q11Force", { fish: null });
  check("no-console-errors", errs.length === 0, errs);
  allErrs.push(...errs);
  console.log("boot+run ms", Date.now() - t0);
  await browser.close();
}
// phone landscape layout: big targets, nothing overlapping
{
  const { browser, page, errs, T, begin } = await boot(url, { vw: 844, vh: 390 });
  await begin();
  await page.waitForTimeout(500);
  const boxes = await page.evaluate(() => {
    const els = [...document.querySelectorAll("button, canvas[aria-label=Minimap]")].filter((e) => { const r = e.getBoundingClientRect(); const st = getComputedStyle(e); return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.pointerEvents !== "none" || e.tagName === "CANVAS"; });
    return els.map((e) => { const r = e.getBoundingClientRect(); return { n: e.getAttribute("aria-label") || e.textContent.trim().slice(0, 20) || e.tagName, x: r.x, y: r.y, w: r.width, h: r.height }; }).filter((b) => b.y < innerHeight && b.x < innerWidth);
  });
  const small = boxes.filter((b) => b.n !== "Minimap" && (b.h < 40 || b.w < 40) && true);
  check("touch-targets>=40px", small.length === 0, small);
  const ov = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ix > 2 && iy > 2) ov.push([a.n, b.n]);
  }
  check("no-overlap-phone", ov.length === 0, ov);
  const offscreen = boxes.filter((b) => b.x < -1 || b.y < -1 || b.x + b.w > 845 || b.y + b.h > 391);
  check("no-clipping-phone", offscreen.length === 0, offscreen);
  await page.screenshot({ path: out + "04-phone-layout.png" });
  await page.getByRole("button", { name: "Journal" }).click(); await page.waitForTimeout(400);
  const jr = await page.locator('[aria-label="Quest journal"]').boundingBox();
  check("journal-fits-phone", jr && jr.y >= 0 && jr.y + jr.height <= 391, jr);
  await page.screenshot({ path: out + "05-phone-journal.png" });
  await page.getByRole("button", { name: "Map" }).click(); await page.waitForTimeout(700);
  const mr = await page.locator('[aria-label="World map"]').boundingBox();
  check("map-fits-phone", mr && mr.y >= 0 && mr.y + mr.height <= 391, mr);
  await page.screenshot({ path: out + "06-phone-map.png" });
  check("no-console-errors-phone", errs.length === 0, errs);
  await browser.close();
}
console.log(JSON.stringify(R, null, 1));
console.log("fails:", fail);
console.log(`${Object.values(R).filter((v) => v === "PASS").length}/${Object.keys(R).length}`);
