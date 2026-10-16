import sys
from PIL import Image, ImageDraw
O='/workspace/maine-rpg/art-backup-v13.2/game/'; N='/workspace/maine-rpg/v11/public/game/'
items=[x.split(':') for x in sys.argv[2].split(',')]; S=int(sys.argv[3]) if len(sys.argv)>3 else 3
tiles=[]
for f,r,cw,ch in items:
    r,cw,ch=int(r),int(cw),int(ch)
    for tag,G in (('before',O),('after',N)):
        im=Image.open(G+f).convert('RGBA'); row=im.crop((0,r*ch,im.width,(r+1)*ch))
        bg=Image.new('RGBA',row.size,(36,40,48,255)); bg.alpha_composite(row); d=ImageDraw.Draw(bg)
        for c in range(1,im.width//cw): d.line([(c*cw,0),(c*cw,ch)],fill=(80,80,80,255))
        d.text((2,2),f"{tag} {f} r{r}",fill=(255,255,0,255)); tiles.append(bg.resize((bg.width*S,bg.height*S),Image.NEAREST))
W=max(t.width for t in tiles); H=sum(t.height for t in tiles)
out=Image.new('RGBA',(W,H),(0,0,0,255)); y=0
for t in tiles: out.paste(t,(0,y)); y+=t.height
out.save(sys.argv[1])
