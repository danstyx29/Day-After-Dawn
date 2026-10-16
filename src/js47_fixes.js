// ============================================================
// Part 47 (1.10): tidy buildings, fill interiors, never spawn inside furniture, a gentler engine.
// ============================================================
// ---------- stray walls: the interior splitter sometimes ran a dividing wall right against the outer wall,
// leaving a double wall with an orphan outer layer. Remove that layer, shrink the building, add windows.
function tidyWalls(B){
  const b = B.id, orphan = [];
  for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++){
    const i = ix(x, y); if (bldId[i] !== b || tile[i] !== T.WALL) continue;
    let keep = false;
    for (let dy = -1; dy <= 1 && !keep; dy++) for (let dx = -1; dx <= 1; dx++){ const j = ix(x + dx, y + dy); if (bldId[j] === b && (tile[j] === T.FLOOR || tile[j] === T.DOOR)) { keep = true; break; } }
    if (!keep) orphan.push([x, y]);
  }
  if (!orphan.length) return 0;
  const newEdge = new Set();
  for (const [x, y] of orphan){ const i = ix(x, y); tile[i] = T.GRASS; bldId[i] = -1; roomId[i] = -1; objs.delete(i); feats.delete(i);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const j = ix(x + dx, y + dy); if (bldId[j] === b && tile[j] === T.WALL) newEdge.add(j); } }
  // shrink the footprint to what's really there
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++) if (bldId[ix(x, y)] === b){ x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  if (x1 >= 0){ B.x0 = x0; B.y0 = y0; B.x1 = x1; B.y1 = y1; }
  B._rg = null; if (B.roofParts) B.roofParts = null;
  // windows on the wall that's now outside
  let k = 0; for (const j of newEdge){ const x = j % W, y = (j / W) | 0; if (k++ % 3 !== 1) continue;
    const fl = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => tile[ix(x + dx, y + dy)] === T.FLOOR);
    if (fl && ((tile[ix(x - 1, y)] === T.WALL && tile[ix(x + 1, y)] === T.WALL) || (tile[ix(x, y - 1)] === T.WALL && tile[ix(x, y + 1)] === T.WALL))) setWin(x, y); }
  return orphan.length;
}
// ---------- rooms that came out empty, and rooms that are thin on furniture
FURN2.hardware = FURN2.hardware || { wall: ["shelf", "shelf", "counter", "workbench", "shelf", "rack"], rows: ["shelf", 2, 2] };
const FALLBACK = {
  bedroom: ["bed", "dresser", "nightstand", "wardrobe"], kitchen: ["counter", "fridge", "oven", "ksink", "counter"], bathroom: ["toilet", "bsink", "tub"],
  living: ["sofa", "tv", "armchair", "bookcase"], hardware: ["shelf", "shelf", "counter", "workbench"], office: ["officedesk", "filecab", "plant"], storage: ["shelf", "crate", "boxes"],
};
const DENSIFY = {
  office: { rows: ["officedesk", 2, 2], extra: ["plant", "watercooler", "filecab"] }, classroom: { rows: ["desk", 2, 2], extra: ["bookcase", "plant"] },
  ward: { rows: ["hbed", 2, 2], extra: ["medcab", "plant"] }, bunkroom: { rows: ["bunk", 2, 2], extra: ["locker", "locker"] },
  library: { rows: ["bookcase", 2, 2], extra: ["table", "plant"] }, storage: { rows: ["shelf", 2, 2], extra: ["crate", "boxes"] },
  staff: { extra: ["table", "sofa", "vending", "plant"] }, living: { extra: ["sofa", "tv", "armchair", "plant"] }, bedroom: { extra: ["dresser", "nightstand"] },
  concourse: { extra: ["plant", "bench", "plant"] }, lobby: { extra: ["sofa", "plant", "watercooler"] }, reception: { extra: ["sofa", "plant"] },
  hardware: { rows: ["shelf", 2, 2] }, grocery: { rows: ["shelf", 2, 2] },
};
const roomFill = r => r.tiles.filter(([x, y]) => objs.has(ix(x, y))).length / Math.max(1, r.tiles.length);
function furnishSparse(r){
  if (!r.tiles.length) return;
  const empty = roomFill(r) === 0;
  if (empty){ const F = FURN2[r.type]; const list = F ? F.wall.slice() : FALLBACK[r.type] || ["shelf", "crate"]; try { furnishRoom(r, list); if (F && F.rows) placeRows(r, ...F.rows); } catch (e) {} }
  if (roomFill(r) === 0){
    // a tiny room: one fitting piece on the tile furthest from any door, so it stays walkable
    const pickT = { bedroom: "dresser", kitchen: "counter", bathroom: "toilet", living: "armchair", office: "filecab" }[r.type] || "boxes";
    const doorD = ([x, y]) => { let d = 9; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (tile[ix(x + dx, y + dy)] === T.DOOR) d = Math.min(d, Math.abs(dx) + Math.abs(dy)); return d; };
    const t = r.tiles.filter(([x, y]) => !objs.has(ix(x, y))).sort((a, b) => doorD(b) - doorD(a))[0];
    if (t && doorD(t) >= 2 && r.tiles.length >= 3){ const o = placeObj(pickT, t[0], t[1], r.id); const wallN = [[0, -1], [0, 1], [-1, 0], [1, 0]].find(([dx, dy]) => tile[ix(t[0] + dx, t[1] + dy)] === T.WALL); if (wallN) o.dir = [-wallN[0], -wallN[1]]; }
  }
  const D = DENSIFY[r.type]; if (!D || roomFill(r) >= .14) return;
  try { if (D.extra) furnishRoom(r, D.extra.slice()); if (D.rows && r.tiles.length >= 14 && roomFill(r) < .14) placeRows(r, ...D.rows); } catch (e) {}
}
function regionTidy(R0){
  for (const B of buildings){
    if (B.y1 >= PK_Y0 || B.x1 < R0.x0 - 2 || B.x0 > R0.x1 + 2 || B.y1 < R0.y0 - 2 || B.y0 > R0.y1 + 2 || B._tidy) continue;
    B._tidy = true; tidyWalls(B);
    for (const r of roomsOf(B.id)) if (r.tiles.length && r.tiles[0][1] < PK_Y0) furnishSparse(r);
  }
}
function upperDecor(B, b, k, pk){ for (const r of roomsOf(b)) if (r.tiles.length){ const [x, y] = r.tiles[0]; if (x >= pk.x0 && x <= pk.x1 && y >= pk.y0 && y <= pk.y1) furnishSparse(r); } }
// ---------- never spawn inside furniture; get unstuck if you ever end up inside something solid
function spotFree(x, y){
  const i = ix(x, y), t = tile[i]; if (!inb(x, y) || ![T.FLOOR, T.GRASS, T.WALK, T.LOT, T.ROAD, T.DIRT, T.SAND, T.GRAVEL].includes(t)) return false;
  const o = objs.get(i); if (o && OBJ[o.type].block && !o.open) return false;
  return !solidP(x, y);
}
function insideSolid(){
  const rs = shapeRects(P.x | 0, P.y | 0, "p"); if (!rs) return false;
  return rs.some(r => P.x > r[0] + .02 && P.x < r[2] - .02 && P.y > r[1] + .02 && P.y < r[3] - .02);
}
function unstickPlayer(force){
  if (!force && !insideSolid() && spotFree(P.x | 0, P.y | 0)) return false;
  const sx = P.x | 0, sy = P.y | 0, seen = new Set([ix(sx, sy)]), q = [[sx, sy]];
  const sameB = bldId[ix(sx, sy)];
  while (q.length){ const [x, y] = q.shift(); if (Math.abs(x - sx) > 8 || Math.abs(y - sy) > 8) continue;
    if (spotFree(x, y) && (sameB < 0 || bldId[ix(x, y)] === sameB || Math.abs(x - sx) + Math.abs(y - sy) > 3)){ P.x = x + .5; P.y = y + .5; return true; }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const n = ix(x + dx, y + dy); if (!seen.has(n) && tile[n] !== T.WALL){ seen.add(n); q.push([x + dx, y + dy]); } } }
  return false;
}
let stuckT = 0;
function stepUnstick(dt){
  if (!G || !P.alive || P.car || P.sleeping) return;
  if (!G.spawnChecked){ G.spawnChecked = true; unstickPlayer(true); }
  stuckT += dt; if (stuckT < 1) return; stuckT = 0;
  if (insideSolid()){ if (unstickPlayer()) say("You squeeze free."); }
}
// move a piece of furniture out of a doorway to a free spot in the same room (keeps its loot)
function moveOutOfDoorway(si){
  const o = objs.get(si); if (!o) return; const r = rooms[roomId[si]];
  const near = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => tile[ix(x + dx, y + dy)] === T.DOOR);
  const spot = r && r.tiles.find(([x, y]) => !objs.has(ix(x, y)) && !near(x, y) && tile[ix(x, y)] === T.FLOOR);
  objs.delete(si); if (spot){ o.x = spot[0]; o.y = spot[1]; objs.set(ix(spot[0], spot[1]), o); }
}
// ---------- 1.10.1: doors you can actually use, and every building has a way in ----------
function tidyDoors(B){
  for (let y = B.y0 - 1; y <= B.y1 + 1; y++) for (let x = B.x0 - 1; x <= B.x1 + 1; x++){
    const i = ix(x, y); if (tile[i] !== T.DOOR || bldId[i] !== B.id) continue;
    const f = feats.get(i); if (!f) continue;
    const sides = f.horiz ? [[x, y - 1], [x, y + 1]] : [[x - 1, y], [x + 1, y]];
    for (const [sx, sy] of sides){
      const si = ix(sx, sy), o = objs.get(si);
      // a fence across the doorway becomes a gap (a gate); a mailbox or anything else solid moves away
      if (o && OBJ[o.type] && OBJ[o.type].block && !o.built){ if (OBJ[o.type].cont && tile[si] === T.FLOOR) moveOutOfDoorway(si); else objs.delete(si); }
      // a door that opens onto the next building's wall gets a matching door: a way through, like a house-to-garage door
      if (tile[si] === T.WALL && bldId[si] >= 0 && bldId[si] !== B.id){ const ns = f.horiz ? [[sx, sy - 1], [sx, sy + 1]] : [[sx - 1, sy], [sx + 1, sy]]; if (ns.some(([nx, ny]) => tile[ix(nx, ny)] === T.FLOOR)) setDoor(sx, sy, false); }
    }
    // a door that still opens straight into a wall leads nowhere: make it wall (the entrance check below keeps a way in)
    if (sides.some(([sx, sy]) => tile[ix(sx, sy)] === T.WALL)){ tile[i] = T.WALL; feats.delete(i); }
  }
}
function ensureEntrance(B){
  const outside = (x, y) => bldId[ix(x, y)] < 0 && pathZ(x, y);
  for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++){ const i = ix(x, y); if ((tile[i] === T.DOOR || tile[i] === T.WIN) && bldId[i] === B.id && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => outside(x + dx, y + dy))) return false; }
  const cands = [];
  for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++){
    const i = ix(x, y); if (tile[i] !== T.WALL || bldId[i] !== B.id) continue;
    const hz = tile[ix(x - 1, y)] === T.WALL && tile[ix(x + 1, y)] === T.WALL, vt = tile[ix(x, y - 1)] === T.WALL && tile[ix(x, y + 1)] === T.WALL;
    if (hz && ((outside(x, y - 1) && tile[ix(x, y + 1)] === T.FLOOR) || (outside(x, y + 1) && tile[ix(x, y - 1)] === T.FLOOR))) cands.push([x, y, (B.front === "top" && outside(x, y - 1)) || (B.front === "bottom" && outside(x, y + 1)) ? 0 : 1]);
    else if (vt && ((outside(x - 1, y) && tile[ix(x + 1, y)] === T.FLOOR) || (outside(x + 1, y) && tile[ix(x - 1, y)] === T.FLOOR))) cands.push([x, y, 1]);
  }
  if (!cands.length) return false;
  cands.sort((a, b) => a[2] - b[2]); const [x, y] = cands[0]; setDoor(x, y, rnd() < .3);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const si = ix(x + dx, y + dy), o = objs.get(si); if (o && OBJ[o.type] && OBJ[o.type].block && !o.built){ if (OBJ[o.type].cont && tile[si] === T.FLOOR) moveOutOfDoorway(si); else objs.delete(si); } }
  return true;
}
function regionTidy(R0){
  for (const B of buildings){
    if (B.y1 >= PK_Y0 || B.x1 < R0.x0 - 2 || B.x0 > R0.x1 + 2 || B.y1 < R0.y0 - 2 || B.y0 > R0.y1 + 2 || B._tidy) continue;
    B._tidy = true; tidyWalls(B); tidyDoors(B); tidyWalls(B); ensureEntrance(B);
    for (const r of roomsOf(B.id)) if (r.tiles.length && r.tiles[0][1] < PK_Y0) furnishSparse(r);
  }
}
