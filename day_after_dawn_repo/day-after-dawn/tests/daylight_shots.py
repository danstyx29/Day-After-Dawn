import pathlib, sys
GAME = (pathlib.Path(__file__).resolve().parent.parent / "dist" / "day_after_dawn.html").as_uri()
OUT = pathlib.Path(__file__).resolve().parent / "out"; OUT.mkdir(exist_ok=True)
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
shots=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1100,"height":680})
    pg.on("pageerror", lambda e: print("PAGEERR", e))
    pg.goto(GAME); pg.wait_for_timeout(400)
    pg.fill("#seed","harlow"); pg.click("#begin"); pg.wait_for_timeout(600)
    pg.evaluate("""()=>{ window.QFIX=2; for (let rx=5; rx<=11; rx++) for (let ry=5; ry<=11; ry++) genRegion(rx,ry); setInterval(()=>{ P.health=100; P.alive=true; G.running=true; P.panic=0; },50);
      const B=buildings.filter(B=>['tower','officetower','hotel'].includes(B.kind)).sort((a,b)=>b.floors-a.floors)[0]; window.__spot=[B.x1+5.5, B.y1+7.5]; window.__B=B.id;
      for(let y=B.y0-40;y<B.y1+40;y++) for(let x=B.x0-40;x<B.x1+40;x++) explored[ix(x,y)]=1; }""")
    def shot(label, js, wait=1600):
        pg.evaluate("()=>{ Z.forEach(z=>{ if(Math.abs(z.x-P.x)<40 && Math.abs(z.y-P.y)<40) z.alive=false; }); G.rain=false; G.wet=0; G.snow=0; G.fog=0; LT.adapt={lum:1,extra:0,glare:0}; "+js+" CAM=null; G.visBox=null; G.vis.fill(0); computeVis(); }")
        pg.wait_for_timeout(wait); fn=str(OUT / f"s_{len(shots)}.png"); pg.screenshot(path=fn); shots.append((label, fn))
    base="P.x=__spot[0]; P.y=__spot[1]; P.face=-2.3; G.zoom=.75; const d0=Math.floor(G.min/1440)*1440; "
    for label,h in [("Dawn 06:50",6.83),("Morning 09:00",9),("Noon 13:00",13),("Golden hour 19:10",19.17),("Blue hour 21:20",21.33),("Night 23:30",23.5)]:
        shot(label, base+f"G.min=d0+{h}*60;")
    shot("Indoors at noon", "const r=rooms.find(r=>r.type==='living' && buildings[r.b].kind==='house' && r.tiles.length>12 && r.tiles[0][1]<PK_Y0); const B=buildings[r.b]; const t=r.tiles.find(([x,y])=>spotFree(x,y)); P.x=t[0]+.5; P.y=t[1]+.5; G.zoom=1.25; G.min=Math.floor(G.min/1440)*1440+13*60; for(let y=B.y0-5;y<B.y1+5;y++) for(let x=B.x0-5;x<B.x1+5;x++) explored[ix(x,y)]=1;")
    shot("Rain, late afternoon", base+"G.min=d0+17*60; G.rain=true; G.wet=1;")
    shot("Snow with footprints", base+"G.min=d0+11*60; G.snow=.8; for(let k=0;k<26;k++){ P.moving=true; P.x+=.3; P._px=P.x-.6; stepEnv(.016); } P.moving=false;")
    b.close()
W,H=550,340; sheet=Image.new("RGB",(W*3,H*3),(0,0,0)); dr=ImageDraw.Draw(sheet)
for k,(label,fn) in enumerate(shots):
    im=Image.open(fn).resize((W,H)); x,y=(k%3)*W,(k//3)*H; sheet.paste(im,(x,y)); dr.rectangle([x,y,x+200,y+20],fill=(0,0,0)); dr.text((x+5,y+4),label,fill=(255,255,200))
sheet.save(str(OUT / "daylight_sheet.png")); print(len(shots),"shots")
