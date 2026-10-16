// v13.2: automated playthrough of "The Long Winter" through the real dialogue buttons, a real first
// raid, real camp raids (with fights when stealth fails), the depot trip, and every ending from one
// save made at Act 7. Side quests are played by q11-test/q10-test; here we check they feed the story.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = "/workspace/maine-rpg/beta25-shots/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 800, live: true });
const R = {}; const fail = []; const steps = [];
const wait = (ms) => page.waitForTimeout(ms);
const check = (n, ok, info) => { R[n] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(n + " " + JSON.stringify(info ?? "").slice(0, 300)); };
const S = () => T("v13State");
const act = async () => (await S()).main.act;
const click = async (id) => {
  const d = await T("dialogueNow"); const c = d?.choices.find((x) => x.id === id);
  if (!c) { steps.push(`missing ${id} in ${d?.speaker}: ${d?.choices.map((x) => x.id).join(",")}`); return false; }
  await page.getByRole("button", { name: c.label, exact: true }).first().click(); await wait(250); return true;
};
const closeAll = async () => { for (let i = 0; i < 6; i++) { const d = await T("dialogueNow"); if (!d) return; const c = d.choices.find((x) => x.id === "close") ?? d.choices[d.choices.length - 1]; await page.getByRole("button", { name: c.label, exact: true }).first().click(); await wait(150); } };
const talk = async (role) => { await closeAll(); const n = await T("npcOf", role); if (!n) { steps.push(`no npc ${role}`); return false; } await T("setPos", n.x + 50, n.y + 40); await wait(250); await T("talk", role); await wait(300); return !!(await T("dialogueNow")); };
const fight = async (pred, rounds = 40) => { for (let i = 0; i < rounds; i++) { const es = (await T("enemies")).filter((e) => !e.dead && pred(e)); if (!es.length) return true; for (const e of es) await T("strike", e.id, 9999); await wait(200); } return false; };
const fightRaid = async () => { for (let i = 0; i < 300; i++) { const r = await T("raidState"); if (r.none) return true; await fight((e) => e.kind === "bandit", 1); await T("addTime", 5); await wait(150); } return false; };

await begin();
await talk("justin"); await click("snow-accept"); await closeAll(); await T("addWood", 3);
await talk("justin"); await click("snow-wood"); await talk("sarah"); await click("snow-done"); await closeAll();
// ---- Act 1: survive a real raid night
await T("setHour", 21); await T("startRaidNow"); await wait(300);
check("act1-raid-held", await fightRaid());
await T("setHour", 9); await wait(500);
check("act1", (await act()) === 2, (await S()).main);
await page.screenshot({ path: out + "p1-act2.png" });
// ---- Act 2
await talk("cyndal"); await click("v13-main-intro"); await closeAll();
await talk("cyndal"); await click("v13-main-signal"); await closeAll(); await wait(300);
check("act2", (await act()) === 3, (await S()).main);
// ---- Act 3
for (let i = 0; i < 8 && ((await S()).loyal.jack ?? 0) < 30; i++) { await T("addIron", 3); await talk("cal"); await click("v13-jack"); await closeAll(); }
check("jack-trust-30", (await S()).loyal.jack >= 30, (await S()).loyal);
await talk("cal"); await click("v13-main-jack"); await closeAll(); await wait(300);
check("act3", (await act()) === 4, (await S()).main);
// ---- Act 4
await T("v3Travel", 2); await wait(2500);
await talk("marcel"); await click("v13-main-marcel"); await closeAll(); await wait(300);
check("act4", (await act()) === 5, (await S()).main);
// ---- Act 5
for (const [id, map] of [["camp2", 2], ["camp1", 1], ["camp0", 0]]) {
  if ((await S()).mapId !== map) { await T("v3Travel", map); await wait(2500); }
  await T("setHour", 23); await wait(200);
  const sp = await T("v13CampSpot", id); await T("setPos", sp.x + 3 * 64, sp.y + 2 * 64); await wait(900);
  const d = await T("dialogueNow");
  if (d && d.choices.some((c) => c.id === `v13-camp-${id}`)) await click(`v13-camp-${id}`); else steps.push(`no camp prompt ${id}: ${JSON.stringify(d)?.slice(0, 120)}`);
  await closeAll();
  await fight((e) => /lieutenant|guard/i.test(e.name), 20);
  await wait(300);
  steps.push(`${id}: lt ${(await S()).main.ltKills}`);
}
check("act5-lieutenants", (await S()).main.ltKills >= 3, (await S()).main);
await T("v13Tick"); check("act5", (await act()) === 6, (await S()).main);
// ---- Act 6
if ((await S()).mapId !== 1) { await T("v3Travel", 1); await wait(2500); }
const dep = await T("v13DepotSpot"); await T("setPos", dep.x + 60, dep.y + 60); await wait(1200);
check("act6", (await act()) === 7, (await S()).main);
await T("v3Travel", 0); await wait(2500);
// ---- Act 7: one save, every ending
await T("saveNow");
const snap = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))));
const restore = async () => {
  await page.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(JSON.parse(s))) localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, snap);
  await page.reload({ waitUntil: "networkidle" }); await wait(2500);
  await page.getByRole("button", { name: /Continue/ }).first().click(); await wait(2500);
};
const endingShot = async (name) => { await wait(400); const vis = await page.getByTestId("ending-screen").isVisible(); if (vis) await page.screenshot({ path: out + `p-ending-${name}.png` }); return vis; };
const siegeFight = async (win) => {
  await talk("justin"); await click("v13-main-siege"); await wait(500);
  if (!win) { await T("v13SiegeEnd", false); return; }
  for (let i = 0; i < 400; i++) { const r = await T("raidState"); if (i % 15 === 0 || r.none) steps.push(`siege ${i}: ${JSON.stringify(r).slice(0, 160)} foes ${JSON.stringify((await T("enemies")).filter((e) => !e.dead).map((e) => e.name + ':' + e.variant + ':' + e.kind)).slice(0, 200)}`); if (r.none) break; await fight((e) => e.kind === "bandit" || e.variant === "collector", 1); await T("addTime", 5); await wait(120); }
  await T("v13Tick");
};
await talk("sarah"); await click("v13-main-choose"); await click("v13-main-deal"); await closeAll(); await T("v13Tick"); await T("v13Tick");
check("ending-deal", (await S()).main.ending === "deal", (await S()).main); check("ending-deal-screen", await endingShot("deal"));
await restore();
await talk("sarah"); await click("v13-main-choose"); await click("v13-main-alone"); await closeAll(); await T("v13Tick");
check("act7-alone", (await act()) === 8, (await S()).main);
await siegeFight(true);
check("ending-alone", (await S()).main.ending === "alone", (await S()).main); check("ending-alone-screen", await endingShot("alone"));
await restore();
await talk("sarah"); await click("v13-main-choose"); await click("v13-main-alone"); await closeAll(); await T("v13Tick");
await siegeFight(false); await T("v13Tick");
check("ending-fallen", (await S()).main.ending === "fallen", (await S()).main); check("ending-fallen-screen", await endingShot("fallen"));
await restore();
await T("addWood", 30); await T("addStone", 12); await T("addIron", 20);
await talk("sarah"); await click("v13-rebuild"); await click("v13-rebuild-store"); await closeAll();
for (const c of ["justin", "sarah", "jack", "mira", "marcel"]) if (((await S()).loyal[c] ?? 0) < 25) await T("v13Set", { loyal: { [c]: 25 } });
await talk("sarah"); await click("v13-main-choose"); const u = await click("v13-main-unite"); await closeAll(); await T("v13Tick");
check("unite-offered", u);
await siegeFight(true);
check("ending-union", (await S()).main.ending === "union", (await S()).main); check("ending-union-screen", await endingShot("union"));
check("no page errors", errs.filter((e) => !/favicon/.test(e)).length === 0, errs.slice(0, 5));
console.log(JSON.stringify(R, null, 1)); console.log("steps:", JSON.stringify(steps, null, 1)); console.log("fails:", JSON.stringify(fail, null, 1));
console.log(`${Object.values(R).filter((v) => v === "PASS").length}/${Object.keys(R).length}`);
await browser.close();
