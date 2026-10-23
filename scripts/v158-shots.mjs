// v15.8 shots: town sprites, overlays, map icons, grid under, tree fade, sprite colors.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = "/workspace/maine-rpg/beta30-shots/v158-";
const { browser, page, errs, T, begin } = await boot(url, { vw: 412, vh: 915, v14: true });
const wait = (ms) => page.waitForTimeout(ms);
const shot = async (n) => { await wait(1500); await page.screenshot({ path: `${out}${n}.png` }); console.log("shot", n); };
await begin(); await T("v14Set", { st: 5 });
await page.evaluate(() => { window.__controlsTest.choose?.("close"); });
const st = await T("v15Start");
console.log("npcs", JSON.stringify(await T("v15Npcs")));
const props = await T("propsNear", st.farm.x, st.farm.y, 4000);
const kinds = {}; for (const p of props) kinds[p.kind] = (kinds[p.kind] || 0) + 1; console.log("kinds", JSON.stringify(kinds));
await T("v15Tp", st.farm.x, st.farm.y + 120); await shot("town-sprites"); await shot("sprite-colors");
const house = props.find((p) => p.kind === "farmhouse") || props.find((p) => p.kind === "shack");
if (house) { await T("v15Tp", house.x + 40, house.y + 260); await shot("overlays"); }
const tree = props.find((p) => /tree|pine|birch|spruce/.test(p.kind));
if (tree) { await T("v15Tp", tree.x - 20, tree.y - 40); await wait(1200); console.log("tree fade", JSON.stringify((await T("propsNear", tree.x, tree.y, 5)))); await shot("tree-fade"); }
await T("v15Tp", st.farm.x - 900, st.farm.y + 900);
await T("v15Spawn", 170, 30); await T("v15Spawn", 110, -120);
await page.evaluate(() => window.__controlsTest.tb15Force?.(true)); await shot("grid-under"); await T("tb15Kill");
await T("wmOpen"); await shot("map-icons");
console.log("errors", errs.length, errs.slice(0, 3));
await browser.close();
