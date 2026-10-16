import pathlib, sys
GAME = (pathlib.Path(__file__).resolve().parent.parent / "dist" / "day_after_dawn.html").as_uri()
OUT = pathlib.Path(__file__).resolve().parent / "out"; OUT.mkdir(exist_ok=True)
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1300,"height":800})
    pg.on("pageerror", lambda e: errs.append("PAGEERR "+str(e)))
    pg.on("console", lambda m: errs.append("CONSOLE "+m.text) if m.type=="error" else None)
    pg.goto(GAME); pg.wait_for_timeout(500)
    pg.fill("#seed","harlow"); pg.click("#begin"); pg.wait_for_timeout(800)
    E=pg.evaluate
    print(E("JSON.stringify({W, regions:REGION_ORDER.length, towns:TOWNS.map(t=>t.name+':'+t.kind), b:buildings.length, kinds:[...new Set(buildings.map(b=>b.kind))], z:Z.length, cars:V.length, P:[P.x|0,P.y|0], occ:P.occ, inv:allCarried().map(i=>i.id)})"))
    pg.screenshot(path=str(OUT / "r1.png"))
    b.close()
print("\n".join(errs) or "no errors")
sys.exit(1 if errs else 0)
