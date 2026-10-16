// ============================================================
// Part 26: car mechanics. Open the hood (E at a car, "Open the
// hood") to see every part, take parts off wrecks and fit them
// to the car you want to keep running.
// ============================================================
Object.assign(ITEMS, {
  wrench:      { n: "Wrench", w: .8, cat: "tool", tags: ["wrench"] }, jack: { n: "Car jack", w: 3, cat: "tool", tags: ["jack"] }, lugwrench: { n: "Lug wrench", w: 1, cat: "tool", tags: ["lugwrench"] },
  carbattery:  { n: "Car battery", w: 12, cat: "part" }, tire: { n: "Tire", w: 8, cat: "part" }, brakes: { n: "Brakes", w: 3, cat: "part" }, suspension: { n: "Suspension", w: 6, cat: "part" },
  muffler:     { n: "Muffler", w: 6, cat: "part" }, windshield: { n: "Windshield", w: 12, cat: "part" }, gastank: { n: "Gas tank", w: 10, cat: "part" },
  engineparts: { n: "Spare engine parts", w: .4, cat: "part" }, bk_mech: { n: "Auto Repair for Beginners", w: .6, cat: "book", skill: "mechanics" },
});
for (const k in ITEMS){ ITEMS[k].id = k; ITEMS[k].tags = ITEMS[k].tags || []; }
Object.assign(ICON, { wrench: ["screwdriver", "#8a9096"], jack: ["nailbox", "#c83a2a"], lugwrench: ["crowbar", "#5a5e62"], carbattery: ["box", "#2a2a2a"], tire: ["roll", "#1e1e1e"], brakes: ["box", "#8a8e92"],
  suspension: ["pipe", "#6a6e72"], muffler: ["pipe", "#5a5048"], windshield: ["box", "#9ab8c8"], gastank: ["box", "#4a4e52"], engineparts: ["nailbox", "#8a8e92"], bk_mech: ["book", "#c86a1a"] });
const PARTS2 = {
  battery:   { n: "Battery", item: "carbattery", tools: ["screwdrv"], lvl: 0, t: 3 },
  tireFL:    { n: "Front left tire", item: "tire", tools: ["jack", "lugwrench"], lvl: 1, t: 5 },
  tireFR:    { n: "Front right tire", item: "tire", tools: ["jack", "lugwrench"], lvl: 1, t: 5 },
  tireRL:    { n: "Rear left tire", item: "tire", tools: ["jack", "lugwrench"], lvl: 1, t: 5 },
  tireRR:    { n: "Rear right tire", item: "tire", tools: ["jack", "lugwrench"], lvl: 1, t: 5 },
  brakes:    { n: "Brakes", item: "brakes", tools: ["jack", "wrench"], lvl: 3, t: 7 },
  suspension:{ n: "Suspension", item: "suspension", tools: ["jack", "wrench"], lvl: 3, t: 7 },
  muffler:   { n: "Muffler", item: "muffler", tools: ["wrench"], lvl: 5, t: 8 },
  windshield:{ n: "Windshield", item: "windshield", tools: ["screwdrv"], lvl: 5, t: 8 },
  gastank:   { n: "Gas tank", item: "gastank", tools: ["wrench"], lvl: 5, t: 9 },
};
const TIRES = ["tireFL", "tireFR", "tireRL", "tireRR"];
function carParts(c){
  if (c.parts) return c.parts;
  const base = c.junk ? 30 : c.crashed ? 45 : 70, p = {};
  for (const k of Object.keys(PARTS2)){
    const missing = c.junk && R() < .35;
    p[k] = missing ? null : { cond: clamp(Math.round(base + rf(-25, 30)), 0, 100) };
  }
  if (p.battery) p.battery.charge = c.junk ? rf(0, .3) : rf(.15, 1);
  if (c.junk){ c.cond = ri(0, 55); c.fuel = 0; }
  return c.parts = p;
}
const flats = c => { const p = carParts(c); return TIRES.filter(k => !p[k] || p[k].cond <= 0).length; };
function carPerf(c){
  const p = carParts(c);
  let f = c.cond <= 0 ? 0 : .45 + .55 * Math.min(1, c.cond / 70);
  const fl = flats(c); f *= fl ? (fl >= 2 ? .35 : .6) : 1;
  const tw = TIRES.reduce((s, k) => s + (p[k] ? p[k].cond : 0), 0) / 400; f *= .85 + .15 * tw;
  return f;
}
const brakeF = c => { const b = carParts(c).brakes; return b ? .35 + .65 * b.cond / 100 : .15; };
const steerF = c => { const s = carParts(c).suspension; return (s ? .7 + .3 * s.cond / 100 : .55) * (flats(c) ? .75 : 1); };
const mufflerF = c => { const m = carParts(c).muffler; return m ? 1 + (1 - m.cond / 100) * 1.4 : 2.6; };
function carWear(c, dt){
  const p = carParts(c), sp = Math.abs(c.v);
  if (c.on && p.battery) p.battery.charge = Math.min(1, p.battery.charge + dt * .002);
  if (!c.on && c.lightsOn && p.battery) p.battery.charge = Math.max(0, p.battery.charge - dt * .0005);
  if (sp > .5) for (const k of TIRES) if (p[k] && R() < sp * dt * .004) p[k].cond = Math.max(0, p[k].cond - 1);
  if (p.brakes && keys[" "] && sp > 2 && R() < dt * .5) p.brakes.cond = Math.max(0, p.brakes.cond - 1);
  if (!p.gastank){ c.fuel = 0; } else if (p.gastank.cond < 20 && c.fuel > 0) c.fuel = Math.max(0, c.fuel - dt * .00004);
  // a flat tire pulls the car to one side
  const fl = flats(c); if (fl && sp > 1) c.a += Math.sin(G.simT * 7) * .012 * fl;
}
function carHitWear(c){ const p = carParts(c); for (const k of ["suspension", ...TIRES]) if (p[k] && R() < .35) p[k].cond = Math.max(0, p[k].cond - ri(1, 4)); if (p.windshield && R() < .15) p.windshield.cond = Math.max(0, p.windshield.cond - ri(3, 10)); }
function carHUD(){
  const c = P.car, p = carParts(c), warn = [];
  if (flats(c)) warn.push(`${flats(c)} FLAT`); if (p.battery && p.battery.charge < .2) warn.push("LOW BATTERY"); if (!p.battery) warn.push("NO BATTERY");
  if (c.cond < 25) warn.push("ENGINE BAD"); if (p.brakes && p.brakes.cond < 25) warn.push("BRAKES"); if (!p.muffler || p.muffler.cond < 30) warn.push("LOUD");
  return `${c.on ? "ENGINE ON" : "ENGINE OFF"}  ${Math.round(Math.abs(c.v) * 9)} km/h<br>FUEL <span class="bar"><i style="width:${Math.round(c.fuel * 100)}%"></i></span>  ENGINE ${Math.round(c.cond)}%` + (warn.length ? `<br><span style="color:#ff9a7a">${warn.join("  ")}</span>` : "");
}

// ---------- the mechanics screen ----------
let MECH_CAR = null;
const hasTool = id => allCarried().some(it => it.id === id);
function mechChance(lvl){ return clamp(.7 + (skill("mechanics") - lvl) * .08, .3, .97); }
function openMech(c){ MECH_CAR = c; carParts(c); closePanels(); $("mech").classList.remove("hidden"); renderMech(); }
function renderMech(){
  const c = MECH_CAR, box = $("mech"); if (!c || !box) return;
  const p = carParts(c), lvl = skill("mechanics");
  box.innerHTML = "";
  const close = el("button", "close", "close"); close.onclick = closePanels; box.appendChild(close);
  const head = el("div", "i-head"); head.appendChild(el("div", "i-title", `Mechanics: ${CAR_NAMES[c.col] || "old"} ${c.livery === "police" ? "police car" : c.livery === "amb" ? "ambulance" : c.junk ? "wreck" : "car"}`)); box.appendChild(head);
  box.appendChild(el("div", "", `Your Mechanics level: ${lvl}.  Tools: ${["screwdrv", "wrench", "jack", "lugwrench"].map(t => (hasTool(t) ? "✓ " : "✗ ") + ITEMS[t].n.toLowerCase()).join(",  ")}`));
  const tbl = el("div", ""); tbl.style.cssText = "display:grid;grid-template-columns:150px 140px 60px 1fr;gap:4px 10px;margin-top:10px;align-items:center";
  const bar = v => `<span class="bar" style="width:120px"><i style="width:${Math.round(v)}%;background:${v > 60 ? "#8ad08a" : v > 25 ? "#e8d060" : "#ff7050"}"></i></span>`;
  const row = (name, val, txt, btns) => { tbl.appendChild(el("div", "", name)); const b = el("div", ""); b.innerHTML = val == null ? "<i style='color:#ff9a7a'>missing</i>" : bar(val); tbl.appendChild(b); tbl.appendChild(el("div", "", txt)); const bx = el("div", ""); btns.forEach(x => bx.appendChild(x)); tbl.appendChild(bx); };
  const btn = (label, ok, why, fn) => { const b = el("button", "", label); b.style.cssText = "margin-right:6px;font-size:16px;padding:0 8px"; if (!ok){ b.disabled = true; b.title = why; b.style.opacity = .45; } else b.onclick = fn; return b; };
  // engine
  const parts = allCarried().filter(it => it.id === "engineparts").reduce((s, it) => s + (it.qty || 1), 0);
  row("Engine", c.cond, `${Math.round(c.cond)}%`, [
    btn(`Repair (${parts} parts)`, hasTool("wrench") && lvl >= 4 && parts > 0 && c.cond < 100, lvl < 4 ? "Needs Mechanics 4" : !hasTool("wrench") ? "Needs a wrench" : "Needs spare engine parts", () => repairEngine(c)),
    btn("Strip for parts", hasTool("wrench") && lvl >= 4 && c.cond >= 10, lvl < 4 ? "Needs Mechanics 4" : c.cond < 10 ? "Engine below 10%" : "Needs a wrench", () => salvageEngine(c)),
  ]);
  for (const [k, d] of Object.entries(PARTS2)){
    const part = p[k], toolsOk = d.tools.every(hasTool), lvlOk = lvl >= d.lvl;
    const why = !lvlOk ? `Needs Mechanics ${d.lvl}` : `Needs ${d.tools.map(t => ITEMS[t].n.toLowerCase()).join(" and ")}`;
    const inv = allCarried().filter(it => it.id === d.item).sort((a, b) => (b.cond ?? 0) - (a.cond ?? 0))[0];
    const txt = part ? `${Math.round(part.cond)}%` + (k === "battery" ? ` ⚡${Math.round(part.charge * 100)}%` : "") : "";
    row(d.n, part ? part.cond : null, txt, part
      ? [btn("Take off", toolsOk && lvlOk && !c.on, c.on ? "Turn the engine off" : why, () => partAction(c, k, "off"))]
      : [btn(inv ? `Fit (${Math.round(inv.cond ?? 50)}%)` : "Fit", !!inv && toolsOk && lvlOk, !inv ? `You have no ${ITEMS[d.item].n.toLowerCase()}` : why, () => partAction(c, k, "on", inv))]);
  }
  box.appendChild(tbl);
  box.appendChild(el("div", "", "Wrecks and junkyards are full of parts. Higher Mechanics means fewer botched jobs."));
}
function partAction(c, k, dir, inv){
  const d = PARTS2[k], ch = mechChance(d.lvl);
  closePanels();
  act(dir === "off" ? `Removing the ${d.n.toLowerCase()}` : `Fitting the ${d.n.toLowerCase()}`, d.t * (1 - skill("mechanics") * .04), () => {
    const p = carParts(c);
    if (R() > ch){ addXP("mechanics", 1); if (dir === "off" && p[k]) p[k].cond = Math.max(0, p[k].cond - 10); say("You fumble it and damage the part.", "#ff9a8a"); }
    else if (dir === "off"){ const it = makeItem(d.item); it.cond = p[k].cond; if (k === "battery") it.charge = p[k].charge; p[k] = null; giveItem(it); addXP("mechanics", 4 + d.lvl); say(`${d.n} off.`); }
    else { removeItem(inv); p[k] = { cond: inv.cond ?? 60 }; if (k === "battery") p[k].charge = inv.charge ?? .5; addXP("mechanics", 4 + d.lvl); say(`${d.n} fitted.`); }
    noise(c.x, c.y, 4); openMech(c);
  }, { noise: 3, noiseEvery: 2 });
}
function repairEngine(c){
  closePanels();
  act("Rebuilding the engine", 9, () => {
    let used = 0;
    while (used < 5 && c.cond < 100){ const st = allCarried().find(i => i.id === "engineparts"); if (!st) break; if ((st.qty || 1) > 1) st.qty--; else removeItem(st); used++; c.cond = Math.min(100, c.cond + 1 + skill("mechanics") * .4); }
    addXP("mechanics", 6); say(`Engine now at ${Math.round(c.cond)}%.`); openMech(c);
  }, { noise: 5, noiseEvery: 2 });
}
function salvageEngine(c){
  closePanels();
  act("Stripping the engine", 10, () => {
    const n = Math.floor(c.cond / 8 * (.4 + skill("mechanics") * .06)); c.cond = 0; c.on = false;
    if (n > 0){ const it = makeItem("engineparts"); it.qty = n; giveItem(it); }
    addXP("mechanics", 6); say(n ? `You pull ${n} usable engine parts. This one won't run again.` : "Nothing worth keeping."); openMech(c);
  }, { noise: 5, noiseEvery: 2 });
}
// parts and tools where a mechanic would expect them
Object.assign(LOOT, {
  partsbin: { rolls: [1, 4], items: [["tire", 3], ["carbattery", 2], ["brakes", 2], ["suspension", 1], ["muffler", 1], ["engineparts", 5], ["wrench", 2], ["jack", 1], ["lugwrench", 2], ["bk_mech", 1], ["gascan", 2]] },
  tires: { rolls: [1, 3], items: [["tire", 1]] },
});
addL("trunk", [["jack", 3], ["lugwrench", 3], ["tire", 1], ["wrench", 1]]);
addL("workshop", [["wrench", 3], ["jack", 2], ["lugwrench", 2], ["engineparts", 3], ["carbattery", 1], ["bk_mech", 1]]);
addL("shelf_hardware", [["wrench", 2], ["jack", 1], ["lugwrench", 1]]);
addL("crate", [["wrench", 1], ["engineparts", 1]]);
addL("bookcase", [["bk_mech", 1]]);
AMMO_BOX.engineparts = [2, 6];
function fixLootStacks(o){
  for (const it of o.items || []){
    if (AMMO_BOX[it.id] && !it.qty) it.qty = ri(...AMMO_BOX[it.id]);
    if (GUNS[it.id] && it.loaded === undefined) it.loaded = R() < .35 ? ri(0, GUNS[it.id].cap) : 0;
    if (ITEMS[it.id].cat === "part" && it.id !== "engineparts" && it.cond === undefined) it.cond = ri(25, 95);
    if (it.id === "carbattery" && it.charge === undefined) it.charge = rf(0, .8);
  }
}
