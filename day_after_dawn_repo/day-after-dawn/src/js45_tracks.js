// Part 45 (1.9.2, polished 1.9.5): Tracking. In search mode (V) you see the tracks animals left in the
// last half day: hoofprint pairs pointing the way they went, fading with age. The Tracking skill widens
// how far you can read them and grows while you follow fresh tracks.
SKILLS.tracking = { n: "Tracking", grp: "Survival" };
let trackT = 0;
const trackRange = () => 8 + skill("tracking") * 2;
function stepTracks(dt){
  trackT -= dt; if (trackT > 0) return; trackT = .5;
  let near = 0;
  for (const a of AN){
    if (a.dead || a.gone || a.fly || SPECIES[a.sp].cosmetic || Math.abs(a.x - P.x) > 60 || Math.abs(a.y - P.y) > 60) continue;
    a.trail = a.trail || []; const l = a.trail[a.trail.length - 1];
    if (!l || Math.hypot(l[0] - a.x, l[1] - a.y) > .6){ a.trail.push([a.x, a.y, G.min, a.face]); if (a.trail.length > 20) a.trail.shift(); }
    if (G.search) for (const [x, y, t] of a.trail) if (G.min - t < 720 && Math.hypot(x - P.x, y - P.y) < trackRange()){ near++; break; }
  }
  if (near && P.alive) addXP("tracking", .04 * Math.min(3, near));
}
function drawTracks(){
  if (!G.search || RV.inPocket) return 0;
  const range = trackRange(); let n = 0;
  for (const a of AN){
    if (!a.trail) continue; const big = a.sp === "deer" || a.sp === "cow" || a.sp === "pig", s = (big ? 3.4 : 2) * zoom;
    for (const [x, y, t, f] of a.trail){
      const age = G.min - t; if (age > 720 || Math.hypot(x - P.x, y - P.y) > range || !G.vis[ix(x | 0, y | 0)]) continue;
      const c = Math.cos(f || 0), sn = Math.sin(f || 0), px = -sn * .09, py = c * .09;
      const al = .9 * (1 - age / 900);
      for (const k of [-1, 1]){ const [sx, sy] = S(x + px * k + c * .05 * k, y + py * k + sn * .05 * k, 0); ctx.fillStyle = `rgba(200,172,120,${al})`; ctx.beginPath(); ctx.ellipse(sx, sy, s, s * .55, 0, 0, 7); ctx.fill(); ctx.fillStyle = `rgba(52,36,22,${al})`; ctx.beginPath(); ctx.ellipse(sx, sy, s * .5, s * .28, 0, 0, 7); ctx.fill(); }
      n++;
    }
  }
  return n;
}
