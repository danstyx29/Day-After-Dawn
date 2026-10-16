// ============================================================
// Part 21: smoothness.
//  - Regions are generated a few milliseconds per frame instead of
//    all at once, with their own random stream so the result is the
//    same every time.
//  - Walls that look the same share one image.
//  - Ground blocks bake within a time budget; anything not ready yet
//    is drawn with a cheap stand-in, and blocks ahead of you are
//    prepared in spare time.
//  - Only tiles actually on screen are visited each frame.
//  - Fog of war is one small image instead of thousands of rectangles.
// ============================================================
let FRAME_T0 = 0, REG_JOB = null, GCAP = 200, CAMV = [0, 0], lastCam = null;

// ---------- which tiles are on screen, row by row ----------
function rowRange(ty, padX, padTop, padBot){
  const a1 = ty + (camX - CW / 2 - padX) / hw, a2 = ty + (camX + CW / 2 + padX) / hw;
  const b1 = (camY - CH / 2 - padTop) / hh - ty, b2 = (camY + CH / 2 + padBot) / hh - ty;
  return [Math.floor(Math.max(a1, b1)), Math.ceil(Math.min(a2, b2))];
}
function screenTileRows(x0, x1, y0, y1, padBot){
  const out = [];
  for (let ty = y0; ty <= y1; ty++){ const [a, b] = rowRange(ty, hw * 2, hh * 3, padBot); const s = Math.max(x0, a), e = Math.min(x1, b); if (s <= e) out.push([ty, s, e]); }
  return out;
}

// ---------- region generation spread over frames ----------
function* genRegionSteps(rx, ry){
  const k = ry * RX + rx;
  srand(hash3(WSEED, rx * 7 + 1, ry * 13 + 3) || 1);
  const x0 = rx * REG, y0 = ry * REG, x1 = x0 + REG - 1, y1 = y0 + REG - 1;
  for (let y = y0; y <= y1; y++){
    for (let x = x0; x <= x1; x++){
      const f = NOI.f(x, y, 26) * .7 + NOI.f(x, y, 9) * .3;
      const w = NOI.w(x, y, 30) * .75 + NOI.w(x, y, 11) * .25;
      let t = T.GRASS;
      if (w > .76) t = T.WATER;
      else if (w > .72 && NOI.d(x, y, 5) > .4) t = T.SAND;
      else if (f > .56 && rnd() < (f - .52) * 2.2) t = T.TREE;
      else if (f < .3 && NOI.d(x, y, 14) > .62) t = T.DIRT;
      else if (rnd() < .012) t = T.TREE;
      tile[ix(x, y)] = t;
    }
    if ((y & 15) === 15) yield;
  }
  const R0 = { x0, y0, x1, y1, hy: y0 + hwyOff(ry, 1), hx: x0 + hwyOff(rx, 2) };
  highwayH(R0.hy, x0, x1); highwayV(R0.hx, y0, y1);
  yield;
  const center = rx === RX >> 1 && ry === RY >> 1, roll = rnd();
  R0.kind = center ? "town" : roll < .3 ? "town" : roll < .46 ? "village" : roll < .6 ? "civic" : roll < .84 ? "rural" : "wild";
  if (["town", "village", "civic"].includes(R0.kind)){
    const big = R0.kind === "town" ? 3 : 2;
    let ok = false;
    for (const [bx, by] of [[big, R0.kind === "village" ? 2 : big], [big, 2], [2, big], [2, 2], [2, 1], [1, 2]]) if (!ok){ ok = yield* regionTownG(R0, bx, by); }
    if (!ok){ R0.kind = "rural"; regionRural(R0); }
  } else if (R0.kind === "rural") regionRural(R0);
  else regionWild(R0);
  yield;
  const nCars = { town: 20, village: 10, civic: 14, rural: 7, wild: 3 }[R0.kind];
  for (let n = 0, tries = 0; n < nCars && tries < nCars * 40; tries++){
    const x = ri(x0 + 2, x1 - 2, rnd), y = ri(y0 + 2, y1 - 2, rnd);
    if (tile[ix(x, y)] !== T.ROAD || objs.has(ix(x, y))) continue;
    if (!(tile[ix(x - 1, y)] === T.ROAD && tile[ix(x + 1, y)] === T.ROAD) && !(tile[ix(x, y - 1)] === T.ROAD && tile[ix(x, y + 1)] === T.ROAD)) continue;
    let near = false; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){ const o = objs.get(ix(x + dx, y + dy)); if (o && o.type === "car") near = true; }
    if (near) continue;
    placeObj("car", x, y, -1).col = pick(["#6b2e2a", "#2f4a5e", "#8a8470", "#3e4a3a", "#9a9a94", "#5a4a3a", "#7a6a2a", "#2a2a2e"], rnd); n++;
  }
  for (const t of TOWNS) if (t.region === k) for (let y = t.y0 - 1; y <= t.y1 + 1; y++) for (let x = t.x0 - 1; x <= t.x1 + 1; x++){
    if (!inb(x, y) || tile[ix(x, y)] !== T.GRASS) continue;
    if ([[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => tile[ix(x + dx, y + dy)] === T.ROAD)) tile[ix(x, y)] = T.WALK;
  }
  for (const t of TOWNS) if (t.region === k){ placeTownDecor(t); if (typeof placeStreetTrees === "function") placeStreetTrees(t); }
  placeRoadDecor(R0);
  if (typeof placeStories === "function") placeStories(R0);
  placeLandmarks(R0);
  placeAnimals(R0);
  regionTidy(R0);
  yield;
  for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++){
    const b = bldId[ix(x, y)]; if (b < 0 || tile[ix(x, y)] === T.FLOOR) continue;
    for (let dy = -1; dy <= 1 && !perim[ix(x, y)]; dy++) for (let dx = -1; dx <= 1; dx++) if (bldId[ix(x + dx, y + dy)] !== b){ perim[ix(x, y)] = 1; break; }
  }
  // mark what was generated (for compact saves) and turn parked cars into vehicles
  const cars = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){
    const i = ix(x, y), o = objs.get(i);
    if (o){ if (o.type === "car") cars.push([i, o]); else if (!o.g){ o.g = 1; o.w0 = o.water; } }
    const f = feats.get(i); if (f && f.l0 === undefined){ f.l0 = f.locked; f.c0 = f.curtain; f.h0 = f.hp; }
  }
  convertCarList(cars);
  const nZ = { town: 260, village: 110, civic: 200, rural: 45, wild: 22 }[R0.kind] + (R0.extraZ || 0);
  if (!REG_RESTORING){ if (DEFER_SPAWN) PENDING_SPAWN.push([x0, y0, x1, y1, nZ, R0.soldiers || null]); else spawnIn(x0, y0, x1, y1, nZ, R0.soldiers || null); }
  if (typeof invalidateWorldRect === "function") invalidateWorldRect(x0 - 1, y0 - 1, x1 + 1, y1 + 1);
}
function* regionTownG(R0, bx, by){
  const B = 30, w = bx * B + 3, h = by * B + 3;
  const fit = (hw2, lo, hi, n, size) => { const o = [...Array(n + 1).keys()].sort(() => rnd() - .5); for (const i of o){ const s = hw2 - 1 - i * B; if (s >= lo + 3 && s + size <= hi - 3) return s; } return null; };
  const tx0 = fit(R0.hx, R0.x0, R0.x1, bx, w), ty0 = fit(R0.hy, R0.y0, R0.y1, by, h);
  if (tx0 == null || ty0 == null) return false;
  const t = { x0: tx0, y0: ty0, x1: tx0 + w, y1: ty0 + h, bx, by, B, name: townName(), kind: R0.kind, region: (R0.y0 / REG) * RX + R0.x0 / REG, cross: [] };
  t.cx = (t.x0 + t.x1) / 2; t.cy = (t.y0 + t.y1) / 2; t.style = Math.floor(rnd() * 4);
  TOWNS.push(t); TOWN_CTX = t;
  for (let y = t.y0 - 4; y <= t.y1 + 4; y++) for (let x = t.x0 - 4; x <= t.x1 + 4; x++){ if (tile[ix(x, y)] !== T.ROAD) tile[ix(x, y)] = T.GRASS; ZONE[ix(x, y)] = 1; }
  t.roadsX = []; t.roadsY = [];
  for (let i = 0; i <= bx; i++){ const x = t.x0 + 1 + i * B; vRoad(x, t.y0, t.y1); t.roadsX.push(x); }
  for (let j = 0; j <= by; j++){ const y = t.y0 + 1 + j * B; hRoad(y, t.x0, t.x1); t.roadsY.push(y); }
  for (const x of t.roadsX) for (const y of t.roadsY) t.cross.push([x, y]);
  const blocks = [];
  for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++){
    const bx0 = t.x0 + 1 + i * B + 4, bx1 = t.x0 + 1 + (i + 1) * B - 4, by0 = t.y0 + 1 + j * B + 4, by1 = t.y0 + 1 + (j + 1) * B - 4;
    const dHwy = Math.min(Math.abs((bx0 + bx1) / 2 - R0.hx), Math.abs((by0 + by1) / 2 - R0.hy));
    blocks.push({ bx0, by0, bx1, by1, dHwy: dHwy + rnd() * 8 });
  }
  blocks.sort((a, c) => a.dHwy - c.dHwy);
  const plan = townPlan(blocks.length, R0.kind);
  for (let k = 0; k < blocks.length; k++){ const bl = blocks[k]; TOWN_CTX = t; blockGen(plan[k], bl.bx0, bl.by0, bl.bx1, bl.by1, rnd() < .5 ? "top" : "bottom", R0); yield; }
  TOWN_CTX = null;
  return true;
}
function genRegion(rx, ry){
  if (!claimRegion(rx, ry)) return;
  const sv = REG_JOB; if (sv) finishRegionJob();
  const g = genRegionSteps(rx, ry); while (!g.next().done);
}
function claimRegion(rx, ry){
  if (rx < 0 || ry < 0 || rx >= RX || ry >= RY || ry * REG >= PK_Y0) return false;
  const k = ry * RX + rx; if (REGIONS[k]) return false;
  REGIONS[k] = 1; REGION_ORDER.push(k); return true;
}
function finishRegionJob(){
  if (!REG_JOB) return;
  const sv = _seed; _seed = REG_JOB.seed;
  while (!REG_JOB.g.next().done);
  _seed = sv; REG_JOB = null;
}
function regionTick(dt){
  if (!REGIONS || !P) return;
  if (REG_JOB){
    const t0 = performance.now(), sv = _seed; _seed = REG_JOB.seed;
    let done = false;
    while (performance.now() - t0 < 4){ if (REG_JOB.g.next().done){ done = true; break; } }
    REG_JOB.seed = _seed; _seed = sv; regGenMs = Math.max(regGenMs, performance.now() - t0);
    if (done) REG_JOB = null;
    return;
  }
  regT -= dt; if (regT > 0) return; regT = .15;
  const rp = realXY(P.x, P.y), M = 190; let best = null, bd = 1e9;
  for (let ry = Math.floor((rp.y - M) / REG); ry <= Math.floor((rp.y + M) / REG); ry++) for (let rx = Math.floor((rp.x - M) / REG); rx <= Math.floor((rp.x + M) / REG); rx++){
    if (rx < 0 || ry < 0 || rx >= RX || ry >= RY || ry * REG >= PK_Y0 || REGIONS[ry * RX + rx]) continue;
    const d = Math.hypot(rx * REG + 64 - rp.x, ry * REG + 64 - rp.y);
    if (d < bd){ bd = d; best = [rx, ry]; }
  }
  if (best && claimRegion(best[0], best[1])) REG_JOB = { g: genRegionSteps(best[0], best[1]), seed: 1 };
}
function convertCarList(list){
  for (const [i, o] of list){
    objs.delete(i);
    const a = o.dir && o.dir[0] ? (R() < .5 ? 0 : Math.PI) : (R() < .5 ? Math.PI / 2 : -Math.PI / 2);
    const c = { x: o.x + .5, y: o.y + .5, a, v: 0, col: o.col, livery: o.livery || null, junk: !!o.junk, crashed: !!o.crashed, fuel: rf(.05, .7), cond: ri(35, 95), locked: R() < .55, key: false, on: false, hot: false, broken: false, trunk: null, glove: null, nT: 0, uid: Math.random().toString(36).slice(2, 9), alarm: R() < .3 };
    const keyItem = () => ({ id: "carkey", car: c.uid, label: c.livery === "police" ? "police" : c.livery === "amb" ? "ambulance" : (CAR_NAMES[c.col] || "old") });
    const roll = R();
    if (roll < .2) c.key = true;
    else if (roll < .45) c.gloveKey = true;
    else if (roll < .55){ const gx = o.x + ri(-1, 1), gy = o.y + (R() < .5 ? -2 : 2); if (inb(gx, gy) && tile[ix(gx, gy)] !== T.WALL){ const fl = floorItems.get(ix(gx, gy)) || []; fl.push(keyItem()); floorItems.set(ix(gx, gy), fl); } }
    else if (roll < .7){ let best = null, bd = 18;
      for (let dy = -14; dy <= 14; dy += 2) for (let dx = -14; dx <= 14; dx += 2){ const q = objs.get(ix(o.x + dx, o.y + dy)); if (q && OBJ[q.type].cont && !q.items){ const d = Math.hypot(dx, dy); if (d < bd){ bd = d; best = q; } } }
      if (best) (best.extra = best.extra || []).push(keyItem()); }
    else if (roll < .8) c.zKey = true;   // a nearby zombie has it in a pocket
    V.push(c);
  }
}

// ---------- walls: identical walls share one image ----------
function wallSprite(key, tx, ty, a, drawAt, top){
  const pad = 6, w = 2 * hw + 2 * pad, h = top * zoom + 2 * hh + 2 * pad;
  let c = SPR.get(key);
  if (!c){
    if (BAKE.s-- <= 0){ drawAt(tx, ty); return; }
    c = document.createElement("canvas"); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
    const sv = [ctx, camX, camY, CW, CH];
    ctx = c.getContext("2d"); CW = 0; CH = 0; camX = -hw - pad; camY = -top * zoom - pad;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    try { drawAt(0, 0); } finally { [ctx, camX, camY, CW, CH] = sv; }
    SPR.set(key, c);
    if (SPR.size > 2500) SPR.delete(SPR.keys().next().value);
  }
  const [sx, sy] = S(tx, ty, 0);
  ctx.globalAlpha = a; ctx.drawImage(c, sx - hw - pad, sy - top * zoom - pad, w, h); ctx.globalAlpha = 1;
}
const matKey = m => m.plaster ? m.plaster : "F" + facadeKey(m.siding);
function shopSig(tx, ty, B){
  if (!B || !B.sign || B.front !== "bottom" || ty !== B.y1 || B.floors > 2 || tile[ix(tx, ty)] !== T.WIN) return "";
  if (["house", "hospital", "school", "police", "church", "apartments", "office", "warehouse", "library", "firestation", "bank", "post"].includes(B.kind)) return "";
  return B.sign.col[0];
}
function drawWallTile(tx, ty, i, t, b, B, dim, inMine, front, upperOf, pdepth){
  const cut = inMine && front;
  const gH = inMine ? WALLH : gTop(B);
  const H = cut ? 6 : gH;
  const above = !B || inMine ? 0 : upperOf ? RV.k - 1 : B.floors - 1;
  const fullTop = upperOf ? RV.k * WALLH : inMine ? WALLH : bTop(B);
  const a = cut ? 1 : tileAlphaH(tx, ty, pdepth, fullTop);
  const trimTop = B && !inMine ? (B.kind === "house" || B.kind === "church" ? shade(roofColor(b), .7) : B.trim || "#6a6c68") : "#b5ad9c";
  const f = feats.get(i);
  const glow = t === T.WIN && isNight() && powerOn() ? 1 : 0;
  const lit = glow && b >= 0 && !buildings[b].lightsOff && ((buildings[b].kind === "house" && hash(b, 3) < 0.35) || b === PLAYER_B) ? 1 : 0;
  const ws = wallSig(i, tx, ty, t, b), pieces = ws.pieces, matOf = ws.matOf;
  let shapeK;
  if (t === T.WALL) shapeK = ws.shapeK;
  else { const hz = f.horiz, pc = hz ? { u0: 0, v0: A_, u1: 1, v1: B_ } : { u0: A_, v0: 0, u1: B_, v1: 1 }; const [mS, mE] = matOf(pc); shapeK = `${+hz},${matKey(mS)},${matKey(mE)}`; }
  const shop = B && !inMine && !cut ? shopSig(tx, ty, B) : "";
  const deco = B && !inMine && !cut && t === T.WIN && B.shutters ? B.shutters : "";
  const vine = B && !inMine && EROSION >= 2 && hash(tx * 3, ty * 5) * 5 < EROSION - 1 ? 1 : 0;
  const key = `V${vine}W${t}|${shapeK}|${+cut}|${dim}|${trimTop}|${featKey(f)}|${glow}${lit}|${H}|${shop}|${deco}|${B ? B.kind === "house" ? "h" : B.kind === "garage" ? "g" : "" : ""}|${f && f.iron ? 1 : 0}`;
  CUR_FEAT = f;
  wallSprite(key, tx, ty, a, (bx, by) => {
    CUR_FEAT = f;
    if (t === T.WALL){ aoBand(bx, by, pieces); pieces.forEach(pc => { const [mS, mE] = matOf(pc); slab(bx, by, pc.u0, pc.v0, pc.u1, pc.v1, 0, H, mS, mE, trimTop, dim, 1, pc.showS, pc.showE); }); }
    else {
      const mats = pc => matOf(pc);
      if (t === T.DOOR && B && B.kind === "garage" && !inMine) drawGarageDoor(bx, by, f, dim, H, trimTop, mats);
      else if (t === T.DOOR) drawDoorThin(bx, by, f, b, dim, 1, cut, Math.min(H, WALLH), trimTop, mats);
      else drawWindowThin(bx, by, f, b, dim, 1, cut, Math.min(H, WALLH), trimTop, mats);
      if (H > WALLH + .5){ const hz = f.horiz, pc = hz ? { u0: 0, v0: A_, u1: 1, v1: B_ } : { u0: A_, v0: 0, u1: B_, v1: 1 }; const [mS, mE] = matOf(pc); slab(bx, by, pc.u0, pc.v0, pc.u1, pc.v1, WALLH, H, mS, mE, trimTop, dim, 1, hz, !hz); }
      if (deco) drawShutters(bx, by, f.horiz, deco, dim);
      if (t === T.WIN && f.iron) drawBars(bx, by, f.horiz, dim);
    }
    if (vine) for (let k = 0; k < 5; k++){ const u = hash(tx + k, ty) * .9 + .05, h = 10 + hash(tx, ty + k) * 30; line3([bx + u, by + B_ + .02, 0], [bx + u + (hash(k, tx) - .5) * .2, by + B_ + .02, h], shade("#3e5a2a", dim), 2.2, 1); }
    if (shop){ const y = by + B_; for (let s = 0; s < 4; s++){ const x0 = bx + s * .25; boxW(x0, y, x0 + .25, y + .32, 33, 36, shade(s % 2 ? shop : "#efeae0", dim), 1); } }
  }, Math.max(H, WALLH));
  for (let l = 1; l <= above; l++) drawUpperSeg(tx, ty, b, B, l, dim, a);
  if (B && B.sign && !inMine && !cut && B.front === "bottom" && ty === B.y1 && tx > B.x0 && tx < B.x1) facadeSignSlice(tx, B, a);
}
function drawShutters(bx, by, hz, col, dim){
  const c = shade(col, dim);
  if (hz){ for (const u of [.08, .8]) boxW(bx + u, by + B_ + .01, bx + u + .12, by + B_ + .05, 12, 35, c, 1); }
  else { for (const v of [.08, .8]) boxW(bx + B_ + .01, by + v, bx + B_ + .05, by + v + .12, 12, 35, c, 1); }
}
const roofColor = b => (buildings[b] && buildings[b].roofCol) || ROOFC[b % ROOFC.length];
function drawTile(tx, ty, myB, pdepth){
  const i = ix(tx, ty), t = tile[i], b = bldId[i], B = b >= 0 ? buildings[b] : null;
  const upperOf = RV.mode === "upper" && !RV.inPocket && b === RV.b;
  const vis = G.vis[i] || (RV.mode === "upper" && !RV.inPocket);
  const seen = vis || explored[i];
  const dim = vis ? 1 : explored[i] ? 0.55 : 0.4;
  const inMine = b >= 0 && b === myB && !upperOf;
  const front = tx + ty + 1 > pdepth + 0.3;
  const isWall = t === T.WALL || t === T.DOOR || t === T.WIN;
  if (upperOf && !isWall) return;
  if (isWall && B && !inMine && !perim[i]) return;
  if (isWall) return drawWallTile(tx, ty, i, t, b, B, dim, inMine, front, upperOf, pdepth);
  if (t === T.FLOOR && B && !inMine && !G.vis[i]) return;
  if (t === T.TREE){ const sh = TREESHAKE.get(i); if (sh !== undefined && G.simT - sh < .7){ ctx.save(); ctx.translate(Math.sin(G.simT * 38 + tx) * 1.6 * zoom, 0); drawTree(tx, ty, dim, tileAlphaH(tx, ty, pdepth, 66)); ctx.restore(); } else drawTree(tx, ty, dim, tileAlphaH(tx, ty, pdepth, 66)); return; }
  const o = objs.get(i);
  if (o && seen){
    if (zoom < .72 && LOD_SKIP.has(o.type)) return;
    const h = OBJ[o.type].h || 0;
    const al = h > 20 ? tileAlphaH(tx, ty, pdepth, h) : 1;
    if (o.esc) drawEscalator(o, dim, al); else if (OBJ_CACHE_OK.has(o.type)) drawObjCached(o, dim, al); else drawObj(o, dim, al);
    if (OBJ[o.type].light && (o.type === "candlelit" || powerOn(o.x + .5, o.y + .5)) && isNight() && !RV.inPocket){ const [sx, sy] = S(o.x + .5, o.y + .5, o.type === "lamp" ? 56 : 30); LIGHTS.push([sx, sy, OBJ[o.type].light * (o.type === "lamp" ? lampFlick(o) : 1), o.type === "lamp" ? "255,190,110" : "255,210,140"]); }
  }
}
const LOD_SKIP = new Set(["flowerbed", "reeds", "newsbox", "litter", "toy", "gnome", "grill", "lawnchair", "garden", "clothesline", "doghouse", "mailbox", "hydrant", "trashcan", "rug", "plant", "chair"]);

// ---------- ground: bake within a budget, stand-ins and look-ahead ----------
const QCOL = { grass: "#4d5c36", road: "#36393c", walk: "#7c7a74", lot: "#46494c", dirt: "#5c4c36", water: "#29434a", sand: "#a8987a", gravel: "#6e6a62", void: "#0d0f12", floor: "#8a7a60" };
function quickGround(bx, by, left, top){
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
  for (const [px, py] of [[0, 0], [GB, 0], [0, GB], [GB, GB]]){ const [wx, wy] = toWorld(bx * GB + px - left, by * GB + py - top); mnx = Math.min(mnx, wx); mxx = Math.max(mxx, wx); mny = Math.min(mny, wy); mxy = Math.max(mxy, wy); }
  const paths = new Map();
  for (let ty = Math.max(0, Math.floor(mny) - 1); ty <= Math.min(H - 1, Math.ceil(mxy) + 1); ty++) for (let tx = Math.max(0, Math.floor(mnx) - 1); tx <= Math.min(W - 1, Math.ceil(mxx) + 1); tx++){
    let k = groundKey(ix(tx, ty)); if (k.startsWith("floor")) k = "floor";
    let p = paths.get(k); if (!p){ p = new Path2D(); paths.set(k, p); } p.rect(tx, ty, 1, 1);
  }
  ctx.save(); resetT(); ctx.beginPath(); ctx.rect(bx * GB - left, by * GB - top, GB, GB); ctx.clip();
  isoT(0); for (const [k, p] of paths){ ctx.fillStyle = QCOL[k] || "#4d5c36"; ctx.fill(p); }
  ctx.restore(); resetT();
}
function drawGroundBlock(bx, by, left, top){
  const c = GCH.get(bx + "," + by);
  if (c){ ctx.drawImage(c, bx * GB - left, by * GB - top, GB, GB); return; }
  if (BAKE.g-- > 0 || performance.now() - FRAME_T0 < 7 || GCH.size === 0){ ctx.drawImage(blockCanvas(bx, by), bx * GB - left, by * GB - top, GB, GB); return; }
  if (!fallbackBlock("G", bx, by, left, top, ctx)) quickGround(bx, by, left, top);
}
function drawRoofBlock(bx, by, left, top, g = rctx){
  if (RCH.has(bx + "," + by) || BAKE.r-- > 0 || performance.now() - FRAME_T0 < 9){ const e = roofBlock(bx, by); if (!e.has) return false; g.drawImage(e.c, bx * GB - left, by * GB - top, GB, GB); return true; }
  return fallbackBlock("R", bx, by, left, top, g);
}
function drawGround(x0, x1, y0, y1, onScreen){
  useZoomCache();
  const left = camX - CW / 2, top = camY - CH / 2;
  const bx0 = Math.floor(left / GB), bx1 = Math.floor((left + CW) / GB), by0 = Math.floor(top / GB), by1 = Math.floor((top + CH) / GB);
  GCAP = Math.max(200, (bx1 - bx0 + 6) * (by1 - by0 + 6) + 30);
  for (let by = by0; by <= by1; by++) for (let bx = bx0; bx <= bx1; bx++) drawGroundBlock(bx, by, left, top);
  // look ahead: blocks around the view, the direction you're heading first
  prefetchQ.length = 0;
  for (let by = by0 - 2; by <= by1 + 2; by++) for (let bx = bx0 - 2; bx <= bx1 + 2; bx++){
    if (bx >= bx0 && bx <= bx1 && by >= by0 && by <= by1) continue;
    if (GCH.has(bx + "," + by)) continue;
    const cx = (bx + .5) * GB - (left + CW / 2), cy = (by + .5) * GB - (top + CH / 2);
    prefetchQ.push([bx, by, -(cx * CAMV[0] + cy * CAMV[1]) + Math.hypot(cx, cy) * .02]);
  }
  prefetchQ.sort((a, b) => a[2] - b[2]);
  // fog of war: one small image, smoothly scaled
  if (RV.mode === "upper"){ ctx.fillStyle = "rgba(8,10,16,.28)"; ctx.fillRect(0, 0, CW, CH); return; }
  fogLayer(x0, x1, y0, y1);
}
const fogCv = document.createElement("canvas"), fogG = fogCv.getContext("2d");
let fogImg = null;
function fogLayer(x0, x1, y0, y1){
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  if (fogCv.width !== w || fogCv.height !== h){ fogCv.width = w; fogCv.height = h; fogImg = fogG.createImageData(w, h); }
  const d = fogImg.data;
  for (let ty = 0; ty < h; ty++){ let o = ty * w * 4, i = ix(x0, y0 + ty);
    for (let tx = 0; tx < w; tx++, i++, o += 4){ d[o] = 8; d[o + 1] = 10; d[o + 2] = 16; d[o + 3] = G.vis[i] ? 0 : explored[i] ? 128 : 184; } }
  fogG.putImageData(fogImg, 0, 0);
  isoT(0); ctx.imageSmoothingEnabled = true; ctx.drawImage(fogCv, x0, y0, w, h); resetT();
}
// spare time at the end of a frame goes to the blocks ahead
function idleBake(){
  let n = 0;
  while (prefetchQ.length && performance.now() - FRAME_T0 < 13 && n < 3){ const [bx, by] = prefetchQ.shift(); if (!GCH.has(bx + "," + by)){ blockCanvas(bx, by); n++; } }
}
function trackCamera(){
  if (lastCam){ const vx = camX - lastCam[0], vy = camY - lastCam[1]; CAMV = [CAMV[0] * .8 + vx * .2, CAMV[1] * .8 + vy * .2]; }
  lastCam = [camX, camY];
}
