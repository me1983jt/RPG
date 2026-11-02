import assert from "node:assert/strict";
import { test } from "node:test";
import { STORY_KEYS, applyStory, keepStory, m7ToStory, storyOut } from "./townStory.ts";

const fromTown = {
  "story.clock": { day: 4, phase: "dusk", time: 1110 }, "story.topics": ["mill", "bridge"], "story.stamina": 62, "story.hunger": 1,
  "story.rep": { pittsfield: 7, harmony: -2 }, "story.karma": 12, "story.m7": { back: 7, eye: 8, wind: 5, neighborly: 2, knowhow: 6, quick: 4, fortune: 3 },
  "story.traits": ["wicked", "dooryard"], "story.perks": ["firstlight"], "story.party": [{ id: "loki", ko: false }, { id: "goose", ko: true }],
  "story.player": "sarah", "story.kills": { pittsfield: 1 }, "story.wear": 83, "story.cameo.gus.warned": true, "story.cameo.mira.state": "met", "story.cameo.mira.route": "north", "story.cameo.mira.hideoutRevealed": false, "story.future": { x: [1, 2] }, "pittsfield.mill": "done",
};

test("leaveTown keeps every story.* field (unknown ones too) and enterTown writes them back", () => {
  const store = keepStory({}, fromTown);
  for (const k of STORY_KEYS) assert.deepEqual(store[k], (fromTown as Record<string, unknown>)[k], k);
  assert.deepEqual(store["story.future"], { x: [1, 2] });
  assert.equal("pittsfield.mill" in store, false);
  const p = { m7: { back: 5, eye: 5, wind: 5, neighborly: 5, knowhow: 5, quick: 5, fortune: 5 }, traits2: [], perks: ["oldperk"], karma: 0, rep: { ponds: 3 } };
  applyStory(p, fromTown);
  assert.deepEqual(p.m7, fromTown["story.m7"]);
  assert.deepEqual(p.traits2, ["wicked", "dooryard"]);
  assert.deepEqual(p.perks, ["oldperk", "firstlight"]);
  assert.equal(p.karma, 12);
  assert.deepEqual(p.rep, { ponds: 3, pittsfield: 7, harmony: -2 });
  // simulate a save/load round trip of l1.ts
  const out = storyOut(JSON.parse(JSON.stringify(store)), p, "sarah");
  for (const k of STORY_KEYS) assert.ok(k in out, k);
  assert.deepEqual(out["story.clock"], fromTown["story.clock"]);
  assert.deepEqual(out["story.party"], fromTown["story.party"]);
  assert.deepEqual(out["story.m7"], fromTown["story.m7"]);
  assert.deepEqual(out["story.future"], { x: [1, 2] });
  assert.equal(out["story.stamina"], 62); assert.equal(out["story.hunger"], 1); assert.equal(out["story.wear"], 83);
});

test("story.m7 accepts display names and clamps", () => {
  const p = { m7: { back: 5, eye: 5, wind: 5, neighborly: 5, knowhow: 5, quick: 5, fortune: 5 } };
  applyStory(p, { "story.m7": { might: 12, influence: "3", cunning: null } });
  assert.equal(p.m7.back, 10); assert.equal(p.m7.neighborly, 3); assert.equal(p.m7.knowhow, 5);
  assert.deepEqual(Object.keys(m7ToStory(p.m7)), ["back", "eye", "wind", "neighborly", "knowhow", "quick", "fortune"]);
});
