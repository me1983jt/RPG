/**
 * Beta v11 content: eleven more side quests plus the state for the v11 play types (seasons, farm builder,
 * hunting trips, fishing, trade caravan, traps, and the Winter Survival / Endless Raid / Night Watch modes).
 * Pure data + text, same pattern as quests10.ts: the engine owns spawning, markers and travel.
 * No new art: every body uses an existing sheet (The Grok uses the gw11 boss-grok sheet).
 */
import type { Dialogue } from "@/game/types";

/** One step of a quest.
 *  go: walk to the site. take: a choice at the site. fight: foes appear at the site, clear them.
 *  ambush: foes appear around you as the step starts, clear them. escort: Cyndal and Loki follow you to the site. */
export interface Q11Step {
  kind: "go" | "take" | "fight" | "ambush" | "escort";
  /** Site key from Q11_SITES, or "npc:<role>". */
  site: string;
  /** Journal / HUD line for this step. */
  hud: string;
  /** Log line when the step completes (or, for fight/ambush, when the foes show up). */
  log: string;
  take?: { speaker: string; text: string; label: string };
  /** take steps: items handed over, iron it costs, items it uses up. */
  give?: [string, number][];
  cost?: number;
  need?: string[];
  /** [kind, variant, name, hp, atk, xp] */
  foes?: [string, string | null, string, number, number, number][];
}
export interface Q11Quest {
  id: string;
  title: string;
  giver: string;
  /** Offer line on the giver's talk menu. */
  offer: string;
  ask: string;
  accept: string;
  steps: Q11Step[];
  /** Hand-in line from the giver. */
  done: string;
  doneLabel: string;
  reward: [string, number][];
  iron?: number;
  xp: number;
  /** Shown once finished. */
  after: string;
  /** Extra gate beyond First Snow. */
  needs?: "ferry" | "jack" | "radio";
}

export interface Q11State {
  /** Per quest: s = 0 not taken, 1..steps = on step s, steps+1 = back to the giver, steps+2 = done. left = foes left on a fight step. */
  q: Record<string, { s: number; left: number }>;
  nextId: number;
  farm: { plots: number; coop: number; wall: number; smoke: number; lastDay: number; harvest: number };
  /** v11.3: kind = snare | trap; caught = what is in it, waiting to be checked. */
  traps: { x: number; y: number; day: number; kind?: string; caught?: string; map?: number }[];
  hunt: { kind: string; wind: number; on: boolean } | null;
  fish: { caught: number; rare: number; day?: number; today?: number };
  huntDay?: number;
  /** Trade caravan: 0 at home, 1 choosing a route, 2 ambushed on the way down, 3 at the Bangor market, 4 ambushed coming home. */
  caravan: number;
  route: number;
  trips: number;
  /** Day the season cycle counts from (Winter Survival starts it in deep winter). */
  seasonDay: number;
}

export function freshQ11(): Q11State {
  return { q: {}, nextId: 97000, farm: { plots: 0, coop: 0, wall: 0, smoke: 0, lastDay: -1, harvest: 0 }, traps: [], hunt: null, fish: { caught: 0, rare: 0 }, caravan: 0, route: 0, trips: 0, seasonDay: 0 };
}

export function loadQ11(raw: unknown): Q11State {
  const base = freshQ11();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Q11State>;
  return {
    ...base,
    ...r,
    q: r.q && typeof r.q === "object" ? { ...r.q } : {},
    farm: { ...base.farm, ...(r.farm ?? {}) },
    traps: Array.isArray(r.traps) ? r.traps : [],
    fish: { ...base.fish, ...(r.fish ?? {}) },
    hunt: null,
    caravan: r.caravan === 3 ? 3 : 0,
  };
}

/** Sites in world-relative tiles. map 1 = the north woods across the Kennebec. */
export const Q11_SITES: Record<string, { tx: number; ty: number; name: string; map?: number }> = {
  pond: { tx: 30, ty: 40, name: "Attean pond ice" },
  iceTrail: { tx: 34, ty: 30, name: "Ice road" },
  truck1: { tx: 70, ty: 30, name: "Route 2 wrecks" },
  truck2: { tx: 78, ty: 34, name: "Route 2 tanker" },
  pharmacy: { tx: 100, ty: 70, name: "Newport pharmacy" },
  herseys: { tx: 92, ty: 80, name: "The Hersey place" },
  sugarbush: { tx: 18, ty: 52, name: "Sugar bush" },
  sugarshack: { tx: 24, ty: 58, name: "Sugar shack" },
  // v11.3 Skowhegan (map 2) and the road to it on the home map
  skowRoad: { tx: 96, ty: 98, name: "Road to Skowhegan" },
  skowBridge: { tx: 58, ty: 65, name: "Kennebec bridge", map: 2 },
  skowHospital: { tx: 68, ty: 48, name: "Redington hospital", map: 2 },
  skowMill: { tx: 44, ty: 50, name: "Woolen mill", map: 2 },
  grokTracks: { tx: 40, ty: 40, name: "Big tracks", map: 1 },
  grokScrape: { tx: 58, ty: 56, name: "Claw-scraped spruce", map: 1 },
  grokDen: { tx: 76, ty: 50, name: "Blowdown den", map: 1 },
  bridge: { tx: 80, ty: 18, name: "Sebasticook bridge" },
  sawmill: { tx: 8, ty: 40, name: "Hartland sawmill" },
  cache1: { tx: 40, ty: 90, name: "Jack's cache: the culvert" },
  cache2: { tx: 102, ty: 30, name: "Jack's cache: the hunting stand" },
  cache3: { tx: 8, ty: 72, name: "Jack's cache: the cellar hole" },
  belfast: { tx: 106, ty: 106, name: "Belfast shore" },
  lighthouse: { tx: 110, ty: 100, name: "The light at Belfast" },
  henyard: { tx: 42, ty: 24, name: "The hen yard" },
  wolfTracks: { tx: 30, ty: 66, name: "Wolf sign" },
  wolfDen: { tx: 18, ty: 86, name: "Wolf den" },
  window1: { tx: 50, ty: 80, name: "Burned-out farmhouse" },
  window2: { tx: 70, ty: 92, name: "Old storm windows" },
  window3: { tx: 86, ty: 104, name: "Collapsed porch" },
  school: { tx: 58, ty: 98, name: "Harmony school" },
  fishKennebec: { tx: 62, ty: 6, name: "Kennebec eddy" },
  fishPond: { tx: 28, ty: 44, name: "Attean pond shore" },
  fishHoleb: { tx: 12, ty: 102, name: "Holeb pond" },
  farmBike: { tx: 40, ty: 19, name: "Old motor bicycle" },
  junkyard: { tx: 94, ty: 25, name: "The Chopping junkyard" },
  garage: { tx: 72, ty: 25, name: "Route 2 garage" },
  raiderSled: { tx: 60, ty: 72, name: "Raider sled camp" },
};
/** Parts for the motor bicycle (v11.1). */
export const BIKE_PARTS = ["carburetor", "chain", "engine", "gastank", "sparkplug", "tire"];
export const FISH_SITES = ["fishKennebec", "fishPond", "fishHoleb"];

const R = (n: number, name: string): [string, string | null, string, number, number, number][] =>
  Array.from({ length: n }, (_, i) => ["bandit", i % 2 ? "jumper" : "scout", name, 18, 4, 9] as [string, string | null, string, number, number, number]);

export const Q11: Q11Quest[] = [
  {
    id: "meds", title: "Medicine Run", giver: "mira", offer: "The hospital down to Skowhegan",
    ask: "Half of Lowelltown's got the croup and I'm out of everything. Redington hospital in Skowhegan had a whole pharmacy. Raiders sit on the Kennebec bridge, though. The road's south, past the ponds.",
    accept: "I'll go to Skowhegan",
    steps: [
      { kind: "go", site: "skowRoad", hud: "take the south road to Skowhegan.", log: "The old road to Skowhegan. Somebody's spray-painted TURN BACK on the sign." },
      { kind: "fight", site: "skowBridge", hud: "raiders hold the Kennebec bridge. Clear them.", log: "Lanterns on the bridge. They've strung wire across it and they're waiting.", foes: [["bandit", "shield", "Bridge raider", 36, 7, 16], ["bandit", "scout", "Bridge raider", 24, 6, 12], ["bandit", "brute", "Bridge boss", 52, 9, 30]] },
      { kind: "take", site: "skowHospital", hud: "search Redington hospital's pharmacy.", log: "Behind the pharmacy counter: a carton of amoxicillin and two bottles of cough syrup nobody found.", give: [["medicine", 3]], take: { speaker: "Redington hospital", text: "The pharmacy cage is pried open, but the bottom shelf is still full under a fallen ceiling tile.", label: "Take the medicine" } },
    ],
    done: "Oh, bless you. That'll see the little ones through. You keep one of those for yourself, hear?",
    doneLabel: "Hand over the medicine", reward: [["medicine", 1], ["bandage-good", 1]], iron: 10, xp: 60,
    after: "Lowelltown's coughing less. Mira's pharmacy shelf has bottles on it again.",
  },
  {
    id: "mill", title: "The Woolen Mill", giver: "sarah", offer: "Belting off the Skowhegan mill",
    ask: "The old woolen mill in Skowhegan's got leather drive belts and bearings. I need them for a saw rig. Mind, there's a crew holed up in there.",
    accept: "I'll strip the mill",
    steps: [
      { kind: "fight", site: "skowMill", hud: "clear the raiders out of the woolen mill.", log: "Smoke from a barrel fire in the mill yard. They've seen you.", foes: [["bandit", "armor", "Mill raider", 44, 8, 20], ["bandit", "torch", "Mill raider", 26, 6, 12]] },
      { kind: "take", site: "skowMill", hud: "pull belting and bearings off the mill shafts.", log: "Forty feet of leather belting and a crate of bearings packed in grease.", give: [["wire", 2], ["oil", 2]], take: { speaker: "Woolen mill", text: "Line shafts run the length of the floor, belts still on the pulleys.", label: "Strip the belts and bearings" } },
    ],
    done: "That's real leather. The saw rig will run off the tractor now. Good work.",
    doneLabel: "Hand over the belting", reward: [["shells", 8]], iron: 14, xp: 50,
    after: "Your saw rig howls on the tractor's power take-off. Music, of a sort.",
  },
  {
    id: "bike", title: "Bike Parts", giver: "sarah", offer: "That old motor bike by the barn",
    ask: "That's your dad's old motor bicycle, a Whizzer, leaning on the barn since before the lights went out. Frame's good. She's missing the carburetor, the chain, the engine's seized, there's no tank, no plug and the back tire's rotted off. Find the parts and we'll put her together on the bench. Then you can run the roads twice as quick. Loud, though. Every raider in the county'll hear you coming.",
    accept: "I'll find the parts",
    steps: [
      { kind: "take", site: "farmBike", hud: "look over the old motor bicycle by the barn.", log: "Rust, mouse nests and a good frame. A list of parts in your head.", take: { speaker: "Old motor bicycle", text: "A balloon-tire bicycle with a little engine bolted in the frame. Seized, gutted and flat, but straight.", label: "Make a list of what she needs" } },
      { kind: "take", site: "junkyard", hud: "pull a carburetor and a gas tank at the junkyard by The Chopping.", log: "A little float carburetor off a lawn tractor, and a dented teardrop tank that doesn't leak.", give: [["carburetor", 1], ["gastank", 1]], take: { speaker: "The Chopping junkyard", text: "Wrecks stacked three high, a lawn tractor on its side and an old moped frame in the weeds.", label: "Pull the carb and the tank" } },
      { kind: "take", site: "garage", hud: "get a chain and a tire at the Route 2 garage.", log: "A coil of #41 chain off the pegboard and a bicycle tire still in its paper.", give: [["chain", 1], ["tire", 1]], take: { speaker: "Route 2 garage", text: "Bay doors stove in, but the parts room in back is half full. Pegboard, boxes, a rack of bicycle tires.", label: "Take a chain and a tire" } },
      { kind: "fight", site: "raiderSled", hud: "raiders at the sled camp have a little engine. Take it off them.", log: "A raider camp, and lashed on their sled is a two-stroke engine the size of a bread box.", foes: [["bandit", "scout", "Sled raider", 18, 4, 9], ["bandit", "jumper", "Sled raider", 18, 4, 9]] },
      { kind: "take", site: "raiderSled", hud: "take the engine off the raiders' sled.", log: "The engine's heavy but it turns over by hand. Good compression.", give: [["engine", 1]], take: { speaker: "Raider sled", text: "A Kineo two-stroke, lashed down with baling twine.", label: "Cut it loose" } },
      { kind: "take", site: "npc:cal", hud: "buy a spark plug from Jack Ready (6 iron).", log: "Jack sells you a plug in its box. \"The ready prosper,\" he says.", give: [["sparkplug", 1]], cost: 6, take: { speaker: "Jack Ready", text: "\"A spark plug? Got a whole coffee can of 'em. Six iron.\"", label: "Buy a spark plug (6 iron)" } },
      { kind: "take", site: "farmBike", hud: "build the bike at the farm workbench.", log: "Two evenings on the bench, skinned knuckles, and she fires on the third kick.", need: ["carburetor", "chain", "engine", "gastank", "sparkplug", "tire"], take: { speaker: "Farm workbench", text: "Everything laid out on the bench: carb, chain, engine, tank, plug and tire.", label: "Build the motor bicycle" } },
    ],
    done: "Listen to her go! Just like his dad's. She'll drink gas, mind, so keep a can on you. And no kids on it. Not ever.",
    doneLabel: "Take her out", reward: [["gas", 3]], xp: 40,
    after: "The motor bicycle runs. Ride it with the Ride button when you're beside it; it burns gas.",
  },
  {
    id: "ice", title: "Ice Out", giver: "sarah", offer: "The root cellar's getting warm",
    ask: "The cellar won't hold through a thaw without ice. Attean pond's froze a foot thick now. Cut me blocks, pack them in sawdust and drag them home. Watch your back on the way. A sled leaves a trail anybody can follow.",
    accept: "I'll cut the ice",
    steps: [
      { kind: "go", site: "pond", hud: "walk out on Attean pond.", log: "Attean pond. Black ice, a foot thick, booming under your boots." },
      { kind: "take", site: "pond", hud: "cut ice blocks on the pond.", log: "You saw out six blocks and lash them on the sled under sawdust.", take: { speaker: "Attean pond ice", text: "Clear ice, green at the edges. With the bow saw and the tongs you can have six blocks out before your hands quit.", label: "Saw out the blocks" } },
      { kind: "ambush", site: "iceTrail", hud: "raiders followed the sled trail. Drive them off.", log: "Boots crunching behind you. Somebody followed the sled marks off the pond.", foes: R(3, "Sled-trail raider") },
    ],
    done: "Six blocks! Packed good, too. That'll keep the milk and the meat right through to May. Here, I put up some stew.",
    doneLabel: "Into the cellar with them", reward: [["stew", 2], ["meat", 1]], xp: 30,
    after: "The root cellar is packed with pond ice under sawdust.",
  },
  {
    id: "fuel", title: "Fuel Run", giver: "sarah", offer: "Tractor's near dry",
    ask: "The tractor's down to fumes. There's trucks dead in the ditch all along Route 2. Take the hose and a couple of cans and siphon what's left. Don't swallow any, it'll ruin your whole week.",
    accept: "I'll get the gas",
    steps: [
      { kind: "take", site: "truck1", hud: "siphon gas from the Route 2 wrecks.", log: "A gallon and a half out of the pickup, and a mouthful you'll taste till Tuesday.", take: { speaker: "Route 2 wrecks", text: "A pickup and a sedan nose to nose in the ditch, snow to the door handles. The pickup's cap is still on.", label: "Run the hose" } },
      { kind: "fight", site: "truck2", hud: "the tanker on Route 2 is guarded. Clear it.", log: "Two men are camped in the lee of the tanker, and they think it's theirs.", foes: R(2, "Tanker squatter") },
      { kind: "take", site: "truck2", hud: "fill the cans at the tanker.", log: "Both cans full, sloshing heavy.", take: { speaker: "Route 2 tanker", text: "The old heating-oil tanker still has gas in the pony tank. The valve's stiff but it turns.", label: "Fill the cans" } },
    ],
    done: "Now that's a smell I missed. That'll run the tractor down the lane a good few times. Good work.",
    doneLabel: "Two full cans", reward: [["fuel", 2]], xp: 28,
    after: "Two cans of Route 2 gas in the barn for the tractor.",
  },
  {
    id: "sick", title: "The Sick Neighbor", giver: "sarah", offer: "How are the Herseys?",
    ask: "Old Mr. Hersey's got a chest cold that's gone bad, and Ruth can't get him warm. They need medicine. The Rite Aid in Newport's been empty since summer, but there could be something in back. Then take it to them, their place is on the Stetson road.",
    accept: "I'll find medicine",
    steps: [
      { kind: "fight", site: "pharmacy", hud: "looters at the Newport pharmacy. Clear them.", log: "The pharmacy door is propped with a cinder block and there's somebody in there going through the shelves.", foes: R(3, "Pharmacy looter") },
      { kind: "take", site: "pharmacy", hud: "search the pharmacy back room.", log: "Amoxicillin, a box of it, and cough syrup. Good enough.", take: { speaker: "Newport pharmacy", text: "Behind the counter the shelves are bare, but the back room's got a locked drawer the looters missed.", label: "Pry the drawer" } },
      { kind: "take", site: "herseys", hud: "bring the medicine to the Hersey place.", log: "Ruth Hersey cries a little and puts the kettle on.", take: { speaker: "Ruth Hersey", text: "\"Oh, you didn't. Come in out of the wind. Walt, look who it is. Look what they brought you.\"", label: "Give Ruth the medicine" } },
    ],
    done: "You got it to them? Bless you. Ruth'll never forget it. She sent this back with you, she wouldn't take no.",
    doneLabel: "He'll pull through", reward: [["kit", 1], ["bandage", 2], ["donut", 2]], xp: 34,
    after: "Walt Hersey is up and around. Ruth sends doughnuts.",
  },
  {
    id: "maple", title: "Maple Season", giver: "loki", offer: "Sap's running",
    ask: "Dad! Days are warm and nights are freezing, so the sap's running! Can we tap the sugar bush out west? You haul the buckets to the shack and boil it down. Mom says it's forty gallons of sap for one of syrup. Keep the fire going after dark, the coyotes come in for the smell.",
    accept: "I'll make syrup",
    steps: [
      { kind: "take", site: "sugarbush", hud: "tap the maples in the sugar bush.", log: "Spiles in, buckets hung. It's running good.", take: { speaker: "Sugar bush", text: "Big old rock maples, some of them tapped before your grandfather was born. The old spile holes are still there.", label: "Drive the spiles, hang the buckets" } },
      { kind: "take", site: "sugarshack", hud: "boil the sap down at the sugar shack.", log: "Steam rolls out of the shack all afternoon. By dark you've got syrup the color of a good fiddle.", take: { speaker: "Sugar shack", text: "The evaporator pan's rusty but it holds. There's a cord of dry wood stacked under the eaves.", label: "Fire the arch and boil" } },
      { kind: "ambush", site: "sugarshack", hud: "coyotes after the shack. Drive them off.", log: "Yips in the dark all around the shack. The coyotes smelled the sugar.", foes: [["coyote", null, "Coyote", 13, 4, 6], ["coyote", null, "Coyote", 13, 4, 6], ["coyote", null, "Coyote", 13, 4, 6]] },
    ],
    done: "Look at that color! Mom says that's Grade A. She'll keep two jars and trade the rest down the road for iron. Can I lick the spoon?",
    doneLabel: "Trade it", reward: [["syrup", 2]], iron: 14, xp: 30,
    after: "Syrup in the pantry, and iron from the trade.",
  },
  {
    id: "grok", title: "The Grok Hunt", giver: "sarah", offer: "About The Grok", needs: "ferry",
    ask: "Now the ferry runs, I've been hearing things from across the river. Tracks as long as your forearm. Spruce scraped bark-bare eight foot up. They call it The Grok. It's slow, but it don't stop, and it hits like a skidder. If you go, keep your distance and keep shooting. Bring back a claw and I'll see you outfitted proper.",
    accept: "I'll hunt The Grok",
    steps: [
      { kind: "go", site: "grokTracks", hud: "cross the ferry and find The Grok's tracks in the north woods.", log: "Tracks in the snow, each one longer than your boot. Something heavy went through here, slow." },
      { kind: "go", site: "grokScrape", hud: "follow the tracks to the scraped spruce.", log: "A spruce scraped bare way over your head. Long grooves, and a smell like a wet dog the size of a barn." },
      { kind: "fight", site: "grokDen", hud: "The Grok is at the blowdown. Keep your distance and bring it down.", log: "The blowdown heaves and The Grok stands up. It's slow. It doesn't stop.", foes: [["bandit", "grok", "The Grok", 220, 15, 90]] },
    ],
    done: "That's... I'll be. That claw's longer than my hand. Here. My good rifle, and Sarah's had a coat put by for whoever earned it. You did.",
    doneLabel: "Hand over the claw", reward: [["winchester", 1], ["coat-good", 1], ["grokclaw", 1]], xp: 90,
    after: "The Grok is dead in the north woods. Its claw hangs over the farmhouse door.",
  },
  {
    id: "bridge", title: "Bridge Out", giver: "sarah", offer: "The Sebasticook bridge",
    ask: "Somebody blew the Sebasticook bridge, the one on the road east. Cuts us off from half the county. You can't ford it in this. But Hartland sawmill's got timbers, and a span's just timbers and bolts. Go look at it, then get the beams.",
    accept: "I'll look at the bridge",
    steps: [
      { kind: "go", site: "bridge", hud: "look at the blown Sebasticook bridge.", log: "The middle span's gone, dropped in the river. Both abutments stand. You could deck it across with long timbers." },
      { kind: "fight", site: "sawmill", hud: "the Hartland sawmill is held. Clear it.", log: "The sawmill has a crew in it, and they've been the ones charging toll at the ford.", foes: R(3, "Toll crew") },
      { kind: "take", site: "sawmill", hud: "load timbers at the Hartland sawmill.", log: "Twelve-by-twelve hemlock, chained on the skid.", take: { speaker: "Hartland sawmill", text: "Long timbers stickered in the yard, and a skid with chains. It's a haul but it's doable.", label: "Chain the timbers on the skid" } },
      { kind: "take", site: "bridge", hud: "rebuild the span at the bridge.", log: "Two days of hard work and the span is across. You can drive a team over it now.", take: { speaker: "Sebasticook bridge", text: "The abutments are sound. Lay the timbers across, spike them, deck them with what's left.", label: "Build the span" } },
    ],
    done: "You rebuilt it? Well I'll be. That's the road east open again. Folks'll be talking about that one.",
    doneLabel: "It's open", reward: [["shells", 8]], iron: 12, xp: 46,
    after: "The Sebasticook bridge is open again.",
  },
  {
    id: "caches", title: "Jack Ready's Bunker Map", giver: "cal", offer: "Got any more maps, Jack?", needs: "jack",
    ask: "Being ready means not keeping your eggs in one basket. I've got three caches out around Somerset County. A culvert, a hunting stand and an old cellar hole. Marked 'em on this map. Go fetch what's in 'em and keep half. The strong endure, but the ready prosper.",
    accept: "Hand me the map",
    steps: [
      { kind: "take", site: "cache1", hud: "find Jack's cache in the culvert.", log: "An ammo can wrapped in a feed bag, dry as a bone.", take: { speaker: "The culvert", text: "Down in the culvert, wedged up behind the lip, an olive-drab ammo can.", label: "Haul the can out" } },
      { kind: "take", site: "cache2", hud: "find Jack's cache at the hunting stand.", log: "A Penobscot Gear case lashed under the platform.", take: { speaker: "The hunting stand", text: "A ladder stand in a big hemlock. Under the platform, a case strapped tight.", label: "Climb up and cut it loose" } },
      { kind: "fight", site: "cache3", hud: "somebody's camped on the cellar hole. Clear them.", log: "Somebody found the cellar hole before you did and they're sleeping on it.", foes: R(2, "Cache thief") },
      { kind: "take", site: "cache3", hud: "dig out Jack's cache in the cellar hole.", log: "A buried drum. They didn't dig deep enough.", take: { speaker: "The cellar hole", text: "Granite foundation stones and a lilac bush gone wild. The dirt's soft by the chimney base.", label: "Dig by the chimney" } },
    ],
    done: "All three. You're a ready one, I'll give you that. Half's yours like I said. The strong endure, but the ready prosper.",
    doneLabel: "Split it with Jack", reward: [["shells", 12], ["lockpick-good", 1], ["kit", 1]], iron: 10, xp: 40,
    after: "Jack's three caches are found and split.",
  },
  {
    id: "light", title: "Lighthouse Signal", giver: "cyndal", offer: "Something on the radio?", needs: "radio",
    ask: "There's a light. On the radio Marcel says a light's blinking down at Belfast, on the coast. Long, short, long. Like Morse, but wrong. He says nobody's gone to look. Could you? I'd come but Mom says no, and Dad says no too.",
    accept: "I'll go look",
    steps: [
      { kind: "go", site: "belfast", hud: "travel down to the Belfast shore.", log: "Salt air and gulls. Out on the point the light flashes, long, short, long." },
      { kind: "fight", site: "lighthouse", hud: "the lighthouse is held. Clear it.", log: "Wreckers. They work the light to bring boats onto the ledges.", foes: R(3, "Belfast wrecker") },
      { kind: "take", site: "lighthouse", hud: "climb the lighthouse.", log: "You shut the lamp off and take the wreckers' logbook and a pair of brass binoculars.", take: { speaker: "Lighthouse", text: "Iron stairs go round and round. Up top a car battery runs a lamp on a timer, and there's a logbook full of boat names.", label: "Shut it off and take the logbook" } },
    ],
    done: "Wreckers? That's awful. But you stopped it. I'm going to tell Marcel. Can I keep the logbook? Somebody should know whose boats those were.",
    doneLabel: "It's yours, Cyndal", reward: [["binoculars", 1]], iron: 8, xp: 44,
    after: "The false light at Belfast is dark.",
  },
  {
    id: "wolves", title: "Wolf Pack", giver: "sarah", offer: "Something's at the hens",
    ask: "Three hens gone this week, and not a fox, either. I found tracks the size of my palm. Wolves, out of the north. They'll be back for the rest, then for the calf. Find where they're denned and finish the leader. The pack won't hold together without him.",
    accept: "I'll track them",
    steps: [
      { kind: "go", site: "henyard", hud: "look over the hen yard for sign.", log: "Feathers and big tracks heading south out of the yard." },
      { kind: "go", site: "wolfTracks", hud: "follow the wolf sign south.", log: "The tracks join up here, five or six of them. They're traveling together." },
      { kind: "fight", site: "wolfDen", hud: "wolves at the den. Bring down the pack leader.", log: "A big grizzled male stands up at the den mouth, and the pack fans out around him.", foes: [["wolf", null, "Pack leader", 44, 9, 24], ["wolf", null, "Wolf", 22, 6, 10], ["wolf", null, "Wolf", 22, 6, 10]] },
    ],
    done: "You got the old male? The rest'll scatter, they always do. The hens'll lay again once they calm down. Here, take the pelts, they're yours.",
    doneLabel: "Hens are safe", reward: [["pelt", 3], ["meat", 1]], xp: 40,
    after: "The wolf pack is broken up. The hens are laying again.",
  },
  {
    id: "garden", title: "Mira's Garden", giver: "mira", offer: "Are you planting this winter?",
    ask: "I could grow greens all winter if I had a greenhouse. Old windows will do, storm windows, anything with glass. There's three places I know of out past Ashwell where the glass is still good. Bring me the windows and help me frame it, before the ground freezes hard.",
    accept: "I'll get windows",
    steps: [
      { kind: "take", site: "window1", hud: "salvage windows at the burned-out farmhouse.", log: "Four sashes, wavy old glass, not a crack.", take: { speaker: "Burned-out farmhouse", text: "The ell burned but the front parlor didn't. The six-over-six windows are still in their frames.", label: "Pull the sashes" } },
      { kind: "take", site: "window2", hud: "salvage the old storm windows.", log: "Six storm windows, stacked and tied.", take: { speaker: "Old storm windows", text: "Stacked behind a barn under a tarp, a dozen aluminum storm windows.", label: "Load six" } },
      { kind: "take", site: "window3", hud: "salvage glass from the collapsed porch.", log: "The last two big panes, wrapped in a blanket.", take: { speaker: "Collapsed porch", text: "A glassed-in sun porch, roof down, but two big panes survived.", label: "Ease them out" } },
      { kind: "take", site: "npc:mira", hud: "frame the greenhouse with Mira.", log: "By dusk it's framed, glazed and banked with straw. Mira's grinning.", take: { speaker: "Mira Pelletier", text: "\"Lean them on the south wall. We'll frame it in spruce poles and bank the bottom with straw.\"", label: "Build the greenhouse" } },
    ],
    done: "Look at it. Lettuce by Christmas, you watch. Take these, and come by for greens whenever you like.",
    doneLabel: "Grow good", reward: [["apple", 4], ["dandelion", 3]], xp: 36,
    after: "Mira's greenhouse stands on the south wall at Ashwell.",
  },
  {
    id: "school", title: "School Days", giver: "sarah", offer: "The kids need books",
    ask: "Cyndal reads everything twice and Loki's forgetting his letters. The old Harmony school still has its library, if nobody's burned it. Clear the place out first. Then you walk them down and back, both of them, and I mean right beside you. And nobody carries a gun but you.",
    accept: "I'll take them",
    steps: [
      { kind: "fight", site: "school", hud: "clear the Harmony school.", log: "There's smoke from the school chimney, and the men inside aren't teachers.", foes: R(3, "School squatter") },
      { kind: "go", site: "npc:sarah", hud: "go home and fetch Cyndal and Loki.", log: "Cyndal's got a pack already. Loki's got two." },
      { kind: "escort", site: "school", hud: "walk Cyndal and Loki to the Harmony school. Keep them close.", log: "The library's dusty but whole. Cyndal goes still in front of the science shelf." },
      { kind: "take", site: "school", hud: "pick out books with the kids.", log: "Two full packs of books. Loki got one about dinosaurs and one about tractors.", take: { speaker: "Harmony school library", text: "Cyndal pulls down an old radio handbook. Loki finds a book about tractors and won't put it down.", label: "Fill the packs" } },
      { kind: "escort", site: "npc:sarah", hud: "walk the kids home to Sarah.", log: "Home before dark, both of them, books and all." },
    ],
    done: "Both of them back, and look at all those books. Loki's already asked me to read the tractor one twice. Thank you.",
    doneLabel: "School's in", reward: [["cider", 2], ["stew", 1]], xp: 40,
    after: "The kids have books. Cyndal is reading the radio handbook cover to cover.",
  },
];

export function questById(id: string): Q11Quest | undefined {
  return Q11.find((q) => q.id === id);
}

export interface Q11Ctx { snowDone: boolean; ferry: boolean; jack: boolean; radio: boolean }
function open(q: Q11Quest, c: Q11Ctx): boolean {
  if (!c.snowDone) return false;
  if (q.needs === "ferry" && !c.ferry) return false;
  if (q.needs === "jack" && !c.jack) return false;
  if (q.needs === "radio" && !c.radio) return false;
  return true;
}

export function stageOf(st: Q11State, id: string): number {
  return st.q[id]?.s ?? 0;
}

export function q11Journal(st: Q11State, c: Q11Ctx): { id: string; title: string; text: string; done: boolean }[] {
  const out: { id: string; title: string; text: string; done: boolean }[] = [];
  for (const q of Q11) {
    const s = stageOf(st, q.id);
    if (s === 0 && !open(q, c)) continue;
    const n = q.steps.length;
    const who = GIVER_NAME[q.giver] ?? q.giver;
    const text = s === 0 ? `${who} has something to ask. (${q.offer}.)`
      : s <= n ? `${q.steps[s - 1]!.hud[0]!.toUpperCase()}${q.steps[s - 1]!.hud.slice(1)}${st.q[q.id]!.left > 0 ? ` ${st.q[q.id]!.left} left.` : ""}`
      : s === n + 1 ? `Go back to ${who}.`
      : q.after;
    out.push({ id: `q11-${q.id}`, title: q.title, text, done: s >= n + 2 });
  }
  return out;
}

export const GIVER_NAME: Record<string, string> = { sarah: "Sarah", loki: "Loki", cyndal: "Cyndal", cal: "Jack Ready", mira: "Mira" };

export function q11Hud(st: Q11State): string {
  for (const q of Q11) {
    const s = stageOf(st, q.id);
    const n = q.steps.length;
    if (s >= 1 && s <= n) return `${q.title}: ${q.steps[s - 1]!.hud}${st.q[q.id]!.left > 0 ? ` ${st.q[q.id]!.left} left.` : ""}`;
    if (s === n + 1) return `${q.title}: go back to ${GIVER_NAME[q.giver] ?? q.giver}.`;
  }
  return "";
}

/** Extra talk for v11 quest givers: replace the line, or add choices. */
export function q11Talk(role: string, st: Q11State, c: Q11Ctx, raidOn: boolean): { replace?: Dialogue; add?: { label: string; id: string }[] } | null {
  if (raidOn) return null;
  const add: { label: string; id: string }[] = [];
  for (const q of Q11) {
    if (q.giver !== role) continue;
    const s = stageOf(st, q.id);
    if (s === q.steps.length + 1)
      return { replace: { speaker: GIVER_NAME[role] ?? role, text: q.done, choices: [{ label: q.doneLabel, id: `q11-done-${q.id}` }] } };
    if (s === 0 && open(q, c)) add.push({ label: q.offer, id: `q11-ask-${q.id}` });
  }
  return add.length ? { add } : null;
}

export function q11Ask(q: Q11Quest): Dialogue {
  return { speaker: GIVER_NAME[q.giver] ?? q.giver, text: q.ask, choices: [{ label: q.accept, id: `q11-accept-${q.id}` }, { label: "Not right now", id: "close" }] };
}

// ---------------------------------------------------------------- seasons
export const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;
export const SEASON_DAYS = 6;
/** The story starts in late fall. */
export function seasonOf(day: number, seasonDay: number): number {
  return (2 + Math.floor(Math.max(0, day - seasonDay) / SEASON_DAYS)) % 4;
}
export const SEASON_TINT = ["rgba(150,205,130,0.10)", "rgba(240,215,120,0.08)", "", "rgba(190,215,245,0.16)"];
/** Crop yield multiplier for the farm builder. */
export const SEASON_CROP = [1, 2, 1, 0];

// ---------------------------------------------------------------- farm builder
export const FARM_UPGRADES = [
  { id: "plots", name: "Potato plot", max: 3, wood: 4, stone: 0, iron: 0, prop: "crates", blurb: "Apples and potatoes every day the ground isn't froze." },
  { id: "coop", name: "Chicken coop", max: 3, wood: 6, stone: 0, iron: 2, prop: "stall", blurb: "Eggs every morning. Wolves love it too." },
  { id: "wall", name: "Stone wall", max: 3, wood: 0, stone: 4, iron: 0, prop: "wall", blurb: "Slows raiders at the yard edge." },
  { id: "smoke", name: "Smokehouse", max: 3, wood: 8, stone: 2, iron: 4, prop: "logs", blurb: "Turns meat into jerky overnight." },
] as const;

// ---------------------------------------------------------------- hunting / wind / caravan text
export const COMPASS8 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export const CARAVAN_ROUTES = [
  { label: "Route 2 through Newport (fast, raiders)", risk: 0.7, foe: "bandit", days: 1 },
  { label: "The river road (slow, quieter)", risk: 0.3, foe: "bandit", days: 2 },
  { label: "Back roads through Dixmont (coyote country)", risk: 0.5, foe: "coyote", days: 1 },
];
export const MODE_TEXT = {
  winter: "Winter Survival. Deep January at Cambridge Road. The days are short, the woodpile's low and so's the pantry. Keep warm, keep fed, and hold on until spring.",
  endless: "Endless Raid. They don't stop coming. Hold the farm as long as you can.",
  watch: "Night Watch. Lantern lit, the family asleep. Somebody's creeping around the barns tonight. Watch for the ripples in the dark and catch them before they get to the hens.",
};
