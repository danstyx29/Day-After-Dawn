// ============================================================
// Part 34: the rest from the review.
//  - When you die your body falls with everything you carried, and if
//    you were infected it gets up again later. You can carry on in the
//    same world as a new survivor, as the original lets you.
//  - Hotbar: your first five weapons on keys 1 to 5.
//  - Map notes: click the map to write a note, right click to remove.
//  - Sleep is interrupted by nightmares and by things moving outside.
//  - Body weight follows the calories you eat and burn.
// ============================================================
function die(cause){
  if (!P.alive) return;
  P.alive = false; G.running = false; cancelActions(); P.sleeping = false;
  const items = allCarried().filter(it => !it.worn).slice(), out = playerOutfit();
  const body = { x: P.x, y: P.y, items: null, extra: items, col: out.shirt, pants: out.pants, face: P.face, fall: 0, t: G.min, skin: "#d9ae88", hair: "#3a2a1e", player: P.name };
  if (P.infected) body.rise = G.min + rf(30, 180);
  G.corpses.push(body);
  render();
  const d = daysSurvived(), days = Math.floor(d), hours = Math.floor((d - days) * 24);
  $("deadstamp").innerHTML = $("stamp").innerHTML.replace(/<span class="rec">.*?<\/span><br>/, "").replace("<br>", " &nbsp;");
  $("deadfacts").innerHTML = `${esc(P.name)}, ${esc(OCCS[P.occ].n.toLowerCase())}<br>Survived ${days} day${days === 1 ? "" : "s"} and ${hours} hour${hours === 1 ? "" : "s"}.<br>${esc(cause || "")}<br>Kills: ${P.kills || 0}`;
  let cont = $("contworld");
  if (!cont){ cont = document.createElement("button"); cont.id = "contworld"; cont.textContent = "Continue in this world as a new survivor"; cont.style.marginLeft = "12px"; $("again").after(cont); }
  cont.onclick = continueWorld;
  $("again").onclick = () => { deleteRun(G.runId); $("dead").classList.add("hidden"); $("title").classList.remove("hidden"); renderCreation(); };
  setTimeout(() => $("dead").classList.remove("hidden"), 1400);
}
// a fresh survivor somewhere else in the same county
function continueWorld(){
  $("dead").classList.add("hidden");
  const old = P, beds = rooms.filter(r => r.type === "bedroom" && r.tiles.length && buildings[r.b].kind === "house").filter(r => { const [x, y] = r.tiles[0]; return y < PK_Y0 && Math.hypot(x - old.x, y - old.y) > 120 && !Z.some(z => z.alive && Math.abs(z.x - x) < 8 && Math.abs(z.y - y) < 8); });
  const r = beds.length ? pick(beds) : rooms.find(r => r.type === "bedroom" && r.tiles.length);
  const occ = pick(Object.keys(OCCS));
  P = newPlayer(pick(["Alex Moreno", "Dana Reyes", "Chris Holt", "Jamie Walsh", "Robin Pratt", "Casey Lund", "Morgan Fife"]), occ, new Set());
  giveKit();
  const [x, y] = r.tiles[Math.floor(r.tiles.length / 2)]; P.x = x + .5; P.y = y + .5; unstickPlayer(true);
  G.running = true; G.speedIdx = 0; G.startBld = r.b; CAM = null; flow = null; G.visBox = null; G.vis.fill(0); computeVitals(); computeVis();
  for (const id of ["vitals", "equip", "stamp", "speed"]) $(id).classList.remove("hidden");
  say(`${P.name}, ${OCCS[occ].n.toLowerCase()}. Another survivor in the same county. Somewhere out there, ${old.name}'s things are still lying where they fell.`, "#ffd27a");
}
function stepBodies(){
  for (const c of G.corpses){
    if (!c.rise || G.min < c.rise) continue;
    c.rise = null; const z = newZombie(c.x, c.y); z.col = c.col; z.pants = c.pants; z.carry = c.extra || c.items || []; z.state = "idle"; Z.push(z);
    G.corpses.splice(G.corpses.indexOf(c), 1);
    if (Math.hypot(c.x - P.x, c.y - P.y) < 25) say(`${c.player || "The body"} is getting up.`, "#ff9a8a");
    break;
  }
}
// ---------- hotbar ----------
function hotbarItems(){ return allCarried().filter(it => ITEMS[it.id].cat === "weapon").slice(0, 5); }
function updateHotbar(){
  let hb = $("hotbar");
  if (!hb){ hb = document.createElement("div"); hb.id = "hotbar"; document.body.appendChild(hb); }
  const show = G && G.running && P.alive && !P.car;
  hb.style.display = show ? "flex" : "none"; if (!show) return;
  const items = hotbarItems(), sig = items.map(it => it.id + (it === P.weapon ? "*" : "")).join(",");
  if (hb.dataset.sig === sig) return; hb.dataset.sig = sig; hb.innerHTML = "";
  for (let k = 0; k < 5; k++){
    const it = items[k], s = document.createElement("div"); s.className = "hb" + (it && it === P.weapon ? " on" : "");
    s.innerHTML = `<span class="n">${k + 1}</span>` + (it && typeof iconURL === "function" ? `<img src="${iconURL(it.id)}" width="30" height="30" title="${ITEMS[it.id].n}">` : "");
    hb.appendChild(s);
  }
}
addEventListener("keydown", e => {
  if (!G || !G.running || G.paused || P.car || (document.activeElement && document.activeElement.tagName === "INPUT")) return;
  const n = +e.key; if (n >= 1 && n <= 5){ const it = hotbarItems()[n - 1]; if (it){ P.weapon = P.weapon === it ? null : it; say(P.weapon ? `${ITEMS[it.id].n} in hand.` : "Hands free."); } }
});
// ---------- notes on the map ----------
let MAPV = null;
function hookMapNotes(){
  const c = $("mapc"); if (!c || c.dataset.notes) return; c.dataset.notes = 1;
  const toW = e => { const r = c.getBoundingClientRect(), mx = (e.clientX - r.left) * c.width / r.width, my = (e.clientY - r.top) * c.height / r.height; return MAPV ? [MAPV.X0 + mx / MAPV.s, MAPV.Y0 + my / MAPV.s] : null; };
  c.addEventListener("click", e => { const w = toW(e); if (!w) return; const t = prompt("Note for this spot on the map:"); if (t){ (G.marks = G.marks || []).push([w[0], w[1], t.slice(0, 30)]); renderMap(); } });
  c.addEventListener("contextmenu", e => { e.preventDefault(); const w = toW(e); if (!w || !G.marks) return; let bi = -1, bd = 1e9; G.marks.forEach((m, k) => { const d = Math.hypot(m[0] - w[0], m[1] - w[1]); if (d < bd){ bd = d; bi = k; } }); if (bi >= 0 && bd < 12 / MAPV.s){ G.marks.splice(bi, 1); renderMap(); } });
}
// ---------- sleep ----------
let sleepAcc = 0;
function stepSleepEvents(dm){
  if (!P.sleeping) return;
  sleepAcc += dm; if (sleepAcc < 60) return; sleepAcc = 0;
  if (Z.some(z => z.alive && (z.state === "chase" || z.state === "investigate") && Math.abs(z.x - P.x) < 9 && Math.abs(z.y - P.y) < 9)) return wake("Something outside woke you. Scratching. Shuffling.");
  if (R() < (P.sleepOn === "bed" ? .025 : .05)){ P.panic = Math.min(100, (P.panic || 0) + 25); P.unhappy = Math.min(100, (P.unhappy || 0) + 5); wake("You jolt awake from a nightmare, heart pounding."); }
}
// ---------- body weight ----------
function stepWeight(dm){
  P.kg = P.kg ?? 80;
  const burn = (2100 / 1440) * (1 + (P.running && P.moving ? 1.4 : 0) + (P.moving ? .25 : 0) + (P.action && /hammer|saw|build|dig|chop/i.test(P.action.name || "") ? .6 : 0)) * dm;
  P.kg = clamp(P.kg - burn / 7700, 38, 140);
}
function eatCalories(it, k){ const d = ITEMS[it.id]; P.kg = (P.kg ?? 80) + ((it.hun ?? d.hun ?? 0) * 2600 * k) / 7700; }
VITALS.push(
  { id: "underweight", ic: "⚖️", val: () => 66 - (P.kg ?? 80), th: [0, 6, 12, 18], n: ["Underweight", "Very underweight", "Emaciated", "Starving to death"], d: ["Weaker in a fight.", "Much weaker. Tires fast.", "Barely able to fight.", "..."] },
  { id: "overweight", ic: "🍔", val: () => (P.kg ?? 80) - 98, th: [0, 12, 24, 36], n: ["Overweight", "Obese", "Very obese", "Morbidly obese"], d: ["Tires a little faster.", "Tires faster, runs slower.", "Slow and short of breath.", "..."] },
);
function moveMultW(){ const kg = P.kg ?? 80; return kg > 110 ? .88 : kg > 98 ? .95 : kg < 55 ? .9 : 1; }
function stepQoL(dt, dm){ stepBodies(); stepSleepEvents(dm); stepWeight(dm); stepAnim(dt); }
