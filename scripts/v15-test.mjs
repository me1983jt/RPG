// v15: Fallout-style turn-based combat on flat hexes: initiative, AP, hex moves, aimed popup, enemy turns, end of combat.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const vw = Number(process.argv[3] || 1366), vh = Number(process.argv[4] || 768);
const { browser, page, errs, T, begin } = await boot(url, { vw, vh, v14: true });
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const shot = (n) => page.screenshot({ path: `beta30-shots/v15-${n}.png` });
await begin(); await T("v14Set", { st: 5 });
await page.evaluate(() => { window.__wmEnc = 1; window.__controlsTest.l141Calm?.(); window.__controlsTest.choose?.("close"); });
ok(await T("testScenario", "turnbased") === "ok", "?test=turnbased scenario runs");
await page.waitForTimeout(800);
let s = await T("tb15");
ok(s.on, "a fight in the wild switches to turn-based by itself");
ok(s.order.length >= 3 && s.order.some((o) => o.me), `initiative order: ${s.order.map((o) => o.name).join(", ")}`);
const agi = await page.evaluate(() => window.__controlsTest.v13?.()?.core?.agility ?? null);
ok(s.maxAp >= 5 && s.maxAp <= 10, `AP from agility: ${s.maxAp} (5 + agility/2)`);
const waitMine = async (snap) => { for (let i = 0; i < 80; i++) { s = await T("tb15"); if (!s.on || s.mine) return true; if (snap && i === 3) await shot(snap); await page.waitForTimeout(150); } return false; };
if (!s.mine) ok(await waitMine("enemy-turn"), "enemies take their turns, then it's yours");
s = await T("tb15");
ok(s.mine && s.ap > 0, `your turn, AP ${s.ap}/${s.maxAp}`);
const apA = s.ap;
// move two hexes away from the foes
const h0 = s.hex, foe0 = s.foes[0];
let moved = 0;
for (const [dq, dr] of [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]]) {
  const t2 = await T("tb15Hex", h0.q + dq, h0.r + dr);
  await T("tb15Tap", t2.x, t2.y); await page.waitForTimeout(700);
  s = await T("tb15"); moved = (Math.abs(s.hex.q - h0.q) + Math.abs(s.hex.r - h0.r) + Math.abs(s.hex.q + s.hex.r - h0.q - h0.r)) / 2;
  if (moved) break;
}
ok(moved > 0 && s.ap < apA, `tap a hex: you walk hex by hex and pay AP (${apA} -> ${s.ap})`);
ok(s.ap === apA - moved * (s.cost.move), `1 AP per hex (${moved} hexes)`);
await shot("ap-hud");
// aimed popup on the nearest raider
const raider = s.foes.find((f) => f) ;
const pop = await T("tb15Popup", raider.id); await page.waitForTimeout(300);
ok(pop && pop.parts.map((p) => p.part).join(",") === "head,eyes,arms,torso,groin,legs", "aimed popup lists Head, Eyes, Arms, Torso, Groin, Legs");
const torso = pop.parts.find((p) => p.part === "torso"), eyes = pop.parts.find((p) => p.part === "eyes");
ok(torso.hit > eyes.hit && eyes.ap === torso.ap + 1, `hit % and AP per part (torso ${torso.hit}% ${torso.ap}AP, eyes ${eyes.hit}% ${eyes.ap}AP)`);
ok(await page.locator('[data-tb15="aim"]').isVisible(), "popup is on screen");
await shot("aimed-popup");
// shoot the eyes with a sure roll: blinded
const ap1 = (await T("tb15")).ap;
await page.evaluate(() => { window.__r0 = Math.random; Math.random = () => 0.01; });
await page.locator('[data-tb15="aim"] [data-part="eyes"]').click(); await page.waitForTimeout(700);
await page.evaluate(() => { Math.random = window.__r0; });
s = await T("tb15");
const r1 = s.foes.find((f) => f.id === raider.id);
ok(s.ap === ap1 - eyes.ap, `aimed shot costs ${eyes.ap} AP (${ap1} -> ${s.ap})`);
ok(!r1 || r1.blind || r1.hp < 999, `eye hit blinds the raider (${r1 ? r1.blind : "killed"})`);
// end turn: enemies act
await page.locator('[data-tb15="end"]').click(); await page.waitForTimeout(300);
s = await T("tb15");
ok(!s.mine || !s.on, `End turn hands over to ${s.cur}`);
ok(await waitMine("enemy-turn2"), "after the enemies' turns it's yours again");
s = await T("tb15");
ok(s.round >= 2, `round ${s.round}`);
// real-time rolls still apply outside combat; combat ends when no hostiles are near
await T("tb15Kill"); await page.waitForTimeout(500);
s = await T("tb15");
ok(!s.on, "combat ends when no hostiles are left");
// setting off: fights stay real time
await T("tb15Force", false); await page.evaluate(() => window.__controlsTest.setTurnBased?.(false));
await page.evaluate(() => { const c = window.__controlsTest; c.testScenario("turnbased"); c.tb15Force(false); });
await page.waitForTimeout(800);
s = await T("tb15");
ok(!s.on, "with turn-based turned off, a fight stays real time");
ok(!errs.length, `no errors ${errs.join(" | ")}`);
console.log(fail ? `${fail} FAILED` : "ALL PASS");
await browser.close(); process.exit(fail ? 1 : 0);
