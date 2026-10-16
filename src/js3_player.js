// ============================================================
// Part 3: player, items, timed actions, needs, vitals, skills
// ============================================================
let G = null;   // game state
let P = null;   // player

function makeItem(id){
  const d = ITEMS[id], it = { id };
  if (d.cond) it.cond = d.cond;
  if (d.uses) it.uses = d.uses;
  if (d.fresh) it.age = rf(0, d.fresh * 0.6) * 1440;
  if (id === "nails") it.qty = ri(10, 30);
  if (d.cat === "bag") it.items = [];
  if (d.fuelCap) it.fuel = rf(0, d.fuelCap);
  return it;
}
function iname(it){
  const d = ITEMS[it.id]; let s = d.n;
  if (it.worn) s += " (worn)"; if (it.holes) s += " (torn)";
  if (it.label) s += ` (${it.label} car)`;
  if (it.qty) s += ` (${it.qty})`;
  if (it.uses !== undefined) s += ` [${it.uses}]`;
  return s;
}
function freshState(it){
  const d = ITEMS[it.id]; if (!d.fresh) return null;
  if (it.age < d.fresh * 1440) return "fresh";
  if (it.age < d.rot * 1440) return "stale";
  return "rotten";
}
function ageList(list, minutes){ for (const it of list) if (it.age !== undefined) it.age += minutes; }
const listWeight = l => l.reduce((s, it) => s + ITEMS[it.id].w, 0);
function carryCap(){ return 8 + skill("strength") + (P.traits.has("organized") ? 4 : 0); }
function totalLoad(){
  let w = listWeight(P.inv);
  if (P.bag) w += ITEMS[P.bag.id].w + listWeight(P.bag.items) * (1 - ITEMS[P.bag.id].red);
  return w;
}
function allCarried(){ return P.bag ? P.inv.concat(P.bag.items) : P.inv; }
function findTag(tag){ return allCarried().find(it => ITEMS[it.id].tags.includes(tag) && (it.uses === undefined || it.uses > 0)); }
function findId(id){ return allCarried().find(it => it.id === id); }
function removeItem(it){
  let k = P.inv.indexOf(it); if (k >= 0){ P.inv.splice(k, 1); if (P.weapon === it) P.weapon = null; return true; }
  if (P.bag){ k = P.bag.items.indexOf(it); if (k >= 0){ P.bag.items.splice(k, 1); if (P.weapon === it) P.weapon = null; return true; } }
  return false;
}
function giveItem(it){
  const d = ITEMS[it.id];
  if (P.bag && d.cat !== "bag" && listWeight(P.bag.items) + d.w <= ITEMS[P.bag.id].cap && P.weapon !== it){ P.bag.items.push(it); return "bag"; }
  P.inv.push(it); return "inv";
}
function useOne(it){ if (it.uses !== undefined){ it.uses--; if (it.uses <= 0) removeItem(it); } else removeItem(it); }

// ---------- skills ----------
function skill(id){ return P.sk[id].lvl; }
function addXP(id, amt){
  const s = P.sk[id]; if (s.lvl >= 10) return;
  let m = P.traits.has("fastlearn") ? 1.3 : P.traits.has("slowlearn") ? 0.7 : 1;
  if (P.books[id] && s.lvl < 6) m *= 3;
  s.xp += amt * m;
  while (s.lvl < 10 && s.xp >= XP_NEED[s.lvl]){ s.xp -= XP_NEED[s.lvl]; s.lvl++; say(`${SKILLS[id].n} improved to level ${s.lvl}.`, "#d6f2c4"); }
}

// ---------- new game ----------
function newPlayer(name, occ, traits){
  const sk = {}; for (const k in SKILLS) sk[k] = { lvl: 0, xp: 0 };
  sk.fitness.lvl = 5; sk.strength.lvl = 5;
  for (const k in OCCS[occ].sk) sk[k].lvl += OCCS[occ].sk[k];
  if (traits.has("strong")) sk.strength.lvl += 2; if (traits.has("weak")) sk.strength.lvl -= 2;
  if (traits.has("athletic")) sk.fitness.lvl += 2; if (traits.has("unfit")) sk.fitness.lvl -= 2;
  return {
    name, occ, traits, sk, books: {},
    x: 0, y: 0, face: 0.8, vx: 0, vy: 0, moving: false, walkPhase: 0,
    hunger: 0.05, thirst: 0.05, fatigue: 0.15, endurance: 1, boredom: 10, unhappy: 5, panic: 0,
    pain: 0, sickness: 0, health: 100, painkill: 0, fullT: 0,
    wounds: [], infected: false, infT: 0, infDur: 0,
    inv: [], bag: null, weapon: null,
    sneaking: false, running: false, flash: true, aiming: false,
    action: null, queue: [], swing: null, swingCd: 0, shoveCd: 0, stagger: 0,
    sleeping: false, kills: 0, alive: true, speech: null,
  };
}

// ---------- timed actions ----------
function act(name, dur, done, opt = {}){
  P.queue.push({ name, dur, t: 0, done, ...opt });
}
function cancelActions(reason){
  if (P.action || P.queue.length){ if (reason && P.action) say(reason); }
  for (const a of [P.action, ...P.queue]) if (a && a.onCancel) a.onCancel();
  P.action = null; P.queue = [];
  if (P.sleeping) wake();
}
function actionSpeed(){
  const v = G.vit;
  let m = 1 - 0.08 * (v.tired || 0) - 0.06 * (v.unhappy || 0) - 0.05 * (v.pain || 0) - 0.05 * (v.winded || 0);
  return Math.max(0.35, m);
}
function stepAction(dt){
  if (!P.action && P.queue.length) P.action = P.queue.shift();
  const a = P.action; if (!a) return;
  a.t += dt * actionSpeed();
  if (a.tick) a.tick(dt);
  if (a.noiseEvery){ a.nt = (a.nt || 0) + dt; if (a.nt > a.noiseEvery){ a.nt = 0; noise(P.x, P.y, a.noise); } }
  if (a.t >= a.dur){ P.action = null; a.done && a.done(); if (!P.queue.length && typeof renderInv === 'function' && panelOpen('inv')) renderInv(); }
}

// ---------- speech / log ----------
function say(msg, col){
  const log = document.getElementById("log");
  const d = document.createElement("div"); d.textContent = msg; if (col) d.style.color = col;
  log.appendChild(d); while (log.children.length > 4) log.removeChild(log.firstChild);
  setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 1000); }, 4500);
}
function bubble(msg){ P.speech = { msg, t: 3 }; }

// ---------- needs (dm = game minutes elapsed, dt = sim seconds) ----------
function stepNeeds(dt, dm){
  const tr = P.traits, inside = insideAt(P.x, P.y);
  const sleepM = P.sleeping ? 0.5 : 1;
  P.hunger += 0.00055 * dm * (tr.has("lighteat") ? .75 : tr.has("hearty") ? 1.25 : 1) * (P.running ? 1.4 : 1) * sleepM;
  P.thirst += 0.0008 * dm * (P.running ? 1.5 : 1) * sleepM;
  if (P.sleeping){
    const bed = P.sleepOn === "bed" ? 1 : 0.65;
    P.fatigue -= dm / (7 * 60) * bed;
  } else P.fatigue += dm / (17 * 60) * (tr.has("restless") ? 1.2 : 1);
  if (!P.sleeping){
    const busy = P.action && P.action.fun;
    if (busy) P.boredom += busy * dm;
    else if (inside) P.boredom += 0.06 * dm;
    else P.boredom -= (P.moving ? 0.08 : 0.03) * dm;
  }
  if (P.boredom > 50) P.unhappy += 0.02 * dm * (P.boredom - 50) / 50;
  if (P.pain > 30) P.unhappy += 0.006 * dm;
  if (P.fullT > 0) P.fullT -= dm;

  // endurance (sim time)
  const fit = skill("fitness");
  if (P.running && P.moving) P.endurance -= 0.016 * dt * (1.25 - fit * 0.05);
  else if (!P.swing) P.endurance += (P.moving ? 0.03 : P.resting ? 0.11 : 0.055) * dt * (0.75 + fit * 0.05);

  // panic (sim time)
  const desens = Math.max(0.3, 1 - daysSurvived() * 0.1);
  const pm = tr.has("brave") ? 0.5 : tr.has("cowardly") ? 1.8 : 1;
  if (G.visZ > 0) P.panic += Math.min(G.visZ, 6) * 4 * dt * pm * desens;
  else P.panic -= 3 * dt;

  // wounds
  let bleeding = 0, pain = 0;
  for (const w of P.wounds){
    const def = WOUND[w.type];
    w.age += dm;
    if (w.type === "scratch" && w.age > 40) w.bleed = false;
    if (w.bleed && !w.bandaged){ P.health -= def.bleed * dm; bleeding++; }
    pain += def.pain * (w.bandaged ? 0.5 : 1) + (w.inf ? 12 : 0) + (w.glassIn ? 10 : 0);
    if (!w.inf && !w.bandaged && w.age > 180 && R() < 0.0018 * dm) w.inf = true;
    if (!w.inf && w.bandaged && w.dirty && R() < 0.0012 * dm) w.inf = true;
    if (w.inf) P.health -= 0.006 * dm;
    if (!w.inf && !w.glassIn) w.heal -= dm / 60 * (w.bandaged ? 1.4 : 1) * (1 + skill("firstaid") * 0.06);
  }
  P.wounds = P.wounds.filter(w => { if (w.heal <= 0){ say(`Your ${PARTNAME[w.part].toLowerCase()} has healed.`); return false; } return true; });
  if (P.infected){
    P.infT += dm;
    const p = P.infT / P.infDur;
    if (p > 0.3) pain += 10 * p;
    if (p > 0.7) P.health -= 0.06 * dm * (p - 0.6) * 4;
    if (p >= 1){ die("The fever burned through you, and something else got up in your place."); return; }
  }
  if (P.painkill > 0){ P.painkill -= dm; pain *= 0.35; }
  P.pain = pain;
  P.sickness = Math.max(0, P.sickness - 0.0005 * dm);
  if (P.sickness > 0.75) P.health -= 0.02 * dm;
  if (P.hunger >= 1) P.health -= 0.03 * dm;
  if (P.thirst >= 1) P.health -= 0.06 * dm;
  if (P.fatigue >= 1 && !P.sleeping){ say("You collapse from exhaustion."); startSleep("floor"); }
  if (!bleeding && P.hunger < 0.6 && P.thirst < 0.6 && !P.infected) P.health += 0.02 * dm * (1 + skill("firstaid") * 0.05) * (P.sleeping ? 2 : 1);

  P.hunger = clamp(P.hunger, 0, 1); P.thirst = clamp(P.thirst, 0, 1); P.fatigue = clamp(P.fatigue, 0, 1);
  P.endurance = clamp(P.endurance, 0, 1); P.boredom = clamp(P.boredom, 0, 100); P.unhappy = clamp(P.unhappy, 0, 100);
  P.panic = clamp(P.panic, 0, 100); P.health = Math.min(100, P.health);
  if (P.health <= 0) die(bleeding ? "You bled out." : P.thirst >= 1 ? "You died of thirst." : P.hunger >= 1 ? "You starved." : "Your body gave out.");
  // food in pockets keeps aging
  ageList(allCarried(), dm);
}

function feverLevel(){
  let f = 0;
  if (P.wounds.some(w => w.inf)) f = 0.4;
  if (P.infected){ const p = P.infT / P.infDur; if (p > 0.45) f = Math.max(f, (p - 0.3) * 1.3); }
  return f;
}
function queasyLevel(){
  let q = P.sickness;
  if (P.infected){ const p = P.infT / P.infDur; if (p > 0.2) q = Math.max(q, p * 0.95); }
  return q;
}

// ---------- vitals (status icons) ----------
const lv = (v, th) => { let l = 0; for (const t of th) if (v >= t) l++; return l; };
const VITALS = [
  { id:"hungry", ic:"🍽️", val:() => P.hunger, th:[.15,.25,.45,.7], n:["Peckish","Hungry","Very hungry","Starving"], d:["A snack wouldn't hurt.","You should eat soon.","You feel weak.","You are losing health."] },
  { id:"thirsty", ic:"💧", val:() => P.thirst, th:[.12,.25,.5,.75], n:["Slightly thirsty","Thirsty","Parched","Dying of thirst"], d:["Drink something soon.","Find water.","Your head is pounding.","You will die without water."] },
  { id:"tired", ic:"💤", val:() => P.fatigue, th:[.6,.7,.8,.9], n:["Drowsy","Tired","Very tired","Ready to drop"], d:["Slightly slower.","Actions and swings are slower.","Much slower and weaker.","You'll pass out soon."] },
  { id:"winded", ic:"💨", val:() => 1 - P.endurance, th:[.25,.5,.75,.9], n:["Winded","Out of breath","Exhausted","Spent"], d:["Ease off a little.","Moving and swinging slower.","Weak swings, slow feet.","Stop and rest now."] },
  { id:"heavy", ic:"🎒", val:() => totalLoad() / carryCap(), th:[1,1.25,1.5,1.75], n:["Heavy load","Very heavy load","Overloaded","Crushing load"], d:["Slightly slower.","Slower and tiring.","Much slower.","Barely moving."] },
  { id:"panic", ic:"😨", val:() => P.panic, th:[10,30,60,85], n:["Nervous","Scared","Panicked","Terrified"], d:["Hands slightly unsteady.","Swings miss more often.","Badly shaken.","You can barely fight."] },
  { id:"bored", ic:"🥱", val:() => P.boredom, th:[25,50,70,90], n:["Restless","Bored","Very bored","Climbing the walls"], d:["Find something to do.","Getting to you.","Read, watch TV, go outside.","This is wearing you down."] },
  { id:"unhappy", ic:"😞", val:() => P.unhappy, th:[20,40,60,80], n:["Down","Unhappy","Miserable","Despairing"], d:["","Everything takes longer.","You can barely focus.","What's the point?"] },
  { id:"pain", ic:"🤕", val:() => P.pain, th:[8,22,40,65], n:["Sore","In pain","Severe pain","Agony"], d:["","Actions slower.","Much slower.","You can hardly move."] },
  { id:"bleed", ic:"🩸", val:() => P.wounds.filter(w => w.bleed && !w.bandaged).length, th:[1,2,3,4], n:["Bleeding","Bleeding badly","Heavy bleeding","Bleeding out"], d:["Bandage the wound (H).","Bandage your wounds (H).","Bandage now (H).","You are dying (H)."] },
  { id:"hurt", ic:"✚", val:() => 100 - P.health, th:[15,35,55,75], n:["Hurt","Badly hurt","Critical","Dying"], d:["","","","Rest, eat, treat wounds."] },
  { id:"queasy", ic:"🤢", val:queasyLevel, th:[.25,.45,.65,.85], n:["Queasy","Nauseous","Sick","Gravely ill"], d:["Something doesn't agree with you.","You feel awful.","Very unwell.","..."] },
  { id:"fever", ic:"🌡️", val:feverLevel, th:[.3,.5,.7,.9], n:["Feverish","Fever","High fever","Burning up"], d:["Is it a wound infection?","Check your wounds.","Something is very wrong.","..."] },
];
function computeVitals(){
  const v = {};
  for (const d of VITALS) v[d.id] = lv(d.val(), d.th);
  G.vit = v;
}
function moveMult(){
  const v = G.vit;
  return Math.max(0.3, 1 - 0.12 * v.heavy - 0.08 * v.winded - 0.05 * v.pain - 0.05 * v.tired);
}
function dmgMult(){
  const v = G.vit;
  let m = 1 - 0.07 * v.tired - 0.13 * v.winded - (v.hungry >= 3 ? 0.1 : 0);
  return Math.max(0.3, m) * (0.75 + skill("strength") * 0.05);
}

function daysSurvived(){ return (G.min - G.startMin) / 1440; }

// ---------- eating, drinking, reading, medicine ----------
function canUse(it){
  const d = ITEMS[it.id];
  if (useLabel2(it)) return true;
  if (d.cat === "food" || d.cat === "drink"){
    if (d.opener && !findTag("opener")) return "Need a can opener or knife";
    return true;
  }
  if (d.cat === "book" || d.cat === "mag") return P.sleeping ? "Asleep" : true;
  if (d.cat === "clothing" || ["generator", "candle", "torch", "splint"].includes(it.id)) return true;
  if (d.tags.includes("painkiller")) return true;
  if (d.rip) return true;
  if (d.smoke || d.throwable) return true;
  return false;
}
function useLabel(it){
  const d = ITEMS[it.id];
  { const l2 = useLabel2(it); if (l2) return l2; }
  if (d.cat === "clothing") return it.worn ? "Take off" : "Wear"; if (it.id === "generator") return "Set it down here"; if (it.id === "candle") return "Light and set down"; if (it.id === "torch") return "Light the torch"; if (it.id === "splint") return "Splint your leg"; if (d.stash) return "Study the map";
  if (d.cat === "food") return "Eat"; if (d.cat === "drink") return "Drink";
  if (d.cat === "book" || d.cat === "mag") return "Read";
  if (d.tags.includes("painkiller")) return "Take a pill"; if (d.rip) return "Rip into rags";
  if (d.smoke) return "Smoke"; if (d.throwable) return "Throw where you aim"; return null;
}
function useItem(it){
  if (useItem2(it)) return;
  { const d0 = ITEMS[it.id]; if (d0.cat === "clothing") return wearToggle(it); if (it.id === "generator") return placeGenerator(it); if (it.id === "candle") return lightCandle(it); if (it.id === "torch") return lightTorch(it); if (it.id === "splint") return applySplint(it); if (d0.stash) return readStash(it); if (d0.teach === "generator"){ G.genKnow = true; removeItem(it); return say("You read it cover to cover. You know how to hook up a generator now.", "#ffd27a"); } if (it.poison && (d0.cat === "food")) { P.sickness = Math.min(1, (P.sickness || 0) + .45); say("That tasted bitter...", "#c8d88a"); } }
  const d = ITEMS[it.id];
  if (d.throwable) return throwItem(it);
  if (d.cat === "food" || d.cat === "drink"){
    act(d.cat === "food" ? "Eating" : "Drinking", d.cat === "food" ? 5 : 3, () => {
      if (!allCarried().includes(it)) return;
      const fs = freshState(it); let k = 1;
      if (fs === "stale"){ k = 0.7; P.unhappy += 8; }
      if (fs === "rotten"){ k = 0.4; P.unhappy += 18; P.sickness += 0.55; say("That tasted rotten."); }
      P.hunger -= (it.hun ?? d.hun ?? 0) * k; P.thirst -= (it.thi ?? d.thi ?? 0) * k; eatCalories(it, k);
      P.unhappy += it.unh ?? d.unh ?? 0; P.boredom += d.bor || 0;
      if (d.sick && R() < d.sick) P.sickness += .45;
      if (P.hunger <= 0.01 && d.cat === "food") P.fullT = 120;
      const emp = d.empty;
      if (d.uses){ useOne(it); } else { removeItem(it); if (emp) giveItem(makeItem(emp)); }
      P.hunger = clamp(P.hunger, 0, 1); P.thirst = clamp(P.thirst, 0, 1); P.unhappy = clamp(P.unhappy, 0, 100);
    });
  } else if (d.cat === "book"){
    act("Reading", 90, () => { P.books[d.skill] = true; say(`You finish "${d.n}". ${SKILLS[d.skill].n} experience is tripled up to level 6.`, "#d6f2c4"); removeItem(it); }, { fun: -0.5 });
  } else if (d.cat === "mag"){
    act("Reading", d.long ? 60 : 25, () => { P.boredom += d.bor; P.unhappy += d.unh; P.boredom = clamp(P.boredom, 0, 100); P.unhappy = clamp(P.unhappy, 0, 100); removeItem(it); }, { fun: -0.3 });
  } else if (d.tags.includes("painkiller")){
    act("Taking painkillers", 2, () => { P.painkill = 240; useOne(it); say("The pain starts to dull."); });
  } else if (d.rip){
    act("Ripping sheet", 4, () => { removeItem(it); for (let i = 0; i < d.rip; i++) giveItem(makeItem("rags")); });
  } else if (d.smoke){
    act("Smoking", 6, () => { P.unhappy = clamp(P.unhappy - 8, 0, 100); useOne(it); noise(P.x, P.y, 2); });
  }
}

// ---------- injuries ----------
function addWound(part, type, fromZombie){
  const def = WOUND[type];
  P.wounds.push({ part, type, bleed: true, bandaged: false, dirty: false, inf: false, age: 0, heal: def.heal * rf(.8, 1.2), glassIn: type === "glass" && R() < .6 });
  if (fromZombie){
    const chance = CFG.infect[type] || 0;
    if (!P.infected && R() < chance){ P.infected = true; P.infT = 0; P.infDur = rf(CFG.infectHours[0], CFG.infectHours[1]) * 60; }
  }
  P.panic = Math.min(100, P.panic + 15);
}
function bandage(w){
  const b = findTag("bandage"); if (!b) return say("You need a bandage or ripped sheets.");
  act("Bandaging", Math.max(1.5, 3.5 - skill("firstaid") * 0.25), () => {
    if (!P.wounds.includes(w)) return;
    w.bandaged = true; w.bleed = false; w.dirty = R() < (ITEMS[b.id].dirtyRisk || 0);
    useOne(b); addXP("firstaid", 12);
  });
}
function disinfect(w){
  const d = findTag("disinfect"); if (!d) return say("You need disinfectant or strong alcohol.");
  act("Disinfecting", 3, () => { if (!P.wounds.includes(w)) return; w.inf = false; w.clean = true; useOne(d); P.pain += 5; addXP("firstaid", 8); });
}
function removeGlass(w){
  const tw = findTag("tweezers");
  act("Removing glass", tw ? 4 : 9, () => {
    if (!P.wounds.includes(w)) return;
    w.glassIn = false; addXP("firstaid", 10);
    if (!tw && R() < 0.4){ w.bleed = true; w.bandaged = false; say("Digging it out by hand reopens the cut."); }
  });
}
function stitch(w){
  const n = findTag("suture"); if (!n) return say("You need a needle and thread.");
  act("Stitching", Math.max(4, 12 - skill("firstaid")), () => { if (!P.wounds.includes(w)) return; w.heal *= 0.5; w.stitched = true; w.bleed = false; useOne(n); P.pain += 8; addXP("firstaid", 20); });
}

// ---------- sleep ----------
function startSleep(on){
  if (P.fatigue < 0.3 && on !== "floor") return say("You aren't tired enough to sleep.");
  cancelActions(); P.sleeping = true; P.sleepOn = on; G.speedIdx = 0;
  say(on === "bed" ? "You lie down and close your eyes." : "You curl up and try to sleep.");
}
function wake(reason){
  P.sleeping = false;
  if (reason) say(reason, "#ff9a8a");
  if (P.sleepOn !== "bed") P.pain += 6;
}
