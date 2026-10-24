// v15.9.6: every questFlag a town returns (farm.*, harmony.*, unknown keys) is kept, saved, and sent back unchanged on the
// next enterTown; forward-only keys (farm.q10/q11 stages, harmony.siegeDone, harmony.collectorDown) never move back.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 720, v14: true });
await begin(); await T("setHour", 12);
const sent = { "farm.q10.moose": 4, "farm.q11.bike": 8, "farm.q11.mill": "accepted", "harmony.siegeDone": "won", "harmony.collectorDown": true, "harmony.someNewThing": "x", "quest.custom.n": 7 };
const leave = (qf) => page.evaluate((qf) => window.__controlsTest.town143Msg({ type: "leaveTown", exit: "town", state: { questFlags: qf } }), qf);
await T("v15Open", "harmony"); await leave(sent);
// backward values from the town must not regress the stored (echoed) flags
await T("v15Open", "harmony"); await leave({ "farm.q10.moose": 2, "farm.q11.bike": "accepted", "farm.q11.mill": 3, "harmony.siegeDone": "lost", "harmony.collectorDown": false });
const want = { ...sent, "farm.q11.mill": 3 };
await page.evaluate(() => window.__controlsTest.save()); await page.waitForTimeout(400);
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
await page.getByTestId("continue-btn").click(); await page.waitForTimeout(2500);
const out = (await T("v15Open", "harmony")).msg.state.questFlags;
for (const [k, v] of Object.entries(want)) ok(out[k] === v, `${k} echoed after save/reload: ${JSON.stringify(out[k])} (want ${JSON.stringify(v)})`);
ok(typeof out["story.q11.bike"] === "number", `story.* stages still sent (story.q11.bike ${out["story.q11.bike"]})`);
ok(!errs.length, `no errors ${errs.slice(0, 2).join(" | ")}`);
console.log(fail ? `${fail} FAILED` : "ALL PASS");
await browser.close(); process.exit(fail ? 1 : 0);
