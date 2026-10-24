// v15.9 shared character: RPG -> town -> RPG round trip (real town exit) and town-side changes landing back, incl. Tinker,
// Climbing / Electronics / Mechanics, and the shared rules file staying in sync (stats.json == stats_rules.js == src copy).
import { boot } from "./v4-lib.mjs";
import fs from "node:fs"; import vm from "node:vm";
const url = process.argv[2] || "http://127.0.0.1:8112/";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
// shared rules in sync
const SR = "/workspace/shared-rules";
const json = JSON.parse(fs.readFileSync(`${SR}/stats.json`, "utf8"));
const ctx = { globalThis: {} }; ctx.window = ctx; vm.runInNewContext(fs.readFileSync(`${SR}/stats_rules.js`, "utf8"), ctx);
ok(JSON.stringify(ctx.STATS_RULES) === JSON.stringify(json), "stats_rules.js matches stats.json");
const master = fs.readFileSync(`${SR}/stats_rules.js`, "utf8");
ok(fs.readFileSync("src/game/stats_rules.js", "utf8") === master, "the main game loads the same stats_rules.js");
for (const t of ["harmony", "pittsfield", "skowhegan"]) ok(fs.existsSync(`public/towns/${t}/shared/stats_rules.js`) && fs.readFileSync(`public/towns/${t}/shared/stats_rules.js`, "utf8") === master, `${t} town copy of stats_rules.js is current`);
ok(!json.classes.find((c) => c.id === "tinker").provisional && typeof json.traits[0].hp === "number" && typeof json.perks.find((p) => p.id === "quick").ap === "number" && typeof json.checks.base === "number", "rules are numeric; Tinker approved (no provisional label)");
ok(["harmony", "pittsfield", "skowhegan"].every((k) => json.rep.keys.includes(k)), "rep keys include the three towns");
vm.runInNewContext(fs.readFileSync(`${SR}/stats_loader.js`, "utf8"), ctx);
ok(ctx.StatsRules.cls("Woodsman").id === "fighter" && ctx.StatsRules.cls("scrounger").id === "thief" && ctx.StatsRules.cls("Fixer").id === "medic" && ctx.StatsRules.cls("Tinker").id === "tinker", "loader maps old class names");
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 720, v14: true, role: "Tinker" });
await begin(); await T("setHour", 12);
const keys = ["name", "look", "hair", "perks", "role", "trait", "backstory", "level", "xp", "points", "tags", "invested", "skillPoints", "skills", "karma", "rep", "stats", "class", "inventory", "companions"];
const pick = (s) => Object.fromEntries(keys.map((k) => [k, s[k]]));
const st0 = (await T("v15Open", "pittsfield")).msg.state;
ok(st0.class === "tinker" && st0.role === "tinker", `Tinker class goes straight through (${st0.class})`);
ok(st0.stats.agility >= 1 && st0.stats.grit >= 0, `agility/grit come from core (${st0.stats.agility}/${st0.stats.grit})`);
ok(["mechanics", "climbing", "electronics"].every((k) => typeof st0.skillScores[k] === "number" && st0.skillScores[k] > 0), `new skills scored (${JSON.stringify({ m: st0.skillScores.mechanics, c: st0.skillScores.climbing, e: st0.skillScores.electronics })})`);
ok(JSON.stringify(st0.tags) === JSON.stringify(["mechanics", "electronics", "doctor"]), `Tinker tags ${st0.tags}`);
for (const k of keys) ok(st0[k] !== undefined, `enterTown sends ${k}`);
await page.waitForTimeout(3500);
const f = page.frames().find((x) => x !== page.mainFrame());
await f.evaluate(() => HARMONY.leave("town")); await page.waitForTimeout(2500);
const st1 = (await T("v15Open", "pittsfield")).msg.state;
for (const k of keys) { const a = JSON.stringify(st0[k]), b = JSON.stringify(k === "skills" ? Object.fromEntries(Object.keys(st0.skills).map((x) => [x, st1.skills[x]])) : st1[k]); // skills: the town may add its own ids (kept, not applied)
  ok(a === b, `round trip keeps ${k}${a === b ? "" : ` ${a.slice(0, 120)} -> ${b.slice(0, 120)}`}`); }
// town-side change lands
const changed = { ...pick(st1), name: "Justina", stats: { ...st1.stats, agility: 0, intellect: st1.stats.intellect + 1 }, perks: ["wool"], invested: { climbing: 3, electronics: 2 }, skillPoints: 1, karma: 7, class: "tinker", skills: { ...st1.skills, climbing_town: { lv: 2, xp: 1 } },
  companions: st1.companions.map((c) => c.id === "loki" ? { ...c, withYou: true } : c), inventory: st1.inventory.map((i, n) => n === 0 ? { ...i, durability: 42 } : i) };
await page.evaluate((s) => window.__controlsTest.town143Msg({ type: "leaveTown", exit: "town", state: s }), changed);
await page.waitForTimeout(600);
const st2 = (await T("v15Open", "pittsfield")).msg.state;
ok(st2.name === "Justina", "name change lands");
ok(st2.stats.agility === 0, `a real 0 stays 0 (agility ${st2.stats.agility})`);
ok(st2.stats.intellect === st1.stats.intellect + 1, "stat change lands");
ok(JSON.stringify(st2.perks) === '["wool"]' && st2.karma === 7 && st2.skillPoints === 1, "perks / karma / skill points land");
ok(st2.invested.climbing === 3 && st2.invested.electronics === 2, "invested climbing / electronics land");
const c1 = st1.skillScores, c2 = st2.skillScores;
ok(c2.climbing === c1.climbing - 4 * st1.stats.agility + 3, `climbing follows the shared formula (agility to 0, +3 invested: ${c1.climbing}->${c2.climbing})`);
ok(c2.electronics === c1.electronics + 5 + 2 * 2, `electronics follows the shared formula (tagged x2, +1 INT: ${c1.electronics}->${c2.electronics})`);
ok(st2.class === "tinker", "exact class comes back");
ok(JSON.stringify(st2.skills.climbing_town) === '{"lv":2,"xp":1}', "town skill data stored and sent back");
ok(st2.companions.find((c) => c.id === "loki")?.withYou === true, "companion withYou kept");
ok(st2.inventory[0].durability === 42, "unknown item props kept");
await page.evaluate(() => window.__controlsTest.v15Leave?.());
// Justin (Oct 23): town score -> XP 1:1; old town save skills halved into invested points (once)
{ const s3 = (await T("v15Open", "skowhegan")).msg.state; const xp0 = s3.xp, lv0 = s3.level, inv0 = { ...s3.invested };
  await page.evaluate((s) => window.__controlsTest.town143Msg({ type: "leaveTown", exit: "town", state: { ...s, score: 10, extra: { skills: { tinkering: { lv: 5, xp: 0 }, climbing: { lv: 3, xp: 1 } } } } }), s3);
  const s4 = (await T("v15Open", "skowhegan")).msg.state;
  ok(s4.level > lv0 || s4.xp === xp0 + 10, `10 town score = 10 XP (xp ${xp0} -> ${s4.xp}, lv ${lv0} -> ${s4.level})`);
  ok(s4.invested.mechanics === (inv0.mechanics ?? 0) + 2 && s4.invested.climbing === (inv0.climbing ?? 0) + 1, `old town skills halved into invested (${JSON.stringify(s4.invested)})`);
  await page.evaluate((s) => window.__controlsTest.town143Msg({ type: "leaveTown", exit: "town", state: { ...s, score: 10, extra: { skills: { tinkering: { lv: 5 } } } } }), s4);
  const s5 = (await T("v15Open", "skowhegan")).msg.state;
  ok(s5.invested.mechanics === s4.invested.mechanics && s5.xp === s4.xp && s5.level === s4.level, "conversion and score XP happen once");
  await page.evaluate(() => window.__controlsTest.v15Leave?.()); }
// main-game uses of Climbing / Electronics
for (const kind of ["ruin", "car-sedan", "lookout"]) { const r = await T("use159", kind); ok(r === null || r.r === true, `${kind}: ${kind === "ruin" ? "Climbing" : "Electronics"} use runs (${r ? JSON.stringify(r.after) : "none on this map"})`); }
ok(!errs.length, `no errors ${errs.slice(0, 2).join(" | ")}`);
console.log(fail ? `${fail} FAILED` : "ALL PASS");
await browser.close(); process.exit(fail ? 1 : 0);
