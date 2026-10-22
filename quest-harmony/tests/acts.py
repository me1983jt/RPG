import json
from playwright.sync_api import sync_playwright
B='http://localhost:8799/quest-harmony/';S='/workspace/quest-harmony/shots/';errs=[]
def cont(t,n=12):
    for _ in range(n):
        m=t.locator('.box.msg')
        if m.count()==0:return
        m.first.click(force=True);t.wait_for_timeout(60)
def pick(t,txt):t.locator('.box.choice button',has_text=txt).first.click();t.wait_for_timeout(80)
def cc(p,t,x,y):
    b=t.locator('#cv').bounding_box();p.mouse.click(b['x']+x*b['width']/640,b['y']+y*b['height']/360)
def ev(t,js):return t.evaluate(js)
def run(p,t,tag):
    sh=lambda n:p.screenshot(path=S+n.replace('X',tag)+'.png')
    t.wait_for_selector('[data-c]');t.locator('[data-c=tinker]').click();cont(t)
    ev(t,"(()=>{const G=HARMONY.state;for(const k in G.stats)G.stats[k]=10;G.localAct=2;[['meat',1],['cider',1],['cloth',3],['junk',6],['jerky',3]].forEach(([id,n])=>{const e=G.inventory.find(i=>i.id===id);e?e.qty+=n:G.inventory.push({id,qty:n});});Math.random=()=>0.01;})()")
    # ACT 2
    t.locator('[data-verb=hand]').click();cc(p,t,120,114);t.wait_for_timeout(200);sh('act2_X_loft_scene')
    cc(p,t,460,90);t.wait_for_timeout(100);sh('act2_X_antenna_puzzle');pick(t,'dipole');cont(t)
    cc(p,t,270,160);t.wait_for_timeout(100);sh('act2_X_signal_dialog');cont(t)
    cc(p,t,400,225);pick(t,'Lick');t.wait_for_selector('.death');sh('act2_X_death_battery');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.loadScene('harmony')");cc(p,t,290,80);t.wait_for_timeout(150);cont(t);sh('act2_X_meeting_scene')
    t.locator('[data-verb=talk]').click();cc(p,t,330,230);t.wait_for_timeout(100);sh('act2_X_debate_choice');pick(t,'tape');cont(t)
    ev(t,"HARMONY.ACT.coffee()");pick(t,'Drink');sh('act2_X_death_coffee');t.locator('#dR').click();cont(t)
    a2=ev(t,"JSON.stringify([HARMONY.state.q['harmony.signal'],HARMONY.state.flags['harmony.signalVerdict'],HARMONY.state.localAct])")
    # ACT 3
    ev(t,"HARMONY.loadScene('bunkerOut')");t.wait_for_timeout(150);sh('act3_X_bunker_ridge')
    t.locator('[data-verb=hand]').click();cc(p,t,300,280);t.wait_for_timeout(100);sh('act3_X_tripwire_puzzle');pick(t,'Disarm');cont(t)
    cc(p,t,200,280);cont(t)  # dog meat
    t.locator('[data-verb=talk]').click();cc(p,t,400,230);t.wait_for_timeout(100);sh('act3_X_jack_talk');pick(t,'Give Hot Cider');cont(t)
    ev(t,"HARMONY.ACT.matStep()");pick(t,'Wipe');sh('act3_X_death_mat');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.ACT.hatch()");cont(t);t.wait_for_timeout(150);sh('act3_X_bunker_inside')
    ev(t,"HARMONY.ACT.generator()");cont(t);ev(t,"HARMONY.ACT.shortwave()");cont(t)
    ev(t,"HARMONY.ACT.maps()");t.wait_for_timeout(100);sh('act3_X_maps_dialog');cont(t)
    ev(t,"HARMONY.ACT.button()");pick(t,'Press');sh('act3_X_death_button');t.locator('#dR').click();cont(t)
    a3=ev(t,"JSON.stringify([HARMONY.state.q['harmony.jack'],HARMONY.state.flags['harmony.jackTrust'],HARMONY.state.localAct])")
    # ACT 4
    ev(t,"HARMONY.loadScene('river')");t.wait_for_timeout(150);sh('act4_X_ferry_landing')
    for f in ['planks()','ferry()']:ev(t,"HARMONY.ACT."+f);cont(t)
    ev(t,"HARMONY.ACT.winch()");sh('act4_X_winch_puzzle');pick(t,'pawl');cont(t);ev(t,"HARMONY.ACT.ferry()");cont(t)
    ev(t,"HARMONY.ACT.swim()");pick(t,'Dive');sh('act4_X_death_swim');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.loadScene('bridge')");t.wait_for_timeout(150);sh('act4_X_bridge_scene')
    ev(t,"HARMONY.ACT.bridgeBoss()");sh('act4_X_bridge_choice');pick(t,'Fight Fur');t.wait_for_timeout(1300);sh('act4_X_fight_fur');t.locator('#fight [data-a=flee]').click();cont(t)
    ev(t,"HARMONY.ACT.unmask()");pick(t,'Yank');sh('act4_X_death_mask');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.loadScene('bridge')");ev(t,"HARMONY.ACT.siren()");cont(t)
    ev(t,"HARMONY.loadScene('marcel')");t.wait_for_timeout(150);sh('act4_X_marcel_store');ev(t,"HARMONY.ACT.talkMarcel()");sh('act4_X_marcel_dialog');cont(t);ev(t,"HARMONY.ACT.talkMarcel()");cont(t)
    a4=ev(t,"JSON.stringify([HARMONY.state.q['harmony.ferry'],HARMONY.state.q['harmony.bridge'],HARMONY.state.q['harmony.marcel'],HARMONY.state.localAct])")
    # ACT 5
    ev(t,"HARMONY.loadScene('camp_gravel')");t.wait_for_timeout(150);sh('act5_X_camp_gravel')
    ev(t,"HARMONY.ACT.lieutenant('saw')");sh('act5_X_lieutenant_choice');pick(t,'flare');cont(t)
    ev(t,"HARMONY.ACT.cage()");pick(t,'Pick');cont(t)
    ev(t,"HARMONY.ACT.campfire()");pick(t,'Stroll');sh('act5_X_death_campfire');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.loadScene('camp_holeb')");t.wait_for_timeout(150);sh('act5_X_camp_holeb');ev(t,"HARMONY.ACT.lieutenant('hole')");pick(t,'Fight Hole');t.wait_for_timeout(1500);sh('act5_X_fight_hole');t.locator('#fight [data-a=flee]').click();cont(t)
    ev(t,"HARMONY.ACT.lieutenant('hole')");pick(t,'Sneak');cont(t)
    ev(t,"HARMONY.loadScene('camp_mill')");t.wait_for_timeout(150);sh('act5_X_camp_mill');ev(t,"HARMONY.ACT.lieutenant('mask2')");pick(t,'ledger');cont(t)
    ev(t,"HARMONY.loadScene('harmony')");t.wait_for_timeout(150);sh('act5_X_collector_in_harmony');ev(t,"HARMONY.ACT.collector()");sh('act5_X_collector_choice');pick(t,'paperwork');cont(t)
    ev(t,"HARMONY.ACT.chair()");pick(t,'Sit');sh('act5_X_death_chair');t.locator('#dR').click();cont(t)
    a5=ev(t,"JSON.stringify([HARMONY.state.q['harmony.ltGravel'],HARMONY.state.q['harmony.ltHoleb'],HARMONY.state.q['harmony.ltMill'],HARMONY.state.q['harmony.collector'],HARMONY.state.flags['harmony.prisoners'],HARMONY.state.localAct,HARMONY.state.score])")
    print(tag,'A2',a2,'A3',a3,'A4',a4,'A5',a5)
with sync_playwright() as pw:
    br=pw.chromium.launch(executable_path='/usr/bin/google-chrome')
    p=br.new_page(viewport={'width':1280,'height':800});p.on('console',lambda m:m.type=='error' and errs.append(m.text));p.on('pageerror',lambda e:errs.append(str(e)))
    p.goto(B+'index.html');p.evaluate('localStorage.clear()');p.reload();run(p,p,'desk')
    # entry ?scene=
    p2=br.new_page(viewport={'width':1280,'height':800});p2.on('pageerror',lambda e:errs.append(str(e)));p2.goto(B+'index.html?scene=bunkerOut');p2.wait_for_timeout(400);print('scene param ->',p2.evaluate("HARMONY.state&&HARMONY.state.scene"))
    c=br.new_context(viewport={'width':915,'height':412},has_touch=True,is_mobile=True);m=c.new_page()
    m.on('console',lambda x:x.type=='error' and errs.append('touch '+x.text));m.on('pageerror',lambda e:errs.append('touch '+str(e)))
    m.goto(B+'tests/parent.html');m.frame_locator('#f').locator('[data-c]').first.wait_for();fr=m.frames[1];fr.evaluate('localStorage.clear()')
    run(m,fr,'touch')
    fr.evaluate("HARMONY.leave('worldmap')");m.wait_for_timeout(200);lt=[x for x in m.evaluate('log') if x['type']=='leaveTown'][-1]
    qf=lt['state']['questFlags'];print('leave flags',{k:v for k,v in qf.items() if not k.startswith('harmony.jt.') and not k.startswith('harmony.mt.')})
    print('markers',[(x['id'],x['target']) for x in m.evaluate('log') if x['type']=='startQuest'])
    m.evaluate("s=>sendEnter(s)",{**lt['state'],'questFlags':{**qf,'story.act':3}});m.wait_for_timeout(200)
    m.evaluate("()=>document.getElementById('f').contentWindow.postMessage({type:'enterTown',protocol:1,town:'bunker',state:{questFlags:{'story.act':3,'story.jackLoyal':12}}},'*')");m.wait_for_timeout(300)
    print('enter bunker ->',fr.evaluate("HARMONY.state.scene"));m.screenshot(path=S+'act3_touch_entry_town_bunker.png')
    br.close()
print('ERRORS',errs)
