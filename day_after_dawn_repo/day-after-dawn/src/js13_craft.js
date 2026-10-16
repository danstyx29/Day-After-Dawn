// ============================================================
// Part 13: crafting, building, cooking, trees, ponds, throwing.
// One recipe format for everything (blueprint section 4.15).
// ============================================================
Object.assign(ITEMS, {
  log:        { n: "Log", w: 4, cat: "mat" },
  branch:     { n: "Branch", w: .5, cat: "mat", tags: ["fuel"] },
  spear:      { n: "Crafted spear", w: 1.2, cat: "weapon", skill: "spear", dmg: [.6, 1.1], range: 1.65, spd: .95, end: .05, cond: 9, kd: .2, crit: .28 },
  spikedbat:  { n: "Spiked bat", w: 1.8, cat: "weapon", skill: "longblunt", dmg: [1.0, 1.5], range: 1.35, spd: 1.05, end: .08, cond: 14, kd: .55, crit: .16 },
  pot:        { n: "Cooking pot", w: 1, cat: "tool", tags: ["pot"] },
  gascan:     { n: "Gas can", w: 1.2, cat: "tool", fuelCap: 1, tags: ["gascan"] },
  noisemaker: { n: "Tin can noisemaker", w: .4, cat: "misc", throwable: true },
  water_t:    { n: "Bottle of pond water", w: .8, cat: "drink", thi: .5, sick: .4, empty: "bottle" },
  rawsteak:   { n: "Raw steak", w: .4, cat: "food", hun: .15, fresh: 2, rot: 4, sick: .5, tags: ["ingredient"] },
  steak:      { n: "Cooked steak", w: .35, cat: "food", hun: .35, unh: -10, fresh: 3, rot: 6, tags: ["ingredient"] },
  stew:       { n: "Pot of stew", w: 1.6, cat: "food", hun: .6, thi: .12, unh: -18, bor: -6, fresh: 3, rot: 6, empty: "pot" },
});
ITEMS.plank.tags = ["fuel"];
for (const k of ["beans", "soup", "tuna", "ham", "cheese", "apple", "banana", "bread", "peaches"]) ITEMS[k].tags = (ITEMS[k].tags || []).concat("ingredient");
for (const k in ITEMS){ ITEMS[k].id = k; ITEMS[k].tags = ITEMS[k].tags || []; }
SKILLS.spear = { n: "Spear", grp: "Combat" };
SKILLS.cooking = { n: "Cooking", grp: "Survival" };
SKILLS.mechanics = { n: "Mechanics", grp: "Crafting" };
LOOT.counter.items.push(["pot", 2]); LOOT.fridge.items.push(["rawsteak", 3]);
LOOT.shelf_hardware.items.push(["gascan", 2]); LOOT.crate.items.push(["gascan", 1]);
LOOT.trunk = { rolls: [0, 3], items: [["water", 3], ["gascan", 2], ["crowbar", 1], ["duffel", 1], ["chips", 2], ["bandage", 2], ["mag", 1], ["soda", 2]] };
Object.assign(OBJ, {
  woodwall:   { n: "Wooden wall", block: true, h: 40, col: "#8a6a42", hp: 40 },
  pcrate:     { n: "Storage crate", cont: "none", block: true, h: 16, col: "#9b7b4c", cap: 40, dis: true, hp: 25 },
  rainbarrel: { n: "Rain collector", block: true, h: 22, col: "#3a5a8a", water: true, hp: 25 },
  campfire:   { n: "Campfire", block: true, h: 6, col: "#5a4a3a", fire: true },
});
FOOT.woodwall = [0, 0, 1, 1]; FOOT.rainbarrel = [.2, .2, .8, .8]; FOOT.campfire = [.2, .2, .8, .8];

const RECIPES = [
  { id: "rags", n: "Rip a sheet into rags", cat: "Survival", in: [["sheet", 1]], out: [["rags", 4]], time: 4 },
  { id: "bandage", n: "Sterilise rags into a bandage", cat: "Medical", in: [["rags", 2], ["disinfect", 1, "use"]], out: [["bandage", 1]], time: 4, xp: ["firstaid", 6] },
  { id: "spear", n: "Carve a spear from a branch", cat: "Weapons", in: [["branch", 1]], tools: ["cut"], out: [["spear", 1]], time: 8, xp: ["carpentry", 8] },
  { id: "spear2", n: "Carve a spear from a plank", cat: "Weapons", in: [["plank", 1]], tools: ["cut"], out: [["spear", 1]], time: 10, xp: ["carpentry", 8] },
  { id: "spiked", n: "Hammer nails into a bat", cat: "Weapons", in: [["bat", 1], ["nails", 4]], tools: ["hammer"], skill: ["carpentry", 1], out: [["spikedbat", 1]], time: 8, xp: ["carpentry", 10] },
  { id: "planks", n: "Saw a log into planks", cat: "Carpentry", in: [["log", 1]], tools: ["saw"], out: [["plank", 3]], time: 10, xp: ["carpentry", 8] },
  { id: "noise", n: "Make a tin can noisemaker", cat: "Survival", in: [["emptycan", 2], ["nails", 2]], out: [["noisemaker", 1]], time: 5 },
  { id: "boil", n: "Boil pond water", cat: "Cooking", in: [["water_t", 1]], tools: ["pot"], station: "heat", out: [["water", 1]], time: 12, xp: ["cooking", 4] },
  { id: "steak", n: "Cook a steak", cat: "Cooking", in: [["rawsteak", 1]], station: "heat", out: [["steak", 1]], time: 10, xp: ["cooking", 8] },
  { id: "stew", n: "Make stew", cat: "Cooking", in: [["pot", 1], ["water", 1], ["ingredient", 2]], station: "heat", out: [["stew", 1]], time: 20, xp: ["cooking", 15] },
];
const CAT_ORDER = ["Survival", "Medical", "Weapons", "Carpentry", "Cooking"];
RECIPES.sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat));
const BUILDS = [
  { id: "woodwall", n: "Wooden wall", in: [["plank", 2], ["nails", 3]], tools: ["hammer"], time: 6, xp: ["carpentry", 12], obj: "woodwall", d: "Blocks the way. Zombies will try to break it down." },
  { id: "pcrate", n: "Storage crate", in: [["plank", 3], ["nails", 4]], tools: ["hammer"], time: 6, xp: ["carpentry", 10], obj: "pcrate", d: "Holds 40 weight of supplies." },
  { id: "rainbarrel", n: "Rain collector barrel", in: [["plank", 4], ["nails", 4]], tools: ["hammer"], skill: ["carpentry", 2], time: 8, xp: ["carpentry", 14], obj: "rainbarrel", d: "Fills with clean water when it rains." },
  { id: "campfire", n: "Campfire", in: [["branch", 3]], time: 4, xp: ["cooking", 2], obj: "campfire", d: "Cook and boil water without power. Lights up the dark, and draws attention." },
];

// ---------- counting and consuming ingredients ----------
const matches = (it, key) => it.id === key || ITEMS[it.id].tags.includes(key);
function haveCount(key, mode){
  let n = 0;
  for (const it of allCarried()){
    if (!matches(it, key)) continue;
    if (key === "nails") n += it.qty || 0; else if (mode === "use") n += it.uses ?? 1; else n++;
  }
  return n;
}
function heatNearby(){
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){
    const o = objs.get(ix(Math.floor(P.x) + dx, Math.floor(P.y) + dy)); if (!o || Math.hypot(o.x + .5 - P.x, o.y + .5 - P.y) > 2.3) continue;
    if (o.type === "oven" && powerOn()) return "Stove";
    if (o.type === "campfire" && o.fuel > 0) return "Campfire";
  }
  return null;
}
function checkRecipe(r){
  const miss = [];
  for (const [k, n, mode] of r.in) if (haveCount(k, mode) < n) miss.push(k);
  for (const t of r.tools || []) if (!findTag(t)) miss.push("tool:" + t);
  if (r.station === "heat" && !heatNearby()) miss.push("heat");
  if (r.skill && skill(r.skill[0]) < r.skill[1]) miss.push("skill");
  return miss;
}
function consume(r){
  for (const [k, n, mode] of r.in){
    let left = n;
    for (const it of allCarried().slice()){
      if (left <= 0) break;
      if (!matches(it, k)) continue;
      if (k === "nails"){ const take = Math.min(left, it.qty); it.qty -= take; left -= take; if (it.qty <= 0) removeItem(it); }
      else if (mode === "use"){ useOne(it); left--; }
      else { removeItem(it); left--; const e = ITEMS[it.id].empty; if (e && k !== "pot") giveItem(makeItem(e)); }
    }
  }
}
function craft(r, times = 1){
  if (checkRecipe(r).length) return say("You're missing something for that.");
  act(r.n.replace(/^./, c => c.toUpperCase()), Math.max(1.5, r.time - skill(r.xp ? r.xp[0] : "carpentry") * .3), () => {
    if (checkRecipe(r).length) return say("You no longer have what you need.");
    consume(r);
    for (const [id, n] of r.out) for (let i = 0; i < n; i++){ const it = makeItem(id); if (ITEMS[id].fresh) it.age = 0; giveItem(it); toast(it); }
    if (r.xp) addXP(r.xp[0], r.xp[1]);
    if (times > 1) craft(r, times - 1);
    if (panelOpen("craft")) renderCraft();
  }, { noise: r.tools && r.tools.includes("hammer") ? 7 : 0, noiseEvery: r.tools && r.tools.includes("hammer") ? 1.2 : 0 });
}

// ---------- crafting screen (B) ----------
let craftTab = "craft", craftSel = 0;
function keyName(k){
  if (k.startsWith("tool:")) k = k.slice(5);
  if (ITEMS[k]) return ITEMS[k].n;
  return { cut: "Knife or blade", hammer: "Hammer", saw: "Saw", pot: "Cooking pot", disinfect: "Disinfectant or vodka", ingredient: "Any ingredient (canned food, meat, fruit, bread, cheese)", heat: "Stove with power, or a lit campfire" }[k] || k;
}
const keyIcon = k => ITEMS[k] ? k : ({ cut: "knife", hammer: "hammer", saw: "saw", pot: "pot", disinfect: "disinf", ingredient: "beans" }[k] || "box");
function renderCraft(){
  const p = $("craft"); p.innerHTML = "";
  const close = el("button", "close", "close"); close.onclick = closePanels; p.appendChild(close);
  const head = el("div", "i-head"); head.appendChild(el("div", "i-title", "Crafting"));
  const tabs = el("div", "i-tabs");
  for (const [k, n] of [["craft", "Craft"], ["build", "Build"]]){ const b = el("button", craftTab === k ? "on" : "", n); b.onclick = () => { craftTab = k; craftSel = 0; renderCraft(); }; tabs.appendChild(b); }
  head.appendChild(tabs);
  const heat = heatNearby();
  head.appendChild(el("div", "i-load", heat ? `Heat: ${heat}` : "No heat source nearby"));
  p.appendChild(head);
  const list = craftTab === "craft" ? RECIPES : BUILDS;
  const body = el("div", "c-body"), L = el("div", "i-list c-recipes"), Rt = el("div", "c-detail");
  let cat = "";
  list.forEach((r, k) => {
    if (r.cat && r.cat !== cat){ cat = r.cat; L.appendChild(el("div", "i-sec", cat)); }
    const ok = !checkRecipe(r).length;
    const out = r.out ? r.out[0][0] : null;
    const row = el("div", "row" + (k === craftSel ? " sel" : "") + (ok ? "" : " dim"), `<span>${out ? icon(out) : `<b class="ic bicon">${r.obj === "campfire" ? "🔥" : "▦"}</b>`}${esc(r.n)}</span><span class="w">${ok ? "ready" : ""}</span>`);
    row.onclick = () => { craftSel = k; renderCraft(); };
    row.ondblclick = () => { if (ok) craftTab === "craft" ? craft(r) : startBuild(r); };
    L.appendChild(row);
  });
  const r = list[craftSel], miss = checkRecipe(r);
  Rt.appendChild(el("div", "c-title", esc(r.n)));
  if (r.d) Rt.appendChild(el("div", "c-none", esc(r.d)));
  if (r.out){ const [id, n] = r.out[0]; Rt.appendChild(el("div", "c-out", `${icon(id, 48)}<span>${n > 1 ? n + " x " : ""}${esc(ITEMS[id].n)}</span>`)); }
  Rt.appendChild(el("div", "c-grp", "Needs"));
  for (const [k, n, mode] of r.in){
    const have = haveCount(k, mode), ok = have >= n;
    Rt.appendChild(el("div", "c-need" + (ok ? "" : " no"), `${icon(keyIcon(k), 22)}<span>${esc(keyName(k))}${mode === "use" ? " (one use)" : ""}</span><span>${Math.min(have, 99)} / ${n}</span>`));
  }
  for (const t of r.tools || []){ const ok = !!findTag(t); Rt.appendChild(el("div", "c-need" + (ok ? "" : " no"), `${icon(keyIcon(t), 22)}<span>Tool: ${esc(keyName(t))}</span><span>${ok ? "have" : "missing"}</span>`)); }
  if (r.station){ const ok = !!heat; Rt.appendChild(el("div", "c-need" + (ok ? "" : " no"), `<b class="ic">🔥</b><span>${esc(keyName("heat"))}</span><span>${ok ? "yes" : "no"}</span>`)); }
  if (r.skill){ const ok = skill(r.skill[0]) >= r.skill[1]; Rt.appendChild(el("div", "c-need" + (ok ? "" : " no"), `<b class="ic">★</b><span>${SKILLS[r.skill[0]].n} level ${r.skill[1]}</span><span>${ok ? "ok" : "too low"}</span>`)); }
  Rt.appendChild(el("div", "c-none", `Takes about ${Math.round(r.time)} seconds${r.xp ? `, trains ${SKILLS[r.xp[0]].n.toLowerCase()}` : ""}.`));
  const btns = el("div", "w-btns");
  if (craftTab === "craft"){
    const b1 = el("button", miss.length ? "off" : "", "Craft"); b1.onclick = () => { if (!miss.length) craft(r); };
    let most = 0; if (!miss.length){ most = Math.min(...r.in.map(([k, n, m]) => Math.floor(haveCount(k, m) / n))); }
    const b2 = el("button", most > 1 ? "" : "off", `Craft all${most > 1 ? ` (${most})` : ""}`); b2.onclick = () => { if (most > 1) craft(r, most); };
    btns.appendChild(b1); btns.appendChild(b2);
  } else {
    const b = el("button", miss.length ? "off" : "", "Place it"); b.onclick = () => { if (!miss.length) startBuild(r); };
    btns.appendChild(b);
  }
  Rt.appendChild(btns);
  body.appendChild(L); body.appendChild(Rt); p.appendChild(body);
}

// ---------- build mode ----------
function startBuild(def){ closePanels(); G.build = def; say(`Placing ${def.n.toLowerCase()}. Left click to build, right click or Esc to cancel.`); }
function buildTarget(){
  const [wx, wy] = toWorld(mouse.x, mouse.y);
  const tx = Math.floor(wx), ty = Math.floor(wy);
  if (!inb(tx, ty)) return { tx, ty, ok: false };
  const t = tile[ix(tx, ty)];
  let ok = [T.GRASS, T.DIRT, T.LOT, T.WALK, T.ROAD, T.FLOOR].includes(t) && !objs.has(ix(tx, ty)) && !feats.has(ix(tx, ty));
  if (ok && Math.hypot(tx + .5 - P.x, ty + .5 - P.y) > 2.7) ok = false;
  if (ok && (Math.abs(tx + .5 - P.x) < .78 && Math.abs(ty + .5 - P.y) < .78)) ok = false;
  if (ok && Z.some(z => z.alive && Math.abs(z.x - tx - .5) < .8 && Math.abs(z.y - ty - .5) < .8)) ok = false;
  if (ok && typeof V !== "undefined" && V.some(v => Math.hypot(v.x - tx - .5, v.y - ty - .5) < 1.3)) ok = false;
  return { tx, ty, ok };
}
function placeBuild(){
  const def = G.build, { tx, ty, ok } = buildTarget();
  if (!ok) return say("You can't build there.");
  if (checkRecipe(def).length) return say("You're missing materials.");
  P.face = Math.atan2(ty + .5 - P.y, tx + .5 - P.x);
  act("Building", Math.max(2, def.time - skill("carpentry") * .3), () => {
    if (!buildTarget || objs.has(ix(tx, ty)) || checkRecipe(def).length) return;
    consume(def);
    const o = placeObj(def.obj, tx, ty, roomId[ix(tx, ty)]);
    delete o.dir; o.built = true;
    if (OBJ[def.obj].hp) o.hp = OBJ[def.obj].hp + skill("carpentry") * 8;
    if (def.obj === "rainbarrel") o.water = 0;
    if (def.obj === "campfire") o.fuel = 90;
    if (def.obj === "pcrate") o.items = [];
    (G.built = G.built || []).push(ix(tx, ty));
    invalidateGround(tx, ty);
    if (def.xp) addXP(def.xp[0], def.xp[1]);
    if (checkRecipe(def).length) G.build = null;
  }, { noise: def.obj === "campfire" ? 0 : 8, noiseEvery: def.obj === "campfire" ? 0 : 1.1 });
}
function drawBuildGhost(){
  if (!G.build) return;
  const { tx, ty, ok } = buildTarget();
  ctx.globalAlpha = .55;
  diamond(tx, ty, 0, ok ? "#6fd27a" : "#d2564a");
  boxW(tx + .1, ty + .1, tx + .9, ty + .9, 0, OBJ[G.build.obj].h, ok ? "#6fd27a" : "#d2564a", .35);
  ctx.globalAlpha = 1;
}

// zombies chew through player-built things
function bashObj(z, o, dt){
  z.bashAt = G.simT;
  z.bashT += dt; if (z.bashT < 1.15) return;
  z.bashT = 0; o.hp -= 1;
  noise(o.x + .5, o.y + .5, 9);
  const d = Math.hypot(P.x - o.x, P.y - o.y); if (d < 22) sfx.thump(1 - d / 22);
  if (o.hp <= 0){
    const i = ix(o.x, o.y);
    if (o.items && o.items.length){ const fl = floorItems.get(i) || []; fl.push(...o.items); floorItems.set(i, fl); }
    objs.delete(i); invalidateGround(o.x, o.y); (G.removed = G.removed || []).push(i);
    if (d < 20) say(`The ${OBJ[o.type].n.toLowerCase()} gives way.`, "#ff9a8a");
  }
}

// ---------- drawing built objects ----------
function drawBuilt(o, dim, a){
  const { x, y } = o, c = shade(OBJ[o.type].col, dim);
  if (o.type === "woodwall"){
    boxW(x + .02, y + .02, x + .98, y + .98, 0, 40, c, a);
    for (const u of [.25, .5, .75]){ line3([x + u, y + .98, 0], [x + u, y + .98, 40], shade("#4a3420", dim), 1, a); line3([x + .98, y + u, 0], [x + .98, y + u, 40], shade("#4a3420", dim), 1, a); }
    for (const z of [12, 28]){ line3([x + .02, y + .99, z], [x + .98, y + .99, z + 2], shade("#5a4028", dim), 2.5, a); }
    if (o.hp < OBJ.woodwall.hp * .5) line3([x + .3, y + .99, 30], [x + .5, y + .99, 18], "#1a120a", 1.5, a);
  } else if (o.type === "pcrate"){
    boxW(x + .1, y + .1, x + .9, y + .9, 0, 16, c, a);
    line3([x + .1, y + .9, 0], [x + .9, y + .9, 16], shade("#6a5030", dim), 1.3, a); line3([x + .9, y + .9, 0], [x + .9, y + .1, 16], shade("#6a5030", dim), 1.3, a);
  } else if (o.type === "rainbarrel"){
    const [sx, sy] = S(x + .5, y + .5, 0), r = .3 * hw * 1.41, ry = .3 * hh * 1.41, h = 22 * zoom;
    ctx.globalAlpha = a; ctx.fillStyle = shade("#2e4a74", dim); ctx.fillRect(sx - r, sy - h, r * 2, h);
    ctx.beginPath(); ctx.ellipse(sx, sy, r, ry, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = shade("#4a6a9a", dim); ctx.beginPath(); ctx.ellipse(sx, sy - h, r, ry, 0, 0, 7); ctx.fill();
    ctx.fillStyle = o.water > 0 ? "#7ab0d8" : "#1e2e44"; ctx.beginPath(); ctx.ellipse(sx, sy - h, r * .8, ry * .8, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (o.type === "campfire"){
    for (let k = 0; k < 8; k++){ const an = k / 8 * 6.28; topEl(x + .5 + Math.cos(an) * .28, y + .5 + Math.sin(an) * .28, .07, 1.5, shade("#7a7670", dim), a); }
    line3([x + .3, y + .4, 2], [x + .7, y + .6, 3], shade("#5a3a1e", dim), 3, a); line3([x + .6, y + .3, 2], [x + .4, y + .7, 3], shade("#4a2e18", dim), 3, a);
    if (o.fuel > 0){
      const [sx, sy] = S(x + .5, y + .5, 3), t = G.simT * 9 + x;
      for (const [col, s, h] of [["rgba(255,120,30,.9)", 1, 16], ["rgba(255,200,60,.95)", .6, 10]]){
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(sx - 7 * zoom * s, sy);
        ctx.quadraticCurveTo(sx - 3 * zoom * s, sy - h * zoom * (1 + .15 * Math.sin(t)), sx + Math.sin(t * 1.3) * 2 * zoom, sy - h * zoom * (1.1 + .2 * Math.sin(t * .7)));
        ctx.quadraticCurveTo(sx + 3 * zoom * s, sy - h * zoom * .8, sx + 7 * zoom * s, sy); ctx.fill();
      }
    }
  }
}
function lightsInView(){
  const out = [];
  for (const i of G.built || []){ const o = objs.get(i); if (o && o.type === "campfire" && o.fuel > 0) out.push([o.x + .5, o.y + .5, 4.5]); }
  return out;
}

// ---------- extra world interactions ----------
function treeOptions(x, y, out){
  const i = ix(x, y), taken = (G.branches = G.branches || {})[i] || 0;
  out.push({ label: "Gather fallen branches", off: taken >= 3, fn: () => act("Gathering branches", 4, () => {
    const n = ri(1, 2); G.branches[i] = (G.branches[i] || 0) + n;
    for (let k = 0; k < n; k++){ const it = makeItem("branch"); giveItem(it); toast(it); } }) });
  const axe = findTag("chop");
  out.push({ label: axe ? `Chop down the tree (${ITEMS[axe.id].n.toLowerCase()})` : "Chop down the tree (needs an axe)", off: !axe, fn: () => {
    act("Chopping", Math.max(6, 14 - skill("axe") * .8), () => {
      if (tile[i] !== T.TREE) return;
      tile[i] = T.GRASS; invalidateGround(x, y); (G.tileEdits = G.tileEdits || {})[i] = T.GRASS;
      const fl = floorItems.get(i) || []; fl.push(makeItem("log"), makeItem("log"), makeItem("branch"), makeItem("branch")); floorItems.set(i, fl);
      addXP("axe", 6); addXP("strength", 1); P.endurance -= .15;
      say("Timber. Two logs and some branches on the ground.");
    }, { noise: 15, noiseEvery: 1.4 });
  } });
}
function waterOptions(out){
  waterOptions2(out);
  out.push({ label: "Drink from the pond", fn: () => act("Drinking", 4, () => { P.thirst = 0; if (R() < .4){ P.sickness += .35; } }) });
  const bottles = allCarried().filter(it => ITEMS[it.id].tags.includes("fillable"));
  if (bottles.length) out.push({ label: `Fill ${bottles.length} bottle${bottles.length > 1 ? "s" : ""} with pond water`, fn: () => act("Filling bottles", 2 * bottles.length, () => {
    for (const b of bottles){ const inBag = P.bag && P.bag.items.includes(b); if (!removeItem(b)) continue; const nw = makeItem("water_t"); inBag ? P.bag.items.push(nw) : P.inv.push(nw); } }) });
}
function builtOptions(o, out){
  seatOptions(o, out); if (builtOptions2(o, out)) return;
  if (o.type === "pump") return pumpOptions(o, out);
  if (o.type === "stairs"){ stairOptions(o, out); stairSmashOption(o, out); return; }
  if (o.type === "generator") return generatorOptions(o, out);
  if (OBJ[o.type].fence) return fenceOptions(o, out);
  if (o.type === "campfire"){
    const fuel = allCarried().find(it => ITEMS[it.id].tags.includes("fuel"));
    out.push({ label: fuel ? `Add ${ITEMS[fuel.id].n.toLowerCase()} to the fire` : "Add fuel (branch or plank)", off: !fuel, fn: () => act("Feeding the fire", 2, () => {
      if (!removeItem(fuel)) return; o.fuel = (o.fuel || 0) + (fuel.id === "plank" ? 120 : 60); }) });
    if (o.fuel > 0) out.push({ label: "Put the fire out", fn: () => { o.fuel = 0; } });
  }
  if (OBJ[o.type].hp && o.built) out.push({ label: `Take it down (hammer)`, off: !findTag("hammer"), fn: () => act("Taking it down", 6, () => {
    const i = ix(o.x, o.y); if (o.items && o.items.length){ const fl = floorItems.get(i) || []; fl.push(...o.items); floorItems.set(i, fl); }
    objs.delete(i); invalidateGround(o.x, o.y); (G.removed = G.removed || []).push(i); giveItem(makeItem("plank")); }, { noise: 7, noiseEvery: 1.2 }) });
}

// ---------- throwing ----------
function throwItem(it){
  const [wx, wy] = toWorld(mouse.x, mouse.y);
  let dx = wx - P.x, dy = wy - P.y; const d = Math.hypot(dx, dy) || 1, k = Math.min(1, 9 / d);
  const tx = P.x + dx * k, ty = P.y + dy * k;
  if (!removeItem(it)) return;
  P.face = Math.atan2(dy, dx);
  (G.throws = G.throws || []).push({ x: tx, y: ty, t: .6, it });
  sfx.swing(); say("You hurl it as far as you can.");
}

// ---------- per-step upkeep ----------
let craftClock = 0;
function craftStep(dt, dm){
  if (G.throws && G.throws.length){
    for (const t of G.throws){
      t.t -= dt;
      if (t.t <= 0){
        if (!landThrow(t)){ const i = ix(Math.floor(t.x), Math.floor(t.y)); if (inb(Math.floor(t.x), Math.floor(t.y))){ const fl = floorItems.get(i) || []; fl.push(t.it); floorItems.set(i, fl); } }
        G.noiseMarks = (G.noiseMarks || []).concat([{ x: t.x, y: t.y, t: 1.2 }]);
      }
    }
    G.throws = G.throws.filter(t => t.t > 0);
  }
  craftClock += dm;
  if (craftClock < 5) return;
  const m = craftClock; craftClock = 0;
  for (const i of G.built || []){
    const o = objs.get(i); if (!o) continue;
    if (o.type === "rainbarrel" && G.rain) o.water = Math.min(25, (o.water || 0) + m * .05);
    if (o.type === "campfire" && o.fuel > 0){ o.fuel = Math.max(0, o.fuel - m); if (Math.hypot(o.x - P.x, o.y - P.y) < 3) P.unhappy = Math.max(0, P.unhappy - m * .02); }
  }
  if (G.built) G.built = G.built.filter(i => objs.has(i));
}
