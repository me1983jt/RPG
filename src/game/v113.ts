/** beta v11.3 data: achievements, trade skills, farm upgrades, Skowhegan, traps. Engine wiring lives in engine.ts ("v113" block). */

export interface AchDef { id: string; name: string; text: string }
export const ACHIEVEMENTS: AchDef[] = [
  { id: "moose", name: "Big as a Barn", text: "Bring down your first moose." },
  { id: "deer", name: "Venison Supper", text: "Bring down your first deer." },
  { id: "bike", name: "She Runs", text: "Build the motor bicycle." },
  { id: "ride", name: "Down the Tote Road", text: "Ride the motor bicycle." },
  { id: "winter", name: "Wintered Over", text: "Live through your first winter." },
  { id: "grok", name: "The Grok Is Down", text: "Beat The Grok." },
  { id: "raid1", name: "Held the Farm", text: "Survive your first raid night." },
  { id: "raid5", name: "Five Long Nights", text: "Survive five raid nights." },
  { id: "area", name: "Every Chore Done", text: "Finish every quest in one area." },
  { id: "skow", name: "Into Skowhegan", text: "Reach abandoned Skowhegan." },
  { id: "bridge", name: "Held the Bridge", text: "Clear the raiders at the Skowhegan bridge." },
  { id: "meds", name: "Medicine Run", text: "Bring medicine back from Redington hospital." },
  { id: "snare", name: "Hare in the Wire", text: "Catch your first animal in a snare." },
  { id: "trap", name: "Fur Line", text: "Catch a fox or coyote in a trap." },
  { id: "dress", name: "Clean Work", text: "Field-dress an animal." },
  { id: "tracks", name: "Read the Sign", text: "Follow tracks to an animal." },
  { id: "biscuit", name: "Good Dog", text: "Biscuit joins you for good." },
  { id: "fish10", name: "Stringer Full", text: "Catch 10 fish." },
  { id: "upgrade", name: "Improvements", text: "Build your first farm upgrade." },
  { id: "palisade", name: "Stockade", text: "Raise the palisade wall." },
  { id: "forge", name: "Hot Iron", text: "Upgrade the workbench to a forge." },
  { id: "skill5", name: "Old Hand", text: "Reach level 5 in any trade skill." },
  { id: "rich", name: "Iron in the Coffee Can", text: "Hold 100 iron at once." },
  { id: "level5", name: "Seasoned", text: "Reach character level 5." },
];

export type TradeSkill = "hunting" | "trapping" | "farming" | "mechanics" | "barter" | "medicine" | "stealth" | "carpentry" | "marksmanship";
export interface TradeSkillDef { id: TradeSkill; name: string; how: string; perk: string }
/** Each skill levels by doing (XP 25 * level to reach the next level, max 10). Every level gives its perk once more. */
export const TRADE_SKILLS: TradeSkillDef[] = [
  { id: "hunting", name: "Hunting", how: "Kill and dress game, follow tracks.", perk: "Animals spook 6% later, and you see tracks 1 tile farther." },
  { id: "trapping", name: "Trapping", how: "Set and check snares and traps.", perk: "+5% catch chance on each trap." },
  { id: "farming", name: "Farming", how: "Morning harvests, farm chores.", perk: "Every 2 levels, +1 crop at each harvest." },
  { id: "mechanics", name: "Mechanics", how: "Ride the bike, build engines.", perk: "The bike burns 6% less gas." },
  { id: "barter", name: "Barter", how: "Buy and sell with traders.", perk: "Trader prices are 3% lower (max 30%)." },
  { id: "medicine", name: "Medicine", how: "Use bandages and medicine, patch up Biscuit.", perk: "Healing items heal 8% more." },
  { id: "stealth", name: "Stealth", how: "Get close to animals and raiders without being seen.", perk: "Enemies notice you 3% later." },
  { id: "carpentry", name: "Carpentry", how: "Build farm upgrades.", perk: "Farm upgrades cost 4% less wood and stone." },
  { id: "marksmanship", name: "Marksmanship", how: "Land gunshots.", perk: "Guns hit 4% harder." },
];
export const SKILL_MAX = 10;
export function skillNeed(level: number): number {
  return 25 * (level + 1);
}

export interface UpgradeTier { wood: number; stone: number; iron: number; need?: [string, number][]; effect: string }
export interface UpgradeDef { id: string; name: string; tiers: UpgradeTier[]; art: string }
export const FARM_UPGRADES: UpgradeDef[] = [
  { id: "greenhouse", name: "Greenhouse", art: "farm-greenhouse", tiers: [
    { wood: 8, stone: 2, iron: 4, effect: "2 winter greens each morning, even in winter." },
    { wood: 6, stone: 4, iron: 8, effect: "4 winter greens each morning." }] },
  { id: "barrel", name: "Rain barrel", art: "farm-barrel", tiers: [
    { wood: 4, stone: 0, iron: 2, effect: "1 jug of clean water each morning." },
    { wood: 4, stone: 0, iron: 4, effect: "2 jugs of water each morning." }] },
  { id: "solar", name: "Solar panel", art: "farm-solar", tiers: [
    { wood: 2, stone: 0, iron: 14, need: [["wire", 1]], effect: "Lights the farm at night." },
    { wood: 2, stone: 0, iron: 18, need: [["wire", 1]], effect: "Powers the radio: Marcel's prices drop 20%." }] },
  { id: "lookout", name: "Lookout tower", art: "farm-lookout", tiers: [
    { wood: 12, stone: 0, iron: 2, effect: "Raid warning comes 6s earlier, and you see 2 tiles farther at the farm." },
    { wood: 10, stone: 4, iron: 4, effect: "Raid warning comes 12s earlier, and you see 4 tiles farther." }] },
  { id: "palisade", name: "Palisade wall", art: "farm-palisade", tiers: [
    { wood: 16, stone: 0, iron: 2, effect: "+40 farmhouse HP on raid night. The Grok can still break it." },
    { wood: 14, stone: 6, iron: 4, effect: "+80 farmhouse HP." },
    { wood: 12, stone: 10, iron: 8, effect: "+120 farmhouse HP." }] },
  { id: "smoke", name: "Smokehouse", art: "farm-smokehouse", tiers: [
    { wood: 6, stone: 4, iron: 0, effect: "Smokes 1 meat into 2 jerky each morning." },
    { wood: 6, stone: 4, iron: 2, effect: "Smokes 2 meat." },
    { wood: 6, stone: 6, iron: 4, effect: "Smokes 3 meat." }] },
  { id: "cellar", name: "Root cellar", art: "farm-cellar", tiers: [
    { wood: 4, stone: 8, iron: 0, effect: "+1 potato each morning, and the cold can't touch the stores." },
    { wood: 4, stone: 10, iron: 2, effect: "+2 potatoes each morning." }] },
  { id: "bench", name: "Workbench", art: "farm-bench", tiers: [
    { wood: 4, stone: 0, iron: 2, effect: "Hand tools: bench recipes (snares, lanterns, carbine work)." },
    { wood: 4, stone: 8, iron: 10, effect: "Forge: steel traps, good-quality blades." },
    { wood: 6, stone: 6, iron: 20, need: [["engine", 0]], effect: "Machine shop: refine fuel into gas, and the bike burns 25% less." }] },
];

/** Skowhegan map (map 2). Tiles are absolute; sites for quests use the q11 relative frame (tx - WORLD_OX). */
export const SKOW_BUILDINGS: { kind: "barn" | "workshop" | "shack" | "ruin" | "farmhouse"; dx: number; dy: number; skin: string; label: string }[] = [
  { kind: "barn", dx: -14, dy: -10, skin: "skowhegan-mill", label: "WOOLEN MILL" },
  { kind: "farmhouse", dx: 10, dy: -12, skin: "skowhegan-hospital", label: "REDINGTON HOSPITAL" },
  { kind: "shack", dx: -4, dy: -18, skin: "skowhegan-store", label: "GENERAL STORE" },
  { kind: "shack", dx: 4, dy: -20, skin: "skowhegan-hardware", label: "HARDWARE" },
  { kind: "ruin", dx: -10, dy: -26, skin: "skowhegan-house", label: "" },
  { kind: "shack", dx: 13, dy: -27, skin: "skowhegan-house2", label: "" },
  { kind: "shack", dx: 18, dy: -6, skin: "skowhegan-house3", label: "" },
];
/** The river gorge row (dy) and the bridge gap through it. */
export const SKOW_GORGE_DY = 4;
export const SKOW_BRIDGE_DX = 0;

export const TRAP_KINDS = {
  snare: { item: "snare", catches: ["rabbit"], base: 0.7 },
  trap: { item: "steeltrap", catches: ["fox", "coyote", "rabbit"], base: 0.55 },
} as const;
