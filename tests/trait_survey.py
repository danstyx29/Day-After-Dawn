import pathlib, sys
GAME = (pathlib.Path(__file__).resolve().parent.parent / "dist" / "day_after_dawn.html").as_uri()
OUT = pathlib.Path(__file__).resolve().parent / "out"; OUT.mkdir(exist_ok=True)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1300,"height":800})
    pg.on("pageerror", lambda e: print("PAGEERR", e))
    pg.goto(GAME); pg.wait_for_timeout(400)
    pg.fill("#seed","harlow"); pg.click("#begin"); pg.wait_for_timeout(600)
    print(pg.evaluate("""()=>{ const ry=Math.floor(P.y/REG); const HX=Math.floor(P.x)+.5, HY=ry*REG+hwyOff(ry,1)+.5; G.min=Math.floor(G.min/1440)*1440+12*60; G.rain=false;
      const fresh=(tr)=>{ P=newPlayer('T','unemployed',new Set(tr?[tr]:[])); P.x=HX; P.y=HY; P.face=0; Z.forEach(z=>z.alive=false); ST.lastLightT=0; return P; };
      const run=(n,f)=>{ for(let i=0;i<n;i++){ if(f) f(); P.health=100; P.alive=true; G.running=true; step(1/60); } };
      const M = {
        hunger: tr=>{ fresh(tr); P.hunger=0; run(1800); return P.hunger; },
        fatigue: tr=>{ fresh(tr); P.fatigue=0; run(1800); return P.fatigue; },
        panic: tr=>{ fresh(tr); P.panic=0; for(let k=0;k<3;k++){ const z=newZombie(P.x+3+k*.4, P.y+.3*k); z.state='chase'; Z.push(z); } run(240, ()=>{ for(const z of Z) if(z.alive) z.atkCd=9; }); return P.panic; },
        xp: tr=>{ fresh(tr); const x0=P.sk.carpentry.xp; addXP('carpentry',10); return P.sk.carpentry.xp-x0; },
        carry: tr=>{ fresh(tr); return carryCap(); },
        endurance: tr=>{ fresh(tr); P.endurance=1; keys['d']=true; keys['shift']=true; run(600); keys['d']=false; keys['shift']=false; return 1-P.endurance; },
        vision: tr=>{ fresh(tr); G.visBox=null; G.vis.fill(0); computeVis(); let n=0; for(let y=(HY|0)-30;y<(HY|0)+30;y++) for(let x=(HX|0)-30;x<(HX|0)+30;x++) if(G.vis[ix(x,y)]) n++; return n; },
        rear: tr=>{ fresh(tr); P.face=0; G.visBox=null; G.vis.fill(0); computeVis(); let n=0; for(let y=(HY|0)-4;y<=(HY|0)+4;y++) for(let x=(HX|0)-4;x<(HX|0);x++) if(G.vis[ix(x,y)]) n++; return n; },
        stealth: tr=>{ fresh(tr); ST.lastLightT=0; stepStealth(.016); return ST.vis; },
        noise: tr=>{ fresh(tr); P.running=false; P.sneaking=false; return stepNoiseRadius(); },
        loot: tr=>{ fresh(tr); let n=0; for(let k=0;k<600;k++){ const o={}; rollLoot(o,'wardrobe'); n+=o.items.length; } return n/600; },
        bitten: tr=>{ fresh(tr); let w=0; for(let k=0;k<400;k++){ P.wounds=[]; P.health=100; const z=newZombie(P.x+.6,P.y); z.face=Math.PI; zombieHits(z); z.alive=false; w+=P.wounds.length?1:0; } return w/400; },
        gardener: tr=>{ fresh(tr); return knows(ALLR.find(r=>r.id==='sp_mildew')) ? 1 : 0; },
      };
      const T = [["lighteat","hunger","lower"],["hearty","hunger","higher"],["restless","fatigue","higher"],["brave","panic","lower"],["cowardly","panic","higher"],["fastlearn","xp","higher"],["slowlearn","xp","lower"],
        ["strong","carry","higher"],["weak","carry","lower"],["organized","carry","higher"],["athletic","endurance","lower"],["unfit","endurance","higher"],["eagle","vision","higher"],["shortsight","vision","lower"],
        ["keenhear","rear","higher"],["hardhear","rear","lower"],["inconsp","stealth","lower"],["consp","stealth","higher"],["graceful","noise","lower"],["clumsy","noise","higher"],["lucky","loot","higher"],["thinskin","bitten","higher"],["gardener","gardener","higher"]];
      const out=[]; for (const [tr,m,want] of T){ try { const base=M[m](null), w=M[m](tr); const ok = want==='higher' ? w>base*1.02 : w<base*.98; out.push(`${ok?'WORKS ':'CHECK '} ${tr.padEnd(10)} ${m.padEnd(9)} base ${(+base).toFixed(3)} -> ${(+w).toFixed(3)} (${base? ((w/base-1)*100).toFixed(0)+'%' : 'n/a'}, expected ${want})`); } catch(e){ out.push('ERROR '+tr+' '+e.message); } }
      return out.join('\\n'); }"""))
    b.close()
