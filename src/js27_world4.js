// ============================================================
// Part 27: world building. Malls, cinemas, gun stores, army
// surplus, police armouries, gun cabinets, junkyards, drive-ins,
// hunting lodges, water towers, cemeteries and town squares.
// ============================================================
Object.assign(OBJ, {
  tseat:     { n: "Cinema seat", block: true, h: 12, col: "#7a1e22", seat: true },
  screen:    { n: "Cinema screen", block: false, h: 0, col: "#e8e8e0" },
  popcorn:   { n: "Popcorn machine", block: true, h: 26, col: "#c83a2a" },
  gunrack:   { n: "Gun rack", cont: "gunstore", block: true, h: 30, col: "#5a3e28", cap: 15 },
  gunlocker: { n: "Gun locker", cont: "armory", block: true, h: 36, col: "#4a5a4a", cap: 15 },
  display:   { n: "Display case", cont: "jewelry", block: true, h: 14, col: "#c8d8e0", cap: 8 },
  guncabinet:{ n: "Gun cabinet", cont: "gunhouse", block: true, h: 30, col: "#5a3e28", cap: 10 },
  fountain:  { n: "Fountain", block: true, h: 14, col: "#a8a8a0" },
  statue:    { n: "Statue", block: true, h: 40, col: "#6a7a6a" },
  gravestone:{ n: "Gravestone", block: true, h: 10, col: "#8a8a84" },
  fenceiron: { n: "Iron fence", block: true, h: 16, col: "#1e1e20", fence: true },
  watertower:{ n: "Water tower", block: true, h: 120, col: "#a8acb0" },
  tirepile:  { n: "Pile of tires", cont: "tires", block: true, h: 14, col: "#1e1e1e", cap: 6 },
  driveinscreen: { n: "Drive-in screen", block: true, h: 80, col: "#e8e8e0" },
  kiosk:     { n: "Mall directory", block: true, h: 26, col: "#3a4a5a" },
  mannequin: { n: "Mannequin", block: true, h: 30, col: "#e8dcc8" },
  gazebo:    { n: "Gazebo", block: false, h: 40, col: "#e8e4dc" },
  trophy:    { n: "Mounted antlers", block: false, h: 0, col: "#8a6a4a" },
});
Object.assign(FOOT, { tseat: [.1, .2, .9, .8], gunrack: [.05, 0, .95, .3], gunlocker: [.1, 0, .9, .5], guncabinet: [.15, 0, .85, .4], fountain: [-.2, -.2, 1.2, 1.2], statue: [.25, .25, .75, .75], gravestone: [.3, .4, .7, .6], watertower: [.3, .3, .7, .7], driveinscreen: [-2, .4, 3, .6], kiosk: [.3, .3, .7, .7], mannequin: [.35, .35, .65, .65] });
["fountain", "statue", "gravestone", "watertower", "tirepile", "driveinscreen", "kiosk", "mannequin", "gazebo", "tseat"].forEach(k => NOOFF.add(k));
Object.assign(LOOT, {
  jewelry: { rolls: [0, 3], items: [["watch", 5], ["junk_toy", 1], ["batteries", 1]] },
  shelf_ammo: { rolls: [1, 4], items: [["ammo9", 5], ["ammo38", 4], ["shells", 5], ["ammo308", 3], ["ammo556", 1], ["hunting", 1]] },
  shelf_shoes: { rolls: [1, 3], items: [["sneakers", 5], ["boots", 3]] },
  shelf_toys: { rolls: [1, 3], items: [["junk_toy", 6], ["candy", 3], ["comic", 3], ["junk_duck", 2]] },
  shelf_electronics: { rolls: [1, 3], items: [["batteries", 6], ["watch", 3], ["junk_toy", 1]] },
  shelf_music: { rolls: [0, 2], items: [["mag", 3], ["junk_toy", 1]] },
});
Object.assign(SPEC, {
  gunstore:  { min: 4, rooms: ["gunshop", "gunstorage"], win: 2, doors: 1, lock: 1 },
  surplus:   { min: 4, rooms: ["surplusshop", "storage"], win: 2, doors: 1, lock: .5 },
  lodge:     { min: 4, rooms: ["living", "bunkroom", "kitchen"], win: 3, doors: 1, lock: .4 },
  snackbar:  { min: 9, rooms: ["diner"], win: 2, doors: 1, lock: .3 },
  junkoffice:{ min: 9, rooms: ["office"], win: 2, doors: 1, lock: .5 },
});
Object.assign(FURN2, {
  gunshop:     { wall: ["gunrack", "gunrack", "counter", "gunrack", "shelf", "gunrack"], rows: ["display", 3, 2] },
  gunstorage:  { wall: ["crate", "crate", "gunrack", "shelf"] },
  surplusshop: { wall: ["rack", "rack", "shelf", "counter", "crate"], rows: ["rack", 2, 2] },
  armory:      { wall: ["gunlocker", "gunlocker", "gunlocker", "crate"] },
  shoeshop:    { wall: ["shelf", "shelf", "counter", "shelf"], rows: ["shelf", 2, 2] },
  toyshop:     { wall: ["shelf", "shelf", "counter"], rows: ["shelf", 2, 2] },
  jewelry:     { wall: ["display", "display", "counter", "display"], rows: ["display", 2, 2] },
  electronics: { wall: ["shelf", "tv", "tv", "counter"], rows: ["shelf", 2, 2] },
  musicshop:   { wall: ["shelf", "piano", "counter"], rows: ["shelf", 2, 2] },
  foodcourt:   { wall: ["counter", "oven", "fridge", "counter", "oven", "counter"], rows: ["table", 2, 2] },
  restroom:    { wall: ["toilet", "toilet", "bsink", "bsink"] },
  lobby2:      { wall: ["counter", "popcorn", "counter", "vending", "trashcan"] },
  auditorium:  { wall: [] },
});
Object.assign(SHELF_STORE, { gunstore: "ammo", surplus: "hardware" });
Object.assign(NAMES, { mall: ["Pinecrest Mall", "Harlow Galleria", "Town Center Mall", "Riverbend Plaza"], cinema: ["Star-Lite Cinema", "Palace Theater", "Rialto Cinemas", "Star-E-Plex"],
  gunstore: ["Guns & Ammo", "Liberty Firearms", "Big Buck Guns"], surplus: ["Army Surplus", "Camp & Combat"], lodge: ["Hunting Lodge"], snackbar: ["Snack Bar"] });
Object.assign(SIGNCOL, { mall: ["#2a3a5a", "#ffd030"], cinema: ["#1a1a2a", "#ff4a6a"], gunstore: ["#1e1e1e", "#e83a2a"], surplus: ["#4a5636", "#f0e8c8"], lodge: ["#4a3020", "#f0e0b0"], snackbar: ["#c83a3a", "#fff4d0"] });
NEON.add("cinema"); NEON.add("gunstore");
Object.assign(FACADE, { mall: ["stucco", "block", "stone"], cinema: ["brick", "stucco"], gunstore: ["block", "brick"], surplus: ["block"], lodge: ["log"], snackbar: ["white"], junkoffice: ["metal"] });
Object.assign(HMUL, { mall: 1.55, cinema: 1.7 });
SPEC.police.rooms = ["lobby", "office", "lockers", "cell", "cell", "armory", "office"];
const ROOMTEX2 = { gunshop: "hardware", gunstorage: "hardware", surplusshop: "hardware", armory: "hardware", shoeshop: "grocery", toyshop: "grocery", jewelry: "pharmacy", electronics: "grocery", musicshop: "living",
  foodcourt: "kitchen", restroom: "bathroom", concourse: "pharmacy", lobby2: "bedroom", auditorium: "bedroom" };
for (const k in ROOMTEX2){ TEX["floor_" + k] = TEX["floor_" + ROOMTEX2[k]]; ROOMWALL[k] = ROOMWALL[ROOMTEX2[k]] || "#c8c4b8"; }
Object.assign(ROOMWALL, { auditorium: "#3a2228", lobby2: "#5a2a3a", concourse: "#e0dcd0", gunshop: "#8a7a62", armory: "#7a8a7a" });
ROOM_EXTRAS.bedroom.maybe.push(["guncabinet", .08]); ROOM_EXTRAS.basement.maybe.push(["guncabinet", .25]); ROOM_EXTRAS.living.maybe.push(["guncabinet", .05]);
ROOM_EXTRAS.lodge = ROOM_EXTRAS.living;

// ---------- the mall ----------
function mallGen(x0, y0, x1, y1, front, R0){
  const bx0 = x0, bx1 = x1, by0 = front === "top" ? y0 : y1 - 16, by1 = by0 + 16;
  const b = newBuilding("mall"); b.x0 = bx0; b.y0 = by0; b.x1 = bx1; b.y1 = by1;
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++){ const e = x === bx0 || x === bx1 || y === by0 || y === by1; tile[ix(x, y)] = e ? T.WALL : T.FLOOR; bldId[ix(x, y)] = b.id; objs.delete(ix(x, y)); }
  const cy = by0 + 8, wN = cy - 2, wS = cy + 2, mid = (bx0 + bx1) >> 1;
  for (let x = bx0 + 1; x < bx1; x++){ tile[ix(x, wN)] = T.WALL; tile[ix(x, wS)] = T.WALL; }
  // a short hall from the front doors to the concourse
  const fy = front === "top" ? by0 : by1, hall0 = front === "top" ? by0 + 1 : wS + 1, hall1 = front === "top" ? wN - 1 : by1 - 1;
  for (let y = hall0; y <= hall1; y++){ tile[ix(mid - 2, y)] = T.WALL; tile[ix(mid + 2, y)] = T.WALL; }
  tile[ix(mid - 1, front === "top" ? wN : wS)] = T.FLOOR; tile[ix(mid, front === "top" ? wN : wS)] = T.FLOOR; tile[ix(mid + 1, front === "top" ? wN : wS)] = T.FLOOR;
  setDoor(mid, fy, false); setDoor(mid + 1, fy, false); setDoor(mid - 1, fy, false);
  setDoor(bx0, cy, false); setDoor(bx0, cy - 1, false); setDoor(bx1, cy, false); setDoor(bx1, cy + 1, false);
  // shop units along both sides of the concourse
  const units = [];
  for (const [ya, yb, wall] of [[by0 + 1, wN - 1, wN], [wS + 1, by1 - 1, wS]]){
    const sideHall = (front === "top") === (wall === wN);
    let x = bx0 + 1;
    while (x < bx1 - 1){
      let w = ri(4, 6, rnd); if (sideHall && x < mid - 2 && x + w > mid - 3) w = mid - 2 - x; if (sideHall && x >= mid - 2 && x <= mid + 2) { x = mid + 3; continue; }
      if (x + w > bx1 - 1) w = bx1 - 1 - x; if (w < 3){ x += w + 1; continue; }
      const xe = x + w - 1;
      if (xe + 1 < bx1) for (let y = ya; y <= yb; y++) tile[ix(xe + 1, y)] = T.WALL;
      const dx = x + (w >> 1); setDoor(dx, wall, false);
      for (let k = x; k <= xe; k++) if (Math.abs(k - dx) > 1 && tile[ix(k, wall)] === T.WALL) setWin(k, wall);
      units.push({ x0: x, x1: xe, y0: ya, y1: yb, w });
      x = xe + 2;
    }
  }
  // rooms
  const found = [];
  for (let y = by0 + 1; y < by1; y++) for (let x = bx0 + 1; x < bx1; x++){
    if (tile[ix(x, y)] !== T.FLOOR || roomId[ix(x, y)] >= 0) continue;
    const r = { id: rooms.length, type: "concourse", tiles: [], b: b.id }; rooms.push(r); found.push(r);
    const st = [[x, y]]; roomId[ix(x, y)] = r.id;
    while (st.length){ const [cx, cy2] = st.pop(); r.tiles.push([cx, cy2]); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = cx + dx, ny = cy2 + dy; if (tile[ix(nx, ny)] === T.FLOOR && roomId[ix(nx, ny)] < 0){ roomId[ix(nx, ny)] = r.id; st.push([nx, ny]); } } }
  }
  const conc = rooms[roomId[ix(bx0 + 2, cy)]];
  const types = ["clothes", "shoeshop", "toyshop", "sportshop", "jewelry", "electronics", "musicshop", "bookshop", "foodcourt", "restroom", "clothes", "gasshop", "pharmacyshop"].sort(() => rnd() - .5);
  let ti = 0;
  for (const r of found){ if (r === conc) continue; r.type = r.tiles.length >= 40 && !found.some(q => q.type === "grocery") ? "grocery" : types[ti++ % types.length]; if (r.type === "pharmacyshop") r.type = "pharmacy"; }
  for (const r of found){
    if (r === conc) continue;
    const F = FURN2[r.type] || (r.type === "grocery" ? { wall: ["fridge", "fridge", "shelf", "shelf", "checkout"], rows: ["shelf", 2, 2] } : r.type === "pharmacy" ? { wall: ["shelf", "medcab", "counter"], rows: ["shelf", 2, 2] } : null);
    if (F){ furnishRoom(r, F.wall.slice()); if (F.rows) placeRows(r, ...F.rows); }
    if (r.type === "clothes"){ const t = r.tiles.find(([x, y]) => !objs.has(ix(x, y)) && !nearType(x, y, [T.DOOR], 1)); if (t){ const m = placeObj("mannequin", t[0], t[1], r.id); delete m.dir; } }
  }
  // the concourse: benches, planters and a fountain down the middle
  if (conc){
    for (let x = bx0 + 3; x < bx1 - 2; x++){
      const i = ix(x, cy); if (objs.has(i) || tile[i] !== T.FLOOR || nearType(x, cy, [T.DOOR], 1)) continue;
      const k = (x - bx0) % 5;
      if (x === mid){ const f = placeObj("fountain", x, cy, conc.id); delete f.dir; continue; }
      if (k === 0){ const o = placeObj(rnd() < .5 ? "bench" : "plant", x, cy, conc.id); delete o.dir; }
      else if (k === 2 && rnd() < .5){ const o = placeObj(rnd() < .3 ? "kiosk" : "trashcan", x, cy, conc.id); delete o.dir; }
    }
  }
  for (const r of found) for (const [x, y] of r.tiles){ const o = objs.get(ix(x, y)); if (!o) continue;
    if (o.type === "shelf") o.store = ({ shoeshop: "shoes", toyshop: "toys", electronics: "electronics", musicshop: "music", sportshop: "sports", gasshop: "grocery", grocery: "grocery", pharmacy: "pharmacy", bookshop: "hardware", clothes: "hardware" })[r.type] || "grocery"; }
  // the rest of the block is parking
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS || tile[ix(x, y)] === T.TREE) tile[ix(x, y)] = T.LOT;
  const py0 = front === "top" ? by1 + 2 : y0 + 1, py1 = front === "top" ? y1 - 1 : by0 - 2;
  for (let y = py0; y <= py1; y += 2) for (let x = x0 + 1; x < x1; x += 3){ const i = ix(x, y); if (tile[i] !== T.LOT || objs.has(i)) continue; const r = rnd(); if (r < .3){ const c = placeObj("car", x, y, -1); c.dir = [0, 1]; c.col = pick(["#6b2e2a", "#2f4a5e", "#8a8470", "#9a9a94", "#2a2a2e", "#5a4a3a"], rnd); } else if (r < .42){ const o = placeObj("cart", x, y, -1); delete o.dir; } }
  finishBuilding(b, "mall", front);
  b.props = b.props.filter(p => p.t !== "ac").concat([...Array(4)].map((_, k) => ({ t: "skylight", x: bx0 + 3 + k * 5, y: cy + .5 })), [{ t: "ac", x: bx0 + 2, y: by0 + 2 }, { t: "ac", x: bx1 - 2, y: by1 - 2 }]);
  if (!b.props.some(p => p.t === "roofsign")) b.props.push({ t: "roofsign", x: bx0 + 1, y: front === "top" ? by0 + .6 : by1 + .4, w: bx1 - bx0 - 2 });
  R0.extraZ = (R0.extraZ || 0) + 45;
  mallUpper(b);
  return b;
}

// ---------- the cinema ----------
const FILMS = ["NIGHT OF THE LIVING DEAD", "RED HIGHWAY", "TIDES OF FEAR", "LAST SUMMER IN HARLOW", "THE QUIET COUNTY", "MIDNIGHT ARCADE"];
function cinemaGen(x0, y0, x1, y1, front, R0){
  const w = 21, h = 17, bx0 = x0 + 1, bx1 = bx0 + w - 1, by0 = front === "top" ? y0 : y1 - h + 1, by1 = by0 + h - 1;
  const b = newBuilding("cinema"); b.x0 = bx0; b.y0 = by0; b.x1 = bx1; b.y1 = by1;
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++){ const e = x === bx0 || x === bx1 || y === by0 || y === by1; tile[ix(x, y)] = e ? T.WALL : T.FLOOR; bldId[ix(x, y)] = b.id; objs.delete(ix(x, y)); }
  const lobbyW = front === "top" ? by0 + 5 : by1 - 5, mid = (bx0 + bx1) >> 1;
  for (let x = bx0 + 1; x < bx1; x++) tile[ix(x, lobbyW)] = T.WALL;
  const audY0 = front === "top" ? lobbyW + 1 : by0 + 1, audY1 = front === "top" ? by1 - 1 : lobbyW - 1;
  for (let y = audY0; y <= audY1; y++) tile[ix(mid, y)] = T.WALL;
  setDoor(mid - 4, lobbyW, false); setDoor(mid + 4, lobbyW, false);
  const fy = front === "top" ? by0 : by1;
  setDoor(mid - 1, fy, false); setDoor(mid, fy, false); setDoor(mid + 1, fy, false);
  for (const x of [bx0 + 3, bx0 + 6, bx1 - 6, bx1 - 3]) setWin(x, fy);
  if (rnd() < .6) setDoor(bx0, front === "top" ? by1 - 2 : by0 + 2, true);
  const found = [];
  for (let y = by0 + 1; y < by1; y++) for (let x = bx0 + 1; x < bx1; x++){
    if (tile[ix(x, y)] !== T.FLOOR || roomId[ix(x, y)] >= 0) continue;
    const r = { id: rooms.length, type: "auditorium", tiles: [], b: b.id }; rooms.push(r); found.push(r);
    const st = [[x, y]]; roomId[ix(x, y)] = r.id;
    while (st.length){ const [cx, cy] = st.pop(); r.tiles.push([cx, cy]); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = cx + dx, ny = cy + dy; if (tile[ix(nx, ny)] === T.FLOOR && roomId[ix(nx, ny)] < 0){ roomId[ix(nx, ny)] = r.id; st.push([nx, ny]); } } }
  }
  const lobby = rooms[roomId[ix(mid, front === "top" ? by0 + 2 : by1 - 2)]]; if (lobby) lobby.type = "lobby2";
  if (lobby) furnishRoom(lobby, FURN2.lobby2.wall.slice());
  // seats in rows facing the screen, an aisle down each side
  const screenY = front === "top" ? by1 - 1 : by0 + 1, dirY = front === "top" ? -1 : 1;
  for (const r of found){
    if (r === lobby) continue;
    const xs = r.tiles.map(t => t[0]), ax0 = Math.min(...xs), ax1 = Math.max(...xs);
    for (let x = ax0; x <= ax1; x++){ const o = placeObj("screen", x, screenY, r.id); o.dir = [0, dirY]; }
    for (let y = screenY + dirY * 3; front === "top" ? y > lobbyW + 1 : y < lobbyW - 1; y += dirY * 2)
      for (let x = ax0 + 1; x <= ax1 - 1; x++){ if (objs.has(ix(x, y))) continue; const s = placeObj("tseat", x, y, r.id); s.dir = [0, -dirY]; }
  }
  finishBuilding(b, "cinema", front);
  // the marquee out front
  const my = front === "top" ? by0 - 2 : by1 + 2;
  if (!objs.has(ix(mid + 3, my))){ const m = placeObj("polesign", mid + 3, my, -1); delete m.dir; m.text = "NOW SHOWING: " + pick(FILMS, rnd); m.col = ["#1a1a2a", "#ffe08a"]; m.neon = true; }
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS) tile[ix(x, y)] = T.LOT;
  R0.extraZ = (R0.extraZ || 0) + 14;
  return b;
}

// ---------- junkyards, drive-ins, lodges, water towers ----------
function junkyard(x0, y0, x1, y1, R0){
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){ tile[ix(x, y)] = T.GRAVEL; objs.delete(ix(x, y)); ZONE[ix(x, y)] = 1; }
  const gate = (x0 + x1) >> 1;
  for (let x = x0; x <= x1; x++) for (const y of [y0, y1]) if (Math.abs(x - gate) > 1 || y === y1){ const o = placeObj("fencew", x, y, -1); o.dir = null; o.horiz = true; }
  for (let y = y0 + 1; y < y1; y++) for (const x of [x0, x1]){ const o = placeObj("fencew", x, y, -1); o.dir = null; o.horiz = false; }
  genBuilding(x0 + 2, y0 + 2, x0 + 8, y0 + 7, "junkoffice", "top");
  for (let y = y0 + 3; y < y1 - 1; y += 3) for (let x = x0 + 11; x < x1 - 1; x += 3){
    if (objs.has(ix(x, y)) || tile[ix(x, y)] !== T.GRAVEL || rnd() < .25) continue;
    const c = placeObj("car", x, y, -1); c.dir = [1, 0]; c.col = pick(["#5a3a2a", "#4a4e52", "#6a5a3a", "#3a3a3e", "#7a6a5a"], rnd); c.junk = true;
  }
  for (let k = 0; k < 6; k++){ const x = ri(x0 + 2, x0 + 9, rnd), y = ri(y0 + 9, y1 - 2, rnd); if (!objs.has(ix(x, y))){ const o = placeObj(rnd() < .6 ? "tirepile" : "crate", x, y, -1); delete o.dir; if (o.type === "crate") o.loot = "partsbin"; } }
  if (!objs.has(ix(gate + 3, y0 - 1))){ const s = placeObj("polesign", gate + 3, y0 - 1, -1); delete s.dir; s.text = pick(["SCRAP YARD", "U-PULL-IT AUTO", "HARLOW SALVAGE"], rnd); s.col = ["#3a3a3a", "#ffb030"]; }
}
function placeLandmarks(R0){
  const k = (R0.y0 / REG) * RX + R0.x0 / REG;
  for (const t of TOWNS){
    if (t.region !== k) continue;
    // a water tower with the town's name on it, just outside town
    if (rnd() < .8) for (let tries = 0; tries < 30; tries++){
      const x = t.x0 - 3 + Math.floor(rnd() * 3) * 0 - (tries % 2 ? 0 : 0) + Math.floor(rnd() * (t.x1 - t.x0)), y = rnd() < .5 ? t.y0 - 3 : t.y1 + 3;
      if (!inb(x, y) || tile[ix(x, y)] !== T.GRASS || objs.has(ix(x, y)) || bldId[ix(x, y)] >= 0) continue;
      const o = placeObj("watertower", x, y, -1); delete o.dir; o.text = t.name.split(" ")[0].toUpperCase(); break;
    }
  }
  if (R0.kind === "rural" || R0.kind === "wild"){
    // a junkyard by the highway
    if (rnd() < .3){ const jx = R0.hx + 5, jy = R0.hy - 24; if (areaFree(jx, jy, jx + 24, jy + 18, R0, 1)) junkyard(jx, jy, jx + 24, jy + 18, R0); }
    // a drive-in theater
    if (rnd() < .14){ const dx = R0.hx - 34, dy = R0.hy - 26;
      if (areaFree(dx, dy, dx + 26, dy + 20, R0, 1)){
        for (let y = dy; y <= dy + 20; y++) for (let x = dx; x <= dx + 26; x++){ tile[ix(x, y)] = T.GRAVEL; ZONE[ix(x, y)] = 1; }
        const sc = placeObj("driveinscreen", dx + 13, dy + 1, -1); delete sc.dir; sc.text = pick(FILMS, rnd);
        genBuilding(dx + 10, dy + 13, dx + 16, dy + 18, "snackbar", "top");
        for (let y = dy + 5; y < dy + 12; y += 3) for (let x = dx + 3; x < dx + 24; x += 3){ if (rnd() < .45 && !objs.has(ix(x, y))){ const c = placeObj("car", x, y, -1); c.dir = [0, 1]; c.col = pick(["#6b2e2a", "#2f4a5e", "#8a8470", "#3e4a3a", "#9a9a94"], rnd); } }
        R0.extraZ = (R0.extraZ || 0) + 12;
      } }
  }
  // a hunting lodge deep in the woods
  if (R0.kind === "wild" && rnd() < .5) for (let tries = 0; tries < 10; tries++){
    const x = ri(R0.x0 + 10, R0.x1 - 24, rnd), y = ri(R0.y0 + 10, R0.y1 - 22, rnd);
    if (Math.abs(y - R0.hy) < 10 || Math.abs(x - R0.hx) < 10) continue;
    let ok = true; for (let yy = y - 2; yy <= y + 12 && ok; yy++) for (let xx = x - 2; xx <= x + 14; xx++){ const t = tile[ix(xx, yy)]; if (t === T.ROAD || t === T.WATER || bldId[ix(xx, yy)] >= 0 || objs.has(ix(xx, yy))){ ok = false; break; } }
    if (!ok) continue;
    for (let yy = y - 2; yy <= y + 12; yy++) for (let xx = x - 2; xx <= x + 14; xx++) tile[ix(xx, yy)] = rnd() < .2 ? T.DIRT : T.GRASS;
    const L = genBuilding(x, y, x + 12, y + 10, "lodge", "bottom");
    if (L){ L.roofType = "gable"; L.roofCol = "#3e4a40"; L._rg = null;
      for (const r of rooms.filter(r => r.b === L.id)) for (const [tx, ty] of r.tiles){ const o = objs.get(ix(tx, ty)); if (o && OBJ[o.type].cont && rnd() < .3) o.loot = "gunhouse"; } }
    break;
  }
}
// cemeteries beside churches, a square in the middle of town
function cemetery(x0, y0, x1, y1){
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){ if (tile[ix(x, y)] !== T.GRASS && tile[ix(x, y)] !== T.TREE) return; }
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){
    tile[ix(x, y)] = T.GRASS;
    const edge = x === x0 || x === x1 || y === y0 || y === y1;
    if (edge){ const o = placeObj("fenceiron", x, y, -1); o.dir = null; o.horiz = y === y0 || y === y1; continue; }
    if ((y - y0) % 2 === 0 && (x - x0) % 2 === 1 && rnd() < .85){ const g = placeObj("gravestone", x, y, -1); delete g.dir; g.style = ri(0, 2, rnd); }
  }
  const tx = x0 + 1, ty = y1 - 1; if (tile[ix(tx, ty)] === T.GRASS && !objs.has(ix(tx, ty))) tile[ix(tx, ty)] = T.TREE;
}
function townSquare(x0, y0, x1, y1){
  const cx = (x0 + x1) >> 1, cy = (y0 + y1) >> 1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){ tile[ix(x, y)] = Math.abs(x - cx) <= 1 || Math.abs(y - cy) <= 1 || (Math.abs(x - cx) + Math.abs(y - cy) <= 4) ? T.WALK : T.GRASS; objs.delete(ix(x, y)); }
  const put = (k, x, y) => { if (!objs.has(ix(x, y))){ const o = placeObj(k, x, y, -1); delete o.dir; return o; } };
  put("fountain", cx, cy);
  put("statue", cx - 6, cy - 6); put("gazebo", cx + 6, cy + 6);
  for (const [dx, dy] of [[3, 3], [-3, 3], [3, -3], [-3, -3]]) put("bench", cx + dx, cy + dy);
  for (const [dx, dy] of [[5, 0], [-5, 0], [0, 5], [0, -5]]) put("lamp", cx + dx + (dy ? 2 : 0), cy + dy + (dx ? 2 : 0));
  for (const [dx, dy] of [[8, -8], [-8, 8], [-9, -3], [9, 3], [3, 9], [-3, -9]]) if (tile[ix(cx + dx, cy + dy)] === T.GRASS) tile[ix(cx + dx, cy + dy)] = T.TREE;
  for (const [dx, dy] of [[-2, -6], [2, 6], [6, -2], [-6, 2]]) put("flowerbed", cx + dx, cy + dy);
}
// ---------- towns: the new places join the plan ----------
SPECIAL.push("mall", "cinema", "square", "cinema");
function townPlan(n, kind){
  const plan = [];
  const civ = CIVIC.slice().sort(() => rnd() - .5), spc = SPECIAL.slice().sort(() => rnd() - .5);
  if (kind === "village"){ plan.push("mainstreet"); if (n > 2) plan.push(pick(["church", "gas", "post"], rnd)); if (n > 3 && rnd() < .5) plan.push("trailers"); }
  else if (kind === "civic"){ plan.push("mainstreet", civ[0], civ[1], rnd() < .5 ? "mall" : "cinema"); if (n > 4) plan.push(civ[2], spc[0]); if (n > 6) plan.push(spc[1], "apartments"); }
  else {
    plan.push("mainstreet"); if (n >= 6) plan.push("mainstreet");
    plan.push(civ[0]);
    if (n >= 8){ plan.push(rnd() < .45 ? "mall" : "cinema"); if (rnd() < .5) plan.push("square"); }
    if (n >= 4) plan.push(spc[0]); if (n >= 6) plan.push(civ[1], spc[1]);
  }
  // no doubles of the big landmarks
  const seen = new Set(); for (let k = 0; k < plan.length; k++){ if (["mall", "cinema", "square"].includes(plan[k])){ if (seen.has(plan[k])) plan[k] = "houses"; seen.add(plan[k]); } }
  while (plan.length < n) plan.push(kind === "village" || rnd() < .85 ? "houses" : "houses2");
  return _skyPlan(plan, n, kind).slice(0, n);
}

// ---------- drawing the new things ----------
function drawDecor5(o, dim, a){
  const x = o.x, y = o.y, sd = c => shade(c, dim), cx = x + .5, cy = y + .5;
  if (["popcorn", "gunrack", "gunlocker", "guncabinet", "tseat"].includes(o.type)){
    const M = Model(o, dim, a);
    switch (o.type){
      case "popcorn": M.part(.25, .1, .75, .6, 0, 12, sd("#c83a2a")); M.part(.25, .1, .75, .6, 12, 26, "#e8e0b0", () => M.front(.3, .7, .6, 14, 24, "#f0e8a0")); M.part(.22, .07, .78, .63, 26, 28, sd("#c83a2a")); break;
      case "gunrack": M.part(.05, 0, .95, .3, 0, 30, sd("#5a3e28"), () => { for (let k = 0; k < 4; k++) M.frontLine(.15 + k * .22, 6, .15 + k * .22, 27, .3, "#1e1e20", 1.4); }); break;
      case "gunlocker": M.part(.1, 0, .9, .5, 0, 36, sd("#4a5a4a"), () => { M.frontLine(.5, 2, .5, 34, .5, "#2a3a2a", 1); M.front(.42, .47, .5, 16, 20, "#c8c8c8"); }); break;
      case "guncabinet": M.part(.15, 0, .85, .4, 0, 30, sd("#5a3e28"), () => { M.front(.22, .78, .4, 4, 28, "#8aa8b8"); for (const u of [.32, .5, .68]) M.frontLine(u, 6, u, 26, .41, "#1e1e20", 1.2); }); break;
      case "tseat": M.part(.1, .3, .9, .8, 4, 7, sd("#7a1e22")); M.part(.1, .2, .9, .32, 4, 14, sd("#6a1a1e")); M.part(.06, .25, .12, .8, 0, 9, sd("#2a2a2a")); M.part(.88, .25, .94, .8, 0, 9, sd("#2a2a2a")); break;
    }
    M.draw(); return true;
  }
  switch (o.type){
    case "screen": { const dy = o.dir ? o.dir[1] : 1, py = dy < 0 ? y + 1 - .05 : y + .05; boxW(x, py - .02, x + 1, py + .02, 10, 40, sd("#e8e8e0"), a); return true; }
    case "display": boxW(x + .1, y + .2, x + .9, y + .8, 0, 9, sd("#5a4a3a"), a); boxW(x + .12, y + .22, x + .88, y + .78, 9, 14, "#c8e0ec", .45 * a); topEl(cx, cy, .08, 9.5, "#e8c040", a); return true;
    case "fountain": topEl(cx, cy, 1.05, 4, sd("#a8a8a0"), a); topEl(cx, cy, .9, 4.2, sd("#4a7a8a"), a); boxW(cx - .12, cy - .12, cx + .12, cy + .12, 4, 13, sd("#b8b8b0"), a); topEl(cx, cy, .3, 13, sd("#b8b8b0"), a);
      if (powerOn(x, y)){ ctx.strokeStyle = "rgba(200,230,240,.7)"; ctx.lineWidth = zoom; for (let k = 0; k < 6; k++){ const an = k / 6 * 6.28 + G.simT, [sx, sy] = S(cx, cy, 15), [ex, ey] = S(cx + Math.cos(an) * .7, cy + Math.sin(an) * .7, 4.5); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + ex) / 2, sy - 6 * zoom, ex, ey); ctx.stroke(); } } return true;
    case "statue": boxW(x + .22, y + .22, x + .78, y + .78, 0, 12, sd("#9a968e"), a); boxW(x + .4, y + .42, x + .6, y + .58, 12, 30, sd("#5a6a5a"), a); topEl(cx, cy, .1, 34, sd("#5a6a5a"), a); line3([cx, cy, 26], [cx + .2, cy - .2, 36], sd("#5a6a5a"), 2, a); return true;
    case "gravestone": { const st = o.style || 0; if (st === 2){ line3([cx, cy, 0], [cx, cy, 14], sd("#a8a8a0"), 2.2, a); line3([cx - .15, cy, 10], [cx + .15, cy, 10], sd("#a8a8a0"), 2.2, a); } else { boxW(x + .3, y + .45, x + .7, y + .55, 0, st ? 8 : 11, sd(st ? "#7a7a74" : "#8a8a84"), a); if (!st) topEl(cx, cy, .2, 11, sd("#8a8a84"), a, .05); } topR(x + .3, y + .55, x + .7, y + .95, .2, sd("#4a4a2a"), a * .6); return true; }
    case "fenceiron": drawFenceJ(o, dim, a); return true;
    case "watertower": {
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) line3([cx + dx * 1.1, cy + dy * 1.1, 0], [cx + dx * .7, cy + dy * .7, 78], sd("#7a7e82"), 2.6, a);
      for (const z of [26, 52]) for (const [d1, d2] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]){ const f = 1.1 - z / 78 * .4; line3([cx + d1[0] * f, cy + d1[1] * f, z], [cx + d2[0] * f, cy + d2[1] * f, z], sd("#7a7e82"), 1, a); }
      const [tx, ty] = S(cx, cy, 78), rx = 1.15 * hw * 1.41, ry = 1.15 * hh * 1.41, ht = 30 * zoom;
      ctx.globalAlpha = a; ctx.fillStyle = sd("#b8bcc0"); ctx.fillRect(tx - rx, ty - ht, rx * 2, ht); ctx.beginPath(); ctx.ellipse(tx, ty, rx, ry, 0, 0, Math.PI); ctx.fill();
      const gr = ctx.createLinearGradient(tx - rx, 0, tx + rx, 0); gr.addColorStop(0, "rgba(255,255,255,.18)"); gr.addColorStop(.6, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.25)"); ctx.fillStyle = gr; ctx.fillRect(tx - rx, ty - ht, rx * 2, ht);
      ctx.fillStyle = sd("#8a8e92"); ctx.beginPath(); ctx.moveTo(tx - rx * 1.05, ty - ht); ctx.lineTo(tx, ty - ht - 18 * zoom); ctx.lineTo(tx + rx * 1.05, ty - ht); ctx.fill();
      ctx.fillStyle = "#2a3a5a"; ctx.font = `bold ${Math.round(9 * zoom + 3)}px Arial, sans-serif`; ctx.textAlign = "center"; ctx.fillText(o.text || "", tx, ty - ht * .4); ctx.globalAlpha = 1;
      return true;
    }
    case "tirepile": for (let k = 0; k < 4; k++) topEl(cx + (k % 2 - .5) * .3, cy + (k > 1 ? .15 : -.15), .22, 3 + k * 3, sd("#1e1e1e"), a, .18); return true;
    case "driveinscreen": for (const u of [-1.8, 2.8]) line3([x + u, cy, 0], [x + u, cy, 46], sd("#4a4e52"), 3, a); boxW(x - 2.4, cy - .08, x + 3.4, cy + .08, 40, 80, sd("#d8d8d0"), a);
      if (o.text && isNight() && powerOn(x, y)){ const img = signCanvas(o.text, "#e8e8e0", "#3a3a5a", false, true); drawDecal(true, cy + .081, x - 2.2, x + 3.2, 72, 48, img, 0, img.width, a * .8); } return true;
    case "kiosk": boxW(x + .3, y + .35, x + .7, y + .65, 0, 26, sd("#3a4a5a"), a); boxW(x + .32, y + .64, x + .68, y + .66, 8, 24, sd("#e8e4d0"), a); return true;
    case "mannequin": line3([cx, cy, 0], [cx, cy, 6], sd("#3a3a3a"), 1, a); boxW(cx - .1, cy - .06, cx + .1, cy + .06, 6, 24, sd(["#7a3a6a", "#3a5a8a", "#8a6a3a"][x % 3]), a); topEl(cx, cy, .08, 28, sd("#e8dcc8"), a); return true;
    case "gazebo": { const pts = [...Array(8)].map((_, k) => [cx + Math.cos(k / 8 * 6.28) * 1.3, cy + Math.sin(k / 8 * 6.28) * 1.3]);
      poly(pts.map(p => S(p[0], p[1], 2)), sd("#a8946a"), a); for (const [px, py] of pts) line3([px, py, 2], [px, py, 30], sd("#e8e4dc"), 1.6, a);
      const top = S(cx, cy, 46); for (let k = 0; k < 8; k++){ const p1 = S(...pts[k], 30), p2 = S(...pts[(k + 1) % 8], 30); poly([p1, p2, top], sd(k % 2 ? "#5a3a2a" : "#6a4a34"), a); } return true; }
    case "trophy": return true;
  }
  return drawDecor6(o, dim, a);
}
// iron bars on gun store windows
function drawBars(bx, by, hz, dim){ for (let k = 0; k < 5; k++){ const u = .12 + k * .19; hz ? line3([bx + u, by + B_ + .04, 6], [bx + u, by + B_ + .04, 40], shade("#2a2a2c", dim), 1.3, 1) : line3([bx + B_ + .04, by + u, 6], [bx + B_ + .04, by + u, 40], shade("#2a2a2c", dim), 1.3, 1); } }
for (const o of Object.values(OCCS)) if (o.sk) for (const k of Object.keys(o.sk)) if (!SKILLS[k]) delete o.sk[k];
renderCreation();
