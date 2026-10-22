from playwright.sync_api import sync_playwright
B='http://localhost:8799/quest-harmony/';S='/workspace/quest-harmony/shots/';errs=[]
def cont(t,n=14):
    for _ in range(n):
        m=t.locator('.box.msg')
        if m.count()==0:return
        m.first.click(force=True);t.wait_for_timeout(50)
def pick(t,txt):t.locator('.box.choice button',has_text=txt).first.click();t.wait_for_timeout(80)
def ev(t,js):return t.evaluate(js)
RAND=lambda t,v:ev(t,f"Math.random=()=>{v}")
def run(p,t,tag):
    sh=lambda n:p.screenshot(path=S+n.replace('X',tag)+'.png')
    t.wait_for_selector('[data-c]');t.locator('[data-c=woodsman]').click();cont(t)
    ev(t,"(()=>{const G=HARMONY.state;for(const k in G.stats)G.stats[k]=6;G.localAct=6;[['apple',4],['junk',3]].forEach(([id,n])=>{const e=G.inventory.find(i=>i.id===id);e?e.qty+=n:G.inventory.push({id,qty:n});});G.flags['harmony.signalVerdict']='trap';G.companions=G.companions.filter(c=>c!=='goose');})()")
    fails=[]
    # FAIL branches
    RAND(t,0.99)
    ev(t,"HARMONY.loadScene('loft')");ev(t,"HARMONY.ACT.antenna()");pick(t,'Climb');fails.append(ev(t,"document.querySelector('.box.msg').innerText.slice(0,60)"));cont(t)
    ev(t,"HARMONY.loadScene('grokwoods')");t.wait_for_timeout(150);sh('act6_X_grokwoods_scene')
    ev(t,"HARMONY.ACT.scrape()");fails.append(ev(t,"document.querySelector('.box.msg').innerText.slice(0,60)"));cont(t)
    ev(t,"HARMONY.ACT.tracks()");cont(t);t.wait_for_timeout(100);sh('act6_X_grok_visible')
    ev(t,"HARMONY.ACT.grok()");sh('act6_X_grok_choice');pick(t,'Sneak');fails.append(ev(t,"document.querySelector('.box.msg')?document.querySelector('.box.msg').innerText.slice(0,60):'fight'"));cont(t,1);t.wait_for_timeout(1600);sh('act6_X_fight_grok')
    RAND(t,0.01);t.locator('#fight [data-a=flee]').click();cont(t)
    ev(t,"HARMONY.ACT.flowage()");pick(t,'Walk the bottom');sh('act6_X_death_flowage');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.loadScene('grokwoods')");ev(t,"HARMONY.ACT.grok()");pick(t,'apples');cont(t)
    ev(t,"HARMONY.ACT.grokTouch()");pick(t,'Hug');sh('act6_X_death_grokhug');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.ACT.wolves()");pick(t,'Drive');cont(t)
    ev(t,"HARMONY.loadScene('depot')");t.wait_for_timeout(150);sh('act6_X_depot_scene')
    ev(t,"HARMONY.ACT.guard()");sh('act6_X_guard_choice');pick(t,'Shift');cont(t)
    ev(t,"HARMONY.ACT.crates()");pick(t,'Sniff');sh('act6_X_death_ether');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.loadScene('depot')");ev(t,"HARMONY.ACT.ledger()");pick(t,'Take it');cont(t);ev(t,"HARMONY.ACT.depotFate()");sh('act6_X_depot_fuel_choice');pick(t,'Share');cont(t)
    a6=ev(t,"JSON.stringify([HARMONY.state.q['harmony.grok'],HARMONY.state.q['harmony.wolves'],HARMONY.state.q['harmony.depot'],HARMONY.state.flags['harmony.grokFriend'],HARMONY.state.localAct])")
    # ACT 7
    ev(t,"HARMONY.loadScene('farm')");ev(t,"HARMONY.ACT.enterHouse()");t.wait_for_timeout(150);cont(t);sh('act7_X_kitchen_scene')
    ev(t,"HARMONY.ACT.decide()");cont(t)
    for w in ['Sarah','Cyndal','Loki']:ev(t,f"HARMONY.ACT.talk{w}()");
    t.wait_for_timeout(60);sh('act7_X_family_dialog');cont(t)
    ev(t,"HARMONY.ACT.carryStove()");pick(t,'Lift');sh('act7_X_death_stove');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.ACT.decide()");sh('act7_X_decision_choice');pick(t,'calm');sh('act7_X_death_calmdown');t.locator('#dR').click();cont(t)
    ev(t,"HARMONY.ACT.decide()");pick(t,'Unite');cont(t,1);t.wait_for_timeout(80);sh('act7_X_stay_or_north');pick(t,'north');cont(t)
    a7=ev(t,"JSON.stringify([HARMONY.state.q['harmony.choice'],HARMONY.state.flags['harmony.family'],HARMONY.state.flags['harmony.support'],HARMONY.state.flags['harmony.uniteHow'],HARMONY.state.localAct,HARMONY.state.score])")
    print(tag,'FAILS',fails,'\n A6',a6,'A7',a7)
with sync_playwright() as pw:
    br=pw.chromium.launch(executable_path='/usr/bin/google-chrome')
    p=br.new_page(viewport={'width':1280,'height':800});p.on('console',lambda m:m.type=='error' and errs.append(m.text));p.on('pageerror',lambda e:errs.append(str(e)))
    p.goto(B+'index.html');p.evaluate('localStorage.clear()');p.reload();run(p,p,'desk')
    c=br.new_context(viewport={'width':915,'height':412},has_touch=True,is_mobile=True);m=c.new_page()
    m.on('console',lambda x:x.type=='error' and errs.append('touch '+x.text));m.on('pageerror',lambda e:errs.append('touch '+str(e)))
    m.goto(B+'tests/parent.html');m.frame_locator('#f').locator('[data-c]').first.wait_for();fr=m.frames[1];fr.evaluate('localStorage.clear()')
    run(m,fr,'touch')
    fr.evaluate("HARMONY.leave('farm')");m.wait_for_timeout(200);log=m.evaluate('log');lt=[x for x in log if x['type']=='leaveTown'][-1]
    print('leave exit',lt['exit'],{k:v for k,v in lt['state']['questFlags'].items() if any(s in k for s in ['grok','wolves','depot','ledger','choice','family','support','unite','deal','act'])})
    print('markers',[(x['id'],x['target']) for x in log if x['type']=='startQuest'])
    m.evaluate("()=>document.getElementById('f').contentWindow.postMessage({type:'enterTown',protocol:1,town:'grokwoods',state:{questFlags:{'story.act':6}}},'*')");m.wait_for_timeout(300)
    print('enter grokwoods ->',fr.evaluate("HARMONY.state.scene"));m.screenshot(path=S+'act6_touch_entry_town_grokwoods.png')
    m.evaluate("()=>document.getElementById('f').contentWindow.postMessage({type:'enterTown',protocol:1,town:'depot',state:{}},'*')");m.wait_for_timeout(300);print('enter depot ->',fr.evaluate("HARMONY.state.scene"))
    br.close()
print('ERRORS',errs)
