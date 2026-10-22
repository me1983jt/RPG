import json,base64,sys
from playwright.sync_api import sync_playwright
B='http://localhost:8799/quest-harmony/'; S='/workspace/quest-harmony/shots/'
errs=[]
def L(p,tag):
    p.on('console',lambda m: m.type=='error' and errs.append(f'{tag}: {m.text}'))
    p.on('pageerror',lambda e: errs.append(f'{tag}: {e}'))
def cc(p,x,y,fr=None):
    t=fr or p; b=t.locator('#cv').bounding_box(); 
    t.locator('#cv').click(position={'x':x*b['width']/640,'y':y*b['height']/360},force=True)
def cont(t,n=6):
    for _ in range(n):
        m=t.locator('.box.msg')
        if m.count()==0: return
        m.first.click(force=True); t.wait_for_timeout(80)
def verb(t,v): t.locator(f'[data-verb={v}]').click()
def run(p,tag,fr=None):
    t=fr or p; sh=lambda n: p.screenshot(path=S+f'{tag}_{n}.png')
    t.wait_for_selector('[data-c]'); sh('01_title_classselect')
    t.locator('[data-c=scrounger]').click(); t.wait_for_timeout(300); sh('02_farm_intro_dialog'); cont(t)
    sh('03_scene_farm_iconbar')
    verb(t,'talk'); cc(p,220,250,fr); t.wait_for_timeout(200); sh('04_dialog_sarah'); cont(t)
    cc(p,480,295,fr); cont(t)  # loki lost dog
    cc(p,400,280,fr); cont(t)  # cyndal radio
    verb(t,'look'); cc(p,450,150,fr); cont(t)
    verb(t,'hand'); cc(p,300,200,fr); t.wait_for_timeout(150); sh('05_shed_puzzle'); t.locator('.box.choice button',has_text='Pick').click(); cont(t)
    t.locator('#btnInv').click(); sh('06_inventory'); t.locator('#iX').click()
    t.locator('#btnStats').click(); sh('07_stats'); t.locator('.stats button').click()
    t.locator('#btnMenu').click(); sh('08_game_menu'); t.locator('#mX').click()
    t.locator('#btnCycle').click(); t.locator('#btnCycle').click()
    t.evaluate("HARMONY.loadScene('harmony')"); t.wait_for_timeout(200); sh('09_scene_harmony')
    verb(t,'talk'); cc(p,190,250,fr); cont(t)  # mira dog tracks
    cc(p,190,250,fr); t.wait_for_timeout(150); sh('09b_mira_meds'); t.locator('.box.choice button',has_text='Skowhegan').click(); cont(t)
    t.evaluate("HARMONY.loadScene('store')"); t.wait_for_timeout(200); sh('10_scene_store')
    cc(p,320,200,fr); t.wait_for_timeout(150); t.locator('.box.choice button',has_text='Buy it').click(); cont(t)
    verb(t,'hand'); cc(p,320,220,fr); t.wait_for_selector('.trade'); t.locator('[data-s=junk]').click(); t.locator('[data-b=water]').click(); sh('11_trade'); t.locator('#tX').click(); cont(t)
    t.evaluate("HARMONY.loadScene('clinic')"); t.wait_for_timeout(200); sh('12_scene_clinic')
    cc(p,380,250,fr); t.wait_for_selector('.heal'); sh('13_heal'); t.locator('#hH').click(); cont(t)
    t.evaluate("HARMONY.loadScene('harmony')"); verb(t,'hand'); cc(p,620,200,fr); t.locator('.box.choice button',has_text='Fight').click()
    t.wait_for_timeout(1500); sh('14_fight'); t.locator('#fight [data-a=attack]').click(); t.wait_for_timeout(300); t.locator('#fight [data-a=flee]').click(); cont(t)
    cc(p,380,180,fr) # hand on wire -> death (scrounger)
    t.wait_for_selector('.death'); sh('15_death'); t.locator('#dR').click(); cont(t)
    return t
with sync_playwright() as pw:
    br=pw.chromium.launch(executable_path='/usr/bin/google-chrome')
    # desktop standalone
    p=br.new_page(viewport={'width':1280,'height':800}); L(p,'desk'); p.goto(B+'index.html'); p.evaluate('localStorage.clear()'); p.reload()
    t=run(p,'desk')
    t.evaluate("HARMONY.leave('worldmap')"); p.wait_for_timeout(200); p.screenshot(path=S+'desk_16_worldmap_stub.png')
    ho=json.loads(p.evaluate("localStorage.getItem('mainerpg.handoff')")); print('handoff exit',ho['exit'],ho['questFlags'])
    p.locator('[data-l=skow]').click(); cont(p); verb(p,'talk'); cc(p,190,250); p.wait_for_timeout(100); p.screenshot(path=S+'desk_17_meds_return.png'); cont(p)
    p.locator('#btnMenu').click(); p.locator('#mL').click(); p.locator('[data-l=farm]').click(); cont(p); verb(p,'talk'); cc(p,480,295); cont(p)
    print('dog',p.evaluate("HARMONY.state.q['harmony.dog']"),'radio',p.evaluate("HARMONY.state.q['harmony.radio']"))
    print('meds stage',p.evaluate("HARMONY.state.q['harmony.meds']"),'score',p.evaluate("HARMONY.state.score"))
    # ?state= handoff
    st=base64.b64encode(json.dumps({**ho,'hp':5}).encode()).decode()
    p2=br.new_page(viewport={'width':1280,'height':800}); L(p2,'qs'); p2.goto(B+'index.html?state='+st); p2.wait_for_timeout(400)
    print('qs hp',p2.evaluate("HARMONY.state&&HARMONY.state.hp"))
    # touch embedded
    ctxm=br.new_context(viewport={'width':915,'height':412},has_touch=True,is_mobile=True); m=ctxm.new_page(); L(m,'touch')
    m.goto(B+'tests/parent.html'); fr=m.frame_locator('#f'); fr.locator('[data-c]').first.wait_for()
    fr2=m.frames[1]; fr2.evaluate('localStorage.clear()')
    m.evaluate("sendEnter()")
    t=run(m,'touch',fr2)
    print('touch stats',fr2.evaluate('JSON.stringify(HARMONY.state.stats)'));print('touch hp after enter (expect from state)',fr2.evaluate("HARMONY.state.hp"),fr2.evaluate("JSON.stringify(HARMONY.state.injuries)"))
    fr2.evaluate("HARMONY.leave('north')"); m.wait_for_timeout(200)
    log=m.evaluate("log"); print('parent got',[ (x['type'],x.get('exit'),x.get('id')) for x in log])
    lt=[x for x in log if x['type']=='leaveTown'][0]; print('leave state keys',list(lt['state'].keys()), lt['state']['inventory'][:3], lt['state']['injuries'])
    # re-enter with returned extra
    m.evaluate("s=>sendEnter(s)",{**lt['state'],'day':5}); m.wait_for_timeout(300); m.screenshot(path=S+'touch_18_reentered.png')
    print('reenter class',fr2.evaluate("HARMONY.state.cls"),'meds',fr2.evaluate("HARMONY.state.q['harmony.meds']"))
    br.close()
print('ERRORS',errs)
