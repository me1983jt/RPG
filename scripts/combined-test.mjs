export default async function ({ page, T, shot }) {
  const click = async (name) => { await page.getByRole("button", { name }).first().click(); await page.waitForTimeout(400); };
  const st = async (tag) => console.log("state", tag, JSON.stringify(await T("questState")));
  await st("start");
  await T("setZoom", 1.3);
  const justin = await T("npcOf", "justin"); const sarah = await T("npcOf", "sarah");
  console.log("justin", JSON.stringify(justin), "sarah", JSON.stringify(sarah));
  await T("setPos", justin.x + 50, justin.y + 40); await shot("10-justin-sarah-farm");
  await T("talk", "sarah"); await shot("11-justin-talk");
  await click(/bring the wood/);
  await st("accepted");
  // journal
  await click("Journal"); await shot("12-journal-active"); await click("Journal");
  const pile = await T("propOf", "logs");
  console.log("woodpile", JSON.stringify(pile));
  // gather by tapping the woodpile on screen (canvas pointer)
  await T("setPos", pile.x + 40, pile.y + 40); await page.waitForTimeout(500);
  await click("Talk"); await page.waitForTimeout(1500);
  await st("after interact");
  let s = await T("questState");
  if (s.wood < 3) {
    // try clicking the woodpile sprite: find it via screen projection is engine-internal, so click around the hero
    for (const [dx, dy] of [[0, -40], [40, -20], [-40, -20], [0, -70], [60, -50], [-60, -50]]) {
      await page.mouse.click(640 + dx, 400 + dy); await page.waitForTimeout(900);
      s = await T("questState"); if (s.wood >= 3) break;
    }
  }
  await st("after gather");
  await T("talk", "sarah"); await page.waitForTimeout(300); await shot("13-justin-wood");
  await click(/Hand over the wood/);
  await T("talk", "sarah"); await shot("14-sarah-talk");
  await click(/Thank you, Sarah/);
  await st("snow done");
  await click("Journal"); await shot("15-journal-done"); await click("Journal");
  await click("Backpack"); await shot("16-pack-cider"); await page.getByRole("button", { name: "Close pack" }).click();
  // Jack Ready
  const jack = await T("npcOf", "cal"); console.log("jack", JSON.stringify(jack));
  await T("setZoom", 1.4);
  await T("setPos", jack.x + 40, jack.y + 50); await shot("20-jack-ready");
  await T("talk", "cal"); await shot("21-jack-talk");
  await T("giveIron", 60);
  await click(/Trauma kit/);
  await st("bought");
  await T("talk", "cal"); await shot("22-jack-trusted");
  await click(/That's all/);
  await click("Journal"); await shot("23-journal-jack"); await click("Journal");
  const hatch = await T("propOf", "hatch");
  await T("setZoom", 1);
  await T("setPos", hatch.x + 30, hatch.y + 70); await page.waitForTimeout(800); await shot("24-bunker-outside");
  await T("enterKind", "hatch"); await page.waitForTimeout(2500); await shot("25-bunker-inside");
  await st("bunker");
  await T("enterKind", "farmhouse");
  const house = await T("propOf", "farmhouse"); console.log("farmhouse", JSON.stringify(house));
  if (house) { await T("setPos", house.x + 60, house.y + 140); await page.waitForTimeout(600); await T("enterKind", "farmhouse"); await page.waitForTimeout(2500); await shot("26-farmhouse-inside"); }
  // fog / perception: wide view with minimap
  await T("setPos", justin.x, justin.y + 200); await T("setZoom", 0.5); await page.waitForTimeout(1500); await shot("27-fog-wide");
  // save on background
  await page.evaluate(() => { localStorage.removeItem("maine-rpg-save-v2"); document.dispatchEvent(new Event("visibilitychange")); });
  const hidden = await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); return !!localStorage.getItem("maine-rpg-save-v2"); });
  console.log("saved on background:", hidden, "keys", JSON.stringify(await page.evaluate(() => Object.keys(localStorage))));
}
