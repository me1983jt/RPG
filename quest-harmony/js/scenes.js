// Scene config. To use real art later, set bg:'img/scenes/farm.jpg' (640x360 logical; any size is stretched).
// When bg is null, a painterly placeholder is generated from `paint`.
// walk: polygon of walkable floor. hotspots: rect [x,y,w,h]; verbs look/hand/talk = text or 'fn:name'.
// exits: rect + to (scene id) or leave (exit id for the companion RPG).
window.SCENES = {
  farm:{name:'Cambridge Road Farm', bg:null, paint:'farm', start:[320,300],
    walk:[[0,250],[640,250],[640,360],[0,360]],
    hotspots:[
      {id:'house',name:'Farmhouse',rect:[60,90,200,150],look:'The farmhouse. Woodsmoke from the chimney means the stove is lit and Sarah is winning.',hand:'fn:enterHouse',talk:'You tell the house you love it. The house creaks back. That counts.'},
      {id:'stove',name:'Wood stove pipe',rect:[200,60,26,50],look:'The stovepipe. Hot enough to fry an egg, or a hand.',hand:'fn:deathStove',talk:'The stovepipe hisses. Rude.'},
      {id:'orchard',name:'Apple orchard',rect:[420,110,220,120],look:'The orchard. Macs and Cortlands, half picked. The deer have opinions about the other half.',hand:'fn:pickApple',talk:'You whisper encouragement to the trees. Next year\'s crop thanks you in advance.'},
      {id:'maples',name:'Sugar maples',rect:[300,80,100,140],look:'Sugar maples. In March they pay rent in syrup.',hand:'Nothing to tap in this season. You hug the tree anyway. It is tolerant.',talk:'"Hello, tree." The tree, a Mainer, says nothing.'},
      {id:'shed',name:'Barn',rect:[270,170,60,70],look:"The barn. Your dad's old motor bike is in there, behind a door that is stuck, rusted and badly hinged. A trifecta.",hand:'fn:shed',talk:'You ask the barn door nicely. Still stuck.'},
      {id:'woodpile',name:'Woodpile',rect:[10,230,80,40],look:'Split firewood. Never enough. There is never, ever enough.',hand:'fn:woodpile',talk:'The woodpile does not want to talk about how small it is.'}
    ],
    npcs:['sarah','cyndal','loki'],
    exits:[{rect:[600,250,40,110],to:'harmony',at:[40,300],name:'Road to Harmony (east)'},{rect:[0,330,600,30],leave:'worldmap',name:'Cambridge Road (world map)'}]},
  harmony:{name:'Harmony — Main Street', bg:null, paint:'town', start:[60,300],
    walk:[[0,245],[640,245],[640,360],[0,360]],
    hotspots:[
      {id:'store',name:'Harmony Trading Post',rect:[40,80,170,160],look:'The old general store, now the Trading Post. Hal sells everything except refunds.',hand:'fn:goStore',talk:'"OPEN" says the sign. Optimistic.'},
      {id:'grange',name:'Grange Hall clinic',rect:[430,70,180,170],look:'The Grange Hall, now Doc Ellen\'s clinic. The smell of boiled bandages and grim competence.',hand:'fn:goClinic',talk:'Nobody answers the building. The doctor is inside.'},
      {id:'church',name:'Church steeple',rect:[260,20,60,110],look:'The church. The bell rings for fires, raiders, and Tuesday bean suppers.',hand:'You can\'t reach the bell rope from here, which is best for everyone.',talk:'You pray for propane. No answer, but the line is busy this winter.'},
      {id:'well',name:'Town well',rect:[300,200,50,45],look:'The town well. Cold, clean, and free, the three best words in Harmony.',hand:'fn:well',talk:'You yell "HELLO" down the well. The well is unimpressed.'},
      {id:'board',name:'Notice board',rect:[230,150,50,60],look:'The notice board. LOST: GOOSE (dog). MEDICINE WANTED. SQUATTERS AT THE SCHOOL. FOR TRADE: one (1) slightly haunted snowblower.',hand:'fn:board',talk:'You read it aloud for the benefit of nobody.'},
      {id:'wire',name:'Downed power line',rect:[350,150,60,60],look:'A downed power line. The grid\'s been dead for months. Probably.',hand:'fn:deathWire',talk:'"Are you live?" The wire keeps its secrets.'},
      {id:'school',name:'Harmony school (squatter)',rect:[600,150,40,95],look:'The old Harmony school at the north end of Main Street. Smoke from the chimney, and the man on the steps is not a teacher.',hand:'fn:fightScout',talk:'fn:fightScout'}
    ],
    npcs:['mira','pete'],
    exits:[{rect:[0,250,30,110],to:'farm',at:[580,300],name:'Cambridge Road (to farm)'},{rect:[100,330,440,30],leave:'worldmap',name:'Leave Harmony (world map)'}]},
  store:{name:'Harmony Trading Post', bg:null, paint:'store', start:[320,320],
    walk:[[40,270],[600,270],[640,360],[0,360]],
    hotspots:[
      {id:'counter',name:'Counter',rect:[180,190,280,70],look:'A counter worn smooth by a century of elbows and complaints.',hand:'fn:trade',talk:'fn:trade'},
      {id:'shelves',name:'Shelves',rect:[20,60,150,190],look:'Shelves of canned goods with labels long gone. Every dinner is a surprise.',hand:'Hal clears his throat in a way that means "hands off the shelves".',talk:'The beans say nothing. Beans never do, until later.'},
      {id:'cans',name:'Mystery can',rect:[500,180,50,40],look:'A dented can marked only "MEAT?". The question mark is doing a lot of work.',hand:'fn:deathCan',talk:'The can gurgles. Cans should not gurgle.'}
    ],
    npcs:['hal'], exits:[{rect:[0,320,640,40],to:'harmony',at:[125,262],name:'Back to Main Street'}]},
  clinic:{name:'Grange Hall Clinic', bg:null, paint:'clinic', start:[320,320],
    walk:[[40,270],[600,270],[640,360],[0,360]],
    hotspots:[
      {id:'cots',name:'Cots',rect:[30,190,200,70],look:'Cots. Someone\'s snoring like a chainsaw with a head cold.',hand:'You\'re not that tired. Yet.',talk:'You whisper "get well". The snoring intensifies.'},
      {id:'cabinet',name:'Medicine cabinet',rect:[470,80,120,150],look:'A locked cabinet full of the most valuable things in Harmony: pills.',hand:'Doc Ellen is watching you with the eyes of a woman who has amputated things.',talk:'The cabinet is locked and above negotiation.'}
    ],
    npcs:['ellen'], exits:[{rect:[0,320,640,40],to:'harmony',at:[520,262],name:'Back to Main Street'}]}
};
// NPCs: drawn as placeholder figures. sprite:null => drawn procedurally; set a png path later.
window.NPCS = {
  sarah:{name:'Sarah',scene:'farm',pos:[220,285],hair:'#1b1009',coat:'#5a2f3a',curly:true,look:'Sarah. Long dark curly hair, a rifle on the porch, and a list. You are on the list.',talk:'fn:talkSarah',hand:'fn:tradeSarah'},
  cyndal:{name:'Cyndal',scene:'farm',pos:[400,300],hair:'#6b4423',coat:'#3c5a7a',small:true,look:'Cyndal. Sharp, kind, and already three steps ahead of you.',talk:'fn:talkCyndal',hand:'You give Cyndal a hug. She allows it, briefly, with dignity.'},
  loki:{name:'Loki',scene:'farm',pos:[480,320],hair:'#8a6a3a',coat:'#5a6a2a',small:true,look:'Loki. Brave, curious, and currently covered in something. Probably mud.',talk:'fn:talkLoki',hand:'You ruffle Loki\'s hair. He ruffles back. Fair.'},
  mira:{name:'Mira',scene:'harmony',pos:[190,290],hair:'#bbb',coat:'#4a3a5a',look:'Mira. Old, sharp, and knitting something that could stop a bullet.',talk:'fn:talkMira',hand:'Mira swats your hand with a knitting needle. Fair.'},
  pete:{name:'Pete',scene:'harmony',pos:[470,300],hair:'#333',coat:'#6a4a2a',look:'Pete, Harmony\'s self-appointed mayor, sheriff, and weatherman. Wrong at all three.',talk:'fn:talkPete',hand:'Pete shakes your hand for too long. Politicians.'},
  hal:{name:'Hal',scene:'store',pos:[320,230],hair:'#777',coat:'#3a4a3a',look:'Hal. Runs the Trading Post. Smiles like a man who has never once given change.',talk:'fn:talkHal',hand:'fn:trade'},
  ellen:{name:'Doc Ellen',scene:'clinic',pos:[380,290],hair:'#a55',coat:'#ddd',look:'Doc Ellen. Former vet, current town doctor. Says people are just dogs with worse manners.',talk:'fn:heal',hand:'fn:heal'}
};
// Stub world map (standalone only). ids match the companion RPG's location ids.
window.WORLD = [
  {id:'farm',name:'Cambridge Road Farm',x:150,y:220},{id:'harmony',name:'Harmony',x:250,y:190},
  {id:'skow',name:'Skowhegan',x:360,y:250},{id:'kennebec',name:'Kennebec River',x:420,y:150},
  {id:'bunker',name:"Jack's Bunker",x:120,y:110},{id:'north',name:'North Woods',x:480,y:60},{id:'augusta',name:'Augusta',x:470,y:320}
];
