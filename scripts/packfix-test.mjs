// pack-screen doll per weapon sheet, with snowshoes / steel-toe overlays. usage: node packfix-test.mjs URL OUTDIR vw vh
import { boot } from "./v4-lib.mjs";
const [url, out, vw = "844", vh = "390"] = process.argv.slice(2);
const { browser, page, errs, T, begin } = await boot(url, { vw: +vw, vh: +vh });
await begin(); await T("setHp", 9999);
const tag = `${vw}x${vh}`;
for (const id of ["hatchet", "pick", "knife", "snowshoes", "steeltoes"]) await T("giveItem", id, 1);
const res = {};
for (const [w, feet] of [["", "snowshoes"], ["hatchet", "steeltoes"], ["pick", "snowshoes"], ["carbine", "steeltoes"], ["knife", "snowshoes"], ["carbine", "boots"]]) {
  if (w) await T("invEquip", w, "main"); else await T("invUnequip", "main");
  await T("invEquip", feet, "feet");
  await T("togglePack"); await page.waitForTimeout(1200);
  const name = `pack-${tag}-${w || "bare"}-${feet}`;
  await page.screenshot({ path: `${out}/${name}.png` });
  const fig = page.locator("img[src^='data:image']").first();
  const b = await fig.boundingBox().catch(() => null);
  if (b) await page.screenshot({ path: `${out}/doll-${name}.png`, clip: { x: b.x - 6, y: b.y - 6, width: b.width + 12, height: b.height + 12 } });
  res[name] = (await T("dbgInv")).slots;
  await page.locator('button[aria-label="Close pack"]').click(); await page.waitForTimeout(300);
}
res.errors = errs; console.log(JSON.stringify(res)); await browser.close();
