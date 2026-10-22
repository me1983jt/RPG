// v15.1: Quest RPG towns (Harmony, Pittsfield, Skowhegan + sub-entries): enter and leave each one through the real iframe,
// shared flags/extra, the Skowhegan bridge handover, one-way flag mappings, quest markers, safe zones, phone-size shots.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = process.env.V151OUT || "/workspace/maine-rpg/beta30-shots/";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 915, v14: true });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const wait = (ms) => page.waitForTimeout(ms);
await begin(); await T("v14Set", { st: 5 });
await page.evaluate(() => { window.__controlsTest.choose?.("close"); });
const towns = await T("v15Towns");
for (const id of ["pittsfield", "pf-coop", "pf-depot", "skowhegan", "sk-hospital", "sk-mill", "sk-marcel"]) ok(towns.some((t) => t.id === id), `marker ${id}`);
ok(towns.find((t) => t.id === "pf-coop").src.includes("/towns/pittsfield/") && towns.find((t) => t.id === "pf-coop").src.includes("town=coop"), "co-op entry opens Pittsfield at town=coop");
ok(towns.find((t) => t.id === "sk-marcel").src.includes("/towns/skowhegan/") && towns.find((t) => t.id === "sk-marcel").src.includes("town=marcelstore"), "Marcel's store entry opens Skowhegan at town=marcelstore");
// pittsfield marker sits south-east of Harmony on the farm map; safe zone of 10 tiles
const hs = await T("v15Spot", "harmony"), ps = await T("v15Spot", "pittsfield");
ok(ps.spot && hs.spot && ps.spot.x > hs.spot.x && ps.spot.y > hs.spot.y, `Pittsfield marker SE of Harmony (${Math.round(ps.spot?.x)},${Math.round(ps.spot?.y)})`);
const wm = await page.evaluate(async () => { const m = await import("/src/game/worldmap.ts"); const g = (id) => m.WM_LOCS.find((l) => l.id === id); const c = (l) => m.hexCenter(l.q, l.r); return { farm: c(g("farm")), pf: c(g("pittsfield")), sk: c(g("skowhegan")) }; });
ok(wm.pf.x > wm.farm.x && wm.pf.y > wm.farm.y, "world map: Pittsfield hex south-east of Harmony");
ok(wm.sk.x < wm.farm.x && wm.sk.y >= wm.farm.y, "world map: Skowhegan hex west / south-west of Harmony");

await page.addInitScript(() => { window.addEventListener("message", (e) => { if (e.data?.type === "enterTown") window.__enter = e.data; }); });
async function roundTrip(id, { shot, flags = {}, exit = "worldmap" } = {}) {
  const op = await T("v15Open", id);
  await wait(2500);
  const fr = page.frames().find((f) => f.url().includes("/towns/"));
  const got = fr ? await fr.evaluate(() => window.__enter ? { town: window.__enter.town, flags: Object.keys(window.__enter.state?.questFlags || {}), extra: window.__enter.state?.extra || null } : null).catch(() => null) : null;
  ok(!!fr && got, `${id}: town page loaded (${fr?.url().replace(/^.*\/towns\//, "")}) and got enterTown town=${got?.town}`);
  // first visit: pick a class on the town's title screen; later visits carry the class over in extra
  const hadG = await fr?.evaluate(() => !!window.HARMONY?.state).catch(() => false);
  if (fr && !hadG) { await fr.evaluate(() => document.querySelector('[data-c="woodsman"]')?.click()); await wait(600); }
  if (shot) { await wait(900); await page.screenshot({ path: out + shot }); }
  // leave through the town's own leave(): its real toTownState() goes back to the RPG
  await fr?.evaluate(([e, f]) => { const G = window.HARMONY.state; if (G) Object.assign(G.q, f); window.HARMONY.leave(e); }, [exit, flags]);
  await wait(700);
  return { op, got, hadG };
}
// Harmony (re-copied with barnyard/sugarbush), then each town and sub-entry
let r = await roundTrip("harmony", { shot: "v151-town-harmony.png", flags: { "harmony.gooseGuard": true, "harmony.fence": "done", "harmony.gooseTricks": "done" } });
const tx = (await T("town143")).tx;
ok(tx?.shared?.cls === "woodsman", `Harmony's extra stored as the shared character (${tx?.shared?.cls})`);
{ const d = await T("dbg"); ok(d.phase === "play", `harmony: back in the world after leaveTown (${d.phase})`); }
r = await roundTrip("pittsfield", { shot: "v151-town-pittsfield.png", flags: { "pittsfield.seed": "found", "pittsfield.beaulieu": "ally", "pittsfield.handcar": "running" } });
ok(r.got?.flags.includes("harmony.gooseGuard"), "Harmony's flags reach Pittsfield");
ok(r.got?.extra?.cls === "woodsman" && !!r.got?.extra?.skills && r.hadG, "shared extra: class + skills from Harmony carry into Pittsfield (no class pick)");
ok((await T("dbg")).phase === "play", "pittsfield: back in the world");
for (const id of ["pf-coop", "pf-depot"]) { await roundTrip(id); ok((await T("dbg")).phase === "play", `${id}: enter + leave`); }
r = await roundTrip("skowhegan", { shot: "v151-town-skowhegan.png", flags: { "skowhegan.meds": "found", "skowhegan.mill": "stripped" } });
ok(r.got?.flags.includes("pittsfield.beaulieu") && r.got?.flags.includes("harmony.fence"), "every town's flags reach Skowhegan");
for (const id of ["sk-hospital", "sk-mill", "sk-marcel"]) { await roundTrip(id); ok((await T("dbg")).phase === "play", `${id}: enter + leave`); }
// quest markers
for (const [id, target] of [["pittsfield-handcar", "skow"], ["pittsfield-camp", "raiders"], ["skowhegan-meds", "harmony"]]) ok(await T("town143Msg", { type: "startQuest", id, target, label: id }), `startQuest ${id} -> ${target}`);
const tq = (await T("town143")).tq.map((q) => q.id);
ok(["pittsfield-handcar", "pittsfield-camp", "skowhegan-meds"].every((id) => tq.includes(id)), `quest arrows: ${tq.join(", ")}`);
// bridge exit hands over to quest-harmony's skow crossing
await roundTrip("skowhegan", { exit: "bridge" });
const t143 = await T("town143");
ok(t143.phase === "town" && t143.town?.id === "skow" && t143.town.src.includes("/towns/harmony/") && t143.town.src.includes("town=skow"), `exit:'bridge' opens quest-harmony town=skow (${t143.town?.src})`);
await wait(2000);
await T("v15Leave"); await wait(300);
// mappings
const q10 = await T("q10State"), q11 = await T("q11State");
ok(q10.seed === 4, `pittsfield.seed found -> seed 4 (${q10.seed})`);
ok((q11.q.meds?.s ?? 0) >= 4, `skowhegan.meds found -> meds step 4 (${q11.q.meds?.s})`);
ok((q11.q.mill?.s ?? 0) >= 3, `skowhegan.mill stripped -> mill steps 1+2 done (${q11.q.mill?.s})`);
const fl = (await T("v15Flags", {})).main.flags;
ok(fl.beaulieu && fl.handcar && fl.gooseGuard && fl.fence && fl.gooseHelps, `flags: beaulieu ${!!fl.beaulieu}, handcar ${!!fl.handcar}, gooseGuard ${!!fl.gooseGuard}, fence ${!!fl.fence}, gooseHelps ${!!fl.gooseHelps}`);
// items
const inv = await page.evaluate(async () => { const g = await import("/src/game/gear.ts"); return ["medicine", "wire", "oil"].map((id) => !!g.GEAR[id]); });
ok(inv.every(Boolean), "medicine, wire, oil are main-game items");
const icons = await page.evaluate(async () => Promise.all(["kit", "wire", "oil"].map(async (n) => (await fetch(`/game/items/${n}.png`)).status)));
ok(icons.every((s) => s === 200), `item icons load ${icons}`);
// fence: fewer raiders; goose guard: early warning
await T("setSnow", 3); await T("setHour", 22); await wait(200); await T("startRaidNow"); await wait(200);
const rs = await T("raidState");
ok(rs && !rs.none, `raid starts ${JSON.stringify(rs)} map ${(await T("mapInfo")).id} ${JSON.stringify(await T("dbg")).slice(0, 120)}`);
ok(!errs.some((e) => /pageerror/.test(e)), "no page errors " + errs.filter((e) => /pageerror/.test(e)).join(" | ").slice(0, 300));
console.log(fail ? `${fail} failed` : "all passed");
await browser.close();
process.exit(fail ? 1 : 0);
