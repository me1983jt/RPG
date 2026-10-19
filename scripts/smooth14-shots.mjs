// v14 smoothness: record walking + camera on the v13.5 build (8113) and v14 (8112), side by side, plus frame timing.
import { createRequire } from "node:module";
const require = createRequire("/workspace/maine-rpg/v11/package.json");
const { chromium } = require("playwright");
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
const out = {};
for (const [tag, url] of [["before", "http://127.0.0.1:8113/"], ["after", "http://127.0.0.1:8112/"]]) {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--disable-gpu-vsync"] });
  const dir = `/tmp/vid-${tag}`; mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 860 }, recordVideo: { dir, size: { width: 412, height: 860 } } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__v13Quiet = true; window.__v14Skip = true; localStorage.setItem("maine-rpg-hud", JSON.stringify({ quest: true, health: true, aim: true, mini: true })); });
  await page.goto(url, { waitUntil: "networkidle" }); await page.waitForTimeout(2500);
  await page.fill("#wanderer-name", "Justin");
  await page.getByRole("button", { name: /Hunter/ }).click(); await page.getByRole("button", { name: "Next" }).click(); await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Keen eye/ }).click(); await page.getByRole("button", { name: /Begin as/ }).click();
  await page.waitForTimeout(3500);
  await page.evaluate(() => { const c = window.__controlsTest; c.setHour?.(12); for (let i = 0; i < 6; i++) c.choose?.("close"); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { window.__fr = []; let l = performance.now(); const f = (t) => { window.__fr.push(t - l); l = t; if (window.__fr.length < 100000) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const t0 = Date.now();
  for (const [k, ms] of [["KeyD", 1300], ["KeyS", 900], ["KeyA", 1300], ["KeyW", 900], ["KeyD", 500]]) { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); await page.waitForTimeout(250); }
  const fr = await page.evaluate(() => window.__fr.slice(5));
  const fs = await page.evaluate(() => window.__controlsTest.frameStats?.());
  const s = [...fr].sort((a, b) => a - b);
  out[tag] = { frames: fr.length, avgMs: +(fr.reduce((a, b) => a + b, 0) / fr.length).toFixed(2), p95Ms: +s[Math.floor(s.length * .95)].toFixed(2), over20: fr.filter((x) => x > 20).length, renderAvg: fs?.avg, renderP95: fs?.p95 };
  await ctx.close(); await browser.close();
  const f = readdirSync(dir).find((x) => x.endsWith(".webm")); renameSync(`${dir}/${f}`, `/tmp/${tag}.webm`);
  out[tag].len = (Date.now() - t0) / 1000;
}
console.log(JSON.stringify(out, null, 1));
// last ~5.8 s of each = the walk; side by side
execSync(`ffmpeg -y -loglevel error -sseof -6.2 -i /tmp/before.webm -sseof -6.2 -i /tmp/after.webm -filter_complex "[0:v]drawtext=text='v13.5 before':x=10:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[a];[1:v]drawtext=text='v14 after':x=10:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[b];[a][b]hstack" -r 30 /workspace/maine-rpg/beta29-shots/v14-smooth-walk-before-after.mp4`);
execSync(`ffmpeg -y -loglevel error -i /workspace/maine-rpg/beta29-shots/v14-smooth-walk-before-after.mp4 -vf "fps=15,scale=600:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" /workspace/maine-rpg/beta29-shots/v14-smooth-walk-before-after.gif`);
