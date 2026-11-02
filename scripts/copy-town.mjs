// v14.3: put the town games at public/towns/<id>/index.html before dev/build (harmony, pittsfield, skowhegan).
// Real town: TOWN_HARMONY_SRC (a .html file or a folder with index.html/harmony.html), default /workspace/quest-harmony.
// If it's not there, the stub in towns-stub/harmony.html is used. The source is only read, never changed.
import { cpSync, copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
// v15.1: Pittsfield and Skowhegan town games (Quest RPG) ride along the same way; each falls back to the Harmony stub.
const stubOf = (id) => (existsSync(join(root, `towns-stub/${id}.html`)) ? join(root, `towns-stub/${id}.html`) : join(root, "towns-stub/harmony.html"));
const towns = [
  { id: "harmony", src: process.env.TOWN_HARMONY_SRC || "/workspace/quest-harmony" },
  { id: "pittsfield", src: process.env.TOWN_PITTSFIELD_SRC || "/workspace/quest-pittsfield" },
  { id: "skowhegan", src: process.env.TOWN_SKOWHEGAN_SRC || "/workspace/quest-skowhegan" },
  // v15.9.9: Greenville town game copied in as-is (v15.10.6: on the world map at the Greenville landing)
  { id: "greenville", src: process.env.TOWN_GREENVILLE_SRC || "/workspace/quest-greenville" },
  // v15.10.6: the castle (Dixville Notch). Quest RPG has not built it yet, so towns-stub/castle.html (closed gates) stands in
  { id: "castle", src: process.env.TOWN_CASTLE_SRC || "/workspace/quest-castle" },
].map((t) => ({ ...t, stub: stubOf(t.id) }));
for (const t of towns) {
  const out = join(root, "public/towns", t.id);
  mkdirSync(out, { recursive: true });
  let used = "stub";
  if (existsSync(t.src) && statSync(t.src).isDirectory()) {
    cpSync(t.src, out, { recursive: true, filter: (p) => !/node_modules|\.git(\/|$)|\/(shots|tests)(\/|$)|\/assets\/goose\/src(\/|$)|\.py$/.test(p.slice(t.src.length)) });
    const main = ["index.html", `${t.id}.html`].find((f) => existsSync(join(t.src, f)));
    if (main && main !== "index.html") copyFileSync(join(t.src, main), join(out, "index.html"));
    used = main ? t.src : "stub";
    if (!main) copyFileSync(t.stub, join(out, "index.html"));
  } else if (existsSync(t.src)) {
    // single file: copy it plus any siblings it ships with (assets in the same folder)
    cpSync(dirname(t.src), out, { recursive: true, filter: (p) => !/node_modules|\.git(\/|$)|\/(shots|tests)(\/|$)|\/assets\/goose\/src(\/|$)|\.py$/.test(p.slice(dirname(t.src).length)) });
    copyFileSync(t.src, join(out, "index.html"));
    used = t.src;
  } else copyFileSync(t.stub, join(out, "index.html"));
  mkdirSync(join(root, "public/towns/_stub"), { recursive: true });
  copyFileSync(t.stub, join(root, "public/towns/_stub", `${t.id}.html`));
  // v15.9: the towns load shared/stats_rules.js (../shared-rules doesn't exist inside the APK); keep it the current master
  const rules = process.env.SHARED_RULES_JS || "/workspace/shared-rules/stats_rules.js";
  if (existsSync(rules)) { mkdirSync(join(out, "shared"), { recursive: true }); copyFileSync(rules, join(out, "shared/stats_rules.js")); }
  console.log(`town ${t.id}: ${used} -> public/towns/${t.id}/index.html`);
}

// v15.13.4: APK size. Harmony ships ~80 MB of unused concept PNGs in img/scenes: its scene loader only asks for
// img/scenes/<id>.jpg (scenes_art.js B()). In a town whose loader is .jpg-only, drop scene files that are not .jpg and
// are not named anywhere in the town's code. Other towns are left as they are.
import { readdirSync, readFileSync, rmSync } from "node:fs";
for (const t of towns) {
  const out = join(root, "public/towns", t.id), scenes = join(out, "img/scenes"), art = join(out, "js/scenes_art.js");
  if (!existsSync(scenes) || !existsSync(art) || !/img\/scenes\/'\s*\+\s*id\s*\+\s*'\.jpg'/.test(readFileSync(art, "utf8"))) continue;
  let text = "";
  const walk = (d) => { for (const f of readdirSync(d, { withFileTypes: true })) { const p = join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.(js|html|css|json|mjs)$/.test(f.name)) text += readFileSync(p, "utf8"); } };
  walk(out);
  let n = 0, bytes = 0;
  for (const f of readdirSync(scenes)) if (!f.endsWith(".jpg") && !text.includes(f)) { bytes += statSync(join(scenes, f)).size; rmSync(join(scenes, f)); n++; }
  if (n) console.log(`town ${t.id}: pruned ${n} unused scene files (${(bytes / 1048576).toFixed(1)} MB)`);
}

// v15.13.4: APK size. The five town games ship the same art (npc walk sheets, anim_v2, shared scenes): ~37 MB of byte-identical
// copies in the APK. Each image that is identical in 2+ towns is stored once in public/towns/_shared/<hash>.<ext>; the towns' own
// copies are removed and a tiny loader shim (first <script> of each town's index.html) maps the old relative path to the shared
// file when the game sets an <img>/Image src. Only .png/.jpg/.webp that no .html/.css names (CSS url() can't be remapped).
// The Quest sources are never touched; this runs on the copies in public/towns.
import { createHash } from "node:crypto";
import { renameSync, writeFileSync } from "node:fs";
{
  const base = join(root, "public/towns"), shared = join(base, "_shared");
  rmSync(shared, { recursive: true, force: true }); mkdirSync(shared, { recursive: true });
  const byHash = new Map(), styleText = new Map();
  for (const t of towns) {
    const out = join(base, t.id); if (!existsSync(out)) continue;
    let st = "";
    const walk = (d) => { for (const f of readdirSync(d, { withFileTypes: true })) { const p = join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.(css|html)$/.test(f.name)) st += readFileSync(p, "utf8"); else if (/\.(png|jpe?g|webp)$/i.test(f.name) && statSync(p).size > 8192) { const h = createHash("sha1").update(readFileSync(p)).digest("hex").slice(0, 16); if (!byHash.has(h)) byHash.set(h, []); byHash.get(h).push({ town: t.id, rel: p.slice(out.length + 1), abs: p }); } } };
    walk(out); styleText.set(t.id, st);
  }
  const maps = new Map(); let saved = 0, n = 0;
  for (const [h, list] of byHash) {
    const towns2 = new Set(list.map((x) => x.town));
    if (towns2.size < 2 || list.some((x) => styleText.get(x.town).includes(x.rel))) continue;
    const ext = list[0].rel.split(".").pop().toLowerCase();
    renameSync(list[0].abs, join(shared, `${h}.${ext}`));
    for (const x of list.slice(1)) { saved += statSync(x.abs).size; rmSync(x.abs); }
    for (const x of list) { if (!maps.has(x.town)) maps.set(x.town, {}); maps.get(x.town)[x.rel] = `${h}.${ext}`; }
    n++;
  }
  for (const [id, m] of maps) {
    const idx = join(base, id, "index.html"); if (!existsSync(idx)) continue;
    const shim = `<script>/* v15.13.4 shared town art (copy-town.mjs) */(function(){var M=${JSON.stringify(m)};function f(u){if(typeof u!=="string")return u;var q=u.indexOf("?"),p=q<0?u:u.slice(0,q),s=q<0?"":u.slice(q);p=p.replace(/^\\.\\//,"");var h=M[p];return h?"../_shared/"+h+s:u}var P=HTMLImageElement.prototype,d=Object.getOwnPropertyDescriptor(P,"src");Object.defineProperty(P,"src",{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){d.set.call(this,f(v))}});var sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(k,v){return sa.call(this,k,(this instanceof HTMLImageElement&&String(k).toLowerCase()==="src")?f(v):v)};})();</script>`;
    let html = readFileSync(idx, "utf8").replace(/<script>\/\* v15\.13\.4 shared town art[\s\S]*?<\/script>/, "");
    html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m0) => m0 + shim) : shim + html;
    writeFileSync(idx, html);
  }
  console.log(`towns: ${n} shared images stored once in _shared (${(saved / 1048576).toFixed(1)} MB of copies removed)`);
}
