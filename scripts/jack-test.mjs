export default async function ({ page, T, shot }) {
  await T("setZoom", 1.2);
  const cal = await T("npcOf", "cal"); console.log("cal", JSON.stringify(cal));
  await T("setPos", cal.x + 110, cal.y + 110); await page.waitForTimeout(5000);
  console.log("cal later", JSON.stringify(await T("npcOf", "cal")));
  await shot("60-jack-at-stall");
  await T("setPos", cal.x - 40, cal.y + 120); await page.waitForTimeout(4000);
  console.log("cal later2", JSON.stringify(await T("npcOf", "cal")));
  await shot("61-jack-at-stall-2");
  await T("talk", "cal"); await page.waitForTimeout(800); await shot("62-jack-talk");
  await page.keyboard.press("Escape");
  const hatch = await T("propOf", "hatch");
  await T("setPos", hatch.x + 40, hatch.y + 40); await page.waitForTimeout(500);
  await T("enterKind", "hatch"); await page.waitForTimeout(3000); await shot("63-bunker-inside");
}
