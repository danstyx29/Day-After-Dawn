// ============================================================
// Part 17: polish. Starter kits, smooth zoom with per-level caches,
// car keys / glovebox / accurate hotwiring, gas pumps, new furniture
// models, door and car prompts, dark bunkers.
// ============================================================

// ---------- jobs and starter kits ----------
SKILLS.electrical = { n: "Electrical", grp: "Crafting" };
OCCS.mechanic = { n: "Mechanic", pts: -2, sk: { mechanics: 3, electrical: 1 }, d: "Knows cars inside out and can hotwire one straight away.", shirt: "#3a4a6a" };
OCCS.burglar.d = "Quiet on their feet, quick to slip away, and can hotwire cars.";
var KITS = {
  unemployed: [["chips", 1], ["water", 1]],
  carpenter:  [["hammer", 1, "equip"], ["nails", 1, { qty: 40 }], ["plank", 2], ["saw", 1]],
  nurse:      [["bandage", 3], ["disinf", 1], ["pills", 1], ["antibio", 1], ["needle", 1], ["tweezers", 1]],
  lumberjack: [["axe", 1, "equip"], ["water", 1]],
  burglar:    [["schoolbag", 1, "wear"], ["crowbar", 1, "equip"], ["screwdrv", 1]],
  coach:      [["bat", 1, "equip"], ["water", 1], ["candy", 2]],
  mechanic:   [["screwdrv", 1], ["gascan", 1, { fuel: .6 }], ["hammer", 1, "equip"]],
};
function kitText(occ){ if (!KITS) return ""; const k = KITS[occ] || []; return k.length ? " Kit: " + k.map(([id, n]) => (n > 1 ? n + " " : "") + ITEMS[id].n.toLowerCase()).join(", ") + "." : ""; }
function giveKit(){
  for (const id of ["tshirt", "jeans", "sneakers", "belt"]){ const it = makeItem(id); it.worn = true; giveItem(it); }
  if (CFG.kitOn === false) return;
  const kit = KITS[P.occ] || [];
  for (const [id, n, opt] of kit){
    for (let i = 0; i < n; i++){
      const it = makeItem(id);
      if (ITEMS[id].fresh) it.age = 0;
      if (opt && typeof opt === "object") Object.assign(it, opt);
      if (opt === "wear"){ P.bag = it; continue; }
      giveItem(it);
      if (opt === "equip") P.weapon = it;
    }
  }
}

// ---------- zoom: fixed levels, a cache per level, smooth CSS transition, baking spread over frames ----------
const ZLEVELS = [0.55, 0.7, 0.85, 1.05, 1.3, 1.6, 1.95];
const CACHES = new Map(); let CUR_CACHE = null;
const BAKE = { g: 0, r: 0, s: 0 };
function useZoomCache(){
  const key = zoom.toFixed(3) + "@" + DPR;
  let c = CACHES.get(key);
  if (!c){ c = { G: new Map(), R: new Map(), S: new Map(), z: zoom, d: DPR }; CACHES.set(key, c); }
  else { CACHES.delete(key); CACHES.set(key, c); }
  while (CACHES.size > 3) CACHES.delete(CACHES.keys().next().value);
  GCH = c.G; RCH = c.R; SPR = c.S; CUR_CACHE = c;
  BAKE.g = 2; BAKE.r = 3; BAKE.s = 70;
}
function clearAllCaches(){ CACHES.clear(); CUR_CACHE = null; GCH = new Map(); RCH = new Map(); SPR = new Map(); }
function fallbackBlock(layer, bx, by, left, top, g){
  for (const c of CACHES.values()){
    if (c === CUR_CACHE || c.d !== DPR) continue;
    const r = zoom / c.z, m = layer === "G" ? c.G : c.R;
    const a0 = Math.floor(bx / r), a1 = Math.floor(((bx + 1) * GB - 1) / r / GB), b0 = Math.floor(by / r), b1 = Math.floor(((by + 1) * GB - 1) / r / GB);
    let any = false;
    g.save(); g.beginPath(); g.rect(bx * GB - left, by * GB - top, GB, GB); g.clip();
    for (let oy = b0; oy <= b1; oy++) for (let ox = a0; ox <= a1; ox++){
      const e = m.get(ox + "," + oy); if (!e) continue;
      if (layer === "R" && !e.has) continue;
      g.drawImage(layer === "G" ? e : e.c, ox * GB * r - left, oy * GB * r - top, GB * r, GB * r); any = true;
    }
    g.restore();
    if (any) return true;
  }
  return false;
}
function drawGroundBlock(bx, by, left, top){
  if (GCH.has(bx + "," + by) || BAKE.g-- > 0 || !fallbackBlock("G", bx, by, left, top, ctx)) ctx.drawImage(blockCanvas(bx, by), bx * GB - left, by * GB - top, GB, GB);
}
function drawRoofBlock(bx, by, left, top){
  if (RCH.has(bx + "," + by) || BAKE.r-- > 0){ const e = roofBlock(bx, by); if (!e.has) return false; rctx.drawImage(e.c, bx * GB - left, by * GB - top, GB, GB); return true; }
  if (fallbackBlock("R", bx, by, left, top, rctx)) return true;
  const e = roofBlock(bx, by); if (!e.has) return false; rctx.drawImage(e.c, bx * GB - left, by * GB - top, GB, GB); return true;
}
// forget cached ground/roof images covering a world rectangle, at every zoom level
function invalidateWorldRect(x0, y0, x1, y1){
  for (const c of CACHES.values()){
    const hw_ = 32 * c.z, hh_ = 16 * c.z, lift = CFG.WALLH * c.z;
    const px0 = Math.floor((x0 - y1 - 1) * hw_ / GB) - 1, px1 = Math.floor((x1 + 1 - y0) * hw_ / GB) + 1;
    const py0 = Math.floor(((x0 + y0) * hh_ - lift) / GB) - 1, py1 = Math.floor((x1 + y1 + 2) * hh_ / GB) + 1;
    for (let by = py0; by <= py1; by++) for (let bx = px0; bx <= px1; bx++){ c.G.delete(bx + "," + by); c.R.delete(bx + "," + by); }
  }
}
function invalidateGround(x, y){ invalidateWorldRect(x - 1, y - 1, x + 2, y + 2); }
let zoomCool = 0;
function zoomWheel(e){
  if (!G) return;
  const now = performance.now(); if (now < zoomCool) return; zoomCool = now + 120;
  let i = ZLEVELS.findIndex(z => Math.abs(z - G.zoom) < .01); if (i < 0) i = 3;
  const ni = clamp(i + (e.deltaY < 0 ? 1 : -1), 0, ZLEVELS.length - 1); if (ni === i) return;
  const old = G.zoom; G.zoom = ZLEVELS[ni];
  cv.style.transition = "none"; cv.style.transform = `scale(${old / G.zoom})`; void cv.offsetWidth;
  cv.style.transition = "transform .18s ease-out"; cv.style.transform = "scale(1)";
}
const snapZoom = z => ZLEVELS.reduce((a, b) => Math.abs(b - z) < Math.abs(a - z) ? b : a);

// ---------- vehicles: keys, glovebox, accurate hotwiring, pumps ----------
LOOT.glove = { rolls: [0, 2], items: [["candy", 3], ["cigs", 3], ["watch", 1], ["mag", 2], ["bandage", 1], ["pills", 1], ["batteries", 1]] };
function rollGlove(c){
  if (!c.glove){ const o = {}; rollLoot(o, "glove"); c.glove = o.items; if (c.gloveKey){ c.glove.push({ id: "carkey", car: c.uid, label: CAR_NAMES[c.col] || "old" }); c.gloveKey = false; } }
  return c.glove;
}
const hasKeyFor = c => allCarried().some(it => it.id === "carkey" && it.car === c.uid);
const canHotwire = () => P.occ === "burglar" || (skill("mechanics") >= 2 && skill("electrical") >= 1);
function vehOptions(out){
  if (P.car){
    const c = P.car; out.length = 0;
    out.push({ label: "Get out", fn: exitCar });
    if (c.on) out.push({ label: "Turn off the engine", fn: () => { c.on = false; } });
    else if (c.key || c.hot || hasKeyFor(c)) out.push({ label: c.key ? "Start the engine" : hasKeyFor(c) ? "Start it with your key" : "Start the engine (hotwired)", off: c.fuel <= 0 || c.cond <= 0, fn: () => {
      act("Starting", .9, () => { if (c.fuel <= 0) return say("Out of gas."); { const bp = carParts(c); if (!bp.battery || bp.battery.charge < .05) return say("Click... click. The battery's dead."); bp.battery.charge -= .01; } if (R() < (c.cond < 30 ? .5 : .05)) return say("It coughs and won't catch. Try again.");
        c.on = true; noise(c.x, c.y, 20); sfx.thump(.5); say("The engine turns over."); }); } });
    else if (canHotwire()) out.push({ label: "Hotwire the engine", fn: () => act("Hotwiring", Math.max(2.5, 6 - skill("electrical") * .6), () => {
      const ch = P.occ === "burglar" ? .6 : .3 + skill("electrical") * .12;
      if (R() < ch){ c.hot = true; say("Sparks, then the dash lights up."); addXP("electrical", 8); addXP("mechanics", 4); }
      if (c.alarm && R() < .25 - skill("electrical") * .03){ c.alarmOn = 20; c.alarm = false; say("You trip the alarm!", "#ff9a8a"); }
      else { say("Nothing. Wrong wires. Try again."); addXP("electrical", 3); } }, { noise: 4, noiseEvery: 2 }) });
    else out.push({ label: "Hotwire it (needs Mechanics 2 and Electrical 1)", off: true });
    out.push({ label: "Search the glovebox", fn: openInv });
    out.push({ label: "Check the gauges", fn: () => say(`Fuel ${Math.round(c.fuel * 100)}%, condition ${Math.round(c.cond)}%.`) });
    return;
  }
  const c = nearestCar(1.0); if (!c) return;
  if (c.locked && !hasKeyFor(c)){
    out.push({ label: "The car is locked", off: true });
    out.push({ label: "Smash a window to get in", fn: () => act("Smashing the window", 1.2, () => {
      c.locked = false; c.broken = true; sfx.glass(1); noise(c.x, c.y, 18); if (c.alarm){ c.alarmOn = 25; c.alarm = false; say("WHOOP WHOOP WHOOP. The car alarm screams.", "#ff9a8a"); }
      if (!P.weapon && R() < .5){ addWound(pick(["hand_l", "hand_r", "farm_r"]), "glass", false); say("The glass cuts your hand.", "#ff9a8a"); } }) });
  } else out.push({ label: c.locked ? "Unlock it with your key and get in" : "Get in the driver's seat", fn: () => { c.locked = false; enterCar(c); } });
  const [u] = carLocal(c, P.x, P.y);
  if (!c.locked && u < -.3) out.push({ label: "Open the trunk", fn: openInv });
  const can = allCarried().find(it => it.id === "gascan");
  if (can && c.fuel > 0 && can.fuel < 1) out.push({ label: "Siphon gas into your gas can", fn: () => act("Siphoning", 6, () => {
    const moved = Math.min(c.fuel, (1 - can.fuel) * .4); c.fuel -= moved; can.fuel += moved / .4; say(`You siphon off ${Math.round(moved * 100)}% of a tank.`); }) });
  if (can && can.fuel > 0 && c.fuel < 1) out.push({ label: "Pour your gas can into the tank", fn: () => act("Refuelling", 5, () => {
    const moved = Math.min(can.fuel * .4, 1 - c.fuel); c.fuel += moved; can.fuel -= moved / .4; say(`Tank now at ${Math.round(c.fuel * 100)}%.`); }) });
  out.push({ label: "Open the hood (mechanics)", fn: () => openMech(c) });
  out.push({ label: "Look the car over", fn: () => say(`Looks like ${c.cond > 70 ? "it runs well" : c.cond > 35 ? "it's seen better days" : "it's barely holding together"}. ${c.key ? "Keys in the ignition." : "No keys in the ignition."}`) });
}
function pumpOptions(o, out){
  if (!powerOn()){ out.push({ label: "The pump is dead without power", off: true }); return; }
  const can = allCarried().filter(it => it.id === "gascan" && it.fuel < 1).sort((a, b) => a.fuel - b.fuel)[0];
  out.push({ label: can ? "Fill your gas can" : "Fill a gas can (you have none)", off: !can, fn: () => act("Pumping gas", 4, () => { can.fuel = 1; noise(o.x, o.y, 4); }) });
  const c = V.find(c => Math.hypot(c.x - o.x - .5, c.y - o.y - .5) < 3.4);
  if (c) out.push({ label: `Refuel the ${CAR_NAMES[c.col] || "nearby"} car`, off: c.fuel >= .99, fn: () => act("Refuelling", 6, () => { c.fuel = 1; say("Tank full."); }) });
}

// ---------- textures, walls and roofs for the new room types ----------
TEX.void = "#0d0f12";
ICON.carkey = ["key", "#d8c060"]; ICON.nightstick = ["bat", "#2a2a2a"];
(function texAliases(){
  const A = { reception: "pharmacy", ward: "pharmacy", staff: "kitchen", storage: "hardware", lobby: "grocery", classroom: "living", gym: "living",
    cafeteria: "kitchen", office: "bedroom", lockers: "hardware", cell: "hardware", chapel: "living", warehouse: "hardware", bunkroom: "hardware", gasshop: "grocery", motelroom: "bedroom" };
  for (const k in A) TEX["floor_" + k] = TEX["floor_" + A[k]];
  Object.assign(ROOMWALL, { reception: "#dfe3e0", ward: "#d8e2e0", staff: "#d6d0c0", storage: "#bdb8ac", lobby: "#d8d4c8", classroom: "#d8cdb0", gym: "#c8c0a8",
    cafeteria: "#d8d2bc", office: "#c8c4b8", lockers: "#a8b0b0", cell: "#9aa09a", chapel: "#d8ccb0", warehouse: "#a8a49a", bunkroom: "#8a8e84", gasshop: "#d8d4c8", motelroom: "#c4b8a4" });
  const [c, g] = mkCanvas(128, 128);
  g.fillStyle = "#4a5e34"; g.fillRect(0, 0, 128, 128);
  speckle(g, 128, 128, 9000, ["#3a4e28", "#5a703e", "#6a7a40", "#2e3e22"], .8, 1.4);
  g.fillStyle = "rgba(6,8,12,.3)"; g.fillRect(0, 0, 128, 128);
  ROOF_PAT.grass = pattern(c, 1 / PPT, 1 / PPT);
})();
function roofKey(b){
  const k = buildings[b].kind;
  if (k === "bunker") return "grass";
  if (k === "house" || k === "church" || k === "motel" || k === "trailer" || k === "barn") return b % ROOFC.length;
  return "flat";
}

// ---------- inside a windowless bunker it is always dark ----------
function darkness(){
  let d = darknessBase();
  if (P && tile && typeof realXY === "function"){ const rr = realXY(P.x, P.y); if (rr.lvl < 0) d = Math.max(d, powerOn() ? .3 : .86); }
  if (P && tile){ const [sx, sy] = sideTile(P.x, P.y); if (inb(sx, sy)){ const b = bldId[ix(sx, sy)]; if (b >= 0 && tile[ix(sx, sy)] === T.FLOOR && buildings[b].kind === "bunker") d = Math.max(d, .84); } }
  return d;
}

// ---------- context prompts: doors and cars ----------
function updatePrompt(){
  let pr = $("prompt"); if (!pr){ pr = el("div", "osd"); pr.id = "prompt"; document.body.appendChild(pr); }
  let txt = "";
  if (G && G.running && !G.paused && P.alive && ![..."inv,health,skills,map,ctx,craft".split(",")].some(panelOpen)){
    if (P.car) txt = "E  car menu";
    else {
      let best = null, bd = 1.9;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){
        const f = feats.get(ix(Math.floor(P.x) + dx, Math.floor(P.y) + dy)); if (!f || f.type !== "door" || f.broken) continue;
        const d = Math.hypot(f.x + .5 - P.x, f.y + .5 - P.y); if (d < bd){ bd = d; best = f; }
      }
      if (best) txt = best.open ? "Q  close the door" : best.bar ? "Door is barricaded" : best.locked ? "Q  door is locked" : "Q  open the door";
      else { const c = nearestCar(1.0); if (c) txt = c.locked && !hasKeyFor(c) ? "E  car is locked" : "E  get in the car"; }
    }
  }
  pr.textContent = txt; pr.style.opacity = txt ? 1 : 0;
}

// ---------- models for the new furniture ----------
function drawObj2(o, dim, a){
  const M = Model(o, dim, a), METAL = "#7a7e82";
  switch (o.type){
    case "desk":
      for (const [u, v] of [[.12, .2], [.82, .2], [.12, .74], [.82, .74]]) M.part(u, v, u + .06, v + .06, 0, 12, "#4a3a2a");
      M.part(.1, .18, .9, .82, 12, 14, "#8a6a48", () => { if (hash(o.x, o.y) < .5) M.part(.3, .35, .55, .6, 14, 15, "#e8e4d8"); });
      break;
    case "table":
      for (const [u, v] of [[.12, .12], [.82, .12], [.12, .82], [.82, .82]]) M.part(u, v, u + .06, v + .06, 0, 13, "#4a3a2a");
      M.part(.06, .06, .94, .94, 13, 15, "#9a7a58");
      break;
    case "locker":
      M.part(.12, .04, .88, .5, 0, 40, "#5a6e86", () => {
        M.frontLine(.5, 2, .5, 38, .5, "#3a4a5e", 1);
        for (const z of [33, 31, 29]){ M.frontLine(.2, z, .4, z, .5, "#3a4a5e", .8); M.frontLine(.6, z, .8, z, .5, "#3a4a5e", .8); }
        M.front(.42, .46, .5, 18, 22, "#c8c8c8"); M.front(.54, .58, .5, 18, 22, "#c8c8c8");
      });
      break;
    case "pew":
      M.part(0, .35, 1, .8, 6, 8.5, "#7a5638");
      M.part(.02, .38, .08, .78, 0, 6, "#5a3e28"); M.part(.92, .38, .98, .78, 0, 6, "#5a3e28");
      M.part(0, .2, 1, .32, 6, 17, "#6b4a30");
      break;
    case "pump":
      M.part(.25, .25, .75, .75, 0, 3, "#6a6a64");
      M.part(.3, .32, .7, .68, 3, 26, "#d8d4c8", () => { M.top(.32, .34, .68, .66, 26.05, "#b8302a"); });
      M.part(.31, .31, .69, .35, 14, 21, "#2a3a2a");
      M.line(.7, .5, 18, .9, .7, 6, "#1a1a1a", 1.4);
      break;
    case "vending":
      M.part(.12, .06, .88, .6, 0, 40, "#a8302a", () => {
        M.front(.18, .62, .6, 8, 36, "#1e2a32");
        for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) M.front(.21 + k * .14, .31 + k * .14, .6, 11 + r * 6.5, 15 + r * 6.5, ["#e8c040", "#3a8ae0", "#e04a3a", "#5ac04a"][(r + k + o.x) % 4]);
        M.front(.68, .8, .6, 22, 28, "#d8d8d0");
      });
      break;
    case "filecab":
      M.part(.2, .06, .8, .55, 0, 26, METAL, () => {
        for (const [z0, z1] of [[2, 9], [10, 17], [18, 25]]){ M.front(.24, .76, .55, z0, z1, "#6a6e72", .8); M.front(.44, .56, .55, (z0 + z1) / 2, (z0 + z1) / 2 + 1, "#c8c8c8"); }
      });
      break;
    case "armycrate":
      M.part(.08, .2, .92, .8, 0, 13, "#4e5a36", () => { M.top(.08, .2, .92, .26, 13.05, "#3e4a2a"); M.top(.3, .4, .7, .6, 13.05, "#6a7650"); });
      break;
    case "hbed":
      M.part(.08, 0, .92, .08, 0, 18, "#a8acb0");
      M.part(.08, .06, .92, 1, 0, 8, "#c8ccd0");
      M.part(.1, .08, .9, .98, 8, 11, "#dfe8ec");
      M.part(.2, .1, .8, .3, 11, 13, "#f5f5f2");
      M.part(.1, .45, .9, .98, 10.5, 11.6, "#9ab8c8");
      break;
    case "bunk":
      for (const [u, v] of [[.06, .04], [.88, .04], [.06, .9], [.88, .9]]) M.part(u, v, u + .06, v + .06, 0, 30, "#4a4e44");
      M.part(.08, .06, .92, .96, 4, 8, "#7a806e"); M.part(.08, .06, .92, .96, 20, 24, "#7a806e");
      break;
    case "sandbag":
      for (let r = 0; r < 2; r++) M.part(.04, .2, .96, .8, r * 6, r * 6 + 6, r ? "#9a8a66" : "#8a7a58");
      break;
    default: return drawDecor(o, dim, a);
  }
  M.draw();
  if (o.type === "pump") drawCanopy(o, dim, a);
  return true;
}

// ---------- compact saves: the world rebuilds from its seed, only changes are stored ----------
function snapshot(){
  if (REG_JOB) finishRegionJob();
  const carried = allCarried();
  const Pc = Object.assign({}, P, { traits: [...P.traits], weaponIdx: P.weapon ? carried.indexOf(P.weapon) : -1, carIdx: P.car ? V.indexOf(P.car) : -1,
    weapon: null, car: null, action: null, queue: [], swing: null, speech: null, sleeping: false });
  const g = {}; for (const k of ["min", "startMin", "waterOff", "powerOff", "heliAt", "heliDone", "powerMsg", "waterSet", "metaT", "weatherT", "rain", "zoom", "startBld", "corpses", "alarms", "built", "branches", "seed", "runId", "removed", "tileEdits", "gens", "ropes", "marks", "genKnow", "preset", "dayLen", "erosion", "snow", "tempJitter", "fog", "fogTarget", "lightsOff", "devices", "burntTiles", "hardHUD", "utilSet", "sandbox"]) g[k] = G[k];
  g.blood = G.blood.slice(-300);
  const r2 = v => Math.round(v * 100) / 100;
  return { v: 2, an: animalsSave(), when: Date.now(), name: P.name, occ: P.occ, day: daysSurvived(), seed: G.seed, size: W, runId: G.runId, regions: REGION_ORDER.slice(),
    explored: rle(explored),
    objs: [...objs.values()].filter(o => !o.g || o.items || o.water !== o.w0 || o.fuel !== undefined || o.hp !== undefined),
    feats: [...feats.values()].filter(f => f.open || f.broken || f.glass || f.bar || f.locked !== f.l0 || f.curtain !== f.c0 || f.hp !== f.h0)
      .map(f => [f.x, f.y, +f.open, +!!f.broken, +!!f.glass, f.bar, +!!f.locked, +!!f.curtain, f.hp, f.barHp || 0]),
    floor: [...floorItems].filter(([, l]) => l.length), bld: buildings.map(b => b.alarmUsed ? 1 : 0),
    Z: Z.concat(frozenList()).filter(z => z.alive).map(z => [r2(z.x), r2(z.y), r2(z.hp), r2(z.maxhp), z.type, z.col, z.pants, z.fake ? 1 : 0, r2(z.face), r2(z.spdJ)]),
    V, G: g, P: Pc, pockets: PK_ORDER.slice() };
}
function restore(d){
  if (d.v !== 2){ alert("This save is from an older version of the game and can't be loaded."); return; }
  CFG.W = CFG.H = d.size;
  genWorld(d.seed);
  AN = []; PENDING_PENS = []; REG_RESTORING = true; for (const k of d.regions || []) genRegionK(k); for (const [b, k] of d.pockets || []) genFloor(b, k); REG_RESTORING = false; PENDING_SPAWN = []; DEFER_SPAWN = false; if (d.an) animalsLoad(d.an);
  for (const [i, v] of Object.entries(d.G.tileEdits || {})) tile[+i] = v;
  explored.set(unrle(d.explored, W * H));
  for (const i of d.G.removed || []) objs.delete(i);
  for (const o of d.objs) objs.set(ix(o.x, o.y), o);
  for (const a of d.feats){ const f = feats.get(ix(a[0], a[1])); if (!f) continue; f.open = !!a[2]; f.broken = !!a[3]; f.glass = !!a[4]; f.bar = a[5]; f.locked = !!a[6]; f.curtain = !!a[7]; f.hp = a[8]; f.barHp = a[9]; }
  floorItems = new Map(d.floor);
  d.bld.forEach((u, k) => { if (buildings[k]) buildings[k].alarmUsed = !!u; });
  for (const [k, v] of Object.entries((d.G && d.G.lightsOff) || {})) if (buildings[+k]) buildings[+k].lightsOff = v;
  WRC.clear(); clearAllCaches(); flow = null;
  G = Object.assign({ sounds: [], vis: null, visZ: 0, anyChase: false, vit: {}, running: true, simT: 0, speedIdx: 0, fx: null, built: [], branches: {}, removed: [], tileEdits: {} }, d.G);
  G.zoom = snapZoom(G.zoom || 1.05); CFG.minPerSec = G.dayLen || 1; CAM = null; applyPreset(G.preset || "survivor"); EROSION = G.erosion || 0;
  const traits = new Set(d.P.traits);
  P = Object.assign(newPlayer(d.P.name, d.P.occ, traits), d.P, { traits });
  for (const k in SKILLS) if (!P.sk[k]) P.sk[k] = { lvl: 0, xp: 0 };
  V = d.V || [];
  P.car = d.P.carIdx >= 0 ? V[d.P.carIdx] : null;
  P.weapon = d.P.weaponIdx >= 0 ? allCarried()[d.P.weaponIdx] || null : null;
  ZFROZEN.clear(); resetPerfIndex(); Z = d.Z.map(a => Object.assign(newZombie(a[0], a[1]), { hp: a[2], maxhp: a[3], type: a[4], col: a[5], pants: a[6], fake: !!a[7], face: a[8], spdJ: a[9], state: "idle" }));
  computeVitals(); computeVis();
  for (const id of ["vitals", "equip", "stamp", "speed"]) $(id).classList.remove("hidden");
  $("title").classList.add("hidden"); $("dead").classList.add("hidden"); hidePause();
  $("log").innerHTML = ""; vitalSig = "";
  say(`${P.name}. Day ${Math.floor(daysSurvived()) + 1} of the outbreak. The tape picks up where it left off.`);
}

// refresh the title screen so the new job shows up
renderCreation();
