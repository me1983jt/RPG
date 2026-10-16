import sys, json
from PIL import Image, ImageDraw, ImageFont
B='/workspace/maine-rpg/v11/public/game/'; O='/workspace/maine-rpg/art-backup-v13/game/'
files=sys.argv[2:]; out=sys.argv[1]
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
tiles=[]
for fn in files:
    a=Image.open(O+fn).convert('RGBA'); b=Image.open(B+fn).convert('RGBA'); w,h=a.size
    if h>=400:  # sheet: show row 2 and 4 first 4 frames
        fw=h//8; cols=min(4,w//fw); crop=lambda im:Image.fromarray(__import__('numpy').vstack([__import__('numpy').asarray(im.crop((0,r*fw,cols*fw,(r+1)*fw))) for r in (3,6)]))
        a,b=crop(a),crop(b); w,h=a.size
    s=min(2.0,300/max(w,1),300/max(h,1)); W,H=int(w*s),int(h*s)
    t=Image.new('RGB',(W*2+30,H+22),(235,235,235)); d=ImageDraw.Draw(t)
    for i,im in enumerate((a,b)):
        bg=Image.new('RGBA',im.size,(70,130,170,255)); bg.alpha_composite(im); t.paste(bg.convert('RGB').resize((W,H),Image.NEAREST),(i*(W+30),20))
    d.text((2,2),fn+'   before | after',fill=(0,0,0),font=f); tiles.append(t)
cols=3; rowsN=(len(tiles)+cols-1)//cols
cw=max(t.width for t in tiles); ch=max(t.height for t in tiles)
sheet=Image.new('RGB',(cw*cols,ch*rowsN),(255,255,255))
for i,t in enumerate(tiles): sheet.paste(t,((i%cols)*cw,(i//cols)*ch))
sheet.save(out); print(sheet.size)
