// ============================================================
// Part 51 (1.12): the living environment.
// Footprints in snow and mud (yours and theirs), dust kicked up running
// on dry ground, leaves falling in autumn, fireflies on summer nights,
// flocks of birds crossing the sky.
// ============================================================
const ENV = { prints: [], dust: [], leaves: [], flies: [], birds: [], birdT: 20, dustT: 0 };
const outdoorT = (x, y) => { const i = ix(x | 0, y | 0); return bldId[i] < 0 && tile[i] !== T.WATER && tile[i] !== T.FLOOR; };
function stepEnv(dt){
  if (!G.running) return;
  const snowy = (G.snow || 0) > .3, muddy = (G.wet || 0) > .35;
  if (snowy || muddy){
    const leave = (e, who) => {
      const t = tile[ix(e.x | 0, e.y | 0)]; if (!outdoorT(e.x, e.y)) return;
      if (!snowy && t !== T.DIRT && t !== T.GRASS && t !== T.SAND) return;
      const lx = e._px ?? e.x, ly = e._py ?? e.y; if (Math.hypot(e.x - lx, e.y - ly) < .55) return;
      e._px = e.x; e._py = e.y; e._pk = !e._pk;
      const f = Math.atan2(e.y - ly, e.x - lx), side = e._pk ? 1 : -1;
      ENV.prints.push({ x: e.x - Math.sin(f) * .09 * side, y: e.y + Math.cos(f) * .09 * side, f, t: G.min, snow: snowy, z: who === "z" });
      if (ENV.prints.length > 320) ENV.prints.shift();
    };
    if (!P.car && P.moving) leave(P, "p");
    for (const z of Z) if (z.alive && !z.fake && z.down <= 0 && Math.abs(z.x - P.x) < 22 && Math.abs(z.y - P.y) < 22 && (z.mv || 0) > .02) leave(z, "z");
  }
  // dust when running on dry dirt, gravel or sand
  ENV.dustT -= dt;
  if (P.running && P.moving && !P.car && !muddy && ENV.dustT <= 0){ const t = tile[ix(P.x | 0, P.y | 0)]; if (t === T.DIRT || t === T.GRAVEL || t === T.SAND){ ENV.dustT = .22; ENV.dust.push({ x: P.x + rf(-.1, .1), y: P.y + rf(-.1, .1), t: 0 }); } }
  for (const d of ENV.dust) d.t += dt; ENV.dust = ENV.dust.filter(d => d.t < .7);
  // falling leaves in autumn
  if (QUALITY === 2 && seasonKey() === "autumn" && !indoorsNow()){
    if (ENV.leaves.length < 16 && R() < dt * 3){ const x = (P.x | 0) + ri(-10, 10), y = (P.y | 0) + ri(-10, 10); if (tile[ix(x, y)] === T.TREE) ENV.leaves.push({ x: x + .5, y: y + .5, z: 38 + rf(0, 14), vx: rf(-.2, .2) + windNow() * .3, vy: rf(-.1, .2), ph: rf(0, 6), col: pick(["#c8742a", "#a85a22", "#d8a040", "#8a5a2a"]), rest: 0 }); }
    for (const l of ENV.leaves){ if (l.z > 0){ l.z -= dt * 9; l.x += (l.vx + Math.sin(G.simT * 2 + l.ph) * .25) * dt; l.y += l.vy * dt; } else l.rest += dt; }
    ENV.leaves = ENV.leaves.filter(l => l.rest < 12);
  } else ENV.leaves.length = 0;
  // fireflies on summer nights
  if (QUALITY === 2 && seasonKey() === "summer" && isNight() && !G.rain && !indoorsNow()){
    while (ENV.flies.length < 18){ const x = P.x + rf(-11, 11), y = P.y + rf(-11, 11), t = tile[ix(x | 0, y | 0)]; ENV.flies.push({ x, y, z: rf(4, 18), ph: rf(0, 6), ok: t === T.GRASS || t === T.TREE }); }
    for (const f of ENV.flies){ f.x += Math.sin(G.simT * .4 + f.ph) * dt * .3; f.y += Math.cos(G.simT * .33 + f.ph * 1.7) * dt * .3; if (Math.abs(f.x - P.x) > 13 || Math.abs(f.y - P.y) > 13){ f.x = P.x + rf(-11, 11); f.y = P.y + rf(-11, 11); f.ok = [T.GRASS, T.TREE].includes(tile[ix(f.x | 0, f.y | 0)]); } }
  } else ENV.flies.length = 0;
  // birds crossing the sky by day
  ENV.birdT -= dt;
  if (QUALITY === 2 && ENV.birdT <= 0 && !isNight() && !G.rain && !RV.inPocket){
    ENV.birdT = rf(45, 110); const n = ri(5, 9), y0 = rf(.08, .45) * CH, dir = R() < .5 ? 1 : -1;
    for (let k = 0; k < n; k++) ENV.birds.push({ x: dir > 0 ? -40 - k * 14 : CW + 40 + k * 14, y: y0 + Math.abs(k - n / 2) * 9 + rf(-3, 3), vx: dir * rf(95, 115), vy: rf(-6, 6), ph: rf(0, 6) });
    if (typeof animalCall === "function" && R() < .5) { /* a distant call */ }
  }
  for (const b of ENV.birds){ b.x += b.vx * dt; b.y += b.vy * dt; }
  ENV.birds = ENV.birds.filter(b => b.x > -200 && b.x < CW + 200);
}
function drawPrints(){
  if (!ENV.prints.length || RV.inPocket) return;
  for (const p of ENV.prints){
    const age = G.min - p.t, life = p.snow ? 45 : 120; if (age > life || Math.abs(p.x - P.x) > 30 || Math.abs(p.y - P.y) > 30) continue;
    const a = (1 - age / life) * (p.snow ? .5 : .35), [sx, sy] = S(p.x, p.y, 0);
    ctx.fillStyle = p.snow ? `rgba(120,132,150,${a})` : `rgba(38,28,18,${a})`;
    ctx.beginPath(); ctx.ellipse(sx, sy, 2.2 * zoom, 1.3 * zoom, Math.atan2(Math.sin(p.f) * hh, Math.cos(p.f) * hw), 0, 7); ctx.fill();
  }
}
function drawEnvLow(){
  for (const d of ENV.dust){ const [sx, sy] = S(d.x, d.y, 2 + d.t * 8), r = (3 + d.t * 16) * zoom; ctx.fillStyle = `rgba(150,130,100,${.28 * (1 - d.t / .7)})`; ctx.beginPath(); ctx.ellipse(sx, sy, r, r * .6, 0, 0, 7); ctx.fill(); }
}
function drawEnvHigh(){
  for (const l of ENV.leaves){ const [sx, sy] = S(l.x, l.y, Math.max(0, l.z)), s = 2.2 * zoom; ctx.save(); ctx.translate(sx, sy); ctx.rotate(G.simT * 3 + l.ph); ctx.globalAlpha = l.rest > 9 ? (12 - l.rest) / 3 : 1; ctx.fillStyle = l.col; ctx.fillRect(-s, -s * .5, s * 2, s); ctx.restore(); }
  if (ENV.birds.length){ ctx.strokeStyle = "rgba(24,24,28,.8)"; ctx.lineWidth = 1.4; for (const b of ENV.birds){ const fl = Math.sin(G.simT * 10 + b.ph) * 4; ctx.beginPath(); ctx.moveTo(b.x - 6, b.y - fl); ctx.lineTo(b.x, b.y); ctx.lineTo(b.x + 6, b.y - fl); ctx.stroke(); } }
}
function drawFireflies(){
  for (const f of ENV.flies){
    if (!f.ok) continue; const glow = Math.max(0, Math.sin(G.simT * 1.6 + f.ph * 3)); if (glow < .2) continue;
    const [sx, sy] = S(f.x, f.y, f.z), r = 6 * zoom * glow, g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, `rgba(235,255,140,${.9 * glow})`); g.addColorStop(1, "rgba(235,255,140,0)"); ctx.fillStyle = g; ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
  }
}
