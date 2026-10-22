export default async function ({ page, T, shot }) {
  const tree = (await T("propOf","tree-yellow")) || (await T("propOf","tree-pine"));
  console.log("tree", JSON.stringify(tree));
  if (!tree) return;
  await T("setZoom", 1.2);
  await T("setPos", tree.x - 30, tree.y - 30); await page.waitForTimeout(4000); await shot("40-behind-tree");
}
