// ============================================================
// Part 30: fire. Molotovs, explosions, spreading flames, burning
// floors and furniture, smoke, and putting it all out again.
// ============================================================
WOUND.burn = { n: "Burn", bleed: 0, heal: 240, pain: 30 };
const FIRE_MAX = 320;
function flammable(x, y){
  if (!inb(x, y)) return 0;
  const i = ix(x, y), t = tile[i], o = objs.get(i);
  if (o && !["car", "pump", "hydrant", "rock", "stairs"].includes(o.type) && OBJ[o.type].block) return .45;
  if (t === T.TREE) return .3;
  if (t === T.GRASS) return G.rain || G.snow > .1 ? .02 : winterness() > .7 ? .12 : .32;
  if (t === T.FLOOR){ const r = rooms[roomId[i]]; return r && ["bedroom", "living", "kitchen", "office", "library", "bookshop", "clothes", "auditorium", "chapel"].includes(r.type) ? .28 : .14; }
  if (t === T.DOOR) return .2;
  return 0;
}
function igniteTile(x, y, life){
  if (!G.fires) G.fires = new Map();
  const i = ix(x, y); if (G.fires.has(i) || G.fires.size >= FIRE_MAX || !flammable(x, y)) return false;
  G.fires.set(i, { x, y, life: life || rf(12, 26), age: 0 });
  return true;
}
function igniteArea(x, y, r){
  for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++){
    if (dx * dx + dy * dy > r * r) continue;
    const tx = Math.floor(x + dx), ty = Math.floor(y + dy);
    if (!igniteTile(tx, ty) && inb(tx, ty) && [T.ROAD, T.LOT, T.WALK, T.GRAVEL, T.DIRT, T.SAND].includes(tile[ix(tx, ty)])){ if (!G.fires) G.fires = new Map(); if (!G.fires.has(ix(tx, ty)) && G.fires.size < FIRE_MAX) G.fires.set(ix(tx, ty), { x: tx, y: ty, life: rf(5, 9), age: 0, fuelless: true }); }
  }
  if (typeof sfxWhoosh === "function") sfxWhoosh(x, y);
}
function explode(x, y){
  noise(x, y, 70); G.shake = 12; fxInit && fxInit();
  for (const z of Z){ if (!z.alive) continue; const d = Math.hypot(z.x - x, z.y - y); if (d < 3.2){ z.hp -= 3.2 * (1 - d / 3.4); if (z.hp <= 0) killZombie(z, null); else { z.down = rf(2, 4); z.state = "chase"; } } }
  const pd = Math.hypot(P.x - x, P.y - y);
  if (pd < 3){ addWound(pick(["torso_u", "thigh_l", "thigh_r", "farm_l", "farm_r"]), pd < 1.6 ? "laceration" : "burn", false); P.health -= (3 - pd) * 14; G.hurt = 1; say("The blast throws you off your feet.", "#ff9a8a"); }
  igniteArea(x, y, 1.2);
  for (let k = 0; k < 14; k++) G.fx && G.fx.push && G.fx.push({ x, y, vx: rf(-3, 3), vy: rf(-3, 3), z: rf(4, 14), vz: rf(8, 20), t: rf(.4, .9), col: k % 2 ? "#3a3430" : "#e86a2a", s: rf(1, 2.4) });
  if (typeof sfxBoom === "function") sfxBoom(x, y);
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){ const f = feats.get(ix(Math.floor(x) + dx, Math.floor(y) + dy)); if (f && f.type === "win"){ f.broken = true; f.glass = true; } }
}
let fireT = 0, fireInval = null;
function stepFire(dt){
  if (!G.fires || !G.fires.size) return;
  fireT -= dt; if (fireT > 0) return; fireT = .25; const tick = .25;
  const burnt = [];
  for (const [i, f] of G.fires){
    f.age += tick;
    let rate = 1; if (G.rain && bldId[i] < 0) rate = 4;
    f.life -= tick * rate;
    if (!f.fuelless && f.age > 2 && R() < tick * .55){
      const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]);
      const nx = f.x + dx, ny = f.y + dy; if (R() < flammable(nx, ny)) igniteTile(nx, ny);
    }
    // whatever is standing in it
    for (const z of Z){ if (z.alive && (z.x | 0) === f.x && (z.y | 0) === f.y){ z.hp -= tick * .8; z.burning = 3; if (z.hp <= 0) killZombie(z, null); } }
    if ((P.x | 0) === f.x && (P.y | 0) === f.y && P.alive && !P.car){ P.health -= tick * 9; G.hurt = Math.max(G.hurt || 0, .6); if (!P.burnT || G.simT > P.burnT){ P.burnT = G.simT + 2; addWound(pick(["shin_l", "shin_r", "foot_l", "foot_r", "thigh_l"]), "burn", false); say("You're on fire! Get out of it!", "#ff9a8a"); } }
    if (f.life <= 0){ G.fires.delete(i); if (!f.fuelless) burnt.push(f); }
  }
  for (const f of burnt){
    const i = ix(f.x, f.y), o = objs.get(i);
    if (o && o.type !== "car"){ objs.delete(i); (G.removed = G.removed || []).push(i); }
    if (tile[i] === T.TREE || tile[i] === T.GRASS){ tile[i] = T.DIRT; (G.tileEdits = G.tileEdits || {})[i] = T.DIRT; }
    if (tile[i] === T.FLOOR && roomId[i] >= 0) (G.burntTiles = G.burntTiles || {})[i] = 1;
    invalidateGround(f.x, f.y);
  }
  if (G.fires.size && R() < .2) noise([...G.fires.values()][0].x, [...G.fires.values()][0].y, 8);
}
function drawFires(){
  if (!G.fires || !G.fires.size) return;
  const t = G.simT;
  for (const f of G.fires.values()){
    const [sx, sy] = S(f.x + .5, f.y + .5, 0); if (sx < -60 || sx > CW + 60 || sy < -100 || sy > CH + 60) continue;
    const h = (f.fuelless && !f.pyre ? 10 : 22) * zoom * (.8 + .2 * Math.sin(t * 9 + f.x));
    for (let k = 0; k < 3; k++){
      const ox = Math.sin(t * 7 + k * 2 + f.y) * 4 * zoom, w = (9 - k * 2) * zoom;
      const g = ctx.createLinearGradient(sx, sy, sx, sy - h * (1 - k * .2));
      g.addColorStop(0, "rgba(255,120,30,.85)"); g.addColorStop(.6, "rgba(255,200,60,.55)"); g.addColorStop(1, "rgba(255,240,180,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - w + ox * .3, sy); ctx.quadraticCurveTo(sx + ox, sy - h * .6, sx + ox * 1.2, sy - h * (1 - k * .2)); ctx.quadraticCurveTo(sx + ox * .6, sy - h * .5, sx + w + ox * .3, sy); ctx.fill();
    }
    if (!f.fuelless || f.pyre){ ctx.fillStyle = `rgba(70,66,62,${.18 + .1 * Math.sin(t * 2 + f.x)})`; for (let k = 0; k < 2; k++){ const p = (t * .5 + k * .5 + f.x * .13) % 1; ctx.beginPath(); ctx.arc(sx + Math.sin(t + k + f.y) * 6 * zoom, sy - (h + p * 40 * zoom), (5 + p * 10) * zoom, 0, 7); ctx.fill(); } }
    LIGHTS.push([sx, sy - 10 * zoom, 3.2, "255,140,50"]);
  }
}
function fireOptions(out){
  if (!G.fires || !G.fires.size) return;
  let near = null; for (const f of G.fires.values()) if (Math.hypot(f.x + .5 - P.x, f.y + .5 - P.y) < 1.8){ near = f; break; }
  if (!near) return;
  const ext = allCarried().find(it => it.id === "extinguisher" && (it.uses ?? 6) > 0), water = allCarried().find(it => it.id === "water" || it.id === "water_t");
  if (ext) out.push({ label: "Use the fire extinguisher", fn: () => act("Spraying", 1.5, () => { ext.uses = (ext.uses ?? 6) - 1; for (const [i, f] of G.fires) if (Math.hypot(f.x + .5 - P.x, f.y + .5 - P.y) < 3.2) G.fires.delete(i); say("The fire hisses out."); }) });
  if (water) out.push({ label: "Throw water on the fire", fn: () => act("Dousing", 1.2, () => { removeItem(water); giveItem(makeItem("bottle")); for (const [i, f] of G.fires) if (Math.hypot(f.x + .5 - P.x, f.y + .5 - P.y) < 1.6) G.fires.delete(i); }) });
}
Object.assign(LOOT, {});
for (const t of ["counter", "locker_fire", "shelf_hardware"]) if (LOOT[t]) LOOT[t].items.push(["extinguisher", t === "locker_fire" ? 4 : 1]);
for (const t of ["counter", "dresser", "nightstand", "desk", "bar"]) if (LOOT[t]) LOOT[t].items.push(["lighter", 2], ["matches", 2]);
