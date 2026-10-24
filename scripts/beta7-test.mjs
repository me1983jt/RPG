// beta v7 checks: farm, Jack, pack screen with overlays, new item effects, back button, night.
// usage: node beta7-test.mjs URL OUTDIR [vw vh]
import { boot } from "./v4-lib.mjs";
// v15.9.2: url/outdir default so it runs bare (url from TEST_URL/PORT, shots to /tmp/beta7-shots)
const [url = process.env.TEST_URL || `http://127.0.0.1:${process.env.PORT || 8112}/`, out = "/tmp/beta7-shots", vw = "844", vh = "390"] = process.argv.slice(2);
await import("node:fs").then((fs) => fs.mkdirSync(out, { recursive: true }));
const { browser, page, errs, T, begin } = await boot(url, { vw: +vw, vh: +vh });
const shot = async (n, clip) => { await page.waitForTimeout(400); await page.screenshot({ path: `${out}/${n}.png`, ...(clip ? { clip } : {}) }); };
const res = {};
await begin(); await T("setHp", 9999);
// farm
const justin = (await T("npcOf", "justin")) ?? (await T("getPos")); // v15.9.2: no Justin NPC any more (you are Justin)
await T("setZoom", 1.0); await T("setPos", justin.x + 60, justin.y + 80); await page.waitForTimeout(800); await shot("b7-01-farm");
// Jack
const jack = await T("npcOf", "cal");
await T("setZoom", 1.4); await T("setPos", jack.x + 40, jack.y + 60); await page.waitForTimeout(900); await shot("b7-02-jack-stall");
await T("talk", "cal"); await page.waitForTimeout(500); await shot("b7-03-jack-talk");
await T("choose", "jack-bye"); await page.waitForTimeout(300); res.paused0 = await page.getByText("Paused").count();
// snowshoes: the only new thing in the bag at first
res.giveShoes = await T("giveItem", "snowshoes", 1);
res.giveToes = await T("giveItem", "steeltoes", 1);
const snow = await T("snowTile"); res.snowTile = snow;
const speed = async () => { await T("setPos", snow.x, snow.y); await T("walkTo", snow.x + 600, snow.y); await page.waitForTimeout(700); return await T("getSpeed"); };
await T("invEquip", "snowshoes", "feet"); res.feet1 = (await T("stats")).feet; res.speedShoes = await speed();
await T("invEquip", "steeltoes", "feet"); res.feet2 = (await T("stats")).feet; res.speedToes = await speed();
// pack with each overlay worn
for (const f of ["steeltoes", "snowshoes"]) {
  await T("invEquip", f, "feet"); await T("togglePack"); await page.waitForTimeout(900); await shot(`b7-1${f === "snowshoes" ? 1 : 0}-pack-${f}`); await page.locator('button[aria-label="Close pack"]').click(); await page.waitForTimeout(300);
}
// world close-ups of the overlays, walking SE and W
await T("setZoom", 2.4);
for (const f of ["snowshoes", "steeltoes"]) {
  await T("invEquip", f, "feet");
  for (const [dx, dy, tag] of [[400, 400, "se"], [-500, 0, "w"], [0, -500, "n"]]) {
    const p = await T("getPos"); await T("walkTo", p.x + dx, p.y + dy); await page.waitForTimeout(600);
    const q = await T("getPos"); const s = await T("screenOf", q.x, q.y);
    await shot(`b7-2-overlay-${f}-${tag}`, { x: Math.max(0, s.sx - 110), y: Math.max(0, s.sy - 200), width: 220, height: 240 });
  }
}
await T("setZoom", 1);
// sling + long gun
res.give = {};
for (const id of ["winchester", "sling", "backpack", "lantern", "binoculars"]) res.give[id] = await T("giveItem", id, 1);
await T("invEquip", "winchester", "main"); const a0 = (await T("stats")).atk;
await T("invEquip", "sling", "back"); const a1 = (await T("stats")).atk; res.sling = [a0, a1];
const r0 = (await T("dbgInv")).rows; await T("invEquip", "backpack", "back"); res.backpackRows = [r0, (await T("dbgInv")).rows];
await T("togglePack"); await page.waitForTimeout(900); await shot("b7-12-pack-new-items"); await page.locator('button[aria-label="Close pack"]').click();
// night at the farm with the lantern carried
await T("setPos", justin.x + 60, justin.y + 120); await T("setHour", 23); await page.waitForTimeout(900); await shot("b7-30-farm-night-lantern");
await T("dropItem", "lantern"); await page.waitForTimeout(500); await shot("b7-31-farm-night-no-lantern");
await T("setHour", 12); await T("setZoom", 1.4); await T("setPos", justin.x + 60, justin.y + 120); await page.waitForTimeout(700); await shot("b7-32-hero-day-gear");
// Android back button -> pause menu
res.pausedBefore = await page.getByText("Paused").count();
await T("pressBack"); await page.waitForTimeout(500); await shot("b7-40-back-button-menu");
res.pausedAfterBack = await page.getByText("Paused").count(); await T("pressBack"); await page.waitForTimeout(400); res.pausedAfterBack2 = await page.getByText("Paused").count();
res.errors = errs;
console.log(JSON.stringify(res));
await browser.close();
