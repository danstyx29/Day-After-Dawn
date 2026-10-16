// ============================================================
// Part 22: architecture. Houses get pitched roofs, porches, garages,
// shutters, colours and yards; lots vary in width so a block reads
// as a street; downtown gets two-storey shops with flats above.
// ============================================================
T.SAND = 12; T.GRAVEL = 13;
(function groundTex(){
  const mk = (base, cols, n) => { const [c, g] = mkCanvas(128, 128); g.fillStyle = base; g.fillRect(0, 0, 128, 128); speckle(g, 128, 128, n, cols, .7, 1.5); g.fillStyle = "rgba(6,8,12,.18)"; g.fillRect(0, 0, 128, 128); return pattern(c, 1 / PPT, 1 / PPT); };
  TEX.sand = mk("#a89a7c", ["#b8aa8a", "#988a6c", "#c4b694"], 5000);
  TEX.gravel = mk("#6e6a62", ["#8a8478", "#5a564e", "#9a9488", "#4a463e"], 9000);
  const [c, g] = mkCanvas(64, 64); g.fillStyle = "#8a6a46"; g.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 64; y += 8){ g.fillStyle = y % 16 ? "#7a5c3c" : "#946e48"; g.fillRect(0, y, 64, 7); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, y + 7, 64, 1); }
  TEX.deck = pattern(c, 1 / 64, 1 / 64);
})();
Object.assign(QCOL, { deck: "#7a5c3c" });

// ---------- materials: house colours, brick-and-siding, trims ----------
const HOUSE_COLS = ["#c8c0a8", "#9ab0b8", "#d4c47e", "#a8b490", "#e4e2da", "#b8a898", "#c89a88", "#8a9aa8", "#d8c8a0", "#7a8a6a", "#b4a48e", "#cdb6a0", "#8e7a6a", "#a6b8a0"];
const TRIMS = ["#efeae0", "#efeae0", "#e8e0cc", "#3a3a36", "#6a4a34"];
const SHUTTERS = ["#2f4a36", "#1e2226", "#2a3450", "#5a2626", "#e8e4dc", "#4a3a2a"];
const ROOF_COLS = ["#4a3c36", "#3e4654", "#56504a", "#3e4a40", "#5a3a2e", "#6a6660", "#2e3036", "#6a4e3a", "#4c5a62", "#7a3a2a"];
function ensureFacade(key){
  if (SIDE_CAN[key] || typeof key !== "string") return;
  if (key.startsWith("sid:")){
    const col = key.slice(4), [c, g] = mkCanvas(64, 64);
    for (let r = 0; r < 4; r++){ const gr = g.createLinearGradient(0, r * 16, 0, r * 16 + 16); gr.addColorStop(0, tint(col, 1.07)); gr.addColorStop(1, tint(col, .9)); g.fillStyle = gr; g.fillRect(0, r * 16, 64, 16); g.fillStyle = tint(col, .62); g.fillRect(0, r * 16 + 14.5, 64, 1.5); }
    speckle(g, 64, 64, 120, [tint(col, .85), tint(col, 1.1)], .25, 1);
    SIDE_CAN[key] = c;
  }
}
function facadeKey(b){
  const B = buildings[b]; if (!B) return 0;
  if (B.facade){ const k = B.facade.startsWith("combo:") ? B.facade.slice(6) : B.facade; ensureFacade(k); return B.facade; }
  return B.kind !== "house" ? "block" : b % SIDING.length;
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
    let k = facadeKey(mat.siding);
    if (typeof k === "string" && k.startsWith("combo:")){
      // brick up to the window sills, siding above: the classic ranch house
      const sid = k.slice(6), zb = 13;
      if (z0 < zb){ ctx.fillStyle = shadedSide("brick", f); ctx.fillRect(u0, z0, u1 - u0, Math.min(z1, zb) - z0); }
      if (z1 > zb){ ctx.fillStyle = shadedSide(sid, f); ctx.fillRect(u0, Math.max(z0, zb), u1 - u0, z1 - Math.max(z0, zb)); }
      if (z0 < zb && z1 > zb){ ctx.fillStyle = shade("#d8d0bc", f); ctx.fillRect(u0, zb - .6, u1 - u0, 1.2); }
    } else { ctx.fillStyle = shadedSide(k, f); ctx.fillRect(u0, z0, u1 - u0, z1 - z0); }
    if (z0 < 2 && z1 > 4){ ctx.fillStyle = shade("#77746c", f); ctx.fillRect(u0, 0, u1 - u0, 3); }
    else if (z0 % WALLH < 1 && z0 > 2){ ctx.fillStyle = shade("#6a685f", f); ctx.fillRect(u0, z0, u1 - u0, 1.6); }
  }
  ctx.globalAlpha = 1;
}

// ---------- pitched roofs ----------
function roofKind(B){
  if (B.roofType) return B.roofType;
  return "flat";
}
function roofGeom(B){
  if (B._rg) return B._rg;
  const faces = [], parts = B.roofParts || [{ x0: B.x0, y0: B.y0, x1: B.x1, y1: B.y1 }], zb = bTop(B), ov = .22;
  let maxZ = zb;
  for (const p of parts){
    const X0 = p.x0 + A_ - ov, X1 = p.x1 + B_ + ov, Y0 = p.y0 + A_ - ov, Y1 = p.y1 + B_ + ov;
    const wx = X1 - X0, wy = Y1 - Y0, alongX = (p.ridge || (wx >= wy ? "x" : "y")) === "x";
    const span = alongX ? wy : wx, steep = B.kind === "church" ? 13 : B.kind === "barn" ? 11 : B.roofType === "hip" ? 6.5 : 8;
    const rise = clamp(span * steep, 14, B.kind === "church" ? 90 : 62), zr = zb + rise; maxZ = Math.max(maxZ, zr);
    p._z = { alongX, rise, zr, X0, X1, Y0, Y1 };
    const ym = (Y0 + Y1) / 2, xm = (X0 + X1) / 2;
    if (B.roofType === "hip"){
      if (alongX){ const d = Math.min(wy / 2, wx / 2 - .01);
        faces.push({ pts: [[X0, Y0, zb], [X1, Y0, zb], [X1 - d, ym, zr], [X0 + d, ym, zr]], n: [0, -1] }, { pts: [[X0, Y0, zb], [X0, Y1, zb], [X0 + d, ym, zr]], n: [-1, 0] },
          { pts: [[X1, Y0, zb], [X1, Y1, zb], [X1 - d, ym, zr]], n: [1, 0] }, { pts: [[X0, Y1, zb], [X1, Y1, zb], [X1 - d, ym, zr], [X0 + d, ym, zr]], n: [0, 1] }); }
      else { const d = Math.min(wx / 2, wy / 2 - .01);
        faces.push({ pts: [[X0, Y0, zb], [X0, Y1, zb], [xm, Y1 - d, zr], [xm, Y0 + d, zr]], n: [-1, 0] }, { pts: [[X0, Y0, zb], [X1, Y0, zb], [xm, Y0 + d, zr]], n: [0, -1] },
          { pts: [[X0, Y1, zb], [X1, Y1, zb], [xm, Y1 - d, zr]], n: [0, 1] }, { pts: [[X1, Y0, zb], [X1, Y1, zb], [xm, Y1 - d, zr], [xm, Y0 + d, zr]], n: [1, 0] }); }
    } else {
      if (alongX){
        faces.push({ pts: [[X0, Y0, zb], [X1, Y0, zb], [X1, ym, zr], [X0, ym, zr]], n: [0, -1] }, { pts: [[X0, Y1, zb], [X1, Y1, zb], [X1, ym, zr], [X0, ym, zr]], n: [0, 1] });
        faces.push({ gable: "E", plane: p.x1 + B_, a: p.y0 + A_, b: p.y1 + B_, m: ym, z: zr - rise * ov / (span / 2) });
      } else {
        faces.push({ pts: [[X0, Y0, zb], [X0, Y1, zb], [xm, Y1, zr], [xm, Y0, zr]], n: [-1, 0] }, { pts: [[X1, Y0, zb], [X1, Y1, zb], [xm, Y1, zr], [xm, Y0, zr]], n: [1, 0] });
        faces.push({ gable: "S", plane: p.y1 + B_, a: p.x0 + A_, b: p.x1 + B_, m: xm, z: zr - rise * ov / (span / 2) });
      }
    }
  }
  // faces turned away from the camera first
  const back = f => f.gable ? 3 : (f.n[0] < 0 || f.n[1] < 0) ? 0 : 1;
  faces.sort((a, c) => back(a) - back(c));
  return B._rg = { faces, zb, maxZ, parts };
}
function roofLift(B, x, y){
  if (!B.roofType || B.roofType === "flat") return 0;
  const g = roofGeom(B);
  for (const p of g.parts){ const z = p._z; if (!z || x < z.X0 || x > z.X1 || y < z.Y0 || y > z.Y1) continue;
    const half = (z.alongX ? z.Y1 - z.Y0 : z.X1 - z.X0) / 2, d = z.alongX ? Math.abs(y - (z.Y0 + z.Y1) / 2) : Math.abs(x - (z.X0 + z.X1) / 2);
    return Math.max(0, z.rise * (1 - d / half)); }
  return 0;
}
const SHADEF = n => n[0] < 0 ? 1.06 : n[1] > 0 ? .94 : n[0] > 0 ? .8 : .72;
function paintRoofFaces(B, b){
  const g = roofGeom(B), base = roofColor(b);
  for (const f of g.faces){
    if (f.gable){
      const isS = f.gable === "S"; isS ? faceTS(f.plane) : faceTE(f.plane);
      ctx.beginPath(); ctx.moveTo(f.a, g.zb); ctx.lineTo(f.b, g.zb); ctx.lineTo(f.m, f.z); ctx.closePath();
      ctx.fillStyle = shadedSide(String(facadeKey(b)).startsWith("combo:") ? String(facadeKey(b)).slice(6) : facadeKey(b), isS ? .92 : .8); ctx.fill();
      ctx.strokeStyle = B.trim || "#efeae0"; ctx.lineWidth = .7; ctx.stroke();
      resetT(); continue;
    }
    const pts = f.pts.map(p => S(p[0], p[1], p[2]));
    poly(pts, shade(base, SHADEF(f.n)));
    // shingle courses parallel to the eave
    ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.lineWidth = Math.max(.6, .8 * zoom); ctx.beginPath();
    const tri = f.pts.length === 3;
    for (let t = .14; t < .99; t += .14){
      const a0 = f.pts[0], a1 = f.pts[1], r0 = tri ? f.pts[2] : f.pts[3], r1 = f.pts[2];
      const P0 = S(a0[0] + (r0[0] - a0[0]) * t, a0[1] + (r0[1] - a0[1]) * t, a0[2] + (r0[2] - a0[2]) * t), P1 = S(a1[0] + (r1[0] - a1[0]) * t, a1[1] + (r1[1] - a1[1]) * t, a1[2] + (r1[2] - a1[2]) * t);
      ctx.moveTo(P0[0], P0[1]); ctx.lineTo(P1[0], P1[1]);
    }
    ctx.stroke();
    // eave edge and ridge cap
    ctx.strokeStyle = shade(base, 1.25); ctx.lineWidth = Math.max(.8, 1.1 * zoom); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.stroke();
    if (!tri){ ctx.strokeStyle = shade(base, .55); ctx.lineWidth = Math.max(1, 1.6 * zoom); ctx.beginPath(); ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); ctx.stroke(); }
  }
}
function roofSprite(b){
  CUR_CACHE.RP = CUR_CACHE.RP || new Map();
  const B = buildings[b], key = b;
  let e = CUR_CACHE.RP.get(key); if (e) return e;
  const g = roofGeom(B), ax = B.x0, ay = B.y0;
  let mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9;
  for (const p of g.parts){ const z = p._z; for (const [x, y] of [[z.X0, z.Y0], [z.X1, z.Y0], [z.X0, z.Y1], [z.X1, z.Y1]]) for (const zz of [g.zb, g.maxZ]){
    const dx = (x - y - (ax - ay)) * hw, dy = (x + y - (ax + ay)) * hh - zz * zoom; mnx = Math.min(mnx, dx); mxx = Math.max(mxx, dx); mny = Math.min(mny, dy); mxy = Math.max(mxy, dy); } }
  mnx -= 4; mny -= 4; mxx += 4; mxy += 4;
  const w = mxx - mnx, h = mxy - mny, c = document.createElement("canvas"); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
  const sv = [ctx, camX, camY, CW, CH];
  ctx = c.getContext("2d"); CW = 0; CH = 0; camX = (ax - ay) * hw + mnx; camY = (ax + ay) * hh + mny;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  try { paintRoofFaces(B, b); } finally { [ctx, camX, camY, CW, CH] = sv; resetT(); }
  e = { c, ox: mnx, oy: mny, w, h };
  CUR_CACHE.RP.set(key, e);
  if (CUR_CACHE.RP.size > 900) CUR_CACHE.RP.delete(CUR_CACHE.RP.keys().next().value);
  return e;
}
function drawPitchedRoofs(myB, pdepth){
  const cutB = RV.mode === "upper" ? RV.b : myB;
  const list = [...VIEWB].filter(b => b !== cutB && buildings[b].roofType && buildings[b].roofType !== "flat").sort((a, c) => (buildings[a].x0 + buildings[a].y1) - (buildings[c].x0 + buildings[c].y1));
  let n = 0;
  for (const b of list){
    const B = buildings[b];
    const fresh = !(CUR_CACHE.RP && CUR_CACHE.RP.has(b));
    if (fresh && n > 14 && performance.now() - FRAME_T0 > 10) continue;
    if (fresh) n++;
    const e = roofSprite(b), [ax, ay] = S(B.x0, B.y0, 0), sx = ax + e.ox, sy = ay + e.oy;
    if (sx > CW || sy > CH || sx + e.w < 0 || sy + e.h < 0) continue;
    let a = 1;
    if (B.x1 + B.y1 + 1 > pdepth + .3 && PSX > sx && PSX < sx + e.w && PSY > sy && PSY < sy + e.h){
      const [wx, wy] = toWorld(PSX, PSY + (bTop(B) + 10) * zoom);
      if (wx > B.x0 - 1.5 && wx < B.x1 + 2.5 && wy > B.y0 - 1.5 && wy < B.y1 + 2.5) a = .28;
    }
    ctx.globalAlpha = a; ctx.drawImage(e.c, sx, sy, e.w, e.h); ctx.globalAlpha = 1;
  }
}

// ---------- house generator: styles, porches, garages, yards ----------
const HOUSE_STYLES = ["ranch", "ranch", "twostory", "cottage", "bungalow", "farmhouse"];
function styleHouse(b, style){
  const B = buildings[b];
  B.style = style;
  const col = pick(HOUSE_COLS, rnd);
  B.facade = style === "ranch" && rnd() < .45 ? "combo:sid:" + col : rnd() < .18 ? pick(["brick", "brown"], rnd) : "sid:" + col;
  if (style === "farmhouse") B.facade = "sid:#e4e2da";
  B.trim = pick(TRIMS, rnd);
  B.shutters = rnd() < .45 ? pick(SHUTTERS, rnd) : "";
  B.roofCol = pick(ROOF_COLS, rnd);
  B.roofType = style === "ranch" ? (rnd() < .55 ? "hip" : "gable") : style === "cottage" ? "gable" : rnd() < .6 ? "gable" : "hip";
  B._rg = null;
}
// cut a corner off a rectangular house to make an L
function carveNotch(b, front){
  const B = buildings[b], w = B.x1 - B.x0 + 1, h = B.y1 - B.y0 + 1;
  if (w < 9 || h < 8) return false;
  const nw = ri(3, Math.min(5, w - 5), rnd), nh = ri(3, Math.min(4, h - 5), rnd), left = rnd() < .5;
  const ny0 = front === "top" ? B.y1 - nh + 1 : B.y0, ny1 = ny0 + nh - 1;   // the back corner
  const nx0 = left ? B.x0 : B.x1 - nw + 1, nx1 = nx0 + nw - 1;
  for (let y = ny0 - 1; y <= ny1 + 1; y++) for (let x = nx0 - 1; x <= nx1 + 1; x++){ const t = tile[ix(x, y)]; if (t === T.DOOR || (objs.get(ix(x, y)) || {}).type === "stairs") return false; }
  if (B.stair && B.stair.x >= nx0 - 1 && B.stair.x <= nx1 + 1 && B.stair.y >= ny0 - 1 && B.stair.y <= ny1 + 1) return false;
  for (let y = ny0; y <= ny1; y++) for (let x = nx0; x <= nx1; x++){ const i = ix(x, y); objs.delete(i); feats.delete(i); tile[i] = T.GRASS; bldId[i] = -1; roomId[i] = -1; }
  const edge = [];
  for (let y = ny0 - 1; y <= ny1 + 1; y++) for (let x = nx0 - 1; x <= nx1 + 1; x++){
    const i = ix(x, y); if (bldId[i] !== b || tile[i] !== T.FLOOR) continue;
    if (x >= nx0 && x <= nx1 && y >= ny0 && y <= ny1) continue;
    tile[i] = T.WALL; roomId[i] = -1; objs.delete(i); edge.push([x, y]);
  }
  for (const r of rooms) if (r.b === b) r.tiles = r.tiles.filter(([x, y]) => tile[ix(x, y)] === T.FLOOR && bldId[ix(x, y)] === b);
  // windows on the new outside walls
  edge.forEach(([x, y], k) => { if (k % 3 === 1){ const fl = [[1,0],[-1,0],[0,1],[0,-1]].find(([dx, dy]) => tile[ix(x + dx, y + dy)] === T.FLOOR); const out = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => tile[ix(x + dx, y + dy)] === T.GRASS);
    if (fl && out && (tile[ix(x - 1, y)] === T.WALL && tile[ix(x + 1, y)] === T.WALL || tile[ix(x, y - 1)] === T.WALL && tile[ix(x, y + 1)] === T.WALL)) setWin(x, y); } });
  // the roof becomes two pieces
  if (front === "top") B.roofParts = [{ x0: B.x0, y0: B.y0, x1: B.x1, y1: ny0 }, left ? { x0: nx1, y0: ny0, x1: B.x1, y1: B.y1 } : { x0: B.x0, y0: ny0, x1: nx0, y1: B.y1 }];
  else B.roofParts = [{ x0: B.x0, y0: ny1, x1: B.x1, y1: B.y1 }, left ? { x0: nx1, y0: B.y0, x1: B.x1, y1: ny1 } : { x0: B.x0, y0: B.y0, x1: nx0, y1: ny1 }];
  B.roofParts[0].ridge = "x"; B.roofParts[1].ridge = "y";
  B._rg = null;
  return true;
}
function frontDoorOf(B){
  const fy = B.front === "top" ? B.y0 : B.y1;
  for (let x = B.x0 + 1; x < B.x1; x++) if (tile[ix(x, fy)] === T.DOOR) return [x, fy];
  return null;
}
function addPorch(B, L){
  const d = frontDoorOf(B); if (!d) return;
  const out = B.front === "top" ? -1 : 1, depth = 2, half = B.style === "farmhouse" || B.style === "bungalow" ? Math.floor((B.x1 - B.x0) / 2) - 1 : 2;
  const px0 = Math.max(B.x0, d[0] - half), px1 = Math.min(B.x1, d[0] + half);
  for (let k = 1; k <= depth; k++) for (let x = px0; x <= px1; x++){
    const y = d[1] + out * k, i = ix(x, y);
    if (!inb(x, y) || tile[i] !== T.GRASS || objs.has(i) || (L && (y < L.ly0 || y > L.ly1))) continue;
    const o = placeObj("porch", x, y, -1); delete o.dir;
    o.edgeL = x === px0; o.edgeR = x === px1; o.edgeF = k === depth; o.out = out; o.roofCol = roofColor(B.id); o.trim = B.trim;
  }
}
function walkway(B, L){
  const d = frontDoorOf(B); if (!d || !L) return;
  const out = B.front === "top" ? -1 : 1;
  for (let y = d[1] + out; inb(d[0], y) && (out < 0 ? y >= L.ly0 - 1 : y <= L.ly1 + 1); y += out){
    const i = ix(d[0], y); if (tile[i] === T.WALK || tile[i] === T.ROAD) break;
    if (tile[i] === T.GRASS || tile[i] === T.TREE){ tile[i] = T.WALK; }
  }
}
function yardClutter(B, L){
  const back = B.front === "top" ? [B.y1 + 1, L.ly1] : [L.ly0, B.y0 - 1];
  const spots = [];
  for (let y = Math.min(...back); y <= Math.max(...back); y++) for (let x = L.lx0 + 1; x <= L.lx1 - 1; x++){ const i = ix(x, y); if (tile[i] === T.GRASS && !objs.has(i) && !nearType(x, y, [T.WALL, T.DOOR, T.WIN], 1)) spots.push([x, y]); }
  const items = ["grill", "lawnchair", "lawnchair", "doghouse", "clothesline", "toy", "gnome", "garden", "garden", "shed"].sort(() => rnd() - .5).slice(0, ri(1, 4, rnd));
  for (const it of items){ if (!spots.length) break; const [x, y] = spots.splice(Math.floor(rnd() * spots.length), 1)[0];
    if (it === "garden"){ for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 3; dx++){ const i = ix(x + dx, y + dy); if (tile[i] === T.GRASS && !objs.has(i)){ tile[i] = T.DIRT; const o = placeObj("garden", x + dx, y + dy, -1); delete o.dir; } } continue; }
    if (it === "shed"){ if (areaFreeSimple(x, y, x + 2, y + 2)){ const sb = genBuilding(x, y, x + 2, y + 2, "shed", B.front === "top" ? "top" : "bottom"); if (sb){ sb.roofType = "gable"; sb.roofCol = B.roofCol; sb.facade = "sid:" + pick(HOUSE_COLS, rnd); } } continue; }
    const o = placeObj(it, x, y, -1); delete o.dir; }
}
function areaFreeSimple(x0, y0, x1, y1){
  for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++){ const i = ix(x, y); if (!inb(x, y) || (tile[i] !== T.GRASS && tile[i] !== T.TREE) || objs.has(i) || bldId[i] >= 0) return false; }
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tile[ix(x, y)] = T.GRASS;
  return true;
}
function garageFor(B, L){
  // a detached garage beside the house with a driveway to the street
  const gw = 4, gh = 6, side = B.x1 + 2 + gw - 1 <= L.lx1 ? "r" : B.x0 - 2 - gw + 1 >= L.lx0 ? "l" : null;
  if (!side) return;
  const gx0 = side === "r" ? B.x1 + 2 : B.x0 - 1 - gw, gy0 = B.front === "top" ? B.y0 : B.y1 - gh + 1;
  if (!areaFreeSimple(gx0, gy0, gx0 + gw - 1, gy0 + gh - 1)) return;
  const g = genBuilding(gx0, gy0, gx0 + gw - 1, gy0 + gh - 1, "garage", B.front);
  if (!g) return;
  g.facade = B.facade; g.roofCol = B.roofCol; g.roofType = "gable"; g.trim = B.trim; g._rg = null;
  // driveway
  const out = B.front === "top" ? -1 : 1, fy = B.front === "top" ? gy0 : gy0 + gh - 1;
  for (let x = gx0 + 1; x <= gx0 + gw - 2; x++) for (let y = fy + out; inb(x, y) && (out < 0 ? y >= L.ly0 - 1 : y <= L.ly1 + 1); y += out){
    const i = ix(x, y); if (tile[i] === T.ROAD || tile[i] === T.WALK) break;
    if (tile[i] === T.GRASS || tile[i] === T.TREE){ tile[i] = T.LOT; objs.delete(i); }
  }
  if (rnd() < .45){ const cx = gx0 + 1, cy = fy + out * 2; if (tile[ix(cx, cy)] === T.LOT && tile[ix(cx, cy + out)] === T.LOT && !objs.has(ix(cx, cy))){ const o = placeObj("car", cx, cy, -1); o.dir = [0, 1]; o.col = pick(["#6b2e2a", "#2f4a5e", "#8a8470", "#3e4a3a", "#9a9a94", "#5a4a3a", "#7a6a2a", "#2a2a2e"], rnd); } }
}
// a house on its lot, in one of several styles
function genLot2(lx0, ly0, lx1, ly1, front, style){
  const lw = lx1 - lx0 + 1, lh = ly1 - ly0 + 1;
  style = style || (lw <= 8 ? "cottage" : pick(HOUSE_STYLES, rnd));
  let hw = style === "cottage" ? Math.min(lw - 1, ri(6, 7, rnd)) : style === "twostory" ? Math.min(lw - 1, ri(9, 10, rnd)) : Math.min(lw - 1, ri(8, 11, rnd));
  const wantGarage = lw >= 12 && rnd() < .75 && style !== "cottage";
  if (wantGarage) hw = Math.min(hw, lw - 6);
  const hh = Math.min(lh - 2, style === "cottage" ? ri(7, 8, rnd) : ri(8, 10, rnd));
  const hx0 = wantGarage ? (rnd() < .5 ? lx0 + 1 : lx1 - hw) : lx0 + Math.floor((lw - hw) / 2);
  const setback = style === "farmhouse" || style === "bungalow" ? 3 : 2;
  const hy0 = front === "top" ? ly0 + Math.min(setback, lh - hh) : ly1 - hh + 1 - Math.min(setback, lh - hh);
  const L = { lx0, ly0, lx1, ly1 };
  LOT_CTX = L; HOUSE_STYLE = style;
  buildHouse(hx0, hy0, hx0 + hw - 1, hy0 + hh - 1, front);
  LOT_CTX = null; HOUSE_STYLE = null;
  const B = buildings[buildings.length - 1]; if (!B || B.kind !== "house") return;
  if (B.floors === 1 && style !== "twostory" && rnd() < .45) carveNotch(B.id, front);
  if (style === "bungalow" || style === "farmhouse" || rnd() < .45) addPorch(B, L);
  walkway(B, L);
  if (wantGarage) garageFor(B, L);
  yardClutter(B, L);
  for (let y = ly0; y <= ly1; y++) for (let x = lx0; x <= lx1; x++) if (tile[ix(x, y)] === T.GRASS && rnd() < .035 && !objs.has(ix(x, y)) && !nearType(x, y, [T.DOOR, T.WIN, T.WALL, T.LOT, T.WALK], 1)) tile[ix(x, y)] = T.TREE;
}
let HOUSE_STYLE = null;
// a street of houses: lots of varying width on both sides of the block
function houseBlock(x0, y0, x1, y1){
  const midy = Math.floor((y0 + y1) / 2), W2 = x1 - x0 + 1;
  for (const [ya, yb, fr] of [[y0, midy - 1, "top"], [midy + 1, y1, "bottom"]]){
    const cuts = pick([[11, 12], [7, 8, 8], [12, 11], [8, 7, 8], [23], [10, 13], [13, 10], [12, 11], [11, 12]], rnd);
    let x = x0;
    for (const cw of cuts){ const xe = Math.min(x1, x + cw - 1); if (xe - x >= 5){ if (cw >= 23) genLot2(x, ya, xe, yb, fr, pick(["farmhouse", "twostory", "bungalow"], rnd)); else genLot2(x, ya, xe, yb, fr); } x = xe + 1; }
  }
  // back fences between the two rows, now and then
  if (rnd() < .5) for (let x = x0; x <= x1; x++){ const i = ix(x, midy); if (tile[i] === T.GRASS && !objs.has(i)){ const o = placeObj(rnd() < .5 ? "fencew" : "fence", x, midy, -1); o.dir = null; o.horiz = true; } }
}

// ---------- yard things, porches, garage doors, canopies ----------
Object.assign(OBJ, {
  porch: { n: "Porch", block: false, h: 40, col: "#7a5c3c" }, grill: { n: "Barbecue grill", block: true, h: 14, col: "#2a2a2a" },
  lawnchair: { n: "Lawn chair", block: true, h: 8, col: "#3a7a5a", seat: true }, doghouse: { n: "Doghouse", block: true, h: 14, col: "#8a5a3a" },
  clothesline: { n: "Clothesline", block: false, h: 26, col: "#8a8a8a" }, toy: { n: "Bicycle", block: false, h: 6, col: "#c83a3a" },
  gnome: { n: "Garden gnome", block: false, h: 5, col: "#c83a3a" }, garden: { n: "Vegetable patch", block: false, h: 5, col: "#4a7a3a" },
});
Object.assign(SPEC, { shed: { min: 9, rooms: ["storageunit"], win: 0, doors: 1, lock: .3 } });
Object.assign(FLOORS, { diner: [1, 1, 2], cornerstore: [1, 2], video: [1, 2], liquor: [1, 2], laundromat: [1, 2], sports: [1, 2], hardware: [1, 1, 2], pharmacy: [1, 1, 2] });
for (const k of ["diner", "bar", "bookstore", "clothing", "cornerstore", "video", "liquor", "laundromat", "sports", "hardware", "pharmacy"]) UPPER[k] = ["living", "bedroom", "kitchen", "bathroom", "bedroom"];
function drawDecor2(o, dim, a){
  const x = o.x, y = o.y, sd = c => shade(c, dim), cx = x + .5, cy = y + .5;
  switch (o.type){
    case "porch": {
      topR(x, y, x + 1, y + 1, 2, sd("#7a5c3c"), a);
      if (zoom >= .72) for (let k = 1; k < 4; k++) line3([x + k * .25, y, 2.05], [x + k * .25, y + 1, 2.05], sd("#5a4028"), .6, a);
      const fy = o.out < 0 ? y : y + 1;
      const posts = []; if (o.edgeF){ if (o.edgeL) posts.push([x + .08, fy]); if (o.edgeR) posts.push([x + .92, fy]); if (!o.edgeL && !o.edgeR && (x % 2 === 0)) posts.push([cx, fy]); }
      for (const [px, py] of posts) boxW(px - .05, py - .05, px + .05, py + .05, 2, 38, sd(o.trim || "#efeae0"), a);
      if (o.edgeF) line3([x, fy, 14], [x + 1, fy, 14], sd(o.trim || "#efeae0"), 1.4, a);
      boxW(x - .02, y - .02, x + 1.02, y + 1.02, 38, 40, sd(o.roofCol || "#4a3c36"), a);
      return true;
    }
    case "grill": line3([x + .35, cy, 0], [x + .45, cy, 9], sd("#222"), 1, a); line3([x + .65, cy, 0], [x + .55, cy, 9], sd("#222"), 1, a); topEl(cx, cy, .2, 10, sd("#1a1a1a"), a); topEl(cx, cy, .2, 13, sd("#2a2a2a"), a, .14); return true;
    case "lawnchair": boxW(x + .25, y + .3, x + .75, y + .7, 4, 5, sd("#3a7a5a"), a); boxW(x + .25, y + .26, x + .75, y + .32, 5, 11, sd("#3a7a5a"), a); for (const u of [.28, .72]) line3([x + u, y + .32, 0], [x + u, y + .68, 4], sd("#aaa"), .8, a); return true;
    case "doghouse": boxW(x + .15, y + .2, x + .85, y + .8, 0, 9, sd("#8a5a3a"), a); poly([S(x + .1, y + .15, 9), S(x + .9, y + .15, 9), S(cx, y + .15, 15)], sd("#5a3a2a"), a); poly([S(x + .1, y + .85, 9), S(x + .9, y + .85, 9), S(cx, y + .85, 15), S(cx, y + .15, 15)], sd("#6a4a34"), a); { const [sx, sy] = S(cx, y + .8, 4); ctx.globalAlpha = a; ctx.fillStyle = "#1a1410"; ctx.beginPath(); ctx.ellipse(sx, sy, 2.4 * zoom, 3 * zoom, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; } return true;
    case "clothesline": line3([x + .05, cy, 0], [x + .05, cy, 24], sd("#7a7a7a"), 1.2, a); line3([x + .95, cy, 0], [x + .95, cy, 24], sd("#7a7a7a"), 1.2, a); line3([x + .05, cy, 23], [x + .95, cy, 23], sd("#ccc"), .6, a);
      for (let k = 0; k < 3; k++) boxW(x + .15 + k * .26, cy - .02, x + .33 + k * .26, cy + .02, 15, 23, ["#e8e4dc", "#7a9ac8", "#c86a6a"][(k + x) % 3], a); return true;
    case "toy": { const c = sd(["#c83a3a", "#3a6ac8", "#e8b030"][x % 3]); topEl(x + .3, cy, .14, 3, "#222", a); topEl(x + .7, cy, .14, 3, "#222", a); line3([x + .3, cy, 3], [x + .55, cy, 6], c, 1.4, a); line3([x + .55, cy, 6], [x + .7, cy, 3], c, 1.4, a); return true; }
    case "gnome": boxW(x + .44, y + .44, x + .56, y + .56, 0, 3, sd("#3a5ac8"), a); poly([S(x + .43, cy, 3), S(x + .57, cy, 3), S(cx, cy, 7)], sd("#c83a3a"), a); return true;
    case "garden": for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) topEl(x + .2 + k * .3, y + .2 + r * .3, .09, 3 + hash(x + k, y + r) * 2, sd(["#4a7a3a", "#5a8a3a", "#6a9a4a"][(r + k) % 3]), a); return true;
  }
  return drawDecor3(o, dim, a);
}
function drawCanopy(o, dim, a){
  const x = o.x, y = o.y;
  for (const [px, py] of [[x + .5, y - .5], [x + .5, y + 1.5]]) line3([px, py, 0], [px, py, 38], shade("#d8d4c8", dim), 2.2, a);
  boxW(x - 1, y - .9, x + 2, y + 1.9, 38, 40.5, shade("#c8302a", dim), a, shade("#e8e4dc", dim));
}
function drawGarageDoor(bx, by, f, dim, H, trimTop, mats){
  const hz = f.horiz, pc = hz ? { u0: 0, v0: A_, u1: 1, v1: B_ } : { u0: A_, v0: 0, u1: B_, v1: 1 }, [mS, mE] = mats(pc);
  slab(bx, by, pc.u0, pc.v0, pc.u1, pc.v1, 34, H, mS, mE, trimTop, dim, 1, hz, !hz);
  if (!f.open && !f.broken){
    const r = hz ? [bx, by + .5 - .04, bx + 1, by + .5 + .04] : [bx + .5 - .04, by, bx + .5 + .04, by + 1];
    boxW(r[0], r[1], r[2], r[3], 0, 34, shade("#dcd8cc", dim), 1);
    for (let z = 6; z < 34; z += 6) hz ? line3([bx, by + .55, z], [bx + 1, by + .55, z], shade("#a8a49a", dim), .8, 1) : line3([bx + .55, by, z], [bx + .55, by + 1, z], shade("#a8a49a", dim), .8, 1);
  }
}
