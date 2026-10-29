// v15.10.13: landscape-only standard: portrait phone shows the rotate prompt, landscape phone does not.
import { chromium, devices } from "playwright";
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
let fail = 0;
for (const [d, want] of [["Pixel 7", true], ["Pixel 7 landscape", false]]) {
  const page = await (await b.newContext({ ...devices[d] })).newPage();
  await page.goto("http://127.0.0.1:8112/", { waitUntil: "networkidle" }); await page.waitForTimeout(1500);
  const shown = await page.getByTestId("rotate-lock").isVisible();
  console.log((shown === want ? "PASS " : "FAIL ") + `${d}: rotate prompt ${shown ? "shown" : "hidden"}`); if (shown !== want) fail++;
  if (want) await page.screenshot({ path: "/workspace/maine-rpg/shots/v151012/portrait-rotate-prompt.png" });
}
await b.close(); process.exit(fail ? 1 : 0);
