// v15.9 (audit A1): leaving a town through its own exit must not delete RPG gear the town doesn't know.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 720, v14: true });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
await begin(); await T("setHour", 12);
for (const id of ["pittsfield", "harmony", "skowhegan"]) {
  const before = await T("bagNow");
  await T("v15Open", id); await page.waitForTimeout(3500);
  const f = page.frames().find((x) => x !== page.mainFrame());
  const townInv = await f.evaluate(() => HARMONY.state.inventory.map((i) => i.id));
  if (id === "harmony") { const sc = await f.evaluate(() => HARMONY.state.scene); ok(sc === "harmony", `Harmony marker opens Main Street (${sc})`); }
  await f.evaluate(() => HARMONY.leave("town")); await page.waitForTimeout(2500);
  const after = await T("bagNow"); let ph = (await T("wm")).phase; if (ph === "dialogue") { console.log("dialogue:", JSON.stringify(await page.evaluate(() => document.body.innerText.slice(0, 300)))); }
  const lost = JSON.stringify(before) !== JSON.stringify(after) ? { before, after } : null;
  ok(ph === "play", `${id}: the real Leave town exit returns to the world (${ph})`);
  ok(!lost, `${id}: gear survives the real exit (town kept ${townInv.join(",")}) ${lost ? JSON.stringify(lost) : ""}`);
}
ok(!errs.length, `no errors ${errs.slice(0, 2).join(" | ")}`);
console.log(fail ? `${fail} FAILED` : "ALL PASS");
await browser.close(); process.exit(fail ? 1 : 0);
