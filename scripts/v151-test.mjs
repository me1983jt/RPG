// v15.1: 3 save slots + autosave on town enter/leave, old saves still load; phone-size shots of slots + a combat turn.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.V151OUT || "/workspace/maine-rpg/beta30-shots/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 915, v14: true });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const wait = (ms) => page.waitForTimeout(ms);
const keys = () => page.evaluate(() => Object.keys(localStorage));
const toMenu = async () => { await page.reload({ waitUntil: "networkidle" }); await wait(2500); };

ok((await page.locator('[data-testid^="slot-"]').count()) === 3, "three save slots on the start screen");
await page.getByTestId("slot-3").click(); await wait(200);
ok((await page.getByTestId("slot-3").getAttribute("aria-checked")) === "true", "slot 3 selected");
await begin();
await T("saveNow"); await wait(200);
ok((await keys()).includes("maine-rpg-save-v2-s3"), "slot 3 saves under its own key");
// autosave on entering and leaving a town
await page.evaluate(() => localStorage.removeItem("maine-rpg-save-v2-auto"));
await T("v15Open", "harmony"); await wait(300);
let a = await page.evaluate(() => JSON.parse(localStorage.getItem("maine-rpg-save-v2-auto") || "null"));
ok(a && a.autoSlot === 3 && /Entered/.test(a.autoWhere), `autosave on entering town (${a?.autoWhere})`);
const t1 = a?.savedAt ?? 0; await wait(50);
await T("v15Leave"); await wait(300);
a = await page.evaluate(() => JSON.parse(localStorage.getItem("maine-rpg-save-v2-auto") || "null"));
ok(a && /Left/.test(a.autoWhere) && a.savedAt > t1, `autosave on leaving town (${a?.autoWhere})`);
// autosave restores into its slot
const p0 = await T("getPos");
await toMenu();
ok(await page.getByTestId("slot-auto").isVisible(), "autosave entry on the start screen");
ok((await page.getByTestId("slot-3").textContent()).includes("Justin"), "slot 3 label shows the save");
await page.getByTestId("slot-auto").scrollIntoViewIfNeeded(); await page.evaluate(() => document.querySelector('[data-testid="save-slots"]')?.scrollIntoView({ block: "center" })); await wait(300);
await page.screenshot({ path: out + "v151-save-slots.png" });
await page.getByTestId("slot-1").click(); await wait(200);
await page.getByTestId("slot-auto").click(); await wait(2500);
const d = await T("dbg");
const p1 = await T("getPos");
ok(d.phase === "play" && Math.hypot(p1.x - p0.x, p1.y - p0.y) < 200, `autosave loads back into play (slot ${await page.evaluate(() => localStorage.getItem("maine-rpg-slot"))})`);
// old saves: the pre-slot key and a save without savedAt still load into slot 1
await page.evaluate(() => { const raw = JSON.parse(localStorage.getItem("maine-rpg-save-v2-s3")); delete raw.savedAt; localStorage.clear(); localStorage.setItem("tote-road-save-v2", JSON.stringify(raw)); });
await toMenu();
ok((await page.getByTestId("slot-1").textContent()).includes("Justin"), "beta v1 save key migrates into slot 1");
await page.getByRole("button", { name: "Continue" }).click(); await wait(2500);
ok((await T("dbg")).phase === "play", "old save continues");
// a combat turn at phone size
await T("v14Set", { st: 5 });
await page.evaluate(() => { window.__wmEnc = 1; window.__controlsTest.l141Calm?.(); window.__controlsTest.choose?.("close"); });
ok(await T("testScenario", "turnbased") === "ok", "turn-based scenario");
let s; for (let i = 0; i < 80; i++) { s = await T("tb15"); if (!s.on || s.mine) break; await wait(150); }
ok(s.on && s.mine, `your turn: AP ${s.ap}/${s.maxAp}`);
await page.screenshot({ path: out + "v151-combat-turn.png" });
if (s.foes?.[0]) { const pop = await T("tb15Popup", s.foes[0].id); await wait(400); ok(pop && pop.parts.length === 6, `aimed popup (odds depend on range): ${pop?.parts.map((p) => p.label + " " + p.hit + "%").join(", ")}`); await page.screenshot({ path: out + "v151-aimed-popup.png" }); }
ok(!errs.some((e) => /pageerror/.test(e)), "no page errors " + errs.filter((e) => /pageerror/.test(e)).join(" | ").slice(0, 200));
console.log(fail ? `${fail} failed` : "all passed");
await browser.close();
process.exit(fail ? 1 : 0);
