import json
from PIL import Image, ImageDraw
O='/workspace/maine-rpg/art-backup-v13.2/game/'; N='/workspace/maine-rpg/v11/public/game/'; OUT='/workspace/maine-rpg/beta26-shots/'
BG=(24,26,30,255); S=3
chars=[('Justin','v2/justin-walk.png'),('Player (hero)','v2/hero-walk.png'),('Sarah','v2/sarah-walk.png'),('Cyndal','v2/cyndal-walk.png'),('Loki','v2/loki-walk.png'),
 ('Jack','v2/jack-walk.png'),('Holt','v2/holt-walk.png'),('Mira','v2/mira-walk.png'),('Nora','v2/nora-walk.png'),('Marcel','v2/marcel-walk.png'),
 ('Raider blue','v2/bandit-blue-walk.png'),('Raider gray','v2/bandit-gray-walk.png'),('Raider torch','v2/bandit-torch-walk.png'),('Raider scout','v2/bandit-scout-walk.png'),
 ('Raider armor','v2/bandit-armor-walk.png'),('Raider brute','v2/bandit-brute-walk.png'),('Boss Fur (old)','boss-fur.png'),('Boss Saw (old)','boss-saw.png'),('Raider brute (old)','raider-brute.png')]
def cell(G,f,r,c,cw=88,ch=124):
    im=Image.open(G+f).convert('RGBA'); return im.crop((c*cw,r*ch,(c+1)*cw,(r+1)*ch))
cw,ch=88*S,124*S
sheet=Image.new('RGBA',(len(chars)*cw, ch*2+40),BG); d=ImageDraw.Draw(sheet)
for i,(nm,f) in enumerate(chars):
    for j,G in enumerate((O,N)):
        sheet.alpha_composite(cell(G,f,0,0).resize((cw,ch),Image.NEAREST),(i*cw,20+j*ch))
    d.text((i*cw+4,4),nm,fill=(240,220,120,255))
d.text((4,20+ch-12),'before',fill=(200,200,200,255)); d.text((4,20+2*ch-12),'after',fill=(200,200,200,255))
sheet.save(OUT+'v133-contact.png')
# walk gifs (south row) before/after side by side
for nm,f in chars:
    im0=Image.open(O+f).convert('RGBA'); im1=Image.open(N+f).convert('RGBA'); cols=im0.width//88
    fr=[]
    for c in range(cols):
        t=Image.new('RGBA',(88*2*S,124*S),BG)
        t.alpha_composite(cell(O,f,0,c).resize((cw,ch),Image.NEAREST),(0,0)); t.alpha_composite(cell(N,f,0,c).resize((cw,ch),Image.NEAREST),(cw,0))
        ImageDraw.Draw(t).text((4,4),'before',fill=(200,200,200,255)); ImageDraw.Draw(t).text((cw+4,4),'after',fill=(200,200,200,255))
        fr.append(t.convert('RGB'))
    fr[0].save(OUT+'walk-'+nm.lower().replace(' ','-').replace('(','').replace(')','')+'.gif',save_all=True,append_images=fr[1:],duration=120,loop=0)
# fixed / realigned frames
fx=json.load(open('/workspace/maine-rpg/artfix/changes133.json'))['frames']
seen=[]; [seen.append((f,r,c)) for f,r,c,_ in fx if (f,r,c) not in seen]
def gridw(f):
    w=Image.open(N+f).width; k=w//88 if w%88==0 and w//88 in (3,4,6,8) else 4; return w//k
per=12; 
for p in range(0,len(seen),per*2):
    chunk=seen[p:p+per*2]; rows=(len(chunk)+per-1)//per
    tw=max(gridw(f) for f,_,_ in chunk)*2
    img=Image.new('RGBA',(per*tw,rows*(124*2+16)),BG); d=ImageDraw.Draw(img)
    for i,(f,r,c) in enumerate(chunk):
        x=(i%per)*tw; y=(i//per)*(124*2+16); w=gridw(f)
        a=cell(O,f,r,c,w).resize((w*2//1,124*1)); 
        img.alpha_composite(cell(O,f,r,c,w).resize((w,124)),(x,y+12)); img.alpha_composite(cell(N,f,r,c,w).resize((w,124)),(x,y+12+124))
        d.text((x+2,y),f"{f.split('/')[-1][:-4]} r{r}c{c}",fill=(240,220,120,255))
    img.save(OUT+f'v133-fixed-frames-{p//(per*2)+1}.png')
print('ok', len(seen))
