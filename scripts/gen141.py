"""v14.1 stand-in art: farm production props (2x world px, 11 px/ft) and the Hollowed sheets (pale, ragged-tinted raider)."""
from PIL import Image, ImageDraw, ImageFilter
import random
OUT='/workspace/maine-rpg/v11/public/game/'; R=random.Random(141)
def sh(c,f): return tuple(max(0,min(255,int(v*f))) for v in c[:3])+(255,)
def save(n,im): im=im.filter(ImageFilter.GaussianBlur(0.7)); im.save(OUT+'v14/'+n+'.png'); print(n,im.size)
# garden bed: 6 ft x 3 ft box, kale rows (iso diamond)
im=Image.new('RGBA',(140,44),(0,0,0,0)); d=ImageDraw.Draw(im)
d.polygon([(4,22),(70,4),(136,22),(70,40)],fill=(96,66,40,255),outline=(60,40,24,255))
d.polygon([(12,22),(70,8),(128,22),(70,36)],fill=(70,50,34,255))
for i in range(14):
    x=24+i*7; y=22+R.uniform(-6,6)
    d.ellipse([x-5,y-6,x+5,y+2],fill=sh((78,128,64),R.uniform(.8,1.2)))
save('garden',im)
# smokehouse: 5 ft square, 8 ft tall plank shed with stovepipe
im=Image.new('RGBA',(120,176),(0,0,0,0)); d=ImageDraw.Draw(im)
d.polygon([(10,140),(60,164),(60,70),(10,46)],fill=(104,74,48,255))
d.polygon([(60,164),(110,140),(110,46),(60,70)],fill=(84,58,38,255))
for x in range(14,108,8): d.line([(x,50+abs(x-60)*-0.5+abs(x-60)*0.5),(x,150-abs(x-60)*.5)],fill=(64,44,30,255),width=1)
d.polygon([(4,48),(60,20),(116,48),(60,74)],fill=(70,64,60,255),outline=(40,36,34,255))
d.rectangle([80,4,88,40],fill=(50,46,44,255))
d.rectangle([40,112,56,150],fill=(48,34,24,255))
for i in range(4): d.ellipse([78-i*4,-2-i*2+6,94-i*2,10-i*2+6],fill=(190,190,190,90))
save('smokehouse',im)
# rain collector: tarp funnel over two drums, 4.5 ft
im=Image.new('RGBA',(96,100),(0,0,0,0)); d=ImageDraw.Draw(im)
for cx in (32,64):
    d.rectangle([cx-13,50,cx+13,90],fill=(70,96,120,255),outline=(40,56,70,255))
    d.ellipse([cx-13,44,cx+13,56],fill=(90,120,148,255),outline=(40,56,70,255))
    d.ellipse([cx-13,84,cx+13,96],fill=(60,84,104,255))
d.polygon([(4,14),(92,14),(60,48),(36,48)],fill=(54,92,70,255),outline=(30,56,40,255))
for x in (6,90): d.line([(x,14),(x,94)],fill=(96,70,46,255),width=3)
save('raincollector',im)
# still: copper pot, coil and a keg
im=Image.new('RGBA',(88,104),(0,0,0,0)); d=ImageDraw.Draw(im)
d.ellipse([8,40,52,96],fill=(176,104,58,255),outline=(110,60,30,255))
d.rectangle([24,24,36,44],fill=(176,104,58,255))
d.line([(36,28),(64,34),(64,58)],fill=(160,96,52,255),width=4)
for k in range(4): d.arc([56,50+k*8,76,62+k*8],0,360,fill=(160,96,52,255),width=3)
d.rectangle([60,82,84,100],fill=(110,80,50,255),outline=(70,48,30,255))
d.rectangle([12,90,48,100],fill=(60,60,60,255))
save('still',im)
# Hollowed: pale, ragged tint of the gray raider sheets, holes torn in the coat edge
for src,dst in (('walk','walk'),('axe','axe'),('death','death'),('idle','idle')):
    s=Image.open(OUT+f'v2/bandit-gray-{src}.png').convert('RGBA'); px=s.load(); w,h=s.size
    for y in range(h):
        for x in range(w):
            r,g,b,a=px[x,y]
            if a==0: continue
            l=(r*.3+g*.59+b*.11)
            # wash toward a bone-gray green, raise lightness
            nr,ng,nb=int(l*.55+150*.45),int(l*.58+158*.42),int(l*.5+140*.5)
            px[x,y]=(nr,ng,nb,a)
    # ragged hem: knock out a few edge pixels in each 88x124 cell's lower half
    for y in range(h):
        for x in range(w):
            if px[x,y][3]==0 or (y%124)<70: continue
            if x>0 and px[x-1,y][3]==0 and R.random()<.35: px[x,y]=(0,0,0,0)
    s.save(OUT+f'v2/hollowed-{dst}.png'); print('hollowed',dst,s.size)
