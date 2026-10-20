// v14.1 layouts: every menu at 412x860, 860x412, 844x390, 1366x768, 1920x1080; overlap / off-screen checks; screenshots.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const only = process.argv[3];
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const sizes = [[412, 860], [860, 412], [844, 390], [1366, 768], [1920, 1080]].filter(([w, h]) => !only || only === `${w}x${h}`);
const measure = (page) => page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > .05; };
  const btns = [...document.querySelectorAll("button")].filter(vis);
  const W = innerWidth, H = innerHeight;
  const off = btns.filter((b) => { const r = b.getBoundingClientRect(); const sc = b.closest("[class*='overflow-y-auto'],[class*='overflow-auto'],[class*='overflow-x-auto']"); return !sc && (r.right > W + 1 || r.bottom > H + 1 || r.left < -1 || r.top < -1); }).map((b) => b.innerText.slice(0, 20) || b.getAttribute("aria-label"));
  return { n: btns.length, off };
});
for (const [vw, vh] of sizes) {
  const tag = `${vw}x${vh}`;
  const { browser, page, errs, T, begin } = await boot(url, { vw, vh });
  await begin(); await T("setHour", 12); for (let i = 0; i < 4; i++) await T("choose", "close");
  await page.waitForTimeout(500);
  const shot = async (n) => page.screenshot({ path: `beta30-shots/layout-${tag}-${n}.png` });
  let m = await measure(page); ok(!m.off.length, `${tag} play: nothing off screen ${m.off.join(",")}`); await shot("1-play");
  await page.keyboard.press("KeyI"); await page.waitForTimeout(400); m = await measure(page); ok(!m.off.length, `${tag} pack ${m.off.join(",")}`); await shot("2-pack"); await page.keyboard.press("KeyI");
  await page.keyboard.press("KeyB"); await page.waitForTimeout(400); m = await measure(page); ok(!m.off.length, `${tag} build ${m.off.join(",")}`); await shot("3-build"); await page.keyboard.press("KeyB");
  await page.keyboard.press("KeyC"); await page.waitForTimeout(400); m = await measure(page); ok(!m.off.length, `${tag} crafting ${m.off.join(",")}`); await shot("4-craft"); await page.keyboard.press("KeyC");
  await page.keyboard.press("KeyJ"); await page.waitForTimeout(400); m = await measure(page); ok(!m.off.length, `${tag} journal ${m.off.join(",")}`); await shot("5-journal"); await page.keyboard.press("KeyJ");
  await page.evaluate(() => window.__controlsTest.statsToggle()); await page.waitForTimeout(400); m = await measure(page); ok(!m.off.length, `${tag} stats ${m.off.join(",")}`); await shot("6-stats"); await page.evaluate(() => window.__controlsTest.statsToggle());
  const n = await T("npcOf", "sarah"); await T("setPos", n.x + 50, n.y + 40); await T("talk", "sarah"); await page.waitForTimeout(400);
  m = await measure(page); ok(!m.off.length, `${tag} conversation ${m.off.join(",")}`); await shot("7-talk"); await T("choose", "close");
  await page.keyboard.press("KeyM"); await page.waitForTimeout(400); m = await measure(page); ok(!m.off.length, `${tag} chart ${m.off.join(",")}`); await shot("8-chart"); await page.keyboard.press("KeyM");
  await T("wmOpen"); await page.waitForTimeout(600); m = await measure(page);
  const wm = await page.evaluate(() => { const c = document.querySelector('[data-testid="hex-map"]').getBoundingClientRect(); return { w: c.width, h: c.height, W: innerWidth, H: innerHeight }; });
  ok(!m.off.length && wm.w * wm.h > .8 * wm.W * wm.H, `${tag} world map fills the screen (${Math.round(wm.w)}x${Math.round(wm.h)}) ${m.off.join(",")}`); await shot("9-worldmap");
  await page.evaluate(() => window.__controlsTest.wmGo(5, 5)); await page.waitForTimeout(800);
  ok(!errs.length, `${tag} no errors ${errs.slice(0, 2).join(" | ")}`);
  await browser.close();
}
if (!only) {
  // rotate mid-game: portrait -> landscape -> portrait keeps the game going
  const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860 });
  await begin(); for (let i = 0; i < 4; i++) await T("choose", "close");
  await T("l141Give", "pelt", 3); await page.keyboard.press("KeyI"); await page.waitForTimeout(300);
  const a = await T("l141");
  await page.setViewportSize({ width: 860, height: 412 }); await page.waitForTimeout(700);
  await page.screenshot({ path: "beta30-shots/layout-rotate-1-landscape.png" });
  await page.setViewportSize({ width: 412, height: 860 }); await page.waitForTimeout(700);
  await page.screenshot({ path: "beta30-shots/layout-rotate-2-portrait.png" });
  const b = await T("l141");
  const packOpen = await page.evaluate(() => /Pack/.test(document.body.innerText));
  const canvas = await page.evaluate(() => { const c = document.querySelector("canvas"); return { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight }; });
  ok(Math.abs(a.x - b.x) < 2 && a.bag.length === b.bag.length && a.phase === b.phase && packOpen, "rotating keeps the game, pack and position");
  ok(canvas.cw === 412 && canvas.ch === 860, `canvas re-lays out to the new size (${canvas.cw}x${canvas.ch})`);
  ok(!errs.length, "rotate: no errors " + errs.slice(0, 2).join(" | "));
  await browser.close();
}
console.log(fail ? `${fail} FAIL` : "ALL PASS"); process.exit(fail ? 1 : 0);
