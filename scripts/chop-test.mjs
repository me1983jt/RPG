export default async function ({ page, T, shot }) {
  const st = async (tag) => console.log("state", tag, JSON.stringify(await T("questState")), JSON.stringify(await page.evaluate(() => window.__controlsTest && document.body.innerText.match(/Put down[^\n]*|chopping is quiet[^\n]*/i)?.[0])));
  await T("setQuest", 1); await page.waitForTimeout(300);
  await st("quest1");
  const bosses = (await T("enemies")).filter(e => e.quest);
  console.log("bosses", JSON.stringify(bosses));
  await T("setZoom", 1.5);
  for (const b of bosses) { await T("setPos", b.x + 90, b.y + 80); await shot(`60-boss-${b.variant}`); }
  await T("setHp", 999);
  for (let i = 0; i < bosses.length; i++) {
    const b = bosses[i];
    await T("strike", b.id, 999); await page.waitForTimeout(400);
    await st(`after boss ${i + 1} (${b.name})`);
  }
  await shot("61-chopping-cleared");
}
