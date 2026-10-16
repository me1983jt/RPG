import sys, glob, json, numpy as np
from PIL import Image
from scipy import ndimage
G='/workspace/maine-rpg/v11/public/game/'
def human_files():
    fs=[]
    for p in sorted(glob.glob(G+'v2/*.png')):
        n=p[len(G):]
        if 'bike-part' in n or 'bike-parked' in n: continue
        fs.append(n)
    for p in sorted(glob.glob(G+'*.png')):
        n=p[len(G):]
        if n.startswith(('hero','npc-','guard-','help-','raider','boss-','villager')): fs.append(n)
    return fs
def grid(n, a):
    H,W=a.shape[:2]
    if H not in (992,124) and not n.startswith('v2/'): return None
    if n.startswith('v2/') and H!=992: return None
    c=W//88 if W%88==0 and W//88 in (3,4,6,8) else 4
    if W%c: return None
    return W//c,(124 if H==992 else H)
UP=('walk','idle','run','gun','talk','carry','axe','hit')
def cell_stats(c):
    al=c[...,3]>60
    if al.sum()<40: return None
    lab,k=ndimage.label(al,np.ones((3,3))); sz=ndimage.sum(al,lab,range(1,k+1))
    big=int(np.argmax(sz))+1; extra=[int(s) for i,s in enumerate(sz,1) if i!=big and s>=15]
    ys,xs=np.nonzero(al); top,bot=ys.min(),ys.max(); h=bot-top
    def cx(f0,f1):
        r=al[int(top+f0*h):int(top+f1*h)+1]; yy,xx=np.nonzero(r); return float(xx.mean()) if len(xx) else np.nan
    return dict(top=int(top),bot=int(bot),h=int(h),head=cx(0,.12),torso=cx(.25,.45),hip=cx(.5,.58),legs=cx(.62,.95),extra=extra,n=int(al.sum()))
def audit(n):
    a=np.asarray(Image.open(G+n).convert('RGBA')); g=grid(n,a)
    if not g: return n,None,[]
    cw,ch=g; rows=a.shape[0]//ch; cols=a.shape[1]//cw; flags=[]; S={}
    up=any(('-'+u) in n for u in UP) or n.startswith(('npc-','villager','raider-','boss-')) and 'dead' not in n and 'atk' not in n or n.endswith(('hero.png','raider.png'))
    if any(k in n for k in ('death','down','dead','crouch','ride','drive')): up=False
    for r in range(rows):
        st=[cell_stats(a[r*ch:(r+1)*ch,c*cw:(c+1)*cw]) for c in range(cols)]
        S[r]=st; v=[s for s in st if s]
        if not v: continue
        mh=np.median([s['h'] for s in v]); mb=np.median([s['bot'] for s in v])
        mht=np.median([s['head']-s['torso'] for s in v]); mhip=np.median([s['hip']-s['torso'] for s in v]); ml=np.median([s['legs']-s['hip'] for s in v])
        for c,s in enumerate(st):
            if not s: flags.append((r,c,'empty')); continue
            f=[]
            if s['h']<mh*.85 and not any(k in n for k in ('death','down','dead')): f.append(f"short {s['h']} vs {mh:.0f}")
            if s['extra']: f.append(f"floating parts {s['extra']}")
            if up:
                if abs(s['bot']-mb)>3: f.append(f"baseline {s['bot']} vs {mb:.0f}")
                if abs((s['head']-s['torso'])-mht)>3: f.append(f"head shift {s['head']-s['torso']-mht:+.1f}")
                if abs((s['hip']-s['torso'])-mhip)>3: f.append(f"hip shift {s['hip']-s['torso']-mhip:+.1f}")
            if f: flags.append((r,c,'; '.join(f)))
    return n,g,flags
if __name__=='__main__':
    out={}
    for n in human_files():
        n,g,fl=audit(n)
        out[n]={'grid':g,'flags':fl}
    json.dump(out,open(sys.argv[1],'w'),indent=0)
    tot=sum(len(v['flags']) for v in out.values()); print(len(out),'sheets',tot,'flags')
    for k,v in out.items():
        if v['flags']: print(k, len(v['flags']), v['flags'][:3])
    print('nogrid',[k for k,v in out.items() if not v['grid']])
