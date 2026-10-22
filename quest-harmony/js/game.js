(()=>{'use strict';
const $=s=>document.querySelector(s), cv=$('#cv'), ctx=cv.getContext('2d'), OV=$('#overlay');
const W=640,H=360, EMBED=window.parent!==window, MAXSCORE=400;
const DIRS=['e','se','s','sw','w','nw','n','ne'], SPR={};
DIRS.forEach(d=>{const i=new Image();i.src='img/justin_'+d+'.png';SPR[d]=i;});
const portrait='img/portrait.jpg';
const ENTRY=window.ENTRY||{harmony:'harmony'};let pendingScene=null;
let G=null, verb='walk', selItem=null, scene=null, bgCache={}, player={x:320,y:300,tx:320,ty:300,dir:'s',moving:false,t:0},
    rpgState=null, modal=false, fight=null, markers={};
// ---------- state ----------
const C=CHARACTER;
function newGame(cls,rpgStats){const c=CLASSES[cls];let st=C.normStats(rpgStats);if(!rpgStats)for(const k in c.statNudge)st[k]+=c.statNudge[k];const mh=C.derived(st).maxHp;
  return {hero:'Justin',cls,stats:st,skills:{},maxHp:mh,hp:mh,stamina:100,hunger:20,
  injuries:{blinded:false,crippledArm:false,crippledLeg:false},inventory:[{id:'apple',qty:2},{id:'jerky',qty:1},{id:'junk',qty:3},{id:'cloth',qty:1}],
  credit:5,score:0,scored:{},q:{},flags:{},companions:[],day:1,time:'08:00',mins:0,scene:'farm',deaths:0};}
const act=()=>Math.max(+G.flags['story.act']||1,G.localAct||1);
const qs=id=>G.q[id]||0, setQ=(id,st)=>{G.q[id]=st;autosave();};
function score(key,n){if(G.scored[key])return;G.scored[key]=1;G.score+=n;updBar();autosave();}
function has(id){const e=G.inventory.find(i=>i.id===id);return e?e.qty:0;}
function give(id,n=1){let e=G.inventory.find(i=>i.id===id);if(!e)G.inventory.push(e={id,qty:0});e.qty+=n;}
function take(id,n=1){const e=G.inventory.find(i=>i.id===id);if(!e||e.qty<n)return false;e.qty-=n;if(!e.qty)G.inventory.splice(G.inventory.indexOf(e),1);if(selItem===id&&!has(id))selItem=null;updBar();return true;}
const sk=id=>C.skillScore(id,G.stats,G.skills,G.cls), skName=id=>C.SKILLS.find(x=>x.id===id).name;
function useStat(id,n=1){id=C.ALIAS[id]||id;const e=G.skills[id]||(G.skills[id]={lv:0,xp:0});e.xp+=n*C.GROWTH.xpPer;if(e.xp>=C.GROWTH.need(e.lv)){e.xp=0;e.lv++;toast(`Your ${skName(id)} skill rises to ${sk(id)}.`);}}
function check(id,dc){id=C.ALIAS[id]||id;useStat(id);return Math.random()*100<C.checkChance(sk(id),dc);}
function tick(m){G.mins+=m;G.hunger=Math.min(100,G.hunger+m/12);if(G.hunger>=100)hurt(1,'starve');}
function hurt(n,cause){G.hp=Math.max(0,G.hp-n);updBar();if(G.hp<=0)die(cause);}
// ---------- handoff ----------
function fromTownState(s){if(!s||typeof s!=='object')return;rpgState=s;const ex=s.extra&&typeof s.extra==='object'?s.extra:{};
  if(ex.cls&&CLASSES[ex.cls]){G=migrate(Object.assign(newGame(ex.cls,rpgStats(s)),ex.save||{}));}
  if(!G)G=null;
  if(G){applyIncoming(s);}
}
function rpgStats(s){const o=s.stats||s.core;return o&&typeof o==='object'&&['strength','vigor','intellect','agility','grit'].some(k=>typeof o[k]==='number')?o:null;}
function migrate(g){g.stats=C.normStats(g.stats);if(!g.skills||typeof g.skills!=='object')g.skills={};delete g.use;return g;}
function applyIncoming(s){const rs=rpgStats(s);if(rs)G.stats=C.normStats(rs);if(Array.isArray(s.inventory))G.inventory=s.inventory.filter(i=>i&&ITEMS[i.id]&&i.qty>0).map(i=>({id:i.id,qty:i.qty|0}));
  if(typeof s.maxHp==='number')G.maxHp=s.maxHp; if(typeof s.hp==='number')G.hp=Math.min(G.maxHp,s.hp);
  if(s.injuries&&typeof s.injuries==='object')for(const k in G.injuries)if(k in s.injuries)G.injuries[k]=!!s.injuries[k];
  if(Array.isArray(s.companions))G.companions=s.companions.filter(c=>c&&c.withYou!==false).map(c=>c.id||c);
  if(typeof s.day==='number'){if(s.day>G.day)G.dayAdvanced=true;G.day=s.day;} if(s.time)G.time=s.time;
  const f=s.questFlags||{};for(const k in f){if(k.startsWith('harmony.')&&STORY.quests[k])G.q[k]=f[k];else G.flags[k]=f[k];}
  if(f['story.gooseFound']&&qs('harmony.dog')!=='done')setQ('harmony.dog','found');
  if(qs('harmony.meds')==='away'&&(G.dayAdvanced||G.lastExit==='skow'))setQ('harmony.meds','returned');
}
function toTownState(){const qf={};for(const k in G.q)qf[k]=G.q[k];for(const k in G.flags)if(k.startsWith('harmony.'))qf[k]=G.flags[k];qf['harmony.class']=G.cls;
  const save={...G};delete save.inventory;
  return {hero:G.hero,class:G.cls,inventory:G.inventory.map(i=>({id:i.id,qty:i.qty,name:ITEMS[i.id].name})),hp:Math.round(G.hp),maxHp:G.maxHp,
   injuries:{...G.injuries},companions:G.companions.map(id=>({id,name:id[0].toUpperCase()+id.slice(1),withYou:true})),questFlags:qf,day:G.day,time:G.time,
   stats:{...G.stats},score:G.score,quests:{...G.q},extra:{schema:'character/1',cls:G.cls,score:G.score,skills:Object.fromEntries(C.SKILLS.map(x=>[x.id,{lv:(G.skills[x.id]||{}).lv||0,xp:(G.skills[x.id]||{}).xp||0,score:sk(x.id)}])),stats:{...G.stats},save}};}
function post(m){if(EMBED)try{window.parent.postMessage(m,'*');}catch(e){}}
function startQuestMarker(m){markers[m.id]=m;post({type:'startQuest',id:m.id,target:m.target,label:m.label});}
function leave(exit){const st=toTownState();G.lastExit=exit;
  try{localStorage.setItem('mainerpg.handoff',JSON.stringify({...st,exit}));}catch(e){}
  autosave();
  if(EMBED){post({type:'leaveTown',exit,state:st});post({type:'town-exit',exit,state:st});msg('You head out of Harmony.');}
  else worldMap();}
window.addEventListener('message',e=>{const d=e.data;if(!d||typeof d!=='object')return;if(EMBED&&e.source!==window.parent)return;
  if(d.type==='enterTown'&&(!d.town||d.town==='harmony'||ENTRY[d.town])){closeAll();fromTownState(d.state);const es=(d.state&&SCENES[d.state.scene]&&d.state.scene)||(d.town&&d.town!=='harmony'&&ENTRY[d.town]);pendingScene=es||null;if(G){if(!fight){loadScene(es||(G.scene==='store'||G.scene==='clinic'?'harmony':G.scene));msg('Back in Harmony. '+(qs('harmony.meds')==='returned'?'You have the medicine for Mira.':''));}}else titleScreen();}});
// ---------- painterly placeholder backgrounds ----------
function rng(seed){return()=>((seed=Math.imul(seed^seed>>>15,1|seed)+0x6D2B79F5|0)>>>0)/4294967296;}
function grad(c,y0,y1,stops){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g;}
function blob(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();}
function tree(c,x,y,s,col,r){c.fillStyle='#3a2616';c.fillRect(x-3*s,y-30*s,6*s,30*s);for(let i=0;i<9;i++)blob(c,x+(r()-.5)*40*s,y-40*s-(r())*35*s,14*s,12*s,col[i%col.length]);}
function pine(c,x,y,s,col){c.fillStyle=col;for(let i=0;i<4;i++){c.beginPath();c.moveTo(x,y-90*s+i*18*s);c.lineTo(x-(14+i*7)*s,y-40*s+i*12*s);c.lineTo(x+(14+i*7)*s,y-40*s+i*12*s);c.fill();}c.fillStyle='#2a1a10';c.fillRect(x-3*s,y-14*s,6*s,14*s);}
function house(c,x,y,w,h,wall,roof,sign){c.fillStyle=wall;c.fillRect(x,y,w,h);c.fillStyle=roof;c.beginPath();c.moveTo(x-10,y);c.lineTo(x+w/2,y-h*.45);c.lineTo(x+w+10,y);c.fill();
  c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+w*.7,y,w*.3,h);c.fillStyle='#2a2018';c.fillRect(x+w*.42,y+h*.45,w*.16,h*.55);
  c.fillStyle='#d8b060';[[.12,.3],[.72,.3]].forEach(([a,b])=>c.fillRect(x+w*a,y+h*b,w*.14,h*.2));if(sign){c.fillStyle='#e8d8b0';c.fillRect(x+w*.15,y+h*.05,w*.7,14);c.fillStyle='#402010';c.font='bold 10px serif';c.textAlign='center';c.fillText(sign,x+w/2,y+h*.05+11);}}
const PAINT={
 farm(c,r){c.fillStyle=grad(c,0,250,['#6f86a8','#c9b9a8','#e6c79a']);c.fillRect(0,0,W,250);
  c.fillStyle='#5d6b52';c.beginPath();c.moveTo(0,170);for(let x=0;x<=W;x+=40)c.lineTo(x,150+Math.sin(x/90)*20);c.lineTo(W,250);c.lineTo(0,250);c.fill();
  for(let i=0;i<14;i++)pine(c,i*48+r()*20,175+r()*10,.7,'#2e3e2c');
  c.fillStyle=grad(c,230,360,['#8a7a4a','#6b5a36','#4a3a22']);c.fillRect(0,230,W,130);
  c.fillStyle='#9a8460';c.beginPath();c.moveTo(560,250);c.lineTo(640,250);c.lineTo(640,300);c.lineTo(300,360);c.lineTo(200,360);c.fill();
  house(c,70,130,180,110,'#c8b8a0','#5a3a2a');c.fillStyle='#4a4a4a';c.fillRect(205,70,16,60);for(let i=0;i<5;i++)blob(c,214+i*8,60-i*12,8+i*3,6+i*2,'rgba(220,220,220,.35)');
  c.fillStyle='#6a4a2a';c.fillRect(275,185,50,55);c.fillStyle='#4a3020';c.beginPath();c.moveTo(270,185);c.lineTo(300,165);c.lineTo(330,185);c.fill();
  tree(c,330,220,1.4,['#b8642a','#d08a2a','#a04a1a'],r);tree(c,375,215,1.2,['#c0702a','#e09a3a'],r);
  for(let i=0;i<5;i++)tree(c,440+i*42,225-(i%2)*8,1,['#4a6a2a','#5a7a32','#c03020'],r);
  c.fillStyle='#7a5a3a';for(let i=0;i<6;i++)c.fillRect(14+i*12,240,10,28);},
 town(c,r){c.fillStyle=grad(c,0,245,['#7a8aa8','#c8bca8','#d8b890']);c.fillRect(0,0,W,245);
  for(let i=0;i<16;i++)pine(c,i*42+r()*10,150,.6,'#3a4a38');
  c.fillStyle='#e8e0d0';c.fillRect(270,60,40,90);c.beginPath();c.moveTo(262,60);c.lineTo(290,10);c.lineTo(318,60);c.fillStyle='#d8d0c0';c.fill();
  house(c,40,110,170,130,'#a89070','#4a3a30','TRADING POST');house(c,430,100,180,140,'#b05a40','#3a2a2a','GRANGE');house(c,250,140,0,0,'#000','#000');
  c.fillStyle=grad(c,240,360,['#7a6a50','#6a5a42','#4a3a2a']);c.fillRect(0,240,W,120);
  c.fillStyle='#8a7a5a';c.fillRect(0,280,W,40);c.fillStyle='#6a5a48';c.fillRect(300,205,50,40);c.fillStyle='#3a2a1a';c.fillRect(296,198,58,8);
  c.fillStyle='#7a5a3a';c.fillRect(250,160,10,70);c.fillStyle='#d8c8a0';c.fillRect(232,150,46,36);
  c.strokeStyle='#222';c.lineWidth=2;c.beginPath();c.moveTo(360,120);c.lineTo(395,210);c.stroke();c.fillStyle='#5a4a3a';c.fillRect(356,100,6,140);},
 store(c,r){c.fillStyle=grad(c,0,270,['#3a2818','#5a3e26']);c.fillRect(0,0,W,270);c.fillStyle='rgba(0,0,0,.25)';for(let x=0;x<W;x+=32)c.fillRect(x,0,2,270);
  c.fillStyle='#4a3020';c.fillRect(20,60,150,190);for(let s=0;s<4;s++){c.fillStyle='#2a1a10';c.fillRect(20,100+s*40,150,5);for(let i=0;i<7;i++)blob(c,32+i*20,92+s*40,7,9,['#a8a090','#8a5a3a','#c0a060','#6a7a5a'][(i+s)%4]);}
  c.fillStyle='#d8a040';blob(c,330,40,70,18,'rgba(255,200,120,.25)');c.fillStyle=grad(c,270,360,['#5a4028','#3a2818']);c.fillRect(0,270,W,90);
  c.fillStyle='#6a4628';c.fillRect(180,200,280,60);c.fillStyle='#8a6038';c.fillRect(175,195,290,10);c.fillStyle='#9a9a8a';c.fillRect(505,190,40,30);},
 clinic(c,r){c.fillStyle=grad(c,0,270,['#6a5a4a','#8a7860']);c.fillRect(0,0,W,270);c.fillStyle='#9ab0c0';c.fillRect(260,50,120,90);c.fillStyle='#4a3a2a';c.fillRect(318,50,4,90);c.fillRect(260,93,120,4);
  c.fillStyle=grad(c,270,360,['#6a5a48','#4a3a2a']);c.fillRect(0,270,W,90);for(let i=0;i<2;i++){c.fillStyle='#7a6a50';c.fillRect(30+i*105,215,95,35);c.fillStyle='#d8d0c0';c.fillRect(34+i*105,205,87,18);}
  c.fillStyle='#d8d0c0';c.fillRect(470,80,120,150);c.fillStyle='#a02020';c.fillRect(522,100,16,50);c.fillRect(505,117,50,16);}
};
function paintBg(id){if(bgCache[id])return bgCache[id];const sc=SCENES[id],o=document.createElement('canvas');o.width=W;o.height=H;const c=o.getContext('2d');
  if(sc.bg){const im=new Image();im.onload=()=>{c.drawImage(im,0,0,W,H);};im.src=sc.bg;}
  else{const r=rng(id.length*7919);PAINT[sc.paint](c,r);
   const d=c.getImageData(0,0,W,H).data;for(let i=0;i<9000;i++){const x=r()*W|0,y=r()*H|0,p=(y*W+x)*4;c.fillStyle=`rgba(${d[p]},${d[p+1]},${d[p+2]},.55)`;c.beginPath();c.ellipse(x,y,2+r()*4,1.5+r()*2.5,r()*3,0,7);c.fill();}
   c.fillStyle='rgba(60,40,20,.08)';c.fillRect(0,0,W,H);}
  return bgCache[id]=o;}
// ---------- scene ----------
function loadScene(id,at){scene=SCENES[id];G.scene=id;const p=at||scene.start;player.x=player.tx=p[0];player.y=player.ty=p[1];player.moving=false;$('#hover').textContent=scene.name;autosave();
  if(id==='harmony')score('visitHarmony',2);}
function inPoly(x,y,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const[a,b]=poly[i],[e,f]=poly[j];if((b>y)!==(f>y)&&x<(e-a)*(y-b)/(f-b)+a)c=!c;}return c;}
const inRect=(x,y,r)=>x>=r[0]&&y>=r[1]&&x<=r[0]+r[2]&&y<=r[1]+r[3];
const NPC_SHOW={};
function npcsHere(){return (scene.npcs||[]).map(e=>typeof e==='string'?{id:e,...NPCS[e]}:{...NPCS[e.id],...e}).filter(n=>!(n.id==='sarah'&&G.companions.includes('sarah'))&&(!NPC_SHOW[n.id]||NPC_SHOW[n.id](n)));}
function npcRect(n){const s=n.scale||(n.small?.7:1);return[n.pos[0]-14*s,n.pos[1]-90*s,28*s,90*s];}
function hit(x,y){for(const n of npcsHere())if(inRect(x,y,npcRect(n)))return{kind:'npc',o:n};
  for(const e of scene.exits)if(inRect(x,y,e.rect))return{kind:'exit',o:e};
  for(let i=scene.hotspots.length-1;i>=0;i--){const h=scene.hotspots[i];if(inRect(x,y,h.rect))return{kind:'hs',o:h};}return null;}
function drawFigure(n,t){const s=n.scale||(n.small?.7:1),[x,y]=n.pos;ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ctx.fillStyle='rgba(0,0,0,.3)';blob(ctx,0,0,16,5,'rgba(0,0,0,.3)');ctx.fillStyle='#2a2a3a';ctx.fillRect(-9,-40,7,40);ctx.fillRect(2,-40,7,40);
  ctx.fillStyle=n.coat;ctx.fillRect(-13,-78,26,42);ctx.fillStyle='#e0b898';blob(ctx,0,-86,8,10,'#e0b898');
  ctx.fillStyle=n.hair;if(n.curly){for(let i=0;i<14;i++)blob(ctx,-10+(i%5)*5,-94+Math.floor(i/5)*14+Math.sin(t/400+i)*.6,5,6,n.hair);}else blob(ctx,0,-94,9,5,n.hair);
  ctx.restore();}
function drawGoose(t){const x=player.x-34,y=player.y+4;blob(ctx,x,y-12,16,8,'#c89048');blob(ctx,x+14,y-20,7,6,'#c89048');ctx.fillStyle='#7a5020';ctx.fillRect(x-10,y-6,3,8);ctx.fillRect(x+8,y-6,3,8);ctx.fillRect(x-18,y-16+Math.sin(t/120)*2,8,3);}
function frame(t){requestAnimationFrame(frame);if(!G||!scene)return;
  // move
  if(player.moving&&!modal){const sp=(G.injuries.crippledLeg?1.1:2.2)*(1+(player.y-250)/220),dx=player.tx-player.x,dy=player.ty-player.y,d=Math.hypot(dx,dy);
   if(d<sp){player.moving=false;}else{const nx=player.x+dx/d*sp,ny=player.y+dy/d*sp*.8;if(inPoly(nx,ny,scene.walk)){player.x=nx;player.y=ny;player.t+=sp;
     player.dir=DIRS[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];if((player.t|0)%60<3)tick(.05);}else player.moving=false;}
   for(const e of scene.exits)if(inRect(player.x,player.y,e.rect)){player.moving=false;doExit(e);return;}}
  ctx.drawImage(paintBg(G.scene),0,0);
  const things=npcsHere().map(n=>({y:n.pos[1],d:()=>drawFigure(n,t)}));things.push({y:player.y,d:()=>{
   const im=SPR[player.dir];if(!im.complete||!im.naturalWidth)return;const s=.55+(player.y-250)/110*.3,h=im.naturalHeight*s,w=im.naturalWidth*s,bob=player.moving?Math.abs(Math.sin(player.t/7))*2:0;
   blob(ctx,player.x,player.y,w*.45,4,'rgba(0,0,0,.35)');ctx.drawImage(im,player.x-w/2,player.y-h-bob,w,h);if(G.companions.includes('goose'))drawGoose(t);}});
  things.sort((a,b)=>a.y-b.y).forEach(o=>o.d());
  if(G.injuries.blinded){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);}
  $('#hpTxt').textContent=`HP ${Math.round(G.hp)}/${G.maxHp}  STA ${Math.round(G.stamina)}  Hunger ${Math.round(G.hunger)}  Day ${G.day} ${G.time}`;
  G.stamina=Math.min(100,G.stamina+.02);}
// ---------- input ----------
const VERBS=['walk','look','hand','talk','item'];
function setVerb(v){if(v==='item'&&!selItem){openInv();return;}verb=v;document.querySelectorAll('#bar [data-verb]').forEach(b=>b.classList.toggle('on',b.dataset.verb===v));cv.style.cursor=v==='walk'?'crosshair':'pointer';}
document.querySelectorAll('#bar [data-verb]').forEach(b=>b.onclick=()=>{if(!modal)setVerb(b.dataset.verb);});
$('#btnCycle').onclick=()=>{if(modal)return;let i=VERBS.indexOf(verb);do{i=(i+1)%VERBS.length;}while(VERBS[i]==='item'&&!selItem);setVerb(VERBS[i]);};
$('#btnInv').onclick=()=>{if(!modal)openInv();};$('#btnStats').onclick=()=>{if(!modal)openStats();};$('#btnMenu').onclick=()=>{if(!modal)openMenu();};
function evPos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height];}
cv.addEventListener('pointermove',e=>{if(!G||!scene||modal)return;const[x,y]=evPos(e),h=hit(x,y);$('#hover').textContent=h?(h.o.name):'';});
cv.addEventListener('contextmenu',e=>{e.preventDefault();$('#btnCycle').onclick();});
cv.addEventListener('click',e=>{if(!G||modal)return;const[x,y]=evPos(e),h=hit(x,y);
  if(verb==='walk'){player.tx=x;player.ty=Math.max(y,scene.walk[0][1]+2);if(h&&h.kind==='exit'){const r=h.o.rect;player.tx=Math.min(Math.max(x,r[0]+2),r[0]+r[2]-2);player.ty=Math.min(Math.max(y,r[1]+2),r[1]+r[3]-2);}player.moving=true;return;}
  if(!h){msg(snark(verb));return;}
  if(h.kind==='exit'){if(verb==='look')msg(h.o.name+'.');else doExit(h.o);return;}
  if(verb==='item'){useItemOn(selItem,h.o);return;}
  if(verb==='look'&&G.injuries.blinded){msg('You squint. It is a blur. Possibly '+h.o.name+'. Possibly a bear.');return;}
  const a=h.o[verb];tick(2);if(!a){msg(snark(verb));return;}
  if(a.startsWith('fn:'))ACT[a.slice(3)](h.o);else msg(a);});
const SNARK={look:['You see nothing special. Maine is like that.','Trees. Dirt. More trees. Classic.','You look intently at nothing. Nothing looks back.'],
 hand:['You grope the empty air. The air files a complaint.','There is nothing there to pick up, steal, or break.'],
 talk:['You chat with the empty air. It is a great listener.','Talking to yourself again? The long winter starts early.'],item:['That doesn\'t do anything useful. Shocking.']};
const snark=v=>{const a=SNARK[v]||SNARK.look;return a[Math.random()*a.length|0];};
function doExit(e){if(e.to){loadScene(e.to,e.at);tick(10);}else leave(e.leave);}
// ---------- UI boxes ----------
function box(html,cls=''){modal=true;const d=document.createElement('div');d.className='box '+cls;d.innerHTML=`<div class="in">${html}</div>`;OV.appendChild(d);return d;}
function closeAll(){OV.innerHTML='';modal=false;fightStop();}
function closeBox(d){d.remove();modal=!!OV.children.length;}
let queue=[];
function msg(t,who){queue.push([t,who]);if(!OV.querySelector('.msg'))nextMsg();}
function nextMsg(){const m=queue.shift();if(!m)return;const[t,who]=m;const pt=who?`<img class="pt" src="${who==='justin'?portrait:''}" ${who==='justin'?'':'style="display:none"'}>`:'';
  const d=box(`${who&&who!=='justin'?`<h2>${who}</h2>`:''}${pt}${t}<div class="hint">click / tap to continue</div>`,'msg');d.onclick=()=>{closeBox(d);nextMsg();};}
function toast(t){msg('<i>'+t+'</i>');}
function say(who,t){msg(t,who);}
function choose(title,t,opts){const d=box(`<h2>${title}</h2>${t}<div>${opts.map((o,i)=>`<button data-i="${i}">${o[0]}</button>`).join('')}</div>`,'choice');
  d.querySelectorAll('button').forEach(b=>b.onclick=()=>{closeBox(d);opts[b.dataset.i][1]();});}
function updBar(){if(!G)return;$("#score").textContent=`★ ${G.score}/${MAXSCORE}`;$('#itemIcon').textContent=selItem?ITEMS[selItem].icon:'∅';}
function openInv(){const d=box(`<h2>Inventory</h2><div class="grid">${G.inventory.map(i=>`<div class="it ${selItem===i.id?'sel':''}" data-id="${i.id}">${ITEMS[i.id].icon}<small>${ITEMS[i.id].name} ×${i.qty}</small></div>`).join('')||'Your pockets echo.'}</div>
 <div>Trade credit: ${G.credit}</div><button id="iSel">Select for Item verb</button><button id="iUse">Use / Eat</button><button id="iLook">Look</button><button id="iX">Close</button>`,'inv');
 let cur=selItem;d.querySelectorAll('.it').forEach(e=>e.onclick=()=>{cur=e.dataset.id;d.querySelectorAll('.it').forEach(x=>x.classList.toggle('sel',x===e));});
 d.querySelector('#iX').onclick=()=>closeBox(d);d.querySelector('#iSel').onclick=()=>{if(!cur)return;selItem=cur;closeBox(d);updBar();setVerb('item');};
 d.querySelector('#iLook').onclick=()=>{if(cur){closeBox(d);msg(LOOKITEM[cur]||`It's ${ITEMS[cur].name}. It does what it says on the tin, assuming a tin.`);}};
 d.querySelector('#iUse').onclick=()=>{if(!cur)return;closeBox(d);consume(cur);};}
const LOOKITEM={junk:'Junk. One person\'s trash is a Tinker\'s Tuesday.',donut:'A donut of geological age.',medkit:'A medkit. Gauze, tape, and a stern pamphlet.'};
function consume(id){const it=ITEMS[id];if(!it.food&&!it.heal){msg(`You can't eat ${it.name}. Well. You shouldn't.`);return;}take(id);
  if(it.food)G.hunger=Math.max(0,G.hunger-it.food);if(it.stam)G.stamina=Math.min(100,G.stamina+it.stam);if(it.heal)G.hp=Math.min(G.maxHp,G.hp+it.heal);
  if(id==='medkit'&&(G.injuries.crippledArm||G.injuries.crippledLeg)){G.injuries.crippledArm=false;toast('The splint helps your arm.');}
  msg(it.heal?`You patch yourself up. HP ${Math.round(G.hp)}/${G.maxHp}.`:`You eat the ${it.name}. Hunger: ${Math.round(G.hunger)}.`);}
function openStats(){const c=CLASSES[G.cls],bar=(v,m,cl)=>`<span class="bar2 ${cl}" style="width:${v/m*120}px"></span> ${Math.round(v)}/${m}`;
 const inj=Object.keys(G.injuries).filter(k=>G.injuries[k]).join(', ')||'none';
 const quests=Object.keys(G.q).map(k=>`<tr><td>${STORY.quests[k]?.name||k}</td><td>${G.q[k]}</td></tr>`).join('')||'<tr><td>No quests yet.</td></tr>';
 const d=box(`<h2>${G.hero} the ${c.name}</h2><table><tr><td>Health</td><td>${bar(G.hp,G.maxHp,'')}</td></tr><tr><td>Stamina</td><td>${bar(G.stamina,100,'st')}</td></tr><tr><td>Hunger</td><td>${bar(G.hunger,100,'hu')}</td></tr><tr><td>Injuries</td><td>${inj}</td></tr></table>
 <h2>Stats</h2><table>${C.STATS.map(s=>`<tr><td>${s.name}</td><td>${G.stats[s.id]}</td></tr>`).join('')}</table><h2>Skills</h2><table>${C.SKILLS.map(s=>`<tr><td>${s.name}</td><td>${sk(s.id)}</td><td><small>${Object.keys(s.gov).join('+')}</small></td></tr>`).join('')}</table><h2>Quests</h2><table>${quests}</table><button>Close</button>`,'stats');d.querySelector('button').onclick=()=>closeBox(d);}
function openMenu(){const d=box(`<h2>The Long Winter</h2><button id="mS">Save</button><button id="mR">Restore</button><button id="mN">Restart</button><button id="mL">Leave town</button><button id="mA">About</button><button id="mX">Resume</button>`,'menu');
 d.querySelector('#mX').onclick=()=>closeBox(d);d.querySelector('#mS').onclick=()=>{closeBox(d);save('harmony.save.manual');msg('Game saved. Smart. Save early, save often.');};
 d.querySelector('#mR').onclick=()=>{closeBox(d);restore();};d.querySelector('#mN').onclick=()=>{closeAll();restart();};
 d.querySelector('#mL').onclick=()=>{closeBox(d);leave('worldmap');};d.querySelector('#mA').onclick=()=>{closeBox(d);msg('The Long Winter — Harmony town layer. A Sierra-style adventure in post-collapse Maine.');};}
function save(k){try{localStorage.setItem(k,JSON.stringify(G));}catch(e){}}
function autosave(){if(G)save('harmony.save');}
function restore(){let s=null;try{s=JSON.parse(localStorage.getItem('harmony.save.manual')||localStorage.getItem('harmony.save'));}catch(e){}
 closeAll();if(!s){restart();return;}G=migrate(s);if(G.hp<=0)G.hp=Math.ceil(G.maxHp/2);updBar();loadScene(G.scene==='store'||G.scene==='clinic'?G.scene:G.scene);msg('Game restored.');}
function restart(){G=null;try{localStorage.removeItem('harmony.save');}catch(e){}titleScreen();}
function die(cause){fightStop();G.deaths++;const t=DEATH[cause]||DEATH.generic;OV.innerHTML='';modal=true;
 const d=box(`<h2>${t[0]}</h2><p>${t[1]}</p><p><b>Thank you for playing The Long Winter. Try not to do that again.</b></p><button id="dR">Restore</button><button id="dN">Restart</button>`,'death');
 d.querySelector('#dR').onclick=restore;d.querySelector('#dN').onclick=()=>{closeAll();restart();};}
const DEATH={stove:['Well Done','You grab the stovepipe. Your hand cooks to a lovely medium-rare. Sarah will tell this story at every Thanksgiving for the rest of her life, which is longer than yours.'],
 wire:['Shocking','Turns out the grid wasn\'t dead, just resting. So are you now. Permanently. The lights flicker on for one glorious second.'],
 can:['Meat?','You eat the "MEAT?". The question is answered. The answer was "no".'],
 fight:['Raided','The raider takes your boots, your jerky, and your dignity, roughly in that order.'],
 starve:['Hungry Hungry Mainer','You forgot to eat. In apple country. Impressive, really.'],generic:['You Died','Something went terribly, hilariously wrong.']};
// ---------- title / class ----------
function titleScreen(){closeAll();G=null;scene=null;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.drawImage(paintBg('farm'),0,0);
 const d=box(`<h2>THE LONG WINTER</h2><p>Harmony, Maine. Months after the grid went dark. Choose who Justin has become:</p><div class="cls">${Object.keys(CLASSES).map(k=>`<button data-c="${k}"><b>${CLASSES[k].name}</b>${CLASSES[k].blurb}</button>`).join('')}</div>
 <button id="tR">Restore saved game</button>`,'title');
 d.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{closeAll();G=newGame(b.dataset.c,rpgState&&rpgStats(rpgState));if(rpgState)applyIncoming(rpgState);updBar();loadScene(pendingScene||'farm');setVerb('walk');
  msg(`Cambridge Road, Harmony. The orchard's picked half-clean, the woodpile is shrinking, and somewhere the dog is missing. You are Justin the ${CLASSES[G.cls].name}.`);
  msg('Tip: choose a verb on the icon bar (or tap Cycle / right-click), then click the scene.');});
 d.querySelector('#tR').onclick=restore;}
// ---------- world map stub ----------
function worldMap(){closeAll();modal=true;const m=document.createElement('div');m.className='box';m.style.width='620px';
 m.innerHTML=`<div class="in"><h2>World Map (standalone stub)</h2><svg viewBox="0 0 600 360" width="100%" style="background:#c8b890;border:2px solid #6b4b2a">
 <path d="M410,0 C400,120 440,200 430,360" stroke="#4a6a8a" stroke-width="10" fill="none"/>${WORLD.map(l=>{const mk=Object.values(markers).find(q=>q.target===l.id);
 return `<g data-l="${l.id}" style="cursor:pointer"><circle cx="${l.x}" cy="${l.y}" r="${l.id==='harmony'?14:10}" fill="${mk?'#e0b020':'#6a3a1a'}" stroke="#000"/><text x="${l.x}" y="${l.y+26}" font-size="13" text-anchor="middle">${l.name}</text>${mk?`<text x="${l.x}" y="${l.y-16}" font-size="11" text-anchor="middle" fill="#802000">★ ${mk.label}</text>`:''}</g>`;}).join('')}</svg>
 <div>Click a location to travel. Click Harmony to return.</div></div>`;OV.appendChild(m);
 m.querySelectorAll('[data-l]').forEach(g=>g.onclick=()=>travel(g.dataset.l));}
function travel(id){closeAll();const st=JSON.parse(localStorage.getItem('mainerpg.handoff')||'null');if(st)applyIncoming(st);
 if(id==='harmony'){G.lastExit=null;loadScene('harmony',[60,300]);msg('You walk back into Harmony.');return;}
 G.day++;G.time='09:00';G.hunger=Math.min(95,G.hunger+25);let t=`You travel to ${WORLD.find(w=>w.id===id).name} and back. A day passes.`;
 if(id==='skow'&&qs('harmony.meds')==='away'){setQ('harmony.meds','returned');t+=' You clear the bridge (barely) and find amoxicillin behind the Redington pharmacy counter. Take it to Mira.';}
 if(id==='farm'&&['tracks','ranOff'].includes(qs('harmony.dog'))){setQ('harmony.dog','found');G.flags['harmony.gooseFound']=true;loadScene('farm');msg('Past the orchard, into the spruce, paw print by paw print... Goose! Muddy, smug, guarding a dead skunk. Walk him home to Loki.');return;}
 if(id==='farm'){loadScene('farm');msg('You head straight home to Cambridge Road.');return;}
 if(ENTRY[id]&&SCENES[ENTRY[id]]){loadScene(ENTRY[id]);msg(t.replace(' and back','')+(WORLD_MSG[id]||''));return;}
 loadScene('harmony',[60,300]);msg(t);}
const WORLD_MSG={};
// ---------- item use ----------
function useItemOn(id,o){const n=o.id;
 if(n==='loki'&&id==='apple'){take('apple');score('appleLoki',2);say('Loki','"Thanks Dad!" He eats it core and all. Kid\'s a goat.');return;}
 if(n==='cyndal'&&(id==='donut'||id==='apple')){take(id);score('snackCyndal',2);say('Cyndal','"I accept this offering." She splits it with Loki without being asked. Good kid.');return;}
 if(n==='hal'||n==='counter'){ACT.trade();return;}
 if(n==='ellen'){ACT.heal();return;}
 if(n==='school'&&(id==='jerky'||id==='junk')){ACT.fightScout(o);return;}
 if(n==='stove'&&id==='cloth'){score('stoveCloth',2);msg('You use the cloth as a potholder and adjust the damper. The stove stops smoking. Sarah nods. Nodding is high praise.');return;}
 msg(`You wave the ${ITEMS[id].name} at the ${o.name}. Nothing happens, except you look silly.`);}
// ---------- actions ----------
const ACT={
 enterHouse(){tick(30);G.hp=Math.min(G.maxHp,G.hp+8);G.stamina=100;msg('You duck inside. The wood stove is roaring, the kettle has hot cider, and you sit for a minute. (HP and stamina restored a bit.)');if(qs('harmony.firstSnow')==='wood'){setQ('harmony.firstSnow','done');score('firstSnow',5);say('Sarah','"Wood\'s in, and the snow can come when it likes. Kettle\'s on." She hands you a mug of cider.');give('cider');}},
 deathStove(){die('stove');},deathWire(){if(G.cls==='tinker'&&check('electronics',30)){score('wire',4);msg('Your Tinker instincts scream. You test it with a stick: it SPARKS. Live! Someone\'s backfeeding a generator. You flag it with a rag and save some fool\'s life. Possibly yours.');return;}die('wire');},
 deathCan(){choose('MEAT?','Eat the mystery can?',[['Eat it',()=>die('can')],['Put it down slowly',()=>msg('Wisdom. You put the can down. It seems disappointed.')]]);},
 pickApple(){if(G.flags.apples>=3){msg('You\'ve picked the low ones. The rest are deer property now.');return;}G.flags.apples=(G.flags.apples||0)+1;give('apple');tick(5);useStat('climbing');msg('You pick a Cortland. Crisp, tart, and free. The best kind of apple.');},
 woodpile(){if(qs('harmony.firstSnow')==='given'){tick(20);useStat('melee',2);useStat('trail');G.stamina=Math.max(0,G.stamina-25);setQ('harmony.firstSnow','wood');msg('You haul an armload of split maple to the porch. Your back files a formal complaint. Now take it inside.');}else msg('You restack a log. It falls off. You restack it. It stays. Victory.');},
 well(){give('water');msg('You haul up a bucket and fill a bottle. Cold enough to hurt your teeth.');},
 board(){msg('LOST: GOOSE, brown dog, ran off in the raid. Answers to "Goose" and "food". — Loki. SCHOOL: squatters in the old Harmony school, keep the kids clear. MEDICINE WANTED for Lowelltown, see Mira. FOR TRADE: one (1) slightly haunted snowblower.');if(!qs('harmony.dog'))setQ('harmony.dog','ranOff');},
 goStore(){loadScene('store');},goClinic(){loadScene('clinic');},
 shed(){if(G.flags['harmony.barnOpen']){if(qs('harmony.bike')!=='looked'){setQ('harmony.bike','looked');score('bikeLook',3);msg("Your dad's old Whizzer motor bicycle, leaning in the dark. Frame's good. No carb, no chain, seized engine, no tank, no plug, rotted back tire. A list of parts in your head. (Bike Parts continues out on the roads.)");}else msg("The Whizzer is still a frame and a dream. The parts are out on the roads.");return;}if(!qs('harmony.bike'))setQ('harmony.bike','seen');
  const opts=[];const c=G.cls;
  opts.push(['Force it (Melee)',()=>{if(check('melee',40)){openShed('You put your shoulder into it. The door gives up before your shoulder does. Barely.');}else{hurt(2);msg('You bounce off the door. The door wins this round. (-2 HP)');}}]);
  opts.push(['Pick the lock (Lockpick)',()=>{if(has('junk')&&check('lock',35)){openShed('A bent nail from your junk and some finesse. Click.');}else msg(has('junk')?'The rusted lock laughs at you.':'You need something to pick it with. Junk, maybe.');}]);
  opts.push(['Fix the hinge (Tinkering)',()=>{if(has('junk')&&check('mechanics',35)){take('junk');openShed('You rebuild the hinge from a bolt and spite. The door swings like new.');}else msg('You\'d need parts and know-how. Junk and a Tinker\'s brain.');}]);
  opts.push(['Ask Loki for the key (Speech)',()=>{if(check('speech',35)){openShed('Loki produces the key from his boot. "I was keeping it safe." From whom, he will not say.');}else say('Loki','"What key?" He is a terrible liar. He is also not giving you the key.');}]);
  choose('The Stuck Barn Door',"Your dad's old motor bike is in there. Door: stuck. Lock: rusted. Hinge: shot."+(c?` (A ${CLASSES[c].name} has a way.)`:''),opts.concat([['Leave it',()=>{}]]));},
 tradeSarah(){choose('Sarah','"Need something?" Sarah keeps the family stores.',[['Ask for jerky (2 credit)',()=>{if(G.credit>=2){G.credit-=2;give('jerky');say('Sarah','"Two credits. Family discount is: none." She smiles.');}else say('Sarah','"You\'re broke, hon. Go sell some junk to Hal."');}],['Never mind',()=>{}]]);},
 talkSarah(){const s=qs('harmony.firstSnow'),st=G.flags['story.stage'];
  if(!s){setQ('harmony.firstSnow','given');say('Sarah','"We need the place tight before the snow, and they\'ll come at night. They always do. Start with the stove: wood from the pile, into the house."');}
  else if(s!=='done')say('Sarah','"Wood. Pile. House. In that order. First snow won\'t wait on us."');
  else if(!qs('harmony.raid')){setQ('harmony.raid','warned');score('raidWarn',2);say('Sarah','"Lanterns on the ridge last night. Raid night\'s coming. When it does, we hold the gate and the walls, together."'+(st>=5?' (The farm is secured in the main game.)':''));}
  else if(!qs('harmony.school')){setQ('harmony.school','offered');say('Sarah','"Cyndal reads everything twice and Loki\'s forgetting his letters. The old Harmony school still has its library. Clear the place out first. Then we walk them down, right beside you." (School Days started.)');}
  else say('Sarah','"Somebody ought to check on the Herseys. And Mira\'s been asking after you in town."');},
 talkCyndal(){const r=qs('harmony.radio');
  if(!r){setQ('harmony.radio','offered');score('radioStart',2);say('Cyndal','"I\'ve got the old set in the loft almost working. I need three parts: a 6V6 tube, a coil of copper wire, and a lantern battery that still kicks. Hal might have a tube. The rest... Lowelltown grange, maybe." (Cyndal\'s Radio started.)');startQuestMarker(STORY.quests['harmony.radio'].marker);}
  else if(r==='tube'){setQ('harmony.radio','done');score('radioTube',8);say('Cyndal','"A 6V6! In a sock, even. That\'s one of three. I\'ll get the rest on the next run. You\'re the best, Dad." (The other parts are out in the world.)');}
  else if(qs('harmony.dog')==='found'||G.flags['story.gooseFound'])say('Cyndal','"Goose is back! Loki hasn\'t let go of him since. Don\'t tell Goose he\'s a hero, his ego is already huge."');
  else say('Cyndal','"Still need that tube. Hal hoards tubes like a dragon. A cheap dragon."');},
 talkLoki(){const d=qs('harmony.dog');
  if(!d||d==='ranOff'){setQ('harmony.dog','ranOff');score('dogStart',3);say('Loki','"Goose ran off in the raid, Dad. He never misses dinner. Can you ask around in town? Pete sees everything. Mira sees everything Pete misses." (Lost Dog started.)');}
  else if(d==='found'){setQ('harmony.dog','done');score('dogDone',15);if(!G.companions.includes('goose'))G.companions.push('goose');G.flags['harmony.gooseFound']=true;say('Loki','"GOOSE!" He hugs the dog, then you, then the dog again. Goose now follows you. He tracks game and barks at raiders.');}
  else if(d==='done')say('Loki','"Goose and me are guarding. Can I use the hatchet now?" No. "Later?" ...We\'ll see.');
  else say('Loki','"Did you find his tracks? He likes the spruce past the orchard. And skunks. Mostly skunks."');},
 talkMira(){const d=qs('harmony.dog');if(d==='ranOff'){setQ('harmony.dog','tracks');startQuestMarker(STORY.quests['harmony.dog'].marker);say('Mira','"Your dog? I saw a brown blur go past the orchard into the spruce, dear, nose down. Follow the paw prints." (Marker: Goose\'s tracks.)');return;}
  const m=qs('harmony.meds');
  if(!m){choose('Mira','"Half of Lowelltown\'s got the croup and I\'m out of everything. Redington hospital in Skowhegan had a whole pharmacy. Raiders sit on the Kennebec bridge, though."',[['I\'ll go to Skowhegan',()=>{setQ('harmony.meds','away');startQuestMarker(STORY.quests['harmony.meds'].marker);score('medsStart',2);msg('Medicine Run started. Head out to the world map: Skowhegan.');}],['Not now',()=>setQ('harmony.meds','offered')]]);}
  else if(m==='offered')ACT.talkMira2();
  else if(m==='returned'){setQ('harmony.meds','done');score('medsDone',10);give('medkit');G.credit+=10;say('Mira','"Oh, bless you. That\'ll see the little ones through. You keep one of those for yourself, hear?" (+Medkit, +10 credit)');}
  else if(m==='away')say('Mira','"Skowhegan, dear. Redington hospital. Mind the bridge."');
  else{if(!qs('harmony.garden'))setQ('harmony.garden','heard');say('Mira','"I could grow greens all winter if I had a greenhouse. Old windows, storm windows, anything with glass. Out past Ashwell." (Mira\'s Garden: in the main game.)');}},
 talkMira2(){setQ('harmony.meds',0);ACT.talkMira();},
 talkPete(){const s=qs('harmony.dog');if(s==='ranOff')say('Pete','"Dog? Brown? Went east. Or north. One of the directions. Ask Mira, she\'s got eyes like a hawk and opinions like a hawk."');
  else say('Pete','"As your mayor, sheriff, and weatherman: it\'s gonna snow. Eventually. You can quote me."');},
 talkHal(){const r=qs('harmony.radio');
  if(r==='offered'){choose('Hal','"A 6V6 tube? Might have one. In a sock. Sock\'s extra." Five credit.',[['Buy it (5 credit)',()=>{if(G.credit>=5){G.credit-=5;setQ('harmony.radio','tube');G.flags['harmony.radioTube']=true;useStat('barter');msg('You get a 6V6 tube, in a sock. Take it to Cyndal.');}else say('Hal','"Credit first."');}],['Talk him down (Speech)',()=>{if(check('speech',40)){setQ('harmony.radio','tube');G.flags['harmony.radioTube']=true;say('Hal','"Fine, fine, for Cyndal. Don\'t tell anyone I have a heart."');}else say('Hal','"Nice try."');}],['Trade instead',()=>ACT.trade()]]);}
  else ACT.trade();},
 trade(){tradeUI();},heal(){healUI();},
 fightScout(o){if(G.flags['harmony.schoolCleared']){msg('The school is clear. The library is dusty but whole. Bring the kids another day (School Days continues in the main game).');return;}
  const opts=[['Fight',()=>startFight()],['Sneak up and scare him off (Sneak)',()=>{if(check('sneak',35)){scoutGone('You creep up and whisper "boo". He drops his pipe and runs to Skowhegan without stopping.','stealth');}else{msg('You step on every leaf in Maine. He spots you!');startFight();}}],
   ['Bribe him (2 jerky)',()=>{if(take('jerky',2)||take('junk',3)){scoutGone('He takes the bribe, chews thoughtfully, and decides Harmony isn\'t worth it.','bribe');}else msg('You don\'t have enough to bribe him: 2 jerky or 3 junk.');}],
   ['Talk him down (Speech)',()=>{if(check('speech',35)){scoutGone('"The Collector pays you in what, exactly? Promises?" He thinks about it. He leaves to reconsider his career.','talk');}else{msg('"Nice try." He hefts a pipe.');startFight();}}]];
  if(G.companions.includes('goose'))opts.unshift(['Let Goose bark him off',()=>scoutGone('Goose barks like the hound of hell. The squatter reconsiders everything.','goose')]);
  choose('School Squatter','A wiry squatter in Collector colors guards the school steps, pipe in hand. School Days step 1: clear the Harmony school.',opts.concat([['Back off',()=>{}]]));}
};
function scoutGone(t,how){G.flags['harmony.schoolCleared']=how;setQ('harmony.school','cleared');score('school',8);msg(t);}
function openShed(t){G.flags['harmony.barnOpen']=true;score('barn',5);give('medkit');give('bandage',2);msg(t+" Inside: a medkit, two bandages, and your dad's old motor bike. Look it over.");}
// ---------- trade / heal ----------
function price(id,buy){const b=sk('barter')+sk('speech')/2;const p=ITEMS[id].price;return buy?Math.max(1,Math.round(p*(1.4-b/100))):Math.max(1,Math.floor(p*(0.4+b/120)));}
function tradeUI(){const stock=['medkit','bandage','jerky','donut','cider','water','meat','cloth','hide'];
 const d=box(`<h2>Hal's Trading Post — credit: ${G.credit}</h2><b>Buy</b><div class="grid">${stock.map(i=>`<div class="it" data-b="${i}">${ITEMS[i].icon}<small>${ITEMS[i].name} ${price(i,1)}c</small></div>`).join('')}</div>
 <b>Sell</b><div class="grid">${G.inventory.map(i=>`<div class="it" data-s="${i.id}">${ITEMS[i.id].icon}<small>${ITEMS[i.id].name}×${i.qty} +${price(i.id,0)}c</small></div>`).join('')}</div><button id="tX">Done</button>`,'trade');
 d.querySelectorAll('[data-b]').forEach(e=>e.onclick=()=>{const i=e.dataset.b,p=price(i,1);if(G.credit<p){closeBox(d);say('Hal','"Credit first, merchandise second. That\'s capitalism, friend."');return;}G.credit-=p;give(i);useStat('barter');score('firstTrade',2);closeBox(d);tradeUI();});
 d.querySelectorAll('[data-s]').forEach(e=>e.onclick=()=>{const i=e.dataset.s;if(take(i)){G.credit+=price(i,0);useStat('barter');score('firstTrade',2);}closeBox(d);tradeUI();});
 d.querySelector('#tX').onclick=()=>closeBox(d);}
function healUI(){const inj=Object.keys(G.injuries).filter(k=>G.injuries[k]);const cost=G.cls==='fixer'?2:4;
 const d=box(`<h2>Doc Ellen's Clinic — credit: ${G.credit}</h2><p>"HP ${Math.round(G.hp)}/${G.maxHp}. Injuries: ${inj.join(', ')||'none, miraculously'}. Lie down and stop whining."</p>
 <button id="hH">Treat wounds & injuries (${cost}c)</button><button id="hM">Buy Medkit (${price('medkit',1)}c)</button><button id="hF">Buy Jerky (${price('jerky',1)}c)</button><button id="hX">Leave</button>`,'heal');
 d.querySelector('#hH').onclick=()=>{closeBox(d);if(G.credit<cost&&G.hp>=G.maxHp*.3){say('Doc Ellen','"No credit, no care. Unless you\'re dying. You\'re not dying."');return;}G.credit=Math.max(0,G.credit-cost);G.hp=G.maxHp;for(const k in G.injuries)G.injuries[k]=false;tick(60);score('healed',2);say('Doc Ellen','"There. Good as new. Well, good as you were."');};
 const buy=(i)=>{closeBox(d);const p=price(i,1);if(G.credit<p){say('Doc Ellen','"Not enough credit."');return;}G.credit-=p;give(i);msg(`You buy a ${ITEMS[i].name}.`);};
 d.querySelector('#hM').onclick=()=>buy('medkit');d.querySelector('#hF').onclick=()=>buy('jerky');d.querySelector('#hX').onclick=()=>closeBox(d);}
// ---------- fight (QfG style) ----------
const PATTERN=[['jab','shifts his weight forward…'],['heavy','raises the pipe HIGH over his head!'],['jab','shifts his weight forward…'],['feint','twitches… and waits.'],['heavy','raises the pipe HIGH over his head!'],['jab','shifts his weight forward…']];
const SQUAT={name:'School Squatter',hp:28,winText:'The squatter drops his pipe and limps off north. The school is clear. Bring the kids another day.',onWin(){G.flags['harmony.schoolCleared']='fight';setQ('harmony.school','cleared');score('school',8);give('junk');}};
function startFight(o){o=o||SQUAT;modal=true;const f=document.createElement('div');f.id='fight';f.innerHTML=`<canvas width="640" height="320"></canvas><div class="ctl"><button data-a="attack">⚔ Attack</button><button data-a="block">🛡 Block</button><button data-a="dodge">↺ Dodge</button><button data-a="flee">Flee</button></div>`;OV.appendChild(f);
 fight={el:f,c:f.querySelector('canvas').getContext('2d'),o,ehp:o.hp,emax:o.hp,pi:0,phase:'idle',pt:0,stance:null,st:0,log:(o.intro||`${o.name} squares up.`),last:performance.now()};
 f.querySelectorAll('button').forEach(b=>b.onclick=()=>fAct(b.dataset.a));fight.raf=requestAnimationFrame(fLoop);}
function fightStop(){if(fight){cancelAnimationFrame(fight.raf);fight=null;}}
function fAct(a){if(!fight)return;if(a==='flee'){if(check('trail',25)||G.stamina>50){G.stamina-=30;fEnd(false,'You run for it. Dignity: lost. Life: kept.');}else{fight.log='You trip trying to flee!';hurt(3,'fight');}return;}
 if(fight.stance&&a!=='attack')return;const cost={attack:12,block:6,dodge:14}[a];if(G.stamina<cost){fight.log='Too winded! Catch your breath.';return;}G.stamina-=cost;
 if(a==='attack'){useStat('melee');if(fight.phase==='wind'&&fight.cur[0]==='feint'){fight.log='Waiting for that! Blocked, and smacked.';hurt(3,fight.o.death||'fight');return;}
  if(fight.phase==='wind'||Math.random()<.65){const dmg=Math.max(1,Math.round((sk('melee')/6+Math.random()*4)*(G.injuries.crippledArm?.5:1)));fight.ehp-=dmg;fight.log=`You hit for ${dmg}!`;if(fight.phase==='wind'){fight.phase='idle';fight.pt=0;fight.log+=' You interrupt his swing!';}}else fight.log='He bats your swing aside.';
  if(fight.ehp<=0)fEnd(true,fight.o.winText);}
 else{fight.stance=a;fight.st=0;useStat(a==='block'?'melee':'sneak');}}
function fEnd(win,t){const o=fight.o,el=fight.el;fightStop();el.remove();modal=!!OV.children.length;if(win&&o.onWin)o.onWin();else if(!win&&o.onFlee)o.onFlee();msg(t);}
function fLoop(now){if(!fight)return;const dt=now-fight.last;fight.last=now;fight.raf=requestAnimationFrame(fLoop);const f=fight;
 G.stamina=Math.min(100,G.stamina+dt*.012);if(f.stance){f.st+=dt;if(f.st>650)f.stance=null;}
 f.pt+=dt;if(f.phase==='idle'&&f.pt>1100){const P=f.o.pattern||PATTERN;f.cur=P[f.pi++%P.length];f.phase='wind';f.pt=0;f.log='He '+f.cur[1];}
 else if(f.phase==='wind'&&f.pt>(f.cur[0]==='heavy'?1000:750)*(f.o.speed||1)){f.phase='idle';f.pt=0;const k=f.cur[0];
  if(k==='feint')f.log='…nothing. A feint. Don\'t swing into those.';
  else{const ok=(k==='jab'&&(f.stance==='block'||f.stance==='dodge'))||(k==='heavy'&&f.stance==='dodge');const half=k==='heavy'&&f.stance==='block';
   const dmg=k==='heavy'?(f.o.heavy||8):(f.o.jab||4);if(ok)f.log=k==='heavy'?'You dodge the big swing! Counter now!':'Blocked!';else if(half){hurt(Math.ceil(dmg/2),f.o.death||'fight');f.log='You block, but the heavy blow numbs your arm.';if(Math.random()<.15)G.injuries.crippledArm=true;}else{hurt(dmg,f.o.death||'fight');f.log=`He connects for ${dmg}! (Jab: block. Heavy: dodge.)`;if(k==='heavy'&&Math.random()<.1)G.injuries.blinded=true;}}}
 if(!fight)return;const c=f.c;c.fillStyle='#2a1e14';c.fillRect(0,0,640,320);c.fillStyle='#4a3a28';c.fillRect(0,230,640,90);
 const im=SPR.ne;if(im.complete)c.drawImage(im,150+(f.stance==='dodge'?-30:0),90,80,190);if(f.stance==='block'){c.fillStyle='rgba(180,160,120,.7)';c.fillRect(220,140,14,80);}
 const ex=450,lift=f.phase==='wind'&&f.cur[0]==='heavy'?-40:0;
 c.save();c.translate(ex,270);c.fillStyle='#3a1a1a';c.fillRect(-15,-80*1.6,30,48*1.6);c.fillStyle='#d0a888';c.beginPath();c.arc(0,-150,14,0,7);c.fill();c.fillStyle='#111';c.fillRect(-14,-158,28,8);c.fillStyle='#222';c.fillRect(-14,-60,10,60);c.fillRect(4,-60,10,60);
 c.strokeStyle='#888';c.lineWidth=6;c.beginPath();c.moveTo(-15,-100);c.lineTo(-50+(f.phase==='wind'&&f.cur[0]==='jab'?20:0),-110+lift*1.5);c.stroke();c.restore();
 const bar=(x,y,v,m,col,l)=>{c.fillStyle='#000';c.fillRect(x,y,160,12);c.fillStyle=col;c.fillRect(x+1,y+1,158*Math.max(0,v)/m,10);c.fillStyle='#fff';c.font='11px monospace';c.fillText(l,x,y-3);};
 bar(20,20,G.hp,G.maxHp,'#b22','Justin HP');bar(20,48,G.stamina,100,'#2a6','Stamina');bar(460,20,f.ehp,f.emax,'#b22',fight.o.name);
 c.fillStyle='#f0e0b0';c.font='bold 15px monospace';c.textAlign='center';c.fillText(f.log,320,305);c.textAlign='left';}
// ---------- boot ----------
function fit(){const s=Math.min(innerWidth/646,innerHeight/406);$('#game').style.transform=`scale(${s})`;}addEventListener('resize',fit);fit();
function boot(){let s=null;const U=new URLSearchParams(location.search),p=U.get('state');const ps=U.get('scene')||ENTRY[U.get('town')];if(ps&&SCENES[ps])pendingScene=ps;
 if(p){try{s=JSON.parse(decodeURIComponent(escape(atob(p))));}catch(e){}}
 if(!s&&!EMBED){try{s=JSON.parse(localStorage.getItem('mainerpg.handoff')||'null');}catch(e){}}
 if(s)fromTownState(s);
 if(!G&&!s&&!EMBED){try{const sv=JSON.parse(localStorage.getItem('harmony.save')||'null');if(sv&&sv.cls)G=migrate(sv);}catch(e){}}
 if(G){updBar();loadScene(pendingScene||G.scene||'farm');setVerb('walk');}else titleScreen();
 post({type:'ready',town:'harmony'});requestAnimationFrame(frame);}
window.HARMONY={get state(){return G;},toTownState,leave,die,worldMap,travel,ACT,loadScene,startFight};
if(window.ACTS_EXT)window.ACTS_EXT({ACT,DEATH,PAINT,NPC_SHOW,SCENES,NPCS,WORLD,G:()=>G,msg,say,choose,check,score,setQ,qs,give,take,has,die,hurt,loadScene,startFight,startQuestMarker,leave,useStat,sk,tick,toast,act,save:()=>autosave(),WORLD_MSG,ITEMS,blob,grad,pine,tree,house,W,H});
boot();})();
