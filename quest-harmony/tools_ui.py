# Procedural rugged UI textures (PIL). Run: python3 tools_ui.py
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import random, math
random.seed(7); O='img/ui/'
def noise(w,h,amp,base):
    im=Image.effect_noise((w,h),amp).convert('L'); return im
def wood_plank(w,h,tone):
    im=Image.new('RGB',(w,h),tone); d=ImageDraw.Draw(im)
    for y in range(h):  # grain
        if random.random()<.35:
            c=tuple(max(0,v-random.randint(10,35)) for v in tone)
            off=random.randint(-3,3); d.line([(0,y),(w,y+off)],fill=c)
    for _ in range(random.randint(0,2)):  # knot
        x,y=random.randint(10,w-10),random.randint(3,h-3); r=random.randint(3,6)
        d.ellipse([x-r*2,y-r,x+r*2,y+r],outline=tuple(v-50 for v in tone),width=2)
    n=noise(w,h,40,0).filter(ImageFilter.GaussianBlur(.6))
    im=Image.composite(im,ImageChops.multiply(im,Image.new('RGB',(w,h),(200,190,180))),n)
    return im
def nail(d,x,y,r=3):
    d.ellipse([x-r,y-r,x+r,y+r],fill=(70,60,55)); d.ellipse([x-r+1,y-r+1,x+r-2,y+r-2],fill=(150,140,125)); d.point((x-1,y-1),fill=(220,210,190))
def jag(w,h,amp,step=6,inset=0):
    pts=[]
    for x in range(0,w+1,step): pts.append((x,inset+random.uniform(0,amp)))
    for y in range(0,h+1,step): pts.append((w-inset-random.uniform(0,amp),y))
    for x in range(w,-1,-step): pts.append((x,h-inset-random.uniform(0,amp)))
    for y in range(h,-1,-step): pts.append((inset+random.uniform(0,amp),y))
    return pts
# 1) icon bar: planks of varied widths, nails, transparent jagged ends
W,H=470,44; bar=Image.new('RGBA',(W,H),(0,0,0,0)); x=0
while x<W:
    pw=random.randint(70,140); tone=random.choice([(112,78,46),(98,68,40),(126,90,52),(88,62,38)])
    p=wood_plank(pw+6,H-6,tone).convert('RGBA'); m=Image.new('L',p.size,0); ImageDraw.Draw(m).polygon(jag(p.size[0],p.size[1],3,5),fill=255)
    p.putalpha(m); p=p.rotate(random.uniform(-1.5,1.5),expand=True,resample=Image.BICUBIC)
    bar.alpha_composite(p,(x,random.randint(0,4))); dd=ImageDraw.Draw(bar); nail(dd,x+6,10); nail(dd,x+6,H-10); x+=pw
m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(jag(W,H,4,7),fill=255); bar.putalpha(ImageChops.multiply(bar.getchannel('A'),m)); bar.save(O+'bar.png')
# 2) rusty bent plates (button backs), 4 variants
for i in range(4):
    w,h=60,40; base=random.choice([(122,62,30),(104,58,34),(132,76,40),(96,70,52)])
    im=Image.new('RGB',(w,h),base); n=noise(w,h,70,0).filter(ImageFilter.GaussianBlur(1.2))
    rust=Image.new('RGB',(w,h),(170,90,40)); dark=Image.new('RGB',(w,h),(50,30,20))
    im=Image.composite(rust,im,n.point(lambda v:255 if v>150 else 0).filter(ImageFilter.GaussianBlur(1)))
    im=Image.composite(dark,im,n.point(lambda v:200 if v<70 else 0).filter(ImageFilter.GaussianBlur(1)))
    d=ImageDraw.Draw(im)
    for _ in range(8):  # scratches
        x0,y0=random.randint(0,w),random.randint(0,h); d.line([(x0,y0),(x0+random.randint(-15,15),y0+random.randint(-6,6))],fill=(190,150,110),width=1)
    for _ in range(2):  # dents
        x0,y0=random.randint(8,w-8),random.randint(8,h-8); d.ellipse([x0-5,y0-3,x0+5,y0+3],outline=(60,35,20))
    d.line([(0,h*0.55+random.randint(-4,4)),(w,h*0.45)],fill=(80,45,25),width=1)  # bend
    for (x,y) in [(4,4),(w-5,4),(4,h-5),(w-5,h-5)]: nail(d,x,y,2)
    im=im.convert('RGBA'); m=Image.new('L',(w,h),0); ImageDraw.Draw(m).polygon(jag(w,h,2.5,4),fill=255); im.putalpha(m); im.save(O+f'plate{i}.png')
# 3) torn parchment / cardboard panel (border-image 9-slice: 40px torn edges)
def parchment(w,h,base,name,stain=True):
    im=Image.new('RGB',(w,h),base); n=noise(w,h,50,0).filter(ImageFilter.GaussianBlur(3))
    im=Image.composite(im,ImageChops.multiply(im,Image.new('RGB',(w,h),(215,200,175))),n)
    d=ImageDraw.Draw(im)
    if stain:
        for _ in range(5):
            x,y,r=random.randint(0,w),random.randint(0,h),random.randint(10,40); d.ellipse([x-r,y-r,x+r,y+r],outline=tuple(v-40 for v in base),width=2)
    im=im.convert('RGBA'); m=Image.new('L',(w,h),0); ImageDraw.Draw(m).polygon(jag(w,h,9,5,2),fill=255)
    im.putalpha(m)
    # burned/dark edge
    rim=ImageChops.subtract(m,m.filter(ImageFilter.MinFilter(7))).filter(ImageFilter.GaussianBlur(2))
    dark=Image.new('RGBA',(w,h),(70,40,15,255)); dark.putalpha(rim.point(lambda v:int(v*.8))); im.alpha_composite(dark)
    im.save(O+name)
parchment(240,240,(232,218,184),'parchment.png'); parchment(240,240,(190,160,115),'cardboard.png')
# 4) wood frame for dialogs (border-image), splintered corners, nails, rope wrap at corners
F=200; fr=Image.new('RGBA',(F,F),(0,0,0,0)); t=22
def plankpiece(w,h): 
    p=wood_plank(w,h,random.choice([(110,76,44),(96,66,40),(120,86,50)])).convert('RGBA'); m=Image.new('L',(w,h),0); ImageDraw.Draw(m).polygon(jag(w,h,3,4),fill=255); p.putalpha(m); return p
fr.alpha_composite(plankpiece(F,t),(0,2)); fr.alpha_composite(plankpiece(F,t),(0,F-t-2))
v=plankpiece(F,t).rotate(90,expand=True); fr.alpha_composite(v,(2,0)); fr.alpha_composite(v.transpose(Image.FLIP_TOP_BOTTOM),(F-t-2,0))
d=ImageDraw.Draw(fr)
for (x,y) in [(12,12),(F-12,12),(12,F-12),(F-12,F-12)]:
    for k in range(5): d.line([(x-11,y-9+k*4),(x+11,y-5+k*4)],fill=(170,140,90),width=2); d.line([(x-11,y-8+k*4),(x+11,y-4+k*4)],fill=(90,70,40),width=1)  # rope
for (x,y) in [(F//2,11),(F//2,F-11),(11,F//2),(F-11,F//2)]: nail(d,x,y,3)
fr.save(O+'frame.png')
print('ok')
