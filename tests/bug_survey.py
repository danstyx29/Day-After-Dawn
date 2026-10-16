import pathlib, sys
GAME = (pathlib.Path(__file__).resolve().parent.parent / "dist" / "day_after_dawn.html").as_uri()
OUT = pathlib.Path(__file__).resolve().parent / "out"; OUT.mkdir(exist_ok=True)
from playwright.sync_api import sync_playwright
import json
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1300,"height":800})
    pg.on("pageerror", lambda e: errs.append("PAGEERR "+str(e)))
    pg.on("console", lambda m: errs.append("CONSOLE "+m.text) if m.type=="error" else None)
    pg.goto(GAME); pg.wait_for_timeout(400)
    pg.fill("#seed","harlow"); pg.click("#begin"); pg.wait_for_timeout(600)
    r = pg.evaluate("""()=>{ for (let rx=6; rx<=10; rx++) for (let ry=6; ry<=10; ry++) genRegion(rx,ry);
      const out={};
      // 1. empty rooms after the tiny-room fix
      const e={}; let total=0; for (const rm of rooms){ if (!rm.tiles.length || rm.tiles[0][1]>=PK_Y0 || rm.b<0) continue; total++; if (rm.tiles.some(([x,y])=>objs.has(ix(x,y)))) continue; const k=buildings[rm.b].kind+'/'+rm.type+'/'+rm.tiles.length+'t'; e[k]=(e[k]||0)+1; }
      out.emptyRooms={total, empty:Object.values(e).reduce((a,b)=>a+b,0), kinds:e};
      // 2. loot tables naming items that don't exist
      const badLoot=[]; for (const [t,L] of Object.entries(LOOT)) for (const [id] of L.items||[]) if (!ITEMS[id]) badLoot.push(t+':'+id); out.badLoot=badLoot;
      // 3. recipe keys that match nothing (not an item id, not any item's tag, not a group)
      const tags=new Set(); for (const d of Object.values(ITEMS)) for (const t of d.tags||[]) tags.add(t);
      const okKey=k=>k[0]==='@' ? !!GROUPS[k.slice(1)] : (ITEMS[k] || tags.has(k));
      const badR=[]; for (const r of ALLR.concat(BL)){ for (const [k] of r.in||[]) if(!okKey(k)) badR.push(r.id+' in:'+k); for (const k of r.tools||[]) if(!okKey(k)) badR.push(r.id+' tool:'+k); for (const [k] of r.out||[]) if(!ITEMS[k]) badR.push(r.id+' out:'+k); if (r.evolve && !okKey(r.evolve.group)) badR.push(r.id+' evolve:'+r.evolve.group); if (r.obj && !OBJ[r.obj]) badR.push(r.id+' obj:'+r.obj); }
      out.badRecipes=badR;
      // 4. world objects with unknown types, objects on doors/windows
      const unk={}, onFeat={}; for (const [i,o] of objs){ if (!OBJ[o.type]) unk[o.type]=(unk[o.type]||0)+1; if ((tile[i]===T.DOOR||tile[i]===T.WIN) && OBJ[o.type] && OBJ[o.type].block) onFeat[o.type]=(onFeat[o.type]||0)+1; }
      out.unknownObjTypes=unk; out.blockingObjOnDoorOrWindow=onFeat;
      // 5. doors blocked on both sides by furniture
      let blockedDoors=0; for (const [i,f] of feats){ if (f.type!=='door' || f.y>=PK_Y0) continue; const sides=f.horiz?[[f.x,f.y-1],[f.x,f.y+1]]:[[f.x-1,f.y],[f.x+1,f.y]]; const blocked=sides.filter(([x,y])=>{ const o=objs.get(ix(x,y)); return (o && OBJ[o.type] && OBJ[o.type].block) || tile[ix(x,y)]===T.WALL; }).length; if (blocked) blockedDoors++; } out.doorsWithBlockedSide=blockedDoors;
      // 6. stairs that lead nowhere
      let badStairs=0, stairsN=0; for (const [i,o] of objs){ if (o.type!=='stairs') continue; stairsN++; try { if (!stairLinks(i).length) badStairs++; } catch(err){ badStairs++; } } out.stairs={total:stairsN, noLinks:badStairs};
      // 7. buildings you can't get into (no door or window on the outside)
      let sealed=[]; for (const B of buildings){ if (B.y1>=PK_Y0) continue; let way=false; for (let y=B.y0;y<=B.y1 && !way;y++) for (let x=B.x0;x<=B.x1;x++){ const i=ix(x,y); if ((tile[i]===T.DOOR||tile[i]===T.WIN) && bldId[i]===B.id){ const ns=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>bldId[ix(x+dx,y+dy)]<0); if(ns){ way=true; break; } } } if(!way) sealed.push(B.kind); } out.sealedBuildings=sealed;
      // 8. zombies and cars stuck in solid places
      let zStuck=0; for (const z of Z){ if (!z.alive) continue; const i=ix(z.x|0,z.y|0); if (tile[i]===T.WALL || (objs.get(i) && OBJ[objs.get(i).type] && OBJ[objs.get(i).type].block && !OBJ[objs.get(i).type].fence)) zStuck++; } out.zombiesInSolid={stuck:zStuck, of:Z.filter(z=>z.alive).length};
      let carBad=0; for (const c of V){ const t=tile[ix(c.x|0,c.y|0)]; if (t===T.WALL||t===T.FLOOR||t===T.WATER) carBad++; } out.carsOnBuildingsOrWater={bad:carBad, of:V.length};
      // 9. stray walls (should stay 0)
      let orph=0; for (const B of buildings){ if (B.y1>=PK_Y0) continue; for (let y=B.y0;y<=B.y1;y++) for (let x=B.x0;x<=B.x1;x++){ const i=ix(x,y); if (bldId[i]!==B.id || tile[i]!==T.WALL) continue; let ok=false; for (let dy=-1;dy<=1&&!ok;dy++) for (let dx=-1;dx<=1;dx++){ const j=ix(x+dx,y+dy); if (bldId[j]===B.id && (tile[j]===T.FLOOR||tile[j]===T.DOOR)) { ok=true; break; } } if(!ok) orph++; } } out.strayWalls=orph;
      // 10. a minute of simulation: anything invalid?
      for (let i=0;i<60*60;i++){ P.health=100; P.alive=true; G.running=true; step(1/60); }
      out.nanZombies=Z.filter(z=>z.alive && !(isFinite(z.x)&&isFinite(z.y))).length; out.playerFinite=isFinite(P.x)&&isFinite(P.y)&&isFinite(P.hunger);
      return out; }""")
    print(json.dumps(r, indent=1))
    b.close()
print("\n".join(errs[:10]) or "no errors")
