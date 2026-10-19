"""v14 painted world map stand-in (top-down). Matches the hex layout in src/game/worldmap.ts at 2x."""
from PIL import Image, ImageDraw, ImageFilter
import math, random
T=["WWWWWWWWWWWW","WWWWWTWWWWWW","WWWWWRWWWWFF","FWWWWRWWVFTF","FFTRRRWVVRRF","FFFFRTRTWWFF","WFFFFRWVFFWW","WWWTRRRVTFWW","WWWWWWWVWWWW"]
S=50; K=2
def c(q,r): return (S*math.sqrt(3)*(q+0.5*(r&1))+S*math.sqrt(3)/2+10, S*1.5*r+S+10)
W=math.ceil(S*math.sqrt(3)*12.5+20); H=math.ceil(S*1.5*8+S*2+20)
im=Image.new('RGB',(W*K,H*K),(196,184,150)); d=ImageDraw.Draw(im); R=random.Random(7)
col={'W':(62,92,58),'F':(170,164,110),'R':(170,164,110),'T':(150,140,104),'V':(78,112,140)}
for r,row in enumerate(T):
  for q,t in enumerate(row):
    x,y=c(q,r)
    for i in range(40):
      a=R.random()*6.28; rr=R.random()*S*1.05; px,py=x+math.cos(a)*rr,y+math.sin(a)*rr
      cc=tuple(int(v*R.uniform(.85,1.12)) for v in col[t]); s=R.uniform(10,22)
      d.ellipse([(px-s)*K,(py-s)*K,(px+s)*K,(py+s)*K],fill=cc)
im=im.filter(ImageFilter.GaussianBlur(9)); d=ImageDraw.Draw(im)
for r,row in enumerate(T):
  for q,t in enumerate(row):
    x,y=c(q,r)
    if t=='W':
      for i in range(9):
        px,py=x+R.uniform(-36,36),y+R.uniform(-30,30); s=R.uniform(5,9)
        d.polygon([(px*K,(py-s*1.6)*K),((px-s)*K,(py+s)*K),((px+s)*K,(py+s)*K)],fill=(40,70,44))
# river: the V hexes in a line
riv=[(q,r) for r,row in enumerate(T) for q,t in enumerate(row) if t=='V']
riv.sort(key=lambda h:h[1]); pts=[c(*h) for h in riv]
d.line([(x*K,y*K) for x,y in pts],fill=(70,108,140),width=26*K,joint='curve')
# roads between R/T neighbours
def nb(q,r):
  o=r&1; D=[[1,0],[-1,0],[0,-1],[1,-1],[0,1],[1,1]] if o else [[1,0],[-1,0],[-1,-1],[0,-1],[-1,1],[0,1]]
  return [(q+a,r+b) for a,b in D if 0<=q+a<12 and 0<=r+b<9]
for r,row in enumerate(T):
  for q,t in enumerate(row):
    if t not in 'RT': continue
    for a,b in nb(q,r):
      if T[b][a] in 'RT':
        (x0,y0),(x1,y1)=c(q,r),c(a,b); d.line([x0*K,y0*K,x1*K,y1*K],fill=(122,100,72),width=7*K)
for r,row in enumerate(T):
  for q,t in enumerate(row):
    if t=='T':
      x,y=c(q,r); d.ellipse([(x-11)*K,(y-11)*K,(x+11)*K,(y+11)*K],fill=(120,64,44),outline=(60,36,24),width=3*K)
im=im.filter(ImageFilter.GaussianBlur(1.2))
im.save('/workspace/maine-rpg/v11/public/game/v14/worldmap.jpg',quality=86); print(im.size)
