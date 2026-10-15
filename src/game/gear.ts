export type RoleId = "hunter" | "medic" | "thief" | "fighter";
export type TraitId = "eye" | "hide" | "step" | "camp";
export type LookId = "wool" | "spruce" | "linen" | "soot";
export type GearKind = "weapon" | "coat" | "supply";
export type Quality = "poor" | "standard" | "good" | "rare";
export type ArmorSlot = "head" | "chest" | "legs" | "hands" | "feet" | "back";
export type GearFamily = "carbine" | "revolver" | "scatter" | "axe" | "pickaxe" | "pry" | "knife" | "coat" | "bandage" | "lockpick" | "supply" | "trade";

export interface GearDef {
  id: string;
  name: string;
  kind: GearKind;
  family: GearFamily;
  quality: Quality;
  atk: number;
  def: number;
  heal: number;
  worth?: number;
  slot?: ArmorSlot;
  note: string;
}

export interface BagStack {
  id: string;
  qty: number;
}

export interface RoleKit {
  id: RoleId;
  title: string;
  blurb: string;
  hp: number;
  atk: number;
  weapon: string;
  coat: string;
  bag: BagStack[];
}

export const GEAR: Record<string, GearDef> = {
  carbine: { id: "carbine", name: "Worn carbine", kind: "weapon", family: "carbine", quality: "poor", atk: 5, def: 0, heal: 0, note: "Poor bore. It still points." },
  "carbine-std": { id: "carbine-std", name: "Service carbine", kind: "weapon", family: "carbine", quality: "standard", atk: 8, def: 0, heal: 0, note: "A straight barrel and a working sight." },
  "carbine-good": { id: "carbine-good", name: "Good carbine", kind: "weapon", family: "carbine", quality: "good", atk: 11, def: 0, heal: 0, note: "Kept oiled. It reaches." },
  knife: { id: "knife", name: "Field knife", kind: "weapon", family: "knife", quality: "poor", atk: 3, def: 0, heal: 0, note: "A short, nicked point." },
  "knife-std": { id: "knife-std", name: "Belt knife", kind: "weapon", family: "knife", quality: "standard", atk: 5, def: 0, heal: 0, note: "Honed. Fast in the hand." },
  "knife-good": { id: "knife-good", name: "Fine knife", kind: "weapon", family: "knife", quality: "good", atk: 7, def: 0, heal: 0, note: "Good steel. It bites clean." },
  skin: { id: "skin", name: "Skinning knife", kind: "weapon", family: "knife", quality: "poor", atk: 4, def: 0, heal: 0, note: "Thin steel for a quiet hand." },
  hatchet: { id: "hatchet", name: "Camp axe", kind: "weapon", family: "axe", quality: "poor", atk: 6, def: 0, heal: 0, note: "A large axe. Poor edge, but it fells a tree." },
  "hatchet-std": { id: "hatchet-std", name: "Broad axe", kind: "weapon", family: "axe", quality: "standard", atk: 9, def: 0, heal: 0, note: "A wide head. It splits timber." },
  "hatchet-good": { id: "hatchet-good", name: "Great axe", kind: "weapon", family: "axe", quality: "good", atk: 12, def: 0, heal: 0, note: "Good steel. Trees and fights both end." },
  pick: { id: "pick", name: "Camp pick", kind: "weapon", family: "pickaxe", quality: "poor", atk: 4, def: 0, heal: 0, note: "A poor pickaxe. It breaks rock." },
  "pick-std": { id: "pick-std", name: "Mining pick", kind: "weapon", family: "pickaxe", quality: "standard", atk: 6, def: 0, heal: 0, note: "A sound pickaxe." },
  "pick-good": { id: "pick-good", name: "Good pick", kind: "weapon", family: "pickaxe", quality: "good", atk: 8, def: 0, heal: 0, note: "Good steel. Rock splits." },
  revolver: { id: "revolver", name: "Worn revolver", kind: "weapon", family: "revolver", quality: "poor", atk: 4, def: 0, heal: 0, note: "A short barrel. Close work." },
  scatter: { id: "scatter", name: "Scattergun", kind: "weapon", family: "scatter", quality: "poor", atk: 9, def: 0, heal: 0, note: "Both barrels, if you are near." },
  pry: { id: "pry", name: "Pry bar", kind: "weapon", family: "pry", quality: "poor", atk: 5, def: 0, heal: 0, note: "Iron bar. Doors, skulls, and nails." },
  patch: { id: "patch", name: "Patch coat", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 1, heal: 0, note: "Wool, mended twice." },
  linen: { id: "linen", name: "Linen coat", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 0, heal: 0, note: "Light. Little stop in it." },
  soft: { id: "soft", name: "Soft cap", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 1, heal: 0, slot: "head", note: "Close wool. Not a brim." },
  woolcap: { id: "woolcap", name: "Wool cap", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 1, heal: 0, slot: "head", note: "Knit wool for the head." },
  felt: { id: "felt", name: "Felt hat", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 1, heal: 0, slot: "head", note: "A brim. It turns the rain." },
  ironhat: { id: "ironhat", name: "Stove helm", kind: "coat", family: "coat", quality: "good", atk: 0, def: 3, heal: 0, slot: "head", note: "A pot lid laced for a helm." },
  shirt: { id: "shirt", name: "Canvas shirt", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 1, heal: 0, slot: "chest", note: "A work shirt. Little armor." },
  wool: { id: "wool", name: "Wool coat", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 2, heal: 0, note: "Heavy cloth. Poor stitching." },
  "coat-std": { id: "coat-std", name: "Trail coat", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 3, heal: 0, note: "Sound wool. It turns a blade." },
  "coat-good": { id: "coat-good", name: "Mackinaw", kind: "coat", family: "coat", quality: "good", atk: 0, def: 5, heal: 0, note: "Good cloth. Thick through the chest." },
  vest: { id: "vest", name: "Canvas vest", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 2, heal: 0, note: "Stitched canvas over the shirt." },
  quilt: { id: "quilt", name: "Quilted jacket", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 4, heal: 0, note: "Layered cloth. It dulls a cut." },
  plate: { id: "plate", name: "Scrap plate", kind: "coat", family: "coat", quality: "good", atk: 0, def: 6, heal: 0, note: "Stove iron laced over wool." },
  bandage: { id: "bandage", name: "Rag bandage", kind: "supply", family: "bandage", quality: "poor", atk: 0, def: 0, heal: 12, note: "Use it from the pack." },
  "bandage-std": { id: "bandage-std", name: "Field bandage", kind: "supply", family: "bandage", quality: "standard", atk: 0, def: 0, heal: 22, note: "Cleaner wrap. Use it from the pack." },
  "bandage-good": { id: "bandage-good", name: "Clean bandage", kind: "supply", family: "bandage", quality: "good", atk: 0, def: 0, heal: 34, note: "Boiled cloth. Use it from the pack." },
  shells: { id: "shells", name: "Loose shells", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 0, note: "One shot each. A gun will not fire without them." },
  wire: { id: "wire", name: "Twist of wire", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 0, note: "For a latch." },
  lockpick: { id: "lockpick", name: "Bent pick", kind: "supply", family: "lockpick", quality: "poor", atk: 0, def: 0, heal: 0, note: "A poor pick. It may slip." },
  "lockpick-std": { id: "lockpick-std", name: "Lockpick", kind: "supply", family: "lockpick", quality: "standard", atk: 0, def: 0, heal: 0, note: "A proper pick." },
  "lockpick-good": { id: "lockpick-good", name: "Fine pick", kind: "supply", family: "lockpick", quality: "good", atk: 0, def: 0, heal: 0, note: "Good steel. It finds the pins." },
  pork: { id: "pork", name: "Salt pork", kind: "supply", family: "trade", quality: "poor", atk: 0, def: 0, heal: 0, worth: 2, note: "Salted. Tap to trade it for iron." },
  maple: { id: "maple", name: "Maple tin", kind: "supply", family: "trade", quality: "poor", atk: 0, def: 0, heal: 0, worth: 3, note: "Last of a sugar camp. Tap to trade it." },
  matches: { id: "matches", name: "Match tin", kind: "supply", family: "trade", quality: "poor", atk: 0, def: 0, heal: 0, worth: 1, note: "Dry matches. Tap to trade them." },
  pelt: { id: "pelt", name: "Beaver pelt", kind: "supply", family: "trade", quality: "poor", atk: 0, def: 0, heal: 0, worth: 4, note: "A winter hide. Tap to trade it." },
  oil: { id: "oil", name: "Lamp oil", kind: "supply", family: "trade", quality: "poor", atk: 0, def: 0, heal: 0, worth: 2, note: "A flask for the lamp. Tap to trade it." },
  cider: { id: "cider", name: "Hot cider", kind: "supply", family: "supply", quality: "standard", atk: 0, def: 0, heal: 18, note: "A tin cup, still warm. Use it from the pack." },
  donut: { id: "donut", name: "Cider donut", kind: "supply", family: "supply", quality: "standard", atk: 0, def: 0, heal: 12, note: "Fried in the farm kitchen. Use it from the pack." },
  apple: { id: "apple", name: "Windfall apple", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 6, note: "Cold and sweet. Use it from the pack." },
  scoped: { id: "scoped", name: "Scoped carbine", kind: "weapon", family: "carbine", quality: "rare", atk: 14, def: 0, heal: 0, note: "Bunker glass on the barrel. It reaches past a plain carbine." },
  rig: { id: "rig", name: "Plate rig", kind: "coat", family: "coat", quality: "rare", atk: 0, def: 8, heal: 0, slot: "chest", note: "Canvas, pouches, and a plate. Bunker stock." },
  trousers: { id: "trousers", name: "Wool trousers", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 1, heal: 0, slot: "legs", note: "Heavy wool from the knee down." },
  chaps: { id: "chaps", name: "Leather chaps", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 2, heal: 0, slot: "legs", note: "Hide over the legs." },
  gloves: { id: "gloves", name: "Wool gloves", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 1, heal: 0, slot: "hands", note: "Knit. A poor stop for a bite." },
  bracers: { id: "bracers", name: "Leather bracers", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 2, heal: 0, slot: "hands", note: "Cuffs that take a cut." },
  boots: { id: "boots", name: "Work boots", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 1, heal: 0, slot: "feet", note: "Cracked leather, dry inside." },
  "boots-std": { id: "boots-std", name: "Lumber boots", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 2, heal: 0, slot: "feet", note: "Steel shank, felt liners. Good in snow." },
  // v0.7 (items v21 drew icons for; stats and effects are ours)
  scraphelm: { id: "scraphelm", name: "Scrap helm", kind: "coat", family: "coat", quality: "good", atk: 0, def: 3, heal: 0, slot: "head", note: "Stove plate hammered into a helm." },
  toque: { id: "toque", name: "Knit toque", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 1, heal: 0, slot: "head", note: "Wool pulled over the ears." },
  huntcap: { id: "huntcap", name: "Hunting cap", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 1, heal: 0, slot: "head", note: "Blaze orange, ear flaps. Other hunters see you first." },
  hockey: { id: "hockey", name: "Hockey mask", kind: "coat", family: "coat", quality: "good", atk: 0, def: 3, heal: 0, slot: "head", note: "A pond goalie's mask. The eyes are cut out." },
  canvas: { id: "canvas", name: "Canvas coat", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 2, heal: 0, slot: "chest", note: "Work canvas. It turns the wind." },
  waxed: { id: "waxed", name: "Waxed coat", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 3, heal: 0, slot: "chest", note: "Oiled cloth. Rain runs off it." },
  warden: { id: "warden", name: "Warden's vest", kind: "coat", family: "coat", quality: "rare", atk: 0, def: 6, heal: 0, slot: "chest", note: "A game warden's armored vest, the patch half torn off." },
  shinguard: { id: "shinguard", name: "Shin guards", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 2, heal: 0, slot: "legs", note: "Hockey pads strapped over the shins." },
  snowshoes: { id: "snowshoes", name: "Snowshoes", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 1, heal: 0, slot: "feet", note: "Ash frames and rawhide. Faster over snow." },
  steeltoes: { id: "steeltoes", name: "Steel-toe boots", kind: "coat", family: "coat", quality: "good", atk: 0, def: 3, heal: 0, slot: "feet", note: "Mill boots. The toes are capped." },
  backpack: { id: "backpack", name: "Canvas pack", kind: "coat", family: "coat", quality: "poor", atk: 0, def: 0, heal: 0, slot: "back", note: "A camp pack. One more row in the pack while you wear it." },
  sling: { id: "sling", name: "Moose-hide sling", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 0, heal: 0, slot: "back", note: "Carries a long gun steady. +1 attack with rifles and shotguns." },
  winchester: { id: "winchester", name: "Winchester", kind: "weapon", family: "carbine", quality: "rare", atk: 12, def: 0, heal: 0, note: "A lever gun from somebody's camp wall. It reaches." },
  shotgun: { id: "shotgun", name: "Pump shotgun", kind: "weapon", family: "scatter", quality: "good", atk: 11, def: 0, heal: 0, note: "Twelve gauge. Close, and it ends a fight." },
  hudson: { id: "hudson", name: "Hudson Bay axe", kind: "weapon", family: "axe", quality: "good", atk: 10, def: 0, heal: 0, note: "A camp axe with a long bit." },
  syrup: { id: "syrup", name: "Maple syrup", kind: "supply", family: "supply", quality: "standard", atk: 0, def: 0, heal: 0, note: "A jar from the sugar bush. Use it: stamina back all at once." },
  smokedfish: { id: "smokedfish", name: "Smoked fish", kind: "supply", family: "supply", quality: "standard", atk: 0, def: 0, heal: 14, note: "Lake trout, smoked. Use it from the pack." },
  dandelion: { id: "dandelion", name: "Dandelion tea", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 6, note: "Bitter tea. Clears a cold and a bleed, and warms you through." },
  radio: { id: "radio", name: "Hand-crank radio", kind: "supply", family: "supply", quality: "good", atk: 0, def: 0, heal: 0, note: "Tuned to Jack's channel. Carry it and he calls before a raid." },
  binoculars: { id: "binoculars", name: "Binoculars", kind: "supply", family: "supply", quality: "good", atk: 0, def: 0, heal: 0, note: "Brass and glass. Carry them: +1 Perception, and you see farther." },
  lantern: { id: "lantern", name: "Lantern", kind: "supply", family: "supply", quality: "standard", atk: 0, def: 0, heal: 0, note: "A barn lantern. Carry it: a much bigger ring of light at night." },
  antlers: { id: "antlers", name: "Antlers", kind: "supply", family: "trade", quality: "good", atk: 0, def: 0, heal: 0, worth: 6, note: "A rack off a bull moose. Tap to trade it." },
  sapbucket: { id: "sapbucket", name: "Sap bucket", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 0, note: "Full of maple sap. Boil it at a cookfire for syrup." },
  packframe: { id: "packframe", name: "Pack frame", kind: "coat", family: "coat", quality: "standard", atk: 0, def: 0, heal: 0, slot: "back", note: "Ash frame and straps. Two more rows in the pack while you wear it." },
  trauma: { id: "trauma", name: "Trauma kit", kind: "supply", family: "bandage", quality: "rare", atk: 0, def: 0, heal: 52, note: "Sealed. Use it from the pack. Not road medicine." },
  kit: { id: "kit", name: "Healing kit", kind: "supply", family: "bandage", quality: "standard", atk: 0, def: 0, heal: 30, note: "Needle, cloth, and a boiled wrap. Use it from the pack." },
  jerky: { id: "jerky", name: "Smoked jerky", kind: "supply", family: "supply", quality: "standard", atk: 0, def: 0, heal: 16, note: "Dry meat. Use it from the pack." },
  stew: { id: "stew", name: "Camp stew", kind: "supply", family: "supply", quality: "standard", atk: 0, def: 0, heal: 26, note: "Hot, if you eat it now. Use it from the pack." },
  meat: { id: "meat", name: "Raw meat", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 0, note: "Smoke it or stew it. Eating it raw is a poor idea." },
  hide: { id: "hide", name: "Green hide", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 0, note: "Still wet. Cut it for cloth." },
  cloth: { id: "cloth", name: "Twist of cloth", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 0, note: "Rags. Bandages start here." },
  bomb: { id: "bomb", name: "Pipe bomb", kind: "supply", family: "supply", quality: "standard", atk: 0, def: 0, heal: 0, note: "Use it from the pack. It bursts on raiders nearby." },
  snare: { id: "snare", name: "Wire snare", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 0, note: "Use it to set a snare where you stand. Check it the next day." },
  grokclaw: { id: "grokclaw", name: "Grok claw", kind: "supply", family: "trade", quality: "good", atk: 0, def: 0, heal: 0, worth: 20, note: "A claw off The Grok, long as a hay knife. Proof, and worth a lot to the right trader." },
  fuel: { id: "fuel", name: "Fuel can", kind: "supply", family: "supply", quality: "standard", atk: 0, def: 0, heal: 0, note: "Use it to ready the tractor for the next pass down the lane." },
  baitpack: { id: "baitpack", name: "Bait tin", kind: "supply", family: "supply", quality: "poor", atk: 0, def: 0, heal: 0, note: "Use it to drop a cache where you stand. Raiders come for it." },
};

export const ROLES: RoleKit[] = [
  {
    id: "hunter",
    title: "Hunter",
    blurb: "A poor carbine, a patched coat, and six shells.",
    hp: 40,
    atk: 2,
    weapon: "carbine",
    coat: "patch",
    bag: [
      { id: "carbine", qty: 1 },
      { id: "boots", qty: 1 },
      { id: "patch", qty: 1 },
      { id: "woolcap", qty: 1 },
      { id: "trousers", qty: 1 },
      { id: "shells", qty: 6 },
      { id: "pelt", qty: 1 },
      { id: "lockpick", qty: 1 },
    ],
  },
  {
    id: "medic",
    title: "Medic",
    blurb: "A poor knife, linen, and rag bandages.",
    hp: 42,
    atk: 2,
    weapon: "knife",
    coat: "linen",
    bag: [
      { id: "knife", qty: 1 },
      { id: "boots", qty: 1 },
      { id: "linen", qty: 1 },
      { id: "gloves", qty: 1 },
      { id: "bandage", qty: 3 },
      { id: "pork", qty: 1 },
      { id: "lockpick", qty: 1 },
    ],
  },
  {
    id: "thief",
    title: "Prowler",
    blurb: "A poor skinning knife, a shirt, a soft cap, and picks.",
    hp: 36,
    atk: 2,
    weapon: "skin",
    coat: "shirt",
    bag: [
      { id: "skin", qty: 1 },
      { id: "boots", qty: 1 },
      { id: "shirt", qty: 1 },
      { id: "soft", qty: 1 },
      { id: "wire", qty: 1 },
      { id: "matches", qty: 2 },
      { id: "lockpick", qty: 3 },
    ],
  },
  {
    id: "fighter",
    title: "Camp hand",
    blurb: "A poor camp axe and a heavy wool coat.",
    hp: 52,
    atk: 3,
    weapon: "hatchet",
    coat: "wool",
    bag: [
      { id: "hatchet", qty: 1 },
      { id: "boots", qty: 1 },
      { id: "wool", qty: 1 },
      { id: "woolcap", qty: 1 },
      { id: "gloves", qty: 1 },
      { id: "pick", qty: 1 },
      { id: "oil", qty: 1 },
      { id: "lockpick", qty: 1 },
    ],
  },
];

export function armorSlot(g: GearDef | undefined): ArmorSlot | null {
  if (!g || g.kind !== "coat") return null;
  return g.slot ?? "chest";
}

export interface CraftRecipe {
  id: string;
  item: string;
  qty: number;
  iron: number;
  wood: number;
  need: { id: string; qty: number }[];
  name: string;
  blurb: string;
  /** v11: needs the workbench at the farm. */
  bench?: boolean;
}

export const CRAFT: CraftRecipe[] = [
  { id: "shells", item: "shells", qty: 4, iron: 3, wood: 0, need: [], name: "Hand-load shells", blurb: "Four shells from scrap lead." },
  { id: "jerky", item: "jerky", qty: 2, iron: 0, wood: 1, need: [{ id: "meat", qty: 1 }], name: "Smoke jerky", blurb: "Dry a cut of meat into two strips." },
  { id: "stew", item: "stew", qty: 1, iron: 0, wood: 1, need: [{ id: "meat", qty: 1 }, { id: "apple", qty: 1 }], name: "Camp stew", blurb: "Meat and a windfall apple in the pot." },
  { id: "bandage", item: "bandage", qty: 1, iron: 0, wood: 0, need: [{ id: "cloth", qty: 2 }], name: "Rag bandage", blurb: "Tear cloth into a wrap." },
  { id: "kit", item: "kit", qty: 1, iron: 1, wood: 0, need: [{ id: "bandage", qty: 2 }, { id: "cloth", qty: 1 }], name: "Healing kit", blurb: "Bandages, cloth, and a needle." },
  { id: "syrup", item: "syrup", qty: 1, iron: 0, wood: 2, need: [{ id: "sapbucket", qty: 1 }], name: "Boil syrup", blurb: "Boil a bucket of sap down to a jar." },
  { id: "cloth", item: "cloth", qty: 2, iron: 0, wood: 0, need: [{ id: "hide", qty: 1 }], name: "Cut cloth", blurb: "A hide becomes two twists of cloth." },
  { id: "snare", item: "snare", qty: 2, iron: 1, wood: 0, need: [{ id: "wire", qty: 1 }], name: "Wire snares (bench)", blurb: "Two snares from a hank of wire.", bench: true },
  { id: "snowshoes", item: "snowshoes", qty: 1, iron: 0, wood: 2, need: [{ id: "hide", qty: 1 }], name: "Snowshoes (bench)", blurb: "Bent ash and rawhide lacing.", bench: true },
  { id: "lantern", item: "lantern", qty: 1, iron: 4, wood: 0, need: [{ id: "oil", qty: 1 }, { id: "wire", qty: 1 }], name: "Barn lantern (bench)", blurb: "Tin, a wick and lamp oil.", bench: true },
  { id: "carbine-std", item: "carbine-std", qty: 1, iron: 6, wood: 0, need: [{ id: "carbine", qty: 1 }, { id: "wire", qty: 1 }], name: "Rebarrel the carbine (bench)", blurb: "Worn carbine to a service carbine.", bench: true },
  { id: "carbine-good", item: "carbine-good", qty: 1, iron: 10, wood: 0, need: [{ id: "carbine-std", qty: 1 }, { id: "oil", qty: 1 }], name: "Tune the action (bench)", blurb: "Service carbine to a good carbine.", bench: true },
  { id: "scoped", item: "scoped", qty: 1, iron: 12, wood: 0, need: [{ id: "carbine-good", qty: 1 }, { id: "binoculars", qty: 1 }], name: "Mount a scope (bench)", blurb: "Glass off a pair of binoculars.", bench: true },
];

export function roleKit(id: RoleId): RoleKit {
  return ROLES.find((r) => r.id === id) ?? ROLES[3]!;
}

export const LOOKS: { id: LookId; label: string; hint: string }[] = [
  { id: "wool", label: "Wool", hint: "Brown camp coat" },
  { id: "spruce", label: "Spruce", hint: "Green hunter cloth" },
  { id: "linen", label: "Linen", hint: "Pale medic cloth" },
  { id: "soot", label: "Soot", hint: "Dark prowler coat" },
];

export function defaultLook(id: RoleId): LookId {
  if (id === "hunter") return "spruce";
  if (id === "medic") return "linen";
  if (id === "thief") return "soot";
  return "wool";
}

export function roleStats(id: RoleId): { strength: number; vigor: number; endurance: number; intellect: number; perception: number; luck: number } {
  if (id === "fighter") return { strength: 3, vigor: 2, endurance: 2, intellect: 1, perception: 1, luck: 1 };
  if (id === "medic") return { strength: 1, vigor: 2, endurance: 1, intellect: 2, perception: 2, luck: 1 };
  if (id === "thief") return { strength: 1, vigor: 1, endurance: 2, intellect: 3, perception: 2, luck: 2 };
  return { strength: 1, vigor: 1, endurance: 2, intellect: 2, perception: 3, luck: 2 };
}

export const TRAITS: { id: TraitId; title: string; blurb: string }[] = [
  { id: "eye", title: "Keen eye", blurb: "Better with a rifle. Worse up close." },
  { id: "hide", title: "Thick hide", blurb: "More life. Stamina comes back slower." },
  { id: "step", title: "Light step", blurb: "Surer locks. Less life." },
  { id: "camp", title: "Camp strong", blurb: "Better with an axe or a pick. Worse with a rifle." },
];

export function traitOf(id: string | undefined): { id: TraitId; title: string; blurb: string } | null {
  return TRAITS.find((t) => t.id === id) ?? null;
}

const DROP_POOL = ["hatchet", "knife", "carbine", "bandage", "wool", "lockpick", "pick", "shells", "revolver", "scatter", "pry", "vest", "pork", "maple", "matches", "pelt", "oil", "hatchet-std", "knife-std", "carbine-std", "bandage-std", "coat-std", "lockpick-std", "pick-std", "quilt", "hatchet-good", "knife-good", "carbine-good", "bandage-good", "coat-good", "lockpick-good", "pick-good", "plate", "boots", "boots-std", "packframe", "scraphelm", "toque", "huntcap", "hockey", "canvas", "waxed", "shinguard", "snowshoes", "steeltoes", "backpack", "sling", "shotgun", "hudson", "smokedfish", "dandelion", "sapbucket", "lantern"];

export function rollDrop(elite: boolean, luck = 1): string | null {
  const lift = Math.max(0, luck - 1) * 0.04;
  const roll = Math.random();
  const goodAt = (elite ? 0.16 : 0.06) + lift;
  const standardAt = (elite ? 0.46 : 0.26) + lift * 1.4;
  let quality: Quality | null = null;
  if (roll < goodAt) quality = "good";
  else if (roll < standardAt) quality = "standard";
  else if (roll < (elite ? 0.85 : 0.62)) quality = "poor";
  if (!quality) return null;
  const pool = DROP_POOL.map((id) => GEAR[id]!).filter((g) => g.quality === quality);
  return pool[(Math.random() * pool.length) | 0]?.id ?? null;
}