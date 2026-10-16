// ============================================================
// Part 2: world + procedural town
// ============================================================
let W = CFG.W, H = CFG.H;
let tile, roomId, bldId, explored;
let objs;        // Map idx -> object
let feats;       // Map idx -> door/window state
let floorItems;  // Map idx -> item list
let rooms, buildings, perim;
const ix = (x, y) => y * W + x;
const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

function genWorld(seed){
  srand(seed);
  tile = new Uint8Array(W * H).fill(T.GRASS);
  roomId = new Int16Array(W * H).fill(-1);
  bldId = new Int16Array(W * H).fill(-1);
  explored = new Uint8Array(W * H);
  objs = new Map(); feats = new Map(); floorItems = new Map();
  rooms = []; buildings = []; if (typeof WRC !== 'undefined') WRC.clear();

  const RP = [6, 34, 62, 90];
  for (const r of RP){
    for (let i = 0; i < W; i++) for (let k = 0; k < 3; k++){
      tile[ix(i, r + k)] = T.ROAD; tile[ix(r + k, i)] = T.ROAD;
    }
  }
  for (const r of RP){
    for (let i = 0; i < W; i++) for (const k of [r - 1, r + 3]){
      if (inb(i, k) && tile[ix(i, k)] === T.GRASS) tile[ix(i, k)] = T.WALK;
      if (inb(k, i) && tile[ix(k, i)] === T.GRASS) tile[ix(k, i)] = T.WALK;
    }
  }
  // forest belt around the town
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    if (tile[ix(x, y)] !== T.GRASS) continue;
    const edge = x < 5 || y < 5 || x > 94 || y > 94;
    if (edge && rnd() < 0.42) tile[ix(x, y)] = T.TREE;
  }
  // blocks
  for (let bj = 0; bj < 3; bj++) for (let bi = 0; bi < 3; bi++){
    const x0 = RP[bi] + 4, x1 = RP[bi + 1] - 2, y0 = RP[bj] + 4, y1 = RP[bj + 1] - 2;
    if (bi === 1 && bj === 1){ genCommercial(x0, y0, x1, y1); continue; }
    if (bi === 2 && bj === 0){ genPark(x0, y0, x1, y1); continue; }
    const mid = Math.floor((x0 + x1) / 2), midy = Math.floor((y0 + y1) / 2);
    const lots = [[x0, y0, mid - 1, midy - 1, "top"], [mid + 1, y0, x1, midy - 1, "top"],
                  [x0, midy + 1, mid - 1, y1, "bottom"], [mid + 1, midy + 1, x1, y1, "bottom"]];
    for (const L of lots) genLot(...L);
  }
  // which wall tiles are on a building's outside edge
  perim = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++){
    const b = bldId[ix(x, y)]; if (b < 0 || tile[ix(x, y)] === T.FLOOR) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (bldId[ix(x + dx, y + dy)] !== b) perim[ix(x, y)] = 1;
  }
  // abandoned cars
  for (let n = 0; n < 26; n++){
    const r = pick(RP, rnd), along = ri(2, W - 3, rnd), lane = r + ri(0, 2, rnd);
    const [x, y] = rnd() < .5 ? [along, lane] : [lane, along];
    if (tile[ix(x, y)] === T.ROAD && !objs.has(ix(x, y))) placeObj("car", x, y, -1).col = pick(["#6b2e2a", "#2f4a5e", "#8a8470", "#3e4a3a", "#9a9a94", "#5a4a3a"], rnd);
  }
}

function genPark(x0, y0, x1, y1){
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){
    if (rnd() < 0.18) tile[ix(x, y)] = T.TREE;
    else if (rnd() < 0.08) tile[ix(x, y)] = T.DIRT;
  }
}

function genLot(lx0, ly0, lx1, ly1, front){
  const lw = lx1 - lx0 + 1, lh = ly1 - ly0 + 1;
  const hw = Math.min(lw - 1, ri(9, 11, rnd)), hh = Math.min(lh - 1, ri(9, 11, rnd));
  const hx0 = lx0 + ri(0, lw - hw, rnd);
  const hy0 = front === "top" ? ly0 + Math.min(1, lh - hh) : ly1 - hh + 1 - Math.min(1, lh - hh);
  LOT_CTX = { lx0, ly0, lx1, ly1 };
  buildHouse(hx0, hy0, hx0 + hw - 1, hy0 + hh - 1, front);
  LOT_CTX = null;
  // yard trees
  for (let y = ly0; y <= ly1; y++) for (let x = lx0; x <= lx1; x++){
    if (tile[ix(x, y)] === T.GRASS && rnd() < 0.05 && !nearType(x, y, [T.DOOR, T.WIN, T.WALL], 1)) tile[ix(x, y)] = T.TREE;
  }
}

function nearType(x, y, types, r){
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++){
    if (inb(x + dx, y + dy) && types.includes(tile[ix(x + dx, y + dy)])) return true;
  }
  return false;
}

function newBuilding(kind){
  const b = { id: buildings.length, kind, alarm: rnd() < 0.12, alarmUsed: false };
  buildings.push(b); return b;
}

function setDoor(x, y, locked){
  tile[ix(x, y)] = T.DOOR;
  const horiz = tile[ix(x - 1, y)] === T.WALL || tile[ix(x + 1, y)] === T.WALL;
  feats.set(ix(x, y), { type: "door", open: false, locked, hp: DOOR_HP, bar: 0, horiz, x, y });
}
function setWin(x, y){
  tile[ix(x, y)] = T.WIN;
  const horiz = tile[ix(x - 1, y)] === T.WALL || tile[ix(x + 1, y)] === T.WALL;
  feats.set(ix(x, y), { type: "win", open: false, broken: false, glass: false, hp: WIN_HP, bar: 0, horiz, x, y, curtain: rnd() < .5, locked: rnd() < .3 });
}

function buildHouse(x0, y0, x1, y1, front){
  const b = newBuilding("house");
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){
    const edge = x === x0 || x === x1 || y === y0 || y === y1;
    tile[ix(x, y)] = edge ? T.WALL : T.FLOOR; bldId[ix(x, y)] = b.id;
  }
  const w = x1 - x0, h = y1 - y0;
  const doorsPlaced = [];
  // vertical interior wall
  const vx = ri(x0 + 4, Math.max(x0 + 4, x1 - 4), rnd);
  for (let y = y0; y <= y1; y++) tile[ix(vx, y)] = T.WALL;
  // horizontal walls each side
  const hyL = ri(y0 + 4, Math.max(y0 + 4, y1 - 4), rnd);
  for (let x = x0; x <= vx; x++) tile[ix(x, hyL)] = T.WALL;
  let hyR = -1;
  if (rnd() < 0.65 && h >= 8){ hyR = ri(y0 + 4, Math.max(y0 + 4, y1 - 4), rnd);
    for (let x = vx; x <= x1; x++) tile[ix(x, hyR)] = T.WALL; }
  // interior doors
  const tryDoor = (cands) => {
    const ok = cands.filter(([x, y]) => {
      const horiz = tile[ix(x - 1, y)] === T.WALL && tile[ix(x + 1, y)] === T.WALL;
      const vert = tile[ix(x, y - 1)] === T.WALL && tile[ix(x, y + 1)] === T.WALL;
      if (horiz) return tile[ix(x, y - 1)] === T.FLOOR && tile[ix(x, y + 1)] === T.FLOOR;
      if (vert) return tile[ix(x - 1, y)] === T.FLOOR && tile[ix(x + 1, y)] === T.FLOOR;
      return false;
    });
    if (ok.length){ const [x, y] = pick(ok, rnd); setDoor(x, y, false); doorsPlaced.push([x, y]); }
  };
  const c1 = []; for (let x = x0 + 1; x < vx; x++) c1.push([x, hyL]); tryDoor(c1);
  if (hyR > 0){ const c2 = []; for (let x = vx + 1; x < x1; x++) c2.push([x, hyR]); tryDoor(c2); }
  const c3 = []; for (let y = y0 + 1; y < y1; y++) c3.push([vx, y]); tryDoor(c3);
  // exterior doors
  const frontY = front === "top" ? y0 : y1, backY = front === "top" ? y1 : y0;
  const extDoor = (yy) => {
    const inner = yy === y0 ? 1 : -1, c = [];
    for (let x = x0 + 1; x < x1; x++) if (tile[ix(x, yy + inner)] === T.FLOOR && tile[ix(x - 1, yy)] === T.WALL && tile[ix(x + 1, yy)] === T.WALL && x !== vx) c.push(x);
    if (c.length){ const x = pick(c, rnd); setDoor(x, yy, rnd() < 0.35); }
  };
  extDoor(frontY); if (rnd() < 0.45) extDoor(backY);
  // windows on exterior walls
  const winAt = (x, y, ox, oy) => {
    if (tile[ix(x, y)] !== T.WALL) return;
    if (!inb(x + ox, y + oy) || tile[ix(x + ox, y + oy)] !== T.FLOOR) return;
    if (nearType(x, y, [T.DOOR, T.WIN], 1)) return;
    setWin(x, y);
  };
  for (let x = x0 + 1; x < x1; x++){ if ((x - x0) % 3 === 2){ winAt(x, y0, 0, 1); winAt(x, y1, 0, -1); } }
  for (let y = y0 + 1; y < y1; y++){ if ((y - y0) % 3 === 2){ winAt(x0, y, 1, 0); winAt(x1, y, -1, 0); } }
  // rooms
  const found = [];
  for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++){
    if (tile[ix(x, y)] !== T.FLOOR || roomId[ix(x, y)] >= 0) continue;
    const r = { id: rooms.length, type: "living", tiles: [], b: b.id }; rooms.push(r); found.push(r);
    const st = [[x, y]]; roomId[ix(x, y)] = r.id;
    while (st.length){ const [cx, cy] = st.pop(); r.tiles.push([cx, cy]);
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = cx + dx, ny = cy + dy;
        if (tile[ix(nx, ny)] === T.FLOOR && roomId[ix(nx, ny)] < 0){ roomId[ix(nx, ny)] = r.id; st.push([nx, ny]); } } }
  }
  found.sort((a, b) => b.tiles.length - a.tiles.length);
  const types = found.length >= 4 ? ["living", "bedroom", "kitchen", "bathroom"] : found.length === 3 ? ["living", "kitchen", "bedroom"] : ["kitchen", "bedroom"];
  found.forEach((r, i) => r.type = types[i] || "bedroom");
  // smallest of 4+ rooms is the bathroom, extra rooms become bedrooms
  if (found.length > 4){ found[found.length - 1].type = "bathroom"; for (let i = 3; i < found.length - 1; i++) found[i].type = "bedroom"; }
  const FURN = {
    kitchen: ["fridge", "oven", "ksink", "counter", "counter", rnd() < .5 ? "counter" : null],
    bathroom: ["toilet", "bsink", "medcab"],
    bedroom: ["bed", "wardrobe", "dresser", rnd() < .3 ? "bookcase" : null],
    living: ["sofa", "tv", "bookcase", rnd() < .3 ? "dresser" : null],
  };
  for (const r of found) furnishRoom(r, FURN[r.type].filter(Boolean));
  b.x0 = x0; b.y0 = y0; b.x1 = x1; b.y1 = y1;
  finishBuilding(b, "house", front);
}

// place furniture against walls while keeping every doorway and window reachable
function furnishRoom(r, list){
  const set = new Set(r.tiles.map(([x, y]) => ix(x, y)));
  const access = [], cands = [];
  for (const [x, y] of r.tiles){
    let wallAdj = false, openAdj = false;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const t = tile[ix(x + dx, y + dy)];
      if (t === T.WALL) wallAdj = true;
      if (t === T.DOOR || t === T.WIN) openAdj = true;
    }
    if (openAdj) access.push(ix(x, y));
    else if (wallAdj) cands.push([x, y]);
  }
  const reachable = () => {
    if (!access.length) return true;
    const seen = new Set([access[0]]), st = [access[0]];
    while (st.length){ const i = st.pop(), x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const j = ix(x + dx, y + dy);
        if (set.has(j) && !seen.has(j) && !objs.has(j)){ seen.add(j); st.push(j); } } }
    return access.every(a => seen.has(a));
  };
  for (const type of list){
    for (let tries = 0; tries < 8 && cands.length; tries++){
      const k = Math.floor(rnd() * cands.length), [x, y] = cands[k];
      cands.splice(k, 1);
      placeObj(type, x, y, r.id);
      if (reachable()) break;
      objs.delete(ix(x, y));
    }
  }
}

function placeObj(type, x, y, rid){
  const o = { type, x, y, items: null, room: rid };
  if (OBJ[type].water) o.water = -1;   // -1 = mains water (until shutoff)
  if (OBJ[type].toilet) o.water = 0;
  if (type === "car") o.dir = (tile[ix(x - 1, y)] === T.ROAD && tile[ix(x + 1, y)] === T.ROAD) ? [1, 0] : [0, 1];
  else {
    for (const [dx, dy] of [[0, -1], [-1, 0], [0, 1], [1, 0]]){
      const t = inb(x + dx, y + dy) ? tile[ix(x + dx, y + dy)] : -1;
      if (t === T.WALL || t === T.WIN){ o.dir = [-dx, -dy]; break; }
    }
  }
  objs.set(ix(x, y), o); return o;
}

function genStore(x0, y0, x1, y1, kind, frontY){
  const b = newBuilding(kind);
  b.x0 = x0; b.y0 = y0; b.x1 = x1; b.y1 = y1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){
    const edge = x === x0 || x === x1 || y === y0 || y === y1;
    tile[ix(x, y)] = edge ? T.WALL : T.FLOOR; bldId[ix(x, y)] = b.id;
  }
  const r = { id: rooms.length, type: kind, tiles: [], b: b.id }; rooms.push(r);
  for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++){ roomId[ix(x, y)] = r.id; r.tiles.push([x, y]); }
  const mx = Math.floor((x0 + x1) / 2);
  setDoor(mx, frontY, false); setDoor(mx + 1, frontY, rnd() < 0.3);
  for (let x = x0 + 2; x < x1 - 1; x++) if (Math.abs(x - mx) > 2 && x % 2 === 0) setWin(x, frontY);
  const inner = frontY === y0 ? 1 : -1;
  const backY = frontY === y0 ? y1 - 2 : y0 + 2;
  const shelfY0 = frontY === y0 ? y0 + 3 : y0 + 2, shelfY1 = frontY === y0 ? y1 - 2 : y1 - 3;
  for (let x = x0 + 2; x <= x1 - 2; x += 3){
    if (Math.abs(x - mx) <= 1) continue;
    for (let y = shelfY0; y <= shelfY1; y++){ const o = placeObj(kind === "hardware" && rnd() < .4 ? "crate" : "shelf", x, y, r.id); o.store = kind; }
  }
  // checkout near the door
  if (inb(mx - 2, frontY + inner * 2) && !objs.has(ix(mx - 2, frontY + inner * 2))) placeObj("checkout", mx - 2, frontY + inner * 2, r.id);
  if (kind === "pharmacy") placeObj("medcab", x1 - 1, backY, r.id);
  finishBuilding(b, kind, frontY === y0 ? "top" : "bottom");
}

function genCommercial(x0, y0, x1, y1){
  genStore(x0, y0, x1, y0 + 10, "grocery", y0);
  genStore(x0, y1 - 10, x0 + 10, y1, "pharmacy", y1);
  genStore(x1 - 10, y1 - 10, x1, y1, "hardware", y1);
  for (let y = y0 + 11; y < y1 - 10; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS) tile[ix(x, y)] = T.LOT;
}

// ---------- passability ----------
function solidP(x, y){
  if (!inb(x, y)) return true;
  const t = tile[ix(x, y)];
  if (t === T.WALL || t === T.TREE || t === T.WIN || t === T.WATER || t === T.VOID) return true;
  if (t === T.DOOR) return !feats.get(ix(x, y)).open;
  const o = objs.get(ix(x, y)); return !!(o && OBJ[o.type].block);
}
function solidZ(x, y){
  if (!inb(x, y)) return true;
  const t = tile[ix(x, y)];
  if (t === T.WALL || t === T.TREE || t === T.WATER || t === T.VOID) return true;
  if (t === T.DOOR) return !feats.get(ix(x, y)).open;
  if (t === T.WIN){ const f = feats.get(ix(x, y)); return !(f.open || f.broken) || f.bar > 0; }
  const o = objs.get(ix(x, y)); return !!(o && OBJ[o.type].block);
}
// can a zombie path through it (possibly by bashing)?
function pathZ(x, y){
  if (!inb(x, y)) return false;
  const t = tile[ix(x, y)];
  if (t === T.WALL || t === T.TREE || t === T.WATER || t === T.VOID) return false;
  if (t === T.DOOR || t === T.WIN) return true;
  const o = objs.get(ix(x, y)); return !(o && OBJ[o.type].block && !o.built && !OBJ[o.type].fence);
}
function opaque(x, y){
  if (!inb(x, y)) return true;
  const t = tile[ix(x, y)];
  if (t === T.WALL) return true;
  if (t === T.DOOR) return !feats.get(ix(x, y)).open;
  if (t === T.WIN){ const f = feats.get(ix(x, y)); return f.bar >= 2 || (f.curtain && !f.broken && !f.open); }
  return false;
}
// is this exact point inside something you can't see through?
function pointOpaque(x, y){
  const tx = Math.floor(x), ty = Math.floor(y);
  if (!inb(tx, ty)) return true;
  const t = tile[ix(tx, ty)];
  let rs;
  if (t === T.WALL) rs = shapeRects(tx, ty, "p");
  else if (t === T.DOOR){ const f = feats.get(ix(tx, ty)); if (f.open) return false; rs = [slabRect(f)]; }
  else if (t === T.WIN){ const f = feats.get(ix(tx, ty)); if (!(f.bar >= 2 || (f.curtain && !f.broken && !f.open))) return false; rs = [slabRect(f)]; }
  else return false;
  for (const q of rs) if (x >= q[0] && x <= q[2] && y >= q[1] && y <= q[3]) return true;
  return false;
}
// line of sight between two points, tested against the actual thin wall slabs.
// tileTarget: the target is a tile (counts as seen once the ray reaches it)
function los(ax, ay, bx, by, tileTarget){
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy), n = Math.ceil(d / 0.11);
  const tx = Math.floor(bx), ty = Math.floor(by);
  for (let i = 1; i < n; i++){
    const x = ax + dx * i / n, y = ay + dy * i / n;
    if (tileTarget && Math.floor(x) === tx && Math.floor(y) === ty) return true;
    if (pointOpaque(x, y)) return false;
  }
  return true;
}

// ============================================================
// Thin-wall geometry: walls run along the centre line of wall tiles,
// so collision uses real shapes instead of whole tiles.
// ============================================================
const WT = 0.09, WTC = 0.12, WALLOFF = -0.39, WRC = new Map();
const wallish = (x, y) => inb(x, y) && (tile[ix(x, y)] === T.WALL || tile[ix(x, y)] === T.DOOR || tile[ix(x, y)] === T.WIN);
// furniture footprint in local coords: u along the wall, v out from the wall
const FOOT = { fridge:[.1,0,.9,.78], oven:[.06,0,.94,.88], counter:[0,0,1,.9], ksink:[0,0,1,.9], bsink:[.15,0,.85,.68], toilet:[.25,0,.75,.8],
  bed:[.02,0,.98,1.0], wardrobe:[.03,0,.97,.64], dresser:[.06,0,.94,.58], sofa:[0,0,1,.92], bookcase:[.04,0,.96,.44], tv:[.1,0,.9,.78],
  medcab:[.18,0,.82,.22], crate:[.1,.1,.9,.9], shelf:[.08,.12,.92,.88], checkout:[0,.1,1,.9] };
const NOOFF = new Set(["shelf", "crate", "checkout", "car"]);
function objFrame(o){
  const [dx, dy] = o.dir || [0, 1], x = o.x, y = o.y, off = o.dir && !NOOFF.has(o.type) ? WALLOFF : 0;
  if (dy === 1) return (u, v) => [x + u, y + v + off];
  if (dy === -1) return (u, v) => [x + 1 - u, y + 1 - v - off];
  if (dx === 1) return (u, v) => [x + v + off, y + 1 - u];
  return (u, v) => [x + 1 - v - off, y + u];
}
function objRect(o){
  if (o.horiz !== undefined && o.horiz !== null && (OBJ[o.type].fence || o.type === "hedge")) return o.horiz ? [o.x, o.y + .42, o.x + 1, o.y + .58] : [o.x + .42, o.y, o.x + .58, o.y + 1];
  if (o.type === "car") return o.dir[0] ? [o.x - .45, o.y + .2, o.x + 1.45, o.y + .8] : [o.x + .2, o.y - .45, o.x + .8, o.y + 1.45];
  const F = FOOT[o.type] || [.08, .08, .92, .92], m = objFrame(o), a = m(F[0], F[1]), b = m(F[2], F[3]);
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
}
function slabRect(f){ return f.horiz ? [f.x, f.y + .5 - WTC, f.x + 1, f.y + .5 + WTC] : [f.x + .5 - WTC, f.y, f.x + .5 + WTC, f.y + 1]; }
function shapeRects(x, y, who){
  if (!inb(x, y)) return [[x, y, x + 1, y + 1]];
  const t = tile[ix(x, y)];
  if (t === T.WATER || t === T.VOID) return [[x, y, x + 1, y + 1]];
  if (t === T.WALL){
    const c = WRC.get(ix(x, y)); if (c) return c;
    const r = [[x + .5 - WTC, y + .5 - WTC, x + .5 + WTC, y + .5 + WTC]];
    if (wallish(x + 1, y)) r.push([x + .5, y + .5 - WTC, x + 1, y + .5 + WTC]);
    if (wallish(x - 1, y)) r.push([x, y + .5 - WTC, x + .5, y + .5 + WTC]);
    if (wallish(x, y + 1)) r.push([x + .5 - WTC, y + .5, x + .5 + WTC, y + 1]);
    if (wallish(x, y - 1)) r.push([x + .5 - WTC, y, x + .5 + WTC, y + .5]);
    WRC.set(ix(x, y), r); return r;
  }
  if (t === T.TREE) return [[x + .38, y + .38, x + .62, y + .62]];
  if (t === T.DOOR){
    const f = feats.get(ix(x, y));
    const r = f.horiz ? [[x, y + .5 - WTC, x + .1, y + .5 + WTC], [x + .9, y + .5 - WTC, x + 1, y + .5 + WTC]]
                      : [[x + .5 - WTC, y, x + .5 + WTC, y + .1], [x + .5 - WTC, y + .9, x + .5 + WTC, y + 1]];
    if (!f.open) r.push(slabRect(f));
    return r;
  }
  if (t === T.WIN){
    const f = feats.get(ix(x, y));
    return (who === "p" || f.iron || !(f.open || f.broken) || f.bar > 0) ? [slabRect(f)] : null;
  }
  const o = objs.get(ix(x, y));
  if (o && OBJ[o.type].block && !o.open){ if (OBJ[o.type].fence && who === "z") return null; return OBJ[o.type].fence ? fenceRects(o) : [objRect(o)]; }
  return null;
}
// which floor tile a point "belongs" to, even when standing in the half of a wall tile
function sideTile(x, y){
  const tx = Math.floor(x), ty = Math.floor(y);
  if (!wallish(tx, ty)) return [tx, ty];
  const fx = x - tx - .5, fy = y - ty - .5;
  if (Math.abs(fx) > Math.abs(fy)) return [tx + (fx >= 0 ? 1 : -1), ty];
  return [tx, ty + (fy >= 0 ? 1 : -1)];
}
const insideAt = (x, y) => { const [a, b] = sideTile(x, y); return inb(a, b) && roomId[ix(a, b)] >= 0; };
