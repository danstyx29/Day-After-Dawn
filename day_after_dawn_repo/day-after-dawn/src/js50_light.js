// ============================================================
// Part 50 (1.12): light.
//  - The sun moves. Building and tree shadows swing from west at sunrise
//    to east at sunset, stretch long when the sun is low, shorten at noon,
//    soften under cloud and vanish at night.
//  - The sky colours the world: dawn pink, golden hour, the blue hour,
//    moonlit nights.
//  - Interiors are lit by their windows (as in the original's Build 42):
//    a windowless room is dark at noon, and the sunset glow comes in red.
//  - Your eyes adjust: step from light into darkness and you're half
//    blind for a few seconds.
//  - Colour temperature: warm homes, cool fluorescent shops, headlights.
// ============================================================
const LT = { sun: null, shadowCV: null, shadowG: null, adapt: { lum: 1, extra: 0, glare: 0 }, exp: new Map(), lookT: 3 };
function sunState(){
  const h = (G.min % 1440) / 60, w = winterness(), sr = 6.4 + 1.5 * w, ss = 20.8 - 3.2 * w;
  if (h < sr - .4 || h > ss + .4) return null;
  const a = clamp((h - sr) / (ss - sr), 0, 1) * Math.PI, elev = Math.sin(a);
  const cover = G.rain ? .3 : (G.fog || 0) > .3 ? .45 : G.stormy ? .35 : 1;
  const edge = clamp(Math.min(h - (sr - .4), (ss + .4) - h) / .9, 0, 1);
  return { a, elev, dx: -Math.cos(a) * .95, dy: .26 + .2 * (1 - elev), len: Math.min(3.2, 1 / Math.max(.3, elev)), alpha: .26 * cover * edge, warm: (1 - elev) * edge, h, sr, ss };
}
function drawSunShadows(x0, x1, y0, y1){
  const s = LT.sun = sunState(); if (!s || s.alpha < .01 || RV.inPocket) return;
  // drawn into a canvas a quarter-screen larger on every side, at half resolution, and slid with the camera;
  // it's only redrawn when the camera nears its edge, the zoom changes, or the sun has moved
  const sc = .5, px = Math.round(CW * .25), py = Math.round(CH * .25), W2 = CW + px * 2, H2 = CH + py * 2;
  const key = `${zoom}|${CW}|${CH}|${Math.round(s.a * 90)}|${Math.round(s.alpha * 20)}|${buildings.length}`;
  const moved = LT.sh ? Math.max(Math.abs(camX - LT.sh.cx) - px * .8, Math.abs(camY - LT.sh.cy) - py * .8) : 1;
  if (!LT.sh || LT.sh.key !== key || moved > 0){
    if (!LT.shadowCV || LT.shadowCV.width !== Math.ceil(W2 * sc) || LT.shadowCV.height !== Math.ceil(H2 * sc)){ LT.shadowCV = document.createElement("canvas"); LT.shadowCV.width = Math.ceil(W2 * sc); LT.shadowCV.height = Math.ceil(H2 * sc); LT.shadowG = LT.shadowCV.getContext("2d"); }
    const g = LT.shadowG, ocx = camX, ocy = camY; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, LT.shadowCV.width, LT.shadowCV.height); g.setTransform(sc, 0, 0, sc, 0, 0); g.fillStyle = "#000";
    camX = ocx - px; camY = ocy - py;
    const [wx0, wy0] = toWorld(0, 0), [wx1, wy1] = toWorld(W2, 0), [wx2, wy2] = toWorld(0, H2), [wx3, wy3] = toWorld(W2, H2);
    const X0 = Math.floor(Math.min(wx0, wx1, wx2, wx3)) - 2, X1 = Math.ceil(Math.max(wx0, wx1, wx2, wx3)) + 2, Y0 = Math.floor(Math.min(wy0, wy1, wy2, wy3)) - 2, Y1 = Math.ceil(Math.max(wy0, wy1, wy2, wy3)) + 2;
    g.beginPath();
    for (const B of buildingsNear(X0, X1, Y0, Y1)){
      if (B.y1 >= PK_Y0 || B.x0 === undefined) continue;
      const L = Math.min(9, bTop(B) / WALLH * 1.25 * s.len), dx = s.dx * L, dy = s.dy * L;
      const r = [[B.x0 + .4, B.y0 + .4], [B.x1 + .6, B.y0 + .4], [B.x1 + .6, B.y1 + .6], [B.x0 + .4, B.y1 + .6]];
      const pts = hull(r.concat(r.map(([x, y]) => [x + dx, y + dy]))).map(([x, y]) => S(x, y, 0));
      g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath();
    }
    g.fill();
    const tl = .9 * s.len, ex = .9 * hw * (1 + .25 * (s.len - 1)), ey = .75 * hh, tall = [];
    g.beginPath();
    for (let ty = Math.max(Y0, 0); ty <= Math.min(Y1, PK_Y0 - 1); ty++) for (let tx = Math.max(X0, 0); tx <= Math.min(X1, W - 1); tx++){
      const i = ix(tx, ty), t = tile[i];
      if (t === T.TREE){ const [cx, cy] = S(tx + .5 + s.dx * tl, ty + .5 + s.dy * tl, 0); g.moveTo(cx + ex, cy); g.ellipse(cx, cy, ex, ey, 0, 0, 7); continue; }
      const o = objs.get(i); if (o && (o.type === "watertower" || o.type === "silo" || o.type === "lamp" || o.type === "upole")) tall.push(o);
    }
    g.fill();
    g.lineCap = "round"; g.strokeStyle = "#000";
    for (const o of tall){
      const thin = o.type === "lamp" || o.type === "upole", L = (thin ? 1.6 : 3.2) * s.len, [ax, ay] = S(o.x + .5, o.y + .5, 0), [bx, by] = S(o.x + .5 + s.dx * L, o.y + .5 + s.dy * L, 0);
      g.lineWidth = (thin ? .12 : .9) * hw; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    }
    camX = ocx; camY = ocy; LT.sh = { key, cx: ocx, cy: ocy };
  }
  ctx.save(); ctx.globalAlpha = s.alpha; ctx.drawImage(LT.shadowCV, -px - (camX - LT.sh.cx), -py - (camY - LT.sh.cy), W2, H2); ctx.restore();
}
let CLOUDSPR = null;
function drawCloudShadows(){
  const s = LT.sun; if (!s || QUALITY < 2 || RV.inPocket || G.rain) return;
  if (!CLOUDSPR){ const [c, g] = mkCanvas(128, 128), gr = g.createRadialGradient(64, 64, 6, 64, 64, 64); gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); CLOUDSPR = c; }
  const t = G.simT * (.25 + windNow() * .5);
  ctx.save(); ctx.globalAlpha = .07 * Math.min(1, s.elev * 2);
  for (let k = 0; k < 5; k++){
    const bx = P.x + ((hash(k, 7) * 160 + t) % 160) - 80, by = P.y + ((hash(k, 9) * 160 + t * .4) % 160) - 80, r = 9 + hash(k, 3) * 10, [sx, sy] = S(bx, by, 0);
    ctx.drawImage(CLOUDSPR, sx - r * hw, sy - r * hh, r * hw * 2, r * hh * 2);
  }
  ctx.restore();
}
const bump = (x, c, w) => Math.max(0, 1 - Math.abs(x - c) / w);
function skyGrade(){
  if (QUALITY === 0) return;
  const h = (G.min % 1440) / 60, w = winterness(), sr = 6.4 + 1.5 * w, ss = 20.8 - 3.2 * w;
  const dawn = bump(h, sr + .2, 1.4), golden = bump(h, ss - .9, 1.5), blue = bump(h, ss + .9, 1.1), night = (h > ss + 1.2 || h < sr - 1) ? 1 : 0, cov = G.rain ? .45 : 1;
  ctx.save(); ctx.globalCompositeOperation = "soft-light";
  if (dawn > 0){ ctx.fillStyle = `rgba(255,150,130,${.2 * dawn * cov})`; ctx.fillRect(0, 0, CW, CH); }
  if (golden > 0){ ctx.fillStyle = `rgba(255,165,80,${.26 * golden * cov})`; ctx.fillRect(0, 0, CW, CH); }
  if (blue > 0){ ctx.fillStyle = `rgba(80,100,200,${.24 * blue})`; ctx.fillRect(0, 0, CW, CH); }
  if (night){ ctx.fillStyle = "rgba(70,95,170,.2)"; ctx.fillRect(0, 0, CW, CH); }
  ctx.restore();
}
function roomExposure(r){
  let e = LT.exp.get(r.id); if (e !== undefined) return e;
  const seen = new Set(); let wins = 0, doors = 0;
  for (const [x, y] of r.tiles) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
    const nx = x + dx, ny = y + dy, i = ix(nx, ny); if (seen.has(i)) continue; seen.add(i);
    if (tile[i] === T.WIN) wins++; else if (tile[i] === T.DOOR && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([ex, ey]) => bldId[ix(nx + ex, ny + ey)] < 0)) doors++;
  }
  e = clamp((wins + doors * .5) * 4 / Math.max(8, r.tiles.length), 0, 1); LT.exp.set(r.id, e); return e;
}
function drawInteriorLight(){
  if (QUALITY === 0 || PLAYER_B < 0 || !indoorsNow()) return;
  const dk = darknessBase(), day = 1 - Math.min(1, dk * 1.4); if (day < .1) return;
  const B = buildings[PLAYER_B]; if (!B) return;
  const lit = powerOn(P.x, P.y) && !B.lightsOff, s = LT.sun, warm = s ? s.warm : 0, lvl = realXY(P.x, P.y).lvl;
  for (const r of roomsOf(PLAYER_B)){
    if (r.b !== PLAYER_B || !r.tiles.length) continue;
    const [fx, fy] = r.tiles[0]; if ((lvl === 0) !== (fy < PK_Y0)) continue;
    if (lvl !== 0){ const pk = pkAt(fx, fy); if (!pk || pk.k !== lvl) continue; }
    const E = roomExposure(r), a = (1 - E) * .5 * day * (lit ? .35 : 1), sunset = warm > .2 && E > .3 && !lit;
    if (a < .02 && !sunset) continue;
    const path = new Path2D(); let any = false;
    for (const [x, y] of r.tiles){ if (!G.vis[ix(x, y)]) continue; any = true; const p0 = S(x, y), p1 = S(x + 1, y), p2 = S(x + 1, y + 1), p3 = S(x, y + 1); path.moveTo(p0[0], p0[1]); path.lineTo(p1[0], p1[1]); path.lineTo(p2[0], p2[1]); path.lineTo(p3[0], p3[1]); path.closePath(); }
    if (!any) continue;
    if (a > .02){ ctx.fillStyle = `rgba(6,8,12,${a})`; ctx.fill(path); }
    if (sunset){ ctx.fillStyle = `rgba(255,110,50,${.1 * warm * E})`; ctx.fill(path); }
  }
}
function stepAdapt(dt){
  const A = LT.adapt, lum = typeof ST !== "undefined" ? ST.light : 1;
  if (lum < A.lum - .3) A.extra = Math.min(.45, A.extra + (A.lum - lum) * .55);
  if (lum > A.lum + .4) A.glare = Math.min(.35, A.glare + (lum - A.lum) * .4);
  A.lum += (lum - A.lum) * Math.min(1, dt / 7);
  A.extra = Math.max(0, A.extra - dt * .04); A.glare = Math.max(0, A.glare - dt * .25);
}
function drawAdapt(){
  const A = LT.adapt; if (P.car) return;
  if (A.extra > .01){ ctx.fillStyle = `rgba(2,3,6,${A.extra})`; ctx.fillRect(0, 0, CW, CH); }
  if (A.glare > .01){ ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = `rgba(255,250,235,${A.glare})`; ctx.fillRect(0, 0, CW, CH); ctx.restore(); }
}
const SHOPLIT = new Set(["cornerstore", "pharmacy", "hardware", "gas", "diner", "bar", "liquor", "video", "laundromat", "grocery", "clinic", "hospital", "police", "firestation", "mall", "cinema", "gunstore", "hotel"]);
function extraLights(){
  if (!isNight() || RV.inPocket) return;
  for (const c of V){
    if (!c.on || Math.abs(c.x - P.x) > 30 || Math.abs(c.y - P.y) > 30) continue;
    const fx = Math.cos(c.a), fy = Math.sin(c.a);
    for (const [d, r] of [[1.6, 1.8], [3.2, 2.4], [5, 2.9]]){ const [sx, sy] = S(c.x + fx * d, c.y + fy * d, 2); LIGHTS.push([sx, sy, r, "255,240,205"]); }
  }
  if ((LT.shopT = (LT.shopT || 0) - RDT) <= 0){ LT.shopT = .7; LT.shopWins = [];
    for (let y = (P.y | 0) - 24; y <= (P.y | 0) + 24; y++) for (let x = (P.x | 0) - 24; x <= (P.x | 0) + 24; x++){
      const i = ix(x, y); if (tile[i] !== T.WIN) continue; const b = bldId[i]; if (b < 0) continue; const B = buildings[b];
      if (!SHOPLIT.has(B.kind) || B.lightsOff || !powerOn(x, y) || hash(b, 11) > .7) continue;
      const f = feats.get(i); if (!f) continue;
      LT.shopWins.push(f.horiz ? (bldId[ix(x, y + 1)] === b ? [x + .5, y - .3] : [x + .5, y + 1.3]) : (bldId[ix(x + 1, y)] === b ? [x - .3, y + .5] : [x + 1.3, y + .5]));
    } }
  for (const [x, y] of LT.shopWins || []){ const [sx, sy] = S(x, y, 2); if (sx > -100 && sx < CW + 100 && sy > -100 && sy < CH + 100) LIGHTS.push([sx, sy, 1.7, "200,220,255"]); }
}
function idleLook(){
  LT.lookT -= RDT; if (LT.lookT < -1.4) LT.lookT = rf(5, 11);
  return LT.lookT < 0 ? Math.sin((-LT.lookT / 1.4) * Math.PI) * (hash(Math.floor(G.simT / 10), 3) < .5 ? .5 : -.5) : Math.sin(G.simT * .7) * .04;
}
function stepLight(dt){ stepAdapt(dt); }
