// ============================================================
// Part 33: the look and the speed.
//  - Walls work out their shape and materials once, not every frame.
//  - Trees and ordinary furniture are drawn once into images and
//    reused; light pools come from pre-made images too.
//  - Trees change with the seasons.
//  - A more muted, grounded palette closer to the original: gentle
//    desaturation, an olive cast, a soft vignette, richer ground
//    textures and shaded limbs on people.
// ============================================================

// ---------- wall shape cache ----------
const WSIG = new Map();
function wallSig(i, tx, ty, t, b){
  let e = WSIG.get(i);
  if (e && e.t === t) return e;
  const pieces = wallPieces(tx, ty);
  const matOf = pc => [wallMat(quadSrc(tx, ty, (pc.u0 + pc.u1) / 2 < .5 ? 0 : 1, 1), b), wallMat(quadSrc(tx, ty, 1, (pc.v0 + pc.v1) / 2 < .5 ? 0 : 1), b)];
  const mats = pieces.map(matOf);
  e = { t, pieces, mats, matOf };
  e.shapeK = t === T.WALL ? pieces.map((p, k) => `${p.u0},${p.v0},${p.u1},${p.v1},${+p.showS},${+p.showE},${matKey(mats[k][0])},${matKey(mats[k][1])}`).join(";") : null;
  WSIG.set(i, e);
  if (WSIG.size > 60000) WSIG.delete(WSIG.keys().next().value);
  return e;
}
function invalidateGround(x, y){ for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) WSIG.delete(ix(x + dx, y + dy)); invalidateWorldRect(x - 1, y - 1, x + 2, y + 2); }

// ---------- trees: a handful of drawn variants per season ----------
function seasonKey(){ const w = winterness(), m = new Date(1993, 6, 14 + Math.floor(G.min / 1440) - CFG.startDay).getMonth(); return w > .78 ? "winter" : (m >= 8 && m <= 10) ? "autumn" : m >= 2 && m <= 4 ? "spring" : "summer"; }
const TREE_PAL = { summer: ["#3e5a2e", "#4e6a36", "#2e4422"], spring: ["#5a7a3a", "#6a8a44", "#3e5a2a"], autumn: ["#8a5a2a", "#a8742e", "#6a4a24"], winter: null };
function drawTree(tx, ty, dim, a){
  const v = Math.floor(hash(tx * 3, ty * 5) * 6), sk = seasonKey(), key = `T|${v}|${sk}|${dim}`;
  CUR_CACHE.T = CUR_CACHE.T || new Map();
  let c = CUR_CACHE.T.get(key);
  const pad = 8, w = 3.2 * hw, top = 92, h = top * zoom + hh * 2 + pad * 2;
  if (!c){
    c = document.createElement("canvas"); c.width = Math.ceil((w + pad * 2) * DPR); c.height = Math.ceil(h * DPR);
    const sv = [ctx, camX, camY, CW, CH]; ctx = c.getContext("2d"); CW = 0; CH = 0;
    camX = -w / 2 - pad; camY = -top * zoom - pad; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    try { paintTree(v, sk, dim); } finally { [ctx, camX, camY, CW, CH] = sv; }
    CUR_CACHE.T.set(key, c);
  }
  const [sx, sy] = S(tx + .5, ty + .5, 0);
  ctx.globalAlpha = a; ctx.drawImage(c, sx - w / 2 - pad, sy - top * zoom - pad, w + pad * 2, h); ctx.globalAlpha = 1;
}
function paintTree(v, sk, dim){
  const g0 = (v * .37) % 1, ht = 34 + g0 * 14, lean = (g0 - .5) * .15;
  const [bx, by] = S(0, 0, 0), [tx, ty] = S(lean, -lean, ht);
  const bark = shade(sk === "winter" ? "#4a3e34" : "#4a3a2a", dim);
  ctx.strokeStyle = bark; ctx.lineCap = "round"; ctx.lineWidth = (3.6 + g0 * 1.5) * zoom; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.lineWidth = 1.6 * zoom;
  for (let k = 0; k < 5; k++){ const an = k * 1.25 + v, z0 = ht * (.5 + k * .1), [ax, ay] = S(lean * .7, -lean * .7, z0), [ex, ey] = S(Math.cos(an) * .55, Math.sin(an) * .55, z0 + 12); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke(); }
  const pal = TREE_PAL[sk];
  if (!pal){ ctx.lineWidth = .8 * zoom; for (let k = 0; k < 9; k++){ const an = k * .7 + v, [ax, ay] = S(Math.cos(an) * .4, Math.sin(an) * .4, ht * .85), [ex, ey] = S(Math.cos(an) * .9, Math.sin(an) * .9, ht + 6 + (k % 3) * 4); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke(); } return; }
  const blobs = 6 + (v % 3);
  for (let k = 0; k < blobs; k++){
    const an = k / blobs * 6.283 + v, rr = (k % 2 ? .45 : .7), [cx, cy] = S(Math.cos(an) * rr * .8, Math.sin(an) * rr * .8, ht + (k % 3) * 6 - 2);
    const r = (11 + ((k * 7 + v) % 5) * 1.6) * zoom;
    const gr = ctx.createRadialGradient(cx - r * .35, cy - r * .4, r * .15, cx, cy, r);
    gr.addColorStop(0, shade(pal[1], dim * 1.08)); gr.addColorStop(.7, shade(pal[0], dim)); gr.addColorStop(1, shade(pal[2], dim * .9));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  }
  ctx.fillStyle = `rgba(255,255,230,${.06 * dim})`; const [hx, hy] = S(-.3, -.3, ht + 12); ctx.beginPath(); ctx.arc(hx, hy, 8 * zoom, 0, 7); ctx.fill();
}

// ---------- furniture drawn once ----------
const OBJ_CACHE_OK = new Set(["fridge", "oven", "counter", "ksink", "bsink", "toilet", "bed", "wardrobe", "dresser", "sofa", "bookcase", "tv", "medcab", "crate", "shelf", "checkout", "desk", "locker", "vending", "filecab",
  "armycrate", "hbed", "bunk", "table", "armchair", "coffeetable", "nightstand", "tub", "chair", "dtable", "officedesk", "piano", "watercooler", "boiler", "workbench", "boxes", "pantry", "dryer", "washer", "rack", "hay",
  "tseat", "gunrack", "gunlocker", "display", "guncabinet", "popcorn", "kiosk", "mannequin", "plant", "rug", "hydrant", "mailbox", "trashcan", "bench", "newsbox", "picnic", "rock", "bush", "flowerbed", "gravestone",
  "sandbag", "statue", "pshelf", "bedrough", "kiln", "anvil", "woodwall2", "logwall", "metalwall", "pcrate", "woodwall", "rainbarrel"]);
function drawObjCached(o, dim, a){
  const top = (OBJ[o.type].h || 10) + 36, v = Math.floor(hash(o.x, o.y) * 3), d = o.dir ? o.dir[0] + "," + o.dir[1] : "-";
  const key = `O|${o.type}|${d}|${dim}|${v}|${o.open ? 1 : 0}|${o.horiz ? 1 : 0}`;
  CUR_CACHE.O = CUR_CACHE.O || new Map();
  let c = CUR_CACHE.O.get(key);
  const pad = 10, w = 2 * hw + pad * 2, h = top * zoom + hh * 2 + pad * 2;
  if (!c){
    if (BAKE.s-- <= 0){ drawObj(o, dim, a); return; }
    c = document.createElement("canvas"); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
    const sv = [ctx, camX, camY, CW, CH]; ctx = c.getContext("2d"); CW = 0; CH = 0;
    camX = (v - 0) * hw - hw - pad; camY = (v + 0) * hh - top * zoom - pad; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    try { const [ex, ey] = S(v + .5, .5, 0); ctx.fillStyle = "rgba(0,0,0,.16)"; ctx.beginPath(); ctx.ellipse(ex, ey + 1, .44 * hw, .44 * hh, 0, 0, 7); ctx.fill(); drawObj(Object.assign({}, o, { x: v, y: 0 }), dim, 1); } finally { [ctx, camX, camY, CW, CH] = sv; resetT(); }
    CUR_CACHE.O.set(key, c);
    if (CUR_CACHE.O.size > 1500) CUR_CACHE.O.delete(CUR_CACHE.O.keys().next().value);
  }
  const [sx, sy] = S(o.x, o.y, 0);
  ctx.globalAlpha = a; ctx.drawImage(c, sx - hw - pad, sy - top * zoom - pad, w, h); ctx.globalAlpha = 1;
}

// ---------- light pools from images ----------
const LSPR = new Map();
function lightSprite(col){
  let c = LSPR.get(col); if (c) return c;
  const [cv2, g] = mkCanvas(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  if (col === "cut"){ gr.addColorStop(0, "rgba(0,0,0,.92)"); gr.addColorStop(1, "rgba(0,0,0,0)"); } else { gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(1, `rgba(${col},0)`); }
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); LSPR.set(col, cv2); return cv2;
}

// ---------- the palette: closer to the original's muted, grounded look ----------
let VIGN = null;
function gradeFrame(){
  if (QUALITY === 0) return;
  if (QUALITY === 1){ ctx.fillStyle = "rgba(60,66,50,.08)"; ctx.fillRect(0, 0, CW, CH); if (VIGN) ctx.drawImage(VIGN.c, 0, 0, CW, CH); return; }
  // gently pull the saturation down and push an olive cast in
  ctx.globalCompositeOperation = "saturation"; ctx.fillStyle = `rgba(128,128,128,${.2 + (G.rain ? .12 : 0) + (G.fog || 0) * .12})`; ctx.fillRect(0, 0, CW, CH);
  ctx.globalCompositeOperation = "soft-light"; ctx.fillStyle = "rgba(120,124,96,.22)"; ctx.fillRect(0, 0, CW, CH);
  ctx.globalCompositeOperation = "source-over";
  if (!VIGN || VIGN.w !== CW || VIGN.h !== CH){
    const c = document.createElement("canvas"); c.width = CW; c.height = CH; const g = c.getContext("2d");
    const gr = g.createRadialGradient(CW / 2, CH / 2, Math.min(CW, CH) * .35, CW / 2, CH / 2, Math.max(CW, CH) * .72);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(6,8,6,.38)"); g.fillStyle = gr; g.fillRect(0, 0, CW, CH); VIGN = { c, w: CW, h: CH };
  }
  ctx.drawImage(VIGN.c, 0, 0, CW, CH);
}
(function richerGround(){
  const mk = (base, layers, n) => { const [c, g] = mkCanvas(128, 128); g.fillStyle = base; g.fillRect(0, 0, 128, 128);
    for (const [col, cnt, r0, r1, al] of layers) for (let k = 0; k < cnt; k++){ g.globalAlpha = al; g.fillStyle = col; g.beginPath(); g.ellipse(Math.random() * 128, Math.random() * 128, rf(r0, r1), rf(r0, r1) * .7, Math.random() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1; speckle(g, 128, 128, n, ["#2e3a20", "#5a6a3a", "#6a6a44", "#3a4626"], .6, 1.3);
    g.strokeStyle = "rgba(30,44,18,.35)"; g.lineWidth = 1; for (let k = 0; k < 160; k++){ const x = Math.random() * 128, y = Math.random() * 128; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rf(-1, 1), y - rf(2, 4)); g.stroke(); }
    g.fillStyle = "rgba(6,8,12,.16)"; g.fillRect(0, 0, 128, 128); return pattern(c, 1 / PPT, 1 / PPT); };
  TEX.grass = mk("#4a5832", [["#55663a", 26, 6, 18, .45], ["#3c4a28", 22, 5, 14, .4], ["#6a6a42", 10, 4, 10, .3], ["#5e5a3a", 6, 3, 8, .25]], 7000);
  const [c2, g2] = mkCanvas(128, 128); g2.fillStyle = "#5a4a34"; g2.fillRect(0, 0, 128, 128); speckle(g2, 128, 128, 8000, ["#4a3c2a", "#6a5a40", "#3a2e20", "#7a6a4e"], .7, 1.6); g2.fillStyle = "rgba(6,8,12,.16)"; g2.fillRect(0, 0, 128, 128);
  TEX.dirt = pattern(c2, 1 / PPT, 1 / PPT);
})();
