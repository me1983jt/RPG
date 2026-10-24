// Regenerates stats_rules.js from stats.json (towns run from file:// and in the APK, where fetch() of JSON fails).
// Also copies stats_rules.js into Maine RPG (src/game/stats_rules.js), which the main game loads, so its build doesn't depend on this folder.
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const dir = process.env.SHARED_RULES || "/workspace/shared-rules";
const raw = fs.readFileSync(path.join(dir, "stats.json"), "utf8"); const data = JSON.parse(raw);
const js = `// @ts-nocheck\n// GENERATED from stats.json by tools/gen-stats-js.mjs. Do not edit by hand.\n(function (g) { g.STATS_RULES = ${JSON.stringify(data, null, 1)}; if (typeof module !== "undefined") module.exports = g.STATS_RULES; })(typeof window !== "undefined" ? window : globalThis);\n`;
fs.writeFileSync(path.join(dir, "stats_rules.js"), js);
const rpg = process.env.RPG_DIR || "/workspace/maine-rpg/v11";
if (fs.existsSync(path.join(rpg, "src/game"))) { fs.writeFileSync(path.join(rpg, "src/game/stats_rules.js"), js); fs.rmSync(path.join(rpg, "src/game/stats.json"), { force: true }); }
console.log("wrote stats_rules.js" + (fs.existsSync(rpg) ? " and " + rpg + "/src/game/stats_rules.js" : ""));
