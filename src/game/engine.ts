// Recovered game engine. Type checks live in the modules this file imports.
// @ts-nocheck
/** Art cache-bust: bump after replacing any file in public/game (sheets, overlays, item icons). */
const ART_V = 2058;
import { GEAR, CRAFT, armorSlot, rollDrop, roleKit, roleStats, traitOf, defaultLook, type LookId, type RoleId, type TraitId } from "@/game/gear";
import { sfx, unlockAudio } from "@/game/audio";
import { POSE } from "@/game/pose-table";
import { JACK_SIGNOFF, SNOW_WOOD, journalEntries, npcLine, objectiveTile, questText, xpNeed } from "@/game/content";
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
import { b64ToBytes, bytesToB64, hasSave, playerToSave, readSave, writeSave, type SaveData, type SavedRegion } from "@/game/save";
import { useHud } from "@/game/store";
import { EQUIP_SLOTS, GRID_COLS, SLOT_FIELD, canFit, equipSlotOf, fitsAt, itemSize, layoutGrid, slotAccepts, wornCount } from "@/game/inventory";
import { clockLabel, DAY_LENGTH_SEC, morningClock, nightShade } from "@/game/time";
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
  begin: (name: string, role: RoleId, bonus: { strength: number; vigor: number; endurance: number; intellect: number; perception: number; luck: number }, trait: TraitId, look: LookId) => void;
  continueGame: () => void;
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
  spend: (stat: "strength" | "vigor" | "endurance" | "intellect" | "perception" | "luck") => void;
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
		return { snow, wood: player?.wood ?? 0, jackTrust, bunkerSeen, jackMet, warden: wardenState, scrap: player?.scrap ?? 0 };
	}
	function hudQuestText() {
		if (snow < 3 && quest <= 0) {
			if (snow <= 0) return "First Snow: talk to Justin at the Cambridge Road farm.";
			if (snow === 1) return `First Snow: bring Justin ${SNOW_WOOD} wood. ${Math.min(player?.wood ?? 0, SNOW_WOOD)} of ${SNOW_WOOD}. Woodpile by the barn.`;
			return "First Snow: go see Sarah at the farm.";
		}
		return questText(quest, questKills);
	}
	function sync(force = false) {
		if (!force) return;
		const p = player;
		useHud.setState({
			phase,
			ready: useHud.getState().ready,
			hasSave: hasSave(),
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
			journal: journalEntries(quest, questKills, talkState()),
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
		if (p.perks?.includes("wool")) p.def += 2;
		apMax = p.perks?.includes("quick") ? 10 : 8;
		const extra = p.trait === "hide" ? 14 : p.trait === "step" ? -8 : 0;
		const nextHp = Math.max(24, kit.hp + Math.max(0, p.level - 1) * 6 + Math.max(0, p.vigor - 1) * 8 + extra);
		if (nextHp > p.maxHp) p.hp += nextHp - p.maxHp;
		p.maxHp = nextHp;
		p.hp = Math.min(p.hp, p.maxHp);
		p.maxStamina = 70 + p.endurance * 16;
		p.stamina = Math.min(p.maxStamina, p.stamina || p.maxStamina);
	}
	/** Icon file for an item: public/game/items/<id>.png, else the generic one for its shape. */
	function itemIcon(g) {
		return `/game/items/${ITEM_ICON[g.id] ?? g.id}.png?v=${ART_V}`;
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
		const cw = img.width / 4, ch = img.height / 8;
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
		const name = family === "axe" || family === "pry" ? "hero-axe" : family === "pickaxe" ? "hero-pick" : family === "carbine" || family === "revolver" || family === "scatter" ? "hero-gun" : family === "knife" ? "hero-knife" : "hero";
		const worn = EQUIP_SLOTS.map((slot) => player[SLOT_FIELD[slot]]).filter((id) => id && images.get(`overlay-${id}`));
		const key = `${name}:${player.look}:${player.coatId}:${player.headId}:${player.legsId}:${player.handsId}:${player.feetId}:${player.backId}:${worn.join(",")}`;
		if (key === figureKey && figureUrl) return figureUrl;
		const img = images.get(name);
		if (!img || !img.width) return "";
		const src = heroSource(name, img);
		const cw = img.width / 4, ch = img.height / 8;
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
	function bootNew(name, role, bonus, trait, look) {
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
		if (!world || !player) return;
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
		return 5 + perc() + (trail >= 45 ? 1 : 0) + (carrying("binoculars") ? 2 : 0);
	}
	function noticeRange(base) {
		return base * (1 - Math.min(.4, skillOf("sneak") / 220));
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
				if (Math.random() * 100 >= checkChance(skillOf(choice.check.skill), choice.check.dc, rep, player.karma ?? 0)) {
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
		const price = priceOf(cost, skillOf("barter"), rep);
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
	function openTalk(npc) {
		if (!player) return;
		ensureProgress(player);
		parkBike(true);
		talkNpc = npc;
		statsOpen = false;
		packOpen = false;
		buildOpen = false;
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
			if (rep <= -10) line.text = `You are not welcome here, and they do not pretend otherwise. ${line.text}`;
			line.choices = line.choices.map((choice) => {
				if (!choice.check) return choice;
				const chance = checkChance(skillOf(choice.check.skill), choice.check.dc, rep, player.karma ?? 0);
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
	function heroSource(name, img) {
		if (!name.startsWith("hero") || !player) return img;
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
		const cols = 4;
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
	function mountBike(prop) {
		if (!player || prop.kind !== "bike") return;
		mounted = true;
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
		player.frame = moving ? Math.floor(player.anim / 22) % 4 : 0;
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
			const found = rollDrop(enemy.elite, player.luck);
			if (found) addStack(items, found, 1);
			if (Math.random() < .4) addStack(items, "cloth", 1);
		} else {
			addStack(items, "meat", enemy.kind === "moose" ? 3 : enemy.kind === "deer" ? 2 : 1);
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
		corpseOf(enemy);
		grantXp(xp);
		if (enemy.name) pushLog(`${enemy.name} is down.`);
		if (enemy.id === WARDEN_ENEMY_ID) {
			wardenState = 3;
			pushLog("The gate is yours. His vest and his pump gun are on him.");
		}
		if (enemy.id === HOLEB_ID) pushLog("The old bull of Holeb lies in the snow. They will talk about this in Lowelltown.");
		if (enemy.id === PELLETIER_ID) pushLog("Her lantern rolls into the water and goes out. The mill is quiet.");
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
		player.invuln = .38;
		player.hurt = .15;
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
		parkBike(false);
		const leaving = world.name;
		regions.set(mapId, captureRegion());
		const arriveSide = (gate.side + 3) % 6;
		mapId = mapId === 0 ? 1 : 0;
		world = createWorld(worldSeed, mapId, exitSides);
		applyRegion(regions.get(mapId));
		regions.delete(mapId);
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
		const pace = (mounted ? SCREEN_SPEED * 2.4 : player.stamina > 0 ? SCREEN_SPEED : SCREEN_SPEED * .45) * (mounted ? 1 : shoes);
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
			lastSpeed = mounted ? SCREEN_SPEED * 2.4 : player.stamina > 0 ? SCREEN_SPEED : SCREEN_SPEED * .45;
			if (deal > 0) deal = 0;
			player.frame = Math.floor(player.anim / 22) % 4;
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
				const spook = enemy.aggro || dist < noticeRange(78);
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
			let speed = enemy.variant === "scout" ? 236 : enemy.variant === "jumper" ? 214 : enemy.variant === "atv" ? 250 : enemy.variant === "armor" ? 78 : enemy.variant === "shield" ? 100 : enemy.variant === "brute" ? 92 : enemy.variant === "torch" ? 148 : enemy.kind === "wolf" ? 176 : enemy.kind === "coyote" ? 196 : enemy.kind === "deer" ? 168 : enemy.kind === "moose" ? 118 : enemy.elite ? 128 : ENEMY_SPEED;
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
	function folkSheet(npc) {
		return npc.role === "villager" ? "villager" : npc.role === "warden" ? "boss-warden" : `npc-${npc.role}`;
	}
	function paintPerson(body, camX, camY) {
		const id = body.id ?? body.homeId;
		const guarding = id != null && guardPost.has(id);
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
	function beastSheet(enemy) {
		if (enemy.variant === "holeb") return "boss-holeb";
		if (enemy.variant === "warden") return "boss-warden";
		if (enemy.variant === "pelletier") return "boss-pelletier";
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
	function beastH(enemy) {
		if (enemy.variant === "holeb") return Math.round(NPC_H * 1.35 * 1.45);
		if (enemy.variant === "warden") return Math.round(NPC_H * 1.04);
		if (enemy.variant === "pelletier") return Math.round(NPC_H * 1.0);
		if (enemy.variant === "fur" || enemy.variant === "saw" || enemy.variant === "armor") return Math.round(NPC_H * 1.22);
		if (enemy.variant === "brute" || enemy.variant === "shield" || enemy.variant === "atv") return Math.round(NPC_H * 1.12);
		if (enemy.variant === "mask") return Math.round(NPC_H * 1.08);
		if (enemy.variant === "jumper") return Math.round(NPC_H * .96);
		if (enemy.variant === "scout") return Math.round(NPC_H * .92);
		if (enemy.kind === "moose") return Math.round(NPC_H * 1.35);
		if (enemy.kind === "deer") return Math.round(NPC_H * .84);
		if (enemy.kind === "wolf") return Math.round(NPC_H * .76);
		if (enemy.kind === "coyote") return Math.round(NPC_H * .68);
		if (enemy.kind === "rabbit") return Math.round(NPC_H * .5);
		if (enemy.kind === "squirrel") return Math.round(NPC_H * .42);
		return NPC_H;
	}
	function folkHeight(npc) {
		if (npc.role === "justin") return Math.round(NPC_H * 1.08);
		if (npc.role === "sarah") return Math.round(NPC_H * .94);
		if (npc.role === "cyndal") return Math.round(NPC_H * 66 / 70);
		if (npc.role === "loki") return Math.round(NPC_H * 62 / 70); // ~5'1" (Justin 6'2" = 1.08)
		if (npc.role === "rejean") return Math.round(NPC_H * 1.04);
		if (npc.role === "cal") return Math.round(NPC_H * 1.02);
		if (npc.role === "adele") return Math.round(NPC_H * .96);
		if (npc.role === "pete") return Math.round(NPC_H * 1.05);
		if (npc.role === "warden") return Math.round(NPC_H * 1.04);
		return NPC_H;
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
		if (dark && onFarm && !nightLatch) {
			nightLatch = true;
			bossThisNight = false;
			raidNight += 1;
			const names = { 5: "Night five. Harland Poulin is with them.", 10: "Night ten. René Gallant walks in off the road.", 15: "Night fifteen. You can hear the saw." };
			pushLog(names[raidNight] || `Night ${raidNight} on Cambridge Road.`);
		}
		if (!dark) {
			nightLatch = false;
			bossThisNight = false;
		}
		const night = dark && onFarm;
		const raiders = world.enemies.filter((e) => !e.dead && isRaider(e));
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
		const cap = 3 + Math.min(4, raidNight);
		if (!bossThisNight && (raidNight === 5 || raidNight === 10 || raidNight === 15)) {
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
		if (raidClock <= 0 && raiders.length < cap) {
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
		for (let i = 0; i < posts.length && i < crew.length; i++) {
			const who = crew[i];
			const post = posts[i];
			const id = who.id ?? who.homeId;
			guardPost.set(id, post.id);
			const c = propCenter(post);
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
		const img = images.get(heroKey());
		if (!img) return;
		const src = heroSource(heroKey(), img);
		const rows = 8;
		const sw = img.width / 4;
		const sh = img.height / rows;
		const dh = roomDims().farm ? 124 : 110;
		const dw = dh * (sw / sh);
		const col = player.frame % 4;
		const row = player.dir % rows;
		ctx.drawImage(src, col * sw, row * sh, sw, sh, o.x + inside.rx - dw / 2, o.y + inside.ry - dh * (img.feet ? img.feet[(player.dir % rows) * 4 + (player.frame % 4)] : img.foot ?? .92), dw, dh);
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
		const img = images.get(heroKey());
		if (img && player) {
			const src = heroSource(heroKey(), img);
			const rows = 8;
			const sw = img.width / 4;
			const sh = img.height / rows;
			const dh = 110;
			const dw = dh * (sw / sh);
			const col = player.frame % 4;
			const row = player.dir % rows;
			ctx.drawImage(src, col * sw, row * sh, sw, sh, o.x + inside.rx - dw / 2, o.y + inside.ry - dh * (img.feet ? img.feet[(player.dir % rows) * 4 + (player.frame % 4)] : img.foot ?? .92), dw, dh);
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
					if (prop.kind === "tractor" && (prop.charge || 0) > 0 && images.get("tractor-run")) {
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
					} else blit(spec.image, c.x + jx, c.y + jy, h * scale * chip, false, 0, 0, drawCamX, drawCamY, false, 0, tilt, 1, tree && (n & 32) !== 0);
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
					// strips are drawn facing west; mirror them for anything facing east
					const east = (enemy.dir ?? 0) >= 5 && (enemy.dir ?? 0) <= 7;
					if (enemy.dead) {
						const deadName = `${beastSheet(enemy)}-dead`;
						const dimg = images.get(deadName);
						if (dimg) {
							if (TALL_COMBAT.has(deadName)) {
								const u = 1 - Math.max(0, enemy.death) / 1.15;
								blit(deadName, enemy.x, enemy.y, h, true, Math.max(0, Math.min(3, Math.floor(u * 4))), enemy.dir ?? 0, drawCamX, drawCamY);
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
						blit(deadName, pile.x, pile.y, beastH(dummy), true, 3, pile.dir ?? 0, drawCamX, drawCamY);
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
				if (mounted) paintRide(player.x, player.y, player.dir, drawCamX, drawCamY);
				if (phase === "dead") {
					// fall: the (dyed) side-view walk frame tips backwards onto the snow over ~0.7 s
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
				if (swingAnim > 0 && !work && TALL_COMBAT.has(atkName)) {
					blit(atkName, player.x, player.y, HERO_H, true, Math.min(3, Math.floor((1 - swingAnim / .48) * 4)), player.dir, drawCamX, drawCamY, false);
				} else if (swingAnim > 0 && !work && facingCam && images.get(atkName)) {
					const f = Math.min(3, Math.floor((1 - swingAnim / .48) * 4));
					blit(atkName, player.x, player.y, HERO_H, false, f, 0, drawCamX, drawCamY, false);
				} else blit(heroKey(), player.x, player.y, HERO_H, true, player.frame, player.dir, drawCamX, drawCamY, reach > 0);
				if (!(swingAnim > 0 && !work && (TALL_COMBAT.has(atkName) || facingCam && images.get(atkName)))) paintOverlays(player.frame, player.dir, reach > 0);
				if (swingAnim > 0 && !work && !TALL_COMBAT.has(atkName)) paintSwingArc();
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
						blit("logs", scar.x + scar.side * 42, scar.y + 18, 84, false, 0, 0, drawCamX, drawCamY, false, 0, 1.22 * scar.side, .68);
						paintStump(scar.x, scar.y, drawCamX, drawCamY);
					} else paintPit(scar.x, scar.y, drawCamX, drawCamY);
				}
			});
		}
		paintFlood(drawCamX, drawCamY);
		draws.sort((a, b) => a.z - b.z);
		for (const item of draws) item.draw();
		if (work && work.swing > 0 && player && !inside) paintToolSwing(drawCamX, drawCamY);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const shade = nightShade(clock);
		const dark = nightDark(clock);
		if (dark > .02) paintNight(dark, drawCamX, drawCamY);
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
			sw = img.width / 4;
			sh = img.height / rows;
			sx = frame % 4 * sw;
			sy = (sheet ? dir % rows : 0) * sh;
		}
		const footSrc = layer ? images.get(overlayBase) ?? img : img;
		let frac = footSrc.foot ?? (sheet || strips ? .92 : .9);
		if ((sheet || strips) && footSrc.feet) {
			const planted = footSrc.feet[(sheet ? dir % rows : 0) * 4 + (frame % 4)];
			if (planted) frac = planted;
		}
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
		const h = drawH * zoom;
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
			hasSave: hasSave()
		});
	});
	useHud.setState({
		hasSave: hasSave(),
		ready: false
	});
	function craft(id) {
		if (!player || phase !== "play") return;
		const recipe = CRAFT.find((r) => r.id === id);
		if (!recipe || !GEAR[recipe.item]) return;
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
		begin(name, role, bonus, trait, look) {
			unlockAudio();
			sfx("click");
			bootNew(name, role, bonus, trait, look);
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
		spend(stat) {
			if (!player || player.points < 1 || phase === "menu") return;
			player.points -= 1;
			player[stat] += 1;
			refreshGear(player);
			pushLog(`${stat === "vigor" ? "health" : stat === "intellect" ? "intelligence" : stat === "perception" ? "perception" : stat === "endurance" ? "endurance" : stat === "luck" ? "luck" : "strength"} rises.`);
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
				player.hp = Math.min(player.maxHp, player.hp + Math.round(def.heal * (1 + skillOf("doctor") / 200) * (hasPerk("stitch") ? 1.25 : 1)));
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
		enemies: () => world ? world.enemies.map((e) => ({ id: e.id, x: Math.round(e.x), y: Math.round(e.y), name: e.name ?? "", kind: e.kind ?? "", variant: e.variant ?? "", quest: !!e.quest, dead: !!e.dead, hp: e.hp })) : [],
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
function sheetRowsOf(name) {
	if (TALL_COMBAT.has(name)) return 8;
	if (name.startsWith("overlay-")) return 8;
	if (name.endsWith("-atk") || name.endsWith("-dead") || name.startsWith("guard-") || name === "bunker-room") return 4;
	if (name.startsWith("hero") || name.startsWith("npc-") || name.startsWith("raider") || name.startsWith("boss") || name === "villager" || name === "wolf" || name === "coyote" || name === "deer" || name === "moose" || name === "rabbit" || name === "squirrel" || name === "crow") return 8;
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
	const cw = img.width / 4;
	const ch = img.height / rows;
	const feet = new Float32Array(rows * 4);
	const footX = new Float32Array(rows * 4);
	let frac = 0;
	for (let row = 0; row < rows; row++) for (let col = 0; col < 4; col++) {
		const y0 = row * ch;
		const x0 = col * cw;
		const bottom = bottomOf(x0, y0, cw, ch);
		let sx = 0, n = 0;
		const yStart = Math.max(0, bottom - 12);
		for (let y = yStart; y < bottom; y++) for (let x = 0; x < cw; x++) if (data[((y0 + y) * img.width + (x0 + x)) * 4 + 3] > 24) { sx += x; n++; }
		const i = row * 4 + col;
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
		const cw = Math.floor(w / 4);
		for (let row = 0; row < protectRows; row++) for (let col = 0; col < 4; col++) {
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
function loadImages(images) {
	return Promise.all(IMAGES.map((name) => new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			if ((name.endsWith("-atk") || name.endsWith("-dead")) && img.height > img.width * 1.2) TALL_COMBAT.add(name);
			const rows = sheetRowsOf(name);
			const strips = stripFrames(name, img) > 1;
			const posed = !strips && !name.endsWith("-atk") && !name.endsWith("-dead") && (name.startsWith("hero") || name.startsWith("npc-") || name.startsWith("raider") || name.startsWith("boss") || name === "villager" || name === "wolf" || name === "coyote" || name === "deer" || name === "moose" || name === "rabbit" || name === "squirrel" || name === "crow");
			const radius = name.startsWith("ground-") || name === "farm-room" || name === "bunker-room" ? 0 : posed ? 1 : 1;
			const tall = TALL_COMBAT.has(name);
			const soft = softenSprite(img, radius, posed || tall ? rows : 0);
			if ((posed || strips || tall) && name.startsWith("hero")) soft.sharp = img;
			const pose = measurePose(img, posed || strips || tall, strips ? 1 : rows);
			soft.foot = pose.foot;
			soft.feet = pose.feet;
			soft.footX = pose.footX;
			images.set(name, soft);
			resolve();
		};
		img.onerror = () => resolve();
		img.src = `/game/${name}.png?v=${ART_V}`;
	}))).then(() => void 0);
}
