// ============================================================
// Part 25: firearms. Hold right mouse to aim, left click to fire,
// R to reload or clear a jam. Every shot is heard a long way off.
// ============================================================
SKILLS.aiming = { n: "Aiming", grp: "Firearms" };
SKILLS.reloading = { n: "Reloading", grp: "Firearms" };
const GUNS = {
  pistol9:   { n: "9mm Pistol", w: 1.0, ammo: "ammo9", cap: 15, dmg: [.6, 1.05], range: 11, spread: .085, noise: 60, rof: .32, rel: 2.1, mag: true, jam: .012, cond: 120 },
  revolver:  { n: ".38 Revolver", w: .9, ammo: "ammo38", cap: 6, dmg: [.75, 1.15], range: 10, spread: .08, noise: 30, rof: .42, rel: .45, perRound: true, jam: 0, cond: 160 },
  shotgun:   { n: "Pump Shotgun", w: 3.2, ammo: "shells", cap: 6, dmg: [.55, .95], range: 7.5, spread: .2, pellets: 7, noise: 90, rof: .85, rel: .55, perRound: true, two: true, jam: .006, cond: 140 },
  huntrifle: { n: "Hunting Rifle", w: 3.6, ammo: "ammo308", cap: 5, dmg: [1.4, 2.3], range: 24, spread: .035, pierce: 2, noise: 90, rof: 1.15, rel: .6, perRound: true, two: true, jam: .004, cond: 160 },
  m16:       { n: "M16 Rifle", w: 3.4, ammo: "ammo556", cap: 30, dmg: [.95, 1.45], range: 18, spread: .05, pierce: 1, noise: 80, rof: .16, rel: 2.6, mag: true, two: true, jam: .015, cond: 130 },
};
for (const [k, g] of Object.entries(GUNS)) ITEMS[k] = { id: k, n: g.n, w: g.w, cat: "weapon", skill: "aiming", gun: true, dmg: [.25, .45], range: .9, spd: .7, end: .05, cond: g.cond, kd: .45, crit: 0, two: !!g.two, tags: [] };
Object.assign(ITEMS, {
  ammo9: { n: "9mm rounds", w: .01, cat: "ammo", tags: [] }, ammo38: { n: ".38 rounds", w: .01, cat: "ammo", tags: [] }, shells: { n: "Shotgun shells", w: .03, cat: "ammo", tags: [] },
  ammo308: { n: ".308 rounds", w: .025, cat: "ammo", tags: [] }, ammo556: { n: "5.56 rounds", w: .012, cat: "ammo", tags: [] },
});
for (const k in ITEMS) ITEMS[k].id = k;
Object.assign(ICON, { pistol9: ["pistol", "#2a2a2c"], revolver: ["pistol", "#5a5e62"], shotgun: ["longgun", "#3a2a1e"], huntrifle: ["longgun", "#5a3e26"], m16: ["longgun", "#1e1e20"],
  ammo9: ["ammo", "#c8a040"], ammo38: ["ammo", "#c8a040"], shells: ["ammo", "#c83a2a"], ammo308: ["ammo", "#b8903a"], ammo556: ["ammo", "#a8883a"] });
const ammoItem = (id, n) => { const it = makeItem(id); it.qty = n; return it; };
function lootGun(id){ const it = makeItem(id); it.loaded = R() < .35 ? ri(0, GUNS[id].cap) : 0; return it; }
// where guns turn up
Object.assign(LOOT, {
  gunstore:   { rolls: [1, 3], items: [["pistol9", 3], ["revolver", 3], ["shotgun", 3], ["huntrifle", 2], ["ammo9", 5], ["ammo38", 4], ["shells", 5], ["ammo308", 3], ["ammo556", 1]] },
  armory:     { rolls: [1, 3], items: [["pistol9", 4], ["shotgun", 3], ["m16", 1], ["ammo9", 6], ["shells", 4], ["ammo556", 2], ["nightstick", 2]] },
  gunhouse:   { rolls: [0, 2], items: [["shotgun", 3], ["huntrifle", 3], ["revolver", 2], ["shells", 4], ["ammo308", 3], ["ammo38", 3]] },
  surplus:    { rolls: [1, 4], items: [["boots", 4], ["wintercoat", 2], ["gloves", 3], ["hunting", 3], ["backpack", 3], ["duffel", 2], ["water", 2], ["batteries", 2], ["ammo556", 1], ["candle", 2]] },
});
const addL = (t, list) => { if (LOOT[t]) LOOT[t].items.push(...list); };
addL("locker_police", [["pistol9", 2], ["revolver", 1], ["ammo9", 3], ["ammo38", 2], ["shells", 1]]);
addL("army", [["m16", 1], ["ammo556", 3], ["pistol9", 1], ["ammo9", 2]]);
addL("camp", [["huntrifle", 2], ["ammo308", 3], ["shotgun", 1], ["shells", 2]]);
addL("trunk_police", [["shotgun", 2], ["shells", 2], ["ammo9", 2]]);
addL("trunk_army", [["m16", 1], ["ammo556", 3]]);
addL("wardrobe", [["revolver", .3], ["ammo38", .5]]);
addL("safehouse", [["shotgun", 1], ["shells", 2], ["pistol9", 1], ["ammo9", 2]]);
// a box of rounds is a stack, not a single bullet
const _rollLoot = rollLoot;
const AMMO_BOX = { ammo9: [10, 30], ammo38: [6, 24], shells: [4, 12], ammo308: [5, 20], ammo556: [10, 30] };
function fixLootStacks(o){ for (const it of o.items || []){ if (AMMO_BOX[it.id] && !it.qty) it.qty = ri(...AMMO_BOX[it.id]); if (GUNS[it.id] && it.loaded === undefined) it.loaded = R() < .35 ? ri(0, GUNS[it.id].cap) : 0; } }
// jobs that come with training
OCCS.police = { n: "Police Officer", pts: -4, sk: { aiming: 3, reloading: 2 }, d: "Trained with a sidearm. Steady under pressure.", shirt: "#1e2a44" };
OCCS.veteran = { n: "Veteran", pts: -6, sk: { aiming: 2, reloading: 2 }, d: "Seen worse. Panics far less and handles any gun.", shirt: "#4a5636" };
if (typeof KITS !== "undefined"){ KITS.police = [["revolver", 1, "equip"], ["ammo38", 1, { qty: 12 }], ["bandage", 1]]; KITS.veteran = [["hunting", 1, "equip"], ["water", 1], ["bandage", 2]]; }

// ---------- shooting ----------
const gunOf = () => P.weapon && GUNS[P.weapon.id] ? GUNS[P.weapon.id] : null;
const ammoCount = id => allCarried().filter(it => it.id === id).reduce((s, it) => s + (it.qty || 1), 0);
function spreadNow(g){
  const aim = skill("aiming");
  return g.spread * (1 + (P.panic || 0) / 55) * (P.moving ? 1.7 : 1) * (1 - aim * .065) * (P.occ === "veteran" ? .85 : 1) * ((P.btemp ?? 37) < 35.8 ? 1.3 : 1) * (G.vit && G.vit.winded >= 2 ? 1.2 : 1);
}
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
let TRACERS = [], MUZZLE = 0;
function fireGun(){
  const it = P.weapon, g = gunOf(); if (!g) return false;
  if ((P.shootCd || 0) > 0 || P.sleeping || P.stagger > 0) return true;
  aimAtMouse();
  if (it.jammed){ sfx.thump(.15); say("Jammed. Press R to clear it."); P.shootCd = .3; return true; }
  if (!(it.loaded > 0)){ gunClick(); say("*click* Empty. Press R to reload."); P.shootCd = .3; return true; }
  // a worn gun jams more
  const wear = 1 - (it.cond ?? g.cond) / g.cond;
  if (g.jam && R() < g.jam * (1 + wear * 4)){ it.jammed = true; gunClick(); say("It jams!", "#ffd27a"); P.shootCd = .4; return true; }
  it.loaded--; P.shootCd = g.rof * (1 - skill("aiming") * .02);
  it.cond = Math.max(1, (it.cond ?? g.cond) - .25);
  cancelActions();
  const sp = spreadNow(g), aim = skill("aiming");
  const ox = P.x + Math.cos(P.face) * .35, oy = P.y + Math.sin(P.face) * .35;
  const hits = new Map();
  const n = g.pellets || 1;
  for (let k = 0; k < n; k++){
    const a = P.face + gauss() * sp * (g.pellets ? 1.6 : 1);
    let pierce = g.pierce || 0, end = g.range;
    const cand = Z.filter(z => z.alive && !z.fake && Math.abs(z.x - P.x) < g.range + 1 && Math.abs(z.y - P.y) < g.range + 1)
      .map(z => { const dx = z.x - ox, dy = z.y - oy, along = dx * Math.cos(a) + dy * Math.sin(a), off = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)); return { z, along, off }; })
      .filter(c => c.along > 0 && c.along < g.range && c.off < (c.z.down > 0 ? .42 : .34))
      .sort((p, q) => p.along - q.along);
    for (const c of cand){
      if (!los(ox, oy, c.z.x, c.z.y)) { end = Math.min(end, c.along); break; }
      // long shots are harder; skill helps
      const falloff = c.along > g.range * .55 ? 1 - (c.along - g.range * .55) / (g.range * .45) * (.6 - aim * .04) : 1;
      if (R() > falloff) continue;
      hits.set(c.z, (hits.get(c.z) || 0) + 1);
      end = c.along;
      if (pierce-- <= 0) break;
    }
    // walls stop the round too
    let wx = ox, wy = oy; for (let d = 0; d < end; d += .25){ wx = ox + Math.cos(a) * d; wy = oy + Math.sin(a) * d; bulletGlass(wx, wy); if (pointOpaque(wx, wy)){ end = d; break; } }
    rayAnimals(ox, oy, a, end, g);
    TRACERS.push({ x0: ox, y0: oy, x1: ox + Math.cos(a) * end, y1: oy + Math.sin(a) * end, t: .09 });
  }
  for (const [z, h] of hits){
    const head = R() < .08 + aim * .025;
    let dmg = rf(g.dmg[0], g.dmg[1]) * h * (1 + aim * .04) * (head ? 2.4 : 1);
    z.hp -= dmg; z.flash = .12; z.state = "chase"; z.mem = CFG.zMemory;
    fxBlood(z.x, z.y, head ? 10 : 5, P.face); addBlood(z.x, z.y, 1);
    if (z.hp <= 0){ killZombie(z, "aiming"); if (head) fxText && fxText(z.x, z.y, "headshot"); }
    else if (R() < (g.pellets ? .35 : .2) + dmg * .1){ z.down = rf(1.2, 2.4); z.lunge = 0; }
    else z.stun = Math.max(z.stun || 0, .25);
    addXP("aiming", g.pellets ? 1 : 2.5);
  }
  noise(P.x, P.y, g.noise);
  MUZZLE = .06; G.shake = Math.max(G.shake || 0, g.two ? 5 : 3); fxInit();
  P.face += gauss() * .05 * (g.two ? 1.4 : 1);
  P.panic = Math.max(0, (P.panic || 0) - 2);
  P.strain = Math.min(100, (P.strain || 0) + (g.two ? .9 : .4));
  gunSound(g);
  return true;
}
function reloadGun(){
  const it = P.weapon, g = gunOf(); if (!g) return;
  if (it.jammed){ act("Clearing the jam", 1.1, () => { it.jammed = false; say("Cleared."); }); return; }
  if ((it.loaded || 0) >= g.cap) return say("Already full.");
  if (ammoCount(g.ammo) <= 0) return say(`No ${ITEMS[g.ammo].n.toLowerCase()}.`);
  const rl = skill("reloading"), per = g.rel * (1 - rl * .06);
  const take = () => { const st = allCarried().find(i => i.id === g.ammo); if (!st) return false; if ((st.qty || 1) > 1) st.qty--; else removeItem(st); return true; };
  if (g.mag){
    act("Reloading", per, () => { let n = 0; while ((it.loaded || 0) < g.cap && take()){ it.loaded = (it.loaded || 0) + 1; n++; } addXP("reloading", 3); say(`${it.loaded} in the magazine.`); }, { noise: 2, noiseEvery: 1 });
  } else {
    const loadOne = () => act("Loading a round", per, () => { if (!take()) return; it.loaded = (it.loaded || 0) + 1; addXP("reloading", .8); if (it.loaded < g.cap && ammoCount(g.ammo) > 0) loadOne(); }, { noise: 1, noiseEvery: 1 });
    loadOne();
  }
}
function gunClick(){ if (!AMB.ac) return; const t = AMB.ac.currentTime, o = AMB.ac.createOscillator(), gn = AMB.ac.createGain(); o.type = "square"; o.frequency.value = 1800; gn.gain.setValueAtTime(.05, t); gn.gain.exponentialRampToValueAtTime(.001, t + .04); o.connect(gn); gn.connect(AMB.ac.destination); o.start(t); o.stop(t + .05); }
function gunSound(g){
  if (!AMB.ac) return;
  const ac = AMB.ac, t = ac.currentTime, len = Math.floor(ac.sampleRate * .5), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, g.two ? 3 : 5);
  const s = ac.createBufferSource(); s.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(g.pellets ? 2600 : 4200, t); f.frequency.exponentialRampToValueAtTime(300, t + .35);
  const gn = ac.createGain(); gn.gain.setValueAtTime(g.noise > 60 ? .6 : g.noise > 40 ? .45 : .3, t);
  s.connect(f); f.connect(gn); gn.connect(ac.destination); s.start(t);
  const o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + .2); og.gain.setValueAtTime(.35, t); og.gain.exponentialRampToValueAtTime(.001, t + .25); o.connect(og); og.connect(ac.destination); o.start(t); o.stop(t + .3);
}
function stepGuns(dt){
  if (P.shootCd > 0) P.shootCd -= dt;
  MUZZLE = Math.max(0, MUZZLE - dt);
  for (const t of TRACERS) t.t -= dt; TRACERS = TRACERS.filter(t => t.t > 0);
  // hold the trigger on the M16
  if (lmbDown && rmb && P.weapon && P.weapon.id === "m16" && !(P.shootCd > 0)) fireGun();
}
let lmbDown = false;
addEventListener("mouseup", e => { if (e.button === 0) lmbDown = false; });
addEventListener("keydown", e => {
  if ((e.key === "r" || e.key === "R") && G && G.running && !G.paused && !(document.activeElement && document.activeElement.tagName === "INPUT")){ if (gunOf()) reloadGun(); }
});
// what aiming looks like: the reticle opens up when you're shaky
function drawAimFx(){
  for (const t of TRACERS){ const a = S(t.x0, t.y0, 26), b = S(t.x1, t.y1, 22); ctx.strokeStyle = `rgba(255,230,160,${t.t / .09 * .8})`; ctx.lineWidth = Math.max(1, 1.2 * zoom); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  if (MUZZLE > 0){ const [mx, my] = S(P.x + Math.cos(P.face) * .7, P.y + Math.sin(P.face) * .7, 26); const gr = ctx.createRadialGradient(mx, my, 0, mx, my, 16 * zoom); gr.addColorStop(0, "rgba(255,240,180,.95)"); gr.addColorStop(1, "rgba(255,170,60,0)"); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(mx, my, 16 * zoom, 0, 7); ctx.fill(); LIGHTS.push([mx, my, 5, "255,200,120"]); }
  const g = gunOf(); if (!g || !rmb || P.car) return;
  const [wx, wy] = toWorld(mouse.x, mouse.y + 30 * zoom), d = Math.min(g.range, Math.hypot(wx - P.x, wy - P.y));
  const r = Math.max(4, Math.tan(spreadNow(g) * (g.pellets ? 1.6 : 1)) * d * hw * 1.4);
  ctx.strokeStyle = d >= g.range - .1 ? "rgba(255,120,100,.7)" : "rgba(230,240,220,.75)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(mouse.x, mouse.y, r, 0, 7); ctx.stroke();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ ctx.beginPath(); ctx.moveTo(mouse.x + dx * (r + 2), mouse.y + dy * (r + 2)); ctx.lineTo(mouse.x + dx * (r + 8), mouse.y + dy * (r + 8)); ctx.stroke(); }
}
// the gun in your hands
function gunArt(id){ const g = GUNS[id]; return { len: g.two ? 13 : 4.5, thick: g.two ? 1.7 : 2.2, two: g.two, col: id === "huntrifle" || id === "shotgun" ? "#4a3220" : "#202022", gun: true }; }
function drawPlayer(){
  if (P.car) return;
  const sw = P.swing ? { kind: P.swing.kind, p: P.swing.t / P.swing.dur } : null;
  const mode = P.sneaking ? "sneak" : (P.running && P.moving) ? "run" : "walk";
  const g = gunOf(), aimG = g && rmb;
  const outfit = playerOutfit();
  drawRig(P.x, P.y, {
    face: P.face, phase: P.walkPhase, move: P.moveBlend || 0, mode, idle: G.simT * 2,
    shirt: outfit.shirt, sleeve: outfit.shirt, pants: outfit.pants, shoes: outfit.shoes, skin: "#d9ae88", hair: "#3a2a1e", hat: outfit.hat, hatCol: outfit.hatCol,
    weapon: P.weapon && !aimG ? (g ? gunArt(P.weapon.id) : weaponArt(P.weapon.id)) : null, swing: sw && sw.kind !== "stomp" ? sw : null, stomp: sw && sw.kind === "stomp" ? sw.p : 0,
    blood: P.wounds.some(w => w.bleed && !w.bandaged),
  });
  if (aimG){
    const c = Math.cos(P.face), s = Math.sin(P.face), px = -s, py = c, len = g.two ? .78 : .5;
    const grip = [P.x + c * .32, P.y + s * .32, 27], tip = [P.x + c * (.32 + len), P.y + s * (.32 + len), 28];
    for (const k of [-1, 1]) line3([P.x + px * .13 * k, P.y + py * .13 * k, 29], grip, "#d9ae88", 2.4, 1);
    if (g.two){ line3([P.x - c * .05, P.y - s * .05, 26], grip, "#4a3220", 3, 1); }
    line3(grip, tip, P.weapon.id === "huntrifle" || P.weapon.id === "shotgun" ? "#3a2618" : "#18181a", g.two ? 2.4 : 2.8, 1);
    line3([grip[0] + c * len * .5, grip[1] + s * len * .5, 28.2], tip, "#2a2a2c", 1.4, 1);
  }
}
// clothes you're wearing show on you
function playerOutfit(){
  const wn = typeof worn === "function" ? worn() : [], by = sl => wn.find(it => ITEMS[it.id].slot === sl);
  const COL = { tshirt: OCCS[P.occ].shirt, flannel: "#8a3a2a", sweater: "#6a5a4a", hoodie: "#4a4e58", denimjacket: "#3a5a8a", leatherjacket: "#2a2220", wintercoat: "#2a3a4a", raincoat: "#c8b030",
    jeans: "#2e3a4a", cargo: "#5a5a3a", sweatpants: "#5a5a5e", sneakers: "#d8d4cc", boots: "#4a3220", woolhat: "#7a2a2a", cap: "#2a4a8a" };
  const j = by("jacket"), t = by("top"), p = by("pants"), sh = by("shoes"), h = by("hat");
  return { shirt: j ? COL[j.id] : t ? COL[t.id] || OCCS[P.occ].shirt : "#d9ae88", pants: p ? COL[p.id] : "#3a3430", shoes: sh ? COL[sh.id] : "#c8a080", hat: h ? (h.id === "cap" ? "cap" : "helmet") : null, hatCol: h ? COL[h.id] : null };
}
