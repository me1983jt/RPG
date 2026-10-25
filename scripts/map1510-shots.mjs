// v15.10.3: dump the 3x home map and take in-game shots at its new edges.
import { boot } from "./v4-lib.mjs";
import { writeFileSync } from "node:fs";
const dir = process.argv[2] || "/workspace/maine-rpg/shots/m3";
const { browser, page } = await boot("http://127.0.0.1:8112/", { vw: 1280, vh: 860, safe: true });
const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
await page.getByTestId("hero-justin").click();
await page.getByRole("button", { name: /Hunter/ }).click();
await page.getByRole("button", { name: "Next" }).click();
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
await page.getByRole("button", { name: "Next" }).click();
await page.getByRole("button", { name: /Keen eye/ }).click();
await page.getByRole("button", { name: /Begin as/ }).click();
await page.waitForTimeout(3500);
const C = (f, a) => page.evaluate(f, a);
const m = await C(() => window.__controlsTest.v1510Map());
writeFileSync(`${dir}/map.json`, JSON.stringify(m));
const spots = [["e1-castle", m.castle.tx + 1, m.castle.ty + 1, 0.75], ["e2-north-gate", m.gates.find((g) => g.side === 0).ax, m.gates.find((g) => g.side === 0).ay, 1.0], ["e3-moosehead", 120, 54, 0.8], ["e4-south-kennebec", 162, 244, 1.0]];
for (const [n, tx, ty, z] of spots) {
  await C(([tx, ty, z]) => { const c = window.__controlsTest; c.choose?.("close"); c.setHour(12); c.v13Weather("clear"); c.v15Tp(tx * 64 + 32, ty * 64 + 32); c.setZoom(z); }, [tx, ty, z]);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${dir}/${n}.png` });
}
console.log(JSON.stringify({ gates: m.gates, castle: m.castle, errs }));
await browser.close();
