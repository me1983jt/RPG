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
