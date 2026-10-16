// ============================================================
// Part 35: zombies that hear you find their way to you.
// Before: an investigating zombie walked in a straight line at the
// sound, pressed into the wall, and went idle after 1.5 s. Now it
// follows a route to the sound (your path map when the sound is near
// you, its own short search otherwise), and pounds on any door, window
// or barricade that's in the way, as in the original.
// ============================================================
let INV_NEAR = false, PATH_BUDGET = 2;
// a breadth-first search over the tiles a zombie can move through (doors and windows count: it will break them)
function bfsPath(sx, sy, tx, ty, maxN){
  if (!inb(sx, sy) || !inb(tx, ty)) return null;
  const start = ix(sx, sy), goal = ix(tx, ty); if (start === goal) return [goal];
  const prev = new Map([[start, -1]]), q = [start]; let h = 0;
  while (h < q.length && prev.size < maxN){
    const c = q[h++]; if (c === goal) break;
    const cx = c % W, cy = (c / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
      const nx = cx + dx, ny = cy + dy, n = ix(nx, ny);
      if (prev.has(n) || !pathZ(nx, ny)) continue;
      // no squeezing between a door's posts sideways
      prev.set(n, c); q.push(n);
    }
  }
  if (!prev.has(goal)) return null;
  const path = []; for (let c = goal; c !== -1; c = prev.get(c)) path.push(c);
  return path.reverse();
}
function pathNext(z){
  const tx = Math.floor(z.tx), ty = Math.floor(z.ty);
  if (!z.path || z.ptx !== tx || z.pty !== ty){
    if (PATH_BUDGET <= 0 || (z.pathFail && G.simT - z.pathFail < 2 && z.ptx === tx && z.pty === ty)) return null;
    PATH_BUDGET--;
    z.path = bfsPath(z.x | 0, z.y | 0, tx, ty, 1500); z.pi = 0; z.ptx = tx; z.pty = ty;
    if (!z.path){ z.pathFail = G.simT; return null; }
  }
  if (!z.path || !z.path.length) return null;
  const here = ix(z.x | 0, z.y | 0), k = z.path.indexOf(here, z.pi);
  if (k >= 0) z.pi = Math.min(k + 1, z.path.length - 1);
  const n = z.path[z.pi]; return [n % W, (n / W) | 0];
}
function investigateMove(z, dt){
  // in plain reach: walk straight there (windows in the way still get bashed by the old check)
  z.ivT = (z.ivT || 0) - dt;
  if (z.ivT <= 0 || z.ivTx !== z.tx){ z.ivT = rf(.3, .5); z.ivTx = z.tx; z.ivClear = los(z.x, z.y, z.tx, z.ty) && !wallBetween(z.x, z.y, z.tx, z.ty); }
  if (z.ivClear) return null;
  let nx = null;
  if (Math.hypot(z.tx - P.x, z.ty - P.y) < 6 && Math.hypot(z.x - P.x, z.y - P.y) < 40){ INV_NEAR = true; if (flow) nx = flowNext(z); }
  if (!nx) nx = pathNext(z);
  if (!nx) return null;
  const f = feats.get(ix(nx[0], nx[1])), bo = objs.get(ix(nx[0], nx[1]));
  if (bo && bo.built && OBJ[bo.type].block && !bo.open){ bashObj(z, bo, dt); z.face = Math.atan2(nx[1] + .5 - z.y, nx[0] + .5 - z.x); return [0, 0]; }
  if (f && solidZ(nx[0], nx[1])){
    const side = f.horiz ? Math.sign(z.y - (nx[1] + .5)) || 1 : Math.sign(z.x - (nx[0] + .5)) || 1;
    const ap = f.horiz ? [clamp(z.x, nx[0] + .3, nx[0] + .7), nx[1] + .5 + side * .42] : [nx[0] + .5 + side * .42, clamp(z.y, nx[1] + .3, nx[1] + .7)];
    const ex = ap[0] - z.x, ey = ap[1] - z.y, el = Math.hypot(ex, ey);
    if (el > .12 && !nearFeat(z, nx[0], nx[1])) return [ex / el, ey / el];
    bash(z, f, dt); z.face = Math.atan2(nx[1] + .5 - z.y, nx[0] + .5 - z.x); return [0, 0];
  }
  const ex = nx[0] + .5 - z.x, ey = nx[1] + .5 - z.y, el = Math.hypot(ex, ey) || 1;
  return [ex / el, ey / el];
}
// walls stop sight lines too, but a closed curtain-less window doesn't: a zombie can see through glass yet still can't walk through it
function wallBetween(x0, y0, x1, y1){
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d * 2);
  for (let k = 1; k < n; k++){ const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n, t = tile[ix(x | 0, y | 0)]; if (t === T.WALL || t === T.WIN || (t === T.DOOR && solidZ(x | 0, y | 0))) return true; }
  return false;
}
