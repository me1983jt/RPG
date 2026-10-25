// v15.10 screenshots: Sarah + raccoon outdoors, Justin's quest dialogue, Sarah's run in several facings, wildlife.
import { boot } from "./v4-lib.mjs";
const dir = process.argv[2] || "/workspace/maine-rpg/shots";
const { browser, page } = await boot("http://127.0.0.1:8112/", { vw: 1280, vh: 860, safe: true });
await page.getByTestId("hero-sarah").click();
await page.getByRole("button", { name: /Hunter/ }).click();
await page.getByRole("button", { name: "Next" }).click();
for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "+" }).nth(4).click();
await page.getByRole("button", { name: "Next" }).click();
await page.getByRole("button", { name: /Keen eye/ }).click();
await page.getByRole("button", { name: /Begin as/ }).click();
await page.waitForTimeout(3500);
const C = (f, a) => page.evaluate(f, a);
await C(() => { const c = window.__controlsTest; c.choose?.("close"); c.setHour(12); c.v13Weather("clear"); const s = c.v15Start(); c.v15Tp(s.farm.x + 260, s.farm.y + 420); c.setZoom(2.2); });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${dir}/10-sarah-raccoon.png` });
// walk so the raccoon trots after her
for (const [dx, dy, n] of [[700, 0, "11-run-a"], [0, 700, "12-run-b"], [-700, 0, "13-run-c"], [0, -700, "14-run-d"], [500, -500, "18-run-e"], [-500, 500, "19-run-f"]]) {
  await C(([dx, dy]) => { const c = window.__controlsTest; const p = c.v15Probe1510().player; c.walkTo(p.x + dx, p.y + dy); }, [dx, dy]);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${dir}/${n}.png` });
}
await C(() => window.__controlsTest.setKeys([]));
await page.waitForTimeout(1200);
await C(() => window.__controlsTest.choose("q11-hunt"));
await page.waitForTimeout(500);
await page.screenshot({ path: `${dir}/15-justin-quest.png` });
await C(() => window.__controlsTest.choose("close"));
// wildlife close-up: spawn one of each beside her, by water if we can
await C(() => { const c = window.__controlsTest; const p = c.v15Probe1510().player; c.v15Wild("raccoon", p.x + 160, p.y - 60); c.v15Wild("turtle", p.x + 120, p.y + 120); c.setZoom(2.6); });
await page.waitForTimeout(800);
await page.screenshot({ path: `${dir}/16-wildlife.png` });
console.log(JSON.stringify((await C(() => window.__controlsTest.v15Probe1510())).wild.list));
await browser.close();
