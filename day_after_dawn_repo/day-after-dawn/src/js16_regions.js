// ============================================================
// Part 16: an endless county. The world is generated in 128 tile
// regions as you approach them. Each region is seeded from the world
// seed and its coordinates, so it always comes out the same.
// ============================================================
T.VOID = 11;
const REG = 128;
let REGIONS = null, REGION_ORDER = [], RX = 0, RY = 0, WSEED = 0, NOI = null;
let REG_RESTORING = false, DEFER_SPAWN = true, PENDING_SPAWN = [], FLOWBUF = null, regGenMs = 0;
function hash3(a, b, c){ let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1013904223)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; }
const hwyOff = (i, salt) => 34 + hash3(WSEED, i * 31 + salt, 77) % 60;

Object.assign(OBJ, {
  desk:      { n: "Desk", cont: "desk", block: true, h: 14, col: "#7b5638", cap: 8 },
  locker:    { n: "Locker", cont: "locker_school", block: true, h: 40, col: "#5a6e86", cap: 10 },
  pew:       { n: "Pew", block: true, h: 14, col: "#6b4a30", seat: true },
  pump:      { n: "Gas pump", block: true, h: 26, col: "#c8c4b8", pump: true },
  vending:   { n: "Vending machine", cont: "vending", block: true, h: 40, col: "#a8302a", cap: 15 },
  filecab:   { n: "Filing cabinet", cont: "files", block: true, h: 26, col: "#7a7e82", cap: 15, dis: true },
  armycrate: { n: "Army crate", cont: "army", block: true, h: 14, col: "#4e5a36", cap: 30 },
  hbed:      { n: "Hospital bed", block: true, h: 12, col: "#c8ccd0", bed: true },
  bunk:      { n: "Bunk bed", block: true, h: 30, col: "#5a5e52", bed: true },
  table:     { n: "Table", block: true, h: 14, col: "#8a6a48" },
  sandbag:   { n: "Sandbags", block: true, h: 12, col: "#8a7a58" },
});
Object.assign(LOOT, {
  desk:          { rolls: [0, 2], items: [["mag", 3], ["comic", 3], ["novel", 2], ["candy", 3], ["screwdrv", 1], ["bk_aid", 1], ["bk_carp", 1], ["pills", 1], ["batteries", 2]] },
  locker_school: { rolls: [0, 2], items: [["schoolbag", 3], ["comic", 3], ["soda", 3], ["chips", 3], ["candy", 3], ["bat", 1], ["golf", 1], ["watch", 1]] },
  locker_police: { rolls: [1, 3], items: [["nightstick", 4], ["hunting", 2], ["bandage", 3], ["crowbar", 1], ["duffel", 2], ["water", 2], ["pills", 1]] },
  vending:       { rolls: [2, 6], items: [["soda", 5], ["chips", 5], ["candy", 5], ["water", 3], ["crackers", 2]] },
  files:         { rolls: [0, 2], items: [["mag", 4], ["novel", 2], ["bk_carp", 1], ["bk_aid", 1], ["bk_blunt", 1], ["bk_sneak", 1]] },
  army:          { rolls: [2, 5], items: [["water", 4], ["beans", 4], ["tuna", 3], ["bandage", 4], ["disinf", 2], ["antibio", 2], ["pills", 2], ["hatchet", 2], ["hunting", 2], ["backpack", 2], ["gascan", 2], ["batteries", 2], ["axe", 1]] },
  medcab_hosp:   { rolls: [2, 5], items: [["bandage", 6], ["disinf", 4], ["pills", 4], ["antibio", 3], ["needle", 3], ["tweezers", 2]] },
});
Object.assign(ITEMS, {
  nightstick: { n: "Nightstick", w: 1.0, cat: "weapon", skill: "shortblunt", dmg: [.6, .9], range: 1.1, spd: .75, end: .045, cond: 28, kd: .4, crit: .12 },
  carkey:     { n: "Car key", w: .05, cat: "misc" },
});
for (const k in ITEMS){ ITEMS[k].id = k; ITEMS[k].tags = ITEMS[k].tags || []; }

// ---------- world bootstrap ----------
function genWorld(seed){
  W = CFG.W; H = CFG.H;
  tile = new Uint8Array(W * H).fill(T.VOID);
  roomId = new Int16Array(W * H).fill(-1);
  bldId = new Int16Array(W * H).fill(-1);
  explored = new Uint8Array(W * H); ZONE = new Uint8Array(W * H); perim = new Uint8Array(W * H);
  objs = new Map(); feats = new Map(); floorItems = new Map();
  rooms = []; buildings = []; ROADS = []; TOWNS = [];
  if (typeof WRC !== "undefined") WRC.clear();
  WSEED = seed | 0; NOI = { f: vnoise(seed + 11), w: vnoise(seed + 29), d: vnoise(seed + 47) };
  RX = (W / REG) | 0; RY = (H / REG) | 0;
  REGIONS = new Uint8Array(RX * RY); REGION_ORDER = []; resetPockets(); REG_JOB = null; PENDING_SPAWN = []; DEFER_SPAWN = true; FLOWBUF = null; flow = null;
  V = [];
  const c = RX >> 1;
  genRegion(c, c);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) genRegion(c + dx, c + dy);
}
function genRegionK(k){ genRegion(k % RX, (k / RX) | 0); }

function genRegion(rx, ry){
  if (rx < 0 || ry < 0 || rx >= RX || ry >= RY || ry * REG >= PK_Y0) return;
  const k = ry * RX + rx; if (REGIONS[k]) return;
  REGIONS[k] = 1; REGION_ORDER.push(k);
  srand(hash3(WSEED, rx * 7 + 1, ry * 13 + 3) || 1);
  const x0 = rx * REG, y0 = ry * REG, x1 = x0 + REG - 1, y1 = y0 + REG - 1;
  // terrain from world-space noise, so regions join up seamlessly
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){
    const f = NOI.f(x, y, 26) * .7 + NOI.f(x, y, 9) * .3;
    const w = NOI.w(x, y, 30) * .75 + NOI.w(x, y, 11) * .25;
    let t = T.GRASS;
    if (w > .76) t = T.WATER;
    else if (f > .56 && rnd() < (f - .52) * 2.2) t = T.TREE;
    else if (f < .3 && NOI.d(x, y, 14) > .62) t = T.DIRT;
    else if (rnd() < .012) t = T.TREE;
    tile[ix(x, y)] = t;
  }
  const R0 = { x0, y0, x1, y1, hy: y0 + hwyOff(ry, 1), hx: x0 + hwyOff(rx, 2) };
  highwayH(R0.hy, x0, x1); highwayV(R0.hx, y0, y1);
  const center = rx === RX >> 1 && ry === RY >> 1, roll = rnd();
  R0.kind = center ? "town" : roll < .3 ? "town" : roll < .46 ? "village" : roll < .6 ? "civic" : roll < .84 ? "rural" : "wild";
  if (["town", "village", "civic"].includes(R0.kind)){
    const big = R0.kind === "town" ? 3 : 2;
    let ok = false;
    for (const [bx, by] of [[big, R0.kind === "village" ? 2 : big], [big, 2], [2, big], [2, 2], [2, 1], [1, 2]]) if (!ok && regionTown(R0, bx, by)) ok = true;
    if (!ok){ R0.kind = "rural"; regionRural(R0); }
  } else if (R0.kind === "rural") regionRural(R0);
  else regionWild(R0);
  // cars on this region's roads
  const nCars = { town: 20, village: 10, civic: 14, rural: 7, wild: 3 }[R0.kind];
  for (let n = 0, tries = 0; n < nCars && tries < nCars * 40; tries++){
    const x = ri(x0 + 2, x1 - 2, rnd), y = ri(y0 + 2, y1 - 2, rnd);
    if (tile[ix(x, y)] !== T.ROAD || objs.has(ix(x, y))) continue;
    if (!(tile[ix(x - 1, y)] === T.ROAD && tile[ix(x + 1, y)] === T.ROAD) && !(tile[ix(x, y - 1)] === T.ROAD && tile[ix(x, y + 1)] === T.ROAD)) continue;
    let near = false; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){ const o = objs.get(ix(x + dx, y + dy)); if (o && o.type === "car") near = true; }
    if (near) continue;
    placeObj("car", x, y, -1).col = pick(["#6b2e2a", "#2f4a5e", "#8a8470", "#3e4a3a", "#9a9a94", "#5a4a3a", "#7a6a2a", "#2a2a2e"], rnd); n++;
  }
  // sidewalks around town roads
  for (const t of TOWNS) if (t.region === k) for (let y = t.y0 - 1; y <= t.y1 + 1; y++) for (let x = t.x0 - 1; x <= t.x1 + 1; x++){
    if (!inb(x, y) || tile[ix(x, y)] !== T.GRASS) continue;
    if ([[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => tile[ix(x + dx, y + dy)] === T.ROAD)) tile[ix(x, y)] = T.WALK;
  }
  for (const t of TOWNS) if (t.region === k) placeTownDecor(t);
  placeRoadDecor(R0);
  // building outlines for this region
  for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++){
    const b = bldId[ix(x, y)]; if (b < 0 || tile[ix(x, y)] === T.FLOOR) continue;
    for (let dy = -1; dy <= 1 && !perim[ix(x, y)]; dy++) for (let dx = -1; dx <= 1; dx++) if (bldId[ix(x + dx, y + dy)] !== b){ perim[ix(x, y)] = 1; break; }
  }
  for (const o of objs.values()) if (!o.g && o.x >= x0 && o.x <= x1 && o.y >= y0 && o.y <= y1){ o.g = 1; o.w0 = o.water; }
  for (const f of feats.values()) if (f.l0 === undefined && f.x >= x0 && f.x <= x1 && f.y >= y0 && f.y <= y1){ f.l0 = f.locked; f.c0 = f.curtain; f.h0 = f.hp; }
  convertCars();
  const nZ = { town: 260, village: 110, civic: 200, rural: 45, wild: 22 }[R0.kind] + (R0.extraZ || 0);
  if (!REG_RESTORING){ if (DEFER_SPAWN) PENDING_SPAWN.push([x0, y0, x1, y1, nZ, R0.soldiers || null]); else spawnIn(x0, y0, x1, y1, nZ, R0.soldiers || null); }
  if (typeof invalidateWorldRect === "function") invalidateWorldRect(x0 - 1, y0 - 1, x1 + 1, y1 + 1);
}

// ---------- towns ----------
const TOWN_MIX = [["houses", 56], ["shops", 10], ["park", 4], ["hospital", 4], ["school", 4], ["police", 3], ["church", 3], ["apartments", 6], ["office", 3], ["motel", 3], ["warehouse", 2], ["gas", 4]];
const VILLAGE_MIX = [["houses", 70], ["shops", 8], ["church", 8], ["gas", 8], ["motel", 4], ["park", 3]];
const CIVIC_MIX = [["hospital", 14], ["school", 13], ["police", 12], ["warehouse", 12], ["office", 10], ["apartments", 12], ["shops", 8], ["gas", 6], ["church", 4], ["houses", 8]];
const UNIQUE = new Set(["hospital", "school", "police", "park", "gas"]);
function regionTown(R0, bx, by){
  const B = 30, w = bx * B + 3, h = by * B + 3;
  const fit = (hw, lo, hi, n, size) => { const o = [...Array(n + 1).keys()].sort(() => rnd() - .5); for (const i of o){ const s = hw - 1 - i * B; if (s >= lo + 3 && s + size <= hi - 3) return s; } return null; };
  const tx0 = fit(R0.hx, R0.x0, R0.x1, bx, w), ty0 = fit(R0.hy, R0.y0, R0.y1, by, h);
  if (tx0 == null || ty0 == null) return false;
  const t = { x0: tx0, y0: ty0, x1: tx0 + w, y1: ty0 + h, bx, by, B, name: townName(), kind: R0.kind, region: (R0.y0 / REG) * RX + R0.x0 / REG };
  t.cx = (t.x0 + t.x1) / 2; t.cy = (t.y0 + t.y1) / 2;
  TOWNS.push(t);
  for (let y = t.y0 - 4; y <= t.y1 + 4; y++) for (let x = t.x0 - 4; x <= t.x1 + 4; x++){ if (tile[ix(x, y)] !== T.ROAD) tile[ix(x, y)] = T.GRASS; ZONE[ix(x, y)] = 1; }
  for (let i = 0; i <= bx; i++) vRoad(t.x0 + 1 + i * B, t.y0, t.y1);
  for (let j = 0; j <= by; j++) hRoad(t.y0 + 1 + j * B, t.x0, t.x1);
  const mix = R0.kind === "civic" ? CIVIC_MIX : R0.kind === "village" ? VILLAGE_MIX : TOWN_MIX, used = new Set();
  for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++){
    const bx0 = t.x0 + 1 + i * B + 4, bx1 = t.x0 + 1 + (i + 1) * B - 4, by0 = t.y0 + 1 + j * B + 4, by1 = t.y0 + 1 + (j + 1) * B - 4;
    let kind = wpick(mix, rnd);
    if (UNIQUE.has(kind) && used.has(kind)) kind = "houses";
    used.add(kind);
    blockGen(kind, bx0, by0, bx1, by1, rnd() < .5 ? "top" : "bottom", R0);
  }
  return true;
}
function blockGen(kind, x0, y0, x1, y1, front, R0){
  const W2 = x1 - x0 + 1, H2 = y1 - y0 + 1;
  const place = (w, h, k, fr = front) => { const bx = x0 + Math.floor((W2 - w) / 2), by = fr === "top" ? y0 : y1 - h + 1; return genBuilding(bx, by, bx + w - 1, by + h - 1, k, fr); };
  const lot = (ya, yb) => { for (let y = ya; y <= yb; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS || tile[ix(x, y)] === T.TREE) tile[ix(x, y)] = T.LOT; };
  switch (kind){
    case "houses": {
      const mid = Math.floor((x0 + x1) / 2), midy = Math.floor((y0 + y1) / 2);
      for (const L of [[x0, y0, mid - 1, midy - 1, "top"], [mid + 1, y0, x1, midy - 1, "top"], [x0, midy + 1, mid - 1, y1, "bottom"], [mid + 1, midy + 1, x1, y1, "bottom"]]) if (rnd() < .94) genLot(...L);
      break;
    }
    case "shops": genCommercialR(x0, y0, x1, y1); break;
    case "park": genPark(x0, y0, x1, y1); break;
    case "hospital": place(W2, H2, "hospital"); R0.extraZ = (R0.extraZ || 0) + 40; break;
    case "school": place(W2, 19, "school"); front === "top" ? lot(y0 + 19, y1) : lot(y0, y1 - 19); break;
    case "police": place(W2, 15, "police"); front === "top" ? lot(y0 + 15, y1) : lot(y0, y1 - 15); break;
    case "church": place(15, 19, "church"); break;
    case "apartments": place(W2, 17, "apartments"); break;
    case "office": place(21, 19, "office"); break;
    case "warehouse": place(W2, 17, "warehouse"); front === "top" ? lot(y0 + 17, y1) : lot(y0, y1 - 17); break;
    case "motel": genMotel(x0, front === "top" ? y0 : y1 - 8, x1, front === "top" ? y0 + 8 : y1, front); front === "top" ? lot(y0 + 9, y1) : lot(y0, y1 - 9); break;
    case "gas": genGas(x0, y0, x1, y1, front); break;
  }
}

// ---------- generic building: walls, rooms split by BSP, doors, windows, furniture ----------
const SPEC = {
  hospital:   { min: 5, rooms: ["reception", "ward", "ward", "storage", "ward", "office", "staff", "ward", "ward"], win: 3, doors: 2, lock: .1 },
  school:     { min: 6, rooms: ["lobby", "gym", "cafeteria", "classroom", "classroom", "classroom", "office", "classroom"], win: 3, doors: 2, lock: .3 },
  police:     { min: 4, rooms: ["lobby", "office", "lockers", "cell", "cell", "storage", "office"], win: 4, doors: 1, lock: .3 },
  church:     { min: 6, rooms: ["chapel", "office"], win: 3, doors: 2, lock: .2 },
  apartments: { min: 4, rooms: ["living", "living", "bedroom", "kitchen", "bedroom", "bathroom", "kitchen", "bathroom", "bedroom"], win: 3, doors: 1, lock: .4 },
  office:     { min: 5, rooms: ["lobby", "office", "office", "office", "storage", "office", "office"], win: 2, doors: 2, lock: .3 },
  warehouse:  { min: 9, rooms: ["warehouse", "office"], win: 7, doors: 2, lock: .5 },
  bunker:     { min: 4, rooms: ["bunkroom", "storage", "bunkroom", "storage"], win: 0, doors: 1, lock: 1 },
  gas:        { min: 4, rooms: ["gasshop", "storage"], win: 2, doors: 1, lock: .2 },
  trailer:    { min: 3, rooms: ["living", "bedroom"], win: 3, doors: 1, lock: .3 },
};
const FURN2 = {
  reception: { wall: ["counter", "filecab", "vending", "sofa"] },
  ward:      { wall: ["hbed", "hbed", "medcab", "hbed", "hbed", "dresser"] },
  staff:     { wall: ["locker", "locker", "sofa", "fridge", "counter"] },
  storage:   { wall: ["shelf", "shelf", "crate", "shelf", "crate"] },
  lobby:     { wall: ["sofa", "vending", "filecab", "sofa"] },
  classroom: { wall: ["bookcase", "filecab", "locker"], rows: ["desk", 2, 2] },
  gym:       { wall: ["locker", "locker", "locker", "locker"] },
  cafeteria: { wall: ["counter", "fridge", "oven", "ksink", "vending"], rows: ["table", 2, 2] },
  office:    { wall: ["filecab", "bookcase", "filecab"], rows: ["desk", 3, 2] },
  lockers:   { wall: ["locker", "locker", "locker", "locker", "locker"] },
  cell:      { wall: ["bunk", "toilet"] },
  chapel:    { wall: ["bookcase"], rows: ["pew", 1, 2] },
  warehouse: { wall: ["crate", "crate", "shelf", "crate", "shelf"], rows: ["crate", 3, 3] },
  bunkroom:  { wall: ["bunk", "bunk", "armycrate", "bunk", "dresser"] },
  gasshop:   { wall: ["vending", "fridge", "counter"], rows: ["shelf", 2, 2] },
  motelroom: { wall: ["bed", "tv", "dresser"] },
  living:    { wall: ["sofa", "tv", "bookcase"] },
  bedroom:   { wall: ["bed", "wardrobe", "dresser"] },
  kitchen:   { wall: ["fridge", "oven", "ksink", "counter", "counter"] },
  bathroom:  { wall: ["toilet", "bsink", "medcab"] },
};
const SHELF_STORE = { hospital: "pharmacy", warehouse: "hardware", gas: "grocery", bunker: "grocery", police: "hardware", school: "grocery" };
function areaFree(x0, y0, x1, y1, R0, m = 2){
  if (x0 - m < R0.x0 + 2 || y0 - m < R0.y0 + 2 || x1 + m > R0.x1 - 2 || y1 + m > R0.y1 - 2) return false;
  for (let y = y0 - m; y <= y1 + m; y++) for (let x = x0 - m; x <= x1 + m; x++){
    const t = tile[ix(x, y)];
    if (t === T.ROAD || t === T.WALK || t === T.FLOOR || t === T.WALL || t === T.DOOR || t === T.WIN || t === T.LOT || bldId[ix(x, y)] >= 0 || objs.has(ix(x, y))) return false;
  }
  for (let y = y0 - m; y <= y1 + m; y++) for (let x = x0 - m; x <= x1 + m; x++) tile[ix(x, y)] = T.GRASS;
  return true;
}
function genBuilding(x0, y0, x1, y1, kind, front){
  const sp = SPEC[kind];
  const b = newBuilding(kind); b.x0 = x0; b.y0 = y0; b.x1 = x1; b.y1 = y1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){
    const e = x === x0 || x === x1 || y === y0 || y === y1;
    tile[ix(x, y)] = e ? T.WALL : T.FLOOR; bldId[ix(x, y)] = b.id; objs.delete(ix(x, y));
  }
  const doors = [];
  const nearDoor = (x, y) => doors.some(([dx, dy]) => Math.abs(dx - x) <= 1 && Math.abs(dy - y) <= 1);
  const split = (a0, b0, a1, b1, depth) => {
    const iw = a1 - a0 - 1, ih = b1 - b0 - 1, m = sp.min;
    const canV = iw >= 2 * m + 1, canH = ih >= 2 * m + 1;
    if ((!canV && !canH) || depth > 6 || (iw * ih < m * m * 3 && rnd() < .45)) return;
    const vert = canV && (!canH || iw > ih || (iw === ih && rnd() < .5));
    for (let tries = 0; tries < 8; tries++){
      if (vert){
        const c = ri(a0 + m + 1, a1 - m - 1, rnd);
        if (nearDoor(c, b0) || nearDoor(c, b1)) continue;
        for (let y = b0; y <= b1; y++) tile[ix(c, y)] = T.WALL;
        const d = ri(b0 + 1, b1 - 1, rnd); setDoor(c, d, false); doors.push([c, d]);
        split(a0, b0, c, b1, depth + 1); split(c, b0, a1, b1, depth + 1); return;
      }
      const c = ri(b0 + m + 1, b1 - m - 1, rnd);
      if (nearDoor(a0, c) || nearDoor(a1, c)) continue;
      for (let x = a0; x <= a1; x++) tile[ix(x, c)] = T.WALL;
      const d = ri(a0 + 1, a1 - 1, rnd); setDoor(d, c, false); doors.push([d, c]);
      split(a0, b0, a1, c, depth + 1); split(a0, c, a1, b1, depth + 1); return;
    }
  };
  split(x0, y0, x1, y1, 0);
  // front doors, as central as possible
  const fy = front === "top" ? y0 : y1, inner = front === "top" ? 1 : -1;
  const okDoor = (x, y, inn) => tile[ix(x, y)] === T.WALL && tile[ix(x, y + inn)] === T.FLOOR && tile[ix(x - 1, y)] === T.WALL && tile[ix(x + 1, y)] === T.WALL && tile[ix(x - 1, y + inn)] === T.FLOOR && tile[ix(x + 1, y + inn)] === T.FLOOR;
  const mid = (x0 + x1) >> 1;
  const cands = []; for (let x = x0 + 2; x <= x1 - 2; x++) if (okDoor(x, fy, inner)) cands.push(x);
  cands.sort((a, b2) => Math.abs(a - mid) - Math.abs(b2 - mid));
  const fronts = [];
  if (cands.length){
    const x = cands[0]; setDoor(x, fy, rnd() < sp.lock); fronts.push([x, fy]);
    if (sp.doors > 1 && okDoor(x + 1, fy, inner)){ setDoor(x + 1, fy, rnd() < sp.lock); fronts.push([x + 1, fy]); }
  }
  if (kind !== "bunker" && rnd() < .5){
    const by = front === "top" ? y1 : y0, bi = -inner, bc = []; for (let x = x0 + 2; x <= x1 - 2; x++) if (okDoor(x, by, bi)) bc.push(x);
    if (bc.length) setDoor(pick(bc, rnd), by, rnd() < sp.lock);
  }
  if (kind === "bunker") for (const [x, y] of fronts){ const f = feats.get(ix(x, y)); f.hp = 90; f.locked = true; }
  // windows
  if (sp.win){
    const winAt = (x, y, ox, oy) => { if (tile[ix(x, y)] !== T.WALL || tile[ix(x + ox, y + oy)] !== T.FLOOR || nearType(x, y, [T.DOOR, T.WIN], 1)) return; if (tile[ix(x - ox * 0 + (oy ? 1 : 0), y + (ox ? 1 : 0))] !== T.WALL && oy) return; setWin(x, y); };
    for (let x = x0 + 1; x < x1; x++) if ((x - x0) % sp.win === 2){ winAt(x, y0, 0, 1); winAt(x, y1, 0, -1); }
    for (let y = y0 + 1; y < y1; y++) if ((y - y0) % sp.win === 2){ winAt(x0, y, 1, 0); winAt(x1, y, -1, 0); }
  }
  // rooms
  const found = [];
  for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++){
    if (tile[ix(x, y)] !== T.FLOOR || roomId[ix(x, y)] >= 0) continue;
    const r = { id: rooms.length, type: "office", tiles: [], b: b.id }; rooms.push(r); found.push(r);
    const st = [[x, y]]; roomId[ix(x, y)] = r.id;
    while (st.length){ const [cx, cy] = st.pop(); r.tiles.push([cx, cy]);
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = cx + dx, ny = cy + dy;
        if (tile[ix(nx, ny)] === T.FLOOR && roomId[ix(nx, ny)] < 0){ roomId[ix(nx, ny)] = r.id; st.push([nx, ny]); } } }
  }
  const frontRoom = fronts.length ? rooms[roomId[ix(fronts[0][0], fronts[0][1] + inner)]] : null;
  const rest = found.filter(r => r !== frontRoom).sort((a, c) => c.tiles.length - a.tiles.length);
  if (frontRoom) frontRoom.type = sp.rooms[0];
  rest.forEach((r, i) => r.type = sp.rooms[1 + (i % (sp.rooms.length - 1))] || sp.rooms[0]);
  if (!frontRoom && rest.length) rest[0].type = sp.rooms[0];
  for (const r of found){
    const F = FURN2[r.type]; if (!F) continue;
    furnishRoom(r, F.wall.slice());
    if (F.rows) placeRows(r, ...F.rows);
  }
  // loot flavour by building
  for (const r of found) for (const [x, y] of r.tiles){
    const o = objs.get(ix(x, y)); if (!o) continue;
    if (o.type === "shelf") o.store = SHELF_STORE[kind] || "hardware";
    if (o.type === "locker" && kind === "police") o.loot = "locker_police";
    if (o.type === "medcab" && kind === "hospital") o.loot = "medcab_hosp";
    if (o.type === "crate" && kind === "bunker") o.loot = "army";
  }
  finishBuilding(b, kind, front);
  return b;
}
function placeRows(r, type, gx, gy){
  const set = new Set(r.tiles.map(([x, y]) => ix(x, y)));
  const xs = r.tiles.map(t => t[0]), ys = r.tiles.map(t => t[1]);
  const mx = Math.min(...xs), my = Math.min(...ys);
  const access = r.tiles.filter(([x, y]) => [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => { const t = tile[ix(x + dx, y + dy)]; return t === T.DOOR || t === T.WIN; })).map(([x, y]) => ix(x, y));
  const reach = () => {
    if (!access.length) return true;
    const seen = new Set([access[0]]), st = [access[0]];
    while (st.length){ const i = st.pop(), x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const j = ix(x + dx, y + dy); if (set.has(j) && !seen.has(j) && !objs.has(j)){ seen.add(j); st.push(j); } } }
    return access.every(a => seen.has(a));
  };
  for (const [x, y] of r.tiles){
    if ((x - mx - 2) % gx || (y - my - 2) % gy) continue;
    let ok = true;
    for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) if (!set.has(ix(x + dx, y + dy))){ ok = false; break; }
    if (!ok || objs.has(ix(x, y))) continue;
    const o = placeObj(type, x, y, r.id); delete o.dir;
    if (!reach()) objs.delete(ix(x, y));
  }
}
function genMotel(x0, y0, x1, y1, front){
  const b = newBuilding("motel"); b.x0 = x0; b.y0 = y0; b.x1 = x1; b.y1 = y1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){ const e = x === x0 || x === x1 || y === y0 || y === y1; tile[ix(x, y)] = e ? T.WALL : T.FLOOR; bldId[ix(x, y)] = b.id; }
  const fy = front === "top" ? y0 : y1;
  for (let x = x0 + 5; x < x1 - 2; x += 5) for (let y = y0; y <= y1; y++) tile[ix(x, y)] = T.WALL;
  for (let ux = x0; ux < x1 - 2; ux += 5){
    const r = { id: rooms.length, type: "motelroom", tiles: [], b: b.id }; rooms.push(r);
    const ue = Math.min(ux + 5, x1);
    for (let y = y0 + 1; y < y1; y++) for (let x = ux + 1; x < ue; x++){ roomId[ix(x, y)] = r.id; r.tiles.push([x, y]); }
    if (!r.tiles.length) continue;
    setDoor(ux + 2, fy, rnd() < .4); if (ux + 4 < ue) setWin(ux + 4, fy);
    furnishRoom(r, FURN2.motelroom.wall.slice());
  }
  finishBuilding(b, "motel", front);
}
function genGas(x0, y0, x1, y1, front){
  const sx = x1 - 12, sy = front === "top" ? y0 : y1 - 8;
  genBuilding(sx, sy, sx + 11, sy + 8, "gas", front);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS || tile[ix(x, y)] === T.TREE) tile[ix(x, y)] = T.LOT;
  const py = front === "top" ? y1 - 4 : y0 + 4;
  for (const px of [x0 + 2, x0 + 5, x0 + 8]){ const o = placeObj("pump", px, py, -1); delete o.dir; }
}

// ---------- countryside ----------
function regionRural(R0){
  // farms along the highways
  for (let n = 0; n < 6; n++){
    const alongH = rnd() < .5, side = rnd() < .5 ? -1 : 1;
    if (alongH){ const lx = ri(R0.x0 + 6, R0.x1 - 30, rnd), ly = side > 0 ? R0.hy + 4 : R0.hy - 15; if (areaFree(lx, ly, lx + 24, ly + 11, R0, 1)) genFarm(lx, ly, side > 0 ? "top" : "bottom"); }
    else { const ly = ri(R0.y0 + 6, R0.y1 - 16, rnd), lx = side > 0 ? R0.hx + 4 : R0.hx - 28; if (areaFree(lx, ly, lx + 24, ly + 11, R0, 1)) genFarm(lx, ly, "top"); }
  }
  // a gas station at the crossroads
  if (rnd() < .5){ const gx = R0.hx + 4, gy = R0.hy + 4; if (areaFree(gx, gy, gx + 22, gy + 16, R0, 0)){ genGas(gx, gy, gx + 22, gy + 16, "top"); for (let y = gy; y <= gy + 16; y++) for (let x = gx; x <= gx + 22; x++) ZONE[ix(x, y)] = 1; } }
  // a trailer park
  if (rnd() < .35){
    const px = R0.hx - 34, py = R0.hy + 5;
    if (areaFree(px, py, px + 28, py + 20, R0, 1)){
      for (let y = py; y <= py + 20; y++) for (let x = px; x <= px + 28; x++){ tile[ix(x, y)] = T.DIRT; ZONE[ix(x, y)] = 1; }
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++){ const tx = px + 1 + i * 7, ty = py + 1 + j * 10; genBuilding(tx, ty, tx + 5, ty + 8, "trailer", j ? "bottom" : "top"); }
    }
  }
  // a church out in the fields
  if (rnd() < .2){ const cx = R0.hx + 6, cy = R0.hy - 24; if (areaFree(cx, cy, cx + 14, cy + 18, R0, 1)) genBuilding(cx, cy, cx + 14, cy + 18, "church", "bottom"); }
  // an abandoned army checkpoint across the highway
  if (rnd() < .3) checkpoint(R0);
}
function checkpoint(R0){
  const y = ri(R0.y0 + 12, R0.y1 - 12, rnd); if (Math.abs(y - R0.hy) < 8) return;
  for (const dx of [-3, -2, 2, 3]){ const x = R0.hx + dx; if (tile[ix(x, y)] !== T.TREE){ tile[ix(x, y)] = T.GRASS; } placeObj("sandbag", x, y, -1); delete objs.get(ix(x, y)).dir; }
  for (let k = 0; k < 4; k++){ const x = R0.hx + (k < 2 ? -5 : 5), yy = y - 2 + k % 2 * 3; tile[ix(x, yy)] = T.DIRT; if (!objs.has(ix(x, yy))){ const o = placeObj("armycrate", x, yy, -1); delete o.dir; } }
  const cx = R0.hx - 1, cy = y + 4;
  if (tile[ix(cx, cy)] === T.ROAD && !objs.has(ix(cx, cy))) placeObj("car", cx, cy, -1).col = "#4a5636";
  R0.soldiers = [R0.hx, y]; R0.extraZ = (R0.extraZ || 0) + 14;
}
function regionWild(R0){
  // cabins in the woods
  for (let n = 0; n < 3; n++){
    const x = ri(R0.x0 + 8, R0.x1 - 18, rnd), y = ri(R0.y0 + 8, R0.y1 - 18, rnd);
    if (Math.abs(y - R0.hy) < 8 || Math.abs(x - R0.hx) < 8) continue;
    const tx = x, ty = y; let clear = true;
    for (let yy = ty - 2; yy <= ty + 10 && clear; yy++) for (let xx = tx - 2; xx <= tx + 10; xx++){ const t = tile[ix(xx, yy)]; if (t === T.ROAD || t === T.WATER || bldId[ix(xx, yy)] >= 0) { clear = false; break; } }
    if (!clear) continue;
    for (let yy = ty - 2; yy <= ty + 10; yy++) for (let xx = tx - 2; xx <= tx + 10; xx++) tile[ix(xx, yy)] = rnd() < .2 ? T.DIRT : T.GRASS;
    buildHouse(tx, ty, tx + 8, ty + 8, "top");
  }
  // an old bunker under a grass mound
  if (rnd() < .45){
    for (let n = 0; n < 6; n++){
      const x = ri(R0.x0 + 10, R0.x1 - 24, rnd), y = ri(R0.y0 + 10, R0.y1 - 22, rnd);
      if (Math.abs(y - R0.hy) < 10 || Math.abs(x - R0.hx) < 10) continue;
      let clear = true;
      for (let yy = y - 2; yy <= y + 14 && clear; yy++) for (let xx = x - 2; xx <= x + 16; xx++){ const t = tile[ix(xx, yy)]; if (t === T.ROAD || t === T.WATER || bldId[ix(xx, yy)] >= 0){ clear = false; break; } }
      if (!clear) continue;
      for (let yy = y - 2; yy <= y + 14; yy++) for (let xx = x - 2; xx <= x + 16; xx++) tile[ix(xx, yy)] = T.GRASS;
      genBuilding(x, y, x + 14, y + 12, "bunker", "bottom");
      break;
    }
  }
}

// ---------- vehicles, keys and zombies for a fresh region ----------
const CAR_NAMES = { "#6b2e2a": "red", "#2f4a5e": "blue", "#8a8470": "beige", "#3e4a3a": "green", "#9a9a94": "grey", "#5a4a3a": "brown", "#7a6a2a": "yellow", "#2a2a2e": "black", "#4a5636": "army" };
function convertCars(){
  for (const [i, o] of [...objs]) if (o.type === "car"){
    objs.delete(i);
    const a = o.dir && o.dir[0] ? (R() < .5 ? 0 : Math.PI) : (R() < .5 ? Math.PI / 2 : -Math.PI / 2);
    const c = { x: o.x + .5, y: o.y + .5, a, v: 0, col: o.col, fuel: rf(.05, .7), cond: ri(35, 95), locked: R() < .55, key: false, on: false, hot: false, broken: false, trunk: null, glove: null, nT: 0, uid: Math.random().toString(36).slice(2, 9) };
    const keyItem = () => ({ id: "carkey", car: c.uid, label: CAR_NAMES[c.col] || "old" });
    const roll = R();
    if (roll < .2) c.key = true;
    else if (roll < .45) c.gloveKey = true;
    else if (roll < .55){ const gx = o.x + ri(-1, 1), gy = o.y + (R() < .5 ? -2 : 2); if (inb(gx, gy) && tile[ix(gx, gy)] !== T.WALL){ const fl = floorItems.get(ix(gx, gy)) || []; fl.push(keyItem()); floorItems.set(ix(gx, gy), fl); } }
    else if (roll < .7){
      // in a container of the nearest house
      let best = null, bd = 18;
      for (let dy = -14; dy <= 14; dy += 2) for (let dx = -14; dx <= 14; dx += 2){ const q = objs.get(ix(o.x + dx, o.y + dy)); if (q && OBJ[q.type].cont && !q.items){ const d = Math.hypot(dx, dy); if (d < bd){ bd = d; best = q; } } }
      if (best) (best.extra = best.extra || []).push(keyItem());
    }
    V.push(c);
  }
}
function initVehicles(){ convertCars(); }
function spawnIn(x0, y0, x1, y1, n, soldiers){
  let made = 0;
  for (let tries = 0; made < n && tries < n * 30; tries++){
    const x = ri(x0 + 1, x1 - 1), y = ri(y0 + 1, y1 - 1), t = tile[ix(x, y)];
    if (t === T.WALL || t === T.TREE || t === T.WATER || t === T.DOOR || t === T.WIN || t === T.VOID) continue;
    const o = objs.get(ix(x, y)); if (o && OBJ[o.type].block) continue;
    if (P && G && Math.hypot(x - P.x, y - P.y) < 16) continue;
    if (G && bldId[ix(x, y)] >= 0 && bldId[ix(x, y)] === G.startBld) continue;
    if (!ZONE[ix(x, y)] && R() < .85) continue;
    Z.push(newZombie(x + .5 + rf(-.2, .2), y + .5 + rf(-.2, .2))); made++;
  }
  if (soldiers) for (let k = 0; k < 8; k++){ const z = newZombie(soldiers[0] + rf(-4, 4) + .5, soldiers[1] + rf(-4, 4) + .5); if (solidZ(Math.floor(z.x), Math.floor(z.y))) continue; z.col = "#4a5636"; z.pants = "#3a4430"; Z.push(z); }
}
function spawnZombies(){ DEFER_SPAWN = false; for (const p of PENDING_SPAWN) spawnIn(...p); PENDING_SPAWN = []; }

// generate regions ahead of you, one per frame, nearest first
let regT = 0;
function regionTick(dt){
  if (!REGIONS || !P) return;
  regT -= dt; if (regT > 0) return; regT = .2;
  const M = 175; let best = null, bd = 1e9;
  for (let ry = Math.floor((P.y - M) / REG); ry <= Math.floor((P.y + M) / REG); ry++) for (let rx = Math.floor((P.x - M) / REG); rx <= Math.floor((P.x + M) / REG); rx++){
    if (rx < 0 || ry < 0 || rx >= RX || ry >= RY || REGIONS[ry * RX + rx]) continue;
    const d = Math.hypot(rx * REG + 64 - P.x, ry * REG + 64 - P.y);
    if (d < bd){ bd = d; best = [rx, ry]; }
  }
  if (best){ const t0 = performance.now(); genRegion(best[0], best[1]); regGenMs = performance.now() - t0; regT = .05; }
}

// map of everything generated so far
function renderMap(){
  const c = $("mapc"), m = c.getContext("2d");
  let rx0 = 1e9, ry0 = 1e9, rx1 = -1, ry1 = -1;
  for (const k of REGION_ORDER){ const rx = k % RX, ry = (k / RX) | 0; rx0 = Math.min(rx0, rx); ry0 = Math.min(ry0, ry); rx1 = Math.max(rx1, rx); ry1 = Math.max(ry1, ry); }
  const X0 = rx0 * REG, Y0 = ry0 * REG, span = Math.max(rx1 - rx0 + 1, ry1 - ry0 + 1) * REG, s = c.width / span; MAPV = { X0, Y0, s }; hookMapNotes();
  m.fillStyle = "#1e1b16"; m.fillRect(0, 0, c.width, c.height);
  const col = { [T.GRASS]: "#4f6a3a", [T.ROAD]: "#3e4144", [T.WALK]: "#8e8c86", [T.FLOOR]: "#b5a77d", [T.WALL]: "#1f1c18", [T.DOOR]: "#8a5a2e", [T.WIN]: "#7fa5b8", [T.TREE]: "#2f4a2a", [T.LOT]: "#55585b", [T.DIRT]: "#6b5a40", [T.WATER]: "#3a5a7a" };
  const step = Math.max(1, Math.floor(1 / s));
  for (let y = Y0; y < Y0 + span; y += step) for (let x = X0; x < X0 + span; x += step){
    if (!inb(x, y) || !explored[ix(x, y)]) continue;
    m.fillStyle = col[tile[ix(x, y)]] || "#000"; m.fillRect((x - X0) * s, (y - Y0) * s, Math.max(1, s * step), Math.max(1, s * step));
  }
  m.fillStyle = "#d8b45a"; for (const v of V) if (explored[ix(Math.floor(v.x), Math.floor(v.y))]) m.fillRect((v.x - X0) * s - 1.5, (v.y - Y0) * s - 1.5, 3, 3);
  m.font = "15px VT323, monospace"; m.textAlign = "center";
  for (const t of TOWNS){ let seen = false; for (let y = t.y0; y < t.y1 && !seen; y += 4) for (let x = t.x0; x < t.x1; x += 4) if (explored[ix(x, y)]){ seen = true; break; }
    if (seen){ m.fillStyle = "#000"; m.fillText(t.name, (t.cx - X0) * s + 1, (t.y0 - Y0) * s - 3); m.fillStyle = "#e9e1cc"; m.fillText(t.name, (t.cx - X0) * s, (t.y0 - Y0) * s - 4); } }
  for (const mk of G.marks || []){ m.strokeStyle = "#ffd27a"; m.lineWidth = 2; m.beginPath(); m.arc((mk[0] - X0) * s, (mk[1] - Y0) * s, 7, 0, 7); m.stroke(); m.fillStyle = "#ffd27a"; m.fillText(mk[2], (mk[0] - X0) * s, (mk[1] - Y0) * s - 10); }
  m.fillStyle = "#ff5a4a"; m.beginPath(); m.arc((realXY(P.x, P.y).x - X0) * s, (realXY(P.x, P.y).y - Y0) * s, 4, 0, 7); m.fill();
}
