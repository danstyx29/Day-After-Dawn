// ============================================================
// Part 8: realistic world art. Procedural textures, thin walls,
// framed doors and windows, textured roofs, shadows, trees.
// ============================================================
const PPT = 64; // texture pixels per tile
const TEX = {}, SIDE_PAT = [], ROOF_PAT = [], SIDE_CAN = {}, SHADED = new Map();
const ROOMWALL = { living: "#cfc4ae", bedroom: "#c3b9c6", kitchen: "#dad3bd", bathroom: "#c8d7da", grocery: "#d6d4cc", pharmacy: "#dde0dc", hardware: "#c8c2b4" };
const ROOFC = ["#5e4a44", "#4e5664", "#5c5644", "#46524a"];

// ---------- texture painting helpers ----------
function mkCanvas(w, h){ const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function speckle(g, w, h, n, cols, alpha, size = 1){
  for (let i = 0; i < n; i++){ g.globalAlpha = alpha * (0.5 + Math.random() * 0.5); g.fillStyle = cols[(Math.random() * cols.length) | 0];
    g.fillRect(Math.random() * w, Math.random() * h, size, size); }
  g.globalAlpha = 1;
}
function blobs(g, w, h, n, cols, rmin, rmax, alpha){
  for (let i = 0; i < n; i++){
    const x = Math.random() * w, y = Math.random() * h, r = rmin + Math.random() * (rmax - rmin), c = cols[(Math.random() * cols.length) | 0];
    for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]){
      if (x + ox + r < 0 || x + ox - r > w || y + oy + r < 0 || y + oy - r > h) continue;
      const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.globalAlpha = alpha; g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    }
  }
  g.globalAlpha = 1;
}
function pattern(canvas, sx, sy){
  const p = ctx.createPattern(canvas, "repeat");
  p.setTransform(new DOMMatrix([sx, 0, 0, sy, 0, 0]));
  return p;
}
function tint(hex, f){ return shade(hex, f); }

function initTextures(){
  // grass
  { const s = 256, [c, g] = mkCanvas(s, s);
    g.fillStyle = "#4a6634"; g.fillRect(0, 0, s, s);
    blobs(g, s, s, 26, ["#3a5428", "#5a7a3e", "#6a7d40", "#3f5d2e"], 14, 40, .35);
    const greens = ["#3c5a2a", "#5d7c3f", "#6b8a46", "#46682f", "#7a8d4a", "#344d24"];
    for (let i = 0; i < 9000; i++){ const x = Math.random() * s, y = Math.random() * s;
      g.strokeStyle = greens[(Math.random() * greens.length) | 0]; g.globalAlpha = .55 + Math.random() * .45; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 3, y - 1.5 - Math.random() * 3.5); g.stroke(); }
    speckle(g, s, s, 260, ["#9a9a5a", "#b8a860", "#8a6a4a"], .5, 1.4);
    TEX.grass = pattern(c, 1 / PPT, 1 / PPT); }
  // dirt
  { const s = 128, [c, g] = mkCanvas(s, s);
    g.fillStyle = "#6a583e"; g.fillRect(0, 0, s, s);
    blobs(g, s, s, 14, ["#5a4a32", "#7a684a"], 8, 24, .4);
    speckle(g, s, s, 2500, ["#4e4030", "#857256", "#93806a"], .6, 1.2);
    TEX.dirt = pattern(c, 1 / PPT, 1 / PPT); }
  // asphalt
  for (const [key, base, n] of [["road", "#383b3e", 26000], ["lot", "#45484b", 20000]]){
    const s = 256, [c, g] = mkCanvas(s, s);
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    blobs(g, s, s, 18, ["#2c2e30", "#4a4d50"], 10, 34, .35);
    speckle(g, s, s, n, ["#2a2c2e", "#55585b", "#4a4c4f", "#606366"], .55, 1);
    g.strokeStyle = "#24262a"; g.lineWidth = 1;
    for (let k = 0; k < 5; k++){ let x = Math.random() * s, y = Math.random() * s; g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 14; j++){ x += (Math.random() - .5) * 14; y += (Math.random() - .3) * 10; g.lineTo(x, y); } g.globalAlpha = .7; g.stroke(); g.globalAlpha = 1; }
    blobs(g, s, s, 3, ["#1e2022"], 6, 14, .4);
    TEX[key] = pattern(c, 1 / PPT, 1 / PPT); }
  // sidewalk slabs
  { const s = 128, [c, g] = mkCanvas(s, s);
    g.fillStyle = "#8f8d86"; g.fillRect(0, 0, s, s);
    for (const [x, y] of [[0, 0], [64, 0], [0, 64], [64, 64]]){ g.fillStyle = `rgba(${Math.random() < .5 ? "255,255,255" : "0,0,0"},${Math.random() * .06})`; g.fillRect(x, y, 64, 64); }
    speckle(g, s, s, 5000, ["#77756f", "#a3a199", "#6a6862"], .5, 1);
    g.fillStyle = "#6d6b65"; for (const k of [0, 64]){ g.fillRect(k, 0, 2, s); g.fillRect(0, k, s, 2); }
    g.fillStyle = "rgba(255,255,255,.12)"; for (const k of [2, 66]){ g.fillRect(k, 0, 1, s); g.fillRect(0, k, s, 1); }
    TEX.walk = pattern(c, 1 / PPT, 1 / PPT); }
  // wood floor
  { const s = 128, [c, g] = mkCanvas(s, s), woods = ["#8a6440", "#7d5a39", "#94704a", "#83603c", "#9a7650"];
    for (let row = 0; row < 8; row++){
      let x = -Math.random() * 64;
      while (x < s){ const len = 48 + Math.random() * 80; g.fillStyle = woods[(Math.random() * woods.length) | 0];
        g.fillRect(x, row * 16, len, 16);
        g.strokeStyle = "rgba(50,30,15,.25)"; g.lineWidth = 1;
        for (let k = 0; k < 5; k++){ const yy = row * 16 + 2 + Math.random() * 12, ph = Math.random() * 6; g.beginPath();
          for (let xx = Math.max(0, x); xx < Math.min(s, x + len); xx += 4) g.lineTo(xx, yy + Math.sin(xx * .08 + ph) * 1.2); g.stroke(); }
        g.fillStyle = "#3e2a18"; g.fillRect(x, row * 16, 1.5, 16);
        x += len; }
      g.fillStyle = "#3a2716"; g.fillRect(0, row * 16 + 15, s, 1);
      g.fillStyle = "rgba(255,240,210,.08)"; g.fillRect(0, row * 16, s, 2);
    }
    TEX.floor_living = pattern(c, 1 / PPT, 1 / PPT); }
  // kitchen lino checker
  { const s = 64, [c, g] = mkCanvas(s, s);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++){ g.fillStyle = (i + j) % 2 ? "#a49c8b" : "#d8d1bf"; g.fillRect(i * 32, j * 32, 32, 32); }
    speckle(g, s, s, 700, ["#8a8474", "#ece6d6"], .35, 1);
    g.fillStyle = "rgba(60,55,45,.5)"; g.fillRect(0, 0, s, 1); g.fillRect(0, 32, s, 1); g.fillRect(0, 0, 1, s); g.fillRect(32, 0, 1, s);
    TEX.floor_kitchen = pattern(c, 1 / PPT, 1 / PPT); }
  // bathroom small tiles
  { const s = 64, [c, g] = mkCanvas(s, s);
    g.fillStyle = "#93a6ac"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){ g.fillStyle = tint("#c8d8de", .94 + Math.random() * .1); g.fillRect(i * 16 + 1, j * 16 + 1, 14.5, 14.5);
      g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(i * 16 + 2, j * 16 + 2, 6, 1.5); }
    TEX.floor_bathroom = pattern(c, 1 / PPT, 1 / PPT); }
  // carpet
  { const s = 128, [c, g] = mkCanvas(s, s);
    g.fillStyle = "#6c6080"; g.fillRect(0, 0, s, s);
    blobs(g, s, s, 10, ["#5e5272", "#7a6e8e"], 10, 30, .3);
    speckle(g, s, s, 16000, ["#5a4e6e", "#7d7192", "#665a7a", "#857a98"], .7, 1);
    TEX.floor_bedroom = pattern(c, 1 / PPT, 1 / PPT); }
  // store vinyl / concrete
  for (const [key, a, b2] of [["floor_grocery", "#cbc9c0", "#b4b2a9"], ["floor_pharmacy", "#d8dad6", "#c5c8c4"]]){
    const s = 128, [c, g] = mkCanvas(s, s);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++){ g.fillStyle = (i + j) % 2 ? b2 : a; g.fillRect(i * 64, j * 64, 64, 64); }
    speckle(g, s, s, 3000, ["#8a8a84", "#e8e8e2", "#9a9a94"], .4, 1.2);
    g.fillStyle = "rgba(0,0,0,.18)"; for (const k of [0, 64]){ g.fillRect(k, 0, 1, s); g.fillRect(0, k, s, 1); }
    TEX[key] = pattern(c, 1 / PPT, 1 / PPT); }
  { const s = 128, [c, g] = mkCanvas(s, s);
    g.fillStyle = "#8a867d"; g.fillRect(0, 0, s, s); blobs(g, s, s, 12, ["#7a766d", "#9a968d"], 10, 30, .4);
    speckle(g, s, s, 6000, ["#6e6a62", "#a29e95"], .5, 1); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, 0, s, 1); g.fillRect(0, 0, 1, s);
    TEX.floor_hardware = pattern(c, 1 / PPT, 1 / PPT); TEX.floor = TEX.floor_hardware; }

  // siding (wall face texture): 1 tile wide by 16 height units
  SIDING.forEach((col, k) => {
    const [c, g] = mkCanvas(64, 64);
    if (col === "#a3574a"){ // brick
      g.fillStyle = "#b5a593"; g.fillRect(0, 0, 64, 64);
      for (let r = 0; r < 8; r++) for (let q = -1; q < 4; q++){ const x = q * 16 + (r % 2 ? 8 : 0);
        g.fillStyle = tint(col, .85 + Math.random() * .25); g.fillRect(x + 1, r * 8 + 1, 14, 6.5); }
    } else {
      for (let r = 0; r < 4; r++){ const gr = g.createLinearGradient(0, r * 16, 0, r * 16 + 16);
        gr.addColorStop(0, tint(col, 1.08)); gr.addColorStop(1, tint(col, .9)); g.fillStyle = gr; g.fillRect(0, r * 16, 64, 16);
        g.fillStyle = tint(col, .62); g.fillRect(0, r * 16 + 14.5, 64, 1.5); }
      speckle(g, 64, 64, 300, [tint(col, .8), tint(col, 1.15)], .25, 1);
    }
    SIDE_PAT[k] = pattern(c, 1 / 64, 16 / 64); SIDE_CAN[k] = c;
  });
  { const [c, g] = mkCanvas(64, 64); // concrete block for stores
    g.fillStyle = "#8f8d86"; g.fillRect(0, 0, 64, 64);
    for (let r = 0; r < 4; r++) for (let q = -1; q < 3; q++){ g.fillStyle = tint("#b9b7af", .92 + Math.random() * .12); g.fillRect(q * 32 + (r % 2 ? 16 : 0) + 1, r * 16 + 1, 30, 14); }
    speckle(g, 64, 64, 400, ["#7a7870", "#cfcdc5"], .3, 1);
    SIDE_PAT.block = pattern(c, 1 / 64, 16 / 64); SIDE_CAN.block = c; }
  // shingle roofs
  ROOFC.forEach((col, k) => {
    const [c, g] = mkCanvas(64, 64);
    for (let r = 0; r < 8; r++){
      for (let q = -1; q < 5; q++){ const x = q * 16 + (r % 2 ? 8 : 0);
        g.fillStyle = tint(col, .82 + Math.random() * .3); g.fillRect(x, r * 8, 16, 8);
        g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(x, r * 8, 1, 8); }
      g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(0, r * 8 + 7, 64, 1);
    }
    speckle(g, 64, 64, 500, ["#000", "#fff"], .08, 1);
    g.fillStyle = "rgba(6,8,12,.3)"; g.fillRect(0, 0, 64, 64);
    ROOF_PAT[k] = pattern(c, 1 / PPT, 1 / PPT);
  });
  { const [c, g] = mkCanvas(128, 128); g.fillStyle = "#7d7f7b"; g.fillRect(0, 0, 128, 128);
    speckle(g, 128, 128, 9000, ["#5e605c", "#9a9c98", "#6e706c", "#a8a8a2"], .7, 1.4);
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, 0, 128, 1.5); g.fillRect(0, 0, 1.5, 128);
    g.fillStyle = "rgba(6,8,12,.3)"; g.fillRect(0, 0, 128, 128);
    ROOF_PAT.flat = pattern(c, 1 / PPT, 1 / PPT); }
}

// ---------- transforms ----------
function isoT(z){ ctx.setTransform(DPR * hw, DPR * hh, -DPR * hw, DPR * hh, DPR * (CW / 2 - camX), DPR * (CH / 2 - camY - z * zoom)); }
function faceTS(y){ ctx.setTransform(DPR * hw, DPR * hh, 0, -DPR * zoom, DPR * (-y * hw + CW / 2 - camX), DPR * (y * hh + CH / 2 - camY)); }
function faceTE(x){ ctx.setTransform(-DPR * hw, DPR * hh, 0, -DPR * zoom, DPR * (x * hw + CW / 2 - camX), DPR * (x * hh + CH / 2 - camY)); }
function resetT(){ ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }

// ---------- ground ----------
const wallLike = (x, y) => { if (!inb(x, y)) return false; const t = tile[ix(x, y)]; return t === T.WALL || t === T.DOOR || t === T.WIN; };
function quadSrc(tx, ty, qx, qy){
  const sx = qx ? 1 : -1, sy = qy ? 1 : -1;
  for (const [x, y] of [[tx + sx, ty + sy], [tx + sx, ty], [tx, ty + sy]]) if (inb(x, y) && !wallLike(x, y)) return ix(x, y);
  for (const [x, y] of [[tx, ty - sy], [tx - sx, ty], [tx - sx, ty - sy]]) if (inb(x, y) && !wallLike(x, y)) return ix(x, y);
  return ix(tx, ty);
}
function groundKey(i){
  switch (tile[i]){
    case T.GRASS: case T.TREE: return "grass";
    case T.VOID: return "void";
    case T.ROAD: return "road"; case T.WALK: return "walk"; case T.LOT: return "lot"; case T.DIRT: return "dirt";
    case T.FLOOR: { const r = rooms[roomId[i]]; return r ? "floor_" + r.type : "floor"; }
    default: return "floor";
  }
}
const A_ = 0.5 - WTC, B_ = 0.5 + WTC; // wall slab inner and outer edge within its tile

// static textured ground for a range of tiles (used to bake chunks)
function paintGroundStatic(x0, x1, y0, y1){
  const paths = new Map(), sh = new Path2D(), ao = new Path2D();
  const add = (k, x, y, w, h) => { let p = paths.get(k); if (!p){ p = new Path2D(); paths.set(k, p); } p.rect(x, y, w, h); };
  const trees = [];
  for (let ty = Math.max(0, y0); ty <= Math.min(H - 1, y1); ty++) for (let tx = Math.max(0, x0); tx <= Math.min(W - 1, x1); tx++){
    const i = ix(tx, ty), t = tile[i];
    if (t === T.WALL || t === T.DOOR || t === T.WIN){
      for (let q = 0; q < 4; q++){ const qx = q & 1, qy = q >> 1; add(groundKey(quadSrc(tx, ty, qx, qy)), tx + qx * .5, ty + qy * .5, .5, .5); }
      ao.rect(tx + A_ - .1, ty + A_ - .1, (B_ - A_) + .2, (B_ - A_) + .2);
      if (wallLike(tx - 1, ty)) ao.rect(tx, ty + A_ - .1, A_, (B_ - A_) + .2);
      if (wallLike(tx + 1, ty)) ao.rect(tx + B_, ty + A_ - .1, 1 - B_, (B_ - A_) + .2);
      if (wallLike(tx, ty - 1)) ao.rect(tx + A_ - .1, ty, (B_ - A_) + .2, A_);
      if (wallLike(tx, ty + 1)) ao.rect(tx + A_ - .1, ty + B_, (B_ - A_) + .2, 1 - B_);
    } else add(groundKey(i), tx, ty, 1, 1);
    const o = objs.get(i);
    if (o && OBJ[o.type].block){ const q = objRect(o); sh.rect(q[0] - .03, q[1] - .03, q[2] - q[0] + .08, q[3] - q[1] + .08); }
    if (t === T.TREE) trees.push([tx, ty]);
  }
  isoT(0);
  for (const [k, p] of paths){ ctx.fillStyle = TEX[k] || TEX.floor; ctx.fill(p); }
  ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fill(ao);
  ctx.fillStyle = "rgba(0,0,0,.24)"; ctx.fill(sh);
  ctx.fillStyle = "rgba(0,0,0,.22)";
  for (const [tx, ty] of trees){ ctx.beginPath(); ctx.ellipse(tx + .7, ty + .7, .75, .75, 0, 0, 7); ctx.fill(); }
  resetT();
}
// the ground plane is baked into screen-aligned square blocks (cheap to stamp, no overlap)
const GB = 256;
let GCH = new Map(), gZoom = 0, gDPR = 0, prefetchQ = [];
function blockCanvas(bx, by){
  const key = bx + "," + by;
  let c = GCH.get(key); if (c) return c;
  const d = Math.min(DPR, 1.5);
  c = document.createElement("canvas"); c.width = Math.ceil(GB * d); c.height = Math.ceil(GB * d);
  const sv = [ctx, camX, camY, CW, CH, DPR];
  ctx = c.getContext("2d"); CW = 0; CH = 0; DPR = d; camX = bx * GB; camY = by * GB;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  ctx.fillStyle = "#0d0f12"; ctx.fillRect(0, 0, GB, GB);
  try {
    let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    for (const [px, py] of [[0, 0], [GB, 0], [0, GB], [GB, GB]]){ const [wx, wy] = toWorld(px, py); mnx = Math.min(mnx, wx); mxx = Math.max(mxx, wx); mny = Math.min(mny, wy); mxy = Math.max(mxy, wy); }
    paintGroundStatic(Math.floor(mnx) - 1, Math.ceil(mxx) + 1, Math.floor(mny) - 1, Math.ceil(mxy) + 1);
  } finally { [ctx, camX, camY, CW, CH, DPR] = sv; }
  GCH.set(key, c);
  if (GCH.size > GCAP) GCH.delete(GCH.keys().next().value);
  return c;
}
function invalidateGround(x, y){
  for (const [wx, wy] of [[x - 1, y - 1], [x + 2, y - 1], [x - 1, y + 2], [x + 2, y + 2], [x + .5, y + .5]]){
    const px = (wx - wy) * hw, py = (wx + wy) * hh;
    for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) GCH.delete((Math.floor(px / GB) + dx) + "," + (Math.floor(py / GB) + dy));
  }
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
  // live part: what you can't currently see is darkened
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

// ---------- slabs (wall pieces) ----------
// mat: {siding: building} or {plaster: colour}
function wallMat(src, b){
  const j = src;
  if (tile[j] === T.FLOOR && bldId[j] === b){ const r = rooms[roomId[j]]; return { plaster: ROOMWALL[r && r.type] || "#d0c8b8" }; }
  return { siding: b };
}
function shadedSide(key, f){
  const k = key + "|" + f.toFixed(2);
  let p = SHADED.get(k); if (p) return p;
  const src = SIDE_CAN[key], [c, g] = mkCanvas(src.width, src.height);
  g.drawImage(src, 0, 0); g.fillStyle = `rgba(6,8,12,${1 - f})`; g.fillRect(0, 0, c.width, c.height);
  p = pattern(c, 1 / 64, 16 / 64); SHADED.set(k, p); return p;
}
function paintFace(isS, plane, u0, u1, z0, z1, mat, dim, a, shadeF){
  if (z1 - z0 <= 0.01 || u1 - u0 <= 0.001) return;
  ctx.globalAlpha = a;
  isS ? faceTS(plane) : faceTE(plane);
  const f = (1 - shadeF) * dim;
  if (mat.plaster){
    ctx.fillStyle = shade(mat.plaster, f); ctx.fillRect(u0, z0, u1 - u0, z1 - z0);
    if (z0 < 2 && z1 > 4){ ctx.fillStyle = shade("#5e4a36", f); ctx.fillRect(u0, 0, u1 - u0, 2.6); }
  } else {
    const b = buildings[mat.siding];
    ctx.fillStyle = shadedSide(b && b.kind !== "house" ? "block" : mat.siding % SIDING.length, f);
    ctx.fillRect(u0, z0, u1 - u0, z1 - z0);
    if (z0 < 2 && z1 > 4){ ctx.fillStyle = shade("#77746c", f); ctx.fillRect(u0, 0, u1 - u0, 3); }
  }
  ctx.globalAlpha = 1;
}
function slab(tx, ty, u0, v0, u1, v1, z0, z1, matS, matE, top, dim, a, showS = true, showE = true){
  if (showS) paintFace(true, ty + v1, tx + u0, tx + u1, z0, z1, matS, dim, a, .26);
  if (showE) paintFace(false, tx + u1, ty + v0, ty + v1, z0, z1, matE, dim, a, .1);
  ctx.globalAlpha = a; isoT(z1); ctx.fillStyle = shade(top, dim); ctx.fillRect(tx + u0, ty + v0, u1 - u0, v1 - v0); resetT(); ctx.globalAlpha = 1;
}
function trimBox(x0, y0, x1, y1, z0, z1, col, dim, a){ boxW(x0, y0, x1, y1, z0, z1, shade(col, dim), a); }

// the slab pieces that make up one wall tile (joined to neighbouring walls)
function wallPieces(tx, ty){
  const n = wallLike(tx, ty - 1), s = wallLike(tx, ty + 1), w = wallLike(tx - 1, ty), e = wallLike(tx + 1, ty);
  const out = [];
  if ((w || e) && !(n || s)) out.push([w ? 0 : A_, A_, e ? 1 : B_, B_]);
  else if ((n || s) && !(w || e)) out.push([A_, n ? 0 : A_, B_, s ? 1 : B_]);
  else {
    if (n) out.push([A_, 0, B_, A_]); if (w) out.push([0, A_, A_, B_]);
    out.push([A_, A_, B_, B_]);
    if (e) out.push([B_, A_, 1, B_]); if (s) out.push([A_, B_, B_, 1]);
  }
  return out.map(([u0, v0, u1, v1]) => ({ u0, v0, u1, v1,
    showS: !((v1 === 1 && s) || v1 === A_ || (v1 === B_ && u0 === A_ && u1 === B_ && s)),
    showE: !((u1 === 1 && e) || u1 === A_ || (u1 === B_ && v0 === A_ && v1 === B_ && e)) }));
}

// roofs live on their own cached layer at wall-top height
let RCH = new Map();
const roofCv = document.createElement("canvas"), rctx = roofCv.getContext("2d");
function roofPat(b){ return buildings[b].kind === "house" ? ROOF_PAT[b % ROOFC.length] : ROOF_PAT.flat; }
function roofBlock(bx, by){
  const key = bx + "," + by;
  let e = RCH.get(key); if (e) return e;
  const d = Math.min(DPR, 1.5), c = document.createElement("canvas"); c.width = Math.ceil(GB * d); c.height = Math.ceil(GB * d);
  const sv = [ctx, camX, camY, CW, CH, DPR];
  ctx = c.getContext("2d"); CW = 0; CH = 0; DPR = d; camX = bx * GB; camY = by * GB;
  let has = false;
  try {
    let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    for (const [px, py] of [[0, 0], [GB, 0], [0, GB], [GB, GB]]){ const [wx, wy] = toWorld(px, py + CFG.WALLH * zoom); mnx = Math.min(mnx, wx); mxx = Math.max(mxx, wx); mny = Math.min(mny, wy); mxy = Math.max(mxy, wy); }
    const paths = new Map();
    const add = (b, x, y, w, h) => { const k = roofKey(b); let p = paths.get(k); if (!p){ p = new Path2D(); paths.set(k, p); } p.rect(x, y, w, h); has = true; };
    for (let ty = Math.max(0, Math.floor(mny) - 1); ty <= Math.min(H - 1, Math.ceil(mxy) + 1); ty++)
      for (let tx = Math.max(0, Math.floor(mnx) - 1); tx <= Math.min(W - 1, Math.ceil(mxx) + 1); tx++){
        const i = ix(tx, ty), b = bldId[i]; if (b < 0) continue;
        const t = tile[i];
        if (t === T.FLOOR || !perim[i]) add(b, tx, ty, 1, 1);
        else for (let q = 0; q < 4; q++){ const qx = q & 1, qy = q >> 1, src = quadSrc(tx, ty, qx, qy);
          if (tile[src] === T.FLOOR && bldId[src] === b) add(b, tx + qx * .5, ty + qy * .5, .5, .5); }
      }
    ctx.setTransform(d * hw, d * hh, -d * hw, d * hh, -d * camX, -d * (camY + CFG.WALLH * zoom));
    for (const [k, p] of paths){ ctx.fillStyle = ROOF_PAT[k]; ctx.fill(p); }
  } finally { [ctx, camX, camY, CW, CH, DPR] = sv; }
  e = { c, has }; RCH.set(key, e);
  if (RCH.size > 160) RCH.delete(RCH.keys().next().value);
  return e;
}
function roofQuads(){}   // roofs are drawn by drawRoofLayer
function roofTile(){}
function drawRoofLayer(x0, x1, y0, y1, myB, pdepth, onScreen){
  if (roofCv.width !== cv.width || roofCv.height !== cv.height){ roofCv.width = cv.width; roofCv.height = cv.height; }
  rctx.setTransform(1, 0, 0, 1, 0, 0); rctx.clearRect(0, 0, roofCv.width, roofCv.height);
  rctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const left = camX - CW / 2, top = camY - CH / 2;
  const bx0 = Math.floor(left / GB), bx1 = Math.floor((left + CW) / GB), by0 = Math.floor(top / GB), by1 = Math.floor((top + CH) / GB);
  let any = false;
  for (let by = by0; by <= by1; by++) for (let bx = bx0; bx <= bx1; bx++){
    if (drawRoofBlock(bx, by, left, top)) any = true;
  }
  if (!any) return;
  // cut away your own building and rooms you can see into; fade roofs blocking your view
  const holes = new Path2D(), fade = new Path2D();
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++){
    const i = ix(tx, ty), b = bldId[i]; if (b < 0 || !onScreen(tx, ty)) continue;
    if (b === myB){ holes.rect(tx - .02, ty - .02, 1.04, 1.04); continue; }
    if (tile[i] === T.FLOOR && G.vis[i]){ holes.rect(tx, ty, 1, 1); continue; }
    if (perim[i] && tile[i] !== T.FLOOR) for (let q = 0; q < 4; q++){ const qx = q & 1, qy = q >> 1, src = quadSrc(tx, ty, qx, qy);
      if (G.vis[src] && tile[src] === T.FLOOR) holes.rect(tx + qx * .5, ty + qy * .5, .5, .5); }
    if (tileAlpha(tx, ty, myB, pdepth, true) < 1) fade.rect(tx, ty, 1, 1);
  }
  rctx.setTransform(DPR * hw, DPR * hh, -DPR * hw, DPR * hh, DPR * (CW / 2 - camX), DPR * (CH / 2 - camY - CFG.WALLH * zoom));
  rctx.globalCompositeOperation = "destination-out";
  rctx.fillStyle = "#000"; rctx.fill(holes);
  rctx.globalAlpha = 0.72; rctx.fill(fade); rctx.globalAlpha = 1;
  rctx.globalCompositeOperation = "source-over";
  ctx.drawImage(roofCv, 0, 0, CW, CH);
}
function flushRoofs(){}

// ---------- sprite cache: static wall tiles are drawn once, then stamped ----------
let SPR = new Map(), sprZoom = 0, sprDPR = 0;
function tileSprite(key, tx, ty, a, draw){
  const pad = 6, w = 2 * hw + 2 * pad, h = CFG.WALLH * zoom + 2 * hh + 2 * pad;
  let c = SPR.get(key);
  if (!c && BAKE.s-- <= 0){ draw(); return; }
  if (!c){
    c = document.createElement("canvas"); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
    const sv = [ctx, camX, camY, CW, CH];
    ctx = c.getContext("2d"); CW = 0; CH = 0;
    camX = (tx - ty) * hw - hw - pad; camY = (tx + ty) * hh - CFG.WALLH * zoom - pad;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    try { draw(); } finally { [ctx, camX, camY, CW, CH] = sv; }
    SPR.set(key, c);
    if (SPR.size > 3000) SPR.delete(SPR.keys().next().value);
  }
  const [sx, sy] = S(tx, ty, 0);
  ctx.globalAlpha = a; ctx.drawImage(c, sx - hw - pad, sy - CFG.WALLH * zoom - pad, w, h); ctx.globalAlpha = 1;
}
const featKey = f => !f ? "" : (f.metal ? "M" : "") + f.type === "door" ? `d${+f.open}${+!!f.broken}${f.bar}` : `w${+f.open}${+f.broken}${+f.glass}${+f.curtain}${f.bar}`;

// ---------- tile drawing (pass 2) ----------
function drawTile(tx, ty, myB, pdepth){
  const i = ix(tx, ty), t = tile[i], b = bldId[i];
  const seen = G.vis[i] || explored[i];
  const dim = G.vis[i] ? 1 : explored[i] ? 0.55 : 0.4;
  const inMine = b >= 0 && b === myB;
  const front = tx + ty + 1 > pdepth + 0.3;
  const isWall = t === T.WALL || t === T.DOOR || t === T.WIN;
  if (isWall && b >= 0 && !inMine && !perim[i]){ roofTile(tx, ty, b, dim, tileAlpha(tx, ty, myB, pdepth, true)); return; }
  if (isWall){
    const cut = inMine && front;
    const a = cut ? 1 : tileAlpha(tx, ty, myB, pdepth, true);
    const H = cut ? 6 : CFG.WALLH;
    const trimTop = b >= 0 && !inMine ? (buildings[b].kind === "house" ? shade(ROOFC[b % ROOFC.length], .7) : "#6a6c68") : "#b5ad9c";
    const f = feats.get(i);
    const glow = t === T.WIN && isNight() && powerOn() ? 1 : 0;
    const key = i + "|" + (cut ? 1 : 0) + "|" + dim + "|" + (b >= 0 && !inMine ? 1 : 0) + "|" + featKey(f) + glow;
    tileSprite(key, tx, ty, a, () => {
      const pieces = wallPieces(tx, ty);
      const mats = (pc) => [wallMat(quadSrc(tx, ty, (pc.u0 + pc.u1) / 2 < .5 ? 0 : 1, 1), b), wallMat(quadSrc(tx, ty, 1, (pc.v0 + pc.v1) / 2 < .5 ? 0 : 1), b)];
      if (t === T.WALL){
        for (const pc of pieces){ const [mS, mE] = mats(pc); slab(tx, ty, pc.u0, pc.v0, pc.u1, pc.v1, 0, H, mS, mE, trimTop, dim, 1, pc.showS, pc.showE); }
      } else if (t === T.DOOR) drawDoorThin(tx, ty, f, b, dim, 1, cut, H, trimTop, mats);
      else drawWindowThin(tx, ty, f, b, dim, 1, cut, H, trimTop, mats);
    });
    if (b >= 0 && !inMine) roofQuads(tx, ty, b, dim, a);
    return;
  }
  if (t === T.FLOOR && b >= 0 && !inMine && !G.vis[i]){ roofTile(tx, ty, b, dim, tileAlpha(tx, ty, myB, pdepth, true)); return; }
  if (t === T.TREE){ drawTree(tx, ty, dim, tileAlpha(tx, ty, myB, pdepth, true)); return; }
  const o = objs.get(i);
  if (o && seen) drawObj(o, dim, tileAlpha(tx, ty, myB, pdepth, OBJ[o.type].h > 24));
}

function drawDoorThin(tx, ty, f, b, dim, a, cut, H, trimTop, mats){
  const hz = f.horiz, pc = hz ? { u0: 0, v0: A_, u1: 1, v1: B_ } : { u0: A_, v0: 0, u1: B_, v1: 1 };
  const [mS, mE] = mats(pc);
  const L = (p0, q0, p1, q1) => hz ? [tx + p0, ty + q0, tx + p1, ty + q1] : [tx + q0, ty + p0, tx + q1, ty + p1];
  // frame: lintel + jambs
  if (!cut) slab(tx, ty, pc.u0, pc.v0, pc.u1, pc.v1, 36, CFG.WALLH, mS, mE, trimTop, dim, a, hz, !hz);
  const jh = cut ? H : 36;
  for (const [p0, p1] of [[0, .07], [.93, 1]]){ const r = L(p0, A_, p1, B_); trimBox(r[0], r[1], r[2], r[3], 0, jh, "#e6e1d4", dim, a); }
  const wood = f.bar ? "#5a4630" : "#7a5434";
  if (f.open){
    const r = hz ? [tx + .07, ty + B_, tx + .12, ty + .98] : [tx + B_, ty + .07, tx + .98, ty + .12];
    trimBox(r[0], r[1], r[2], r[3], 0, f.broken ? 5 : (cut ? H : 35), f.broken ? "#4a3a2a" : wood, dim, a);
    return;
  }
  const r = L(.07, .47, .93, .53);
  trimBox(r[0], r[1], r[2], r[3], 0, cut ? H : 35.5, wood, dim, a);
  if (!cut){
    const pnl = shade("#5e4026", dim);
    ctx.globalAlpha = a * .7;
    if (hz){ faceS(tx + .16, tx + .84, ty + .53, 3, 16, pnl); faceS(tx + .16, tx + .84, ty + .53, 19, 32, pnl); }
    else { faceE(tx + .53, ty + .16, ty + .84, 3, 16, pnl); faceE(tx + .53, ty + .16, ty + .84, 19, 32, pnl); }
    ctx.globalAlpha = 1;
    const k = hz ? [tx + .8, ty + .55] : [tx + .55, ty + .2];
    topEl(k[0], k[1], .03, 17.5, "#d8b45a", a);
  }
  if (f.bar) planksThin(tx, ty, f.bar, a, hz);
}

function drawWindowThin(tx, ty, f, b, dim, a, cut, H, trimTop, mats){
  const hz = f.horiz, pc = hz ? { u0: 0, v0: A_, u1: 1, v1: B_ } : { u0: A_, v0: 0, u1: B_, v1: 1 };
  const [mS, mE] = mats(pc);
  const sill = 13, head = 35;
  slab(tx, ty, pc.u0, pc.v0, pc.u1, pc.v1, 0, cut ? H : sill, mS, mE, cut ? trimTop : "#e6e1d4", dim, a, hz, !hz);
  if (cut) return;
  const L = (p0, q0, p1, q1) => hz ? [tx + p0, ty + q0, tx + p1, ty + q1] : [tx + q0, ty + p0, tx + q1, ty + p1];
  for (const [p0, p1] of [[0, .08], [.92, 1]]){ const r = L(p0, A_, p1, B_); trimBox(r[0], r[1], r[2], r[3], sill, head, "#e6e1d4", dim, a); }
  const night = isNight() && powerOn() && b >= 0 && !buildings[b].lightsOff && ((buildings[b].kind === "house" && hash(b, 3) < 0.35) || b === PLAYER_B);
  if (!f.broken){
    const pane = L(.08, .485, .92, .515);
    const glass = f.curtain ? "#8a5a5a" : night ? "#e8d48a" : "#8fb4c4";
    boxW(pane[0], pane[1], pane[2], pane[3], sill, head, shade(glass, dim), a * (f.curtain || night ? .95 : .55));
    // glare streak and mullion
    if (!f.curtain){
      const g0 = L(.2, .5, .32, .5), g1 = L(.3, .5, .42, .5);
      line3([g0[0], g0[1], sill + 4], [g0[2], g0[3], head - 6], "rgba(255,255,255,.35)", 1.2, a);
      line3([g1[0], g1[1], sill + 6], [g1[2], g1[3], head - 3], "rgba(255,255,255,.25)", 1, a);
    }
    const m = L(.5, .5, .5, .5);
    line3([m[0], m[1], sill], [m[0], m[1], head], shade("#e6e1d4", dim), 1.2, a);
    if (f.open){ const o = L(.08, .45, .5, .55); boxW(o[0], o[1], o[2], o[3], head - 9, head, shade("#8fb4c4", dim), a * .5); }
  } else if (f.glass){
    for (const [p, h] of [[.1, 6], [.3, 4], [.7, 7], [.88, 5]]){ const s0 = L(p, .5, p + .08, .5); line3([s0[0], s0[1], sill], [s0[2], s0[3], sill + h], "rgba(200,225,235,.8)", 1.3, a); }
  }
  slab(tx, ty, pc.u0, pc.v0, pc.u1, pc.v1, head, CFG.WALLH, mS, mE, trimTop, dim, a, hz, !hz);
  if (f.bar) planksThin(tx, ty, f.bar, a, hz);
}

function planksThin(tx, ty, n, a, hz){
  for (let k = 0; k < n; k++){
    const z = 9 + k * 7, d = k % 2 ? 5 : -5;
    const p = hz ? [[tx - .02, ty + B_ + .03, z], [tx + 1.02, ty + B_ + .03, z + d]] : [[tx + B_ + .03, ty + 1.02, z], [tx + B_ + .03, ty - .02, z + d]];
    line3(p[0], p[1], "#3a2a18", 5.2, a); line3(p[0], p[1], "#a5824f", 4, a);
  }
}

function drawTree(tx, ty, dim, a){
  const [sx, sy] = S(tx + .5, ty + .5), z = zoom, g = hash(tx, ty);
  ctx.globalAlpha = a;
  const tr = ctx.createLinearGradient(sx - 3 * z, 0, sx + 3 * z, 0);
  tr.addColorStop(0, shade("#3a2a1c", dim)); tr.addColorStop(1, shade("#5e4632", dim));
  ctx.fillStyle = tr; ctx.beginPath(); ctx.moveTo(sx - 3.4 * z, sy); ctx.lineTo(sx - 2 * z, sy - 30 * z); ctx.lineTo(sx + 2 * z, sy - 30 * z); ctx.lineTo(sx + 3.4 * z, sy); ctx.fill();
  const base = g < .33 ? "#2e4a28" : g < .66 ? "#38522c" : "#3e4a26";
  const blobsT = [];
  for (let k = 0; k < 9; k++){
    const ang = k * 2.4 + g * 6, rr = (k < 3 ? 4 : 10) * z;
    blobsT.push([sx + Math.cos(ang) * rr, sy - (40 + (k % 3) * 7) * z + Math.sin(ang) * rr * .55, (k < 3 ? 15 : 10 + (k % 3) * 2) * z]);
  }
  blobsT.sort((p, q) => p[1] - q[1]);
  for (const [bx, by, r] of blobsT){
    const gr = ctx.createRadialGradient(bx - r * .3, by - r * .4, r * .1, bx, by, r);
    gr.addColorStop(0, shade(base, dim * 1.45)); gr.addColorStop(.7, shade(base, dim)); gr.addColorStop(1, shade(base, dim * .7));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
