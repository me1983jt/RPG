// The Long Winter — story / quest skeleton. All keys owned by this town use the 'harmony.' prefix.
// stage 0 = not started; stages listed in order; 'done' is the final stage name.
window.CLASSES = CHARACTER.CLASSES; // skills/classes live in shared/character.js
window.ITEMS = {
  medkit:{name:'Medkit',icon:'✚',heal:20,price:12}, docbag:{name:"Doc's Bag",icon:'👜',price:30},
  jerky:{name:'Jerky',icon:'🥩',food:25,price:3}, donut:{name:'Stale Donut',icon:'🍩',food:15,price:2},
  cider:{name:'Hot Cider',icon:'🍺',food:10,stam:30,price:2}, water:{name:'Water',icon:'💧',food:3,stam:10,price:1},
  meat:{name:'Raw Meat',icon:'🍖',food:20,price:4}, apple:{name:'Apple',icon:'🍎',food:8,price:1},
  bandage:{name:'Bandage',icon:'🩹',heal:6,price:3}, cloth:{name:'Cloth',icon:'🧣',price:1},
  hide:{name:'Hide',icon:'🟫',price:5}, junk:{name:'Junk',icon:'⚙',price:1}
};
window.STORY = {
  title:'The Long Winter',
  acts:[
    {n:1,id:'act1_farm',name:'Cambridge Road',goal:'Fix up the farm and survive the first raid night.',summary:'Months after the grid died. Justin, Sarah, Cyndal and Loki keep the Cambridge Road farm alive: orchard, sugar maples, wood stove, hot cider. Harmony is the nearest town. Goose goes missing.',quests:['harmony.firstSnow','harmony.dog','harmony.school','harmony.bike','harmony.raid'],playable:true},
    {n:2,id:'act2_signal',name:'The Signal',goal:"Get Cyndal's radio working and listen (147.3, Augusta).",summary:'Augusta has fuel, medicine, order. It is bait laid by the Collector.',quests:['harmony.radio','harmony.garden'],flags:['harmony.heardSignal']},
    {n:3,id:'act3_jack',name:"Jack Ready's Bunker",goal:'Earn Jack Ready\'s trust (loyalty 30) for his survey maps.',summary:'Jack Ready and his bunker: supplies, paranoia, a working shortwave. He knows the Augusta signal is a trap.',quests:[]},
    {n:4,id:'act4_kennebec',name:'The Kennebec',goal:'Cross the Kennebec to Skowhegan and talk to Marcel.',summary:'Crossing the river; raider bosses Fur and Mask watch it.',quests:['harmony.meds'],bosses:['fur','mask']},
    {n:5,id:'act5_collector',name:'The Collector',summary:'The warlord shows his hand: he wants Harmony\'s people and stores before winter. Saw and Hole raid the outlying farms.',goal:'Raid the camps at night and take down 3 lieutenants.',quests:[],bosses:['saw','hole']},
    {n:6,id:'act6_grok',name:"The Grok's Woods",summary:'North woods past the Kennebec. The Grok: huge, hairy, slow, dumb, and dangerous. Can be fought, fooled, fed, or sneaked past.',goal:'Go north through the Grok\'s territory to the supply depot.',quests:[]},
    {n:7,id:'act7_choice',name:'Choices',summary:'Unite the towns, deal with the Collector, or go it alone (RPG choice). Town-side: harmony.stayOrNorth flavor.',choice:{mainFlag:'unite|deal|alone',options:{unite:'Unite the towns',deal:'Deal with the Collector',alone:'Go it alone'}}},
    {n:8,id:'act8_siege',name:'Siege of Harmony',summary:'Deep winter. The Collector and the Hollowed horde come. If you went north, Harmony falls or holds without you (based on what you built).',goal:'Hold the farm through the winter assault.',quests:[]},
    {n:9,id:'act9_endings',name:'The Long Winter',summary:'Endings: union, deal, alone, fallen (RPG pickEnding), flavored by town class.'}
  ],
  // Quest ids mirror the main game (maine-rpg v11: v13.ts MAIN_ACTS, quests10.ts Q10, quests11.ts Q11, engine.ts snow/raid).
  // mainId = id in the RPG; src = where it lives there; mainStages = the RPG's own stage numbers.
  // town = what Harmony does with it; local = town-only sub-steps, stored as questFlags 'harmony.<id>' (string stage).
  // read = 'story.*' flags the RPG owns (read-only here).
  quests:{
    'harmony.firstSnow':{mainId:'snow',src:'engine.ts snow',name:'First Snow',giver:'sarah (RPG: justin)',act:1,mainStages:{0:'talk to Sarah (RPG: Justin)',1:'bring SNOW_WOOD wood',2:'see Sarah'},
      town:'Act 1 farm chore: haul wood from the woodpile into the house, then Sarah.',local:['given','wood','done'],read:['story.stage'],reward:{score:5,items:[{id:'cider',qty:1}]}},
    'harmony.dog':{mainId:'dog',src:'quests10.ts q.dog',name:'Lost Dog',giver:'loki',act:1,side:true,mainStages:{0:'dog home',1:'ran off (see Loki)',2:'follow the tracks',3:'bring Goose home',4:'done'},
      town:'Loki asks; Pete/Mira/notice board point past the orchard into the spruce; marker on the farm; done when story.gooseFound.',local:['ranOff','tracks','found','done'],read:['story.gooseFound'],
      marker:{id:'harmony-dog',target:'farm',label:"Goose's tracks: past the orchard"},reward:{score:15}},
    'harmony.radio':{mainId:'radio',src:'quests10.ts q.radio',name:"Cyndal's Radio",giver:'cyndal',act:2,side:true,mainStages:{0:'not offered',1:'find 3 parts',2:'bring to Cyndal',3:'done'},parts:['a 6V6 tube in a sock','a coil of copper wire on a spool','a lantern battery that still kicks'],
      town:"Cyndal offers. Hal has the 6V6 tube in his junk drawer (barter, or Fixer talks it free). Other parts: Lowelltown grange, Attean fire tower, Holeb camp road (marker).",local:['offered','tube','done'],
      marker:{id:'harmony-radio',target:'lowell',label:"Radio parts: Lowelltown grange"},reward:{score:8}},
    'harmony.meds':{mainId:'meds',src:'quests11.ts Q11',name:'Medicine Run',giver:'mira',act:4,side:true,mainStages:{1:'south road to Skowhegan',2:'clear the Kennebec bridge',3:'search Redington hospital',4:'back to Mira',5:'done'},
      town:'Mira offers it in Harmony; marker on Skowhegan; hand-in to Mira after the trip (town gives a medkit + credit).',local:['offered','away','returned','done'],
      marker:{id:'harmony-meds',target:'skow',label:'Medicine Run: Skowhegan'},reward:{score:10,items:[{id:'medkit',qty:1}]}},
    'harmony.school':{mainId:'school',src:'quests11.ts Q11',name:'School Days',giver:'sarah',act:1,side:true,mainStages:{1:'clear the Harmony school',2:'fetch Cyndal and Loki',3:'escort to school',4:'pick books',5:'escort home',6:'back to Sarah',7:'done'},
      town:'Step 1 plays in town: the school squatter on Main Street (fight, sneak, bribe, talk, or Goose).',local:['offered','cleared'],reward:{score:8}},
    'harmony.bike':{mainId:'bike',src:'quests11.ts Q11',name:'Bike Parts',giver:'sarah/loki here (RPG: justin)',act:1,side:true,mainStages:{1:'look over the bike by the barn',2:'junkyard',3:'garage',4:'raider sled',5:'take engine',6:'spark plug from Jack',7:'build',8:'done'},
      town:"Step 1 as a class puzzle: the barn's stuck door (force / pick / rehang hinge / charm Loki out of the key), then look over your dad's Whizzer.",local:['seen','looked'],reward:{score:5}},
    // ---- Acts 2-5 (v13 MAIN_ACTS; RPG flags: main.flags.signal, jackTalk + loyal.jack>=30, main.flags.marcel, main.ltKills>=3) ----
    'harmony.signal':{mainId:'main.act2',src:'v13 MAIN_ACTS[1] / main.flags.signal',name:'The Signal',giver:'cyndal',act:2,
      town:"Raise the antenna in Cyndal's loft (class alts), hear the Augusta loop on 147.3, then the town meeting at the church debates the 'Augusta trip' (class alts; one choice is a death).",local:['asked','heard','debated'],extraFlags:['harmony.antenna','harmony.signalVerdict (trap|split)','harmony.signalHow'],reward:{score:35}},
    'harmony.jack':{mainId:'main.act3',src:'v13 MAIN_ACTS[2] / main.flags.jackTalk + loyal.jack>=30',name:"Jack Ready's Bunker",giver:'jack',act:3,
      town:'Bunker ridge + interior (entry town:"bunker"). Tripwires (class alts), his dog, gifts, a fair trade, a favor (fix generator / split wood), radio talk -> trust 30 -> survey maps.',local:['marker','met','inside','maps'],extraFlags:['harmony.jackTrust (number, town-earned)','harmony.jackMaps'],
      marker:{id:'harmony-jack',target:'bunker',label:"Jack Ready's bunker"},reward:{score:40}},
    'harmony.marcel':{mainId:'main.act4',src:'v13 MAIN_ACTS[3] / main.flags.marcel',name:'The Kennebec',giver:'jack',act:4,
      town:"Cross the Skowhegan bridge (Fur & Mask: fight, toll, talk, haggle, climb girders, sneak under, siren) and talk to Marcel.",local:['go','met','briefed'],
      marker:{id:'harmony-marcel',target:'skow',label:'Marcel in Skowhegan'},reward:{score:27}},
    'harmony.bridge':{mainId:'(part of act 4)',src:'town-local',name:'Kennebec Bridge',act:4,town:'How the bridge was crossed.',local:['fur-down','bribed','talked','climbed','snuck','siren']},
    'harmony.ferry':{mainId:'ferry',src:'quests10.ts q.ferry 0-3 (planks, rope, winch)',name:'Kennebec Crossing',act:4,side:true,town:'Ferry landing scene (entry town:"kennebec"): planks (haul), rope (2 cloth), winch part (tinker/melee/lockpick) -> fixed.',local:['given','fixed'],extraFlags:['harmony.ferryPlanks','harmony.ferryRope','harmony.ferryWinch'],
      marker:{id:'harmony-ferry',target:'kennebec',label:'Kennebec ferry landing'},reward:{score:15}},
    'harmony.collector':{mainId:'main.act5',src:'v13 MAIN_ACTS[4] / main.ltKills>=3',name:'The Collector',giver:'marcel',act:5,
      town:'Three camp scenes (Saw at the gravel pit, Hole at the Holeb cut, Mask behind the mill); each lieutenant: fight, sneak, talk, flare trap, drop a tree, Goose. Free prisoners -> Harmony. The Collector visits Harmony (avoidable; hitting him is a death).',local:['stalled','paid','fooled','hid','listened'],
      markers:{gravel:{id:'harmony-lt-gravel',target:'raiders',label:'Saw: gravel pit camp'},holeb:{id:'harmony-lt-holeb',target:'north',label:'Hole: Holeb cut camp'},mill:{id:'harmony-lt-mill',target:'skow',label:'Mask: behind the Skowhegan mill'}},reward:{score:65}},
    'harmony.ltGravel':{mainId:'main.ltKills',name:'Lieutenant: Saw',act:5,local:['down','gone']},
    'harmony.ltHoleb':{mainId:'main.ltKills',name:'Lieutenant: Hole',act:5,local:['down','gone']},
    'harmony.ltMill':{mainId:'main.ltKills',name:'Lieutenant: Mask',act:5,local:['down','gone']},
    // ---- Acts 6-7 ----
    'harmony.grok':{mainId:'main.act6 + quests11 grok',src:'v13 MAIN_ACTS[5] / main.flags.grokPath; Q11 grok (The Grok Hunt)',name:"The Grok's Woods",act:6,
      town:'grokwoods scene (entry "grokwoods"): ridge vs bottom, scraped spruce (Trail), tracks, the Grok at the blowdown: fight (very hard), sneak, befriend with apples/meat (Speech), class trick, Goose.',local:['tracks','dead','snuck','friend','tricked'],extraFlags:['harmony.grokFriend','harmony.grokClaw'],
      marker:{id:'harmony-grok',target:'north',label:"The Grok's woods: walk the ridge"}},
    'harmony.wolves':{mainId:'wolves',src:'quests11 Wolf Pack (Sarah)',name:'Wolf Pack',act:6,side:true,town:'Wolf sign in the Grok woods: fight the pack leader or drive them off (Trail).',local:['leader','driven']},
    'harmony.depotGuard':{mainId:'(act 6)',name:'Depot guard',act:6,local:['down','snuck','talked']},
    'harmony.depot':{mainId:'main.act6 depot',src:'main.flags.depot (RPG gives gas 3, medicine 2)',name:"The Collector's Depot",act:6,town:'depot scene (entry "depot"): guard (fight/sneak/talk), ledger, medicine, fuel: share / take / burn.',local:['found','shared','taken','burned'],extraFlags:['harmony.ledger','harmony.depotMeds']},
    'harmony.choice':{mainId:'main.act7 choice',src:'v13 MAIN_ACTS[6] / main.choice unite|deal|alone',name:'Choices',act:7,
      town:'kitchen scene (farm house at act 7): talk with Sarah, Cyndal, Loki; town support from earlier deeds; unite (support>=4 or class rally), deal (Barter haggles terms), alone; then stay & defend Harmony vs take the family north.',local:['unite','deal','alone'],
      extraFlags:['harmony.family (stay|north)','harmony.support (number)','harmony.uniteHow','harmony.dealTerms (haggled|full)'],marker:{id:'harmony-siege',target:'farm',label:'Siege of Harmony: hold the farm'}},
    'harmony.garden':{mainId:'garden',src:'quests11.ts Q11',name:"Mira's Garden",giver:'mira',act:2,side:true,town:'Mira mentions it (journal only).',local:['heard']},
    'harmony.sick':{mainId:'sick',src:'quests11.ts Q11',name:'The Sick Neighbor',giver:'sarah',side:true,town:'Doc Ellen mentions the Herseys (journal only).',local:['heard']},
    'harmony.raid':{mainId:'raid',src:'engine.ts raid night / v113 raid1,raid5',name:'Raid Nights',giver:'sarah',act:1,side:true,town:'Sarah warns; raids run in the RPG at the farm.',local:['warned']}
  },
  // Main-game quests not touched by the town (listed for completeness).
  mainOnly:{seed:'Seed Run (Q10, Sarah)',ferry:'Kennebec Crossing (Q10)',moose:'Moose Season (Q10, Sarah here; RPG: Justin)',mill:'The Woolen Mill',ice:'Ice Out (Sarah)',fuel:'Fuel Run',grok:'The Grok Hunt (needs ferry)',bridge:'Bridge Out',caches:"Jack Ready's Bunker Map (needs jack)",light:'Lighthouse Signal (Cyndal, needs radio)',wolves:'Wolf Pack (Sarah)'},
  storyFlags:{'story.stage':'v14.st prologue 0 truck,1 fire,2 smoke,3 First Snow trust task,4 defend farm,5 secured','story.gooseFound':'q10.dog>=3','story.day':'day','story.seen.*':'w13.seen'},
  endings:[ // RPG v13 ENDINGS; town adds a class epilogue line
    {id:'union',title:'The Valley Holds',when:"choice unite & siege won & 2+ alive"},
    {id:'deal',title:"The Collector's Peace",when:'choice deal'},
    {id:'alone',title:'Alone on Cambridge Road',when:'choice alone & siege won'},
    {id:'fallen',title:'The Long Dark',when:'siege lost or <2 alive'}
  ],
  classEpilogue:{woodsman:'Harmony names the bridge after you.',scrounger:'Nobody ever finds your caches. That is the point.',fixer:'Town meeting votes you in. You did not run.',tinker:'The Grange Hall gets the first lights back in the county.'}
};
