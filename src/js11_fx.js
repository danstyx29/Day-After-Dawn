// ============================================================
// Part 11: combat feel. Aim assist, hit flash, stagger, hit-stop,
// camera shake, blood spray and small unobtrusive hit/miss tags.
// ============================================================
function fxInit(){ if (!G.fx){ G.fx = []; G.parts = []; G.hitstop = 0; G.shake = 0; G.hurt = 0; } }
function fxText(x, y, text, col, big){ fxInit(); G.fx.push({ x, y, text, col, t: 0, life: big ? 1.1 : .8, big }); if (G.fx.length > 30) G.fx.shift(); }
function fxBlood(x, y, n, dirA){
  fxInit();
  for (let i = 0; i < n; i++){
    const a = dirA + rf(-.9, .9), sp = rf(1.2, 3.2);
    G.parts.push({ x, y, h: rf(14, 26), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vh: rf(10, 40), t: 0 });
  }
  if (G.parts.length > 200) G.parts.splice(0, G.parts.length - 200);
}
function fxHit(z, crit, kill){
  fxInit();
  z.flash = .13; z.stun = Math.max(z.stun || 0, kill ? 0 : .32);
  G.hitstop = crit || kill ? .085 : .05;
  G.shake = Math.max(G.shake, crit ? 5 : 2.6);
  fxBlood(z.x, z.y, crit ? 10 : 5, Math.atan2(z.y - P.y, z.x - P.x));
  if (crit) fxText(z.x, z.y, "critical", "#f0c860", true);
}

// the swing lands: pick the zombie you were clearly aiming at, generously
function resolveSwing(){
  const it = P.weapon; if (!it) return;
  const w = ITEMS[it.id], reach = w.range + .45;
  const cand = Z.filter(z => z.alive && Math.hypot(z.x - P.x, z.y - P.y) < reach + (z.down > 0 ? .15 : 0) && reachClear(P.x, P.y, z.x, z.y));
  // aim assist: snap to the nearest zombie roughly in front of you
  let best = null, bs = 1e9;
  for (const z of cand){
    const ad = angDiff(Math.atan2(z.y - P.y, z.x - P.x), P.face);
    if (ad > 1.1) continue;
    const sc = Math.hypot(z.x - P.x, z.y - P.y) + ad * 1.2;
    if (sc < bs){ bs = sc; best = z; }
  }
  if (best) P.face = Math.atan2(best.y - P.y, best.x - P.x);
  const targets = cand.filter(z => angDiff(Math.atan2(z.y - P.y, z.x - P.x), P.face) < (z.down > 0 ? 1.2 : 1.0))
    .sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y));
  const hits = CFG.multiHit ? targets.slice(0, 3) : targets.slice(0, 1);
  noise(P.x, P.y, hits.length ? 6 : 3);
  if (!hits.length){ swingAnimals(w, reach); return; }
  for (const z of hits){
    const sk = skill(w.skill);
    const chance = z.down > 0 || z.fake ? .97 : clamp(.9 + sk * .015 - P.panic / 400 - (G.vit.winded >= 3 ? .12 : 0), .55, .98);
    if (R() > chance){ fxText(z.x, z.y, "miss", "#c9c6bb"); continue; }
    const rear = angDiff(z.face, Math.atan2(P.y - z.y, P.x - z.x)) > 1.8;
    let dmg = rf(w.dmg[0], w.dmg[1]) * (1 + 0.1 * sk) * dmgMult();
    const crit = R() < (w.crit + sk * 0.03) * (rear ? 3 : 1);
    if (crit) dmg *= 2.2;
    if (z.down > 0) dmg *= 1.5;
    z.hp -= dmg; z.lunge = 0; z.fake = false;
    if (z.state !== "chase"){ z.state = "chase"; z.mem = CFG.zMemory; }
    sfx.hit(crit);
    addBlood(z.x, z.y, crit ? 3 : 1);
    const kill = z.hp <= 0;
    fxHit(z, crit, kill);
    if (kill) killZombie(z, w.skill);
    else if (z.down <= 0 && R() < w.kd + skill("strength") * 0.03 + (crit ? 0.3 : 0)){ z.down = rf(2.4, 4.2); if (!crit) fxText(z.x, z.y, "down", "#d6f2c4"); }
    else { const a = Math.atan2(z.y - P.y, z.x - P.x); moveEnt(z, Math.cos(a) * 0.35, Math.sin(a) * 0.35, "z", 0.26); z.atkCd = Math.max(z.atkCd, 0.7); }
    addXP(w.skill, 2.5); addXP("strength", 0.4);
    if (R() < 1 / (2 + w.cond / 8)){
      it.cond--;
      if (it.cond <= 0){ say(`Your ${w.n.toLowerCase()} breaks.`, "#ff9a8a"); removeItem(it); P.weapon = null; sfx.thump(0.8); fxText(P.x, P.y, "broken", "#ff9a8a", true); break; }
    }
  }
}

// per-frame update and drawing of effects (real time, unaffected by fast forward)
function fxUpdate(dt){
  if (!G || !G.fx) return;
  for (const f of G.fx) f.t += dt;
  G.fx = G.fx.filter(f => f.t < f.life);
  for (const p of G.parts){
    p.t += dt; p.x += p.vx * dt * .5; p.y += p.vy * dt * .5; p.vh -= 120 * dt; p.h += p.vh * dt;
    if (p.h <= 0){ p.dead = true; if (R() < .5) G.blood.push({ x: p.x, y: p.y, r: rf(1.5, 3.5), a: rf(0, 6) }); }
  }
  G.parts = G.parts.filter(p => !p.dead);
  G.shake = Math.max(0, G.shake - dt * 30);
  G.hurt = Math.max(0, G.hurt - dt * 1.6);
  for (const z of Z) if (z.flash > 0) z.flash -= dt;
}
function drawFx(){
  if (!G.fx) return;
  ctx.fillStyle = "#7a120c";
  for (const p of G.parts){ const [sx, sy] = S(p.x, p.y, p.h); ctx.fillRect(sx - 1.2 * zoom, sy - 1.2 * zoom, 2.4 * zoom, 2.4 * zoom); }
  ctx.textAlign = "center";
  for (const f of G.fx){
    const k = f.t / f.life, [sx, sy] = S(f.x, f.y, 44 + k * 18);
    ctx.globalAlpha = k < .15 ? k / .15 : 1 - Math.max(0, (k - .5) / .5);
    ctx.font = `${Math.round((f.big ? 20 : 16) * Math.sqrt(zoom))}px VT323, monospace`;
    ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillText(f.text, sx + 1, sy + 1);
    ctx.fillStyle = f.col; ctx.fillText(f.text, sx, sy);
  }
  ctx.globalAlpha = 1;
  if (G.hurt > 0){
    const g = ctx.createRadialGradient(CW / 2, CH / 2, Math.min(CW, CH) * .35, CW / 2, CH / 2, Math.max(CW, CH) * .7);
    g.addColorStop(0, "rgba(160,0,0,0)"); g.addColorStop(1, `rgba(160,0,0,${.45 * G.hurt})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  }
}
