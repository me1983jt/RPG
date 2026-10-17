// v13.5: every walk-in building can still be entered from its door after the real-size pass.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const { browser, page, T, begin, errs } = await boot(url, { vw: 1280, vh: 800 });
await begin();
const wait = (ms) => page.waitForTimeout(ms);
await T("giveItem", "pick", 1).catch(() => {});
await T("giveItem", "lockpick", 1).catch(() => {});
const R = {}; const fail = [];
for (const kind of await T("walkInKinds")) {
  if (kind === "hatch") continue;
  const door = await T("doorOf", kind); if (!door) continue;
  await T("setPos", door.x, door.y); await wait(400);
  await T("enterKind", kind);
  let ok = false;
  for (let i = 0; i < 100 && !ok; i++) { await wait(100); ok = !!(await T("insideInfo")); }
  const dbg = await T("doorDbg", kind);
  R[kind] = ok ? "PASS" : "FAIL"; if (!ok) fail.push([kind, dbg]);
  await T("leave"); await wait(700);
}
R["no-errors"] = errs.length ? "FAIL" : "PASS";
console.log(JSON.stringify(R), JSON.stringify(fail).slice(0, 600), errs.slice(0, 3));
await browser.close();
