import sys
from PIL import Image
names=sys.argv[2].split(','); base=sys.argv[3] if len(sys.argv)>3 else '/workspace/maine-rpg/v11/public/game/'
S=4; cw,ch=50,80
out=Image.new('RGBA',(len(names)*cw*S,ch*S),(30,32,36,255))
for i,n in enumerate(names):
  im=Image.open(f'{base}v2/{n}-walk.png').convert('RGBA')
  fr=im.crop((0,0,88,124)); bb=fr.getbbox(); cx=(bb[0]+bb[2])//2
  fr=fr.crop((cx-cw//2,bb[3]-ch,cx+cw//2,bb[3])).resize((cw*S,ch*S),Image.NEAREST)
  out.alpha_composite(fr,(i*cw*S,0))
out.save(sys.argv[1])
