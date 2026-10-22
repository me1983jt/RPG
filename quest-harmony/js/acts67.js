// Acts 6-7 (v13 MAIN_ACTS 6 "The Grok's Woods", 7 "Choices") + quests11 grok / wolves. Chains onto ACTS_EXT.
Object.assign(window.ENTRY,{grokwoods:'grokwoods',depot:'depot'});
(function(){const prev=window.ACTS_EXT;window.ACTS_EXT=function(H){prev(H);
const {ACT,DEATH,PAINT,NPC_SHOW,SCENES,NPCS,msg,say,choose,check,score,setQ,qs,give,take,has,die,hurt,loadScene,startFight,startQuestMarker,useStat,tick,toast,act,blob,grad,pine,W}=H;
const G=()=>H.G(),F=k=>G().flags[k],setF=(k,v)=>{G().flags[k]=v;H.save();},cls=()=>G().cls,goose=()=>G().companions.includes('goose');
function advance(n,title){if((G().localAct||1)<n){G().localAct=n;setF('harmony.act',n);toast(`ACT ${n}: ${title}`);}}
// ---- painters ----
Object.assign(PAINT,{
 grokwoods(c,r){c.fillStyle=grad(c,0,250,['#a8b4c4','#dcdcd8']);c.fillRect(0,0,W,250);for(let i=0;i<18;i++)pine(c,i*38+r()*12,175+r()*20,1.1,['#26362a','#2e4032'][i%2]);
  c.fillStyle='#eef2f4';for(let i=0;i<18;i++)blob(c,i*38,110+r()*60,8,3,'rgba(240,244,248,.8)');c.fillStyle=grad(c,190,250,['#7a8a90','#5a6a70']);c.fillRect(0,195,W,50);
  c.fillStyle='#6a4a2a';c.fillRect(120,205,130,10);c.fillStyle=grad(c,245,360,['#e8ecee','#c8ccd0']);c.fillRect(0,245,W,115);
  c.fillStyle='#8a6a48';c.fillRect(470,130,14,120);c.fillStyle='#d8c8a8';c.fillRect(472,150,10,60);c.fillStyle='#5a4a3a';for(let i=0;i<6;i++)c.fillRect(30+i*70,300+(i%2)*14,16,8);
  c.fillStyle='#4a3a2a';for(let i=0;i<5;i++){c.save();c.translate(540+i*14,250-i*6);c.rotate(-.5+i*.2);c.fillRect(-40,-4,80,8);c.restore();}},
 depot(c,r){c.fillStyle=grad(c,0,250,['#141a28','#2a3040']);c.fillRect(0,0,W,250);for(let i=0;i<14;i++)pine(c,i*48,200,1,'#121a14');c.fillStyle='#3a3630';c.fillRect(140,70,360,170);c.fillStyle='#2a2622';c.beginPath();c.moveTo(130,70);c.lineTo(320,30);c.lineTo(510,70);c.fill();
  c.fillStyle='#e0a040';c.fillRect(300,150,40,90);c.fillStyle=grad(c,240,360,['#4a443a','#2a261e']);c.fillRect(0,240,W,120);
  for(let i=0;i<6;i++){c.fillStyle=['#7a2a1a','#2a4a6a','#5a5a2a'][i%3];c.fillRect(40+i*26,200-(i%2)*30,22,40);}c.fillStyle='#8a6a3a';for(let i=0;i<4;i++)c.fillRect(470+i*36,205-(i%2)*24,32,32);c.fillStyle='#d8c890';c.fillRect(360,215,40,22);},
 kitchen(c,r){c.fillStyle=grad(c,0,270,['#4a2e1a','#6a4628']);c.fillRect(0,0,W,270);c.fillStyle='rgba(0,0,0,.2)';for(let x=0;x<W;x+=30)c.fillRect(x,0,3,270);
  c.fillStyle='#2a2a2a';c.fillRect(470,120,90,110);c.fillStyle='#ff9040';c.fillRect(490,180,50,22);c.fillStyle='#3a3a3a';c.fillRect(505,20,20,100);blob(c,515,190,70,50,'rgba(255,150,60,.15)');
  c.fillStyle='#1a2a40';c.fillRect(80,50,90,70);c.fillStyle='#e8e8f0';for(let i=0;i<8;i++)c.fillRect(85+i*11,58+(i*7)%50,2,2);
  c.fillStyle=grad(c,250,360,['#5a3e26','#3a2818']);c.fillRect(0,250,W,110);c.fillStyle='#7a5432';c.fillRect(200,200,240,50);c.fillStyle='#5a3a22';c.fillRect(210,250,10,30);c.fillRect(420,250,10,30);
  c.fillStyle='#ffd070';blob(c,320,190,8,10,'#ffd070');blob(c,320,180,60,50,'rgba(255,210,120,.18)');c.fillStyle='#e8dcb0';c.fillRect(250,205,60,10);c.fillStyle='#a05020';c.fillRect(350,198,16,14);}
});
// ---- deaths ----
Object.assign(DEATH,{
 flowage:['It Hunts the Bottom','Jack said walk the ridge, not the bottom. You walk the bottom. The Grok, true to Jack\'s word, hunts it.'],
 grokhug:['Big Hug','You hug the Grok. It hugs back. Grok hugs are rated for spruce trees, not farmers.'],
 grokpoke:['Is It Asleep?','You poke the Grok with a stick to see if it\'s asleep. It was. Was.'],
 grokfight:['Grokked','The Grok is slow. It does not stop. It hits like a skidder. You learn all three facts in that order.'],
 match:['Light Reading','You strike a match to read the Collector\'s ledger. Next to forty barrels of fuel. The ledger survives. You are listed in it, under "fireworks."'],
 ether:['Sweet Dreams','The crate says MEDICINE. You sniff it. It is ether. You sleep for a very, very long time.'],
 calmdown:['Two Words','You tell Sarah to "calm down." The look she gives you is the last thing you ever see. Cyndal writes it in the family history as a cautionary tale.'],
 stove:['Heavy Lifting','You try to carry the wood stove north. All four hundred pounds of cast iron. It wins. It always wins.'],
 contract:['Fine Print','You sign the Collector\'s deal without reading it. Page nine says "and the farmer." He collects.']
});
// ---- scenes ----
const leaveB=n=>({rect:[100,330,440,30],leave:'worldmap',name:n});
Object.assign(SCENES,{
 grokwoods:{name:"The Grok's Woods (north of the Kennebec)",bg:null,paint:'grokwoods',start:[60,330],walk:[[0,252],[640,252],[640,360],[0,360]],
  hotspots:[
   {id:'ridge',name:'Ridge path',rect:[0,100,640,40],look:'The ridge. Jack said walk the ridge, not the bottom. Jack has never been wrong about anything that could eat you.',hand:'fn:ridge',talk:'"Ridge," you say, respectfully. It is a good ridge.'},
   {id:'flowage',name:'Beaver flowage (the bottom)',rect:[0,195,460,48],look:'The second beaver flowage. Flat, quiet, and the bottom of everything. "It hunts the bottom," said Jack.',hand:'fn:flowage',talk:'The beavers are not taking questions.'},
   {id:'scrape',name:'Scraped spruce',rect:[466,128,22,122],look:'A spruce scraped bark-bare eight feet up. Long grooves, and a smell like a wet dog the size of a barn.',hand:'fn:scrape',talk:'"Who did this?" The spruce, traumatized, says nothing.'},
   {id:'tracks',name:'Huge tracks',rect:[20,290,440,40],look:'Tracks in the snow, each one longer than your boot. Something heavy went through here, slow.',hand:'fn:tracks',talk:'You ask the tracks where they are going. North. Slowly. Forever.'},
   {id:'blowdown',name:'Blowdown',rect:[520,215,110,45],look:'A blowdown of tangled spruce. Something huge is breathing under it. Something huge is snoring.',hand:'fn:grok',talk:'fn:grok'},
   {id:'wolfsign',name:'Wolf sign',rect:[260,330,100,25],look:'Wolf tracks, five or six traveling together. Sarah\'s missing hens send their regards.',hand:'fn:wolves',talk:'You howl. Something howls back. You stop howling.'}
  ],npcs:[{id:'grok',pos:[575,300]}],exits:[{rect:[610,252,30,70],to:'depot',at:[60,320],name:"North to the Collector's depot"},leaveB('Back to the ferry (world map)')]},
 depot:{name:"The Collector's Supply Depot",bg:null,paint:'depot',start:[60,330],walk:[[0,252],[640,252],[640,360],[0,360]],
  hotspots:[
   {id:'barrels',name:'Fuel barrels',rect:[40,160,160,80],look:'Barrels of fuel. Enough to run half the valley\'s generators till spring. Or to make one very big bonfire.',hand:'fn:depotFate',talk:'The barrels slosh. They have opinions about matches.'},
   {id:'crates',name:'Medicine crates',rect:[466,175,150,65],look:'Crates of medicine, stenciled with the names of towns that answered the signal.',hand:'fn:crates',talk:'You read the town names out loud. It gets quiet.'},
   {id:'ledger',name:"The Collector's ledger",rect:[355,210,50,30],look:'A ledger of every caravan he ever took. Names, dates, goods, "condition."',hand:'fn:ledger',talk:'The ledger is very organized. That is the scariest part.'},
   {id:'door',name:'Depot door',rect:[300,150,40,90],look:'Lamplight in the door. One guard, half asleep, wholly armed.',hand:'fn:guard',talk:'fn:guard'}
  ],npcs:[{id:'guard',pos:[330,285]}],exits:[{rect:[0,252,30,80],to:'grokwoods',at:[580,320],name:"Back to the Grok's woods"},leaveB('Head home (world map)')]},
 kitchen:{name:'Cambridge Road — The Kitchen Table',bg:null,paint:'kitchen',start:[150,330],walk:[[20,262],[620,262],[640,360],[0,360]],
  hotspots:[
   {id:'table',name:'Kitchen table',rect:[200,195,240,55],look:'The kitchen table. Every big decision in this family got made here, usually over pie.',hand:'fn:decide',talk:'fn:decide'},
   {id:'kstove',name:'Wood stove',rect:[470,120,90,110],look:'The wood stove, four hundred pounds of cast iron and love.',hand:'fn:carryStove',talk:'"Coming north with us?" The stove declines. It is a homebody.'},
   {id:'window',name:'Window',rect:[80,50,90,70],look:'Snow on the glass. Far off, lanterns on the ridge road. His.',hand:'You draw a heart in the frost. Loki adds a dinosaur.',talk:'You tell the night to wait. The night does not wait. It never has.'}
  ],npcs:[{id:'sarah',pos:[250,300]},{id:'cyndal',pos:[360,300]},{id:'loki',pos:[420,320]}],exits:[{rect:[0,330,640,30],to:'farm',at:[160,280],name:'Out to the yard'}]}
});
NPCS.grok={name:'The Grok',hair:'#3a2a1a',coat:'#4a3624',scale:1.9,look:'The Grok. Eight feet of hair, dumb as a stump, slow as March. It does not stop. It smells like a wet barn.',talk:'fn:grok',hand:'fn:grokTouch'};
NPCS.guard={name:'Depot guard',hair:'#222',coat:'#3a2a1a',look:'A depot guard. Half asleep. Fully armed. Wearing two hats, one of them stolen.',talk:'fn:guard',hand:'fn:guard'};
NPC_SHOW.grok=()=>!!F('harmony.grokTracks')&&!['dead','tricked','snuck'].includes(qs('harmony.grok'));
NPC_SHOW.guard=()=>!qs('harmony.depotGuard');
const fmS=NPC_SHOW.sarah,fmC=NPC_SHOW.cyndal;
NPC_SHOW.cyndal=n=>(G().scene!=='kitchen'||act()>=7)&&(!fmC||fmC(n));NPC_SHOW.loki=n=>G().scene!=='kitchen'||act()>=7;NPC_SHOW.sarah=n=>G().scene!=='kitchen'||act()>=7;
// ---- Act 6: The Grok's Woods ----
const oMaps=ACT.maps;
ACT.ridge=()=>{if(!F('harmony.ridge')){setF('harmony.ridge',true);score('ridge',4);}msg('You keep to the ridge like Jack said. Spruce, snow, and silence so big you can hear your own coat.');};
ACT.flowage=()=>choose('The Bottom','Take the flat, easy way across the flowage?',[['Walk the bottom',()=>die('flowage')],['Stay on the ridge',()=>ACT.ridge()]]);
ACT.scrape=()=>{if(check('trail',35)){setF('harmony.grokTracks',true);setQ('harmony.grok','tracks');score('scrape',5);msg('Fresh grooves, still weeping sap. Hair caught in the bark, coarse as rope. It went to the blowdown. It\'s there now. Breathing.');}else msg('Scratches on a tree. A moose? A very tall beaver? You are not sure. Look closer.');};
ACT.tracks=()=>{setF('harmony.grokTracks',true);if(!qs('harmony.grok'))setQ('harmony.grok','tracks');score('grokTracks',4);msg('You follow the tracks to the blowdown. They stop. The breathing doesn\'t.');};
const grokDone=(how,pts,t)=>{setQ('harmony.grok',how);score('grok',pts);msg(t);if(how==='friend')G().flags['harmony.grokFriend']=true;H.save();};
const GROK={name:'The Grok',hp:150,speed:1.7,jab:8,heavy:18,death:'grokfight',intro:'The blowdown heaves and The Grok stands up. It\'s slow. It doesn\'t stop.',
 pattern:[['heavy','raises both arms like falling spruce!'],['heavy','raises both arms like falling spruce!'],['jab','swipes low…'],['feint','scratches itself, thinking slowly…'],['heavy','raises both arms like falling spruce!']],
 winText:'The Grok sits down, very slowly, and does not get up. Its claw is longer than your hand. You feel oddly sad. It was just dumb.',onWin(){grokDone('dead',20,'The Grok is dead in the north woods.');G().flags['harmony.grokClaw']=true;give('hide',2);}};
ACT.grok=()=>{if(!F('harmony.grokTracks')){msg('Snoring from the blowdown. Something big. Maybe read the sign around here first.');return;}
 const s=qs('harmony.grok');if(s==='friend'){msg('The Grok rumbles and offers you a pinecone. You accept. It is a sacred pinecone.');return;}
 const opts=[['Fight it',()=>startFight(GROK)],
  ['Sneak past along the ridge (Sneak)',()=>check('sneak',45)?grokDone('snuck',12,'You slide past the blowdown, ridge-side, downwind, breathing through your hat. It never wakes.'):(msg('A branch cracks under your boot. The Grok stands up. Uh-oh.'),startFight(GROK))],
  ['Offer it apples, slow and patient (Speech)',()=>{if(has('apple')>=2||has('meat')){if(has('apple')>=2)take('apple',2);else take('meat');if(check('speech',35))grokDone('friend',20,'You set down Cortlands from your orchard and talk low, like to a spooked horse. The Grok eats, burps, and lies down at your feet. It follows your smell home in its head forever. (A friendly Grok will matter later.)');else msg('It eats the food and stares at you. Maybe it needs more time. And more food.');}else msg('You have nothing it wants. It wants about 200 apples.');}],
  ['Trick it: a bigger Grok lives east (Speech/Electronics/Melee)',()=>{const c=cls();const ok=c==='tinker'?check('electronics',35):c==='woodsman'?check('melee',40):c==='scrounger'?check('sneak',35):check('speech',40);
    const how={tinker:'You rig a junk noisemaker to howl from the east. The Grok goes east to fight it. Forever.',woodsman:'You drop a spruce across the trail with a crash like another Grok. It wanders off to find it.',scrounger:'You leave your sweaty coat on a stump to the east. It takes the coat and wanders off, very pleased.',fixer:'You grunt, point east and pound your chest. The Grok, an easy audience, believes you.'}[c];
    ok?grokDone('tricked',15,how):(msg('The Grok does not buy it. It does, however, stand up.'),startFight(GROK));}],
  ['Back off',()=>{}]];
 if(goose())opts.splice(1,0,['Let Goose bark at it',()=>grokDone('tricked',15,'Goose barks. The Grok, eight feet of hair, is terrified of a medium-sized dog. It lumbers away, embarrassed.')]);
 if(s!=='tracks'&&s)opts.unshift(['(It is already gone)',()=>{}]);
 choose('The Grok','The blowdown heaves. The Grok stands up. Eight feet of hair and bad decisions.',opts);};
ACT.grokTouch=()=>choose('The Grok','Get closer?',[['Hug it',()=>die('grokhug')],['Poke it with a stick',()=>die('grokpoke')],['Absolutely not',()=>msg('Absolutely not. Good.')]]);
const WOLF={name:'Pack leader',hp:44,speed:.9,jab:6,heavy:9,death:'boss',pattern:[['jab','lunges low…'],['jab','lunges low…'],['heavy','springs for your throat!'],['feint','circles…']],
 winText:'The old male goes down. The pack scatters, like Sarah said they would. Sarah\'s hens will lay again.',onWin(){setQ('harmony.wolves','leader');score('wolves',12);give('hide',2);}};
ACT.wolves=()=>{if(qs('harmony.wolves')){msg('The wolf sign is old now. The pack is broken.');return;}choose('Wolf Pack','The den is close. Five or six wolves and a big grizzled leader. Sarah wants the leader finished.',[
  ['Fight the pack leader',()=>startFight(WOLF)],['Drive them off with fire and noise (Trail)',()=>{if(check('trail',40)){setQ('harmony.wolves','driven');score('wolves',10);msg('You ring the den with torches and bang a pot. They leave for Quebec.');}else{hurt(4);msg('The pack ignores your pot and you get nipped. (-4 HP)');}}],['Leave them',()=>{}]]);};
ACT.guard=()=>{if(qs('harmony.depotGuard'))return msg('The guard is snoring in a snowbank, hats and all.');
 const GU={name:'Depot guard',hp:30,jab:5,heavy:9,death:'boss',winText:'The guard drops like a sack of potatoes. Two hats roll away.',onWin(){setQ('harmony.depotGuard','down');score('guard',6);}};
 choose('Depot Guard','A guard in two hats is half asleep at the door.',[['Fight him',()=>startFight(GU)],['Tiptoe past (Sneak)',()=>check('sneak',35)?(setQ('harmony.depotGuard','snuck'),score('guard',6),msg('You tiptoe past. He mumbles "five more minutes."')):(msg('He wakes up. Of course he does.'),startFight(GU))],
  ['"Shift change. Go get some sleep." (Speech)',()=>check('speech',35)?(setQ('harmony.depotGuard','talked'),score('guard',6),msg('He thanks you, hands you a hat, and goes to sleep in a snowbank.')):startFight(GU)],['Back off',()=>{}]]);};
ACT.ledger=()=>{if(!qs('harmony.depotGuard'))return msg('The guard is right there. Deal with him first.');choose('The Ledger','Every caravan he ever took. Read it?',[['Read it by match light',()=>die('match')],['Take it to show the towns',()=>{setF('harmony.ledger',true);score('ledger',10);msg('You take the ledger. Names from Lowelltown, Skowhegan, the Forks. The towns will want to see this.');ACT.depotCheck();}]]);};
ACT.crates=()=>{if(!qs('harmony.depotGuard'))return msg('The guard first.');choose('Medicine Crates','Crates stenciled MEDICINE.',[['Sniff the open one',()=>die('ether')],['Take two medkits\' worth',()=>{if(!F('harmony.depotMeds')){setF('harmony.depotMeds',true);give('medkit',2);score('depotMeds',4);}msg('You pack two medkits\' worth. Doc Ellen will cry, briefly and professionally.');ACT.depotCheck();}]]);};
ACT.depotFate=()=>{if(!qs('harmony.depotGuard'))return msg('The guard first.');if(qs('harmony.depot')&&qs('harmony.depot')!=='found')return msg('The depot\'s fate is decided: '+qs('harmony.depot')+'.');
 choose('The Fuel','Marcel: "If that depot\'s got fuel, half the valley could run a generator till spring. Think on that before you burn it."',[
  ['Share it: send word to the towns (Speech)',()=>{setQ('harmony.depot','shared');score('depotFate',10);msg('You mark the barrels for Harmony, Lowelltown and Skowhegan. Sleds will come. The towns will remember who sent them.');ACT.depotCheck(true);}],
  ['Take what the farm needs',()=>{setQ('harmony.depot','taken');score('depotFate',6);msg('You roll three barrels toward the sled. The farm will be warm. The towns will hear you took it.');ACT.depotCheck(true);}],
  ['Burn it so he can\'t use it',()=>{setQ('harmony.depot','burned');score('depotFate',8);msg('You light a long fuse and walk, not run, away. Behind you the night turns orange. The Collector will be cold this winter. So will everyone.');ACT.depotCheck(true);}],['Not yet',()=>{}]]);};
ACT.depotCheck=(fate)=>{if(!qs('harmony.depot'))setQ('harmony.depot','found');if(qs('harmony.depot')!=='found'||fate){score('act6',10);advance(7,'Choices');startQuestMarker({id:'harmony-choice',target:'farm',label:'The Long Winter: the kitchen table'});msg('Now he\'ll come for the farm. Time to talk it over at the kitchen table.');}};
// ---- Act 7: Choices ----
const oHouse=ACT.enterHouse;ACT.enterHouse=h=>{if(act()>=7){loadScene('kitchen');if(!qs('harmony.choice'))msg('Supper is quiet. Sarah has the ledger open on the table. Cyndal and Loki know something is up; they always do.');return;}oHouse(h);};
const FAM={sarah:'"He\'ll come for the farm now. We can bring the towns in with us, or try his terms, or bar the door and hold on ourselves. Your call. But we make it together."',
 cyndal:'"I can run the radio for all the towns. I\'ve got Marcel and Jack and Lowelltown on a schedule. If we unite, I can be the one who calls everybody in." She is very serious. She is twelve-going-on-forty.',
 loki:'"If we go north, can Goose come? And the hens? And the Grok?" He is only partly kidding about the Grok.'};
const oS=ACT.talkSarah,oC=ACT.talkCyndal,oL=ACT.talkLoki;
const fam=(who,o)=>h=>{if(G().scene==='kitchen'){if(!F('harmony.fam.'+who)){setF('harmony.fam.'+who,true);score('fam'+who,3);}say(NPCS[who].name,FAM[who]);if(who==='loki'&&goose())msg('Goose puts his head on Loki\'s knee. The vote is noted.');return;}o(h);};
ACT.talkSarah=fam('sarah',oS);ACT.talkCyndal=fam('cyndal',oC);ACT.talkLoki=fam('loki',oL);
ACT.carryStove=()=>choose('The Wood Stove','Bring it north?',[['Lift it',()=>die('stove')],['Leave it',()=>msg('It stays. You pat it like a good dog.')]]);
const support=()=>{const f=G().flags,q=G().q;let n=0;if(f['harmony.signalVerdict']==='trap')n++;if(f['harmony.ledger'])n++;if((+f['harmony.prisoners']||0)>0)n++;if(q['harmony.depot']==='shared')n+=2;if(q['harmony.meds']==='done')n++;if(q['harmony.school']==='cleared')n++;if(f['harmony.jackMaps'])n++;if(q['harmony.collector']&&q['harmony.collector']!=='paid')n++;if(f['harmony.grokFriend'])n++;return n;};
ACT.decide=()=>{if(qs('harmony.choice')){msg(`It's decided: ${({unite:'unite the towns',deal:'deal with the Collector',alone:'go it alone'})[qs('harmony.choice')]}, and ${F('harmony.family')==='north'?'the family goes north':'you stay and defend Harmony'}. Winter\'s coming down hard, and so is he.`);return;}
 const fs=['sarah','cyndal','loki'].filter(w=>F('harmony.fam.'+w)).length;if(fs<2){msg('Talk with the family first. Everyone gets a say at this table. Even Goose.');return;}
 const sup=support();setF('harmony.support',sup);
 const unite=(how,t)=>{setF('harmony.uniteHow',how);pick('unite',t);};
 choose('The Kitchen Table',`Sarah: "Your call. Ours." (Town support: ${sup}. Uniting needs about 4.)`,[
  [sup>=4?'Unite the towns':'Unite the towns (rally them first)',()=>{if(sup>=4)return unite('support','The towns have seen the ledger and the cages and the meeting. They\'ll come.');
    const c=cls();const ok=c==='fixer'?check('speech',40):c==='woodsman'?check('melee',40):c==='tinker'?check('electronics',40):check('sneak',40);
    const t={fixer:'You ride town to town and talk till your voice gives out. They come.',woodsman:'You drill a militia on the Grange lawn until even Pete can hold a line. They come.',tinker:'You and Cyndal build a radio net: every town on one channel. When you call, they come.',scrounger:'You stash food and shells in every town\'s cellar. "Payment in advance." They come.'}[c];
    ok?unite(c,t):(setF('harmony.uniteFailed',true),msg('Not enough of them believe it yet. You could go it alone, or think about his deal.'));}],
  ['Make a deal with the Collector',()=>choose('The Deal','He offers peace for a toll: a third of the farm\'s food, and a few strong backs from Harmony.',[['Sign without reading',()=>die('contract')],['Haggle the terms (Barter)',()=>{const ok=check('barter',40);setF('harmony.dealTerms',ok?'haggled':'full');pick('deal',ok?'You get it down to a quarter and no backs. He sends back a single shell casing. Deal.':'He doesn\'t haggle. Full toll. He sends back a single shell casing.');}],['Never mind',()=>ACT.decide()]])],
  ['Go it alone',()=>pick('alone','You bar the door and hold on yourselves. The farm will be a fortress. It will be warm inside. It will be lonely.')],
  ['"Everybody calm down."',()=>die('calmdown')]]);};
function pick(choice,t){setQ('harmony.choice',choice);score('choice',15);msg(t);
 choose('Stay or Go North?','Sarah: "And us? Do we stay and defend Harmony, or take the kids north to Jack\'s country till spring?"'+(F('harmony.grokFriend')?' (Up north, a certain Grok knows your smell.)':''),[
  ['Stay and defend Harmony',()=>{setF('harmony.family','stay');score('family',10);say('Sarah','"Then we stay. Cyndal gets the radio, Loki gets the root cellar and Goose, and you get the gate." She squeezes your hand. "Together."');ACT.act7Done();}],
  ['Take the family north',()=>{setF('harmony.family','north');score('family',10);say('Sarah','"North, then. Jack will grumble and let us in." Loki is already packing the dinosaur book.'+(F('harmony.grokFriend')?' "Will the Grok be there?" asks Loki. Probably, buddy. Probably.':''));ACT.act7Done();}]]);}
ACT.act7Done=()=>{advance(8,'Siege of Harmony');startQuestMarker({id:'harmony-siege',target:'farm',label:'Siege of Harmony: hold the farm'});msg('It\'s decided. Winter\'s coming down hard, and so is he. (Act 8 continues in the main game.)');};
H.WORLD.push({id:'grokwoods',name:"Grok's Woods",x:520,y:110});
Object.assign(H.WORLD_MSG,{grokwoods:' Past the Kennebec. Spruce, snow, and very large tracks.'});
// Jack's maps now also point north once Act 5 is done
ACT.act6Marker=()=>startQuestMarker({id:'harmony-grok',target:'north',label:"The Grok's woods: walk the ridge"});
const oCol=ACT.collector;ACT.collector=h=>oCol(h);
};})();
