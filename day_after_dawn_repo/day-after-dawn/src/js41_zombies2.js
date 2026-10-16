// ============================================================
// Part 41: zombie behaviour, round two.
//  - Nobody hits through walls: a blow has to reach. Walls, closed
//    doors and windows, tall fences and tall furniture stop it. Low
//    picket fences don't: zombies lunge across them (the original's
//    fence lunge).
//  - A chaser that can't reach you walks the path and smashes the
//    window or door instead of pressing into the wall beside it.
//  - Memory as in the original: about 6 seconds without sight, then it
//    goes to where you actually were (and a step the way you were
//    heading), thumps any door or window in the way, and looks around.
//  - Sieges: once a zombie starts on a door it keeps going until the
//    door breaks, a new noise draws it off, or about four minutes pass.
//    Several can work on one door at once.
//  - Doors, windows and barricades as tough as the original's: one
//    zombie needs a few minutes for a door, ten-odd seconds for a
//    window, about a minute per barricade plank.
//  - Lunges: climbing through a window or over a fence with a zombie
//    right there can get you grabbed.
//  - Sight by day matches the original (about 18 tiles).
// ============================================================
CFG.zSightDay = 18; CFG.zSightNight = 6; CFG.zMemory = 6;
const ZMEM = 6, DOOR_HP = 150, WIN_HP = 10, PLANK_HP = 50, METAL_HP = 300;
const REACH_TALL = new Set(["woodwall", "woodwall2", "logwall", "metalwall", "fencew", "fenceiron", "wardrobe", "bookcase", "fridge", "locker", "vending", "gunlocker", "pshelf", "shelf", "filecab", "boiler", "pantry", "kiln", "statue"]);
// can an arm get from a to b?
function reachClear(x0, y0, x1, y1){
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.ceil(d / .09));
  for (let k = 1; k < n; k++){
    const t = k / n; if (t * d < .1 || (1 - t) * d < .1) continue;
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, tx = Math.floor(x), ty = Math.floor(y), i = ix(tx, ty), tt = tile[i];
    if (tt === T.WALL){ const rs = shapeRects(tx, ty, "p"); if (rs) for (const r of rs) if (x > r[0] && x < r[2] && y > r[1] && y < r[3]) return false; }
    else if (tt === T.DOOR || tt === T.WIN){
      const f = feats.get(i); if (!f) continue;
      const shut = f.type === "door" ? !f.open || f.bar > 0 : !(f.open || f.broken) || f.bar > 0 || f.iron;
      if (shut){ const r = slabRect(f); if (x > r[0] - .02 && x < r[2] + .02 && y > r[1] - .02 && y < r[3] + .02) return false; }
    }
    const o = objs.get(i);
    if (o && OBJ[o.type].block && !o.open && REACH_TALL.has(o.type)){ const r = OBJ[o.type].fence ? fenceRects(o) : [objRect(o)]; for (const q of r) if (x > q[0] && x < q[2] && y > q[1] && y < q[3]) return false; }
  }
  return true;
}
// where you were going when they lost you
let PVX = 0, PVY = 0, pvx0 = null, pvy0 = null;
function trackPlayerHeading(dt){
  if (pvx0 !== null && dt > 0){ const vx = (P.x - pvx0) / dt, vy = (P.y - pvy0) / dt, s = Math.hypot(vx, vy); if (s > .3){ PVX = vx / s; PVY = vy / s; } }
  pvx0 = P.x; pvy0 = P.y;
}
function chaseUpkeep(z, dt){
  if (z.state !== "chase") return;
  // keep the last sighting fresh when it can still see you
  z.visT = (z.visT || 0) - dt;
  if (z.visT <= 0){
    z.visT = .25;
    const d = Math.hypot(P.x - z.x, P.y - z.y), same = realXY(z.x, z.y).lvl === realXY(P.x, P.y).lvl;
    if (same && d < zSightRange() * 1.15 && los(z.x, z.y, P.x, P.y)){ z.seenT = 0; z.lsx = P.x; z.lsy = P.y; z.lvx = PVX; z.lvy = PVY; z.mem = ZMEM; }
    else z.seenT = (z.seenT || 0) + .25;
  }
  if ((z.seenT || 0) > ZMEM && z.lsx !== undefined) loseTrack(z);
  z.herdT = (z.herdT ?? rf(1, 4)) - dt;
  if (z.herdT <= 0){ z.herdT = rf(3, 6); G.sounds.push({ x: z.x, y: z.y, r: 5.5, t: G.simT, herd: true }); }
}
function loseTrack(z){
  const lx = z.lsx ?? P.x, ly = z.lsy ?? P.y;
  z.state = "investigate"; z.tx = lx + (z.lvx || 0) * 1.5; z.ty = ly + (z.lvy || 0) * 1.5; z.invT = 0;
  z.searchT = rf(8, 15); z.scx = z.tx; z.scy = z.ty; z.aware = .3; z.stuckT = 0; z.mem = 0;
}
// after the main zombie step: sieges, searching, giving up
function stepZombies2(dt){
  trackPlayerHeading(dt);
  for (const z of Z){
    if (!z.alive) continue;
    const far = Math.abs(z.x - P.x) > 44 || Math.abs(z.y - P.y) > 44;
    // out of range: it has lost you, it doesn't stay locked on until you come back
    if (far){ if (z.state === "chase") loseTrack(z); continue; }
    if (z.state === "investigate"){
      z.invT = (z.invT || 0) + dt;
      const bashing = z.bashAt && G.simT - z.bashAt < .8;
      if (bashing) z.siegeT = (z.siegeT || 0) + dt;
      if ((z.siegeT || 0) > 240 || (!bashing && z.invT > 90)){ z.state = "idle"; z.siegeT = 0; z.searchT = 0; }
    } else z.siegeT = 0;
    // looking around where it lost you
    if (z.searchT > 0 && (z.state === "idle" || z.state === "wander")){
      z.searchT -= dt;
      if (z.state === "idle" || Math.hypot(z.tx - z.x, z.ty - z.y) < .7){ z.state = "wander"; z.tx = (z.scx ?? z.x) + rf(-4, 4); z.ty = (z.scy ?? z.y) + rf(-4, 4); z.stuckT = 0; }
      if (z.searchT <= 0) z.state = "idle";
    }
  }
}
// one zombie at the front isn't the only one allowed to bash: anyone close to the door joins in
const nearFeat = (z, nx, ny) => Math.hypot(z.x - (nx + .5), z.y - (ny + .5)) < .98;
// grabbed while climbing
function lungeGrab(cx, cy){
  cx = cx ?? P.x; cy = cy ?? P.y;
  for (const z of Z){
    if (!z.alive || z.down > 0 || z.fake || (z.state !== "chase" && (z.aware || 0) < .35)) continue;
    const d = Math.hypot(z.x - cx, z.y - cy); if (d > 1.4 || !reachClear(z.x, z.y, cx, cy)) continue;
    if (R() < .35){ say("A hand closes around your leg!", "#ff9a8a"); P.stagger = .5; z.face = Math.atan2(P.y - z.y, P.x - z.x); zombieHits(z); return true; }
  }
  return false;
}
// a round through a closed window takes the glass with it
function bulletGlass(wx, wy){
  const i = ix(wx | 0, wy | 0); if (tile[i] !== T.WIN) return;
  const f = feats.get(i); if (!f || f.broken || f.open || f.bar > 0) return;
  f.broken = true; f.glass = true; noise(wx, wy, 12); if (typeof sfxGlass === "function") sfxGlass(.7);
}
// curtains hang inside: reach them from indoors, or through an open or broken window
function curtainReach(f){
  if (f.open || f.broken) return true;
  const [sx, sy] = sideTile(P.x, P.y);
  return tile[ix(sx, sy)] === T.FLOOR && bldId[ix(sx, sy)] === bldId[ix(f.x, f.y)];
}
// fences join up at corners
const FENCEISH = new Set(["fence", "fencew", "fenceiron"]);
function fenceArms(o){
  const nb = (dx, dy) => { const q = objs.get(ix(o.x + dx, o.y + dy)); return q && FENCEISH.has(q.type) ? q : null; };
  const hzOf = q => q.horiz !== false, me = hzOf(o);
  const E = nb(1, 0), Wn = nb(-1, 0), S2 = nb(0, 1), N = nb(0, -1);
  // join sideways only to fences that run that way, so parallel lines next to each other don't sprout rungs
  const arms = { e: !!(E && hzOf(E)), w: !!(Wn && hzOf(Wn)), s: !!(S2 && !hzOf(S2)), nn: !!(N && !hzOf(N)) };
  const perp = me ? (arms.s || arms.nn) : (arms.e || arms.w);
  // along its own line a fence spans the whole tile, unless that end turns a corner
  if (me){ if (!perp){ arms.e = arms.w = true; } }
  else { if (!perp){ arms.s = arms.nn = true; } }
  if (!arms.e && !arms.w && !arms.s && !arms.nn){ if (me) arms.e = arms.w = true; else arms.s = arms.nn = true; }
  return arms;
}
function fenceRects(o){
  const a = fenceArms(o), x = o.x, y = o.y, r = [];
  if (a.w) r.push([x, y + .42, x + .58, y + .58]); if (a.e) r.push([x + .42, y + .42, x + 1, y + .58]);
  if (a.nn) r.push([x + .42, y, x + .58, y + .58]); if (a.s) r.push([x + .42, y + .42, x + .58, y + 1]);
  return r;
}
function drawFenceJ(o, dim, a){
  const arms = fenceArms(o), x = o.x, y = o.y, cx = x + .5, cy = y + .5, sd = c => shade(c, dim);
  const kind = o.type, col = sd(kind === "fence" ? "#e8e4dc" : kind === "fencew" ? "#7a5a3a" : "#1e1e20"), ht = kind === "fence" ? 12 : kind === "fencew" ? 22 : 16;
  const segs = []; if (arms.w) segs.push([x, cy, cx, cy]); if (arms.e) segs.push([cx, cy, x + 1, cy]); if (arms.nn) segs.push([cx, y, cx, cy]); if (arms.s) segs.push([cx, cy, cx, y + 1]);
  for (const [x0, y0, x1, y1] of segs){
    const hz = y0 === y1;
    if (kind === "fencew"){ hz ? boxW(Math.min(x0, x1), cy - .04, Math.max(x0, x1), cy + .04, 0, ht, col, a) : boxW(cx - .04, Math.min(y0, y1), cx + .04, Math.max(y0, y1), 0, ht, col, a); continue; }
    if (kind === "fence"){ for (let k = 0; k < 2; k++){ const u = .06 + k * .25; hz ? boxW(Math.min(x0, x1) + u, cy - .03, Math.min(x0, x1) + u + .1, cy + .03, 0, ht, col, a) : boxW(cx - .03, Math.min(y0, y1) + u, cx + .03, Math.min(y0, y1) + u + .1, 0, ht, col, a); } }
    else { for (let k = 0; k < 3; k++){ const u = .08 + k * .17; hz ? line3([Math.min(x0, x1) + u, cy, 0], [Math.min(x0, x1) + u, cy, ht], col, 1, a) : line3([cx, Math.min(y0, y1) + u, 0], [cx, Math.min(y0, y1) + u, ht], col, 1, a); } }
    for (const h of kind === "fence" ? [4, 9] : [ht - 2]) line3([x0, y0, h], [x1, y1, h], col, 1.2, a);
  }
  if (segs.length > 1 || (arms.e !== arms.w) || (arms.s !== arms.nn)) boxW(cx - .04, cy - .04, cx + .04, cy + .04, 0, ht + 1, col, a);
}
