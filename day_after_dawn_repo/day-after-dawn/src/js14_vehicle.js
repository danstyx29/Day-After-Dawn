// ============================================================
// Part 14: vehicles. Keys or hotwiring, fuel, condition, crashes,
// running zombies down, engine noise, headlights, trunks, siphoning.
// ============================================================
let V = [], VEH_SKIP = null;
const CAR_L = .95, CAR_W = .43;

function initVehicles(){
  V = [];
  for (const [i, o] of [...objs]) if (o.type === "car"){
    objs.delete(i);
    const a = o.dir && o.dir[0] ? (R() < .5 ? 0 : Math.PI) : (R() < .5 ? Math.PI / 2 : -Math.PI / 2);
    V.push({ x: o.x + .5, y: o.y + .5, a, v: 0, col: o.col, fuel: rf(.05, .7), cond: ri(35, 95), locked: R() < .5, key: R() < .25, on: false, hot: false, broken: false, trunk: null, nT: 0 });
  }
}
function carLocal(c, x, y){ const dx = x - c.x, dy = y - c.y, ca = Math.cos(c.a), sa = Math.sin(c.a); return [dx * ca + dy * sa, -dx * sa + dy * ca]; }
function carPoint(c, u, w){ const ca = Math.cos(c.a), sa = Math.sin(c.a); return [c.x + ca * u - sa * w, c.y + sa * u + ca * w]; }
function vehHit(x, y, r){
  for (const c of V){
    if (c === VEH_SKIP || Math.abs(c.x - x) > 1.7 || Math.abs(c.y - y) > 1.7) continue;
    const [u, w] = carLocal(c, x, y), cu = clamp(u, -CAR_L, CAR_L), cw = clamp(w, -CAR_W, CAR_W);
    if ((u - cu) ** 2 + (w - cw) ** 2 < r * r) return true;
  }
  return false;
}
function carBlocked(c, x, y, a){
  const sv = [c.x, c.y, c.a]; c.x = x; c.y = y; c.a = a; VEH_SKIP = c;
  let hit = false;
  for (const u of [-CAR_L, 0, CAR_L]) for (const w of [-CAR_W, CAR_W]){ const [px, py] = carPoint(c, u, w); if (collides(px, py, .1, "p")){ hit = true; break; } }
  VEH_SKIP = null; [c.x, c.y, c.a] = sv;
  return hit;
}
function nearestCar(maxD){
  let best = null, bd = maxD;
  for (const c of V){
    const [u, w] = carLocal(c, P.x, P.y), d = Math.hypot(u - clamp(u, -CAR_L, CAR_L), w - clamp(w, -CAR_W, CAR_W));
    if (d < bd){ bd = d; best = c; }
  }
  return best;
}
function rollTrunk(c){ if (!c.trunk){ const o = {}; rollLoot(o, "trunk"); c.trunk = o.items; } return c.trunk; }

// ---------- getting in and out ----------
function enterCar(c){
  act("Getting in", .8, () => {
    P.car = c; P.sneaking = false; cancelAimState();
    say(c.key ? "The keys are still in the ignition." : c.hot ? "The wires are still twisted together." : "No keys. You could try to hotwire it.");
  });
}
function cancelAimState(){ P.swing = null; P.aiming = false; }
function exitCar(){
  const c = P.car; if (!c) return;
  if (Math.abs(c.v) > 1.5) return say("Not at this speed.");
  for (const [u, w] of [[0, -(CAR_W + .45)], [0, CAR_W + .45], [-(CAR_L + .45), 0], [CAR_L + .45, 0]]){
    const [px, py] = carPoint(c, u, w);
    if (!collides(px, py, .27, "p")){ P.car = null; P.x = px; P.y = py; c.v = 0; noise(c.x, c.y, 4); return; }
  }
  say("There's no room to open the door.");
}
function vehOptions(out){
  if (P.car){
    const c = P.car;
    out.length = 0;
    out.push({ label: "Get out", fn: exitCar });
    if (c.on) out.push({ label: "Turn off the engine", fn: () => { c.on = false; } });
    else if (c.key || c.hot) out.push({ label: "Start the engine", off: c.fuel <= 0 || c.cond <= 0, fn: () => {
      act("Starting", .9, () => { if (c.fuel <= 0) return say("Out of gas."); if (R() < (c.cond < 30 ? .5 : .05)) return say("It coughs and won't catch. Try again.");
        c.on = true; noise(c.x, c.y, 20); sfx.thump(.5); say("The engine turns over."); }); } });
    else out.push({ label: P.occ === "burglar" ? "Hotwire it (you know how)" : "Try to hotwire it", fn: () => act("Hotwiring", 5, () => {
      if (P.occ === "burglar" || R() < .22 + skill("mechanics") * .08){ c.hot = true; say("Sparks, then the dash lights up."); addXP("mechanics", 8); }
      else { say("Nothing. Wrong wires."); addXP("mechanics", 3); } }, { noise: 4, noiseEvery: 2 }) });
    out.push({ label: `Check the gauges`, fn: () => say(`Fuel ${Math.round(c.fuel * 100)}%, condition ${Math.round(c.cond)}%.`) });
    return;
  }
  const c = nearestCar(1.0); if (!c) return;
  if (c.locked){
    out.push({ label: "The car is locked", off: true });
    out.push({ label: "Smash a window to get in", fn: () => act("Smashing the window", 1.2, () => { c.locked = false; c.broken = true; sfx.glass(1); noise(c.x, c.y, 18); }) });
  } else out.push({ label: "Get in the driver's seat", fn: () => enterCar(c) });
  const [u] = carLocal(c, P.x, P.y);
  if (!c.locked && u < -.3) out.push({ label: "Open the trunk", fn: openInv });
  const can = allCarried().find(it => it.id === "gascan");
  if (can && c.fuel > 0 && can.fuel < 1) out.push({ label: "Siphon gas into your gas can", fn: () => act("Siphoning", 6, () => {
    const moved = Math.min(c.fuel, (1 - can.fuel) * .4); c.fuel -= moved; can.fuel += moved / .4; say(`You siphon off ${Math.round(moved * 100)}% of a tank.`); }) });
  if (can && can.fuel > 0 && c.fuel < 1) out.push({ label: "Pour your gas can into the tank", fn: () => act("Refuelling", 5, () => {
    const moved = Math.min(can.fuel * .4, 1 - c.fuel); c.fuel += moved; can.fuel -= moved / .4; say(`Tank now at ${Math.round(c.fuel * 100)}%.`); }) });
  out.push({ label: "Look the car over", fn: () => say(`Looks like ${c.cond > 70 ? "it runs well" : c.cond > 35 ? "it's seen better days" : "it's barely holding together"}. ${c.key ? "Keys in the ignition." : "No keys."}`) });
}

// ---------- driving ----------
function driveStep(dt){
  const c = P.car;
  let thr = 0, steer = 0;
  if (c.on){ if (keys.w) thr = 1; if (keys.s) thr = -1; }
  if (keys.a) steer = -1; if (keys.d) steer = 1;
  const maxF = 12 * carPerf(c);
  if (thr > 0) c.v += (c.v < 0 ? 10 : 5.5) * dt;
  else if (thr < 0) c.v -= (c.v > 0 ? 10 * brakeF(c) : 4) * dt;
  else c.v -= Math.sign(c.v) * Math.min(Math.abs(c.v), 2.4 * dt);
  if (keys[" "]) c.v -= Math.sign(c.v) * Math.min(Math.abs(c.v), 14 * brakeF(c) * dt);
  c.v = clamp(c.v, -4, maxF);
  const na = c.a + steer * dt * 1.9 * steerF(c) * clamp(c.v / 4, -1, 1);
  const nx = c.x + Math.cos(na) * c.v * dt, ny = c.y + Math.sin(na) * c.v * dt;
  if (carBlocked(c, nx, ny, na)){
    const imp = Math.abs(c.v);
    if (imp > 2.5){
      sfx.thump(Math.min(1, imp / 8)); noise(c.x, c.y, 22); c.cond = Math.max(0, c.cond - imp * 2.2);
      fxInit(); G.shake = Math.min(9, imp);
      if (imp > 6.5){ addWound(pick(["head", "torso_u", "farm_l", "farm_r", "hand_l", "thigh_r"]), imp > 9.5 ? "laceration" : "scratch", false); P.health -= imp * 1.5; G.hurt = 1; say("You slam into it hard.", "#ff9a8a"); }
      if (c.cond <= 0){ c.on = false; say("Something under the hood gives out. It won't run now."); }
    }
    c.v = -c.v * .25;
  } else { c.x = nx; c.y = ny; c.a = na; }
  // running zombies down
  for (const z of Z){
    if (!z.alive || Math.abs(z.x - c.x) > 1.6 || Math.abs(z.y - c.y) > 1.6) continue;
    const [u, w] = carLocal(c, z.x, z.y);
    if (Math.abs(u) > CAR_L + .25 || Math.abs(w) > CAR_W + .25) continue;
    const sp = Math.abs(c.v);
    if (sp > 1.5 && !(z.carHit > G.simT)){
      z.carHit = G.simT + .6;
      c.cond = Math.max(0, c.cond - (.5 + sp * .08)); c.v *= .88; carHitWear(c);
      fxBlood(z.x, z.y, 8, c.a); addBlood(z.x, z.y, 2); sfx.hit(sp > 7);
      if (sp > 7 || z.down > 0){ z.hp = 0; killZombie(z, null); }
      else { z.down = rf(2.5, 4); z.lunge = 0; moveEnt(z, Math.cos(c.a) * .8, Math.sin(c.a) * .8, "z", .26); }
    }
  }
  // fuel, noise
  if (c.on){
    c.fuel = Math.max(0, c.fuel - (Math.abs(c.v) * .0009 + .00003) * dt * 60 / 60);
    if (c.fuel <= 0){ c.on = false; say("The engine sputters and dies. Out of gas."); }
    c.nT -= dt; if (c.nT <= 0){ c.nT = .5; noise(c.x, c.y, (14 + Math.abs(c.v) * 2.2) * mufflerF(c)); }
  }
  carWear(c, dt);
  P.x = c.x; P.y = c.y; P.face = c.a; P.moving = false; P.running = false;
  if (P.speech){ P.speech.t -= dt; if (P.speech.t <= 0) P.speech = null; }
}

// ---------- drawing ----------
const CAR_SHAPE = [[.95, .36], [.8, .43], [-.88, .43], [-.95, .37], [-.95, -.37], [-.88, -.43], [.8, -.43], [.95, -.36]];
function prism(pts, z0, z1, col, topCol, a){
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  for (let i = 0; i < pts.length; i++){
    const p = pts[i], q = pts[(i + 1) % pts.length], nx = (p[0] + q[0]) / 2 - cx, ny = (p[1] + q[1]) / 2 - cy;
    if (nx + ny <= 0) continue;
    const f = .72 + .16 * clamp(nx / (Math.abs(nx) + Math.abs(ny) + 1e-6) * .5 + .5, 0, 1);
    poly([S(p[0], p[1], z0), S(q[0], q[1], z0), S(q[0], q[1], z1), S(p[0], p[1], z1)], shade(col, f), a);
  }
  poly(pts.map(p => S(p[0], p[1], z1)), topCol || col, a);
}
function drawVehicle(c){
  const i = ix(Math.floor(c.x), Math.floor(c.y));
  if (!explored[i] && !G.vis[i] && P.car !== c) return;
  const dim = G.vis[i] || P.car === c ? 1 : .55, a = 1;
  const col = shade(c.col, dim * (c.cond < 30 ? .75 : 1));
  for (const [u, w] of [[.6, .44], [-.6, .44], [.6, -.44], [-.6, -.44]]){ const [x, y] = carPoint(c, u, w); topEl(x, y, .13, 2.5, "#111", a, .1); }
  prism(CAR_SHAPE.map(([u, w]) => carPoint(c, u, w)), 2.5, 10, col, shade(c.col, dim * 1.08), a);
  const glass = shade(c.broken ? "#1a1c20" : "#3a4c5e", dim);
  prism([[.32, .36], [-.5, .37], [-.58, .33], [-.58, -.33], [-.5, -.37], [.32, -.36], [.4, -.3], [.4, .3]].map(([u, w]) => carPoint(c, u, w)), 10, 17, glass, shade(c.col, dim * .95), a);
  const night = isNight();
  for (const w of [-.27, .27]){
    const [x, y] = carPoint(c, .96, w); topEl(x, y, .06, 7, c.on && night ? "#fff6c8" : shade("#d8d0a0", dim), a);
    const [bx, by] = carPoint(c, -.96, w); topEl(bx, by, .05, 7, c.on ? "#ff3020" : shade("#8a2a20", dim), a);
  }
}
function vehHover(mx, my){
  for (const lift of [0, 10]){
    const [wx, wy] = toWorld(mx, my + lift * zoom);
    for (const c of V){
      const [u, w] = carLocal(c, wx, wy);
      if (Math.abs(u) < CAR_L && Math.abs(w) < CAR_W && (explored[ix(Math.floor(c.x), Math.floor(c.y))] || P.car === c))
        return `Car${c.locked ? " (locked)" : ""}${P.car === c ? `, ${Math.round(c.fuel * 100)}% fuel` : ""}`;
    }
  }
  return null;
}
function carHUD(){
  const c = P.car;
  return `${c.on ? "ENGINE ON" : "ENGINE OFF"}  ${Math.round(Math.abs(c.v) * 9)} km/h<br>FUEL <span class="bar"><i style="width:${Math.round(c.fuel * 100)}%"></i></span>  COND ${Math.round(c.cond)}%`;
}
