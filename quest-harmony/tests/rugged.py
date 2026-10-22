from playwright.sync_api import sync_playwright
S='/workspace/quest-harmony/shots/rugged_';errs=[]
with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/google-chrome')
  for tag,vp,touch in [('desk',{'width':1280,'height':800},False),('touch',{'width':915,'height':412},True)]:
    c=b.new_context(viewport=vp,has_touch=touch,is_mobile=touch);p=c.new_page()
    p.on('console',lambda m:m.type=='error' and errs.append(m.text));p.on('pageerror',lambda e:errs.append(str(e)))
    p.goto('http://localhost:8799/quest-harmony/index.html');p.evaluate('localStorage.clear()');p.reload();p.wait_for_selector('[data-c]')
    sh=lambda n:p.screenshot(path=S+f'{tag}_{n}.png')
    sh('class_select');p.click('[data-c=fixer]');p.wait_for_timeout(200);sh('dialog')
    while p.locator('.box.msg').count():p.locator('.box.msg').first.click()
    sh('iconbar')
    p.click('#btnInv');sh('inventory');p.click('#iX');p.click('#btnStats');sh('stats');p.click('.stats button')
    p.click('#btnMenu');sh('game_menu');p.click('#mX')
    p.evaluate("HARMONY.ACT.trade()");sh('trade');p.click('#tX')
    p.evaluate("HARMONY.ACT.heal()");sh('heal');p.click('#hX')
    p.evaluate("HARMONY.ACT.fightScout({})");sh('choice');p.locator('.box.choice button',has_text='Back off').click()
    p.evaluate("HARMONY.die('stove')");sh('death');p.click('#dN')
    c.close()
  b.close()
print('ERRORS',errs)
