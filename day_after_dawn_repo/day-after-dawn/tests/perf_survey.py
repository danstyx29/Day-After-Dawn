import pathlib, sys
GAME = (pathlib.Path(__file__).resolve().parent.parent / "dist" / "day_after_dawn.html").as_uri()
OUT = pathlib.Path(__file__).resolve().parent / "out"; OUT.mkdir(exist_ok=True)
from playwright.sync_api import sync_playwright
import json
SC = {
 "Town, day": "const t=TOWNS[0]; P.x=t.roadsX[1]+.5; P.y=t.roadsY[1]+2.5; G.min=Math.floor(G.min/1440)*1440+13*60; G.rain=false; G.wet=0; G.zoom=1.0;",
 "Town, night + rain": "const t=TOWNS[0]; P.x=t.roadsX[1]+.5; P.y=t.roadsY[1]+2.5; G.min=Math.floor(G.min/1440)*1440+22*60; G.rain=true; G.wet=1; G.zoom=0.8;",
 "Forest + animals": "const a=AN.find(a=>a.sp==='deer'); P.x=a.x+5; P.y=a.y+5; G.min=Math.floor(G.min/1440)*1440+12*60; G.rain=false; G.wet=0; G.zoom=1.0;",
 "Mall upper floor": "const B=buildings.find(b=>b.kind==='mall' && b.floors>1); const pk=ensureFloor(B.id,1); P.x=B.stair.x+pk.ox+.5; P.y=B.stair.y+pk.oy+1.5; G.min=Math.floor(G.min/1440)*1440+13*60; G.zoom=1.0;",
 "60-zombie chase": "const t=TOWNS[0]; P.x=t.roadsX[1]+.5; P.y=t.roadsY[1]+2.5; G.min=Math.floor(G.min/1440)*1440+15*60; G.rain=false; G.zoom=0.85; for(let k=0;k<60;k++){ const a=k/60*6.28, r=6+(k%5)*2; const z=newZombie(P.x+Math.cos(a)*r, P.y+Math.sin(a)*r); if(solidZ(z.x|0,z.y|0)) continue; z.state='chase'; z.mem=6; Z.push(z); }",
 "Zoomed far out": "const t=TOWNS[0]; P.x=t.roadsX[1]+.5; P.y=t.roadsY[1]+2.5; G.min=Math.floor(G.min/1440)*1440+13*60; G.rain=false; G.wet=0; G.zoom=0.55;",
}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1600,"height":900})
    pg.on("pageerror", lambda e: print("PAGEERR", e))
    pg.goto(GAME); pg.wait_for_timeout(400)
    pg.fill("#seed","harlow"); pg.click("#begin"); pg.wait_for_timeout(900)
    pg.evaluate("""()=>{ window.QFIX=2; for (let rx=6; rx<=9; rx++) for (let ry=6; ry<=9; ry++) genRegion(rx,ry); setInterval(()=>{ P.health=100; P.wounds=[]; P.alive=true; G.running=true; },50);
      window.__T={}; const wrap=n=>{ const f=window[n]; window[n]=function(...a){ const t=performance.now(); try{ return f.apply(this,a);} finally{ __T[n]=(__T[n]||0)+performance.now()-t; } }; }; ['render','step'].forEach(wrap); }""")
    rows=[]
    for name, js in SC.items():
        pg.evaluate("()=>{ Z.forEach(z=>{ if(z.grown||z.state==='chase') z.alive=false; }); "+js+" CAM=null; G.visBox=null; }")
        pg.wait_for_timeout(1500)
        r = pg.evaluate("""async ()=>{ for (const k in __T) __T[k]=0; let n=0; const ft=[]; let last=performance.now(); const t0=last;
          await new Promise(res=>{ function f(){ const now=performance.now(); ft.push(now-last); last=now; n++; if(now-t0<3500) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
          ft.sort((a,b)=>a-b); return { median:Math.round(ft[n>>1]), p95:Math.round(ft[Math.floor(n*.95)]), render:+(__T.render/n).toFixed(1), step:+(__T.step/n).toFixed(1), zombies:Z.filter(z=>z.alive).length, animals:AN.length }; }""")
        rows.append((name, r)); print(name, json.dumps(r))
    b.close()
