// Recovered game engine. Type checks live in the modules this file imports.
// @ts-nocheck
/** Art cache-bust: bump after replacing any file in public/game (sheets, overlays, item icons). */
const ART_V = 2075;
/** v15.6 camera: screen height of a world unit along the view axis vs. its width (was 0.5, classic 2:1 iso).
 * Lower = the camera sits lower and looks more from the side (3rd person), the ground is more foreshortened and
 * building/character fronts read more. Everything (ground, sprites, depth sort, picking, hexes, fog) projects
 * through this one number. Alternates: 0.42 (subtle), 0.38 (mid); v15.7 uses the lowest, 0.34. A ?isoy=0.4 URL param overrides it for testing. */
const CAM_ISO_Y_DEFAULT = 0.34;
const CAM_ISO_Y = (() => { try { const v = parseFloat(new URLSearchParams(globalThis.location?.search ?? "").get("isoy") ?? ""); return v >= 0.2 && v <= 0.7 ? v : CAM_ISO_Y_DEFAULT; } catch { return CAM_ISO_Y_DEFAULT; } })();
setIsoY(CAM_ISO_Y);
import { dyeBodySheet, type HairId, type StartLook } from "@/game/look";
import { GEAR, CRAFT, armorSlot, rollDrop, roleKit, roleStats, classId, traitOf, defaultLook, type LookId, type RoleId, type TraitId } from "@/game/gear";
import { audioState, setMusic, sfx, unlockAudio } from "@/game/audio";
import { POSE } from "@/game/pose-table";
import { SPRITE_FIT } from "@/game/sprite-fit";
import { BEAST_FIT, BEAST_IN, FOLK_IN, PX_PER_IN, SIZE_IN, TREE_VARY, sizedPx, townH } from "@/game/sizes";
import { ART_SCALE, ART_SCALED } from "@/game/art-scale";
import { JACK_SIGNOFF, SNOW_WOOD, journalEntries, npcLine, objectiveTile, questText, xpNeed } from "@/game/content";
import { DOG_TRAIL, Q10_SITES, Q10_TEXT, RADIO_SITES, freshQ10, loadQ10, q10Hud, q10Journal, q10Talk } from "@/game/quests10";
import { ACHIEVEMENTS, FARM_UPGRADES as FARM_UPGRADES2, SKILL_MAX, TRADE_SKILLS, TRAP_KINDS, skillNeed } from "@/game/v113";
import { BIKE_PARTS, CARAVAN_ROUTES, COMPASS8, FARM_UPGRADES, FISH_SITES, GIVER_NAME, MODE_TEXT, Q11, Q11_SITES, SEASONS, SEASON_CROP, SEASON_DAYS, SEASON_TINT, freshQ11, loadQ11, q11Ask, q11Hud, q11Journal, q11Talk, questById, seasonOf } from "@/game/quests11";
import {
  PERKS,
  SKILLS,
  TOWN_NAME,
  checkChance,
  crimeShift,
  karmaWord,
  perkOk,
  perkSlots,
  priceOf,
  skillPointsOnLevel,
  skillScore,
  tagsForRole,
  townHostile,
  townOf,
  type PerkId,
  type SkillId,
	STATS_RULES,
} from "@/game/progress";
import { facing8Hys } from "@/game/iso";
import { setIsoY } from "@/game/iso";
import { assertIso, facing8, facing8Screen, facingFromWorld, facingRow, screenDirToWorld, screenToWorld, worldToScreen, worldVelToScreen } from "@/game/iso";
import { autoInfo, b64ToBytes, bytesToB64, getSlot, hasSave, restoreAutosave, setSlot, slotInfos, writeAutosave, playerToSave, readSave, writeSave, type SaveData, type SavedRegion } from "@/game/save";
import { useHud, useModeResult } from "@/game/store";
import { WM_LOCS, hexCenter, hexHours, hexKey, hexNeighbors, hexPath, locAt as locAtRaw, locLocked, mooseheadOpen, locOfMap } from "@/game/worldmap";
import { TOWN_PROTOCOL, TOWN_SRC, INJ_MAP, cleanInventory } from "@/game/town";
import { HOLLOWED, LOOT_LORE, LOOT_RUNS, NOISE, noiseReach, SNEAK_MULT, CROUCH_SPEED, CROUCH_SIGHT, PROD, prodOf, BAGS, sortStacks, quickStack, lootRunAt, restockLeft, freshV141, loadV141 } from "@/game/v141";
import { ART14, BENCH_UP, CRAFT14, MAT_NAME, PIECES, PIECE_BROKEN, PIECE_HP, PIECE_UP, STAGE_TEXT, anchorOf, freshV14, isGate14, isWall14, loadV14, repairCost as v14RepairCost } from "@/game/v14";
import { EQUIP_SLOTS, GRID_COLS, SLOT_FIELD, canFit, equipSlotOf, fitsAt, gridRows, itemSize, layoutGrid, slotAccepts, wornCount } from "@/game/inventory";
import { clockLabel, DAY_LENGTH_SEC, morningClock, nightShade } from "@/game/time";
import { AILMENTS, INJURIES, INJ_FX, BACKSTORIES, COMPANIONS, COMPANION_NAME, CORE_STATS, DURA_MAX, DYES, ENDINGS, FOOD_VALUE, LOYALTY_FX, LOYALTY_HELP, LOYALTY_LEAVE, MAIN_ACTS, MAIN_JOURNAL, MAIN_TALK, MIGRATION, MOON_NAMES, NEED_RATE, NEW_SKILLS, RECIPES13, REBUILD, ROAD_EVENTS, SET_BONUS, SKILL_PERKS, TOWNS13, WEATHER, caravanOnRoad, CARAVAN_ROUTES as CARAVAN13, coreEffects, makeBounties, moonEffect, moonPhase, perkCount, pickEnding, pickRoadEvent, rollWeather, travelGas } from "@/game/v13";
import {
  HEX_CX,
  HEX_CY,
  HEX_R,
  MAP_H,
  MAP_W,
  PROP_SPEC,
  RECIPES,
  TILE,
  WORLD_OX,
  WORLD_OY,
  inFarm,
  FARM,
  type AimPart,
  type BeastKind,
  type Dialogue,
  type Enemy,
  type Npc,
  type PackSlot,
  type Player,
  type Prop,
} from "@/game/types";
import {
  cellBlocked,
  createWorld as createWorld0,
  footprintFree,
  pathTo,
  pickSides,
  pointBlocked,
  propCenter,
  tileOf,
  addProp,
  tryPlace,
  vacate,
  occupy,
  HOLEB_ID,
  PELLETIER_ID,
  WARDEN_ENEMY_ID,
  WARDEN_NPC_ID,
  type World,
} from "@/game/world";
import { MAINE_SIDES } from "@/game/world";

export interface GameApi {
  destroy: () => void;
  begin: (name: string, role: RoleId, bonus: { strength: number; vigor: number; endurance: number; intellect: number; perception: number; luck: number }, trait: TraitId, look: LookId, appearance?: StartLook) => void;
  continueGame: () => void;
  startMode: (kind: "winter" | "endless" | "watch") => void;
  setStick: (x: number, y: number) => void;
  v141: (cmd: string, arg?: any) => any;
  tap: (action: "attack" | "interact" | "build" | "pause" | "resume" | "menu" | "respawn" | "save") => void;
  choose: (id: string) => void;
  selectRecipe: (index: number) => void;
  v14: (cmd: string, arg?: any) => any;
  pointer: (x: number, y: number, type: "move" | "down" | "up") => void;
  nudgeZoom: (factor: number) => void;
  pan: (dx: number, dy: number) => void;
  recenter: () => void;
  togglePack: () => void;
  toggleStats: () => void;
  dismount: () => void;
  mount: () => void;
  setSlot: (n: number) => void;
  loadAutosave: () => void;
  dogCommand: (mode: "stay" | "follow" | "track") => void;
  dogHeal: () => void;
  drawMap: (c: HTMLCanvasElement) => void;
  spend: (stat: "strength" | "vigor" | "endurance" | "intellect" | "perception" | "luck" | "agility" | "grit" | "wits") => void;
  openTravel: () => void;
  choose13: (id: string) => void;
  setNotes: (text: string) => void;
  spendSkill: (id: SkillId) => void;
  retag: (id: SkillId) => void;
  takePerk: (id: PerkId) => void;
  dismissParty: () => void;
  clickPack: (id: string) => void;
  /** Pack screen: wear an item in a slot, take one off (optionally onto a grid cell), move a stack, use one. */
  invEquip: (id: string, slot: string) => boolean;
  invUnequip: (slot: string, x?: number, y?: number) => boolean;
  invMove: (id: string, x: number, y: number) => boolean;
  invUse: (id: string) => void;
  craft: (id: string) => void;
  setAim: (part: AimPart) => void;
  setTurnBased: (on: boolean) => void;
  setGraphics: (high: boolean) => void;
  setPerfMode: (on: boolean) => void;
  setShowFps: (on: boolean) => void;
  setFpsCap: (n: number) => void;
  endTurn: () => void;
  takeLoot: (key: string) => void;
  /** Android back button: close the open panel, else open/close the pause menu. False on the main menu. */
  back: () => boolean;
  /** Step out of the building you are in, from anywhere in the room (the always-visible Leave button). */
  leave: () => void;
}

assertIso();
var SCREEN_SPEED = 248;
/** v14.1: animation frame times (gif-compare.md). */
var ANIM_MS = { walk: 60, run: 50, idle: 150, aim: 60, fire: 45 };
/** v14.1: frame counts the new sheets carry (any count loads; the real count is read from the sheet width). */
var ANIM_FRAMES = { walk: 14, run: 14, idle: 10, aim: 6, fire: 6, punch: 10, kick: 12, swing: 14, hit: 5, death: 12, crouch: 8 };
var ENEMY_SPEED = 148;
/** One adult body, small next to a house the way a Fallout figure is. */
var ADULT = 129; // v15.4: people 1.5x (was 86)
var HERO_H = ADULT;
var NPC_H = ADULT;
var RADIUS = 14;
var STEP = 1 / 60;
var IMAGES = [
	"v2/tracks/wolf-left", "v2/tracks/wolf-right",
	...["wall-wood","wall-stone","wall-metal","gate-wood","gate-stone","gate-metal"].flatMap((n) => [`v14/${n}`, `v14/${n}-dmg`]),
	"v2/hollowed-walk", "v2/hollowed-walk-atk", "v2/hollowed-walk-dead",
	...["wall-x","spikes","chest","rainbarrel","sandbags","sandbags-x","workbench","wreck","firering","firering-lit","stash","sign-farm","lookout","lookout-x","garden","smokehouse","raincollector","still"].map((n) => `v14/${n}`),
	"hero",
	"hero-axe",
	"hero-pick",
	"hero-gun",
	"hero-knife",
	"hero-atk",
	"hero-axe-atk",
	"hero-pick-atk",
	"hero-knife-atk",
	"hero-gun-atk",
	"hero-down",
	"hero-hit",
	"v2/hero-idle",
	"v2/hero-axe",
	"v2/hero-death",
	"tool-axe",
	"tool-pick",
	"raider",
	"raider-gray",
	"raider-blue",
	"villager",
	"npc-mira",
	"npc-bram",
	"npc-sera",
	"npc-holt",
	"npc-ivo",
	"npc-justin",
	"npc-sarah",
	"npc-cyndal",
	"npc-loki",
	"npc-rejean",
	"npc-cal",
	"npc-adele",
	"npc-pete",
	"npc-nora",
	"npc-etta",
	"npc-gus",
	"v4/npc-gus",
	"v4/icons/harmony_icon_v4",
	"v4/icons/pittsfield_icon_v4",
	"v4/icons/skowhegan_icon_v4",
	"v4/icons/greenville_icon_v4",
	"v4/overlays/boarded_window_house_v4",
	"v4/overlays/boarded_window_hall_v4",
	"v4/overlays/shingle_holes_v4",
	"v4/npc-pete",
	"npc-ruth",
	"npc-emile",
	"npc-paul",
	"npc-mae",
	"npc-walter",
	"wolf",
	"coyote",
	"deer",
	"moose",
	"rabbit",
	"squirrel",
	"wolf-dead",
	"coyote-dead",
	"deer-dead",
	"moose-dead",
	"rabbit-dead",
	"squirrel-dead",
	"raider-dead",
	"raider-gray-dead",
	"raider-blue-dead",
	"crow",
	"boss-fur",
	"boss-mask",
	"boss-saw",
	"boss-fur-atk",
	"boss-mask-atk",
	"boss-saw-atk",
	"boss-fur-dead",
	"boss-mask-dead",
	"boss-saw-dead",
	"boss-holeb",
	"boss-holeb-dead",
	"boss-warden",
	"boss-warden-dead",
	"boss-pelletier",
	"boss-grok",
	"boss-grok-atk",
	"boss-grok-dead",
	"boss-pelletier-atk",
	"boss-pelletier-dead",
	"raider-scout",
	"raider-brute",
	"raider-torch",
	"guard-sarah",
	"guard-justin",
	"guard-adele",
	"guard-pete",
	"guard-sera",
	"guard-holt",
	"stand",
	"stand-up",
	"blind",
	"blind-up",
	"firepot",
	"firepot-up",
	"nest",
	"nest-up",
	"fence",
	"fence-2",
	"fence-3",
	"fence-x",
	"stand-3",
	"stand-x",
	"blind-3",
	"blind-x",
	"firepot-3",
	"firepot-x",
	"nest-3",
	"nest-x",
	"post-loft",
	"post-porch",
	"post-roof",
	"scarecrow",
	"bait",
	"tractor",
	"tractor-run",
	"bench",
	"raider-jumper",
	"raider-armor",
	"raider-shield",
	"raider-atv",
	"raider-scout-atk",
	"raider-jumper-atk",
	"raider-armor-atk",
	"raider-shield-atk",
	"raider-torch-atk",
	"raider-atv-atk",
	"raider-brute-atk",
	"raider-scout-dead",
	"raider-jumper-dead",
	"raider-armor-dead",
	"raider-shield-dead",
	"raider-torch-dead",
	"raider-atv-dead",
	"raider-brute-dead",
	"guard-watch-sarah",
	"guard-watch-justin",
	"guard-watch-adele",
	"guard-watch-pete",
	"guard-watch-sera",
	"guard-watch-holt",
	"fx-muzzle",
	"fx-smoke",
	"fx-fire",
	"fx-smoke2",
	"icon-fence",
	"icon-pot",
	"icon-bomb",
	"icon-bait",
	"icon-scrap",
	"icon-fuel",
	"bunker-room",
	"farm-room",
	"sack",
	"tree-dead",
	"tree-scrub",
	"tree-pine",
	"tree-yellow",
	"tree-orange",
	"tree-red",
	"tree-spruce",
	"tree-fir",
	"tree-birch",
	"tree-bare",
	"car-sedan",
	"car-truck",
	"rock",
	"shack",
	"ruin",
	"wall",
	"workshop",
	"campfire",
	"scrap",
	"logs",
	"farmhouse",
	"barn",
	"orchard",
	"maple",
	"press",
	"crates",
	"cot",
	"hatch",
	"door",
	"stall",
	"cache",
	"bike",
	"stove",
	"cider-cups",
	"donuts",
	"ground-mat-dirt",
	"ground-mat-scrub",
	"ground-mat-road",
	"ground-mat-rubble",
	"ground-mat-snow"
];
var emptyEdges = () => ({
	attack: false,
	interact: false,
	build: false,
	pause: false,
	resume: false,
	menu: false,
	respawn: false,
	save: false
});
export function mountGame(canvas: HTMLCanvasElement, mini: HTMLCanvasElement): GameApi {
	let ctx: CanvasRenderingContext2D = canvas.getContext("2d")!; // v15.9.4: swapped briefly to fill the cached ground layer
	const mctx = mini.getContext("2d");
	if (!ctx || !mctx) throw new Error("Canvas unsupported");
	const images = /* @__PURE__ */ new Map();
	const keys = /* @__PURE__ */ new Set();
	let injected = /* @__PURE__ */ new Set();
	let prevHeld = /* @__PURE__ */ new Set();
	const edges = emptyEdges();
	let world = null;
	let player = null;
	let explored = /* @__PURE__ */ new Uint8Array(24336);
	let visible = /* @__PURE__ */ new Uint8Array(24336);
	let quest = 0;
	let questKills = 0;
	/** Beta v2 additions: First Snow on Cambridge Road stage, Jack Ready trust, bunker found, kitchen restock day. */
	let snow = 0;
	let jackTrust = 0;
	let jackMet = false;
	let bunkerSeen = false;
	let kitchenDay = -1;
	let questTotal = 6;
	let buildOpen = false;
	let packOpen = false;
	let statsOpen = false;
	let statsWait = false;
	let inside = null;
	/** The building just stepped out of: taps on it don't pull you straight back in for a moment. */
	let justLeft = null;
	let opening = null;
	const OPEN_TIME = .34;
	let stamHud = 0;
	const openedDoors = /* @__PURE__ */ new Set();
	const lootedChests = /* @__PURE__ */ new Set();
	let recipe = 0;
	let intent = null;
	let attackRepath = 0;
	let mounted = false;
	let mountId = -1;
	let drawn = 0;
	let aim = "chest";
	const aim0 = () => aim;
	/** v14.1: real-time hit locations, rolled by weight, with damage multipliers and crippling / knockdown chances. */
	const PART141 = {
		torso: { w: 45, label: "Torso", cripple: 0 },
		legs: { w: 20, label: "Legs", cripple: .35 },
		arms: { w: 20, label: "Arms", cripple: .35 },
		head: { w: 10, label: "Head", cripple: 0 },
		eyes: { w: 3, label: "Eyes", cripple: 1 },
		groin: { w: 2, label: "Groin", cripple: .6 }
	};
	function rollPart141() {
		let r = Math.random() * 100;
		for (const [k, v] of Object.entries(PART141)) { r -= v.w; if (r < 0) return k; }
		return "torso";
	}
	let turnBased = false;
	// v13.4 graphics: High adds smooth sprite scaling, soft shadows, daylight tint, vignette and blended weather
	let gfxHigh = (() => { try { return localStorage.getItem("maine-rpg-gfx") !== "low"; } catch { return true; } })();
	// v15.9.3 Performance mode: on by default on phones (touch + small screen / Android / iPhone). Lower internal
	// resolution, Low-graphics effects, fewer weather particles, nearer AI pause.
	const phone193 = typeof navigator !== "undefined" && (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || (typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 820));
	let perfMode = (() => { try { const v = localStorage.getItem("maine-rpg-perf"); return v ? v === "on" : phone193; } catch { return phone193; } })();
	/** High-graphics effects actually in use (Performance mode forces the Low look). */
	const hiFx = () => gfxHigh && !perfMode;
	let shadow193 = false; // v15.9.3: contact shadows only while the hero, the companion, Goose or an enemy draws
	let aiPausedN = 0;
	const AI_DT = 1 / 20;
	let aiAcc = 0;
	let precipForce = null; // test hook: force a rain / snow event on or off
	const frameMs = { avg: 16, n: 0, worst: 0, list: [] };
	// v15.9.3: per-section frame profiler (test hooks perfReset / perfStats)
	const perf = { on: false, frames: 0, acc: {} };
	const pAdd = (k, t0) => { if (perf.on) perf.acc[k] = (perf.acc[k] || 0) + performance.now() - t0; };
	const weatherMix = {};
	let weatherT = 0;
	let ap = 8;
	let apMax = 8;
	let apWalk = 0;
	const lines = [];
	let log = [];
	let dialogue = null;
	let talkNpc = null;
	let party = null;
	let partyReturn = null;
	/** The Bangor Warden: 0 not met, 1 paid / slipped past, 2 fighting, 3 down. */
	let wardenState = 0;
	let millSeen = false;
	let wardenAsked = false;
	let tractorReady = false;
	const DEFENSE = {
		stand: { range: 190, dmg: 3, every: .85 },
		"stand-up": { range: 240, dmg: 5, every: .7 },
		"stand-3": { range: 280, dmg: 7, every: .55 },
		blind: { range: 280, dmg: 4, every: 1.1 },
		"blind-up": { range: 340, dmg: 6, every: .9 },
		"blind-3": { range: 400, dmg: 8, every: .75 },
		firepot: { range: 108, dmg: 1, every: .35, slow: true },
		"firepot-up": { range: 136, dmg: 2, every: .3, slow: true },
		"firepot-3": { range: 160, dmg: 3, every: .25, slow: true },
		nest: { range: 210, dmg: 6, every: .5 },
		"nest-up": { range: 250, dmg: 8, every: .38 },
		"nest-3": { range: 280, dmg: 11, every: .3 },
		"post-loft": { range: 260, dmg: 5, every: .8 },
		"post-porch": { range: 200, dmg: 4, every: .75 },
		"post-roof": { range: 240, dmg: 5, every: .7 }
	};
	const BROKEN = {
		fence: "fence-x",
		"fence-2": "fence-x",
		"fence-3": "fence-x",
		stand: "stand-x",
		"stand-up": "stand-x",
		"stand-3": "stand-x",
		blind: "blind-x",
		"blind-up": "blind-x",
		"blind-3": "blind-x",
		firepot: "firepot-x",
		"firepot-up": "firepot-x",
		"firepot-3": "firepot-x",
		nest: "nest-x",
		"nest-up": "nest-x",
		"nest-3": "nest-x",
		"post-loft": "stand-x",
		"post-porch": "stand-x",
		"post-roof": "stand-x"
	};
	const DEF_HP = {
		fence: 28,
		"fence-2": 48,
		"fence-3": 72,
		stand: 36,
		"stand-up": 52,
		"stand-3": 70,
		blind: 40,
		"blind-up": 58,
		"blind-3": 76,
		firepot: 22,
		"firepot-up": 34,
		"firepot-3": 48,
		nest: 50,
		"nest-up": 68,
		"nest-3": 90,
		"post-loft": 44,
		"post-porch": 36,
		"post-roof": 40
	};
	const NEXT_TIER = {
		fence: "fence-2",
		"fence-2": "fence-3",
		stand: "stand-up",
		"stand-up": "stand-3",
		blind: "blind-up",
		"blind-up": "blind-3",
		firepot: "firepot-up",
		"firepot-up": "firepot-3",
		nest: "nest-up",
		"nest-up": "nest-3"
	};
	Object.assign(BROKEN, PIECE_BROKEN);
	Object.assign(DEF_HP, PIECE_HP);
	Object.assign(NEXT_TIER, PIECE_UP);
	DEFENSE.lookout = { range: 260, dmg: 4, every: .8 };
	const LURE = new Set(["scarecrow", "bait"]);
	const RAID_VAR = new Set(["scout", "brute", "torch", "jumper", "armor", "shield", "atv", "fur", "mask", "saw"]);
	/** A night raider. The Chopping's named bosses (quest enemies) use the same boss art but stay home. */
	const isRaider = (e) => !!e && RAID_VAR.has(e.variant) && !e.quest;
	let piles = [];
	let nextPile = 1;
	let lootId = -1;
	let clock = morningClock();
	let rotAcc = 0;
	let goneNpcs = /* @__PURE__ */ new Set();
	let mapId = 0;
	let worldSeed = 5402695;
	const MAINE_LAYOUT = 1; // v15.9.7 fixed central-Maine map
	let layoutMoved = false;
	let exitSides = [];
	let travelLock = 0;
	const regions = /* @__PURE__ */ new Map();
	let crows = [];
	let phase = "menu";
	let camX = 0;
	let camY = 0;
	let viewW = 1;
	let viewH = 1;
	let shake = 0;
	let hoverX = 0;
	let hoverY = 0;
	let zoom = .8; // v15.4: start a little wider so the 1.5x people and buildings aren't cramped on a phone
	let reach = 0;
	/** Hero attack strip timer (v19 4-frame swings). */
	let swingAnim = 0;
	let heroLog = null;
	/** When the hero went down (ms), for the fall animation. */
	let fellAt = 0;
	let deal = 0;
	let pointerDown = false;
	let downX = 0;
	let downY = 0;
	let lastPX = 0;
	let lastPY = 0;
	let moved = 0;
	let freeCam = false;
	let gesture = "idle";
	let holdWalk = false;
	let holdWX = 0;
	let holdWY = 0;
	let gestureAt = 0;
	let workAcc = 0;
	let snowAcc = 0;
	let saveAcc = 0;
	let syncAcc = 0;
	let lastSpeed = 0;
	let lastYaw = 0;
	let acc = 0;
	let renderNow = 0, lastCamT = 0, camPX = null, camPY = null, lookX = 0, lookY = 0;
	const lerpBodies = [];
	let last = performance.now();
	let running = true;
	const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	const particles = [];
	const floaters = [];
	const scars = [];
	const padPrev = [];
	const reduceMotion = reduce;
	function setLog(text) {
		lines.length = 0;
		lines.push({
			text,
			t: 4,
			id: ++logSeq
		});
		log = [text];
	}
	const allLog = [];
	let logSeq = 0;
	function pushLog(text) {
		allLog.push(text);
		if (allLog.length > 40) allLog.shift();
		lines.push({
			text,
			t: 4
		});
		if (lines.length > 4) lines.splice(0, lines.length - 4);
		log = lines.map((line) => line.text);
		sync(true);
	}
	function tickLog(dt) {
		if (!lines.length) return;
		let dropped = false;
		for (let i = lines.length - 1; i >= 0; i--) {
			const line = lines[i];
			line.t -= dt;
			if (line.t <= 0) {
				lines.splice(i, 1);
				dropped = true;
			}
		}
		if (!dropped) return;
		log = lines.map((line) => line.text);
		sync(true);
	}
	function talkState() {
		return { snow, wood: player?.wood ?? 0, jackTrust, bunkerSeen, jackMet, warden: wardenState, scrap: player?.scrap ?? 0 };
	}
	function hudQuestText() {
		const dh = dropHud();
		if (dh) return dh;
		if (mapId === 0 && v14.st < 3 && !mode11) { const c = v14.camp ?? { tx: 0, ty: 0 }; const dir = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"][((Math.round(Math.atan2(FARM.ty - c.ty, FARM.tx - c.tx) / (Math.PI / 4)) % 8) + 8) % 8]; return `Cold road: ${STAGE_TEXT[v14.st].replace("east", dir)}`; }
		if (snow < 3 && quest <= 0) {
			if (snow <= 0) return "First Snow: talk to Sarah at the farm in Harmony village.";
			if (snow === 1) return `First Snow: bring Sarah ${SNOW_WOOD} wood. ${Math.min(player?.wood ?? 0, SNOW_WOOD)} of ${SNOW_WOOD}. She's at the farm in Harmony village.`;
			return "First Snow: go see Sarah at the farm in Harmony village.";
		}
		const m11h = q11HudText();
		if (m11h) return m11h;
		const side = snow >= 3 ? q10Hud(q10) || q11Hud(q11) : "";
		return side || questText(quest, questKills);
	}
	function musicTick() {
		setMusic(phase === "menu" ? "menu" : nightDark(clock) > .3 ? "night" : "day");
	}
	function sync(force = false) {
		if (!force) return;
		const _tS = performance.now();
		try { sync0(); } finally { pAdd("u:sync(HUD)", _tS); }
	}
	// v15.9.4: the HUD sync (~7 Hz) re-read and parsed every save slot from localStorage; keep it for 2 s unless a save just happened
	let slotCache = null, slotCacheT = -1e9;
	function slotsCached() {
		const now = performance.now();
		if (!slotCache || now - slotCacheT > 2000 || phase === "menu" || phase === "pause") { slotCache = { hasSave: hasSave(), slot: getSlot(), slots: slotInfos() }; slotCacheT = now; }
		return slotCache;
	}
	function sync0() {
		// v14.1: Stats never sits over Build (level-ups while building wait for you to close it)
		if (buildOpen && statsOpen) { statsOpen = false; statsWait = true; }
		if (!buildOpen && statsWait) { statsWait = false; statsOpen = true; }
		musicTick();
		const p = player;
		useHud.setState({
			phase,
			ready: useHud.getState().ready,
			...slotsCached(),
			auto: autoInfo(),
			name: p?.name ?? "Packer",
			hp: p?.hp ?? 44,
			maxHp: p?.maxHp ?? 44,
			level: p?.level ?? 1,
			xp: p?.xp ?? 0,
			xpNext: xpNeed(p?.level ?? 1),
			scrap: p?.scrap ?? 0,
			wood: p?.wood ?? 0,
			stone: p?.stone ?? 0,
			shells: p ? shellCount(p) : 0,
			quest,
			questKills,
			questText: giverText(hudQuestText()),
			v113: v3Hud(),
			logIds: lines.map((l) => l.id),
			v141: hud141(),
			v13: player ? v13Hud() : null,
			v14: hud14(),
			wmap: wmHud(),
			safe15: !!(p && phase === "play" && safeAt(p.x, p.y)),
			tb15: tbHud(),
			town: town ? { id: town.id, src: town.src, n: town.n } : null,
			journal: (() => { const all = [...journalEntries(quest, questKills, talkState()), ...q10Journal(q10, snow >= 3), ...q11Journal(q11, Q11C()), ...q11JournalExtra()]; const js = asSarah() ? all.map((e) => Object.fromEntries(Object.entries(e).map(([k, v]) => [k, giverText(v)]))) : all; return [...js.filter((e) => !e.done), ...js.filter((e) => e.done)]; })(),
			log: asSarah() ? log.map(giverText) : log,
			buildOpen,
			recipe,
			canPlace: canPlaceAt(hoverTile()),
			dialogue: dialogue && asSarah() ? { ...dialogue, speaker: giverText(dialogue.speaker), text: giverText(dialogue.text), choices: dialogue.choices?.map((c) => ({ ...c, label: giverText(c.label) })) } : dialogue,
			hero: w13?.hero ?? "justin",
			loot: lootView(),
			blade: p?.blade ?? false,
			roleTitle: p ? `${roleKit(p.role).title}${traitOf(p.trait) ? ` · ${traitOf(p.trait).title}` : ""}` : "Camp hand",
			atk: p?.atk ?? 0,
			def: p?.def ?? 0,
			packOpen,
			pack: p ? packView(p) : [],
			inv: p && packOpen ? invView(p) : null,
			weaponName: p ? GEAR[p.weaponId]?.name ?? "Empty hands" : "",
			coatName: p ? GEAR[p.coatId]?.name ?? "Bare chest" : "",
			headName: p ? GEAR[p.headId]?.name ?? "Bare head" : "",
			legsName: p ? GEAR[p.legsId]?.name ?? "Bare legs" : "",
			handsName: p ? GEAR[p.handsId]?.name ?? "Bare hands" : "",
			wornHead: p?.headId ?? "",
			wornChest: p?.coatId ?? "",
			wornLegs: p?.legsId ?? "",
			wornHands: p?.handsId ?? "",
			wornWeapon: p?.weaponId ?? "",
			gun: p ? isGun(GEAR[p.weaponId]?.family) : false,
			riding: mounted,
			canMount: !!nearBike() && phase === "play",
			aim,
			turnBased,
			gfxHigh,
			perfMode,
			showFps,
			fpsCap,
			ap,
			maxAp: apMax,
			statsOpen,
			points: p?.points ?? 0,
			strength: p?.strength ?? 1,
			vigor: p?.vigor ?? 1,
			endurance: p?.endurance ?? 1,
			intellect: p?.intellect ?? 1,
			perception: p?.perception ?? 1,
			luck: p?.luck ?? 1,
			stamina: p?.stamina ?? 0,
			maxStamina: p?.maxStamina ?? 1,
			inside: !!inside,
			clock: clockLabel(clock),
			region: world?.name ?? "Moose River",
			skillPoints: p?.skillPoints ?? 0,
			skills: p ? skillView(p) : [],
			perkReady: p ? (p.perks?.length ?? 0) < perkSlots(p.level) : false,
			perkChoices: p ? perkView(p) : [],
			perkNames: p ? (p.perks ?? []).map((id) => PERKS.find((perk) => perk.id === id)?.name ?? id).join(", ") : "",
			karmaWord: karmaWord(p?.karma ?? 0),
			repLine: p ? repLine(p) : "",
			canRetag: p ? investedTotal(p) === 0 : false,
			party: party ? { name: party.name, hp: party.hp, maxHp: party.maxHp } : null
		});
	}
	function held(code) {
		return keys.has(code) || injected.has(code);
	}
	function freshPlayer(name, x, y) {
		return {
			name,
			x,
			y,
			hp: 44,
			maxHp: 44,
			atk: 4,
			def: 0,
			xp: 0,
			level: 1,
			scrap: 0,
			wood: 0,
			stone: 0,
			blade: false,
			role: "fighter",
			trait: "",
			baseAtk: 3,
			bag: [],
			weaponId: "hatchet",
			coatId: "wool",
			headId: "",
			legsId: "",
			handsId: "",
			feetId: "",
			offId: "",
			backId: "",
			gridPos: {},
			look: "wool",
			hair: "black",
			strength: 1,
			vigor: 1,
			endurance: 1,
			intellect: 1,
			perception: 1,
			luck: 1,
			points: 0,
			stamina: 80,
			maxStamina: 80,
			dir: 0,
			frame: 0,
			anim: 0,
			cooldown: 0,
			hurt: 0,
			invuln: 0,
			respawnX: x,
			respawnY: y
		};
	}
	function giveRole(p, role) {
		const kit = roleKit(role);
		p.role = kit.id;
		p.baseAtk = kit.atk;
		p.maxHp = kit.hp;
		p.hp = kit.hp;
		p.bag = kit.bag.map((s) => ({
			id: s.id,
			qty: s.qty
		}));
		p.weaponId = kit.weapon;
		p.coatId = "";
		p.headId = "";
		p.legsId = "";
		p.handsId = "";
		p.feetId = "";
		p.offId = "";
		p.backId = "";
		p.gridPos = {};
		for (const stack of p.bag) {
			const piece = GEAR[stack.id];
			const slot = armorSlot(piece);
			if (slot === "feet") p.feetId = stack.id;
			else if (slot === "back") p.backId = stack.id;
			else if (slot === "head") p.headId = stack.id;
			else if (slot === "chest") p.coatId = stack.id;
			else if (slot === "legs") p.legsId = stack.id;
			else if (slot === "hands") p.handsId = stack.id;
		}
		const stats = roleStats(kit.id);
		p.strength = stats.strength;
		p.vigor = stats.vigor;
		p.endurance = stats.endurance;
		p.intellect = stats.intellect;
		p.perception = stats.perception;
		p.luck = stats.luck;
		p.points = 0;
		refreshGear(p);
		p.stamina = p.maxStamina;
		p.hp = p.maxHp;
	}
	/** v13.1: rewards never vanish. If the pack is full, the item goes on the ground at your feet
	 *  (or into the farm stash pile when you're home) with a message. Use tryGive() when a full pack
	 *  should refuse instead (buying, crafting, picking up). */
	function giveItem(id, qty = 1) {
		if (tryGive(id, qty)) return true;
		if (!player || !GEAR[id] || qty < 1) return false;
		const home = mapId === 0 && !mode11 && inFarm(tileOf(player.x, player.y).tx, tileOf(player.x, player.y).ty);
		const title = home ? "Farm stash" : "Dropped";
		let pile = piles.find((q) => q.title === title && Math.hypot(q.x - player.x, q.y - player.y) < (home ? 600 : 48));
		if (!pile) leavePile(player.x + 14, player.y + 10, title, [{ id, qty }], 0, "", 0);
		else { const st = pile.items.find((q) => q.id === id); if (st) st.qty += qty; else pile.items.push({ id, qty }); }
		const nm = qty > 1 ? `${GEAR[id].name} ×${qty}` : GEAR[id].name;
		pushLog(home ? `Pack's full. ${nm} goes in the farm stash by your feet.` : `Pack's full. You set ${nm} on the ground. Pick it up when you've room.`);
		floater(player.x, player.y - 8, "Pack full: on the ground");
		return true;
	}
	function tryGive(id, qty = 1) {
		if (!player || !GEAR[id] || qty < 1) return false;
		const stack = player.bag.find((s) => s.id === id);
		if (stack && (stack.qty - wornCount(player, id) > 0 || canFit(player, id))) {
			stack.qty += qty;
			return true;
		}
		if (stack) {
			floater(player.x, player.y - 8, "Pack full");
			return false;
		}
		if (!canFit(player, id)) {
			floater(player.x, player.y - 8, "Pack full");
			return false;
		}
		player.bag.push({
			id,
			qty
		});
		return true;
	}
	function refreshGear(p) {
		const w = GEAR[p.weaponId];
		const worn = [
			p.coatId,
			p.headId,
			p.legsId,
			p.handsId,
			p.feetId,
			p.backId
		];
		const kit = roleKit(p.role);
		// an off-hand knife or revolver adds a third of its bite
		const off = GEAR[p.offId];
		p.atk = p.baseAtk + Math.max(0, p.level - 1) + (w?.atk ?? 0) + Math.floor((off?.atk ?? 0) / 3) + Math.max(0, p.strength - 1);
		// a moose-hide sling steadies a long gun
		if (p.backId === "sling" && (w?.family === "carbine" || w?.family === "scatter")) p.atk += 1;
		p.def = worn.reduce((n, id) => n + (GEAR[id]?.def ?? 0), 0);
		if (p === player) p.def = def13(p.def);
		if (p === player && buffOn("strong")) p.atk += 2;
		if (p.perks?.includes("wool")) p.def += 2;
		apMax = p.perks?.includes("quick") ? 10 : 8;
		const extra = p.trait === "hide" ? 14 : p.trait === "step" ? -8 : 0;
		const nextHp = Math.max(24, kit.hp + Math.max(0, p.level - 1) * 6 + Math.max(0, p.vigor - 1) * 8 + extra) + (p === player ? fx13().hpBonus : 0);
		if (nextHp > p.maxHp) p.hp += nextHp - p.maxHp;
		p.maxHp = nextHp;
		p.hp = Math.min(p.hp, p.maxHp);
		p.maxStamina = 70 + p.endurance * 16 + (p === player ? fx13().staminaBonus : 0);
		p.stamina = Math.min(p.maxStamina, p.stamina || p.maxStamina);
	}
	/** Icon file for an item: public/game/items/<id>.png, else the generic one for its shape. */
	function itemIcon(g) {
		return `/game/items/${(OPTIONAL_ART.has(`items/${g.id}`) ? null : ITEM_ICON[g.id]) ?? g.id}.png?v=${ART_V}`;
	}
	function invItem(p, id, x = -1, y = -1) {
		const g = GEAR[id];
		if (!g) return null;
		const stack = p.bag.find((s) => s.id === id);
		const size = itemSize(id);
		const fits = EQUIP_SLOTS.filter((slot) => slotAccepts(slot, id));
		return {
			id,
			name: g.name,
			qty: stack ? Math.max(1, stack.qty - (x >= 0 ? wornCount(p, id) : stack.qty - 1)) : 1,
			quality: g.quality,
			note: g.note,
			kind: g.kind,
			family: g.family,
			atk: g.atk,
			def: g.def,
			heal: g.heal,
			worth: g.worth ?? 0,
			w: size.w,
			h: size.h,
			x,
			y,
			fits,
			icon: itemIcon(g)
		};
	}
	let figureKey = "";
	let figureUrl = "";
	const dollPick = new Map();
	/** Which cell of a hero sheet the pack-screen doll uses: the first front-facing walk frame whose two
	 * feet stand apart (frame 0 of the front row is the passing pose, where the legs overlap into one).
	 * Tries the front row (frames 2, 1, 3), then the slightly turned down-right / down-left rows, then frame 0. */
	function dollCell(name, img) {
		const hit = dollPick.get(name);
		if (hit) return hit;
		const cols = sheetCols(img);
		const cw = img.width / cols, ch = img.height / 8;
		let pick = { row: 0, col: 0 };
		try {
			const cv = document.createElement("canvas");
			cv.width = cw;
			cv.height = ch;
			const g = cv.getContext("2d", { willReadFrequently: true });
			const apart = (row, col) => {
				g.clearRect(0, 0, cw, ch);
				g.drawImage(img, col * cw, row * ch, cw, ch, 0, 0, cw, ch);
				const a = g.getImageData(0, 0, cw, ch).data;
				let top = -1, bot = -1;
				for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (a[(y * cw + x) * 4 + 3] > 24) { if (top < 0) top = y; bot = y; break; }
				if (top < 0) return false;
				// the lowest fifth of the figure (shins and boots): two separate runs on most lines
				let lines = 0, two = 0;
				for (let y = Math.floor(top + (bot - top) * .8); y <= bot - 1; y++) {
					let runs = 0, inRun = false;
					for (let x = 0; x < cw; x++) {
						const on = a[(y * cw + x) * 4 + 3] > 24;
						if (on && !inRun) runs++;
						inRun = on;
					}
					lines++;
					if (runs >= 2) two++;
				}
				return lines > 0 && two / lines > .7;
			};
			const order = [[0, 2], [0, 1], [0, 3], [7, 2], [1, 2], [7, 1], [1, 1]];
			const found = order.find(([r, c]) => apart(r, c));
			if (found) pick = { row: found[0], col: found[1] };
		} catch {
			pick = { row: 0, col: 2 };
		}
		dollPick.set(name, pick);
		return pick;
	}
	/** The hero's own front walk frame, dyed like the in-world sprite, scaled up for the pack screen,
	 * with worn armor overlays from their walk sheets drawn on the same cell (so they line up). */
	function heroFigure() {
		if (!player) return "";
		const family = GEAR[player.weaponId]?.family;
		const plName = plImg("idle") || plImg("walk");
		const name = plName || (family === "axe" || family === "pry" ? "hero-axe" : family === "pickaxe" ? "hero-pick" : family === "carbine" || family === "revolver" || family === "scatter" ? "hero-gun" : family === "knife" ? "hero-knife" : "hero");
		const worn = plName ? [] : EQUIP_SLOTS.map((slot) => player[SLOT_FIELD[slot]]).filter((id) => id && images.get(`overlay-${id}`));
		const armorLayers = plName ? armorLayerNames(plName.slice(3)) : [];
		const key = `${name}:${player.hair}:${armorLayers.join(",")}:${JSON.stringify(w13.dye)}:${player.look}:${player.coatId}:${player.headId}:${player.legsId}:${player.handsId}:${player.feetId}:${player.backId}:${worn.join(",")}`;
		if (key === figureKey && figureUrl) return figureUrl;
		const img = images.get(name);
		if (!img || !img.width) return "";
		const src = heroSource(name, img);
		const cols = sheetCols(img);
		const cw = img.width / cols, ch = img.height / 8;
		const { row, col } = dollCell(name, img);
		const cv = document.createElement("canvas");
		// 4x crisp pixels; the pack screen then scales it down smoothly, so the figure reads clean at any
		// slot size instead of the uneven nearest-neighbour blocks a fractional 1.6x stretch gave
		cv.width = cw * 4;
		cv.height = ch * 4;
		const g = cv.getContext("2d");
		if (!g) return "";
		g.imageSmoothingEnabled = false;
		g.drawImage(src, col * cw, row * ch, cw, ch, 0, 0, cw * 4, ch * 4);
		for (const ln of armorLayers) {
			const ai = images.get(ln);
			if (ai && ai.width === img.width && ai.height === img.height) g.drawImage(armorSource(ln, ai), col * cw, row * ch, cw, ch, 0, 0, cw * 4, ch * 4);
		}
		for (const id of worn) {
			const ov = images.get(`overlay-${id}`);
			if (ov && ov.width === img.width && ov.height === img.height) g.drawImage(ov, col * cw, row * ch, cw, ch, 0, 0, cw * 4, ch * 4);
		}
		figureKey = key;
		figureUrl = cv.toDataURL("image/png");
		return figureUrl;
	}
	function invView(p) {
		const lay = layoutGrid(p);
		const slots = {};
		const overlays = [];
		for (const slot of EQUIP_SLOTS) {
			const id = p[SLOT_FIELD[slot]];
			slots[slot] = id ? invItem(p, id) : null;
			// the -portrait file only when the item has no walk-sheet overlay (that one is drawn into the figure)
			if (id && !images.get(`overlay-${id}`) && overlayState.get(`${id}-portrait`) === "ok") overlays.push(`/game/overlay/${id}-portrait.png?v=${ART_V}`);
			if (id) wantOverlay(id);
		}
		return {
			cols: GRID_COLS,
			rows: lay.rows,
			over: lay.over,
			items: lay.items.map((it) => invItem(p, it.id, it.x, it.y)).filter(Boolean),
			slots,
			figure: heroFigure(),
			overlays,
			atk: p.atk,
			def: p.def
		};
	}
	/** Armor overlay art, dropped in later by file name: public/game/overlay/<item id>.png (a sheet
	 * laid out exactly like hero.png: 4 walk frames x 8 facings) is drawn over the in-world hero, and
	 * <item id>-portrait.png over the pack-screen figure. Missing files are simply skipped. */
	const overlayState = new Map();
	let overlayList = null;
	fetch(`/game/overlay/index.json?v=${ART_V}`).then((r) => r.ok ? r.json() : []).then((list) => {
		overlayList = new Set(Array.isArray(list) ? list : []);
	}).catch(() => {
		overlayList = new Set();
	});
	function wantOverlay(id) {
		if (!overlayList) return;
		for (const name of [id, `${id}-portrait`]) {
			if (overlayState.has(name)) continue;
			if (!overlayList.has(name)) {
				overlayState.set(name, "none");
				continue;
			}
			overlayState.set(name, "loading");
			const img = new Image();
			img.onload = () => {
				overlayState.set(name, "ok");
				if (!name.endsWith("-portrait")) {
					const soft = img;
					const hero = images.get("hero");
					soft.foot = hero?.foot;
					soft.feet = hero?.feet;
					images.set(`overlay-${id}`, soft);
				}
				sync(true);
			};
			img.onerror = () => overlayState.set(name, "none");
			img.src = `/game/overlay/${name}.png?v=${ART_V}`;
		}
	}
	let overlayBase = "hero";
	function paintOverlays(frame, dir, lunge) {
		if (!player) return;
		overlayBase = heroKey();
		for (const slot of EQUIP_SLOTS) {
			const id = player[SLOT_FIELD[slot]];
			if (!id) continue;
			wantOverlay(id);
			if (images.get(`overlay-${id}`)) blit(`overlay-${id}`, player.x, player.y, HERO_H, true, frame, dir, camX, camY, lunge);
		}
	}
	function packView(p) {
		return p.bag.filter((s) => s.qty > 0 && GEAR[s.id]).map((s) => {
			const g = GEAR[s.id];
			return {
				id: g.id,
				name: g.name,
				qty: s.qty,
				kind: g.kind,
				note: g.note,
				quality: g.quality,
				heal: g.heal,
				equipped: wornCount(p, g.id) > 0,
				slot: g.kind === "weapon" ? "weapon" : armorSlot(g) ?? ""
			};
		});
	}
	function freshSeed() {
		let seed = Date.now() ^ (Math.random() * 2147483647 | 0) | 0;
		if (seed === 5402695) seed = 5402696;
		return seed;
	}
	function bootNew(name, role, bonus, trait, look, appearance) {
		worldSeed = 5402695; // v15.9.7: one fixed, hand-made map (central Maine); no random worlds
		exitSides = MAINE_SIDES.slice();
		mapId = 0;
		regions.clear();
		travelLock = 0;
		world = createWorld(worldSeed, 0, exitSides);
		player = freshPlayer(cleanName(name), world.startX, world.startY);
		giveRole(player, role);
		player.strength += bonus.strength;
		player.vigor += bonus.vigor;
		player.endurance += bonus.endurance;
		player.intellect += bonus.intellect;
		player.perception += bonus.perception;
		player.luck += bonus.luck;
		player.trait = trait;
		player.look = look;
		player.hair = appearance?.hair || "black";
		pendingBackstory = appearance?.backstory || "";
		pendingHero = appearance?.hero === "sarah" ? "sarah" : "justin";
		pendingHard = !!appearance?.hard;
		if (appearance) {
			wearPiece(appearance.coat, "coatId");
			wearPiece(appearance.hat, "headId");
			if (!appearance.trousers) player.legsId = "";
			else if (!player.legsId) wearPiece("trousers", "legsId");
			if (!appearance.boots) player.feetId = "";
			else if (!player.feetId) wearPiece("boots", "feetId");
		}
		ensureProgress(player);
		player.tags = tagsForRole(role);
		player.invested = {};
		player.skillPoints = 0;
		player.perks = [];
		player.karma = 0;
		player.rep = Object.fromEntries(STATS_RULES.rep.keys.map((k) => [k, 0])); // v15.9: + harmony, pittsfield, skowhegan
		party = null;
		partyReturn = null;
		refreshGear(player);
		player.hp = player.maxHp;
		player.stamina = player.maxStamina;
		explored = /* @__PURE__ */ new Uint8Array(24336);
		quest = 0;
		questKills = 0;
		snow = 0;
		jackTrust = 0;
		wardenState = 0;
		millSeen = false;
		jackMet = false;
		bunkerSeen = false;
		kitchenDay = -1;
		q10 = freshQ10();
		q11 = freshQ11();
		v3 = freshV3();
		w13 = freshW13();
		w13.hero = pendingHero;
		v14 = freshV14();
		if (typeof window !== "undefined" && window.__v14Skip) v14.st = 5;
		l1 = freshV141(); storeKey = "";
		// v14.1: a small starting pack that grows with crafted bags (older suites keep the old pack)
		if (!(typeof window !== "undefined" && window.__v14Skip)) { player.small = true; player.bagLv = 0; }
		craftOpen = false;
		if (pendingBackstory) { applyBackstory(pendingBackstory); pendingBackstory = ""; }
		if (pendingHard) { w13.hard = true; pendingHard = false; }
		q10World();
		openedDoors.clear();
		lootedChests.clear();
		questTotal = world.enemies.filter((e) => e.quest).length;
		buildOpen = false;
		recipe = 0;
		intent = null;
		aim = "chest";
		turnBased = false;
		ap = 8;
		apMax = 8;
		apWalk = 0;
		drawn = 0;
		mounted = false;
		mountId = -1;
		opening = null;
		if (v14.st === 0) v14Start();
		if (v14.st === 0) setLog("You come to in the cab of a wrecked pickup on the Harmony road. Cold. Your head hurts. The fire ring by the ditch is dead.");
		else setLog("You come to on the road outside Harmony village.");
		const tagged = SKILLS.filter((s) => player.tags.includes(s.id)).map((s) => s.name).join(", ");
		pushLog(`Tagged skills: ${tagged}. They rise twice as fast.`);
		pushLog(v14.st === 0 ? "Search the truck. First snow is coming." : "First snow is coming. Sarah and the farm are in Harmony village.");
		dialogue = null;
		piles = [];
		nextPile = 1;
		lootId = -1;
		clock = morningClock();
		rotAcc = 0;
		goneNpcs = /* @__PURE__ */ new Set();
		spawnCrows();
		phase = "play";
		workAcc = 0;
		particles.length = 0;
		floaters.length = 0;
		setScars([]);
		work = null;
		removedIds.clear();
		const t = tileOf(player.x, player.y);
		reveal(t.tx, t.ty, 11, true);
		camX = player.x - player.y - viewW / 2;
		camY = (player.x + player.y) * CAM_ISO_Y - viewH / 2;
		sync(true);
		saveGame();
	}
	function bootSave(data) {
		worldSeed = data.seed ?? 5402695;
		mapId = data.map ?? 0;
		exitSides = data.exits && data.exits.length >= 2 ? data.exits : pickSides(worldSeed);
		// v15.9.7: saves from the random-world days load into the fixed map. Prop / enemy ids from the old layout
		// don't line up any more, so their removed / slain lists are dropped (built props, piles and fog stay).
		if (data.layout !== MAINE_LAYOUT) {
			worldSeed = 5402695; exitSides = MAINE_SIDES.slice();
			data.removed = []; data.slain = [];
			for (const r of data.regions ?? []) { r.removed = []; r.slain = []; }
			layoutMoved = true;
		}
		regions.clear();
		for (const region of data.regions ?? []) if (region.id !== mapId) regions.set(region.id, region);
		const legacy = data.seed == null;
		if (legacy) {
			data.x += 1408;
			data.y += 1280;
			data.respawnX += 1408;
			data.respawnY += 1280;
			data.placed = data.placed.map((p) => ({
				kind: p.kind,
				tx: p.tx + 22,
				ty: p.ty + 20
			}));
		}
		travelLock = 1.2;
		world = createWorld(worldSeed, mapId, exitSides);
		removedIds.clear();
		for (const id of data.removed) removedIds.add(id);
		const removed = new Set(data.removed);
		world.props = world.props.filter((p) => {
			if (!removed.has(p.id)) return true;
			vacate(world, p);
			return false;
		});
		const slain = new Set(data.slain);
		for (const e of world.enemies) if (slain.has(e.id)) e.dead = true;
		for (const placed of data.placed) {
			const prop = tryPlace(world, placed.kind, placed.tx, placed.ty);
			if (prop) prop.built = true;
		}
		player = freshPlayer(data.name || "Packer", data.x, data.y);
		player.hp = data.hp;
		player.maxHp = data.maxHp;
		player.atk = data.atk;
		player.def = data.def;
		player.xp = data.xp;
		player.level = data.level;
		player.scrap = data.scrap;
		player.wood = data.wood;
		player.stone = data.stone;
		player.blade = data.blade;
		player.respawnX = data.respawnX;
		player.respawnY = data.respawnY;
		player.dir = data.dir || 0;
		// v15.9: one class list everywhere; old saves move to the current ids (Woodsman -> Camp hand, Scrounger -> Prowler, Fixer -> Medic)
		if (data.role) data.role = classId(data.role) ?? "fighter";
		if (data.role && data.bag && data.weaponId !== void 0 && data.coatId !== void 0) { // v15.9: an empty coat slot ("") is a real save, not a legacy one
			player.role = data.role;
			player.baseAtk = data.baseAtk ?? roleKit(data.role).atk;
			player.bag = data.bag.map((s) => ({
				id: s.id,
				qty: s.qty
			}));
			player.weaponId = data.weaponId;
			player.coatId = data.coatId;
			player.headId = data.headId ?? "";
			player.legsId = data.legsId ?? "";
			player.handsId = data.handsId ?? "";
			// v0.6 pack screen: old saves have no feet/off-hand/back or grid spots; the grid packs itself
			player.feetId = data.feetId ?? "";
			player.offId = data.offId ?? "";
			player.backId = data.backId ?? "";
			player.gridPos = data.gridPos ?? {};
			for (const s of EQUIP_SLOTS) if (player[SLOT_FIELD[s]] && !player.bag.some((b) => b.id === player[SLOT_FIELD[s]] && b.qty > 0)) player[SLOT_FIELD[s]] = "";
			const stats = roleStats(data.role);
			player.strength = data.strength ?? stats.strength;
			player.vigor = data.vigor ?? stats.vigor;
			player.endurance = data.endurance ?? stats.endurance;
			player.intellect = data.intellect ?? stats.intellect;
			player.perception = data.perception ?? stats.perception;
			player.luck = data.luck ?? stats.luck;
			player.points = data.points ?? 0;
			player.trait = traitOf(data.trait)?.id ?? "";
			refreshGear(player);
		} else {
			giveRole(player, "fighter");
			if (data.atk > player.atk) player.atk = data.atk;
			player.hp = data.hp;
			player.maxHp = data.maxHp;
		}
		player.look = data.look ?? defaultLook(player.role);
		player.hair = data.hair || "black";
		ensureProgress(player);
		if (Array.isArray(data.tags) && data.tags.length === 3) player.tags = data.tags;
		else if ((player.level ?? 1) > 1) {
			let back = 0;
			for (let lv = 1; lv < player.level; lv++) back += skillPointsOnLevel(player.intellect);
			player.skillPoints = back;
		}
		if (data.invested) player.invested = data.invested;
		if (data.skillPoints != null) player.skillPoints = data.skillPoints;
		player.perks = Array.isArray(data.perks) ? data.perks : [];
		player.karma = data.karma ?? 0;
		player.rep = {
			lowelltown: 0,
			attean: 0,
			holeb: 0,
			ponds: 0,
			...data.rep ?? {}
		};
		party = data.party ? {
			...data.party,
			frame: 0,
			anim: 0,
			cooldown: .4
		} : null;
		partyReturn = data.partyReturn ?? null;
		refreshGear(player);
		aim = data.aim ?? "chest";
		turnBased = !!data.turnBased;
		ap = 8;
		apMax = 8;
		apWalk = 0;
		drawn = 0;
		mounted = false;
		mountId = -1;
		opening = null;
		const bytes = legacy ? /* @__PURE__ */ new Uint8Array(24336) : b64ToBytes(data.explored, 24336);
		explored = new Uint8Array(bytes);
		openedDoors.clear();
		lootedChests.clear();
		for (const id of data.opened ?? []) openedDoors.add(id);
		for (const id of data.looted ?? []) lootedChests.add(id);
		inside = null;
		quest = data.quest;
		questKills = data.questKills;
		snow = data.snow ?? (data.quest > 0 ? 3 : 0);
		jackTrust = data.jackTrust ?? 0;
		jackMet = !!data.jackMet;
		bunkerSeen = !!data.bunkerSeen;
		kitchenDay = data.kitchenDay ?? -1;
		q10 = loadQ10(data.q10);
		q11 = loadQ11(data.q11);
		v3 = loadV3(data.v113);
		w13 = loadW13(data.v13);
		v14 = loadV14(data.v14);
		l1 = loadV141(data.v141); storeKey = "";
		craftOpen = false;
		if (world.questBandits > 0) {
			questTotal = world.questBandits;
			const dead = world.enemies.filter((e) => e.quest && e.dead).length;
			if (dead > questKills) questKills = dead;
			if (quest === 1 && questKills >= questTotal) quest = 2;
		} else questTotal = data.questTotal ?? 6;
		if (!(player.hp > 0)) {
			const homes = world.props.filter((p) => p.built && (p.kind === "shelter" || p.kind === "shack"));
			const home = homes[homes.length - 1];
			if (home) {
				const spec = PROP_SPEC[home.kind];
				const spot = nearestRespawn(home.tx, home.ty, spec.w, spec.h);
				player.respawnX = spot.x;
				player.respawnY = spot.y;
			}
			player.hp = Math.max(1, player.maxHp);
			player.x = player.respawnX;
			player.y = player.respawnY;
			player.stamina = player.maxStamina || 80;
			player.invuln = 1.6;
			setLog(home ? "You wake at the lean-to, sore but breathing." : "You wake on the cot at Cambridge Road. The stove is still warm.");
		} else setLog("The gravel still knows your boots.");
		buildOpen = false;
		intent = null;
		dialogue = null;
		spawnCrows();
		clock = data.clock ?? morningClock();
		// v15.9.5: raids are gone; old saves may still carry raidNight / raidsHeld / raidOn, which are ignored
		wardenState = data.warden ?? 0;
		tractorReady = !!data.tractorReady;
		rotAcc = 0;
		goneNpcs = new Set(data.goneNpcs ?? []);
		if (world) world.npcs = world.npcs.filter((npc) => !goneNpcs.has(npc.id));
		restoreWarden();
		landReturn();
		if (party) snapParty();
		restorePiles(data.piles);
		setScars(data.scars);
		q10World();
		phase = "play";
		camX = player.x - player.y - viewW / 2;
		camY = (player.x + player.y) * CAM_ISO_Y - viewH / 2;
		sync(true);
		saveGame();
	}
	function campSpot() {
		if (!world || !player) return {
			x: 0,
			y: 0
		};
		const homes = world.props.filter((p) => p.built && (p.kind === "shelter" || p.kind === "shack"));
		const home = homes[homes.length - 1];
		if (!home) return {
			x: player.respawnX,
			y: player.respawnY
		};
		const spec = PROP_SPEC[home.kind];
		return nearestRespawn(home.tx, home.ty, spec.w, spec.h);
	}
	/** v15.1: town doors write the autosave too (after saveGame put the same state in the slot). */
	function autosave15(where) {
		if (!world || !player || mode11) return;
		const d = readSave();
		if (!d) return;
		writeAutosave(d, where);
		pushLog("Autosaved.");
	}
	function saveGame() {
		if (!world || !player || mode11) return;
		const data = playerToSave(player, quest, questKills, collectRemoved(world), world.enemies.filter((e) => e.dead).map((e) => e.id), world.props.filter((p) => p.built).map((p) => ({
			kind: p.kind,
			tx: p.tx,
			ty: p.ty
		})), explored);
		data.opened = [...openedDoors];
		data.feetId = player.feetId ?? "";
		data.offId = player.offId ?? "";
		data.backId = player.backId ?? "";
		data.gridPos = player.gridPos ?? {};
		data.looted = [...lootedChests];
		data.aim = aim;
		data.turnBased = turnBased;
		data.clock = clock;
		data.warden = wardenState;
		data.tractorReady = tractorReady;
		data.goneNpcs = [...goneNpcs];
		data.seed = worldSeed;
		data.layout = MAINE_LAYOUT;
		data.map = mapId;
		data.exits = exitSides;
		data.questTotal = questTotal;
		data.snow = snow;
		data.jackTrust = jackTrust;
		data.jackMet = jackMet;
		data.bunkerSeen = bunkerSeen;
		data.kitchenDay = kitchenDay;
		data.q10 = q10;
		data.q11 = q11;
		if (world && mapId === 0) { v14.placed = world.props.filter((p) => p.p14).map((p) => ({ k: p.kind, tx: p.tx, ty: p.ty, hp: Math.round(p.hp ?? 0), f: !!p.flip14 })); for (const p of world.props) if (p.f14) note14(p); }
		data.v14 = v14;
		data.v141 = l1;
		data.v113 = v3;
		data.v13 = w13;
		data.regions = [...regions.values()];
		data.piles = piles.map((pile) => ({
			id: pile.id,
			x: pile.x,
			y: pile.y,
			title: pile.title,
			items: pile.items.map((stack) => ({
				id: stack.id,
				qty: stack.qty
			})),
			scrap: pile.scrap,
			body: pile.body,
			folk: pile.folk,
			dir: pile.dir,
			at: pile.at
		}));
		data.scars = scarSnapshot();
		ensureProgress(player);
		data.tags = player.tags;
		data.invested = player.invested;
		data.skillPoints = player.skillPoints;
		data.perks = player.perks;
		data.karma = player.karma;
		data.rep = player.rep;
		data.party = party ? {
			role: party.role,
			name: party.name,
			hp: party.hp,
			maxHp: party.maxHp,
			homeMap: party.homeMap,
			homeId: party.homeId,
			homeX: party.homeX,
			homeY: party.homeY,
			x: party.x,
			y: party.y,
			dir: party.dir || 0
		} : null;
		data.partyReturn = partyReturn;
		if (inside) {
			const out = clearOutside(inside.backX, inside.backY);
			data.x = out.x;
			data.y = out.y;
		}
		if (!(player.hp > 0)) {
			const spot = campSpot();
			data.hp = Math.max(1, player.maxHp);
			data.x = spot.x;
			data.y = spot.y;
			data.respawnX = spot.x;
			data.respawnY = spot.y;
		}
		writeSave(data);
		useHud.setState({ hasSave: true });
	}
	function statsOf(p) {
		return {
			strength: p.strength,
			vigor: p.vigor,
			endurance: p.endurance,
			intellect: p.intellect,
			perception: p.perception,
			luck: p.luck,
			trait: p.trait || "",
			agility: w13?.core?.agility ?? 1, grit: w13?.core?.grit ?? 1, tradeMech: 0
		};
	}
	function ensureProgress(p) {
		if (p.rep) for (const k of STATS_RULES.rep.keys) if (typeof p.rep[k] !== "number") p.rep[k] = 0;
		if (!p.tags || p.tags.length !== 3) p.tags = tagsForRole(p.role);
		if (!p.invested) p.invested = {};
		if (p.skillPoints == null) p.skillPoints = 0;
		if (!p.perks) p.perks = [];
		if (p.karma == null) p.karma = 0;
		if (!p.rep) p.rep = { lowelltown: 0, attean: 0, holeb: 0, ponds: 0 };
	}
	function skillOf(id) {
		if (!player) return 0;
		ensureProgress(player);
		return skillScore(id, statsOf(player), player.invested, player.tags, player.perks);
	}
	function hasPerk(id) {
		return !!player?.perks?.includes(id);
	}
	function investedTotal(p) {
		return Object.values(p.invested ?? {}).reduce((n, v) => n + (v || 0), 0);
	}
	function skillView(p) {
		ensureProgress(p);
		return SKILLS.map((skill) => ({
			id: skill.id,
			name: skill.name,
			score: skillScore(skill.id, statsOf(p), p.invested, p.tags, p.perks),
			tagged: p.tags.includes(skill.id)
		}));
	}
	function perkView(p) {
		ensureProgress(p);
		const score = (id) => skillScore(id, statsOf(p), p.invested, p.tags, p.perks);
		return PERKS.filter((perk) => !p.perks.includes(perk.id)).map((perk) => ({
			id: perk.id,
			name: perk.name,
			blurb: perk.blurb,
			ok: perkOk(perk, score)
		}));
	}
	function repLine(p) {
		ensureProgress(p);
		return (["lowelltown", "attean", "holeb", "ponds"]).map((id) => `${TOWN_NAME[id]} ${p.rep[id] > 0 ? "+" : ""}${p.rep[id] | 0}`).join(" · ");
	}
	function shiftRep(town, karma, rep) {
		if (!player) return;
		ensureProgress(player);
		player.karma = Math.max(-100, Math.min(100, (player.karma | 0) + karma));
		if (town) player.rep[town] = Math.max(-100, Math.min(100, (player.rep[town] | 0) + rep));
	}
	function grantXp(n) {
		if (!player) return;
		player.xp += n;
		let leveled = false;
		while (player.xp >= xpNeed(player.level)) {
			player.xp -= xpNeed(player.level);
			player.level += 1;
			player.points += 1;
			ensureProgress(player);
			player.skillPoints += skillPointsOnLevel(player.intellect);
			refreshGear(player);
			leveled = true;
		}
		if (leveled) {
			sfx("level");
			const perk = (player.perks?.length ?? 0) < perkSlots(player.level);
			pushLog(perk ? "Hard miles. A stat point, skill points, and a perk are waiting." : "Hard miles. A stat point and skill points are waiting.");
			floater(player.x, player.y - 20, "Tougher");
			statsOpen = true;
		}
	}
	/** Death closes every open panel so nothing sits over the "You fall" card. */
	function closePanels() {
		statsOpen = false;
		packOpen = false;
		buildOpen = false;
		dialogue = null;
	}
	/** Carried in the pack (not worn): binoculars, lantern, radio work from the bag. */
	function carrying(id) {
		return !!player?.bag.some((s) => s.id === id && s.qty > 0);
	}
	/** Perception with what you carry (binoculars +1). */
	function perc() {
		return (player?.perception ?? 1) + (carrying("binoculars") ? 1 : 0);
	}
	function sightRadius() {
		const trail = skillOf("trail");
		const home = mapId === 0 && player && inFarm(tileOf(player.x, player.y).tx, tileOf(player.x, player.y).ty);
		const up = 0; // v15.9.5: farm upgrades removed
		return Math.max(2, Math.round((5 + perc() + (trail >= 45 ? 1 : 0) + (carrying("binoculars") ? 2 : 0) + up) * (inside ? 1 : weather13().sight) * (injured("blind") ? INJ_FX.blindSight : 1)));
	}
	function noticeRange(base) {
		// v11.1: the motor bicycle is loud; raiders hear it coming from much farther off
		return base * (l1.crouch && !mounted ? CROUCH_SIGHT : 1) * (1 - Math.min(.4, skillOf("sneak") / 220)) * (mounted ? 1.7 : 1) * (1 - .03 * lv("stealth")) * (nightDark(clock) > .3 ? moon13().bold : 1) * (w13.weather.id === "fog" ? .7 : 1);
	}
	function reveal(tx, ty, r, remember) {
		const r2 = r * r;
		for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) {
			if (x < 0 || y < 0 || x >= 156 || y >= 156) continue;
			if ((x - tx) ** 2 + (y - ty) ** 2 > r2) continue;
			const i = y * 156 + x;
			visible[i] = 1;
			if (remember) explored[i] = 1;
		}
	}
	function vision() {
		if (!world || !player) return;
		if (typeof window !== "undefined" && window.__noFog) { visible.fill(1); explored.fill(1); return; } // v15.9: full-world render (tests/screenshots only)
		visible.fill(0);
		const p = tileOf(player.x, player.y);
		reveal(p.tx, p.ty, sightRadius(), true);
	}
	function hoverTile() {
		return tileOf(hoverX, hoverY);
	}
	function canPlaceAt(tile) {
		if (!world || !player || !buildOpen) return false;
		const spec = PROP_SPEC[RECIPES[recipe].kind];
		if (buildTool !== "place") return true;
		if (!footprintFree(world, tile.tx, tile.ty, spec.w, spec.h)) return false;
		const cost = RECIPES[recipe];
		if (cost.v14) return mapId === 0 && ok14() && inFarm(tile.tx, tile.ty) && canPay14(cost.need14);
		return player.wood >= cost.wood && player.stone >= cost.stone && player.scrap >= cost.scrap;
	}
	function tryBuild() {
		if (!world || !player) return;
		const cost = RECIPES[recipe];
		const tile = hoverTile();
		const spec = PROP_SPEC[cost.kind];
		if (buildTap14(tile)) return;
		if (cost.v14) {
			if (mapId !== 0 || !ok14()) { pushLog("Hold the farm first. Building can wait one night."); return; }
			if (!inFarm(tile.tx, tile.ty)) { pushLog("Keep it inside the farm ring."); return; }
			if (!canPay14(cost.need14)) { pushLog(`That wants ${costText(cost.need14)}.`); return; }
			const pr = add14(cost.kind, tile.tx, tile.ty, { p14: true, flip14: buildFlip });
			if (!pr) { pushLog("That ground will not take it."); return; }
			pay14(cost.need14);
			pr.hp = PIECE_HP[cost.kind];
			v14.placed.push({ k: cost.kind, tx: tile.tx, ty: tile.ty, hp: pr.hp, f: buildFlip });
			pushLog(`${cost.label} up.`);
			sfx("build"); burst(propCenter(pr).x, propCenter(pr).y, "#d4a24a", 10); saveGame(); sync(true);
			return;
		}
		if (!footprintFree(world, tile.tx, tile.ty, spec.w, spec.h)) {
			pushLog("That ground will not take it.");
			return;
		}
		if (player.wood < cost.wood || player.stone < cost.stone || player.scrap < cost.scrap) {
			pushLog("Short on timber, ledge, or iron.");
			return;
		}
		const prop = tryPlace(world, cost.kind, tile.tx, tile.ty);
		if (!prop) {
			pushLog("That ground will not take it.");
			return;
		}
		prop.built = true;
		player.wood -= cost.wood;
		player.stone -= cost.stone;
		player.scrap -= cost.scrap;
		if (cost.kind === "shelter") {
			const spot = nearestRespawn(tile.tx, tile.ty, spec.w, spec.h);
			player.respawnX = spot.x;
			player.respawnY = spot.y;
			pushLog("Lean-to raised. You will wake here.");
		} else pushLog(`${cost.label} raised.`);
		sfx("build");
		burst(propCenter(prop).x, propCenter(prop).y, "#d4a24a", 10);
		saveGame();
		sync(true);
	}
	function nearestRespawn(tx, ty, w, h) {
		if (!world) return {
			x: tx * 64,
			y: ty * 64
		};
		for (let r = 1; r < 8; r++) for (let y = ty - r; y <= ty + h + r; y++) for (let x = tx - r; x <= tx + w + r; x++) if (!cellBlocked(world, x, y)) return {
			x: x * 64 + 32,
			y: y * 64 + 32
		};
		return {
			x: player?.x ?? 0,
			y: player?.y ?? 0
		};
	}
	function applyChoice(id) {
		if (!player || !world) return;
		if (id !== "close") {
			const choice = dialogue?.choices?.find((c) => c.id === id);
			if (choice?.check) {
				const town = talkNpc ? townOf(talkNpc.role) : null;
				const rep = town ? player.rep?.[town] ?? 0 : 0;
				if (Math.random() * 100 >= checkChance(skillOf(choice.check.skill) + fx13().talkBonus, choice.check.dc, rep, player.karma ?? 0)) {
					const skillName = SKILLS.find((s) => s.id === choice.check.skill)?.name ?? "That";
					dialogue = {
						speaker: dialogue?.speaker ?? "Them",
						text: `${skillName} does not carry it. They are not persuaded.`,
						choices: [{ label: "All right", id: "close" }]
					};
					sfx("click");
					sync(true);
					return;
				}
				shiftRep(town, 1, 1);
			}
		}
		if (id.startsWith("q10-") && q10Choice(id)) return;
		if ((id.startsWith("v13-") || id.startsWith("v159-")) && v13Choice(id)) return;
		if ((id.startsWith("v14-") || id.startsWith("v141-")) && v14Choice(id)) { sync(true); return; }
		if (id.startsWith("q11-") && q11Choice(id)) return;
		if (id.startsWith("q113-") && v3Choice(id)) return;
		if (id === "warden-pay" || id === "warden-sneak" || id === "warden-fight") {
			wardenChoice(id);
			return;
		}
		if (id === "accept" && quest <= 0) {
			quest = 1;
			pushLog("The Chopping sits east on the old Canada Road.");
		} else if (id === "reward" && quest === 2) {
			quest = 3;
			player.blade = true;
			player.scrap += 10;
			shiftRep("lowelltown", 8, 16);
			grantXp(46);
			pushLog("Ada's hatchet. Ash handle, steel bit. It cuts. That is all.");
			sfx("level");
		} else if (id === "cider") {
			const hadCup = lootedChests.has(91001);
			const hadDonut = lootedChests.has(91002);
			if (!hadCup) {
				lootedChests.add(91001);
				giveItem("cider");
			}
			if (!hadCup && q10.seed >= 5) giveItem("stew");
			if (!hadDonut) {
				lootedChests.add(91002);
				giveItem("donut");
				giveItem("donut");
			}
			pushLog(hadCup && hadDonut ? "Sarah already sent you off with the cider." : "Sarah puts the kitchen's cider and donuts in your pack.");
			if (!hadCup || !hadDonut) {
				shiftRep("ponds", 1, 4);
				startDeal();
			}
		} else if (id === "snow-accept" && snow <= 0) {
			snow = 1;
			pushLog(`Sarah wants ${SNOW_WOOD} armloads of wood. The woodpile is by the barn.`);
		} else if (id === "snow-wood" && snow === 1 && player.wood >= SNOW_WOOD) {
			player.wood -= SNOW_WOOD;
			snow = 2;
			grantXp(12);
			pushLog("You stack the wood by the stove. Sarah wants to see you.");
		} else if (id === "snow-done" && snow === 2) {
			snow = 3;
			lootedChests.add(91001);
			lootedChests.add(91002);
			giveItem("cider");
			giveItem("donut");
			giveItem("donut");
			giveItem("medkit");
			const cot = world.props.find((p) => p.kind === "cot");
			if (cot && mapId === 0) {
				const spot = nearestRespawn(cot.tx, cot.ty, 1, 1);
				player.respawnX = spot.x;
				player.respawnY = spot.y;
			}
			kitchenDay = Math.floor(clock / DAY_LENGTH_SEC);
			shiftRep("ponds", 2, 6);
			grantXp(30);
			pushLog(v14.st === 3 ? "First Snow on Cambridge Road: done. Sarah says you can have the cot, if the farm's still standing tomorrow." : "First Snow on Cambridge Road: done. The farm is your base now. You wake on the cot if you fall.");
			pushLog("Hot cider and cider donuts heal. Use them from the pack.");
			sfx("level");
			startDeal();
		} else if (id === "jack-bye") {
			pushLog(JACK_SIGNOFF);
		} else if (id === "mira-brief" && quest <= 0) {
			quest = 1;
			shiftRep("lowelltown", 1, 2);
			grantXp(12);
			pushLog("Mira says the choppers bunch on the north gravel. Come at them from the south spruce.");
		} else if (id === "cyndal-lookout") pushLog("Cyndal takes the loft window. She'll shout when the next wave comes, then help Sarah with the hurt inside.");
		else if (id === "loki-safe") pushLog("Loki nods. Door barred, lanterns lit, shells on the porch. He stays inside.");
		else if (id.startsWith("join-")) recruitTalk();
		else if (id === "bench-up") upgradeDefense();
		else if (id === "bench-bomb") benchBuy("bomb", 0, 6, "A pipe bomb. Short fuse.");
		else if (id === "bench-fuel") benchBuy("fuel", 0, 4, "A can for the tractor.");
		else if (id === "bench-bait") benchBuy("baitpack", 2, 0, "A bait tin. Drop it where you want them.");
		else if (id === "buy-shells") buyFromTrader("rejean", 8, "shells", 6, "Six shells. Réjean counts them twice.", "Not enough iron. Réjean doesn't keep a tab.");
		else if (id === "buy-wrap") buyFromTrader("rejean", 6, "bandage-std", 1, "A field bandage. Cleaner than a rag.", "Not enough iron. Réjean doesn't keep a tab.");
		else if (id === "buy-coat") buyFromTrader("rejean", 14, "coat-std", 1, "A trail coat. Heavy, and it will turn a blade.", "Not enough iron. Réjean doesn't keep a tab.");
		else if (id === "buy-carbine") buyFromTrader("rejean", 18, "carbine-std", 1, "A service carbine. Straighter than the one you walked in with.", "Not enough iron. Réjean doesn't keep a tab.");
		else if (id === "buy-cal-shells") jackSale(10, "shells", 10, "Ten shells. Jack counts them out with a grin.");
		else if (id === "buy-cal-wrap") jackSale(18, "trauma", 1, "A sealed trauma kit. Real medicine, not a road rag.");
		else if (id === "buy-cal-coat") jackSale(34, "rig", 1, "A plate rig. Canvas, pouches, and a plate that stops more than wool.");
		else if (id === "buy-cal-gun") jackSale(42, "scoped", 1, "A scoped carbine. The glass is clean and the bore is bright.");
		else if (id === "buy-cal-radio") jackSale(12, "radio", 1, "A hand-crank radio, already on my channel. Keep it in your pack and I'll call you at dusk when they're moving.");
		else if (id === "buy-binoculars") buyFromTrader("rejean", 16, "binoculars", 1, "Brass binoculars. Réjean breathes on the glass and wipes it.", "Not enough iron. Réjean doesn't keep a tab.");
		dialogue = null;
		phase = "play";
		sfx("click");
		saveGame();
		sync(true);
	}
	function openBench() {
		if (!player) return;
		if (nightShade(clock) > .22) {
			pushLog("They are on the road. The bench can wait until morning.");
			return;
		}
		dialogue = {
			speaker: "Barn bench",
			text: "The vise is free. Timber and iron buy better gear.",
			choices: [
				{ label: "Upgrade a defense · 4 timber, 3 iron", id: "bench-up" },
				{ label: "Pipe bomb · 6 iron", id: "bench-bomb" },
				{ label: "Fuel can · 4 iron", id: "bench-fuel" },
				{ label: "Bait tin · 2 timber", id: "bench-bait" },
				{ label: "Leave it", id: "close" }
			]
		};
		phase = "dialogue";
		intent = null;
		sync(true);
	}
	function benchBuy(item, wood, scrap, got) {
		if (!player || !GEAR[item]) return;
		if (player.wood < wood || player.scrap < scrap) {
			pushLog("The bench is short. You need the timber and the iron in hand.");
			return;
		}
		if (!tryGive(item)) {
			pushLog("Your pack is full.");
			return;
		}
		player.wood -= wood;
		player.scrap -= scrap;
		pushLog(got);
	}
	function upgradeDefense() {
		if (!player || !world) return;
		const t14 = hoverTile();
		const p14 = buildOpen && world.props.find((p) => p.tx === t14.tx && p.ty === t14.ty && PIECE_UP[p.kind]);
		if (p14) {
			const nx = PIECES.find((x) => x.kind === PIECE_UP[p14.kind]);
			if (!canPay14(nx.cost)) { pushLog(`${nx.name} wants ${costText(nx.cost)}.`); return; }
			pay14(nx.cost); vacate(world, p14); p14.kind = nx.kind; occupy(world, p14); p14.hp = nx.hp; note14(p14);
			const pl = v14.placed.find((q) => q.tx === p14.tx && q.ty === p14.ty); if (pl) { pl.k = nx.kind; pl.hp = nx.hp; }
			pushLog(`Up to ${nx.name}.`); sfx("build"); saveGame(); return;
		}
		const prop = world.props.find((p) => NEXT_TIER[p.kind] && !PIECE_UP[p.kind]);
		if (!prop) {
			pushLog("Nothing on the ground will take another nail.");
			return;
		}
		if (player.wood < 4 || player.scrap < 3) {
			pushLog("An upgrade wants 4 timber and 3 iron.");
			return;
		}
		const next = NEXT_TIER[prop.kind];
		player.wood -= 4;
		player.scrap -= 3;
		prop.kind = next;
		prop.hp = DEF_HP[next] ?? prop.hp;
		pushLog("You build it up a notch.");
	}
	function jackSale(cost, item, qty, got) {
		if (!buyFromTrader("cal", cost, item, qty, got, "Not enough iron, friend. Jack doesn't keep a tab.")) return;
		jackTrust += 1;
		if (jackTrust === 1 && !bunkerSeen) pushLog("Jack Ready trusts you now. Talk to him again.");
	}
	function buyFromTrader(role, cost, item, qty, got, broke) {
		if (!player || !GEAR[item]) return;
		const town = townOf(role);
		const rep = town ? player.rep?.[town] ?? 0 : 0;
		if (townHostile(rep)) {
			pushLog("They will not sell to you.");
			return;
		}
		const price = Math.max(1, Math.round(v3Price(priceOf(cost, skillOf("barter"), rep)) * 1));
		train("barter", 3);
		const def = GEAR[item];
		if (def.kind !== "supply" && player.bag.some((s) => s.id === item)) {
			pushLog(`You already carry the ${def.name.toLowerCase()}.`);
			return;
		}
		if (player.scrap < price) {
			pushLog(broke);
			return;
		}
		let gotAny = false;
		for (let i = 0; i < qty; i++) {
			if (!tryGive(item)) break;
			gotAny = true;
		}
		if (!gotAny) {
			pushLog("Your pack is full.");
			return;
		}
		player.scrap -= price;
		pushLog(price === cost ? got : `${got} The iron comes to ${price}.`);
		startDeal();
		return true;
	}
	function startDeal() {
		if (!player) return;
		if (talkNpc) {
			player.dir = facing8(talkNpc.x - player.x, talkNpc.y - player.y);
			talkNpc.dir = facing8(player.x - talkNpc.x, player.y - talkNpc.y);
		}
		player.frame = 2;
		deal = .55;
		reach = .55;
	}
	function wardenNpc() {
		return world?.npcs.find((n) => n.id === WARDEN_NPC_ID) ?? null;
	}
	/** The Warden turns hostile where he stands (or at his post after a reload mid-fight). */
	function spawnWarden(x, y) {
		if (!world || world.enemies.some((e) => e.id === WARDEN_ENEMY_ID)) return;
		world.enemies.push({ id: WARDEN_ENEMY_ID, x, y, homeX: x, homeY: y, hp: 70, maxHp: 70, atk: 11, xp: 40, elite: true, quest: false, kind: "bandit", pack: 0, temper: "hostile", crippleArm: 0, crippleLeg: 0, dir: 0, frame: 0, anim: 0, cooldown: .6, path: null, pathT: 0, aggro: true, dead: false, hurt: 0, name: "The Bangor Warden", variant: "warden" });
	}
	function restoreWarden() {
		if (!world) return;
		const npc = wardenNpc();
		if (wardenState >= 2 && npc) {
			world.npcs = world.npcs.filter((n) => n.id !== WARDEN_NPC_ID);
			if (wardenState === 2) spawnWarden(npc.x, npc.y);
		}
	}
	function wardenChoice(id) {
		const npc = wardenNpc();
		if (!player || !world || !npc) return;
		let text = "";
		if (id === "warden-pay") {
			if (player.scrap < 12) {
				dialogue = { speaker: npc.name, text: "\"Twelve. Not a plate less.\" He doesn't move off the gate.", choices: [{ label: "Slip past while he's on the radio", id: "warden-sneak" }, { label: "Take the gate from him", id: "warden-fight" }, { label: "Turn back", id: "close" }] };
				sfx("click");
				sync(true);
				return;
			}
			player.scrap -= 12;
			wardenState = 1;
			text = "He counts it twice and swings the pole gate open. \"Holeb's down the road. Don't bring trouble back up it.\"";
		} else if (id === "warden-sneak") {
			const chance = Math.min(90, 30 + Math.round(skillOf("sneak") * .6) + (player.trait === "step" ? 10 : 0));
			if (Math.random() * 100 < chance) {
				wardenState = 1;
				grantXp(12);
				text = `He turns to crank his radio and you are past the gate and into the spruce before he looks up. (Sneak ${chance}%)`;
			} else {
				id = "warden-fight";
				pushLog(`A stick snaps under your boot. (Sneak ${chance}%)`);
			}
		}
		if (id === "warden-fight") {
			wardenState = 2;
			world.npcs = world.npcs.filter((n) => n.id !== WARDEN_NPC_ID);
			spawnWarden(npc.x, npc.y);
			dialogue = null;
			talkNpc = null;
			phase = "play";
			pushLog("The Warden brings his rifle up. \"Wrong answer.\"");
			sfx("hit");
			saveGame();
			sync(true);
			return;
		}
		dialogue = { speaker: npc.name, text, choices: [{ label: "Walk on", id: "close" }] };
		sfx("click");
		saveGame();
		sync(true);
	}
	/** First steps near the checkpoint: the Warden calls you over. Near the flooded mill: a line about it. */
	function stepEncounters() {
		if (!world || !player || inside || phase !== "play" || dialogue) return;
		const npc = wardenState === 0 ? wardenNpc() : null;
		const near = npc ? Math.hypot(npc.x - player.x, npc.y - player.y) : 1e9;
		if (near > 340) wardenAsked = false;
		if (npc && near < 190 && !wardenAsked) {
			wardenAsked = true;
			openTalk(npc);
			return;
		}
		if (!millSeen && world.flood) {
			const fx = (world.flood.tx + .5) * TILE, fy = (world.flood.ty + .5) * TILE;
			if (Math.hypot(fx - player.x, fy - player.y) < TILE * 7) {
				millSeen = true;
				pushLog("The old Attean mill. Snowmelt has the floor under a foot of black water. A lantern moves inside.");
			}
		}
	}
	// ---------------------------------------------------------------- beta v10 side quests (src/game/quests10.ts)
	let q10 = freshQ10();
	let q10Spots = new Map();
	const q10Latch = new Set();
	/** Goose, Loki's dog: drawn with the existing coyote sheet, never an enemy. */
	let dogBody = null;
	function q10Tile(rtx, rty) {
		if (!world) return { x: 0, y: 0 };
		const tx0 = rtx + WORLD_OX, ty0 = rty + WORLD_OY;
		const open = (x, y) => x > 1 && y > 1 && x < 154 && y < 154 && !cellBlocked(world, x, y) && !cellBlocked(world, x + 1, y) && !cellBlocked(world, x, y + 1) && !cellBlocked(world, x - 1, y) && !cellBlocked(world, x, y - 1);
		for (let r = 0; r < 14; r++) for (let y = ty0 - r; y <= ty0 + r; y++) for (let x = tx0 - r; x <= tx0 + r; x++) {
			if (Math.max(Math.abs(x - tx0), Math.abs(y - ty0)) !== r) continue;
			if (open(x, y)) return { x: (x + .5) * TILE, y: (y + .5) * TILE };
		}
		return { x: (tx0 + .5) * TILE, y: (ty0 + .5) * TILE };
	}
	function q10Spot(key) {
		if (!q10Spots.has(key)) {
			const s = key.startsWith("trail") ? DOG_TRAIL[Number(key.slice(5))] : [Q10_SITES[key].tx, Q10_SITES[key].ty];
			q10Spots.set(key, q10Tile(s[0], s[1]));
		}
		return q10Spots.get(key);
	}
	function farmCenter() {
		const fh = world?.props.find((p) => p.kind === "farmhouse");
		return fh ? propCenter(fh) : { x: (36 + WORLD_OX) * TILE, y: (16 + WORLD_OY) * TILE };
	}
	function q10Spawn(kind, variant, name, spot, stats, tag, aggro = false) {
		if (!world) return null;
		const t = tileOf(spot.x, spot.y);
		let x = spot.x, y = spot.y;
		if (cellBlocked(world, t.tx, t.ty)) { const s = q10Tile(t.tx - WORLD_OX, t.ty - WORLD_OY); x = s.x; y = s.y; }
		const e = { id: q10.nextId++, x, y, homeX: x, homeY: y, hp: stats[0], maxHp: stats[0], atk: stats[1], xp: stats[2], elite: !!stats[3], quest: false, kind, pack: 70, temper: kind === "moose" ? "wary" : "hostile", crippleArm: 0, crippleLeg: 0, dir: 0, frame: 0, anim: 0, cooldown: 0, path: null, pathT: 0, aggro, dead: false, hurt: 0, slow: 0, death: 0, q10: tag };
		if (variant) e.variant = variant;
		if (name) e.name = name;
		world.enemies.push(e);
		return e;
	}
	function q10SeedCamp() {
		const c = q10Spot("coop");
		const offs = [[-90, -40], [70, -70], [-30, 110], [120, 60]];
		for (let i = 0; i < q10.seedLeft && i < 4; i++) {
			const o = offs[i];
			const spot = { x: c.x + o[0], y: c.y + o[1] };
			if (i < 2) q10Spawn("bandit", "scout", i === 0 ? "Co-op squatter" : "Co-op lookout", spot, [18, 4, 9], "seed");
			else q10Spawn("coyote", null, null, spot, [13, 4, 6], "seed");
		}
	}
	function q10Bull() {
		const b = q10Spot("bog");
		return q10Spawn("moose", null, "Bog bull", { x: b.x + 60, y: b.y + 40 }, [52, 10, 22, true], "moose");
	}
	/** Dress the quest sites with props that already exist (no new art): the co-op yard, the ferry landing, the wrecks. */
	function q10Props() {
		const place = (site, kind, dx, dy) => {
			const b = Q10_SITES[site];
			const tx0 = b.tx + WORLD_OX + dx, ty0 = b.ty + WORLD_OY + dy;
			for (let r = 0; r < 4; r++) for (let y = ty0 - r; y <= ty0 + r; y++) for (let x = tx0 - r; x <= tx0 + r; x++) {
				if (Math.max(Math.abs(x - tx0), Math.abs(y - ty0)) !== r) continue;
				if (addProp(world, kind, x, y, { q10: true })) return;
			}
		};
		place("coop", "stall", 2, -3);
		place("coop", "wall", -3, -2);
		place("coopBins", "crates", 2, 1);
		place("coopBins", "crates", 1, 3);
		place("ferry", "crates", 2, -1);
		place("ferry", "wall", -2, -2);
		place("winch", "car-truck", 2, 0);
		place("part2", "car-sedan", 2, 1);
		place("rope", "crates", 2, 0);
	}
	/** After any home-map world build (new game, load, crossing back): find the sites and put live quest bodies back. */
	/** v15.9.5: base defences (turrets, fences, lures, spike traps, lookouts) are gone; old saves drop any that were built. */
	const DEF_GONE = /^(stand|blind|firepot|nest|fence|post-(loft|porch|roof)|scarecrow|bait|spikes|lookout)(-(up|2|3|x))?$/;
	function purgeDefences() {
		if (v14?.placed) v14.placed = v14.placed.filter((p) => !DEF_GONE.test(p.k));
		if (!world) return;
		world.props = world.props.filter((p) => { if (!DEF_GONE.test(p.kind)) return true; vacate(world, p); return false; });
	}
	function q10World() {
		q11World();
		purgeDefences();
		v14World();
		q10Spots = new Map();
		q10Latch.clear();
		dogBody = null;
		if (!world || mapId !== 0) return;
		q10Props();
		v3FarmProps();
		farmGone();
		layoutFix();
		if (q10.seed === 2 && q10.seedLeft > 0) q10SeedCamp();
		if (q10.moose === 2) q10Bull();
		if (q10.dog >= 2) q10PlaceDog();
	}
	function q10PlaceDog() {
		// v15.9.5: Goose's trail and his stay-at-home spot are in Harmony now; on the world map he only exists beside you
		if (player && (q10.dog === 3 || (q10.dog >= 4 && v3.dog.mode !== "stay" && v3.dog.down < 0))) dogBody = { x: player.x + 40, y: player.y + 30, dir: 0, frame: 0, anim: 0, moving: false };
		else dogBody = null;
	}
	function npcSpot(role) {
		const n = world?.npcs.find((m) => m.role === role);
		return n ? { x: n.x, y: n.y, npc: true } : null;
	}
	/** Active objectives: where to put markers, and which spots open a talk or fire on arrival. */
	function q10Targets() {
		const out = [];
		if (!world || mapId !== 0 || snow < 3) return out;
		const add = (key, mode, color = "#e8c15a") => { const s = q10Spot(key); out.push({ key, x: s.x, y: s.y, mode, color }); };
		const npc = (role, color = "#e8c15a") => { const s = npcSpot(role); if (s) out.push({ key: `npc-${role}`, x: s.x, y: s.y, mode: "npc", color }); };
		if (q10.seed === 1) add("coop", "arrive");
		if (q10.seed === 2) add("coop", "mark", "#d0644a");
		if (q10.seed === 3) add("coopBins", "talk");
		if (q10.seed === 4) npc("sarah");
		if (q10.ferry === 1) { if (!q10.planks) add("planks", "talk"); if (!q10.rope) add("rope", "talk"); if (!q10.winch) add("winch", "talk"); }
		if (q10.ferry === 2) add("ferry", "talk");
		if (q10.ferry >= 3) { const s = q10Spot("ferry"); out.push({ key: "ferry", x: s.x, y: s.y, mode: "talk", color: "#7fb0d8", quiet: true }); }
		if (q10.dog === 1) npc("loki", "#c9a0e0");
		if (false && q10.dog === 2) { // v15.9.5: Goose's trail is in Harmony
			const last = DOG_TRAIL.length - 1;
			if (q10.dogStep < last) add(`trail${q10.dogStep}`, "arrive", "#c9a0e0");
			else add(`trail${last}`, "talk", "#c9a0e0");
		}
		if (q10.dog === 3) npc("loki", "#c9a0e0");
		if (q10.radio === 1) RADIO_SITES.forEach((k, i) => { if (!q10.parts[i]) add(k, "talk", "#8fd07a"); });
		if (q10.radio === 2) npc("cyndal", "#8fd07a");
		if (q10.moose === 1) add("bog", "arrive", "#d89a5a");
		if (q10.moose === 2) { const bull = world.enemies.find((e) => e.q10 === "moose" && !e.dead); if (bull) out.push({ key: "bull", x: bull.x, y: bull.y, mode: "mark", color: "#d0644a" }); }
		if (q10.moose === 3) { const f = farmCenter(); out.push({ key: "farm", x: f.x, y: f.y + 80, mode: "mark", color: "#d89a5a" }); }
		if (q10.moose === 4) npc("sarah", "#d89a5a");
		return out;
	}
	const Q10_SITE_TALK = {
		coopBins: () => ({ speaker: "Co-op seed bins", text: "Back of the co-op the bins are still covered with feed sacks. Under them, cold and dry: Kennebec russets, firm as stones. Somebody knew what they were doing.", choices: [{ label: "Fill a sack with seed", id: "q10-seed-take" }, { label: "Leave them", id: "close" }] }),
		planks: () => ({ speaker: "Lowelltown sawpile", text: "Rough-sawn hemlock under a tarp, stickered and dry. A dozen boards would deck the ferry.", choices: [{ label: "Take a bundle of planks", id: "q10-take-planks" }, { label: "Leave it", id: "close" }] }),
		rope: () => ({ speaker: "Attean boathouse", text: "The boathouse door hangs by one hinge. Coiled on a peg inside: a hank of three-strand manila, stiff with cold but sound.", choices: [{ label: "Take the rope", id: "q10-take-rope" }, { label: "Leave it", id: "close" }] }),
		winch: () => ({ speaker: "Wrecked log truck", text: "A loader rig on its side in the ditch, ice in the cab. The winch drum's still bolted on, and the pawl will knock loose with a hammer and some cussing.", choices: [{ label: "Knock the pawl loose", id: "q10-take-winch" }, { label: "Leave it", id: "close" }] }),
		ferry: () => q10.ferry === 2
			? { speaker: "Kennebec ferry landing", text: "The cable barge sits half up on the gravel, deck boards gone soft and the winch rusted solid. The river's running black and fast. You've got everything she needs.", choices: [{ label: "Deck her, rig the rope, seat the pawl", id: "q10-ferry-fix" }, { label: "Not yet", id: "close" }] }
			: { speaker: "Kennebec ferry", text: "The ferry rides easy on her cable. North across the Kennebec the spruce goes on forever. They say The Grok walks up there.", choices: [{ label: "Pole across to the north woods", id: "q10-ferry-cross" }, { label: "Stay this side", id: "close" }] },
		part0: () => ({ speaker: "Lowelltown grange hall", text: "The grange hall's radio cabinet was gutted long ago, but in a drawer under the stage there's a sock with something hard in it: a 6V6 tube, glass not cracked.", choices: [{ label: "Pocket the tube", id: "q10-part-0" }, { label: "Leave it", id: "close" }] }),
		part1: () => ({ speaker: "Attean fire tower shed", text: "The ranger's shed at the foot of the tower. On the bench, under mouse leavings, a spool of enamel copper wire.", choices: [{ label: "Take the spool", id: "q10-part-1" }, { label: "Leave it", id: "close" }] }),
		part2: () => ({ speaker: "Holeb camp road", text: "A camp truck in the ditch, its hood up. A big square lantern battery sits on the seat. You touch it to your tongue. It still kicks.", choices: [{ label: "Take the battery", id: "q10-part-2" }, { label: "Leave it", id: "close" }] }),
	};
	Q10_SITE_TALK[`trail${DOG_TRAIL.length - 1}`] = () => ({ speaker: "Goose", text: "Under a blowdown in the spruce, a muddy brown dog with one ear up. He thumps his tail and won't come out. He's shaking.", choices: [{ label: "Come on, Goose. Let's go home", id: "q10-dog-found" }, { label: "Give him a minute", id: "close" }] });
	function q10Step(dt) {
		if (!world || !player || mapId !== 0 || inside || phase !== "play") return;
		// Goose tags along once found
		if (dogBody && q10.dog === 3) {
			const tx = player.x + 46, ty = player.y + 30;
			const d = Math.hypot(tx - dogBody.x, ty - dogBody.y);
			dogBody.moving = d > 24;
			if (d > 600) { dogBody.x = tx; dogBody.y = ty; }
			else if (dogBody.moving) {
				const sp = Math.min(d, (d > 180 ? 360 : 220) * dt);
				dogBody.dir = facing8(tx - dogBody.x, ty - dogBody.y);
				dogBody.x += (tx - dogBody.x) / d * sp;
				dogBody.y += (ty - dogBody.y) / d * sp;
			}
			dogBody.anim += dt * (dogBody.moving ? 9 : 0);
		}
		if (dialogue) return;
		for (const t of q10Targets()) {
			if (t.mode === "mark" || t.mode === "npc") continue;
			const d = Math.hypot(t.x - player.x, t.y - player.y);
			const r = t.mode === "arrive" ? (t.key === "coop" || t.key === "bog" ? 5 * TILE : 1.6 * TILE) : 1.4 * TILE;
			if (d > r + TILE * 2) q10Latch.delete(t.key);
			if (d > r || q10Latch.has(t.key)) continue;
			q10Latch.add(t.key);
			if (t.mode === "arrive") q10Arrive(t.key);
			else if (Q10_SITE_TALK[t.key]) {
				dialogue = Q10_SITE_TALK[t.key]();
				talkNpc = null;
				phase = "dialogue";
				intent = null;
				sfx("talk");
				sync(true);
			}
			return;
		}
		// Moose Season: the bear on the walk home, then the yard
		if (q10.moose === 3) {
			const f = farmCenter(), b = q10Spot("bog");
			const home = Math.hypot(f.x - player.x, f.y - player.y);
			const span = Math.hypot(f.x - b.x, f.y - b.y);
			if (!q10.bearDone && home < span * .62 && home > 14 * TILE) {
				q10.bearDone = true;
				const ux = (f.x - player.x) / home, uy = (f.y - player.y) / home;
				q10Spawn("wolf", "bear", "Black bear", { x: player.x + ux * 7 * TILE, y: player.y + uy * 7 * TILE }, [58, 9, 26, true], "bear", true);
				pushLog("Something big stands up out of the alders ahead of you. A black bear, and it wants that meat.");
				sfx("hit");
				saveGame();
			}
			if (home < 9 * TILE) {
				q10.moose = 4;
				pushLog("You drag the last of the moose into the yard. Tell Sarah.");
				saveGame();
				sync(true);
			}
		}
	}
	function q10Arrive(key) {
		if (key === "coop" && q10.seed === 1) {
			q10.seed = 2;
			q10.seedLeft = 4;
			q10SeedCamp();
			for (const e of world.enemies) if (e.q10 === "seed") e.aggro = true;
			pushLog("The Pittsfield co-op. Smoke from the stovepipe and a dog-pack of coyotes nosing the loading dock. Somebody's moved in, and they don't want company.");
			sfx("hit");
		} else if (key === "bog" && q10.moose === 1) {
			q10.moose = 2;
			q10Bull();
			pushLog("Heald Stream bog. There he is, up to his knees in the water, a bull as tall as a truck cab. Take him clean.");
		} else if (false && key.startsWith("trail") && q10.dog === 2) {
			q10.dogStep += 1;
			const left = DOG_TRAIL.length - 1 - q10.dogStep;
			pushLog(left > 0 ? ["Paw prints in the mud, headed for the spruce.", "More tracks. He was running flat out here.", "A tuft of brown fur on a raspberry cane.", "Tracks along the old tote road. He slowed down.", "Muddy prints, close together now. He's tired.", "He went under a fence wire here. Not far now."][Math.min(5, q10.dogStep - 1)] : "You hear a whine from under a blowdown.");
		}
		saveGame();
		sync(true);
	}
	function q10Kill(enemy) {
		if (!enemy.q10) return;
		if (enemy.q10 === "seed" && q10.seed === 2) {
			q10.seedLeft = Math.max(0, q10.seedLeft - 1);
			if (q10.seedLeft <= 0) { q10.seed = 3; pushLog("The co-op's quiet. The seed bins are around back."); }
		} else if (enemy.q10 === "moose" && q10.moose === 2) {
			q10.moose = 3;
			pushLog("The bull goes down in the bog. You dress him out and quarter him on a sled of spruce poles. Now haul him home.");
		} else if (enemy.q10 === "bear") pushLog("The bear's down. The meat's still yours.");
		sync(true);
	}
	function q10Reward(items) {
		for (const [id, n] of items) giveItem(id, n);
	}
	/** Ferry crossing to the north woods (the second map). Arrives at that map's first road gate. */
	function q10FerryCross() {
		if (!world || !player || mapId !== 0) return;
		parkBike(false);
		const leaving = world.name;
		regions.set(mapId, captureRegion());
		mapId = 1;
		world = createWorld(worldSeed, mapId, exitSides);
		applyRegion(regions.get(mapId));
		regions.delete(mapId);
		const arrive = world.gates[0];
		if (arrive) { player.x = arrive.arriveTx * 64 + 32; player.y = arrive.arriveTy * 64 + 32; }
		intent = null; work = null; holdWalk = false; inside = null; opening = null; travelLock = 1.6;
		q10World();
		spawnCrows();
		const land = tileOf(player.x, player.y);
		reveal(land.tx, land.ty, sightRadius(), true);
		pushLog(`The ferry grinds onto the far bank. You leave ${leaving} behind and step off into ${world.name}, the north woods.`);
		camX = player.x - player.y - viewW / 2;
		camY = (player.x + player.y) * CAM_ISO_Y - viewH / 2;
		snapParty();
		landReturn();
		saveGame();
	}
	/** Handles every "q10-*" choice. Returns true when it left a dialogue open. */
	function q10Choice(id) {
		const open = (d) => { dialogue = d; phase = "dialogue"; sfx("click"); sync(true); return true; };
		if (id === "q10-seed-ask") return open(Q10_TEXT.seedAsk);
		if (id === "q10-ferry-ask") return open(Q10_TEXT.ferryAsk);
		if (id === "q10-moose-ask") return open(Q10_TEXT.mooseAsk);
		if (id === "q10-radio-ask") return open(Q10_TEXT.radioAsk);
		if (id === "q10-seed-accept" && q10.seed === 0) { q10.seed = 1; pushLog("Seed Run: the Pittsfield co-op is south and east, down past Attean. Get there before the frost."); }
		else if (id === "q10-seed-take" && q10.seed === 3) { q10.seed = 4; pushLog("You fill a feed sack with seed potatoes and wrap it in your coat to keep the cold off. Back to Sarah."); }
		else if (id === "q10-seed-done" && q10.seed === 4) {
			q10.seed = 5; q10.stores += 4;
			q10Reward([["stew", 2], ["apple", 3]]);
			grantXp(34); shiftRep("ponds", 2, 8);
			pushLog("Seed Run: done. The seed's in the cellar. From now on Sarah sends a bowl of camp stew along with the cider.");
			sfx("level");
		}
		else if (id === "q10-ferry-accept" && q10.ferry === 0) { q10.ferry = 1; pushLog("Kennebec Crossing: planks at the Lowelltown sawpile, rope at the Attean boathouse, a winch pawl off the log truck east of the farm."); }
		else if (id === "q10-take-planks" && q10.ferry === 1) { q10.planks = true; pushLog("You lash a bundle of hemlock planks to your pack frame. Heavy."); }
		else if (id === "q10-take-rope" && q10.ferry === 1) { q10.rope = true; pushLog("You sling the coil of manila over your shoulder."); }
		else if (id === "q10-take-winch" && q10.ferry === 1) { q10.winch = true; pushLog("Three good whacks and the pawl drops into the snow. Got it."); }
		if (q10.ferry === 1 && q10.planks && q10.rope && q10.winch) { q10.ferry = 2; pushLog("That's planks, rope and the winch part. Take them up to the ferry landing on the Kennebec."); }
		if (id === "q10-ferry-fix" && q10.ferry === 2) {
			q10.ferry = 3;
			grantXp(40); shiftRep("ponds", 1, 6);
			pushLog("Kennebec Crossing: done. New deck, new rope, and the winch clacks over like it should. The ferry runs to the north woods.");
			sfx("build");
		}
		else if (id === "q10-ferry-cross" && q10.ferry >= 3) { dialogue = null; phase = "play"; q10FerryCross(); sync(true); return true; }
		else if (id === "q10-dog-accept" && q10.dog === 1) { q10.dog = 2; q10.dogStep = 0; q10PlaceDog(); pushLog("Lost Dog: Goose's paw prints start in the mud by the orchard."); }
		else if (id === "q10-dog-found" && q10.dog === 2) { q10.dog = 3; q10PlaceDog(); pushLog("Goose crawls out and leans on your leg. Walk him home to Loki."); }
		else if (id === "q10-dog-done" && q10.dog === 3) {
			q10.dog = 4; q10PlaceDog();
			q10Reward([["maple", 1]]);
			grantXp(24); shiftRep("ponds", 2, 8);
			pushLog("Lost Dog: done. Loki slips you his maple candy tin.");
			sfx("level");
		}
		else if (id === "q10-radio-accept" && q10.radio === 0) { q10.radio = 1; pushLog("Cyndal's Radio: a tube, a coil and a battery. Lowelltown grange, the Attean fire tower shed, the Holeb camp road."); }
		else if (id.startsWith("q10-part-") && q10.radio === 1) {
			const i = Number(id.slice(9));
			q10.parts[i] = true;
			const n = q10.parts.filter(Boolean).length;
			if (n >= 3) { q10.radio = 2; pushLog("That's all three radio parts. Bring them to Cyndal."); }
			else pushLog(`Radio part ${n} of 3.`);
		}
		else if (id === "q10-radio-done" && q10.radio === 2) {
			q10.radio = 3;
			grantXp(30); shiftRep("ponds", 2, 8);
			pushLog("Cyndal's Radio: done. Talk to Cyndal to call Marcel the trader on the radio.");
			sfx("level");
		}
		else if (id === "q10-trader" && q10.radio >= 3) return open({
			speaker: "Marcel Thibodeau (radio)",
			text: "\"Thibodeau, go ahead.\" Static, then a laugh. \"The Cambridge Road farm? Ayuh, I can run the sled up. Cash is iron. Here's what's on it this week.\"",
			choices: [
				{ label: "Eight shells — 10 iron", id: "q10-buy-shells" },
				{ label: "Field bandage — 6 iron", id: "q10-buy-wrap" },
				{ label: "Snowshoes — 16 iron", id: "q10-buy-snowshoes" },
				{ label: "Barn lantern — 12 iron", id: "q10-buy-lantern" },
				{ label: "Smoked jerky — 5 iron", id: "q10-buy-jerky" },
				{ label: "Gas, quart can — 4 iron", id: "q10-buy-gas" },
				{ label: "Over and out", id: "close" },
			],
		});
		else if (id === "q10-buy-shells") buyFromTrader("sarah", 10, "shells", 8, "Marcel's sled comes up the road at dusk. Eight shells in a coffee can.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-wrap") buyFromTrader("sarah", 6, "bandage-std", 1, "A field bandage off Marcel's sled.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-snowshoes") buyFromTrader("sarah", 16, "snowshoes", 1, "Ash-frame snowshoes, rawhide laced. Marcel says his uncle made them.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-lantern") buyFromTrader("sarah", 12, "lantern", 1, "A barn lantern with a good wick.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-gas") buyFromTrader("sarah", 4, "gas", 1, "A quart of gas in a square can, off Marcel's sled.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-jerky") buyFromTrader("sarah", 5, "jerky", 1, "A twist of smoked jerky.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-moose-accept" && q10.moose === 0) { q10.moose = 1; pushLog("Moose Season: the Heald Stream bog is south of the farm, toward Attean."); }
		else if (id === "q10-moose-done" && q10.moose === 4) {
			q10.moose = 5; q10.stores += 10;
			q10Reward([["meat", 6], ["hide", 2], ["jerky", 4]]);
			grantXp(44); shiftRep("ponds", 2, 8);
			pushLog("Moose Season: done. Six quarters hanging, the hide on the barn wall. Sarah sets aside your share: meat, a hide and jerky.");
			sfx("level");
		}
		return false;
	}
	/** Ground rings under every objective and Goose's paw prints; drawn flat on the ground plane. */
	function q10All() {
		return [...(mapId === 0 ? q10Targets() : []), ...q11Targets()];
	}
	function q10DrawGround(dcx, dcy, dpr) {
		if (!world) return;
		const z = zoom;
		ctx.save();
		ctx.setTransform(dpr * z, dpr * CAM_ISO_Y * z, -dpr * z, dpr * CAM_ISO_Y * z, dpr * (viewW / 2 * (1 - z) - dcx * z), dpr * (viewH / 2 * (1 - z) - dcy * z));
		const t = performance.now() / 1000;
		for (const m of q10All()) {
			if (m.quiet || m.mode === "npc") continue;
			const pulse = .5 + .5 * Math.sin(t * 3);
			ctx.strokeStyle = m.color;
			ctx.globalAlpha = .45 + .35 * pulse;
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.arc(m.x, m.y, 46 + pulse * 10, 0, Math.PI * 2);
			ctx.stroke();
			ctx.globalAlpha = .18;
			ctx.fillStyle = m.color;
			ctx.fill();
		}
		ctx.globalAlpha = .85;
		ctx.fillStyle = "#3a2a18";
		for (const tr of q11.traps) {
			if ((tr.map ?? 0) !== mapId) continue;
			ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.kind === "trap" ? 13 : 10, 0, Math.PI * 2); ctx.fill();
			if (tr.caught) { ctx.strokeStyle = "#e0b070"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(tr.x, tr.y, 22, 0, Math.PI * 2); ctx.stroke(); }
		}
		// v11.3 game tracks: hoof or paw prints along each animal's recent path, within sight
		if (player) {
			const reach = (sightRadius() + 1 + Math.floor(lv("hunting") / 3)) * TILE;
			for (const e of world.enemies) {
				if (!e.trail || e.dead || e.kind === "bandit") continue;
				const hoof = e.kind === "deer" || e.kind === "moose";
				for (let i = 0; i < e.trail.length; i++) {
					const p = e.trail[i];
					if (Math.hypot(p.x - player.x, p.y - player.y) > reach) continue;
					const age = Math.max(0, Math.min(1, (clock - p.t) / 45));
					if (age >= 1) continue;
					ctx.globalAlpha = .75 * (1 - age) + .1;
					ctx.fillStyle = "#2a1c10";
					const side = i % 2 ? 7 : -7;
					if (hoof) { ctx.beginPath(); ctx.ellipse(p.x + side, p.y - 3, 4, 6, .6, 0, Math.PI * 2); ctx.ellipse(p.x + side + 5, p.y + 1, 4, 6, .6, 0, Math.PI * 2); ctx.fill(); }
					else if (images.get(i % 2 ? "v2/tracks/wolf-right" : "v2/tracks/wolf-left")) ctx.drawImage(images.get(i % 2 ? "v2/tracks/wolf-right" : "v2/tracks/wolf-left"), p.x + side - 9, p.y - 9, 18, 18);
					else { ctx.beginPath(); ctx.ellipse(p.x + side, p.y, 6, 5, 0, 0, Math.PI * 2); ctx.fill(); for (let c = -1; c <= 1; c++) { ctx.beginPath(); ctx.arc(p.x + side + c * 4, p.y - 7, 2.2, 0, Math.PI * 2); ctx.fill(); } }
				}
			}
			ctx.globalAlpha = .85;
		}
		if (false && q10.dog === 2 && mapId === 0) {
			ctx.globalAlpha = .92;
			ctx.fillStyle = "#24170d";
			const steps = Math.min(q10.dogStep + 1, DOG_TRAIL.length);
			let prev = farmCenter();
			for (let i = 0; i < steps; i++) {
				const s = q10Spot(`trail${i}`);
				const dx = s.x - prev.x, dy = s.y - prev.y, L = Math.hypot(dx, dy) || 1;
				const n = Math.max(2, Math.floor(L / 52));
				for (let k = 1; k <= n; k++) {
					const u = k / n, px = prev.x + dx * u, py = prev.y + dy * u;
					const side = k % 2 ? 1 : -1, ox = -dy / L * 9 * side, oy = dx / L * 9 * side;
					ctx.beginPath(); ctx.ellipse(px + ox, py + oy, 9, 7, Math.atan2(dy, dx), 0, Math.PI * 2); ctx.fill();
					for (let c = -1; c <= 1; c++) { ctx.beginPath(); ctx.arc(px + ox + dx / L * 11 + -dy / L * c * 6, py + oy + dy / L * 11 + dx / L * c * 6, 3.2, 0, Math.PI * 2); ctx.fill(); }
				}
				prev = s;
			}
		}
		ctx.restore();
	}
	/** Floating diamonds over objectives (and over the person to talk to) plus Goose, depth-sorted with the world. */
	function q10Draws(draws, dcx, dcy) {
		if (!world) return;
		const t = performance.now() / 1000;
		if (escortBodies) for (const b of escortBodies) draws.push({ z: bodyZ(b.x, b.y), draw: () => paintPerson(b, dcx, dcy) });
		for (const m of q10All()) {
			if (m.quiet) continue;
			const tile = tileOf(m.x, m.y);
			if (!explored[tile.ty * 156 + tile.tx] && m.mode !== "npc") continue;
			draws.push({ z: m.x + m.y + 1e5, draw: () => {
				const raw = worldToScreen(m.x, m.y, dcx, dcy);
				const p = zoomPoint(raw.sx, raw.sy);
				const lift = (m.mode === "npc" ? 118 : 70) * zoom + Math.sin(t * 3) * 5 * zoom;
				const s = 9 * zoom;
				ctx.save();
				ctx.globalAlpha = .95;
				ctx.fillStyle = m.color;
				ctx.strokeStyle = "#2a2116";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(p.sx, p.sy - lift - s * 1.4); ctx.lineTo(p.sx + s, p.sy - lift); ctx.lineTo(p.sx, p.sy - lift + s * 1.4); ctx.lineTo(p.sx - s, p.sy - lift);
				ctx.closePath(); ctx.fill(); ctx.stroke();
				ctx.restore();
			} });
		}
		if (petBody) {
			const tile = tileOf(petBody.x, petBody.y);
			if (visible[tile.ty * 156 + tile.tx]) draws.push({ z: bodyZ(petBody.x, petBody.y), draw: () => {
				const nm = petBody.moving || !images.get("v2/raccoon-idle") ? "v2/raccoon-walk" : "v2/raccoon-idle";
				const frame = petBody.moving ? Math.floor(petBody.anim) % 4 : Math.floor(performance.now() / (ANIM_MS.idle * 4)) % 4;
				if (!images.get(nm)) return;
				const r = worldToScreen(petBody.x, petBody.y, dcx, dcy), p = zoomPoint(r.sx, r.sy);
				if (!noShadow141) softShadow(p.sx, p.sy + zoom, 10 * zoom, nm);
				blit(nm, petBody.x, petBody.y, realH("v2/raccoon-walk", SIZE_IN.raccoon), true, frame, petBody.dir, dcx, dcy);
			} });
		}
		if (dogBody) {
			const tile = tileOf(dogBody.x, dogBody.y);
			if (visible[tile.ty * 156 + tile.tx]) draws.push({ z: bodyZ(dogBody.x, dogBody.y), draw: () => {
				const frame = dogBody.moving ? Math.floor(dogBody.anim) % 4 : 0;
				// art hook: public/game/v2/biscuit-walk.png (and biscuit-idle.png) when present, else the coyote sheet
				const own = dogBody.moving ? "v2/biscuit-walk" : images.get("v2/biscuit-idle") ? "v2/biscuit-idle" : "v2/biscuit-walk";
				shadow193 = true;
				if (images.get(own)) blit(own, dogBody.x, dogBody.y, 27, true, frame, dogBody.dir, dcx, dcy);
				else blit("coyote", dogBody.x, dogBody.y, realH("coyote", 27), true, frame, dogBody.dir, dcx, dcy);
				shadow193 = false;
				if (q10.dog >= 4 && v3.dog.hp < 30) { const r = worldToScreen(dogBody.x, dogBody.y, dcx, dcy); const p = zoomPoint(r.sx, r.sy); ctx.fillStyle = "#1a1410"; ctx.fillRect(p.sx - 16, p.sy - 44 * zoom, 32, 4); ctx.fillStyle = "#c8503c"; ctx.fillRect(p.sx - 16, p.sy - 44 * zoom, 32 * v3.dog.hp / 30, 4); }
			} });
		}
	}
	function q10Mini(mctx, sx, sy) {
		if (!world) return;
		for (const m of q10All()) {
			if (m.quiet) continue;
			const t = tileOf(m.x, m.y);
			mctx.fillStyle = m.color;
			mctx.fillRect(t.tx * sx - 1.5, t.ty * sy - 1.5, 4, 4);
		}
	}
	// ---------------------------------------------------------------- beta v11: quests + play types (src/game/quests11.ts)
	let q11 = freshQ11();
	let q11Spots = new Map();
	const q11Latch = new Set();
	/** "winter" | "endless" | "watch" while one of the v11 start-menu modes runs. */
	let mode11 = null;
	let m11 = null;
	let fishGame = null;
	let fishForce = null;
	let caravanForce = null;
	let escortBodies = null;
	let ripples = [];
	const Q11C = () => ({ snowDone: snow >= 3, ferry: q10.ferry >= 3, jack: jackMet || jackTrust > 0, radio: q10.radio >= 3 });
	function curDay() {
		return Math.floor(clock / DAY_LENGTH_SEC);
	}
	function seasonNow() {
		return seasonOf(curDay(), q11.seasonDay);
	}
	function q11Spot(key) {
		if (key.startsWith("npc:")) {
			const n = world?.npcs.find((m) => m.role === key.slice(4));
			return n ? { x: n.x + 30, y: n.y + 40 } : farmCenter();
		}
		if (key === "farmBike") { const b = world?.props.find((p) => p.farmBike); if (b) { const c = propCenter(b); return { x: c.x + 40, y: c.y + 30 }; } }
		if (!q11Spots.has(key)) { const s = Q11_SITES[key]; q11Spots.set(key, q10Tile(s.tx, s.ty)); }
		return q11Spots.get(key);
	}
	function siteMap(key) {
		return key.startsWith("npc:") ? 0 : Q11_SITES[key]?.map ?? 0;
	}
	function q11St(id) {
		if (!q11.q[id]) q11.q[id] = { s: 0, left: 0 };
		return q11.q[id];
	}
	function q11Cur(q) {
		const st = q11.q[q.id];
		return st && st.s >= 1 && st.s <= q.steps.length ? q.steps[st.s - 1] : null;
	}
	function q11Spawn(spec, spot, tag, aggro) {
		if (!world) return null;
		const [kind, variant, name, hp, atk, xp] = spec;
		let x = spot.x, y = spot.y;
		const t = tileOf(x, y);
		if (cellBlocked(world, t.tx, t.ty)) { const s = q10Tile(t.tx - WORLD_OX, t.ty - WORLD_OY); x = s.x; y = s.y; }
		const e = { id: q11.nextId++, x, y, homeX: x, homeY: y, hp, maxHp: hp, atk, xp, elite: hp >= 40, quest: false, kind, pack: 70, temper: "hostile", crippleArm: 0, crippleLeg: 0, dir: 0, frame: 0, anim: 0, cooldown: 0, path: null, pathT: 0, aggro, dead: false, hurt: 0, slow: 0, death: 0, q11: tag };
		if (variant) e.variant = variant;
		if (name) e.name = name;
		world.enemies.push(e);
		return e;
	}
	/** Foes for a fight/ambush step: around the site, or in a ring around you for an ambush. */
	function q11SpawnFoes(q, step, count) {
		const around = step.kind === "ambush" ? { x: player.x, y: player.y } : q11Spot(step.site);
		const foes = step.foes.slice(step.foes.length - count);
		foes.forEach((f, i) => {
			const a = i / foes.length * Math.PI * 2 + .4;
			const r = step.kind === "ambush" ? 6 * TILE : (i === 0 ? 0 : 2.2 * TILE);
			q11Spawn(f, { x: around.x + Math.cos(a) * r, y: around.y + Math.sin(a) * r }, q.id, step.kind === "ambush");
		});
	}
	function q11Begin(q) {
		const step = q11Cur(q);
		const st = q11St(q.id);
		st.left = 0;
		st.sp = false;
		if (!step) return;
		if (step.kind === "ambush" && siteMap(step.site) === mapId) {
			st.left = step.foes.length; st.sp = true;
			q11SpawnFoes(q, step, st.left);
			pushLog(step.log);
			sfx("hit");
		}
		if (step.kind === "escort") q11Escort(true);
	}
	function q11Advance(q, line) {
		const st = q11St(q.id);
		if (line) pushLog(line);
		st.s += 1;
		const n = q.steps.length;
		if (st.s === n + 1) pushLog(`${q.title}: go back to ${GIVER_NAME[q.giver] ?? q.giver}.`);
		q11Begin(q);
		if (!q.steps.some((s, i) => s.kind === "escort" && i === st.s - 1)) escortBodies = q11EscortActive() ? escortBodies : null;
		saveGame();
		sync(true);
	}
	function q11EscortActive() {
		return Q11.some((q) => q11Cur(q)?.kind === "escort");
	}
	function q11Escort(on) {
		if (!on || !player) { escortBodies = null; return; }
		if (escortBodies) return;
		const mk = (role, ox, oy) => { const n = world?.npcs.find((m) => m.role === role); return { role, name: n?.name ?? role, x: player.x + ox, y: player.y + oy, dir: 0, frame: 0, anim: 0, still: true, ox, oy }; };
		escortBodies = [mk("cyndal", -48, 36), mk("loki", 40, 52)];
	}
	/** World build: find sites, dress the farm, put live quest foes back. */
	function q11World() {
		q11Spots = new Map();
		q11Latch.clear();
		ripples = [];
		if (!world) return;
		if (mapId === 0) q11FarmProps();
		v13World();
		for (const q of Q11) {
			const step = q11Cur(q);
			const st = q11.q[q.id];
			if (!step || !st) continue;
			if ((step.kind === "fight" || step.kind === "ambush") && st.sp && st.left > 0 && siteMap(step.site) === mapId && player) q11SpawnFoes(q, step, st.left);
		}
		escortBodies = null;
		if (q11EscortActive()) q11Escort(true);
		if (q11.hunt) q11.hunt = null;
	}
	function q11FarmProps() {
		return; // v15.9.5: the old bike and farm works are in Harmony now
		if (!world.props.some((p) => p.farmBike)) {
			const s = Q11_SITES.farmBike;
			const tx0 = s.tx + WORLD_OX, ty0 = s.ty + WORLD_OY;
			outer: for (let r = 0; r < 5; r++) for (let y = ty0 - r; y <= ty0 + r; y++) for (let x = tx0 - r; x <= tx0 + r; x++) {
				if (Math.max(Math.abs(x - tx0), Math.abs(y - ty0)) !== r) continue;
				if (addProp(world, "bike", x, y, { q11: true, farmBike: true })) break outer;
			}
		}
		const fc = farmCenter();
		const ft = tileOf(fc.x, fc.y);
		if (false) FARM_UPGRADES.forEach((u, i) => {
			for (let l = 0; l < q11.farm[u.id]; l++) {
				const tx0 = ft.tx - 6 + l * 2, ty0 = ft.ty + 5 + i * 2;
				for (let r = 0; r < 3; r++) for (let y = ty0 - r; y <= ty0 + r; y++) for (let x = tx0 - r; x <= tx0 + r; x++) {
					if (Math.max(Math.abs(x - tx0), Math.abs(y - ty0)) !== r) continue;
					if (addProp(world, u.prop, x, y, { q11: true })) { r = 9; y = 1e9; break; }
				}
			}
		});
	}
	/** Markers for the v11 quests and play types on the current map (same shape as q10Targets). */
	function q11Targets() {
		const out = [];
		if (!world || !player || mode11) return out;
		for (const q of Q11) {
			const st = q11.q[q.id];
			if (!st || st.s < 1) continue;
			const n = q.steps.length;
			if (st.s === n + 1) {
				if (mapId === 0) { const g = world.npcs.find((m) => m.role === q.giver); if (g) out.push({ key: `q11npc-${q.id}`, x: g.x, y: g.y, mode: "npc", color: "#e0b070" }); }
				continue;
			}
			const step = q11Cur(q);
			if (!step || siteMap(step.site) !== mapId) continue;
			if ((step.kind === "fight" || step.kind === "ambush") && st.sp) {
				for (const e of world.enemies) if (!e.dead && e.q11 === q.id) out.push({ key: `q11foe-${e.id}`, x: e.x, y: e.y, mode: "mark", color: "#d0644a" });
				continue;
			}
			const s = q11Spot(step.site);
			const mode = step.kind === "take" ? "talk" : step.kind === "fight" ? "arrive" : "arrive";
			out.push({ key: `q11-${q.id}-${st.s}`, x: s.x, y: s.y, mode, color: "#e0b070", q: q.id, step });
		}
		if (mapId === 0 && snow >= 3) for (const k of FISH_SITES) { const s = q11Spot(k); out.push({ key: `fish-${k}`, x: s.x, y: s.y, mode: "talk", color: "#6fb7d8", fish: k }); }
		if (q11.hunt) for (const e of world.enemies) if (!e.dead && e.q11 === "hunt") out.push({ key: `hunt-${e.id}`, x: e.x, y: e.y, mode: "mark", color: "#d89a5a" });
		return out;
	}
	function q11Step(dt) {
		if (!world || !player || inside || phase !== "play") return;
		// Cyndal and Loki walk at your heels on an escort (they never carry guns)
		if (escortBodies) for (const b of escortBodies) {
			const tx = player.x + b.ox, ty = player.y + b.oy;
			const d = Math.hypot(tx - b.x, ty - b.y);
			b.still = d < 20;
			if (d > 700) { b.x = tx; b.y = ty; }
			else if (!b.still) {
				const sp = Math.min(d, (d > 160 ? 300 : 190) * dt);
				b.dir = facing8(tx - b.x, ty - b.y);
				b.x += (tx - b.x) / d * sp; b.y += (ty - b.y) / d * sp;
				b.anim += sp; b.frame = Math.floor(b.anim / 22) % 4;
			}
		}
		q11Daily();
		v13Tick(dt);
		q11Season(dt);
		q11HuntStep();
		if (dialogue) return;
		for (const t of q11Targets()) {
			if (t.mode === "mark" || t.mode === "npc") continue;
			const d = Math.hypot(t.x - player.x, t.y - player.y);
			const r = t.fish ? 1.4 * TILE : t.step?.kind === "fight" ? 6 * TILE : t.mode === "arrive" ? 2.2 * TILE : 1.4 * TILE;
			if (d > r + TILE * 2) q11Latch.delete(t.key);
			if (d > r || q11Latch.has(t.key)) continue;
			q11Latch.add(t.key);
			if (t.fish) { q11OpenFish(t.fish); return; }
			const q = questById(t.q), step = t.step, st = q11St(q.id);
			if (step.kind === "go") q11Advance(q, step.log);
			else if (step.kind === "escort") {
				if (escortBodies && escortBodies.every((b) => Math.hypot(b.x - player.x, b.y - player.y) < 5 * TILE)) q11Advance(q, step.log);
				else { q11Latch.delete(t.key); continue; }
			} else if (step.kind === "fight" && !st.sp) {
				st.sp = true; st.left = step.foes.length;
				q11SpawnFoes(q, step, st.left);
				for (const e of world.enemies) if (e.q11 === q.id && !e.dead) e.aggro = true;
				pushLog(step.log); sfx("hit"); saveGame(); sync(true);
			} else if (step.kind === "take") {
				dialogue = { speaker: step.take.speaker, text: step.take.text, choices: [{ label: step.take.label, id: `q11-take-${q.id}` }, { label: "Not yet", id: "close" }] };
				talkNpc = null; phase = "dialogue"; intent = null; sfx("talk"); sync(true);
			}
			return;
		}
	}
	function q11Kill(enemy) {
		if (!enemy.q11) return;
		if (enemy.q11 === "hunt") { q11HuntDone(enemy); return; }
		if (enemy.q11 === "caravan") { q11CaravanKill(); return; }
		if (enemy.q11 === "watch") { if (m11) m11.caught += 1; return; }
		const q = questById(enemy.q11);
		const step = q && q11Cur(q);
		if (!q || !step || (step.kind !== "fight" && step.kind !== "ambush")) return;
		const st = q11St(q.id);
		st.left = Math.max(0, st.left - 1);
		if (st.left <= 0) { st.sp = false; q11Advance(q, enemy.variant === "grok" ? "The Grok goes down like a falling hemlock. You cut a claw off it, long as a hay knife." : "That's the last of them."); }
		else sync(true);
	}
	// -------- daily ticks: farm yield, traps, season
	function q11Daily() {
		const day = curDay();
		if (q11.farm.lastDay === day) return;
		const first = q11.farm.lastDay < 0;
		q11.farm.lastDay = day;
		if (first || mode11 === "endless" || mode11 === "watch") return;
		const f = q11.farm, mult = SEASON_CROP[seasonNow()];
		const got = [];
		if (false && f.plots && mult) { const n = f.plots * mult + Math.floor(lv("farming") / 2); giveItem("apple", n); got.push(`${n} apples and potatoes`); train("farming", 4 + f.plots); }
		if (false && f.coop && day % 2 === 0) { giveItem("pork", f.coop); got.push(`${f.coop} hen${f.coop > 1 ? "s" : ""} for the pot`); }
		if (false && f.smoke) { const meat = player.bag.find((s) => s.id === "meat")?.qty ?? 0; const n = Math.min(meat, f.smoke); if (n) { takeItem("meat", n); giveItem("jerky", n * 2); got.push(`${n * 2} jerky from the smokehouse`); } }
		if (got.length) { f.harvest += 1; pushLog(`Morning at the farm: ${got.join(", ")}.`); }
		for (const trap of q11.traps) if (day > trap.day && !trap.caught) { trap.caught = trapRoll(trap); if (!trap.caught) { trap.day = day; } }
		if (q11.traps.some((t) => t.caught)) pushLog("Something's in one of your traps. Go check it.");
		v3Daily(day);

	}
	function takeItem(id, n) {
		const s = player?.bag.find((b) => b.id === id);
		if (!s) return false;
		s.qty -= n;
		if (s.qty <= 0) player.bag = player.bag.filter((b) => b !== s);
		refreshGear(player);
		return true;
	}
	let coldAcc = 0;
	function q11Season(dt) {
		// winter nights bite away from a fire
		if (seasonNow() !== 3 || mode11 === "winter") return;
		const here = tileOf(player.x, player.y);
		if (nightDark(clock) < .3 || inFarm(here.tx, here.ty)) { coldAcc = 0; return; }
		coldAcc += dt;
		if (coldAcc > 8) { coldAcc = 0; player.hp = Math.max(1, player.hp - 1); pushLog("The cold's getting into you. Get to a fire."); }
	}
	// -------- hunting trips
	function q11HuntStart(kind) {
		const wind = Math.floor(Math.random() * 8);
		q11.hunt = { kind, wind, on: true };
		const spec = kind === "moose" ? ["moose", null, "Bull moose", 52, 10, 22] : kind === "bear" ? ["wolf", "bear", "Black bear", 58, 9, 26] : ["deer", null, "Whitetail buck", 26, 3, 10];
		let spot = null;
		for (let k = 0; k < 8 && !spot; k++) {
			const a = Math.random() * Math.PI * 2;
			const s = { x: player.x + Math.cos(a) * 16 * TILE, y: player.y + Math.sin(a) * 16 * TILE };
			const t = tileOf(s.x, s.y);
			if (t.tx > 4 && t.ty > 4 && t.tx < 150 && t.ty < 150) spot = s;
		}
		const e = q11Spawn(spec, spot ?? { x: player.x + 10 * TILE, y: player.y }, "hunt", false);
		if (e) e.temper = kind === "bear" ? "hostile" : "wary";
		pushLog(`Hunting trip: a ${kind === "bear" ? "black bear" : kind === "moose" ? "bull moose" : "whitetail"} is out there. Wind's out of the ${COMPASS8[wind]}. Come at it with the wind in your face.`);
		return e;
	}
	/** Unit vector the wind blows toward, in world space (wind "out of the N" blows toward screen-south). */
	function windVec(w) {
		const a = (w * 45 - 90) * Math.PI / 180;
		const sx = -Math.cos(a), sy = -Math.sin(a);
		const vx = sy + sx / 2, vy = sy - sx / 2, L = Math.hypot(vx, vy) || 1;
		return { x: vx / L, y: vy / L };
	}
	function q11HuntStep() {
		if (!q11.hunt) return;
		const prey = world.enemies.find((e) => !e.dead && e.q11 === "hunt");
		if (!prey) { q11.hunt = null; return; }
		const dx = prey.x - player.x, dy = prey.y - player.y, d = Math.hypot(dx, dy);
		const w = windVec(q11.hunt.wind);
		const downwind = (dx * w.x + dy * w.y) / (d || 1) > .55;
		if (q11.hunt.kind !== "bear" && downwind && d < 11 * TILE && d > 2 * TILE) {
			prey.dead = true; prey.death = 0;
			q11.hunt = null;
			pushLog("It threw its head up, got your scent on the wind, and it's gone. Try again, and mind the wind.");
			sfx("click");
			sync(true);
		}
	}
	function q11HuntDone(e) {
		const kind = q11.hunt?.kind ?? "deer";
		q11.hunt = null;
		if (kind === "moose") { giveItem("meat", 4); giveItem("hide", 1); }
		else if (kind === "bear") { giveItem("meat", 3); giveItem("pelt", 1); }
		else { giveItem("meat", 2); giveItem("hide", 1); }
		pushLog(`Hunting trip: done. You dress out the ${e.name?.toLowerCase() ?? "animal"} and pack the meat home.`);
		saveGame();
		sync(true);
	}
	// -------- fishing
	function q11OpenFish(site) {
		const ice = seasonNow() === 3 && FISH_WATER[site] !== "river";
		if (seasonNow() === 3 && FISH_WATER[site] === "river") { dialogue = { speaker: Q11_SITES[site].name, text: "The Kennebec runs open in the riffles all winter. Cold hands, but the trout are in there.", choices: [{ label: "Wet a line", id: `q11-fish-cast-${site}` }, { label: "Leave it", id: "close" }] }; talkNpc = null; phase = "dialogue"; intent = null; sfx("talk"); sync(true); return; }
		dialogue = { speaker: Q11_SITES[site].name, text: ice ? "Ice thick enough to stand on. Chop a hole, drop a line." : "Dark water, slow at the edge. Good spot for a line.", choices: [{ label: ice ? "Chop a hole and fish" : "Wet a line", id: `q11-fish-cast-${site}` }, { label: "Leave it", id: "close" }] };
		talkNpc = null; phase = "dialogue"; intent = null; sfx("talk"); sync(true);
	}
	function fishPos() {
		if (!fishGame) return 0;
		return .5 + .5 * Math.sin((performance.now() - fishGame.t0) / 1000 * fishGame.speed * Math.PI);
	}
	const FISH_PER_DAY = 3;
	/** v13: water type per fishing site. Ice fishing on the ponds in winter; the river runs open. */
	const FISH_WATER = { fishKennebec: "river", fishPond: "lake", fishHoleb: "lake" };
	function fishWater(site) {
		const w = FISH_WATER[site] ?? "lake";
		return w === "lake" && seasonNow() === 3 ? "ice" : w;
	}
	function q11FishHook() {
		const p = fishPos();
		const hit = fishForce ?? (p >= fishGame.zone && p <= fishGame.zone + (fishGame.width ?? .2));
		const water = fishGame.water ?? "lake";
		fishGame = null;
		if (!hit) { pushLog("You yank too soon. It spits the hook."); return; }
		q11.fish.caught += 1;
		if (q11.fish.day !== curDay()) { q11.fish.day = curDay(); q11.fish.today = 0; }
		q11.fish.today = (q11.fish.today ?? 0) + 1;
		train("fishing", 6);
		w13.lastFish = water;
		if (Math.random() < .12 * (perk13("fishing", 6) ? 2 : 1)) { q11.fish.rare += 1; giveItem("smokedfish", 3); pushLog(water === "river" ? "A brook trout as long as your arm, red-bellied. That's a fish they'll talk about at the store." : water === "ice" ? "A togue, a lake trout, up through the ice. A monster." : "A landlocked salmon, jumping. That's a fish they'll talk about at the store."); }
		else if (water === "river") { giveItem("trout", 1); pushLog("A brook trout out of the riffle. Supper."); }
		else { giveItem("smokedfish", 1); pushLog(water === "ice" ? "A yellow perch through the ice. Supper." : "A fat pickerel on the line. Supper."); }
		sfx("level");
	}
	function paintFish() {
		if (!fishGame) return;
		const w = Math.min(420, viewW - 40), x = (viewW - w) / 2, y = viewH * .22;
		ctx.save();
		ctx.fillStyle = "rgba(20,24,28,.82)"; ctx.fillRect(x - 8, y - 30, w + 16, 58);
		ctx.fillStyle = "#3b4a52"; ctx.fillRect(x, y, w, 18);
		ctx.fillStyle = "#5fae5a"; ctx.fillRect(x + fishGame.zone * w, y, (fishGame.width ?? .2) * w, 18);
		ctx.fillStyle = "#f2e6c8"; ctx.fillRect(x + fishPos() * w - 3, y - 6, 6, 30);
		ctx.font = "600 14px sans-serif"; ctx.fillText("Set the hook when the bobber's in the green", x, y - 12);
		ctx.restore();
	}
	// -------- trade caravan to Bangor
	function q11CaravanAmbush(home) {
		const r = CARAVAN_ROUTES[q11.route];
		const hit = caravanForce ?? Math.random() < r.risk;
		if (!hit) return false;
		q11.caravan = home ? 4 : 2;
		const spec = r.foe === "coyote" ? ["coyote", null, "Coyote", 13, 4, 6] : ["bandit", "scout", "Road agent", 18, 4, 9];
		for (let i = 0; i < 3; i++) { const a = i * 2.1; q11Spawn(spec, { x: player.x + Math.cos(a) * 6 * TILE, y: player.y + Math.sin(a) * 6 * TILE }, "caravan", true); }
		pushLog(home ? "Coming home, a tree's dropped across the road. That's no accident. Here they come." : "Halfway down, somebody steps out of the alders and grabs the horse's bridle. Ambush!");
		sfx("hit");
		return true;
	}
	function q11CaravanKill() {
		if (world.enemies.some((e) => !e.dead && e.q11 === "caravan")) return;
		if (q11.caravan === 2) { q11.caravan = 3; pushLog("The road's clear. On to Bangor."); q11Market(); }
		else if (q11.caravan === 4) q11CaravanHome();
	}
	function q11Market() {
		dialogue = {
			speaker: "Bangor market",
			text: `Stalls along Main Street under the old Paul Bunyan statue. Folks trading out of their sleds. You've got ${player.scrap} iron.`,
			choices: [
				{ label: "Sell a pelt (5 iron)", id: "q11-sell-pelt" },
				{ label: "Sell a hide (3 iron)", id: "q11-sell-hide" },
				{ label: "Sell a jar of syrup (6 iron)", id: "q11-sell-syrup" },
				{ label: "Sell a bone (1 iron)", id: "q11-sell-bone" },
				{ label: "Buy 8 shells (10 iron)", id: "q11-buy-shells" },
				{ label: "Buy a fuel can (10 iron)", id: "q11-buy-fuel" },
				{ label: "Buy 2 cans of gas (8 iron)", id: "q11-buy-gas" },
				{ label: "Head home", id: "q11-car-home" },
			],
		};
		phase = "dialogue"; sync(true);
	}
	function q11CaravanHome() {
		q11.caravan = 0; q11.trips += 1;
		clock += DAY_LENGTH_SEC * .25 * CARAVAN_ROUTES[q11.route].days;
		pushLog(`The cart rolls back into the yard at Cambridge Road. Trade caravan trips: ${q11.trips}.`);
		grantXp(16);
		saveGame();
		sync(true);
	}
	// -------- start-menu modes
	function q11StartMode(kind) { void kind; } // v15.9.5: Winter Survival / Night Watch / Endless were removed; story game only
	function q11EndMode(won, why) {
		const kind = mode11;
		if (!kind) return;
		let result;
		if (kind === "winter") result = { mode: kind, title: won ? "Spring came" : "Winter won", lines: [why, `Days survived: ${Math.max(0, curDay() - m11.day0)} of ${m11.days}`, `Meals eaten: ${m11.ate}`] };
		else if (kind === "watch") result = { mode: kind, title: m11.hens > 0 ? "Dawn at Cambridge Road" : "The hens are gone", lines: [why, `Prowlers caught: ${m11.caught}`, `Hens lost: ${m11.lost} of 6`] };
		else {
			const score = m11.score ?? 0;
			const best = Math.max(score, m11.best || 0);
			localStorage.setItem("maine-rpg-endless-best", String(best));
			result = { mode: kind, title: "The farm fell", lines: [why, `Waves held: ${m11.waves ?? 0} · Raiders down: ${m11.kills ?? 0}`, `Score: ${score}`, `Best: ${best}${score >= best && score > 0 ? " (new best!)" : ""}`], score, best };
		}
		mode11 = null; m11 = null; fishGame = null; ripples = [];
		useModeResult.setState({ result });
		phase = "menu"; dialogue = null; buildOpen = false;
		sfx(won ? "level" : "die");
		sync(true);
	}
	/** Runs every frame before anything else. */
	function q11ModeTick(dt) {
		if (!mode11 || !player || !world) return;
		if (phase === "menu") { mode11 = null; m11 = null; return; }
		if (mode11 === "endless") {
			const span = DAY_LENGTH_SEC;
			const into = ((clock % span) + span) % span;
			if (into < span * 21 / 24 && into > span * 6 / 24) clock = Math.floor(clock / span) * span + span * 22 / 24;
			if (into < span * 6 / 24) clock = Math.floor(clock / span) * span - span * 2 / 24;
			return;
		}
		if (phase === "dead") { m11.deadT = (m11.deadT || 0) + dt; if (m11.deadT > 1.6) q11EndMode(false, mode11 === "winter" ? "The cold took you before the thaw." : "They got the drop on you in the dark."); return; }
		if (phase !== "play") return;
		m11.t += dt;
		const here = tileOf(player.x, player.y);
		if (mode11 === "winter") {
			clock += dt * 3;
			const fh = world.props.find((p) => p.kind === "farmhouse");
			const warm = inside || world.props.some((p) => FIRES[p.kind] && Math.hypot(propCenter(p).x - player.x, propCenter(p).y - player.y) < 200) || (fh && Math.hypot(propCenter(fh).x - player.x, propCenter(fh).y - player.y) < 220);
			const night = nightDark(clock) > .3;
			m11.warmth = Math.max(0, Math.min(100, m11.warmth + (warm ? 10 : night ? -1.6 : -.7) * dt));
			m11.food = Math.max(0, m11.food - .45 * dt);
			if (m11.food < 35) {
				const meal = ["stew", "meat", "jerky", "pork", "smokedfish", "apple", "donut", "cider"].find((id) => carrying(id));
				if (meal) { takeItem(meal, 1); m11.food = Math.min(100, m11.food + 40); m11.ate += 1; pushLog(`You eat ${GEAR[meal]?.name?.toLowerCase() ?? "something"}. Food ${Math.round(m11.food)}.`); }
			}
			if (m11.warmth <= 0 || m11.food <= 0) { player.hp -= 1.5 * dt; if (player.hp <= 0) { player.hp = 0; phase = "dead"; sync(true); } }
			if (curDay() >= m11.day0 + m11.days) q11EndMode(true, "The eaves are dripping and the brook's running under the ice. You made it to spring.");
			return;
		}
		if (mode11 === "watch") {
			const fc = farmCenter();
			const hens = { x: fc.x + 3 * TILE, y: fc.y + 3 * TILE };
			const lamp = carrying("lantern") ? 290 : 170;
			m11.spawnT -= dt;
			if (m11.spawnT <= 0 && m11.spawned < 9) {
				m11.spawnT = 12 + Math.random() * 6;
				m11.spawned += 1;
				const a = Math.random() * Math.PI * 2;
				q11Spawn(["bandit", "scout", "Prowler", 16, 4, 8], { x: hens.x + Math.cos(a) * 15 * TILE, y: hens.y + Math.sin(a) * 15 * TILE }, "watch", false);
			}
			for (const e of world.enemies) {
				if (e.dead || e.q11 !== "watch") continue;
				const dp = Math.hypot(e.x - player.x, e.y - player.y);
				if (!e.aggro && dp < lamp) { e.aggro = true; pushLog("There! In the lantern light, a man by the woodpile."); }
				if (e.aggro) continue;
				const dx = hens.x - e.x, dy = hens.y - e.y, d = Math.hypot(dx, dy);
				if (d < 70) { e.dead = true; e.death = 0; m11.lost += 1; m11.hens -= 1; pushLog(`A hen squawks and goes quiet. ${m11.hens} left.`); continue; }
				const sp = 62 * dt;
				e.x += dx / d * sp; e.y += dy / d * sp; e.homeX = e.x; e.homeY = e.y; e.dir = facing8(dx, dy); e.anim += sp;
				e.rip = (e.rip || 0) - dt;
				if (e.rip <= 0) { e.rip = 1.1; ripples.push({ x: e.x, y: e.y, t: 0 }); }
			}
			ripples = ripples.filter((r) => (r.t += dt) < 1.6);
			if (m11.hens <= 0) q11EndMode(false, "The last hen's gone over the fence in a sack.");
			else if (m11.t >= m11.dur) q11EndMode(true, "Grey light over the orchard. The prowlers have gone to ground.");
		}
	}
	function paintRipples(dcx, dcy) {
		if (!ripples.length) return;
		ctx.save();
		for (const r of ripples) {
			const raw = worldToScreen(r.x, r.y, dcx, dcy);
			const p = zoomPoint(raw.sx, raw.sy);
			const k = r.t / 1.6;
			ctx.globalAlpha = .7 * (1 - k);
			ctx.strokeStyle = "#cfe4ff";
			ctx.lineWidth = 2;
			ctx.beginPath(); ctx.ellipse(p.sx, p.sy, (14 + 70 * k) * zoom, (7 + 35 * k) * zoom, 0, 0, Math.PI * 2); ctx.stroke();
		}
		ctx.restore();
	}
	function paintSeason() {
		const tint = mode11 === "winter" ? SEASON_TINT[3] : SEASON_TINT[seasonNow()];
		if (!tint || !world || mapId > 1) return;
		ctx.save(); ctx.fillStyle = tint; ctx.fillRect(0, 0, viewW, viewH); ctx.restore();
	}
	function q11HudText() {
		if (mode11 === "winter" && m11) return `Winter Survival · Day ${Math.min(m11.days, curDay() - m11.day0 + 1)} of ${m11.days} · Warmth ${Math.round(m11.warmth)} · Food ${Math.round(m11.food)}`;
		if (mode11 === "watch" && m11) return `Night Watch · Dawn in ${Math.max(0, Math.ceil(m11.dur - m11.t))}s · Hens ${m11.hens} · Caught ${m11.caught}`;
		if (q11.caravan === 2 || q11.caravan === 4) return "Trade caravan: ambush! Drive them off the cart.";
		if (q11.hunt) return `Hunting trip: ${q11.hunt.kind}. Wind out of the ${COMPASS8[q11.hunt.wind]}.`;
		return "";
	}
	function q11JournalExtra() {
		const out = [];
		return out; // v15.9.5: the farm ledger lives in Harmony
		const f = q11.farm;
		out.push({ id: "q11-season", title: `${SEASONS[seasonNow()]} at Cambridge Road`, done: false, text: `Day ${curDay() + 1}. Farm: potato plots ${f.plots}, coop ${f.coop}, stone wall ${f.wall}, smokehouse ${f.smoke}. Fish caught ${q11.fish.caught}${q11.fish.rare ? ` (${q11.fish.rare} rare)` : ""}. Caravan trips ${q11.trips}.${q11.traps.length ? ` Snares set: ${q11.traps.length}.` : ""}` });
		return out;
	}
	/** Farm talk options for the play types. */
	function q11FarmChoices(role) {
		if (snow < 3 || mode11) return [];
		if (role === "sarah") return [{ label: "Work on the farm", id: "q11-farm" }, { label: "Go on a hunting trip", id: "q11-hunt" }, ...(q11.caravan === 0 ? [{ label: "Take the cart to Bangor", id: "q11-caravan" }] : [])];
		return [];
	}
	function q11Choice(id) {
		const openD = (d) => { dialogue = d; phase = "dialogue"; sfx("click"); sync(true); return true; };
		const close = () => { dialogue = null; phase = "play"; sync(true); return true; };
		let m;
		if ((m = id.match(/^q11-ask-(.+)$/))) { const q = questById(m[1]); return q ? openD(q11Ask(q)) : false; }
		if ((m = id.match(/^q11-accept-(.+)$/))) {
			const q = questById(m[1]); const st = q && q11St(q.id);
			if (q && st.s === 0) { st.s = 1; pushLog(`${q.title}: ${q.steps[0].hud}`); q11Begin(q); saveGame(); }
			return false;
		}
		if ((m = id.match(/^q11-take-(.+)$/))) {
			const q = questById(m[1]); const step = q && q11Cur(q);
			if (step?.kind === "take") {
				const missing = (step.need ?? []).filter((id) => !carrying(id));
				if (missing.length) { pushLog(`Still missing: ${missing.map((id) => GEAR[id]?.name ?? id).join(", ")}.`); dialogue = null; phase = "play"; sync(true); return true; }
				if (step.cost && player.scrap < step.cost) { pushLog(`Not enough iron. That's ${step.cost}.`); dialogue = null; phase = "play"; sync(true); return true; }
				if (step.cost) player.scrap -= step.cost;
				for (const id of step.need ?? []) takeItem(id, 1);
				for (const [it, n] of step.give ?? []) giveItem(it, n);
				dialogue = null; phase = "play"; q11Advance(q, step.log); return true;
			}
			return false;
		}
		if ((m = id.match(/^q11-done-(.+)$/))) {
			const q = questById(m[1]); const st = q && q11St(q.id);
			if (q && st.s === q.steps.length + 1) {
				st.s += 1;
				for (const [it, n] of q.reward) giveItem(it, n);
				if (q.iron) player.scrap += q.iron;
				grantXp(q.xp); shiftRep("ponds", 2, 6);
				pushLog(`${q.title}: done. ${q.after}`);
				if (q.id === "bike") { achieve("bike"); train("mechanics", 20); }
				v13SideQuestDone(q.id);
				if (q.id === "meds") achieve("meds");
				for (const area of [0, 1, 2]) {
					const list = Q11.filter((x) => x.steps.every((st) => siteMap(st.site) === area || st.site.startsWith("npc:")) && x.steps.some((st) => siteMap(st.site) === area && !st.site.startsWith("npc:")));
					if (list.length && list.every((x) => (q11.q[x.id]?.s ?? 0) >= x.steps.length + 2)) achieve("area");
				}
				sfx("level"); saveGame();
			}
			return false;
		}
		if (id === "q11-farm") return false; if (false) return openD({
			speaker: "Sarah", text: `What do you want to put up? You've got ${player.wood} wood, ${player.stone} stone and ${player.scrap} iron. It's ${SEASONS[seasonNow()].toLowerCase()}.`,
			choices: [{ label: "Bigger works: greenhouse, barrel, solar, lookout, palisade, cellar, workbench", id: "q113-works" }, ...FARM_UPGRADES.map((u) => ({ label: `${u.name} ${q11.farm[u.id]}/${u.max}: ${[u.wood && `${u.wood} wood`, u.stone && `${u.stone} stone`, u.iron && `${u.iron} iron`].filter(Boolean).join(", ")}`, id: `q11-build-${u.id}` })), { label: "Never mind", id: "close" }],
		});
		if ((m = id.match(/^q11-build-(.+)$/))) {
			const u = FARM_UPGRADES.find((x) => x.id === m[1]);
			if (!u) return false;
			if (q11.farm[u.id] >= u.max) pushLog(`The ${u.name.toLowerCase()} is as big as it's getting.`);
			else if (player.wood < u.wood || player.stone < u.stone || player.scrap < u.iron) pushLog(`Not enough for the ${u.name.toLowerCase()}.`);
			else {
				player.wood -= u.wood; player.stone -= u.stone; player.scrap -= u.iron;
				q11.farm[u.id] += 1;
				q11FarmProps();
				pushLog(`You put up the ${u.name.toLowerCase()}. ${u.blurb}`);
				sfx("build"); saveGame();
			}
			return q11Choice("q11-farm");
		}
		if (id === "q11-hunt" && q11.huntDay === curDay()) return openD({ speaker: "Sarah", text: "You've been out once today. Let the woods settle. Tomorrow.", choices: [{ label: "All right", id: "close" }] });
		if (id === "q11-hunt") return openD({ speaker: "Sarah", text: "Short trip or long? Mind the wind. If it's at your back they'll smell you a quarter mile off.", choices: [{ label: "Deer in the cutover", id: "q11-hunt-deer" }, { label: "Moose in the alders", id: "q11-hunt-moose" }, { label: "Bear up on the ridge", id: "q11-hunt-bear" }, { label: "Not today", id: "close" }] });
		if ((m = id.match(/^q11-hunt-(deer|moose|bear)$/))) { close(); q11.huntDay = curDay(); q11HuntStart(m[1]); return true; }
		if (id === "q11-caravan") return openD({ speaker: "Sarah", text: "Bangor's a long day with the cart. Which way? Route 2's quick but there's road agents. The river road's slower and quieter. The back roads are coyote country.", choices: [...CARAVAN_ROUTES.map((r, i) => ({ label: r.label, id: `q11-car-route-${i}` })), { label: "Not today", id: "close" }] });
		if ((m = id.match(/^q11-car-route-(\d)$/))) {
			q11.route = Number(m[1]); q11.caravan = 1;
			pushLog(`You hitch the cart and take ${CARAVAN_ROUTES[q11.route].label.split(" (")[0].toLowerCase()} for Bangor.`);
			close();
			if (!q11CaravanAmbush(false)) { q11.caravan = 3; q11Market(); }
			return true;
		}
		const sell = { "q11-sell-pelt": ["pelt", 5], "q11-sell-hide": ["hide", 3], "q11-sell-syrup": ["syrup", 6], "q11-sell-bone": ["bone", 1] }[id];
		if (sell && q11.caravan === 3) { if (takeItem(sell[0], 1)) { player.scrap += sell[1]; pushLog(`Sold. +${sell[1]} iron.`); sfx("click"); } else pushLog("You haven't got one to sell."); q11Market(); return true; }
		const buy = { "q11-buy-shells": ["shells", 8, 10], "q11-buy-fuel": ["fuel", 1, 10], "q11-buy-gas": ["gas", 2, 8] }[id];
		if (buy && q11.caravan === 3) { buy[2] = v3Price(buy[2]); train("barter", 3); if (player.scrap >= buy[2]) { player.scrap -= buy[2]; giveItem(buy[0], buy[1]); pushLog(`Bought. -${buy[2]} iron.`); } else pushLog("Not enough iron."); q11Market(); return true; }
		if (id === "q11-car-home" && q11.caravan === 3) { close(); if (!q11CaravanAmbush(true)) q11CaravanHome(); return true; }
		if ((m = id.match(/^q11-fish-cast-(.+)$/)) && q11.fish.day === curDay() && (q11.fish.today ?? 0) >= FISH_PER_DAY + (perk13("fishing", 3) ? 1 : 0)) {
			return openD({ speaker: "Fishing", text: "They've gone off the bite. Nothing's touching it. Try again tomorrow.", choices: [{ label: "Reel in", id: "q11-fish-stop" }] });
		}
		if ((m = id.match(/^q11-fish-cast-(.+)$/))) {
			fishGame = { t0: performance.now(), speed: (.7 + Math.random() * .5) * (fishWater(m[1]) === "river" ? 1.25 : fishWater(m[1]) === "ice" && !perk13("fishing", 9) ? .8 : 1), zone: .15 + Math.random() * .6, width: Math.min(.36, .2 + .02 * lv("fishing")), site: m[1], water: fishWater(m[1]) };
			return openD({ speaker: "Fishing", text: "The bobber rides the ripples. Wait for it to dip into the green, then set the hook.", choices: [{ label: "Set the hook!", id: "q11-fish-hook" }, { label: "Reel in", id: "q11-fish-stop" }] });
		}
		if (id === "q11-fish-hook" && fishGame) { q11FishHook(); close(); saveGame(); return true; }
		if (id === "q11-fish-stop") { fishGame = null; return close(); }
		return false;
	}
	// ================================================================ v11.3: achievements, trade skills, farm upgrades,
	// Skowhegan travel, tracks/wind/noise, traps + field dressing, Goose the dog.
	function freshV3() {
		const skills = {};
		for (const s of TRADE_SKILLS) skills[s.id] = { lv: 0, xp: 0 };
		const up = {};
		for (const u of FARM_UPGRADES2) up[u.id] = 0;
		return { ach: {}, skills, up, dog: { mode: "follow", hp: 30, down: -1, joined: false }, wind: 0, windDay: -1, stats: { tracks: 0, catches: 0, dressed: 0, gas: 0 }, toastN: 0 };
	}
	function loadV3(raw) {
		const b = freshV3();
		if (!raw || typeof raw !== "object") return b;
		return { ...b, ...raw, ach: { ...(raw.ach ?? {}) }, skills: { ...b.skills, ...(raw.skills ?? {}) }, up: { ...b.up, ...(raw.up ?? {}) }, dog: { ...b.dog, ...(raw.dog ?? {}) }, stats: { ...b.stats, ...(raw.stats ?? {}) } };
	}
	let v3 = freshV3();
	let v3Toast = null;
	function achieve(id) {
		const a = ACHIEVEMENTS.find((x) => x.id === id);
		if (!a || v3.ach[id] || mode11) return false;
		v3.ach[id] = Date.now();
		v3.toastN += 1;
		v3Toast = { id, name: a.name, text: a.text, n: v3.toastN };
		pushLog(`Achievement: ${a.name}. ${a.text}`);
		sfx("level");
		sync(true);
		return true;
	}
	function lv(id) {
		return 0; // v15.9.5: the 17 trade skills were removed
		let n = v3.skills[id]?.lv ?? 0;
		if (id === "hunting" && dogBody && q10.dog >= 4 && v3.dog.mode === "track") n += 2;
		return n;
	}
	function train(id, n) {
		return; // v15.9.5: no trade skills to train
		const s = v3.skills[id];
		if (!s || mode11 || s.lv >= SKILL_MAX) return;
		s.xp += n;
		while (s.lv < SKILL_MAX && s.xp >= skillNeed(s.lv)) {
			s.xp -= skillNeed(s.lv); s.lv += 1;
			const d = TRADE_SKILLS.find((x) => x.id === id);
			pushLog(`${d.name} is now ${s.lv}. ${d.perk}`);
			if (s.lv >= 5) achieve("skill5");
			sync(true);
		}
	}
	function v3Price(cost) {
		return Math.max(1, Math.round(cost * (1 - Math.min(.3, .03 * lv("barter") + (perk13("barter", 3) ? .05 : 0) + (perk13("barter", 9) ? .05 : 0)) - fx13().barterPct / 100 - (w13.rebuilt.store ? .1 : 0))));
	}
	// -------- farm upgrades
	function upCost(u, tier) {
		const t = u.tiers[tier];
		const cut = 1 - .04 * lv("carpentry");
		return { wood: Math.ceil(t.wood * cut), stone: Math.ceil(t.stone * cut), iron: t.iron, need: (t.need ?? []).filter(([, n]) => n > 0) };
	}
	function upLabel(u) {
		const tier = v3.up[u.id];
		if (tier >= u.tiers.length) return `${u.name}: done (${tier}/${u.tiers.length})`;
		const c = upCost(u, tier);
		const bits = [c.wood && `${c.wood} wood`, c.stone && `${c.stone} stone`, c.iron && `${c.iron} iron`, ...c.need.map(([id, n]) => `${n} ${GEAR[id]?.name.toLowerCase() ?? id}`)].filter(Boolean).join(", ");
		return `${u.name} ${tier}/${u.tiers.length}: ${bits} (${u.tiers[tier].effect})`;
	}
	function buildUpgrade(id) {
		const u = FARM_UPGRADES2.find((x) => x.id === id);
		if (!u || !player) return;
		const tier = v3.up[id];
		if (tier >= u.tiers.length) { pushLog(`The ${u.name.toLowerCase()} is as good as it gets.`); return; }
		const c = upCost(u, tier);
		if (player.wood < c.wood || player.stone < c.stone || player.scrap < c.iron || c.need.some(([it, n]) => (player.bag.find((s) => s.id === it)?.qty ?? 0) < n)) { pushLog(`Not enough for the ${u.name.toLowerCase()}. ${upLabel(u)}`); return; }
		player.wood -= c.wood; player.stone -= c.stone; player.scrap -= c.iron;
		for (const [it, n] of c.need) takeItem(it, n);
		v3.up[id] = tier + 1;
		train("carpentry", 12 + 6 * tier);
		pushLog(`You put up the ${u.name.toLowerCase()} (tier ${tier + 1}). ${u.tiers[tier].effect}`);
		achieve("upgrade");
		if (id === "palisade") achieve("palisade");
		if (id === "bench" && tier + 1 >= 2) achieve("forge");
		v3FarmProps();
		sfx("build"); saveGame(); sync(true);
	}
	/** Stand-in props for farm upgrades (art hook: public/game/v2/<art>.png via optional.json). */
	const UP_PROP = { greenhouse: ["shelter", 16, 6], barrel: ["crates", 10, -6], solar: ["stall", 14, -8], lookout: ["stand", -14, -10], palisade: ["fence", -16, 4], cellar: ["hatch", 12, 10], bench: ["workshop", -10, 12] };
	function v3FarmProps() {
		return; // v15.9.5: the farm (and its upgrade props) lives only in the Harmony town game
		if (!world || mapId !== 0) return;
		const fc = farmCenter();
		const ft = tileOf(fc.x, fc.y);
		for (const u of FARM_UPGRADES2) {
			if (!v3.up[u.id] || !UP_PROP[u.id] || world.props.some((p) => p.v3up === u.id)) continue;
			const [kind, dx, dy] = UP_PROP[u.id];
			outer: for (let r = 0; r < 6; r++) for (let y = ft.ty + dy - r; y <= ft.ty + dy + r; y++) for (let x = ft.tx + dx - r; x <= ft.tx + dx + r; x++) {
				if (Math.max(Math.abs(x - ft.tx - dx), Math.abs(y - ft.ty - dy)) !== r) continue;
				if (addProp(world, kind, x, y, { v3up: u.id, skin: u.art, built: true })) break outer;
			}
		}
	}
	function v3Daily(day) {
		if (!player || mode11) return;
		const got = [];
		const winter = seasonNow() === 3;
		if (false && v3.up.greenhouse) { const n = v3.up.greenhouse * 2; giveItem("greens", n); got.push(`${n} greens from the greenhouse${winter ? " (snow on the glass)" : ""}`); }
		if (false && v3.up.barrel) { giveItem("water", v3.up.barrel); got.push(`${v3.up.barrel} jug${v3.up.barrel > 1 ? "s" : ""} of rain water`); }
		if (false && v3.up.cellar) { giveItem("apple", v3.up.cellar); got.push(`${v3.up.cellar} potato${v3.up.cellar > 1 ? "es" : ""} from the cellar`); }
		if (got.length) pushLog(`Farm works: ${got.join(", ")}.`);
		if (v3.windDay !== day) { v3.windDay = day; v3.wind = Math.floor(Math.random() * 8); }
		if (curDay() - (q11.seasonDay || 0) >= SEASON_DAYS * 4) achieve("winter");
		if (v3.dog.down >= 0 && day >= v3.dog.down) { v3.dog.down = -1; v3.dog.hp = 30; v3.dog.mode = "stay"; pushLog("Goose's up and wagging at the farm again. Tell him to follow when you're ready."); if (mapId === 0) q10PlaceDog(); }
	}
	// -------- Skowhegan travel (map 2)
	function travelTo(target, arriveAt) {
		if (!world || !player) return;
		parkBike(false);
		const leaving = world.name;
		regions.set(mapId, captureRegion());
		mapId = target;
		world = createWorld(worldSeed, mapId, exitSides);
		applyRegion(regions.get(mapId));
		regions.delete(mapId);
		const spot = arriveAt ? arriveAt() : null;
		const arrive = world.gates[0];
		if (spot) { player.x = spot.x; player.y = spot.y; }
		else if (arrive) { player.x = arrive.arriveTx * 64 + 32; player.y = arrive.arriveTy * 64 + 32; }
		intent = null; work = null; holdWalk = false; inside = null; opening = null; travelLock = 1.6;
		q10World();
		spawnCrows();
		const land = tileOf(player.x, player.y);
		reveal(land.tx, land.ty, sightRadius(), true);
		pushLog(target >= 3 ? (target === 9 ? "You stop on the road." : `You come into ${world.name}.`) : target === 2 ? `Two hours down the old road from ${leaving}. Skowhegan: dead streetlights, the Kennebec loud in the gorge, and one bridge.` : `The road climbs out of the river valley. You come back into ${world.name}.`);
		if (target === 2) achieve("skow");
		camX = player.x - player.y - viewW / 2;
		camY = (player.x + player.y) * CAM_ISO_Y - viewH / 2;
		snapParty();
		landReturn();
		saveGame();
		sync(true);
	}
	function skowSign() {
		return q11Spot("skowRoad");
	}
	// -------- tracks, wind and noise
	function isGame(e) {
		return !e.dead && e.kind !== "bandit" && e.kind !== "squirrel";
	}
	function v3TrackTick(dt) {
		if (!world || !player) return;
		for (const e of world.enemies) {
			if (!isGame(e)) continue;
			// v14: only moose, deer and wolves leave prints; deer and moose a third as many as before, wolves half that again
			const wolf = e.kind === "wolf";
			if (e.kind !== "moose" && e.kind !== "deer" && !wolf) { if (e.trail) e.trail = null; continue; }
			const last = e.trail?.[e.trail.length - 1];
			if (!last || Math.hypot(e.x - last.x, e.y - last.y) > (wolf ? 276 : 138)) {
				(e.trail ??= []).push({ x: e.x, y: e.y, dir: e.dir || 0, t: clock });
				if (e.trail.length > (wolf ? 3 : 5)) e.trail.shift();
			}
		}
		// standing on fresh sign: remember whose
		for (const e of world.enemies) {
			if (!isGame(e) || !e.trail) continue;
			if (e.trail.some((p) => Math.hypot(p.x - player.x, p.y - player.y) < 34)) e.onTrail = clock;
			if (e.onTrail && !e.tracked && clock - e.onTrail < 40 && Math.hypot(e.x - player.x, e.y - player.y) < 190) {
				e.tracked = true; v3.stats.tracks += 1; train("hunting", 6);
				pushLog(`You followed the tracks right up to the ${e.name?.toLowerCase() || e.kind}.`);
				achieve("tracks");
			}
		}
	}
	function windVec3(w) {
		const a = (w * 45 - 90) * Math.PI / 180;
		return { x: Math.cos(a), y: Math.sin(a) };
	}
	/** Timid game smells you when you're upwind, and bolts at loud noise. */
	function v3Spook(enemy, dist) {
		if (!player || q11.hunt) return false;
		if (enemy.kind === "bandit" || enemy.temper !== "timid") return false;
		const w = windVec3(v3.wind);
		const dx = enemy.x - player.x, dy = enemy.y - player.y;
		const downwind = (dx * w.x + dy * w.y) / (dist || 1) > .6;
		const reach = (8 - Math.min(4, lv("hunting") * .4)) * TILE;
		if (downwind && dist < reach) { if (!enemy.aggro) { enemy.aggro = true; alertPack(enemy); } return true; }
		return false;
	}
	function v3Noise(x, y, r) {
		if (!world) return;
		for (const e of world.enemies) if (!e.dead && e.temper === "timid" && Math.hypot(e.x - x, e.y - y) < r) { e.aggro = true; alertPack(e); }
	}
	// -------- traps
	function setTrap(kind) {
		if (!player || !world) return;
		const def = TRAP_KINDS[kind];
		takeItem(def.item, 1);
		q11.traps.push({ x: player.x, y: player.y, day: curDay(), kind, map: mapId });
		train("trapping", 3);
		pushLog(kind === "trap" ? "You bed a steel trap in a fox run and sift leaves over it. Check it in a day or two." : "You set a wire snare in a hare run. Check it tomorrow.");
		saveGame(); sync(true);
	}
	function trapRoll(trap) {
		const def = TRAP_KINDS[trap.kind ?? "snare"] ?? TRAP_KINDS.snare;
		if (Math.random() >= def.base + .05 * lv("trapping")) return "";
		return def.catches[(Math.random() * def.catches.length) | 0];
	}
	function trapLoot(what) {
		const out = what === "fox" ? [["pelt", 1], ["meat", 1], ["bone", 1]] : what === "coyote" ? [["pelt", 1], ["bone", 2]] : [["meat", 1], ["bone", 1]];
		if (lv("hunting") >= 4) out[0] = [out[0][0], out[0][1] + 1];
		return out;
	}
	function checkTrap(trap, fetched) {
		const what = trap.caught;
		for (const [it, n] of trapLoot(what)) giveItem(it, n);
		q11.traps.splice(q11.traps.indexOf(trap), 1);
		if (Math.random() < .8) giveItem(TRAP_KINDS[trap.kind ?? "snare"].item, 1);
		v3.stats.catches += 1; v3.stats.dressed += 1;
		train("trapping", 8); train("hunting", 3);
		const name = what === "rabbit" ? "snowshoe hare" : what;
		pushLog(fetched ? `Goose trots back with the ${name} from your ${trap.kind === "trap" ? "trap" : "snare"}, proud as anything. Dressed out: meat, ${what === "rabbit" ? "" : "pelt, "}bone.` : `A ${name} in the ${trap.kind === "trap" ? "trap" : "snare"}. You dress it out on the spot: ${what === "rabbit" ? "meat and bone" : "pelt, meat and bone"}.`);
		achieve(what === "rabbit" ? "snare" : "trap");
		if (what === "rabbit" && trap.kind === "trap") achieve("snare");
		achieve("dress");
		sfx("gather"); saveGame(); sync(true);
	}
	function v3TrapTick() {
		if (!player || !world || inside) return;
		for (const trap of [...q11.traps]) {
			if (!trap.caught || (trap.map ?? 0) !== mapId) continue;
			if (Math.hypot(trap.x - player.x, trap.y - player.y) < 60) { checkTrap(trap, false); continue; }
			if (dogBody && q10.dog >= 4 && v3.dog.mode === "follow" && Math.hypot(trap.x - player.x, trap.y - player.y) < 15 * TILE) checkTrap(trap, true);
		}
	}
	// -------- Goose
	let barkT = 0, dogHitT = 0, pointAt = null;
	function dogWith() {
		return q10.dog >= 4 && v3.dog.down < 0 && v3.dog.mode !== "stay";
	}
	function v3DogTick(dt) {
		if (!player || !world || q10.dog < 4 || mode11) return;
		if (!v3.dog.joined) { v3.dog.joined = true; achieve("biscuit"); }
		if (v3.dog.down >= 0) { if (dogBody && mapId !== 0) dogBody = null; return; }
		if (v3.dog.mode === "stay") { dogBody = null; return; }
		else if (!dogBody || Math.hypot(dogBody.x - player.x, dogBody.y - player.y) > 900) dogBody = { x: player.x + 46, y: player.y + 30, dir: 0, frame: 0, anim: 0, moving: false };
		if (!dogBody) return;
		dogBody.dog = true;
		if (inside) return;
		let tx = player.x + 46, ty = player.y + 30;
		pointAt = null;
		if (v3.dog.mode === "track") {
			let best = null, bd = 30 * TILE;
			for (const e of world.enemies) { if (!isGame(e) || e.q11) continue; const d = Math.hypot(e.x - player.x, e.y - player.y); if (d < bd) { bd = d; best = e; } }
			if (best) {
				const d = Math.hypot(best.x - player.x, best.y - player.y) || 1;
				const lead = Math.min(d - 140, 260);
				tx = player.x + (best.x - player.x) / d * Math.max(40, lead); ty = player.y + (best.y - player.y) / d * Math.max(40, lead);
				pointAt = best;
				if (best !== v3DogTick.last) { v3DogTick.last = best; pushLog(`Goose's nose goes down. He's on a ${best.kind}, off to the ${compassTo(best.x - player.x, best.y - player.y)}.`); }
			}
		}
		if (v3.dog.mode !== "stay") {
			const d = Math.hypot(tx - dogBody.x, ty - dogBody.y);
			dogBody.moving = d > 24;
			if (dogBody.moving) {
				const sp = Math.min(d, (mounted ? 560 : d > 180 ? 360 : 220) * dt);
				dogBody.dir = facing8(tx - dogBody.x, ty - dogBody.y);
				dogBody.x += (tx - dogBody.x) / d * sp; dogBody.y += (ty - dogBody.y) / d * sp;
			}
			dogBody.anim += dt * (dogBody.moving ? 9 : 0);
		}
		// bark at raiders
		barkT -= dt;
		const raider = world.enemies.find((e) => !e.dead && e.kind === "bandit" && !e.aggro && Math.hypot(e.x - dogBody.x, e.y - dogBody.y) < 13 * TILE);
		if (raider && barkT <= 0 && v3.dog.mode !== "stay") { barkT = 25; v3.barks = (v3.barks || 0) + 1; pushLog(`Goose stiffens and growls toward the ${compassTo(raider.x - player.x, raider.y - player.y)}. Raiders, close.`); sfx("hurt"); }
		// he can get hurt
		dogHitT -= dt;
		if (dogHitT <= 0) {
			const biter = world.enemies.find((e) => !e.dead && e.aggro && e.temper !== "timid" && Math.hypot(e.x - dogBody.x, e.y - dogBody.y) < 70);
			if (biter) { dogHitT = 1.5; dogHurt(Math.max(2, Math.round((biter.atk || 4) * .6))); }
		}
	}
	function dogHurt(n) {
		if (q10.dog < 4 || v3.dog.down >= 0) return;
		v3.dog.hp = Math.max(0, v3.dog.hp - n);
		if (v3.dog.hp <= 0) {
			v3.dog.down = curDay() + 1;
			v3.dog.mode = "stay";
			dogBody = null;
			pushLog("Goose yelps and goes down, then drags himself off toward home. He'll be at the farm, licking it better. Give him a day.");
		} else pushLog(`Goose's hurt (${v3.dog.hp}/30). A bandage would fix him up.`);
		sync(true);
	}
	function dogHeal() {
		if (!player || q10.dog < 4 || v3.dog.down >= 0 || v3.dog.hp >= 30) return false;
		const id = ["bandage", "bandage-std", "bandage-good", "medicine", "trauma"].find((k) => carrying(k));
		if (!id) { pushLog("Nothing to wrap him with. Bandage or medicine."); return false; }
		takeItem(id, 1);
		v3.dog.hp = Math.min(30, v3.dog.hp + Math.round(15 * (1 + .08 * lv("medicine"))));
		train("medicine", 6);
		pushLog(`You wrap Goose's leg. He licks your hand (${v3.dog.hp}/30).`);
		sync(true); return true;
	}
	function dogCommand(mode) {
		mode = "follow"; // v15.9.5: no stay / track jobs; Goose just follows
		if (q10.dog < 4) return;
		if (v3.dog.down >= 0) { pushLog("Goose's laid up at the farm until tomorrow."); return; }
		v3.dog.mode = mode;
		if (mode !== "stay" && !dogBody && player) dogBody = { x: player.x + 46, y: player.y + 30, dir: 0, frame: 0, anim: 0, moving: false };
		pushLog(mode === "stay" ? "\"Stay, Goose.\" He lies down with a sigh." : mode === "track" ? "\"Find 'em, Goose.\" His nose goes to the ground." : "\"Come on, Goose.\" He falls in at your heel.");
		sfx("click"); sync(true);
	}
	// -------- v15.10: Sarah's baby pet raccoon. Goose's follow code with its own sheet: it trails Sarah (the farm NPC,
	// or you when you play as her) on the world map, on her other side from Goose.
	let petBody = null;
	function petOwner() {
		if (!player || !world || mapId !== 0 || inside || mode11) return null;
		if (asSarah()) return player;
		return world.npcs.find((n) => n.role === "sarah") || null;
	}
	function followStep(body, tx, ty, dt, fast) {
		const d = Math.hypot(tx - body.x, ty - body.y);
		body.moving = d > 20;
		if (d > 900) { body.x = tx; body.y = ty; body.moving = false; }
		else if (body.moving) {
			const sp = Math.min(d, (fast ? 560 : d > 160 ? 340 : 200) * dt);
			body.dir = facing8(tx - body.x, ty - body.y);
			body.x += (tx - body.x) / d * sp; body.y += (ty - body.y) / d * sp;
		}
		body.anim += dt * (body.moving ? 10 : 0);
	}
	function petTick(dt) {
		const o = petOwner();
		if (!o) petBody = null;
		else {
			const tx = o.x - 40, ty = o.y + 34;
			if (!petBody) petBody = { x: tx, y: ty, dir: 0, frame: 0, anim: 0, moving: false, pet: "raccoon" };
			followStep(petBody, tx, ty, dt, o === player && mounted);
		}
		// playing Sarah, Goose stays with Justin (the farm's quest-giver) until the Lost Dog quest starts
		if (asSarah() && q10.dog < 2 && world && mapId === 0 && !inside) {
			const j = world.npcs.find((n) => n.role === "sarah");
			if (!j) { if (dogBody?.withJustin) dogBody = null; return; }
			if (!dogBody || !dogBody.withJustin) dogBody = { x: j.x + 46, y: j.y + 30, dir: 0, frame: 0, anim: 0, moving: false, withJustin: true };
			followStep(dogBody, j.x + 46, j.y + 30, dt, false);
		} else if (dogBody?.withJustin) dogBody = null;
	}
	// -------- v15.10: wild raccoons (skittish, by woods and towns) and painted turtles (slow, in and by the water,
	// now and then on a road's edge, never out on the road). Same timid AI as the rabbits.
	const WILD_N = { raccoon: 5, turtle: 5 };
	let wildT = 0, wildTrees = null, wildTreesOf = null;
	const wTile = (tx, ty) => tx >= 0 && ty >= 0 && tx < 156 && ty < 156 ? world.tiles[ty * 156 + tx] : -1;
	const wRoad = (tx, ty) => wTile(tx, ty) === 2;
	const wWater = (tx, ty) => wTile(tx, ty) === 5 && v197Wet(tx, ty);
	function wNear(tx, ty, r, f) { for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) if (f(x, y)) return true; return false; }
	function wTreeAt(tx, ty) {
		if (wildTreesOf !== world) { wildTreesOf = world; wildTrees = new Uint8Array(156 * 156); for (const p of world.props) if (p.kind.startsWith("tree-") && p.tx >= 0 && p.ty >= 0 && p.tx < 156 && p.ty < 156) wildTrees[p.ty * 156 + p.tx] = 1; }
		return tx >= 0 && ty >= 0 && tx < 156 && ty < 156 && wildTrees[ty * 156 + tx] === 1;
	}
	const wTown = (tx, ty) => world.npcs.some((n) => Math.abs(n.x / TILE - tx) < 10 && Math.abs(n.y / TILE - ty) < 10) || world.props.some((p) => /house|church|shed|barn/.test(p.kind) && Math.abs(p.tx - tx) < 8 && Math.abs(p.ty - ty) < 8);
	/** Where a wild animal of this kind may stand. Turtles: dry ground next to water, or (rarely) a road's edge near water. */
	function wildHabitat(kind, tx, ty, shoulderOk) {
		if (tx < 4 || ty < 4 || tx >= 152 || ty >= 152 || cellBlocked(world, tx, ty) || wRoad(tx, ty)) return false;
		if (kind === "turtle") {
			if (wNear(tx, ty, 2, wWater)) return shoulderOk || !wNear(tx, ty, 1, wRoad);
			return shoulderOk && wNear(tx, ty, 1, wRoad) && wNear(tx, ty, 4, wWater);
		}
		return wNear(tx, ty, 3, wTreeAt) || wTown(tx, ty);
	}
	function wildTick(dt) {
		if (!world || !player || mapId !== 0 || inside || mode11) return;
		wildT -= dt;
		if (wildT > 0) return;
		wildT = 4;
		for (const kind of ["raccoon", "turtle"]) {
			const have = world.enemies.filter((e) => !e.dead && e.kind === kind).length;
			if (have >= WILD_N[kind]) continue;
			const t = tileOf(player.x, player.y);
			for (let k = 0; k < 60; k++) {
				const a = Math.random() * Math.PI * 2, r = 14 + Math.random() * 26;
				const tx = Math.round(t.tx + Math.cos(a) * r), ty = Math.round(t.ty + Math.sin(a) * r);
				if (!wildHabitat(kind, tx, ty, kind === "turtle" && Math.random() < .15)) continue;
				const hp = kind === "raccoon" ? 7 : 5;
				const e = q11Spawn([kind, null, null, hp, 0, kind === "raccoon" ? 3 : 2], { x: (tx + .5) * TILE, y: (ty + .5) * TILE }, "wild", false);
				if (e) { e.temper = "timid"; e.wild = true; }
				break;
			}
		}
	}
	// -------- main tick + hud
	function v3Tick(dt) {
		if (!player || !world || phase !== "play" || mode11) return;
		if (v3.dog.mode !== "follow") v3.dog.mode = "follow";
		v3TrackTick(dt);
		v3TrapTick();
		v3DogTick(dt);
		petTick(dt);
		wildTick(dt);
		if (player.scrap >= 100) achieve("rich");
		if (player.level >= 5) achieve("level5");
		if ((q11.fish.caught ?? 0) >= 10) achieve("fish10");
		// the road sign to Skowhegan
		if (mapId === 0 && snow >= 3 && travelLock <= 0 && !dialogue && !inside) {
			const s = skowSign();
			const near = Math.hypot(s.x - player.x, s.y - player.y) < 70;
			v3Tick.nearT = near ? (v3Tick.nearT || 0) + dt : 0;
			if (near && v3Tick.nearT > .6 && !v3Tick.latched) { v3Tick.latched = true; dialogue = { speaker: "Road to Skowhegan", text: "A green highway sign, shot full of holes: SKOWHEGAN 38. Under it somebody's painted TURN BACK. It's a long day's walk south, or a short ride.", choices: [{ label: "Take the road to Skowhegan", id: "q113-skow-go" }, { label: "Not today", id: "close" }] }; phase = "dialogue"; sfx("talk"); sync(true); }
			if (!near) v3Tick.latched = false;
		}
		// stealth by doing: close to unaware raiders or game
		v3Tick.sneak = (v3Tick.sneak || 0) + dt;
		if (v3Tick.sneak > 2) {
			v3Tick.sneak = 0;
			if (world.enemies.some((e) => !e.dead && !e.aggro && Math.hypot(e.x - player.x, e.y - player.y) < 200)) train("stealth", 1);
		}
	}
	function v3Hud() {
		return {
			skills: [],
			ach: ACHIEVEMENTS.map((a) => ({ id: a.id, name: a.name, text: a.text, got: !!v3.ach[a.id] })),
			ups: [],
			dog: q10.dog >= 4 ? { mode: v3.dog.mode, hp: v3.dog.hp, down: v3.dog.down >= 0 } : null,
			wind: COMPASS8[v3.wind],
			toast: v3Toast,
		};
	}
	function v3Choice(id) {
		const openD = (d) => { dialogue = d; phase = "dialogue"; sfx("click"); sync(true); return true; };
		const close = () => { dialogue = null; phase = "play"; sync(true); return true; };
		let m;
		if (id === "q113-skow-go") { close(); travelTo(2, null); return true; }
		if (id === "q113-works") return false; if (false) return openD({ speaker: "Sarah", text: `Bigger works for the farm. You've got ${player.wood} wood, ${player.stone} stone and ${player.scrap} iron.`, choices: [...FARM_UPGRADES2.map((u) => ({ label: upLabel(u), id: `q113-up-${u.id}` })), { label: "Never mind", id: "close" }] });
		if ((m = id.match(/^q113-up-(.+)$/))) { buildUpgrade(m[1]); return v3Choice("q113-works"); }
		return false;
	}
	function v3Kill(enemy) {
		if (enemy.kind === "moose") achieve("moose");
		if (enemy.kind === "deer") achieve("deer");
		if (enemy.variant === "grok") achieve("grok");
		if (enemy.kind !== "bandit") train("hunting", enemy.kind === "moose" ? 16 : enemy.kind === "rabbit" || enemy.kind === "squirrel" ? 3 : 8);
		if (enemy.q11 === "meds" && !world.enemies.some((e) => !e.dead && e.q11 === "meds")) achieve("bridge");
	}
	// ======================= v13 (0.13.0) =======================
	// Saved as data.v13. Every field merges over freshW13(), so pre-v13 saves load with defaults.
	function freshW13() {
		const loyal = {};
		for (const c of COMPANIONS) loyal[c] = 20;
		return {
			core: { agility: 1, grit: 1 }, backstory: "", hard: false, hero: "justin",
			weather: { id: "clear", day: -1 }, needs: { hunger: 100, thirst: 100, sleep: 100 }, ail: {}, buffs: {},
			dura: {}, patched: {}, dye: {}, loyal, left: {},
			bounties: [], bountyDay: -99, bountyDone: 0, caravan: {}, rebuilt: { store: 0, school: 0, clinic: 0 },
			road: { day: -1, n: 0, acc: 0 }, seen: { farm: true }, diary: [], notes: "", forageAcc: 0, forageDay: -1, forageN: 0,
			camps: {}, freed: 0, migDay: -1, slipT: 0, lastHour: -1,
			main: { act: 1, ltKills: 0, choice: "", siege: 0, won: false, ending: "", slide: 0, flags: {} },
		};
	}
	function loadW13(raw) {
		const b = freshW13();
		if (!raw || typeof raw !== "object") return b;
		const m = (k) => ({ ...b[k], ...(raw[k] ?? {}) });
		return { ...b, ...raw, core: m("core"), weather: m("weather"), needs: m("needs"), ail: m("ail"), buffs: m("buffs"), dura: m("dura"), patched: m("patched"), dye: m("dye"), loyal: m("loyal"), left: m("left"), caravan: m("caravan"), rebuilt: m("rebuilt"), road: m("road"), seen: m("seen"), camps: m("camps"), main: { ...b.main, ...(raw.main ?? {}), flags: { ...(raw.main?.flags ?? {}) } }, bounties: Array.isArray(raw.bounties) ? raw.bounties : [], diary: Array.isArray(raw.diary) ? raw.diary : [] };
	}
	let w13 = freshW13();
	let pendingBackstory = "";
	let pendingHero = "justin";
	/** v15.10: who you play. "sarah": the player wears Sarah's sheets, and the farm's quest-giver (the "sarah" role NPC) is drawn and named as Justin. */
	function asSarah() { return w13?.hero === "sarah"; }
	/** v15.10: name swap for everything the HUD shows when you play as Sarah (Justin gives her quests). */
	function giverText(t) {
		if (!asSarah() || typeof t !== "string" || !t.includes("Sarah")) return t;
		return t.replace(/She's at the farm/g, "He's at the farm").replace(/\bSarah\b/g, "Justin");
	}
	function giverName() { return asSarah() ? "Justin" : "Sarah"; }
	let pendingHard = false;
	function applyBackstory(id) {
		const b = BACKSTORIES.find((x) => x.id === id);
		if (!b || !player) return;
		w13.backstory = id;
		for (const [k, n] of Object.entries(b.core)) {
			if (k === "agility" || k === "grit") w13.core[k] += n;
			else if (k === "wits") player.intellect += n;
			else player[k] = (player[k] ?? 0) + n;
		}
		if (false) for (const [k, n] of Object.entries(b.skills)) if (v3.skills[k]) v3.skills[k].lv = Math.max(v3.skills[k].lv, n);
		for (const [it, n] of b.gear) if (n > 0 && GEAR[it]) giveItem(it, n);
		refreshGear(player);
		player.hp = player.maxHp;
		diary(`Started out as a ${b.name.toLowerCase()}. ${b.blurb}`);
	}
	function countOf(id) {
		return player?.bag.reduce((n, s) => n + (s.id === id ? s.qty : 0), 0) ?? 0;
	}
	function hourNow() {
		return (((clock % DAY_LENGTH_SEC) + DAY_LENGTH_SEC) % DAY_LENGTH_SEC) / DAY_LENGTH_SEC * 24;
	}
	function core13() {
		const p = player;
		return { strength: p?.strength ?? 1, endurance: p?.endurance ?? 1, agility: w13.core.agility ?? 1, perception: p?.perception ?? 1, wits: p?.intellect ?? 0, grit: w13.core.grit ?? 1 };
	}
	function fx13() {
		return coreEffects(core13());
	}
	function perk13(skill, n) {
		return lv(skill) >= n;
	}
	/** Older regression suites run with window.__v13Quiet: no random weather, moon, needs, sickness, foraging or road events. */
	const quiet13 = () => typeof window !== "undefined" && !!window.__v13Quiet;
	function weather13() {
		if (quiet13()) return WEATHER.clear;
		const id = w13.weather.id;
		// v15.9.4: rain, snow and nor'easter only slow you and cut sight while the shower is actually falling
		if ((id === "rain" || id === "snow" || id === "noreaster") && !precipOn193()) return WEATHER.clear;
		return WEATHER[id] ?? WEATHER.clear;
	}
	function moon13() {
		if (quiet13()) return moonEffect(2);
		return moonEffect(moonPhase(curDay()));
	}
	function buffOn(id) {
		return (w13.buffs[id] ?? -1) > clock;
	}
	function diary(text) {
		w13.diary.push({ day: curDay() + 1, text });
		if (w13.diary.length > 120) w13.diary.shift();
	}
	function loyalty(fx) {
		const d = LOYALTY_FX[fx];
		if (!d) return;
		const lead = perk13("leadership", 3) ? 1 : 0;
		const bits = [];
		for (const [c, n] of Object.entries(d)) {
			if (w13.left[c]) continue;
			const delta = n > 0 ? n + lead : n;
			w13.loyal[c] = Math.max(-100, Math.min(100, (w13.loyal[c] ?? 20) + delta));
			bits.push(`${COMPANION_NAME[c]} ${delta > 0 ? "+" : ""}${delta}`);
			if (w13.loyal[c] <= LOYALTY_LEAVE && !w13.left[c]) {
				w13.left[c] = curDay() + 1;
				pushLog(`${COMPANION_NAME[c]} has had enough. "I can't stand with you after that." They won't ride with you now.`);
				diary(`${COMPANION_NAME[c]} left us.`);
				if (party && roleComp(party.role) === c) party = null;
			}
		}
		if (bits.length) pushLog(`Loyalty: ${bits.join(", ")}.`);
		if (n13(fx) > 0) train("leadership", 6);
	}
	function n13(fx) { return Object.values(LOYALTY_FX[fx] ?? {}).reduce((a, b) => a + b, 0); }
	function roleComp(role) {
		return role === "cal" ? "jack" : COMPANIONS.includes(role) ? role : null;
	}
	function helpsMore(role) {
		const c = roleComp(role);
		return !!c && (w13.loyal[c] ?? 0) >= LOYALTY_HELP;
	}
	// ---- armor wear, sets
	function duraOf(id) {
		void id; return DURA_MAX; // v15.9.5: gear no longer wears
	}
	const ARMOR13_IDS = ["woolcap", "shirt", "trousers", "gloves", "boots"];
	function armorPieces() {
		return player ? [player.headId, player.coatId, player.legsId, player.handsId, player.feetId].filter((id) => id && GEAR[id]) : [];
	}
	function setBonus13() {
		if (!player) return null;
		const ids = [player.headId, player.coatId, player.legsId, player.handsId, player.feetId];
		if (ids.some((id) => !id || !GEAR[id])) return null;
		const q = GEAR[ids[0]].quality;
		if (ids.some((id) => GEAR[id].quality !== q)) return null;
		return { quality: q, ...SET_BONUS[q] };
	}
	/** Armor value after wear (a piece at 0 durability gives a quarter) plus the set bonus. */
	function def13(base) {
		if (!player) return base;
		let d = 0;
		for (const id of [player.coatId, player.headId, player.legsId, player.handsId, player.feetId, player.backId]) {
			const g = GEAR[id];
			if (!g) continue;
			const u = duraOf(id) / DURA_MAX;
			d += g.def * (u <= 0 ? .25 : .5 + .5 * u) + (w13.patched[id] ? .5 : 0);
		}
		const sb = setBonus13();
		return Math.round(d) + (sb?.def ?? 0) + (base - [player.coatId, player.headId, player.legsId, player.handsId, player.feetId, player.backId].reduce((n, id) => n + (GEAR[id]?.def ?? 0), 0));
	}
	function wearArmor(dmg) {
		return; // v15.9.5: gear wear and repair removed
		const ids = armorPieces();
		if (!ids.length) return;
		const id = ids[Math.floor(Math.random() * ids.length)];
		w13.dura[id] = Math.max(0, duraOf(id) - (2 + Math.min(4, Math.floor(dmg / 4))));
		// v15.9.2 (A4): say it once per piece until it's mended, and "are" for pairs (boots, gloves, trousers)
		w13.flagsBroke = w13.flagsBroke ?? {};
		for (const k of Object.keys(w13.flagsBroke)) if (duraOf(k) > 0) delete w13.flagsBroke[k];
		if (w13.dura[id] === 0 && !w13.flagsBroke[id]) { w13.flagsBroke[id] = true; const nm = GEAR[id].name.toLowerCase(); pushLog(`Your ${nm} ${/[^s]s$/.test(nm) ? "are" : "is"} worn through. Patch ${/[^s]s$/.test(nm) ? "them" : "it"} or repair ${/[^s]s$/.test(nm) ? "them" : "it"} at the workbench.`); }
		refreshGear(player);
	}
	function repairCost(id) {
		const g = GEAR[id];
		const tier = TIER_OF[g?.quality] ?? 1;
		return Math.max(1, tier * 2 + Math.ceil((DURA_MAX - duraOf(id)) / 25) - (perk13("mechanics", 6) ? 1 : 0));
	}
	// ---- needs, sickness, buffs
	function needsTick(hours) {
		if (quiet13() || !player || mode11 || snow < 3) return;
		const r = w13.hard ? NEED_RATE.hard : NEED_RATE.normal;
		const mul = fx13().drainMul;
		const n = w13.needs;
		n.hunger = 100; n.thirst = 100; void mul; // v15.9.5: hunger and thirst removed (sleep stays)
		n.sleep = Math.max(0, n.sleep - r.sleep * (buffOn("awake") ? .5 : 1) * hours);
		const empty = (n.hunger <= 0 ? 1 : 0) + (n.thirst <= 0 ? 1 : 0) + (n.sleep <= 0 ? 1 : 0);
		if (empty && player.hp > 1) player.hp = Math.max(1, player.hp - r.hurt * empty * hours * 4);
	}
	function needsSpeed() {
		const n = w13.needs;
		return n.sleep < 15 ? .9 : 1;
	}
	function ailSpeed() {
		let m = 1;
		for (const id of Object.keys(w13.ail)) m *= AILMENTS[id]?.speed ?? 1;
		return m;
	}
	/** v14.1: real-time hits on the player roll a location too; crippling is rare (eyes 3% of hits, then a coin flip). */
	function injuryRoll141(dmg) {
		if (!player || dmg < 3) return;
		const part = rollPart141();
		if (part === "eyes" && Math.random() < .5) injure141("blind", "A blow catches you across the eyes.");
		else if (part === "arms" && Math.random() < .06) injure141("arms", "Something gives in your arm.");
		else if (part === "legs" && Math.random() < .06) injure141("legs", "Your knee buckles wrong.");
	}
	function injure141(id, why) {
		if (w13.ail[id]) return false;
		w13.ail[id] = curDay() + 1;
		pushLog(`${AILMENTS[id].name}: ${why} ${AILMENTS[id].text} (${AILMENTS[id].cure})`);
		diary(`${AILMENTS[id].name}.`);
		if (id === "arms" && TWO_HANDED.has(GEAR[player.weaponId]?.family)) pushLog("You can't hold a two-handed weapon like this.");
		sync(true);
		return true;
	}
	function healInjuries141(why) {
		let n = 0;
		for (const id of INJURIES) if (w13.ail[id]) { delete w13.ail[id]; n++; }
		if (n) { pushLog(why); sync(true); }
		return n;
	}
	const TWO_HANDED = new Set(["carbine", "scatter", "axe", "pickaxe"]);
	const injured = (id) => !!w13.ail?.[id];
	function catchAil(id, why) {
		if (quiet13() && why !== "Test.") return false;
		if (w13.ail[id]) return false;
		w13.ail[id] = curDay() + 1;
		pushLog(`${AILMENTS[id].name}: ${why} ${AILMENTS[id].text} (${AILMENTS[id].cure})`);
		diary(`Came down with ${AILMENTS[id].name.toLowerCase()}.`);
		sync(true);
		return true;
	}
	function cureAil(id, how) {
		if (!w13.ail[id]) return false;
		delete w13.ail[id];
		pushLog(`${AILMENTS[id].name} is gone. ${how}`);
		return true;
	}
	// ---- weather, moon, migration (daily)
	function v13Daily(day) {
		if (!player || mode11) return;
		if (w13.weather.day !== day) {
			const season = seasonNow();
			const prev = w13.weather.id;
			w13.weather = { id: rollWeather(season, Math.random()), day };
			if (w13.weather.id !== prev) pushLog(`Weather: ${WEATHER[w13.weather.id].text}`);
			if (w13.weather.id === "noreaster") diary("Nor'easter came through.");
		}
		const ph = moonPhase(day);
		if (ph === 4) pushLog("Full moon tonight. Bright enough to read by. The raiders like it too.");
		if (ph === 0) pushLog("New moon. Dark as the inside of a cow. Good night for sneaking.");
		if (day - w13.bountyDay >= 3) { w13.bounties = makeBounties(day); w13.bountyDay = day; }
		// sickness: colds in cold weather, infected cuts drain, bones heal slow
		const cold = weather13().cold + (seasonNow() === 3 ? 1 : 0);
		if (cold >= 2 && !buffOn("warm") && Math.random() < Math.max(0, .18 * cold / 3 - fx13().sickResist - .05 * lv("survival") - (perk13("survival", 3) ? .2 : 0))) catchAil("cold", "Too many nights in the wet and cold.");
		if (w13.ail.cold && day - w13.ail.cold >= 3 && (buffOn("warm") || Math.random() < .5)) cureAil("cold", "Three days by the stove did it.");
		if (w13.ail.cut) player.hp = Math.max(1, player.hp - AILMENTS.cut.hpDay); // v14.1: softened (was x3)
		if (w13.ail.bone && day - w13.ail.bone >= 6) cureAil("bone", "It knit on its own. Slow.");
		v13Migrate();
		diaryDay(day);
	}
	function diaryDay(day) {
		if (w13.lastDiary === day) return;
		w13.lastDiary = day;
		diary(`${SEASONS[seasonNow()]}, ${MOON_NAMES[moonPhase(day)].toLowerCase()}. ${WEATHER[w13.weather.id].name}.`);
	}
	function v13Migrate() {
		if (!world || !player || mapId === 1 && !world.enemies) return;
		const key = `${mapId}:${seasonNow()}:${curDay()}`;
		if (w13.migKey === key) return;
		w13.migKey = key;
		const want = MIGRATION[mapId]?.[seasonNow()];
		if (!want) return;
		for (const [kind, n] of Object.entries(want)) {
			const have = world.enemies.filter((e) => !e.dead && e.kind === kind).length;
			for (let i = have; i < n; i++) {
				const t = tileOf(player.x, player.y);
				for (let k = 0; k < 40; k++) {
					const a = Math.random() * Math.PI * 2, r = 18 + Math.random() * 30;
					const tx = Math.round(t.tx + Math.cos(a) * r), ty = Math.round(t.ty + Math.sin(a) * r);
					if (tx < 4 || ty < 4 || tx >= 152 || ty >= 152 || cellBlocked(world, tx, ty)) continue;
					const hp = kind === "moose" ? 60 : kind === "deer" ? 26 : kind === "wolf" ? 22 : kind === "coyote" ? 14 : 6;
					const atk = kind === "moose" ? 9 : kind === "deer" ? 3 : kind === "wolf" ? 5 : kind === "coyote" ? 3 : 1;
					const e = q11Spawn([kind, null, null, hp, atk, Math.round(hp / 2)], { x: (tx + .5) * 64, y: (ty + .5) * 64 }, "mig", false);
					if (e) { e.temper = kind === "wolf" || kind === "coyote" ? "hostile" : "shy"; e.mig = true; }
					break;
				}
			}
		}
	}
	// ---- per-step tick
	function v13Tick(dt) {
		if (!player || !world || mode11) return;
		const h = hourNow();
		const hr = Math.floor(clock / (DAY_LENGTH_SEC / 24));
		if (w13.lastHour < 0) w13.lastHour = hr;
		if (hr > w13.lastHour) { needsTick(Math.min(24, hr - w13.lastHour)); w13.lastHour = hr; }
		if (w13.weather.day !== curDay()) v13Daily(curDay());
		// discovered towns for fast travel
		for (const t of townSpots()) if (!w13.seen[t.id] && t.map === mapId && Math.hypot(t.x - player.x, t.y - player.y) < 9 * TILE) { w13.seen[t.id] = true; pushLog(`Found: ${t.name}. You can ride here from anywhere now.`); }
		// black ice: walking or riding, you can go down
		if (w13.weather.id === "blackice" && phase === "play" && !inside && intent && !perk13("survival", 6)) {
			w13.slipT += dt;
			if (w13.slipT > 6) {
				w13.slipT = 0;
				if (Math.random() < (mounted ? .12 : .06) * (1 - .05 * lv("survival"))) { // v13.2 balance: was .3/.08
					if (mounted) { parkBike(false); pushLog("The back wheel goes out from under you on the black ice. You hit the road hard."); }
					else pushLog("Your feet go out from under you on the black ice.");
					player.hp = Math.max(1, player.hp - (mounted ? 8 : 3));
					if (Math.random() < (mounted ? .3 : .12)) catchAil("bone", "You landed wrong."); // v13.2: was .5/.2
					train("survival", 4);
				}
			}
		}
		if (mounted && weather13().bike === 0) { parkBike(false); pushLog("Can't ride in a nor'easter. You can't see the road."); }
		if (weather13().cold >= 2 && !inside && h > 18) w13.survAcc = (w13.survAcc ?? 0) + dt;
		if ((w13.survAcc ?? 0) > 30) { w13.survAcc = 0; train("survival", 2); }
		// foraging while walking the woods
		if (intent?.kind === "walk" && !inside && mapId !== 2 && !(mapId === 0 && inFarm(tileOf(player.x, player.y).tx, tileOf(player.x, player.y).ty))) {
			w13.forageAcc += dt;
			if (w13.forageAcc > 9) { w13.forageAcc = 0; forage(); }
		}
		v13RoadTick(dt);
		v13CampTick();
		v13MainTick();
	}
	function forage(force = false) {
		if (quiet13() && !force) return false;
		if (w13.forageDay !== curDay()) { w13.forageDay = curDay(); w13.forageN = 0; }
		if (!force && w13.forageN >= 4 + (perk13("foraging", 3) ? 1 : 0)) return false;
		if (!force && seasonNow() === 3 && !perk13("foraging", 9)) return false;
		if (!force && Math.random() > .22 + .04 * lv("foraging")) return false;
		w13.forageN += 1;
		const r = Math.random();
		const it = seasonNow() === 3 ? "greens" : r < .45 ? "berries" : r < .7 || !perk13("foraging", 6) ? "greens" : "mushrooms";
		giveItem(it, 1);
		train("foraging", 5);
		pushLog(it === "berries" ? "Foraging: a handful of blueberries off the ledge." : it === "mushrooms" ? "Foraging: chanterelles under the hemlocks." : "Foraging: fiddleheads and wild greens by the brook.");
		return true;
	}
	// ---- fast travel by bike
	function townSpots() {
		const out = [];
		for (const t of TOWNS13) {
			let x = 0, y = 0;
			if (t.id === "farm") { if (mapId !== 0) { out.push({ ...t, x: 0, y: 0 }); continue; } const c = farmCenter(); x = c.x; y = c.y; }
			else if (t.id === "jack") { const n = mapId === 0 ? world?.npcs.find((m) => m.role === "cal") : null; if (!n) { out.push({ ...t, x: -1e6, y: -1e6 }); continue; } x = n.x; y = n.y; }
			else if (t.id === "lowell") { const n = mapId === 0 ? world?.npcs.find((m) => m.role === "mira") : null; if (!n) { out.push({ ...t, x: -1e6, y: -1e6 }); continue; } x = n.x; y = n.y; }
			else if (t.id === "skow") { if (mapId !== 2) { out.push({ ...t, x: -1e6, y: -1e6 }); continue; } x = player.x; y = player.y; }
			out.push({ ...t, x, y });
		}
		return out;
	}
	function travelMenu() {
		const opts = TOWNS13.filter((t) => w13.seen[t.id]).map((t) => ({ label: `${t.name} (${travelGas(here13(), t)} gas)`, id: `v13-go-${t.id}` }));
		return openD13("Bike", `Where to? You've got ${countOf("gas")} gas. ${weather13().bike === 0 ? "Not in a nor'easter." : weather13().bike < .7 ? "Roads are bad today." : ""}`, [...opts, { label: "Stay put", id: "close" }]);
	}
	function here13() {
		return { map: mapId, tx: tileOf(player.x, player.y).tx - WORLD_OX, ty: tileOf(player.x, player.y).ty - WORLD_OY };
	}
	function fastTravel(id) {
		if (!legacyTravel()) { openWorldMap(); return; }
		const t = TOWNS13.find((x) => x.id === id);
		if (!t || !player) return;
		if (!w13.seen[id]) { pushLog("You haven't been there yet."); return; }
		if (!bikeBuilt()) { pushLog("You need the motor bicycle running for that."); return; }
		if (weather13().bike === 0) { pushLog("Not in a nor'easter."); return; }
		const gas = travelGas(here13(), t);
		if (countOf("gas") < gas) { pushLog(`Not enough gas. That's ${gas} cans.`); return; }
		takeItem("gas", gas);
		train("mechanics", 4);
		const arrive = () => {
			if (id === "farm") { const c = farmCenter(); return { x: c.x + 60, y: c.y + 90 }; }
			const s = townSpots().find((x) => x.id === id);
			return s && s.x > -1e5 ? { x: s.x + 60, y: s.y + 60 } : null;
		};
		if (t.map !== mapId) travelTo(t.map, t.map === 0 && id !== "farm" ? null : t.map === 0 ? () => { const c = farmCenter(); return { x: c.x + 60, y: c.y + 90 }; } : null);
		const at = arrive();
		if (at && mapId === t.map) { const s = clearOutside(at.x, at.y); player.x = s.x; player.y = s.y; const focus = worldToScreen(player.x, player.y, 0, 0); camX = focus.sx - viewW / 2; camY = focus.sy - viewH / 2; }
		pushLog(`You ride to ${t.name}. ${gas} gas gone.`);
		if (Math.random() < .3 * (weather13().bike < .7 ? 1.5 : 1)) startRoadEvent(pickRoadEvent(Math.random()));
		saveGame(); sync(true);
	}
	// ---- road events
	function v13RoadTick(dt) {
		if (quiet13() || inside || dialogue || mapId === 1) return;
		const t = tileOf(player.x, player.y);
		const road = world.tiles[t.ty * MAP_W + t.tx] === 2 || world.tiles[t.ty * MAP_W + t.tx] === 5;
		if (!road || !intent) return;
		if (w13.road.day !== curDay()) { w13.road.day = curDay(); w13.road.n = 0; }
		if (w13.road.n >= 1) return;
		w13.road.acc += dt;
		if (w13.road.acc < 40) return;
		w13.road.acc = 0;
		if (Math.random() < .25) startRoadEvent(pickRoadEvent(Math.random()));
	}
	function startRoadEvent(id) {
		w13.road.n += 1;
		const ev = ROAD_EVENTS.find((e) => e.id === id);
		w13.roadEv = id;
		diary(`On the road: ${ev.title.toLowerCase()}.`);
		if (id === "car") return openD13(ev.title, ev.text, [{ label: lv("mechanics") >= 2 || perk13("mechanics", 9) ? "Get it running (Mechanics)" : "Siphon what's in the tank", id: "v13-road-car" }, { label: "Leave it", id: "close" }]);
		if (id === "stranger") return openD13(ev.title, ev.text, [{ label: "Trade him some jerky for news (1 jerky)", id: "v13-road-help" }, { label: "Take his pack at gunpoint", id: "v13-road-rob" }, { label: "Walk on by", id: "close" }]);
		if (id === "lostkid") return openD13(ev.title, ev.text, [{ label: "Walk him home to the Forks", id: "v13-road-kid" }, { label: "Point him the way and go", id: "close" }]);
		// ambush
		const ring = 220;
		for (let i = 0; i < 3; i++) {
			const a = i * 2.1 + Math.random();
			const s = clearOutside(player.x + Math.cos(a) * ring, player.y + Math.sin(a) * ring);
			q11Spawn(["bandit", null, "Road raider", 16, 4, 10], s, "ambush", true);
		}
		pushLog(`${ev.title}: ${ev.text}`);
		sync(true);
	}
	// ---- caravans
	function v13Caravan() {
		const r = caravanOnRoad(curDay(), hourNow());
		return r && mapId === 0 ? r : null;
	}
	function caravanKey(r) {
		return `${r.id}:${curDay()}`;
	}
	function caravanMenu() {
		const r = v13Caravan();
		if (!r) return openD13("Road", "No caravan on the road right now. They run on a schedule: Lowelltown to Skowhegan every 2 days (9 to 3), Skowhegan to Bangor every 3 days (10 to 4).", [{ label: "Close", id: "close" }]);
		if (w13.caravan[caravanKey(r)]) return openD13("Caravan", "Caravan's already been through today. You missed 'em.", [{ label: "Close", id: "close" }]);
		return openD13(`Caravan: ${r.from} to ${r.to}`, "Two sledges and a horse, three men with deer rifles. The driver squints at you.", [{ label: "Ride guard for them", id: "v13-car-guard" }, { label: "Rob it", id: "v13-car-rob" }, { label: "Let it pass", id: "close" }]);
	}
	// ---- Harmony rebuilding
	function rebuildCost(r) {
		const cut = (perk13("carpentry", 6) ? .9 : 1) * (1 - .04 * lv("carpentry"));
		return { wood: Math.ceil(r.cost.wood * cut), stone: Math.ceil(r.cost.stone * cut), iron: r.cost.iron, need: r.cost.need ?? [] };
	}
	function rebuildMenu() {
		return openD13("Harmony", "Harmony's store, school and clinic stand empty down the road. Fix them up and folks will come back.", [...REBUILD.map((r) => {
			const c = rebuildCost(r);
			return { label: w13.rebuilt[r.id] ? `${r.name}: open` : `${r.name}: ${c.wood} wood, ${c.stone} stone, ${c.iron} iron${c.need.map(([i, n]) => `, ${n} ${GEAR[i]?.name.toLowerCase() ?? i}`).join("")} — ${r.effect}`, id: `v13-rebuild-${r.id}` };
		}), ...(w13.rebuilt.clinic ? [{ label: "Clinic: get patched up (4 iron)", id: "v13-clinic" }] : []), { label: "Close", id: "close" }]);
	}
	function rebuild(id) {
		const r = REBUILD.find((x) => x.id === id);
		if (!r || w13.rebuilt[id]) return;
		const c = rebuildCost(r);
		if (player.wood < c.wood || player.stone < c.stone || player.scrap < c.iron || c.need.some(([i, n]) => countOf(i) < n)) { pushLog(`Not enough for the ${r.name.toLowerCase()}.`); return; }
		player.wood -= c.wood; player.stone -= c.stone; player.scrap -= c.iron;
		for (const [i, n] of c.need) takeItem(i, n);
		w13.rebuilt[id] = curDay() + 1;
		train("carpentry", 20); train("leadership", 10);
		loyalty("rebuild");
		pushLog(`The ${r.name} is open again. ${r.effect}`);
		diary(`Reopened the ${r.name}.`);
		shiftRep("ponds", 3, 8);
		v13WorldProps();
		saveGame(); sync(true);
	}
	function rebuiltN() {
		return Object.values(w13.rebuilt).filter(Boolean).length;
	}
	// ---- cooking
	function cookMenu() {
		return openD13("Stove", "The farmhouse stove's going. What are you making?", [...RECIPES13.map((r) => ({ label: `${r.name}: ${r.need.map(([i, n]) => `${n} ${GEAR[i]?.name.toLowerCase() ?? i}`).join(", ")}. ${r.text}`, id: `v13-cook-${r.id}` })), { label: "Close", id: "close" }]);
	}
	function cook(id) {
		const r = RECIPES13.find((x) => x.id === id);
		if (!r) return false;
		if (r.need.some(([i, n]) => countOf(i) < n)) { pushLog(`Not enough for ${r.name.toLowerCase()}.`); return false; }
		for (const [i, n] of r.need) takeItem(i, n);
		const qty = 1 + (perk13("cooking", 3) ? 1 : 0);
		giveItem(r.makes, qty);
		train("cooking", 8);
		pushLog(`You cook ${r.name.toLowerCase()}${qty > 1 ? ` (${qty} servings)` : ""}.`);
		sync(true);
		return true;
	}
	/** Eating, drinking and v13 cures from the pack. Returns true when it used the item. */
	function v13Use(def, stack) {
		const f = FOOD_VALUE[def.id];
		if (def.family === "medkit") {
			const order = def.id === "docbag" ? INJURIES : INJURIES.filter((i) => w13.ail[i]).slice(0, 1);
			let n = 0; for (const id of order) if (w13.ail[id]) { delete w13.ail[id]; n++; }
			if (!n) { pushLog("Nothing broken that it can fix."); return true; }
			pushLog(def.id === "docbag" ? "You clean the eye, set the joint and splint it. Better." : "You strap it up out of the tin kit. Better."); train("firstaid", 8); sync(true); return false;
		}
		if (def.id === "medicine") { if (cureAil("cut", "The medicine knocks the infection down.") || cureAil("cold", "The medicine clears your head.") ) train("medicine", 6); return false; }
		if (def.family === "bandage") { train("firstaid", 5); if (w13.ail.bone && countOf("wood") >= 0 && player.wood >= 1 && perk13("firstaid", 6)) { player.wood -= 1; cureAil("bone", "You splint it with a stave and a bandage."); } if (perk13("firstaid", 3) && w13.ail.cut) cureAil("cut", "Clean cut, clean bandage."); return false; }
		if (!f) return false;
		stack.qty -= 1;
		if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
		const more = 1 + .05 * lv("cooking");
		const n = w13.needs;
		void more;
		if (def.id === "cider" || def.id === "donut") { player.stamina = Math.min(player.maxStamina, player.stamina + 15); if (def.heal > 0) player.hp = Math.min(player.maxHp, player.hp + def.heal); pushLog(def.id === "cider" ? "Hot cider. Warm all the way down. +15 stamina." : "Still warm from Sarah's kettle. +15 stamina."); }
		if (f.sleep) n.sleep = Math.min(100, n.sleep + f.sleep);
		if (def.heal > 0) player.hp = Math.min(player.maxHp, player.hp + def.heal);
		const r = RECIPES13.find((x) => x.makes === def.id);
		if (r?.buff) {
			const hrs = r.hours * (1 + .05 * lv("cooking")) * (r.buff === "warm" && perk13("cooking", 6) ? 1.5 : 1);
			w13.buffs[r.buff] = clock + hrs / 24 * DAY_LENGTH_SEC;
			if (r.buff === "cheer") for (const c of COMPANIONS) if (!w13.left[c]) w13.loyal[c] = Math.min(100, w13.loyal[c] + 3);
			if (r.buff === "strong") refreshGear(player);
		}
		if (def.id === "tonic") cureAil("cold", "The spruce tonic burns going down and clears you right out.");
		sfx("click");
		pushLog(`${def.name}${f.sleep ? ": awake" : ""}.${r?.buff ? ` ${r.text}` : ""}`);
		return true;
	}
	function sleep13() {
		const n = w13.needs;
		n.sleep = 100;
		if (mapId === 0 && world?.npcs.some((q) => q.role === "sarah")) healInjuries141("Sarah sits up with you through the night: eye wash, a splint, a sling. You wake up whole.");
		if (w13.ail.cold) w13.ail.cold -= 1;
	}
	// ======== v14: roadside start, farm fortifications, defend the farm, workbench, base pieces ========
	let v14 = freshV14();
	let craftOpen = false;
	let buildFlip = false;
	let buildTool = "place";
	const V14_ID = 800000;
	const ok14 = () => v14.st >= 5;
	const mat14 = (m) => m === "wood" ? player.wood : m === "stone" ? player.stone : m === "iron" ? player.scrap : countOf(m);
	const canPay14 = (cost) => Object.entries(cost).every(([m, n]) => mat14(m) >= n);
	function pay14(cost) {
		for (const [m, n] of Object.entries(cost)) {
			if (m === "wood") player.wood -= n; else if (m === "stone") player.stone -= n; else if (m === "iron") player.scrap -= n; else takeItem(m, n);
		}
	}
	function give14(cost, f = 1) {
		for (const [m, n0] of Object.entries(cost)) {
			const n = Math.floor(n0 * f); if (n <= 0) continue;
			if (m === "wood") player.wood += n; else if (m === "stone") player.stone += n; else if (m === "iron") player.scrap += n; else giveItem(m, n);
		}
	}
	const costText = (cost) => Object.entries(cost).map(([m, n]) => `${n} ${MAT_NAME[m].toLowerCase()}`).join(", ") || "nothing";
	function add14(kind, tx, ty, extra) {
		const keep = world.nextPropId;
		world.nextPropId = V14_ID + world.props.filter((p) => p.id >= V14_ID).length + 1;
		while (world.props.some((p) => p.id === world.nextPropId)) world.nextPropId++;
		const p = addProp(world, kind, tx, ty, extra);
		world.nextPropId = keep;
		return p;
	}
	/** The roadside camp: a road tile 26-38 tiles out from the farm, down the longest road. */
	function campSpot14() {
		const fx = FARM.tx, fy = FARM.ty;
		let best = null, bestD = 0;
		const seen = new Set();
		const q = [];
		for (let y = fy - FARM.r - 2; y <= fy + FARM.r + 2; y++) for (let x = fx - FARM.r - 2; x <= fx + FARM.r + 2; x++) if (world.tiles[y * MAP_W + x] === 2) { q.push([x, y, 0]); seen.add(y * MAP_W + x); }
		while (q.length) {
			const [x, y] = q.shift();
			const d = Math.hypot(x - fx, y - fy);
			if (d <= 38 && d > bestD && x > 4 && y > 4 && x < MAP_W - 5 && y < MAP_H - 5) { bestD = d; best = { tx: x, ty: y }; }
			if (d > 38) continue;
			for (const [ax, ay] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
				const k = ay * MAP_W + ax;
				if (seen.has(k) || world.tiles[k] !== 2) continue;
				seen.add(k); q.push([ax, ay, 0]);
			}
		}
		return best ?? { tx: fx - 24, ty: fy + 4 };
	}
	/** The farm's rough ring: stakes on about 2/3 of the ring, a barricaded gate where the road crosses, a lookout and sandbags. */
	function fortPlan14() {
		const out = [];
		const fc = { tx: FARM.tx, ty: FARM.ty };
		const R = FARM.r - 1.5;
		const ring = new Set();
		for (let a = 0; a < 360; a += 3) {
			const tx = Math.round(fc.tx + Math.cos(a * Math.PI / 180) * R), ty = Math.round(fc.ty + Math.sin(a * Math.PI / 180) * R);
			const k = `${tx},${ty}`;
			if (ring.has(k)) continue;
			ring.add(k);
			const road = world.tiles[ty * MAP_W + tx] === 2;
			const n = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
			if (road) {
				const at = (r) => world.tiles[Math.round(fc.ty + Math.sin(a * Math.PI / 180) * r) * MAP_W + Math.round(fc.tx + Math.cos(a * Math.PI / 180) * r)] === 2;
				if (at(R + 2) && at(R - 2)) out.push({ k: "gate-wood", tx, ty, hp: 30, f: Math.abs(Math.cos(a * Math.PI / 180)) > .7 });
				continue;
			}
			if (n % 3 === 0) continue;
			const flip = Math.abs(Math.cos(a * Math.PI / 180)) > .7;
			out.push(n % 7 === 0 ? { k: "wall-x", tx, ty, hp: 0, f: flip } : { k: "wall-wood", tx, ty, hp: n % 5 === 0 ? 24 : 60, f: flip });
		}
		const gate = out.find((o) => o.k === "gate-wood");
		const g = gate ?? { tx: fc.tx + 10, ty: fc.ty };
		const ix = Math.sign(fc.tx - g.tx), iy = Math.sign(fc.ty - g.ty);
		out.push({ k: "lookout", tx: g.tx + ix * 2 + (iy ? 2 : 0), ty: g.ty + iy * 2 + (ix ? 2 : 0), hp: 35 });
		out.push({ k: "sandbags", tx: g.tx + ix * 2 - (iy ? 1 : 0), ty: g.ty + iy * 2 - (ix ? 1 : 0), hp: 50 });
		out.push({ k: "sandbags-x", tx: g.tx + ix * 2 + (iy ? 1 : 0), ty: g.ty + iy * 2 + (ix ? 1 : 0), hp: 0 });
		const bc = farmCenter();
		const bt = tileOf(bc.x, bc.y);
		out.push({ k: "workbench", tx: bt.tx + 3, ty: bt.ty + 2, hp: 99 });
		return out;
	}
	function placeAround14(kind, tx, ty, extra) {
		for (let r = 0; r < 7; r++) for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) {
			if (Math.max(Math.abs(x - tx), Math.abs(y - ty)) !== r) continue;
			const p = add14(kind, x, y, extra);
			if (p) return p;
		}
		return null;
	}
	function v14World() {
		if (!world || mapId !== 0 || mode11) return;
		world.props = world.props.filter((p) => { if (p.id < V14_ID) return true; vacate(world, p); return false; });
		if (!v14.camp) v14.camp = campSpot14();
		if (false) for (const o of fortPlan14()) { // v15.9.5: the farm fort (walls, gates, workbench, lookout) went with the farm
			const key = `${o.tx},${o.ty}`;
			const saved = v14.fort[key];
			const k = saved ? saved.k : o.k;
			const p = (o.k === "workbench" || o.k.startsWith("lookout") || o.k.startsWith("sandbags")) ? placeAround14(k, o.tx, o.ty, { f14: key }) : add14(k, o.tx, o.ty, { f14: key, flip14: !!o.f });
			if (p) p.hp = saved ? saved.hp : o.hp;
		}
		for (const pc of v14.placed) { const p = add14(pc.k, pc.tx, pc.ty, { p14: true, flip14: !!pc.f }); if (p) p.hp = pc.hp; }
		const c = v14.camp;
		placeAround14("wreck", c.tx, c.ty - 1, { camp14: "wreck" });
		placeAround14(v14.st >= 2 ? "firering" : "firering", c.tx + 1, c.ty + 1, { camp14: "fire", lit14: v14.st >= 2 });
		if (v14.st < 1) placeAround14("stash", c.tx - 1, c.ty + 1, { camp14: "stash" });
		// v14.1 playtest: a pile of spruce deadfall at camp so the first 3 wood is right there
		if (v14.st < 2 && !v14.woodTaken) placeAround14("logs", c.tx - 2, c.ty + 2, { camp14: "wood", resource: "wood", amount: 3 });
		// spread out: no raider camp or wild bandit within 34 tiles of the farm
		for (const e of world.enemies) {
			if (e.dead || e.quest || e.kind !== "bandit" || e.q10 || e.q11) continue;
			const tx = e.homeX / TILE, ty = e.homeY / TILE;
			const d = Math.hypot(tx - FARM.tx, ty - FARM.ty);
			if (d >= 34) continue;
			const k = 34 / Math.max(1, d);
			const nx = Math.round(FARM.tx + (tx - FARM.tx) * k), ny = Math.round(FARM.ty + (ty - FARM.ty) * k);
			if (nx < 3 || ny < 3 || nx > MAP_W - 4 || ny > MAP_H - 4 || cellBlocked(world, nx, ny)) { e.dead = true; e.death = 0; continue; }
			e.x = e.homeX = (nx + .5) * TILE; e.y = e.homeY = (ny + .5) * TILE; e.aggro = false; e.path = null;
		}
	}
	/** New game: wake at the camp with little more than the clothes you wear. */
	function v14Start() {
		if (v14.st !== 0 || !v14.camp || mapId !== 0) return;
		const c = v14.camp;
		const spot = nearestRespawn(c.tx, c.ty, 1, 1);
		player.x = spot.x; player.y = spot.y;
		player.respawnX = spot.x; player.respawnY = spot.y;
		const worn = new Set([player.weaponId, player.coatId, player.headId, player.legsId, player.handsId, player.feetId, player.backId].filter(Boolean));
		player.bag = player.bag.filter((s) => worn.has(s.id)).map((s) => ({ id: s.id, qty: 1 }));
		if (isGun(GEAR[player.weaponId]?.family)) player.bag.push({ id: "shells", qty: 4 });
		player.bag.push({ id: "bandage", qty: 1 });
		player.wood = 0; player.stone = 0; player.scrap = 0;
		player.gridPos = {};
		refreshGear(player);
		// v15: a new game starts you on the road just outside Harmony village. v15.9.5: the farm lives only in the Harmony town game now,
		// so the old farm intro (walk home, Sarah, the defend raid) is skipped: you start with the base steps done (v14.st 5).
		const hv = typeof window !== "undefined" && window.__v14Camp ? null : harmonyEntry();
		if (hv) { player.x = hv.x; player.y = hv.y; player.respawnX = hv.x; player.respawnY = hv.y; townDisarm(); giveItem("matches"); giveItem("water"); }
		if (hv) { v14.st = 5; pushLog("You come to on the road outside Harmony village."); }
	}
	/** v15.9.5: a clear spot on the road ring outside Harmony village, at least 260px from every town marker on this map. */
	function harmonyEntry() {
		if (!world || mapId !== 0) return null;
		const hv = townSpot(ISO_TOWNS[0]);
		if (!hv) return null;
		const towns = ISO_TOWNS.filter((t) => t.map === 0).map((t) => townSpot(t)).filter(Boolean);
		const fc = farmCenter();
		let best = null;
		for (let a = 0; a < 360; a += 15) for (const r of [270, 310, 350]) {
			const x = hv.x + Math.cos(a * Math.PI / 180) * r, y = hv.y + Math.sin(a * Math.PI / 180) * r;
			if (pointBlocked(world, x, y, RADIUS)) continue;
			if (towns.some((t) => Math.hypot(t.x - x, t.y - y) < 260)) continue;
			// v15.9.7: arrive in front of the village (camera side), not behind the church and houses
			const wx = x - hv.x, wy = y - hv.y, d = -(wx + wy) + Math.abs(wx - wy) * .6 + Math.hypot(x - fc.x, y - fc.y) * 0;
			if (!best || d < best.d) best = { x, y, d };
		}
		return best ? { x: best.x, y: best.y } : null;
	}
	/** v15.9.5: old saves that sit in the removed farm area (or wait on a farm-only intro step) move to Harmony's entrance. */
	/** v15.9.7: an old save whose spot is now under the lake or a river (or inside a tree) steps to the nearest dry, open ground. */
	function layoutFix() {
		if (!world || !player || inside || mode11) return;
		const dry = (x, y) => !pointBlocked(world, x, y, RADIUS);
		const near = (x, y) => {
			const t = tileOf(x, y);
			for (let r = 1; r < 30; r++) for (let a = 0; a < 360; a += 10) {
				const tx = Math.round(t.tx + Math.cos(a * Math.PI / 180) * r), ty = Math.round(t.ty + Math.sin(a * Math.PI / 180) * r);
				const px = (tx + .5) * TILE, py = (ty + .5) * TILE;
				if (tx > 1 && ty > 1 && tx < MAP_W - 2 && ty < MAP_H - 2 && dry(px, py)) return { x: px, y: py };
			}
			return null;
		};
		if (!dry(player.x, player.y)) { const p = near(player.x, player.y); if (p) { player.x = p.x; player.y = p.y; if (layoutMoved) pushLog("The roads and the water lie where they always did. You find dry ground."); } }
		if (player.respawnX != null && !dry(player.respawnX, player.respawnY)) { const p = near(player.respawnX, player.respawnY); if (p) { player.respawnX = p.x; player.respawnY = p.y; } }
		layoutMoved = false;
	}
	function farmGone() {
		if (!world || !player || mapId !== 0 || mode11) return;
		if (v14.st >= 1 && v14.st < 5) v14.st = 5;
		const near = (x, y) => Math.hypot(x / TILE - FARM.tx, y / TILE - FARM.ty) < FARM.r + 3;
		const hv = harmonyEntry();
		if (!hv) return;
		if (!inside && near(player.x, player.y)) { player.x = hv.x; player.y = hv.y; pushLog("The farm is in Harmony village now. You're on the road outside."); }
		if (player.respawnX != null && near(player.respawnX, player.respawnY)) { player.respawnX = hv.x; player.respawnY = hv.y; }
	}
	function v14Use(prop) {
		if (prop.kind === "wreck") {
			if (v14.st > 0) return pushLog("The truck's picked clean. Somebody's luck ran out here.");
			v14.st = 1;
			giveItem("matches"); giveItem("junk", 3); giveItem("cloth", 3); giveItem("water");
			const st = world.props.find((p) => p.camp14 === "stash"); if (st) { vacate(world, st); world.props = world.props.filter((p) => p !== st); }
			pushLog("Under the seat: a match tin, a twist of cloth, a jug of water and a fistful of bolts.");
			pushLog("It'll be dark and cold soon. Get 3 wood off the spruce and light the fire ring.");
			sfx("gather"); saveGame(); sync(true); return;
		}
		if (prop.kind === "stash") return v14Use(world.props.find((p) => p.kind === "wreck") ?? prop);
		if (prop.kind === "firering") {
			if (prop.lit14) return pushLog("The fire's going. Off to the east there's chimney smoke over the trees.");
			if (v14.st < 1) return pushLog("No matches. Check the truck.");
			if (player.wood < 3) return pushLog(`The ring wants 3 wood. You have ${player.wood}. The spruce along the road will do.`);
			player.wood -= 3; prop.lit14 = true; v14.st = 2; prop.burn = 0;
			v14.st = 5; // v15.9.5: no farm walk-home step any more
			pushLog("The fire takes. While you warm your hands you see it: a thread of chimney smoke over the trees, toward Harmony.");
			grantXp(10); sfx("build"); saveGame(); sync(true); return;
		}
		if (prop.kind === "sign-farm") return pushLog("Hand-painted: FARM. KEEP TO THE ROAD. Somebody added: WE SHOOT.");
		if (prop.kind === "workbench") return pushLog("An old workbench, stripped bare.");
		if (false && prop.kind === "workbench") { if (!ok14()) return pushLog(v14.st >= 3 ? "Your workbench, under a tarp. Hold the farm first; then it's back in business." : "A workbench under a tarp."); craftOpen = true; phase = "play"; sync(true); return; }
		if (isGate14(prop.kind)) return toggleGate14(prop);
		if (prop.kind === "chest") return openStore(prop), void 0;
		if (prodOf(prop.kind)) return prodUse(prop), void 0;
		if (prop.kind === "rainbarrel") {
			// v14.1: the barrel stores water; rain and nearby rain collectors fill it
			const st = barrel141(prop);
			if (st.n <= 0) { pushLog(`Rain barrel: empty (0 of ${BARREL_CAP} jugs). It fills in rain, or from a rain collector next to it.`); sync(true); return; }
			if (tryGive("water")) { st.n -= 1; pushLog(`You fill a jug from the rain barrel. ${st.n} of ${BARREL_CAP} jugs left.`); } else pushLog("No room for a jug.");
			sync(true); return;
		}
		if (PIECE_HP[prop.kind] || prop.kind === "wall-x" || prop.kind === "sandbags-x" || prop.kind === "lookout-x") return repairOne14(prop);
	}
	function toggleGate14(prop) {
		prop.open = !prop.open;
		if (prop.open) vacate(world, prop);
		else {
			const c = propCenter(prop);
			if (Math.hypot(player.x - c.x, player.y - c.y) < 40) { prop.open = true; return pushLog("Step clear of the gate first."); }
			occupy(world, prop);
		}
		pushLog(prop.open ? "You swing the gate open." : "You drop the bar across the gate.");
		sfx("click"); sync(true);
	}
	function maxHp14(prop) {
		if (prop.kind === "wall-x") return PIECE_HP[prop.was14 ?? "wall-wood"];
		if (prop.kind === "sandbags-x") return PIECE_HP.sandbags;
		if (prop.kind === "lookout-x") return PIECE_HP.lookout;
		return PIECE_HP[prop.kind] ?? DEF_HP[prop.kind] ?? 30;
	}
	function fixKind14(prop) { return prop.kind === "wall-x" ? (prop.was14 ?? "wall-wood") : prop.kind === "sandbags-x" ? "sandbags" : prop.kind === "lookout-x" ? "lookout" : prop.kind; }
	function repairCost14(prop) { return v14RepairCost(fixKind14(prop) === "lookout" ? "wall-wood" : fixKind14(prop), prop.hp ?? 0, maxHp14(prop)); }
	function repairOne14(prop, quiet = false) {
		const max = maxHp14(prop);
		if ((prop.hp ?? max) >= max && !prop.kind.endsWith("-x")) { if (!quiet) pushLog("That piece is sound."); return false; }
		const cost = repairCost14(prop);
		if (!canPay14(cost)) { if (!quiet) pushLog(`Fixing it wants ${costText(cost)}.`); return false; }
		pay14(cost);
		const k = fixKind14(prop);
		if (k !== prop.kind) { vacate(world, prop); prop.kind = k; occupy(world, prop); }
		prop.hp = max;
		note14(prop);
		if (!quiet) { pushLog(`Patched: ${costText(cost)}.`); sfx("build"); burst(propCenter(prop).x, propCenter(prop).y, "#d4a24a", 8); saveGame(); sync(true); }
		return true;
	}
	function note14(prop) {
		if (prop.f14) v14.fort[prop.f14] = { k: prop.kind, hp: Math.round(prop.hp ?? 0) };
	}
	function damaged14() {
		return world.props.filter((p) => (p.f14 || p.p14) && p.kind !== "workbench" && ((p.hp ?? 0) < maxHp14(p) || p.kind.endsWith("-x")));
	}
	function repairAll14() {
		let n = 0;
		for (const p of damaged14()) if (repairOne14(p, true)) n++;
		pushLog(n ? `You patch ${n} piece${n > 1 ? "s" : ""} of the walls.` : "Not enough stock to patch anything.");
		if (n) sfx("build");
		saveGame(); sync(true);
	}
	// ---- (v15.9.5: the defend-the-farm raid was removed)
	function v14Tick() {
		if (!world || !player || mapId !== 0 || mode11 || inside) return;
		if (v14.st === 2) {
			const t = tileOf(player.x, player.y);
			if (inFarm(t.tx, t.ty)) {
				v14.st = 3;
				pushLog("Sarah steps out from the stakes with the carbine, then lowers it. \"Oh, it's you. Thank God.\"");
				const j = world.npcs.find((n) => n.role === "sarah");
				if (j) openTalk(j);
				saveGame(); sync(true);
			}
		}
	}
	function v14Talk(role, npc) {
		if (String(role).startsWith("lr-")) return lrTalk(npc);
		if (role !== "sarah" || ok14()) return null;
		if (v14.st === 4) return { speaker: "Sarah", text: "Get on the gate! Shoot what comes over the stakes.", choices: [{ label: "Going", id: "close" }] };
		if (v14.st >= 3 && snow <= 0) return { speaker: "Sarah", text: "You're back. We lost hens and a gas can to the road last week, so you'll forgive the rifle. You saw the stakes. Half of them are down. First snow tonight and the stove's down to kindling. Bring three armloads of wood off the pile by the barn and I'll have something hot waiting.", choices: [{ label: "I'll bring the wood", id: "snow-accept" }, { label: "I'll go", id: "close" }] };
		return null;
	}
	function hud14() {
		if (!player) return null;
		const t = mapId === 0 ? (v14.st < 3 ? STAGE_TEXT[v14.st] : v14.st === 4 ? STAGE_TEXT[4] : "") : "";
		let craft = null;
		if (craftOpen) {
			const tier = v14.bench;
			craft = { tier, up: BENCH_UP[tier] ? Object.entries(BENCH_UP[tier]).map(([m, n]) => ({ m: MAT_NAME[m], n, have: mat14(m) })) : null, canUp: !!BENCH_UP[tier] && canPay14(BENCH_UP[tier]),
				mats: Object.keys(MAT_NAME).map((m) => ({ m: MAT_NAME[m], have: mat14(m) })),
				list: CRAFT14.map((r) => ({ id: r.id, name: GEAR[r.makes]?.name ?? r.makes, qty: r.qty, tier: r.tier, group: r.group, locked: r.tier > tier, can: r.tier <= tier && canPay14(r.cost), need: Object.entries(r.cost).map(([m, n]) => ({ m: MAT_NAME[m], n, have: mat14(m) })), def: GEAR[r.makes]?.def ?? 0, atk: GEAR[r.makes]?.atk ?? 0 })) };
		}
		return { st: v14.st, text: t, secured: ok14(), craft, flip: buildFlip, tool: buildTool, damaged: world && mapId === 0 ? damaged14().length : 0 };
	}
	function craft14(id) {
		const r = CRAFT14.find((x) => x.id === id);
		if (!r || !player) return;
		if (r.tier > v14.bench) { pushLog(`That wants a tier ${r.tier} bench.`); sync(true); return; }
		if (!canPay14(r.cost)) { pushLog(`Short: needs ${costText(r.cost)}.`); sfx("click"); sync(true); return; }
		pay14(r.cost);
		giveItem(r.makes, r.qty);
		train("mechanics", 3);
		pushLog(`You make ${r.qty > 1 ? `${r.qty} × ` : ""}${GEAR[r.makes].name}.`);
		sfx("build"); saveGame(); sync(true);
	}
	function benchUp14() {
		const cost = BENCH_UP[v14.bench];
		if (!cost) return;
		if (!canPay14(cost)) { pushLog(`The next bench wants ${costText(cost)}.`); sync(true); return; }
		pay14(cost); v14.bench += 1;
		pushLog(v14.bench === 2 ? "You bolt a vise and a grinder to the bench. Tier 2." : "A forge pot and a drill press. Tier 3.");
		sfx("level"); saveGame(); sync(true);
	}
	/** Build tool on a tile: pick up or repair a piece you placed. Returns true when it used the tap. */
	function buildTap14(tile) {
		if (buildTool === "place") return false;
		const p = world.props.find((q) => q.tx === tile.tx && q.ty === tile.ty && (q.p14 || q.f14) && q.kind !== "workbench");
		if (!p) { pushLog("Nothing of yours there."); return true; }
		if (buildTool === "repair") { repairOne14(p); return true; }
		if (!p.p14) { pushLog("That's part of the old ring. Repair it instead."); return true; }
		const piece = PIECES.find((x) => x.kind === p.kind);
		if (piece) give14(piece.cost, .5);
		vacate(world, p); world.props = world.props.filter((q) => q !== p);
		v14.placed = v14.placed.filter((q) => !(q.tx === p.tx && q.ty === p.ty));
		pushLog(`Picked up. Half the stock back.`);
		sfx("gather"); saveGame(); sync(true);
		return true;
	}
	function paintHp14(pt, H, f) {
		const w = 34 * zoom, y = pt.sy - H * .9;
		ctx.fillStyle = "rgba(20,16,12,.75)"; ctx.fillRect(pt.sx - w / 2, y, w, 5 * zoom);
		ctx.fillStyle = f > .5 ? "#8fbf6a" : f > .2 ? "#e0b050" : "#d0644a"; ctx.fillRect(pt.sx - w / 2, y, w * Math.max(0, f), 5 * zoom);
	}
	function v14Choice(id) {
		if (v141Choice(id)) return true;
		if (lrChoice(id)) return true;
		if (id === "v14-repair-all") { dialogue = null; phase = "play"; repairAll14(); return true; }
		return false;
	}
	// ======== v14.1: loot runs, the horde, stealth, farm production, pack growth, hard-mode pack drop, storage, controls
	let l1 = freshV141();
	let stickX = 0, stickY = 0, coastT = 0, coastX = 0, coastY = 0, noiseHear = 0, prodAcc = 0, storeKey = "";
	const test141 = () => typeof window !== "undefined" && !!window.__v14Skip;
	/** A sound at (x, y): the Hollowed in reach turn toward it; raiders nearby wake. */
	function emitNoise(n, x = player?.x, y = player?.y) {
		if (!world || !player) return;
		l1.noise = Math.max(l1.noise, n);
		const reach = noiseReach(n);
		for (const e of world.enemies) {
			if (e.dead) continue;
			const d = Math.hypot(e.x - x, e.y - y);
			if (d > reach) continue;
			if (e.hollow) { e.heard = { x, y, t: clock }; e.path = null; e.pathT = 0; }
			else if (n >= 90 && e.temper === "hostile" && !e.aggro && d < reach * .5) { e.aggro = true; alertPack(e); }
		}
	}
	/** v14.1 playtest: wolves keep clear of the start and farm for the first five minutes of a game. */
	const coarse141 = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
	const EARLY_WOLF_SEC = 300, EARLY_WOLF_R = 28;
	function earlyWolves(dt) {
		l1.playT = (Number(l1.playT) || 0) + dt;
		if (l1.playT > EARLY_WOLF_SEC || mapId !== 0 || !world?.enemies || !player) return;
		for (const e of world.enemies) {
			if (e.dead || (e.kind !== "wolf" && e.kind !== "coyote")) continue;
			const dx = e.x - player.x, dy = e.y - player.y, d = Math.hypot(dx, dy);
			if (d > EARLY_WOLF_R * TILE) continue;
			const a = d > 1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
			for (let k = 0; k < 12; k++) {
				const r = (EARLY_WOLF_R + 4 + k) * TILE, ang = a + (k % 2 ? 1 : -1) * k * .25;
				const x = player.x + Math.cos(ang) * r, y = player.y + Math.sin(ang) * r;
				if (x < 4 * TILE || y < 4 * TILE || x > 150 * TILE || y > 150 * TILE || pointBlocked(world, x, y, RADIUS)) continue;
				e.x = x; e.y = y; e.homeX = x; e.homeY = y; e.aggro = false; e.path = []; break;
			}
		}
	}
	function noiseTick(dt, moving) {
		tbTick(dt);
		earlyWolves(dt);
		townTick();
		const target = l1.crouch ? (moving ? NOISE.crouch : NOISE.still) : mounted ? NOISE.bike : work && work.swing > 0 ? NOISE.chop : moving ? NOISE.walk : NOISE.still;
		if (l1.noise > target) l1.noise = Math.max(target, l1.noise - 45 * dt);
		else l1.noise = Math.min(target, l1.noise + 90 * dt);
		noiseHear += dt;
		if (noiseHear > .5) { noiseHear = 0; if (l1.noise > 5) emitNoise(l1.noise); }
	}
	function setCrouch(on) {
		if (mounted && on) { pushLog("Not on the bike."); return; }
		l1.crouch = on;
		pushLog(on ? "You get down low. Slower, and a lot quieter." : "You stand up.");
		sync(true);
	}
	// ---- the Hollowed
	function spawnHollowed(n, at, spread = 70) {
		const out = [];
		for (let i = 0; i < n; i++) {
			const a = i / n * Math.PI * 2, r = spread * (.4 + Math.random() * .6);
			let x = at.x + Math.cos(a) * r, y = at.y + Math.sin(a) * r;
			if (pointBlocked(world, x, y, RADIUS)) { x = at.x; y = at.y; }
			spawnRaider("gray", { x, y });
			const e = world.enemies[world.enemies.length - 1];
			Object.assign(e, { hollow: true, raid: false, aggro: false, name: HOLLOWED, hp: 18, maxHp: 18, atk: 5, xp: 6, elite: false, variant: "", wander: Math.random() * 6 });
			out.push(e);
		}
		return out;
	}
	function stepHollow(e, dt, dist) {
		const sight = 125 * (l1.crouch ? CROUCH_SIGHT : 1) * (nightShade(clock) > .22 ? .8 : 1) * (e.blind141 ? INJ_FX.enemyBlindSight : 1);
		if (!e.aggro && dist < sight) { e.aggro = true; e.heard = null; for (const o of world.enemies) if (o.hollow && !o.dead && !o.aggro && Math.hypot(o.x - e.x, o.y - e.y) < 160) o.aggro = true; }
		if (e.aggro && dist > 520) e.aggro = false;
		let moving = false;
		if (e.aggro && dist <= 48 && e.cooldown <= 0) {
			e.cooldown = 1.25; e.dir = facing8(player.x - e.x, player.y - e.y);
			if (!(e.blind141 && Math.random() > INJ_FX.enemyBlindAim)) hurtPlayer(e.crippleArm > 0 ? 3 : e.atk, e.x, e.y);
		} else {
			let gx = null, gy = null, sp = 62;
			if (e.aggro) { gx = player.x; gy = player.y; sp = 74; }
			else if (e.heard && clock - e.heard.t < 40) { gx = e.heard.x; gy = e.heard.y; if (Math.hypot(gx - e.x, gy - e.y) < 30) e.heard = null; }
			else { e.wander -= dt; if (e.wander <= 0) { e.wander = 4 + Math.random() * 5; const a = Math.random() * Math.PI * 2; e.goal = { x: e.homeX + Math.cos(a) * 90, y: e.homeY + Math.sin(a) * 90 }; } if (e.goal) { gx = e.goal.x; gy = e.goal.y; sp = 30; } }
			if (e.crippleLeg > 0) sp *= .5;
			if (gx != null) {
				if (e.pathT <= 0 || !e.path) { e.path = pathTo(world, e.x, e.y, gx, gy); e.pathT = .7; }
				if (e.path?.length) { e.path = follow(e, e.path, sp, dt, true); moving = true; }
			}
		}
		// the shamble: a slow, uneven step
		if (moving) e.anim += dt * (4.2 + Math.sin(clock * 2.3 + e.id) * 1.6);
		e.frame = moving ? Math.floor(e.anim) % 4 : 0;
	}
	function hollowedArea(mid) {
		if (!world || !player || world.enemies.some((e) => e.hollow)) return;
		const groups = mid === 9 || mid === 7 ? 0 : mid >= 3 ? 2 : 0; // v15.4: none at the Greenville landing
		for (let g = 0; g < groups; g++) {
			for (let k = 0; k < 30; k++) {
				const a = Math.random() * Math.PI * 2, r = 900 + Math.random() * 1500;
				const at = { x: player.x + Math.cos(a) * r, y: player.y + Math.sin(a) * r };
				const t = tileOf(at.x, at.y);
				if (t.tx < 4 || t.ty < 4 || t.tx > 150 || t.ty > 150 || pointBlocked(world, at.x, at.y, RADIUS)) continue;
				spawnHollowed(4 + Math.floor(Math.random() * 3), at);
				break;
			}
		}
	}
	// ---- loot runs
	function lootHud() {
		const today = curDay();
		return LOOT_RUNS.map((l) => { const left = restockLeft(l, l1.loot[l.id], today); return { id: l.id, name: l.name, q: l.q, r: l.r, ready: left === 0, days: left }; });
	}
	function freeSpot(x, y) {
		for (let r = 0; r < 8; r++) for (let k = 0; k < 12; k++) {
			const a = k / 12 * Math.PI * 2, px = x + Math.cos(a) * r * 40, py = y + Math.sin(a) * r * 40;
			if (!pointBlocked(world, px, py, RADIUS)) return { x: px, y: py };
		}
		return { x, y };
	}
	const LOOT_ROOMS = { gas: ["Pump island", "Store shelves", "Back office"], camp: ["Woodshed", "Camp kitchen", "Gun cabinet"], truck: ["Truck cab", "Cargo bay", "Chained crate"] };
	function lootEnter(run) {
		const m = wmState();
		m.warn = "";
		regions.delete(9);
		m.enc = "loot:" + run.id;
		wmArrive(9, m.from);
		const today = curDay();
		const fresh = restockLeft(run, l1.loot[run.id], today) === 0;
		l1.loot[run.id] = fresh ? today : l1.loot[run.id];
		// deeper = farther from where you came in (toward the middle of the little map)
		const cx = 78 * 64, cy = 78 * 64;
		const dx = cx - player.x, dy = cy - player.y, dm = Math.hypot(dx, dy) || 1;
		const rooms = LOOT_ROOMS[run.id];
		piles = piles.filter((q) => !q.title.startsWith(run.name + ":"));
		for (let i = 0; i < 3; i++) {
			const dist = 260 + i * 380;
			const s = freeSpot(player.x + dx / dm * dist, player.y + dy / dm * dist);
			// the Ervin back office stays locked (and stocked) until Dale's key opens it
			const lockedOffice = run.id === "gas" && i === 2 && !l1.sqf.office;
			const items = fresh || lockedOffice ? run.tiers[i].map(([id, qty]) => ({ id, qty })) : i === 0 ? [{ id: "junk", qty: 1 }] : [];
			if (items.length) leavePile(s.x, s.y, `${run.name}: ${rooms[i]}`, items, 0, "", 0);
			if (i === 0 && run.id === "truck") placeAround14("wreck", tileOf(s.x, s.y).tx + 1, tileOf(s.x, s.y).ty - 1, { loot141: true });
			if (i === 2 && fresh) {
				const g = { x: s.x + 90, y: s.y + 40 };
				if (run.id === "gas") spawnHollowed(4, g);
				else if (run.id === "camp") for (let k = 0; k < 3; k++) q10Spawn("wolf", "", "Timber wolf", { x: g.x + k * 40, y: g.y - k * 30 }, [22, 5, 10], "enc", true);
				else for (let k = 0; k < 2; k++) { spawnRaider("scout", { x: g.x + k * 50, y: g.y }); world.enemies[world.enemies.length - 1].raid = false; world.enemies[world.enemies.length - 1].aggro = false; }
			}
		}
		{ const my = piles.filter((q) => q.title.startsWith(run.name + ":")); if (my.length) lrSetup(run, my[0], my[my.length - 1]); else lrSetup(run, player, { x: player.x + dx / dm * 1000, y: player.y + dy / dm * 1000 }); }
		pushLog(fresh ? `${run.name}. ${run.blurb} The good stuff is deeper in.` : `${run.name}. Picked over. It'll be worth a look again in ${restockLeft(run, l1.loot[run.id], today)} day${restockLeft(run, l1.loot[run.id], today) === 1 ? "" : "s"}.`);
		pushLog("Walk to the tinted edge to get back on the road.");
		saveGame(); sync(true);
	}
	// ---- loot-run side quests (gb-handoff/lootruns.md): Dale's Key, Roy's Trapline, Wendell's Load
	let lrNpcId = 990000;
	function lrNpc(role, name, at) {
		const s = freeSpot(at.x, at.y);
		world.npcs = world.npcs.filter((n) => n.role !== role);
		world.npcs.push({ id: lrNpcId++, role, name, x: s.x, y: s.y, homeX: s.x, homeY: s.y, dir: 0, frame: 0, anim: 0, path: null, pause: 99, hp: 30, maxHp: 30, lr141: true });
	}
	function lrSetup(run, s0, s2) {
		const lore = LOOT_LORE[run.id];
		const sq = l1.sq[run.id] ?? 0;
		pushLog(lore.desc);
		const my = piles.filter((q) => q.title.startsWith(run.name + ":"));
		my.forEach((q) => { const i = LOOT_ROOMS[run.id].indexOf(q.title.slice(run.name.length + 2)); if (i >= 0) q.note = ({ gas: [2, 0, 1] }[run.id] ?? [0, 1, 2])[i]; q.room = i; });
		const side = (k, dist) => ({ x: s0.x + (s2.x - s0.x) * dist + (s2.y - s0.y) * .45, y: s0.y + (s2.y - s0.y) * dist - (s2.x - s0.x) * .45 });
		if (run.id === "gas") {
			lrNpc("lr-tammy", "Tammy Bouchard", { x: s0.x - 90, y: s0.y + 60 });
			if (sq === 1) { const k = side(0, 1.1); leavePile(k.x, k.y, "Dale's place: kitchen hook", [{ id: "dalekey", qty: 1 }], 0, "", 0); spawnHollowed(4, { x: k.x + 60, y: k.y + 40 }, 60); }
		} else if (run.id === "camp") {
			if (sq < 3) lrNpc("lr-bob", "Bob Carrier", { x: s0.x - 80, y: s0.y + 50 });
			if (sq === 1) {
				for (let i = 0; i < 4; i++) { const k = side(i, .3 + i * .28); leavePile(k.x, k.y, `Roy's trapline: flagging tape, site ${i + 1}`, i === 3 ? [{ id: "roycap", qty: 1 }, { id: "steeltrap", qty: 1 }] : [{ id: "snare", qty: 1 }], 0, "", 0);
					if (i === 2) { lrNpc("lr-gerry", "Gerry", { x: k.x + 30, y: k.y - 30 }); for (let w = 0; w < 4; w++) q10Spawn("wolf", "", "Timber wolf", { x: k.x + 120 + w * 30, y: k.y + 40 - w * 25 }, [22, 5, 10], "enc", true); }
					if (i === 3) spawnHollowed(3, { x: k.x + 70, y: k.y + 30 }, 50); }
			}
		} else if (run.id === "truck") {
			lrNpc("lr-wendell", "Wendell Ouellette", side(0, .2));
			if (sq === 2) for (let i = 0; i < 3; i++) { const k = side(i, .45 + i * .3); leavePile(k.x, k.y, `Trail from the truck ${i + 1}`, [{ id: "cloth", qty: 1 }], 0, "", 0); }
		}
	}
	/** A note is read the first time you open its room; then the loot shows. */
	function lrNote(pile) {
		if (pile.note == null || pile.noteRead) return false;
		const run = LOOT_RUNS.find((r) => pile.title.startsWith(r.name + ":"));
		if (!run) return false;
		// Dale's key: the back office door is steel and locked
		if (run.id === "gas" && pile.room === 2 && !l1.sqf.office) {
			if (!player.bag.some((s) => s.id === "dalekey")) { openD13("Back office", "Steel door, steel frame, a deadbolt. Dale took the key home to Bingham. You aren't getting through this without it.", [{ label: "Leave it", id: "close" }]); return true; }
			l1.sqf.office = true; takeItem("dalekey", 1);
		}
		pile.noteRead = true;
		const n = LOOT_LORE[run.id].notes[pile.note];
		openD13(n.title, n.text, [{ label: "Search the room", id: `v141-search-${pile.id}` }]);
		return true;
	}
	function lrTalk(npc) {
		const r = npc.role, sq = (k) => l1.sq[k] ?? 0;
		if (r === "lr-tammy") {
			const st = sq("gas");
			if (st === 0) return { speaker: "Tammy Bouchard", text: "\"That hand pump in the back office'll pull the last of the underground tank. Key's on Dale's ring, and Dale's at his place up the Bingham road. What's left of him, anyhow. Bring me the key and I'll split the fuel with you, fair.\"", choices: [{ label: "I'll get Dale's key", id: "v141-q-gas-1" }, { label: "Not now", id: "close" }] };
			if (st === 1 && !l1.sqf.pumped) return { speaker: "Tammy Bouchard", text: l1.sqf.office ? "\"Office is open? Then run the pump. It's loud, mind. Loud brings company.\"" : `"Dale's place is off the back lot, up the road. There's ${HOLLOWED} around it. Keep low and quiet, or don't, your funeral."`, choices: [...(l1.sqf.office ? [{ label: "Run the hand pump (loud)", id: "v141-q-gas-pump" }] : []), { label: "Going", id: "close" }] };
			if (st === 1 && l1.sqf.pumped) return { speaker: "Tammy Bouchard", text: "\"Four cans. Two's mine, that was the deal.\"", choices: [{ label: "Split it fair (2 fuel each)", id: "v141-q-gas-share" }, { label: "Keep all four", id: "v141-q-gas-keep" }] };
			if (l1.sqf.tammyCold) return { speaker: "Tammy Bouchard", text: "She looks right through you and rolls another tea-leaf smoke.", choices: [{ label: "Go", id: "close" }] };
			return { speaker: "Tammy Bouchard", text: "\"Back again. I've got matches and a little oil if you've iron.\"", choices: [{ label: "Matches: 2 iron", id: "v141-buy-matches" }, { label: "Oil: 3 iron", id: "v141-buy-oil" }, { label: "Bye, Tammy", id: "close" }] };
		}
		if (r === "lr-bob") {
			const st = sq("camp");
			if (st === 0) return { speaker: "Bob Carrier", text: "\"Roy went out on the line eleven days ago. Gerry went after him. I'm too stove-up in the knees to walk it. Find 'em, or find what happened. I'd rather know.\"", choices: [{ label: "I'll walk the line", id: "v141-q-camp-1" }, { label: "Not now", id: "close" }] };
			if (st === 1 && !player.bag.some((s) => s.id === "roycap")) return { speaker: "Bob Carrier", text: "\"Orange flagging tape on the trees. Four sites. Gerry'd have stuck to it.\"", choices: [{ label: "Going", id: "close" }] };
			if (st === 1) return { speaker: "Bob Carrier", text: `You hand him the cap. He turns it over a long time. "${l1.sqf.gerry ? "Gerry's back, anyhow. " : ""}Well. Now I know." He nods at the bottom bunk. "Take the lever gun. Or my glasses, if you'd rather."`, choices: [{ label: "Bob's lever gun", id: "v141-q-camp-gun" }, { label: "The binoculars", id: "v141-q-camp-bino" }] };
			return { speaker: "Bob Carrier", text: "\"Stove's going. Sleep here if you need to.\"", choices: [{ label: "Thanks, Bob", id: "close" }] };
		}
		if (r === "lr-gerry") {
			if (l1.sqf.gerry) return { speaker: "Gerry", text: "\"I'm going. I'm going.\"", choices: [{ label: "Close", id: "close" }] };
			const wolves = world.enemies.some((e) => !e.dead && e.kind === "wolf" && Math.hypot(e.x - npc.x, e.y - npc.y) < 500);
			if (wolves) return { speaker: "Gerry", text: "From the top of a ladder stand: \"Wolves! Don't just stand there gawking, clear 'em off!\"", choices: [{ label: "Close", id: "close" }] };
			return { speaker: "Gerry", text: "\"Lord. Thank you. Roy's tracks went on toward the drift past the last flag. I couldn't. Tell Bob I'm coming. And... tell him I've got his fourteen dollars. Sort of.\" He hands you a maple tin.", choices: [{ label: "Head back to camp", id: "v141-q-gerry" }] };
		}
		if (r === "lr-wendell") {
			const st = sq("truck");
			if (st === 0) return { speaker: "Wendell Ouellette", text: "\"I was hauling people. Didn't know it till Skowhegan. They were Forks people, the Collector's taking 'em south. I let 'em out the floor, sort of. I think some made it to the spruce. Somebody's gotta find 'em before the cold or his boys do.\" His ankle's bent wrong.", choices: [{ label: "Splint the ankle (bandage + 1 wood)", id: "v141-q-truck-splint" }, { label: "Not now", id: "close" }] };
			if (st === 1 || st === 2) { const found = (l1.sq.truckFound ?? 0); return { speaker: "Wendell Ouellette", text: found >= 2 ? "\"Two of 'em? Two's... two's good. Send 'em to Harmony, there's a clinic there.\"" : `"Three trails off the truck. Boot prints, a mitten, blood. ${found} found so far."`, choices: [...(found >= 2 ? [{ label: "They're headed for Harmony", id: "v141-q-truck-done" }] : []), { label: "Going", id: "close" }] }; }
			return { speaker: "Wendell Ouellette", text: "\"The Collector's boys'll be back for the truck. Let 'em have it.\"", choices: [{ label: "Close", id: "close" }] };
		}
		return null;
	}
	function lrChoice(id) {
		let m = /^v141-search-(\d+)$/.exec(id);
		if (m) { const p = piles.find((q) => q.id === +m[1]); dialogue = null; phase = "play"; if (p) openLoot(p); return true; }
		const done = () => { dialogue = null; phase = "play"; saveGame(); sync(true); return true; };
		if (id === "v141-q-gas-1") { l1.sq.gas = 1; pushLog("Dale's Key: get the key ring off the kitchen hook at Dale's place. Come back to the station to set it up."); regions.delete(9); return done(); }
		if (id === "v141-q-gas-pump") { l1.sqf.pumped = true; emitNoise(100); spawnHollowed(5, { x: player.x + 520, y: player.y - 200 }, 90); pushLog(`The hand pump squeals like a stuck pig. Four cans. Out of the treeline, ${HOLLOWED}, coming for the noise.`); return done(); }
		if (id === "v141-q-gas-share") { l1.sq.gas = 2; giveItem("fuel", 2); pushLog("Dale's Key done: 2 fuel. Tammy will trade with you now, and the back office stays open."); grantXp(30); return done(); }
		if (id === "v141-q-gas-keep") { l1.sq.gas = 2; l1.sqf.tammyCold = true; giveItem("fuel", 4); pushLog("You keep all four. Tammy won't forget it."); grantXp(20); return done(); }
		if (id === "v141-buy-matches" || id === "v141-buy-oil") { const c = id.endsWith("matches") ? 2 : 3; if (player.scrap < c) pushLog("Not enough iron."); else { player.scrap -= c; giveItem(id.endsWith("matches") ? "matches" : "oil"); } return done(); }
		if (id === "v141-q-camp-1") { l1.sq.camp = 1; pushLog("Roy's Trapline: walk the four flagged sites."); regions.delete(9); return done(); }
		if (id === "v141-q-gerry") { l1.sqf.gerry = true; giveItem("maple"); world.npcs = world.npcs.filter((n) => n.role !== "lr-gerry"); pushLog("Gerry heads back to camp. Gerry pays his 14-dollar debt with a maple tin."); return done(); }
		if (id === "v141-q-camp-gun" || id === "v141-q-camp-bino") {
			l1.sq.camp = 2; takeItem("roycap", 1); giveItem("steeltrap", 2); giveItem("hide", 2);
			// adult player only: the gun goes in your own pack, never to a companion
			giveItem(id.endsWith("gun") ? "levergun" : "binoculars");
			pushLog(`Roy's Trapline done. Steel traps, hides${id.endsWith("gun") ? " and Bob's lever gun" : " and Bob's binoculars"}. The camp's a safe place to rest now.`); grantXp(40); return done();
		}
		if (id === "v141-q-truck-splint") {
			const b = player.bag.find((s) => /^bandage/.test(s.id));
			if (!b || player.wood < 1) { pushLog("You need a bandage and a stick of wood."); return done(); }
			takeItem(b.id, 1); player.wood -= 1; l1.sq.truck = 2; l1.sq.truckFound = 0;
			pushLog("You splint Wendell's ankle. Wendell's Load: follow the three trails off the truck."); regions.delete(9); return done();
		}
		if (id === "v141-q-truck-done") {
			l1.sq.truck = 3; giveItem("backpack"); giveItem("medicine"); w13.freed = (w13.freed ?? 0) + 2; l1.sqf.collectorRoutes = true;
			if (w13.loyal) w13.loyal.mira = (w13.loyal.mira ?? 0) + 5;
			for (let i = 0; i < 3; i++) { spawnRaider("scout", { x: player.x + 420 + i * 50, y: player.y - 120 }); const e = world.enemies[world.enemies.length - 1]; e.raid = false; }
			pushLog("Wendell's Load done: a canvas pack and medicine. Two Forks people on the road to Harmony (+2 Harmony). Mira will hear of it. Wendell's sheet lists the Collector's caravan routes: a lead for act 5.");
			pushLog("Engines on Route 27. The Collector's men are back for the truck. Defend it or let it go.");
			grantXp(40); return done();
		}
		return false;
	}
	/** Trails off the truck: opening each one is a survivor, a body, or an ambush. */
	function lrTrail(pile) {
		const m = /^Trail from the truck (\d)$/.exec(pile.title);
		if (!m || pile.trailDone) return;
		pile.trailDone = true;
		const i = +m[1];
		if (i === 2) { pushLog("A mitten, and a shape under the snow. You leave them be."); return; }
		l1.sq.truckFound = (l1.sq.truckFound ?? 0) + 1;
		if (i === 3) { for (let k = 0; k < 2; k++) { spawnRaider("scout", { x: pile.x + 200 + k * 40, y: pile.y }); world.enemies[world.enemies.length - 1].raid = false; } pushLog("A Forks woman in a spruce hollow, and two of the Collector's men right behind her. Ambush."); }
		else pushLog("A Forks man under a blowdown, half frozen. You point him toward Harmony.");
	}
	// ---- farm production
	function prodKey(p) { return `${p.tx},${p.ty}`; }
	function prodState(p) { return (l1.prod[prodKey(p)] ??= { t: clock, n: 0, load: 0 }); }
	function prodRun(p) {
		const def = prodOf(p.kind); if (!def) return;
		const st = prodState(p);
		const hrs = (clock - st.t) / DAY_LENGTH_SEC * 24;
		const wet = w13.weather.id === "rain" || w13.weather.id === "snow" || w13.weather.id === "noreaster";
		let per = def.per;
		if (def.kind === "raincollector" && wet) per /= 2;
		if (def.kind === "garden" && world.props.some((q) => q.kind === "raincollector" && Math.hypot(q.tx - p.tx, q.ty - p.ty) < 6)) per *= .75;
		if (hrs < per) return;
		const batches = Math.floor(hrs / per);
		st.t += batches * per / 24 * DAY_LENGTH_SEC;
		for (let i = 0; i < batches && st.n < def.cap; i++) {
			if (def.needs) { if (st.load <= 0) break; st.load -= 1; }
			st.n = Math.min(def.cap, st.n + def.qty);
		}
	}
	const BARREL_CAP = 8;
	function barrel141(p) {
		const k = prodKey(p);
		if (!l1.prod[k]) l1.prod[k] = { t: clock, n: 4, load: 0 };
		const st = l1.prod[k];
		const wet = w13.weather.id === "rain" || w13.weather.id === "snow" || w13.weather.id === "noreaster";
		const hrs = (clock - st.t) / DAY_LENGTH_SEC * 24;
		if (!wet) { st.t = clock; return st; }
		if (hrs >= 12) { const b = Math.floor(hrs / 12); st.t += b * 12 / 24 * DAY_LENGTH_SEC; st.n = Math.min(BARREL_CAP, st.n + b); }
		return st;
	}
	/** Rain collectors pour what they make into a rain barrel within 6 tiles (the barrel stores, the collector produces). */
	function pourCollector(p, st) {
		if (st.n <= 0) return;
		const b = world.props.find((q) => q.kind === "rainbarrel" && Math.hypot(q.tx - p.tx, q.ty - p.ty) <= 6);
		if (!b) return;
		const bs = barrel141(b);
		const mv = Math.min(st.n, BARREL_CAP - bs.n);
		bs.n += mv; st.n -= mv;
	}
	function prodTick(dt) {
		if (!world || mapId !== 0 || mode11) return;
		prodAcc += dt; if (prodAcc < 1) return; prodAcc = 0;
		for (const p of world.props) if (p.p14 && prodOf(p.kind)) { prodRun(p); if (p.kind === "raincollector") pourCollector(p, prodState(p)); }
		for (const p of world.props) if (p.kind === "rainbarrel") barrel141(p);
	}
	function prodUse(p) {
		const def = prodOf(p.kind);
		prodRun(p);
		const st = prodState(p);
		const ch = [];
		if (st.n > 0) ch.push({ label: `Take ${st.n} × ${GEAR[def.makes].name}`, id: `v141-take-${prodKey(p)}` });
		if (def.needs) {
			const can = def.needs.every(([id, n]) => (player.bag.find((s) => s.id === id)?.qty ?? 0) >= n);
			ch.push({ label: `Load it: ${def.needs.map(([id, n]) => `${n} ${GEAR[id].name}`).join(" + ")}${can ? "" : " (you're short)"}`, id: `v141-load-${prodKey(p)}` });
		}
		ch.push({ label: "Leave it", id: "close" });
		const bar = def.kind === "raincollector" ? world.props.find((q) => q.kind === "rainbarrel" && Math.hypot(q.tx - p.tx, q.ty - p.ty) <= 6) : null;
		const status = def.needs ? `Loaded for ${st.load} batch${st.load === 1 ? "" : "es"}.` : bar ? `It pours into the rain barrel next to it (${barrel141(bar).n} of ${BARREL_CAP} jugs stored there).` : def.kind === "raincollector" ? "Set a rain barrel within 6 steps to store what it makes." : "";
		return openD13(def.name, `${def.blurb} One batch every ${def.per} hours. Ready: ${st.n} of ${def.cap}. ${status}`, ch);
	}
	function v141Choice(id) {
		const m = /^v141-(take|load)-(\d+),(\d+)$/.exec(id);
		if (!m) return false;
		const p = world.props.find((q) => q.p14 && q.tx === +m[2] && q.ty === +m[3]);
		if (!p) { dialogue = null; phase = "play"; return true; }
		const def = prodOf(p.kind), st = prodState(p);
		if (m[1] === "take") { const n = st.n; st.n = 0; giveItem(def.makes, n); pushLog(`You take ${n} × ${GEAR[def.makes].name}.`); sfx("gather"); }
		else {
			if (!def.needs) pushLog("Nothing to load into that.");
			else if (!def.needs.every(([iid, n]) => (player.bag.find((s) => s.id === iid)?.qty ?? 0) >= n)) pushLog(`It wants ${def.needs.map(([iid, n]) => `${n} ${GEAR[iid].name}`).join(" and ")}.`);
			else { for (const [iid, n] of def.needs) takeItem(iid, n); st.load += 1; if (st.load === 1) st.t = clock; pushLog(`Loaded. ${def.name} has ${st.load} batch${st.load === 1 ? "" : "es"} to go.`); sfx("build"); }
		}
		dialogue = null; phase = "play"; saveGame(); sync(true);
		return true;
	}
	// ---- pack growth
	function v141Use(def, stack) {
		const lv = BAGS[def.id];
		if (!lv) return false;
		if ((player.bagLv ?? 0) >= lv) { pushLog("Your pack's already that big."); return true; }
		const add = lv - (player.bagLv ?? 0);
		player.bagLv = lv;
		stack.qty -= 1; if (stack.qty <= 0) player.bag = player.bag.filter((s) => s !== stack);
		pushLog(`You stitch the ${def.name.toLowerCase()} on. ${add} more row${add > 1 ? "s" : ""} in the pack.`);
		sfx("build");
		return true;
	}
	// ---- hard mode: the pack stays where you fell
	function dropPack141() {
		if (!w13.hard || !player) return;
		const items = [];
		for (const s of player.bag) { const loose = s.qty - wornCount(player, s.id); if (loose > 0) { items.push({ id: s.id, qty: loose }); s.qty -= loose; } }
		player.bag = player.bag.filter((s) => s.qty > 0);
		if (!items.length) return;
		leavePile(player.x, player.y, "Your pack", items, 0, "", 0);
		l1.drop = { map: mapId, x: player.x, y: player.y, day: curDay() };
		pushLog("Hard mode: your pack stays where you fell. Go back for it.");
	}
	function dropTick() {
		if (!l1.drop || mapId !== l1.drop.map) return;
		const p = piles.find((q) => q.title === "Your pack");
		if (!p || !hasLoot(p)) { l1.drop = null; pushLog("You've got your pack back."); sfx("gather"); saveGame(); sync(true); }
	}
	function dropHud() {
		if (!l1.drop || !player) return "";
		if (mapId !== l1.drop.map) return "Recover your pack: it's back where you fell.";
		const d = Math.round(Math.hypot(l1.drop.x - player.x, l1.drop.y - player.y) / 11 / 3.28);
		const dir = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"][((Math.round(Math.atan2(l1.drop.y - player.y - (l1.drop.x - player.x) * 0, l1.drop.x - player.x) / (Math.PI / 4)) % 8) + 8) % 8];
		return `Recover your pack: ${d} m ${dir}.`;
	}
	// ---- storage: built chests, quick-sort, quick-stack, the farm stash
	function storeOf(key) { return (l1.chests[key] ??= []); }
	function openStore(p) { storeKey = prodKey(p); packOpen = false; statsOpen = false; buildOpen = false; sync(true); }
	function stashPile() {
		if (!player || mapId !== 0) return null;
		return piles.find((q) => q.title === "Farm stash" && Math.hypot(q.x - player.x, q.y - player.y) < 900) ?? null;
	}
	function storeHud() {
		if (!storeKey || !player) return null;
		const items = storeOf(storeKey);
		const loose = player.bag.filter((s) => s.qty - wornCount(player, s.id) > 0).map((s) => ({ id: s.id, name: GEAR[s.id]?.name ?? s.id, qty: s.qty - wornCount(player, s.id) }));
		return { key: storeKey, chest: items.map((s) => ({ id: s.id, name: GEAR[s.id]?.name ?? s.id, qty: s.qty })), pack: loose, stash: !!stashPile() };
	}
	function storeCmd(cmd, id) {
		if (!player) return;
		if (cmd === "close") { storeKey = ""; sync(true); return; }
		if (cmd === "stashAll") {
			// stack every pack item the farm stash already holds into it (and make one if there's none yet)
			let pile = stashPile();
			if (!pile) { leavePile(player.x + 14, player.y + 10, "Farm stash", [], 0, "", 0); pile = piles[piles.length - 1]; if (!pile || pile.title !== "Farm stash") { pile = { id: nextPile++, x: player.x + 14, y: player.y + 10, title: "Farm stash", items: [], scrap: 0, body: "", folk: "", dir: 0, at: clock }; piles.push(pile); } }
			// an empty stash takes every loose supply (food, stock, meds); after that only matching stacks go in
			if (!pile.items.length) for (const s of player.bag) if (GEAR[s.id]?.kind === "supply" && s.qty - wornCount(player, s.id) > 0) pile.items.push({ id: s.id, qty: 0 });
			const [pk, st, n] = quickStack(player.bag, pile.items, (iid) => wornCount(player, iid));
			player.bag = pk.filter((s) => s.qty > 0); pile.items = st.filter((s) => s.qty > 0);
			pushLog(n ? `${n} item${n > 1 ? "s" : ""} stacked into the farm stash.` : "Nothing in your pack matches what's in the stash.");
			saveGame(); sync(true); return;
		}
		if (!storeKey) return;
		const items = storeOf(storeKey);
		if (cmd === "put") {
			const s = player.bag.find((q) => q.id === id); if (!s) return;
			const n = s.qty - wornCount(player, id); if (n <= 0) return;
			s.qty -= n; player.bag = player.bag.filter((q) => q.qty > 0);
			const c = items.find((q) => q.id === id); if (c) c.qty += n; else items.push({ id, qty: n });
		} else if (cmd === "take") {
			const c = items.find((q) => q.id === id); if (!c) return;
			let n = 0; while (n < c.qty && tryGive(id, 1)) n++;
			c.qty -= n; l1.chests[storeKey] = items.filter((q) => q.qty > 0);
			if (n === 0) pushLog("No room in the pack.");
		} else if (cmd === "sort") { l1.chests[storeKey] = sortStacks(items, GEAR); pushLog("Chest sorted."); }
		else if (cmd === "stack") {
			const [pk, st, n] = quickStack(player.bag, items, (iid) => wornCount(player, iid));
			player.bag = pk.filter((s) => s.qty > 0); l1.chests[storeKey] = st;
			pushLog(n ? `${n} item${n > 1 ? "s" : ""} stacked into the chest.` : "Nothing in your pack matches what's in the chest.");
		}
		saveGame(); sync(true);
	}
	// ---- one-thumb stick / keyboard, deceleration, auto-attack
	function keyVec() {
		let x = 0, y = 0;
		if (held("KeyA") || held("ArrowLeft")) x -= 1;
		if (held("KeyD") || held("ArrowRight")) x += 1;
		if (held("KeyW") || held("ArrowUp")) y -= 1;
		if (held("KeyS") || held("ArrowDown")) y += 1;
		return { x, y };
	}
	function stickMove(pace, dt) {
		if (tb) return false;
		const k = keyVec();
		let vx = stickX + k.x, vy = stickY + k.y;
		const mag = Math.hypot(vx, vy);
		if (mag > .18) {
			if (intent && intent.kind === "walk") intent = null;
			if (intent && intent.kind !== "attack") intent = null;
			holdWalk = false;
			const f = Math.min(1, mag);
			vx /= mag; vy /= mag;
			if (!(intent && intent.kind === "attack")) moveBody(player, vx, vy, pace * f, dt);
			coastX = vx * f; coastY = vy * f; coastT = .14;
			return true;
		}
		if (coastT > 0 && !intent) {
			// deceleration ease: glide to a stop over about 0.14 s instead of stopping dead
			const u = coastT / .14;
			moveBody(player, coastX, coastY, pace * u * u, dt);
			coastT -= dt;
			return true;
		}
		coastT = 0;
		return false;
	}
	function autoTick() {
		if (!l1.auto || !player || buildOpen || intent || mounted || tb) return;
		const swing = swingOf();
		const reachD = isGun(GEAR[player.weaponId]?.family) ? 320 : Math.max(90, swing.range + 50);
		let best = null, bd = reachD;
		for (const e of world.enemies) {
			if (e.dead || !(e.aggro && e.temper !== "timid" || e.hollow && e.aggro)) continue;
			const d = Math.hypot(e.x - player.x, e.y - player.y);
			if (d < bd) { bd = d; best = e; }
		}
		if (!best) return;
		if (isGun(GEAR[player.weaponId]?.family) && shellCount(player) <= 0) return;
		intent = { kind: "attack", id: best.id, who: "enemy", path: pathTo(world, player.x, player.y, best.x, best.y) ?? [] };
		attackRepath = 0;
	}
	function hud141() {
		return { crouch: l1.crouch, noise: Math.round(l1.noise), auto: l1.auto, stick: l1.stick, rows: player ? gridRows(player) : 0, bagLv: player?.bagLv ?? 0, small: !!player?.small, drop: dropHud(), store: storeHud(), hard: !!w13.hard, inj: INJURIES.filter((id) => injured(id)).map((id) => ({ id, name: AILMENTS[id].name, text: AILMENTS[id].text, cure: AILMENTS[id].cure })) };
	}
	// ======== v14 world map (hex travel between local areas) ========
	// forced encounters (__wmEnc / __wmKind / __wmForce) always use the world map, even with __v14Skip
	const legacyTravel = () => typeof window !== "undefined" && !!window.__v14Skip && window.__wmEnc == null && !window.__wmKind && !window.__wmForce;
	let wmAcc = 0;
	function wmState() {
		if (!v14.map) { const l = locOfMap(mapId); v14.map = { q: l.q, r: l.r, fog: [], path: [], from: null, warn: "", lastNight: -1, enc: null }; }
		return v14.map;
	}
	function wmReveal(q, r) { const m = wmState(); for (const [a, b] of [[q, r], ...hexNeighbors(q, r)]) { const k = hexKey(a, b); if (!m.fog.includes(k)) m.fog.push(k); } }
	/** v15.9: the walkable iso world IS the world map. The old hex overview screen is gone; leaving a region
	 * (a gate, the bike, a town exit) opens a plain destination menu and the trip runs in the background. */
	function travelDests() {
		const m = wmState(), here = mapId === 9 ? null : locOfMap(mapId);
		const bike = bikeBuilt();
		const out = [];
		for (const l of WM_LOCS) {
			if (locLocked(l, l1.tf) || (here && l.id === here.id) || l.map === mapId) continue; // v15.9.2 (A2): you're already on that map; walk there
			if (l.town && !w13.seen[l.id] && !bike) continue;
			const hrs = hexPath([m.q, m.r], [l.q, l.r], bike).reduce((a, [q, r]) => a + hexHours(q, r, bike), 0);
			out.push({ kind: "loc", id: l.id, name: l.name, hrs });
		}
		for (const r of LOOT_RUNS) if (m.fog.includes(hexKey(r.q, r.r))) out.push({ kind: "loot", id: r.id, name: r.name, hrs: hexPath([m.q, m.r], [r.q, r.r], bike).reduce((a, [q, rr]) => a + hexHours(q, rr, bike), 0) });
		return out;
	}
	function openWorldMap() {
		if (!player || !world) return;
		parkBike(false);
		const m = wmState();
		if (mapId !== 9) { const l = locOfMap(mapId); m.q = l.q; m.r = l.r; }
		wmReveal(m.q, m.r);
		m.path = [];
		const opts = travelDests().map((d) => ({ label: `${d.name} (${Math.max(1, Math.round(d.hrs))} h)`, id: `v159-go-${d.kind}-${d.id}` }));
		openD13(bikeBuilt() ? "Bike" : "On foot", "Where to?", [...opts, { label: "Stay here", id: "close" }]);
	}
	function travel159(kind, id) {
		const m = wmState();
		const dest = kind === "loot" ? LOOT_RUNS.find((r) => r.id === id) : WM_LOCS.find((l) => l.id === id && !locLocked(l, l1.tf));
		if (!dest || !player) return;
		regions.set(mapId, captureRegion());
		const bike = bikeBuilt();
		// v15.1: with the Pittsfield handcar running, Pittsfield <-> Skowhegan is one rail hop
		const here = locAt(m.q, m.r), rail = ["pittsfield", "skowhegan", "skow"];
		if (kind === "loc" && w13.main?.flags?.handcar && here && here.id !== dest.id && rail.includes(here.id) && rail.includes(dest.id) && (here.id === "pittsfield" || dest.id === "pittsfield")) {
			m.from = [m.q, m.r]; m.q = dest.q; m.r = dest.r; clock += DAY_LENGTH_SEC / 24; needsTick(1); wmReveal(dest.q, dest.r);
			w13.main.flags.railRidden = true; townQuestsDone();
			pushLog(`You pump the handcar down the Maine Central line to ${dest.name}. An hour, and your arms know it.`);
			wmEnter(dest); return;
		}
		const path = hexPath([m.q, m.r], [dest.q, dest.r], bike);
		const rc = WM_LOCS.find((l) => l.id === "raiders");
		for (const [q, r] of path) {
			m.from = [m.q, m.r]; m.q = q; m.r = r;
			const hrs = hexHours(q, r, bike);
			clock += hrs / 24 * DAY_LENGTH_SEC; needsTick(hrs); wmReveal(q, r);
			const last = q === dest.q && r === dest.r;
			const near = !!rc && Math.abs(q - rc.q) + Math.abs(r - rc.r) <= 3;
			const roll = typeof window !== "undefined" && window.__wmEnc != null ? window.__wmEnc : Math.random();
			if (!last && !locAt(q, r) && !lootRunAt(q, r) && roll < (near ? .22 : .07)) { wmEncounter(near); return; }
		}
		if (kind === "loot") { lootEnter(dest); return; }
		pushLog(`${bike ? "You ride" : "You walk"} to ${dest.name}.`);
		wmEnter(dest);
	}
	/** v15.4: world-map spots behind a quest lock (Greenville) don't exist until their flags are set. */
	function locAt(q, r) { const l = locAtRaw(q, r); return l && locLocked(l, l1.tf) ? null : l; }
	function wmArrive(target, from) {
		travelTo(target, () => {
			if (!from || !world.gates.length) return null;
			const c = hexCenter(wmState().q, wmState().r), f = hexCenter(from[0], from[1]);
			const want = Math.atan2(f.y - c.y, f.x - c.x);
			let best = null, bd = 9;
			for (const g of world.gates) {
				const a = Math.atan2(g.arriveTy - HEX_CY, g.arriveTx - HEX_CX);
				let d = Math.abs(a - want); if (d > Math.PI) d = Math.PI * 2 - d;
				if (d < bd) { bd = d; best = g; }
			}
			return best ? { x: best.arriveTx * 64 + 32, y: best.arriveTy * 64 + 32 } : null;
		});
		phase = "play";
		travelLock = 2;
		hollowedArea(target);
	}
	// ======== v14.3 town layer: a separate town game in a full-screen iframe (see town.ts / TOWN_PROTOCOL.md) ========
	let town = null, townN = 0;
	var CAMPS13_AT = [["camp0", 50, 30], ["camp1", 30, 70], ["camp2", 30, 30]];
	function townSrc(id) {
		const o = typeof window !== "undefined" && window.__townSrc;
		const app = townApp(id), ent = townEntry(id), q = app !== ent ? `?town=${ent}` : "";
		return ((typeof o === "string" ? o : o?.[app]) || TOWN_SRC[app] || `/towns/${app}/index.html`) + (q && !(typeof o === "string" ? o : o?.[app] ?? TOWN_SRC[app] ?? "").includes("?") ? q : q ? `&town=${ent}` : "");
	}
	/** v14.4: towns live in the iso world. Harmony village sits beside the road a short walk from the farm (map 0). */
	/** v15: Town Acts 2-5 open the same town app at a scene entry (TOWN_HANDOFF.md); at: a fixed tile, else a road spot near the farm / map middle. */
	const ISO_TOWNS = [
		{ id: "harmony", name: "Harmony village", map: 0 },
		{ id: "raiders", name: "Saw's camp at the gravel pit", map: 0, at: [CAMPS13_AT[0][1], CAMPS13_AT[0][2]], act: 5 },
		{ id: "north", name: "Hole's camp in the Holeb cut", map: 1, at: [CAMPS13_AT[1][1], CAMPS13_AT[1][2]], act: 5 },
		{ id: "skow", name: "Skowhegan bridge", map: 2 },
		{ id: "kennebec", name: "Kennebec Crossing", map: 4 },
		{ id: "bunker", name: "Jack Ready's ridge", map: 6 },
		{ id: "grokwoods", name: "The Grok's woods", map: 1, act: 6, upto: 6 },
		{ id: "depot", name: "The Collector's depot", map: 1, at: [92, 34], act: 6, upto: 6 },
		// v15.1: Quest RPG's Pittsfield (southeast of Harmony, by the co-op on the farm map) and Skowhegan (Water St, between the hospital and mill on map 2).
		// app: which town game; entry: the enterTown.town id it gets. Sub-entries open the same game at a scene and have no safe zone of their own.
		{ id: "pittsfield", name: "Pittsfield", map: 0, at: [98, 66], app: "pittsfield", entry: "pittsfield" },
		{ id: "pf-coop", name: "Pittsfield co-op", map: 0, at: [Q10_SITES.coop.tx, Q10_SITES.coop.ty + 3], app: "pittsfield", entry: "coop", sub: true },
		{ id: "pf-depot", name: "Pittsfield depot", map: 0, at: [104, 60], app: "pittsfield", entry: "depot", sub: true },
		{ id: "skowhegan", name: "Skowhegan · Water Street", map: 2, at: [56, 60], app: "skowhegan", entry: "skowhegan" },
		{ id: "sk-hospital", name: "Redington hospital", map: 2, at: [Q11_SITES.skowHospital.tx, Q11_SITES.skowHospital.ty + 3], app: "skowhegan", entry: "hospital", sub: true },
		{ id: "sk-mill", name: "Woolen mill floor", map: 2, at: [Q11_SITES.skowMill.tx, Q11_SITES.skowMill.ty + 3], app: "skowhegan", entry: "mill", sub: true },
		{ id: "sk-marcel", name: "Marcel's store", map: 2, at: [62, 64], app: "skowhegan", entry: "marcelstore", sub: true },
	];
	const townDef = (id) => ISO_TOWNS.find((t) => t.id === id);
	const townApp = (id) => { const t = townDef(id); return t ? t.app ?? "harmony" : id; };
	/** The enterTown.town id for a marker: harmony entries are their own id, Pittsfield/Skowhegan markers name their scene entry. */
	const townEntry = (id) => townDef(id)?.entry ?? id;
	/** v15.8: each town arms on its own (one shared flag let any far town re-arm the near one). Leaving or
	 * spawning disarms them all; each re-arms once you're 170 px from it. */
	const townArm = {};
	function townDisarm() { for (const t of ISO_TOWNS) townArm[t.id] = false; }
	/** v15.9.3: every generated map is thinned by ~45% (open ground, roads and the farm most; forest interiors and the
	 * North Woods least). Deterministic per tile, ids untouched, so saves (removed / placed ids) still line up. */
	function createWorld(seed, map, exits) {
		const w = createWorld0(seed, map, exits);
		thinTrees193(w, map);
		thinWreck195(w);
		return w;
	}
	const isTree193 = (p) => p.kind.startsWith("tree-");
	/** v15.9.5: dense wreck / rubble clutter (dead cars, scrap heaps, crates, broken wall) is thinned where 3+ pieces sit
	 * within 3 tiles: ~40% of those go. Deterministic per tile, ids untouched, lone pieces always stay. */
	const WRECK195 = new Set(["car-sedan", "car-truck", "scrap", "crates", "wall"]);
	function thinWreck195(w) {
		const H = w.tiles.length / MAP_W;
		const grid = new Uint8Array(w.tiles.length);
		for (const p of w.props) if (WRECK195.has(p.kind)) grid[p.ty * MAP_W + p.tx] = 1;
		const before = w.props.length;
		w.props = w.props.filter((p) => {
			if (!WRECK195.has(p.kind) || p.quest || p.label) return true;
			let nb = 0;
			for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { if (!dx && !dy) continue; const xx = p.tx + dx, yy = p.ty + dy; if (xx >= 0 && yy >= 0 && xx < MAP_W && yy < H && grid[yy * MAP_W + xx]) nb++; }
			if (nb < 3) return true;
			const h = ((Math.imul(p.tx, 83492791) ^ Math.imul(p.ty, 2654435761) ^ 0x27d4eb2d) >>> 0) % 1000 / 1000;
			if (h >= .4) return true;
			vacate(w, p);
			return false;
		});
		w.thinWreck195 = before - w.props.length;
	}
	function thinTrees193(w, map) {
		const H = w.tiles.length / MAP_W;
		const grid = new Uint8Array(w.tiles.length);
		for (const p of w.props) if (isTree193(p)) grid[p.ty * MAP_W + p.tx] = 1;
		const nearRoad = new Uint8Array(w.tiles.length);
		for (let y = 0; y < H; y++) for (let x = 0; x < MAP_W; x++) if (w.tiles[y * MAP_W + x] === 2) {
			for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < MAP_W && yy < H) nearRoad[yy * MAP_W + xx] = 1; }
		}
		const before = w.props.length;
		// town entrance spots are still picked as if the cut trees stood (so arrivals land where they always did)
		const ghost = new Uint8Array(w.tiles.length);
		w.thinGhost193 = ghost;
		w.props = w.props.filter((p) => {
			if (!isTree193(p)) return true;
			let nb = 0;
			for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { if (!dx && !dy) continue; const xx = p.tx + dx, yy = p.ty + dy; if (xx >= 0 && yy >= 0 && xx < MAP_W && yy < H && grid[yy * MAP_W + xx]) nb++; }
			let cut;
			if (map === 0 && inFarm(p.tx, p.ty)) cut = .8;
			else if (nearRoad[p.ty * MAP_W + p.tx]) cut = .72;
			else if (nb <= 3) cut = .55;
			else if (nb <= 7) cut = .35;
			else cut = .18;
			if (map === 1) cut *= .6; // the North Woods stay woods
			const h = ((Math.imul(p.tx, 73856093) ^ Math.imul(p.ty, 19349663) ^ 0x5bd1e995) >>> 0) % 1000 / 1000;
			if (h >= cut) return true;
			ghost[p.ty * MAP_W + p.tx] = 1;
			vacate(w, p);
			return false;
		});
		w.thin193 = before - w.props.length;
	}
	/** v15.9.3: no trees or tall bushes around a town's entrance, its icon, the camera side of it, or the road leading in. */
	function clearTown193(spot) {
		if (!world || !spot) return;
		const ex = Math.floor(spot.x / TILE), ey = Math.floor(spot.y / TILE), rx = Math.floor(spot.roadX / TILE), ry = Math.floor(spot.roadY / TILE);
		const H = world.tiles.length / MAP_W;
		const roadNear = new Set();
		for (let y = ey - 14; y <= ey + 14; y++) for (let x = ex - 14; x <= ex + 14; x++) if (x >= 0 && y >= 0 && x < MAP_W && y < H && world.tiles[y * MAP_W + x] === 2) roadNear.add(y * MAP_W + x);
		const hit = (p) => {
			for (const [cx, cy] of [[ex, ey], [rx, ry]]) {
				const dx = p.tx - cx, dy = p.ty - cy;
				if (dx * dx + dy * dy <= 81) return true;
				if (dx + dy > 0 && dx + dy <= 18 && Math.abs(dx - dy) <= 12) return true; // camera side: tall art would cover the icon
			}
			for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (roadNear.has((p.ty + dy) * MAP_W + p.tx + dx)) return true;
			return false;
		};
		world.props = world.props.filter((p) => {
			if (!isTree193(p) && p.kind !== "maple") return true;
			if (!hit(p)) return true;
			vacate(world, p);
			return false;
		});
	}
	/** v15.9.7: the bigger towns (church, houses, fence) need their lot clear: no trees, rocks, wrecks or ruins on the
	 * ground the town art stands on or in front of it. Quest props and labelled buildings stay. */
	const LOT_KINDS = /^(tree-|maple$|rock$|ruin$|shack$|car-|scrap$|crates$|wall$|logs$)/;
	// real doors: the lots grew with the 1.56x buildings. v15.9.7 cleared the layout's old x-extent +-260 px, -300..420 px deep;
	// exactly that still goes. The rest of what the bigger lot covers is moved just behind the lot (props that a nearby marker's
	// clear-out would take anyway still go), so tree/rock counts and the frame cost stay as they were. Deterministic, ids untouched.
	const LOT_OLD_X = { harmony: [-560, 540], pittsfield: [-390, 360], skowhegan: [-400, 160] };
	function clearTownLot(t, spot) {
		if (!world || !spot || !TOWN_HOUSES[t.id]) return;
		const parts = TOWN_HOUSES[t.id];
		const xs = parts.map(([, dx]) => dx), x0 = Math.min(...xs) - 340, x1 = Math.max(...xs) + 340; // half a building is now ~310 px wide
		const [o0, o1] = LOT_OLD_X[t.id] ?? [x0 + 340, x1 - 340];
		const others = ISO_TOWNS.filter((o) => o.id !== t.id && o.map === t.map && o.at && !TOWN_HOUSES[o.id]).map((o) => [o.at[0] + WORLD_OX, o.at[1] + WORLD_OY]);
		const nearOther = (tx, ty) => others.some(([cx, cy]) => { const dx = tx - cx, dy = ty - cy; return dx * dx + dy * dy <= 121 || (dx + dy > 0 && dx + dy <= 21 && Math.abs(dx - dy) <= 15); });
		const tall = (p) => p.kind === "ruin" || p.kind === "shack";
		const scr = (p) => { const c = propCenter(p), wx = c.x - spot.x, wy = c.y - spot.y; return { sdx: wx - wy, sdy: (wx + wy) * CAM_ISO_Y }; };
		const inLot = (p) => { const { sdx, sdy } = scr(p); return sdx >= x0 && sdx <= x1 && sdy >= -340 && sdy <= (tall(p) ? 640 : 480); };
		const inOld = (p) => { const { sdx, sdy } = scr(p); return sdx >= o0 - 260 && sdx <= o1 + 260 && sdy >= -300 && sdy <= (tall(p) ? 640 : 420); };
		// left in place near another marker: its own clear-out (which runs for every marker on load) takes it, as before
		const victims = world.props.filter((p) => LOT_KINDS.test(p.kind) && !(p.quest || p.label || p.built || p.p14 || p.f14) && inLot(p) && (inOld(p) || !nearOther(p.tx, p.ty)));
		if (!victims.length) return;
		const drop = new Set();
		for (const p of victims) { vacate(world, p); if (inOld(p)) drop.add(p); }
		const H = world.tiles.length / MAP_W, moving = new Set(victims), taken = new Set();
		for (const q of world.props) if (!moving.has(q)) { const sp = PROP_SPEC[q.kind]; for (let y = 0; y < sp.h; y++) for (let x = 0; x < sp.w; x++) taken.add((q.ty + y) * MAP_W + q.tx + x); }
		for (const p of victims) {
			if (drop.has(p)) continue;
			const sp = PROP_SPEC[p.kind], { sdx } = scr(p);
			let moved = false;
			for (let k = 0; k < 40 && !moved; k++) {
				// step back (up-screen) past the lot, fanning sideways a little
				const ty0 = -380 - (k >> 2) * 40, tx0 = sdx + ((k & 3) - 1.5) * 70, a = ty0 / CAM_ISO_Y;
				const nx = Math.round((spot.x + (tx0 + a) / 2) / TILE - sp.w / 2), ny = Math.round((spot.y + (a - tx0) / 2) / TILE - sp.h / 2);
				let ok = nx > 6 && ny > 6 && nx + sp.w < MAP_W - 6 && ny + sp.h < H - 6 && !nearOther(nx, ny);
				for (let y = 0; ok && y < sp.h; y++) for (let x = 0; ok && x < sp.w; x++) {
					const i = (ny + y) * MAP_W + nx + x;
					if (world.blocked[i] || world.tiles[i] === 2 || world.tiles[i] === 5 || taken.has(i) || inFarm(nx + x, ny + y)) ok = false;
				}
				if (!ok) continue;
				p.tx = nx; p.ty = ny; occupy(world, p); moved = true;
				for (let y = 0; y < sp.h; y++) for (let x = 0; x < sp.w; x++) taken.add((ny + y) * MAP_W + nx + x);
			}
			if (!moved) drop.add(p);
		}
		world.props = world.props.filter((p) => !drop.has(p));
	}
	function townSpot(t) {
		if (!world || mapId !== t.map) return null;
		world.townSpots = world.townSpots ?? {};
		if (world.townSpots[t.id] !== undefined) return world.townSpots[t.id];
		const fc = t.at ? { tx: t.at[0] + WORLD_OX, ty: t.at[1] + WORLD_OY } : t.map === 0 ? tileOf(farmCenter().x, farmCenter().y) : { tx: MAP_W >> 1, ty: MAP_H >> 1 };
		let spot = null;
		const ghost = world.thinGhost193;
		const free = (x, y) => x > 6 && y > 6 && x < MAP_W - 6 && !inFarm(x, y) && world.tiles[y * MAP_W + x] !== 2 && !(ghost && ghost[y * MAP_W + x]) && !pointBlocked(world, x * TILE + 32, y * TILE + 32, 40);
		const r0 = t.id === "harmony" ? 14 : t.at ? 3 : 0, r1 = t.id === "harmony" ? 30 : 26;
		for (const road of [true, false]) for (let r = r0; r <= r1 && !spot; r++) for (let a = 0; a < 360 && !spot; a += 8) {
			const x = Math.round(fc.tx + Math.cos(a * Math.PI / 180) * r), y = Math.round(fc.ty + Math.sin(a * Math.PI / 180) * r);
			if (road && world.tiles[y * MAP_W + x] !== 2) continue;
			if (!road && !free(x, y)) continue;
			for (const [dx, dy] of [[2, 0], [0, 2], [-2, 0], [0, -2], [2, 2], [-2, -2]]) if (free(x + dx, y + dy) && free(x + dx + 1, y + dy) && free(x + dx, y + dy + 1)) { spot = { x: (x + dx) * TILE + 32, y: (y + dy) * TILE + 32, roadX: x * TILE + 32, roadY: y * TILE + 32 }; break; }
		}
		world.townSpots[t.id] = spot;
		clearTown193(spot);
		clearTownLot(t, spot);
		return spot;
	}
	/** v15 no-attack zones: ~10 tiles around each town marker (not the raider-camp / Grok / depot scenes) and the farmhouse. Raids and the siege ignore them. */
	const SAFE15_R = 10 * TILE, SAFE15_SKIP = new Set(["raiders", "north", "depot", "grokwoods"]);
	let safe15 = { key: "", zones: [] };
	function safeZones() {
		if (!world || inside) return [];
		const key = `${mapId}:${w13.main?.act ?? 1}:${Object.keys(world.townSpots ?? {}).length}`;
		if (safe15.key === key && safe15.w === world) return safe15.zones;
		const zones = [];
		for (const t of ISO_TOWNS) if (t.map === mapId && !SAFE15_SKIP.has(t.id) && !t.sub && townOpen(t)) { const sp = townSpot(t); if (sp) zones.push({ id: t.id, x: sp.x, y: sp.y, r: SAFE15_R }); }
		if (mapId === 7) zones.push({ id: "greenville", x: HEX_CX * TILE + TILE / 2, y: HEX_CY * TILE + TILE / 2, r: 200 * TILE }); // v15.4: the whole Greenville landing is safe
		safe15 = { key, zones, w: world, said: safe15.said };
		return zones;
	}
	function safeAt(x, y) { if ( (typeof window !== "undefined" && window.__safeOff)) return null; return safeZones().find((z) => Math.hypot(x - z.x, y - z.y) < z.r) ?? null; }
	function safeKeep(e) {
		if (e.dead) return;
		const z = safeAt(e.x, e.y);
		if (z) { const a = Math.atan2(e.y - z.y, e.x - z.x) || Math.random() * 6.28; e.x = z.x + Math.cos(a) * (z.r + 4); e.y = z.y + Math.sin(a) * (z.r + 4); e.path = null; }
		const h = safeAt(e.homeX, e.homeY);
		if (h) { const a = Math.atan2(e.homeY - h.y, e.homeX - h.x) || 1; e.homeX = h.x + Math.cos(a) * (h.r + 60); e.homeY = h.y + Math.sin(a) * (h.r + 60); }
		if (player && safeAt(player.x, player.y)) e.aggro = false;
	}
	function townOpen(t) { const a = w13.main?.act ?? 1; return (!t.act || a >= t.act || !!w13.seen?.[t.id]) && (!t.upto || a <= t.upto || !!w13.seen?.[t.id]); }
	function townTick() {
		if (!player || inside || town || phase !== "play") return;
		for (const t of ISO_TOWNS) {
			if (!townOpen(t)) continue;
			const sp = townSpot(t);
			if (!sp) continue;
			const d = Math.hypot(player.x - sp.x, player.y - sp.y);
			if (d > 170) townArm[t.id] = true;
			else if (d < 70 && townArm[t.id] !== false) { townDisarm(); intent = null; openTown({ id: t.id, town: t.id, name: t.name }); }
		}
	}
	/** Where a town quest points from here: the exit gate facing its world-map hex (or null when you're on that map). */
	function questGate(t) {
		if (!world?.gates?.length) return null;
		const here = locOfMap(mapId);
		if (here.q === t.q && here.r === t.r) return null;
		const c = hexCenter(here.q, here.r), f = hexCenter(t.q, t.r);
		const want = Math.atan2(f.y - c.y, f.x - c.x);
		let best = null, bd = 9;
		for (const g of world.gates) {
			const a = Math.atan2(g.arriveTy - HEX_CY, g.arriveTx - HEX_CX);
			let d = Math.abs(a - want); if (d > Math.PI) d = Math.PI * 2 - d;
			if (d < bd) { bd = d; best = g; }
		}
		return best ? { x: best.tx * TILE + 32, y: best.ty * TILE + 32 } : null;
	}
	/** v15.8: town marker houses join the depth-sorted draw list, so people walk in front of and behind them;
	 * the ground shadow goes down with the ground. Offsets are screen px at zoom 1 from the marker. */
	/** v15.9.7: towns in the world are built from Quest's own painted Harmony scenery (church, houses, shed, notice board,
	 * fence; cut from harmony_concept / farm_concept, colours untouched, see scripts/town-art-*.py). Scaled to the hero:
	 * a house is ~4.3x (real doors, v15.9.9; was ~2.75x) the hero's height. Each entry: [art, dx, dy, height] in screen px at zoom 1 from the marker;
	 * dy is where the art meets the ground. The front (toward the camera) is left open so the walk-in spot stays clear. */
	const TOWN_ART = {};
	function townArt(name) {
		if (typeof Image === "undefined") return null;
		let img = TOWN_ART[name];
		if (!img) { img = new Image(); img.src = `/game/town/${name}.png?v=${ART_V}`; TOWN_ART[name] = img; }
		return img.complete && img.naturalWidth ? img : null;
	}
	// size198: every height comes from SIZE_IN (src/game/sizes.ts); house = 319 in = ~4.3x the 74 in hero, so its door reads ~80 in (real doors)
	const TH = (key, art) => townH(key, art);
	const T_HOUSE = ["house", TH("town-house", "house")], T_CHURCH = ["church", TH("town-church", "church")], T_FARM = ["farmhouse", TH("town-farmhouse", "farmhouse")];
	const T_SHED = ["shed", TH("town-shed", "shed")], T_SIGN = ["sign", TH("town-sign", "sign")], T_FENCE = ["fence", TH("town-fence", "fence")];
	const tAt = ([art, h], dx, dy) => [art, dx, dy, h];
	const TOWN_HOUSES = {
		// real doors: buildings ~1.56x bigger than v15.9.7, so the lots are spread out with walkable streets (>=50 px at zoom 1) between
		// them and kept off the lone-farmhouse markers nearby (Saw's camp by Harmony, the Pittsfield co-op / depot, the Skowhegan sub-entries)
		harmony: [tAt(T_FENCE, -1000, 150), tAt(T_HOUSE, -620, -40), tAt(T_CHURCH, 0, -140), tAt(T_FARM, 700, -110), tAt(T_SHED, 1240, 0), tAt(T_SIGN, -270, 110), tAt(T_FENCE, 1250, 190)],
		pittsfield: [tAt(T_FENCE, -700, 150), tAt(T_HOUSE, -1080, 20), tAt(T_SHED, 50, -200), tAt(T_FARM, 1300, -40), tAt(T_SIGN, -160, 100)], // co-op back left, depot front right
		skowhegan: [tAt(T_HOUSE, -900, 60), tAt(T_CHURCH, 760, -60), tAt(T_SIGN, -330, 140), tAt(T_FENCE, -1000, 190)], // mill back left, Marcel's front, hospital right
		_: [["farmhouse", 0, 15, TH("town-farmhouse-lone", "farmhouse")]],
	};
	const TOWN_KEY = { house: "town-house", church: "town-church", farmhouse: "town-farmhouse", shed: "town-shed", sign: "town-sign", fence: "town-fence" };
	const townTop = (id) => Math.max(...(TOWN_HOUSES[id] ?? TOWN_HOUSES._).map(([, , dy, h]) => h - dy)) + 30;
	function townGround(camX, camY) {
		if (!world || !player || inside) return;
		for (const t of ISO_TOWNS) {
			if (!townOpen(t)) continue;
			const sp = townSpot(t); if (!sp) continue;
			const r = worldToScreen(sp.x, sp.y, camX, camY), m = zoomPoint(r.sx, r.sy);
			if (m.sx < -600 || m.sy < -400 || m.sx > viewW + 600 || m.sy > viewH + 400) continue;
			ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(m.sx, m.sy + 6 * zoom, 105 * zoom, 105 * CAM_ISO_Y * .63 * zoom, 0, 0, Math.PI * 2); ctx.fill();
		}
	}
	function townHouseDraws(draws, camX, camY, bodies) {
		if (!world || !player || inside) return;
		for (const t of ISO_TOWNS) {
			if (!townOpen(t)) continue;
			const sp = townSpot(t); if (!sp) continue;
			for (const [art, dx, dy, hgt] of TOWN_HOUSES[t.id] ?? TOWN_HOUSES._) {
				const img = townArt(art);
				if (!img) continue;
				const iw = img.naturalWidth, ih = img.naturalHeight, w = hgt * iw / ih;
				const vx = dy / (2 * CAM_ISO_Y) + dx / 2, vy = dy / (2 * CAM_ISO_Y) - dx / 2;
				const fx = sp.x + vx, fy = sp.y + vy;
				const key = `${t.id}|${art}|${dx}`;
				draws.push({ z: bodyZ(fx, fy), draw: () => {
					const r = worldToScreen(sp.x, sp.y, camX, camY), m = zoomPoint(r.sx, r.sy);
					const x0 = m.sx + dx * zoom - w * zoom / 2, y1 = m.sy + dy * zoom, y0 = y1 - hgt * zoom;
					if (x0 > viewW + 20 || x0 + w * zoom < -20 || y0 > viewH + 20 || y1 < -40) return;
					// fade to ~35% while anyone stands behind it
					let behind = false;
					if (art !== "fence" && art !== "sign") for (const b of bodies) {
						if (bodyZ(b.x, b.y) >= bodyZ(fx, fy)) continue;
						const br = worldToScreen(b.x, b.y, camX, camY), bs = zoomPoint(br.sx, br.sy);
						if (bs.sx > x0 && bs.sx < x0 + w * zoom && bs.sy < y1 && bs.sy > y0) { behind = true; break; }
					}
					const f = townFade.get(key) ?? 0, nf = f + ((behind ? 1 : 0) - f) * Math.min(1, STEP * 10);
					townFade.set(key, nf);
					ctx.save();
					// contact shadow where the building meets the ground
					const sw = w * zoom * (art === "fence" ? .5 : .56), sh = Math.max(4, hgt * zoom * (art === "fence" ? .07 : .09));
					const g = ctx.createRadialGradient(x0 + w * zoom / 2, y1 - sh * .25, 1, x0 + w * zoom / 2, y1 - sh * .25, sw);
					g.addColorStop(0, "rgba(0,0,0,.42)"); g.addColorStop(.7, "rgba(0,0,0,.22)"); g.addColorStop(1, "rgba(0,0,0,0)");
					ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x0 + w * zoom / 2, y1 - sh * .25, sw, sh, 0, 0, Math.PI * 2); ctx.fill();
					ctx.globalAlpha = 1 - nf * .65;
					ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
					ctx.drawImage(img, x0, y0, w * zoom, hgt * zoom);
					SIZE_SEEN.set(`town:${art}:${hgt}`, hgt);
					ctx.restore();
				} });
			}
		}
	}
	const townFade = new Map();
	const TOWN_ICON159 = { harmony: "harmony", pittsfield: "pittsfield", skowhegan: "skowhegan", skow: "skowhegan", greenville: "greenville" };
	/** v15.9.7: lone buildings out in the world (a shack or a ruin with no town around it) are lootable: walk in and
	 * open the chest. Nearby ones that still hold something get a small "Loot" tag, like the approved HUD mockup. */
	function loneBuilding(p) {
		if (!world || p.built || p.label || p.quest || !(p.kind === "shack" || p.kind === "ruin")) return false;
		for (const t of ISO_TOWNS) { if (t.map !== mapId) continue; const sp = townSpot(t); if (sp && Math.hypot(sp.x - (p.tx + 1.5) * TILE, sp.y - (p.ty + 1.5) * TILE) < 16 * TILE) return false; }
		return true;
	}
	function lootTags(sx) {
		if (!world || !player || inside || mode11) return;
		for (const p of world.props) {
			if (p.kind !== "shack" && p.kind !== "ruin") continue;
			const cx = (p.tx + 1.5) * TILE, cy = (p.ty + 1.5) * TILE;
			if (Math.hypot(cx - player.x, cy - player.y) > 420 || lootedChests.has(p.id) || !loneBuilding(p)) continue;
			const m = sx(cx, cy), spec = PROP_SPEC[p.kind];
			const label = "Loot", y = m.sy + 18 * zoom;
			ctx.save();
			ctx.font = `700 ${Math.round(12 * Math.max(1, zoom * .8))}px system-ui, sans-serif`; ctx.textAlign = "center";
			const w = ctx.measureText(label).width + 18;
			ctx.fillStyle = "rgba(40,28,18,.88)"; ctx.fillRect(m.sx - w / 2, y - 14, w, 20);
			ctx.strokeStyle = "#b08a52"; ctx.lineWidth = 1.5; ctx.strokeRect(m.sx - w / 2 + .5, y - 13.5, w - 1, 19);
			ctx.fillStyle = "#f4e6c4"; ctx.fillText(label, m.sx, y + 1);
			ctx.restore();
			void spec;
		}
	}
	function paintTowns(camX, camY) {
		if (!world || !player || inside) return;
		const sx = (x, y) => { const r = worldToScreen(x, y, camX, camY); return zoomPoint(r.sx, r.sy); };
		for (const t of ISO_TOWNS) {
			if (!townOpen(t)) continue;
			const sp = townSpot(t);
			if (!sp) continue;
			const m = sx(sp.x, sp.y);
			if (m.sx < -200 || m.sy < -200 || m.sx > viewW + 200 || m.sy > viewH + 200) continue;
			ctx.save(); // v15.8: the houses are depth-sorted with everything else (townHouseDraws); only the label is drawn here
			const near = Math.hypot(player.x - sp.x, player.y - sp.y) < 260;
			const label = near ? `${t.name} · walk in` : t.name;
			ctx.globalAlpha = 1;
			ctx.font = `700 ${Math.round(13 * Math.max(1, zoom * .8))}px system-ui, sans-serif`; ctx.textAlign = "center";
			const w = ctx.measureText(label).width + 16, ly = m.sy - townTop(t.id) * zoom;
			ctx.fillStyle = "rgba(15,12,8,.82)"; ctx.fillRect(m.sx - w / 2, ly - 15, w, 21);
			ctx.strokeStyle = "#c9a36a"; ctx.lineWidth = 1; ctx.strokeRect(m.sx - w / 2 + .5, ly - 14.5, w - 1, 20);
			ctx.fillStyle = "#f4e6c4"; ctx.fillText(label, m.sx, ly);
			const ic = images.get(`v4/icons/${TOWN_ICON159[t.id] ?? ""}_icon_v4`); // v15.9: Quest's town icon as the entrance sign
			if (ic && (ic.naturalWidth || ic.width)) { const d = 46 * Math.max(1, zoom * .8); ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 6; ctx.drawImage(ic, m.sx - d / 2, ly - 20 - d, d, d); }
			ctx.restore();
		}
		lootTags(sx);
		// town quests: an arrow at the screen edge toward the exit that leads there
		townQuestsDone();
		let row = 0;
		// v14.6: quests that point the same way share one arrow; their labels stack under it
		const groups = new Map();
		for (const q of l1.tq ?? []) {
			const g = questGate(q);
			const k = g ? `${g.x},${g.y}` : "here";
			if (!groups.has(k)) groups.set(k, { g, labels: [] });
			groups.get(k).labels.push(q.label);
		}
		for (const { g, labels } of groups.values()) {
			const q = { label: labels.join(" · ") };
			ctx.save();
			ctx.font = "600 12px system-ui, sans-serif"; ctx.textAlign = "center";
			if (!g) { const p = sx(player.x, player.y); ctx.fillStyle = "#f0c040"; ctx.fillText(`★ ${q.label}: you're here`, p.sx, p.sy - 80 * zoom - row * 16); ctx.restore(); row++; continue; }
			const p = sx(player.x, player.y), gm = sx(g.x, g.y);
			const ang = Math.atan2(gm.sy - p.sy, gm.sx - p.sx);
			const rx = viewW / 2 - 46, ry = viewH / 2 - 46;
			const k = Math.min(rx / Math.max(1e-3, Math.abs(Math.cos(ang))), ry / Math.max(1e-3, Math.abs(Math.sin(ang))));
			const onScreen = gm.sx > 30 && gm.sy > 30 && gm.sx < viewW - 30 && gm.sy < viewH - 30;
			const ax = onScreen ? gm.sx : viewW / 2 + Math.cos(ang) * k, ay = onScreen ? gm.sy - 30 : viewH / 2 + Math.sin(ang) * k;
			ctx.translate(ax, ay); ctx.rotate(onScreen ? Math.PI / 2 : ang);
			ctx.fillStyle = "#f0c040"; ctx.strokeStyle = "#1c1814"; ctx.lineWidth = 3;
			ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -11); ctx.lineTo(-4, 0); ctx.lineTo(-10, 11); ctx.closePath(); ctx.stroke(); ctx.fill();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.restore(); ctx.save();
			ctx.font = "600 12px system-ui, sans-serif"; ctx.textAlign = "center";
			// v14.7: labels sit inward from the arrow (toward the middle of the view), clear of the corner HUD and zoom buttons
			const inX = onScreen ? ax : ax - Math.cos(ang) * 64, inY = onScreen ? ay - 20 : ay - Math.sin(ang) * 64;
			const lx = Math.max(viewW * .28, Math.min(viewW * .72, inX)), lyy = Math.max(60, Math.min(viewH * .62, inY));
			const up = lyy > viewH / 2 ? -1 : 1;
			labels.forEach((lab, i) => {
				const yy = lyy + up * i * 20;
				const w = ctx.measureText(lab).width + 12; ctx.fillStyle = "rgba(15,12,8,.8)"; ctx.fillRect(lx - w / 2, yy - 13, w, 18);
				ctx.fillStyle = "#f0c040"; ctx.fillText(lab, lx, yy);
			});
			ctx.restore();
		}
	}
	function openTown(l) {
		w13.seen[l.id] = true;
		town = { id: l.town, loc: l.id, src: townSrc(l.town) + (l.scene ? `${townSrc(l.town).includes("?") ? "&" : "?"}scene=${l.scene}` : ""), n: (townN = townN + 1), scene: l.scene };
		phase = "town"; intent = null; buildOpen = false; craftOpen = false; dialogue = null;
		pushLog(`${l.name}.`);
		saveGame(); autosave15(`Entered ${l.name}`); sync(true);
	}
	function townState() {
		const p = player;
		const inj = {};
		for (const [k, id] of INJ_MAP) inj[k] = injured(id);
		const id = townApp(town?.id ?? "harmony");
		return {
			inventory: (p?.bag ?? []).filter((s) => s.qty > 0).map((s) => ({ ...(l1.itemProps?.[s.id] ?? {}), id: s.id, qty: s.qty, name: GEAR[s.id]?.name ?? s.id })), // v15.9: unknown item props ride along
			// v15.9: one shared class list (shared-rules/stats.json); the id goes straight through. A class the town sent back is returned exactly.
			class: l1.tClass ?? p?.role ?? "fighter", className: roleKit(p?.role ?? "fighter").title,
			name: p?.name ?? "", look: p?.look ?? "", hair: p?.hair ?? "", appearance: { coatId: p?.coatId ?? "", headId: p?.headId ?? "", legsId: p?.legsId ?? "", feetId: p?.feetId ?? "" },
			perks: [...(p?.perks ?? [])], role: p?.role ?? "fighter", trait: p?.trait ?? "", backstory: w13.backstory ?? "", level: p?.level ?? 1, xp: p?.xp ?? 0, points: p?.points ?? 0,
			tags: [...(p?.tags ?? [])], invested: { ...(p?.invested ?? {}) }, skillPoints: p?.skillPoints ?? 0,
			skills: JSON.parse(JSON.stringify({ ...(l1.tSkills ?? {}) })), karma: p?.karma ?? 0, rep: { ...(p?.rep ?? {}) },
			skillScores: p ? Object.fromEntries(SKILLS.map((k) => [k.id, skillOf(k.id)])) : {},
			hp: p?.hp ?? 0, maxHp: p?.maxHp ?? 44,
			injuries: inj,
			companions: (l1.tComp ?? []).length ? JSON.parse(JSON.stringify(l1.tComp)) : [
				{ id: "cyndal", name: "Cyndal", withYou: !!escortBodies?.length },
				{ id: "loki", name: "Loki", withYou: !!escortBodies?.length },
				{ id: "goose", name: "Goose", withYou: q10.dog === 3 },
			],
			questFlags: { ...(l1.tf ?? {}), "story.stage": v14.st ?? 0, "story.gooseFound": q10.dog >= 3, "story.day": curDay() + 1, ...townStoryFlags(), ...Object.fromEntries(Object.keys(w13.seen ?? {}).filter((k) => w13.seen[k]).map((k) => [`story.seen.${k}`, true])) },
			// v15.9: agility/grit live in w13.core; a real 0 stays 0
			stats: Object.fromEntries(["strength", "vigor", "endurance", "intellect", "perception", "luck", "agility", "grit"].map((k) => { const v = Number(k === "agility" || k === "grit" ? w13.core?.[k] : p?.[k]); return [k, Number.isFinite(v) ? v : 1]; })),
			day: curDay() + 1, time: clockLabel(clock).replace(/^Day \d+ · /, ""),
			// v15.1: one character carries between towns: the town's own extra, with the latest class/skills/stats from any town on top
			extra: JSON.parse(JSON.stringify({ ...(l1.tx?.[id] ?? {}), ...sharedTownExtra() })),
			sharedExtra: JSON.parse(JSON.stringify(l1.tx?.shared ?? {})),
		};
	}
	/** v15.9.6: stored town flags are echoed back on the next enterTown. Forward-only keys never move back in the store:
	 * farm.q10.* / farm.q11.* rank "accepted" < stage numbers < "done"; harmony.siegeDone keeps its first result; harmony.collectorDown stays true. */
	function keepFlag(k, old, v) {
		if (old === undefined) return v;
		if (/^farm\.q1[01]\./.test(k)) {
			const rank = (x) => x === "done" ? 1e9 : typeof x === "number" && Number.isFinite(x) ? x : x === "accepted" ? 0.5 : -1;
			// an early "done" the main game refused (quest not at its turn-in yet) doesn't block a later stage number
			if (old === "done" && typeof v === "number" && !farmQuestClosed(k)) return v;
			return rank(v) >= rank(old) ? v : old;
		}
		if (k === "harmony.siegeDone") return [true, "done", "won", "lost"].includes(old) ? old : v;
		if (k === "harmony.collectorDown") return old === true ? true : v;
		return v;
	}
	function farmQuestClosed(k) {
		const [, set, id] = k.split(".");
		if (set === "q10") return (q10[id] ?? 0) >= ({ seed: 4, ferry: 2, moose: 4, dog: 3, radio: 2 }[id] ?? 0) + 1;
		const q = Q11.find((x) => x.id === id);
		return !!q && (q11.q[id]?.s ?? 0) > q.steps.length + 1;
	}
	function sharedTownExtra() {
		const sh = l1.tx?.shared;
		if (!sh || typeof sh !== "object") return {};
		const o = {};
		for (const k of ["schema", "cls", "skills", "stats"]) if (sh[k] !== undefined) o[k] = sh[k];
		return o;
	}
	function townEnterMsg() { return town ? { type: "enterTown", protocol: TOWN_PROTOCOL, town: townEntry(town.id), state: { ...townState(), ...(town.scene ? { scene: town.scene } : town.id === "harmony" ? { scene: "harmony" } : {}) } } : null; } // v15.9: the Harmony marker opens Main Street, not the farm
	/** Apply a {type:'leaveTown', exit, state} from the town game. Anything missing or malformed is left as it was. */
	function leaveTown(msg) {
		if (!town || !player || !msg || msg.type !== "leaveTown") return false;
		const st = msg.state && typeof msg.state === "object" ? msg.state : {};
		const inv = cleanInventory(st.inventory, (id) => !!GEAR[id]);
		if (inv) {
			const want = new Map(inv.map((q) => [q.id, q.qty]));
			// v15.9 (audit A1): the town only keeps ids in its own ITEMS table. Only take items the town is known to
			// handle (it has handed them back before, now or on an earlier visit); anything else stays in the bag untouched.
			l1.tKnown = l1.tKnown ?? {}; const app = townApp(town.id); const known = new Set([...(l1.tKnown[app] ?? []), ...want.keys()]); l1.tKnown[app] = [...known];
			// a town that hands back the whole pack (v1.9 towns keep unknown items; they send points/tags) is a full list: missing = used up
			const sent = player.bag.filter((b) => b.qty > 0).map((b) => b.id), back = sent.filter((x) => want.has(x)).length;
			const full = typeof st.points === "number" || Array.isArray(st.tags) || (sent.length > 0 && back / sent.length >= .6);
			for (const s of [...player.bag]) { if (!full && !known.has(s.id)) continue; const n = want.get(s.id) ?? 0; if (s.qty > n) takeItem(s.id, s.qty - n); }
			for (const [id, n] of want) { const have = countOf(id); if (n > have) giveItem(id, n - have); }
			refreshGear(player);
		}
		townAccept159(st);
		if (Number.isFinite(Number(st.hp))) player.hp = Math.max(1, Math.min(player.maxHp ?? 44, Math.round(Number(st.hp))));
		if (st.injuries && typeof st.injuries === "object") for (const [k, id] of INJ_MAP) {
			if (st.injuries[k] === false && w13.ail[id]) delete w13.ail[id];
			else if (st.injuries[k] === true && !w13.ail[id]) w13.ail[id] = curDay() + 1;
		}
		if (st.questFlags && typeof st.questFlags === "object") {
			l1.tf = l1.tf ?? {};
			for (const [k, v] of Object.entries(st.questFlags)) if (!k.startsWith("story.") && ["string", "number", "boolean"].includes(typeof v)) l1.tf[k] = keepFlag(k, l1.tf[k], v);
		}
		const moved = townMapFlags(l1.tf);
		if (moved.length) pushLog("Word from town changes your plans. Check the journal.");
		townQuestsDone();
		if (st.extra && typeof st.extra === "object" && !Array.isArray(st.extra)) { l1.tx = l1.tx ?? {}; l1.tx[townApp(town.id)] = JSON.parse(JSON.stringify(st.extra)); l1.tx.shared = { ...(l1.tx.shared ?? {}), ...JSON.parse(JSON.stringify(st.extra)), from: townApp(town.id) }; }
		// v15.3: the town's motor bike hands over a fast-travel pick; ride straight to that town instead of the normal exit
		const ft = typeof msg.fastTravel === "string" ? msg.fastTravel : "";
		const ftId = FT15_ALIAS[ft] ?? ft;
		if (ft && FT15_HOURS[ft] === undefined) pushLog(`You can't ride to "${ft}" from here.`);
		if (FT15_HOURS[ftId] !== undefined && ftId !== townApp(town.id)) { townQuestsDone(); fastTravel15(ftId); return true; }
		const exit = typeof msg.exit === "string" ? msg.exit : "town";
		const tdef = ISO_TOWNS.find((t) => t.id === town.id);
		// v15.1: Skowhegan's bridge hotspot (Fur & Mask still hold it) hands over to quest-harmony's Skowhegan bridge crossing
		if (exit === "bridge" && townApp(town.id) === "skowhegan") {
			townQuestsDone();
			town = null; phase = "play"; townDisarm();
			autosave15("Left Skowhegan");
			openTown({ id: "skow", town: "skow", name: "Skowhegan bridge" });
			return true;
		}
		const sp = tdef ? townSpot(tdef) : null;
		town = null;
		phase = "play"; townDisarm();
		const dest = WM_LOCS.find((l) => l.id === exit && !locLocked(l, l1.tf));
		if (sp) { player.x = sp.roadX; player.y = sp.roadY; if (pointBlocked(world, player.x, player.y, RADIUS)) { player.x = sp.x + 110; player.y = sp.y + 40; } }
		if (dest && dest.map === mapId) { if (dest.map === 0) { const he = harmonyEntry(); if (he) { player.x = he.x; player.y = he.y; } } pushLog(`You leave town for ${dest.name}.`); }
		else if (dest) { const m = wmState(); const here = locOfMap(mapId); m.from = [here.q, here.r]; m.q = dest.q; m.r = dest.r; wmReveal(dest.q, dest.r); wmEnter(dest); pushLog(`You leave town for ${dest.name}.`); }
		else pushLog(`You walk out of ${tdef?.name ?? "town"} onto the road.`);
		snapPrev();
		saveGame(); autosave15(`Left ${tdef?.name ?? "town"}`); sync(true);
		return true;
	}
	/** v15.9: write back the character fields the RPG sent (the town returns them unchanged unless it changed them). */
	function townAccept159(st) {
		const p = player; if (!p || !st) return;
		const str = (v) => typeof v === "string", num = (v) => typeof v === "number" && Number.isFinite(v);
		if (str(st.name) && st.name.trim()) p.name = cleanName(st.name);
		if (str(st.look) && st.look) p.look = st.look;
		if (str(st.hair) && st.hair) p.hair = st.hair;
		if (Array.isArray(st.perks) && st.perks.every(str)) p.perks = st.perks.filter((x) => PERKS.some((d) => d.id === x));
		if (str(st.trait)) p.trait = traitOf(st.trait)?.id ?? p.trait;
		if (num(st.level) && st.level >= 1) p.level = Math.floor(st.level);
		if (num(st.xp) && st.xp >= 0) p.xp = st.xp;
		if (Array.isArray(st.tags) && st.tags.length === 3 && st.tags.every((x) => SKILLS.some((d) => d.id === x))) p.tags = st.tags;
		if (st.invested && typeof st.invested === "object") { const o = {}; for (const [k, v] of Object.entries(st.invested)) if (SKILLS.some((d) => d.id === k) && num(v) && v >= 0) o[k] = v; p.invested = o; }
		if (num(st.skillPoints) && st.skillPoints >= 0) p.skillPoints = st.skillPoints;
		if (num(st.points) && st.points >= 0) p.points = Math.floor(st.points);
		const app = town ? townApp(town.id) : "harmony";
		// Justin (Oct 23): 1 town score point = 1 XP
		if (num(st.score)) { l1.tScore = l1.tScore ?? {}; const gain = Math.floor(st.score - (l1.tScore[app] ?? 0)) * (STATS_RULES.townScoreXp ?? 1); l1.tScore[app] = st.score; const townOwnsXp = st.extra?.schema === "character/1" && num(st.xp); // v15.9.2 (A1): a character/1 town already folded score into xp
			if (townOwnsXp) grantXp(0); // just level up on the xp it sent
			else if (gain > 0) { pushLog(`Town work: +${gain} XP.`); grantXp(gain); } }
		// Justin (Oct 23): an old town save's learn-by-use skill levels are halved into invested points, once per town
		const ex = st.extra; if (ex && typeof ex === "object" && ex.skills && typeof ex.skills === "object" && ex.schema !== "character/1" && !l1.tConv?.[app]) {
			l1.tConv = { ...(l1.tConv ?? {}), [app]: true }; p.invested = p.invested ?? {};
			for (const [k0, v] of Object.entries(ex.skills)) { const k = STATS_RULES.skills.aliases[k0] ?? k0; const lvl = Number(v?.lv ?? v); if (!SKILLS.some((d) => d.id === k) || !(lvl > 0)) continue; const add = Math.floor(lvl * (STATS_RULES.oldTownSkillConversion?.learnByUseLvToInvested ?? .5)); if (add > 0) p.invested[k] = (p.invested[k] ?? 0) + add; }
		}
		if (str(st.backstory)) w13.backstory = st.backstory;
		{ const r = classId(st.role); if (r && r !== p.role) { p.role = r; refreshGear(p); } }
		// v3 trade skills come back as {lv, xp}; entries the town generated for its own skills carry a score and aren't trade levels
		if (false && st.skills && typeof st.skills === "object") for (const [k, v] of Object.entries(st.skills)) if (v3.skills[k] && v && typeof v === "object" && !("score" in v) && num(v.lv) && v.lv >= 0) { v3.skills[k].lv = Math.min(SKILL_MAX, Math.floor(v.lv)); if (num(v.xp) && v.xp >= 0) v3.skills[k].xp = v.xp; }
		if (num(st.karma)) p.karma = st.karma;
		if (st.rep && typeof st.rep === "object") for (const [k, v] of Object.entries(st.rep)) if (num(v)) p.rep[k] = v;
		if (st.stats && typeof st.stats === "object") for (const [k0, v] of Object.entries(st.stats)) {
			const k = STATS_RULES.statAliases[k0] ?? k0; if (!num(v)) continue;
			if (k === "agility" || k === "grit") w13.core[k] = v; else if (["strength", "vigor", "endurance", "intellect", "perception", "luck"].includes(k)) p[k] = v;
		}
		// stored, not applied: the town's own skill data and the exact class it sent (Tinker included)
		if (st.skills && typeof st.skills === "object") { l1.tSkills = {}; for (const [k, v] of Object.entries(st.skills)) if (!v3.skills[k]) l1.tSkills[k] = JSON.parse(JSON.stringify(v)); }
		if (str(st.class) && st.class) l1.tClass = st.class;
		if (Array.isArray(st.companions)) l1.tComp = st.companions.filter((c) => c && str(c.id)).map((c) => ({ ...c, withYou: !!c.withYou }));
		if (Array.isArray(st.inventory)) { l1.itemProps = l1.itemProps ?? {}; for (const it of st.inventory) if (it && str(it.id) && GEAR[it.id]) { const { id, qty, name, ...rest } = it; if (Object.keys(rest).length) l1.itemProps[id] = JSON.parse(JSON.stringify(rest)); } }
		refreshGear(p);
	}
	/** v15.3 fast travel: ride time in hours from any town to the named one. */
	const FT15_HOURS = { harmony: 1.5, pittsfield: 2, skowhegan: 2.5, skow: 2.5 }; // v15.7: 'skow' (the bridge entry) rides to Skowhegan
	const FT15_ALIAS = { skow: "skowhegan" };
	function fastTravel15(ft) {
		const from = townDef(town?.id ?? "")?.name ?? "town";
		const td = townDef(ft);
		town = null; phase = "play"; townDisarm();
		const hrs = FT15_HOURS[ft];
		clock += hrs / 24 * DAY_LENGTH_SEC;
		needsTick(hrs);
		if (td.map !== mapId) {
			const m = wmState(); const here = locOfMap(mapId), dest = locOfMap(td.map);
			m.from = [here.q, here.r]; m.q = dest.q; m.r = dest.r; m.path = []; wmReveal(dest.q, dest.r);
			wmArrive(td.map, m.from); w13.seen[dest.id] = true;
		}
		const sp = townSpot(td);
		if (sp) { player.x = sp.roadX; player.y = sp.roadY; if (pointBlocked(world, player.x, player.y, RADIUS)) { player.x = sp.x + 110; player.y = sp.y + 40; } }
		if (dogBody) { dogBody.x = player.x + 46; dogBody.y = player.y + 30; }
		if (escortBodies) for (const e of escortBodies) { e.x = player.x + (e.ox ?? 40); e.y = player.y + (e.oy ?? 40); }
		snapPrev();
		pushLog(`You ride Dad's motor bike from ${from} to ${td.name}. ${hrs} hours on the road.`);
		autosave15(`Rode to ${td.name}`);
		openTown({ id: ft, town: ft, name: td.name });
	}
	/** v14.6: main quest stages for the town (DESIGN.md "Quest mapping"); all read-only on the town side. */
	function townStoryFlags() {
		const o = { "story.act": w13.main?.act ?? 1, "story.snow": snow, "story.jackLoyal": w13.loyal?.jack ?? 20 };
		const mf = w13.main?.flags ?? {};
		o["story.main.signal"] = !!mf.signal; o["story.main.jackTalk"] = !!mf.jackTalk; o["story.main.marcel"] = !!mf.marcel; o["story.main.ltKills"] = w13.main?.ltKills ?? 0;
		for (const k of ["seed", "ferry", "dog", "radio", "moose"]) o[`story.q10.${k}`] = q10[k] ?? 0;
		(q10.parts ?? []).forEach((v, i) => { o[`story.q10.radioPart${i}`] = !!v; });
		for (const q of Q11) o[`story.q11.${q.id}`] = q11.q[q.id]?.s ?? 0;
		return o;
	}
	/** v14.6: town progress -> our quest state. Only ever moves a quest forward; unknown values are ignored. */
	const TOWN_FLAG_MAP = {
		"harmony.firstSnow": { given: ["snow", 1], wood: ["snow", 1], done: ["snow", 3] }, // v15.9.5: was done -> 2 (Sarah on the world map closed it); the farm lives only in Harmony now
		"harmony.dog": { ranOff: ["dog", 1], tracks: ["dog", 2], found: ["dog", 3], done: ["dog", 4] },
		"harmony.radio": { offered: ["radio", 1], tube: ["radio", 1, 0], done: ["radio", 1, 0] },
		"harmony.meds": { away: ["q11:meds", 1], returned: ["q11:meds", 1], done: ["q11:meds", 1] },
		"harmony.school": { offered: ["q11:school", 1], cleared: ["q11:school", 2] },
		"harmony.bike": { seen: ["q11:bike", 1], looked: ["q11:bike", 2] },
		// v15.1: Pittsfield / Skowhegan (their docs/TOWN_HANDOFF.md)
		"pittsfield.seed": { arrived: ["seed", 2], cleared: ["seed", 3], found: ["seed", 4] },
		"skowhegan.meds": { found: ["q11:meds", 4] },
		"skowhegan.mill": { cleared: ["q11:mill", 2], stripped: ["q11:mill", 3] },
	};
	/** v15.9.5: Sarah's, Loki's and Cyndal's quests are given and turned in inside Harmony (farm-handoff.md).
	 * farm.q10.<id> / farm.q11.<id> = "accepted" | <stage number> | "done". Only moves forward; "done" pays the original
	 * main-game rewards through the original turn-in handlers, once. */
	function farmQuestFlags(f, v, moved) {
		const say = dialogue, ph = phase;
		for (const id of ["seed", "ferry", "moose", "dog", "radio"]) {
			const val = v(`farm.q10.${id}`);
			if (val == null) continue;
			const doneAt = { seed: 4, ferry: 2, moose: 4, dog: 3, radio: 2 }[id], doneTo = doneAt + 1;
			if (val === "accepted" && (q10[id] ?? 0) === 0) { q10Choice(`q10-${id}-accept`); moved.push(`${id} accepted`); }
			else if (typeof val === "number" && val > (q10[id] ?? 0) && val < doneTo) { q10[id] = val; moved.push(`${id} ${val}`); }
			else if (val === "done" && id !== "ferry" && (q10[id] ?? 0) === doneAt) { q10Choice(id === "ferry" ? "q10-ferry-fix" : `q10-${id}-done`); moved.push(`${id} done`); }
		}
		for (const q of Q11) {
			const val = v(`farm.q11.${q.id}`);
			if (val == null) continue;
			const st = q11St(q.id), turnIn = q.steps.length + 1;
			if (val === "accepted" && st.s === 0) { q11Choice(`q11-accept-${q.id}`); moved.push(`${q.id} accepted`); }
			else if (typeof val === "number" && val > st.s && val <= turnIn) { st.s = val; st.left = 0; q11Begin(q); moved.push(`${q.id} ${val}`); }
			else if (val === "done" && st.s === turnIn) { q11Choice(`q11-done-${q.id}`); moved.push(`${q.id} done`); }
		}
		dialogue = say; phase = ph;
	}
	function townMapFlags(f) {
		const moved = [];
		const fwd = (what, n, part) => {
			if (what === "snow") { if (snow < n) { snow = n; moved.push(`snow ${n}`); } return; }
			if (what.startsWith("q11:")) {
				const q = Q11.find((x) => x.id === what.slice(4));
				if (!q) return;
				const st = q11St(q.id);
				if (st.s < n) { st.s = n; st.left = 0; moved.push(`${q.id} ${n}`); q11Begin(q); }
				return;
			}
			if ((q10[what] ?? 0) < n) { q10[what] = n; moved.push(`${what} ${n}`); }
			if (part != null && q10.parts && !q10.parts[part]) { q10.parts[part] = true; moved.push(`${what} part ${part}`); }
		};
		for (const [key, table] of Object.entries(TOWN_FLAG_MAP)) {
			const v = f?.[key];
			if (typeof v === "string" && Object.prototype.hasOwnProperty.call(table, v)) fwd(...table[v]);
		}
		if (f?.["harmony.radioTube"] === true || f?.["harmony.radioTube"] === "got") fwd("radio", 1, 0);
		if (moved.some((m) => m.startsWith("dog"))) { if (q10.dog >= 2) q10PlaceDog(); }
		townActFlags(f, moved);
		return moved;
	}
	/** v15: Town Acts 2-5 (TOWN_HANDOFF.md). Forward only; numbers apply the change since last time. harmony.jt.* / harmony.mt.* are ignored. */
	function townActFlags(f, moved) {
		if (!f || !w13?.main) return;
		const mf = w13.main.flags, v = (k) => f[k], ap = (l1.tapplied = l1.tapplied ?? {});
		const set = (k, why) => { if (!mf[k]) { mf[k] = true; moved.push(why); } };
		if (["heard", "debated"].includes(v("harmony.signal"))) set("signal", "signal");
		if (["met", "inside", "maps"].includes(v("harmony.jack"))) set("jackTalk", "jack");
		const jt = Number(v("harmony.jackTrust"));
		if (Number.isFinite(jt) && jt > (ap.jackTrust ?? 0)) { w13.loyal.jack = Math.min(100, (w13.loyal.jack ?? 20) + jt - (ap.jackTrust ?? 0)); ap.jackTrust = jt; moved.push("jack trust"); }
		if (v("harmony.jackMaps") === true && (w13.loyal.jack ?? 0) >= 30) { mf.jackTalk = true; if (w13.main.act === 3) { mainAdvance(); moved.push("act 3 done"); } }
		if (["met", "briefed"].includes(v("harmony.marcel"))) set("marcel", "marcel");
		for (const k of ["planks", "rope", "winch"]) if (v(`harmony.ferry${k[0].toUpperCase()}${k.slice(1)}`) === true && !q10[k]) { q10[k] = true; moved.push(`ferry ${k}`); }
		const fe = v("harmony.ferry"), fn = fe === "fixed" ? 3 : fe === "given" ? 1 : 0;
		if (fn && (q10.ferry ?? 0) < fn) { q10.ferry = fn; moved.push(`ferry ${fn}`); }
		for (const [k, camp] of [["harmony.ltGravel", "camp0"], ["harmony.ltHoleb", "camp1"], ["harmony.ltMill", "camp2"]]) {
			if (!["down", "gone"].includes(v(k)) || ap[k]) continue;
			ap[k] = true; w13.main.ltKills += 1; w13.camps[camp] = { ...(w13.camps[camp] ?? {}), lt: true, cleared: true }; moved.push(`lieutenant ${camp}`);
		}
		const pr = Number(v("harmony.prisoners"));
		if (Number.isFinite(pr) && pr > (ap.prisoners ?? 0)) { const d = pr - (ap.prisoners ?? 0); ap.prisoners = pr; w13.freed = (w13.freed ?? 0) + d; w13.loyal.mira = Math.min(100, (w13.loyal.mira ?? 20) + 2 * d); moved.push(`prisoners +${d}`); }
		if (v("harmony.collector") === "paid" && !ap.collectorPaid) { ap.collectorPaid = true; pushLog("Word is Harmony paid the Collector. Their larder's thinner for it."); }
		// v15: Town Acts 6-7
		const gk = v("harmony.grok"), grokQ = Q11.find((x) => x.id === "grok");
		if (gk === "dead" && grokQ) { const st = q11St("grok"); if (st.s <= grokQ.steps.length) { st.s = grokQ.steps.length + 1; st.left = 0; q11Begin(grokQ); moved.push("grok dead"); } set("grokPath", "grok path"); }
		if (v("harmony.grokClaw") === true && !ap.grokClaw) { ap.grokClaw = true; giveItem("grokclaw"); moved.push("grok claw"); }
		if (["snuck", "tricked", "friend"].includes(gk)) set("grokPath", "grok path");
		if (v("harmony.grokFriend") === true) set("grokFriend", "grok friend");
		const wolvesQ = Q11.find((x) => x.id === "wolves");
		if (["leader", "driven"].includes(v("harmony.wolves")) && wolvesQ) { const st = q11St("wolves"); if (st.s <= wolvesQ.steps.length) { st.s = wolvesQ.steps.length + 1; st.left = 0; q11Begin(wolvesQ); moved.push("wolves"); } }
		const dp = v("harmony.depot");
		if (["shared", "taken", "burned"].includes(dp) && !mf.depot) {
			mf.depot = true; mf.depotHow = dp; moved.push(`depot ${dp}`);
			if (dp === "shared") { for (const c of ["sarah", "mira", "marcel"]) w13.loyal[c] = Math.min(100, (w13.loyal[c] ?? 20) + 5); }
			if (dp === "taken") { giveItem("gas", 3); giveItem("medicine", 2); }
			if (w13.main.act === 6) mainAdvance();
		}
		if (v("harmony.ledger") === true) set("ledger", "ledger");
		const sup = Number(v("harmony.support"));
		if (Number.isFinite(sup)) mf.support = Math.max(mf.support ?? 0, sup);
		const ch = v("harmony.choice");
		if (["unite", "deal", "alone"].includes(ch) && !w13.main.choice) {
			w13.main.choice = ch; moved.push(`choice ${ch}`);
			loyalty(ch === "deal" ? "deal-collector" : ch);
			if (ch === "deal") { const full = v("harmony.dealTerms") === "full"; player.scrap = Math.max(0, player.scrap - (full ? 30 : 20)); w13.main.siege = 2; w13.main.won = true; mf.toll = full ? 30 : 20; }
			if (w13.main.act === 7) mainAdvance();
		}
		// v15.9.5: the siege is played in Harmony for every path. harmony.siegeDone = "won" | "lost" (true / "done" read as won),
		// harmony.collectorDown = true when the Collector fell. The deal path is already closed by harmony.choice = "deal".
		const sd = v("harmony.siegeDone");
		if ([true, "done", "won", "lost"].includes(sd) && w13.main.choice && w13.main.siege !== 2) {
			w13.main.siege = 2;
			if (w13.main.choice !== "deal") { w13.main.won = sd !== "lost"; if (w13.main.won || v("harmony.collectorDown") === true) w13.main.collectorDown = true; }
			moved.push(`siege ${sd}`);
		}
		if (v("harmony.collectorDown") === true) w13.main.collectorDown = true;
		farmQuestFlags(f, v, moved);
		const fam = v("harmony.family");
		if (["stay", "north"].includes(fam) && !mf.family) { mf.family = fam; moved.push(`family ${fam}`); }
		if (v("harmony.signalVerdict") === "split" && !ap.split) { ap.split = true; pushLog("Earl and two others went south after the signal."); }
		// v15.1: Pittsfield, Skowhegan and the barnyard/Goose flags
		if (["cleared", "found"].includes(v("pittsfield.seed")) && q10.seed >= 3) q10.seedLeft = 0;
		if (v("pittsfield.beaulieu") === "ally") set("beaulieu", "Beaulieus ally");
		if (v("pittsfield.handcar") === "running") set("handcar", "handcar running");
		if (v("harmony.gooseGuard") === true || v("harmony.gooseBark") === "done") set("gooseGuard", "Goose guards");
		if (v("harmony.fence") === "done") set("fence", "fence mended");
		if (v("harmony.gooseTricks") === "done" || (Array.isArray(v("harmony.tricks")) && v("harmony.tricks").length) || v("harmony.tricks") === "done") set("gooseHelps", "Goose helps");
	}
	/** v14.5: town quest markers go away when the town marks the quest past the "go there" stage, or the RPG finishes it. */
	const TOWN_QUEST_DONE = { "harmony-salt": ["harmony.saltRun", ["returned", "done"]], "harmony-lostdog": ["harmony.lostDog", ["found", "done"]], "harmony-meds": ["harmony.meds", ["returned", "done"]], "harmony-dog": ["harmony.dog", ["found", "done"]], "harmony-radio": ["harmony.radio", ["done"]], "harmony-grok": ["harmony.grok", ["dead", "snuck", "tricked", "friend"]], "harmony-choice": ["harmony.choice", ["unite", "deal", "alone"]], "harmony-siege": ["harmony.siegeDone", [true, "done", "won", "lost"]] };
	function townQuestsDone() {
		if (!l1.tq?.length) return;
		l1.tq = l1.tq.filter((q) => {
			const d = TOWN_QUEST_DONE[q.id];
			if ((q.id === "harmony-lostdog" || q.id === "harmony-dog") && q10.dog >= 3) return false;
			if (q.id === "harmony-choice" && w13.main?.choice) return false;
			if (q.id === "harmony-siege" && w13.main?.siege === 2) return false;
			if (q.id === "harmony-grok" && (w13.main?.act ?? 1) > 6) return false;
			// v15.1 markers: handcar line -> Skowhegan bridge, Pittsfield's raider camp -> Raider Country, medicine -> back to Harmony
			if (q.id === "pittsfield-handcar" && w13.main?.flags?.railRidden) return false;
			if (q.id === "pittsfield-camp" && (w13.camps?.camp0?.cleared || w13.seen?.raiders)) return false;
			if (q.id === "skowhegan-meds" && (["returned", "done"].includes(l1.tf?.["harmony.meds"]) || q11St("meds").s > Q11.find((x) => x.id === "meds").steps.length + 1)) return false;
			return !(d && d[1].includes(l1.tf?.[d[0]]));
		});
	}
	/** {type:'startQuest', id, target, label?}: a town quest puts a marker on the world map. */
	function townQuest(msg) {
		if (!msg || msg.type !== "startQuest" || typeof msg.id !== "string" || !msg.id) return false;
		const t = msg.target;
		const tid = typeof t === "string" ? ({ harmony: "farm" })[t] ?? t : t;
		const loc = typeof tid === "string" ? WM_LOCS.find((l) => l.id === tid) ?? LOOT_RUNS.find((l) => l.id === tid) : null;
		const q = loc ? loc.q : Number(t?.q), r = loc ? loc.r : Number(t?.r);
		if (!Number.isInteger(q) || !Number.isInteger(r) || q < 0 || r < 0 || q > 11 || r > 8) return false;
		l1.tq = (l1.tq ?? []).filter((x) => x.id !== msg.id);
		const label = typeof msg.label === "string" && msg.label ? msg.label.slice(0, 40) : msg.id;
		l1.tq.push({ id: msg.id, town: town?.id ?? "harmony", q, r, label });
		wmReveal(q, r);
		pushLog(`New town job: ${label}. Follow the gold arrow.`);
		saveGame(); sync(true);
		return true;
	}
	function wmEnter(l) {
		const m = wmState();
		m.warn = "";
		wmArrive(l.map, m.from);
		w13.seen[l.id] = true;
		// v15.1: a town hex walks you to its marker and opens the town game
		const td = l.town ? townDef(l.town) : null, sp = td ? townSpot(td) : null;
		if (td && sp) { player.x = sp.roadX; player.y = sp.roadY; snapPrev(); townDisarm(); openTown({ id: td.id, town: td.id, name: td.name }); return; }
		saveGame(); sync(true);
	}
	function wmEncounter(raiders) {
		const m = wmState();
		const kinds = raiders ? ["raiders", "raiders", "wildlife", "road", "horde"] : ["wildlife", "road", "caravan", "migration", "raiders", "horde"];
		const pick = typeof window !== "undefined" && window.__wmKind ? window.__wmKind : kinds[Math.floor(Math.random() * kinds.length)];
		regions.delete(9);
		m.enc = pick;
		wmArrive(9, m.from);
		const at = (dx, dy) => ({ x: player.x + dx, y: player.y + dy });
		if (pick === "raiders") { for (let i = 0; i < 3; i++) { spawnRaider("scout", at(260 + i * 50, -120 + i * 70)); const e = world.enemies[world.enemies.length - 1]; e.raid = false; } pushLog("Raiders on the road ahead. They've seen you."); }
		else if (pick === "wildlife") { const n = 3 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) q10Spawn("wolf", "", "Timber wolf", at(240 + i * 40, 90 - i * 50), [22, 5, 10], "enc", true); pushLog(`A pack of ${n} timber wolves comes out of the alders.`); }
		else if (pick === "horde") { const n = 5 + Math.floor(Math.random() * 3); spawnHollowed(n, at(420, 160), 90); pushLog(`A group of ${HOLLOWED} shuffling down the road, ${n} of them. They go where the noise is. Get low and keep quiet.`); }
		else if (pick === "migration") { for (let i = 0; i < 5; i++) q10Spawn("deer", "", "Deer", at(-200 + i * 70, 220), [16, 2, 6], "enc", false); pushLog("A line of deer crossing the road, heading south for the yards."); }
		else if (pick === "caravan") { openD13("Caravan", "A sledge caravan out of Skowhegan, two horses and a dog. They'll trade a little for iron.", [{ label: "Six shells — 8 iron", id: "q10-buy-shells" }, { label: "Wave them by", id: "close" }]); }
		else startRoadEvent(pickRoadEvent(Math.random()));
		pushLog("Walk to the tinted edge to get back on the road.");
		saveGame(); sync(true);
	}
	function wmHud() {
		if (phase !== "worldmap" || !v14.map) return null;
		const m = v14.map;
		return { q: m.q, r: m.r, fog: m.fog, path: m.path, warn: m.warn, locked: WM_LOCS.filter((l) => locLocked(l, l1.tf)).map((l) => l.id), moosehead: mooseheadOpen(l1.tf), here: locAt(m.q, m.r)?.name ?? lootRunAt(m.q, m.r)?.name ?? null, loot: lootHud(), clock: clockLabel(clock), bike: bikeBuilt(), town: town ? { id: town.id, src: town.src, n: town.n } : null, tq: l1.tq ?? [] };
	}
	// ---- workbench: repair, patch, dye
	function benchMenu() {
		const pieces = armorPieces();
		if (!pieces.length) return openD13("Workbench", "Nothing you've got on is worth the rivets.", [{ label: "Close", id: "close" }]);
		const ch = [];
		for (const id of pieces) {
			const d = duraOf(id);
			if (false) ch.push({ label: `Repair ${GEAR[id].name} (${d}/${DURA_MAX}): ${repairCost(id)} iron`, id: `v13-repair-${id}` });
			if (!w13.patched[id] || d < 60) ch.push({ label: `Patch ${GEAR[id].name} with hide (+40, a bit tougher)`, id: `v13-patch-${id}` });
		}
		ch.push({ label: "Dye your armor", id: "v13-dyes" });
		ch.push({ label: "Close", id: "close" });
		return openD13("Workbench", `The bench, the vise and a tin of rivets. ${setBonus13() ? `Wearing the ${setBonus13().name}: ${setBonus13().text}` : "A full matching set gives a bonus."}`, ch);
	}
	function dyeMenu() {
		return openD13("Dye", "Boil it up in the kettle. Which color?", [...DYES.map((d) => ({ label: `${d.name} (${d.need[1]} ${GEAR[d.need[0]]?.name.toLowerCase() ?? d.need[0]})`, id: `v13-dye-${d.id}` })), { label: "Wash it out (plain)", id: "v13-dye-none" }, { label: "Close", id: "close" }]);
	}
	function dyeAll(id) {
		const d = DYES.find((x) => x.id === id);
		if (id === "none") { w13.dye = {}; pushLog("You wash the dye out."); return; }
		if (!d) return;
		if (countOf(d.need[0]) < d.need[1]) { pushLog(`You need ${d.need[1]} ${GEAR[d.need[0]]?.name.toLowerCase() ?? d.need[0]}.`); return; }
		takeItem(d.need[0], d.need[1]);
		for (const p of ["head", "chest", "legs", "hands", "feet"]) w13.dye[p] = d.hex;
		pushLog(`Your armor comes out of the kettle ${d.name.toLowerCase()}.`);
		figureKey = "";
	}
	// ---- bounty board
	function bountyMenu() {
		if (!w13.bounties.length) { w13.bounties = makeBounties(curDay()); w13.bountyDay = curDay(); }
		return openD13("Bounty board", "Notes tacked up on the store door. New ones every few days.", [...w13.bounties.map((b) => ({ label: `${b.text}: ${Math.min(b.got, b.need)}/${b.need} (${b.pay} iron)${b.got >= b.need ? " — collect" : b.kind === "deliver" ? ` — hand in ${GEAR[b.item]?.name.toLowerCase() ?? b.item}` : ""}`, id: `v13-bounty-${b.id}` })), { label: "Close", id: "close" }]);
	}
	function bountyTurnIn(id) {
		const b = w13.bounties.find((x) => x.id === id);
		if (!b || b.paid) return;
		if (b.kind === "deliver" && b.got < b.need) {
			const give = Math.min(countOf(b.item), b.need - b.got);
			if (give > 0) { takeItem(b.item, give); b.got += give; }
		}
		if (b.got < b.need) { pushLog(`Not done yet: ${b.got}/${b.need}.`); return; }
		b.paid = true;
		player.scrap += b.pay;
		w13.bountyDone += 1;
		loyalty("bounty");
		pushLog(`Bounty paid: ${b.pay} iron.`);
		w13.bounties = w13.bounties.filter((x) => !x.paid);
		if (!w13.bounties.length) { w13.bounties = makeBounties(curDay() + 1); w13.bountyDay = curDay(); }
	}
	function v13Kill(enemy) {
		for (const b of w13.bounties) {
			if (b.kind === "raiders" && enemy.kind === "bandit") b.got += 1;
			if (b.kind === enemy.kind) b.got += 1;
		}
		if (enemy.lt && !enemy.ltCounted) { enemy.ltCounted = true; w13.main.ltKills += 1; pushLog(`Lieutenant down (${w13.main.ltKills}/3).`); if (enemy.v13camp) w13.camps[enemy.v13camp] = { ...(w13.camps[enemy.v13camp] ?? {}), lt: true }; }
		if (enemy.name === "Caravan robber" && w13.caravanGuard && !world.enemies.some((e) => !e.dead && e !== enemy && e.name === "Caravan robber")) {
			const r = CARAVAN13.find((c) => c.id === w13.caravanGuard);
			w13.caravanGuard = "";
			player.scrap += 8;
			if (r) giveItem(r.cargo[0][0], Math.ceil(r.cargo[0][1] / 2));
			loyalty("guard-caravan");
			grantXp(25);
			pushLog("The caravan gets through. The driver pays you 8 iron and a share of the load.");
		}
		if (enemy.variant === "collector") { w13.main.collectorDown = true; pushLog("The Collector goes down in the snow."); }
	}
	// ---- raider camps (night raids)
	const CAMPS13 = [
		{ id: "camp0", map: 0, tx: 50, ty: 30, name: "Raider camp at the gravel pit" },
		{ id: "camp1", map: 1, tx: 30, ty: 70, name: "Raider camp in the Holeb cut" },
		{ id: "camp2", map: 2, tx: 30, ty: 30, name: "Raider camp behind the mill" },
	];
	const DEPOT13 = { map: 1, tx: 92, ty: 34 };
	function camp13Spot(c) {
		return q10Tile(c.tx, c.ty);
	}
	function v13World() {
		if (!world || mode11) return;
		for (const c of CAMPS13) {
			if (c.map !== mapId) continue;
			const s = camp13Spot(c);
			const t = tileOf(s.x, s.y);
			if (!world.props.some((p) => p.v13camp === c.id)) { addProp(world, "firepot", t.tx, t.ty - 2, { v13camp: c.id }) || addProp(world, "firepot", t.tx + 2, t.ty - 2, { v13camp: c.id }); addProp(world, "crates", t.tx + 3, t.ty, { v13camp: c.id, label: "RAIDER CAMP" }); }
			const st = w13.camps[c.id] ?? {};
			if (!st.lt && !world.enemies.some((e) => !e.dead && e.v13camp === c.id && e.lt)) {
				const lt = q11Spawn(["bandit", "armor", `Lieutenant ${["Roy", "Dube", "Gagnon"][CAMPS13.indexOf(c)]}`, 44, 8, 40], { x: s.x + 40, y: s.y + 30 }, "camp", false);
				if (lt) { lt.lt = true; lt.v13camp = c.id; lt.elite = true; }
				for (let i = 0; i < 2; i++) { const g = q11Spawn(["bandit", "scout", "Camp guard", 16, 4, 10], { x: s.x - 50 + i * 100, y: s.y + 70 }, "camp", false); if (g) g.v13camp = c.id; }
			}
		}
		if (mapId === DEPOT13.map && w13.main.act >= 6) {
			const s = q10Tile(DEPOT13.tx, DEPOT13.ty);
			const t = tileOf(s.x, s.y);
			if (!world.props.some((p) => p.v13depot)) addProp(world, "crates", t.tx, t.ty, { v13depot: true, label: "SUPPLY DEPOT" });
			if (!w13.main.flags.grokPath && !world.enemies.some((e) => !e.dead && e.variant === "grok")) {
				const g = q11Spawn(["bandit", "grok", "The Grok", 220, 15, 90], { x: s.x - 600, y: s.y + 300 }, "v13grok", true);
				if (g) g.v13grok = true;
			}
		}
		v13WorldProps();
	}
	function v13WorldProps() {
		if (!world || mapId !== 0) return;
		const base = Q11_SITES.school;
		for (const [i, r] of REBUILD.entries()) {
			if (!w13.rebuilt[r.id] || world.props.some((p) => p.v13town === r.id)) continue;
			const s = q10Tile(base.tx + 5 + i * 5, base.ty - 4);
			const t = tileOf(s.x, s.y);
			addProp(world, "shack", t.tx, t.ty, { v13town: r.id, skin: `harmony-${r.id}`, label: r.name.toUpperCase() });
		}
	}
	function nearCamp() {
		for (const c of CAMPS13) {
			if (c.map !== mapId) continue;
			const s = camp13Spot(c);
			if (Math.hypot(s.x - player.x, s.y - player.y) < 6 * TILE) return c;
		}
		return null;
	}
	function campStealth() {
		const dark = nightDark(clock);
		return Math.max(5, Math.min(92, 30 + dark * 30 + lv("stealth") * 4 + skillOf("sneak") * .3 + moon13().stealth * (perk13("stealth", 6) && moon13().stealth > 0 ? 2 : 1) + (w13.weather.id === "fog" ? 12 : 0) + (perk13("stealth", 3) ? 10 : 0) + core13().agility * 2));
	}
	function v13CampTick() {
		if (dialogue || inside) return;
		const c = nearCamp();
		if (!c || nightDark(clock) < .3) { w13.campPrompt = ""; return; }
		const st = w13.camps[c.id] ?? {};
		if (st.raidDay === curDay() || w13.campPrompt === c.id) return;
		w13.campPrompt = c.id;
		openD13(c.name, `Lanterns and a cookfire. Two guards, and the lieutenant asleep by the sledges. ${st.prisoners === 0 ? "" : "You can see people tied up by the woodpile."} Your odds of getting in quiet: about ${Math.round(campStealth())}%.`, [{ label: "Sneak in: steal supplies, free the prisoners, deal with the lieutenant", id: `v13-camp-${c.id}` }, { label: "Back off", id: "close" }]);
	}
	function campRaid(id, forceOk) {
		const c = CAMPS13.find((x) => x.id === id);
		if (!c) return;
		const st = w13.camps[id] = { ...(w13.camps[id] ?? {}) };
		st.raidDay = curDay();
		let ok = forceOk ?? Math.random() * 100 < campStealth();
		if (!ok && perk13("stealth", 9) && !st.retried) { st.retried = true; ok = Math.random() * 100 < campStealth(); }
		train("stealth", 12);
		if (ok) {
			giveItem("shells", 4); giveItem("jerky", 2); player.scrap += 8;
			if (Math.random() < .5) giveItem("medicine", 1);
			if (st.prisoners !== 0) { st.prisoners = 0; w13.freed += 3; loyalty("free-prisoners"); pushLog("You cut the ropes. Three people from the Forks slip off into the dark toward Harmony."); diary("Freed three prisoners from a raider camp."); }
			const lt = world.enemies.find((e) => !e.dead && e.lt && e.v13camp === id);
			if (lt) { lt.hp = 0; markDead(lt, lt.xp); }
			else if (!st.lt) { st.lt = true; w13.main.ltKills += 1; pushLog(`You find the lieutenant asleep by the sledges. He doesn't wake up (${w13.main.ltKills}/3).`); }
			pushLog("In and out. Nobody woke up. You took what they'd stolen.");
			achieve("ghost");
		} else {
			pushLog("A guard kicks a can. Shouting. The whole camp's up.");
			for (const e of world.enemies) if (!e.dead && e.v13camp === id) { e.aggro = true; e.temper = "hostile"; }
		}
		saveGame(); sync(true);
	}
	// ---- main quest: The Long Winter
	function mainAct() {
		return MAIN_ACTS.find((a) => a.n === w13.main.act) ?? MAIN_ACTS[MAIN_ACTS.length - 1];
	}
	function mainAdvance(note) {
		const a = mainAct();
		if (a.n >= 9) return;
		pushLog(`The Long Winter — ${a.title}: done. ${a.done}`);
		diary(`${a.title}: ${a.done}`);
		w13.main.act += 1;
		const nx = mainAct();
		pushLog(`The Long Winter — Act ${nx.n}, ${nx.title}: ${nx.goal}`);
		grantXp(30 + 10 * a.n);
		if (note) pushLog(note);
		if (nx.n === 6 && mapId === 1) v13World();
		achieve(`main${a.n}`);
		saveGame(); sync(true);
	}
	/** Hook for later story content: every act check runs here, and side quests feed it. */
	function v13MainTick() {
		const a = w13.main.act;
		if (a === 1 && snow >= 3) mainAdvance(); // v15.9.5: no longer waits on the first raid (raid1)
		else if (a === 3 && (w13.loyal.jack ?? 0) >= 30 && w13.main.flags.jackTalk) mainAdvance();
		else if (a === 4 && w13.main.flags.marcel) mainAdvance();
		else if (a === 5 && w13.main.ltKills >= 3) mainAdvance();
		else if (a === 6 && mapId === DEPOT13.map) {
			const s = q10Tile(DEPOT13.tx, DEPOT13.ty);
			if (Math.hypot(s.x - player.x, s.y - player.y) < 4 * TILE) { w13.main.flags.depot = true; giveItem("gas", 3); giveItem("medicine", 2); mainAdvance(); }
		}
		else if (a === 2 && w13.main.flags.signal) mainAdvance();
		else if (a === 7 && w13.main.choice) mainAdvance();
		else if (a === 8 && w13.main.siege === 2) {
			const alive = COMPANIONS.filter((c) => !w13.left[c]).length + (q10.dog >= 4 && v3.dog.down < 0 ? 1 : 0);
			w13.main.ending = pickEnding(w13.main.choice, true, w13.main.won, alive, rebuiltN());
			w13.main.slide = 0;
			mainAdvance();
			diary(`Ending: ${ENDINGS[w13.main.ending].title}.`);
		}
	}
	function v13SideQuestDone(id) {
		const feed = { bunker: ["jack", 20], meds: ["marcel", 10], mill: ["marcel", 6], garden: ["mira", 12], school: ["sarah", 10], grok: ["sarah", 10], radio: ["sarah", 4], fuel: ["sarah", 6], bike: ["sarah", 8], lighthouse: ["sarah", 6], wolves: ["sarah", 6] };
		const f = feed[id];
		if (f && !w13.left[f[0]]) { w13.loyal[f[0]] = Math.min(100, (w13.loyal[f[0]] ?? 20) + f[1]); pushLog(`${COMPANION_NAME[f[0]]} thinks better of you (+${f[1]}).`); }
		if (id === "grok") w13.main.flags.grokPath = true;
	}
	/** v15: Harmony's ledger, or four towns behind you (harmony.support >= 4), clears the unite requirement. */
	function uniteWaived() { const f = w13.main?.flags ?? {}; return !!f.ledger || (f.support ?? 0) >= 4; }
	// ---- dialogue
	function openD13(speaker, text, choices) {
		dialogue = { speaker, text, choices };
		talkNpc = talkNpc ?? null; phase = "dialogue"; intent = null; sfx("talk"); sync(true);
		return true;
	}
	function v13TalkChoices(role) {
		if (mode11 || !player) return [];
		const out = [];
		const a = w13.main.act;
		const c = roleComp(role);
		if (c && w13.left[c]) return [];
		if (role === "sarah") {
			out.push({ label: "Cook a meal", id: "v13-cook" });
			if (mapId === 0) out.push({ label: "Turn in and sleep till morning", id: "v13-sleep" });
			
			out.push({ label: "Rebuild Harmony", id: "v13-rebuild" });
			if (a === 7 && !w13.main.choice) out.push({ label: "The Long Winter: decide what we do about the Collector", id: "v13-main-choose" }, { label: "Talk it over in the kitchen", id: "v15-kitchen" });
		}
		if (role === "cyndal" && a === 2) out.push({ label: "The Long Winter: what's on the radio?", id: "v13-main-signal" });
		if (role === "cal") {
			out.push({ label: "Trade talk (Jack's trust)", id: "v13-jack" });
			if (a === 3) out.push({ label: "The Long Winter: about those old maps", id: "v13-main-jack" });
		}
		if (role === "marcel") {
			out.push({ label: "Bounty board", id: "v13-bounty" });
			if (a === 4) out.push({ label: "The Long Winter: the Augusta broadcast", id: "v13-main-marcel" });
		}
		if (role === "sarah") {
			out.push({ label: "Caravan on the road?", id: "v13-caravan" });
		}
		if (MAIN_TALK[a]?.[role]) out.push({ label: "The Long Winter: what do you make of it?", id: "v13-main-talk" });
		if (MAIN_ACTS[a - 1] && MAIN_ACTS[a - 1].intro[0].toLowerCase().startsWith(role === "cal" ? "jack" : role) && !w13.main.flags[`intro${a}`]) out.push({ label: `The Long Winter: ${MAIN_ACTS[a - 1].title}`, id: `v13-main-intro` });
		return out;
	}
	function v13Choice(id) {
		let m;
		if (id === "v13-cook") return cookMenu();
		if ((m = id.match(/^v13-cook-(.+)$/))) { cook(m[1]); return cookMenu(); }
		if (id === "v13-bench") return benchMenu();
		if (id === "v13-sleep") {
			const span = DAY_LENGTH_SEC;
			const h = hourNow();
			clock = Math.floor(clock / span) * span + (h >= 7 ? span : 0) + (7 / 24) * span;
			sleep13();
			player.hp = Math.min(player.maxHp, player.hp + Math.round(player.maxHp * .4));
			player.stamina = player.maxStamina;
			pushLog("You sleep like a stone under three quilts. Morning.");
			saveGame();
			return close13();
		}
		if ((m = id.match(/^v13-repair-(.+)$/))) { const c = repairCost(m[1]); if (player.scrap < c) pushLog(`That's ${c} iron.`); else { player.scrap -= c; w13.dura[m[1]] = DURA_MAX; train("mechanics", 4); pushLog(`Good as new: ${GEAR[m[1]].name}.`); refreshGear(player); } return benchMenu(); }
		if ((m = id.match(/^v13-patch-(.+)$/))) { if (countOf("hide") < 1) pushLog("You need a hide to patch with."); else { takeItem("hide", 1); w13.dura[m[1]] = Math.min(DURA_MAX, duraOf(m[1]) + 40); w13.patched[m[1]] = true; pushLog(`You patch the ${GEAR[m[1]].name.toLowerCase()} with a square of hide.`); refreshGear(player); } return benchMenu(); }
		if (id === "v13-dyes") return dyeMenu();
		if ((m = id.match(/^v13-dye-(.+)$/))) { dyeAll(m[1]); return benchMenu(); }
		if (id === "v13-rebuild") return rebuildMenu();
		if ((m = id.match(/^v13-rebuild-(.+)$/))) { rebuild(m[1]); return rebuildMenu(); }
		if (id === "v13-clinic") { if (player.scrap < 4 && !perk13("medicine", 9)) pushLog("4 iron for the clinic."); else { if (!perk13("medicine", 9)) player.scrap -= 4; w13.ail = {}; player.hp = player.maxHp; pushLog("The clinic sets you right. All patched up."); } return rebuildMenu(); }
		if (id === "v13-bounty") return bountyMenu();
		if ((m = id.match(/^v13-bounty-(.+)$/))) { bountyTurnIn(m[1]); return bountyMenu(); }
		if (id === "v13-caravan") return caravanMenu();
		if (id === "v13-car-guard") {
			const r = v13Caravan(); if (!r) return close13();
			w13.caravan[caravanKey(r)] = "guard";
			for (let i = 0; i < 3; i++) { const a = i * 2.1; q11Spawn(["bandit", null, "Caravan robber", 16, 4, 10], clearOutside(player.x + Math.cos(a) * 260, player.y + Math.sin(a) * 260), "caravan", true); }
			pushLog("You fall in beside the lead sledge. Sure enough, at the bend there's men in the trees.");
			w13.caravanGuard = r.id;
			return close13();
		}
		if (id === "v13-car-rob") {
			const r = v13Caravan(); if (!r) return close13();
			w13.caravan[caravanKey(r)] = "rob";
			for (const [it, n] of r.cargo) giveItem(it, n);
			player.karma = (player.karma ?? 0) - 4; shiftRep("ponds", -4, -10);
			loyalty("rob-caravan");
			pushLog("You take the sledges at gunpoint. The drivers walk home. Word will get around.");
			diary(`Robbed the ${r.from}–${r.to} caravan.`);
			return close13();
		}
		if ((m = id.match(/^v13-go-(.+)$/))) { close13(); fastTravel(m[1]); return true; }
		if ((m = id.match(/^v159-go-(loc|loot)-(.+)$/))) { close13(); travel159(m[1], m[2]); return true; }
		if (id === "v13-road-car") { const ok = lv("mechanics") >= 2 || perk13("mechanics", 9) || Math.random() < .5; if (ok) { giveItem("gas", 2); player.scrap += 3; pushLog("Two cans of gas and a box of hose clamps."); } else { giveItem("gas", 1); pushLog("A cup of stale gas. Better than nothing."); } train("mechanics", 6); train("scavenging", 5); return close13(); }
		if (id === "v13-road-help") { if (countOf("jerky") > 0) takeItem("jerky", 1); loyalty("stranger-help"); pushLog("He tells you raiders have been working the Forks road at night. He thanks you and goes."); return close13(); }
		if (id === "v13-road-rob") { giveItem("shells", 3); player.karma = (player.karma ?? 0) - 3; loyalty("stranger-rob"); pushLog("Three shells and a can of beans. He doesn't look back."); return close13(); }
		if (id === "v13-road-kid") { loyalty("lost-kid"); shiftRep("ponds", 3, 8); grantXp(20); pushLog("His mother cries and hugs you both. She gives you a jar of honey, all they've got."); giveItem("syrup", 1); diary("Walked a lost boy home to the Forks."); return close13(); }
		if ((m = id.match(/^v13-camp-(.+)$/))) { close13(); campRaid(m[1]); return true; }
		if (id === "v13-jack") {
			if (player.scrap >= 3) { player.scrap -= 3; loyalty("trade-jack"); pushLog("You trade Jack 3 iron for a box of .30-30. He nods. \"Square.\""); giveItem("shells", 2); }
			else pushLog("Jack doesn't deal on credit.");
			return close13();
		}
		if (id === "v13-main-talk") { const r = talkNpc?.role; const line = MAIN_TALK[w13.main.act]?.[r]; if (!line) return close13(); if (!w13.main.flags[`talk${w13.main.act}${r}`]) { w13.main.flags[`talk${w13.main.act}${r}`] = true; diary(`${talkNpc.name}: ${line.replace(/^"|"$/g, "").slice(0, 120)}`); } return openD13(talkNpc.name, line, [{ label: "Close", id: "close" }]); }
		if (id === "v13-main-intro") { const a = mainAct(); w13.main.flags[`intro${a.n}`] = true; return openD13(a.intro[0], a.intro[1], [{ label: "Close", id: "close" }]); }
		if (id === "v13-main-signal") { w13.main.flags.signal = true; return openD13("Cyndal", "\"Listen.\" Static, then a calm voice: \"Augusta has fuel. Augusta has medicine. Augusta has order. Come south.\" It loops. \"Same words every hour. Dad says nobody talks that calm anymore.\"", [{ label: "Close", id: "close" }]); }
		if (id === "v13-main-jack") {
			w13.main.flags.jackTalk = true;
			if ((w13.loyal.jack ?? 0) < 30) return openD13("Jack Ready", `"You ain't there yet, bub." (Jack's trust: ${w13.loyal.jack}/30. Trade with him, finish his bunker map job.)`, [{ label: "Close", id: "close" }]);
			return openD13("Jack Ready", "He unrolls the survey maps on the hood of the truck. \"That broadcast's bait, plain. I've watched folks go south on it. Nobody comes back up the Kennebec.\"", [{ label: "Close", id: "close" }]);
		}
		if (id === "v13-main-marcel") { w13.main.flags.marcel = true; return openD13("Marcel Thibodeau", "\"Caravans that answer that signal never come back. Not one. There's a man they call the Collector. Every raider on the river works for him now.\"", [{ label: "Close", id: "close" }]); }
		if (id === "v15-kitchen") { close13(); openTown({ id: "harmony", town: "harmony", name: "The farmhouse kitchen", scene: "kitchen" }); return true; }
		if (id === "v13-main-choose") {
			const avg = Math.round(COMPANIONS.reduce((n, c) => n + (w13.left[c] ? -50 : w13.loyal[c]), 0) / COMPANIONS.length);
			const canUnite = (rebuiltN() >= 1 && avg >= 20) || uniteWaived();
			return openD13("Sarah", MAIN_ACTS[6].intro[1], [
				{ label: canUnite ? "Unite the towns" : `Unite the towns (needs a rebuilt Harmony building and loyalty: avg ${avg}/20)`, id: canUnite ? "v13-main-unite" : "v13-main-choose" },
				{ label: "Make a deal with the Collector", id: "v13-main-deal" },
				{ label: "Go it alone", id: "v13-main-alone" },
			]);
		}
		if ((m = id.match(/^v13-main-(unite|deal|alone)$/))) {
			w13.main.choice = m[1];
			loyalty(m[1] === "deal" ? "deal-collector" : m[1]);
			if (m[1] === "deal") { player.scrap = Math.max(0, player.scrap - 20); w13.main.siege = 2; w13.main.won = true; pushLog("You send word down the river: the farm pays his toll. He sends back a single shell casing. Deal."); }
			return close13();
		}
		if (id === "v13-ending-next") { w13.main.slide += 1; sync(true); return true; }
		return false;
	}
	function close13() {
		dialogue = null; talkNpc = null; phase = "play"; sync(true);
		return true;
	}
	/** v13.4 High graphics: warm daylight tint that follows the hour, and a mild vignette. */
	let vignetteCv = null;
	function paintDaylight(dark) {
		const h = (((clock % DAY_LENGTH_SEC) + DAY_LENGTH_SEC) % DAY_LENGTH_SEC) / DAY_LENGTH_SEC * 24;
		// golden near sunrise and sunset, a faint warm cast at noon
		const gold = Math.max(0, 1 - Math.abs(h - 7) / 2.2) + Math.max(0, 1 - Math.abs(h - 17.5) / 2.6);
		const a = Math.min(.16, .035 + gold * .11) * (1 - dark);
		if (a > .004) {
			ctx.save(); ctx.globalCompositeOperation = "soft-light";
			ctx.fillStyle = `rgba(255, ${Math.round(196 - gold * 40)}, ${Math.round(120 - gold * 50)}, ${Math.min(.5, a * 3)})`;
			ctx.fillRect(0, 0, viewW, viewH);
			ctx.restore();
		}
		const w = Math.ceil(viewW / 4), hh = Math.ceil(viewH / 4);
		if (!vignetteCv || vignetteCv.width !== w || vignetteCv.height !== hh) {
			vignetteCv = document.createElement("canvas"); vignetteCv.width = w; vignetteCv.height = hh;
			const g2 = vignetteCv.getContext("2d");
			const g = g2.createRadialGradient(w / 2, hh / 2, Math.min(w, hh) * .38, w / 2, hh / 2, Math.hypot(w, hh) * .56);
			g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(8,6,4,0.34)");
			g2.fillStyle = g; g2.fillRect(0, 0, w, hh);
		}
		ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(vignetteCv, 0, 0, viewW, viewH); ctx.restore();
	}
	/** Weather overlay drawn in screen space: snow, nor'easter, fog, rain, black-ice sheen. */
	function precipOn193() {
		if (precipForce !== null) return precipForce;
		const h = (((clock % DAY_LENGTH_SEC) + DAY_LENGTH_SEC) % DAY_LENGTH_SEC) / DAY_LENGTH_SEC * 24;
		return (h + curDay() * 5) % 8 < 3;
	}
	function paintWeather13() {
		if (!ctx) return;
		const now = performance.now() / 1000;
		const dtw = Math.min(.25, Math.max(0, now - (weatherT || now))); weatherT = now;
		const cur = w13.weather.id;
		// v13.4: weather fades in and out over a few seconds instead of snapping (Low: snaps)
		// v15.9.3: rain, snow and nor'easter fall as timed showers (about 3 game hours in 8), not all day
		const precip = precipOn193();
		for (const k of ["fog", "blackice", "noreaster", "snow", "rain"]) {
			const want = k === cur && (k === "fog" || k === "blackice" || precip) ? 1 : 0;
			const m = weatherMix[k] ?? want;
			weatherMix[k] = hiFx() ? m + (want - m) * Math.min(1, dtw / 2.5) : want;
		}
		if (cur === "clear" && !Object.values(weatherMix).some((v) => v > .01)) return;
		const t = now;
		ctx.save();
		const fogA = weatherMix.fog || 0;
		if (fogA > .01) {
			const hr = player ? worldToScreen(player.x, player.y, camX, camY) : { sx: viewW / 2, sy: viewH / 2 };
			const hp = zoomPoint(hr.sx, hr.sy);
			const g = ctx.createRadialGradient(hp.sx, hp.sy - 40, 60, hp.sx, hp.sy - 40, Math.max(viewW, viewH) * .55);
			g.addColorStop(0, `rgba(206,210,212,${.05 * fogA})`); g.addColorStop(.45, `rgba(206,210,212,${.55 * fogA})`); g.addColorStop(1, `rgba(206,210,212,${.86 * fogA})`);
			ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, viewH);
		}
		if ((weatherMix.blackice || 0) > .01) { ctx.fillStyle = `rgba(120,160,210,${.10 * weatherMix.blackice})`; ctx.fillRect(0, 0, viewW, viewH); }
		if ((weatherMix.noreaster || 0) > .01) { ctx.fillStyle = `rgba(200,206,214,${.32 * weatherMix.noreaster})`; ctx.fillRect(0, 0, viewW, viewH); }
		if (hiFx() && (weatherMix.snow || 0) > .01) { ctx.fillStyle = `rgba(214,222,236,${.08 * weatherMix.snow})`; ctx.fillRect(0, 0, viewW, viewH); }
		for (const id of ["noreaster", "snow", "rain"]) {
			const mix = weatherMix[id] || 0;
			if (mix < .02) continue;
			const n = Math.round((id === "noreaster" ? 130 : id === "snow" ? 60 : 70) * mix * (hiFx() ? 1 : .6));
			const wind = id === "noreaster" ? 520 : id === "rain" ? 60 : 40;
			const fall = id === "rain" ? 700 : id === "noreaster" ? 260 : 90;
			ctx.strokeStyle = id === "rain" ? "rgba(170,190,215,0.55)" : "rgba(250,250,252,0.85)";
			ctx.fillStyle = "rgba(250,250,252,0.9)";
			ctx.lineWidth = id === "rain" ? 1 : 2;
			for (let i = 0; i < n; i++) {
				const sx = ((i * 97.13 + t * wind * (0.7 + (i % 5) * .1)) % (viewW + 80) + viewW + 80) % (viewW + 80) - 40;
				const sy = ((i * 53.71 + t * fall * (0.8 + (i % 7) * .06)) % (viewH + 40) + viewH + 40) % (viewH + 40) - 20;
				if (id === "rain" || id === "noreaster") { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - wind * .02, sy - (id === "rain" ? 14 : 4)); ctx.stroke(); }
				else { ctx.beginPath(); ctx.arc(sx, sy, 1.2 + (i % 3) * .6, 0, Math.PI * 2); ctx.fill(); }
			}
		}
		ctx.restore();
	}
	function v13Running() {
		if (injured("legs")) return false;
		return !!player && player.stamina > 0 && (holdWalk || intent?.kind === "walk" && (intent.path?.length ?? 0) > 6);
	}
	function v13Hud() {
		const fx = fx13();
		const sb = setBonus13();
		return {
			core: core13(), fx, points: player?.points ?? 0, backstory: w13.backstory,
			weather: { id: w13.weather.id, ...weather13() }, moon: { phase: moonPhase(curDay()), name: MOON_NAMES[moonPhase(curDay())] },
			needs: { ...w13.needs }, hard: w13.hard, ail: Object.keys(w13.ail).map((k) => ({ id: k, ...AILMENTS[k] })), buffs: Object.keys(w13.buffs).filter((k) => buffOn(k)),
			loyal: COMPANIONS.map((c) => ({ id: c, name: COMPANION_NAME[c], v: w13.loyal[c], left: !!w13.left[c], helps: w13.loyal[c] >= LOYALTY_HELP })),
			armor: armorPieces().map((id) => ({ id, name: GEAR[id].name, dura: duraOf(id), patched: !!w13.patched[id] })), set: sb ? { name: sb.name, text: sb.text } : null,
			skills: [],
			perks: [],
			rebuilt: { ...w13.rebuilt }, bounties: w13.bounties.map((b) => ({ text: b.text, got: b.got, need: b.need, pay: b.pay })),
			diary: w13.diary.slice(-40), notes: w13.notes,
			main: { act: w13.main.act, title: mainAct().title, goal: mainAct().goal, acts: MAIN_ACTS.map((a) => ({ n: a.n, title: a.title, goal: a.goal, done: a.n < w13.main.act, notes: a.n <= w13.main.act ? [...(MAIN_JOURNAL[a.n] ?? []), ...(a.n < w13.main.act ? [a.done] : [])] : [] })), ending: w13.main.ending ? { id: w13.main.ending, ...ENDINGS[w13.main.ending] } : null, slide: w13.main.slide },
			canTravel: mounted && bikeBuilt(),
		};
	}
	// ======================= end v13 =======================
	/** Stand-in shop sign for a building with no Grok Build art yet. */
	function paintSign(text, x, y, h, dcx, dcy) {
		const r = worldToScreen(x, y, dcx, dcy);
		const p = zoomPoint(r.sx, r.sy);
		ctx.save();
		ctx.font = `bold ${Math.max(9, Math.round(13 * zoom))}px serif`;
		const w = ctx.measureText(text).width + 12 * zoom;
		const yy = p.sy - h * zoom * .55;
		ctx.fillStyle = "rgba(38,30,20,.92)"; ctx.fillRect(p.sx - w / 2, yy - 11 * zoom, w, 20 * zoom);
		ctx.strokeStyle = "#c9a35a"; ctx.lineWidth = 1.5; ctx.strokeRect(p.sx - w / 2, yy - 11 * zoom, w, 20 * zoom);
		ctx.fillStyle = "#efe2c4"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, p.sx, yy);
		ctx.restore();
	}
	function compassTo(dx, dy) {
		return COMPASS[((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8];
	}
	function inCombat141() {
		if (!world || !player) return false;
		if (swingAnim > 0 || pendingHit) return true;
		return world.enemies.some((e) => !e.dead && e.aggro && e.temper !== "timid" && Math.hypot(e.x - player.x, e.y - player.y) < 420);
	}
	function openTalk(npc) {
		if (!player) return;
		// v14.1 playtest: no conversation pops open in the middle of a fight
		if (inCombat141()) { if (performance.now() - (talkNag141 || 0) > 2500) { talkNag141 = performance.now(); pushLog(`${npc.name ?? "They"} can't talk now. Deal with the fight first.`); } intent = null; return; }
		ensureProgress(player);
		parkBike(true);
		talkNpc = npc;
		statsOpen = false;
		packOpen = false;
		buildOpen = false;
		if (npc.role === "marcel") {
			dialogue = {
				speaker: npc.name,
				text: "\"You found the store. Ayuh, that's me on the radio.\" He wipes the counter. \"Cash is iron. Same as the sled.\"",
				choices: [
					{ label: "Eight shells — 10 iron", id: "q10-buy-shells" },
					{ label: "Field bandage — 6 iron", id: "q10-buy-wrap" },
					{ label: "Snowshoes — 16 iron", id: "q10-buy-snowshoes" },
					{ label: "Barn lantern — 12 iron", id: "q10-buy-lantern" },
					{ label: "Smoked jerky — 5 iron", id: "q10-buy-jerky" },
					{ label: "Gas, quart can — 4 iron", id: "q10-buy-gas" },
					// v13.2 fix: the store talk returned early, so the bounty board and Act 4 never showed up here
					...v13TalkChoices("marcel"),
					{ label: "Take care, Marcel", id: "close" },
				],
			};
			return;
		}
		const town = townOf(npc.role);
		const rep = town ? player.rep[town] ?? 0 : 0;
		if (town && townHostile(rep) && (npc.role === "cal" || npc.role === "rejean" || npc.role === "mira")) {
			dialogue = {
				speaker: npc.name,
				text: `${npc.name.split(" ")[0]} will not deal with you. Word from this ground got here first.`,
				choices: [{ label: "I'll go", id: "close" }]
			};
		} else {
			if (npc.role === "cal") jackMet = true;
			if (npc.role === "sarah") restockKitchen();
			const line = npcLine(npc.role, npc.name, quest, lootedChests.has(91001) && lootedChests.has(91002), talkState());
			const v14x = v14Talk(npc.role, npc);
			if (v14x) { dialogue = v14x; phase = "dialogue"; sync(true); return; }
			const q10x = q10Talk(npc.role, q10, snow >= 3, false);
			if (q10x?.replace) Object.assign(line, q10x.replace);
			else if (q10x?.add) line.choices = [...line.choices.slice(0, -1), ...q10x.add, ...line.choices.slice(-1)];
			const q11x = q10x?.replace ? null : q11Talk(npc.role, q11, Q11C(), false);
			if (q11x?.replace) Object.assign(line, q11x.replace);
			else {
				const extra = [...(q11x?.add ?? []), ...q11FarmChoices(npc.role), ...v13TalkChoices(npc.role)];
				if (extra.length) line.choices = [...line.choices.slice(0, -1), ...extra, ...line.choices.slice(-1)];
			}
			if (rep <= -10) line.text = `You are not welcome here, and they do not pretend otherwise. ${line.text}`;
			line.choices = line.choices.map((choice) => {
				if (!choice.check) return choice;
				const chance = checkChance(skillOf(choice.check.skill) + fx13().talkBonus, choice.check.dc, rep, player.karma ?? 0);
				const skillName = SKILLS.find((s) => s.id === choice.check.skill)?.name ?? "Check";
				return { ...choice, label: `${choice.label} · ${skillName} ${chance}%` };
			});
			dialogue = line;
		}
		phase = "dialogue";
		intent = null;
		player.dir = facing8(npc.x - player.x, npc.y - player.y);
		npc.dir = facing8(player.x - npc.x, player.y - npc.y);
		player.frame = 0;
		sfx("talk");
		sync(true);
	}
	function recruitTalk() {
		const npc = talkNpc;
		if (!npc || !world || !player) return;
		if (party) {
			pushLog(`${party.name} is already with you. Send them home first.`);
			return;
		}
		party = {
			role: npc.role,
			name: npc.name,
			hp: npc.hp,
			maxHp: npc.maxHp,
			homeMap: mapId,
			homeId: npc.id,
			homeX: npc.homeX,
			homeY: npc.homeY,
			x: npc.x,
			y: npc.y,
			dir: npc.dir,
			frame: 0,
			anim: 0,
			cooldown: .4
		};
		goneNpcs.add(npc.id);
		world.npcs = world.npcs.filter((other) => other.id !== npc.id);
		pushLog(`${npc.name} falls in behind you. One companion. Send them home from Stats.`);
	}
	function placeReturn(body) {
		if (!world || !body) return;
		goneNpcs.delete(body.homeId);
		if (world.npcs.some((n) => n.id === body.homeId)) return;
		world.npcs.push({
			id: body.homeId,
			role: body.role,
			name: body.name,
			x: body.homeX,
			y: body.homeY,
			homeX: body.homeX,
			homeY: body.homeY,
			dir: 0,
			frame: 0,
			anim: 0,
			path: null,
			pause: 1.2,
			hp: Math.max(1, body.hp),
			maxHp: body.maxHp
		});
	}
	function dismissParty() {
		if (!party) return;
		if (party.homeMap === mapId) placeReturn(party);
		else partyReturn = {
			role: party.role,
			name: party.name,
			hp: party.hp,
			maxHp: party.maxHp,
			homeMap: party.homeMap,
			homeId: party.homeId,
			homeX: party.homeX,
			homeY: party.homeY,
			x: party.homeX,
			y: party.homeY,
			dir: 0
		};
		pushLog(`${party.name} heads back.`);
		party = null;
		saveGame();
		sync(true);
	}
	function landReturn() {
		if (!partyReturn || partyReturn.homeMap !== mapId) return;
		placeReturn(partyReturn);
		partyReturn = null;
	}
	function snapParty() {
		if (!party || !player) return;
		party.x = player.x + 28;
		party.y = player.y + 16;
	}
	function hurtParty(amount, fromX, fromY) {
		if (!party) return;
		const dmg = Math.max(1, amount - 1);
		party.hp -= dmg;
		floater(party.x, party.y - 24, `-${dmg}`);
		const dx = party.x - fromX;
		const dy = party.y - fromY;
		const m = Math.hypot(dx, dy) || 1;
		slide(party, dx / m * 10, dy / m * 10);
		if (party.hp <= 0) {
			pushLog(`${party.name} goes down.`);
			corpseOfNpc(party);
			party = null;
			saveGame();
		}
	}
	function stepParty(dt) {
		if (!party || !player || !world || inside) return;
		party.cooldown = Math.max(0, party.cooldown - dt);
		const dx = player.x - party.x;
		const dy = player.y - party.y;
		const dist = Math.hypot(dx, dy);
		let moving = false;
		const foe = world.enemies.filter((e) => !e.dead && e.aggro).sort((a, b) => Math.hypot(a.x - party.x, a.y - party.y) - Math.hypot(b.x - party.x, b.y - party.y))[0];
		const foeDist = foe ? Math.hypot(foe.x - party.x, foe.y - party.y) : 9999;
		if (foe && foeDist < 200 && foeDist > 46) {
			const path = pathTo(world, party.x, party.y, foe.x, foe.y);
			if (path) {
				follow(party, path, 88, dt, true);
				moving = true;
			}
		} else if (dist > 52) {
			const path = pathTo(world, party.x, party.y, player.x, player.y);
			if (path) {
				follow(party, path, dist > 180 ? 120 : 86, dt, true);
				moving = true;
			}
		}
		if (foe && foeDist <= 52 && party.cooldown <= 0) {
			party.cooldown = .95;
			party.dir = facing8(foe.x - party.x, foe.y - party.y);
			const dmg = 4 + Math.floor((party.maxHp || 20) / 18);
			foe.hp -= dmg;
			foe.hurt = .12;
			foe.aggro = true;
			sfx("hit");
			floater(foe.x, foe.y - 28, String(dmg));
			burst(foe.x, foe.y, "#c4543a", 5);
			if (foe.hp <= 0) markDead(foe, Math.max(2, Math.round(foe.xp * .6)));
		}
		if (moving) party.anim = (party.anim || 0) + dt * 8;
		party.frame = moving ? Math.floor(party.anim) % 4 : 0;
		party.still = !moving;
	}
	let work = null;
	function toolReady(mode) {
		const family = mode === "chop" ? "axe" : "pickaxe";
		const name = mode === "chop" ? "axe" : "pickaxe";
		if (mode === "chop" ? hasAxe() : hasPick()) return true;
		const packed = !!player && player.bag.some((s) => s.qty > 0 && GEAR[s.id]?.family === family);
		pushLog(packed ? `Put the ${name} in your hand. It is in your pack.` : `You need a ${name} in hand to ${mode === "chop" ? "fell that" : "mine that"}.`);
		sfx("click");
		return false;
	}
	function startLabor(prop, mode) {
		if (!player || !world || !prop) return;
		if (!toolReady(mode)) return;
		parkBike(true);
		const c = propCenter(prop);
		if (Math.hypot(c.x - player.x, c.y - player.y) > 70) {
			if (work && work.fall <= 0 && work.id !== prop.id) work = null;
			intent = {
				kind: mode,
				id: prop.id,
				path: pathTo(world, player.x, player.y, c.x, c.y) ?? []
			};
			return;
		}
		if (!work || work.id !== prop.id || work.mode !== mode) {
			work = {
				id: prop.id,
				mode,
				hits: 3,
				total: 3,
				shake: 0,
				fall: 0,
				fallMax: mode === "chop" ? 1.08 : .5,
				side: player.x < c.x ? 1 : -1,
				swing: 0,
				landed: true
			};
			pushLog(mode === "chop" ? "You set the axe into the trunk." : "You set the pick into the rock.");
		}
		intent = {
			kind: mode,
			id: prop.id,
			path: []
		};
	}
	function stepLabor(dt, pace) {
		if (!work || !player || !world || work.fall > 0) return;
		const prop = world.props.find((p) => p.id === work.id);
		if (!prop) {
			work = null;
			intent = null;
			return;
		}
		const c = propCenter(prop);
		if (work.swing > 0) {
			player.dir = facing8(c.x - player.x, c.y - player.y);
			return;
		}
		if (work.mode === "chop" ? !hasAxe() : !hasPick()) {
			work = null;
			intent = null;
			return;
		}
		if (Math.hypot(c.x - player.x, c.y - player.y) > 74) {
			intent.path = follow(player, intent.path?.length ? intent.path : pathTo(world, player.x, player.y, c.x, c.y) ?? [], pace, dt, true);
			return;
		}
		player.dir = facing8(c.x - player.x, c.y - player.y);
		if (player.cooldown > 0) return;
		if (turnBased) {
			if (ap < 2) {
				pushLog("Not enough action points.");
				work = null;
				intent = null;
				sync(true);
				return;
			}
			ap -= 2;
		}
		player.cooldown = work.mode === "chop" ? .78 : .82;
		drawn = 1.5;
		work.swing = .62;
		work.landed = false;
		reach = work.swing;
	}
	function landBlow() {
		if (!work || !player || !world || work.landed) return;
		work.landed = true;
		const prop = world.props.find((p) => p.id === work.id);
		if (!prop) {
			work = null;
			intent = null;
			return;
		}
		const c = propCenter(prop);
		work.hits -= 1;
		work.shake = .28;
		if (work.mode === "chop") {
			burst(c.x, c.y - 52, "#e7d3a4", 9, true);
			splinters(c.x, c.y - 40, "#c4a574", 6);
			sfx("chop");
		} else {
			burst(c.x, c.y - 16, "#d9d4c8", 8, true);
			burst(c.x, c.y - 12, "#b87333", 5, true);
			splinters(c.x, c.y - 8, "#8d8680", 4);
			sfx("mine");
		}
		if (!reduceMotion) shake = Math.min(6, shake + 2.4);
		if (work.hits <= 0) {
			work.fall = reduceMotion ? .05 : work.fallMax;
			work.shake = .2;
			if (work.mode === "chop") burst(c.x, c.y - 130, "#6a8a48", 14);
			else splinters(c.x, c.y - 10, "#b87333", 5);
		}
	}
	function splinters(x, y, color, n) {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = 50 + Math.random() * 130;
			particles.push({
				x,
				y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s * .55,
				life: .55 + Math.random() * .3,
				max: .85,
				color,
				size: 8 + Math.random() * 8,
				spin: Math.random() * 6,
				spinV: (Math.random() - .5) * 16
			});
		}
	}
	function paintNotch(x, y, hits, dcx, dcy) {
		const foot = zoomPoint(worldToScreen(x, y, dcx, dcy).sx, worldToScreen(x, y, dcx, dcy).sy);
		const bite = Math.min(3, hits);
		const w = (8 + bite * 8) * zoom;
		ctx.save();
		ctx.translate(foot.sx, foot.sy - 58 * zoom);
		ctx.fillStyle = "#f0ddb0";
		ctx.beginPath();
		ctx.moveTo(-w * .2, 2 * zoom);
		ctx.lineTo(w, -bite * 2.4 * zoom);
		ctx.lineTo(w * .62, bite * 3.4 * zoom);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "#6a4324";
		ctx.fillRect(-w * .15, -zoom, w * .28, 3 * zoom);
		ctx.restore();
	}
	function paintCracks(x, y, hits, dcx, dcy) {
		const p = zoomPoint(worldToScreen(x, y, dcx, dcy).sx, worldToScreen(x, y, dcx, dcy).sy);
		const cy = p.sy - 34 * zoom;
		ctx.save();
		ctx.strokeStyle = "rgba(24, 20, 16, 0.92)";
		ctx.lineWidth = Math.max(1.5, 2.2 * zoom);
		ctx.lineCap = "round";
		const n = Math.min(3, hits);
		for (let i = 0; i < n; i++) {
			const a = -.95 + i * .78;
			ctx.beginPath();
			ctx.moveTo(p.sx + (i - 1) * 4 * zoom, cy);
			ctx.lineTo(p.sx + Math.cos(a) * (18 + n * 7) * zoom, cy + Math.sin(a) * (14 + n * 5) * zoom);
			ctx.stroke();
		}
		ctx.restore();
	}
	function paintStump(x, y, dcx, dcy) {
		const p = zoomPoint(worldToScreen(x, y, dcx, dcy).sx, worldToScreen(x, y, dcx, dcy).sy);
		const z = zoom;
		ctx.fillStyle = "#4a301c";
		ctx.beginPath();
		ctx.ellipse(p.sx, p.sy - 3 * z, 13 * z, 6 * z, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#6d4a2c";
		ctx.fillRect(p.sx - 8 * z, p.sy - 18 * z, 16 * z, 15 * z);
		ctx.fillStyle = "#e6d2a4";
		ctx.beginPath();
		ctx.ellipse(p.sx, p.sy - 18 * z, 8 * z, 3.8 * z, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "#8a6840";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.ellipse(p.sx, p.sy - 18 * z, 3.4 * z, 1.5 * z, 0, 0, Math.PI * 2);
		ctx.stroke();
	}
	/** Snowmelt standing in the old Attean mill: flat dark water on the ground, under everything. */
	function paintFlood(dcx, dcy) {
		const f = world?.flood;
		if (!f || !explored[f.ty * 156 + f.tx]) return;
		const t = performance.now() / 1000;
		const blobs = [[0, 0, 2.6], [-1.6, .8, 1.5], [1.7, -.6, 1.6], [.4, 1.9, 1.3], [-.8, -1.8, 1.2], [2.4, 1.4, 1]];
		ctx.save();
		for (const [dx, dy, r] of blobs) {
			const raw = worldToScreen((f.tx + .5 + dx) * TILE, (f.ty + .5 + dy) * TILE, dcx, dcy);
			const p = zoomPoint(raw.sx, raw.sy);
			const rx = r * TILE * .78 * zoom, ry = rx * CAM_ISO_Y;
			const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, rx);
			g.addColorStop(0, "rgba(28,40,46,0.78)");
			g.addColorStop(.75, "rgba(34,48,54,0.62)");
			g.addColorStop(1, "rgba(40,52,56,0)");
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.ellipse(p.sx, p.sy, rx, ry, 0, 0, Math.PI * 2);
			ctx.fill();
			// a slow glint across the surface
			ctx.strokeStyle = `rgba(170,190,196,${.1 + .06 * Math.sin(t * 1.3 + dx)})`;
			ctx.lineWidth = 1.2 * zoom;
			ctx.beginPath();
			ctx.ellipse(p.sx - rx * .15, p.sy - ry * .2, rx * .45, ry * .3, 0, Math.PI * 1.1, Math.PI * 1.7);
			ctx.stroke();
		}
		ctx.restore();
	}
	function paintPit(x, y, dcx, dcy) {
		const p = zoomPoint(worldToScreen(x, y, dcx, dcy).sx, worldToScreen(x, y, dcx, dcy).sy);
		const z = zoom;
		ctx.fillStyle = "rgba(42, 38, 32, 0.9)";
		ctx.beginPath();
		ctx.ellipse(p.sx, p.sy, 16 * z, 7 * z, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#9a9186";
		ctx.beginPath();
		ctx.ellipse(p.sx - 9 * z, p.sy - 2 * z, 5 * z, 2.6 * z, .4, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#b87333";
		ctx.fillRect(p.sx + 5 * z, p.sy - z, 4 * z, 2.5 * z);
	}
	function laborFrame(swing) {
		const t = 1 - Math.max(0, swing) / .62;
		if (t < .32) return 0;
		if (t < .7) return 2;
		return 3;
	}
	function paintToolSwing(dcx, dcy) {
		if (!work || !player) return;
		const img = images.get(work.mode === "chop" ? "tool-axe" : "tool-pick");
		if (!img) return;
		const foot = zoomPoint(worldToScreen(player.x, player.y, dcx, dcy).sx, worldToScreen(player.x, player.y, dcx, dcy).sy);
		const lean = lungeOf(player.dir);
		const mine = work.mode === "mine";
		const handsX = foot.sx + lean.x * zoom * 1.15;
		const handsY = foot.sy - HERO_H * (mine ? .34 : .48) * zoom + lean.y * zoom * .4;
		const base = [
			Math.PI / 2,
			Math.PI * .75,
			Math.PI,
			-Math.PI * .75,
			-Math.PI / 2,
			-Math.PI / 4,
			0,
			Math.PI / 4
		][player.dir & 7];
		const t = 1 - Math.max(0, work.swing) / .62;
		const strike = t < .72 ? Math.pow(t / .72, mine ? 1.7 : 1.4) : 1;
		const follow = t < .72 ? 0 : (t - .72) / .28;
		const ang = base - (mine ? .55 : 1.25) + strike * (mine ? 1.15 : 1.7) + follow * .22;
		const len = (mine ? 92 : 108) * zoom;
		const w = len * (img.width / img.height);
		ctx.save();
		ctx.translate(handsX, handsY);
		ctx.rotate(ang + Math.PI / 2);
		ctx.drawImage(img, -w * .5, -len * .9, w, len);
		ctx.restore();
	}
	function finishLabor(prop) {
		if (!player || !world || !work) return;
		const mode = work.mode;
		const c = propCenter(prop);
		const camp = player.trait === "camp" ? 1 : 0;
		const trail = skillOf("trail") >= 45 ? 1 : 0;
		if (mode === "chop") {
			const wood = 5 + camp + trail;
			player.wood = Math.min(999, player.wood + wood);
			floater(c.x, c.y - 56, `+${wood} timber`);
			pushLog(`The tree falls. ${wood} timber.`);
			burst(c.x, c.y - 90, "#6a8a48", 14);
			burst(c.x, c.y - 24, "#c4a574", 8);
			scars.push({
				kind: "stump",
				x: c.x,
				y: c.y,
				side: work.side || 1
			});
		} else {
			const iron = 2 + camp + (Math.random() < .25 + player.luck * .05 ? 1 : 0);
			const stone = 1 + trail;
			player.scrap = Math.min(999, player.scrap + iron);
			player.stone = Math.min(999, player.stone + stone);
			floater(c.x, c.y - 36, `+${iron} iron`);
			pushLog(`The rock splits. ${iron} iron, ${stone} stone.`);
			burst(c.x, c.y - 12, "#9aa0a6", 12);
			burst(c.x, c.y - 8, "#b87333", 6);
			splinters(c.x, c.y - 6, "#9a9186", 5);
			scars.push({
				kind: "pit",
				x: c.x,
				y: c.y,
				side: 1
			});
		}
		if (Math.random() < player.luck * .05) {
			const goods = ["pork", "maple", "matches", "pelt", "oil"];
			const foundId = goods[Math.random() * goods.length | 0];
			if (tryGive(foundId)) pushLog(`Luck turns up a ${GEAR[foundId].name.toLowerCase()}.`);
		}
		vacate(world, prop);
		world.props = world.props.filter((p) => p.id !== prop.id);
		noteRemoved(prop.id);
		sfx("gather");
		if (intent && (intent.kind === "chop" || intent.kind === "mine") && intent.id === prop.id) intent = null;
		work = null;
		saveGame();
		sync(true);
	}
	function tickWork(dt) {
		if (!work) return;
		work.shake = Math.max(0, work.shake - dt);
		if (work.swing > 0) {
			work.swing = Math.max(0, work.swing - dt);
			reach = work.swing;
			if (!work.landed && work.swing <= .14) landBlow();
		}
		if (!work || work.fall <= 0) return;
		work.fall -= dt;
		if (work.fall > 0) return;
		const prop = world?.props.find((p) => p.id === work.id);
		if (prop) finishLabor(prop);
		else work = null;
	}
	function gather(prop) {
		if (!world || !player || !prop.resource) return;
		const gain = (prop.amount ?? 3) + (player.trait === "camp" && (prop.resource === "wood" || prop.resource === "stone") ? 1 : 0) + (skillOf("trail") >= 45 ? 1 : 0);
		if (prop.resource === "scrap") player.scrap = Math.min(999, player.scrap + gain);
		if (prop.resource === "wood") player.wood = Math.min(999, player.wood + gain);
		if (prop.camp14 === "wood") v14.woodTaken = true;
		if (prop.resource === "stone") player.stone = Math.min(999, player.stone + gain);
		vacate(world, prop);
		world.props = world.props.filter((p) => p.id !== prop.id);
		noteRemoved(prop.id);
		reach = .38;
		pushLog(`Gathered ${gain} ${prop.resource === "wood" ? "timber" : prop.resource === "stone" ? "ledge" : "iron"}.`);
		if (Math.random() < player.luck * .05) {
			const goods = [
				"pork",
				"maple",
				"matches",
				"pelt",
				"oil"
			];
			const foundId = goods[Math.random() * goods.length | 0];
			if (tryGive(foundId)) pushLog(`Luck turns up a ${GEAR[foundId].name.toLowerCase()}.`);
		}
		sfx("gather");
		burst(propCenter(prop).x, propCenter(prop).y, "#e8dcc8", 8);
		intent = null;
	}
	function hasAxe() {
		return !!player && GEAR[player.weaponId]?.family === "axe";
	}
	function hasPick() {
		return !!player && GEAR[player.weaponId]?.family === "pickaxe";
	}
	function walkFrame(moving) {
		if (!moving) return 0;
		const img = images.get(heroKey());
		const cols = sheetCols(img);
		// v14.1: player.anim counts frames x 11 for every sheet, so any frame count plays at the timer's rate
		return Math.floor(player.anim / 11) % cols;
	}
	function heroKey() {
		const using = drawn > 0 || reach > 0 || swingAnim > 0 || intent?.kind === "attack" || intent?.kind === "chop" || intent?.kind === "mine";
		if (!player || !using || !player.weaponId) return "hero";
		if (work && work.swing > .05) return "hero";
		const family = GEAR[player.weaponId]?.family;
		if (family === "axe" || family === "pry") return "hero-axe";
		if (family === "pickaxe") return "hero-pick";
		if (family === "carbine" || family === "revolver" || family === "scatter") return "hero-gun";
		if (family === "knife") return "hero-knife";
		return "hero";
	}
	/** v13: the player's body. v2/player-<action>.png when it exists, else Justin's gw15 sheet (dyed
	 * to the creator's hair and cloth in heroSource), else null so callers fall back to the old hero art. */
	function plImg(action) {
		const src = asSarah() ? images.get(`v2/sarah-${action}`) : images.get(`v2/player-${action}`) || images.get(`v2/justin-${action}`);
		if (!src) return null;
		const n = `pl/${action}`;
		if (images.get(n) !== src) images.set(n, src);
		return n;
	}
	/** v13 armor paper doll: public/game/v2/armor/<piece>-<tier>-<action>.png, stacked feet, legs,
	 * chest, hands, head over the body, same grid as the body sheet. Missing layers are skipped. Player only. */
	const ARMOR_ORDER = [["feet", "feetId"], ["legs", "legsId"], ["chest", "coatId"], ["hands", "handsId"], ["head", "headId"]];
	const TIER_OF = { poor: 1, standard: 2, good: 3, rare: 4 };
	/** v14.1 paper doll for any humanoid: shared slots (head, chest, legs, feet, hands, back), drawn bottom-up, from
	 * sheets in the same 88x124 frame layout as the body (4 rows SW, NW, NE, SE; old 8-row sheets still work).
	 * Per body type: v2/armor/{man|woman|kid}/{slot}-{tier}-{act}.png; the man set falls back to the player's
	 * v2/armor/{slot}-{tier}-{act}.png. Only the player has it on today; set body.doll = true to turn it on. */
	const DOLL_SLOTS = [["feet", "feetId"], ["legs", "legsId"], ["chest", "coatId"], ["hands", "handsId"], ["back", "backId"], ["head", "headId"]];
	const DOLL_TYPES = ["man", "woman", "kid"];
	function dollTypeOf(who) {
		if (who === player) return asSarah() ? "woman" : "man";
		if (who.dollType && DOLL_TYPES.includes(who.dollType)) return who.dollType;
		if (who.role === "cyndal" || who.role === "loki") return "kid";
		return /sarah|mira|nora|adele|sera|ruth|mae|etta/.test(who.role ?? "") ? "woman" : "man";
	}
	function dollLayerNames(who, act) {
		if (!who || !(who === player || who.doll)) return [];
		const type = dollTypeOf(who), out = [];
		for (const [piece, field] of DOLL_SLOTS) {
			const g = who[field] && GEAR[who[field]];
			if (!g) continue;
			const tier = TIER_OF[g.quality] ?? 1;
			for (const base of [`v2/armor/${type}/${piece}-${tier}`, ...(type === "man" ? [`v2/armor/${piece}-${tier}`] : [])]) {
				const n = images.get(`${base}-${act}`) ? `${base}-${act}` : (act === "idle" || act === "run") && images.get(`${base}-walk`) ? `${base}-walk` : "";
				if (n) { out.push(n); break; }
			}
		}
		return out;
	}
	/** Draw a character's doll layers over its body blit (NPCs, raiders, family). */
	function paintDoll(who, act, frame, dir, x, y, drawH, dcx, dcy, lunge = false) {
		for (const n of dollLayerNames(who, act)) if (images.get(n)) blit(n, x, y, drawH, true, frame, dir, dcx, dcy, lunge);
	}
	function armorLayerNames(act) {
		if (!player) return [];
		const out = [];
		for (const [piece, field] of ARMOR_ORDER) {
			const id = player[field];
			const g = id && GEAR[id];
			if (!g) continue;
			const tier = TIER_OF[g.quality] ?? 1;
			const n = `v2/armor/${piece}-${tier}-${act}`;
			if (images.get(n)) out.push(n);
			else if (act !== "walk" && images.get(`v2/armor/${piece}-${tier}-walk`) && (act === "idle" || act === "run")) out.push(`v2/armor/${piece}-${tier}-walk`);
		}
		return out;
	}
	/** Armor dye: a multiply tint per piece (v13.dye[piece] = hex), cached per layer and colour. */
	function armorSource(name, img) {
		const piece = name.split("/")[2]?.split("-")[0];
		const hex = w13.dye?.[piece];
		if (!hex) return img;
		const key = `dye:${name}:${hex}`;
		const c = tinted.get(key);
		if (c) return c;
		const cv = document.createElement("canvas");
		cv.width = img.width; cv.height = img.height;
		const g = cv.getContext("2d");
		if (!g) return img;
		g.drawImage(img, 0, 0);
		g.globalCompositeOperation = "multiply";
		g.fillStyle = hex;
		g.fillRect(0, 0, cv.width, cv.height);
		g.globalCompositeOperation = "destination-in";
		g.drawImage(img, 0, 0);
		tinted.set(key, cv);
		return cv;
	}
	let armorDrawn = [];
	function paintArmor(act, frame, dir, dcx, dcy, lunge = false) {
		armorDrawn = armorLayerNames(act);
		for (const n of armorDrawn) {
			const img = images.get(n);
			if (!img) continue;
			blitLayer(n, frame, dir, dcx, dcy, lunge);
		}
	}
	function blitLayer(n, frame, dir, dcx, dcy, lunge) {
		const body = plImg(act0(n)) || plImg("walk");
		const bimg = body && images.get(body);
		const img = images.get(n);
		if (!bimg || !img || !ctx) return;
		const raw = worldToScreen(player.x, player.y, dcx, dcy);
		const foot = zoomPoint(raw.sx, raw.sy);
		const lean = lunge ? lungeOf(dir) : { x: 0, y: 0 };
		const cols = sheetCols(img), g141 = Math.round(img.height / (img.width / cols * 124 / 88)), rows = g141 === 6 || g141 === 4 ? g141 : 8; img.diag4 = rows === 4;
		const sw = img.width / cols, sh = img.height / rows;
		const fcols = sheetCols(bimg);
		let frac = bimg.foot ?? .92;
		if (bimg.feet) { const f = bimg.feet[(dir % 8) * fcols + (frame % fcols)]; if (f) frac = f; }
		const dh = HERO_H * heroScale(body) * zoom;
		const dw = dh * (sw / sh);
		ctx.drawImage(armorSource(n, img), (frame % cols) * sw, facingRow(dir, rows, !!img.diag4) * sh, sw, sh, foot.sx + lean.x * zoom - dw / 2, foot.sy + lean.y * zoom - dh * frac, dw, dh);
	}
	function act0(n) {
		return n.split("-").slice(2).join("-");
	}
	/** v13: draw the player from the pl/* sheets with weapon, hit and down poses, plus armor layers. */
	function paintPlayerBody(flinch, drawCamX, drawCamY) {
		if (!plImg("walk") || !player) return false;
		const family = GEAR[player.weaponId]?.family;
		const gun = family === "carbine" || family === "revolver" || family === "scatter";
		const axe = family === "axe" || family === "pry" || family === "pickaxe";
		const using = drawn > 0 || reach > 0 || swingAnim > 0 || intent?.kind === "attack";
		const moving = player.anim !== player.idleAnim;
		player.idleAnim = player.anim;
		const colsOf = (a) => sheetCols(images.get(plImg(a) || plImg("walk")));
		let act = "walk";
		let frame = player.frame;
		let lunge = false;
		if (flinch) { act = flinch.name.slice(3); frame = flinch.frame; }
		else if (swingAnim > 0 && !work && gun && plImg("gun-atk")) { act = "gun-atk"; frame = Math.min(colsOf("gun-atk") - 1, Math.floor((.48 - swingAnim) * 1000 / ANIM_MS.fire)); }
		else if (swingAnim > 0 && !work && meleeFrame()) {
			// stand-in art: punch and swing play the 6-frame axe rows, the kick plays the walk rows with a lunge;
			// rows follow the 8 facings, so N/NE/NW use the back-facing rows
			const m = meleeFrame();
			const u = m.frame / m.frames;
			if (m.move === "kick" || !plImg("axe")) { act = "walk"; frame = Math.floor(u * colsOf("walk")); lunge = u >= .25 && u <= .6; }
			else { act = "axe"; frame = Math.floor(u * colsOf("axe")); }
		}
		else if (swingAnim > 0 && !work && plImg("axe")) { act = "axe"; frame = Math.min(colsOf("axe") - 1, Math.floor((1 - swingAnim / .48) * colsOf("axe"))); }
		else if (swingAnim > 0 && !work) { act = "walk"; lunge = true; }
		else if (work && work.swing > .05 && plImg("axe")) { act = "axe"; frame = Math.min(colsOf("axe") - 1, Math.floor((1 - Math.min(1, work.swing / .48)) * colsOf("axe"))); }
		else if (!moving && gun && using && plImg("gun")) { act = "gun"; frame = Math.floor(performance.now() / ANIM_MS.aim) % colsOf("gun"); }
		else if (!moving && plImg("idle")) { act = "idle"; frame = Math.floor(performance.now() / ANIM_MS.idle) % colsOf("idle"); }
		else if (moving && v13Running() && plImg("run")) act = "run";
		const name = plImg(act) || plImg("walk");
		blit(name, player.x, player.y, HERO_H, true, frame, player.dir, drawCamX, drawCamY, lunge);
		paintArmor(act, frame, player.dir, drawCamX, drawCamY, lunge);
		if (swingAnim > 0 && !work && act === "walk") paintSwingArc();
		void axe;
		return true;
	}
	function heroActionPose() {
		if (phase === "dead" && plImg("down")) {
			if (!fellAt) fellAt = performance.now();
			const u = Math.min(1, (performance.now() - fellAt) / 520);
			return { name: plImg("down"), frame: u >= 1 ? 3 : Math.min(2, Math.floor(u * 3)) };
		}
		if (player && player.hurt > 0 && plImg("hit") && !(swingAnim > 0 && !work)) return { name: plImg("hit"), frame: Math.min(2, Math.floor((1 - Math.min(1, player.hurt / .3)) * 3)) };
		if (phase === "dead" && images.get("hero-down")) {
			if (!fellAt) fellAt = performance.now();
			const u = Math.min(1, (performance.now() - fellAt) / 520);
			return { name: "hero-down", frame: u >= 1 ? 3 : Math.min(2, Math.floor(u * 3)) };
		}
		if (player && player.hurt > 0 && images.get("hero-hit") && !(swingAnim > 0 && !work)) return { name: "hero-hit", frame: 0 };
		return null;
	}
	const LOOK_RGB = {
		wool: [140, 98, 66],
		spruce: [70, 104, 72],
		linen: [206, 192, 160],
		soot: [66, 68, 74]
	};
	const PIECE_RGB = {
		shirt: [196, 168, 122],
		patch: [124, 84, 60],
		linen: [210, 196, 160],
		wool: [146, 96, 58],
		"coat-std": [98, 62, 44],
		"coat-good": [78, 44, 38],
		vest: [176, 140, 86],
		quilt: [128, 70, 62],
		plate: [168, 172, 176],
		rig: [132, 138, 128],
		soft: [96, 64, 48],
		woolcap: [74, 48, 40],
		felt: [58, 44, 34],
		ironhat: [176, 180, 184],
		trousers: [70, 56, 46],
		chaps: [108, 68, 38],
		gloves: [92, 66, 48],
		bracers: [122, 78, 46],
		// v13.1: creator coats and hats, so the player never reads as Justin's green work coat
		canvas: [184, 156, 108],
		waxed: [104, 78, 50],
		toque: [156, 42, 38],
		huntcap: [222, 100, 28],
		boots: [60, 44, 34]
	};
	const tinted = /* @__PURE__ */ new Map();
	/** Natural cloth dye. The pixel keeps its shading relative to the region's average brightness
	 * (ref), but the region as a whole lands near the dye's own brightness, so a bright tan coat
	 * dyed spruce becomes a dark forest green instead of lime. A little greying keeps it muted. */
	function dye(r, g, b, target, amt, ref = 0, mute = .18, contrast = .75) {
		const lum = r * .3 + g * .59 + b * .11;
		const tl = target[0] * .3 + target[1] * .59 + target[2] * .11 || 1;
		const rel = ref > 0 ? lum / ref : lum / tl;
		// soften the source's contrast a little so sparse masks (vest, plate) don't turn speckly
		const scale = Math.max(.4, Math.min(1.35, contrast < .5 ? Math.pow(Math.max(rel, .05), contrast) : 1 + (rel - 1) * contrast));
		let nr = target[0] * scale, ng = target[1] * scale, nb = target[2] * scale;
		const top = Math.max(nr, ng, nb);
		if (top > 228) { const k = 228 / top; nr *= k; ng *= k; nb *= k; }
		const gl = nr * .3 + ng * .59 + nb * .11;
		nr += (gl - nr) * mute; ng += (gl - ng) * mute; nb += (gl - nb) * mute;
		return [
			r + (Math.max(0, Math.min(255, nr)) - r) * amt,
			g + (Math.max(0, Math.min(255, ng)) - g) * amt,
			b + (Math.max(0, Math.min(255, nb)) - b) * amt
		];
	}
	function wornColors() {
		const look = LOOK_RGB[player.look] || LOOK_RGB.wool;
		const chest = player.coatId || "";
		const cover = chest === "coat-std" || chest === "coat-good" || chest === "quilt" || chest === "canvas" || chest === "waxed";
		const plate = chest === "plate" || chest === "rig" ? PIECE_RGB[chest] : null;
		return {
			shirt: cover ? PIECE_RGB[chest] : look,
			plate,
			vest: cover ? PIECE_RGB[chest] : chest === "vest" ? PIECE_RGB.vest : null,
			head: player.headId ? PIECE_RGB[player.headId] : null,
			helm: player.headId === "ironhat",
			legs: player.legsId ? PIECE_RGB[player.legsId] : null,
			hands: player.handsId ? PIECE_RGB[player.handsId] : null
		};
	}
	function dyePlayerBody(img, name = "hero") {
		const hair = player.hair || "black";
		const c = wornColors();
		const opts = { shirt: c.shirt, pants: c.legs, hat: c.head };
		const key = `body:${name}:${player.look}:${hair}:${player.coatId}:${player.headId}:${player.legsId}`;
		const cached = tinted.get(key);
		if (cached) return cached;
		const stamp = document.createElement("canvas");
		stamp.width = img.width;
		stamp.height = img.height;
		const g = stamp.getContext("2d", { willReadFrequently: true });
		if (!g) return img;
		g.drawImage(img, 0, 0);
		const data = g.getImageData(0, 0, stamp.width, stamp.height);
		dyeBodySheet(data, sheetCols(img), player.look, hair, 8, opts);
		g.putImageData(data, 0, 0);
		tinted.set(key, stamp);
		return stamp;
	}
	function wearPiece(id, field) {
		if (!id || !GEAR[id]) {
			player[field] = "";
			return;
		}
		if (!player.bag.some((s) => s.id === id)) player.bag.push({ id, qty: 1 });
		player[field] = id;
	}
	function heroSource(name, img) {
		if (!player || !img?.width) return img;
		if (name.startsWith("pl/")) return asSarah() || images.get(`v2/player-${name.slice(3)}`) === img ? img : dyePlayerBody(img, name);
		if (!/^(v2\/)?hero/.test(name)) return img;
		const colors = wornColors();
		const key = `${name}:${player.look}:${player.coatId}:${player.headId}:${player.legsId}:${player.handsId}:${player.feetId}:${player.backId}`;
		const cached = tinted.get(key);
		if (cached) return cached;
		if (!img.width) return img;
		const stamp = document.createElement("canvas");
		stamp.width = img.width;
		stamp.height = img.height;
		const g = stamp.getContext("2d", { willReadFrequently: true });
		if (!g) return img;
		g.drawImage(img.sharp || img, 0, 0);
		const data = g.getImageData(0, 0, stamp.width, stamp.height);
		const px = data.data;
		const cols = sheetCols({ width: stamp.width });
		const rows = name.endsWith("-atk") && stamp.width / stamp.height > 2.2 ? 1 : 8;
		const cw = stamp.width / cols;
		const ch = stamp.height / rows;
		const boxes = [];
		for (let i = 0; i < cols * rows; i++) boxes.push(null);
		for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
			const x0 = col * cw;
			const y0 = row * ch;
			let top = ch, bottom = 0, left = cw, right = 0, n = 0;
			for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
				if (px[((y0 + y) * stamp.width + (x0 + x)) * 4 + 3] < 40) continue;
				n++;
				if (y < top) top = y;
				if (y > bottom) bottom = y;
				if (x < left) left = x;
				if (x > right) right = x;
			}
			if (n > 20) boxes[row * cols + col] = { top, bottom, left, right };
		}
		for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
			const box = boxes[row * cols + col];
			if (!box) continue;
			const x0 = col * cw;
			const y0 = row * ch;
			const bh = Math.max(1, box.bottom - box.top);
			const bw = Math.max(1, box.right - box.left);
			let headX0 = box.right, headX1 = box.left;
			const headCut = box.top + bh * .26;
			for (let y = box.top; y <= headCut; y++) for (let x = box.left; x <= box.right; x++) {
				if (px[((y0 + y) * stamp.width + (x0 + x)) * 4 + 3] < 40) continue;
				if (x < headX0) headX0 = x;
				if (x > headX1) headX1 = x;
			}
			const headCx = (headX0 + headX1) / 2;
			const headW = Math.max(8, headX1 - headX0);
			const mask = new Uint8Array(cw * ch);
			for (let y = box.top; y <= box.bottom; y++) for (let x = box.left; x <= box.right; x++) {
				const i = ((y0 + y) * stamp.width + (x0 + x)) * 4;
				const a = px[i + 3];
				if (a < 40) continue;
				const r = px[i], gg = px[i + 1], b = px[i + 2];
				const lum = r * .3 + gg * .59 + b * .11;
				if (lum < 22) continue;
				const sat = Math.max(r, gg, b) - Math.min(r, gg, b);
				const by = (y - box.top) / bh;
				const bx = (x - box.left) / bw;
				const rg = r - gg;
				const inHead = by < .3 && Math.abs(x - headCx) < headW * .36;
				const skin = r > 148 && rg > 56 && gg > 72 && b > 42 && lum > 96 && by < .74;
				const face = inHead && (skin || lum > 75 && rg > 18 && by < .26);
				const boot = by > .86 && r > gg + 8 && r > b + 10 && lum < 160;
				const shirt = !face && !skin && !boot && by > .14 && by < .57 && r > 138 && gg > 98 && b > 55 && rg >= 12 && rg <= 62 && gg > b + 4 && lum > 100 && r < 242 && sat > 18;
				const vest = !face && !skin && !shirt && !boot && by > .3 && by < .58 && bx > .12 && bx < .88 && r > 40 && r < 175 && gg > 18 && gg < 125 && b < 90 && rg > 8 && r - b > 14 && lum > 28 && lum < 94 && sat > 12;
				const pants = !boot && !skin && by > .5 && by < .9 && b + 10 >= r && gg + 16 >= r && sat < 115 && lum > 18 && lum < 180 && !(rg > 18 && r > b + 14);
				const hair = !skin && !face && by < .1 && lum < 92 && sat < 100;
				const hand = skin && !face && by > .34 && by < .7;
				let tag = 0;
				if (shirt) tag = 1;
				else if (vest) tag = 2;
				else if (pants) tag = 3;
				else if (hair) tag = 4;
				else if (hand) tag = 5;
				mask[y * cw + x] = tag;
			}
			for (let pass = 0; pass < 5; pass++) {
				const grow = mask.slice();
				for (let y = box.top + 1; y < box.bottom; y++) for (let x = box.left + 1; x < box.right; x++) {
					const mi = y * cw + x;
					if (mask[mi]) continue;
					const i = ((y0 + y) * stamp.width + (x0 + x)) * 4;
					if (px[i + 3] < 40) continue;
					const r = px[i], gg = px[i + 1], b = px[i + 2];
					const lum = r * .3 + gg * .59 + b * .11;
					if (lum < 22) continue;
					const by = (y - box.top) / bh;
					const bx = (x - box.left) / bw;
					const rg = r - gg;
					const skin = r > 148 && rg > 56 && gg > 72 && b > 42 && lum > 96 && by < .74;
					if (skin) continue;
					// later passes also take the coat's shaded folds, so dyed coats come out even, not blotchy
					const shirtLike = pass < 3 ? r > 140 && gg > 100 && b > 55 && rg >= 8 && rg <= 70 && gg > b - 5 && lum > 95 : r > 96 && gg > 62 && rg >= 8 && rg <= 72 && gg > b - 2 && lum > 70 && lum < 200;
					const vestLike = !shirtLike && r > 45 && r < 165 && gg > 20 && gg < 115 && b < 85 && rg > 10 && r - b > 16 && lum > 30 && lum < 94;
					const blue = b + 8 >= r && gg + 12 >= r && !(rg > 16 && r > b + 12);
					const up = mask[mi - cw], dn = mask[mi + cw], lf = mask[mi - 1], rt = mask[mi + 1];
					if ((lf === 1 || rt === 1 || up === 1 || dn === 1) && shirtLike && by > .14 && by < (pass < 3 ? .5 : .57)) grow[mi] = 1;
					else if ((lf === 2 || rt === 2 || up === 2 || dn === 2) && vestLike && by > .3 && by < .58 && bx > .12 && bx < .88) grow[mi] = 2;
					else if ((lf === 3 || rt === 3 || up === 3 || dn === 3) && blue && by > .5 && by < .9 && lum < 180) grow[mi] = 3;
				}
				mask.set(grow);
			}
			if (colors.plate) {
				// plate / rig: the vest mask is sparse on the painted coat, which left dark holes and pale
				// specks in the iron. Close the holes, then the dye below works from smoothed brightness.
				for (let pass = 0; pass < 3; pass++) {
					const grow = mask.slice();
					for (let y = box.top + 1; y < box.bottom; y++) for (let x = box.left + 1; x < box.right; x++) {
						const mi = y * cw + x;
						if (mask[mi] === 2 || mask[mi] === 5) continue;
						const i = ((y0 + y) * stamp.width + (x0 + x)) * 4;
						if (px[i + 3] < 40) continue;
						const by = (y - box.top) / bh;
						if (by < .28 || by > .6) continue;
						let n2 = 0;
						for (const d of [-1, 1, -cw, cw, -cw - 1, -cw + 1, cw - 1, cw + 1]) if (mask[mi + d] === 2) n2++;
						if (n2 >= 5 || n2 >= 3 && mask[mi] === 0) grow[mi] = 2;
					}
					mask.set(grow);
				}
			}
			const lumSum = [0, 0, 0, 0, 0, 0], lumN = [0, 0, 0, 0, 0, 0];
			for (let y = box.top; y <= box.bottom; y++) for (let x = box.left; x <= box.right; x++) {
				const tag = mask[y * cw + x];
				if (!tag) continue;
				const i = ((y0 + y) * stamp.width + (x0 + x)) * 4;
				lumSum[tag] += px[i] * .3 + px[i + 1] * .59 + px[i + 2] * .11;
				lumN[tag]++;
			}
			const ref = lumSum.map((v, k) => lumN[k] ? v / lumN[k] : 0);
			const orig = colors.plate ? px.slice() : px;
			for (let y = box.top; y <= box.bottom; y++) for (let x = box.left; x <= box.right; x++) {
				const tag = mask[y * cw + x];
				if (!tag) continue;
				const i = ((y0 + y) * stamp.width + (x0 + x)) * 4;
				const r = px[i], gg = px[i + 1], b = px[i + 2];
				let next = null;
				if (tag === 1 && colors.shirt) next = dye(r, gg, b, colors.shirt, .9, ref[1]);
				else if (tag === 2 && colors.plate) {
					// brightness from a 3x3 neighbourhood of the plate, so the iron reads as an even sheet
					let ls = 0, ln = 0;
					for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
						if (mask[(y + dy) * cw + x + dx] !== 2) continue;
						const j = ((y0 + y + dy) * stamp.width + (x0 + x + dx)) * 4;
						ls += orig[j] * .3 + orig[j + 1] * .59 + orig[j + 2] * .11;
						ln++;
					}
					const own = r * .3 + gg * .59 + b * .11;
					const l = ln ? (ls / ln) * .65 + own * .35 : own;
					next = dye(l, l, l, colors.plate, .94, ref[2], .6, .22);
				}
				else if (tag === 2 && colors.vest) next = dye(r, gg, b, colors.vest, .86, ref[2]);
				else if (tag === 3 && colors.legs) next = dye(r, gg, b, colors.legs, .88, ref[3]);
				else if (tag === 4 && colors.head) next = dye(r, gg, b, colors.head, .78, ref[4], colors.helm ? .6 : .18);
				else if (tag === 5 && colors.hands) next = dye(r, gg, b, colors.hands, .8, ref[5]);
				if (!next) continue;
				px[i] = next[0];
				px[i + 1] = next[1];
				px[i + 2] = next[2];
			}
		}
		if (img.sharp) {
			const fade = document.createElement("canvas");
			fade.width = stamp.width;
			fade.height = stamp.height;
			const fg = fade.getContext("2d", { willReadFrequently: true });
			if (fg) {
				fg.drawImage(img, 0, 0);
				const fa = fg.getImageData(0, 0, fade.width, fade.height).data;
				for (let i = 3; i < px.length; i += 4) px[i] = fa[i];
			}
		}
		g.putImageData(data, 0, 0);
		tinted.set(key, stamp);
		return stamp;
	}
	function parkBike(announce) {
		if (!mounted) return;
		if (world && player) {
			const prop = world.props.find((p) => p.id === mountId);
			if (prop) {
				const t = tileOf(player.x, player.y);
				prop.tx = Math.max(1, Math.min(154, t.tx));
				prop.ty = Math.max(1, Math.min(154, t.ty));
			}
		}
		mounted = false;
		mountId = -1;
		if (announce) pushLog("You step off the motor bicycle.");
		sync(true);
	}
	function bikeBuilt() {
		return (q11.q.bike?.s ?? 0) >= 8;
	}
	/** Why this bike can't be ridden right now, or "". Adults only: the kids never ride. */
	function rideBlock(prop) {
		if (inside) return "You can't ride indoors.";
		if (prop.farmBike && !bikeBuilt()) return "Your dad's old motor bicycle is missing half its parts. Sarah has a list.";
		if (escortBodies) return "Not with the kids along. You walk them.";
		if (!carrying("gas")) return "Dry tank. You need a can of gas.";
		return "";
	}
	let gasDist = 0;
	function burnGas(d) {
		if (!mounted || d <= 0) return;
		gasDist += d;
		if (gasDist < 40 * TILE * (1 + .06 * lv("mechanics")) * (v3.up.bench >= 2 ? 1.33 : 1)) return;
		train("mechanics", 4);
		gasDist = 0;
		takeItem("gas", 1);
		if (!carrying("gas")) { pushLog("The engine coughs and dies. Out of gas."); parkBike(false); }
		else sync(true);
	}
	function nearBike() {
		if (!world || !player || mounted || inside) return null;
		let best = null, bd = 130;
		for (const p of world.props) {
			if (p.kind !== "bike") continue;
			const c = propCenter(p), d = Math.hypot(c.x - player.x, c.y - player.y);
			if (d < bd) { bd = d; best = p; }
		}
		return best;
	}
	function mountBike(prop) {
		l1.crouch = false;
		if (!player || prop.kind !== "bike") return;
		const why = rideBlock(prop);
		if (why) { pushLog(why); intent = null; sfx("click"); sync(true); return; }
		mounted = true;
		achieve("ride");
		mountId = prop.id;
		intent = null;
		holdWalk = false;
		pushLog("You kick the motor bicycle over. It coughs, then runs.");
		sfx("click");
	}
	function startMount(prop) {
		if (!player || !world || prop.kind !== "bike") return;
		if (mounted) parkBike(true);
		const spot = propCenter(prop);
		if (Math.hypot(spot.x - player.x, spot.y - player.y) > 72) {
			intent = {
				kind: "mount",
				id: prop.id,
				path: pathTo(world, player.x, player.y, spot.x, spot.y) ?? []
			};
			return;
		}
		mountBike(prop);
	}
	function paintRide(x, y, dir, dcx, dcy) {
		if (images.get("v2/bike-ride")) { blit("v2/bike-ride", x, y, 76, true, Math.floor(performance.now() / 80) % 6, dir % 8, dcx, dcy); return; }
		const img = images.get("bike");
		if (!img || !ctx) return;
		const raw = worldToScreen(x, y, dcx, dcy);
		const p = zoomPoint(raw.sx, raw.sy);
		const dh = 72 * zoom;
		const dw = dh * (img.width / img.height);
		const flip = dir >= 1 && dir <= 3;
		ctx.save();
		if (flip) {
			ctx.translate(p.sx, p.sy);
			ctx.scale(-1, 1);
			ctx.drawImage(img, -dw / 2, -dh * .82, dw, dh);
		} else ctx.drawImage(img, p.sx - dw / 2, p.sy - dh * .82, dw, dh);
		ctx.restore();
	}
	function isGun(family) {
		return family === "carbine" || family === "revolver" || family === "scatter";
	}
	function pickAction() {
		if (!player) return false;
		const id = [
			"lockpick-good",
			"lockpick-std",
			"lockpick"
		].find((key) => player.bag.some((s) => s.id === key && s.qty > 0));
		if (!id) {
			pushLog("The lock needs a lockpick.");
			return false;
		}
		const stack = player.bag.find((s) => s.id === id);
		stack.qty -= 1;
		if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
		const quality = GEAR[id].quality;
		const chance = Math.min(.95, (quality === "good" ? .82 : quality === "standard" ? .62 : .4) + player.intellect * .06 + (player.trait === "step" ? .2 : 0) + skillOf("lock") * .003 + (hasPerk("pins") ? .08 : 0));
		if (Math.random() > chance) {
			pushLog("The pick slips. It is spent.");
			sfx("click");
			saveGame();
			return false;
		}
		return true;
	}
	/** Items sharing a placeholder icon (public/game/items/<name>.png); anything not listed uses its own id. */
	const ITEM_ICON = {
		docbag: "kit",
		medkit: "kit",
		berries: "apple", mushrooms: "apple", chowder: "smokedfish", venisonsteak: "meat", pie: "apple", coffee: "cider", tonic: "dandelion", trout: "smokedfish",
		snare: "wire", grokclaw: "antlers",
		// v14.1 stand-in icons until item art lands at public/game/items/<id>.png
		levergun: "winchester", dalekey: "lockpick", roycap: "toque", spirits: "cider", "bag-sack": "backpack", "bag-hide": "sling", "bag-frame": "packframe",
		gas: "fuel", carburetor: "oil", chain: "wire", engine: "packframe", gastank: "fuel", sparkplug: "matches", tire: "pelt",
		medicine: "kit", bone: "antlers", steeltrap: "wire", greens: "dandelion", water: "cider",
		"carbine-std": "carbine", "carbine-good": "carbine", scoped: "scoped",
		"knife-std": "knife", "knife-good": "knife", skin: "knife",
		"hatchet-std": "hatchet", "hatchet-good": "hatchet",
		"pick-std": "pick", "pick-good": "pick",
		"bandage-std": "bandage", "bandage-good": "bandage",
		"lockpick-std": "lockpick", "lockpick-good": "lockpick",
		"coat-std": "wool", "coat-good": "wool", patch: "wool", linen: "linen",
		"boots-std": "boots"
	};
	/** Doors painted on the building art (source-image px): q = the doorway outline TL, TR, BR, BL;
	 * g = the ground spot in front of it where the hero stands to go in. Keyed by image (the
	 * shelter uses the shack art). The workshop art (anvil on a stump) has no door. */
	const PAINTED_DOORS = {
		shack: { q: [[49, 93], [71, 99], [71, 156], [49, 150]], g: [60, 166] },
		barn: { q: [[51, 111], [64, 114], [64, 148], [51, 152]], g: [57, 162] },
		farmhouse: { q: [[58, 146], [67, 147], [67, 172], [58, 171]], g: [40, 196] },
		ruin: { q: [[31, 73], [39, 72], [39, 96], [31, 98]], g: [35, 108] }
	};

	function standingDoor(kind) {
		return kind === "shack" || kind === "shelter" || kind === "workshop" || kind === "farmhouse" || kind === "barn" || kind === "ruin";
	}
	function canWalkIn(prop) {
		return standingDoor(prop.kind) || prop.kind === "hatch";
	}
	/** Where the painted art puts a pixel (source-image px) of a building, as a world offset from the
	 * building centre, using the same placement as blit(): foot at the centre, drawn PROP_SPEC.drawH tall. */
	function houseArtToWorld(kind, px, py) {
		const spec = PROP_SPEC[kind];
		const house = spec && images.get(spec.image);
		if (!house) return null;
		const dh = spec.drawH;
		const dw = dh * (house.width / house.height);
		const k = house.artScale || 1; // v15.4: door coords are in the original (pre-1.5x) art px
		const ox = (px * k / house.width - .5) * dw;
		const oy = -dh * (house.foot ?? .92) + py * k / house.height * dh;
		return { x: oy + ox / 2, y: oy - ox / 2 };
	}
	function doorPoint(prop) {
		const spec = PROP_SPEC[prop.kind];
		const c = propCenter(prop);
		const painted = PAINTED_DOORS[spec?.image];
		const off = painted && houseArtToWorld(prop.kind, painted.g[0], painted.g[1]);
		if (off && world) {
			// stand on the ground in front of the door painted on the building, not at the middle of the footprint
			const x = c.x + off.x, y = c.y + off.y;
			// the art is bigger than the collision box: if the spot touches it, take the nearest clear spot
			if (!pointBlocked(world, x, y, 12)) return { x, y };
			for (let r = 6; r <= 72; r += 6) for (const [ax, ay] of [[0, 1], [-1, 0], [-.7, .7], [1, 0], [.7, .7], [-.7, -.7], [0, -1], [.7, -.7]]) {
				if (!pointBlocked(world, x + ax * r, y + ay * r, 12)) return { x: x + ax * r, y: y + ay * r };
			}
			return { x, y };
		}
		return {
			x: c.x,
			y: c.y + spec.h * 64 * .5 + 4
		};
	}
	function startEnter(prop) {
		if (!player || !world || !canWalkIn(prop)) return;
		const door = doorPoint(prop);
		if (Math.hypot(door.x - player.x, door.y - player.y) > 78) {
			intent = {
				kind: "enter",
				id: prop.id,
				path: pathTo(world, player.x, player.y, door.x, door.y) ?? []
			};
			pushLog(prop.kind === "hatch" ? "The hatch is that way." : "You head for the door.");
			return;
		}
		beginOpen(prop);
	}
	function beginOpen(prop) {
		if (!player) return;
		parkBike(true);
		const own = prop.built || prop.kind === "shelter" || prop.kind === "workshop" || prop.kind === "farmhouse" || prop.kind === "barn" || prop.kind === "hatch";
		if (prop.locked && !own && !openedDoors.has(prop.id)) {
			if (!pickAction()) return;
			openedDoors.add(prop.id);
			pushLog("The lock gives. The door opens.");
		} else pushLog(prop.kind === "hatch" ? "You lift the hatch." : "The door opens.");
		intent = null;
		holdWalk = false;
		opening = {
			id: prop.id,
			t: OPEN_TIME
		};
		sfx("click");
	}
	function finishEnter(prop) {
		if (!player) return;
		if (mounted) { parkBike(false); pushLog("You leave the bike by the door. No riding indoors."); }
		const door = doorPoint(prop);
		inside = {
			id: prop.id,
			rx: prop.kind === "farmhouse" ? 200 : 160,
			ry: prop.kind === "farmhouse" ? 170 : 118,
			backX: door.x,
			backY: door.y
		};
		intent = null;
		holdWalk = false;
		packOpen = false;
		statsOpen = false;
		if (prop.kind === "hatch") bunkerSeen = true;
		if (prop.kind === "farmhouse") restockKitchen();
		pushLog(prop.kind === "farmhouse" ? "You step into the farmhouse. The wood stove is going." : prop.kind === "barn" ? "The barn smells of hay and split wood." : prop.kind === "hatch" ? "Under the birch log, a hatch. The room below is dry." : prop.built || prop.kind === "shelter" || prop.kind === "workshop" ? "You step into your own place." : "You step inside.");
		saveGame();
	}
	/** The doorstep, or if something now stands on it (a fence, a cot, a built prop), the nearest
	 * open ground from which the hero can actually walk away. */
	function clearOutside(x, y) {
		if (!world) return { x, y };
		const t = tileOf(x, y);
		const free = (tx, ty) => tx >= 0 && ty >= 0 && tx < 156 && ty < 156 && !cellBlocked(world, tx, ty);
		// open enough to walk away from: at least 60 connected open cells, not a pocket between props
		const roomy = (tx, ty) => {
			if (!free(tx, ty)) return false;
			const seen = new Set([ty * 156 + tx]);
			const q = [[tx, ty]];
			while (q.length && seen.size < 60) {
				const [cx, cy] = q.shift();
				for (const [ax, ay] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
					const k = ay * 156 + ax;
					if (seen.has(k) || !free(ax, ay)) continue;
					seen.add(k);
					q.push([ax, ay]);
				}
			}
			return seen.size >= 60;
		};
		// The door point sits 4 px off the wall, inside the hero's 14 px body radius, so standing there
		// every step collides with the house and the hero cannot move at all. Step out onto the yard.
		const standable = (px, py) => !pointBlocked(world, px, py, RADIUS + 2);
		for (const k of [18, 30, 44, 60]) {
			const ty2 = tileOf(x, y + k);
			if (standable(x, y + k) && roomy(ty2.tx, ty2.ty)) return { x, y: y + k };
		}
		for (let r = 1; r <= 6; r++) {
			for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
				if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
				const px = (t.tx + dx + .5) * 64, py = (t.ty + dy + .5) * 64;
				if (standable(px, py) && roomy(t.tx + dx, t.ty + dy)) return { x: px, y: py };
			}
		}
		return { x, y: y + 18 };
	}
	function leaveHouse() {
		if (!player || !inside) return;
		const out = clearOutside(inside.backX, inside.backY);
		player.x = out.x;
		player.y = out.y;
		justLeft = { id: inside.id, x: out.x, y: out.y, t: performance.now() };
		inside = null;
		intent = null;
		opening = null;
		holdWalk = false;
		pushLog("You step back outside.");
		sync(true);
	}
	/** v15.9: Climbing and Electronics in the main game. Rubble and fences: climb for high loot or a shortcut over.
	 * Dead cars and the tractor: hotwire for gas. The lookout radio: fix it for raid and weather news. The bunker hatch's
	 * powered cabinet: open it. One try per thing per day; a failed climb costs a little skin. */
	const USE159 = { ruin: "climbing", rock: "climbing", fence: "climbing", "wall-x": "climbing", "car-sedan": "electronics", "car-truck": "electronics", tractor: "electronics", lookout: "electronics", hatch: "electronics" };
	function check159(skill, dc) { return Math.random() * 100 < checkChance(skillOf(skill), dc, 0, player.karma ?? 0); }
	function use159(prop) {
		const skill = USE159[prop.kind]; if (!skill || !player) return false;
		l1.u159 = l1.u159 ?? {}; const key = `${mapId}:${prop.id}`, day = curDay();
		if (l1.u159[key] === day) { pushLog(skill === "climbing" ? "You already went over that today." : "Nothing left to coax out of that today."); sync(true); return true; }
		l1.u159[key] = day;
		const name = skill === "climbing" ? "Climbing" : "Electronics";
		if (skill === "climbing") {
			const dc = prop.kind === "ruin" ? 35 : prop.kind === "rock" ? 30 : 20;
			if (!check159("climbing", dc)) { player.hp = Math.max(1, player.hp - 3); pushLog(`${name}: your boot slips on the ice and you come down hard. (-3)`); sync(true); return true; }
			if (prop.kind === "fence" || prop.kind === "wall-x") {
				const c = propCenter(prop); const dx = c.x - player.x, dy = c.y - player.y, m = Math.hypot(dx, dy) || 1;
				const tx = c.x + dx / m * 70, ty = c.y + dy / m * 70;
				if (!pointBlocked(world, tx, ty, RADIUS)) { player.x = tx; player.y = ty; snapPrev(); }
				pushLog(`${name}: up and over the ${prop.kind === "fence" ? "fence" : "wall"}. Saves the long way round.`);
			} else {
				const n = 2 + Math.floor(Math.random() * 3); player.scrap += n;
				const wire = Math.random() < .4; if (wire) giveItem("wire", 1); // v15.9.2 (A3): one roll for the loot and the message
				pushLog(`${name}: you work up the ${prop.kind === "ruin" ? "rubble to a second-floor shelf nobody could reach" : "ledge to a dry crack"}. ${n} iron${wire ? " and a twist of wire" : ""}.`);
			}
		} else if (prop.kind === "lookout") {
			if (!check159("electronics", 30)) { pushLog(`${name}: the lookout radio hums and dies. Bad solder.`); sync(true); return true; }
			pushLog(`${name}: you get the lookout radio talking. ${w13.weather?.id === "clear" ? "Clear skies on the county band." : "Weather coming in on the county band."}`);
		} else if (prop.kind === "hatch") {
			if (!check159("electronics", 40)) { pushLog(`${name}: the keypad on the bunker's power cabinet stays dark.`); sync(true); return true; }
			giveItem("shells", 4); player.scrap += 3;
			pushLog(`${name}: you bridge the dead keypad off a lantern battery. The power cabinet clicks open: 4 shells and some iron.`);
		} else {
			if (!check159("electronics", 35)) { pushLog(`${name}: you pull the wires under the dash. Nothing but a spark.`); sync(true); return true; }
			giveItem("gas", 1); player.scrap += 1;
			pushLog(`${name}: you hotwire it. The engine coughs once, long enough to pump a quart of gas out of the lines.`);
		}
		sync(true); return true;
	}
	function farmAction(prop) {
		if (!player) return;
		if (ART14.has(prop.kind)) return v14Use(prop);
		if (prop.kind === "press") {
			pushLog("The press still smells of apples.");
			return;
		}
		if (prop.kind === "orchard") {
			pushLog("Sarah's apples. The trees stay.");
			return;
		}
		if (prop.kind === "maple") {
			pushLog("Sugar maples. A little first snow in the leaves.");
			return;
		}
		if (prop.kind === "crates") {
			if ((prop.amount ?? 0) <= 0) {
				pushLog(inFarm(prop.tx, prop.ty) ? "Nothing left in the crate but cores." : "The crate is nailed shut.");
				return;
			}
			if (!tryGive("apple")) {
				pushLog("Your pack is full.");
				return;
			}
			prop.amount = (prop.amount ?? 1) - 1;
			pushLog("A cold apple from the crate.");
			sfx("gather");
			saveGame();
		}
	}
	/** After First Snow, Sarah's kitchen (cider cups 91001, donut plate 91002) refills once a day. */
	function restockKitchen() {
		if (snow < 3) return;
		const day = Math.floor(clock / DAY_LENGTH_SEC);
		if (day <= kitchenDay) return;
		kitchenDay = day;
		lootedChests.delete(91001);
		lootedChests.delete(91002);
	}
	function warmStove() {
		if (!player) return;
		if (player.hp >= player.maxHp) {
			pushLog("The wood stove is warm. You are already thawed.");
			return;
		}
		player.hp = Math.min(player.maxHp, player.hp + 12);
		player.stamina = Math.min(player.maxStamina, player.stamina + 16);
		pushLog("You stand by the wood stove. The cold leaves your coat.");
		sfx("click");
		sync(true);
	}
	function drinkBarrel() {
		if (!player) return;
		if (player.hp >= player.maxHp && player.stamina >= player.maxStamina) {
			pushLog("The barrel is full. You are not thirsty.");
			return;
		}
		player.hp = Math.min(player.maxHp, player.hp + 10);
		player.stamina = Math.min(player.maxStamina, player.stamina + 24);
		pushLog("You drink from the barrel. It tastes like tin.");
		sfx("click");
		sync(true);
	}
	function takeFromKitchen(id, item, qty, empty, got) {
		if (!player) return;
		if (lootedChests.has(id)) {
			pushLog(empty);
			return;
		}
		let ok = false;
		for (let i = 0; i < qty; i++) ok = tryGive(item) || ok;
		if (!ok) {
			pushLog("Your pack is full.");
			return;
		}
		lootedChests.add(id);
		pushLog(got);
		sfx("gather");
		saveGame();
		sync(true);
	}
	function openChest() {
		if (!player || !inside) return;
		if (lootedChests.has(inside.id)) {
			pushLog("The chest is empty.");
			return;
		}
		if (!pickAction()) return;
		lootedChests.add(inside.id);
		player.scrap = Math.min(999, player.scrap + 5);
		const found = rollDrop(false, player.luck);
		if (found) giveItem(found);
		floater(player.x, player.y - 12, "+5 iron");
		pushLog(found && GEAR[found] ? `The chest opens. ${GEAR[found].name}.` : "The chest opens. Iron, and little else.");
		sfx("gather");
		saveGame();
	}
	function chopTree(prop) {
		startLabor(prop, "chop");
	}
	function breakRock(prop) {
		startLabor(prop, "mine");
	}
	/** Rooms are a 320x240 stage. On short phone screens it shrinks and sits high, so the door stays
	 * clear of the bottom HUD (on a landscape phone the old centred room put the door under it). */
	/** Room stage size in room units. The v19 farmhouse kitchen is a bigger room (800x560 art drawn
	 * at half size); the others are the 320x240 stage. */
	function roomDims() {
		const prop = inside && world?.props.find((p) => p.id === inside.id);
		return prop?.kind === "farmhouse" ? { w: 400, h: 280, farm: true } : { w: 320, h: 240, farm: false };
	}
	function roomScale() {
		const d = roomDims();
		// phones: fit between the top panels and the bottom HUD; big screens: the farmhouse may grow
		const s = viewH < 560 ? Math.max(.5, Math.min(1, (viewH - 170) / d.h)) : Math.min(d.farm ? 1.5 : 1, (viewH - 200) / d.h);
		return Math.max(.4, Math.min(s, (viewW - 16) / d.w));
	}
	/** Room origin in room space (screen = room point * roomScale()). */
	function roomOrigin() {
		const s = roomScale();
		const d = roomDims();
		const top = viewH < 560 ? Math.max(56, (viewH - 110 - d.h * s) / 2 + 20) : Math.max(60, viewH / 2 - d.h * s / 2);
		return {
			x: (viewW / 2 - d.w / 2 * s) / s,
			y: top / s
		};
	}
	/** Door hot-spot / walk-out zone, bottom centre of the stage. */
	function roomDoor() {
		const d = roomDims();
		return { cx: d.w / 2, bottom: d.h, x0: d.w / 2 - 52, x1: d.w / 2 + 52, y0: d.h - 64, y1: d.h + 12 };
	}
	function applyRoomTransform(dpr) {
		const s = roomScale();
		ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
	}
	function stepInside(dt) {
		if (!player || !inside || phase !== "play") return;
		player.cooldown = Math.max(0, player.cooldown - dt);
		let moving = false;
		if (intent?.kind === "walk") {
			const dx = intent.x - inside.rx;
			const dy = intent.y - inside.ry;
			const dist = Math.hypot(dx, dy);
			if (dist < 8) intent = null;
			else {
				const pace = player.stamina > 0 ? 110 : 48;
				const stepLen = Math.min(dist, pace * dt);
				const dims = roomDims();
				inside.rx = Math.min(dims.w - 28, Math.max(28, inside.rx + dx / dist * stepLen));
				inside.ry = Math.min(dims.h - 30, Math.max(28, inside.ry + dy / dist * stepLen));
				moving = true;
				player.dir = facing8Screen(dx, dy);
				player.anim += stepLen;
			}
		}
		if (moving) player.stamina = Math.max(0, player.stamina - 12 * dt);
		else player.stamina = Math.min(player.maxStamina, player.stamina + staminaBack() * dt);
		player.frame = walkFrame(moving);
		// walking onto the door mat takes you out, the same as tapping the door
		if (moving && inside.ry >= roomDims().h - 36 && Math.abs(inside.rx - roomDims().w / 2) < 40) {
			leaveHouse();
			return;
		}
		stamHud += dt;
		if (stamHud > .35) {
			stamHud = 0;
			useHud.setState({
				stamina: player.stamina,
				maxStamina: player.maxStamina
			});
		}
	}
	const removedIds = /* @__PURE__ */ new Set();
	function noteRemoved(id) {
		removedIds.add(id);
	}
	function collectRemoved(w) {
		const alive = new Set(w.props.map((p) => p.id));
		const all = new Set(removedIds);
		for (const id of removedIds) if (alive.has(id)) all.delete(id);
		return [...all];
	}
	function swingOf() {
		const family = player ? GEAR[player.weaponId]?.family : void 0;
		const perception = Math.max(0, perc() - 1);
		const reach = isGun(family) ? perception * 28 : 0;
		// Bob's lever gun: one round through the gate at a time, the slowest reload of any long gun
		if (family === "carbine" && player?.weaponId === "levergun") return {
			range: 200 + reach,
			wait: 1.15
		};
		if (family === "carbine" && player?.weaponId === "scoped") return {
			range: 290 + reach,
			wait: .62
		};
		if (family === "carbine") return {
			range: 210 + reach,
			wait: .55
		};
		if (family === "revolver") return {
			range: 128 + reach,
			wait: .38
		};
		if (family === "scatter") return {
			range: 92 + Math.round(reach * .65),
			wait: .72
		};
		if (family === "axe") return {
			range: 58,
			wait: .36
		};
		if (family === "pry") return {
			range: 52,
			wait: .4
		};
		if (family === "pickaxe") return {
			range: 50,
			wait: .42
		};
		return {
			range: 46,
			wait: .26
		};
	}
	function staminaBack() {
		if (!player) return 8;
		const base = 8 + player.endurance * 3;
		return player.trait === "hide" ? base * .55 : base;
	}
	function strikeDamage() {
		if (!player) return 1;
		const family = GEAR[player.weaponId]?.family;
		let dmg = player.atk + (player.blade ? 3 : 0) + (Math.random() * 3 | 0);
		if (player.trait === "eye") dmg += isGun(family) ? 3 : -2;
		if (player.trait === "camp") {
			if (family === "axe" || family === "pickaxe" || family === "pry") dmg += 3;
			if (isGun(family)) dmg -= 2;
		}
		if (Math.random() < player.luck * .05) dmg += 4;
		const familyHit = GEAR[player.weaponId]?.family;
		const armed = isGun(familyHit) ? skillOf("rifle") : skillOf("melee");
		dmg += Math.floor(armed / 30);
		if (!isGun(familyHit) && hasPerk("logger")) dmg += 2;
		if (isGun(familyHit) && hasPerk("steady")) dmg += 1;
		if (isGun(familyHit)) { dmg = Math.round(dmg * (1 + .04 * lv("marksmanship"))); train("marksmanship", 2); }
		// v13 crits: agility and wits, marksmanship perks; companions with high loyalty add a share
		{ const crit = fx13().critPct + (isGun(familyHit) && perk13("marksmanship", 6) ? 5 : 0); if (Math.random() * 100 < crit) { dmg = Math.round(dmg * (isGun(familyHit) && perk13("marksmanship", 9) ? 2 : 1.6)); floater(player.x, player.y - 60, "Crit!"); } }
		if (party && helpsMore(party.role)) dmg = Math.round(dmg * (1.1 + .04 * lv("leadership") + (perk13("leadership", 6) ? .15 : 0)));
		return Math.max(1, dmg);
	}
	function shellCount(p) {
		return p.bag.reduce((n, stack) => n + (stack.id === "shells" ? stack.qty : 0), 0);
	}
	function spendShell() {
		if (!player) return false;
		const stack = player.bag.find((s) => s.id === "shells" && s.qty > 0);
		if (!stack) return false;
		stack.qty -= 1;
		if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
		return true;
	}
	function bodyTitle(kind) {
		if (kind === "bandit") return "Chopper";
		return kind.charAt(0).toUpperCase() + kind.slice(1);
	}
	function addStack(items, id, qty) {
		if (!GEAR[id] || qty <= 0) return;
		const stack = items.find((s) => s.id === id);
		if (stack) stack.qty += qty;
		else items.push({
			id,
			qty
		});
	}
	function hasLoot(pile) {
		return pile.scrap > 0 || pile.items.some((s) => s.qty > 0);
	}
	function lootView() {
		const pile = piles.find((p) => p.id === lootId);
		if (!pile || !hasLoot(pile)) return null;
		const lines = [];
		if (pile.scrap > 0) lines.push({
			key: "scrap",
			label: `${pile.scrap} iron`
		});
		for (const stack of pile.items) {
			if (stack.qty <= 0 || !GEAR[stack.id]) continue;
			const name = GEAR[stack.id].name;
			lines.push({
				key: stack.id,
				label: stack.qty > 1 ? `${name} ×${stack.qty}` : name
			});
		}
		return {
			title: pile.title,
			lines
		};
	}
	function leavePile(x, y, title, items, scrap, body, dir, folk = "") {
		if (!items.length && scrap <= 0 && !body && !folk) return;
		piles.push({
			id: nextPile++,
			x,
			y,
			title,
			items,
			scrap,
			body,
			folk,
			dir,
			at: clock
		});
	}
	function restorePiles(saved) {
		piles = [];
		nextPile = 1;
		lootId = -1;
		if (!saved) return;
		const kinds = /* @__PURE__ */ new Set([
			"bandit",
			"wolf",
			"coyote",
			"deer",
			"moose",
			"rabbit",
			"squirrel",
			"raccoon",
			"turtle"
		]);
		for (const pile of saved) {
			const body = kinds.has(pile.body) ? pile.body : "";
			piles.push({
				id: pile.id,
				x: pile.x,
				y: pile.y,
				title: pile.title,
				items: pile.items.filter((stack) => stack.qty > 0 && GEAR[stack.id]).map((stack) => ({
					id: stack.id,
					qty: stack.qty
				})),
				scrap: Math.max(0, pile.scrap | 0),
				body,
				folk: pile.folk || "",
				dir: pile.dir | 0,
				at: pile.at
			});
			if (pile.id >= nextPile) nextPile = pile.id + 1;
		}
		piles = piles.filter((pile) => hasLoot(pile));
	}
	function rotPiles() {
		const kept = [];
		for (const pile of piles) {
			// v13.1: a full-pack reward ("Dropped" / "Farm stash") waits for you; it doesn't rot away
			const kept13 = pile.title === "Dropped" || pile.title === "Farm stash" || pile.title === "Your pack";
			if (!hasLoot(pile) || (!kept13 && clock - pile.at >= 720)) {
				if (lootId === pile.id) lootId = -1;
				if (player && hasLoot(pile) && Math.hypot(pile.x - player.x, pile.y - player.y) < 420) pushLog(pile.folk || pile.body ? "The body is gone. A day has passed." : "What was left is gone.");
				continue;
			}
			kept.push(pile);
		}
		piles = kept;
	}
	function corpseOf(enemy) {
		const items = [];
		let scrap = 0;
		if (!player) return;
		if (enemy.variant === "grok") {
			// v14.1 balance: The Grok drops 2-3 claws and hide, so the tier 3 bench is reachable
			addStack(items, "grokclaw", 2 + (Math.random() < .5 ? 1 : 0));
			addStack(items, "hide", 3);
			addStack(items, "meat", 3);
			scrap = 5;
		} else if (enemy.variant === "holeb") {
			addStack(items, "antlers", 1);
			addStack(items, "hide", 2);
			addStack(items, "meat", 4);
			scrap = 4;
		} else if (enemy.variant === "pelletier") {
			addStack(items, "winchester", 1);
			addStack(items, "lantern", 1);
			addStack(items, "dandelion", 2);
			scrap = 9;
		} else if (enemy.variant === "warden") {
			addStack(items, "warden", 1);
			addStack(items, "shotgun", 1);
			addStack(items, "shells", 6);
			scrap = 8;
		} else if (enemy.kind === "bandit") {
			scrap = enemy.elite ? 4 : 2;
			const found = rollDrop(enemy.elite, player.luck + (mapId === 2 ? 3 : 0));
			if (found) addStack(items, found, 1);
			if (mapId === 2 && Math.random() < .35) addStack(items, Math.random() < .5 ? "medicine" : "gas", 1);
			if (Math.random() < .4) addStack(items, "cloth", 1);
			// v14.7: meds on raiders: a medkit now and then, a doctor's bag rarely
			const med = Math.random();
			if (med < (enemy.elite ? .03 : .012)) addStack(items, "docbag", 1);
			else if (med < (enemy.elite ? .14 : .07)) addStack(items, "medkit", 1);
		} else {
			addStack(items, "meat", enemy.kind === "moose" ? 3 : enemy.kind === "deer" ? 2 : 1);
			addStack(items, "bone", enemy.kind === "moose" ? 3 : enemy.kind === "deer" ? 2 : 1);
			if (enemy.kind === "wolf" || enemy.kind === "deer" || enemy.kind === "moose") addStack(items, "hide", 1);
			if (enemy.kind === "moose") scrap += 2;
		}
		leavePile(enemy.x, enemy.y, bodyTitle(enemy.kind), items, scrap, enemy.kind, enemy.dir);
		const pile = piles[piles.length - 1];
		if (pile && pile.body === enemy.kind) {
			// the body keeps the look of the one that fell, and waits for its fall animation to finish
			pile.sheet = beastSheet(enemy);
			pile.shownAt = performance.now() + 1150;
		}
		pushLog("Search the body.");
	}
	/** Which way a body falls: away from its facing side, so east-facing bodies fall right. */
	function deadTilt(dir, id) {
		const d = dir ?? 1;
		if (d === 5 || d === 6 || d === 7) return 1;
		if (d === 1 || d === 2 || d === 3) return -1;
		return (id ?? 0) % 2 ? 1 : -1;
	}
	function markDead(enemy, xp) {
		if (!enemy || enemy.dead) return;
		enemy.dead = true;
		enemy.aggro = false;
		enemy.death = 1.15;
		corpseOf(enemy);
		grantXp(xp);
		v3Kill(enemy);
		v13Kill(enemy);
		if (enemy.name) pushLog(`${enemy.name} is down.`);
		if (enemy.id === WARDEN_ENEMY_ID) {
			wardenState = 3;
			pushLog("The gate is yours. His vest and his pump gun are on him.");
		}
		if (enemy.id === HOLEB_ID) pushLog("The old bull of Holeb lies in the snow. They will talk about this in Lowelltown.");
		if (enemy.id === PELLETIER_ID) pushLog("Her lantern rolls into the water and goes out. The mill is quiet.");
		q10Kill(enemy);
		q11Kill(enemy);
		if (enemy.quest && quest === 1) {
			questKills += 1;
			const left = questTotal - questKills;
			if (left <= 0) {
				quest = 2;
				pushLog("That was the last of them. The chopping is quiet. Mira Pelletier will want the news.");
			} else pushLog(left === 1 ? "One of the Chopping's bosses still stands." : `${left} of the Chopping's bosses still stand.`);
		}
		saveGame();
	}
	function hurtProp(prop, dmg) {
		const broken = BROKEN[prop.kind];
		if (!broken || !world) return;
		if (prop.hp == null) prop.hp = DEF_HP[prop.kind] ?? 30;
		prop.hp -= dmg;
		prop.flash = .12;
		if (prop.f14) note14(prop);
		if (prop.hp > 0) return;
		if (prop.kind === broken || prop.kind === "chest" || prop.kind === "rainbarrel" || prop.kind === "spikes") {
			vacate(world, prop); world.props = world.props.filter((q) => q !== prop);
			v14.placed = v14.placed.filter((q) => !(q.tx === prop.tx && q.ty === prop.ty));
			pushLog("A piece of the camp is smashed flat.");
			return;
		}
		if (isWall14(prop.kind)) prop.was14 = prop.kind;
		vacate(world, prop);
		prop.open = false;
		prop.kind = broken;
		occupy(world, prop);
		if (prop.f14) note14(prop);
		prop.hp = 0;
		prop.burn = 0;
		pushLog("A defense gives way.");
	}
	function corpseOfNpc(npc) {
		const items = [];
		const scrap = npc.role === "villager" ? 1 : 2;
		if (npc.role === "villager") addStack(items, Math.random() < .5 ? "cloth" : "apple", 1);
		else {
			addStack(items, "cloth", 1);
			if (Math.random() < .55) addStack(items, "bandage", 1);
			if (Math.random() < .08) addStack(items, "medkit", 1);
		}
		leavePile(npc.x, npc.y, npc.name, items, scrap, "", npc.dir, folkSheet(npc));
		pushLog(`${npc.name} is down. Search the body.`);
	}
	function spawnCrows() {
		lootId = -1;
		crows = [
			[36, 20],
			[28, 26],
			[44, 22],
			[22, 34],
			[48, 36],
			[58, 48],
			[70, 40],
			[84, 56],
			[96, 34],
			[40, 58],
			[18, 30],
			[62, 24]
		].map(([tx, ty]) => mapId === 1 ? [80 + (tx % 17 - 8), 78 + (ty % 13 - 6)] : [tx + 22, ty + 20]).map(([tx, ty], i) => ({
			x: tx * 64 + 32,
			y: ty * 64 + 32,
			homeX: tx * 64 + 32,
			homeY: ty * 64 + 32,
			radius: 100 + i % 5 * 26,
			angle: i * .7,
			speed: .42 + i % 3 * .08,
			dir: 6,
			frame: i % 4,
			anim: 0,
			alt: 84 + i % 4 * 14,
			nextDrop: 2.5 + i % 6 * 1.1
		}));
	}
	function crowDrop(crow) {
		const items = [];
		const roll = Math.random();
		if (roll < .42) addStack(items, "shells", 2 + (Math.random() * 3 | 0));
		else if (roll < .78) {
			const food = [
				"jerky",
				"apple",
				"meat",
				"pork",
				"stew"
			][Math.random() * 5 | 0];
			addStack(items, food, 1);
		} else if (roll < .93) addStack(items, "bandage", 1);
		else if (roll < .975) addStack(items, Math.random() < .12 ? "docbag" : "medkit", 1);
		else addStack(items, "kit", 1);
		leavePile(crow.x, crow.y, "Crow drop", items, 0, "", 0);
		floater(crow.x, crow.y - 20, "Dropped");
		pushLog("A crow drops something.");
	}
	function stepCrows(dt) {
		if (!player) return;
		for (const crow of crows) {
			const prevX = crow.x;
			const prevY = crow.y;
			crow.angle += crow.speed * dt;
			crow.x = crow.homeX + Math.cos(crow.angle) * crow.radius;
			crow.y = crow.homeY + Math.sin(crow.angle) * crow.radius * .7;
			const vx = crow.x - prevX;
			const vy = crow.y - prevY;
			if (Math.hypot(vx, vy) > .2) crow.dir = facing8(vx, vy);
			crow.anim += dt * 9;
			crow.frame = Math.floor(crow.anim) % 4;
			crow.nextDrop -= dt;
			if (crow.nextDrop > 0) continue;
			crow.nextDrop = 12 + Math.random() * 10;
			const near = Math.hypot(crow.x - player.x, crow.y - player.y) < 760;
			const chance = .05 + Math.random() * .05;
			if (near && Math.random() < chance) crowDrop(crow);
		}
	}
	function nearestPile(maxDist) {
		if (!player) return null;
		let best = null;
		let bestD = maxDist;
		for (const pile of piles) {
			if (!hasLoot(pile)) continue;
			const d = Math.hypot(pile.x - player.x, pile.y - player.y);
			if (d < bestD) {
				best = pile;
				bestD = d;
			}
		}
		return best;
	}
	function openLoot(pile) {
		if (lrNote(pile)) return;
		lrTrail(pile);
		if (!hasLoot(pile)) {
			pushLog(pile.body || pile.folk ? "Already searched." : "Nothing there.");
			return;
		}
		lootId = pile.id;
		intent = null;
		packOpen = false;
		statsOpen = false;
		buildOpen = false;
		sfx("click");
		sync(true);
	}
	function takeLoot(key) {
		if (!player || phase !== "play") return;
		if (key === "close") {
			lootId = -1;
			sfx("click");
			sync(true);
			return;
		}
		const pile = piles.find((p) => p.id === lootId);
		if (!pile || !hasLoot(pile)) {
			lootId = -1;
			sync(true);
			return;
		}
		const moveStack = (stack) => {
			if (!stack || stack.qty <= 0 || !GEAR[stack.id]) return 0;
			if (!tryGive(stack.id, stack.qty)) return 0;
			const n = stack.qty;
			stack.qty = 0;
			return n;
		};
		let took = false;
		let packed = false;
		if (key === "scrap" || key === "all") {
			const room = Math.max(0, 999 - player.scrap);
			const n = Math.min(pile.scrap, room);
			if (n > 0) {
				player.scrap += n;
				pile.scrap -= n;
				took = true;
				if (key === "scrap") pushLog(n === 1 ? "Took 1 iron." : `Took ${n} iron.`);
			} else if (key === "scrap" && pile.scrap > 0) pushLog("You can't carry more iron.");
		}
		if (pile.body && pile.body !== "bandit" && !pile.dressed && (key === "all" || key === "meat" || key === "hide" || key === "bone")) {
			pile.dressed = true; v3.stats.dressed += 1; train("hunting", 4); achieve("dress");
		}
		if (key === "all") {
			for (const stack of pile.items) if (moveStack(stack) > 0) {
				took = true;
				packed = true;
			}
			pile.items = pile.items.filter((s) => s.qty > 0);
			if (packed && !hasLoot(pile)) pushLog("You take everything. It is in your pack.");
			else if (packed) pushLog("Pack is full. What you took is in your pack. The rest stays.");
			else if (pile.items.length) pushLog("Your pack is full.");
		} else if (key !== "scrap") {
			const stack = pile.items.find((s) => s.id === key && s.qty > 0);
			const n = moveStack(stack);
			if (n > 0) {
				pile.items = pile.items.filter((s) => s.qty > 0);
				took = true;
				packed = true;
				const name = GEAR[key].name.toLowerCase();
				pushLog(n > 1 ? `Took ${n} ${name}. In your pack.` : `Took the ${name}. In your pack.`);
			} else if (stack) pushLog("Your pack is full.");
		}
		if (!hasLoot(pile)) {
			piles = piles.filter((p) => p.id !== pile.id);
			if (lootId === pile.id) lootId = -1;
		}
		if (packed) {
			packOpen = true;
			statsOpen = false;
			buildOpen = false;
		}
		sfx(took ? "gather" : "click");
		if (took) saveGame();
		sync(true);
	}
	function paySwing() {
		if (!player || player.cooldown > 0) return false;
		if (injured("arms") && TWO_HANDED.has(GEAR[player.weaponId]?.family)) { player.cooldown = .6; intent = null; pushLog("Your crippled arm can't hold that. Switch to a one-handed weapon or your fists."); sync(true); return false; }
		parkBike(true);
		const family = GEAR[player.weaponId]?.family;
		const gun = isGun(family);
		if (gun && !spendShell()) {
			player.cooldown = .45;
			intent = null;
			pushLog("Out of shells.");
			sfx("click");
			sync(true);
			return false;
		}
		if (turnBased && !tbPaid) {
			const cost = gun ? 5 : 3;
			if (ap < cost) {
				player.cooldown = .35;
				intent = null;
				pushLog("Not enough action points.");
				sfx("click");
				sync(true);
				return false;
			}
			ap -= cost;
		}
		drawn = 1.6;
		if (gun) floater(player.x, player.y - 16, `${shellCount(player)} shells`);
		player.cooldown = swingOf().wait;
		reach = .22;
		swingAnim = .48;
		return true;
	}
	function safeNoFight() { if (!player || !safeAt(player.x, player.y)) return false; if (clock - (safe15.said ?? -99) > 3) { safe15.said = clock; pushLog("Not here. This is a safe zone."); } return true; }
	function strikeEnemy(enemy) {
		if (!player || enemy.dead) return;
		if (safeNoFight()) return;
		if (!paySwing()) return;
		// v14.1 melee: punch, kick and weapon swings land on their hit frame, not on the click
		const mv = meleeStart();
		if (mv) { player.dir = facing8(enemy.x - player.x, enemy.y - player.y); pendingHit = { enemy, at: mv.hitMs / 1000 }; return; }
		strikeLand(enemy);
	}
	/** v14.1: melee move tables (ms per frame, 1-based hit frame). */
	/** The move timings: the original totals (punch 420 ms, kick 540, swing 610) resampled onto the new frame counts,
	 * with the hit frame at the same point in the move. */
	function resampleMove(ms, hit, n) {
		const m = ms.length, out = [];
		for (let k = 0; k < n; k++) {
			const a = k * m / n, b = (k + 1) * m / n;
			let t = 0;
			for (let j = Math.floor(a); j < Math.ceil(b) && j < m; j++) t += ms[j] * (Math.min(b, j + 1) - Math.max(a, j));
			out.push(Math.round(t));
		}
		return { ms: out, hit: Math.round((hit - 1) * n / m) + 1 };
	}
	const MELEE = {
		punch: resampleMove([70, 60, 50, 90, 70, 80], 4, ANIM_FRAMES.punch),
		kick: resampleMove([80, 70, 50, 100, 70, 80, 90], 4, ANIM_FRAMES.kick),
		swing: resampleMove([90, 80, 70, 40, 90, 70, 80, 90], 5, ANIM_FRAMES.swing)
	};
	let pendingHit = null;
	let talkNag141 = 0;
	let melee = null; // { move, t0 }
	let meleeCount = 0;
	function meleeStart() {
		if (!player) return null;
		const fam = GEAR[player.weaponId]?.family;
		if (isGun(fam)) return null;
		const move = !player.weaponId || !fam || fam === "fist" ? (++meleeCount % 3 === 0 ? "kick" : "punch") : "swing";
		const t = MELEE[move];
		const total = t.ms.reduce((a, b) => a + b, 0);
		const hitMs = t.ms.slice(0, t.hit - 1).reduce((a, b) => a + b, 0);
		melee = { move, t0: performance.now(), total };
		swingAnim = total / 1000;
		player.cooldown = Math.max(player.cooldown, total / 1000);
		return { move, hitMs, total };
	}
	/** Current melee frame from the move's timing table, or null when no move is playing. */
	function meleeFrame() {
		if (!melee) return null;
		const t = MELEE[melee.move];
		let e = performance.now() - melee.t0;
		if (e >= melee.total) { melee = null; return null; }
		let f = 0;
		while (f < t.ms.length - 1 && e >= t.ms[f]) { e -= t.ms[f]; f++; }
		return { move: melee.move, frame: f, frames: t.ms.length, hit: f === t.hit - 1 };
	}
	function pendingTick(dt) {
		if (!pendingHit) return;
		pendingHit.at -= dt;
		if (pendingHit.at > 0) return;
		const e = pendingHit.enemy; pendingHit = null;
		if (!player || e.dead) return;
		// out of reach by the time the blow lands: it whiffs
		if (Math.hypot(e.x - player.x, e.y - player.y) > swingOf().reach * 1.6 + 24) { floater(e.x, e.y - 28, "miss"); return; }
		strikeLand(e);
	}
	function strikeLand(enemy) {
		if (!player || enemy.dead) return;
		// v14.1: real-time hits roll their own location; the chosen part only counts in turn-based mode
		const aim = turnBased ? aim0() : rollPart141();
		const aimRow = {
			head: {
				hit: .56,
				mult: 1.65
			},
			chest: {
				hit: .9,
				mult: 1
			},
			arm: {
				hit: .72,
				mult: .78
			},
			leg: {
				hit: .72,
				mult: .82
			},
			torso: { hit: .9, mult: 1 },
			legs: { hit: .9, mult: .82 },
			arms: { hit: .9, mult: .78 },
			eyes: { hit: .9, mult: 2.2 },
			groin: { hit: .9, mult: 1.3 }
		}[aim];
		const familyNow = GEAR[player.weaponId]?.family;
		const skNow = isGun(familyNow) ? skillOf("rifle") : skillOf("melee");
		const sneak141 = l1.crouch && !enemy.aggro && enemy.temper !== "timid";
		emitNoise(isGun(familyNow) ? NOISE.gun : NOISE.melee);
		let chance = Math.min(.97, aimRow.hit + perc() * .03 + player.luck * .015 + skNow * .002 + (aim === "head" && hasPerk("deadeye") ? .1 : 0)) * (injured("blind") ? INJ_FX.blindAim : 1) * (injured("arms") ? INJ_FX.armAim : 1);
		if (tb && tbChanceNext != null) { chance = tbChanceNext / 100; tbChanceNext = null; }
		player.dir = facing8(enemy.x - player.x, enemy.y - player.y);
		if (Math.random() > chance) {
			sfx("click");
			floater(enemy.x, enemy.y - 28, "miss");
			pushLog(`You miss the ${aim}.`);
			sync(true);
			return;
		}
		if (enemy.temper === "timid") {
			const first = !enemy.aggro;
			enemy.aggro = true;
			alertPack(enemy);
			if (first) pushLog(enemy.kind === "squirrel" ? "The squirrel bolts." : enemy.kind === "raccoon" ? "The raccoon chitters and scrambles off." : enemy.kind === "turtle" ? "The turtle pulls into its shell and shuffles for the water." : "The rabbit bolts.");
		} else {
			const wasCalm = !enemy.aggro && enemy.temper === "wary";
			enemy.aggro = true;
			alertPack(enemy);
			if (wasCalm) pushLog(enemy.kind === "moose" ? "The moose lowers its antlers." : enemy.kind === "deer" ? "The deer wheels and charges." : "It turns on you.");
		}
		let dmg = Math.max(1, Math.round(strikeDamage() * aimRow.mult));
		if (sneak141) { dmg = Math.round(dmg * SNEAK_MULT); floater(enemy.x, enemy.y - 44, "Sneak attack"); pushLog(`Sneak attack: ${dmg}.`); train("sneak", 4); }
		const tiny = enemy.kind === "squirrel" || enemy.kind === "rabbit" || enemy.kind === "turtle";
		if (tiny) {
			if (enemy.hp < enemy.maxHp || Math.random() < .72) dmg = enemy.hp;
			else dmg = Math.max(1, enemy.maxHp - 1);
		}
		enemy.hp -= dmg;
		enemy.hurt = .12;
		const fx = PART141[aim];
		if ((aim === "arm" || aim === "arms" && Math.random() < fx.cripple) && !tiny) {
			enemy.crippleArm = 8;
			pushLog("The foreleg gives.");
		} else if ((aim === "leg" || aim === "legs" && Math.random() < fx.cripple) && !tiny) {
			enemy.crippleLeg = 8;
			pushLog("The leg buckles.");
		} else if (aim === "head") pushLog("You catch the head.");
		else if (aim === "eyes" && !tiny) { enemy.blind141 = true; enemy.stun141 = 1.6; enemy.cooldown = Math.max(enemy.cooldown || 0, 1.2); pushLog("Right in the eyes. It reels, blind."); }
		else if (aim === "groin" && !tiny && Math.random() < fx.cripple) { enemy.cooldown = Math.max(enemy.cooldown || 0, 1.4); enemy.knock141 = 1; pushLog("A low hit. It folds over."); }
		if (aim !== "torso" && !tiny && fx) floater(enemy.x, enemy.y - 44, fx.label);
		sfx("hit");
		if (!reduceMotion) shake = Math.min(8, shake + 3);
		burst(enemy.x, enemy.y, "#c4543a", 7);
		floater(enemy.x, enemy.y - 28, String(dmg));
		if (enemy.hp <= 0) markDead(enemy, enemy.xp);
		sync(true);
	}
	function strikeNpc(npc) {
		if (!player || !world) return;
		if (safeNoFight()) return;
		// swinging at the Warden starts the fight (he is not a townsman)
		if (npc.id === WARDEN_NPC_ID) {
			wardenChoice("warden-fight");
			return;
		}
		if (!paySwing()) return;
		const aimRow = {
			head: {
				hit: .56,
				mult: 1.65
			},
			chest: {
				hit: .9,
				mult: 1
			},
			arm: {
				hit: .72,
				mult: .78
			},
			leg: {
				hit: .72,
				mult: .82
			},
			torso: { hit: .9, mult: 1 },
			legs: { hit: .9, mult: .82 },
			arms: { hit: .9, mult: .78 },
			eyes: { hit: .9, mult: 2.2 },
			groin: { hit: .9, mult: 1.3 }
		}[aim];
		const familyNow = GEAR[player.weaponId]?.family;
		const skNow = isGun(familyNow) ? skillOf("rifle") : skillOf("melee");
		const chance = Math.min(.97, aimRow.hit + perc() * .03 + player.luck * .015 + skNow * .002 + (aim === "head" && hasPerk("deadeye") ? .1 : 0)) * (injured("blind") ? INJ_FX.blindAim : 1) * (injured("arms") ? INJ_FX.armAim : 1);
		player.dir = facing8(npc.x - player.x, npc.y - player.y);
		if (Math.random() > chance) {
			sfx("click");
			floater(npc.x, npc.y - 28, "miss");
			pushLog(`You miss the ${aim}.`);
			sync(true);
			return;
		}
		const dmg = Math.max(1, Math.round(strikeDamage() * aimRow.mult));
		npc.hp -= dmg;
		sfx("hit");
		if (!reduceMotion) shake = Math.min(8, shake + 3);
		burst(npc.x, npc.y, "#c4543a", 7);
		floater(npc.x, npc.y - 28, String(dmg));
		if (npc.hp <= 0) {
			const blow = crimeShift(npc.role);
			const town = townOf(npc.role);
			shiftRep(town, blow.karma, blow.rep);
			pushLog(npc.role === "cyndal" || npc.role === "loki" ? "That will not be forgotten." : town ? `${TOWN_NAME[town]} will remember this.` : "Word of that will travel.");
			if (party && party.homeId === npc.id) party = null;
			corpseOfNpc(npc);
			goneNpcs.add(npc.id);
			world.npcs = world.npcs.filter((other) => other.id !== npc.id);
			grantXp(npc.role === "villager" ? 4 : 8);
			if (intent?.kind === "attack" && intent.who === "npc" && intent.id === npc.id) intent = null;
			saveGame();
		}
		sync(true);
	}
	function alertPack(enemy) {
		if (!world || !enemy.pack) return;
		for (const other of world.enemies) if (other.pack === enemy.pack && !other.dead) other.aggro = true;
	}
	function hurtPlayer(amount, fromX, fromY) {
		if (player && safeAt(player.x, player.y)) return;
		if (!player || player.invuln > 0 || phase !== "play") return;
		const dmg = Math.max(1, amount - player.def);
		player.hp -= dmg;
		if (!mode11) {
			wearArmor(amount);
			const biter = world?.enemies.find((e) => !e.dead && e.kind !== "bandit" && Math.hypot(e.x - fromX, e.y - fromY) < 40);
			if (biter && curDay() >= 2 && Math.random() < .04 * (1 - fx13().sickResist) * (perk13("firstaid", 3) ? .5 : 1)) catchAil("cut", `The ${biter.kind} got its teeth in you.`);
			if (dmg >= player.maxHp * .3 && Math.random() < .12) catchAil("bone", "That hit cracked something.");
			injuryRoll141(dmg);
		}
		player.invuln = .38;
		player.hurt = .4;
		sfx("hurt");
		if (!reduceMotion) shake = Math.min(10, shake + 5);
		burst(player.x, player.y, "#f0e6d4", 6);
		floater(player.x, player.y - 30, `-${dmg}`);
		const dx = player.x - fromX;
		const dy = player.y - fromY;
		const m = Math.hypot(dx, dy) || 1;
		nudge(player, dx / m * 16, dy / m * 16);
		if (player.hp <= 0) {
			player.hp = 0;
			phase = "dead";
			intent = null;
			dropPack141();
			closePanels();
			parkBike(false);
			sfx("die");
			pushLog("You go down in the spruce.");
			saveGame();
		}
		sync(true);
	}
	function nudge(body, dx, dy) {
		if (!world) return;
		if (!pointBlocked(world, body.x + dx, body.y + dy, RADIUS)) {
			body.x += dx;
			body.y += dy;
		}
	}
	function moveBody(body, mx, my, speed, dt) {
		if (!world) return false;
		const mag = Math.hypot(mx, my);
		if (mag < .01) return false;
		const ux = mx / mag;
		const uy = my / mag;
		if (body === player) {
			// v14: a short ease into the walk (about 0.14 s), smoothstepped
			player.ease = Math.min(1, (player.ease ?? 1) + dt / .14);
			const e = player.ease; speed *= .35 + .65 * e * e * (3 - 2 * e);
			player.easeT = performance.now();
		}
		const { vx, vy } = screenDirToWorld(ux * speed * dt, uy * speed * dt);
		return slide(body, vx, vy);
	}
	function slide(body, dx, dy) {
		if (!world) return false;
		// A body already overlapping a wall (stepped out of a door, loaded at an old spot) may always move
		// onto open ground; otherwise every step collides and it is frozen in place.
		if (pointBlocked(world, body.x, body.y, RADIUS) && !pointBlocked(world, body.x + dx, body.y + dy, 0)) {
			body.x += dx;
			body.y += dy;
			return true;
		}
		if (!pointBlocked(world, body.x + dx, body.y + dy, RADIUS)) {
			body.x += dx;
			body.y += dy;
			return true;
		}
		if (!pointBlocked(world, body.x + dx, body.y, RADIUS)) {
			body.x += dx;
			return true;
		}
		if (!pointBlocked(world, body.x, body.y + dy, RADIUS)) {
			body.y += dy;
			return true;
		}
		return false;
	}
	function follow(body, path, speed, dt, eight) {
		if (!path.length) return path;
		const wp = path[0];
		const screen = worldVelToScreen(wp.x - body.x, wp.y - body.y);
		const sd = Math.hypot(screen.dsx, screen.dsy);
		if (sd < 8) return path.slice(1);
		// v14: round the corner. Inside 30 px of a middle node, steer at a blend of this node and the next so the walker doesn't stop-start
		let aimX = screen.dsx, aimY = screen.dsy;
		if (path.length > 1 && sd < 30) {
			const n2 = worldVelToScreen(path[1].x - body.x, path[1].y - body.y);
			const t = 1 - sd / 30, m2 = Math.hypot(n2.dsx, n2.dsy) || 1;
			aimX = screen.dsx / sd * (1 - t) + n2.dsx / m2 * t; aimY = screen.dsy / sd * (1 - t) + n2.dsy / m2 * t;
			if (sd < 14) return path.slice(1);
		}
		moveBody(body, aimX, aimY, speed, dt);
		const vel = screenDirToWorld(aimX, aimY);
		body.dir = eight ? facing8Hys(body.dir, vel.vx, vel.vy) : facingFromWorld(vel.vx, vel.vy);
		return path;
	}
	function nearestFight(maxDist) {
		if (!player) return null;
		const enemy = nearestEnemy(maxDist);
		const npc = nearestNpc(110);
		if (enemy && npc) {
			const de = Math.hypot(enemy.x - player.x, enemy.y - player.y);
			const dn = Math.hypot(npc.x - player.x, npc.y - player.y);
			if (dn <= 110 && dn < de) return {
				who: "npc",
				id: npc.id,
				x: npc.x,
				y: npc.y
			};
			return {
				who: "enemy",
				id: enemy.id,
				x: enemy.x,
				y: enemy.y
			};
		}
		if (enemy) return {
			who: "enemy",
			id: enemy.id,
			x: enemy.x,
			y: enemy.y
		};
		if (npc) return {
			who: "npc",
			id: npc.id,
			x: npc.x,
			y: npc.y
		};
		return null;
	}
	function nearestEnemy(maxDist) {
		if (!world || !player) return null;
		let best = null;
		let bestD = maxDist;
		for (const e of world.enemies) {
			if (e.dead) continue;
			const d = Math.hypot(e.x - player.x, e.y - player.y);
			if (d < bestD) {
				best = e;
				bestD = d;
			}
		}
		return best;
	}
	function clearEdges() {
		edges.attack = false;
		edges.interact = false;
		edges.build = false;
		edges.pause = false;
		edges.resume = false;
		edges.menu = false;
		edges.respawn = false;
		edges.save = false;
	}
	function setScars(list) {
		scars.length = 0;
		if (!list) return;
		for (const s of list) {
			if (!s || s.kind !== "stump" && s.kind !== "pit") continue;
			if (typeof s.x !== "number" || typeof s.y !== "number") continue;
			scars.push({
				kind: s.kind,
				x: s.x,
				y: s.y,
				side: s.side || 1
			});
		}
	}
	function scarSnapshot() {
		return scars.map((s) => ({
			kind: s.kind,
			x: s.x,
			y: s.y,
			side: s.side
		}));
	}
	function captureRegion() {
		return {
			id: mapId,
			explored: bytesToB64(explored),
			removed: world ? collectRemoved(world) : [],
			slain: world ? world.enemies.filter((e) => e.dead).map((e) => e.id) : [],
			placed: world ? world.props.filter((p) => p.built).map((p) => ({
				kind: p.kind,
				tx: p.tx,
				ty: p.ty
			})) : [],
			opened: [...openedDoors],
			looted: [...lootedChests],
			goneNpcs: [...goneNpcs],
			piles: piles.map((pile) => ({
				id: pile.id,
				x: pile.x,
				y: pile.y,
				title: pile.title,
				items: pile.items.map((stack) => ({
					id: stack.id,
					qty: stack.qty
				})),
				scrap: pile.scrap,
				body: pile.body,
				folk: pile.folk,
				dir: pile.dir,
				at: pile.at
			})),
			bikes: world ? world.props.filter((p) => p.kind === "bike").map((p) => ({
				id: p.id,
				tx: p.tx,
				ty: p.ty
			})) : [],
			scars: scarSnapshot()
		};
	}
	function applyRegion(region) {
		if (!world) return;
		removedIds.clear();
		for (const id of region?.removed ?? []) removedIds.add(id);
		const removed = new Set(region?.removed ?? []);
		world.props = world.props.filter((p) => {
			if (!removed.has(p.id)) return true;
			vacate(world, p);
			return false;
		});
		const slain = new Set(region?.slain ?? []);
		for (const enemy of world.enemies) if (slain.has(enemy.id)) enemy.dead = true;
		for (const placed of region?.placed ?? []) {
			const prop = tryPlace(world, placed.kind, placed.tx, placed.ty);
			if (prop) prop.built = true;
		}
		for (const bike of region?.bikes ?? []) {
			const prop = world.props.find((p) => p.id === bike.id && p.kind === "bike");
			if (prop) {
				prop.tx = bike.tx;
				prop.ty = bike.ty;
			}
		}
		explored = region ? new Uint8Array(b64ToBytes(region.explored, 24336)) : /* @__PURE__ */ new Uint8Array(24336);
		openedDoors.clear();
		for (const id of region?.opened ?? []) openedDoors.add(id);
		lootedChests.clear();
		for (const id of region?.looted ?? []) lootedChests.add(id);
		goneNpcs = new Set(region?.goneNpcs ?? []);
		world.npcs = world.npcs.filter((npc) => !goneNpcs.has(npc.id));
		piles = (region?.piles ?? []).map((pile) => ({
			...pile,
			items: pile.items.map((stack) => ({
				id: stack.id,
				qty: stack.qty
			}))
		}));
		nextPile = piles.reduce((max, pile) => Math.max(max, pile.id + 1), 1);
		lootId = -1;
		setScars(region?.scars);
	}
	function tryCross() {
		if (!world || !player || travelLock > 0 || inside) return false;
		const here = tileOf(player.x, player.y);
		const gate = world.gates.find((g) => Math.abs(g.tx - here.tx) <= 1 && Math.abs(g.ty - here.ty) <= 1);
		if (!gate) return false;
		if (!legacyTravel() || mapId >= 3) { openWorldMap(); return true; }
		if (mapId === 2) { travelTo(0, () => { const s = skowSign(); return { x: s.x + 90, y: s.y + 60 }; }); return true; }
		parkBike(false);
		const leaving = world.name;
		regions.set(mapId, captureRegion());
		const arriveSide = (gate.side + 3) % 6;
		mapId = mapId === 0 ? 1 : 0;
		world = createWorld(worldSeed, mapId, exitSides);
		applyRegion(regions.get(mapId));
		regions.delete(mapId);
		q10World();
		const arrive = world.gates.find((g) => g.side === arriveSide) ?? world.gates[0];
		if (arrive) {
			player.x = arrive.arriveTx * 64 + 32;
			player.y = arrive.arriveTy * 64 + 32;
			player.dir = facing8(5120 - player.x, 4992 - player.y);
		}
		intent = null;
		work = null;
		holdWalk = false;
		inside = null;
		opening = null;
		travelLock = 1.6;
		spawnCrows();
		const land = tileOf(player.x, player.y);
		reveal(land.tx, land.ty, sightRadius(), true);
		pushLog(`The road leaves ${leaving}. You come into ${world.name}.`);
		camX = player.x - player.y - viewW / 2;
		camY = (player.x + player.y) * CAM_ISO_Y - viewH / 2;
		snapParty();
		landReturn();
		saveGame();
		sync(true);
		return true;
	}
	function step(dt) {
		{ const _t = performance.now(); tickLog(dt); pAdd("u:tickLog", _t); }
		{ const _t = performance.now(); q11ModeTick(dt); pAdd("u:q11ModeTick", _t); }
		{ const _t = performance.now(); v3Tick(dt); pAdd("u:v3Tick", _t); }
		if (edges.pause && phase === "play") {
			phase = "pause";
			sync(true);
		}
		if (edges.resume && phase === "pause") {
			phase = "play";
			sync(true);
		}
		if (edges.menu && phase !== "menu") {
			saveGame();
			phase = "menu";
			buildOpen = false;
			dialogue = null;
			sync(true);
		}
		if (edges.save && player && phase !== "menu") {
			saveGame();
			pushLog("Progress kept on this device.");
		}
		if (edges.respawn && phase === "dead" && player && world) {
			const spot = campSpot();
			player.hp = Math.max(1, player.maxHp);
			player.stamina = player.maxStamina;
			player.x = spot.x;
			player.y = spot.y;
			player.respawnX = spot.x;
			player.respawnY = spot.y;
			player.invuln = 1.6;
			snapParty();
			inside = null;
			phase = "play";
			for (const e of world.enemies) e.aggro = false;
			pushLog(world.props.some((p) => p.built && (p.kind === "shelter" || p.kind === "shack")) ? "You wake at the lean-to, sore but breathing." : "You wake on the cot at Cambridge Road. The stove is still warm.");
			saveGame();
		}
		if (!world || !player || phase !== "play") {
			prevHeld = currentHeld();
			clearEdges();
			return;
		}
		clock += dt;
		rotAcc += dt;
		travelLock = Math.max(0, travelLock - dt);
		if (rotAcc >= 1) {
			rotAcc = 0;
			rotPiles();
		}
		if (inside) {
			// Talk / E indoors: by the door it takes you out, elsewhere it says where the way out is
			if (edges.interact) {
				if (inside.ry > roomDims().h - 80 && Math.abs(inside.rx - roomDims().w / 2) < 70) leaveHouse();
				else pushLog("The door is at the bottom of the room. Tap it, or tap Leave.");
			}
			if (inside) stepInside(dt);
			prevHeld = currentHeld();
			clearEdges();
			return;
		}
		player.cooldown = Math.max(0, player.cooldown - dt);
		player.invuln = Math.max(0, player.invuln - dt);
		player.hurt = Math.max(0, player.hurt - dt);
		reach = Math.max(0, reach - dt);
		swingAnim = Math.max(0, swingAnim - dt);
		{ const _t = performance.now(); pendingTick(dt); pAdd("u:pendingTick", _t); }
		{ const _t = performance.now(); v14Tick(); pAdd("u:v14Tick", _t); }
		if (edges.build) edges.build = false; // v15.9.5: the Build menu was removed
		if (false) {
			buildOpen = !buildOpen;
			if (buildOpen) {
				intent = null;
				packOpen = false;
				statsOpen = false;
			}
			sfx("click");
		}
		const pad = readPad();
		if (pad.attack) edges.attack = true;
		if (pad.interact) edges.interact = true;
		if (pad.build) {
			buildOpen = !buildOpen;
			sfx("click");
		}
		if (pad.pause) {
			phase = "pause";
			sync(true);
			prevHeld = currentHeld();
			clearEdges();
			return;
		}
		const tapAttack = edges.attack;
		const tapInteract = edges.interact;
		if (tapAttack) {
			const family = GEAR[player.weaponId]?.family;
			if (isGun(family) && shellCount(player) <= 0) {
				pushLog("Out of shells.");
				sfx("click");
			} else {
				const target = nearestFight(480);
				if (target) {
					holdWalk = false;
					intent = {
						kind: "attack",
						id: target.id,
						who: target.who,
						path: pathTo(world, player.x, player.y, target.x, target.y) ?? []
					};
					attackRepath = 0;
				}
			}
		}
		if (tapInteract || edgeKey("KeyE")) {
			const pile = nearestPile(96);
			const npc = nearestNpc(72);
			const node = nearestResource(96);
			const pileD = pile && player ? Math.hypot(pile.x - player.x, pile.y - player.y) : 999;
			const npcD = npc && player ? Math.hypot(npc.x - player.x, npc.y - player.y) : 999;
			if (pile && pileD <= npcD && pileD <= 78) openLoot(pile);
			else if (pile && pileD < npcD) intent = {
				kind: "loot",
				id: pile.id,
				path: pathTo(world, player.x, player.y, pile.x, pile.y) ?? []
			};
			else if (npc) openTalk(npc);
			else if (node) gather(node);
			else {
				const farNpc = nearestNpc(520);
				if (farNpc) intent = {
					kind: "talk",
					id: farNpc.id,
					path: pathTo(world, player.x, player.y, farNpc.x, farNpc.y) ?? []
				};
			}
		}
		if (pointerDown && gesture === "idle" && performance.now() - gestureAt >= 150 && !buildOpen) {
			gesture = "walk";
			holdWalk = true;
			holdWX = hoverX;
			holdWY = hoverY;
		}
		if (holdWalk && world && player && !buildOpen && (!intent || intent.kind === "walk")) {
			if (!intent || intent.kind !== "walk" || Math.hypot(intent.x - holdWX, intent.y - holdWY) > 36) intent = {
				kind: "walk",
				x: holdWX,
				y: holdWY,
				path: pathTo(world, player.x, player.y, holdWX, holdWY) ?? []
			};
		}
		// snowshoes: faster over snow
		const shoeT = tileOf(player.x, player.y);
		const shoes = player.feetId === "snowshoes" && world.tiles[shoeT.ty * MAP_W + shoeT.tx] === 4 ? 1.22 : 1;
		const wx = weather13();
		const hardy = perk13("survival", 9) && w13.weather.id === "noreaster" ? 1 : wx.speed;
		const pace = (mounted ? SCREEN_SPEED * 2 * Math.max(.4, wx.bike) : (player.stamina > 0 ? SCREEN_SPEED : SCREEN_SPEED * .45) * hardy * ailSpeed() * needsSpeed() * (setBonus13()?.quality === "standard" ? 1.05 : 1)) * (mounted ? 1 : shoes);
		const pace141 = pace * (l1.crouch && !mounted ? CROUCH_SPEED : 1);
		const fromX = player.x;
		const fromY = player.y;
		{ const _t = performance.now(); tickWork(dt); pAdd("u:tickWork", _t); }
		const sticked = stickMove(pace141, dt);
		if (!sticked) autoTick();
		if (intent && player) {
			if (intent.kind === "walk") {
				intent.path = follow(player, intent.path, pace141, dt, true);
				if (!intent.path.length && Math.hypot(intent.x - player.x, intent.y - player.y) < 10) intent = null;
			} else if (intent.kind === "attack") {
				attackRepath -= dt;
				const attackId = intent.id;
				if (intent.who === "npc") {
					const npc = world.npcs.find((n) => n.id === attackId);
					if (!npc) intent = null;
					else {
						const dist = Math.hypot(npc.x - player.x, npc.y - player.y);
						const swing = swingOf();
						player.dir = facing8(npc.x - player.x, npc.y - player.y);
						if (dist <= swing.range) strikeNpc(npc);
						else {
							if (attackRepath <= 0) {
								intent.path = pathTo(world, player.x, player.y, npc.x, npc.y) ?? [];
								attackRepath = .22;
							}
							intent.path = follow(player, intent.path, pace141, dt, true);
						}
					}
				} else {
					let target = world.enemies.find((e) => e.id === attackId && !e.dead);
					if (!target) {
						const swing = swingOf();
						target = nearestEnemy(Math.min(swing.range, 72)) ?? void 0;
						if (target) {
							intent = {
								kind: "attack",
								id: target.id,
								who: "enemy",
								path: []
							};
							attackRepath = 0;
						}
					}
					if (!target) intent = null;
					else {
						const dist = Math.hypot(target.x - player.x, target.y - player.y);
						const swing = swingOf();
						player.dir = facing8(target.x - player.x, target.y - player.y);
						if (dist <= swing.range) strikeEnemy(target);
						else {
							if (attackRepath <= 0) {
								intent.path = pathTo(world, player.x, player.y, target.x, target.y) ?? [];
								attackRepath = .22;
							}
							intent.path = follow(player, intent.path, pace141, dt, true);
							if (!intent.path.length) {
								const screen = worldVelToScreen(target.x - player.x, target.y - player.y);
								moveBody(player, screen.dsx, screen.dsy, pace141, dt);
							}
						}
					}
				}
			} else if (intent.kind === "enter") {
				const enterId = intent.id;
				const prop = world.props.find((p) => p.id === enterId);
				if (!prop || !canWalkIn(prop)) intent = null;
				else if (Math.hypot(doorPoint(prop).x - player.x, doorPoint(prop).y - player.y) <= 78) beginOpen(prop);
				else intent.path = follow(player, intent.path, pace141, dt, true);
			} else if (intent.kind === "talk") {
				const talkId = intent.id;
				const npc = world.npcs.find((n) => n.id === talkId);
				if (!npc) intent = null;
				else if (Math.hypot(npc.x - player.x, npc.y - player.y) <= 66) openTalk(npc);
				else intent.path = follow(player, intent.path, pace141, dt, true);
			} else if (intent.kind === "gather") {
				const gatherId = intent.id;
				const prop = world.props.find((p) => p.id === gatherId);
				if (!prop || !prop.resource) intent = null;
				else if (Math.hypot(propCenter(prop).x - player.x, propCenter(prop).y - player.y) <= 60) gather(prop);
				else intent.path = follow(player, intent.path, pace141, dt, true);
			} else if (intent.kind === "chop" || intent.kind === "mine") {
				const laborProp = world.props.find((p) => p.id === intent.id);
				if (!laborProp) intent = null;
				else if (!work || work.id !== laborProp.id) {
					const spot = propCenter(laborProp);
					if (Math.hypot(spot.x - player.x, spot.y - player.y) <= 70) startLabor(laborProp, intent.kind);
					else intent.path = follow(player, intent.path, pace141, dt, true);
				} else stepLabor(dt, pace);
			} else if (intent.kind === "loot") {
				const lootPid = intent.id;
				const lootTarget = piles.find((p) => p.id === lootPid);
				if (!lootTarget || !hasLoot(lootTarget)) intent = null;
				else if (Math.hypot(lootTarget.x - player.x, lootTarget.y - player.y) <= 64) openLoot(lootTarget);
				else intent.path = follow(player, intent.path, pace141, dt, true);
			} else if (intent.kind === "mount") {
				const rideId = intent.id;
				const bike = world.props.find((p) => p.id === rideId && p.kind === "bike");
				if (!bike) intent = null;
				else {
					const spot = propCenter(bike);
					if (Math.hypot(spot.x - player.x, spot.y - player.y) <= 72) mountBike(bike);
					else intent.path = follow(player, intent.path, pace141, dt, true);
				}
			}
		}
		if (opening && intent) opening = null;
		if (opening && player && world) {
			const swing = opening;
			swing.t -= dt;
			const prop = world.props.find((p) => p.id === swing.id);
			if (prop) player.dir = facing8(doorPoint(prop).x - player.x, doorPoint(prop).y - player.y);
			if (swing.t <= 0) {
				opening = null;
				if (prop) finishEnter(prop);
			}
		}
		drawn = Math.max(0, drawn - dt);
		if (deal > 0) deal = Math.max(0, deal - dt);
		const swinging = work && work.swing > 0;
		const stepDist = Math.hypot(player.x - fromX, player.y - fromY);
		{ const _t = performance.now(); noiseTick(dt, stepDist > .45); pAdd("u:noiseTick", _t); }
		{ const _t = performance.now(); dropTick(); pAdd("u:dropTick", _t); }
		{ const _t = performance.now(); prodTick(dt); pAdd("u:prodTick", _t); }
		if (stepDist <= .45 && performance.now() - (player.easeT ?? 0) > 60) player.ease = 0;
		if (stepDist > .45 && !swinging) {
			player.dir = facing8Hys(player.dir, player.x - fromX, player.y - fromY);
			// leg cycle follows on-screen distance (one 4-frame cycle per ~72 px), so feet don't skate
			// on sideways walks (screen moves 1.41 px per world unit there, 0.71 up/down)
			const mdx = player.x - fromX, mdy = player.y - fromY;
			// v14.1 (gif-compare): the leg cycle runs on a timer scaled by speed, not on distance:
			// walk 105 ms/frame, run 70 ms/frame at their reference speeds, faster or slower with actual speed
			const scr = Math.hypot(mdx - mdy, (mdx + mdy) * CAM_ISO_Y) / Math.max(dt, 1e-3);
			const run = scr > SCREEN_SPEED * 1.15;
			const ms = (run ? ANIM_MS.run : ANIM_MS.walk) / Math.max(.6, Math.min(1.5, scr / (run ? SCREEN_SPEED * 1.4 : SCREEN_SPEED)));
			const cols = sheetCols(images.get(heroKey()));
			player.anim += dt * 1000 / ms * 11; void cols;
			player.running = run;
			if (!mounted && !turnBased) player.stamina = Math.max(0, player.stamina - 12 * dt);
			if (turnBased) {
				apWalk += stepDist;
				while (apWalk >= 54 && ap > 0) {
					apWalk -= 54;
					ap -= 1;
				}
				if (ap <= 0) {
					ap = 0;
					intent = null;
					holdWalk = false;
				}
			}
			lastSpeed = mounted ? SCREEN_SPEED * 2 : player.stamina > 0 ? SCREEN_SPEED : SCREEN_SPEED * .45;
			burnGas(Math.hypot(player.x - fromX, player.y - fromY));
			if (deal > 0) deal = 0;
			player.frame = walkFrame(true);
		} else if (swinging) {
			player.frame = laborFrame(work.swing);
			lastSpeed = 0;
			player.stamina = Math.min(player.maxStamina, player.stamina + staminaBack() * dt);
		} else if (deal > 0) {
			player.frame = 2;
			reach = Math.max(reach, deal);
			lastSpeed = 0;
			player.stamina = Math.min(player.maxStamina, player.stamina + staminaBack() * dt);
		} else {
			player.stamina = Math.min(player.maxStamina, player.stamina + staminaBack() * dt);
			lastSpeed = 0;
			player.frame = work && work.fall > 0 ? 1 : reach > 0 ? 2 : 0; // 0 = feet-together standing frame (1 was mid-stride)
		}
		stamHud += dt;
		if (stamHud > .35) {
			stamHud = 0;
			useHud.setState({
				stamina: player.stamina,
				maxStamina: player.maxStamina,
				hp: player.hp,
				v141: hud141()
			});
		}
		if (tryCross()) {
			prevHeld = currentHeld();
			clearEdges();
			return;
		}
		if (!turnBased) for (const npc of world.npcs) {
			stepFolk(npc, dt);
		}
		if (!turnBased) stepParty(dt);
		if (!turnBased) stepProps(dt);
		{ const _t = performance.now(); stepEncounters(); pAdd("u:stepEncounters", _t); }
		{ const _t = performance.now(); q10Step(dt); pAdd("u:q10Step", _t); }
		{ const _t = performance.now(); q11Step(dt); pAdd("u:q11Step", _t); }
		snowAcc += dt;
		if (snowAcc > .28 && particles.length < 24) {
			snowAcc = 0;
			const here = tileOf(player.x, player.y);
			if (inFarm(here.tx, here.ty)) particles.push({
				x: player.x + (Math.random() - .5) * 520,
				y: player.y + (Math.random() - .5) * 520,
				vx: 8 + Math.random() * 10,
				vy: 14 + Math.random() * 12,
				life: 3.4,
				max: 3.4,
				color: "#f4f7fb",
				size: 2
			});
		}
		const tAI = performance.now();
		const aiFar = Math.max(viewW, viewH) / Math.max(.3, zoom) * (perfMode ? 1.25 : 1.5);
		let aiPaused = 0;
		// v15.9.4: animals and foes think and move on a 20 Hz tick; the renderer interpolates them every frame
		aiAcc += dt;
		const aiRun = turnBased || aiAcc >= AI_DT - 1e-6;
		if (aiRun) ((dt) => {
		if (!turnBased) for (const e of world.enemies) { e.px = e.x; e.py = e.y; }
		aiAcc = 0;
		if (!turnBased) for (const enemy of world.enemies) {
			if (enemy.lineup141) continue;
			if (enemy.death > 0) enemy.death = Math.max(0, enemy.death - dt);
			if (enemy.dead) continue;
			enemy.cooldown = Math.max(0, enemy.cooldown - dt);
			enemy.hurt = Math.max(0, enemy.hurt - dt);
			enemy.crippleArm = Math.max(0, enemy.crippleArm - dt);
			enemy.crippleLeg = Math.max(0, enemy.crippleLeg - dt);
			enemy.slow = Math.max(0, (enemy.slow || 0) - dt);
			enemy.pathT -= dt;
			safeKeep(enemy);
			const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
			// v15.9.3: animals and foes ~1.5 screens away (not chasing, not raiding) pause their AI and animation
			if (dist > aiFar && !enemy.aggro && !enemy.quest) { aiPaused++; continue; }
			const homeDist = Math.hypot(enemy.x - enemy.homeX, enemy.y - enemy.homeY);
			if (enemy.hollow) { stepHollow(enemy, dt, dist); continue; }
			if (enemy.temper === "timid") {
				if (dist > 340) enemy.aggro = false;
				// v15.10: turtles crawl (and never step onto a road); raccoons spook early and run
				const wk = enemy.kind === "turtle" ? .28 : enemy.kind === "raccoon" ? 1.1 : 1, ox0 = enemy.x, oy0 = enemy.y;
				const spook = enemy.aggro || dist < noticeRange(enemy.kind === "raccoon" ? 150 : enemy.kind === "turtle" ? 60 : 78) * (1 - .06 * lv("hunting")) || v3Spook(enemy, dist);
				let enemyMoving = false;
				if (spook) {
					if (dist < 78 && !enemy.aggro) {
						enemy.aggro = true;
						alertPack(enemy);
					}
					const dx = enemy.x - player.x;
					const dy = enemy.y - player.y;
					const m = Math.hypot(dx, dy) || 1;
					if (enemy.pathT <= 0 || !enemy.path?.length) {
						enemy.path = pathTo(world, enemy.x, enemy.y, enemy.x + dx / m * 180, enemy.y + dy / m * 180);
						enemy.pathT = .35;
					}
					if (enemy.path) {
						enemy.path = follow(enemy, enemy.path, (enemy.kind === "squirrel" ? 230 : 200) * wk, dt, true);
						enemyMoving = true;
					}
				} else if (homeDist > 80) {
					if (enemy.pathT <= 0 || !enemy.path) {
						enemy.path = pathTo(world, enemy.x, enemy.y, enemy.homeX, enemy.homeY);
						enemy.pathT = .6;
					}
					if (enemy.path) {
						enemy.path = follow(enemy, enemy.path, 90 * wk, dt, true);
						enemyMoving = true;
					}
				} else if (enemy.pathT <= 0) {
					const ang = Math.random() * Math.PI * 2;
					const roam = 20 + Math.random() * 48;
					enemy.path = pathTo(world, enemy.x, enemy.y, enemy.homeX + Math.cos(ang) * roam, enemy.homeY + Math.sin(ang) * roam);
					enemy.pathT = 1.4 + Math.random() * 2;
					if (enemy.path?.length) {
						enemy.path = follow(enemy, enemy.path, 80 * wk, dt, true);
						enemyMoving = true;
					}
				}
				if (enemy.kind === "turtle") { const tt = tileOf(enemy.x, enemy.y); if (wRoad(tt.tx, tt.ty)) { enemy.x = ox0; enemy.y = oy0; enemy.path = null; enemy.pathT = .2; enemyMoving = false; } }
				if (enemyMoving) enemy.anim += dt * (enemy.kind === "turtle" ? 5 : 12);
				enemy.frame = enemyMoving ? Math.floor(enemy.anim) % 4 : 0;
				continue;
			}
			if (enemy.aggro && homeDist > 520 && !isRaider(enemy)) enemy.aggro = false;
			const sight = (enemy.kind === "coyote" ? 150 : enemy.kind === "wolf" ? 210 * (nightShade(clock) > .22 ? 1.5 : 1) * (seasonNow() === 3 ? 1.25 : 1) : 190) * (enemy.blind141 ? INJ_FX.enemyBlindSight : 1);
			if (enemy.temper === "hostile" && !enemy.aggro && dist < noticeRange(sight) && !safeAt(player.x, player.y)) {
				enemy.aggro = true;
				alertPack(enemy);
			}
			let speed = enemy.variant === "grok" ? 72 : enemy.variant === "scout" ? 236 : enemy.variant === "jumper" ? 214 : enemy.variant === "atv" ? 250 : enemy.variant === "armor" ? 78 : enemy.variant === "shield" ? 100 : enemy.variant === "brute" ? 92 : enemy.variant === "torch" ? 148 : enemy.kind === "wolf" ? 176 : enemy.kind === "coyote" ? 196 : enemy.kind === "deer" ? 168 : enemy.kind === "moose" ? 118 : enemy.elite ? 128 : ENEMY_SPEED;
			if (enemy.crippleLeg > 0) speed *= .55;
			if (enemy.slow > 0) speed *= .48;
			const bite = enemy.kind === "moose" ? 70 : enemy.kind === "deer" ? 58 : 50;
			const partyDist = party ? Math.hypot(enemy.x - party.x, enemy.y - party.y) : 9999;
			let enemyMoving = false;
			if (enemy.aggro && party && partyDist < dist && partyDist <= bite && enemy.cooldown <= 0) {
				enemy.cooldown = enemy.kind === "moose" ? 1.05 : enemy.elite ? .95 : .82;
				enemy.dir = facing8(party.x - enemy.x, party.y - enemy.y);
				hurtParty(enemy.crippleArm > 0 ? Math.max(1, Math.round(enemy.atk * .65)) : enemy.atk, enemy.x, enemy.y);
			} else if (enemy.aggro && dist <= bite && enemy.cooldown <= 0) {
				enemy.cooldown = enemy.kind === "moose" ? 1.05 : enemy.elite ? .95 : .82;
				enemy.dir = facing8(player.x - enemy.x, player.y - enemy.y);
				if (enemy.blind141 && Math.random() > INJ_FX.enemyBlindAim) floater(player.x, player.y - 30, "miss"); else
				hurtPlayer(enemy.crippleArm > 0 ? Math.max(1, Math.round(enemy.atk * .65)) : enemy.atk, enemy.x, enemy.y);
			} else if (enemy.aggro) {
				let goalX = player.x;
				let goalY = player.y;
				if (isRaider(enemy) && dist > 90) {
					let lure = null;
					let lureD = 460;
					for (const p of world.props) {
						if (!LURE.has(p.kind)) continue;
						const c = propCenter(p);
						const d = Math.hypot(c.x - enemy.x, c.y - enemy.y);
						if (d < lureD) {
							lureD = d;
							lure = c;
						}
					}
					if (lure && lureD < dist) {
						goalX = lure.x;
						goalY = lure.y;
					}
				}
				// v15.9.5: raider torch-burning and wall-ramming went with raids
				if (enemy.pathT <= 0 || !enemy.path) {
					enemy.path = pathTo(world, enemy.x, enemy.y, goalX, goalY);
					enemy.pathT = .45;
				}
				if (enemy.path) {
					enemy.path = follow(enemy, enemy.path, speed, dt, true);
					enemyMoving = true;
				}
				if (enemy.variant === "jumper") {
					for (const p of world.props) {
						if (p.kind !== "fence" && p.kind !== "fence-2" && p.kind !== "fence-3") continue;
						const c = propCenter(p);
						if (Math.hypot(c.x - enemy.x, c.y - enemy.y) > 46) continue;
						const dx = goalX - enemy.x;
						const dy = goalY - enemy.y;
						const m = Math.hypot(dx, dy) || 1;
						enemy.x += dx / m * 80;
						enemy.y += dy / m * 80;
						enemy.path = null;
						enemy.dir = facing8(dx, dy);
						break;
					}
				}
			} else if (homeDist > 90) {
				if (enemy.pathT <= 0 || !enemy.path) {
					enemy.path = pathTo(world, enemy.x, enemy.y, enemy.homeX, enemy.homeY);
					enemy.pathT = .6;
				}
				if (enemy.path) {
					enemy.path = follow(enemy, enemy.path, enemy.temper === "wary" ? 80 : 90, dt, true);
					enemyMoving = true;
				}
			} else if (enemy.temper === "wary" && enemy.pathT <= 0) {
				const ang = Math.random() * Math.PI * 2;
				const roam = 28 + Math.random() * 70;
				enemy.path = pathTo(world, enemy.x, enemy.y, enemy.homeX + Math.cos(ang) * roam, enemy.homeY + Math.sin(ang) * roam);
				enemy.pathT = 2.2 + Math.random() * 2.4;
				if (enemy.path?.length) {
					enemy.path = follow(enemy, enemy.path, 70, dt, true);
					enemyMoving = true;
				}
			}
			if (enemyMoving) enemy.anim += dt * 10;
			enemy.frame = enemy.cooldown > (enemy.kind === "moose" ? .7 : enemy.elite ? .62 : .52) ? 2 : enemyMoving ? Math.floor(enemy.anim) % 4 : 0;
		}
		{ const _t = performance.now(); separateEnemies(aiFar); pAdd("u:separateEnemies", _t); }
		aiPausedN = aiPaused;
		})(aiAcc);
		pAdd("ai", tAI);
		workAcc += dt;
		if (workAcc >= 10) {
			workAcc = 0;
			const shops = world.props.filter((p) => p.kind === "workshop").length;
			if (shops && player.scrap < 999) {
				player.scrap = Math.min(999, player.scrap + shops);
				floater(player.x, player.y - 18, `+${shops} iron`);
			}
		}
		for (const prop of world.props) {
			if (prop.kind !== "campfire") continue;
			const c = propCenter(prop);
			if (Math.hypot(c.x - player.x, c.y - player.y) < 118 && player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + 9 * dt);
		}
		if (lootId >= 0) {
			const open = piles.find((p) => p.id === lootId);
			if (!open || !hasLoot(open) || Math.hypot(open.x - player.x, open.y - player.y) > 140) lootId = -1;
		}
		{ const _t = performance.now(); stepCrows(dt); pAdd("u:stepCrows", _t); }
		{ const _t = performance.now(); vision(); pAdd("u:vision", _t); }
		for (const part of particles) {
			part.life -= dt;
			part.x += part.vx * dt;
			part.y += part.vy * dt;
			if (part.spinV) part.spin += part.spinV * dt;
		}
		for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
		if (particles.length > partCap195()) particles.splice(0, particles.length - partCap195()); // v15.9.5: oldest go first
		for (const f of floaters) {
			f.life -= dt;
			f.y -= 18 * dt;
		}
		for (let i = floaters.length - 1; i >= 0; i--) if (floaters[i].life <= 0) floaters.splice(i, 1);
		saveAcc += dt;
		if (saveAcc > 20) {
			saveAcc = 0;
			saveGame();
		}
		syncAcc += dt;
		if (syncAcc > .15) {
			syncAcc = 0;
			sync(true);
		}
		prevHeld = currentHeld();
		{ const _t = performance.now(); clearEdges(); pAdd("u:clearEdges", _t); }
	}
	function currentHeld() {
		const s = new Set(keys);
		for (const c of injected) s.add(c);
		return s;
	}
	function edgeKey(code) {
		return held(code) && !prevHeld.has(code);
	}
	function separateEnemies(far = Infinity) {
		if (!world) return;
		const list = player && far < Infinity ? world.enemies.filter((e) => !e.dead && Math.abs(e.x - player.x) < far && Math.abs(e.y - player.y) < far) : world.enemies.filter((e) => !e.dead);
		for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
			const a = list[i];
			const b = list[j];
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			if (dx > 26 || dx < -26 || dy > 26 || dy < -26) continue;
			const d = Math.hypot(dx, dy);
			if (d > 0 && d < 26) {
				const push = (26 - d) / 2;
				nudge(a, -dx / d * push, -dy / d * push);
				nudge(b, dx / d * push, dy / d * push);
			}
		}
	}
	function nearestNpc(maxDist) {
		if (!world || !player) return null;
		let best = null;
		let bestD = maxDist;
		for (const n of world.npcs) {
			const raw = Math.hypot(n.x - player.x, n.y - player.y);
			if (raw >= maxDist) continue;
			// v14.1 playtest: the quest NPC (Justin) wins E/Talk over Loki or villagers standing a bit closer
			const d = n.role === "justin" || n.questMark ? raw * .45 : raw;
			if (d < bestD) {
				best = n;
				bestD = d;
			}
		}
		return best;
	}
	function nearestResource(maxDist) {
		if (!world || !player) return null;
		let best = null;
		let bestD = maxDist;
		for (const p of world.props) {
			if (!p.resource) continue;
			const c = propCenter(p);
			const d = Math.hypot(c.x - player.x, c.y - player.y);
			if (d < bestD) {
				best = p;
				bestD = d;
			}
		}
		return best;
	}
	/** v15.9.5: hard particle cap; lower at night and in Performance mode (night is the slow case on phones). */
	function partCap195() { return perfMode || nightShade(clock) > .22 ? 60 : 140; }
	function burst(x, y, color, n, big) {
		n = Math.min(n, Math.max(0, partCap195() - particles.length));
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = 30 + Math.random() * 90;
			particles.push({
				x,
				y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s * .6,
				life: .45 + Math.random() * .25,
				max: .7,
				color,
				size: (big ? 5 : 2) + Math.random() * (big ? 4 : 2)
			});
		}
	}
	function floater(x, y, text) {
		floaters.push({
			x,
			y,
			text,
			life: .8
		});
	}
	function readPad() {
		const empty = {
			x: 0,
			y: 0,
			mag: 0,
			attack: false,
			interact: false,
			build: false,
			pause: false
		};
		const pads = navigator.getGamepads?.();
		const gp = pads ? pads[0] : null;
		if (!gp) return empty;
		let x = gp.axes[0] ?? 0;
		let y = gp.axes[1] ?? 0;
		const m = Math.hypot(x, y);
		if (m < .18) {
			x = 0;
			y = 0;
		} else {
			const s = (m - .18) / (.82 * m);
			x *= s;
			y *= s;
		}
		const pressed = (i) => !!gp.buttons[i]?.pressed;
		const edge = (i) => pressed(i) && !padPrev[i];
		const attack = edge(0);
		const interact = edge(1);
		const build = edge(2);
		const pause = edge(9);
		for (let i = 0; i < gp.buttons.length; i++) padPrev[i] = pressed(i);
		if (pressed(14)) x -= 1;
		if (pressed(15)) x += 1;
		if (pressed(12)) y -= 1;
		if (pressed(13)) y += 1;
		return {
			x,
			y,
			mag: Math.hypot(x, y),
			attack,
			interact,
			build,
			pause
		};
	}
	function resize() {
		const rect = canvas.getBoundingClientRect();
		// v15.9.3: Performance mode draws at 0.75x the device pixel ratio (capped at 1.5) and the browser scales it up
		const dpr = perfMode ? Math.max(.75, Math.min(1.5, (window.devicePixelRatio || 1) * .75)) : Math.min(2, window.devicePixelRatio || 1);
		viewW = Math.max(1, rect.width);
		viewH = Math.max(1, rect.height);
		// v15.9.3: only touch the backing store when the size really changes (assigning width every frame
		// reallocates and clears the canvas)
		const cw = Math.max(1, Math.floor(viewW * dpr)), ch = Math.max(1, Math.floor(viewH * dpr));
		if (canvas.width !== cw) canvas.width = cw;
		if (canvas.height !== ch) canvas.height = ch;
		if (mini.width !== 132) mini.width = 132;
		if (mini.height !== 132) mini.height = 132;
	}
	/** v12: gw14 people sheets by role (Cal's art is the "jack" set). */
	const V2_WHO = { holt: "holt", cal: "jack", mira: "mira", nora: "nora", sarah: "sarah", cyndal: "cyndal", loki: "loki", marcel: "marcel", justin: "justin" };
	function v2Who(npc) {
		const k = asSarah() && npc.role === "sarah" ? "justin" : V2_WHO[npc.role];
		return k && images.get(`v2/${k}-walk`) ? k : "";
	}
	const V4_FOLK = new Set(["gus", "pete"]);
	function folkSheet(npc) {
		const k = v2Who(npc);
		if (k) return `v2/${k}-walk`;
		return npc.role === "villager" ? "villager" : npc.role === "warden" ? "boss-warden" : `npc-${npc.role}`;
	}
	function paintPerson(body, camX, camY) {
		const id = body.id ?? body.homeId;
		// kids never stand a gun post: no guard pose for Cyndal or Loki, ever
		const kid = body.role === "cyndal" || body.role === "loki";
		const guarding = false; // v15.9.5: no raid guard posts
		if (paintV2Folk(body, guarding, camX, camY)) return;
		const firing = guarding && (body.cooldown || 0) > .2;
		const guardName = firing ? `guard-${body.role}` : `guard-watch-${body.role}`;
		const posed = guarding && images.get(guardName) ? guardName : guarding && images.get(`guard-${body.role}`) ? `guard-${body.role}` : "";
		if (posed) {
			// idle: a slow breath; firing: recoil lunge (the painted v18 poses beat v19's strip guards)
			const breath = firing ? 1 : 1 + .018 * Math.sin(performance.now() / 520 + (id || 0));
			blit(posed, body.x, body.y, folkHeight(body), false, 0, 0, camX, camY, firing, 0, 0, breath);
			return;
		}
		// Standing still uses each sheet's cleanest upright feet-together cell; walking skips rows whose
		// art is slanted (most NPC diagonals lean ~18px) or mis-sized (Loki's N row). See pose-table.ts.
		// v15.8: Quest RPG's approved v4 town-character art (one upright frame, feet on the bottom row) for people
		// who also appear in the towns and have no animated v2 set. Used while they stand; walking keeps the sheet.
		if (body.still !== false && V4_FOLK.has(body.role) && images.get(`v4/npc-${body.role}`)) {
			blit(`v4/npc-${body.role}`, body.x, body.y, folkHeight(body), false, 0, 0, camX, camY);
			return;
		}
		const sheet = folkSheet(body);
		const pose = POSE[sheet];
		const dir = (body.dir || 0) % 8;
		let row = dir;
		let frame = body.frame || 0;
		if (pose && body.still !== false) [row, frame] = pose.idle[dir];
		else if (pose) {
			row = pose.walk[dir];
			const cyc = pose.cycle[dir];
			frame = cyc[frame % cyc.length];
		}
		blit(sheet, body.x, body.y, folkHeight(body), true, frame, row, camX, camY);
	}
	function dangerNear(body) {
		if (!world) return false;
		for (const e of world.enemies) if (!e.dead && e.aggro && e.kind === "bandit" && Math.hypot(e.x - body.x, e.y - body.y) < 10 * TILE) return true;
		return false;
	}
	/** v12: draw a person from the gw14 action sheets. Returns false when that role has no gw14 art. */
	function paintV2Folk(body, guarding, camX, camY) {
		const k = v2Who(body);
		if (!k) return false;
		const kid = k === "cyndal" || k === "loki";
		const now = performance.now();
		if (body.hp != null) {
			if (body._hp != null && body.hp < body._hp) body._hitT = now;
			body._hp = body.hp;
		}
		const has = (a) => !!images.get(`v2/${k}-${a}`);
		// v14.2: frame counts come from each sheet, so 10/14-frame sheets play their whole cycle
		const nf = (a) => sheetCols(images.get(`v2/${k}-${a}`));
		const dir = (body.dir || 0) % 8;
		const seed = (body.id ?? body.homeId ?? 0) * 137;
		let act = "walk";
		let frame = 0;
		if (body.hp != null && body.hp <= 0 && has("down")) { act = "down"; frame = 3; }
		else if (body._hitT && now - body._hitT < 360 && has("hit")) { act = "hit"; frame = Math.min(nf("hit") - 1, Math.floor((now - body._hitT) / 360 * nf("hit"))); }
		else if (guarding && !kid && has("gun")) {
			const firing = (body.cooldown || 0) > .2;
			if (firing && has("gun-atk")) { act = "gun-atk"; frame = Math.min(3, Math.floor((1 - Math.min(1, body.cooldown)) * 4)); }
			else { act = "gun"; frame = Math.floor((now + seed) / 420) % 4; }
		}
		else if (kid && dangerNear(body) && has("crouch")) { act = "crouch"; frame = Math.floor((now + seed) / 420) % nf("crouch"); }
		else if (body.still === false) {
			const far = player && body.ox != null && Math.hypot(player.x + body.ox - body.x, player.y + body.oy - body.y) > 160;
			act = far && has("run") ? "run" : kid && body.ox != null && has("carry") ? "carry" : "walk";
			frame = Math.floor((now + seed) / (act === "run" ? ANIM_MS.run : ANIM_MS.walk)) % nf(act);
		}
		else if (k === "marcel" && talkNpc === body && dialogue && has("talk")) { act = "talk"; frame = Math.floor(now / 260) % 4; }
		else if (has("idle")) { act = "idle"; frame = Math.floor((now + seed) / ANIM_MS.idle) % nf("idle"); }
		blit(`v2/${k}-${act}`, body.x, body.y, folkHeight(body), true, frame, dir, camX, camY);
		paintDoll(body, act, frame, dir, body.x, body.y, folkHeight(body), camX, camY);
		return true;
	}
	/** v12: gw14 tree variants (pine2/3, spruce2/3 …) mixed in by a fixed per-tile hash; a third keep the old art. */
	const TREE_V2 = { "tree-pine": "pine", "tree-spruce": "spruce", "tree-fir": "spruce", "tree-birch": "birch", "tree-dead": "snag", "tree-bare": "snag", "tree-scrub": "bush", logs: "log" };
	function v2TreeArt(prop, n) {
		const k = TREE_V2[prop.kind];
		if (!k) return "";
		const pick = (n >>> 4) % 3;
		const name = pick ? `v2/trees/${k}${pick + 1}` : "";
		return name && images.get(name) ? name : "";
	}
	function beastSheet(enemy) {
		const v2b = v2Bandit(enemy);
		if (v2b) return v2b;
		return beastSheetOld(enemy);
	}
	/** v12: gw14 bandit sheets stand in for the legacy raider-* art when present. */
	function v2Bandit(enemy) {
		if (enemy.hollow) return images.get("v2/hollowed-walk") ? "v2/hollowed-walk" : "";
		if (enemy.kind !== "bandit" && !(enemy.kind == null && enemy.variant)) return "";
		const v = enemy.variant;
		let k = "";
		if (v === "scout" || v === "armor" || v === "brute" || v === "torch") k = v;
		else if (!v) k = ["scout", "gray", "blue"][Math.abs(enemy.id ?? 0) % 3];
		const n = k ? `v2/bandit-${k}-walk` : "";
		return n && images.get(n) ? n : "";
	}
	function beastSheetOld(enemy) {
		// v13 art hook: public/game/v2/boss-collector-{walk,atk,death}.png; the warden sheet stands in
		if (enemy.variant === "collector") return images.get("v2/boss-collector-walk") ? "v2/boss-collector-walk" : "boss-warden";
		if (enemy.variant === "holeb") return "boss-holeb";
		if (enemy.variant === "warden") return "boss-warden";
		if (enemy.variant === "pelletier") return "boss-pelletier";
		if (enemy.variant === "grok") return "boss-grok";
		if (enemy.variant === "fur") return "boss-fur";
		if (enemy.variant === "mask") return "boss-mask";
		if (enemy.variant === "saw") return "boss-saw";
		if (enemy.variant === "scout") return "raider-scout";
		if (enemy.variant === "jumper") return "raider-jumper";
		if (enemy.variant === "armor") return "raider-armor";
		if (enemy.variant === "shield") return "raider-shield";
		if (enemy.variant === "atv") return "raider-atv";
		if (enemy.variant === "brute") return "raider-brute";
		if (enemy.variant === "torch") return "raider-torch";
		if (enemy.kind === "wolf") return "wolf";
		if (enemy.kind === "coyote") return "coyote";
		if (enemy.kind === "deer") return "deer";
		if (enemy.kind === "moose") return "moose";
		if (enemy.kind === "rabbit") return "rabbit";
		if (enemy.kind === "squirrel") return "squirrel";
		if (enemy.kind === "raccoon") return "v2/raccoon-wild-walk";
		if (enemy.kind === "turtle") return "v2/turtle-walk";
		return enemy.id % 3 === 1 ? "raider-gray" : enemy.id % 3 === 2 ? "raider-blue" : "raider";
	}
	/** v29 real-world sizing: every body is drawn so its *visible* figure (alpha bbox, SPRITE_FIT)
	 * stands at a real height in inches, on the hero's scale (6'2" = HERO_H x hero fit). Hit tests,
	 * health bars and click targets all read these same functions, so they stay in sync. */
	// size198: PX_PER_IN and the inch tables live in src/game/sizes.ts
	function realH(sheet, inches) {
		return Math.round(inches * PX_PER_IN / (BEAST_FIT[sheet] ?? SPRITE_FIT[sheet] ?? .79));
	}
	function beastH(enemy) {
		const key = enemy.variant && BEAST_IN[enemy.variant] ? enemy.variant : enemy.kind;
		const inches = BEAST_IN[key] ?? 70;
		return realH(beastSheet(enemy), inches);
	}
	function folkHeight(npc) {
		return realH(folkSheet(npc), FOLK_IN[asSarah() && npc.role === "sarah" ? "justin" : npc.role] ?? 69);
	}
	/** v13.5 real size: the parked tractor art is 83 px (rear wheel 50 px = 4.5 ft); the charge sheets match it. */
	const TRACTOR_DRIVE_H = Math.round(110 * SIZE_IN.tractor / 59), TRACTOR_RUN_H = TRACTOR_DRIVE_H; // size198: 110 px was the 59 in parked tractor scale
	function tractorShift(charge) {
		const t = Math.min(1, Math.max(0, charge || 0));
		const along = t * 460;
		return { x: along, y: -along * .2 };
	}
	const COMPASS = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"];
	function spawnRaider(variant, spot, boss = null) {
		const stats = variant === "armor" || variant === "brute" ? [46, 8, 16] : variant === "shield" ? [36, 6, 12] : variant === "atv" ? [28, 7, 14] : variant === "torch" ? [22, 5, 10] : variant === "jumper" ? [16, 4, 9] : [14, 4, 8];
		const label = { scout: "Scout", jumper: "Climber", armor: "Plate", shield: "Shield", brute: "Brute", torch: "Torch", atv: "Rider" };
		const hp = boss ? boss.hp : stats[0];
		world.enemies.push({
			id: world.nextEnemyId++, x: spot.x, y: spot.y, homeX: spot.x, homeY: spot.y,
			hp, maxHp: hp, atk: boss ? boss.atk : stats[1], xp: boss ? boss.xp : stats[2],
			elite: !!boss || variant === "armor" || variant === "brute", quest: false, kind: "bandit", pack: 90, temper: "hostile",
			crippleArm: 0, crippleLeg: 0, dir: 0, frame: 0, anim: 0, cooldown: 0, path: null, pathT: 0, aggro: true, dead: false, hurt: 0,
			variant, name: boss ? boss.name : label[variant] || "Raider", slow: 0, death: 0, raid: false
		});
	}
	/** v15.9.5: raids are gone; this only fades the hit flash on props. */
	function stepProps(dt) {
		if (!world) return;
		for (const prop of world.props) {
			if (prop.flash > 0) prop.flash = Math.max(0, prop.flash - dt);
		}
	}
	function stepFolk(npc, dt) {
		if (npc.lineup141) return;
		if (!world) {
			npc.frame = 0;
			return;
		}
		npc.pause -= dt;
		if (Math.hypot(npc.x - npc.homeX, npc.y - npc.homeY) > 170) {
			npc.path = pathTo(world, npc.x, npc.y, npc.homeX, npc.homeY);
			npc.pause = 0;
		} else if (npc.pause <= 0 && (!npc.path || !npc.path.length)) {
			// Jack Ready minds his stall: he stays put instead of wandering behind the crates
			if (npc.role !== "cal" && Math.random() < .45) {
				const ang = Math.random() * Math.PI * 2;
				const dist = 36 + Math.random() * 80;
				npc.path = pathTo(world, npc.x, npc.y, npc.homeX + Math.cos(ang) * dist, npc.homeY + Math.sin(ang) * dist);
			}
			if (!npc.path?.length) npc.pause = 1.2 + Math.random() * 2.4;
		}
		const fromX = npc.x;
		const fromY = npc.y;
		let moving = false;
		if (npc.path?.length && npc.pause <= 0) {
			const wp = npc.path[0];
			const dx = wp.x - npc.x;
			const dy = wp.y - npc.y;
			if (Math.hypot(dx, dy) < 10) npc.path = npc.path.slice(1);
			else {
				const screen = worldVelToScreen(dx, dy);
				moveBody(npc, screen.dsx, screen.dsy, 58, dt);
				const vel = screenDirToWorld(screen.dsx, screen.dsy);
				npc.dir = facing8(vel.vx, vel.vy);
				moving = true;
			}
			if (!npc.path.length) npc.pause = 1.4 + Math.random() * 2;
		}
		const stepped = Math.hypot(npc.x - fromX, npc.y - fromY);
		if (moving && stepped > .2) {
			npc.anim += dt * 1000 / (ANIM_MS.walk / Math.max(.6, Math.min(1.5, stepped / Math.max(dt, 1e-3) / 120))) * 16;
			npc.frame = Math.floor(npc.anim / 16) % 4;
			npc.still = false;
		} else {
			npc.frame = 0;
			npc.still = true;
		}
	}
	/** The building's own painted door: nothing is pasted over it. While it opens, the doorway darkens
	 * (the room behind), following the door's painted outline. */
	function paintDoorOnBuilding(kind, x, y, buildH, swing, dcx, dcy) {
		const spec = PROP_SPEC[kind];
		const painted = PAINTED_DOORS[spec?.image];
		const house = spec ? images.get(spec.image) : void 0;
		if (!painted || !house || !ctx || swing <= 0) return;
		const raw = worldToScreen(x, y, dcx, dcy);
		const p = zoomPoint(raw.sx, raw.sy);
		const dh = buildH * zoom;
		const dw = dh * (house.width / house.height);
		const top = p.sy - dh * (house.foot ?? .92);
		const left = p.sx - dw / 2;
		const ak = house.artScale || 1;
		const pt = (q) => [left + q[0] * ak / house.width * dw, top + q[1] * ak / house.height * dh];
		const [a, b, c2, d] = painted.q.map(pt);
		ctx.save();
		ctx.globalAlpha *= Math.min(1, swing * 1.4);
		const grad = ctx.createLinearGradient(a[0], a[1], d[0], d[1]);
		grad.addColorStop(0, "#0d0907");
		grad.addColorStop(1, "#2a1a10");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.moveTo(a[0], a[1]);
		ctx.lineTo(b[0], b[1]);
		ctx.lineTo(c2[0], c2[1]);
		ctx.lineTo(d[0], d[1]);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
	/** Lowest painted pixel per column of a building image (source px), for front/behind tests. */
	const artBase = new Map();
	function houseBase(name) {
		if (artBase.has(name)) return artBase.get(name);
		const img = images.get(name);
		if (!img) return null;
		const cv = document.createElement("canvas");
		cv.width = img.width;
		cv.height = img.height;
		const g = cv.getContext("2d", { willReadFrequently: true });
		g.drawImage(img, 0, 0);
		const data = g.getImageData(0, 0, img.width, img.height).data;
		const base = new Float32Array(img.width).fill(-1);
		for (let xx = 0; xx < img.width; xx++) for (let yy = img.height - 1; yy >= 0; yy--) if (data[(yy * img.width + xx) * 4 + 3] > 60) {
			base[xx] = yy;
			break;
		}
		artBase.set(name, base);
		return base;
	}
	/** Is a body standing at (x, y) in front of (screen-below) the painted base of this building? The
	 * art is bigger than the 2x2 collision footprint, so sorting by footprint centre put the hero behind
	 * the wall while he stood at the door. */
	function inFrontOfHouse(prop, x, y) {
		const spec = PROP_SPEC[prop.kind];
		const house = images.get(spec.image);
		const base = houseBase(spec.image);
		if (!house || !base) return false;
		const c = propCenter(prop);
		const dh = spec.drawH;
		const dw = dh * (house.width / house.height);
		const sx = x - y - (c.x - c.y), sy = (x + y - c.x - c.y) / 2;
		const col = Math.floor((sx / dw + .5) * house.width);
		if (col < 0 || col >= house.width) return false;
		const b = base[col];
		if (b < 0) return false;
		const baseSy = -dh * (house.foot ?? .92) + b / house.height * dh;
		return sy >= baseSy - 3;
	}
	/** Draw-order key for a body: in front of any big building whose painted base it stands below. */
	function bodyZ(x, y) {
		let z = x + y;
		if (!world) return z;
		for (const prop of world.props) {
			if (!standingDoor(prop.kind)) continue;
			const c = propCenter(prop);
			if (Math.abs(c.x - x) > 260 || Math.abs(c.y - y) > 260) continue;
			const pz = c.x + c.y;
			if (z <= pz && inFrontOfHouse(prop, x, y)) z = pz + 1;
		}
		return z;
	}
	/** A pale slash arc in the facing direction while a melee swing plays, so a swing reads from every
	 * angle (the painted swing strips only face the camera). */
	function paintSwingArc() {
		if (!player || !ctx) return;
		const family = GEAR[player.weaponId]?.family;
		if (isGun(family)) return;
		const u = 1 - swingAnim / .48;
		if (u <= .05 || u >= .9) return;
		const ang = [Math.PI / 2, Math.PI * .75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75, 0, Math.PI * .25][player.dir & 7];
		const raw = worldToScreen(player.x, player.y, camX, camY);
		const p = zoomPoint(raw.sx, raw.sy);
		const cx = p.sx, cy = p.sy - HERO_H * zoom * .45;
		const r = HERO_H * zoom * (family === "knife" ? .32 : .46);
		const a0 = ang - 1.3 + u * .6, a1 = a0 + .4 + u * 1.6;
		ctx.save();
		ctx.translate(cx, cy);
		ctx.scale(1, .62);
		ctx.globalAlpha = .55 * Math.sin(u * Math.PI);
		ctx.strokeStyle = "#f3ead8";
		ctx.lineCap = "round";
		ctx.lineWidth = 5 * zoom;
		ctx.beginPath();
		ctx.arc(0, 0, r, a0, a1);
		ctx.stroke();
		ctx.globalAlpha *= .5;
		ctx.lineWidth = 11 * zoom;
		ctx.beginPath();
		ctx.arc(0, 0, r * .9, a0 + .15, a1);
		ctx.stroke();
		ctx.restore();
	}
	function paintExitDoor() {
		if (!inside || !ctx) return;
		const o = roomOrigin();
		const d = roomDims();
		const img = images.get("door");
		const dh = d.farm ? 111 : 99; // v13.5: a 7 ft door at the room scale (farm 15.9 px/ft, others 14.1)
		if (img) {
			const dw = dh * (img.width / img.height);
			ctx.drawImage(img, o.x + d.w / 2 - dw / 2, o.y + d.h - 4 - dh, dw, dh);
		}
		ctx.fillStyle = "#efe6d4";
		ctx.font = "700 16px Source Sans 3, sans-serif";
		ctx.textAlign = "center";
		ctx.lineWidth = 3;
		ctx.strokeStyle = "rgba(10, 8, 6, 0.75)";
		ctx.strokeText("Door \u2193", o.x + d.w / 2, o.y + d.h - dh - 10);
		ctx.fillText("Door \u2193", o.x + d.w / 2, o.y + d.h - dh - 10);
		ctx.textAlign = "left";
	}
	function paintProp(name, x, y, h) {
		const img = images.get(name);
		if (!img || !ctx) return;
		const w = h * (img.width / img.height);
		ctx.drawImage(img, x - w / 2, y - h, w, h);
	}
	function drawFarmhouse() {
		if (!inside || !ctx) return;
		const dpr = canvas.width / Math.max(1, viewW);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.fillStyle = "#1a140f";
		ctx.fillRect(0, 0, viewW, viewH);
		applyRoomTransform(dpr);
		const o = roomOrigin();
		const d = roomDims();
		const art = images.get("farm-room");
		if (art) ctx.drawImage(art, o.x, o.y, d.w, d.h);
		else {
			ctx.fillStyle = "#5a4030";
			ctx.fillRect(o.x, o.y, d.w, d.h);
		}
		if (FARM_PAINTED_PROPS) {
			// the painted stove / cups / donuts over the flat v19 shapes, so the kitchen matches the game
			paintProp("stove", o.x + 62, o.y + 188, 112); // v13.5: kept; it covers the flat stove baked into farm-room.png
			if (!lootedChests.has(91001)) paintProp("cider-cups", o.x + 188, o.y + 117, 44);
			if (!lootedChests.has(91002)) paintProp("donuts", o.x + 256, o.y + 115, 40);
		}
		ctx.font = "700 13px Source Sans 3, sans-serif";
		const tag = (text, x, y) => {
			ctx.lineWidth = 3;
			ctx.strokeStyle = "rgba(10, 8, 6, 0.75)";
			ctx.strokeText(text, x, y);
			ctx.fillStyle = "#efe6d4";
			ctx.fillText(text, x, y);
		};
		const nd = nightDark(clock);
		if (nd > .05) {
			// the kitchen window goes dark with the night outside
			ctx.fillStyle = `rgba(10, 16, 34, ${Math.min(.85, nd * 1.1)})`;
			ctx.fillRect(o.x + 160, o.y + 36, 95, 47);
		}
		tag("Stove", o.x + 40, o.y + 206);
		tag(lootedChests.has(91001) ? "Cups empty" : "Cider", o.x + 166, o.y + 72);
		tag(lootedChests.has(91002) ? "Crumbs" : "Donuts", o.x + 236, o.y + 72);
		tag("Stairs", o.x + 318, o.y + 40);
		paintRoomTitle("Cambridge Road");
		paintExitDoor();
		paintHeroInRoom();
	}
	/** Room name, top-right of the stage so the quest panel (top-left on phones) never covers it. */
	function paintRoomTitle(text) {
		const o = roomOrigin();
		const d = roomDims();
		ctx.font = "700 15px Source Sans 3, sans-serif";
		ctx.textAlign = "right";
		ctx.lineWidth = 3;
		ctx.strokeStyle = "rgba(10, 8, 6, 0.8)";
		ctx.strokeText(text, o.x + d.w - 10, o.y + 18);
		ctx.fillStyle = "#efe6d4";
		ctx.fillText(text, o.x + d.w - 10, o.y + 18);
		ctx.textAlign = "left";
	}
	function drawBarn() {
		if (!inside || !ctx) return;
		const dpr = canvas.width / Math.max(1, viewW);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.fillStyle = "#14110e";
		ctx.fillRect(0, 0, viewW, viewH);
		applyRoomTransform(dpr);
		const o = roomOrigin();
		ctx.fillStyle = "#3a3024";
		ctx.fillRect(o.x, o.y, 320, 240);
		ctx.fillStyle = "#4a3828";
		for (let i = 0; i < 6; i++) ctx.fillRect(o.x + 8, o.y + 20 + i * 34, 304, 3);
		paintProp("logs", o.x + 78, o.y + 150, 56);
		ctx.fillStyle = "#efe6d4";
		ctx.font = "700 16px Source Sans 3, sans-serif";
		ctx.fillText(lootedChests.has(92001) ? "Wood taken" : "Split wood", o.x + 36, o.y + 168);
		paintProp("bench", o.x + 236, o.y + 156, 57);
		ctx.fillStyle = "#efe6d4";
		ctx.fillText("Bench", o.x + 210, o.y + 168);
		paintProp("icon-bomb", o.x + 196, o.y + 78, 32);
		paintProp("icon-fuel", o.x + 236, o.y + 78, 32);
		paintProp("icon-fence", o.x + 276, o.y + 78, 32);
		ctx.fillText("At the bench", o.x + 188, o.y + 96);
		paintExitDoor();
		paintHeroInRoom();
	}
	function drawBunker() {
		if (!inside || !ctx) return;
		const dpr = canvas.width / Math.max(1, viewW);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.fillStyle = "#0e120f";
		ctx.fillRect(0, 0, viewW, viewH);
		applyRoomTransform(dpr);
		const o = roomOrigin();
		const art = images.get("bunker-room");
		if (art) {
			ctx.drawImage(art, o.x, o.y, 320, 240);
		} else {
			ctx.fillStyle = "#243028";
			ctx.fillRect(o.x, o.y, 320, 240);
		}
		ctx.fillStyle = "rgba(12, 10, 8, 0.45)";
		ctx.fillRect(o.x, o.y, 320, 22);
		paintRoomTitle("Jack's cache");
		ctx.font = "600 12px Source Sans 3, sans-serif";
		ctx.textAlign = "right";
		ctx.fillStyle = "#e6c56a";
		ctx.fillText("Shut the hatch when you leave.", o.x + 310, o.y + 34);
		ctx.textAlign = "left";
		ctx.font = "700 16px Source Sans 3, sans-serif";
		ctx.fillStyle = "#efe6d4";
		ctx.fillText(lootedChests.has(93012) ? "Meds gone" : "Trauma kit", o.x + 18, o.y + 78);
		ctx.fillText(lootedChests.has(93011) ? "Rig gone" : "Plate rig", o.x + 18, o.y + 132);
		ctx.fillText("Radio", o.x + 140, o.y + 70);
		ctx.fillText(lootedChests.has(93010) ? "Rack empty" : "Scoped rifle", o.x + 200, o.y + 78);
		ctx.fillText(lootedChests.has(93013) ? "Crate empty" : "Sealed shells", o.x + 200, o.y + 148);
		ctx.fillText("Water", o.x + 134, o.y + 176);
		paintExitDoor();
		paintHeroInRoom();
	}
	function paintHeroInRoom() {
		if (!inside || !ctx || !player) return;
		const o = roomOrigin();
		const pose = heroActionPose();
		const name = pose ? pose.name : heroKey();
		const img = images.get(name);
		if (!img) return;
		const src = heroSource(name, img);
		const rows = 8;
		const cols = sheetCols(img);
		const sw = img.width / cols;
		const sh = img.height / rows;
		const dh = (roomDims().farm ? 124 : 110) * heroScale(name);
		const dw = dh * (sw / sh);
		const col = (pose ? pose.frame : player.frame) % cols;
		const row = facingRow(player.dir, rows, !!img.diag4);
		ctx.drawImage(src, col * sw, row * sh, sw, sh, o.x + inside.rx - dw / 2, o.y + inside.ry - dh * (img.feet ? img.feet[facingRow(player.dir, rows, !!img.diag4) * cols + (player.frame % cols)] : img.foot ?? .92), dw, dh);
	}
	function drawRoom() {
		if (!inside || !ctx) return;
		const prop = world?.props.find((p) => p.id === inside.id);
		if (prop?.kind === "farmhouse") {
			drawFarmhouse();
			return;
		}
		if (prop?.kind === "barn") {
			drawBarn();
			return;
		}
		if (prop?.kind === "hatch") {
			drawBunker();
			return;
		}
		const dpr = canvas.width / Math.max(1, viewW);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.fillStyle = "#14120e";
		ctx.fillRect(0, 0, viewW, viewH);
		applyRoomTransform(dpr);
		const o = roomOrigin();
		ctx.fillStyle = "#3c3428";
		ctx.fillRect(o.x, o.y, 320, 240);
		ctx.strokeStyle = "#6a5844";
		ctx.lineWidth = 3;
		ctx.strokeRect(o.x + 1.5, o.y + 1.5, 317, 237);
		paintExitDoor();
		const taken = lootedChests.has(inside.id);
		ctx.fillStyle = taken ? "#4a453c" : "#a56b2e";
		ctx.fillRect(o.x + 132, o.y + 46, 56, 40);
		ctx.fillStyle = "#efe6d4";
		ctx.fillText(taken ? "Empty" : "Chest", o.x + 140, o.y + 70);
		const pose = heroActionPose();
		const name = pose ? pose.name : heroKey();
		const img = images.get(name);
		if (img && player) {
			const src = heroSource(name, img);
			const rows = 8;
			const cols = sheetCols(img);
			const sw = img.width / cols;
			const sh = img.height / rows;
			const dh = 110 * heroScale(name);
			const dw = dh * (sw / sh);
			const col = (pose ? pose.frame : player.frame) % cols;
			const row = facingRow(player.dir, rows, !!img.diag4);
			ctx.drawImage(src, col * sw, row * sh, sw, sh, o.x + inside.rx - dw / 2, o.y + inside.ry - dh * (img.feet ? img.feet[facingRow(player.dir, rows, !!img.diag4) * cols + (player.frame % cols)] : img.foot ?? .92), dw, dh);
		}
	}
	var groundPat = new Map();
	function groundFill(tile, seed = 0, roadY = false) {
		// v15.4: roads running along world Y use the rotated ground-road-y variants (ruts follow the road)
		const name = roadY && tile === 2 && TERRAIN.variants.get("ground-road-y")?.length ? terrainPick("ground-road-y", seed) : terrainPick([
			"ground-mat-dirt",
			"ground-mat-scrub",
			"ground-mat-road",
			"ground-mat-rubble",
			"ground-mat-snow"
		][tile] ?? "ground-mat-dirt", seed);
		const cached = groundPat.get(name);
		if (cached) return cached;
		const img = images.get(name);
		const flat = [
			"#6e532f",
			"#4d5c32",
			"#8a7d6c",
			"#4a4338",
			"#e4e1d6"
		][tile] ?? "#6e532f";
		if (!img) return flat;
		const pat = ctx.createPattern(img, "repeat");
		if (!pat) return flat;
		if (typeof pat.setTransform === "function") pat.setTransform(new DOMMatrix());
		groundPat.set(name, pat);
		return pat;
	}
	function hexInside(wx, wy) {
		const ax = Math.abs(wx - HEX_CX);
		const ay = Math.abs(wy - HEX_CY);
		const s3 = 1.7320508075688772;
		return Math.min(HEX_R - (ay + ax / s3), s3 * .5 * HEX_R - ax);
	}
	function edgeWave(tx, ty) {
		const n = (ix, iy) => {
			let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263);
			h = Math.imul(h ^ h >>> 13, 1274126177);
			return ((h >>> 0) % 1000) / 999;
		};
		const sample = (x, y, ox, oy) => {
			const x0 = Math.floor(x);
			const y0 = Math.floor(y);
			const fx = x - x0;
			const fy = y - y0;
			const sx = fx * fx * (3 - 2 * fx);
			const sy = fy * fy * (3 - 2 * fy);
			const a = n(x0 + ox, y0 + oy);
			const b = n(x0 + 1 + ox, y0 + oy);
			const c = n(x0 + ox, y0 + 1 + oy);
			const d = n(x0 + 1 + ox, y0 + 1 + oy);
			return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
		};
		const low = sample(tx * .07, ty * .07, 0, 0);
		const high = sample(tx * .19, ty * .19, 19, 7);
		return (low - .5) * 1.35 + (high - .5) * .65;
	}
	function landFadeAt(wx, wy, tile) {
		let d = hexInside(wx, wy) + edgeWave(wx, wy) * 4; // v15.4: wider, wobblier fade (was 2.4 / 3.6)
		if (tile === 2) d += 2;
		if (d >= 6) return 1;
		if (d <= 0) return 0;
		const t = d / 6;
		return t * t * (3 - 2 * t);
	}
	function paintGroundRect(x, y, w, h, tile, alpha, snow, roadY = false) {
		if (alpha < .02 || w <= 0 || h <= 0) return;
		const pad = alpha > .98 ? 1.5 : 0;
		ctx.globalAlpha = alpha;
		ctx.fillStyle = groundFill(tile, TERRAIN.variants.size ? Math.floor(x / TILE) * 131 + Math.floor(y / TILE) * 977 : 0, roadY);
		ctx.fillRect(x, y, w + pad, h + pad);
		if (snow) {
			ctx.globalAlpha = alpha * .52;
			ctx.fillStyle = groundFill(4);
			ctx.fillRect(x, y, w + pad, h + pad);
		}
	}
	/** v15.4: per-tile variant fills are batched into one path per texture (one fill call each, not one per tile). */
	const groundQueue = new Map();
	function queueGroundRect(x, y, tile, alpha, snow, roadY) {
		const fill = groundFill(tile, Math.floor(x / TILE) * 131 + Math.floor(y / TILE) * 977, roadY);
		let q = groundQueue.get(fill);
		if (!q) { q = new Map(); groundQueue.set(fill, q); }
		const k2 = `${alpha}|${snow ? 1 : 0}`;
		let list = q.get(k2);
		if (!list) { list = []; q.set(k2, list); }
		list.push(x, y);
	}
	function flushGroundQueue() {
		for (const [fill, byAlpha] of groundQueue) for (const [k2, list] of byAlpha) {
			const [as, ss] = k2.split("|"), alpha = +as, snow = ss === "1";
			ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.beginPath();
			const pad = alpha > .98 ? 1.5 : 0;
			for (let i = 0; i < list.length; i += 2) ctx.rect(list[i], list[i + 1], 64 + pad, 64 + pad);
			ctx.fill();
			if (snow) { ctx.globalAlpha = alpha * .52; ctx.fillStyle = groundFill(4); ctx.fill(); }
		}
		groundQueue.clear();
	}
	/** v15.4: a road tile runs along world Y when its road neighbours are above/below rather than left/right. */
	function roadRunsY(tx, ty) {
		const t = (x, y) => x >= 0 && y >= 0 && x < 156 && y < 156 && world.tiles[y * 156 + x] === 2 ? 1 : 0;
		return t(tx, ty - 1) + t(tx, ty + 1) > t(tx - 1, ty) + t(tx + 1, ty);
	}
	/** v15.4: no square ground edges. Where two ground types meet, the "stronger" one (grass over road edges,
	 * dirt over pavement) spills a few px into its neighbour as a wobbly, soft-edged blob painted with its own
	 * world-anchored texture. The wobble comes from edgeWave in world space, so it is continuous across tiles. */
	const SPILL_RANK = [2, 3, 0, 1, -1]; // dirt, scrub, road, rubble, snow
	const spillQ = new Map();
	function paintGroundSpill(tx0, ty0, tx1, ty1) {
		const SIDES = [[0, -1], [1, 0], [0, 1], [-1, 0]];
		for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
			const i = ty * 156 + tx;
			const tile = world.tiles[i] ?? 0;
			if (explored[i] !== 1 || tile < 0 || tile > 3) continue;
			if (landFadeAt(tx + .5, ty + .5, tile) < .98) continue;
			for (const [dx, dy] of SIDES) {
				const nx = tx + dx, ny = ty + dy;
				if (nx < 0 || ny < 0 || nx >= 156 || ny >= 156) continue;
				const j = ny * 156 + nx, nt = world.tiles[j] ?? 0;
				if (nt === tile || nt < 0 || nt > 3 || explored[j] !== 1 || SPILL_RANK[nt] <= SPILL_RANK[tile]) continue;
				const fog = visible[j] !== 1 ? .42 : 1;
				const fill = groundFill(nt, nx * 131 + ny * 977, nt === 2 && roadRunsY(nx, ny));
				// edge runs along the shared side; depth goes into this tile
				const ex = dx === 1 ? tx * 64 + 64 : tx * 64, ey = dy === 1 ? ty * 64 + 64 : ty * 64;
				const along = dx === 0 ? [1, 0] : [0, 1], inward = [-dx, -dy];
				for (const [layer, alpha] of [[1, .4], [.5, .6]]) {
					const key = `${alpha * fog}`;
					let byFill = spillQ.get(key); if (!byFill) { byFill = new Map(); spillQ.set(key, byFill); }
					let pts = byFill.get(fill); if (!pts) { pts = []; byFill.set(fill, pts); }
					const poly = []; pts.push(poly);
					// start/end a little past the tile corners so neighbouring spills overlap smoothly
					for (let s = -8; s <= 72; s += 16) {
						const wx = ex + along[0] * s, wy = ey + along[1] * s;
						const depth = Math.max(0, (14 + edgeWave(wx / 6, wy / 6) * 16) * layer) * (s < 0 || s > 64 ? .3 : 1);
						const px = wx + inward[0] * depth, py = wy + inward[1] * depth;
						if (s === -8) poly.push(ex + along[0] * s, ey + along[1] * s);
						poly.push(px, py);
					}
					poly.push(ex + along[0] * 72, ey + along[1] * 72);
				}
			}
		}
		for (const [a, byFill] of spillQ) for (const [fill, polys] of byFill) {
			ctx.globalAlpha = +a; ctx.fillStyle = fill; ctx.beginPath();
			for (const poly of polys) { ctx.moveTo(poly[0], poly[1]); for (let i = 2; i < poly.length; i += 2) ctx.lineTo(poly[i], poly[i + 1]); ctx.closePath(); }
			ctx.fill();
		}
		spillQ.clear();
		ctx.globalAlpha = 1;
	}
	/** v15.5 terrain: the ground is baked into 16x16-tile chunks (1024 world px at half resolution) in which
	 * grass / bare dirt / dirt track / gravel shoulder / asphalt / rubble / snow blend along wavy, noise-warped
	 * edges (never along tile or hex lines). Every texture variant is mixed in with rotations and flips, then a
	 * seeded scatter of pebbles, cracks, potholes, ruts, standing grass tufts and faint graffiti is painted on,
	 * and the result gets the muted overcast regrade. Chunks are drawn through the same isometric matrix as
	 * everything else, so details are foreshortened with the view; pebbles and tufts get relief (shadow to the
	 * lower right, blades standing up on screen). Chunks are cached (LRU) and rebaked only if their tiles change. */
	const CH_T = 16, CH_W = CH_T * 64, CH_S = .5, CH_PX = CH_W * CH_S, CH_MAX = 20;
	const chunkCache = new Map();
	let chunkWorld = null;
	const v155Pats = new Map();
	function v155Rng(seed) { let s = seed >>> 0 || 1; return () => { s = Math.imul(s ^ s >>> 15, 2246822519) + 0x9e3779b9 >>> 0; s ^= s >>> 13; return (s >>> 0) / 4294967296; }; }
	function v155Img(mat, v) {
		const base = ["ground-mat-dirt", "ground-mat-scrub", "ground-mat-road", "ground-mat-rubble", "ground-mat-snow"][mat];
		const list = TERRAIN.variants.get(base);
		const name = list?.length ? list[v % list.length] : base;
		return images.get(name) ?? null;
	}
	/** A pattern for material/variant with its own rotation+flip (k = 0..7), in chunk-baking space. */
	function v155Pat(g, key, img, k) {
		const id = `${key}|${k}`;
		let p = v155Pats.get(id);
		if (p === undefined) {
			p = img ? g.createPattern(img, "repeat") : null;
			v155Pats.set(id, p);
		}
		if (p && typeof p.setTransform === "function") {
			const m = new DOMMatrix();
			m.scaleSelf(CH_S * (k & 4 ? -1 : 1), CH_S); m.rotateSelf((k & 3) * 90);
			p.setTransform(m);
		}
		return p;
	}
	let v155Asphalt = null;
	function asphaltImg() {
		if (v155Asphalt) return v155Asphalt;
		const src = v155Img(3, 1) ?? v155Img(2, 0);
		if (!src) return null;
		const c = document.createElement("canvas"); c.width = c.height = 256;
		const g = c.getContext("2d");
		g.fillStyle = "#4b4c4e"; g.fillRect(0, 0, 256, 256);
		g.globalAlpha = .55; g.filter = "grayscale(1) contrast(.7) brightness(.85)"; g.drawImage(src, 0, 0, 256, 256); g.filter = "none";
		const r = v155Rng(77); g.globalAlpha = .25;
		for (let i = 0; i < 2200; i++) { const v = 60 + r() * 70 | 0; g.fillStyle = `rgb(${v},${v},${v + 3})`; g.fillRect(r() * 256, r() * 256, 1.2, 1.2); }
		v155Asphalt = c; return c;
	}
	/** Material of a world point (tile units), warped by smooth noise so borders wander. 0 dirt field, 1 grass,
	 * 2 dirt track, 3 rubble, 4 snow, 6 asphalt, -1 nothing. */
	function v155MatAt(tx, ty, asph) {
		const wx = tx + edgeWave(tx * 2.3, ty * 2.3) * .8 + edgeWave(tx * 7.1 + 5, ty * 7.1) * .3, wy = ty + edgeWave(ty * 2.3 + 40, tx * 2.3 + 17) * .8 + edgeWave(ty * 7.1 + 9, tx * 7.1 + 3) * .3;
		const ix = Math.floor(wx), iy = Math.floor(wy);
		if (ix < 0 || iy < 0 || ix > 155 || iy > 155) return -1;
		const t = world.tiles[iy * 156 + ix];
		if (t === 2) return inFarm(ix, iy) ? 4 : asph[iy * 156 + ix] ? 6 : 2;
		if (t === 5 && mapId === 0 && v197Wet(ix, iy)) return 7; // v15.9.7: lake / river water inside the map
		return t >= 0 && t <= 4 ? t : -1;
	}
	/** v15.9.7: VOID tiles well inside the hex on map 0 are water (Great Moose Lake, the Kennebec, the Sebasticook). */
	function v197Wet(ix, iy) {
		const dx = Math.abs(ix - HEX_CX), dy = Math.abs(iy - HEX_CY), R = HEX_R - 3;
		return dx <= Math.sqrt(3) / 2 * R && dy <= R - dx / Math.sqrt(3);
	}
	let v155AsphMap = null;
	function v155Asph() {
		if (v155AsphMap && v155AsphMap.w === world) return v155AsphMap.a;
		// paved where the road runs near town lots (rubble) or is part of an edge highway; elsewhere a dirt track
		const a = new Uint8Array(156 * 156);
		for (let y = 0; y < 156; y++) for (let x = 0; x < 156; x++) {
			if (world.tiles[y * 156 + x] !== 2) continue;
			let near = x < 3 || y < 3 || x > 152 || y > 152;
			for (let dy = -4; dy <= 4 && !near; dy++) for (let dx = -4; dx <= 4; dx++) {
				const nx = x + dx, ny = y + dy;
				if (nx >= 0 && ny >= 0 && nx < 156 && ny < 156 && world.tiles[ny * 156 + nx] === 3) { near = true; break; }
			}
			a[y * 156 + x] = near ? 1 : 0;
		}
		v155AsphMap = { w: world, a }; return a;
	}
	function v155Sig(cx, cy) {
		let h = 0;
		for (let y = cy * CH_T - 1; y <= cy * CH_T + CH_T; y++) for (let x = cx * CH_T - 1; x <= cx * CH_T + CH_T; x++) {
			const t = x < 0 || y < 0 || x > 155 || y > 155 ? 9 : world.tiles[y * 156 + x];
			h = Math.imul(h ^ (t + 3), 16777619);
		}
		return h;
	}
	function bakeChunk(cx, cy) {
		const asph = v155Asph();
		const BW = CH_PX + 64, PADT = 1, SPAN = CH_T + 2; // bake one tile of margin on every side, crop after (no seams)
		const c = document.createElement("canvas"); c.width = c.height = BW;
		const g = c.getContext("2d");
		const M = 144, step = SPAN / M; // mask grid: 8 world px per cell
		const mats = new Int8Array(M * M);
		const present = new Set();
		for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
			const m = v155MatAt(cx * CH_T - PADT + (i + .5) * step, cy * CH_T - PADT + (j + .5) * step, asph);
			mats[j * M + i] = m; if (m >= 0) present.add(m);
		}
		const mask = document.createElement("canvas"); mask.width = mask.height = M;
		const mg = mask.getContext("2d");
		const layer = document.createElement("canvas"); layer.width = layer.height = BW;
		const lg = layer.getContext("2d");
		const seed = cx * 7919 + cy * 104729;
		const fillMat = (gg, mat, s) => {
			// all variants, each rotated/flipped, mixed by big soft noise blobs
			if (mat === 7) {
				// painted water: deep slate-green with soft light and dark drifts and short ripple strokes
				gg.globalAlpha = 1; gg.fillStyle = "#2f4a4e"; gg.fillRect(0, 0, BW, BW);
				const wr = v155Rng(s * 17 + 7);
				for (let b = 0; b < 10; b++) {
					const x = wr() * BW, y = wr() * BW, rad = 60 + wr() * 140, gr = gg.createRadialGradient(x, y, 0, x, y, rad);
					const lite = wr() < .5;
					gr.addColorStop(0, lite ? "rgba(92,124,124,.45)" : "rgba(22,36,40,.5)"); gr.addColorStop(1, "rgba(0,0,0,0)");
					gg.fillStyle = gr; gg.fillRect(x - rad, y - rad, rad * 2, rad * 2);
				}
				gg.lineWidth = 1.2;
				for (let k = 0; k < 140; k++) {
					const x = wr() * BW, y = wr() * BW, L = 6 + wr() * 14;
					gg.globalAlpha = .18 + wr() * .2; gg.strokeStyle = wr() < .7 ? "#9fb8b4" : "#1c2c30";
					gg.beginPath(); gg.moveTo(x, y); gg.quadraticCurveTo(x - L * .5, y - L * .5 - 2, x - L, y - L); gg.stroke();
				}
				gg.globalAlpha = 1;
				return;
			}
			const img0 = mat === 6 ? asphaltImg() : v155Img(mat === 2 ? 0 : mat, 0);
			gg.globalAlpha = 1; gg.fillStyle = (mat === 6 ? v155Pat(gg, "asph", img0, s & 7) : v155Pat(gg, `${mat}-0`, img0, s & 7)) ?? "#555"; gg.fillRect(0, 0, BW, BW);
			if (mat === 6) return;
			const base = mat === 2 ? 0 : mat;
			const n = TERRAIN.variants.get(["ground-mat-dirt", "ground-mat-scrub", "ground-mat-road", "ground-mat-rubble", "ground-mat-snow"][base])?.length ?? 1;
			const r = v155Rng(s * 31 + mat);
			for (let v = 1; v < n; v++) {
				const p = v155Pat(gg, `${base}-${v}`, v155Img(base, v), (v + s) & 7);
				if (!p) continue;
				gg.fillStyle = p;
				for (let b = 0; b < 3; b++) {
					const x = r() * BW, y = r() * BW, rad = 80 + r() * 160;
					const gr = gg.createRadialGradient(x, y, 0, x, y, rad);
					gr.addColorStop(0, "rgba(0,0,0,.95)"); gr.addColorStop(1, "rgba(0,0,0,0)");
					gg.save(); gg.globalCompositeOperation = "source-over"; gg.globalAlpha = .9;
					gg.beginPath(); gg.arc(x, y, rad, 0, 7); gg.clip(); gg.globalAlpha = .55 + r() * .4; gg.fillRect(x - rad, y - rad, rad * 2, rad * 2); gg.restore();
				}
			}
			if (mat === 2) { gg.globalAlpha = .28; gg.fillStyle = "#5a4a38"; gg.fillRect(0, 0, BW, BW); gg.globalAlpha = 1; }
		};
		const order = [7, 1, 0, 3, 2, 6, 4];
		g.imageSmoothingEnabled = true;
		for (const mat of order) {
			if (!present.has(mat)) continue;
			const id = mg.createImageData(M, M);
			for (let k = 0; k < M * M; k++) if (mats[k] === mat) id.data[k * 4 + 3] = 255;
			mg.putImageData(id, 0, 0);
			lg.globalCompositeOperation = "source-over"; lg.clearRect(0, 0, BW, BW);
			fillMat(lg, mat, seed + mat);
			lg.globalCompositeOperation = "destination-in";
			lg.filter = "blur(6px)"; lg.drawImage(mask, 0, 0, BW, BW); lg.filter = "none";
			lg.globalCompositeOperation = "source-over";
			g.drawImage(layer, 0, 0);
			if (mat === 2 || mat === 6) {
				// gravel shoulder: a wider, fainter halo of dirt+gravel around roads
				lg.clearRect(0, 0, BW, BW); fillMat(lg, 0, seed + 9);
				lg.globalCompositeOperation = "destination-in"; lg.filter = "blur(9px)"; lg.drawImage(mask, 0, 0, BW, BW); lg.filter = "none"; lg.globalCompositeOperation = "source-over";
				g.save(); g.globalCompositeOperation = "destination-over"; g.drawImage(layer, 0, 0); g.restore();
			}
		}
		// grass: bare patches
		const r = v155Rng(seed ^ 0x5bd1e995);
		const at = (px, py) => { const i = Math.min(M - 1, Math.max(0, px / BW * M | 0)), j = Math.min(M - 1, Math.max(0, py / BW * M | 0)); return mats[j * M + i]; };
		const dirtP = v155Pat(g, "0-0", v155Img(0, 1) ?? v155Img(0, 0), seed & 7);
		if (dirtP) for (let i = 0; i < 26; i++) {
			const x = r() * BW, y = r() * BW; if (at(x, y) !== 1) continue;
			const rad = 14 + r() * 34, gr = g.createRadialGradient(x, y, rad * .2, x, y, rad);
			g.save(); g.beginPath(); for (let a = 0; a < 6.28; a += .5) { const rr = rad * (.7 + r() * .4); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * .8); } g.closePath();
			g.clip(); g.globalAlpha = .5 + r() * .3; g.fillStyle = dirtP; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); g.restore(); void gr;
		}
		// dirt track ruts (lengthwise along the road direction)
		for (let i = 0; i < 260; i++) {
			const x = r() * BW, y = r() * BW; if (at(x, y) !== 2) continue;
			const ty = Math.floor(cy * CH_T - PADT + y / BW * SPAN), tx = Math.floor(cx * CH_T - PADT + x / BW * SPAN);
			const alongY = roadRunsY(tx, ty);
			g.globalAlpha = .16; g.strokeStyle = "#3a2e22"; g.lineWidth = 2 + r() * 2; g.beginPath();
			const off = (r() < .5 ? -1 : 1) * 7;
			if (alongY) { g.moveTo(x + off, y - 12); g.quadraticCurveTo(x + off + r() * 3, y, x + off, y + 12); } else { g.moveTo(x - 12, y + off); g.quadraticCurveTo(x, y + off + r() * 3, x + 12, y + off); }
			g.stroke();
		}
		// asphalt: cracks, potholes, faint graffiti spots
		for (let i = 0; i < 40; i++) {
			let x = r() * BW, y = r() * BW; if (at(x, y) !== 6) continue;
			g.globalAlpha = .45; g.strokeStyle = "#26272a"; g.lineWidth = .9; g.beginPath(); g.moveTo(x, y);
			for (let k = 0; k < 6; k++) { x += (r() - .5) * 14; y += (r() - .5) * 14; g.lineTo(x, y); }
			g.stroke();
		}
		for (let i = 0; i < 6; i++) {
			const x = r() * BW, y = r() * BW; if (at(x, y) !== 6) continue;
			const rx = 4 + r() * 7; g.globalAlpha = .55; g.fillStyle = "#2e2c29"; g.beginPath(); g.ellipse(x, y, rx, rx * .8, r() * 3, 0, 7); g.fill();
			g.globalAlpha = .35; g.fillStyle = "#6b6a66"; g.beginPath(); g.ellipse(x - 1, y - 1, rx * .9, rx * .6, 0, 3.4, 6); g.fill();
		}
		if (r() < .45) for (let tries = 0; tries < 20; tries++) {
			const x = r() * BW, y = r() * BW; if (at(x, y) !== 6) continue;
			const col = ["rgba(150,62,58,", "rgba(72,92,140,", "rgba(190,190,180,"][r() * 3 | 0];
			g.save(); g.filter = "blur(1px)"; g.lineWidth = 2.2; g.lineCap = "round";
			for (let k = 0; k < 4; k++) { g.strokeStyle = col + (.18 + r() * .1) + ")"; g.beginPath(); g.arc(x + k * 5, y + (r() - .5) * 4, 4 + r() * 5, r() * 3, 3 + r() * 3); g.stroke(); }
			g.restore(); break;
		}
		// pebbles with relief (on track, shoulder edges, field dirt, rubble); shadow falls screen-down-right
		for (let i = 0; i < 520; i++) {
			const x = r() * BW, y = r() * BW, m = at(x, y);
			if (!(m === 2 || m === 0 || m === 3 || (m === 1 && r() < .08))) continue;
			const s = .8 + r() * 1.6, v = 92 + r() * 60 | 0;
			g.globalAlpha = .45; g.fillStyle = "#1e1a16"; g.beginPath(); g.ellipse(x + s * .9, y + s * .1, s, s * .8, 0, 0, 7); g.fill();
			g.globalAlpha = 1; g.fillStyle = `rgb(${v},${v - 4},${v - 12})`; g.beginPath(); g.ellipse(x, y, s, s * .8, r() * 3, 0, 7); g.fill();
			g.fillStyle = `rgba(235,232,222,.5)`; g.fillRect(x - s * .6, y - s * .6, s * .5, s * .4);
		}
		// grass tufts: blades along world (-1,-1), which stands straight up on screen
		for (let i = 0; i < 700; i++) {
			const x = r() * BW, y = r() * BW; if (at(x, y) !== 1) continue;
			const n = 3 + r() * 4 | 0, hue = r();
			g.globalAlpha = .5; g.strokeStyle = hue < .5 ? "#4e5a36" : hue < .85 ? "#7a7448" : "#8c7f5a"; g.lineWidth = .8;
			g.beginPath();
			for (let k = 0; k < n; k++) { const L = 3 + r() * 4, sp = (r() - .5) * 3; g.moveTo(x + k * .6, y - k * .6); g.lineTo(x + k * .6 - L + sp, y - k * .6 - L - sp); }
			g.stroke();
		}
		// neglect: weeds pushing through the pavement, moss creeping over it, dead leaf litter everywhere
		for (let i = 0; i < 260; i++) {
			const x = r() * BW, y = r() * BW; if (at(x, y) !== 6) continue;
			g.globalAlpha = .35; g.strokeStyle = r() < .6 ? "#55603a" : "#7a7244"; g.lineWidth = .8; g.beginPath();
			for (let k = 0; k < 4; k++) { const L = 2 + r() * 4; g.moveTo(x + k, y - k); g.lineTo(x + k - L, y - k - L + (r() - .5) * 2); }
			g.stroke();
		}
		for (let i = 0; i < 14; i++) {
			const x = r() * BW, y = r() * BW; if (at(x, y) !== 6) continue;
			const rad = 6 + r() * 16, gr = g.createRadialGradient(x, y, 0, x, y, rad);
			gr.addColorStop(0, "rgba(56,74,54,.4)"); gr.addColorStop(1, "rgba(56,74,54,0)");
			g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
		}
		for (let i = 0; i < 420; i++) {
			const x = r() * BW, y = r() * BW, m = at(x, y); if (m < 0 || m === 4) continue;
			g.globalAlpha = .4 + r() * .25; g.fillStyle = ["#7a4a2a", "#8a6a3a", "#5e4a36", "#6e3e2a"][r() * 4 | 0];
			g.beginPath(); g.ellipse(x, y, 1.6 + r() * 1.4, .9 + r() * .6, r() * 3, 0, 7); g.fill();
		}
		g.globalAlpha = 1;
		// overcast regrade: ~70% saturation, slightly cool, soft
		const out = document.createElement("canvas"); out.width = out.height = BW;
		const og = out.getContext("2d");
		og.filter = "saturate(.7) brightness(.96) contrast(.95) blur(.4px)"; og.drawImage(c, 0, 0); og.filter = "none";
		og.globalCompositeOperation = "multiply"; og.fillStyle = "#e4e8ee"; og.fillRect(0, 0, BW, BW);
		// keep the hex island fade (and holes where nothing is drawn)
		og.globalCompositeOperation = "destination-in"; og.drawImage(c, 0, 0);
		const fa = mg.createImageData(M, M);
		for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
			const tx = cx * CH_T - PADT + (i + .5) * step, ty = cy * CH_T - PADT + (j + .5) * step;
			const t = world.tiles[Math.min(155, ty | 0) * 156 + Math.min(155, tx | 0)];
			fa.data[(j * M + i) * 4 + 3] = 255 * landFadeAt(tx, ty, t) | 0;
		}
		mg.putImageData(fa, 0, 0);
		og.filter = "blur(2px)"; og.drawImage(mask, 0, 0, BW, BW); og.filter = "none";
		og.globalCompositeOperation = "source-over";
		const fin = document.createElement("canvas"); fin.width = fin.height = CH_PX;
		fin.getContext("2d").drawImage(out, -32, -32);
		return fin;
	}
	let fogMasks = null;
	/** Fog of war as two soft 1-px-per-tile masks (explored, out-of-sight), rebuilt only when they change, so the
	 * edge of what you've seen is a soft wavy fade instead of tile steps. */
	function v155Fog() {
		let h = 0;
		for (let i = 0; i < 156 * 156; i++) h = Math.imul(h ^ (explored[i] * 2 + visible[i] + 1), 16777619) + i | 0;
		if (fogMasks && fogMasks.h === h && fogMasks.w === world) return fogMasks;
		const mk = (f) => {
			const raw = document.createElement("canvas"); raw.width = raw.height = 156;
			const g = raw.getContext("2d"), id = g.createImageData(156, 156);
			for (let i = 0; i < 156 * 156; i++) id.data[i * 4 + 3] = f(i);
			g.putImageData(id, 0, 0);
			const c = document.createElement("canvas"); c.width = c.height = 312;
			const cg = c.getContext("2d"); cg.filter = "blur(1.2px)"; cg.drawImage(raw, 0, 0, 312, 312); cg.filter = "none";
			return c;
		};
		fogMasks = { h, w: world, ex: mk((i) => explored[i] === 1 ? 255 : 0), dim: mk((i) => explored[i] === 1 && visible[i] !== 1 ? 140 : 0) };
		return fogMasks;
	}
	function drawGroundChunks(tx0, ty0, tx1, ty1) {
		if (chunkWorld !== world) { chunkCache.clear(); chunkWorld = world; v155AsphMap = null; fogMasks = null; }
		const fm = v155Fog();
		ctx.globalAlpha = 1;
		const smooth = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = true;
		let baked = 0;
		for (let cy = Math.floor(ty0 / CH_T); cy <= Math.floor(ty1 / CH_T); cy++) for (let cx = Math.floor(tx0 / CH_T); cx <= Math.floor(tx1 / CH_T); cx++) {
			const key = cy * 64 + cx, sig = v155Sig(cx, cy);
			let e = chunkCache.get(key);
			if (!e || e.sig !== sig) {
				if (baked >= 2 && e) { /* spread rebakes over frames */ } else { e = { sig, c: bakeChunk(cx, cy) }; baked++; }
			}
			chunkCache.delete(key); chunkCache.set(key, e);
			// fog: cut to explored (soft) and dim what is out of sight; recomposited only when fog or tiles change
			if (e.fh !== fm.h || e.fc !== e.c) {
				if (!e.f) { e.f = document.createElement("canvas"); e.f.width = e.f.height = CH_PX; }
				const sg = e.f.getContext("2d");
				sg.globalCompositeOperation = "copy"; sg.drawImage(e.c, 0, 0);
				const mx = cx * CH_T * 2, my = cy * CH_T * 2, ms = CH_T * 2;
				sg.globalCompositeOperation = "destination-in"; sg.drawImage(fm.ex, mx, my, ms, ms, 0, 0, CH_PX, CH_PX);
				sg.globalCompositeOperation = "source-atop"; sg.drawImage(fm.dim, mx, my, ms, ms, 0, 0, CH_PX, CH_PX);
				sg.globalCompositeOperation = "source-over";
				e.fh = fm.h; e.fc = e.c;
			}
			ctx.drawImage(e.f, cx * CH_W, cy * CH_W, CH_W, CH_W);
		}
		while (chunkCache.size > CH_MAX) chunkCache.delete(chunkCache.keys().next().value);
		ctx.imageSmoothingEnabled = smooth;
	}
	/** Screen-space depth cue for the oblique view: distant (top) ground hazes toward the overcast sky,
	 * near (bottom) ground sits a touch darker. */
	function drawGroundDepth() {
		const dpr = canvas.width / Math.max(1, viewW);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const gr = ctx.createLinearGradient(0, 0, 0, viewH);
		gr.addColorStop(0, "rgba(196,202,210,.22)"); gr.addColorStop(.42, "rgba(196,202,210,0)");
		gr.addColorStop(.75, "rgba(18,22,28,0)"); gr.addColorStop(1, "rgba(18,22,28,.16)");
		ctx.fillStyle = gr; ctx.fillRect(0, 0, viewW, viewH);
	}
	/** v15.9.4: the static ground (painted terrain chunks, roads, the frozen stream) is drawn once into a screen-sized
	 * layer with a margin and blitted 1:1 with an offset as the camera moves. It is redrawn only when the camera
	 * leaves the margin, the zoom or screen size changes, the map changes, or every ~1.2 s (fog of war). */
	let gLayer = null, gCtx = null, gKey = "", gCX = 0, gCY = 0, gT = -1e9;
	const G_M = 160;
	function drawGroundCached(dcx, dcy, dpr) {
		if (!world) return;
		const W = Math.ceil((viewW + G_M * 2) * dpr), H = Math.ceil((viewH + G_M * 2) * dpr);
		const key = `${W}x${H}|${zoom}|${dpr}|${mapId}|${v155Fog().h}`;
		const ox = (dcx - gCX) * zoom, oy = (dcy - gCY) * zoom;
		if (!gLayer || gKey !== key || gW !== world || Math.abs(ox) > G_M * .8 || Math.abs(oy) > G_M * .8 || renderNow - gT > 3000 || renderNow < gT) {
			if (!gLayer) { gLayer = document.createElement("canvas"); gCtx = gLayer.getContext("2d"); }
			if (gLayer.width !== W) gLayer.width = W;
			if (gLayer.height !== H) gLayer.height = H;
			gCtx.setTransform(1, 0, 0, 1, 0, 0); gCtx.clearRect(0, 0, W, H);
			gCtx.fillStyle = "#101410"; gCtx.fillRect(0, 0, W, H);
			gKey = key; gCX = dcx; gCY = dcy; gT = renderNow; gW = world;
			const main = ctx; ctx = gCtx;
			const vw0 = viewW, vh0 = viewH;
			try {
				// draw as if the screen were G_M bigger on every side, centred on the same camera
				viewW = vw0 + G_M * 2; viewH = vh0 + G_M * 2;
				gDpr = dpr;
				drawGround(dcx - G_M, dcy - G_M);
			} finally { viewW = vw0; viewH = vh0; ctx = main; gDpr = 0; }
		}
		const ox2 = (dcx - gCX) * zoom, oy2 = (dcy - gCY) * zoom;
		ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
		ctx.drawImage(gLayer, Math.round((-G_M - ox2) * dpr), Math.round((-G_M - oy2) * dpr));
		ctx.restore();
	}
	let gW = null, gDpr = 0;
	function drawGround(dcx, dcy) {
		if (!world) return;
		const b = viewTiles(dcx, dcy);
		const dpr = gDpr || canvas.width / Math.max(1, viewW);
		const z = zoom;
		ctx.setTransform(dpr * z, dpr * CAM_ISO_Y * z, -dpr * z, dpr * CAM_ISO_Y * z, dpr * (viewW / 2 * (1 - z) - dcx * z), dpr * (viewH / 2 * (1 - z) - dcy * z));
		const tx0 = Math.max(0, b.tx0);
		const ty0 = Math.max(0, b.ty0);
		const tx1 = Math.min(155, b.tx1);
		const ty1 = Math.min(155, b.ty1);
		drawGroundChunks(tx0, ty0, tx1, ty1); // v15.5 (old per-tile path: paintGroundRect/queueGroundRect/paintGroundSpill, unused)
		ctx.globalAlpha = 1;
	}
	/** Night darkness, 0 by day. Ramps in through the evening (17-21h), keeps deepening to its
	 * darkest around 2-4h, then lifts through dawn (4-7h). Capped so a phone screen stays readable. */
	function nightDark(total) {
		return Math.min(.95, nightDarkBase(total) * moonEffect(moonPhase(Math.floor(total / DAY_LENGTH_SEC))).dark);
	}
	function nightDarkBase(total) {
		const span = DAY_LENGTH_SEC;
		const h = (((total % span) + span) % span) / span * 24;
		const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
		const DUSK = .64, DEEP = .82;
		if (h >= 7 && h < 17) return 0;
		if (h >= 17 && h < 21) return DUSK * ease((h - 17) / 4);
		if (h >= 21) return DUSK + (DEEP - DUSK) * ease((h - 21) / 5);
		if (h < 2) return DUSK + (DEEP - DUSK) * ease((h + 3) / 5);
		if (h < 4) return DEEP;
		return DEEP * (1 - ease((h - 4) / 3));
	}
	// v13.5: glow heights follow the real-size art (farmhouse 500, barn 450, smithy 46, stall 91, porch deck 58, loft 99)
	const LIT_BUILDINGS = { farmhouse: [225, -87, .8], shack: [165, -80, .65], workshop: [135, -27, .65], stall: [165, -54, .7], barn: [180, -118, .55], "post-porch": [135, -33, .75], "post-loft": [135, -82, .6] }; // v15.4: x1.5 with the buildings
	const FIRES = { campfire: 230, firepot: 170, "firepot-up": 180, "firepot-3": 190 };
	let nightCv = null;
	/** Darkness layer with holes cut around light sources, then a warm additive glow on top. */
	function paintNight(dark, camXd, camYd) {
		if (!world || !player || !ctx) return;
		const scale = .25;
		const w = Math.max(1, Math.ceil(viewW * scale)), h = Math.max(1, Math.ceil(viewH * scale));
		if (!nightCv) nightCv = document.createElement("canvas");
		if (nightCv.width !== w || nightCv.height !== h) { nightCv.width = w; nightCv.height = h; }
		const lg = nightCv.getContext("2d");
		if (!lg) return;
		const lights = [];
		const at = (wx, wy) => { const r = worldToScreen(wx, wy, camXd, camYd); return zoomPoint(r.sx, r.sy); };
		const t = performance.now() / 1000;
		const flick = (k) => 1 + Math.sin(t * 9 + k) * .04 + Math.sin(t * 23 + k * 3) * .03;
		// the hero carries a small light; sharper eyes see a little further into it
		const pp = at(player.x, player.y - 40);
		lights.push({ x: pp.sx, y: pp.sy, r: (120 + Math.min(10, perc()) * 9) * zoom * (carrying("lantern") ? 1.7 : 1) * (injured("blind") ? INJ_FX.blindLight : 1), a: carrying("lantern") ? .95 : .8, warm: carrying("lantern") ? .55 : .3 });
		const margin = 320 * zoom;
		// Mother Pelletier's lantern
		for (const e of world.enemies) {
			if (e.variant !== "pelletier" || e.dead) continue;
			const q = at(e.x, e.y - 30);
			if (q.sx < -margin || q.sy < -margin || q.sx > viewW + margin || q.sy > viewH + margin) continue;
			lights.push({ x: q.sx, y: q.sy, r: 150 * zoom * flick(e.id), a: .85, warm: .75 });
		}
		for (const prop of world.props) {
			if (!explored[prop.ty * 156 + prop.tx]) continue;
			const fire = FIRES[prop.kind] ?? ((prop.burn || 0) > 0 ? 200 : 0);
			const lit = LIT_BUILDINGS[prop.kind];
			if (!fire && !lit) continue;
			const c = propCenter(prop);
			const q = at(c.x, c.y);
			if (q.sx < -margin || q.sy < -margin || q.sx > viewW + margin || q.sy > viewH + margin) continue;
			if (fire) lights.push({ x: q.sx, y: q.sy - 20 * zoom, r: fire * zoom * flick(prop.id || 0), a: 1, warm: .5 });
			else lights.push({ x: q.sx, y: q.sy + lit[1] * zoom, r: lit[0] * zoom, a: lit[2], warm: .5 });
		}
		for (const e of world.enemies) {
			if (e.dead || (e.variant !== "torch" && e.variant !== "atv")) continue;
			const tt = tileOf(e.x, e.y);
			if (!visible[tt.ty * 156 + tt.tx]) continue;
			const q = at(e.x, e.y - 40);
			lights.push({ x: q.sx, y: q.sy, r: (e.variant === "atv" ? 150 : 160) * zoom * flick(e.id), a: .9, warm: .55 });
		}
		// v15.9.3: one flat darkening layer (quarter resolution, smoothed up) with a cheap soft circle cut out per light;
		// no additive lantern / campfire glow pass
		if (lights.length > 8) { const cx = viewW / 2, cy = viewH / 2; lights.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy)); lights.length = 8; }
		lg.setTransform(1, 0, 0, 1, 0, 0);
		lg.globalCompositeOperation = "source-over";
		lg.clearRect(0, 0, w, h);
		lg.fillStyle = `rgba(6, 9, 24, ${dark})`;
		lg.fillRect(0, 0, w, h);
		lg.globalCompositeOperation = "destination-out";
		for (const L of lights) {
			const x = L.x * scale, y = L.y * scale, r = Math.max(3, L.r * scale);
			const g = lg.createRadialGradient(x, y, r * .25, x, y, r);
			g.addColorStop(0, `rgba(0,0,0,${L.a})`);
			g.addColorStop(1, "rgba(0,0,0,0)");
			lg.fillStyle = g;
			lg.fillRect(x - r, y - r, r * 2, r * 2);
		}
		ctx.save();
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(nightCv, 0, 0, viewW, viewH);
		ctx.restore();
	}
	function render() {
		const tR = performance.now(); resize(); pAdd("resize", tR);
		// v15.9.3: the canvas is no longer re-sized every frame, so reset its state here instead (no reallocation)
		if (typeof ctx.reset === "function") ctx.reset(); else { ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.filter = "none"; }
		const dpr = canvas.width / viewW;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.fillStyle = "#101410";
		ctx.fillRect(0, 0, viewW, viewH);
		if (!world || !player || phase === "menu") {
			drawMini();
			return;
		}
		if (inside) {
			drawRoom();
			const dark = nightDark(clock) * .5;
			if (dark > .02) {
				const kind = world.props.find((p) => p.id === inside.id)?.kind;
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
				const o = roomOrigin();
				const rs = roomScale();
				const fx = kind === "farmhouse" ? (o.x + 62) * rs : viewW / 2, fy = kind === "farmhouse" ? (o.y + 150) * rs : viewH / 2;
				const g = ctx.createRadialGradient(fx, fy, 20, fx, fy, Math.max(viewW, viewH) * .7);
				g.addColorStop(0, `rgba(6, 10, 24, ${kind === "farmhouse" ? 0 : dark * .5})`);
				g.addColorStop(1, `rgba(6, 10, 24, ${dark})`);
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, viewW, viewH);
				if (kind === "farmhouse") {
					ctx.save();
					ctx.globalCompositeOperation = "lighter";
					const w2 = ctx.createRadialGradient(fx, fy, 0, fx, fy, 170);
					w2.addColorStop(0, `rgba(255, 150, 60, ${.18 + dark * .3})`);
					w2.addColorStop(1, "rgba(0,0,0,0)");
					ctx.fillStyle = w2;
					ctx.fillRect(fx - 170, fy - 170, 340, 340);
					ctx.restore();
				}
			}
			drawMini();
			return;
		}
		const focus = worldToScreen(player.x, player.y, 0, 0);
		if (!freeCam) {
			// v14: critically-damped follow with a small lookahead along the walk, frame-rate independent
			const rdt = Math.min(.05, Math.max(.001, (renderNow - (lastCamT || renderNow)) / 1e3 || STEP));
			lastCamT = renderNow;
			const vx = player.x - (camPX ?? player.x), vy = player.y - (camPY ?? player.y);
			camPX = player.x; camPY = player.y;
			const v = worldVelToScreen(vx, vy);
			const sp = Math.hypot(v.dsx, v.dsy) / rdt;
			const la = Math.min(1, sp / 220);
			lookX += ((sp > 1 ? v.dsx / (Math.hypot(v.dsx, v.dsy) || 1) * 46 * la : 0) - lookX) * (1 - Math.exp(-3 * rdt));
			lookY += ((sp > 1 ? v.dsy / (Math.hypot(v.dsx, v.dsy) || 1) * 30 * la : 0) - lookY) * (1 - Math.exp(-3 * rdt));
			const destX = focus.sx - viewW / 2 + lookX;
			const destY = focus.sy - viewH / 2 + lookY;
			const k = 1 - Math.exp(-9 * rdt);
			if (Math.abs(destX - camX) > 900 || Math.abs(destY - camY) > 900) { camX = destX; camY = destY; }
			camX += (destX - camX) * k;
			camY += (destY - camY) * k;
		} else {
			const seen = zoomPoint(worldToScreen(player.x, player.y, camX, camY).sx, worldToScreen(player.x, player.y, camX, camY).sy);
			const edge = 64;
			if (seen.sx < edge) camX -= (edge - seen.sx) / zoom;
			else if (seen.sx > viewW - edge) camX += (seen.sx - (viewW - edge)) / zoom;
			if (seen.sy < edge) camY -= (edge - seen.sy) / zoom;
			else if (seen.sy > viewH - edge) camY += (seen.sy - (viewH - edge)) / zoom;
		}
		if (!reduceMotion) shake *= Math.exp(-10 * STEP);
		else shake = 0;
		const sxOff = (Math.random() - .5) * shake;
		const syOff = (Math.random() - .5) * shake;
		const pxs = (canvas.width / Math.max(1, viewW)) * zoom;
		const drawCamX = Math.round((camX + sxOff) * pxs) / pxs;
		const drawCamY = Math.round((camY + syOff) * pxs) / pxs;
		const bounds = viewTiles(drawCamX, drawCamY);
		const z = zoom;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const tG = performance.now();
		drawGroundCached(drawCamX, drawCamY, dpr);
		pAdd("ground", tG);
		const shotMode = typeof window !== "undefined" && !!window.__noFog; // v15.9: full-world render: no screen-space haze/grade/weather
		if (world && !shotMode) { const dprG = canvas.width / Math.max(1, viewW); const tH = performance.now(); if (typeof window !== "undefined" && window.__haze193) drawGroundDepth(); pAdd("haze", tH); ctx.setTransform(dprG, 0, 0, dprG, 0, 0); }
		const tG2 = performance.now();
		q10DrawGround(drawCamX, drawCamY, dpr);
		// v15.8: combat hexes, move highlights and the turn ring sit on the ground, under every sprite
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0); townGround(drawCamX, drawCamY); paintHex15(drawCamX, drawCamY);
		pAdd("groundExtra", tG2);
		if (world.gates.length && !mode11) {
			// v14 exit grid: a tinted band at each edge road; walking in opens the world map
			ctx.setTransform(dpr * z, dpr * CAM_ISO_Y * z, -dpr * z, dpr * CAM_ISO_Y * z, dpr * (viewW / 2 * (1 - z) - drawCamX * z), dpr * (viewH / 2 * (1 - z) - drawCamY * z));
			const pulse = .28 + Math.sin(performance.now() / 400) * .08;
			ctx.fillStyle = `rgba(224,176,80,${pulse})`;
			for (const g of world.gates) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) ctx.fillRect((g.tx + dx) * 64 + 3, (g.ty + dy) * 64 + 3, 58, 58);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			for (const g of world.gates) {
				const raw = worldToScreen(g.tx * 64 + 32, g.ty * 64 + 32, drawCamX, drawCamY);
				const pt = zoomPoint(raw.sx, raw.sy);
				const out = worldToScreen(g.tx * 64 + 32 - (g.arriveTx - g.tx) * 64, g.ty * 64 + 32 - (g.arriveTy - g.ty) * 64, drawCamX, drawCamY);
				const po = zoomPoint(out.sx, out.sy);
				const ang = Math.atan2(po.sy - pt.sy, po.sx - pt.sx);
				ctx.save(); ctx.translate(pt.sx, pt.sy - 30 * zoom); ctx.fillStyle = "rgba(20,16,12,.8)"; ctx.fillRect(-46 * zoom, -30 * zoom, 92 * zoom, 18 * zoom);
				ctx.fillStyle = "#f0d090"; ctx.font = `${Math.round(11 * zoom)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("WORLD MAP", 0, -17 * zoom);
				ctx.rotate(ang); ctx.fillStyle = "#f0d090"; ctx.beginPath(); ctx.moveTo(22 * zoom, 0); ctx.lineTo(4 * zoom, -10 * zoom); ctx.lineTo(4 * zoom, 10 * zoom); ctx.fill(); ctx.fillRect(-18 * zoom, -3 * zoom, 24 * zoom, 6 * zoom);
				ctx.restore();
			}
		}
		if (buildOpen) {
			ctx.setTransform(dpr * z, dpr * CAM_ISO_Y * z, -dpr * z, dpr * CAM_ISO_Y * z, dpr * (viewW / 2 * (1 - z) - drawCamX * z), dpr * (viewH / 2 * (1 - z) - drawCamY * z));
			const tile = hoverTile();
			const spec = PROP_SPEC[RECIPES[recipe].kind];
			ctx.fillStyle = canPlaceAt(tile) ? "rgba(138,154,98,0.45)" : "rgba(196,84,58,0.4)";
			ctx.fillRect(tile.tx * 64, tile.ty * 64, spec.w * 64, spec.h * 64);
		}
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		if (buildOpen && buildTool === "place" && ART14.has(RECIPES[recipe].kind)) {
			const tile = hoverTile();
			const k = RECIPES[recipe].kind;
			const img = images.get(PROP_SPEC[k].image);
			if (img) {
				const raw = worldToScreen((tile.tx + .5) * 64, (tile.ty + .5) * 64, drawCamX, drawCamY);
				const pt = zoomPoint(raw.sx, raw.sy);
				const H = PROP_SPEC[k].drawH * zoom, W = H * img.width / img.height;
				ctx.save(); ctx.globalAlpha = .55; ctx.translate(pt.sx, pt.sy); if (buildFlip) ctx.scale(-1, 1);
				ctx.drawImage(img, -W / 2, -H * (1 - anchorOf(k)), W, H); ctx.restore();
			}
		}
		const tSort = performance.now();
		const draws = [];
		// v15.9.3: only the hero and the companion make things fade, and only the one object right in front of each
		const fadeBodies = player ? [player, ...(party && !inside ? [party] : [])] : [];
		// v15.9.3 off-screen culling: anything whose art can't reach the screen (plus a margin) is skipped:
		// no draw, no fade check, no depth sort
		const CULL = 96;
		const onScr = (x, y, hh, ww = hh * .6) => { const r = worldToScreen(x, y, drawCamX, drawCamY); const q = zoomPoint(r.sx, r.sy); const H = hh * zoom * 1.15, W = ww * zoom; return q.sx > -CULL - W && q.sx < viewW + CULL + W && q.sy > -CULL && q.sy - H < viewH + CULL; };
		const fadePick = new Map(); // body -> { id, d }
		// v15.9.4: the fade pick runs every 4th frame (~15 Hz); in between the last pick is reused (the fade itself still eases every frame)
		const fadeTick = (fadeFrame++ & 3) === 0;
		const fadeIds = fadeTick ? new Set() : fadeKeep;
		for (const prop of world.props) {
			const t = prop.tx + prop.ty;
			const i = prop.ty * 156 + prop.tx;
			if (!explored[i]) continue;
			if (prop.tx < bounds.tx0 - 2 || prop.ty < bounds.ty0 - 2 || prop.tx > bounds.tx1 + 2 || prop.ty > bounds.ty1 + 2) continue;
			const spec = PROP_SPEC[prop.kind];
			const c = propCenter(prop);
			const h = prop.loose ? spec.drawH * .62 : spec.drawH;
			if (prop.kind === "bike" && prop.id === mountId) continue;
			if (!onScr(c.x, c.y, Math.max(h, 120), Math.max(h, 160))) continue;
			{
				const tF = performance.now();
				const tree = prop.kind.startsWith("tree-");
				const vArt = (prop.kind === "car-sedan" || prop.kind === "car-truck") ? vehicleArt(prop) : null;
				if (fadeTick && player && !inside && (vArt ? vArt.h > 100 : h > (tree ? 60 : 140))) {
					const n = (Math.imul(prop.tx, 374761393) ^ Math.imul(prop.ty, 668265263)) >>> 0;
					const scale = tree ? TREE_VARY[0] + n % TREE_VARY[2] * TREE_VARY[1] : 1;
					const pr = worldToScreen(c.x, c.y, drawCamX, drawCamY);
					const ps = zoomPoint(pr.sx, pr.sy);
					const ph = (vArt ? vArt.h : h * scale) * zoom;
					const pimg = images.get(vArt ? vArt.name : spec.image);
					const aspect = pimg && pimg.height ? pimg.width / pimg.height : 1;
					const pw = ph * aspect * (tree ? .85 : .92);
					for (const b of fadeBodies) {
						const d = c.x + c.y - (b.x + b.y);
						if (d <= 0) continue;
						if (b === player && standingDoor(prop.kind) && inFrontOfHouse(prop, player.x, player.y)) continue;
						const hr = worldToScreen(b.x, b.y, drawCamX, drawCamY);
						const hs = zoomPoint(hr.sx, hr.sy);
						if (Math.abs(hs.sx - ps.sx) < pw / 2 + 18 * zoom && hs.sy < ps.sy + 6 * zoom && hs.sy - HERO_H * zoom * .5 > ps.sy - ph) {
							const cur = fadePick.get(b);
							if (!cur || d < cur.d) fadePick.set(b, { id: prop.id, d });
						}
					}
				}
				pAdd("fade", tF);
			}
			draws.push({
				z: c.x + c.y + t * 0,
				draw: () => {
					const tree = prop.kind.startsWith("tree-");
					const n = (Math.imul(prop.tx, 374761393) ^ Math.imul(prop.ty, 668265263)) >>> 0;
					const scale = tree ? TREE_VARY[0] + n % TREE_VARY[2] * TREE_VARY[1] : 1;
					let tilt = 0;
					let jx = 0;
					let jy = 0;
					let chip = 1;
					let bitten = 0;
					let fall = 0;
					if (work && work.id === prop.id) {
						bitten = work.total - work.hits;
						const lin = work.fallMax > 0 && work.fall > 0 ? 1 - work.fall / work.fallMax : work.hits <= 0 ? 1 : 0;
						fall = lin * lin * (3 - 2 * lin);
						if (work.mode === "chop") {
							tilt = fall * 1.62 * work.side + (work.shake > 0 ? Math.sin(work.shake * 52) * .18 : 0);
							jx = fall * 22 * work.side;
							jy = fall * 10;
						} else {
							chip = Math.max(.28, 1 - bitten * .16 - fall * .62);
							jx = work.shake > 0 ? Math.sin(work.shake * 70) * 6 : 0;
							jy = work.shake > 0 ? Math.cos(work.shake * 64) * 3 : 0;
						}
					}
					// see-through: a tall prop drawn in front of the hero fades so the hero never vanishes behind it
					// v15.9.3: picked before the sort: the single nearest tall object in front of the hero / companion
					let seeThrough = fadeIds.has(prop.id);
					// ease the fade in and out instead of popping
					const fadeTo = seeThrough ? 1 : 0;
					prop.fade = (prop.fade || 0) + (fadeTo - (prop.fade || 0)) * Math.min(1, STEP * 10);
					if (prop.fade < .01) prop.fade = 0;
					seeThrough = prop.fade > 0;
					if (seeThrough) ctx.globalAlpha = 1 - prop.fade * .65;
					if (prop.fade > .3) occl141 = true;
					const treeArt = v2TreeArt(prop, n);
					if (prop.kind === "tractor" && (prop.charge || 0) > 0 && images.get("v2/tractor-drive")) {
						// v12: the gw14 8-way tractor (4 frames x 8 facings), rolling along its charge line
						const shift = tractorShift(prop.charge || 0);
						blit("v2/tractor-drive", c.x + shift.x, c.y + shift.y, TRACTOR_DRIVE_H, true, Math.floor((prop.charge || 0) * 28) % 4, TRACTOR_ROW, drawCamX, drawCamY);
					} else if (prop.kind === "bike" && images.get("v2/bike-parked")) {
						blit("v2/bike-parked", c.x, c.y, 76, true, 0, prop.id % 2 ? 2 : 6, drawCamX, drawCamY);
					} else if (prop.kind === "tractor" && (prop.charge || 0) > 0 && images.get("tractor-run")) {
						const img = images.get("tractor-run");
						const frames = img.width / img.height > 8 ? 8 : 4;
						const sw = img.width / frames;
						const sh = img.height;
						const shift = tractorShift(prop.charge || 0);
						const f = Math.floor((prop.charge || 0) * 28) % frames;
						const raw = worldToScreen(c.x + shift.x, c.y + shift.y, drawCamX, drawCamY);
						const p = zoomPoint(raw.sx, raw.sy);
						const dh = TRACTOR_RUN_H * zoom;
						const dw = dh * (sw / sh);
						ctx.imageSmoothingEnabled = true;
						ctx.imageSmoothingQuality = "high";
						ctx.drawImage(img, f * sw, 0, sw, sh, p.sx - dw / 2, p.sy - dh * .92, dw, dh);
					} else if ((prop.kind === "car-sedan" || prop.kind === "car-truck") && vehicleArt(prop)) {
						const va = vehicleArt(prop);
						blit(va.name, c.x, c.y, va.h, false, 0, 0, drawCamX, drawCamY);
					} else if (ART14.has(prop.kind) && images.get(spec.image)) {
						let name = prop.kind === "firering" && prop.lit14 ? "v14/firering-lit" : spec.image;
						if ((isWall14(prop.kind)) && (prop.hp ?? 99) < (PIECE_HP[prop.kind] ?? 60) * .5 && images.get(`${name}-dmg`)) name = `${name}-dmg`;
						const img = images.get(name);
						const raw = worldToScreen(c.x, c.y, drawCamX, drawCamY);
						const pt = zoomPoint(raw.sx, raw.sy);
						const dh = img.height / 2 * zoom * (img.height / (img.naturalH || img.height));
						const sc = (spec.drawH / (img.height / 2));
						const H = spec.drawH * zoom, W = H * img.width / img.height;
						const up = anchorOf(name.slice(4));
						const a0 = ctx.globalAlpha;
						if (isGate14(prop.kind) && prop.open) ctx.globalAlpha = a0 * .4;
						if ((prop.flash || 0) > 0) ctx.globalAlpha = a0 * .7;
						ctx.save();
						ctx.translate(pt.sx, pt.sy);
						if (prop.flip14) ctx.scale(-1, 1);
						ctx.imageSmoothingEnabled = true;
						scaledDraw(img, 0, 0, img.width, img.height, -W / 2, -H * (1 - up), W, H);
						ctx.restore();
						ctx.globalAlpha = a0;
						void dh; void sc;
						if (prop.kind === "firering" && prop.lit14 && images.get("fx-fire")) blit("fx-fire", c.x, c.y - 6, 30, false, 0, 0, drawCamX, drawCamY);
						if ((prop.f14 || prop.p14) && buildOpen && (prop.hp ?? 0) < maxHp14(prop)) paintHp14(pt, H, (prop.hp ?? 0) / maxHp14(prop));
					} else { const tT = performance.now(); blit(terrainPick(prop.skin && images.get(`v2/${prop.skin}`) ? `v2/${prop.skin}` : treeArt || spec.image, prop.id ?? 0), c.x + jx, c.y + jy, h * scale * chip, false, 0, 0, drawCamX, drawCamY, false, 0, tilt, 1, tree && (n & 32) !== 0); if (tree) pAdd("trees", tT); }
					if (prop.label && !(prop.skin && images.get(`v2/${prop.skin}`))) paintSign(prop.label, c.x, c.y, h * scale, drawCamX, drawCamY);
					if ((prop.flash || 0) > 0 && images.get("fx-muzzle")) blit("fx-muzzle", c.x, c.y - 28, 54, false, 0, 0, drawCamX, drawCamY);
					if ((prop.kind === "firepot" || prop.kind === "firepot-up" || prop.kind === "firepot-3") && images.get("fx-fire")) blit("fx-fire", c.x, c.y - h * .35, h * .8, false, 0, 0, drawCamX, drawCamY);
					else if ((prop.burn || 0) > 1 && images.get("fx-fire")) blit("fx-fire", c.x, c.y - Math.min(36, h * .3), Math.min(70, Math.max(30, h * .6)), false, 0, 0, drawCamX, drawCamY);
					if ((prop.burn || 0) > 0 && images.get("fx-smoke")) blit("fx-smoke", c.x + 8, c.y - 70, 64, false, 0, 0, drawCamX, drawCamY);
					if (work && work.id === prop.id && bitten > 0 && fall < .55) {
						if (work.mode === "chop") paintNotch(c.x, c.y, bitten, drawCamX, drawCamY);
						else paintCracks(c.x, c.y, bitten, drawCamX, drawCamY);
					}
					if (standingDoor(prop.kind)) {
						const swing = opening && opening.id === prop.id ? 1 - opening.t / OPEN_TIME : 0;
						paintDoorOnBuilding(prop.kind, c.x, c.y, h, swing, drawCamX, drawCamY);
					}
					if (seeThrough) ctx.globalAlpha = 1;
				}
			});
		}
		if (fadeTick) { for (const v of fadePick.values()) fadeIds.add(v.id); fadeKeep = fadeIds; }
		for (const npc of world.npcs) {
			const t = tileOf(npc.x, npc.y);
			if (!visible[t.ty * 156 + t.tx]) continue;
			if (!onScr(npc.x, npc.y, 140)) continue;
			if (escortBodies && (npc.role === "cyndal" || npc.role === "loki")) continue;
			draws.push({
				z: bodyZ(npc.x, npc.y),
				draw: () => {
					paintPerson(npc, drawCamX, drawCamY);
					if (npc.hp < npc.maxHp) bar(npc.x, npc.y, folkHeight(npc), npc.hp / npc.maxHp, drawCamX, drawCamY);
				}
			});
		}
		if (party && !inside) {
			draws.push({
				z: bodyZ(party.x, party.y),
				draw: () => {
					shadow193 = true; try { paintPerson(party, drawCamX, drawCamY); } finally { shadow193 = false; }
					bar(party.x, party.y, folkHeight(party), Math.max(0, party.hp) / party.maxHp, drawCamX, drawCamY);
				}
			});
		}
		for (const gate of world.gates) {
			const t = tileOf(gate.tx * 64, gate.ty * 64);
			if (!explored[t.ty * 156 + t.tx]) continue;
			const x = gate.tx * 64 + 32;
			const y = gate.ty * 64 + 32;
			draws.push({
				z: x + y,
				draw: () => {
					const raw = worldToScreen(x, y - 10, drawCamX, drawCamY);
					const p = zoomPoint(raw.sx, raw.sy);
					ctx.fillStyle = "#5c3d28";
					ctx.fillRect(p.sx - 2 * zoom, p.sy - 28 * zoom, 4 * zoom, 28 * zoom);
					ctx.fillStyle = "#d7c4a1";
					ctx.fillRect(p.sx - 16 * zoom, p.sy - 36 * zoom, 32 * zoom, 12 * zoom);
					ctx.strokeStyle = "#6b4a2e";
					ctx.strokeRect(p.sx - 16 * zoom, p.sy - 36 * zoom, 32 * zoom, 12 * zoom);
				}
			});
		}
		const lockedId = intent && intent.kind === "attack" ? intent.id : -1;
		for (const enemy of world.enemies) {
			if (enemy.dead && !(enemy.death > 0)) continue;
			const t = tileOf(enemy.x, enemy.y);
			if (t.tx < 0 || t.ty < 0 || t.tx >= 156 || t.ty >= 156) continue;
			if (!visible[t.ty * 156 + t.tx]) continue;
			if (!onScr(enemy.x, enemy.y, 260, 260)) continue;
			draws.push({
				z: bodyZ(enemy.x, enemy.y),
				draw: () => {
					const h = beastH(enemy);
					if (enemy.variant === "bear") { ctx.save(); ctx.filter = "brightness(0.38) saturate(0.5)"; }
					shadow193 = !enemy.dead;
					try {
					// strips are drawn facing west; mirror them for anything facing east
					const east = (enemy.dir ?? 0) >= 5 && (enemy.dir ?? 0) <= 7;
					if (enemy.dead) {
						const deadName = `${beastSheet(enemy)}-dead`;
						const dimg = images.get(deadName);
						if (dimg) {
							if (TALL_COMBAT.has(deadName) || deadName.startsWith("v2/")) {
								const u = 1 - Math.max(0, enemy.death) / 1.15;
								const dn = sheetCols(dimg);
								// v14.1: the v2 death sheets only sag at the knees; after them the body tips over and lands flat
								const v2d = deadName.startsWith("v2/");
								const fall = v2d ? Math.max(0, (u - .45) / .55) : 0, side = deadTilt(enemy.dir, enemy.id);
								blit(deadName, enemy.x, enemy.y, h, true, Math.max(0, Math.min(dn - 1, Math.floor(Math.min(1, u / .45) * dn))), enemy.dir ?? 0, drawCamX, drawCamY, false, 0, side * 1.35 * fall * fall, 1 - .2 * fall);
							} else if (stripFrames(deadName, dimg) > 1) {
								const u = 1 - Math.max(0, enemy.death) / 1.15;
								const f = Math.max(0, Math.min(3, Math.floor(u * 4)));
								blit(deadName, enemy.x, enemy.y, h, false, f, 0, drawCamX, drawCamY, false, 0, 0, 1, east);
							} else blit(deadName, enemy.x, enemy.y, Math.round(h * .62), false, 0, 0, drawCamX, drawCamY);
						}
						return;
					}
					const atk = `${beastSheet(enemy)}-atk`;
					const aimg = images.get(atk);
					if (aimg && TALL_COMBAT.has(atk) && enemy.cooldown > .08) {
						const swingMax = enemy.kind === "moose" ? 1.05 : enemy.elite ? .95 : .82;
						const u = 1 - Math.min(swingMax, enemy.cooldown) / swingMax;
						blit(atk, enemy.x, enemy.y, h, true, Math.max(0, Math.min(3, Math.floor(u * 4))), enemy.dir ?? 0, drawCamX, drawCamY);
					} else if (aimg && stripFrames(atk, aimg) > 1) {
						const swingMax = enemy.kind === "moose" ? 1.05 : enemy.elite ? .95 : .82;
						if (enemy.cooldown > .08) {
							const u = 1 - Math.min(swingMax, enemy.cooldown) / swingMax;
							const f = Math.max(0, Math.min(3, Math.floor(u * 4)));
							blit(atk, enemy.x, enemy.y, h, false, f, 0, drawCamX, drawCamY, false, 0, 0, 1, east);
						} else blit(beastSheet(enemy), enemy.x, enemy.y, h, true, enemy.frame, enemy.dir, drawCamX, drawCamY, enemy.cooldown > .2);
					} else {
						const swinging = enemy.cooldown > (enemy.kind === "moose" ? .7 : enemy.elite ? .62 : .52);
						if (swinging && aimg) blit(atk, enemy.x, enemy.y, h, false, 0, 0, drawCamX, drawCamY, true);
						else blit(beastSheet(enemy), enemy.x, enemy.y, h, true, enemy.frame, enemy.dir, drawCamX, drawCamY, swinging);
					}
					if (enemy.aggro || enemy.hp < enemy.maxHp || enemy.id === lockedId) bar(enemy.x, enemy.y, h, enemy.hp / enemy.maxHp, drawCamX, drawCamY);
					} finally { shadow193 = false; if (enemy.variant === "bear") ctx.restore(); }
				}
			});
		}
		for (const pile of piles) {
			if (!hasLoot(pile)) continue;
			const t = tileOf(pile.x, pile.y);
			if (t.tx < 0 || t.ty < 0 || t.tx >= 156 || t.ty >= 156) continue;
			if (!visible[t.ty * 156 + t.tx]) continue;
			if (!onScr(pile.x, pile.y, 160, 200)) continue;
			draws.push({
				z: pile.x + pile.y,
				draw: () => {
					if (pile.shownAt && performance.now() < pile.shownAt) return;
					const tilt = pile.dir === 1 || pile.dir === 2 || pile.dir === 3 ? -1.2 : 1.2;
					const deadName = pile.body ? `${pile.sheet || beastSheet({ kind: pile.body, id: pile.id })}-dead` : "";
					const dimg = deadName ? images.get(deadName) : null;
					if (dimg && (TALL_COMBAT.has(deadName) || deadName.startsWith("v2/"))) {
						// v14.1: a searchable body gets a loot ring
						if (hasLoot(pile)) { const rr = worldToScreen(pile.x, pile.y, drawCamX, drawCamY), mm = zoomPoint(rr.sx, rr.sy); ctx.save(); ctx.strokeStyle = `rgba(232,196,92,${.55 + .3 * Math.sin(performance.now() / 300)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(mm.sx, mm.sy, 30 * zoom, 13 * zoom, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
						const dummy = { kind: pile.body, id: pile.id, variant: (pile.sheet || "").startsWith("boss-") || (pile.sheet || "").startsWith("raider-") && !["raider-gray", "raider-blue"].includes(pile.sheet) ? (pile.sheet || "").split("-")[1] : undefined };
						const v2p = (pile.sheet || "").startsWith("v2/");
						blit(deadName, pile.x, pile.y, v2p ? realH(pile.sheet, 70) : beastH(dummy), true, v2p ? sheetCols(dimg) - 1 : 3, pile.dir ?? 0, drawCamX, drawCamY, false, 0, v2p ? deadTilt(pile.dir, pile.id) * 1.35 : 0, v2p ? .8 : 1);
					} else if (dimg && stripFrames(deadName, dimg) > 1) {
						// last frame of the death strip: the body as it came to rest
						const east = pile.dir >= 5 && pile.dir <= 7;
						const dummy = { kind: pile.body, id: pile.id, variant: (pile.sheet || "").startsWith("boss-") || (pile.sheet || "").startsWith("raider-") && !["raider-gray", "raider-blue"].includes(pile.sheet) ? (pile.sheet || "").split("-")[1] : undefined };
						blit(deadName, pile.x, pile.y, beastH(dummy), false, 3, 0, drawCamX, drawCamY, false, 0, 0, 1, east);
					} else if (pile.folk) blit(pile.folk, pile.x, pile.y, NPC_H, true, 0, pile.dir, drawCamX, drawCamY, false, 0, tilt, .78);
					else if (pile.body) {
						const dummy = {
							kind: pile.body,
							id: pile.id
						};
						const h = Math.max(96, Math.round(beastH(dummy) * .95));
						blit(beastSheet(dummy), pile.x, pile.y, h, true, 0, pile.dir, drawCamX, drawCamY, false, 0, tilt, .78);
					} else blit("sack", pile.x, pile.y, 28, false, 0, 0, drawCamX, drawCamY); // v13.5: a 2.3 ft loot sack (tap box keeps its finger-size minimum)
				}
			});
		}
		for (const crow of crows) {
			const t = tileOf(crow.x, crow.y);
			if (t.tx < 0 || t.ty < 0 || t.tx >= 156 || t.ty >= 156) continue;
			if (!visible[t.ty * 156 + t.tx]) continue;
			draws.push({
				z: crow.x + crow.y + 2e4,
				draw: () => blit("crow", crow.x, crow.y, sizedPx(SIZE_IN.crow, BEAST_FIT.crow), true, crow.frame, crow.dir, drawCamX, drawCamY, false, crow.alt)
			});
		}
		draws.push({
			z: bodyZ(player.x, player.y),
			draw: () => { shadow193 = true; try { xfWrap(() => {
				// v11.1 art hook: a dedicated hero-ride sheet (bike included) replaces the stand-in when present
				const rideSheet = asSarah() ? "v2/sarah-ride" : "v2/hero-ride";
				if (mounted && images.get(rideSheet) && phase !== "dead") { blit(rideSheet, player.x, player.y, ADULT, true, walkFrame(true), player.dir, drawCamX, drawCamY, false); return; }
				if (mounted) paintRide(player.x, player.y, player.dir, drawCamX, drawCamY);
				if (phase === "dead") {
					if (plImg("death")) {
						if (!fellAt) fellAt = performance.now();
						const f = Math.min(5, Math.floor((performance.now() - fellAt) / 150));
						blit(plImg("death"), player.x, player.y, HERO_H, true, f, player.dir, drawCamX, drawCamY, false);
						paintArmor("death", f, player.dir, drawCamX, drawCamY);
						return;
					}
					if (images.get("v2/hero-death")) {
						if (!fellAt) fellAt = performance.now();
						const f = Math.min(5, Math.floor((performance.now() - fellAt) / 150));
						blit("v2/hero-death", player.x, player.y, HERO_H, true, f, player.dir, drawCamX, drawCamY, false);
						return;
					}
					const fallen = heroActionPose();
					if (fallen) {
						blit(fallen.name, player.x, player.y, HERO_H, true, fallen.frame, player.dir, drawCamX, drawCamY, false);
						return;
					}
					if (!fellAt) fellAt = performance.now();
					const u = Math.min(1, (performance.now() - fellAt) / 700);
					const ease = 1 - (1 - u) * (1 - u);
					const eastward = player.dir >= 5 && player.dir <= 7 || player.dir === 0 && player.frame % 2 === 1;
					const row = eastward ? 6 : 2;
					blit("hero", player.x, player.y, HERO_H, true, 0, row, drawCamX, drawCamY, false, -ease * 6, (eastward ? -1 : 1) * ease * Math.PI * .47);
					return;
				}
				fellAt = 0;
				const atkName = `${heroKey()}-atk`;
				// the v19 swing strips are front views: use them when facing the camera, otherwise keep the lunge
				const facingCam = player.dir === 0 || player.dir === 1 || player.dir === 7;
				const flinch = heroActionPose();
				if (paintPlayerBody(flinch, drawCamX, drawCamY)) return;
				const axeSwing = !flinch && swingAnim > 0 && !work && heroKey() === "hero-axe" && images.get("v2/hero-axe");
				const idle = !flinch && !axeSwing && !(swingAnim > 0) && heroKey() === "hero" && player.anim === player.idleAnim && images.get("v2/hero-idle");
				player.idleAnim = player.anim;
				if (flinch) blit(flinch.name, player.x, player.y, HERO_H, true, flinch.frame, player.dir, drawCamX, drawCamY, false);
				else if (axeSwing) blit("v2/hero-axe", player.x, player.y, HERO_H, true, Math.min(5, Math.floor((1 - swingAnim / .48) * 6)), player.dir, drawCamX, drawCamY, false);
				else if (idle) blit("v2/hero-idle", player.x, player.y, HERO_H, true, Math.floor(performance.now() / ANIM_MS.idle) % sheetCols(images.get("v2/hero-idle")), player.dir, drawCamX, drawCamY, false);
				else if (swingAnim > 0 && !work && TALL_COMBAT.has(atkName)) {
					blit(atkName, player.x, player.y, HERO_H, true, Math.min(3, Math.floor((1 - swingAnim / .48) * 4)), player.dir, drawCamX, drawCamY, false);
				} else if (swingAnim > 0 && !work && facingCam && images.get(atkName)) {
					const f = Math.min(3, Math.floor((1 - swingAnim / .48) * 4));
					blit(atkName, player.x, player.y, HERO_H, false, f, 0, drawCamX, drawCamY, false);
				} else blit(heroKey(), player.x, player.y, HERO_H, true, player.frame, player.dir, drawCamX, drawCamY, reach > 0);
				if (!flinch && !axeSwing && !idle && !HERO69.has(heroKey()) && !(swingAnim > 0 && !work && (TALL_COMBAT.has(atkName) || facingCam && images.get(atkName)))) paintOverlays(player.frame, player.dir, reach > 0);
				if (swingAnim > 0 && !work && !axeSwing && !TALL_COMBAT.has(atkName)) paintSwingArc();
			}, drawCamX, drawCamY); } finally { shadow193 = false; } }
		});
		for (const scar of scars) {
			const t = tileOf(scar.x, scar.y);
			if (t.tx < 0 || t.ty < 0 || t.tx >= 156 || t.ty >= 156) continue;
			if (!explored[t.ty * 156 + t.tx]) continue;
			if (!onScr(scar.x, scar.y, 100, 160)) continue;
			draws.push({
				z: scar.x + scar.y - 4,
				draw: () => {
					if (scar.kind === "stump") {
						const sv = ((Math.abs(Math.round(scar.x * 7 + scar.y * 3)) >> 3) % 3) + 1;
						if (images.get(`v2/trees/stump${sv}`)) {
							blit(images.get(`v2/trees/log${sv === 3 ? 3 : 2}`) ? `v2/trees/log${sv === 3 ? 3 : 2}` : "logs", scar.x + scar.side * 42, scar.y + 18, 84, false, 0, 0, drawCamX, drawCamY, false, 0, 1.22 * scar.side, .68);
							blit(`v2/trees/stump${sv}`, scar.x, scar.y, 46, false, 0, 0, drawCamX, drawCamY);
							return;
						}
						blit("logs", scar.x + scar.side * 42, scar.y + 18, 84, false, 0, 0, drawCamX, drawCamY, false, 0, 1.22 * scar.side, .68);
						paintStump(scar.x, scar.y, drawCamX, drawCamY);
					} else paintPit(scar.x, scar.y, drawCamX, drawCamY);
				}
			});
		}
		paintFlood(drawCamX, drawCamY);
		q10Draws(draws, drawCamX, drawCamY);
		townHouseDraws(draws, drawCamX, drawCamY, fadeBodies);
		draws.sort((a, b) => a.z - b.z);
		pAdd("sort", tSort);
		occl141 = false;
		const tDraw = performance.now();
		for (const item of draws) item.draw();
		pAdd("drawList", tDraw);
		// v14.1 playtest: canopies fade, and when something still covers you a faint copy of you is drawn on top
		if (occl141 && player && !inside && xfLast?.calls?.length && phase !== "dead") {
			ctx.save(); ctx.globalAlpha = .42; noShadow141 = true;
			try { for (const c of xfLast.calls) blit(...c); } finally { noShadow141 = false; ctx.restore(); }
		}
		if (work && work.swing > 0 && player && !inside) paintToolSwing(drawCamX, drawCamY);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const shade = nightShade(clock);
		const dark = nightDark(clock);
		const tTw = performance.now();
		paintTowns(drawCamX, drawCamY);
		pAdd("towns", tTw);
		const tPost = performance.now();
		const tN = performance.now();
		if (dark > .02) paintNight(dark, drawCamX, drawCamY);
		pAdd("night", tN);
		// v14.1 Blinded: the world closes in, dark and smeared at the edges
		if (injured("blind") && !inside) {
			const r0 = Math.min(viewW, viewH) * .16, r1 = Math.max(viewW, viewH) * .55;
			const g = ctx.createRadialGradient(viewW / 2, viewH / 2, r0, viewW / 2, viewH / 2, r1);
			g.addColorStop(0, "rgba(10,6,4,0)"); g.addColorStop(.55, "rgba(30,10,8,.55)"); g.addColorStop(1, "rgba(12,4,4,.92)");
			ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, viewH); ctx.restore();
		}
		pAdd("postA", tPost);
		const tH2 = performance.now();
		if (hiFx() && !inside && !shotMode) paintDaylight(dark);
		pAdd("haze", tH2);
		const tW = performance.now();
		if (!inside && !shotMode) paintWeather13();
		pAdd("weather", tW);
		const tH3 = performance.now();
		if (!shotMode) paintSeason();
		pAdd("haze", tH3);
		const tTail = performance.now();
		paintRipples(drawCamX, drawCamY);
		paintFish();
		if (world && player && shade > .12) {
			const here = tileOf(player.x, player.y);
			const onFarm = inFarm(here.tx, here.ty) || world.props.some((p) => DEFENSE[p.kind] && Math.hypot(propCenter(p).x - player.x, propCenter(p).y - player.y) < 720);
			let near = 9999;
			for (const e of world.enemies) {
				if (e.dead || !isRaider(e)) continue;
				near = Math.min(near, Math.hypot(e.x - player.x, e.y - player.y));
			}
			if (near < 260 && onFarm) {
				const t = 1 - near / 260;
				const g = ctx.createRadialGradient(viewW / 2, viewH / 2, viewW * .25, viewW / 2, viewH / 2, viewW * .72);
				g.addColorStop(0, "rgba(0,0,0,0)");
				g.addColorStop(1, `rgba(120, 18, 12, ${t * .45})`);
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, viewW, viewH);
			}
		}
		// v14.1 playtest: the thing E / tap-to-use will pick up glows, so the camp's spruce wood is obvious
		if (world && player && !buildOpen && phase === "play") {
			if (renderNow - nrT > 100 || renderNow < nrT) { nrT = renderNow; nrNode = nearestResource(v14.st === 1 ? 640 : 96); }
			const node = nrNode && world.props.includes(nrNode) ? nrNode : null; // v15.9.4: looked up at 10 Hz
			const npcD = (() => { const n = nearestNpc(72); return n ? Math.hypot(n.x - player.x, n.y - player.y) : 999; })();
			if (node && (npcD > 72 || v14.st === 1)) {
				const c = propCenter(node), raw = worldToScreen(c.x, c.y, drawCamX, drawCamY), m = zoomPoint(raw.sx, raw.sy);
				const pulse = .55 + .45 * Math.sin(performance.now() / 260);
				ctx.save();
				ctx.strokeStyle = `rgba(232, 196, 92, ${.5 + .4 * pulse})`; ctx.lineWidth = 2.5;
				ctx.beginPath(); ctx.ellipse(m.sx, m.sy, (26 + 4 * pulse) * zoom, (12 + 2 * pulse) * zoom, 0, 0, Math.PI * 2); ctx.stroke();
				const near = Math.hypot(c.x - player.x, c.y - player.y) < 96;
				ctx.font = `600 ${Math.round(12 * Math.max(1, zoom * .8))}px system-ui, sans-serif`; ctx.textAlign = "center";
				ctx.fillStyle = "rgba(15,12,8,.75)"; const label = near ? (coarse141 ? "Tap to pick up" : "E: pick up") + ` ${node.resource === "wood" ? "wood" : node.resource}` : v14.st === 1 ? "Spruce wood" : node.resource === "wood" ? "Timber" : node.resource;
				const w = ctx.measureText(label).width + 12; ctx.fillRect(m.sx - w / 2, m.sy - 40 * zoom - 14, w, 18);
				ctx.fillStyle = "#f0d890"; ctx.fillText(label, m.sx, m.sy - 40 * zoom);
				ctx.restore();
			}
		}
		if (lockedId >= 0) {
			const foe = world.enemies.find((e) => e.id === lockedId && !e.dead);
			if (foe) {
				const raw = worldToScreen(foe.x, foe.y, drawCamX, drawCamY);
				const mark = zoomPoint(raw.sx, raw.sy);
				ctx.strokeStyle = "#c4543a";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.ellipse(mark.sx, mark.sy + 6, 18 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
				ctx.stroke();
			}
		}
		if (intent?.kind === "walk") {
			const raw = worldToScreen(intent.x, intent.y, drawCamX, drawCamY);
			const mark = zoomPoint(raw.sx, raw.sy);
			ctx.strokeStyle = "#d4a24a";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.ellipse(mark.sx, mark.sy, 12 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
			ctx.stroke();
		}
		for (const part of particles) {
			const raw = worldToScreen(part.x, part.y, drawCamX, drawCamY);
			const p = zoomPoint(raw.sx, raw.sy);
			if (part.puff) {
				// soft dust puff: radial falloff, swells as it fades
				const u = 1 - Math.max(0, part.life / part.max);
				const r = part.size * (1 + u * 2.2) * zoom;
				const g = ctx.createRadialGradient(p.sx, p.sy - r * .3, 0, p.sx, p.sy - r * .3, r);
				const a = .34 * (1 - u) * Math.min(1, u * 6 + .2);
				g.addColorStop(0, `rgba(${part.color},${a})`);
				g.addColorStop(.6, `rgba(${part.color},${a * .5})`);
				g.addColorStop(1, `rgba(${part.color},0)`);
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.ellipse(p.sx, p.sy - r * .3, r, r * .7, 0, 0, Math.PI * 2);
				ctx.fill();
				continue;
			}
			ctx.globalAlpha = Math.max(0, part.life / part.max);
			ctx.fillStyle = part.color;
			if (part.spinV) {
				ctx.save();
				ctx.translate(p.sx, p.sy);
				ctx.rotate(part.spin || 0);
				const w = part.size * zoom;
				ctx.fillRect(-w * .5, -w * .22, w, w * .44);
				ctx.restore();
			} else ctx.fillRect(p.sx, p.sy, part.size * zoom, part.size * zoom);
			ctx.globalAlpha = 1;
		}
		ctx.font = "700 16px Source Sans 3, sans-serif";
		ctx.textAlign = "center";
		for (const pile of piles) {
			if (!hasLoot(pile)) continue;
			const t = tileOf(pile.x, pile.y);
			if (t.tx < 0 || t.ty < 0 || t.tx >= 156 || t.ty >= 156) continue;
			if (!visible[t.ty * 156 + t.tx]) continue;
			const mark = zoomPoint(worldToScreen(pile.x, pile.y, drawCamX, drawCamY).sx, worldToScreen(pile.x, pile.y, drawCamX, drawCamY).sy);
			ctx.strokeStyle = "#d4a24a";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.ellipse(mark.sx, mark.sy, 16 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
			ctx.stroke();
		}
		for (const f of floaters) {
			const raw = worldToScreen(f.x, f.y, drawCamX, drawCamY);
			const p = zoomPoint(raw.sx, raw.sy);
			ctx.fillStyle = "#f0e6d4";
			ctx.fillText(f.text, p.sx, p.sy);
		}
		pAdd("tail", tTail);
		const tMini = performance.now();
		drawMini();
		pAdd("mini", tMini);
	}
	/** v13.4 vehicles: rusted hot rods replace the cars, rusted '50 Chevy pickups replace the trucks.
	 * Any v2/vehicles/car-rod-<1-4>-<se|sw> or truck-chevy-<1-4>-<se|sw> listed in optional.json is mixed in.
	 * Facing follows the road under the wreck (road along x runs NE-SW on screen: SW; along y: SE); off-road it is a coin toss.
	 * Height is the sprite height in world px at 1 ft = 11 px: hot rod about 13 ft long, pickup about 16 ft. */
	const VEH_H = { "car-rod": 112, "truck-chevy": 126 }; // native sprite height: drawn 1:1 (hot rod 145x112, pickup 175x126 at 11 px/ft)
	const vehCache = new WeakMap();
	function vehicleArt(prop) {
		const hit = vehCache.get(prop);
		if (hit) return hit;
		const fam = prop.kind === "car-truck" ? "truck-chevy" : "car-rod";
		const have = [1, 2, 3, 4].filter((i) => images.get(`v2/vehicles/${fam}-${i}-se`) || images.get(`v2/vehicles/${fam}-${i}-sw`));
		const any = have.length ? images.get(`v2/vehicles/${fam}-${have[0]}-se`) || images.get(`v2/vehicles/${fam}-${have[0]}-sw`) : null;
		if (!have.length) return null; // art not loaded yet: old prop for now, decide again next frame
		const h = (((prop.tx * 73856093) ^ (prop.ty * 19349663)) >>> 0) / 4294967296;
		const v = have[Math.floor(h * have.length) % have.length];
		const road = (tx, ty) => { const t = world.tiles[ty * MAP_W + tx]; return t === 2 || t === 5; };
		const alongX = road(prop.tx - 1, prop.ty) + road(prop.tx + 1, prop.ty), alongY = road(prop.tx, prop.ty - 1) + road(prop.tx, prop.ty + 1);
		let face = alongX > alongY ? "sw" : alongY > alongX ? "se" : (h * 977) % 1 < .5 ? "se" : "sw";
		if (!images.get(`v2/vehicles/${fam}-${v}-${face}`)) face = face === "se" ? "sw" : "se";
		const art = { name: `v2/vehicles/${fam}-${v}-${face}`, h: sizedPx(SIZE_IN[prop.kind]) }; // size198: real size, not native px
		vehCache.set(prop, art);
		return art;
	}
	/** Soft contact shadow: a radial falloff ellipse, slightly to the lower right (sun from the upper left). */
	const shadowCache = new Map();
	function softShadow(x, y, rx, name) {
		const tS = performance.now();
		try { softShadow0(x, y, rx, name); } finally { pAdd("shadows", tS); }
	}
	function softShadow0(x, y, rx, name) {
		const flat = /^(ground|road|icon|fx|bait|scrap|sack|hatch|door)/.test(name);
		if (flat || rx < 2) return;
		let key = Math.round(rx);
		let cv = shadowCache.get(key);
		if (!cv) {
			const SQ = CAM_ISO_Y * .84; // v15.7: contact shadow squashed to the camera angle
			cv = document.createElement("canvas"); cv.width = key * 2 + 4; cv.height = Math.ceil(key * SQ * 2) + 4;
			const g2 = cv.getContext("2d");
			g2.scale(1, SQ);
			const cy = cv.height / 2 / SQ;
			const g = g2.createRadialGradient(cv.width / 2, cy, 0, cv.width / 2, cy, key);
			g.addColorStop(0, "rgba(14,16,20,0.62)"); g.addColorStop(.55, "rgba(14,16,20,0.34)"); g.addColorStop(1, "rgba(10,8,6,0)");
			g2.fillStyle = g; g2.fillRect(0, 0, cv.width, cv.height / SQ);
			if (shadowCache.size > 200) shadowCache.clear();
			shadowCache.set(key, cv);
		}
		const day = 1 - nightDark(clock) * .7;
		ctx.save(); ctx.globalAlpha = day; ctx.drawImage(cv, x - cv.width / 2, y - cv.height / 2); ctx.restore();
	}
	// v14.1: 4-frame crossfade. While the hero draws, blit calls are recorded; when the sheet changes
	// (idle → walk, walk → swing...) the old pose is drawn over the new one at 80/60/40/20 % for four frames.
	let xfRec = null, xfLast = null, xf = null;
	function xfWrap(fn, dcx, dcy) {
		const crouch = l1.crouch && !mounted && phase !== "dead";
		if (crouch) {
			const f = zoomPoint(worldToScreen(player.x, player.y, dcx, dcy).sx, worldToScreen(player.x, player.y, dcx, dcy).sy);
			ctx.save(); ctx.translate(f.sx, f.sy); ctx.scale(1.06, .78); ctx.translate(-f.sx, -f.sy);
		}
		xfRec = [];
		try { fn(); } finally {
			const calls = xfRec; xfRec = null;
			const sig = calls.map((c) => c[0]).join("|");
			if (xfLast && sig !== xfLast.sig && calls.length && xfLast.calls.length && !reduceMotion && phase !== "dead") xf = { calls: xfLast.calls, n: 4 };
			if (xf && xf.n > 0) {
				ctx.save(); ctx.globalAlpha = xf.n / 5;
				for (const c of xf.calls) { const a = c.slice(); a[1] = player.x; a[2] = player.y; a[7] = dcx; a[8] = dcy; blit(...a); }
				ctx.restore(); xf.n -= 1; xfStats.n += 1;
			}
			xfLast = { sig, calls };
			if (crouch) ctx.restore();
		}
	}
	const xfStats = { n: 0 };
	let occl141 = false, noShadow141 = false;
	/** v15.9.4: sprites, buildings and props are pre-scaled once to the size they land on screen (device pixels) and
	 * kept in an LRU cache, so each frame is a 1:1 copy instead of a high-quality downscale of the full-size art. */
	const spriteCache = new Map();
	let spriteBytes = 0, spriteIds = 0;
	const SPRITE_BUDGET = 72e6;
	function scaledDraw(src, sx, sy, sw, sh, dx, dy, dw, dh) {
		const t = ctx.getTransform();
		const kx = Math.hypot(t.a, t.b), ky = Math.hypot(t.c, t.d);
		const pw = Math.round(Math.abs(dw) * kx), ph = Math.round(Math.abs(dh) * ky);
		if (pw < 4 || ph < 4 || pw >= sw * .97 || pw * ph > 1400 * 1400 || !ctx.imageSmoothingEnabled) { ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh); return; }
		const id = src.__sc || (src.__sc = ++spriteIds);
		const key = `${id}|${sx}|${sy}|${sw}|${sh}|${pw}|${ph}`;
		let c = spriteCache.get(key);
		if (c) { spriteCache.delete(key); spriteCache.set(key, c); }
		else {
			c = document.createElement("canvas"); c.width = pw; c.height = ph;
			const g = c.getContext("2d");
			if (!g) { ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh); return; }
			g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
			g.drawImage(src, sx, sy, sw, sh, 0, 0, pw, ph);
			spriteCache.set(key, c); spriteBytes += pw * ph * 4;
			while (spriteBytes > SPRITE_BUDGET && spriteCache.size > 1) { const [k0, v0] = spriteCache.entries().next().value; spriteCache.delete(k0); spriteBytes -= v0.width * v0.height * 4; }
		}
		ctx.drawImage(c, dx, dy, dw, dh);
	}
	function blit(name, x, y, drawH, sheet, frame, dir, dcx, dcy, lunge = false, lift = 0, tilt = 0, flatten = 1, flip = false) {
		// v14.1: characters use the 6 hex facings; a leftover N/S facing draws its neighbouring diagonal
		if (sheet && (dir === 0 || dir === 4) && (/^(v2\/)?hero|^pl\/|^overlay-/.test(name) || figFamily(name))) dir = dir === 0 ? 1 : 3;
		if (xfRec) xfRec.push([name, x, y, drawH, sheet, frame, dir, dcx, dcy, lunge, lift, tilt, flatten, flip]);
		const img = images.get(name);
		if (sheet && img && /^v2\/(bandit-[a-z]+|hollowed)-walk$/.test(name) && sheetCols(img) === 8) frame = ((frame || 0) % 4) * 2 + (Math.floor(performance.now() / 110) & 1);
		if (heroLog && /^((v2\/)?hero|pl\/)/.test(name)) { heroLog.push({ name, frame, dir, ok: !!(img && img.width), cols: img ? sheetCols(img) : 0 }); if (heroLog.length > 400) heroLog.shift(); }
		const raw = worldToScreen(x, y, dcx, dcy);
		const foot = zoomPoint(raw.sx, raw.sy);
		const lean = lunge ? lungeOf(dir) : {
			x: 0,
			y: 0
		};
		const p = {
			sx: foot.sx + lean.x * zoom,
			sy: foot.sy + lean.y * zoom
		};
		// armor overlays ride on the hero: no second shadow, and the hero sheet's planted-foot data
		const layer = name.startsWith("overlay-");
		// v14.1 (gif-compare): every person gets the same engine-drawn soft contact shadow, in both graphics modes
		const person = !layer && (/^(v2\/)?hero|^pl\//.test(name) || !!figFamily(name));
		if (person && shadow193 && !noShadow141) softShadow(foot.sx, foot.sy + 1 * zoom, (/cyndal|loki/.test(name) ? 14 : 17) * zoom, name);
		if (!layer && !person && shadow193 && !hiFx() && !noShadow141) {
			ctx.fillStyle = "rgba(12,10,8,0.4)";
			ctx.beginPath();
			ctx.ellipse(foot.sx, foot.sy, 18 * zoom, 18 * CAM_ISO_Y * .89 * zoom, 0, 0, Math.PI * 2);
			ctx.fill();
		}
		if (!img) return;
		const src = heroSource(name, img);
		let sx = 0;
		let sy = 0;
		let sw = img.width;
		let sh = img.height;
		let rows = 1;
		const strips = !sheet && stripFrames(name, img) > 1;
		if (sheet || strips) {
			rows = sheet ? sheetRowsOf(name) : 1;
			const cols = sheetCols(img);
			// v14.1: new character sheets carry 4 rows (SW, NW, NE, SE); 8-row sheets keep loading via their diagonal rows
			// v14.1: new character sheets may carry 6 hex rows (NE, E, SE, SW, W, NW) or 4 diagonal rows; read the count off the height
			if (sheet && img.rowsSeen == null) { const g = Math.round(img.height / (img.width / cols * 124 / 88)); img.rowsSeen = rows === 8 && (g === 6 || g === 4) ? g : 0; img.diag4 = img.rowsSeen === 4; }
			if (sheet && img.rowsSeen) rows = img.rowsSeen;
			sw = img.width / (strips ? 4 : cols);
			sh = img.height / rows;
			sx = frame % (strips ? 4 : cols) * sw;
			sy = (sheet ? facingRow(dir, rows, !!img.diag4) : 0) * sh;
		}
		const footSrc = layer ? images.get(overlayBase) ?? img : img;
		// v15.7: every sprite stands on its real lowest opaque row (measured once, per frame for sheets), not a
		// guessed 0.92, so transparent padding under the feet no longer lifts it off the ground.
		if (footSrc.foot == null && footSrc.width && !footSrc.footTried) {
			footSrc.footTried = true;
			try { const m = measurePose(footSrc, sheet, rows); footSrc.foot = m.foot; if (sheet) footSrc.feet = m.feet; } catch { /* tainted/unloaded: keep default */ }
		}
		let frac = footSrc.foot ?? (sheet || strips ? .92 : .9);
		if ((sheet || strips) && footSrc.feet) {
			const fcols = sheetCols(footSrc);
			const planted = footSrc.feet[(sheet ? facingRow(dir, rows, !!img.diag4) : 0) * fcols + (frame % fcols)];
			if (planted) frac = planted;
		}
		drawH *= heroScale(name);
		drawH *= figScale(name, drawH, images);
		const dh = drawH * zoom;
		SIZE_SEEN.set(name, drawH);
		const dw = dh * (sw / sh);
		// v14.1 (gif-compare): idle and aim holds lock the feet; each frame is shifted so its foot line sits where frame 0's does
		if (sheet && /(idle|-gun)$/.test(name)) {
			const fx = footXOf(img, sheetCols(img), rows, sw, sh);
			const r = facingRow(dir, rows, !!img.diag4), c = frame % sheetCols(img);
			const d = (fx[r * sheetCols(img) + c] ?? 0) - (fx[r * sheetCols(img)] ?? 0);
			p.sx -= d * (dh / sh);
		}
		const spriteY = -dh * frac - lift * zoom;
		if (!layer && !person && shadow193 && hiFx() && !noShadow141) softShadow(foot.sx + 3 * zoom, foot.sy + 1 * zoom, Math.max(12 * zoom, Math.min(dw * .36, (sheet || strips ? 46 : 34) * zoom)), name);
		const smooth = ctx.imageSmoothingEnabled;
		// v13.4: smooth when the sprite lands at a non-integer scale; whole-number upscales stay crisp
		const ratio = dh / sh;
		ctx.imageSmoothingEnabled = hiFx() ? (ratio < .97 || Math.abs(ratio - Math.round(ratio)) > .06) : dh < sh * 0.92;
		ctx.imageSmoothingQuality = hiFx() ? "high" : "medium";
		if (tilt || flatten !== 1 || flip) {
			ctx.save();
			ctx.translate(p.sx, p.sy);
			if (tilt) ctx.rotate(tilt);
			if (flip) ctx.scale(-1, 1);
			if (flatten !== 1) ctx.scale(1, flatten);
			scaledDraw(src, sx, sy, sw, sh, -dw / 2, spriteY, dw, dh);
			ctx.restore();
		} else scaledDraw(src, sx, sy, sw, sh, p.sx - dw / 2, p.sy + spriteY, dw, dh);
		if (!sheet && !strips && !tilt && !flip && PROP_OVERLAYS[name]) paintOverlays(name, p.sx - dw / 2, p.sy + spriteY, dw / img.width);
		ctx.imageSmoothingEnabled = smooth;
	}
	/** v15.8: Quest RPG's v4 map overlays (boarded windows, missing shingles) pinned onto building art.
	 * [overlay, x, y, w (px in the building image), skewY to match that wall/roof face of the 2:1 art]. */
	const PROP_OVERLAYS = {
		farmhouse: [["boarded_window_house_v4", 93, 124, 21, 0], ["boarded_window_hall_v4", 249, 133, 20, -.28], ["boarded_window_house_v4", 249, 194, 24, -.28]],
		shack: [["boarded_window_hall_v4", 232, 124, 30, -.45], ["shingle_holes_v4", 150, 70, 120, -.55]],
	};
	function paintOverlays(name, x0, y0, k) {
		for (const [ov, ox, oy, ow, skew] of PROP_OVERLAYS[name]) {
			const im = images.get(`v4/overlays/${ov}`); if (!im) continue;
			const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, w = ow * k, h = w * ih / iw;
			ctx.save(); ctx.translate(x0 + ox * k, y0 + oy * k); ctx.transform(1, skew, 0, 1, 0, 0); ctx.globalAlpha *= .95; ctx.drawImage(im, 0, 0, w, h); ctx.restore();
		}
	}
	function enemyUnder(sx, sy) {
		if (!world) return null;
		let best = null;
		let feet = -Infinity;
		for (const e of world.enemies) {
			if (e.dead) continue;
			const h = beastH(e);
			if (!bodyContains(e.x, e.y, h, sx, sy)) continue;
			const raw = worldToScreen(e.x, e.y, camX, camY);
			const p = zoomPoint(raw.sx, raw.sy);
			if (p.sy >= feet) {
				feet = p.sy;
				best = e;
			}
		}
		return best;
	}
	function bodyContains(wx, wy, drawH, sx, sy) {
		const raw = worldToScreen(wx, wy, camX, camY);
		const p = zoomPoint(raw.sx, raw.sy);
		// v29: real-size rabbits/squirrels are ~10px tall; keep a finger-sized minimum target
		const h = Math.max(drawH, 40) * zoom;
		const half = Math.max(22, h * .36);
		return sx >= p.sx - half && sx <= p.sx + half && sy <= p.sy + 14 * zoom && sy >= p.sy - h;
	}
	function pileContains(wx, wy, wide, sx, sy) {
		const raw = worldToScreen(wx, wy, camX, camY);
		const p = zoomPoint(raw.sx, raw.sy);
		const rx = (wide ? 58 : 32) * zoom;
		const ry = (wide ? 26 : 16) * zoom;
		const dx = (sx - p.sx) / rx;
		const dy = (sy - p.sy) / ry;
		return dx * dx + dy * dy <= 1;
	}
	function zoomPoint(sx, sy) {
		return {
			sx: viewW / 2 + (sx - viewW / 2) * zoom,
			sy: viewH / 2 + (sy - viewH / 2) * zoom
		};
	}
	function unzoomPoint(sx, sy) {
		return {
			sx: viewW / 2 + (sx - viewW / 2) / zoom,
			sy: viewH / 2 + (sy - viewH / 2) / zoom
		};
	}
	function lungeOf(dir) {
		return [
			{
				x: 0,
				y: 12
			},
			{
				x: -10,
				y: 8
			},
			{
				x: -14,
				y: 0
			},
			{
				x: -10,
				y: -8
			},
			{
				x: 0,
				y: -12
			},
			{
				x: 10,
				y: -8
			},
			{
				x: 14,
				y: 0
			},
			{
				x: 10,
				y: 8
			}
		][dir] ?? {
			x: 0,
			y: 10
		};
	}
	function bar(x, y, drawH, ratio, dcx, dcy) {
		const raw = worldToScreen(x, y, dcx, dcy);
		const p = zoomPoint(raw.sx, raw.sy);
		const w = 36 * zoom;
		const top = p.sy - drawH * zoom - 8;
		ctx.fillStyle = "#241c16";
		ctx.fillRect(p.sx - w / 2, top, w, 5);
		ctx.fillStyle = "#c4543a";
		ctx.fillRect(p.sx - w / 2, top, w * Math.max(0, Math.min(1, ratio)), 5);
	}
	function viewTiles(dcx, dcy) {
		const corners = [
			0,
			0,
			viewW,
			0,
			0,
			viewH,
			viewW,
			viewH
		];
		const pts = [];
		for (let i = 0; i < corners.length; i += 2) {
			const u = unzoomPoint(corners[i], corners[i + 1]);
			pts.push(screenToWorld(u.sx, u.sy, dcx, dcy));
		}
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		for (const c of pts) {
			minX = Math.min(minX, c.x);
			maxX = Math.max(maxX, c.x);
			minY = Math.min(minY, c.y);
			maxY = Math.max(maxY, c.y);
		}
		return {
			tx0: Math.floor(minX / 64) - 5,
			ty0: Math.floor(minY / 64) - 5,
			tx1: Math.ceil(maxX / 64) + 3,
			ty1: Math.ceil(maxY / 64) + 3
		};
	}
	/** v11.2 full map: only explored tiles show (fog of war), with quest markers and you. */
	function drawWorldMap(c) {
		const g = c.getContext("2d");
		if (!g) return;
		const w = c.width, h = c.height;
		g.fillStyle = "#0c0f0c";
		g.fillRect(0, 0, w, h);
		if (!world || !player) return;
		const sx = w / 156, sy = h / 156;
		const colors = ["#6e5a3e", "#3e5a3a", "#7a7568", "#4a5248", "#d9e0dc"];
		for (let ty = 0; ty < 156; ty++) for (let tx = 0; tx < 156; tx++) {
			const i = ty * 156 + tx;
			const tile = world.tiles[i] ?? 0;
			if (!explored[i]) continue;
			g.fillStyle = tile === 5 ? "#24384a" : colors[tile] ?? "#8a7048";
			g.fillRect(tx * sx, ty * sy, Math.ceil(sx), Math.ceil(sy));
		}
		g.fillStyle = "rgba(240,230,212,.35)";
		for (const p of world.props) {
			if (!explored[p.ty * 156 + p.tx] || !canWalkIn(p)) continue;
			g.fillRect(p.tx * sx - 1, p.ty * sy - 1, 4, 4);
		}
		q10Mini(g, sx, sy);
		const pt = tileOf(player.x, player.y);
		g.fillStyle = "#f0e6d4";
		g.beginPath(); g.arc(pt.tx * sx, pt.ty * sy, 5, 0, Math.PI * 2); g.fill();
		g.strokeStyle = "#101410"; g.lineWidth = 2; g.stroke();
	}
	let nrT = -1e9, nrNode = null;
	let fadeFrame = 0, fadeKeep = new Set();
	let miniT = -1e9, miniBase = null, miniBaseT = -1e9, miniBaseW = null;
	function drawMini() {
		// v15.9.3: the minimap repaints a few times a second, not every frame
		if (world && player && renderNow - miniT < (perfMode ? 400 : 200) && renderNow >= miniT) return;
		miniT = renderNow;
		if (typeof mctx.reset === "function") mctx.reset();
		const w = mini.width;
		const h = mini.height;
		mctx.fillStyle = "#101410";
		mctx.fillRect(0, 0, w, h);
		if (!world || !player) return;
		const sx = w / 156;
		const sy = h / 156;
		const colors = [
			"#6e5a3e",
			"#3e5a3a",
			"#7a7568",
			"#4a5248",
			"#d9e0dc"
		];
		// v15.9.3: the 24k-tile terrain pass is cached and rebuilt every ~1.5 s (or on a new map)
		if (!miniBase || miniBase.width !== w || miniBase.height !== h) { miniBase = document.createElement("canvas"); miniBase.width = w; miniBase.height = h; miniBaseT = -1e9; }
		if (miniBaseW !== world || renderNow - miniBaseT > 1500 || renderNow < miniBaseT) {
			miniBaseW = world; miniBaseT = renderNow;
			const bctx = miniBase.getContext("2d");
			bctx.clearRect(0, 0, w, h);
			for (let ty = 0; ty < 156; ty++) for (let tx = 0; tx < 156; tx++) {
				const i = ty * 156 + tx;
				const tile = world.tiles[i] ?? 0;
				if (!explored[i] || tile === 5) continue;
				const fade = landFadeAt(tx + .5, ty + .5, tile);
				if (fade < .28) continue;
				const seen = visible[i] === 1;
				bctx.globalAlpha = seen ? .55 + fade * .45 : .8;
				bctx.fillStyle = seen ? colors[tile] ?? "#8a7048" : "#3a342c";
				bctx.fillRect(tx * sx, ty * sy, Math.ceil(sx) + .5, Math.ceil(sy) + .5);
			}
		}
		mctx.drawImage(miniBase, 0, 0);
		mctx.globalAlpha = 1;
		const rawObj = objectiveTile(quest);
		const obj = { tx: rawObj.tx + WORLD_OX, ty: rawObj.ty + WORLD_OY };
		if (mapId === 0 && visible[obj.ty * 156 + obj.tx]) {
			mctx.fillStyle = "#d4a24a";
			mctx.fillRect(obj.tx * sx - 1, obj.ty * sy - 1, 3, 3);
		}
		if (mapId === 0 && jackTrust > 0 && !bunkerSeen) {
			const hatch = world.props.find((p) => p.kind === "hatch");
			if (hatch) {
				mctx.fillStyle = "#7fbf6a";
				mctx.fillRect(hatch.tx * sx - 1.5, hatch.ty * sy - 1.5, 4, 4);
			}
		}
		q10Mini(mctx, sx, sy);
		const pt = tileOf(player.x, player.y);
		mctx.fillStyle = "#f0e6d4";
		mctx.fillRect(pt.tx * sx - 1, pt.ty * sy - 1, 3, 3);
	}
	function onKeyDown(e) {
		if (phase === "menu" || phase === "dialogue") return;
		if ([
			"Space",
			"KeyE",
			"KeyB",
			"Escape",
			"ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"
		].includes(e.code)) e.preventDefault();
		keys.add(e.code);
		if (e.repeat) return;
		if (e.code === "Escape" && phase === "play") {
			phase = "pause";
			sync(true);
		} else if (e.code === "Escape" && phase === "pause") {
			phase = "play";
			sync(true);
		} else if (e.code === "Space" && phase === "play") {
			edges.attack = true;
		} else if (e.code === "KeyI" && phase === "play") {
			packOpen = !packOpen; if (packOpen) { statsOpen = false; buildOpen = false; }
			sync(true);
		} else if (e.code === "KeyC" && phase === "play") {
			craftOpen = false; // v15.9.5: no workbench; crafting is at the town shops
			sync(true);
		} else if (e.code === "KeyX" && phase === "play") {
			setCrouch(!l1.crouch);
		} else if (e.code === "KeyB" && phase === "play" && !prevHeld.has("KeyB")) {
			buildOpen = !buildOpen;
			sfx("click");
			sync(true);
		} else if (phase === "play" && [
			"Digit1",
			"Digit2",
			"Digit3",
			"Digit4"
		].includes(e.code) && buildOpen) {
			recipe = Number(e.code.slice(5)) - 1;
			sync(true);
		}
	}
	function onKeyUp(e) {
		keys.delete(e.code);
	}
	const tractorLerp = [];
	function snapPrev() {
		if (!world || !player) return;
		player.px = player.x; player.py = player.y;
		if (party) { party.px = party.x; party.py = party.y; }
		if (turnBased) for (const e of world.enemies) { e.px = e.x; e.py = e.y; } // v15.9.4: otherwise snapped on the AI tick
		for (const n of world.npcs) { n.px = n.x; n.py = n.y; }
		// v14.1: the tractor's charge and the parked bike interpolate too
		for (const p of world.props) if (p.kind === "tractor" || p.kind === "bike") { p.pc = p.charge || 0; p.ppx = p.x; p.ppy = p.y; }
	}
	// v15.9.4: FPS counter (pause menu, off by default) and a 30 / 60 fps cap (default 60)
	let showFps = (() => { try { return localStorage.getItem("maine-rpg-fps") === "on"; } catch { return false; } })();
	let fpsCap = (() => { try { return localStorage.getItem("maine-rpg-cap") === "30" ? 30 : 60; } catch { return 60; } })();
	const fpsTimes = [];
	let fpsNow = 0;
	function paintFps() {
		if (!showFps) return;
		const dpr = canvas.width / Math.max(1, viewW);
		ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
		const label = `${fpsNow} fps`;
		ctx.font = "700 13px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
		const w = ctx.measureText(label).width + 12;
		ctx.fillStyle = "rgba(10,8,6,.72)"; ctx.fillRect(10, 50, w, 20);
		ctx.fillStyle = fpsNow >= 50 ? "#9be07a" : fpsNow >= 28 ? "#f0d070" : "#f07a5a"; ctx.fillText(label, 16, 60);
		ctx.restore();
	}
	function frame(now) {
		if (!running) return;
		if (fpsCap === 30 && now - last < 1000 / 30 - 4) { requestAnimationFrame(frame); return; }
		fpsTimes.push(now); while (fpsTimes.length && now - fpsTimes[0] > 1000) fpsTimes.shift();
		fpsNow = fpsTimes.length;
		const dt = Math.min(.1, (now - last) / 1e3);
		last = now;
		acc += dt;
		let guard = 0;
		const tStep = performance.now();
		while (acc >= STEP && guard < 5) {
			{ const _t = performance.now(); snapPrev(); pAdd("u:snapPrev", _t); }
			step(STEP);
			acc -= STEP;
			guard++;
		}
		pAdd("step", tStep);
		const t0 = performance.now();
		renderNow = now;
		// v14 render interpolation: draw every body between its last two sim positions (alpha = leftover / step)
		const alpha = Math.min(1, acc / STEP);
		let nl = 0;
		if (world && player && phase === "play" && !inside) {
			const put = (b) => { if (b && b.px != null && Math.abs(b.x - b.px) < 40 && Math.abs(b.y - b.py) < 40) { lerpBodies[nl++] = b; b.sx0 = b.x; b.sy0 = b.y; b.x = b.px + (b.x - b.px) * alpha; b.y = b.py + (b.y - b.py) * alpha; } };
			put(player); put(party);
			// v15.9.4: foes move on the 20 Hz AI tick, so they blend across it
			const alphaE = turnBased ? alpha : Math.min(1, (aiAcc + acc) / AI_DT);
			for (const e of world.enemies) if (!e.dead && e.px != null && Math.abs(e.x - e.px) < 40 && Math.abs(e.y - e.py) < 40) { lerpBodies[nl++] = e; e.sx0 = e.x; e.sy0 = e.y; e.x = e.px + (e.x - e.px) * alphaE; e.y = e.py + (e.y - e.py) * alphaE; }
			for (const n of world.npcs) put(n);
			for (const p of world.props) if (p.kind === "tractor" && p.pc != null && (p.charge || 0) > 0 && p.charge >= p.pc) { p.c0 = p.charge; p.charge = p.pc + (p.charge - p.pc) * alpha; tractorLerp.push(p); }
		}
		render();
		paintFps();
		for (let i = 0; i < nl; i++) { const b = lerpBodies[i]; b.x = b.sx0; b.y = b.sy0; }
		for (const p of tractorLerp) p.charge = p.c0;
		tractorLerp.length = 0;
		const ms = performance.now() - t0;
		frameMs.avg = frameMs.avg * .95 + ms * .05; frameMs.n++; frameMs.worst = Math.max(frameMs.worst * .995, ms);
		frameMs.list.push(ms); if (frameMs.list.length > 240) frameMs.list.shift();
		if (perf.on) { perf.frames++; perf.acc.render = (perf.acc.render || 0) + ms; perf.acc.frame = (perf.acc.frame || 0) + (performance.now() - now); }
		requestAnimationFrame(frame);
	}
	function pick(x, y, sx, sy) {
		if (!world || !player || phase !== "play") return;
		hoverX = x;
		hoverY = y;
		if (buildOpen) {
			tryBuild();
			return;
		}
		const picked = {
			kind: "",
			id: -1,
			feet: -Infinity
		};
		const consider = (wx, wy, drawH, kind, id) => {
			if (!bodyContains(wx, wy, drawH, sx, sy)) return;
			const feet = zoomPoint(worldToScreen(wx, wy, camX, camY).sx, worldToScreen(wx, wy, camX, camY).sy).sy;
			if (feet >= picked.feet) {
				picked.feet = feet;
				picked.kind = kind;
				picked.id = id;
			}
		};
		for (const e of world.enemies) {
			if (e.dead) continue;
			consider(e.x, e.y, beastH(e), "enemy", e.id);
		}
		for (const n of world.npcs) consider(n.x, n.y, folkHeight(n), "npc", n.id);
		for (const p of world.props) {
			if (!p.resource) continue;
			const c = propCenter(p);
			const spec = PROP_SPEC[p.kind];
			consider(c.x, c.y, spec.drawH, "prop", p.id);
		}
		for (const p of world.props) {
			if (p.kind !== "bike" || p.id === mountId) continue;
			const c = propCenter(p);
			consider(c.x, c.y, 120, "bike", p.id);
		}
		for (const p of world.props) {
			if (p.kind !== "shack" && p.kind !== "shelter" && p.kind !== "workshop" && p.kind !== "ruin" && p.kind !== "farmhouse" && p.kind !== "barn" && p.kind !== "hatch") continue;
			const c = propCenter(p);
			consider(c.x, c.y, p.kind === "hatch" ? 130 : PROP_SPEC[p.kind].drawH, "house", p.id);
		}
		for (const p of world.props) {
			if (!p.kind.startsWith("tree")) continue;
			const c = propCenter(p);
			consider(c.x, c.y, PROP_SPEC[p.kind].drawH * .72, "tree", p.id);
		}
		for (const p of world.props) {
			if (!(p.kind === "press" || p.kind === "crates" || p.kind === "orchard" || p.kind === "maple" || ART14.has(p.kind))) continue;
			const c = propCenter(p);
			consider(c.x, c.y, Math.max(40, PROP_SPEC[p.kind].drawH * .8), "prop", p.id);
		}
		for (const p of world.props) {
			if (p.kind !== "rock") continue;
			const c = propCenter(p);
			consider(c.x, c.y, PROP_SPEC.rock.drawH, "rock", p.id);
		}
		let corpseId = -1;
		let corpseFeet = -Infinity;
		for (const pile of piles) {
			if (!hasLoot(pile)) continue;
			if (!pileContains(pile.x, pile.y, !!(pile.body || pile.folk), sx, sy)) continue;
			const feet = zoomPoint(worldToScreen(pile.x, pile.y, camX, camY).sx, worldToScreen(pile.x, pile.y, camX, camY).sy).sy;
			if (feet >= corpseFeet) {
				corpseFeet = feet;
				corpseId = pile.id;
			}
		}
		if (!(picked.kind === "enemy" || picked.kind === "npc" || picked.kind === "house" || picked.kind === "bike") && corpseId >= 0) {
			picked.kind = "loot";
			picked.id = corpseId;
		}
		if (work && work.fall <= 0) {
			const same = (picked.kind === "tree" && work.mode === "chop" || picked.kind === "rock" && work.mode === "mine") && work.id === picked.id;
			if (!same) work = null;
		}
		if (picked.kind !== "loot" && lootId >= 0) lootId = -1;
		if (picked.kind === "enemy") {
			const e = world.enemies.find((en) => en.id === picked.id);
			const family = GEAR[player.weaponId]?.family;
			if (isGun(family) && shellCount(player) <= 0) {
				intent = null;
				pushLog("Out of shells.");
				sfx("click");
			} else intent = {
				kind: "attack",
				id: e.id,
				who: "enemy",
				path: pathTo(world, player.x, player.y, e.x, e.y) ?? []
			};
		} else if (picked.kind === "npc") {
			const n = world.npcs.find((nn) => nn.id === picked.id);
			if (Math.hypot(n.x - player.x, n.y - player.y) < 70) openTalk(n);
			else intent = {
				kind: "talk",
				id: n.id,
				path: pathTo(world, player.x, player.y, n.x, n.y) ?? []
			};
		} else if (picked.kind === "prop") {
			const p = world.props.find((pp) => pp.id === picked.id);
			const c = propCenter(p);
			const near = Math.hypot(c.x - player.x, c.y - player.y) < 72;
			if (USE159[p.kind] && Math.hypot(c.x - player.x, c.y - player.y) < 120) { use159(p); return; }
			if ((p.kind === "press" || p.kind === "crates" || p.kind === "orchard" || p.kind === "maple" || ART14.has(p.kind))) {
				if (near || ART14.has(p.kind) && Math.hypot(c.x - player.x, c.y - player.y) < 110) farmAction(p);
				else intent = {
					kind: "walk",
					x: c.x,
					y: c.y,
					path: pathTo(world, player.x, player.y, c.x, c.y) ?? []
				};
			} else if (near) gather(p);
			else intent = {
				kind: "gather",
				id: p.id,
				path: pathTo(world, player.x, player.y, c.x, c.y) ?? []
			};
		} else if (picked.kind === "house") {
			const p = world.props.find((pp) => pp.id === picked.id);
			// On a phone the building fills the screen around its own door, so right after stepping out
			// nearly every tap lands on it. Until the hero has walked off the step (or 8 s pass), a tap on
			// that building walks instead of re-entering.
			const fresh = justLeft && p && justLeft.id === p.id && performance.now() - justLeft.t < 8e3 && Math.hypot(player.x - justLeft.x, player.y - justLeft.y) < 110;
			if (fresh) intent = {
				kind: "walk",
				x,
				y,
				path: pathTo(world, player.x, player.y, x, y) ?? []
			};
			else if (p) startEnter(p);
		} else if (picked.kind === "bike") {
			const p = world.props.find((pp) => pp.id === picked.id);
			if (p) startMount(p);
		} else if (picked.kind === "tree") {
			const p = world.props.find((pp) => pp.id === picked.id);
			if (p) chopTree(p);
		} else if (picked.kind === "rock") {
			const p = world.props.find((pp) => pp.id === picked.id);
			if (p) breakRock(p);
		} else if (picked.kind === "loot") {
			const pile = piles.find((p) => p.id === picked.id);
			if (pile && Math.hypot(pile.x - player.x, pile.y - player.y) <= 64) openLoot(pile);
			else if (pile) intent = {
				kind: "loot",
				id: pile.id,
				path: pathTo(world, player.x, player.y, pile.x, pile.y) ?? []
			};
		} else intent = {
			kind: "walk",
			x,
			y,
			path: pathTo(world, player.x, player.y, x, y) ?? []
		};
	}
	const onBlur = () => keys.clear();
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	window.addEventListener("blur", onBlur);
	/** Keep progress when the app goes to the background (Android home button, app switch, screen off). */
	const saveNow = () => {
		try {
			if (player && world && phase !== "menu") saveGame();
		} catch {}
	};
	const onVis = () => {
		if (document.hidden) {
			keys.clear();
			saveNow();
		} else unlockAudio();
	};
	document.addEventListener("visibilitychange", onVis);
	window.addEventListener("pagehide", saveNow);
	window.__maineSave = saveNow;
	const onWheel = (e) => {
		if (phase === "menu") return;
		e.preventDefault();
		applyZoom(e.deltaY > 0 ? 1 / 1.12 : 1.12);
	};
	canvas.addEventListener("wheel", onWheel, { passive: false });
	function applyZoom(factor) {
		zoom = Math.min(2.4, Math.max(.32, zoom * factor));
	}
	loadImages(images).then(() => {
		useHud.setState({
			ready: true,
			hasSave: hasSave(),
			slot: getSlot(),
			slots: slotInfos(),
			auto: autoInfo()
		});
	});
	useHud.setState({
		hasSave: hasSave(),
		slot: getSlot(),
		slots: slotInfos(),
		auto: autoInfo(),
		ready: false
	});
	function craft(id) {
		if (!player || phase !== "play") return;
		const recipe = CRAFT.find((r) => r.id === id);
		if (!recipe || !GEAR[recipe.item]) return;
		if (recipe.tier && (v3.up.bench || 0) < recipe.tier) {
			pushLog(recipe.tier >= 2 ? "That wants a machine shop. Upgrade the workbench (Sarah: bigger works)." : "That wants a forge. Upgrade the workbench (Sarah: bigger works).");
			return;
		}
		if (recipe.bench && !inFarm(tileOf(player.x, player.y).tx, tileOf(player.x, player.y).ty)) {
			pushLog("That wants the workbench in the barn at Cambridge Road.");
			sfx("click");
			sync(true);
			return;
		}
		if (player.scrap < recipe.iron || player.wood < recipe.wood) {
			pushLog("Short on timber or iron.");
			sfx("click");
			sync(true);
			return;
		}
		for (const need of recipe.need) if (player.bag.reduce((n, s) => n + (s.id === need.id ? s.qty : 0), 0) < need.qty) {
			pushLog(`Need more ${GEAR[need.id]?.name ?? "stock"}.`);
			sfx("click");
			sync(true);
			return;
		}
		const out = GEAR[recipe.item];
		if (!player.bag.some((s) => s.id === recipe.item && s.qty > 0)) {
			let slots = player.bag.filter((s) => s.qty > 0).length;
			for (const need of recipe.need) {
				const stack = player.bag.find((s) => s.id === need.id);
				if (stack && stack.qty <= need.qty) slots -= 1;
			}
			if (!canFit(player, recipe.item)) {
				pushLog("Pack full.");
				sfx("click");
				sync(true);
				return;
			}
		}
		player.scrap -= recipe.iron;
		player.wood -= recipe.wood;
		for (const need of recipe.need) {
			let left = need.qty;
			for (const stack of player.bag) {
				if (stack.id !== need.id || left <= 0) continue;
				const use = Math.min(stack.qty, left);
				stack.qty -= use;
				left -= use;
			}
		}
		player.bag = player.bag.filter((s) => s.qty > 0);
		let made = 0;
		for (let i = 0; i < recipe.qty; i++) {
			if (!tryGive(recipe.item)) break;
			made += 1;
		}
		pushLog(made ? `Made ${made} ${out.name}.` : "Nothing made.");
		sfx("click");
		saveGame();
		sync(true);
	}
	// ======== v15 Fallout-style turn-based combat (flat hexes under the iso world) ========
	const HEX15 = 30; // flat-top hex radius in world units; neighbours are 52 apart
	const HEX15_DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
	const TB_COST = { move: 1, melee: 3, gun: 4, aimed: 1, reload: 2, item: 2 };
	const MAG15 = { revolver: 6, carbine: 5, scatter: 2 };
	const AIM15 = [["head", "Head", -30], ["eyes", "Eyes", -40], ["arms", "Arms", -15], ["torso", "Torso", 0], ["groin", "Groin", -25], ["legs", "Legs", -10]];
	const TB_BASE_HIT = 55, TB_FOE_MISS = .18; // v15.1 balance (was 48 and .12)
	let tb = null;
	let tbPaid = false, tbChanceNext = null;
	let tbAuto = (() => { try { return localStorage.getItem("maine-rpg-tb15") !== "off"; } catch { return true; } })();
	const hexOf15 = (x, y) => {
		const fq = (2 / 3 * x) / HEX15, fr = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / HEX15, fs = -fq - fr;
		let q = Math.round(fq), r = Math.round(fr); const s = Math.round(fs);
		const dq = Math.abs(q - fq), dr = Math.abs(r - fr), ds = Math.abs(s - fs);
		if (dq > dr && dq > ds) q = -r - s; else if (dr > ds) r = -q - s;
		return { q, r };
	};
	const hexXY15 = (h) => ({ x: HEX15 * 1.5 * h.q, y: HEX15 * Math.sqrt(3) * (h.r + h.q / 2) });
	const hexDist15 = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
	const tbHostile = (e) => !e.dead && e.aggro && e.temper !== "timid" && !e.lineup141;
	const agil15 = () => Number(w13.core?.agility) || 1;
	const tbApMax = () => 5 + Math.floor(agil15() / 2);
	function tbFoe(id) { return world?.enemies.find((e) => e.id === id && !e.dead) ?? null; }
	function hexFree15(h, self) {
		const c = hexXY15(h);
		if (pointBlocked(world, c.x, c.y, RADIUS)) return false;
		if (self !== "p" && player && hexDist15(hexOf15(player.x, player.y), h) === 0) return false;
		return !world.enemies.some((e) => !e.dead && e !== self && hexDist15(hexOf15(e.x, e.y), h) === 0);
	}
	function snap15(body) {
		const h = hexOf15(body.x, body.y);
		let best = h;
		if (!hexFree15(h, body === player ? "p" : body)) for (const [dq, dr] of HEX15_DIRS) { const n = { q: h.q + dq, r: h.r + dr }; if (hexFree15(n, body === player ? "p" : body)) { best = n; break; } }
		const c = hexXY15(best); body.x = c.x; body.y = c.y;
		if (body.path) body.path = [];
	}
	function tbCanStart() {
		return tbAuto && !(typeof window !== "undefined" && window.__tbOff) && !(player && safeAt(player.x, player.y)) && !inside && phase === "play" && player && world && !mounted;
	}
	function tbStart(foes) {
		const roll = () => 1 + Math.floor(Math.random() * 6);
		turnBased = true; apMax = tbApMax(); ap = apMax; apWalk = 0; intent = null; holdWalk = false; work = null;
		snap15(player);
		const order = [{ id: "p", init: perc() + agil15() * 2 + roll() }];
		for (const e of foes) { snap15(e); order.push({ id: e.id, init: (e.kind === "wolf" || e.kind === "coyote" ? 6 : 4) + roll() }); }
		order.sort((a, b) => b.init - a.init);
		if (false) { const me = order.findIndex((o) => o.id === "p"); if (me > 0) order.unshift(...order.splice(me, 1)); }
		tb = { order, turn: 0, round: 1, moveQ: [], anim: null, eAp: 0, eT: 0, popup: null, mag: {}, log: [] };
		pushLog(`Combat! Turn order: ${order.map((o) => o.id === "p" ? "you" : tbFoe(o.id)?.name ?? bodyTitle(tbFoe(o.id)?.kind ?? "foe")).join(", ")}.`);
		tbBeginTurn();
		sfx("hit");
		sync(true);
	}
	function tbEnd(why) {
		tb = null; turnBased = false; ap = apMax; intent = null;
		pushLog(why || "Combat over. Real time again.");
		sync(true);
	}
	const tbCur = () => tb?.order[tb.turn] ?? null;
	const tbMine = () => tbCur()?.id === "p";
	function tbBeginTurn() {
		const cur = tbCur();
		if (!cur) return;
		if (cur.id === "p") { ap = apMax; apWalk = 0; tb.popup = null; }
		else {
			const e = tbFoe(cur.id); tb.eAp = e ? tbEnemyAp(e) : 0; tb.eT = .35;
			// v15.1: Goose's tricks (harmony.gooseTricks): when he's with you he sometimes darts in and costs a foe two AP
			if (e && w13.main?.flags?.gooseHelps && dogBody && q10.dog >= 4 && v3.dog.mode !== "stay" && !(v3.dog.down >= 0) && Math.hypot(dogBody.x - e.x, dogBody.y - e.y) < 6 * TILE && Math.random() < .3) {
				tb.eAp = Math.max(0, tb.eAp - 2); pushLog(`Goose darts in and snaps at the ${e.name ?? bodyTitle(e.kind)}. It loses a step.`);
			}
		}
		sync(true);
	}
	function tbNext() {
		if (!tb) return;
		tb.order = tb.order.filter((o) => o.id === "p" || tbFoe(o.id));
		if (tbOverCheck()) return;
		tb.turn = (tb.turn + 1) % tb.order.length;
		if (tb.turn === 0) {
			tb.round++;
			// anything new that's spotted you joins the fight
			for (const e of world.enemies) if (tbHostile(e) && !tb.order.some((o) => o.id === e.id) && Math.hypot(e.x - player.x, e.y - player.y) < 360) { snap15(e); tb.order.push({ id: e.id, init: 0 }); }
			for (const e of world.enemies) { e.crippleArm = Math.max(0, (e.crippleArm || 0) - 1); e.crippleLeg = Math.max(0, (e.crippleLeg || 0) - 1); }
		}
		tbBeginTurn();
	}
	function tbOverCheck() {
		if (!tb || !player) return true;
		const near = world.enemies.some((e) => tbHostile(e) && Math.hypot(e.x - player.x, e.y - player.y) < 560);
		if (!near) { tbEnd("No one left to fight. Real time again."); return true; }
		return false;
	}
	function tbPathTo(target, budget) {
		const start = hexOf15(player.x, player.y), key = (h) => `${h.q},${h.r}`;
		const prev = new Map([[key(start), null]]), q = [start];
		while (q.length) {
			const h = q.shift();
			if (h.q === target.q && h.r === target.r) break;
			for (const [dq, dr] of HEX15_DIRS) {
				const n = { q: h.q + dq, r: h.r + dr }, k = key(n);
				if (prev.has(k) || hexDist15(start, n) > budget + 2 || !hexFree15(n, "p")) continue;
				prev.set(k, h); q.push(n);
			}
		}
		if (!prev.has(key(target))) return null;
		const out = [];
		for (let h = target; h && key(h) !== key(start); h = prev.get(key(h))) out.unshift(h);
		return out;
	}
	const moveCost15 = () => TB_COST.move * (injured("legs") ? 2 : 1);
	function tbChance(e, part) {
		const fam = GEAR[player.weaponId]?.family, gun = isGun(fam);
		const d = hexDist15(hexOf15(player.x, player.y), hexOf15(e.x, e.y));
		if (!gun && d > 1) return 0;
		if (gun && Math.hypot(e.x - player.x, e.y - player.y) > swingOf().range + 30) return 0;
		const mod = AIM15.find((a) => a[0] === part)?.[2] ?? 0;
		let c = TB_BASE_HIT + skillOf(gun ? "rifle" : "melee") * .45 + perc() * 3 + (player.luck || 0) + mod - (gun ? Math.max(0, d - 2) * 4 : 0);
		if (injured("blind")) c *= INJ_FX.blindAim;
		if (injured("arms")) c *= INJ_FX.armAim;
		return Math.max(5, Math.min(95, Math.round(c)));
	}
	function tbAttackCost(part) { const gun = isGun(GEAR[player.weaponId]?.family); return (gun ? TB_COST.gun : TB_COST.melee) + (part !== "torso" ? TB_COST.aimed : 0); }
	function tbMagOf() { const fam = GEAR[player.weaponId]?.family; return player.weaponId === "levergun" ? 4 : MAG15[fam] ?? 0; }
	function tbLoaded() { const m = tbMagOf(); if (!m) return Infinity; if (tb.mag[player.weaponId] == null) tb.mag[player.weaponId] = Math.min(m, shellCount(player)); return tb.mag[player.weaponId]; }
	function tbPopup(e) {
		const parts = AIM15.map(([part, label]) => ({ part, label, hit: tbChance(e, part), ap: tbAttackCost(part) }));
		tb.popup = { id: e.id, name: e.name ?? bodyTitle(e.kind), parts };
		sync(true);
	}
	function tbAttack(id, part) {
		const e = tbFoe(id);
		if (!tb || !tbMine() || !e || tb.anim || tb.moveQ.length) return false;
		const cost = tbAttackCost(part), hit = tbChance(e, part);
		tb.popup = null;
		if (!hit) { pushLog(isGun(GEAR[player.weaponId]?.family) ? "Out of range." : "Too far. Move next to it first."); sync(true); return false; }
		if (ap < cost) { pushLog("Not enough action points."); sync(true); return false; }
		if (tbMagOf() && tbLoaded() <= 0) { pushLog("Empty. Reload first."); sync(true); return false; }
		ap -= cost;
		if (tbMagOf()) tb.mag[player.weaponId]--;
		aim = part; tbChanceNext = hit; tbPaid = true; player.cooldown = 0;
		try { strikeEnemy(e); } finally { tbPaid = false; }
		sync(true);
		return true;
	}
	function tbReload() {
		if (!tb || !tbMine()) return;
		const m = tbMagOf();
		if (!m) { pushLog("Nothing to reload."); return sync(true); }
		const cost = TB_COST.reload + (player.weaponId === "levergun" ? 1 : 0);
		if (ap < cost) { pushLog("Not enough action points."); return sync(true); }
		ap -= cost; tb.mag[player.weaponId] = Math.min(m, shellCount(player));
		pushLog(`Reloaded: ${tb.mag[player.weaponId]} in the gun.`); sfx("click"); sync(true);
	}
	function tbEndPlayerTurn() { if (tb && tbMine() && !tb.anim) { tb.popup = null; pushLog("You end your turn."); tbNext(); } }
	function tbTap(sx, sy, wp) {
		if (!tb || !tbMine() || tb.anim || tb.moveQ.length) return;
		const foe = enemyUnder(sx, sy);
		if (foe && !foe.dead) { if (foe.temper !== "timid" || foe.aggro) return tbPopup(foe); }
		tb.popup = null;
		const target = hexOf15(wp.x, wp.y);
		const path = tbPathTo(target, Math.floor(ap / moveCost15()));
		if (!path || !path.length) { sync(true); return; }
		tb.moveQ = path.slice(0, Math.floor(ap / moveCost15()));
		if (!tb.moveQ.length) pushLog("Not enough action points to move.");
		sync(true);
	}
	function tbStepAnim(dt) {
		const a = tb.anim;
		a.t += dt / .16;
		const k = Math.min(1, a.t);
		a.body.x = a.fx + (a.tx - a.fx) * k; a.body.y = a.fy + (a.ty - a.fy) * k;
		if (a.body === player) { player.moving = true; player.anim = (player.anim || 0) + dt * 1000 / 60; }
		if (k >= 1) tb.anim = null;
	}
	function tbMoveBody(body, h) {
		const c = hexXY15(h);
		body.dir = facing8(c.x - body.x, c.y - body.y);
		tb.anim = { body, fx: body.x, fy: body.y, tx: c.x, ty: c.y, t: 0 };
	}
	/** v15.1 balance: 5 AP for most foes (one hit plus a step), 6 for elites/bosses, 2 less on a crippled leg. */
	function tbEnemyAp(e) { const big = !!(e.elite || e.boss || e.variant === "brute" || e.variant === "armor"); return Math.max(2, (big ? 6 : 5) - (e.crippleLeg > 0 ? 2 : 0)); }
	function tbEnemyAct(e) {
		const eh = hexOf15(e.x, e.y), ph = hexOf15(player.x, player.y);
		const d = hexDist15(eh, ph);
		if (e.temper === "timid") {
			if (tb.eAp < 1) return false;
			const away = HEX15_DIRS.map(([dq, dr]) => ({ q: eh.q + dq, r: eh.r + dr })).filter((n) => hexFree15(n, e)).sort((a, b) => hexDist15(b, ph) - hexDist15(a, ph))[0];
			if (!away) return false;
			tb.eAp -= 1; tbMoveBody(e, away); return true;
		}
		if (d <= 1) {
			if (tb.eAp < 3) return false;
			tb.eAp -= 3;
			e.dir = facing8(player.x - e.x, player.y - e.y);
			e.cooldown = 0; e.atkAnim = .4;
			const dmg = e.crippleArm > 0 ? Math.max(1, Math.round(e.atk * .65)) : e.atk;
			if (e.blind141 && Math.random() > INJ_FX.enemyBlindAim || Math.random() < TB_FOE_MISS) { floater(player.x, player.y - 30, "miss"); pushLog(`${e.name ?? bodyTitle(e.kind)} misses.`); }
			else { player.invuln = 0; hurtPlayer(dmg, e.x, e.y); }
			return true;
		}
		const step = e.crippleLeg > 0 ? 2 : 1;
		if (tb.eAp < step) return false;
		const best = HEX15_DIRS.map(([dq, dr]) => ({ q: eh.q + dq, r: eh.r + dr })).filter((n) => hexFree15(n, e)).sort((a, b) => hexDist15(a, ph) - hexDist15(b, ph))[0];
		if (!best || hexDist15(best, ph) >= d) return false;
		tb.eAp -= step; tbMoveBody(e, best); return true;
	}
	function tbTick(dt) {
		if (!tb) {
			if (!tbCanStart()) return;
			const foes = world.enemies.filter((e) => tbHostile(e) && !e.raid && Math.hypot(e.x - player.x, e.y - player.y) < 340);
			if (foes.length) tbStart(foes);
			return;
		}
		if (phase !== "play" || inside) { if (inside) tbEnd(); return; }
		stickX = 0; stickY = 0; intent = null; holdWalk = false;
		if (tb.anim) { tbStepAnim(dt); return; }
		if (tbMine()) {
			if (tb.moveQ.length) {
				const h = tb.moveQ.shift();
				if (ap < moveCost15() || !hexFree15(h, "p")) { tb.moveQ = []; return; }
				ap -= moveCost15(); tbMoveBody(player, h); sync(true);
				return;
			}
			player.moving = false;
			if (!pendingHit && !melee && tbOverCheck()) return;
			return;
		}
		const cur = tbCur(), e = tbFoe(cur.id);
		if (!e) { tbNext(); return; }
		tb.eT -= dt;
		if (tb.eT > 0) return;
		tb.eT = .22;
		if (!tbEnemyAct(e)) { tbNext(); return; }
		if (phase !== "play") return;
		sync(true);
	}
	function tbHud() {
		if (!tb) return { on: false, enabled: tbAuto };
		const cur = tbCur();
		return {
			on: true, enabled: tbAuto, mine: tbMine(), ap, maxAp: apMax, round: tb.round,
			cur: cur?.id === "p" ? "You" : tbFoe(cur?.id)?.name ?? bodyTitle(tbFoe(cur?.id)?.kind ?? "foe"),
			order: tb.order.map((o) => ({ me: o.id === "p", name: o.id === "p" ? "You" : tbFoe(o.id)?.name ?? bodyTitle(tbFoe(o.id)?.kind ?? "foe"), cur: o === cur })),
			popup: tb.popup, mag: tbMagOf() ? { n: tbLoaded(), max: tbMagOf() } : null, cost: { ...TB_COST, move: moveCost15() },
		};
	}
	function paintHex15(camX, camY) {
		if (!tb || !player) return;
		const ph = hexOf15(player.x, player.y), reach = tbMine() ? Math.floor(ap / moveCost15()) : 0;
		const pt = (x, y) => { const r = worldToScreen(x, y, camX, camY); return zoomPoint(r.sx, r.sy); };
		ctx.save();
		for (let dq = -6; dq <= 6; dq++) for (let dr = Math.max(-6, -dq - 6); dr <= Math.min(6, -dq + 6); dr++) {
			const h = { q: ph.q + dq, r: ph.r + dr }, c = hexXY15(h);
			if (pointBlocked(world, c.x, c.y, RADIUS)) continue;
			const d = hexDist15(ph, h);
			ctx.beginPath();
			for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i; const p = pt(c.x + HEX15 * .96 * Math.cos(a), c.y + HEX15 * .96 * Math.sin(a)); if (i) ctx.lineTo(p.sx, p.sy); else ctx.moveTo(p.sx, p.sy); }
			ctx.closePath();
			if (d > 0 && d <= reach) { ctx.fillStyle = "rgba(120, 200, 110, .10)"; ctx.fill(); }
			ctx.strokeStyle = d <= reach ? "rgba(170, 230, 150, .45)" : "rgba(240, 220, 170, .16)"; ctx.lineWidth = 1; ctx.stroke();
		}
		const cur = tbCur(), e = cur && cur.id !== "p" ? tbFoe(cur.id) : null;
		const ring = e ?? player, p = pt(ring.x, ring.y);
		ctx.strokeStyle = e ? "rgba(220, 90, 60, .9)" : "rgba(240, 200, 90, .9)"; ctx.lineWidth = 2.5;
		ctx.beginPath(); ctx.ellipse(p.sx, p.sy, 24 * zoom, 24 * CAM_ISO_Y * .92 * zoom, 0, 0, Math.PI * 2); ctx.stroke();
		ctx.restore();
	}
	function setAim(part) {
		aim = part;
		pushLog(`Aiming at the ${part}.`);
		sync(true);
	}
	function setTurnBased(on) {
		// v15: this is the setting: turn-based combat starts by itself when a fight starts in the wild
		tbAuto = !!on;
		try { localStorage.setItem("maine-rpg-tb15", on ? "on" : "off"); } catch { /* private mode */ }
		if (!on && tb) tbEnd();
		pushLog(on ? "Turn-based combat on: fights in the wild go turn by turn." : "Turn-based combat off: fights stay real time.");
		sync(true);
		if (on !== "legacy") return;
		turnBased = on;
		ap = apMax;
		apWalk = 0;
		pushLog(on ? "Turn-based. Spend action points, then end the turn." : "Real time again.");
		saveGame();
		sync(true);
	}
	function endTurn() {
		if (tb) return tbEndPlayerTurn();
		if (!world || !player || phase !== "play" || !turnBased) return;
		for (const enemy of world.enemies) {
			if (enemy.dead || phase !== "play") continue;
			const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
			if (enemy.temper === "timid") {
				if (dist < 110) {
					enemy.aggro = true;
					alertPack(enemy);
					const dx = enemy.x - player.x;
					const dy = enemy.y - player.y;
					const m = Math.hypot(dx, dy) || 1;
					enemy.path = pathTo(world, enemy.x, enemy.y, enemy.x + dx / m * 160, enemy.y + dy / m * 160);
					if (enemy.path) enemy.path = follow(enemy, enemy.path, 240, .55, true);
				}
				continue;
			}
			if (enemy.temper === "hostile" && !enemy.aggro && dist < noticeRange(220)) {
				enemy.aggro = true;
				alertPack(enemy);
			}
			const bite = enemy.kind === "moose" ? 64 : 52;
			if (enemy.aggro && dist <= bite) {
				const swingAtk = enemy.crippleArm > 0 ? Math.max(1, Math.round(enemy.atk * .65)) : enemy.atk;
				enemy.dir = facing8(player.x - enemy.x, player.y - enemy.y);
				if (enemy.blind141 && Math.random() > INJ_FX.enemyBlindAim) floater(player.x, player.y - 30, "miss"); else
				hurtPlayer(swingAtk, enemy.x, enemy.y);
			} else if (enemy.aggro) {
				const pace = enemy.crippleLeg > 0 ? 220 * .55 : 220;
				enemy.path = pathTo(world, enemy.x, enemy.y, player.x, player.y);
				if (enemy.path) enemy.path = follow(enemy, enemy.path, pace, .55, true);
			}
			enemy.crippleArm = Math.max(0, enemy.crippleArm - 1);
			enemy.crippleLeg = Math.max(0, enemy.crippleLeg - 1);
		}
		if (phase === "play") {
			stepParty(.85);
			ap = apMax;
			apWalk = 0;
			intent = null;
			pushLog("Their turn passes. Yours again.");
		}
		sync(true);
	}
	const api = {
		destroy() {
			running = false;
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", onBlur);
			document.removeEventListener("visibilitychange", onVis);
			window.removeEventListener("pagehide", saveNow);
			if (window.__maineSave === saveNow) delete window.__maineSave;
			canvas.removeEventListener("wheel", onWheel);
			if (window.__controlsTest) delete window.__controlsTest;
		},
		begin(name, role, bonus, trait, look, appearance) {
			unlockAudio();
			sfx("click");
			bootNew(name, role, bonus, trait, look, appearance);
		},
		startMode(kind) {
			q11StartMode(kind);
		},

		continueGame() {
			unlockAudio();
			const data = readSave();
			if (!data) return;
			sfx("click");
			bootSave(data);
		},
		setStick(x, y) { stickX = Math.max(-1, Math.min(1, x)); stickY = Math.max(-1, Math.min(1, y)); },
		v141(cmd, arg) {
			if (cmd === "crouch") setCrouch(arg == null ? !l1.crouch : !!arg);
			else if (cmd === "auto") { l1.auto = arg == null ? !l1.auto : !!arg; pushLog(l1.auto ? "Auto-attack on: you'll swing at anything that comes for you." : "Auto-attack off."); sync(true); }
			else if (cmd === "stickMode") { l1.stick = arg == null ? !l1.stick : !!arg; sync(true); }
			else if (cmd === "store") storeCmd(arg?.[0], arg?.[1]);
			else if (cmd === "tbAttack") { tbAttack(arg?.[0], arg?.[1]); return tbHud(); }
			else if (cmd === "tbReload") { tbReload(); return tbHud(); }
			else if (cmd === "tbClose") { if (tb) tb.popup = null; sync(true); return tbHud(); }
			else if (cmd === "tbEnd") { tbEndPlayerTurn(); return tbHud(); }
			else if (cmd === "townEnter") return townEnterMsg();
			else if (cmd === "townMsg") { const ok = arg?.type === "leaveTown" ? leaveTown(arg) : arg?.type === "startQuest" ? townQuest(arg) : false; return { ok }; }
			else if (cmd === "pack") { packOpen = !packOpen; if (packOpen) { statsOpen = false; buildOpen = false; } sync(true); }
			return hud141();
		},
		tap(action) {
			edges[action] = true;
			unlockAudio();
		},
		choose(id) {
			applyChoice(id);
		},
		v14(cmd, arg) {
			if (cmd === "craft") craft14(arg);
			else if (cmd === "benchUp") benchUp14();
			else if (cmd === "closeCraft") { craftOpen = false; sync(true); }
			else if (cmd === "openCraft") { /* v15.9.5: no workbench */ }
			else if (cmd === "rotate") { buildFlip = !buildFlip; sync(true); }
			else if (cmd === "tool") { buildTool = arg; sync(true); }
			else if (cmd === "repairAll") repairAll14();
			else if (cmd === "wmOpen") openWorldMap();
			return hud14();
		},
		selectRecipe(index) {
			recipe = index;
			buildOpen = true;
			sync(true);
		},
		pointer(x, y, type) {
			if (!player || phase !== "play") return;
			if (inside) {
				const room = inside;
				const o = roomOrigin();
				const rs = roomScale();
				const lx = x / rs - o.x;
				const ly = y / rs - o.y;
				if (type === "down") {
					pointerDown = true;
					downX = x;
					downY = y;
					moved = 0;
					gesture = "idle";
					gestureAt = performance.now();
				} else if (type === "move" && pointerDown) moved = Math.max(moved, Math.hypot(x - downX, y - downY));
				else if (type === "up") {
					pointerDown = false;
					const prop = world?.props.find((p) => p.id === room.id);
					const hit = (x0, y0, x1, y1) => moved < 24 && lx > x0 && lx < x1 && ly > y0 && ly < y1;
					if (prop?.kind === "farmhouse") {
						if (hit(14, 90, 112, 192)) warmStove();
						else if (hit(152, 78, 222, 124)) takeFromKitchen(91001, "cider", 1, "The tin cups are empty.", "Hot cider. It tastes like the orchard.");
						else if (hit(222, 76, 292, 124)) takeFromKitchen(91002, "donut", 2, "The plate is down to crumbs.", "Two cider donuts, still a little warm.");
						else if (hit(296, 44, 396, 196)) pushLog("The stairs go up to a cold loft. Nothing you need is stored up there.");
						else if (hit(roomDoor().x0, roomDoor().y0, roomDoor().x1, roomDoor().y1)) leaveHouse();
						else if (lx > 16 && lx < 384 && ly > 16 && ly < 266) intent = {
							kind: "walk",
							x: lx,
							y: ly,
							path: []
						};
					} else if (prop?.kind === "barn") {
						if (hit(20, 40, 150, 170)) {
							if (lootedChests.has(92001)) pushLog("You already took a load of wood.");
							else {
								lootedChests.add(92001);
								player.wood = Math.min(999, player.wood + 4);
								pushLog("Split wood from the shed. Four timber.");
								sfx("gather");
								saveGame();
								sync(true);
							}
						} else if (hit(170, 36, 312, 176)) openBench();
						else if (hit(roomDoor().x0, roomDoor().y0, roomDoor().x1, roomDoor().y1)) leaveHouse();
						else if (lx > 16 && lx < 304 && ly > 16 && ly < 224) intent = {
							kind: "walk",
							x: lx,
							y: ly,
							path: []
						};
					} else if (prop?.kind === "hatch") {
						if (hit(16, 48, 112, 90)) takeFromKitchen(93012, "trauma", 1, "The trauma kit is already in your pack.", "A sealed trauma kit. It is not a rag bandage.");
						else if (hit(16, 96, 112, 156)) takeFromKitchen(93011, "rig", 1, "The plate rig is gone.", "A plate rig. Pouches, and a plate that will stop more than wool.");
						else if (hit(210, 36, 306, 118)) takeFromKitchen(93010, "scoped", 1, "The rack is empty.", "A scoped carbine. The glass is intact.");
						else if (hit(210, 124, 306, 170)) takeFromKitchen(93013, "shells", 8, "The ammo crate is empty.", "Eight shells from a crate that was still sealed.");
						else if (hit(120, 148, 186, 188)) drinkBarrel();
						else if (hit(130, 36, 200, 92)) pushLog("The radio hisses. A French station, a long way off, then nothing.");
						else if (hit(roomDoor().x0, roomDoor().y0, roomDoor().x1, roomDoor().y1)) leaveHouse();
						else if (lx > 16 && lx < 304 && ly > 16 && ly < 224) intent = {
							kind: "walk",
							x: lx,
							y: ly,
							path: []
						};
					} else if (moved < 14 && lx > 132 && lx < 188 && ly > 44 && ly < 96) openChest();
					else if (moved < 24 && lx > roomDoor().x0 && lx < roomDoor().x1 && ly > roomDoor().y0 && ly < roomDoor().y1) leaveHouse();
					else if (lx > 16 && lx < 304 && ly > 16 && ly < 224) intent = {
						kind: "walk",
						x: lx,
						y: ly,
						path: []
					};
				}
				return;
			}
			const u = unzoomPoint(x, y);
			const worldPt = screenToWorld(u.sx, u.sy, camX, camY);
			hoverX = worldPt.x;
			hoverY = worldPt.y;
			if (tb) {
				// v15 turn-based: drag pans, a tap moves hex by hex or opens the aimed-shot popup on an enemy
				if (type === "down") { pointerDown = true; downX = x; downY = y; lastPX = x; lastPY = y; moved = 0; }
				else if (type === "move" && pointerDown) { moved = Math.max(moved, Math.hypot(x - downX, y - downY)); if (moved > 18) { freeCam = true; camX -= (x - lastPX) / zoom; camY -= (y - lastPY) / zoom; } lastPX = x; lastPY = y; }
				else if (type === "up") { pointerDown = false; if (moved < 14) tbTap(x, y, worldPt); }
				return;
			}
			if (type === "down") {
				pointerDown = true;
				downX = x;
				downY = y;
				lastPX = x;
				lastPY = y;
				moved = 0;
				gesture = "idle";
				gestureAt = performance.now();
				holdWalk = false;
			} else if (type === "move" && pointerDown) {
				const dx = x - lastPX;
				const dy = y - lastPY;
				moved = Math.max(moved, Math.hypot(x - downX, y - downY));
				const age = performance.now() - gestureAt;
				if (gesture === "idle" && moved > 18 && age < 260) gesture = "pan";
				if (gesture === "idle" && age >= 150) gesture = "walk";
				if (gesture === "pan") {
					freeCam = true;
					holdWalk = false;
					camX -= dx / zoom;
					camY -= dy / zoom;
				} else if (gesture === "walk" && world && !buildOpen) {
					const foe = enemyUnder(x, y);
					if (foe) {
						const family = GEAR[player.weaponId]?.family;
						if (isGun(family) && shellCount(player) <= 0) {
							holdWalk = false;
							intent = null;
							pushLog("Out of shells.");
							sfx("click");
						} else {
							holdWalk = false;
							intent = {
								kind: "attack",
								id: foe.id,
								who: "enemy",
								path: pathTo(world, player.x, player.y, foe.x, foe.y) ?? []
							};
							attackRepath = 0;
						}
					} else {
						holdWalk = true;
						holdWX = worldPt.x;
						holdWY = worldPt.y;
						if (intent?.kind === "attack") intent = {
							kind: "walk",
							x: holdWX,
							y: holdWY,
							path: pathTo(world, player.x, player.y, holdWX, holdWY) ?? []
						};
					}
				}
				lastPX = x;
				lastPY = y;
			} else if (type === "up") {
				pointerDown = false;
				if (gesture === "walk" && world && !buildOpen) {
					holdWalk = false;
					if (intent?.kind !== "attack") intent = {
						kind: "walk",
						x: worldPt.x,
						y: worldPt.y,
						path: pathTo(world, player.x, player.y, worldPt.x, worldPt.y) ?? []
					};
				} else if (gesture === "idle" && moved < 12) pick(worldPt.x, worldPt.y, x, y);
				gesture = "idle";
			}
			if (buildOpen) sync(true);
		},
		nudgeZoom(factor) {
			applyZoom(factor);
		},
		pan(dx, dy) {
			if (phase !== "play") return;
			freeCam = true;
			holdWalk = false;
			camX -= dx / zoom;
			camY -= dy / zoom;
		},
		recenter() {
			freeCam = false;
		},
		leave() {
			unlockAudio();
			if (!inside) return;
			if (phase === "dialogue") applyChoice("close");
			if (phase === "pause") phase = "play";
			packOpen = false;
			statsOpen = false;
			buildOpen = false;
			lootId = -1;
			leaveHouse();
		},
		back() {
			if (phase === "menu") return false;
			unlockAudio();
			if (phase === "dialogue") {
				applyChoice("close");
				return true;
			}
			if (phase === "pause") {
				phase = "play";
				sync(true);
				return true;
			}
			if (phase !== "play") return true;
			if (lootId !== -1) {
				takeLoot("close");
				return true;
			}
			if (packOpen || statsOpen || buildOpen) {
				packOpen = false;
				statsOpen = false;
				buildOpen = false;
				sfx("click");
				sync(true);
				return true;
			}
			phase = "pause";
			sync(true);
			return true;
		},
		togglePack() {
			packOpen = !packOpen;
			if (packOpen) {
				buildOpen = false;
				statsOpen = false;
			}
			sync(true);
		},
		toggleStats() {
			statsOpen = !statsOpen;
			if (statsOpen) {
				buildOpen = false;
				packOpen = false;
			}
			sync(true);
		},
		dismount() {
			parkBike(true);
		},
		dogCommand(mode) {
			dogCommand(mode);
		},
		dogHeal() {
			dogHeal();
		},
		setSlot(n) {
			if (phase !== "menu") return;
			setSlot(n);
			useHud.setState({ slot: getSlot(), slots: slotInfos(), hasSave: hasSave() });
		},
		loadAutosave() {
			if (phase !== "menu" || !restoreAutosave()) return;
			useHud.setState({ slot: getSlot(), slots: slotInfos(), hasSave: hasSave(), auto: autoInfo() });
			api.continueGame();
		},
		drawMap(c) {
			drawWorldMap(c);
		},
		mount() {
			const b = nearBike();
			if (b) { mountBike(b); sync(true); }
		},
		openTravel() {
			if (player && phase === "play") travelMenu();
		},
		choose13(id) {
			if (id === "v13-ending-next") { w13.main.slide += 1; sync(true); return; }
			if (id === "v13-ending-close") { w13.main.slide = 99; sync(true); }
		},
		setNotes(text) {
			w13.notes = String(text).slice(0, 4000);
			saveGame();
		},
		spend(stat) {
			if (!player || player.points < 1 || phase === "menu") return;
			player.points -= 1;
			if (stat === "agility" || stat === "grit") w13.core[stat] += 1;
			else if (stat === "wits") player.intellect += 1;
			else player[stat] += 1;
			refreshGear(player);
			pushLog(`${stat === "vigor" ? "vigor" : stat === "intellect" ? "intellect" : stat === "perception" ? "perception" : stat === "endurance" ? "endurance" : stat === "luck" ? "luck" : stat === "agility" ? "agility" : stat === "grit" ? "grit" : stat === "wits" ? "wits" : "strength"} rises.`);
			saveGame();
			sync(true);
		},
		spendSkill(id) {
			if (!player || phase === "menu") return;
			ensureProgress(player);
			if ((player.skillPoints | 0) < 1) return;
			if (!SKILLS.some((skill) => skill.id === id)) return;
			player.skillPoints -= 1;
			player.invested[id] = (player.invested[id] ?? 0) + 1;
			const name = SKILLS.find((skill) => skill.id === id)?.name ?? "Skill";
			pushLog(`${name} rises to ${skillOf(id)}.`);
			saveGame();
			sync(true);
		},
		retag(id) {
			if (!player || phase === "menu") return;
			ensureProgress(player);
			if (investedTotal(player) > 0) return;
			if (!SKILLS.some((skill) => skill.id === id)) return;
			if (player.tags.includes(id)) return;
			player.tags = player.tags.length < 3 ? [...player.tags, id] : [...player.tags.slice(1), id];
			pushLog(`Tagged: ${SKILLS.filter((skill) => player.tags.includes(skill.id)).map((skill) => skill.name).join(", ")}.`);
			saveGame();
			sync(true);
		},
		takePerk(id) {
			if (!player || phase === "menu") return;
			ensureProgress(player);
			if (player.perks.length >= perkSlots(player.level)) return;
			const perk = PERKS.find((item) => item.id === id);
			if (!perk || player.perks.includes(id)) return;
			if (!perkOk(perk, (skill) => skillOf(skill))) return;
			player.perks = [...player.perks, id];
			refreshGear(player);
			if (ap > apMax) ap = apMax;
			pushLog(`Perk: ${perk.name}.`);
			sfx("level");
			saveGame();
			sync(true);
		},
		dismissParty,
		invEquip(id, slot) {
			if (!player || !slotAccepts(slot, id)) return false;
			const stack = player.bag.find((s) => s.id === id && s.qty > 0);
			if (!stack) return false;
			const field = SLOT_FIELD[slot];
			if (player[field] === id) return true;
			// one copy can't be in two slots (a single knife in both hands)
			if (wornCount(player, id) >= stack.qty) {
				const other = EQUIP_SLOTS.find((s2) => player[SLOT_FIELD[s2]] === id);
				if (other) player[SLOT_FIELD[other]] = "";
			}
			const was = player[field];
			player[field] = id;
			refreshGear(player);
			layoutGrid(player);
			if (was && layoutGrid(player).over > 0) {
				// the piece coming off has no room: keep it on
				player[field] = was;
				refreshGear(player);
				pushLog("No room in the pack for what you'd take off.");
				sync(true);
				return false;
			}
			pushLog(slot === "main" ? `In hand: ${GEAR[id].name} (${GEAR[id].quality}).` : `Worn: ${GEAR[id].name}.`);
			sfx("click");
			saveGame();
			sync(true);
			return true;
		},
		invUnequip(slot, x, y) {
			if (!player || !SLOT_FIELD[slot]) return false;
			const field = SLOT_FIELD[slot];
			const id = player[field];
			if (!id) return false;
			player[field] = "";
			if (slot === "back" && layoutGrid(player).over > 0) {
				player[field] = id;
				pushLog("Empty the bottom rows first; the frame is holding them.");
				sync(true);
				return false;
			}
			if (x !== void 0 && y !== void 0) {
				player.gridPos = player.gridPos ?? {};
				if (fitsAt(player, id, x, y)) player.gridPos[id] = [x, y];
			}
			if (layoutGrid(player).over > 0) {
				player[field] = id;
				pushLog("No room in the pack for it.");
				sync(true);
				return false;
			}
			refreshGear(player);
			pushLog(slot === "main" ? "Hands empty." : `You take off the ${GEAR[id]?.name ?? "piece"}.`);
			sfx("click");
			saveGame();
			sync(true);
			return true;
		},
		invMove(id, x, y) {
			if (!player || !fitsAt(player, id, x, y)) return false;
			player.gridPos = player.gridPos ?? {};
			player.gridPos[id] = [x, y];
			layoutGrid(player);
			saveGame();
			sync(true);
			return true;
		},
		invUse(id) {
			const def = GEAR[id];
			if (!player || !def || def.kind === "weapon" || def.kind === "coat") return;
			api.clickPack(id);
		},
		clickPack(id) {
			if (!player) return;
			const def = GEAR[id];
			const stack = player.bag.find((s) => s.id === id);
			if (!def || !stack || stack.qty <= 0) return;
			if ((id === "snare" || id === "steeltrap") && world) {
				if (inside) { pushLog("Not in here. Set it outside on a game trail."); return; }
				setTrap(id === "snare" ? "snare" : "trap");
				return;
			}
			if (tb) {
				if (!tbMine()) { pushLog("Wait for your turn."); return sync(true); }
				if (ap < TB_COST.item) { pushLog(`Using that takes ${TB_COST.item} AP.`); return sync(true); }
				ap -= TB_COST.item;
			}
			if (v141Use(def, stack)) { saveGame(); sync(true); return; }
			if (v13Use(def, stack)) { saveGame(); sync(true); return; }
			if (def.kind === "weapon") {
				if (player.weaponId === id) {
					player.weaponId = "";
					refreshGear(player);
					pushLog("Hands empty.");
				} else {
					player.weaponId = id;
					refreshGear(player);
					pushLog(`In hand: ${def.name} (${def.quality}).`);
				}
			} else if (def.kind === "coat") {
				const slot = armorSlot(def);
				const field = slot === "head" ? "headId" : slot === "legs" ? "legsId" : slot === "hands" ? "handsId" : slot === "feet" ? "feetId" : slot === "back" ? "backId" : "coatId";
				if (player[field] === id) {
					player[field] = "";
					refreshGear(player);
					pushLog(`You take off the ${def.name}.`);
				} else {
					player[field] = id;
					refreshGear(player);
					pushLog(`Worn on the ${slot}: ${def.name}.`);
				}
			} else if (def.id === "syrup") {
				stack.qty -= 1;
				if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
				player.stamina = player.maxStamina;
				sfx("click");
				pushLog("Maple syrup straight from the jar. Your legs come back.");
			} else if (def.id === "dandelion") {
				stack.qty -= 1;
				if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
				player.hp = Math.min(player.maxHp, player.hp + def.heal);
				player.stamina = Math.min(player.maxStamina, player.stamina + 30);
				sfx("click");
				pushLog("Bitter dandelion tea. The chill goes out of you.");
			} else if (def.id === "radio") {
				sfx("click");
				const dark = nightShade(clock) > .22;
				pushLog(jackTrust > 0 ? (dark ? "Jack, through the static: \"Lights on the road. Keep your head down.\"" : "Jack, through the static: \"Quiet so far. I'll call at dusk if they move.\"") : "Static. Somebody else's channel, maybe. Jack hasn't given you his.");
			} else if (def.heal > 0) {
				stack.qty -= 1;
				if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
				player.hp = Math.min(player.maxHp, player.hp + Math.round(def.heal * (1 + skillOf("doctor") / 200) * (hasPerk("stitch") ? 1.25 : 1) * (1 + .08 * lv("medicine"))));
				if (def.family === "bandage") train("medicine", 5);
				sfx("click");
				pushLog(`${def.name} used.`);
			} else if ((def.worth ?? 0) > 0) {
				stack.qty -= 1;
				if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
				const pay = (def.worth ?? 0) + Math.floor(player.intellect / 2) + Math.floor(skillOf("barter") / 20);
				player.scrap = Math.min(999, player.scrap + pay);
				sfx("click");
				pushLog(`Traded the ${def.name.toLowerCase()} for ${pay} iron.`);
			} else if (def.id === "bomb") {
				stack.qty -= 1;
				if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
				let hits = 0;
				for (const e of world?.enemies ?? []) {
					if (e.dead || Math.hypot(e.x - player.x, e.y - player.y) > 120) continue;
					e.hp -= 18;
					e.hurt = .2;
					e.aggro = true;
					hits += 1;
					if (e.hp <= 0) markDead(e, e.xp);
				}
				burst(player.x, player.y, "#e07030", 12);
				sfx("hit");
				pushLog(hits ? `The pipe bomb catches ${hits}.` : "The pipe bomb wastes itself on empty ground.");
			} else if (def.id === "fuel") {
				stack.qty -= 1;
				if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
				tractorReady = true;
				sfx("click");
				pushLog("The tractor will make one pass when they come.");
			} else if (def.id === "baitpack") {
				stack.qty -= 1;
				if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
				const t = tileOf(player.x, player.y);
				if (world) addProp(world, "bait", t.tx, t.ty, { built: true });
				sfx("click");
				pushLog("You leave the bait where you stand.");
			} else if (def.id === "shells") pushLog(`${stack.qty} shells. A gun spends one each time it fires.`);
			else pushLog(def.note);
			saveGame();
			sync(true);
		},
		craft,
		setAim,
		setTurnBased,
		setShowFps(on) { showFps = !!on; try { localStorage.setItem("maine-rpg-fps", showFps ? "on" : "off"); } catch {} sync(true); },
		setFpsCap(n) { fpsCap = n === 30 ? 30 : 60; try { localStorage.setItem("maine-rpg-cap", String(fpsCap)); } catch {} sync(true); },
		setPerfMode(on) { perfMode = !!on; try { localStorage.setItem("maine-rpg-perf", perfMode ? "on" : "off"); } catch {} sync(true); },
		setGraphics(high) { gfxHigh = !!high; try { localStorage.setItem("maine-rpg-gfx", gfxHigh ? "high" : "low"); } catch {} sync(true); },
		endTurn,
		takeLoot
	};
	window.__controlsTest = {
		/** size198: put a calm animal next to the hero so the size check sees it drawn. */
		sizeSpawn: (kind) => { const dx = { moose: -170, deer: 150, wolf: 260 }[kind] ?? 0; const e = q10Spawn(kind, null, kind, { x: player.x + dx, y: player.y - dx * .4 }, [999, 0, 0], "size198", false); if (e) { e.temper = "wary"; e.aggro = false; } return e ? e.id : null; },
		/** size198: rendered visible heights (px at zoom 1) of everything drawn so far, against SIZE_IN. */
		sizeCheck: () => {
			const imgToKind = {}; for (const [k, v] of Object.entries(PROP_SPEC)) if (!imgToKind[v.image]) imgToKind[v.image] = k;
			const townIn = { house: "town-house", church: "town-church", shed: "town-shed", sign: "town-sign", fence: "town-fence" };
			const alpha = (im) => { const c = document.createElement("canvas"); c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height; const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; let top = -1, bot = -1; for (let y = 0; y < c.height && top < 0; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) { top = y; break; } for (let y = c.height - 1; y >= 0 && bot < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) { bot = y; break; } return top < 0 ? 0 : (bot - top + 1) / c.height; };
			const out = [];
			for (const [name, drawH] of SIZE_SEEN) {
				let key = null, fit = 0;
				if (name.startsWith("town:")) {
					const [, art, h] = name.split(":"); const im = TOWN_ART[art]; if (!im || !im.naturalWidth) continue;
					key = art === "farmhouse" ? (+h === townH("town-farmhouse-lone", "farmhouse") ? "town-farmhouse-lone" : "town-farmhouse") : townIn[art]; fit = alpha(im);
				} else if (name.startsWith("v2/vehicles/") || (imgToKind[name] && SIZE_IN[imgToKind[name]] != null)) {
					const im = images.get(name); if (!im || !im.width) continue; key = name.startsWith("v2/vehicles/") ? (name.includes("truck") ? "car-truck" : "car-sedan") : imgToKind[name]; fit = alpha(im);
				} else {
					const im = images.get(name); if (!im || !im.width) continue;
					const fam = figFamily(name);
					if (/^(v2\/)?hero|^pl\//.test(name)) key = "hero";
					else if (fam) key = fam.key === "boss-grok" ? "grok" : /^boss-/.test(fam.key) ? "boss" : /cyndal|loki/.test(fam.key) ? "kid" : "npc";
					else if (/^(deer|moose|wolf|coyote|rabbit|squirrel|crow)$/.test(name)) key = name;
					else continue;
					if (/-(dead|death|down|hit|crouch)$/.test(name) || name.startsWith("overlay-")) continue;
					const rows = sheetRowsOf(name) || 1;
					if (BEAST_FIT[name] != null) {
						// same definition as BEAST_FIT: mean visible share over every facing and frame
						const cols = sheetCols(im), sw = Math.floor(im.width / cols), sh = Math.floor(im.height / rows);
						const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0);
						const d = g.getImageData(0, 0, im.width, im.height).data; let sum = 0, n = 0;
						for (let r = 0; r < rows; r++) for (let f = 0; f < cols; f++) { let top = -1, bot = -1; for (let y = 0; y < sh; y++) { let hit = false; for (let x = 0; x < sw; x++) if (d[((r * sh + y) * im.width + f * sw + x) * 4 + 3] > 60) { hit = true; break; } if (hit) { if (top < 0) top = y; bot = y; } } sum += top < 0 ? 0 : (bot - top + 1) / sh; n++; }
						fit = sum / n;
					} else fit = measureFig(im, im.height / rows);
				}
				if (!key || !fit) continue;
				const px = drawH * fit, vary = key.startsWith("tree-") ? [TREE_VARY[0], TREE_VARY[0] + (TREE_VARY[2] - 1) * TREE_VARY[1]] : [1, 1];
				out.push({ name, key, drawH: Math.round(drawH * 10) / 10, fit: +fit.toFixed(3), px: +px.toFixed(1), want: +(SIZE_IN[key] * PX_PER_IN).toFixed(1), inches: +(px / PX_PER_IN).toFixed(1), tableIn: SIZE_IN[key], lo: vary[0], hi: vary[1] });
			}
			return { ppi: PX_PER_IN, table: { ...SIZE_IN }, out };
		},
		v14: () => ({ ...v14, craftOpen, buildFlip, buildTool, snow, mapId }),
		v14Set: (patch) => { Object.assign(v14, patch); sync(true); },
		v14Props: () => world ? world.props.filter((p) => ART14.has(p.kind) || p.f14 || p.p14).map((p) => ({ id: p.id, kind: p.kind, tx: p.tx, ty: p.ty, hp: p.hp, f14: p.f14 ?? null, p14: !!p.p14, open: !!p.open, flip: !!p.flip14, lit: !!p.lit14 })) : [],
		v14Use: (id) => { const p = world?.props.find((q) => q.id === id); if (p) v14Use(p); },
		v14Hurt: (id, d) => { const p = world?.props.find((q) => q.id === id); if (p) hurtProp(p, d); },
		v14Cmd: (cmd, arg) => api.v14(cmd, arg),
		l141: () => ({ ...l1, rows: gridRows(player), bag: player.bag.map((s) => ({ ...s })), small: !!player.small, bagLv: player.bagLv ?? 0, xf: xfStats.n, hard: !!w13.hard, mapId, phase, x: player.x, y: player.y, piles: piles.map((p) => ({ title: p.title, n: p.items.reduce((a, b) => a + b.qty, 0), x: p.x, y: p.y })) }),
		l141Hollow: (n, dx, dy) => spawnHollowed(n, { x: player.x + dx, y: player.y + dy }).map((e) => e.id),
		l141Enemies: () => world.enemies.filter((e) => !e.dead).map((e) => ({ id: e.id, hollow: !!e.hollow, x: e.x, y: e.y, aggro: !!e.aggro, heard: !!e.heard, name: e.name, hp: e.hp, kind: e.kind, d: Math.hypot(e.x - player.x, e.y - player.y) })),
		l141Noise: (n, dx = 0, dy = 0) => emitNoise(n, player.x + dx, player.y + dy),
		l141Loot: (id) => { const r = LOOT_RUNS.find((x) => x.id === id); openWorldMap(); close13(); const m = wmState(); m.q = r.q; m.r = r.r; m.path = []; m.from = [r.q - 1, r.r]; lootEnter(r); return piles.filter((p) => p.title.startsWith(r.name)).map((p) => ({ title: p.title, items: p.items.map((i) => ({ ...i })), d: Math.round(Math.hypot(p.x - player.x, p.y - player.y)) })); },
		l141Hours: (h) => { prodAcc = 2; prodTick(0); clock += h / 24 * DAY_LENGTH_SEC; prodAcc = 2; prodTick(0); },
		l141Hard: (on) => { w13.hard = !!on; },
		l141Strike: (id) => { const e = world.enemies.find((q) => q.id === id); if (!e) return null; const hp = e.hp; player.cooldown = 0; aim = "chest"; const r0 = Math.random; Math.random = () => 0; try { strikeEnemy(e); } finally { Math.random = r0; } return { before: hp, after: e.hp, dead: !!e.dead }; },
		l141Use: (tx, ty) => { const p = world.props.find((q) => q.tx === tx && q.ty === ty); if (p) v14Use(p); return p ? p.kind : null; },
		lrTalk: (role) => { const n = world.npcs.find((q) => q.role === role); if (!n) return null; openTalk(n); return dialogue ? { text: dialogue.text, choices: dialogue.choices } : null; },
		dialogChoices: () => (dialogue?.choices ?? []).map((c) => c.id),
		l141Barrels: () => world.props.filter((q) => q.kind === "rainbarrel").map((q) => ({ tx: q.tx, ty: q.ty, n: barrel141(q).n })),
		/** v14.1 URL test harness (?test=worldmap&enc=caravan | guns): sets up a scenario with no console. */
	testScenario: (name, opts = {}) => {
		if (!world || !player) return "no game";
		const give = (id, n = 1) => { const st = player.bag.find((q) => q.id === id); if (st) st.qty += n; else player.bag.push({ id, qty: n }); };
		const m = null; // v15.9.5: ?test=waveN / nightraid were raid scenarios
		if (name === "guns") {
			for (const id of ["carbine-std", "revolver", "shotgun", "scoped", "winchester", "levergun"]) if (GEAR[id]) give(id);
			give("shells", 60); player.weaponId = "carbine-std"; refreshGear(player); pushLog("Test: every gun and 60 shells.");
		} else if (name === "turnbased") {
			// v15: two raiders and a wolf come at you in the woods; turn-based combat starts by itself
			window.__tbOff = false; tbAuto = true;
			for (const id of ["revolver"]) if (GEAR[id]) give(id);
			give("shells", 24); give("medkit", 1); player.weaponId = "revolver"; refreshGear(player); inside = null;
			if (v14.st < 5) v14.st = 5;
			const at = (dx, dy) => ({ x: player.x + dx, y: player.y + dy });
			for (const [dx, dy] of [[230, -60], [200, 90]]) { spawnRaider("scout", at(dx, dy)); const e = world.enemies[world.enemies.length - 1]; e.raid = false; e.aggro = true; }
			q10Spawn("wolf", "", "Timber wolf", at(-210, 120), [22, 5, 10], "enc", true);
			pushLog("Test: turn-based fight. Raiders and a wolf.");
		} else if (name === "worldmap") {
			window.__wmForce = 1;
			if (opts.enc) { window.__wmKind = opts.enc; window.__wmEnc = 0; }
			openWorldMap();
			if (opts.enc) { close13(); const st = wmState(); m159: for (const l of WM_LOCS) if (hexPath([st.q, st.r], [l.q, l.r], bikeBuilt()).length > 1 && !locLocked(l, l1.tf)) { travel159("loc", l.id); break m159; } }
			pushLog(opts.enc ? `Test: world map, forced ${opts.enc} encounter on the next hex.` : "Test: world map.");
		} else return "unknown test";
		sync(true);
		return "ok";
	},
	l141Fig: () => ({ ...figLog }),
	l141Injure: (id) => { if (id === "none") return healInjuries141("Test heal."); return injure141(id, "Test."); },
	l141Inj: () => ({ ail: Object.keys(w13.ail), sight: sightRadius(), run: v13Running(), speed: ailSpeed() }),
	l141Img: (n) => { const i = images.get(n); return i ? { w: i.width, h: i.height, cols: sheetCols(i), diag4: i.diag4 } : null; },
	l141Piles: () => piles.map((p) => ({ title: p.title, body: p.body, sheet: p.sheet, folk: p.folk, loot: hasLoot(p) })),
	l141Doll: () => ({ player: dollLayerNames(player, "walk"), npcs: (world?.npcs ?? []).map((n) => [n.role, dollTypeOf(n), !!n.doll]) }),
	l141Lineup: () => {
		const out = [];
		const roles = ["justin", "sarah", "loki", "cyndal", "holt", "mira", "nora"];
		let i = 1;
		for (const r of roles) { const n = world.npcs.find((q) => q.role === r); if (!n) continue; n.x = player.x + (i - 5) * 16; n.y = player.y - (i - 5) * 16; n.path = []; n.pause = 999; n.dir = 1; n.frame = 0; n.lineup141 = true; out.push(r); i++; }
		for (const v of ["scout", "brute"]) { spawnRaider(v, { x: player.x - i * 34 + 400, y: player.y + i * 34 - 400 }); const e = world.enemies[world.enemies.length - 1]; e.x = player.x + (i - 5) * 16; e.y = player.y - (i - 5) * 16; e.raid = false; e.aggro = false; e.dir = 1; e.lineup141 = true; e.frame = 0; out.push("raider-" + v); i++; }
		player.dir = 1; zoom = 1.6;
		return out;
	},
	l141Calm: () => { for (const e of world?.enemies ?? []) { e.aggro = false; } pendingHit = null; swingAnim = 0; melee = null; },
	l141Fight: () => inCombat141(),
	l141Facings: () => { const out = []; let d = 1; for (const [x, y] of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [0, 1], [1, 0]]) { const w = screenDirToWorld(x, y); d = facing8Hys(d, w.vx, w.vy); out.push(d); } return out; },
	l141Unarm: () => { player.weaponId = null; refreshGear(player); },
	l141Melee: () => { const m = meleeFrame(); return { m, pending: !!pendingHit, count: meleeCount }; },
	l141Props: () => world.props.filter((q) => q.p14).map((q) => ({ kind: q.kind, tx: q.tx, ty: q.ty })),
		l141Give: (id, n) => { const st = player.bag.find((q) => q.id === id); if (st) st.qty += n; else player.bag.push({ id, qty: n }); },
		l141Pile: (title) => { const p = piles.find((q) => q.title === title); if (p) { player.x = p.x; player.y = p.y; openLoot(p); } return !!p; },
		tap: (a) => api.tap(a),
		takeLoot: (k) => api.takeLoot(k),
		clickPack: (id) => api.clickPack(id),
		v141: (c, a) => api.v141(c, a),
		l141Stick: (x, y) => { stickX = x; stickY = y; },
		l141Mats: () => { player.wood += 60; player.stone += 60; player.scrap += 60; for (const id of ["cloth", "junk", "hide"]) { const st = player.bag.find((q) => q.id === id); if (st) st.qty += 20; else player.bag.push({ id, qty: 20 }); } sync(true); },
		v14Build: (index, tx, ty) => { recipe = index; buildOpen = true; hoverX = (tx + .5) * 64; hoverY = (ty + .5) * 64; tryBuild(); },
		wm: () => ({ phase, mapId, name: world?.name, map: v14.map, clock }),
		wmOpen: () => openWorldMap(),
		// v15.9: travel through the destination menu (the hex overview is gone). Returns the same summary v154Go used to.
		use159: (kind) => { const p = world.props.find((q) => q.kind === kind); if (!p) return null; const c = propCenter(p); player.x = c.x + 60; player.y = c.y + 60; const before = { scrap: player.scrap, hp: player.hp, gas: countOf("gas") }; const r = use159(p); return { r, before, after: { scrap: player.scrap, hp: player.hp, gas: countOf("gas") } }; },
		skillScores: () => Object.fromEntries(SKILLS.map((k) => [k.id, skillOf(k.id)])),
		travelGo: (id, kind = "loc") => { openWorldMap(); const offered = !!dialogue?.choices?.some((c) => c.id === `v159-go-${kind}-${id}`); if (offered) applyChoice(`v159-go-${kind}-${id}`); else close13(); const m = wmState(); return { offered, phase, map: mapId, name: world?.name ?? "", warn: m.warn, safe: player ? safeAt(player.x, player.y)?.id ?? null : null, shacks: world ? world.props.filter((p) => p.kind === "shack").length : 0, hostiles: world ? world.enemies.filter((e) => !e.dead).length : 0, town: !!town }; },
		town143: () => ({ state: townState(), tq: l1.tq, tf: l1.tf, tx: l1.tx, town, phase }),
		town144Spot: () => townSpot(ISO_TOWNS[0]),
		tb15: () => ({ ...tbHud(), hex: player ? hexOf15(player.x, player.y) : null, foes: (world?.enemies ?? []).filter((e) => !e.dead && tb?.order.some((o) => o.id === e.id)).map((e) => ({ id: e.id, hp: e.hp, hex: hexOf15(e.x, e.y), blind: !!e.blind141, arm: e.crippleArm || 0, leg: e.crippleLeg || 0, x: e.x, y: e.y })), px: player?.x, py: player?.y }),
		tb15Tap: (wx, wy) => { if (tb) tbTap(-9999, -9999, { x: wx, y: wy }); },
		tb15Hex: (q, r) => hexXY15({ q, r }),
		tb15Popup: (id) => { const e = tbFoe(id); if (e && tb) tbPopup(e); return tb?.popup ?? null; },
		tb15Kill: () => { for (const e of world.enemies) if (tbHostile(e) && Math.hypot(e.x - player.x, e.y - player.y) < 600) { e.hp = 0; e.dead = true; markDead(e, 0); } tbOverCheck(); sync(true); return !!tb; },
		tb15Force: (on) => { tbAuto = !!on; window.__tbOff = !on; },
		town146: () => ({ snow, dog: q10.dog, radio: q10.radio, parts: [...q10.parts], meds: q11.q.meds?.s ?? 0, school: q11.q.school?.s ?? 0, bike: q11.q.bike?.s ?? 0, story: townStoryFlags(), stats: townState().stats }),
		town146Set: (o) => { if (o.snow != null) snow = o.snow; if (o.dog != null) q10.dog = o.dog; for (const k of ["meds", "school", "bike"]) if (o[k] != null) q11St(k).s = o[k]; },
		v15Safe: () => ({ zones: safeZones().map((z) => ({ ...z })), here: safeAt(player.x, player.y)?.id ?? null, hud: !!safeAt(player.x, player.y) }),
		v15Spot: (id) => { const t = ISO_TOWNS.find((x) => x.id === id); return t ? { map: t.map, open: townOpen(t), spot: t.map === mapId ? townSpot(t) : null } : null; },
		v15Towns: () => ISO_TOWNS.filter((t, i, a) => a.findIndex((u) => u.id === t.id) === i).map((t) => ({ id: t.id, map: t.map, act: t.act ?? 0, src: townSrc(t.id), ...(FT15_ALIAS[t.id] ? { rideTo: FT15_ALIAS[t.id] } : {}) })),
		v15Flags: (f) => { l1.tf = l1.tf ?? {}; for (const [k, v] of Object.entries(f ?? {})) l1.tf[k] = keepFlag(k, l1.tf[k], v); const moved = townMapFlags(l1.tf); townQuestsDone(); return { moved, main: JSON.parse(JSON.stringify(w13.main)), jack: w13.loyal.jack, mira: w13.loyal.mira, q10: { planks: q10.planks, rope: q10.rope, winch: q10.winch, ferry: q10.ferry }, grok: q11.q.grok?.s ?? 0, wolves: q11.q.wolves?.s ?? 0, freed: w13.freed, tq: (l1.tq ?? []).map((q) => q.id), unite: uniteWaived() }; },
		v15State: () => townState(),
		v15Open: (id, scene) => { openTown({ id, town: id, name: id, scene }); return { town: { ...town }, msg: townEnterMsg() }; },
		v153: () => ({ clock, map: mapId, phase, town: town ? { id: town.id, src: town.src } : null, px: player?.x, py: player?.y }),
		v153Ft: (ft) => leaveTown({ type: "leaveTown", exit: "worldmap", state: {}, fastTravel: ft }),
		v15Leave: () => leaveTown({ type: "leaveTown", exit: "town", state: {} }),
		// v15.4 Greenville / Moosehead unlock
		v154Wm: () => ({ open: mooseheadOpen(l1.tf), loc: locAt(5, 0)?.id ?? null, locked: WM_LOCS.filter((l) => locLocked(l, l1.tf)).map((l) => l.id), phase, map: mapId, warn: v14.map?.warn ?? "", bag: player.bag.filter((x) => x.id === "moosehead_map").map((x) => x.qty), icon: itemIcon(GEAR.moosehead_map) }),
		v15Hit: () => { const before = player.hp; player.invuln = 0; hurtPlayer(5, player.x + 40, player.y); return { before, after: player.hp }; },
		v15Strike: () => { const e = world.enemies.find((x) => !x.dead); if (!e) return null; const hp = e.hp; strikeEnemy(e); return { hp, after: e.hp, pending: !!pendingHit }; },
		v15Spawn: (dx, dy) => { spawnRaider("scout", { x: player.x + dx, y: player.y + dy }, null); const e = world.enemies[world.enemies.length - 1]; if (e) { e.aggro = true; e.temper = "hostile"; e.raid = false; } return e ? { id: e.id, x: e.x, y: e.y } : null; },
		v15Enemy: (id) => { const e = world.enemies.find((x) => x.id === id); return e ? { x: e.x, y: e.y, aggro: !!e.aggro, dead: !!e.dead } : null; },
		v15Tp: (x, y) => { player.x = x; player.y = y; snapPrev(); sync(true); },
		v15Talk: (role) => { const n = world.npcs.find((x) => x.role === role); if (!n) return null; openTalk(n); return dialogue ? { speaker: dialogue.speaker, text: dialogue.text, choices: dialogue.choices.map((c) => c.label) } : null; },
		v15Npcs: () => world.npcs.map((n) => n.role),
		// v15.10: play-as-Sarah / pet / wildlife probe
		v15Probe1510: () => {
			const g = world?.npcs.find((n) => n.role === "sarah");
			const wild = { raccoon: 0, turtle: 0, turtleOnRoad: 0, list: [] };
			for (const e of world?.enemies ?? []) if (!e.dead && (e.kind === "raccoon" || e.kind === "turtle")) { wild[e.kind]++; const t = tileOf(e.x, e.y); if (e.kind === "turtle" && wRoad(t.tx, t.ty)) wild.turtleOnRoad++; wild.list.push({ kind: e.kind, x: Math.round(e.x), y: Math.round(e.y), road: wRoad(t.tx, t.ty), water: wNear(t.tx, t.ty, 2, wWater) }); }
			const hd = useHud.getState().dialogue;
			return { hero: w13.hero, body: plImg("walk") && images.get(plImg("walk")) === images.get("v2/sarah-walk") ? "v2/sarah-walk" : "other", giver: g ? v2Who(g) : null, giverPos: g ? { x: g.x, y: g.y } : null, giverH: g ? folkHeight(g) : 0,
				player: { x: player.x, y: player.y }, pet: petBody ? { x: petBody.x, y: petBody.y, moving: petBody.moving } : null, dog: dogBody ? { x: dogBody.x, y: dogBody.y, withJustin: !!dogBody.withJustin } : null, dialogue: hd ? { speaker: hd.speaker, text: hd.text, choices: hd.choices.map((c) => ({ label: c.label })) } : null, wild };
		},
		v15Wild: (kind, x, y) => { const e = q11Spawn([kind, null, null, 5, 0, 2], { x, y }, "wild", false); if (e) { e.temper = "timid"; e.wild = true; } return !!e; },
		propKinds: () => { const o = {}; for (const p of world?.props ?? []) o[p.kind] = (o[p.kind] ?? 0) + 1; return { map: mapId, n: world?.props.length ?? 0, kinds: o, thinWreck: world?.thinWreck195 ?? 0 }; },
		v15Start: () => ({ x: player.x, y: player.y, st: v14.st, harmony: townSpot(ISO_TOWNS[0]), farm: farmCenter() }),
		town145Goose: () => { q10.dog = Math.max(q10.dog, 4); },
		pos: () => player ? { x: player.x, y: player.y } : null,
		town143Msg: (m) => m?.type === "leaveTown" ? leaveTown(m) : townQuest(m),
		gates: () => world ? world.gates.map((g) => ({ tx: g.tx, ty: g.ty, side: g.side })) : [],
		gatesFull: () => world ? world.gates.map((g) => ({ ...g })) : [],
		hurtPlayer: (n) => { if (player) { player.invuln = 0; hurtPlayer(n, player.x + 10, player.y); } },
		recipes: () => RECIPES.map((r) => ({ kind: r.kind, label: r.label, v14: !!r.v14 })),
		freeFarmTile: () => { if (!world) return null; const f = tileOf(farmCenter().x, farmCenter().y); for (let r = 3; r < 9; r++) for (let y = f.ty - r; y <= f.ty + r; y++) for (let x = f.tx - r; x <= f.tx + r; x++) if (inFarm(x, y) && footprintFree(world, x, y, 1, 1) && world.tiles[y * MAP_W + x] !== 2) return { tx: x, ty: y }; return null; },
		toggleBuild: (on) => { buildOpen = !!on; sync(true); },
		save: () => saveGame(),

		getYaw: () => lastYaw,
		getSpeed: () => lastSpeed,
		getPos: () => ({
			x: player?.x ?? 0,
			y: player?.y ?? 0
		}),
		setPos: (x, y) => {
			if (!player) return;
			player.x = x;
			player.y = y;
			intent = null;
			const focus = worldToScreen(player.x, player.y, 0, 0);
			camX = focus.sx - viewW / 2;
			camY = focus.sy - viewH / 2;
			freeCam = false;
		},
		enterKind: (kind) => {
			const prop = world?.props.find((p) => p.kind === kind);
			if (prop) startEnter(prop);
		},
		propOf: (kind) => {
			const prop = world?.props.find((p) => p.kind === kind);
			if (!prop) return null;
			const c = propCenter(prop);
			return {
				tx: prop.tx,
				ty: prop.ty,
				x: c.x,
				y: c.y
			};
		},
		folk: () => (world?.npcs ?? []).map((n) => { const r = worldToScreen(n.x, n.y, camX, camY); const z = zoomPoint(r.sx, r.sy); return { role: n.role, name: n.name, dir: n.dir, frame: n.frame, sx: Math.round(z.sx ?? z.x ?? 0), sy: Math.round(z.sy ?? z.y ?? 0) }; }),
		placeNpc: (role, x, y, dir = 0) => { const n = world?.npcs.find((m) => m.role === role); if (!n) return false; n.x = n.homeX = x; n.y = n.homeY = y; n.path = []; n.pause = 99; n.dir = dir; return true; },
		npcPlace: (role, x, y) => { const n = world?.npcs.find((q) => q.role === role); if (!n) return false; n.x = x; n.y = y; for (const k of ["homeX", "hx", "tx0"]) if (k in n) n[k] = x; for (const k of ["homeY", "hy", "ty0"]) if (k in n) n[k] = y; return true; },
		npcOf: (role) => {
			const npc = world?.npcs.find((n) => n.role === role);
			return npc ? {
				x: npc.x,
				y: npc.y,
				name: npc.name
			} : null;
		},
		progress: () => player ? {
			skills: skillView(player),
			skillPoints: player.skillPoints,
			perks: player.perks,
			karma: player.karma,
			rep: player.rep,
			party: party ? party.name : null,
			level: player.level
		} : null,
		giveXp: (n) => grantXp(n),
		talk: (role) => {
			const npc = world?.npcs.find((n) => n.role === role);
			if (npc) openTalk(npc);
		},
		setZoom: (z) => {
			zoom = Math.max(.32, Math.min(2.4, z));
		},
		setKeys: (codes) => {
			injected = new Set(codes);
		},
		addTime: (sec) => {
			clock += sec;
			rotPiles();
			sync(true);
		},
		getClock: () => clockLabel(clock),
		mapInfo: () => ({
			id: mapId,
			name: world?.name ?? "",
			seed: worldSeed,
			exits: exitSides,
			gates: world?.gates ?? []
		}),
		questState: () => ({ quest, snow, jackTrust, jackMet, bunkerSeen, wood: player?.wood ?? 0, respawn: player ? [player.respawnX, player.respawnY] : null }),
		enemies: () => world ? world.enemies.map((e) => ({ id: e.id, x: Math.round(e.x), y: Math.round(e.y), name: e.name ?? "", kind: e.kind ?? "", variant: e.variant ?? "", quest: !!e.quest, dead: !!e.dead, hp: e.hp, maxHp: e.maxHp, elite: !!e.elite })) : [],
		strike: (id, dmg) => {
			const e = world?.enemies.find((q) => q.id === id);
			if (!e || e.dead) return;
			e.hp -= dmg;
			e.hurt = .2;
			if (e.hp <= 0) markDead(e, e.xp);
			sync(true);
		},
		setQuest: (q) => {
			quest = q;
			sync(true);
		},
		giveIron: (n) => {
			if (player) player.scrap += n;
			sync(true);
		},
		choose: (id) => applyChoice(id),
		v13State: () => JSON.parse(JSON.stringify({ ...w13, hud: v13Hud(), player: player ? { name: player.name, hair: player.hair, def: player.def, atk: player.atk, maxHp: player.maxHp, maxStamina: player.maxStamina, hp: player.hp, scrap: player.scrap, look: player.look, coat: player.coatId, head: player.headId, legs: player.legsId, hands: player.handsId, feet: player.feetId, bag: player.bag.filter((b) => ARMOR13_IDS.includes(b.id)) } : null, sight: sightRadius(), mapId })),
		v13Set: (patch) => { for (const [k, v] of Object.entries(patch)) w13[k] = v && typeof v === "object" && !Array.isArray(v) ? { ...w13[k], ...v } : v; if (player) refreshGear(player); sync(true); },
		statsNow: () => statsOpen,
		bagNow: () => player ? { bag: player.bag.map((b) => `${b.id}x${b.qty}`), over: layoutGrid(player).over } : null,
		v13Take: (id, n = 1) => takeItem(id, n),
		statsToggle: () => { api.toggleStats(); return statsOpen; },
		v13Reset: (k, v) => { w13[k] = v; if (player) refreshGear(player); sync(true); },
		v13Weather: (id) => { w13.weather = { id, day: curDay() }; sync(true); return { sight: sightRadius(), speed: weather13().speed, bike: weather13().bike }; },
		v13Daily: () => { w13.weather.day = -1; v13Daily(curDay()); },
		v13Needs: (h) => { needsTick(h); sync(true); return { ...w13.needs }; },
		v13Forage: () => forage(true),
		v13Fx: () => ({ ...fx13(), core: core13() }),
		v13Hurt: (n, kind) => { const e = kind ? world.enemies.find((q) => !q.dead && q.kind === kind) : null; player.invuln = 0; hurtPlayer(n, e ? e.x : player.x + 10, e ? e.y : player.y); return { hp: player.hp, dura: { ...w13.dura }, ail: { ...w13.ail } }; },
		v13Ail: (id) => catchAil(id, "Test."),
		v13Camp: (id, ok) => { campRaid(id, ok); return { camps: { ...w13.camps }, freed: w13.freed, lt: w13.main.ltKills }; },
		v13DepotSpot: () => q10Tile(DEPOT13.tx, DEPOT13.ty),
		v13CampSpot: (id) => { const c = CAMPS13.find((x) => x.id === id); return c ? camp13Spot(c) : null; },
		v13Road: (id) => { w13.road.n = 0; startRoadEvent(id); return w13.roadEv; },
		v13Travel: (id) => { fastTravel(id); return { mapId, x: player.x, y: player.y, gas: countOf("gas") }; },
		tfEcho: () => ({ tf: { ...(l1.tf ?? {}) }, out: townState().questFlags }),
		farm195: () => ({ q10: { seed: q10.seed, moose: q10.moose, dog: q10.dog, radio: q10.radio, ferry: q10.ferry }, q11: Object.fromEntries(Q11.map((q) => [q.id, q11.q[q.id]?.s ?? 0])), main: { act: w13.main.act, choice: w13.main.choice, siege: w13.main.siege, won: w13.main.won, ending: w13.main.ending }, gas: countOf("gas"), stew: countOf("stew"), dogMode: v3.dog.mode, hunger: w13.needs.hunger, dura: duraOf(player?.coatId), lv: lv("hunting") }),
		v13Act: (n) => { w13.main.act = n; sync(true); },
		v13Tick: () => v13MainTick(),
		v13Caravan: () => v13Caravan(),
		v13Moon: (day) => ({ phase: moonPhase(day), ...moonEffect(moonPhase(day)), dark: nightDark(day * DAY_LENGTH_SEC + DAY_LENGTH_SEC * 23 / 24) }),
		v13Body: () => ({ walk: plImg("walk"), hit: plImg("hit"), down: plImg("down"), gun: plImg("gun"), gunAtk: plImg("gun-atk"), axe: plImg("axe"), death: plImg("death"), cols: plImg("hit") ? sheetCols(images.get(plImg("hit"))) : 0, armor: armorLayerNames("walk") }),
		v13Hours: (h) => { clock += h / 24 * DAY_LENGTH_SEC; },
		invEquip: (id, slot) => api.invEquip(id, slot),
		invUnequip: (slot) => api.invUnequip(slot),
		invUse: (id) => api.invUse(id),
		craft: (id) => craft(id),
		dropItem: (id) => { if (player) { player.bag = player.bag.filter((s) => s.id !== id); refreshGear(player); } },
		countOf: (id) => player?.bag.reduce((n, s) => n + (s.id === id ? s.qty : 0), 0) ?? 0,
		addWood: (n) => { if (player) player.wood += n; },
		logTail: () => [...allLog],
		snowTile: () => {
			if (!world || !player) return null;
			let best = null, bd = 1e18;
			for (let ty = 2; ty < MAP_H - 2; ty++) for (let tx = 2; tx < MAP_W - 8; tx++) {
				let ok = true;
				for (let k = 0; k < 8 && ok; k++) if (world.tiles[ty * MAP_W + tx + k] !== 4 || world.blocked[ty * MAP_W + tx + k]) ok = false;
				if (!ok) continue;
				const x = (tx + .5) * TILE, y = (ty + .5) * TILE, d = Math.hypot(x - player.x, y - player.y);
				if (d < bd) { bd = d; best = { x, y }; }
			}
			return best;
		},
		leave: () => leaveHouse(),
		insideInfo: () => inside ? { id: inside.id, kind: world?.props.find((p) => p.id === inside.id)?.kind ?? "", rx: inside.rx, ry: inside.ry, origin: roomOrigin(), scale: roomScale(), dims: roomDims(), door: roomDoor(), phase } : null,
		exitCheck: () => world ? world.props.filter((p) => canWalkIn(p)).map((p) => { const d = doorPoint(p); const t = tileOf(d.x, d.y); const o = clearOutside(d.x, d.y); const ot = tileOf(o.x, o.y); const seen = new Set([ot.ty * 156 + ot.tx]); const q = [[ot.tx, ot.ty]]; while (q.length && seen.size < 400) { const [x, y] = q.shift(); for (const [ax, ay] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) { const k = ay * 156 + ax; if (ax < 0 || ay < 0 || ax >= 156 || ay >= 156 || seen.has(k) || cellBlocked(world, ax, ay)) continue; seen.add(k); q.push([ax, ay]); } } return { kind: p.kind, id: p.id, blocked: cellBlocked(world, t.tx, t.ty), moved: Math.round(Math.hypot(o.x - d.x, o.y - d.y)), reach: seen.size }; }) : [],
		doorOf: (kind) => { const p = world?.props.find((q) => q.kind === kind); return p ? doorPoint(p) : null; },
		screenOf: (x, y) => { const r = worldToScreen(x, y, camX, camY); return zoomPoint(r.sx, r.sy); },
		openSpotNear: (r) => { if (!world || !player) return null; const t = tileOf(player.x, player.y); for (let k = 0; k < 200; k++) { const a = k * 2.4, rr = r + (k % 3); const tx = Math.round(t.tx + Math.cos(a) * rr), ty = Math.round(t.ty + Math.sin(a) * rr); if (tx < 0 || ty < 0 || tx >= 156 || ty >= 156 || cellBlocked(world, tx, ty)) continue; if (world.props.some((p) => { const sp = PROP_SPEC[p.kind]; return tx >= p.tx - 1 && tx < p.tx + sp.w + 1 && ty >= p.ty - 3 && ty < p.ty + sp.h + 1; })) continue; const x = (tx + .5) * 64, y = (ty + .5) * 64; const sc = worldToScreen(x, y, camX, camY), zp = zoomPoint(sc.sx, sc.sy); if (zp.sx < 80 || zp.sx > viewW - 120 || zp.sy < 90 || zp.sy > viewH - 140) continue; if (pathTo(world, player.x, player.y, x, y)) return { x, y, sx: zp.sx, sy: zp.sy }; } return null; },
		dbg: () => ({ phase, intent: intent ? { kind: intent.kind, x: intent.x, y: intent.y, path: intent.path?.length } : null, opening: !!opening, travelLock, pointerDown, inside: !!inside, hold: holdWalk }),
		forceEnter: (kind) => { const p = world?.props.find((q) => q.kind === kind); if (!p || !player) return false; const d = doorPoint(p); player.x = d.x; player.y = d.y; finishEnter(p); sync(true); return true; },
		walkTo: (x, y) => { if (!world || !player) return false; const path = pathTo(world, player.x, player.y, x, y); intent = { kind: "walk", x, y, path: path ?? [] }; return !!path; },
		blockedHere: () => world && player ? { r: pointBlocked(world, player.x, player.y, RADIUS), c: pointBlocked(world, player.x, player.y, 0), x: player.x, y: player.y, w: pointBlocked(world, player.x - 20, player.y, RADIUS), e: pointBlocked(world, player.x + 20, player.y, RADIUS), n: pointBlocked(world, player.x, player.y - 20, RADIUS), s: pointBlocked(world, player.x, player.y + 20, RADIUS) } : null,
		doorDbg: (kind) => { const p = world?.props.find((q) => q.kind === kind); if (!p) return null; const sp = PROP_SPEC[p.kind]; const pd = PAINTED_DOORS[sp.image]; const c = propCenter(p); return { c, off: pd && houseArtToWorld(p.kind, pd.g[0], pd.g[1]), door: doorPoint(p), foot: images.get(sp.image)?.foot, w: images.get(sp.image)?.width, h: images.get(sp.image)?.height, locked: !!p.locked, opening: OPEN_TIME }; },
		giveItem: (id, qty = 1) => tryGive(id, qty),
		giveReward: (id, qty = 1) => giveItem(id, qty),
		fillPack: () => { let n = 0; for (const id of Object.keys(GEAR)) if (id !== "grokclaw" && !player.bag.some((b) => b.id === id) && tryGive(id, 1)) n++; return { n, full: !canFit(player, "grokclaw") }; },
		pilesNow: () => piles.map((q) => ({ title: q.title, x: q.x, y: q.y, items: q.items.map((i) => `${i.id}x${i.qty}`) })),
		encounters: () => {
			const e = (id) => { const x = world?.enemies.find((q) => q.id === id); return x ? { x: x.x, y: x.y, hp: x.hp, dead: x.dead, aggro: x.aggro } : null; };
			const w = wardenNpc();
			return { holeb: e(HOLEB_ID), pelletier: e(PELLETIER_ID), wardenFoe: e(WARDEN_ENEMY_ID), wardenNpc: w ? { x: w.x, y: w.y } : null, wardenState, flood: world?.flood ?? null, checkpoint: world?.checkpoint ?? null, dialogue: dialogue ? { speaker: dialogue.speaker, choices: dialogue.choices.map((c) => c.id) } : null };
		},
		stats: () => player ? { scrap: player.scrap, stamina: player.stamina, maxStamina: player.maxStamina, hp: player.hp, atk: player.atk, def: player.def, sight: sightRadius(), perc: perc(), feet: player.feetId, back: player.backId } : null,
		setScrap: (n) => { if (player) player.scrap = n; },
		setStamina: (n) => { if (player) player.stamina = n; },
		togglePack: () => api.togglePack(),
		pressBack: () => api.back(),
		dbgInv: () => player ? { slots: Object.fromEntries(EQUIP_SLOTS.map((s) => [s, player[SLOT_FIELD[s]]])), atk: player.atk, def: player.def, rows: layoutGrid(player).rows, over: layoutGrid(player).over, grid: player.gridPos } : null,
		walkInKinds: () => world ? [...new Set(world.props.filter((p) => canWalkIn(p)).map((p) => p.kind))] : [],
		die: () => {
			if (!player) return;
			player.hp = 0;
			phase = "dead";
			intent = null;
			closePanels();
			saveGame();
			sync(true);
		},
		setHp: (n) => {
			if (player) player.hp = n;
		},
		farmProps: () => world ? world.props.filter((p) => inFarm(p.tx, p.ty)).map((p) => ({ kind: p.kind, tx: p.tx, ty: p.ty, x: propCenter(p).x, y: propCenter(p).y })) : [],
		propsNear: (x, y, r) => world ? world.props.map((p) => ({ id: p.id, kind: p.kind, ...propCenter(p), fade: p.fade || 0 })).filter((p) => Math.hypot(p.x - x, p.y - y) < r) : [],
		beastAt: (id, kind, x, y) => {
			const e = world?.enemies.find((q) => q.id === id);
			if (!e) return;
			e.kind = kind; e.x = x; e.y = y; e.homeX = x; e.homeY = y; e.temper = "hostile"; e.aggro = true; e.dead = false; e.hp = Math.max(e.hp, 10); e.path = null;
		},
		setLook: (look) => {
			if (player) player.look = look;
		},
		wear: (slot, id) => {
			if (player) player[slot] = id;
		},
		dbgDir: () => player ? player.dir : -1,
		walkStraight: (x, y) => {
			intent = { kind: "walk", x, y, path: [{ x, y }] };
		},
		openArea: (x, y, R) => {
			// a clear patch (no blocked tile and no prop within 5 tiles) near x,y, for clean close-ups
			if (!world) return null;
			const c = tileOf(x, y);
			const occupied = new Set(world.props.map((p) => p.ty * 156 + p.tx));
			let best = null;
			for (let r = 0; r <= R && !best; r++) for (let ty = c.ty - r; ty <= c.ty + r && !best; ty++) for (let tx = c.tx - r; tx <= c.tx + r && !best; tx++) {
				if (Math.max(Math.abs(tx - c.tx), Math.abs(ty - c.ty)) !== r) continue;
				let ok = true;
				for (let dy = -7; dy <= 7 && ok; dy++) for (let dx = -7; dx <= 7 && ok; dx++) {
					const ax = tx + dx, ay = ty + dy;
					if (ax < 1 || ay < 1 || ax > 154 || ay > 154 || cellBlocked(world, ax, ay) || occupied.has(ay * 156 + ax)) ok = false;
				}
				if (ok) best = { x: (tx + .5) * 64, y: (ty + .5) * 64 };
			}
			return best;
		},
		clearNear: (x, y, r) => {
			if (!world) return 0;
			let n = 0;
			for (const e of world.enemies) if (!e.dead && !e.quest && Math.hypot(e.x - x, e.y - y) < r) {
				e.dead = true;
				e.death = 0;
				n++;
			}
			return n;
		},
		heroLogStart: () => { heroLog = []; },
		heroLogTake: () => { const l = heroLog || []; heroLog = []; return l; },
		hurtNow: () => { if (player) player.hurt = .4; },
		swingNow: () => {
			swingAnim = .48;
			reach = .22;
		},
		tractorGo: () => {
			const t = world?.props.find((p) => p.kind === "tractor");
			if (!t) return null;
			tractorReady = true;
			return propCenter(t);
		},
		setSnow: (n) => { snow = n; sync(true); },
		saveNow: () => saveGame(),
		q11State: () => JSON.parse(JSON.stringify({ ...q11, mode11, m11, season: seasonNow(), day: curDay(), escort: !!escortBodies, fishing: !!fishGame })),
		q11Set: (patch) => { Object.assign(q11, patch); q11World(); sync(true); },
		q11Spot: (key) => q11Spot(key),
		bikeInfo: () => { const b = world?.props.find((p) => p.farmBike); const n = nearBike(); return { mounted, built: bikeBuilt(), farmBike: b ? propCenter(b) : null, near: !!n, nearFarm: !!n?.farmBike, gas: player?.bag.find((s) => s.id === "gas")?.qty ?? 0, gasDist, notice: noticeRange(100), optional: [...OPTIONAL_ART] }; },
		mountNow: () => api.mount(),
		artLoaded: (names) => names.map((n) => !!(images.get(n) && images.get(n).width)),
		artCols: (n) => images.get(n) ? sheetCols(images.get(n)) : 0,
		folkSheetOf: (role) => { const n = world?.npcs.find((m) => m.role === role); return n ? folkSheet(n) : null; },
		beastSheets: () => (world?.enemies ?? []).filter((e) => !e.dead).map((e) => ({ id: e.id, kind: e.kind, variant: e.variant, sheet: beastSheet(e), x: e.x, y: e.y })),
		lazyDone: () => LAZY_STATE.pending === 0,
		v3State: () => ({ ...JSON.parse(JSON.stringify(v3)), dogBody: dogBody ? { x: Math.round(dogBody.x), y: Math.round(dogBody.y) } : null, traps: q11.traps, toast: v3Toast }),
		v3Set: (patch) => { Object.assign(v3, patch); sync(true); },
		v3Train: (id, n) => train(id, n),
		v3Lv: (id) => lv(id),
		v3Price: (n) => v3Price(n),
		v3Ach: (id) => achieve(id),
		v3Build: (id) => buildUpgrade(id),
		v3Daily: () => { clock += DAY_LENGTH_SEC; q11.farm.lastDay = curDay() - 1; q11Daily(); },
		v3Travel: (n) => travelTo(n, n === 0 ? () => { const s = skowSign(); return { x: s.x + 90, y: s.y + 60 }; } : null),
		v3Tracks: () => world ? world.enemies.filter((e) => isGame(e)).map((e) => ({ id: e.id, kind: e.kind, temper: e.temper, n: e.trail?.length ?? 0, last: e.trail?.[e.trail.length - 1] ?? { x: e.x, y: e.y }, x: e.x, y: e.y, aggro: e.aggro, tracked: !!e.tracked })) : [],
		v3Sight: () => sightRadius(),
		v3Dog: () => ({ mode: v3.dog.mode, hp: v3.dog.hp, down: v3.dog.down, body: dogBody ? { x: dogBody.x, y: dogBody.y } : null }),
		dogHurt: (n) => dogHurt(n),
		skins: () => world ? world.props.filter((p) => p.skin).map((p) => ({ kind: p.kind, skin: p.skin, label: p.label || "", tx: p.tx, ty: p.ty })) : [],
		v3Spot: (k) => q11Spot(k),
		audio: () => audioState(),
		lazyPending: () => LAZY_STATE.pending,
		dismountNow: () => api.dismount(),
		q11Cur: (id) => { const q = questById(id); const st = q11.q[id]; const step = q && q11Cur(q); return { s: st?.s ?? 0, n: q?.steps.length ?? 0, kind: step?.kind ?? "", site: step?.site ?? "", left: st?.left ?? 0 }; },
		q11Targets: () => q11Targets().map((t) => ({ key: t.key, mode: t.mode, x: Math.round(t.x), y: Math.round(t.y) })),
		q11Force: (o) => { if ("fish" in o) fishForce = o.fish; if ("caravan" in o) caravanForce = o.caravan; },
		q11Mode: (k) => api.startMode(k),
		q11ModeEnd: (won) => q11EndMode(!!won, "Test: the mode ends."),
		q11ModeTime: (sec) => { if (m11) { if (mode11 === "watch") m11.t += sec; if (mode11 === "winter") clock += sec; } },
		modeResult: () => useModeResult.getState().result,
		addStone: (n) => { if (player) player.stone += n; },
		addIron: (n) => { if (player) player.scrap += n; },
		q10State: () => JSON.parse(JSON.stringify(q10)),
		q10Set: (patch) => { Object.assign(q10, patch); q10World(); sync(true); },
		q10Spot: (key) => q10Spot(key),
		q10Targets: () => q10Targets().map((t) => ({ key: t.key, mode: t.mode, x: Math.round(t.x), y: Math.round(t.y) })),
		q10Dog: () => dogBody ? { x: Math.round(dogBody.x), y: Math.round(dogBody.y) } : null,
		dialogueNow: () => dialogue ? { speaker: dialogue.speaker, text: dialogue.text, choices: dialogue.choices.map((c) => ({ id: c.id, label: c.label })) } : null,
		frameStats: () => ({ avg: +frameMs.avg.toFixed(2), worst: +frameMs.worst.toFixed(2), p95: +[...frameMs.list].sort((a, b) => a - b)[Math.floor(frameMs.list.length * .95)]?.toFixed(2), n: frameMs.n, gfxHigh }),
		weatherMix: () => ({ ...weatherMix }),
		treeCount: () => world ? { trees: world.props.filter(isTree193).length, thinned: world.thin193 || 0 } : null,
		weatherEvent: (on) => { precipForce = on === undefined ? null : !!on; return precipOn193(); },
		aiPaused: () => aiPausedN,
		fpsNow: () => fpsNow,
		perfMode: (on) => { if (on !== undefined) { perfMode = !!on; sync(true); } return perfMode; },
		perfReset: () => { perf.on = true; perf.frames = 0; perf.acc = {}; return true; },
		perfStats: () => { const o = { frames: perf.frames }; for (const k in perf.acc) o[k] = +(perf.acc[k] / Math.max(1, perf.frames)).toFixed(3); return o; },
		vehicles: () => world ? world.props.filter((p) => p.kind === "car-sedan" || p.kind === "car-truck").map((p) => ({ kind: p.kind, tx: p.tx, ty: p.ty, ...propCenter(p), art: vehicleArt(p) })) : [],
		setHour: (h) => {
			const span = DAY_LENGTH_SEC;
			clock = Math.floor(clock / span) * span + (h / 24) * span;
			sync(true);
		},
		heroSheet: (name) => {
			const img = images.get(name);
			if (!img) return "";
			const src = heroSource(name, img);
			if (src.toDataURL) return src.toDataURL();
			const c = document.createElement("canvas");
			c.width = img.width; c.height = img.height;
			c.getContext("2d").drawImage(img, 0, 0);
			return c.toDataURL();
		},
		revealMap: () => {
			if (!world) return;
			for (let i = 0; i < explored.length; i++) if (world.tiles[i] !== 5) explored[i] = 1;
		}
	};
	requestAnimationFrame(frame);
	return api;
}
function cleanName(name) {
	return name.replace(/[^\w\s'-]/g, "").trim().slice(0, 18) || "Packer";
}
/** v19 attack / death / guard art: one row of 4 frames (wide image). Old single poses stay 1. */
const FARM_PAINTED_PROPS = true;
function stripFrames(name, img) {
	if (!img || !name) return 1;
	if (!(name.endsWith("-atk") || name.endsWith("-dead") || name.startsWith("guard-"))) return 1;
	return img.width / img.height > 2.2 ? 4 : 1;
}
/** 8-direction combat sheets (4 frames x 8 facing rows, taller than wide): drop-in for any *-atk / *-dead. */
const TALL_COMBAT = new Set();
/** v12: gw14 sheets on their own grids (bike 78x76, tractor 143x100, hero-ride 87x92). */
const TRACTOR_ROW = 6;
const V2_COLS = { "v2/bike-ride": 6, "v2/bike-parked": 1, "v2/hero-ride": 6, "v2/sarah-ride": 6, "v2/tractor-drive": 4 };
/** v12: gw14 people (88x124 cells, 8 facing rows). */
const V2_FOLK = /^v2\/(hollowed|holt|jack|mira|nora|sarah|cyndal|loki|marcel|justin|player|boss-collector|bandit-[a-z]+)-/;
/** v12: raider attack / death come from the gw14 action sheets under the legacy -atk / -dead names. */
// v14: timber wolf stand-ins (tinted coyote sheets) until Grok Build art lands at v2/wolf-<action>.png
const ART_ALIAS = { wolf: "v2/wolf-walk", "wolf-dead": "v2/wolf-dead" };
for (const k of ["scout", "armor", "brute", "torch", "gray", "blue"]) {
	ART_ALIAS[`v2/bandit-${k}-walk-atk`] = k === "brute" || k === "torch" ? `v2/bandit-${k}-axe` : `v2/bandit-${k}-gun-atk`;
	ART_ALIAS[`v2/bandit-${k}-walk-dead`] = `v2/bandit-${k}-death`;
}
ART_ALIAS["v2/hollowed-walk-atk"] = "v2/hollowed-axe";
ART_ALIAS["v2/hollowed-walk-dead"] = "v2/hollowed-death";
ART_ALIAS["v2/boss-collector-walk-atk"] = "v2/boss-collector-atk";
ART_ALIAS["v2/boss-collector-walk-dead"] = "v2/boss-collector-death";
function sheetRowsOf(name) {
	if (TALL_COMBAT.has(name)) return 8;
	if (V2_COLS[name] || V2_FOLK.test(name) || name.startsWith("pl/") || name.startsWith("v2/armor/")) return 8;
	if (name.startsWith("overlay-")) return 8;
	if (name.endsWith("-atk") || name.endsWith("-dead") || name.startsWith("guard-") || name === "bunker-room") return 4;
	if (/^(v2\/)?hero/.test(name) || name.startsWith("npc-") || name.startsWith("raider") || name.startsWith("boss") || name === "villager" || name === "wolf" || name === "coyote" || name === "deer" || name === "moose" || name === "rabbit" || name === "squirrel" || name === "crow") return 8;
	return 4;
}

function footXOf(img, cols, rows, sw, sh) {
	if (img.footX) return img.footX;
	const out = [];
	try {
		const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
		const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0);
		const d = g.getImageData(0, 0, img.width, img.height).data;
		for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
			const x0 = Math.round(k * sw), y0 = Math.round(r * sh), w = Math.round(sw), h = Math.round(sh);
			let bot = -1;
			for (let y = h - 1; y >= 0 && bot < 0; y--) for (let x = 0; x < w; x++) if (d[((y0 + y) * img.width + x0 + x) * 4 + 3] > 60) { bot = y; break; }
			let sx = 0, n = 0;
			for (let y = Math.max(0, bot - 3); y <= bot; y++) for (let x = 0; x < w; x++) if (d[((y0 + y) * img.width + x0 + x) * 4 + 3] > 60) { sx += x; n++; }
			out.push(n ? sx / n : 0);
		}
	} catch { /* keep unlocked */ }
	img.footX = out;
	return out;
}
/** v14.1 scale check: NPC and raider sheets were drawn at 98-104 px against the hero's 69 px. At 11 px/ft every
 * person is drawn at real height: grown men and women 66 px (6 ft), kids (Cyndal, Loki) 58 px. Each character is
 * measured once from its walk/base sheet so all its poses share one scale. */
// size198: people/boss visible heights come from SIZE_IN (npc 70.5 in = 99 px, kid 62 in = 87 px, boss 76 in, The Grok 98 in)
const FIG_ADULT = Math.round(SIZE_IN.npc * PX_PER_IN), FIG_KID = Math.round(SIZE_IN.kid * PX_PER_IN);
/** size198: last drawn height (px at zoom 1, full image) per sprite name, for the size check. */
const SIZE_SEEN = new Map();
const figCache = new Map();
function figFamily(name) {
	if (/^(v2\/)?hero|^pl\/|^overlay-/.test(name)) return null;
	let m = name.match(/^v2\/(bandit-[a-z]+|hollowed|[a-z]+)-(walk|run|idle|axe|gun|gun-atk|crouch|carry|death|down|hit|talk|walk-atk|walk-dead)$/);
	if (m && !/^(wolf|bike|tractor|hero)/.test(m[1])) return { key: "v2/" + m[1], ref: [`v2/${m[1]}-walk`, `v2/${m[1]}-idle`] };
	m = name.match(/^(npc-[a-z]+|guard-(?:watch-)?[a-z]+|raider(?:-[a-z]+)?|boss-[a-z]+|villager)(?:-atk|-dead)?$/);
	if (m && !/-dead$/.test(name)) return { key: m[1], ref: [m[1]] };
	return null;
}
function measureFig(img, sh) {
	try {
		const cols = sheetCols(img), sw = Math.floor(img.width / cols), h = Math.floor(sh);
		const c = document.createElement("canvas"); c.width = sw; c.height = h;
		const g = c.getContext("2d", { willReadFrequently: true }); if (!g) return 0;
		let best = 0;
		for (let f = 0; f < Math.min(cols, 4); f++) {
			g.clearRect(0, 0, sw, h); g.drawImage(img, f * sw, 0, sw, h, 0, 0, sw, h);
			const d = g.getImageData(0, 0, sw, h).data; let top = -1, bot = -1;
			for (let y = 0; y < h && top < 0; y++) for (let x = 0; x < sw; x++) if (d[(y * sw + x) * 4 + 3] > 60) { top = y; break; }
			for (let y = h - 1; y >= 0 && bot < 0; y--) for (let x = 0; x < sw; x++) if (d[(y * sw + x) * 4 + 3] > 60) { bot = y; break; }
			if (top >= 0) best = Math.max(best, bot - top + 1);
		}
		return best / h;
	} catch { return 0; }
}
function figScale(name, drawH, images) {
	const fam = figFamily(name); if (!fam || typeof document === "undefined") return 1;
	let frac = figCache.get(fam.key);
	if (frac == null) {
		const ref = fam.ref.map((r) => images.get(r)).find((im) => im && im.width) || images.get(name);
		if (!ref || !ref.width) return 1;
		const rows = sheetRowsOf(fam.ref[0]) || 1;
		frac = measureFig(ref, ref.height / rows);
		figCache.set(fam.key, frac);
	}
	if (frac < .2) return 1;
	const want = fam.key === "boss-grok" ? SIZE_IN.grok * PX_PER_IN : /^boss-/.test(fam.key) ? SIZE_IN.boss * PX_PER_IN : /cyndal|loki/.test(fam.key) ? FIG_KID : FIG_ADULT;
	const k = Math.max(.4, Math.min(1.6, want / (frac * drawH)));
	figLog[fam.key] = { frac: +frac.toFixed(3), k: +k.toFixed(3), px: Math.round(frac * drawH * k) };
	return k;
}
const figLog = {};
/** v10.1: the gw12 Justin sheets are a 69 px figure in an 88x124 cell; draw them at the same 69 px hero height as the walk. */
const HERO69 = new Set(["hero", "hero-gun", "hero-gun-atk", "hero-hit", "hero-down", "v2/hero-idle", "v2/hero-axe", "v2/hero-death"]);
function heroScale(name) {
	return HERO69.has(name) || name.startsWith("pl/") ? 0.806 * 124 / 69 : 1;
}
/** 4 frames across (352px), 6 (528px) or 8 (704px). Anything else stays 4. */
function sheetCols(img) {
	if (img && img.cols) return img.cols;
	// v14.1: any frame count loads; the count comes from the sheet width (88 px cells, or square-ish cells by height)
	const cw = 88 * (img && img.artScale || 1); // v15.4: upscaled sheets have 132 px cells
	if (img && img.width % cw === 0 && img.width >= cw) { const c = img.width / cw; if (c >= 1 && c <= 32) return c; }
	if (img && img.height) { for (const rows of [8, 4, 1]) { const ch = img.height / rows, c = Math.round(img.width / (ch * 88 / 124)); if (c >= 1 && c <= 32 && Math.abs(img.width / c - ch * 88 / 124) < 2) return c; } }
	return 4;
}
function measureFoot(img, sheet, sheetRows = 4) {
	const pose = measurePose(img, sheet, sheetRows);
	return pose.foot;
}
function measurePose(img, sheet, sheetRows = 4) {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	const g = canvas.getContext("2d", { willReadFrequently: true });
	const empty = { foot: .92, feet: new Float32Array([.92]), footX: new Float32Array([.5]) };
	if (!g) return empty;
	g.drawImage(img, 0, 0);
	const data = g.getImageData(0, 0, img.width, img.height).data;
	const bottomOf = (x0, y0, w, h) => {
		for (let y = h - 1; y >= 0; y--) {
			let n = 0;
			for (let x = 0; x < w; x++) if (data[((y0 + y) * img.width + (x0 + x)) * 4 + 3] > 24) n++;
			if (n >= 4) return y + 1;
		}
		return Math.round(h * .92);
	};
	if (!sheet) {
		const b = bottomOf(0, 0, img.width, img.height);
		return { foot: b / img.height, feet: new Float32Array([b / img.height]), footX: new Float32Array([.5]) };
	}
	const rows = sheetRows ?? 4;
	const cols = sheetCols(img);
	const cw = img.width / cols;
	const ch = img.height / rows;
	const feet = new Float32Array(rows * cols);
	const footX = new Float32Array(rows * cols);
	let frac = 0;
	for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
		const y0 = row * ch;
		const x0 = col * cw;
		const bottom = bottomOf(x0, y0, cw, ch);
		let sx = 0, n = 0;
		const yStart = Math.max(0, bottom - 12);
		for (let y = yStart; y < bottom; y++) for (let x = 0; x < cw; x++) if (data[((y0 + y) * img.width + (x0 + x)) * 4 + 3] > 24) { sx += x; n++; }
		const i = row * cols + col;
		feet[i] = bottom / ch;
		footX[i] = n ? (sx / n) / cw : .5;
		frac = Math.max(frac, feet[i]);
	}
	return { foot: frac || .92, feet, footX };
}
function softenSprite(img, radius, protectRows = 0) {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	const g = canvas.getContext("2d", { willReadFrequently: true });
	if (!g) return canvas;
	g.drawImage(img, 0, 0);
	if (radius <= 0) return canvas;
	const image = g.getImageData(0, 0, canvas.width, canvas.height);
	const px = image.data;
	const w = canvas.width;
	const h = canvas.height;
	const n = w * h;
	const alpha0 = new Uint8Array(n);
	for (let i = 0; i < n; i++) alpha0[i] = px[i * 4 + 3];
	const cur = new Uint8Array(n);
	const nxt = new Uint8Array(n);
	for (let i = 0; i < n; i++) cur[i] = px[i * 4 + 3] < 24 ? 0 : 255;
	for (let pass = 1; pass <= radius; pass++) {
		nxt.set(cur);
		for (let y = 1; y < h - 1; y++) {
			const row = y * w;
			for (let x = 1; x < w - 1; x++) {
				const i = row + x;
				if (cur[i] !== 255) continue;
				if (cur[i - 1] < pass || cur[i + 1] < pass || cur[i - w] < pass || cur[i + w] < pass || cur[i - w - 1] < pass || cur[i - w + 1] < pass || cur[i + w - 1] < pass || cur[i + w + 1] < pass) nxt[i] = pass;
			}
		}
		cur.set(nxt);
	}
	for (let i = 0; i < n; i++) {
		const d = cur[i];
		if (d === 0 || d === 255) continue;
		const keep = d === 1 ? .22 : .3 + .6 * (d / radius);
		px[i * 4 + 3] = Math.round(px[i * 4 + 3] * keep);
	}
	if (protectRows > 0) {
		const ch = Math.floor(h / protectRows);
		const c88 = 88 * (img.artScale || 1);
		const cols = (w % c88 === 0 && (w / c88 === 3 || w / c88 === 4 || w / c88 === 6 || w / c88 === 8)) ? w / c88 : 4;
		const cw = Math.floor(w / cols);
		for (let row = 0; row < protectRows; row++) for (let col = 0; col < cols; col++) {
			const x0 = col * cw;
			const y0 = row * ch;
			let bottom = -1;
			for (let y = ch - 1; y >= 0 && bottom < 0; y--) for (let x = 0; x < cw; x++) if (alpha0[(y0 + y) * w + x0 + x] > 24) { bottom = y; break; }
			if (bottom < 0) continue;
			for (let y = Math.max(0, bottom - 18); y <= bottom; y++) for (let x = 0; x < cw; x++) {
				const i = (y0 + y) * w + x0 + x;
				if (alpha0[i] > 24) px[i * 4 + 3] = alpha0[i];
			}
		}
	}
	g.putImageData(image, 0, 0);
	return canvas;
}
/** v11.1 optional art (public/game/v2/optional.json, written by scripts/gen-optional-art.mjs). Only listed files are requested. */
const OPTIONAL_ART = new Set();
/** v14.7 drop-in terrain (see TERRAIN_SPEC.md): public/game/terrain/terrain.json lists files in public/game/terrain/.
 * "<name>.png" replaces the built-in image of that name; "<name>-<n>.png" adds variants picked per tile/prop.
 * Ground uses ground-<dirt|scrub|road|rubble|snow>[-n]. */
const TERRAIN = { files: new Set(), variants: new Map() };
const GROUND_KEYS = ["dirt", "scrub", "road", "rubble", "snow"];
function terrainBase(stem) {
	const g = /^ground-(dirt|scrub|road|rubble|snow)(?:-(\d+))?$/.exec(stem);
	if (g) return `ground-mat-${g[1]}`;
	return stem.replace(/-\d+$/, "");
}
/** Name to draw for an image, given a stable seed (tile index or prop id): a drop-in variant if any. */
function terrainPick(name, seed) {
	const v = TERRAIN.variants.get(name);
	if (!v || !v.length) return name;
	return v[((seed * 2654435761) >>> 0) % v.length];
}
async function loadImages(images) {
	try {
		const r = await fetch(`/game/terrain/terrain.json?v=${ART_V}`);
		if (r.ok) for (const n of await r.json()) if (typeof n === "string" && /^[a-z0-9-]+$/.test(n.replace(/\.png$/, ""))) TERRAIN.files.add(n.replace(/\.png$/, ""));
	} catch {
		/* no terrain pack */
	}
	try {
		const r = await fetch(`/game/v2/optional.json?v=${ART_V}`);
		if (r.ok) for (const n of await r.json()) if (typeof n === "string") OPTIONAL_ART.add(n);
	} catch {
		/* no manifest: stand-ins only */
	}
	const extra = [...OPTIONAL_ART].filter((n) => n.startsWith("v2/"));
	for (const n of [...extra]) if (/^v2\/(bandit-[a-z]+|boss-collector)-walk$/.test(n)) extra.push(`${n}-atk`, `${n}-dead`);
	// v11.2 lazy loading: bosses and attack/death sheets aren't needed for the first screen.
	// The menu opens once the core set is in; the rest streams in right after.
	const terr = [...TERRAIN.files].map((f) => `terrain/${f}`);
	const all = [...IMAGES, ...extra, ...terr];
	const core = all.filter((n) => !LAZY_SHEET.test(n));
	const lazy = all.filter((n) => LAZY_SHEET.test(n));
	await loadSet(images, core);
	LAZY_STATE.pending = lazy.length;
	LAZY_STATE.done = loadSet(images, lazy).then(() => { LAZY_STATE.pending = 0; });
	// drop-in terrain: exact names replace the built-in image; numbered ones become variants of it
	for (const f of TERRAIN.files) {
		const img = images.get(`terrain/${f}`);
		if (!img) continue;
		const base = terrainBase(f);
		const list = TERRAIN.variants.get(base) ?? [];
		list.push(`terrain/${f}`);
		TERRAIN.variants.set(base, list);
	}
}
const LAZY_SHEET = /^boss-|-(atk|dead|death|gun-atk|axe|down|hit|crouch|carry|talk)$/;
const LAZY_STATE = { pending: -1, done: Promise.resolve() };
function loadSet(images, list) {
	return Promise.all(list.map((name) => new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			if (ART_SCALED.has(ART_ALIAS[name] ?? name)) img.artScale = ART_SCALE;
			if (V2_COLS[name]) img.cols = V2_COLS[name];
			if ((name.endsWith("-atk") || name.endsWith("-dead")) && img.height > img.width * 1.2) TALL_COMBAT.add(name);
			const rows = sheetRowsOf(name);
			const strips = stripFrames(name, img) > 1;
			const posed = (V2_COLS[name] || V2_FOLK.test(name)) && !TALL_COMBAT.has(name) || !strips && !name.endsWith("-atk") && !name.endsWith("-dead") && (/^(v2\/)?hero/.test(name) || name.startsWith("npc-") || name.startsWith("raider") || name.startsWith("boss") || name === "villager" || name === "wolf" || name === "coyote" || name === "deer" || name === "moose" || name === "rabbit" || name === "squirrel" || name === "crow");
			// v15.4: the 1.5x touch-up sheets are already edge-cleaned and antialiased, so skip the (costly) soften pass
			const radius = name.startsWith("ground-") || name === "farm-room" || name === "bunker-room" || img.artScale ? 0 : posed ? 1 : 1;
			const tall = TALL_COMBAT.has(name);
			const soft = softenSprite(img, radius, posed || tall ? rows : 0);
			if ((posed || strips || tall) && /^(v2\/)?hero/.test(name)) soft.sharp = img;
			const pose = measurePose(img, posed || strips || tall, strips ? 1 : rows);
			if (img.cols) soft.cols = img.cols;
			if (img.artScale) soft.artScale = img.artScale;
			soft.foot = pose.foot;
			soft.feet = pose.feet;
			soft.footX = pose.footX;
			images.set(name, soft);
			resolve();
		};
		img.onerror = () => resolve();
		img.src = `/game/${ART_ALIAS[name] ?? name}.png?v=${ART_V}`;
	}))).then(() => void 0);
}
