// v13.4: new vehicle props load, both facings get used, and a screenshot by a wreck.
import { boot } from "./v4-lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const R = {}; const fail = [];
const check = (n, ok, info) => { R[n] = ok ? "PASS" : "FAIL"; if (!ok) fail.push(n + " " + JSON.stringify(info ?? "").slice(0, 300)); };
const { browser, page, T, begin, errs } = await boot(url, { vw: 1280, vh: 800 });
await begin();
const wait = (ms) => page.waitForTimeout(ms);
await T("setHour", 13);
let v = []; for (let i = 0; i < 10; i++) { v = await T("vehicles"); if (v.length && v.every((x) => x.art)) break; await wait(500); }
check("vehicles-present", v.length > 0, v.length);
check("all-new-art", v.length && v.every((x) => x.art && x.art.name.startsWith("v2/vehicles/")), v.filter((x) => !x.art).slice(0, 3));
check("rods-for-cars", v.filter((x) => x.kind === "car-sedan").every((x) => x.art.name.includes("car-rod")));
check("chevys-for-trucks", v.filter((x) => x.kind === "car-truck").every((x) => x.art.name.includes("truck-chevy")));
const faces = new Set(v.map((x) => x.art.name.slice(-2))); check("both-facings", faces.has("se") && faces.has("sw"), [...faces]);
// stand by the nearest rod and the nearest pickup for a picture
const p0 = await T("getPos");
const by = (k) => v.filter((x) => x.kind === k).sort((a, b) => Math.hypot(a.x - p0.x, a.y - p0.y) - Math.hypot(b.x - p0.x, b.y - p0.y))[0];
const rod = by("car-sedan"), tr = by("car-truck");
for (const [tag, x] of [["rod", rod], ["truck", tr]]) {
  if (!x) continue;
  await T("setPos", x.x + 60, x.y + 160); await wait(1500);
  await page.screenshot({ path: `/workspace/maine-rpg/beta27-shots/after-vehicle-${tag}.png` });
}
check("no-errors", !errs.length, errs.slice(0, 4));
console.log(JSON.stringify(v.slice(0, 6).map((x) => [x.kind, x.tx, x.ty, x.art?.name])));
console.log(JSON.stringify(R, null, 1)); console.log("fails:", JSON.stringify(fail, null, 1));
console.log(`${Object.values(R).filter((x) => x === "PASS").length}/${Object.keys(R).length}`);
await browser.close();
