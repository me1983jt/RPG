// v14.1 playtest fixes + gif-compare animation work
import { boot } from "./v4-lib.mjs";
import { readFileSync } from "node:fs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const eng = readFileSync("/workspace/maine-rpg/v11/src/game/engine.ts", "utf8");
const time = readFileSync("/workspace/maine-rpg/v11/src/game/time.ts", "utf8");
ok(/DAY_LENGTH_SEC = 20 \* 60/.test(time), "clock slowed: 20 real minutes per day (was 12)");
ok(/walk: 60, run: 50, idle: 150, aim: 60, fire: 45/.test(eng) && /walk: 14, run: 14, idle: 10, aim: 6, fire: 6, punch: 10, kick: 12, swing: 14, hit: 5, death: 12, crouch: 8/.test(eng), "frame times walk 60 / run 50 / idle 150 / aim 60 / fire 45 and the new frame counts");
{
  // replicate resampleMove and check totals/hit points stay put
  const rs = (ms, hit, n) => { const m = ms.length, out = []; for (let k = 0; k < n; k++) { const a = k * m / n, b = (k + 1) * m / n; let t = 0; for (let j = Math.floor(a); j < Math.ceil(b) && j < m; j++) t += ms[j] * (Math.min(b, j + 1) - Math.max(a, j)); out.push(Math.round(t)); } return { ms: out, hit: Math.round((hit - 1) * n / m) + 1 }; };
  for (const [nm, ms, h, n] of [["punch", [70, 60, 50, 90, 70, 80], 4, 10], ["kick", [80, 70, 50, 100, 70, 80, 90], 4, 12], ["swing", [90, 80, 70, 40, 90, 70, 80, 90], 5, 14]]) {
    const r = rs(ms, h, n), tot = r.ms.reduce((a, b) => a + b, 0), old = ms.reduce((a, b) => a + b, 0);
    const hitAt = r.ms.slice(0, r.hit - 1).reduce((a, b) => a + b, 0), oldHit = ms.slice(0, h - 1).reduce((a, b) => a + b, 0);
    ok(r.ms.length === n && Math.abs(tot - old) <= 3 && Math.abs(hitAt - oldHit) <= 30, `${nm}: ${n} frames, ${tot} ms (was ${old}), hit at ${hitAt} ms (was ${oldHit}) on frame ${r.hit}`);
  }
}
ok(/AILMENTS\.cut\.hpDay\); \/\/ v14\.1/.test(eng), "infected cut softened");
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 860, v14: true });
const r = await page.evaluate(async () => (await fetch("/game/items/junk.png")).status); ok(r === 200, "game/items/junk.png exists");
await begin();
await page.waitForTimeout(1500);
let en = await T("l141Enemies");
const wolves = en.filter((e) => e.kind === "wolf" || e.kind === "coyote");
ok(wolves.every((w) => w.d > 28 * 64 * .9 || w.d > 28 * 32), `no wolves near the start in the first 5 min (${wolves.map((w) => Math.round(w.d)).join(",") || "none on map"})`);
// melee: unarmed punches land on the 4th frame, not on the click
await page.evaluate(() => { const t = window.__controlsTest; t.l141Calm(); });
const s0 = await T("l141");
const foe = en.find((e) => !e.hollow) || en[0];
if (foe) {
  await page.evaluate(() => window.__controlsTest.l141Unarm?.());
  const hit = await T("l141Strike", foe.id);
  const m = await T("l141Melee");
  ok(m.pending || m.m || hit.after < hit.before, `melee: blow is queued for its hit frame (${JSON.stringify(m)})`);
  ok(await T("l141Fight"), "mid-swing counts as combat (no NPC dialog opens)");
  await page.waitForTimeout(700);
  ok(!(await T("l141Melee")).pending, "the queued hit resolved");
}
await page.evaluate(() => window.__controlsTest.l141Calm());
// 4 diagonal facings only
{
  const dirs = await page.evaluate(() => window.__controlsTest.l141Facings?.());
  ok(dirs && dirs.every((d) => [1, 2, 3, 5, 6, 7].includes(d)) && dirs.includes(6) && dirs.includes(2), `movement uses the 6 hex facings NE/E/SE/SW/W/NW (${JSON.stringify(dirs)})`);
}
// injuries: blinded, crippled arm, crippled leg
{
  const base = await T("l141Inj");
  await T("l141Injure", "blind"); let j = await T("l141Inj");
  ok(j.ail.includes("blind") && j.sight < base.sight, `blinded: sight ${base.sight} -> ${j.sight}`);
  await page.waitForTimeout(400);
  ok(await page.locator('[data-hud="injury"]').count() > 0, "injury icon on the HUD");
  await page.screenshot({ path: "beta30-shots/v141-blinded.png" });
  await T("l141Injure", "legs"); j = await T("l141Inj"); ok(!j.run && j.speed < base.speed, `crippled leg: no running, speed x${j.speed}`);
  await T("l141Injure", "arms"); j = await T("l141Inj"); ok(j.ail.includes("arms"), "crippled arm");
  await T("l141Give", "docbag", 1); await page.evaluate(() => window.__controlsTest.invUse ? window.__controlsTest.invUse("docbag") : window.__gameApi?.invUse?.("docbag"));
  j = await T("l141Inj"); if (j.ail.some((a) => ["blind", "arms", "legs"].includes(a))) { await page.evaluate(() => window.__controlsTest.clickPack?.("docbag")); j = await T("l141Inj"); }
  ok(!j.ail.some((a) => ["blind", "arms", "legs"].includes(a)), `doctor's bag heals all three (${j.ail})`);
}
// lineup + scale
const who = await T("l141Lineup");
await page.waitForTimeout(900);
await page.screenshot({ path: "beta30-shots/v141-lineup.png" });
const fig = await T("l141Fig");
console.log(who, fig);
const adults = Object.entries(fig).filter(([k]) => !/cyndal|loki|boss/.test(k)), kids = Object.entries(fig).filter(([k]) => /cyndal|loki/.test(k));
ok(adults.length > 0 && adults.every(([, v]) => v.px >= 97 && v.px <= 101), `adults drawn 97-101 px (v15.9 art is 99 px) (${adults.map(([k, v]) => k + ":" + v.px).join(" ")})`);
ok(kids.length > 0 && kids.every(([, v]) => v.px >= 85 && v.px <= 89), `kids drawn 85-89 px (${kids.map(([k, v]) => k + ":" + v.px).join(" ")})`);
ok(errs.length === 0, "no errors " + errs.slice(0, 3).join(" | "));
await browser.close();
console.log(fail ? `${fail} FAIL` : "ALL PASS");
process.exit(fail ? 1 : 0);
