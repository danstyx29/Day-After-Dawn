import pathlib, sys
GAME = (pathlib.Path(__file__).resolve().parent.parent / "dist" / "day_after_dawn.html").as_uri()
OUT = pathlib.Path(__file__).resolve().parent / "out"; OUT.mkdir(exist_ok=True)
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={"width":1300,"height":800})
    pg.on("pageerror", lambda e: errs.append("PAGEERR "+str(e)))
    pg.goto(GAME); pg.wait_for_timeout(500)
    for trial in range(3):
        if trial: 
            pg.evaluate("()=>{ if(G.running) die('x'); }"); pg.wait_for_timeout(1800)
            pg.click("#again"); pg.wait_for_timeout(200)
        pg.click("#begin"); pg.wait_for_timeout(300)
        r=pg.evaluate("""()=>{
          const bat=makeItem('crowbar'); P.inv.push(bat); P.weapon=bat; P.traits.add('brave');
          const ks=['w','a','s','d']; let maxChase=0, steps=0;
          for(let i=0;i<25000 && G.running;i++){
            if(i%90==0){ for(const k of ks) keys[k]=false; keys[ks[(Math.random()*4)|0]]=true; keys.shift=Math.random()<.3; }
            if(i%50==0){ const near=Z.filter(z=>z.alive&&Math.hypot(z.x-P.x,z.y-P.y)<1.5)[0]; if(near){P.face=Math.atan2(near.y-P.y,near.x-P.x); Math.random()<.3?shove():swingWeapon();} }
            if(i%400==0){ const o=interactions(); if(o.length){ const c=o[(Math.random()*o.length)|0]; if(!c.off && c.fn) c.fn(); } }
            if(i%300==0) { computeVis(); render(); updateHUD(); }
            if(i%2000==0) { nearbyContainers(); }
            step(1/60); steps++;
            maxChase=Math.max(maxChase, Z.filter(z=>z.alive&&z.state==='chase').length);
          }
          for(const k in keys) keys[k]=false;
          return JSON.stringify({steps, alive:P.alive, kills:P.kills, maxChase, wounds:P.wounds.length, inf:P.infected, hp:P.health|0, day:daysSurvived().toFixed(2), pos:[P.x|0,P.y|0]});
        }""")
        print(r)
    b.close()
print("\n".join(errs[:10]) or "no errors")
