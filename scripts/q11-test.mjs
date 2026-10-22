import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = "/workspace/maine-rpg/beta18-shots/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 800 });
const R = {}; const fail = [];
const wait = (ms) => page.waitForTimeout(ms);
const check = (n, ok, info) => { R[n] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(n + " " + JSON.stringify(info ?? "").slice(0, 300)); };
const closeDlg = async () => { for (let i = 0; i < 3; i++) { const d = await T("dialogueNow"); if (!d) return; await T("choose", "close"); await wait(120); } };
const pick = async (id) => { const d = await T("dialogueNow"); if (!d || !d.choices.some((c) => c.id === id)) { fail.push(`no choice ${id}: ${JSON.stringify(d)?.slice(0, 200)}`); return false; } await T("choose", id); await wait(200); return true; };
const talk = async (role) => { await closeDlg(); const n = await T("npcOf", role); await T("setPos", n.x + 50, n.y + 50); await wait(250); await T("talk", role); await wait(250); };
const away = async () => { const p = await T("getPos"); await T("setPos", p.x + 700, p.y + 300); await wait(200); };
const killQ = async () => { for (const e of await T("enemies")) if (!e.dead && e.id >= 97000) await T("strike", e.id, 9999); await wait(250); };
const shot = (n) => page.screenshot({ path: out + n });

async function runQuest(id, giver, shotAt) {
  await talk(giver);
  if (!(await pick(`q11-ask-${id}`))) return check(`q-${id}`, false, "no offer");
  await pick(`q11-accept-${id}`); await closeDlg();
  let c = await T("q11Cur", id), guard = 0;
  while (c.s >= 1 && c.s <= c.n && guard++ < 20) {
    const before = c.s;
    await closeDlg();
    if (c.kind === "ambush") await killQ();
    else {
      await away();
      const s = await T("q11Spot", c.site);
      await T("setPos", s.x, s.y + (c.kind === "fight" ? 120 : 0)); await wait(900);
      if (shotAt && shotAt.s === c.s) { await wait(600); await shot(shotAt.file); }
      if (c.kind === "take") {
        for (let r = 0; r < 4; r++) {
          const d = await T("dialogueNow");
          if (d && d.choices.some((x) => x.id === `q11-take-${id}`)) { await T("choose", `q11-take-${id}`); await wait(200); break; }
          // something else talked first (the Warden at his gate): close it, step off and come back
          await closeDlg(); await away(); await T("setPos", s.x, s.y); await wait(900);
          if (r === 3) fail.push(`no take dialogue for ${id}: ${JSON.stringify(d)?.slice(0, 120)}`);
        }
      }
      if (c.kind === "fight") { await wait(300); await killQ(); }
    }
    await wait(300);
    c = await T("q11Cur", id);
    if (c.s === before) { fail.push(`${id} stuck at step ${c.s} ${c.kind} ${c.site}`); break; }
  }
  await talk(giver); await pick(`q11-done-${id}`); await closeDlg();
  c = await T("q11Cur", id);
  check(`q-${id}`, c.s === c.n + 2, c);
}

await begin();
await T("setZoom", 1.0);
// First Snow so the farm opens up
await T("talk", "justin"); await pick("snow-accept"); await T("addWood", 3); await talk("sarah"); await pick("snow-wood"); await talk("sarah"); await pick("snow-done");
check("firstSnow", (await T("questState")).snow === 3);
await closeDlg();
await page.getByRole("button", { name: "Journal" }).first().click(); await wait(500);
await shot("02-quest-log.png");
await page.getByRole("button", { name: "Journal" }).first().click(); await wait(200);

await runQuest("ice", "sarah");
await runQuest("fuel", "justin");
await runQuest("sick", "sarah", { s: 1, file: "03-sick-neighbor-pharmacy.png" });
await runQuest("maple", "loki");
await runQuest("bridge", "justin");
await runQuest("wolves", "sarah");
await runQuest("school", "sarah", { s: 3, file: "04-school-escort.png" });
await runQuest("garden", "mira");
// gated quests
await T("q10Set", { ferry: 3, radio: 3 });
await runQuest("light", "cyndal");
await T("setJack", true).catch(() => {});
await page.evaluate(() => window.__controlsTest.questState());
// Jack: talk to him once to meet him (jackMet)
await talk("cal"); await closeDlg();
await runQuest("caches", "cal");
// Grok hunt: cross the ferry, hunt across the river, come home
await talk("sarah"); await pick("q11-ask-grok"); await pick("q11-accept-grok"); await closeDlg();
const fs = await T("q10Spot", "ferry"); await away(); await T("setPos", fs.x, fs.y); await wait(700); await pick("q10-ferry-cross"); await wait(900);
check("grok-map1", (await T("mapInfo")).id === 1);
for (let i = 0; i < 3; i++) {
  const c = await T("q11Cur", "grok"); await closeDlg(); await away();
  const s = await T("q11Spot", c.site); await T("setPos", s.x, s.y + 100); await wait(1000);
  if (c.kind === "fight") {
    const g = (await T("enemies")).find((e) => e.variant === "grok" && !e.dead);
    check("grok-spawned", !!g && g.hp >= 200, g);
    await wait(800); await shot("05-the-grok.png");
    await killQ();
  }
}
const mi = await T("mapInfo"); const gt = mi.gates[0]; await T("setPos", gt.tx * 64 + 32, gt.ty * 64 + 32); await wait(2500);
check("grok-home", (await T("mapInfo")).id === 0);
await talk("sarah"); await pick("q11-done-grok"); await closeDlg();
let gc = await T("q11Cur", "grok"); // v13.1: a full pack puts the reward on the ground / farm stash instead of losing it
const clawPile = (await T("pilesNow")).some((p) => p.items.some((i) => i.startsWith("grokclaw")));
check("q-grok", gc.s === gc.n + 2 && ((await T("countOf", "grokclaw")) === 1 || clawPile), { gc, clawPile });

// ---- systems
// farm builder
await T("addWood", 20); await T("addStone", 10); await T("addIron", 20);
await talk("sarah"); await pick("q11-farm"); await pick("q11-build-plots"); await pick("q11-build-coop"); await pick("q11-build-wall"); await pick("q11-build-smoke"); await closeDlg();
let s11 = await T("q11State"); check("farm-build", s11.farm.plots === 1 && s11.farm.coop === 1 && s11.farm.wall === 1 && s11.farm.smoke === 1, s11.farm);
const apples0 = await T("countOf", "apple"); await T("addTime", 600 * 2); await wait(600);
check("farm-yield", (await T("countOf", "apple")) > apples0 || (await T("q11State")).farm.harvest > 0, { apples0, now: await T("countOf", "apple") });
// crafting bench
const fhp = await T("npcOf", "sarah"); await T("setPos", fhp.x + 40, fhp.y + 40); await wait(200);
// v13.1: clear pack room first, then hand over the materials (they used to be given into a full pack)
await closeDlg(); for (const j of ["pelt", "meat", "jerky", "pork", "apple", "smokedfish", "donut", "dandelion", "cider", "stew", "hide", "syrup"]) await T("dropItem", j);
await T("giveItem", "wire", 3); await T("giveItem", "hide", 1); await T("giveItem", "oil", 2); await T("addIron", 30); await T("addWood", 4); await T("craft", "snare"); await T("craft", "snowshoes"); await T("craft", "lantern"); console.log("CRAFTLOG", JSON.stringify((await T("logTail")).slice(-4)), JSON.stringify(await T("dbg")).slice(0,80));
check("craft-bench", (await T("countOf", "snare")) >= 2 && (await T("countOf", "lantern")) >= 1, { snare: await T("countOf", "snare"), lantern: await T("countOf", "lantern") });
await T("invUse", "snare"); s11 = await T("q11State"); check("snare-set", s11.traps.length === 1, s11.traps);
await T("togglePack"); await wait(500); await shot("06-crafting-bench.png"); await T("togglePack"); await wait(200);
// hunting trip
await talk("sarah"); await pick("q11-hunt"); await pick("q11-hunt-deer"); await wait(300);
s11 = await T("q11State"); const prey = (await T("enemies")).find((e) => !e.dead && e.id >= 97000 && e.kind === "deer");
check("hunt-start", !!s11.hunt && !!prey, { hunt: s11.hunt });
if (prey) await T("strike", prey.id, 9999); await wait(300);
check("hunt-done", !(await T("q11State")).hunt);
// fishing (forced hit so the test is deterministic; the bar still draws)
await T("q11Force", { fish: true });
await closeDlg(); await away(); const fsp = await T("q11Spot", "fishPond"); await T("setPos", fsp.x, fsp.y); await wait(800);
await pick("q11-fish-cast-fishPond"); await wait(700); await shot("07-fishing.png");
await pick("q11-fish-hook"); s11 = await T("q11State"); check("fishing", s11.fish.caught === 1, s11.fish);
await T("q11Force", { fish: null });
// trade caravan with a forced ambush both ways
await T("q11Force", { caravan: true });
await talk("sarah"); await pick("q11-caravan"); await pick("q11-car-route-0"); await wait(300);
check("caravan-ambush", (await T("q11State")).caravan === 2);
await killQ(); await wait(300);
check("caravan-market", (await T("q11State")).caravan === 3 && !!(await T("dialogueNow")));
await T("giveItem", "pelt", 1); await pick("q11-sell-pelt"); await pick("q11-car-home"); await wait(300); await killQ(); await wait(300);
s11 = await T("q11State"); check("caravan-home", s11.caravan === 0 && s11.trips === 1, s11);
await T("q11Force", { caravan: null });
// seasons
const day = (await T("q11State")).day; await T("q11Set", { seasonDay: day - 6 }); s11 = await T("q11State");
check("season-winter", s11.season === 3, s11.season);
await T("q11Set", { seasonDay: day }); 
// save / load
await T("saveNow"); await page.reload({ waitUntil: "networkidle" }); await wait(2500);
await page.getByRole("button", { name: "Continue" }).click(); await wait(3000);
s11 = await T("q11State"); check("reload-keeps-q11", s11.q.grok?.s === 5 && s11.farm.plots === 1 && s11.fish.caught === 1 && s11.trips === 1, { grok: s11.q.grok, farm: s11.farm });
check("reload-keeps-q10", (await T("q10State")).ferry === 3);

// ---- modes from the start menu
await T("pressBack").catch(() => {}); await page.keyboard.press("Escape"); await wait(400);
const toMenu = async () => { await page.evaluate(() => window.__controlsTest.q11ModeEnd && 0); };
async function menu() { await page.reload({ waitUntil: "networkidle" }); await wait(2500); }
await menu();
await shot("01-start-menu.png");
// Winter Survival: run it to spring
await page.getByRole("button", { name: "Winter Survival" }).click(); await wait(2500);
s11 = await T("q11State"); check("winter-start", s11.mode11 === "winter" && s11.season === 3, s11.mode11);
await wait(1500); await shot("08-winter-survival.png");
await T("q11ModeTime", 600 * 3.2); await wait(800);
let mr = await T("modeResult"); check("winter-end", !!mr && mr.mode === "winter" && (await T("dbg")).phase === "menu", mr);
await page.getByRole("button", { name: "Back to menu" }).click(); await wait(400);
// Night Watch: catch a prowler, then dawn
await page.getByRole("button", { name: "Night Watch" }).click(); await wait(2500);
check("watch-start", (await T("q11State")).mode11 === "watch");
await T("q11ModeTime", 2); await wait(2500);
await shot("09-night-watch.png");
await killQ(); await T("q11ModeTime", 999); await wait(600);
mr = await T("modeResult"); check("watch-end", !!mr && mr.mode === "watch", mr);
await page.getByRole("button", { name: "Back to menu" }).click(); await wait(400);
// Endless Raid: hold a couple of waves, then fall
await page.getByRole("button", { name: "Endless Raid" }).click(); await wait(2500);
check("endless-start", (await T("q11State")).mode11 === "endless" && !(await T("raidState")).none);
for (let w = 0; w < 2; w++) {
  for (let k = 0; k < 40; k++) { const rs = await T("raidState"); if (rs.phase === "wave") break; await wait(500); }
  for (let k = 0; k < 30; k++) { for (const e of await T("enemies")) if (!e.dead && e.kind === "bandit") await T("strike", e.id, 9999); const rs = await T("raidState"); if (rs.phase === "lull" && rs.wave > w) break; await wait(500); }
}
const rsx = await T("raidState"); check("endless-continues", rsx.wave >= 2 && rsx.waves >= 3, rsx);
await T("raidHouseHit", 9999); await wait(1500);
mr = await T("modeResult"); check("endless-score", !!mr && mr.mode === "endless" && mr.score > 0 && mr.best >= mr.score, mr);
await wait(300); await shot("10-endless-raid-score.png");
const best = await page.evaluate(() => localStorage.getItem("maine-rpg-endless-best"));
check("endless-best-saved", Number(best) === mr?.score, best);
await page.getByRole("button", { name: "Back to menu" }).click(); await wait(300);
// Raid Mode still works
await page.getByRole("button", { name: "Raid Mode" }).click(); await wait(2000);
await T("q10EndRaid", true); await wait(600);
check("raidMode-still", (await T("dbg")).phase === "menu");
check("no-console-errors", errs.length === 0, errs);
console.log(JSON.stringify({ ...R, fail, errs: errs.slice(0, 10) }, null, 1));
await browser.close();
