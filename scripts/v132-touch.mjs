// v13.2: phone-size menu check. Every visible button must be >= 40x40 CSS px (or 40 tall and wide enough
// for its label) and must not overlap another visible button.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const R = {}; const fail = [];
const check = (n, ok, info) => { R[n] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(n + " " + JSON.stringify(info ?? "").slice(0, 400)); };
const measure = (page) => page.evaluate(() => {
  const vis = [...document.querySelectorAll("button, [role=button], input, select")].filter((b) => { const r = b.getBoundingClientRect(); const st = getComputedStyle(b); return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && (() => { let c = b.parentElement; while (c) { const cs = getComputedStyle(c); if (/(auto|scroll|hidden)/.test(cs.overflowY)) { const cr = c.getBoundingClientRect(); if (r.bottom <= cr.top + 1 || r.top >= cr.bottom - 1) return false; } c = c.parentElement; } return true; })(); });
  const boxes = vis.map((b) => { const r = b.getBoundingClientRect(); return { t: (b.getAttribute("aria-label") || b.textContent || b.id || b.tagName).trim().slice(0, 30), x: r.left, y: r.top, w: r.width, h: r.height, type: b.type }; });
  const small = boxes.filter((b) => b.type !== "range" && (b.h < 39.5 || b.w < 39.5));
  const over = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ox > 2 && oy > 2) over.push(`${a.t} / ${b.t}`);
  }
  const offscreen = boxes.filter((b) => b.x + b.w > innerWidth + 1 || b.y + b.h > innerHeight + 1).map((b) => b.t);
  return { n: boxes.length, small: small.map((b) => `${b.t} ${Math.round(b.w)}x${Math.round(b.h)}`), over, offscreen };
});
for (const [w, h] of [[360, 640], [390, 844], [844, 390]]) {
  const { browser, page, T } = await boot(url, { vw: w, vh: h });
  const tag = `${w}x${h}`;
  let m = await measure(page); check(`${tag} creator`, !m.small.length && !m.over.length, m);
  await page.getByRole("button", { name: /^Hunter/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Keen eye/ }).click();
  await page.getByRole("button", { name: /Begin as/ }).click(); await page.waitForTimeout(3000);
  m = await measure(page); check(`${tag} play`, !m.small.length && !m.over.length, m);
  for (const tab of ["main", "allies", "diary", "gear", "skills"]) {
    await page.getByRole("button", { name: "Journal" }).first().click(); await page.waitForTimeout(250);
    await page.getByTestId(`tab-${tab}`).click(); await page.waitForTimeout(250);
    m = await measure(page); check(`${tag} journal-${tab}`, !m.small.length && !m.over.length, m);
    await page.getByRole("button", { name: "Journal" }).first().click(); await page.waitForTimeout(200);
  }
  await T("statsToggle"); await page.waitForTimeout(300);
  m = await measure(page); check(`${tag} stats`, !m.small.length && !m.over.length, m);
  await T("statsToggle");
  const n = await T("npcOf", "sarah"); await T("setPos", n.x + 50, n.y + 40); await T("talk", "sarah"); await page.waitForTimeout(400);
  m = await measure(page); check(`${tag} talk`, !m.small.length && !m.over.length && !m.offscreen.length, m);
  await page.screenshot({ path: `/workspace/maine-rpg/beta25-shots/touch-${tag}-talk.png` });
  await T("choose", "close");
  await T("v13Reset", "main", { act: 9, flags: {}, ltKills: 3, choice: "unite", siege: 2, won: true, ending: "union", slide: 0 }); await page.waitForTimeout(400);
  m = await measure(page); check(`${tag} ending`, !m.small.length && !m.over.length, m);
  await page.screenshot({ path: `/workspace/maine-rpg/beta25-shots/touch-${tag}-ending.png` });
  await browser.close();
}
console.log(JSON.stringify(R, null, 1)); console.log("fails:", JSON.stringify(fail, null, 1));
console.log(`${Object.values(R).filter((v) => v === "PASS").length}/${Object.keys(R).length}`);
