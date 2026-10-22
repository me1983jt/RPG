// Acts 2-5 content (mirrors maine-rpg v13.ts MAIN_ACTS 2-5 + quests10 ferry). Loaded before game.js;
// game.js calls ACTS_EXT(H) with its helpers. Scenes/NPCs here are config, logic in ACT handlers.
// Entry ids for the RPG: enterTown.town or ?town= -> scene; or ?scene=<id>.
window.ENTRY={harmony:'harmony',bunker:'bunkerOut',kennebec:'river',skow:'bridge',raiders:'camp_gravel',north:'camp_holeb'};
window.ACTS_EXT=function(H){
const {ACT,DEATH,PAINT,NPC_SHOW,SCENES,NPCS,WORLD,msg,say,choose,check,score,setQ,qs,give,take,has,die,hurt,loadScene,startFight,startQuestMarker,useStat,tick,toast,act,blob,grad,pine,house,W}=H;
const G=()=>H.G(), F=k=>G().flags[k], setF=(k,v)=>{G().flags[k]=v;H.save();};
const cls=()=>G().cls;
function advance(n,title){if((G().localAct||1)<n){G().localAct=n;setF('harmony.act',n);toast(`ACT ${n}: ${title}`);}}
const trust=()=>(+F('story.jackLoyal')||0)+(+F('harmony.jackTrust')||0);
function addTrust(key,n,why){if(F('harmony.jt.'+key))return;setF('harmony.jt.'+key,true);setF('harmony.jackTrust',(+F('harmony.jackTrust')||0)+n);toast(`Jack's trust +${n} (${why}). Now ${trust()}/30.`);}
const Q=id=>STORY.quests[id];
WORLD.push({id:'raiders',name:'Gravel pit (raider camp)',x:220,y:300});
// ---------- painters ----------
function interior(c,wall,floor,beam){c.fillStyle=grad(c,0,270,wall);c.fillRect(0,0,W,270);c.fillStyle='rgba(0,0,0,.22)';for(let x=0;x<W;x+=36)c.fillRect(x,0,3,270);if(beam){c.fillStyle='#3a2414';c.fillRect(0,20,W,14);c.beginPath();c.moveTo(0,0);c.lineTo(320,-10);c.lineTo(W,0);c.fill();}c.fillStyle=grad(c,250,360,floor);c.fillRect(0,250,W,110);}
function night(c,top){c.fillStyle=grad(c,0,250,top||['#0c1222','#24304a','#3a3a48']);c.fillRect(0,0,W,250);for(let i=0;i<60;i++){c.fillStyle='rgba(255,255,230,.7)';c.fillRect((i*97)%W,(i*53)%140,1.5,1.5);}}
Object.assign(PAINT,{
 loft(c,r){interior(c,['#3a2616','#5a3c22'],['#5a4028','#3a2818'],1);c.fillStyle='#7a9ab8';c.fillRect(470,60,90,70);c.fillStyle='#3a2414';c.fillRect(512,60,5,70);c.fillRect(470,93,90,5);
  c.fillStyle='#6a4a2a';c.fillRect(150,190,300,60);c.fillStyle='#2a2a2a';c.fillRect(200,130,140,62);c.fillStyle='#d8a040';c.fillRect(215,145,60,20);c.fillStyle='#888';for(let i=0;i<4;i++)blob(c,295+i*12,168,4,4,'#999');
  c.strokeStyle='#b07030';c.lineWidth=2;c.beginPath();c.moveTo(340,140);c.quadraticCurveTo(450,40,515,95);c.stroke();c.fillStyle='#4a3a2a';c.fillRect(380,205,40,40);c.fillStyle='#c0a060';c.fillRect(30,120,90,130);},
 meeting(c,r){interior(c,['#6a5a48','#8a7458'],['#6a5a42','#4a3a2a']);c.fillStyle='#c8c0a0';for(let i=0;i<3;i++)c.fillRect(120+i*160,40,60,110);
  c.fillStyle='#4a3020';for(let row=0;row<2;row++)for(let i=0;i<5;i++)c.fillRect(60+i*110,215+row*22,80,10);c.fillStyle='#5a3a22';c.fillRect(290,150,60,70);c.fillStyle='#aaa';c.fillRect(540,170,30,45);c.fillStyle='#d8d0b0';c.fillRect(40,60,60,80);},
 bunkerOut(c,r){c.fillStyle=grad(c,0,250,['#8aa0b8','#d0c8b8']);c.fillRect(0,0,W,250);for(let i=0;i<14;i++)pine(c,i*48+r()*14,200,.9,'#2c3c2a');
  c.fillStyle='#6a6a52';c.beginPath();c.moveTo(150,250);c.quadraticCurveTo(330,90,520,250);c.fill();c.fillStyle='#5a5a5a';c.fillRect(290,170,80,70);c.fillStyle='#3a3a3a';c.fillRect(300,180,60,60);for(let i=0;i<4;i++)blob(c,305+i*16,186,2,2,'#aaa');
  c.fillStyle=grad(c,240,360,['#7a7050','#5a5038']);c.fillRect(0,240,W,120);c.strokeStyle='#ccc';c.lineWidth=1;c.beginPath();c.moveTo(60,285);c.lineTo(600,280);c.stroke();for(let i=0;i<8;i++)c.fillRect(70+i*70,280,6,8);
  c.fillStyle='#a03020';c.fillRect(420,320,70,20);c.fillStyle='#e8d8b0';c.fillRect(90,150,90,40);c.fillStyle='#555';c.fillRect(132,190,6,50);c.fillStyle='#444';c.fillRect(250,110,6,70);c.fillRect(244,104,18,10);},
 bunkerIn(c,r){interior(c,['#3c4038','#55584c'],['#4a4a40','#2a2a24']);c.fillStyle='#5a5a50';for(let s=0;s<4;s++){c.fillRect(20,70+s*45,150,6);for(let i=0;i<6;i++)c.fillRect(28+i*24,46+s*45,18,24);}
  c.fillStyle='#6a5030';c.fillRect(240,190,170,50);c.fillStyle='#e8dcb0';c.fillRect(255,180,140,14);c.fillStyle='#2a2a2a';c.fillRect(440,110,100,70);c.fillStyle='#8fd07a';c.fillRect(452,122,40,14);
  c.fillStyle='#c02020';blob(c,600,140,12,12,'#c02020');c.fillStyle='#ddd';c.fillRect(578,108,44,12);c.fillStyle='#4a4a4a';c.fillRect(470,210,70,40);c.fillStyle='#6a6a50';c.fillRect(560,220,70,30);},
 river(c,r){c.fillStyle=grad(c,0,200,['#9ab0c8','#d8d0c4']);c.fillRect(0,0,W,200);for(let i=0;i<16;i++)pine(c,i*42+r()*10,150,.7,'#34443a');
  c.fillStyle=grad(c,150,250,['#4a6a80','#2a4a60']);c.fillRect(0,150,W,100);c.fillStyle='rgba(230,240,250,.7)';for(let i=0;i<12;i++)blob(c,r()*W,170+r()*70,20+r()*30,4,'rgba(230,240,250,.6)');
  c.fillStyle=grad(c,245,360,['#7a6a50','#5a4a38']);c.fillRect(0,245,W,115);c.fillStyle='#6a4a2a';c.fillRect(250,215,160,35);c.fillStyle='#3a2a1a';c.fillRect(250,212,160,6);
  c.strokeStyle='#333';c.lineWidth=2;c.beginPath();c.moveTo(0,190);c.lineTo(W,186);c.stroke();c.fillStyle='#555';c.fillRect(430,230,30,25);c.fillStyle='#8a6a40';for(let i=0;i<4;i++)c.fillRect(60+i*18,280-i*3,60,7);},
 bridge(c,r){night(c,['#2a2438','#5a4a5a','#8a6a5a']);c.fillStyle='#2a3a4a';c.fillRect(0,190,W,60);c.fillStyle='#4a4038';c.fillRect(0,180,W,22);c.strokeStyle='#2a2420';c.lineWidth=4;
  for(let x=0;x<W;x+=80){c.beginPath();c.moveTo(x,180);c.lineTo(x+40,90);c.lineTo(x+80,180);c.stroke();}c.beginPath();c.moveTo(0,90);c.lineTo(W,90);c.stroke();
  c.fillStyle=grad(c,240,360,['#5a5048','#3a3430']);c.fillRect(0,240,W,120);c.fillStyle='#ffb040';blob(c,240,232,10,14,'#ffb040');blob(c,240,232,26,26,'rgba(255,160,60,.25)');c.fillStyle='#999';c.fillRect(150,236,300,2);},
 marcel(c,r){interior(c,['#4a3020','#6a4a2c'],['#5a4028','#3a2818']);c.fillStyle='#3a2416';c.fillRect(30,60,140,190);for(let s=0;s<4;s++)for(let i=0;i<6;i++)blob(c,45+i*22,90+s*42,7,10,['#b8a080','#7a5a3a','#c08040','#5a6a4a'][(i+s)%4]);
  c.fillStyle='#6a4628';c.fillRect(220,195,240,60);c.fillStyle='#e8dcb0';c.fillRect(500,70,110,90);c.fillStyle='#402010';c.font='bold 11px serif';c.fillText('BOUNTIES',520,88);c.fillStyle='#806040';for(let i=0;i<4;i++)c.fillRect(512,98+i*14,86,8);},
 camp(c,r,v){night(c);if(v==='mill'){c.fillStyle='#2a2422';c.fillRect(380,40,240,200);for(let i=0;i<5;i++){c.fillStyle='#e0a040';c.fillRect(400+i*44,80,16,20);}}else if(v==='pit'){c.fillStyle='#5a5040';c.beginPath();c.moveTo(0,140);c.lineTo(200,200);c.lineTo(460,190);c.lineTo(W,130);c.lineTo(W,250);c.lineTo(0,250);c.fill();}else for(let i=0;i<14;i++)pine(c,i*48,240,1.1,'#18241c');
  c.fillStyle=grad(c,240,360,['#3a3428','#22201a']);c.fillRect(0,240,W,120);c.fillStyle='#ff9030';blob(c,320,280,14,10,'#ff9030');blob(c,320,276,40,30,'rgba(255,140,50,.2)');
  c.fillStyle='#5a4a3a';c.fillRect(60,190,90,60);c.strokeStyle='#888';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.moveTo(64+i*16,190);c.lineTo(64+i*16,250);c.stroke();}
  c.fillStyle='#4a3a28';c.fillRect(470,215,110,40);c.fillStyle='#d8d0c0';blob(c,560,60,18,18,'#e8e4d0');}
});
const P=(paint,v)=>paint; // painters receive (c,r) — camp variants below
['pit','holeb','mill'].forEach(v=>{PAINT['camp_'+v]=(c,r)=>PAINT.camp(c,r,v);});
// ---------- deaths ----------
Object.assign(DEATH,{
 battery:['Tongue Twister','You test the lantern battery with your tongue, the old Maine way. It still kicks. So does your heart, then it stops. Cyndal will put that on the parts list: "one dad, slightly used."'],
 plate:['Three Hundred Fifty Volts','You poke the back of the tube set. The 6V6 is happy to show you exactly how much plate voltage it has. Your hair will never lie flat again. Neither will you.'],
 coffee:['Last Cup','You drink the Grange Hall coffee. It has been on that burner since the grid went down. It goes down too, and takes you with it.'],
 augusta:['Come South','You answer the call and walk ninety miles south on a promise. Augusta has order. Augusta has you, now, in a ledger. The Collector thanks you for your donation.'],
 mat:['Welcome','You step on the WELCOME mat. Jack Ready\'s mats do not mean welcome. They mean "pressure plate."'],
 button:['Do Not Press','The button said DO NOT PRESS. Jack wired it to the bunker\'s "visitor clearance" system, which is a lot of bees. Where did he get that many bees?'],
 mre:['Best Before 1998','You eat one of Jack\'s MREs. It says "Beef Patty." The beef patty disagrees. Strongly. Fatally.'],
 swim:['Brisk','You swim the Kennebec in November. It is a lovely, bracing, final swim. The river keeps you as a souvenir.'],
 ice:['Thin Ice','The ice is three inches thick. You are not three inches thick. The math was never on your side.'],
 mask:['Unmasked','You pull off Mask\'s mask. Under it: another mask. He did not want you to know that. Nobody who knows that gets to keep knowing it.'],
 fur:['Not a Coat','You try to pet Fur. Fur is not a coat. Fur is a man in seven coats, and he takes it personally.'],
 campfire:['Warm Welcome','You stroll up to the raiders\' campfire to warm your hands. They are delighted to have a guest. Briefly.'],
 chair:['Hot Seat','You sit in the lieutenant\'s chair. Raiders take seating very seriously. You are buried in it.'],
 collector:['Collected','You take a swing at the Collector. Twenty men take a swing back. He writes you down in his ledger: "One farmer. Poor condition."'],
 boss:['Bossed Around','The raider boss sends you to the big woodpile in the sky.']
});
// ---------- scenes ----------
const bottomLeave=(name)=>({rect:[100,330,440,30],leave:'worldmap',name:name||'Back to the road (world map)'});
Object.assign(SCENES,{
 loft:{name:"Cyndal's Radio Loft",bg:null,paint:'loft',start:[300,320],walk:[[20,262],[620,262],[640,360],[0,360]],
  hotspots:[
   {id:'radio',name:'Tube radio set',rect:[200,128,142,64],look:'An old tube set the size of a breadbox. Cyndal has it humming. The dial glows like a tiny campfire you can\'t cook on.',hand:'fn:radioTune',talk:'fn:radioTune'},
   {id:'radioBack',name:'Back of the radio set',rect:[340,140,40,50],look:'The back panel is off. Inside: tubes, wires, and a little handwritten sign: "350V. NO, DAD."',hand:'fn:radioBack',talk:'You ask the radio nicely to stop being dangerous. It hums smugly.'},
   {id:'antenna',name:'Antenna wire',rect:[400,40,130,100],look:'A long copper wire out the window to... a nail. It is not a great antenna. It is a great clothesline.',hand:'fn:antenna',talk:'"Can you hear me now?" The wire cannot.'},
   {id:'battery',name:'Lantern battery',rect:[380,205,40,40],look:'A six-volt lantern battery. "Still kicks," says the tag. In Cyndal\'s handwriting. With a warning skull.',hand:'fn:battery',talk:'You hum at the battery. It hums back at six volts.'},
   {id:'books',name:'Radio handbook shelf',rect:[30,120,90,130],look:'Radio handbooks, a Farmer\'s Almanac, and one dinosaur book Loki says is "for research."',hand:'You leaf through "Radio for Boys, 1954." Cyndal has corrected it in pen.',talk:'You read aloud. Nobody asked.'}
  ],npcs:[{id:'cyndal',pos:[150,300]},{id:'loki',pos:[540,320]}],exits:[{rect:[0,330,640,30],to:'farm',at:[160,280],name:'Down the ladder (farm)'}]},
 meeting:{name:'Harmony — Town Meeting',bg:null,paint:'meeting',start:[320,330],walk:[[20,262],[620,262],[640,360],[0,360]],
  hotspots:[
   {id:'podium',name:'Podium',rect:[290,150,60,70],look:'The podium. Pete has been at it for forty minutes. The podium looks tired.',hand:'fn:debate',talk:'fn:debate'},
   {id:'urn',name:'Coffee urn',rect:[535,165,40,52],look:'The Grange Hall coffee urn. It has been "keeping warm" since before the grid died. It may be sentient.',hand:'fn:coffee',talk:'The urn gurgles. It knows things.'},
   {id:'plate',name:'Collection plate',rect:[40,60,60,80],look:'A map of Maine with Augusta circled in red, and a collection plate "FOR THE AUGUSTA TRIP." Two buttons and a gum wrapper.',hand:'fn:plate',talk:'"Augusta?" asks the map. Well, Pete wrote it on there.'}
  ],npcs:[{id:'pete',pos:[330,265]},{id:'mira',pos:[150,300]},{id:'hal',pos:[470,300]}],exits:[{rect:[0,330,640,30],to:'harmony',at:[290,262],name:'Back to Main Street'}]},
 bunkerOut:{name:"Jack Ready's Ridge",bg:null,paint:'bunkerOut',start:[320,340],walk:[[0,250],[640,250],[640,360],[0,360]],
  hotspots:[
   {id:'hatch',name:'Steel hatch',rect:[290,170,80,70],look:'A steel hatch in the hillside, riveted, painted forest green, and lightly decorated with buckshot dents.',hand:'fn:hatch',talk:'fn:intercom'},
   {id:'wires',name:'Tripwire line',rect:[60,270,550,20],look:'A tripwire strung with tin cans at shin height. Subtle as a moose in a phone booth. Which is the point.',hand:'fn:wires',talk:'You whisper to the tin cans. They jingle. Uh-oh.'},
   {id:'mat',name:'WELCOME mat',rect:[420,318,70,24],look:'A cheerful red WELCOME mat, right in the middle of nowhere. On a ridge. In Jack Ready\'s yard. Hmm.',hand:'fn:matStep',talk:'"Welcome," you say to the mat. The mat does not say it back. Suspicious.'},
   {id:'sign',name:'Sign',rect:[90,150,90,40],look:'"NO TRESPASSING. SURVIVORS WILL BE SHOT AGAIN." Jack Ready has a way with words. Mostly threats.',hand:'You straighten the sign. Jack would want it level. Threats should be level.',talk:'You read the sign aloud in your best Jack voice. It\'s not a good Jack voice.'},
   {id:'scope',name:'Periscope',rect:[240,100,24,80],look:'A periscope poking out of the hill. It swivels to follow you. Hi, Jack.',hand:'You wave at the periscope. It waves back. Somehow.',talk:'"Jack? It\'s Justin." The periscope considers this.'}
  ],npcs:[{id:'jackdog',pos:[200,300]},{id:'jack',pos:[400,265]}],exits:[bottomLeave("Leave Jack's ridge")]},
 bunkerIn:{name:"Jack Ready's Bunker",bg:null,paint:'bunkerIn',start:[320,330],walk:[[20,262],[620,262],[640,360],[0,360]],
  hotspots:[
   {id:'maps',name:'Survey maps table',rect:[240,180,170,60],look:'Old survey maps of the Kennebec valley, every bridge, ford and logging road. Jack\'s treasure.',hand:'fn:maps',talk:'fn:maps'},
   {id:'shortwave',name:'Shortwave set',rect:[440,108,100,72],look:'Jack\'s shortwave. Better than Cyndal\'s, which Jack will tell you about. At length.',hand:'fn:shortwave',talk:'fn:shortwave'},
   {id:'shelves',name:'Shelves of MREs',rect:[20,40,150,190],look:'MREs stacked to the ceiling. Best before 1998. "They don\'t go bad," says Jack. They do.',hand:'fn:mre',talk:'The MREs stare back. Beef Patty, Beef Patty, Mystery.'},
   {id:'button',name:'Red button',rect:[586,105,30,50],look:'A big red button under a label: DO NOT PRESS. It is the most pressable thing you have ever seen.',hand:'fn:button',talk:'"Don\'t make me press you." It doesn\'t blink.'},
   {id:'gen',name:'Generator',rect:[470,205,70,45],look:'A generator that coughs like a smoker in February. Jack\'s been meaning to fix it since 2011.',hand:'fn:generator',talk:'The generator coughs at you. Rude, but understandable.'},
   {id:'woodbox',name:'Woodbox',rect:[560,218,70,32],look:'An empty woodbox. Jack splits his own wood, slowly, while complaining.',hand:'fn:woodbox',talk:'"Firewood?" The woodbox: empty, judgmental.'}
  ],npcs:[{id:'jack',pos:[330,300]}],exits:[{rect:[0,330,640,30],to:'bunkerOut',at:[330,262],name:'Up the ladder (outside)'}]},
 river:{name:'Kennebec — Ferry Landing',bg:null,paint:'river',start:[330,320],walk:[[0,252],[640,252],[640,360],[0,360]],
  hotspots:[
   {id:'ferry',name:'Old cable ferry',rect:[250,205,160,45],look:'A flat cable ferry, half sunk at the landing. Missing planks, rotted rope, busted winch. Otherwise perfect.',hand:'fn:ferry',talk:'You promise the ferry a bright future. It sinks a little more.'},
   {id:'planks',name:'Driftwood planks',rect:[60,265,140,25],look:'Driftwood planks washed up in a heap. Heavy, wet, and full of splinters with ambition.',hand:'fn:planks',talk:'The planks are not much for conversation. Wood rarely is.'},
   {id:'winch',name:'Winch',rect:[428,228,34,28],look:'The ferry winch. The pawl is snapped. Without it the cable runs free and so does the ferry, downstream, forever.',hand:'fn:winch',talk:'"Wind up," you tell the winch. It stays down.'},
   {id:'water',name:'The Kennebec',rect:[0,160,640,40],look:'The Kennebec, black and fast, with ice rafts sliding by. Beautiful. Lethal. Very Maine.',hand:'fn:swim',talk:'You yell across the river. The river yells back, but that\'s just the wind.'},
   {id:'iceedge',name:'Shore ice',rect:[0,200,240,45],look:'Shore ice. It looks thick. Looks lie.',hand:'fn:iceWalk',talk:'You ask the ice how thick it is. It cracks a joke. Literally.'}
  ],npcs:[],exits:[bottomLeave('Leave the landing (world map)')]},
 bridge:{name:'Skowhegan — Kennebec Bridge',bg:null,paint:'bridge',start:[60,320],walk:[[0,250],[640,250],[640,360],[0,360]],
  hotspots:[
   {id:'lantern',name:'Lantern on the bridge',rect:[225,215,30,35],look:'A lantern on a post. "Somebody\'s always watching a bridge." Tonight it is two somebodies.',hand:'You could put it out. They would notice. Bosses notice lanterns.',talk:'The lantern flickers. It is on their side.'},
   {id:'girders',name:'Bridge girders',rect:[60,90,520,90],look:'Iron girders, iced and rusty. A climber could cross up there and never touch the deck.',hand:'fn:girders',talk:'The girders creak. Steel is a poor listener.'},
   {id:'under',name:'Ice under the bridge',rect:[0,190,640,48],look:'The river ice under the bridge. Darker in the middle. Darker is bad.',hand:'fn:underIce',talk:'You whisper to the ice. It whispers "no."'},
   {id:'siren',name:'Old flood siren',rect:[580,150,40,80],look:'An old flood-warning siren on a pole, wires dangling. Last used for the \'87 flood.',hand:'fn:siren',talk:'You go "WOOOO." It is not as good as the siren.'}
  ],npcs:[{id:'fur',pos:[300,290]},{id:'mask',pos:[400,285]}],exits:[{rect:[600,250,40,80],to:'marcel',at:[60,310],name:'Into Skowhegan (east)'},bottomLeave('Back down the road (world map)')]},
 marcel:{name:"Skowhegan — Marcel's Trading Store",bg:null,paint:'marcel',start:[320,330],walk:[[20,262],[620,262],[640,360],[0,360]],
  hotspots:[
   {id:'mcounter',name:'Counter',rect:[220,195,240,60],look:'Marcel\'s counter. He weighs everything twice and trusts the scale once.',hand:'fn:trade',talk:'fn:talkMarcel'},
   {id:'bounty',name:'Bounty board',rect:[500,70,110,90],look:'BOUNTIES: the Collector\'s lieutenants. Saw (gravel pit), Hole (Holeb cut), Mask (behind the mill). "Payment in coffee."',hand:'fn:bounty',talk:'You read the board out loud. Marcel shushes you.'},
   {id:'mshelf',name:'Shelves',rect:[30,60,140,190],look:'Real coffee, sugar, a jar of something labeled "maybe pickles."',hand:'"Hands off the maybe pickles," says Marcel. "They\'re for later. Or never."',talk:'The maybe pickles say nothing. Maybe.'}
  ],npcs:[{id:'marcel',pos:[340,250]}],exits:[{rect:[600,262,40,80],to:'camp_mill',at:[60,310],name:'Behind the mill (east)'},{rect:[0,262,30,80],to:'bridge',at:[580,310],name:'Back to the bridge (west)'},bottomLeave('Leave Skowhegan (world map)')]}
});
function campScene(v,name,lt){return{name,bg:null,paint:'camp_'+v,start:[60,330],walk:[[0,252],[640,252],[640,360],[0,360]],camp:v,
  hotspots:[
   {id:'cage',name:'Prisoner cage',rect:[60,190,90,60],look:'A cage of Forks folks, cold and quiet. They watch you like you might be the good news.',hand:'fn:cage',talk:'"Hang on," you whisper. "Harmony\'s got room." A woman nods hard.'},
   {id:'fire',name:'Campfire',rect:[290,262,60,30],look:'The raiders\' campfire. Warm. Inviting. Surrounded by raiders.',hand:'fn:campfire',talk:'You tell the fire a joke. It crackles. The raiders do not.'},
   {id:'chair',name:"Lieutenant's chair",rect:[470,215,110,40],look:'A throne made from a recliner, a tractor seat and hubris.',hand:'fn:chair',talk:'"Nice chair." It is nicer than your whole house.'},
   {id:'moon',name:'The moon',rect:[530,30,60,60],look:'The moon. Marcel said hit them on a dark night. This is a dark night. Mostly.',hand:'You cannot reach the moon. Do not try. You would.',talk:'You howl softly. A raider howls back, confused.'}
  ],npcs:[{id:lt,pos:[520,290]}],exits:[bottomLeave('Slip away (world map)')]};}
SCENES.camp_gravel=campScene('pit','Gravel Pit Camp (east of the farm)','saw');
SCENES.camp_holeb=campScene('holeb','Holeb Cut Camp','hole');
SCENES.camp_mill=campScene('mill','Behind the Mill, Skowhegan','mask2');
SCENES.camp_mill.exits.unshift({rect:[0,262,30,80],to:'marcel',at:[580,310],name:"Back to Marcel's"});
// Farm / Harmony hooks
SCENES.farm.hotspots.push({id:'loftwin',name:'Loft window (radio)',rect:[100,100,40,28],look:'The loft window. A copper wire runs out of it to a nail. Cyndal\'s radio is up there.',hand:'fn:goLoft',talk:'You yell up to the loft. Cyndal yells back "BUSY."'});
SCENES.harmony.hotspots.find(h=>h.id==='church').hand='fn:church';
SCENES.harmony.npcs.push({id:'collector',pos:[560,305]});
// ---------- NPCs ----------
Object.assign(NPCS,{
 jack:{name:'Jack Ready',hair:'#8a8a80',coat:'#4a5a3a',look:'Jack Ready. Camo, beard, a rifle he calls "Mother." "The strong endure, but the ready prosper."',talk:'fn:talkJack',hand:'fn:tradeJack'},
 jackdog:{name:"Jack's dog",hair:'#3a2a1a',coat:'#5a4028',small:true,look:'Jack\'s dog. Jack trusts this dog more than people. The dog has not decided about you.',talk:'You say "good dog." The dog says "we\'ll see."',hand:'fn:petDog'},
 marcel:{name:'Marcel Thibodeau',hair:'#2a1a10',coat:'#6a2a2a',look:'Marcel Thibodeau. Skowhegan trader. Knows every sled that comes up the river, and what was on it.',talk:'fn:talkMarcel',hand:'fn:trade'},
 fur:{name:'Fur',hair:'#4a3a2a',coat:'#7a5a3a',look:'Fur. A raider boss in seven coats, three of them still have the animal attached.',talk:'fn:bridgeBoss',hand:'fn:petFur'},
 mask:{name:'Mask',hair:'#ddd',coat:'#3a3a4a',look:'Mask. A hockey mask, a toll box, and a voice like a tax audit.',talk:'fn:bridgeBoss',hand:'fn:unmask'},
 saw:{name:'Saw',hair:'#222',coat:'#5a2a1a',look:'Saw, the Collector\'s lieutenant at the gravel pit. Carries a bucksaw. Named it. Won\'t say what.',talk:'fn:lieutenant',hand:'fn:lieutenant'},
 hole:{name:'Hole',hair:'#111',coat:'#3a3a2a',look:'Hole. Huge. Slow. Missing teeth, hence the name. Or the hole he digs for visitors.',talk:'fn:lieutenant',hand:'fn:lieutenant'},
 mask2:{name:'Mask',hair:'#ddd',coat:'#3a3a4a',look:'Mask again, now running the mill camp. Same mask. Probably. Who can tell.',talk:'fn:lieutenant',hand:'fn:unmask'},
 collector:{name:'The Collector',hair:'#111',coat:'#1a1a2a',look:'The Collector. Clean coat, gold ledger, polite smile. Twenty men behind him, none of them polite.',talk:'fn:collector',hand:'fn:collectorHit'}
});
const LT={saw:{camp:'gravel',flag:'harmony.ltGravel',hp:34,speed:.8,jab:5,heavy:9,pattern:[['jab','saws the air forward…'],['jab','saws the air forward…'],['heavy','raises the bucksaw high!'],['feint','grins and waits.']]},
 hole:{camp:'holeb',flag:'harmony.ltHoleb',hp:56,speed:1.4,jab:6,heavy:13,pattern:[['heavy','winds up like a falling tree!'],['jab','lumbers in, fist first…'],['heavy','winds up like a falling tree!']]},
 mask2:{camp:'mill',flag:'harmony.ltMill',hp:38,speed:1,jab:5,heavy:9,pattern:[['feint','twitches…'],['jab','lunges…'],['feint','twitches…'],['heavy','raises the stick HIGH!'],['jab','lunges…']]}};
NPC_SHOW.cyndal=n=>G().scene!=='loft'||act()>=2;
NPC_SHOW.jack=()=>act()>=3||!!qs('harmony.jack');
NPC_SHOW.fur=()=>!qs('harmony.bridge');NPC_SHOW.mask=()=>!qs('harmony.bridge');
NPC_SHOW.collector=()=>act()>=5&&!qs('harmony.collector');
['saw','hole','mask2'].forEach(k=>NPC_SHOW[k]=()=>!qs(LT[k].flag));
// ---------- Act 1 -> 2 progression, MAIN_TALK lines ----------
const MT={2:{sarah:'"Calm voice. Too calm. Folks on the radio these days sound tired. That one sounds like he\'s reading a grocery list."',loki:'"Cyndal let me hold the antenna. I\'m the antenna now."'},
 3:{sarah:'"Bring him something he can\'t make himself. Pie works on most men. Not Jack, but most men."'},4:{sarah:'"Bring back coffee if Marcel\'s got any. Real coffee. I\'ll owe you."',mira:'"Marcel knows every sled that comes up the river. If something\'s taking caravans, he\'s counted them."'},
 5:{mira:'"The folks they\'re holding are from the Forks. If you get them out, send them to Harmony. We\'ll find room."',cyndal:'"I can hear them on the radio at night. They talk about \'the Collector\' like he\'s the weather."'}};
const wrap=(name,who)=>{const o=ACT[name];ACT[name]=function(h){const a=act();if(a>=2&&MT[a]&&MT[a][who]&&!F('harmony.mt.'+a+who)){setF('harmony.mt.'+a+who,true);say(NPCS[who].name,MT[a][who]);return;}o(h);if(who==='sarah'&&qs('harmony.firstSnow')==='done'&&qs('harmony.raid'))advance(2,'The Signal');};};
wrap('talkSarah','sarah');wrap('talkLoki','loki');wrap('talkMira','mira');
const oCy=ACT.talkCyndal;ACT.talkCyndal=function(h){const a=act();if(a===2&&!qs('harmony.signal')){say('Cyndal','"There\'s something on 147.3. Same voice every hour. Augusta. Fuel, medicine, order. Come up to the loft and listen. It\'s buried in static, though. The antenna\'s a clothesline."');setQ('harmony.signal','asked');return;}if(a>=5&&MT[5].cyndal&&!F('harmony.mt.5cyndal')){setF('harmony.mt.5cyndal',true);say('Cyndal',MT[5].cyndal);return;}oCy(h);};
// ---------- ACT 2: The Signal ----------
ACT.goLoft=()=>loadScene('loft');
ACT.antenna=()=>{if(F('harmony.antenna')){msg('The antenna is up and proud. Possibly visible from space. Possibly from Augusta.');return;}
 const ok=(t,how)=>{setF('harmony.antenna',how);score('antenna',8);msg(t+' The static thins out. Try the radio.');};
 choose('Raise the Antenna','A clothesline is not an antenna. Get it up high.',[
  ['Climb the roof with the wire (Climbing)',()=>{if(check('climbing',35))ok('You go up the icy roof like a squirrel with a mortgage and tie the wire to the chimney.','climb');else{hurt(3);msg('You slide off the roof into a snowbank. Loki applauds. (-3 HP)');}}],
  ['Cut a spruce pole for a mast (Melee)',()=>{if(check('melee',35)){G().stamina=Math.max(0,G().stamina-25);ok('You drop a skinny spruce, limb it and lash the wire to the top. Twenty feet of mast. Very Woodsman.','mast');}else msg('The spruce wins. You will try again after you stop shaking.');}],
  ['Rewire it as a proper dipole (Electronics)',()=>{if(check('electronics',35))ok('You cut the wire in two, center-feed it, and measure by the handbook. A real dipole. Cyndal is visibly impressed, then pretends not to be.','dipole');else msg('You make something. It is more of a modern art piece.');}],
  ['Talk Loki into being the antenna (Speech)',()=>{if(check('speech',30))ok('"You\'re the antenna now, Loki." He holds the wire up on the woodpile like the Statue of Liberty. It works, scientifically baffling everyone.','loki');else say('Loki','"I\'m cold. Antennas get paid, right?"');}],
  ['Never mind',()=>{}]]);};
ACT.radioTune=()=>{if(act()<2&&!qs('harmony.signal')){msg('Cyndal\'s radio: static, a fiddle tune from Quebec, and somebody arguing about a snowmobile. Nothing important. Yet.');return;}
 if(!F('harmony.antenna')){msg('You turn the dial. Static, static, a faint calm voice... then static. The antenna is a clothesline. You need it up higher.');return;}
 tick(30);if(qs('harmony.signal')!=='heard'&&qs('harmony.signal')!=='debated'){setQ('harmony.signal','heard');score('signal',12);}
 say('Cyndal','"Listen." Static, then a calm voice: "Augusta has fuel. Augusta has medicine. Augusta has order. Come south." It loops. "Same words every hour. Dad says nobody talks that calm anymore." ...Hey. That\'s you. You\'re Dad.');
 msg('Word gets around. Pete has called a town meeting at the church about "the Augusta trip."');};
ACT.radioBack=()=>{if(cls()==='tinker'||check('electronics',60)){score('radioBack',3);msg('You spot the 350 volt plate lead and leave it alone, like a sane person. You tighten a loose tube socket instead. The hum gets sweeter.');return;}
 choose('Back of the Radio','Something in there is loose. Poke it?',[['Poke it',()=>die('plate')],['Leave it to Cyndal',()=>msg('Wise. Cyndal says "Thank you" in a voice that means "finally."')]]);};
ACT.battery=()=>choose('Lantern Battery','Test if it still kicks?',[['Lick the terminals',()=>die('battery')],['Use the voltmeter like a grown-up',()=>{score('voltmeter',2);msg('Six point one volts. It still kicks. Cyndal nods approvingly.');}]]);
ACT.church=()=>{if(act()>=2&&qs('harmony.signal')){loadScene('meeting');if(qs('harmony.signal')!=='debated')msg('The church hall is packed. Pete is at the podium waving a map of Maine with Augusta circled in red.');}else msg('You can\'t reach the bell rope from here, which is best for everyone.');};
ACT.coffee=()=>choose('Coffee Urn','Have a cup?',[['Drink deep',()=>die('coffee')],['Sniff it',()=>msg('Your eyebrows leave without you. Good call not drinking it.')]]);
ACT.plate=()=>{if(F('harmony.plate')){msg('The plate is empty. Pete is still counting it.');return;}setF('harmony.plate',1);if(check('sneak',30)){give('junk');msg('You "borrow" the gum wrapper and a button from the Augusta fund. Nobody notices. You feel bad, briefly.');}else msg('Mira catches your eye. You put a button IN instead. Generosity: forced.');};
ACT.debate=ACT.talkPete2=()=>{const s=qs('harmony.signal');if(s==='debated'){say('Pete',F('harmony.signalVerdict')==='trap'?'"Fine. Fine! Nobody goes south. But I\'m keeping the map."':'"Some of us are still going. Somebody has to." Pete\'s cousin Earl is packing.');return;}
 if(s!=='heard'){say('Pete','"Hearing\'s not till the signal\'s confirmed. Go listen with your girl."');return;}
 const win=(t,how)=>{setQ('harmony.signal','debated');setF('harmony.signalVerdict','trap');setF('harmony.signalHow',how);score('debate',15);msg(t+' The town votes: nobody goes to Augusta. Mira says Jack Ready up on the ridge has been listening to that signal longer than anybody.');ACT.act2Done();};
 const lose=()=>{setQ('harmony.signal','debated');setF('harmony.signalVerdict','split');score('debateTry',5);msg('The room splits. Earl and two others pack for Augusta anyway. Mira takes your arm: "Talk to Jack Ready. He\'ll know." ');ACT.act2Done();};
 choose('Town Meeting: The Augusta Trip','Pete: "Fuel! Medicine! ORDER! Who\'s with me?" Half the room looks hungry enough to go.',[
  ['"Nobody talks that calm anymore." (Speech)',()=>check('speech',40)?win('You talk about tired voices, and how this one isn\'t. The room goes quiet.','speech'):lose()],
  ['Play it back: same click every hour, it\'s a tape (Electronics)',()=>check('electronics',30)?win('You point out the tape hiss and the click at the loop. A recording. Nobody is there.','tech'):lose()],
  ['"Ninety miles in snow. I\'ll walk you to the town line." (Trail)',()=>check('trail',30)?win('You describe ninety miles of November in vivid, frostbitten detail. Pete sits down.','woods'):lose()],
  ['"I\'ve seen caravan carts at raider camps." (Sneak)',()=>check('sneak',35)?win('You describe the empty carts, the stripped wheels, the same paint as the Augusta flyers. The room goes cold.','scrounge'):lose()],
  ['Buy Pete\'s map so he can\'t go (Barter, 3 credit)',()=>{if(G().credit>=3){G().credit-=3;useStat('barter');win('Pete sells you the only map. Without it he can\'t find Augusta, or his boots.','barter');}else say('Pete','"Three credits or no deal."');}],
  ['"Let\'s go! I\'ll lead the way!"',()=>die('augusta')]]);};
ACT.act2Done=()=>{advance(3,"Jack Ready's Bunker");startQuestMarker(Q('harmony.jack').marker);if(!qs('harmony.jack'))setQ('harmony.jack','marker');};
// ---------- ACT 3: Jack Ready's Bunker ----------
const intoBunker=t=>{setF('harmony.pastWires',true);if(!qs('harmony.jack')||qs('harmony.jack')==='marker')setQ('harmony.jack','met');addTrust('wires',5,'you got past his wires like you meant it');msg(t);};
ACT.wires=()=>{if(F('harmony.pastWires')){msg('You step over the cans you already know about. Jack nods from the hatch.');return;}
 choose('Tin-can Tripwires','A line of cans at shin height between you and the hatch. Jack is watching through the periscope.',[
  ['Step through quiet (Sneak)',()=>check('sneak',35)?intoBunker('You thread the line like a cat in a china shop, a very careful cat.'):ACT.jangle()],
  ['Read the ground and go around (Trail)',()=>check('trail',35)?intoBunker('Deer path, old boot prints, the one dry rock. You walk around the whole thing.'):ACT.jangle()],
  ['Disarm the line (Electronics)',()=>check('electronics',30)?intoBunker('There is a tiny bell circuit wired to the cans. You bridge it. Silence. Jack is annoyed and impressed.'):ACT.jangle()],
  ['Call out and wait to be invited (Speech)',()=>check('speech',30)?intoBunker('"Jack! Justin Thompson, Cambridge Road. Sarah sends her best." The hatch creaks. "Step where I step, bub."'):ACT.jangle()],
  ['Just walk through',()=>ACT.jangle()],['Back off',()=>{}]]);};
ACT.jangle=()=>{hurt(4);setF('harmony.jangled',(+F('harmony.jangled')||0)+1);msg('CLANK CLANK CLANK. A load of rock salt whistles past and some of it doesn\'t. "That\'s a warning, bub." (-4 HP)');};
ACT.matStep=()=>choose('The WELCOME Mat','It says WELCOME. Wipe your boots?',[['Wipe your boots on it',()=>die('mat')],['Walk around it',()=>{score('mat',3);msg('You walk around the mat. Somewhere a pressure plate sighs, disappointed.');}]]);
ACT.petDog=()=>{if(F('harmony.jt.dog')){msg('Jack\'s dog leans on your leg. That\'s practically a hug.');return;}const food=['meat','jerky'].find(i=>has(i));if(food){take(food);addTrust('dog',5,'his dog likes you');msg(`You hold out the ${H.ITEMS[food].name}. The dog takes it gently, then sits on your boot. You are now furniture.`);}else msg('The dog sniffs your empty hand and looks at you like you showed up to a potluck with nothing.');};
ACT.intercom=()=>{msg('You knock on the hatch. A speaker crackles: "Who sent you?" "Sarah." "...Sarah\'s all right."');if(F('harmony.pastWires'))setQ('harmony.jack','met');};
ACT.hatch=()=>{if(!F('harmony.pastWires')){msg('Between you and the hatch: a line of jangling tin cans and Jack\'s opinion of visitors. Deal with the wires first.');return;}if(trust()<10&&!F('harmony.jt.gift')&&!F('harmony.jt.dog')){say('Jack Ready','"You ain\'t family. Not yet. Bring something I can\'t make myself. And be nice to my dog."');return;}if(qs('harmony.jack')==='met')setQ('harmony.jack','inside');score('inside',5);loadScene('bunkerIn');};
ACT.talkJack=()=>{const t=trust();if(!qs('harmony.jack')||qs('harmony.jack')==='marker'){setQ('harmony.jack','met');}
 if(F('harmony.jackMaps')){say('Jack Ready','"That broadcast\'s bait, plain. Marcel down to Skowhegan counts caravans. Go ask him who\'s not coming back."');return;}
 const opts=[];['cider','apple','meat'].forEach(i=>{if(has(i)&&!F('harmony.jt.gift'))opts.push([`Give ${H.ITEMS[i].name}`,()=>{take(i);addTrust('gift',5,'a gift he can\'t make himself');say('Jack Ready',i==='cider'?'"Sarah\'s cider. Well. Don\'t tell her I smiled."':'"Huh. Thank you kindly."');}]);});
 opts.push(['"What about the Augusta signal?"',()=>{addTrust('ask',3,'you asked instead of told');say('Jack Ready','"I had a cousin went south on a radio promise in \'09. Different radio, same promise. Maps cost trust, and trust costs time. Trade with me. Do me a favor or two."');}]);
 opts.push(['Trade',()=>ACT.tradeJack()]);opts.push(['Leave',()=>{}]);
 choose('Jack Ready',`"The strong endure, but the ready prosper." (Trust ${t}/30)`,opts);};
ACT.tradeJack=()=>{if(F('harmony.jt.trade')){ACT.trade();return;}if(has('junk')>=2||has('hide')){if(has('hide'))take('hide');else take('junk',2);give('bandage');addTrust('trade',4,'a fair trade');say('Jack Ready','"Fair\'s fair." He hands you a bandage in a coffee can.');}else msg('Jack wants hide or two pieces of junk. Junk is a currency up here.');};
ACT.generator=()=>{if(F('harmony.jt.favor')){msg('The generator purrs. Jack keeps patting it.');return;}if(check('mechanics',35)||check('electronics',45)){take('junk');addTrust('favor',12,'you fixed his generator');score('gen',8);msg('Fuel filter full of gunk, a fouled plug, a loose ground. Fifteen minutes and it purrs like Jack\'s dog. Jack says "Huh." That\'s a lot for Jack.');}else{hurt(1);msg('You yank the cord. It yanks back. (-1 HP)');}};
ACT.woodbox=()=>{if(F('harmony.jt.favor')){msg('The woodbox is full. Jack keeps admiring it like a painting.');return;}if(check('melee',30)){G().stamina=Math.max(0,G().stamina-30);addTrust('favor',12,'you split his whole woodpile');score('woodbox',8);msg('You split Jack\'s wood until your arms are rubber. He watches the whole time, says nothing, then says "you\'ll do."');}else msg('You split one log and pull something. Maybe later.');};
ACT.shortwave=()=>{if(!F('harmony.jt.radio')&&(check('electronics',35)||check('speech',35))){addTrust('radio',8,'you talked radio with him');msg('You and Jack log the Augusta broadcast. Same tape hiss, same click, every hour. "Nobody\'s there," says Jack. "Just a voice and a hook."');return;}msg('Jack\'s shortwave: weather from Quebec, a preacher in Bangor, and the Augusta loop. "Augusta has order." Jack snorts.');};
ACT.mre=()=>choose('MRE','"Beef Patty, 1998." Eat one?',[['Eat it',()=>die('mre')],['Put it back',()=>msg('Wise. The MRE seems to relax.')]]);
ACT.button=()=>choose('DO NOT PRESS','The button wants it. You want it. Everybody wants it.',[['Press it',()=>die('button')],['Do not press it',()=>{score('button',4);msg('You do not press it. The hardest thing you have done all winter.');}]]);
ACT.maps=()=>{if(F('harmony.jackMaps')){msg('The maps of the Kennebec: every bridge, ford and logging road. The Skowhegan bridge is circled. So is Marcel\'s store.');return;}const t=trust();
 if(t<30){say('Jack Ready',`"You ain't there yet, bub." (Jack's trust: ${t}/30. Gifts, his dog, a fair trade, a favor, talk radio with him.)`);return;}
 setF('harmony.jackMaps',true);setQ('harmony.jack','maps');score('maps',15);say('Jack Ready','He unrolls the survey maps. "That broadcast? It\'s a trap. Nobody\'s come back up the Kennebec who answered it. Marcel\'s in Skowhegan. Bridge is the only way across, and somebody\'s always watching it."');
 advance(4,'The Kennebec');startQuestMarker(Q('harmony.marcel').marker);setQ('harmony.marcel','go');startQuestMarker(Q('harmony.ferry').marker);};
// ---------- ACT 4: The Kennebec (+ Kennebec Crossing / q10 ferry) ----------
const ferryParts=()=>['harmony.ferryPlanks','harmony.ferryRope','harmony.ferryWinch'].filter(k=>F(k)).length;
ACT.ferry=()=>{if(qs('harmony.ferry')==='fixed'){msg('The ferry runs again. Pole across here to reach the north woods, where they say The Grok walks. (That crossing happens in the main game.)');return;}
 if(!qs('harmony.ferry'))setQ('harmony.ferry','given');const n=ferryParts();
 if(F('harmony.ferryPlanks')&&!F('harmony.ferryRope')&&has('cloth')>=2){take('cloth',2);setF('harmony.ferryRope',true);msg('You twist your two cloth strips into a rope. A sad rope. It\'ll hold. Probably.');}
 if(ferryParts()===3){setQ('harmony.ferry','fixed');score('ferry',15);msg('Planks down, rope spliced, winch pawled. The old ferry floats level and the cable sings. Kennebec Crossing: done.');return;}
 msg(`The ferry needs planks${F('harmony.ferryPlanks')?' ✓':''}, rope${F('harmony.ferryRope')?' ✓':' (2 cloth twists into rope)'}, and a winch part${F('harmony.ferryWinch')?' ✓':''}.`);};
ACT.planks=()=>{if(F('harmony.ferryPlanks')){msg('The good planks are on the ferry. The rest are splinters with dreams.');return;}if(check('melee',25)||G().stamina>=40){G().stamina=Math.max(0,G().stamina-35);useStat('melee',2);setF('harmony.ferryPlanks',true);setQ('harmony.ferry','given');msg('You haul six waterlogged planks onto the ferry deck and spike them down. Your back will remember this.');}else msg('Too winded. Eat something, catch your breath.');};
ACT.winch=()=>{if(F('harmony.ferryWinch')){msg('The winch clicks and holds. Lovely sound.');return;}
 choose('Busted Winch','The pawl is snapped clean. Without it the ferry goes to the ocean.',[
  ['Make a new pawl from junk (Tinkering)',()=>{if(has('junk')&&check('mechanics',30)){take('junk');setF('harmony.ferryWinch',true);score('winch',5);msg('A bolt, a file and some swearing: one new pawl.');}else msg('You need junk and a Tinker\'s hands.');}],
  ['Jam it with a hardwood wedge (Melee)',()=>{if(check('melee',35)){setF('harmony.ferryWinch',true);msg('You whittle an oak wedge and hammer it home. Crude. Works.');}else msg('The wedge splits. Try again.');}],
  ['Pick the old padlocked spare-parts box (Lockpick)',()=>{if(check('lock',35)){setF('harmony.ferryWinch',true);msg('Click. Inside the box: a spare pawl, wrapped in an oily rag, waiting since 1979.');}else msg('The padlock is rusted into a single shape.');}],
  ['Never mind',()=>{}]]);};
ACT.swim=()=>choose('The Kennebec','Swim across?',[['Dive in',()=>die('swim')],['Dip a toe',()=>msg('Your toe files for divorce. You keep your boots on.')]]);
ACT.iceWalk=()=>choose('Shore Ice','Walk out on the ice?',[['Stroll out to the middle',()=>die('ice')],['Test it with a stick',()=>{score('iceStick',2);msg('The stick goes right through. So would you. Good stick.');}]]);
// bridge bosses
const crossed=(how,t)=>{setQ('harmony.bridge',how);score('bridge',15);msg(t+' The way east into Skowhegan is open.');};
const FUR={name:'Fur',hp:48,speed:1.15,jab:5,heavy:11,intro:'Fur shrugs off three of his seven coats. Mask steps back to "supervise."',death:'boss',pattern:[['heavy','rears up like a bear!'],['jab','shoulders forward…'],['heavy','rears up like a bear!'],['feint','growls and waits.']],winText:'Fur goes down like a laundry pile. Mask grabs the toll box and runs for the mill.',onWin(){setQ('harmony.bridge','fur-down');score('bridge',15);give('hide');}};
ACT.bridgeBoss=()=>{if(qs('harmony.bridge')){msg('The bridge is clear.');return;}
 choose('The Kennebec Bridge','Fur and Mask hold the bridge. "Toll," says Mask. "Or Fur collects it from you."',[
  ['Fight Fur',()=>startFight(FUR)],
  ['Pay the toll (2 jerky or a medkit)',()=>{if(take('jerky',2)||take('medkit'))crossed('bribed','Mask counts it twice, sniffs it once, and waves you through. "Pleasure doing crime with you."');else say('Mask','"That\'s not a toll. That\'s an insult."');}],
  ['"Marcel\'s expecting me. So is the Collector." (Speech)',()=>check('speech',40)?crossed('talked','Mask hesitates. Nobody wants to be the one who stopped the Collector\'s guest. They step aside.'):startFight(FUR)],
  ['Haggle the toll down to one jerky (Barter)',()=>{if(has('jerky')&&check('barter',35)){take('jerky');crossed('bribed','"One jerky. ONE. You\'re a monster." Mask lets you through anyway.');}else startFight(FUR);}],
  ['Back off',()=>{}]]);};
ACT.girders=()=>{if(qs('harmony.bridge')){msg('You don\'t need the girders anymore. You climb one anyway, for fun. It is not fun.');return;}check('climbing',40)?crossed('climbed','You go hand over hand along the iced girders above Fur and Mask, who never look up. Nobody ever looks up.'):(hurt(4),msg('You slip and land in a snowbank right behind Fur. He doesn\'t notice. You retreat with dignity and a bruise. (-4 HP)'));};
ACT.underIce=()=>choose('Under the Bridge','Cross on the ice in the bridge\'s shadow?',[['Creep across in the shadow (Sneak)',()=>check('sneak',40)?crossed('snuck','You slide across in the bridge\'s shadow. The ice groans but holds. Fur sneezes; you freeze; nobody looks.'):startFight(FUR)],['Run straight down the dark middle',()=>die('ice')],['Back off',()=>{}]]);
ACT.siren=()=>{if(qs('harmony.bridge'))return msg('The siren is quiet. It has done its part.');if(check('electronics',35)){crossed('siren','You splice the siren to a car battery. WOOOOOO. Fur and Mask, convinced the \'87 flood is back, run for high ground.');}else msg('You twist two wires. Nothing. Then a spark. Then nothing, more confidently.');};
ACT.petFur=()=>choose('Fur','He looks so soft.',[['Pet him',()=>die('fur')],['Don\'t',()=>msg('Good instincts.')]]);
ACT.unmask=()=>choose('Mask','Pull off the mask?',[['Yank it',()=>die('mask')],['Leave it',()=>msg('Some mysteries are load-bearing.')]]);
ACT.talkMarcel=()=>{if(act()<4&&!qs('harmony.marcel')){say('Marcel Thibodeau','"Bonjour. Buying or selling? I don\'t do browsing."');return;}
 if(qs('harmony.marcel')!=='met'&&qs('harmony.marcel')!=='briefed'){setQ('harmony.marcel','met');score('marcel',12);say('Marcel Thibodeau','He lowers his voice. "Caravans that answer that signal never come back. Not one. There\'s a man they call the Collector. Every raider on the river works for him now."');advance(5,'The Collector');return;}
 if(qs('harmony.marcel')==='met'){setQ('harmony.marcel','briefed');['gravel','holeb','mill'].forEach(k=>startQuestMarker(Q('harmony.collector').markers[k]));say('Marcel Thibodeau','"The raiders answer to the Collector. He\'s got lieutenants at camps up and down the river. Three camps. Gravel pit east of your place, the Holeb cut, and behind the mill here. Hit them on a dark night. A full moon\'ll get you shot."');return;}
 const n=ltDown();say('Marcel Thibodeau',n>=3?'"All three? Then you know where the depot is. North, past the Holeb woods. Past the Grok. Dieu nous aide."':`"Lieutenants down: ${n} of 3. The bounty\'s good for coffee. Real coffee."`);};
ACT.bounty=()=>{msg('BOUNTIES (paid in coffee): SAW — gravel pit east of Cambridge Road. HOLE — Holeb cut. MASK — behind the mill. Bring proof. Ears not accepted.');};
// ---------- ACT 5: The Collector ----------
const ltDown=()=>['harmony.ltGravel','harmony.ltHoleb','harmony.ltMill'].filter(k=>qs(k)).length;
function ltResolve(id,how,t){const L=LT[id];setQ(L.flag,how);score('lt'+id,15);msg(t);const n=ltDown();toast(`Lieutenants down: ${n}/3`);
 if(n>=3){score('act5',10);advance(6,"The Grok's Woods");startQuestMarker({id:'harmony-depot',target:'north',label:"Collector's depot: north past Holeb"});startQuestMarker({id:'harmony-grok',target:'north',label:"The Grok's woods: walk the ridge"});say('Narrator','The last lieutenant talks: the supply depot is north, past the Holeb woods. Past the Grok. (Act 6 continues in the main game.)');}}
ACT.lieutenant=(h)=>{const id=h.id||h,L=LT[id];if(!L)return;if(qs(L.flag)){msg('That lieutenant is out of the Collector\'s business.');return;}
 const nm=NPCS[id].name;const fightCfg={name:nm,hp:L.hp,speed:L.speed,jab:L.jab,heavy:L.heavy,pattern:L.pattern,death:'boss',winText:`${nm} goes down in the snow. The camp breaks and scatters.`,onWin(){ltResolve(id,'down',`${nm} is down. The Collector is short a lieutenant.`);give('junk');}};
 const opts=[['Fight '+nm,()=>startFight(fightCfg)],
  ['Wait till he sleeps, tie his boots together (Sneak)',()=>check('sneak',40)?ltResolve(id,'down',`You find ${nm} asleep by the sledges and truss him like a Thanksgiving turkey. Marcel will collect the bounty.`):(msg(`${nm} wakes up. Of course he does.`),startFight(fightCfg))],
  ['"The Collector writes you in his ledger too." (Speech)',()=>check('speech',45)?ltResolve(id,'gone',`${nm} thinks about the ledger. He walks off into the dark and doesn\'t come back. Lieutenant: retired.`):startFight(fightCfg)],
  ['Rig a flare trap in his path (Electronics)',()=>{if(has('junk')&&check('electronics',35)){take('junk');ltResolve(id,'down',`The flare goes off in ${nm}\'s face. Blinded, he walks into the cage door and locks himself in. The prisoners laugh first.`);}else msg('You need junk and a steady hand for that.');}],
  ['Drop a dead spruce across his tent (Melee)',()=>check('melee',40)?ltResolve(id,'down',`TIMBER. The spruce pins ${nm} in his tent. He is fine, mostly, and very much out of the war.`):startFight(fightCfg)],
  ['Back off',()=>{}]];
 if(G().companions.includes('goose'))opts.splice(1,0,['Send Goose to bark and spook the camp',()=>{msg('Goose barks like ten dogs. Raiders scatter, but '+nm+' holds his ground!');startFight({...fightCfg,hp:Math.round(L.hp*.6)});}]);
 choose(nm,`${nm}, the Collector\'s lieutenant, by the fire. Dark night. Marcel said get in, cut the ropes, find the man in charge.`,opts);};
ACT.cage=()=>{const c=G().scene;if(F('harmony.freed.'+c)){msg('The cage is empty. The Forks folks are on the road to Harmony.');return;}
 const free=t=>{setF('harmony.freed.'+c,true);setF('harmony.prisoners',(+F('harmony.prisoners')||0)+2);score('free'+c,8);msg(t+' Two Forks folks slip off toward Harmony. Mira will find them room.');};
 choose('Prisoner Cage','A padlocked cage.',[['Pick the padlock (Lockpick)',()=>check('lock',35)?free('Click.'):msg('The lock is stubborn. So are you. Not stubborn enough, yet.')],['Pry the door (Melee)',()=>check('melee',40)?free('The hinge pops with a crack you are sure the whole camp heard. It did not.'):(hurt(2),msg('You pinch your hand in the door. (-2 HP)'))],['Bribe the guard (1 jerky)',()=>{if(take('jerky'))free('The guard takes the jerky and finds something interesting to look at in the other direction.');else msg('No jerky, no bribe.');}],['Back off',()=>{}]]);};
ACT.campfire=()=>choose('Campfire','Warm your hands?',[['Stroll up and warm your hands',()=>die('campfire')],['Stay in the dark',()=>msg('You stay in the dark, cold and alive. A good trade.')]]);
ACT.chair=()=>choose("Lieutenant's Chair",'It looks so comfortable.',[['Sit in it',()=>die('chair')],['Steal the cushion (Sneak)',()=>{if(check('sneak',35)){give('cloth');score('cushion',2);msg('You steal the cushion. Pure cloth. Pure spite.');}else msg('The chair creaks. You back away.');}]]);
ACT.collector=()=>{if(qs('harmony.collector')){return;}const done=(how,t)=>{setQ('harmony.collector',how);score('collector',10);msg(t);};
 choose('The Collector','A clean coat, a gold ledger, twenty men. "Harmony is behind on its tithe. Food, fuel, and a few strong backs. I collect."',[
  ['Stall him with town paperwork (Speech)',()=>check('speech',40)?done('stalled','You produce minutes from the 1974 Harmony town meeting. He reads all of it. He leaves to "consult his ledger." Harmony buys a week.'):done('paid','He smiles and takes two sacks of the town\'s apples. "Next time, a back or two."')],
  ['Pay him in junk and call it a tithe (Barter)',()=>{if(has('junk')>=2&&check('barter',35)){take('junk',2);done('fooled','He weighs the junk, decides it\'s "salvage-grade," and writes Harmony down as paid. Somewhere a ledger is very wrong.');}else done('paid','He sees through it and takes the Grange Hall\'s flour. People will remember.');}],
  ['Hide the strong backs in the church cellar (Sneak)',()=>check('sneak',35)?done('hid','When his men count Harmony, they count old folks and Pete. The Collector leaves unimpressed.'):done('paid','His men find the cellar. Earl goes with them. Harmony remembers.')],
  ['Hit him',()=>die('collector')],
  ['Just listen',()=>done('listened','He tips his hat. "I always collect." He rides on. He will be back for the farm.')]]);};
ACT.collectorHit=()=>choose('The Collector','Take a swing at him?',[['Swing',()=>die('collector')],['Think better of it',()=>msg('You think better of it. Twenty men think better of you.')]]);
const oPete=ACT.talkPete;ACT.talkPete=h=>G().scene==='meeting'?ACT.debate():oPete(h);
// standalone world map flavor
Object.assign(H.WORLD_MSG,{bunker:' Jack Ready\'s ridge. Tin cans glint at shin height.',kennebec:' The ferry landing on the Kennebec.',skow:' The Skowhegan bridge, lantern lit.',raiders:' A raider camp in the old gravel pit. Fire, cages, and a lieutenant named Saw.',north:' The Holeb cut. Raider camp in the spruce.'});
};
