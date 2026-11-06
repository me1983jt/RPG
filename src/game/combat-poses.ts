/** Accepted combat sheets wired onto actions the game already plays.
 * A missing combination returns null so the caller keeps its current art.
 * Sarah is not routed here. Civilians and non-armor bandits are not either.
 * There is no prone sheet and no pass-1 pistol-fire (that file has a kick). */

export type CombatWeapon = "unarmed" | "knife" | "pistol" | "rifle" | "other";

export function combatWeapon(family: string | undefined | null): CombatWeapon {
	if (family === "knife") return "knife";
	if (family === "revolver") return "pistol";
	if (family === "carbine" || family === "scatter") return "rifle";
	if (!family || family === "fist") return "unarmed";
	return "other";
}

export type PoseFrames = "walk" | "hold" | "gunfire" | "spread" | "breathe";

export interface PlayerPose {
	act: string;
	/** 132×186 combat cell. Weapon walks stay on the 88×124 grid. */
	combatCell: boolean;
	frames: PoseFrames;
	/** The art is already kneeling, so the engine must not squash it again. */
	nativeCrouch: boolean;
	/** Standing sheet whose figure height sizes a kneeling cell. */
	scaleFrom?: string;
}

/** Same window the live rifle-fire pose already uses. */
export const GUN_SWING_SEC = 0.48;
export const GUN_FRAME_MS = 45;
/** Four reload frames, long enough to read, without changing the AP cost. */
export const RELOAD_SEC = 0.36;

export function gunFireFrame(swingLeft: number, cols: number, frameMs = GUN_FRAME_MS): number {
	const n = Math.max(1, cols | 0);
	return Math.max(0, Math.min(n - 1, Math.floor((GUN_SWING_SEC - swingLeft) * 1000 / frameMs)));
}

export function spreadFrame(progress: number, cols: number): number {
	const n = Math.max(1, cols | 0);
	const u = Math.max(0, Math.min(0.999, progress));
	return Math.min(n - 1, Math.floor(u * n));
}

export function poseFrameIndex(pose: PlayerPose, opts: { cols: number; anim: number; swingLeft: number; swingFull: number; reloadLeft: number; nowMs: number }): number {
	const cols = Math.max(1, opts.cols | 0);
	if (pose.frames === "walk") return Math.floor(opts.anim / 11) % cols;
	if (pose.frames === "hold") return 0;
	if (pose.frames === "gunfire") return gunFireFrame(opts.swingLeft, cols);
	if (pose.frames === "spread") {
		const reload = pose.act.endsWith("reload");
		const full = reload ? RELOAD_SEC : opts.swingFull || GUN_SWING_SEC;
		const left = reload ? opts.reloadLeft : opts.swingLeft;
		return spreadFrame(full <= 0 ? 1 : 1 - left / full, cols);
	}
	if (pose.frames === "breathe") return Math.floor(opts.nowMs / 180) % cols;
	return 0;
}

export function playerCombatPose(input: {
	family: string | undefined | null;
	sarah: boolean;
	working: boolean;
	crouched: boolean;
	moving: boolean;
	firing: boolean;
	reloading: boolean;
	has: (act: string) => boolean;
}): PlayerPose | null {
	if (input.sarah || input.working) return null;
	const weapon = combatWeapon(input.family);
	if (weapon === "unarmed" || weapon === "other") return null;
	const has = input.has;
	const standing = (act: string, frames: PoseFrames): PlayerPose => ({ act, frames, combatCell: frames !== "walk", nativeCrouch: false });
	const kneeling = (act: string, frames: PoseFrames, scaleFrom: string): PlayerPose => ({ act, frames, combatCell: true, nativeCrouch: true, scaleFrom });
	const kneelHold = (): PlayerPose | null => {
		if (weapon === "pistol" && has("pistol-crouch")) return kneeling("pistol-crouch", "breathe", "pistol-aim");
		if (weapon === "rifle" && has("rifle-crouch")) return kneeling("rifle-crouch", "breathe", "rifle-aim");
		if (weapon === "knife" && has("knife-crouch")) return kneeling("knife-crouch", "breathe", "knife-ready");
		return null;
	};

	if (input.firing) {
		if (input.crouched) {
			if (weapon === "pistol" && has("pistol-crouch-fire")) return kneeling("pistol-crouch-fire", "gunfire", "pistol-aim");
			if (weapon === "rifle" && has("rifle-crouch-fire")) return kneeling("rifle-crouch-fire", "gunfire", "rifle-aim");
			if (weapon === "knife" && has("knife-crouch-atk")) return kneeling("knife-crouch-atk", "spread", "knife-ready");
		}
		if (weapon === "pistol" && has("pistol-fire")) return standing("pistol-fire", "gunfire");
		if (weapon === "pistol" && has("pistol-aim")) return standing("pistol-aim", "hold");
		if (weapon === "rifle" && has("rifle-fire")) return standing("rifle-fire", "gunfire");
		if (weapon === "knife" && has("knife-atk")) return standing("knife-atk", "spread");
		if (input.crouched) return kneelHold();
		return null;
	}
	if (input.reloading) {
		if (weapon === "pistol" && has("pistol-reload")) return standing("pistol-reload", "spread");
		if (weapon === "rifle" && has("rifle-reload")) return standing("rifle-reload", "spread");
	}
	if (input.crouched) {
		const kneel = kneelHold();
		if (kneel) return kneel;
	}
	if (input.moving) {
		if (weapon === "pistol" && has("pistol-walk")) return standing("pistol-walk", "walk");
		if (weapon === "rifle" && has("rifle-walk")) return standing("rifle-walk", "walk");
		if (weapon === "knife" && has("knife-walk")) return standing("knife-walk", "walk");
		return null;
	}
	if (weapon === "pistol" && has("pistol-aim")) return standing("pistol-aim", "hold");
	if (weapon === "rifle" && has("rifle-aim")) return standing("rifle-aim", "hold");
	if (weapon === "knife" && has("knife-ready")) return standing("knife-ready", "hold");
	return null;
}

export type ArmorWeapon = "rifle" | "pistol" | "knife";

/** Stable weapon for a plate raider. Other bandits and civilians are not assigned one. */
export function armorWeaponOf(id: number): ArmorWeapon {
	const n = Math.abs(id | 0) % 3;
	return n === 0 ? "rifle" : n === 1 ? "pistol" : "knife";
}

export interface BanditPose {
	name: string;
	mode: "fire" | "hold" | "walk";
}

/** Plate raiders only. Missing sheets return null so gun-atk / the plain walk stay. */
export function banditArmorPose(input: {
	variant: string | undefined;
	hollow: boolean;
	kind: string | undefined;
	id: number;
	moving: boolean;
	attacking: boolean;
	has: (name: string) => boolean;
}): BanditPose | null {
	if (input.hollow || input.kind !== "bandit" || input.variant !== "armor") return null;
	const weapon = armorWeaponOf(input.id);
	const has = input.has;
	if (input.attacking) {
		if (weapon === "rifle" && has("v2/bandit-armor-rifle-fire")) return { name: "v2/bandit-armor-rifle-fire", mode: "fire" };
		if (weapon === "knife" && has("v2/bandit-armor-axe")) return { name: "v2/bandit-armor-axe", mode: "fire" };
		return null;
	}
	if (!input.moving && weapon === "rifle" && has("v2/bandit-armor-rifle-aim")) return { name: "v2/bandit-armor-rifle-aim", mode: "hold" };
	if (weapon === "pistol" && has("v2/bandit-armor-pistol-walk")) return { name: "v2/bandit-armor-pistol-walk", mode: "walk" };
	if (weapon === "knife" && has("v2/bandit-armor-knife-walk")) return { name: "v2/bandit-armor-knife-walk", mode: "walk" };
	return null;
}

/** Weapon sheets share the plain armor walk's measured height. */
export function banditArmorBase(name: string): string | null {
	return /^v2\/bandit-armor-(?:pistol-walk|knife-walk|rifle-aim|rifle-fire|pistol-crouch|rifle-crouch)$/.test(name) ? "v2/bandit-armor" : null;
}

/** New 8-row armor weapon sheets include real south and north rows.
 * Older bandit walks keep the diagonal stand-in they already shipped with. */
export function keepCardinalFacing(name: string): boolean {
	return /^v2\/bandit-armor-(?:pistol-walk|knife-walk|rifle-aim|rifle-fire|pistol-crouch|rifle-crouch)$/.test(name);
}

export function banditWalkBob(name: string): boolean {
	return /^v2\/(?:bandit-[a-z]+|hollowed)-walk$/.test(name) || /^v2\/bandit-armor-(?:pistol|knife)-walk$/.test(name);
}

/** Row count after the 88×124-aspect check blit already applies. Default folk sheets are 8 rows. */
export function blitRowCount(width: number, height: number, cols: number, defaultRows = 8): number {
	if (!width || !height || !cols) return defaultRows;
	const g = Math.round(height / (width / cols * 124 / 88));
	return defaultRows === 8 && (g === 6 || g === 4) ? g : defaultRows;
}

export function sheetGrid(width: number, height: number): { cols: number; rows: number; cellW: number; cellH: number; kind: "walk88" | "player132" | "bandit132" } | null {
	if (width % 88 === 0 && height % 124 === 0 && height / 124 === 6) return { cols: width / 88, rows: 6, cellW: 88, cellH: 124, kind: "walk88" };
	if (width % 132 === 0 && height % 186 === 0) {
		const rows = height / 186;
		const cols = width / 132;
		if (rows === 6) return { cols, rows, cellW: 132, cellH: 186, kind: "player132" };
		if (rows === 8) return { cols, rows, cellW: 132, cellH: 186, kind: "bandit132" };
	}
	return null;
}

/** Columns sheetCols() returns once artScale is 1 (88 px) or 1.5 (132 px). */
export function scaledCols(width: number, artScale: number): number | null {
	const cw = 88 * (artScale || 1);
	if (width % cw === 0 && width >= cw) {
		const c = width / cw;
		if (c >= 1 && c <= 32) return c;
	}
	return null;
}

/** A hostile that has not noticed you yet, outside a safe place. */
export function hostileNotices(temper: string, aggro: boolean, dist: number, notice: number, inSafeZone: boolean): boolean {
	return temper === "hostile" && !aggro && dist < notice && !inSafeZone;
}

/** Turn-based combat opens when a noticed hostile is close, in the wild, and the mode is on. */
export function shouldOpenTurnCombat(opts: {
	enabled: boolean;
	suppressed: boolean;
	inSafeZone: boolean;
	inside: boolean;
	playing: boolean;
	hasPlayer: boolean;
	hasWorld: boolean;
	mounted: boolean;
	hostileAggroNearby: boolean;
}): boolean {
	return opts.enabled && !opts.suppressed && !opts.inSafeZone && !opts.inside && opts.playing && opts.hasPlayer && opts.hasWorld && !opts.mounted && opts.hostileAggroNearby;
}
