// ============================================================
// Part 39: atmosphere. Small things that make the place feel lived
// in and then abandoned: flies over the dead, trees moving in the
// wind, wet streets and puddles, dust in the light, flickering
// street lamps, warm windows at night, the sounds of animals,
// owls, distant dogs and a house settling around you.
// ============================================================
// ---------- animal voices ----------
function animalCall(a, type){
  if (!audInit() || AUD.muted) return;
  const s = spatial(a.x, a.y, type === "moo" ? 30 : 20); if (!s) return;
  const d = chain(s.pan, s.vol * .5, s.muffle);
  switch (type){
    case "moo": { const f = rf(95, 125); otone(d, f, f * .8, 1.3, .35, "sawtooth"); otone(d, f * 2, f * 1.6, 1.2, .08, "sawtooth"); nburst(d, 1.1, 500, 3, .08, "bandpass"); break; }
    case "oink": for (let k = 0; k < 2; k++){ otone(d, 260, 200, .14, .25, "square", k * .2); nburst(d, .12, 900, 4, .2, "bandpass", k * .2); } break;
    case "baa": { const f = rf(280, 340); for (let k = 0; k < 4; k++) otone(d, f * (1 + (k % 2) * .06), f, .16, .14, "sawtooth", k * .13); break; }
    case "cluck": for (let k = 0; k < ri(2, 4); k++){ otone(d, rf(600, 800), 500, .06, .15, "square", k * .12); } break;
    case "snort": nburst(d, .25, 800, 1, .5, "bandpass", 0, 300); break;
    case "flap": for (let k = 0; k < 6; k++) nburst(d, .05, 1200, .8, .35, "bandpass", k * .06); otone(d, 620, 480, .2, .1, "sawtooth", .1); break;
  }
}
// ---------- flies over the dead ----------
function drawFlies(){
  if (QUALITY === 0) return;
  const t = G.simT; let near = false;
  for (const c of G.corpses){
    if (G.min - (c.t || 0) < 720 || Math.abs(c.x - P.x) > 22 || Math.abs(c.y - P.y) > 22 || c.y >= PK_Y0) continue;
    if (!G.vis[ix(c.x | 0, c.y | 0)]) continue;
    if (Math.hypot(c.x - P.x, c.y - P.y) < 4) near = true;
    ctx.fillStyle = "rgba(20,20,20,.8)";
    for (let k = 0; k < 5; k++){ const an = t * (2.5 + k * .4) + k * 1.7, r = .25 + (k % 3) * .08, [fx, fy] = S(c.x + Math.cos(an) * r, c.y + Math.sin(an) * r, 8 + Math.sin(t * 3 + k) * 4); ctx.fillRect(fx, fy, Math.max(1, zoom * 1.2), Math.max(1, zoom * 1.2)); }
  }
  AUD.flyT = (AUD.flyT || 0) - RDT;
  if (near && AUD.flyT <= 0 && audInit() && !AUD.muted){ AUD.flyT = rf(.8, 1.6); const d = chain(rf(-.3, .3), .12); otone(d, rf(180, 240), rf(200, 260), .9, .06, "sawtooth"); }
}
// ---------- trees move with the wind ----------
const windNow = () => (G.stormy ? 1 : G.rain ? .6 : .25) + .15 * Math.sin(G.simT * .23);
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
  const [sx, sy] = S(tx + .5, ty + .5, 0), near = QUALITY === 2 && zoom >= .7 && Math.abs(tx - P.x) < 15 && Math.abs(ty - P.y) < 15, k = near ? windNow() * Math.sin(G.simT * 1.3 + tx * .7 + ty * .4) * .06 : 0;
  ctx.globalAlpha = a;
  if (Math.abs(k) > .004){ ctx.save(); ctx.translate(sx, sy); ctx.transform(1, 0, -k, 1, 0, 0); ctx.drawImage(c, -w / 2 - pad, -top * zoom - pad, w + pad * 2, h); ctx.restore(); }
  else ctx.drawImage(c, sx - w / 2 - pad, sy - top * zoom - pad, w + pad * 2, h);
  ctx.globalAlpha = 1;
}
// ---------- wet streets, puddles and splashes ----------
let SPLASH = [];
function stepWet(dt){
  const outside = !indoorsNow();
  G.wet = clamp((G.wet || 0) + (G.rain ? dt * .02 : -dt * .0035 * (G.snow > .2 ? 0 : 1)), 0, 1);
  if (G.rain && outside && !P.car && SPLASH.length < 40) for (let k = 0; k < 2; k++) SPLASH.push({ x: P.x + rf(-9, 9), y: P.y + rf(-9, 9), t: 0 });
  for (const s of SPLASH) s.t += dt; SPLASH = SPLASH.filter(s => s.t < .35);
}
function drawWet(x0, x1, y0, y1){
  const wet = G.wet || 0; if (wet < .03 || RV.inPocket) return;
  // the ground darkens and takes on the sky
  ctx.fillStyle = `rgba(16,24,34,${.16 * wet})`; ctx.fillRect(0, 0, CW, CH);
  ctx.lineWidth = Math.max(1, zoom);
  const PR = QUALITY === 2 ? (zoom < .8 ? 16 : 20) : 10, hl = zoom >= .8 && QUALITY === 2;
  if (QUALITY === 0){ ctx.fillStyle = `rgba(16,24,34,${.16 * wet})`; ctx.fillRect(0, 0, CW, CH); return; }
  for (let ty = Math.max(y0, (P.y | 0) - PR); ty <= Math.min(y1, (P.y | 0) + PR); ty++) for (let tx = Math.max(x0, (P.x | 0) - PR); tx <= Math.min(x1, (P.x | 0) + PR); tx++){
    const i = ix(tx, ty), t = tile[i]; if (t !== T.ROAD && t !== T.LOT && t !== T.WALK && t !== T.DIRT && t !== T.GRAVEL) continue;
    const hh0 = hash(tx * 13, ty * 7); if (hh0 > .1 * wet + .015) continue;
    const ox = hash(tx, ty * 3), oy = hash(tx * 5, ty), [sx, sy] = S(tx + ox * .6 + .2, ty + oy * .6 + .2, 0), r = (5 + hh0 * 50) * zoom * Math.min(1, wet * 1.5);
    ctx.fillStyle = `rgba(40,52,66,${.45 * wet})`; ctx.beginPath(); ctx.ellipse(sx, sy, r, r * .5, 0, 0, 7); ctx.fill();
    if (hl){ ctx.strokeStyle = `rgba(190,210,225,${.18 * wet})`; ctx.beginPath(); ctx.ellipse(sx - r * .2, sy - r * .1, r * .55, r * .22, 0, 3.6, 5.6); ctx.stroke(); }
  }
  if (G.rain) for (const s of SPLASH){ const i = ix(s.x | 0, s.y | 0); if (tile[i] === T.FLOOR || tile[i] === T.WALL) continue; const [sx, sy] = S(s.x, s.y, 0), r = (1 + s.t * 14) * zoom; ctx.strokeStyle = `rgba(200,215,230,${.5 * (1 - s.t / .35)})`; ctx.beginPath(); ctx.ellipse(sx, sy, r, r * .5, 0, 0, 7); ctx.stroke(); }
}
// ---------- dust in the light indoors ----------
function drawMotes(){
  if (QUALITY < 2) return;
  if (!indoorsNow() || darknessBase() > .3 || RV.inPocket) return;
  ctx.fillStyle = "rgba(255,245,220,.35)";
  for (let k = 0; k < 16; k++){ const ph = G.simT * .08 + k * 1.3, x = P.x + Math.sin(ph * 1.7 + k) * 3.5, y = P.y + Math.cos(ph * 1.3 + k * 2) * 3.5, [sx, sy] = S(x, y, 12 + Math.sin(ph * 2 + k) * 10); ctx.fillRect(sx, sy, Math.max(1, zoom), Math.max(1, zoom)); }
}
// ---------- street lamps: some flicker ----------
function lampFlick(o){ const h = hash(o.x * 7, o.y * 11); if (h > .1) return 1; const t = G.simT * (6 + h * 30); return Math.sin(t) + Math.sin(t * 2.3) > 1.2 ? .15 : 1; }
// ---------- warm windows spill light outside at night ----------
let WINLIT = [], winLitT = 0;
function windowSpill(){
  if (QUALITY === 0){ WINLIT = []; return; }
  if (!isNight() || RV.inPocket){ WINLIT = []; return; }
  winLitT -= RDT; if (winLitT <= 0){ winLitT = .6; WINLIT = [];
    for (let y = (P.y | 0) - 26; y <= (P.y | 0) + 26; y++) for (let x = (P.x | 0) - 26; x <= (P.x | 0) + 26; x++){
      const i = ix(x, y); if (tile[i] !== T.WIN) continue; const f = feats.get(i), b = bldId[i]; if (!f || b < 0 || f.curtain && !f.broken) continue;
      const B = buildings[b]; if (B.lightsOff || !powerOn(x, y)) continue;
      if (!((B.kind === "house" && hash(b, 3) < .35) || b === PLAYER_B)) continue;
      const out = f.horiz ? (bldId[ix(x, y + 1)] === b ? [x + .5, y - .2] : [x + .5, y + 1.2]) : (bldId[ix(x + 1, y)] === b ? [x - .2, y + .5] : [x + 1.2, y + .5]);
      WINLIT.push(out);
    } }
  for (const [x, y] of WINLIT){ const [sx, sy] = S(x, y, 2); if (sx > -100 && sx < CW + 100 && sy > -100 && sy < CH + 100) LIGHTS.push([sx, sy, 1.5, "255,200,140"]); }
}
// ---------- soft shadow where walls meet the ground ----------
function aoBand(bx, by, pieces){
  for (const pc of pieces){
    const e = .14, pts = [[pc.u0 - e, pc.v0 - e], [pc.u1 + e, pc.v0 - e], [pc.u1 + e, pc.v1 + e], [pc.u0 - e, pc.v1 + e]].map(([u, v]) => S(bx + clamp(u, 0, 1), by + clamp(v, 0, 1), 0));
    poly(pts, "rgba(10,12,10,.16)", 1);
  }
}
// ---------- night and indoor sounds ----------
const AMX = { owlT: 20, dogT: 30, creakT: 15, humT: 0, buzzT: 0 };
function ambienceExtra(dt){
  if (!audInit() || AUD.muted || !G.running) return;
  const hr = (G.min / 60) % 24, night = hr > 20.5 || hr < 5, inside = indoorsNow(), days = daysSurvived();
  AMX.owlT -= dt; AMX.dogT -= dt; AMX.creakT -= dt; AMX.humT -= dt; AMX.buzzT -= dt;
  if (night && !G.rain && AMX.owlT <= 0){ AMX.owlT = rf(25, 70); const d = chain(rf(-.8, .8), inside ? .05 : .12, inside); for (const [f, dl] of [[420, 0], [400, .45], [410, .8]]) otone(d, f, f * .92, .35, .25, "sine", dl); }
  if (days < 20 && AMX.dogT <= 0){ AMX.dogT = rf(40, 120) * (1 + days / 6); const d = chain(rf(-1, 1), .08, true); for (let k = 0; k < ri(2, 4); k++){ nburst(d, .12, 900, 2, .5, "bandpass", k * .3); otone(d, 520, 300, .12, .2, "sawtooth", k * .3); } }
  if (inside && night && AMX.creakT <= 0){ AMX.creakT = rf(18, 50); const d = chain(rf(-.6, .6), .06); otone(d, rf(160, 260), rf(120, 200), .6, .05, "sawtooth"); }
  // a fridge humming in a house with power
  if (inside && powerOn(P.x, P.y) && AMX.humT <= 0){ AMX.humT = 2.2; for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++){ const o = objs.get(ix((P.x | 0) + dx, (P.y | 0) + dy)); if (o && o.type === "fridge"){ const d = chain(0, .03 * (1 - Math.hypot(dx, dy) / 6)); otone(d, 60, 60, 2.3, .4, "sine"); otone(d, 120, 120, 2.3, .15, "sine"); dy = 9; break; } } }
  // street lamps buzz
  if (night && !inside && AMX.buzzT <= 0){ AMX.buzzT = 1.5; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++){ const o = objs.get(ix((P.x | 0) + dx, (P.y | 0) + dy)); if (o && o.type === "lamp" && powerOn(o.x, o.y)){ const d = chain(0, .02); otone(d, 120, 120, 1.5, .5, "square"); dy = 9; break; } } }
}
function stepAtmos(dt){ stepWet(dt); }
