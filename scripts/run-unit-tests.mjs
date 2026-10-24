// v15.9.2: `npm test` that works on Node 20. Finds scripts/**/*.test.mjs itself (Node 20's --test doesn't expand globs)
// and runs the TypeScript unit tests only where --experimental-strip-types exists (Node >= 22.6).
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (f === "node_modules" ? [] : walk(p)) : [p]; });
const mjs = walk("scripts").filter((f) => f.endsWith(".test.mjs"));
let code = 0;
if (mjs.length) code = spawnSync(process.execPath, ["--test", ...mjs], { stdio: "inherit" }).status ?? 1;
const ts = ["src/lib/app-data/app-data.test.ts", "src/lib/app-data/readiness-schedule.test.ts", "src/lib/auth/gate-identity.test.ts", "src/lib/auth/sign-in-gate.test.ts", "src/lib/preview-path-prefix.test.ts"];
const [maj, min] = process.versions.node.split(".").map(Number);
if (maj > 22 || (maj === 22 && min >= 6)) code = (spawnSync(process.execPath, ["--experimental-strip-types", "--test", ...ts], { stdio: "inherit" }).status ?? 1) || code;
else console.log(`(skipping ${ts.length} TypeScript unit test files: Node ${process.versions.node} has no --experimental-strip-types; needs >= 22.6)`);
process.exit(code);
