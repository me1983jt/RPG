// size198: `npm test` also runs the static real-world size check (scripts/size198-test.mjs --static).
import { test } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
test("size198: sprite sizes match the real-world size table", () => {
  const r = spawnSync(process.execPath, [fileURLToPath(new URL("./size198-test.mjs", import.meta.url)), "--static"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
