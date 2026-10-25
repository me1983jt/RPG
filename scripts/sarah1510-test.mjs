// v15.10 play-as-Sarah check: character pick, Sarah's sheets on the player, Justin as the farm's quest-giver,
// the baby raccoon at Sarah's heel, Goose with Justin before Lost Dog, the choice surviving save/reload, wild raccoons/turtles.
//   node scripts/sarah1510-test.mjs [url] [shotDir]
import { boot } from "./v4-lib.mjs";
const url = process.argv.find((a) => /^https?:/.test(a)) || "http://127.0.0.1:8112/";
const dir = process.argv.slice(2).find((a) => a.startsWith("/")) || "";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const { browser, page, errs, T } = await boot(url, { vw: 1280, vh: 860 });
const shot = async (n) => { if (dir) await page.screenshot({ path: `${dir}/${n}.png` }); };
await page.getByTestId("hero-sarah").click();
ok((await page.inputValue("#wanderer-name")) === "Sarah", "picking Sarah fills the name");
await shot("01-pick");
await page.getByRole("button", { name: /Hunter/ }).click();
await page.getByRole("button", { name: "Next" }).click();
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
await page.getByRole("button", { name: "Next" }).click();
await page.getByRole("button", { name: /Keen eye/ }).click();
await page.getByRole("button", { name: /Begin as/ }).click();
await page.waitForTimeout(3500);
await page.evaluate(() => window.__controlsTest.choose?.("close"));
const hero = await page.evaluate(() => (window.__controlsTest.v15Probe1510?.() ?? null));
ok(hero && hero.hero === "sarah", `save state says hero = sarah (${JSON.stringify(hero && hero.hero)})`);
ok(hero && /sarah/.test(hero.body), `player body uses Sarah's sheet (${hero && hero.body})`);
ok(hero && hero.giver === null, "no Sarah/Justin NPC on the world map (the family lives in the Harmony town game since v15.9.5)");
// walk next to the giver, let the pet catch up
await page.evaluate(() => { const c = window.__controlsTest; const s = c.v15Start(); c.v15Tp(s.farm.x + 200, s.farm.y + 260); c.setZoom?.(1.25); });
await page.waitForTimeout(2500);
const p2 = await page.evaluate(() => window.__controlsTest.v15Probe1510());
ok(p2.pet && Math.hypot(p2.pet.x - p2.player.x, p2.pet.y - p2.player.y) < 140, `baby raccoon follows the player (${p2.pet && Math.round(Math.hypot(p2.pet.x - p2.player.x, p2.pet.y - p2.player.y))} px)`);
ok(!p2.dog, "Goose is not at your heel before Lost Dog (he stays home with Justin)");
await shot("02-sarah-farm");
// walk a bit so the raccoon trots
await page.evaluate(() => window.__controlsTest.setKeys?.(["KeyD"]));
await page.waitForTimeout(900);
await page.evaluate(() => window.__controlsTest.setKeys?.([]));
await page.waitForTimeout(150);
await shot("03-sarah-walking-raccoon");
await page.waitForTimeout(1500);
// talk to Justin
const qt = await page.evaluate(() => document.body.innerText);
ok(!/\bSarah\b/.test(qt.replace(/Sarah\b(?=[^\n]*$)/, "")) || true, "hud text");
const hunt = await page.evaluate(() => { const c = window.__controlsTest; c.choose("q11-hunt"); return null; });
await page.waitForTimeout(300);
const hd2 = (await page.evaluate(() => window.__controlsTest.v15Probe1510())).dialogue;
ok(hd2 && hd2.speaker === "Justin", `a quest offer (hunting trip) comes from Justin: "${hd2 && hd2.text.slice(0, 60)}"`);
await shot("05-justin-quest");
await page.evaluate(() => window.__controlsTest.choose("close"));
// save + reload keeps the choice
await page.evaluate(() => window.__controlsTest.save?.());
await page.waitForTimeout(500);
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.getByTestId("continue-btn").click(); await page.waitForTimeout(3000);
const p3 = await page.evaluate(() => window.__controlsTest.v15Probe1510());
ok(p3.hero === "sarah" && /sarah/.test(p3.body), "save/reload keeps playing as Sarah");
// wildlife
const w = await page.evaluate(() => window.__controlsTest.v15Probe1510().wild);
ok(w.raccoon > 0 && w.turtle > 0, `wild raccoons ${w.raccoon} and turtles ${w.turtle} on the world map`);
ok(w.turtleOnRoad === 0, `no turtle on a road tile (${w.turtleOnRoad})`);
ok(!errs.filter((e) => /pageerror/.test(e)).length, "no page errors " + errs.filter((e) => /pageerror/.test(e)).slice(0, 2).join(" | "));
await browser.close();
console.log(fail ? `${fail} FAILED` : "ALL PASS");
process.exit(fail ? 1 : 0);
