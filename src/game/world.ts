import { SKOW_BUILDINGS, SKOW_BRIDGE_DX, SKOW_GORGE_DY } from "@/game/v113";
import { findPath } from "@/game/path";
import {
  DIRT,
  FARM,
  HEX_CX,
  HEX_CY,
  HEX_R,
  MAP_H,
  MAP_W,
  PLACES,
  PROP_SPEC,
  ROAD,
  RUBBLE,
  SCRUB,
  SEED,
  SNOW,
  TILE,
  VOID,
  WORLD_OX,
  WORLD_OY,
  inFarm,
  type Enemy,
  type Npc,
  type Prop,
  type PropKind,
  type Resource,
} from "@/game/types";

export interface Gate {
  side: number;
  tx: number;
  ty: number;
  arriveTx: number;
  arriveTy: number;
}

export interface World {
  /** v15: frozen stream tiles (map 0 farm lot), painted as ice; walkable. */
  stream?: [number, number][];
  tiles: Uint8Array;
  blocked: Uint8Array;
  props: Prop[];
  npcs: Npc[];
  enemies: Enemy[];
  startX: number;
  startY: number;
  nextPropId: number;
  nextEnemyId: number;
  id: number;
  name: string;
  seed: number;
  exits: number[];
  gates: Gate[];
  questBandits: number;
  /** v0.7: Mother Pelletier's flooded mill and the Warden's road checkpoint (home map only) */
  flood?: { tx: number; ty: number };
  checkpoint?: { tx: number; ty: number };
}

let genSalt = 0;
let shapingHome = true;

function hash(x: number, y: number, salt = 0): number {
  let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((salt + SEED + genSalt) | 0, 144269503);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function noise(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const v = (ix: number, iy: number) => hash(ix, iy, 11);
  const a = v(x0, y0) * (1 - sx) + v(x0 + 1, y0) * sx;
  const b = v(x0, y0 + 1) * (1 - sx) + v(x0 + 1, y0 + 1) * sx;
  return a * (1 - sy) + b * sy;
}

function idx(tx: number, ty: number): number {
  return ty * MAP_W + tx;
}

function inMap(tx: number, ty: number): boolean {
  return tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H;
}

export function inHex(tx: number, ty: number): boolean {
  const ax = Math.abs(tx - HEX_CX);
  const ay = Math.abs(ty - HEX_CY);
  if (ax > (Math.sqrt(3) / 2) * HEX_R) return false;
  return ay <= HEX_R - ax / Math.sqrt(3);
}

export function pickSides(seed: number): number[] {
  const rank = (side: number) => {
    let n = Math.imul(side + 3, 374761393) ^ Math.imul((seed + 91) | 0, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return (n ^ (n >>> 16)) >>> 0;
  };
  const order = [0, 1, 2, 3, 4, 5].sort((a, b) => rank(a) - rank(b) || a - b);
  const count = rank(9) % 2 === 0 ? 2 : 3;
  return order.slice(0, count).sort((a, b) => a - b);
}

function at(tx: number, ty: number): [number, number] {
  return [tx + WORLD_OX, ty + WORLD_OY];
}

function herd(tx: number, ty: number): [number, number] {
  let x = tx + WORLD_OX;
  let y = ty + WORLD_OY;
  if (genSalt !== 0) {
    x += Math.round((hash(tx, ty, 50) - 0.5) * 10);
    y += Math.round((hash(tx, ty, 51) - 0.5) * 10);
    const pulled = pullIn(x, y);
    x = pulled[0];
    y = pulled[1];
  }
  if (inFarm(x, y) || !inHex(x, y)) return [tx + WORLD_OX, ty + WORLD_OY];
  return [x, y];
}

function pullIn(tx: number, ty: number): [number, number] {
  if (inHex(tx, ty)) return [tx, ty];
  const dx = tx - HEX_CX;
  const dy = ty - HEX_CY;
  for (let s = 0.96; s > 0.15; s -= 0.04) {
    const x = Math.round(HEX_CX + dx * s);
    const y = Math.round(HEX_CY + dy * s);
    if (inHex(x, y)) return [x, y];
  }
  return [HEX_CX, HEX_CY];
}

function edgePoint(side: number, inset: number): { tx: number; ty: number } {
  const a = ((-60 + side * 60) * Math.PI) / 180;
  const d = HEX_R * Math.cos(Math.PI / 6) - inset;
  const tx = Math.round(HEX_CX + Math.cos(a) * d);
  const ty = Math.round(HEX_CY + Math.sin(a) * d);
  const pulled = pullIn(tx, ty);
  return { tx: pulled[0], ty: pulled[1] };
}

export function propCenter(p: Prop): { x: number; y: number } {
  const spec = PROP_SPEC[p.kind];
  return { x: (p.tx + spec.w / 2) * TILE, y: (p.ty + spec.h / 2) * TILE };
}

export function createWorld(seed = SEED, mapId = 0, exits?: number[]): World {
  genSalt = mapId === 0 && seed === SEED ? 0 : ((seed + mapId * 9176) | 0);
  const homeSides = exits && exits.length >= 2 ? exits : pickSides(seed);
  const mouths = (mapId === 0 ? homeSides : homeSides.map((side) => (side + 3) % 6)).filter((side, i, all) => all.indexOf(side) === i);
  if (mapId === 1) return createReach(seed, homeSides, mouths);
  if (mapId === 2) return createSkowhegan(seed, homeSides);
  if (mapId >= 3) return createArea(seed, mapId, homeSides);
  shapingHome = true;
  const tiles = new Uint8Array(MAP_W * MAP_H);
  const blocked = new Uint8Array(MAP_W * MAP_H);
  fillLand(tiles, blocked, 0);

  const bend = genSalt !== 0;
  const mid = at(40, 28);
  const south = at(78, 78);
  const roadPts: [number, number][][] = [
    [
      [PLACES.ashwell.tx, PLACES.ashwell.ty],
      mid,
      [PLACES.rustyard.tx, PLACES.rustyard.ty],
    ],
    [
      [PLACES.ashwell.tx, PLACES.ashwell.ty],
      [PLACES.cambridge.tx, 22 + WORLD_OY],
    ],
    [mid, [PLACES.millcross.tx, PLACES.millcross.ty], south, [PLACES.bonehollow.tx, PLACES.bonehollow.ty]],
  ];
  for (const path of roadPts) {
    for (let i = 0; i < path.length - 1; i++) {
      layPath(tiles, blocked, path[i]![0], path[i]![1], path[i + 1]![0], path[i + 1]![1], bend, i + 3);
    }
  }

  for (const place of Object.values(PLACES)) {
    for (let ty = place.ty - 7; ty <= place.ty + 7; ty++) {
      for (let tx = place.tx - 7; tx <= place.tx + 7; tx++) {
        if (!inMap(tx, ty) || !inHex(tx, ty)) continue;
        if ((tx - place.tx) ** 2 + (ty - place.ty) ** 2 > 46) continue;
        if (tiles[idx(tx, ty)] !== ROAD) {
          tiles[idx(tx, ty)] = DIRT;
          blocked[idx(tx, ty)] = 0;
        }
      }
    }
  }

  const world: World = {
    tiles,
    blocked,
    props: [],
    npcs: [],
    enemies: [],
    startX: PLACES.ashwell.tx * TILE + TILE / 2,
    startY: PLACES.ashwell.ty * TILE + TILE / 2,
    nextPropId: 1,
    nextEnemyId: 1,
    id: 0,
    name: "Moose River",
    seed,
    exits: homeSides,
    gates: [],
    questBandits: 0,
  };

  placeVillage(world);
  scatter(world);
  placePeople(world);
  placeHomestead(world);
  placeLeblanc(world);
  placeCal(world);
  placeBunker(world);
  world.gates = layExits(world, mouths, null);
  finishFarm(world);
  finishCal(world);
  placeEncounters(world);
  world.questBandits = world.enemies.filter((e) => e.quest).length;

  const cot = world.props.find((p) => p.kind === "cot");
  if (cot) {
    world.startX = (cot.tx + 0.5) * TILE;
    world.startY = (cot.ty + 0.5) * TILE;
  } else {
    const start = nearestFree(world, PLACES.cambridge.tx, PLACES.cambridge.ty + 2);
    world.startX = start.x;
    world.startY = start.y;
  }
  return world;
}

function fillLand(tiles: Uint8Array, blocked: Uint8Array, mapId: number): void {
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      if (!inHex(tx, ty)) {
        tiles[idx(tx, ty)] = VOID;
        blocked[idx(tx, ty)] = 1;
        continue;
      }
      const sx = mapId === 0 ? tx - WORLD_OX : tx + 30;
      const sy = mapId === 0 ? ty - WORLD_OY : ty - 16;
      const n = noise(sx * 0.075, sy * 0.075) * 0.7 + noise(sx * 0.16 + 9, sy * 0.16) * 0.3;
      let t = DIRT;
      if (n > 0.74) t = RUBBLE;
      else if (n > 0.4) t = SCRUB;
      tiles[idx(tx, ty)] = t;
      blocked[idx(tx, ty)] = t === RUBBLE ? 1 : 0;
    }
  }
}

function layPath(tiles: Uint8Array, blocked: Uint8Array, x0: number, y0: number, x1: number, y1: number, bend: boolean, salt: number): void {
  const pts = bend ? bendPath(x0, y0, x1, y1, salt) : ([[x0, y0], [x1, y1]] as [number, number][]);
  for (let i = 0; i < pts.length - 1; i++) {
    line(pts[i]![0], pts[i]![1], pts[i + 1]![0], pts[i + 1]![1], (x, y) => stampRoad(tiles, blocked, x, y));
  }
}

function bendPath(x0: number, y0: number, x1: number, y1: number, salt: number): [number, number][] {
  const pts: [number, number][] = [[x0, y0]];
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const px = -(y1 - y0) / len;
  const py = (x1 - x0) / len;
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const j = (hash(i + salt, salt, 60) - 0.5) * 28;
    const spot = pullIn(Math.round(x0 + (x1 - x0) * t + px * j), Math.round(y0 + (y1 - y0) * t + py * j));
    pts.push(spot);
  }
  pts.push([x1, y1]);
  return pts;
}

function nearestRoad(world: World, tx: number, ty: number): { tx: number; ty: number } | null {
  let best: { tx: number; ty: number } | null = null;
  let bestD = 1e9;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (world.tiles[idx(x, y)] !== ROAD || world.blocked[idx(x, y)]) continue;
      const d = (x - tx) ** 2 + (y - ty) ** 2;
      if (d < bestD) {
        bestD = d;
        best = { tx: x, ty: y };
      }
    }
  }
  return best;
}

function layExits(world: World, mouths: number[], from: { tx: number; ty: number } | null): Gate[] {
  const gates: Gate[] = [];
  mouths.forEach((side, n) => {
    const mouth = edgePoint(side, 3);
    const kink = edgePoint(side, 16);
    const arrive = edgePoint(side, 11);
    const start = from ?? nearestRoad(world, kink.tx, kink.ty) ?? { tx: HEX_CX, ty: HEX_CY };
    layPath(world.tiles, world.blocked, start.tx, start.ty, kink.tx, kink.ty, genSalt !== 0, 80 + side * 5 + n);
    layPath(world.tiles, world.blocked, kink.tx, kink.ty, mouth.tx, mouth.ty, false, 0);
    world.props = world.props.filter((p) => {
      const spec = PROP_SPEC[p.kind];
      const cx = p.tx + spec.w / 2;
      const cy = p.ty + spec.h / 2;
      const onMouth = (cx - mouth.tx) ** 2 + (cy - mouth.ty) ** 2 < 18 || (cx - arrive.tx) ** 2 + (cy - arrive.ty) ** 2 < 12;
      if (!onMouth) return true;
      vacate(world, p);
      return false;
    });
    stampRoad(world.tiles, world.blocked, mouth.tx, mouth.ty);
    stampRoad(world.tiles, world.blocked, arrive.tx, arrive.ty);
    gates.push({ side, tx: mouth.tx, ty: mouth.ty, arriveTx: arrive.tx, arriveTy: arrive.ty });
  });
  return gates;
}

function createReach(seed: number, homeSides: number[], mouths: number[]): World {
  shapingHome = false;
  const tiles = new Uint8Array(MAP_W * MAP_H);
  const blocked = new Uint8Array(MAP_W * MAP_H);
  fillLand(tiles, blocked, 1);
  const world: World = {
    tiles,
    blocked,
    props: [],
    npcs: [],
    enemies: [],
    startX: HEX_CX * TILE + TILE / 2,
    startY: HEX_CY * TILE + TILE / 2,
    nextPropId: 1,
    nextEnemyId: 1,
    id: 1,
    name: "Chain of Ponds",
    seed,
    exits: homeSides,
    gates: [],
    questBandits: 0,
  };
  world.gates = layExits(world, mouths, { tx: HEX_CX, ty: HEX_CY });
  scatter(world);
  clearPad(world, HEX_CX, HEX_CY, 6);
  addProp(world, "shack", HEX_CX - 2, HEX_CY - 1);
  addProp(world, "campfire", HEX_CX + 1, HEX_CY);
  addProp(world, "logs", HEX_CX + 3, HEX_CY + 1, { resource: "wood", amount: 4 });
  addProp(world, "scrap", HEX_CX - 3, HEX_CY + 2, { resource: "scrap", amount: 3 });
  addNpc(world, "villager", "Nellie Foss", HEX_CX, HEX_CY + 2);
  addNpc(world, "villager", "Villager", HEX_CX + 2, HEX_CY + 2);
  addNpc(world, "villager", "Villager", HEX_CX - 2, HEX_CY + 3);
  const ham = pullIn(HEX_CX + 22, HEX_CY - 18);
  clearPad(world, ham[0], ham[1], 4);
  addProp(world, "ruin", ham[0] - 1, ham[1]);
  addProp(world, "campfire", ham[0] + 2, ham[1] + 1);
  addNpc(world, "villager", "Villager", ham[0] + 1, ham[1] + 2);
  placeOrchard(world);
  let pack = 1;
  const dens: [number, number, "wolf" | "deer" | "coyote" | "moose" | "rabbit", number][] = [
    [18, -12, "wolf", 4],
    [-26, -6, "wolf", 5],
    [-20, 14, "deer", 3],
    [12, 22, "coyote", 5],
    [-16, -18, "moose", 1],
    [8, -24, "rabbit", 3],
  ];
  for (const [dx, dy, kind, count] of dens) {
    const spot = pullIn(HEX_CX + dx, HEX_CY + dy);
    addPack(world, kind, spot[0], spot[1], count, pack++);
  }
  addEnemy(world, HEX_CX + 14, HEX_CY + 8, false, false);
  addEnemy(world, HEX_CX - 12, HEX_CY + 16, false, true);
  shapingHome = true;
  return world;
}

/** v11.3: abandoned Skowhegan (map 2). Town north of the Kennebec gorge, one bridge, one road out south. */
function createSkowhegan(seed: number, homeSides: number[]): World {
  shapingHome = false;
  const tiles = new Uint8Array(MAP_W * MAP_H);
  const blocked = new Uint8Array(MAP_W * MAP_H);
  fillLand(tiles, blocked, 2);
  const world: World = {
    tiles, blocked, props: [], npcs: [], enemies: [],
    startX: HEX_CX * TILE + TILE / 2, startY: HEX_CY * TILE + TILE / 2,
    nextPropId: 1, nextEnemyId: 1, id: 2, name: "Skowhegan", seed, exits: homeSides, gates: [], questBandits: 0,
  };
  let south = 0;
  for (let s = 1; s < 6; s++) if (edgePoint(s, 3).ty > edgePoint(south, 3).ty) south = s;
  world.gates = layExits(world, [south], { tx: HEX_CX, ty: HEX_CY + SKOW_GORGE_DY + 3 });
  scatter(world);
  const cx = HEX_CX, cy = HEX_CY;
  // main street and cross streets
  layPath(tiles, blocked, cx, cy + SKOW_GORGE_DY + 4, cx, cy - 26, false, 0);
  layPath(tiles, blocked, cx - 20, cy - 14, cx + 22, cy - 14, false, 0);
  layPath(tiles, blocked, cx - 16, cy - 22, cx + 18, cy - 22, false, 0);
  clearPad(world, cx, cy - 14, 6);
  // the gorge: a band of broken rock across the whole map, open only at the bridge
  const gy = cy + SKOW_GORGE_DY;
  for (let ty = gy; ty <= gy + 1; ty++) for (let tx = 0; tx < MAP_W; tx++) {
    if (!inMap(tx, ty) || !inHex(tx, ty)) continue;
    const onBridge = Math.abs(tx - (cx + SKOW_BRIDGE_DX)) <= 1;
    tiles[idx(tx, ty)] = onBridge ? ROAD : RUBBLE;
    blocked[idx(tx, ty)] = onBridge ? 0 : 1;
  }
  world.props = world.props.filter((p) => {
    const hit = p.ty + PROP_SPEC[p.kind].h > gy - 1 && p.ty < gy + 3 && Math.abs(p.tx - cx) < 4;
    if (hit) vacate(world, p);
    return !hit;
  });
  // stand-in gorge edge: boulders along the lip, rails on the bridge (art hook: v2/skowhegan-bridge via the prop skin)
  for (let tx = 2; tx < MAP_W - 2; tx += 2) {
    if (Math.abs(tx - cx) <= 3 || !inHex(tx, gy - 1)) continue;
    if ((tx * 7) % 10 < 7) addProp(world, "rock", tx, gy - 1);
  }
  addProp(world, "fence", cx - 2, gy, { skin: "skowhegan-bridge", label: "KENNEBEC BRIDGE" });
  addProp(world, "fence", cx + 2, gy);
  for (const b of SKOW_BUILDINGS) {
    clearPad(world, cx + b.dx, cy + b.dy, 3);
    addProp(world, b.kind, cx + b.dx, cy + b.dy, { skin: b.skin, label: b.label });
  }
  // Marcel Thibodeau keeps the general store open (the radio trader, met in person)
  addNpc(world, "marcel", "Marcel Thibodeau", cx - 4, cy - 15, 1);
  addProp(world, "car-truck", cx + 3, cy - 10);
  addProp(world, "car-sedan", cx - 6, cy - 15);
  addProp(world, "scrap", cx + 8, cy - 16, { resource: "scrap", amount: 5 });
  addProp(world, "scrap", cx - 9, cy - 20, { resource: "scrap", amount: 5 });
  addProp(world, "crates", cx + 6, cy - 23);
  // raiders hold the town: higher tier than the home woods
  addEnemy(world, cx + 2, cy - 12, false, true);
  addEnemy(world, cx - 12, cy - 8, false, true);
  addEnemy(world, cx + 12, cy - 18, false, false);
  addEnemy(world, cx - 6, cy - 26, false, true);
  addEnemy(world, cx + 16, cy - 26, false, false);
  for (const e of world.enemies) { e.hp = e.maxHp = e.elite ? 44 : 28; e.atk = e.elite ? 9 : 6; e.xp = e.elite ? 26 : 14; }
  addPack(world, "deer", ...pullIn(cx - 30, cy + 18), 3, 1);
  addPack(world, "rabbit", ...pullIn(cx + 26, cy + 20), 3, 2);
  addPack(world, "coyote", ...pullIn(cx + 30, cy - 30), 3, 3);
  shapingHome = true;
  return world;
}

function stampRoad(tiles: Uint8Array, blocked: Uint8Array, x: number, y: number): void {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tx = x + dx;
      const ty = y + dy;
      if (!inMap(tx, ty) || !inHex(tx, ty)) continue;
      tiles[idx(tx, ty)] = ROAD;
      blocked[idx(tx, ty)] = 0;
    }
  }
}

function line(x0: number, y0: number, x1: number, y1: number, plot: (x: number, y: number) => void): void {
  let dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    plot(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function fits(world: World, tx: number, ty: number, w: number, h: number, allowRoad: boolean): boolean {
  if (tx < 2 || ty < 2 || tx + w >= MAP_W - 2 || ty + h >= MAP_H - 2) return false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(tx + x, ty + y);
      if (world.blocked[i]) return false;
      if (world.tiles[i] === VOID || world.tiles[i] === RUBBLE) return false;
      if (!allowRoad && world.tiles[i] === ROAD) return false;
    }
  }
  return true;
}

export function occupy(world: World, prop: Prop): void {
  const spec = PROP_SPEC[prop.kind];
  if (!spec.blocks) return;
  for (let y = 0; y < spec.h; y++) {
    for (let x = 0; x < spec.w; x++) world.blocked[idx(prop.tx + x, prop.ty + y)] = 1;
  }
}

export function vacate(world: World, prop: Prop): void {
  const spec = PROP_SPEC[prop.kind];
  if (!spec.blocks) return;
  for (let y = 0; y < spec.h; y++) {
    for (let x = 0; x < spec.w; x++) world.blocked[idx(prop.tx + x, prop.ty + y)] = 0;
  }
}

export function addProp(world: World, kind: PropKind, tx: number, ty: number, extra?: Partial<Prop>): Prop | null {
  const spec = PROP_SPEC[kind];
  const allowRoad = kind === "car-sedan" || kind === "car-truck" || kind === "bike" || kind.startsWith("gate-") || kind === "wreck" || kind === "wall-x";
  if (!fits(world, tx, ty, spec.w, spec.h, allowRoad)) return null;
  const prop: Prop = { id: world.nextPropId++, kind, tx, ty, ...extra };
  if ((kind === "shack" || kind === "ruin") && prop.locked !== false) prop.locked = true;
  if (kind === "shelter" || kind === "workshop" || kind === "campfire" || kind === "farmhouse" || kind === "barn" || kind === "hatch") prop.locked = false;
  world.props.push(prop);
  occupy(world, prop);
  return prop;
}

export function tryPlace(world: World, kind: PropKind, tx: number, ty: number): Prop | null {
  return addProp(world, kind, tx, ty);
}

function placeHomestead(world: World): void {
  for (let ty = FARM.ty - FARM.r - 1; ty <= FARM.ty + FARM.r + 1; ty++) {
    for (let tx = FARM.tx - FARM.r - 1; tx <= FARM.tx + FARM.r + 1; tx++) {
      if (!inMap(tx, ty) || !inHex(tx, ty)) continue;
      if (!inFarm(tx, ty)) continue;
      if (world.tiles[idx(tx, ty)] !== ROAD) world.tiles[idx(tx, ty)] = SNOW;
      world.blocked[idx(tx, ty)] = 0;
    }
  }
  world.props = world.props.filter((p) => {
    const spec = PROP_SPEC[p.kind];
    if (!inFarm(p.tx + spec.w / 2, p.ty + spec.h / 2)) return true;
    vacate(world, p);
    return false;
  });
  world.enemies = world.enemies.filter((e) => !inFarm(Math.floor(e.x / TILE), Math.floor(e.y / TILE)));

  // v15 map scan: laid out after the satellite lot maps (harmony-map/): the county road runs SW to NE past the
  // south-east corner of the lot; the house sits back from it with the outbuildings strung along the road side,
  // an open field north of the house, woods closing in on the far sides and a stream down the west edge.
  for (let x = 18; x <= 56; x++) {
    const y = Math.round(27 - (x - 18) * 0.55);
    const [tx, ty] = at(x, y);
    stampRoad(world.tiles, world.blocked, tx, ty);
  }
  const [dx0, dy0] = at(36, 16);
  world.props = world.props.filter((p) => {
    const spec = PROP_SPEC[p.kind];
    const cx = p.tx + spec.w / 2, cy = p.ty + spec.h / 2;
    if ((cx - dx0) ** 2 + (cy - dy0) ** 2 > 15 * 15 || world.tiles[idx(Math.floor(cx), Math.floor(cy))] !== ROAD) return true;
    vacate(world, p);
    return false;
  });
  plantYard(world, "farmhouse", 29, 12);
  plantYard(world, "barn", 39, 11);
  plantYard(world, "shack", 43, 9);
  plantYard(world, "cot", 33, 13);
  plantYard(world, "press", 36, 14);
  plantYard(world, "crates", 38, 15, { amount: 4 });
  plantYard(world, "crates", 35, 16, { amount: 4 });
  plantYard(world, "post-loft", 41, 13);
  plantYard(world, "post-porch", 33, 14);
  plantYard(world, "post-roof", 45, 12);
  plantYard(world, "tractor", 34, 16);
  plantYard(world, "scarecrow", 33, 7);
  plantYard(world, "bait", 31, 18);
  for (const tx of [27, 29, 31, 33, 35, 37]) plantYard(world, "fence", tx, 5);
  // the field north of the house: two orchard rows
  for (const [tx, ty] of [at(28, 9), at(30, 8), at(34, 9), at(36, 8), at(38, 8), at(40, 7), at(29, 17)] as const) addProp(world, "orchard", tx, ty);
  // sugar maples at the yard edge
  for (const [tx, ty] of [at(26, 12), at(26, 16), at(27, 20), at(44, 6), at(42, 5), at(31, 21)] as const) addProp(world, "maple", tx, ty);
  // woods edge: spruce across the road to the south-east, and west of the stream
  for (let n = 0; n < 40; n++) {
    const x = 26 + ((n * 7) % 30), y = 20 + ((n * 5) % 12);
    if (y <= 27 - (x - 18) * 0.55 + 3) continue;
    const [tx, ty] = at(x, y);
    if (inMap(tx, ty) && inHex(tx, ty) && world.tiles[idx(tx, ty)] !== ROAD) addProp(world, n % 3 ? "tree-spruce" : "tree-fir", tx, ty);
  }
  for (let y = 4; y <= 26; y += 2) {
    const [tx, ty] = at(19 + ((y * 3) % 3), y);
    if (inMap(tx, ty) && inHex(tx, ty) && world.tiles[idx(tx, ty)] !== ROAD) addProp(world, y % 4 ? "tree-spruce" : "tree-birch", tx, ty);
  }
  // the stream: winds down the west side of the lot and under the road
  world.stream = [];
  for (let y = 0; y <= 30; y++) {
    const x = Math.round(23 + Math.sin(y * 0.45) * 1.6);
    const [tx, ty] = at(x, y);
    if (inMap(tx, ty) && inHex(tx, ty)) { world.stream.push([tx, ty]); if (world.tiles[idx(tx, ty)] !== ROAD) { world.tiles[idx(tx, ty)] = SNOW; world.blocked[idx(tx, ty)] = 0; } }
  }
}

function plantYard(world: World, kind: PropKind, lx: number, ly: number, extra?: Partial<Prop>): void {
  const spec = PROP_SPEC[kind];
  const spots: [number, number][] = [[lx, ly], [lx + 1, ly], [lx - 1, ly], [lx, ly + 1], [lx, ly - 1], [lx + 1, ly + 1], [lx + 2, ly], [lx, ly + 2]];
  for (const [x, y] of spots) {
    const [tx, ty] = at(x, y);
    if (!inFarm(tx + spec.w / 2, ty + spec.h / 2)) continue;
    if (addProp(world, kind, tx, ty, extra)) return;
  }
  const [tx, ty] = at(lx, ly);
  for (let y = 0; y < spec.h; y++) {
    for (let x = 0; x < spec.w; x++) {
      if (!inMap(tx + x, ty + y)) return;
      const i = idx(tx + x, ty + y);
      if (world.tiles[i] === VOID) return;
      if (world.tiles[i] === ROAD || world.tiles[i] === RUBBLE) world.tiles[i] = SNOW;
      world.blocked[i] = 0;
    }
  }
  addProp(world, kind, tx, ty, extra);
}

/**
 * Runs after layExits. An exit road can land on the farmhouse (layExits drops props near a gate),
 * so put any lost farm building back next to its spot, then add the woodpile for the
 * "First Snow on Cambridge Road" quest and the family who live here.
 */
function finishFarm(world: World): void {
  const nearGate = (tx: number, ty: number, w: number, h: number) =>
    world.gates.some((g) => {
      const cx = tx + w / 2;
      const cy = ty + h / 2;
      return (cx - g.arriveTx) ** 2 + (cy - g.arriveTy) ** 2 < 16 || (cx - g.tx) ** 2 + (cy - g.ty) ** 2 < 20;
    });
  // Non-blocking props (cot, campfire) don't mark tiles blocked, so check footprints too.
  const overlapsProp = (tx: number, ty: number, w: number, h: number) =>
    world.props.some((p) => {
      const ps = PROP_SPEC[p.kind];
      return tx < p.tx + ps.w + 1 && tx + w + 1 > p.tx && ty < p.ty + ps.h + 1 && ty + h + 1 > p.ty;
    });
  const restore = (kind: PropKind, home: [number, number], extra?: Partial<Prop>) => {
    if (world.props.some((p) => p.kind === kind && inFarm(p.tx, p.ty))) return;
    const spec = PROP_SPEC[kind];
    for (let r = 0; r <= 6; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const tx = home[0] + dx;
          const ty = home[1] + dy;
          if (!inFarm(tx, ty) || nearGate(tx, ty, spec.w, spec.h) || overlapsProp(tx, ty, spec.w, spec.h)) continue;
          if (addProp(world, kind, tx, ty, extra)) return;
        }
      }
    }
    if (kind !== "farmhouse" && kind !== "barn") return;
    // v15.4: the 3x3 home buildings must always exist (raids target the farmhouse); clear the lot.
    const [hx, hy] = home;
    const keep = new Set(["farmhouse", "barn"]);
    world.props = world.props.filter((p) => {
      const ps = PROP_SPEC[p.kind];
      const hit = hx < p.tx + ps.w + 1 && hx + spec.w + 1 > p.tx && hy < p.ty + ps.h + 1 && hy + spec.h + 1 > p.ty;
      if (!hit || keep.has(p.kind)) return true;
      vacate(world, p);
      return false;
    });
    for (let y = 0; y < spec.h; y++) for (let x = 0; x < spec.w; x++) {
      const i = idx(hx + x, hy + y);
      if (world.tiles[i] === VOID || world.tiles[i] === RUBBLE || world.tiles[i] === ROAD) world.tiles[i] = DIRT;
      world.blocked[i] = 0;
    }
    addProp(world, kind, hx, hy, extra);
  };
  restore("farmhouse", at(29, 12));
  restore("barn", at(39, 11));
  restore("cot", at(33, 13));
  restore("press", at(36, 14));
  // woodpile by the barn for "First Snow on Cambridge Road"
  restore("logs", at(41, 15), { resource: "wood", amount: 4 });
  // v15: you are Justin; no Justin NPC.
  addNpc(world, "sarah", "Sarah", ...at(35, 13), 30);
  addNpc(world, "cyndal", "Cyndal", ...at(33, 10), 30);
  addNpc(world, "loki", "Loki", ...at(37, 12), 30);
}

function placeOrchard(world: World): void {
  const spot = pullIn(HEX_CX - 52, HEX_CY - 6);
  const tx = spot[0];
  const ty = spot[1];
  const step = 5;
  const gap = 6;
  clearPad(world, tx + 12, ty + 3, 16);
  world.enemies = world.enemies.filter((e) => {
    const ex = Math.floor(e.x / TILE);
    const ey = Math.floor(e.y / TILE);
    return (ex - (tx + 12)) ** 2 + (ey - (ty + 3)) ** 2 > 18 * 18;
  });
  for (let y = ty - 1; y <= ty + gap + 1; y++) {
    for (let x = tx - 1; x <= tx + step * 5 + 1; x++) {
      if (!inMap(x, y) || !inHex(x, y)) continue;
      if (world.tiles[idx(x, y)] === VOID) continue;
      world.tiles[idx(x, y)] = DIRT;
      world.blocked[idx(x, y)] = 0;
    }
  }
  for (let i = 0; i < 6; i++) {
    addProp(world, "orchard", tx + i * step, ty);
    addProp(world, "orchard", tx + i * step, ty + gap);
  }
  const lane = ty + 3;
  for (const [x, y] of [
    [tx + step * 5 + 3, lane],
    [tx + step * 5 + 3, lane + 1],
  ] as const) {
    if (!inMap(x, y) || !inHex(x, y)) continue;
    world.tiles[idx(x, y)] = DIRT;
    world.blocked[idx(x, y)] = 0;
  }
  addProp(world, "press", tx + step * 5 + 3, lane);
  addProp(world, "crates", tx + step * 5 + 3, lane + 1, { amount: 6 });
  const stand = ty + gap + 4;
  for (let y = stand - 1; y <= stand + 1; y++) {
    for (let x = tx; x <= tx + 10; x++) {
      if (!inMap(x, y) || !inHex(x, y)) continue;
      if (world.tiles[idx(x, y)] === VOID) continue;
      world.tiles[idx(x, y)] = DIRT;
      world.blocked[idx(x, y)] = 0;
    }
  }
  // Justin, Sarah, Cyndal and Loki now live at the Cambridge Road farm (finishFarm, map 0).
}

function clearPad(world: World, tx: number, ty: number, r: number): void {
  world.props = world.props.filter((p) => {
    const spec = PROP_SPEC[p.kind];
    const cx = p.tx + spec.w / 2;
    const cy = p.ty + spec.h / 2;
    if ((cx - tx) ** 2 + (cy - ty) ** 2 > r * r) return true;
    vacate(world, p);
    return false;
  });
  for (let y = ty - r; y <= ty + r; y++) {
    for (let x = tx - r; x <= tx + r; x++) {
      if (!inMap(x, y) || x < 2 || y < 2 || x >= MAP_W - 2 || y >= MAP_H - 2) continue;
      if ((x - tx) ** 2 + (y - ty) ** 2 > r * r) continue;
      if (world.tiles[idx(x, y)] !== ROAD) {
        world.tiles[idx(x, y)] = DIRT;
        world.blocked[idx(x, y)] = 0;
      }
    }
  }
}

function placeLeblanc(world: World): void {
  const spot = at(72, 10);
  const tx = spot[0];
  const ty = spot[1];
  clearPad(world, tx, ty, 4);
  addProp(world, "stall", tx - 1, ty);
  addProp(world, "campfire", tx + 1, ty + 1);
  addProp(world, "crates", tx, ty + 2, { amount: 0 });
  addProp(world, "logs", tx + 2, ty);
  addNpc(world, "rejean", "Réjean Leblanc", tx, ty + 1);
}

function placeCal(world: World): void {
  const spot = at(66, 68);
  placeCalAt(world, spot[0], spot[1]);
}

/** Exit roads are laid after the camps and can cut straight through Jack's stall. If the stall
 *  did not survive, move the whole camp to the nearest dry, road-free spot so he isn't left
 *  standing on the gravel with no stand. */
function finishCal(world: World): void {
  const jack = world.npcs.find((n) => n.role === "cal");
  const stall = world.props.find((p) => p.kind === "cache");
  const by = (kind: PropKind) => !!stall && world.props.some((p) => p.kind === kind && Math.hypot(p.tx - stall.tx, p.ty - stall.ty) < 4);
  if (jack && stall && by("campfire") && by("logs") && by("crates")) return;
  const home = at(66, 68);
  const near = (tx: number, ty: number) => (tx - home[0]) ** 2 + (ty - home[1]) ** 2 <= 36;
  world.npcs = world.npcs.filter((n) => n.role !== "cal");
  world.props = world.props.filter((p) => {
    if ((p.kind === "cache" || p.kind === "crates" || p.kind === "campfire" || p.kind === "logs") && near(p.tx, p.ty)) {
      vacate(world, p);
      return false;
    }
    return true;
  });
  const clearOf = (tx: number, ty: number) => {
    for (let y = ty - 3; y <= ty + 3; y++) for (let x = tx - 3; x <= tx + 3; x++) {
      if (!inMap(x, y) || !inHex(x, y)) return false;
      const t = world.tiles[idx(x, y)];
      if (t === VOID || t === ROAD) return false;
    }
    return !world.gates.some((g) => (tx - g.arriveTx) ** 2 + (ty - g.arriveTy) ** 2 < 49 || (tx - g.tx) ** 2 + (ty - g.ty) ** 2 < 49);
  };
  for (let r = 1; r <= 14; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (!clearOf(home[0] + dx, home[1] + dy)) continue;
        placeCalAt(world, home[0] + dx, home[1] + dy);
        return;
      }
    }
  }
  placeCalAt(world, home[0], home[1]);
}

function placeCalAt(world: World, tx: number, ty: number): void {
  clearPad(world, tx, ty, 4);
  addProp(world, "cache", tx - 1, ty);
  addProp(world, "campfire", tx + 1, ty + 2);
  // crates sit beside the stall, not in front of Jack, so nothing is drawn over him
  addProp(world, "crates", tx - 2, ty + 1);
  addProp(world, "logs", tx + 2, ty);
  addNpc(world, "cal", "Jack Ready", tx, ty + 1);
  clearSightline(world, tx, ty + 1);
}

/** Tall trees on the camera side (south-east in screen terms) of a spot would be drawn over
 *  whoever stands there. Drop the ones in that wedge so the stall and trader stay in view. */
function clearSightline(world: World, tx: number, ty: number): void {
  world.props = world.props.filter((p) => {
    if (!p.kind.startsWith("tree-") && p.kind !== "orchard" && p.kind !== "maple") return true;
    const dx = p.tx - tx;
    const dy = p.ty - ty;
    const depth = dx + dy;
    if (depth <= 0 || depth > 10 || Math.abs(dx - dy) > 3) return true;
    vacate(world, p);
    return false;
  });
}

function placeBunker(world: World): void {
  const spot = at(20, 74);
  let tx = spot[0];
  let ty = spot[1];
  for (let r = 0; r < 8 && (world.tiles[idx(tx, ty)] === ROAD || world.tiles[idx(tx, ty)] === RUBBLE); r++) {
    tx += 1;
    ty += 1;
  }
  clearPad(world, tx, ty, 2);
  addProp(world, "tree-pine", tx, ty - 2);
  addProp(world, "tree-orange", tx + 2, ty - 1);
  addProp(world, "tree-yellow", tx - 2, ty);
  addProp(world, "hatch", tx, ty);
}

function placeVillage(world: World): void {
  const a = PLACES.ashwell;
  addProp(world, "shack", a.tx - 4, a.ty - 4);
  addProp(world, "shack", a.tx + 2, a.ty - 3);
  addProp(world, "shack", a.tx - 5, a.ty + 1);
  addProp(world, "campfire", a.tx + 1, a.ty + 2);
  addProp(world, "logs", a.tx + 6, a.ty + 3, { resource: "wood", amount: 4 });
  addProp(world, "scrap", a.tx + 5, a.ty - 2, { resource: "scrap", amount: 4 });
  addProp(world, "rock", a.tx - 6, a.ty + 4, { resource: "stone", amount: 3, loose: true });

  const m = PLACES.millcross;
  addProp(world, "shack", m.tx - 4, m.ty - 3);
  addProp(world, "shack", m.tx + 2, m.ty - 2);
  addProp(world, "shack", m.tx - 3, m.ty + 2);
  addProp(world, "campfire", m.tx + 1, m.ty + 1);

  const r = PLACES.rustyard;
  addProp(world, "ruin", r.tx - 5, r.ty - 4);
  addProp(world, "ruin", r.tx + 2, r.ty - 2);
  addProp(world, "ruin", r.tx - 4, r.ty + 2);
  addProp(world, "car-sedan", r.tx + 1, r.ty - 5);
  addProp(world, "car-truck", r.tx + 4, r.ty + 1);
  addProp(world, "car-sedan", r.tx - 2, r.ty + 4);
  addProp(world, "scrap", r.tx + 1, r.ty + 3, { resource: "scrap", amount: 5 });
  addProp(world, "scrap", r.tx - 6, r.ty, { resource: "scrap", amount: 4 });

  const b = PLACES.bonehollow;
  addProp(world, "shack", b.tx - 5, b.ty - 4);
  addProp(world, "shack", b.tx + 2, b.ty - 3);
  addProp(world, "shack", b.tx - 3, b.ty + 2);
  addProp(world, "campfire", b.tx + 1, b.ty + 1);
}

function nearPlace(tx: number, ty: number, r: number): boolean {
  if (!shapingHome) {
    if ((tx - HEX_CX) ** 2 + (ty - HEX_CY) ** 2 < r * r) return true;
    return false;
  }
  for (const p of Object.values(PLACES)) {
    if ((tx - p.tx) ** 2 + (ty - p.ty) ** 2 < r * r) return true;
  }
  return false;
}

function scatter(world: World): void {
  let trees = 0;
  let rocks = 0;
  let cars = 0;
  let nodes = 0;
  for (let ty = 3; ty < MAP_H - 3; ty++) {
    for (let tx = 3; tx < MAP_W - 3; tx++) {
      const i = idx(tx, ty);
      const t = world.tiles[i]!;
      if (world.blocked[i]) continue;
      const h = hash(tx, ty, 21);
      if (t === ROAD && cars < 10 && h < 0.012 && !nearPlace(tx, ty, 10)) {
        const kind: PropKind = hash(tx, ty, 22) < 0.5 ? "car-sedan" : "car-truck";
        if (addProp(world, kind, tx, ty)) cars++;
        continue;
      }
      if (nearPlace(tx, ty, 9)) continue;
      if ((t === SCRUB || t === DIRT) && trees < 1100 && h < (t === SCRUB ? 0.11 : 0.045)) {
        const roll = hash(tx, ty, 23);
        const woods: PropKind[] = [
          "tree-pine",
          "tree-pine",
          "tree-spruce",
          "tree-spruce",
          "tree-fir",
          "tree-yellow",
          "tree-birch",
          "tree-orange",
          "tree-red",
          "tree-scrub",
          "tree-dead",
          "tree-bare",
        ];
        const kind = woods[Math.floor(roll * woods.length)]!;
        if (addProp(world, kind, tx, ty)) trees++;
        continue;
      }
      if (t === DIRT && rocks < 160 && h > 0.985) {
        if (addProp(world, "rock", tx, ty)) rocks++;
        continue;
      }
      if (nodes < 90 && h > 0.955 && h < 0.972 && t !== ROAD) {
        const roll = hash(tx, ty, 24);
        if (roll < 0.34) {
          if (addProp(world, "logs", tx, ty, { resource: "wood", amount: 4 })) nodes++;
        } else if (roll < 0.67) {
          if (addProp(world, "scrap", tx, ty, { resource: "scrap", amount: 4 })) nodes++;
        } else if (addProp(world, "rock", tx, ty, { resource: "stone", amount: 3, loose: true })) nodes++;
      }
    }
  }
  let ruins = 0;
  for (let ty = 8; ty < MAP_H - 8 && ruins < 10; ty += 3) {
    for (let tx = 8; tx < MAP_W - 8 && ruins < 10; tx += 3) {
      if (nearPlace(tx, ty, 12)) continue;
      if (hash(tx, ty, 30) < 0.02 && world.tiles[idx(tx, ty)] !== RUBBLE) {
        if (addProp(world, "ruin", tx, ty)) ruins++;
      }
    }
  }
}

function nearestFree(world: World, tx: number, ty: number): { x: number; y: number } {
  for (let r = 0; r < 10; r++) {
    for (let y = ty - r; y <= ty + r; y++) {
      for (let x = tx - r; x <= tx + r; x++) {
        if (!inMap(x, y)) continue;
        if (!world.blocked[idx(x, y)] && world.tiles[idx(x, y)] !== RUBBLE) {
          return { x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 };
        }
      }
    }
  }
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

function addNpc(world: World, role: Npc["role"], name: string, tx: number, ty: number, stay = 0): void {
  const spot = nearestFree(world, tx, ty);
  world.npcs.push({
    id: 100 + world.npcs.length,
    role,
    name,
    x: spot.x,
    y: spot.y,
    homeX: spot.x,
    homeY: spot.y,
    dir: 0,
    frame: 0,
    anim: hash(tx, ty, 4) * 4,
    path: null,
    pause: stay > 0 ? stay : 0.6 + hash(tx, ty, 5) * 2,
    hp: role === "villager" ? 16 : 26,
    maxHp: role === "villager" ? 16 : 26,
  });
}

/** v0.7 encounters, added last so every older enemy keeps its id (saves list the slain by id).
 * Fixed ids in the 90000s for the same reason. */
export const HOLEB_ID = 90001;
export const PELLETIER_ID = 90002;
export const WARDEN_ENEMY_ID = 90003;
export const WARDEN_NPC_ID = 990;
function placeEncounters(world: World): void {
  const keep = world.nextEnemyId;
  // The Moose of Holeb roams the ground west of the pond
  const h = PLACES.bonehollow;
  addBeast(world, "moose", h.tx - 18, h.ty - 3, 0);
  const moose = world.enemies[world.enemies.length - 1]!;
  Object.assign(moose, { id: HOLEB_ID, variant: "holeb", name: "The Moose of Holeb", hp: 110, maxHp: 110, atk: 14, xp: 50, elite: true });
  // Mother Pelletier holds the flooded mill below Attean, with two of her boys
  const m = PLACES.millcross;
  const mill = nearestFree(world, m.tx + 17, m.ty + 15);
  const mtx = Math.floor(mill.x / TILE), mty = Math.floor(mill.y / TILE);
  world.flood = { tx: mtx, ty: mty };
  for (const [dx, dy] of [[-3, -3], [3, 2]] as const) {
    if (!world.blocked[idx(mtx + dx, mty + dy)]) addProp(world, "logs", mtx + dx, mty + dy);
  }
  addEnemy(world, mtx, mty, false, true);
  const ma = world.enemies[world.enemies.length - 1]!;
  Object.assign(ma, { id: PELLETIER_ID, variant: "pelletier", name: "Mother Pelletier", hp: 64, maxHp: 64, atk: 9, xp: 38 });
  addEnemy(world, mtx - 2, mty + 1, false, false);
  world.enemies[world.enemies.length - 1]!.id = 90004;
  addEnemy(world, mtx + 2, mty + 1, false, false);
  world.enemies[world.enemies.length - 1]!.id = 90005;
  // The Bangor Warden keeps a checkpoint on the road between Attean and Holeb
  const cx = Math.round((m.tx + h.tx) / 2), cy = Math.round((m.ty + h.ty) / 2);
  let best: [number, number] | null = null;
  for (let r = 0; r < 24 && !best; r++)
    for (let y = cy - r; y <= cy + r && !best; y++)
      for (let x = cx - r; x <= cx + r && !best; x++)
        if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) === r && world.tiles[idx(x, y)] === ROAD && !world.blocked[idx(x, y)]) best = [x, y];
  const [wx, wy] = best ?? [cx, cy];
  addNpc(world, "warden", "The Bangor Warden", wx, wy, 9999);
  const w = world.npcs[world.npcs.length - 1]!;
  w.id = WARDEN_NPC_ID;
  w.hp = 70;
  w.maxHp = 70;
  world.checkpoint = { tx: wx, ty: wy };
  world.nextEnemyId = keep;
}

function addEnemy(world: World, tx: number, ty: number, quest: boolean, elite: boolean): void {
  const spot = nearestFree(world, tx, ty);
  const hp = elite ? 34 : 20;
  world.enemies.push({
    id: world.nextEnemyId++,
    x: spot.x,
    y: spot.y,
    homeX: spot.x,
    homeY: spot.y,
    hp,
    maxHp: hp,
    atk: elite ? 7 : 4,
    xp: elite ? 18 : 9,
    elite,
    quest,
    kind: "bandit",
    pack: 0,
    temper: "hostile",
    crippleArm: 0,
    crippleLeg: 0,
    dir: 0,
    frame: 0,
    anim: 0,
    cooldown: 0,
    path: null,
    pathT: hash(tx, ty, 8),
    aggro: false,
    dead: false,
    hurt: 0,
  });
}

function addBeast(world: World, kind: "wolf" | "coyote" | "deer" | "moose" | "rabbit" | "squirrel", tx: number, ty: number, pack: number): void {
  const spot = nearestFree(world, tx, ty);
  const stats =
    kind === "moose"
      ? { hp: 46, atk: 10, xp: 16 }
      : kind === "deer"
        ? { hp: 18, atk: 5, xp: 8 }
        : kind === "wolf"
          ? { hp: 20, atk: 6, xp: 9 }
          : kind === "coyote"
            ? { hp: 13, atk: 4, xp: 6 }
            : kind === "rabbit"
              ? { hp: 4, atk: 0, xp: 2 }
              : { hp: 4, atk: 0, xp: 1 };
  world.enemies.push({
    id: world.nextEnemyId++,
    x: spot.x,
    y: spot.y,
    homeX: spot.x,
    homeY: spot.y,
    hp: stats.hp,
    maxHp: stats.hp,
    atk: stats.atk,
    xp: stats.xp,
    elite: kind === "moose",
    quest: false,
    kind,
    pack,
    temper: kind === "rabbit" || kind === "squirrel" ? "timid" : kind === "deer" || kind === "moose" ? "wary" : "hostile",
    crippleArm: 0,
    crippleLeg: 0,
    dir: 0,
    frame: 0,
    anim: 0,
    cooldown: 0,
    path: null,
    pathT: hash(tx, ty, 11),
    aggro: false,
    dead: false,
    hurt: 0,
  });
}

function addPack(world: World, kind: "wolf" | "coyote" | "deer" | "moose" | "rabbit" | "squirrel", tx: number, ty: number, count: number, pack: number): void {
  const spots: [number, number][] = [
    [0, 0],
    [2, 1],
    [-2, 1],
    [1, -2],
    [-1, 2],
    [3, -1],
    [-3, 0],
  ];
  for (let i = 0; i < count && i < spots.length; i++) {
    const [dx, dy] = spots[i]!;
    addBeast(world, kind, tx + dx, ty + dy, pack);
  }
}

function placePeople(world: World): void {
  const a = PLACES.ashwell;
  addNpc(world, "mira", "Mira Pelletier", a.tx + 2, a.ty + 1);
  addNpc(world, "bram", "Bram Cyr", a.tx - 2, a.ty);
  const m = PLACES.millcross;
  addNpc(world, "sera", "Sera Ouellette", m.tx + 2, m.ty);
  addNpc(world, "holt", "Holt Dubay", m.tx - 1, m.ty + 2);
  const b = PLACES.bonehollow;
  addNpc(world, "ivo", "Ivo Nadeau", b.tx + 2, b.ty);
  addNpc(world, "nora", "Nora Hebert", b.tx - 2, b.ty + 1);
  addNpc(world, "adele", "Adele Roy", a.tx + 4, a.ty - 1);
  addNpc(world, "pete", "Pete Lagasse", m.tx - 3, m.ty - 1);
  addNpc(world, "etta", "Etta Beaulieu", a.tx + 5, a.ty + 2);
  addNpc(world, "gus", "Gus Pomerleau", a.tx - 4, a.ty - 2);
  addNpc(world, "ruth", "Ruth Cyr", m.tx + 4, m.ty + 1);
  addNpc(world, "emile", "Emile Violette", m.tx - 4, m.ty - 2);
  addNpc(world, "paul", "Paul Dufour", b.tx + 3, b.ty - 2);
  addNpc(world, "mae", "Mae Lachance", b.tx - 3, b.ty - 1);
  const walter = at(34, 18);
  addNpc(world, "walter", "Walter Kinney", walter[0], walter[1]);
  for (const [tx, ty] of [
    [a.tx + 1, a.ty + 3],
    [a.tx - 3, a.ty + 2],
    [a.tx + 3, a.ty - 2],
    [m.tx + 1, m.ty + 3],
    [m.tx - 2, m.ty - 3],
    [m.tx + 3, m.ty - 1],
    [b.tx + 1, b.ty + 3],
    [b.tx - 1, b.ty - 3],
    [b.tx + 4, b.ty + 1],
    at(33, 19),
    at(38, 18),
  ] as const) {
    addNpc(world, "villager", "Villager", tx, ty);
  }
  addProp(world, "bike", a.tx + 1, a.ty + 3);
  const bike = at(34, 21);
  addProp(world, "bike", bike[0], bike[1]);

  const r = PLACES.rustyard;
  const spots: [number, number][] = [
    [r.tx, r.ty],
    [r.tx + 3, r.ty + 2],
    [r.tx - 3, r.ty + 1],
    [r.tx + 2, r.ty - 3],
    [r.tx - 2, r.ty - 2],
    [r.tx + 4, r.ty - 1],
  ];
  const bosses = [
    { variant: "fur" as const, name: "Harland Poulin" },
    { variant: "mask" as const, name: "René Gallant" },
    { variant: "saw" as const, name: "Gil Michaud" },
  ];
  // The three named bosses are Mira's quest targets; the last one down clears the Chopping.
  // Their three choppers are ordinary hostiles.
  spots.forEach(([x, y], i) => {
    addEnemy(world, x, y, i < 3, i < 3);
    if (i >= 3) return;
    const e = world.enemies[world.enemies.length - 1]!;
    const b = bosses[i]!;
    e.variant = b.variant;
    e.name = b.name;
    e.elite = true;
    e.hp = 54;
    e.maxHp = 54;
    e.atk = 8;
    e.xp = 26;
  });

  addEnemy(world, b.tx - 8, b.ty + 4, false, true);
  addEnemy(world, b.tx + 6, b.ty - 6, false, true);
  addEnemy(world, b.tx - 4, b.ty - 8, false, true);

  const roads: [number, number][] = [];
  for (let ty = 4; ty < MAP_H - 4; ty++) {
    for (let tx = 4; tx < MAP_W - 4; tx++) {
      if (world.tiles[idx(tx, ty)] === ROAD && !world.blocked[idx(tx, ty)] && !nearPlace(tx, ty, 12)) {
        roads.push([tx, ty]);
      }
    }
  }
  const count = 10;
  if (roads.length) {
    const step = Math.max(1, Math.floor(roads.length / count));
    for (let i = 0; i < count; i++) {
      const cell = roads[Math.min(roads.length - 1, i * step)]!;
      addEnemy(world, cell[0], cell[1], false, false);
    }
  }

  let pack = 1;
  const herds: [number, number, "wolf" | "coyote" | "deer" | "moose" | "rabbit" | "squirrel", number][] = [
    [22, 36, "wolf", 3],
    [48, 40, "wolf", 2],
    [72, 78, "wolf", 3],
    [28, 52, "coyote", 6],
    [64, 32, "coyote", 5],
    [86, 84, "coyote", 7],
    [36, 34, "deer", 3],
    [58, 70, "deer", 3],
    [90, 48, "deer", 2],
    [44, 58, "moose", 2],
    [78, 46, "moose", 1],
    [96, 72, "moose", 2],
    [28, 30, "rabbit", 3],
    [48, 32, "rabbit", 4],
    [62, 66, "rabbit", 2],
    [33, 32, "squirrel", 3],
    [54, 24, "squirrel", 2],
    [74, 50, "squirrel", 4],
    [90, 88, "squirrel", 3],
  ];
  for (const [tx, ty, kind, count] of herds) {
    const spot = herd(tx, ty);
    addPack(world, kind, spot[0], spot[1], count, pack++);
  }
}

export function tileOf(x: number, y: number): { tx: number; ty: number } {
  return { tx: Math.floor(x / TILE), ty: Math.floor(y / TILE) };
}

export function cellBlocked(world: World, tx: number, ty: number): boolean {
  if (!inMap(tx, ty)) return true;
  return world.blocked[idx(tx, ty)] === 1 || world.tiles[idx(tx, ty)] === RUBBLE || world.tiles[idx(tx, ty)] === VOID;
}

export function pointBlocked(world: World, x: number, y: number, radius: number): boolean {
  const samples = [
    [0, 0],
    [radius, 0],
    [-radius, 0],
    [0, radius],
    [0, -radius],
    [radius * 0.7, radius * 0.7],
    [radius * 0.7, -radius * 0.7],
    [-radius * 0.7, radius * 0.7],
    [-radius * 0.7, -radius * 0.7],
  ];
  for (const [dx, dy] of samples) {
    const t = tileOf(x + dx!, y + dy!);
    if (cellBlocked(world, t.tx, t.ty)) return true;
  }
  return false;
}

export function pathTo(world: World, x: number, y: number, gx: number, gy: number): { x: number; y: number }[] | null {
  const s = tileOf(x, y);
  let goal = tileOf(gx, gy);
  if (cellBlocked(world, goal.tx, goal.ty)) {
    const near = nearestWalkableTile(world, goal.tx, goal.ty);
    if (!near) return null;
    goal = near;
  }
  const tiles = findPath(world.blocked, MAP_W, MAP_H, s.tx, s.ty, goal.tx, goal.ty);
  if (!tiles) return null;
  return tiles.map((t) => ({ x: t.x * TILE, y: t.y * TILE }));
}

function nearestWalkableTile(world: World, tx: number, ty: number): { tx: number; ty: number } | null {
  for (let r = 1; r <= 6; r++) {
    for (let y = ty - r; y <= ty + r; y++) {
      for (let x = tx - r; x <= tx + r; x++) {
        if (!cellBlocked(world, x, y)) return { tx: x, ty: y };
      }
    }
  }
  return null;
}

export function footprintFree(world: World, tx: number, ty: number, w: number, h: number): boolean {
  return fits(world, tx, ty, w, h, true);
}

export function asResource(kind: PropKind, loose?: boolean): Resource | null {
  if (kind === "scrap") return "scrap";
  if (kind === "logs") return "wood";
  if (kind === "rock" && loose) return "stone";
  return null;
}

/** v14 world-map areas. 3 Lowelltown woods, 4 the Kennebec, 5 raider country, 6 the bunker, 9 a roadside encounter. */
export const AREA_NAME: Record<number, string> = { 3: "Lowelltown Woods", 4: "The Kennebec", 5: "Raider Country", 6: "The Bunker", 7: "Greenville · Moosehead Lake", 9: "Roadside" };
function createArea(seed: number, mapId: number, homeSides: number[]): World {
  shapingHome = false;
  const tiles = new Uint8Array(MAP_W * MAP_H);
  const blocked = new Uint8Array(MAP_W * MAP_H);
  fillLand(tiles, blocked, 1);
  const world: World = {
    tiles, blocked, props: [], npcs: [], enemies: [],
    startX: HEX_CX * TILE + TILE / 2, startY: HEX_CY * TILE + TILE / 2,
    nextPropId: 1, nextEnemyId: 1, id: mapId, name: AREA_NAME[mapId] ?? "The Woods", seed, exits: homeSides, gates: [], questBandits: 0,
  };
  // a road through the middle, east to west, so every edge band has a way in
  for (let tx = 4; tx < MAP_W - 4; tx++) for (const dy of [-1, 0, 1]) { const ty = HEX_CY + dy + Math.round(Math.sin(tx * 0.06 + mapId) * 6); if (inMap(tx, ty) && inHex(tx, ty)) { tiles[idx(tx, ty)] = ROAD; blocked[idx(tx, ty)] = 0; } }
  if (mapId === 4) {
    // the Kennebec: a wide river band north-south with one bridge on the road
    for (let ty = 0; ty < MAP_H; ty++) for (let tx = HEX_CX - 4; tx <= HEX_CX + 4; tx++) {
      const x = tx + Math.round(Math.sin(ty * 0.08) * 5);
      if (!inMap(x, ty) || !inHex(x, ty)) continue;
      if (tiles[idx(x, ty)] === ROAD) continue;
      tiles[idx(x, ty)] = VOID; blocked[idx(x, ty)] = 1;
    }
  }
  if (mapId === 7) {
    // v15.4 Greenville: Moosehead Lake fills the north of the hex; a wobbly shore a few tiles above the road
    for (let tx = 0; tx < MAP_W; tx++) {
      const shore = HEX_CY - 16 + Math.round(Math.sin(tx * 0.11) * 3 + Math.sin(tx * 0.29 + 1) * 1.5);
      for (let ty = 0; ty < shore; ty++) { if (!inMap(tx, ty) || !inHex(tx, ty)) continue; tiles[idx(tx, ty)] = VOID; blocked[idx(tx, ty)] = 1; }
      for (const dy of [0, 1]) { const ty = shore + dy; if (inMap(tx, ty) && inHex(tx, ty) && tiles[idx(tx, ty)] !== ROAD) tiles[idx(tx, ty)] = 0; }
    }
  }
  world.gates = layExits(world, mapId === 7 ? [2, 3, 4, 5] : [0, 1, 2, 3, 4, 5], { tx: HEX_CX, ty: HEX_CY });
  scatter(world);
  clearPad(world, HEX_CX, HEX_CY, 4);
  const poi = (dx: number, dy: number, kind: PropKind, extra?: Partial<Prop>) => { const [x, y] = pullIn(HEX_CX + dx, HEX_CY + dy); clearPad(world, x, y, 2); return addProp(world, kind, x, y, extra); };
  // small points of interest (more can be added to LOOT_SPOTS in worldmap.ts)
  if (mapId === 7) {
    // landing area: a few lakeside cabins from the existing shack art, a cookfire and a woodpile. No hostiles (safe zone in the engine).
    // three cabins along the shore: try spots from the middle outwards until three fit
    let cabins = 0;
    for (const dx of [-8, -2, 4, -14, 10, -20, 16, -26, 22]) {
      if (cabins >= 3) break;
      for (const dy of [-11, -10, -12, -9]) {
        const [x, y] = pullIn(HEX_CX + dx, HEX_CY + dy);
        clearPad(world, x + 1, y + 1, 2);
        for (let yy = y; yy < y + 3; yy++) for (let xx = x; xx < x + 3; xx++) if (inMap(xx, yy) && tiles[idx(xx, yy)] === VOID) { tiles[idx(xx, yy)] = 0; blocked[idx(xx, yy)] = 0; }
        if (addProp(world, "shack", x, y, cabins === 0 ? { label: "Greenville landing", locked: false } as Partial<Prop> : { locked: cabins === 1 ? false : true })) { cabins++; break; }
      }
    }
    poi(2, 3, "campfire");
    poi(-4, 4, "logs", { resource: "wood", amount: 5 });
    shapingHome = true;
    return world;
  }
  poi(-14, -10, "ruin");
  poi(16, 12, "car-truck");
  poi(10, -16, "scrap", { resource: "scrap", amount: 4 });
  poi(-18, 14, "logs", { resource: "wood", amount: 5 });
  poi(4, 18, "campfire");
  if (mapId === 6) poi(0, -4, "hatch");
  let pack = 1;
  const dens: [number, number, "wolf" | "deer" | "coyote" | "moose" | "rabbit", number][] = mapId === 9 ? [[10, -8, "deer", 2]] : [[20, -14, "deer", 3], [-22, 10, "rabbit", 3], [14, 24, "coyote", 3], [-12, -24, mapId === 3 ? "moose" : "wolf", mapId === 3 ? 1 : 4], [26, -4, "wolf", 3 + (mapId % 3)]];
  for (const [dx, dy, kind, count] of dens) { const spot = pullIn(HEX_CX + dx, HEX_CY + dy); addPack(world, kind, spot[0], spot[1], count, pack++); }
  const bandits = mapId === 5 ? [[18, 6], [20, 9], [-16, 8], [-18, 4], [6, -20], [9, -22], [-4, 22]] : mapId === 9 ? [] : [[24, 4]];
  for (const [dx, dy] of bandits) addEnemy(world, HEX_CX + dx!, HEX_CY + dy!, false, mapId === 5 && dx! > 0);
  shapingHome = true;
  return world;
}
