// Shared character schema: The Long Winter (Harmony town layer) <-> Maine RPG v11+ (src/game/engine.ts, progress.ts, v13.ts).
// STATS are the RPG's own attributes (same keys). SKILLS sit on top, each governed by stats, and grow with use.
// Plain JS; works as <script> (window.CHARACTER) or require()/import.
(function(root){
const STATS=[ // RPG: player.strength/vigor/endurance/intellect/perception/luck (start 1, + creation bonus), w13.core.agility/grit (v13)
 {id:'strength',name:'Strength',rpg:'player.strength'},{id:'vigor',name:'Vigor',rpg:'player.vigor'},
 {id:'endurance',name:'Endurance',rpg:'player.endurance'},{id:'intellect',name:'Intellect',rpg:'player.intellect (shown as "Wits" in v13 core)'},
 {id:'perception',name:'Perception',rpg:'player.perception'},{id:'luck',name:'Luck',rpg:'player.luck'},
 {id:'agility',name:'Agility',rpg:'w13.core.agility'},{id:'grit',name:'Grit',rpg:'w13.core.grit'}];
const STAT_MIN=0, STAT_MAX=10, STAT_DEFAULT={strength:1,vigor:1,endurance:1,intellect:1,perception:1,luck:1,agility:1,grit:1};
// Skill base = c + sum(stat*weight). RPG skills copy progress.ts skillScore() exactly; town skills (rpg:false) are new.
const SKILLS=[
 {id:'melee',name:'Melee',rpg:true,c:8,gov:{strength:6,endurance:2}},
 {id:'rifle',name:'Rifle',rpg:true,c:4,gov:{perception:6,luck:2}},
 {id:'doctor',name:'Doctor',rpg:true,c:4,gov:{intellect:5,vigor:2}},
 {id:'lock',name:'Lockpick',rpg:true,c:4,gov:{intellect:4,perception:3}},
 {id:'speech',name:'Speech',rpg:true,c:8,gov:{intellect:5,luck:2}},
 {id:'barter',name:'Barter',rpg:true,c:6,gov:{intellect:4,luck:3}},
 {id:'sneak',name:'Sneak',rpg:true,c:4,gov:{perception:4,luck:3}},
 {id:'trail',name:'Trail',rpg:true,c:8,gov:{perception:3,endurance:3}},
 {id:'climbing',name:'Climbing',rpg:false,c:4,gov:{agility:4,strength:3}},
 {id:'mechanics',name:'Tinkering',rpg:'v13 trade skill "mechanics"',c:4,gov:{intellect:4,agility:2}},
 {id:'electronics',name:'Electronics',rpg:false,c:2,gov:{intellect:5,perception:2}}];
const SKILL_MAX=120;
// Old town names -> skill ids (for older saves / docs)
const ALIAS={strength:'melee',stealth:'sneak',lockpicking:'lock',charm:'speech',tinkering:'mechanics'};
// Classes = starting skill bonuses (+ a small stat nudge only when the RPG did not send stats).
const CLASSES={
 woodsman:{name:'Woodsman',blurb:'Fighter. Swings an axe like rent is due.',skills:{melee:15,trail:10,climbing:5},statNudge:{strength:2,endurance:1}},
 scrounger:{name:'Scrounger',blurb:'Thief. Finds things. Some of them were not lost.',skills:{sneak:15,lock:15,climbing:15},statNudge:{agility:2,perception:1}},
 fixer:{name:'Fixer',blurb:'Talker. Could sell ice to a Mainer in February.',skills:{speech:15,barter:15},statNudge:{intellect:2,luck:1}},
 tinker:{name:'Tinker',blurb:'Tech. Thinks duct tape is a load-bearing material.',skills:{mechanics:15,electronics:15,doctor:5},statNudge:{intellect:2,perception:1}}};
// Use-based growth: each use adds xp; every (3 + level) xp -> +1 invested point in that skill.
const GROWTH={xpPer:1,need:lv=>3+lv};
function normStats(s){const o={...STAT_DEFAULT};if(s&&typeof s==='object'){for(const k in o)if(typeof s[k]==='number')o[k]=Math.max(STAT_MIN,Math.min(STAT_MAX,s[k]));if(typeof s.wits==='number'&&!(typeof s.intellect==='number'))o.intellect=s.wits;}return o;}
function skillScore(id,stats,skills,cls){const d=SKILLS.find(x=>x.id===id);if(!d)return 0;let b=d.c;for(const k in d.gov)b+=(stats[k]||0)*d.gov[k];
 const inv=(skills&&skills[id]&&skills[id].lv)||0, cb=(CLASSES[cls]&&CLASSES[cls].skills[id])||0;return Math.max(0,Math.min(SKILL_MAX,Math.round(b+inv+cb)));}
// Same curve as progress.ts checkChance (rep/karma 0): percent 5..95
function checkChance(score,dc){return Math.max(5,Math.min(95,score-dc+50));}
// Derived (mirrors engine.ts: maxHp ~ kit.hp + (vigor-1)*8 + grit*3; maxStamina = 70 + endurance*16 + agility*6)
function derived(stats,kitHp=44){return{maxHp:Math.max(24,kitHp+Math.max(0,stats.vigor-1)*8)+stats.grit*3,maxStamina:70+stats.endurance*16+stats.agility*6,carryLb:40+stats.strength*4,barterPct:Math.min(15,stats.intellect)};}
const API={STATS,STAT_MIN,STAT_MAX,STAT_DEFAULT,SKILLS,SKILL_MAX,ALIAS,CLASSES,GROWTH,normStats,skillScore,checkChance,derived,version:1};
if(typeof module!=='undefined'&&module.exports)module.exports=API;root.CHARACTER=API;
})(typeof window!=='undefined'?window:globalThis);
