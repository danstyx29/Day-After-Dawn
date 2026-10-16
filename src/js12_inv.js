// ============================================================
// Part 12: item icons + monitor-style inventory + pickup toasts
// ============================================================
const ICON = {
  beans:["can","#b8452e","#e8d8b0"], soup:["can","#c83a2a","#f0f0e0"], peaches:["can","#e09a3a","#f6e2a0"], tuna:["tin","#4a7aa8","#d8d8d0"],
  chips:["bag","#e0b030","#c83030"], cereal:["box","#e8c040","#3a6ac0"], crackers:["box","#d8b880","#8a4a2a"], pbutter:["jar","#a8703a","#d84a3a"],
  candy:["bar","#5a3020","#e0c040"], bread:["loaf","#c8904a"], apple:["fruit","#c8302a"], banana:["banana","#e8d040"], cheese:["cheese","#f0c840"],
  ham:["meat","#e8a0a0"], leftovers:["dish","#c87a3a","#e8e8e0"], milk:["carton","#f0f0f0","#3a7ac8"], water:["bottle","#9ac8e8","#3a8ac8"],
  soda:["soda","#c8302a","#f0f0f0"], juice:["carton","#f0a030","#3a9a3a"], beer:["bottle","#8a5a1a","#e8d8a0"], bottle:["bottle","#c8dce8","#a0a0a0"],
  emptycan:["can","#9a9a9a","#c8c8c8"], bandage:["roll","#f0ece0"], rags:["rags","#d8d0c0"], sheet:["cloth","#8aa0c8"], disinf:["spray","#e8e8e8","#c8302a"],
  vodka:["bottle","#e0ecf0","#c8302a"], pills:["pills","#f0f0e8","#c8302a"], antibio:["pills","#f0f0e8","#3a8a3a"], bat:["bat","#b08850"],
  golf:["golf","#a8b0b8"], crowbar:["crowbar","#a83030"], pipe:["pipe","#7a8088"], hammer:["hammer","#5a5e62","#8a6a42"], pan:["pan","#2a2a2c"],
  rollpin:["rollpin","#c8a070"], knife:["knife","#d0d4d8","#3a2a1a"], hunting:["knife","#c0c4c8","#5a3a1a"], screwdrv:["screwdriver","#c8302a"],
  axe:["axe","#8a9096","#8a6a42"], hatchet:["axe","#8a9096","#8a6a42"], shovel:["shovel","#7a7e82","#8a6a42"], opener:["opener","#a0a4a8"],
  nails:["nailbox","#c8a050"], plank:["plank","#b08850"], saw:["saw","#c0c4c8","#c8302a"], tweezers:["tweezers","#c0c4c8"], needle:["needle","#c0c4c8"],
  batteries:["battery","#3a3a3a","#e0b030"], watch:["watch","#c8a050"], backpack:["backpack","#3a5a3a"], schoolbag:["backpack","#3a5aa8"],
  duffel:["duffel","#2a2a3a"], bk_carp:["book","#8a5a2a"], bk_aid:["book","#c83a3a"], bk_axe:["book","#3a6a3a"], bk_sneak:["book","#3a3a5a"],
  bk_blunt:["book","#3a5aa8"], mag:["mag","#e04a8a"], comic:["mag","#3a9ae0"], novel:["book","#6a4a3a"], cigs:["cigs","#e8e8e0","#c8302a"],
  log:["log","#7a5a3a"], branch:["branch","#6a4a2a"], spear:["spear","#8a6a42"], spikedbat:["spikedbat","#b08850"], pot:["pot","#8a9096"],
  gascan:["gascan","#c8302a"], noisemaker:["noisemaker","#a0a0a0"], water_t:["bottle","#a8b890","#6a8a4a"], rawsteak:["meat","#c8484a"],
  steak:["meat","#7a4a2a"], stew:["pot","#8a9096","#a85a2a"],
};
const ICACHE = new Map();
function iconURL(id){
  if (ICACHE.has(id)) return ICACHE.get(id);
  const S2 = 64, c = document.createElement("canvas"); c.width = c.height = S2; const g = c.getContext("2d");
  const [shape, c1 = "#999", c2 = "#666"] = ICON[id] || ["box", "#8a8a8a", "#5a5a5a"];
  g.lineJoin = "round"; g.lineCap = "round";
  const line = "rgba(0,0,0,.55)";
  const fillS = (col, path) => { g.fillStyle = col; g.strokeStyle = line; g.lineWidth = 2; g.beginPath(); path(); g.fill(); g.stroke(); };
  const rr = (x, y, w, h, r) => () => g.roundRect(x, y, w, h, r);
  const stick = (x0, y0, x1, y1, w, col) => { g.strokeStyle = line; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  g.shadowColor = "rgba(0,0,0,.35)"; g.shadowOffsetY = 2; g.shadowBlur = 3;
  switch (shape){
    case "can": fillS(c1, rr(18, 12, 28, 40, 4)); g.shadowColor = "transparent"; fillS(c2, rr(18, 22, 28, 16, 1)); g.fillStyle = "#c8c8c8"; g.fillRect(18, 11, 28, 3); break;
    case "tin": fillS(c1, rr(10, 24, 44, 20, 8)); g.shadowColor = "transparent"; fillS(c2, rr(16, 28, 32, 12, 4)); break;
    case "soda": fillS(c1, rr(21, 12, 22, 40, 5)); g.shadowColor = "transparent"; g.fillStyle = c2; g.fillRect(24, 26, 16, 6); g.fillStyle = "#ccc"; g.fillRect(22, 11, 20, 3); break;
    case "bag": fillS(c1, () => { g.moveTo(16, 12); g.lineTo(48, 12); g.lineTo(50, 52); g.lineTo(14, 52); g.closePath(); }); g.shadowColor = "transparent"; g.fillStyle = c2; g.beginPath(); g.arc(32, 32, 8, 0, 7); g.fill(); break;
    case "box": fillS(c1, rr(16, 8, 32, 48, 2)); g.shadowColor = "transparent"; fillS(c2, rr(20, 16, 24, 12, 2)); break;
    case "jar": fillS(c1, rr(18, 18, 28, 34, 6)); g.shadowColor = "transparent"; fillS(c2, rr(19, 12, 26, 8, 2)); break;
    case "bar": fillS(c1, rr(8, 24, 48, 16, 3)); g.shadowColor = "transparent"; g.fillStyle = c2; g.fillRect(22, 24, 12, 16); break;
    case "loaf": fillS(c1, () => { g.ellipse(32, 34, 24, 15, 0, 0, 7); }); g.shadowColor = "transparent"; g.strokeStyle = "rgba(90,50,20,.6)"; g.lineWidth = 2; for (const x of [22, 32, 42]){ g.beginPath(); g.moveTo(x - 3, 26); g.lineTo(x + 3, 34); g.stroke(); } break;
    case "fruit": fillS(c1, () => g.arc(32, 36, 16, 0, 7)); g.shadowColor = "transparent"; stick(32, 20, 34, 13, 2, "#5a3a1a"); g.fillStyle = "#4a8a3a"; g.beginPath(); g.ellipse(39, 16, 6, 3, -.4, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.arc(26, 30, 4, 0, 7); g.fill(); break;
    case "banana": g.strokeStyle = line; g.lineWidth = 15; g.beginPath(); g.arc(32, 12, 32, .55, 2.5); g.stroke(); g.strokeStyle = c1; g.lineWidth = 11; g.stroke(); break;
    case "cheese": fillS(c1, () => { g.moveTo(10, 46); g.lineTo(54, 46); g.lineTo(54, 30); g.lineTo(10, 20); g.closePath(); }); g.shadowColor = "transparent"; g.fillStyle = "#d8a820"; for (const [x, y] of [[22, 36], [38, 40], [46, 34]]){ g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } break;
    case "meat": fillS(c1, () => { g.ellipse(32, 34, 22, 14, -.3, 0, 7); }); g.shadowColor = "transparent"; g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 3; g.beginPath(); g.ellipse(32, 34, 14, 7, -.3, 0, 4); g.stroke(); break;
    case "dish": fillS(c2, () => g.ellipse(32, 38, 26, 12, 0, 0, 7)); g.shadowColor = "transparent"; fillS(c1, () => g.ellipse(32, 34, 20, 8, 0, 0, 7)); break;
    case "carton": fillS(c1, () => { g.moveTo(18, 22); g.lineTo(32, 10); g.lineTo(46, 22); g.lineTo(46, 54); g.lineTo(18, 54); g.closePath(); }); g.shadowColor = "transparent"; g.fillStyle = c2; g.fillRect(18, 32, 28, 10); break;
    case "bottle": fillS(c1, () => { g.moveTo(26, 8); g.lineTo(38, 8); g.lineTo(38, 18); g.lineTo(44, 26); g.lineTo(44, 54); g.lineTo(20, 54); g.lineTo(20, 26); g.lineTo(26, 18); g.closePath(); }); g.shadowColor = "transparent"; g.fillStyle = c2; g.fillRect(20, 32, 24, 12); g.fillStyle = "rgba(255,255,255,.3)"; g.fillRect(24, 26, 3, 24); break;
    case "roll": fillS(c1, rr(12, 22, 40, 22, 11)); g.shadowColor = "transparent"; g.strokeStyle = "rgba(0,0,0,.2)"; g.lineWidth = 1.5; for (const x of [22, 30, 38]){ g.beginPath(); g.moveTo(x, 23); g.lineTo(x, 43); g.stroke(); } break;
    case "rags": for (const [x, y, a] of [[14, 22, -.2], [20, 32, .1], [16, 42, -.1]]){ g.save(); g.translate(x, y); g.rotate(a); fillS(c1, rr(0, 0, 34, 9, 3)); g.restore(); } break;
    case "cloth": fillS(c1, rr(10, 16, 44, 32, 4)); g.shadowColor = "transparent"; g.strokeStyle = "rgba(255,255,255,.4)"; g.lineWidth = 2; g.beginPath(); g.moveTo(10, 30); g.lineTo(54, 30); g.stroke(); break;
    case "spray": fillS(c1, rr(20, 18, 24, 36, 4)); g.shadowColor = "transparent"; fillS("#888", rr(26, 8, 12, 10, 2)); g.fillStyle = c2; g.fillRect(29, 28, 6, 18); g.fillRect(23, 34, 18, 6); break;
    case "pills": fillS(c1, rr(20, 18, 24, 34, 4)); g.shadowColor = "transparent"; fillS(c2, rr(18, 10, 28, 10, 3)); g.fillStyle = "#fff"; g.fillRect(22, 28, 20, 10); break;
    case "bat": case "spikedbat": stick(14, 52, 50, 12, 9, c1); stick(14, 52, 22, 43, 5, "#3a2a1a");
      if (shape === "spikedbat"){ g.strokeStyle = "#c8c8c8"; g.lineWidth = 2; for (const [x, y] of [[40, 22], [46, 18], [44, 28], [36, 26]]){ g.beginPath(); g.moveTo(x, y); g.lineTo(x + 5, y - 3); g.stroke(); } } break;
    case "golf": stick(18, 54, 42, 12, 3, c1); fillS("#c8ccd0", rr(14, 50, 14, 7, 2)); break;
    case "crowbar": stick(16, 54, 44, 14, 5, c1); g.strokeStyle = c1; g.lineWidth = 5; g.beginPath(); g.arc(48, 18, 6, Math.PI, 2 * Math.PI); g.stroke(); break;
    case "pipe": stick(14, 50, 50, 14, 8, c1); break;
    case "hammer": stick(20, 54, 40, 20, 5, c2); g.save(); g.translate(40, 18); g.rotate(-.8); fillS(c1, rr(-14, -5, 26, 10, 2)); g.restore(); break;
    case "pan": fillS(c1, () => g.ellipse(26, 36, 18, 15, 0, 0, 7)); stick(40, 30, 58, 18, 5, "#3a2a1a"); break;
    case "rollpin": stick(12, 44, 52, 20, 10, c1); stick(8, 46, 14, 43, 4, c1); stick(50, 21, 56, 18, 4, c1); break;
    case "knife": g.save(); g.translate(32, 32); g.rotate(-.75); fillS(c1, () => { g.moveTo(-4, -4); g.lineTo(22, -4); g.lineTo(26, 0); g.lineTo(-4, 4); g.closePath(); }); fillS(c2, rr(-20, -4, 16, 8, 3)); g.restore(); break;
    case "screwdriver": g.save(); g.translate(32, 32); g.rotate(-.75); fillS("#c8ccd0", rr(0, -2, 24, 4, 1)); fillS(c1, rr(-20, -5, 20, 10, 4)); g.restore(); break;
    case "axe": stick(18, 56, 40, 10, 5, c2); g.save(); g.translate(40, 14); g.rotate(-.4); fillS(c1, () => { g.moveTo(-2, -6); g.lineTo(16, -12); g.lineTo(16, 10); g.lineTo(-2, 4); g.closePath(); }); g.restore(); break;
    case "shovel": stick(20, 52, 42, 14, 4, c2); g.save(); g.translate(18, 50); g.rotate(-.75); fillS(c1, rr(-8, -2, 16, 16, 6)); g.restore(); break;
    case "opener": fillS(c1, rr(12, 28, 40, 8, 4)); fillS("#c8ccd0", () => g.arc(48, 32, 7, 0, 7)); break;
    case "nailbox": fillS(c1, rr(12, 22, 40, 26, 2)); g.shadowColor = "transparent"; g.strokeStyle = "#888"; g.lineWidth = 2; for (const x of [20, 28, 36, 44]){ g.beginPath(); g.moveTo(x, 14); g.lineTo(x, 26); g.stroke(); } break;
    case "plank": fillS(c1, rr(6, 26, 52, 12, 1)); g.shadowColor = "transparent"; g.strokeStyle = "rgba(80,50,20,.4)"; g.lineWidth = 1; g.beginPath(); g.moveTo(8, 31); g.lineTo(56, 31); g.stroke(); break;
    case "saw": fillS(c1, () => { g.moveTo(10, 40); g.lineTo(46, 24); g.lineTo(46, 36); g.lineTo(10, 48); g.closePath(); }); fillS(c2, rr(44, 18, 12, 22, 3)); break;
    case "tweezers": stick(20, 52, 40, 12, 3, c1); stick(28, 54, 42, 13, 3, c1); break;
    case "needle": stick(16, 50, 48, 14, 2, c1); g.strokeStyle = "#c83a3a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(48, 14); g.bezierCurveTo(56, 30, 30, 34, 40, 52); g.stroke(); break;
    case "battery": fillS(c1, rr(14, 22, 36, 20, 3)); g.shadowColor = "transparent"; g.fillStyle = c2; g.fillRect(14, 22, 12, 20); g.fillStyle = "#bbb"; g.fillRect(50, 28, 4, 8); break;
    case "watch": fillS("#3a3a3a", rr(26, 8, 12, 48, 3)); fillS(c1, () => g.arc(32, 32, 11, 0, 7)); g.fillStyle = "#f0f0e8"; g.beginPath(); g.arc(32, 32, 8, 0, 7); g.fill(); break;
    case "backpack": fillS(c1, rr(14, 12, 36, 44, 10)); g.shadowColor = "transparent"; fillS(shade(c1, .8), rr(20, 34, 24, 16, 4)); break;
    case "duffel": fillS(c1, rr(6, 26, 52, 24, 12)); g.shadowColor = "transparent"; g.strokeStyle = "#555"; g.lineWidth = 3; g.beginPath(); g.arc(32, 26, 10, Math.PI, 2 * Math.PI); g.stroke(); break;
    case "book": fillS(c1, rr(14, 10, 36, 44, 2)); g.shadowColor = "transparent"; g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(20, 18, 24, 4); g.fillRect(20, 26, 18, 3); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(14, 10, 5, 44); break;
    case "mag": fillS("#f0ece0", rr(14, 8, 36, 48, 1)); g.shadowColor = "transparent"; g.fillStyle = c1; g.fillRect(14, 8, 36, 14); g.fillStyle = "#888"; for (const y of [28, 34, 40, 46]) g.fillRect(18, y, 28, 2); break;
    case "cigs": fillS(c1, rr(18, 14, 28, 38, 2)); g.shadowColor = "transparent"; g.fillStyle = c2; g.fillRect(18, 14, 28, 12); break;
    case "log": fillS(c1, rr(8, 22, 48, 20, 10)); g.shadowColor = "transparent"; fillS("#c8a070", () => g.ellipse(48, 32, 7, 10, 0, 0, 7)); break;
    case "branch": stick(10, 50, 54, 16, 4, c1); stick(32, 34, 42, 18, 3, c1); break;
    case "spear": stick(8, 58, 52, 12, 4, c1); fillS("#c8ccd0", () => { g.moveTo(50, 10); g.lineTo(58, 4); g.lineTo(54, 16); g.closePath(); }); break;
    case "pot": fillS(c1, rr(12, 24, 40, 28, 4)); stick(6, 28, 12, 28, 3, "#555"); stick(52, 28, 58, 28, 3, "#555"); g.shadowColor = "transparent"; if (ICON[id][2]) { g.fillStyle = ICON[id][2]; g.fillRect(14, 24, 36, 6); } break;
    case "gascan": fillS(c1, rr(14, 16, 36, 40, 4)); fillS("#333", rr(36, 8, 8, 10, 2)); g.shadowColor = "transparent"; g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2; g.beginPath(); g.moveTo(20, 22); g.lineTo(44, 50); g.moveTo(44, 22); g.lineTo(20, 50); g.stroke(); break;
    case "noisemaker": for (const x of [16, 34]) fillS(c1, rr(x, 22, 14, 22, 3)); g.strokeStyle = "#bbb"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(23, 22); g.lineTo(32, 10); g.lineTo(41, 22); g.stroke(); break;
    case "pistol": fillS(c1, () => { g.moveTo(10, 22); g.lineTo(54, 22); g.lineTo(54, 32); g.lineTo(30, 32); g.lineTo(26, 50); g.lineTo(16, 50); g.lineTo(20, 32); g.lineTo(10, 32); g.closePath(); }); break;
    case "longgun": fillS(c1, () => { g.moveTo(4, 30); g.lineTo(60, 26); g.lineTo(60, 31); g.lineTo(30, 34); g.lineTo(24, 44); g.lineTo(6, 44); g.lineTo(10, 36); g.closePath(); }); break;
    case "ammo": for (let k = 0; k < 4; k++) fillS(c1, rr(12 + k * 11, 18, 8, 28, 3)); break;
    case "shirt": fillS(c1, () => { g.moveTo(18, 16); g.lineTo(26, 12); g.lineTo(38, 12); g.lineTo(46, 16); g.lineTo(54, 26); g.lineTo(46, 30); g.lineTo(44, 52); g.lineTo(20, 52); g.lineTo(18, 30); g.lineTo(10, 26); g.closePath(); }); break;
    case "pants": fillS(c1, () => { g.moveTo(20, 10); g.lineTo(44, 10); g.lineTo(48, 54); g.lineTo(36, 54); g.lineTo(32, 26); g.lineTo(28, 54); g.lineTo(16, 54); g.closePath(); }); break;
    case "shoe": fillS(c1, () => { g.moveTo(14, 24); g.lineTo(28, 24); g.lineTo(32, 34); g.lineTo(50, 38); g.lineTo(52, 46); g.lineTo(14, 46); g.closePath(); }); break;
    case "hat": fillS(c1, () => { g.ellipse(32, 36, 22, 8, 0, 0, 7); }); fillS(c1, () => { g.ellipse(32, 30, 14, 12, 0, Math.PI, 0); }); break;
    case "key": fillS(c1, () => g.arc(20, 32, 11, 0, 7)); g.shadowColor = "transparent"; g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(18, 32, 4, 0, 7); g.fill(); fillS(c1, rr(29, 29, 26, 6, 2)); fillS(c1, rr(46, 34, 4, 7, 1)); fillS(c1, rr(39, 34, 4, 5, 1)); break;
    default: fillS(c1, rr(16, 16, 32, 32, 4));
  }
  const url = c.toDataURL(); ICACHE.set(id, url); return url;
}
const icon = (id, sz = 26) => `<img class="iic" src="${iconURL(id)}" width="${sz}" height="${sz}" alt="">`;

// ---------- pickup notifications ----------
function toast(it){
  let box = $("toasts"); if (!box){ box = el("div", ""); box.id = "toasts"; document.body.appendChild(box); }
  const t = el("div", "toast osd", `${icon(it.id, 26)}<span>${esc(ITEMS[it.id].n)}</span>`);
  box.appendChild(t); while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => t.classList.add("out"), 1500); setTimeout(() => t.remove(), 2000);
}

// ---------- inventory screen ----------
const INV_TABS = [["All", () => true], ["Weapons", d => d.cat === "weapon"], ["Food", d => d.cat === "food" || d.cat === "drink"],
  ["Medical", d => d.cat === "med"], ["Materials", d => d.cat === "mat" || d.cat === "tool"], ["Other", d => ["book", "mag", "bag", "misc"].includes(d.cat)]];
let invTab = 0, invDetail = null;
function itemStats(it){
  const d = ITEMS[it.id], out = [];
  const pc = v => Math.round(v * 100);
  if (d.cat === "food" || d.cat === "drink"){
    if (d.hun) out.push(["Hunger", `-${pc(d.hun)}%`]);
    if (d.thi) out.push(["Thirst", `${d.thi > 0 ? "-" : "+"}${Math.abs(pc(d.thi))}%`]);
    if (d.unh) out.push(["Mood", d.unh < 0 ? `+${-d.unh}` : `-${d.unh}`]);
    const fs = freshState(it);
    if (fs){ const left = ((fs === "fresh" ? d.fresh : d.rot) * 1440 - it.age) / 1440; out.push(["Freshness", fs === "rotten" ? "rotten" : `${fs}, ${left.toFixed(1)} days`]); }
    if (d.opener) out.push(["Needs", "can opener or knife"]);
    if (d.sick) out.push(["Risk", "may make you sick"]);
  }
  if (d.cat === "weapon"){
    out.push(["Damage", `${d.dmg[0].toFixed(1)} to ${d.dmg[1].toFixed(1)}`], ["Reach", d.range.toFixed(1)], ["Swing", `${d.spd.toFixed(2)}s`], ["Skill", SKILLS[d.skill].n]);
    out.push(["Condition", `${it.cond} / ${d.cond}`]);
  }
  if (d.cat === "bag") out.push(["Capacity", d.cap], ["Weight saved", `${pc(d.red)}%`]);
  if (d.cat === "book") out.push(["Effect", `${SKILLS[d.skill].n} XP x3 to level 6`]);
  if (d.cat === "mag") out.push(["Boredom", d.bor], ["Mood", `+${-d.unh}`]);
  const MED = { bandage: "Stops bleeding", disinfect: "Cleans and prevents infection", painkiller: "Dulls pain for 4 hours", antibiotic: "Fights wound infection", suture: "Closes deep cuts" };
  for (const t of d.tags) if (MED[t]) out.push(["Use", MED[t]]);
  if (it.uses !== undefined) out.push(["Uses left", it.uses]);
  if (it.qty) out.push(["Count", it.qty]);
  if (it.fuel !== undefined) out.push(["Fuel", `${Math.round(it.fuel * 100)}%`]);
  const used = typeof RECIPES !== "undefined" ? RECIPES.filter(r => r.in.some(([k]) => k === it.id || d.tags.includes(k)) || (r.tools || []).some(t => d.tags.includes(t))).map(r => r.n) : [];
  if (used.length) out.push(["Used in", used.slice(0, 3).join(", ") + (used.length > 3 ? "..." : "")]);
  return out;
}
function setDetail(it){
  invDetail = it;
  const box = document.querySelector("#inv .i-detail"); if (!box) return;
  if (!it){ box.innerHTML = `<div class="i-hint">Hover an item to inspect it. Click to take, drag to move, double click to use or equip, right click for more.</div>`; return; }
  const d = ITEMS[it.id];
  box.innerHTML = `<div class="i-big">${icon(it.id, 64)}</div><div class="i-info"><div class="i-name">${esc(iname(it))}</div>
    <div class="i-cat">${esc(INV_TABS.find(([n, f], k) => k && f(d))?.[0] || "Item")}, weight ${d.w.toFixed(1)}</div>
    <div class="i-stats">${itemStats(it).map(([a, b]) => `<span><b>${esc(a)}</b> ${esc(b)}</span>`).join("")}</div></div>`;
}
function renderInv(){
  const p = $("inv");
  const keep = [...p.querySelectorAll(".i-list")].map(c => c.scrollTop);
  p.className = "panel term"; p.innerHTML = "";
  const close = el("button", "close", "close"); close.onclick = closePanels; p.appendChild(close);
  const load = totalLoad(), cap = carryCap();
  const head = el("div", "i-head");
  head.appendChild(el("div", "i-title", "Inventory"));
  const tabs = el("div", "i-tabs");
  INV_TABS.forEach(([n], k) => { const b = el("button", k === invTab ? "on" : "", n); b.onclick = () => { invTab = k; renderInv(); }; tabs.appendChild(b); });
  head.appendChild(tabs);
  head.appendChild(el("div", "i-load" + (load > cap ? " over" : ""), `Load ${load.toFixed(1)} / ${cap}<span class="seg">${Array.from({ length: 12 }, (_, k) => `<i class="${k < Math.round(Math.min(1, load / cap) * 12) ? "on" : ""}"></i>`).join("")}</span>`));
  p.appendChild(head);
  const filt = it => INV_TABS[invTab][1](ITEMS[it.id]);
  const L = el("div", "i-col"), Rr = el("div", "i-col");
  L.appendChild(el("div", "i-sub", esc(P.name)));
  const ll = el("div", "i-list drop");
  const sec = (title) => ll.appendChild(el("div", "i-sec", esc(title)));
  sec("Equipped");
  if (P.weapon) ll.appendChild(itemRow(P.weapon, null, true)); else ll.appendChild(el("div", "row empty", "<span>Hands empty</span>"));
  if (P.bag){
    const r = el("div", "row eq", `<span>${icon(P.bag.id)}${esc(ITEMS[P.bag.id].n)}</span><span class="w">${listWeight(P.bag.items).toFixed(1)} / ${ITEMS[P.bag.id].cap}</span>`);
    r.onclick = e => itemMenu(e, [{ label: "Take it off", fn: () => { if (P.bag.items.length) P.inv.push(...P.bag.items.splice(0)); P.inv.push(P.bag); P.bag = null; renderInv(); } }]);
    r.onmouseenter = () => setDetail(P.bag);
    ll.appendChild(r);
  }
  const pl = P.inv.filter(it => it !== P.weapon && filt(it));
  sec("Pockets"); if (!pl.length) ll.appendChild(el("div", "row empty", "<span>Nothing here</span>"));
  for (const it of pl) ll.appendChild(itemRow(it, null, false));
  if (P.bag){ const bl = P.bag.items.filter(it => it !== P.weapon && filt(it)); sec(ITEMS[P.bag.id].n); if (!bl.length) ll.appendChild(el("div", "row empty", "<span>Nothing here</span>")); for (const it of bl) ll.appendChild(itemRow(it, null, false)); }
  wireDrop(ll, null); L.appendChild(ll);
  const conts = nearbyContainers();
  invSig = conts.map(c => c.name + c.list.length).join("|");
  Rr.appendChild(el("div", "i-sub", "Nearby"));
  const rl = el("div", "i-list");
  if (!conts.length) rl.appendChild(el("div", "row empty", "<span>Nothing in reach. Stand next to a container, a body or items on the floor.</span>"));
  for (const c of conts){
    const s2 = el("div", "drop");
    const h = el("div", "i-sec", esc(c.name));
    if (c.list.length){ const all = el("button", "mini", "take all"); all.onclick = () => { for (const it of c.list.slice()) if (filt(it)) queueTake(it, c); }; h.appendChild(all); }
    s2.appendChild(h);
    const cl = c.list.filter(filt);
    if (!cl.length) s2.appendChild(el("div", "row empty", `<span>${c.list.length ? "Nothing in this category" : "Empty"}</span>`));
    for (const it of cl) s2.appendChild(itemRow(it, c, false));
    wireDrop(s2, c); rl.appendChild(s2);
  }
  Rr.appendChild(rl);
  const body = el("div", "i-body"); body.appendChild(L); body.appendChild(Rr); p.appendChild(body);
  p.appendChild(el("div", "i-detail"));
  setDetail(invDetail && allCarried().concat(...conts.map(c => c.list)).includes(invDetail) ? invDetail : null);
  p.querySelectorAll(".i-list").forEach((c, k) => { c.scrollTop = keep[k] || 0; });
}
function itemRow(it, cont, equipped){
  const d = ITEMS[it.id], fs = freshState(it);
  let tags = "";
  if (fs === "stale") tags += `<span class="tag">stale</span>`;
  if (fs === "rotten") tags += `<span class="tag bad">rotten</span>`;
  if (it.cond !== undefined) tags += `<span class="tag${it.cond / d.cond < .3 ? " bad" : ""}">${Math.round(it.cond / d.cond * 100)}%</span>`;
  if (P.weapon === it && !equipped) tags += `<span class="tag">held</span>`;
  const busy = pending.has(it);
  const r = el("div", "row" + (equipped ? " eq" : "") + (busy ? " moving" : ""), `<span>${icon(it.id)}${esc(iname(it))}${tags}</span><span class="w">${d.w.toFixed(1)}</span>`);
  if (busy) r.style.setProperty("--dur", transferTime(it) / Math.max(.35, actionSpeed()) + "s");
  r.onmouseenter = () => setDetail(it);
  r.draggable = true;
  r.addEventListener("dragstart", e => { invDrag = { it, cont }; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", d.n); r.classList.add("dragging"); });
  r.addEventListener("dragend", () => { r.classList.remove("dragging"); invDrag = null; });
  if (cont){
    r.onclick = () => queueTake(it, cont);
    r.oncontextmenu = e => { e.preventDefault(); itemMenu(e, [{ label: "Take", fn: () => queueTake(it, cont) },
      ...(useLabel(it) && canUse(it) === true ? [{ label: useLabel(it) + " it here", fn: () => { moveItem(it, cont.list, "player", () => useItem(it)); } }] : [])]); };
    return r;
  }
  let clickT = null;
  r.onclick = e => {
    if (clickT){ clearTimeout(clickT); clickT = null; closeItemMenu(); defaultUse(it); return; }
    const ev = { clientX: e.clientX, clientY: e.clientY, stopPropagation(){} };
    clickT = setTimeout(() => { clickT = null; itemMenu(ev, itemOptions(it)); }, 170);
    e.stopPropagation();
  };
  r.oncontextmenu = e => { e.preventDefault(); itemMenu(e, itemOptions(it)); };
  return r;
}
