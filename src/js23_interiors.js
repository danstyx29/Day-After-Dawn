// ============================================================
// Part 23: interiors. More furniture, a designer that lays rooms
// out like people actually live in them, the same detail on every
// floor, and basements under some houses.
// ============================================================
Object.assign(OBJ, {
  armchair:   { n: "Armchair", block: true, h: 15, col: "#6a4a3a", seat: true },
  coffeetable:{ n: "Coffee table", block: true, h: 7, col: "#6a4a30" },
  nightstand: { n: "Nightstand", cont: "nightstand", block: true, h: 11, col: "#7a5638", cap: 4 },
  plant:      { n: "Potted plant", block: true, h: 18, col: "#3a6a2a" },
  tub:        { n: "Bathtub", block: true, h: 9, col: "#e8eae6", water: true },
  chair:      { n: "Chair", block: true, h: 15, col: "#6a4a30", seat: true },
  dtable:     { n: "Dining table", block: true, h: 13, col: "#7a5a3a" },
  officedesk: { n: "Office desk", cont: "desk", block: true, h: 20, col: "#8a8a82", cap: 8 },
  rug:        { n: "Rug", block: false, h: 0, col: "#7a3a3a" },
  floorlamp:  { n: "Floor lamp", block: true, h: 30, col: "#d8c8a0", light: 2.6 },
  fireplace:  { n: "Fireplace", block: true, h: 30, col: "#8a4a3a" },
  piano:      { n: "Piano", block: true, h: 22, col: "#1e1a18" },
  watercooler:{ n: "Water cooler", block: true, h: 22, col: "#d8e4ec", water: true },
  boiler:     { n: "Water heater", block: true, h: 30, col: "#c8ccd0" },
  workbench:  { n: "Workbench", cont: "workshop", block: true, h: 15, col: "#7a5a3a", cap: 20 },
  boxes:      { n: "Moving boxes", cont: "boxes", block: true, h: 12, col: "#b8946a", cap: 12 },
  pantry:     { n: "Pantry shelf", cont: "pantry", block: true, h: 30, col: "#8a7a62", cap: 20 },
  chalkboard: { n: "Chalkboard", block: false, h: 0, col: "#2a3a2e" },
  ivstand:    { n: "IV stand", block: true, h: 26, col: "#c8ccd0" },
  cribbed:    { n: "Crib", block: true, h: 12, col: "#e8e0d0", bed: false },
  dryer:      { n: "Dryer", block: true, h: 18, col: "#e6e8e4" },
});
Object.assign(FOOT, { chair: [.25, .25, .75, .75], plant: [.28, .28, .72, .72], floorlamp: [.35, .35, .65, .65], ivstand: [.38, .38, .62, .62], nightstand: [.15, 0, .85, .55], fireplace: [.05, 0, .95, .35], piano: [.05, 0, .95, .45], tub: [0, 0, 1, .55], watercooler: [.3, 0, .7, .4], boiler: [.25, .1, .75, .6] });
["chair", "plant", "floorlamp", "ivstand", "coffeetable", "dtable", "rug", "armchair", "boxes"].forEach(k => NOOFF.add(k));
Object.assign(LOOT, {
  nightstand: { rolls: [0, 2], items: [["pills", 2], ["novel", 2], ["mag", 2], ["watch", 1], ["batteries", 1], ["cigs", 1], ["candle", 2]] },
  boxes:      { rolls: [0, 3], items: [["sheet", 3], ["novel", 2], ["mag", 2], ["comic", 2], ["batteries", 1], ["candle", 2], ["junk_plate", 2], ["junk_toy", 1]] },
  pantry:     { rolls: [1, 4], items: [["beans", 4], ["tuna", 3], ["soup", 3], ["crackers", 2], ["water", 3], ["junk_jar", 3]] },
});

// ---------- furniture models ----------
function drawDecor3(o, dim, a){
  const x = o.x, y = o.y, sd = c => shade(c, dim), cx = x + .5, cy = y + .5;
  if (["armchair", "nightstand", "tub", "officedesk", "fireplace", "piano", "watercooler", "boiler", "workbench", "pantry", "dryer", "cribbed"].includes(o.type)){
    const M = Model(o, dim, a);
    switch (o.type){
      case "armchair": M.part(.12, .12, .88, .88, 0, 7, sd(o.col || "#6a4a3a")); M.part(.12, .05, .88, .28, 7, 16, sd(o.col || "#5a3e30")); M.part(.08, .2, .22, .88, 7, 11, sd("#5a3e30")); M.part(.78, .2, .92, .88, 7, 11, sd("#5a3e30")); break;
      case "nightstand": M.part(.15, .02, .85, .55, 0, 11, sd("#7a5638"), () => M.front(.3, .7, .55, 5, 7, sd("#5a3e28"))); if (hash(x, y) < .6) M.part(.4, .15, .6, .35, 11, 17, "#e8d8a0"); break;
      case "tub": M.part(0, 0, 1, .55, 0, 9, sd("#e8eae6"), () => M.top(.06, .06, .94, .49, 9.05, sd("#b8c8d0"))); break;
      case "officedesk": M.part(.05, .1, .95, .7, 0, 13, sd("#8a8a82")); M.part(.35, .15, .7, .35, 13, 21, sd("#d8d4c8"), () => M.front(.39, .66, .35, 15, 20, "#2a3a4a")); M.part(.4, .4, .65, .55, 13, 14, sd("#d8d4c8")); break;
      case "fireplace": M.part(.05, 0, .95, .35, 0, 30, sd("#8a4a3a"), () => { M.front(.25, .75, .35, 3, 16, "#1a120c"); M.front(.15, .85, .35, 18, 20, sd("#5a3a2a")); }); break;
      case "piano": M.part(.05, 0, .95, .45, 0, 22, sd("#1e1a18"), () => M.front(.1, .9, .45, 12, 13.5, "#e8e4dc")); M.part(.05, .45, .95, .6, 11, 13, sd("#1e1a18")); break;
      case "watercooler": M.part(.3, 0, .7, .4, 0, 14, sd("#d8e4ec")); M.part(.35, .05, .65, .35, 14, 22, "#7ab0d8"); break;
      case "boiler": M.part(.25, .1, .75, .6, 0, 30, sd("#c8ccd0")); break;
      case "workbench": M.part(0, .05, 1, .7, 12, 15, sd("#7a5a3a")); for (const [u, v] of [[.05, .1], [.9, .1], [.05, .6], [.9, .6]]) M.part(u, v, u + .05, v + .05, 0, 12, sd("#5a3e28")); M.part(.15, .1, .35, .3, 15, 17, sd("#8a8e92")); break;
      case "pantry": M.part(.05, 0, .95, .45, 0, 30, sd("#8a7a62"), () => { for (const z of [8, 16, 24]){ M.front(.08, .92, .45, z, z + .8, sd("#5a4a3a")); M.front(.12 + hash(x, z) * .3, .3 + hash(x, z) * .3, .45, z + .8, z + 5, ["#c84a3a", "#e8c040", "#4a7ac8"][z % 3]); } }); break;
      case "dryer": M.part(.1, .05, .9, .7, 0, 18, sd("#e6e8e4")); break;
      case "cribbed": M.part(.1, .1, .9, .9, 4, 6, sd("#e8e0d0")); for (const u of [.1, .9]) M.part(u - .03, .1, u + .03, .9, 0, 12, sd("#e8e0d0")); break;
    }
    M.draw(); return true;
  }
  switch (o.type){
    case "coffeetable": boxW(x + .15, y + .25, x + .85, y + .75, 5, 7, sd("#6a4a30"), a); for (const [u, v] of [[.18, .28], [.78, .28], [.18, .68], [.78, .68]]) boxW(x + u, y + v, x + u + .04, y + v + .04, 0, 5, sd("#4a3424"), a); if (hash(x, y) < .5) boxW(x + .4, y + .4, x + .6, y + .55, 7, 7.6, "#c8b898", a); return true;
    case "chair": boxW(x + .3, y + .3, x + .7, y + .7, 7, 8.5, sd(o.col || "#6a4a30"), a); for (const [u, v] of [[.3, .3], [.66, .3], [.3, .66], [.66, .66]]) boxW(x + u, y + v, x + u + .04, y + v + .04, 0, 7, sd("#4a3424"), a); boxW(x + .3, y + .28, x + .7, y + .33, 8.5, 15, sd(o.col || "#6a4a30"), a); return true;
    case "dtable": for (const [u, v] of [[.1, .1], [.86, .1], [.1, .86], [.86, .86]]) boxW(x + u, y + v, x + u + .04, y + v + .04, 0, 12, sd("#4a3424"), a); boxW(x + .05, y + .05, x + .95, y + .95, 12, 13.5, sd("#7a5a3a"), a); if (hash(x, y) < .5) topEl(cx, cy, .12, 13.6, "#e8e4dc", a); return true;
    case "rug": { const c = o.col || pick(["#7a3a3a", "#3a4a6a", "#6a5a3a", "#4a5a3a"], () => hash(x, y)); topR(x + .05, y + .05, x + .95, y + .95, .3, sd(c), a); topR(x + .15, y + .15, x + .85, y + .85, .35, sd(shade(c, 1.25)), a * .5); return true; }
    case "plant": boxW(x + .38, y + .38, x + .62, y + .62, 0, 6, sd("#8a5a3a"), a); { const [sx, sy] = S(cx, cy, 13); ctx.globalAlpha = a; for (let k = 0; k < 5; k++){ ctx.fillStyle = sd(k % 2 ? "#3a6a2a" : "#4a7a34"); ctx.beginPath(); ctx.ellipse(sx + Math.cos(k * 1.3) * 3 * zoom, sy + Math.sin(k * 1.9) * 2.4 * zoom, 3.8 * zoom, 2.6 * zoom, k, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; } return true;
    case "floorlamp": line3([cx, cy, 0], [cx, cy, 24], sd("#3a3a3a"), 1, a); { const lit = powerOn() && isNight(); const [sx, sy] = S(cx, cy, 27); ctx.globalAlpha = a; ctx.fillStyle = lit ? "#fff0c0" : sd("#d8c8a0"); ctx.beginPath(); ctx.moveTo(sx - 3.5 * zoom, sy + 3 * zoom); ctx.lineTo(sx + 3.5 * zoom, sy + 3 * zoom); ctx.lineTo(sx + 2 * zoom, sy - 3 * zoom); ctx.lineTo(sx - 2 * zoom, sy - 3 * zoom); ctx.fill(); ctx.globalAlpha = 1; } return true;
    case "chalkboard": return true;
    default: if (drawDecor4(o, dim, a)) return true;
    case "ivstand": line3([cx, cy, 0], [cx, cy, 26], sd("#c8ccd0"), 1, a); boxW(cx - .06, cy - .03, cx + .06, cy + .03, 20, 25, "#c8e0f0", a * .8); return true;
  }
  return false;
}

// ---------- the interior designer ----------
// what a lived-in room has, beyond the essentials each generator passes in
const ROOM_EXTRAS = {
  living:    { low: ["armchair", "plant", "floorlamp"], center: ["rug", "coffeetable"], maybe: [["fireplace", .3], ["piano", .08]] },
  bedroom:   { low: ["nightstand", "nightstand", "plant"], center: ["rug"], maybe: [["boxes", .25], ["desk", .3], ["cribbed", .06]] },
  kitchen:   { low: ["counter", "trashcan"], center: ["dtable"], chairs: true, maybe: [["pantry", .35]] },
  bathroom:  { low: ["tub"], center: [], maybe: [] },
  office:    { low: ["plant", "watercooler"], center: [], maybe: [["boxes", .3]] },
  ward:      { low: ["ivstand", "ivstand", "nightstand"], center: [], maybe: [] },
  reception: { low: ["plant", "chair", "chair", "chair"], center: ["rug"], maybe: [["watercooler", .5]] },
  lobby:     { low: ["plant", "plant", "chair", "chair"], center: ["rug"], maybe: [["watercooler", .5]] },
  classroom: { low: ["plant"], center: [], maybe: [] },
  staff:     { low: ["chair", "chair", "watercooler"], center: ["dtable"], maybe: [] },
  diner:     { low: ["plant"], center: [], chairs: true, maybe: [] },
  barroom:   { low: ["chair", "chair"], center: [], chairs: true, maybe: [["piano", .2]] },
  motelroom: { low: ["nightstand", "armchair"], center: ["rug"], maybe: [] },
  basement:  { low: ["boxes", "boxes", "pantry", "workbench"], center: [], maybe: [["washer", .5], ["dryer", .4], ["boiler", .8]] },
  bunkroom:  { low: ["nightstand"], center: [], maybe: [] },
  library:   { low: ["plant", "chair"], center: [], chairs: true, maybe: [] },
  cafeteria: { low: ["plant"], center: [], chairs: true, maybe: [] },
};
const TALL = new Set(["wardrobe", "bookcase", "fridge", "locker", "vending", "filecab", "shelf", "pantry", "boiler", "piano", "fireplace", "medcab", "bunk", "watercooler", "floorlamp", "plant"]);
function furnishRoom(r, list){
  const set = new Set(r.tiles.map(([x, y]) => ix(x, y)));
  const doorAdj = [], wallT = [], winT = [];
  for (const [x, y] of r.tiles){
    let wallAdj = false, door = false, win = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
      const t = tile[ix(x + dx, y + dy)];
      if (t === T.WALL) wallAdj = true; if (t === T.DOOR) door = true; if (t === T.WIN) win = true;
    }
    // keep a step clear inside every doorway
    let nearDoor = door;
    for (let dy = -1; dy <= 1 && !nearDoor; dy++) for (let dx = -1; dx <= 1; dx++) if (tile[ix(x + dx, y + dy)] === T.DOOR){ nearDoor = true; break; }
    if (door) doorAdj.push(ix(x, y));
    if (nearDoor) continue;
    if (win) winT.push([x, y]); else if (wallAdj) wallT.push([x, y]);
  }
  const reachable = () => {
    if (doorAdj.length < 1) return true;
    const seen = new Set([doorAdj[0]]), st = [doorAdj[0]];
    while (st.length){ const i = st.pop(), x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const j = ix(x + dx, y + dy); if (set.has(j) && !seen.has(j) && !objs.has(j)){ seen.add(j); st.push(j); } } }
    // every doorway and at least two thirds of the room stay reachable
    return doorAdj.every(a => seen.has(a)) && seen.size >= Math.max(2, Math.floor((set.size - countObjs()) * .66));
  };
  const countObjs = () => { let n = 0; for (const i of set) if (objs.has(i)) n++; return n; };
  const take = (pool, type) => {
    for (let tries = 0; tries < 10 && pool.length; tries++){
      const k = Math.floor(rnd() * pool.length), [x, y] = pool[k]; pool.splice(k, 1);
      if (objs.has(ix(x, y))) continue;
      placeObj(type, x, y, r.id);
      if (reachable()) return objs.get(ix(x, y));
      objs.delete(ix(x, y));
    }
    return null;
  };
  // the essentials from the generator, tall things against blank wall, low things may sit under windows
  for (const type of list){ const pool = TALL.has(type) ? wallT : wallT.length ? (rnd() < .5 ? winT : wallT) : winT; if (!take(pool, type) && pool !== wallT) take(wallT, type); }
  const X = ROOM_EXTRAS[r.type]; if (!X || r.tiles.length < 6) return;
  // bedside tables go next to the bed
  const bedO = r.tiles.map(([x, y]) => objs.get(ix(x, y))).find(o => o && o.type === "bed");
  for (const type of X.low){
    if (type === "nightstand" && bedO){ const nb = [[bedO.x + 1, bedO.y], [bedO.x - 1, bedO.y], [bedO.x, bedO.y + 1], [bedO.x, bedO.y - 1]].filter(([x, y]) => set.has(ix(x, y)) && wallT.concat(winT).some(([a, b]) => a === x && b === y)); if (take(nb, type)) continue; }
    take(TALL.has(type) ? wallT : wallT.concat(winT), type);
  }
  for (const [type, ch] of X.maybe) if (rnd() < ch) take(TALL.has(type) ? wallT : wallT.concat(winT), type);
  // the middle of the room: rug first, then a table with chairs or a coffee table by the sofa
  const xs = r.tiles.map(t => t[0]), ys = r.tiles.map(t => t[1]), cx = Math.round((Math.min(...xs) + Math.max(...xs)) / 2), cy = Math.round((Math.min(...ys) + Math.max(...ys)) / 2);
  const free = (x, y) => set.has(ix(x, y)) && !objs.has(ix(x, y)) && !doorAdj.includes(ix(x, y));
  for (const type of X.center){
    if (type === "rug"){ if (free(cx, cy) && r.tiles.length > 9){ const o = placeObj("rug", cx, cy, r.id); delete o.dir; } continue; }
    if (type === "coffeetable"){ const sofa = r.tiles.map(([x, y]) => objs.get(ix(x, y))).find(o => o && o.type === "sofa"); if (sofa && sofa.dir){ const tx = sofa.x + sofa.dir[0], ty = sofa.y + sofa.dir[1]; if (free(tx, ty)){ const o = placeObj("coffeetable", tx, ty, r.id); delete o.dir; if (!reachable()) objs.delete(ix(tx, ty)); } } continue; }
    if (type === "dtable"){ const spots = [[cx, cy], [cx + 1, cy], [cx, cy + 1]]; for (const [tx, ty] of spots){ if (!free(tx, ty)) continue; const o = placeObj("dtable", tx, ty, r.id); delete o.dir; if (!reachable()){ objs.delete(ix(tx, ty)); continue; }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ if (!free(tx + dx, ty + dy) || rnd() < .25) continue; const c = placeObj("chair", tx + dx, ty + dy, r.id); delete c.dir; if (!reachable()) objs.delete(ix(tx + dx, ty + dy)); }
        break; } }
  }
  // chairs at the tables already in the room (diners, bars, cafeterias)
  if (X.chairs) for (const [x, y] of r.tiles){ const o = objs.get(ix(x, y)); if (!o || o.type !== "table") continue;
    for (const [dx, dy] of [[0, 1], [0, -1]]){ if (free(x + dx, y + dy) && rnd() < .7){ const c = placeObj("chair", x + dx, y + dy, r.id); delete c.dir; if (!reachable()) objs.delete(ix(x + dx, y + dy)); } } }
}

// ---------- basements ----------
function addBasement(b){
  const B = buildings[b]; if (!B || B.kind !== "house" || B.basement) return;
  if (!B.stair){ if (!placeStairs(B)) return; const st = objs.get(ix(B.stair.x, B.stair.y)); st.up = false; }
  const st = objs.get(ix(B.stair.x, B.stair.y)); if (!st) return;
  st.down = true; B.basement = true;
}
