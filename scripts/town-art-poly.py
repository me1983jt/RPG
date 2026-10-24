from PIL import Image, ImageDraw, ImageFilter
import numpy as np
S='/workspace/quest-harmony/img/scenes/'
H=Image.open(S+'harmony_concept_1280.png').convert('RGB'); F=Image.open(S+'farm_concept_1280.png').convert('RGB')
def polycut(im,polys,name):
    m=Image.new('L',im.size,0); d=ImageDraw.Draw(m)
    for p in polys: d.polygon(p,fill=255)
    # supersampled-like soft 1px edge
    m=m.filter(ImageFilter.GaussianBlur(0.6))
    o=im.convert('RGBA'); o.putalpha(m); o=o.crop(m.getbbox()); o.save(f'/tmp/town_art/{name}.png'); return o
polycut(F,[[(645,362),(760,356),(820,425),(818,497),(600,497),(600,427)]],'shed')
polycut(H,[[(382,371),(487,371),(491,388),(380,388)],[(390,388),(482,388),(482,457),(390,457)],[(400,457),(412,457),(412,500),(400,500)],[(467,457),(480,457),(480,500),(467,500)]],'sign')
# fence: Quest's weathered posts (orchard post) + rails made of the same wood
post=F.crop((950,484,959,557)).convert('RGBA')   # 9x73
post2=F.crop((150,505,160,612)).convert('RGBA').resize((9,73))
rail=post.rotate(90,expand=True).resize((150,7))
W,Hh=320,80
fence=Image.new('RGBA',(W,Hh),(0,0,0,0))
xs=[4,108,212,307]
for i in range(3):
    for ry in (20,44):
        r=rail.resize((xs[i+1]-xs[i]+4,7)); fence.alpha_composite(r,(xs[i]+3,ry+(i%2)))
for j,x in enumerate(xs):
    p=(post if j%2==0 else post2); fence.alpha_composite(p,(x,Hh-73))
fence.save('/tmp/town_art/fence.png')
