// Recovered game engine. Type checks live in the modules this file imports.
// @ts-nocheck
/** Art cache-bust: bump after replacing any file in public/game (sheets, overlays, item icons). */
const ART_V = 2072;
import { dyeBodySheet, type HairId, type StartLook } from "@/game/look";
import { GEAR, CRAFT, armorSlot, rollDrop, roleKit, roleStats, traitOf, defaultLook, type LookId, type RoleId, type TraitId } from "@/game/gear";
import { audioState, setMusic, sfx, unlockAudio } from "@/game/audio";
import { POSE } from "@/game/pose-table";
import { SPRITE_FIT } from "@/game/sprite-fit";
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
} from "@/game/progress";
import { assertIso, facing8, facing8Screen, facingFromWorld, screenDirToWorld, screenToWorld, worldToScreen, worldVelToScreen } from "@/game/iso";
import { b64ToBytes, bytesToB64, getSlot, hasSave, setSlot, slotInfos, playerToSave, readSave, writeSave, type SaveData, type SavedRegion } from "@/game/save";
import { useHud, useModeResult, useRaidMode } from "@/game/store";
import { EQUIP_SLOTS, GRID_COLS, SLOT_FIELD, canFit, equipSlotOf, fitsAt, itemSize, layoutGrid, slotAccepts, wornCount } from "@/game/inventory";
import { clockLabel, DAY_LENGTH_SEC, morningClock, nightShade } from "@/game/time";
import { AILMENTS, BACKSTORIES, COMPANIONS, COMPANION_NAME, CORE_STATS, DURA_MAX, DYES, ENDINGS, FOOD_VALUE, LOYALTY_FX, LOYALTY_HELP, LOYALTY_LEAVE, MAIN_ACTS, MIGRATION, MOON_NAMES, NEED_RATE, NEW_SKILLS, RECIPES13, REBUILD, ROAD_EVENTS, SET_BONUS, SKILL_PERKS, TOWNS13, WEATHER, caravanOnRoad, CARAVAN_ROUTES as CARAVAN13, coreEffects, makeBounties, moonEffect, moonPhase, perkCount, pickEnding, pickRoadEvent, rollWeather, travelGas } from "@/game/v13";
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
  createWorld,
  footprintFree,
  pathTo,
  pickSides,
  pointBlocked,
  propCenter,
  tileOf,
  addProp,
  tryPlace,
  vacate,
  HOLEB_ID,
  PELLETIER_ID,
  WARDEN_ENEMY_ID,
  WARDEN_NPC_ID,
  type World,
} from "@/game/world";

export interface GameApi {
  destroy: () => void;
  begin: (name: string, role: RoleId, bonus: { strength: number; vigor: number; endurance: number; intellect: number; perception: number; luck: number }, trait: TraitId, look: LookId, appearance?: StartLook) => void;
  continueGame: () => void;
  /** Title menu "Raid Mode": a standalone raid night at the farm that never touches the story save. */
  raidMode: () => void;
  startMode: (kind: "winter" | "endless" | "watch") => void;
  setStick: (x: number, y: number) => void;
  tap: (action: "attack" | "interact" | "build" | "pause" | "resume" | "menu" | "respawn" | "save") => void;
  choose: (id: string) => void;
  selectRecipe: (index: number) => void;
  pointer: (x: number, y: number, type: "move" | "down" | "up") => void;
  nudgeZoom: (factor: number) => void;
  pan: (dx: number, dy: number) => void;
  recenter: () => void;
  togglePack: () => void;
  toggleStats: () => void;
  dismount: () => void;
  mount: () => void;
  setSlot: (n: number) => void;
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
  endTurn: () => void;
  takeLoot: (key: string) => void;
  /** Android back button: close the open panel, else open/close the pause menu. False on the main menu. */
  back: () => boolean;
  /** Step out of the building you are in, from anywhere in the room (the always-visible Leave button). */
  leave: () => void;
}

assertIso();
var SCREEN_SPEED = 248;
var ENEMY_SPEED = 148;
/** One adult body, small next to a house the way a Fallout figure is. */
var ADULT = 86;
var HERO_H = ADULT;
var NPC_H = ADULT;
var RADIUS = 14;
var STEP = 1 / 60;
var IMAGES = [
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
	const ctx = canvas.getContext("2d");
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
	let turnBased = false;
	let ap = 8;
	let apMax = 8;
	let apWalk = 0;
	const lines = [];
	let log = [];
	let dialogue = null;
	let talkNpc = null;
	let party = null;
	let partyReturn = null;
	let raidNight = 0;
	/** The Bangor Warden: 0 not met, 1 paid / slipped past, 2 fighting, 3 down. */
	let wardenState = 0;
	let millSeen = false;
	let wardenAsked = false;
	let radioWarned = false;
	let nightLatch = false;
	let bossThisNight = false;
	let tractorReady = false;
	const guardPost = new Map();
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
	const LURE = new Set(["scarecrow", "bait"]);
	const RAID_VAR = new Set(["scout", "brute", "torch", "jumper", "armor", "shield", "atv", "fur", "mask", "saw"]);
	/** A night raider. The Chopping's named bosses (quest enemies) use the same boss art but stay home. */
	const isRaider = (e) => !!e && RAID_VAR.has(e.variant) && !e.quest;
	const GUARD_ROLES = new Set(["sarah", "justin", "adele", "pete", "sera", "holt"]);
	let raidClock = 10;
	/** Raid Night (started from Justin at night once the farm is a base). Not saved: a reload mid-raid ends it safely. */
	let raid = null;
	let raidsHeld = 0;
	let raidEndedByReload = false;
	/** true while a title-menu Raid Mode run is going: saving is off, the end returns to the menu. */
	let raidMode = false;
	let piles = [];
	let nextPile = 1;
	let lootId = -1;
	let clock = morningClock();
	let rotAcc = 0;
	let goneNpcs = /* @__PURE__ */ new Set();
	let mapId = 0;
	let worldSeed = 5402695;
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
	let zoom = 1;
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
			t: 4
		});
		log = [text];
	}
	const allLog = [];
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
		return { snow, wood: player?.wood ?? 0, jackTrust, bunkerSeen, jackMet, warden: wardenState, scrap: player?.scrap ?? 0, raidReady: raidCanStart(), raidOn: !!raid, raidNext: raidNight + 1 };
	}
	function hudQuestText() {
		if (raid) {
			const pct = Math.max(0, Math.round(raid.house / raid.houseMax * 100));
			const stage = raid.phase === "wave" ? `Wave ${raid.wave} of ${raid.waves}` : raid.wave === 0 ? `Wave 1 of ${raid.waves} soon` : `Wave ${raid.wave + 1} of ${raid.waves} soon`;
			return `Raid night ${raid.night}: ${stage}. Farmhouse ${pct}%.`;
		}
		if (snow < 3 && quest <= 0) {
			if (snow <= 0) return "First Snow: talk to Justin at the Cambridge Road farm.";
			if (snow === 1) return `First Snow: bring Justin ${SNOW_WOOD} wood. ${Math.min(player?.wood ?? 0, SNOW_WOOD)} of ${SNOW_WOOD}. Woodpile by the barn.`;
			return "First Snow: go see Sarah at the farm.";
		}
		const m11h = q11HudText();
		if (m11h) return m11h;
		const side = snow >= 3 ? q10Hud(q10) || q11Hud(q11) : "";
		return side || questText(quest, questKills);
	}
	function musicTick() {
		setMusic(phase === "menu" ? "menu" : raid ? "raid" : nightDark(clock) > .3 ? "night" : "day");
	}
	function sync(force = false) {
		if (!force) return;
		musicTick();
		const p = player;
		useHud.setState({
			phase,
			ready: useHud.getState().ready,
			hasSave: hasSave(),
			slot: getSlot(),
			slots: slotInfos(),
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
			questText: hudQuestText(),
			v113: v3Hud(),
			v13: player ? v13Hud() : null,
			journal: (() => { const all = [...journalEntries(quest, questKills, talkState()), ...q10Journal(q10, snow >= 3), ...q11Journal(q11, Q11C()), ...q11JournalExtra()]; return [...all.filter((e) => !e.done), ...all.filter((e) => e.done)]; })(),
			log,
			buildOpen,
			recipe,
			canPlace: canPlaceAt(hoverTile()),
			dialogue,
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
	function giveItem(id, qty = 1) {
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
		worldSeed = freshSeed();
		exitSides = pickSides(worldSeed);
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
		player.rep = { lowelltown: 0, attean: 0, holeb: 0, ponds: 0 };
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
		setLog("You wake on the cot under the eave. Cambridge Road. The stove in the farmhouse is warm.");
		const tagged = SKILLS.filter((s) => player.tags.includes(s.id)).map((s) => s.name).join(", ");
		pushLog(`Tagged skills: ${tagged}. They rise twice as fast.`);
		pushLog("Justin is out by the farmhouse. First snow is coming.");
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
		camY = (player.x + player.y) / 2 - viewH / 2;
		sync(true);
		saveGame();
	}
	function bootSave(data) {
		worldSeed = data.seed ?? 5402695;
		mapId = data.map ?? 0;
		exitSides = data.exits && data.exits.length >= 2 ? data.exits : pickSides(worldSeed);
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
		if (data.role && data.bag && data.weaponId !== void 0 && data.coatId) {
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
		raidNight = data.raidNight ?? 0;
		raidsHeld = data.raidsHeld ?? 0;
		raid = null;
		raidEndedByReload = !!data.raidOn;
		if (raidEndedByReload) {
			pushLog("The raid ended while you were away. The farm made it to morning; no reward for a night you didn't finish.");
			raidEndedByReload = false;
		}
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
		camY = (player.x + player.y) / 2 - viewH / 2;
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
	function saveGame() {
		if (!world || !player || raidMode || mode11) return;
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
		data.raidNight = raidNight;
		data.raidsHeld = raidsHeld;
		data.raidOn = !!raid;
		data.warden = wardenState;
		data.tractorReady = tractorReady;
		data.goneNpcs = [...goneNpcs];
		data.seed = worldSeed;
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
			trait: p.trait || ""
		};
	}
	function ensureProgress(p) {
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
		const up = home ? 2 * (v3.up.lookout || 0) + (v3.up.solar && nightDark(clock) > .3 ? 3 : 0) : 0;
		return Math.max(2, Math.round((5 + perc() + (trail >= 45 ? 1 : 0) + (carrying("binoculars") ? 2 : 0) + up) * (inside ? 1 : weather13().sight)));
	}
	function noticeRange(base) {
		// v11.1: the motor bicycle is loud; raiders hear it coming from much farther off
		return base * (1 - Math.min(.4, skillOf("sneak") / 220)) * (mounted ? 1.7 : 1) * (1 - .03 * lv("stealth")) * (nightDark(clock) > .3 ? moon13().bold : 1) * (w13.weather.id === "fog" ? .7 : 1);
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
		if (!footprintFree(world, tile.tx, tile.ty, spec.w, spec.h)) return false;
		const cost = RECIPES[recipe];
		return player.wood >= cost.wood && player.stone >= cost.stone && player.scrap >= cost.scrap;
	}
	function tryBuild() {
		if (!world || !player) return;
		const cost = RECIPES[recipe];
		const tile = hoverTile();
		const spec = PROP_SPEC[cost.kind];
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
		if (id.startsWith("v13-") && v13Choice(id)) return;
		if (id.startsWith("q11-") && q11Choice(id)) return;
		if (id.startsWith("q113-") && v3Choice(id)) return;
		if (id === "raid-ask") {
			const n = raidNight + 1;
			dialogue = {
				speaker: "Justin",
				text: `Night ${n}. If we light the yard they'll come at us in ${raidWaves(n)} waves off the road and the tree line. Sarah and I take the posts. Cyndal watches from the loft, Loki stays in with the door barred. We hold till they quit or the sun's up. Ready?`,
				choices: [{ label: "Light the yard. Hold the farm", id: "raid-go" }, { label: "Not tonight", id: "close" }]
			};
			sfx("click");
			sync(true);
			return;
		}
		if (id === "raid-go") {
			dialogue = null;
			phase = "play";
			startRaid();
			sync(true);
			return;
		}
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
			pushLog(`Justin wants ${SNOW_WOOD} armloads of wood. The woodpile is by the barn.`);
		} else if (id === "snow-wood" && snow === 1 && player.wood >= SNOW_WOOD) {
			player.wood -= SNOW_WOOD;
			snow = 2;
			grantXp(12);
			pushLog("Justin stacks the wood by the stove. Sarah wants to see you.");
		} else if (id === "snow-done" && snow === 2) {
			snow = 3;
			lootedChests.add(91001);
			lootedChests.add(91002);
			giveItem("cider");
			giveItem("donut");
			giveItem("donut");
			const cot = world.props.find((p) => p.kind === "cot");
			if (cot && mapId === 0) {
				const spot = nearestRespawn(cot.tx, cot.ty, 1, 1);
				player.respawnX = spot.x;
				player.respawnY = spot.y;
			}
			kitchenDay = Math.floor(clock / DAY_LENGTH_SEC);
			shiftRep("ponds", 2, 6);
			grantXp(30);
			pushLog("First Snow on Cambridge Road: done. The farm is your base now. You wake on the cot if you fall.");
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
			text: "Between raids the vise is free. Timber and iron buy a harder night.",
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
		if (!giveItem(item)) {
			pushLog("Your pack is full.");
			return;
		}
		player.wood -= wood;
		player.scrap -= scrap;
		pushLog(got);
	}
	function upgradeDefense() {
		if (!player || !world) return;
		const prop = world.props.find((p) => NEXT_TIER[p.kind]);
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
		const price = Math.max(1, Math.round(v3Price(priceOf(cost, skillOf("barter"), rep)) * (role === "sarah" && v3.up.solar >= 2 ? .8 : 1)));
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
			if (!giveItem(item)) break;
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
	/** Biscuit, Loki's dog: drawn with the existing coyote sheet, never an enemy. */
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
	function q10World() {
		q11World();
		q10Spots = new Map();
		q10Latch.clear();
		dogBody = null;
		if (!world || mapId !== 0) return;
		q10Props();
		v3FarmProps();
		if (q10.seed === 2 && q10.seedLeft > 0) q10SeedCamp();
		if (q10.moose === 2) q10Bull();
		if (q10.dog >= 2) q10PlaceDog();
	}
	function q10PlaceDog() {
		if (q10.dog === 2) {
			const end = q10Spot(`trail${DOG_TRAIL.length - 1}`);
			dogBody = { x: end.x + 20, y: end.y + 10, dir: 3, frame: 0, anim: 0, moving: false };
		} else if (q10.dog === 3 && player) dogBody = { x: player.x + 40, y: player.y + 30, dir: 0, frame: 0, anim: 0, moving: false };
		else if (q10.dog >= 4) {
			const loki = world?.npcs.find((n) => n.role === "loki");
			const f = loki ?? farmCenter();
			dogBody = { x: f.x + 46, y: f.y + 28, dir: 1, frame: 0, anim: 0, moving: false };
		}
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
		if (q10.dog === 2) {
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
		if (q10.moose === 4) npc("justin", "#d89a5a");
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
	Q10_SITE_TALK[`trail${DOG_TRAIL.length - 1}`] = () => ({ speaker: "Biscuit", text: "Under a blowdown in the spruce, a muddy brown dog with one ear up. He thumps his tail and won't come out. He's shaking.", choices: [{ label: "Come on, Biscuit. Let's go home", id: "q10-dog-found" }, { label: "Give him a minute", id: "close" }] });
	function q10Step(dt) {
		if (!world || !player || mapId !== 0 || inside || phase !== "play") return;
		// Biscuit tags along once found
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
				pushLog("You drag the last of the moose into the yard. Tell Justin.");
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
		} else if (key.startsWith("trail") && q10.dog === 2) {
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
	/** A story raid night just ended: Biscuit bolted during the shooting. */
	function q10AfterRaid() {
		if (q10.dog !== 0 || raidMode) return;
		q10.dog = 1;
		pushLog("Loki's yelling from the porch. Biscuit went under the fence when the shooting started.");
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
		camY = (player.x + player.y) / 2 - viewH / 2;
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
		else if (id === "q10-dog-accept" && q10.dog === 1) { q10.dog = 2; q10.dogStep = 0; q10PlaceDog(); pushLog("Lost Dog: Biscuit's paw prints start in the mud by the orchard."); }
		else if (id === "q10-dog-found" && q10.dog === 2) { q10.dog = 3; q10PlaceDog(); pushLog("Biscuit crawls out and leans on your leg. Walk him home to Loki."); }
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
			pushLog("Moose Season: done. Six quarters hanging, the hide on the barn wall. Justin cuts you a share: meat, a hide and jerky.");
			sfx("level");
		}
		return false;
	}
	/** Ground rings under every objective and Biscuit's paw prints; drawn flat on the ground plane. */
	function q10All() {
		return [...(mapId === 0 ? q10Targets() : []), ...q11Targets()];
	}
	function q10DrawGround(dcx, dcy, dpr) {
		if (!world) return;
		const z = zoom;
		ctx.save();
		ctx.setTransform(dpr * z, dpr * .5 * z, -dpr * z, dpr * .5 * z, dpr * (viewW / 2 * (1 - z) - dcx * z), dpr * (viewH / 2 * (1 - z) - dcy * z));
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
					const age = Math.max(0, Math.min(1, (clock - p.t) / 90));
					ctx.globalAlpha = .75 * (1 - age) + .1;
					ctx.fillStyle = "#2a1c10";
					const side = i % 2 ? 7 : -7;
					if (hoof) { ctx.beginPath(); ctx.ellipse(p.x + side, p.y - 3, 4, 6, .6, 0, Math.PI * 2); ctx.ellipse(p.x + side + 5, p.y + 1, 4, 6, .6, 0, Math.PI * 2); ctx.fill(); }
					else { ctx.beginPath(); ctx.ellipse(p.x + side, p.y, 6, 5, 0, 0, Math.PI * 2); ctx.fill(); for (let c = -1; c <= 1; c++) { ctx.beginPath(); ctx.arc(p.x + side + c * 4, p.y - 7, 2.2, 0, Math.PI * 2); ctx.fill(); } }
				}
			}
			ctx.globalAlpha = .85;
		}
		if (q10.dog === 2 && mapId === 0) {
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
	/** Floating diamonds over objectives (and over the person to talk to) plus Biscuit, depth-sorted with the world. */
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
		if (dogBody) {
			const tile = tileOf(dogBody.x, dogBody.y);
			if (visible[tile.ty * 156 + tile.tx]) draws.push({ z: bodyZ(dogBody.x, dogBody.y), draw: () => {
				const frame = dogBody.moving ? Math.floor(dogBody.anim) % 4 : 0;
				// art hook: public/game/v2/biscuit-walk.png (and biscuit-idle.png) when present, else the coyote sheet
				const own = dogBody.moving ? "v2/biscuit-walk" : images.get("v2/biscuit-idle") ? "v2/biscuit-idle" : "v2/biscuit-walk";
				if (images.get(own)) blit(own, dogBody.x, dogBody.y, 27, true, frame, dogBody.dir, dcx, dcy);
				else blit("coyote", dogBody.x, dogBody.y, realH("coyote", 27), true, frame, dogBody.dir, dcx, dcy);
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
		FARM_UPGRADES.forEach((u, i) => {
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
		if (f.plots && mult) { const n = f.plots * mult + Math.floor(lv("farming") / 2); giveItem("apple", n); got.push(`${n} apples and potatoes`); train("farming", 4 + f.plots); }
		if (f.coop && day % 2 === 0) { giveItem("pork", f.coop); got.push(`${f.coop} hen${f.coop > 1 ? "s" : ""} for the pot`); }
		if (f.smoke) { const meat = player.bag.find((s) => s.id === "meat")?.qty ?? 0; const n = Math.min(meat, f.smoke); if (n) { takeItem("meat", n); giveItem("jerky", n * 2); got.push(`${n * 2} jerky from the smokehouse`); } }
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
	function q11StartMode(kind) {
		unlockAudio();
		sfx("click");
		useModeResult.setState({ result: null });
		if (kind === "endless") {
			api.raidMode();
			mode11 = "endless";
			m11 = { kind, best: Number(localStorage.getItem("maine-rpg-endless-best") || 0) };
			setLog(MODE_TEXT.endless);
			sync(true);
			return;
		}
		mode11 = kind;
		bootNew("Packer", "hunter", { strength: 1, vigor: 1, endurance: 1, intellect: 0, perception: 0, luck: 0 }, "eye", "wool");
		mode11 = kind;
		snow = Math.max(snow, 3);
		jackMet = true;
		if (GEAR.carbine) { giveItem("carbine", 1); player.weaponId = "carbine"; }
		giveItem("shells", 10);
		refreshGear(player);
		const fh = world.props.find((q) => q.kind === "farmhouse");
		if (fh) { const d = doorPoint(fh); player.x = d.x; player.y = d.y + 48; }
		const span = DAY_LENGTH_SEC;
		if (kind === "winter") {
			clock = Math.floor(clock / span) * span + (8 / 24) * span;
			q11.seasonDay = curDay() - SEASON_DAYS;
			player.bag = player.bag.filter((s) => !["apple", "stew", "jerky", "meat", "pork", "cider", "donut", "smokedfish"].includes(s.id));
			giveItem("jerky", 2);
			m11 = { kind, day0: curDay(), days: 3, warmth: 100, food: 70, ate: 0, t: 0 };
		} else {
			clock = Math.floor(clock / span) * span + (21.5 / 24) * span;
			giveItem("lantern", 1);
			m11 = { kind, t: 0, dur: 150, caught: 0, lost: 0, hens: 6, spawnT: 2, spawned: 0 };
		}
		setLog(MODE_TEXT[kind]);
		camX = player.x - player.y - viewW / 2;
		camY = (player.x + player.y) / 2 - viewH / 2;
		phase = "play";
		sync(true);
	}
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
		if (mode11 === "endless" && m11 && raid) return `Endless Raid · Wave ${raid.wave} · Down ${raid.kills} · Best ${m11.best || 0}`;
		if (q11.caravan === 2 || q11.caravan === 4) return "Trade caravan: ambush! Drive them off the cart.";
		if (q11.hunt) return `Hunting trip: ${q11.hunt.kind}. Wind out of the ${COMPASS8[q11.hunt.wind]}.`;
		return "";
	}
	function q11JournalExtra() {
		const out = [];
		if (snow < 3 || mode11) return out;
		const f = q11.farm;
		out.push({ id: "q11-season", title: `${SEASONS[seasonNow()]} at Cambridge Road`, done: false, text: `Day ${curDay() + 1}. Farm: potato plots ${f.plots}, coop ${f.coop}, stone wall ${f.wall}, smokehouse ${f.smoke}. Fish caught ${q11.fish.caught}${q11.fish.rare ? ` (${q11.fish.rare} rare)` : ""}. Caravan trips ${q11.trips}.${q11.traps.length ? ` Snares set: ${q11.traps.length}.` : ""}` });
		return out;
	}
	/** Farm talk options for the play types. */
	function q11FarmChoices(role) {
		if (snow < 3 || raid || mode11) return [];
		if (role === "sarah") return [{ label: "Work on the farm", id: "q11-farm" }];
		if (role === "justin") return [{ label: "Go on a hunting trip", id: "q11-hunt" }, ...(q11.caravan === 0 ? [{ label: "Take the cart to Bangor", id: "q11-caravan" }] : [])];
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
		if (id === "q11-farm") return openD({
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
		if (id === "q11-hunt" && q11.huntDay === curDay()) return openD({ speaker: "Justin", text: "We've been out once today. Let the woods settle. Tomorrow.", choices: [{ label: "All right", id: "close" }] });
		if (id === "q11-hunt") return openD({ speaker: "Justin", text: "Short trip or long? Mind the wind. If it's at your back they'll smell you a quarter mile off.", choices: [{ label: "Deer in the cutover", id: "q11-hunt-deer" }, { label: "Moose in the alders", id: "q11-hunt-moose" }, { label: "Bear up on the ridge", id: "q11-hunt-bear" }, { label: "Not today", id: "close" }] });
		if ((m = id.match(/^q11-hunt-(deer|moose|bear)$/))) { close(); q11.huntDay = curDay(); q11HuntStart(m[1]); return true; }
		if (id === "q11-caravan") return openD({ speaker: "Justin", text: "Bangor's a long day with the cart. Which way? Route 2's quick but there's road agents. The river road's slower and quieter. The back roads are coyote country.", choices: [...CARAVAN_ROUTES.map((r, i) => ({ label: r.label, id: `q11-car-route-${i}` })), { label: "Not today", id: "close" }] });
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
	// Skowhegan travel, tracks/wind/noise, traps + field dressing, Biscuit the dog.
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
		let n = v3.skills[id]?.lv ?? 0;
		if (id === "hunting" && dogBody && q10.dog >= 4 && v3.dog.mode === "track") n += 2;
		return n;
	}
	function train(id, n) {
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
		if (v3.up.greenhouse) { const n = v3.up.greenhouse * 2; giveItem("greens", n); got.push(`${n} greens from the greenhouse${winter ? " (snow on the glass)" : ""}`); }
		if (v3.up.barrel) { giveItem("water", v3.up.barrel); got.push(`${v3.up.barrel} jug${v3.up.barrel > 1 ? "s" : ""} of rain water`); }
		if (v3.up.cellar) { giveItem("apple", v3.up.cellar); got.push(`${v3.up.cellar} potato${v3.up.cellar > 1 ? "es" : ""} from the cellar`); }
		if (got.length) pushLog(`Farm works: ${got.join(", ")}.`);
		if (v3.windDay !== day) { v3.windDay = day; v3.wind = Math.floor(Math.random() * 8); }
		if (curDay() - (q11.seasonDay || 0) >= SEASON_DAYS * 4) achieve("winter");
		if (v3.dog.down >= 0 && day >= v3.dog.down) { v3.dog.down = -1; v3.dog.hp = 30; v3.dog.mode = "stay"; pushLog("Biscuit's up and wagging at the farm again. Tell him to follow when you're ready."); if (mapId === 0) q10PlaceDog(); }
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
		pushLog(target === 2 ? `Two hours down the old road from ${leaving}. Skowhegan: dead streetlights, the Kennebec loud in the gorge, and one bridge.` : `The road climbs out of the river valley. You come back into ${world.name}.`);
		if (target === 2) achieve("skow");
		camX = player.x - player.y - viewW / 2;
		camY = (player.x + player.y) / 2 - viewH / 2;
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
			const last = e.trail?.[e.trail.length - 1];
			if (!last || Math.hypot(e.x - last.x, e.y - last.y) > 46) {
				(e.trail ??= []).push({ x: e.x, y: e.y, dir: e.dir || 0, t: clock });
				if (e.trail.length > 14) e.trail.shift();
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
		pushLog(fetched ? `Biscuit trots back with the ${name} from your ${trap.kind === "trap" ? "trap" : "snare"}, proud as anything. Dressed out: meat, ${what === "rabbit" ? "" : "pelt, "}bone.` : `A ${name} in the ${trap.kind === "trap" ? "trap" : "snare"}. You dress it out on the spot: ${what === "rabbit" ? "meat and bone" : "pelt, meat and bone"}.`);
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
	// -------- Biscuit
	let barkT = 0, dogHitT = 0, pointAt = null;
	function dogWith() {
		return q10.dog >= 4 && v3.dog.down < 0 && v3.dog.mode !== "stay";
	}
	function v3DogTick(dt) {
		if (!player || !world || q10.dog < 4 || mode11) return;
		if (!v3.dog.joined) { v3.dog.joined = true; achieve("biscuit"); }
		if (v3.dog.down >= 0) { if (dogBody && mapId !== 0) dogBody = null; return; }
		if (v3.dog.mode === "stay") { if (!dogBody && mapId === 0) q10PlaceDog(); }
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
				if (best !== v3DogTick.last) { v3DogTick.last = best; pushLog(`Biscuit's nose goes down. He's on a ${best.kind}, off to the ${compassTo(best.x - player.x, best.y - player.y)}.`); }
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
		if (raider && barkT <= 0 && v3.dog.mode !== "stay") { barkT = 25; v3.barks = (v3.barks || 0) + 1; pushLog(`Biscuit stiffens and growls toward the ${compassTo(raider.x - player.x, raider.y - player.y)}. Raiders, close.`); sfx("hurt"); }
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
			pushLog("Biscuit yelps and goes down, then drags himself off toward home. He'll be at the farm, licking it better. Give him a day.");
		} else pushLog(`Biscuit's hurt (${v3.dog.hp}/30). A bandage would fix him up.`);
		sync(true);
	}
	function dogHeal() {
		if (!player || q10.dog < 4 || v3.dog.down >= 0 || v3.dog.hp >= 30) return false;
		const id = ["bandage", "bandage-std", "bandage-good", "medicine", "trauma"].find((k) => carrying(k));
		if (!id) { pushLog("Nothing to wrap him with. Bandage or medicine."); return false; }
		takeItem(id, 1);
		v3.dog.hp = Math.min(30, v3.dog.hp + Math.round(15 * (1 + .08 * lv("medicine"))));
		train("medicine", 6);
		pushLog(`You wrap Biscuit's leg. He licks your hand (${v3.dog.hp}/30).`);
		sync(true); return true;
	}
	function dogCommand(mode) {
		if (q10.dog < 4) return;
		if (v3.dog.down >= 0) { pushLog("Biscuit's laid up at the farm until tomorrow."); return; }
		v3.dog.mode = mode;
		if (mode !== "stay" && !dogBody && player) dogBody = { x: player.x + 46, y: player.y + 30, dir: 0, frame: 0, anim: 0, moving: false };
		pushLog(mode === "stay" ? "\"Stay, Biscuit.\" He lies down with a sigh." : mode === "track" ? "\"Find 'em, Biscuit.\" His nose goes to the ground." : "\"Come on, Biscuit.\" He falls in at your heel.");
		sfx("click"); sync(true);
	}
	// -------- main tick + hud
	function v3Tick(dt) {
		if (!player || !world || phase !== "play" || mode11) return;
		v3TrackTick(dt);
		v3TrapTick();
		v3DogTick(dt);
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
			skills: TRADE_SKILLS.map((d) => ({ id: d.id, name: d.name, lv: v3.skills[d.id].lv, xp: v3.skills[d.id].xp, need: skillNeed(v3.skills[d.id].lv), perk: d.perk, how: d.how })),
			ach: ACHIEVEMENTS.map((a) => ({ id: a.id, name: a.name, text: a.text, got: !!v3.ach[a.id] })),
			ups: FARM_UPGRADES2.map((u) => ({ id: u.id, name: u.name, tier: v3.up[u.id], max: u.tiers.length, next: v3.up[u.id] < u.tiers.length ? u.tiers[v3.up[u.id]].effect : "" })),
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
		if (id === "q113-works") return openD({ speaker: "Sarah", text: `Bigger works for the farm. You've got ${player.wood} wood, ${player.stone} stone and ${player.scrap} iron.`, choices: [...FARM_UPGRADES2.map((u) => ({ label: upLabel(u), id: `q113-up-${u.id}` })), { label: "Never mind", id: "close" }] });
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
			core: { agility: 1, grit: 1 }, backstory: "", hard: false,
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
		for (const [k, n] of Object.entries(b.skills)) if (v3.skills[k]) v3.skills[k].lv = Math.max(v3.skills[k].lv, n);
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
		return WEATHER[w13.weather.id] ?? WEATHER.clear;
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
		return w13.dura[id] ?? DURA_MAX;
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
		const ids = armorPieces();
		if (!ids.length) return;
		const id = ids[Math.floor(Math.random() * ids.length)];
		w13.dura[id] = Math.max(0, duraOf(id) - (2 + Math.min(4, Math.floor(dmg / 4))));
		if (w13.dura[id] === 0 && !w13.flagsBroke?.[id]) pushLog(`Your ${GEAR[id].name.toLowerCase()} is worn through. Patch it or repair it at the workbench.`);
		refreshGear(player);
	}
	function repairCost(id) {
		const g = GEAR[id];
		const tier = TIER_OF[g?.quality] ?? 1;
		return Math.max(1, tier * 2 + Math.ceil((DURA_MAX - duraOf(id)) / 25) - (perk13("mechanics", 6) ? 1 : 0));
	}
	// ---- needs, sickness, buffs
	function needsTick(hours) {
		if (quiet13() || !player || mode11 || raidMode || snow < 3) return;
		const r = w13.hard ? NEED_RATE.hard : NEED_RATE.normal;
		const mul = fx13().drainMul;
		const n = w13.needs;
		n.hunger = Math.max(0, n.hunger - r.hunger * mul * hours);
		n.thirst = Math.max(0, n.thirst - r.thirst * mul * hours);
		n.sleep = Math.max(0, n.sleep - r.sleep * (buffOn("awake") ? .5 : 1) * hours);
		const empty = (n.hunger <= 0 ? 1 : 0) + (n.thirst <= 0 ? 1 : 0) + (n.sleep <= 0 ? 1 : 0);
		if (empty && player.hp > 1) player.hp = Math.max(1, player.hp - r.hurt * empty * hours * 4);
	}
	function needsSpeed() {
		const n = w13.needs;
		return (n.hunger < 15 ? .92 : 1) * (n.thirst < 15 ? .92 : 1) * (n.sleep < 15 ? .9 : 1);
	}
	function ailSpeed() {
		let m = 1;
		for (const id of Object.keys(w13.ail)) m *= AILMENTS[id]?.speed ?? 1;
		return m;
	}
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
		if (w13.ail.cut) player.hp = Math.max(1, player.hp - AILMENTS.cut.hpDay * 3);
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
				if (Math.random() < (mounted ? .3 : .08) * (1 - .05 * lv("survival"))) {
					if (mounted) { parkBike(false); pushLog("The back wheel goes out from under you on the black ice. You hit the road hard."); }
					else pushLog("Your feet go out from under you on the black ice.");
					player.hp = Math.max(1, player.hp - (mounted ? 8 : 3));
					if (Math.random() < (mounted ? .5 : .2)) catchAil("bone", "You landed wrong.");
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
		v13SiegeTick(dt);
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
		if (quiet13() || inside || raid || dialogue || mapId === 1) return;
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
		if (w13.caravan[caravanKey(r)]) return openD13("Caravan", "The caravan's already gone by today.", [{ label: "Close", id: "close" }]);
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
		if (def.id === "medicine") { if (cureAil("cut", "The medicine knocks the infection down.") || cureAil("cold", "The medicine clears your head.") ) train("medicine", 6); return false; }
		if (def.family === "bandage") { train("firstaid", 5); if (w13.ail.bone && countOf("wood") >= 0 && player.wood >= 1 && perk13("firstaid", 6)) { player.wood -= 1; cureAil("bone", "You splint it with a stave and a bandage."); } if (perk13("firstaid", 3) && w13.ail.cut) cureAil("cut", "Clean cut, clean bandage."); return false; }
		if (!f) return false;
		stack.qty -= 1;
		if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
		const more = 1 + .05 * lv("cooking");
		const n = w13.needs;
		if (f.hunger) n.hunger = Math.min(100, n.hunger + f.hunger * more);
		if (f.thirst) n.thirst = Math.min(100, n.thirst + f.thirst * more);
		if (f.sleep) n.sleep = Math.min(100, n.sleep + f.sleep);
		if (perk13("cooking", 9) && RECIPES13.some((r) => r.makes === def.id)) n.thirst = Math.min(100, n.thirst + 10);
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
		pushLog(`${def.name}: ${f.hunger ? "fed" : ""}${f.thirst ? `${f.hunger ? ", " : ""}watered` : ""}${f.sleep ? " and awake" : ""}.${r?.buff ? ` ${r.text}` : ""}`);
		return true;
	}
	function sleep13() {
		const n = w13.needs;
		n.sleep = 100;
		n.hunger = Math.max(0, n.hunger - 10);
		n.thirst = Math.max(0, n.thirst - 12);
		if (w13.ail.cold) w13.ail.cold -= 1;
	}
	// ---- workbench: repair, patch, dye
	function benchMenu() {
		const pieces = armorPieces();
		if (!pieces.length) return openD13("Workbench", "You're not wearing anything worth fixing.", [{ label: "Close", id: "close" }]);
		const ch = [];
		for (const id of pieces) {
			const d = duraOf(id);
			if (d < DURA_MAX) ch.push({ label: `Repair ${GEAR[id].name} (${d}/${DURA_MAX}): ${repairCost(id)} iron`, id: `v13-repair-${id}` });
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
		if (dialogue || raid || inside) return;
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
		if (a === 1 && snow >= 3 && v3.ach.raid1) mainAdvance();
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
		const feed = { bunker: ["jack", 20], meds: ["marcel", 10], mill: ["marcel", 6], garden: ["mira", 12], school: ["sarah", 10], grok: ["justin", 10], radio: ["sarah", 4], fuel: ["justin", 6], bike: ["justin", 8], lighthouse: ["sarah", 6], wolves: ["sarah", 6] };
		const f = feed[id];
		if (f && !w13.left[f[0]]) { w13.loyal[f[0]] = Math.min(100, (w13.loyal[f[0]] ?? 20) + f[1]); pushLog(`${COMPANION_NAME[f[0]]} thinks better of you (+${f[1]}).`); }
		if (id === "grok") w13.main.flags.grokPath = true;
	}
	function v13SiegeStart() {
		if (w13.main.act !== 8 || w13.main.siege) return;
		w13.main.siege = 1;
		if (!raidCanStart()) { const span = DAY_LENGTH_SEC; clock = Math.floor(clock / span) * span + (21.5 / 24) * span; }
		startRaid();
		if (!raid) { w13.main.siege = 0; return; }
		raid.siege = true;
		raid.waves = 5;
		raid.collector = false;
		const allies = siegeAllies();
		raid.house += 30 * allies; raid.houseMax += 30 * allies;
		pushLog(`Siege of Harmony. ${allies ? `${allies} allies on the walls with you.` : "Nobody's coming. It's you and the farm."}`);
		diary("The Collector came for the farm.");
		sync(true);
	}
	function siegeAllies() {
		const comps = COMPANIONS.filter((c) => !w13.left[c] && (w13.loyal[c] ?? 0) >= 10).length;
		const towns = w13.main.choice === "unite" ? 1 + rebuiltN() + (perk13("leadership", 9) ? 2 : 0) : 0;
		return comps + towns + (q10.dog >= 4 && v3.dog.down < 0 ? 1 : 0);
	}
	function v13SiegeTick(dt) {
		if (!raid?.siege) return;
		if (!raid.collector && raid.wave >= raid.waves) {
			raid.collector = true;
			const fh = raidHouse();
			const c = fh ? propCenter(fh) : { x: player.x, y: player.y };
			spawnRaider("collector", clearOutside(c.x + 700, c.y - 300), { hp: 260, atk: 14, xp: 200, name: "The Collector" });
			pushLog("A big man in a stolen state trooper's coat walks up the road like he owns it. The Collector.");
		}
		raid.allyT = (raid.allyT ?? 0) + dt;
		if (raid.allyT > 5) {
			raid.allyT = 0;
			const n = siegeAllies();
			const foes = world.enemies.filter((e) => !e.dead && e.raid && e.variant !== "collector");
			for (let i = 0; i < Math.min(n, foes.length); i++) { const e = foes[i]; e.hp -= 8; e.hurt = .2; if (e.hp <= 0) { markDead(e, e.xp); raid.kills += 1; } }
		}
	}
	function v13RaidEnd(won, wasSiege) {
		if (!wasSiege) return;
		w13.main.won = !!won && !!w13.main.collectorDown;
		w13.main.siege = 2;
	}
	// ---- dialogue
	function openD13(speaker, text, choices) {
		dialogue = { speaker, text, choices };
		talkNpc = talkNpc ?? null; phase = "dialogue"; intent = null; sfx("talk"); sync(true);
		return true;
	}
	function v13TalkChoices(role) {
		if (raid || mode11 || !player) return [];
		const out = [];
		const a = w13.main.act;
		const c = roleComp(role);
		if (c && w13.left[c]) return [];
		if (role === "sarah") {
			out.push({ label: "Cook a meal", id: "v13-cook" });
			if (mapId === 0) out.push({ label: "Turn in and sleep till morning", id: "v13-sleep" });
			if ((v3.up.bench ?? 0) >= 1) out.push({ label: "Use the workbench (repair, patch, dye)", id: "v13-bench" });
			out.push({ label: "Rebuild Harmony", id: "v13-rebuild" });
			if (a === 7 && !w13.main.choice) out.push({ label: "The Long Winter: decide what we do about the Collector", id: "v13-main-choose" });
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
		if (role === "justin") {
			out.push({ label: "Caravan on the road?", id: "v13-caravan" });
			if (a === 8 && !w13.main.siege) out.push({ label: "The Long Winter: we're ready for them", id: "v13-main-siege" });
		}
		if (MAIN_ACTS[a - 1] && MAIN_ACTS[a - 1].intro[0].toLowerCase().startsWith(role === "cal" ? "jack" : role) && !w13.main.flags[`intro${a}`]) out.push({ label: `The Long Winter: ${MAIN_ACTS[a - 1].title}`, id: `v13-main-intro` });
		return out;
	}
	function v13Choice(id) {
		let m;
		if (id === "v13-cook") return cookMenu();
		if ((m = id.match(/^v13-cook-(.+)$/))) { cook(m[1]); return cookMenu(); }
		if (id === "v13-bench") return benchMenu();
		if (id === "v13-sleep") {
			if (raid) { pushLog("Not tonight. They're on the road."); return close13(); }
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
		if (id === "v13-main-intro") { const a = mainAct(); w13.main.flags[`intro${a.n}`] = true; return openD13(a.intro[0], a.intro[1], [{ label: "Close", id: "close" }]); }
		if (id === "v13-main-signal") { w13.main.flags.signal = true; return openD13("Cyndal", "\"Listen.\" Static, then a calm voice: \"Augusta has fuel. Augusta has medicine. Augusta has order. Come south.\" It loops. \"Same words every hour, Dad says nobody talks that calm anymore.\"", [{ label: "Close", id: "close" }]); }
		if (id === "v13-main-jack") {
			w13.main.flags.jackTalk = true;
			if ((w13.loyal.jack ?? 0) < 30) return openD13("Jack Ready", `"You're not there yet." (Jack's trust: ${w13.loyal.jack}/30. Trade with him, finish his bunker map job.)`, [{ label: "Close", id: "close" }]);
			return openD13("Jack Ready", "He unrolls the survey maps on the hood of the truck. \"That broadcast's a trap. I've watched folks go south on it. Nobody comes back up the Kennebec.\"", [{ label: "Close", id: "close" }]);
		}
		if (id === "v13-main-marcel") { w13.main.flags.marcel = true; return openD13("Marcel Thibodeau", "\"Caravans that answer that signal never come back. Not one. There's a man they call the Collector. Raiders work for him now.\"", [{ label: "Close", id: "close" }]); }
		if (id === "v13-main-choose") {
			const avg = Math.round(COMPANIONS.reduce((n, c) => n + (w13.left[c] ? -50 : w13.loyal[c]), 0) / COMPANIONS.length);
			const canUnite = rebuiltN() >= 1 && avg >= 20;
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
		if (id === "v13-main-siege") { close13(); v13SiegeStart(); return true; }
		if (id === "v13-ending-next") { w13.main.slide += 1; sync(true); return true; }
		return false;
	}
	function close13() {
		dialogue = null; talkNpc = null; phase = "play"; sync(true);
		return true;
	}
	/** Weather overlay drawn in screen space: snow, nor'easter, fog, rain, black-ice sheen. */
	function paintWeather13() {
		const id = w13.weather.id;
		if (id === "clear" || !ctx) return;
		const t = performance.now() / 1000;
		ctx.save();
		if (id === "fog") {
			const hr = player ? worldToScreen(player.x, player.y, camX, camY) : { sx: viewW / 2, sy: viewH / 2 };
			const hp = zoomPoint(hr.sx, hr.sy);
			const g = ctx.createRadialGradient(hp.sx, hp.sy - 40, 60, hp.sx, hp.sy - 40, Math.max(viewW, viewH) * .55);
			g.addColorStop(0, "rgba(206,210,212,0.05)"); g.addColorStop(.45, "rgba(206,210,212,0.55)"); g.addColorStop(1, "rgba(206,210,212,0.86)");
			ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, viewH);
		}
		if (id === "blackice") { ctx.fillStyle = "rgba(120,160,210,0.10)"; ctx.fillRect(0, 0, viewW, viewH); }
		if (id === "noreaster") { ctx.fillStyle = "rgba(200,206,214,0.32)"; ctx.fillRect(0, 0, viewW, viewH); }
		const n = id === "noreaster" ? 260 : id === "snow" ? 120 : id === "rain" ? 140 : 0;
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
		ctx.restore();
	}
	function v13Running() {
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
			skills: NEW_SKILLS.map((s) => ({ ...s, lv: v3.skills[s.id]?.lv ?? 0 })),
			perks: Object.entries(SKILL_PERKS).map(([k, list]) => ({ skill: k, got: list.slice(0, perkCount(v3.skills[k]?.lv ?? 0)), next: list[perkCount(v3.skills[k]?.lv ?? 0)] ?? "" })),
			rebuilt: { ...w13.rebuilt }, bounties: w13.bounties.map((b) => ({ text: b.text, got: b.got, need: b.need, pay: b.pay })),
			diary: w13.diary.slice(-40), notes: w13.notes,
			main: { act: w13.main.act, title: mainAct().title, goal: mainAct().goal, acts: MAIN_ACTS.map((a) => ({ n: a.n, title: a.title, goal: a.goal, done: a.n < w13.main.act })), ending: w13.main.ending ? { id: w13.main.ending, ...ENDINGS[w13.main.ending] } : null, slide: w13.main.slide },
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
	function openTalk(npc) {
		if (!player) return;
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
			const q10x = q10Talk(npc.role, q10, snow >= 3, !!raid);
			if (q10x?.replace) Object.assign(line, q10x.replace);
			else if (q10x?.add) line.choices = [...line.choices.slice(0, -1), ...q10x.add, ...line.choices.slice(-1)];
			const q11x = q10x?.replace ? null : q11Talk(npc.role, q11, Q11C(), !!raid);
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
		if (guardPost.has(party.homeId)) {
			party.cooldown = Math.max(0, party.cooldown - dt);
			return;
		}
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
			const rx = r * TILE * .78 * zoom, ry = rx * .5;
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
			if (giveItem(foundId)) pushLog(`Luck turns up a ${GEAR[foundId].name.toLowerCase()}.`);
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
			if (giveItem(foundId)) pushLog(`Luck turns up a ${GEAR[foundId].name.toLowerCase()}.`);
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
		const step = cols === 8 ? 11 : 22;
		return Math.floor(player.anim / step) % cols;
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
		const src = images.get(`v2/player-${action}`) || images.get(`v2/justin-${action}`);
		if (!src) return null;
		const n = `pl/${action}`;
		if (images.get(n) !== src) images.set(n, src);
		return n;
	}
	/** v13 armor paper doll: public/game/v2/armor/<piece>-<tier>-<action>.png, stacked feet, legs,
	 * chest, hands, head over the body, same grid as the body sheet. Missing layers are skipped. Player only. */
	const ARMOR_ORDER = [["feet", "feetId"], ["legs", "legsId"], ["chest", "coatId"], ["hands", "handsId"], ["head", "headId"]];
	const TIER_OF = { poor: 1, standard: 2, good: 3, rare: 4 };
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
		const cols = sheetCols(img), rows = 8;
		const sw = img.width / cols, sh = img.height / rows;
		const fcols = sheetCols(bimg);
		let frac = bimg.foot ?? .92;
		if (bimg.feet) { const f = bimg.feet[(dir % 8) * fcols + (frame % fcols)]; if (f) frac = f; }
		const dh = HERO_H * heroScale(body) * zoom;
		const dw = dh * (sw / sh);
		ctx.drawImage(armorSource(n, img), (frame % cols) * sw, (dir % rows) * sh, sw, sh, foot.sx + lean.x * zoom - dw / 2, foot.sy + lean.y * zoom - dh * frac, dw, dh);
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
		let act = "walk";
		let frame = player.frame;
		let lunge = false;
		if (flinch) { act = flinch.name.slice(3); frame = flinch.frame; }
		else if (swingAnim > 0 && !work && gun && plImg("gun-atk")) { act = "gun-atk"; frame = Math.min(3, Math.floor((1 - swingAnim / .48) * 4)); }
		else if (swingAnim > 0 && !work && plImg("axe")) { act = "axe"; frame = Math.min(5, Math.floor((1 - swingAnim / .48) * 6)); }
		else if (swingAnim > 0 && !work) { act = "walk"; lunge = true; }
		else if (work && work.swing > .05 && plImg("axe")) { act = "axe"; frame = Math.min(5, Math.floor((1 - Math.min(1, work.swing / .48)) * 6)); }
		else if (!moving && gun && using && plImg("gun")) { act = "gun"; frame = Math.floor(performance.now() / 320) % 4; }
		else if (!moving && plImg("idle")) { act = "idle"; frame = Math.floor(performance.now() / 300) % 4; }
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
		bracers: [122, 78, 46]
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
		const cover = chest === "coat-std" || chest === "coat-good" || chest === "quilt";
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
		const key = `body:${name}:${player.look}:${hair}`;
		const cached = tinted.get(key);
		if (cached) return cached;
		const stamp = document.createElement("canvas");
		stamp.width = img.width;
		stamp.height = img.height;
		const g = stamp.getContext("2d", { willReadFrequently: true });
		if (!g) return img;
		g.drawImage(img, 0, 0);
		const data = g.getImageData(0, 0, stamp.width, stamp.height);
		dyeBodySheet(data, sheetCols(img), player.look, hair, 8);
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
		if (name.startsWith("pl/")) return images.get(`v2/player-${name.slice(3)}`) === img ? img : dyePlayerBody(img, name);
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
		if (prop.farmBike && !bikeBuilt()) return "The old motor bicycle is missing half its parts. Justin knows what she needs.";
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
		if (images.get("v2/bike-ride")) { blit("v2/bike-ride", x, y, 92, true, Math.floor(performance.now() / 80) % 6, dir % 8, dcx, dcy); return; }
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
	function usePick() {
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
		berries: "apple", mushrooms: "apple", chowder: "smokedfish", venisonsteak: "meat", pie: "apple", coffee: "cider", tonic: "dandelion", trout: "smokedfish",
		snare: "wire", grokclaw: "antlers",
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
		const ox = (px / house.width - .5) * dw;
		const oy = -dh * (house.foot ?? .92) + py / house.height * dh;
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
			if (!usePick()) return;
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
	function useFarm(prop) {
		if (!player) return;
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
			if (!giveItem("apple")) {
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
		for (let i = 0; i < qty; i++) ok = giveItem(item) || ok;
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
		if (!usePick()) return;
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
			"squirrel"
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
			if (!hasLoot(pile) || clock - pile.at >= 720) {
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
		if (enemy.variant === "holeb") {
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
	function markDead(enemy, xp) {
		if (!enemy || enemy.dead) return;
		enemy.dead = true;
		enemy.aggro = false;
		enemy.death = 1.15;
		if (enemy.raid && raid) raid.kills += 1;
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
		if (prop.hp > 0) return;
		prop.kind = broken;
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
			if (!giveItem(stack.id, stack.qty)) return 0;
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
		if (turnBased) {
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
	function strikeEnemy(enemy) {
		if (!player || enemy.dead) return;
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
			}
		}[aim];
		const familyNow = GEAR[player.weaponId]?.family;
		const skNow = isGun(familyNow) ? skillOf("rifle") : skillOf("melee");
		const chance = Math.min(.97, aimRow.hit + perc() * .03 + player.luck * .015 + skNow * .002 + (aim === "head" && hasPerk("deadeye") ? .1 : 0));
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
			if (first) pushLog(enemy.kind === "squirrel" ? "The squirrel bolts." : "The rabbit bolts.");
		} else {
			const wasCalm = !enemy.aggro && enemy.temper === "wary";
			enemy.aggro = true;
			alertPack(enemy);
			if (wasCalm) pushLog(enemy.kind === "moose" ? "The moose lowers its antlers." : enemy.kind === "deer" ? "The deer wheels and charges." : "It turns on you.");
		}
		let dmg = Math.max(1, Math.round(strikeDamage() * aimRow.mult));
		const tiny = enemy.kind === "squirrel" || enemy.kind === "rabbit";
		if (tiny) {
			if (enemy.hp < enemy.maxHp || Math.random() < .72) dmg = enemy.hp;
			else dmg = Math.max(1, enemy.maxHp - 1);
		}
		enemy.hp -= dmg;
		enemy.hurt = .12;
		if (aim === "arm" && !tiny) {
			enemy.crippleArm = 8;
			pushLog("The foreleg gives.");
		} else if (aim === "leg" && !tiny) {
			enemy.crippleLeg = 8;
			pushLog("The leg buckles.");
		} else if (aim === "head") pushLog("You catch the head.");
		sfx("hit");
		if (!reduceMotion) shake = Math.min(8, shake + 3);
		burst(enemy.x, enemy.y, "#c4543a", 7);
		floater(enemy.x, enemy.y - 28, String(dmg));
		if (enemy.hp <= 0) markDead(enemy, enemy.xp);
		sync(true);
	}
	function strikeNpc(npc) {
		if (!player || !world) return;
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
			}
		}[aim];
		const familyNow = GEAR[player.weaponId]?.family;
		const skNow = isGun(familyNow) ? skillOf("rifle") : skillOf("melee");
		const chance = Math.min(.97, aimRow.hit + perc() * .03 + player.luck * .015 + skNow * .002 + (aim === "head" && hasPerk("deadeye") ? .1 : 0));
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
		if (!player || player.invuln > 0 || phase !== "play") return;
		const dmg = Math.max(1, amount - player.def);
		player.hp -= dmg;
		if (!mode11) {
			wearArmor(amount);
			const biter = world?.enemies.find((e) => !e.dead && e.kind !== "bandit" && Math.hypot(e.x - fromX, e.y - fromY) < 40);
			if (biter && Math.random() < .15 * (1 - fx13().sickResist) * (perk13("firstaid", 3) ? .5 : 1)) catchAil("cut", `The ${biter.kind} got its teeth in you.`);
			if (dmg >= player.maxHp * .3 && Math.random() < .2) catchAil("bone", "That hit cracked something.");
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
		if (player.hp <= 0 && raid) {
			player.hp = Math.max(1, Math.ceil(player.maxHp * .5));
			player.invuln = 2;
			sfx("die");
			endRaid(false, "You go down by the porch. Justin drags you inside and they bar the door. The raiders take what they can carry and go.");
			sync(true);
			return;
		}
		if (player.hp <= 0) {
			player.hp = 0;
			phase = "dead";
			intent = null;
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
		if (Math.hypot(screen.dsx, screen.dsy) < 8) return path.slice(1);
		moveBody(body, screen.dsx, screen.dsy, speed, dt);
		const vel = screenDirToWorld(screen.dsx, screen.dsy);
		body.dir = eight ? facing8(vel.vx, vel.vy) : facingFromWorld(vel.vx, vel.vy);
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
		camY = (player.x + player.y) / 2 - viewH / 2;
		snapParty();
		landReturn();
		saveGame();
		sync(true);
		return true;
	}
	function step(dt) {
		tickLog(dt);
		q11ModeTick(dt);
		v3Tick(dt);
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
		if (edges.build) {
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
			const node = nearestResource(72);
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
		const fromX = player.x;
		const fromY = player.y;
		tickWork(dt);
		if (intent && player) {
			if (intent.kind === "walk") {
				intent.path = follow(player, intent.path, pace, dt, true);
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
							intent.path = follow(player, intent.path, pace, dt, true);
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
							intent.path = follow(player, intent.path, pace, dt, true);
							if (!intent.path.length) {
								const screen = worldVelToScreen(target.x - player.x, target.y - player.y);
								moveBody(player, screen.dsx, screen.dsy, pace, dt);
							}
						}
					}
				}
			} else if (intent.kind === "enter") {
				const enterId = intent.id;
				const prop = world.props.find((p) => p.id === enterId);
				if (!prop || !canWalkIn(prop)) intent = null;
				else if (Math.hypot(doorPoint(prop).x - player.x, doorPoint(prop).y - player.y) <= 78) beginOpen(prop);
				else intent.path = follow(player, intent.path, pace, dt, true);
			} else if (intent.kind === "talk") {
				const talkId = intent.id;
				const npc = world.npcs.find((n) => n.id === talkId);
				if (!npc) intent = null;
				else if (Math.hypot(npc.x - player.x, npc.y - player.y) <= 66) openTalk(npc);
				else intent.path = follow(player, intent.path, pace, dt, true);
			} else if (intent.kind === "gather") {
				const gatherId = intent.id;
				const prop = world.props.find((p) => p.id === gatherId);
				if (!prop || !prop.resource) intent = null;
				else if (Math.hypot(propCenter(prop).x - player.x, propCenter(prop).y - player.y) <= 60) gather(prop);
				else intent.path = follow(player, intent.path, pace, dt, true);
			} else if (intent.kind === "chop" || intent.kind === "mine") {
				const laborProp = world.props.find((p) => p.id === intent.id);
				if (!laborProp) intent = null;
				else if (!work || work.id !== laborProp.id) {
					const spot = propCenter(laborProp);
					if (Math.hypot(spot.x - player.x, spot.y - player.y) <= 70) startLabor(laborProp, intent.kind);
					else intent.path = follow(player, intent.path, pace, dt, true);
				} else stepLabor(dt, pace);
			} else if (intent.kind === "loot") {
				const lootPid = intent.id;
				const lootTarget = piles.find((p) => p.id === lootPid);
				if (!lootTarget || !hasLoot(lootTarget)) intent = null;
				else if (Math.hypot(lootTarget.x - player.x, lootTarget.y - player.y) <= 64) openLoot(lootTarget);
				else intent.path = follow(player, intent.path, pace, dt, true);
			} else if (intent.kind === "mount") {
				const rideId = intent.id;
				const bike = world.props.find((p) => p.id === rideId && p.kind === "bike");
				if (!bike) intent = null;
				else {
					const spot = propCenter(bike);
					if (Math.hypot(spot.x - player.x, spot.y - player.y) <= 72) mountBike(bike);
					else intent.path = follow(player, intent.path, pace, dt, true);
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
		if (stepDist > .45 && !swinging) {
			player.dir = facing8(player.x - fromX, player.y - fromY);
			// leg cycle follows on-screen distance (one 4-frame cycle per ~72 px), so feet don't skate
			// on sideways walks (screen moves 1.41 px per world unit there, 0.71 up/down)
			const mdx = player.x - fromX, mdy = player.y - fromY;
			player.anim += Math.hypot(mdx - mdy, (mdx + mdy) / 2) * 1.22;
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
				hp: player.hp
			});
		}
		if (tryCross()) {
			prevHeld = currentHeld();
			clearEdges();
			return;
		}
		if (!turnBased) for (const npc of world.npcs) {
			if (!guardPost.has(npc.id)) stepFolk(npc, dt);
		}
		if (!turnBased) stepParty(dt);
		if (!turnBased) stepRaid(dt);
		stepEncounters();
		q10Step(dt);
		q11Step(dt);
		snowAcc += dt;
		if (snowAcc > .14 && particles.length < 48) {
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
		if (!turnBased) for (const enemy of world.enemies) {
			if (enemy.death > 0) enemy.death = Math.max(0, enemy.death - dt);
			if (enemy.dead) continue;
			enemy.cooldown = Math.max(0, enemy.cooldown - dt);
			enemy.hurt = Math.max(0, enemy.hurt - dt);
			enemy.crippleArm = Math.max(0, enemy.crippleArm - dt);
			enemy.crippleLeg = Math.max(0, enemy.crippleLeg - dt);
			enemy.slow = Math.max(0, (enemy.slow || 0) - dt);
			enemy.pathT -= dt;
			const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
			const homeDist = Math.hypot(enemy.x - enemy.homeX, enemy.y - enemy.homeY);
			if (enemy.temper === "timid") {
				if (dist > 340) enemy.aggro = false;
				const spook = enemy.aggro || dist < noticeRange(78) * (1 - .06 * lv("hunting")) || v3Spook(enemy, dist);
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
						enemy.path = follow(enemy, enemy.path, enemy.kind === "squirrel" ? 230 : 200, dt, true);
						enemyMoving = true;
					}
				} else if (homeDist > 80) {
					if (enemy.pathT <= 0 || !enemy.path) {
						enemy.path = pathTo(world, enemy.x, enemy.y, enemy.homeX, enemy.homeY);
						enemy.pathT = .6;
					}
					if (enemy.path) {
						enemy.path = follow(enemy, enemy.path, 90, dt, true);
						enemyMoving = true;
					}
				} else if (enemy.pathT <= 0) {
					const ang = Math.random() * Math.PI * 2;
					const roam = 20 + Math.random() * 48;
					enemy.path = pathTo(world, enemy.x, enemy.y, enemy.homeX + Math.cos(ang) * roam, enemy.homeY + Math.sin(ang) * roam);
					enemy.pathT = 1.4 + Math.random() * 2;
					if (enemy.path?.length) {
						enemy.path = follow(enemy, enemy.path, 80, dt, true);
						enemyMoving = true;
					}
				}
				if (enemyMoving) enemy.anim += dt * 12;
				enemy.frame = enemyMoving ? Math.floor(enemy.anim) % 4 : 0;
				continue;
			}
			if (enemy.aggro && homeDist > 520 && !isRaider(enemy)) enemy.aggro = false;
			const sight = enemy.kind === "coyote" ? 150 : enemy.kind === "wolf" ? 210 : 190;
			if (enemy.temper === "hostile" && !enemy.aggro && dist < noticeRange(sight)) {
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
				if (enemy.raid && raid) {
					const fh = raidHouse();
					if (fh && dist > 300) {
						const d = Math.hypot(fh.x - enemy.x, fh.y - enemy.y);
						goalX = fh.x;
						goalY = fh.y;
						if (d < 96) {
							raid.house -= enemy.atk * .55 * dt;
							enemy.dir = facing8(fh.x - enemy.x, fh.y - enemy.y);
							enemy.anim += dt * 6;
							enemy.frame = Math.floor(enemy.anim) % 4;
							if (Math.random() < dt * 1.5) burst(fh.x + (Math.random() - .5) * 60, fh.y - 20, "#c9a26a", 3);
							raidHudTick();
							continue;
						}
					}
				}
				if (enemy.variant === "torch" && dist > 110) {
					let best = null;
					let bestD = 340;
					for (const p of world.props) {
						if (p.kind !== "farmhouse" && p.kind !== "barn" && p.kind !== "shack" && !DEFENSE[p.kind] && !BROKEN[p.kind]) continue;
						if (String(p.kind).endsWith("-x")) continue;
						const c = propCenter(p);
						const d = Math.hypot(c.x - enemy.x, c.y - enemy.y);
						if (d < bestD) {
							bestD = d;
							best = p;
						}
					}
					if (best) {
						const c = propCenter(best);
						goalX = c.x;
						goalY = c.y;
						if (bestD < 56) {
							best.burn = (best.burn || 0) + dt;
							if (best.burn > 4 && !best.burnNoted) {
								best.burnNoted = true;
								pushLog("A torch catches the timber.");
							}
							if (best.burn > 7 && BROKEN[best.kind]) hurtProp(best, 18);
						}
					}
				}
				if (isRaider(enemy) && enemy.variant !== "jumper" && enemy.cooldown <= 0) {
					for (const p of world.props) {
						if (!BROKEN[p.kind] || String(p.kind).endsWith("-x")) continue;
						const c = propCenter(p);
						if (Math.hypot(c.x - enemy.x, c.y - enemy.y) > 54) continue;
						const ram = enemy.variant === "armor" || enemy.variant === "brute" || enemy.variant === "atv" ? 9 : 4;
						hurtProp(p, ram);
						enemy.cooldown = .75;
						enemy.dir = facing8(c.x - enemy.x, c.y - enemy.y);
						break;
					}
				}
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
		separateEnemies();
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
		stepCrows(dt);
		vision();
		for (const part of particles) {
			part.life -= dt;
			part.x += part.vx * dt;
			part.y += part.vy * dt;
			if (part.spinV) part.spin += part.spinV * dt;
		}
		for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
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
		clearEdges();
	}
	function currentHeld() {
		const s = new Set(keys);
		for (const c of injected) s.add(c);
		return s;
	}
	function edgeKey(code) {
		return held(code) && !prevHeld.has(code);
	}
	function separateEnemies() {
		if (!world) return;
		const list = world.enemies.filter((e) => !e.dead);
		for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
			const a = list[i];
			const b = list[j];
			const dx = b.x - a.x;
			const dy = b.y - a.y;
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
			const d = Math.hypot(n.x - player.x, n.y - player.y);
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
	function burst(x, y, color, n, big) {
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
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		viewW = Math.max(1, rect.width);
		viewH = Math.max(1, rect.height);
		canvas.width = Math.max(1, Math.floor(viewW * dpr));
		canvas.height = Math.max(1, Math.floor(viewH * dpr));
		mini.width = 132;
		mini.height = 132;
	}
	/** v12: gw14 people sheets by role (Cal's art is the "jack" set). */
	const V2_WHO = { holt: "holt", cal: "jack", mira: "mira", nora: "nora", sarah: "sarah", cyndal: "cyndal", loki: "loki", marcel: "marcel", justin: "justin" };
	function v2Who(npc) {
		const k = V2_WHO[npc.role];
		return k && images.get(`v2/${k}-walk`) ? k : "";
	}
	function folkSheet(npc) {
		const k = v2Who(npc);
		if (k) return `v2/${k}-walk`;
		return npc.role === "villager" ? "villager" : npc.role === "warden" ? "boss-warden" : `npc-${npc.role}`;
	}
	function paintPerson(body, camX, camY) {
		const id = body.id ?? body.homeId;
		// kids never stand a gun post: no guard pose for Cyndal or Loki, ever
		const kid = body.role === "cyndal" || body.role === "loki";
		const guarding = !kid && id != null && guardPost.has(id);
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
		const dir = (body.dir || 0) % 8;
		const seed = (body.id ?? body.homeId ?? 0) * 137;
		let act = "walk";
		let frame = 0;
		if (body.hp != null && body.hp <= 0 && has("down")) { act = "down"; frame = 3; }
		else if (body._hitT && now - body._hitT < 360 && has("hit")) { act = "hit"; frame = Math.min(2, Math.floor((now - body._hitT) / 120)); }
		else if (guarding && !kid && has("gun")) {
			const firing = (body.cooldown || 0) > .2;
			if (firing && has("gun-atk")) { act = "gun-atk"; frame = Math.min(3, Math.floor((1 - Math.min(1, body.cooldown)) * 4)); }
			else { act = "gun"; frame = Math.floor((now + seed) / 420) % 4; }
		}
		else if (kid && dangerNear(body) && has("crouch")) { act = "crouch"; frame = Math.floor((now + seed) / 420) % 4; }
		else if (body.still === false) {
			const far = player && body.ox != null && Math.hypot(player.x + body.ox - body.x, player.y + body.oy - body.y) > 160;
			act = far && has("run") ? "run" : kid && body.ox != null && has("carry") ? "carry" : "walk";
			frame = ((body.frame || 0) % 4) * 2 + (Math.floor((now + seed) / 110) & 1);
		}
		else if (k === "marcel" && talkNpc === body && dialogue && has("talk")) { act = "talk"; frame = Math.floor(now / 260) % 4; }
		else if (has("idle")) { act = "idle"; frame = Math.floor((now + seed) / 340) % 4; }
		blit(`v2/${k}-${act}`, body.x, body.y, folkHeight(body), true, frame, dir, camX, camY);
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
		return enemy.id % 3 === 1 ? "raider-gray" : enemy.id % 3 === 2 ? "raider-blue" : "raider";
	}
	/** v29 real-world sizing: every body is drawn so its *visible* figure (alpha bbox, SPRITE_FIT)
	 * stands at a real height in inches, on the hero's scale (6'2" = HERO_H x hero fit). Hit tests,
	 * health bars and click targets all read these same functions, so they stay in sync. */
	const PX_PER_IN = HERO_H * (SPRITE_FIT.hero ?? .806) / 74;
	function realH(sheet, inches) {
		return Math.round(inches * PX_PER_IN / (SPRITE_FIT[sheet] ?? .79));
	}
	/** Full visible height (top of head/antlers to hooves) in inches. */
	const BEAST_IN = {
		holeb: 120, grok: 98, warden: 74, collector: 77, pelletier: 67, fur: 76, saw: 74, armor: 75, mask: 72,
		brute: 77, shield: 72, atv: 70, jumper: 69, scout: 68,
		bear: 40, moose: 96, deer: 62, wolf: 37, coyote: 29, rabbit: 10, squirrel: 8, crow: 10
	};
	function beastH(enemy) {
		const key = enemy.variant && BEAST_IN[enemy.variant] ? enemy.variant : enemy.kind;
		const inches = BEAST_IN[key] ?? 70;
		return realH(beastSheet(enemy), inches);
	}
	const FOLK_IN = {
		justin: 74, sarah: 67, cyndal: 61.5, loki: 61, villager: 69,
		rejean: 72, cal: 71, pete: 73, warden: 74, bram: 72, emile: 70, gus: 69, holt: 73, ivo: 70, paul: 71, walter: 69,
		marcel: 70, adele: 66, sera: 66, mira: 65, nora: 66, ruth: 65, mae: 64, etta: 66
	};
	function folkHeight(npc) {
		return realH(folkSheet(npc), FOLK_IN[npc.role] ?? 69);
	}
	function tractorShift(charge) {
		const t = Math.min(1, Math.max(0, charge || 0));
		const along = t * 460;
		return { x: along, y: -along * .2 };
	}
	/** A raider spawn point on open ground with a walkable path to the hero (v18 spawned raiders inside
	 * trees, buildings and off-map tiles, where they stood still all night). */
	function raidSpawn(minR, maxR) {
		if (!world || !player) return null;
		for (let tries = 0; tries < 16; tries++) {
			const ang = Math.random() * Math.PI * 2;
			const rad = minR + Math.random() * (maxR - minR);
			const x = player.x + Math.cos(ang) * rad;
			const y = player.y + Math.sin(ang) * rad;
			const t = tileOf(x, y);
			if (cellBlocked(world, t.tx, t.ty)) continue;
			if (!pathTo(world, x, y, player.x, player.y)) continue;
			return { x: (t.tx + .5) * 64, y: (t.ty + .5) * 64 };
		}
		return null;
	}
	function raidHouse() {
		if (!world || mapId !== 0) return null;
		const fh = world.props.find((p) => p.kind === "farmhouse");
		if (!fh) return null;
		const c = propCenter(fh);
		return { x: c.x, y: c.y + 40 };
	}
	function raidWaves(n) {
		return Math.min(6, 3 + Math.floor((n - 1) / 3) + moon13().waves);
	}
	function raidCanStart() {
		if (!player || !world || raid || inside || snow < 3 || mapId !== 0) return false;
		return nightShade(clock) > .22;
	}
	let raidHudPct = 100;
	function raidHudTick() {
		if (!raid) return;
		const pct = Math.round(raid.house / raid.houseMax * 20);
		if (pct !== raidHudPct) {
			raidHudPct = pct;
			sync(true);
		}
	}
	const COMPASS = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"];
	function startRaid() {
		if (!raidCanStart() || !world || !player) return;
		raidNight += 1;
		const n = raidNight;
		// clear any stragglers so the waves start clean
		for (const e of world.enemies) if (!e.dead && isRaider(e) && !e.quest) { e.dead = true; e.death = 0; }
		raid = { night: n, wave: 0, waves: raidWaves(n), phase: "lull", t: 7, left: 0, spawnT: 0, ang: Math.random() * Math.PI * 2, house: 90 + 15 * n, houseMax: 90 + 15 * n, warned: false, kills: 0 };
		if (q11.farm.wall) { raid.house += 15 * q11.farm.wall; raid.houseMax += 15 * q11.farm.wall; }
		if (v3.up.palisade) { raid.house += 40 * v3.up.palisade; raid.houseMax += 40 * v3.up.palisade; }
		if (v3.up.lookout) { raid.t += 6 * v3.up.lookout; pushLog("From the lookout tower you see their lanterns early, way down the road."); }
		raidHudPct = 20;
		pushLog(`Raid night ${n}. Justin and Sarah take the posts. Hold the farm.`);
		if (world.npcs.some((m) => m.role === "loki")) pushLog("Loki bars the farmhouse door behind him.");
		sfx("click");
		saveGame();
		sync(true);
	}
	function raidPool(n, wave) {
		const level = n + wave - 1;
		const pool = ["scout", "scout"];
		if (level >= 2) pool.push("jumper");
		if (level >= 3) pool.push("torch");
		if (level >= 4) pool.push("shield");
		if (level >= 5) pool.push("brute");
		if (level >= 7) pool.push("armor");
		if (level >= 8) pool.push("atv");
		return pool;
	}
	function raidSpawnAt(cx, cy, ang, minR, maxR) {
		if (!world) return null;
		for (let tries = 0; tries < 24; tries++) {
			const a = ang + (Math.random() - .5) * 1.4;
			const rad = minR + Math.random() * (maxR - minR);
			const x = cx + Math.cos(a) * rad;
			const y = cy + Math.sin(a) * rad;
			const t = tileOf(x, y);
			if (t.tx < 1 || t.ty < 1 || t.tx > 154 || t.ty > 154) continue;
			if (cellBlocked(world, t.tx, t.ty)) continue;
			if (!pathTo(world, x, y, cx, cy)) continue;
			return { x: (t.tx + .5) * 64, y: (t.ty + .5) * 64 };
		}
		return null;
	}
	function spawnRaider(variant, spot, boss = null) {
		const stats = variant === "armor" || variant === "brute" ? [46, 8, 16] : variant === "shield" ? [36, 6, 12] : variant === "atv" ? [28, 7, 14] : variant === "torch" ? [22, 5, 10] : variant === "jumper" ? [16, 4, 9] : [14, 4, 8];
		const label = { scout: "Scout", jumper: "Climber", armor: "Plate", shield: "Shield", brute: "Brute", torch: "Torch", atv: "Rider" };
		const hp = boss ? boss.hp : stats[0];
		world.enemies.push({
			id: world.nextEnemyId++, x: spot.x, y: spot.y, homeX: spot.x, homeY: spot.y,
			hp, maxHp: hp, atk: boss ? boss.atk : stats[1], xp: boss ? boss.xp : stats[2],
			elite: !!boss || variant === "armor" || variant === "brute", quest: false, kind: "bandit", pack: 90, temper: "hostile",
			crippleArm: 0, crippleLeg: 0, dir: 0, frame: 0, anim: 0, cooldown: 0, path: null, pathT: 0, aggro: true, dead: false, hurt: 0,
			variant, name: boss ? boss.name : label[variant] || "Raider", slow: 0, death: 0, raid: true
		});
	}
	function stepRaidNight(dt, raiders) {
		if (!raid || !player || !world) return;
		const fh = raidHouse();
		if (!fh) { endRaid(false, "The raid breaks off."); return; }
		if (nightShade(clock) < .12) {
			endRaid(!inside, inside ? "Dawn. You sat it out behind the door. The raiders drift off with what they could carry." : "Dawn comes up grey over the orchard. They pull back to the road.");
			return;
		}
		if (raid.house <= 0) {
			endRaid(false, "The farmhouse door splinters. Justin fires the last shells and they scatter with the woodpile and a sack of apples.");
			return;
		}
		if (inside) return;
		const live = raiders.filter((e) => e.raid).length;
		if (raid.phase === "lull") {
			raid.t -= dt;
			if (raid.t < 4 && !raid.warned) {
				raid.warned = true;
				const dir = COMPASS[((Math.round(raid.ang / (Math.PI / 4)) % 8) + 8) % 8];
				if (world.npcs.some((m) => m.role === "cyndal")) pushLog(`Cyndal, from the loft: "Dad! Lanterns to the ${dir}! Here they come!"`);
				else pushLog(`Lanterns to the ${dir}.`);
				sfx("click");
			}
			if (raid.t <= 0) {
				raid.wave += 1;
				raid.phase = "wave";
				raid.left = 2 + raid.wave + Math.floor(raid.night / 2);
				raid.spawnT = 0;
				pushLog(`Wave ${raid.wave} of ${raid.waves}.`);
				sync(true);
			}
			return;
		}
		if (raid.left > 0) {
			raid.spawnT -= dt;
			if (raid.spawnT <= 0) {
				raid.spawnT = 1.1;
				const last = raid.wave === raid.waves && raid.left === 1;
				const boss = last && (raid.night % 5 === 0) ? (raid.night >= 15 ? { variant: "saw", name: "Gil Michaud", hp: 90, atk: 12, xp: 40 } : raid.night >= 10 ? { variant: "mask", name: "René Gallant", hp: 74, atk: 10, xp: 32 } : { variant: "fur", name: "Harland Poulin", hp: 64, atk: 9, xp: 28 }) : null;
				const pool = raidPool(raid.night, raid.wave);
				const variant = boss ? boss.variant : pool[Math.floor(Math.random() * pool.length)];
				const spot = raidSpawnAt(fh.x, fh.y, raid.ang, 13 * 64, 17 * 64) || raidSpawnAt(fh.x, fh.y, raid.ang + Math.PI, 11 * 64, 15 * 64);
				if (spot) {
					spawnRaider(variant, spot, boss);
					raid.left -= 1;
					if (boss) pushLog(`${boss.name} walks in behind them.`);
				}
			}
			return;
		}
		if (live === 0) {
			if (raid.wave >= raid.waves) {
				endRaid(true, "The last of them breaks for the road.");
				return;
			}
			raid.phase = "lull";
			raid.t = 14;
			raid.warned = false;
			raid.ang = Math.random() * Math.PI * 2;
			if (world.npcs.some((m) => m.role === "loki")) {
				giveItem("shells", 3);
				pushLog("Loki slips a box of shells and a fresh lantern out the door to the porch. +3 shells.");
			}
			pushLog(`Wave ${raid.wave} is down. ${raid.waves - raid.wave} to go.`);
			sync(true);
		}
	}
	function endRaid(won, why) {
		if (!raid || !player || !world) return;
		if (mode11 === "endless") {
			if (won) {
				raid.waves += 1; raid.phase = "lull"; raid.t = 8; raid.warned = false; raid.ang = Math.random() * Math.PI * 2;
				giveItem("shells", 4);
				pushLog(`Wave ${raid.wave} is down. More lanterns on the road. +4 shells.`);
				sync(true);
				return;
			}
			m11.waves = Math.max(0, raid.wave - 1); m11.kills = raid.kills; m11.score = raid.kills * 10 + m11.waves * 50;
			for (const e of world.enemies) if (!e.dead && e.raid) { e.dead = true; e.death = 0; }
			guardPost.clear(); raid = null; raidMode = false;
			q11EndMode(false, why);
			return;
		}
		const n = raid.night;
		const summary = { won, night: n, kills: raid.kills, waves: raid.waves, wavesDone: won ? raid.waves : Math.max(0, raid.wave - 1), text: why };
		for (const e of world.enemies) if (!e.dead && e.raid) { e.dead = true; e.death = 0; }
		if (raidMode) {
			guardPost.clear();
			raid = null;
			raidMode = false;
			useRaidMode.setState({ result: summary });
			sfx(won ? "level" : "die");
			phase = "menu";
			dialogue = null;
			buildOpen = false;
			sync(true);
			return;
		}
		const wasSiege = !!raid.siege;
		guardPost.clear();
		raid = null;
		pushLog(why);
		v13RaidEnd(won, wasSiege);
		if (won) {
			raidsHeld += 1;
			achieve("raid1");
			if (raidsHeld >= 5) achieve("raid5");
			const scrap = 6 + 4 * n;
			player.scrap += scrap;
			grantXp(20 + 10 * n);
			pushLog(`You held the farm. Night ${n} is done: +${scrap} iron, +${20 + 10 * n} XP.`);
			sfx("level");
		} else pushLog(`The farm still stands. You keep what you took off them. Try again tomorrow night.`);
		q10AfterRaid();
		// morning comes
		const span = DAY_LENGTH_SEC;
		const into = ((clock % span) + span) % span;
		clock = Math.floor(clock / span) * span + (into > span * 7 / 24 ? span : 0) + span * 7 / 24;
		saveGame();
		sync(true);
	}
	function stepRaid(dt) {
		if (!world || !player || inside) {
			guardPost.clear();
			return;
		}
		for (const prop of world.props) {
			if (prop.flash > 0) prop.flash = Math.max(0, prop.flash - dt);
		}
		const here = tileOf(player.x, player.y);
		const nearPost = world.props.some((p) => (DEFENSE[p.kind] || LURE.has(p.kind) || p.kind === "tractor" || p.kind === "farmhouse") && Math.hypot(propCenter(p).x - player.x, propCenter(p).y - player.y) < 720);
		const dark = nightShade(clock) > .22;
		const onFarm = inFarm(here.tx, here.ty) || nearPost;
		// the hand-crank radio: Jack calls at dusk before a raid night
		const shade = nightShade(clock);
		if (shade > .1 && !dark && !radioWarned && carrying("radio") && jackTrust > 0) {
			radioWarned = true;
			const n = raidNight + 1;
			const boss = n === 5 ? " Poulin's with them." : n === 10 ? " Gallant's walking with them." : n === 15 ? " I can hear a saw." : "";
			pushLog(`Jack on the radio: "Dusk. ${3 + Math.min(4, n)} or so coming up Cambridge Road tonight.${boss} Get to the farm."`);
			sfx("click");
		}
		if (shade < .05) radioWarned = false;
		if (dark && onFarm && !nightLatch && !raid) {
			nightLatch = true;
			if (snow >= 3 && mapId === 0) pushLog("Night on Cambridge Road. Talk to Justin when you're ready to hold the farm.");
		}
		if (!dark) {
			nightLatch = false;
			bossThisNight = false;
		}
		const night = (dark && onFarm && !!raid) || (!!raid && !inside);
		const raiders = world.enemies.filter((e) => !e.dead && isRaider(e));
		// (v29 fix) this ran before `raiders` existed: a TDZ crash that froze the game on raid night
		if (raid) stepRaidNight(dt, raiders);
		if (!world || !player) return;
		if (night && tractorReady) {
			const tractor = world.props.find((p) => p.kind === "tractor");
			if (tractor) {
				tractor.charge = Math.min(1, (tractor.charge || 0) + dt * .22);
				const shift = tractorShift(tractor.charge);
				const c = propCenter(tractor);
				for (const e of raiders) {
					if (Math.hypot(e.x - (c.x + shift.x), e.y - (c.y + shift.y)) < 64) {
						e.hp -= 16 * dt;
						e.hurt = .1;
						e.slow = .3;
						if (e.hp <= 0) markDead(e, e.xp);
					}
				}
				if (tractor.charge >= 1) {
					tractor.charge = 0;
					tractorReady = false;
					pushLog("The tractor coughs and stops. It wants another can.");
				} else if (particles.length < 120) {
					// a soft cloud of snow and dirt rolling off the rear wheels (grows and thins as it drifts)
					const snowy = Math.random() < .65;
					particles.push({
						x: c.x + shift.x - 30 + Math.random() * 10,
						y: c.y + shift.y + 10 + Math.random() * 10,
						vx: -40 - Math.random() * 30,
						vy: 6 + Math.random() * 10,
						life: .8 + Math.random() * .5,
						max: 1.3,
						color: snowy ? "238,242,246" : "196,176,142",
						size: 10 + Math.random() * 8,
						puff: true
					});
				}
			}
		}
		if (!night) {
			guardPost.clear();
			return;
		}
		raidClock -= dt;
		const cap = raid ? 0 : 3 + Math.min(4, raidNight);
		if (false) {
			bossThisNight = true;
			const boss = raidNight === 15 ? { variant: "saw", name: "Gil Michaud", hp: 90, atk: 12, xp: 40 } : raidNight === 10 ? { variant: "mask", name: "René Gallant", hp: 74, atk: 10, xp: 32 } : { variant: "fur", name: "Harland Poulin", hp: 64, atk: 9, xp: 28 };
			const spot = raidSpawn(12 * 64, 15 * 64);
			if (!spot) bossThisNight = false;
			else world.enemies.push({
				id: world.nextEnemyId++,
				x: spot.x, y: spot.y, homeX: spot.x, homeY: spot.y,
				hp: boss.hp, maxHp: boss.hp, atk: boss.atk, xp: boss.xp,
				elite: true, quest: false, kind: "bandit", pack: 90, temper: "hostile",
				crippleArm: 0, crippleLeg: 0, dir: 0, frame: 0, anim: 0, cooldown: 0,
				path: null, pathT: 0, aggro: true, dead: false, hurt: 0,
				variant: boss.variant, name: boss.name, slow: 0, death: 0
			});
		}
		if (!raid && raidClock <= 0 && raiders.length < cap) {
			raidClock = 14 + Math.random() * 8;
			const pool = ["scout"];
			if (raidNight >= 2) pool.push("jumper", "scout");
			if (raidNight >= 3) pool.push("torch");
			if (raidNight >= 4) pool.push("shield", "brute");
			if (raidNight >= 6) pool.push("armor");
			if (raidNight >= 7) pool.push("atv");
			const variant = pool[Math.floor(Math.random() * pool.length)];
			const spot = raidSpawn(7 * 64, 11 * 64);
			if (spot) {
			const { x, y } = spot;
			const stats = variant === "armor" || variant === "brute" ? [46, 8, 16] : variant === "shield" ? [36, 6, 12] : variant === "atv" ? [28, 7, 14] : variant === "torch" ? [22, 5, 10] : variant === "jumper" ? [16, 4, 9] : [14, 4, 8];
			const label = { scout: "Scout", jumper: "Climber", armor: "Plate", shield: "Shield", brute: "Brute", torch: "Torch", atv: "Rider" };
			world.enemies.push({
				id: world.nextEnemyId++,
				x, y, homeX: x, homeY: y,
				hp: stats[0], maxHp: stats[0], atk: stats[1], xp: stats[2],
				elite: variant === "armor" || variant === "brute",
				quest: false,
				kind: "bandit",
				pack: 90,
				temper: "hostile",
				crippleArm: 0,
				crippleLeg: 0,
				dir: 0,
				frame: 0,
				anim: 0,
				cooldown: 0,
				path: null,
				pathT: 0,
				aggro: true,
				dead: false,
				hurt: 0,
				variant,
				name: label[variant] || "Raider",
				slow: 0,
				death: 0
			});
			if (raiders.length === 0) { pushLog("Lanterns at the orchard edge. They are coming in."); if (world.npcs.some((n) => n.role === "cyndal")) pushLog("Cyndal, from the loft: \"Lanterns coming, Dad! Here they come!\""); if (world.npcs.some((n) => n.role === "loki")) pushLog("Loki stays in the farmhouse with the door barred, running shells and lanterns to the porch."); }
			}
		}
		for (const prop of world.props) {
			const spec = DEFENSE[prop.kind];
			if (!spec) continue;
			prop.cool = Math.max(0, (prop.cool || 0) - dt);
			const c = propCenter(prop);
			let best = null;
			let bestD = spec.range;
			for (const e of world.enemies) {
				if (e.dead || !isRaider(e)) continue;
				const d = Math.hypot(e.x - c.x, e.y - c.y);
				if (d < bestD) {
					best = e;
					bestD = d;
				}
			}
			if (!best || prop.cool > 0) continue;
			prop.cool = spec.every;
			prop.flash = .1;
			if (spec.dmg <= 0 && !spec.slow) continue;
			if (spec.slow) best.slow = .45;
			best.hp -= spec.dmg;
			best.aggro = true;
			best.hurt = .08;
			burst(c.x, c.y - 36, spec.slow ? "#e07030" : "#f3e7b0", spec.slow ? 7 : 4);
			burst(best.x, best.y - 10, "#f4e2a0", 3);
			if (!spec.slow) sfx("hit");
			if (best.hp <= 0) markDead(best, best.xp);
		}
		const posts = world.props.filter((p) => DEFENSE[p.kind]);
		const crew = [];
		if (party) crew.push(party);
		for (const n of world.npcs) {
			if (GUARD_ROLES.has(n.role) && Math.hypot(n.x - player.x, n.y - player.y) < 4200) crew.push(n);
		}
		guardPost.clear();
		const spots = posts.map((p) => ({ id: p.id, c: propCenter(p), real: true }));
		const fh = raid ? raidHouse() : null;
		if (fh) {
			const ring = [[-150, 120], [150, 120], [-190, -40], [190, -40], [0, 190]];
			for (let k = 0; spots.length < crew.length && k < ring.length; k++) spots.push({ id: -100 - k, c: { x: fh.x + ring[k][0], y: fh.y + ring[k][1] }, real: false });
		}
		for (let i = 0; i < spots.length && i < crew.length; i++) {
			const who = crew[i];
			const spot = spots[i];
			const id = who.id ?? who.homeId;
			guardPost.set(id, spot.id);
			const c = spot.c;
			const dx = c.x - who.x;
			const dy = c.y - who.y;
			const dist = Math.hypot(dx, dy);
			if (dist > 28) {
				const screen = worldVelToScreen(dx, dy);
				moveBody(who, screen.dsx, screen.dsy, 78, dt);
				const vel = screenDirToWorld(screen.dsx, screen.dsy);
				who.dir = facing8(vel.vx, vel.vy);
				who.anim = (who.anim || 0) + dt * 8;
				who.frame = Math.floor(who.anim) % 4;
			} else if (raid) {
				// raid guards pick the nearest raider in rifle range and fire on a steady beat
				let foe = null;
				let foeD = 400;
				for (const e of raiders) {
					const d = Math.hypot(e.x - who.x, e.y - who.y);
					if (d < foeD) { foe = e; foeD = d; }
				}
				who.shootT = Math.max(0, (who.shootT || 0) - dt);
				who.flashT = Math.max(0, (who.flashT || 0) - dt);
				if (foe) {
					who.dir = facing8(foe.x - who.x, foe.y - who.y);
					if (who.shootT <= 0) {
						who.shootT = 1.25;
						who.flashT = .18;
						foe.hp -= who.role === "justin" ? 5 : 4;
						foe.hurt = .08;
						burst(foe.x, foe.y - 10, "#f4e2a0", 3);
						sfx("shoot");
						v3Noise(player.x, player.y, 14 * TILE);
						if (foe.hp <= 0) markDead(foe, Math.max(1, Math.round(foe.xp * .5)));
					}
				}
				who.cooldown = who.flashT > 0 ? .4 : 0;
				who.anim = (who.anim || 0) + dt;
			} else {
				const foe = raiders[0];
				if (foe) who.dir = facing8(foe.x - who.x, foe.y - who.y);
				who.cooldown = ((who.anim || 0) % .8) < .12 ? .4 : 0;
				who.anim = (who.anim || 0) + dt;
			}
		}
	}
	function stepFolk(npc, dt) {
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
			npc.anim += stepped;
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
		const pt = (q) => [left + q[0] / house.width * dw, top + q[1] / house.height * dh];
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
		const dh = d.farm ? 84 : 108;
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
			paintProp("stove", o.x + 62, o.y + 188, 112);
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
		paintProp("logs", o.x + 78, o.y + 150, 90);
		ctx.fillStyle = "#efe6d4";
		ctx.font = "700 16px Source Sans 3, sans-serif";
		ctx.fillText(lootedChests.has(92001) ? "Wood taken" : "Split wood", o.x + 36, o.y + 168);
		paintProp("bench", o.x + 236, o.y + 156, 108);
		ctx.fillStyle = "#efe6d4";
		ctx.fillText("Bench", o.x + 210, o.y + 168);
		paintProp("icon-bomb", o.x + 196, o.y + 78, 32);
		paintProp("icon-fuel", o.x + 236, o.y + 78, 32);
		paintProp("icon-fence", o.x + 276, o.y + 78, 32);
		ctx.fillText("Between raids", o.x + 188, o.y + 96);
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
		const row = player.dir % rows;
		ctx.drawImage(src, col * sw, row * sh, sw, sh, o.x + inside.rx - dw / 2, o.y + inside.ry - dh * (img.feet ? img.feet[(player.dir % rows) * cols + (player.frame % cols)] : img.foot ?? .92), dw, dh);
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
			const row = player.dir % rows;
			ctx.drawImage(src, col * sw, row * sh, sw, sh, o.x + inside.rx - dw / 2, o.y + inside.ry - dh * (img.feet ? img.feet[(player.dir % rows) * cols + (player.frame % cols)] : img.foot ?? .92), dw, dh);
		}
	}
	var groundPat = new Map();
	function groundFill(tile) {
		const name = [
			"ground-mat-dirt",
			"ground-mat-scrub",
			"ground-mat-road",
			"ground-mat-rubble",
			"ground-mat-snow"
		][tile] ?? "ground-mat-dirt";
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
		let d = hexInside(wx, wy) + edgeWave(wx, wy) * 2.4;
		if (tile === 2) d += 2;
		if (d >= 3.6) return 1;
		if (d <= 0) return 0;
		const t = d / 3.6;
		return t * t * (3 - 2 * t);
	}
	function paintGroundRect(x, y, w, h, tile, alpha, snow) {
		if (alpha < .02 || w <= 0 || h <= 0) return;
		const pad = alpha > .98 ? 1.5 : 0;
		ctx.globalAlpha = alpha;
		ctx.fillStyle = groundFill(tile);
		ctx.fillRect(x, y, w + pad, h + pad);
		if (snow) {
			ctx.globalAlpha = alpha * .52;
			ctx.fillStyle = groundFill(4);
			ctx.fillRect(x, y, w + pad, h + pad);
		}
	}
	function drawGround(dcx, dcy) {
		if (!world) return;
		const b = viewTiles(dcx, dcy);
		const dpr = canvas.width / Math.max(1, viewW);
		const z = zoom;
		ctx.setTransform(dpr * z, dpr * .5 * z, -dpr * z, dpr * .5 * z, dpr * (viewW / 2 * (1 - z) - dcx * z), dpr * (viewH / 2 * (1 - z) - dcy * z));
		const tx0 = Math.max(0, b.tx0);
		const ty0 = Math.max(0, b.ty0);
		const tx1 = Math.min(155, b.tx1);
		const ty1 = Math.min(155, b.ty1);
		const fringe = tx1 - tx0 > 46 ? 32 : 16;
		for (let ty = ty0; ty <= ty1; ty++) {
			let runTile = -2;
			let runX = 0;
			let runFog = false;
			let runSnow = false;
			const flush = (x) => {
				if (runTile < 0) return;
				paintGroundRect(runX * 64, ty * 64, (x - runX) * 64, 64, runTile, runFog ? .42 : 1, runSnow);
				runTile = -2;
			};
			for (let tx = tx0; tx <= tx1 + 1; tx++) {
				let solid = false;
				let tile = 0;
				let fog = false;
				let snow = false;
				let fade = 0;
				if (tx <= tx1) {
					const i = ty * 156 + tx;
					tile = world.tiles[i] ?? 0;
					if (explored[i] === 1 && tile >= 0 && tile <= 4) {
						fade = landFadeAt(tx + .5, ty + .5, tile);
						fog = visible[i] !== 1;
						snow = tile === 2 && inFarm(tx, ty);
						solid = fade > .98;
					}
				}
				if (solid && tile === runTile && fog === runFog && snow === runSnow) continue;
				flush(tx);
				if (solid) {
					runTile = tile;
					runX = tx;
					runFog = fog;
					runSnow = snow;
				} else if (tx <= tx1 && fade > .02) {
					const step = fringe;
					const base = fog ? .42 : 1;
					for (let oy = 0; oy < 64; oy += step) for (let ox = 0; ox < 64; ox += step) {
						const a = landFadeAt(tx + (ox + step / 2) / 64, ty + (oy + step / 2) / 64, tile) * base;
						paintGroundRect(tx * 64 + ox, ty * 64 + oy, step, step, tile, a, snow);
					}
				}
			}
		}
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
		const ease = (t) => t * t * (3 - 2 * t);
		const DUSK = .64, DEEP = .82;
		if (h >= 7 && h < 17) return 0;
		if (h >= 17 && h < 21) return DUSK * ease((h - 17) / 4);
		if (h >= 21) return DUSK + (DEEP - DUSK) * ease((h - 21) / 5);
		if (h < 2) return DUSK + (DEEP - DUSK) * ease((h + 3) / 5);
		if (h < 4) return DEEP;
		return DEEP * (1 - ease((h - 4) / 3));
	}
	const LIT_BUILDINGS = { farmhouse: [150, -70, .8], shack: [110, -50, .65], workshop: [120, -60, .65], stall: [120, -40, .7], barn: [120, -70, .55], "post-porch": [120, -60, .75], "post-loft": [100, -90, .6] };
	const FIRES = { campfire: 230, firepot: 170, "firepot-up": 180, "firepot-3": 190 };
	let nightCv = null;
	/** Darkness layer with holes cut around light sources, then a warm additive glow on top. */
	function paintNight(dark, camXd, camYd) {
		if (!world || !player || !ctx) return;
		const scale = .5;
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
		lights.push({ x: pp.sx, y: pp.sy, r: (120 + Math.min(10, perc()) * 9) * zoom * (carrying("lantern") ? 1.7 : 1), a: carrying("lantern") ? .95 : .8, warm: carrying("lantern") ? .55 : .3 });
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
		lg.setTransform(1, 0, 0, 1, 0, 0);
		lg.globalCompositeOperation = "source-over";
		lg.clearRect(0, 0, w, h);
		lg.fillStyle = `rgba(4, 8, 22, ${dark})`;
		lg.fillRect(0, 0, w, h);
		lg.globalCompositeOperation = "destination-out";
		for (const L of lights) {
			const x = L.x * scale, y = L.y * scale, r = Math.max(4, L.r * scale);
			const g = lg.createRadialGradient(x, y, 0, x, y, r);
			g.addColorStop(0, `rgba(0,0,0,${L.a})`);
			g.addColorStop(.55, `rgba(0,0,0,${L.a * .6})`);
			g.addColorStop(1, "rgba(0,0,0,0)");
			lg.fillStyle = g;
			lg.fillRect(x - r, y - r, r * 2, r * 2);
		}
		ctx.save();
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(nightCv, 0, 0, viewW, viewH);
		ctx.globalCompositeOperation = "lighter";
		for (const L of lights) {
			const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r * .8);
			g.addColorStop(0, `rgba(255, 160, 70, ${L.warm * dark * .95})`);
			g.addColorStop(1, "rgba(0,0,0,0)");
			ctx.fillStyle = g;
			ctx.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
		}
		ctx.restore();
	}
	function render() {
		resize();
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
			const destX = focus.sx - viewW / 2;
			const destY = focus.sy - viewH / 2;
			const k = 1 - Math.exp(-10 * STEP);
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
		const drawCamX = camX + sxOff;
		const drawCamY = camY + syOff;
		const bounds = viewTiles(drawCamX, drawCamY);
		const z = zoom;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		drawGround(drawCamX, drawCamY);
		q10DrawGround(drawCamX, drawCamY, dpr);
		if (buildOpen) {
			ctx.setTransform(dpr * z, dpr * .5 * z, -dpr * z, dpr * .5 * z, dpr * (viewW / 2 * (1 - z) - drawCamX * z), dpr * (viewH / 2 * (1 - z) - drawCamY * z));
			const tile = hoverTile();
			const spec = PROP_SPEC[RECIPES[recipe].kind];
			ctx.fillStyle = canPlaceAt(tile) ? "rgba(138,154,98,0.45)" : "rgba(196,84,58,0.4)";
			ctx.fillRect(tile.tx * 64, tile.ty * 64, spec.w * 64, spec.h * 64);
		}
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const draws = [];
		for (const prop of world.props) {
			const t = prop.tx + prop.ty;
			const i = prop.ty * 156 + prop.tx;
			if (!explored[i]) continue;
			if (prop.tx < bounds.tx0 - 2 || prop.ty < bounds.ty0 - 2 || prop.tx > bounds.tx1 + 2 || prop.ty > bounds.ty1 + 2) continue;
			const spec = PROP_SPEC[prop.kind];
			const c = propCenter(prop);
			const h = prop.loose ? spec.drawH * .62 : spec.drawH;
			if (prop.kind === "bike" && prop.id === mountId) continue;
			draws.push({
				z: c.x + c.y + t * 0,
				draw: () => {
					const tree = prop.kind.startsWith("tree-");
					const n = (Math.imul(prop.tx, 374761393) ^ Math.imul(prop.ty, 668265263)) >>> 0;
					const scale = tree ? .84 + n % 5 * .07 : 1;
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
					let seeThrough = false;
					if (player && !inside && h > 140 && c.x + c.y > player.x + player.y && !(standingDoor(prop.kind) && inFrontOfHouse(prop, player.x, player.y))) {
						const pr = worldToScreen(c.x, c.y, drawCamX, drawCamY);
						const ps = zoomPoint(pr.sx, pr.sy);
						const hr = worldToScreen(player.x, player.y, drawCamX, drawCamY);
						const hs = zoomPoint(hr.sx, hr.sy);
						const ph = h * scale * zoom;
						const pimg = images.get(spec.image);
						const aspect = pimg && pimg.height ? pimg.width / pimg.height : 1;
						const pw = ph * aspect * (tree ? .6 : .92);
						seeThrough = Math.abs(hs.sx - ps.sx) < pw / 2 && hs.sy < ps.sy + 6 * zoom && hs.sy - HERO_H * zoom * .5 > ps.sy - ph;
					}
					// ease the fade in and out instead of popping
					const fadeTo = seeThrough ? 1 : 0;
					prop.fade = (prop.fade || 0) + (fadeTo - (prop.fade || 0)) * Math.min(1, STEP * 10);
					if (prop.fade < .01) prop.fade = 0;
					seeThrough = prop.fade > 0;
					if (seeThrough) ctx.globalAlpha = 1 - prop.fade * .62;
					const treeArt = v2TreeArt(prop, n);
					if (prop.kind === "tractor" && (prop.charge || 0) > 0 && images.get("v2/tractor-drive")) {
						// v12: the gw14 8-way tractor (4 frames x 8 facings), rolling along its charge line
						const shift = tractorShift(prop.charge || 0);
						blit("v2/tractor-drive", c.x + shift.x, c.y + shift.y, h * 1.25, true, Math.floor((prop.charge || 0) * 28) % 4, TRACTOR_ROW, drawCamX, drawCamY);
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
						const dh = h * zoom;
						const dw = dh * (sw / sh);
						ctx.drawImage(img, f * sw, 0, sw, sh, p.sx - dw / 2, p.sy - dh * .92, dw, dh);
					} else blit(prop.skin && images.get(`v2/${prop.skin}`) ? `v2/${prop.skin}` : treeArt || spec.image, c.x + jx, c.y + jy, h * scale * chip, false, 0, 0, drawCamX, drawCamY, false, 0, tilt, 1, tree && (n & 32) !== 0);
					if (prop.label && !(prop.skin && images.get(`v2/${prop.skin}`))) paintSign(prop.label, c.x, c.y, h * scale, drawCamX, drawCamY);
					if ((prop.flash || 0) > 0 && images.get("fx-muzzle")) blit("fx-muzzle", c.x, c.y - 28, 54, false, 0, 0, drawCamX, drawCamY);
					if ((prop.kind === "firepot" || prop.kind === "firepot-up" || prop.kind === "firepot-3" || (prop.burn || 0) > 1) && images.get("fx-fire")) blit("fx-fire", c.x, c.y - 36, 70, false, 0, 0, drawCamX, drawCamY);
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
		for (const npc of world.npcs) {
			const t = tileOf(npc.x, npc.y);
			if (!visible[t.ty * 156 + t.tx]) continue;
			if ((raid || escortBodies) && (npc.role === "cyndal" || npc.role === "loki")) continue;
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
					paintPerson(party, drawCamX, drawCamY);
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
			draws.push({
				z: bodyZ(enemy.x, enemy.y),
				draw: () => {
					const h = beastH(enemy);
					if (enemy.variant === "bear") { ctx.save(); ctx.filter = "brightness(0.38) saturate(0.5)"; }
					try {
					// strips are drawn facing west; mirror them for anything facing east
					const east = (enemy.dir ?? 0) >= 5 && (enemy.dir ?? 0) <= 7;
					if (enemy.dead) {
						const deadName = `${beastSheet(enemy)}-dead`;
						const dimg = images.get(deadName);
						if (dimg) {
							if (TALL_COMBAT.has(deadName)) {
								const u = 1 - Math.max(0, enemy.death) / 1.15;
								const dn = sheetCols(dimg);
								blit(deadName, enemy.x, enemy.y, h, true, Math.max(0, Math.min(dn - 1, Math.floor(u * dn))), enemy.dir ?? 0, drawCamX, drawCamY);
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
					} finally { if (enemy.variant === "bear") ctx.restore(); }
				}
			});
		}
		for (const pile of piles) {
			if (!hasLoot(pile)) continue;
			const t = tileOf(pile.x, pile.y);
			if (t.tx < 0 || t.ty < 0 || t.tx >= 156 || t.ty >= 156) continue;
			if (!visible[t.ty * 156 + t.tx]) continue;
			draws.push({
				z: pile.x + pile.y,
				draw: () => {
					if (pile.shownAt && performance.now() < pile.shownAt) return;
					const tilt = pile.dir === 1 || pile.dir === 2 || pile.dir === 3 ? -1.2 : 1.2;
					const deadName = pile.body ? `${pile.sheet || beastSheet({ kind: pile.body, id: pile.id })}-dead` : "";
					const dimg = deadName ? images.get(deadName) : null;
					if (dimg && TALL_COMBAT.has(deadName)) {
						const dummy = { kind: pile.body, id: pile.id, variant: (pile.sheet || "").startsWith("boss-") || (pile.sheet || "").startsWith("raider-") && !["raider-gray", "raider-blue"].includes(pile.sheet) ? (pile.sheet || "").split("-")[1] : undefined };
						const v2p = (pile.sheet || "").startsWith("v2/");
						blit(deadName, pile.x, pile.y, v2p ? realH(pile.sheet, 70) : beastH(dummy), true, v2p ? sheetCols(dimg) - 1 : 3, pile.dir ?? 0, drawCamX, drawCamY);
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
					} else blit("sack", pile.x, pile.y, 64, false, 0, 0, drawCamX, drawCamY);
				}
			});
		}
		for (const crow of crows) {
			const t = tileOf(crow.x, crow.y);
			if (t.tx < 0 || t.ty < 0 || t.tx >= 156 || t.ty >= 156) continue;
			if (!visible[t.ty * 156 + t.tx]) continue;
			draws.push({
				z: crow.x + crow.y + 2e4,
				draw: () => blit("crow", crow.x, crow.y, Math.round(ADULT * .26), true, crow.frame, crow.dir, drawCamX, drawCamY, false, crow.alt)
			});
		}
		draws.push({
			z: bodyZ(player.x, player.y),
			draw: () => {
				// v11.1 art hook: a dedicated hero-ride sheet (bike included) replaces the stand-in when present
				if (mounted && images.get("v2/hero-ride") && phase !== "dead") { blit("v2/hero-ride", player.x, player.y, ADULT, true, walkFrame(true), player.dir, drawCamX, drawCamY, false); return; }
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
				else if (idle) blit("v2/hero-idle", player.x, player.y, HERO_H, true, Math.floor(performance.now() / 300) % 4, player.dir, drawCamX, drawCamY, false);
				else if (swingAnim > 0 && !work && TALL_COMBAT.has(atkName)) {
					blit(atkName, player.x, player.y, HERO_H, true, Math.min(3, Math.floor((1 - swingAnim / .48) * 4)), player.dir, drawCamX, drawCamY, false);
				} else if (swingAnim > 0 && !work && facingCam && images.get(atkName)) {
					const f = Math.min(3, Math.floor((1 - swingAnim / .48) * 4));
					blit(atkName, player.x, player.y, HERO_H, false, f, 0, drawCamX, drawCamY, false);
				} else blit(heroKey(), player.x, player.y, HERO_H, true, player.frame, player.dir, drawCamX, drawCamY, reach > 0);
				if (!flinch && !axeSwing && !idle && !HERO69.has(heroKey()) && !(swingAnim > 0 && !work && (TALL_COMBAT.has(atkName) || facingCam && images.get(atkName)))) paintOverlays(player.frame, player.dir, reach > 0);
				if (swingAnim > 0 && !work && !axeSwing && !TALL_COMBAT.has(atkName)) paintSwingArc();
			}
		});
		for (const scar of scars) {
			const t = tileOf(scar.x, scar.y);
			if (t.tx < 0 || t.ty < 0 || t.tx >= 156 || t.ty >= 156) continue;
			if (!explored[t.ty * 156 + t.tx]) continue;
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
		draws.sort((a, b) => a.z - b.z);
		for (const item of draws) item.draw();
		if (work && work.swing > 0 && player && !inside) paintToolSwing(drawCamX, drawCamY);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const shade = nightShade(clock);
		const dark = nightDark(clock);
		if (dark > .02) paintNight(dark, drawCamX, drawCamY);
		if (!inside) paintWeather13();
		paintSeason();
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
		drawMini();
	}
	function blit(name, x, y, drawH, sheet, frame, dir, dcx, dcy, lunge = false, lift = 0, tilt = 0, flatten = 1, flip = false) {
		const img = images.get(name);
		if (sheet && img && /^v2\/bandit-[a-z]+-walk$/.test(name) && sheetCols(img) === 8) frame = ((frame || 0) % 4) * 2 + (Math.floor(performance.now() / 110) & 1);
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
		if (!layer) {
			ctx.fillStyle = "rgba(12,10,8,0.4)";
			ctx.beginPath();
			ctx.ellipse(foot.sx, foot.sy, 18 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
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
			sw = img.width / (strips ? 4 : cols);
			sh = img.height / rows;
			sx = frame % (strips ? 4 : cols) * sw;
			sy = (sheet ? dir % rows : 0) * sh;
		}
		const footSrc = layer ? images.get(overlayBase) ?? img : img;
		let frac = footSrc.foot ?? (sheet || strips ? .92 : .9);
		if ((sheet || strips) && footSrc.feet) {
			const fcols = sheetCols(footSrc);
			const planted = footSrc.feet[(sheet ? dir % rows : 0) * fcols + (frame % fcols)];
			if (planted) frac = planted;
		}
		drawH *= heroScale(name);
		const dh = drawH * zoom;
		const dw = dh * (sw / sh);
		const spriteY = -dh * frac - lift * zoom;
		const smooth = ctx.imageSmoothingEnabled;
		ctx.imageSmoothingEnabled = dh < sh * 0.92;
		ctx.imageSmoothingQuality = "high";
		if (tilt || flatten !== 1 || flip) {
			ctx.save();
			ctx.translate(p.sx, p.sy);
			if (tilt) ctx.rotate(tilt);
			if (flip) ctx.scale(-1, 1);
			if (flatten !== 1) ctx.scale(1, flatten);
			ctx.drawImage(src, sx, sy, sw, sh, -dw / 2, spriteY, dw, dh);
			ctx.restore();
		} else ctx.drawImage(src, sx, sy, sw, sh, p.sx - dw / 2, p.sy + spriteY, dw, dh);
		ctx.imageSmoothingEnabled = smooth;
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
	function drawMini() {
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
		for (let ty = 0; ty < 156; ty++) for (let tx = 0; tx < 156; tx++) {
			const i = ty * 156 + tx;
			const tile = world.tiles[i] ?? 0;
			if (!explored[i] || tile === 5) continue;
			const fade = landFadeAt(tx + .5, ty + .5, tile);
			if (fade < .28) continue;
			const seen = visible[i] === 1;
			mctx.globalAlpha = seen ? .55 + fade * .45 : .8;
			mctx.fillStyle = seen ? colors[tile] ?? "#8a7048" : "#3a342c";
			mctx.fillRect(tx * sx, ty * sy, Math.ceil(sx) + .5, Math.ceil(sy) + .5);
		}
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
			"Escape"
		].includes(e.code)) e.preventDefault();
		keys.add(e.code);
		if (e.repeat) return;
		if (e.code === "Escape" && phase === "play") {
			phase = "pause";
			sync(true);
		} else if (e.code === "Escape" && phase === "pause") {
			phase = "play";
			sync(true);
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
	function frame(now) {
		if (!running) return;
		const dt = Math.min(.1, (now - last) / 1e3);
		last = now;
		acc += dt;
		let guard = 0;
		while (acc >= STEP && guard < 5) {
			step(STEP);
			acc -= STEP;
			guard++;
		}
		render();
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
			if (p.kind !== "press" && p.kind !== "crates" && p.kind !== "orchard" && p.kind !== "maple") continue;
			const c = propCenter(p);
			consider(c.x, c.y, PROP_SPEC[p.kind].drawH * .8, "prop", p.id);
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
			if (p.kind === "press" || p.kind === "crates" || p.kind === "orchard" || p.kind === "maple") {
				if (near) useFarm(p);
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
			slots: slotInfos()
		});
	});
	useHud.setState({
		hasSave: hasSave(),
		slot: getSlot(),
		slots: slotInfos(),
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
			if (!giveItem(recipe.item)) break;
			made += 1;
		}
		pushLog(made ? `Made ${made} ${out.name}.` : "Nothing made.");
		sfx("click");
		saveGame();
		sync(true);
	}
	function setAim(part) {
		aim = part;
		pushLog(`Aiming at the ${part}.`);
		sync(true);
	}
	function setTurnBased(on) {
		turnBased = on;
		ap = apMax;
		apWalk = 0;
		pushLog(on ? "Turn-based. Spend action points, then end the turn." : "Real time again.");
		saveGame();
		sync(true);
	}
	function endTurn() {
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
		raidMode() {
			unlockAudio();
			sfx("click");
			raidMode = true;
			useRaidMode.setState({ result: null });
			bootNew("Packer", "hunter", { strength: 1, vigor: 1, endurance: 1, intellect: 0, perception: 0, luck: 0 }, "eye", "wool");
			snow = Math.max(snow, 3);
			jackMet = true;
			raidNight = 0;
			// starter gear for a fight: carbine in hand, a box of shells, a warm coat already on
			if (GEAR.carbine) { giveItem("carbine", 1); player.weaponId = "carbine"; }
			giveItem("shells", 12);
			refreshGear(player);
			player.hp = player.maxHp;
			const fh = world.props.find((q) => q.kind === "farmhouse");
			if (fh) { const d = doorPoint(fh); player.x = d.x; player.y = d.y + 48; }
			const span = DAY_LENGTH_SEC;
			clock = Math.floor(clock / span) * span + (21.5 / 24) * span;
			setLog("Raid Mode. One night at Cambridge Road. Justin and Sarah take the posts; Cyndal watches from the loft, Loki runs shells.");
			startRaid();
			if (!raid) { raidMode = false; phase = "menu"; }
			camX = player.x - player.y - viewW / 2;
			camY = (player.x + player.y) / 2 - viewH / 2;
			sync(true);
		},
		continueGame() {
			unlockAudio();
			const data = readSave();
			if (!data) return;
			sfx("click");
			bootSave(data);
		},
		setStick(_x, _y) {},
		tap(action) {
			edges[action] = true;
			unlockAudio();
		},
		choose(id) {
			applyChoice(id);
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
			pushLog(`${stat === "vigor" ? "health" : stat === "intellect" ? "intelligence" : stat === "perception" ? "perception" : stat === "endurance" ? "endurance" : stat === "luck" ? "luck" : stat === "agility" ? "agility" : stat === "grit" ? "grit" : stat === "wits" ? "wits" : "strength"} rises.`);
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
		endTurn,
		takeLoot
	};
	window.__controlsTest = {
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
		v13Act: (n) => { w13.main.act = n; sync(true); },
		v13Tick: () => v13MainTick(),
		v13Siege: () => { v13SiegeStart(); return raid ? { siege: !!raid.siege, waves: raid.waves, house: raid.house } : null; },
		v13SiegeEnd: (won) => { if (won) w13.main.collectorDown = true; endRaid(!!won, "Test: the siege ends."); v13MainTick(); return { ...w13.main }; },
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
		giveItem: (id, qty = 1) => giveItem(id, qty),
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
		raidState: () => raid ? { night: raid.night, wave: raid.wave, waves: raid.waves, phase: raid.phase, house: raid.house, kills: raid.kills, mode: raidMode } : { none: true, mode: raidMode, held: raidsHeld },
		raidHouseHit: (n) => { if (raid) raid.house -= n; },
		raidMode: () => api.raidMode(),
		setSnow: (n) => { snow = n; sync(true); },
		startRaidNow: () => { startRaid(); return !!raid; },
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
		guardPose: (role) => { const n = world?.npcs.find((m) => m.role === role); if (!n) return null; guardPost.set(n.id, -1); return n.id; },
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
		v3Tracks: () => world ? world.enemies.filter((e) => isGame(e) && e.trail?.length).map((e) => ({ id: e.id, kind: e.kind, temper: e.temper, n: e.trail.length, last: e.trail[e.trail.length - 1], x: e.x, y: e.y, aggro: e.aggro, tracked: !!e.tracked })) : [],
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
		q10EndRaid: (won) => endRaid(!!won, "Test: the raid ends."),
		dialogueNow: () => dialogue ? { speaker: dialogue.speaker, text: dialogue.text, choices: dialogue.choices.map((c) => ({ id: c.id, label: c.label })) } : null,
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
const V2_COLS = { "v2/bike-ride": 6, "v2/bike-parked": 1, "v2/hero-ride": 6, "v2/tractor-drive": 4 };
/** v12: gw14 people (88x124 cells, 8 facing rows). */
const V2_FOLK = /^v2\/(holt|jack|mira|nora|sarah|cyndal|loki|marcel|justin|player|boss-collector|bandit-[a-z]+)-/;
/** v12: raider attack / death come from the gw14 action sheets under the legacy -atk / -dead names. */
const ART_ALIAS = {};
for (const k of ["scout", "armor", "brute", "torch", "gray", "blue"]) {
	ART_ALIAS[`v2/bandit-${k}-walk-atk`] = k === "brute" || k === "torch" ? `v2/bandit-${k}-axe` : `v2/bandit-${k}-gun-atk`;
	ART_ALIAS[`v2/bandit-${k}-walk-dead`] = `v2/bandit-${k}-death`;
}
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
/** v10.1: the gw12 Justin sheets are a 69 px figure in an 88x124 cell; draw them at the same 69 px hero height as the walk. */
const HERO69 = new Set(["hero", "hero-gun", "hero-gun-atk", "hero-hit", "hero-down", "v2/hero-idle", "v2/hero-axe", "v2/hero-death"]);
function heroScale(name) {
	return HERO69.has(name) || name.startsWith("pl/") ? 0.806 * 124 / 69 : 1;
}
/** 4 frames across (352px), 6 (528px) or 8 (704px). Anything else stays 4. */
function sheetCols(img) {
	if (img && img.cols) return img.cols;
	if (img && img.width % 88 === 0) {
		const c = img.width / 88;
		if (c === 3 || c === 4 || c === 6 || c === 8) return c;
	}
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
		const cols = (w % 88 === 0 && (w / 88 === 4 || w / 88 === 6 || w / 88 === 8)) ? w / 88 : 4;
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
async function loadImages(images) {
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
	const all = [...IMAGES, ...extra];
	const core = all.filter((n) => !LAZY_SHEET.test(n));
	const lazy = all.filter((n) => LAZY_SHEET.test(n));
	await loadSet(images, core);
	LAZY_STATE.pending = lazy.length;
	LAZY_STATE.done = loadSet(images, lazy).then(() => { LAZY_STATE.pending = 0; });
}
const LAZY_SHEET = /^boss-|-(atk|dead|death|gun-atk|axe|down|hit|crouch|carry|talk)$/;
const LAZY_STATE = { pending: -1, done: Promise.resolve() };
function loadSet(images, list) {
	return Promise.all(list.map((name) => new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			if (V2_COLS[name]) img.cols = V2_COLS[name];
			if ((name.endsWith("-atk") || name.endsWith("-dead")) && img.height > img.width * 1.2) TALL_COMBAT.add(name);
			const rows = sheetRowsOf(name);
			const strips = stripFrames(name, img) > 1;
			const posed = (V2_COLS[name] || V2_FOLK.test(name)) && !TALL_COMBAT.has(name) || !strips && !name.endsWith("-atk") && !name.endsWith("-dead") && (/^(v2\/)?hero/.test(name) || name.startsWith("npc-") || name.startsWith("raider") || name.startsWith("boss") || name === "villager" || name === "wolf" || name === "coyote" || name === "deer" || name === "moose" || name === "rabbit" || name === "squirrel" || name === "crow");
			const radius = name.startsWith("ground-") || name === "farm-room" || name === "bunker-room" ? 0 : posed ? 1 : 1;
			const tall = TALL_COMBAT.has(name);
			const soft = softenSprite(img, radius, posed || tall ? rows : 0);
			if ((posed || strips || tall) && /^(v2\/)?hero/.test(name)) soft.sharp = img;
			const pose = measurePose(img, posed || strips || tall, strips ? 1 : rows);
			if (img.cols) soft.cols = img.cols;
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
