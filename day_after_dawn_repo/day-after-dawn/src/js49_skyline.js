// ============================================================
// Part 49 (1.11): skylines and farms.
// Apartment towers (9-12 floors), office towers (9-14) and a hotel (8-10) rise over bigger towns.
// Farms get a barn with hay and tools, and a grain silo.
// ============================================================
Object.assign(SPEC, {
  tower:       { min: 9, rooms: ["lobby", "office", "storage", "bathroom", "living"], win: 3, doors: 2, lock: .4 },
  officetower: { min: 9, rooms: ["lobby", "office", "office", "storage", "bathroom"], win: 3, doors: 2, lock: .5 },
  hotel:       { min: 9, rooms: ["lobby", "diner", "kitchen", "office", "bathroom"], win: 3, doors: 2, lock: .3 },
});
if (!SPEC.barn) SPEC.barn = { min: 6, rooms: ["barnfloor"], win: 1, doors: 2, lock: .2 };
Object.assign(FLOORS, { tower: [9, 10, 11, 12], officetower: [9, 10, 12, 14], hotel: [8, 9, 10] });
Object.assign(UPPER, {
  tower: ["living", "bedroom", "kitchen", "bathroom", "living", "bedroom", "kitchen", "bathroom"],
  officetower: ["office", "office", "office", "storage", "office", "staff"],
  hotel: ["motelroom", "motelroom", "bathroom", "motelroom", "motelroom", "storage"],
});
Object.assign(NAMES, { tower: ["Parkview Towers", "Elm Court Apartments", "Riverview Heights", "Lincoln Tower"], officetower: ["First National Tower", "Commerce Building", "Harlow Plaza", "Harlow Trust"], hotel: ["Harlow Grand Hotel", "The Kentuckian", "Creekside Inn"] });
Object.assign(SIGNCOL, { tower: ["#2a2a2a", "#e8e0c8"], officetower: ["#1e2a3a", "#d8e4f0"], hotel: ["#5a1e1e", "#f0d890"] });
Object.assign(FACADE, { tower: ["block", "brick", "stucco"], officetower: ["stone", "block"], hotel: ["brick", "stone"] });
NEON.add("hotel");
FURN2.barnfloor = FURN2.barnfloor || { wall: ["hay", "hay", "workbench", "crate", "hay", "rack"], rows: ["hay", 3, 3] };
FURN2.motelroom = FURN2.motelroom || { wall: ["bed", "nightstand", "tv", "dresser", "armchair"] };
OBJ.silo = { n: "Grain silo", block: true, h: 96, col: "#a8aca8" };
FOOT.silo = [-.3, -.3, 1.3, 1.3];
NOOFF.add("silo");
// towns: one tower in every big town, sometimes a second, sometimes a hotel
const _skyPlan = (plan, n, kind) => {
  if ((kind === "town" && n >= 8) || (kind === "civic" && n >= 6)){
    const swap = k => { const i = plan.lastIndexOf("houses"); if (i >= 0) plan[i] = k; else plan.push(k); };
    swap(rnd() < .55 ? "tower" : "officetower");
    if (rnd() < .45) swap(rnd() < .5 ? "hotel" : (rnd() < .5 ? "tower" : "officetower"));
  }
  return plan;
};
// a barn and a silo beside the farm's field
function farmBarn(x0, y0, x1, y1){
  if (rnd() > .7) return;
  const bx0 = x1 + 2, by0 = y0 - 10, bx1 = bx0 + 8, by1 = by0 + 6;
  for (let y = by0 - 1; y <= by1 + 1; y++) for (let x = bx0 - 1; x <= bx1 + 4; x++){ const i = ix(x, y); if (!inb(x, y) || ![T.GRASS, T.DIRT, T.TREE].includes(tile[i]) || objs.has(i) || bldId[i] >= 0) return; }
  for (let y = by0 - 1; y <= by1 + 1; y++) for (let x = bx0 - 1; x <= bx1 + 4; x++){ tile[ix(x, y)] = T.GRASS; ZONE[ix(x, y)] = 1; }
  const B = genBuilding(bx0, by0, bx1, by1, "barn", "bottom");
  if (B){ B.roofType = "gable"; B.roofCol = "#6a2a22"; B._rg = null; }
  const s = placeObj("silo", bx1 + 2, by0 + 1, -1); delete s.dir;
}
function drawDecor8(o, dim, a){
  if (o.type !== "silo") return false;
  const cx = o.x + .5, cy = o.y + .5, [bx, by] = S(cx, cy, 0), [tx, ty] = S(cx, cy, 90), rx = 1.05 * hw * 1.2, ry = 1.05 * hh * 1.2, sd = c => shade(c, dim);
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(bx + 8 * zoom, by + 3 * zoom, rx * 1.1, ry * 1.1, 0, 0, 7); ctx.fill();
  const g = ctx.createLinearGradient(bx - rx, 0, bx + rx, 0); g.addColorStop(0, sd("#c8ccc8")); g.addColorStop(.45, sd("#e0e4e0")); g.addColorStop(1, sd("#8a8e8a"));
  ctx.fillStyle = g; ctx.fillRect(bx - rx, ty, rx * 2, by - ty); ctx.beginPath(); ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI); ctx.fill();
  ctx.strokeStyle = sd("#7a7e7a"); ctx.lineWidth = Math.max(1, zoom * .8);
  for (let k = 1; k < 9; k++){ const yy = ty + (by - ty) * k / 9; ctx.beginPath(); ctx.ellipse(bx, yy, rx, ry, 0, 0, Math.PI); ctx.stroke(); }
  ctx.fillStyle = sd("#9a9e9a"); ctx.beginPath(); ctx.ellipse(bx, ty, rx, ry, 0, 0, 7); ctx.fill();
  ctx.fillStyle = sd("#b8bcb8"); ctx.beginPath(); ctx.moveTo(bx - rx, ty); ctx.quadraticCurveTo(bx, ty - 26 * zoom, bx + rx, ty); ctx.quadraticCurveTo(bx, ty + ry, bx - rx, ty); ctx.fill();
  ctx.strokeStyle = sd("#3a3a3a"); ctx.lineWidth = Math.max(1, zoom); ctx.beginPath(); ctx.moveTo(bx + rx * .55, by + ry * .5); ctx.lineTo(bx + rx * .55, ty + ry * .6); ctx.stroke();
  ctx.globalAlpha = 1; return true;
}
// towers furnish every wall before the stairs go in, so give them a staircase of their own (moving a piece of furniture if needed), then their full height
function raiseTower(B){
  if (!B) return B;
  if (!B.stair){
    for (let y = B.y0 + 2; y <= B.y1 - 2 && !B.stair; y++) for (let x = B.x0 + 2; x <= B.x1 - 2; x++){
      const i = ix(x, y); if (tile[i] !== T.FLOOR) continue; const r = rooms[roomId[i]]; if (!r || r.type === "bathroom") continue;
      let walls = 0, wd = null, bad = false;
      for (const [dx, dy] of [[0, -1], [-1, 0], [0, 1], [1, 0]]){ const t = tile[ix(x + dx, y + dy)]; if (t === T.WALL){ walls++; wd = [dx, dy]; } if (t === T.DOOR || t === T.WIN) bad = true; }
      for (let dy = -1; dy <= 1 && !bad; dy++) for (let dx = -1; dx <= 1; dx++) if (tile[ix(x + dx, y + dy)] === T.DOOR) bad = true;
      if (bad || walls !== 1) continue;
      objs.delete(i); const o = placeObj("stairs", x, y, roomId[i]); o.dir = [-wd[0], -wd[1]]; o.up = true; o.down = false; B.stair = { x, y, dir: o.dir }; break;
    }
  }
  if (!B.stair){
    // an open lobby: build the tower's stair core in the middle, a short wall with the stairs against it
    const cx = (B.x0 + B.x1) >> 1, cy = (B.y0 + B.y1) >> 1, rid = roomId[ix(cx, cy)];
    for (const [x, y] of [[cx - 1, cy - 1], [cx, cy - 1]]){ const i = ix(x, y); objs.delete(i); tile[i] = T.WALL; bldId[i] = B.id; roomId[i] = -1; }
    if (rooms[rid]) rooms[rid].tiles = rooms[rid].tiles.filter(([x, y]) => tile[ix(x, y)] === T.FLOOR);
    for (const [x, y] of [[cx, cy], [cx - 1, cy], [cx, cy + 1]]) objs.delete(ix(x, y));
    const o = placeObj("stairs", cx, cy, rid); o.dir = [0, 1]; o.up = true; o.down = false; B.stair = { x: cx, y: cy, dir: o.dir };
  }
  if (B.stair) B.floors = pick(FLOORS[B.kind], rnd);
  B._rg = null; return B;
}
