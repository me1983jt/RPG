import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const out = "/opt/cursor/artifacts/combat-poses";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
await page.addInitScript(() => { window.__v13Quiet = true; window.__tbOff = true; window.__safeOff = true; });
await page.goto("http://127.0.0.1:8080/?test=guns", { waitUntil: "domcontentloaded", timeout: 30000 });
const ready = await page.waitForFunction(() => {
  const p = window.__controlsTest?.pose15?.({ weaponId: "carbine", dir: 6 });
  return p && p.act === "rifle-aim";
}, null, { timeout: 25000 }).then(() => true).catch((e) => String(e));
console.log("ready", ready);
if (ready !== true) {
  console.log("body", (await page.locator("body").innerText()).slice(0, 400));
  await page.screenshot({ path: `${out}/boot-fail.png` });
  await browser.close();
  process.exit(1);
}
const pose = (patch) => page.evaluate((p) => window.__controlsTest.pose15(p), patch);
const log = async () => {
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__controlsTest.heroLogStart());
  await page.waitForTimeout(250);
  return page.evaluate(() => window.__controlsTest.heroLogTake().map((l) => l.name));
};
const clip = { x: 400, y: 150, width: 300, height: 340 };
let fail = 0;
const ok = (v, m) => { console.log((v ? "PASS " : "FAIL ") + m); if (!v) fail++; };
const cases = [
  ["unarmed-still", { weaponId: "", dir: 6 }, null],
  ["rifle-aim", { weaponId: "carbine", dir: 6 }, "rifle-aim"],
  ["rifle-walk", { weaponId: "carbine", dir: 6, moving: true, anim: 33 }, "rifle-walk"],
  ["rifle-fire", { weaponId: "carbine", dir: 2, fire: true, swing: 0.4 }, "rifle-fire"],
  ["rifle-crouch", { weaponId: "carbine", dir: 6, crouch: true }, "rifle-crouch"],
  ["rifle-crouch-fire", { weaponId: "carbine", dir: 1, crouch: true, fire: true, swing: 0.4 }, "rifle-crouch-fire"],
  ["rifle-reload", { weaponId: "carbine", dir: 7, reload: true }, "rifle-reload"],
  ["pistol-aim", { weaponId: "revolver", dir: 6 }, "pistol-aim"],
  ["pistol-fire", { weaponId: "revolver", dir: 6, fire: true, swing: 0.4 }, "pistol-fire"],
  ["pistol-walk", { weaponId: "revolver", dir: 3, moving: true, anim: 44 }, "pistol-walk"],
  ["pistol-crouch", { weaponId: "revolver", dir: 5, crouch: true }, "pistol-crouch"],
  ["knife-ready", { weaponId: "knife", dir: 6 }, "knife-ready"],
  ["knife-atk", { weaponId: "knife", dir: 2, fire: true, swing: 0.3 }, "knife-atk"],
  ["knife-walk", { weaponId: "knife", dir: 7, moving: true, anim: 22 }, "knife-walk"],
  ["knife-crouch-atk", { weaponId: "knife", dir: 1, crouch: true, fire: true, swing: 0.25 }, "knife-crouch-atk"],
  ["axe-legacy", { weaponId: "hatchet", dir: 6, fire: true, swing: 0.3 }, null],
];
for (const [name, patch, act] of cases) {
  const got = await pose(patch);
  const names = await log();
  ok(got?.act === act, `${name} chose ${got?.act} (want ${act})`);
  if (act) ok(names.includes(`pl/${act}`), `${name} drew pl/${act} (${[...new Set(names)].join(",")})`);
  else ok(!names.some((n) => /pl\/(rifle|pistol|knife)-/.test(n)), `${name} stayed off the new sheets (${[...new Set(names)].join(",")})`);
  await page.screenshot({ path: `${out}/${name}.png`, clip });
}
const dirs = [];
for (const dir of [5, 6, 7, 1, 2, 3]) {
  const got = await pose({ weaponId: "carbine", dir, moving: true, anim: 11 * 3 });
  dirs.push(`${dir}:${got?.act}`);
  await page.screenshot({ path: `${out}/rifle-walk-dir-${dir}.png`, clip });
}
ok(dirs.every((d) => d.endsWith("rifle-walk")), `all six facings walk with the rifle (${dirs.join(" ")})`);
const b0 = await pose({ weaponId: "", spawn: "armor", eid: 9000, edir: 0, dx: 120, dy: -30 });
const b1 = await pose({ spawn: "armor", eid: 9001, edir: 6, emoving: true, dx: -130, dy: 40 });
const b2 = await pose({ spawn: "armor", eid: 9002, edir: 2, eattack: true, dx: 40, dy: 130 });
console.log("bandits", JSON.stringify([b0?.bandit, b1?.bandit, b2?.bandit]));
ok(b0?.bandit?.name === "v2/bandit-armor-rifle-aim", "south rifle plate holds rifle-aim");
ok(b1?.bandit?.name === "v2/bandit-armor-pistol-walk", "pistol plate uses pistol-walk");
ok(b2?.bandit?.name === "v2/bandit-armor-axe", "knife plate attack falls back to the axe sheet");
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/bandit-armor-trio.png` });
ok(!errs.length, `no page errors ${errs.slice(0, 3).join(" | ")}`);
await browser.close();
process.exit(fail ? 1 : 0);
