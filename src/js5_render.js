// ============================================================
// Part 5: rendering (isometric), field of view, lighting
// ============================================================
const cv = document.getElementById("game"); let ctx = cv.getContext("2d");
const lightCv = document.createElement("canvas"), lctx = lightCv.getContext("2d");
let CW = 0, CH = 0, DPR = 1, zoom = 1, hw = 32, hh = 16, camX = 0, camY = 0;
function resize(){
  DPR = Math.min(window.devicePixelRatio || 1, window.__lowRes ? 1 : 1.5, window.__rs || 9);
  CW = innerWidth; CH = innerHeight;
  cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR); lightCv.width = Math.ceil(cv.width / 2); lightCv.height = Math.ceil(cv.height / 2);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); lctx.setTransform(DPR / 2, 0, 0, DPR / 2, 0, 0);
}
addEventListener("resize", resize); resize();

function S(x, y, h = 0){ return [(x - y) * hw - camX + CW / 2, (x + y) * hh - camY + CH / 2 - h * zoom]; }
function toWorld(sx, sy){
  const a = (sx - CW / 2 + camX) / hw, b = (sy - CH / 2 + camY) / hh;
  return [(a + b) / 2, (b - a) / 2];
}

// ---------- field of view ----------
function computeVis(){
  if (!G.vis) G.vis = new Uint8Array(W * H);
  if (G.visBox){ const [a, b, c, d] = G.visBox; for (let y = b; y <= d; y++) G.vis.fill(0, ix(a, y), ix(c, y) + 1); } else G.vis.fill(0);
  const night = isNight();
  let R0 = night ? CFG.playerSightNight : CFG.playerSightDay;
  if (P.traits.has("eagle")) R0 += 3; if (P.traits.has("shortsight")) R0 *= 0.75;
  const flashR = P.flash && night ? CFG.flashRange : 0;
  const Rm = Math.max(R0, flashR);
  const prox = P.traits.has("keenhear") ? 3.4 : P.traits.has("hardhear") ? 1.4 : 2.2;
  const px = Math.floor(P.x), py = Math.floor(P.y);
  const r = Math.ceil(Rm) + 1;
  G.visBox = [Math.max(0, px - r), Math.max(0, py - r), Math.min(W - 1, px + r), Math.min(H - 1, py + r)];
  for (let ty = py - r; ty <= py + r; ty++) for (let tx = px - r; tx <= px + r; tx++){
    if (!inb(tx, ty)) continue;
    const cx = tx + .5, cy = ty + .5, dx = cx - P.x, dy = cy - P.y, d = Math.hypot(dx, dy);
    if (d > Rm) continue;
    let ok = d < prox;
    if (!ok){
      const ad = angDiff(Math.atan2(dy, dx), P.face);
      if (ad < 1.25 && d <= R0) ok = true;
      else if (flashR && ad < 0.5 && d <= flashR) ok = true;
    }
    if (!ok || P.sleeping) continue;
    if (d < 0.75 || los(P.x, P.y, cx, cy, true)){ G.vis[ix(tx, ty)] = 1; explored[ix(tx, ty)] = 1; }
  }
}

// ---------- palette ----------
const SIDING = ["#a9b8c2", "#cdbf8f", "#9fae8e", "#a3574a", "#d9d6cc", "#8c97a8", "#b9a17c"];
const FLOORC = { kitchen: ["#c8c3b4", "#b5af9e"], bathroom: ["#b9cbd2", "#aabdc4"], bedroom: ["#7f6f8a", "#796984"], living: ["#8a6e4e", "#836749"],
  grocery: ["#bdbcb2", "#b2b1a7"], pharmacy: ["#cfd4d0", "#c4c9c5"], hardware: ["#9b9586", "#918b7c"] };
const _sc = new Map();
function shade(hex, f){
  if (hex[0] !== "#") hex = rgbToHex(hex);
  const key = hex + (f * 100 | 0);
  let v = _sc.get(key); if (v) return v;
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(k => clamp(Math.round(k * f), 0, 255).toString(16).padStart(2, "0"));
  v = "#" + c.join(""); _sc.set(key, v); return v;
}
const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967296; };

function diamond(tx, ty, h, col){
  const a = S(tx, ty, h), b = S(tx + 1, ty, h), c = S(tx + 1, ty + 1, h), d = S(tx, ty + 1, h);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
}
// box inside a tile, with margin m, from height z0 to z1
function box(tx, ty, m, z0, z1, col, alpha = 1, sx = 1, sy = 1, topCol, noL, noR){
  const x0 = tx + m * sx, y0 = ty + m * sy, x1 = tx + 1 - m * sx, y1 = ty + 1 - m * sy;
  ctx.globalAlpha = alpha;
  const pL0 = S(x0, y1, z0), pB0 = S(x1, y1, z0), pR0 = S(x1, y0, z0);
  const pL1 = S(x0, y1, z1), pB1 = S(x1, y1, z1), pR1 = S(x1, y0, z1), pT1 = S(x0, y0, z1);
  if (!noL){ ctx.fillStyle = shade(col, 0.72);
  ctx.beginPath(); ctx.moveTo(pL0[0], pL0[1]); ctx.lineTo(pB0[0], pB0[1]); ctx.lineTo(pB1[0], pB1[1]); ctx.lineTo(pL1[0], pL1[1]); ctx.closePath(); ctx.fill(); }
  if (!noR){ ctx.fillStyle = shade(col, 0.88);
  ctx.beginPath(); ctx.moveTo(pB0[0], pB0[1]); ctx.lineTo(pR0[0], pR0[1]); ctx.lineTo(pR1[0], pR1[1]); ctx.lineTo(pB1[0], pB1[1]); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = topCol || col;
  ctx.beginPath(); ctx.moveTo(pT1[0], pT1[1]); ctx.lineTo(pR1[0], pR1[1]); ctx.lineTo(pB1[0], pB1[1]); ctx.lineTo(pL1[0], pL1[1]); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
}
// planks across the visible faces of a door/window
function planks(tx, ty, n, alpha){
  ctx.globalAlpha = alpha; ctx.strokeStyle = "#9c7a4a"; ctx.lineWidth = 4 * zoom;
  for (let k = 0; k < n; k++){
    const z = 10 + k * 8;
    const a = S(tx, ty + 1, z), b = S(tx + 1, ty + 1, z + 6), c = S(tx + 1, ty, z + 6);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function groundColor(t, x, y){
  const n = hash(x, y);
  switch (t){
    case T.GRASS: case T.TREE: return n < .5 ? "#4f6a3a" : n < .85 ? "#56713f" : "#5e7744";
    case T.ROAD: return n < .5 ? "#3e4144" : "#43464a";
    case T.WALK: return n < .5 ? "#8e8c86" : "#97958e";
    case T.LOT: return "#55585b";
    case T.DIRT: return n < .5 ? "#6b5a40" : "#725f43";
    default: {
      const r = rooms[roomId[ix(x, y)]];
      const pal = r ? FLOORC[r.type] : ["#7a7468", "#746e62"];
      return pal[(x + y) & 1];
    }
  }
}

// ---------- characters ----------
// ---------- main draw ----------
function render(){
  zoom = G.zoom; hw = CFG.TW / 2 * zoom; hh = CFG.TH / 2 * zoom;
  camX = (P.x - P.y) * hw; camY = (P.x + P.y) * hh - 20 * zoom;
  if (G.shake){ camX += (Math.random() - .5) * G.shake; camY += (Math.random() - .5) * G.shake; }
  ctx.fillStyle = "#0d0f12"; ctx.fillRect(0, 0, CW, CH);
  const px = Math.floor(P.x), py = Math.floor(P.y);
  const span = Math.ceil(Math.max(CW / hw, CH / hh) * 0.75) + 3;
  const x0 = Math.max(0, px - span), x1 = Math.min(W - 1, px + span), y0 = Math.max(0, py - span), y1 = Math.min(H - 1, py + span);
  const [spx, spy] = sideTile(P.x, P.y);
  const myB = inb(spx, spy) && tile[ix(spx, spy)] === T.FLOOR ? bldId[ix(spx, spy)] : -1;
  const pdepth = P.x + P.y;
  const onScreen = (tx, ty) => { const [sx, sy] = S(tx + .5, ty + .5); return sx > -80 && sx < CW + 80 && sy > -120 && sy < CH + 120; };

  computeFade();
  // pass 1: textured ground
  drawGround(x0, x1, y0, y1, onScreen);
  // road paint
  ctx.strokeStyle = "rgba(214,180,70,.55)"; ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([10 * zoom, 12 * zoom]);
  for (const [ax, ay, bx, by] of ROADS){
    if (Math.max(ax, bx) < x0 - 2 || Math.min(ax, bx) > x1 + 2 || Math.max(ay, by) < y0 - 2 || Math.min(ay, by) > y1 + 2) continue;
    const a = S(clamp(ax, x0 - 2, x1 + 2), clamp(ay, y0 - 2, y1 + 2)), b = S(clamp(bx, x0 - 2, x1 + 2), clamp(by, y0 - 2, y1 + 2));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  ctx.setLineDash([]);
  // blood
  for (const b of G.blood){
    if (b.x < x0 || b.x > x1 + 1 || b.y < y0 || b.y > y1 + 1) continue;
    const [sx, sy] = S(b.x, b.y);
    ctx.fillStyle = "rgba(100,12,8,.6)"; ctx.beginPath(); ctx.ellipse(sx, sy, b.r * zoom, b.r * .5 * zoom, b.a, 0, 7); ctx.fill();
  }
  // floor items
  for (const [i, list] of floorItems){
    if (!list.length) continue;
    const tx = i % W, ty = (i / W) | 0; if (!G.vis[i]) continue;
    box(tx, ty, .36, 0, 5, "#c9b98e");
  }
  // corpses
  for (const c of G.corpses){
    if (!G.vis[ix(c.x | 0, c.y | 0)]) continue;
    drawLying(c.x, c.y, { face: c.face, shirt: shade(c.col, .6), pants: c.pants, skin: "#5e6a52", pool: true });
  }

  // pass 2: depth sorted
  const list = [];
  const night = isNight();
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++){
    const i = ix(tx, ty), t = tile[i];
    if (t === T.GRASS || t === T.ROAD || t === T.WALK || t === T.LOT || t === T.DIRT){ if (!objs.has(i)) continue; }
    if (!onScreen(tx, ty)) continue;
    list.push({ d: tx + ty + 1, tx, ty, kind: "tile" });
  }
  for (const z of Z){
    if (!z.alive || z.x < x0 || z.x > x1 + 1 || z.y < y0 || z.y > y1 + 1) continue;
    if (!G.vis[ix(z.x | 0, z.y | 0)]) continue;
    list.push({ d: z.x + z.y, kind: "z", z });
  }
  for (const c of V){ if (c.x < x0 - 2 || c.x > x1 + 2 || c.y < y0 - 2 || c.y > y1 + 2) continue; list.push({ d: c.x + c.y, kind: "v", c }); }
  if (P.alive) list.push({ d: P.x + P.y, kind: "p" });
  list.sort((a, b) => a.d - b.d);

  for (const e of list){
    if (e.kind === "z") drawZombie(e.z);
    else if (e.kind === "p") drawPlayer();
    else if (e.kind === "v") drawVehicle(e.c);
    else drawTile(e.tx, e.ty, myB, pdepth);
  }
  drawRoofLayer(x0, x1, y0, y1, myB, pdepth, onScreen);
  drawBuildGhost(); drawFx();

  // swing arc
  if (P.swing && P.swing.kind === "swing" && P.weapon){
    const w = ITEMS[P.weapon.id], p = P.swing.t / P.swing.dur;
    if (p > .3 && p < .7){
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = -6; k <= 6; k++){ const a = P.face + k * 0.13, [sx, sy] = S(P.x + Math.cos(a) * w.range, P.y + Math.sin(a) * w.range, 16); k === -6 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); }
      ctx.stroke();
    }
  }

  // rain
  if (G.rain){
    ctx.strokeStyle = "rgba(170,190,220,.35)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 0; k < 220; k++){ const x = (k * 97 + G.simT * 340 * (1 + k % 3)) % CW, y = (k * 57 + G.simT * 900) % CH; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 14); }
    ctx.stroke();
  }

  // darkness + flashlight
  const dk = darkness() + (G.rain ? 0.12 : 0);
  if (dk > 0.02 || P.sleeping){
    lctx.globalCompositeOperation = "source-over";
    lctx.clearRect(0, 0, CW, CH);
    lctx.fillStyle = `rgba(4,6,14,${P.sleeping ? 0.9 : Math.min(0.92, dk)})`; lctx.fillRect(0, 0, CW, CH);
    lctx.globalCompositeOperation = "destination-out";
    const [psx, psy] = S(P.x, P.y, 14);
    let g = lctx.createRadialGradient(psx, psy, 0, psx, psy, 2.2 * hw);
    g.addColorStop(0, "rgba(0,0,0,.75)"); g.addColorStop(1, "rgba(0,0,0,0)");
    lctx.fillStyle = g; lctx.beginPath(); lctx.ellipse(psx, psy, 2.2 * hw, 2.2 * hh, 0, 0, 7); lctx.fill();
    for (const [lx, ly, lr] of lightsInView()){ const [sx, sy] = S(lx, ly, 6), gl = lctx.createRadialGradient(sx, sy, 0, sx, sy, lr * hw); gl.addColorStop(0, `rgba(0,0,0,${.85 + Math.random() * .1})`); gl.addColorStop(1, "rgba(0,0,0,0)"); lctx.fillStyle = gl; lctx.beginPath(); lctx.ellipse(sx, sy, lr * hw, lr * hh * 1.2, 0, 0, 7); lctx.fill(); }
    if ((P.flash || (P.car && P.car.on)) && !P.sleeping){
      const L = CFG.flashRange, [ex, ey] = S(P.x + Math.cos(P.face) * L * .6, P.y + Math.sin(P.face) * L * .6, 0);
      g = lctx.createLinearGradient(psx, psy, ex, ey);
      g.addColorStop(0, "rgba(0,0,0,.95)"); g.addColorStop(1, "rgba(0,0,0,0)");
      lctx.fillStyle = g; lctx.beginPath(); lctx.moveTo(psx, psy);
      for (let k = -10; k <= 10; k++){ const a = P.face + k * 0.045, [sx, sy] = S(P.x + Math.cos(a) * L, P.y + Math.sin(a) * L, 0); lctx.lineTo(sx, sy); }
      lctx.closePath(); lctx.fill();
    }
    // powered windows glow a little at night
    ctx.drawImage(lightCv, 0, 0, CW, CH);
  }

  // progress bar + speech
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
  if (P.sleeping){
    ctx.font = "34px VT323, monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#d6f2c4";
    ctx.fillText("Sleeping... (move to wake up)", CW / 2, CH / 2 - 120);
  }
}

// fade only what is actually drawn over the survivor on screen
let FADE = [];
function computeFade(){
  const [px, py] = S(P.x, P.y, 18);
  FADE = [10, 24, 38, CFG.WALLH].map(h => toWorld(px, py + h * zoom));
}
function tileAlpha(tx, ty, myB, pdepth, tall){
  if (!tall || tx + ty + 1 - pdepth <= 0.3) return 1;
  const cx = tx + .5, cy = ty + .5;
  for (let k = 0; k < FADE.length; k++){
    const [wx, wy] = FADE[k], r = k === 3 ? 2.1 : 1.5;
    if ((cx - wx) ** 2 + (cy - wy) ** 2 < r * r) return 0.28;
  }
  return 1;
}
function rgbToHex(s){
  if (s[0] === "#") return s;
  const m = s.match(/\d+/g); return "#" + m.slice(0, 3).map(v => (+v).toString(16).padStart(2, "0")).join("");
}
