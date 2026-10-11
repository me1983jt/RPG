import { boot } from "./v4-lib.mjs";
import snowJack from "./combined-test.mjs";
import chop from "./chop-test.mjs";
const [url, out, prefix = "reg-"] = process.argv.slice(2);
const { browser, page, errs, T, begin } = await boot(url, { vw: +(process.env.VW || 1280), vh: +(process.env.VH || 800) });
const shot = async (n) => { await page.waitForTimeout(500); await page.screenshot({ path: `${out}/${prefix}${n}.png` }); console.log("shot", n); };
const log = (...a) => console.log("CHECK", ...a);
await begin();
await shot("01-new-game");
log("new game", JSON.stringify(await T("questState")), await T("getClock"));
await snowJack({ page, T, shot });
const qs = await T("questState");
log("first snow", qs.snow === 3 ? "PASS" : "FAIL", "jackTrust", qs.jackTrust, "bunkerSeen", qs.bunkerSeen);
await T("leave"); await page.waitForTimeout(800);
// fight: walk up to the nearest live hostile and use Attack
const me = await T("getPos");
const foes = (await T("enemies")).filter(e => !e.dead && !e.quest).sort((a, b) => Math.hypot(a.x - me.x, a.y - me.y) - Math.hypot(b.x - me.x, b.y - me.y));
const foe = foes[0]; log("foe", JSON.stringify(foe));
await T("setHp", 400); await T("setZoom", 1.4);
await T("setPos", foe.x + 50, foe.y + 50); await page.waitForTimeout(400);
for (let i = 0; i < 14; i++) { await page.getByRole("button", { name: "Attack" }).first().click(); await page.waitForTimeout(350); if (i === 3) await shot("30-fight"); }
const after = (await T("enemies")).find(e => e.id === foe.id);
log("fight", after && (after.dead || after.hp < foe.hp) ? "PASS" : "FAIL", JSON.stringify(after));
await chop({ page, T, shot });
const q2 = await T("questState"); log("chopping quest value", q2.quest);
// death + respawn at the farm
await T("die"); await page.waitForTimeout(1200); await shot("50-dead");
await page.getByRole("button", { name: /wake|respawn|get up|try again/i }).first().click(); await page.waitForTimeout(2500);
const pos = await T("getPos"); const house = await T("propOf", "farmhouse");
const dist = Math.hypot(pos.x - house.x, pos.y - house.y);
log("respawn", dist < 900 ? "PASS" : "FAIL", "dist from farmhouse", Math.round(dist), JSON.stringify((await T("questState")).respawn));
await shot("51-respawned");
// journal
await page.getByRole("button", { name: "Journal" }).first().click(); await page.waitForTimeout(500); await shot("60-journal");
const jtxt = await page.evaluate(() => document.body.innerText);
log("journal", /First Snow/.test(jtxt) ? "PASS" : "FAIL");
await page.getByRole("button", { name: "Journal" }).first().click();
// save + reload
const before = await T("questState"); const clockB = await T("getClock");
await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
await page.waitForTimeout(500);
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.getByRole("button", { name: /Continue/ }).first().click(); await page.waitForTimeout(3000);
const reloaded = await T("questState");
const same = ["quest", "snow", "jackTrust", "jackMet", "bunkerSeen"].every(k => JSON.stringify(before[k]) === JSON.stringify(reloaded[k]));
log("save/reload", same ? "PASS" : "FAIL", JSON.stringify(before), "->", JSON.stringify(reloaded), clockB, "->", await T("getClock"));
await shot("70-reloaded");
console.log(JSON.stringify({ errors: errs }, null, 1));
await browser.close();
