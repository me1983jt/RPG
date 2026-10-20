import { i as __toESM } from "../_runtime.mjs";
import { d as require_react_dom, q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as MessageCircle, c as Hammer, d as Columns3, f as BookOpen, i as Minus, l as Flame, m as Axe, n as ScrollText, o as Map$1, p as Backpack, r as Plus, s as House, u as DoorOpen } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CFZY_-qN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
var WM_TERRAIN = [
	"WWWWWWWWWWWW",
	"WWWWWTWWWWWW",
	"WWWWWRWWWWFF",
	"FWWWWRWWVFTF",
	"FFTRRRWVVRRF",
	"FFFFRTRTWWFF",
	"WFFFFRWVFFWW",
	"WWWTRRRVTFWW",
	"WWWWWWWVWWWW"
];
var WM_HOURS = {
	R: .6,
	T: .6,
	F: 1.2,
	W: 2,
	V: 2.5
};
var WM_LOCS = [
	{
		id: "farm",
		name: "Harmony · Cambridge Road",
		q: 5,
		r: 5,
		map: 0,
		blurb: "The farm, Lowelltown road and Jack's."
	},
	{
		id: "lowell",
		name: "Lowelltown Woods",
		q: 2,
		r: 4,
		map: 3,
		blurb: "Spruce and old logging roads."
	},
	{
		id: "skow",
		name: "Skowhegan",
		q: 8,
		r: 7,
		map: 2,
		blurb: "Dead streetlights and one bridge."
	},
	{
		id: "kennebec",
		name: "The Kennebec",
		q: 7,
		r: 5,
		map: 4,
		blurb: "Wide water, a single crossing."
	},
	{
		id: "north",
		name: "North Woods · The Grok's woods",
		q: 5,
		r: 1,
		map: 1,
		blurb: "Chain of Ponds and deep timber."
	},
	{
		id: "raiders",
		name: "Raider Country",
		q: 10,
		r: 3,
		map: 5,
		blurb: "Camps along the ridge. Stay off the skyline."
	},
	{
		id: "bunker",
		name: "The Bunker",
		q: 3,
		r: 7,
		map: 6,
		blurb: "A hatch under the birches."
	}
];
var terrainAt = (q, r) => WM_TERRAIN[r]?.[q] ?? "W";
var hexKey = (q, r) => `${q},${r}`;
function hexCenter(q, r) {
	const s = 50;
	return {
		x: s * Math.sqrt(3) * (q + .5 * (r & 1)) + s * Math.sqrt(3) / 2 + 10,
		y: s * 1.5 * r + s + 10
	};
}
var WM_W = Math.ceil(50 * Math.sqrt(3) * 12.5 + 20);
function hexNeighbors(q, r) {
	return (r & 1 ? [
		[1, 0],
		[-1, 0],
		[0, -1],
		[1, -1],
		[0, 1],
		[1, 1]
	] : [
		[1, 0],
		[-1, 0],
		[-1, -1],
		[0, -1],
		[-1, 1],
		[0, 1]
	]).map(([dq, dr]) => [q + dq, r + dr]).filter(([a, b]) => a >= 0 && b >= 0 && a < 12 && b < 9);
}
function hexAt(x, y) {
	let best = null, bd = 1e9;
	for (let r = 0; r < 9; r++) for (let q = 0; q < 12; q++) {
		const c = hexCenter(q, r);
		const d = (c.x - x) ** 2 + (c.y - y) ** 2;
		if (d < bd) {
			bd = d;
			best = [q, r];
		}
	}
	return bd <= 2500 ? best : null;
}
/** Cheapest hours path (Dijkstra). bike halves road and field. */
function hexPath(from, to, bike) {
	const cost = (q, r) => {
		const t = terrainAt(q, r);
		const h = WM_HOURS[t] ?? 2;
		return bike && (t === "R" || t === "T" || t === "F") ? h * .5 : h;
	};
	const dist = /* @__PURE__ */ new Map([[hexKey(...from), 0]]), prev = /* @__PURE__ */ new Map();
	const open = [[
		0,
		from[0],
		from[1]
	]];
	while (open.length) {
		open.sort((a, b) => a[0] - b[0]);
		const [d, q, r] = open.shift();
		if (q === to[0] && r === to[1]) break;
		for (const [nq, nr] of hexNeighbors(q, r)) {
			const nd = d + cost(nq, nr), k = hexKey(nq, nr);
			if (nd < (dist.get(k) ?? 1e9)) {
				dist.set(k, nd);
				prev.set(k, hexKey(q, r));
				open.push([
					nd,
					nq,
					nr
				]);
			}
		}
	}
	const out = [];
	let k = hexKey(...to);
	if (!prev.has(k) && k !== hexKey(...from)) return [];
	while (k !== hexKey(...from)) {
		const [q, r] = k.split(",").map(Number);
		out.unshift([q, r]);
		k = prev.get(k);
	}
	return out;
}
var hexHours = (q, r, bike) => {
	const t = terrainAt(q, r);
	const h = WM_HOURS[t] ?? 2;
	return bike && (t === "R" || t === "T" || t === "F") ? h * .5 : h;
};
var locAt = (q, r) => WM_LOCS.find((l) => l.q === q && l.r === r) ?? null;
var locOfMap = (map) => WM_LOCS.find((l) => l.map === map) ?? WM_LOCS[0];
var HAIRS = [
	{
		id: "black",
		label: "Black",
		color: "#201c18"
	},
	{
		id: "brown",
		label: "Brown",
		color: "#56341e"
	},
	{
		id: "gray",
		label: "Gray",
		color: "#a8a49c"
	},
	{
		id: "auburn",
		label: "Auburn",
		color: "#842c20"
	}
];
var COAT_PICKS = [
	{
		id: "",
		label: "Shirt"
	},
	{
		id: "canvas",
		label: "Canvas"
	},
	{
		id: "waxed",
		label: "Waxed"
	}
];
var HAT_PICKS = [
	{
		id: "",
		label: "Bare"
	},
	{
		id: "toque",
		label: "Toque"
	},
	{
		id: "huntcap",
		label: "Cap"
	}
];
var LOOK_RGB = {
	wool: [
		140,
		98,
		66
	],
	spruce: [
		70,
		104,
		72
	],
	linen: [
		206,
		192,
		160
	],
	soot: [
		66,
		68,
		74
	]
};
var HAIR_RGB = {
	black: [
		32,
		26,
		22
	],
	brown: [
		86,
		52,
		30
	],
	gray: [
		168,
		164,
		156
	],
	auburn: [
		132,
		52,
		32
	]
};
var PANTS_RGB = {
	wool: [
		58,
		46,
		38
	],
	spruce: [
		44,
		54,
		44
	],
	linen: [
		96,
		82,
		66
	],
	soot: [
		34,
		34,
		38
	]
};
function mix(r, g, b, target, amt, minScale = .45) {
	const lum = r * .3 + g * .59 + b * .11;
	const tl = target[0] * .3 + target[1] * .59 + target[2] * .11 || 1;
	const scale = Math.max(minScale, Math.min(1.35, lum / tl));
	let nr = target[0] * scale;
	let ng = target[1] * scale;
	let nb = target[2] * scale;
	const top = Math.max(nr, ng, nb);
	if (top > 220) {
		const k = 220 / top;
		nr *= k;
		ng *= k;
		nb *= k;
	}
	return [
		r + (nr - r) * amt,
		g + (ng - g) * amt,
		b + (nb - b) * amt
	];
}
function dyeBodySheet(data, cols, look, hair, rows = 8, opts = {}) {
	const px = data.data;
	const cw = data.width / cols;
	const ch = data.height / rows;
	const shirt = opts.shirt ?? LOOK_RGB[look] ?? LOOK_RGB.wool;
	const hairC = HAIR_RGB[hair] ?? HAIR_RGB.black;
	const pants = opts.pants ?? PANTS_RGB[look] ?? PANTS_RGB.wool;
	const hatC = opts.hat ?? null;
	for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
		const x0 = col * cw;
		const y0 = row * ch;
		let top = ch;
		let bottom = 0;
		let n = 0;
		for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
			if (px[((y0 + y) * data.width + (x0 + x)) * 4 + 3] < 40) continue;
			n++;
			if (y < top) top = y;
			if (y > bottom) bottom = y;
		}
		if (n < 20) continue;
		const bh = Math.max(1, bottom - top);
		for (let y = top; y <= bottom; y++) for (let x = 0; x < cw; x++) {
			const i = ((y0 + y) * data.width + (x0 + x)) * 4;
			if ((px[i + 3] ?? 0) < 40) continue;
			const r = px[i] ?? 0;
			const g = px[i + 1] ?? 0;
			const b = px[i + 2] ?? 0;
			const lum = r * .3 + g * .59 + b * .11;
			const by = (y - top) / bh;
			const skin = r > 145 && r > g + 28 && g > b - 8 && by < .42 && lum > 70;
			if (skin) continue;
			let next = null;
			if (hatC && by < .1 && !skin) next = mix(r, g, b, hatC, .92, .75);
			else if (by < .17 && lum < 120) next = mix(r, g, b, hairC, .88);
			else if (by > .2 && by < .54 && lum > 22 && lum < 210) next = mix(r, g, b, shirt, opts.shirt ? .9 : .8, opts.shirt ? .72 : .45);
			else if (by > .56 && by < .86 && lum > 14 && lum < 170) next = mix(r, g, b, pants, .72);
			if (!next) continue;
			px[i] = next[0];
			px[i + 1] = next[1];
			px[i + 2] = next[2];
		}
	}
}
var GEAR = {
	carbine: {
		id: "carbine",
		name: "Worn carbine",
		kind: "weapon",
		family: "carbine",
		quality: "poor",
		atk: 5,
		def: 0,
		heal: 0,
		note: "Poor bore. It still points."
	},
	"carbine-std": {
		id: "carbine-std",
		name: "Service carbine",
		kind: "weapon",
		family: "carbine",
		quality: "standard",
		atk: 8,
		def: 0,
		heal: 0,
		note: "A straight barrel and a working sight."
	},
	"carbine-good": {
		id: "carbine-good",
		name: "Good carbine",
		kind: "weapon",
		family: "carbine",
		quality: "good",
		atk: 11,
		def: 0,
		heal: 0,
		note: "Kept oiled. It reaches."
	},
	knife: {
		id: "knife",
		name: "Field knife",
		kind: "weapon",
		family: "knife",
		quality: "poor",
		atk: 3,
		def: 0,
		heal: 0,
		note: "A short, nicked point."
	},
	"knife-std": {
		id: "knife-std",
		name: "Belt knife",
		kind: "weapon",
		family: "knife",
		quality: "standard",
		atk: 5,
		def: 0,
		heal: 0,
		note: "Honed. Fast in the hand."
	},
	"knife-good": {
		id: "knife-good",
		name: "Fine knife",
		kind: "weapon",
		family: "knife",
		quality: "good",
		atk: 7,
		def: 0,
		heal: 0,
		note: "Good steel. It bites clean."
	},
	skin: {
		id: "skin",
		name: "Skinning knife",
		kind: "weapon",
		family: "knife",
		quality: "poor",
		atk: 4,
		def: 0,
		heal: 0,
		note: "Thin steel for a quiet hand."
	},
	hatchet: {
		id: "hatchet",
		name: "Camp axe",
		kind: "weapon",
		family: "axe",
		quality: "poor",
		atk: 6,
		def: 0,
		heal: 0,
		note: "A large axe. Poor edge, but it fells a tree."
	},
	"hatchet-std": {
		id: "hatchet-std",
		name: "Broad axe",
		kind: "weapon",
		family: "axe",
		quality: "standard",
		atk: 9,
		def: 0,
		heal: 0,
		note: "A wide head. It splits timber."
	},
	"hatchet-good": {
		id: "hatchet-good",
		name: "Great axe",
		kind: "weapon",
		family: "axe",
		quality: "good",
		atk: 12,
		def: 0,
		heal: 0,
		note: "Good steel. Trees and fights both end."
	},
	pick: {
		id: "pick",
		name: "Camp pick",
		kind: "weapon",
		family: "pickaxe",
		quality: "poor",
		atk: 4,
		def: 0,
		heal: 0,
		note: "A poor pickaxe. It breaks rock."
	},
	"pick-std": {
		id: "pick-std",
		name: "Mining pick",
		kind: "weapon",
		family: "pickaxe",
		quality: "standard",
		atk: 6,
		def: 0,
		heal: 0,
		note: "A sound pickaxe."
	},
	"pick-good": {
		id: "pick-good",
		name: "Good pick",
		kind: "weapon",
		family: "pickaxe",
		quality: "good",
		atk: 8,
		def: 0,
		heal: 0,
		note: "Good steel. Rock splits."
	},
	revolver: {
		id: "revolver",
		name: "Worn revolver",
		kind: "weapon",
		family: "revolver",
		quality: "poor",
		atk: 4,
		def: 0,
		heal: 0,
		note: "A short barrel. Close work."
	},
	scatter: {
		id: "scatter",
		name: "Scattergun",
		kind: "weapon",
		family: "scatter",
		quality: "poor",
		atk: 9,
		def: 0,
		heal: 0,
		note: "Both barrels, if you are near."
	},
	pry: {
		id: "pry",
		name: "Pry bar",
		kind: "weapon",
		family: "pry",
		quality: "poor",
		atk: 5,
		def: 0,
		heal: 0,
		note: "Iron bar. Doors, skulls, and nails."
	},
	patch: {
		id: "patch",
		name: "Patch coat",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 1,
		heal: 0,
		note: "Wool, mended twice."
	},
	linen: {
		id: "linen",
		name: "Linen coat",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Light. Little stop in it."
	},
	soft: {
		id: "soft",
		name: "Soft cap",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "head",
		note: "Close wool. Not a brim."
	},
	woolcap: {
		id: "woolcap",
		name: "Wool cap",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "head",
		note: "Knit wool for the head."
	},
	felt: {
		id: "felt",
		name: "Felt hat",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "head",
		note: "A brim. It turns the rain."
	},
	ironhat: {
		id: "ironhat",
		name: "Stove helm",
		kind: "coat",
		family: "coat",
		quality: "good",
		atk: 0,
		def: 3,
		heal: 0,
		slot: "head",
		note: "A pot lid laced for a helm."
	},
	shirt: {
		id: "shirt",
		name: "Canvas shirt",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "chest",
		note: "A work shirt. Little armor."
	},
	wool: {
		id: "wool",
		name: "Wool coat",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 2,
		heal: 0,
		note: "Heavy cloth. Poor stitching."
	},
	"coat-std": {
		id: "coat-std",
		name: "Trail coat",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 3,
		heal: 0,
		note: "Sound wool. It turns a blade."
	},
	"coat-good": {
		id: "coat-good",
		name: "Mackinaw",
		kind: "coat",
		family: "coat",
		quality: "good",
		atk: 0,
		def: 5,
		heal: 0,
		note: "Good cloth. Thick through the chest."
	},
	vest: {
		id: "vest",
		name: "Canvas vest",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 2,
		heal: 0,
		note: "Stitched canvas over the shirt."
	},
	quilt: {
		id: "quilt",
		name: "Quilted jacket",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 4,
		heal: 0,
		note: "Layered cloth. It dulls a cut."
	},
	plate: {
		id: "plate",
		name: "Scrap plate",
		kind: "coat",
		family: "coat",
		quality: "good",
		atk: 0,
		def: 6,
		heal: 0,
		note: "Stove iron laced over wool."
	},
	bandage: {
		id: "bandage",
		name: "Rag bandage",
		kind: "supply",
		family: "bandage",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 12,
		note: "Use it from the pack."
	},
	"bandage-std": {
		id: "bandage-std",
		name: "Field bandage",
		kind: "supply",
		family: "bandage",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 22,
		note: "Cleaner wrap. Use it from the pack."
	},
	"bandage-good": {
		id: "bandage-good",
		name: "Clean bandage",
		kind: "supply",
		family: "bandage",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 34,
		note: "Boiled cloth. Use it from the pack."
	},
	shells: {
		id: "shells",
		name: "Loose shells",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "One shot each. A gun will not fire without them."
	},
	levergun: {
		id: "levergun",
		name: "Bob's lever gun",
		kind: "weapon",
		family: "carbine",
		quality: "standard",
		atk: 10,
		def: 0,
		heal: 0,
		note: "One round at a time through the gate: the slowest reload of any long gun. For a careful shot, not a crowd. Adults only."
	},
	dalekey: {
		id: "dalekey",
		name: "Dale's key ring",
		kind: "supply",
		family: "trade",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Opens the back office at the Ervin Fuel station."
	},
	roycap: {
		id: "roycap",
		name: "Roy's cap",
		kind: "supply",
		family: "trade",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Blaze orange, frozen stiff. Bob will want it."
	},
	spirits: {
		id: "spirits",
		name: "Still spirits",
		kind: "supply",
		family: "bandage",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 12,
		note: "Clear and mean. Cleans a wound. Use it from the pack."
	},
	"bag-sack": {
		id: "bag-sack",
		name: "Sewn sack",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Use it to stitch it into your pack: one more row."
	},
	"bag-hide": {
		id: "bag-hide",
		name: "Hide rucksack",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Use it to swap your pack up: two more rows than the start."
	},
	"bag-frame": {
		id: "bag-frame",
		name: "Trapper's frame bag",
		kind: "supply",
		family: "supply",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Use it to swap your pack up: three more rows than the start."
	},
	junk: {
		id: "junk",
		name: "Scrap parts",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Bolts, springs and sheet tin off a wreck. Workbench stock."
	},
	wire: {
		id: "wire",
		name: "Twist of wire",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "For a latch."
	},
	lockpick: {
		id: "lockpick",
		name: "Bent pick",
		kind: "supply",
		family: "lockpick",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "A poor pick. It may slip."
	},
	"lockpick-std": {
		id: "lockpick-std",
		name: "Lockpick",
		kind: "supply",
		family: "lockpick",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "A proper pick."
	},
	"lockpick-good": {
		id: "lockpick-good",
		name: "Fine pick",
		kind: "supply",
		family: "lockpick",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Good steel. It finds the pins."
	},
	pork: {
		id: "pork",
		name: "Salt pork",
		kind: "supply",
		family: "trade",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		worth: 2,
		note: "Salted. Tap to trade it for iron."
	},
	maple: {
		id: "maple",
		name: "Maple tin",
		kind: "supply",
		family: "trade",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		worth: 3,
		note: "Last of a sugar camp. Tap to trade it."
	},
	matches: {
		id: "matches",
		name: "Match tin",
		kind: "supply",
		family: "trade",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		worth: 1,
		note: "Dry matches. Tap to trade them."
	},
	pelt: {
		id: "pelt",
		name: "Beaver pelt",
		kind: "supply",
		family: "trade",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		worth: 4,
		note: "A winter hide. Tap to trade it."
	},
	oil: {
		id: "oil",
		name: "Lamp oil",
		kind: "supply",
		family: "trade",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		worth: 2,
		note: "A flask for the lamp. Tap to trade it."
	},
	cider: {
		id: "cider",
		name: "Hot cider",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 18,
		note: "A tin cup, still warm. Use it from the pack."
	},
	donut: {
		id: "donut",
		name: "Cider donut",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 12,
		note: "Fried in the farm kitchen. Use it from the pack."
	},
	apple: {
		id: "apple",
		name: "Windfall apple",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 6,
		note: "Cold and sweet. Use it from the pack."
	},
	scoped: {
		id: "scoped",
		name: "Scoped carbine",
		kind: "weapon",
		family: "carbine",
		quality: "rare",
		atk: 14,
		def: 0,
		heal: 0,
		note: "Bunker glass on the barrel. It reaches past a plain carbine."
	},
	rig: {
		id: "rig",
		name: "Plate rig",
		kind: "coat",
		family: "coat",
		quality: "rare",
		atk: 0,
		def: 8,
		heal: 0,
		slot: "chest",
		note: "Canvas, pouches, and a plate. Bunker stock."
	},
	trousers: {
		id: "trousers",
		name: "Wool trousers",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "legs",
		note: "Heavy wool from the knee down."
	},
	chaps: {
		id: "chaps",
		name: "Leather chaps",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 2,
		heal: 0,
		slot: "legs",
		note: "Hide over the legs."
	},
	gloves: {
		id: "gloves",
		name: "Wool gloves",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "hands",
		note: "Knit. A poor stop for a bite."
	},
	bracers: {
		id: "bracers",
		name: "Leather bracers",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 2,
		heal: 0,
		slot: "hands",
		note: "Cuffs that take a cut."
	},
	boots: {
		id: "boots",
		name: "Work boots",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "feet",
		note: "Cracked leather, dry inside."
	},
	"boots-std": {
		id: "boots-std",
		name: "Lumber boots",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 2,
		heal: 0,
		slot: "feet",
		note: "Steel shank, felt liners. Good in snow."
	},
	scraphelm: {
		id: "scraphelm",
		name: "Scrap helm",
		kind: "coat",
		family: "coat",
		quality: "good",
		atk: 0,
		def: 3,
		heal: 0,
		slot: "head",
		note: "Stove plate hammered into a helm."
	},
	toque: {
		id: "toque",
		name: "Knit toque",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "head",
		note: "Wool pulled over the ears."
	},
	huntcap: {
		id: "huntcap",
		name: "Hunting cap",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "head",
		note: "Blaze orange, ear flaps. Other hunters see you first."
	},
	hockey: {
		id: "hockey",
		name: "Hockey mask",
		kind: "coat",
		family: "coat",
		quality: "good",
		atk: 0,
		def: 3,
		heal: 0,
		slot: "head",
		note: "A pond goalie's mask. The eyes are cut out."
	},
	canvas: {
		id: "canvas",
		name: "Canvas coat",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 2,
		heal: 0,
		slot: "chest",
		note: "Work canvas. It turns the wind."
	},
	waxed: {
		id: "waxed",
		name: "Waxed coat",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 3,
		heal: 0,
		slot: "chest",
		note: "Oiled cloth. Rain runs off it."
	},
	warden: {
		id: "warden",
		name: "Warden's vest",
		kind: "coat",
		family: "coat",
		quality: "rare",
		atk: 0,
		def: 6,
		heal: 0,
		slot: "chest",
		note: "A game warden's armored vest, the patch half torn off."
	},
	shinguard: {
		id: "shinguard",
		name: "Shin guards",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 2,
		heal: 0,
		slot: "legs",
		note: "Hockey pads strapped over the shins."
	},
	snowshoes: {
		id: "snowshoes",
		name: "Snowshoes",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 1,
		heal: 0,
		slot: "feet",
		note: "Ash frames and rawhide. Faster over snow."
	},
	steeltoes: {
		id: "steeltoes",
		name: "Steel-toe boots",
		kind: "coat",
		family: "coat",
		quality: "good",
		atk: 0,
		def: 3,
		heal: 0,
		slot: "feet",
		note: "Mill boots. The toes are capped."
	},
	backpack: {
		id: "backpack",
		name: "Canvas pack",
		kind: "coat",
		family: "coat",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		slot: "back",
		note: "A camp pack. One more row in the pack while you wear it."
	},
	sling: {
		id: "sling",
		name: "Moose-hide sling",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		slot: "back",
		note: "Carries a long gun steady. +1 attack with rifles and shotguns."
	},
	winchester: {
		id: "winchester",
		name: "Wyndham lever gun",
		kind: "weapon",
		family: "carbine",
		quality: "rare",
		atk: 12,
		def: 0,
		heal: 0,
		note: "A lever gun from somebody's camp wall. It reaches."
	},
	shotgun: {
		id: "shotgun",
		name: "Pump shotgun",
		kind: "weapon",
		family: "scatter",
		quality: "good",
		atk: 11,
		def: 0,
		heal: 0,
		note: "Twelve gauge. Close, and it ends a fight."
	},
	hudson: {
		id: "hudson",
		name: "Hudson Bay axe",
		kind: "weapon",
		family: "axe",
		quality: "good",
		atk: 10,
		def: 0,
		heal: 0,
		note: "A camp axe with a long bit."
	},
	syrup: {
		id: "syrup",
		name: "Maple syrup",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "A jar from the sugar bush. Use it: stamina back all at once."
	},
	smokedfish: {
		id: "smokedfish",
		name: "Smoked fish",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 14,
		note: "Lake trout, smoked. Use it from the pack."
	},
	dandelion: {
		id: "dandelion",
		name: "Dandelion tea",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 6,
		note: "Bitter tea. Clears a cold and a bleed, and warms you through."
	},
	radio: {
		id: "radio",
		name: "Hand-crank radio",
		kind: "supply",
		family: "supply",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Tuned to Jack's channel. Carry it and he calls before a raid."
	},
	binoculars: {
		id: "binoculars",
		name: "Binoculars",
		kind: "supply",
		family: "supply",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Brass and glass. Carry them: +1 Perception, and you see farther."
	},
	lantern: {
		id: "lantern",
		name: "Lantern",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "A barn lantern. Carry it: a much bigger ring of light at night."
	},
	antlers: {
		id: "antlers",
		name: "Antlers",
		kind: "supply",
		family: "trade",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 0,
		worth: 6,
		note: "A rack off a bull moose. Tap to trade it."
	},
	sapbucket: {
		id: "sapbucket",
		name: "Sap bucket",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Full of maple sap. Boil it at a cookfire for syrup."
	},
	packframe: {
		id: "packframe",
		name: "Pack frame",
		kind: "coat",
		family: "coat",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		slot: "back",
		note: "Ash frame and straps. Two more rows in the pack while you wear it."
	},
	trauma: {
		id: "trauma",
		name: "Trauma kit",
		kind: "supply",
		family: "bandage",
		quality: "rare",
		atk: 0,
		def: 0,
		heal: 52,
		note: "Sealed. Use it from the pack. Not road medicine."
	},
	kit: {
		id: "kit",
		name: "Healing kit",
		kind: "supply",
		family: "bandage",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 30,
		note: "Needle, cloth, and a boiled wrap. Use it from the pack."
	},
	jerky: {
		id: "jerky",
		name: "Smoked jerky",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 16,
		note: "Dry meat. Use it from the pack."
	},
	stew: {
		id: "stew",
		name: "Camp stew",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 26,
		note: "Hot, if you eat it now. Use it from the pack."
	},
	meat: {
		id: "meat",
		name: "Raw meat",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Smoke it or stew it. Eating it raw is a poor idea."
	},
	hide: {
		id: "hide",
		name: "Green hide",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Still wet. Cut it for cloth."
	},
	cloth: {
		id: "cloth",
		name: "Twist of cloth",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Rags. Bandages start here."
	},
	bomb: {
		id: "bomb",
		name: "Pipe bomb",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Use it from the pack. It bursts on raiders nearby."
	},
	snare: {
		id: "snare",
		name: "Wire snare",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Use it to set a snare where you stand. Check it the next day."
	},
	grokclaw: {
		id: "grokclaw",
		name: "Grok claw",
		kind: "supply",
		family: "trade",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 0,
		worth: 20,
		note: "A claw off The Grok, long as a hay knife. Proof, and worth a lot to the right trader."
	},
	medicine: {
		id: "medicine",
		name: "Medicine",
		kind: "supply",
		family: "bandage",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 30,
		note: "Hospital pills and syrup. Use it from the pack."
	},
	bone: {
		id: "bone",
		name: "Bone",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Field-dressed bone. For handles and hooks, or the trader."
	},
	steeltrap: {
		id: "steeltrap",
		name: "Steel trap",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "A forged leghold trap. Set it from the pack; fox and coyote."
	},
	berries: {
		id: "berries",
		name: "Wild blueberries",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 3,
		note: "Lowbush blueberries off the ledges. Eat them from the pack."
	},
	mushrooms: {
		id: "mushrooms",
		name: "Chanterelles",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 4,
		note: "Golden, smells like apricots. Eat them from the pack."
	},
	chowder: {
		id: "chowder",
		name: "Fish chowder",
		kind: "supply",
		family: "supply",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 10,
		note: "Steady: stamina back faster."
	},
	venisonsteak: {
		id: "venisonsteak",
		name: "Venison steak",
		kind: "supply",
		family: "supply",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 14,
		note: "Strong: +2 attack for a while."
	},
	pie: {
		id: "pie",
		name: "Apple pie",
		kind: "supply",
		family: "supply",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 6,
		note: "Share it around. Everyone likes you a bit more."
	},
	coffee: {
		id: "coffee",
		name: "Chicory coffee",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Awake: sleep drains slower."
	},
	tonic: {
		id: "tonic",
		name: "Spruce tonic",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 2,
		note: "Spruce tips steeped strong. Cures a cold."
	},
	trout: {
		id: "trout",
		name: "Brook trout",
		kind: "supply",
		family: "supply",
		quality: "good",
		atk: 0,
		def: 0,
		heal: 8,
		note: "Red-bellied. River fish."
	},
	greens: {
		id: "greens",
		name: "Winter greens",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 8,
		note: "Greenhouse kale and spinach. Use it from the pack."
	},
	water: {
		id: "water",
		name: "Jug of water",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 4,
		note: "Clean rain-barrel water. Use it from the pack."
	},
	gas: {
		id: "gas",
		name: "Gas, quart can",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Motor bicycle gas. A can runs you a good way down the road."
	},
	carburetor: {
		id: "carburetor",
		name: "Carburetor",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "A little float carb. Bike part."
	},
	chain: {
		id: "chain",
		name: "Bike chain",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "#41 roller chain. Bike part."
	},
	engine: {
		id: "engine",
		name: "Two-stroke engine",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Heavy. Bike part."
	},
	gastank: {
		id: "gastank",
		name: "Gas tank",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Dented, doesn't leak. Bike part."
	},
	sparkplug: {
		id: "sparkplug",
		name: "Spark plug",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Still in the box. Bike part."
	},
	tire: {
		id: "tire",
		name: "Bicycle tire",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Balloon tire. Bike part."
	},
	fuel: {
		id: "fuel",
		name: "Fuel can",
		kind: "supply",
		family: "supply",
		quality: "standard",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Use it to ready the tractor for the next pass down the lane."
	},
	baitpack: {
		id: "baitpack",
		name: "Bait tin",
		kind: "supply",
		family: "supply",
		quality: "poor",
		atk: 0,
		def: 0,
		heal: 0,
		note: "Use it to drop a cache where you stand. Raiders come for it."
	}
};
var ROLES = [
	{
		id: "hunter",
		title: "Hunter",
		blurb: "A poor carbine, a patched coat, and six shells.",
		hp: 40,
		atk: 2,
		weapon: "carbine",
		coat: "patch",
		bag: [
			{
				id: "carbine",
				qty: 1
			},
			{
				id: "boots",
				qty: 1
			},
			{
				id: "patch",
				qty: 1
			},
			{
				id: "woolcap",
				qty: 1
			},
			{
				id: "trousers",
				qty: 1
			},
			{
				id: "shells",
				qty: 6
			},
			{
				id: "pelt",
				qty: 1
			},
			{
				id: "lockpick",
				qty: 1
			}
		]
	},
	{
		id: "medic",
		title: "Medic",
		blurb: "A poor knife, linen, and rag bandages.",
		hp: 42,
		atk: 2,
		weapon: "knife",
		coat: "linen",
		bag: [
			{
				id: "knife",
				qty: 1
			},
			{
				id: "boots",
				qty: 1
			},
			{
				id: "linen",
				qty: 1
			},
			{
				id: "gloves",
				qty: 1
			},
			{
				id: "bandage",
				qty: 3
			},
			{
				id: "pork",
				qty: 1
			},
			{
				id: "lockpick",
				qty: 1
			}
		]
	},
	{
		id: "thief",
		title: "Prowler",
		blurb: "A poor skinning knife, a shirt, a soft cap, and picks.",
		hp: 36,
		atk: 2,
		weapon: "skin",
		coat: "shirt",
		bag: [
			{
				id: "skin",
				qty: 1
			},
			{
				id: "boots",
				qty: 1
			},
			{
				id: "shirt",
				qty: 1
			},
			{
				id: "soft",
				qty: 1
			},
			{
				id: "wire",
				qty: 1
			},
			{
				id: "matches",
				qty: 2
			},
			{
				id: "lockpick",
				qty: 3
			}
		]
	},
	{
		id: "fighter",
		title: "Camp hand",
		blurb: "A poor camp axe and a heavy wool coat.",
		hp: 52,
		atk: 3,
		weapon: "hatchet",
		coat: "wool",
		bag: [
			{
				id: "hatchet",
				qty: 1
			},
			{
				id: "boots",
				qty: 1
			},
			{
				id: "wool",
				qty: 1
			},
			{
				id: "woolcap",
				qty: 1
			},
			{
				id: "gloves",
				qty: 1
			},
			{
				id: "pick",
				qty: 1
			},
			{
				id: "oil",
				qty: 1
			},
			{
				id: "lockpick",
				qty: 1
			}
		]
	}
];
function armorSlot(g) {
	if (!g || g.kind !== "coat") return null;
	return g.slot ?? "chest";
}
var CRAFT = [
	{
		id: "shells",
		item: "shells",
		qty: 4,
		iron: 3,
		wood: 0,
		need: [],
		name: "Hand-load shells",
		blurb: "Four shells from scrap lead."
	},
	{
		id: "jerky",
		item: "jerky",
		qty: 2,
		iron: 0,
		wood: 1,
		need: [{
			id: "meat",
			qty: 1
		}],
		name: "Smoke jerky",
		blurb: "Dry a cut of meat into two strips."
	},
	{
		id: "stew",
		item: "stew",
		qty: 1,
		iron: 0,
		wood: 1,
		need: [{
			id: "meat",
			qty: 1
		}, {
			id: "apple",
			qty: 1
		}],
		name: "Camp stew",
		blurb: "Meat and a windfall apple in the pot."
	},
	{
		id: "bandage",
		item: "bandage",
		qty: 1,
		iron: 0,
		wood: 0,
		need: [{
			id: "cloth",
			qty: 2
		}],
		name: "Rag bandage",
		blurb: "Tear cloth into a wrap."
	},
	{
		id: "kit",
		item: "kit",
		qty: 1,
		iron: 1,
		wood: 0,
		need: [{
			id: "bandage",
			qty: 2
		}, {
			id: "cloth",
			qty: 1
		}],
		name: "Healing kit",
		blurb: "Bandages, cloth, and a needle."
	},
	{
		id: "syrup",
		item: "syrup",
		qty: 1,
		iron: 0,
		wood: 2,
		need: [{
			id: "sapbucket",
			qty: 1
		}],
		name: "Boil syrup",
		blurb: "Boil a bucket of sap down to a jar."
	},
	{
		id: "cloth",
		item: "cloth",
		qty: 2,
		iron: 0,
		wood: 0,
		need: [{
			id: "hide",
			qty: 1
		}],
		name: "Cut cloth",
		blurb: "A hide becomes two twists of cloth."
	},
	{
		id: "steeltrap",
		item: "steeltrap",
		qty: 1,
		iron: 6,
		wood: 0,
		need: [{
			id: "wire",
			qty: 1
		}],
		name: "Steel trap (forge)",
		blurb: "A leghold trap for fox and coyote.",
		bench: true,
		tier: 1
	},
	{
		id: "boneknife",
		item: "knife-std",
		qty: 1,
		iron: 2,
		wood: 0,
		need: [{
			id: "bone",
			qty: 2
		}],
		name: "Bone-handled knife (forge)",
		blurb: "A forged blade on a bone grip.",
		bench: true,
		tier: 1
	},
	{
		id: "refine",
		item: "gas",
		qty: 3,
		iron: 2,
		wood: 0,
		need: [{
			id: "fuel",
			qty: 1
		}],
		name: "Refine fuel to gas (machine shop)",
		blurb: "Strain and cut a fuel can into three quarts of bike gas.",
		bench: true,
		tier: 2
	},
	{
		id: "snare",
		item: "snare",
		qty: 2,
		iron: 1,
		wood: 0,
		need: [{
			id: "wire",
			qty: 1
		}],
		name: "Wire snares (bench)",
		blurb: "Two snares from a hank of wire.",
		bench: true
	},
	{
		id: "snowshoes",
		item: "snowshoes",
		qty: 1,
		iron: 0,
		wood: 2,
		need: [{
			id: "hide",
			qty: 1
		}],
		name: "Snowshoes (bench)",
		blurb: "Bent ash and rawhide lacing.",
		bench: true
	},
	{
		id: "lantern",
		item: "lantern",
		qty: 1,
		iron: 4,
		wood: 0,
		need: [{
			id: "oil",
			qty: 1
		}, {
			id: "wire",
			qty: 1
		}],
		name: "Barn lantern (bench)",
		blurb: "Tin, a wick and lamp oil.",
		bench: true
	},
	{
		id: "carbine-std",
		item: "carbine-std",
		qty: 1,
		iron: 6,
		wood: 0,
		need: [{
			id: "carbine",
			qty: 1
		}, {
			id: "wire",
			qty: 1
		}],
		name: "Rebarrel the carbine (bench)",
		blurb: "Worn carbine to a service carbine.",
		bench: true
	},
	{
		id: "carbine-good",
		item: "carbine-good",
		qty: 1,
		iron: 10,
		wood: 0,
		need: [{
			id: "carbine-std",
			qty: 1
		}, {
			id: "oil",
			qty: 1
		}],
		name: "Tune the action (bench)",
		blurb: "Service carbine to a good carbine.",
		bench: true
	},
	{
		id: "scoped",
		item: "scoped",
		qty: 1,
		iron: 12,
		wood: 0,
		need: [{
			id: "carbine-good",
			qty: 1
		}, {
			id: "binoculars",
			qty: 1
		}],
		name: "Mount a scope (bench)",
		blurb: "Glass off a pair of binoculars.",
		bench: true
	}
];
function roleKit(id) {
	return ROLES.find((r) => r.id === id) ?? ROLES[3];
}
var LOOKS = [
	{
		id: "wool",
		label: "Wool",
		hint: "Brown camp coat"
	},
	{
		id: "spruce",
		label: "Spruce",
		hint: "Green hunter cloth"
	},
	{
		id: "linen",
		label: "Linen",
		hint: "Pale medic cloth"
	},
	{
		id: "soot",
		label: "Soot",
		hint: "Dark prowler coat"
	}
];
function defaultLook(id) {
	if (id === "hunter") return "spruce";
	if (id === "medic") return "linen";
	if (id === "thief") return "soot";
	return "wool";
}
function roleStats(id) {
	if (id === "fighter") return {
		strength: 3,
		vigor: 2,
		endurance: 2,
		intellect: 1,
		perception: 1,
		luck: 1
	};
	if (id === "medic") return {
		strength: 1,
		vigor: 2,
		endurance: 1,
		intellect: 2,
		perception: 2,
		luck: 1
	};
	if (id === "thief") return {
		strength: 1,
		vigor: 1,
		endurance: 2,
		intellect: 3,
		perception: 2,
		luck: 2
	};
	return {
		strength: 1,
		vigor: 1,
		endurance: 2,
		intellect: 2,
		perception: 3,
		luck: 2
	};
}
var TRAITS = [
	{
		id: "eye",
		title: "Keen eye",
		blurb: "Better with a rifle. Worse up close."
	},
	{
		id: "hide",
		title: "Thick hide",
		blurb: "More life. Stamina comes back slower."
	},
	{
		id: "step",
		title: "Light step",
		blurb: "Surer locks. Less life."
	},
	{
		id: "camp",
		title: "Camp strong",
		blurb: "Better with an axe or a pick. Worse with a rifle."
	}
];
function traitOf(id) {
	return TRAITS.find((t) => t.id === id) ?? null;
}
var DROP_POOL = [
	"gas",
	"hatchet",
	"knife",
	"carbine",
	"bandage",
	"wool",
	"lockpick",
	"pick",
	"shells",
	"revolver",
	"scatter",
	"pry",
	"vest",
	"pork",
	"maple",
	"matches",
	"pelt",
	"oil",
	"hatchet-std",
	"knife-std",
	"carbine-std",
	"bandage-std",
	"coat-std",
	"lockpick-std",
	"pick-std",
	"quilt",
	"hatchet-good",
	"knife-good",
	"carbine-good",
	"bandage-good",
	"coat-good",
	"lockpick-good",
	"pick-good",
	"plate",
	"boots",
	"boots-std",
	"packframe",
	"scraphelm",
	"toque",
	"huntcap",
	"hockey",
	"canvas",
	"waxed",
	"shinguard",
	"snowshoes",
	"steeltoes",
	"backpack",
	"sling",
	"shotgun",
	"hudson",
	"smokedfish",
	"dandelion",
	"sapbucket",
	"lantern"
];
function rollDrop(elite, luck = 1) {
	const lift = Math.max(0, luck - 1) * .04;
	const roll = Math.random();
	const goodAt = (elite ? .16 : .06) + lift;
	const standardAt = (elite ? .46 : .26) + lift * 1.4;
	let quality = null;
	if (roll < goodAt) quality = "good";
	else if (roll < standardAt) quality = "standard";
	else if (roll < (elite ? .85 : .62)) quality = "poor";
	if (!quality) return null;
	const pool = DROP_POOL.map((id) => GEAR[id]).filter((g) => g.quality === quality);
	return pool[Math.random() * pool.length | 0]?.id ?? null;
}
var ctx = null;
function unlockAudio() {
	if (typeof window === "undefined") return;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return;
	if (!ctx) ctx = new AC();
	if (ctx.state === "suspended") ctx.resume();
}
function tone(freq, dur, type, gain, delay = 0) {
	if (!ctx) return;
	const t = ctx.currentTime + delay;
	const osc = ctx.createOscillator();
	const g = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t);
	g.gain.setValueAtTime(gain, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	osc.connect(g);
	g.connect(ctx.destination);
	osc.start(t);
	osc.stop(t + dur + .02);
}
/**
* v11.2 sound + music hooks. Real files are optional: public/game/audio/manifest.json lists the ones that exist
* (written by scripts/gen-optional-art.mjs), e.g. "sfx/shoot", "music/day". Only listed files are ever requested,
* so missing audio never 404s; sfx fall back to the built-in tones and music stays silent.
*/
var audioFiles = /* @__PURE__ */ new Set();
var manifestTried = false;
function loadManifest() {
	if (manifestTried || typeof window === "undefined") return;
	manifestTried = true;
	fetch("/game/audio/manifest.json").then((r) => r.ok ? r.json() : []).then((list) => {
		if (Array.isArray(list)) {
			for (const n of list) if (typeof n === "string") audioFiles.add(n);
		}
		if (wantTrack) setMusic(wantTrack, true);
	}).catch(() => {});
}
if (typeof window !== "undefined") loadManifest();
var sfxCache = /* @__PURE__ */ new Map();
var musicEl = null;
var musicTrack = "";
var wantTrack = "";
var musicVol = .35;
function audioState() {
	return {
		files: [...audioFiles],
		track: wantTrack,
		playing: musicTrack
	};
}
/** Ask for a music track ("menu" | "day" | "night" | "raid"). Plays /game/audio/music/<track>.mp3 if it exists. */
function setMusic(track, force = false) {
	if (track === wantTrack && !force) return;
	wantTrack = track;
	const key = `music/${track}`;
	if (!audioFiles.has(key)) {
		if (musicEl) {
			musicEl.pause();
			musicEl = null;
			musicTrack = "";
		}
		return;
	}
	if (musicTrack === track && musicEl) return;
	try {
		if (musicEl) musicEl.pause();
		const el = new Audio(`/game/audio/${key}.mp3`);
		el.loop = true;
		el.volume = musicVol;
		el.play().catch(() => {});
		musicEl = el;
		musicTrack = track;
	} catch {
		musicEl = null;
	}
}
function playFile(name) {
	const key = `sfx/${name}`;
	if (!audioFiles.has(key)) return false;
	try {
		let base = sfxCache.get(key);
		if (!base) {
			base = new Audio(`/game/audio/${key}.mp3`);
			sfxCache.set(key, base);
		}
		const a = base.cloneNode();
		a.volume = .6;
		a.play().catch(() => {});
		return true;
	} catch {
		return false;
	}
}
function sfx(name) {
	unlockAudio();
	if (playFile(name)) return;
	if (!ctx) return;
	switch (name) {
		case "hit":
			tone(180, .08, "square", .05);
			tone(90, .12, "triangle", .04, .02);
			break;
		case "hurt":
			tone(140, .14, "sawtooth", .04);
			break;
		case "build":
			tone(220, .1, "triangle", .05);
			tone(330, .14, "triangle", .04, .08);
			break;
		case "talk":
			tone(420, .05, "sine", .03);
			break;
		case "level":
			tone(392, .1, "triangle", .05);
			tone(523, .16, "triangle", .05, .09);
			break;
		case "gather":
			tone(300, .06, "square", .03);
			break;
		case "die":
			tone(160, .25, "sawtooth", .05);
			tone(80, .35, "triangle", .04, .1);
			break;
		case "click":
			tone(520, .04, "sine", .03);
			break;
		case "chop":
			tone(98, .07, "square", .06);
			tone(62, .14, "triangle", .05, .03);
			break;
		case "mine":
			tone(720, .04, "square", .04);
			tone(210, .1, "triangle", .05, .02);
			break;
		case "shoot":
			tone(140, .05, "sawtooth", .06);
			tone(60, .16, "triangle", .05, .01);
	}
}
var POSE = {
	"hero": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
			[7, 0]
		],
		"cycle": [
			[
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			]
		]
	},
	"villager": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-adele": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 1],
			[1, 0],
			[0, 1],
			[3, 0],
			[4, 0],
			[5, 1],
			[0, 1],
			[7, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-bram": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-cal": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 1],
			[1, 1],
			[2, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
			[7, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-cyndal": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 1],
			[0, 1],
			[0, 1],
			[4, 1],
			[4, 1],
			[4, 1],
			[0, 1],
			[0, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-emile": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-etta": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-gus": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-holt": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-ivo": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-justin": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 1],
			[1, 1],
			[2, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
			[7, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-loki": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[0, 0],
			[0, 0],
			[0, 0],
			[0, 0],
			[0, 0],
			[0, 0],
			[0, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-mae": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 1],
			[1, 0],
			[2, 0],
			[3, 0],
			[4, 0],
			[5, 1],
			[6, 0],
			[7, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-mira": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 1],
			[0, 0],
			[7, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-nora": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 1],
			[0, 0],
			[7, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-paul": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-pete": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-rejean": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 2],
			[1, 1],
			[2, 0],
			[3, 2],
			[4, 0],
			[5, 0],
			[6, 0],
			[7, 3]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-ruth": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 1],
			[0, 0],
			[7, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-sarah": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 0],
			[1, 0],
			[0, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[0, 0],
			[7, 0]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-sera": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 1],
			[1, 0],
			[0, 1],
			[3, 0],
			[4, 0],
			[5, 1],
			[0, 1],
			[7, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	},
	"npc-walter": {
		"walk": [
			0,
			1,
			2,
			3,
			4,
			5,
			6,
			7
		],
		"idle": [
			[0, 1],
			[1, 1],
			[2, 0],
			[3, 0],
			[4, 0],
			[5, 0],
			[6, 0],
			[7, 1]
		],
		"cycle": [
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			],
			[
				1,
				2,
				3
			],
			[
				0,
				1,
				2,
				3
			]
		]
	}
};
var SPRITE_FIT = {
	"v2/bandit-armor-walk": .532,
	"v2/bandit-blue-walk": .532,
	"v2/bandit-brute-walk": .54,
	"v2/bandit-gray-walk": .524,
	"v2/bandit-scout-walk": .532,
	"v2/bandit-torch-walk": .516,
	"v2/cyndal-walk": .476,
	"v2/holt-walk": .54,
	"v2/jack-walk": .524,
	"v2/justin-walk": .556,
	"v2/loki-walk": .46,
	"v2/marcel-walk": .532,
	"v2/mira-walk": .5,
	"v2/nora-walk": .472,
	"v2/sarah-walk": .508,
	"boss-fur": .815,
	"boss-holeb": .621,
	"boss-mask": .815,
	"boss-pelletier": .855,
	"boss-grok": .82,
	"boss-saw": .815,
	"boss-warden": .79,
	"coyote": .476,
	"crow": .371,
	"deer": .661,
	"hero-axe": .806,
	"hero-gun": .806,
	"hero-knife": .806,
	"hero-pick": .806,
	"hero": .806,
	"moose": .621,
	"npc-adele": .79,
	"npc-bram": .79,
	"npc-cal": .806,
	"npc-cyndal": .79,
	"npc-emile": .79,
	"npc-etta": .79,
	"npc-gus": .79,
	"npc-holt": .79,
	"npc-ivo": .79,
	"npc-justin": .79,
	"npc-loki": .79,
	"npc-mae": .79,
	"npc-mira": .79,
	"npc-nora": .79,
	"npc-paul": .79,
	"npc-pete": .79,
	"npc-rejean": .79,
	"npc-ruth": .79,
	"npc-sarah": .863,
	"npc-sera": .79,
	"npc-walter": .79,
	"rabbit": .508,
	"raider-armor": .839,
	"raider-atv": .839,
	"raider-blue": .79,
	"raider-brute": .863,
	"raider-gray": .79,
	"raider-jumper": .815,
	"raider-scout": .815,
	"raider-shield": .839,
	"raider-torch": .815,
	"raider": .79,
	"squirrel": .492,
	"villager": .79,
	"wolf": .492
};
function xpNeed(level) {
	return 24 + level * 18;
}
function questText(quest, kills) {
	if (quest <= 0) return "Speak with Mira Pelletier in Lowelltown, west along Cambridge Road.";
	if (quest === 1) return `Put down the Chopping's three bosses: Harland Poulin, René Gallant, Gil Michaud. ${Math.min(kills, 3)} of 3 down.`;
	if (quest === 2) return "The chopping is quiet. Return to Mira Pelletier in Lowelltown.";
	return "The road is open. Holeb still stands to the southeast. Raise a lean-to if you mean to stay.";
}
function objectiveTile(quest) {
	if (quest === 1) return {
		tx: 98,
		ty: 30
	};
	if (quest >= 3) return {
		tx: 102,
		ty: 100
	};
	return {
		tx: 18,
		ty: 22
	};
}
var JACK_SIGNOFF = "The strong endure, but the ready prosper. Jack Ready out.";
/** Quest journal: active quests first, then completed ones. */
function journalEntries(quest, kills, t) {
	const out = [];
	out.push({
		id: "snow",
		title: "First Snow on Cambridge Road",
		done: t.snow >= 3,
		text: t.snow <= 0 ? "Justin is at the Cambridge Road farm. He wants a word before the snow comes in." : t.snow === 1 ? `Bring Justin 3 armloads of wood for the stove. You have ${Math.min(t.wood, 3)} of 3. There is a woodpile by the barn.` : t.snow === 2 ? "Justin has his wood. Go see Sarah at the farm." : "The Cambridge Road farm is your base. You wake on the cot under the eave, and Sarah's kitchen keeps hot cider and cider donuts."
	});
	out.push({
		id: "chopping",
		title: "The Chopping",
		done: quest >= 3,
		text: quest >= 3 ? "The Chopping is cleared. Mira gave you Ada's hatchet." : questText(quest, kills)
	});
	if (t.jackMet || t.bunkerSeen) out.push({
		id: "jack",
		title: "Jack Ready's Bunker",
		done: t.bunkerSeen,
		text: t.bunkerSeen ? "You found the bunker under the birch log. Scopes, armor, and real medical kits." : t.jackTrust > 0 ? "Jack trusts you now. His bunker is a hatch under a birch log in the woods southwest of Attean." : "Jack Ready keeps a stand south of Attean. Trade with him to earn his trust."
	});
	return [...out.filter((e) => !e.done), ...out.filter((e) => e.done)];
}
function npcLine(role, name, quest, ciderGiven = false, t = {
	snow: 3,
	wood: 0,
	jackTrust: 0,
	bunkerSeen: false
}) {
	if (role === "villager") return {
		speaker: "Villager",
		text: "They nod. Nothing to trade, and no news they'd part with.",
		choices: [{
			label: "All right",
			id: "close"
		}]
	};
	const later = {
		etta: "Etta Beaulieu.",
		gus: "Gus Pomerleau.",
		ruth: "Ruth Cyr.",
		emile: "Emile Violette.",
		paul: "Paul Dufour.",
		mae: "Mae Lachance.",
		walter: "Walter Kinney."
	};
	if (later[role]) return {
		speaker: name,
		text: `${later[role]} There will be more to say when the time comes.`,
		choices: [{
			label: "Another time",
			id: "close"
		}]
	};
	if (role === "adele") return {
		speaker: name,
		text: "Adele Roy. I walk the old Canada Road with a pack and not much else. Lowelltown is the last stove before the Chopping. If you see a motor bicycle by the gravel, it is yours to kick over. It drinks no shells.",
		choices: [{
			label: "Walk with me",
			id: "join-adele"
		}, {
			label: "I'll remember",
			id: "close"
		}]
	};
	if (role === "pete") return {
		speaker: name,
		text: "Pete Lagasse. Attean keeps its head down. The road south of here bends toward Holeb. I had a brother who rode a motor bicycle until the chain ate his cuff. Walk it slow through the spruce.",
		choices: [{
			label: "Come up the road with me",
			id: "join-pete",
			check: {
				skill: "speech",
				dc: 42
			}
		}, {
			label: "Noted",
			id: "close"
		}]
	};
	if (role === "nora") return {
		speaker: name,
		text: "Nora Hebert. Holeb's a long porch and a longer winter, dear. Mira Pelletier is my cousin's cousin. She still counts who comes back up the old Canada Road.",
		choices: [{
			label: "I'll tell her you asked",
			id: "close"
		}]
	};
	if (role === "cal") {
		const trusted = t.jackTrust > 0;
		return {
			speaker: name,
			text: trusted ? t.bunkerSeen ? "Good to see you again, friend. Same table, best gear in the county. " + JACK_SIGNOFF : "Good to see you again, friend. Since you trade fair: there's a birch log in the woods southwest of Attean that isn't a log. Lift the hatch and take what keeps you breathing. " + JACK_SIGNOFF : "Jack Ready. Came down from the Saint John with a full pack and a plan. Best gear in the county, fair prices, no haggling. " + JACK_SIGNOFF,
			choices: [
				{
					label: "Ten shells — 10 iron",
					id: "buy-cal-shells"
				},
				{
					label: "Trauma kit — 18 iron",
					id: "buy-cal-wrap"
				},
				{
					label: "Plate rig — 34 iron",
					id: "buy-cal-coat"
				},
				{
					label: "Scoped carbine — 42 iron",
					id: "buy-cal-gun"
				},
				...trusted ? [{
					label: "Hand-crank radio on my channel — 12 iron",
					id: "buy-cal-radio"
				}] : [],
				{
					label: "That's all",
					id: "jack-bye"
				}
			]
		};
	}
	if (role === "warden") {
		if ((t.warden ?? 0) >= 1) return {
			speaker: name,
			text: "\"Road's open for you. Don't make me write it down twice.\" He goes back to watching the tree line.",
			choices: [{
				label: "Move along",
				id: "close"
			}]
		};
		return {
			speaker: name,
			text: "A green coat with the state patch still on it, a rifle across his arms, a pole gate dragged over the gravel. \"Bangor Warden. Nobody comes down to Holeb unchecked. Twelve iron covers the toll, and you keep walking.\"",
			choices: [
				{
					label: (t.scrap ?? 0) >= 12 ? "Pay the toll — 12 iron" : "Pay the toll — 12 iron (you have " + (t.scrap ?? 0) + ")",
					id: "warden-pay"
				},
				{
					label: "Slip past while he's on the radio",
					id: "warden-sneak"
				},
				{
					label: "Take the gate from him",
					id: "warden-fight"
				},
				{
					label: "Turn back",
					id: "close"
				}
			]
		};
	}
	if (role === "rejean") return {
		speaker: name,
		text: "Réjean Leblanc. I came down from the Saint John with what the pack would hold, and I kept the rest stocked. Iron buys from the stall. Six shells are 8. A field bandage is 6. A trail coat is 14. A service carbine is 18. I don't haggle, and I don't walk the woods southwest of Lowelltown. There's a birch log on the ground out there that isn't a log.",
		choices: [
			{
				label: "Six shells — 8 iron",
				id: "buy-shells"
			},
			{
				label: "Field bandage — 6 iron",
				id: "buy-wrap"
			},
			{
				label: "Trail coat — 14 iron",
				id: "buy-coat"
			},
			{
				label: "Service carbine — 18 iron",
				id: "buy-carbine"
			},
			{
				label: "Binoculars — 16 iron",
				id: "buy-binoculars"
			},
			{
				label: "That's all",
				id: "close"
			}
		]
	};
	if (role === "justin") {
		if (t.snow <= 0) return {
			speaker: name,
			text: "Justin. This is our ground on Cambridge Road: the farmhouse, the barn, the orchard, and the sugar maples. First snow is coming in tonight and the stove is down to kindling. Bring me three armloads of wood from the pile by the barn and you've got a place here.",
			choices: [{
				label: "I'll bring the wood",
				id: "snow-accept"
			}, {
				label: "Another time",
				id: "close"
			}]
		};
		if (t.snow === 1) return t.wood >= 3 ? {
			speaker: name,
			text: "That's good dry wood. Stack it by the stove, bark side up.",
			choices: [{
				label: `Hand over the wood (3)`,
				id: "snow-wood"
			}]
		} : {
			speaker: name,
			text: `Three armloads. You have ${t.wood}. The woodpile is by the barn.`,
			choices: [{
				label: "On it",
				id: "close"
			}]
		};
		if (t.snow === 2) return {
			speaker: name,
			text: "Stove's drawing good. Go see Sarah. She runs the kitchen and the press.",
			choices: [{
				label: "I will",
				id: "close"
			}]
		};
		if (t.raidOn) return {
			speaker: name,
			text: "Get back on a post! They ain't done yet.",
			choices: [{
				label: "Going",
				id: "close"
			}]
		};
		if (t.raidReady) return {
			speaker: name,
			text: "Dark's down. If they come tonight I'd rather we pick the hour. Light the yard and we'll hold the farm together.",
			choices: [{
				label: `Start raid night ${t.raidNext ?? 1}`,
				id: "raid-ask"
			}, {
				label: "Not tonight",
				id: "close"
			}]
		};
		return {
			speaker: name,
			text: "The stove stays lit and the cot is yours. Twelve apple trees, two rows. Leave them standing. My kids pick the low limbs, so mind them. Come find me after dark if you want to hold the farm.",
			choices: [{
				label: "I'll leave the rows standing",
				id: "close"
			}, {
				label: "Come hold the orchard",
				id: "join-justin"
			}]
		};
	}
	if (role === "sarah") {
		if (t.snow === 2) return {
			speaker: name,
			text: "You got Justin his wood. Here: hot cider in a tin cup, and cider donuts from the kitchen. The cot under the eave is yours. This farm is your home now. Come back when you're hurt.",
			choices: [{
				label: "Thank you, Sarah",
				id: "snow-done"
			}]
		};
		if (t.snow < 2) return {
			speaker: name,
			text: "Sarah. Justin and I run this place. I've got the kitchen and the cider press, and our two kids underfoot. First snow tonight. Help Justin with the wood, then come see me and we'll warm you up.",
			choices: [{
				label: "I'll help him",
				id: "close"
			}]
		};
		if (!ciderGiven) return {
			speaker: name,
			text: "The press ran this week. Hot cider and cider donuts from these trees. I can put some in your pack.",
			choices: [
				{
					label: "I'll take them",
					id: "cider"
				},
				{
					label: "I'll stand the night with you",
					id: "join-sarah"
				},
				{
					label: "I'll sit a minute",
					id: "close"
				}
			]
		};
		return {
			speaker: name,
			text: "Kitchen fills back up every morning. Leave the two rows standing. They're why the cups stay full.",
			choices: [{
				label: "I will",
				id: "close"
			}, {
				label: "Stand with me if they come",
				id: "join-sarah"
			}]
		};
	}
	if (role === "cyndal") return {
		speaker: name,
		text: "Cyndal. I'm thirteen. Justin's my dad, and Loki's my little brother. I can reach the lower limbs on these two rows without a box. The high ones are Dad's. Raid nights I'm lookout from the loft window. I call the waves, then I help Mom with anyone hurt inside.",
		choices: [{
			label: "I'll leave the high ones",
			id: "close"
		}, {
			label: "Watch from the loft tonight",
			id: "cyndal-lookout"
		}]
	};
	if (role === "loki") return {
		speaker: name,
		text: "Loki. I'm nine. Justin's my dad. I stacked the kindling and fed the hens already. Dad said the press is not a ladder, so I stay in the lane. Why do the apples go brown when you bite them? If they come at night I stay inside with the door barred and bring shells and lanterns to the porch. I don't go out.",
		choices: [{
			label: "Good work on the chores",
			id: "close"
		}, {
			label: "Stay inside if they come",
			id: "loki-safe"
		}]
	};
	if (role === "mira") {
		if (quest <= 0) return {
			speaker: name,
			text: "The Chopping took the old Canada Road east. Six choppers in patched dusters, with lever rifles and single-action revolvers, sitting on Ada Ladd's gravel. Three of them run it: Harland Poulin in the fur coat, René Gallant behind the mask, and Gil Michaud with the saw. Put those three down and the Chopping breaks. Then Lowelltown can pack to Attean again.",
			choices: [
				{
					label: "I'll clear the chopping",
					id: "accept"
				},
				{
					label: "Tell me how they sit",
					id: "mira-brief",
					check: {
						skill: "speech",
						dc: 48
					}
				},
				{
					label: "Not yet",
					id: "close"
				}
			]
		};
		if (quest === 1) return {
			speaker: name,
			text: "Follow the gravel east. Do not cut across the ledge. The Boundary Mountains do not give boots back.",
			choices: [{
				label: "Understood",
				id: "close"
			}]
		};
		if (quest === 2) return {
			speaker: name,
			text: "You came back breathing. This is Ada's hatchet. Ash handle, steel bit. She blazed this road with it. It is sharp. It is not lucky, and it is not holy. Lowelltown can hold a lean-to, if you raise one.",
			choices: [{
				label: "I'll take the hatchet",
				id: "reward"
			}]
		};
		return {
			speaker: name,
			text: "The road is yours to walk. Holeb is a long way southeast, on the pond. The ground west of their huts is clear if Lowelltown feels small. Ada died of cold on the Height of Land. Ordinary cold.",
			choices: [{
				label: "I'll remember",
				id: "close"
			}]
		};
	}
	if (role === "bram") return {
		speaker: name,
		text: "Spruce in the deadfalls, ledge in the loose rock, camp iron in the heaps — stove lids, spikes, axe heads. Ada's rule: a lean-to is where you fall down out of the weather. A stake fence keeps a night honest. A smithy makes more iron. A cookfire dries wool. You warm up because you stood still.",
		choices: [{
			label: "I'll build",
			id: "close"
		}]
	};
	if (role === "sera") return {
		speaker: name,
		text: quest >= 1 ? "Attean keeps its head down. If you are walking past the Chopping, I will come as far as the gravel holds. Stay on it. Ada Ladd blazed it. The ledge eats a straight line." : "Attean keeps its head down. If you are walking to the Chopping, stay on the gravel. Ada Ladd blazed it. The ledge eats a straight line. I am not leaving the stoves until that job is spoken for.",
		choices: quest >= 1 ? [{
			label: "Come as far as the gravel",
			id: "join-sera"
		}, {
			label: "Thanks",
			id: "close"
		}] : [{
			label: "Thanks",
			id: "close"
		}]
	};
	if (role === "holt") return {
		speaker: name,
		text: "I saw lamps at Holeb last month. Some long walk southeast, ayuh. Longer if a chopper with a lever gun wants a word. Ada overnighted there when the Moose River was high.",
		choices: [{
			label: "Walk it with me",
			id: "join-holt",
			check: {
				skill: "speech",
				dc: 46
			}
		}, {
			label: "Noted",
			id: "close"
		}]
	};
	if (quest < 3) return {
		speaker: name,
		text: "Choppers own the middle of the road. I don't give strangers the long talk until that changes. Lowelltown's cook is Mira Pelletier. She still has her sister's hatchet.",
		choices: [{
			label: "Fair",
			id: "close"
		}]
	};
	return {
		speaker: name,
		text: "Mira's word travels, even here. Ada Ladd said the ground west of these huts will take a camp. She was right about the road and wrong about one winter. Raise a lean-to if you mean to stay.",
		choices: [{
			label: "I might",
			id: "close"
		}]
	};
}
function freshQ10() {
	return {
		seed: 0,
		seedLeft: 0,
		ferry: 0,
		planks: false,
		rope: false,
		winch: false,
		dog: 0,
		dogStep: 0,
		radio: 0,
		parts: [
			false,
			false,
			false
		],
		moose: 0,
		bearDone: false,
		stores: 0,
		nextId: 96e3
	};
}
function loadQ10(raw) {
	const base = freshQ10();
	if (!raw || typeof raw !== "object") return base;
	const r = raw;
	return {
		...base,
		...r,
		parts: Array.isArray(r.parts) && r.parts.length === 3 ? r.parts.map(Boolean) : base.parts
	};
}
/** Quest sites on the home map, in world-relative tiles (the engine adds WORLD_OX/OY and finds open ground). */
var Q10_SITES = {
	coop: {
		tx: 88,
		ty: 58,
		name: "Pittsfield co-op"
	},
	coopBins: {
		tx: 90,
		ty: 60,
		name: "Co-op seed bins"
	},
	ferry: {
		tx: 60,
		ty: 4,
		name: "Kennebec ferry landing"
	},
	planks: {
		tx: 14,
		ty: 28,
		name: "Lowelltown sawpile"
	},
	rope: {
		tx: 62,
		ty: 50,
		name: "Attean boathouse"
	},
	winch: {
		tx: 86,
		ty: 40,
		name: "Wrecked log truck"
	},
	part0: {
		tx: 22,
		ty: 16,
		name: "Lowelltown grange hall"
	},
	part1: {
		tx: 54,
		ty: 58,
		name: "Attean fire tower shed"
	},
	part2: {
		tx: 96,
		ty: 94,
		name: "Holeb camp road"
	},
	bog: {
		tx: 46,
		ty: 42,
		name: "Heald Stream bog"
	}
};
/** Where Biscuit's tracks run: a bent line out of the orchard into the spruce, ending where he's holed up. */
var DOG_TRAIL = [
	[42, 20],
	[45, 23],
	[47, 27],
	[46, 31],
	[49, 34],
	[52, 36],
	[55, 35],
	[57, 38]
];
var RADIO_PARTS = [
	"a 6V6 tube in a sock",
	"a coil of copper wire on a spool",
	"a lantern battery that still kicks"
];
var RADIO_SITES = [
	"part0",
	"part1",
	"part2"
];
/** Quest journal entries for the v10 quests (only quests that have started, or are on offer at the farm). */
function q10Journal(q, snowDone) {
	const out = [];
	if (q.seed > 0 || snowDone) out.push({
		id: "seed",
		title: "Seed Run",
		done: q.seed >= 5,
		text: q.seed <= 0 ? "Sarah's been fretting over next year's potatoes. Ask her at the farm." : q.seed === 1 ? "Sarah needs seed potatoes from the old farmers' co-op in Pittsfield before the frost gets into them. Walk down the Pittsfield road." : q.seed === 2 ? `Somebody's camped at the co-op. Clear them out. ${q.seedLeft} left.` : q.seed === 3 ? "The co-op is quiet. Search the seed bins in back." : q.seed === 4 ? "You've got a sack of seed potatoes. Get them back to Sarah before they freeze." : `Sarah has her seed. Next spring's potatoes are in the root cellar, and the kitchen puts up camp stew now. Winter stores: ${q.stores}.`
	});
	if (q.ferry > 0 || snowDone) out.push({
		id: "ferry",
		title: "Kennebec Crossing",
		done: q.ferry >= 3,
		text: q.ferry <= 0 ? "Justin says the old Kennebec ferry could run again. Talk to him." : q.ferry === 1 ? `Fix the old ferry: planks from the Lowelltown sawpile${q.planks ? " (got)" : ""}, rope from the Attean boathouse${q.rope ? " (got)" : ""}, and a winch pawl off the wrecked log truck${q.winch ? " (got)" : ""}.` : q.ferry === 2 ? "You've got planks, rope and the winch part. Take them to the ferry landing on the Kennebec, north of the farm." : "The ferry runs again. Pole across at the landing to reach the north woods, where they say The Grok walks."
	});
	if (q.dog > 0) out.push({
		id: "dog",
		title: "Lost Dog",
		done: q.dog >= 4,
		text: q.dog === 1 ? "Loki's dog Biscuit bolted during the raid. Loki's upset. Go see him at the farm." : q.dog === 2 ? `Follow Biscuit's paw prints out past the orchard into the spruce. Track ${Math.min(q.dogStep + 1, DOG_TRAIL.length)} of ${DOG_TRAIL.length}.` : q.dog === 3 ? "You found Biscuit. Walk him home to Loki." : "Biscuit is home, muddy and pleased with himself. Loki hasn't let go of him since."
	});
	if (q.radio > 0 || snowDone) out.push({
		id: "radio",
		title: "Cyndal's Radio",
		done: q.radio >= 3,
		text: q.radio <= 0 ? "Cyndal's been fiddling with an old set in the loft. Ask her about it." : q.radio === 1 ? `Cyndal needs three radio parts: ${RADIO_PARTS.map((p, i) => `${p}${q.parts[i] ? " (got)" : ""}`).join("; ")}. Look at the Lowelltown grange hall, the Attean fire tower shed and the Holeb camp road.` : q.radio === 2 ? "You've got all three parts. Bring them to Cyndal at the farm." : "The set works. Cyndal can raise Marcel Thibodeau, a trader out of Skowhegan, and he'll run a sled up to the farm."
	});
	if (q.moose > 0 || snowDone) out.push({
		id: "moose",
		title: "Moose Season",
		done: q.moose >= 5,
		text: q.moose <= 0 ? "Justin wants meat in the shed before the snow gets deep. Ask him about a moose." : q.moose === 1 ? "Walk to the Heald Stream bog, south of the farm. A big bull's been feeding there mornings." : q.moose === 2 ? "The bull is in the bog. Take him down." : q.moose === 3 ? "The bull is down and quartered. Haul the meat home to the farm. Keep your eyes open, it's bear country." : q.moose === 4 ? "You're back with the meat. Tell Justin." : `A winter's worth of moose is hanging in the shed and the hide's stretched on the barn wall. Winter stores: ${q.stores}.`
	});
	return out;
}
/** One-line HUD hint for the most pressing v10 quest, or "" when none is mid-way. */
function q10Hud(q) {
	if (q.dog === 1) return "Lost Dog: Loki's dog ran off. Talk to Loki.";
	if (q.dog === 2) return `Lost Dog: follow the paw prints. ${Math.min(q.dogStep + 1, DOG_TRAIL.length)} of ${DOG_TRAIL.length}.`;
	if (q.dog === 3) return "Lost Dog: walk Biscuit home to Loki.";
	if (q.seed >= 1 && q.seed <= 4) return [
		"",
		"Seed Run: walk to the Pittsfield co-op.",
		`Seed Run: clear the co-op. ${q.seedLeft} left.`,
		"Seed Run: search the seed bins.",
		"Seed Run: bring the seed to Sarah."
	][q.seed];
	if (q.moose >= 1 && q.moose <= 4) return [
		"",
		"Moose Season: walk to the Heald Stream bog.",
		"Moose Season: take the bull.",
		"Moose Season: haul the meat home.",
		"Moose Season: tell Justin."
	][q.moose];
	if (q.ferry === 1) return `Kennebec Crossing: planks${q.planks ? " ✓" : ""}, rope${q.rope ? " ✓" : ""}, winch part${q.winch ? " ✓" : ""}.`;
	if (q.ferry === 2) return "Kennebec Crossing: fix the ferry at the landing.";
	if (q.radio === 1) return `Cyndal's Radio: ${q.parts.filter(Boolean).length} of 3 parts.`;
	if (q.radio === 2) return "Cyndal's Radio: bring the parts to Cyndal.";
	return "";
}
/** Extra talk for the family at the farm. Returns a full replacement line, or extra choices to add, or null. */
function q10Talk(role, q, snowDone, raidOn) {
	if (!snowDone || raidOn) return null;
	if (role === "sarah") {
		if (q.seed === 4) return { replace: {
			speaker: "Sarah",
			text: "Oh, you found them! Kennebec russets, and not a one gone soft. I'll lay these down in sand in the root cellar. Come spring we'll have a whole patch behind the barn. And there's stew on. Take some, you earned it.",
			choices: [{
				label: "Glad they're good",
				id: "q10-seed-done"
			}]
		} };
		if (q.seed === 0) return { add: [{
			label: "You look worried, Sarah",
			id: "q10-seed-ask"
		}] };
		return null;
	}
	if (role === "justin") {
		if (q.moose === 4 || q.moose === 3) return { replace: {
			speaker: "Justin",
			text: q.moose === 4 ? "Now that's a moose. Must dress out at six hundred pounds. We'll hang the quarters in the shed and I'll stretch the hide on the barn wall. That's the winter handled, ayuh." : "You got him? Good. Get the meat the rest of the way up to the yard and we'll hang it.",
			choices: q.moose === 4 ? [{
				label: "Hang it up",
				id: "q10-moose-done"
			}] : [{
				label: "Bringing it",
				id: "close"
			}]
		} };
		const add = [];
		if (q.ferry === 0) add.push({
			label: "Anything need doing?",
			id: "q10-ferry-ask"
		});
		if (q.moose === 0) add.push({
			label: "Meat for the winter?",
			id: "q10-moose-ask"
		});
		return add.length ? { add } : null;
	}
	if (role === "loki") {
		if (q.dog === 1) return { replace: {
			speaker: "Loki",
			text: "Biscuit ran off when the shooting started! He went right under the fence and out past the orchard. I'm not allowed to go after him, Dad said. You can follow his paw prints. They're in the mud by the trees. Please?",
			choices: [{
				label: "I'll find him, bud",
				id: "q10-dog-accept"
			}]
		} };
		if (q.dog === 3) return { replace: {
			speaker: "Loki",
			text: "BISCUIT! You found him! He smells like a swamp. Good boy, good boy. Thank you. You can have my maple candy. Don't tell Mom.",
			choices: [{
				label: "Keep him close, bud",
				id: "q10-dog-done"
			}]
		} };
		if (q.dog === 2) return { replace: {
			speaker: "Loki",
			text: "Did you find him yet? Is he cold? His paw prints go out past the orchard toward the big spruce.",
			choices: [{
				label: "Still looking",
				id: "close"
			}]
		} };
		return null;
	}
	if (role === "cyndal") {
		if (q.radio === 2) return { replace: {
			speaker: "Cyndal",
			text: "You got all three! The tube's a 6V6. That's the right one. Hold the lamp... okay. Okay! Listen. That's a man talking. \"...Thibodeau, Skowhegan, anybody on this band...\" He says he trades. He'll come up the road with his sled if we call.",
			choices: [{
				label: "Nice work, Cyndal",
				id: "q10-radio-done"
			}]
		} };
		if (q.radio === 0) return { add: [{
			label: "What's that radio?",
			id: "q10-radio-ask"
		}] };
		if (q.radio >= 3) return { add: [{
			label: "Call Marcel on the radio",
			id: "q10-trader"
		}] };
		return null;
	}
	return null;
}
var Q10_TEXT = {
	seedAsk: {
		speaker: "Sarah",
		text: "It's the seed. We ate last year's potatoes down to nothing, and if there's no seed there's no crop. The old farmers' co-op in Pittsfield had bins of seed potatoes in back, Kennebec russets. Nobody's been down that road since summer. If they freeze, they're done. Would you go?",
		choices: [{
			label: "I'll get your seed",
			id: "q10-seed-accept"
		}, {
			label: "Not today",
			id: "close"
		}]
	},
	ferryAsk: {
		speaker: "Justin",
		text: "The old Kennebec ferry up north of here. It's a cable barge, nothing fancy, but the deck's rotted and the winch is froze. Get me planks from the Lowelltown sawpile, a good coil of rope from the boathouse at Attean, and a winch pawl off that log truck in the ditch east of here. Fix her up and we've got a way into the north woods. Folks say The Grok walks up there. I'd want to know.",
		choices: [{
			label: "I'll fix the ferry",
			id: "q10-ferry-accept"
		}, {
			label: "Another time",
			id: "close"
		}]
	},
	mooseAsk: {
		speaker: "Justin",
		text: "A big bull's been feeding mornings in the Heald Stream bog, south of here. One moose is most of a winter for this family. Take him clean, quarter him, and haul him home. And watch yourself coming back. The bears haven't gone down yet.",
		choices: [{
			label: "I'll get the moose",
			id: "q10-moose-accept"
		}, {
			label: "Not yet",
			id: "close"
		}]
	},
	radioAsk: {
		speaker: "Cyndal",
		text: "Dad found it in the barn. It's a ham set, like before. Last night I swear I heard somebody talking, really faint. It needs a tube, a coil and a battery. Mr. Kinney said the grange hall in Lowelltown had a radio, and there's an old fire tower shed by Attean, and a camp road down by Holeb with junk in the ditches. Can you look? I can't go that far, Mom won't let me.",
		choices: [{
			label: "I'll find the parts",
			id: "q10-radio-accept"
		}, {
			label: "Maybe later",
			id: "close"
		}]
	}
};
function coreEffects(c) {
	return {
		carryLb: 40 + c.strength * 4,
		hpBonus: c.grit * 3,
		staminaBonus: c.agility * 6,
		critPct: 3 + c.agility * 1.5 + c.wits * .5,
		accuracyPct: c.perception * 2,
		barterPct: Math.min(15, c.wits),
		talkBonus: c.wits * 2 + Math.floor(c.grit / 2),
		sickResist: Math.min(.4, c.grit * .04),
		drainMul: Math.max(.6, 1 - c.endurance * .05)
	};
}
/** Skills added in v13 (the 9 v11.3 trade skills stay). Lockpicking stays on the old "lock" skill. */
var NEW_SKILLS = [
	{
		id: "cooking",
		name: "Cooking",
		how: "Cook meals at the farm stove.",
		perk: "Meals fill 5% more and buffs last longer."
	},
	{
		id: "foraging",
		name: "Foraging",
		how: "Find greens, berries and mushrooms walking the woods.",
		perk: "+4% find chance."
	},
	{
		id: "fishing",
		name: "Fishing",
		how: "Land fish at the lake, river or through the ice.",
		perk: "The green zone is 2% wider."
	},
	{
		id: "survival",
		name: "Survival",
		how: "Get through cold nights, storms and black ice.",
		perk: "Cold and storms bite 5% less."
	},
	{
		id: "leadership",
		name: "Leadership",
		how: "Lead companions, free prisoners, rebuild towns.",
		perk: "Companions hit 4% harder and like you a bit quicker."
	},
	{
		id: "scavenging",
		name: "Scavenging",
		how: "Loot crates, cars and camps.",
		perk: "+3% chance of an extra find."
	},
	{
		id: "tracking",
		name: "Tracking",
		how: "Follow tracks and read sign.",
		perk: "Tracks show 1 tile farther every 2 levels."
	},
	{
		id: "firstaid",
		name: "First Aid",
		how: "Bandage cuts and set bones in the field.",
		perk: "Bandages heal 6% more; infection is 5% less likely."
	}
];
/** Perks every 3 levels (3, 6, 9) for every trade skill. */
var SKILL_PERKS = {
	hunting: [
		"Steady Breath: first shot on unaware game +25% damage.",
		"Field Dresser: +1 meat from every animal.",
		"Woodsman: game spooks 20% later."
	],
	trapping: [
		"Wire Hand: snares cost nothing to reset.",
		"Trapline: +10% catch chance.",
		"Fur Trade: pelts sell for +1 iron."
	],
	farming: [
		"Green Thumb: +1 crop each harvest.",
		"Root Stock: the cellar never spoils.",
		"Seed Saver: +1 crop each harvest again."
	],
	mechanics: [
		"Tinkerer: bike burns 10% less gas.",
		"Shade-Tree: repair armor for 1 less iron.",
		"Gearhead: broken-down cars always give gas."
	],
	barter: [
		"Haggler: 5% off.",
		"Old Friend: traders buy bones and hides for more.",
		"Silver Tongue: 5% off again."
	],
	medicine: [
		"Steady Hands: medicine cures sickness in one dose.",
		"Herbalist: brew greens into a tonic (cold cure).",
		"Doc: clinic visits are free."
	],
	stealth: [
		"Soft Step: camp raids +10% stealth.",
		"Shadow: new moon nights hide you twice as well.",
		"Ghost: a failed camp raid gets one more try."
	],
	carpentry: [
		"Square Cut: upgrades 5% cheaper.",
		"Joiner: town rebuilding 10% cheaper.",
		"Master Builder: palisade +20 more."
	],
	marksmanship: [
		"Sight Picture: +5% accuracy.",
		"Follow-Through: +5% crit.",
		"Dead Eye: crits hit x2."
	],
	cooking: [
		"Camp Cook: one extra serving per recipe.",
		"Stew Pot: stew warmth lasts all night.",
		"Chef: every meal also restores 10 thirst."
	],
	foraging: [
		"Berry Picker: +1 find.",
		"Mushroom Eye: chanterelles turn up.",
		"Forager: winter forage works too."
	],
	fishing: [
		"Patient: +1 fish per day.",
		"Fly Hand: rare fish twice as likely.",
		"Ice Man: ice fishing is never slower."
	],
	survival: [
		"Thick Skin: colds 20% less likely.",
		"Sure Foot: black ice can't drop you.",
		"Hardy: nor'easters don't slow you."
	],
	leadership: [
		"Steady Voice: companion loyalty gains +1.",
		"Captain: companions deal +15% damage.",
		"Rally: on siege night the towns send 2 more."
	],
	scavenging: [
		"Picker: +1 scrap from wrecks.",
		"Junk Man: a second roll on crates.",
		"Packrat: carry +10 lb."
	],
	tracking: [
		"Sign Reader: see tracks 2 tiles farther.",
		"Bloodhound: wounded game leaves a trail.",
		"Pathfinder: road events lean your way."
	],
	firstaid: [
		"Clean Cut: bandages stop infection.",
		"Splint: set a broken bone with wood and a bandage.",
		"Medic: +25% from every heal."
	]
};
function perkCount(lv) {
	return lv >= 9 ? 3 : lv >= 6 ? 2 : lv >= 3 ? 1 : 0;
}
var BACKSTORIES = [
	{
		id: "veteran",
		name: "Veteran",
		blurb: "Came home from the Guard before the lights went. Knows a rifle and a chain of command.",
		core: {
			grit: 2,
			perception: 1
		},
		skills: {
			marksmanship: 2,
			leadership: 1,
			firstaid: 1
		},
		gear: [
			["carbine-std", 1],
			["shells", 6],
			["bandage-std", 1]
		]
	},
	{
		id: "mechanic",
		name: "Mechanic",
		blurb: "Ran the garage on Route 201. Can make a dead engine cough.",
		core: {
			wits: 2,
			agility: 1
		},
		skills: {
			mechanics: 2,
			scavenging: 1,
			carpentry: 1
		},
		gear: [["gas", 2], ["wire", 2]]
	},
	{
		id: "farmer",
		name: "Farmer",
		blurb: "Grew potatoes and kept hens on a back lot in Jackman. Patient as the frost.",
		core: {
			endurance: 2,
			grit: 1
		},
		skills: {
			farming: 2,
			cooking: 1,
			foraging: 1
		},
		gear: [
			["apple", 4],
			["greens", 2],
			["water", 2]
		]
	},
	{
		id: "hunter",
		name: "Woods guide",
		blurb: "Guided deer hunters out of Moose River every November. Reads sign like print.",
		core: {
			perception: 1,
			agility: 2
		},
		skills: {
			hunting: 2,
			tracking: 1,
			trapping: 1
		},
		gear: [
			["snare", 2],
			["meat", 2],
			["hide", 1]
		]
	}
];
var WEATHER = {
	clear: {
		name: "Clear",
		sight: 1,
		speed: 1,
		bike: 1,
		cold: 0,
		text: "Clear and still."
	},
	snow: {
		name: "Snow",
		sight: .85,
		speed: .92,
		bike: .85,
		cold: 1,
		text: "Snow coming down steady."
	},
	noreaster: {
		name: "Nor'easter",
		sight: .55,
		speed: .7,
		bike: 0,
		cold: 3,
		text: "A nor'easter. Wind off the coast, snow sideways. No bike in this."
	},
	fog: {
		name: "Fog",
		sight: .5,
		speed: 1,
		bike: .8,
		cold: 0,
		text: "Fog in off the river. You can't see the barn from the porch."
	},
	blackice: {
		name: "Black ice",
		sight: 1,
		speed: .85,
		bike: .55,
		cold: 1,
		text: "Black ice on every road. Walk careful. The bike slides."
	},
	rain: {
		name: "Rain",
		sight: .8,
		speed: .95,
		bike: .9,
		cold: 1,
		text: "Cold rain."
	}
};
/** Daily weather by season (0 spring, 1 summer, 2 fall, 3 winter) from a 0..1 roll. */
function rollWeather(season, r) {
	const table = [
		[
			["clear", .45],
			["rain", .3],
			["fog", .2],
			["snow", .05]
		],
		[
			["clear", .7],
			["rain", .2],
			["fog", .1]
		],
		[
			["clear", .45],
			["rain", .25],
			["fog", .15],
			["blackice", .08],
			["snow", .07]
		],
		[
			["clear", .3],
			["snow", .32],
			["noreaster", .15],
			["blackice", .15],
			["fog", .08]
		]
	];
	let acc = 0;
	for (const [id, p] of table[season] ?? table[0]) {
		acc += p;
		if (r < acc) return id;
	}
	return "clear";
}
var MOON_NAMES = [
	"New moon",
	"Waxing crescent",
	"First quarter",
	"Waxing gibbous",
	"Full moon",
	"Waning gibbous",
	"Last quarter",
	"Waning crescent"
];
function moonPhase(day) {
	return (day % 8 + 8) % 8;
}
/** Night-darkness multiplier and raider boldness for a moon phase. */
function moonEffect(phase) {
	if (phase === 4) return {
		dark: .62,
		bold: 1.25,
		waves: 1,
		stealth: -15
	};
	if (phase === 0) return {
		dark: 1.12,
		bold: .9,
		waves: 0,
		stealth: 15
	};
	if (phase === 3 || phase === 5) return {
		dark: .82,
		bold: 1.1,
		waves: 0,
		stealth: -5
	};
	return {
		dark: 1,
		bold: 1,
		waves: 0,
		stealth: 0
	};
}
var NEED_RATE = {
	normal: {
		hunger: 2.2,
		thirst: 2.6,
		sleep: 2.4,
		hurt: .5
	},
	hard: {
		hunger: 4,
		thirst: 5.5,
		sleep: 3.6,
		hurt: 1.5
	}
};
var FOOD_VALUE = {
	meat: { hunger: 18 },
	apple: {
		hunger: 10,
		thirst: 4
	},
	smokedfish: { hunger: 22 },
	jerky: { hunger: 20 },
	greens: {
		hunger: 8,
		thirst: 3
	},
	water: { thirst: 45 },
	stew: {
		hunger: 55,
		thirst: 15
	},
	chowder: {
		hunger: 50,
		thirst: 20
	},
	pie: { hunger: 40 },
	coffee: {
		thirst: 15,
		sleep: 30
	},
	tonic: { thirst: 20 },
	venisonsteak: { hunger: 45 },
	mushrooms: { hunger: 9 },
	berries: {
		hunger: 7,
		thirst: 4
	},
	cider: {
		hunger: 6,
		thirst: 20
	},
	donut: { hunger: 14 }
};
var RECIPES13 = [
	{
		id: "stew",
		name: "Venison stew",
		need: [["meat", 2], ["greens", 1]],
		makes: "stew",
		buff: "warm",
		hours: 10,
		text: "Warm: the cold can't bite and you don't catch a chill."
	},
	{
		id: "chowder",
		name: "Fish chowder",
		need: [
			["smokedfish", 1],
			["apple", 1],
			["water", 1]
		],
		makes: "chowder",
		buff: "steady",
		hours: 8,
		text: "Steady: stamina comes back 50% faster."
	},
	{
		id: "steak",
		name: "Venison steak",
		need: [["meat", 3]],
		makes: "venisonsteak",
		buff: "strong",
		hours: 6,
		text: "Strong: +2 attack."
	},
	{
		id: "pie",
		name: "Apple pie",
		need: [["apple", 3], ["greens", 1]],
		makes: "pie",
		buff: "cheer",
		hours: 12,
		text: "Cheer: companions' loyalty +3 when you share it."
	},
	{
		id: "coffee",
		name: "Chicory coffee",
		need: [["greens", 1], ["water", 1]],
		makes: "coffee",
		buff: "awake",
		hours: 8,
		text: "Awake: sleep drains half as fast."
	},
	{
		id: "tonic",
		name: "Spruce tonic",
		need: [["greens", 2], ["water", 1]],
		makes: "tonic",
		hours: 0,
		text: "Cures a cold."
	}
];
var AILMENTS = {
	cold: {
		name: "Winter cold",
		text: "Stuffed up and shivering.",
		cure: "Medicine, spruce tonic, or three days warm.",
		speed: .92,
		stamina: .6,
		hpDay: 0
	},
	bone: {
		name: "Broken bone",
		text: "A cracked shin. Every step hurts.",
		cure: "A splint (bandage + wood) or the Harmony clinic.",
		speed: .7,
		stamina: .8,
		hpDay: 0
	},
	cut: {
		name: "Infected cut",
		text: "Red, hot and swelling.",
		cure: "Medicine or the Harmony clinic.",
		speed: 1,
		stamina: .9,
		hpDay: 4
	}
};
var DYES = [
	{
		id: "red",
		name: "Barn red",
		hex: "#b04a3a",
		need: ["berries", 2]
	},
	{
		id: "blaze",
		name: "Blaze orange",
		hex: "#e08a3a",
		need: ["greens", 2]
	},
	{
		id: "spruce",
		name: "Spruce green",
		hex: "#5e8a5e",
		need: ["greens", 1]
	},
	{
		id: "navy",
		name: "Navy",
		hex: "#5a6a9a",
		need: ["berries", 1]
	},
	{
		id: "soot",
		name: "Soot black",
		hex: "#5a5a5a",
		need: ["bone", 1]
	}
];
var SET_BONUS = {
	poor: {
		name: "Homespun set",
		def: 1,
		text: "+1 armor, and the cold bites 10% less."
	},
	standard: {
		name: "Woodsman's set",
		def: 2,
		text: "+2 armor, +5% speed."
	},
	good: {
		name: "Ironside set",
		def: 4,
		text: "+4 armor."
	},
	rare: {
		name: "Bunker set",
		def: 6,
		text: "+6 armor."
	}
};
var COMPANIONS = [
	"justin",
	"sarah",
	"jack",
	"mira",
	"marcel"
];
var COMPANION_NAME = {
	justin: "Justin",
	sarah: "Sarah",
	jack: "Jack Ready",
	mira: "Mira",
	marcel: "Marcel"
};
/** Loyalty change for a choice: who likes it, who doesn't. */
var LOYALTY_FX = {
	"rob-caravan": {
		justin: -12,
		sarah: -15,
		jack: 4,
		mira: -10,
		marcel: -20
	},
	"guard-caravan": {
		justin: 6,
		sarah: 4,
		marcel: 10,
		mira: 3
	},
	"free-prisoners": {
		justin: 8,
		sarah: 10,
		mira: 8,
		jack: 3,
		marcel: 4
	},
	"rebuild": {
		sarah: 6,
		mira: 8,
		marcel: 5,
		justin: 3
	},
	"bounty": {
		marcel: 4,
		jack: 2
	},
	"lost-kid": {
		sarah: 8,
		mira: 5,
		justin: 4
	},
	"deal-collector": {
		justin: -25,
		sarah: -30,
		mira: -25,
		jack: -10,
		marcel: 10
	},
	"unite": {
		justin: 10,
		sarah: 10,
		mira: 12,
		jack: 6,
		marcel: 8
	},
	"alone": {
		jack: 10,
		justin: -5,
		sarah: -5,
		mira: -10
	},
	"trade-jack": { jack: 6 },
	"stranger-help": {
		sarah: 4,
		mira: 4
	},
	"stranger-rob": {
		sarah: -10,
		justin: -8,
		mira: -8,
		jack: 2
	}
};
var BOUNTY_POOL = [
	{
		kind: "raiders",
		text: "Thin out the raiders on the roads",
		n: [2, 4],
		pay: 4
	},
	{
		kind: "deer",
		text: "Bring down deer for the Skowhegan smokehouse",
		n: [1, 2],
		pay: 5
	},
	{
		kind: "coyote",
		text: "Coyotes are at the hens. Shoot some",
		n: [2, 3],
		pay: 4
	},
	{
		kind: "deliver",
		text: "Hides wanted for winter coats",
		n: [2, 3],
		item: "hide",
		pay: 3
	},
	{
		kind: "deliver",
		text: "Meat for the hospital kitchen",
		n: [2, 3],
		item: "meat",
		pay: 3
	}
];
function makeBounties(day) {
	const out = [];
	for (let i = 0; i < 3; i++) {
		const b = BOUNTY_POOL[(day * 7 + i * 3) % BOUNTY_POOL.length];
		const need = b.n[0] + (day + i) % (b.n[1] - b.n[0] + 1);
		out.push({
			id: `b${day}-${i}`,
			kind: b.kind,
			text: b.text,
			need,
			item: b.item,
			pay: b.pay * need,
			got: 0,
			day
		});
	}
	return out;
}
var CARAVAN_ROUTES$1 = [{
	id: "lowell-skow",
	from: "Lowelltown",
	to: "Skowhegan",
	every: 2,
	start: 9,
	end: 15,
	cargo: [
		["shells", 6],
		["medicine", 1],
		["jerky", 3]
	]
}, {
	id: "skow-bangor",
	from: "Skowhegan",
	to: "Bangor",
	every: 3,
	start: 10,
	end: 16,
	cargo: [
		["gas", 2],
		["bandage-std", 2],
		["apple", 4]
	]
}];
function caravanOnRoad(day, hour) {
	return CARAVAN_ROUTES$1.find((r) => day % r.every === 0 && hour >= r.start && hour < r.end) ?? null;
}
var REBUILD = [
	{
		id: "store",
		name: "Harmony store",
		cost: {
			wood: 20,
			stone: 6,
			iron: 12
		},
		effect: "Opens a trader in Harmony: 10% off, buys bones and hides."
	},
	{
		id: "school",
		name: "Harmony school",
		cost: {
			wood: 24,
			stone: 10,
			iron: 6
		},
		effect: "Cyndal and Loki get lessons: +10% XP from everything."
	},
	{
		id: "clinic",
		name: "Harmony clinic",
		cost: {
			wood: 16,
			stone: 12,
			iron: 10,
			need: [["medicine", 2]]
		},
		effect: "Cures colds, bones and cuts for 4 iron. Heals you full."
	}
];
var ROAD_EVENTS = [
	{
		id: "car",
		title: "Broken-down car",
		text: "An old Pemberton nosed into the snowbank, hood up. Nobody around, and no tracks."
	},
	{
		id: "stranger",
		title: "A stranger",
		text: "A man in a torn parka stands in the road with his hands where you can see them. \"Just passin' through. Got anything to swap?\""
	},
	{
		id: "ambush",
		title: "Ambush",
		text: "A tree down across the road. Too neat. Then the shouting starts."
	},
	{
		id: "lostkid",
		title: "A lost kid",
		text: "A boy, maybe eight, sitting on a guardrail. \"I got turned around. We live out past the Forks.\""
	}
];
function pickRoadEvent(r) {
	return r < .3 ? "car" : r < .55 ? "stranger" : r < .82 ? "ambush" : "lostkid";
}
/** Animal counts to keep on a map by season: home woods (0) and north woods (1). */
var MIGRATION = {
	0: {
		0: {
			rabbit: 4,
			deer: 2
		},
		1: {
			deer: 3,
			rabbit: 3
		},
		2: {
			deer: 4,
			moose: 1
		},
		3: {
			coyote: 3,
			deer: 1
		}
	},
	1: {
		0: {
			moose: 2,
			deer: 2
		},
		1: {
			moose: 2,
			deer: 2
		},
		2: {
			moose: 3,
			deer: 3
		},
		3: {
			deer: 5,
			wolf: 3
		}
	},
	2: {
		0: { rabbit: 2 },
		1: { rabbit: 2 },
		2: { deer: 2 },
		3: { coyote: 2 }
	}
};
var TOWNS13 = [
	{
		id: "farm",
		name: "Cambridge Road farm",
		map: 0,
		tx: 0,
		ty: 0
	},
	{
		id: "lowell",
		name: "Lowelltown",
		map: 0,
		tx: 30,
		ty: 60
	},
	{
		id: "jack",
		name: "Jack Ready's stand",
		map: 0,
		tx: 80,
		ty: 40
	},
	{
		id: "skow",
		name: "Skowhegan",
		map: 2,
		tx: 0,
		ty: 0
	}
];
function travelGas(a, b) {
	if (a.map !== b.map) return 2;
	return Math.max(1, Math.round(Math.hypot(a.tx - b.tx, a.ty - b.ty) / 40));
}
var MAIN_ACTS = [
	{
		n: 1,
		title: "Cambridge Road",
		goal: "Fix up the farm with Justin and Sarah, and survive the first raid night.",
		intro: ["Sarah", "\"You'll do. Justin's splitting wood out back. We need the place tight before the snow, and they'll come at night. They always do.\""],
		done: "The farm held. Sarah puts the kettle on like it was any other morning."
	},
	{
		n: 2,
		title: "The Signal",
		goal: "Get Cyndal's radio working and listen to what's out there.",
		intro: ["Cyndal", "\"There's something on 147.3. Same voice every hour. Augusta. Fuel, medicine, order. Come and listen.\""],
		done: "The voice loops: \"Augusta has fuel. Augusta has medicine. Augusta has order. Come south.\" Justin doesn't like it."
	},
	{
		n: 3,
		title: "Jack Ready's Bunker",
		goal: "Earn Jack Ready's trust (loyalty 30) for his old survey maps.",
		intro: ["Jack Ready", "\"Maps cost trust, and trust costs time. Trade with me. Do me a favor or two. Then we'll talk.\""],
		done: "Jack unrolls the survey maps. \"That broadcast? It's a trap. Nobody's come back up the Kennebec who answered it.\""
	},
	{
		n: 4,
		title: "The Kennebec",
		goal: "Cross the Kennebec to Skowhegan and talk to Marcel.",
		intro: ["Justin", "\"If you want answers, Marcel's in Skowhegan. Bridge is the only way across, and somebody's always watching it.\""],
		done: "Marcel lowers his voice. \"Caravans that answer that signal don't come back. Not one. The Collector takes them.\""
	},
	{
		n: 5,
		title: "The Collector",
		goal: "Raid the Collector's camps at night and take down his lieutenants (3).",
		intro: ["Marcel", "\"The raiders answer to a man they call the Collector. He's got lieutenants at camps up and down the river. Hit them at night.\""],
		done: "The last lieutenant talks before he dies: the supply depot is north, past the Holeb woods. Past the Grok."
	},
	{
		n: 6,
		title: "The Grok's Woods",
		goal: "Go north through the Grok's territory and find the Collector's supply depot.",
		intro: ["Justin", "\"Only safe road north runs through the Grok's woods. Safe. That's a joke. Take shells.\""],
		done: "The depot: barrels of fuel, crates of medicine, and a ledger of every caravan he ever took."
	},
	{
		n: 7,
		title: "Choices",
		goal: "Decide: unite the towns, make a deal with the Collector, or go it alone.",
		intro: ["Sarah", "\"He'll come for the farm now. We can bring the towns in with us, or try his terms, or bar the door and hold on ourselves. Your call.\""],
		done: "It's decided. Winter's coming down hard, and so is he."
	},
	{
		n: 8,
		title: "Siege of Harmony",
		goal: "Hold the farm through the Collector's winter assault and bring him down.",
		intro: ["Justin", "\"Lanterns on the road. A wicked lot of them. This is it.\""],
		done: "The Collector is down in the snow by the woodpile. His army breaks for the road."
	},
	{
		n: 9,
		title: "The Long Winter",
		goal: "See how it ends.",
		intro: ["Sarah", "\"Spring comes eventually. Even here.\""],
		done: "The end."
	}
];
var ENDINGS = {
	union: {
		title: "The Valley Holds",
		slides: [
			"Lowelltown, Skowhegan and the Cambridge Road farm stood together, and the Collector's army broke on them.",
			"By spring the Harmony store had bread on the shelves again.",
			"Every year on the first snow the towns light lanterns on the road, so nobody forgets who came."
		]
	},
	deal: {
		title: "The Collector's Peace",
		slides: [
			"You paid his toll, and he left the farm alone.",
			"Others weren't so lucky. The broadcast still runs, and caravans still go south.",
			"The farm is quiet. Some nights you hear the radio and turn it off."
		]
	},
	alone: {
		title: "Alone on Cambridge Road",
		slides: [
			"You held the farm with what you had. No one came, and you asked no one.",
			"The towns rebuilt slow, each on its own.",
			"The farm is a fortress now. It's warm inside. It's lonely."
		]
	},
	fallen: {
		title: "The Long Dark",
		slides: [
			"The farm fell in the deep of winter.",
			"Some got out over the ridge to Jackman. Not all.",
			"The broadcast still loops: \"Augusta has order.\""
		]
	}
};
/** Ending from the act 7 choice, how the siege went, who's alive and how many towns were rebuilt. */
function pickEnding(choice, sieged, won, alive, rebuilt) {
	if (choice === "deal") return "deal";
	if (!won || alive < 2) return "fallen";
	if (choice === "unite") return "union";
	return "alone";
}
var MAIN_TALK = {
	1: {
		justin: "\"Stack the wood on the north side, it's a windbreak and it's dry. They come at night with torches. They want the hens and the stove more than they want us. Make it cost 'em.\"",
		cyndal: "\"Dad says the first raid's the worst one, because you don't know what it sounds like yet. I'm keeping Loki in the root cellar.\"",
		loki: "\"Can Biscuit sleep inside? He's scared of the dark.\" He is not asking about the dog."
	},
	2: {
		sarah: "\"Calm voice. Too calm. Folks on the radio these days sound tired. That one sounds like he's reading a grocery list.\"",
		justin: "\"Augusta's ninety miles. Nobody walks ninety miles on a promise. Not this winter.\"",
		loki: "\"Cyndal let me hold the antenna. I'm the antenna now.\""
	},
	3: {
		justin: "\"Jack Ready's been up that ridge since before the lights went. He trusts that dog more than people. Trade fair and don't push.\"",
		sarah: "\"Bring him something he can't make himself. Pie works on most men. Not Jack, but most men.\"",
		cal: "\"I had a cousin went south on a radio promise in '09. Different radio, same promise.\""
	},
	4: {
		justin: "\"The bridge in Skowhegan's the only crossing left with the ice like this. Somebody's always watching a bridge.\"",
		mira: "\"Marcel knows every sled that comes up the river. If something's taking caravans, he's counted them.\"",
		sarah: "\"Bring back coffee if Marcel's got any. Real coffee. I'll owe you.\""
	},
	5: {
		marcel: "\"Three camps. Gravel pit east of your place, the Holeb cut, and behind the mill here. Hit them on a dark night. A full moon'll get you shot.\"",
		justin: "\"No sense fighting the whole camp. Get in, cut the ropes, find the man in charge. Cold, I know. So's he.\"",
		mira: "\"The folks they're holding are from the Forks. If you get them out, send them to Harmony. We'll find room.\"",
		cyndal: "\"I can hear them on the radio at night. They talk about 'the Collector' like he's the weather.\""
	},
	6: {
		sarah: "\"You're going past the Grok. I've heard it at night from the porch. Don't you get brave out there.\"",
		cal: "\"Grok's territory starts at the second beaver flowage. Walk the ridge, not the bottom. It hunts the bottom.\"",
		marcel: "\"If that depot's got fuel, half the valley could run a generator till spring. Think on that before you burn it.\""
	},
	7: {
		justin: "\"I won't tell you what to do. I'll tell you I've never seen a deal with a man like that end with both sides standing.\"",
		mira: "\"Harmony will stand with you, if you've stood with Harmony. Fix the store, help the clinic. People remember.\"",
		marcel: "\"A deal keeps my store open. I won't lie to you about that. I won't like myself for it either.\"",
		cal: "\"Alone's how I've done it fourteen years. Ayuh. Works fine right up till it don't.\""
	},
	8: {
		sarah: "\"Kids are in the root cellar with Biscuit and a lamp. Whatever happens up here, they're not coming out till it's quiet.\"",
		cyndal: "\"I'm calling the towns on the radio every ten minutes. If anyone's coming, they'll know where.\"",
		mira: "\"Lanterns on the Lowelltown road. Ours, I think. I hope.\""
	}
};
var MAIN_JOURNAL = {
	1: ["Justin and Sarah took me in at the Cambridge Road farm. Wood, walls, and a long first night."],
	2: ["Cyndal's radio picked up a broadcast from Augusta: fuel, medicine, order. Same words every hour."],
	3: ["Jack Ready has old survey maps of the river. He'll share them when he trusts me."],
	4: ["Jack thinks the broadcast is bait. Marcel in Skowhegan counts the sleds on the river. Go ask him."],
	5: ["The raiders answer to the Collector. He keeps three lieutenants at camps along the river.", "Best on a dark night. Fog helps. A full moon doesn't."],
	6: ["The last lieutenant pointed north, past the Holeb woods: a supply depot. The road runs through the Grok's ground."],
	7: ["The depot ledger lists every caravan he took. He'll come for the farm next. Unite the towns, take his deal, or hold alone."],
	8: ["The Collector is coming down the road with everything he's got. Hold the farm. Bring him down."],
	9: ["It's over, one way or the other."]
};
var ACHIEVEMENTS = [
	{
		id: "moose",
		name: "Big as a Barn",
		text: "Bring down your first moose."
	},
	{
		id: "deer",
		name: "Venison Supper",
		text: "Bring down your first deer."
	},
	{
		id: "bike",
		name: "She Runs",
		text: "Build the motor bicycle."
	},
	{
		id: "ghost",
		name: "Ghost in the Camp",
		text: "Raid a raider camp without waking anyone."
	},
	{
		id: "main1",
		name: "Cambridge Road",
		text: "The Long Winter, act 1."
	},
	{
		id: "main2",
		name: "The Signal",
		text: "The Long Winter, act 2."
	},
	{
		id: "main3",
		name: "Jack's Maps",
		text: "The Long Winter, act 3."
	},
	{
		id: "main4",
		name: "Across the Kennebec",
		text: "The Long Winter, act 4."
	},
	{
		id: "main5",
		name: "The Lieutenants",
		text: "The Long Winter, act 5."
	},
	{
		id: "main6",
		name: "Through the Grok's Woods",
		text: "The Long Winter, act 6."
	},
	{
		id: "main7",
		name: "The Choice",
		text: "The Long Winter, act 7."
	},
	{
		id: "main8",
		name: "Siege of Harmony",
		text: "The Long Winter, act 8."
	},
	{
		id: "ride",
		name: "Down the Tote Road",
		text: "Ride the motor bicycle."
	},
	{
		id: "winter",
		name: "Wintered Over",
		text: "Live through your first winter."
	},
	{
		id: "grok",
		name: "The Grok Is Down",
		text: "Beat The Grok."
	},
	{
		id: "raid1",
		name: "Held the Farm",
		text: "Survive your first raid night."
	},
	{
		id: "raid5",
		name: "Five Long Nights",
		text: "Survive five raid nights."
	},
	{
		id: "area",
		name: "Every Chore Done",
		text: "Finish every quest in one area."
	},
	{
		id: "skow",
		name: "Into Skowhegan",
		text: "Reach abandoned Skowhegan."
	},
	{
		id: "bridge",
		name: "Held the Bridge",
		text: "Clear the raiders at the Skowhegan bridge."
	},
	{
		id: "meds",
		name: "Medicine Run",
		text: "Bring medicine back from Redington hospital."
	},
	{
		id: "snare",
		name: "Hare in the Wire",
		text: "Catch your first animal in a snare."
	},
	{
		id: "trap",
		name: "Fur Line",
		text: "Catch a fox or coyote in a trap."
	},
	{
		id: "dress",
		name: "Clean Work",
		text: "Field-dress an animal."
	},
	{
		id: "tracks",
		name: "Read the Sign",
		text: "Follow tracks to an animal."
	},
	{
		id: "biscuit",
		name: "Good Dog",
		text: "Biscuit joins you for good."
	},
	{
		id: "fish10",
		name: "Stringer Full",
		text: "Catch 10 fish."
	},
	{
		id: "upgrade",
		name: "Improvements",
		text: "Build your first farm upgrade."
	},
	{
		id: "palisade",
		name: "Stockade",
		text: "Raise the palisade wall."
	},
	{
		id: "forge",
		name: "Hot Iron",
		text: "Upgrade the workbench to a forge."
	},
	{
		id: "skill5",
		name: "Old Hand",
		text: "Reach level 5 in any trade skill."
	},
	{
		id: "rich",
		name: "Iron in the Coffee Can",
		text: "Hold 100 iron at once."
	},
	{
		id: "level5",
		name: "Seasoned",
		text: "Reach character level 5."
	}
];
/** Each skill levels by doing (XP 25 * level to reach the next level, max 10). Every level gives its perk once more. */
var TRADE_SKILLS = [
	{
		id: "hunting",
		name: "Hunting",
		how: "Kill and dress game, follow tracks.",
		perk: "Animals spook 6% later, and you see tracks 1 tile farther."
	},
	{
		id: "trapping",
		name: "Trapping",
		how: "Set and check snares and traps.",
		perk: "+5% catch chance on each trap."
	},
	{
		id: "farming",
		name: "Farming",
		how: "Morning harvests, farm chores.",
		perk: "Every 2 levels, +1 crop at each harvest."
	},
	{
		id: "mechanics",
		name: "Mechanics",
		how: "Ride the bike, build engines.",
		perk: "The bike burns 6% less gas."
	},
	{
		id: "barter",
		name: "Barter",
		how: "Buy and sell with traders.",
		perk: "Trader prices are 3% lower (max 30%)."
	},
	{
		id: "medicine",
		name: "Medicine",
		how: "Use bandages and medicine, patch up Biscuit.",
		perk: "Healing items heal 8% more."
	},
	{
		id: "stealth",
		name: "Stealth",
		how: "Get close to animals and raiders without being seen.",
		perk: "Enemies notice you 3% later."
	},
	{
		id: "carpentry",
		name: "Carpentry",
		how: "Build farm upgrades.",
		perk: "Farm upgrades cost 4% less wood and stone."
	},
	{
		id: "marksmanship",
		name: "Marksmanship",
		how: "Land gunshots.",
		perk: "Guns hit 4% harder."
	},
	...NEW_SKILLS.map((s) => ({
		id: s.id,
		name: s.name,
		how: s.how,
		perk: s.perk
	}))
];
function skillNeed(level) {
	return 25 * (level + 1);
}
var FARM_UPGRADES$1 = [
	{
		id: "greenhouse",
		name: "Greenhouse",
		art: "farm-greenhouse",
		tiers: [{
			wood: 8,
			stone: 2,
			iron: 4,
			effect: "2 winter greens each morning, even in winter."
		}, {
			wood: 6,
			stone: 4,
			iron: 8,
			effect: "4 winter greens each morning."
		}]
	},
	{
		id: "barrel",
		name: "Rain barrel",
		art: "farm-barrel",
		tiers: [{
			wood: 4,
			stone: 0,
			iron: 2,
			effect: "1 jug of clean water each morning."
		}, {
			wood: 4,
			stone: 0,
			iron: 4,
			effect: "2 jugs of water each morning."
		}]
	},
	{
		id: "solar",
		name: "Solar panel",
		art: "farm-solar",
		tiers: [{
			wood: 2,
			stone: 0,
			iron: 14,
			need: [["wire", 1]],
			effect: "Lights the farm at night."
		}, {
			wood: 2,
			stone: 0,
			iron: 18,
			need: [["wire", 1]],
			effect: "Powers the radio: Marcel's prices drop 20%."
		}]
	},
	{
		id: "lookout",
		name: "Lookout tower",
		art: "farm-lookout",
		tiers: [{
			wood: 12,
			stone: 0,
			iron: 2,
			effect: "Raid warning comes 6s earlier, and you see 2 tiles farther at the farm."
		}, {
			wood: 10,
			stone: 4,
			iron: 4,
			effect: "Raid warning comes 12s earlier, and you see 4 tiles farther."
		}]
	},
	{
		id: "palisade",
		name: "Palisade wall",
		art: "farm-palisade",
		tiers: [
			{
				wood: 16,
				stone: 0,
				iron: 2,
				effect: "+40 farmhouse HP on raid night. The Grok can still break it."
			},
			{
				wood: 14,
				stone: 6,
				iron: 4,
				effect: "+80 farmhouse HP."
			},
			{
				wood: 12,
				stone: 10,
				iron: 8,
				effect: "+120 farmhouse HP."
			}
		]
	},
	{
		id: "smoke",
		name: "Smokehouse",
		art: "farm-smokehouse",
		tiers: [
			{
				wood: 6,
				stone: 4,
				iron: 0,
				effect: "Smokes 1 meat into 2 jerky each morning."
			},
			{
				wood: 6,
				stone: 4,
				iron: 2,
				effect: "Smokes 2 meat."
			},
			{
				wood: 6,
				stone: 6,
				iron: 4,
				effect: "Smokes 3 meat."
			}
		]
	},
	{
		id: "cellar",
		name: "Root cellar",
		art: "farm-cellar",
		tiers: [{
			wood: 4,
			stone: 8,
			iron: 0,
			effect: "+1 potato each morning, and the cold can't touch the stores."
		}, {
			wood: 4,
			stone: 10,
			iron: 2,
			effect: "+2 potatoes each morning."
		}]
	},
	{
		id: "bench",
		name: "Workbench",
		art: "farm-bench",
		tiers: [
			{
				wood: 4,
				stone: 0,
				iron: 2,
				effect: "Hand tools: bench recipes (snares, lanterns, carbine work)."
			},
			{
				wood: 4,
				stone: 8,
				iron: 10,
				effect: "Forge: steel traps, good-quality blades."
			},
			{
				wood: 6,
				stone: 6,
				iron: 20,
				need: [["engine", 0]],
				effect: "Machine shop: refine fuel into gas, and the bike burns 25% less."
			}
		]
	}
];
/** Skowhegan map (map 2). Tiles are absolute; sites for quests use the q11 relative frame (tx - WORLD_OX). */
var SKOW_BUILDINGS = [
	{
		kind: "barn",
		dx: -14,
		dy: -10,
		skin: "skowhegan-mill",
		label: "WOOLEN MILL"
	},
	{
		kind: "farmhouse",
		dx: 10,
		dy: -12,
		skin: "skowhegan-hospital",
		label: "REDINGTON HOSPITAL"
	},
	{
		kind: "shack",
		dx: -4,
		dy: -18,
		skin: "skowhegan-store",
		label: "GENERAL STORE"
	},
	{
		kind: "shack",
		dx: 4,
		dy: -20,
		skin: "skowhegan-hardware",
		label: "HARDWARE"
	},
	{
		kind: "ruin",
		dx: -10,
		dy: -26,
		skin: "skowhegan-house",
		label: ""
	},
	{
		kind: "shack",
		dx: 13,
		dy: -27,
		skin: "skowhegan-house2",
		label: ""
	},
	{
		kind: "shack",
		dx: 18,
		dy: -6,
		skin: "skowhegan-house3",
		label: ""
	}
];
var TRAP_KINDS = {
	snare: {
		item: "snare",
		catches: ["rabbit"],
		base: .7
	},
	trap: {
		item: "steeltrap",
		catches: [
			"fox",
			"coyote",
			"rabbit"
		],
		base: .55
	}
};
function freshQ11() {
	return {
		q: {},
		nextId: 97e3,
		farm: {
			plots: 0,
			coop: 0,
			wall: 0,
			smoke: 0,
			lastDay: -1,
			harvest: 0
		},
		traps: [],
		hunt: null,
		fish: {
			caught: 0,
			rare: 0
		},
		caravan: 0,
		route: 0,
		trips: 0,
		seasonDay: 0
	};
}
function loadQ11(raw) {
	const base = freshQ11();
	if (!raw || typeof raw !== "object") return base;
	const r = raw;
	return {
		...base,
		...r,
		q: r.q && typeof r.q === "object" ? { ...r.q } : {},
		farm: {
			...base.farm,
			...r.farm ?? {}
		},
		traps: Array.isArray(r.traps) ? r.traps : [],
		fish: {
			...base.fish,
			...r.fish ?? {}
		},
		hunt: null,
		caravan: r.caravan === 3 ? 3 : 0
	};
}
/** Sites in world-relative tiles. map 1 = the north woods across the Kennebec. */
var Q11_SITES = {
	pond: {
		tx: 30,
		ty: 40,
		name: "Attean pond ice"
	},
	iceTrail: {
		tx: 34,
		ty: 30,
		name: "Ice road"
	},
	truck1: {
		tx: 70,
		ty: 30,
		name: "Route 2 wrecks"
	},
	truck2: {
		tx: 78,
		ty: 34,
		name: "Route 2 tanker"
	},
	pharmacy: {
		tx: 100,
		ty: 70,
		name: "Newport pharmacy"
	},
	herseys: {
		tx: 92,
		ty: 80,
		name: "The Hersey place"
	},
	sugarbush: {
		tx: 18,
		ty: 52,
		name: "Sugar bush"
	},
	sugarshack: {
		tx: 24,
		ty: 58,
		name: "Sugar shack"
	},
	skowRoad: {
		tx: 96,
		ty: 98,
		name: "Road to Skowhegan"
	},
	skowBridge: {
		tx: 58,
		ty: 65,
		name: "Kennebec bridge",
		map: 2
	},
	skowHospital: {
		tx: 68,
		ty: 48,
		name: "Redington hospital",
		map: 2
	},
	skowMill: {
		tx: 44,
		ty: 50,
		name: "Woolen mill",
		map: 2
	},
	grokTracks: {
		tx: 40,
		ty: 40,
		name: "Big tracks",
		map: 1
	},
	grokScrape: {
		tx: 58,
		ty: 56,
		name: "Claw-scraped spruce",
		map: 1
	},
	grokDen: {
		tx: 76,
		ty: 50,
		name: "Blowdown den",
		map: 1
	},
	bridge: {
		tx: 80,
		ty: 18,
		name: "Sebasticook bridge"
	},
	sawmill: {
		tx: 8,
		ty: 40,
		name: "Hartland sawmill"
	},
	cache1: {
		tx: 40,
		ty: 90,
		name: "Jack's cache: the culvert"
	},
	cache2: {
		tx: 102,
		ty: 30,
		name: "Jack's cache: the hunting stand"
	},
	cache3: {
		tx: 8,
		ty: 72,
		name: "Jack's cache: the cellar hole"
	},
	belfast: {
		tx: 106,
		ty: 106,
		name: "Belfast shore"
	},
	lighthouse: {
		tx: 110,
		ty: 100,
		name: "The light at Belfast"
	},
	henyard: {
		tx: 42,
		ty: 24,
		name: "The hen yard"
	},
	wolfTracks: {
		tx: 30,
		ty: 66,
		name: "Wolf sign"
	},
	wolfDen: {
		tx: 18,
		ty: 86,
		name: "Wolf den"
	},
	window1: {
		tx: 50,
		ty: 80,
		name: "Burned-out farmhouse"
	},
	window2: {
		tx: 70,
		ty: 92,
		name: "Old storm windows"
	},
	window3: {
		tx: 86,
		ty: 104,
		name: "Collapsed porch"
	},
	school: {
		tx: 58,
		ty: 98,
		name: "Harmony school"
	},
	fishKennebec: {
		tx: 62,
		ty: 6,
		name: "Kennebec eddy"
	},
	fishPond: {
		tx: 28,
		ty: 44,
		name: "Attean pond shore"
	},
	fishHoleb: {
		tx: 12,
		ty: 102,
		name: "Holeb pond"
	},
	farmBike: {
		tx: 40,
		ty: 19,
		name: "Old motor bicycle"
	},
	junkyard: {
		tx: 94,
		ty: 25,
		name: "The Chopping junkyard"
	},
	garage: {
		tx: 72,
		ty: 25,
		name: "Route 2 garage"
	},
	raiderSled: {
		tx: 60,
		ty: 72,
		name: "Raider sled camp"
	}
};
var FISH_SITES = [
	"fishKennebec",
	"fishPond",
	"fishHoleb"
];
var R = (n, name) => Array.from({ length: n }, (_, i) => [
	"bandit",
	i % 2 ? "jumper" : "scout",
	name,
	18,
	4,
	9
]);
var Q11 = [
	{
		id: "meds",
		title: "Medicine Run",
		giver: "mira",
		offer: "The hospital down to Skowhegan",
		ask: "Half of Lowelltown's got the croup and I'm out of everything. Redington hospital in Skowhegan had a whole pharmacy. Raiders sit on the Kennebec bridge, though. The road's south, past the ponds.",
		accept: "I'll go to Skowhegan",
		steps: [
			{
				kind: "go",
				site: "skowRoad",
				hud: "take the south road to Skowhegan.",
				log: "The old road to Skowhegan. Somebody's spray-painted TURN BACK on the sign."
			},
			{
				kind: "fight",
				site: "skowBridge",
				hud: "raiders hold the Kennebec bridge. Clear them.",
				log: "Lanterns on the bridge. They've strung wire across it and they're waiting.",
				foes: [
					[
						"bandit",
						"shield",
						"Bridge raider",
						36,
						7,
						16
					],
					[
						"bandit",
						"scout",
						"Bridge raider",
						24,
						6,
						12
					],
					[
						"bandit",
						"brute",
						"Bridge boss",
						52,
						9,
						30
					]
				]
			},
			{
				kind: "take",
				site: "skowHospital",
				hud: "search Redington hospital's pharmacy.",
				log: "Behind the pharmacy counter: a carton of amoxicillin and two bottles of cough syrup nobody found.",
				give: [["medicine", 3]],
				take: {
					speaker: "Redington hospital",
					text: "The pharmacy cage is pried open, but the bottom shelf is still full under a fallen ceiling tile.",
					label: "Take the medicine"
				}
			}
		],
		done: "Oh, bless you. That'll see the little ones through. You keep one of those for yourself, hear?",
		doneLabel: "Hand over the medicine",
		reward: [["medicine", 1], ["bandage-good", 1]],
		iron: 10,
		xp: 60,
		after: "Lowelltown's coughing less. Mira's pharmacy shelf has bottles on it again."
	},
	{
		id: "mill",
		title: "The Woolen Mill",
		giver: "justin",
		offer: "Belting off the Skowhegan mill",
		ask: "The old woolen mill in Skowhegan's got leather drive belts and bearings. I need them for a saw rig. Mind, there's a crew holed up in there.",
		accept: "I'll strip the mill",
		steps: [{
			kind: "fight",
			site: "skowMill",
			hud: "clear the raiders out of the woolen mill.",
			log: "Smoke from a barrel fire in the mill yard. They've seen you.",
			foes: [[
				"bandit",
				"armor",
				"Mill raider",
				44,
				8,
				20
			], [
				"bandit",
				"torch",
				"Mill raider",
				26,
				6,
				12
			]]
		}, {
			kind: "take",
			site: "skowMill",
			hud: "pull belting and bearings off the mill shafts.",
			log: "Forty feet of leather belting and a crate of bearings packed in grease.",
			give: [["wire", 2], ["oil", 2]],
			take: {
				speaker: "Woolen mill",
				text: "Line shafts run the length of the floor, belts still on the pulleys.",
				label: "Strip the belts and bearings"
			}
		}],
		done: "That's real leather. The saw rig will run off the tractor now. Good work.",
		doneLabel: "Hand over the belting",
		reward: [["shells", 8]],
		iron: 14,
		xp: 50,
		after: "Justin's saw rig howls on the tractor's power take-off."
	},
	{
		id: "bike",
		title: "Bike Parts",
		giver: "justin",
		offer: "That old motor bike by the barn",
		ask: "That's Dad's old motor bicycle, a Whizzer, leaning on the barn since before the lights went out. Frame's good. She's missing the carburetor, the chain, the engine's seized, there's no tank, no plug and the back tire's rotted off. Find the parts and we'll put her together on the bench. Then you can run the roads twice as quick. Loud, though. Every raider in the county'll hear you coming.",
		accept: "I'll find the parts",
		steps: [
			{
				kind: "take",
				site: "farmBike",
				hud: "look over the old motor bicycle by the barn.",
				log: "Rust, mouse nests and a good frame. A list of parts in your head.",
				take: {
					speaker: "Old motor bicycle",
					text: "A balloon-tire bicycle with a little engine bolted in the frame. Seized, gutted and flat, but straight.",
					label: "Make a list of what she needs"
				}
			},
			{
				kind: "take",
				site: "junkyard",
				hud: "pull a carburetor and a gas tank at the junkyard by The Chopping.",
				log: "A little float carburetor off a lawn tractor, and a dented teardrop tank that doesn't leak.",
				give: [["carburetor", 1], ["gastank", 1]],
				take: {
					speaker: "The Chopping junkyard",
					text: "Wrecks stacked three high, a lawn tractor on its side and an old moped frame in the weeds.",
					label: "Pull the carb and the tank"
				}
			},
			{
				kind: "take",
				site: "garage",
				hud: "get a chain and a tire at the Route 2 garage.",
				log: "A coil of #41 chain off the pegboard and a bicycle tire still in its paper.",
				give: [["chain", 1], ["tire", 1]],
				take: {
					speaker: "Route 2 garage",
					text: "Bay doors stove in, but the parts room in back is half full. Pegboard, boxes, a rack of bicycle tires.",
					label: "Take a chain and a tire"
				}
			},
			{
				kind: "fight",
				site: "raiderSled",
				hud: "raiders at the sled camp have a little engine. Take it off them.",
				log: "A raider camp, and lashed on their sled is a two-stroke engine the size of a bread box.",
				foes: [[
					"bandit",
					"scout",
					"Sled raider",
					18,
					4,
					9
				], [
					"bandit",
					"jumper",
					"Sled raider",
					18,
					4,
					9
				]]
			},
			{
				kind: "take",
				site: "raiderSled",
				hud: "take the engine off the raiders' sled.",
				log: "The engine's heavy but it turns over by hand. Good compression.",
				give: [["engine", 1]],
				take: {
					speaker: "Raider sled",
					text: "A Kineo two-stroke, lashed down with baling twine.",
					label: "Cut it loose"
				}
			},
			{
				kind: "take",
				site: "npc:cal",
				hud: "buy a spark plug from Jack Ready (6 iron).",
				log: "Jack sells you a plug in its box. \"The ready prosper,\" he says.",
				give: [["sparkplug", 1]],
				cost: 6,
				take: {
					speaker: "Jack Ready",
					text: "\"A spark plug? Got a whole coffee can of 'em. Six iron.\"",
					label: "Buy a spark plug (6 iron)"
				}
			},
			{
				kind: "take",
				site: "farmBike",
				hud: "build the bike at the farm workbench.",
				log: "Two evenings on the bench, skinned knuckles, and she fires on the third kick.",
				need: [
					"carburetor",
					"chain",
					"engine",
					"gastank",
					"sparkplug",
					"tire"
				],
				take: {
					speaker: "Farm workbench",
					text: "Everything laid out on the bench: carb, chain, engine, tank, plug and tire.",
					label: "Build the motor bicycle"
				}
			}
		],
		done: "Listen to her go! Just like Dad's. She'll drink gas, mind, so keep a can on you. And no kids on it. Not ever.",
		doneLabel: "Take her out",
		reward: [["gas", 3]],
		xp: 40,
		after: "The motor bicycle runs. Ride it with the Ride button when you're beside it; it burns gas."
	},
	{
		id: "ice",
		title: "Ice Out",
		giver: "sarah",
		offer: "The root cellar's getting warm",
		ask: "The cellar won't hold through a thaw without ice. Attean pond's froze a foot thick now. Cut me blocks, pack them in sawdust and drag them home. Watch your back on the way. A sled leaves a trail anybody can follow.",
		accept: "I'll cut the ice",
		steps: [
			{
				kind: "go",
				site: "pond",
				hud: "walk out on Attean pond.",
				log: "Attean pond. Black ice, a foot thick, booming under your boots."
			},
			{
				kind: "take",
				site: "pond",
				hud: "cut ice blocks on the pond.",
				log: "You saw out six blocks and lash them on the sled under sawdust.",
				take: {
					speaker: "Attean pond ice",
					text: "Clear ice, green at the edges. With the bow saw and the tongs you can have six blocks out before your hands quit.",
					label: "Saw out the blocks"
				}
			},
			{
				kind: "ambush",
				site: "iceTrail",
				hud: "raiders followed the sled trail. Drive them off.",
				log: "Boots crunching behind you. Somebody followed the sled marks off the pond.",
				foes: R(3, "Sled-trail raider")
			}
		],
		done: "Six blocks! Packed good, too. That'll keep the milk and the meat right through to May. Here, I put up some stew.",
		doneLabel: "Into the cellar with them",
		reward: [["stew", 2], ["meat", 1]],
		xp: 30,
		after: "The root cellar is packed with pond ice under sawdust."
	},
	{
		id: "fuel",
		title: "Fuel Run",
		giver: "justin",
		offer: "Tractor's near dry",
		ask: "The tractor's down to fumes. There's trucks dead in the ditch all along Route 2. Take the hose and a couple of cans and siphon what's left. Don't swallow any, it'll ruin your whole week.",
		accept: "I'll get the gas",
		steps: [
			{
				kind: "take",
				site: "truck1",
				hud: "siphon gas from the Route 2 wrecks.",
				log: "A gallon and a half out of the pickup, and a mouthful you'll taste till Tuesday.",
				take: {
					speaker: "Route 2 wrecks",
					text: "A pickup and a sedan nose to nose in the ditch, snow to the door handles. The pickup's cap is still on.",
					label: "Run the hose"
				}
			},
			{
				kind: "fight",
				site: "truck2",
				hud: "the tanker on Route 2 is guarded. Clear it.",
				log: "Two men are camped in the lee of the tanker, and they think it's theirs.",
				foes: R(2, "Tanker squatter")
			},
			{
				kind: "take",
				site: "truck2",
				hud: "fill the cans at the tanker.",
				log: "Both cans full, sloshing heavy.",
				take: {
					speaker: "Route 2 tanker",
					text: "The old heating-oil tanker still has gas in the pony tank. The valve's stiff but it turns.",
					label: "Fill the cans"
				}
			}
		],
		done: "Now that's a smell I missed. That'll run the tractor down the lane a good few times. Good work.",
		doneLabel: "Two full cans",
		reward: [["fuel", 2]],
		xp: 28,
		after: "Two cans of Route 2 gas in the barn for the tractor."
	},
	{
		id: "sick",
		title: "The Sick Neighbor",
		giver: "sarah",
		offer: "How are the Herseys?",
		ask: "Old Mr. Hersey's got a chest cold that's gone bad, and Ruth can't get him warm. They need medicine. The Rite Aid in Newport's been empty since summer, but there could be something in back. Then take it to them, their place is on the Stetson road.",
		accept: "I'll find medicine",
		steps: [
			{
				kind: "fight",
				site: "pharmacy",
				hud: "looters at the Newport pharmacy. Clear them.",
				log: "The pharmacy door is propped with a cinder block and there's somebody in there going through the shelves.",
				foes: R(3, "Pharmacy looter")
			},
			{
				kind: "take",
				site: "pharmacy",
				hud: "search the pharmacy back room.",
				log: "Amoxicillin, a box of it, and cough syrup. Good enough.",
				take: {
					speaker: "Newport pharmacy",
					text: "Behind the counter the shelves are bare, but the back room's got a locked drawer the looters missed.",
					label: "Pry the drawer"
				}
			},
			{
				kind: "take",
				site: "herseys",
				hud: "bring the medicine to the Hersey place.",
				log: "Ruth Hersey cries a little and puts the kettle on.",
				take: {
					speaker: "Ruth Hersey",
					text: "\"Oh, you didn't. Come in out of the wind. Walt, look who it is. Look what they brought you.\"",
					label: "Give Ruth the medicine"
				}
			}
		],
		done: "You got it to them? Bless you. Ruth'll never forget it. She sent this back with you, she wouldn't take no.",
		doneLabel: "He'll pull through",
		reward: [
			["kit", 1],
			["bandage", 2],
			["donut", 2]
		],
		xp: 34,
		after: "Walt Hersey is up and around. Ruth sends doughnuts."
	},
	{
		id: "maple",
		title: "Maple Season",
		giver: "justin",
		offer: "Sap's running",
		ask: "Days are warm and nights are freezing, so the sap's running. Tap the sugar bush out west, haul the buckets to the shack and boil it down. Forty gallon of sap for one of syrup. Keep the fire going after dark, the coyotes come in for the smell.",
		accept: "I'll make syrup",
		steps: [
			{
				kind: "take",
				site: "sugarbush",
				hud: "tap the maples in the sugar bush.",
				log: "Spiles in, buckets hung. It's running good.",
				take: {
					speaker: "Sugar bush",
					text: "Big old rock maples, some of them tapped before your grandfather was born. The old spile holes are still there.",
					label: "Drive the spiles, hang the buckets"
				}
			},
			{
				kind: "take",
				site: "sugarshack",
				hud: "boil the sap down at the sugar shack.",
				log: "Steam rolls out of the shack all afternoon. By dark you've got syrup the color of a good fiddle.",
				take: {
					speaker: "Sugar shack",
					text: "The evaporator pan's rusty but it holds. There's a cord of dry wood stacked under the eaves.",
					label: "Fire the arch and boil"
				}
			},
			{
				kind: "ambush",
				site: "sugarshack",
				hud: "coyotes after the shack. Drive them off.",
				log: "Yips in the dark all around the shack. The coyotes smelled the sugar.",
				foes: [
					[
						"coyote",
						null,
						"Coyote",
						13,
						4,
						6
					],
					[
						"coyote",
						null,
						"Coyote",
						13,
						4,
						6
					],
					[
						"coyote",
						null,
						"Coyote",
						13,
						4,
						6
					]
				]
			}
		],
		done: "Look at that color. That's Grade A, ayuh. Keep two jars and I'll trade the rest down the road for iron.",
		doneLabel: "Trade it",
		reward: [["syrup", 2]],
		iron: 14,
		xp: 30,
		after: "Syrup in the pantry, and iron from the trade."
	},
	{
		id: "grok",
		title: "The Grok Hunt",
		giver: "justin",
		offer: "About The Grok",
		needs: "ferry",
		ask: "Now the ferry runs, I've been hearing things from across the river. Tracks as long as your forearm. Spruce scraped bark-bare eight foot up. They call it The Grok. It's slow, but it don't stop, and it hits like a skidder. If you go, keep your distance and keep shooting. Bring back a claw and I'll see you outfitted proper.",
		accept: "I'll hunt The Grok",
		steps: [
			{
				kind: "go",
				site: "grokTracks",
				hud: "cross the ferry and find The Grok's tracks in the north woods.",
				log: "Tracks in the snow, each one longer than your boot. Something heavy went through here, slow."
			},
			{
				kind: "go",
				site: "grokScrape",
				hud: "follow the tracks to the scraped spruce.",
				log: "A spruce scraped bare way over your head. Long grooves, and a smell like a wet dog the size of a barn."
			},
			{
				kind: "fight",
				site: "grokDen",
				hud: "The Grok is at the blowdown. Keep your distance and bring it down.",
				log: "The blowdown heaves and The Grok stands up. It's slow. It doesn't stop.",
				foes: [[
					"bandit",
					"grok",
					"The Grok",
					220,
					15,
					90
				]]
			}
		],
		done: "That's... I'll be. That claw's longer than my hand. Here. My good rifle, and Sarah's had a coat put by for whoever earned it. You did.",
		doneLabel: "Hand over the claw",
		reward: [
			["winchester", 1],
			["coat-good", 1],
			["grokclaw", 1]
		],
		xp: 90,
		after: "The Grok is dead in the north woods. Its claw hangs over the farmhouse door."
	},
	{
		id: "bridge",
		title: "Bridge Out",
		giver: "justin",
		offer: "The Sebasticook bridge",
		ask: "Somebody blew the Sebasticook bridge, the one on the road east. Cuts us off from half the county. You can't ford it in this. But Hartland sawmill's got timbers, and a span's just timbers and bolts. Go look at it, then get the beams.",
		accept: "I'll look at the bridge",
		steps: [
			{
				kind: "go",
				site: "bridge",
				hud: "look at the blown Sebasticook bridge.",
				log: "The middle span's gone, dropped in the river. Both abutments stand. You could deck it across with long timbers."
			},
			{
				kind: "fight",
				site: "sawmill",
				hud: "the Hartland sawmill is held. Clear it.",
				log: "The sawmill has a crew in it, and they've been the ones charging toll at the ford.",
				foes: R(3, "Toll crew")
			},
			{
				kind: "take",
				site: "sawmill",
				hud: "load timbers at the Hartland sawmill.",
				log: "Twelve-by-twelve hemlock, chained on the skid.",
				take: {
					speaker: "Hartland sawmill",
					text: "Long timbers stickered in the yard, and a skid with chains. It's a haul but it's doable.",
					label: "Chain the timbers on the skid"
				}
			},
			{
				kind: "take",
				site: "bridge",
				hud: "rebuild the span at the bridge.",
				log: "Two days of hard work and the span is across. You can drive a team over it now.",
				take: {
					speaker: "Sebasticook bridge",
					text: "The abutments are sound. Lay the timbers across, spike them, deck them with what's left.",
					label: "Build the span"
				}
			}
		],
		done: "You rebuilt it? Well I'll be. That's the road east open again. Folks'll be talking about that one.",
		doneLabel: "It's open",
		reward: [["shells", 8]],
		iron: 12,
		xp: 46,
		after: "The Sebasticook bridge is open again."
	},
	{
		id: "caches",
		title: "Jack Ready's Bunker Map",
		giver: "cal",
		offer: "Got any more maps, Jack?",
		needs: "jack",
		ask: "Being ready means not keeping your eggs in one basket. I've got three caches out around Somerset County. A culvert, a hunting stand and an old cellar hole. Marked 'em on this map. Go fetch what's in 'em and keep half. The strong endure, but the ready prosper.",
		accept: "Hand me the map",
		steps: [
			{
				kind: "take",
				site: "cache1",
				hud: "find Jack's cache in the culvert.",
				log: "An ammo can wrapped in a feed bag, dry as a bone.",
				take: {
					speaker: "The culvert",
					text: "Down in the culvert, wedged up behind the lip, an olive-drab ammo can.",
					label: "Haul the can out"
				}
			},
			{
				kind: "take",
				site: "cache2",
				hud: "find Jack's cache at the hunting stand.",
				log: "A Penobscot Gear case lashed under the platform.",
				take: {
					speaker: "The hunting stand",
					text: "A ladder stand in a big hemlock. Under the platform, a case strapped tight.",
					label: "Climb up and cut it loose"
				}
			},
			{
				kind: "fight",
				site: "cache3",
				hud: "somebody's camped on the cellar hole. Clear them.",
				log: "Somebody found the cellar hole before you did and they're sleeping on it.",
				foes: R(2, "Cache thief")
			},
			{
				kind: "take",
				site: "cache3",
				hud: "dig out Jack's cache in the cellar hole.",
				log: "A buried drum. They didn't dig deep enough.",
				take: {
					speaker: "The cellar hole",
					text: "Granite foundation stones and a lilac bush gone wild. The dirt's soft by the chimney base.",
					label: "Dig by the chimney"
				}
			}
		],
		done: "All three. You're a ready one, I'll give you that. Half's yours like I said. The strong endure, but the ready prosper.",
		doneLabel: "Split it with Jack",
		reward: [
			["shells", 12],
			["lockpick-good", 1],
			["kit", 1]
		],
		iron: 10,
		xp: 40,
		after: "Jack's three caches are found and split."
	},
	{
		id: "light",
		title: "Lighthouse Signal",
		giver: "cyndal",
		offer: "Something on the radio?",
		needs: "radio",
		ask: "There's a light. On the radio Marcel says a light's blinking down at Belfast, on the coast. Long, short, long. Like Morse, but wrong. He says nobody's gone to look. Could you? I'd come but Mom says no, and Dad says no too.",
		accept: "I'll go look",
		steps: [
			{
				kind: "go",
				site: "belfast",
				hud: "travel down to the Belfast shore.",
				log: "Salt air and gulls. Out on the point the light flashes, long, short, long."
			},
			{
				kind: "fight",
				site: "lighthouse",
				hud: "the lighthouse is held. Clear it.",
				log: "Wreckers. They work the light to bring boats onto the ledges.",
				foes: R(3, "Belfast wrecker")
			},
			{
				kind: "take",
				site: "lighthouse",
				hud: "climb the lighthouse.",
				log: "You shut the lamp off and take the wreckers' logbook and a pair of brass binoculars.",
				take: {
					speaker: "Lighthouse",
					text: "Iron stairs go round and round. Up top a car battery runs a lamp on a timer, and there's a logbook full of boat names.",
					label: "Shut it off and take the logbook"
				}
			}
		],
		done: "Wreckers? That's awful. But you stopped it. I'm going to tell Marcel. Can I keep the logbook? Somebody should know whose boats those were.",
		doneLabel: "It's yours, Cyndal",
		reward: [["binoculars", 1]],
		iron: 8,
		xp: 44,
		after: "The false light at Belfast is dark."
	},
	{
		id: "wolves",
		title: "Wolf Pack",
		giver: "sarah",
		offer: "Something's at the hens",
		ask: "Three hens gone this week, and not a fox, either. I found tracks the size of my palm. Wolves, out of the north. They'll be back for the rest, then for the calf. Find where they're denned and finish the leader. The pack won't hold together without him.",
		accept: "I'll track them",
		steps: [
			{
				kind: "go",
				site: "henyard",
				hud: "look over the hen yard for sign.",
				log: "Feathers and big tracks heading south out of the yard."
			},
			{
				kind: "go",
				site: "wolfTracks",
				hud: "follow the wolf sign south.",
				log: "The tracks join up here, five or six of them. They're traveling together."
			},
			{
				kind: "fight",
				site: "wolfDen",
				hud: "wolves at the den. Bring down the pack leader.",
				log: "A big grizzled male stands up at the den mouth, and the pack fans out around him.",
				foes: [
					[
						"wolf",
						null,
						"Pack leader",
						44,
						9,
						24
					],
					[
						"wolf",
						null,
						"Wolf",
						22,
						6,
						10
					],
					[
						"wolf",
						null,
						"Wolf",
						22,
						6,
						10
					]
				]
			}
		],
		done: "You got the old male? The rest'll scatter, they always do. The hens'll lay again once they calm down. Here, take the pelts, they're yours.",
		doneLabel: "Hens are safe",
		reward: [["pelt", 3], ["meat", 1]],
		xp: 40,
		after: "The wolf pack is broken up. The hens are laying again."
	},
	{
		id: "garden",
		title: "Mira's Garden",
		giver: "mira",
		offer: "Are you planting this winter?",
		ask: "I could grow greens all winter if I had a greenhouse. Old windows will do, storm windows, anything with glass. There's three places I know of out past Ashwell where the glass is still good. Bring me the windows and help me frame it, before the ground freezes hard.",
		accept: "I'll get windows",
		steps: [
			{
				kind: "take",
				site: "window1",
				hud: "salvage windows at the burned-out farmhouse.",
				log: "Four sashes, wavy old glass, not a crack.",
				take: {
					speaker: "Burned-out farmhouse",
					text: "The ell burned but the front parlor didn't. The six-over-six windows are still in their frames.",
					label: "Pull the sashes"
				}
			},
			{
				kind: "take",
				site: "window2",
				hud: "salvage the old storm windows.",
				log: "Six storm windows, stacked and tied.",
				take: {
					speaker: "Old storm windows",
					text: "Stacked behind a barn under a tarp, a dozen aluminum storm windows.",
					label: "Load six"
				}
			},
			{
				kind: "take",
				site: "window3",
				hud: "salvage glass from the collapsed porch.",
				log: "The last two big panes, wrapped in a blanket.",
				take: {
					speaker: "Collapsed porch",
					text: "A glassed-in sun porch, roof down, but two big panes survived.",
					label: "Ease them out"
				}
			},
			{
				kind: "take",
				site: "npc:mira",
				hud: "frame the greenhouse with Mira.",
				log: "By dusk it's framed, glazed and banked with straw. Mira's grinning.",
				take: {
					speaker: "Mira Pelletier",
					text: "\"Lean them on the south wall. We'll frame it in spruce poles and bank the bottom with straw.\"",
					label: "Build the greenhouse"
				}
			}
		],
		done: "Look at it. Lettuce by Christmas, you watch. Take these, and come by for greens whenever you like.",
		doneLabel: "Grow good",
		reward: [["apple", 4], ["dandelion", 3]],
		xp: 36,
		after: "Mira's greenhouse stands on the south wall at Ashwell."
	},
	{
		id: "school",
		title: "School Days",
		giver: "sarah",
		offer: "The kids need books",
		ask: "Cyndal reads everything twice and Loki's forgetting his letters. The old Harmony school still has its library, if nobody's burned it. Clear the place out first. Then you walk them down and back, both of them, and I mean right beside you. And nobody carries a gun but you.",
		accept: "I'll take them",
		steps: [
			{
				kind: "fight",
				site: "school",
				hud: "clear the Harmony school.",
				log: "There's smoke from the school chimney, and the men inside aren't teachers.",
				foes: R(3, "School squatter")
			},
			{
				kind: "go",
				site: "npc:sarah",
				hud: "go home and fetch Cyndal and Loki.",
				log: "Cyndal's got a pack already. Loki's got two."
			},
			{
				kind: "escort",
				site: "school",
				hud: "walk Cyndal and Loki to the Harmony school. Keep them close.",
				log: "The library's dusty but whole. Cyndal goes still in front of the science shelf."
			},
			{
				kind: "take",
				site: "school",
				hud: "pick out books with the kids.",
				log: "Two full packs of books. Loki got one about dinosaurs and one about tractors.",
				take: {
					speaker: "Harmony school library",
					text: "Cyndal pulls down an old radio handbook. Loki finds a book about tractors and won't put it down.",
					label: "Fill the packs"
				}
			},
			{
				kind: "escort",
				site: "npc:sarah",
				hud: "walk the kids home to Sarah.",
				log: "Home before dark, both of them, books and all."
			}
		],
		done: "Both of them back, and look at all those books. Loki's already asked me to read the tractor one twice. Thank you.",
		doneLabel: "School's in",
		reward: [["cider", 2], ["stew", 1]],
		xp: 40,
		after: "The kids have books. Cyndal is reading the radio handbook cover to cover."
	}
];
function questById(id) {
	return Q11.find((q) => q.id === id);
}
function open(q, c) {
	if (!c.snowDone) return false;
	if (q.needs === "ferry" && !c.ferry) return false;
	if (q.needs === "jack" && !c.jack) return false;
	if (q.needs === "radio" && !c.radio) return false;
	return true;
}
function stageOf(st, id) {
	return st.q[id]?.s ?? 0;
}
function q11Journal(st, c) {
	const out = [];
	for (const q of Q11) {
		const s = stageOf(st, q.id);
		if (s === 0 && !open(q, c)) continue;
		const n = q.steps.length;
		const who = GIVER_NAME[q.giver] ?? q.giver;
		const text = s === 0 ? `${who} has something to ask. (${q.offer}.)` : s <= n ? `${q.steps[s - 1].hud[0].toUpperCase()}${q.steps[s - 1].hud.slice(1)}${st.q[q.id].left > 0 ? ` ${st.q[q.id].left} left.` : ""}` : s === n + 1 ? `Go back to ${who}.` : q.after;
		out.push({
			id: `q11-${q.id}`,
			title: q.title,
			text,
			done: s >= n + 2
		});
	}
	return out;
}
var GIVER_NAME = {
	sarah: "Sarah",
	justin: "Justin",
	cyndal: "Cyndal",
	cal: "Jack Ready",
	mira: "Mira"
};
function q11Hud(st) {
	for (const q of Q11) {
		const s = stageOf(st, q.id);
		const n = q.steps.length;
		if (s >= 1 && s <= n) return `${q.title}: ${q.steps[s - 1].hud}${st.q[q.id].left > 0 ? ` ${st.q[q.id].left} left.` : ""}`;
		if (s === n + 1) return `${q.title}: go back to ${GIVER_NAME[q.giver] ?? q.giver}.`;
	}
	return "";
}
/** Extra talk for v11 quest givers: replace the line, or add choices. */
function q11Talk(role, st, c, raidOn) {
	if (raidOn) return null;
	const add = [];
	for (const q of Q11) {
		if (q.giver !== role) continue;
		const s = stageOf(st, q.id);
		if (s === q.steps.length + 1) return { replace: {
			speaker: GIVER_NAME[role] ?? role,
			text: q.done,
			choices: [{
				label: q.doneLabel,
				id: `q11-done-${q.id}`
			}]
		} };
		if (s === 0 && open(q, c)) add.push({
			label: q.offer,
			id: `q11-ask-${q.id}`
		});
	}
	return add.length ? { add } : null;
}
function q11Ask(q) {
	return {
		speaker: GIVER_NAME[q.giver] ?? q.giver,
		text: q.ask,
		choices: [{
			label: q.accept,
			id: `q11-accept-${q.id}`
		}, {
			label: "Not right now",
			id: "close"
		}]
	};
}
var SEASONS = [
	"Spring",
	"Summer",
	"Fall",
	"Winter"
];
/** The story starts in late fall. */
function seasonOf(day, seasonDay) {
	return (2 + Math.floor(Math.max(0, day - seasonDay) / 6)) % 4;
}
var SEASON_TINT = [
	"rgba(150,205,130,0.10)",
	"rgba(240,215,120,0.08)",
	"",
	"rgba(190,215,245,0.16)"
];
/** Crop yield multiplier for the farm builder. */
var SEASON_CROP = [
	1,
	2,
	1,
	0
];
var FARM_UPGRADES = [
	{
		id: "plots",
		name: "Potato plot",
		max: 3,
		wood: 4,
		stone: 0,
		iron: 0,
		prop: "crates",
		blurb: "Apples and potatoes every day the ground isn't froze."
	},
	{
		id: "coop",
		name: "Chicken coop",
		max: 3,
		wood: 6,
		stone: 0,
		iron: 2,
		prop: "stall",
		blurb: "Eggs every morning. Wolves love it too."
	},
	{
		id: "wall",
		name: "Stone wall",
		max: 3,
		wood: 0,
		stone: 4,
		iron: 0,
		prop: "wall",
		blurb: "Slows raiders at the yard edge."
	},
	{
		id: "smoke",
		name: "Smokehouse",
		max: 3,
		wood: 8,
		stone: 2,
		iron: 4,
		prop: "logs",
		blurb: "Turns meat into jerky overnight."
	}
];
var COMPASS8 = [
	"N",
	"NE",
	"E",
	"SE",
	"S",
	"SW",
	"W",
	"NW"
];
var CARAVAN_ROUTES = [
	{
		label: "Route 2 through Newport (fast, raiders)",
		risk: .7,
		foe: "bandit",
		days: 1
	},
	{
		label: "The river road (slow, quieter)",
		risk: .3,
		foe: "bandit",
		days: 2
	},
	{
		label: "Back roads through Dixmont (coyote country)",
		risk: .5,
		foe: "coyote",
		days: 1
	}
];
var MODE_TEXT = {
	winter: "Winter Survival. Deep January at Cambridge Road. The days are short, the woodpile's low and so's the pantry. Keep warm, keep fed, and hold on until spring.",
	endless: "Endless Raid. They don't stop coming. Hold the farm as long as you can.",
	watch: "Night Watch. Lantern lit, the family asleep. Somebody's creeping around the barns tonight. Watch for the ripples in the dark and catch them before they get to the hens."
};
var SKILLS = [
	{
		id: "rifle",
		name: "Rifle",
		blurb: "Carbines, revolvers, scatterguns."
	},
	{
		id: "melee",
		name: "Melee",
		blurb: "Axes, knives, picks, iron bars."
	},
	{
		id: "doctor",
		name: "Doctor",
		blurb: "Bandages and kits do more."
	},
	{
		id: "lock",
		name: "Lockpick",
		blurb: "Pins, hatches, and stubborn doors."
	},
	{
		id: "speech",
		name: "Speech",
		blurb: "Talk a person into the hard choice."
	},
	{
		id: "barter",
		name: "Barter",
		blurb: "Iron goes further at a stall."
	},
	{
		id: "sneak",
		name: "Sneak",
		blurb: "Hostile eyes pick you up later."
	},
	{
		id: "trail",
		name: "Trail",
		blurb: "See farther. Pull a little more from a node."
	}
];
var PERKS = [
	{
		id: "steady",
		name: "Steady hands",
		blurb: "Rifle +15, and a gun hits a little harder.",
		need: {
			skill: "rifle",
			score: 25
		}
	},
	{
		id: "logger",
		name: "Logger",
		blurb: "Melee +15, and close work hits harder.",
		need: {
			skill: "melee",
			score: 25
		}
	},
	{
		id: "stitch",
		name: "Field stitch",
		blurb: "Doctor +15. Wraps heal more.",
		need: {
			skill: "doctor",
			score: 25
		}
	},
	{
		id: "soft",
		name: "Soft step",
		blurb: "Sneak +15.",
		need: {
			skill: "sneak",
			score: 25
		}
	},
	{
		id: "haggle",
		name: "Horse trade",
		blurb: "Barter +15.",
		need: {
			skill: "barter",
			score: 20
		}
	},
	{
		id: "pins",
		name: "Sure pins",
		blurb: "Lockpick +15. Picks slip less.",
		need: {
			skill: "lock",
			score: 25
		}
	},
	{
		id: "deadeye",
		name: "Deadeye",
		blurb: "Called shots to the head land more often.",
		need: {
			skill: "rifle",
			score: 40
		}
	},
	{
		id: "known",
		name: "Known face",
		blurb: "Speech +12. Towns take your word a little further.",
		need: {
			skill: "speech",
			score: 30
		}
	},
	{
		id: "wool",
		name: "Thick wool",
		blurb: "Defense +2."
	},
	{
		id: "quick",
		name: "Quick hands",
		blurb: "Two more action points in a turn."
	}
];
var TOWN_NAME = {
	lowelltown: "Lowelltown",
	attean: "Attean",
	holeb: "Holeb",
	ponds: "Chain of Ponds"
};
var TOWN_OF = {
	mira: "lowelltown",
	bram: "lowelltown",
	adele: "lowelltown",
	etta: "lowelltown",
	gus: "lowelltown",
	walter: "lowelltown",
	rejean: "lowelltown",
	sera: "attean",
	holt: "attean",
	pete: "attean",
	ruth: "attean",
	emile: "attean",
	cal: "attean",
	ivo: "holeb",
	nora: "holeb",
	paul: "holeb",
	mae: "holeb",
	justin: "ponds",
	sarah: "ponds",
	cyndal: "ponds",
	loki: "ponds"
};
function clampScore(n, lo = -100, hi = 100) {
	return Math.max(lo, Math.min(hi, n));
}
function tagsForRole(role) {
	if (role === "hunter") return [
		"rifle",
		"sneak",
		"trail"
	];
	if (role === "medic") return [
		"doctor",
		"speech",
		"barter"
	];
	if (role === "thief") return [
		"lock",
		"sneak",
		"speech"
	];
	return [
		"melee",
		"trail",
		"doctor"
	];
}
function townOf(role) {
	return TOWN_OF[role] ?? null;
}
function skillPointsOnLevel(intellect) {
	return 3 + Math.max(0, intellect);
}
function perkSlots(level) {
	return Math.floor(Math.max(0, level) / 3);
}
function skillScore(id, stats, invested, tags, perks) {
	const s = stats;
	let base = 8;
	if (id === "rifle") base = 4 + s.perception * 6 + s.luck * 2;
	else if (id === "melee") base = 8 + s.strength * 6 + s.endurance * 2;
	else if (id === "doctor") base = 4 + s.intellect * 5 + s.vigor * 2;
	else if (id === "lock") base = 4 + s.intellect * 4 + s.perception * 3;
	else if (id === "speech") base = 8 + s.intellect * 5 + s.luck * 2;
	else if (id === "barter") base = 6 + s.intellect * 4 + s.luck * 3;
	else if (id === "sneak") base = 4 + s.perception * 4 + s.luck * 3;
	else base = 8 + s.perception * 3 + s.endurance * 3;
	if (s.trait === "eye" && id === "rifle") base += 12;
	if (s.trait === "eye" && id === "melee") base -= 8;
	if (s.trait === "camp" && id === "melee") base += 12;
	if (s.trait === "camp" && id === "rifle") base -= 8;
	if (s.trait === "step" && (id === "lock" || id === "sneak")) base += 12;
	const put = invested?.[id] ?? 0;
	const tagged = tags?.includes(id);
	let extra = 0;
	const owned = perks ?? [];
	if (id === "rifle" && owned.includes("steady")) extra += 15;
	if (id === "melee" && owned.includes("logger")) extra += 15;
	if (id === "doctor" && owned.includes("stitch")) extra += 15;
	if (id === "sneak" && owned.includes("soft")) extra += 15;
	if (id === "barter" && owned.includes("haggle")) extra += 15;
	if (id === "lock" && owned.includes("pins")) extra += 15;
	if (id === "speech" && owned.includes("known")) extra += 12;
	return clampScore(base + put * (tagged ? 2 : 1) + extra, 0, 120);
}
function checkChance(score, dc, rep, karma) {
	const bonus = Math.round(rep / 4 + karma / 8);
	return clampScore(score - dc + 50 + bonus, 5, 95);
}
function priceOf(base, barter, rep) {
	const cut = Math.min(40, Math.floor(barter / 4) + Math.floor(Math.max(0, rep) / 5));
	const hike = rep < 0 ? Math.min(35, Math.floor(-rep / 4)) : 0;
	return Math.max(1, Math.round(base * (100 - cut + hike) / 100));
}
function townHostile(rep) {
	return rep <= -15;
}
function crimeShift(role) {
	if (role === "cyndal" || role === "loki") return {
		karma: -30,
		rep: -40
	};
	if (role === "villager") return {
		karma: -6,
		rep: -10
	};
	return {
		karma: -12,
		rep: -18
	};
}
function karmaWord(karma) {
	if (karma >= 25) return "Well spoken of";
	if (karma >= 8) return "Known for decent";
	if (karma <= -25) return "A hard name";
	if (karma <= -8) return "Talked about";
	return "No name yet";
}
function perkOk(perk, score) {
	if (!perk.need) return true;
	return score(perk.need.skill) >= perk.need.score;
}
/** Isometric 2:1 projection. Screen axes are player-visible. */
function screenDirToWorld(dsx, dsy) {
	return {
		vx: dsy + dsx / 2,
		vy: dsy - dsx / 2
	};
}
function worldVelToScreen(vx, vy) {
	return {
		dsx: vx - vy,
		dsy: (vx + vy) / 2
	};
}
function worldToScreen(x, y, camX, camY) {
	return {
		sx: x - y - camX,
		sy: (x + y) / 2 - camY
	};
}
function screenToWorld(sx, sy, camX, camY) {
	const X = sx + camX;
	const Y = sy + camY;
	return {
		x: Y + X / 2,
		y: Y - X / 2
	};
}
/** Facing rows on the four-direction sheets: 0 down, 1 left, 2 right, 3 up. */
function facingFromWorld(vx, vy) {
	const { dsx, dsy } = worldVelToScreen(vx, vy);
	if (Math.abs(dsx) > Math.abs(dsy)) return dsx >= 0 ? 2 : 1;
	return dsy >= 0 ? 0 : 3;
}
/** Eight Diablo facings: down, down-left, left, up-left, up, up-right, right, down-right. */
function facing8Screen(dsx, dsy) {
	return (Math.round((Math.atan2(dsy, dsx) - Math.PI / 2) / (Math.PI / 4)) % 8 + 8) % 8;
}
function facing8(vx, vy) {
	const { dsx, dsy } = worldVelToScreen(vx, vy);
	return facing8Screen(dsx, dsy);
}
function assertIso() {
	const right = worldVelToScreen(screenDirToWorld(1, 0).vx, screenDirToWorld(1, 0).vy);
	const left = worldVelToScreen(screenDirToWorld(-1, 0).vx, screenDirToWorld(-1, 0).vy);
	const up = worldVelToScreen(screenDirToWorld(0, -1).vx, screenDirToWorld(0, -1).vy);
	const down = worldVelToScreen(screenDirToWorld(0, 1).vx, screenDirToWorld(0, 1).vy);
	if (right.dsx < .99 || Math.abs(right.dsy) > .02) throw new Error("D is not screen-right");
	if (left.dsx > -.99 || Math.abs(left.dsy) > .02) throw new Error("A is not screen-left");
	if (up.dsy > -.99 || Math.abs(up.dsx) > .02) throw new Error("W is not screen-up");
	if (down.dsy < .99 || Math.abs(down.dsx) > .02) throw new Error("S is not screen-down");
}
/** v14: 8-way facing with hysteresis. Keeps the current facing until the heading is clearly past the sector edge, so diagonals don't flicker. */
function facing8Hys(cur, vx, vy, slack = .18) {
	const { dsx, dsy } = worldVelToScreen(vx, vy);
	const next = facing8Screen(dsx, dsy);
	if (cur == null || cur === next) return next;
	const angle = Math.atan2(dsy, dsx) - Math.PI / 2;
	const center = cur * (Math.PI / 4);
	let d = Math.abs(angle - center) % (Math.PI * 2);
	if (d > Math.PI) d = Math.PI * 2 - d;
	return d < Math.PI / 8 + slack ? cur : next;
}
/** Slot 1 keeps the original key so older saves land in slot 1. */
var SAVE_KEY = "maine-rpg-save-v2";
var SLOT_KEY = "maine-rpg-slot";
var slot = 1;
try {
	slot = Math.min(3, Math.max(1, Number(localStorage.getItem(SLOT_KEY)) || 1));
} catch {}
function keyOf(n) {
	return n === 1 ? SAVE_KEY : `${SAVE_KEY}-s${n}`;
}
function getSlot() {
	return slot;
}
function setSlot(n) {
	slot = Math.min(3, Math.max(1, Math.round(n) || 1));
	try {
		localStorage.setItem(SLOT_KEY, String(slot));
	} catch {}
}
function slotInfos() {
	migrateKey();
	const out = [];
	for (let n = 1; n <= 3; n++) {
		let label = "Empty";
		let used = false;
		try {
			const raw = localStorage.getItem(keyOf(n));
			if (raw) {
				used = true;
				const d = JSON.parse(raw);
				const when = d.savedAt ? new Date(d.savedAt).toLocaleString([], {
					month: "short",
					day: "numeric",
					hour: "numeric",
					minute: "2-digit"
				}) : "";
				label = `${d.name || "Packer"} · Lv ${d.level ?? 1}${when ? " · " + when : ""}`;
			}
		} catch {
			label = "Unreadable";
		}
		out.push({
			slot: n,
			used,
			label
		});
	}
	return out;
}
/** Storage key used by beta v1 and the Grok Build exports; read once and moved to SAVE_KEY. */
var OLD_SAVE_KEY = "tote-road-save-v2";
function migrateKey() {
	try {
		if (localStorage.getItem("maine-rpg-save-v2")) return;
		const old = localStorage.getItem(OLD_SAVE_KEY);
		if (!old) return;
		localStorage.setItem(SAVE_KEY, old);
		localStorage.removeItem(OLD_SAVE_KEY);
	} catch {}
}
function hasSave() {
	migrateKey();
	try {
		return !!localStorage.getItem(keyOf(slot));
	} catch {
		return false;
	}
}
function readSave() {
	migrateKey();
	try {
		const raw = localStorage.getItem(keyOf(slot));
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!data || data.v !== 1 || !Array.isArray(data.removed)) return null;
		return data;
	} catch {
		return null;
	}
}
function writeSave(data) {
	try {
		localStorage.setItem(keyOf(slot), JSON.stringify({
			...data,
			savedAt: Date.now()
		}));
	} catch {}
}
function playerToSave(p, quest, questKills, removed, slain, placed, explored) {
	return {
		v: 1,
		name: p.name,
		x: p.x,
		y: p.y,
		hp: p.hp,
		maxHp: p.maxHp,
		atk: p.atk,
		def: p.def,
		xp: p.xp,
		level: p.level,
		scrap: p.scrap,
		wood: p.wood,
		stone: p.stone,
		blade: p.blade,
		quest,
		questKills,
		respawnX: p.respawnX,
		respawnY: p.respawnY,
		dir: p.dir,
		role: p.role,
		trait: p.trait,
		baseAtk: p.baseAtk,
		bag: p.bag,
		weaponId: p.weaponId,
		coatId: p.coatId,
		headId: p.headId,
		legsId: p.legsId,
		handsId: p.handsId,
		strength: p.strength,
		vigor: p.vigor,
		endurance: p.endurance,
		intellect: p.intellect,
		perception: p.perception,
		luck: p.luck,
		look: p.look,
		hair: p.hair,
		points: p.points,
		removed,
		slain,
		placed,
		explored: bytesToB64(explored)
	};
}
function bytesToB64(u) {
	let s = "";
	const step = 2e3;
	for (let i = 0; i < u.length; i += step) {
		const slice = u.subarray(i, i + step);
		let part = "";
		for (let j = 0; j < slice.length; j++) part += String.fromCharCode(slice[j]);
		s += part;
	}
	return btoa(s);
}
function b64ToBytes(b64, size) {
	const out = new Uint8Array(size);
	try {
		const bin = atob(b64);
		const n = Math.min(size, bin.length);
		for (let i = 0; i < n; i++) out[i] = bin.charCodeAt(i);
	} catch {}
	return out;
}
var useHud = create(() => ({
	phase: "menu",
	ready: false,
	hasSave: false,
	name: "Packer",
	hp: 44,
	maxHp: 44,
	level: 1,
	xp: 0,
	xpNext: xpNeed(1),
	scrap: 0,
	wood: 0,
	stone: 0,
	shells: 0,
	quest: 0,
	questKills: 0,
	questText: questText(0, 0),
	journal: [],
	log: [],
	buildOpen: false,
	recipe: 0,
	canPlace: false,
	dialogue: null,
	loot: null,
	blade: false,
	roleTitle: "Camp hand",
	atk: 9,
	def: 2,
	packOpen: false,
	pack: [],
	inv: null,
	weaponName: "Camp hatchet",
	coatName: "Wool coat",
	headName: "Bare head",
	legsName: "Bare legs",
	handsName: "Bare hands",
	wornHead: "",
	wornChest: "",
	wornLegs: "",
	wornHands: "",
	wornWeapon: "",
	gun: false,
	riding: false,
	canMount: false,
	aim: "chest",
	turnBased: false,
	gfxHigh: true,
	ap: 8,
	maxAp: 8,
	statsOpen: false,
	points: 0,
	strength: 1,
	vigor: 1,
	endurance: 1,
	intellect: 1,
	perception: 1,
	luck: 1,
	stamina: 80,
	maxStamina: 80,
	inside: false,
	clock: "Day 1 · 07:00",
	region: "Moose River",
	skillPoints: 0,
	skills: [],
	perkReady: false,
	perkChoices: [],
	perkNames: "",
	karmaWord: "No name yet",
	repLine: "",
	canRetag: true,
	party: null
}));
var useRaidMode = create(() => ({ result: null }));
var useModeResult = create(() => ({ result: null }));
/** The horde's name lives here and nowhere else. Change it once and every line in the game follows. */
var HOLLOWED = "Hollowed";
var LOOT_RUNS = [
	{
		id: "gas",
		name: "The Ervin Fuel station",
		q: 9,
		r: 6,
		days: 3,
		blurb: "Pumps, a store and a locked back office.",
		tiers: [
			[
				["junk", 2],
				["water", 1],
				["cloth", 1]
			],
			[
				["donut", 2],
				["junk", 2],
				["fuel", 1],
				["bandage", 1]
			],
			[
				["medicine", 1],
				["shells", 6],
				["kit", 1]
			]
		]
	},
	{
		id: "camp",
		name: "The hunting camp",
		q: 1,
		r: 2,
		days: 4,
		blurb: "A tar-paper camp and a meat shed.",
		tiers: [
			[["cloth", 2], ["matches", 1]],
			[
				["jerky", 2],
				["hide", 2],
				["snare", 1]
			],
			[
				["shells", 8],
				["binoculars", 1],
				["steeltrap", 1]
			]
		]
	},
	{
		id: "truck",
		name: "The jackknifed box truck",
		q: 6,
		r: 3,
		days: 5,
		blurb: "Jackknifed on Route 27, back door chained.",
		tiers: [
			[["junk", 3], ["cloth", 2]],
			[
				["junk", 3],
				["wire", 1],
				["water", 2]
			],
			[
				["backpack", 1],
				["medicine", 1],
				["shells", 6]
			]
		]
	}
];
var lootRunAt = (q, r) => LOOT_RUNS.find((l) => l.q === q && l.r === r) ?? null;
/** Days left before a spot restocks (0 = ready). */
function restockLeft(run, lastDay, today) {
	if (lastDay == null) return 0;
	return Math.max(0, run.days - (today - lastDay));
}
/** Noise, 0-100. What each action makes; the meter eases toward it. */
var NOISE = {
	still: 0,
	crouch: 8,
	walk: 30,
	bike: 85,
	chop: 55,
	melee: 45,
	gun: 100
};
/** How far (world px) a noise carries. */
var noiseReach = (n) => n * 10;
/** Sneak attack: crouched, on something that hasn't noticed you. */
var SNEAK_MULT = 2.5;
/** Crouching walks at this fraction of normal speed, and things see you from this fraction as far. */
var CROUCH_SPEED = .5;
var CROUCH_SIGHT = .55;
var PROD = [
	{
		kind: "garden",
		name: "Garden bed",
		per: 24,
		makes: "greens",
		qty: 2,
		cap: 6,
		blurb: "Kale and potatoes. Grows faster with a rain collector near it."
	},
	{
		kind: "smokehouse",
		name: "Smokehouse",
		per: 6,
		makes: "jerky",
		qty: 1,
		needs: [["meat", 1]],
		cap: 8,
		blurb: "Load raw meat; it comes out jerky. Burns a little wood."
	},
	{
		kind: "raincollector",
		name: "Rain collector",
		per: 12,
		makes: "water",
		qty: 1,
		cap: 6,
		blurb: "Makes water: a tarp funnel over two drums, 1 jug every 12 hours, twice as quick in rain or snow. A rain barrel nearby stores what it makes."
	},
	{
		kind: "still",
		name: "Still",
		per: 10,
		makes: "spirits",
		qty: 1,
		needs: [["water", 1], ["apple", 1]],
		cap: 4,
		blurb: "Water and windfalls into strong spirits. Cleans a wound."
	}
];
var prodOf = (kind) => PROD.find((p) => p.kind === kind) ?? null;
var BAGS = {
	"bag-sack": 1,
	"bag-hide": 2,
	"bag-frame": 3
};
/** Chest quick-sort: by kind, then name. */
var ORDER = [
	"weapon",
	"coat",
	"supply"
];
function sortStacks(items, gear) {
	const merged = /* @__PURE__ */ new Map();
	for (const s of items) if (s.qty > 0) merged.set(s.id, (merged.get(s.id) ?? 0) + s.qty);
	return [...merged].map(([id, qty]) => ({
		id,
		qty
	})).sort((a, b) => {
		const ga = gear[a.id], gb = gear[b.id];
		return ORDER.indexOf(ga?.kind ?? "supply") - ORDER.indexOf(gb?.kind ?? "supply") || (ga?.name ?? a.id).localeCompare(gb?.name ?? b.id);
	});
}
/** Quick-stack: move every pack stack the store already holds. Returns [newPack, newStore, moved]. */
function quickStack(pack, store, keep) {
	const have = new Set(store.map((s) => s.id));
	let moved = 0;
	const outStore = store.map((s) => ({ ...s }));
	const outPack = [];
	for (const s of pack) {
		const free = s.qty - keep(s.id);
		if (have.has(s.id) && free > 0) {
			outStore.find((x) => x.id === s.id).qty += free;
			moved += free;
			if (s.qty - free > 0) outPack.push({
				id: s.id,
				qty: s.qty - free
			});
		} else outPack.push({ ...s });
	}
	return [
		outPack,
		outStore,
		moved
	];
}
function freshV141() {
	return {
		crouch: false,
		noise: 0,
		loot: {},
		chests: {},
		prod: {},
		drop: null,
		stick: false,
		auto: false,
		sq: {},
		sqf: {}
	};
}
function loadV141(raw) {
	return {
		...freshV141(),
		...raw ?? {},
		chests: raw?.chests ?? {},
		prod: raw?.prod ?? {},
		loot: raw?.loot ?? {},
		sq: raw?.sq ?? {},
		sqf: raw?.sqf ?? {}
	};
}
var LOOT_LORE = {
	gas: {
		desc: "A two-pump Ervin Fuel station on the county road, canopy sagging under snow, ice machine tipped over by the door. The store's been picked over by everybody from here to Jackman, but the back office door is steel and still locked. Somebody spray-painted \"NO GAS NO FOOD NO KIDDING\" across the front window. They were mostly right.",
		notes: [
			{
				title: "Taped to the register",
				text: "To whoever comes in after me. Pumps are dry. I checked both. Underground tank's got maybe a foot left but you need the hand pump in the back office and Dale took the key home to Bingham the night it all went. Dale is not coming back. Don't wait on Dale.\nDonuts in the case are three weeks old. I ate two anyhow. Still better than the ones they sold fresh.\n— T."
			},
			{
				title: "Clipboard in the back office, shift log",
				text: "Oct 3. Power out again. Generator ran 4 hrs. Customer paid in deer meat, put it in the cooler, wrote IOU on the drawer slip.\nOct 6. Trucker says Augusta's got lights. Nobody believes him.\nOct 9. Folks walking past at night now. Not talking. Not looking at the lights. Just walking south. Locked the door.\nOct 10. They don't knock. Going out the back."
			},
			{
				title: "Kid's drawing on the cooler door (crayon)",
				text: "A stick-figure man with a big mustache holding a donut. Caption: \"DALE IS THE BEST BOSS. — Kaylee age 7.\" Somebody later wrote underneath in pen: \"he had his moments.\""
			}
		],
		npc: [{
			role: "lr-tammy",
			name: "Tammy Bouchard"
		}]
	},
	camp: {
		desc: "A tar-paper camp on a beaver flowage, woodstove pipe out the side wall, meat shed on stilts out back. Buck pole by the door, empty. Inside: four bunks, a card table with a game of cribbage left mid-hand, and a calendar stuck on November of a year that doesn't matter anymore. Smells like woodsmoke, wet wool and old beans.",
		notes: [
			{
				title: "Camp log book on the card table",
				text: "Opening day. Gerry saw a doe and three squirrels. Bob saw the inside of his eyelids. Roy got lost going to the outhouse. A fine start.\nDay 3. Radio says stay put. Fine with us, we've got beans for a month.\nDay 9. Something got in the meat shed. Not a bear. Bear wouldn't leave the hide hanging that neat.\nDay 11. Roy went to check the trapline. Gerry went to look for Roy. I'm keeping the stove going. If you're reading this and you're not Roy or Gerry, the lever gun's under the bottom bunk. Use it on whatever needs it.\n— Bob Carrier"
			},
			{
				title: "Folded under the cribbage board",
				text: "Gerry — you owe me 14 dollars and a bottle of Allard's Brandy from last season. Don't pretend you forgot. I wrote it down this time. — R."
			},
			{
				title: "Pinned to the meat shed door (written on a paper plate)",
				text: "KEEP THIS SHUT. THE WOLVES CAN COUNT."
			}
		],
		npc: [{
			role: "lr-bob",
			name: "Bob Carrier"
		}]
	},
	truck: {
		desc: "A 26-foot box truck folded across both lanes of Route 27, cab in the ditch, trailer door chained shut from the outside. Logo's been scraped off with a knife. Snow drifted up one side, and a line of plastic grocery bags is tied to the antenna like a flag. Nobody chains a truck from the outside unless they mean to come back, or mean to keep something in.",
		notes: [
			{
				title: "On the driver's seat, in a fast-food bag",
				text: "Load sheet says paper towels. It is not paper towels. Boss said don't look and don't stop till Farmington. I looked. I'm stopping.\nIf the Collector's people find this truck, it was never mine. — Wendell"
			},
			{
				title: "Scratched inside the trailer wall",
				text: "6 of us. Day 2. Wendell left water. Wendell is OK.\nDay 4. Door's chained. Somebody outside, not Wendell.\nDay 5. Pried a slat. Going out the floor. Tell the Forks we tried."
			},
			{
				title: "Stuck under the windshield wiper (newer, raider handwriting)",
				text: "PROPERTY OF THE COLLECTOR. TOUCH IT AND HE'LL COUNT YOU TOO.\n(Underneath, in a different pen:) \"he can't count past 10 we've seen him try\""
			}
		],
		npc: [{
			role: "lr-wendell",
			name: "Wendell Ouellette"
		}]
	}
};
var MAT_NAME = {
	wood: "Wood",
	stone: "Stone",
	iron: "Iron",
	junk: "Scrap",
	cloth: "Cloth",
	hide: "Hide",
	grokclaw: "Grok claw"
};
function freshV14() {
	return {
		st: 0,
		camp: null,
		bench: 1,
		fort: {},
		placed: [],
		defendWave: 0,
		tries: 0,
		report: null
	};
}
/** Saves made before v14 already have the farm: count it found, held and built. */
function loadV14(raw) {
	if (!raw) return {
		...freshV14(),
		st: 5
	};
	return {
		...freshV14(),
		...raw,
		fort: raw.fort ?? {},
		placed: raw.placed ?? []
	};
}
var STAGE_TEXT = [
	"Search the wrecked truck by the road.",
	"Get 3 wood and light the fire ring.",
	"Follow the chimney smoke east to the farm.",
	"",
	"Defend the farm: hold the gate and the walls."
];
var PIECES = [
	{
		id: "wall-wood",
		kind: "wall-wood",
		name: "Stake wall",
		cost: { wood: 3 },
		hp: 60,
		up: "wall-stone",
		blurb: "Sharpened spruce stakes, 7 ft."
	},
	{
		id: "wall-stone",
		kind: "wall-stone",
		name: "Stone wall",
		cost: {
			stone: 4,
			wood: 1
		},
		hp: 120,
		up: "wall-metal",
		blurb: "Fieldstone laid dry."
	},
	{
		id: "wall-metal",
		kind: "wall-metal",
		name: "Sheet-iron wall",
		cost: {
			iron: 5,
			junk: 2
		},
		hp: 200,
		blurb: "Roofing tin on posts."
	},
	{
		id: "gate-wood",
		kind: "gate-wood",
		name: "Plank gate",
		cost: { wood: 4 },
		hp: 70,
		up: "gate-stone",
		blurb: "Tap to open or shut."
	},
	{
		id: "gate-stone",
		kind: "gate-stone",
		name: "Stone-post gate",
		cost: {
			stone: 4,
			wood: 2
		},
		hp: 130,
		up: "gate-metal",
		blurb: "Heavy door, stone posts."
	},
	{
		id: "gate-metal",
		kind: "gate-metal",
		name: "Iron gate",
		cost: {
			iron: 6,
			junk: 2
		},
		hp: 210,
		blurb: "Barred and riveted."
	},
	{
		id: "spikes",
		kind: "spikes",
		name: "Spike trap",
		cost: {
			wood: 2,
			junk: 1
		},
		hp: 40,
		blurb: "Hurts raiders who cross it. Wears down."
	},
	{
		id: "sandbags",
		kind: "sandbags",
		name: "Sandbags",
		cost: {
			cloth: 1,
			stone: 1
		},
		hp: 50,
		blurb: "Cover. Raiders have to break it."
	},
	{
		id: "chest",
		kind: "chest",
		name: "Storage chest",
		cost: {
			wood: 3,
			iron: 1
		},
		hp: 40,
		blurb: "Holds what the pack can't."
	},
	{
		id: "campfire",
		kind: "campfire",
		name: "Campfire",
		cost: {
			wood: 3,
			stone: 2
		},
		hp: 30,
		blurb: "Heat and a pot."
	},
	{
		id: "garden",
		kind: "garden",
		name: "Garden bed",
		cost: {
			wood: 3,
			stone: 1
		},
		hp: 30,
		blurb: "Greens every day. Tap to harvest."
	},
	{
		id: "smokehouse",
		kind: "smokehouse",
		name: "Smokehouse",
		cost: {
			wood: 6,
			stone: 2
		},
		hp: 50,
		blurb: "Raw meat in, jerky out."
	},
	{
		id: "raincollector",
		kind: "raincollector",
		name: "Rain collector",
		cost: {
			wood: 2,
			cloth: 2,
			iron: 1
		},
		hp: 30,
		blurb: "Makes water: 1 jug every 12 hours, quicker in rain."
	},
	{
		id: "still",
		kind: "still",
		name: "Still",
		cost: {
			iron: 3,
			junk: 3,
			wood: 2
		},
		hp: 40,
		blurb: "Water and apples into spirits."
	},
	{
		id: "rainbarrel",
		kind: "rainbarrel",
		name: "Rain barrel",
		cost: {
			wood: 3,
			iron: 1
		},
		hp: 30,
		blurb: "Stores water: holds what the rain and your collectors give it."
	}
];
var PIECE_HP = Object.fromEntries(PIECES.map((p) => [p.kind, p.hp]));
PIECE_HP["lookout"] = 70;
var PIECE_BROKEN = {
	"wall-wood": "wall-x",
	"wall-stone": "wall-x",
	"wall-metal": "wall-x",
	"gate-wood": "wall-x",
	"gate-stone": "wall-x",
	"gate-metal": "wall-x",
	sandbags: "sandbags-x",
	lookout: "lookout-x",
	chest: "chest",
	garden: "garden",
	smokehouse: "smokehouse",
	raincollector: "raincollector",
	still: "still",
	rainbarrel: "rainbarrel",
	spikes: "spikes"
};
var PIECE_UP = Object.fromEntries(PIECES.filter((p) => p.up).map((p) => [p.kind, p.up]));
var isWall14 = (k) => /^(wall|gate)-(wood|stone|metal)$/.test(k);
var isGate14 = (k) => /^gate-(wood|stone|metal)$/.test(k);
/** What fixing a broken piece costs (rebuilds it as wood tier). */
function repairCost(kind, hp, max) {
	const p = PIECES.find((x) => x.kind === kind) ?? PIECES[0];
	const f = Math.max(0, 1 - hp / max);
	const out = {};
	for (const [m, n] of Object.entries(p.cost)) {
		const v = Math.ceil(n * f * .6);
		if (v > 0) out[m] = v;
	}
	return out;
}
var CRAFT14 = [
	{
		id: "c-knife",
		makes: "knife",
		qty: 1,
		tier: 1,
		group: "Weapons",
		cost: {
			junk: 1,
			wood: 1
		}
	},
	{
		id: "c-hatchet",
		makes: "hatchet",
		qty: 1,
		tier: 1,
		group: "Tools",
		cost: {
			wood: 2,
			junk: 1
		}
	},
	{
		id: "c-pick",
		makes: "pick",
		qty: 1,
		tier: 1,
		group: "Tools",
		cost: {
			wood: 2,
			stone: 2,
			junk: 1
		}
	},
	{
		id: "c-cap",
		makes: "woolcap",
		qty: 1,
		tier: 1,
		group: "Armor",
		cost: { cloth: 2 }
	},
	{
		id: "c-canvas",
		makes: "canvas",
		qty: 1,
		tier: 1,
		group: "Armor",
		cost: { cloth: 4 }
	},
	{
		id: "c-trousers",
		makes: "trousers",
		qty: 1,
		tier: 1,
		group: "Armor",
		cost: { cloth: 3 }
	},
	{
		id: "c-snare",
		makes: "snare",
		qty: 1,
		tier: 1,
		group: "Traps",
		cost: {
			junk: 1,
			cloth: 1
		}
	},
	{
		id: "c-bandage",
		makes: "bandage",
		qty: 2,
		tier: 1,
		group: "Meds",
		cost: { cloth: 2 }
	},
	{
		id: "c-shells",
		makes: "shells",
		qty: 4,
		tier: 1,
		group: "Ammo",
		cost: {
			iron: 2,
			junk: 1
		}
	},
	{
		id: "c-knife2",
		makes: "knife-std",
		qty: 1,
		tier: 2,
		group: "Weapons",
		cost: {
			iron: 3,
			wood: 1,
			hide: 1
		}
	},
	{
		id: "c-axe2",
		makes: "hatchet-std",
		qty: 1,
		tier: 2,
		group: "Weapons",
		cost: {
			iron: 4,
			wood: 2,
			junk: 2
		}
	},
	{
		id: "c-pick2",
		makes: "pick-std",
		qty: 1,
		tier: 2,
		group: "Tools",
		cost: {
			iron: 4,
			wood: 2,
			stone: 2
		}
	},
	{
		id: "c-chaps",
		makes: "chaps",
		qty: 1,
		tier: 2,
		group: "Armor",
		cost: {
			hide: 3,
			cloth: 1
		}
	},
	{
		id: "c-bracers",
		makes: "bracers",
		qty: 1,
		tier: 2,
		group: "Armor",
		cost: {
			hide: 2,
			cloth: 1
		}
	},
	{
		id: "c-waxed",
		makes: "waxed",
		qty: 1,
		tier: 2,
		group: "Armor",
		cost: {
			cloth: 4,
			hide: 2
		}
	},
	{
		id: "c-steeltrap",
		makes: "steeltrap",
		qty: 1,
		tier: 2,
		group: "Traps",
		cost: {
			iron: 3,
			junk: 2
		}
	},
	{
		id: "c-bandage2",
		makes: "bandage-std",
		qty: 2,
		tier: 2,
		group: "Meds",
		cost: {
			cloth: 2,
			hide: 1
		}
	},
	{
		id: "c-kit",
		makes: "kit",
		qty: 1,
		tier: 2,
		group: "Meds",
		cost: {
			cloth: 3,
			iron: 1
		}
	},
	{
		id: "c-shells2",
		makes: "shells",
		qty: 8,
		tier: 2,
		group: "Ammo",
		cost: {
			iron: 3,
			junk: 2
		}
	},
	{
		id: "c-axe3",
		makes: "hatchet-good",
		qty: 1,
		tier: 3,
		group: "Weapons",
		cost: {
			iron: 6,
			grokclaw: 1,
			hide: 1
		}
	},
	{
		id: "c-knife3",
		makes: "knife-good",
		qty: 1,
		tier: 3,
		group: "Weapons",
		cost: {
			iron: 4,
			grokclaw: 1
		}
	},
	{
		id: "c-helm",
		makes: "scraphelm",
		qty: 1,
		tier: 3,
		group: "Armor",
		cost: {
			iron: 5,
			junk: 3,
			cloth: 1
		}
	},
	{
		id: "c-plate",
		makes: "plate",
		qty: 1,
		tier: 3,
		group: "Armor",
		cost: {
			iron: 8,
			junk: 4,
			hide: 2
		}
	},
	{
		id: "c-steeltoes",
		makes: "steeltoes",
		qty: 1,
		tier: 3,
		group: "Armor",
		cost: {
			iron: 4,
			hide: 2
		}
	},
	{
		id: "c-bomb",
		makes: "bomb",
		qty: 1,
		tier: 3,
		group: "Traps",
		cost: {
			iron: 3,
			junk: 3,
			cloth: 1
		}
	},
	{
		id: "c-bag1",
		makes: "bag-sack",
		qty: 1,
		tier: 1,
		group: "Tools",
		cost: { cloth: 3 }
	},
	{
		id: "c-bag2",
		makes: "bag-hide",
		qty: 1,
		tier: 2,
		group: "Tools",
		cost: {
			hide: 3,
			cloth: 2
		}
	},
	{
		id: "c-bag3",
		makes: "bag-frame",
		qty: 1,
		tier: 3,
		group: "Tools",
		cost: {
			hide: 3,
			wood: 3,
			iron: 2
		}
	},
	{
		id: "c-medicine",
		makes: "medicine",
		qty: 1,
		tier: 3,
		group: "Meds",
		cost: {
			cloth: 2,
			grokclaw: 1
		}
	}
];
var BENCH_UP = {
	1: {
		wood: 6,
		iron: 4,
		junk: 2
	},
	2: {
		stone: 6,
		iron: 8,
		junk: 4,
		grokclaw: 1
	}
};
/** Where each v14 sprite meets the ground: [x frac, frac up from the bottom]. Art is 2x world px. */
var ART14 = /* @__PURE__ */ new Set([
	"wall-wood",
	"wall-stone",
	"wall-metal",
	"gate-wood",
	"gate-stone",
	"gate-metal",
	"wall-x",
	"spikes",
	"chest",
	"rainbarrel",
	"sandbags",
	"sandbags-x",
	"workbench",
	"wreck",
	"firering",
	"stash",
	"sign-farm",
	"lookout",
	"lookout-x",
	"garden",
	"smokehouse",
	"raincollector",
	"still"
]);
var anchorOf = (img) => img.startsWith("wall-x") ? .256 : img.startsWith("wall-") ? .16 : img.startsWith("gate-") ? .155 : .06;
var EQUIP_SLOTS = [
	"head",
	"body",
	"legs",
	"feet",
	"hands",
	"main",
	"off",
	"back"
];
/** Player field that holds each slot (body/head/legs/hands are the original armor fields). */
var SLOT_FIELD = {
	head: "headId",
	body: "coatId",
	legs: "legsId",
	feet: "feetId",
	hands: "handsId",
	main: "weaponId",
	off: "offId",
	back: "backId"
};
/** Footprint in grid cells: small things 1x1, coats 2x3, rifles 1x4, axes 1x3, and so on. */
function itemSize(id) {
	const g = GEAR[id];
	if (!g) return {
		w: 1,
		h: 1
	};
	switch (g.family) {
		case "carbine":
		case "scatter": return {
			w: 1,
			h: 4
		};
		case "axe":
		case "pickaxe":
		case "pry": return {
			w: 1,
			h: 3
		};
		case "knife":
		case "revolver": return {
			w: 1,
			h: 2
		};
		case "lockpick": return {
			w: 1,
			h: 1
		};
	}
	if (g.kind === "coat") {
		const s = equipSlotOf(g);
		if (s === "body") return {
			w: 2,
			h: 3
		};
		if (s === "back") return {
			w: 2,
			h: 3
		};
		return {
			w: 2,
			h: 2
		};
	}
	if (id === "hide" || id === "pelt" || id === "antlers") return {
		w: 2,
		h: 2
	};
	if (id === "lantern") return {
		w: 1,
		h: 2
	};
	if (id === "stew" || id === "trauma" || id === "kit" || id === "fuel") return {
		w: 1,
		h: 2
	};
	return {
		w: 1,
		h: 1
	};
}
/** The equipment slot a wearable goes in (weapons: main hand; knives/revolvers may also go off-hand). */
function equipSlotOf(g) {
	if (!g) return null;
	if (g.kind === "weapon") return "main";
	if (g.kind !== "coat") return null;
	const s = g.slot ?? armorSlot(g);
	if (s === "chest") return "body";
	return s ?? null;
}
function slotAccepts(slot, id) {
	const g = GEAR[id];
	if (!g) return false;
	if (slot === "main") return g.kind === "weapon";
	if (slot === "off") return g.kind === "weapon" && (g.family === "knife" || g.family === "revolver");
	return equipSlotOf(g) === slot;
}
/** How many of a stack are worn (so only the rest needs room in the grid). */
function wornCount(p, id) {
	let n = 0;
	for (const s of EQUIP_SLOTS) if (p[SLOT_FIELD[s]] === id) n += 1;
	return n;
}
function gridRows(p) {
	return Math.max(2, 4 + (p.backId === "packframe" ? 2 : p.backId === "backpack" ? 1 : 0) - (p.small ? 2 : 0) + (Number(p.bagLv) || 0));
}
/** Place every loose stack: keep saved spots that still fit, then pack the rest top-left first
* (column by column, like the old game). Stacks that cannot fit spill into extra rows below the
* grid (overfull) rather than vanishing. */
function layoutGrid(p) {
	const rows = gridRows(p);
	const pos = p.gridPos ?? {};
	const loose = p.bag.filter((s) => s.qty > 0 && GEAR[s.id] && s.qty - wornCount(p, s.id) > 0);
	let cap = rows;
	const taken = [];
	const free = (x, y, w, h) => {
		if (x < 0 || y < 0 || x + w > 10) return false;
		for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (taken[yy]?.[xx]) return false;
		return true;
	};
	const take = (x, y, w, h) => {
		for (let yy = y; yy < y + h; yy++) {
			taken[yy] = taken[yy] ?? [];
			for (let xx = x; xx < x + w; xx++) taken[yy][xx] = true;
		}
	};
	const items = [];
	const rest = [];
	for (const s of loose) {
		const { w, h } = itemSize(s.id);
		const at = pos[s.id];
		if (at && at[1] + h <= rows && free(at[0], at[1], w, h)) {
			take(at[0], at[1], w, h);
			items.push({
				id: s.id,
				x: at[0],
				y: at[1],
				w,
				h
			});
		} else rest.push({
			id: s.id,
			w,
			h
		});
	}
	rest.sort((a, b) => b.w * b.h - a.w * a.h);
	for (const r of rest) {
		let done = false;
		for (let limit = rows; !done && limit < rows + 40; limit++) for (let x = 0; x <= 10 - r.w && !done; x++) for (let y = 0; y + r.h <= limit && !done; y++) if (free(x, y, r.w, r.h)) {
			take(x, y, r.w, r.h);
			items.push({
				id: r.id,
				x,
				y,
				w: r.w,
				h: r.h
			});
			cap = Math.max(cap, y + r.h);
			done = true;
		}
	}
	const next = {};
	for (const it of items) next[it.id] = [it.x, it.y];
	p.gridPos = next;
	return {
		items,
		rows: Math.max(rows, cap),
		over: Math.max(0, cap - rows)
	};
}
/** Would a new stack of this item fit in the grid without spilling? */
function canFit(p, id) {
	const have = p.bag.find((s) => s.id === id && s.qty > 0);
	if (have && have.qty - wornCount(p, id) > 0) return true;
	const bag = have ? p.bag.map((s) => s === have ? {
		id,
		qty: s.qty + 1
	} : s) : [...p.bag, {
		id,
		qty: 1
	}];
	return layoutGrid({
		...p,
		bag,
		gridPos: { ...p.gridPos ?? {} }
	}).over === 0;
}
/** Can this stack move to (x, y) without overlapping anything else? */
function fitsAt(p, id, x, y) {
	const { w, h } = itemSize(id);
	if (x < 0 || y < 0 || x + w > 10 || y + h > gridRows(p)) return false;
	return !layoutGrid(p).items.some((it) => it.id !== id && x < it.x + it.w && it.x < x + w && y < it.y + it.h && it.y < y + h);
}
/** Real seconds in one in-game day. Change this number later to retune the clock. */
/** v14.1: slowed from 12 to 20 real minutes per in-game day. */
var DAY_LENGTH_SEC = 1200;
/** Day 1 starts at 7:00. */
function morningClock() {
	return DAY_LENGTH_SEC * (7 / 24);
}
function clockLabel(totalSec) {
	const span = DAY_LENGTH_SEC;
	const day = Math.floor(totalSec / span) + 1;
	const hourFloat = (totalSec % span + span) % span / span * 24;
	const hour = Math.floor(hourFloat);
	const minute = Math.floor((hourFloat - hour) * 60);
	return `Day ${day} · ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
/** 0 at noon, 1 at midnight. */
function nightShade(totalSec) {
	const span = DAY_LENGTH_SEC;
	const hour = (totalSec % span + span) % span / span * 24;
	return Math.max(0, Math.cos(hour / 24 * Math.PI * 2));
}
var SEED = 5402695;
var PROP_SPEC = {
	"tree-dead": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 420,
		image: "tree-dead"
	},
	"tree-scrub": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 67,
		image: "tree-scrub"
	},
	"tree-pine": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 553,
		image: "tree-pine"
	},
	"tree-yellow": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 442,
		image: "tree-yellow"
	},
	"tree-orange": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 464,
		image: "tree-orange"
	},
	"tree-red": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 464,
		image: "tree-red"
	},
	"tree-spruce": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 552,
		image: "tree-spruce"
	},
	"tree-fir": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 531,
		image: "tree-fir"
	},
	"tree-birch": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 444,
		image: "tree-birch"
	},
	"tree-bare": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 420,
		image: "tree-bare"
	},
	"car-sedan": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 112,
		image: "car-sedan"
	},
	"car-truck": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 126,
		image: "car-truck"
	},
	rock: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 52,
		image: "rock"
	},
	shack: {
		w: 2,
		h: 2,
		blocks: true,
		drawH: 245,
		image: "shack"
	},
	ruin: {
		w: 2,
		h: 2,
		blocks: true,
		drawH: 420,
		image: "ruin"
	},
	wall: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 82,
		image: "wall"
	},
	workshop: {
		w: 2,
		h: 2,
		blocks: true,
		drawH: 46,
		image: "workshop"
	},
	campfire: {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 30,
		image: "campfire"
	},
	scrap: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 43,
		image: "scrap"
	},
	logs: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 36,
		image: "logs"
	},
	shelter: {
		w: 2,
		h: 2,
		blocks: true,
		drawH: 245,
		image: "shack"
	},
	farmhouse: {
		w: 2,
		h: 2,
		blocks: true,
		drawH: 500,
		image: "farmhouse"
	},
	barn: {
		w: 2,
		h: 2,
		blocks: true,
		drawH: 450,
		image: "barn"
	},
	orchard: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 204,
		image: "orchard"
	},
	maple: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 498,
		image: "maple"
	},
	press: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 51,
		image: "press"
	},
	crates: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 30,
		image: "crates"
	},
	cot: {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 60,
		image: "cot"
	},
	hatch: {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 51,
		image: "hatch"
	},
	stall: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 91,
		image: "stall"
	},
	cache: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 97,
		image: "cache"
	},
	bike: {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 32,
		image: "bike"
	},
	stand: {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 67,
		image: "stand"
	},
	"stand-up": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 111,
		image: "stand-up"
	},
	blind: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 72,
		image: "blind"
	},
	"blind-up": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 84,
		image: "blind-up"
	},
	firepot: {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 37,
		image: "firepot"
	},
	"firepot-up": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 35,
		image: "firepot-up"
	},
	nest: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 56,
		image: "nest"
	},
	"nest-up": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 66,
		image: "nest-up"
	},
	fence: {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 66,
		image: "fence"
	},
	"fence-2": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 77,
		image: "fence-2"
	},
	"fence-3": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 88,
		image: "fence-3"
	},
	"fence-x": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 44,
		image: "fence-x"
	},
	"stand-3": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 132,
		image: "stand-3"
	},
	"stand-x": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 66,
		image: "stand-x"
	},
	"blind-3": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 110,
		image: "blind-3"
	},
	"blind-x": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 55,
		image: "blind-x"
	},
	"firepot-3": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 44,
		image: "firepot-3"
	},
	"firepot-x": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 24,
		image: "firepot-x"
	},
	"nest-3": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 82,
		image: "nest-3"
	},
	"nest-x": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 44,
		image: "nest-x"
	},
	"post-loft": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 99,
		image: "post-loft"
	},
	"post-porch": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 58,
		image: "post-porch"
	},
	"post-roof": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 77,
		image: "post-roof"
	},
	scarecrow: {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 66,
		image: "scarecrow"
	},
	bait: {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 29,
		image: "bait"
	},
	tractor: {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 83,
		image: "tractor"
	},
	"wall-wood": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 125,
		image: "v14/wall-wood"
	},
	"wall-stone": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 125,
		image: "v14/wall-stone"
	},
	"wall-metal": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 125,
		image: "v14/wall-metal"
	},
	"gate-wood": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 129,
		image: "v14/gate-wood"
	},
	"gate-stone": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 129,
		image: "v14/gate-stone"
	},
	"gate-metal": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 129,
		image: "v14/gate-metal"
	},
	"wall-x": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 78,
		image: "v14/wall-x"
	},
	"spikes": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 26,
		image: "v14/spikes"
	},
	"chest": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 30,
		image: "v14/chest"
	},
	"rainbarrel": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 42,
		image: "v14/rainbarrel"
	},
	"sandbags": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 34,
		image: "v14/sandbags"
	},
	"sandbags-x": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 18,
		image: "v14/sandbags-x"
	},
	"workbench": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 46,
		image: "v14/workbench"
	},
	"wreck": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 62,
		image: "v14/wreck"
	},
	"firering": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 24,
		image: "v14/firering"
	},
	"stash": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 20,
		image: "v14/stash"
	},
	"sign-farm": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 66,
		image: "v14/sign-farm"
	},
	"lookout": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 154,
		image: "v14/lookout"
	},
	"lookout-x": {
		w: 1,
		h: 1,
		blocks: false,
		drawH: 154,
		image: "v14/lookout-x"
	},
	"garden": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 22,
		image: "v14/garden"
	},
	"smokehouse": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 88,
		image: "v14/smokehouse"
	},
	"raincollector": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 50,
		image: "v14/raincollector"
	},
	"still": {
		w: 1,
		h: 1,
		blocks: true,
		drawH: 52,
		image: "v14/still"
	}
};
var RECIPES = [
	{
		kind: "shelter",
		wood: 8,
		stone: 4,
		scrap: 0,
		label: "Lean-to",
		blurb: "Spruce poles and canvas. You wake here if you fall."
	},
	{
		kind: "wall",
		wood: 2,
		stone: 0,
		scrap: 0,
		label: "Log wall",
		blurb: "A solid crib of logs. It does not burn as fast."
	},
	{
		kind: "workshop",
		wood: 6,
		stone: 2,
		scrap: 8,
		label: "Smithy",
		blurb: "A stump forge. Camp iron in, nails out. Slowly."
	},
	{
		kind: "campfire",
		wood: 3,
		stone: 2,
		scrap: 0,
		label: "Cookfire",
		blurb: "Heat, dry wool, hot water. Rest, not a blessing."
	},
	{
		kind: "stand",
		wood: 6,
		stone: 2,
		scrap: 1,
		label: "Rifle stand",
		blurb: "A raised platform and sandbags. It fires on a raid."
	},
	{
		kind: "stand-up",
		wood: 4,
		stone: 2,
		scrap: 4,
		label: "Raised stand",
		blurb: "Higher sandbags and a cedar roof. Hits harder."
	},
	{
		kind: "blind",
		wood: 5,
		stone: 0,
		scrap: 1,
		label: "Hunting blind",
		blurb: "Brush and cedar. A long shot at night."
	},
	{
		kind: "blind-up",
		wood: 4,
		stone: 1,
		scrap: 3,
		label: "Cedar blind",
		blurb: "Thicker cover and a longer slit."
	},
	{
		kind: "firepot",
		wood: 1,
		stone: 2,
		scrap: 2,
		label: "Fire pot",
		blurb: "Burning pitch. Raiders slow when they pass it."
	},
	{
		kind: "firepot-up",
		wood: 1,
		stone: 3,
		scrap: 3,
		label: "Stone fire pot",
		blurb: "A wider pot in a ring of stone."
	},
	{
		kind: "nest",
		wood: 8,
		stone: 1,
		scrap: 4,
		label: "Gun nest",
		blurb: "Logs and a heavy gun. Mean at close range."
	},
	{
		kind: "nest-up",
		wood: 6,
		stone: 2,
		scrap: 6,
		label: "Camp gun",
		blurb: "Higher walls and a mounted camp gun."
	},
	{
		kind: "fence",
		wood: 2,
		stone: 0,
		scrap: 0,
		label: "Stake fence",
		blurb: "A section of sharpened spruce. Most raiders have to go around."
	},
	{
		kind: "scarecrow",
		wood: 2,
		stone: 0,
		scrap: 0,
		label: "Scarecrow",
		blurb: "Draws a raid toward the row, away from the house."
	},
	{
		kind: "bait",
		wood: 1,
		stone: 0,
		scrap: 1,
		label: "Bait cache",
		blurb: "Apples and a ham. They come for it."
	},
	{
		kind: "post-loft",
		wood: 4,
		stone: 0,
		scrap: 2,
		label: "Hayloft",
		blurb: "A rifle slit for the barn loft. It fires on a raid."
	},
	{
		kind: "post-porch",
		wood: 3,
		stone: 0,
		scrap: 1,
		label: "Porch post",
		blurb: "A chair and a lantern on the farmhouse porch."
	},
	{
		kind: "post-roof",
		wood: 4,
		stone: 1,
		scrap: 2,
		label: "Roof stand",
		blurb: "Planks and a sandbag on a shack roof."
	},
	...PIECES.filter((p) => p.kind !== "campfire").map((p) => ({
		kind: p.kind,
		wood: p.cost.wood ?? 0,
		stone: p.cost.stone ?? 0,
		scrap: p.cost.iron ?? 0,
		label: p.name,
		blurb: p.blurb,
		v14: true,
		need14: p.cost
	}))
];
var PLACES = {
	ashwell: {
		tx: 40,
		ty: 42,
		name: "Lowelltown"
	},
	cambridge: {
		tx: 58,
		ty: 36,
		name: "Cambridge Road"
	},
	millcross: {
		tx: 80,
		ty: 74,
		name: "Attean"
	},
	rustyard: {
		tx: 120,
		ty: 50,
		name: "The Chopping"
	},
	bonehollow: {
		tx: 124,
		ty: 120,
		name: "Holeb"
	}
};
var FARM = {
	tx: 58,
	ty: 36,
	r: 12
};
function inFarm(tx, ty) {
	return (tx - FARM.tx) ** 2 + (ty - FARM.ty) ** 2 <= FARM.r * FARM.r;
}
var DIRS = [
	[
		1,
		0,
		10
	],
	[
		-1,
		0,
		10
	],
	[
		0,
		1,
		10
	],
	[
		0,
		-1,
		10
	],
	[
		1,
		1,
		14
	],
	[
		1,
		-1,
		14
	],
	[
		-1,
		1,
		14
	],
	[
		-1,
		-1,
		14
	]
];
var MinHeap = class {
	n = [];
	k = [];
	get length() {
		return this.n.length;
	}
	push(node, key) {
		this.n.push(node);
		this.k.push(key);
		this.up(this.n.length - 1);
	}
	pop() {
		const top = this.n[0] ?? -1;
		const ln = this.n.pop();
		const lk = this.k.pop();
		if (this.n.length && ln !== void 0 && lk !== void 0) {
			this.n[0] = ln;
			this.k[0] = lk;
			this.down(0);
		}
		return top;
	}
	up(i) {
		while (i > 0) {
			const p = i - 1 >> 1;
			if (this.k[i] >= this.k[p]) break;
			this.swap(i, p);
			i = p;
		}
	}
	down(i) {
		const n = this.n.length;
		for (;;) {
			let s = i;
			const l = i * 2 + 1;
			const r = l + 1;
			if (l < n && this.k[l] < this.k[s]) s = l;
			if (r < n && this.k[r] < this.k[s]) s = r;
			if (s === i) break;
			this.swap(i, s);
			i = s;
		}
	}
	swap(a, b) {
		const nk = this.n[a];
		this.n[a] = this.n[b];
		this.n[b] = nk;
		const kk = this.k[a];
		this.k[a] = this.k[b];
		this.k[b] = kk;
	}
};
function octile(x, y, gx, gy) {
	const dx = Math.abs(x - gx);
	const dy = Math.abs(y - gy);
	return 10 * (dx + dy) + -6 * Math.min(dx, dy);
}
/** Tile-coordinate A*. Returns tile centers from the step after start through the goal. */
function findPath(blocked, mapW, mapH, sx, sy, gx, gy, maxNodes = 14e3) {
	if (sx === gx && sy === gy) return [];
	if (sx < 0 || sy < 0 || gx < 0 || gy < 0 || sx >= mapW || sy >= mapH || gx >= mapW || gy >= mapH) return null;
	const start = sy * mapW + sx;
	const goal = gy * mapW + gx;
	if (blocked[start] || blocked[goal]) return null;
	const size = mapW * mapH;
	const gScore = new Float64Array(size);
	gScore.fill(Number.POSITIVE_INFINITY);
	gScore[start] = 0;
	const came = new Int32Array(size);
	came.fill(-1);
	const closed = new Uint8Array(size);
	const open = new MinHeap();
	open.push(start, octile(sx, sy, gx, gy));
	let expanded = 0;
	while (open.length && expanded < maxNodes) {
		const cur = open.pop();
		if (cur < 0 || closed[cur]) continue;
		expanded++;
		if (cur === goal) {
			const cells = [];
			let c = goal;
			while (c !== start && c !== -1) {
				cells.push({
					x: c % mapW + .5,
					y: (c / mapW | 0) + .5
				});
				c = came[c];
			}
			cells.reverse();
			return cells;
		}
		closed[cur] = 1;
		const cx = cur % mapW;
		const cy = cur / mapW | 0;
		for (const [dx, dy, cost] of DIRS) {
			const nx = cx + dx;
			const ny = cy + dy;
			if (nx < 0 || ny < 0 || nx >= mapW || ny >= mapH) continue;
			const ni = ny * mapW + nx;
			if (blocked[ni] || closed[ni]) continue;
			if (dx !== 0 && dy !== 0 && (blocked[cy * mapW + nx] || blocked[ny * mapW + cx])) continue;
			const ng = gScore[cur] + cost;
			if (ng < gScore[ni]) {
				gScore[ni] = ng;
				came[ni] = cur;
				open.push(ni, ng + octile(nx, ny, gx, gy));
			}
		}
	}
	return null;
}
var genSalt = 0;
var shapingHome = true;
function hash(x, y, salt = 0) {
	let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(salt + SEED + genSalt | 0, 144269503);
	n = Math.imul(n ^ n >>> 13, 1274126177);
	return ((n ^ n >>> 16) >>> 0) / 4294967296;
}
function noise(x, y) {
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const tx = x - x0;
	const ty = y - y0;
	const sx = tx * tx * (3 - 2 * tx);
	const sy = ty * ty * (3 - 2 * ty);
	const v = (ix, iy) => hash(ix, iy, 11);
	const a = v(x0, y0) * (1 - sx) + v(x0 + 1, y0) * sx;
	const b = v(x0, y0 + 1) * (1 - sx) + v(x0 + 1, y0 + 1) * sx;
	return a * (1 - sy) + b * sy;
}
function idx(tx, ty) {
	return ty * 156 + tx;
}
function inMap(tx, ty) {
	return tx >= 0 && ty >= 0 && tx < 156 && ty < 156;
}
function inHex(tx, ty) {
	const ax = Math.abs(tx - 80);
	const ay = Math.abs(ty - 78);
	if (ax > Math.sqrt(3) / 2 * 74) return false;
	return ay <= 74 - ax / Math.sqrt(3);
}
function pickSides(seed) {
	const rank = (side) => {
		let n = Math.imul(side + 3, 374761393) ^ Math.imul(seed + 91 | 0, 668265263);
		n = Math.imul(n ^ n >>> 13, 1274126177);
		return (n ^ n >>> 16) >>> 0;
	};
	const order = [
		0,
		1,
		2,
		3,
		4,
		5
	].sort((a, b) => rank(a) - rank(b) || a - b);
	const count = rank(9) % 2 === 0 ? 2 : 3;
	return order.slice(0, count).sort((a, b) => a - b);
}
function at(tx, ty) {
	return [tx + 22, ty + 20];
}
function herd(tx, ty) {
	let x = tx + 22;
	let y = ty + 20;
	if (genSalt !== 0) {
		x += Math.round((hash(tx, ty, 50) - .5) * 10);
		y += Math.round((hash(tx, ty, 51) - .5) * 10);
		const pulled = pullIn(x, y);
		x = pulled[0];
		y = pulled[1];
	}
	if (inFarm(x, y) || !inHex(x, y)) return [tx + 22, ty + 20];
	return [x, y];
}
function pullIn(tx, ty) {
	if (inHex(tx, ty)) return [tx, ty];
	const dx = tx - 80;
	const dy = ty - 78;
	for (let s = .96; s > .15; s -= .04) {
		const x = Math.round(80 + dx * s);
		const y = Math.round(78 + dy * s);
		if (inHex(x, y)) return [x, y];
	}
	return [80, 78];
}
function edgePoint(side, inset) {
	const a = (-60 + side * 60) * Math.PI / 180;
	const d = 74 * Math.cos(Math.PI / 6) - inset;
	const pulled = pullIn(Math.round(80 + Math.cos(a) * d), Math.round(78 + Math.sin(a) * d));
	return {
		tx: pulled[0],
		ty: pulled[1]
	};
}
function propCenter(p) {
	const spec = PROP_SPEC[p.kind];
	return {
		x: (p.tx + spec.w / 2) * 64,
		y: (p.ty + spec.h / 2) * 64
	};
}
function createWorld(seed = SEED, mapId = 0, exits) {
	genSalt = mapId === 0 && seed === 5402695 ? 0 : seed + mapId * 9176 | 0;
	const homeSides = exits && exits.length >= 2 ? exits : pickSides(seed);
	const mouths = (mapId === 0 ? homeSides : homeSides.map((side) => (side + 3) % 6)).filter((side, i, all) => all.indexOf(side) === i);
	if (mapId === 1) return createReach(seed, homeSides, mouths);
	if (mapId === 2) return createSkowhegan(seed, homeSides);
	if (mapId >= 3) return createArea(seed, mapId, homeSides);
	shapingHome = true;
	const tiles = /* @__PURE__ */ new Uint8Array(24336);
	const blocked = /* @__PURE__ */ new Uint8Array(24336);
	fillLand(tiles, blocked, 0);
	const bend = genSalt !== 0;
	const mid = at(40, 28);
	const south = at(78, 78);
	const roadPts = [
		[
			[PLACES.ashwell.tx, PLACES.ashwell.ty],
			mid,
			[PLACES.rustyard.tx, PLACES.rustyard.ty]
		],
		[[PLACES.ashwell.tx, PLACES.ashwell.ty], [PLACES.cambridge.tx, 42]],
		[
			mid,
			[PLACES.millcross.tx, PLACES.millcross.ty],
			south,
			[PLACES.bonehollow.tx, PLACES.bonehollow.ty]
		]
	];
	for (const path of roadPts) for (let i = 0; i < path.length - 1; i++) layPath(tiles, blocked, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], bend, i + 3);
	for (const place of Object.values(PLACES)) for (let ty = place.ty - 7; ty <= place.ty + 7; ty++) for (let tx = place.tx - 7; tx <= place.tx + 7; tx++) {
		if (!inMap(tx, ty) || !inHex(tx, ty)) continue;
		if ((tx - place.tx) ** 2 + (ty - place.ty) ** 2 > 46) continue;
		if (tiles[idx(tx, ty)] !== 2) {
			tiles[idx(tx, ty)] = 0;
			blocked[idx(tx, ty)] = 0;
		}
	}
	const world = {
		tiles,
		blocked,
		props: [],
		npcs: [],
		enemies: [],
		startX: PLACES.ashwell.tx * 64 + 32,
		startY: PLACES.ashwell.ty * 64 + 32,
		nextPropId: 1,
		nextEnemyId: 1,
		id: 0,
		name: "Moose River",
		seed,
		exits: homeSides,
		gates: [],
		questBandits: 0
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
		world.startX = (cot.tx + .5) * 64;
		world.startY = (cot.ty + .5) * 64;
	} else {
		const start = nearestFree(world, PLACES.cambridge.tx, PLACES.cambridge.ty + 2);
		world.startX = start.x;
		world.startY = start.y;
	}
	return world;
}
function fillLand(tiles, blocked, mapId) {
	for (let ty = 0; ty < 156; ty++) for (let tx = 0; tx < 156; tx++) {
		if (!inHex(tx, ty)) {
			tiles[idx(tx, ty)] = 5;
			blocked[idx(tx, ty)] = 1;
			continue;
		}
		const sx = mapId === 0 ? tx - 22 : tx + 30;
		const sy = mapId === 0 ? ty - 20 : ty - 16;
		const n = noise(sx * .075, sy * .075) * .7 + noise(sx * .16 + 9, sy * .16) * .3;
		let t = 0;
		if (n > .74) t = 3;
		else if (n > .4) t = 1;
		tiles[idx(tx, ty)] = t;
		blocked[idx(tx, ty)] = t === 3 ? 1 : 0;
	}
}
function layPath(tiles, blocked, x0, y0, x1, y1, bend, salt) {
	const pts = bend ? bendPath(x0, y0, x1, y1, salt) : [[x0, y0], [x1, y1]];
	for (let i = 0; i < pts.length - 1; i++) line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], (x, y) => stampRoad(tiles, blocked, x, y));
}
function bendPath(x0, y0, x1, y1, salt) {
	const pts = [[x0, y0]];
	const len = Math.hypot(x1 - x0, y1 - y0) || 1;
	const px = -(y1 - y0) / len;
	const py = (x1 - x0) / len;
	for (let i = 1; i <= 3; i++) {
		const t = i / 4;
		const j = (hash(i + salt, salt, 60) - .5) * 28;
		const spot = pullIn(Math.round(x0 + (x1 - x0) * t + px * j), Math.round(y0 + (y1 - y0) * t + py * j));
		pts.push(spot);
	}
	pts.push([x1, y1]);
	return pts;
}
function nearestRoad(world, tx, ty) {
	let best = null;
	let bestD = 1e9;
	for (let y = 0; y < 156; y++) for (let x = 0; x < 156; x++) {
		if (world.tiles[idx(x, y)] !== 2 || world.blocked[idx(x, y)]) continue;
		const d = (x - tx) ** 2 + (y - ty) ** 2;
		if (d < bestD) {
			bestD = d;
			best = {
				tx: x,
				ty: y
			};
		}
	}
	return best;
}
function layExits(world, mouths, from) {
	const gates = [];
	mouths.forEach((side, n) => {
		const mouth = edgePoint(side, 3);
		const kink = edgePoint(side, 16);
		const arrive = edgePoint(side, 11);
		const start = from ?? nearestRoad(world, kink.tx, kink.ty) ?? {
			tx: 80,
			ty: 78
		};
		layPath(world.tiles, world.blocked, start.tx, start.ty, kink.tx, kink.ty, genSalt !== 0, 80 + side * 5 + n);
		layPath(world.tiles, world.blocked, kink.tx, kink.ty, mouth.tx, mouth.ty, false, 0);
		world.props = world.props.filter((p) => {
			const spec = PROP_SPEC[p.kind];
			const cx = p.tx + spec.w / 2;
			const cy = p.ty + spec.h / 2;
			if (!((cx - mouth.tx) ** 2 + (cy - mouth.ty) ** 2 < 18 || (cx - arrive.tx) ** 2 + (cy - arrive.ty) ** 2 < 12)) return true;
			vacate(world, p);
			return false;
		});
		stampRoad(world.tiles, world.blocked, mouth.tx, mouth.ty);
		stampRoad(world.tiles, world.blocked, arrive.tx, arrive.ty);
		gates.push({
			side,
			tx: mouth.tx,
			ty: mouth.ty,
			arriveTx: arrive.tx,
			arriveTy: arrive.ty
		});
	});
	return gates;
}
function createReach(seed, homeSides, mouths) {
	shapingHome = false;
	const tiles = /* @__PURE__ */ new Uint8Array(24336);
	const blocked = /* @__PURE__ */ new Uint8Array(24336);
	fillLand(tiles, blocked, 1);
	const world = {
		tiles,
		blocked,
		props: [],
		npcs: [],
		enemies: [],
		startX: 5152,
		startY: 5024,
		nextPropId: 1,
		nextEnemyId: 1,
		id: 1,
		name: "Chain of Ponds",
		seed,
		exits: homeSides,
		gates: [],
		questBandits: 0
	};
	world.gates = layExits(world, mouths, {
		tx: 80,
		ty: 78
	});
	scatter(world);
	clearPad(world, 80, 78, 6);
	addProp(world, "shack", 78, 77);
	addProp(world, "campfire", 81, 78);
	addProp(world, "logs", 83, 79, {
		resource: "wood",
		amount: 4
	});
	addProp(world, "scrap", 77, 80, {
		resource: "scrap",
		amount: 3
	});
	addNpc(world, "villager", "Nellie Foss", 80, 80);
	addNpc(world, "villager", "Villager", 82, 80);
	addNpc(world, "villager", "Villager", 78, 81);
	const ham = pullIn(102, 60);
	clearPad(world, ham[0], ham[1], 4);
	addProp(world, "ruin", ham[0] - 1, ham[1]);
	addProp(world, "campfire", ham[0] + 2, ham[1] + 1);
	addNpc(world, "villager", "Villager", ham[0] + 1, ham[1] + 2);
	placeOrchard(world);
	let pack = 1;
	for (const [dx, dy, kind, count] of [
		[
			18,
			-12,
			"wolf",
			4
		],
		[
			-26,
			-6,
			"wolf",
			5
		],
		[
			-20,
			14,
			"deer",
			3
		],
		[
			12,
			22,
			"coyote",
			5
		],
		[
			-16,
			-18,
			"moose",
			1
		],
		[
			8,
			-24,
			"rabbit",
			3
		]
	]) {
		const spot = pullIn(80 + dx, 78 + dy);
		addPack(world, kind, spot[0], spot[1], count, pack++);
	}
	addEnemy(world, 94, 86, false, false);
	addEnemy(world, 68, 94, false, true);
	shapingHome = true;
	return world;
}
/** v11.3: abandoned Skowhegan (map 2). Town north of the Kennebec gorge, one bridge, one road out south. */
function createSkowhegan(seed, homeSides) {
	shapingHome = false;
	const tiles = /* @__PURE__ */ new Uint8Array(24336);
	const blocked = /* @__PURE__ */ new Uint8Array(24336);
	fillLand(tiles, blocked, 2);
	const world = {
		tiles,
		blocked,
		props: [],
		npcs: [],
		enemies: [],
		startX: 5152,
		startY: 5024,
		nextPropId: 1,
		nextEnemyId: 1,
		id: 2,
		name: "Skowhegan",
		seed,
		exits: homeSides,
		gates: [],
		questBandits: 0
	};
	let south = 0;
	for (let s = 1; s < 6; s++) if (edgePoint(s, 3).ty > edgePoint(south, 3).ty) south = s;
	world.gates = layExits(world, [south], {
		tx: 80,
		ty: 85
	});
	scatter(world);
	const cx = 80, cy = 78;
	layPath(tiles, blocked, cx, 86, cx, 52, false, 0);
	layPath(tiles, blocked, 60, 64, 102, 64, false, 0);
	layPath(tiles, blocked, 64, 56, 98, 56, false, 0);
	clearPad(world, cx, 64, 6);
	const gy = 82;
	for (let ty = gy; ty <= 83; ty++) for (let tx = 0; tx < 156; tx++) {
		if (!inMap(tx, ty) || !inHex(tx, ty)) continue;
		const onBridge = Math.abs(tx - 80) <= 1;
		tiles[idx(tx, ty)] = onBridge ? 2 : 3;
		blocked[idx(tx, ty)] = onBridge ? 0 : 1;
	}
	world.props = world.props.filter((p) => {
		const hit = p.ty + PROP_SPEC[p.kind].h > 81 && p.ty < 85 && Math.abs(p.tx - cx) < 4;
		if (hit) vacate(world, p);
		return !hit;
	});
	for (let tx = 2; tx < 154; tx += 2) {
		if (Math.abs(tx - cx) <= 3 || !inHex(tx, 81)) continue;
		if (tx * 7 % 10 < 7) addProp(world, "rock", tx, 81);
	}
	addProp(world, "fence", 78, gy, {
		skin: "skowhegan-bridge",
		label: "KENNEBEC BRIDGE"
	});
	addProp(world, "fence", 82, gy);
	for (const b of SKOW_BUILDINGS) {
		clearPad(world, cx + b.dx, cy + b.dy, 3);
		addProp(world, b.kind, cx + b.dx, cy + b.dy, {
			skin: b.skin,
			label: b.label
		});
	}
	addNpc(world, "marcel", "Marcel Thibodeau", 76, 63, 1);
	addProp(world, "car-truck", 83, 68);
	addProp(world, "car-sedan", 74, 63);
	addProp(world, "scrap", 88, 62, {
		resource: "scrap",
		amount: 5
	});
	addProp(world, "scrap", 71, 58, {
		resource: "scrap",
		amount: 5
	});
	addProp(world, "crates", 86, 55);
	addEnemy(world, 82, 66, false, true);
	addEnemy(world, 68, 70, false, true);
	addEnemy(world, 92, 60, false, false);
	addEnemy(world, 74, 52, false, true);
	addEnemy(world, 96, 52, false, false);
	for (const e of world.enemies) {
		e.hp = e.maxHp = e.elite ? 44 : 28;
		e.atk = e.elite ? 9 : 6;
		e.xp = e.elite ? 26 : 14;
	}
	addPack(world, "deer", ...pullIn(50, 96), 3, 1);
	addPack(world, "rabbit", ...pullIn(106, 98), 3, 2);
	addPack(world, "coyote", ...pullIn(110, 48), 3, 3);
	shapingHome = true;
	return world;
}
function stampRoad(tiles, blocked, x, y) {
	for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
		const tx = x + dx;
		const ty = y + dy;
		if (!inMap(tx, ty) || !inHex(tx, ty)) continue;
		tiles[idx(tx, ty)] = 2;
		blocked[idx(tx, ty)] = 0;
	}
}
function line(x0, y0, x1, y1, plot) {
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
function fits(world, tx, ty, w, h, allowRoad) {
	if (tx < 2 || ty < 2 || tx + w >= 154 || ty + h >= 154) return false;
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
		const i = idx(tx + x, ty + y);
		if (world.blocked[i]) return false;
		if (world.tiles[i] === 5 || world.tiles[i] === 3) return false;
		if (!allowRoad && world.tiles[i] === 2) return false;
	}
	return true;
}
function occupy(world, prop) {
	const spec = PROP_SPEC[prop.kind];
	if (!spec.blocks) return;
	for (let y = 0; y < spec.h; y++) for (let x = 0; x < spec.w; x++) world.blocked[idx(prop.tx + x, prop.ty + y)] = 1;
}
function vacate(world, prop) {
	const spec = PROP_SPEC[prop.kind];
	if (!spec.blocks) return;
	for (let y = 0; y < spec.h; y++) for (let x = 0; x < spec.w; x++) world.blocked[idx(prop.tx + x, prop.ty + y)] = 0;
}
function addProp(world, kind, tx, ty, extra) {
	const spec = PROP_SPEC[kind];
	const allowRoad = kind === "car-sedan" || kind === "car-truck" || kind === "bike" || kind.startsWith("gate-") || kind === "wreck" || kind === "wall-x";
	if (!fits(world, tx, ty, spec.w, spec.h, allowRoad)) return null;
	const prop = {
		id: world.nextPropId++,
		kind,
		tx,
		ty,
		...extra
	};
	if ((kind === "shack" || kind === "ruin") && prop.locked !== false) prop.locked = true;
	if (kind === "shelter" || kind === "workshop" || kind === "campfire" || kind === "farmhouse" || kind === "barn" || kind === "hatch") prop.locked = false;
	world.props.push(prop);
	occupy(world, prop);
	return prop;
}
function tryPlace(world, kind, tx, ty) {
	return addProp(world, kind, tx, ty);
}
function placeHomestead(world) {
	for (let ty = FARM.ty - FARM.r - 1; ty <= FARM.ty + FARM.r + 1; ty++) for (let tx = FARM.tx - FARM.r - 1; tx <= FARM.tx + FARM.r + 1; tx++) {
		if (!inMap(tx, ty) || !inHex(tx, ty)) continue;
		if (!inFarm(tx, ty)) continue;
		if (world.tiles[idx(tx, ty)] !== 2) world.tiles[idx(tx, ty)] = 4;
		world.blocked[idx(tx, ty)] = 0;
	}
	world.props = world.props.filter((p) => {
		const spec = PROP_SPEC[p.kind];
		if (!inFarm(p.tx + spec.w / 2, p.ty + spec.h / 2)) return true;
		vacate(world, p);
		return false;
	});
	world.enemies = world.enemies.filter((e) => !inFarm(Math.floor(e.x / 64), Math.floor(e.y / 64)));
	plantYard(world, "farmhouse", 31, 13);
	plantYard(world, "barn", 40, 13);
	plantYard(world, "cot", 34, 14);
	plantYard(world, "press", 37, 16);
	plantYard(world, "crates", 38, 17, { amount: 4 });
	plantYard(world, "crates", 36, 17, { amount: 4 });
	plantYard(world, "shack", 44, 15);
	plantYard(world, "post-loft", 42, 14);
	plantYard(world, "post-porch", 34, 14);
	plantYard(world, "post-roof", 46, 16);
	plantYard(world, "tractor", 36, 15);
	plantYard(world, "scarecrow", 33, 20);
	plantYard(world, "bait", 39, 20);
	for (const tx of [
		29,
		31,
		33,
		42,
		44,
		46
	]) plantYard(world, "fence", tx, 11);
	for (const [tx, ty] of [
		at(30, 19),
		at(32, 19),
		at(34, 20),
		at(37, 20),
		at(39, 19),
		at(41, 20),
		at(43, 19)
	]) addProp(world, "orchard", tx, ty);
	for (const [tx, ty] of [
		at(29, 12),
		at(34, 12),
		at(38, 12),
		at(44, 12),
		at(28, 15),
		at(45, 15),
		at(29, 18)
	]) addProp(world, "maple", tx, ty);
}
function plantYard(world, kind, lx, ly, extra) {
	const spec = PROP_SPEC[kind];
	const spots = [
		[lx, ly],
		[lx + 1, ly],
		[lx - 1, ly],
		[lx, ly + 1],
		[lx, ly - 1],
		[lx + 1, ly + 1],
		[lx + 2, ly],
		[lx, ly + 2]
	];
	for (const [x, y] of spots) {
		const [tx, ty] = at(x, y);
		if (!inFarm(tx + spec.w / 2, ty + spec.h / 2)) continue;
		if (addProp(world, kind, tx, ty, extra)) return;
	}
	const [tx, ty] = at(lx, ly);
	for (let y = 0; y < spec.h; y++) for (let x = 0; x < spec.w; x++) {
		if (!inMap(tx + x, ty + y)) return;
		const i = idx(tx + x, ty + y);
		if (world.tiles[i] === 5) return;
		if (world.tiles[i] === 2 || world.tiles[i] === 3) world.tiles[i] = 4;
		world.blocked[i] = 0;
	}
	addProp(world, kind, tx, ty, extra);
}
/**
* Runs after layExits. An exit road can land on the farmhouse (layExits drops props near a gate),
* so put any lost farm building back next to its spot, then add the woodpile for the
* "First Snow on Cambridge Road" quest and the family who live here.
*/
function finishFarm(world) {
	const nearGate = (tx, ty, w, h) => world.gates.some((g) => {
		const cx = tx + w / 2;
		const cy = ty + h / 2;
		return (cx - g.arriveTx) ** 2 + (cy - g.arriveTy) ** 2 < 16 || (cx - g.tx) ** 2 + (cy - g.ty) ** 2 < 20;
	});
	const overlapsProp = (tx, ty, w, h) => world.props.some((p) => {
		const ps = PROP_SPEC[p.kind];
		return tx < p.tx + ps.w + 1 && tx + w + 1 > p.tx && ty < p.ty + ps.h + 1 && ty + h + 1 > p.ty;
	});
	const restore = (kind, home, extra) => {
		if (world.props.some((p) => p.kind === kind && inFarm(p.tx, p.ty))) return;
		const spec = PROP_SPEC[kind];
		for (let r = 0; r <= 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
			if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
			const tx = home[0] + dx;
			const ty = home[1] + dy;
			if (!inFarm(tx, ty) || nearGate(tx, ty, spec.w, spec.h) || overlapsProp(tx, ty, spec.w, spec.h)) continue;
			if (addProp(world, kind, tx, ty, extra)) return;
		}
	};
	restore("farmhouse", at(31, 13));
	restore("barn", at(40, 13));
	restore("cot", at(34, 14));
	restore("press", at(37, 16));
	restore("logs", at(42, 16), {
		resource: "wood",
		amount: 4
	});
	addNpc(world, "justin", "Justin", ...at(35, 15), 30);
	addNpc(world, "sarah", "Sarah", ...at(37, 15), 30);
	addNpc(world, "cyndal", "Cyndal", ...at(34, 18), 30);
	addNpc(world, "loki", "Loki", ...at(39, 18), 30);
}
function placeOrchard(world) {
	const spot = pullIn(28, 72);
	const tx = spot[0];
	const ty = spot[1];
	const step = 5;
	const gap = 6;
	clearPad(world, tx + 12, ty + 3, 16);
	world.enemies = world.enemies.filter((e) => {
		const ex = Math.floor(e.x / 64);
		const ey = Math.floor(e.y / 64);
		return (ex - (tx + 12)) ** 2 + (ey - (ty + 3)) ** 2 > 324;
	});
	for (let y = ty - 1; y <= ty + gap + 1; y++) for (let x = tx - 1; x <= tx + 25 + 1; x++) {
		if (!inMap(x, y) || !inHex(x, y)) continue;
		if (world.tiles[idx(x, y)] === 5) continue;
		world.tiles[idx(x, y)] = 0;
		world.blocked[idx(x, y)] = 0;
	}
	for (let i = 0; i < 6; i++) {
		addProp(world, "orchard", tx + i * step, ty);
		addProp(world, "orchard", tx + i * step, ty + gap);
	}
	const lane = ty + 3;
	for (const [x, y] of [[tx + 25 + 3, lane], [tx + 25 + 3, lane + 1]]) {
		if (!inMap(x, y) || !inHex(x, y)) continue;
		world.tiles[idx(x, y)] = 0;
		world.blocked[idx(x, y)] = 0;
	}
	addProp(world, "press", tx + 25 + 3, lane);
	addProp(world, "crates", tx + 25 + 3, lane + 1, { amount: 6 });
	const stand = ty + gap + 4;
	for (let y = stand - 1; y <= stand + 1; y++) for (let x = tx; x <= tx + 10; x++) {
		if (!inMap(x, y) || !inHex(x, y)) continue;
		if (world.tiles[idx(x, y)] === 5) continue;
		world.tiles[idx(x, y)] = 0;
		world.blocked[idx(x, y)] = 0;
	}
}
function clearPad(world, tx, ty, r) {
	world.props = world.props.filter((p) => {
		const spec = PROP_SPEC[p.kind];
		const cx = p.tx + spec.w / 2;
		const cy = p.ty + spec.h / 2;
		if ((cx - tx) ** 2 + (cy - ty) ** 2 > r * r) return true;
		vacate(world, p);
		return false;
	});
	for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) {
		if (!inMap(x, y) || x < 2 || y < 2 || x >= 154 || y >= 154) continue;
		if ((x - tx) ** 2 + (y - ty) ** 2 > r * r) continue;
		if (world.tiles[idx(x, y)] !== 2) {
			world.tiles[idx(x, y)] = 0;
			world.blocked[idx(x, y)] = 0;
		}
	}
}
function placeLeblanc(world) {
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
function placeCal(world) {
	const spot = at(66, 68);
	placeCalAt(world, spot[0], spot[1]);
}
/** Exit roads are laid after the camps and can cut straight through Jack's stall. If the stall
*  did not survive, move the whole camp to the nearest dry, road-free spot so he isn't left
*  standing on the gravel with no stand. */
function finishCal(world) {
	const jack = world.npcs.find((n) => n.role === "cal");
	const stall = world.props.find((p) => p.kind === "cache");
	const by = (kind) => !!stall && world.props.some((p) => p.kind === kind && Math.hypot(p.tx - stall.tx, p.ty - stall.ty) < 4);
	if (jack && stall && by("campfire") && by("logs") && by("crates")) return;
	const home = at(66, 68);
	const near = (tx, ty) => (tx - home[0]) ** 2 + (ty - home[1]) ** 2 <= 36;
	world.npcs = world.npcs.filter((n) => n.role !== "cal");
	world.props = world.props.filter((p) => {
		if ((p.kind === "cache" || p.kind === "crates" || p.kind === "campfire" || p.kind === "logs") && near(p.tx, p.ty)) {
			vacate(world, p);
			return false;
		}
		return true;
	});
	const clearOf = (tx, ty) => {
		for (let y = ty - 3; y <= ty + 3; y++) for (let x = tx - 3; x <= tx + 3; x++) {
			if (!inMap(x, y) || !inHex(x, y)) return false;
			const t = world.tiles[idx(x, y)];
			if (t === 5 || t === 2) return false;
		}
		return !world.gates.some((g) => (tx - g.arriveTx) ** 2 + (ty - g.arriveTy) ** 2 < 49 || (tx - g.tx) ** 2 + (ty - g.ty) ** 2 < 49);
	};
	for (let r = 1; r <= 14; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
		if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
		if (!clearOf(home[0] + dx, home[1] + dy)) continue;
		placeCalAt(world, home[0] + dx, home[1] + dy);
		return;
	}
	placeCalAt(world, home[0], home[1]);
}
function placeCalAt(world, tx, ty) {
	clearPad(world, tx, ty, 4);
	addProp(world, "cache", tx - 1, ty);
	addProp(world, "campfire", tx + 1, ty + 2);
	addProp(world, "crates", tx - 2, ty + 1);
	addProp(world, "logs", tx + 2, ty);
	addNpc(world, "cal", "Jack Ready", tx, ty + 1);
	clearSightline(world, tx, ty + 1);
}
/** Tall trees on the camera side (south-east in screen terms) of a spot would be drawn over
*  whoever stands there. Drop the ones in that wedge so the stall and trader stay in view. */
function clearSightline(world, tx, ty) {
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
function placeBunker(world) {
	const spot = at(20, 74);
	let tx = spot[0];
	let ty = spot[1];
	for (let r = 0; r < 8 && (world.tiles[idx(tx, ty)] === 2 || world.tiles[idx(tx, ty)] === 3); r++) {
		tx += 1;
		ty += 1;
	}
	clearPad(world, tx, ty, 2);
	addProp(world, "tree-pine", tx, ty - 2);
	addProp(world, "tree-orange", tx + 2, ty - 1);
	addProp(world, "tree-yellow", tx - 2, ty);
	addProp(world, "hatch", tx, ty);
}
function placeVillage(world) {
	const a = PLACES.ashwell;
	addProp(world, "shack", a.tx - 4, a.ty - 4);
	addProp(world, "shack", a.tx + 2, a.ty - 3);
	addProp(world, "shack", a.tx - 5, a.ty + 1);
	addProp(world, "campfire", a.tx + 1, a.ty + 2);
	addProp(world, "logs", a.tx + 6, a.ty + 3, {
		resource: "wood",
		amount: 4
	});
	addProp(world, "scrap", a.tx + 5, a.ty - 2, {
		resource: "scrap",
		amount: 4
	});
	addProp(world, "rock", a.tx - 6, a.ty + 4, {
		resource: "stone",
		amount: 3,
		loose: true
	});
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
	addProp(world, "scrap", r.tx + 1, r.ty + 3, {
		resource: "scrap",
		amount: 5
	});
	addProp(world, "scrap", r.tx - 6, r.ty, {
		resource: "scrap",
		amount: 4
	});
	const b = PLACES.bonehollow;
	addProp(world, "shack", b.tx - 5, b.ty - 4);
	addProp(world, "shack", b.tx + 2, b.ty - 3);
	addProp(world, "shack", b.tx - 3, b.ty + 2);
	addProp(world, "campfire", b.tx + 1, b.ty + 1);
}
function nearPlace(tx, ty, r) {
	if (!shapingHome) {
		if ((tx - 80) ** 2 + (ty - 78) ** 2 < r * r) return true;
		return false;
	}
	for (const p of Object.values(PLACES)) if ((tx - p.tx) ** 2 + (ty - p.ty) ** 2 < r * r) return true;
	return false;
}
function scatter(world) {
	let trees = 0;
	let rocks = 0;
	let cars = 0;
	let nodes = 0;
	for (let ty = 3; ty < 153; ty++) for (let tx = 3; tx < 153; tx++) {
		const i = idx(tx, ty);
		const t = world.tiles[i];
		if (world.blocked[i]) continue;
		const h = hash(tx, ty, 21);
		if (t === 2 && cars < 10 && h < .012 && !nearPlace(tx, ty, 10)) {
			if (addProp(world, hash(tx, ty, 22) < .5 ? "car-sedan" : "car-truck", tx, ty)) cars++;
			continue;
		}
		if (nearPlace(tx, ty, 9)) continue;
		if ((t === 1 || t === 0) && trees < 1100 && h < (t === 1 ? .11 : .045)) {
			const roll = hash(tx, ty, 23);
			const woods = [
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
				"tree-bare"
			];
			const kind = woods[Math.floor(roll * woods.length)];
			if (addProp(world, kind, tx, ty)) trees++;
			continue;
		}
		if (t === 0 && rocks < 160 && h > .985) {
			if (addProp(world, "rock", tx, ty)) rocks++;
			continue;
		}
		if (nodes < 90 && h > .955 && h < .972 && t !== 2) {
			const roll = hash(tx, ty, 24);
			if (roll < .34) {
				if (addProp(world, "logs", tx, ty, {
					resource: "wood",
					amount: 4
				})) nodes++;
			} else if (roll < .67) {
				if (addProp(world, "scrap", tx, ty, {
					resource: "scrap",
					amount: 4
				})) nodes++;
			} else if (addProp(world, "rock", tx, ty, {
				resource: "stone",
				amount: 3,
				loose: true
			})) nodes++;
		}
	}
	let ruins = 0;
	for (let ty = 8; ty < 148 && ruins < 10; ty += 3) for (let tx = 8; tx < 148 && ruins < 10; tx += 3) {
		if (nearPlace(tx, ty, 12)) continue;
		if (hash(tx, ty, 30) < .02 && world.tiles[idx(tx, ty)] !== 3) {
			if (addProp(world, "ruin", tx, ty)) ruins++;
		}
	}
}
function nearestFree(world, tx, ty) {
	for (let r = 0; r < 10; r++) for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) {
		if (!inMap(x, y)) continue;
		if (!world.blocked[idx(x, y)] && world.tiles[idx(x, y)] !== 3) return {
			x: x * 64 + 32,
			y: y * 64 + 32
		};
	}
	return {
		x: tx * 64 + 32,
		y: ty * 64 + 32
	};
}
function addNpc(world, role, name, tx, ty, stay = 0) {
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
		pause: stay > 0 ? stay : .6 + hash(tx, ty, 5) * 2,
		hp: role === "villager" ? 16 : 26,
		maxHp: role === "villager" ? 16 : 26
	});
}
/** v0.7 encounters, added last so every older enemy keeps its id (saves list the slain by id).
* Fixed ids in the 90000s for the same reason. */
var HOLEB_ID = 90001;
var PELLETIER_ID = 90002;
var WARDEN_ENEMY_ID = 90003;
function placeEncounters(world) {
	const keep = world.nextEnemyId;
	const h = PLACES.bonehollow;
	addBeast(world, "moose", h.tx - 18, h.ty - 3, 0);
	const moose = world.enemies[world.enemies.length - 1];
	Object.assign(moose, {
		id: HOLEB_ID,
		variant: "holeb",
		name: "The Moose of Holeb",
		hp: 110,
		maxHp: 110,
		atk: 14,
		xp: 50,
		elite: true
	});
	const m = PLACES.millcross;
	const mill = nearestFree(world, m.tx + 17, m.ty + 15);
	const mtx = Math.floor(mill.x / 64), mty = Math.floor(mill.y / 64);
	world.flood = {
		tx: mtx,
		ty: mty
	};
	for (const [dx, dy] of [[-3, -3], [3, 2]]) if (!world.blocked[idx(mtx + dx, mty + dy)]) addProp(world, "logs", mtx + dx, mty + dy);
	addEnemy(world, mtx, mty, false, true);
	const ma = world.enemies[world.enemies.length - 1];
	Object.assign(ma, {
		id: PELLETIER_ID,
		variant: "pelletier",
		name: "Mother Pelletier",
		hp: 64,
		maxHp: 64,
		atk: 9,
		xp: 38
	});
	addEnemy(world, mtx - 2, mty + 1, false, false);
	world.enemies[world.enemies.length - 1].id = 90004;
	addEnemy(world, mtx + 2, mty + 1, false, false);
	world.enemies[world.enemies.length - 1].id = 90005;
	const cx = Math.round((m.tx + h.tx) / 2), cy = Math.round((m.ty + h.ty) / 2);
	let best = null;
	for (let r = 0; r < 24 && !best; r++) for (let y = cy - r; y <= cy + r && !best; y++) for (let x = cx - r; x <= cx + r && !best; x++) if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) === r && world.tiles[idx(x, y)] === 2 && !world.blocked[idx(x, y)]) best = [x, y];
	const [wx, wy] = best ?? [cx, cy];
	addNpc(world, "warden", "The Bangor Warden", wx, wy, 9999);
	const w = world.npcs[world.npcs.length - 1];
	w.id = 990;
	w.hp = 70;
	w.maxHp = 70;
	world.checkpoint = {
		tx: wx,
		ty: wy
	};
	world.nextEnemyId = keep;
}
function addEnemy(world, tx, ty, quest, elite) {
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
		hurt: 0
	});
}
function addBeast(world, kind, tx, ty, pack) {
	const spot = nearestFree(world, tx, ty);
	const stats = kind === "moose" ? {
		hp: 46,
		atk: 10,
		xp: 16
	} : kind === "deer" ? {
		hp: 18,
		atk: 5,
		xp: 8
	} : kind === "wolf" ? {
		hp: 20,
		atk: 6,
		xp: 9
	} : kind === "coyote" ? {
		hp: 13,
		atk: 4,
		xp: 6
	} : kind === "rabbit" ? {
		hp: 4,
		atk: 0,
		xp: 2
	} : {
		hp: 4,
		atk: 0,
		xp: 1
	};
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
		hurt: 0
	});
}
function addPack(world, kind, tx, ty, count, pack) {
	const spots = [
		[0, 0],
		[2, 1],
		[-2, 1],
		[1, -2],
		[-1, 2],
		[3, -1],
		[-3, 0]
	];
	for (let i = 0; i < count && i < spots.length; i++) {
		const [dx, dy] = spots[i];
		addBeast(world, kind, tx + dx, ty + dy, pack);
	}
}
function placePeople(world) {
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
		at(38, 18)
	]) addNpc(world, "villager", "Villager", tx, ty);
	addProp(world, "bike", a.tx + 1, a.ty + 3);
	const bike = at(34, 21);
	addProp(world, "bike", bike[0], bike[1]);
	const r = PLACES.rustyard;
	const spots = [
		[r.tx, r.ty],
		[r.tx + 3, r.ty + 2],
		[r.tx - 3, r.ty + 1],
		[r.tx + 2, r.ty - 3],
		[r.tx - 2, r.ty - 2],
		[r.tx + 4, r.ty - 1]
	];
	const bosses = [
		{
			variant: "fur",
			name: "Harland Poulin"
		},
		{
			variant: "mask",
			name: "René Gallant"
		},
		{
			variant: "saw",
			name: "Gil Michaud"
		}
	];
	spots.forEach(([x, y], i) => {
		addEnemy(world, x, y, i < 3, i < 3);
		if (i >= 3) return;
		const e = world.enemies[world.enemies.length - 1];
		const b = bosses[i];
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
	const roads = [];
	for (let ty = 4; ty < 152; ty++) for (let tx = 4; tx < 152; tx++) if (world.tiles[idx(tx, ty)] === 2 && !world.blocked[idx(tx, ty)] && !nearPlace(tx, ty, 12)) roads.push([tx, ty]);
	const count = 10;
	if (roads.length) {
		const step = Math.max(1, Math.floor(roads.length / count));
		for (let i = 0; i < count; i++) {
			const cell = roads[Math.min(roads.length - 1, i * step)];
			addEnemy(world, cell[0], cell[1], false, false);
		}
	}
	let pack = 1;
	for (const [tx, ty, kind, count] of [
		[
			22,
			36,
			"wolf",
			3
		],
		[
			48,
			40,
			"wolf",
			2
		],
		[
			72,
			78,
			"wolf",
			3
		],
		[
			28,
			52,
			"coyote",
			6
		],
		[
			64,
			32,
			"coyote",
			5
		],
		[
			86,
			84,
			"coyote",
			7
		],
		[
			36,
			34,
			"deer",
			3
		],
		[
			58,
			70,
			"deer",
			3
		],
		[
			90,
			48,
			"deer",
			2
		],
		[
			44,
			58,
			"moose",
			2
		],
		[
			78,
			46,
			"moose",
			1
		],
		[
			96,
			72,
			"moose",
			2
		],
		[
			28,
			30,
			"rabbit",
			3
		],
		[
			48,
			32,
			"rabbit",
			4
		],
		[
			62,
			66,
			"rabbit",
			2
		],
		[
			33,
			32,
			"squirrel",
			3
		],
		[
			54,
			24,
			"squirrel",
			2
		],
		[
			74,
			50,
			"squirrel",
			4
		],
		[
			90,
			88,
			"squirrel",
			3
		]
	]) {
		const spot = herd(tx, ty);
		addPack(world, kind, spot[0], spot[1], count, pack++);
	}
}
function tileOf(x, y) {
	return {
		tx: Math.floor(x / 64),
		ty: Math.floor(y / 64)
	};
}
function cellBlocked(world, tx, ty) {
	if (!inMap(tx, ty)) return true;
	return world.blocked[idx(tx, ty)] === 1 || world.tiles[idx(tx, ty)] === 3 || world.tiles[idx(tx, ty)] === 5;
}
function pointBlocked(world, x, y, radius) {
	const samples = [
		[0, 0],
		[radius, 0],
		[-radius, 0],
		[0, radius],
		[0, -radius],
		[radius * .7, radius * .7],
		[radius * .7, -radius * .7],
		[-radius * .7, radius * .7],
		[-radius * .7, -radius * .7]
	];
	for (const [dx, dy] of samples) {
		const t = tileOf(x + dx, y + dy);
		if (cellBlocked(world, t.tx, t.ty)) return true;
	}
	return false;
}
function pathTo(world, x, y, gx, gy) {
	const s = tileOf(x, y);
	let goal = tileOf(gx, gy);
	if (cellBlocked(world, goal.tx, goal.ty)) {
		const near = nearestWalkableTile(world, goal.tx, goal.ty);
		if (!near) return null;
		goal = near;
	}
	const tiles = findPath(world.blocked, 156, 156, s.tx, s.ty, goal.tx, goal.ty);
	if (!tiles) return null;
	return tiles.map((t) => ({
		x: t.x * 64,
		y: t.y * 64
	}));
}
function nearestWalkableTile(world, tx, ty) {
	for (let r = 1; r <= 6; r++) for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) if (!cellBlocked(world, x, y)) return {
		tx: x,
		ty: y
	};
	return null;
}
function footprintFree(world, tx, ty, w, h) {
	return fits(world, tx, ty, w, h, true);
}
/** v14 world-map areas. 3 Lowelltown woods, 4 the Kennebec, 5 raider country, 6 the bunker, 9 a roadside encounter. */
var AREA_NAME = {
	3: "Lowelltown Woods",
	4: "The Kennebec",
	5: "Raider Country",
	6: "The Bunker",
	9: "Roadside"
};
function createArea(seed, mapId, homeSides) {
	shapingHome = false;
	const tiles = /* @__PURE__ */ new Uint8Array(24336);
	const blocked = /* @__PURE__ */ new Uint8Array(24336);
	fillLand(tiles, blocked, 1);
	const world = {
		tiles,
		blocked,
		props: [],
		npcs: [],
		enemies: [],
		startX: 5152,
		startY: 5024,
		nextPropId: 1,
		nextEnemyId: 1,
		id: mapId,
		name: AREA_NAME[mapId] ?? "The Woods",
		seed,
		exits: homeSides,
		gates: [],
		questBandits: 0
	};
	for (let tx = 4; tx < 152; tx++) for (const dy of [
		-1,
		0,
		1
	]) {
		const ty = 78 + dy + Math.round(Math.sin(tx * .06 + mapId) * 6);
		if (inMap(tx, ty) && inHex(tx, ty)) {
			tiles[idx(tx, ty)] = 2;
			blocked[idx(tx, ty)] = 0;
		}
	}
	if (mapId === 4) for (let ty = 0; ty < 156; ty++) for (let tx = 76; tx <= 84; tx++) {
		const x = tx + Math.round(Math.sin(ty * .08) * 5);
		if (!inMap(x, ty) || !inHex(x, ty)) continue;
		if (tiles[idx(x, ty)] === 2) continue;
		tiles[idx(x, ty)] = 5;
		blocked[idx(x, ty)] = 1;
	}
	world.gates = layExits(world, [
		0,
		1,
		2,
		3,
		4,
		5
	], {
		tx: 80,
		ty: 78
	});
	scatter(world);
	clearPad(world, 80, 78, 4);
	const poi = (dx, dy, kind, extra) => {
		const [x, y] = pullIn(80 + dx, 78 + dy);
		clearPad(world, x, y, 2);
		return addProp(world, kind, x, y, extra);
	};
	poi(-14, -10, "ruin");
	poi(16, 12, "car-truck");
	poi(10, -16, "scrap", {
		resource: "scrap",
		amount: 4
	});
	poi(-18, 14, "logs", {
		resource: "wood",
		amount: 5
	});
	poi(4, 18, "campfire");
	if (mapId === 6) poi(0, -4, "hatch");
	let pack = 1;
	const dens = mapId === 9 ? [[
		10,
		-8,
		"deer",
		2
	]] : [
		[
			20,
			-14,
			"deer",
			3
		],
		[
			-22,
			10,
			"rabbit",
			3
		],
		[
			14,
			24,
			"coyote",
			3
		],
		[
			-12,
			-24,
			mapId === 3 ? "moose" : "wolf",
			mapId === 3 ? 1 : 4
		],
		[
			26,
			-4,
			"wolf",
			3 + mapId % 3
		]
	];
	for (const [dx, dy, kind, count] of dens) {
		const spot = pullIn(80 + dx, 78 + dy);
		addPack(world, kind, spot[0], spot[1], count, pack++);
	}
	const bandits = mapId === 5 ? [
		[18, 6],
		[20, 9],
		[-16, 8],
		[-18, 4],
		[6, -20],
		[9, -22],
		[-4, 22]
	] : mapId === 9 ? [] : [[24, 4]];
	for (const [dx, dy] of bandits) addEnemy(world, 80 + dx, 78 + dy, false, mapId === 5 && dx > 0);
	shapingHome = true;
	return world;
}
/** Art cache-bust: bump after replacing any file in public/game (sheets, overlays, item icons). */
var ART_V = 2072;
assertIso();
var SCREEN_SPEED = 248;
/** v14.1: animation frame times (gif-compare.md). */
var ANIM_MS = {
	walk: 105,
	run: 70,
	idle: 200,
	aim: 80,
	fire: 60
};
var ENEMY_SPEED = 148;
/** One adult body, small next to a house the way a Fallout figure is. */
var ADULT = 86;
var HERO_H = ADULT;
var NPC_H = ADULT;
var RADIUS = 14;
var STEP = 1 / 60;
var IMAGES = [
	"v2/tracks/wolf-left",
	"v2/tracks/wolf-right",
	...[
		"wall-wood",
		"wall-stone",
		"wall-metal",
		"gate-wood",
		"gate-stone",
		"gate-metal"
	].flatMap((n) => [`v14/${n}`, `v14/${n}-dmg`]),
	"v2/hollowed-walk",
	"v2/hollowed-walk-atk",
	"v2/hollowed-walk-dead",
	...[
		"wall-x",
		"spikes",
		"chest",
		"rainbarrel",
		"sandbags",
		"sandbags-x",
		"workbench",
		"wreck",
		"firering",
		"firering-lit",
		"stash",
		"sign-farm",
		"lookout",
		"lookout-x",
		"garden",
		"smokehouse",
		"raincollector",
		"still"
	].map((n) => `v14/${n}`),
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
function mountGame(canvas, mini) {
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
	let turnBased = false;
	let gfxHigh = (() => {
		try {
			return localStorage.getItem("maine-rpg-gfx") !== "low";
		} catch {
			return true;
		}
	})();
	const frameMs = {
		avg: 16,
		n: 0,
		worst: 0,
		list: []
	};
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
	let raidNight = 0;
	/** The Bangor Warden: 0 not met, 1 paid / slipped past, 2 fighting, 3 down. */
	let wardenState = 0;
	let millSeen = false;
	let wardenAsked = false;
	let radioWarned = false;
	let nightLatch = false;
	let tractorReady = false;
	const guardPost = /* @__PURE__ */ new Map();
	const DEFENSE = {
		stand: {
			range: 190,
			dmg: 3,
			every: .85
		},
		"stand-up": {
			range: 240,
			dmg: 5,
			every: .7
		},
		"stand-3": {
			range: 280,
			dmg: 7,
			every: .55
		},
		blind: {
			range: 280,
			dmg: 4,
			every: 1.1
		},
		"blind-up": {
			range: 340,
			dmg: 6,
			every: .9
		},
		"blind-3": {
			range: 400,
			dmg: 8,
			every: .75
		},
		firepot: {
			range: 108,
			dmg: 1,
			every: .35,
			slow: true
		},
		"firepot-up": {
			range: 136,
			dmg: 2,
			every: .3,
			slow: true
		},
		"firepot-3": {
			range: 160,
			dmg: 3,
			every: .25,
			slow: true
		},
		nest: {
			range: 210,
			dmg: 6,
			every: .5
		},
		"nest-up": {
			range: 250,
			dmg: 8,
			every: .38
		},
		"nest-3": {
			range: 280,
			dmg: 11,
			every: .3
		},
		"post-loft": {
			range: 260,
			dmg: 5,
			every: .8
		},
		"post-porch": {
			range: 200,
			dmg: 4,
			every: .75
		},
		"post-roof": {
			range: 240,
			dmg: 5,
			every: .7
		}
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
	DEFENSE.lookout = {
		range: 260,
		dmg: 4,
		every: .8
	};
	const LURE = /* @__PURE__ */ new Set(["scarecrow", "bait"]);
	const RAID_VAR = /* @__PURE__ */ new Set([
		"scout",
		"brute",
		"torch",
		"jumper",
		"armor",
		"shield",
		"atv",
		"fur",
		"mask",
		"saw"
	]);
	/** A night raider. The Chopping's named bosses (quest enemies) use the same boss art but stay home. */
	const isRaider = (e) => !!e && RAID_VAR.has(e.variant) && !e.quest;
	const GUARD_ROLES = /* @__PURE__ */ new Set([
		"sarah",
		"justin",
		"adele",
		"pete",
		"sera",
		"holt"
	]);
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
		return {
			snow,
			wood: player?.wood ?? 0,
			jackTrust,
			bunkerSeen,
			jackMet,
			warden: wardenState,
			scrap: player?.scrap ?? 0,
			raidReady: raidCanStart(),
			raidOn: !!raid,
			raidNext: raidNight + 1
		};
	}
	function hudQuestText() {
		const dh = dropHud();
		if (dh && !raid) return dh;
		if (raid?.defend) {
			const pct = Math.max(0, Math.round(raid.house / raid.houseMax * 100));
			return `Defend the farm: ${raid.phase === "wave" ? `wave ${raid.wave} of ${raid.waves}` : `wave ${raid.wave + 1} of ${raid.waves} coming`}. Farmhouse ${pct}%.`;
		}
		if (mapId === 0 && v14.st < 3 && !mode11) {
			const c = v14.camp ?? {
				tx: 0,
				ty: 0
			};
			const dir = [
				"east",
				"south-east",
				"south",
				"south-west",
				"west",
				"north-west",
				"north",
				"north-east"
			][(Math.round(Math.atan2(FARM.ty - c.ty, FARM.tx - c.tx) / (Math.PI / 4)) % 8 + 8) % 8];
			return `Cold road: ${STAGE_TEXT[v14.st].replace("east", dir)}`;
		}
		if (raid) {
			const pct = Math.max(0, Math.round(raid.house / raid.houseMax * 100));
			const stage = raid.phase === "wave" ? `Wave ${raid.wave} of ${raid.waves}` : raid.wave === 0 ? `Wave 1 of ${raid.waves} soon` : `Wave ${raid.wave + 1} of ${raid.waves} soon`;
			return `Raid night ${raid.night}: ${stage}. Farmhouse ${pct}%.`;
		}
		if (snow < 3 && quest <= 0) {
			if (snow <= 0) return "First Snow: talk to Justin at the Cambridge Road farm.";
			if (snow === 1) return `First Snow: bring Justin 3 wood. ${Math.min(player?.wood ?? 0, 3)} of 3. Woodpile by the barn.`;
			return "First Snow: go see Sarah at the farm.";
		}
		const m11h = q11HudText();
		if (m11h) return m11h;
		return (snow >= 3 ? q10Hud(q10) || q11Hud(q11) : "") || questText(quest, questKills);
	}
	function musicTick() {
		setMusic(phase === "menu" ? "menu" : raid ? "raid" : nightDark(clock) > .3 ? "night" : "day");
	}
	function sync(force = false) {
		if (!force) return;
		if (buildOpen && statsOpen) {
			statsOpen = false;
			statsWait = true;
		}
		if (!buildOpen && statsWait) {
			statsWait = false;
			statsOpen = true;
		}
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
			logIds: lines.map((l) => l.id),
			v141: hud141(),
			v13: player ? v13Hud() : null,
			v14: hud14(),
			wmap: wmHud(),
			journal: (() => {
				const all = [
					...journalEntries(quest, questKills, talkState()),
					...q10Journal(q10, snow >= 3),
					...q11Journal(q11, Q11C()),
					...q11JournalExtra()
				];
				return [...all.filter((e) => !e.done), ...all.filter((e) => e.done)];
			})(),
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
			gfxHigh,
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
			party: party ? {
				name: party.name,
				hp: party.hp,
				maxHp: party.maxHp
			} : null
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
		if (!pile) leavePile(player.x + 14, player.y + 10, title, [{
			id,
			qty
		}], 0, "", 0);
		else {
			const st = pile.items.find((q) => q.id === id);
			if (st) st.qty += qty;
			else pile.items.push({
				id,
				qty
			});
		}
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
		const off = GEAR[p.offId];
		p.atk = p.baseAtk + Math.max(0, p.level - 1) + (w?.atk ?? 0) + Math.floor((off?.atk ?? 0) / 3) + Math.max(0, p.strength - 1);
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
	const dollPick = /* @__PURE__ */ new Map();
	/** Which cell of a hero sheet the pack-screen doll uses: the first front-facing walk frame whose two
	* feet stand apart (frame 0 of the front row is the passing pose, where the legs overlap into one).
	* Tries the front row (frames 2, 1, 3), then the slightly turned down-right / down-left rows, then frame 0. */
	function dollCell(name, img) {
		const hit = dollPick.get(name);
		if (hit) return hit;
		const cols = sheetCols(img);
		const cw = img.width / cols, ch = img.height / 8;
		let pick = {
			row: 0,
			col: 0
		};
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
				for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (a[(y * cw + x) * 4 + 3] > 24) {
					if (top < 0) top = y;
					bot = y;
					break;
				}
				if (top < 0) return false;
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
			const found = [
				[0, 2],
				[0, 1],
				[0, 3],
				[7, 2],
				[1, 2],
				[7, 1],
				[1, 1]
			].find(([r, c]) => apart(r, c));
			if (found) pick = {
				row: found[0],
				col: found[1]
			};
		} catch {
			pick = {
				row: 0,
				col: 2
			};
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
			if (id && !images.get(`overlay-${id}`) && overlayState.get(`${id}-portrait`) === "ok") overlays.push(`/game/overlay/${id}-portrait.png?v=${ART_V}`);
			if (id) wantOverlay(id);
		}
		return {
			cols: 10,
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
	const overlayState = /* @__PURE__ */ new Map();
	let overlayList = null;
	fetch(`/game/overlay/index.json?v=${ART_V}`).then((r) => r.ok ? r.json() : []).then((list) => {
		overlayList = new Set(Array.isArray(list) ? list : []);
	}).catch(() => {
		overlayList = /* @__PURE__ */ new Set();
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
		player.rep = {
			lowelltown: 0,
			attean: 0,
			holeb: 0,
			ponds: 0
		};
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
		v14 = freshV14();
		if (typeof window !== "undefined" && window.__v14Skip) v14.st = 5;
		l1 = freshV141();
		storeKey = "";
		if (!(typeof window !== "undefined" && window.__v14Skip)) {
			player.small = true;
			player.bagLv = 0;
		}
		craftOpen = false;
		if (pendingBackstory) {
			applyBackstory(pendingBackstory);
			pendingBackstory = "";
		}
		if (pendingHard) {
			w13.hard = true;
			pendingHard = false;
		}
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
		else setLog("You wake on the cot under the eave. Cambridge Road. The stove in the farmhouse is warm.");
		pushLog(`Tagged skills: ${SKILLS.filter((s) => player.tags.includes(s.id)).map((s) => s.name).join(", ")}. They rise twice as fast.`);
		pushLog(v14.st === 0 ? "Search the truck. First snow is coming." : "Justin is out by the farmhouse. First snow is coming.");
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
		l1 = loadV141(data.v141);
		storeKey = "";
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
		if (world && mapId === 0) {
			v14.placed = world.props.filter((p) => p.p14).map((p) => ({
				k: p.kind,
				tx: p.tx,
				ty: p.ty,
				hp: Math.round(p.hp ?? 0),
				f: !!p.flip14
			}));
			for (const p of world.props) if (p.f14) note14(p);
		}
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
			trait: p.trait || ""
		};
	}
	function ensureProgress(p) {
		if (!p.tags || p.tags.length !== 3) p.tags = tagsForRole(p.role);
		if (!p.invested) p.invested = {};
		if (p.skillPoints == null) p.skillPoints = 0;
		if (!p.perks) p.perks = [];
		if (p.karma == null) p.karma = 0;
		if (!p.rep) p.rep = {
			lowelltown: 0,
			attean: 0,
			holeb: 0,
			ponds: 0
		};
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
		return [
			"lowelltown",
			"attean",
			"holeb",
			"ponds"
		].map((id) => `${TOWN_NAME[id]} ${p.rep[id] > 0 ? "+" : ""}${p.rep[id] | 0}`).join(" · ");
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
			pushLog((player.perks?.length ?? 0) < perkSlots(player.level) ? "Hard miles. A stat point, skill points, and a perk are waiting." : "Hard miles. A stat point and skill points are waiting.");
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
		const up = mapId === 0 && player && inFarm(tileOf(player.x, player.y).tx, tileOf(player.x, player.y).ty) ? 2 * (v3.up.lookout || 0) + (v3.up.solar && nightDark(clock) > .3 ? 3 : 0) : 0;
		return Math.max(2, Math.round((5 + perc() + (trail >= 45 ? 1 : 0) + (carrying("binoculars") ? 2 : 0) + up) * (inside ? 1 : weather13().sight)));
	}
	function noticeRange(base) {
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
			if (mapId !== 0 || !ok14()) {
				pushLog("Hold the farm first. Then Justin lets you build.");
				return;
			}
			if (!inFarm(tile.tx, tile.ty)) {
				pushLog("Keep it inside the farm ring.");
				return;
			}
			if (!canPay14(cost.need14)) {
				pushLog(`That wants ${costText(cost.need14)}.`);
				return;
			}
			const pr = add14(cost.kind, tile.tx, tile.ty, {
				p14: true,
				flip14: buildFlip
			});
			if (!pr) {
				pushLog("That ground will not take it.");
				return;
			}
			pay14(cost.need14);
			pr.hp = PIECE_HP[cost.kind];
			v14.placed.push({
				k: cost.kind,
				tx: tile.tx,
				ty: tile.ty,
				hp: pr.hp,
				f: buildFlip
			});
			pushLog(`${cost.label} up.`);
			sfx("build");
			burst(propCenter(pr).x, propCenter(pr).y, "#d4a24a", 10);
			saveGame();
			sync(true);
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
						choices: [{
							label: "All right",
							id: "close"
						}]
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
		if ((id.startsWith("v14-") || id.startsWith("v141-")) && v14Choice(id)) {
			sync(true);
			return;
		}
		if (id.startsWith("q11-") && q11Choice(id)) return;
		if (id.startsWith("q113-") && v3Choice(id)) return;
		if (id === "raid-ask") {
			const n = raidNight + 1;
			dialogue = {
				speaker: "Justin",
				text: `Night ${n}. If we light the yard they'll come at us in ${raidWaves(n)} waves off the road and the tree line. Sarah and I take the posts. Cyndal watches from the loft, Loki stays in with the door barred. We hold till they quit or the sun's up. Ready?`,
				choices: [{
					label: "Light the yard. Hold the farm",
					id: "raid-go"
				}, {
					label: "Not tonight",
					id: "close"
				}]
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
			pushLog(`Justin wants 3 armloads of wood. The woodpile is by the barn.`);
		} else if (id === "snow-wood" && snow === 1 && player.wood >= 3) {
			player.wood -= 3;
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
			pushLog(v14.st === 3 ? "First Snow on Cambridge Road: done. Sarah says you can have the cot, if the farm's still standing tomorrow." : "First Snow on Cambridge Road: done. The farm is your base now. You wake on the cot if you fall.");
			pushLog("Hot cider and cider donuts heal. Use them from the pack.");
			sfx("level");
			if (v14.st === 3) {
				dialogue = null;
				phase = "play";
				startDefend14();
				return;
			}
			startDeal();
		} else if (id === "jack-bye") pushLog(JACK_SIGNOFF);
		else if (id === "mira-brief" && quest <= 0) {
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
				{
					label: "Upgrade a defense · 4 timber, 3 iron",
					id: "bench-up"
				},
				{
					label: "Pipe bomb · 6 iron",
					id: "bench-bomb"
				},
				{
					label: "Fuel can · 4 iron",
					id: "bench-fuel"
				},
				{
					label: "Bait tin · 2 timber",
					id: "bench-bait"
				},
				{
					label: "Leave it",
					id: "close"
				}
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
			if (!canPay14(nx.cost)) {
				pushLog(`${nx.name} wants ${costText(nx.cost)}.`);
				return;
			}
			pay14(nx.cost);
			vacate(world, p14);
			p14.kind = nx.kind;
			occupy(world, p14);
			p14.hp = nx.hp;
			note14(p14);
			const pl = v14.placed.find((q) => q.tx === p14.tx && q.ty === p14.ty);
			if (pl) {
				pl.k = nx.kind;
				pl.hp = nx.hp;
			}
			pushLog(`Up to ${nx.name}.`);
			sfx("build");
			saveGame();
			return;
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
		return world?.npcs.find((n) => n.id === 990) ?? null;
	}
	/** The Warden turns hostile where he stands (or at his post after a reload mid-fight). */
	function spawnWarden(x, y) {
		if (!world || world.enemies.some((e) => e.id === 90003)) return;
		world.enemies.push({
			id: WARDEN_ENEMY_ID,
			x,
			y,
			homeX: x,
			homeY: y,
			hp: 70,
			maxHp: 70,
			atk: 11,
			xp: 40,
			elite: true,
			quest: false,
			kind: "bandit",
			pack: 0,
			temper: "hostile",
			crippleArm: 0,
			crippleLeg: 0,
			dir: 0,
			frame: 0,
			anim: 0,
			cooldown: .6,
			path: null,
			pathT: 0,
			aggro: true,
			dead: false,
			hurt: 0,
			name: "The Bangor Warden",
			variant: "warden"
		});
	}
	function restoreWarden() {
		if (!world) return;
		const npc = wardenNpc();
		if (wardenState >= 2 && npc) {
			world.npcs = world.npcs.filter((n) => n.id !== 990);
			if (wardenState === 2) spawnWarden(npc.x, npc.y);
		}
	}
	function wardenChoice(id) {
		const npc = wardenNpc();
		if (!player || !world || !npc) return;
		let text = "";
		if (id === "warden-pay") {
			if (player.scrap < 12) {
				dialogue = {
					speaker: npc.name,
					text: "\"Twelve. Not a plate less.\" He doesn't move off the gate.",
					choices: [
						{
							label: "Slip past while he's on the radio",
							id: "warden-sneak"
						},
						{
							label: "Take the gate from him",
							id: "warden-fight"
						},
						{
							label: "Turn back",
							id: "close"
						}
					]
				};
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
			world.npcs = world.npcs.filter((n) => n.id !== 990);
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
		dialogue = {
			speaker: npc.name,
			text,
			choices: [{
				label: "Walk on",
				id: "close"
			}]
		};
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
			const fx = (world.flood.tx + .5) * 64, fy = (world.flood.ty + .5) * 64;
			if (Math.hypot(fx - player.x, fy - player.y) < 448) {
				millSeen = true;
				pushLog("The old Attean mill. Snowmelt has the floor under a foot of black water. A lantern moves inside.");
			}
		}
	}
	let q10 = freshQ10();
	let q10Spots = /* @__PURE__ */ new Map();
	const q10Latch = /* @__PURE__ */ new Set();
	/** Biscuit, Loki's dog: drawn with the existing coyote sheet, never an enemy. */
	let dogBody = null;
	function q10Tile(rtx, rty) {
		if (!world) return {
			x: 0,
			y: 0
		};
		const tx0 = rtx + 22, ty0 = rty + 20;
		const open = (x, y) => x > 1 && y > 1 && x < 154 && y < 154 && !cellBlocked(world, x, y) && !cellBlocked(world, x + 1, y) && !cellBlocked(world, x, y + 1) && !cellBlocked(world, x - 1, y) && !cellBlocked(world, x, y - 1);
		for (let r = 0; r < 14; r++) for (let y = ty0 - r; y <= ty0 + r; y++) for (let x = tx0 - r; x <= tx0 + r; x++) {
			if (Math.max(Math.abs(x - tx0), Math.abs(y - ty0)) !== r) continue;
			if (open(x, y)) return {
				x: (x + .5) * 64,
				y: (y + .5) * 64
			};
		}
		return {
			x: (tx0 + .5) * 64,
			y: (ty0 + .5) * 64
		};
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
		return fh ? propCenter(fh) : {
			x: 3712,
			y: 2304
		};
	}
	function q10Spawn(kind, variant, name, spot, stats, tag, aggro = false) {
		if (!world) return null;
		const t = tileOf(spot.x, spot.y);
		let x = spot.x, y = spot.y;
		if (cellBlocked(world, t.tx, t.ty)) {
			const s = q10Tile(t.tx - 22, t.ty - 20);
			x = s.x;
			y = s.y;
		}
		const e = {
			id: q10.nextId++,
			x,
			y,
			homeX: x,
			homeY: y,
			hp: stats[0],
			maxHp: stats[0],
			atk: stats[1],
			xp: stats[2],
			elite: !!stats[3],
			quest: false,
			kind,
			pack: 70,
			temper: kind === "moose" ? "wary" : "hostile",
			crippleArm: 0,
			crippleLeg: 0,
			dir: 0,
			frame: 0,
			anim: 0,
			cooldown: 0,
			path: null,
			pathT: 0,
			aggro,
			dead: false,
			hurt: 0,
			slow: 0,
			death: 0,
			q10: tag
		};
		if (variant) e.variant = variant;
		if (name) e.name = name;
		world.enemies.push(e);
		return e;
	}
	function q10SeedCamp() {
		const c = q10Spot("coop");
		const offs = [
			[-90, -40],
			[70, -70],
			[-30, 110],
			[120, 60]
		];
		for (let i = 0; i < q10.seedLeft && i < 4; i++) {
			const o = offs[i];
			const spot = {
				x: c.x + o[0],
				y: c.y + o[1]
			};
			if (i < 2) q10Spawn("bandit", "scout", i === 0 ? "Co-op squatter" : "Co-op lookout", spot, [
				18,
				4,
				9
			], "seed");
			else q10Spawn("coyote", null, null, spot, [
				13,
				4,
				6
			], "seed");
		}
	}
	function q10Bull() {
		const b = q10Spot("bog");
		return q10Spawn("moose", null, "Bog bull", {
			x: b.x + 60,
			y: b.y + 40
		}, [
			52,
			10,
			22,
			true
		], "moose");
	}
	/** Dress the quest sites with props that already exist (no new art): the co-op yard, the ferry landing, the wrecks. */
	function q10Props() {
		const place = (site, kind, dx, dy) => {
			const b = Q10_SITES[site];
			const tx0 = b.tx + 22 + dx, ty0 = b.ty + 20 + dy;
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
		v14World();
		q10Spots = /* @__PURE__ */ new Map();
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
			dogBody = {
				x: end.x + 20,
				y: end.y + 10,
				dir: 3,
				frame: 0,
				anim: 0,
				moving: false
			};
		} else if (q10.dog === 3 && player) dogBody = {
			x: player.x + 40,
			y: player.y + 30,
			dir: 0,
			frame: 0,
			anim: 0,
			moving: false
		};
		else if (q10.dog >= 4) {
			const f = world?.npcs.find((n) => n.role === "loki") ?? farmCenter();
			dogBody = {
				x: f.x + 46,
				y: f.y + 28,
				dir: 1,
				frame: 0,
				anim: 0,
				moving: false
			};
		}
	}
	function npcSpot(role) {
		const n = world?.npcs.find((m) => m.role === role);
		return n ? {
			x: n.x,
			y: n.y,
			npc: true
		} : null;
	}
	/** Active objectives: where to put markers, and which spots open a talk or fire on arrival. */
	function q10Targets() {
		const out = [];
		if (!world || mapId !== 0 || snow < 3) return out;
		const add = (key, mode, color = "#e8c15a") => {
			const s = q10Spot(key);
			out.push({
				key,
				x: s.x,
				y: s.y,
				mode,
				color
			});
		};
		const npc = (role, color = "#e8c15a") => {
			const s = npcSpot(role);
			if (s) out.push({
				key: `npc-${role}`,
				x: s.x,
				y: s.y,
				mode: "npc",
				color
			});
		};
		if (q10.seed === 1) add("coop", "arrive");
		if (q10.seed === 2) add("coop", "mark", "#d0644a");
		if (q10.seed === 3) add("coopBins", "talk");
		if (q10.seed === 4) npc("sarah");
		if (q10.ferry === 1) {
			if (!q10.planks) add("planks", "talk");
			if (!q10.rope) add("rope", "talk");
			if (!q10.winch) add("winch", "talk");
		}
		if (q10.ferry === 2) add("ferry", "talk");
		if (q10.ferry >= 3) {
			const s = q10Spot("ferry");
			out.push({
				key: "ferry",
				x: s.x,
				y: s.y,
				mode: "talk",
				color: "#7fb0d8",
				quiet: true
			});
		}
		if (q10.dog === 1) npc("loki", "#c9a0e0");
		if (q10.dog === 2) {
			const last = DOG_TRAIL.length - 1;
			if (q10.dogStep < last) add(`trail${q10.dogStep}`, "arrive", "#c9a0e0");
			else add(`trail${last}`, "talk", "#c9a0e0");
		}
		if (q10.dog === 3) npc("loki", "#c9a0e0");
		if (q10.radio === 1) RADIO_SITES.forEach((k, i) => {
			if (!q10.parts[i]) add(k, "talk", "#8fd07a");
		});
		if (q10.radio === 2) npc("cyndal", "#8fd07a");
		if (q10.moose === 1) add("bog", "arrive", "#d89a5a");
		if (q10.moose === 2) {
			const bull = world.enemies.find((e) => e.q10 === "moose" && !e.dead);
			if (bull) out.push({
				key: "bull",
				x: bull.x,
				y: bull.y,
				mode: "mark",
				color: "#d0644a"
			});
		}
		if (q10.moose === 3) {
			const f = farmCenter();
			out.push({
				key: "farm",
				x: f.x,
				y: f.y + 80,
				mode: "mark",
				color: "#d89a5a"
			});
		}
		if (q10.moose === 4) npc("justin", "#d89a5a");
		return out;
	}
	const Q10_SITE_TALK = {
		coopBins: () => ({
			speaker: "Co-op seed bins",
			text: "Back of the co-op the bins are still covered with feed sacks. Under them, cold and dry: Kennebec russets, firm as stones. Somebody knew what they were doing.",
			choices: [{
				label: "Fill a sack with seed",
				id: "q10-seed-take"
			}, {
				label: "Leave them",
				id: "close"
			}]
		}),
		planks: () => ({
			speaker: "Lowelltown sawpile",
			text: "Rough-sawn hemlock under a tarp, stickered and dry. A dozen boards would deck the ferry.",
			choices: [{
				label: "Take a bundle of planks",
				id: "q10-take-planks"
			}, {
				label: "Leave it",
				id: "close"
			}]
		}),
		rope: () => ({
			speaker: "Attean boathouse",
			text: "The boathouse door hangs by one hinge. Coiled on a peg inside: a hank of three-strand manila, stiff with cold but sound.",
			choices: [{
				label: "Take the rope",
				id: "q10-take-rope"
			}, {
				label: "Leave it",
				id: "close"
			}]
		}),
		winch: () => ({
			speaker: "Wrecked log truck",
			text: "A loader rig on its side in the ditch, ice in the cab. The winch drum's still bolted on, and the pawl will knock loose with a hammer and some cussing.",
			choices: [{
				label: "Knock the pawl loose",
				id: "q10-take-winch"
			}, {
				label: "Leave it",
				id: "close"
			}]
		}),
		ferry: () => q10.ferry === 2 ? {
			speaker: "Kennebec ferry landing",
			text: "The cable barge sits half up on the gravel, deck boards gone soft and the winch rusted solid. The river's running black and fast. You've got everything she needs.",
			choices: [{
				label: "Deck her, rig the rope, seat the pawl",
				id: "q10-ferry-fix"
			}, {
				label: "Not yet",
				id: "close"
			}]
		} : {
			speaker: "Kennebec ferry",
			text: "The ferry rides easy on her cable. North across the Kennebec the spruce goes on forever. They say The Grok walks up there.",
			choices: [{
				label: "Pole across to the north woods",
				id: "q10-ferry-cross"
			}, {
				label: "Stay this side",
				id: "close"
			}]
		},
		part0: () => ({
			speaker: "Lowelltown grange hall",
			text: "The grange hall's radio cabinet was gutted long ago, but in a drawer under the stage there's a sock with something hard in it: a 6V6 tube, glass not cracked.",
			choices: [{
				label: "Pocket the tube",
				id: "q10-part-0"
			}, {
				label: "Leave it",
				id: "close"
			}]
		}),
		part1: () => ({
			speaker: "Attean fire tower shed",
			text: "The ranger's shed at the foot of the tower. On the bench, under mouse leavings, a spool of enamel copper wire.",
			choices: [{
				label: "Take the spool",
				id: "q10-part-1"
			}, {
				label: "Leave it",
				id: "close"
			}]
		}),
		part2: () => ({
			speaker: "Holeb camp road",
			text: "A camp truck in the ditch, its hood up. A big square lantern battery sits on the seat. You touch it to your tongue. It still kicks.",
			choices: [{
				label: "Take the battery",
				id: "q10-part-2"
			}, {
				label: "Leave it",
				id: "close"
			}]
		})
	};
	Q10_SITE_TALK[`trail${DOG_TRAIL.length - 1}`] = () => ({
		speaker: "Biscuit",
		text: "Under a blowdown in the spruce, a muddy brown dog with one ear up. He thumps his tail and won't come out. He's shaking.",
		choices: [{
			label: "Come on, Biscuit. Let's go home",
			id: "q10-dog-found"
		}, {
			label: "Give him a minute",
			id: "close"
		}]
	});
	function q10Step(dt) {
		if (!world || !player || mapId !== 0 || inside || phase !== "play") return;
		if (dogBody && q10.dog === 3) {
			const tx = player.x + 46, ty = player.y + 30;
			const d = Math.hypot(tx - dogBody.x, ty - dogBody.y);
			dogBody.moving = d > 24;
			if (d > 600) {
				dogBody.x = tx;
				dogBody.y = ty;
			} else if (dogBody.moving) {
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
			const r = t.mode === "arrive" ? t.key === "coop" || t.key === "bog" ? 320 : 102.4 : 89.6;
			if (d > r + 128) q10Latch.delete(t.key);
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
		if (q10.moose === 3) {
			const f = farmCenter(), b = q10Spot("bog");
			const home = Math.hypot(f.x - player.x, f.y - player.y);
			const span = Math.hypot(f.x - b.x, f.y - b.y);
			if (!q10.bearDone && home < span * .62 && home > 896) {
				q10.bearDone = true;
				const ux = (f.x - player.x) / home, uy = (f.y - player.y) / home;
				q10Spawn("wolf", "bear", "Black bear", {
					x: player.x + ux * 7 * 64,
					y: player.y + uy * 7 * 64
				}, [
					58,
					9,
					26,
					true
				], "bear", true);
				pushLog("Something big stands up out of the alders ahead of you. A black bear, and it wants that meat.");
				sfx("hit");
				saveGame();
			}
			if (home < 576) {
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
			pushLog(DOG_TRAIL.length - 1 - q10.dogStep > 0 ? [
				"Paw prints in the mud, headed for the spruce.",
				"More tracks. He was running flat out here.",
				"A tuft of brown fur on a raspberry cane.",
				"Tracks along the old tote road. He slowed down.",
				"Muddy prints, close together now. He's tired.",
				"He went under a fence wire here. Not far now."
			][Math.min(5, q10.dogStep - 1)] : "You hear a whine from under a blowdown.");
		}
		saveGame();
		sync(true);
	}
	function q10Kill(enemy) {
		if (!enemy.q10) return;
		if (enemy.q10 === "seed" && q10.seed === 2) {
			q10.seedLeft = Math.max(0, q10.seedLeft - 1);
			if (q10.seedLeft <= 0) {
				q10.seed = 3;
				pushLog("The co-op's quiet. The seed bins are around back.");
			}
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
		if (arrive) {
			player.x = arrive.arriveTx * 64 + 32;
			player.y = arrive.arriveTy * 64 + 32;
		}
		intent = null;
		work = null;
		holdWalk = false;
		inside = null;
		opening = null;
		travelLock = 1.6;
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
		const open = (d) => {
			dialogue = d;
			phase = "dialogue";
			sfx("click");
			sync(true);
			return true;
		};
		if (id === "q10-seed-ask") return open(Q10_TEXT.seedAsk);
		if (id === "q10-ferry-ask") return open(Q10_TEXT.ferryAsk);
		if (id === "q10-moose-ask") return open(Q10_TEXT.mooseAsk);
		if (id === "q10-radio-ask") return open(Q10_TEXT.radioAsk);
		if (id === "q10-seed-accept" && q10.seed === 0) {
			q10.seed = 1;
			pushLog("Seed Run: the Pittsfield co-op is south and east, down past Attean. Get there before the frost.");
		} else if (id === "q10-seed-take" && q10.seed === 3) {
			q10.seed = 4;
			pushLog("You fill a feed sack with seed potatoes and wrap it in your coat to keep the cold off. Back to Sarah.");
		} else if (id === "q10-seed-done" && q10.seed === 4) {
			q10.seed = 5;
			q10.stores += 4;
			q10Reward([["stew", 2], ["apple", 3]]);
			grantXp(34);
			shiftRep("ponds", 2, 8);
			pushLog("Seed Run: done. The seed's in the cellar. From now on Sarah sends a bowl of camp stew along with the cider.");
			sfx("level");
		} else if (id === "q10-ferry-accept" && q10.ferry === 0) {
			q10.ferry = 1;
			pushLog("Kennebec Crossing: planks at the Lowelltown sawpile, rope at the Attean boathouse, a winch pawl off the log truck east of the farm.");
		} else if (id === "q10-take-planks" && q10.ferry === 1) {
			q10.planks = true;
			pushLog("You lash a bundle of hemlock planks to your pack frame. Heavy.");
		} else if (id === "q10-take-rope" && q10.ferry === 1) {
			q10.rope = true;
			pushLog("You sling the coil of manila over your shoulder.");
		} else if (id === "q10-take-winch" && q10.ferry === 1) {
			q10.winch = true;
			pushLog("Three good whacks and the pawl drops into the snow. Got it.");
		}
		if (q10.ferry === 1 && q10.planks && q10.rope && q10.winch) {
			q10.ferry = 2;
			pushLog("That's planks, rope and the winch part. Take them up to the ferry landing on the Kennebec.");
		}
		if (id === "q10-ferry-fix" && q10.ferry === 2) {
			q10.ferry = 3;
			grantXp(40);
			shiftRep("ponds", 1, 6);
			pushLog("Kennebec Crossing: done. New deck, new rope, and the winch clacks over like it should. The ferry runs to the north woods.");
			sfx("build");
		} else if (id === "q10-ferry-cross" && q10.ferry >= 3) {
			dialogue = null;
			phase = "play";
			q10FerryCross();
			sync(true);
			return true;
		} else if (id === "q10-dog-accept" && q10.dog === 1) {
			q10.dog = 2;
			q10.dogStep = 0;
			q10PlaceDog();
			pushLog("Lost Dog: Biscuit's paw prints start in the mud by the orchard.");
		} else if (id === "q10-dog-found" && q10.dog === 2) {
			q10.dog = 3;
			q10PlaceDog();
			pushLog("Biscuit crawls out and leans on your leg. Walk him home to Loki.");
		} else if (id === "q10-dog-done" && q10.dog === 3) {
			q10.dog = 4;
			q10PlaceDog();
			q10Reward([["maple", 1]]);
			grantXp(24);
			shiftRep("ponds", 2, 8);
			pushLog("Lost Dog: done. Loki slips you his maple candy tin.");
			sfx("level");
		} else if (id === "q10-radio-accept" && q10.radio === 0) {
			q10.radio = 1;
			pushLog("Cyndal's Radio: a tube, a coil and a battery. Lowelltown grange, the Attean fire tower shed, the Holeb camp road.");
		} else if (id.startsWith("q10-part-") && q10.radio === 1) {
			const i = Number(id.slice(9));
			q10.parts[i] = true;
			const n = q10.parts.filter(Boolean).length;
			if (n >= 3) {
				q10.radio = 2;
				pushLog("That's all three radio parts. Bring them to Cyndal.");
			} else pushLog(`Radio part ${n} of 3.`);
		} else if (id === "q10-radio-done" && q10.radio === 2) {
			q10.radio = 3;
			grantXp(30);
			shiftRep("ponds", 2, 8);
			pushLog("Cyndal's Radio: done. Talk to Cyndal to call Marcel the trader on the radio.");
			sfx("level");
		} else if (id === "q10-trader" && q10.radio >= 3) return open({
			speaker: "Marcel Thibodeau (radio)",
			text: "\"Thibodeau, go ahead.\" Static, then a laugh. \"The Cambridge Road farm? Ayuh, I can run the sled up. Cash is iron. Here's what's on it this week.\"",
			choices: [
				{
					label: "Eight shells — 10 iron",
					id: "q10-buy-shells"
				},
				{
					label: "Field bandage — 6 iron",
					id: "q10-buy-wrap"
				},
				{
					label: "Snowshoes — 16 iron",
					id: "q10-buy-snowshoes"
				},
				{
					label: "Barn lantern — 12 iron",
					id: "q10-buy-lantern"
				},
				{
					label: "Smoked jerky — 5 iron",
					id: "q10-buy-jerky"
				},
				{
					label: "Gas, quart can — 4 iron",
					id: "q10-buy-gas"
				},
				{
					label: "Over and out",
					id: "close"
				}
			]
		});
		else if (id === "q10-buy-shells") buyFromTrader("sarah", 10, "shells", 8, "Marcel's sled comes up the road at dusk. Eight shells in a coffee can.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-wrap") buyFromTrader("sarah", 6, "bandage-std", 1, "A field bandage off Marcel's sled.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-snowshoes") buyFromTrader("sarah", 16, "snowshoes", 1, "Ash-frame snowshoes, rawhide laced. Marcel says his uncle made them.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-lantern") buyFromTrader("sarah", 12, "lantern", 1, "A barn lantern with a good wick.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-gas") buyFromTrader("sarah", 4, "gas", 1, "A quart of gas in a square can, off Marcel's sled.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-buy-jerky") buyFromTrader("sarah", 5, "jerky", 1, "A twist of smoked jerky.", "Not enough iron. Marcel wants it up front.");
		else if (id === "q10-moose-accept" && q10.moose === 0) {
			q10.moose = 1;
			pushLog("Moose Season: the Heald Stream bog is south of the farm, toward Attean.");
		} else if (id === "q10-moose-done" && q10.moose === 4) {
			q10.moose = 5;
			q10.stores += 10;
			q10Reward([
				["meat", 6],
				["hide", 2],
				["jerky", 4]
			]);
			grantXp(44);
			shiftRep("ponds", 2, 8);
			pushLog("Moose Season: done. Six quarters hanging, the hide on the barn wall. Justin cuts you a share: meat, a hide and jerky.");
			sfx("level");
		}
		return false;
	}
	/** Ground rings under every objective and Biscuit's paw prints; drawn flat on the ground plane. */
	function q10All() {
		return [...mapId === 0 ? q10Targets() : [], ...q11Targets()];
	}
	function q10DrawGround(dcx, dcy, dpr) {
		if (!world) return;
		const z = zoom;
		ctx.save();
		ctx.setTransform(dpr * z, dpr * .5 * z, -dpr * z, dpr * .5 * z, dpr * (viewW / 2 * (1 - z) - dcx * z), dpr * (viewH / 2 * (1 - z) - dcy * z));
		const t = performance.now() / 1e3;
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
			ctx.beginPath();
			ctx.arc(tr.x, tr.y, tr.kind === "trap" ? 13 : 10, 0, Math.PI * 2);
			ctx.fill();
			if (tr.caught) {
				ctx.strokeStyle = "#e0b070";
				ctx.lineWidth = 4;
				ctx.beginPath();
				ctx.arc(tr.x, tr.y, 22, 0, Math.PI * 2);
				ctx.stroke();
			}
		}
		if (player) {
			const reach = (sightRadius() + 1 + Math.floor(lv("hunting") / 3)) * 64;
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
					if (hoof) {
						ctx.beginPath();
						ctx.ellipse(p.x + side, p.y - 3, 4, 6, .6, 0, Math.PI * 2);
						ctx.ellipse(p.x + side + 5, p.y + 1, 4, 6, .6, 0, Math.PI * 2);
						ctx.fill();
					} else if (images.get(i % 2 ? "v2/tracks/wolf-right" : "v2/tracks/wolf-left")) ctx.drawImage(images.get(i % 2 ? "v2/tracks/wolf-right" : "v2/tracks/wolf-left"), p.x + side - 9, p.y - 9, 18, 18);
					else {
						ctx.beginPath();
						ctx.ellipse(p.x + side, p.y, 6, 5, 0, 0, Math.PI * 2);
						ctx.fill();
						for (let c = -1; c <= 1; c++) {
							ctx.beginPath();
							ctx.arc(p.x + side + c * 4, p.y - 7, 2.2, 0, Math.PI * 2);
							ctx.fill();
						}
					}
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
					ctx.beginPath();
					ctx.ellipse(px + ox, py + oy, 9, 7, Math.atan2(dy, dx), 0, Math.PI * 2);
					ctx.fill();
					for (let c = -1; c <= 1; c++) {
						ctx.beginPath();
						ctx.arc(px + ox + dx / L * 11 + -dy / L * c * 6, py + oy + dy / L * 11 + dx / L * c * 6, 3.2, 0, Math.PI * 2);
						ctx.fill();
					}
				}
				prev = s;
			}
		}
		ctx.restore();
	}
	/** Floating diamonds over objectives (and over the person to talk to) plus Biscuit, depth-sorted with the world. */
	function q10Draws(draws, dcx, dcy) {
		if (!world) return;
		const t = performance.now() / 1e3;
		if (escortBodies) for (const b of escortBodies) draws.push({
			z: bodyZ(b.x, b.y),
			draw: () => paintPerson(b, dcx, dcy)
		});
		for (const m of q10All()) {
			if (m.quiet) continue;
			const tile = tileOf(m.x, m.y);
			if (!explored[tile.ty * 156 + tile.tx] && m.mode !== "npc") continue;
			draws.push({
				z: m.x + m.y + 1e5,
				draw: () => {
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
					ctx.moveTo(p.sx, p.sy - lift - s * 1.4);
					ctx.lineTo(p.sx + s, p.sy - lift);
					ctx.lineTo(p.sx, p.sy - lift + s * 1.4);
					ctx.lineTo(p.sx - s, p.sy - lift);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}
			});
		}
		if (dogBody) {
			const tile = tileOf(dogBody.x, dogBody.y);
			if (visible[tile.ty * 156 + tile.tx]) draws.push({
				z: bodyZ(dogBody.x, dogBody.y),
				draw: () => {
					const frame = dogBody.moving ? Math.floor(dogBody.anim) % 4 : 0;
					const own = dogBody.moving ? "v2/biscuit-walk" : images.get("v2/biscuit-idle") ? "v2/biscuit-idle" : "v2/biscuit-walk";
					if (images.get(own)) blit(own, dogBody.x, dogBody.y, 27, true, frame, dogBody.dir, dcx, dcy);
					else blit("coyote", dogBody.x, dogBody.y, realH("coyote", 27), true, frame, dogBody.dir, dcx, dcy);
					if (q10.dog >= 4 && v3.dog.hp < 30) {
						const r = worldToScreen(dogBody.x, dogBody.y, dcx, dcy);
						const p = zoomPoint(r.sx, r.sy);
						ctx.fillStyle = "#1a1410";
						ctx.fillRect(p.sx - 16, p.sy - 44 * zoom, 32, 4);
						ctx.fillStyle = "#c8503c";
						ctx.fillRect(p.sx - 16, p.sy - 44 * zoom, 32 * v3.dog.hp / 30, 4);
					}
				}
			});
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
	let q11 = freshQ11();
	let q11Spots = /* @__PURE__ */ new Map();
	const q11Latch = /* @__PURE__ */ new Set();
	/** "winter" | "endless" | "watch" while one of the v11 start-menu modes runs. */
	let mode11 = null;
	let m11 = null;
	let fishGame = null;
	let fishForce = null;
	let caravanForce = null;
	let escortBodies = null;
	let ripples = [];
	const Q11C = () => ({
		snowDone: snow >= 3,
		ferry: q10.ferry >= 3,
		jack: jackMet || jackTrust > 0,
		radio: q10.radio >= 3
	});
	function curDay() {
		return Math.floor(clock / DAY_LENGTH_SEC);
	}
	function seasonNow() {
		return seasonOf(curDay(), q11.seasonDay);
	}
	function q11Spot(key) {
		if (key.startsWith("npc:")) {
			const n = world?.npcs.find((m) => m.role === key.slice(4));
			return n ? {
				x: n.x + 30,
				y: n.y + 40
			} : farmCenter();
		}
		if (key === "farmBike") {
			const b = world?.props.find((p) => p.farmBike);
			if (b) {
				const c = propCenter(b);
				return {
					x: c.x + 40,
					y: c.y + 30
				};
			}
		}
		if (!q11Spots.has(key)) {
			const s = Q11_SITES[key];
			q11Spots.set(key, q10Tile(s.tx, s.ty));
		}
		return q11Spots.get(key);
	}
	function siteMap(key) {
		return key.startsWith("npc:") ? 0 : Q11_SITES[key]?.map ?? 0;
	}
	function q11St(id) {
		if (!q11.q[id]) q11.q[id] = {
			s: 0,
			left: 0
		};
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
		if (cellBlocked(world, t.tx, t.ty)) {
			const s = q10Tile(t.tx - 22, t.ty - 20);
			x = s.x;
			y = s.y;
		}
		const e = {
			id: q11.nextId++,
			x,
			y,
			homeX: x,
			homeY: y,
			hp,
			maxHp: hp,
			atk,
			xp,
			elite: hp >= 40,
			quest: false,
			kind,
			pack: 70,
			temper: "hostile",
			crippleArm: 0,
			crippleLeg: 0,
			dir: 0,
			frame: 0,
			anim: 0,
			cooldown: 0,
			path: null,
			pathT: 0,
			aggro,
			dead: false,
			hurt: 0,
			slow: 0,
			death: 0,
			q11: tag
		};
		if (variant) e.variant = variant;
		if (name) e.name = name;
		world.enemies.push(e);
		return e;
	}
	/** Foes for a fight/ambush step: around the site, or in a ring around you for an ambush. */
	function q11SpawnFoes(q, step, count) {
		const around = step.kind === "ambush" ? {
			x: player.x,
			y: player.y
		} : q11Spot(step.site);
		const foes = step.foes.slice(step.foes.length - count);
		foes.forEach((f, i) => {
			const a = i / foes.length * Math.PI * 2 + .4;
			const r = step.kind === "ambush" ? 384 : i === 0 ? 0 : 140.8;
			q11Spawn(f, {
				x: around.x + Math.cos(a) * r,
				y: around.y + Math.sin(a) * r
			}, q.id, step.kind === "ambush");
		});
	}
	function q11Begin(q) {
		const step = q11Cur(q);
		const st = q11St(q.id);
		st.left = 0;
		st.sp = false;
		if (!step) return;
		if (step.kind === "ambush" && siteMap(step.site) === mapId) {
			st.left = step.foes.length;
			st.sp = true;
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
		if (!on || !player) {
			escortBodies = null;
			return;
		}
		if (escortBodies) return;
		const mk = (role, ox, oy) => {
			return {
				role,
				name: (world?.npcs.find((m) => m.role === role))?.name ?? role,
				x: player.x + ox,
				y: player.y + oy,
				dir: 0,
				frame: 0,
				anim: 0,
				still: true,
				ox,
				oy
			};
		};
		escortBodies = [mk("cyndal", -48, 36), mk("loki", 40, 52)];
	}
	/** World build: find sites, dress the farm, put live quest foes back. */
	function q11World() {
		q11Spots = /* @__PURE__ */ new Map();
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
			const tx0 = s.tx + 22, ty0 = s.ty + 20;
			outer: for (let r = 0; r < 5; r++) for (let y = ty0 - r; y <= ty0 + r; y++) for (let x = tx0 - r; x <= tx0 + r; x++) {
				if (Math.max(Math.abs(x - tx0), Math.abs(y - ty0)) !== r) continue;
				if (addProp(world, "bike", x, y, {
					q11: true,
					farmBike: true
				})) break outer;
			}
		}
		const fc = farmCenter();
		const ft = tileOf(fc.x, fc.y);
		FARM_UPGRADES.forEach((u, i) => {
			for (let l = 0; l < q11.farm[u.id]; l++) {
				const tx0 = ft.tx - 6 + l * 2, ty0 = ft.ty + 5 + i * 2;
				for (let r = 0; r < 3; r++) for (let y = ty0 - r; y <= ty0 + r; y++) for (let x = tx0 - r; x <= tx0 + r; x++) {
					if (Math.max(Math.abs(x - tx0), Math.abs(y - ty0)) !== r) continue;
					if (addProp(world, u.prop, x, y, { q11: true })) {
						r = 9;
						y = 1e9;
						break;
					}
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
				if (mapId === 0) {
					const g = world.npcs.find((m) => m.role === q.giver);
					if (g) out.push({
						key: `q11npc-${q.id}`,
						x: g.x,
						y: g.y,
						mode: "npc",
						color: "#e0b070"
					});
				}
				continue;
			}
			const step = q11Cur(q);
			if (!step || siteMap(step.site) !== mapId) continue;
			if ((step.kind === "fight" || step.kind === "ambush") && st.sp) {
				for (const e of world.enemies) if (!e.dead && e.q11 === q.id) out.push({
					key: `q11foe-${e.id}`,
					x: e.x,
					y: e.y,
					mode: "mark",
					color: "#d0644a"
				});
				continue;
			}
			const s = q11Spot(step.site);
			const mode = step.kind === "take" ? "talk" : step.kind === "fight" ? "arrive" : "arrive";
			out.push({
				key: `q11-${q.id}-${st.s}`,
				x: s.x,
				y: s.y,
				mode,
				color: "#e0b070",
				q: q.id,
				step
			});
		}
		if (mapId === 0 && snow >= 3) for (const k of FISH_SITES) {
			const s = q11Spot(k);
			out.push({
				key: `fish-${k}`,
				x: s.x,
				y: s.y,
				mode: "talk",
				color: "#6fb7d8",
				fish: k
			});
		}
		if (q11.hunt) {
			for (const e of world.enemies) if (!e.dead && e.q11 === "hunt") out.push({
				key: `hunt-${e.id}`,
				x: e.x,
				y: e.y,
				mode: "mark",
				color: "#d89a5a"
			});
		}
		return out;
	}
	function q11Step(dt) {
		if (!world || !player || inside || phase !== "play") return;
		if (escortBodies) for (const b of escortBodies) {
			const tx = player.x + b.ox, ty = player.y + b.oy;
			const d = Math.hypot(tx - b.x, ty - b.y);
			b.still = d < 20;
			if (d > 700) {
				b.x = tx;
				b.y = ty;
			} else if (!b.still) {
				const sp = Math.min(d, (d > 160 ? 300 : 190) * dt);
				b.dir = facing8(tx - b.x, ty - b.y);
				b.x += (tx - b.x) / d * sp;
				b.y += (ty - b.y) / d * sp;
				b.anim += sp;
				b.frame = Math.floor(b.anim / 22) % 4;
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
			const r = t.fish ? 89.6 : t.step?.kind === "fight" ? 384 : t.mode === "arrive" ? 140.8 : 89.6;
			if (d > r + 128) q11Latch.delete(t.key);
			if (d > r || q11Latch.has(t.key)) continue;
			q11Latch.add(t.key);
			if (t.fish) {
				q11OpenFish(t.fish);
				return;
			}
			const q = questById(t.q), step = t.step, st = q11St(q.id);
			if (step.kind === "go") q11Advance(q, step.log);
			else if (step.kind === "escort") {
				if (escortBodies && escortBodies.every((b) => Math.hypot(b.x - player.x, b.y - player.y) < 320)) q11Advance(q, step.log);
				else {
					q11Latch.delete(t.key);
					continue;
				}
			} else if (step.kind === "fight" && !st.sp) {
				st.sp = true;
				st.left = step.foes.length;
				q11SpawnFoes(q, step, st.left);
				for (const e of world.enemies) if (e.q11 === q.id && !e.dead) e.aggro = true;
				pushLog(step.log);
				sfx("hit");
				saveGame();
				sync(true);
			} else if (step.kind === "take") {
				dialogue = {
					speaker: step.take.speaker,
					text: step.take.text,
					choices: [{
						label: step.take.label,
						id: `q11-take-${q.id}`
					}, {
						label: "Not yet",
						id: "close"
					}]
				};
				talkNpc = null;
				phase = "dialogue";
				intent = null;
				sfx("talk");
				sync(true);
			}
			return;
		}
	}
	function q11Kill(enemy) {
		if (!enemy.q11) return;
		if (enemy.q11 === "hunt") {
			q11HuntDone(enemy);
			return;
		}
		if (enemy.q11 === "caravan") {
			q11CaravanKill();
			return;
		}
		if (enemy.q11 === "watch") {
			if (m11) m11.caught += 1;
			return;
		}
		const q = questById(enemy.q11);
		const step = q && q11Cur(q);
		if (!q || !step || step.kind !== "fight" && step.kind !== "ambush") return;
		const st = q11St(q.id);
		st.left = Math.max(0, st.left - 1);
		if (st.left <= 0) {
			st.sp = false;
			q11Advance(q, enemy.variant === "grok" ? "The Grok goes down like a falling hemlock. You cut a claw off it, long as a hay knife." : "That's the last of them.");
		} else sync(true);
	}
	function q11Daily() {
		const day = curDay();
		if (q11.farm.lastDay === day) return;
		const first = q11.farm.lastDay < 0;
		q11.farm.lastDay = day;
		if (first || mode11 === "endless" || mode11 === "watch") return;
		const f = q11.farm, mult = SEASON_CROP[seasonNow()];
		const got = [];
		if (f.plots && mult) {
			const n = f.plots * mult + Math.floor(lv("farming") / 2);
			giveItem("apple", n);
			got.push(`${n} apples and potatoes`);
			train("farming", 4 + f.plots);
		}
		if (f.coop && day % 2 === 0) {
			giveItem("pork", f.coop);
			got.push(`${f.coop} hen${f.coop > 1 ? "s" : ""} for the pot`);
		}
		if (f.smoke) {
			const meat = player.bag.find((s) => s.id === "meat")?.qty ?? 0;
			const n = Math.min(meat, f.smoke);
			if (n) {
				takeItem("meat", n);
				giveItem("jerky", n * 2);
				got.push(`${n * 2} jerky from the smokehouse`);
			}
		}
		if (got.length) {
			f.harvest += 1;
			pushLog(`Morning at the farm: ${got.join(", ")}.`);
		}
		for (const trap of q11.traps) if (day > trap.day && !trap.caught) {
			trap.caught = trapRoll(trap);
			if (!trap.caught) trap.day = day;
		}
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
		if (seasonNow() !== 3 || mode11 === "winter") return;
		const here = tileOf(player.x, player.y);
		if (nightDark(clock) < .3 || inFarm(here.tx, here.ty)) {
			coldAcc = 0;
			return;
		}
		coldAcc += dt;
		if (coldAcc > 8) {
			coldAcc = 0;
			player.hp = Math.max(1, player.hp - 1);
			pushLog("The cold's getting into you. Get to a fire.");
		}
	}
	function q11HuntStart(kind) {
		const wind = Math.floor(Math.random() * 8);
		q11.hunt = {
			kind,
			wind,
			on: true
		};
		const spec = kind === "moose" ? [
			"moose",
			null,
			"Bull moose",
			52,
			10,
			22
		] : kind === "bear" ? [
			"wolf",
			"bear",
			"Black bear",
			58,
			9,
			26
		] : [
			"deer",
			null,
			"Whitetail buck",
			26,
			3,
			10
		];
		let spot = null;
		for (let k = 0; k < 8 && !spot; k++) {
			const a = Math.random() * Math.PI * 2;
			const s = {
				x: player.x + Math.cos(a) * 16 * 64,
				y: player.y + Math.sin(a) * 16 * 64
			};
			const t = tileOf(s.x, s.y);
			if (t.tx > 4 && t.ty > 4 && t.tx < 150 && t.ty < 150) spot = s;
		}
		const e = q11Spawn(spec, spot ?? {
			x: player.x + 640,
			y: player.y
		}, "hunt", false);
		if (e) e.temper = kind === "bear" ? "hostile" : "wary";
		pushLog(`Hunting trip: a ${kind === "bear" ? "black bear" : kind === "moose" ? "bull moose" : "whitetail"} is out there. Wind's out of the ${COMPASS8[wind]}. Come at it with the wind in your face.`);
		return e;
	}
	/** Unit vector the wind blows toward, in world space (wind "out of the N" blows toward screen-south). */
	function windVec(w) {
		const a = (w * 45 - 90) * Math.PI / 180;
		const sx = -Math.cos(a), sy = -Math.sin(a);
		const vx = sy + sx / 2, vy = sy - sx / 2, L = Math.hypot(vx, vy) || 1;
		return {
			x: vx / L,
			y: vy / L
		};
	}
	function q11HuntStep() {
		if (!q11.hunt) return;
		const prey = world.enemies.find((e) => !e.dead && e.q11 === "hunt");
		if (!prey) {
			q11.hunt = null;
			return;
		}
		const dx = prey.x - player.x, dy = prey.y - player.y, d = Math.hypot(dx, dy);
		const w = windVec(q11.hunt.wind);
		const downwind = (dx * w.x + dy * w.y) / (d || 1) > .55;
		if (q11.hunt.kind !== "bear" && downwind && d < 704 && d > 128) {
			prey.dead = true;
			prey.death = 0;
			q11.hunt = null;
			pushLog("It threw its head up, got your scent on the wind, and it's gone. Try again, and mind the wind.");
			sfx("click");
			sync(true);
		}
	}
	function q11HuntDone(e) {
		const kind = q11.hunt?.kind ?? "deer";
		q11.hunt = null;
		if (kind === "moose") {
			giveItem("meat", 4);
			giveItem("hide", 1);
		} else if (kind === "bear") {
			giveItem("meat", 3);
			giveItem("pelt", 1);
		} else {
			giveItem("meat", 2);
			giveItem("hide", 1);
		}
		pushLog(`Hunting trip: done. You dress out the ${e.name?.toLowerCase() ?? "animal"} and pack the meat home.`);
		saveGame();
		sync(true);
	}
	function q11OpenFish(site) {
		const ice = seasonNow() === 3 && FISH_WATER[site] !== "river";
		if (seasonNow() === 3 && FISH_WATER[site] === "river") {
			dialogue = {
				speaker: Q11_SITES[site].name,
				text: "The Kennebec runs open in the riffles all winter. Cold hands, but the trout are in there.",
				choices: [{
					label: "Wet a line",
					id: `q11-fish-cast-${site}`
				}, {
					label: "Leave it",
					id: "close"
				}]
			};
			talkNpc = null;
			phase = "dialogue";
			intent = null;
			sfx("talk");
			sync(true);
			return;
		}
		dialogue = {
			speaker: Q11_SITES[site].name,
			text: ice ? "Ice thick enough to stand on. Chop a hole, drop a line." : "Dark water, slow at the edge. Good spot for a line.",
			choices: [{
				label: ice ? "Chop a hole and fish" : "Wet a line",
				id: `q11-fish-cast-${site}`
			}, {
				label: "Leave it",
				id: "close"
			}]
		};
		talkNpc = null;
		phase = "dialogue";
		intent = null;
		sfx("talk");
		sync(true);
	}
	function fishPos() {
		if (!fishGame) return 0;
		return .5 + .5 * Math.sin((performance.now() - fishGame.t0) / 1e3 * fishGame.speed * Math.PI);
	}
	const FISH_PER_DAY = 3;
	/** v13: water type per fishing site. Ice fishing on the ponds in winter; the river runs open. */
	const FISH_WATER = {
		fishKennebec: "river",
		fishPond: "lake",
		fishHoleb: "lake"
	};
	function fishWater(site) {
		const w = FISH_WATER[site] ?? "lake";
		return w === "lake" && seasonNow() === 3 ? "ice" : w;
	}
	function q11FishHook() {
		const p = fishPos();
		const hit = fishForce ?? (p >= fishGame.zone && p <= fishGame.zone + (fishGame.width ?? .2));
		const water = fishGame.water ?? "lake";
		fishGame = null;
		if (!hit) {
			pushLog("You yank too soon. It spits the hook.");
			return;
		}
		q11.fish.caught += 1;
		if (q11.fish.day !== curDay()) {
			q11.fish.day = curDay();
			q11.fish.today = 0;
		}
		q11.fish.today = (q11.fish.today ?? 0) + 1;
		train("fishing", 6);
		w13.lastFish = water;
		if (Math.random() < .12 * (perk13("fishing", 6) ? 2 : 1)) {
			q11.fish.rare += 1;
			giveItem("smokedfish", 3);
			pushLog(water === "river" ? "A brook trout as long as your arm, red-bellied. That's a fish they'll talk about at the store." : water === "ice" ? "A togue, a lake trout, up through the ice. A monster." : "A landlocked salmon, jumping. That's a fish they'll talk about at the store.");
		} else if (water === "river") {
			giveItem("trout", 1);
			pushLog("A brook trout out of the riffle. Supper.");
		} else {
			giveItem("smokedfish", 1);
			pushLog(water === "ice" ? "A yellow perch through the ice. Supper." : "A fat pickerel on the line. Supper.");
		}
		sfx("level");
	}
	function paintFish() {
		if (!fishGame) return;
		const w = Math.min(420, viewW - 40), x = (viewW - w) / 2, y = viewH * .22;
		ctx.save();
		ctx.fillStyle = "rgba(20,24,28,.82)";
		ctx.fillRect(x - 8, y - 30, w + 16, 58);
		ctx.fillStyle = "#3b4a52";
		ctx.fillRect(x, y, w, 18);
		ctx.fillStyle = "#5fae5a";
		ctx.fillRect(x + fishGame.zone * w, y, (fishGame.width ?? .2) * w, 18);
		ctx.fillStyle = "#f2e6c8";
		ctx.fillRect(x + fishPos() * w - 3, y - 6, 6, 30);
		ctx.font = "600 14px sans-serif";
		ctx.fillText("Set the hook when the bobber's in the green", x, y - 12);
		ctx.restore();
	}
	function q11CaravanAmbush(home) {
		const r = CARAVAN_ROUTES[q11.route];
		if (!(caravanForce ?? Math.random() < r.risk)) return false;
		q11.caravan = home ? 4 : 2;
		const spec = r.foe === "coyote" ? [
			"coyote",
			null,
			"Coyote",
			13,
			4,
			6
		] : [
			"bandit",
			"scout",
			"Road agent",
			18,
			4,
			9
		];
		for (let i = 0; i < 3; i++) {
			const a = i * 2.1;
			q11Spawn(spec, {
				x: player.x + Math.cos(a) * 6 * 64,
				y: player.y + Math.sin(a) * 6 * 64
			}, "caravan", true);
		}
		pushLog(home ? "Coming home, a tree's dropped across the road. That's no accident. Here they come." : "Halfway down, somebody steps out of the alders and grabs the horse's bridle. Ambush!");
		sfx("hit");
		return true;
	}
	function q11CaravanKill() {
		if (world.enemies.some((e) => !e.dead && e.q11 === "caravan")) return;
		if (q11.caravan === 2) {
			q11.caravan = 3;
			pushLog("The road's clear. On to Bangor.");
			q11Market();
		} else if (q11.caravan === 4) q11CaravanHome();
	}
	function q11Market() {
		dialogue = {
			speaker: "Bangor market",
			text: `Stalls along Main Street under the old Paul Bunyan statue. Folks trading out of their sleds. You've got ${player.scrap} iron.`,
			choices: [
				{
					label: "Sell a pelt (5 iron)",
					id: "q11-sell-pelt"
				},
				{
					label: "Sell a hide (3 iron)",
					id: "q11-sell-hide"
				},
				{
					label: "Sell a jar of syrup (6 iron)",
					id: "q11-sell-syrup"
				},
				{
					label: "Sell a bone (1 iron)",
					id: "q11-sell-bone"
				},
				{
					label: "Buy 8 shells (10 iron)",
					id: "q11-buy-shells"
				},
				{
					label: "Buy a fuel can (10 iron)",
					id: "q11-buy-fuel"
				},
				{
					label: "Buy 2 cans of gas (8 iron)",
					id: "q11-buy-gas"
				},
				{
					label: "Head home",
					id: "q11-car-home"
				}
			]
		};
		phase = "dialogue";
		sync(true);
	}
	function q11CaravanHome() {
		q11.caravan = 0;
		q11.trips += 1;
		clock += DAY_LENGTH_SEC * .25 * CARAVAN_ROUTES[q11.route].days;
		pushLog(`The cart rolls back into the yard at Cambridge Road. Trade caravan trips: ${q11.trips}.`);
		grantXp(16);
		saveGame();
		sync(true);
	}
	function q11StartMode(kind) {
		unlockAudio();
		sfx("click");
		useModeResult.setState({ result: null });
		if (kind === "endless") {
			api.raidMode();
			mode11 = "endless";
			m11 = {
				kind,
				best: Number(localStorage.getItem("maine-rpg-endless-best") || 0)
			};
			setLog(MODE_TEXT.endless);
			sync(true);
			return;
		}
		mode11 = kind;
		bootNew("Packer", "hunter", {
			strength: 1,
			vigor: 1,
			endurance: 1,
			intellect: 0,
			perception: 0,
			luck: 0
		}, "eye", "wool");
		mode11 = kind;
		snow = Math.max(snow, 3);
		jackMet = true;
		if (GEAR.carbine) {
			giveItem("carbine", 1);
			player.weaponId = "carbine";
		}
		giveItem("shells", 10);
		refreshGear(player);
		const fh = world.props.find((q) => q.kind === "farmhouse");
		if (fh) {
			const d = doorPoint(fh);
			player.x = d.x;
			player.y = d.y + 48;
		}
		const span = DAY_LENGTH_SEC;
		if (kind === "winter") {
			clock = Math.floor(clock / span) * span + 8 / 24 * span;
			q11.seasonDay = curDay() - 6;
			player.bag = player.bag.filter((s) => ![
				"apple",
				"stew",
				"jerky",
				"meat",
				"pork",
				"cider",
				"donut",
				"smokedfish"
			].includes(s.id));
			giveItem("jerky", 2);
			m11 = {
				kind,
				day0: curDay(),
				days: 3,
				warmth: 100,
				food: 70,
				ate: 0,
				t: 0
			};
		} else {
			clock = Math.floor(clock / span) * span + 21.5 / 24 * span;
			giveItem("lantern", 1);
			m11 = {
				kind,
				t: 0,
				dur: 150,
				caught: 0,
				lost: 0,
				hens: 6,
				spawnT: 2,
				spawned: 0
			};
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
		if (kind === "winter") result = {
			mode: kind,
			title: won ? "Spring came" : "Winter won",
			lines: [
				why,
				`Days survived: ${Math.max(0, curDay() - m11.day0)} of ${m11.days}`,
				`Meals eaten: ${m11.ate}`
			]
		};
		else if (kind === "watch") result = {
			mode: kind,
			title: m11.hens > 0 ? "Dawn at Cambridge Road" : "The hens are gone",
			lines: [
				why,
				`Prowlers caught: ${m11.caught}`,
				`Hens lost: ${m11.lost} of 6`
			]
		};
		else {
			const score = m11.score ?? 0;
			const best = Math.max(score, m11.best || 0);
			localStorage.setItem("maine-rpg-endless-best", String(best));
			result = {
				mode: kind,
				title: "The farm fell",
				lines: [
					why,
					`Waves held: ${m11.waves ?? 0} · Raiders down: ${m11.kills ?? 0}`,
					`Score: ${score}`,
					`Best: ${best}${score >= best && score > 0 ? " (new best!)" : ""}`
				],
				score,
				best
			};
		}
		mode11 = null;
		m11 = null;
		fishGame = null;
		ripples = [];
		useModeResult.setState({ result });
		phase = "menu";
		dialogue = null;
		buildOpen = false;
		sfx(won ? "level" : "die");
		sync(true);
	}
	/** Runs every frame before anything else. */
	function q11ModeTick(dt) {
		if (!mode11 || !player || !world) return;
		if (phase === "menu") {
			mode11 = null;
			m11 = null;
			return;
		}
		if (mode11 === "endless") {
			const span = DAY_LENGTH_SEC;
			const into = (clock % span + span) % span;
			if (into < span * 21 / 24 && into > span * 6 / 24) clock = Math.floor(clock / span) * span + span * 22 / 24;
			if (into < span * 6 / 24) clock = Math.floor(clock / span) * span - span * 2 / 24;
			return;
		}
		if (phase === "dead") {
			m11.deadT = (m11.deadT || 0) + dt;
			if (m11.deadT > 1.6) q11EndMode(false, mode11 === "winter" ? "The cold took you before the thaw." : "They got the drop on you in the dark.");
			return;
		}
		if (phase !== "play") return;
		m11.t += dt;
		tileOf(player.x, player.y);
		if (mode11 === "winter") {
			clock += dt * 3;
			const fh = world.props.find((p) => p.kind === "farmhouse");
			const warm = inside || world.props.some((p) => FIRES[p.kind] && Math.hypot(propCenter(p).x - player.x, propCenter(p).y - player.y) < 200) || fh && Math.hypot(propCenter(fh).x - player.x, propCenter(fh).y - player.y) < 220;
			const night = nightDark(clock) > .3;
			m11.warmth = Math.max(0, Math.min(100, m11.warmth + (warm ? 10 : night ? -1.6 : -.7) * dt));
			m11.food = Math.max(0, m11.food - .45 * dt);
			if (m11.food < 35) {
				const meal = [
					"stew",
					"meat",
					"jerky",
					"pork",
					"smokedfish",
					"apple",
					"donut",
					"cider"
				].find((id) => carrying(id));
				if (meal) {
					takeItem(meal, 1);
					m11.food = Math.min(100, m11.food + 40);
					m11.ate += 1;
					pushLog(`You eat ${GEAR[meal]?.name?.toLowerCase() ?? "something"}. Food ${Math.round(m11.food)}.`);
				}
			}
			if (m11.warmth <= 0 || m11.food <= 0) {
				player.hp -= 1.5 * dt;
				if (player.hp <= 0) {
					player.hp = 0;
					phase = "dead";
					sync(true);
				}
			}
			if (curDay() >= m11.day0 + m11.days) q11EndMode(true, "The eaves are dripping and the brook's running under the ice. You made it to spring.");
			return;
		}
		if (mode11 === "watch") {
			const fc = farmCenter();
			const hens = {
				x: fc.x + 192,
				y: fc.y + 192
			};
			const lamp = carrying("lantern") ? 290 : 170;
			m11.spawnT -= dt;
			if (m11.spawnT <= 0 && m11.spawned < 9) {
				m11.spawnT = 12 + Math.random() * 6;
				m11.spawned += 1;
				const a = Math.random() * Math.PI * 2;
				q11Spawn([
					"bandit",
					"scout",
					"Prowler",
					16,
					4,
					8
				], {
					x: hens.x + Math.cos(a) * 15 * 64,
					y: hens.y + Math.sin(a) * 15 * 64
				}, "watch", false);
			}
			for (const e of world.enemies) {
				if (e.dead || e.q11 !== "watch") continue;
				const dp = Math.hypot(e.x - player.x, e.y - player.y);
				if (!e.aggro && dp < lamp) {
					e.aggro = true;
					pushLog("There! In the lantern light, a man by the woodpile.");
				}
				if (e.aggro) continue;
				const dx = hens.x - e.x, dy = hens.y - e.y, d = Math.hypot(dx, dy);
				if (d < 70) {
					e.dead = true;
					e.death = 0;
					m11.lost += 1;
					m11.hens -= 1;
					pushLog(`A hen squawks and goes quiet. ${m11.hens} left.`);
					continue;
				}
				const sp = 62 * dt;
				e.x += dx / d * sp;
				e.y += dy / d * sp;
				e.homeX = e.x;
				e.homeY = e.y;
				e.dir = facing8(dx, dy);
				e.anim += sp;
				e.rip = (e.rip || 0) - dt;
				if (e.rip <= 0) {
					e.rip = 1.1;
					ripples.push({
						x: e.x,
						y: e.y,
						t: 0
					});
				}
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
			ctx.beginPath();
			ctx.ellipse(p.sx, p.sy, (14 + 70 * k) * zoom, (7 + 35 * k) * zoom, 0, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.restore();
	}
	function paintSeason() {
		const tint = mode11 === "winter" ? SEASON_TINT[3] : SEASON_TINT[seasonNow()];
		if (!tint || !world || mapId > 1) return;
		ctx.save();
		ctx.fillStyle = tint;
		ctx.fillRect(0, 0, viewW, viewH);
		ctx.restore();
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
		out.push({
			id: "q11-season",
			title: `${SEASONS[seasonNow()]} at Cambridge Road`,
			done: false,
			text: `Day ${curDay() + 1}. Farm: potato plots ${f.plots}, coop ${f.coop}, stone wall ${f.wall}, smokehouse ${f.smoke}. Fish caught ${q11.fish.caught}${q11.fish.rare ? ` (${q11.fish.rare} rare)` : ""}. Caravan trips ${q11.trips}.${q11.traps.length ? ` Snares set: ${q11.traps.length}.` : ""}`
		});
		return out;
	}
	/** Farm talk options for the play types. */
	function q11FarmChoices(role) {
		if (snow < 3 || raid || mode11) return [];
		if (role === "sarah") return [{
			label: "Work on the farm",
			id: "q11-farm"
		}];
		if (role === "justin") return [{
			label: "Go on a hunting trip",
			id: "q11-hunt"
		}, ...q11.caravan === 0 ? [{
			label: "Take the cart to Bangor",
			id: "q11-caravan"
		}] : []];
		return [];
	}
	function q11Choice(id) {
		const openD = (d) => {
			dialogue = d;
			phase = "dialogue";
			sfx("click");
			sync(true);
			return true;
		};
		const close = () => {
			dialogue = null;
			phase = "play";
			sync(true);
			return true;
		};
		let m;
		if (m = id.match(/^q11-ask-(.+)$/)) {
			const q = questById(m[1]);
			return q ? openD(q11Ask(q)) : false;
		}
		if (m = id.match(/^q11-accept-(.+)$/)) {
			const q = questById(m[1]);
			const st = q && q11St(q.id);
			if (q && st.s === 0) {
				st.s = 1;
				pushLog(`${q.title}: ${q.steps[0].hud}`);
				q11Begin(q);
				saveGame();
			}
			return false;
		}
		if (m = id.match(/^q11-take-(.+)$/)) {
			const q = questById(m[1]);
			const step = q && q11Cur(q);
			if (step?.kind === "take") {
				const missing = (step.need ?? []).filter((id) => !carrying(id));
				if (missing.length) {
					pushLog(`Still missing: ${missing.map((id) => GEAR[id]?.name ?? id).join(", ")}.`);
					dialogue = null;
					phase = "play";
					sync(true);
					return true;
				}
				if (step.cost && player.scrap < step.cost) {
					pushLog(`Not enough iron. That's ${step.cost}.`);
					dialogue = null;
					phase = "play";
					sync(true);
					return true;
				}
				if (step.cost) player.scrap -= step.cost;
				for (const id of step.need ?? []) takeItem(id, 1);
				for (const [it, n] of step.give ?? []) giveItem(it, n);
				dialogue = null;
				phase = "play";
				q11Advance(q, step.log);
				return true;
			}
			return false;
		}
		if (m = id.match(/^q11-done-(.+)$/)) {
			const q = questById(m[1]);
			const st = q && q11St(q.id);
			if (q && st.s === q.steps.length + 1) {
				st.s += 1;
				for (const [it, n] of q.reward) giveItem(it, n);
				if (q.iron) player.scrap += q.iron;
				grantXp(q.xp);
				shiftRep("ponds", 2, 6);
				pushLog(`${q.title}: done. ${q.after}`);
				if (q.id === "bike") {
					achieve("bike");
					train("mechanics", 20);
				}
				v13SideQuestDone(q.id);
				if (q.id === "meds") achieve("meds");
				for (const area of [
					0,
					1,
					2
				]) {
					const list = Q11.filter((x) => x.steps.every((st) => siteMap(st.site) === area || st.site.startsWith("npc:")) && x.steps.some((st) => siteMap(st.site) === area && !st.site.startsWith("npc:")));
					if (list.length && list.every((x) => (q11.q[x.id]?.s ?? 0) >= x.steps.length + 2)) achieve("area");
				}
				sfx("level");
				saveGame();
			}
			return false;
		}
		if (id === "q11-farm") return openD({
			speaker: "Sarah",
			text: `What do you want to put up? You've got ${player.wood} wood, ${player.stone} stone and ${player.scrap} iron. It's ${SEASONS[seasonNow()].toLowerCase()}.`,
			choices: [
				{
					label: "Bigger works: greenhouse, barrel, solar, lookout, palisade, cellar, workbench",
					id: "q113-works"
				},
				...FARM_UPGRADES.map((u) => ({
					label: `${u.name} ${q11.farm[u.id]}/${u.max}: ${[
						u.wood && `${u.wood} wood`,
						u.stone && `${u.stone} stone`,
						u.iron && `${u.iron} iron`
					].filter(Boolean).join(", ")}`,
					id: `q11-build-${u.id}`
				})),
				{
					label: "Never mind",
					id: "close"
				}
			]
		});
		if (m = id.match(/^q11-build-(.+)$/)) {
			const u = FARM_UPGRADES.find((x) => x.id === m[1]);
			if (!u) return false;
			if (q11.farm[u.id] >= u.max) pushLog(`The ${u.name.toLowerCase()} is as big as it's getting.`);
			else if (player.wood < u.wood || player.stone < u.stone || player.scrap < u.iron) pushLog(`Not enough for the ${u.name.toLowerCase()}.`);
			else {
				player.wood -= u.wood;
				player.stone -= u.stone;
				player.scrap -= u.iron;
				q11.farm[u.id] += 1;
				q11FarmProps();
				pushLog(`You put up the ${u.name.toLowerCase()}. ${u.blurb}`);
				sfx("build");
				saveGame();
			}
			return q11Choice("q11-farm");
		}
		if (id === "q11-hunt" && q11.huntDay === curDay()) return openD({
			speaker: "Justin",
			text: "We've been out once today. Let the woods settle. Tomorrow.",
			choices: [{
				label: "All right",
				id: "close"
			}]
		});
		if (id === "q11-hunt") return openD({
			speaker: "Justin",
			text: "Short trip or long? Mind the wind. If it's at your back they'll smell you a quarter mile off.",
			choices: [
				{
					label: "Deer in the cutover",
					id: "q11-hunt-deer"
				},
				{
					label: "Moose in the alders",
					id: "q11-hunt-moose"
				},
				{
					label: "Bear up on the ridge",
					id: "q11-hunt-bear"
				},
				{
					label: "Not today",
					id: "close"
				}
			]
		});
		if (m = id.match(/^q11-hunt-(deer|moose|bear)$/)) {
			close();
			q11.huntDay = curDay();
			q11HuntStart(m[1]);
			return true;
		}
		if (id === "q11-caravan") return openD({
			speaker: "Justin",
			text: "Bangor's a long day with the cart. Which way? Route 2's quick but there's road agents. The river road's slower and quieter. The back roads are coyote country.",
			choices: [...CARAVAN_ROUTES.map((r, i) => ({
				label: r.label,
				id: `q11-car-route-${i}`
			})), {
				label: "Not today",
				id: "close"
			}]
		});
		if (m = id.match(/^q11-car-route-(\d)$/)) {
			q11.route = Number(m[1]);
			q11.caravan = 1;
			pushLog(`You hitch the cart and take ${CARAVAN_ROUTES[q11.route].label.split(" (")[0].toLowerCase()} for Bangor.`);
			close();
			if (!q11CaravanAmbush(false)) {
				q11.caravan = 3;
				q11Market();
			}
			return true;
		}
		const sell = {
			"q11-sell-pelt": ["pelt", 5],
			"q11-sell-hide": ["hide", 3],
			"q11-sell-syrup": ["syrup", 6],
			"q11-sell-bone": ["bone", 1]
		}[id];
		if (sell && q11.caravan === 3) {
			if (takeItem(sell[0], 1)) {
				player.scrap += sell[1];
				pushLog(`Sold. +${sell[1]} iron.`);
				sfx("click");
			} else pushLog("You haven't got one to sell.");
			q11Market();
			return true;
		}
		const buy = {
			"q11-buy-shells": [
				"shells",
				8,
				10
			],
			"q11-buy-fuel": [
				"fuel",
				1,
				10
			],
			"q11-buy-gas": [
				"gas",
				2,
				8
			]
		}[id];
		if (buy && q11.caravan === 3) {
			buy[2] = v3Price(buy[2]);
			train("barter", 3);
			if (player.scrap >= buy[2]) {
				player.scrap -= buy[2];
				giveItem(buy[0], buy[1]);
				pushLog(`Bought. -${buy[2]} iron.`);
			} else pushLog("Not enough iron.");
			q11Market();
			return true;
		}
		if (id === "q11-car-home" && q11.caravan === 3) {
			close();
			if (!q11CaravanAmbush(true)) q11CaravanHome();
			return true;
		}
		if ((m = id.match(/^q11-fish-cast-(.+)$/)) && q11.fish.day === curDay() && (q11.fish.today ?? 0) >= FISH_PER_DAY + (perk13("fishing", 3) ? 1 : 0)) return openD({
			speaker: "Fishing",
			text: "They've gone off the bite. Nothing's touching it. Try again tomorrow.",
			choices: [{
				label: "Reel in",
				id: "q11-fish-stop"
			}]
		});
		if (m = id.match(/^q11-fish-cast-(.+)$/)) {
			fishGame = {
				t0: performance.now(),
				speed: (.7 + Math.random() * .5) * (fishWater(m[1]) === "river" ? 1.25 : fishWater(m[1]) === "ice" && !perk13("fishing", 9) ? .8 : 1),
				zone: .15 + Math.random() * .6,
				width: Math.min(.36, .2 + .02 * lv("fishing")),
				site: m[1],
				water: fishWater(m[1])
			};
			return openD({
				speaker: "Fishing",
				text: "The bobber rides the ripples. Wait for it to dip into the green, then set the hook.",
				choices: [{
					label: "Set the hook!",
					id: "q11-fish-hook"
				}, {
					label: "Reel in",
					id: "q11-fish-stop"
				}]
			});
		}
		if (id === "q11-fish-hook" && fishGame) {
			q11FishHook();
			close();
			saveGame();
			return true;
		}
		if (id === "q11-fish-stop") {
			fishGame = null;
			return close();
		}
		return false;
	}
	function freshV3() {
		const skills = {};
		for (const s of TRADE_SKILLS) skills[s.id] = {
			lv: 0,
			xp: 0
		};
		const up = {};
		for (const u of FARM_UPGRADES$1) up[u.id] = 0;
		return {
			ach: {},
			skills,
			up,
			dog: {
				mode: "follow",
				hp: 30,
				down: -1,
				joined: false
			},
			wind: 0,
			windDay: -1,
			stats: {
				tracks: 0,
				catches: 0,
				dressed: 0,
				gas: 0
			},
			toastN: 0
		};
	}
	function loadV3(raw) {
		const b = freshV3();
		if (!raw || typeof raw !== "object") return b;
		return {
			...b,
			...raw,
			ach: { ...raw.ach ?? {} },
			skills: {
				...b.skills,
				...raw.skills ?? {}
			},
			up: {
				...b.up,
				...raw.up ?? {}
			},
			dog: {
				...b.dog,
				...raw.dog ?? {}
			},
			stats: {
				...b.stats,
				...raw.stats ?? {}
			}
		};
	}
	let v3 = freshV3();
	let v3Toast = null;
	function achieve(id) {
		const a = ACHIEVEMENTS.find((x) => x.id === id);
		if (!a || v3.ach[id] || mode11) return false;
		v3.ach[id] = Date.now();
		v3.toastN += 1;
		v3Toast = {
			id,
			name: a.name,
			text: a.text,
			n: v3.toastN
		};
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
		if (!s || mode11 || s.lv >= 10) return;
		s.xp += n;
		while (s.lv < 10 && s.xp >= skillNeed(s.lv)) {
			s.xp -= skillNeed(s.lv);
			s.lv += 1;
			const d = TRADE_SKILLS.find((x) => x.id === id);
			pushLog(`${d.name} is now ${s.lv}. ${d.perk}`);
			if (s.lv >= 5) achieve("skill5");
			sync(true);
		}
	}
	function v3Price(cost) {
		return Math.max(1, Math.round(cost * (1 - Math.min(.3, .03 * lv("barter") + (perk13("barter", 3) ? .05 : 0) + (perk13("barter", 9) ? .05 : 0)) - fx13().barterPct / 100 - (w13.rebuilt.store ? .1 : 0))));
	}
	function upCost(u, tier) {
		const t = u.tiers[tier];
		const cut = 1 - .04 * lv("carpentry");
		return {
			wood: Math.ceil(t.wood * cut),
			stone: Math.ceil(t.stone * cut),
			iron: t.iron,
			need: (t.need ?? []).filter(([, n]) => n > 0)
		};
	}
	function upLabel(u) {
		const tier = v3.up[u.id];
		if (tier >= u.tiers.length) return `${u.name}: done (${tier}/${u.tiers.length})`;
		const c = upCost(u, tier);
		const bits = [
			c.wood && `${c.wood} wood`,
			c.stone && `${c.stone} stone`,
			c.iron && `${c.iron} iron`,
			...c.need.map(([id, n]) => `${n} ${GEAR[id]?.name.toLowerCase() ?? id}`)
		].filter(Boolean).join(", ");
		return `${u.name} ${tier}/${u.tiers.length}: ${bits} (${u.tiers[tier].effect})`;
	}
	function buildUpgrade(id) {
		const u = FARM_UPGRADES$1.find((x) => x.id === id);
		if (!u || !player) return;
		const tier = v3.up[id];
		if (tier >= u.tiers.length) {
			pushLog(`The ${u.name.toLowerCase()} is as good as it gets.`);
			return;
		}
		const c = upCost(u, tier);
		if (player.wood < c.wood || player.stone < c.stone || player.scrap < c.iron || c.need.some(([it, n]) => (player.bag.find((s) => s.id === it)?.qty ?? 0) < n)) {
			pushLog(`Not enough for the ${u.name.toLowerCase()}. ${upLabel(u)}`);
			return;
		}
		player.wood -= c.wood;
		player.stone -= c.stone;
		player.scrap -= c.iron;
		for (const [it, n] of c.need) takeItem(it, n);
		v3.up[id] = tier + 1;
		train("carpentry", 12 + 6 * tier);
		pushLog(`You put up the ${u.name.toLowerCase()} (tier ${tier + 1}). ${u.tiers[tier].effect}`);
		achieve("upgrade");
		if (id === "palisade") achieve("palisade");
		if (id === "bench" && tier + 1 >= 2) achieve("forge");
		v3FarmProps();
		sfx("build");
		saveGame();
		sync(true);
	}
	/** Stand-in props for farm upgrades (art hook: public/game/v2/<art>.png via optional.json). */
	const UP_PROP = {
		greenhouse: [
			"shelter",
			16,
			6
		],
		barrel: [
			"crates",
			10,
			-6
		],
		solar: [
			"stall",
			14,
			-8
		],
		lookout: [
			"stand",
			-14,
			-10
		],
		palisade: [
			"fence",
			-16,
			4
		],
		cellar: [
			"hatch",
			12,
			10
		],
		bench: [
			"workshop",
			-10,
			12
		]
	};
	function v3FarmProps() {
		if (!world || mapId !== 0) return;
		const fc = farmCenter();
		const ft = tileOf(fc.x, fc.y);
		for (const u of FARM_UPGRADES$1) {
			if (!v3.up[u.id] || !UP_PROP[u.id] || world.props.some((p) => p.v3up === u.id)) continue;
			const [kind, dx, dy] = UP_PROP[u.id];
			outer: for (let r = 0; r < 6; r++) for (let y = ft.ty + dy - r; y <= ft.ty + dy + r; y++) for (let x = ft.tx + dx - r; x <= ft.tx + dx + r; x++) {
				if (Math.max(Math.abs(x - ft.tx - dx), Math.abs(y - ft.ty - dy)) !== r) continue;
				if (addProp(world, kind, x, y, {
					v3up: u.id,
					skin: u.art,
					built: true
				})) break outer;
			}
		}
	}
	function v3Daily(day) {
		if (!player || mode11) return;
		const got = [];
		const winter = seasonNow() === 3;
		if (v3.up.greenhouse) {
			const n = v3.up.greenhouse * 2;
			giveItem("greens", n);
			got.push(`${n} greens from the greenhouse${winter ? " (snow on the glass)" : ""}`);
		}
		if (v3.up.barrel) {
			giveItem("water", v3.up.barrel);
			got.push(`${v3.up.barrel} jug${v3.up.barrel > 1 ? "s" : ""} of rain water`);
		}
		if (v3.up.cellar) {
			giveItem("apple", v3.up.cellar);
			got.push(`${v3.up.cellar} potato${v3.up.cellar > 1 ? "es" : ""} from the cellar`);
		}
		if (got.length) pushLog(`Farm works: ${got.join(", ")}.`);
		if (v3.windDay !== day) {
			v3.windDay = day;
			v3.wind = Math.floor(Math.random() * 8);
		}
		if (curDay() - (q11.seasonDay || 0) >= 24) achieve("winter");
		if (v3.dog.down >= 0 && day >= v3.dog.down) {
			v3.dog.down = -1;
			v3.dog.hp = 30;
			v3.dog.mode = "stay";
			pushLog("Biscuit's up and wagging at the farm again. Tell him to follow when you're ready.");
			if (mapId === 0) q10PlaceDog();
		}
	}
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
		if (spot) {
			player.x = spot.x;
			player.y = spot.y;
		} else if (arrive) {
			player.x = arrive.arriveTx * 64 + 32;
			player.y = arrive.arriveTy * 64 + 32;
		}
		intent = null;
		work = null;
		holdWalk = false;
		inside = null;
		opening = null;
		travelLock = 1.6;
		q10World();
		spawnCrows();
		const land = tileOf(player.x, player.y);
		reveal(land.tx, land.ty, sightRadius(), true);
		pushLog(target >= 3 ? target === 9 ? "You stop on the road." : `You come into ${world.name}.` : target === 2 ? `Two hours down the old road from ${leaving}. Skowhegan: dead streetlights, the Kennebec loud in the gorge, and one bridge.` : `The road climbs out of the river valley. You come back into ${world.name}.`);
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
	function isGame(e) {
		return !e.dead && e.kind !== "bandit" && e.kind !== "squirrel";
	}
	function v3TrackTick(dt) {
		if (!world || !player) return;
		for (const e of world.enemies) {
			if (!isGame(e)) continue;
			const wolf = e.kind === "wolf";
			if (e.kind !== "moose" && e.kind !== "deer" && !wolf) {
				if (e.trail) e.trail = null;
				continue;
			}
			const last = e.trail?.[e.trail.length - 1];
			if (!last || Math.hypot(e.x - last.x, e.y - last.y) > (wolf ? 276 : 138)) {
				(e.trail ??= []).push({
					x: e.x,
					y: e.y,
					dir: e.dir || 0,
					t: clock
				});
				if (e.trail.length > (wolf ? 3 : 5)) e.trail.shift();
			}
		}
		for (const e of world.enemies) {
			if (!isGame(e) || !e.trail) continue;
			if (e.trail.some((p) => Math.hypot(p.x - player.x, p.y - player.y) < 34)) e.onTrail = clock;
			if (e.onTrail && !e.tracked && clock - e.onTrail < 40 && Math.hypot(e.x - player.x, e.y - player.y) < 190) {
				e.tracked = true;
				v3.stats.tracks += 1;
				train("hunting", 6);
				pushLog(`You followed the tracks right up to the ${e.name?.toLowerCase() || e.kind}.`);
				achieve("tracks");
			}
		}
	}
	function windVec3(w) {
		const a = (w * 45 - 90) * Math.PI / 180;
		return {
			x: Math.cos(a),
			y: Math.sin(a)
		};
	}
	/** Timid game smells you when you're upwind, and bolts at loud noise. */
	function v3Spook(enemy, dist) {
		if (!player || q11.hunt) return false;
		if (enemy.kind === "bandit" || enemy.temper !== "timid") return false;
		const w = windVec3(v3.wind);
		const dx = enemy.x - player.x, dy = enemy.y - player.y;
		const downwind = (dx * w.x + dy * w.y) / (dist || 1) > .6;
		const reach = (8 - Math.min(4, lv("hunting") * .4)) * 64;
		if (downwind && dist < reach) {
			if (!enemy.aggro) {
				enemy.aggro = true;
				alertPack(enemy);
			}
			return true;
		}
		return false;
	}
	function v3Noise(x, y, r) {
		if (!world) return;
		for (const e of world.enemies) if (!e.dead && e.temper === "timid" && Math.hypot(e.x - x, e.y - y) < r) {
			e.aggro = true;
			alertPack(e);
		}
	}
	function setTrap(kind) {
		if (!player || !world) return;
		const def = TRAP_KINDS[kind];
		takeItem(def.item, 1);
		q11.traps.push({
			x: player.x,
			y: player.y,
			day: curDay(),
			kind,
			map: mapId
		});
		train("trapping", 3);
		pushLog(kind === "trap" ? "You bed a steel trap in a fox run and sift leaves over it. Check it in a day or two." : "You set a wire snare in a hare run. Check it tomorrow.");
		saveGame();
		sync(true);
	}
	function trapRoll(trap) {
		const def = TRAP_KINDS[trap.kind ?? "snare"] ?? TRAP_KINDS.snare;
		if (Math.random() >= def.base + .05 * lv("trapping")) return "";
		return def.catches[Math.random() * def.catches.length | 0];
	}
	function trapLoot(what) {
		const out = what === "fox" ? [
			["pelt", 1],
			["meat", 1],
			["bone", 1]
		] : what === "coyote" ? [["pelt", 1], ["bone", 2]] : [["meat", 1], ["bone", 1]];
		if (lv("hunting") >= 4) out[0] = [out[0][0], out[0][1] + 1];
		return out;
	}
	function checkTrap(trap, fetched) {
		const what = trap.caught;
		for (const [it, n] of trapLoot(what)) giveItem(it, n);
		q11.traps.splice(q11.traps.indexOf(trap), 1);
		if (Math.random() < .8) giveItem(TRAP_KINDS[trap.kind ?? "snare"].item, 1);
		v3.stats.catches += 1;
		v3.stats.dressed += 1;
		train("trapping", 8);
		train("hunting", 3);
		const name = what === "rabbit" ? "snowshoe hare" : what;
		pushLog(fetched ? `Biscuit trots back with the ${name} from your ${trap.kind === "trap" ? "trap" : "snare"}, proud as anything. Dressed out: meat, ${what === "rabbit" ? "" : "pelt, "}bone.` : `A ${name} in the ${trap.kind === "trap" ? "trap" : "snare"}. You dress it out on the spot: ${what === "rabbit" ? "meat and bone" : "pelt, meat and bone"}.`);
		achieve(what === "rabbit" ? "snare" : "trap");
		if (what === "rabbit" && trap.kind === "trap") achieve("snare");
		achieve("dress");
		sfx("gather");
		saveGame();
		sync(true);
	}
	function v3TrapTick() {
		if (!player || !world || inside) return;
		for (const trap of [...q11.traps]) {
			if (!trap.caught || (trap.map ?? 0) !== mapId) continue;
			if (Math.hypot(trap.x - player.x, trap.y - player.y) < 60) {
				checkTrap(trap, false);
				continue;
			}
			if (dogBody && q10.dog >= 4 && v3.dog.mode === "follow" && Math.hypot(trap.x - player.x, trap.y - player.y) < 960) checkTrap(trap, true);
		}
	}
	let barkT = 0, dogHitT = 0;
	function v3DogTick(dt) {
		if (!player || !world || q10.dog < 4 || mode11) return;
		if (!v3.dog.joined) {
			v3.dog.joined = true;
			achieve("biscuit");
		}
		if (v3.dog.down >= 0) {
			if (dogBody && mapId !== 0) dogBody = null;
			return;
		}
		if (v3.dog.mode === "stay") {
			if (!dogBody && mapId === 0) q10PlaceDog();
		} else if (!dogBody || Math.hypot(dogBody.x - player.x, dogBody.y - player.y) > 900) dogBody = {
			x: player.x + 46,
			y: player.y + 30,
			dir: 0,
			frame: 0,
			anim: 0,
			moving: false
		};
		if (!dogBody) return;
		dogBody.dog = true;
		if (inside) return;
		let tx = player.x + 46, ty = player.y + 30;
		if (v3.dog.mode === "track") {
			let best = null, bd = 1920;
			for (const e of world.enemies) {
				if (!isGame(e) || e.q11) continue;
				const d = Math.hypot(e.x - player.x, e.y - player.y);
				if (d < bd) {
					bd = d;
					best = e;
				}
			}
			if (best) {
				const d = Math.hypot(best.x - player.x, best.y - player.y) || 1;
				const lead = Math.min(d - 140, 260);
				tx = player.x + (best.x - player.x) / d * Math.max(40, lead);
				ty = player.y + (best.y - player.y) / d * Math.max(40, lead);
				if (best !== v3DogTick.last) {
					v3DogTick.last = best;
					pushLog(`Biscuit's nose goes down. He's on a ${best.kind}, off to the ${compassTo(best.x - player.x, best.y - player.y)}.`);
				}
			}
		}
		if (v3.dog.mode !== "stay") {
			const d = Math.hypot(tx - dogBody.x, ty - dogBody.y);
			dogBody.moving = d > 24;
			if (dogBody.moving) {
				const sp = Math.min(d, (mounted ? 560 : d > 180 ? 360 : 220) * dt);
				dogBody.dir = facing8(tx - dogBody.x, ty - dogBody.y);
				dogBody.x += (tx - dogBody.x) / d * sp;
				dogBody.y += (ty - dogBody.y) / d * sp;
			}
			dogBody.anim += dt * (dogBody.moving ? 9 : 0);
		}
		barkT -= dt;
		const raider = world.enemies.find((e) => !e.dead && e.kind === "bandit" && !e.aggro && Math.hypot(e.x - dogBody.x, e.y - dogBody.y) < 832);
		if (raider && barkT <= 0 && v3.dog.mode !== "stay") {
			barkT = 25;
			v3.barks = (v3.barks || 0) + 1;
			pushLog(`Biscuit stiffens and growls toward the ${compassTo(raider.x - player.x, raider.y - player.y)}. Raiders, close.`);
			sfx("hurt");
		}
		dogHitT -= dt;
		if (dogHitT <= 0) {
			const biter = world.enemies.find((e) => !e.dead && e.aggro && e.temper !== "timid" && Math.hypot(e.x - dogBody.x, e.y - dogBody.y) < 70);
			if (biter) {
				dogHitT = 1.5;
				dogHurt(Math.max(2, Math.round((biter.atk || 4) * .6)));
			}
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
		const id = [
			"bandage",
			"bandage-std",
			"bandage-good",
			"medicine",
			"trauma"
		].find((k) => carrying(k));
		if (!id) {
			pushLog("Nothing to wrap him with. Bandage or medicine.");
			return false;
		}
		takeItem(id, 1);
		v3.dog.hp = Math.min(30, v3.dog.hp + Math.round(15 * (1 + .08 * lv("medicine"))));
		train("medicine", 6);
		pushLog(`You wrap Biscuit's leg. He licks your hand (${v3.dog.hp}/30).`);
		sync(true);
		return true;
	}
	function dogCommand(mode) {
		if (q10.dog < 4) return;
		if (v3.dog.down >= 0) {
			pushLog("Biscuit's laid up at the farm until tomorrow.");
			return;
		}
		v3.dog.mode = mode;
		if (mode !== "stay" && !dogBody && player) dogBody = {
			x: player.x + 46,
			y: player.y + 30,
			dir: 0,
			frame: 0,
			anim: 0,
			moving: false
		};
		pushLog(mode === "stay" ? "\"Stay, Biscuit.\" He lies down with a sigh." : mode === "track" ? "\"Find 'em, Biscuit.\" His nose goes to the ground." : "\"Come on, Biscuit.\" He falls in at your heel.");
		sfx("click");
		sync(true);
	}
	function v3Tick(dt) {
		if (!player || !world || phase !== "play" || mode11) return;
		v3TrackTick(dt);
		v3TrapTick();
		v3DogTick(dt);
		if (player.scrap >= 100) achieve("rich");
		if (player.level >= 5) achieve("level5");
		if ((q11.fish.caught ?? 0) >= 10) achieve("fish10");
		if (mapId === 0 && snow >= 3 && travelLock <= 0 && !dialogue && !inside) {
			const s = skowSign();
			const near = Math.hypot(s.x - player.x, s.y - player.y) < 70;
			v3Tick.nearT = near ? (v3Tick.nearT || 0) + dt : 0;
			if (near && v3Tick.nearT > .6 && !v3Tick.latched) {
				v3Tick.latched = true;
				dialogue = {
					speaker: "Road to Skowhegan",
					text: "A green highway sign, shot full of holes: SKOWHEGAN 38. Under it somebody's painted TURN BACK. It's a long day's walk south, or a short ride.",
					choices: [{
						label: "Take the road to Skowhegan",
						id: "q113-skow-go"
					}, {
						label: "Not today",
						id: "close"
					}]
				};
				phase = "dialogue";
				sfx("talk");
				sync(true);
			}
			if (!near) v3Tick.latched = false;
		}
		v3Tick.sneak = (v3Tick.sneak || 0) + dt;
		if (v3Tick.sneak > 2) {
			v3Tick.sneak = 0;
			if (world.enemies.some((e) => !e.dead && !e.aggro && Math.hypot(e.x - player.x, e.y - player.y) < 200)) train("stealth", 1);
		}
	}
	function v3Hud() {
		return {
			skills: TRADE_SKILLS.map((d) => ({
				id: d.id,
				name: d.name,
				lv: v3.skills[d.id].lv,
				xp: v3.skills[d.id].xp,
				need: skillNeed(v3.skills[d.id].lv),
				perk: d.perk,
				how: d.how
			})),
			ach: ACHIEVEMENTS.map((a) => ({
				id: a.id,
				name: a.name,
				text: a.text,
				got: !!v3.ach[a.id]
			})),
			ups: FARM_UPGRADES$1.map((u) => ({
				id: u.id,
				name: u.name,
				tier: v3.up[u.id],
				max: u.tiers.length,
				next: v3.up[u.id] < u.tiers.length ? u.tiers[v3.up[u.id]].effect : ""
			})),
			dog: q10.dog >= 4 ? {
				mode: v3.dog.mode,
				hp: v3.dog.hp,
				down: v3.dog.down >= 0
			} : null,
			wind: COMPASS8[v3.wind],
			toast: v3Toast
		};
	}
	function v3Choice(id) {
		const openD = (d) => {
			dialogue = d;
			phase = "dialogue";
			sfx("click");
			sync(true);
			return true;
		};
		const close = () => {
			dialogue = null;
			phase = "play";
			sync(true);
			return true;
		};
		let m;
		if (id === "q113-skow-go") {
			close();
			travelTo(2, null);
			return true;
		}
		if (id === "q113-works") return openD({
			speaker: "Sarah",
			text: `Bigger works for the farm. You've got ${player.wood} wood, ${player.stone} stone and ${player.scrap} iron.`,
			choices: [...FARM_UPGRADES$1.map((u) => ({
				label: upLabel(u),
				id: `q113-up-${u.id}`
			})), {
				label: "Never mind",
				id: "close"
			}]
		});
		if (m = id.match(/^q113-up-(.+)$/)) {
			buildUpgrade(m[1]);
			return v3Choice("q113-works");
		}
		return false;
	}
	function v3Kill(enemy) {
		if (enemy.kind === "moose") achieve("moose");
		if (enemy.kind === "deer") achieve("deer");
		if (enemy.variant === "grok") achieve("grok");
		if (enemy.kind !== "bandit") train("hunting", enemy.kind === "moose" ? 16 : enemy.kind === "rabbit" || enemy.kind === "squirrel" ? 3 : 8);
		if (enemy.q11 === "meds" && !world.enemies.some((e) => !e.dead && e.q11 === "meds")) achieve("bridge");
	}
	function freshW13() {
		const loyal = {};
		for (const c of COMPANIONS) loyal[c] = 20;
		return {
			core: {
				agility: 1,
				grit: 1
			},
			backstory: "",
			hard: false,
			weather: {
				id: "clear",
				day: -1
			},
			needs: {
				hunger: 100,
				thirst: 100,
				sleep: 100
			},
			ail: {},
			buffs: {},
			dura: {},
			patched: {},
			dye: {},
			loyal,
			left: {},
			bounties: [],
			bountyDay: -99,
			bountyDone: 0,
			caravan: {},
			rebuilt: {
				store: 0,
				school: 0,
				clinic: 0
			},
			road: {
				day: -1,
				n: 0,
				acc: 0
			},
			seen: { farm: true },
			diary: [],
			notes: "",
			forageAcc: 0,
			forageDay: -1,
			forageN: 0,
			camps: {},
			freed: 0,
			migDay: -1,
			slipT: 0,
			lastHour: -1,
			main: {
				act: 1,
				ltKills: 0,
				choice: "",
				siege: 0,
				won: false,
				ending: "",
				slide: 0,
				flags: {}
			}
		};
	}
	function loadW13(raw) {
		const b = freshW13();
		if (!raw || typeof raw !== "object") return b;
		const m = (k) => ({
			...b[k],
			...raw[k] ?? {}
		});
		return {
			...b,
			...raw,
			core: m("core"),
			weather: m("weather"),
			needs: m("needs"),
			ail: m("ail"),
			buffs: m("buffs"),
			dura: m("dura"),
			patched: m("patched"),
			dye: m("dye"),
			loyal: m("loyal"),
			left: m("left"),
			caravan: m("caravan"),
			rebuilt: m("rebuilt"),
			road: m("road"),
			seen: m("seen"),
			camps: m("camps"),
			main: {
				...b.main,
				...raw.main ?? {},
				flags: { ...raw.main?.flags ?? {} }
			},
			bounties: Array.isArray(raw.bounties) ? raw.bounties : [],
			diary: Array.isArray(raw.diary) ? raw.diary : []
		};
	}
	let w13 = freshW13();
	let pendingBackstory = "";
	let pendingHard = false;
	function applyBackstory(id) {
		const b = BACKSTORIES.find((x) => x.id === id);
		if (!b || !player) return;
		w13.backstory = id;
		for (const [k, n] of Object.entries(b.core)) if (k === "agility" || k === "grit") w13.core[k] += n;
		else if (k === "wits") player.intellect += n;
		else player[k] = (player[k] ?? 0) + n;
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
		return (clock % DAY_LENGTH_SEC + DAY_LENGTH_SEC) % DAY_LENGTH_SEC / DAY_LENGTH_SEC * 24;
	}
	function core13() {
		const p = player;
		return {
			strength: p?.strength ?? 1,
			endurance: p?.endurance ?? 1,
			agility: w13.core.agility ?? 1,
			perception: p?.perception ?? 1,
			wits: p?.intellect ?? 0,
			grit: w13.core.grit ?? 1
		};
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
		w13.diary.push({
			day: curDay() + 1,
			text
		});
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
			if (w13.loyal[c] <= -40 && !w13.left[c]) {
				w13.left[c] = curDay() + 1;
				pushLog(`${COMPANION_NAME[c]} has had enough. "I can't stand with you after that." They won't ride with you now.`);
				diary(`${COMPANION_NAME[c]} left us.`);
				if (party && roleComp(party.role) === c) party = null;
			}
		}
		if (bits.length) pushLog(`Loyalty: ${bits.join(", ")}.`);
		if (n13(fx) > 0) train("leadership", 6);
	}
	function n13(fx) {
		return Object.values(LOYALTY_FX[fx] ?? {}).reduce((a, b) => a + b, 0);
	}
	function roleComp(role) {
		return role === "cal" ? "jack" : COMPANIONS.includes(role) ? role : null;
	}
	function helpsMore(role) {
		const c = roleComp(role);
		return !!c && (w13.loyal[c] ?? 0) >= 50;
	}
	function duraOf(id) {
		return w13.dura[id] ?? 100;
	}
	const ARMOR13_IDS = [
		"woolcap",
		"shirt",
		"trousers",
		"gloves",
		"boots"
	];
	function armorPieces() {
		return player ? [
			player.headId,
			player.coatId,
			player.legsId,
			player.handsId,
			player.feetId
		].filter((id) => id && GEAR[id]) : [];
	}
	function setBonus13() {
		if (!player) return null;
		const ids = [
			player.headId,
			player.coatId,
			player.legsId,
			player.handsId,
			player.feetId
		];
		if (ids.some((id) => !id || !GEAR[id])) return null;
		const q = GEAR[ids[0]].quality;
		if (ids.some((id) => GEAR[id].quality !== q)) return null;
		return {
			quality: q,
			...SET_BONUS[q]
		};
	}
	/** Armor value after wear (a piece at 0 durability gives a quarter) plus the set bonus. */
	function def13(base) {
		if (!player) return base;
		let d = 0;
		for (const id of [
			player.coatId,
			player.headId,
			player.legsId,
			player.handsId,
			player.feetId,
			player.backId
		]) {
			const g = GEAR[id];
			if (!g) continue;
			const u = duraOf(id) / 100;
			d += g.def * (u <= 0 ? .25 : .5 + .5 * u) + (w13.patched[id] ? .5 : 0);
		}
		const sb = setBonus13();
		return Math.round(d) + (sb?.def ?? 0) + (base - [
			player.coatId,
			player.headId,
			player.legsId,
			player.handsId,
			player.feetId,
			player.backId
		].reduce((n, id) => n + (GEAR[id]?.def ?? 0), 0));
	}
	function wearArmor(dmg) {
		const ids = armorPieces();
		if (!ids.length) return;
		const id = ids[Math.floor(Math.random() * ids.length)];
		w13.dura[id] = Math.max(0, duraOf(id) - (2 + Math.min(4, Math.floor(dmg / 4))));
		if (w13.dura[id] === 0 && !w13.flagsBroke?.[id]) pushLog(`Your ${GEAR[id].name.toLowerCase()} is worn through. Patch it or repair it at the workbench.`);
		refreshGear(player);
	}
	function repairCost$1(id) {
		const g = GEAR[id];
		const tier = TIER_OF[g?.quality] ?? 1;
		return Math.max(1, tier * 2 + Math.ceil((100 - duraOf(id)) / 25) - (perk13("mechanics", 6) ? 1 : 0));
	}
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
	function v13Daily(day) {
		if (!player || mode11) return;
		if (w13.weather.day !== day) {
			const season = seasonNow();
			const prev = w13.weather.id;
			w13.weather = {
				id: rollWeather(season, Math.random()),
				day
			};
			if (w13.weather.id !== prev) pushLog(`Weather: ${WEATHER[w13.weather.id].text}`);
			if (w13.weather.id === "noreaster") diary("Nor'easter came through.");
		}
		const ph = moonPhase(day);
		if (ph === 4) pushLog("Full moon tonight. Bright enough to read by. The raiders like it too.");
		if (ph === 0) pushLog("New moon. Dark as the inside of a cow. Good night for sneaking.");
		if (day - w13.bountyDay >= 3) {
			w13.bounties = makeBounties(day);
			w13.bountyDay = day;
		}
		const cold = weather13().cold + (seasonNow() === 3 ? 1 : 0);
		if (cold >= 2 && !buffOn("warm") && Math.random() < Math.max(0, .18 * cold / 3 - fx13().sickResist - .05 * lv("survival") - (perk13("survival", 3) ? .2 : 0))) catchAil("cold", "Too many nights in the wet and cold.");
		if (w13.ail.cold && day - w13.ail.cold >= 3 && (buffOn("warm") || Math.random() < .5)) cureAil("cold", "Three days by the stove did it.");
		if (w13.ail.cut) player.hp = Math.max(1, player.hp - AILMENTS.cut.hpDay);
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
					const e = q11Spawn([
						kind,
						null,
						null,
						hp,
						kind === "moose" ? 9 : kind === "deer" ? 3 : kind === "wolf" ? 5 : kind === "coyote" ? 3 : 1,
						Math.round(hp / 2)
					], {
						x: (tx + .5) * 64,
						y: (ty + .5) * 64
					}, "mig", false);
					if (e) {
						e.temper = kind === "wolf" || kind === "coyote" ? "hostile" : "shy";
						e.mig = true;
					}
					break;
				}
			}
		}
	}
	function v13Tick(dt) {
		if (!player || !world || mode11) return;
		const h = hourNow();
		const hr = Math.floor(clock / (DAY_LENGTH_SEC / 24));
		if (w13.lastHour < 0) w13.lastHour = hr;
		if (hr > w13.lastHour) {
			needsTick(Math.min(24, hr - w13.lastHour));
			w13.lastHour = hr;
		}
		if (w13.weather.day !== curDay()) v13Daily(curDay());
		for (const t of townSpots()) if (!w13.seen[t.id] && t.map === mapId && Math.hypot(t.x - player.x, t.y - player.y) < 576) {
			w13.seen[t.id] = true;
			pushLog(`Found: ${t.name}. You can ride here from anywhere now.`);
		}
		if (w13.weather.id === "blackice" && phase === "play" && !inside && intent && !perk13("survival", 6)) {
			w13.slipT += dt;
			if (w13.slipT > 6) {
				w13.slipT = 0;
				if (Math.random() < (mounted ? .12 : .06) * (1 - .05 * lv("survival"))) {
					if (mounted) {
						parkBike(false);
						pushLog("The back wheel goes out from under you on the black ice. You hit the road hard.");
					} else pushLog("Your feet go out from under you on the black ice.");
					player.hp = Math.max(1, player.hp - (mounted ? 8 : 3));
					if (Math.random() < (mounted ? .3 : .12)) catchAil("bone", "You landed wrong.");
					train("survival", 4);
				}
			}
		}
		if (mounted && weather13().bike === 0) {
			parkBike(false);
			pushLog("Can't ride in a nor'easter. You can't see the road.");
		}
		if (weather13().cold >= 2 && !inside && h > 18) w13.survAcc = (w13.survAcc ?? 0) + dt;
		if ((w13.survAcc ?? 0) > 30) {
			w13.survAcc = 0;
			train("survival", 2);
		}
		if (intent?.kind === "walk" && !inside && mapId !== 2 && !(mapId === 0 && inFarm(tileOf(player.x, player.y).tx, tileOf(player.x, player.y).ty))) {
			w13.forageAcc += dt;
			if (w13.forageAcc > 9) {
				w13.forageAcc = 0;
				forage();
			}
		}
		v13RoadTick(dt);
		v13CampTick();
		v13MainTick();
		v13SiegeTick(dt);
	}
	function forage(force = false) {
		if (quiet13() && !force) return false;
		if (w13.forageDay !== curDay()) {
			w13.forageDay = curDay();
			w13.forageN = 0;
		}
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
	function townSpots() {
		const out = [];
		for (const t of TOWNS13) {
			let x = 0, y = 0;
			if (t.id === "farm") {
				if (mapId !== 0) {
					out.push({
						...t,
						x: 0,
						y: 0
					});
					continue;
				}
				const c = farmCenter();
				x = c.x;
				y = c.y;
			} else if (t.id === "jack") {
				const n = mapId === 0 ? world?.npcs.find((m) => m.role === "cal") : null;
				if (!n) {
					out.push({
						...t,
						x: -1e6,
						y: -1e6
					});
					continue;
				}
				x = n.x;
				y = n.y;
			} else if (t.id === "lowell") {
				const n = mapId === 0 ? world?.npcs.find((m) => m.role === "mira") : null;
				if (!n) {
					out.push({
						...t,
						x: -1e6,
						y: -1e6
					});
					continue;
				}
				x = n.x;
				y = n.y;
			} else if (t.id === "skow") {
				if (mapId !== 2) {
					out.push({
						...t,
						x: -1e6,
						y: -1e6
					});
					continue;
				}
				x = player.x;
				y = player.y;
			}
			out.push({
				...t,
				x,
				y
			});
		}
		return out;
	}
	function travelMenu() {
		const opts = TOWNS13.filter((t) => w13.seen[t.id]).map((t) => ({
			label: `${t.name} (${travelGas(here13(), t)} gas)`,
			id: `v13-go-${t.id}`
		}));
		return openD13("Bike", `Where to? You've got ${countOf("gas")} gas. ${weather13().bike === 0 ? "Not in a nor'easter." : weather13().bike < .7 ? "Roads are bad today." : ""}`, [...opts, {
			label: "Stay put",
			id: "close"
		}]);
	}
	function here13() {
		return {
			map: mapId,
			tx: tileOf(player.x, player.y).tx - 22,
			ty: tileOf(player.x, player.y).ty - 20
		};
	}
	function fastTravel(id) {
		if (!legacyTravel()) {
			openWorldMap();
			return;
		}
		const t = TOWNS13.find((x) => x.id === id);
		if (!t || !player) return;
		if (!w13.seen[id]) {
			pushLog("You haven't been there yet.");
			return;
		}
		if (!bikeBuilt()) {
			pushLog("You need the motor bicycle running for that.");
			return;
		}
		if (weather13().bike === 0) {
			pushLog("Not in a nor'easter.");
			return;
		}
		const gas = travelGas(here13(), t);
		if (countOf("gas") < gas) {
			pushLog(`Not enough gas. That's ${gas} cans.`);
			return;
		}
		takeItem("gas", gas);
		train("mechanics", 4);
		const arrive = () => {
			if (id === "farm") {
				const c = farmCenter();
				return {
					x: c.x + 60,
					y: c.y + 90
				};
			}
			const s = townSpots().find((x) => x.id === id);
			return s && s.x > -1e5 ? {
				x: s.x + 60,
				y: s.y + 60
			} : null;
		};
		if (t.map !== mapId) travelTo(t.map, t.map === 0 && id !== "farm" ? null : t.map === 0 ? () => {
			const c = farmCenter();
			return {
				x: c.x + 60,
				y: c.y + 90
			};
		} : null);
		const at = arrive();
		if (at && mapId === t.map) {
			const s = clearOutside(at.x, at.y);
			player.x = s.x;
			player.y = s.y;
			const focus = worldToScreen(player.x, player.y, 0, 0);
			camX = focus.sx - viewW / 2;
			camY = focus.sy - viewH / 2;
		}
		pushLog(`You ride to ${t.name}. ${gas} gas gone.`);
		if (Math.random() < .3 * (weather13().bike < .7 ? 1.5 : 1)) startRoadEvent(pickRoadEvent(Math.random()));
		saveGame();
		sync(true);
	}
	function v13RoadTick(dt) {
		if (quiet13() || inside || raid || dialogue || mapId === 1) return;
		const t = tileOf(player.x, player.y);
		if (!(world.tiles[t.ty * 156 + t.tx] === 2 || world.tiles[t.ty * 156 + t.tx] === 5) || !intent) return;
		if (w13.road.day !== curDay()) {
			w13.road.day = curDay();
			w13.road.n = 0;
		}
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
		if (id === "car") return openD13(ev.title, ev.text, [{
			label: lv("mechanics") >= 2 || perk13("mechanics", 9) ? "Get it running (Mechanics)" : "Siphon what's in the tank",
			id: "v13-road-car"
		}, {
			label: "Leave it",
			id: "close"
		}]);
		if (id === "stranger") return openD13(ev.title, ev.text, [
			{
				label: "Trade him some jerky for news (1 jerky)",
				id: "v13-road-help"
			},
			{
				label: "Take his pack at gunpoint",
				id: "v13-road-rob"
			},
			{
				label: "Walk on by",
				id: "close"
			}
		]);
		if (id === "lostkid") return openD13(ev.title, ev.text, [{
			label: "Walk him home to the Forks",
			id: "v13-road-kid"
		}, {
			label: "Point him the way and go",
			id: "close"
		}]);
		const ring = 220;
		for (let i = 0; i < 3; i++) {
			const a = i * 2.1 + Math.random();
			q11Spawn([
				"bandit",
				null,
				"Road raider",
				16,
				4,
				10
			], clearOutside(player.x + Math.cos(a) * ring, player.y + Math.sin(a) * ring), "ambush", true);
		}
		pushLog(`${ev.title}: ${ev.text}`);
		sync(true);
	}
	function v13Caravan() {
		const r = caravanOnRoad(curDay(), hourNow());
		return r && mapId === 0 ? r : null;
	}
	function caravanKey(r) {
		return `${r.id}:${curDay()}`;
	}
	function caravanMenu() {
		const r = v13Caravan();
		if (!r) return openD13("Road", "No caravan on the road right now. They run on a schedule: Lowelltown to Skowhegan every 2 days (9 to 3), Skowhegan to Bangor every 3 days (10 to 4).", [{
			label: "Close",
			id: "close"
		}]);
		if (w13.caravan[caravanKey(r)]) return openD13("Caravan", "Caravan's already been through today. You missed 'em.", [{
			label: "Close",
			id: "close"
		}]);
		return openD13(`Caravan: ${r.from} to ${r.to}`, "Two sledges and a horse, three men with deer rifles. The driver squints at you.", [
			{
				label: "Ride guard for them",
				id: "v13-car-guard"
			},
			{
				label: "Rob it",
				id: "v13-car-rob"
			},
			{
				label: "Let it pass",
				id: "close"
			}
		]);
	}
	function rebuildCost(r) {
		const cut = (perk13("carpentry", 6) ? .9 : 1) * (1 - .04 * lv("carpentry"));
		return {
			wood: Math.ceil(r.cost.wood * cut),
			stone: Math.ceil(r.cost.stone * cut),
			iron: r.cost.iron,
			need: r.cost.need ?? []
		};
	}
	function rebuildMenu() {
		return openD13("Harmony", "Harmony's store, school and clinic stand empty down the road. Fix them up and folks will come back.", [
			...REBUILD.map((r) => {
				const c = rebuildCost(r);
				return {
					label: w13.rebuilt[r.id] ? `${r.name}: open` : `${r.name}: ${c.wood} wood, ${c.stone} stone, ${c.iron} iron${c.need.map(([i, n]) => `, ${n} ${GEAR[i]?.name.toLowerCase() ?? i}`).join("")} — ${r.effect}`,
					id: `v13-rebuild-${r.id}`
				};
			}),
			...w13.rebuilt.clinic ? [{
				label: "Clinic: get patched up (4 iron)",
				id: "v13-clinic"
			}] : [],
			{
				label: "Close",
				id: "close"
			}
		]);
	}
	function rebuild(id) {
		const r = REBUILD.find((x) => x.id === id);
		if (!r || w13.rebuilt[id]) return;
		const c = rebuildCost(r);
		if (player.wood < c.wood || player.stone < c.stone || player.scrap < c.iron || c.need.some(([i, n]) => countOf(i) < n)) {
			pushLog(`Not enough for the ${r.name.toLowerCase()}.`);
			return;
		}
		player.wood -= c.wood;
		player.stone -= c.stone;
		player.scrap -= c.iron;
		for (const [i, n] of c.need) takeItem(i, n);
		w13.rebuilt[id] = curDay() + 1;
		train("carpentry", 20);
		train("leadership", 10);
		loyalty("rebuild");
		pushLog(`The ${r.name} is open again. ${r.effect}`);
		diary(`Reopened the ${r.name}.`);
		shiftRep("ponds", 3, 8);
		v13WorldProps();
		saveGame();
		sync(true);
	}
	function rebuiltN() {
		return Object.values(w13.rebuilt).filter(Boolean).length;
	}
	function cookMenu() {
		return openD13("Stove", "The farmhouse stove's going. What are you making?", [...RECIPES13.map((r) => ({
			label: `${r.name}: ${r.need.map(([i, n]) => `${n} ${GEAR[i]?.name.toLowerCase() ?? i}`).join(", ")}. ${r.text}`,
			id: `v13-cook-${r.id}`
		})), {
			label: "Close",
			id: "close"
		}]);
	}
	function cook(id) {
		const r = RECIPES13.find((x) => x.id === id);
		if (!r) return false;
		if (r.need.some(([i, n]) => countOf(i) < n)) {
			pushLog(`Not enough for ${r.name.toLowerCase()}.`);
			return false;
		}
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
		if (def.id === "medicine") {
			if (cureAil("cut", "The medicine knocks the infection down.") || cureAil("cold", "The medicine clears your head.")) train("medicine", 6);
			return false;
		}
		if (def.family === "bandage") {
			train("firstaid", 5);
			if (w13.ail.bone && countOf("wood") >= 0 && player.wood >= 1 && perk13("firstaid", 6)) {
				player.wood -= 1;
				cureAil("bone", "You splint it with a stave and a bandage.");
			}
			if (perk13("firstaid", 3) && w13.ail.cut) cureAil("cut", "Clean cut, clean bandage.");
			return false;
		}
		if (!f) return false;
		stack.qty -= 1;
		if (stack.qty <= 0) player.bag = player.bag.filter((s) => s.qty > 0);
		const more = 1 + .05 * lv("cooking");
		const n = w13.needs;
		if (f.hunger) n.hunger = Math.min(100, n.hunger + f.hunger * more);
		if (f.thirst) n.thirst = Math.min(100, n.thirst + f.thirst * more);
		if (def.id === "cider" || def.id === "donut") {
			player.stamina = Math.min(player.maxStamina, player.stamina + 15);
			if (def.heal > 0) player.hp = Math.min(player.maxHp, player.hp + def.heal);
			pushLog(def.id === "cider" ? "Hot cider. Warm all the way down. +15 stamina." : "Still warm from Sarah's kettle. +15 stamina.");
		}
		if (f.sleep) n.sleep = Math.min(100, n.sleep + f.sleep);
		if (perk13("cooking", 9) && RECIPES13.some((r) => r.makes === def.id)) n.thirst = Math.min(100, n.thirst + 10);
		if (def.heal > 0) player.hp = Math.min(player.maxHp, player.hp + def.heal);
		const r = RECIPES13.find((x) => x.makes === def.id);
		if (r?.buff) {
			const hrs = r.hours * (1 + .05 * lv("cooking")) * (r.buff === "warm" && perk13("cooking", 6) ? 1.5 : 1);
			w13.buffs[r.buff] = clock + hrs / 24 * DAY_LENGTH_SEC;
			if (r.buff === "cheer") {
				for (const c of COMPANIONS) if (!w13.left[c]) w13.loyal[c] = Math.min(100, w13.loyal[c] + 3);
			}
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
	let v14 = freshV14();
	let craftOpen = false;
	let buildFlip = false;
	let buildTool = "place";
	const V14_ID = 8e5;
	const ok14 = () => v14.st >= 5;
	const mat14 = (m) => m === "wood" ? player.wood : m === "stone" ? player.stone : m === "iron" ? player.scrap : countOf(m);
	const canPay14 = (cost) => Object.entries(cost).every(([m, n]) => mat14(m) >= n);
	function pay14(cost) {
		for (const [m, n] of Object.entries(cost)) if (m === "wood") player.wood -= n;
		else if (m === "stone") player.stone -= n;
		else if (m === "iron") player.scrap -= n;
		else takeItem(m, n);
	}
	function give14(cost, f = 1) {
		for (const [m, n0] of Object.entries(cost)) {
			const n = Math.floor(n0 * f);
			if (n <= 0) continue;
			if (m === "wood") player.wood += n;
			else if (m === "stone") player.stone += n;
			else if (m === "iron") player.scrap += n;
			else giveItem(m, n);
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
		const seen = /* @__PURE__ */ new Set();
		const q = [];
		for (let y = fy - FARM.r - 2; y <= fy + FARM.r + 2; y++) for (let x = fx - FARM.r - 2; x <= fx + FARM.r + 2; x++) if (world.tiles[y * 156 + x] === 2) {
			q.push([
				x,
				y,
				0
			]);
			seen.add(y * 156 + x);
		}
		while (q.length) {
			const [x, y] = q.shift();
			const d = Math.hypot(x - fx, y - fy);
			if (d <= 38 && d > bestD && x > 4 && y > 4 && x < 151 && y < 151) {
				bestD = d;
				best = {
					tx: x,
					ty: y
				};
			}
			if (d > 38) continue;
			for (const [ax, ay] of [
				[x + 1, y],
				[x - 1, y],
				[x, y + 1],
				[x, y - 1]
			]) {
				const k = ay * 156 + ax;
				if (seen.has(k) || world.tiles[k] !== 2) continue;
				seen.add(k);
				q.push([
					ax,
					ay,
					0
				]);
			}
		}
		return best ?? {
			tx: fx - 24,
			ty: fy + 4
		};
	}
	/** The farm's rough ring: stakes on about 2/3 of the ring, a barricaded gate where the road crosses, a lookout and sandbags. */
	function fortPlan14() {
		const out = [];
		const fc = {
			tx: FARM.tx,
			ty: FARM.ty
		};
		const R = FARM.r - 1.5;
		const ring = /* @__PURE__ */ new Set();
		for (let a = 0; a < 360; a += 3) {
			const tx = Math.round(fc.tx + Math.cos(a * Math.PI / 180) * R), ty = Math.round(fc.ty + Math.sin(a * Math.PI / 180) * R);
			const k = `${tx},${ty}`;
			if (ring.has(k)) continue;
			ring.add(k);
			const road = world.tiles[ty * 156 + tx] === 2;
			const n = (tx * 73856093 ^ ty * 19349663) >>> 0;
			if (road) {
				const at = (r) => world.tiles[Math.round(fc.ty + Math.sin(a * Math.PI / 180) * r) * 156 + Math.round(fc.tx + Math.cos(a * Math.PI / 180) * r)] === 2;
				if (at(R + 2) && at(R - 2)) out.push({
					k: "gate-wood",
					tx,
					ty,
					hp: 30,
					f: Math.abs(Math.cos(a * Math.PI / 180)) > .7
				});
				continue;
			}
			if (n % 3 === 0) continue;
			const flip = Math.abs(Math.cos(a * Math.PI / 180)) > .7;
			out.push(n % 7 === 0 ? {
				k: "wall-x",
				tx,
				ty,
				hp: 0,
				f: flip
			} : {
				k: "wall-wood",
				tx,
				ty,
				hp: n % 5 === 0 ? 24 : 60,
				f: flip
			});
		}
		const g = out.find((o) => o.k === "gate-wood") ?? {
			tx: fc.tx + 10,
			ty: fc.ty
		};
		const ix = Math.sign(fc.tx - g.tx), iy = Math.sign(fc.ty - g.ty);
		out.push({
			k: "lookout",
			tx: g.tx + ix * 2 + (iy ? 2 : 0),
			ty: g.ty + iy * 2 + (ix ? 2 : 0),
			hp: 35
		});
		out.push({
			k: "sandbags",
			tx: g.tx + ix * 2 - (iy ? 1 : 0),
			ty: g.ty + iy * 2 - (ix ? 1 : 0),
			hp: 50
		});
		out.push({
			k: "sandbags-x",
			tx: g.tx + ix * 2 + (iy ? 1 : 0),
			ty: g.ty + iy * 2 + (ix ? 1 : 0),
			hp: 0
		});
		const bc = farmCenter();
		const bt = tileOf(bc.x, bc.y);
		out.push({
			k: "workbench",
			tx: bt.tx + 3,
			ty: bt.ty + 2,
			hp: 99
		});
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
		world.props = world.props.filter((p) => {
			if (p.id < V14_ID) return true;
			vacate(world, p);
			return false;
		});
		if (!v14.camp) v14.camp = campSpot14();
		for (const o of fortPlan14()) {
			const key = `${o.tx},${o.ty}`;
			const saved = v14.fort[key];
			const k = saved ? saved.k : o.k;
			const p = o.k === "workbench" || o.k.startsWith("lookout") || o.k.startsWith("sandbags") ? placeAround14(k, o.tx, o.ty, { f14: key }) : add14(k, o.tx, o.ty, {
				f14: key,
				flip14: !!o.f
			});
			if (p) p.hp = saved ? saved.hp : o.hp;
		}
		for (const pc of v14.placed) {
			const p = add14(pc.k, pc.tx, pc.ty, {
				p14: true,
				flip14: !!pc.f
			});
			if (p) p.hp = pc.hp;
		}
		const c = v14.camp;
		placeAround14("wreck", c.tx, c.ty - 1, { camp14: "wreck" });
		placeAround14(v14.st >= 2 ? "firering" : "firering", c.tx + 1, c.ty + 1, {
			camp14: "fire",
			lit14: v14.st >= 2
		});
		if (v14.st < 1) placeAround14("stash", c.tx - 1, c.ty + 1, { camp14: "stash" });
		if (v14.st < 2 && !v14.woodTaken) placeAround14("logs", c.tx - 2, c.ty + 2, {
			camp14: "wood",
			resource: "wood",
			amount: 3
		});
		if (v14.st >= 2) {
			const m = {
				tx: Math.round((c.tx + FARM.tx) / 2),
				ty: Math.round((c.ty + FARM.ty) / 2)
			};
			placeAround14("sign-farm", m.tx, m.ty, {
				label: "FARM →",
				camp14: "sign"
			});
		}
		for (const e of world.enemies) {
			if (e.dead || e.quest || e.kind !== "bandit" || e.q10 || e.q11) continue;
			const tx = e.homeX / 64, ty = e.homeY / 64;
			const d = Math.hypot(tx - FARM.tx, ty - FARM.ty);
			if (d >= 34) continue;
			const k = 34 / Math.max(1, d);
			const nx = Math.round(FARM.tx + (tx - FARM.tx) * k), ny = Math.round(FARM.ty + (ty - FARM.ty) * k);
			if (nx < 3 || ny < 3 || nx > 152 || ny > 152 || cellBlocked(world, nx, ny)) {
				e.dead = true;
				e.death = 0;
				continue;
			}
			e.x = e.homeX = (nx + .5) * 64;
			e.y = e.homeY = (ny + .5) * 64;
			e.aggro = false;
			e.path = null;
		}
	}
	/** New game: wake at the camp with little more than the clothes you wear. */
	function v14Start() {
		if (v14.st !== 0 || !v14.camp || mapId !== 0) return;
		const c = v14.camp;
		const spot = nearestRespawn(c.tx, c.ty, 1, 1);
		player.x = spot.x;
		player.y = spot.y;
		player.respawnX = spot.x;
		player.respawnY = spot.y;
		const worn = new Set([
			player.weaponId,
			player.coatId,
			player.headId,
			player.legsId,
			player.handsId,
			player.feetId,
			player.backId
		].filter(Boolean));
		player.bag = player.bag.filter((s) => worn.has(s.id)).map((s) => ({
			id: s.id,
			qty: 1
		}));
		if (isGun(GEAR[player.weaponId]?.family)) player.bag.push({
			id: "shells",
			qty: 4
		});
		player.bag.push({
			id: "bandage",
			qty: 1
		});
		player.wood = 0;
		player.stone = 0;
		player.scrap = 0;
		player.gridPos = {};
		refreshGear(player);
	}
	function v14Use(prop) {
		if (prop.kind === "wreck") {
			if (v14.st > 0) return pushLog("The truck's picked clean. Somebody's luck ran out here.");
			v14.st = 1;
			giveItem("matches");
			giveItem("junk", 3);
			giveItem("cloth", 3);
			giveItem("water");
			const st = world.props.find((p) => p.camp14 === "stash");
			if (st) {
				vacate(world, st);
				world.props = world.props.filter((p) => p !== st);
			}
			pushLog("Under the seat: a match tin, a twist of cloth, a jug of water and a fistful of bolts.");
			pushLog("It'll be dark and cold soon. Get 3 wood off the spruce and light the fire ring.");
			sfx("gather");
			saveGame();
			sync(true);
			return;
		}
		if (prop.kind === "stash") return v14Use(world.props.find((p) => p.kind === "wreck") ?? prop);
		if (prop.kind === "firering") {
			if (prop.lit14) return pushLog("The fire's going. Off to the east there's chimney smoke over the trees.");
			if (v14.st < 1) return pushLog("No matches. Check the truck.");
			if (player.wood < 3) return pushLog(`The ring wants 3 wood. You have ${player.wood}. The spruce along the road will do.`);
			player.wood -= 3;
			prop.lit14 = true;
			v14.st = 2;
			prop.burn = 0;
			const c = v14.camp;
			const m = {
				tx: Math.round((c.tx + FARM.tx) / 2),
				ty: Math.round((c.ty + FARM.ty) / 2)
			};
			placeAround14("sign-farm", m.tx, m.ty, {
				label: "FARM →",
				camp14: "sign"
			});
			pushLog("The fire takes. While you warm your hands you see it: a thread of chimney smoke over the trees, and a hand sign nailed to a post down the road.");
			grantXp(10);
			sfx("build");
			saveGame();
			sync(true);
			return;
		}
		if (prop.kind === "sign-farm") return pushLog("Hand-painted: FARM. KEEP TO THE ROAD. Somebody added: WE SHOOT.");
		if (prop.kind === "workbench") {
			if (!ok14()) return pushLog(v14.st >= 3 ? "Justin: \"That's my bench. Earn it first.\"" : "A workbench under a tarp.");
			craftOpen = true;
			phase = "play";
			sync(true);
			return;
		}
		if (isGate14(prop.kind)) return toggleGate14(prop);
		if (prop.kind === "chest") return openStore(prop), void 0;
		if (prodOf(prop.kind)) return prodUse(prop), void 0;
		if (prop.kind === "rainbarrel") {
			const st = barrel141(prop);
			if (st.n <= 0) {
				pushLog(`Rain barrel: empty (0 of ${BARREL_CAP} jugs). It fills in rain, or from a rain collector next to it.`);
				sync(true);
				return;
			}
			if (tryGive("water")) {
				st.n -= 1;
				pushLog(`You fill a jug from the rain barrel. ${st.n} of ${BARREL_CAP} jugs left.`);
			} else pushLog("No room for a jug.");
			sync(true);
			return;
		}
		if (PIECE_HP[prop.kind] || prop.kind === "wall-x" || prop.kind === "sandbags-x" || prop.kind === "lookout-x") return repairOne14(prop);
	}
	function toggleGate14(prop) {
		if (raid && !prop.open) return pushLog("Not with them out there.");
		prop.open = !prop.open;
		if (prop.open) vacate(world, prop);
		else {
			const c = propCenter(prop);
			if (Math.hypot(player.x - c.x, player.y - c.y) < 40) {
				prop.open = true;
				return pushLog("Step clear of the gate first.");
			}
			occupy(world, prop);
		}
		pushLog(prop.open ? "You swing the gate open." : "You drop the bar across the gate.");
		sfx("click");
		sync(true);
	}
	function maxHp14(prop) {
		if (prop.kind === "wall-x") return PIECE_HP[prop.was14 ?? "wall-wood"];
		if (prop.kind === "sandbags-x") return PIECE_HP.sandbags;
		if (prop.kind === "lookout-x") return PIECE_HP.lookout;
		return PIECE_HP[prop.kind] ?? DEF_HP[prop.kind] ?? 30;
	}
	function fixKind14(prop) {
		return prop.kind === "wall-x" ? prop.was14 ?? "wall-wood" : prop.kind === "sandbags-x" ? "sandbags" : prop.kind === "lookout-x" ? "lookout" : prop.kind;
	}
	function repairCost14(prop) {
		return repairCost(fixKind14(prop) === "lookout" ? "wall-wood" : fixKind14(prop), prop.hp ?? 0, maxHp14(prop));
	}
	function repairOne14(prop, quiet = false) {
		const max = maxHp14(prop);
		if ((prop.hp ?? max) >= max && !prop.kind.endsWith("-x")) {
			if (!quiet) pushLog("That piece is sound.");
			return false;
		}
		const cost = repairCost14(prop);
		if (!canPay14(cost)) {
			if (!quiet) pushLog(`Fixing it wants ${costText(cost)}.`);
			return false;
		}
		pay14(cost);
		const k = fixKind14(prop);
		if (k !== prop.kind) {
			vacate(world, prop);
			prop.kind = k;
			occupy(world, prop);
		}
		prop.hp = max;
		note14(prop);
		if (!quiet) {
			pushLog(`Patched: ${costText(cost)}.`);
			sfx("build");
			burst(propCenter(prop).x, propCenter(prop).y, "#d4a24a", 8);
			saveGame();
			sync(true);
		}
		return true;
	}
	function note14(prop) {
		if (prop.f14) v14.fort[prop.f14] = {
			k: prop.kind,
			hp: Math.round(prop.hp ?? 0)
		};
	}
	function damaged14() {
		return world.props.filter((p) => (p.f14 || p.p14) && p.kind !== "workbench" && ((p.hp ?? 0) < maxHp14(p) || p.kind.endsWith("-x")));
	}
	function repairAll14() {
		let n = 0;
		for (const p of damaged14()) if (repairOne14(p, true)) n++;
		pushLog(n ? `You patch ${n} piece${n > 1 ? "s" : ""} of the walls.` : "Not enough stock to patch anything.");
		if (n) sfx("build");
		saveGame();
		sync(true);
	}
	function report14(night) {
		const list = damaged14();
		const cost = {};
		for (const p of list) for (const [m, n] of Object.entries(repairCost14(p))) cost[m] = (cost[m] ?? 0) + n;
		v14.report = {
			night,
			items: list.map((p) => ({
				name: PIECES.find((x) => x.kind === fixKind14(p))?.name ?? (fixKind14(p) === "lookout" ? "Lookout" : fixKind14(p)),
				hp: Math.round(p.hp ?? 0),
				max: maxHp14(p)
			})),
			cost
		};
		const lines = v14.report.items.slice(0, 6).map((i) => `${i.name} ${i.hp}/${i.max}`).join(" · ");
		if (legacyTravel()) {
			pushLog(list.length ? `Repairs: ${list.length} pieces hurt. Fixing all of it: ${costText(cost)}. (Build → Fix all)` : "Every wall came through whole.");
			return;
		}
		openD13("Repairs", list.length ? `Walls after ${night ? `raid night ${night}` : "the fight"}: ${list.length} piece${list.length > 1 ? "s" : ""} hurt. ${lines}${list.length > 6 ? " …" : ""}. Fixing all of it: ${costText(cost)}.` : "Every wall and gate came through whole.", list.length ? [{
			label: `Repair all (${costText(cost)})`,
			id: "v14-repair-all"
		}, {
			label: "Later",
			id: "close"
		}] : [{
			label: "Good",
			id: "close"
		}]);
	}
	/** Raiders who can't path in go for the nearest wall or gate. */
	function siegeGoal14(enemy) {
		let best = null, bd = 1e9;
		for (const p of world.props) {
			if (!(isWall14(p.kind) || p.kind === "sandbags" || String(p.kind).startsWith("fence") && p.kind !== "fence-x")) continue;
			const c = propCenter(p);
			const d = Math.hypot(c.x - enemy.x, c.y - enemy.y);
			if (d < bd) {
				bd = d;
				best = p;
			}
		}
		if (!best) return null;
		const t = {
			tx: best.tx,
			ty: best.ty
		};
		let spot = null, sd = 1e9;
		for (const [dx, dy] of [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1],
			[1, 1],
			[-1, -1],
			[1, -1],
			[-1, 1]
		]) {
			if (cellBlocked(world, t.tx + dx, t.ty + dy)) continue;
			const x = (t.tx + dx + .5) * 64, y = (t.ty + dy + .5) * 64;
			const d = Math.hypot(x - enemy.x, y - enemy.y);
			if (d < sd) {
				sd = d;
				spot = {
					x,
					y
				};
			}
		}
		return spot;
	}
	function spikesTick14(dt, raiders) {
		for (const p of world.props) {
			if (p.kind !== "spikes") continue;
			const c = propCenter(p);
			for (const e of raiders) {
				if (Math.hypot(e.x - c.x, e.y - c.y) > 34) continue;
				e.hp -= 7 * dt;
				e.hurt = .1;
				e.slow = .4;
				p.hp = (p.hp ?? PIECE_HP.spikes) - 3 * dt;
				if (e.hp <= 0) markDead(e, e.xp);
			}
			if ((p.hp ?? 1) <= 0) {
				pushLog("A spike trap is ground flat.");
				v14.placed = v14.placed.filter((q) => !(q.tx === p.tx && q.ty === p.ty));
				world.props = world.props.filter((q) => q !== p);
				break;
			}
		}
	}
	function startDefend14() {
		if (!world || !player || raid) return;
		v14.st = 4;
		for (const e of world.enemies) if (!e.dead && isRaider(e)) {
			e.dead = true;
			e.death = 0;
		}
		for (const p of world.props) if (isGate14(p.kind) && p.open) {
			p.open = false;
			occupy(world, p);
		}
		const fh = raidHouse();
		const c = v14.camp ?? {
			tx: FARM.tx - 20,
			ty: FARM.ty
		};
		const ang = fh ? Math.atan2((c.ty + .5) * 64 - fh.y, (c.tx + .5) * 64 - fh.x) : 0;
		raid = {
			night: 1,
			wave: Math.max(0, v14.defendWave),
			waves: 3,
			phase: "lull",
			t: 10,
			left: 0,
			spawnT: 0,
			ang,
			house: 140,
			houseMax: 140,
			warned: false,
			kills: 0,
			defend: true
		};
		world.props.filter((p) => p.f14 || p.p14).map((p) => ({
			p,
			k: p.kind,
			hp: p.hp
		}));
		raidHudPct = 20;
		pushLog("Justin: \"Lanterns on the road. They've been back every night this week. Take the gate. Sarah's on the lookout.\"");
		saveGame();
		sync(true);
	}
	function defendLost14(why) {
		v14.tries += 1;
		for (const e of world.enemies) if (!e.dead && e.raid) {
			e.dead = true;
			e.death = 0;
		}
		const hurt14 = world.props.filter((p) => (p.f14 || p.p14) && p.hp < maxHp14(p)).length;
		guardPost.clear();
		raid.wave = Math.max(0, raid.wave - 1);
		raid.phase = "lull";
		raid.t = 9;
		raid.left = 0;
		raid.house = raid.houseMax;
		raid.warned = false;
		v14.defendWave = raid.wave;
		player.hp = player.maxHp;
		player.invuln = 2;
		const spot = raidHouse();
		if (spot) {
			const r = nearestRespawn(tileOf(spot.x, spot.y).tx, tileOf(spot.x, spot.y).ty + 2, 1, 1);
			player.x = r.x;
			player.y = r.y;
		}
		openD13("Defend the farm", `${why} Justin hauls you up by the coat. "Again. They'll come the same way, they always do." The wave starts over.${hurt14 ? ` The walls keep their damage: ${hurt14} piece${hurt14 === 1 ? "" : "s"} want repair (Build → Repair).` : ""}`, [{
			label: "Back to the gate",
			id: "close"
		}]);
	}
	function defendWon14() {
		v14.st = 5;
		v14.defendWave = 0;
		guardPost.clear();
		for (const e of world.enemies) if (!e.dead && e.raid) {
			e.dead = true;
			e.death = 0;
		}
		raid = null;
		achieve("raid1");
		raidsHeld += 1;
		player.scrap += 8;
		grantXp(40);
		pushLog("The last of them breaks for the road. The farm is secured. +8 iron, +40 XP.");
		pushLog("Justin: \"You can use my bench. Build what you like inside the ring.\" The workbench and Build are open.");
		sfx("level");
		report14(0);
		saveGame();
	}
	function v14Tick() {
		if (!world || !player || mapId !== 0 || mode11 || inside) return;
		if (v14.st === 2) {
			const t = tileOf(player.x, player.y);
			if (inFarm(t.tx, t.ty)) {
				v14.st = 3;
				pushLog("A man with a carbine steps out from the stakes. \"That's far enough.\"");
				const j = world.npcs.find((n) => n.role === "justin");
				if (j) openTalk(j);
				saveGame();
				sync(true);
			}
		}
	}
	function v14Talk(role, npc) {
		if (String(role).startsWith("lr-")) return lrTalk(npc);
		if (role !== "justin" || ok14()) return null;
		if (v14.st === 4) return {
			speaker: "Justin",
			text: "Get on the gate! Shoot what comes over the stakes.",
			choices: [{
				label: "Going",
				id: "close"
			}]
		};
		if (v14.st >= 3 && snow <= 0) return {
			speaker: "Justin",
			text: "Justin. My wife Sarah, my kids in the house. We lost hens and a gas can to the road last week, so you'll forgive the rifle. You saw the stakes. Half of them are down. First snow tonight and the stove's down to kindling. Bring three armloads of wood off the pile by the barn and we'll talk about you staying.",
			choices: [{
				label: "I'll bring the wood",
				id: "snow-accept"
			}, {
				label: "I'll go",
				id: "close"
			}]
		};
		return null;
	}
	function hud14() {
		if (!player) return null;
		const t = mapId === 0 ? v14.st < 3 ? STAGE_TEXT[v14.st] : v14.st === 4 ? STAGE_TEXT[4] : "" : "";
		let craft = null;
		if (craftOpen) {
			const tier = v14.bench;
			craft = {
				tier,
				up: BENCH_UP[tier] ? Object.entries(BENCH_UP[tier]).map(([m, n]) => ({
					m: MAT_NAME[m],
					n,
					have: mat14(m)
				})) : null,
				canUp: !!BENCH_UP[tier] && canPay14(BENCH_UP[tier]),
				mats: Object.keys(MAT_NAME).map((m) => ({
					m: MAT_NAME[m],
					have: mat14(m)
				})),
				list: CRAFT14.map((r) => ({
					id: r.id,
					name: GEAR[r.makes]?.name ?? r.makes,
					qty: r.qty,
					tier: r.tier,
					group: r.group,
					locked: r.tier > tier,
					can: r.tier <= tier && canPay14(r.cost),
					need: Object.entries(r.cost).map(([m, n]) => ({
						m: MAT_NAME[m],
						n,
						have: mat14(m)
					})),
					def: GEAR[r.makes]?.def ?? 0,
					atk: GEAR[r.makes]?.atk ?? 0
				}))
			};
		}
		return {
			st: v14.st,
			text: t,
			secured: ok14(),
			craft,
			flip: buildFlip,
			tool: buildTool,
			damaged: world && mapId === 0 ? damaged14().length : 0
		};
	}
	function craft14(id) {
		const r = CRAFT14.find((x) => x.id === id);
		if (!r || !player) return;
		if (r.tier > v14.bench) {
			pushLog(`That wants a tier ${r.tier} bench.`);
			sync(true);
			return;
		}
		if (!canPay14(r.cost)) {
			pushLog(`Short: needs ${costText(r.cost)}.`);
			sfx("click");
			sync(true);
			return;
		}
		pay14(r.cost);
		giveItem(r.makes, r.qty);
		train("mechanics", 3);
		pushLog(`You make ${r.qty > 1 ? `${r.qty} × ` : ""}${GEAR[r.makes].name}.`);
		sfx("build");
		saveGame();
		sync(true);
	}
	function benchUp14() {
		const cost = BENCH_UP[v14.bench];
		if (!cost) return;
		if (!canPay14(cost)) {
			pushLog(`The next bench wants ${costText(cost)}.`);
			sync(true);
			return;
		}
		pay14(cost);
		v14.bench += 1;
		pushLog(v14.bench === 2 ? "You bolt a vise and a grinder to the bench. Tier 2." : "A forge pot and a drill press. Tier 3.");
		sfx("level");
		saveGame();
		sync(true);
	}
	/** Build tool on a tile: pick up or repair a piece you placed. Returns true when it used the tap. */
	function buildTap14(tile) {
		if (buildTool === "place") return false;
		const p = world.props.find((q) => q.tx === tile.tx && q.ty === tile.ty && (q.p14 || q.f14) && q.kind !== "workbench");
		if (!p) {
			pushLog("Nothing of yours there.");
			return true;
		}
		if (buildTool === "repair") {
			repairOne14(p);
			return true;
		}
		if (!p.p14) {
			pushLog("That's part of Justin's ring. Repair it instead.");
			return true;
		}
		const piece = PIECES.find((x) => x.kind === p.kind);
		if (piece) give14(piece.cost, .5);
		vacate(world, p);
		world.props = world.props.filter((q) => q !== p);
		v14.placed = v14.placed.filter((q) => !(q.tx === p.tx && q.ty === p.ty));
		pushLog(`Picked up. Half the stock back.`);
		sfx("gather");
		saveGame();
		sync(true);
		return true;
	}
	function paintHp14(pt, H, f) {
		const w = 34 * zoom, y = pt.sy - H * .9;
		ctx.fillStyle = "rgba(20,16,12,.75)";
		ctx.fillRect(pt.sx - w / 2, y, w, 5 * zoom);
		ctx.fillStyle = f > .5 ? "#8fbf6a" : f > .2 ? "#e0b050" : "#d0644a";
		ctx.fillRect(pt.sx - w / 2, y, w * Math.max(0, f), 5 * zoom);
	}
	function v14Choice(id) {
		if (v141Choice(id)) return true;
		if (lrChoice(id)) return true;
		if (id === "v14-repair-all") {
			dialogue = null;
			phase = "play";
			repairAll14();
			return true;
		}
		return false;
	}
	let l1 = freshV141();
	let stickX = 0, stickY = 0, coastT = 0, coastX = 0, coastY = 0, noiseHear = 0, prodAcc = 0, storeKey = "";
	/** A sound at (x, y): the Hollowed in reach turn toward it; raiders nearby wake. */
	function emitNoise(n, x = player?.x, y = player?.y) {
		if (!world || !player) return;
		l1.noise = Math.max(l1.noise, n);
		const reach = noiseReach(n);
		for (const e of world.enemies) {
			if (e.dead) continue;
			const d = Math.hypot(e.x - x, e.y - y);
			if (d > reach) continue;
			if (e.hollow) {
				e.heard = {
					x,
					y,
					t: clock
				};
				e.path = null;
				e.pathT = 0;
			} else if (n >= 90 && e.temper === "hostile" && !e.aggro && d < reach * .5) {
				e.aggro = true;
				alertPack(e);
			}
		}
	}
	/** v14.1 playtest: wolves keep clear of the start and farm for the first five minutes of a game. */
	const coarse141 = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches, EARLY_WOLF_SEC = 300;
	function earlyWolves(dt) {
		l1.playT = (Number(l1.playT) || 0) + dt;
		if (l1.playT > EARLY_WOLF_SEC || mapId !== 0 || !world?.enemies || !player) return;
		for (const e of world.enemies) {
			if (e.dead || e.kind !== "wolf" && e.kind !== "coyote") continue;
			const dx = e.x - player.x, dy = e.y - player.y, d = Math.hypot(dx, dy);
			if (d > 1792) continue;
			const a = d > 1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
			for (let k = 0; k < 12; k++) {
				const r = (32 + k) * 64, ang = a + (k % 2 ? 1 : -1) * k * .25;
				const x = player.x + Math.cos(ang) * r, y = player.y + Math.sin(ang) * r;
				if (x < 256 || y < 256 || x > 9600 || y > 9600 || pointBlocked(world, x, y, RADIUS)) continue;
				e.x = x;
				e.y = y;
				e.homeX = x;
				e.homeY = y;
				e.aggro = false;
				e.path = [];
				break;
			}
		}
	}
	function noiseTick(dt, moving) {
		earlyWolves(dt);
		const target = l1.crouch ? moving ? NOISE.crouch : NOISE.still : mounted ? NOISE.bike : work && work.swing > 0 ? NOISE.chop : moving ? NOISE.walk : NOISE.still;
		if (l1.noise > target) l1.noise = Math.max(target, l1.noise - 45 * dt);
		else l1.noise = Math.min(target, l1.noise + 90 * dt);
		noiseHear += dt;
		if (noiseHear > .5) {
			noiseHear = 0;
			if (l1.noise > 5) emitNoise(l1.noise);
		}
	}
	function setCrouch(on) {
		if (mounted && on) {
			pushLog("Not on the bike.");
			return;
		}
		l1.crouch = on;
		pushLog(on ? "You get down low. Slower, and a lot quieter." : "You stand up.");
		sync(true);
	}
	function spawnHollowed(n, at, spread = 70) {
		const out = [];
		for (let i = 0; i < n; i++) {
			const a = i / n * Math.PI * 2, r = spread * (.4 + Math.random() * .6);
			let x = at.x + Math.cos(a) * r, y = at.y + Math.sin(a) * r;
			if (pointBlocked(world, x, y, RADIUS)) {
				x = at.x;
				y = at.y;
			}
			spawnRaider("gray", {
				x,
				y
			});
			const e = world.enemies[world.enemies.length - 1];
			Object.assign(e, {
				hollow: true,
				raid: false,
				aggro: false,
				name: HOLLOWED,
				hp: 18,
				maxHp: 18,
				atk: 5,
				xp: 6,
				elite: false,
				variant: "",
				wander: Math.random() * 6
			});
			out.push(e);
		}
		return out;
	}
	function stepHollow(e, dt, dist) {
		const sight = 125 * (l1.crouch ? CROUCH_SIGHT : 1) * (nightShade(clock) > .22 ? .8 : 1);
		if (!e.aggro && dist < sight) {
			e.aggro = true;
			e.heard = null;
			for (const o of world.enemies) if (o.hollow && !o.dead && !o.aggro && Math.hypot(o.x - e.x, o.y - e.y) < 160) o.aggro = true;
		}
		if (e.aggro && dist > 520) e.aggro = false;
		let moving = false;
		if (e.aggro && dist <= 48 && e.cooldown <= 0) {
			e.cooldown = 1.25;
			e.dir = facing8(player.x - e.x, player.y - e.y);
			hurtPlayer(e.crippleArm > 0 ? 3 : e.atk, e.x, e.y);
		} else {
			let gx = null, gy = null, sp = 62;
			if (e.aggro) {
				gx = player.x;
				gy = player.y;
				sp = 74;
			} else if (e.heard && clock - e.heard.t < 40) {
				gx = e.heard.x;
				gy = e.heard.y;
				if (Math.hypot(gx - e.x, gy - e.y) < 30) e.heard = null;
			} else {
				e.wander -= dt;
				if (e.wander <= 0) {
					e.wander = 4 + Math.random() * 5;
					const a = Math.random() * Math.PI * 2;
					e.goal = {
						x: e.homeX + Math.cos(a) * 90,
						y: e.homeY + Math.sin(a) * 90
					};
				}
				if (e.goal) {
					gx = e.goal.x;
					gy = e.goal.y;
					sp = 30;
				}
			}
			if (e.crippleLeg > 0) sp *= .5;
			if (gx != null) {
				if (e.pathT <= 0 || !e.path) {
					e.path = pathTo(world, e.x, e.y, gx, gy);
					e.pathT = .7;
				}
				if (e.path?.length) {
					e.path = follow(e, e.path, sp, dt, true);
					moving = true;
				}
			}
		}
		if (moving) e.anim += dt * (4.2 + Math.sin(clock * 2.3 + e.id) * 1.6);
		e.frame = moving ? Math.floor(e.anim) % 4 : 0;
	}
	function hollowedArea(mid) {
		if (!world || !player || world.enemies.some((e) => e.hollow)) return;
		const groups = mid === 9 ? 0 : mid >= 3 ? 2 : 0;
		for (let g = 0; g < groups; g++) for (let k = 0; k < 30; k++) {
			const a = Math.random() * Math.PI * 2, r = 900 + Math.random() * 1500;
			const at = {
				x: player.x + Math.cos(a) * r,
				y: player.y + Math.sin(a) * r
			};
			const t = tileOf(at.x, at.y);
			if (t.tx < 4 || t.ty < 4 || t.tx > 150 || t.ty > 150 || pointBlocked(world, at.x, at.y, RADIUS)) continue;
			spawnHollowed(4 + Math.floor(Math.random() * 3), at);
			break;
		}
	}
	function lootHud() {
		const today = curDay();
		return LOOT_RUNS.map((l) => {
			const left = restockLeft(l, l1.loot[l.id], today);
			return {
				id: l.id,
				name: l.name,
				q: l.q,
				r: l.r,
				ready: left === 0,
				days: left
			};
		});
	}
	function freeSpot(x, y) {
		for (let r = 0; r < 8; r++) for (let k = 0; k < 12; k++) {
			const a = k / 12 * Math.PI * 2, px = x + Math.cos(a) * r * 40, py = y + Math.sin(a) * r * 40;
			if (!pointBlocked(world, px, py, RADIUS)) return {
				x: px,
				y: py
			};
		}
		return {
			x,
			y
		};
	}
	const LOOT_ROOMS = {
		gas: [
			"Pump island",
			"Store shelves",
			"Back office"
		],
		camp: [
			"Woodshed",
			"Camp kitchen",
			"Gun cabinet"
		],
		truck: [
			"Truck cab",
			"Cargo bay",
			"Chained crate"
		]
	};
	function lootEnter(run) {
		const m = wmState();
		m.warn = "";
		regions.delete(9);
		m.enc = "loot:" + run.id;
		wmArrive(9, m.from);
		const today = curDay();
		const fresh = restockLeft(run, l1.loot[run.id], today) === 0;
		l1.loot[run.id] = fresh ? today : l1.loot[run.id];
		const cx = 4992, cy = 4992;
		const dx = cx - player.x, dy = cy - player.y, dm = Math.hypot(dx, dy) || 1;
		const rooms = LOOT_ROOMS[run.id];
		piles = piles.filter((q) => !q.title.startsWith(run.name + ":"));
		for (let i = 0; i < 3; i++) {
			const dist = 260 + i * 380;
			const s = freeSpot(player.x + dx / dm * dist, player.y + dy / dm * dist);
			const lockedOffice = run.id === "gas" && i === 2 && !l1.sqf.office;
			const items = fresh || lockedOffice ? run.tiers[i].map(([id, qty]) => ({
				id,
				qty
			})) : i === 0 ? [{
				id: "junk",
				qty: 1
			}] : [];
			if (items.length) leavePile(s.x, s.y, `${run.name}: ${rooms[i]}`, items, 0, "", 0);
			if (i === 0 && run.id === "truck") placeAround14("wreck", tileOf(s.x, s.y).tx + 1, tileOf(s.x, s.y).ty - 1, { loot141: true });
			if (i === 2 && fresh) {
				const g = {
					x: s.x + 90,
					y: s.y + 40
				};
				if (run.id === "gas") spawnHollowed(4, g);
				else if (run.id === "camp") for (let k = 0; k < 3; k++) q10Spawn("wolf", "", "Timber wolf", {
					x: g.x + k * 40,
					y: g.y - k * 30
				}, [
					22,
					5,
					10
				], "enc", true);
				else for (let k = 0; k < 2; k++) {
					spawnRaider("scout", {
						x: g.x + k * 50,
						y: g.y
					});
					world.enemies[world.enemies.length - 1].raid = false;
					world.enemies[world.enemies.length - 1].aggro = false;
				}
			}
		}
		{
			const my = piles.filter((q) => q.title.startsWith(run.name + ":"));
			if (my.length) lrSetup(run, my[0], my[my.length - 1]);
			else lrSetup(run, player, {
				x: player.x + dx / dm * 1e3,
				y: player.y + dy / dm * 1e3
			});
		}
		pushLog(fresh ? `${run.name}. ${run.blurb} The good stuff is deeper in.` : `${run.name}. Picked over. It'll be worth a look again in ${restockLeft(run, l1.loot[run.id], today)} day${restockLeft(run, l1.loot[run.id], today) === 1 ? "" : "s"}.`);
		pushLog("Walk to the tinted edge to get back on the world map.");
		saveGame();
		sync(true);
	}
	let lrNpcId = 99e4;
	function lrNpc(role, name, at) {
		const s = freeSpot(at.x, at.y);
		world.npcs = world.npcs.filter((n) => n.role !== role);
		world.npcs.push({
			id: lrNpcId++,
			role,
			name,
			x: s.x,
			y: s.y,
			homeX: s.x,
			homeY: s.y,
			dir: 0,
			frame: 0,
			anim: 0,
			path: null,
			pause: 99,
			hp: 30,
			maxHp: 30,
			lr141: true
		});
	}
	function lrSetup(run, s0, s2) {
		const lore = LOOT_LORE[run.id];
		const sq = l1.sq[run.id] ?? 0;
		pushLog(lore.desc);
		piles.filter((q) => q.title.startsWith(run.name + ":")).forEach((q) => {
			const i = LOOT_ROOMS[run.id].indexOf(q.title.slice(run.name.length + 2));
			if (i >= 0) q.note = ({ gas: [
				2,
				0,
				1
			] }[run.id] ?? [
				0,
				1,
				2
			])[i];
			q.room = i;
		});
		const side = (k, dist) => ({
			x: s0.x + (s2.x - s0.x) * dist + (s2.y - s0.y) * .45,
			y: s0.y + (s2.y - s0.y) * dist - (s2.x - s0.x) * .45
		});
		if (run.id === "gas") {
			lrNpc("lr-tammy", "Tammy Bouchard", {
				x: s0.x - 90,
				y: s0.y + 60
			});
			if (sq === 1) {
				const k = side(0, 1.1);
				leavePile(k.x, k.y, "Dale's place: kitchen hook", [{
					id: "dalekey",
					qty: 1
				}], 0, "", 0);
				spawnHollowed(4, {
					x: k.x + 60,
					y: k.y + 40
				}, 60);
			}
		} else if (run.id === "camp") {
			if (sq < 3) lrNpc("lr-bob", "Bob Carrier", {
				x: s0.x - 80,
				y: s0.y + 50
			});
			if (sq === 1) for (let i = 0; i < 4; i++) {
				const k = side(i, .3 + i * .28);
				leavePile(k.x, k.y, `Roy's trapline: flagging tape, site ${i + 1}`, i === 3 ? [{
					id: "roycap",
					qty: 1
				}, {
					id: "steeltrap",
					qty: 1
				}] : [{
					id: "snare",
					qty: 1
				}], 0, "", 0);
				if (i === 2) {
					lrNpc("lr-gerry", "Gerry", {
						x: k.x + 30,
						y: k.y - 30
					});
					for (let w = 0; w < 4; w++) q10Spawn("wolf", "", "Timber wolf", {
						x: k.x + 120 + w * 30,
						y: k.y + 40 - w * 25
					}, [
						22,
						5,
						10
					], "enc", true);
				}
				if (i === 3) spawnHollowed(3, {
					x: k.x + 70,
					y: k.y + 30
				}, 50);
			}
		} else if (run.id === "truck") {
			lrNpc("lr-wendell", "Wendell Ouellette", side(0, .2));
			if (sq === 2) for (let i = 0; i < 3; i++) {
				const k = side(i, .45 + i * .3);
				leavePile(k.x, k.y, `Trail from the truck ${i + 1}`, [{
					id: "cloth",
					qty: 1
				}], 0, "", 0);
			}
		}
	}
	/** A note is read the first time you open its room; then the loot shows. */
	function lrNote(pile) {
		if (pile.note == null || pile.noteRead) return false;
		const run = LOOT_RUNS.find((r) => pile.title.startsWith(r.name + ":"));
		if (!run) return false;
		if (run.id === "gas" && pile.room === 2 && !l1.sqf.office) {
			if (!player.bag.some((s) => s.id === "dalekey")) {
				openD13("Back office", "Steel door, steel frame, a deadbolt. Dale took the key home to Bingham. You aren't getting through this without it.", [{
					label: "Leave it",
					id: "close"
				}]);
				return true;
			}
			l1.sqf.office = true;
			takeItem("dalekey", 1);
		}
		pile.noteRead = true;
		const n = LOOT_LORE[run.id].notes[pile.note];
		openD13(n.title, n.text, [{
			label: "Search the room",
			id: `v141-search-${pile.id}`
		}]);
		return true;
	}
	function lrTalk(npc) {
		const r = npc.role, sq = (k) => l1.sq[k] ?? 0;
		if (r === "lr-tammy") {
			const st = sq("gas");
			if (st === 0) return {
				speaker: "Tammy Bouchard",
				text: "\"That hand pump in the back office'll pull the last of the underground tank. Key's on Dale's ring, and Dale's at his place up the Bingham road. What's left of him, anyhow. Bring me the key and I'll split the fuel with you, fair.\"",
				choices: [{
					label: "I'll get Dale's key",
					id: "v141-q-gas-1"
				}, {
					label: "Not now",
					id: "close"
				}]
			};
			if (st === 1 && !l1.sqf.pumped) return {
				speaker: "Tammy Bouchard",
				text: l1.sqf.office ? "\"Office is open? Then run the pump. It's loud, mind. Loud brings company.\"" : `"Dale's place is off the back lot, up the road. There's ${HOLLOWED} around it. Keep low and quiet, or don't, your funeral."`,
				choices: [...l1.sqf.office ? [{
					label: "Run the hand pump (loud)",
					id: "v141-q-gas-pump"
				}] : [], {
					label: "Going",
					id: "close"
				}]
			};
			if (st === 1 && l1.sqf.pumped) return {
				speaker: "Tammy Bouchard",
				text: "\"Four cans. Two's mine, that was the deal.\"",
				choices: [{
					label: "Split it fair (2 fuel each)",
					id: "v141-q-gas-share"
				}, {
					label: "Keep all four",
					id: "v141-q-gas-keep"
				}]
			};
			if (l1.sqf.tammyCold) return {
				speaker: "Tammy Bouchard",
				text: "She looks right through you and rolls another tea-leaf smoke.",
				choices: [{
					label: "Go",
					id: "close"
				}]
			};
			return {
				speaker: "Tammy Bouchard",
				text: "\"Back again. I've got matches and a little oil if you've iron.\"",
				choices: [
					{
						label: "Matches: 2 iron",
						id: "v141-buy-matches"
					},
					{
						label: "Oil: 3 iron",
						id: "v141-buy-oil"
					},
					{
						label: "Bye, Tammy",
						id: "close"
					}
				]
			};
		}
		if (r === "lr-bob") {
			const st = sq("camp");
			if (st === 0) return {
				speaker: "Bob Carrier",
				text: "\"Roy went out on the line eleven days ago. Gerry went after him. I'm too stove-up in the knees to walk it. Find 'em, or find what happened. I'd rather know.\"",
				choices: [{
					label: "I'll walk the line",
					id: "v141-q-camp-1"
				}, {
					label: "Not now",
					id: "close"
				}]
			};
			if (st === 1 && !player.bag.some((s) => s.id === "roycap")) return {
				speaker: "Bob Carrier",
				text: "\"Orange flagging tape on the trees. Four sites. Gerry'd have stuck to it.\"",
				choices: [{
					label: "Going",
					id: "close"
				}]
			};
			if (st === 1) return {
				speaker: "Bob Carrier",
				text: `You hand him the cap. He turns it over a long time. "${l1.sqf.gerry ? "Gerry's back, anyhow. " : ""}Well. Now I know." He nods at the bottom bunk. "Take the lever gun. Or my glasses, if you'd rather."`,
				choices: [{
					label: "Bob's lever gun",
					id: "v141-q-camp-gun"
				}, {
					label: "The binoculars",
					id: "v141-q-camp-bino"
				}]
			};
			return {
				speaker: "Bob Carrier",
				text: "\"Stove's going. Sleep here if you need to.\"",
				choices: [{
					label: "Thanks, Bob",
					id: "close"
				}]
			};
		}
		if (r === "lr-gerry") {
			if (l1.sqf.gerry) return {
				speaker: "Gerry",
				text: "\"I'm going. I'm going.\"",
				choices: [{
					label: "Close",
					id: "close"
				}]
			};
			if (world.enemies.some((e) => !e.dead && e.kind === "wolf" && Math.hypot(e.x - npc.x, e.y - npc.y) < 500)) return {
				speaker: "Gerry",
				text: "From the top of a ladder stand: \"Wolves! Don't just stand there gawking, clear 'em off!\"",
				choices: [{
					label: "Close",
					id: "close"
				}]
			};
			return {
				speaker: "Gerry",
				text: "\"Lord. Thank you. Roy's tracks went on toward the drift past the last flag. I couldn't. Tell Bob I'm coming. And... tell him I've got his fourteen dollars. Sort of.\" He hands you a maple tin.",
				choices: [{
					label: "Head back to camp",
					id: "v141-q-gerry"
				}]
			};
		}
		if (r === "lr-wendell") {
			const st = sq("truck");
			if (st === 0) return {
				speaker: "Wendell Ouellette",
				text: "\"I was hauling people. Didn't know it till Skowhegan. They were Forks people, the Collector's taking 'em south. I let 'em out the floor, sort of. I think some made it to the spruce. Somebody's gotta find 'em before the cold or his boys do.\" His ankle's bent wrong.",
				choices: [{
					label: "Splint the ankle (bandage + 1 wood)",
					id: "v141-q-truck-splint"
				}, {
					label: "Not now",
					id: "close"
				}]
			};
			if (st === 1 || st === 2) {
				const found = l1.sq.truckFound ?? 0;
				return {
					speaker: "Wendell Ouellette",
					text: found >= 2 ? "\"Two of 'em? Two's... two's good. Send 'em to Harmony, there's a clinic there.\"" : `"Three trails off the truck. Boot prints, a mitten, blood. ${found} found so far."`,
					choices: [...found >= 2 ? [{
						label: "They're headed for Harmony",
						id: "v141-q-truck-done"
					}] : [], {
						label: "Going",
						id: "close"
					}]
				};
			}
			return {
				speaker: "Wendell Ouellette",
				text: "\"The Collector's boys'll be back for the truck. Let 'em have it.\"",
				choices: [{
					label: "Close",
					id: "close"
				}]
			};
		}
		return null;
	}
	function lrChoice(id) {
		let m = /^v141-search-(\d+)$/.exec(id);
		if (m) {
			const p = piles.find((q) => q.id === +m[1]);
			dialogue = null;
			phase = "play";
			if (p) openLoot(p);
			return true;
		}
		const done = () => {
			dialogue = null;
			phase = "play";
			saveGame();
			sync(true);
			return true;
		};
		if (id === "v141-q-gas-1") {
			l1.sq.gas = 1;
			pushLog("Dale's Key: get the key ring off the kitchen hook at Dale's place. Come back to the station to set it up.");
			regions.delete(9);
			return done();
		}
		if (id === "v141-q-gas-pump") {
			l1.sqf.pumped = true;
			emitNoise(100);
			spawnHollowed(5, {
				x: player.x + 520,
				y: player.y - 200
			}, 90);
			pushLog(`The hand pump squeals like a stuck pig. Four cans. Out of the treeline, ${HOLLOWED}, coming for the noise.`);
			return done();
		}
		if (id === "v141-q-gas-share") {
			l1.sq.gas = 2;
			giveItem("fuel", 2);
			pushLog("Dale's Key done: 2 fuel. Tammy will trade with you now, and the back office stays open.");
			grantXp(30);
			return done();
		}
		if (id === "v141-q-gas-keep") {
			l1.sq.gas = 2;
			l1.sqf.tammyCold = true;
			giveItem("fuel", 4);
			pushLog("You keep all four. Tammy won't forget it.");
			grantXp(20);
			return done();
		}
		if (id === "v141-buy-matches" || id === "v141-buy-oil") {
			const c = id.endsWith("matches") ? 2 : 3;
			if (player.scrap < c) pushLog("Not enough iron.");
			else {
				player.scrap -= c;
				giveItem(id.endsWith("matches") ? "matches" : "oil");
			}
			return done();
		}
		if (id === "v141-q-camp-1") {
			l1.sq.camp = 1;
			pushLog("Roy's Trapline: walk the four flagged sites.");
			regions.delete(9);
			return done();
		}
		if (id === "v141-q-gerry") {
			l1.sqf.gerry = true;
			giveItem("maple");
			world.npcs = world.npcs.filter((n) => n.role !== "lr-gerry");
			pushLog("Gerry heads back to camp. Gerry pays his 14-dollar debt with a maple tin.");
			return done();
		}
		if (id === "v141-q-camp-gun" || id === "v141-q-camp-bino") {
			l1.sq.camp = 2;
			takeItem("roycap", 1);
			giveItem("steeltrap", 2);
			giveItem("hide", 2);
			giveItem(id.endsWith("gun") ? "levergun" : "binoculars");
			pushLog(`Roy's Trapline done. Steel traps, hides${id.endsWith("gun") ? " and Bob's lever gun" : " and Bob's binoculars"}. The camp's a safe place to rest now.`);
			grantXp(40);
			return done();
		}
		if (id === "v141-q-truck-splint") {
			const b = player.bag.find((s) => /^bandage/.test(s.id));
			if (!b || player.wood < 1) {
				pushLog("You need a bandage and a stick of wood.");
				return done();
			}
			takeItem(b.id, 1);
			player.wood -= 1;
			l1.sq.truck = 2;
			l1.sq.truckFound = 0;
			pushLog("You splint Wendell's ankle. Wendell's Load: follow the three trails off the truck.");
			regions.delete(9);
			return done();
		}
		if (id === "v141-q-truck-done") {
			l1.sq.truck = 3;
			giveItem("backpack");
			giveItem("medicine");
			w13.freed = (w13.freed ?? 0) + 2;
			l1.sqf.collectorRoutes = true;
			if (w13.loyal) w13.loyal.mira = (w13.loyal.mira ?? 0) + 5;
			for (let i = 0; i < 3; i++) {
				spawnRaider("scout", {
					x: player.x + 420 + i * 50,
					y: player.y - 120
				});
				const e = world.enemies[world.enemies.length - 1];
				e.raid = false;
			}
			pushLog("Wendell's Load done: a canvas pack and medicine. Two Forks people on the road to Harmony (+2 Harmony). Mira will hear of it. Wendell's sheet lists the Collector's caravan routes: a lead for act 5.");
			pushLog("Engines on Route 27. The Collector's men are back for the truck. Defend it or let it go.");
			grantXp(40);
			return done();
		}
		return false;
	}
	/** Trails off the truck: opening each one is a survivor, a body, or an ambush. */
	function lrTrail(pile) {
		const m = /^Trail from the truck (\d)$/.exec(pile.title);
		if (!m || pile.trailDone) return;
		pile.trailDone = true;
		const i = +m[1];
		if (i === 2) {
			pushLog("A mitten, and a shape under the snow. You leave them be.");
			return;
		}
		l1.sq.truckFound = (l1.sq.truckFound ?? 0) + 1;
		if (i === 3) {
			for (let k = 0; k < 2; k++) {
				spawnRaider("scout", {
					x: pile.x + 200 + k * 40,
					y: pile.y
				});
				world.enemies[world.enemies.length - 1].raid = false;
			}
			pushLog("A Forks woman in a spruce hollow, and two of the Collector's men right behind her. Ambush.");
		} else pushLog("A Forks man under a blowdown, half frozen. You point him toward Harmony.");
	}
	function prodKey(p) {
		return `${p.tx},${p.ty}`;
	}
	function prodState(p) {
		return l1.prod[prodKey(p)] ??= {
			t: clock,
			n: 0,
			load: 0
		};
	}
	function prodRun(p) {
		const def = prodOf(p.kind);
		if (!def) return;
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
			if (def.needs) {
				if (st.load <= 0) break;
				st.load -= 1;
			}
			st.n = Math.min(def.cap, st.n + def.qty);
		}
	}
	const BARREL_CAP = 8;
	function barrel141(p) {
		const k = prodKey(p);
		if (!l1.prod[k]) l1.prod[k] = {
			t: clock,
			n: 4,
			load: 0
		};
		const st = l1.prod[k];
		const wet = w13.weather.id === "rain" || w13.weather.id === "snow" || w13.weather.id === "noreaster";
		const hrs = (clock - st.t) / DAY_LENGTH_SEC * 24;
		if (!wet) {
			st.t = clock;
			return st;
		}
		if (hrs >= 12) {
			const b = Math.floor(hrs / 12);
			st.t += b * 12 / 24 * DAY_LENGTH_SEC;
			st.n = Math.min(BARREL_CAP, st.n + b);
		}
		return st;
	}
	/** Rain collectors pour what they make into a rain barrel within 6 tiles (the barrel stores, the collector produces). */
	function pourCollector(p, st) {
		if (st.n <= 0) return;
		const b = world.props.find((q) => q.kind === "rainbarrel" && Math.hypot(q.tx - p.tx, q.ty - p.ty) <= 6);
		if (!b) return;
		const bs = barrel141(b);
		const mv = Math.min(st.n, BARREL_CAP - bs.n);
		bs.n += mv;
		st.n -= mv;
	}
	function prodTick(dt) {
		if (!world || mapId !== 0 || mode11) return;
		prodAcc += dt;
		if (prodAcc < 1) return;
		prodAcc = 0;
		for (const p of world.props) if (p.p14 && prodOf(p.kind)) {
			prodRun(p);
			if (p.kind === "raincollector") pourCollector(p, prodState(p));
		}
		for (const p of world.props) if (p.kind === "rainbarrel") barrel141(p);
	}
	function prodUse(p) {
		const def = prodOf(p.kind);
		prodRun(p);
		const st = prodState(p);
		const ch = [];
		if (st.n > 0) ch.push({
			label: `Take ${st.n} × ${GEAR[def.makes].name}`,
			id: `v141-take-${prodKey(p)}`
		});
		if (def.needs) {
			const can = def.needs.every(([id, n]) => (player.bag.find((s) => s.id === id)?.qty ?? 0) >= n);
			ch.push({
				label: `Load it: ${def.needs.map(([id, n]) => `${n} ${GEAR[id].name}`).join(" + ")}${can ? "" : " (you're short)"}`,
				id: `v141-load-${prodKey(p)}`
			});
		}
		ch.push({
			label: "Leave it",
			id: "close"
		});
		const bar = def.kind === "raincollector" ? world.props.find((q) => q.kind === "rainbarrel" && Math.hypot(q.tx - p.tx, q.ty - p.ty) <= 6) : null;
		const status = def.needs ? `Loaded for ${st.load} batch${st.load === 1 ? "" : "es"}.` : bar ? `It pours into the rain barrel next to it (${barrel141(bar).n} of ${BARREL_CAP} jugs stored there).` : def.kind === "raincollector" ? "Set a rain barrel within 6 steps to store what it makes." : "";
		return openD13(def.name, `${def.blurb} One batch every ${def.per} hours. Ready: ${st.n} of ${def.cap}. ${status}`, ch);
	}
	function v141Choice(id) {
		const m = /^v141-(take|load)-(\d+),(\d+)$/.exec(id);
		if (!m) return false;
		const p = world.props.find((q) => q.p14 && q.tx === +m[2] && q.ty === +m[3]);
		if (!p) {
			dialogue = null;
			phase = "play";
			return true;
		}
		const def = prodOf(p.kind), st = prodState(p);
		if (m[1] === "take") {
			const n = st.n;
			st.n = 0;
			giveItem(def.makes, n);
			pushLog(`You take ${n} × ${GEAR[def.makes].name}.`);
			sfx("gather");
		} else if (!def.needs) pushLog("Nothing to load into that.");
		else if (!def.needs.every(([iid, n]) => (player.bag.find((s) => s.id === iid)?.qty ?? 0) >= n)) pushLog(`It wants ${def.needs.map(([iid, n]) => `${n} ${GEAR[iid].name}`).join(" and ")}.`);
		else {
			for (const [iid, n] of def.needs) takeItem(iid, n);
			st.load += 1;
			if (st.load === 1) st.t = clock;
			pushLog(`Loaded. ${def.name} has ${st.load} batch${st.load === 1 ? "" : "es"} to go.`);
			sfx("build");
		}
		dialogue = null;
		phase = "play";
		saveGame();
		sync(true);
		return true;
	}
	function v141Use(def, stack) {
		const lv = BAGS[def.id];
		if (!lv) return false;
		if ((player.bagLv ?? 0) >= lv) {
			pushLog("Your pack's already that big.");
			return true;
		}
		const add = lv - (player.bagLv ?? 0);
		player.bagLv = lv;
		stack.qty -= 1;
		if (stack.qty <= 0) player.bag = player.bag.filter((s) => s !== stack);
		pushLog(`You stitch the ${def.name.toLowerCase()} on. ${add} more row${add > 1 ? "s" : ""} in the pack.`);
		sfx("build");
		return true;
	}
	function dropPack141() {
		if (!w13.hard || !player) return;
		const items = [];
		for (const s of player.bag) {
			const loose = s.qty - wornCount(player, s.id);
			if (loose > 0) {
				items.push({
					id: s.id,
					qty: loose
				});
				s.qty -= loose;
			}
		}
		player.bag = player.bag.filter((s) => s.qty > 0);
		if (!items.length) return;
		leavePile(player.x, player.y, "Your pack", items, 0, "", 0);
		l1.drop = {
			map: mapId,
			x: player.x,
			y: player.y,
			day: curDay()
		};
		pushLog("Hard mode: your pack stays where you fell. Go back for it.");
	}
	function dropTick() {
		if (!l1.drop || mapId !== l1.drop.map) return;
		const p = piles.find((q) => q.title === "Your pack");
		if (!p || !hasLoot(p)) {
			l1.drop = null;
			pushLog("You've got your pack back.");
			sfx("gather");
			saveGame();
			sync(true);
		}
	}
	function dropHud() {
		if (!l1.drop || !player) return "";
		if (mapId !== l1.drop.map) return "Recover your pack: it's back where you fell.";
		return `Recover your pack: ${Math.round(Math.hypot(l1.drop.x - player.x, l1.drop.y - player.y) / 11 / 3.28)} m ${[
			"east",
			"south-east",
			"south",
			"south-west",
			"west",
			"north-west",
			"north",
			"north-east"
		][(Math.round(Math.atan2(l1.drop.y - player.y - (l1.drop.x - player.x) * 0, l1.drop.x - player.x) / (Math.PI / 4)) % 8 + 8) % 8]}.`;
	}
	function storeOf(key) {
		return l1.chests[key] ??= [];
	}
	function openStore(p) {
		storeKey = prodKey(p);
		packOpen = false;
		statsOpen = false;
		buildOpen = false;
		sync(true);
	}
	function stashPile() {
		if (!player || mapId !== 0) return null;
		return piles.find((q) => q.title === "Farm stash" && Math.hypot(q.x - player.x, q.y - player.y) < 900) ?? null;
	}
	function storeHud() {
		if (!storeKey || !player) return null;
		const items = storeOf(storeKey);
		const loose = player.bag.filter((s) => s.qty - wornCount(player, s.id) > 0).map((s) => ({
			id: s.id,
			name: GEAR[s.id]?.name ?? s.id,
			qty: s.qty - wornCount(player, s.id)
		}));
		return {
			key: storeKey,
			chest: items.map((s) => ({
				id: s.id,
				name: GEAR[s.id]?.name ?? s.id,
				qty: s.qty
			})),
			pack: loose,
			stash: !!stashPile()
		};
	}
	function storeCmd(cmd, id) {
		if (!player) return;
		if (cmd === "close") {
			storeKey = "";
			sync(true);
			return;
		}
		if (cmd === "stashAll") {
			let pile = stashPile();
			if (!pile) {
				leavePile(player.x + 14, player.y + 10, "Farm stash", [], 0, "", 0);
				pile = piles[piles.length - 1];
				if (!pile || pile.title !== "Farm stash") {
					pile = {
						id: nextPile++,
						x: player.x + 14,
						y: player.y + 10,
						title: "Farm stash",
						items: [],
						scrap: 0,
						body: "",
						folk: "",
						dir: 0,
						at: clock
					};
					piles.push(pile);
				}
			}
			if (!pile.items.length) {
				for (const s of player.bag) if (GEAR[s.id]?.kind === "supply" && s.qty - wornCount(player, s.id) > 0) pile.items.push({
					id: s.id,
					qty: 0
				});
			}
			const [pk, st, n] = quickStack(player.bag, pile.items, (iid) => wornCount(player, iid));
			player.bag = pk.filter((s) => s.qty > 0);
			pile.items = st.filter((s) => s.qty > 0);
			pushLog(n ? `${n} item${n > 1 ? "s" : ""} stacked into the farm stash.` : "Nothing in your pack matches what's in the stash.");
			saveGame();
			sync(true);
			return;
		}
		if (!storeKey) return;
		const items = storeOf(storeKey);
		if (cmd === "put") {
			const s = player.bag.find((q) => q.id === id);
			if (!s) return;
			const n = s.qty - wornCount(player, id);
			if (n <= 0) return;
			s.qty -= n;
			player.bag = player.bag.filter((q) => q.qty > 0);
			const c = items.find((q) => q.id === id);
			if (c) c.qty += n;
			else items.push({
				id,
				qty: n
			});
		} else if (cmd === "take") {
			const c = items.find((q) => q.id === id);
			if (!c) return;
			let n = 0;
			while (n < c.qty && tryGive(id, 1)) n++;
			c.qty -= n;
			l1.chests[storeKey] = items.filter((q) => q.qty > 0);
			if (n === 0) pushLog("No room in the pack.");
		} else if (cmd === "sort") {
			l1.chests[storeKey] = sortStacks(items, GEAR);
			pushLog("Chest sorted.");
		} else if (cmd === "stack") {
			const [pk, st, n] = quickStack(player.bag, items, (iid) => wornCount(player, iid));
			player.bag = pk.filter((s) => s.qty > 0);
			l1.chests[storeKey] = st;
			pushLog(n ? `${n} item${n > 1 ? "s" : ""} stacked into the chest.` : "Nothing in your pack matches what's in the chest.");
		}
		saveGame();
		sync(true);
	}
	function keyVec() {
		let x = 0, y = 0;
		if (held("KeyA") || held("ArrowLeft")) x -= 1;
		if (held("KeyD") || held("ArrowRight")) x += 1;
		if (held("KeyW") || held("ArrowUp")) y -= 1;
		if (held("KeyS") || held("ArrowDown")) y += 1;
		return {
			x,
			y
		};
	}
	function stickMove(pace, dt) {
		const k = keyVec();
		let vx = stickX + k.x, vy = stickY + k.y;
		const mag = Math.hypot(vx, vy);
		if (mag > .18) {
			if (intent && intent.kind === "walk") intent = null;
			if (intent && intent.kind !== "attack") intent = null;
			holdWalk = false;
			const f = Math.min(1, mag);
			vx /= mag;
			vy /= mag;
			if (!(intent && intent.kind === "attack")) moveBody(player, vx, vy, pace * f, dt);
			coastX = vx * f;
			coastY = vy * f;
			coastT = .14;
			return true;
		}
		if (coastT > 0 && !intent) {
			const u = coastT / .14;
			moveBody(player, coastX, coastY, pace * u * u, dt);
			coastT -= dt;
			return true;
		}
		coastT = 0;
		return false;
	}
	function autoTick() {
		if (!l1.auto || !player || buildOpen || intent || mounted) return;
		const swing = swingOf();
		const reachD = isGun(GEAR[player.weaponId]?.family) ? 320 : Math.max(90, swing.range + 50);
		let best = null, bd = reachD;
		for (const e of world.enemies) {
			if (e.dead || !(e.aggro && e.temper !== "timid" || e.hollow && e.aggro)) continue;
			const d = Math.hypot(e.x - player.x, e.y - player.y);
			if (d < bd) {
				bd = d;
				best = e;
			}
		}
		if (!best) return;
		if (isGun(GEAR[player.weaponId]?.family) && shellCount(player) <= 0) return;
		intent = {
			kind: "attack",
			id: best.id,
			who: "enemy",
			path: pathTo(world, player.x, player.y, best.x, best.y) ?? []
		};
		attackRepath = 0;
	}
	function hud141() {
		return {
			crouch: l1.crouch,
			noise: Math.round(l1.noise),
			auto: l1.auto,
			stick: l1.stick,
			rows: player ? gridRows(player) : 0,
			bagLv: player?.bagLv ?? 0,
			small: !!player?.small,
			drop: dropHud(),
			store: storeHud(),
			hard: !!w13.hard
		};
	}
	const legacyTravel = () => typeof window !== "undefined" && !!window.__v14Skip;
	let wmAcc = 0;
	function wmState() {
		if (!v14.map) {
			const l = locOfMap(mapId);
			v14.map = {
				q: l.q,
				r: l.r,
				fog: [],
				path: [],
				from: null,
				warn: "",
				lastNight: -1,
				enc: null
			};
		}
		return v14.map;
	}
	function wmReveal(q, r) {
		const m = wmState();
		for (const [a, b] of [[q, r], ...hexNeighbors(q, r)]) {
			const k = hexKey(a, b);
			if (!m.fog.includes(k)) m.fog.push(k);
		}
	}
	function openWorldMap() {
		if (!player || !world) return;
		parkBike(false);
		const m = wmState();
		if (mapId !== 9) {
			const l = locOfMap(mapId);
			m.q = l.q;
			m.r = l.r;
		}
		wmReveal(m.q, m.r);
		regions.set(mapId, captureRegion());
		m.path = [];
		phase = "worldmap";
		intent = null;
		buildOpen = false;
		craftOpen = false;
		dialogue = null;
		pushLog("The world map. Tap a hex to travel; tap a named place to go in.");
		saveGame();
		sync(true);
	}
	function wmGo(q, r) {
		const m = wmState();
		if (phase !== "worldmap") return;
		if (q === m.q && r === m.r) {
			const l = locAt(q, r);
			if (l) wmEnter(l);
			else {
				const lr = lootRunAt(q, r);
				if (lr) lootEnter(lr);
			}
			return;
		}
		m.path = hexPath([m.q, m.r], [q, r], bikeBuilt());
		sync(true);
	}
	function wmTick(dt) {
		const m = wmState();
		if (!m.path.length) return;
		wmAcc += dt;
		if (wmAcc < .32) return;
		wmAcc = 0;
		const [q, r] = m.path.shift();
		m.from = [m.q, m.r];
		m.q = q;
		m.r = r;
		const hrs = hexHours(q, r, bikeBuilt());
		clock += hrs / 24 * DAY_LENGTH_SEC;
		needsTick(hrs);
		wmReveal(q, r);
		wmAwayRaid();
		const rc = WM_LOCS.find((l) => l.id === "raiders");
		const near = Math.abs(q - rc.q) + Math.abs(r - rc.r) <= 3;
		const roll = typeof window !== "undefined" && window.__wmEnc != null ? window.__wmEnc : Math.random();
		if (!locAt(q, r) && !lootRunAt(q, r) && roll < (near ? .22 : .07)) {
			m.path = [];
			wmEncounter(near);
			return;
		}
		if (!m.path.length) {
			const l = locAt(q, r) ?? lootRunAt(q, r);
			pushLog(l ? `${l.name}. Tap it again to go in.` : "You stop and look around.");
		}
		sync(true);
	}
	/** A raid night hits the farm while you're out: dents the walls in the save, and the world map warns you. */
	function wmAwayRaid() {
		const m = wmState();
		if (!ok14() || mapId === 0 && phase !== "worldmap") return;
		const day = curDay();
		if (nightShade(clock) < .22 || m.lastNight === day) return;
		m.lastNight = day;
		if (Math.random() > .45 && !(typeof window !== "undefined" && window.__wmRaid)) return;
		const keys = Object.keys(v14.fort).length ? Object.keys(v14.fort) : [];
		let hit = 0;
		for (const k of keys) if (Math.random() < .25 && /^(wall|gate)-/.test(v14.fort[k].k)) {
			v14.fort[k].hp = Math.max(1, v14.fort[k].hp - 25);
			hit++;
		}
		for (const p of v14.placed) if (Math.random() < .25) {
			p.hp = Math.max(1, p.hp - 20);
			hit++;
		}
		m.warn = `Raid on the farm tonight! Lanterns on Cambridge Road. ${hit} piece${hit === 1 ? "" : "s"} of wall hit. Justin and Sarah held the house.`;
		pushLog(m.warn);
	}
	function wmArrive(target, from) {
		travelTo(target, () => {
			if (!from || !world.gates.length) return null;
			const c = hexCenter(wmState().q, wmState().r), f = hexCenter(from[0], from[1]);
			const want = Math.atan2(f.y - c.y, f.x - c.x);
			let best = null, bd = 9;
			for (const g of world.gates) {
				const a = Math.atan2(g.arriveTy - 78, g.arriveTx - 80);
				let d = Math.abs(a - want);
				if (d > Math.PI) d = Math.PI * 2 - d;
				if (d < bd) {
					bd = d;
					best = g;
				}
			}
			return best ? {
				x: best.arriveTx * 64 + 32,
				y: best.arriveTy * 64 + 32
			} : null;
		});
		phase = "play";
		travelLock = 2;
		hollowedArea(target);
	}
	function wmEnter(l) {
		const m = wmState();
		m.warn = "";
		wmArrive(l.map, m.from);
		w13.seen[l.id] = true;
		saveGame();
		sync(true);
	}
	function wmEncounter(raiders) {
		const m = wmState();
		const kinds = raiders ? [
			"raiders",
			"raiders",
			"wildlife",
			"road",
			"horde"
		] : [
			"wildlife",
			"road",
			"caravan",
			"migration",
			"raiders",
			"horde"
		];
		const pick = typeof window !== "undefined" && window.__wmKind ? window.__wmKind : kinds[Math.floor(Math.random() * kinds.length)];
		regions.delete(9);
		m.enc = pick;
		wmArrive(9, m.from);
		const at = (dx, dy) => ({
			x: player.x + dx,
			y: player.y + dy
		});
		if (pick === "raiders") {
			for (let i = 0; i < 3; i++) {
				spawnRaider("scout", at(260 + i * 50, -120 + i * 70));
				const e = world.enemies[world.enemies.length - 1];
				e.raid = false;
			}
			pushLog("Raiders on the road ahead. They've seen you.");
		} else if (pick === "wildlife") {
			const n = 3 + Math.floor(Math.random() * 3);
			for (let i = 0; i < n; i++) q10Spawn("wolf", "", "Timber wolf", at(240 + i * 40, 90 - i * 50), [
				22,
				5,
				10
			], "enc", true);
			pushLog(`A pack of ${n} timber wolves comes out of the alders.`);
		} else if (pick === "horde") {
			const n = 5 + Math.floor(Math.random() * 3);
			spawnHollowed(n, at(420, 160), 90);
			pushLog(`A group of ${HOLLOWED} shuffling down the road, ${n} of them. They go where the noise is. Get low and keep quiet.`);
		} else if (pick === "migration") {
			for (let i = 0; i < 5; i++) q10Spawn("deer", "", "Deer", at(-200 + i * 70, 220), [
				16,
				2,
				6
			], "enc", false);
			pushLog("A line of deer crossing the road, heading south for the yards.");
		} else if (pick === "caravan") openD13("Caravan", "A sledge caravan out of Skowhegan, two horses and a dog. They'll trade a little for iron.", [{
			label: "Six shells — 8 iron",
			id: "q10-buy-shells"
		}, {
			label: "Wave them by",
			id: "close"
		}]);
		else startRoadEvent(pickRoadEvent(Math.random()));
		pushLog("Walk to the tinted edge to get back on the world map.");
		saveGame();
		sync(true);
	}
	function wmHud() {
		if (phase !== "worldmap" || !v14.map) return null;
		const m = v14.map;
		return {
			q: m.q,
			r: m.r,
			fog: m.fog,
			path: m.path,
			warn: m.warn,
			here: locAt(m.q, m.r)?.name ?? lootRunAt(m.q, m.r)?.name ?? null,
			loot: lootHud(),
			clock: clockLabel(clock),
			bike: bikeBuilt()
		};
	}
	function benchMenu() {
		const pieces = armorPieces();
		if (!pieces.length) return openD13("Workbench", "Nothing you've got on is worth the rivets.", [{
			label: "Close",
			id: "close"
		}]);
		const ch = [];
		for (const id of pieces) {
			const d = duraOf(id);
			if (d < 100) ch.push({
				label: `Repair ${GEAR[id].name} (${d}/100): ${repairCost$1(id)} iron`,
				id: `v13-repair-${id}`
			});
			if (!w13.patched[id] || d < 60) ch.push({
				label: `Patch ${GEAR[id].name} with hide (+40, a bit tougher)`,
				id: `v13-patch-${id}`
			});
		}
		ch.push({
			label: "Dye your armor",
			id: "v13-dyes"
		});
		ch.push({
			label: "Close",
			id: "close"
		});
		return openD13("Workbench", `The bench, the vise and a tin of rivets. ${setBonus13() ? `Wearing the ${setBonus13().name}: ${setBonus13().text}` : "A full matching set gives a bonus."}`, ch);
	}
	function dyeMenu() {
		return openD13("Dye", "Boil it up in the kettle. Which color?", [
			...DYES.map((d) => ({
				label: `${d.name} (${d.need[1]} ${GEAR[d.need[0]]?.name.toLowerCase() ?? d.need[0]})`,
				id: `v13-dye-${d.id}`
			})),
			{
				label: "Wash it out (plain)",
				id: "v13-dye-none"
			},
			{
				label: "Close",
				id: "close"
			}
		]);
	}
	function dyeAll(id) {
		const d = DYES.find((x) => x.id === id);
		if (id === "none") {
			w13.dye = {};
			pushLog("You wash the dye out.");
			return;
		}
		if (!d) return;
		if (countOf(d.need[0]) < d.need[1]) {
			pushLog(`You need ${d.need[1]} ${GEAR[d.need[0]]?.name.toLowerCase() ?? d.need[0]}.`);
			return;
		}
		takeItem(d.need[0], d.need[1]);
		for (const p of [
			"head",
			"chest",
			"legs",
			"hands",
			"feet"
		]) w13.dye[p] = d.hex;
		pushLog(`Your armor comes out of the kettle ${d.name.toLowerCase()}.`);
		figureKey = "";
	}
	function bountyMenu() {
		if (!w13.bounties.length) {
			w13.bounties = makeBounties(curDay());
			w13.bountyDay = curDay();
		}
		return openD13("Bounty board", "Notes tacked up on the store door. New ones every few days.", [...w13.bounties.map((b) => ({
			label: `${b.text}: ${Math.min(b.got, b.need)}/${b.need} (${b.pay} iron)${b.got >= b.need ? " — collect" : b.kind === "deliver" ? ` — hand in ${GEAR[b.item]?.name.toLowerCase() ?? b.item}` : ""}`,
			id: `v13-bounty-${b.id}`
		})), {
			label: "Close",
			id: "close"
		}]);
	}
	function bountyTurnIn(id) {
		const b = w13.bounties.find((x) => x.id === id);
		if (!b || b.paid) return;
		if (b.kind === "deliver" && b.got < b.need) {
			const give = Math.min(countOf(b.item), b.need - b.got);
			if (give > 0) {
				takeItem(b.item, give);
				b.got += give;
			}
		}
		if (b.got < b.need) {
			pushLog(`Not done yet: ${b.got}/${b.need}.`);
			return;
		}
		b.paid = true;
		player.scrap += b.pay;
		w13.bountyDone += 1;
		loyalty("bounty");
		pushLog(`Bounty paid: ${b.pay} iron.`);
		w13.bounties = w13.bounties.filter((x) => !x.paid);
		if (!w13.bounties.length) {
			w13.bounties = makeBounties(curDay() + 1);
			w13.bountyDay = curDay();
		}
	}
	function v13Kill(enemy) {
		for (const b of w13.bounties) {
			if (b.kind === "raiders" && enemy.kind === "bandit") b.got += 1;
			if (b.kind === enemy.kind) b.got += 1;
		}
		if (enemy.lt && !enemy.ltCounted) {
			enemy.ltCounted = true;
			w13.main.ltKills += 1;
			pushLog(`Lieutenant down (${w13.main.ltKills}/3).`);
			if (enemy.v13camp) w13.camps[enemy.v13camp] = {
				...w13.camps[enemy.v13camp] ?? {},
				lt: true
			};
		}
		if (enemy.name === "Caravan robber" && w13.caravanGuard && !world.enemies.some((e) => !e.dead && e !== enemy && e.name === "Caravan robber")) {
			const r = CARAVAN_ROUTES$1.find((c) => c.id === w13.caravanGuard);
			w13.caravanGuard = "";
			player.scrap += 8;
			if (r) giveItem(r.cargo[0][0], Math.ceil(r.cargo[0][1] / 2));
			loyalty("guard-caravan");
			grantXp(25);
			pushLog("The caravan gets through. The driver pays you 8 iron and a share of the load.");
		}
		if (enemy.variant === "collector") {
			w13.main.collectorDown = true;
			pushLog("The Collector goes down in the snow.");
		}
	}
	const CAMPS13 = [
		{
			id: "camp0",
			map: 0,
			tx: 50,
			ty: 30,
			name: "Raider camp at the gravel pit"
		},
		{
			id: "camp1",
			map: 1,
			tx: 30,
			ty: 70,
			name: "Raider camp in the Holeb cut"
		},
		{
			id: "camp2",
			map: 2,
			tx: 30,
			ty: 30,
			name: "Raider camp behind the mill"
		}
	];
	const DEPOT13 = {
		map: 1,
		tx: 92,
		ty: 34
	};
	function camp13Spot(c) {
		return q10Tile(c.tx, c.ty);
	}
	function v13World() {
		if (!world || mode11) return;
		for (const c of CAMPS13) {
			if (c.map !== mapId) continue;
			const s = camp13Spot(c);
			const t = tileOf(s.x, s.y);
			if (!world.props.some((p) => p.v13camp === c.id)) {
				addProp(world, "firepot", t.tx, t.ty - 2, { v13camp: c.id }) || addProp(world, "firepot", t.tx + 2, t.ty - 2, { v13camp: c.id });
				addProp(world, "crates", t.tx + 3, t.ty, {
					v13camp: c.id,
					label: "RAIDER CAMP"
				});
			}
			if (!(w13.camps[c.id] ?? {}).lt && !world.enemies.some((e) => !e.dead && e.v13camp === c.id && e.lt)) {
				const lt = q11Spawn([
					"bandit",
					"armor",
					`Lieutenant ${[
						"Roy",
						"Dube",
						"Gagnon"
					][CAMPS13.indexOf(c)]}`,
					44,
					8,
					40
				], {
					x: s.x + 40,
					y: s.y + 30
				}, "camp", false);
				if (lt) {
					lt.lt = true;
					lt.v13camp = c.id;
					lt.elite = true;
				}
				for (let i = 0; i < 2; i++) {
					const g = q11Spawn([
						"bandit",
						"scout",
						"Camp guard",
						16,
						4,
						10
					], {
						x: s.x - 50 + i * 100,
						y: s.y + 70
					}, "camp", false);
					if (g) g.v13camp = c.id;
				}
			}
		}
		if (mapId === DEPOT13.map && w13.main.act >= 6) {
			const s = q10Tile(DEPOT13.tx, DEPOT13.ty);
			const t = tileOf(s.x, s.y);
			if (!world.props.some((p) => p.v13depot)) addProp(world, "crates", t.tx, t.ty, {
				v13depot: true,
				label: "SUPPLY DEPOT"
			});
			if (!w13.main.flags.grokPath && !world.enemies.some((e) => !e.dead && e.variant === "grok")) {
				const g = q11Spawn([
					"bandit",
					"grok",
					"The Grok",
					220,
					15,
					90
				], {
					x: s.x - 600,
					y: s.y + 300
				}, "v13grok", true);
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
			addProp(world, "shack", t.tx, t.ty, {
				v13town: r.id,
				skin: `harmony-${r.id}`,
				label: r.name.toUpperCase()
			});
		}
	}
	function nearCamp() {
		for (const c of CAMPS13) {
			if (c.map !== mapId) continue;
			const s = camp13Spot(c);
			if (Math.hypot(s.x - player.x, s.y - player.y) < 384) return c;
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
		if (!c || nightDark(clock) < .3) {
			w13.campPrompt = "";
			return;
		}
		const st = w13.camps[c.id] ?? {};
		if (st.raidDay === curDay() || w13.campPrompt === c.id) return;
		w13.campPrompt = c.id;
		openD13(c.name, `Lanterns and a cookfire. Two guards, and the lieutenant asleep by the sledges. ${st.prisoners === 0 ? "" : "You can see people tied up by the woodpile."} Your odds of getting in quiet: about ${Math.round(campStealth())}%.`, [{
			label: "Sneak in: steal supplies, free the prisoners, deal with the lieutenant",
			id: `v13-camp-${c.id}`
		}, {
			label: "Back off",
			id: "close"
		}]);
	}
	function campRaid(id, forceOk) {
		if (!CAMPS13.find((x) => x.id === id)) return;
		const st = w13.camps[id] = { ...w13.camps[id] ?? {} };
		st.raidDay = curDay();
		let ok = forceOk ?? Math.random() * 100 < campStealth();
		if (!ok && perk13("stealth", 9) && !st.retried) {
			st.retried = true;
			ok = Math.random() * 100 < campStealth();
		}
		train("stealth", 12);
		if (ok) {
			giveItem("shells", 4);
			giveItem("jerky", 2);
			player.scrap += 8;
			if (Math.random() < .5) giveItem("medicine", 1);
			if (st.prisoners !== 0) {
				st.prisoners = 0;
				w13.freed += 3;
				loyalty("free-prisoners");
				pushLog("You cut the ropes. Three people from the Forks slip off into the dark toward Harmony.");
				diary("Freed three prisoners from a raider camp.");
			}
			const lt = world.enemies.find((e) => !e.dead && e.lt && e.v13camp === id);
			if (lt) {
				lt.hp = 0;
				markDead(lt, lt.xp);
			} else if (!st.lt) {
				st.lt = true;
				w13.main.ltKills += 1;
				pushLog(`You find the lieutenant asleep by the sledges. He doesn't wake up (${w13.main.ltKills}/3).`);
			}
			pushLog("In and out. Nobody woke up. You took what they'd stolen.");
			achieve("ghost");
		} else {
			pushLog("A guard kicks a can. Shouting. The whole camp's up.");
			for (const e of world.enemies) if (!e.dead && e.v13camp === id) {
				e.aggro = true;
				e.temper = "hostile";
			}
		}
		saveGame();
		sync(true);
	}
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
		saveGame();
		sync(true);
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
			if (Math.hypot(s.x - player.x, s.y - player.y) < 256) {
				w13.main.flags.depot = true;
				giveItem("gas", 3);
				giveItem("medicine", 2);
				mainAdvance();
			}
		} else if (a === 2 && w13.main.flags.signal) mainAdvance();
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
		const f = {
			bunker: ["jack", 20],
			meds: ["marcel", 10],
			mill: ["marcel", 6],
			garden: ["mira", 12],
			school: ["sarah", 10],
			grok: ["justin", 10],
			radio: ["sarah", 4],
			fuel: ["justin", 6],
			bike: ["justin", 8],
			lighthouse: ["sarah", 6],
			wolves: ["sarah", 6]
		}[id];
		if (f && !w13.left[f[0]]) {
			w13.loyal[f[0]] = Math.min(100, (w13.loyal[f[0]] ?? 20) + f[1]);
			pushLog(`${COMPANION_NAME[f[0]]} thinks better of you (+${f[1]}).`);
		}
		if (id === "grok") w13.main.flags.grokPath = true;
	}
	function v13SiegeStart() {
		if (w13.main.act !== 8 || w13.main.siege) return;
		w13.main.siege = 1;
		if (!raidCanStart()) {
			const span = DAY_LENGTH_SEC;
			clock = Math.floor(clock / span) * span + 21.5 / 24 * span;
		}
		startRaid();
		if (!raid) {
			w13.main.siege = 0;
			return;
		}
		raid.siege = true;
		raid.waves = 5;
		raid.collector = false;
		const allies = siegeAllies();
		raid.house += 30 * allies;
		raid.houseMax += 30 * allies;
		pushLog(`Siege of Harmony. ${allies ? `${allies} allies on the walls with you.` : "Nobody's coming. It's you and the farm."}`);
		diary("The Collector came for the farm.");
		sync(true);
	}
	function siegeAllies() {
		return COMPANIONS.filter((c) => !w13.left[c] && (w13.loyal[c] ?? 0) >= 10).length + (w13.main.choice === "unite" ? 1 + rebuiltN() + (perk13("leadership", 9) ? 2 : 0) : 0) + (q10.dog >= 4 && v3.dog.down < 0 ? 1 : 0);
	}
	function v13SiegeTick(dt) {
		if (!raid?.siege) return;
		if (!raid.collector && raid.wave >= raid.waves) {
			raid.collector = true;
			const c = raidHouse() ?? {
				x: player.x,
				y: player.y
			};
			spawnRaider("collector", clearOutside(c.x + 700, c.y - 300), {
				hp: 260,
				atk: 14,
				xp: 200,
				name: "The Collector"
			});
			pushLog("A big man in a stolen state trooper's coat walks up the road like he owns it. The Collector.");
		}
		raid.allyT = (raid.allyT ?? 0) + dt;
		if (raid.allyT > 5) {
			raid.allyT = 0;
			const n = siegeAllies();
			const foes = world.enemies.filter((e) => !e.dead && e.raid && e.variant !== "collector");
			for (let i = 0; i < Math.min(n, foes.length); i++) {
				const e = foes[i];
				e.hp -= 8;
				e.hurt = .2;
				if (e.hp <= 0) {
					markDead(e, e.xp);
					raid.kills += 1;
				}
			}
		}
	}
	function v13RaidEnd(won, wasSiege) {
		if (!wasSiege) return;
		w13.main.won = !!won && !!w13.main.collectorDown;
		w13.main.siege = 2;
	}
	function openD13(speaker, text, choices) {
		dialogue = {
			speaker,
			text,
			choices
		};
		talkNpc = talkNpc ?? null;
		phase = "dialogue";
		intent = null;
		sfx("talk");
		sync(true);
		return true;
	}
	function v13TalkChoices(role) {
		if (raid || mode11 || !player) return [];
		const out = [];
		const a = w13.main.act;
		const c = roleComp(role);
		if (c && w13.left[c]) return [];
		if (role === "sarah") {
			out.push({
				label: "Cook a meal",
				id: "v13-cook"
			});
			if (mapId === 0) out.push({
				label: "Turn in and sleep till morning",
				id: "v13-sleep"
			});
			if ((v3.up.bench ?? 0) >= 1) out.push({
				label: "Use the workbench (repair, patch, dye)",
				id: "v13-bench"
			});
			out.push({
				label: "Rebuild Harmony",
				id: "v13-rebuild"
			});
			if (a === 7 && !w13.main.choice) out.push({
				label: "The Long Winter: decide what we do about the Collector",
				id: "v13-main-choose"
			});
		}
		if (role === "cyndal" && a === 2) out.push({
			label: "The Long Winter: what's on the radio?",
			id: "v13-main-signal"
		});
		if (role === "cal") {
			out.push({
				label: "Trade talk (Jack's trust)",
				id: "v13-jack"
			});
			if (a === 3) out.push({
				label: "The Long Winter: about those old maps",
				id: "v13-main-jack"
			});
		}
		if (role === "marcel") {
			out.push({
				label: "Bounty board",
				id: "v13-bounty"
			});
			if (a === 4) out.push({
				label: "The Long Winter: the Augusta broadcast",
				id: "v13-main-marcel"
			});
		}
		if (role === "justin") {
			out.push({
				label: "Caravan on the road?",
				id: "v13-caravan"
			});
			if (a === 8 && !w13.main.siege) out.push({
				label: "The Long Winter: we're ready for them",
				id: "v13-main-siege"
			});
		}
		if (MAIN_TALK[a]?.[role] && !raid) out.push({
			label: "The Long Winter: what do you make of it?",
			id: "v13-main-talk"
		});
		if (MAIN_ACTS[a - 1] && MAIN_ACTS[a - 1].intro[0].toLowerCase().startsWith(role === "cal" ? "jack" : role) && !w13.main.flags[`intro${a}`]) out.push({
			label: `The Long Winter: ${MAIN_ACTS[a - 1].title}`,
			id: `v13-main-intro`
		});
		return out;
	}
	function v13Choice(id) {
		let m;
		if (id === "v13-cook") return cookMenu();
		if (m = id.match(/^v13-cook-(.+)$/)) {
			cook(m[1]);
			return cookMenu();
		}
		if (id === "v13-bench") return benchMenu();
		if (id === "v13-sleep") {
			if (raid) {
				pushLog("Not tonight. They're on the road.");
				return close13();
			}
			const span = DAY_LENGTH_SEC;
			const h = hourNow();
			clock = Math.floor(clock / span) * span + (h >= 7 ? span : 0) + 7 / 24 * span;
			sleep13();
			player.hp = Math.min(player.maxHp, player.hp + Math.round(player.maxHp * .4));
			player.stamina = player.maxStamina;
			pushLog("You sleep like a stone under three quilts. Morning.");
			saveGame();
			return close13();
		}
		if (m = id.match(/^v13-repair-(.+)$/)) {
			const c = repairCost$1(m[1]);
			if (player.scrap < c) pushLog(`That's ${c} iron.`);
			else {
				player.scrap -= c;
				w13.dura[m[1]] = 100;
				train("mechanics", 4);
				pushLog(`Good as new: ${GEAR[m[1]].name}.`);
				refreshGear(player);
			}
			return benchMenu();
		}
		if (m = id.match(/^v13-patch-(.+)$/)) {
			if (countOf("hide") < 1) pushLog("You need a hide to patch with.");
			else {
				takeItem("hide", 1);
				w13.dura[m[1]] = Math.min(100, duraOf(m[1]) + 40);
				w13.patched[m[1]] = true;
				pushLog(`You patch the ${GEAR[m[1]].name.toLowerCase()} with a square of hide.`);
				refreshGear(player);
			}
			return benchMenu();
		}
		if (id === "v13-dyes") return dyeMenu();
		if (m = id.match(/^v13-dye-(.+)$/)) {
			dyeAll(m[1]);
			return benchMenu();
		}
		if (id === "v13-rebuild") return rebuildMenu();
		if (m = id.match(/^v13-rebuild-(.+)$/)) {
			rebuild(m[1]);
			return rebuildMenu();
		}
		if (id === "v13-clinic") {
			if (player.scrap < 4 && !perk13("medicine", 9)) pushLog("4 iron for the clinic.");
			else {
				if (!perk13("medicine", 9)) player.scrap -= 4;
				w13.ail = {};
				player.hp = player.maxHp;
				pushLog("The clinic sets you right. All patched up.");
			}
			return rebuildMenu();
		}
		if (id === "v13-bounty") return bountyMenu();
		if (m = id.match(/^v13-bounty-(.+)$/)) {
			bountyTurnIn(m[1]);
			return bountyMenu();
		}
		if (id === "v13-caravan") return caravanMenu();
		if (id === "v13-car-guard") {
			const r = v13Caravan();
			if (!r) return close13();
			w13.caravan[caravanKey(r)] = "guard";
			for (let i = 0; i < 3; i++) {
				const a = i * 2.1;
				q11Spawn([
					"bandit",
					null,
					"Caravan robber",
					16,
					4,
					10
				], clearOutside(player.x + Math.cos(a) * 260, player.y + Math.sin(a) * 260), "caravan", true);
			}
			pushLog("You fall in beside the lead sledge. Sure enough, at the bend there's men in the trees.");
			w13.caravanGuard = r.id;
			return close13();
		}
		if (id === "v13-car-rob") {
			const r = v13Caravan();
			if (!r) return close13();
			w13.caravan[caravanKey(r)] = "rob";
			for (const [it, n] of r.cargo) giveItem(it, n);
			player.karma = (player.karma ?? 0) - 4;
			shiftRep("ponds", -4, -10);
			loyalty("rob-caravan");
			pushLog("You take the sledges at gunpoint. The drivers walk home. Word will get around.");
			diary(`Robbed the ${r.from}–${r.to} caravan.`);
			return close13();
		}
		if (m = id.match(/^v13-go-(.+)$/)) {
			close13();
			fastTravel(m[1]);
			return true;
		}
		if (id === "v13-road-car") {
			if (lv("mechanics") >= 2 || perk13("mechanics", 9) || Math.random() < .5) {
				giveItem("gas", 2);
				player.scrap += 3;
				pushLog("Two cans of gas and a box of hose clamps.");
			} else {
				giveItem("gas", 1);
				pushLog("A cup of stale gas. Better than nothing.");
			}
			train("mechanics", 6);
			train("scavenging", 5);
			return close13();
		}
		if (id === "v13-road-help") {
			if (countOf("jerky") > 0) takeItem("jerky", 1);
			loyalty("stranger-help");
			pushLog("He tells you raiders have been working the Forks road at night. He thanks you and goes.");
			return close13();
		}
		if (id === "v13-road-rob") {
			giveItem("shells", 3);
			player.karma = (player.karma ?? 0) - 3;
			loyalty("stranger-rob");
			pushLog("Three shells and a can of beans. He doesn't look back.");
			return close13();
		}
		if (id === "v13-road-kid") {
			loyalty("lost-kid");
			shiftRep("ponds", 3, 8);
			grantXp(20);
			pushLog("His mother cries and hugs you both. She gives you a jar of honey, all they've got.");
			giveItem("syrup", 1);
			diary("Walked a lost boy home to the Forks.");
			return close13();
		}
		if (m = id.match(/^v13-camp-(.+)$/)) {
			close13();
			campRaid(m[1]);
			return true;
		}
		if (id === "v13-jack") {
			if (player.scrap >= 3) {
				player.scrap -= 3;
				loyalty("trade-jack");
				pushLog("You trade Jack 3 iron for a box of .30-30. He nods. \"Square.\"");
				giveItem("shells", 2);
			} else pushLog("Jack doesn't deal on credit.");
			return close13();
		}
		if (id === "v13-main-talk") {
			const r = talkNpc?.role;
			const line = MAIN_TALK[w13.main.act]?.[r];
			if (!line) return close13();
			if (!w13.main.flags[`talk${w13.main.act}${r}`]) {
				w13.main.flags[`talk${w13.main.act}${r}`] = true;
				diary(`${talkNpc.name}: ${line.replace(/^"|"$/g, "").slice(0, 120)}`);
			}
			return openD13(talkNpc.name, line, [{
				label: "Close",
				id: "close"
			}]);
		}
		if (id === "v13-main-intro") {
			const a = mainAct();
			w13.main.flags[`intro${a.n}`] = true;
			return openD13(a.intro[0], a.intro[1], [{
				label: "Close",
				id: "close"
			}]);
		}
		if (id === "v13-main-signal") {
			w13.main.flags.signal = true;
			return openD13("Cyndal", "\"Listen.\" Static, then a calm voice: \"Augusta has fuel. Augusta has medicine. Augusta has order. Come south.\" It loops. \"Same words every hour. Dad says nobody talks that calm anymore.\"", [{
				label: "Close",
				id: "close"
			}]);
		}
		if (id === "v13-main-jack") {
			w13.main.flags.jackTalk = true;
			if ((w13.loyal.jack ?? 0) < 30) return openD13("Jack Ready", `"You ain't there yet, bub." (Jack's trust: ${w13.loyal.jack}/30. Trade with him, finish his bunker map job.)`, [{
				label: "Close",
				id: "close"
			}]);
			return openD13("Jack Ready", "He unrolls the survey maps on the hood of the truck. \"That broadcast's bait, plain. I've watched folks go south on it. Nobody comes back up the Kennebec.\"", [{
				label: "Close",
				id: "close"
			}]);
		}
		if (id === "v13-main-marcel") {
			w13.main.flags.marcel = true;
			return openD13("Marcel Thibodeau", "\"Caravans that answer that signal never come back. Not one. There's a man they call the Collector. Every raider on the river works for him now.\"", [{
				label: "Close",
				id: "close"
			}]);
		}
		if (id === "v13-main-choose") {
			const avg = Math.round(COMPANIONS.reduce((n, c) => n + (w13.left[c] ? -50 : w13.loyal[c]), 0) / COMPANIONS.length);
			const canUnite = rebuiltN() >= 1 && avg >= 20;
			return openD13("Sarah", MAIN_ACTS[6].intro[1], [
				{
					label: canUnite ? "Unite the towns" : `Unite the towns (needs a rebuilt Harmony building and loyalty: avg ${avg}/20)`,
					id: canUnite ? "v13-main-unite" : "v13-main-choose"
				},
				{
					label: "Make a deal with the Collector",
					id: "v13-main-deal"
				},
				{
					label: "Go it alone",
					id: "v13-main-alone"
				}
			]);
		}
		if (m = id.match(/^v13-main-(unite|deal|alone)$/)) {
			w13.main.choice = m[1];
			loyalty(m[1] === "deal" ? "deal-collector" : m[1]);
			if (m[1] === "deal") {
				player.scrap = Math.max(0, player.scrap - 20);
				w13.main.siege = 2;
				w13.main.won = true;
				pushLog("You send word down the river: the farm pays his toll. He sends back a single shell casing. Deal.");
			}
			return close13();
		}
		if (id === "v13-main-siege") {
			close13();
			v13SiegeStart();
			return true;
		}
		if (id === "v13-ending-next") {
			w13.main.slide += 1;
			sync(true);
			return true;
		}
		return false;
	}
	function close13() {
		dialogue = null;
		talkNpc = null;
		phase = "play";
		sync(true);
		return true;
	}
	/** v13.4 High graphics: warm daylight tint that follows the hour, and a mild vignette. */
	let vignetteCv = null;
	function paintDaylight(dark) {
		const h = (clock % DAY_LENGTH_SEC + DAY_LENGTH_SEC) % DAY_LENGTH_SEC / DAY_LENGTH_SEC * 24;
		const gold = Math.max(0, 1 - Math.abs(h - 7) / 2.2) + Math.max(0, 1 - Math.abs(h - 17.5) / 2.6);
		const a = Math.min(.16, .035 + gold * .11) * (1 - dark);
		if (a > .004) {
			ctx.save();
			ctx.globalCompositeOperation = "soft-light";
			ctx.fillStyle = `rgba(255, ${Math.round(196 - gold * 40)}, ${Math.round(120 - gold * 50)}, ${Math.min(.5, a * 3)})`;
			ctx.fillRect(0, 0, viewW, viewH);
			ctx.restore();
		}
		const w = Math.ceil(viewW / 4), hh = Math.ceil(viewH / 4);
		if (!vignetteCv || vignetteCv.width !== w || vignetteCv.height !== hh) {
			vignetteCv = document.createElement("canvas");
			vignetteCv.width = w;
			vignetteCv.height = hh;
			const g2 = vignetteCv.getContext("2d");
			const g = g2.createRadialGradient(w / 2, hh / 2, Math.min(w, hh) * .38, w / 2, hh / 2, Math.hypot(w, hh) * .56);
			g.addColorStop(0, "rgba(0,0,0,0)");
			g.addColorStop(1, "rgba(8,6,4,0.34)");
			g2.fillStyle = g;
			g2.fillRect(0, 0, w, hh);
		}
		ctx.save();
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(vignetteCv, 0, 0, viewW, viewH);
		ctx.restore();
	}
	/** Weather overlay drawn in screen space: snow, nor'easter, fog, rain, black-ice sheen. */
	function paintWeather13() {
		if (!ctx) return;
		const now = performance.now() / 1e3;
		const dtw = Math.min(.25, Math.max(0, now - (weatherT || now)));
		weatherT = now;
		const cur = w13.weather.id;
		for (const k of [
			"fog",
			"blackice",
			"noreaster",
			"snow",
			"rain"
		]) {
			const want = k === cur ? 1 : 0;
			const m = weatherMix[k] ?? want;
			weatherMix[k] = gfxHigh ? m + (want - m) * Math.min(1, dtw / 2.5) : want;
		}
		if (cur === "clear" && !Object.values(weatherMix).some((v) => v > .01)) return;
		const t = now;
		ctx.save();
		const fogA = weatherMix.fog || 0;
		if (fogA > .01) {
			const hr = player ? worldToScreen(player.x, player.y, camX, camY) : {
				sx: viewW / 2,
				sy: viewH / 2
			};
			const hp = zoomPoint(hr.sx, hr.sy);
			const g = ctx.createRadialGradient(hp.sx, hp.sy - 40, 60, hp.sx, hp.sy - 40, Math.max(viewW, viewH) * .55);
			g.addColorStop(0, `rgba(206,210,212,${.05 * fogA})`);
			g.addColorStop(.45, `rgba(206,210,212,${.55 * fogA})`);
			g.addColorStop(1, `rgba(206,210,212,${.86 * fogA})`);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, viewW, viewH);
		}
		if ((weatherMix.blackice || 0) > .01) {
			ctx.fillStyle = `rgba(120,160,210,${.1 * weatherMix.blackice})`;
			ctx.fillRect(0, 0, viewW, viewH);
		}
		if ((weatherMix.noreaster || 0) > .01) {
			ctx.fillStyle = `rgba(200,206,214,${.32 * weatherMix.noreaster})`;
			ctx.fillRect(0, 0, viewW, viewH);
		}
		if (gfxHigh && (weatherMix.snow || 0) > .01) {
			ctx.fillStyle = `rgba(214,222,236,${.08 * weatherMix.snow})`;
			ctx.fillRect(0, 0, viewW, viewH);
		}
		for (const id of [
			"noreaster",
			"snow",
			"rain"
		]) {
			const mix = weatherMix[id] || 0;
			if (mix < .02) continue;
			const n = Math.round((id === "noreaster" ? 260 : id === "snow" ? 120 : 140) * mix * (gfxHigh ? 1 : .6));
			const wind = id === "noreaster" ? 520 : id === "rain" ? 60 : 40;
			const fall = id === "rain" ? 700 : id === "noreaster" ? 260 : 90;
			ctx.strokeStyle = id === "rain" ? "rgba(170,190,215,0.55)" : "rgba(250,250,252,0.85)";
			ctx.fillStyle = "rgba(250,250,252,0.9)";
			ctx.lineWidth = id === "rain" ? 1 : 2;
			for (let i = 0; i < n; i++) {
				const sx = ((i * 97.13 + t * wind * (.7 + i % 5 * .1)) % (viewW + 80) + viewW + 80) % (viewW + 80) - 40;
				const sy = ((i * 53.71 + t * fall * (.8 + i % 7 * .06)) % (viewH + 40) + viewH + 40) % (viewH + 40) - 20;
				if (id === "rain" || id === "noreaster") {
					ctx.beginPath();
					ctx.moveTo(sx, sy);
					ctx.lineTo(sx - wind * .02, sy - (id === "rain" ? 14 : 4));
					ctx.stroke();
				} else {
					ctx.beginPath();
					ctx.arc(sx, sy, 1.2 + i % 3 * .6, 0, Math.PI * 2);
					ctx.fill();
				}
			}
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
			core: core13(),
			fx,
			points: player?.points ?? 0,
			backstory: w13.backstory,
			weather: {
				id: w13.weather.id,
				...weather13()
			},
			moon: {
				phase: moonPhase(curDay()),
				name: MOON_NAMES[moonPhase(curDay())]
			},
			needs: { ...w13.needs },
			hard: w13.hard,
			ail: Object.keys(w13.ail).map((k) => ({
				id: k,
				...AILMENTS[k]
			})),
			buffs: Object.keys(w13.buffs).filter((k) => buffOn(k)),
			loyal: COMPANIONS.map((c) => ({
				id: c,
				name: COMPANION_NAME[c],
				v: w13.loyal[c],
				left: !!w13.left[c],
				helps: w13.loyal[c] >= 50
			})),
			armor: armorPieces().map((id) => ({
				id,
				name: GEAR[id].name,
				dura: duraOf(id),
				patched: !!w13.patched[id]
			})),
			set: sb ? {
				name: sb.name,
				text: sb.text
			} : null,
			skills: NEW_SKILLS.map((s) => ({
				...s,
				lv: v3.skills[s.id]?.lv ?? 0
			})),
			perks: Object.entries(SKILL_PERKS).map(([k, list]) => ({
				skill: k,
				got: list.slice(0, perkCount(v3.skills[k]?.lv ?? 0)),
				next: list[perkCount(v3.skills[k]?.lv ?? 0)] ?? ""
			})),
			rebuilt: { ...w13.rebuilt },
			bounties: w13.bounties.map((b) => ({
				text: b.text,
				got: b.got,
				need: b.need,
				pay: b.pay
			})),
			diary: w13.diary.slice(-40),
			notes: w13.notes,
			main: {
				act: w13.main.act,
				title: mainAct().title,
				goal: mainAct().goal,
				acts: MAIN_ACTS.map((a) => ({
					n: a.n,
					title: a.title,
					goal: a.goal,
					done: a.n < w13.main.act,
					notes: a.n <= w13.main.act ? [...MAIN_JOURNAL[a.n] ?? [], ...a.n < w13.main.act ? [a.done] : []] : []
				})),
				ending: w13.main.ending ? {
					id: w13.main.ending,
					...ENDINGS[w13.main.ending]
				} : null,
				slide: w13.main.slide
			},
			canTravel: mounted && bikeBuilt()
		};
	}
	/** Stand-in shop sign for a building with no Grok Build art yet. */
	function paintSign(text, x, y, h, dcx, dcy) {
		const r = worldToScreen(x, y, dcx, dcy);
		const p = zoomPoint(r.sx, r.sy);
		ctx.save();
		ctx.font = `bold ${Math.max(9, Math.round(13 * zoom))}px serif`;
		const w = ctx.measureText(text).width + 12 * zoom;
		const yy = p.sy - h * zoom * .55;
		ctx.fillStyle = "rgba(38,30,20,.92)";
		ctx.fillRect(p.sx - w / 2, yy - 11 * zoom, w, 20 * zoom);
		ctx.strokeStyle = "#c9a35a";
		ctx.lineWidth = 1.5;
		ctx.strokeRect(p.sx - w / 2, yy - 11 * zoom, w, 20 * zoom);
		ctx.fillStyle = "#efe2c4";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, p.sx, yy);
		ctx.restore();
	}
	function compassTo(dx, dy) {
		return COMPASS[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8 + 8) % 8];
	}
	function inCombat141() {
		if (!world || !player) return false;
		if (swingAnim > 0 || pendingHit) return true;
		return world.enemies.some((e) => !e.dead && e.aggro && e.temper !== "timid" && Math.hypot(e.x - player.x, e.y - player.y) < 420);
	}
	function openTalk(npc) {
		if (!player) return;
		if (inCombat141()) {
			if (performance.now() - (talkNag141 || 0) > 2500) {
				talkNag141 = performance.now();
				pushLog(`${npc.name ?? "They"} can't talk now. Deal with the fight first.`);
			}
			intent = null;
			return;
		}
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
					{
						label: "Eight shells — 10 iron",
						id: "q10-buy-shells"
					},
					{
						label: "Field bandage — 6 iron",
						id: "q10-buy-wrap"
					},
					{
						label: "Snowshoes — 16 iron",
						id: "q10-buy-snowshoes"
					},
					{
						label: "Barn lantern — 12 iron",
						id: "q10-buy-lantern"
					},
					{
						label: "Smoked jerky — 5 iron",
						id: "q10-buy-jerky"
					},
					{
						label: "Gas, quart can — 4 iron",
						id: "q10-buy-gas"
					},
					...v13TalkChoices("marcel"),
					{
						label: "Take care, Marcel",
						id: "close"
					}
				]
			};
			return;
		}
		const town = townOf(npc.role);
		const rep = town ? player.rep[town] ?? 0 : 0;
		if (town && townHostile(rep) && (npc.role === "cal" || npc.role === "rejean" || npc.role === "mira")) dialogue = {
			speaker: npc.name,
			text: `${npc.name.split(" ")[0]} will not deal with you. Word from this ground got here first.`,
			choices: [{
				label: "I'll go",
				id: "close"
			}]
		};
		else {
			if (npc.role === "cal") jackMet = true;
			if (npc.role === "sarah") restockKitchen();
			const line = npcLine(npc.role, npc.name, quest, lootedChests.has(91001) && lootedChests.has(91002), talkState());
			const v14x = v14Talk(npc.role, npc);
			if (v14x) {
				dialogue = v14x;
				phase = "dialogue";
				sync(true);
				return;
			}
			const q10x = q10Talk(npc.role, q10, snow >= 3, !!raid);
			if (q10x?.replace) Object.assign(line, q10x.replace);
			else if (q10x?.add) line.choices = [
				...line.choices.slice(0, -1),
				...q10x.add,
				...line.choices.slice(-1)
			];
			const q11x = q10x?.replace ? null : q11Talk(npc.role, q11, Q11C(), !!raid);
			if (q11x?.replace) Object.assign(line, q11x.replace);
			else {
				const extra = [
					...q11x?.add ?? [],
					...q11FarmChoices(npc.role),
					...v13TalkChoices(npc.role)
				];
				if (extra.length) line.choices = [
					...line.choices.slice(0, -1),
					...extra,
					...line.choices.slice(-1)
				];
			}
			if (rep <= -10) line.text = `You are not welcome here, and they do not pretend otherwise. ${line.text}`;
			line.choices = line.choices.map((choice) => {
				if (!choice.check) return choice;
				const chance = checkChance(skillOf(choice.check.skill) + fx13().talkBonus, choice.check.dc, rep, player.karma ?? 0);
				const skillName = SKILLS.find((s) => s.id === choice.check.skill)?.name ?? "Check";
				return {
					...choice,
					label: `${choice.label} · ${skillName} ${chance}%`
				};
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
		pushLog(!!player && player.bag.some((s) => s.qty > 0 && GEAR[s.id]?.family === family) ? `Put the ${name} in your hand. It is in your pack.` : `You need a ${name} in hand to ${mode === "chop" ? "fell that" : "mine that"}.`);
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
		const t = performance.now() / 1e3;
		const blobs = [
			[
				0,
				0,
				2.6
			],
			[
				-1.6,
				.8,
				1.5
			],
			[
				1.7,
				-.6,
				1.6
			],
			[
				.4,
				1.9,
				1.3
			],
			[
				-.8,
				-1.8,
				1.2
			],
			[
				2.4,
				1.4,
				1
			]
		];
		ctx.save();
		for (const [dx, dy, r] of blobs) {
			const raw = worldToScreen((f.tx + .5 + dx) * 64, (f.ty + .5 + dy) * 64, dcx, dcy);
			const p = zoomPoint(raw.sx, raw.sy);
			const rx = r * 64 * .78 * zoom, ry = rx * .5;
			const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, rx);
			g.addColorStop(0, "rgba(28,40,46,0.78)");
			g.addColorStop(.75, "rgba(34,48,54,0.62)");
			g.addColorStop(1, "rgba(40,52,56,0)");
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.ellipse(p.sx, p.sy, rx, ry, 0, 0, Math.PI * 2);
			ctx.fill();
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
		const cols = sheetCols(images.get(heroKey()));
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
	const ARMOR_ORDER = [
		["feet", "feetId"],
		["legs", "legsId"],
		["chest", "coatId"],
		["hands", "handsId"],
		["head", "headId"]
	];
	const TIER_OF = {
		poor: 1,
		standard: 2,
		good: 3,
		rare: 4
	};
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
		cv.width = img.width;
		cv.height = img.height;
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
			if (!images.get(n)) continue;
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
		const lean = lunge ? lungeOf(dir) : {
			x: 0,
			y: 0
		};
		const cols = sheetCols(img), rows = 8;
		const sw = img.width / cols, sh = img.height / rows;
		const fcols = sheetCols(bimg);
		let frac = bimg.foot ?? .92;
		if (bimg.feet) {
			const f = bimg.feet[dir % 8 * fcols + frame % fcols];
			if (f) frac = f;
		}
		const dh = HERO_H * heroScale(body) * zoom;
		const dw = dh * (sw / sh);
		ctx.drawImage(armorSource(n, img), frame % cols * sw, dir % rows * sh, sw, sh, foot.sx + lean.x * zoom - dw / 2, foot.sy + lean.y * zoom - dh * frac, dw, dh);
	}
	function act0(n) {
		return n.split("-").slice(2).join("-");
	}
	/** v13: draw the player from the pl/* sheets with weapon, hit and down poses, plus armor layers. */
	function paintPlayerBody(flinch, drawCamX, drawCamY) {
		if (!plImg("walk") || !player) return false;
		const family = GEAR[player.weaponId]?.family;
		const gun = family === "carbine" || family === "revolver" || family === "scatter";
		const using = drawn > 0 || reach > 0 || swingAnim > 0 || intent?.kind === "attack";
		const moving = player.anim !== player.idleAnim;
		player.idleAnim = player.anim;
		let act = "walk";
		let frame = player.frame;
		let lunge = false;
		if (flinch) {
			act = flinch.name.slice(3);
			frame = flinch.frame;
		} else if (swingAnim > 0 && !work && gun && plImg("gun-atk")) {
			act = "gun-atk";
			frame = Math.min(3, Math.floor((.48 - swingAnim) * 1e3 / ANIM_MS.fire));
		} else if (swingAnim > 0 && !work && meleeFrame()) {
			const m = meleeFrame();
			if (m.move === "kick" || !plImg("axe")) {
				act = "walk";
				frame = Math.round(m.frame / (m.frames - 1) * 7);
				lunge = m.frame >= 2 && m.frame <= 4;
			} else {
				act = "axe";
				frame = Math.min(5, Math.floor(m.frame / m.frames * 6));
			}
		} else if (swingAnim > 0 && !work && plImg("axe")) {
			act = "axe";
			frame = Math.min(5, Math.floor((1 - swingAnim / .48) * 6));
		} else if (swingAnim > 0 && !work) {
			act = "walk";
			lunge = true;
		} else if (work && work.swing > .05 && plImg("axe")) {
			act = "axe";
			frame = Math.min(5, Math.floor((1 - Math.min(1, work.swing / .48)) * 6));
		} else if (!moving && gun && using && plImg("gun")) {
			act = "gun";
			frame = Math.floor(performance.now() / ANIM_MS.aim) % 4;
		} else if (!moving && plImg("idle")) {
			act = "idle";
			frame = Math.floor(performance.now() / ANIM_MS.idle) % 4;
		} else if (moving && v13Running() && plImg("run")) act = "run";
		blit(plImg(act) || plImg("walk"), player.x, player.y, HERO_H, true, frame, player.dir, drawCamX, drawCamY, lunge);
		paintArmor(act, frame, player.dir, drawCamX, drawCamY, lunge);
		if (swingAnim > 0 && !work && act === "walk") paintSwingArc();
		return true;
	}
	function heroActionPose() {
		if (phase === "dead" && plImg("down")) {
			if (!fellAt) fellAt = performance.now();
			const u = Math.min(1, (performance.now() - fellAt) / 520);
			return {
				name: plImg("down"),
				frame: u >= 1 ? 3 : Math.min(2, Math.floor(u * 3))
			};
		}
		if (player && player.hurt > 0 && plImg("hit") && !(swingAnim > 0 && !work)) return {
			name: plImg("hit"),
			frame: Math.min(2, Math.floor((1 - Math.min(1, player.hurt / .3)) * 3))
		};
		if (phase === "dead" && images.get("hero-down")) {
			if (!fellAt) fellAt = performance.now();
			const u = Math.min(1, (performance.now() - fellAt) / 520);
			return {
				name: "hero-down",
				frame: u >= 1 ? 3 : Math.min(2, Math.floor(u * 3))
			};
		}
		if (player && player.hurt > 0 && images.get("hero-hit") && !(swingAnim > 0 && !work)) return {
			name: "hero-hit",
			frame: 0
		};
		return null;
	}
	const LOOK_RGB = {
		wool: [
			140,
			98,
			66
		],
		spruce: [
			70,
			104,
			72
		],
		linen: [
			206,
			192,
			160
		],
		soot: [
			66,
			68,
			74
		]
	};
	const PIECE_RGB = {
		shirt: [
			196,
			168,
			122
		],
		patch: [
			124,
			84,
			60
		],
		linen: [
			210,
			196,
			160
		],
		wool: [
			146,
			96,
			58
		],
		"coat-std": [
			98,
			62,
			44
		],
		"coat-good": [
			78,
			44,
			38
		],
		vest: [
			176,
			140,
			86
		],
		quilt: [
			128,
			70,
			62
		],
		plate: [
			168,
			172,
			176
		],
		rig: [
			132,
			138,
			128
		],
		soft: [
			96,
			64,
			48
		],
		woolcap: [
			74,
			48,
			40
		],
		felt: [
			58,
			44,
			34
		],
		ironhat: [
			176,
			180,
			184
		],
		trousers: [
			70,
			56,
			46
		],
		chaps: [
			108,
			68,
			38
		],
		gloves: [
			92,
			66,
			48
		],
		bracers: [
			122,
			78,
			46
		],
		canvas: [
			184,
			156,
			108
		],
		waxed: [
			104,
			78,
			50
		],
		toque: [
			156,
			42,
			38
		],
		huntcap: [
			222,
			100,
			28
		],
		boots: [
			60,
			44,
			34
		]
	};
	const tinted = /* @__PURE__ */ new Map();
	/** Natural cloth dye. The pixel keeps its shading relative to the region's average brightness
	* (ref), but the region as a whole lands near the dye's own brightness, so a bright tan coat
	* dyed spruce becomes a dark forest green instead of lime. A little greying keeps it muted. */
	function dye(r, g, b, target, amt, ref = 0, mute = .18, contrast = .75) {
		const lum = r * .3 + g * .59 + b * .11;
		const tl = target[0] * .3 + target[1] * .59 + target[2] * .11 || 1;
		const rel = ref > 0 ? lum / ref : lum / tl;
		const scale = Math.max(.4, Math.min(1.35, contrast < .5 ? Math.pow(Math.max(rel, .05), contrast) : 1 + (rel - 1) * contrast));
		let nr = target[0] * scale, ng = target[1] * scale, nb = target[2] * scale;
		const top = Math.max(nr, ng, nb);
		if (top > 228) {
			const k = 228 / top;
			nr *= k;
			ng *= k;
			nb *= k;
		}
		const gl = nr * .3 + ng * .59 + nb * .11;
		nr += (gl - nr) * mute;
		ng += (gl - ng) * mute;
		nb += (gl - nb) * mute;
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
		const opts = {
			shirt: c.shirt,
			pants: c.legs,
			hat: c.head
		};
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
		if (!player.bag.some((s) => s.id === id)) player.bag.push({
			id,
			qty: 1
		});
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
			if (n > 20) boxes[row * cols + col] = {
				top,
				bottom,
				left,
				right
			};
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
				if (px[i + 3] < 40) continue;
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
					if (r > 148 && rg > 56 && gg > 72 && b > 42 && lum > 96 && by < .74) continue;
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
			if (colors.plate) for (let pass = 0; pass < 3; pass++) {
				const grow = mask.slice();
				for (let y = box.top + 1; y < box.bottom; y++) for (let x = box.left + 1; x < box.right; x++) {
					const mi = y * cw + x;
					if (mask[mi] === 2 || mask[mi] === 5) continue;
					if (px[((y0 + y) * stamp.width + (x0 + x)) * 4 + 3] < 40) continue;
					const by = (y - box.top) / bh;
					if (by < .28 || by > .6) continue;
					let n2 = 0;
					for (const d of [
						-1,
						1,
						-cw,
						cw,
						-cw - 1,
						-cw + 1,
						cw - 1,
						cw + 1
					]) if (mask[mi + d] === 2) n2++;
					if (n2 >= 5 || n2 >= 3 && mask[mi] === 0) grow[mi] = 2;
				}
				mask.set(grow);
			}
			const lumSum = [
				0,
				0,
				0,
				0,
				0,
				0
			], lumN = [
				0,
				0,
				0,
				0,
				0,
				0
			];
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
					let ls = 0, ln = 0;
					for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
						if (mask[(y + dy) * cw + x + dx] !== 2) continue;
						const j = ((y0 + y + dy) * stamp.width + (x0 + x + dx)) * 4;
						ls += orig[j] * .3 + orig[j + 1] * .59 + orig[j + 2] * .11;
						ln++;
					}
					const own = r * .3 + gg * .59 + b * .11;
					const l = ln ? ls / ln * .65 + own * .35 : own;
					next = dye(l, l, l, colors.plate, .94, ref[2], .6, .22);
				} else if (tag === 2 && colors.vest) next = dye(r, gg, b, colors.vest, .86, ref[2]);
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
		if (gasDist < 2560 * (1 + .06 * lv("mechanics")) * (v3.up.bench >= 2 ? 1.33 : 1)) return;
		train("mechanics", 4);
		gasDist = 0;
		takeItem("gas", 1);
		if (!carrying("gas")) {
			pushLog("The engine coughs and dies. Out of gas.");
			parkBike(false);
		} else sync(true);
	}
	function nearBike() {
		if (!world || !player || mounted || inside) return null;
		let best = null, bd = 130;
		for (const p of world.props) {
			if (p.kind !== "bike") continue;
			const c = propCenter(p), d = Math.hypot(c.x - player.x, c.y - player.y);
			if (d < bd) {
				bd = d;
				best = p;
			}
		}
		return best;
	}
	function mountBike(prop) {
		l1.crouch = false;
		if (!player || prop.kind !== "bike") return;
		const why = rideBlock(prop);
		if (why) {
			pushLog(why);
			intent = null;
			sfx("click");
			sync(true);
			return;
		}
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
		if (images.get("v2/bike-ride")) {
			blit("v2/bike-ride", x, y, 76, true, Math.floor(performance.now() / 80) % 6, dir % 8, dcx, dcy);
			return;
		}
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
		berries: "apple",
		mushrooms: "apple",
		chowder: "smokedfish",
		venisonsteak: "meat",
		pie: "apple",
		coffee: "cider",
		tonic: "dandelion",
		trout: "smokedfish",
		snare: "wire",
		grokclaw: "antlers",
		levergun: "winchester",
		dalekey: "lockpick",
		roycap: "toque",
		spirits: "cider",
		"bag-sack": "backpack",
		"bag-hide": "sling",
		"bag-frame": "packframe",
		gas: "fuel",
		carburetor: "oil",
		chain: "wire",
		engine: "packframe",
		gastank: "fuel",
		sparkplug: "matches",
		tire: "pelt",
		medicine: "kit",
		bone: "antlers",
		steeltrap: "wire",
		greens: "dandelion",
		water: "cider",
		"carbine-std": "carbine",
		"carbine-good": "carbine",
		scoped: "scoped",
		"knife-std": "knife",
		"knife-good": "knife",
		skin: "knife",
		"hatchet-std": "hatchet",
		"hatchet-good": "hatchet",
		"pick-std": "pick",
		"pick-good": "pick",
		"bandage-std": "bandage",
		"bandage-good": "bandage",
		"lockpick-std": "lockpick",
		"lockpick-good": "lockpick",
		"coat-std": "wool",
		"coat-good": "wool",
		patch: "wool",
		linen: "linen",
		"boots-std": "boots"
	};
	/** Doors painted on the building art (source-image px): q = the doorway outline TL, TR, BR, BL;
	* g = the ground spot in front of it where the hero stands to go in. Keyed by image (the
	* shelter uses the shack art). The workshop art (anvil on a stump) has no door. */
	const PAINTED_DOORS = {
		shack: {
			q: [
				[49, 93],
				[71, 99],
				[71, 156],
				[49, 150]
			],
			g: [60, 166]
		},
		barn: {
			q: [
				[51, 111],
				[64, 114],
				[64, 148],
				[51, 152]
			],
			g: [57, 162]
		},
		farmhouse: {
			q: [
				[58, 146],
				[67, 147],
				[67, 172],
				[58, 171]
			],
			g: [40, 196]
		},
		ruin: {
			q: [
				[31, 73],
				[39, 72],
				[39, 96],
				[31, 98]
			],
			g: [35, 108]
		}
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
		return {
			x: oy + ox / 2,
			y: oy - ox / 2
		};
	}
	function doorPoint(prop) {
		const spec = PROP_SPEC[prop.kind];
		const c = propCenter(prop);
		const painted = PAINTED_DOORS[spec?.image];
		const off = painted && houseArtToWorld(prop.kind, painted.g[0], painted.g[1]);
		if (off && world) {
			const x = c.x + off.x, y = c.y + off.y;
			if (!pointBlocked(world, x, y, 12)) return {
				x,
				y
			};
			for (let r = 6; r <= 72; r += 6) for (const [ax, ay] of [
				[0, 1],
				[-1, 0],
				[-.7, .7],
				[1, 0],
				[.7, .7],
				[-.7, -.7],
				[0, -1],
				[.7, -.7]
			]) if (!pointBlocked(world, x + ax * r, y + ay * r, 12)) return {
				x: x + ax * r,
				y: y + ay * r
			};
			return {
				x,
				y
			};
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
		if (mounted) {
			parkBike(false);
			pushLog("You leave the bike by the door. No riding indoors.");
		}
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
		if (!world) return {
			x,
			y
		};
		const t = tileOf(x, y);
		const free = (tx, ty) => tx >= 0 && ty >= 0 && tx < 156 && ty < 156 && !cellBlocked(world, tx, ty);
		const roomy = (tx, ty) => {
			if (!free(tx, ty)) return false;
			const seen = /* @__PURE__ */ new Set([ty * 156 + tx]);
			const q = [[tx, ty]];
			while (q.length && seen.size < 60) {
				const [cx, cy] = q.shift();
				for (const [ax, ay] of [
					[cx + 1, cy],
					[cx - 1, cy],
					[cx, cy + 1],
					[cx, cy - 1]
				]) {
					const k = ay * 156 + ax;
					if (seen.has(k) || !free(ax, ay)) continue;
					seen.add(k);
					q.push([ax, ay]);
				}
			}
			return seen.size >= 60;
		};
		const standable = (px, py) => !pointBlocked(world, px, py, RADIUS + 2);
		for (const k of [
			18,
			30,
			44,
			60
		]) {
			const ty2 = tileOf(x, y + k);
			if (standable(x, y + k) && roomy(ty2.tx, ty2.ty)) return {
				x,
				y: y + k
			};
		}
		for (let r = 1; r <= 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
			if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
			const px = (t.tx + dx + .5) * 64, py = (t.ty + dy + .5) * 64;
			if (standable(px, py) && roomy(t.tx + dx, t.ty + dy)) return {
				x: px,
				y: py
			};
		}
		return {
			x,
			y: y + 18
		};
	}
	function leaveHouse() {
		if (!player || !inside) return;
		const out = clearOutside(inside.backX, inside.backY);
		player.x = out.x;
		player.y = out.y;
		justLeft = {
			id: inside.id,
			x: out.x,
			y: out.y,
			t: performance.now()
		};
		inside = null;
		intent = null;
		opening = null;
		holdWalk = false;
		pushLog("You step back outside.");
		sync(true);
	}
	function useFarm(prop) {
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
		return (inside && world?.props.find((p) => p.id === inside.id))?.kind === "farmhouse" ? {
			w: 400,
			h: 280,
			farm: true
		} : {
			w: 320,
			h: 240,
			farm: false
		};
	}
	function roomScale() {
		const d = roomDims();
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
		return {
			cx: d.w / 2,
			bottom: d.h,
			x0: d.w / 2 - 52,
			x1: d.w / 2 + 52,
			y0: d.h - 64,
			y1: d.h + 12
		};
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
		if (isGun(familyHit)) {
			dmg = Math.round(dmg * (1 + .04 * lv("marksmanship")));
			train("marksmanship", 2);
		}
		{
			const crit = fx13().critPct + (isGun(familyHit) && perk13("marksmanship", 6) ? 5 : 0);
			if (Math.random() * 100 < crit) {
				dmg = Math.round(dmg * (isGun(familyHit) && perk13("marksmanship", 9) ? 2 : 1.6));
				floater(player.x, player.y - 60, "Crit!");
			}
		}
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
			const kept13 = pile.title === "Dropped" || pile.title === "Farm stash" || pile.title === "Your pack";
			if (!hasLoot(pile) || !kept13 && clock - pile.at >= 720) {
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
		} else {
			addStack(items, "meat", enemy.kind === "moose" ? 3 : enemy.kind === "deer" ? 2 : 1);
			addStack(items, "bone", enemy.kind === "moose" ? 3 : enemy.kind === "deer" ? 2 : 1);
			if (enemy.kind === "wolf" || enemy.kind === "deer" || enemy.kind === "moose") addStack(items, "hide", 1);
			if (enemy.kind === "moose") scrap += 2;
		}
		leavePile(enemy.x, enemy.y, bodyTitle(enemy.kind), items, scrap, enemy.kind, enemy.dir);
		const pile = piles[piles.length - 1];
		if (pile && pile.body === enemy.kind) {
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
		if (enemy.id === 90003) {
			wardenState = 3;
			pushLog("The gate is yours. His vest and his pump gun are on him.");
		}
		if (enemy.id === 90001) pushLog("The old bull of Holeb lies in the snow. They will talk about this in Lowelltown.");
		if (enemy.id === 90002) pushLog("Her lantern rolls into the water and goes out. The mill is quiet.");
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
			vacate(world, prop);
			world.props = world.props.filter((q) => q !== prop);
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
			pile.dressed = true;
			v3.stats.dressed += 1;
			train("hunting", 4);
			achieve("dress");
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
		const mv = meleeStart();
		if (mv) {
			player.dir = facing8(enemy.x - player.x, enemy.y - player.y);
			pendingHit = {
				enemy,
				at: mv.hitMs / 1e3
			};
			return;
		}
		strikeLand(enemy);
	}
	/** v14.1: melee move tables (ms per frame, 1-based hit frame). */
	const MELEE = {
		punch: {
			ms: [
				70,
				60,
				50,
				90,
				70,
				80
			],
			hit: 4
		},
		kick: {
			ms: [
				80,
				70,
				50,
				100,
				70,
				80,
				90
			],
			hit: 4
		},
		swing: {
			ms: [
				90,
				80,
				70,
				40,
				90,
				70,
				80,
				90
			],
			hit: 5
		}
	};
	let pendingHit = null;
	let talkNag141 = 0;
	let melee = null;
	let meleeCount = 0;
	function meleeStart() {
		if (!player) return null;
		const fam = GEAR[player.weaponId]?.family;
		if (isGun(fam)) return null;
		const move = !player.weaponId || !fam || fam === "fist" ? ++meleeCount % 3 === 0 ? "kick" : "punch" : "swing";
		const t = MELEE[move];
		const total = t.ms.reduce((a, b) => a + b, 0);
		const hitMs = t.ms.slice(0, t.hit - 1).reduce((a, b) => a + b, 0);
		melee = {
			move,
			t0: performance.now(),
			total
		};
		swingAnim = total / 1e3;
		player.cooldown = Math.max(player.cooldown, total / 1e3);
		return {
			move,
			hitMs,
			total
		};
	}
	/** Current melee frame from the move's timing table, or null when no move is playing. */
	function meleeFrame() {
		if (!melee) return null;
		const t = MELEE[melee.move];
		let e = performance.now() - melee.t0;
		if (e >= melee.total) {
			melee = null;
			return null;
		}
		let f = 0;
		while (f < t.ms.length - 1 && e >= t.ms[f]) {
			e -= t.ms[f];
			f++;
		}
		return {
			move: melee.move,
			frame: f,
			frames: t.ms.length,
			hit: f === t.hit - 1
		};
	}
	function pendingTick(dt) {
		if (!pendingHit) return;
		pendingHit.at -= dt;
		if (pendingHit.at > 0) return;
		const e = pendingHit.enemy;
		pendingHit = null;
		if (!player || e.dead) return;
		if (Math.hypot(e.x - player.x, e.y - player.y) > swingOf().reach * 1.6 + 24) {
			floater(e.x, e.y - 28, "miss");
			return;
		}
		strikeLand(e);
	}
	function strikeLand(enemy) {
		if (!player || enemy.dead) return;
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
		const sneak141 = l1.crouch && !enemy.aggro && enemy.temper !== "timid";
		emitNoise(isGun(familyNow) ? NOISE.gun : NOISE.melee);
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
		if (sneak141) {
			dmg = Math.round(dmg * SNEAK_MULT);
			floater(enemy.x, enemy.y - 44, "Sneak attack");
			pushLog(`Sneak attack: ${dmg}.`);
			train("sneak", 4);
		}
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
		if (npc.id === 990) {
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
			if (biter && curDay() >= 2 && Math.random() < .04 * (1 - fx13().sickResist) * (perk13("firstaid", 3) ? .5 : 1)) catchAil("cut", `The ${biter.kind} got its teeth in you.`);
			if (dmg >= player.maxHp * .3 && Math.random() < .12) catchAil("bone", "That hit cracked something.");
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
		if (player.hp <= 0 && raid?.defend) {
			defendLost14("You go down at the gate.");
			sync(true);
			return;
		}
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
			player.ease = Math.min(1, (player.ease ?? 1) + dt / .14);
			const e = player.ease;
			speed *= .35 + .65 * e * e * (3 - 2 * e);
			player.easeT = performance.now();
		}
		const { vx, vy } = screenDirToWorld(ux * speed * dt, uy * speed * dt);
		return slide(body, vx, vy);
	}
	function slide(body, dx, dy) {
		if (!world) return false;
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
		let aimX = screen.dsx, aimY = screen.dsy;
		if (path.length > 1 && sd < 30) {
			const n2 = worldVelToScreen(path[1].x - body.x, path[1].y - body.y);
			const t = 1 - sd / 30, m2 = Math.hypot(n2.dsx, n2.dsy) || 1;
			aimX = screen.dsx / sd * (1 - t) + n2.dsx / m2 * t;
			aimY = screen.dsy / sd * (1 - t) + n2.dsy / m2 * t;
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
		if (!legacyTravel() || mapId >= 3) {
			openWorldMap();
			return true;
		}
		if (mapId === 2) {
			travelTo(0, () => {
				const s = skowSign();
				return {
					x: s.x + 90,
					y: s.y + 60
				};
			});
			return true;
		}
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
		if (phase === "worldmap") {
			wmTick(dt);
			prevHeld = currentHeld();
			clearEdges();
			return;
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
		pendingTick(dt);
		v14Tick();
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
		const shoeT = tileOf(player.x, player.y);
		const shoes = player.feetId === "snowshoes" && world.tiles[shoeT.ty * 156 + shoeT.tx] === 4 ? 1.22 : 1;
		const wx = weather13();
		const hardy = perk13("survival", 9) && w13.weather.id === "noreaster" ? 1 : wx.speed;
		const pace = (mounted ? SCREEN_SPEED * 2 * Math.max(.4, wx.bike) : (player.stamina > 0 ? SCREEN_SPEED : SCREEN_SPEED * .45) * hardy * ailSpeed() * needsSpeed() * (setBonus13()?.quality === "standard" ? 1.05 : 1)) * (mounted ? 1 : shoes);
		const pace141 = pace * (l1.crouch && !mounted ? CROUCH_SPEED : 1);
		const fromX = player.x;
		const fromY = player.y;
		tickWork(dt);
		if (!stickMove(pace141, dt)) autoTick();
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
		noiseTick(dt, stepDist > .45);
		dropTick();
		prodTick(dt);
		if (stepDist <= .45 && performance.now() - (player.easeT ?? 0) > 60) player.ease = 0;
		if (stepDist > .45 && !swinging) {
			player.dir = facing8Hys(player.dir, player.x - fromX, player.y - fromY);
			const mdx = player.x - fromX, mdy = player.y - fromY;
			const scr = Math.hypot(mdx - mdy, (mdx + mdy) / 2) / Math.max(dt, .001);
			const run = scr > SCREEN_SPEED * 1.15;
			const ms = (run ? ANIM_MS.run : ANIM_MS.walk) / Math.max(.6, Math.min(1.5, scr / (run ? SCREEN_SPEED * 1.4 : SCREEN_SPEED)));
			const cols = sheetCols(images.get(heroKey()));
			player.anim += dt * 1e3 / ms * (cols === 8 ? 11 : 22);
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
			player.frame = work && work.fall > 0 ? 1 : reach > 0 ? 2 : 0;
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
		if (!turnBased) {
			for (const npc of world.npcs) if (!guardPost.has(npc.id)) stepFolk(npc, dt);
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
			if (enemy.hollow) {
				stepHollow(enemy, dt, dist);
				continue;
			}
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
			const sight = enemy.kind === "coyote" ? 150 : enemy.kind === "wolf" ? 210 * (nightShade(clock) > .22 ? 1.5 : 1) * (seasonNow() === 3 ? 1.25 : 1) : 190;
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
				if (isRaider(enemy) && enemy.variant !== "jumper" && enemy.cooldown <= 0) for (const p of world.props) {
					if (!BROKEN[p.kind] || String(p.kind).endsWith("-x")) continue;
					const c = propCenter(p);
					if (Math.hypot(c.x - enemy.x, c.y - enemy.y) > (isWall14(p.kind) || p.kind === "sandbags" ? 96 : 54)) continue;
					hurtProp(p, enemy.variant === "armor" || enemy.variant === "brute" || enemy.variant === "atv" ? 9 : 4);
					enemy.cooldown = .75;
					enemy.dir = facing8(c.x - enemy.x, c.y - enemy.y);
					break;
				}
				if (enemy.pathT <= 0 || !enemy.path) {
					enemy.path = pathTo(world, enemy.x, enemy.y, goalX, goalY);
					if (!enemy.path && enemy.raid) {
						const sg = siegeGoal14(enemy);
						if (sg) enemy.path = pathTo(world, enemy.x, enemy.y, sg.x, sg.y);
					}
					enemy.pathT = .45;
				}
				if (enemy.path) {
					enemy.path = follow(enemy, enemy.path, speed, dt, true);
					enemyMoving = true;
				}
				if (enemy.variant === "jumper") for (const p of world.props) {
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
			const raw = Math.hypot(n.x - player.x, n.y - player.y);
			if (raw >= maxDist) continue;
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
	const V2_WHO = {
		holt: "holt",
		cal: "jack",
		mira: "mira",
		nora: "nora",
		sarah: "sarah",
		cyndal: "cyndal",
		loki: "loki",
		marcel: "marcel",
		justin: "justin"
	};
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
		const guarding = !(body.role === "cyndal" || body.role === "loki") && id != null && guardPost.has(id);
		if (paintV2Folk(body, guarding, camX, camY)) return;
		const firing = guarding && (body.cooldown || 0) > .2;
		const guardName = firing ? `guard-${body.role}` : `guard-watch-${body.role}`;
		const posed = guarding && images.get(guardName) ? guardName : guarding && images.get(`guard-${body.role}`) ? `guard-${body.role}` : "";
		if (posed) {
			const breath = firing ? 1 : 1 + .018 * Math.sin(performance.now() / 520 + (id || 0));
			blit(posed, body.x, body.y, folkHeight(body), false, 0, 0, camX, camY, firing, 0, 0, breath);
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
		for (const e of world.enemies) if (!e.dead && e.aggro && e.kind === "bandit" && Math.hypot(e.x - body.x, e.y - body.y) < 640) return true;
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
		if (body.hp != null && body.hp <= 0 && has("down")) {
			act = "down";
			frame = 3;
		} else if (body._hitT && now - body._hitT < 360 && has("hit")) {
			act = "hit";
			frame = Math.min(2, Math.floor((now - body._hitT) / 120));
		} else if (guarding && !kid && has("gun")) {
			if ((body.cooldown || 0) > .2 && has("gun-atk")) {
				act = "gun-atk";
				frame = Math.min(3, Math.floor((1 - Math.min(1, body.cooldown)) * 4));
			} else {
				act = "gun";
				frame = Math.floor((now + seed) / 420) % 4;
			}
		} else if (kid && dangerNear(body) && has("crouch")) {
			act = "crouch";
			frame = Math.floor((now + seed) / 420) % 4;
		} else if (body.still === false) {
			act = player && body.ox != null && Math.hypot(player.x + body.ox - body.x, player.y + body.oy - body.y) > 160 && has("run") ? "run" : kid && body.ox != null && has("carry") ? "carry" : "walk";
			frame = (body.frame || 0) % 4 * 2 + (Math.floor((now + seed) / 110) & 1);
		} else if (k === "marcel" && talkNpc === body && dialogue && has("talk")) {
			act = "talk";
			frame = Math.floor(now / 260) % 4;
		} else if (has("idle")) {
			act = "idle";
			frame = Math.floor((now + seed) / 340) % 4;
		}
		blit(`v2/${k}-${act}`, body.x, body.y, folkHeight(body), true, frame, dir, camX, camY);
		return true;
	}
	/** v12: gw14 tree variants (pine2/3, spruce2/3 …) mixed in by a fixed per-tile hash; a third keep the old art. */
	const TREE_V2 = {
		"tree-pine": "pine",
		"tree-spruce": "spruce",
		"tree-fir": "spruce",
		"tree-birch": "birch",
		"tree-dead": "snag",
		"tree-bare": "snag",
		"tree-scrub": "bush",
		logs: "log"
	};
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
		else if (!v) k = [
			"scout",
			"gray",
			"blue"
		][Math.abs(enemy.id ?? 0) % 3];
		const n = k ? `v2/bandit-${k}-walk` : "";
		return n && images.get(n) ? n : "";
	}
	function beastSheetOld(enemy) {
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
	/** Full visible height (top of head/antlers to hooves) in inches. v13.2: moose 92 puts the shoulder at ~66 px (the sheet's shoulder sits at 76% of its height). */
	const BEAST_IN = {
		holeb: 120,
		grok: 98,
		warden: 74,
		collector: 77,
		pelletier: 67,
		fur: 76,
		saw: 74,
		armor: 75,
		mask: 72,
		brute: 77,
		shield: 72,
		atv: 91,
		jumper: 69,
		scout: 68,
		bear: 40,
		moose: 92,
		deer: 62,
		wolf: 34,
		coyote: 29,
		rabbit: 10,
		squirrel: 8,
		crow: 10
	};
	function beastH(enemy) {
		const key = enemy.variant && BEAST_IN[enemy.variant] ? enemy.variant : enemy.kind;
		const inches = BEAST_IN[key] ?? 70;
		return realH(beastSheet(enemy), inches);
	}
	const FOLK_IN = {
		justin: 74,
		sarah: 67,
		cyndal: 61.5,
		loki: 61,
		villager: 69,
		rejean: 72,
		cal: 71,
		pete: 73,
		warden: 74,
		bram: 72,
		emile: 70,
		gus: 69,
		holt: 73,
		ivo: 70,
		paul: 71,
		walter: 69,
		marcel: 70,
		adele: 66,
		sera: 66,
		mira: 65,
		nora: 66,
		ruth: 65,
		mae: 64,
		etta: 66
	};
	function folkHeight(npc) {
		return realH(folkSheet(npc), FOLK_IN[npc.role] ?? 69);
	}
	/** v13.5 real size: the parked tractor art is 83 px (rear wheel 50 px = 4.5 ft); the charge sheets match it. */
	const TRACTOR_DRIVE_H = 110, TRACTOR_RUN_H = 110;
	function tractorShift(charge) {
		const along = Math.min(1, Math.max(0, charge || 0)) * 460;
		return {
			x: along,
			y: -along * .2
		};
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
			return {
				x: (t.tx + .5) * 64,
				y: (t.ty + .5) * 64
			};
		}
		return null;
	}
	function raidHouse() {
		if (!world || mapId !== 0) return null;
		const fh = world.props.find((p) => p.kind === "farmhouse");
		if (!fh) return null;
		const c = propCenter(fh);
		return {
			x: c.x,
			y: c.y + 40
		};
	}
	function raidWaves(n) {
		return Math.min(6, 3 + Math.floor((n - 1) / 3) + moon13().waves);
	}
	function raidCanStart() {
		if (!player || !world || raid || inside || snow < 3 || mapId !== 0 || !ok14()) return false;
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
	const COMPASS = [
		"east",
		"south-east",
		"south",
		"south-west",
		"west",
		"north-west",
		"north",
		"north-east"
	];
	function startRaid() {
		if (!raidCanStart() || !world || !player) return;
		raidNight += 1;
		const n = raidNight;
		for (const e of world.enemies) if (!e.dead && isRaider(e) && !e.quest) {
			e.dead = true;
			e.death = 0;
		}
		raid = {
			night: n,
			wave: 0,
			waves: raidWaves(n),
			phase: "lull",
			t: 7,
			left: 0,
			spawnT: 0,
			ang: Math.random() * Math.PI * 2,
			house: 120 + 15 * n,
			houseMax: 120 + 15 * n,
			warned: false,
			kills: 0
		};
		if (q11.farm.wall) {
			raid.house += 15 * q11.farm.wall;
			raid.houseMax += 15 * q11.farm.wall;
		}
		if (v3.up.palisade) {
			raid.house += 40 * v3.up.palisade;
			raid.houseMax += 40 * v3.up.palisade;
		}
		if (v3.up.lookout) {
			raid.t += 6 * v3.up.lookout;
			pushLog("From the lookout tower you see their lanterns early, way down the road.");
		}
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
			return {
				x: (t.tx + .5) * 64,
				y: (t.ty + .5) * 64
			};
		}
		return null;
	}
	function spawnRaider(variant, spot, boss = null) {
		const stats = variant === "armor" || variant === "brute" ? [
			46,
			8,
			16
		] : variant === "shield" ? [
			36,
			6,
			12
		] : variant === "atv" ? [
			28,
			7,
			14
		] : variant === "torch" ? [
			22,
			5,
			10
		] : variant === "jumper" ? [
			16,
			4,
			9
		] : [
			14,
			4,
			8
		];
		const label = {
			scout: "Scout",
			jumper: "Climber",
			armor: "Plate",
			shield: "Shield",
			brute: "Brute",
			torch: "Torch",
			atv: "Rider"
		};
		const hp = boss ? boss.hp : stats[0];
		world.enemies.push({
			id: world.nextEnemyId++,
			x: spot.x,
			y: spot.y,
			homeX: spot.x,
			homeY: spot.y,
			hp,
			maxHp: hp,
			atk: boss ? boss.atk : stats[1],
			xp: boss ? boss.xp : stats[2],
			elite: !!boss || variant === "armor" || variant === "brute",
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
			name: boss ? boss.name : label[variant] || "Raider",
			slow: 0,
			death: 0,
			raid: true
		});
	}
	function stepRaidNight(dt, raiders) {
		if (!raid || !player || !world) return;
		const fh = raidHouse();
		if (!fh) {
			endRaid(false, "The raid breaks off.");
			return;
		}
		if (nightShade(clock) < .12 && !raid.siege && !raid.defend) {
			endRaid(!inside, inside ? "Dawn. You sat it out behind the door. The raiders drift off with what they could carry." : "Dawn comes up grey over the orchard. They pull back to the road.");
			return;
		}
		if (raid.house <= 0 && raid.defend) {
			defendLost14("They break the farmhouse door.");
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
				const dir = [
					"east",
					"south-east",
					"south",
					"south-west",
					"west",
					"north-west",
					"north",
					"north-east"
				][(Math.round(raid.ang / (Math.PI / 4)) % 8 + 8) % 8];
				if (world.npcs.some((m) => m.role === "cyndal")) pushLog(`Cyndal, from the loft: "Dad! Lanterns to the ${dir}! Here they come!"`);
				else pushLog(`Lanterns to the ${dir}.`);
				sfx("click");
			}
			if (raid.t <= 0) {
				raid.wave += 1;
				raid.phase = "wave";
				raid.left = 2 + raid.wave + Math.floor(raid.night / 2);
				if (raid.defend) {
					v14.defendWave = raid.wave - 1;
					world.props.filter((p) => p.f14 || p.p14).map((p) => ({
						p,
						k: p.kind,
						hp: p.hp
					}));
				}
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
				const boss = raid.wave === raid.waves && raid.left === 1 && raid.night % 5 === 0 ? raid.night >= 15 ? {
					variant: "saw",
					name: "Gil Michaud",
					hp: 90,
					atk: 12,
					xp: 40
				} : raid.night >= 10 ? {
					variant: "mask",
					name: "René Gallant",
					hp: 74,
					atk: 10,
					xp: 32
				} : {
					variant: "fur",
					name: "Harland Poulin",
					hp: 64,
					atk: 9,
					xp: 28
				} : null;
				const pool = raidPool(raid.night, raid.wave);
				const variant = boss ? boss.variant : pool[Math.floor(Math.random() * pool.length)];
				const spot = raidSpawnAt(fh.x, fh.y, raid.ang, 832, 1088) || raidSpawnAt(fh.x, fh.y, raid.ang + Math.PI, 704, 960);
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
				if (raid.siege && !raid.collector) {
					v13SiegeTick(0);
					return;
				}
				if (raid.siege && !w13.main.collectorDown && world.enemies.some((e) => !e.dead && e.variant === "collector")) return;
				if (raid.defend) {
					defendWon14();
					return;
				}
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
				raid.waves += 1;
				raid.phase = "lull";
				raid.t = 8;
				raid.warned = false;
				raid.ang = Math.random() * Math.PI * 2;
				giveItem("shells", 4);
				pushLog(`Wave ${raid.wave} is down. More lanterns on the road. +4 shells.`);
				sync(true);
				return;
			}
			m11.waves = Math.max(0, raid.wave - 1);
			m11.kills = raid.kills;
			m11.score = raid.kills * 10 + m11.waves * 50;
			for (const e of world.enemies) if (!e.dead && e.raid) {
				e.dead = true;
				e.death = 0;
			}
			guardPost.clear();
			raid = null;
			raidMode = false;
			q11EndMode(false, why);
			return;
		}
		const n = raid.night;
		const summary = {
			won,
			night: n,
			kills: raid.kills,
			waves: raid.waves,
			wavesDone: won ? raid.waves : Math.max(0, raid.wave - 1),
			text: why
		};
		for (const e of world.enemies) if (!e.dead && e.raid) {
			e.dead = true;
			e.death = 0;
		}
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
		if (!wasSiege) report14(n);
		const span = DAY_LENGTH_SEC;
		const into = (clock % span + span) % span;
		clock = Math.floor(clock / span) * span + (into > span * 7 / 24 ? span : 0) + span * 7 / 24;
		saveGame();
		sync(true);
	}
	function stepRaid(dt) {
		if (!world || !player || inside) {
			guardPost.clear();
			return;
		}
		for (const prop of world.props) if (prop.flash > 0) prop.flash = Math.max(0, prop.flash - dt);
		const here = tileOf(player.x, player.y);
		const nearPost = world.props.some((p) => (DEFENSE[p.kind] || LURE.has(p.kind) || p.kind === "tractor" || p.kind === "farmhouse") && Math.hypot(propCenter(p).x - player.x, propCenter(p).y - player.y) < 720);
		const dark = nightShade(clock) > .22;
		const onFarm = inFarm(here.tx, here.ty) || nearPost;
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
		if (!dark) nightLatch = false;
		const night = dark && onFarm && !!raid || !!raid && !inside;
		const raiders = world.enemies.filter((e) => !e.dead && isRaider(e));
		if (raid) {
			spikesTick14(dt, raiders);
			stepRaidNight(dt, raiders);
		}
		if (!world || !player) return;
		if (night && tractorReady) {
			const tractor = world.props.find((p) => p.kind === "tractor");
			if (tractor) {
				tractor.charge = Math.min(1, (tractor.charge || 0) + dt * .22);
				const shift = tractorShift(tractor.charge);
				const c = propCenter(tractor);
				for (const e of raiders) if (Math.hypot(e.x - (c.x + shift.x), e.y - (c.y + shift.y)) < 64) {
					e.hp -= 16 * dt;
					e.hurt = .1;
					e.slow = .3;
					if (e.hp <= 0) markDead(e, e.xp);
				}
				if (tractor.charge >= 1) {
					tractor.charge = 0;
					tractorReady = false;
					pushLog("The tractor coughs and stops. It wants another can.");
				} else if (particles.length < 120) {
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
		if (!raid && raidClock <= 0 && raiders.length < cap && !(mapId === 0 && v14.st < 99)) {
			raidClock = 14 + Math.random() * 8;
			const pool = ["scout"];
			if (raidNight >= 2) pool.push("jumper", "scout");
			if (raidNight >= 3) pool.push("torch");
			if (raidNight >= 4) pool.push("shield", "brute");
			if (raidNight >= 6) pool.push("armor");
			if (raidNight >= 7) pool.push("atv");
			const variant = pool[Math.floor(Math.random() * pool.length)];
			const spot = raidSpawn(448, 704);
			if (spot) {
				const { x, y } = spot;
				const stats = variant === "armor" || variant === "brute" ? [
					46,
					8,
					16
				] : variant === "shield" ? [
					36,
					6,
					12
				] : variant === "atv" ? [
					28,
					7,
					14
				] : variant === "torch" ? [
					22,
					5,
					10
				] : variant === "jumper" ? [
					16,
					4,
					9
				] : [
					14,
					4,
					8
				];
				world.enemies.push({
					id: world.nextEnemyId++,
					x,
					y,
					homeX: x,
					homeY: y,
					hp: stats[0],
					maxHp: stats[0],
					atk: stats[1],
					xp: stats[2],
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
					name: {
						scout: "Scout",
						jumper: "Climber",
						armor: "Plate",
						shield: "Shield",
						brute: "Brute",
						torch: "Torch",
						atv: "Rider"
					}[variant] || "Raider",
					slow: 0,
					death: 0
				});
				if (raiders.length === 0) {
					pushLog("Lanterns at the orchard edge. They are coming in.");
					if (world.npcs.some((n) => n.role === "cyndal")) pushLog("Cyndal, from the loft: \"Lanterns coming, Dad! Here they come!\"");
					if (world.npcs.some((n) => n.role === "loki")) pushLog("Loki stays in the farmhouse with the door barred, running shells and lanterns to the porch.");
				}
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
		for (const n of world.npcs) if (GUARD_ROLES.has(n.role) && Math.hypot(n.x - player.x, n.y - player.y) < 4200) crew.push(n);
		guardPost.clear();
		const spots = posts.map((p) => ({
			id: p.id,
			c: propCenter(p),
			real: true
		}));
		const fh = raid ? raidHouse() : null;
		if (fh) {
			const ring = [
				[-150, 120],
				[150, 120],
				[-190, -40],
				[190, -40],
				[0, 190]
			];
			for (let k = 0; spots.length < crew.length && k < ring.length; k++) spots.push({
				id: -100 - k,
				c: {
					x: fh.x + ring[k][0],
					y: fh.y + ring[k][1]
				},
				real: false
			});
		}
		for (let i = 0; i < spots.length && i < crew.length; i++) {
			const who = crew[i];
			const spot = spots[i];
			const id = who.id ?? who.homeId;
			guardPost.set(id, spot.id);
			const c = spot.c;
			const dx = c.x - who.x;
			const dy = c.y - who.y;
			if (Math.hypot(dx, dy) > 28) {
				const screen = worldVelToScreen(dx, dy);
				moveBody(who, screen.dsx, screen.dsy, 78, dt);
				const vel = screenDirToWorld(screen.dsx, screen.dsy);
				who.dir = facing8(vel.vx, vel.vy);
				who.anim = (who.anim || 0) + dt * 8;
				who.frame = Math.floor(who.anim) % 4;
			} else if (raid) {
				let foe = null;
				let foeD = 400;
				for (const e of raiders) {
					const d = Math.hypot(e.x - who.x, e.y - who.y);
					if (d < foeD) {
						foe = e;
						foeD = d;
					}
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
						v3Noise(player.x, player.y, 896);
						if (foe.hp <= 0) markDead(foe, Math.max(1, Math.round(foe.xp * .5)));
					}
				}
				who.cooldown = who.flashT > 0 ? .4 : 0;
				who.anim = (who.anim || 0) + dt;
			} else {
				const foe = raiders[0];
				if (foe) who.dir = facing8(foe.x - who.x, foe.y - who.y);
				who.cooldown = (who.anim || 0) % .8 < .12 ? .4 : 0;
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
			npc.anim += dt * 1e3 / (ANIM_MS.walk / Math.max(.6, Math.min(1.5, stepped / Math.max(dt, .001) / 120))) * 16;
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
	const artBase = /* @__PURE__ */ new Map();
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
		return sy >= -dh * (house.foot ?? .92) + b / house.height * dh - 3;
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
		const ang = [
			Math.PI / 2,
			Math.PI * .75,
			Math.PI,
			Math.PI * 1.25,
			Math.PI * 1.5,
			Math.PI * 1.75,
			0,
			Math.PI * .25
		][player.dir & 7];
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
		const dh = d.farm ? 111 : 99;
		if (img) {
			const dw = dh * (img.width / img.height);
			ctx.drawImage(img, o.x + d.w / 2 - dw / 2, o.y + d.h - 4 - dh, dw, dh);
		}
		ctx.fillStyle = "#efe6d4";
		ctx.font = "700 16px Source Sans 3, sans-serif";
		ctx.textAlign = "center";
		ctx.lineWidth = 3;
		ctx.strokeStyle = "rgba(10, 8, 6, 0.75)";
		ctx.strokeText("Door ↓", o.x + d.w / 2, o.y + d.h - dh - 10);
		ctx.fillText("Door ↓", o.x + d.w / 2, o.y + d.h - dh - 10);
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
		if (art) ctx.drawImage(art, o.x, o.y, 320, 240);
		else {
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
		ctx.drawImage(src, col * sw, row * sh, sw, sh, o.x + inside.rx - dw / 2, o.y + inside.ry - dh * (img.feet ? img.feet[player.dir % rows * cols + player.frame % cols] : img.foot ?? .92), dw, dh);
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
			ctx.drawImage(src, col * sw, row * sh, sw, sh, o.x + inside.rx - dw / 2, o.y + inside.ry - dh * (img.feet ? img.feet[player.dir % rows * cols + player.frame % cols] : img.foot ?? .92), dw, dh);
		}
	}
	var groundPat = /* @__PURE__ */ new Map();
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
		const ax = Math.abs(wx - 80);
		const ay = Math.abs(wy - 78);
		const s3 = 1.7320508075688772;
		return Math.min(74 - (ay + ax / s3), s3 * .5 * 74 - ax);
	}
	function edgeWave(tx, ty) {
		const n = (ix, iy) => {
			let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263);
			h = Math.imul(h ^ h >>> 13, 1274126177);
			return (h >>> 0) % 1e3 / 999;
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
		const h = (total % span + span) % span / span * 24;
		const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
		const DUSK = .64, DEEP = .82;
		if (h >= 7 && h < 17) return 0;
		if (h >= 17 && h < 21) return DUSK * ease((h - 17) / 4);
		if (h >= 21) return DUSK + .17999999999999994 * ease((h - 21) / 5);
		if (h < 2) return DUSK + .17999999999999994 * ease((h + 3) / 5);
		if (h < 4) return DEEP;
		return DEEP * (1 - ease((h - 4) / 3));
	}
	const LIT_BUILDINGS = {
		farmhouse: [
			150,
			-58,
			.8
		],
		shack: [
			110,
			-53,
			.65
		],
		workshop: [
			90,
			-18,
			.65
		],
		stall: [
			110,
			-36,
			.7
		],
		barn: [
			120,
			-79,
			.55
		],
		"post-porch": [
			90,
			-22,
			.75
		],
		"post-loft": [
			90,
			-55,
			.6
		]
	};
	const FIRES = {
		campfire: 230,
		firepot: 170,
		"firepot-up": 180,
		"firepot-3": 190
	};
	let nightCv = null;
	/** Darkness layer with holes cut around light sources, then a warm additive glow on top. */
	function paintNight(dark, camXd, camYd) {
		if (!world || !player || !ctx) return;
		const scale = .5;
		const w = Math.max(1, Math.ceil(viewW * scale)), h = Math.max(1, Math.ceil(viewH * scale));
		if (!nightCv) nightCv = document.createElement("canvas");
		if (nightCv.width !== w || nightCv.height !== h) {
			nightCv.width = w;
			nightCv.height = h;
		}
		const lg = nightCv.getContext("2d");
		if (!lg) return;
		const lights = [];
		const at = (wx, wy) => {
			const r = worldToScreen(wx, wy, camXd, camYd);
			return zoomPoint(r.sx, r.sy);
		};
		const t = performance.now() / 1e3;
		const flick = (k) => 1 + Math.sin(t * 9 + k) * .04 + Math.sin(t * 23 + k * 3) * .03;
		const pp = at(player.x, player.y - 40);
		lights.push({
			x: pp.sx,
			y: pp.sy,
			r: (120 + Math.min(10, perc()) * 9) * zoom * (carrying("lantern") ? 1.7 : 1),
			a: carrying("lantern") ? .95 : .8,
			warm: carrying("lantern") ? .55 : .3
		});
		const margin = 320 * zoom;
		for (const e of world.enemies) {
			if (e.variant !== "pelletier" || e.dead) continue;
			const q = at(e.x, e.y - 30);
			if (q.sx < -margin || q.sy < -margin || q.sx > viewW + margin || q.sy > viewH + margin) continue;
			lights.push({
				x: q.sx,
				y: q.sy,
				r: 150 * zoom * flick(e.id),
				a: .85,
				warm: .75
			});
		}
		for (const prop of world.props) {
			if (!explored[prop.ty * 156 + prop.tx]) continue;
			const fire = FIRES[prop.kind] ?? ((prop.burn || 0) > 0 ? 200 : 0);
			const lit = LIT_BUILDINGS[prop.kind];
			if (!fire && !lit) continue;
			const c = propCenter(prop);
			const q = at(c.x, c.y);
			if (q.sx < -margin || q.sy < -margin || q.sx > viewW + margin || q.sy > viewH + margin) continue;
			if (fire) lights.push({
				x: q.sx,
				y: q.sy - 20 * zoom,
				r: fire * zoom * flick(prop.id || 0),
				a: 1,
				warm: .5
			});
			else lights.push({
				x: q.sx,
				y: q.sy + lit[1] * zoom,
				r: lit[0] * zoom,
				a: lit[2],
				warm: .5
			});
		}
		for (const e of world.enemies) {
			if (e.dead || e.variant !== "torch" && e.variant !== "atv") continue;
			const tt = tileOf(e.x, e.y);
			if (!visible[tt.ty * 156 + tt.tx]) continue;
			const q = at(e.x, e.y - 40);
			lights.push({
				x: q.sx,
				y: q.sy,
				r: (e.variant === "atv" ? 150 : 160) * zoom * flick(e.id),
				a: .9,
				warm: .55
			});
		}
		lg.setTransform(1, 0, 0, 1, 0, 0);
		lg.globalCompositeOperation = "source-over";
		lg.clearRect(0, 0, w, h);
		if (gfxHigh) {
			const u = Math.min(1, dark / .7);
			lg.fillStyle = `rgba(${Math.round(30 - 26 * u)}, ${Math.round(18 - 10 * u)}, ${Math.round(40 - 18 * u)}, ${dark})`;
		} else lg.fillStyle = `rgba(4, 8, 22, ${dark})`;
		lg.fillRect(0, 0, w, h);
		lg.globalCompositeOperation = "destination-out";
		for (const L of lights) {
			const x = L.x * scale, y = L.y * scale, r = Math.max(4, L.r * scale);
			const g = lg.createRadialGradient(x, y, 0, x, y, r);
			if (gfxHigh) for (const [st, k] of [
				[0, 1],
				[.2, .92],
				[.4, .72],
				[.6, .45],
				[.8, .18],
				[1, 0]
			]) g.addColorStop(st, `rgba(0,0,0,${L.a * k})`);
			else {
				g.addColorStop(0, `rgba(0,0,0,${L.a})`);
				g.addColorStop(.55, `rgba(0,0,0,${L.a * .6})`);
				g.addColorStop(1, "rgba(0,0,0,0)");
			}
			lg.fillStyle = g;
			lg.fillRect(x - r, y - r, r * 2, r * 2);
		}
		ctx.save();
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(nightCv, 0, 0, viewW, viewH);
		ctx.globalCompositeOperation = "lighter";
		for (const L of lights) {
			const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r * .8);
			if (gfxHigh) {
				const a = L.warm * dark * .95;
				g.addColorStop(0, `rgba(255, 196, 120, ${a})`);
				g.addColorStop(.15, `rgba(255, 168, 80, ${a * .8})`);
				g.addColorStop(.45, `rgba(240, 120, 50, ${a * .35})`);
				g.addColorStop(1, "rgba(200,80,30,0)");
			} else {
				g.addColorStop(0, `rgba(255, 160, 70, ${L.warm * dark * .95})`);
				g.addColorStop(1, "rgba(0,0,0,0)");
			}
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
			const rdt = Math.min(.05, Math.max(.001, (renderNow - (lastCamT || renderNow)) / 1e3 || STEP));
			lastCamT = renderNow;
			const vx = player.x - (camPX ?? player.x), vy = player.y - (camPY ?? player.y);
			camPX = player.x;
			camPY = player.y;
			const v = worldVelToScreen(vx, vy);
			const sp = Math.hypot(v.dsx, v.dsy) / rdt;
			const la = Math.min(1, sp / 220);
			lookX += ((sp > 1 ? v.dsx / (Math.hypot(v.dsx, v.dsy) || 1) * 46 * la : 0) - lookX) * (1 - Math.exp(-3 * rdt));
			lookY += ((sp > 1 ? v.dsy / (Math.hypot(v.dsx, v.dsy) || 1) * 30 * la : 0) - lookY) * (1 - Math.exp(-3 * rdt));
			const destX = focus.sx - viewW / 2 + lookX;
			const destY = focus.sy - viewH / 2 + lookY;
			const k = 1 - Math.exp(-9 * rdt);
			if (Math.abs(destX - camX) > 900 || Math.abs(destY - camY) > 900) {
				camX = destX;
				camY = destY;
			}
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
		const pxs = (window.devicePixelRatio || 1) * zoom;
		const drawCamX = Math.round((camX + sxOff) * pxs) / pxs;
		const drawCamY = Math.round((camY + syOff) * pxs) / pxs;
		const bounds = viewTiles(drawCamX, drawCamY);
		const z = zoom;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		drawGround(drawCamX, drawCamY);
		q10DrawGround(drawCamX, drawCamY, dpr);
		if (world.gates.length && !mode11) {
			ctx.setTransform(dpr * z, dpr * .5 * z, -dpr * z, dpr * .5 * z, dpr * (viewW / 2 * (1 - z) - drawCamX * z), dpr * (viewH / 2 * (1 - z) - drawCamY * z));
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
				ctx.save();
				ctx.translate(pt.sx, pt.sy - 30 * zoom);
				ctx.fillStyle = "rgba(20,16,12,.8)";
				ctx.fillRect(-46 * zoom, -30 * zoom, 92 * zoom, 18 * zoom);
				ctx.fillStyle = "#f0d090";
				ctx.font = `${Math.round(11 * zoom)}px sans-serif`;
				ctx.textAlign = "center";
				ctx.fillText("WORLD MAP", 0, -17 * zoom);
				ctx.rotate(ang);
				ctx.fillStyle = "#f0d090";
				ctx.beginPath();
				ctx.moveTo(22 * zoom, 0);
				ctx.lineTo(4 * zoom, -10 * zoom);
				ctx.lineTo(4 * zoom, 10 * zoom);
				ctx.fill();
				ctx.fillRect(-18 * zoom, -3 * zoom, 24 * zoom, 6 * zoom);
				ctx.restore();
			}
		}
		if (buildOpen) {
			ctx.setTransform(dpr * z, dpr * .5 * z, -dpr * z, dpr * .5 * z, dpr * (viewW / 2 * (1 - z) - drawCamX * z), dpr * (viewH / 2 * (1 - z) - drawCamY * z));
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
				ctx.save();
				ctx.globalAlpha = .55;
				ctx.translate(pt.sx, pt.sy);
				if (buildFlip) ctx.scale(-1, 1);
				ctx.drawImage(img, -W / 2, -H * (1 - anchorOf(k)), W, H);
				ctx.restore();
			}
		}
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
					let seeThrough = false;
					const vArt = prop.kind === "car-sedan" || prop.kind === "car-truck" ? vehicleArt(prop) : null;
					if (player && !inside && (vArt ? vArt.h > 100 : h > (tree ? 60 : 140)) && c.x + c.y > player.x + player.y && !(standingDoor(prop.kind) && inFrontOfHouse(prop, player.x, player.y))) {
						const pr = worldToScreen(c.x, c.y, drawCamX, drawCamY);
						const ps = zoomPoint(pr.sx, pr.sy);
						const hr = worldToScreen(player.x, player.y, drawCamX, drawCamY);
						const hs = zoomPoint(hr.sx, hr.sy);
						const ph = (vArt ? vArt.h : h * scale) * zoom;
						const pimg = images.get(vArt ? vArt.name : spec.image);
						const pw = ph * (pimg && pimg.height ? pimg.width / pimg.height : 1) * (tree ? .85 : .92);
						seeThrough = Math.abs(hs.sx - ps.sx) < pw / 2 && hs.sy < ps.sy + 6 * zoom && hs.sy - HERO_H * zoom * .5 > ps.sy - ph;
					}
					const fadeTo = seeThrough ? 1 : 0;
					prop.fade = (prop.fade || 0) + (fadeTo - (prop.fade || 0)) * Math.min(1, STEP * 10);
					if (prop.fade < .01) prop.fade = 0;
					seeThrough = prop.fade > 0;
					if (seeThrough) ctx.globalAlpha = 1 - prop.fade * (tree ? .78 : .62);
					if (prop.fade > .3) occl141 = true;
					const treeArt = v2TreeArt(prop, n);
					if (prop.kind === "tractor" && (prop.charge || 0) > 0 && images.get("v2/tractor-drive")) {
						const shift = tractorShift(prop.charge || 0);
						blit("v2/tractor-drive", c.x + shift.x, c.y + shift.y, TRACTOR_DRIVE_H, true, Math.floor((prop.charge || 0) * 28) % 4, TRACTOR_ROW, drawCamX, drawCamY);
					} else if (prop.kind === "bike" && images.get("v2/bike-parked")) blit("v2/bike-parked", c.x, c.y, 76, true, 0, prop.id % 2 ? 2 : 6, drawCamX, drawCamY);
					else if (prop.kind === "tractor" && (prop.charge || 0) > 0 && images.get("tractor-run")) {
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
						if (isWall14(prop.kind) && (prop.hp ?? 99) < (PIECE_HP[prop.kind] ?? 60) * .5 && images.get(`${name}-dmg`)) name = `${name}-dmg`;
						const img = images.get(name);
						const raw = worldToScreen(c.x, c.y, drawCamX, drawCamY);
						const pt = zoomPoint(raw.sx, raw.sy);
						img.height / 2 * zoom * (img.height / (img.naturalH || img.height));
						spec.drawH / (img.height / 2);
						const H = spec.drawH * zoom, W = H * img.width / img.height;
						const up = anchorOf(name.slice(4));
						const a0 = ctx.globalAlpha;
						if (isGate14(prop.kind) && prop.open) ctx.globalAlpha = a0 * .4;
						if ((prop.flash || 0) > 0) ctx.globalAlpha = a0 * .7;
						ctx.save();
						ctx.translate(pt.sx, pt.sy);
						if (prop.flip14) ctx.scale(-1, 1);
						ctx.imageSmoothingEnabled = true;
						ctx.drawImage(img, -W / 2, -H * (1 - up), W, H);
						ctx.restore();
						ctx.globalAlpha = a0;
						if (prop.kind === "firering" && prop.lit14 && images.get("fx-fire")) blit("fx-fire", c.x, c.y - 6, 30, false, 0, 0, drawCamX, drawCamY);
						if ((prop.f14 || prop.p14) && buildOpen && (prop.hp ?? 0) < maxHp14(prop)) paintHp14(pt, H, (prop.hp ?? 0) / maxHp14(prop));
					} else blit(prop.skin && images.get(`v2/${prop.skin}`) ? `v2/${prop.skin}` : treeArt || spec.image, c.x + jx, c.y + jy, h * scale * chip, false, 0, 0, drawCamX, drawCamY, false, 0, tilt, 1, tree && (n & 32) !== 0);
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
		if (party && !inside) draws.push({
			z: bodyZ(party.x, party.y),
			draw: () => {
				paintPerson(party, drawCamX, drawCamY);
				bar(party.x, party.y, folkHeight(party), Math.max(0, party.hp) / party.maxHp, drawCamX, drawCamY);
			}
		});
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
					if (enemy.variant === "bear") {
						ctx.save();
						ctx.filter = "brightness(0.38) saturate(0.5)";
					}
					try {
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
					} finally {
						if (enemy.variant === "bear") ctx.restore();
					}
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
					const deadName = pile.body ? `${pile.sheet || beastSheet({
						kind: pile.body,
						id: pile.id
					})}-dead` : "";
					const dimg = deadName ? images.get(deadName) : null;
					if (dimg && TALL_COMBAT.has(deadName)) {
						const dummy = {
							kind: pile.body,
							id: pile.id,
							variant: (pile.sheet || "").startsWith("boss-") || (pile.sheet || "").startsWith("raider-") && !["raider-gray", "raider-blue"].includes(pile.sheet) ? (pile.sheet || "").split("-")[1] : void 0
						};
						const v2p = (pile.sheet || "").startsWith("v2/");
						blit(deadName, pile.x, pile.y, v2p ? realH(pile.sheet, 70) : beastH(dummy), true, v2p ? sheetCols(dimg) - 1 : 3, pile.dir ?? 0, drawCamX, drawCamY);
					} else if (dimg && stripFrames(deadName, dimg) > 1) {
						const east = pile.dir >= 5 && pile.dir <= 7;
						const dummy = {
							kind: pile.body,
							id: pile.id,
							variant: (pile.sheet || "").startsWith("boss-") || (pile.sheet || "").startsWith("raider-") && !["raider-gray", "raider-blue"].includes(pile.sheet) ? (pile.sheet || "").split("-")[1] : void 0
						};
						blit(deadName, pile.x, pile.y, beastH(dummy), false, 3, 0, drawCamX, drawCamY, false, 0, 0, 1, east);
					} else if (pile.folk) blit(pile.folk, pile.x, pile.y, NPC_H, true, 0, pile.dir, drawCamX, drawCamY, false, 0, tilt, .78);
					else if (pile.body) {
						const dummy = {
							kind: pile.body,
							id: pile.id
						};
						const h = Math.max(96, Math.round(beastH(dummy) * .95));
						blit(beastSheet(dummy), pile.x, pile.y, h, true, 0, pile.dir, drawCamX, drawCamY, false, 0, tilt, .78);
					} else blit("sack", pile.x, pile.y, 28, false, 0, 0, drawCamX, drawCamY);
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
			draw: () => xfWrap(() => {
				if (mounted && images.get("v2/hero-ride") && phase !== "dead") {
					blit("v2/hero-ride", player.x, player.y, ADULT, true, walkFrame(true), player.dir, drawCamX, drawCamY, false);
					return;
				}
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
				const facingCam = player.dir === 0 || player.dir === 1 || player.dir === 7;
				const flinch = heroActionPose();
				if (paintPlayerBody(flinch, drawCamX, drawCamY)) return;
				const axeSwing = !flinch && swingAnim > 0 && !work && heroKey() === "hero-axe" && images.get("v2/hero-axe");
				const idle = !flinch && !axeSwing && !(swingAnim > 0) && heroKey() === "hero" && player.anim === player.idleAnim && images.get("v2/hero-idle");
				player.idleAnim = player.anim;
				if (flinch) blit(flinch.name, player.x, player.y, HERO_H, true, flinch.frame, player.dir, drawCamX, drawCamY, false);
				else if (axeSwing) blit("v2/hero-axe", player.x, player.y, HERO_H, true, Math.min(5, Math.floor((1 - swingAnim / .48) * 6)), player.dir, drawCamX, drawCamY, false);
				else if (idle) blit("v2/hero-idle", player.x, player.y, HERO_H, true, Math.floor(performance.now() / ANIM_MS.idle) % 4, player.dir, drawCamX, drawCamY, false);
				else if (swingAnim > 0 && !work && TALL_COMBAT.has(atkName)) blit(atkName, player.x, player.y, HERO_H, true, Math.min(3, Math.floor((1 - swingAnim / .48) * 4)), player.dir, drawCamX, drawCamY, false);
				else if (swingAnim > 0 && !work && facingCam && images.get(atkName)) {
					const f = Math.min(3, Math.floor((1 - swingAnim / .48) * 4));
					blit(atkName, player.x, player.y, HERO_H, false, f, 0, drawCamX, drawCamY, false);
				} else blit(heroKey(), player.x, player.y, HERO_H, true, player.frame, player.dir, drawCamX, drawCamY, reach > 0);
				if (!flinch && !axeSwing && !idle && !HERO69.has(heroKey()) && !(swingAnim > 0 && !work && (TALL_COMBAT.has(atkName) || facingCam && images.get(atkName)))) paintOverlays(player.frame, player.dir, reach > 0);
				if (swingAnim > 0 && !work && !axeSwing && !TALL_COMBAT.has(atkName)) paintSwingArc();
			}, drawCamX, drawCamY)
		});
		for (const scar of scars) {
			const t = tileOf(scar.x, scar.y);
			if (t.tx < 0 || t.ty < 0 || t.tx >= 156 || t.ty >= 156) continue;
			if (!explored[t.ty * 156 + t.tx]) continue;
			draws.push({
				z: scar.x + scar.y - 4,
				draw: () => {
					if (scar.kind === "stump") {
						const sv = (Math.abs(Math.round(scar.x * 7 + scar.y * 3)) >> 3) % 3 + 1;
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
		occl141 = false;
		for (const item of draws) item.draw();
		if (occl141 && player && !inside && xfLast?.calls?.length && phase !== "dead") {
			ctx.save();
			ctx.globalAlpha = .42;
			noShadow141 = true;
			try {
				for (const c of xfLast.calls) blit(...c);
			} finally {
				noShadow141 = false;
				ctx.restore();
			}
		}
		if (work && work.swing > 0 && player && !inside) paintToolSwing(drawCamX, drawCamY);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const shade = nightShade(clock);
		const dark = nightDark(clock);
		if (dark > .02) paintNight(dark, drawCamX, drawCamY);
		if (gfxHigh && !inside) paintDaylight(dark);
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
		if (world && player && !buildOpen && phase === "play") {
			const node = nearestResource(v14.st === 1 ? 640 : 96);
			const npcD = (() => {
				const n = nearestNpc(72);
				return n ? Math.hypot(n.x - player.x, n.y - player.y) : 999;
			})();
			if (node && (npcD > 72 || v14.st === 1)) {
				const c = propCenter(node), raw = worldToScreen(c.x, c.y, drawCamX, drawCamY), m = zoomPoint(raw.sx, raw.sy);
				const pulse = .55 + .45 * Math.sin(performance.now() / 260);
				ctx.save();
				ctx.strokeStyle = `rgba(232, 196, 92, ${.5 + .4 * pulse})`;
				ctx.lineWidth = 2.5;
				ctx.beginPath();
				ctx.ellipse(m.sx, m.sy, (26 + 4 * pulse) * zoom, (12 + 2 * pulse) * zoom, 0, 0, Math.PI * 2);
				ctx.stroke();
				const near = Math.hypot(c.x - player.x, c.y - player.y) < 96;
				ctx.font = `600 ${Math.round(12 * Math.max(1, zoom * .8))}px system-ui, sans-serif`;
				ctx.textAlign = "center";
				ctx.fillStyle = "rgba(15,12,8,.75)";
				const label = near ? (coarse141 ? "Tap to pick up" : "E: pick up") + ` ${node.resource === "wood" ? "wood" : node.resource}` : v14.st === 1 ? "Spruce wood" : node.resource === "wood" ? "Timber" : node.resource;
				const w = ctx.measureText(label).width + 12;
				ctx.fillRect(m.sx - w / 2, m.sy - 40 * zoom - 14, w, 18);
				ctx.fillStyle = "#f0d890";
				ctx.fillText(label, m.sx, m.sy - 40 * zoom);
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
	/** v13.4 vehicles: rusted hot rods replace the cars, rusted '50 Chevy pickups replace the trucks.
	* Any v2/vehicles/car-rod-<1-4>-<se|sw> or truck-chevy-<1-4>-<se|sw> listed in optional.json is mixed in.
	* Facing follows the road under the wreck (road along x runs NE-SW on screen: SW; along y: SE); off-road it is a coin toss.
	* Height is the sprite height in world px at 1 ft = 11 px: hot rod about 13 ft long, pickup about 16 ft. */
	const VEH_H = {
		"car-rod": 112,
		"truck-chevy": 126
	};
	const vehCache = /* @__PURE__ */ new WeakMap();
	function vehicleArt(prop) {
		const hit = vehCache.get(prop);
		if (hit) return hit;
		const fam = prop.kind === "car-truck" ? "truck-chevy" : "car-rod";
		const have = [
			1,
			2,
			3,
			4
		].filter((i) => images.get(`v2/vehicles/${fam}-${i}-se`) || images.get(`v2/vehicles/${fam}-${i}-sw`));
		const any = have.length ? images.get(`v2/vehicles/${fam}-${have[0]}-se`) || images.get(`v2/vehicles/${fam}-${have[0]}-sw`) : null;
		if (!have.length) return null;
		const h = ((prop.tx * 73856093 ^ prop.ty * 19349663) >>> 0) / 4294967296;
		const v = have[Math.floor(h * have.length) % have.length];
		const road = (tx, ty) => {
			const t = world.tiles[ty * 156 + tx];
			return t === 2 || t === 5;
		};
		const alongX = road(prop.tx - 1, prop.ty) + road(prop.tx + 1, prop.ty), alongY = road(prop.tx, prop.ty - 1) + road(prop.tx, prop.ty + 1);
		let face = alongX > alongY ? "sw" : alongY > alongX ? "se" : h * 977 % 1 < .5 ? "se" : "sw";
		if (!images.get(`v2/vehicles/${fam}-${v}-${face}`)) face = face === "se" ? "sw" : "se";
		const art = {
			name: `v2/vehicles/${fam}-${v}-${face}`,
			h: images.get(`v2/vehicles/${fam}-${v}-${face}`)?.height || any?.height || VEH_H[fam]
		};
		vehCache.set(prop, art);
		return art;
	}
	/** Soft contact shadow: a radial falloff ellipse, slightly to the lower right (sun from the upper left). */
	const shadowCache = /* @__PURE__ */ new Map();
	function softShadow(x, y, rx, name) {
		if (/^(ground|road|icon|fx|bait|scrap|sack|hatch|door)/.test(name) || rx < 2) return;
		let key = Math.round(rx);
		let cv = shadowCache.get(key);
		if (!cv) {
			cv = document.createElement("canvas");
			cv.width = key * 2 + 4;
			cv.height = Math.ceil(key * .84) + 4;
			const g2 = cv.getContext("2d");
			g2.scale(1, .42);
			const cy = cv.height / 2 / .42;
			const g = g2.createRadialGradient(cv.width / 2, cy, 0, cv.width / 2, cy, key);
			g.addColorStop(0, "rgba(10,8,6,0.46)");
			g.addColorStop(.55, "rgba(10,8,6,0.26)");
			g.addColorStop(1, "rgba(10,8,6,0)");
			g2.fillStyle = g;
			g2.fillRect(0, 0, cv.width, cv.height / .42);
			if (shadowCache.size > 200) shadowCache.clear();
			shadowCache.set(key, cv);
		}
		const day = 1 - nightDark(clock) * .7;
		ctx.save();
		ctx.globalAlpha = day;
		ctx.drawImage(cv, x - cv.width / 2, y - cv.height / 2);
		ctx.restore();
	}
	let xfRec = null, xfLast = null, xf = null;
	function xfWrap(fn, dcx, dcy) {
		const crouch = l1.crouch && !mounted && phase !== "dead";
		if (crouch) {
			const f = zoomPoint(worldToScreen(player.x, player.y, dcx, dcy).sx, worldToScreen(player.x, player.y, dcx, dcy).sy);
			ctx.save();
			ctx.translate(f.sx, f.sy);
			ctx.scale(1.06, .78);
			ctx.translate(-f.sx, -f.sy);
		}
		xfRec = [];
		try {
			fn();
		} finally {
			const calls = xfRec;
			xfRec = null;
			const sig = calls.map((c) => c[0]).join("|");
			if (xfLast && sig !== xfLast.sig && calls.length && xfLast.calls.length && !reduceMotion && phase !== "dead") xf = {
				calls: xfLast.calls,
				n: 4
			};
			if (xf && xf.n > 0) {
				ctx.save();
				ctx.globalAlpha = xf.n / 5;
				for (const c of xf.calls) {
					const a = c.slice();
					a[1] = player.x;
					a[2] = player.y;
					a[7] = dcx;
					a[8] = dcy;
					blit(...a);
				}
				ctx.restore();
				xf.n -= 1;
				xfStats.n += 1;
			}
			xfLast = {
				sig,
				calls
			};
			if (crouch) ctx.restore();
		}
	}
	const xfStats = { n: 0 };
	let occl141 = false, noShadow141 = false;
	function blit(name, x, y, drawH, sheet, frame, dir, dcx, dcy, lunge = false, lift = 0, tilt = 0, flatten = 1, flip = false) {
		if (xfRec) xfRec.push([
			name,
			x,
			y,
			drawH,
			sheet,
			frame,
			dir,
			dcx,
			dcy,
			lunge,
			lift,
			tilt,
			flatten,
			flip
		]);
		const img = images.get(name);
		if (sheet && img && /^v2\/(bandit-[a-z]+|hollowed)-walk$/.test(name) && sheetCols(img) === 8) frame = (frame || 0) % 4 * 2 + (Math.floor(performance.now() / 110) & 1);
		if (heroLog && /^((v2\/)?hero|pl\/)/.test(name)) {
			heroLog.push({
				name,
				frame,
				dir,
				ok: !!(img && img.width),
				cols: img ? sheetCols(img) : 0
			});
			if (heroLog.length > 400) heroLog.shift();
		}
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
		const layer = name.startsWith("overlay-");
		const person = !layer && (/^(v2\/)?hero|^pl\//.test(name) || !!figFamily(name));
		if (person && !noShadow141) softShadow(foot.sx, foot.sy + 1 * zoom, (/cyndal|loki/.test(name) ? 14 : 17) * zoom, name);
		if (!layer && !person && !gfxHigh && !noShadow141) {
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
			const planted = footSrc.feet[(sheet ? dir % rows : 0) * fcols + frame % fcols];
			if (planted) frac = planted;
		}
		drawH *= heroScale(name);
		drawH *= figScale(name, drawH, images);
		const dh = drawH * zoom;
		const dw = dh * (sw / sh);
		if (sheet && /(idle|-gun)$/.test(name)) {
			const fx = footXOf(img, sheetCols(img), rows, sw, sh);
			const r = dir % rows, c = frame % sheetCols(img);
			const d = (fx[r * sheetCols(img) + c] ?? 0) - (fx[r * sheetCols(img)] ?? 0);
			p.sx -= d * (dh / sh);
		}
		const spriteY = -dh * frac - lift * zoom;
		if (!layer && !person && gfxHigh && !noShadow141) softShadow(foot.sx + 3 * zoom, foot.sy + 1 * zoom, Math.max(12 * zoom, Math.min(dw * .36, (sheet || strips ? 46 : 34) * zoom)), name);
		const smooth = ctx.imageSmoothingEnabled;
		const ratio = dh / sh;
		ctx.imageSmoothingEnabled = gfxHigh ? ratio < .97 || Math.abs(ratio - Math.round(ratio)) > .06 : dh < sh * .92;
		ctx.imageSmoothingQuality = gfxHigh ? "high" : "medium";
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
		g.beginPath();
		g.arc(pt.tx * sx, pt.ty * sy, 5, 0, Math.PI * 2);
		g.fill();
		g.strokeStyle = "#101410";
		g.lineWidth = 2;
		g.stroke();
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
		const obj = {
			tx: rawObj.tx + 22,
			ty: rawObj.ty + 20
		};
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
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight"
		].includes(e.code)) e.preventDefault();
		keys.add(e.code);
		if (e.repeat) return;
		if (e.code === "Escape" && phase === "play") {
			phase = "pause";
			sync(true);
		} else if (e.code === "Escape" && phase === "pause") {
			phase = "play";
			sync(true);
		} else if (e.code === "Space" && phase === "play") edges.attack = true;
		else if (e.code === "KeyI" && phase === "play") {
			packOpen = !packOpen;
			if (packOpen) {
				statsOpen = false;
				buildOpen = false;
			}
			sync(true);
		} else if (e.code === "KeyC" && phase === "play") {
			if (craftOpen) craftOpen = false;
			else if (ok14()) craftOpen = true;
			else pushLog("The workbench opens once the farm is yours.");
			sync(true);
		} else if (e.code === "KeyX" && phase === "play") setCrouch(!l1.crouch);
		else if (e.code === "KeyB" && phase === "play" && !prevHeld.has("KeyB")) {
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
		player.px = player.x;
		player.py = player.y;
		if (party) {
			party.px = party.x;
			party.py = party.y;
		}
		for (const e of world.enemies) {
			e.px = e.x;
			e.py = e.y;
		}
		for (const n of world.npcs) {
			n.px = n.x;
			n.py = n.y;
		}
		for (const p of world.props) if (p.kind === "tractor" || p.kind === "bike") {
			p.pc = p.charge || 0;
			p.ppx = p.x;
			p.ppy = p.y;
		}
	}
	function frame(now) {
		if (!running) return;
		const dt = Math.min(.1, (now - last) / 1e3);
		last = now;
		acc += dt;
		let guard = 0;
		while (acc >= STEP && guard < 5) {
			snapPrev();
			step(STEP);
			acc -= STEP;
			guard++;
		}
		const t0 = performance.now();
		renderNow = now;
		const alpha = Math.min(1, acc / STEP);
		let nl = 0;
		if (world && player && phase === "play" && !inside) {
			const put = (b) => {
				if (b && b.px != null && Math.abs(b.x - b.px) < 40 && Math.abs(b.y - b.py) < 40) {
					lerpBodies[nl++] = b;
					b.sx0 = b.x;
					b.sy0 = b.y;
					b.x = b.px + (b.x - b.px) * alpha;
					b.y = b.py + (b.y - b.py) * alpha;
				}
			};
			put(player);
			put(party);
			for (const e of world.enemies) if (!e.dead) put(e);
			for (const n of world.npcs) put(n);
			for (const p of world.props) if (p.kind === "tractor" && p.pc != null && (p.charge || 0) > 0 && p.charge >= p.pc) {
				p.c0 = p.charge;
				p.charge = p.pc + (p.charge - p.pc) * alpha;
				tractorLerp.push(p);
			}
		}
		render();
		for (let i = 0; i < nl; i++) {
			const b = lerpBodies[i];
			b.x = b.sx0;
			b.y = b.sy0;
		}
		for (const p of tractorLerp) p.charge = p.c0;
		tractorLerp.length = 0;
		const ms = performance.now() - t0;
		frameMs.avg = frameMs.avg * .95 + ms * .05;
		frameMs.n++;
		frameMs.worst = Math.max(frameMs.worst * .995, ms);
		frameMs.list.push(ms);
		if (frameMs.list.length > 240) frameMs.list.shift();
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
			if (!((picked.kind === "tree" && work.mode === "chop" || picked.kind === "rock" && work.mode === "mine") && work.id === picked.id)) work = null;
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
			if (p.kind === "press" || p.kind === "crates" || p.kind === "orchard" || p.kind === "maple" || ART14.has(p.kind)) {
				if (near || ART14.has(p.kind) && Math.hypot(c.x - player.x, c.y - player.y) < 110) useFarm(p);
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
			if (justLeft && p && justLeft.id === p.id && performance.now() - justLeft.t < 8e3 && Math.hypot(player.x - justLeft.x, player.y - justLeft.y) < 110) intent = {
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
			if (!tryGive(recipe.item)) break;
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
			bootNew("Packer", "hunter", {
				strength: 1,
				vigor: 1,
				endurance: 1,
				intellect: 0,
				perception: 0,
				luck: 0
			}, "eye", "wool");
			snow = Math.max(snow, 3);
			jackMet = true;
			raidNight = 0;
			if (GEAR.carbine) {
				giveItem("carbine", 1);
				player.weaponId = "carbine";
			}
			giveItem("shells", 12);
			refreshGear(player);
			player.hp = player.maxHp;
			const fh = world.props.find((q) => q.kind === "farmhouse");
			if (fh) {
				const d = doorPoint(fh);
				player.x = d.x;
				player.y = d.y + 48;
			}
			const span = DAY_LENGTH_SEC;
			clock = Math.floor(clock / span) * span + 21.5 / 24 * span;
			setLog("Raid Mode. One night at Cambridge Road. Justin and Sarah take the posts; Cyndal watches from the loft, Loki runs shells.");
			startRaid();
			if (!raid) {
				raidMode = false;
				phase = "menu";
			}
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
		setStick(x, y) {
			stickX = Math.max(-1, Math.min(1, x));
			stickY = Math.max(-1, Math.min(1, y));
		},
		v141(cmd, arg) {
			if (cmd === "crouch") setCrouch(arg == null ? !l1.crouch : !!arg);
			else if (cmd === "auto") {
				l1.auto = arg == null ? !l1.auto : !!arg;
				pushLog(l1.auto ? "Auto-attack on: you'll swing at anything that comes for you." : "Auto-attack off.");
				sync(true);
			} else if (cmd === "stickMode") {
				l1.stick = arg == null ? !l1.stick : !!arg;
				sync(true);
			} else if (cmd === "store") storeCmd(arg?.[0], arg?.[1]);
			else if (cmd === "pack") {
				packOpen = !packOpen;
				if (packOpen) {
					statsOpen = false;
					buildOpen = false;
				}
				sync(true);
			}
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
			else if (cmd === "closeCraft") {
				craftOpen = false;
				sync(true);
			} else if (cmd === "openCraft") {
				if (ok14()) {
					craftOpen = true;
					sync(true);
				}
			} else if (cmd === "rotate") {
				buildFlip = !buildFlip;
				sync(true);
			} else if (cmd === "tool") {
				buildTool = arg;
				sync(true);
			} else if (cmd === "repairAll") repairAll14();
			else if (cmd === "wmGo") wmGo(arg[0], arg[1]);
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
			useHud.setState({
				slot: getSlot(),
				slots: slotInfos(),
				hasSave: hasSave()
			});
		},
		drawMap(c) {
			drawWorldMap(c);
		},
		mount() {
			const b = nearBike();
			if (b) {
				mountBike(b);
				sync(true);
			}
		},
		openTravel() {
			if (player && phase === "play") travelMenu();
		},
		choose13(id) {
			if (id === "v13-ending-next") {
				w13.main.slide += 1;
				sync(true);
				return;
			}
			if (id === "v13-ending-close") {
				w13.main.slide = 99;
				sync(true);
			}
		},
		setNotes(text) {
			w13.notes = String(text).slice(0, 4e3);
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
			pushLog(`${SKILLS.find((skill) => skill.id === id)?.name ?? "Skill"} rises to ${skillOf(id)}.`);
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
			if (wornCount(player, id) >= stack.qty) {
				const other = EQUIP_SLOTS.find((s2) => player[SLOT_FIELD[s2]] === id);
				if (other) player[SLOT_FIELD[other]] = "";
			}
			const was = player[field];
			player[field] = id;
			refreshGear(player);
			layoutGrid(player);
			if (was && layoutGrid(player).over > 0) {
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
				if (inside) {
					pushLog("Not in here. Set it outside on a game trail.");
					return;
				}
				setTrap(id === "snare" ? "snare" : "trap");
				return;
			}
			if (v141Use(def, stack)) {
				saveGame();
				sync(true);
				return;
			}
			if (v13Use(def, stack)) {
				saveGame();
				sync(true);
				return;
			}
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
				pushLog(jackTrust > 0 ? dark ? "Jack, through the static: \"Lights on the road. Keep your head down.\"" : "Jack, through the static: \"Quiet so far. I'll call at dusk if they move.\"" : "Static. Somebody else's channel, maybe. Jack hasn't given you his.");
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
		setGraphics(high) {
			gfxHigh = !!high;
			try {
				localStorage.setItem("maine-rpg-gfx", gfxHigh ? "high" : "low");
			} catch {}
			sync(true);
		},
		endTurn,
		takeLoot
	};
	window.__controlsTest = {
		v14: () => ({
			...v14,
			craftOpen,
			buildFlip,
			buildTool,
			raid: raid ? {
				defend: !!raid.defend,
				wave: raid.wave,
				waves: raid.waves,
				phase: raid.phase,
				house: raid.house
			} : null,
			snow,
			mapId
		}),
		v14Set: (patch) => {
			Object.assign(v14, patch);
			sync(true);
		},
		v14Props: () => world ? world.props.filter((p) => ART14.has(p.kind) || p.f14 || p.p14).map((p) => ({
			id: p.id,
			kind: p.kind,
			tx: p.tx,
			ty: p.ty,
			hp: p.hp,
			f14: p.f14 ?? null,
			p14: !!p.p14,
			open: !!p.open,
			flip: !!p.flip14,
			lit: !!p.lit14
		})) : [],
		v14Use: (id) => {
			const p = world?.props.find((q) => q.id === id);
			if (p) v14Use(p);
		},
		v14Hurt: (id, d) => {
			const p = world?.props.find((q) => q.id === id);
			if (p) hurtProp(p, d);
		},
		v14Cmd: (cmd, arg) => api.v14(cmd, arg),
		l141: () => ({
			...l1,
			rows: gridRows(player),
			bag: player.bag.map((s) => ({ ...s })),
			small: !!player.small,
			bagLv: player.bagLv ?? 0,
			xf: xfStats.n,
			hard: !!w13.hard,
			mapId,
			phase,
			x: player.x,
			y: player.y,
			piles: piles.map((p) => ({
				title: p.title,
				n: p.items.reduce((a, b) => a + b.qty, 0),
				x: p.x,
				y: p.y
			}))
		}),
		l141Hollow: (n, dx, dy) => spawnHollowed(n, {
			x: player.x + dx,
			y: player.y + dy
		}).map((e) => e.id),
		l141Enemies: () => world.enemies.filter((e) => !e.dead).map((e) => ({
			id: e.id,
			hollow: !!e.hollow,
			x: e.x,
			y: e.y,
			aggro: !!e.aggro,
			heard: !!e.heard,
			name: e.name,
			hp: e.hp,
			kind: e.kind,
			d: Math.hypot(e.x - player.x, e.y - player.y)
		})),
		l141Noise: (n, dx = 0, dy = 0) => emitNoise(n, player.x + dx, player.y + dy),
		l141Loot: (id) => {
			const r = LOOT_RUNS.find((x) => x.id === id);
			openWorldMap();
			const m = wmState();
			m.q = r.q;
			m.r = r.r;
			m.path = [];
			m.from = [r.q - 1, r.r];
			lootEnter(r);
			return piles.filter((p) => p.title.startsWith(r.name)).map((p) => ({
				title: p.title,
				items: p.items.map((i) => ({ ...i })),
				d: Math.round(Math.hypot(p.x - player.x, p.y - player.y))
			}));
		},
		l141Hours: (h) => {
			prodAcc = 2;
			prodTick(0);
			clock += h / 24 * DAY_LENGTH_SEC;
			prodAcc = 2;
			prodTick(0);
		},
		l141Hard: (on) => {
			w13.hard = !!on;
		},
		l141Strike: (id) => {
			const e = world.enemies.find((q) => q.id === id);
			if (!e) return null;
			const hp = e.hp;
			player.cooldown = 0;
			aim = "chest";
			const r0 = Math.random;
			Math.random = () => 0;
			try {
				strikeEnemy(e);
			} finally {
				Math.random = r0;
			}
			return {
				before: hp,
				after: e.hp,
				dead: !!e.dead
			};
		},
		l141Use: (tx, ty) => {
			const p = world.props.find((q) => q.tx === tx && q.ty === ty);
			if (p) v14Use(p);
			return p ? p.kind : null;
		},
		lrTalk: (role) => {
			const n = world.npcs.find((q) => q.role === role);
			if (!n) return null;
			openTalk(n);
			return dialogue ? {
				text: dialogue.text,
				choices: dialogue.choices
			} : null;
		},
		dialogChoices: () => (dialogue?.choices ?? []).map((c) => c.id),
		l141Barrels: () => world.props.filter((q) => q.kind === "rainbarrel").map((q) => ({
			tx: q.tx,
			ty: q.ty,
			n: barrel141(q).n
		})),
		l141Fig: () => ({ ...figLog }),
		l141Melee: () => {
			return {
				m: meleeFrame(),
				pending: !!pendingHit,
				count: meleeCount
			};
		},
		l141Props: () => world.props.filter((q) => q.p14).map((q) => ({
			kind: q.kind,
			tx: q.tx,
			ty: q.ty
		})),
		l141Give: (id, n) => {
			const st = player.bag.find((q) => q.id === id);
			if (st) st.qty += n;
			else player.bag.push({
				id,
				qty: n
			});
		},
		l141Pile: (title) => {
			const p = piles.find((q) => q.title === title);
			if (p) {
				player.x = p.x;
				player.y = p.y;
				openLoot(p);
			}
			return !!p;
		},
		tap: (a) => api.tap(a),
		takeLoot: (k) => api.takeLoot(k),
		clickPack: (id) => api.clickPack(id),
		v141: (c, a) => api.v141(c, a),
		l141Stick: (x, y) => {
			stickX = x;
			stickY = y;
		},
		l141Mats: () => {
			player.wood += 60;
			player.stone += 60;
			player.scrap += 60;
			for (const id of [
				"cloth",
				"junk",
				"hide"
			]) {
				const st = player.bag.find((q) => q.id === id);
				if (st) st.qty += 20;
				else player.bag.push({
					id,
					qty: 20
				});
			}
			sync(true);
		},
		v14Build: (index, tx, ty) => {
			recipe = index;
			buildOpen = true;
			hoverX = (tx + .5) * 64;
			hoverY = (ty + .5) * 64;
			tryBuild();
		},
		v14Report: () => {
			report14(raidNight);
		},
		v14Defend: () => startDefend14(),
		wm: () => ({
			phase,
			mapId,
			name: world?.name,
			map: v14.map,
			clock
		}),
		wmOpen: () => openWorldMap(),
		wmGo: (q, r) => wmGo(q, r),
		gates: () => world ? world.gates.map((g) => ({
			tx: g.tx,
			ty: g.ty,
			side: g.side
		})) : [],
		gatesFull: () => world ? world.gates.map((g) => ({ ...g })) : [],
		hurtPlayer: (n) => {
			if (player) {
				player.invuln = 0;
				hurtPlayer(n, player.x + 10, player.y);
			}
		},
		recipes: () => RECIPES.map((r) => ({
			kind: r.kind,
			label: r.label,
			v14: !!r.v14
		})),
		freeFarmTile: () => {
			if (!world) return null;
			const f = tileOf(farmCenter().x, farmCenter().y);
			for (let r = 3; r < 9; r++) for (let y = f.ty - r; y <= f.ty + r; y++) for (let x = f.tx - r; x <= f.tx + r; x++) if (inFarm(x, y) && footprintFree(world, x, y, 1, 1) && world.tiles[y * 156 + x] !== 2) return {
				tx: x,
				ty: y
			};
			return null;
		},
		toggleBuild: (on) => {
			buildOpen = !!on;
			sync(true);
		},
		save: () => saveGame(),
		v14WinWave: () => {
			if (!raid) return;
			for (const e of world.enemies) if (!e.dead && e.raid) markDead(e, 0);
			raid.left = 0;
		},
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
		folk: () => (world?.npcs ?? []).map((n) => {
			const r = worldToScreen(n.x, n.y, camX, camY);
			const z = zoomPoint(r.sx, r.sy);
			return {
				role: n.role,
				name: n.name,
				dir: n.dir,
				frame: n.frame,
				sx: Math.round(z.sx ?? z.x ?? 0),
				sy: Math.round(z.sy ?? z.y ?? 0)
			};
		}),
		placeNpc: (role, x, y, dir = 0) => {
			const n = world?.npcs.find((m) => m.role === role);
			if (!n) return false;
			n.x = n.homeX = x;
			n.y = n.homeY = y;
			n.path = [];
			n.pause = 99;
			n.dir = dir;
			return true;
		},
		npcPlace: (role, x, y) => {
			const n = world?.npcs.find((q) => q.role === role);
			if (!n) return false;
			n.x = x;
			n.y = y;
			for (const k of [
				"homeX",
				"hx",
				"tx0"
			]) if (k in n) n[k] = x;
			for (const k of [
				"homeY",
				"hy",
				"ty0"
			]) if (k in n) n[k] = y;
			return true;
		},
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
		questState: () => ({
			quest,
			snow,
			jackTrust,
			jackMet,
			bunkerSeen,
			wood: player?.wood ?? 0,
			respawn: player ? [player.respawnX, player.respawnY] : null
		}),
		enemies: () => world ? world.enemies.map((e) => ({
			id: e.id,
			x: Math.round(e.x),
			y: Math.round(e.y),
			name: e.name ?? "",
			kind: e.kind ?? "",
			variant: e.variant ?? "",
			quest: !!e.quest,
			dead: !!e.dead,
			hp: e.hp,
			maxHp: e.maxHp,
			elite: !!e.elite
		})) : [],
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
		v13State: () => JSON.parse(JSON.stringify({
			...w13,
			hud: v13Hud(),
			player: player ? {
				name: player.name,
				hair: player.hair,
				def: player.def,
				atk: player.atk,
				maxHp: player.maxHp,
				maxStamina: player.maxStamina,
				hp: player.hp,
				scrap: player.scrap,
				look: player.look,
				coat: player.coatId,
				head: player.headId,
				legs: player.legsId,
				hands: player.handsId,
				feet: player.feetId,
				bag: player.bag.filter((b) => ARMOR13_IDS.includes(b.id))
			} : null,
			sight: sightRadius(),
			mapId
		})),
		v13Set: (patch) => {
			for (const [k, v] of Object.entries(patch)) w13[k] = v && typeof v === "object" && !Array.isArray(v) ? {
				...w13[k],
				...v
			} : v;
			if (player) refreshGear(player);
			sync(true);
		},
		statsNow: () => statsOpen,
		bagNow: () => player ? {
			bag: player.bag.map((b) => `${b.id}x${b.qty}`),
			over: layoutGrid(player).over
		} : null,
		v13Take: (id, n = 1) => takeItem(id, n),
		statsToggle: () => {
			api.toggleStats();
			return statsOpen;
		},
		v13Reset: (k, v) => {
			w13[k] = v;
			if (player) refreshGear(player);
			sync(true);
		},
		v13Weather: (id) => {
			w13.weather = {
				id,
				day: curDay()
			};
			sync(true);
			return {
				sight: sightRadius(),
				speed: weather13().speed,
				bike: weather13().bike
			};
		},
		v13Daily: () => {
			w13.weather.day = -1;
			v13Daily(curDay());
		},
		v13Needs: (h) => {
			needsTick(h);
			sync(true);
			return { ...w13.needs };
		},
		v13Forage: () => forage(true),
		v13Fx: () => ({
			...fx13(),
			core: core13()
		}),
		v13Hurt: (n, kind) => {
			const e = kind ? world.enemies.find((q) => !q.dead && q.kind === kind) : null;
			player.invuln = 0;
			hurtPlayer(n, e ? e.x : player.x + 10, e ? e.y : player.y);
			return {
				hp: player.hp,
				dura: { ...w13.dura },
				ail: { ...w13.ail }
			};
		},
		v13Ail: (id) => catchAil(id, "Test."),
		v13Camp: (id, ok) => {
			campRaid(id, ok);
			return {
				camps: { ...w13.camps },
				freed: w13.freed,
				lt: w13.main.ltKills
			};
		},
		v13DepotSpot: () => q10Tile(DEPOT13.tx, DEPOT13.ty),
		v13CampSpot: (id) => {
			const c = CAMPS13.find((x) => x.id === id);
			return c ? camp13Spot(c) : null;
		},
		v13Road: (id) => {
			w13.road.n = 0;
			startRoadEvent(id);
			return w13.roadEv;
		},
		v13Travel: (id) => {
			fastTravel(id);
			return {
				mapId,
				x: player.x,
				y: player.y,
				gas: countOf("gas")
			};
		},
		v13Act: (n) => {
			w13.main.act = n;
			sync(true);
		},
		v13Tick: () => v13MainTick(),
		v13SpawnCollector: () => {
			if (raid) {
				raid.wave = raid.waves;
				raid.collector = false;
				v13SiegeTick(0);
			}
			return !!raid;
		},
		v13Siege: () => {
			v13SiegeStart();
			return raid ? {
				siege: !!raid.siege,
				waves: raid.waves,
				house: raid.house
			} : null;
		},
		v13SiegeEnd: (won) => {
			if (won) w13.main.collectorDown = true;
			endRaid(!!won, "Test: the siege ends.");
			v13MainTick();
			return { ...w13.main };
		},
		v13Caravan: () => v13Caravan(),
		v13Moon: (day) => ({
			phase: moonPhase(day),
			...moonEffect(moonPhase(day)),
			dark: nightDark(day * DAY_LENGTH_SEC + DAY_LENGTH_SEC * 23 / 24)
		}),
		v13Body: () => ({
			walk: plImg("walk"),
			hit: plImg("hit"),
			down: plImg("down"),
			gun: plImg("gun"),
			gunAtk: plImg("gun-atk"),
			axe: plImg("axe"),
			death: plImg("death"),
			cols: plImg("hit") ? sheetCols(images.get(plImg("hit"))) : 0,
			armor: armorLayerNames("walk")
		}),
		v13Hours: (h) => {
			clock += h / 24 * DAY_LENGTH_SEC;
		},
		invEquip: (id, slot) => api.invEquip(id, slot),
		invUnequip: (slot) => api.invUnequip(slot),
		invUse: (id) => api.invUse(id),
		craft: (id) => craft(id),
		dropItem: (id) => {
			if (player) {
				player.bag = player.bag.filter((s) => s.id !== id);
				refreshGear(player);
			}
		},
		countOf: (id) => player?.bag.reduce((n, s) => n + (s.id === id ? s.qty : 0), 0) ?? 0,
		addWood: (n) => {
			if (player) player.wood += n;
		},
		logTail: () => [...allLog],
		snowTile: () => {
			if (!world || !player) return null;
			let best = null, bd = 0xde0b6b3a7640000;
			for (let ty = 2; ty < 154; ty++) for (let tx = 2; tx < 148; tx++) {
				let ok = true;
				for (let k = 0; k < 8 && ok; k++) if (world.tiles[ty * 156 + tx + k] !== 4 || world.blocked[ty * 156 + tx + k]) ok = false;
				if (!ok) continue;
				const x = (tx + .5) * 64, y = (ty + .5) * 64, d = Math.hypot(x - player.x, y - player.y);
				if (d < bd) {
					bd = d;
					best = {
						x,
						y
					};
				}
			}
			return best;
		},
		leave: () => leaveHouse(),
		insideInfo: () => inside ? {
			id: inside.id,
			kind: world?.props.find((p) => p.id === inside.id)?.kind ?? "",
			rx: inside.rx,
			ry: inside.ry,
			origin: roomOrigin(),
			scale: roomScale(),
			dims: roomDims(),
			door: roomDoor(),
			phase
		} : null,
		exitCheck: () => world ? world.props.filter((p) => canWalkIn(p)).map((p) => {
			const d = doorPoint(p);
			const t = tileOf(d.x, d.y);
			const o = clearOutside(d.x, d.y);
			const ot = tileOf(o.x, o.y);
			const seen = /* @__PURE__ */ new Set([ot.ty * 156 + ot.tx]);
			const q = [[ot.tx, ot.ty]];
			while (q.length && seen.size < 400) {
				const [x, y] = q.shift();
				for (const [ax, ay] of [
					[x + 1, y],
					[x - 1, y],
					[x, y + 1],
					[x, y - 1]
				]) {
					const k = ay * 156 + ax;
					if (ax < 0 || ay < 0 || ax >= 156 || ay >= 156 || seen.has(k) || cellBlocked(world, ax, ay)) continue;
					seen.add(k);
					q.push([ax, ay]);
				}
			}
			return {
				kind: p.kind,
				id: p.id,
				blocked: cellBlocked(world, t.tx, t.ty),
				moved: Math.round(Math.hypot(o.x - d.x, o.y - d.y)),
				reach: seen.size
			};
		}) : [],
		doorOf: (kind) => {
			const p = world?.props.find((q) => q.kind === kind);
			return p ? doorPoint(p) : null;
		},
		screenOf: (x, y) => {
			const r = worldToScreen(x, y, camX, camY);
			return zoomPoint(r.sx, r.sy);
		},
		openSpotNear: (r) => {
			if (!world || !player) return null;
			const t = tileOf(player.x, player.y);
			for (let k = 0; k < 200; k++) {
				const a = k * 2.4, rr = r + k % 3;
				const tx = Math.round(t.tx + Math.cos(a) * rr), ty = Math.round(t.ty + Math.sin(a) * rr);
				if (tx < 0 || ty < 0 || tx >= 156 || ty >= 156 || cellBlocked(world, tx, ty)) continue;
				if (world.props.some((p) => {
					const sp = PROP_SPEC[p.kind];
					return tx >= p.tx - 1 && tx < p.tx + sp.w + 1 && ty >= p.ty - 3 && ty < p.ty + sp.h + 1;
				})) continue;
				const x = (tx + .5) * 64, y = (ty + .5) * 64;
				const sc = worldToScreen(x, y, camX, camY), zp = zoomPoint(sc.sx, sc.sy);
				if (zp.sx < 80 || zp.sx > viewW - 120 || zp.sy < 90 || zp.sy > viewH - 140) continue;
				if (pathTo(world, player.x, player.y, x, y)) return {
					x,
					y,
					sx: zp.sx,
					sy: zp.sy
				};
			}
			return null;
		},
		dbg: () => ({
			phase,
			intent: intent ? {
				kind: intent.kind,
				x: intent.x,
				y: intent.y,
				path: intent.path?.length
			} : null,
			opening: !!opening,
			travelLock,
			pointerDown,
			inside: !!inside,
			hold: holdWalk
		}),
		forceEnter: (kind) => {
			const p = world?.props.find((q) => q.kind === kind);
			if (!p || !player) return false;
			const d = doorPoint(p);
			player.x = d.x;
			player.y = d.y;
			finishEnter(p);
			sync(true);
			return true;
		},
		walkTo: (x, y) => {
			if (!world || !player) return false;
			const path = pathTo(world, player.x, player.y, x, y);
			intent = {
				kind: "walk",
				x,
				y,
				path: path ?? []
			};
			return !!path;
		},
		blockedHere: () => world && player ? {
			r: pointBlocked(world, player.x, player.y, RADIUS),
			c: pointBlocked(world, player.x, player.y, 0),
			x: player.x,
			y: player.y,
			w: pointBlocked(world, player.x - 20, player.y, RADIUS),
			e: pointBlocked(world, player.x + 20, player.y, RADIUS),
			n: pointBlocked(world, player.x, player.y - 20, RADIUS),
			s: pointBlocked(world, player.x, player.y + 20, RADIUS)
		} : null,
		doorDbg: (kind) => {
			const p = world?.props.find((q) => q.kind === kind);
			if (!p) return null;
			const sp = PROP_SPEC[p.kind];
			const pd = PAINTED_DOORS[sp.image];
			return {
				c: propCenter(p),
				off: pd && houseArtToWorld(p.kind, pd.g[0], pd.g[1]),
				door: doorPoint(p),
				foot: images.get(sp.image)?.foot,
				w: images.get(sp.image)?.width,
				h: images.get(sp.image)?.height,
				locked: !!p.locked,
				opening: OPEN_TIME
			};
		},
		giveItem: (id, qty = 1) => tryGive(id, qty),
		giveReward: (id, qty = 1) => giveItem(id, qty),
		fillPack: () => {
			let n = 0;
			for (const id of Object.keys(GEAR)) if (id !== "grokclaw" && !player.bag.some((b) => b.id === id) && tryGive(id, 1)) n++;
			return {
				n,
				full: !canFit(player, "grokclaw")
			};
		},
		pilesNow: () => piles.map((q) => ({
			title: q.title,
			x: q.x,
			y: q.y,
			items: q.items.map((i) => `${i.id}x${i.qty}`)
		})),
		encounters: () => {
			const e = (id) => {
				const x = world?.enemies.find((q) => q.id === id);
				return x ? {
					x: x.x,
					y: x.y,
					hp: x.hp,
					dead: x.dead,
					aggro: x.aggro
				} : null;
			};
			const w = wardenNpc();
			return {
				holeb: e(HOLEB_ID),
				pelletier: e(PELLETIER_ID),
				wardenFoe: e(WARDEN_ENEMY_ID),
				wardenNpc: w ? {
					x: w.x,
					y: w.y
				} : null,
				wardenState,
				flood: world?.flood ?? null,
				checkpoint: world?.checkpoint ?? null,
				dialogue: dialogue ? {
					speaker: dialogue.speaker,
					choices: dialogue.choices.map((c) => c.id)
				} : null
			};
		},
		stats: () => player ? {
			scrap: player.scrap,
			stamina: player.stamina,
			maxStamina: player.maxStamina,
			hp: player.hp,
			atk: player.atk,
			def: player.def,
			sight: sightRadius(),
			perc: perc(),
			feet: player.feetId,
			back: player.backId
		} : null,
		setScrap: (n) => {
			if (player) player.scrap = n;
		},
		setStamina: (n) => {
			if (player) player.stamina = n;
		},
		togglePack: () => api.togglePack(),
		pressBack: () => api.back(),
		dbgInv: () => player ? {
			slots: Object.fromEntries(EQUIP_SLOTS.map((s) => [s, player[SLOT_FIELD[s]]])),
			atk: player.atk,
			def: player.def,
			rows: layoutGrid(player).rows,
			over: layoutGrid(player).over,
			grid: player.gridPos
		} : null,
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
		farmProps: () => world ? world.props.filter((p) => inFarm(p.tx, p.ty)).map((p) => ({
			kind: p.kind,
			tx: p.tx,
			ty: p.ty,
			x: propCenter(p).x,
			y: propCenter(p).y
		})) : [],
		propsNear: (x, y, r) => world ? world.props.map((p) => ({
			id: p.id,
			kind: p.kind,
			...propCenter(p),
			fade: p.fade || 0
		})).filter((p) => Math.hypot(p.x - x, p.y - y) < r) : [],
		beastAt: (id, kind, x, y) => {
			const e = world?.enemies.find((q) => q.id === id);
			if (!e) return;
			e.kind = kind;
			e.x = x;
			e.y = y;
			e.homeX = x;
			e.homeY = y;
			e.temper = "hostile";
			e.aggro = true;
			e.dead = false;
			e.hp = Math.max(e.hp, 10);
			e.path = null;
		},
		setLook: (look) => {
			if (player) player.look = look;
		},
		wear: (slot, id) => {
			if (player) player[slot] = id;
		},
		dbgDir: () => player ? player.dir : -1,
		walkStraight: (x, y) => {
			intent = {
				kind: "walk",
				x,
				y,
				path: [{
					x,
					y
				}]
			};
		},
		openArea: (x, y, R) => {
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
				if (ok) best = {
					x: (tx + .5) * 64,
					y: (ty + .5) * 64
				};
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
		heroLogStart: () => {
			heroLog = [];
		},
		heroLogTake: () => {
			const l = heroLog || [];
			heroLog = [];
			return l;
		},
		hurtNow: () => {
			if (player) player.hurt = .4;
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
		raidState: () => raid ? {
			night: raid.night,
			wave: raid.wave,
			waves: raid.waves,
			phase: raid.phase,
			house: raid.house,
			kills: raid.kills,
			mode: raidMode
		} : {
			none: true,
			mode: raidMode,
			held: raidsHeld
		},
		raidHouseHit: (n) => {
			if (raid) raid.house -= n;
		},
		raidMode: () => api.raidMode(),
		setSnow: (n) => {
			snow = n;
			sync(true);
		},
		startRaidNow: () => {
			startRaid();
			return !!raid;
		},
		saveNow: () => saveGame(),
		q11State: () => JSON.parse(JSON.stringify({
			...q11,
			mode11,
			m11,
			season: seasonNow(),
			day: curDay(),
			escort: !!escortBodies,
			fishing: !!fishGame
		})),
		q11Set: (patch) => {
			Object.assign(q11, patch);
			q11World();
			sync(true);
		},
		q11Spot: (key) => q11Spot(key),
		bikeInfo: () => {
			const b = world?.props.find((p) => p.farmBike);
			const n = nearBike();
			return {
				mounted,
				built: bikeBuilt(),
				farmBike: b ? propCenter(b) : null,
				near: !!n,
				nearFarm: !!n?.farmBike,
				gas: player?.bag.find((s) => s.id === "gas")?.qty ?? 0,
				gasDist,
				notice: noticeRange(100),
				optional: [...OPTIONAL_ART]
			};
		},
		mountNow: () => api.mount(),
		artLoaded: (names) => names.map((n) => !!(images.get(n) && images.get(n).width)),
		artCols: (n) => images.get(n) ? sheetCols(images.get(n)) : 0,
		folkSheetOf: (role) => {
			const n = world?.npcs.find((m) => m.role === role);
			return n ? folkSheet(n) : null;
		},
		beastSheets: () => (world?.enemies ?? []).filter((e) => !e.dead).map((e) => ({
			id: e.id,
			kind: e.kind,
			variant: e.variant,
			sheet: beastSheet(e),
			x: e.x,
			y: e.y
		})),
		guardPose: (role) => {
			const n = world?.npcs.find((m) => m.role === role);
			if (!n) return null;
			guardPost.set(n.id, -1);
			return n.id;
		},
		lazyDone: () => LAZY_STATE.pending === 0,
		v3State: () => ({
			...JSON.parse(JSON.stringify(v3)),
			dogBody: dogBody ? {
				x: Math.round(dogBody.x),
				y: Math.round(dogBody.y)
			} : null,
			traps: q11.traps,
			toast: v3Toast
		}),
		v3Set: (patch) => {
			Object.assign(v3, patch);
			sync(true);
		},
		v3Train: (id, n) => train(id, n),
		v3Lv: (id) => lv(id),
		v3Price: (n) => v3Price(n),
		v3Ach: (id) => achieve(id),
		v3Build: (id) => buildUpgrade(id),
		v3Daily: () => {
			clock += DAY_LENGTH_SEC;
			q11.farm.lastDay = curDay() - 1;
			q11Daily();
		},
		v3Travel: (n) => travelTo(n, n === 0 ? () => {
			const s = skowSign();
			return {
				x: s.x + 90,
				y: s.y + 60
			};
		} : null),
		v3Tracks: () => world ? world.enemies.filter((e) => isGame(e)).map((e) => ({
			id: e.id,
			kind: e.kind,
			temper: e.temper,
			n: e.trail?.length ?? 0,
			last: e.trail?.[e.trail.length - 1] ?? {
				x: e.x,
				y: e.y
			},
			x: e.x,
			y: e.y,
			aggro: e.aggro,
			tracked: !!e.tracked
		})) : [],
		v3Sight: () => sightRadius(),
		v3Dog: () => ({
			mode: v3.dog.mode,
			hp: v3.dog.hp,
			down: v3.dog.down,
			body: dogBody ? {
				x: dogBody.x,
				y: dogBody.y
			} : null
		}),
		dogHurt: (n) => dogHurt(n),
		skins: () => world ? world.props.filter((p) => p.skin).map((p) => ({
			kind: p.kind,
			skin: p.skin,
			label: p.label || "",
			tx: p.tx,
			ty: p.ty
		})) : [],
		v3Spot: (k) => q11Spot(k),
		audio: () => audioState(),
		lazyPending: () => LAZY_STATE.pending,
		dismountNow: () => api.dismount(),
		q11Cur: (id) => {
			const q = questById(id);
			const st = q11.q[id];
			const step = q && q11Cur(q);
			return {
				s: st?.s ?? 0,
				n: q?.steps.length ?? 0,
				kind: step?.kind ?? "",
				site: step?.site ?? "",
				left: st?.left ?? 0
			};
		},
		q11Targets: () => q11Targets().map((t) => ({
			key: t.key,
			mode: t.mode,
			x: Math.round(t.x),
			y: Math.round(t.y)
		})),
		q11Force: (o) => {
			if ("fish" in o) fishForce = o.fish;
			if ("caravan" in o) caravanForce = o.caravan;
		},
		q11Mode: (k) => api.startMode(k),
		q11ModeEnd: (won) => q11EndMode(!!won, "Test: the mode ends."),
		q11ModeTime: (sec) => {
			if (m11) {
				if (mode11 === "watch") m11.t += sec;
				if (mode11 === "winter") clock += sec;
			}
		},
		modeResult: () => useModeResult.getState().result,
		addStone: (n) => {
			if (player) player.stone += n;
		},
		addIron: (n) => {
			if (player) player.scrap += n;
		},
		q10State: () => JSON.parse(JSON.stringify(q10)),
		q10Set: (patch) => {
			Object.assign(q10, patch);
			q10World();
			sync(true);
		},
		q10Spot: (key) => q10Spot(key),
		q10Targets: () => q10Targets().map((t) => ({
			key: t.key,
			mode: t.mode,
			x: Math.round(t.x),
			y: Math.round(t.y)
		})),
		q10Dog: () => dogBody ? {
			x: Math.round(dogBody.x),
			y: Math.round(dogBody.y)
		} : null,
		q10EndRaid: (won) => endRaid(!!won, "Test: the raid ends."),
		dialogueNow: () => dialogue ? {
			speaker: dialogue.speaker,
			text: dialogue.text,
			choices: dialogue.choices.map((c) => ({
				id: c.id,
				label: c.label
			}))
		} : null,
		frameStats: () => ({
			avg: +frameMs.avg.toFixed(2),
			worst: +frameMs.worst.toFixed(2),
			p95: +[...frameMs.list].sort((a, b) => a - b)[Math.floor(frameMs.list.length * .95)]?.toFixed(2),
			n: frameMs.n,
			gfxHigh
		}),
		weatherMix: () => ({ ...weatherMix }),
		vehicles: () => world ? world.props.filter((p) => p.kind === "car-sedan" || p.kind === "car-truck").map((p) => ({
			kind: p.kind,
			tx: p.tx,
			ty: p.ty,
			...propCenter(p),
			art: vehicleArt(p)
		})) : [],
		setHour: (h) => {
			const span = DAY_LENGTH_SEC;
			clock = Math.floor(clock / span) * span + h / 24 * span;
			sync(true);
		},
		heroSheet: (name) => {
			const img = images.get(name);
			if (!img) return "";
			const src = heroSource(name, img);
			if (src.toDataURL) return src.toDataURL();
			const c = document.createElement("canvas");
			c.width = img.width;
			c.height = img.height;
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
var FARM_PAINTED_PROPS = true;
function stripFrames(name, img) {
	if (!img || !name) return 1;
	if (!(name.endsWith("-atk") || name.endsWith("-dead") || name.startsWith("guard-"))) return 1;
	return img.width / img.height > 2.2 ? 4 : 1;
}
/** 8-direction combat sheets (4 frames x 8 facing rows, taller than wide): drop-in for any *-atk / *-dead. */
var TALL_COMBAT = /* @__PURE__ */ new Set();
/** v12: gw14 sheets on their own grids (bike 78x76, tractor 143x100, hero-ride 87x92). */
var TRACTOR_ROW = 6;
var V2_COLS = {
	"v2/bike-ride": 6,
	"v2/bike-parked": 1,
	"v2/hero-ride": 6,
	"v2/tractor-drive": 4
};
/** v12: gw14 people (88x124 cells, 8 facing rows). */
var V2_FOLK = /^v2\/(hollowed|holt|jack|mira|nora|sarah|cyndal|loki|marcel|justin|player|boss-collector|bandit-[a-z]+)-/;
/** v12: raider attack / death come from the gw14 action sheets under the legacy -atk / -dead names. */
var ART_ALIAS = {
	wolf: "v2/wolf-walk",
	"wolf-dead": "v2/wolf-dead"
};
for (const k of [
	"scout",
	"armor",
	"brute",
	"torch",
	"gray",
	"blue"
]) {
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
		const c = document.createElement("canvas");
		c.width = img.width;
		c.height = img.height;
		const g = c.getContext("2d", { willReadFrequently: true });
		g.drawImage(img, 0, 0);
		const d = g.getImageData(0, 0, img.width, img.height).data;
		for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
			const x0 = Math.round(k * sw), y0 = Math.round(r * sh), w = Math.round(sw), h = Math.round(sh);
			let bot = -1;
			for (let y = h - 1; y >= 0 && bot < 0; y--) for (let x = 0; x < w; x++) if (d[((y0 + y) * img.width + x0 + x) * 4 + 3] > 60) {
				bot = y;
				break;
			}
			let sx = 0, n = 0;
			for (let y = Math.max(0, bot - 3); y <= bot; y++) for (let x = 0; x < w; x++) if (d[((y0 + y) * img.width + x0 + x) * 4 + 3] > 60) {
				sx += x;
				n++;
			}
			out.push(n ? sx / n : 0);
		}
	} catch {}
	img.footX = out;
	return out;
}
/** v14.1 scale check: NPC and raider sheets were drawn at 98-104 px against the hero's 69 px. At 11 px/ft every
* person is drawn at real height: grown men and women 66 px (6 ft), kids (Cyndal, Loki) 58 px. Each character is
* measured once from its walk/base sheet so all its poses share one scale. */
var FIG_ADULT = 66;
var FIG_KID = 58;
var figCache = /* @__PURE__ */ new Map();
function figFamily(name) {
	if (/^(v2\/)?hero|^pl\/|^overlay-/.test(name)) return null;
	let m = name.match(/^v2\/(bandit-[a-z]+|hollowed|[a-z]+)-(walk|run|idle|axe|gun|gun-atk|crouch|carry|death|down|hit|talk|walk-atk|walk-dead)$/);
	if (m && !/^(wolf|bike|tractor|hero)/.test(m[1])) return {
		key: "v2/" + m[1],
		ref: [`v2/${m[1]}-walk`, `v2/${m[1]}-idle`]
	};
	m = name.match(/^(npc-[a-z]+|guard-(?:watch-)?[a-z]+|raider(?:-[a-z]+)?|boss-[a-z]+|villager)(?:-atk|-dead)?$/);
	if (m && !/-dead$/.test(name)) return {
		key: m[1],
		ref: [m[1]]
	};
	return null;
}
function measureFig(img, sh) {
	try {
		const cols = sheetCols(img), sw = Math.floor(img.width / cols), h = Math.floor(sh);
		const c = document.createElement("canvas");
		c.width = sw;
		c.height = h;
		const g = c.getContext("2d", { willReadFrequently: true });
		if (!g) return 0;
		let best = 0;
		for (let f = 0; f < Math.min(cols, 4); f++) {
			g.clearRect(0, 0, sw, h);
			g.drawImage(img, f * sw, 0, sw, h, 0, 0, sw, h);
			const d = g.getImageData(0, 0, sw, h).data;
			let top = -1, bot = -1;
			for (let y = 0; y < h && top < 0; y++) for (let x = 0; x < sw; x++) if (d[(y * sw + x) * 4 + 3] > 60) {
				top = y;
				break;
			}
			for (let y = h - 1; y >= 0 && bot < 0; y--) for (let x = 0; x < sw; x++) if (d[(y * sw + x) * 4 + 3] > 60) {
				bot = y;
				break;
			}
			if (top >= 0) best = Math.max(best, bot - top + 1);
		}
		return best / h;
	} catch {
		return 0;
	}
}
function figScale(name, drawH, images) {
	const fam = figFamily(name);
	if (!fam || typeof document === "undefined") return 1;
	let frac = figCache.get(fam.key);
	if (frac == null) {
		const ref = fam.ref.map((r) => images.get(r)).find((im) => im && im.width) || images.get(name);
		if (!ref || !ref.width) return 1;
		const rows = sheetRowsOf(fam.ref[0]) || 1;
		frac = measureFig(ref, ref.height / rows);
		figCache.set(fam.key, frac);
	}
	if (frac < .2) return 1;
	const want = (/cyndal|loki/.test(fam.key) ? FIG_KID : FIG_ADULT) * (/^boss-/.test(fam.key) ? 1.08 : 1);
	const k = Math.max(.4, Math.min(1.6, want / (frac * drawH)));
	figLog[fam.key] = {
		frac: +frac.toFixed(3),
		k: +k.toFixed(3),
		px: Math.round(frac * drawH * k)
	};
	return k;
}
var figLog = {};
/** v10.1: the gw12 Justin sheets are a 69 px figure in an 88x124 cell; draw them at the same 69 px hero height as the walk. */
var HERO69 = /* @__PURE__ */ new Set([
	"hero",
	"hero-gun",
	"hero-gun-atk",
	"hero-hit",
	"hero-down",
	"v2/hero-idle",
	"v2/hero-axe",
	"v2/hero-death"
]);
function heroScale(name) {
	return HERO69.has(name) || name.startsWith("pl/") ? 99.944 / 69 : 1;
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
function measurePose(img, sheet, sheetRows = 4) {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	const g = canvas.getContext("2d", { willReadFrequently: true });
	const empty = {
		foot: .92,
		feet: new Float32Array([.92]),
		footX: new Float32Array([.5])
	};
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
		return {
			foot: b / img.height,
			feet: new Float32Array([b / img.height]),
			footX: new Float32Array([.5])
		};
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
		for (let y = yStart; y < bottom; y++) for (let x = 0; x < cw; x++) if (data[((y0 + y) * img.width + (x0 + x)) * 4 + 3] > 24) {
			sx += x;
			n++;
		}
		const i = row * cols + col;
		feet[i] = bottom / ch;
		footX[i] = n ? sx / n / cw : .5;
		frac = Math.max(frac, feet[i]);
	}
	return {
		foot: frac || .92,
		feet,
		footX
	};
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
		const cols = w % 88 === 0 && (w / 88 === 4 || w / 88 === 6 || w / 88 === 8) ? w / 88 : 4;
		const cw = Math.floor(w / cols);
		for (let row = 0; row < protectRows; row++) for (let col = 0; col < cols; col++) {
			const x0 = col * cw;
			const y0 = row * ch;
			let bottom = -1;
			for (let y = ch - 1; y >= 0 && bottom < 0; y--) for (let x = 0; x < cw; x++) if (alpha0[(y0 + y) * w + x0 + x] > 24) {
				bottom = y;
				break;
			}
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
var OPTIONAL_ART = /* @__PURE__ */ new Set();
async function loadImages(images) {
	try {
		const r = await fetch(`/game/v2/optional.json?v=${ART_V}`);
		if (r.ok) {
			for (const n of await r.json()) if (typeof n === "string") OPTIONAL_ART.add(n);
		}
	} catch {}
	const extra = [...OPTIONAL_ART].filter((n) => n.startsWith("v2/"));
	for (const n of [...extra]) if (/^v2\/(bandit-[a-z]+|boss-collector)-walk$/.test(n)) extra.push(`${n}-atk`, `${n}-dead`);
	const all = [...IMAGES, ...extra];
	const core = all.filter((n) => !LAZY_SHEET.test(n));
	const lazy = all.filter((n) => LAZY_SHEET.test(n));
	await loadSet(images, core);
	LAZY_STATE.pending = lazy.length;
	LAZY_STATE.done = loadSet(images, lazy).then(() => {
		LAZY_STATE.pending = 0;
	});
}
var LAZY_SHEET = /^boss-|-(atk|dead|death|gun-atk|axe|down|hit|crouch|carry|talk)$/;
var LAZY_STATE = {
	pending: -1,
	done: Promise.resolve()
};
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
var SLOT_BOX = {
	head: {
		x: 4,
		y: 0,
		w: 2,
		h: 2,
		label: "Head"
	},
	main: {
		x: 0,
		y: 1,
		w: 2,
		h: 4,
		label: "Weapon"
	},
	off: {
		x: 8,
		y: 1,
		w: 2,
		h: 4,
		label: "Off-hand"
	},
	hands: {
		x: 0,
		y: 6,
		w: 2,
		h: 2,
		label: "Hands"
	},
	body: {
		x: 8,
		y: 6,
		w: 2,
		h: 3,
		label: "Body"
	},
	back: {
		x: 0,
		y: 9,
		w: 2,
		h: 3,
		label: "Back"
	},
	legs: {
		x: 8,
		y: 9,
		w: 2,
		h: 2,
		label: "Legs"
	},
	feet: {
		x: 4,
		y: 10,
		w: 2,
		h: 2,
		label: "Feet"
	}
};
var SLOTS = Object.keys(SLOT_BOX);
/** Faint silhouettes for empty slots (public/game/ui/slot-*.png). */
var SLOT_HINT = {
	head: "/game/ui/slot-helmet.png?v=2050",
	body: "/game/ui/slot-coat.png?v=2050",
	legs: "/game/ui/slot-pants.png?v=2050",
	feet: "/game/ui/slot-boots.png?v=2050",
	hands: "/game/ui/slot-gloves.png?v=2050",
	main: "/game/ui/slot-weapon.png?v=2050",
	off: "/game/ui/slot-weapon.png?v=2050",
	back: "/game/ui/slot-back.png?v=2050"
};
function useCell(rows) {
	const calc = () => {
		if (typeof window === "undefined") return 30;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const side = vw >= 620;
		const byH = side ? (vh - 62) / 12 : (vh - 120) / (12 + rows + 4);
		const byW = side ? (vw - 48) / 21 : (vw - 32) / 10;
		return Math.max(18, Math.min(40, Math.floor(Math.min(byH, byW))));
	};
	const [cell, setCell] = (0, import_react.useState)(calc);
	(0, import_react.useEffect)(() => {
		const on = () => setCell(calc());
		on();
		window.addEventListener("resize", on);
		return () => window.removeEventListener("resize", on);
	}, [rows]);
	return cell;
}
var QUALITY_TINT = {
	rare: "#e6c56a",
	good: "#9fb46a",
	standard: "#c9b48a",
	poor: "#8a7f70"
};
function Inventory({ inv, api, turnBased, craft, onClose }) {
	const cell = useCell(inv.rows);
	const [pick, setPick] = (0, import_react.useState)(null);
	const [drag, setDrag] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("items");
	const gridRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)(null);
	dragRef.current = drag;
	const all = [...inv.items, ...SLOTS.map((s) => inv.slots[s]).filter((x) => !!x)];
	const picked = pick ? (pick.from === "grid" ? inv.items.find((i) => i.id === pick.id) : inv.slots[pick.from]) ?? null : null;
	(0, import_react.useEffect)(() => {
		if (pick && !picked) setPick(null);
	}, [pick, picked]);
	const active = drag?.live ? drag : pick;
	const activeItem = active ? all.find((i) => i.id === active.id) : null;
	const canTake = (slot) => !!activeItem && activeItem.fits.includes(slot);
	const place = (p, target) => {
		if (!api) return;
		if (target.slot) {
			if (target.slot === p.from) return;
			api.invEquip(p.id, target.slot);
		} else if (target.cx !== void 0 && target.cy !== void 0) {
			if (p.from === "grid") api.invMove(p.id, target.cx, target.cy);
			else api.invUnequip(p.from, target.cx, target.cy);
		}
	};
	const cellAt = (clientX, clientY, gx = 0, gy = 0) => {
		const g = gridRef.current?.getBoundingClientRect();
		if (!g || clientX < g.left || clientX > g.right || clientY < g.top || clientY > g.bottom) return null;
		return {
			cx: Math.floor((clientX - g.left) / cell) - gx,
			cy: Math.floor((clientY - g.top) / cell) - gy
		};
	};
	const slotAt = (clientX, clientY) => {
		return (document.elementFromPoint(clientX, clientY)?.closest("[data-slot]"))?.dataset.slot ?? null;
	};
	const down = (e, item, from) => {
		e.stopPropagation();
		e.currentTarget.setPointerCapture?.(e.pointerId);
		const r = e.currentTarget.getBoundingClientRect();
		const gx = from === "grid" ? Math.min(item.w - 1, Math.max(0, Math.floor((e.clientX - r.left) / cell))) : 0;
		const gy = from === "grid" ? Math.min(item.h - 1, Math.max(0, Math.floor((e.clientY - r.top) / cell))) : 0;
		setDrag({
			id: item.id,
			from,
			sx: e.clientX,
			sy: e.clientY,
			x: e.clientX,
			y: e.clientY,
			gx,
			gy,
			w: item.w,
			h: item.h,
			icon: item.icon,
			live: false
		});
	};
	const move = (e) => {
		const d = dragRef.current;
		if (!d) return;
		const live = d.live || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8;
		setDrag({
			...d,
			x: e.clientX,
			y: e.clientY,
			live
		});
	};
	const up = (e, item, from) => {
		e.stopPropagation();
		const d = dragRef.current;
		setDrag(null);
		if (!d) return;
		if (d.live) {
			const slot = slotAt(e.clientX, e.clientY);
			const c = cellAt(e.clientX, e.clientY, d.gx, d.gy);
			if (slot) place(d, { slot });
			else if (c) place(d, c);
			setPick({
				id: d.id,
				from: slot ?? "grid"
			});
			return;
		}
		if (pick && pick.id !== item.id && from !== "grid" && activeItem?.fits.includes(from)) {
			place(pick, { slot: from });
			setPick(null);
			return;
		}
		setPick(pick && pick.id === item.id && pick.from === from ? null : {
			id: item.id,
			from
		});
	};
	const tapSlot = (slot) => {
		if (pick && canTake(slot)) {
			place(pick, { slot });
			setPick(null);
		}
	};
	const tapGrid = (e) => {
		if (!pick) return;
		const c = cellAt(e.clientX, e.clientY);
		if (!c) return;
		place(pick, c);
		setPick(null);
	};
	const ghostCell = drag?.live ? cellAt(drag.x, drag.y, drag.gx, drag.gy) : null;
	const S = (n) => n * cell;
	const equippedFor = (it) => {
		const slot = it.fits[0];
		const worn = slot ? inv.slots[slot] : null;
		return worn && worn.id !== it.id ? worn : null;
	};
	const itemBox = (it, from, box) => {
		const isPicked = pick?.id === it.id && pick.from === from;
		const dragging = drag?.live && drag.id === it.id && drag.from === from;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-label": it.name,
			className: "absolute flex items-center justify-center",
			style: {
				left: S(box.x),
				top: S(box.y),
				width: S(box.w),
				height: S(box.h),
				touchAction: "none",
				opacity: dragging ? .35 : 1,
				background: from === "grid" ? "rgba(36,30,24,0.92)" : "transparent",
				boxShadow: isPicked ? "inset 0 0 0 2px #e6c56a" : from === "grid" ? `inset 0 0 0 1px ${QUALITY_TINT[it.quality] ?? "#6b6052"}55` : "none"
			},
			onPointerDown: (e) => down(e, it, from),
			onPointerMove: move,
			onPointerUp: (e) => up(e, it, from),
			onPointerCancel: () => setDrag(null),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: it.icon,
				alt: "",
				draggable: false,
				className: "pointer-events-none max-h-[92%] max-w-[92%] object-contain"
			}), it.qty > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute bottom-0 right-0.5 text-[10px] font-bold text-[#efe6d4] [text-shadow:0_1px_2px_#000]",
				children: it.qty
			}) : null]
		}, `${from}-${it.id}`);
	};
	const statLine = (it) => {
		const worn = equippedFor(it);
		const parts = [];
		const cmp = (label, a, b) => {
			const d = b === null ? null : a - b;
			parts.push(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-semibold",
					children: [a, d !== null && d !== 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: d > 0 ? " text-[#9fb46a]" : " text-[#d0745a]",
						children: [
							" (",
							d > 0 ? "+" : "",
							d,
							")"
						]
					}) : null]
				})]
			}, label));
		};
		if (it.kind === "weapon") cmp("Attack", it.atk, worn ? worn.atk : inv.slots.main ? null : 0);
		if (it.kind === "coat") cmp("Armor", it.def, worn ? worn.def : 0);
		if (it.heal > 0) cmp("Heals", it.heal, null);
		if (it.worth > 0) cmp("Trades for", it.worth, null);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-0.5 text-xs",
			children: [parts, worn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[10px] text-muted",
				children: ["vs worn: ", worn.name]
			}) : null]
		});
	};
	const slotOf = (it) => SLOTS.find((s) => inv.slots[s]?.id === it.id) ?? null;
	if (typeof document === "undefined") return null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-1",
		onPointerMove: (e) => drag && move(e),
		onPointerUp: () => drag && !drag.live && setDrag(null),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "plank flex max-h-full flex-col border border-border bg-surface p-2",
			style: { touchAction: "none" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg leading-none",
					children: "Pack"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mr-1 text-muted",
							children: [
								"Atk ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "text-text",
									children: inv.atk
								}),
								" · Armor ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "text-text",
									children: inv.def
								})
							]
						}),
						["items", "craft"].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `plank border px-2.5 py-1.5 font-semibold capitalize ${tab === t ? "border-primary bg-primary text-bg" : "border-border bg-bg"}`,
							onClick: () => setTab(t),
							children: t
						}, t)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `plank border px-2.5 py-1.5 font-semibold ${turnBased ? "border-primary bg-surface-2 text-primary" : "border-border bg-bg"}`,
							onClick: () => api?.setTurnBased(!turnBased),
							children: turnBased ? "Turn-based" : "Real time"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Close pack",
							className: "plank border border-border bg-bg px-3 py-1.5 font-bold",
							onClick: onClose,
							children: "✕"
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-wrap justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative shrink-0 rounded-sm bg-[#1b1611]",
					style: {
						width: S(10),
						height: S(12)
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute flex items-end justify-center",
						style: {
							left: S(2),
							top: S(2),
							width: S(6),
							height: S(8)
						},
						children: inv.figure ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-full",
							style: { aspectRatio: "88 / 124" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: inv.figure,
								alt: "",
								className: "absolute inset-0 h-full w-full"
							}), inv.overlays.map((src) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src,
								alt: "",
								className: "absolute inset-0 h-full w-full"
							}, src))]
						}) : null
					}), SLOTS.map((slot) => {
						const b = SLOT_BOX[slot];
						const it = inv.slots[slot];
						const glow = activeItem && canTake(slot);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-slot": slot,
							className: "absolute",
							style: {
								left: S(b.x),
								top: S(b.y),
								width: S(b.w),
								height: S(b.h),
								background: "rgba(14,11,8,0.85)",
								boxShadow: glow ? "inset 0 0 0 2px #9fb46a, 0 0 8px #9fb46a88" : "inset 0 0 0 1px #5a4c3c, inset 0 0 0 2px #120e0a"
							},
							onPointerUp: () => !drag?.live && tapSlot(slot),
							children: it ? itemBox(it, slot, {
								x: 0,
								y: 0,
								w: b.w,
								h: b.h
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: SLOT_HINT[slot],
								alt: "",
								draggable: false,
								className: "pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 opacity-45",
								style: {
									width: S(b.w) * .66,
									height: Math.min(S(b.h) * .6, S(b.w) * .9),
									objectFit: "contain"
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pointer-events-none absolute inset-x-0 bottom-0.5 text-center text-[9px] uppercase tracking-wide text-[#6f6252]",
								children: b.label
							})] })
						}, slot);
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 flex-col gap-2",
					style: {
						width: S(10) + 2,
						height: S(12)
					},
					children: tab === "items" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: gridRef,
						className: "relative shrink-0",
						style: {
							width: S(10),
							height: S(inv.rows),
							backgroundColor: "#15110d",
							backgroundImage: "linear-gradient(#3a3026 1px, transparent 1px), linear-gradient(90deg, #3a3026 1px, transparent 1px)",
							backgroundSize: `${cell}px ${cell}px`,
							boxShadow: "0 0 0 1px #5a4c3c"
						},
						onPointerUp: (e) => !drag?.live && tapGrid(e),
						children: [
							inv.over > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pointer-events-none absolute inset-x-0 bg-[#d0745a22]",
								style: {
									top: S(inv.rows - inv.over),
									height: S(inv.over)
								}
							}) : null,
							ghostCell ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pointer-events-none absolute",
								style: {
									left: S(ghostCell.cx),
									top: S(ghostCell.cy),
									width: S(drag.w),
									height: S(drag.h),
									boxShadow: "inset 0 0 0 2px #e6c56a"
								}
							}) : null,
							inv.items.map((it) => itemBox(it, "grid", it))
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-h-0 flex-1 overflow-y-auto plank border border-border bg-bg p-2",
						children: picked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-full flex-col gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-semibold leading-tight",
										children: picked.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] capitalize",
										style: { color: QUALITY_TINT[picked.quality] },
										children: picked.quality
									})]
								}),
								statLine(picked),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] leading-snug text-muted",
									children: picked.note
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-auto flex flex-wrap gap-1",
									children: [
										slotOf(picked) && pick?.from !== "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "plank border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold",
											onClick: () => {
												api?.invUnequip(pick.from);
												setPick(null);
											},
											children: "Take off"
										}) : null,
										pick?.from === "grid" ? picked.fits.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "plank bg-primary px-3 py-1.5 text-xs font-semibold text-bg",
											onClick: () => {
												api?.invEquip(picked.id, s);
												setPick(null);
											},
											children: s === "off" ? "Off-hand" : picked.kind === "weapon" ? "Wield" : "Wear"
										}, s)) : null,
										picked.kind !== "weapon" && picked.kind !== "coat" && (picked.heal > 0 || picked.worth > 0 || [
											"bomb",
											"fuel",
											"baitpack",
											"syrup",
											"radio"
										].includes(picked.id)) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "plank bg-primary px-3 py-1.5 text-xs font-semibold text-bg",
											onClick: () => api?.invUse(picked.id),
											children: picked.worth > 0 ? "Trade for iron" : picked.id === "radio" ? "Crank it" : "Use"
										}) : null
									]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] leading-snug text-muted",
							children: ["Drag an item onto a slot to wear it, or back into the pack to take it off. Or tap an item, then tap where it goes.", inv.over > 0 ? " The red rows are overfull: wear or use something before you pick up more." : ""]
						})
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-h-0 flex-1 overflow-y-auto",
						children: craft
					})
				})]
			})]
		}), drag?.live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: drag.icon,
			alt: "",
			className: "pointer-events-none fixed z-50 object-contain opacity-90",
			style: {
				left: drag.x - (drag.gx + .5) * cell,
				top: drag.y - (drag.gy + .5) * cell,
				width: S(drag.w),
				height: S(drag.h)
			}
		}) : null]
	}), document.body);
}
var RECIPE_ICON = [
	House,
	Columns3,
	Hammer,
	Flame
];
function LookPreview({ look, hair, coat, hat, trousers, boots }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let dead = false;
		const load = (src) => new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error(src));
			img.src = src;
		});
		(async () => {
			try {
				const hero = await load("/game/hero.png?v=2072");
				const ids = [
					trousers ? "trousers" : "",
					boots ? "boots" : "",
					coat,
					hat
				].filter(Boolean);
				const parts = [];
				for (const id of ids) try {
					parts.push(await load(`/game/overlay/${id}.png?v=2072`));
				} catch {}
				if (dead || !ref.current) return;
				const cw = 88;
				const ch = 124;
				const tmp = document.createElement("canvas");
				tmp.width = cw;
				tmp.height = ch;
				const tg = tmp.getContext("2d", { willReadFrequently: true });
				const g = ref.current.getContext("2d");
				if (!tg || !g) return;
				tg.drawImage(hero, 0, 0, cw, ch, 0, 0, cw, ch);
				const dyed = tg.getImageData(0, 0, cw, ch);
				dyeBodySheet(dyed, 1, look, hair, 1);
				tg.putImageData(dyed, 0, 0);
				for (const part of parts) tg.drawImage(part, 0, 0, cw, ch, 0, 0, cw, ch);
				const px = tg.getImageData(0, 0, cw, ch).data;
				let x0 = cw, y0 = ch, x1 = 0, y1 = 0;
				for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (px[(y * cw + x) * 4 + 3] > 20) {
					x0 = Math.min(x0, x);
					x1 = Math.max(x1, x);
					y0 = Math.min(y0, y);
					y1 = Math.max(y1, y);
				}
				if (x1 < x0) {
					x0 = 0;
					y0 = 0;
					x1 = 87;
					y1 = 123;
				}
				const side = Math.max(x1 - x0, (y1 - y0) * .72) + 8, mx = (x0 + x1) / 2, sw = Math.round(side), sh = Math.round(side / .72);
				const sx = Math.round(mx - sw / 2), sy = Math.round(y1 + 4 - sh);
				const k = 4;
				ref.current.width = sw * k;
				ref.current.height = sh * k;
				g.imageSmoothingEnabled = false;
				g.clearRect(0, 0, sw * k, sh * k);
				g.drawImage(tmp, sx, sy, sw, sh, 0, 0, sw * k, sh * k);
			} catch {}
		})();
		return () => {
			dead = true;
		};
	}, [
		look,
		hair,
		coat,
		hat,
		trousers,
		boots
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		"aria-label": "Character preview",
		className: "h-36 w-auto short:h-24"
	});
}
function WorldMap14({ wm, go }) {
	const ref = (0, import_react.useRef)(null);
	const img = (0, import_react.useRef)(null);
	const view = (0, import_react.useRef)({
		s: 1,
		x: 0,
		y: 0,
		w: 0,
		h: 0,
		init: false
	});
	const ptr = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const pinch = (0, import_react.useRef)(null);
	const [tick, setTick] = (0, import_react.useState)(0);
	const redraw = () => setTick((n) => n + 1);
	(0, import_react.useEffect)(() => {
		const i = new Image();
		i.onload = redraw;
		i.src = "/game/v14/worldmap.jpg";
		img.current = i;
	}, []);
	(0, import_react.useEffect)(() => {
		const c = ref.current;
		if (!c) return;
		const ro = new ResizeObserver(() => redraw());
		ro.observe(c);
		return () => ro.disconnect();
	}, []);
	const clamp = () => {
		const v = view.current;
		const mw = WM_W * v.s, mh = 720 * v.s;
		v.x = mw <= v.w ? (v.w - mw) / 2 : Math.min(0, Math.max(v.w - mw, v.x));
		v.y = mh <= v.h ? (v.h - mh) / 2 : Math.min(0, Math.max(v.h - mh, v.y));
	};
	const zoomAt = (f, px, py) => {
		const v = view.current;
		const min = Math.min(v.w / WM_W, v.h / 720), max = Math.max(min * 4, 2.2);
		const ns = Math.max(min, Math.min(max, v.s * f));
		const k = ns / v.s;
		v.x = px - (px - v.x) * k;
		v.y = py - (py - v.y) * k;
		v.s = ns;
		clamp();
		redraw();
	};
	(0, import_react.useEffect)(() => {
		const c = ref.current;
		if (!c) return;
		const g = c.getContext("2d");
		if (!g) return;
		const dpr = Math.min(3, window.devicePixelRatio || 1);
		const W = c.clientWidth, H = c.clientHeight;
		if (!W || !H) return;
		if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
			c.width = Math.round(W * dpr);
			c.height = Math.round(H * dpr);
		}
		const v = view.current;
		v.w = W;
		v.h = H;
		if (!v.init) {
			v.s = Math.max(W / WM_W, H / 720) * (H > W ? 1 : 1.15);
			const p = hexCenter(wm.q, wm.r);
			v.x = W / 2 - p.x * v.s;
			v.y = H / 2 - p.y * v.s;
			v.init = true;
		}
		clamp();
		g.setTransform(dpr, 0, 0, dpr, 0, 0);
		g.fillStyle = "#1c1814";
		g.fillRect(0, 0, W, H);
		g.save();
		g.translate(v.x, v.y);
		g.scale(v.s, v.s);
		if (img.current?.complete && img.current.naturalWidth) g.drawImage(img.current, 0, 0, WM_W, 720);
		const fog = new Set(wm.fog);
		const hexPathD = (x, y, s) => {
			g.beginPath();
			for (let i = 0; i < 6; i++) {
				const a = Math.PI / 180 * (60 * i - 30);
				g.lineTo(x + s * Math.cos(a), y + s * Math.sin(a));
			}
			g.closePath();
		};
		for (let r = 0; r < 9; r++) for (let q = 0; q < 12; q++) {
			const { x, y } = hexCenter(q, r);
			hexPathD(x, y, 50);
			if (!fog.has(`${q},${r}`)) {
				g.fillStyle = "rgba(24,20,16,0.88)";
				g.fill();
			}
			g.strokeStyle = "rgba(240,220,170,0.4)";
			g.lineWidth = 1.5 / v.s;
			g.stroke();
		}
		g.strokeStyle = "#f0d090";
		g.lineWidth = 3 / v.s;
		g.setLineDash([6 / v.s, 6 / v.s]);
		g.beginPath();
		const st = hexCenter(wm.q, wm.r);
		g.moveTo(st.x, st.y);
		for (const [q, r] of wm.path) {
			const p = hexCenter(q, r);
			g.lineTo(p.x, p.y);
		}
		g.stroke();
		g.setLineDash([]);
		g.restore();
		const sc = (x, y) => ({
			x: v.x + x * v.s,
			y: v.y + y * v.s
		});
		g.textAlign = "center";
		g.textBaseline = "middle";
		const label = (name, q, r, color, sub) => {
			const p = hexCenter(q, r);
			const o = sc(p.x, p.y);
			g.font = "600 15px sans-serif";
			const w = Math.max(g.measureText(name).width, sub ? g.measureText(sub).width * .85 : 0) + 14;
			const h = sub ? 38 : 24;
			const y = o.y + 18 * Math.min(1.6, v.s * 1.1);
			g.fillStyle = "rgba(20,16,12,0.85)";
			g.fillRect(o.x - w / 2, y, w, h);
			g.strokeStyle = color;
			g.lineWidth = 1;
			g.strokeRect(o.x - w / 2 + .5, y + .5, w - 1, h - 1);
			g.fillStyle = "#f4e6c4";
			g.fillText(name, o.x, y + 12);
			if (sub) {
				g.font = "12px sans-serif";
				g.fillStyle = color;
				g.fillText(sub, o.x, y + 28);
			}
		};
		for (const l of WM_LOCS) if (fog.has(`${l.q},${l.r}`)) label(l.name, l.q, l.r, "#c9a36a");
		for (const l of wm.loot ?? []) if (fog.has(`${l.q},${l.r}`)) label(l.name, l.q, l.r, l.ready ? "#9fd07a" : "#9a8a70", l.ready ? "Loot restocked" : `Picked over · ${l.days}d`);
		const m = sc(st.x, st.y);
		g.fillStyle = "#d0644a";
		g.strokeStyle = "#1c1814";
		g.lineWidth = 3;
		g.beginPath();
		g.arc(m.x, m.y - 4, 11, 0, Math.PI * 2);
		g.fill();
		g.stroke();
	});
	const local = (e) => {
		const b = ref.current.getBoundingClientRect();
		return {
			x: e.clientX - b.left,
			y: e.clientY - b.top
		};
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		"data-testid": "hex-map",
		"data-zoom": view.current.s.toFixed(3),
		"data-tick": tick,
		className: "block h-full w-full plank border border-border",
		style: { touchAction: "none" },
		onWheel: (e) => {
			const p = local(e);
			zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y);
		},
		onPointerDown: (e) => {
			e.target.setPointerCapture?.(e.pointerId);
			const p = local(e);
			ptr.current.set(e.pointerId, {
				...p,
				sx: p.x,
				sy: p.y
			});
			if (ptr.current.size === 2) {
				const [a, b] = [...ptr.current.values()];
				pinch.current = {
					d: Math.hypot(a.x - b.x, a.y - b.y),
					s: view.current.s
				};
			}
		},
		onPointerMove: (e) => {
			const o = ptr.current.get(e.pointerId);
			if (!o) return;
			const p = local(e);
			const v = view.current;
			if (ptr.current.size >= 2 && pinch.current) {
				o.x = p.x;
				o.y = p.y;
				const [a, b] = [...ptr.current.values()];
				const d = Math.hypot(a.x - b.x, a.y - b.y);
				zoomAt(pinch.current.s * d / Math.max(1, pinch.current.d) / v.s, (a.x + b.x) / 2, (a.y + b.y) / 2);
				return;
			}
			v.x += p.x - o.x;
			v.y += p.y - o.y;
			o.x = p.x;
			o.y = p.y;
			clamp();
			redraw();
		},
		onPointerUp: (e) => {
			const o = ptr.current.get(e.pointerId);
			ptr.current.delete(e.pointerId);
			if (ptr.current.size < 2) pinch.current = null;
			if (!o || ptr.current.size) return;
			const p = local(e);
			if (Math.hypot(p.x - o.sx, p.y - o.sy) > 10) return;
			const v = view.current;
			const h = hexAt((p.x - v.x) / v.s, (p.y - v.y) / v.s);
			if (h) go(h[0], h[1]);
		},
		onPointerCancel: (e) => {
			ptr.current.delete(e.pointerId);
			pinch.current = null;
		}
	});
}
/** v14.1 one-thumb stick: drag from the ring; the knob's offset is the walk direction and speed. */
function Stick141({ onMove }) {
	const [k, setK] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const id = (0, import_react.useRef)(null);
	const R = 52;
	const upd = (e) => {
		const b = e.currentTarget.getBoundingClientRect();
		let x = e.clientX - (b.left + b.width / 2), y = e.clientY - (b.top + b.height / 2);
		const m = Math.hypot(x, y);
		if (m > R) {
			x = x / m * R;
			y = y / m * R;
		}
		setK({
			x,
			y
		});
		onMove(x / R, y / R);
	};
	const end = () => {
		id.current = null;
		setK({
			x: 0,
			y: 0
		});
		onMove(0, 0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-v141": "stick",
		"aria-label": "Move stick",
		className: "pointer-events-auto absolute bottom-[calc(max(0.5rem,env(safe-area-inset-bottom))+9.5rem)] left-[max(0.75rem,env(safe-area-inset-left))] z-40 size-32 rounded-full border-2 border-border bg-bg/40 short:bottom-[calc(max(0.5rem,env(safe-area-inset-bottom))+3.5rem)] short:size-28",
		style: { touchAction: "none" },
		onPointerDown: (e) => {
			id.current = e.pointerId;
			e.currentTarget.setPointerCapture?.(e.pointerId);
			upd(e);
			e.stopPropagation();
		},
		onPointerMove: (e) => {
			if (id.current === e.pointerId) upd(e);
		},
		onPointerUp: end,
		onPointerCancel: end,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pointer-events-none absolute left-1/2 top-1/2 size-14 rounded-full border-2 border-primary bg-surface/90",
			style: { transform: `translate(calc(-50% + ${k.x}px), calc(-50% + ${k.y}px))` }
		})
	});
}
function RPG() {
	const canvasRef = (0, import_react.useRef)(null);
	const miniRef = (0, import_react.useRef)(null);
	const apiRef = (0, import_react.useRef)(null);
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const pinch = (0, import_react.useRef)(0);
	const pinchMid = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const pinching = (0, import_react.useRef)(false);
	const hud = useHud();
	const raidResult = useRaidMode((s) => s.result);
	const modeResult = useModeResult((s) => s.result);
	const [name, setName] = (0, import_react.useState)("Packer");
	const [role, setRole] = (0, import_react.useState)("fighter");
	const [look, setLook] = (0, import_react.useState)("wool");
	const [hair, setHair] = (0, import_react.useState)("black");
	const [coat, setCoat] = (0, import_react.useState)("");
	const [hat, setHat] = (0, import_react.useState)("");
	const [trousers, setTrousers] = (0, import_react.useState)(true);
	const [boots, setBoots] = (0, import_react.useState)(true);
	const [backstory, setBackstory] = (0, import_react.useState)("hunter");
	const [hardMode, setHardMode] = (0, import_react.useState)(false);
	const [jNotes, setJNotes] = (0, import_react.useState)(null);
	const [confirmNew, setConfirmNew] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)("trade");
	const [trait, setTrait] = (0, import_react.useState)(null);
	const [bonus, setBonus] = (0, import_react.useState)({
		strength: 0,
		vigor: 0,
		endurance: 0,
		intellect: 0,
		perception: 0,
		luck: 0
	});
	const [packTab, setPackTab] = (0, import_react.useState)("items");
	const [journalOpen, setJournalOpen] = (0, import_react.useState)(false);
	const [mapOpen, setMapOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const on = (e) => {
			if (e.repeat || e.target?.tagName === "INPUT") return;
			if (useHud.getState().phase !== "play") return;
			if (e.code === "KeyM") setMapOpen((o) => !o);
			else if (e.code === "KeyJ") setJournalOpen((o) => !o);
		};
		window.addEventListener("keydown", on);
		return () => window.removeEventListener("keydown", on);
	}, []);
	const [jTab, setJTab] = (0, import_react.useState)("quests");
	const [toastN, setToastN] = (0, import_react.useState)(0);
	const toast = hud.v113?.toast;
	(0, import_react.useEffect)(() => {
		if (!toast) return;
		setToastN(toast.n);
		const t = window.setTimeout(() => setToastN(-toast.n), 3800);
		return () => window.clearTimeout(t);
	}, [toast?.n]);
	const [trackerOpen, setTrackerOpen0] = (0, import_react.useState)(() => {
		try {
			const v = JSON.parse(localStorage.getItem("maine-rpg-hud") || "{}");
			if (typeof v.track === "boolean") return !v.track;
		} catch {}
		return typeof window === "undefined" || window.innerHeight >= 500;
	});
	const [hcS, setHc] = (0, import_react.useState)(() => {
		try {
			return JSON.parse(localStorage.getItem("maine-rpg-hud") || "{}");
		} catch {
			return {};
		}
	});
	const saveHc = (next) => {
		setHc(next);
		try {
			localStorage.setItem("maine-rpg-hud", JSON.stringify(next));
		} catch {}
	};
	const flipHc = (k) => saveHc({
		...hcS,
		[k]: !hcS[k]
	});
	const hc = hud.buildOpen ? {
		...hcS,
		quest: true,
		health: true,
		mini: true,
		aim: true,
		track: true
	} : hcS;
	const setTrackerOpen = (f) => {
		setTrackerOpen0((o) => {
			const n = f(o);
			saveHc({
				...hcS,
				track: !n
			});
			return n;
		});
	};
	const [flash, setFlash] = (0, import_react.useState)({});
	const lastQ = (0, import_react.useRef)("");
	const lastHp = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (lastQ.current && hud.questText !== lastQ.current && hc.quest) setFlash((f) => ({
			...f,
			quest: Date.now()
		}));
		lastQ.current = hud.questText;
	}, [hud.questText]);
	(0, import_react.useEffect)(() => {
		if (hc.health && hud.hp < lastHp.current - .5) setFlash((f) => ({
			...f,
			health: Date.now()
		}));
		lastHp.current = hud.hp;
	}, [hud.hp]);
	(0, import_react.useEffect)(() => {
		const t = window.setInterval(() => setFlash((f) => {
			const n = { ...f };
			let ch = false;
			for (const k in n) if (Date.now() - n[k] > 2400) {
				delete n[k];
				ch = true;
			}
			return ch ? n : f;
		}), 600);
		return () => window.clearInterval(t);
	}, []);
	const fl = (k) => flash[k] ? "animate-pulse ring-2 ring-primary" : "";
	const MinBtn = ({ k, label, tight }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"data-hud-min": k,
		"aria-label": `${hc[k] ? "Expand" : "Minimize"} ${label}`,
		className: `${tight ? "" : "-my-2"} min-h-10 min-w-10 shrink-0 px-1 text-sm font-bold text-primary`,
		onClick: () => flipHc(k),
		children: hc[k] ? "+" : "–"
	});
	const mapRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!mapOpen) return;
		const draw = () => mapRef.current && apiRef.current?.drawMap(mapRef.current);
		draw();
		const t = window.setInterval(draw, 500);
		return () => window.clearInterval(t);
	}, [mapOpen]);
	const [confirmExit, setConfirmExit] = (0, import_react.useState)(false);
	const short = useShortScreen();
	const playing = hud.phase !== "menu";
	const pointsLeft = 3 - (bonus.strength + bonus.vigor + bonus.endurance + bonus.intellect + bonus.perception + bonus.luck);
	const base = roleStats(role);
	const kit = ROLES.find((item) => item.id === role) ?? ROLES[3];
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const mini = miniRef.current;
		if (!canvas || !mini) return;
		const api = mountGame(canvas, mini);
		apiRef.current = api;
		return () => api.destroy();
	}, []);
	const onBack = (0, import_react.useRef)(() => {});
	onBack.current = () => {
		if (confirmExit) return setConfirmExit(false);
		if (hud.phase === "menu") {
			if (confirmNew) return setConfirmNew(false);
			if (step === "trait") return setStep("points");
			if (step === "points") return setStep("trade");
			return setConfirmExit(true);
		}
		if (journalOpen && hud.phase === "play" && !hud.dialogue) return setJournalOpen(false);
		apiRef.current?.back();
	};
	(0, import_react.useEffect)(() => {
		const cap = window.Capacitor;
		if (!cap?.isNativePlatform?.() || typeof cap.addListener !== "function") return;
		const sub = cap.addListener("App", "backButton", () => onBack.current());
		return () => {
			sub?.remove?.();
		};
	}, []);
	function exitApp() {
		const cap = window.Capacitor;
		try {
			window.__maineSave?.();
		} catch {}
		cap?.nativeCallback?.("App", "exitApp", {});
	}
	function worldPointer(e, type) {
		const rect = e.currentTarget.getBoundingClientRect();
		apiRef.current?.pointer(e.clientX - rect.left, e.clientY - rect.top, type);
	}
	function mapPointer(e, type) {
		if (type === "down") pointers.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		else if (type === "up") pointers.current.delete(e.pointerId);
		else if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (pointers.current.size >= 2) {
			const [a, b] = [...pointers.current.values()];
			const dist = Math.hypot(a.x - b.x, a.y - b.y);
			const midX = (a.x + b.x) / 2;
			const midY = (a.y + b.y) / 2;
			if (type === "move" && pinch.current > 8) {
				apiRef.current?.nudgeZoom(dist / pinch.current);
				apiRef.current?.pan(midX - pinchMid.current.x, midY - pinchMid.current.y);
			}
			pinch.current = dist;
			pinchMid.current = {
				x: midX,
				y: midY
			};
			pinching.current = true;
			return;
		}
		if (pinching.current) {
			if (pointers.current.size === 0) {
				pinching.current = false;
				pinch.current = 0;
			}
			return;
		}
		pinch.current = 0;
		worldPointer(e, type);
	}
	function bump(stat, dir) {
		setBonus((current) => {
			const next = current[stat] + dir;
			const spent = current.strength + current.vigor + current.endurance + current.intellect + current.perception + current.luck;
			if (dir > 0 && spent >= 3) return current;
			if (next < 0) return current;
			return {
				...current,
				[stat]: next
			};
		});
	}
	function startNew() {
		if (!trait || pointsLeft !== 0) return;
		apiRef.current?.begin(name, role, bonus, trait, look, {
			hair,
			coat,
			hat,
			trousers,
			boots,
			backstory,
			hard: hardMode
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 h-dvh w-full overflow-hidden bg-bg text-fg touch-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				width: "0",
				height: "0",
				className: "absolute",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("filter", {
					id: "rough-edge",
					x: "-4%",
					y: "-4%",
					width: "108%",
					height: "108%",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feTurbulence", {
						type: "turbulence",
						baseFrequency: "0.55",
						numOctaves: "2",
						seed: "4",
						result: "n"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDisplacementMap", {
						in: "SourceGraphic",
						in2: "n",
						scale: "2.2",
						xChannelSelector: "R",
						yChannelSelector: "G"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				"aria-label": "Northwestern Maine map",
				className: "absolute inset-0 h-full w-full",
				onPointerDown: (e) => {
					mapPointer(e, "down");
					try {
						e.currentTarget.setPointerCapture(e.pointerId);
					} catch {}
				},
				onPointerMove: (e) => mapPointer(e, "move"),
				onPointerUp: (e) => mapPointer(e, "up"),
				onPointerCancel: (e) => mapPointer(e, "up"),
				onContextMenu: (e) => e.preventDefault(),
				onWheel: (e) => apiRef.current?.nudgeZoom(e.deltaY < 0 ? 1.1 : 1 / 1.1)
			}),
			playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0 z-30 flex flex-col p-2 short:p-1.5 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))]",
				children: [
					hud.inside && (hud.phase === "play" || hud.phase === "dialogue") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": "Leave building",
						className: "pointer-events-auto absolute right-2 top-1/2 z-40 flex min-h-14 min-w-24 -translate-y-1/2 items-center justify-center gap-2 plank border-2 border-primary bg-surface/95 px-4 py-3 text-base font-semibold text-fg shadow-lg active:bg-surface-2 short:right-1.5",
						onClick: () => apiRef.current?.leave(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorOpen, {
							className: "size-5 text-primary",
							"aria-hidden": true
						}), "Leave"]
					}) : null,
					mapOpen && !hud.statsOpen && !hud.packOpen && !hud.dialogue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "pointer-events-auto absolute left-1/2 top-2 bottom-36 z-50 flex max-w-[94vw] -translate-x-1/2 flex-col plank border border-border bg-surface p-3 short:top-1 short:bottom-[3.6rem] short:p-2",
						"aria-label": "World map",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xl short:text-base",
									children: "Map"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-10 px-2 text-sm text-primary",
									onClick: () => setMapOpen(false),
									children: "Close"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
								ref: mapRef,
								width: 468,
								height: 468,
								"data-testid": "world-map",
								style: { aspectRatio: "1 / 1" },
								className: "mx-auto mt-1 min-h-0 max-w-full flex-1 plank border border-border bg-bg"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted short:hidden",
								children: "Only ground you've seen is drawn. White dot: you. Gold: quest marks."
							})
						]
					}) : null,
					hud.v13?.main.ending && hud.v13.main.slide < 99 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-auto absolute inset-0 z-[70] flex items-center justify-center bg-black/85 p-6",
						"data-testid": "ending-screen",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-lg plank border-2 border-primary bg-surface p-5 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs uppercase tracking-widest text-primary",
									children: "The Long Winter · Ending"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-display text-2xl",
									children: hud.v13.main.ending.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-base leading-relaxed",
									"data-testid": "ending-slide",
									children: hud.v13.main.ending.slides[Math.min(hud.v13.main.slide, hud.v13.main.ending.slides.length - 1)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"data-testid": "ending-next",
									className: "mt-4 min-h-11 plank bg-primary px-6 py-2 font-semibold text-bg",
									onClick: () => apiRef.current?.choose13(hud.v13.main.slide + 1 >= hud.v13.main.ending.slides.length ? "v13-ending-close" : "v13-ending-next"),
									children: hud.v13.main.slide + 1 >= hud.v13.main.ending.slides.length ? "Keep playing" : "Next"
								})
							]
						})
					}) : null,
					toast && toastN === toast.n && !hud.buildOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "status",
						"data-testid": "ach-toast",
						className: "pointer-events-none absolute left-1/2 top-3 z-[60] -translate-x-1/2 plank border-2 border-primary bg-surface px-4 py-2 text-center shadow-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-widest text-primary",
								children: "Achievement"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg leading-tight",
								children: toast.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: toast.text
							})
						]
					}) : null,
					hud.buildOpen && (toast && toastN === toast.n || hud.log.length > 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-testid": "toast-stack",
						className: "pointer-events-none absolute left-1/2 top-[3.6rem] z-[60] flex w-[min(22rem,92vw)] -translate-x-1/2 flex-col items-stretch gap-1",
						children: [toast && toastN === toast.n ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "status",
							"data-testid": "ach-toast",
							className: "log-fade plank border-2 border-primary bg-surface px-3 py-1 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] uppercase tracking-widest text-primary",
								children: ["Achievement · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-sm normal-case tracking-normal text-fg",
									children: toast.name
								})]
							})
						}) : null, hud.log.slice(-2).map((line, i, arr) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "log-fade plank bg-bg/95 px-3 py-1 text-center text-sm font-semibold text-fg",
							children: line
						}, hud.logIds?.[hud.log.length - arr.length + i] ?? `${line}-${i}`))]
					}) : null,
					hc.quest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"data-hud": "quest-min",
						className: `pointer-events-auto mr-24 flex max-w-xs items-center gap-1 self-start plank border border-border bg-surface/95 px-2 py-1 ${fl("quest")}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, {
								className: "size-4 shrink-0 text-primary",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "min-w-0 flex-1 truncate text-xs font-semibold",
								children: hud.questText
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinBtn, {
								k: "quest",
								label: "quest panel"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"data-hud": "quest",
						className: "pointer-events-auto mr-24 max-w-xs self-start plank border border-border bg-surface/95 px-3 py-2 short:mr-[6.5rem] short:px-2 short:py-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm font-bold uppercase text-primary short:hidden",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, {
										className: "size-4",
										"aria-hidden": true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1",
										children: hud.region
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinBtn, {
										k: "quest",
										label: "quest panel"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 line-clamp-2 text-base font-semibold leading-snug short:mt-0 short:line-clamp-1 short:text-sm",
								children: hud.questText
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm font-semibold text-primary short:mt-0.5",
								children: hud.clock
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-fg",
								children: hud.karmaWord
							}),
							hud.v13 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 border-t border-border pt-1 text-xs",
								"data-testid": "main-tracker",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-bold uppercase tracking-widest text-primary",
										children: ["The Long Winter · Act ", hud.v13.main.act]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "leading-snug short:line-clamp-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: hud.v13.main.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted short:hidden",
											children: [" · ", hud.v13.main.goal]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-muted",
										"data-testid": "weather-line",
										children: [
											hud.v13.weather.name,
											" · ",
											hud.v13.moon.name,
											hud.v13.ail.length ? ` · ${hud.v13.ail.map((a) => a.name).join(", ")}` : ""
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-0.5 flex gap-1",
										"data-testid": "needs-bars",
										children: [
											[
												"hunger",
												"Food",
												"#c98a4a"
											],
											[
												"thirst",
												"Water",
												"#5a8ac0"
											],
											[
												"sleep",
												"Sleep",
												"#9a8ac0"
											]
										].map(([k, l, c]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1",
											title: `${l} ${Math.round(hud.v13.needs[k])}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-1.5 bg-bg",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-full",
													style: {
														width: `${hud.v13.needs[k]}%`,
														background: c
													}
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted",
												children: l
											})]
										}, k))
									})
								]
							}) : null,
							(() => {
								const act = hud.journal.filter((e) => !e.done && !e.id.startsWith("q11-season")).slice(0, 3);
								if (!act.length || journalOpen || hud.statsOpen || hud.packOpen || hud.dialogue || mapOpen) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 border-t border-border pt-1",
									"data-testid": "quest-tracker",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "flex min-h-10 w-full items-center justify-between text-xs uppercase tracking-widest text-primary",
										onClick: () => setTrackerOpen((o) => !o),
										children: [
											"Tracking ",
											act.length,
											hud.v113?.wind ? ` · wind ${hud.v113.wind}` : "",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: trackerOpen ? "–" : "+" })
										]
									}), trackerOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-0.5",
										children: act.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "text-xs leading-snug short:line-clamp-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: e.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted short:hidden",
												children: [" · ", e.text]
											})]
										}, e.id))
									}) : null]
								});
							})(),
							hud.party ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs",
								children: [
									hud.party.name,
									" with you · ",
									hud.party.hp,
									"/",
									hud.party.maxHp
								]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex min-h-0 flex-col gap-2 overflow-y-auto",
						children: [
							hud.riding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-testid": "dismount-btn",
								style: { touchAction: "manipulation" },
								className: "pointer-events-auto self-center min-h-12 min-w-28 plank bg-primary px-6 py-2 text-base font-semibold text-bg",
								onClick: () => apiRef.current?.dismount(),
								children: "Dismount"
							}) : null,
							hud.v113?.dog && hud.phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto flex items-center gap-1 self-center",
								"data-testid": "dog-cmds",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "px-1 text-xs font-semibold text-fg",
										children: ["Biscuit ", hud.v113.dog.down ? "(laid up)" : `${hud.v113.dog.hp}/30`]
									}),
									[
										"stay",
										"follow",
										"track"
									].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"data-testid": `dog-${m}`,
										style: { touchAction: "manipulation" },
										className: `min-h-10 min-w-14 plank border px-2 text-xs font-semibold capitalize ${hud.v113?.dog?.mode === m ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`,
										onClick: () => apiRef.current?.dogCommand(m),
										children: m
									}, m)),
									hud.v113.dog.hp < 30 && !hud.v113.dog.down ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"data-testid": "dog-heal",
										className: "min-h-10 plank border border-accent bg-surface px-2 text-xs font-semibold",
										onClick: () => apiRef.current?.dogHeal(),
										children: "Patch up"
									}) : null
								]
							}) : null,
							hud.riding && hud.v13?.canTravel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-testid": "travel-btn",
								className: "pointer-events-auto self-center min-h-12 min-w-28 plank border-2 border-primary bg-surface px-6 py-2 text-base font-semibold",
								style: { touchAction: "manipulation" },
								onPointerDown: (e) => e.stopPropagation(),
								onClick: () => apiRef.current?.openTravel(),
								children: "Travel"
							}) : null,
							!hud.riding && hud.canMount ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-testid": "ride-btn",
								className: "pointer-events-auto self-center min-h-12 min-w-28 plank bg-primary px-6 py-2 text-base font-semibold text-bg",
								style: { touchAction: "manipulation" },
								onPointerDown: (e) => e.stopPropagation(),
								onClick: () => apiRef.current?.mount?.(),
								children: "Ride"
							}) : null,
							hud.log.length > 0 && !journalOpen && !mapOpen && !hud.buildOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: short ? "pointer-events-none max-w-[38%] space-y-0.5 self-start text-left text-xs font-semibold" : "pointer-events-none max-w-md space-y-1 self-center text-center text-base font-semibold",
								children: (short ? hud.log.slice(-2) : hud.log).map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: short ? "log-fade plank bg-bg/90 px-2 py-1 text-fg" : "log-fade plank bg-bg/95 px-3 py-1.5 text-fg",
									children: line
								}, hud.logIds?.[(short ? Math.max(0, hud.log.length - 2) : 0) + i] ?? `${line}-${i}`))
							}) : null,
							hud.v141?.store ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"data-v141": "store",
								className: "pointer-events-auto mx-auto flex max-h-[min(70vh,34rem)] w-full max-w-2xl flex-col plank border border-border bg-surface p-3 short:max-h-[78vh] short:p-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-lg text-primary short:text-base",
											children: "Storage chest"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-10 px-3 text-sm text-primary",
											onClick: () => apiRef.current?.v141("store", ["close"]),
											children: "Close"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 grid grid-cols-3 gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"data-v141": "sort",
												className: "min-h-10 plank border border-border bg-bg px-2 text-xs",
												onClick: () => apiRef.current?.v141("store", ["sort"]),
												children: "Quick-sort"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"data-v141": "stack",
												className: "min-h-10 plank border border-border bg-bg px-2 text-xs",
												onClick: () => apiRef.current?.v141("store", ["stack"]),
												children: "Stack to chest"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"data-v141": "stash",
												className: "min-h-10 plank border border-border bg-bg px-2 text-xs",
												onClick: () => apiRef.current?.v141("store", ["stashAll"]),
												children: "Stack to farm stash"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-hidden",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-h-0 flex-col",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs uppercase tracking-widest text-muted",
												children: "Pack · tap to store"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto",
												children: hud.v141.store.pack.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "flex min-h-10 w-full items-center justify-between plank border border-border bg-bg px-2 text-left text-sm",
													onClick: () => apiRef.current?.v141("store", ["put", it.id]),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "truncate",
														children: it.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-muted",
														children: ["×", it.qty]
													})]
												}) }, it.id))
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-h-0 flex-col",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs uppercase tracking-widest text-muted",
												children: "Chest · tap to take"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												"data-v141": "chest-list",
												className: "mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto",
												children: hud.v141.store.chest.length ? hud.v141.store.chest.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "flex min-h-10 w-full items-center justify-between plank border border-border bg-bg px-2 text-left text-sm",
													onClick: () => apiRef.current?.v141("store", ["take", it.id]),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "truncate",
														children: it.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-muted",
														children: ["×", it.qty]
													})]
												}) }, it.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
													className: "text-sm text-muted",
													children: "Empty."
												})
											})]
										})]
									})
								]
							}) : null,
							hud.loot ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "pointer-events-auto mx-auto w-full max-w-lg plank border border-border bg-surface p-3 short:p-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-lg text-primary short:text-base",
										children: hud.loot.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Take what you want. It leaves the ground and goes into your pack. Anything left is gone after one day."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex flex-wrap gap-2",
										children: hud.loot.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "plank border border-border bg-bg px-3 py-2 text-sm",
											onClick: () => apiRef.current?.takeLoot(line.key),
											children: line.label
										}, line.key))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "plank bg-primary px-4 py-2 font-semibold text-bg",
											onClick: () => apiRef.current?.takeLoot("all"),
											children: "Take all"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "plank border border-border px-4 py-2",
											onClick: () => apiRef.current?.takeLoot("close"),
											children: "Leave"
										})]
									})
								]
							}) : null,
							hud.dialogue && typeof document !== "undefined" ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pointer-events-none fixed inset-0 z-[58] flex items-center justify-center p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "pointer-events-auto max-h-full w-full max-w-xl overflow-y-auto overscroll-contain plank border border-border bg-surface p-3 shadow-2xl sm:p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-lg leading-tight text-primary",
											children: hud.dialogue.speaker
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 text-sm leading-snug sm:text-base sm:leading-relaxed",
											children: hud.dialogue.text
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 flex flex-wrap gap-1.5",
											children: hud.dialogue.choices.map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "plank min-h-[40px] bg-primary px-3 py-2 text-left text-sm font-semibold leading-snug text-bg",
												onClick: () => apiRef.current?.choose(choice.id),
												children: choice.label
											}, choice.id))
										})
									]
								})
							}), document.body) : null,
							hud.packOpen && hud.inv ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inventory, {
								inv: hud.inv,
								api: apiRef.current,
								turnBased: hud.turnBased,
								onClose: () => apiRef.current?.togglePack(),
								craft: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-1",
									children: CRAFT.map((recipe) => {
										const stock = (id) => hud.pack.find((s) => s.id === id)?.qty ?? 0;
										const afford = recipe.need.every((n) => stock(n.id) >= n.qty) && hud.scrap >= recipe.iron && hud.wood >= recipe.wood;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center justify-between gap-2 plank border border-border bg-bg px-2 py-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-sm font-semibold leading-tight",
													children: recipe.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-xs text-muted",
													children: recipe.blurb
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "shrink-0 plank bg-primary px-3 py-2 text-sm font-semibold text-bg disabled:opacity-40",
												disabled: !afford,
												onClick: () => apiRef.current?.craft(recipe.id),
												children: "Make"
											})]
										}, recipe.id);
									})
								})
							}) : null,
							journalOpen && !hud.statsOpen && !hud.packOpen && !hud.dialogue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "pointer-events-auto mx-auto max-h-[min(56vh,32rem)] w-full max-w-lg overflow-y-auto overscroll-contain plank border border-border bg-surface p-3 short:max-h-[62vh]",
								"aria-label": "Quest journal",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-xl",
											children: "Journal"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-10 min-w-10 px-2 text-sm text-primary",
											onClick: () => setJournalOpen(false),
											children: "Close"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 grid grid-cols-4 gap-1",
										role: "tablist",
										children: [
											["main", "Main"],
											["quests", "Quests"],
											["skills", "Skills"],
											["ach", "Awards"],
											["farm", "Farm"],
											["allies", "Allies"],
											["diary", "Diary"],
											["gear", "Gear"]
										].map(([k, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											role: "tab",
											"aria-selected": jTab === k,
											"data-testid": `tab-${k}`,
											className: `min-h-10 plank border px-1 text-xs font-semibold ${jTab === k ? "border-primary bg-primary text-bg" : "border-border bg-bg"}`,
											onClick: () => setJTab(k),
											children: l
										}, k))
									}),
									jTab === "main" && hud.v13 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
										className: "mt-2 space-y-1",
										"data-testid": "main-screen",
										children: hud.v13.main.acts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: `plank border px-3 py-2 ${a.n === hud.v13.main.act ? "border-primary bg-bg" : "border-border bg-bg"} ${a.n > hud.v13.main.act ? "opacity-40" : ""}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-semibold",
													children: [
														a.done ? "✓ " : "",
														"Act ",
														a.n,
														": ",
														a.title
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: a.n > hud.v13.main.act ? "…" : a.goal
												}),
												a.notes?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
													className: "mt-1 space-y-0.5 text-xs italic",
													"data-testid": `main-notes-${a.n}`,
													children: a.notes.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t }, i))
												}) : null
											]
										}, a.n))
									}) : null,
									jTab === "allies" && hud.v13 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "mt-2 space-y-1",
										"data-testid": "allies-screen",
										children: [
											hud.v13.loyal.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "plank border border-border bg-bg px-3 py-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-baseline justify-between",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "font-semibold",
															children: c.name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-sm text-primary",
															children: c.left ? "Gone" : `${c.v}`
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "mt-1 h-1.5 bg-surface",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "h-full bg-primary",
															style: { width: `${Math.max(0, (c.v + 100) / 2)}%` }
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-1 text-xs text-muted",
														children: c.left ? "Left after what you did." : c.helps ? "Loyal: helps more in a fight and on siege night." : c.v < 0 ? "Doesn't trust you. Below -40 they leave." : "Will stand with you."
													})
												]
											}, c.id)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "text-xs text-muted",
												children: [
													"Harmony: store ",
													hud.v13.rebuilt.store ? "open" : "closed",
													", school ",
													hud.v13.rebuilt.school ? "open" : "closed",
													", clinic ",
													hud.v13.rebuilt.clinic ? "open" : "closed",
													"."
												]
											}),
											hud.v13.bounties.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "text-xs",
												children: [
													"Bounty: ",
													b.text,
													" ",
													Math.min(b.got, b.need),
													"/",
													b.need,
													" (",
													b.pay,
													" iron)"
												]
											}, i))
										]
									}) : null,
									jTab === "diary" && hud.v13 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2",
										"data-testid": "diary-screen",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "max-h-48 space-y-0.5 overflow-y-auto",
												children: [...hud.v13.diary].reverse().map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													className: "text-xs",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold text-primary",
															children: [
																"Day ",
																d.day,
																"."
															]
														}),
														" ",
														d.text
													]
												}, i))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-xs text-muted",
												children: "Your own notes"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												"data-testid": "diary-notes",
												className: "mt-1 h-20 w-full plank border border-border bg-bg p-2 text-sm",
												value: jNotes ?? hud.v13.notes,
												onChange: (e) => setJNotes(e.target.value),
												onBlur: (e) => {
													apiRef.current?.setNotes(e.target.value);
												}
											})
										]
									}) : null,
									jTab === "gear" && hud.v13 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "mt-2 space-y-1",
										"data-testid": "gear-screen",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
											className: "text-xs text-muted",
											children: hud.v13.set ? `${hud.v13.set.name}: ${hud.v13.set.text}` : "Wear a full matching set (head, chest, legs, hands, feet of one grade) for a bonus. Repair, patch and dye at the workbench through Sarah."
										}), hud.v13.armor.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "plank border border-border bg-bg px-3 py-1.5 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [a.name, a.patched ? " (patched)" : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-primary",
													children: [a.dura, "/100"]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-1 h-1 bg-surface",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-full bg-primary",
													style: { width: `${a.dura}%` }
												})
											})]
										}, a.id))]
									}) : null,
									jTab === "skills" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-2 space-y-1",
										"data-testid": "skills-screen",
										children: (hud.v113?.skills ?? []).map((sk) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "plank border border-border bg-bg px-3 py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-baseline justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-semibold",
														children: sk.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-sm text-primary",
														children: ["Lv ", sk.lv]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mt-1 h-1.5 bg-surface",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-full bg-primary",
														style: { width: `${Math.min(100, sk.xp / sk.need * 100)}%` }
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-muted",
													children: [
														sk.how,
														" Per level: ",
														sk.perk
													]
												})
											]
										}, sk.id))
									}) : null,
									jTab === "ach" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-testid": "ach-screen",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs text-muted",
											children: [
												(hud.v113?.ach ?? []).filter((a) => a.got).length,
												" of ",
												(hud.v113?.ach ?? []).length,
												" earned"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2",
											children: (hud.v113?.ach ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: `plank border px-3 py-2 ${a.got ? "border-primary bg-bg" : "border-border bg-bg opacity-50"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-sm font-semibold",
													children: [a.got ? "★ " : "☆ ", a.name]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: a.text
												})]
											}, a.id))
										})]
									}) : null,
									jTab === "farm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "mt-2 space-y-1",
										"data-testid": "farm-screen",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
											className: "text-xs text-muted",
											children: "Build these through Sarah at the farm: \"Bigger works\"."
										}), (hud.v113?.ups ?? []).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "plank border border-border bg-bg px-3 py-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-baseline justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold",
													children: u.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-sm text-primary",
													children: [
														u.tier,
														"/",
														u.max
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: u.next ? `Next: ${u.next}` : "Fully built."
											})]
										}, u.id))]
									}) : null,
									jTab === "quests" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: ["active", "done"].map((group) => {
										const list = hud.journal.filter((entry) => group === "done" === entry.done);
										if (!list.length) return null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs uppercase tracking-widest text-primary",
												children: group === "active" ? "Active" : "Completed"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "mt-1 space-y-1",
												children: list.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													className: `plank border border-border bg-bg px-3 py-2 ${entry.done ? "opacity-70" : ""}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-semibold",
														children: [entry.done ? "✓ " : "", entry.title]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-sm text-muted",
														children: entry.text
													})]
												}, entry.id))
											})]
										}, group);
									}) }) : null
								]
							}) : null,
							hud.statsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "pointer-events-auto mx-auto max-h-[min(36vh,32rem)] w-full max-w-lg overflow-y-auto overscroll-contain plank border border-border bg-surface p-3 short:max-h-[62vh]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-xl",
											children: "Stats"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-primary",
											children: [
												hud.points,
												" stat · ",
												hud.skillPoints,
												" skill"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted",
										children: [
											hud.karmaWord,
											". ",
											hud.repLine
										]
									}),
									hud.v13 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 plank border border-border bg-bg px-2 py-2 text-xs",
										"data-testid": "core-stats",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-semibold text-primary",
												children: [hud.v13.backstory ? `${hud.v13.backstory[0].toUpperCase()}${hud.v13.backstory.slice(1)} · ` : "", "What your stats do"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
												className: "mt-1 grid grid-cols-2 gap-x-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
														"Carry: ",
														hud.v13.fx.carryLb,
														" lb"
													] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Health bonus: +", hud.v13.fx.hpBonus] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Stamina bonus: +", hud.v13.fx.staminaBonus] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
														"Crit chance: ",
														hud.v13.fx.critPct.toFixed(1),
														"%"
													] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
														"Gun accuracy: +",
														hud.v13.fx.accuracyPct,
														"%"
													] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
														"Trader prices: -",
														hud.v13.fx.barterPct,
														"%"
													] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Talk checks: +", hud.v13.fx.talkBonus] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
														"Sickness resist: ",
														Math.round(hud.v13.fx.sickResist * 100),
														"%"
													] })
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 font-semibold text-primary",
												children: "Perks (every 3 skill levels)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
												className: "mt-1 space-y-0.5",
												"data-testid": "perk-list",
												children: [hud.v13.perks.filter((p) => p.got.length).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: p.got.join(" · ") }, p.skill)), !hud.v13.perks.some((p) => p.got.length) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
													className: "text-muted",
													children: "None yet. Reach level 3 in any skill (Journal, Skills)."
												}) : null]
											})
										]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 grid grid-cols-2 gap-2 short:grid-cols-3",
										children: [
											[
												"strength",
												"Strength",
												hud.strength,
												"Harder hits"
											],
											[
												"vigor",
												"Health",
												hud.vigor,
												"More life"
											],
											[
												"endurance",
												"Endurance",
												hud.endurance,
												"More stamina"
											],
											[
												"intellect",
												"Wits",
												hud.intellect,
												"Skill points, better prices, sharper talk"
											],
											[
												"perception",
												"Perception",
												hud.perception,
												"See farther. Guns reach farther"
											],
											[
												"luck",
												"Luck",
												hud.luck,
												"Better finds. The odd hard hit"
											],
											[
												"agility",
												"Agility",
												hud.v13?.core.agility ?? 1,
												"Stamina, crits"
											],
											[
												"grit",
												"Grit",
												hud.v13?.core.grit ?? 1,
												"Health, shrug off sickness"
											]
										].map(([key, label, value, hint]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2 plank border border-border bg-bg px-2 py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-sm font-semibold",
													children: label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-xs text-muted",
													children: hint
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-lg",
													children: value
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "min-h-10 min-w-10 plank bg-primary px-3 py-2 text-sm font-semibold text-bg disabled:opacity-40",
													disabled: hud.points < 1,
													onClick: () => apiRef.current?.spend(key),
													children: "+"
												})
											]
										}, key))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm font-semibold",
										children: "Skills"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: hud.canRetag ? "Tap a name to tag it. Three tags rise twice as fast, until you spend a skill point." : "Tagged skills rise twice as fast."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-2 grid grid-cols-2 gap-1",
										children: hud.skills.map((skill) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center justify-between gap-2 plank border border-border bg-bg px-2 py-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "min-w-0 text-left",
													onClick: () => hud.canRetag && apiRef.current?.retag(skill.id),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "block text-sm font-semibold",
														children: [skill.name, skill.tagged ? " · tagged" : ""]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-sm",
													children: skill.score
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "plank bg-primary px-3 py-1 text-sm font-semibold text-bg disabled:opacity-40",
													disabled: hud.skillPoints < 1,
													onClick: () => apiRef.current?.spendSkill(skill.id),
													children: "+"
												})
											]
										}, skill.id))
									}),
									hud.perkNames ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-sm",
										children: ["Perks: ", hud.perkNames]
									}) : null,
									hud.perkReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold",
											children: "Pick a perk"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-1 space-y-1",
											children: hud.perkChoices.map((perk) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												disabled: !perk.ok,
												className: "w-full plank border border-border bg-bg px-2 py-2 text-left disabled:opacity-40",
												onClick: () => apiRef.current?.takePerk(perk.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-sm font-semibold",
													children: perk.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-xs text-muted",
													children: perk.blurb
												})]
											}) }, perk.id))
										})]
									}) : null,
									hud.party ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm",
											children: [
												hud.party.name,
												" · ",
												hud.party.hp,
												"/",
												hud.party.maxHp
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "plank border border-border px-3 py-2 text-sm",
											onClick: () => apiRef.current?.dismissParty(),
											children: "Send home"
										})]
									}) : null
								]
							}) : null,
							hud.v14?.craft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"data-v14": "craft",
								className: "pointer-events-auto fixed inset-x-2 top-2 bottom-2 z-50 mx-auto flex max-w-lg flex-col plank border border-border bg-surface/97 p-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
											className: "font-display text-lg leading-none",
											children: ["Workbench · tier ", hud.v14.craft.tier]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-10 min-w-12 plank border border-border px-3 text-sm",
											onClick: () => apiRef.current?.v14("closeCraft"),
											children: "Close"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: hud.v14.craft.mats.map((m) => `${m.m} ${m.have}`).join(" · ")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 min-h-0 flex-1 overflow-y-auto",
										children: [
											"Weapons",
											"Tools",
											"Armor",
											"Traps",
											"Ammo",
											"Meds"
										].map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-xs uppercase tracking-wide text-primary",
												children: g
											}), hud.v14.craft.list.filter((r) => r.group === g).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												"data-craft": r.id,
												disabled: !r.can,
												className: `mt-1 flex w-full items-center justify-between gap-2 plank border px-2 py-2 text-left ${r.can ? "border-primary bg-surface-2" : "border-border bg-surface opacity-75"}`,
												onClick: () => apiRef.current?.v14("craft", r.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "block font-semibold",
														children: [
															r.name,
															r.qty > 1 ? ` ×${r.qty}` : "",
															" ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-xs text-muted",
																children: [
																	"T",
																	r.tier,
																	r.def ? ` · def ${r.def}` : "",
																	r.atk ? ` · atk ${r.atk}` : ""
																]
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block text-xs",
														children: r.locked ? `Needs a tier ${r.tier} bench` : r.need.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: n.have >= n.n ? "text-primary" : "text-[#d0644a]",
															children: [
																i ? " · " : "",
																n.m,
																" ",
																Math.min(n.have, n.n),
																"/",
																n.n
															]
														}, i))
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "shrink-0 text-xs font-semibold",
													children: r.can ? "Make" : r.locked ? "Locked" : "Short"
												})]
											}, r.id))]
										}, g))
									}),
									hud.v14.craft.up ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: !hud.v14.craft.canUp,
										className: `mt-1 plank border px-2 py-2 text-left text-xs ${hud.v14.craft.canUp ? "border-primary bg-surface-2" : "border-border opacity-75"}`,
										onClick: () => apiRef.current?.v14("benchUp"),
										children: [
											"Upgrade the bench to tier ",
											hud.v14.craft.tier + 1,
											": ",
											hud.v14.craft.up.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: n.have >= n.n ? "text-primary" : "text-[#d0644a]",
												children: [
													i ? " · " : "",
													n.m,
													" ",
													Math.min(n.have, n.n),
													"/",
													n.n
												]
											}, i))
										]
									}) : null
								]
							}) : null,
							hud.buildOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto mx-auto flex w-full max-w-lg gap-1",
								"data-v14": "buildtools",
								children: [
									[
										"place",
										"pickup",
										"repair"
									].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: `plank flex-1 border px-2 py-1 text-xs font-semibold ${hud.v14?.tool === t ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`,
										onClick: () => apiRef.current?.v14("tool", t),
										children: t === "place" ? "Place" : t === "pickup" ? "Pick up" : "Repair"
									}, t)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: `plank flex-1 border px-2 py-1 text-xs font-semibold ${hud.v14?.flip ? "border-primary bg-surface-2" : "border-border bg-surface"}`,
										onClick: () => apiRef.current?.v14("rotate"),
										children: "Rotate"
									}),
									hud.v14?.damaged ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "plank flex-1 border border-border bg-surface px-2 py-1 text-xs font-semibold",
										onClick: () => apiRef.current?.v14("repairAll"),
										children: [
											"Fix all (",
											hud.v14.damaged,
											")"
										]
									}) : null
								]
							}) : null,
							hud.buildOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
								className: "pointer-events-auto mx-auto grid max-h-[38vh] w-full max-w-lg grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4",
								children: RECIPES.map((item, index) => {
									const Icon = RECIPE_ICON[index] ?? House;
									const afford = hud.wood >= item.wood && hud.stone >= item.stone && hud.scrap >= item.scrap;
									if (item.v14 && !hud.v14?.secured) return null;
									const selected = hud.recipe === index;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: `plank border px-2 py-2 text-left ${selected ? "border-primary bg-surface-2" : "border-border bg-surface"} ${afford ? "" : "opacity-70"}`,
										onClick: () => apiRef.current?.selectRecipe(index),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2 font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
												className: "size-4 text-primary",
												"aria-hidden": true
											}), item.label]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-xs text-muted",
											children: item.need14 ? Object.entries(item.need14).map(([m, n]) => `${n} ${m === "junk" ? "scrap" : m}`).join(" · ") : `${item.wood} timber · ${item.stone} ledge · ${item.scrap} iron`
										})]
									}, item.kind);
								})
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `pointer-events-none z-40 flex flex-wrap items-center gap-1 [&>button]:pointer-events-auto ${journalOpen || hud.statsOpen || hud.packOpen || hud.dialogue || mapOpen || hud.v13?.main.ending && hud.v13.main.slide < 99 ? "hidden" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "px-1 text-[10px] uppercase tracking-wide text-muted",
								children: "Aim"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-hud-min": "aim",
								"aria-label": hc.aim ? "Expand aim" : "Minimize aim",
								className: "min-h-10 min-w-10 plank border border-border bg-surface px-1 text-xs font-bold text-primary",
								onClick: () => flipHc("aim"),
								children: hc.aim ? `${hud.aim} +` : "–"
							}),
							(hc.aim ? [] : [
								"head",
								"chest",
								"arm",
								"leg"
							]).map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								style: { touchAction: "manipulation" },
								className: `min-h-10 min-w-12 plank border px-3 py-2 text-xs font-semibold capitalize short:px-2 short:py-1 ${hud.aim === part ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`,
								onClick: () => apiRef.current?.setAim(part),
								children: part
							}, part)),
							hud.v141 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"data-v141": "crouch",
									"aria-pressed": hud.v141.crouch,
									style: { touchAction: "manipulation" },
									className: `min-h-10 min-w-12 plank border px-2 text-xs font-semibold ${hud.v141.crouch ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`,
									onClick: () => apiRef.current?.v141("crouch"),
									children: hud.v141.crouch ? "Crouched" : "Crouch"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"data-v141": "auto",
									"aria-pressed": hud.v141.auto,
									style: { touchAction: "manipulation" },
									className: `min-h-10 min-w-12 plank border px-2 text-xs font-semibold ${hud.v141.auto ? "border-primary bg-primary text-bg" : "border-border bg-surface"}`,
									onClick: () => apiRef.current?.v141("auto"),
									children: ["Auto ", hud.v141.auto ? "on" : "off"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-v141": "noise",
									role: "meter",
									"aria-label": "Noise",
									"aria-valuenow": hud.v141.noise,
									"aria-valuemin": 0,
									"aria-valuemax": 100,
									className: "flex min-h-10 items-center gap-1 plank border border-border bg-surface/95 px-2 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: "Noise"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block h-2 w-14 bg-bg",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block h-full",
											style: {
												width: `${hud.v141.noise}%`,
												background: hud.v141.noise > 70 ? "#d0644a" : hud.v141.noise > 25 ? "#e0b050" : "#8fbf6a"
											}
										})
									})]
								})
							] }) : null,
							hud.turnBased ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "plank bg-primary px-3 py-2 text-xs font-semibold text-bg short:px-2 short:py-1",
								onClick: () => apiRef.current?.endTurn(),
								children: [
									"End turn · ",
									hud.ap,
									"/",
									hud.maxAp
								]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `pointer-events-none z-40 mt-2 flex w-full max-w-full flex-col gap-2 short:mt-1 short:flex-row short:items-end short:gap-1`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex min-w-0 flex-1 items-stretch gap-2 ${journalOpen || hud.statsOpen ? "hidden" : ""} ${hud.dialogue ? "short:hidden" : ""}`,
							children: [hc.health ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"data-hud": "health-min",
								className: `pointer-events-auto flex min-w-0 flex-1 items-center gap-2 self-end plank border border-border bg-surface/95 px-2 py-1 ${fl("health")}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "min-w-0 flex-1 space-y-0.5",
										children: [
											[
												"HP",
												hud.hp / Math.max(1, hud.maxHp) * 100,
												"#c4543a"
											],
											[
												"Food",
												hud.v13?.needs.hunger ?? 100,
												"#c98a4a"
											],
											[
												"Water",
												hud.v13?.needs.thirst ?? 100,
												"#5a8ac0"
											],
											[
												"Sleep",
												hud.v13?.needs.sleep ?? 100,
												"#9a8ac0"
											]
										].map(([l, v, c]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-1 bg-bg",
											title: `${l} ${Math.round(v)}`,
											"aria-label": l,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full",
												style: {
													width: `${Math.max(0, Math.min(100, v))}%`,
													background: c
												}
											})
										}, l))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-10 px-1 text-xs text-primary",
										onClick: () => apiRef.current?.tap("pause"),
										children: "Pause"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinBtn, {
										k: "health",
										label: "health panel"
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"data-hud": "health",
								className: "pointer-events-auto min-w-0 flex-1 plank border border-border bg-surface/95 px-3 py-2 short:px-2 short:py-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
												className: "truncate font-display text-lg leading-none short:text-base",
												children: hud.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs uppercase tracking-wide text-primary short:hidden",
												children: hud.roleTitle
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex shrink-0 items-start",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "-my-2 min-h-10 min-w-12 shrink-0 px-2 text-sm text-primary short:-my-1",
												onClick: () => apiRef.current?.tap("pause"),
												children: "Pause"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinBtn, {
												k: "health",
												label: "health panel",
												tight: true
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 h-2 overflow-hidden bg-bg scar short:mt-1",
										"aria-label": "Health",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full bg-accent scar",
											style: { width: `${Math.max(0, Math.min(100, hud.hp / hud.maxHp * 100))}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 h-1 overflow-hidden bg-bg scar",
										"aria-label": "Experience",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full bg-primary scar",
											style: { width: `${Math.max(0, Math.min(100, hud.xp / hud.xpNext * 100))}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 h-1 overflow-hidden bg-bg scar",
										"aria-label": "Stamina",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full bg-fg scar",
											style: { width: `${Math.max(0, Math.min(100, hud.stamina / Math.max(1, hud.maxStamina) * 100))}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 truncate text-xs text-muted short:mt-0.5",
										children: [
											Math.ceil(hud.hp),
											" / ",
											hud.maxHp,
											" · Lv ",
											hud.level,
											hud.turnBased ? ` · AP ${hud.ap}/${hud.maxAp}` : "",
											hud.inside ? " · Inside" : "",
											" · Wood ",
											hud.wood,
											" · Stone ",
											hud.stone,
											" · Iron ",
											hud.scrap,
											" · Shells ",
											hud.shells
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto flex shrink-0 flex-col gap-2 short:flex-row short:gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									label: "Zoom out",
									onClick: () => apiRef.current?.nudgeZoom(1 / 1.2),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
										className: "size-5 short:size-4",
										"aria-hidden": true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									label: "Zoom in",
									onClick: () => apiRef.current?.nudgeZoom(1.2),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
										className: "size-5 short:size-4",
										"aria-hidden": true
									})
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-hud": "actions",
							className: "pointer-events-auto grid grid-cols-7 gap-1 short:w-[22rem] short:shrink-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									wide: true,
									label: "Talk",
									onClick: () => apiRef.current?.tap("interact"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
											className: "size-4",
											"aria-hidden": true
										}), "Talk"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									wide: true,
									label: "Attack",
									onClick: () => apiRef.current?.tap("attack"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Axe, {
											className: "size-4",
											"aria-hidden": true
										}), "Attack"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									wide: true,
									label: "Build",
									pressed: hud.buildOpen,
									onClick: () => apiRef.current?.tap("build"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, {
											className: "size-4",
											"aria-hidden": true
										}), "Build"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									wide: true,
									label: "Pack",
									pressed: hud.packOpen,
									onClick: () => apiRef.current?.togglePack(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backpack, {
											className: "size-4",
											"aria-hidden": true
										}), "Pack"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									wide: true,
									label: "Journal",
									pressed: journalOpen && !hud.statsOpen && !hud.packOpen,
									onClick: () => {
										if (hud.statsOpen) apiRef.current?.toggleStats();
										if (hud.packOpen) apiRef.current?.togglePack();
										setJournalOpen((open) => !(open && !hud.statsOpen && !hud.packOpen));
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
											className: "size-4",
											"aria-hidden": true
										}), "Journal"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									wide: true,
									label: "Map",
									pressed: mapOpen,
									onClick: () => {
										if (hud.statsOpen) apiRef.current?.toggleStats();
										if (hud.packOpen) apiRef.current?.togglePack();
										setJournalOpen(false);
										setMapOpen((o) => !o);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, {
											className: "size-4",
											"aria-hidden": true
										}), "Map"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
									wide: true,
									label: "Stats",
									pressed: hud.statsOpen,
									onClick: () => apiRef.current?.toggleStats(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, {
											className: "size-4",
											"aria-hidden": true
										}), "Stats"]
									})
								})
							]
						})]
					})
				]
			}) : null,
			playing && hud.v141?.stick && hud.phase === "play" && !hud.buildOpen && !hud.dialogue && !hud.v141.store ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stick141, { onMove: (x, y) => apiRef.current?.setStick(x, y) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: miniRef,
				width: 132,
				height: 132,
				"aria-label": "Minimap",
				className: playing && !hc.mini ? "pointer-events-none absolute top-[max(0.5rem,env(safe-area-inset-top))] right-[max(0.5rem,env(safe-area-inset-right))] z-10 h-20 w-20 plank border border-border bg-bg short:h-[clamp(4.5rem,24vh,5.5rem)] short:w-[clamp(4.5rem,24vh,5.5rem)]" : "hidden"
			}),
			playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-hud-min": "mini",
				"aria-label": hc.mini ? "Show the corner chart" : "Hide the corner chart",
				className: `absolute z-20 plank border border-border bg-surface/95 text-xs font-bold text-primary ${hc.mini ? "top-[max(0.5rem,env(safe-area-inset-top))] right-[max(0.5rem,env(safe-area-inset-right))] h-10 w-10" : "top-[calc(max(0.5rem,env(safe-area-inset-top))+5.2rem)] right-[max(0.5rem,env(safe-area-inset-right))] h-10 w-10 short:top-[calc(max(0.5rem,env(safe-area-inset-top))+clamp(4.5rem,24vh,5.5rem)+0.3rem)]"}`,
				onClick: () => flipHc("mini"),
				children: hc.mini ? "+" : "–"
			}) : null,
			hud.phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "menu-hero absolute inset-0 overflow-y-auto p-4 short:p-2 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] short:pt-[max(0.25rem,env(safe-area-inset-top))] short:pb-[max(0.25rem,env(safe-area-inset-bottom))]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex min-h-full w-full max-w-lg items-center py-4 short:max-w-5xl short:py-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-menu": "card",
						className: "w-full plank border border-border bg-surface/95 p-6 short:p-3 menu-cols",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-widest text-primary",
								children: "Northwestern Maine"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 font-display text-5xl leading-none short:text-3xl",
								children: "Maine RPG"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 leading-relaxed text-muted short:mt-1 short:line-clamp-2 short:text-sm",
								children: "After the fall, the Moose River country went back to wool coats, lever guns, and cookfires. Name yourself, pick a trade, and set your clothes."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs uppercase tracking-widest text-primary short:mt-2",
								children: step === "trade" ? "1 · Trade" : step === "points" ? "2 · Points" : "3 · Trait"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 plank border border-border bg-bg px-3 py-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-lg leading-none",
										children: kit.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-muted",
										children: [
											GEAR[kit.weapon]?.name,
											" · ",
											GEAR[kit.coat]?.name
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1",
										children: [
											"Str ",
											base.strength + bonus.strength,
											" · Health ",
											base.vigor + bonus.vigor,
											" · End ",
											base.endurance + bonus.endurance,
											" · Int ",
											base.intellect + bonus.intellect,
											" · Per ",
											base.perception + bonus.perception,
											" · Luck ",
											base.luck + bonus.luck
										]
									})
								]
							}),
							step === "trade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mt-4 block text-sm text-muted short:mt-2",
									htmlFor: "wanderer-name",
									children: "Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "wanderer-name",
									value: name,
									maxLength: 18,
									onChange: (e) => setName(e.target.value),
									suppressHydrationWarning: true,
									className: "mt-1 w-full plank border border-border bg-bg px-3 py-3 text-fg outline-none focus:border-primary short:py-2"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 grid grid-cols-2 gap-2 short:mt-2 short:grid-cols-4 short:gap-1",
									children: ROLES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										"aria-pressed": role === item.id,
										className: `plank border px-3 py-3 text-left short:px-2 short:py-2 ${role === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
										onClick: () => {
											setRole(item.id);
											setLook(defaultLook(item.id));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-lg short:text-base",
											children: item.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-sm text-muted short:line-clamp-3 short:text-xs",
											children: item.blurb
										})]
									}, item.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted short:mt-2",
									children: "Backstory"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 grid grid-cols-4 gap-1",
									"data-testid": "backstory-pick",
									children: [
										[
											"veteran",
											"Veteran",
											"Rifle, grit, first aid"
										],
										[
											"mechanic",
											"Mechanic",
											"Engines, gas, wits"
										],
										[
											"farmer",
											"Farmer",
											"Crops, cooking, endurance"
										],
										[
											"hunter",
											"Woods guide",
											"Tracks, traps, agility"
										]
									].map(([id, l, h]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										"data-testid": `backstory-${id}`,
										"aria-pressed": backstory === id,
										className: `plank border px-1.5 py-1.5 text-left ${backstory === id ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
										onClick: () => setBackstory(id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-xs font-semibold",
											children: l
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[10px] leading-tight text-muted",
											children: h
										})]
									}, id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-end gap-3 short:mt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "plank border border-border bg-bg p-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LookPreview, {
											look,
											hair,
											coat,
											hat,
											trousers,
											boots
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "Cloth"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 grid grid-cols-2 gap-1",
											children: LOOKS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												"aria-pressed": look === item.id,
												className: `plank border px-2 py-1.5 text-left ${look === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
												onClick: () => setLook(item.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mb-1 block h-2 w-full border border-border",
													style: { background: item.id === "wool" ? "#8c6242" : item.id === "spruce" ? "#46684a" : item.id === "linen" ? "#cec0a0" : "#42444a" }
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-sm font-semibold",
													children: item.label
												})]
											}, item.id))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted short:mt-2",
									children: "Hair"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 grid grid-cols-4 gap-1",
									children: HAIRS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										"aria-pressed": hair === item.id,
										className: `plank border px-2 py-1.5 text-left ${hair === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
										onClick: () => setHair(item.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mb-1 block h-2 w-full border border-border",
											style: { background: item.color }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-xs font-semibold",
											children: item.label
										})]
									}, item.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 grid grid-cols-2 gap-2 short:mt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted",
										children: "Coat"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 flex flex-wrap gap-1",
										children: COAT_PICKS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": coat === item.id,
											className: `plank border px-2 py-1 text-xs font-semibold ${coat === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
											onClick: () => setCoat(item.id),
											children: item.label
										}, item.label))
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted",
										children: "Hat"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 flex flex-wrap gap-1",
										children: HAT_PICKS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": hat === item.id,
											className: `plank border px-2 py-1 text-xs font-semibold ${hat === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
											onClick: () => setHat(item.id),
											children: item.label
										}, item.label))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": trousers,
											className: `plank border px-3 py-1.5 text-sm ${trousers ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
											onClick: () => setTrousers((v) => !v),
											children: "Trousers"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": hardMode,
											"data-testid": "hard-mode",
											className: `plank border px-3 py-1.5 text-sm ${hardMode ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
											onClick: () => setHardMode((v) => !v),
											children: "Hard needs"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": boots,
											className: `plank border px-3 py-1.5 text-sm ${boots ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
											onClick: () => setBoots((v) => !v),
											children: "Boots"
										})
									]
								})
							] }) : null,
							step === "points" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm text-muted",
								children: [pointsLeft, " to place. They sit on top of the trade."]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 grid grid-cols-2 gap-2 short:grid-cols-3",
								children: [
									[
										"strength",
										"Strength",
										"Harder hits"
									],
									[
										"vigor",
										"Health",
										"More life"
									],
									[
										"endurance",
										"Endurance",
										"More stamina"
									],
									[
										"intellect",
										"Intelligence",
										"Surer locks, better prices"
									],
									[
										"perception",
										"Perception",
										"See farther. Guns reach farther"
									],
									[
										"luck",
										"Luck",
										"Better finds. Harder hits, sometimes"
									]
								].map(([key, label, hint]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "plank border border-border bg-bg px-2 py-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold",
											children: label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: hint
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex items-center justify-between gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "plank border border-border px-3 py-1",
													onClick: () => bump(key, -1),
													disabled: bonus[key] < 1,
													children: "−"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-lg",
													children: base[key] + bonus[key]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "plank border border-border px-3 py-1",
													onClick: () => bump(key, 1),
													disabled: pointsLeft < 1,
													children: "+"
												})
											]
										})
									]
								}, key))
							})] }) : null,
							step === "trait" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-2 gap-2 short:grid-cols-4 short:gap-1",
								children: TRAITS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-pressed": trait === item.id,
									className: `plank border px-3 py-3 text-left short:px-2 short:py-2 ${trait === item.id ? "border-primary bg-surface-2" : "border-border bg-bg"}`,
									onClick: () => setTrait(item.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-lg short:text-base",
										children: item.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-sm text-muted short:text-xs",
										children: item.blurb
									})]
								}, item.id))
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-col gap-2",
								children: confirmNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted",
										children: "A saved packer is already on this device. Starting over replaces them."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "plank bg-accent px-4 py-3 font-semibold text-fg",
										onClick: startNew,
										children: "Replace save"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "plank border border-border px-4 py-3",
										onClick: () => setConfirmNew(false),
										children: "Back"
									})
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									step === "trade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "plank bg-primary px-4 py-3 font-semibold text-bg",
										onClick: () => setStep("points"),
										children: "Next"
									}) : null,
									step === "points" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "plank border border-border px-4 py-3",
											onClick: () => setStep("trade"),
											children: "Back"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "flex-1 plank bg-primary px-4 py-3 font-semibold text-bg disabled:opacity-40",
											disabled: pointsLeft !== 0,
											onClick: () => setStep("trait"),
											children: "Next"
										})]
									}) : null,
									step === "trait" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "plank border border-border px-4 py-3",
											onClick: () => setStep("points"),
											children: "Back"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "flex-1 plank bg-primary px-4 py-3 font-semibold text-bg disabled:opacity-40",
											disabled: !trait,
											onClick: () => {
												if (hud.hasSave) setConfirmNew(true);
												else startNew();
											},
											children: ["Begin as ", kit.title]
										})]
									}) : null,
									step === "trade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "plank border border-accent bg-surface-2 px-4 py-3 font-semibold",
										onClick: () => apiRef.current?.raidMode(),
										children: "Raid Mode"
									}) : null,
									step === "trade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-3 gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "plank border border-accent bg-surface-2 px-2 py-3 text-sm font-semibold",
												onClick: () => apiRef.current?.startMode("winter"),
												children: "Winter Survival"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "plank border border-accent bg-surface-2 px-2 py-3 text-sm font-semibold",
												onClick: () => apiRef.current?.startMode("endless"),
												children: "Endless Raid"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "plank border border-accent bg-surface-2 px-2 py-3 text-sm font-semibold",
												onClick: () => apiRef.current?.startMode("watch"),
												children: "Night Watch"
											})
										]
									}) : null,
									step === "trade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-3 gap-2",
										role: "radiogroup",
										"aria-label": "Save slot",
										"data-testid": "save-slots",
										children: (hud.slots ?? []).map((sl) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											role: "radio",
											"aria-checked": hud.slot === sl.slot,
											"data-testid": `slot-${sl.slot}`,
											className: `min-h-14 plank border px-2 py-2 text-left text-xs ${hud.slot === sl.slot ? "border-primary bg-primary/20" : "border-border bg-surface-2"}`,
											onClick: () => apiRef.current?.setSlot(sl.slot),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "block font-semibold",
												children: ["Slot ", sl.slot]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block truncate text-muted",
												children: sl.label
											})]
										}, sl.slot))
									}) : null,
									hud.hasSave && step === "trade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "plank border border-border bg-surface-2 px-4 py-3 font-semibold",
										onClick: () => apiRef.current?.continueGame(),
										children: "Continue"
									}) : null
								] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-base font-semibold leading-relaxed text-fg short:hidden",
								children: "Hold on the ground to run. Click a chopper to chase and keep swinging until they drop. Click the ground to break off. A carbine shoots from farther away. An axe in your hand takes three swings, then the tree falls. A pickaxe in your hand cracks a rock for iron."
							}),
							!hud.ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Painting the spruce…"
							}) : null
						]
					})
				})
			}) : null,
			hud.phase === "menu" && raidResult ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay, {
				title: raidResult.won ? `Night ${raidResult.night}: the farm held` : `Night ${raidResult.night}: the farm fell`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted",
						children: raidResult.text
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"Raiders down: ",
							raidResult.kills,
							" · Waves held: ",
							raidResult.wavesDone,
							" of ",
							raidResult.waves
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank bg-primary px-4 py-3 font-semibold text-bg",
						onClick: () => apiRef.current?.raidMode(),
						children: "Raid again"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank border border-border px-4 py-3",
						onClick: () => useRaidMode.setState({ result: null }),
						children: "Back to menu"
					})
				]
			}) : null,
			hud.phase === "menu" && modeResult && !raidResult ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay, {
				title: modeResult.title,
				children: [
					modeResult.lines.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: i === 0 ? "text-sm leading-relaxed text-muted" : "text-sm",
						children: line
					}, i)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank bg-primary px-4 py-3 font-semibold text-bg",
						onClick: () => apiRef.current?.startMode(modeResult.mode),
						children: "Play again"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank border border-border px-4 py-3",
						onClick: () => useModeResult.setState({ result: null }),
						children: "Back to menu"
					})
				]
			}) : null,
			confirmExit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay, {
				title: "Leave Maine?",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted",
						children: "Close the game? Your packer is saved on this device."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank bg-accent px-4 py-3 font-semibold text-fg",
						onClick: exitApp,
						children: "Exit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank border border-border px-4 py-3",
						onClick: () => setConfirmExit(false),
						children: "Stay"
					})
				]
			}) : null,
			hud.phase === "worldmap" && hud.wmap ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-testid": "worldmap",
				className: "absolute inset-0 z-50 bg-bg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldMap14, {
							wm: hud.wmap,
							go: (q, r) => apiRef.current?.v14("wmGo", [q, r])
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-1 p-2 pt-[max(0.5rem,env(safe-area-inset-top))]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 plank border border-border bg-surface/90 px-2 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "font-display text-base leading-none",
								children: ["Northwestern Maine · ", hud.wmap.clock]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: hud.wmap.bike ? "Bike: roads go quick" : "On foot"
							})]
						}), hud.wmap.warn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-testid": "wm-warn",
							className: "animate-pulse plank border border-[#d0644a] bg-surface px-2 py-1 text-sm font-semibold text-[#e88a6a]",
							children: hud.wmap.warn
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-testid": "wm-bottom",
						className: "absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-border bg-surface/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: hud.wmap.path.length ? `Traveling… ${hud.wmap.path.length} hex${hud.wmap.path.length > 1 ? "es" : ""} to go.` : hud.wmap.here ? `${hud.wmap.here}. Tap it again to go in.` : "Tap a hex to travel. Drag to look around, pinch to zoom. Roads are quick; woods and the river are slow."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 plank border border-border bg-bg px-2 text-sm",
									onClick: () => {
										const c = document.querySelector("[data-testid=\"hex-map\"]");
										c?.dispatchEvent(new WheelEvent("wheel", {
											deltaY: 1,
											clientX: c.getBoundingClientRect().left + c.clientWidth / 2,
											clientY: c.getBoundingClientRect().top + c.clientHeight / 2,
											bubbles: true
										}));
									},
									children: "Zoom out"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 plank border border-border bg-bg px-2 text-sm",
									onClick: () => {
										const c = document.querySelector("[data-testid=\"hex-map\"]");
										c?.dispatchEvent(new WheelEvent("wheel", {
											deltaY: -1,
											clientX: c.getBoundingClientRect().left + c.clientWidth / 2,
											clientY: c.getBoundingClientRect().top + c.clientHeight / 2,
											bubbles: true
										}));
									},
									children: "Zoom in"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"data-testid": "wm-enter",
									disabled: !hud.wmap.here || hud.wmap.path.length > 0,
									className: "min-h-11 plank bg-primary px-2 text-sm font-semibold text-bg disabled:opacity-40",
									onClick: () => apiRef.current?.v14("wmGo", [hud.wmap.q, hud.wmap.r]),
									children: "Go in"
								})
							]
						})]
					})
				]
			}) : null,
			hud.phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay, {
				title: "Paused",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank bg-primary px-4 py-3 font-semibold text-bg",
						onClick: () => apiRef.current?.tap("resume"),
						children: "Resume"
					}),
					hud.inside ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank border border-primary px-4 py-3 font-semibold",
						onClick: () => apiRef.current?.leave(),
						children: "Leave building"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank border border-border px-4 py-3",
						onClick: () => apiRef.current?.tap("save"),
						children: "Save"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-testid": "hud-collapse-all",
							className: "flex-1 plank border border-border px-3 py-3",
							onClick: () => {
								saveHc({
									quest: true,
									track: true,
									health: true,
									aim: true,
									mini: true
								});
								setTrackerOpen0(false);
							},
							children: "Collapse HUD"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-testid": "hud-expand-all",
							className: "flex-1 plank border border-border px-3 py-3",
							onClick: () => {
								saveHc({
									quest: false,
									track: false,
									health: false,
									aim: false,
									mini: false
								});
								setTrackerOpen0(true);
							},
							children: "Expand HUD"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-testid": "one-thumb",
						className: "plank border border-border px-4 py-3",
						onClick: () => apiRef.current?.v141("stickMode"),
						children: hud.v141?.stick ? "One-thumb stick: on" : "One-thumb stick: off"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank border border-border px-4 py-3",
						onClick: () => apiRef.current?.setTurnBased(!hud.turnBased),
						children: hud.turnBased ? "Switch to real time" : "Switch to turn-based"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "gfx-toggle",
						className: "plank border border-border px-4 py-3",
						onClick: () => apiRef.current?.setGraphics(!(hud.gfxHigh ?? true)),
						children: ["Graphics: ", hud.gfxHigh ?? true ? "High" : "Low"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank border border-border px-4 py-3",
						onClick: () => apiRef.current?.tap("menu"),
						children: "Main menu"
					})
				]
			}) : null,
			hud.phase === "dead" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Overlay, {
				title: "You fall",
				delayed: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted",
						children: "The spruce takes you. A lean-to, if you raised one, is where you wake. Otherwise you come to on the cot at Cambridge Road."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank bg-primary px-4 py-3 font-semibold text-bg",
						onClick: () => apiRef.current?.tap("respawn"),
						children: "Wake"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "plank border border-border px-4 py-3",
						onClick: () => apiRef.current?.tap("menu"),
						children: "Main menu"
					})
				]
			}) : null
		]
	});
}
/** Matches the `short:` Tailwind variant (max-height 520px): phones held sideways. */
function useShortScreen() {
	const [short, setShort] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof matchMedia === "undefined") return;
		const mq = matchMedia("(max-height: 520px), (max-height: 640px) and (orientation: landscape)");
		const on = () => setShort(mq.matches);
		on();
		mq.addEventListener("change", on);
		return () => mq.removeEventListener("change", on);
	}, []);
	return short;
}
function Overlay({ title, children, delayed = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `scrap-scrim absolute inset-0 z-40 flex items-center justify-center p-4${delayed ? " overlay-late" : ""}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-sm flex-col gap-2 plank border border-border bg-surface p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: title
			}), children]
		})
	});
}
function ActionButton({ label, children, onClick, pressed, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		"aria-pressed": pressed,
		style: { touchAction: "manipulation" },
		className: `flex select-none items-center justify-center plank border ${wide ? "h-14 w-full min-w-0 px-1 short:h-12" : "h-12 w-12 short:h-11 short:w-11"} ${pressed ? "border-primary bg-primary text-bg" : "border-border bg-surface text-fg"}`,
		onClick,
		children
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RPG, {});
}
//#endregion
export { Home as component };
