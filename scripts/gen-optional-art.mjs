// v11.1: list which optional art files exist, so the game only requests those (no 404s for missing art).
// Run after adding art: node scripts/gen-optional-art.mjs
import { existsSync, writeFileSync } from "node:fs";
const root = new URL("../public/game/", import.meta.url).pathname;
const want = [
  "v2/bike-parked", "v2/bike-ride", "v2/hero-ride", "v2/justin-ride", "v2/sarah-ride",
  "items/gas", "items/carburetor", "items/chain", "items/engine", "items/gastank", "items/sparkplug", "items/tire",
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
