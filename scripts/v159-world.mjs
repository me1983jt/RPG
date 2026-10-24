// v15.9: one stitched picture of the whole farm-region iso world, no fog, at the 0.34 camera.
import { boot } from "./v4-lib.mjs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const url = process.argv[2] || "http://127.0.0.1:8112/";
const out = "/workspace/maine-rpg/beta30-shots/v159-world-full-nofog";
const VW = 1600, VH = 1200, Z = 0.5, ISO = 0.34, W = 156 * 64;
const { browser, page, T, begin, errs } = await boot(url, { vw: VW, vh: VH, v14: true });
await begin(); await T("v14Set", { st: 5 }); await page.evaluate(() => window.__controlsTest.choose?.("close"));
await page.evaluate(() => { window.__noFog = 1; window.__controlsTest.setZoom(0.5); const s = document.createElement("style"); s.textContent = "*{visibility:hidden!important} canvas{visibility:visible!important}"; document.head.appendChild(s); });
// crop the band above the hero (rows 3%..45%) so the hero sprite never lands in the picture
const stepX = VW / Z * 0.75, stepY = VH / Z * 0.42, OFF = 0.26 * VH / Z;
await T("setSnow", 0);
// frame the world by where its props are (the 156x156 grid has empty margins)
const all = await T("propsNear", W / 2, W / 2, W * 2);
const sxs = all.map((p) => p.x - p.y), sys = all.map((p) => (p.x + p.y) * ISO);
const sx0 = Math.min(...sxs) - 500, sx1 = Math.max(...sxs) + 500, sy0 = Math.min(...sys) - 700, sy1 = Math.max(...sys) + 300;
const dir = "/tmp/v159w"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
const tiles = [];
for (let fy = sy0 + stepY / 2; fy < sy1 + stepY / 2; fy += stepY) for (let fx = sx0 + stepX / 2; fx < sx1 + stepX / 2; fx += stepX) {
  const py = fy + OFF, x = (py / ISO + fx) / 2, y = (py / ISO - fx) / 2; // world point whose screen position is (fx, fy)
  await T("setHour", 12); await T("setPos", x, y); await page.waitForTimeout(1400);
  const f = `${dir}/t${tiles.length}.png`; await page.screenshot({ path: f }); tiles.push({ f, fx, fy });
}
fs.writeFileSync(`${dir}/tiles.json`, JSON.stringify({ tiles, VW, VH, Z, stepX, stepY, sx0, sy0, sx1, sy1 }));
console.log("tiles", tiles.length, "errors", errs.length);
await browser.close();
execFileSync("python3", ["-c", `
import json
from PIL import Image
d=json.load(open('${dir}/tiles.json')); Z=d['Z']
cw=int(d['stepX']*Z); ch=int(d['stepY']*Z)
W=int((d['sx1']-d['sx0'])*Z); H=int((d['sy1']-d['sy0'])*Z)
out=Image.new('RGB',(W,H),(12,10,8))
for t in d['tiles']:
  im=Image.open(t['f']).convert('RGB'); cx,cy=d['VW']//2,d['VH']//2
  y0=int(d['VH']*0.03); crop=im.crop((cx-cw//2,y0,cx-cw//2+cw,y0+ch))
  out.paste(crop,(int((t['fx']-d['sx0'])*Z)-cw//2,int((t['fy']-d['sy0'])*Z)-ch//2))
out.save('${out}.png'); s=3900/W; out.resize((3900,int(H*s)),Image.LANCZOS).save('${out}-small.png'); print(out.size)
`], { stdio: "inherit" });
