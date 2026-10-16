// ============================================================
// Part 36: malls with two or three floors, joined by escalators.
// Floor 2: shops around the concourse and a food court.
// Floor 3 (in the biggest malls): a four-screen cinema multiplex.
// ============================================================
HMUL.mall = 1.15;
function mallUpper(B){
  B.floors = rnd() < .45 ? 3 : 2;
  const cy = B.y0 + 8, mid = (B.x0 + B.x1) >> 1;
  let sx = mid + 4, sy = cy;
  for (const [cx2, cy2] of [[mid + 4, cy], [mid - 4, cy], [mid + 6, cy], [mid - 6, cy], [mid + 3, cy]]){
    const i = ix(cx2, cy2), o = objs.get(i);
    if (tile[i] === T.FLOOR && bldId[i] === B.id && (!o || ["bench", "plant", "trashcan", "kiosk"].includes(o.type))){ sx = cx2; sy = cy2; break; }
  }
  objs.delete(ix(sx, sy));
  const st = placeObj("stairs", sx, sy, roomId[ix(sx, sy)]); st.dir = [1, 0]; st.up = true; st.esc = true;
  B.stair = { x: sx, y: sy, dir: [1, 0] };
}
function mallFloor(B, b, k, pk){
  const ox = pk.ox, oy = pk.oy, X0 = pk.x0, X1 = pk.x1, Y0 = pk.y0, Y1 = pk.y1;
  const cy = B.y0 + 8 + oy, mid = ((B.x0 + B.x1) >> 1) + ox, wN = cy - 2, wS = cy + 2;
  const sx = B.stair.x + ox, sy = B.stair.y + oy, top = B.floors >= 3 && k === B.floors - 1;
  for (let x = X0 + 1; x < X1; x++){ tile[ix(x, wN)] = T.WALL; tile[ix(x, wS)] = T.WALL; }
  if (top){
    // the multiplex: four auditoriums off a lobby
    for (let y = Y0 + 1; y < wN; y++) tile[ix(mid, y)] = T.WALL;
    for (let y = wS + 1; y < Y1; y++) tile[ix(mid, y)] = T.WALL;
    for (const [dx, wy] of [[-4, wN], [4, wN], [-4, wS], [4, wS]]) setDoor(mid + dx, wy, false);
  } else {
    for (const [ya, yb, wall] of [[Y0 + 1, wN - 1, wN], [wS + 1, Y1 - 1, wS]]){
      let x = X0 + 1;
      while (x < X1 - 1){
        let w = ri(4, 6, rnd); if (x + w > X1 - 1) w = X1 - 1 - x; if (w < 3) break;
        const xe = x + w - 1;
        if (xe + 1 < X1) for (let y = ya; y <= yb; y++) tile[ix(xe + 1, y)] = T.WALL;
        const dx = x + (w >> 1); setDoor(dx, wall, false);
        for (let q = x; q <= xe; q++) if (Math.abs(q - dx) > 1 && tile[ix(q, wall)] === T.WALL) setWin(q, wall);
        x = xe + 2;
      }
    }
  }
  tile[ix(sx, sy)] = T.FLOOR;
  // outside windows, as on any upper floor
  for (let x = X0 + 1; x < X1; x++) if ((x - X0) % 3 === 1){ for (const [y, o2] of [[Y0, 1], [Y1, -1]]) if (tile[ix(x, y + o2)] === T.FLOOR && !nearType(x, y, [T.WIN], 1) && tile[ix(x - 1, y)] === T.WALL && tile[ix(x + 1, y)] === T.WALL) setWin(x, y); }
  for (let y = Y0 + 1; y < Y1; y++) if ((y - Y0) % 3 === 1){ for (const [x, o2] of [[X0, 1], [X1, -1]]) if (tile[ix(x + o2, y)] === T.FLOOR && !nearType(x, y, [T.WIN], 1) && tile[ix(x, y - 1)] === T.WALL && tile[ix(x, y + 1)] === T.WALL) setWin(x, y); }
  // rooms
  const found = [];
  for (let y = Y0 + 1; y < Y1; y++) for (let x = X0 + 1; x < X1; x++){
    if (tile[ix(x, y)] !== T.FLOOR || roomId[ix(x, y)] >= 0) continue;
    const r = { id: rooms.length, type: "clothes", tiles: [], b }; rooms.push(r); found.push(r);
    const stk = [[x, y]]; roomId[ix(x, y)] = r.id;
    while (stk.length){ const [cx2, cy2] = stk.pop(); r.tiles.push([cx2, cy2]); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const nx = cx2 + dx, ny = cy2 + dy; if (tile[ix(nx, ny)] === T.FLOOR && roomId[ix(nx, ny)] < 0){ roomId[ix(nx, ny)] = r.id; stk.push([nx, ny]); } } }
  }
  const conc = rooms[roomId[ix(sx, sy)]];
  if (conc) conc.type = top ? "lobby2" : "concourse";
  const types = ["foodcourt", "clothes", "shoeshop", "toyshop", "electronics", "jewelry", "bookshop", "musicshop", "sportshop", "restroom", "clothes"];
  let ti = 0;
  for (const r of found){
    if (r === conc) continue;
    if (top){ r.type = "auditorium"; continue; }
    r.type = ti === 0 ? "foodcourt" : types[ti % types.length]; ti++;
  }
  for (const r of found){
    if (r === conc){ if (top) furnishRoom(r, FURN2.lobby2.wall.slice()); continue; }
    if (r.type === "auditorium"){
      const ys = r.tiles.map(t => t[1]), xs = r.tiles.map(t => t[0]), north = Math.max(...ys) < cy, ax0 = Math.min(...xs), ax1 = Math.max(...xs);
      const scY = north ? Math.min(...ys) : Math.max(...ys), dirY = north ? 1 : -1;
      for (let x = ax0; x <= ax1; x++){ const s = placeObj("screen", x, scY, r.id); s.dir = [0, north ? 1 : -1]; }
      for (let y = scY + dirY * 3; north ? y < wN - 1 : y > wS + 1; y += dirY * 2) for (let x = ax0 + 1; x <= ax1 - 1; x++){ if (objs.has(ix(x, y))) continue; const s = placeObj("tseat", x, y, r.id); s.dir = [0, -dirY]; }
      continue;
    }
    const F = FURN2[r.type]; if (F){ furnishRoom(r, F.wall.slice()); if (F.rows) placeRows(r, ...F.rows); }
    if (r.type === "clothes"){ const t = r.tiles.find(([x, y]) => !objs.has(ix(x, y)) && !nearType(x, y, [T.DOOR], 1)); if (t){ const m = placeObj("mannequin", t[0], t[1], r.id); delete m.dir; } }
    for (const [x, y] of r.tiles){ const o = objs.get(ix(x, y)); if (o && o.type === "shelf") o.store = ({ shoeshop: "shoes", toyshop: "toys", electronics: "electronics", musicshop: "music", sportshop: "sports", bookshop: "hardware" })[r.type] || "grocery"; }
  }
  // benches and planters down the concourse, clear of the escalator
  if (conc && !top) for (let x = X0 + 3; x < X1 - 2; x += 5){ const i = ix(x, cy); if (tile[i] !== T.FLOOR || objs.has(i) || Math.abs(x - sx) < 2 || nearType(x, cy, [T.DOOR], 1)) continue; const o = placeObj(rnd() < .5 ? "bench" : "plant", x, cy, conc.id); delete o.dir; }
  objs.delete(ix(sx, sy));
  const st = placeObj("stairs", sx, sy, roomId[ix(sx, sy)]); st.dir = B.stair.dir; st.down = true; st.up = k < B.floors - 1; st.esc = true;
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++){ const i = ix(x, y); if (tile[i] === T.FLOOR) continue; for (let dy = -1; dy <= 1 && !perim[i]; dy++) for (let dx = -1; dx <= 1; dx++) if (bldId[ix(x + dx, y + dy)] !== b){ perim[i] = 1; break; } }
  if (typeof WRC !== "undefined") WRC.clear();
  if (!top) upperDecor(B, b, k, pk);
  const nz = top ? ri(7, 13) : ri(5, 10);
  for (let n = 0, tries = 0; n < nz && tries < 300; tries++){
    const r = pick(found); if (!r) break; const [x, y] = pick(r.tiles);
    if (Math.hypot(x - sx, y - sy) < 4 || objs.has(ix(x, y))) continue;
    const z = newZombie(x + .5, y + .5); applyOutfit(z, "mall"); Z.push(z); n++;
  }
  return pk;
}
// escalators: steel sides, a black handrail and ridged steps
function drawEscalator(o, dim, a){
  const x = o.x, y = o.y, sd = c => shade(c, dim), hz = !o.dir || o.dir[0] !== 0;
  if (hz){ boxW(x, y + .1, x + 1, y + .9, 0, 6, sd("#5a5e62"), a); for (let k = 0; k < 5; k++) line3([x + .1 + k * .2, y + .15, 6.2], [x + .1 + k * .2, y + .85, 6.2], sd("#3a3e42"), 1, a);
    for (const v of [.08, .92]){ boxW(x, y + v - .04, x + 1, y + v + .04, 0, 18, sd("#8a9094"), a); line3([x, y + v, 19], [x + 1, y + v, 19], "#1a1a1c", 2.4, a); } }
  else { boxW(x + .1, y, x + .9, y + 1, 0, 6, sd("#5a5e62"), a); for (const u of [.08, .92]){ boxW(x + u - .04, y, x + u + .04, y + 1, 0, 18, sd("#8a9094"), a); line3([x + u, y, 19], [x + u, y + 1, 19], "#1a1a1c", 2.4, a); } }
}
