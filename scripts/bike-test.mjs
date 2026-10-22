import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.BIKEOUT || "/workspace/maine-rpg/beta19-shots/";
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

await begin();
await T("setZoom", 1.0);
await T("talk", "justin"); await pick("snow-accept"); await T("addWood", 3); await talk("sarah"); await pick("snow-wood"); await talk("sarah"); await pick("snow-done"); await closeDlg();
let b = await T("bikeInfo");
check("farmBikeExists", !!b.farmBike && !b.built, b);
check("optionalManifestLoaded", Array.isArray(b.optional), b);
// broken bike can't be ridden
await T("giveItem", "gas", 2);
await T("setPos", b.farmBike.x + 40, b.farmBike.y + 30); await wait(400);
check("rideButtonShown", await page.getByTestId("ride-btn").isVisible());
await T("mountNow"); await wait(200);
check("brokenNoRide", !(await T("bikeInfo")).mounted);
// the quest
await talk("cal"); await closeDlg();
await T("addIron", 20);
await talk("sarah");
await pick("q11-ask-bike"); await pick("q11-accept-bike"); await closeDlg();
await page.getByRole("button", { name: "Journal" }).first().click(); await wait(500);
check("journalShowsBike", (await page.locator("text=Bike Parts").count()) > 0);
await shot("02-quest-log-bike.png");
await page.getByRole("button", { name: "Journal" }).first().click(); await wait(200);
let c = await T("q11Cur", "bike"), guard = 0;
while (c.s >= 1 && c.s <= c.n && guard++ < 20) {
  const before = c.s; await closeDlg(); await away();
  const s = await T("q11Spot", c.site);
  await T("setPos", s.x, s.y + (c.kind === "fight" ? 120 : 0)); await wait(900);
  if (c.kind === "take") for (let r = 0; r < 4; r++) {
    const d = await T("dialogueNow");
    if (d && d.choices.some((x) => x.id === "q11-take-bike")) { await T("choose", "q11-take-bike"); await wait(200); break; }
    await closeDlg(); await away(); await T("setPos", s.x, s.y); await wait(900);
  }
  if (c.kind === "fight") { await wait(300); await killQ(); }
  await wait(300); c = await T("q11Cur", "bike");
  if (c.s === before) { fail.push(`bike stuck at ${c.s} ${c.kind} ${c.site}`); break; }
}
for (const p of ["carburetor", "chain", "engine", "gastank", "sparkplug", "tire"]) check(`partUsed-${p}`, (await T("countOf", p)) === 0);
await talk("sarah"); await pick("q11-done-bike"); await closeDlg();
c = await T("q11Cur", "bike");
check("bikeQuestDone", c.s === c.n + 2, c);
b = await T("bikeInfo");
check("bikeBuilt", b.built, b);
// ride
const gas0 = await T("countOf", "gas");
check("gasReward", gas0 >= 3, gas0);
const walkNotice = b.notice;
await T("setPos", b.farmBike.x + 40, b.farmBike.y + 30); await wait(400);
await page.getByTestId("ride-btn").click(); await wait(300);
b = await T("bikeInfo");
check("mounted", b.mounted, b);
check("loud", b.notice > walkNotice * 1.5, { walkNotice, n: b.notice });
check("dismountButton", await page.getByRole("button", { name: "Dismount" }).isVisible());
const p0 = await T("getPos");
await T("clearNear", p0.x, p0.y, 900);
// try each direction: a fence or building can block one heading
let sp = 0;
for (const [dx, dy] of [[-700, 0], [700, 0], [0, 700], [0, -700]]) { if (sp) break; const q = await T("getPos"); await T("clearNear", q.x, q.y, 900); await T("walkStraight", q.x + dx, q.y + dy); for (let i = 0; i < 8; i++) { await wait(120); sp = Math.max(sp, await T("getSpeed")); } }
await wait(900);
await shot("01-bike-riding.png");
await wait(1500);
b = await T("bikeInfo");
check("speed2x", sp > 0, sp);
check("gasBurning", b.gasDist > 0 || (await T("countOf", "gas")) < gas0, b);
await page.getByRole("button", { name: "Dismount" }).click(); await wait(300);
check("dismounted", !(await T("bikeInfo")).mounted);
// walk speed comparison
let ws = 0;
for (const [dx, dy] of [[600, 0], [-600, 0], [0, 600], [0, -600]]) { if (ws) break; const p1 = await T("getPos"); await T("clearNear", p1.x, p1.y, 700); await T("walkStraight", p1.x + dx, p1.y + dy); for (let i = 0; i < 8; i++) { await wait(120); ws = Math.max(ws, await T("getSpeed")); } }
check("speedRatio~2", sp / ws > 1.8 && sp / ws < 2.2, { sp, ws });
// no gas -> no ride
const bb = await T("bikeInfo"); 
await T("setPos", bb.farmBike.x + 40, bb.farmBike.y + 30); await wait(300);
await page.evaluate(() => { const t = window.__controlsTest; const n = t.countOf("gas"); for (let i = 0; i < n; i++) t.dropItem?.("gas"); });
await wait(200);
const gLeft = await T("countOf", "gas");
if (gLeft === 0) { await T("mountNow"); await wait(200); check("noGasNoRide", !(await T("bikeInfo")).mounted); }
await T("giveItem", "gas", 3);
// indoor: mount, then enter a building -> parked
await T("mountNow"); await wait(200);
check("remount", (await T("bikeInfo")).mounted);
await T("forceEnter", "farmhouse").catch(() => {}); await wait(400);
const ii = await T("insideInfo");
if (ii) { check("indoorParks", !(await T("bikeInfo")).mounted); check("noRideButtonInside", !(await page.getByTestId("ride-btn").isVisible())); await T("leave"); await wait(400); }
else check("indoorParks", false, "no farmhouse");
console.log(JSON.stringify(R, null, 1));
console.log("fails:", fail);
console.log("errors:", errs);
const n = Object.values(R).filter((v) => v === "PASS").length;
console.log(`${n}/${Object.keys(R).length}`);
await browser.close();
