// ============================================================
// Part 10: procedural county. Towns with their own street grids,
// highways between them, farms, forests and ponds from seeded noise.
// Everything here uses the seeded rnd() so a seed always rebuilds
// exactly the same county (saves rely on this).
// ============================================================
T.WATER = 10;
let ROADS = [], ZONE = null, TOWNS = [];

function vnoise(seed){
  const g = (x, y) => { let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const sm = t => t * t * (3 - 2 * t);
  return (x, y, sc) => {
    const fx = x / sc, fy = y / sc, ix_ = Math.floor(fx), iy_ = Math.floor(fy), tx = sm(fx - ix_), ty = sm(fy - iy_);
    const a = g(ix_, iy_), b = g(ix_ + 1, iy_), c = g(ix_, iy_ + 1), d = g(ix_ + 1, iy_ + 1);
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  };
}

function roadRect(x0, y0, x1, y1){ // inclusive, 3 wide roads are passed as their full rect
  for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++){
    if (bldId[ix(x, y)] >= 0) continue;
    tile[ix(x, y)] = T.ROAD; objs.delete(ix(x, y));
  }
}
function hRoad(y, xa, xb){ const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb); roadRect(x0, y - 1, x1, y + 1); ROADS.push([x0, y + .5, x1 + 1, y + .5]); }
function vRoad(x, ya, yb){ const y0 = Math.min(ya, yb), y1 = Math.max(ya, yb); roadRect(x - 1, y0, x + 1, y1); ROADS.push([x + .5, y0, x + .5, y1 + 1]); }

function genWorld(seed){
  srand(seed);
  W = CFG.W; H = CFG.H;
  tile = new Uint8Array(W * H).fill(T.GRASS);
  roomId = new Int16Array(W * H).fill(-1);
  bldId = new Int16Array(W * H).fill(-1);
  explored = new Uint8Array(W * H);
  ZONE = new Uint8Array(W * H);
  objs = new Map(); feats = new Map(); floorItems = new Map();
  rooms = []; buildings = []; ROADS = []; TOWNS = [];
  if (typeof WRC !== "undefined") WRC.clear();

  // 1. wild terrain: forests and ponds
  const nF = vnoise(seed + 11), nW = vnoise(seed + 29), nD = vnoise(seed + 47);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    const f = nF(x, y, 26) * .7 + nF(x, y, 9) * .3;
    const w = nW(x, y, 30) * .75 + nW(x, y, 11) * .25;
    if (w > .76) tile[ix(x, y)] = T.WATER;
    else if (f > .56 && rnd() < (f - .52) * 2.2) tile[ix(x, y)] = T.TREE;
    else if (f < .3 && nD(x, y, 14) > .62) tile[ix(x, y)] = T.DIRT;
    else if (rnd() < .012) tile[ix(x, y)] = T.TREE;
  }
  // 2. towns
  const want = Math.max(2, Math.round(W * H / 20000));
  for (let tries = 0; TOWNS.length < want && tries < 400; tries++){
    const mb = W >= 300 ? 4 : W >= 220 ? 3 : 2, bx = ri(2, mb, rnd), by = ri(2, mb, rnd), B = 30;
    const w = bx * B + 3, h = by * B + 3;
    const ox = ri(8, W - w - 8, rnd), oy = ri(8, H - h - 8, rnd);
    if (ox < 8 || oy < 8) continue;
    if (TOWNS.some(t => ox < t.x1 + 30 && ox + w > t.x0 - 30 && oy < t.y1 + 30 && oy + h > t.y0 - 30)) continue;
    TOWNS.push({ x0: ox, y0: oy, x1: ox + w, y1: oy + h, bx, by, B, name: townName() });
  }
  if (!TOWNS.length){ const w = 63, ox = Math.floor(W / 2 - 31), oy = Math.floor(H / 2 - 31); TOWNS.push({ x0: ox, y0: oy, x1: ox + w, y1: oy + w, bx: 2, by: 2, B: 30, name: townName() }); }
  for (const t of TOWNS) buildTown(t);
  // 3. highways between towns (each joins its nearest earlier town), bridging water
  for (let i = 1; i < TOWNS.length; i++){
    const a = TOWNS[i]; let b = TOWNS[0], bd = 1e9;
    for (let j = 0; j < i; j++){ const t = TOWNS[j], d = Math.hypot(t.cx - a.cx, t.cy - a.cy); if (d < bd){ bd = d; b = t; } }
    const ay = a.roadsY[ri(0, a.roadsY.length - 1, rnd)], bxr = b.roadsX[ri(0, b.roadsX.length - 1, rnd)];
    const ax = a.cx < bxr ? a.x1 : a.x0;
    highwayH(ay, ax, bxr); highwayV(bxr, ay, b.cy < ay ? b.y1 : b.y0);
  }
  // a road out of the county from the first town, for flavour
  { const t = TOWNS[0], y = t.roadsY[0]; highwayH(y, t.x0, 0); }
  // 4. farms along the highways
  for (const [x0, y0, x1, y1] of ROADS.slice()){
    const len = Math.hypot(x1 - x0, y1 - y0); if (len < 40) continue;
    for (let k = 0; k < len / 45; k++){
      if (rnd() > .55) continue;
      const t = rnd(), px = Math.floor(x0 + (x1 - x0) * t), py = Math.floor(y0 + (y1 - y0) * t);
      const horiz = Math.abs(y1 - y0) < 1, side = rnd() < .5 ? -1 : 1;
      const lx = horiz ? px - 6 : px + side * (side > 0 ? 3 : 15), ly = horiz ? py + side * (side > 0 ? 3 : 15) : py - 6;
      genFarm(lx, ly, horiz ? (side > 0 ? "top" : "bottom") : "top");
    }
  }
  // 5. cars on the roads
  const nCars = Math.round(W * H / 400);
  for (let n = 0, tries = 0; n < nCars && tries < nCars * 30; tries++){
    const x = ri(2, W - 3, rnd), y = ri(2, H - 3, rnd);
    if (tile[ix(x, y)] !== T.ROAD || objs.has(ix(x, y))) continue;
    if (!(tile[ix(x - 1, y)] === T.ROAD && tile[ix(x + 1, y)] === T.ROAD) && !(tile[ix(x, y - 1)] === T.ROAD && tile[ix(x, y + 1)] === T.ROAD)) continue;
    let near = false; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){ const o = objs.get(ix(x + dx, y + dy)); if (o && o.type === "car") near = true; }
    if (near) continue;
    placeObj("car", x, y, -1).col = pick(["#6b2e2a", "#2f4a5e", "#8a8470", "#3e4a3a", "#9a9a94", "#5a4a3a", "#7a6a2a", "#2a2a2e"], rnd); n++;
  }
  // sidewalks along town roads
  for (const t of TOWNS) for (let y = t.y0 - 1; y <= t.y1 + 1; y++) for (let x = t.x0 - 1; x <= t.x1 + 1; x++){
    if (!inb(x, y) || tile[ix(x, y)] !== T.GRASS) continue;
    if ([[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => inb(x + dx, y + dy) && tile[ix(x + dx, y + dy)] === T.ROAD)) tile[ix(x, y)] = T.WALK;
  }
  // which wall tiles are on a building's outside edge
  perim = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++){
    const b = bldId[ix(x, y)]; if (b < 0 || tile[ix(x, y)] === T.FLOOR) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (bldId[ix(x + dx, y + dy)] !== b) perim[ix(x, y)] = 1;
  }
}
function townName(){
  const a = ["Harlow", "Millbrook", "Cedar", "Ashford", "Pine", "Fairview", "Grafton", "Oak", "Elk", "Brandt", "Lenox", "Mercer"];
  const b = [" Creek", "ville", " Springs", " Falls", " Hollow", " Junction", "wood", " Ridge"];
  return pick(a, rnd) + pick(b, rnd);
}
function clearRect(x0, y0, x1, y1){
  for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++){
    tile[ix(x, y)] = T.GRASS; ZONE[ix(x, y)] = 1;
  }
}
function buildTown(t){
  const { x0, y0, bx, by, B } = t;
  clearRect(x0 - 4, y0 - 4, t.x1 + 4, t.y1 + 4);
  t.cx = (x0 + t.x1) / 2; t.cy = (y0 + t.y1) / 2;
  t.roadsX = []; t.roadsY = [];
  for (let i = 0; i <= bx; i++){ const x = x0 + 1 + i * B; vRoad(x, y0, t.y1); t.roadsX.push(x); }
  for (let j = 0; j <= by; j++){ const y = y0 + 1 + j * B; hRoad(y, x0, t.x1); t.roadsY.push(y); }
  const comm = new Set([`${ri(0, bx - 1, rnd)},${ri(0, by - 1, rnd)}`]);
  if (bx * by >= 9) comm.add(`${ri(0, bx - 1, rnd)},${ri(0, by - 1, rnd)}`);
  for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++){
    const bx0 = x0 + 1 + i * B + 4, bx1 = x0 + 1 + (i + 1) * B - 4, by0 = y0 + 1 + j * B + 4, by1 = y0 + 1 + (j + 1) * B - 4;
    if (comm.has(`${i},${j}`)) genCommercialR(bx0, by0, bx1, by1);
    else if (!t.park && rnd() < .07){ t.park = true; genPark(bx0, by0, bx1, by1); }
    else {
      const mid = Math.floor((bx0 + bx1) / 2), midy = Math.floor((by0 + by1) / 2);
      for (const L of [[bx0, by0, mid - 1, midy - 1, "top"], [mid + 1, by0, bx1, midy - 1, "top"], [bx0, midy + 1, mid - 1, by1, "bottom"], [mid + 1, midy + 1, bx1, by1, "bottom"]])
        if (rnd() < .93) genLot(...L);
    }
  }
}
// a commercial block with three random shops
function genCommercialR(x0, y0, x1, y1){
  const kinds = ["grocery", "pharmacy", "hardware"];
  const k = () => pick(kinds, rnd);
  genStore(x0, y0, x1, y0 + 10, k(), y0);
  genStore(x0, y1 - 10, x0 + 10, y1, k(), y1);
  genStore(x1 - 10, y1 - 10, x1, y1, k(), y1);
  for (let y = y0 + 11; y < y1 - 10; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS) tile[ix(x, y)] = T.LOT;
}
function highwayH(y, xa, xb){
  hRoad(y, xa, xb);
  for (let x = Math.min(xa, xb); x <= Math.max(xa, xb); x++) for (let dy = -3; dy <= 3; dy++){
    if (!inb(x, y + dy)) continue; const i = ix(x, y + dy);
    if (Math.abs(dy) >= 2 && (tile[i] === T.TREE || tile[i] === T.WATER)) tile[i] = T.GRASS;
  }
}
function highwayV(x, ya, yb){
  vRoad(x, ya, yb);
  for (let y = Math.min(ya, yb); y <= Math.max(ya, yb); y++) for (let dx = -3; dx <= 3; dx++){
    if (!inb(x + dx, y)) continue; const i = ix(x + dx, y);
    if (Math.abs(dx) >= 2 && (tile[i] === T.TREE || tile[i] === T.WATER)) tile[i] = T.GRASS;
  }
}
function genFarm(lx, ly, front){
  const x0 = lx, y0 = ly, x1 = lx + 12, y1 = ly + 11;
  if (x0 < 3 || y0 < 3 || x1 > W - 4 || y1 > H - 4) return;
  for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 13; x++){
    if (!inb(x, y)) return;
    const t = tile[ix(x, y)]; if (t === T.ROAD || t === T.FLOOR || t === T.WALL || t === T.DOOR || t === T.WIN || t === T.WALK) return;
  }
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1 + 12; x++){ tile[ix(x, y)] = T.GRASS; ZONE[ix(x, y)] = 1; }
  genLot(x0, y0, x1, y1, front);
  // crop field beside the house
  for (let y = y0; y <= y1; y++) for (let x = x1 + 2; x <= x1 + 12; x++) tile[ix(x, y)] = (y % 2) ? T.DIRT : T.GRASS;
  farmPen(x0, y0, x1, y1);
  farmBarn(x0, y0, x1, y1);
}

// zombies live mostly in towns
function spawnZombies(n){
  let tries = 0;
  while (Z.length < n && tries++ < n * 60){
    const x = ri(1, W - 2), y = ri(1, H - 2);
    const t = tile[ix(x, y)];
    if (t === T.WALL || t === T.TREE || t === T.WATER || t === T.DOOR || t === T.WIN) continue;
    const o = objs.get(ix(x, y)); if (o && OBJ[o.type].block) continue;
    if (Math.hypot(x - P.x, y - P.y) < 16) continue;
    if (bldId[ix(x, y)] >= 0 && bldId[ix(x, y)] === G.startBld) continue;
    if (!ZONE[ix(x, y)] && R() < 0.85) continue;
    const store = bldId[ix(x, y)] >= 0 && buildings[bldId[ix(x, y)]].kind !== "house";
    const count = store && R() < 0.5 ? 2 : 1;
    for (let k = 0; k < count; k++) Z.push(newZombie(x + 0.5 + rf(-.2, .2), y + 0.5 + rf(-.2, .2)));
  }
}
