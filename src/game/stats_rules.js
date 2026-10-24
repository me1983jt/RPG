// @ts-nocheck
// GENERATED from stats.json by tools/gen-stats-js.mjs. Do not edit by hand.
(function (g) { g.STATS_RULES = {
 "_doc": {
  "what": "Shared character rules for Maine RPG (master) and the Quest RPG towns. Owner of master fields: Maine RPG (maine-rpg/v11).",
  "shape_version": 2,
  "shape": {
   "stats.list[]": "{id, name, store: 'player'|'core', effect} - 8 stats; 'core' = saved in w13.core in the RPG",
   "stats.start/growth": "starting value and per-level growth",
   "skills.list[]": "{id, name, base, gov:{stat:weight}, max, blurb}; score = base + sum(stat*weight) + trait mods + invested*(tagged?2:1) + perk bonus, clamped 0..max",
   "skills.traitMods": "{traitId:{skillId:delta}}",
   "perks[]": "{id, name, blurb, need?, bonus?:{skill:delta}, def?:number, ap?:number}",
   "traits[]": "{id, name, blurb, hp:number, staminaRegenMul:number, skills:{skill:delta}}",
   "backstories[]": "{id, name, core:{stat:delta}, trade:{tradeSkill:lv}}",
   "classes[]": "{id, name, stats:{6 base stats}, kitHp, atk, tags:[3 skill ids]} - ids are the class names used everywhere, sent straight through",
   "classDefault": "class id used when none/invalid",
   "classAliases": "old class ids/names -> current id (save migration)",
   "statAliases": "old stat names -> current id",
   "derived": "numeric constants (see derivedText for the formulas)",
   "checks": "{base,min,max,repDiv,karmaDiv}: clamp(min,max, score-dc+base+round(rep/repDiv+karma/karmaDiv))",
   "levelUp": "numeric: xp need = xpBase + level*xpPerLevel, ...",
   "town": "RESERVED for Quest RPG town-only fields. Maine RPG never writes here.",
   "price": "numeric barter/rep price constants",
   "rep": "{keys (all rep keys the RPG keeps), townKeys (the Quest towns' rep), start, hostileAt}",
   "townScoreXp": "RPG XP granted per town score point",
   "oldTownSkillConversion": "how pre-character/1 town skill levels become invested points"
  },
  "regenerate_js": "node /workspace/shared-rules/tools/gen-stats-js.mjs  (writes stats_rules.js: window.STATS_RULES = <this file>)"
 },
 "stats": {
  "list": [
   {
    "id": "strength",
    "name": "Strength",
    "store": "player",
    "effect": "melee weight 6, climbing 3; carry 40+4/pt; melee damage"
   },
   {
    "id": "vigor",
    "name": "Vigor",
    "store": "player",
    "effect": "maxHp +8 per point above 1; doctor weight 2"
   },
   {
    "id": "endurance",
    "name": "Endurance",
    "store": "player",
    "effect": "maxStamina +16/pt; regen 8+3/pt; hunger/thirst drain -5%/pt (floor 0.6); melee 2, trail 3"
   },
   {
    "id": "intellect",
    "name": "Intellect",
    "store": "player",
    "effect": "skill points per level 3+INT; barter -1%/pt cap 15; talk +2/pt; crit +0.5%/pt; doctor/lock/speech/barter/mechanics/electronics weights"
   },
   {
    "id": "perception",
    "name": "Perception",
    "store": "player",
    "effect": "rifle weight 6; sight +1 tile/pt; gun accuracy +2%/pt"
   },
   {
    "id": "luck",
    "name": "Luck",
    "store": "player",
    "effect": "skill weights (rifle, speech, barter, sneak)"
   },
   {
    "id": "agility",
    "name": "Agility",
    "store": "core",
    "effect": "stamina +6/pt; crit +1.5%/pt; climbing 4, mechanics 2"
   },
   {
    "id": "grit",
    "name": "Grit",
    "store": "core",
    "effect": "maxHp +3/pt; sickness resist 4%/pt cap 40%; talk +grit/2"
   }
  ],
  "start": "class stats table (+ creation bonus + backstory core); agility 1, grit 1",
  "min": null,
  "max": null,
  "growth": "+1 stat point per character level",
  "cap": "none (approved)"
 },
 "statAliases": {
  "wits": "intellect",
  "intelligence": "intellect",
  "health": "vigor"
 },
 "skills": {
  "list": [
   {
    "id": "rifle",
    "name": "Rifle",
    "base": 4,
    "gov": {
     "perception": 6,
     "luck": 2
    },
    "max": 120,
    "blurb": "Carbines, revolvers, scatterguns."
   },
   {
    "id": "melee",
    "name": "Melee",
    "base": 8,
    "gov": {
     "strength": 6,
     "endurance": 2
    },
    "max": 120,
    "blurb": "Axes, knives, picks, iron bars."
   },
   {
    "id": "doctor",
    "name": "Doctor",
    "base": 4,
    "gov": {
     "intellect": 5,
     "vigor": 2
    },
    "max": 120,
    "blurb": "Bandages and kits do more."
   },
   {
    "id": "lock",
    "name": "Lockpick",
    "base": 4,
    "gov": {
     "intellect": 4,
     "perception": 3
    },
    "max": 120,
    "blurb": "Pins, hatches, and stubborn doors."
   },
   {
    "id": "speech",
    "name": "Speech",
    "base": 8,
    "gov": {
     "intellect": 5,
     "luck": 2
    },
    "max": 120,
    "blurb": "Talk a person into the hard choice."
   },
   {
    "id": "barter",
    "name": "Barter",
    "base": 6,
    "gov": {
     "intellect": 4,
     "luck": 3
    },
    "max": 120,
    "blurb": "Iron goes further at a stall."
   },
   {
    "id": "sneak",
    "name": "Sneak",
    "base": 4,
    "gov": {
     "perception": 4,
     "luck": 3
    },
    "max": 120,
    "blurb": "Hostile eyes pick you up later."
   },
   {
    "id": "trail",
    "name": "Trail",
    "base": 8,
    "gov": {
     "perception": 3,
     "endurance": 3
    },
    "max": 120,
    "blurb": "See farther. Pull a little more from a node."
   },
   {
    "id": "mechanics",
    "name": "Mechanics",
    "base": 4,
    "gov": {
     "intellect": 4,
     "agility": 2
    },
    "max": 120,
    "blurb": "Engines, bikes, repairs. Merged with town Tinkering.",
    "tradeLvBonus": 6
   },
   {
    "id": "climbing",
    "name": "Climbing",
    "base": 4,
    "gov": {
     "agility": 4,
     "strength": 3
    },
    "max": 120,
    "blurb": "Over rubble, fences and ledges: shortcuts and high loot."
   },
   {
    "id": "electronics",
    "name": "Electronics",
    "base": 2,
    "gov": {
     "intellect": 5,
     "perception": 2
    },
    "max": 120,
    "blurb": "Hotwire engines, fix radios, open powered locks."
   }
  ],
  "aliases": {
   "tinkering": "mechanics"
  },
  "traitMods": {
   "eye": {
    "rifle": 12,
    "melee": -8
   },
   "camp": {
    "melee": 12,
    "rifle": -8
   },
   "step": {
    "lock": 12,
    "sneak": 12
   }
  }
 },
 "perks": [
  {
   "id": "steady",
   "name": "Steady hands",
   "blurb": "Rifle +15, and a gun hits a little harder.",
   "need": {
    "skill": "rifle",
    "score": 25
   },
   "bonus": {
    "rifle": 15
   }
  },
  {
   "id": "logger",
   "name": "Logger",
   "blurb": "Melee +15, and close work hits harder.",
   "need": {
    "skill": "melee",
    "score": 25
   },
   "bonus": {
    "melee": 15
   }
  },
  {
   "id": "stitch",
   "name": "Field stitch",
   "blurb": "Doctor +15. Wraps heal more.",
   "need": {
    "skill": "doctor",
    "score": 25
   },
   "bonus": {
    "doctor": 15
   }
  },
  {
   "id": "soft",
   "name": "Soft step",
   "blurb": "Sneak +15.",
   "need": {
    "skill": "sneak",
    "score": 25
   },
   "bonus": {
    "sneak": 15
   }
  },
  {
   "id": "haggle",
   "name": "Horse trade",
   "blurb": "Barter +15.",
   "need": {
    "skill": "barter",
    "score": 20
   },
   "bonus": {
    "barter": 15
   }
  },
  {
   "id": "pins",
   "name": "Sure pins",
   "blurb": "Lockpick +15. Picks slip less.",
   "need": {
    "skill": "lock",
    "score": 25
   },
   "bonus": {
    "lock": 15
   }
  },
  {
   "id": "deadeye",
   "name": "Deadeye",
   "blurb": "Called shots to the head land more often.",
   "need": {
    "skill": "rifle",
    "score": 40
   }
  },
  {
   "id": "known",
   "name": "Known face",
   "blurb": "Speech +12. Towns take your word a little further.",
   "need": {
    "skill": "speech",
    "score": 30
   },
   "bonus": {
    "speech": 12
   }
  },
  {
   "id": "wool",
   "name": "Thick wool",
   "blurb": "Defense +2.",
   "def": 2
  },
  {
   "id": "quick",
   "name": "Quick hands",
   "blurb": "Two more action points in a turn.",
   "ap": 2
  }
 ],
 "traits": [
  {
   "id": "eye",
   "name": "Keen eye",
   "blurb": "Better with a rifle. Worse up close.",
   "hp": 0,
   "staminaRegenMul": 1,
   "skills": {
    "rifle": 12,
    "melee": -8
   }
  },
  {
   "id": "hide",
   "name": "Thick hide",
   "blurb": "More life. Stamina comes back slower.",
   "hp": 14,
   "staminaRegenMul": 0.55,
   "skills": {}
  },
  {
   "id": "step",
   "name": "Light step",
   "blurb": "Surer locks. Less life.",
   "hp": -8,
   "staminaRegenMul": 1,
   "skills": {
    "lock": 12,
    "sneak": 12
   }
  },
  {
   "id": "camp",
   "name": "Camp strong",
   "blurb": "Better with an axe or a pick. Worse with a rifle.",
   "hp": 0,
   "staminaRegenMul": 1,
   "skills": {
    "melee": 12,
    "rifle": -8
   }
  }
 ],
 "backstories": [
  {
   "id": "veteran",
   "name": "Veteran",
   "core": {
    "grit": 2,
    "perception": 1
   },
   "trade": {
    "marksmanship": 2,
    "leadership": 1,
    "firstaid": 1
   }
  },
  {
   "id": "mechanic",
   "name": "Mechanic",
   "core": {
    "intellect": 2,
    "agility": 1
   },
   "trade": {
    "mechanics": 2,
    "scavenging": 1,
    "carpentry": 1
   }
  },
  {
   "id": "farmer",
   "name": "Farmer",
   "core": {
    "endurance": 2,
    "grit": 1
   },
   "trade": {
    "farming": 2,
    "cooking": 1,
    "foraging": 1
   }
  },
  {
   "id": "hunter",
   "name": "Woods guide",
   "core": {
    "perception": 1,
    "agility": 2
   },
   "trade": {
    "hunting": 2,
    "tracking": 1,
    "trapping": 1
   }
  }
 ],
 "classes": [
  {
   "id": "hunter",
   "name": "Hunter",
   "stats": {
    "strength": 1,
    "vigor": 1,
    "endurance": 2,
    "intellect": 2,
    "perception": 3,
    "luck": 2
   },
   "kitHp": 40,
   "atk": 2,
   "tags": [
    "rifle",
    "sneak",
    "trail"
   ]
  },
  {
   "id": "medic",
   "name": "Medic",
   "stats": {
    "strength": 1,
    "vigor": 2,
    "endurance": 1,
    "intellect": 2,
    "perception": 2,
    "luck": 1
   },
   "kitHp": 42,
   "atk": 2,
   "tags": [
    "doctor",
    "speech",
    "barter"
   ]
  },
  {
   "id": "thief",
   "name": "Prowler",
   "stats": {
    "strength": 1,
    "vigor": 1,
    "endurance": 2,
    "intellect": 3,
    "perception": 2,
    "luck": 2
   },
   "kitHp": 36,
   "atk": 2,
   "tags": [
    "lock",
    "sneak",
    "speech"
   ]
  },
  {
   "id": "fighter",
   "name": "Camp hand",
   "stats": {
    "strength": 3,
    "vigor": 2,
    "endurance": 2,
    "intellect": 1,
    "perception": 1,
    "luck": 1
   },
   "kitHp": 52,
   "atk": 3,
   "tags": [
    "melee",
    "trail",
    "doctor"
   ]
  },
  {
   "id": "tinker",
   "name": "Tinker",
   "stats": {
    "strength": 1,
    "vigor": 1,
    "endurance": 2,
    "intellect": 3,
    "perception": 2,
    "luck": 1
   },
   "kitHp": 40,
   "atk": 2,
   "tags": [
    "mechanics",
    "electronics",
    "doctor"
   ],
   "note": "Approved by Justin (Oct 23): Intellect-led; tags Mechanics, Electronics, Doctor."
  }
 ],
 "classDefault": "fighter",
 "classAliases": {
  "woodsman": "fighter",
  "scrounger": "thief",
  "fixer": "medic",
  "camp hand": "fighter",
  "camphand": "fighter",
  "prowler": "thief",
  "tinkerer": "tinker"
 },
 "checks": {
  "base": 50,
  "min": 5,
  "max": 95,
  "repDiv": 4,
  "karmaDiv": 8
 },
 "levelUp": {
  "xpBase": 24,
  "xpPerLevel": 18,
  "statPointsPerLevel": 1,
  "skillPointsBase": 3,
  "skillPointsPerIntellect": 1,
  "tagMult": 2,
  "perkEvery": 3,
  "hpPerLevel": 6
 },
 "town": {
  "_owner": "Quest RPG towns (quest-harmony/pittsfield/skowhegan). Approved by Justin Oct 23.",
  "sellPrice": {
   "description": "Town trader buy-back (player sells): floor(base * (baseMul + barter/barterDiv + max(0,rep)/repDiv)), min 1. Buying uses the master priceOf.",
   "baseMul": 0.4,
   "barterDiv": 200,
   "repDiv": 200,
   "min": 1
  },
  "repKeys": {
   "harmony": "harmony",
   "pittsfield": "pittsfield",
   "skowhegan": "skowhegan"
  },
  "repKeysDescription": "rep[<key>] used for checks and prices in each town (RPG rep object keys)",
  "scorePerXp": 1,
  "scorePerXpDescription": "1 town score point = 1 character XP",
  "oldSkillMigration": "old town learn-by-use levels -> invested points; tagged skills ceil(lv/2), others lv"
 },
 "derivedText": {
  "maxHp": "max(24, kitHp + (level-1)*6 + max(0,vigor-1)*8 + traitExtra) + grit*3",
  "maxStamina": "70 + endurance*16 + agility*6",
  "staminaRegen": "8 + endurance*3 per s (Thick hide x0.55)",
  "carryLb": "40 + strength*4",
  "crit": "3 + 1.5*agility + 0.5*intellect (%)"
 },
 "derived": {
  "maxHp": {
   "min": 24,
   "perLevel": 6,
   "perVigorAbove1": 8,
   "perGrit": 3
  },
  "maxStamina": {
   "base": 70,
   "perEndurance": 16,
   "perAgility": 6
  },
  "staminaRegen": {
   "base": 8,
   "perEndurance": 3
  },
  "carryLb": {
   "base": 40,
   "perStrength": 4
  },
  "crit": {
   "base": 3,
   "perAgility": 1.5,
   "perIntellect": 0.5
  },
  "accuracyPerPerception": 2,
  "sightPerPerception": 1,
  "barterPctPerIntellect": 1,
  "barterPctCap": 15,
  "talkPerIntellect": 2,
  "talkPerGritHalf": 1,
  "sickResistPerGrit": 0.04,
  "sickResistCap": 0.4,
  "drainPerEndurance": 0.05,
  "drainFloor": 0.6,
  "apBase": 8
 },
 "checksText": "clamp(5, 95, score - dc + 50 + round(rep/4 + karma/8))",
 "levelUpText": "xp need 24+18*level; each level +1 stat point, +(3+intellect) skill points (tagged skills x2 per point), perk slot every 3 levels, maxHp +6",
 "price": {
  "barterDiv": 4,
  "repDiv": 5,
  "cutCap": 40,
  "hikeRepDiv": 4,
  "hikeCap": 35,
  "min": 1,
  "text": "price = max(min, round(base*(100-cut+hike)/100)); cut=min(cutCap, floor(barter/barterDiv)+floor(max(0,rep)/repDiv)); hike = rep<0 ? min(hikeCap, floor(-rep/hikeRepDiv)) : 0"
 },
 "rep": {
  "keys": [
   "lowelltown",
   "attean",
   "holeb",
   "ponds",
   "harmony",
   "pittsfield",
   "skowhegan"
  ],
  "start": 0,
  "hostileAt": -15,
  "townKeys": [
   "harmony",
   "pittsfield",
   "skowhegan"
  ]
 },
 "townScoreXp": 1,
 "oldTownSkillConversion": {
  "learnByUseLvToInvested": 0.5,
  "round": "floor",
  "text": "old town saves: learn-by-use skill levels are halved into invested points (once)"
 }
}; if (typeof module !== "undefined") module.exports = g.STATS_RULES; })(typeof window !== "undefined" ? window : globalThis);
