// ============================================================
// Part 19: renderer v3. Building heights and materials, signs,
// rooftop details, sunken water, shadows, street wear, props,
// liveries, coloured lights and the view from upstairs.
// ============================================================
const WALLH = CFG.WALLH;
let VIEWB = new Set(), RV = { mode: "ground" }, CAM = null, LIGHTS = [], lastRenderT = 0, PSX = 0, PSY = 0;
const bTop = B => B ? (B.floors > 1 ? B.floors * WALLH : WALLH * (B.hmul || 1)) : WALLH;
const gTop = B => B ? (B.floors > 1 ? WALLH : WALLH * (B.hmul || 1)) : WALLH;

// ---------- facade materials ----------
(function initFacades(){
  const fac = (key, paint) => { const [c, g] = mkCanvas(64, 64); paint(g); SIDE_CAN[key] = c; };
  const boards = (g, col, line) => { for (let r = 0; r < 4; r++){ const gr = g.createLinearGradient(0, r * 16, 0, r * 16 + 16); gr.addColorStop(0, tint(col, 1.06)); gr.addColorStop(1, tint(col, .92)); g.fillStyle = gr; g.fillRect(0, r * 16, 64, 16); g.fillStyle = line; g.fillRect(0, r * 16 + 14.5, 64, 1.5); } };
  const bricks = (g, col, mortar) => { g.fillStyle = mortar; g.fillRect(0, 0, 64, 64); for (let r = 0; r < 8; r++) for (let q = -1; q < 4; q++){ g.fillStyle = tint(col, .86 + Math.random() * .24); g.fillRect(q * 16 + (r % 2 ? 8 : 0) + 1, r * 8 + 1, 14, 6.5); } };
  fac("stucco", g => { g.fillStyle = "#d9d3c4"; g.fillRect(0, 0, 64, 64); speckle(g, 64, 64, 900, ["#c8c2b2", "#e6e0d2", "#bdb7a8"], .5, 1.2); });
  fac("pink", g => { g.fillStyle = "#d8aaa4"; g.fillRect(0, 0, 64, 64); speckle(g, 64, 64, 800, ["#c89a94", "#e8bab4"], .5, 1.2); });
  fac("white", g => boards(g, "#e4e2da", "#a8a69e"));
  fac("brick", g => bricks(g, "#9a4a3a", "#b8a898"));
  fac("brown", g => bricks(g, "#6a4a3a", "#8a7a6a"));
  fac("stone", g => { g.fillStyle = "#8a826e"; g.fillRect(0, 0, 64, 64); for (let r = 0; r < 4; r++) for (let q = -1; q < 3; q++){ g.fillStyle = tint("#b8ac94", .9 + Math.random() * .16); g.fillRect(q * 32 + (r % 2 ? 16 : 0) + 1, r * 16 + 1, 30, 14); } speckle(g, 64, 64, 400, ["#9a927e", "#cfc3a9"], .3, 1); });
  fac("glass", g => { const gr = g.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, "#4a5e70"); gr.addColorStop(1, "#2e3c4a"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.fillStyle = "#5a6670"; g.fillRect(0, 0, 2, 64); g.fillRect(0, 60, 64, 4); g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(10, 0, 8, 64); });
  fac("metal", g => { for (let x = 0; x < 64; x += 4){ g.fillStyle = x % 8 ? "#8a9094" : "#a4aaae"; g.fillRect(x, 0, 4, 64); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x + 3, 0, 1, 64); } speckle(g, 64, 64, 200, ["#6a6050", "#b0b4b8"], .35, 1.5); });
  fac("concrete", g => { g.fillStyle = "#8e8e88"; g.fillRect(0, 0, 64, 64); speckle(g, 64, 64, 1200, ["#7a7a74", "#a4a49e"], .5, 1); g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(0, 0, 64, 1); });
  fac("trailer", g => { g.fillStyle = "#dcdad2"; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 5){ g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, y, 64, 1); } });
  fac("log", g => { for (let r = 0; r < 4; r++){ const gr = g.createLinearGradient(0, r * 16, 0, r * 16 + 16); gr.addColorStop(0, "#7a5a3a"); gr.addColorStop(.5, "#9a7652"); gr.addColorStop(1, "#5a3e26"); g.fillStyle = gr; g.fillRect(0, r * 16, 64, 16); } });
  fac("chrome", g => { g.fillStyle = "#c4c8cc"; g.fillRect(0, 0, 64, 64); for (let x = 0; x < 64; x += 3){ g.fillStyle = `rgba(255,255,255,${Math.random() * .2})`; g.fillRect(x, 0, 1, 64); } g.fillStyle = "#b83030"; g.fillRect(0, 40, 64, 6); });
  fac("barn", g => { g.fillStyle = "#8a2a22"; g.fillRect(0, 0, 64, 64); for (let x = 0; x < 64; x += 8){ g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(x, 0, 1.5, 64); } speckle(g, 64, 64, 300, ["#6a1a14", "#a03a30"], .4, 1); });
  const [c, g] = mkCanvas(128, 128);
  g.fillStyle = "#29434a"; g.fillRect(0, 0, 128, 128);
  blobs(g, 128, 128, 10, ["#1e343a", "#36565e"], 10, 30, .5);
  g.strokeStyle = "rgba(160,200,210,.18)"; g.lineWidth = 1;
  for (let k = 0; k < 40; k++){ const x = Math.random() * 128, y = Math.random() * 128; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 5, y - 2, x + 10, y); g.stroke(); }
  TEX.water = pattern(c, 1 / PPT, 1 / PPT);
})();
function facadeKey(b){ const B = buildings[b]; if (!B) return 0; if (B.facade) return B.facade; return B.kind !== "house" ? "block" : b % SIDING.length; }
function paintFace(isS, plane, u0, u1, z0, z1, mat, dim, a, shadeF){
  if (z1 - z0 <= 0.01 || u1 - u0 <= 0.001) return;
  ctx.globalAlpha = a;
  isS ? faceTS(plane) : faceTE(plane);
  const f = (1 - shadeF) * dim;
  if (mat.plaster){
    ctx.fillStyle = shade(mat.plaster, f); ctx.fillRect(u0, z0, u1 - u0, z1 - z0);
    if (z0 < 2 && z1 > 4){ ctx.fillStyle = shade("#5e4a36", f); ctx.fillRect(u0, 0, u1 - u0, 2.6); }
  } else {
    ctx.fillStyle = shadedSide(facadeKey(mat.siding), f);
    ctx.fillRect(u0, z0, u1 - u0, z1 - z0);
    if (z0 < 2 && z1 > 4){ ctx.fillStyle = shade("#77746c", f); ctx.fillRect(u0, 0, u1 - u0, 3); }
    else if (z0 % WALLH < 1 && z0 > 2){ ctx.fillStyle = shade("#6a685f", f); ctx.fillRect(u0, z0, u1 - u0, 1.6); }
  }
  ctx.globalAlpha = 1;
}
function groundKey(i){
  switch (tile[i]){
    case T.GRASS: case T.TREE: return "grass";
    case T.VOID: return "void"; case T.WATER: return "water"; case T.SAND: return "sand"; case T.GRAVEL: return "gravel";
    case T.ROAD: return "road"; case T.WALK: return "walk"; case T.LOT: return "lot"; case T.DIRT: return "dirt";
    case T.FLOOR: { if (G && G.burntTiles && G.burntTiles[i]) return "floor_burnt"; const r = rooms[roomId[i]]; return r ? "floor_" + r.type : "floor"; }
    default: return "floor";
  }
}

// ---------- ground: water below the bank, shadows, curbs, crosswalks, wear ----------
const SUN = [.86, .36];
function paintGroundStatic(x0, x1, y0, y1){
  x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(W - 1, x1); y1 = Math.min(H - 1, y1);
  const paths = new Map(), sh = new Path2D(), ao = new Path2D(), water = new Path2D();
  const add = (k, x, y, w, h) => { let p = paths.get(k); if (!p){ p = new Path2D(); paths.set(k, p); } p.rect(x, y, w, h); };
  const trees = [], banksS = [], banksE = [];
  const curb = new Path2D(), curbHi = new Path2D(), paint = new Path2D(), dark = new Path2D(), crack = new Path2D(), litter = new Path2D(), tuft = new Path2D(), flower = new Path2D(), weeds = new Path2D(), leafp = new Path2D();
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++){
    const i = ix(tx, ty), t = tile[i];
    if (t === T.WATER){ water.rect(tx, ty, 1, 1);
      if (ty > 0 && tile[ix(tx, ty - 1)] !== T.WATER) banksS.push([tx, ty]);
      if (tx > 0 && tile[ix(tx - 1, ty)] !== T.WATER) banksE.push([tx, ty]);
      continue; }
    if (t === T.WALL || t === T.DOOR || t === T.WIN){
      for (let q = 0; q < 4; q++){ const qx = q & 1, qy = q >> 1; add(groundKey(quadSrc(tx, ty, qx, qy)), tx + qx * .5, ty + qy * .5, .5, .5); }
      ao.rect(tx + A_ - .1, ty + A_ - .1, (B_ - A_) + .2, (B_ - A_) + .2);
      if (wallLike(tx - 1, ty)) ao.rect(tx, ty + A_ - .1, A_, (B_ - A_) + .2);
      if (wallLike(tx + 1, ty)) ao.rect(tx + B_, ty + A_ - .1, 1 - B_, (B_ - A_) + .2);
      if (wallLike(tx, ty - 1)) ao.rect(tx + A_ - .1, ty, (B_ - A_) + .2, A_);
      if (wallLike(tx, ty + 1)) ao.rect(tx + A_ - .1, ty + B_, (B_ - A_) + .2, 1 - B_);
    } else add(groundKey(i), tx, ty, 1, 1);
    const o = objs.get(i);
    if (o && OBJ[o.type].block && OBJ[o.type].h > 3){ const q = objRect(o); sh.rect(q[0] - .03, q[1] - .03, q[2] - q[0] + .1, q[3] - q[1] + .1); }
    if (t === T.TREE) trees.push([tx, ty]);
    const hsh = hash3(7, tx, ty);
    if (t === T.WALK){
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]){ if (tile[ix(tx + dx, ty + dy)] !== T.ROAD) continue;
        const ax = dx === 1 ? tx + 1 : tx, ay = dy === 1 ? ty + 1 : ty, bx2 = dx ? ax : tx + 1, by2 = dy ? ay : ty + 1;
        curb.moveTo(ax, ay); curb.lineTo(bx2, by2); curbHi.moveTo(ax - dx * .06, ay - dy * .06); curbHi.lineTo(bx2 - dx * .06, by2 - dy * .06); }
    }
    if (t === T.ROAD || t === T.LOT){
      if (hsh % 97 === 3 && t === T.ROAD){ dark.moveTo(tx + .72, ty + .5); dark.ellipse(tx + .5, ty + .5, .22, .22, 0, 0, 7); }
      if (hsh % 29 === 5){ dark.moveTo(tx + .8, ty + .4); dark.ellipse(tx + .55, ty + .4, .26, .14, .4, 0, 7); }
      if (hsh % 11 === 2){ let x = tx + (hsh % 7) / 7, y = ty + (hsh % 5) / 5; crack.moveTo(x, y); for (let k = 0; k < 4; k++){ x += ((hsh >> k) % 3 - 1) * .18 + .12; y += ((hsh >> (k + 3)) % 3 - 1) * .14; crack.lineTo(x, y); } }
      if (t === T.LOT && tx % 3 === 0 && tile[ix(tx, ty - 1)] === T.LOT && tile[ix(tx, ty + 1)] === T.LOT){ paint.moveTo(tx, ty + .12); paint.lineTo(tx, ty + .88); }
    }
    if ((t === T.WALK || t === T.LOT || t === T.ROAD) && ZONE[i] && hsh % 19 === 4){ litter.rect(tx + (hsh % 9) / 10, ty + (hsh % 7) / 9, .09, .06); }
    if ((t === T.WALK || t === T.ROAD) && hsh % 23 === 6){ const x = tx + (hsh % 9) / 10, y = ty + ((hsh >> 3) % 9) / 10; weeds.moveTo(x, y); weeds.lineTo(x - .03, y - .09); weeds.moveTo(x + .03, y); weeds.lineTo(x + .05, y - .11); weeds.moveTo(x + .06, y); weeds.lineTo(x + .1, y - .07); }
    if (t === T.GRASS && hsh % 9 === 3 && (tile[ix(tx + 1, ty)] === T.TREE || tile[ix(tx, ty + 1)] === T.TREE || tile[ix(tx - 1, ty)] === T.TREE || tile[ix(tx, ty - 1)] === T.TREE)){ const x = tx + (hsh % 8) / 9, y = ty + ((hsh >> 2) % 8) / 9; leafp.rect(x, y, .05, .03); leafp.rect(x + .12, y + .07, .04, .03); leafp.rect(x - .08, y + .1, .04, .025); }
    if (t === T.GRASS){
      if (hsh % 6 === 1){ const x = tx + (hsh % 10) / 10, y = ty + ((hsh >> 4) % 10) / 10; tuft.moveTo(x, y); tuft.lineTo(x + .04, y - .1); tuft.moveTo(x + .06, y); tuft.lineTo(x + .08, y - .12); }
      if (hsh % 37 === 7){ const x = tx + (hsh % 8) / 9, y = ty + ((hsh >> 3) % 8) / 9; flower.moveTo(x + .04, y); flower.arc(x, y, .04, 0, 7); }
    }
  }
  // crosswalks at town crossings
  for (const t of TOWNS){
    if (t.x1 < x0 - 4 || t.x0 > x1 + 4 || t.y1 < y0 - 4 || t.y0 > y1 + 4 || !t.cross) continue;
    for (const [cx, cy] of t.cross){
      if (cx < x0 - 4 || cx > x1 + 4 || cy < y0 - 4 || cy > y1 + 4) continue;
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]){
        if (tile[ix(cx + dx * 3, cy + dy * 3)] !== T.ROAD) continue;
        for (let s = 0; s < 6; s++){
          if (dy) paint.rect(cx - 1.4 + s * .5, cy + dy * 2.2 + (dy < 0 ? -.8 : 0), .26, .8);
          else paint.rect(cx + dx * 2.2 + (dx < 0 ? -.8 : 0), cy - 1.4 + s * .5, .8, .26);
        }
      }
    }
  }
  // building shadows, cast away from an afternoon sun
  const shadow = new Path2D();
  for (const B of buildings){
    if (B.x1 < x0 - 12 || B.x0 > x1 + 2 || B.y1 < y0 - 6 || B.y0 > y1 + 2 || B.x0 === undefined) continue;
    const L = bTop(B) / WALLH * 1.25, dx = SUN[0] * L, dy = SUN[1] * L;
    const r = [[B.x0 + .4, B.y0 + .4], [B.x1 + .6, B.y0 + .4], [B.x1 + .6, B.y1 + .6], [B.x0 + .4, B.y1 + .6]];
    const pts = hull(r.concat(r.map(([x, y]) => [x + dx, y + dy])));
    shadow.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) shadow.lineTo(p[0], p[1]); shadow.closePath();
  }
  isoT(-5); ctx.fillStyle = TEX.water; ctx.fill(water);
  isoT(0);
  for (const [k, p] of paths){ ctx.fillStyle = TEX[k] || TEX.floor; ctx.fill(p); }
  ctx.fillStyle = "rgba(255,250,235,.13)"; ctx.fill(flower);
  ctx.lineWidth = .022; ctx.strokeStyle = "rgba(62,92,34,.75)"; ctx.stroke(weeds); ctx.fillStyle = "rgba(130,88,40,.45)"; ctx.fill(leafp);
  ctx.lineWidth = .025; ctx.strokeStyle = "rgba(20,40,10,.45)"; ctx.stroke(tuft);
  ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fill(ao);
  ctx.fillStyle = "rgba(0,0,0,.24)"; ctx.fill(sh);
  ctx.fillStyle = "rgba(10,10,10,.35)"; ctx.fill(dark);
  ctx.lineWidth = .03; ctx.strokeStyle = "rgba(15,15,15,.55)"; ctx.stroke(crack);
  ctx.fillStyle = "rgba(235,232,220,.7)"; ctx.fill(paint);
  ctx.lineWidth = .06; ctx.strokeStyle = "rgba(235,232,220,.75)"; ctx.stroke(paint);
  ctx.fillStyle = "rgba(220,215,200,.55)"; ctx.fill(litter);
  ctx.lineWidth = .07; ctx.strokeStyle = "rgba(40,40,38,.7)"; ctx.stroke(curb);
  ctx.lineWidth = .04; ctx.strokeStyle = "rgba(200,198,190,.6)"; ctx.stroke(curbHi);
  resetT();
  // the drop from the bank down to the water
  for (const [tx, ty] of banksS){ faceTS(ty); ctx.fillStyle = "#4a3e2a"; ctx.fillRect(tx, -5, 1, 5); ctx.fillStyle = "rgba(220,235,240,.25)"; ctx.fillRect(tx, -5, 1, .8); }
  for (const [tx, ty] of banksE){ faceTE(tx); ctx.fillStyle = "#3e3424"; ctx.fillRect(ty, -5, 1, 5); ctx.fillStyle = "rgba(220,235,240,.25)"; ctx.fillRect(ty, -5, 1, .8); }
  resetT();
}
function drawGround(x0, x1, y0, y1, onScreen){
  useZoomCache();
  const left = camX - CW / 2, top = camY - CH / 2;
  const bx0 = Math.floor(left / GB), bx1 = Math.floor((left + CW) / GB), by0 = Math.floor(top / GB), by1 = Math.floor((top + CH) / GB);
  for (let by = by0 - 1; by <= by1 + 1; by++) for (let bx = bx0 - 1; bx <= bx1 + 1; bx++){
    const inView = bx >= bx0 && bx <= bx1 && by >= by0 && by <= by1;
    if (!inView){ if (!GCH.has(bx + "," + by)) prefetchQ.push([bx, by]); continue; }
    drawGroundBlock(bx, by, left, top);
  }
  if (prefetchQ.length){ const [bx, by] = prefetchQ[0]; blockCanvas(bx, by); prefetchQ.length = 0; }
  if (RV.mode === "upper"){ ctx.fillStyle = "rgba(8,10,16,.28)"; ctx.fillRect(0, 0, CW, CH); return; }
  const dk1 = new Path2D(), dk2 = new Path2D();
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++){
    const i = ix(tx, ty); if (G.vis[i] || !onScreen(tx, ty)) continue;
    (explored[i] ? dk1 : dk2).rect(tx, ty, 1, 1);
  }
  isoT(0);
  ctx.fillStyle = "rgba(8,10,16,.5)"; ctx.fill(dk1);
  ctx.fillStyle = "rgba(8,10,16,.72)"; ctx.fill(dk2);
  resetT();
}

// ---------- tile sprites with any height ----------
function tileSprite(key, tx, ty, a, draw, top = WALLH){
  const pad = 6, w = 2 * hw + 2 * pad, h = top * zoom + 2 * hh + 2 * pad;
  let c = SPR.get(key);
  if (!c && BAKE.s-- <= 0){ draw(); return; }
  if (!c){
    c = document.createElement("canvas"); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
    const sv = [ctx, camX, camY, CW, CH];
    ctx = c.getContext("2d"); CW = 0; CH = 0;
    camX = (tx - ty) * hw - hw - pad; camY = (tx + ty) * hh - top * zoom - pad;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    try { draw(); } finally { [ctx, camX, camY, CW, CH] = sv; }
    SPR.set(key, c);
    if (SPR.size > 3000) SPR.delete(SPR.keys().next().value);
  }
  const [sx, sy] = S(tx, ty, 0);
  ctx.globalAlpha = a; ctx.drawImage(c, sx - hw - pad, sy - top * zoom - pad, w, h); ctx.globalAlpha = 1;
}
// one storey of a tall building's outer wall; identical pieces share one image
function drawUpperSeg(tx, ty, b, B, l, dim, a){
  const pieces = wallPieces(tx, ty);
  const shp = pieces.map(p => `${p.u0},${p.v0},${p.u1},${p.v1},${+p.showS},${+p.showE}`).join(";");
  const fk = facadeKey(b), glass = fk === "glass";
  const straight = pieces.length === 1 && (pieces[0].u1 - pieces[0].u0 === 1 || pieces[0].v1 - pieces[0].v0 === 1);
  const win = straight && (glass || (tx * 7 + ty * 13 + l * 3) % 2 === 0);
  const lit = win && isNight() && powerOn() && hash(b * 7 + l, tx * 3 + ty) < .28 ? 1 : 0;
  const key = `U|${fk}|${shp}|${+win}|${lit}|${dim}`;
  CUR_CACHE.U = CUR_CACHE.U || new Map();
  let c = CUR_CACHE.U.get(key);
  const pad = 6, w = 2 * hw + 2 * pad, h = WALLH * zoom + 2 * hh + 2 * pad;
  if (!c){
    c = document.createElement("canvas"); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
    const sv = [ctx, camX, camY, CW, CH];
    ctx = c.getContext("2d"); CW = 0; CH = 0; camX = -hw - pad; camY = -WALLH * zoom - pad;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    try {
      const mat = { siding: b };
      for (const p of pieces) slab(0, 0, p.u0, p.v0, p.u1, p.v1, 0, WALLH, mat, mat, shade(glass ? "#3a4652" : "#7a7870", 1), dim, 1, p.showS, p.showE);
      if (win){
        const hz = pieces[0].u1 - pieces[0].u0 === 1;
        const L = (p0, q0, p1, q1) => hz ? [p0, q0, p1, q1] : [q0, p0, q1, p1];
        const g = L(glass ? .02 : .22, .47, glass ? .98 : .78, .53), col = lit ? "#e8cf8a" : glass ? "#6a8aa0" : "#7a98a8";
        if (!glass){ const s = L(.18, A_ - .03, .82, B_ + .03); boxW(s[0], s[1], s[2], s[3], 12, 13.5, shade("#d8d4c8", dim), 1); }
        boxW(g[0], g[1], g[2], g[3], glass ? 3 : 13.5, glass ? 41 : 34, shade(col, dim), .9);
        if (!glass) for (const pp of [.2, .78]){ const r = L(pp, A_, pp + .03, B_); boxW(r[0], r[1], r[2], r[3], 13.5, 34, shade("#d8d4c8", dim), 1); }
      }
    } finally { [ctx, camX, camY, CW, CH] = sv; }
    CUR_CACHE.U.set(key, c);
  }
  const [sx, sy] = S(tx, ty, l * WALLH);
  ctx.globalAlpha = a; ctx.drawImage(c, sx - hw - pad, sy - WALLH * zoom - pad, w, h); ctx.globalAlpha = 1;
}

// fade anything that stands between the camera and the survivor
function computeFade(){}
function tileAlphaH(tx, ty, pdepth, top){
  if (tx + ty + 1 - pdepth <= 0.3) return 1;
  const [sx, sy] = S(tx + .5, ty + .5, 0);
  if (Math.abs(sx - PSX) > hw * 1.5) return 1;
  if (PSY < sy - top * zoom - hh - 8 || PSY > sy + hh) return 1;
  return 0.26;
}
function tileAlpha(tx, ty, myB, pdepth, tall){ return tall ? tileAlphaH(tx, ty, pdepth, WALLH) : 1; }

// ---------- walls, doors, windows, floors, trees, things ----------
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
  if (isWall){
    const cut = inMine && front;
    const gH = inMine ? WALLH : gTop(B);
    const H = cut ? 6 : gH;
    const above = !B || inMine ? 0 : upperOf ? RV.k - 1 : B.floors - 1;
    const fullTop = upperOf ? RV.k * WALLH : inMine ? WALLH : bTop(B);
    const a = cut ? 1 : tileAlphaH(tx, ty, pdepth, fullTop);
    const trimTop = B && !inMine ? (B.kind === "house" || B.kind === "church" ? shade(ROOFC[b % ROOFC.length], .7) : "#6a6c68") : "#b5ad9c";
    const f = feats.get(i);
    const glow = t === T.WIN && isNight() && powerOn() ? 1 : 0;
    const key = i + "|" + (cut ? 1 : 0) + "|" + dim + "|" + (B && !inMine ? 1 : 0) + "|" + featKey(f) + glow + "|" + H;
    tileSprite(key, tx, ty, a, () => {
      const pieces = wallPieces(tx, ty);
      const mats = (pc) => [wallMat(quadSrc(tx, ty, (pc.u0 + pc.u1) / 2 < .5 ? 0 : 1, 1), b), wallMat(quadSrc(tx, ty, 1, (pc.v0 + pc.v1) / 2 < .5 ? 0 : 1), b)];
      if (t === T.WALL){ for (const pc of pieces){ const [mS, mE] = mats(pc); slab(tx, ty, pc.u0, pc.v0, pc.u1, pc.v1, 0, H, mS, mE, trimTop, dim, 1, pc.showS, pc.showE); } }
      else {
        if (t === T.DOOR) drawDoorThin(tx, ty, f, b, dim, 1, cut, Math.min(H, WALLH), trimTop, mats);
        else drawWindowThin(tx, ty, f, b, dim, 1, cut, Math.min(H, WALLH), trimTop, mats);
        if (H > WALLH + .5){ const hz = f.horiz, pc = hz ? { u0: 0, v0: A_, u1: 1, v1: B_ } : { u0: A_, v0: 0, u1: B_, v1: 1 }; const [mS, mE] = mats(pc); slab(tx, ty, pc.u0, pc.v0, pc.u1, pc.v1, WALLH, H, mS, mE, trimTop, dim, 1, hz, !hz); }
      }
      if (B && !inMine && !cut) shopFront(tx, ty, B, dim);
    }, Math.max(H, WALLH));
    for (let l = 1; l <= above; l++) drawUpperSeg(tx, ty, b, B, l, dim, a);
    if (B && B.sign && !inMine && !cut && B.front === "bottom" && ty === B.y1 && tx > B.x0 && tx < B.x1) facadeSignSlice(tx, B, a);
    return;
  }
  if (t === T.FLOOR && B && !inMine && !G.vis[i]) return;
  if (t === T.TREE){ drawTree(tx, ty, dim, tileAlphaH(tx, ty, pdepth, 66)); return; }
  const o = objs.get(i);
  if (o && seen){
    const h = OBJ[o.type].h || 0;
    drawObj(o, dim, h > 20 ? tileAlphaH(tx, ty, pdepth, h) : 1);
    if (OBJ[o.type].light && powerOn() && isNight() && !RV.inPocket){ const [sx, sy] = S(o.x + .5, o.y + .5, o.type === "lamp" ? 56 : 30); LIGHTS.push([sx, sy, OBJ[o.type].light, o.type === "lamp" ? "255,190,110" : "255,210,140"]); }
  }
}
// awnings over shop windows on fronts you can see
function shopFront(tx, ty, B, dim){
  if (!B.sign || B.front !== "bottom" || ty !== B.y1 || B.floors > 2) return;
  if (["house", "hospital", "school", "police", "church", "apartments", "office", "warehouse", "library", "firestation", "bank", "post"].includes(B.kind)) return;
  if (tile[ix(tx, ty)] !== T.WIN) return;
  const [bg, fg] = B.sign.col, y = ty + B_;
  for (let s = 0; s < 4; s++){ const x0 = tx + s * .25; boxW(x0, y, x0 + .25, y + .32, 33, 36, shade(s % 2 ? bg : "#efeae0", dim), 1); }
}

// ---------- signs ----------
const SIGNS = new Map();
function signCanvas(text, bg, fg, lit, fixed = false){
  const key = text + bg + fg + lit + fixed; let c = SIGNS.get(key); if (c) return c;
  const font = fs => `bold ${fs}px "Arial Narrow", Arial, sans-serif`, T2 = text.toUpperCase();
  const [m0, mg] = mkCanvas(4, 4); mg.font = font(34);
  const wd = fixed ? 320 : Math.max(110, Math.ceil(mg.measureText(T2).width) + 30);
  const [cv2, g] = mkCanvas(wd, 48);
  g.fillStyle = bg; g.fillRect(0, 0, wd, 48); g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 3; g.strokeRect(1.5, 1.5, wd - 3, 45);
  let fs = 34; g.font = font(fs);
  while (g.measureText(T2).width > wd - 24 && fs > 12){ fs -= 2; g.font = font(fs); }
  g.textAlign = "center"; g.textBaseline = "middle";
  if (lit){ g.shadowColor = fg; g.shadowBlur = 12; }
  g.fillStyle = fg; g.fillText(T2, wd / 2, 26);
  SIGNS.set(key, cv2); return cv2;
}
// how many tiles long a sign must be to keep its letters in proportion at a given height
const signLen = (img, hz) => img.width / img.height * hz / 35.8;
function drawDecal(isS, plane, u0, u1, zTop, zBot, img, sx0 = 0, sx1 = img.width, a = 1){
  const Wi = sx1 - sx0, Hi = img.height, du = (u1 - u0) / Wi, dz = (zTop - zBot) / Hi;
  let A, Bm, E, F;
  if (isS){ A = du * hw; Bm = du * hh; [E, F] = S(u0, plane, zTop); }
  else { A = du * hw; Bm = -du * hh; [E, F] = S(plane, u1, zTop); }
  ctx.save(); ctx.setTransform(DPR * A, DPR * Bm, 0, DPR * dz * zoom, DPR * E, DPR * F); ctx.globalAlpha = a;
  ctx.drawImage(img, sx0, 0, Wi, Hi, 0, 0, Wi, Hi); ctx.restore();
}
function facadeSignSlice(tx, B, a){
  const lit = B.sign.neon && isNight() && powerOn();
  const img = signCanvas(B.sign.text, B.sign.col[0], B.sign.col[1], lit);
  const hz = 8, span = B.x1 - B.x0 - 1.4, len = Math.min(span, signLen(img, hz)), mid = (B.x0 + B.x1 + 1) / 2, uA = mid - len / 2, uB = mid + len / 2;
  const o0 = Math.max(tx, uA), o1 = Math.min(tx + 1, uB); if (o1 - o0 < .01) return;
  const zb = Math.min(gTop(B), WALLH) - 2;
  drawDecal(true, B.y1 + B_ + .02, o0, o1, zb, zb - hz, img, (o0 - uA) / len * img.width, (o1 - uA) / len * img.width, a);
  if (lit && tx === Math.floor(mid)){ const [sx, sy] = S(mid, B.y1 + 1, zb - 4); LIGHTS.push([sx, sy, 3.5, hexRgb(B.sign.col[1])]); }
}
const hexRgb = h => { const n = parseInt(h.slice(1), 16); return `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; };

// ---------- roofs at any height ----------
const MAXTOP = 8 * WALLH;
function roofBlock(bx, by){
  const key = bx + "," + by;
  let e = RCH.get(key); if (e) return e;
  const d = Math.min(DPR, 1.5), c = document.createElement("canvas"); c.width = Math.ceil(GB * d); c.height = Math.ceil(GB * d);
  const sv = [ctx, camX, camY, CW, CH, DPR];
  ctx = c.getContext("2d"); CW = 0; CH = 0; DPR = d; camX = bx * GB; camY = by * GB;
  let has = false;
  try {
    let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    for (const z of [WALLH * .9, MAXTOP]) for (const [px, py] of [[0, 0], [GB, 0], [0, GB], [GB, GB]]){ const [wx, wy] = toWorld(px, py + z * zoom); mnx = Math.min(mnx, wx); mxx = Math.max(mxx, wx); mny = Math.min(mny, wy); mxy = Math.max(mxy, wy); }
    const groups = new Map();
    const add = (b, x, y, w, h) => { const top = bTop(buildings[b]), k = roofKey(b) + "|" + top; let g = groups.get(k); if (!g){ g = { top, pat: roofKey(b), p: new Path2D(), trim: new Path2D() }; groups.set(k, g); } g.p.rect(x, y, w, h); has = true; };
    for (let ty = Math.max(0, Math.floor(mny) - 1); ty <= Math.min(PK_Y0 - 1, Math.ceil(mxy) + 1); ty++)
      for (let tx = Math.max(0, Math.floor(mnx) - 1); tx <= Math.min(W - 1, Math.ceil(mxx) + 1); tx++){
        const i = ix(tx, ty), b = bldId[i]; if (b < 0) continue;
        const rt = buildings[b].roofType; if (rt && rt !== "flat") continue;
        const t = tile[i];
        if (t === T.FLOOR || !perim[i]) add(b, tx, ty, 1, 1);
        else for (let q = 0; q < 4; q++){ const qx = q & 1, qy = q >> 1, src = quadSrc(tx, ty, qx, qy);
          if (tile[src] === T.FLOOR && bldId[src] === b) add(b, tx + qx * .5, ty + qy * .5, .5, .5); }
      }
    for (const g of [...groups.values()].sort((a, b) => a.top - b.top)){
      ctx.setTransform(d * hw, d * hh, -d * hw, d * hh, -d * camX, -d * (camY + g.top * zoom));
      ctx.fillStyle = ROOF_PAT[g.pat]; ctx.fill(g.p);
    }
  } finally { [ctx, camX, camY, CW, CH, DPR] = sv; }
  e = { c, has }; RCH.set(key, e);
  if (RCH.size > GCAP) RCH.delete(RCH.keys().next().value);
  return e;
}
function drawRoofLayer(x0, x1, y0, y1, myB, pdepth, onScreen){
  const left = camX - CW / 2, top = camY - CH / 2;
  const bx0 = Math.floor(left / GB), bx1 = Math.floor((left + CW) / GB), by0 = Math.floor(top / GB), by1 = Math.floor((top + CH) / GB);
  const groups = new Map(); let nCut = 0;
  const G2 = top2 => { let g = groups.get(top2); if (!g){ g = { holes: new Path2D(), fade: new Path2D() }; groups.set(top2, g); } return g; };
  const near = new Set();
  for (let ty = y0; ty <= Math.min(y1 + 26, PK_Y0 - 1); ty += 2) for (let tx = x0; tx <= Math.min(x1 + 26, W - 1); tx += 2){ const b = bldId[ix(tx, ty)]; if (b >= 0) near.add(b); }
  VIEWB = near;
  const cutB = RV.mode === "upper" ? RV.b : myB;
  const flatB = b => { const rt = buildings[b].roofType; return !rt || rt === "flat"; };
  if (cutB >= 0 && flatB(cutB)){ const B = buildings[cutB]; G2(bTop(B)).holes.rect(B.x0 - .05, B.y0 - .05, B.x1 - B.x0 + 1.1, B.y1 - B.y0 + 1.1); nCut++; }
  if (RV.mode !== "upper" && G.visBox){
    const [vx0, vy0, vx1, vy1] = G.visBox;
    for (let ty = vy0; ty <= vy1; ty++) for (let tx = vx0; tx <= vx1; tx++){
      const i = ix(tx, ty), b = bldId[i]; if (b < 0 || b === cutB || !flatB(b)) continue;
      if (tile[i] === T.FLOOR){ if (G.vis[i]){ G2(bTop(buildings[b])).holes.rect(tx, ty, 1, 1); nCut++; } continue; }
      if (perim[i]) for (let q = 0; q < 4; q++){ const qx = q & 1, qy = q >> 1, src = quadSrc(tx, ty, qx, qy); if (G.vis[src] && tile[src] === T.FLOOR){ G2(bTop(buildings[b])).holes.rect(tx + qx * .5, ty + qy * .5, .5, .5); nCut++; } }
    }
  }
  const fadePt = new Map();
  for (const b of near){
    if (b === cutB || !flatB(b)) continue;
    const B = buildings[b], tp = bTop(B);
    let fp = fadePt.get(tp); if (!fp){ fp = toWorld(PSX, PSY + tp * zoom); fadePt.set(tp, fp); }
    if (fp[0] < B.x0 - 3 || fp[0] > B.x1 + 3 || fp[1] < B.y0 - 3 || fp[1] > B.y1 + 3) continue;
    const r = 1.9 + tp / WALLH * .2, g = G2(tp);
    for (let ty = Math.floor(fp[1] - r); ty <= Math.ceil(fp[1] + r); ty++) for (let tx = Math.floor(fp[0] - r); tx <= Math.ceil(fp[0] + r); tx++){
      if (!inb(tx, ty) || bldId[ix(tx, ty)] !== b || tx + ty + 1 <= pdepth + .3) continue;
      if ((tx + .5 - fp[0]) ** 2 + (ty + .5 - fp[1]) ** 2 < r * r){ g.fade.rect(tx, ty, 1, 1); nCut++; }
    }
  }
  // nothing to cut or fade: roofs go straight onto the screen
  if (!nCut){ for (let by = by0; by <= by1; by++) for (let bx = bx0; bx <= bx1; bx++) drawRoofBlock(bx, by, left, top, ctx); return; }
  if (roofCv.width !== cv.width || roofCv.height !== cv.height){ roofCv.width = cv.width; roofCv.height = cv.height; }
  rctx.setTransform(1, 0, 0, 1, 0, 0); rctx.clearRect(0, 0, roofCv.width, roofCv.height);
  rctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  let any = false;
  for (let by = by0; by <= by1; by++) for (let bx = bx0; bx <= bx1; bx++) if (drawRoofBlock(bx, by, left, top, rctx)) any = true;
  if (!any) return;
  rctx.globalCompositeOperation = "destination-out"; rctx.fillStyle = "#000";
  for (const [tp, g] of groups){
    rctx.setTransform(DPR * hw, DPR * hh, -DPR * hw, DPR * hh, DPR * (CW / 2 - camX), DPR * (CH / 2 - camY - tp * zoom));
    rctx.fill(g.holes); rctx.globalAlpha = .74; rctx.fill(g.fade); rctx.globalAlpha = 1;
  }
  rctx.globalCompositeOperation = "source-over";
  ctx.drawImage(roofCv, 0, 0, CW, CH);
}
// chimneys, air-conditioning units, steeples, water tanks, helipads and rooftop signs
function drawRoofProps(x0, x1, y0, y1, myB){
  const seen = VIEWB;
  const list = [...seen].filter(b => b !== myB && !(RV.mode === "upper" && b === RV.b) && buildings[b].props).sort((a, c) => (buildings[a].x0 + buildings[a].y0) - (buildings[c].x0 + buildings[c].y0));
  for (const b of list){
    const B = buildings[b], top0 = bTop(B);
    if (!explored[ix(B.x0, B.y0)] && !explored[ix(B.x1, B.y1)] && !explored[ix((B.x0 + B.x1) >> 1, (B.y0 + B.y1) >> 1)]) continue;
    for (const p of B.props){
      const top = top0 + (p.t === "chimney" || p.t === "antenna" ? roofLift(B, p.x, p.y) : 0);
      const [sx, sy] = S(p.x, p.y, top);
      const a = Math.hypot(sx - PSX, sy - PSY) < 70 * zoom && p.x + p.y > (RV.mode === "upper" ? 0 : P.x + P.y) ? .3 : 1;
      switch (p.t){
        case "skylight": boxW(p.x - .7, p.y - .5, p.x + .7, p.y + .5, top, top + 4, "#8aa8b8", a * .8); break;
        case "ac": boxW(p.x - .32, p.y - .24, p.x + .32, p.y + .24, top, top + 7, "#9ea09a", a); topEl(p.x, p.y, .14, top + 7.1, "#5a5c58", a); break;
        case "chimney": boxW(p.x - .2, p.y - .2, p.x + .2, p.y + .2, top - 4, top + 18, "#8a4a3a", a); boxW(p.x - .23, p.y - .23, p.x + .23, p.y + .23, top + 18, top + 20, "#5a3a2e", a); break;
        case "antenna": line3([p.x, p.y, top], [p.x, p.y, top + 26], "#3a3a3a", 1.2, a); for (const h of [18, 22, 25]) line3([p.x - .3, p.y + .3, top + h], [p.x + .3, p.y - .3, top + h], "#3a3a3a", 1, a); break;
        case "tank": for (const [dx, dy] of [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]]) line3([p.x + dx, p.y + dy, top], [p.x + dx, p.y + dy, top + 12], "#4a3a2a", 1.5, a);
          { const [cx, cy] = S(p.x, p.y, top + 12), rx = .45 * hw * 1.41, ry = .45 * hh * 1.41, ht = 16 * zoom; ctx.globalAlpha = a; ctx.fillStyle = "#6a4e34"; ctx.fillRect(cx - rx, cy - ht, rx * 2, ht); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI); ctx.fill(); ctx.fillStyle = "#4a3624"; ctx.beginPath(); ctx.moveTo(cx - rx, cy - ht); ctx.lineTo(cx, cy - ht - 10 * zoom); ctx.lineTo(cx + rx, cy - ht); ctx.fill(); ctx.globalAlpha = 1; } break;
        case "steeple": {
          boxW(p.x - .9, p.y - .9, p.x + .9, p.y + .9, top - 12, top + 34, "#e8e4da", a);
          const t2 = top + 34, pts = [[p.x - .95, p.y + .95], [p.x + .95, p.y + .95], [p.x + .95, p.y - .95]].map(([x, y]) => S(x, y, t2)), apex = S(p.x, p.y, t2 + 46);
          poly([pts[0], pts[1], apex], "#4a4e58", a); poly([pts[1], pts[2], apex], "#5a5e68", a);
          line3([p.x, p.y, t2 + 46], [p.x, p.y, t2 + 62], "#d8c060", 1.6, a); line3([p.x - .2, p.y + .2, t2 + 57], [p.x + .2, p.y - .2, t2 + 57], "#d8c060", 1.6, a);
          break;
        }
        case "helipad": { topEl(p.x, p.y, 2.2, top + .2, "rgba(230,230,220,.5)", a); topEl(p.x, p.y, 1.9, top + .25, "#5a5e60", a);
          for (const [a0, a1] of [[[-.6, -.8], [-.6, .8]], [[.6, -.8], [.6, .8]], [[-.6, 0], [.6, 0]]]) line3([p.x + a0[0], p.y + a0[1], top + .3], [p.x + a1[0], p.y + a1[1], top + .3], "#e8e4d8", 3, a); break; }
        case "roofsign": {
          const lit = B.sign.neon && isNight() && powerOn(), img = signCanvas(B.sign.text, B.sign.col[0], B.sign.col[1], lit);
          const len = Math.min(p.w, signLen(img, 11)), x0 = p.x + (p.w - len) / 2;
          for (const u of [x0 + .3, x0 + len - .3]) line3([u, p.y, top], [u, p.y, top + 4], "#3a3a3a", 1.4, a);
          boxW(x0, p.y - .05, x0 + len, p.y + .05, top + 4, top + 15, "#2a2a2a", a);
          drawDecal(true, p.y + .051, x0, x0 + len, top + 15, top + 4, img, 0, img.width, a);
          if (lit){ const [lx, ly] = S(x0 + len / 2, p.y, top + 10); LIGHTS.push([lx, ly, 4, hexRgb(B.sign.col[1])]); }
          break;
        }
      }
    }
  }
}

// ---------- street props and other new things ----------
function drawDecor(o, dim, a){
  const x = o.x, y = o.y, sd = c => shade(c, dim), cx = x + .5, cy = y + .5;
  const night = isNight(), pw = powerOn(x + .5, y + .5);
  switch (o.type){
    case "stairs": {
      const [dx, dy] = o.dir || [0, 1];
      if (o.up){ for (let s = 0; s < 6; s++){ const f0 = s / 6, f1 = (s + 1) / 6, z = (s + 1) * 6;
          const r = dy ? [x + .12, dy > 0 ? y + f0 * .9 : y + 1 - f1 * .9, x + .88, dy > 0 ? y + f1 * .9 : y + 1 - f0 * .9] : [dx > 0 ? x + f0 * .9 : x + 1 - f1 * .9, y + .12, dx > 0 ? x + f1 * .9 : x + 1 - f0 * .9, y + .88];
          boxW(r[0], r[1], r[2], r[3], 0, z, sd(s % 2 ? "#8a6a48" : "#7a5c3e"), a); }
        line3([x + .1, y + .1, 8], [x + .1, y + .9, 38], sd("#4a3424"), 1.5, a);
      } else { topR(x + .1, y + .1, x + .9, y + .9, .2, sd("#1a140e"), a); for (let s = 1; s < 5; s++) topR(x + .1, y + .1 + s * .16, x + .9, y + .18 + s * .16, .25, sd("#3a2c1e"), a);
        for (const [px, py] of [[x + .08, y + .08], [x + .92, y + .08], [x + .08, y + .92]]) line3([px, py, 0], [px, py, 14], sd("#4a3424"), 1.4, a);
        line3([x + .08, y + .08, 14], [x + .92, y + .08, 14], sd("#5a4430"), 1.4, a); line3([x + .08, y + .08, 14], [x + .08, y + .92, 14], sd("#5a4430"), 1.4, a); }
      return true;
    }
    case "lamp": {
      if (!o.arm){ let best = [0, 1]; for (const [ddx, ddy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) if (tile[ix(x + ddx, y + ddy)] === T.ROAD) best = [ddx, ddy]; o.arm = best; }
      const ax = cx + o.arm[0] * .55, ay = cy + o.arm[1] * .55, lit = pw && night;
      line3([cx, cy, 0], [cx, cy, 56], sd("#3e4246"), 2.4, a); line3([cx, cy, 55], [ax, ay, 57], sd("#3e4246"), 1.8, a);
      boxW(ax - .14, ay - .1, ax + .14, ay + .1, 53, 57, sd("#4a4e52"), a); topEl(ax, ay, .1, 52.8, lit ? "#ffe6a8" : sd("#8a8a80"), a);
      if (lit){ const [sx, sy] = S(ax, ay, 52); LIGHTS.push([sx, sy, 5.5, "255,190,110"]); }
      return true;
    }
    case "hydrant": boxW(x + .4, y + .4, x + .6, y + .6, 0, 9, sd("#c8302a"), a); topEl(cx, cy, .12, 9, sd("#a82420"), a); boxW(x + .33, y + .46, x + .67, y + .54, 4, 6.5, sd("#b82a24"), a); return true;
    case "mailbox": line3([cx, cy, 0], [cx, cy, 8], sd("#4a3a2a"), 1.6, a); boxW(x + .38, y + .32, x + .62, y + .68, 8, 12, sd(o.col || "#2a3a5a"), a); topEl(cx, cy, .12, 12, sd("#3a4a6a"), a, .18); line3([x + .62, y + .4, 10], [x + .62, y + .4, 14], "#c8302a", 1.2, a); return true;
    case "bench": for (const u of [.15, .85]) line3([x + u, cy, 0], [x + u, cy, 5], sd("#2a2a2a"), 1.4, a); boxW(x + .08, y + .4, x + .92, y + .62, 5, 6.5, sd("#7a5634"), a); boxW(x + .08, y + .36, x + .92, y + .42, 6.5, 11, sd("#6a4a30"), a); return true;
    case "trashcan": boxW(x + .34, y + .34, x + .66, y + .66, 0, 11, sd("#4a5048"), a); topEl(cx, cy, .19, 11.5, sd("#2e322c"), a); return true;
    case "dumpster": boxW(x - .05, y + .15, x + 1.05, y + .85, 1, 16, sd("#2f5a3a"), a); boxW(x - .05, y + .15, x + 1.05, y + .85, 16, 17.5, sd("#244a2e"), a); for (const u of [.05, .95]) topEl(x + u, y + .85, .06, 1, "#111", a); return true;
    case "upole": {
      line3([cx, cy, 0], [cx, cy, 70], sd("#5a4632"), 3, a);
      const hz = o.wire ? Math.abs(o.wire[0] - o.x) > 0 : true;
      const ca = hz ? [[cx, cy - .6], [cx, cy + .6]] : [[cx - .6, cy], [cx + .6, cy]];
      line3([ca[0][0], ca[0][1], 64], [ca[1][0], ca[1][1], 64], sd("#5a4632"), 2, a);
      if (hash(x, y) < .3) boxW(cx - .14, cy - .14, cx + .14, cy + .14, 52, 60, sd("#7a7e80"), a);
      if (o.wire){
        const n = [o.wire[0] + .5, o.wire[1] + .5], nca = hz ? [[n[0], n[1] - .6], [n[0], n[1] + .6]] : [[n[0] - .6, n[1]], [n[0] + .6, n[1]]];
        ctx.strokeStyle = "rgba(20,20,20,.75)"; ctx.lineWidth = Math.max(.8, .9 * zoom);
        for (let k = 0; k < 2; k++){ const p0 = S(ca[k][0], ca[k][1], 64), p1 = S(nca[k][0], nca[k][1], 64); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 9 * zoom, p1[0], p1[1]); ctx.stroke(); }
      }
      return true;
    }
    case "bush": { const [sx, sy] = S(cx, cy, 0), g0 = hash(x, y);
      ctx.globalAlpha = a; for (let k = 0; k < 5; k++){ const ang = k * 1.3 + g0 * 6, r = (6 + (k % 2) * 2) * zoom, bx = sx + Math.cos(ang) * 6 * zoom, by = sy - (8 + Math.sin(ang * 1.7) * 3) * zoom;
        const gr = ctx.createRadialGradient(bx - r * .3, by - r * .4, r * .1, bx, by, r); gr.addColorStop(0, sd("#5a7a3e")); gr.addColorStop(1, sd("#2a3e1e")); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1; return true; }
    case "hedge": { const r = objRect(o); boxW(r[0] - .06, r[1] - .06, r[2] + .06, r[3] + .06, 0, 18, sd("#34502a"), a); for (let k = 0; k < 4; k++){ const u = k / 4 + .12; o.horiz ? topEl(x + u, cy, .14, 18, sd("#3e5e30"), a) : topEl(cx, y + u, .14, 18, sd("#3e5e30"), a); } return true; }
    case "fence": case "fencew": drawFenceJ(o, dim, a); return true;
    case "tlight": {
      line3([cx, cy, 0], [cx, cy, 52], sd("#3a3e42"), 2.4, a);
      const lit = pw, ph = Math.floor(G.simT / 4) % 3;
      boxW(cx - .12, cy - .12, cx + .12, cy + .12, 38, 52, sd("#2a2c2e"), a);
      [["#ff3a2a", 49], ["#ffc82a", 45], ["#3aff6a", 41]].forEach(([c2, z], k) => { const on = lit && ((k === 0 && ph === 0) || (k === 1 && ph === 1) || (k === 2 && ph === 2)); const [sx, sy] = S(cx + .13, cy + .13, z); ctx.globalAlpha = a; ctx.fillStyle = on ? c2 : "#1a1a1a"; ctx.beginPath(); ctx.arc(sx, sy, 1.6 * zoom, 0, 7); ctx.fill(); ctx.globalAlpha = 1; if (on && night) LIGHTS.push([sx, sy, 1.6, hexRgb(c2)]); });
      return true;
    }
    case "stopsign": { line3([cx, cy, 0], [cx, cy, 26], sd("#7a7e80"), 1.4, a); const [sx, sy] = S(cx, cy, 30), r = 4 * zoom; ctx.globalAlpha = a; ctx.fillStyle = sd("#c8302a"); ctx.beginPath(); for (let k = 0; k < 8; k++){ const an = k / 8 * 6.283 + .39; ctx.lineTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r); } ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(sx - r * .6, sy - r * .15, r * 1.2, r * .3); ctx.globalAlpha = 1; return true; }
    case "phonebooth": boxW(x + .25, y + .25, x + .75, y + .75, 0, 36, sd("#9aa8b4"), a * .8); boxW(x + .23, y + .23, x + .77, y + .77, 36, 40, sd("#5a6a7a"), a); boxW(x + .3, y + .74, x + .7, y + .76, 30, 34, "#2a5a9a", a); return true;
    case "busstop": for (const [u, v] of [[.08, .2], [.92, .2]]) line3([x + u, y + v, 0], [x + u, y + v, 28], sd("#5a6a7a"), 1.5, a); boxW(x - .05, y + .1, x + 1.05, y + .8, 28, 30, sd("#5a6a7a"), a); boxW(x + .05, y + .18, x + .95, y + .22, 2, 27, sd("#9ab0c0"), a * .45); boxW(x + .15, y + .4, x + .85, y + .6, 5, 6.5, sd("#7a5634"), a); return true;
    case "newsbox": boxW(x + .32, y + .32, x + .68, y + .68, 0, 12, sd(o.col || "#2a5a9a"), a); boxW(x + .36, y + .66, x + .64, y + .69, 6, 10, sd("#c8d8e0"), a); return true;
    case "billboard": {
      for (const u of [.15, .85]) line3([x + u, cy, 0], [x + u, cy, 52], sd("#4a4e52"), 2.4, a);
      boxW(x - .5, cy - .05, x + 1.5, cy + .05, 52, 84, sd("#2a2a2a"), a);
      const img = signCanvas(o.text || "STAY INDOORS", "#e8e2d0", "#2a2a2a", false, true);
      drawDecal(true, cy + .051, x - .45, x + 1.45, 82, 54, img, 0, img.width, a);
      return true;
    }
    case "polesign": {
      line3([cx, cy, 0], [cx, cy, 44], sd("#4a4e52"), 2.4, a);
      boxW(cx - .9, cy - .06, cx + .9, cy + .06, 44, 60, sd("#222"), a);
      const lit = o.neon && pw && night, c2 = o.col || ["#222", "#fff"], img = signCanvas(o.text || "OPEN", c2[0], c2[1], lit, true);
      drawDecal(true, cy + .061, cx - .88, cx + .88, 59, 45, img, 0, img.width, a);
      if (lit){ const [sx, sy] = S(cx, cy, 52); LIGHTS.push([sx, sy, 4.5, hexRgb(c2[1])]); }
      return true;
    }
    case "welcome": {
      for (const u of [.1, .9]) line3([x + u, cy, 0], [x + u, cy, 12], sd("#4a3a2a"), 1.6, a);
      boxW(x - .3, cy - .05, x + 1.3, cy + .05, 10, 24, sd("#2f5a3a"), a);
      const img = signCanvas("Welcome to " + (o.text || "town"), "#2f5a3a", "#f0ead0", false, true);
      drawDecal(true, cy + .051, x - .28, x + 1.28, 23, 11, img, 0, img.width, a);
      return true;
    }
    case "swing": for (const u of [.05, .95]){ line3([x + u, y + .1, 0], [x + u, cy, 30], sd("#8a3a2a"), 1.6, a); line3([x + u, y + .9, 0], [x + u, cy, 30], sd("#8a3a2a"), 1.6, a); }
      line3([x + .05, cy, 30], [x + .95, cy, 30], sd("#8a3a2a"), 1.8, a); for (const u of [.3, .7]){ line3([x + u, cy, 30], [x + u, cy, 8], "#555", .8, a); boxW(x + u - .08, cy - .04, x + u + .08, cy + .04, 7, 8, sd("#3a3a3a"), a); } return true;
    case "slide": line3([x + .1, y + .2, 0], [x + .1, y + .2, 22], sd("#aaa"), 1.4, a); line3([x + .3, y + .2, 0], [x + .3, y + .2, 22], sd("#aaa"), 1.4, a); boxW(x + .05, y + .1, x + .35, y + .3, 22, 23.5, sd("#c84a2a"), a); poly([S(x + .1, y + .3, 22), S(x + .3, y + .3, 22), S(x + .3, y + 1, 2), S(x + .1, y + 1, 2)], sd("#3a6aa8"), a); return true;
    case "picnic": boxW(x + .1, y + .3, x + .9, y + .7, 8, 9.5, sd("#7a5634"), a); boxW(x + .1, y + .1, x + .9, y + .24, 4.5, 5.5, sd("#6a4a30"), a); boxW(x + .1, y + .76, x + .9, y + .9, 4.5, 5.5, sd("#6a4a30"), a); return true;
    case "cart": { ctx.globalAlpha = a; boxW(x + .3, y + .25, x + .75, y + .75, 4, 11, sd("#a8acb0"), .35 * a); for (const [u, v] of [[.3, .25], [.75, .25], [.3, .75], [.75, .75]]) line3([x + u, y + v, 4], [x + u, y + v, 11], sd("#8a8e92"), .8, a); for (const [u, v] of [[.32, .3], [.72, .3], [.32, .7], [.72, .7]]) topEl(x + u, y + v, .04, 1, "#222", a); ctx.globalAlpha = 1; return true; }
    case "flowerbed": topR(x + .05, y + .2, x + .95, y + .8, .5, sd("#4a3424"), a); for (let k = 0; k < 6; k++) topEl(x + .12 + k * .14, y + .35 + (k % 2) * .3, .05, 2, ["#d84a6a", "#e8c040", "#f0f0f0", "#a85ad8"][(k + x) % 4], a); return true;
    case "porchlight": drawPorchLight(o, dim, a, pw, night); return true;
    case "reeds": for (let k = 0; k < 6; k++){ const u = x + .15 + (hash(x + k, y) * .7), v = y + .15 + (hash(x, y + k) * .7); line3([u, v, 0], [u + .03, v, 9 + k % 3 * 2], sd("#6a7a3a"), 1, a); if (k % 2) line3([u + .03, v, 9 + k % 3 * 2], [u + .03, v, 12 + k % 3 * 2], sd("#6a4a2a"), 1.6, a); } return true;
    case "rock": { const g0 = hash(x, y); boxW(x + .2 + g0 * .1, y + .25, x + .8, y + .75 - g0 * .1, 0, 6 + g0 * 6, sd("#7a7870"), a); topEl(x + .45, y + .45, .12, 7 + g0 * 6, sd("#9a9890"), a * .6); return true; }
    case "wreck": prism(CAR_SHAPE.map(([u, w]) => [x + .5 + u * 1.0, y + .5 + w]), 1.5, 9, sd("#2a2624"), sd("#3a2e28"), a); prism([[.3, .36], [-.5, .37], [-.5, -.37], [.3, -.36]].map(([u, w]) => [x + .5 + u, y + .5 + w]), 9, 14, sd("#1a1614"), sd("#4a2e22"), a); return true;
    case "rack": line3([x + .1, cy, 0], [x + .1, cy, 24], sd("#8a8e92"), 1.2, a); line3([x + .9, cy, 0], [x + .9, cy, 24], sd("#8a8e92"), 1.2, a); line3([x + .1, cy, 24], [x + .9, cy, 24], sd("#8a8e92"), 1.2, a);
      for (let k = 0; k < 5; k++) boxW(x + .14 + k * .15, cy - .12, x + .24 + k * .15, cy + .12, 8, 23, sd(["#7a3a3a", "#3a5a7a", "#5a6a3a", "#8a7a5a", "#4a3a5a"][(k + x) % 5]), a); return true;
    case "washer": boxW(x + .1, y + .1, x + .9, y + .9, 0, 18, sd("#e6e8e4"), a); { const [sx, sy] = S(cx, y + .9, 9); ctx.globalAlpha = a; ctx.fillStyle = "#3a4a5a"; ctx.beginPath(); ctx.ellipse(sx, sy, 4 * zoom, 3 * zoom, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; } return true;
    case "hay": boxW(x + .1, y + .2, x + .9, y + .8, 0, 11, sd("#c8a860"), a); for (const u of [.35, .65]) line3([x + u, y + .8, 0], [x + u, y + .8, 11], sd("#8a6a30"), 1, a); return true;
  }
  return drawDecor2(o, dim, a);
}

// ---------- vehicles with liveries ----------
function drawVehicle(c){
  const i = ix(Math.floor(c.x), Math.floor(c.y));
  if (!explored[i] && !G.vis[i] && P.car !== c && RV.mode !== "upper") return;
  const dim = G.vis[i] || P.car === c || RV.mode === "upper" ? 1 : .55, a = 1, L = c.livery;
  const body = shade(c.col, dim * (c.cond < 30 ? .75 : 1));
  for (const [u, w] of [[.6, .44], [-.6, .44], [.6, -.44], [-.6, -.44]]){ const [x, y] = carPoint(c, u, w); topEl(x, y, .13, 2.5, "#111", a, .1); }
  prism(CAR_SHAPE.map(([u, w]) => carPoint(c, u, w)), 2.5, L === "bus" || L === "amb" || L === "fire" ? 12 : 10, body, shade(c.col, dim * 1.08), a);
  const roofCol = L === "police" ? "#eceee8" : L === "amb" ? "#eceee8" : shade(c.col, dim * .95);
  const glass = shade(c.broken ? "#1a1c20" : "#3a4c5e", dim);
  if (L === "bus" || L === "amb" || L === "fire"){
    prism([[.5, .4], [-.92, .41], [-.92, -.41], [.5, -.4]].map(([u, w]) => carPoint(c, u, w)), 12, 21, L === "bus" ? shade("#2a2a2a", dim) : glass, shade(L === "fire" ? "#c83a2a" : c.col, dim), a);
    if (L === "fire") for (const w of [-.15, .15]) line3([...carPoint(c, -.8, w), 21.5], [...carPoint(c, .4, w), 21.5], "#c8ccd0", 1.4, a);
  } else prism([[.32, .36], [-.5, .37], [-.58, .33], [-.58, -.33], [-.5, -.37], [.32, -.36], [.4, -.3], [.4, .3]].map(([u, w]) => carPoint(c, u, w)), 10, 17, glass, roofCol, a);
  if (L === "police" || L === "amb" || L === "fire"){
    const zt = L === "police" ? 17 : 21, flash = c.on && Math.floor(G.simT * 4) % 2;
    const [rx, ry] = carPoint(c, 0, -.18), [bx2, by2] = carPoint(c, 0, .18);
    topEl(rx, ry, .1, zt + 1.5, flash ? "#ff3a2a" : "#8a1a14", a); topEl(bx2, by2, .1, zt + 1.5, L === "police" ? (flash ? "#3a6aff" : "#1a2a6a") : (flash ? "#ff3a2a" : "#8a1a14"), a);
  }
  if (L === "amb") for (const w of [-.44, .44]) line3([...carPoint(c, -.95, w), 6], [...carPoint(c, .95, w), 6], "#c8302a", 2, a);
  if (L === "police") for (const w of [-.44, .44]) line3([...carPoint(c, -.3, w), 6], [...carPoint(c, .3, w), 6], "#eceee8", 3, a);
  const night = isNight();
  for (const w of [-.27, .27]){
    const [x, y] = carPoint(c, .96, w); topEl(x, y, .06, 7, c.on && night ? "#fff6c8" : shade("#d8d0a0", dim), a);
    const [bx, by] = carPoint(c, -.96, w); topEl(bx, by, .05, 7, c.on ? "#ff3020" : shade("#8a2a20", dim), a);
  }
}

// ---------- small helpers ----------
function hull(pts){
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts){ while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.slice().reverse()){ while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function drawHat(kind, col, hp, r){
  const [x, y] = hp; ctx.fillStyle = col;
  if (kind === "cap"){ ctx.beginPath(); ctx.ellipse(x, y - r * .45, r * 1.02, r * .62, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(x - r * 1.1, y - r * .5, r * 2.2, r * .22); }
  else if (kind === "helmet" || kind === "hard"){ ctx.beginPath(); ctx.ellipse(x, y - r * .35, r * 1.15, r * .9, 0, Math.PI, 0); ctx.fill(); if (kind === "hard"){ ctx.fillRect(x - r * 1.3, y - r * .4, r * 2.6, r * .2); } }
  else if (kind === "chef"){ ctx.fillRect(x - r * .8, y - r * 2.2, r * 1.6, r * 1.6); ctx.beginPath(); ctx.arc(x, y - r * 2.2, r * .9, 0, 7); ctx.fill(); }
  ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.ellipse(x - r * .3, y - r * .8, r * .35, r * .18, -.4, 0, 7); ctx.fill();
}

// ---------- the frame ----------
function render(){
  const now = performance.now(), fdt = Math.min(.1, (now - (lastRenderT || now)) / 1000); lastRenderT = now;
  FRAME_T0 = now;
  zoom = G.zoom; hw = CFG.TW / 2 * zoom; hh = CFG.TH / 2 * zoom;
  LIGHTS = [];
  const rp = realXY(P.x, P.y), upper = rp.lvl !== 0, base = rp.lvl < 0;
  RV = upper ? { mode: "upper", base, b: rp.pk.b, k: rp.lvl, E: Math.max(0, rp.lvl) * WALLH, pk: rp.pk, inPocket: false } : { mode: "ground", b: -1 };
  const tE = upper ? RV.E : 0;
  if (!CAM || Math.hypot(CAM.x - rp.x, CAM.y - rp.y) > 5 || CAM.E !== tE) CAM = { x: rp.x, y: rp.y, E: tE };
  else { const k = 1 - Math.exp(-fdt * 16); CAM.x += (rp.x - CAM.x) * k; CAM.y += (rp.y - CAM.y) * k; }
  camX = (CAM.x - CAM.y) * hw; camY = (CAM.x + CAM.y) * hh - 20 * zoom - CAM.E * zoom;
  if (G.shake){ camX += (Math.random() - .5) * G.shake; camY += (Math.random() - .5) * G.shake; }
  trackCamera();
  ctx.fillStyle = "#0d0f12"; ctx.fillRect(0, 0, CW, CH);
  const px = Math.floor(rp.x), py = Math.floor(rp.y);
  const span = Math.ceil(Math.max(CW / hw, CH / hh) * 0.75) + 3;
  const x0 = Math.max(0, px - span), x1 = Math.min(W - 1, px + span), y0 = Math.max(0, py - span), y1 = Math.min(PK_Y0 - 1, py + span);
  let myB = -1;
  if (upper) myB = RV.b;
  else { const [spx, spy] = sideTile(P.x, P.y); myB = inb(spx, spy) && tile[ix(spx, spy)] === T.FLOOR ? bldId[ix(spx, spy)] : -1; }
  const pdepth = rp.x + rp.y; PLAYER_B = myB;
  [PSX, PSY] = S(rp.x, rp.y, 18 + tE);
  const onScreen = (tx, ty) => { const [sx, sy] = S(tx + .5, ty + .5); return sx > -90 && sx < CW + 90 && sy > -140 && sy < CH + 200; };

  // ----- the world at street level -----
  if (!RV.base){
  drawGround(x0, x1, y0, y1, onScreen);
  drawWet(x0, x1, y0, y1);
  drawSunShadows(x0, x1, y0, y1); drawCloudShadows(); drawPrints(); drawEnvLow();
  // water glints
  ctx.strokeStyle = "rgba(200,225,235,.35)"; ctx.lineWidth = Math.max(1, zoom);
  ctx.beginPath();
  const ROWS = screenTileRows(x0, x1, y0, y1, MAXTOP * zoom + 40);
  if (zoom >= .72) for (const [ty, sx0, sx1] of ROWS) for (let tx = sx0; tx <= sx1; tx++){
    if (tile[ix(tx, ty)] !== T.WATER || !(G.vis[ix(tx, ty)] || upper)) continue;
    const h0 = hash(tx, ty), ph = (G.simT * .35 + h0 * 10) % 3; if (ph > 1) continue;
    const [sx, sy] = S(tx + h0, ty + .5, -5); const len = (6 + h0 * 8) * zoom * Math.sin(ph * Math.PI);
    ctx.moveTo(sx - len / 2, sy); ctx.lineTo(sx + len / 2, sy);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(214,180,70,.55)"; ctx.lineWidth = 2 * zoom; ctx.setLineDash([10 * zoom, 12 * zoom]);
  for (const [ax, ay, bx, by] of ROADS){
    if (Math.max(ax, bx) < x0 - 2 || Math.min(ax, bx) > x1 + 2 || Math.max(ay, by) < y0 - 2 || Math.min(ay, by) > y1 + 2) continue;
    const a = S(clamp(ax, x0 - 2, x1 + 2), clamp(ay, y0 - 2, y1 + 2)), b = S(clamp(bx, x0 - 2, x1 + 2), clamp(by, y0 - 2, y1 + 2));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  ctx.setLineDash([]);
  const realVis = (x, y) => upper ? Math.hypot(x - rp.x, y - rp.y) < 24 : G.vis[ix(x | 0, y | 0)];
  for (const b of G.blood){ if (b.x < x0 || b.x > x1 + 1 || b.y < y0 || b.y > y1 + 1) continue; const [sx, sy] = S(b.x, b.y); ctx.fillStyle = "rgba(100,12,8,.6)"; ctx.beginPath(); ctx.ellipse(sx, sy, b.r * zoom, b.r * .5 * zoom, b.a, 0, 7); ctx.fill(); }
  if (!upper) for (const [i, list] of floorItems){ if (!list.length || !G.vis[i]) continue; const tx = i % W, ty = (i / W) | 0; if (ty >= PK_Y0) continue; drawFloorStack(tx, ty, list); }
  for (const c of G.corpses){ if (c.y >= PK_Y0 || !realVis(c.x, c.y)) continue; if (c.fall !== undefined && c.fall < 1) continue; drawLying(c.x, c.y, { face: c.face, shirt: shade(c.col, .6), pants: c.pants, skin: "#5e6a52", pool: true }); }
  const list = [];
  for (const [ty, sx0, sx1] of ROWS) for (let tx = sx0; tx <= sx1; tx++){
    const i = ix(tx, ty), t = tile[i];
    if (t === T.GRASS || t === T.ROAD || t === T.WALK || t === T.LOT || t === T.DIRT || t === T.WATER || t === T.SAND || t === T.GRAVEL){ if (!objs.has(i)) continue; }
    if (t === T.VOID) continue;
    list.push({ d: tx + ty + 1, tx, ty, kind: "tile" });
  }
  for (const z of Z){
    if (!z.alive || z.x < x0 || z.x > x1 + 1 || z.y < y0 || z.y > y1 + 1) continue;
    if (upper){ if (bldId[ix(z.x | 0, z.y | 0)] === RV.b || !realVis(z.x, z.y)) continue; }
    else if (!G.vis[ix(z.x | 0, z.y | 0)]) continue;
    list.push({ d: z.x + z.y, kind: "z", z });
  }
  if (!upper) for (const a of AN){ if (a.gone || a.x < x0 - 1 || a.x > x1 + 1 || a.y < y0 - 1 || a.y > y1 + 1) continue; if (!a.fly && !G.vis[ix(a.x | 0, a.y | 0)]) continue; list.push({ d: a.x + a.y + (a.fly ? 3 : 0), kind: "a", a }); }
  for (const c of G.corpses) if (c.fall !== undefined && c.fall < 1 && c.y < PK_Y0 && realVis(c.x, c.y)) list.push({ d: c.x + c.y, kind: "fall", c });
  for (const c of V){ if (c.x < x0 - 2 || c.x > x1 + 2 || c.y < y0 - 2 || c.y > y1 + 2) continue; list.push({ d: c.x + c.y, kind: "v", c }); }
  if (P.alive && !upper) list.push({ d: P.x + P.y, kind: "p" });
  list.sort((a, b) => a.d - b.d);
  for (const e of list){
    if (e.kind === "z") drawZombie(e.z); else if (e.kind === "p") drawPlayer(); else if (e.kind === "v") drawVehicle(e.c); else if (e.kind === "a") drawAnimal(e.a);
    else if (e.kind === "fall") drawFalling(e.c); else drawTile(e.tx, e.ty, myB, pdepth);
  }
  drawRoofLayer(x0, x1, y0, y1, myB, pdepth, onScreen);
  drawPitchedRoofs(myB, pdepth);
  drawRoofProps(x0, x1, y0, y1, myB);
  drawFires();
  for (const [lx, ly, lr] of lightsInView()){ const [sx, sy] = S(lx, ly, 6); LIGHTS.push([sx, sy, lr, "255,150,60"]); }
  sunPatches(ROWS); drawMotes(); drawFlies(); windowSpill(); drawTracks(); extraLights(); drawInteriorLight(); drawEnvHigh();
  } else { ctx.fillStyle = "#07080a"; ctx.fillRect(0, 0, CW, CH); }

  // ----- an upper floor, drawn on top of the building it belongs to -----
  if (upper){
    const pk = RV.pk;
    camX += (pk.ox - pk.oy) * hw; camY += (pk.ox + pk.oy) * hh + RV.E * zoom; RV.inPocket = true;
    const qx0 = pk.x0 - 1, qx1 = pk.x1 + 1, qy0 = pk.y0 - 1, qy1 = pk.y1 + 1;
    paintGroundStatic(pk.x0, pk.x1, pk.y0, pk.y1);
    const dk = new Path2D();
    for (let ty = pk.y0; ty <= pk.y1; ty++) for (let tx = pk.x0; tx <= pk.x1; tx++) if (!G.vis[ix(tx, ty)]) dk.rect(tx, ty, 1, 1);
    isoT(0); ctx.fillStyle = "rgba(8,10,16,.55)"; ctx.fill(dk); resetT();
    for (const [i, l2] of floorItems){ if (!l2.length || !G.vis[i]) continue; const tx = i % W, ty = (i / W) | 0; if (tx < qx0 || tx > qx1 || ty < qy0 || ty > qy1) continue; drawFloorStack(tx, ty, l2); }
    for (const c of G.corpses){ if (c.x < qx0 || c.x > qx1 + 1 || c.y < qy0 || c.y > qy1 + 1 || !G.vis[ix(c.x | 0, c.y | 0)]) continue; if (c.fall !== undefined && c.fall < 1) continue; drawLying(c.x, c.y, { face: c.face, shirt: shade(c.col, .6), pants: c.pants, skin: "#5e6a52", pool: true }); }
    const l2 = [], pd2 = P.x + P.y;
    [PSX, PSY] = S(P.x, P.y, 18);
    for (let ty = qy0; ty <= qy1; ty++) for (let tx = qx0; tx <= qx1; tx++){ const t = tile[ix(tx, ty)]; if (t === T.VOID) continue; if (t === T.FLOOR && !objs.has(ix(tx, ty))) continue; l2.push({ d: tx + ty + 1, tx, ty, kind: "tile" }); }
    for (const z of Z){ if (!z.alive || z.x < qx0 || z.x > qx1 + 1 || z.y < qy0 || z.y > qy1 + 1 || !G.vis[ix(z.x | 0, z.y | 0)]) continue; l2.push({ d: z.x + z.y, kind: "z", z }); }
    for (const c of G.corpses) if (c.fall !== undefined && c.fall < 1 && c.x >= qx0 && c.x <= qx1 + 1 && c.y >= qy0 && c.y <= qy1 + 1) l2.push({ d: c.x + c.y, kind: "fall", c });
    if (P.alive) l2.push({ d: pd2, kind: "p" });
    l2.sort((a, b) => a.d - b.d);
    for (const e of l2){ if (e.kind === "z") drawZombie(e.z); else if (e.kind === "p") drawPlayer(); else if (e.kind === "fall") drawFalling(e.c); else drawTile(e.tx, e.ty, RV.b, pd2); }
  }
  drawBuildGhost(); drawFx(); drawForageMarks(); drawAimFx();
  if (P.torch){ LIGHTS.push([...S(P.x, P.y, 20), 4.2, "255,150,70"]); }
  if (P.swing && P.swing.kind === "swing" && P.weapon){
    const w = ITEMS[P.weapon.id], p = P.swing.t / P.swing.dur;
    if (p > .3 && p < .7){ ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2; ctx.beginPath();
      for (let k = -6; k <= 6; k++){ const a = P.face + k * 0.13, [sx, sy] = S(P.x + Math.cos(a) * w.range, P.y + Math.sin(a) * w.range, 16); k === -6 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); }
      ctx.stroke(); }
  }
  const indoors = upper || myB >= 0;
  if (G.rain && !indoors){
    ctx.strokeStyle = "rgba(170,190,220,.35)"; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 0; k < 260; k++){ const x = (k * 97 + G.simT * 340 * (1 + k % 3)) % CW, y = (k * 57 + G.simT * 900) % CH; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 14); }
    ctx.stroke();
  } else if (G.rain){ ctx.fillStyle = "rgba(20,30,40,.06)"; ctx.fillRect(0, 0, CW, CH); }
  if (G.fog && !indoors){ const g = ctx.createRadialGradient(CW / 2, CH / 2, 120 * zoom, CW / 2, CH / 2, Math.max(CW, CH) * .6); g.addColorStop(0, "rgba(190,195,200,0)"); g.addColorStop(1, `rgba(190,195,200,${.55 * G.fog})`); ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH); }

  drawWeatherFx();
  // ----- light and dark -----
  const dk = darkness() + (G.rain ? 0.12 : 0);
  const [psx, psy] = S(P.x, P.y, 14);
  if (dk > 0.02 || P.sleeping){
    lctx.globalCompositeOperation = "source-over"; lctx.clearRect(0, 0, CW, CH);
    lctx.fillStyle = `rgba(4,6,14,${P.sleeping ? 0.9 : Math.min(0.93, dk)})`; lctx.fillRect(0, 0, CW, CH);
    lctx.globalCompositeOperation = "destination-out";
    let g = lctx.createRadialGradient(psx, psy, 0, psx, psy, 2.2 * hw);
    g.addColorStop(0, "rgba(0,0,0,.75)"); g.addColorStop(1, "rgba(0,0,0,0)");
    lctx.fillStyle = g; lctx.beginPath(); lctx.ellipse(psx, psy, 2.2 * hw, 2.2 * hh, 0, 0, 7); lctx.fill();
    if (LIGHTS.length > 48){ const cx = CW / 2, cy = CH / 2; LIGHTS.sort((a, b) => ((a[0] - cx) ** 2 + (a[1] - cy) ** 2) - ((b[0] - cx) ** 2 + (b[1] - cy) ** 2)); LIGHTS.length = 48; }
    const cutS = lightSprite("cut"); for (const [sx, sy, lr] of LIGHTS){ if (sx < -300 || sx > CW + 300 || sy < -300 || sy > CH + 300) continue; lctx.globalAlpha = .95 + Math.random() * .05; lctx.drawImage(cutS, sx - lr * hw, sy - lr * hh * 1.3, lr * hw * 2, lr * hh * 2.6); } lctx.globalAlpha = 1;
    if ((P.flash || (P.car && P.car.on)) && !P.sleeping){
      const L = CFG.flashRange, [ex, ey] = S(P.x + Math.cos(P.face) * L * .6, P.y + Math.sin(P.face) * L * .6, 0);
      g = lctx.createLinearGradient(psx, psy, ex, ey); g.addColorStop(0, "rgba(0,0,0,.95)"); g.addColorStop(1, "rgba(0,0,0,0)");
      lctx.fillStyle = g; lctx.beginPath(); lctx.moveTo(psx, psy);
      for (let k = -10; k <= 10; k++){ const a = P.face + k * 0.045, [sx, sy] = S(P.x + Math.cos(a) * L, P.y + Math.sin(a) * L, 0); lctx.lineTo(sx, sy); }
      lctx.closePath(); lctx.fill();
    }
    ctx.drawImage(lightCv, 0, 0, CW, CH);
    // the warm colour of the lights themselves
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = .22 * Math.min(1, dk * 1.4); for (const [sx, sy, lr, col] of LIGHTS){ if (sx < -300 || sx > CW + 300 || sy < -300 || sy > CH + 300) continue; ctx.drawImage(lightSprite(col), sx - lr * hw * .8, sy - lr * hh, lr * hw * 1.6, lr * hh * 2); } ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  // time of day colour: warm mornings, golden evenings, blue nights
  const hr = (G.min / 60) % 24;
  let grade = null;
  if (hr >= 5 && hr < 8) grade = `rgba(255,170,110,${.10 * (1 - Math.abs(hr - 6.5) / 1.5)})`;
  else if (hr >= 17 && hr < 20.5) grade = `rgba(255,120,60,${.14 * (1 - Math.abs(hr - 19) / 1.6)})`;
  else if (hr >= 20.5 || hr < 5) grade = "rgba(60,80,150,.10)";
  LT.rg = grade; if (false){ ctx.globalCompositeOperation = "soft-light"; ctx.fillStyle = grade.replace(/,([\d.]+)\)$/, (m, v) => "," + Math.min(1, +v * 2.4) + ")"); ctx.fillRect(0, 0, CW, CH); ctx.globalCompositeOperation = "source-over"; }
  skyGrade(); drawFireflies(); drawAdapt(); gradeFrame(); perfTick();
  // progress bar and speech
  const [hx, hy] = S(P.x, P.y, 52);
  if (P.action && !P.action.quiet){
    const p = Math.min(1, P.action.t / P.action.dur);
    ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(hx - 40, hy - 10, 80, 9);
    ctx.fillStyle = "#d6f2c4"; ctx.fillRect(hx - 39, hy - 9, 78 * p, 7);
    ctx.font = "18px VT323, monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#d6f2c4"; ctx.fillText(P.action.name, hx, hy - 14);
  }
  if (P.speech){
    ctx.font = "20px VT323, monospace"; ctx.textAlign = "center";
    ctx.fillStyle = "#000"; ctx.fillText(P.speech.msg, hx + 2, hy - (P.action && !P.action.quiet ? 34 : 12) + 2);
    ctx.fillStyle = "#fff"; ctx.fillText(P.speech.msg, hx, hy - (P.action && !P.action.quiet ? 34 : 12));
  }
  if (P.sleeping){ ctx.font = "34px VT323, monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#d6f2c4"; ctx.fillText("Sleeping... (move to wake up)", CW / 2, CH / 2 - 120); }
  idleBake();
}
