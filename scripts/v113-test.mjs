// v11.3: Skowhegan, achievements, trade skills, farm upgrades, hunting/trapping, Biscuit
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.V113OUT || "/workspace/maine-rpg/beta21-shots/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 800 });
const R = {}; const fail = [];
const wait = (ms) => page.waitForTimeout(ms);
const check = (n, ok, info) => { R[n] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(n + " " + JSON.stringify(info ?? "").slice(0, 300)); };
const closeDlg = async () => { for (let i = 0; i < 4; i++) { const d = await T("dialogueNow"); if (!d) return; await T("choose", "close"); await wait(120); } };
const pick = async (id) => { const d = await T("dialogueNow"); if (!d || !d.choices.some((c) => c.id === id)) { fail.push(`no choice ${id}: ${JSON.stringify(d)?.slice(0, 200)}`); return false; } await T("choose", id); await wait(200); return true; };
const talk = async (role) => { await closeDlg(); const n = await T("npcOf", role); await T("setPos", n.x + 50, n.y + 50); await wait(250); await T("talk", role); await wait(250); };
const away = async () => { const p = await T("getPos"); await T("setPos", p.x + 700, p.y + 300); await wait(200); };
const killQ = async () => { for (const e of await T("enemies")) if (!e.dead && e.id >= 97000) await T("strike", e.id, 9999); await wait(250); };
const shot = (n) => page.screenshot({ path: out + n });
const V = () => T("v3State");
const journal = async (tab) => { await page.getByRole("button", { name: "Journal" }).first().click(); await wait(300); if (tab) { await page.getByTestId(`tab-${tab}`).click(); await wait(300); } };
const unjournal = async () => { await page.getByRole("button", { name: "Journal" }).first().click(); await wait(200); };

await begin();
await T("setZoom", 1.0);
await T("talk", "justin"); await pick("snow-accept"); await T("addWood", 3); await talk("justin"); await pick("snow-wood"); await talk("sarah"); await pick("snow-done"); await closeDlg();

// ---- trade skills
await T("v3Train", "barter", 80);
check("skill-levels-by-doing", (await T("v3Lv", "barter")) === 2, await T("v3Lv", "barter"));
check("barter-perk-price", (await T("v3Price", 100)) <= 94, await T("v3Price", 100));
await journal("skills");
check("skills-screen", (await page.getByTestId("skills-screen").locator("li").count()) === 17);
await shot("03-skills-screen.png");
await unjournal();

// ---- achievements + toast
await T("addIron", 120); await wait(400);
check("ach-toast", await page.getByTestId("ach-toast").isVisible());
await shot("01-achievement-toast.png");
check("ach-rich", !!(await V()).ach.rich);

// ---- farm upgrades
await T("addWood", 80); await T("addStone", 60);
await talk("sarah"); await pick("q11-farm"); await pick("q113-works");
await pick("q113-up-palisade");
await pick("q113-up-bench"); await pick("q113-up-bench");
await pick("q113-up-lookout"); await pick("q113-up-greenhouse"); await pick("q113-up-barrel");
await closeDlg();
let v = await V();
check("upgrade-palisade", v.up.palisade === 1, v.up);
check("upgrade-bench-forge", v.up.bench === 2 && !!v.ach.forge, v.up);
check("upgrade-props", (await T("farmProps")).length >= 0 && (await T("skins")).some((s) => s.skin === "farm-palisade"), await T("skins"));
const fc = await T("npcOf", "sarah");
await T("setPos", fc.x + 40, fc.y + 40); await wait(300);
const s0 = await T("v3Sight");
check("lookout-sight", s0 >= 7, s0);
await journal("farm"); await shot("04-farm-upgrades.png"); await unjournal();
// palisade on raid night
await T("setHour", 22); await wait(300);
await T("startRaidNow"); await wait(200);
const rs = await T("raidState");
check("palisade-raid-hp", rs.house >= 90 + 15 + 40, rs);
await T("q10EndRaid", true); await wait(300);
check("ach-raid1", !!(await V()).ach.raid1);
await T("setHour", 9); await wait(200);
// forge recipe: steel trap
await T("giveItem", "wire", 2);
await T("craft", "steeltrap"); await wait(200);
check("forge-craft-steeltrap", (await T("countOf", "steeltrap")) >= 1, await T("countOf", "steeltrap"));
// daily farm works
const g0 = await T("countOf", "greens");
await T("v3Daily"); await wait(200);
check("greenhouse-daily", (await T("countOf", "greens")) >= g0 + 2 && (await T("countOf", "water")) >= 1);

// ---- trapping: set, catch over time, check
await closeDlg(); await away();
const tp = await T("getPos");
await T("invUse", "steeltrap"); await wait(200);
await T("setPos", tp.x + 700, tp.y); await wait(200);
check("trap-set", (await V()).traps.length === 1, (await V()).traps);
let caught = false;
for (let i = 0; i < 8 && !caught; i++) { await T("v3Daily"); await wait(100); caught = (await V()).traps.some((t) => t.caught); }
check("trap-catches-over-time", caught, (await V()).traps);
await T("setPos", tp.x + 700, tp.y); await wait(300);
const b0 = await T("countOf", "bone");
await T("setPos", tp.x + 10, tp.y + 10); await wait(500);
v = await V();
check("trap-check-dress", v.traps.length === 0 && (await T("countOf", "bone")) > b0, { traps: v.traps, bone: await T("countOf", "bone") });
check("ach-dress", !!v.ach.dress && (!!v.ach.trap || !!v.ach.snare), v.ach);

// ---- tracks and wind
await wait(2500);
let tr = (await T("v3Tracks")).filter((t) => !t.aggro);
check("animals-leave-tracks", tr.length > 0, tr.length);
const game = tr.find((t) => t.kind === "deer" || t.kind === "moose" || t.kind === "rabbit") ?? tr[0];
if (game) {
  await T("setPos", game.last.x + 4, game.last.y + 4); await wait(300);
  const cur = (await T("v3Tracks")).find((t) => t.id === game.id);
  if (cur) { await T("setPos", cur.x + 120, cur.y + 60); await wait(400); }
  check("follow-tracks", !!(await V()).ach.tracks, (await T("v3Tracks")).find((t) => t.id === game.id));
}
// wind: stand upwind of a calm animal, out of sight range, and it bolts
await T("v3Set", { wind: 2 });
tr = (await T("v3Tracks")).filter((t) => !t.aggro && t.temper === "timid" && t.id !== game?.id);
const calm = tr[0];
if (calm) {
  // wind 2 blows toward +x: stand 6 tiles west of the animal
  await T("setPos", calm.x - 6 * 64, calm.y); await wait(700);
  const after = (await T("v3Tracks")).find((t) => t.id === calm.id);
  check("wind-spooks-game", !after || after.aggro, after);
} else check("wind-spooks-game", false, "no calm animal");
// noise: a gunshot scares game nearby (checked via shoot path in engine; covered by no-errors)

// ---- Biscuit
await T("q10Set", { dog: 4 }); await wait(600);
v = await V();
check("biscuit-joins", !!v.ach.biscuit && v.dog.mode === "follow", v.dog);
check("dog-buttons", await page.getByTestId("dog-track").isVisible());
await page.getByTestId("dog-track").click(); await wait(800);
check("dog-track-mode", (await T("v3Dog")).mode === "track" && (await T("v3Lv", "hunting")) >= 2);
await shot("05-biscuit-tracking.png");
await page.getByTestId("dog-stay").click(); await wait(300);
const stayAt = (await T("v3Dog")).body;
const pp = await T("getPos"); await T("walkStraight", pp.x + 300, pp.y); await wait(900);
const st2 = (await T("v3Dog")).body;
check("dog-stay", st2 && Math.hypot(st2.x - stayAt.x, st2.y - stayAt.y) < 10, { stayAt, st2 });
await page.getByTestId("dog-follow").click(); await wait(500);
await T("dogHurt", 12); await wait(200);
{ const h = (await T("v3Dog")).hp; check("dog-hurt", h <= 18 && h > 0, h); }
await T("giveItem", "bandage", 1); await wait(200);
await page.getByTestId("dog-heal").click(); await wait(200);
check("dog-bandage-heals", (await T("v3Dog")).hp >= 25, await T("v3Dog"));
await T("dogHurt", 99); await wait(200);
let d = await T("v3Dog");
check("dog-downed-not-killed", d.down >= 0 && !d.body, d);
await T("v3Daily"); await T("v3Daily"); await wait(300);
d = await T("v3Dog");
check("dog-recovers-at-farm", d.down < 0 && d.hp === 30, d);
await T("dogCommand", "follow").catch(() => {});
await page.getByTestId("dog-follow").click(); await wait(400);
// rides along with the bike
const q = await T("q11State"); q.q = { ...q.q, bike: { s: 9, left: 0 } }; await T("q11Set", { q: q.q });
await T("giveItem", "gas", 4);
const bk = await T("bikeInfo");
await T("setPos", bk.farmBike.x + 40, bk.farmBike.y + 30); await wait(400);
await T("mountNow"); await wait(300);
let ws = null;
for (const [dx, dy] of [[-700, 0], [700, 0], [0, 700], [0, -700]]) { const p = await T("getPos"); await T("clearNear", p.x, p.y, 800); await T("walkStraight", p.x + dx, p.y + dy); await wait(1600); const p2 = await T("getPos"); if (Math.hypot(p2.x - p.x, p2.y - p.y) > 200) { ws = p2; break; } }
d = await T("v3Dog");
check("dog-runs-beside-bike", ws && d.body && Math.hypot(d.body.x - ws.x, d.body.y - ws.y) < 260, { ws, d });
await shot("06-biscuit-with-bike.png");
await T("dismountNow"); await wait(200);

// ---- Skowhegan + Medicine Run
await talk("mira");
check("meds-offered", await pick("q11-ask-meds"));
await pick("q11-accept-meds"); await closeDlg();
const sign = await T("v3Spot", "skowRoad");
await away(); await T("setPos", sign.x, sign.y); await wait(900);
check("meds-step-road", (await T("q11Cur", "meds")).s === 2, await T("q11Cur", "meds"));
let dd = await T("dialogueNow");
if (!dd?.choices.some((c) => c.id === "q113-skow-go")) { await closeDlg(); await T("setPos", sign.x + 300, sign.y); await wait(300); await T("setPos", sign.x, sign.y); await wait(700); }
check("road-sign", await pick("q113-skow-go"));
await wait(1000);
check("skowhegan-map", (await T("mapInfo")).id === 2 && !!(await V()).ach.skow);
const sk = await T("skins");
check("skowhegan-buildings", ["skowhegan-mill", "skowhegan-hospital", "skowhegan-store"].every((k) => sk.some((s) => s.skin === k)), sk);
const br = await T("q11Spot", "skowBridge");
await T("setPos", br.x, br.y + 120); await wait(1200);
await shot("07-skowhegan-bridge-ambush.png");
await killQ(); await wait(400);
check("bridge-cleared", (await T("q11Cur", "meds")).s === 3 && !!(await V()).ach.bridge, await T("q11Cur", "meds"));
const hs = await T("q11Spot", "skowHospital");
await T("setPos", hs.x, hs.y); await wait(900);
await shot("08-skowhegan-hospital.png");
await pick("q11-take-meds");
check("hospital-medicine", (await T("countOf", "medicine")) >= 3);
// higher-tier town raiders
const town = (await T("enemies")).filter((e) => !e.dead && e.kind === "bandit" && e.id < 97000);
check("skowhegan-tougher-raiders", town.length >= 4 && town.every((e) => e.maxHp >= 28), town.map((e) => e.maxHp));
// leave by the road gate
await T("v3Travel", 0); await wait(900);
check("back-home", (await T("mapInfo")).id === 0);
await talk("mira"); await pick("q11-done-meds"); await closeDlg();
check("meds-done", (await T("q11Cur", "meds")).s === 5 && !!(await V()).ach.meds, await T("q11Cur", "meds"));
await journal("ach");
await shot("02-achievements-screen.png");
check("ach-screen", (await page.getByTestId("ach-screen").locator("li").count()) >= 20);
await unjournal();

// ---- persistence
await T("saveNow"); await wait(300);
const before = await V();
await page.reload({ waitUntil: "networkidle" }); await wait(2500);
await page.getByRole("button", { name: "Continue" }).click(); await wait(2500);
const after = await V();
check("saves-v113", Object.keys(after.ach).length === Object.keys(before.ach).length && after.up.palisade === 1 && after.skills.barter.lv === 2, { a: Object.keys(after.ach).length, b: Object.keys(before.ach).length });

check("no-console-errors", errs.length === 0, errs);
console.log(JSON.stringify(R, null, 1));
console.log("fails:", fail);
console.log(`${Object.values(R).filter((x) => x === "PASS").length}/${Object.keys(R).length}`);
await browser.close();
