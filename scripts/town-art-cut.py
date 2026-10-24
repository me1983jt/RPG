from rembg import remove,new_session
from PIL import Image, ImageFilter
import numpy as np
s=new_session('isnet-general-use')
S='/workspace/quest-harmony/img/scenes/'
H=Image.open(S+'harmony_concept_1280.png').convert('RGB'); F=Image.open(S+'farm_concept_1280.png').convert('RGB')
cuts={'church':(H,(350,40,676,418)),'house_left':(H,(0,100,366,472)),'house_right':(H,(832,128,1280,472)),
'sign':(H,(382,366,492,512)),'well':(H,(625,355,785,520)),'farmhouse':(F,(15,195,470,520)),'shed':(F,(593,350,825,505)),'fence':(F,(820,455,1200,565))}
KILL={}
import numpy as _n
_F=_n.asarray(F).copy(); _F[:,104:132]=_F[:,76:104]; F2=Image.fromarray(_F); cuts['farmhouse']=(F2,cuts['farmhouse'][1])
for k,(im,b) in cuts.items():
    if k in ('fence','sign','well'): continue
    c=im.crop(b); o=remove(c,session=s)
    a=np.asarray(o.split()[3]).astype(float)/255
    a=np.clip((a-0.3)/0.4,0,1)
    from scipy.ndimage import binary_fill_holes
    holes=binary_fill_holes(a>0.5)&(a<0.5); a[holes]=1
    if k in KILL:
        for (x0,x1,y0,y1) in KILL[k]: a[y0-b[1]:y1-b[1],x0-b[0]:x1-b[0]]=0
    A=Image.fromarray((a*255).astype('uint8')).filter(ImageFilter.MinFilter(3))
    a=np.asarray(A).astype(float)/255
    rgb=np.asarray(c).astype(float)
    # decontaminate edges: replace rgb of semi/edge pixels with mean of solid neighbours
    solid=(a>0.99).astype(float)
    from scipy.ndimage import uniform_filter
    k5=lambda x: uniform_filter(x,7)
    w=k5(solid)+1e-6
    fill=np.stack([k5(rgb[...,i]*solid)/w for i in range(3)],-1)
    edge=(a<0.99)
    rgb[edge]=fill[edge]
    out=np.dstack([np.clip(rgb,0,255),a*255]).astype('uint8')
    O=Image.fromarray(out,'RGBA'); O=O.crop(O.getbbox()); O.save(f'/tmp/town_art/{k}.png')
    v=Image.new('RGBA',O.size,(90,110,90,255)); v.alpha_composite(O); v.save(f'/tmp/town_art/view_{k}.png')
    print(k,O.size)
