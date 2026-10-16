// ============================================================
// Part 53 (1.13): performance.
//  1. Grading in one cheap layer. The frame used up to six full-screen
//     "advanced" blends (soft-light, saturation, screen), each of which makes
//     a graphics card copy the whole screen first. They're folded into one
//     ordinary translucent layer plus the vignette.
//  2. The night light map is drawn at half resolution (lights are soft, so it
//     doesn't show) - a quarter of the pixels.
//  3. Automatic resolution: if frames stay slow, the internal resolution drops
//     a step; when they're smooth again it comes back up.
//  4. Zombie streaming: zombies far from you that aren't chasing you are
//     stored with their part of the map and come back when you return, as in
//     the original. The live list no longer grows with everywhere you've been.
//  5. Lookups: buildings by map area and rooms by building, instead of
//     scanning the whole world; the calendar is worked out once per game day.
// ============================================================
// ---------- 5. lookups ----------
const BGRID = new Map(); let BGRID_N = 0;
function indexBuildings(){ for (; BGRID_N < buildings.length; BGRID_N++){ const B = buildings[BGRID_N]; if (!B || B.x0 === undefined || B.y1 >= PK_Y0) continue; for (let cy = B.y0 >> 5; cy <= B.y1 >> 5; cy++) for (let cx = B.x0 >> 5; cx <= B.x1 >> 5; cx++){ const k = cx * 4096 + cy; (BGRID.get(k) || BGRID.set(k, []).get(k)).push(B); } } }
function buildingsNear(x0, x1, y0, y1){
  indexBuildings(); const out = new Set();
  for (let cy = (y0 - 12) >> 5; cy <= (y1 + 4) >> 5; cy++) for (let cx = (x0 - 16) >> 5; cx <= (x1 + 4) >> 5; cx++){ const l = BGRID.get(cx * 4096 + cy); if (l) for (const B of l) out.add(B); }
  return out;
}
const ROOMB = new Map(); let ROOMB_N = 0;
function roomsOf(b){ for (; ROOMB_N < rooms.length; ROOMB_N++){ const r = rooms[ROOMB_N]; if (!r) continue; (ROOMB.get(r.b) || ROOMB.set(r.b, []).get(r.b)).push(r); } return ROOMB.get(b) || []; }
function resetPerfIndex(){ BGRID.clear(); BGRID_N = 0; ROOMB.clear(); ROOMB_N = 0; if (typeof LT !== "undefined"){ LT.exp.clear(); LT.shadowKey = null; } }
let DOY = { d: -1, v: 0 };
function dayOfYear(){ const day = Math.floor(G.min / 1440); if (DOY.d !== day){ const d = new Date(1993, 6, 14 + day - CFG.startDay); DOY = { d: day, v: (d - new Date(1993, 0, 0)) / 864e5 }; } return DOY.v; }
// ---------- 4. zombie streaming ----------
const ZFROZEN = new Map(); let zfT = 1;
function frozenList(){ const out = []; for (const l of ZFROZEN.values()) for (const z of l) out.push(z); return out; }
function stepZStream(dt){
  zfT -= dt; if (zfT > 0) return; zfT = 2;
  const pr = realXY(P.x, P.y), FAR = 150, NEAR = 125, keep = [];
  for (const z of Z){
    if (z.alive && z.y < PK_Y0 && z.state !== "chase" && Math.max(Math.abs(z.x - pr.x), Math.abs(z.y - pr.y)) > FAR){
      const k = Math.floor(z.x / REG) * 4096 + Math.floor(z.y / REG); (ZFROZEN.get(k) || ZFROZEN.set(k, []).get(k)).push(z);
    } else if (z.alive || (z.deadAt ?? G.simT) > G.simT - 30) keep.push(z);
  }
  for (const [k, list] of ZFROZEN){
    const cx = Math.floor(k / 4096) * REG + REG / 2, cy = (k % 4096) * REG + REG / 2;
    if (Math.max(Math.abs(cx - pr.x), Math.abs(cy - pr.y)) < NEAR + REG / 2){ for (const z of list) keep.push(z); ZFROZEN.delete(k); }
  }
  Z = keep;
}
// ---------- 1. grading in one layer ----------
const over = (a, c) => { // composite colour c=[r,g,b,al] over accumulated a
  const al = c[3] + a[3] * (1 - c[3]); if (al <= 0) return [0, 0, 0, 0];
  return [(c[0] * c[3] + a[0] * a[3] * (1 - c[3])) / al, (c[1] * c[3] + a[1] * a[3] * (1 - c[3])) / al, (c[2] * c[3] + a[2] * a[3] * (1 - c[3])) / al, al];
};
const parseRGBA = s => { const m = s.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/); return m ? [+m[1], +m[2], +m[3], +m[4]] : null; };
function skyGrade(){
  // works out the time-of-day tint; gradeFrame draws everything in one pass
  const h = (G.min % 1440) / 60, w = winterness(), sr = 6.4 + 1.5 * w, ss = 20.8 - 3.2 * w;
  const dawn = bump(h, sr + .2, 1.4), golden = bump(h, ss - .9, 1.5), blue = bump(h, ss + .9, 1.1), night = (h > ss + 1.2 || h < sr - 1) ? 1 : 0, cov = G.rain ? .45 : 1;
  const t = [];
  if (dawn > 0) t.push([255, 160, 135, .09 * dawn * cov]);
  if (golden > 0) t.push([255, 160, 70, .12 * golden * cov]);
  if (blue > 0) t.push([70, 90, 190, .12 * blue]);
  if (night) t.push([60, 85, 165, .09]);
  LT.sky = t;
}
function gradeFrame(){
  if (QUALITY === 0){ LT.rg = null; return; }
  let acc = [0, 0, 0, 0];
  if (LT.rg){ const c = parseRGBA(LT.rg); if (c){ c[3] = Math.min(1, c[3] * 1.1); acc = over(acc, c); } }
  for (const c of LT.sky || []) acc = over(acc, c);
  if (QUALITY === 2) acc = over(acc, [118, 122, 98, .1 + (G.rain ? .06 : 0) + (G.fog || 0) * .06]);
  else acc = over(acc, [60, 66, 50, .08]);
  if (acc[3] > .005){ ctx.fillStyle = `rgba(${acc[0] | 0},${acc[1] | 0},${acc[2] | 0},${acc[3].toFixed(3)})`; ctx.fillRect(0, 0, CW, CH); }
  if (!VIGN || VIGN.w !== CW || VIGN.h !== CH){
    const c = document.createElement("canvas"); c.width = Math.ceil(CW / 2); c.height = Math.ceil(CH / 2); const g = c.getContext("2d");
    const gr = g.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * .35, c.width / 2, c.height / 2, Math.max(c.width, c.height) * .72);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(6,8,6,.38)"); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); VIGN = { c, w: CW, h: CH };
  }
  ctx.drawImage(VIGN.c, 0, 0, CW, CH);
  LT.rg = null;
}
function drawAdapt(){
  const A = LT.adapt; if (P.car) return;
  if (A.extra > .01){ ctx.fillStyle = `rgba(2,3,6,${A.extra})`; ctx.fillRect(0, 0, CW, CH); }
  if (A.glare > .01){ ctx.fillStyle = `rgba(255,250,235,${A.glare * .6})`; ctx.fillRect(0, 0, CW, CH); }
}
// ---------- 3. automatic resolution ----------
const PERF = { ft: 20, slowT: 0, fastT: 0, step: 0 }, RS_STEPS = [1.5, 1.25, 1, .85, .7];
function perfTick(){
  if (window.QFIXRES) return;
  const ms = Math.min(250, RDT * 1000); PERF.ft += (ms - PERF.ft) * .06;
  if (PERF.ft > 31){ PERF.slowT += RDT; PERF.fastT = 0; } else if (PERF.ft < 18){ PERF.fastT += RDT; PERF.slowT = Math.max(0, PERF.slowT - RDT); } else { PERF.slowT = Math.max(0, PERF.slowT - RDT * .5); PERF.fastT = 0; }
  const native = Math.min(window.devicePixelRatio || 1, 1.5);
  if (PERF.slowT > 2.5 && PERF.step < RS_STEPS.length - 1){ do PERF.step++; while (PERF.step < RS_STEPS.length - 1 && RS_STEPS[PERF.step] >= native); applyRS(); }
  else if (PERF.fastT > 12 && PERF.step > 0 && RS_STEPS[PERF.step] < native){ PERF.step--; applyRS(); }
}
function applyRS(){ window.__rs = RS_STEPS[PERF.step]; PERF.slowT = 0; PERF.fastT = 0; resize(); if (typeof invalidateGround === "function") invalidateGround(); }
