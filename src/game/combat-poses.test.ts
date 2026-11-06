import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { test } from "node:test";
import { ART_SCALED } from "./art-scale.ts";
import { facingRow } from "./iso.ts";
import {
	armorWeaponOf,
	banditArmorPose,
	banditWalkBob,
	blitRowCount,
	combatWeapon,
	gunFireFrame,
	hostileNotices,
	keepCardinalFacing,
	playerCombatPose,
	poseFrameIndex,
	RELOAD_SEC,
	scaledCols,
	sheetGrid,
	shouldOpenTurnCombat,
	spreadFrame,
	type PlayerPose,
} from "./combat-poses.ts";

const PASS2_PISTOL_FIRE = "3b7d7a3d4ece4d82175a4d2f6a6e5755575c3ccdc3149250642c50a9afa61376";
const PASS1_KICK_FIRE = "372edfdedbc92bf08f662b82b6d5f0279bd3071ba4fbaddc7cf5a0a090c9599b";

const PLAYER_WALK = ["player-pistol-walk", "player-rifle-walk", "player-knife-walk"];
const PLAYER_COMBAT = [
	"player-knife-ready", "player-knife-atk", "player-knife-crouch", "player-knife-crouch-atk",
	"player-pistol-fire", "player-pistol-reload", "player-pistol-crouch", "player-pistol-crouch-fire",
	"player-rifle-reload", "player-rifle-crouch", "player-rifle-crouch-fire",
	"player-rifle-aim", "player-rifle-fire", "player-pistol-aim",
];
const BANDIT = [
	"bandit-armor-pistol-walk", "bandit-armor-knife-walk", "bandit-armor-rifle-aim",
	"bandit-armor-rifle-fire", "bandit-armor-pistol-crouch", "bandit-armor-rifle-crouch",
];

function pngSize(file: string) {
	const b = readFileSync(file);
	assert.equal(b.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", file);
	return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), bytes: b };
}

function decodeRgba(file: string) {
	const b = readFileSync(file);
	let o = 8, width = 0, height = 0, color = 0;
	const parts: Buffer[] = [];
	while (o < b.length) {
		const len = b.readUInt32BE(o); o += 4;
		const type = b.toString("ascii", o, o + 4); o += 4;
		const data = b.subarray(o, o + len); o += len + 4;
		if (type === "IHDR") { width = data.readUInt32BE(0); height = data.readUInt32BE(4); color = data[9]; }
		else if (type === "IDAT") parts.push(data);
		else if (type === "IEND") break;
	}
	const bpp = color === 6 ? 4 : color === 2 ? 3 : color === 4 ? 2 : 1;
	const raw = inflateSync(Buffer.concat(parts));
	const stride = width * bpp;
	const out = Buffer.alloc(height * stride);
	let p = 0;
	const paeth = (a: number, b2: number, c: number) => {
		const q = a + b2 - c, pa = Math.abs(q - a), pb = Math.abs(q - b2), pc = Math.abs(q - c);
		return pa <= pb && pa <= pc ? a : pb <= pc ? b2 : c;
	};
	for (let y = 0; y < height; y++) {
		const filter = raw[p++];
		const row = out.subarray(y * stride, (y + 1) * stride);
		const prev = y ? out.subarray((y - 1) * stride, y * stride) : null;
		for (let i = 0; i < stride; i++) {
			const x = raw[p++];
			const a = i >= bpp ? row[i - bpp] : 0;
			const up = prev ? prev[i] : 0;
			const c = prev && i >= bpp ? prev[i - bpp] : 0;
			row[i] = filter === 0 ? x : filter === 1 ? (x + a) & 255 : filter === 2 ? (x + up) & 255 : filter === 3 ? (x + ((a + up) >> 1)) & 255 : (x + paeth(a, up, c)) & 255;
		}
	}
	return { width, height, bpp, data: out };
}

const all = (act: string) => true;
const base = { sarah: false, working: false, crouched: false, moving: false, firing: false, reloading: false, has: all };

test("weapon families stay on the sheets they were drawn for", () => {
	assert.equal(combatWeapon("revolver"), "pistol");
	assert.equal(combatWeapon("carbine"), "rifle");
	assert.equal(combatWeapon("scatter"), "rifle");
	assert.equal(combatWeapon("knife"), "knife");
	assert.equal(combatWeapon("axe"), "other");
	assert.equal(combatWeapon("pickaxe"), "other");
	assert.equal(combatWeapon(undefined), "unarmed");
	assert.equal(playerCombatPose({ ...base, family: "axe", firing: true, moving: true }), null);
	assert.equal(playerCombatPose({ ...base, family: undefined, moving: true }), null);
	assert.equal(playerCombatPose({ ...base, family: "carbine", sarah: true, firing: true }), null);
	assert.equal(playerCombatPose({ ...base, family: "carbine", working: true, firing: true }), null);
});

test("player pose follows equipped weapon, crouch, reload and fire", () => {
	const pose = (patch: Partial<Parameters<typeof playerCombatPose>[0]>) => playerCombatPose({ ...base, family: "carbine", ...patch });
	assert.equal(pose({})?.act, "rifle-aim");
	assert.equal(pose({ moving: true })?.act, "rifle-walk");
	assert.equal(pose({ moving: true })?.combatCell, false);
	assert.equal(pose({ firing: true })?.act, "rifle-fire");
	assert.equal(pose({ firing: true })?.frames, "gunfire");
	assert.equal(pose({ reloading: true })?.act, "rifle-reload");
	assert.equal(pose({ crouched: true })?.act, "rifle-crouch");
	assert.equal(pose({ crouched: true })?.nativeCrouch, true);
	assert.equal(pose({ crouched: true })?.scaleFrom, "rifle-aim");
	assert.equal(pose({ crouched: true, firing: true })?.act, "rifle-crouch-fire");
	assert.equal(pose({ family: "revolver" })?.act, "pistol-aim");
	assert.equal(pose({ family: "revolver", moving: true })?.act, "pistol-walk");
	assert.equal(pose({ family: "revolver", firing: true })?.act, "pistol-fire");
	assert.equal(pose({ family: "revolver", reloading: true })?.act, "pistol-reload");
	assert.equal(pose({ family: "revolver", crouched: true, firing: true })?.act, "pistol-crouch-fire");
	assert.equal(pose({ family: "knife" })?.act, "knife-ready");
	assert.equal(pose({ family: "knife", moving: true })?.act, "knife-walk");
	assert.equal(pose({ family: "knife", firing: true })?.act, "knife-atk");
	assert.equal(pose({ family: "knife", crouched: true, firing: true })?.act, "knife-crouch-atk");
	assert.equal(pose({ family: "knife", reloading: true })?.act, "knife-ready");
});

test("missing sheets fall back instead of inventing a pose", () => {
	const has = (act: string) => act === "pistol-aim" || act === "rifle-aim";
	assert.equal(playerCombatPose({ ...base, family: "revolver", firing: true, has })?.act, "pistol-aim");
	assert.equal(playerCombatPose({ ...base, family: "carbine", moving: true, has }), null);
	assert.equal(playerCombatPose({ ...base, family: "knife", has: () => false }), null);
	const squashed = playerCombatPose({ ...base, family: "revolver", crouched: true, has });
	assert.equal(squashed?.act, "pistol-aim");
	assert.equal(squashed?.nativeCrouch, false);
});

test("fire, reload and walk frames stay inside the sheet and use the live gun timing", () => {
	assert.equal(gunFireFrame(0.48, 4), 0);
	assert.equal(gunFireFrame(0.48 - 0.05, 4), 1);
	assert.equal(gunFireFrame(0.48 - 0.14, 4), 3);
	assert.equal(gunFireFrame(0, 4), 3);
	const fire: PlayerPose = { act: "pistol-fire", combatCell: true, frames: "gunfire", nativeCrouch: false };
	assert.equal(poseFrameIndex(fire, { cols: 4, anim: 0, swingLeft: 0.48, swingFull: 0.48, reloadLeft: 0, nowMs: 0 }), 0);
	const knife: PlayerPose = { act: "knife-atk", combatCell: true, frames: "spread", nativeCrouch: false };
	assert.equal(poseFrameIndex(knife, { cols: 4, anim: 0, swingLeft: 0.61, swingFull: 0.61, reloadLeft: 0, nowMs: 0 }), 0);
	assert.equal(poseFrameIndex(knife, { cols: 4, anim: 0, swingLeft: 0, swingFull: 0.61, reloadLeft: 0, nowMs: 0 }), 3);
	const reload: PlayerPose = { act: "rifle-reload", combatCell: true, frames: "spread", nativeCrouch: false };
	assert.equal(poseFrameIndex(reload, { cols: 4, anim: 0, swingLeft: 0, swingFull: 0.48, reloadLeft: RELOAD_SEC, nowMs: 0 }), 0);
	assert.equal(poseFrameIndex(reload, { cols: 4, anim: 0, swingLeft: 0, swingFull: 0.48, reloadLeft: 0, nowMs: 0 }), 3);
	const walk: PlayerPose = { act: "rifle-walk", combatCell: false, frames: "walk", nativeCrouch: false };
	const seen = new Set<number>();
	for (let anim = 0; anim < 11 * 14; anim += 11) seen.add(poseFrameIndex(walk, { cols: 14, anim, swingLeft: 0, swingFull: 0.48, reloadLeft: 0, nowMs: 0 }));
	assert.equal(seen.size, 14);
	assert.equal(spreadFrame(0, 4), 0);
	assert.equal(spreadFrame(0.99, 4), 3);
});

test("facing rows: 6-row NE..NW and 8-row S..SE, bandits keep north and south", () => {
	assert.deepEqual([5, 6, 7, 1, 2, 3].map((d) => facingRow(d, 6)), [0, 1, 2, 3, 4, 5]);
	assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map((d) => facingRow(d, 8)), [0, 1, 2, 3, 4, 5, 6, 7]);
	assert.equal(keepCardinalFacing("v2/bandit-armor-pistol-walk"), true);
	assert.equal(keepCardinalFacing("v2/bandit-armor-rifle-fire"), true);
	assert.equal(keepCardinalFacing("v2/bandit-armor-walk"), false);
	assert.equal(keepCardinalFacing("pl/rifle-walk"), false);
	assert.equal(keepCardinalFacing("v2/player-rifle-aim"), false);
	assert.equal(banditWalkBob("v2/bandit-armor-walk"), true);
	assert.equal(banditWalkBob("v2/bandit-armor-pistol-walk"), true);
	assert.equal(banditWalkBob("v2/bandit-armor-rifle-fire"), false);
	assert.equal(banditWalkBob("v2/player-rifle-walk"), false);
});

test("plate raiders use pistol, rifle or knife; everyone else keeps their old sheet", () => {
	assert.equal(armorWeaponOf(0), "rifle");
	assert.equal(armorWeaponOf(1), "pistol");
	assert.equal(armorWeaponOf(2), "knife");
	assert.equal(armorWeaponOf(-1), "pistol");
	const has = (n: string) => n.startsWith("v2/bandit-armor-");
	const pose = (id: number, patch: Partial<Parameters<typeof banditArmorPose>[0]>) => banditArmorPose({ variant: "armor", hollow: false, kind: "bandit", id, moving: false, attacking: false, has, ...patch });
	assert.equal(pose(0, { attacking: true })?.name, "v2/bandit-armor-rifle-fire");
	assert.equal(pose(0, { moving: true }), null);
	assert.equal(pose(0, {})?.name, "v2/bandit-armor-rifle-aim");
	assert.equal(pose(1, { moving: true })?.name, "v2/bandit-armor-pistol-walk");
	assert.equal(pose(1, { attacking: true }), null);
	assert.equal(pose(2, { attacking: true })?.name, "v2/bandit-armor-axe");
	assert.equal(pose(2, { moving: true })?.name, "v2/bandit-armor-knife-walk");
	assert.equal(banditArmorPose({ variant: "scout", hollow: false, kind: "bandit", id: 1, moving: true, attacking: true, has }), null);
	assert.equal(banditArmorPose({ variant: "armor", hollow: true, kind: "bandit", id: 1, moving: true, attacking: false, has }), null);
	assert.equal(banditArmorPose({ variant: "armor", hollow: false, kind: "wolf", id: 1, moving: true, attacking: false, has }), null);
	for (const id of [0, 1, 2]) for (const moving of [false, true]) for (const attacking of [false, true]) {
		const got = pose(id, { moving, attacking });
		assert.equal(got?.name.includes("crouch") ?? false, false);
		assert.equal(got?.name.startsWith("v2/player-") ?? false, false);
	}
});

test("spotting a hostile in the wild opens turn-based combat", () => {
	assert.equal(hostileNotices("hostile", false, 40, 190, false), true);
	assert.equal(hostileNotices("hostile", true, 40, 190, false), false);
	assert.equal(hostileNotices("hostile", false, 40, 190, true), false);
	assert.equal(hostileNotices("timid", false, 40, 190, false), false);
	assert.equal(hostileNotices("hostile", false, 190, 190, false), false);
	const open = { enabled: true, suppressed: false, inSafeZone: false, inside: false, playing: true, hasPlayer: true, hasWorld: true, mounted: false, hostileAggroNearby: true };
	assert.equal(shouldOpenTurnCombat(open), true);
	assert.equal(shouldOpenTurnCombat({ ...open, hostileAggroNearby: false }), false);
	assert.equal(shouldOpenTurnCombat({ ...open, inSafeZone: true }), false);
	assert.equal(shouldOpenTurnCombat({ ...open, inside: true }), false);
	assert.equal(shouldOpenTurnCombat({ ...open, mounted: true }), false);
	assert.equal(shouldOpenTurnCombat({ ...open, enabled: false }), false);
	assert.equal(shouldOpenTurnCombat({ ...open, suppressed: true }), false);
	assert.equal(shouldOpenTurnCombat({ ...open, playing: false }), false);
});

test("accepted sheets match their grids and none of the cells are blank", () => {
	const root = new URL("../../public/game/v2/", import.meta.url);
	const expectGrid = (name: string, kind: "walk88" | "player132" | "bandit132") => {
		const { width, height } = pngSize(new URL(`${name}.png`, root).pathname);
		const grid = sheetGrid(width, height);
		assert.ok(grid, name);
		assert.equal(grid.kind, kind, name);
		assert.equal(blitRowCount(width, height, grid.cols), grid.rows, name);
		const scale = kind === "walk88" ? 1 : 1.5;
		assert.equal(scaledCols(width, scale), grid.cols, name);
		if (kind === "walk88") assert.equal(scaledCols(width, 1.5), null, `${name} must not be treated as a 132px sheet`);
		if (kind !== "walk88") assert.notEqual(scaledCols(width, 1), grid.cols, `${name} needs the 1.5 cell scale`);
		const img = decodeRgba(new URL(`${name}.png`, root).pathname);
		const cw = Math.floor(width / grid.cols), ch = Math.floor(height / grid.rows);
		for (let row = 0; row < grid.rows; row++) for (let col = 0; col < grid.cols; col++) {
			let n = 0;
			for (let y = 0; y < ch && n < 40; y += 2) for (let x = 0; x < cw && n < 40; x += 2) {
				const i = ((row * ch + y) * width + col * cw + x) * img.bpp;
				const a = img.bpp === 4 ? img.data[i + 3] : 255;
				if (a > 40) n++;
			}
			assert.ok(n >= 40, `${name} row ${row} col ${col} is blank`);
		}
	};
	for (const n of PLAYER_WALK) expectGrid(n, "walk88");
	for (const n of PLAYER_COMBAT) expectGrid(n, "player132");
	for (const n of BANDIT) expectGrid(n, "bandit132");
	assert.equal(sheetGrid(pngSize(new URL("player-walk.png", root).pathname).width, pngSize(new URL("player-walk.png", root).pathname).height)?.kind, "walk88");
	const fire = pngSize(new URL("player-pistol-fire.png", root).pathname);
	assert.equal(createHash("sha256").update(fire.bytes).digest("hex"), PASS2_PISTOL_FIRE);
	assert.notEqual(PASS2_PISTOL_FIRE, PASS1_KICK_FIRE);
	for (const n of [...PLAYER_COMBAT, ...BANDIT]) assert.equal(ART_SCALED.has(`v2/${n}`), true, n);
	for (const n of PLAYER_WALK) assert.equal(ART_SCALED.has(`v2/${n}`), false, n);
	assert.equal(ART_SCALED.has("v2/player-walk"), false);
	assert.equal(ART_SCALED.has("v2/player-rifle-aim"), true);
	const listed = JSON.parse(readFileSync(new URL("optional.json", root), "utf8")) as string[];
	for (const n of [...PLAYER_WALK, ...PLAYER_COMBAT.filter((x) => !["player-rifle-aim", "player-rifle-fire", "player-pistol-aim"].includes(x)), ...BANDIT]) {
		assert.equal(listed.includes(`v2/${n}`), true, n);
	}
});
