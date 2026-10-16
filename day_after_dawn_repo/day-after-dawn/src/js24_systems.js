// ============================================================
// Part 24: the systems from the research list.
// Clothing, wetness and body temperature; colds; seasons, snow and
// thunder; generators; sheet ropes, jumping and smashing stairs;
// stories; foraging; difficulty presets; junk, stash maps, candles,
// torches; Lightfooted; car alarms; keys on the dead; sunlight
// through windows; quiet corridors; corpse sickness; muscle strain;
// getting used to it; the world growing over.
// ============================================================

// ---------- items ----------
const CLOTHES = {
  tshirt:      { n: "T-shirt", slot: "top", ins: .12, wind: .05, water: .05, bite: .05, scr: .15, w: .2 },
  flannel:     { n: "Flannel shirt", slot: "top", ins: .25, wind: .15, water: .1, bite: .1, scr: .3, w: .3 },
  sweater:     { n: "Wool sweater", slot: "top", ins: .45, wind: .25, water: .1, bite: .12, scr: .35, w: .5 },
  hoodie:      { n: "Hoodie", slot: "top", ins: .38, wind: .3, water: .15, bite: .12, scr: .35, w: .5 },
  denimjacket: { n: "Denim jacket", slot: "jacket", ins: .3, wind: .45, water: .2, bite: .35, scr: .55, w: .8 },
  leatherjacket:{ n: "Leather jacket", slot: "jacket", ins: .38, wind: .75, water: .5, bite: .55, scr: .8, w: 1.4 },
  wintercoat:  { n: "Winter coat", slot: "jacket", ins: .85, wind: .7, water: .45, bite: .3, scr: .5, w: 1.5 },
  raincoat:    { n: "Raincoat", slot: "jacket", ins: .15, wind: .6, water: .95, bite: .1, scr: .25, w: .6 },
  jeans:       { n: "Jeans", slot: "pants", ins: .2, wind: .3, water: .1, bite: .3, scr: .55, w: .7 },
  cargo:       { n: "Cargo pants", slot: "pants", ins: .25, wind: .35, water: .15, bite: .3, scr: .55, w: .7 },
  sweatpants:  { n: "Sweatpants", slot: "pants", ins: .3, wind: .15, water: .05, bite: .1, scr: .25, w: .5 },
  sneakers:    { n: "Sneakers", slot: "shoes", ins: .1, wind: .2, water: .2, bite: .2, scr: .4, w: .6 },
  boots:       { n: "Work boots", slot: "shoes", ins: .25, wind: .4, water: .55, bite: .6, scr: .8, w: 1.2 },
  woolhat:     { n: "Wool hat", slot: "hat", ins: .35, wind: .3, water: .1, bite: .05, scr: .2, w: .1 },
  cap:         { n: "Baseball cap", slot: "hat", ins: .08, wind: .05, water: .15, bite: .05, scr: .15, w: .1 },
  gloves:      { n: "Leather gloves", slot: "gloves", ins: .3, wind: .5, water: .3, bite: .4, scr: .7, w: .2 },
  scarf:       { n: "Scarf", slot: "neck", ins: .3, wind: .4, water: .05, bite: .25, scr: .3, w: .2 },
};
for (const [k, c] of Object.entries(CLOTHES)) ITEMS[k] = { id: k, n: c.n, w: c.w, cat: "clothing", tags: [], ...c };
Object.assign(ITEMS, {
  junk_plate: { n: "Dinner plate", w: .4, cat: "misc" }, junk_fork: { n: "Fork", w: .05, cat: "misc" }, junk_toy: { n: "Toy car", w: .1, cat: "misc", bor: -3 },
  junk_jar: { n: "Empty jar", w: .3, cat: "misc" }, junk_hairgel: { n: "Hair gel", w: .2, cat: "misc" }, junk_duck: { n: "Rubber duck", w: .05, cat: "misc", bor: -2 },
  junk_razor: { n: "Razor", w: .05, cat: "misc" }, junk_spoon: { n: "Spoon", w: .05, cat: "misc" }, junk_mug: { n: "Coffee mug", w: .3, cat: "misc" },
  soup: { n: "Can of soup", w: .6, cat: "food", hun: .28, unh: 2, opener: true, empty: "emptycan" },
  candle: { n: "Candle", w: .1, cat: "misc", light: true }, torch: { n: "Torch", w: .6, cat: "misc", light: true },
  sheetrope: { n: "Sheet rope", w: .9, cat: "misc" }, splint: { n: "Splint", w: .4, cat: "medical" },
  sledge: { n: "Sledgehammer", w: 5.5, cat: "weapon", skill: "longblunt", dmg: [1.6, 2.6], range: 1.4, spd: 1.6, end: .14, cond: 60, kd: .8, crit: .1, two: true },
  generator: { n: "Generator", w: 25, cat: "misc" }, mag_gen: { n: "Generators for Dummies", w: .2, cat: "mag", teach: "generator" },
  stashmap: { n: "Hand-marked map", w: .05, cat: "mag", stash: true },
  berries: { n: "Wild berries", w: .1, cat: "food", hun: .05, thi: -.02, fresh: 2880 }, mushrooms: { n: "Wild mushrooms", w: .1, cat: "food", hun: .06, fresh: 2880 },
  stone: { n: "Stone", w: .5, cat: "mat", throwable: true }, herbs: { n: "Wild herbs", w: .05, cat: "food", hun: .01, unh: -4 },
});
for (const k in ITEMS){ ITEMS[k].id = k; ITEMS[k].tags = ITEMS[k].tags || []; }
Object.assign(ICON, { tshirt: ["shirt", "#5b6b7a"], flannel: ["shirt", "#8a3a2a"], sweater: ["shirt", "#6a5a4a"], hoodie: ["shirt", "#4a4e58"], denimjacket: ["shirt", "#3a5a8a"], leatherjacket: ["shirt", "#2a2220"],
  wintercoat: ["shirt", "#2a3a4a"], raincoat: ["shirt", "#d8c040"], jeans: ["pants", "#3a4a6a"], cargo: ["pants", "#5a5a3a"], sweatpants: ["pants", "#6a6a6e"], sneakers: ["shoe", "#e8e4dc"], boots: ["shoe", "#5a3e28"],
  woolhat: ["hat", "#7a2a2a"], cap: ["hat", "#2a4a8a"], gloves: ["hat", "#5a3e28"], scarf: ["hat", "#8a6a2a"], junk_plate: ["can", "#e8e4dc"], junk_fork: ["knife", "#c8ccd0"], junk_toy: ["can", "#c83a3a"],
  junk_jar: ["bottle", "#c8d8d0"], junk_hairgel: ["bottle", "#3a8ac8"], junk_duck: ["can", "#e8c040"], junk_razor: ["knife", "#c8ccd0"], junk_spoon: ["knife", "#c8ccd0"], junk_mug: ["can", "#8a3a2a"],
  soup: ["can", "#c83a2a"], candle: ["bottle", "#f0ead0"], torch: ["bat", "#6a4a2a"], sheetrope: ["rags", "#e8e4dc"], splint: ["plank", "#a8845a"], sledge: ["bat", "#5a5e62"],
  generator: ["can", "#c8a020"], mag_gen: ["book", "#d8c040"], stashmap: ["book", "#e8dcb8"], berries: ["can", "#5a2a6a"], mushrooms: ["can", "#c8b898"], stone: ["can", "#7a7870"], herbs: ["can", "#4a7a3a"] });
WOUND.fracture = { n: "Fracture", bleed: 0, heal: 900, pain: 45 };
SKILLS.lightfoot = { n: "Lightfooted", grp: "Agility" };
SKILLS.foraging = { n: "Foraging", grp: "Survival" };
RECIPES.push(
  { id: "sheetrope", n: "Knot a bed sheet into a rope", cat: "Survival", in: [["sheet", 1]], out: [["sheetrope", 1]], time: 3 },
  { id: "splint", n: "Make a splint", cat: "Medical", in: [["plank", 1], ["rags", 2]], out: [["splint", 1]], time: 4, xp: ["firstaid", 5] },
  { id: "torch", n: "Make a torch from a branch and rags", cat: "Survival", in: [["branch", 1], ["rags", 2]], out: [["torch", 1]], time: 4 },
);
// clothing and junk where you would expect them
const addLoot = (t, list) => { if (LOOT[t]) LOOT[t].items.push(...list); };
addLoot("wardrobe", [["tshirt", 4], ["flannel", 3], ["sweater", 3], ["hoodie", 3], ["denimjacket", 2], ["leatherjacket", 1], ["wintercoat", 2], ["raincoat", 2], ["jeans", 4], ["cargo", 2], ["sweatpants", 3], ["sneakers", 3], ["boots", 2], ["woolhat", 2], ["cap", 2], ["gloves", 2], ["scarf", 2]]);
addLoot("dresser", [["tshirt", 3], ["sweater", 2], ["jeans", 2], ["sweatpants", 2], ["woolhat", 1], ["gloves", 1], ["junk_toy", 1], ["candle", 2]]);
addLoot("clothes", [["tshirt", 5], ["flannel", 4], ["sweater", 4], ["hoodie", 4], ["denimjacket", 3], ["leatherjacket", 2], ["wintercoat", 3], ["raincoat", 3], ["jeans", 5], ["cargo", 3], ["sneakers", 4], ["boots", 3], ["woolhat", 3], ["cap", 3], ["gloves", 3], ["scarf", 3]]);
addLoot("counter", [["junk_plate", 4], ["junk_fork", 3], ["junk_spoon", 3], ["junk_mug", 3], ["junk_jar", 2], ["candle", 2], ["soup", 2]]);
addLoot("medcab", [["junk_razor", 3], ["junk_hairgel", 2], ["junk_duck", 1]]);
addLoot("crate", [["sledge", 1], ["generator", 1], ["mag_gen", 1], ["candle", 1]]);
addLoot("shelf_hardware", [["sledge", 2], ["mag_gen", 2], ["candle", 2], ["boots", 2], ["gloves", 2]]);
addLoot("locker_school", [["hoodie", 3], ["cap", 2], ["sneakers", 2]]);
addLoot("locker_police", [["boots", 2], ["raincoat", 1]]);
addLoot("locker_fire", [["boots", 3], ["gloves", 3], ["wintercoat", 1]]);
addLoot("workshop", [["generator", 1], ["mag_gen", 1], ["sledge", 1]]);
addLoot("boxes", [["junk_plate", 2], ["junk_mug", 2], ["sweater", 1], ["jeans", 1]]);
addLoot("corpse", [["junk_toy", 1], ["cigs", 1]]);
for (const t of ["desk", "files", "bookcase"]) addLoot(t, [["mag_gen", 1], ["stashmap", 1]]);

// ---------- wearing clothes ----------
const worn = () => allCarried().filter(it => it.worn && ITEMS[it.id].cat === "clothing");
function wearToggle(it){
  if (it.worn){ it.worn = false; say(`You take off the ${ITEMS[it.id].n.toLowerCase()}.`); return; }
  const slot = ITEMS[it.id].slot;
  for (const o of worn()) if (ITEMS[o.id].slot === slot) o.worn = false;
  it.worn = true; act("Getting dressed", 1.5, () => say(`You put on the ${ITEMS[it.id].n.toLowerCase()}.`));
}
function clothStat(k){ let s = 0; for (const it of worn()) s += ITEMS[it.id][k] * (it.holes ? .5 : 1); return s; }
const SLOT_PART = { top: ["torso", "arm_l", "arm_r"], jacket: ["torso", "arm_l", "arm_r", "farm_l", "farm_r"], pants: ["leg_l", "leg_r", "groin"], shoes: ["foot_l", "foot_r"], hat: ["head"], gloves: ["hand_l", "hand_r"], neck: ["neck"] };
// zombie teeth against denim: does something you're wearing stop it?
function clothBlocks(part, type){
  let best = null, bv = 0;
  for (const it of worn()){ const c = ITEMS[it.id], parts = SLOT_PART[c.slot] || []; if (!parts.some(p => part.startsWith(p.replace(/_.$/, "")) || p === part)) continue;
    const v = (type === "bite" ? c.bite : c.scr) * (it.holes ? .4 : 1); if (v > bv){ bv = v; best = it; } }
  if (best && R() < bv * .7){ best.holes = (best.holes || 0) + 1; return best; }
  return null;
}

// ---------- seasons, air temperature, body temperature, wetness, colds ----------
function dayOfYear(){ const d = new Date(1993, 6, 14 + Math.floor(G.min / 1440) - CFG.startDay); return (d - new Date(1993, 0, 0)) / 864e5; }
function winterness(){ return (Math.cos((dayOfYear() - 15) / 365 * 2 * Math.PI) + 1) / 2; }   // 1 mid-January, 0 mid-July
function seasonName(){ const m = new Date(1993, 6, 14 + Math.floor(G.min / 1440) - CFG.startDay).getMonth(); return m < 2 || m === 11 ? "Winter" : m < 5 ? "Spring" : m < 8 ? "Summer" : "Autumn"; }
function airTemp(){
  const w = winterness(), h = (G.min % 1440) / 60;
  const mean = 27 - w * 26, daily = Math.cos((h - 15) / 24 * 2 * Math.PI) * (6 - w * 1.5);
  return mean + daily - (G.rain ? 3 : 0) - (G.fog ? 1.5 : 0) + (G.tempJitter || 0);
}
function darknessBase(){
  const h = (G.min % 1440) / 60, w = typeof winterness === "function" && G ? winterness() : 0;
  const sr = 6.4 + 1.5 * w, ss = 20.8 - 3.2 * w;
  if (h >= sr + .6 && h < ss - .4) return 0;
  if (h >= ss - .4 && h < ss + 2) return (h - (ss - .4)) / 2.4 * .8;
  if (h >= sr - 2 && h < sr + .6) return (sr + .6 - h) / 2.6 * .8;
  return .8;
}
function indoorsNow(){ const r = realXY(P.x, P.y); if (r.lvl !== 0) return true; const [sx, sy] = sideTile(P.x, P.y); return inb(sx, sy) && tile[ix(sx, sy)] === T.FLOOR; }
function stepBody(dt, dm){
  if (!P.alive) return;
  P.btemp = P.btemp ?? 37; P.wet = P.wet || 0;
  const air = airTemp(), inside = indoorsNow(), ins = Math.min(1.4, clothStat("ins")), wind = Math.min(1, clothStat("wind") / 2), water = Math.min(1, clothStat("water") / 2);
  // rain and snow soak you outside, sweat soaks you when you work hard in the heat
  if (G.rain && !inside) P.wet = Math.min(100, P.wet + dm * 1.6 * (1 - water));
  if (P.running && air > 18) P.wet = Math.min(100, P.wet + dm * .5);
  const heat = nearHeat();
  P.wet = Math.max(0, P.wet - dm * (inside ? .35 : .12) * (heat ? 3 : 1) * (air > 20 ? 1.5 : 1));
  // what the body is heading toward
  const effIns = ins * (1 - P.wet / 140), chill = inside ? 0 : (G.rain ? 4 : 2) * (1 - wind);
  let target = 37 + (air + (inside ? 6 : 0) + (heat ? 12 : 0) - 18 + effIns * 14 - chill) * .045 + (P.running ? .5 : 0) - P.wet * .008;
  target = clamp(target, 33, 39.5);
  P.btemp += (target - P.btemp) * Math.min(1, dm * .02);
  // the cold and the heat take their toll
  if (P.btemp < 35.2) P.health = Math.max(0, P.health - dm * .02);
  if (P.btemp > 38.6){ P.thirst = Math.min(1, P.thirst + dm * .0008); P.endurance = Math.max(0, P.endurance - dm * .002); }
  // catching a cold: wet and chilled for too long
  if (!P.cold && P.wet > 45 && P.btemp < 36.4 && R() < dm * .0009 * (P.traits.has("prone") ? 2 : 1)){ P.cold = 2880; say("Your nose is running. You've caught a cold.", "#ffd27a"); }
  if (P.cold){
    P.cold = Math.max(0, P.cold - dm);
    P.sneezeT = (P.sneezeT || rf(30, 90)) - dm;
    if (P.sneezeT <= 0){ P.sneezeT = rf(25, 80); const sn = R() < .5; bubble(sn ? "Achoo!" : "*cough* *cough*"); noise(P.x, P.y, sn ? 12 : 8); sfx.thump(.2); }
    if (!P.cold) say("Your cold has cleared up.");
  }
}
function nearHeat(){ for (const i of G.built || []){ const o = objs.get(i); if (o && o.type === "campfire" && o.fuel > 0 && Math.hypot(o.x + .5 - P.x, o.y + .5 - P.y) < 3) return true; } return false; }
VITALS.push(
  { id: "wet", ic: "💦", val: () => P.wet || 0, th: [15, 40, 70, 90], n: ["Damp", "Wet", "Soaking", "Drenched"], d: ["", "Wet clothes keep you less warm.", "You'll catch a cold like this.", "Get dry, now."] },
  { id: "chilly", ic: "🥶", val: () => 37 - (P.btemp ?? 37), th: [.6, 1.1, 1.6, 2.2], n: ["Chilly", "Cold", "Freezing", "Hypothermic"], d: ["Wrap up warmer.", "Shivering. Find warmth.", "Your hands won't work properly.", "You are dying of cold."] },
  { id: "hot", ic: "🥵", val: () => (P.btemp ?? 37) - 37, th: [.7, 1.1, 1.5, 2], n: ["Warm", "Hot", "Overheating", "Heatstroke"], d: ["", "Thirsty work.", "Take a layer off.", "Get cool now."] },
  { id: "hascold", ic: "🤧", val: () => P.cold ? 1 : 0, th: [1, 2, 3, 4], n: ["Has a cold", "", "", ""], d: ["Sneezing and coughing make noise.", "", "", ""] },
  { id: "fracture", ic: "🦴", val: () => P.fracture ? (P.splinted ? 1 : 2) : 0, th: [1, 2, 3, 4], n: ["Splinted fracture", "Broken bone", "", ""], d: ["Healing. Take it slow.", "Make a splint (B) and apply it.", "", ""] },
  { id: "stiff", ic: "💪", val: () => P.strain || 0, th: [25, 45, 65, 85], n: ["Stiff", "Sore muscles", "Strained", "Muscles failing"], d: ["", "Swings a little weaker.", "Swings weaker and slower.", "Rest before you fight again."] },
  { id: "co", ic: "☁️", val: () => P.co || 0, th: [10, 30, 55, 80], n: ["Headache", "Dizzy", "Poisoned air", "Suffocating"], d: ["Is something running indoors?", "Carbon monoxide. Get outside.", "Get out now.", "..."] },
);

// ---------- weather: snow and thunder ----------
let thunderT = 30, flashA = 0;
function stepSeasons(dt, dm){
  G.tempJitter = G.tempJitter ?? 0; if (R() < dt * .01) G.tempJitter = clamp(G.tempJitter + rf(-1, 1), -4, 4);
  const air = airTemp();
  G.snowing = G.rain && air < 1;
  G.snow = clamp((G.snow || 0) + (G.snowing ? dm * .0012 : air > 3 ? -dm * .002 : 0), 0, 1);
  // storms in the warm months
  if (G.rain && air > 12 && G.stormy === undefined) G.stormy = R() < .35;
  if (!G.rain) G.stormy = undefined;
  if (G.stormy){ thunderT -= dt; if (thunderT <= 0){ thunderT = rf(14, 45); flashA = 1; const a = rf(0, 6.28), d = rf(20, 70), r = realXY(P.x, P.y);
    G.sounds.push({ x: r.x + Math.cos(a) * d, y: r.y + Math.sin(a) * d, r: 45, t: G.simT }); setTimeout(() => sfx.thump(1), rf(400, 2200)); } }
  flashA = Math.max(0, flashA - dt * 3);
}
function drawWeatherFx(){
  if (G.snowing && !indoorsNow()){
    ctx.fillStyle = "rgba(240,244,250,.8)";
    for (let k = 0; k < 220; k++){ const x = (k * 137 + G.simT * (20 + k % 7 * 6) + Math.sin(G.simT + k) * 20) % CW, y = (k * 61 + G.simT * (40 + k % 5 * 12)) % CH; ctx.fillRect(x, y, 2, 2); }
  }
  if (G.snow > .02 && RV.mode !== "upper"){ ctx.fillStyle = `rgba(235,240,246,${G.snow * .32})`; ctx.fillRect(0, 0, CW, CH); }
  if (flashA > 0 && !indoorsNow()){ ctx.fillStyle = `rgba(230,235,255,${flashA * .45})`; ctx.fillRect(0, 0, CW, CH); }
}

// ---------- generators ----------
Object.assign(OBJ, { generator: { n: "Generator", block: true, h: 16, col: "#c8a020" }, candlelit: { n: "Candle", block: false, h: 4, col: "#f0ead0", light: 2.4 }, rope: { n: "Sheet rope", block: false, h: 40, col: "#e8e4dc" } });
const gridOn = () => G.min < G.powerOff;
function genPowerAt(x, y){
  if (!G || !G.gens || !G.gens.length) return false;
  let px = x ?? P.x, py = y ?? P.y; const r = realXY(px, py); px = r.x; py = r.y;
  for (const i of G.gens){ const o = objs.get(i); if (!o || !o.on || o.fuel <= 0) continue; const gr = realXY(o.x, o.y); if (Math.abs(gr.x - px) <= 20 && Math.abs(gr.y - py) <= 20) return true; }
  return false;
}
function generatorOptions(o, out){
  const know = G.genKnow || skill("electrical") >= 3 || P.occ === "mechanic";
  if (!know){ out.push({ label: "You don't know how to hook this up (read a generator guide)", off: true }); }
  else out.push({ label: o.on ? "Turn the generator off" : `Turn the generator on (fuel ${Math.round(o.fuel * 100)}%)`, off: !o.on && o.fuel <= 0, fn: () => act(o.on ? "Switching off" : "Starting the generator", 2, () => {
    o.on = !o.on; if (o.on){ (G.gens = G.gens || []).includes(ix(o.x, o.y)) || G.gens.push(ix(o.x, o.y)); noise(o.x, o.y, 20); say("It coughs, then roars into life. Everything nearby has power."); addXP("electrical", 4); } }) });
  const can = allCarried().find(it => it.id === "gascan" && it.fuel > 0);
  out.push({ label: "Pour fuel in", off: !can || o.fuel >= .99, fn: () => act("Refuelling", 4, () => { const m = Math.min(can.fuel * .5, 1 - o.fuel); o.fuel += m; can.fuel -= m / .5; }) });
  out.push({ label: "Pick it up (very heavy)", off: o.on, fn: () => act("Lifting", 2.5, () => { objs.delete(ix(o.x, o.y)); G.gens = (G.gens || []).filter(i => i !== ix(o.x, o.y)); const it = makeItem("generator"); it.fuel = o.fuel; giveItem(it); }) });
}
function placeGenerator(it){
  const tx = Math.floor(P.x + Math.cos(P.face) * .9), ty = Math.floor(P.y + Math.sin(P.face) * .9);
  if (solidP(tx, ty) || objs.has(ix(tx, ty))) return say("No room there.");
  act("Setting the generator down", 2, () => { removeItem(it); const o = placeObj("generator", tx, ty, roomId[ix(tx, ty)]); delete o.dir; o.fuel = it.fuel ?? rf(0, .3); o.on = false; o.built = true; (G.built = G.built || []).push(ix(tx, ty)); });
}
function stepGenerators(dt, dm){
  if (!G.gens || !G.gens.length) return;
  for (const i of G.gens){
    const o = objs.get(i); if (!o || !o.on) continue;
    o.fuel = Math.max(0, o.fuel - dm * .11 / 1440);
    if (o.fuel <= 0){ o.on = false; if (Math.hypot(o.x - P.x, o.y - P.y) < 30) say("The generator sputters and dies. Out of fuel."); continue; }
    o.nT = (o.nT || 0) - dt; if (o.nT <= 0){ o.nT = 3; noise(o.x + .5, o.y + .5, 20); }
    // running it indoors fills the building with fumes
    const b = bldId[i], [sx, sy] = sideTile(P.x, P.y);
    if (b >= 0 && inb(sx, sy) && bldId[ix(sx, sy)] === b) P.co = Math.min(100, (P.co || 0) + dm * .9);
  }
  if (P.co){ P.co = Math.max(0, P.co - dm * .25); if (P.co > 30) P.health = Math.max(0, P.health - dm * (P.co - 30) * .004); if (P.co > 30) P.sickness = Math.min(1, (P.sickness || 0) + dm * .0005); }
}

// ---------- sheet ropes, jumping and smashing stairs ----------
// an upper-floor window maps to the ground outside the matching wall
function windowOutside(f){
  const r = realXY(f.x, f.y); if (r.lvl < 1) return null;
  const rx = Math.round(r.x), ry = Math.round(r.y), B = buildings[r.pk.b];
  let ox = 0, oy = 0;
  if (f.horiz) oy = ry <= B.y0 ? -1 : 1; else ox = rx <= B.x0 ? -1 : 1;
  const gx = rx + ox, gy = ry + oy;
  if (!inb(gx, gy) || solidP(gx, gy)) return null;
  return { gx, gy, lvl: r.lvl, pk: r.pk };
}
function upperWindowOptions(f, out){
  if (f.type !== "win") return;
  const o = windowOutside(f); if (!o) return;
  const rope = (G.ropes || []).find(r => r.wx === f.x && r.wy === f.y);
  const passable = f.open || f.broken;
  if (rope) out.push({ label: "Climb down the sheet rope", off: !passable, fn: () => act("Climbing down", 3 + o.lvl, () => { P.x = o.gx + .5; P.y = o.gy + .5; CAM = null; flow = null; G.visBox = null; G.vis.fill(0); computeVis(); noise(P.x, P.y, 5); }) });
  else if (allCarried().some(it => it.id === "sheetrope")) out.push({ label: "Tie a sheet rope here", off: !passable, fn: () => act("Tying the rope", 3, () => {
    const it = allCarried().find(i => i.id === "sheetrope"); removeItem(it); (G.ropes = G.ropes || []).push({ wx: f.x, wy: f.y, gx: o.gx, gy: o.gy }); say("The rope hangs down to the ground. Zombies can't climb it."); }) });
  out.push({ label: o.lvl > 1 ? "Jump out of the window (a long fall)" : "Jump out of the window", off: !passable, fn: () => act("Climbing out", 1.2, () => {
    P.x = o.gx + .5; P.y = o.gy + .5; CAM = null; flow = null; G.visBox = null; G.vis.fill(0); computeVis(); noise(P.x, P.y, 9);
    const risk = o.lvl === 1 ? .45 : .9;
    if (R() < risk){ P.fracture = 1; P.splinted = false; addWound(R() < .5 ? "leg_l" : "leg_r", "fracture", false); P.pain = Math.min(100, (P.pain || 0) + 40); say("You land badly. Something in your leg snaps.", "#ff9a8a"); }
    else say("You land hard but nothing breaks."); }) });
}
// climbing a rope from the ground
function ropeOptionsAt(out){
  for (const r of G.ropes || []){
    if (Math.hypot(r.gx + .5 - P.x, r.gy + .5 - P.y) > 1.4) continue;
    const pkw = pkAt(r.wx, r.wy); if (!pkw) continue;
    out.push({ label: "Climb up the sheet rope", fn: () => act("Climbing up", 3.5 + pkw.k, () => { P.x = r.wx + .5; P.y = r.wy + .5 + 0; const f = feats.get(ix(r.wx, r.wy)); if (f && f.horiz) P.y += (r.gy < r.wy - pkw.oy ? .6 : -.6); else if (f) P.x += (r.gx < r.wx - pkw.ox ? .6 : -.6); CAM = null; flow = null; G.visBox = null; G.vis.fill(0); computeVis(); }) });
  }
}
const _stairOptions = stairOptions;
function stairSmashOption(o, out){
  if (!allCarried().some(it => it.id === "sledge")) return;
  out.push({ label: "Smash the stairs apart with the sledgehammer", fn: () => act("Smashing the stairs", 8, () => {
    const i = ix(o.x, o.y);
    for (const j of stairLinks(i)){ const q = objs.get(j); if (q){ if (realXY(q.x, q.y).lvl > realXY(o.x, o.y).lvl) q.down = false; else q.up = false; } }
    if (o.up && realXY(o.x, o.y).lvl === 0){ o.up = false; } else o.down = false;
    if (!o.up && !o.down) objs.delete(i);
    say("The stairs come apart. Nothing is getting up there now, including you without a rope."); noise(o.x, o.y, 25);
  }, { noise: 14, noiseEvery: 1 }) });
}
function applySplint(it){ if (!P.fracture) return say("Nothing to splint."); act("Splinting your leg", 5, () => { removeItem(it); P.splinted = true; say("The splint holds it steady."); addXP("firstaid", 5); }); }
function stepFracture(dm){ if (!P.fracture) return; P.fracture += dm / (P.splinted ? 9000 : 18000); if (P.fracture >= 2){ P.fracture = 0; P.splinted = false; say("Your leg has healed."); } }

// ---------- stories: what happened here before you came ----------
function placeStories(R0){
  const inR = b => b.x0 >= R0.x0 && b.x1 <= R0.x1 && b.y0 >= R0.y0 && b.y1 <= R0.y1;
  const houses = buildings.filter(b => b.kind === "house" && inR(b) && b.x0 !== undefined);
  // a barricaded safehouse: boarded up, better stocked, more of them inside, and a map somewhere
  if (houses.length && rnd() < .6){
    const B = pick(houses, rnd); B.story = "safehouse";
    for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++){ const f = feats.get(ix(x, y)); if (f && perim[ix(x, y)] !== 0 && (x === B.x0 || x === B.x1 || y === B.y0 || y === B.y1)){ f.bar = ri(2, 4, rnd); f.barHp = f.bar * 6; f.open = false; } }
    for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++){ const o = objs.get(ix(x, y)); if (o && OBJ[o.type].cont) o.loot = "safehouse"; }
    R0.extraZ = (R0.extraZ || 0) + 6; R0.safehouse = [B.x0 + 1, B.y0 + 1, B.x1 - 1, B.y1 - 1];
    const other = houses.filter(h => h !== B); if (other.length){ const H2 = pick(other, rnd); for (let y = H2.y0; y <= H2.y1; y++) for (let x = H2.x0; x <= H2.x1; x++){ const o = objs.get(ix(x, y)); if (o && OBJ[o.type].cont && !o.extra){ o.extra = [{ id: "stashmap", mark: [(B.x0 + B.x1) / 2, (B.y0 + B.y1) / 2, "Safehouse"] }]; y = 1e9; break; } } }
  }
  // a burnt-out house
  if (houses.length > 3 && rnd() < .35){
    const B = pick(houses.filter(h => h.story !== "safehouse"), rnd);
    if (B){ B.story = "burnt"; B.facade = "burnt"; B.roofCol = "#1e1a18"; B.trim = "#1a1614"; B._rg = null;
      for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++){ const i = ix(x, y); const o = objs.get(i); if (o && rnd() < .6) objs.delete(i); else if (o && OBJ[o.type].cont) o.items = []; const f = feats.get(i); if (f){ if (f.type === "win"){ f.broken = true; f.glass = true; } else if (rnd() < .5) f.broken = true; } if (tile[i] === T.FLOOR && roomId[i] >= 0) rooms[roomId[i]].type = "burnt"; } }
  }
  // a trashed house: someone got here first
  if (houses.length > 2 && rnd() < .5){
    const B = pick(houses.filter(h => !h.story), rnd);
    if (B){ B.story = "trashed"; for (let y = B.y0; y <= B.y1; y++) for (let x = B.x0; x <= B.x1; x++){ const i = ix(x, y), o = objs.get(i), f = feats.get(i); if (o && OBJ[o.type].cont && rnd() < .8) o.items = []; if (f && rnd() < .5){ if (f.type === "win") f.broken = true; else f.open = true; } } }
  }
  // a crash on the highway with the people still around it
  if (rnd() < .4){
    const x = ri(R0.x0 + 12, R0.x1 - 12, rnd), y = R0.hy;
    if (tile[ix(x, y)] === T.ROAD && tile[ix(x + 2, y)] === T.ROAD && !objs.has(ix(x, y)) && !objs.has(ix(x + 2, y))){
      placeObj("wreck", x, y - 1, -1).dir = null; const c = placeObj("car", x + 2, y, -1); c.col = pick(["#6b2e2a", "#2f4a5e", "#9a9a94"], rnd); c.crashed = true;
      R0.extraZ = (R0.extraZ || 0) + 5; R0.crash = [x, y];
    }
  }
  // police blockade
  if (R0.kind === "rural" && rnd() < .25){
    const y = R0.hy, x = ri(R0.x0 + 15, R0.x1 - 15, rnd);
    for (const dy of [-1, 1]){ if (tile[ix(x, y + dy)] === T.ROAD && !objs.has(ix(x, y + dy))){ const c = placeObj("car", x, y + dy, -1); c.col = "#1a1a1e"; c.livery = "police"; c.dir = [0, 1]; } }
    for (const dy of [-2, 2]) if (!objs.has(ix(x + 2, y + dy))){ const o = placeObj("sandbag", x + 2, y + dy, -1); o.dir = null; }
    R0.blockade = [x, y]; R0.extraZ = (R0.extraZ || 0) + 6;
  }
  // a camp in the woods
  if (R0.kind === "wild" || rnd() < .25){
    for (let tries = 0; tries < 20; tries++){
      const x = ri(R0.x0 + 8, R0.x1 - 8, rnd), y = ri(R0.y0 + 8, R0.y1 - 8, rnd);
      if (tile[ix(x, y)] !== T.GRASS || ZONE[ix(x, y)] || Math.abs(x - R0.hx) < 6 || Math.abs(y - R0.hy) < 6) continue;
      let ok = true; for (let dy = -2; dy <= 2 && ok; dy++) for (let dx = -2; dx <= 2; dx++){ const t = tile[ix(x + dx, y + dy)]; if (t !== T.GRASS && t !== T.TREE && t !== T.DIRT) ok = false; }
      if (!ok) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (tile[ix(x + dx, y + dy)] === T.TREE) tile[ix(x + dx, y + dy)] = T.GRASS;
      const t1 = placeObj("tent", x - 1, y - 1, -1); t1.dir = null; const fp = placeObj("firepit", x + 1, y, -1); fp.dir = null;
      const bag = placeObj("crate", x - 1, y + 1, -1); bag.dir = null; bag.loot = "camp";
      R0.camp = [x, y]; break;
    }
  }
}
Object.assign(OBJ, { tent: { n: "Tent", block: true, h: 20, col: "#4a6a3a" }, firepit: { n: "Old fire pit", block: false, h: 3, col: "#3a3430" } });
Object.assign(LOOT, {
  safehouse: { rolls: [2, 5], items: [["beans", 4], ["tuna", 3], ["soup", 3], ["water", 4], ["bandage", 3], ["disinf", 2], ["antibio", 1], ["pills", 2], ["axe", 1], ["crowbar", 1], ["hunting", 1], ["batteries", 2], ["candle", 2], ["sheetrope", 2], ["gascan", 1]] },
  camp: { rolls: [1, 4], items: [["water", 3], ["beans", 2], ["hunting", 2], ["hatchet", 2], ["backpack", 2], ["candle", 2], ["wintercoat", 1], ["boots", 1], ["torch", 1]] },
});
function drawDecor4(o, dim, a){
  const x = o.x, y = o.y, sd = c => shade(c, dim);
  if (o.type === "tent"){ const p = [[x - .3, y + 1.2, 0], [x + 1.3, y + 1.2, 0], [x + 1.3, y - .2, 0], [x - .3, y - .2, 0]], top = [[x - .3, y + .5, 20], [x + 1.3, y + .5, 20]];
    poly([S(...p[3]), S(...p[2]), S(...top[1]), S(...top[0])], sd("#3e5a32"), a); poly([S(...p[0]), S(...p[1]), S(...top[1]), S(...top[0])], sd("#4e6a3a"), a); poly([S(...p[1]), S(...p[2]), S(...top[1])], sd("#5a7a44"), a); return true; }
  if (o.type === "firepit"){ topEl(x + .5, y + .5, .35, .3, sd("#5a5450"), a); topEl(x + .5, y + .5, .24, .4, sd("#1e1a18"), a); return true; }
  if (o.type === "generator"){ boxW(x + .15, y + .25, x + .85, y + .75, 2, 14, sd("#c8a020"), a); boxW(x + .2, y + .3, x + .45, y + .7, 14, 16, sd("#2a2a2a"), a); for (const [u, v] of [[.2, .3], [.8, .3], [.2, .7], [.8, .7]]) topEl(x + u, y + v, .07, 1, "#1a1a1a", a);
    if (o.on){ const [sx, sy] = S(x + .3, y + .5, 18 + Math.sin(G.simT * 9) * 2); ctx.globalAlpha = .3 * a; ctx.fillStyle = "#8a8a8a"; ctx.beginPath(); ctx.arc(sx, sy, 3 * zoom, 0, 7); ctx.fill(); ctx.globalAlpha = 1; } return true; }
  if (o.type === "candlelit"){ boxW(x + .45, y + .45, x + .55, y + .55, 0, 3, "#f0ead0", a); topEl(x + .5, y + .5, .03, 4, "#ffd060", a); return true; }
  return drawDecor5(o, dim, a);
}
// ---------- foraging (V toggles search mode) ----------
function forageTick(dt){
  if (!G.search || P.car || !P.alive) return;
  if (P.running){ G.search = false; say("You stop searching."); return; }
  G.searchT = (G.searchT || 0) - dt; if (G.searchT > 0) return;
  G.searchT = 2.2;
  const r = realXY(P.x, P.y); if (r.lvl !== 0 || indoorsNow()) return;
  const lvl = skill("foraging"), rad = 3 + .7 * lvl, dark = darkness() > .4, w = winterness();
  const tx = Math.floor(P.x + rf(-rad, rad)), ty = Math.floor(P.y + rf(-rad, rad)); if (!inb(tx, ty)) return;
  const t = tile[ix(tx, ty)]; if (t !== T.GRASS && t !== T.TREE && t !== T.DIRT && t !== T.SAND) return;
  if (solidP(tx, ty) && t !== T.TREE) return;
  let forest = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (tile[ix(tx + dx, ty + dy)] === T.TREE) forest++;
  const chance = (.18 + forest * .02 + lvl * .03) * (dark ? .4 : 1) * (G.rain ? .7 : 1);
  if (R() > chance) return;
  const pool = [["branch", 4], ["stone", 3]];
  if (w < .75){ pool.push(["berries", forest > 3 ? 5 : 2], ["mushrooms", forest > 5 ? 4 : 1]); if (lvl >= 2) pool.push(["herbs", 2]); }
  if (ZONE[ix(tx, ty)]) pool.push(["emptycan", 2], ["bottle", 2], ["junk_toy", 1]);
  const id = wpick(pool), it = makeItem(id);
  if ((id === "berries" || id === "mushrooms") && R() < Math.max(0, .3 - lvl * .05)) it.poison = true;
  const ti = ix(tx, ty), fl = floorItems.get(ti) || []; fl.push(it); floorItems.set(ti, fl);
  (G.found = G.found || []).push({ i: ti, t: G.simT });
  addXP("foraging", 3); bubble("Found something.");
}
function drawForageMarks(){
  if (!G.found || !G.found.length) return;
  G.found = G.found.filter(f => G.simT - f.t < 40 && (floorItems.get(f.i) || []).length);
  for (const f of G.found){ const [sx, sy] = S(f.i % W + .5, ((f.i / W) | 0) + .5, 10 + Math.sin(G.simT * 4) * 2); ctx.fillStyle = "rgba(255,240,160,.9)"; ctx.font = `${Math.round(14 * zoom + 6)}px VT323, monospace`; ctx.textAlign = "center"; ctx.fillText("◆", sx, sy); }
}
addEventListener("keydown", e => {
  if (e.key !== "v" && e.key !== "V") return;
  if (!G || !G.running || document.activeElement && document.activeElement.tagName === "INPUT") return;
  G.search = !G.search; say(G.search ? `Search mode: looking for anything useful (radius ${Math.round(3 + .7 * skill("foraging"))} tiles).` : "You stop searching.");
});

// ---------- difficulty presets ----------
const PRESETS = {
  survivor:   { n: "Survivor", pop: .8, loot: 1.15, sprint: 0, kit: true, d: "The intended start: a starter kit, slower dead, a little more to find." },
  apocalypse: { n: "Apocalypse", pop: 1, loot: .85, sprint: 0, kit: false, d: "Canon: no starter kit, scarcer loot, the full dead population." },
  builder:    { n: "Builder", pop: .35, loot: 1.4, sprint: 0, kit: true, d: "Few zombies and plenty of supplies. Build and live." },
  extinction: { n: "Extinction", pop: 1.5, loot: .7, sprint: .2, kit: false, d: "Brutal: more of them, some sprint, and almost nothing left." },
};
function applyPreset(k){ const p = PRESETS[k] || PRESETS.survivor; CFG.popMul = p.pop; CFG.lootMul = p.loot; CFG.sprinterChance = p.sprint; CFG.kitOn = p.kit; PRESET_KEY = k; }
let PRESET_KEY = "survivor";

// ---------- quiet corridors: some streets the dead happen to avoid ----------
function inCrack(x, y){
  const cs = 26, gx = Math.floor(x / cs), gy = Math.floor(y / cs); let d1 = 1e9, d2 = 1e9;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++){ const cx = (gx + i) * cs + (hash3(WSEED, gx + i, gy + j) % cs), cy = (gy + j) * cs + (hash3(WSEED + 7, gx + i, gy + j) % cs), d = Math.hypot(x - cx, y - cy); if (d < d1){ d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
  return d2 - d1 < 2.4;
}

// ---------- small things that add up ----------
function footMul(){
  const shoes = worn().some(it => ITEMS[it.id].slot === "shoes");
  return (1 - skill("lightfoot") * .07) * (shoes ? 1 : .8);
}
function dmgMult(){
  const v = G.vit;
  let m = 1 - 0.07 * v.tired - 0.13 * v.winded - (v.hungry >= 3 ? 0.1 : 0) - (v.chilly >= 3 ? .1 : 0) - (P.strain || 0) / 260;
  return Math.max(0.3, m) * (0.75 + skill("strength") * 0.05);
}
const _baseMove = moveMult;
function moveMult2(){ let m = moveMult() * moveMultW(); if (P.fracture) m *= P.splinted ? .7 : .45; if ((P.btemp ?? 37) < 35.6) m *= .85; if (G.snow > .3 && !indoorsNow()) m *= 1 - G.snow * .25; return m; }
function stepLife2(dt, dm){
  stepBody(dt, dm); stepSeasons(dt, dm); stepGenerators(dt, dm); stepFracture(dm); forageTick(dt);
  // muscles stiffen with use and recover with time
  P.strain = Math.max(0, (P.strain || 0) - dm * .03);
  // you get used to the dead, slowly
  const dp = P.panic - (P._lp ?? P.panic); if (dp > 0) P.panic = (P._lp ?? 0) + dp * Math.max(.25, 1 - daysSurvived() / 150) * (P.occ === "veteran" ? .45 : 1); P._lp = P.panic;
  // the smell of old bodies indoors makes you sick
  if (indoorsNow()){ let n = 0; for (const c of G.corpses) if (G.min - (c.t || 0) > 1440 && Math.abs(c.x - P.x) < 4 && Math.abs(c.y - P.y) < 4) n++;
    if (n >= 3){ P.sickness = Math.min(1, (P.sickness || 0) + dm * n * .00006); if (R() < dm * .002) say("The stench of the bodies turns your stomach.", "#c8d88a"); } }
  // Lightfooted grows from moving carefully near the dead
  if (P.moving && !P.running && Z.some(z => z.alive && z.state !== "chase" && Math.abs(z.x - P.x) < 10 && Math.abs(z.y - P.y) < 10)) addXP("lightfoot", dt * (P.sneaking ? .5 : .15));
  // the world grows over, a little more each month
  const er = Math.min(5, Math.floor(daysSurvived() / 30));
  if (er !== (G.erosion || 0)){ G.erosion = er; EROSION = er; clearAllCaches(); }
  // car alarms
  for (const c of V) if (c.alarmOn){ c.alarmOn -= dt; c.alT = (c.alT || 0) - dt; if (c.alT <= 0){ c.alT = .8; noise(c.x, c.y, 30); } if (c.alarmOn <= 0) c.alarmOn = 0; }
  if (P.torch){ P.torch = Math.max(0, P.torch - dm); if (!P.torch) say("Your torch gutters out."); }
  for (const i of G.built || []){ const o = objs.get(i); if (o && o.type === "candlelit"){ o.burn -= dm; if (o.burn <= 0) objs.delete(i); } }
}
let EROSION = 0;
function lightCandle(it){
  const tx = Math.floor(P.x), ty = Math.floor(P.y);
  if (objs.has(ix(tx, ty))) return say("Not here, there's something in the way.");
  removeItem(it); const o = placeObj("candlelit", tx, ty, roomId[ix(tx, ty)]); delete o.dir; o.burn = 480; o.built = true; (G.built = G.built || []).push(ix(tx, ty)); say("The candle throws a small warm circle.");
}
function lightTorch(it){ removeItem(it); P.torch = 90; say("The torch catches. It won't last long."); }
function readStash(it){ const m = it.mark; if (!m) return say("Scribbles. Nothing you can make out."); (G.marks = G.marks || []).push(m); say(`Someone circled a house and wrote "${m[2]}". It's on your map now (M).`, "#ffd27a"); }

let TREESHAKE = new Map();
// low sun pours through windows onto the floor
function sunPatches(ROWS){
  const h = (G.min % 1440) / 60, w = winterness(), sr = 6.4 + 1.5 * w, ss = 20.8 - 3.2 * w;
  if (h < sr || h > ss || !ROWS) return;
  const evening = h > ss - 3, morning = h < sr + 2.5;
  const strength = evening ? .16 * (1 - Math.abs(h - (ss - 1.3)) / 1.7) : morning ? .1 : .055;
  if (strength <= 0) return;
  const col = evening ? "255,150,70" : morning ? "255,215,160" : "255,245,220";
  const p = new Path2D();
  for (const [ty, sx0, sx1] of ROWS) for (let tx = sx0; tx <= sx1; tx++){
    const i = ix(tx, ty); if (tile[i] !== T.WIN || !G.vis[i]) continue;
    const f = feats.get(i); if (!f || f.bar >= 3 || f.curtain) continue;
    // the light falls on whichever side is indoors
    if (f.horiz){ const dy = tile[ix(tx, ty + 1)] === T.FLOOR ? 1 : -1; p.rect(tx + .1, dy > 0 ? ty + .55 : ty - 1.1, .8, 1.55); }
    else { const dx = tile[ix(tx + 1, ty)] === T.FLOOR ? 1 : -1; p.rect(dx > 0 ? tx + .55 : tx - 1.1, ty + .1, 1.55, .8); }
  }
  isoT(0); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = `rgba(${col},${strength})`; ctx.fill(p); ctx.globalCompositeOperation = "source-over"; resetT();
}
Object.assign(FURN2, { basement: { wall: ["shelf", "pantry", "boxes", "workbench"] } });
(function tex3(){
  TEX.floor_basement = TEX.floor_hardware; ROOMWALL.basement = "#9a9a94";
  const [c, g] = mkCanvas(128, 128); g.fillStyle = "#2a2624"; g.fillRect(0, 0, 128, 128); speckle(g, 128, 128, 6000, ["#3a3430", "#1a1614", "#4a4440", "#5a5048"], .8, 1.6);
  TEX.floor_burnt = pattern(c, 1 / PPT, 1 / PPT); ROOMWALL.burnt = "#3a3430";
  const [c2, g2] = mkCanvas(64, 64); g2.fillStyle = "#2e2a26"; g2.fillRect(0, 0, 64, 64); speckle(g2, 64, 64, 900, ["#1a1614", "#4a3e34", "#5a4a3a"], .8, 2); g2.fillStyle = "rgba(0,0,0,.4)"; for (let k = 0; k < 6; k++) g2.fillRect(Math.random() * 64, 0, 3, 64);
  SIDE_CAN.burnt = c2;
})();
