// size198: real-world size check. Every sprite type has a real height in inches in src/game/sizes.ts (SIZE_IN);
// drawn size = inches x PX_PER_IN / fit. This fails if anything drawn in the iso world strays from that table.
//   node scripts/size198-test.mjs --static     table + art check, no browser (runs before every build: prebuild)
//   node scripts/size198-test.mjs [url]        static check, then the rendered sizes in the running game (default :8112)
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { transformWithOxc } from "vite";
const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2), staticOnly = args.includes("--static");
const url = args.find((a) => /^https?:/.test(a)) || "http://127.0.0.1:8112/";
const TOL = 0.04; // 4%: rounding to whole px plus alpha edge noise
let fail = 0; const ok = (c, m) => { if (!c || !staticOnly) console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };

// --- load the size table (TypeScript, no imports) ---
const ts = readFileSync(join(root, "src/game/sizes.ts"), "utf8");
const { code } = await transformWithOxc(ts, "sizes.ts", { lang: "ts" });
const S = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
const { SIZE_IN, PX_PER_IN, PROP_FIT, TOWN_FIT, BEAST_FIT, propH, townH } = S;
const asTs = readFileSync(join(root, "src/game/art-scale.ts"), "utf8");
const AS = await import("data:text/javascript;base64," + Buffer.from((await transformWithOxc(asTs, "art-scale.ts", { lang: "ts" })).code).toString("base64"));

// --- tiny PNG reader (8-bit RGB/RGBA, non-interlaced: all the game's art) ---
function png(file) {
  const b = readFileSync(file); let p = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (p < b.length) { const len = b.readUInt32BE(p), type = b.toString("ascii", p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8 || d[12]) throw new Error(`${file}: unsupported png`); }
    if (type === "IDAT") idat.push(d); p += 12 + len; }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : ct === 4 ? 2 : 1, raw = inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), o = y * stride;
    for (let x = 0; x < stride; x++) { const a = x >= bpp ? out[o + x - bpp] : 0, up = y ? out[o - stride + x] : 0, c = y && x >= bpp ? out[o - stride + x - bpp] : 0; let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1; else if (f === 4) { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      out[o + x] = v & 255; } }
  const alpha = (x, y) => (ct === 6 ? out[(y * w + x) * 4 + 3] : ct === 4 ? out[(y * w + x) * 2 + 1] : 255);
  return { w, h, alpha };
}
const vis = (im, x0, y0, sw, sh, thr = 0) => { let top = -1, bot = -1; for (let y = 0; y < sh; y++) { let hit = false; for (let x = 0; x < sw; x++) if (im.alpha(x0 + x, y0 + y) > thr) { hit = true; break; } if (hit) { if (top < 0) top = y; bot = y; } } return top < 0 ? 0 : (bot - top + 1) / sh; };

// --- static: the table itself ---
const near = (a, b, t = TOL) => Math.abs(a - b) <= b * t;
ok(SIZE_IN.hero === 74 && near(SIZE_IN.npc, 70, .03), `hero ${SIZE_IN.hero} in, NPCs ${SIZE_IN.npc} in (about 70)`);
ok(SIZE_IN.door === 80 && SIZE_IN["town-fence"] === 48 && SIZE_IN.fence === 48, "door 80 in, fences 48 in");
const hr = SIZE_IN["town-house"] / SIZE_IN.hero; ok(hr > 4.15 && hr < 4.45, `house is ${hr.toFixed(2)}x the hero (~4.3, real doors)`);
ok(SIZE_IN.moose > SIZE_IN.deer && SIZE_IN.grok > SIZE_IN.hero && SIZE_IN["town-church"] > SIZE_IN["town-house"] && SIZE_IN["town-shed"] < SIZE_IN["town-house"] && SIZE_IN["car-truck"] > SIZE_IN["car-sedan"], "ordering: moose > deer, Grok > hero, church > house > shed, truck > sedan");
ok(near(PX_PER_IN, 129 * .806 / 74, .005), `PX_PER_IN ${PX_PER_IN} matches the 129 px hero sheet (fit .806)`);

// --- static: the art still has the opaque share the table assumes; drawn heights land on the table ---
const types = readFileSync(join(root, "src/game/types.ts"), "utf8");
const specs = [...types.matchAll(/^\s*"?([\w-]+)"?: \{[^}]*drawH: ([^,]+), image: "([^"]+)"/gm)];
ok(specs.length > 60, `PROP_SPEC parsed (${specs.length} kinds)`);
for (const [, kind, dh, image] of specs) {
  ok(dh === `propH("${kind}")`, `${kind}: drawH comes from the size table (${dh})`);
  const im = png(join(root, "public/game", image + ".png")), fit = vis(im, 0, 0, im.w, im.h);
  ok(near(fit, PROP_FIT[kind], .02), `${kind}: art opaque share ${fit.toFixed(3)} vs PROP_FIT ${PROP_FIT[kind]}`);
  const inches = propH(kind) * fit / PX_PER_IN;
  ok(near(inches, SIZE_IN[kind]), `${kind}: drawn ${inches.toFixed(1)} in vs table ${SIZE_IN[kind]} in`);
}
for (const [key, art] of [["town-house", "house"], ["town-church", "church"], ["town-farmhouse", "farmhouse"], ["town-farmhouse-lone", "farmhouse"], ["town-shed", "shed"], ["town-sign", "sign"], ["town-fence", "fence"]]) {
  const im = png(join(root, "public/game/town", art + ".png")), fit = vis(im, 0, 0, im.w, im.h);
  ok(near(fit, TOWN_FIT[art], .02), `town ${art}: art opaque share ${fit.toFixed(3)} vs TOWN_FIT ${TOWN_FIT[art]}`);
  const inches = townH(key, art) * fit / PX_PER_IN;
  ok(near(inches, SIZE_IN[key]), `${key}: drawn ${inches.toFixed(1)} in vs table ${SIZE_IN[key]} in`);
}
for (const [sheet, f] of Object.entries(BEAST_FIT)) {
  const im = png(join(root, "public/game", sheet + ".png")), cw = 88 * (AS.ART_SCALED.has(sheet) ? AS.ART_SCALE : 1), cols = im.w % cw === 0 ? im.w / cw : 4, rows = 8, sw = Math.floor(im.w / cols), sh = Math.floor(im.h / rows);
  let sum = 0; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) sum += vis(im, c * sw, r * sh, sw, sh, 60);
  ok(near(sum / (rows * cols), f, .02), `${sheet}: mean visible share ${(sum / (rows * cols)).toFixed(3)} vs BEAST_FIT ${f}`);
}
console.log(`size198 static: ${fail ? fail + " FAILED" : "ok"} (${Object.keys(SIZE_IN).length} sizes, ${specs.length} props)`);
if (staticOnly || fail) process.exit(fail ? 1 : 0);

// --- rendered: what the running game actually draws near Harmony ---
const { boot } = await import("./v4-lib.mjs");
const { browser, page, errs, T, begin } = await boot(url, { vw: 1600, vh: 1000, v14: true });
await begin();
const s = await T("v15Start");
await T("v15Tp", s.harmony.x + 275, s.harmony.y + 25); // real doors: Harmony is ~2500 px wide now; stand a bit east so the shed is in view too await page.waitForTimeout(3000);
for (const kind of ["moose", "deer", "wolf"]) await page.evaluate((k) => window.__controlsTest.sizeSpawn?.(k), kind);
await page.waitForTimeout(1500);
const r = await T("sizeCheck");
const seen = new Set(r.out.map((o) => o.key));
for (const k of ["hero", "npc", "town-house", "town-church", "town-farmhouse", "town-shed", "town-sign", "town-fence"]) ok(seen.has(k), `rendered: ${k} was drawn`);
for (const o of r.out) {
  const lo = o.want * o.lo * (1 - TOL), hi = o.want * o.hi * (1 + TOL);
  ok(o.px >= lo && o.px <= hi, `rendered ${o.name} (${o.key}): ${o.inches} in visible vs table ${o.tableIn} in${o.lo !== 1 ? " (tree spread)" : ""}`);
}
ok(!errs.filter((e) => /pageerror/.test(e)).length, "no page errors");
await browser.close();
console.log(fail ? `${fail} FAILED` : "ALL PASS");
process.exit(fail ? 1 : 0);
