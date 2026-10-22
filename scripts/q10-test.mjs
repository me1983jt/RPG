import { boot } from "./v4-lib.mjs";
const [url = process.env.Q10URL || "http://127.0.0.1:8110/", vw = "1280", vh = "800"] = process.argv.slice(2);
const out = process.env.Q10OUT || "/workspace/maine-rpg/beta16-shots/";
const { browser, page, errs, T, begin } = await boot(url, { vw: +vw, vh: +vh });
const R = {}; const fail = [];
const wait = (ms) => page.waitForTimeout(ms);
const Q = () => T("q10State");
const check = (name, ok, info) => { R[name] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(name + " " + JSON.stringify(info ?? "")); };
const closeDlg = async () => { const d = await T("dialogueNow"); if (d) { await T("choose", "close"); await page.waitForTimeout(150); } };
const goSpot = async (key, dx = 0, dy = 0) => { await closeDlg(); const s = await T("q10Spot", key); await T("setPos", s.x + dx, s.y + dy); await wait(500); return s; };
const away = async () => { const p = await T("getPos"); await T("setPos", p.x + 900, p.y); await wait(250); };
const pick = async (id) => { const d = await T("dialogueNow"); if (!d || !d.choices.some((c) => c.id === id)) { fail.push(`no choice ${id}: ${JSON.stringify(d)}`); return false; } await T("choose", id); await wait(250); return true; };
const talk = async (role) => { await closeDlg(); const n = await T("npcOf", role); await T("setPos", n.x + 50, n.y + 50); await wait(250); await T("talk", role); await wait(250); };
const killTag = async (pred) => { for (const e of await T("enemies")) if (!e.dead && pred(e)) await T("strike", e.id, 9999); await wait(300); };

await begin();
// --- regression: First Snow + Mira still work
await T("talk", "justin"); await pick("snow-accept"); await T("addWood", 3); await talk("sarah"); await pick("snow-wood"); await talk("sarah"); await pick("snow-done");
check("firstSnow", (await T("questState")).snow === 3);
await talk("mira"); await pick("accept"); check("miraAccept", (await T("questState")).quest === 1);
await T("setQuest", 0);
await T("setZoom", 1.0);

// --- take on four quests from the family, then the journal
await talk("sarah"); await pick("q10-seed-ask"); await pick("q10-seed-accept");
await talk("sarah"); await pick("q10-ferry-ask"); await pick("q10-ferry-accept");
await talk("cyndal"); await pick("q10-radio-ask"); await pick("q10-radio-accept");
await talk("sarah"); await pick("q10-moose-ask"); await pick("q10-moose-accept");
await wait(4500);
await page.getByRole("button", { name: "Journal" }).first().click(); await wait(600);
await page.screenshot({ path: out + "01-quest-log.png" });
await page.getByRole("button", { name: "Journal" }).first().click(); await wait(300);
// --- 1 Seed Run
check("seed1", (await Q()).seed === 1);
await goSpot("coop", 0, 200); await T("setZoom", .9); await wait(700);
let q = await Q(); check("seed2-arrive", q.seed === 2 && q.seedLeft === 4, q);
await wait(1500); await page.screenshot({ path: out + "02-seedrun-coop-fight.png" });
await killTag((e) => e.id >= 96000);
q = await Q(); check("seed3-cleared", q.seed === 3, q);
await goSpot("coopBins"); await wait(300); await pick("q10-seed-take");
check("seed4", (await Q()).seed === 4);
await talk("sarah"); await pick("q10-seed-done");
q = await Q(); check("seed5-done", q.seed === 5 && (await T("countOf", "stew")) >= 2, { q, stew: await T("countOf", "stew") });

// --- 2 Kennebec Crossing
for (const k of ["planks", "rope", "winch"]) { await away(); await goSpot(k); await pick(`q10-take-${k}`); }
q = await Q(); check("ferry-parts", q.planks && q.rope && q.winch && q.ferry === 2, q);
await away(); await goSpot("ferry", 0, 40); await T("setZoom", 1.15); await wait(400);
await pick("q10-ferry-fix"); await wait(4500); await T("pressBack").catch(() => {}); await wait(200); if ((await T("dbg")).phase !== "play") { await T("pressBack").catch(() => {}); await wait(200); }
await page.screenshot({ path: out + "03-ferry-landing.png" });
check("ferry-done", (await Q()).ferry === 3);
await away(); await goSpot("ferry"); await pick("q10-ferry-cross"); await wait(800);
let mi = await T("mapInfo"); check("ferry-cross-map1", mi.id === 1, mi);
const g = mi.gates[0]; await T("setPos", g.tx * 64 + 32, g.ty * 64 + 32); await wait(2500);
mi = await T("mapInfo"); check("back-home-map0", mi.id === 0, { id: mi.id });

// --- 4 Cyndal's Radio
for (let i = 0; i < 3; i++) { await away(); await goSpot(`part${i}`); await pick(`q10-part-${i}`); }
check("radio-parts", (await Q()).radio === 2);
await talk("cyndal"); await page.screenshot({ path: out + "04-cyndal-radio.png" }); await pick("q10-radio-done");
check("radio-done", (await Q()).radio === 3);
await T("giveIron", 20); await talk("cyndal"); await pick("q10-trader"); await page.screenshot({ path: out + "05-radio-trader.png" });
const j0 = await T("countOf", "jerky"); await pick("q10-buy-jerky");
check("trader-buy", (await T("countOf", "jerky")) === j0 + 1);

// --- 5 Moose Season
await goSpot("bog", 0, 150); await wait(600);
check("moose2", (await Q()).moose === 2);
await killTag((e) => e.kind === "moose" && e.id >= 96000);
check("moose3", (await Q()).moose === 3);
const bog = await T("q10Spot", "bog"); const farm = await T("npcOf", "sarah");
await T("setPos", bog.x + (farm.x - bog.x) * .5, bog.y + (farm.y - bog.y) * .5); await wait(700);
const bear = (await T("enemies")).find((e) => e.variant === "bear");
check("bear-spawn", !!bear && (await Q()).bearDone, bear);
await wait(1200); await page.screenshot({ path: out + "06-moose-bear.png" });
await killTag((e) => e.variant === "bear");
await T("setPos", farm.x + 60, farm.y + 60); await wait(700);
check("moose4", (await Q()).moose === 4);
const m0 = await T("countOf", "meat"); await talk("sarah"); await pick("q10-moose-done");
check("moose-done", (await Q()).moose === 5 && (await T("countOf", "meat")) >= m0 + 6, { meat: await T("countOf", "meat") });

// --- 3 Lost Dog (after a story raid night)
await T("setHour", 22); const started = await T("startRaidNow"); await wait(300); await T("q10EndRaid", true); await wait(300);
check("dog1-after-raid", started && (await Q()).dog === 1, await Q());
await T("setHour", 10);
await talk("loki"); await pick("q10-dog-accept");
const n = 8;
for (let i = 0; i < n - 1; i++) { await goSpot(`trail${i}`); if (i === 2) { await T("setZoom", .8); await wait(300); await page.screenshot({ path: out + "07-lost-dog-tracks.png" }); await T("setZoom", 1); } }
q = await Q(); check("dog-trail", q.dog === 2 && q.dogStep === n - 1, q);
await away(); await goSpot(`trail${n - 1}`); await T("setZoom", 1.3); await wait(300); await pick("q10-dog-found");
{ const lk = await T("npcOf", "loki"); await T("walkStraight", lk.x, lk.y + 400); await wait(2600); await T("setKeys", []); await wait(300); await page.screenshot({ path: out + "08-biscuit-follows.png" }); }
check("dog3", (await Q()).dog === 3);
await talk("loki"); await wait(400); const dogNear = await T("q10Dog"); await pick("q10-dog-done");
check("dog-done", (await Q()).dog === 4 && !!dogNear, dogNear);

// --- reload persistence
await T("setZoom", 1);
await page.getByRole("button", { name: "Journal" }).first().click(); await wait(600);
await page.screenshot({ path: out + "09-quest-log-all-done.png" });
await page.getByRole("button", { name: "Journal" }).first().click();
await T("saveNow"); await page.reload({ waitUntil: "networkidle" }); await wait(2000);
await page.getByRole("button", { name: "Continue" }).click(); await wait(2000);
q = await Q(); check("reload-keeps-q10", q.seed === 5 && q.ferry === 3 && q.radio === 3 && q.moose === 5 && q.dog === 4, q);

// --- Raid Mode still works
await page.reload({ waitUntil: "networkidle" }); await wait(2000);
await page.getByRole("button", { name: "Raid Mode" }).click(); await wait(2500);
for (let i = 0; i < 400; i++) {
  const st = await T("raidState"); if (st.none) break;
  for (const e of await T("enemies")) if (!e.dead && ["scout", "jumper", "torch", "shield", "brute", "armor", "atv", "fur", "mask", "saw"].includes(e.variant)) await T("strike", e.id, 999);
  await wait(400);
}
await wait(800);
check("raidMode-win", (await page.getByText(/the farm held/).count()) > 0);
R.fail = fail; R.errs = errs;
console.log(JSON.stringify(R, null, 1));
await browser.close();
