import pathlib, sys
GAME = (pathlib.Path(__file__).resolve().parent.parent / "dist" / "day_after_dawn.html").as_uri()
OUT = pathlib.Path(__file__).resolve().parent / "out"; OUT.mkdir(exist_ok=True)
from playwright.sync_api import sync_playwright
import json, sys, collections
SC = sys.argv[1] if len(sys.argv) > 1 else "run"
DUR = 7000
setup = {
 "run":   "G.zoom=1.0; window.__mv=[.065,0];",
 "drive": "G.zoom=.8; window.__mv=[.17,.02];",
 "zoom":  "G.zoom=.55; window.__mv=[.06,0];",
 "chase": "G.zoom=.85; window.__mv=[0,0]; G.min=Math.floor(G.min/1440)*1440+22*60; G.rain=true; G.wet=1; for(let k=0;k<60;k++){ const a=k/60*6.28, r=6+(k%5)*2; const z=newZombie(P.x+Math.cos(a)*r, P.y+Math.sin(a)*r); if(solidZ(z.x|0,z.y|0)) continue; z.state='chase'; z.mem=6; Z.push(z); }",
 "late":  "G.zoom=1.0; window.__mv=[.065,.01]; for (let rx=3; rx<=13; rx++) for (let ry=3; ry<=13; ry++) genRegion(rx,ry); for(let k=0;k<1500;k++) G.corpses.push({x:P.x+rf(-60,60),y:P.y+rf(-60,60),t:G.min-2000,col:'#555',pants:'#333',fall:1}); for(let k=0;k<800;k++) addBlood(P.x+rf(-30,30),P.y+rf(-30,30),1);",
}[SC]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1600,"height":900})
    pg.on("pageerror", lambda e: print("PAGEERR", e))
    pg.goto(GAME); pg.wait_for_timeout(400)
    import os
    if os.environ.get("FIXRES"): pg.evaluate("()=>{ window.__FIXRES=1; }")
    pg.fill("#seed","harlow"); pg.click("#begin"); pg.wait_for_timeout(900)
    pg.evaluate("""()=>{ window.QFIX=2; if (window.__FIXRES) window.QFIXRES=1; const ry=Math.floor(P.y/REG); P.y=ry*REG+hwyOff(ry,1)+.5; setInterval(()=>{ P.health=100; P.wounds=[]; P.alive=true; G.running=true; P.infected=false; },50); """ + setup + """
      window.__ft=[]; let last=performance.now(); (function f(){ const now=performance.now(); __ft.push(now-last); last=now; if(__mv){ P.x+=__mv[0]; P.y+=__mv[1]; } requestAnimationFrame(f); })(); }""")
    import os
    pg.wait_for_timeout(int(os.environ.get("WARM","800")))
    cdp = pg.context.new_cdp_session(pg)
    cdp.send("Profiler.enable"); cdp.send("Profiler.setSamplingInterval", {"interval": 250}); cdp.send("Profiler.start")
    pg.evaluate("()=>{ __ft.length=0; }")
    pg.wait_for_timeout(DUR)
    prof = cdp.send("Profiler.stop")["profile"]
    ft = pg.evaluate("()=>__ft.slice()")
    b.close()
nodes = {n["id"]: n for n in prof["nodes"]}
self_t = collections.Counter()
deltas = prof["timeDeltas"]; samples = prof["samples"]
for sid, dt in zip(samples, deltas):
    n = nodes[sid]; cf = n["callFrame"]; key = f'{cf["functionName"] or "(anon)"}:{cf["lineNumber"]}' if cf["url"] else cf["functionName"]
    self_t[key] += dt/1000.0
total = sum(self_t.values())
ft.sort(); n = len(ft)
stats = {"frames": n, "median": round(ft[n//2]), "p95": round(ft[int(n*.95)]), "p99": round(ft[int(n*.99)]), "max": round(ft[-1]), "over50": sum(1 for x in ft if x > 50), "over100": sum(1 for x in ft if x > 100), "over250": sum(1 for x in ft if x > 250)}
print(SC, json.dumps(stats), "| render scale", pg_scale if False else "")
print("top self time (ms over", DUR, "ms):")
for k, v in self_t.most_common(22): print(f"  {v:8.1f}  {k}")
