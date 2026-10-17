import sys
from PIL import Image, ImageDraw
O='/workspace/maine-rpg/art-backup-v13.3/game/'; N='/workspace/maine-rpg/v11/public/game/'
items=[x.split(':') for x in sys.argv[2].split(',')]; S=int(sys.argv[3]) if len(sys.argv)>3 else 3
W=88*S; H=124*S
out=Image.new('RGBA',(len(items)*W, 2*H),(28,30,34,255))
for i,(f,r,c) in enumerate(items):
    for j,G in enumerate((O,N)):
        im=Image.open(G+f).convert('RGBA'); cw=88 if im.width%88==0 else im.width//4
        fr=im.crop((int(c)*cw,int(r)*124,int(c)*cw+88,int(r)*124+124)).resize((W,H),Image.LANCZOS if 'smooth' in sys.argv else Image.NEAREST)
        out.alpha_composite(fr,(i*W,j*H))
out.save(sys.argv[1])
