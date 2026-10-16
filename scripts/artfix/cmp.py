import sys; from PIL import Image
a=Image.open(sys.argv[1]).convert('RGBA'); b=Image.open(sys.argv[2]).convert('RGBA'); box=tuple(map(int,sys.argv[4].split(','))); S=int(sys.argv[5]) if len(sys.argv)>5 else 4
a=a.crop(box);b=b.crop(box); w,h=a.size
out=Image.new('RGBA',(w*S,h*S*2+8),(255,0,255,255))
for i,im in enumerate((a,b)):
  bg=Image.new('RGBA',(w,h),(40,200,240,255)); bg.alpha_composite(im); out.paste(bg.resize((w*S,h*S),Image.NEAREST),(0,i*(h*S+8)))
out.save(sys.argv[3])
