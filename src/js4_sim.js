// ============================================================
// Part 4: zombies, sound, combat, world interactions, director
// ============================================================
let Z = [];              // zombies
let flow = null, flowT = 0;
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d); };

function darknessBase(){
  const h = (G.min % 1440) / 60;
  if (h >= 7 && h < 19) return 0;
  if (h >= 19 && h < 22) return (h - 19) / 3 * 0.8;
  if (h >= 4 && h < 7) return (7 - h) / 3 * 0.8;
  return 0.8;
}
const isNight = () => darknessBase() > 0.45 || (typeof realXY === "function" && P && tile && realXY(P.x, P.y).lvl < 0);
function powerOn(x, y){ return G.min < G.powerOff || genPowerAt(x, y); }
const waterOn = () => G.min < G.waterOff;

// ---------- sound ----------
function noise(x, y, r){ G.sounds.push({ x, y, r, t: G.simT }); }

// ---------- spawning ----------
function spawnZombies(n){
  let tries = 0;
  while (Z.length < n && tries++ < n * 40){
    const x = ri(1, W - 2), y = ri(1, H - 2);
    if (solidZ(x, y) || tile[ix(x, y)] === T.DOOR || tile[ix(x, y)] === T.WIN) continue;
    if (Math.hypot(x - P.x, y - P.y) < 16) continue;
    if (bldId[ix(x, y)] >= 0 && bldId[ix(x, y)] === G.startBld) continue;
    const forest = x < 5 || y < 5 || x > 94 || y > 94;
    if (forest && R() < 0.75) continue;
    const store = bldId[ix(x, y)] >= 0 && buildings[bldId[ix(x, y)]].kind !== "house";
    const count = store && R() < 0.5 ? 2 : 1;
    for (let k = 0; k < count; k++) Z.push(newZombie(x + 0.5 + rf(-.2, .2), y + 0.5 + rf(-.2, .2)));
  }
}
const SHIRTS = ["#5b6b7a","#7a5b4f","#4f6a4c","#6e6e5a","#7c4a5a","#3f4f66","#8a7a5a","#5a4a6e","#a39a88","#46525a"];
function newZombie(x, y){
  const r = R();
  const type = r < CFG.sprinterChance ? "sprint" : r < CFG.sprinterChance + 0.06 ? "crawl" : "shamble";
  const hp = rf(1.5, 2.5);
  return { x, y, hp, maxhp: hp, type, state: "idle", tx: x, ty: y, face: rf(0, 6.28), think: rf(0, .5),
    mem: 0, down: 0, lunge: 0, atkCd: 0, bashT: 0, stuckT: 0, lx: x, ly: y, farT: rf(0, 2), lastHeard: 0,
    spdJ: rf(.85, 1.15), col: pick(SHIRTS), pants: pick(["#2e3440","#4a3b2a","#3a3f2f","#2f2f3a"]),
    fake: type !== "crawl" && R() < 0.04, alive: true, anim: rf(0, 6), groanT: rf(3, 12), id: Math.random() };
}

// ---------- movement with tile collision ----------
function moveEnt(e, dx, dy, who, r){
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.2));
  for (let k = 0; k < steps; k++){
    const nx = e.x + dx / steps; if (!collides(nx, e.y, r, who)) e.x = nx;
    const ny = e.y + dy / steps; if (!collides(e.x, ny, r, who)) e.y = ny;
  }
}
function collides(x, y, r, who){
  const x0 = Math.floor(x - r) - 1, x1 = Math.floor(x + r) + 1, y0 = Math.floor(y - r) - 1, y1 = Math.floor(y + r) + 1;
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++){
    const rs = shapeRects(tx, ty, who); if (!rs) continue;
    for (const q of rs){
      const cx = clamp(x, q[0], q[2]), cy = clamp(y, q[1], q[3]);
      if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
    }
  }
  if (V.length && vehHit(x, y, r)) return true;
  return false;
}
function slabHit(f, e, rad){ const q = slabRect(f), cx = clamp(e.x, q[0], q[2]), cy = clamp(e.y, q[1], q[3]); return (e.x - cx) ** 2 + (e.y - cy) ** 2 < rad * rad; }
// close a door; returns false if a zombie is in the swing. If only the player is, they get nudged through.
function tryCloseDoor(f){
  if (Z.some(z => z.alive && slabHit(f, z, .27))){ say("One of them is in the doorway!", "#ff9a8a"); return false; }
  if (slabHit(f, P, .28)){
    const q = slabRect(f);
    if (f.horiz) P.y = P.y < f.y + .5 ? q[1] - .29 : q[3] + .29; else P.x = P.x < f.x + .5 ? q[0] - .29 : q[2] + .29;
  }
  f.open = false; sfx.door(); noise(f.x + .5, f.y + .5, 2); return true;
}
// quick toggle for the nearest door (Q)
function quickDoor(){
  let best = null, bd = 1.7;
  for (const f of feats.values()){ if (f.type !== "door" || f.broken) continue; const d = Math.hypot(f.x + .5 - P.x, f.y + .5 - P.y); if (d < bd){ bd = d; best = f; } }
  if (!best) return say("No door within reach.");
  if (best.open) return tryCloseDoor(best);
  if (best.bar) return say("It's barricaded.");
  if (best.locked) return say("Locked.");
  best.open = true; sfx.door(); noise(best.x + .5, best.y + .5, 2);
}
// ---------- flow field toward the player (zombie pathing) ----------
function buildFlow(){
  const maxD = 42;
  if (!flow) flow = new Int16Array(W * H);
  flow.fill(-1);
  const [sx, sy] = sideTile(P.x, P.y);
  const q = new Int32Array(W * H); let h = 0, t = 0;
  flow[ix(sx, sy)] = 0; q[t++] = ix(sx, sy);
  while (h < t){
    const i = q[h++], x = i % W, y = (i / W) | 0, d = flow[i];
    if (d >= maxD) continue;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue;
      const j = ix(nx, ny); if (flow[j] >= 0 || !pathZ(nx, ny)) continue;
      flow[j] = d + 1; q[t++] = j;
    }
  }
}
function flowNext(z){
  const [x, y] = sideTile(z.x, z.y), here = flow[ix(x, y)];
  if (here < 0) return null;
  let best = null, bd = here;
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
    const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue;
    const d = flow[ix(nx, ny)]; if (d < 0) continue;
    if (dx && dy && (!pathZ(x + dx, y) || !pathZ(x, y + dy) || solidZ(x + dx, y) || solidZ(x, y + dy))) continue;
    if (d < bd){ bd = d; best = [nx, ny]; }
  }
  return best;
}

// ---------- zombie AI ----------
function zSightRange(){
  let r = isNight() ? CFG.zSightNight * (P.flash ? 1.7 : 1) : CFG.zSightDay;
  if (P.sneaking) r *= 0.55 - skill("sneak") * 0.03;
  if (P.running && P.moving) r *= 1.2;
  if (P.traits.has("inconsp")) r *= 0.75; if (P.traits.has("consp")) r *= 1.3;
  if (G.rain) r *= 0.8;
  return r;
}
function stepZombies(dt){
  // spatial buckets for separation
  const buckets = new Map();
  for (const z of Z){ if (!z.alive || Math.abs(z.x - P.x) > 52 || Math.abs(z.y - P.y) > 52) continue; const k = (z.x | 0) * 1000 + (z.y | 0); (buckets.get(k) || buckets.set(k, []).get(k)).push(z); }
  const sight = zSightRange() * (1 - .5 * (G.fog || 0)); PLV = realXY(P.x, P.y);
  let anyChase = false, vis = 0;
  for (const z of Z){
    if (!z.alive) continue;
    let dx = P.x - z.x, dy = P.y - z.y, d = Math.hypot(dx, dy), same = true;
    if (z.y >= PK_Y0 || PLV.lvl > 0){ const zr = realXY(z.x, z.y); if (zr.pk !== PLV.pk){ same = false; d = Math.hypot(PLV.x - zr.x, PLV.y - zr.y) + 3; dx = dy = 0; } }
    if (G.vis && d < 14 && G.vis[ix(z.x | 0, z.y | 0)] && !z.fake) vis++;
    if (d > 48){ if (d < 170) farZombie(z, dt); continue; }
    const ox = z.x, oy = z.y;
    if (z.atkCd > 0) z.atkCd -= dt;
    if (z.fake){ if (d < 1.7 && P.alive){ z.fake = false; z.down = 0.9; z.state = "chase"; z.mem = CFG.zMemory; groan(z, 1); } continue; }
    if (z.down > 0){ z.down -= dt; z.lunge = 0; z.mv = 0; continue; }
    if (z.stun > 0){ z.stun -= dt; z.lunge = 0; z.mv = 0; continue; }
    // perception
    z.think -= dt;
    if (z.think <= 0 && P.alive){
      z.think = 0.22 + R() * 0.15; const tkDt = z.think;
      const ad = angDiff(Math.atan2(dy, dx), z.face);
      perceive(z, d, ad, same, sight, tkDt, dx, dy);
      for (const s of G.sounds){
        if (s.t <= z.lastHeard) continue;
        const r = s.r * (G.rain ? 0.8 : 1);
        if ((s.x - z.x) ** 2 + (s.y - z.y) ** 2 < r * r){
          z.lastHeard = s.t;
          if (z.state !== "chase" && !(s.thump && z.state === "investigate")){ z.state = "investigate"; z.tx = s.x + rf(-1.5, 1.5); z.ty = s.y + rf(-1.5, 1.5); z.stuckT = 0; z.invT = 0; }
        }
      }
    }
    let spd = (z.type === "sprint" ? CFG.zSprint : z.type === "crawl" ? CFG.zCrawl : CFG.zShamble) * z.spdJ;
    if (tile[ix(z.x | 0, z.y | 0)] === T.WIN) spd *= 0.3;
    let mx = 0, my = 0;
    if (z.state === "chase"){
      anyChase = true;
      z.mem -= dt; chaseUpkeep(z, dt); if (z.state !== "chase") continue;
      if (z.mem <= 0 && z.state === "chase") loseTrack(z);
      // attack
      if (d < 0.95 && P.alive && reachClear(z.x, z.y, P.x, P.y)){
        z.face = Math.atan2(dy, dx);
        if (z.lunge > 0){ z.lunge -= dt; if (z.lunge <= 0){ z.atkCd = rf(1.2, 1.7); if (d < 1.0 && reachClear(z.x, z.y, P.x, P.y)) zombieHits(z); } }
        else if (z.atkCd <= 0) z.lunge = z.type === "sprint" ? 0.3 : 0.5;
        if (d > 0.55){ mx = dx / d; my = dy / d; spd *= 0.6; }
      } else {
        z.lunge = 0;
        if (d < 1.6 && reachClear(z.x, z.y, P.x, P.y)){ mx = dx / d; my = dy / d; }
        else if (flow){
          const nx = flowNext(z);
          if (nx){
            const f = feats.get(ix(nx[0], nx[1])), bo = objs.get(ix(nx[0], nx[1]));
            if (bo && bo.built && OBJ[bo.type].block){ bashObj(z, bo, dt); z.face = Math.atan2(nx[1] + .5 - z.y, nx[0] + .5 - z.x); }
            else if (f && solidZ(nx[0], nx[1])){
              const side = f.horiz ? Math.sign(z.y - (nx[1] + .5)) || 1 : Math.sign(z.x - (nx[0] + .5)) || 1;
              const ap = f.horiz ? [clamp(z.x, nx[0] + .3, nx[0] + .7), nx[1] + .5 + side * .42] : [nx[0] + .5 + side * .42, clamp(z.y, nx[1] + .3, nx[1] + .7)];
              const ex = ap[0] - z.x, ey = ap[1] - z.y, el = Math.hypot(ex, ey);
              if (el > .12 && !nearFeat(z, nx[0], nx[1])){ mx = ex / el; my = ey / el; }
              else { bash(z, f, dt); z.face = Math.atan2(nx[1] + .5 - z.y, nx[0] + .5 - z.x); }
            }
            else { const ex = nx[0] + .5 - z.x, ey = nx[1] + .5 - z.y, el = Math.hypot(ex, ey) || 1; mx = ex / el; my = ey / el; }
          } else { mx = dx / (d || 1); my = dy / (d || 1); }
        }
      }
    } else if (z.state === "investigate" || z.state === "wander"){
      const ex = z.tx - z.x, ey = z.ty - z.y, el = Math.hypot(ex, ey);
      if (el < 0.6){ z.state = "idle"; }
      else {
        const pm = z.state === "investigate" ? investigateMove(z, dt) : null;
        if (pm){ mx = pm[0]; my = pm[1]; } else {
        mx = ex / el; my = ey / el;
        if (z.state === "wander") spd *= 0.6;
        // bump into a door or window on the way? bash it if investigating
        const fx = Math.floor(z.x + mx * 0.6), fy = Math.floor(z.y + my * 0.6), f = feats.get(ix(fx, fy));
        if (f && solidZ(fx, fy) && z.state === "investigate"){ bash(z, f, dt); mx = my = 0; }
        }
      }
      z.stuckT += dt;
      if (z.stuckT > 1.5){ if (Math.hypot(z.x - z.lx, z.y - z.ly) < 0.15 && !(z.bashAt && G.simT - z.bashAt < .6)) z.state = "idle"; z.lx = z.x; z.ly = z.y; z.stuckT = 0; }
    } else {
      if (R() < 0.004 * dt * 60){ z.state = "wander"; z.tx = z.x + rf(-5, 5); z.ty = z.y + rf(-5, 5); z.stuckT = 0; }
    }
    if (mx || my){
      z.face = Math.atan2(my, mx);
      moveEnt(z, mx * spd * dt, my * spd * dt, "z", 0.26);
    }
    // separation
    const k0x = z.x | 0, k0y = z.y | 0;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++){
      const b = buckets.get((k0x + ox) * 1000 + k0y + oy); if (!b) continue;
      for (const o of b){
        if (o === z || !o.alive || o.down > 0) continue;
        const sx = z.x - o.x, sy = z.y - o.y, sd = sx * sx + sy * sy;
        if (sd < 0.22 && sd > 0.0001){ const s = Math.sqrt(sd), push = (0.47 - s) * 0.5; moveEnt(z, sx / s * push, sy / s * push, "z", 0.26); }
      }
    }
    const moved = Math.hypot(z.x - ox, z.y - oy);
    z.mv = (z.mv || 0) * 0.85 + 0.15 * (moved / dt);
    z.anim += moved * 2 * Math.PI / (z.type === "sprint" ? 1.6 : 0.85);
    // groans
    z.groanT -= dt;
    if (z.groanT <= 0){ z.groanT = rf(6, 16); if (d < 14) groan(z, z.state === "chase" ? 0.5 : 0.22); }
  }
  G.visZ = vis;
  G.anyChase = anyChase;
  flowT -= dt;
  const invNear = INV_NEAR;
  if ((anyChase || invNear) && flowT <= 0){ buildFlow(); flowT = 0.35; }
  INV_NEAR = false; PATH_BUDGET = 4;
  if (!anyChase && !invNear) flow = null;
}
function farZombie(z, dt){
  z.farT -= dt; if (z.farT > 0) return;
  z.farT = rf(1.5, 2.5);
  for (const s of G.sounds){
    if (s.t <= z.lastHeard) continue;
    if ((s.x - z.x) ** 2 + (s.y - z.y) ** 2 < s.r * s.r){ z.lastHeard = s.t; z.state = "investigate"; z.tx = s.x + rf(-3, 3); z.ty = s.y + rf(-3, 3); }
  }
  if (z.state === "investigate"){
    const ex = z.tx - z.x, ey = z.ty - z.y, el = Math.hypot(ex, ey);
    if (el < 1) z.state = "idle";
    else { const step = Math.min(el, CFG.zShamble * 2.2); moveEnt(z, ex / el * step, ey / el * step, "z", 0.26); }
  }
}
function groan(z, vol){
  const d = Math.hypot(P.x - z.x, P.y - z.y);
  if (d < 16) sfx.groan(vol * (1 - d / 16), (z.x - P.x) - (z.y - P.y));
}

// zombies bashing doors, windows and barricades
function bash(z, f, dt){
  if (f.iron && f.type === "win"){ z.state = "idle"; return; }
  z.bashAt = G.simT;
  z.bashT += dt; if (z.bashT < 1.15) return;
  z.bashT = 0;
  noise(f.x + .5, f.y + .5, 9); if (G.sounds.length) G.sounds[G.sounds.length - 1].thump = true;
  const d = Math.hypot(P.x - f.x, P.y - f.y);
  if (d < 22) sfx.thump(1 - d / 22);
  if (f.bar > 0){
    f.barHp = (f.barHp ?? PLANK_HP) - 1;
    if (f.barHp <= 0){ if (f.metal){ f.bar = 0; f.metal = false; if (d < 20) say("The metal sheet tears loose."); } else { f.bar--; f.barHp = PLANK_HP; if (d < 20) say("A plank splinters and gives way."); } }
    return;
  }
  f.hp -= 1;
  if (f.hp <= 0){
    if (f.type === "door"){ f.open = true; f.broken = true; f.locked = false; if (d < 20) say("A door crashes open."); }
    else { f.broken = true; f.glass = true; sfx.glass(1 - Math.min(1, d / 22)); }
  }
}

function zombieHits(z){
  if (P.car && P.car.cond > 20){ P.car.cond -= 1.2; sfx.thump(.5); noise(P.x, P.y, 8); return; }
  const rear = angDiff(P.face, Math.atan2(z.y - P.y, z.x - P.x)) > 1.9;
  const guard = P.traits.has("thinskin") ? 0.12 : 0.28;
  sfx.hurt();
  P.stagger = 0.35; cancelActions(); P.flinchT = .3;
  // drag down when swarmed
  const around = Z.filter(o => o.alive && o.down <= 0 && !o.fake && Math.hypot(o.x - P.x, o.y - P.y) < 1.05).length;
  if (around >= 3 && R() < 0.33){ die("They pulled you down. There were too many of them."); return; }
  if (R() < guard){ bubble("Ugh!"); say("It grabs at you but doesn't break the skin."); P.panic = Math.min(100, P.panic + 8); return; }
  const type = rear ? wpick([["scratch", 40], ["laceration", 25], ["bite", 35]]) : wpick([["scratch", 55], ["laceration", 30], ["bite", 15]]);
  const part = wpick(PARTS.map(p => [p[0], p[2]]));
  const cb = clothBlocks(part, type); if (cb){ bubble("Ugh!"); say(`Your ${ITEMS[cb.id].n.toLowerCase()} takes the ${type === "bite" ? "bite" : "scratch"}. It tears.`); P.panic = Math.min(100, P.panic + 6); return; }
  addWound(part, type, true);
  fxInit(); G.hurt = 1; G.shake = 4;
  addBlood(P.x, P.y, 2);
  bubble(type === "bite" ? "No... no no no." : "Argh!");
  say(`${WOUND[type].n} on your ${PARTNAME[part].toLowerCase()}.`, "#ff9a8a");
}

// ---------- player combat ----------
function swingWeapon(){
  if (P.swing || P.swingCd > 0 || P.sleeping || P.stagger > 0) return;
  if (!P.weapon) return shove();
  if (tryTakedown()) return;
  cancelActions();
  const w = ITEMS[P.weapon.id];
  const dur = w.spd / Math.max(0.5, actionSpeed()) * (P.endurance < 0.25 ? 1.35 : 1);
  P.swing = { t: 0, dur, hit: false, kind: "swing" };
  P.endurance -= w.end * (1.25 - skill("fitness") * 0.05);
  sfx.swing();
}
function shove(){
  if (P.shoveCd > 0 || P.sleeping || P.stagger > 0 || P.swing) return;
  cancelActions();
  P.shoveCd = 0.55;
  const near = Z.filter(z => z.alive && !z.fake && Math.hypot(z.x - P.x, z.y - P.y) < 1.2 && angDiff(Math.atan2(z.y - P.y, z.x - P.x), P.face) < 1.1 && reachClear(P.x, P.y, z.x, z.y))
    .sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y));
  const downed = near.find(z => z.down > 0);
  if (downed){ // stomp
    P.swing = { t: 0, dur: 0.5, kind: "stomp", hit: true };
    P.endurance -= 0.025;
    const dmg = rf(0.3, 0.55) * (0.75 + skill("strength") * 0.05);
    downed.hp -= dmg; downed.down = Math.max(downed.down, 1.2);
    sfx.hit(false); addBlood(downed.x, downed.y, 1); noise(P.x, P.y, 3); fxHit(downed, false, downed.hp <= 0);
    if (downed.hp <= 0) killZombie(downed, null);
    addXP("strength", 0.5);
    return;
  }
  P.swing = { t: 0, dur: 0.4, kind: "shove", hit: true };
  P.endurance -= 0.045 * (1.25 - skill("fitness") * 0.05);
  sfx.swing();
  const z = near[0]; if (!z) return;
  const a = Math.atan2(z.y - P.y, z.x - P.x);
  const rear = angDiff(z.face, Math.atan2(P.y - z.y, P.x - z.x)) > 1.8;
  moveEnt(z, Math.cos(a) * 0.7, Math.sin(a) * 0.7, "z", 0.26);
  z.lunge = 0; z.atkCd = Math.max(z.atkCd, 0.8);
  if (z.state !== "chase"){ z.state = "chase"; z.mem = CFG.zMemory; }
  if (R() < 0.33 + skill("strength") * 0.035 + (rear ? 0.25 : 0)) z.down = rf(2, 3.5);
  noise(P.x, P.y, 4);
}
function killZombie(z, sk){
  z.alive = false; P.kills++;
  G.corpses.push({ x: z.x, y: z.y, items: null, col: z.col, pants: z.pants, face: z.face, fall: z.down > 0 ? 1 : 0, t: G.min, skin: z.skin, hair: z.hair, extra: z.carry });
  P.unhappy = Math.min(100, P.unhappy + Math.max(0, 4 - daysSurvived() * 0.8));
  if (sk) addXP(sk, 5);
}

// ---------- blood decals ----------
function addBlood(x, y, n){
  for (let i = 0; i < n; i++) G.blood.push({ x: x + rf(-.4, .4), y: y + rf(-.4, .4), r: rf(3, 7), a: rf(0, 6) });
  if (G.blood.length > 900) G.blood.splice(0, 100);
}

// ---------- world interactions (E menu) ----------
function hasBarricadeKit(){ const n = findId("nails"); return findTag("hammer") && findId("plank") && n && n.qty >= 2; }
function useBarricadeKit(){ removeItem(findId("plank")); const n = findId("nails"); n.qty -= 2; if (n.qty <= 0) removeItem(n); }
function occupied(x, y){ return Z.some(z => z.alive && (z.x | 0) === x && (z.y | 0) === y); }
function triggerAlarm(f){
  const b = buildings[bldId[ix(f.x, f.y)]];
  if (b && b.alarm && !b.alarmUsed && powerOn()){
    b.alarmUsed = true; G.alarms.push({ x: f.x + .5, y: f.y + .5, until: G.min + 25, t: 0 });
    say("A house alarm starts screaming!", "#ff9a8a");
  }
}

function interactions(){
  if (P.car){ const o = []; vehOptions(o); return o; }
  const out = [];
  let sawWater = false;
  const px = Math.floor(P.x), py = Math.floor(P.y);
  const seen = new Set();
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
    const x = px + dx, y = py + dy; if (!inb(x, y)) continue;
    if (Math.hypot(x + .5 - P.x, y + .5 - P.y) > 1.55) continue;
    const i = ix(x, y), f = feats.get(i), o = objs.get(i);
    if (f && !seen.has(f)){ seen.add(f); featOptions(f, out); }
    if (o) objOptions(o, out);
    if (tile[i] === T.TREE) treeOptions(x, y, out);
    if (tile[i] === T.WATER) sawWater = true;
  }
  if (sawWater) waterOptions(out);
  groundOptions(out); fireOptions(out); cleanOptions(out); burnOptions(out);
  vehOptions(out);
  animalOptions(out);
  const corpse = G.corpses.find(c => Math.hypot(c.x - P.x, c.y - P.y) < 1.3);
  if (corpse) out.push({ label: "Search the body", fn: openInv });
  if (P.fatigue > 0.6 && !out.some(o => o.label.startsWith("Sleep"))) out.push({ label: "Sleep on the floor", fn: () => startSleep("floor") });
  return out;
}
function featOptions(f, out){
  if (f.iron && f.type === "win"){ out.push({ label: "Iron bars. No way through here.", off: true }); return; }
  metalBarricadeOption(f, out);
  if (realXY(f.x, f.y).lvl > 0) upperWindowOptions(f, out);
  const name = f.type === "door" ? "door" : "window";
  const hammer = findTag("hammer"), pry = findTag("pry");
  if (f.type === "door"){
    if (f.broken) out.push({ label: "The door hangs off its hinges", off: true });
    else if (f.open) out.push({ label: "Close door", fn: () => tryCloseDoor(f) });
    else if (f.bar > 0) out.push({ label: "Door is barricaded", off: true });
    else if (f.locked){
      out.push({ label: "Locked", off: true });
      out.push({ label: "Kick the door", fn: () => act("Kicking", 1.4, () => { sfx.thump(1); noise(f.x, f.y, 14); triggerAlarm(f);
        if (R() < 0.18 + skill("strength") * 0.03){ f.locked = false; f.open = true; say("The door bursts open."); } else bubble("Come on..."); }) });
      if (pry) out.push({ label: `Pry it open with ${ITEMS[pry.id].n.toLowerCase()}`, fn: () => act("Prying", 4, () => { noise(f.x, f.y, 6); triggerAlarm(f);
        if (R() < 0.75){ f.locked = false; f.open = true; say("The lock gives."); } else say("It won't budge. Try again."); }, { noise: 5, noiseEvery: 1.5 }) });
    } else out.push({ label: "Open door", fn: () => { f.open = true; sfx.door(); noise(f.x, f.y, 2); } });
  } else {
    if (!f.broken){
      if (f.open) out.push({ label: "Close window", fn: () => { f.open = false; } });
      else if (f.bar === 0) out.push({ label: "Open window", fn: () => act("Opening window", 1.2, () => {
        if (f.locked){ say("It's locked from the inside."); return; } f.open = true; noise(f.x, f.y, 2); }) });
      out.push({ label: "Smash window", fn: () => act("Smashing", 0.5, () => {
        f.broken = true; f.glass = true; f.open = false; sfx.glass(1); noise(f.x + .5, f.y + .5, 20); triggerAlarm(f);
        if (!P.weapon && R() < 0.5){ addWound(pick(["hand_l", "hand_r", "farm_r"]), "glass", false); say("The glass cuts your hand.", "#ff9a8a"); } }) });
      if (!f.broken && curtainReach(f)) out.push({ label: f.curtain ? "Open curtains" : "Close curtains", fn: () => { f.curtain = !f.curtain; } });
    } else if (f.glass) out.push({ label: "Clear glass from the frame", fn: () => act("Clearing glass", 2.5, () => { f.glass = false; }) });
    if ((f.open || f.broken) && f.bar === 0) out.push({ label: "Climb through window", fn: () => climbThrough(f) });
  }
  if (f.bar < 4 && !f.open && !(f.type === "door" && f.broken))
    out.push({ label: `Barricade ${name} (plank, 2 nails)`, off: !hasBarricadeKit(), fn: () => {
      if (!hasBarricadeKit()) return say("You need a hammer, a plank and 2 nails.");
      act("Barricading", Math.max(2, 5 - skill("carpentry") * 0.3), () => { if (!hasBarricadeKit()) return; useBarricadeKit(); f.bar++; f.barHp = PLANK_HP; f.curtain = false; addXP("carpentry", 10); }, { noise: 8, noiseEvery: 1.1 });
    } });
  if (f.bar > 0) out.push({ label: "Remove a plank", off: !(hammer || pry), fn: () => {
    if (!(hammer || pry)) return say("You need a hammer or crowbar.");
    act("Removing plank", 4, () => { if (f.bar <= 0) return; f.bar--; giveItem(makeItem("plank")); noise(f.x, f.y, 5); }); } });
}
function climbThrough(f){
  let dest;
  if (f.horiz) dest = P.y < f.y + 0.5 ? [f.x + .5, f.y + 1.2] : [f.x + .5, f.y - 0.2];
  else dest = P.x < f.x + 0.5 ? [f.x + 1.2, f.y + .5] : [f.x - 0.2, f.y + .5];
  if (collides(dest[0], dest[1], 0.27, "p")) return say("Something is blocking the other side.");
  act("Climbing through", 1.6, () => {
    if (lungeGrab(f.x + .5, f.y + .5)) return;
    P.x = dest[0]; P.y = dest[1]; noise(P.x, P.y, 3);
    if (f.broken && f.glass && R() < 0.55){ addWound(pick(["farm_l", "farm_r", "hand_l", "hand_r", "thigh_l", "thigh_r"]), "glass", false); say("Broken glass slices into you.", "#ff9a8a"); }
  });
}
function objOptions(o, out){
  const d = OBJ[o.type], hammer = findTag("hammer");
  builtOptions(o, out);
  if (d.cont) out.push({ label: `Search ${d.n.toLowerCase()}`, fn: openInv });
  if (d.water){
    const has = o.water === -1 ? waterOn() : o.water > 0;
    out.push({ label: `Drink from ${d.n.toLowerCase()}`, off: !has, fn: () => drinkFrom(o) });
    const bottles = allCarried().filter(it => ITEMS[it.id].tags.includes("fillable"));
    if (bottles.length) out.push({ label: `Fill ${bottles.length} empty bottle${bottles.length > 1 ? "s" : ""}`, off: !has, fn: () => fillFrom(o, bottles) });
  }
  if (d.toilet && !waterOn()){
    out.push({ label: "Drink from the toilet tank", off: !(o.water > 0), fn: () => drinkFrom(o) });
  }
  if (d.bed){ out.push({ label: "Sleep in bed", fn: () => startSleep("bed") }); out.push({ label: "Lie down and rest", fn: rest }); }
  if (d.seat){ out.push({ label: "Sit and rest", fn: rest }); out.push({ label: "Sleep on the sofa", fn: () => startSleep("sofa") }); }
  if (d.tv) out.push({ label: "Watch TV", off: !powerOn(), fn: watchTV });
  if (d.dis) out.push({ label: `Take apart ${d.n.toLowerCase()} (hammer)`, off: !hammer, fn: () => {
    if (!findTag("hammer")) return say("You need a hammer.");
    act("Taking apart", 8 - skill("carpentry") * 0.4, () => disassemble(o), { noise: 7, noiseEvery: 1 });
  } });
}
function drinkFrom(o){
  act("Drinking", 3, () => {
    if (o.water === -1 && !waterOn()) o.water = 0;
    if (o.water === 0) return say("Nothing comes out.");
    if (o.water > 0){ o.water--; if (OBJ[o.type].toilet && R() < 0.3) P.sickness += 0.2; }
    P.thirst = 0;
  });
}
function fillFrom(o, bottles){
  act("Filling bottles", 2 * bottles.length, () => {
    for (const b of bottles){
      if (o.water === 0) break;
      if (o.water === -1 && !waterOn()){ o.water = 0; break; }
      if (o.water > 0) o.water--;
      const inBag = P.bag && P.bag.items.includes(b);
      removeItem(b); const nw = makeItem("water");
      if (inBag) P.bag.items.push(nw); else P.inv.push(nw);
    }
  });
}
function rest(){ act("Resting", 25, () => {}, { tick: () => { P.resting = true; } }); }
function watchTV(){
  if (!powerOn()) return say("No power.");
  const day = Math.floor(G.min / 1440), lines = BROADCAST[day];
  act("Watching TV", 45, () => { P.unhappy = clamp(P.unhappy - 6, 0, 100); }, { fun: -1.2, tick: () => {} });
  if (lines) say(`TV: "${pick(lines)}"`, "#cfe0ff");
  else if (day > 17) say("TV: a test card and a thin, endless tone.", "#cfe0ff");
  else say("TV: an old sitcom rerun. Canned laughter.", "#cfe0ff");
  noise(P.x, P.y, 6);
}
function disassemble(o){
  const i = ix(o.x, o.y);
  if (!objs.has(i)) return;
  if (o.items && o.items.length){ const fl = floorItems.get(i) || []; fl.push(...o.items); floorItems.set(i, fl); }
  objs.delete(i); invalidateGround(o.x, o.y); (G.removed = G.removed || []).push(i);
  const planks = 1 + (R() < 0.3 + skill("carpentry") * 0.1 ? 1 : 0);
  for (let k = 0; k < planks; k++) giveItem(makeItem("plank"));
  const nails = ri(0, 3);
  if (nails){ const n = findId("nails"); if (n) n.qty += nails; else { const it = makeItem("nails"); it.qty = nails; giveItem(it); } }
  addXP("carpentry", 8);
  say(`You get ${planks} plank${planks > 1 ? "s" : ""}${nails ? ` and ${nails} nails` : ""}.`);
}

// ---------- the director: utilities, helicopter, alarms, distant gunfire, weather ----------
function stepDirector(dt, dm){
  if (!G.powerMsg && !powerOn()){ G.powerMsg = true; say("Every light in town dies at once. The power is out.", "#ffd27a"); sfx.thump(0.6); }
  if (!G.waterSet && !waterOn()){ G.waterSet = true; for (const o of objs.values()) if (o.water === -1) o.water = OBJ[o.type].toilet ? ri(2, 4) : ri(0, 3); }
  // helicopter
  if (!G.heliDone && G.min >= G.heliAt){ G.heli = { until: G.heliAt + 150, t: 0 }; G.heliDone = true; say("A helicopter thunders in low over the rooftops...", "#ffd27a"); }
  if (G.heli){
    G.heli.t -= dt;
    if (G.heli.t <= 0){
      G.heli.t = 6;
      const outside = !insideAt(P.x, P.y);
      if (outside){ noise(P.x, P.y, 34); if (R() < 0.3) say("It's circling right above you.", "#ffd27a"); }
      else noise(P.x + rf(-20, 20), P.y + rf(-20, 20), 26);
      sfx.heli(outside ? 1 : 0.5);
    }
    if (G.min > G.heli.until){ G.heli = null; say("The rotor noise fades away. They're not coming back."); }
  }
  // alarms
  for (const a of G.alarms){
    if (G.min > a.until) continue;
    a.t -= dt; if (a.t <= 0){ a.t = 1; noise(a.x, a.y, 38); sfx.alarm(1 - Math.min(1, Math.hypot(a.x - P.x, a.y - P.y) / 40)); }
  }
  // distant gunfire pulls hordes around the map
  G.metaT -= dm;
  if (G.metaT <= 0){
    G.metaT = rf(180, 600);
    const a = rf(0, 6.28), r = rf(28, 45);
    const x = clamp(P.x + Math.cos(a) * r, 2, W - 2), y = clamp(P.y + Math.sin(a) * r, 2, H - 2);
    noise(x, y, 32); sfx.gunshot(); if (R() < 0.5) say("Gunshots, somewhere far off.");
  }
  // weather
  G.weatherT -= dm;
  if (G.weatherT <= 0){
    if (G.rain){ G.rain = false; G.weatherT = rf(240, 900); }
    else if (R() < 0.35){ G.rain = true; G.weatherT = rf(60, 240); }
    else G.weatherT = rf(120, 400);
  }
  G.sounds = G.sounds.filter(s => G.simT - s.t < 1.5);
}
