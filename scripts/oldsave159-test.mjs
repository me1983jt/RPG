// v15.9: old saves with town class names load as the shared classes (Woodsman -> Camp hand, Scrounger -> Prowler, Fixer -> Medic).
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 720, v14: true });
await begin(); await page.evaluate(() => window.__controlsTest.save()); await page.waitForTimeout(500);
for (const [old, want] of [["woodsman", "fighter"], ["Scrounger", "thief"], ["fixer", "medic"], ["tinker", "tinker"]]) {
  // patch before the app boots (a reload saves on unload and would overwrite an in-page edit)
  await page.addInitScript((r) => { const walk = (o) => { if (!o || typeof o !== "object") return; if (typeof o.role === "string") o.role = r; }; for (const k of Object.keys(localStorage)) { try { const d = JSON.parse(localStorage.getItem(k)); walk(d); localStorage.setItem(k, JSON.stringify(d)); } catch {} } }, old);
  await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
  await page.getByTestId("continue-btn").click(); await page.waitForTimeout(2500);
  const st = (await T("v15Open", "pittsfield")).msg.state; await page.evaluate(() => window.__controlsTest.v15Leave?.());
  ok(st.role === want && st.class === want, `old "${old}" save loads as ${want} (${st.role}/${st.class})`);
  await page.evaluate(() => window.__controlsTest.save()); await page.waitForTimeout(300);
}
ok(!errs.length, `no errors ${errs.slice(0, 2).join(" | ")}`);
console.log(fail ? `${fail} FAILED` : "ALL PASS");
await browser.close(); process.exit(fail ? 1 : 0);
