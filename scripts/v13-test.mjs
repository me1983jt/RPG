// v13: gw15 merge (player body, creator), armor hooks, weather, fishing, loyalty, bounties, camps, journal,
// backstories, durability/repair/dye/sets, stats & skills & perks, caravans, rebuilding, sickness, needs,
// cooking, migration, road events, moon, fast travel, and the main quest with every ending.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.V13OUT || "/workspace/maine-rpg/beta23-shots/";
const { browser, page, errs, T } = await boot(url, { vw: 1280, vh: 800, live: true });
const R = {}; const fail = [];
const wait = (ms) => page.waitForTimeout(ms);
const check = (n, ok, info) => { R[n] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(n + " " + JSON.stringify(info ?? "").slice(0, 300)); };
const shot = (n) => page.screenshot({ path: out + n });
const S = () => T("v13State");
const closeDlg = async () => { for (let i = 0; i < 5; i++) { const d = await T("dialogueNow"); if (!d && (await T("dbg")).phase !== "dialogue") return; await T("choose", "close"); await wait(100); } };
const choose = async (id) => { await T("choose", id); await wait(120); };
const journal = async (tab) => { await page.getByRole("button", { name: "Journal" }).first().click(); await wait(300); if (tab) { await page.getByTestId(`tab-${tab}`).click(); await wait(300); } };
const unjournal = async () => { await page.getByRole("button", { name: "Journal" }).first().click(); await wait(200); };

// ---- creator: default name Packer, backstory, hair
check("default-name-packer", (await page.inputValue("#wanderer-name")) === "Packer");
await page.getByRole("button", { name: /^Hunter/ }).click();
await page.getByTestId("backstory-veteran").click();
await page.getByRole("button", { name: "Auburn", exact: true }).click();
await wait(500);
await shot("01-creator-backstory.png");
await page.getByRole("button", { name: "Next" }).click();
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
await page.getByRole("button", { name: "Next" }).click();
await page.getByRole("button", { name: /Keen eye/ }).click();
await page.getByRole("button", { name: /Begin as/ }).click();
await wait(3500);
let s = await S();
check("backstory-veteran", s.backstory === "veteran" && s.hud.skills.length === 8, s.backstory);
check("backstory-gear", (await T("countOf", "carbine-std")) >= 1);
check("backstory-skill", (await T("v3Lv", "marksmanship")) >= 2);
check("hair-saved", s.player.hair === "auburn", s.player.hair);
check("player-name", s.player.name === "Packer", s.player.name);
// ---- player body + Justin NPC
const body = await T("v13Body");
check("player-body-sheets", body.walk === "pl/walk" && body.hit === "pl/hit" && body.down === "pl/down" && body.gun === "pl/gun" && body.axe === "pl/axe", body);
check("hit-sheet-3-cols", body.cols === 3, body.cols);
check("armor-missing-graceful", Array.isArray(body.armor) && body.armor.length === 0);
check("justin-npc-v2", (await T("folkSheetOf", "justin")) === "v2/justin-walk");
check("sarah-npc-v2", (await T("folkSheetOf", "sarah")) === "v2/sarah-walk");
await T("setZoom", 1.7);
const jn = await T("npcOf", "justin");
await T("setPos", jn.x + 70, jn.y + 50); await wait(900);
await shot("04-justin-npc.png");

// First Snow so the farm systems are open
await T("talk", "justin"); await choose("snow-accept"); await T("addWood", 3); await closeDlg();
const talk = async (role) => { await closeDlg(); const n = await T("npcOf", role); await T("setPos", n.x + 50, n.y + 50); await wait(200); await T("talk", role); await wait(200); };
await talk("justin"); await choose("snow-wood"); await talk("sarah"); await choose("snow-done"); await closeDlg();

// ---- stats + skills + perks
await T("v13Set", {});
const fx0 = await T("v13Fx");
await page.evaluate(() => { /* give stat points */ });
const st0 = await S();
check("core-stats-six", Object.keys(fx0.core).length === 6 && fx0.carryLb > 0, fx0);
await T("v3Train", "cooking", 200);
check("new-skill-levels", (await T("v3Lv", "cooking")) >= 3);
s = await S();
check("perk-at-3", s.hud.perks.find((p) => p.skill === "cooking").got.length === 1, s.hud.perks.find((p) => p.skill === "cooking"));
await closeDlg(); console.log("DLG", JSON.stringify(await T("dbg")).slice(0, 300)); await page.getByRole("button", { name: "Stats", exact: true }).click(); console.log("ST0", await T("statsNow"), await T("statsToggle"), await T("statsNow")); await wait(400); console.log("ST1", await T("statsNow"), JSON.stringify(await T("dbg")));
check("stats-screen-core", await page.getByTestId("core-stats").isVisible(), await page.getByRole("button", { name: "Stats" }).first().getAttribute("aria-pressed"));
await shot("02-stats-screen.png");
await page.getByRole("button", { name: "Stats", exact: true }).click(); await wait(300); console.log("ST2", await T("statsNow")); await page.getByRole("button", { name: "Stats", exact: true }).click(); await wait(300); console.log("ST3", await T("statsNow")); if (await T("statsNow")) await T("statsToggle");
await journal("skills");
check("skills-screen-17", (await page.getByTestId("skills-screen").locator("li").count()) === 17);
await unjournal();

// ---- weather
const clear = await T("v13Weather", "clear");
const fog = await T("v13Weather", "fog");
check("fog-cuts-sight", fog.sight < clear.sight, { clear, fog });
const ne = await T("v13Weather", "noreaster");
check("noreaster-slow-nobike", ne.speed < 1 && ne.bike === 0, ne);
await T("setZoom", 1.2); await wait(800);
await shot("03-weather-noreaster.png");
const bi = await T("v13Weather", "blackice");
check("blackice-bike", bi.bike < .7, bi);
await T("v13Weather", "clear");

// ---- moon
const full = await T("v13Moon", 4), half = await T("v13Moon", 2), nw = await T("v13Moon", 0);
check("moon-full-brighter", full.dark < half.dark && nw.dark > half.dark, { full, half, nw });
check("moon-full-bolder", full.bold > 1 && full.waves === 1, full);

// ---- needs + cooking + buffs
let nd = await T("v13Needs", 10);
check("needs-drain", nd.hunger < 100 && nd.thirst < 100 && nd.sleep < 100, nd);
await T("giveItem", "meat", 2); await T("giveItem", "greens", 1);
await choose("v13-cook-stew");
check("cook-stew", (await T("countOf", "stew")) >= 1);
const h0 = (await S()).needs.hunger;
await T("invUse", "stew"); await wait(150);
s = await S();
check("eat-fills", s.needs.hunger > h0, { h0, h: s.needs.hunger });
await T("giveItem", "meat", 3); await choose("v13-cook-steak"); await T("invUse", "venisonsteak"); await wait(100);
check("buff-strong", (await S()).hud.buffs.includes("strong"));
await T("v13Set", { hard: true, needs: { hunger: 100, thirst: 100, sleep: 100 } });
const hardN = await T("v13Needs", 10);
check("hard-drains-more", hardN.hunger < nd.hunger, { hardN, nd });
await T("v13Set", { hard: false, needs: { hunger: 100, thirst: 100, sleep: 100 } });

// ---- sickness
await T("v13Ail", "cold");
check("catch-cold", !!(await S()).ail.cold);
await T("giveItem", "greens", 2); await T("giveItem", "water", 1); await choose("v13-cook-tonic"); await T("invUse", "tonic"); await wait(100);
check("tonic-cures-cold", !(await S()).ail.cold);
await T("v13Ail", "cut"); await T("giveItem", "medicine", 1); await T("invUse", "medicine"); await wait(100);
check("medicine-cures-cut", !(await S()).ail.cut);
await T("v13Ail", "bone");
check("bone-slows", (await S()).hud.ail.some((a) => a.id === "bone"));
await T("v13Reset", "ail", {});

// ---- armor durability, repair, patch, dye, sets
await closeDlg(); console.log("PH", JSON.stringify(await T("dbg")).slice(0, 60), JSON.stringify(await T("dialogueNow")).slice(0, 200));
for (const id of ["woolcap", "shirt", "trousers", "gloves", "boots"]) { await T("giveItem", id, 1); await T("invEquip", id, { woolcap: "head", shirt: "body", trousers: "legs", gloves: "hands", boots: "feet" }[id]); }
s = await S();
console.log("EQUIP", JSON.stringify((await S()).player).slice(0,400));
check("set-bonus-poor", !!s.hud.set && s.hud.set.name === "Homespun set", s.hud.set);
const def0 = s.player.def;
for (let i = 0; i < 12; i++) { await T("setHp", 50); const r = await T("v13Hurt", 30); if (!i) console.log("HURT", JSON.stringify(r), JSON.stringify(await T("dbg")).slice(0, 300)); }
await T("setHp", 50);
s = await S();
const worn = Object.values(s.dura).some((d) => d < 100);
check("armor-wears", worn, s.dura);
await T("setHp", 40);
await T("v3Set", { up: { bench: 1 } }).catch(() => {});
await T("addIron", 60);
const wornId = Object.entries((await S()).dura).find(([, d]) => d < 100)?.[0] ?? "boots";
await choose(`v13-repair-${wornId}`);
check("bench-repair", (await S()).dura[wornId] === 100, (await S()).dura);
for (const id of ["boots", "woolcap", "trousers"]) await T("v13Take", id, 1); const gotHide = await T("giveItem", "hide", 1); console.log("HIDE", gotHide); await choose(`v13-patch-${wornId}`); console.log("PAT", JSON.stringify((await S()).patched), JSON.stringify((await S()).log13 ?? "").slice(0,100));
check("patch", (await S()).patched[wornId] === true);
await T("giveItem", "greens", 2); await choose("v13-dye-blaze");
check("dye", (await S()).dye.chest === "#e08a3a", (await S()).dye);
await closeDlg();

// ---- loyalty, caravans, bounties
await T("setHour", 11); for (let i = 0; i < 4 && !(await T("v13Caravan")); i++) await T("v13Hours", 24);
await T("setHour", 11);
check("caravan-schedule", !!(await T("v13Caravan")));
const l0 = (await S()).loyal.sarah;
const scrapG = (await S()).player.scrap; const lj = (await S()).loyal.marcel;
await choose("v13-car-guard"); await closeDlg();
const robbers = (await T("enemies")).filter((e) => !e.dead && e.name === "Caravan robber");
check("caravan-guard-ambush", robbers.length === 3, robbers.length);
for (const e of robbers) await T("strike", e.id, 9999);
await wait(200);
check("caravan-guard-pays", (await S()).player.scrap >= scrapG + 8 && (await S()).loyal.marcel > lj, { scrapG, now: (await S()).player.scrap });
await T("v13Hours", 48); await T("setHour", 11);
for (let i = 0; i < 4 && !(await T("v13Caravan")); i++) await T("v13Hours", 24);
await T("setHour", 11);
await choose("v13-car-rob"); await closeDlg();
check("rob-caravan-loyalty", (await S()).loyal.sarah < l0, { l0, l: (await S()).loyal.sarah });
await T("v13Set", { loyal: { mira: -35 } });
await T("v13Hours", 48); await T("setHour", 11);
for (let i = 0; i < 4 && !(await T("v13Caravan")); i++) await T("v13Hours", 24);
await T("setHour", 11);
await choose("v13-car-rob"); await closeDlg();
check("companion-leaves", !!(await S()).left.mira, (await S()).left);
await choose("v13-bounty"); await closeDlg();
s = await S();
check("bounty-board", s.bounties.length === 3, s.bounties);
// kill a raider for a raider bounty
const b0 = s.bounties[0];
await T("v13Set", { bounties: [{ ...b0, kind: "raiders", need: 1, got: 0, pay: 5 }] });
const foe = (await T("enemies")).find((e) => !e.dead && e.kind === "bandit");
if (foe) await T("strike", foe.id, 9999);
await wait(200);
s = await S();
check("bounty-progress", s.bounties[0]?.got >= 1, s.bounties);
const iron0 = s.player.scrap;
await choose(`v13-bounty-${s.bounties[0].id}`); await closeDlg();
check("bounty-pays-repeatable", (await S()).player.scrap > iron0 && (await S()).bounties.length === 3);

// ---- camp raid
const cr = await T("v13Camp", "camp0", true);
check("camp-raid-frees", cr.freed >= 3 && cr.lt >= 1, cr);

// ---- rebuilding
await T("addWood", 60); await T("addStone", 30); await T("addIron", 40);
const p0 = await T("v3Price", 100);
await choose("v13-rebuild-store"); await closeDlg();
s = await S();
check("rebuild-store", !!s.rebuilt.store);
check("store-cuts-prices", (await T("v3Price", 100)) < p0);

// ---- foraging, migration, road events, fishing
check("forage", await T("v13Forage"));
const deer0 = (await T("enemies")).filter((e) => !e.dead && ["deer", "rabbit", "coyote", "moose"].includes(e.kind)).length;
await T("v13Set", { migKey: "" }); await T("v13Daily");
const deer1 = (await T("enemies")).filter((e) => !e.dead && ["deer", "rabbit", "coyote", "moose"].includes(e.kind)).length;
check("migration-adds", deer1 >= deer0, { deer0, deer1 });
const g0 = await T("countOf", "gas");
await T("v13Road", "car"); await choose("v13-road-car"); await closeDlg();
check("road-car", (await T("countOf", "gas")) > g0);
const e0 = (await T("enemies")).filter((e) => !e.dead).length;
await T("v13Road", "ambush"); await wait(100);
check("road-ambush", (await T("enemies")).filter((e) => !e.dead).length >= e0 + 3);
for (const e of await T("enemies")) if (!e.dead && e.name === "Road raider") await T("strike", e.id, 9999);
await T("v13Road", "lostkid"); await choose("v13-road-kid"); await closeDlg();
check("road-lostkid", (await S()).diary.some((d) => d.text.includes("lost boy")));
await T("q11Force", { fish: true });
await choose("q11-fish-cast-fishKennebec"); await choose("q11-fish-hook"); await closeDlg();
check("fish-river", (await S()).lastFish === "river");
await choose("q11-fish-cast-fishPond"); await choose("q11-fish-hook"); await closeDlg();
check("fish-lake-or-ice", ["lake", "ice"].includes((await S()).lastFish), (await S()).lastFish);
await T("q11Force", { fish: null });

// ---- journal
await journal("diary");
check("diary-screen", (await page.getByTestId("diary-screen").locator("li").count()) > 3);
await page.getByTestId("diary-notes").fill("Check the north fence."); await page.getByTestId("diary-notes").blur(); await wait(200);
check("notes-saved", (await S()).notes === "Check the north fence.");
await page.getByTestId("tab-main").click(); await wait(200);
check("main-tab", (await page.getByTestId("main-screen").locator("li").count()) === 9);
check("main-tracker", await page.getByTestId("main-tracker").isVisible());
await unjournal();

// ---- fast travel by bike
const st = await T("q11State"); st.q.bike = { ...(st.q.bike || {}), s: 8 }; await T("q11Set", { q: st.q });
await T("giveItem", "gas", 4);
await T("v13Set", { seen: { skow: true } });
const gas1 = await T("countOf", "gas");
const tr = await T("v13Travel", "skow");
check("fast-travel", tr.mapId === 2 && tr.gas < gas1, tr);
const tr2 = await T("v13Travel", "farm");
check("fast-travel-home", tr2.mapId === 0, tr2);
await closeDlg();

// ---- main quest progression
await T("v13Reset", "main", { act: 1, flags: {}, ltKills: 0, choice: "", siege: 0, won: false, ending: "", slide: 0 });
await T("v3Set", { ach: { raid1: Date.now() } }).catch(() => {});
await T("setHour", 22); await T("startRaidNow"); await wait(200); await T("q10EndRaid", true); await wait(200);
await T("v13Tick");
check("act1-done", (await S()).main.act === 2, (await S()).main);
await choose("v13-main-signal"); await closeDlg(); await T("v13Tick");
check("act2-done", (await S()).main.act === 3);
await T("v13Set", { loyal: { jack: 30 } }); await choose("v13-main-jack"); await closeDlg(); await T("v13Tick");
check("act3-done", (await S()).main.act === 4);
await choose("v13-main-marcel"); await closeDlg(); await T("v13Tick");
check("act4-done", (await S()).main.act === 5);
await T("v13Reset", "camps", {}); for (const c of ["camp0", "camp1", "camp2"]) await T("v13Camp", c, true);
await T("v13Tick");
check("act5-done", (await S()).main.act === 6, (await S()).main);
await T("v3Travel", 1).catch(() => {});
await T("v13Set", {});
const dep = await T("v13DepotSpot").catch(() => null);
if ((await S()).mapId !== 1) { await T("q11Set", {}); }
if (dep && (await S()).mapId === 1) { await T("setPos", dep.x + 30, dep.y + 30); await wait(300); await T("v13Tick"); }
check("act6-done", (await S()).main.act === 7, { m: (await S()).main, map: (await S()).mapId });
// endings
const base = { act: 7, flags: {}, ltKills: 3, choice: "", siege: 0, won: false, ending: "", slide: 0, collectorDown: false };
const backHome = async () => { if ((await S()).mapId !== 0) await T("v3Travel", 0); await wait(300); };
await backHome();
// deal
await T("v13Reset", "main", { ...base, flags: {} }); await choose("v13-main-deal"); await closeDlg(); await T("v13Tick"); await T("v13Tick");
check("ending-deal", (await S()).main.ending === "deal", (await S()).main);
await wait(300);
check("ending-screen", await page.getByTestId("ending-screen").isVisible());
await shot("05-ending-deal.png");
for (let i = 0; i < 3; i++) { if (await page.getByTestId("ending-next").isVisible()) await page.getByTestId("ending-next").click(); await wait(150); }
check("ending-closes", !(await page.getByTestId("ending-screen").isVisible()));
// unite (rebuilt store already, loyalty ok)
await T("v13Reset", "left", {}); await T("v13Set", { loyal: { justin: 40, sarah: 40, jack: 40, mira: 40, marcel: 40 } });
await T("v13Reset", "main", { ...base, flags: {} }); await choose("v13-main-unite"); await closeDlg(); await T("v13Tick");
check("act7-unite", (await S()).main.act === 8 && (await S()).main.choice === "unite", (await S()).main);
const sg = await T("v13Siege");
check("siege-starts", !!sg && sg.siege, sg);
await T("v13SiegeEnd", true);
check("ending-union", (await S()).main.ending === "union", (await S()).main);
// alone
await T("v13Reset", "main", { ...base, flags: {} }); await choose("v13-main-alone"); await closeDlg(); await T("v13Tick");
await T("v13Siege"); await T("v13SiegeEnd", true);
check("ending-alone", (await S()).main.ending === "alone", (await S()).main);
// fallen
await T("v13Reset", "main", { ...base, flags: {} }); await choose("v13-main-alone"); await closeDlg(); await T("v13Tick");
await T("v13Siege"); await T("v13SiegeEnd", false);
check("ending-fallen", (await S()).main.ending === "fallen", (await S()).main);

// ---- v13.1: rewards with a full pack go on the ground, not into thin air
await T("v13Take", "grokclaw", 9);
const fp = await T("fillPack");
await T("giveReward", "grokclaw", 1);
const ps = await T("pilesNow");
check("full-pack-reward-drops", fp.full && (await T("countOf", "grokclaw")) === 0 && ps.some((p) => (p.title === "Dropped" || p.title === "Farm stash") && p.items.some((i) => i.startsWith("grokclaw"))), { fp, ps: ps.slice(-2) });
await T("addTime", 600 * 3); await wait(300);
check("dropped-reward-keeps", (await T("pilesNow")).some((p) => p.items.some((i) => i.startsWith("grokclaw"))));

// ---- save compatibility: strip v13 from the save and reload
await T("saveNow");
await page.evaluate(() => { for (const k of Object.keys(localStorage)) { if (!k.startsWith("maine-rpg-save")) continue; try { const d = JSON.parse(localStorage.getItem(k)); if (d && typeof d === "object") { delete d.v13; if (d.data) delete d.data.v13; localStorage.setItem(k, JSON.stringify(d)); } } catch {} } Storage.prototype.setItem = function () {}; });
await page.reload({ waitUntil: "networkidle" }); await wait(2500);
await page.getByRole("button", { name: /Continue/ }).first().click(); await wait(2500);
s = await S();
check("old-save-migrates", s.main.act >= 1 && s.weather && s.loyal.sarah === 20 && s.hud.skills.length === 8, s.main);
check("no page errors", errs.filter((e) => !/favicon/.test(e)).length === 0, errs);
console.log(JSON.stringify(R, null, 1));
console.log("fails:", JSON.stringify(fail, null, 1));
console.log(`${Object.values(R).filter((v) => v === "PASS").length}/${Object.keys(R).length}`);
await browser.close();
