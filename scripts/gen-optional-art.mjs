// v11.1: list which optional art files exist, so the game only requests those (no 404s for missing art).
// Run after adding art: node scripts/gen-optional-art.mjs
import { existsSync, readdirSync, writeFileSync } from "node:fs";
const root = new URL("../public/game/", import.meta.url).pathname;
const want = [
  "v2/bike-parked", "v2/bike-ride", "v2/hero-ride", "v2/justin-ride", "v2/sarah-ride",
  "v2/skowhegan-mill", "v2/skowhegan-hospital", "v2/skowhegan-store", "v2/skowhegan-hardware", "v2/skowhegan-house", "v2/skowhegan-house2", "v2/skowhegan-house3", "v2/skowhegan-bridge",
  "v2/farm-greenhouse", "v2/farm-barrel", "v2/farm-solar", "v2/farm-lookout", "v2/farm-palisade", "v2/farm-cellar", "v2/farm-bench",
  "v2/biscuit-walk", "v2/biscuit-idle",
  // v15.10: Sarah's pet raccoon, wild raccoons and turtles
  "v2/raccoon-walk", "v2/raccoon-idle", "v2/raccoon-wild-walk", "v2/turtle-walk",
  "items/medicine", "items/bone", "items/steeltrap", "items/greens", "items/water",
  "items/gas", "items/carburetor", "items/chain", "items/engine", "items/gastank", "items/sparkplug", "items/tire",
  "v2/tractor-drive",
  // v12: gw14 character action sheets
  ...["holt", "jack", "mira", "nora", "sarah"].flatMap((k) => ["walk", "idle", "run", "gun", "gun-atk", "axe", "hit", "down", "crouch", "death"].map((a) => `v2/${k}-${a}`)),
  ...["cyndal", "loki"].flatMap((k) => ["walk", "idle", "run", "carry", "crouch", "hit", "down"].map((a) => `v2/${k}-${a}`)),
  ...["walk", "idle", "talk"].map((a) => `v2/marcel-${a}`),
  ...["walk", "idle", "run", "gun", "gun-atk", "axe", "hit", "down", "crouch", "death"].map((a) => `v2/justin-${a}`),
  ...["scout", "armor", "brute", "torch", "gray", "blue"].flatMap((k) => ["walk", "hit"].map((a) => `v2/bandit-${k}-${a}`)),
  ...["birch", "bush", "log", "pine", "snag", "spruce"].flatMap((k) => [2, 3].map((i) => `v2/trees/${k}${i}`)),
  "v2/trees/stump1", "v2/trees/stump2", "v2/trees/stump3",
  // v13 hooks: custom player sheets, armor paper-doll layers, the Collector, Harmony buildings
  ...["walk", "idle", "run", "gun", "gun-atk", "axe", "hit", "down", "crouch", "death"].map((a) => `v2/player-${a}`),
  ...["walk", "atk", "death", "idle"].map((a) => `v2/boss-collector-${a}`),
  ...["store", "school", "clinic"].map((a) => `v2/harmony-${a}`),
  // v13.4 vehicle hooks: Grok Build drops car-rod-<1-4>-<se|sw> and truck-chevy-<1-4>-<se|sw> in v2/vehicles
  ...["car-rod", "truck-chevy"].flatMap((k) => [1, 2, 3, 4].flatMap((i) => ["se", "sw"].map((f) => `v2/vehicles/${k}-${i}-${f}`))),
  ...(existsSync(`${root}v2/armor`) ? readdirSync(`${root}v2/armor`).filter((f) => f.endsWith(".png")).map((f) => `v2/armor/${f.slice(0, -4)}`) : []),
];
const have = want.filter((n) => existsSync(`${root}${n}.png`));
writeFileSync(`${root}v2/optional.json`, JSON.stringify(have, null, 1) + "\n");
console.log("optional art present:", have.length ? have.join(", ") : "none");

// v11.2: audio hooks. Drop mp3s in public/game/audio/sfx/<name>.mp3 or public/game/audio/music/<track>.mp3.
const aroot = `${root}audio/`;
const sfx = ["hit", "hurt", "build", "talk", "level", "gather", "die", "click", "chop", "mine", "shoot"].map((n) => `sfx/${n}`);
const music = ["menu", "day", "night", "raid"].map((n) => `music/${n}`);
const haveA = [...sfx, ...music].filter((n) => existsSync(`${aroot}${n}.mp3`));
writeFileSync(`${aroot}manifest.json`, JSON.stringify(haveA, null, 1) + "\n");
console.log("audio present:", haveA.length ? haveA.join(", ") : "none");
