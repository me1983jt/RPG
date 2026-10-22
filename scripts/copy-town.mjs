// v14.3: put the town game at public/towns/<id>/index.html before dev/build.
// Real town: TOWN_HARMONY_SRC (a .html file or a folder with index.html/harmony.html), default /workspace/long-winter-demo/harmony.html.
// If it's not there, the stub in towns-stub/harmony.html is used. The source is only read, never changed.
import { cpSync, copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const towns = [{ id: "harmony", src: process.env.TOWN_HARMONY_SRC || "/workspace/long-winter-demo/harmony.html", stub: join(root, "towns-stub/harmony.html") }];
for (const t of towns) {
  const out = join(root, "public/towns", t.id);
  mkdirSync(out, { recursive: true });
  let used = "stub";
  if (existsSync(t.src) && statSync(t.src).isDirectory()) {
    cpSync(t.src, out, { recursive: true, filter: (p) => !/node_modules|\.git(\/|$)/.test(p) });
    const main = ["index.html", `${t.id}.html`].find((f) => existsSync(join(t.src, f)));
    if (main && main !== "index.html") copyFileSync(join(t.src, main), join(out, "index.html"));
    used = main ? t.src : "stub";
    if (!main) copyFileSync(t.stub, join(out, "index.html"));
  } else if (existsSync(t.src)) {
    // single file: copy it plus any siblings it ships with (assets in the same folder)
    cpSync(dirname(t.src), out, { recursive: true, filter: (p) => !/node_modules|\.git(\/|$)/.test(p) });
    copyFileSync(t.src, join(out, "index.html"));
    used = t.src;
  } else copyFileSync(t.stub, join(out, "index.html"));
  console.log(`town ${t.id}: ${used} -> public/towns/${t.id}/index.html`);
}
