"""v14 stand-in art: soft painted props at real scale (2x world px). Grok Build can replace these files."""
from PIL import Image, ImageDraw, ImageFilter
import random, json, os
OUT='/workspace/maine-rpg/v11/public/game/v14/'; S=2; info={}
def canvas(w,h): return Image.new('RGBA',(w*S,h*S),(0,0,0,0))
def soft(im): 
    a=im.filter(ImageFilter.GaussianBlur(0.8)); return a
def save(n,im):
    im=soft(im); im.save(OUT+n+'.png'); info[n]=im.size
def shade(c,f): return tuple(max(0,min(255,int(v*f))) for v in c[:3])+(255,)
R=random.Random(14)
# wall segment: runs from (-32,-16) to (+32,+16) about the ground point; height H ft*11
def wall(n,H,mat,broken=0.0,gate=False):
    W=80; top=H+8; h=top+40; im=canvas(W,h); d=ImageDraw.Draw(im)
    gx,gy=W/2,top+20  # ground point (tile center)
    steps=9 if mat=='wood' else 7
    for i in range(steps):
        t=i/(steps-1)-.5
        x=gx+t*64; y=gy+t*32
        if broken and R.random()<broken: hh=H*R.uniform(.2,.45)
        else: hh=H*R.uniform(.92,1.0)
        if mat=='wood':
            c=shade((122,88,56),R.uniform(.8,1.15)); wd=7
            d.polygon([( (x-wd/2)*S,y*S),((x+wd/2)*S,(y+2)*S),((x+wd/2)*S,(y-hh+4)*S),(x*S,(y-hh-4)*S),((x-wd/2)*S,(y-hh+4)*S)],fill=c)
            d.line([((x-wd/2+1)*S,y*S),((x-wd/2+1)*S,(y-hh+4)*S)],fill=shade(c,1.3),width=2)
        elif mat=='stone':
            for k in range(int(hh//9)):
                c=shade((128,124,116),R.uniform(.8,1.2)); yy=y-k*9
                d.rounded_rectangle([(x-5)*S,(yy-9)*S,(x+5)*S,yy*S],radius=4,fill=c,outline=shade(c,.7))
        else:
            c=shade((104,110,116),R.uniform(.85,1.1))
            d.polygon([((x-5)*S,y*S),((x+5)*S,(y+2)*S),((x+5)*S,(y-hh+2)*S),((x-5)*S,(y-hh)*S)],fill=c,outline=shade(c,.6))
            for r in range(3): d.ellipse([(x-1)*S,(y-hh*(r+1)/4-1)*S,(x+1)*S,(y-hh*(r+1)/4+1)*S],fill=(60,52,48,255))
    if gate:
        # cross brace / plank door on the middle
        c=(150,112,70,255) if mat=='wood' else (90,94,100,255) if mat=='metal' else (110,84,56,255)
        d.polygon([((gx-18)*S,(gy-9)*S),((gx+18)*S,(gy+9)*S),((gx+18)*S,(gy+9-H*.8)*S),((gx-18)*S,(gy-9-H*.8)*S)],fill=c,outline=shade(c,.6))
        d.line([((gx-18)*S,(gy-9)*S),((gx+18)*S,(gy+9-H*.8)*S)],fill=shade(c,.65),width=5)
    save(n,im); return (gx/W, 1-(gy+0)/h)
anch={}
H=77
for m in ['wood','stone','metal']:
    anch['wall-'+m]=wall('wall-'+m,H,m); anch['wall-'+m+'-dmg']=wall('wall-'+m+'-dmg',H,m,.45)
    anch['gate-'+m]=wall('gate-'+m,H+4,m,gate=True); anch['gate-'+m+'-dmg']=wall('gate-'+m+'-dmg',H+4,m,.4,gate=True)
anch['wall-x']=wall('wall-x',30,'wood',1.0)
def blob(n,w,h,fn):
    im=canvas(w,h); d=ImageDraw.Draw(im); fn(d,w,h); save(n,im); anch[n]=(.5,.06)
def spikes(d,w,h):
    for i in range(14):
        x=R.uniform(6,w-6); y=R.uniform(h-12,h-3); c=shade((140,108,70),R.uniform(.8,1.2))
        d.polygon([((x-2)*S,y*S),((x+2)*S,y*S),((x+R.uniform(-3,3))*S,(y-R.uniform(14,22))*S)],fill=c)
    d.ellipse([4*S,(h-8)*S,(w-4)*S,(h-1)*S],outline=(90,70,50,180),width=2)
blob('spikes',60,26,spikes)
def chest(d,w,h):
    d.rectangle([6*S,10*S,(w-6)*S,(h-2)*S],fill=(118,82,50,255),outline=(70,46,28,255),width=2)
    d.pieslice([6*S,2*S,(w-6)*S,18*S],180,360,fill=(134,94,58,255),outline=(70,46,28,255),width=2)
    d.rectangle([(w/2-3)*S,12*S,(w/2+3)*S,18*S],fill=(180,160,90,255))
blob('chest',44,30,chest)
def barrel(d,w,h):
    d.rounded_rectangle([6*S,4*S,(w-6)*S,(h-2)*S],radius=10,fill=(96,72,48,255),outline=(60,44,30,255),width=2)
    for y in (10,h-10): d.line([6*S,y*S,(w-6)*S,y*S],fill=(70,70,74,255),width=3)
    d.ellipse([7*S,2*S,(w-7)*S,9*S],fill=(80,110,130,255))
blob('rainbarrel',34,42,barrel)
def sand(broken):
    def f(d,w,h):
        rows=1 if broken else 3
        for r in range(rows):
            for i in range(4-r%2):
                x=8+i*12+(r%2)*6; y=h-3-r*9
                d.rounded_rectangle([(x-7)*S,(y-9)*S,(x+7)*S,y*S],radius=5,fill=shade((168,148,104),R.uniform(.85,1.1)),outline=(110,94,62,255))
    return f
blob('sandbags',60,34,sand(False)); blob('sandbags-x',60,18,sand(True))
def bench(d,w,h):
    d.rectangle([4*S,12*S,(w-4)*S,18*S],fill=(140,100,60,255),outline=(80,56,34,255),width=2)
    for x in (8,w-10): d.rectangle([x*S,18*S,(x+4)*S,(h-1)*S],fill=(100,70,44,255))
    d.rectangle([12*S,4*S,22*S,12*S],fill=(80,84,90,255)); d.line([30*S,10*S,44*S,6*S],fill=(160,160,166,255),width=4)
blob('workbench',64,46,bench)
def wreck(d,w,h):
    d.polygon([(6*S,(h-14)*S),(w*.3*S,(h-30)*S),(w*.62*S,(h-30)*S),(w*.72*S,(h-20)*S),((w-4)*S,(h-18)*S),((w-6)*S,(h-6)*S),(8*S,(h-4)*S)],fill=(120,64,48,255),outline=(60,34,26,255))
    d.polygon([(w*.34*S,(h-28)*S),(w*.6*S,(h-28)*S),(w*.66*S,(h-20)*S),(w*.3*S,(h-20)*S)],fill=(60,70,80,255))
    for x in (w*.22,w*.8): d.ellipse([(x-9)*S,(h-14)*S,(x+9)*S,(h)*S],fill=(30,28,28,255))
    for i in range(30): x=R.uniform(10,w-10); y=R.uniform(h-26,h-8); d.point((x*S,y*S),fill=(160,90,50,255))
blob('wreck',150,62,wreck)
def ring(lit):
    def f(d,w,h):
        for i in range(9):
            import math; a=i/9*6.28; x=w/2+math.cos(a)*12; y=h-8+math.sin(a)*5
            d.ellipse([(x-4)*S,(y-3)*S,(x+4)*S,(y+3)*S],fill=shade((120,118,112),R.uniform(.8,1.2)))
        d.line([(w/2-8)*S,(h-9)*S,(w/2+8)*S,(h-6)*S],fill=(60,40,28,255),width=5)
        if lit: d.ellipse([(w/2-6)*S,(h-22)*S,(w/2+6)*S,(h-6)*S],fill=(240,150,50,230))
    return f
blob('firering',36,24,ring(False)); blob('firering-lit',36,30,ring(True))
def stash(d,w,h):
    d.rounded_rectangle([4*S,6*S,(w-4)*S,(h-1)*S],radius=8,fill=(84,96,62,255),outline=(48,56,34,255),width=2)
    d.line([10*S,8*S,(w-10)*S,8*S],fill=(40,40,30,255),width=3)
blob('stash',34,20,stash)
def sign(d,w,h):
    d.rectangle([(w/2-2)*S,10*S,(w/2+2)*S,(h-1)*S],fill=(100,72,44,255))
    d.polygon([(4*S,6*S),((w-10)*S,6*S),((w-2)*S,13*S),((w-10)*S,20*S),(4*S,20*S)],fill=(170,140,96,255),outline=(90,66,40,255))
    d.line([8*S,13*S,(w-14)*S,13*S],fill=(70,40,30,255),width=2)
blob('sign-farm',40,66,sign)
def lookout(broken):
    def f(d,w,h):
        for x in (8,w-8): d.line([x*S,(h-1)*S,(x+(6 if x<w/2 else -6))*S,30*S],fill=(110,80,50,255),width=6)
        if not broken:
            d.rectangle([4*S,22*S,(w-4)*S,32*S],fill=(130,96,60,255),outline=(70,50,30,255),width=2)
            d.rectangle([4*S,8*S,(w-4)*S,22*S],outline=(110,80,50,255),width=3)
        else: d.polygon([(4*S,40*S),((w-4)*S,30*S),((w-6)*S,36*S),(6*S,46*S)],fill=(120,88,56,255))
        d.line([w*.5*S,(h-1)*S,w*.5*S,32*S],fill=(96,70,44,255),width=3)
    return f
blob('lookout',60,154,lookout(False)); blob('lookout-x',60,154,lookout(True))
json.dump({k:[round(v[0],3),round(v[1],3)] for k,v in anch.items()},open(OUT+'anchors.json','w'),indent=0)
for k,v in sorted(info.items()): print(k,v)
