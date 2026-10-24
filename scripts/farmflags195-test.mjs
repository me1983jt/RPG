// v15.9.5: Harmony hosts the farm quests and the siege; the main game accepts their flags and pays the original rewards once.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const run = async (choice, sd, want) => {
  const { browser, page, errs, T, begin } = await boot(url, { vw: 1280, vh: 720 });
  await begin(); await T("v13Act", 7);
  await T("v15Flags", { "harmony.choice": choice }); await T("v15Flags", { "harmony.siegeDone": sd });
  await T("v13Tick"); const m = (await T("farm195")).main;
  ok(m.siege === 2 && m.ending === want, `${choice} + siegeDone ${sd} -> ending ${m.ending} (want ${want})`);
  if (choice === "unite") {
    const f0 = await T("farm195");
    await T("v15Flags", { "farm.q11.bike": "accepted" }); ok((await T("farm195")).q11.bike === 1, "bike accepted from Harmony -> stage 1");
    await T("v15Flags", { "farm.q11.bike": "done" }); ok((await T("farm195")).q11.bike === 1, "early 'done' is refused");
    await T("v15Flags", { "farm.q11.bike": 8 }); ok((await T("farm195")).q11.bike === 8, "stage number moves it to the turn-in");
    await T("v15Flags", { "farm.q11.bike": "done" }); const f1 = await T("farm195");
    ok(f1.q11.bike === 9 && f1.gas === f0.gas + 3, `bike done pays once (+${f1.gas - f0.gas} gas)`);
    await T("v15Flags", { "farm.q11.bike": "done" }); ok((await T("farm195")).gas === f1.gas, "repeat 'done' pays nothing");
    await T("v15Flags", { "farm.q10.seed": "accepted" }); await T("v15Flags", { "farm.q10.seed": 4 }); await T("v15Flags", { "farm.q10.seed": "done" });
    const f2 = await T("farm195"); ok(f2.q10.seed === 5 && f2.stew >= 2, `seed run done via Harmony (stage ${f2.q10.seed}, stew ${f2.stew})`);
    ok(f2.hunger === 100 && f2.lv === 0 && f2.dogMode === "follow", "no hunger drain, no trade skills, Goose follows");
  }
  ok(!errs.length, `no errors ${errs.slice(0, 2).join(" | ")}`);
  await browser.close();
};
await run("unite", "won", "union"); await run("alone", "won", "alone"); await run("unite", "lost", "fallen"); await run("deal", "done", "deal");
console.log(fail ? `${fail} FAILED` : "ALL PASS"); process.exit(fail ? 1 : 0);
