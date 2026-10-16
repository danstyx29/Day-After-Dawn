// ============================================================
// Part 15: save files and the pause menu.
// The county is rebuilt from its seed, then everything that changed
// (tiles, containers, doors, zombies, cars, you) is restored on top.
// ============================================================
const SAVE_KEY = "deadquiet.v1.";
const SLOTS = ["auto", "1", "2", "3"];
function rle(a){ const o = []; let p = a[0], n = 0; for (let i = 0; i < a.length; i++){ if (a[i] === p) n++; else { o.push(p, n); p = a[i]; n = 1; } } o.push(p, n); return o; }
function unrle(o, len){ const a = new Uint8Array(len); let k = 0; for (let i = 0; i < o.length; i += 2){ a.fill(o[i], k, k + o[i + 1]); k += o[i + 1]; } return a; }

function snapshot(){
  const carried = allCarried();
  const Pc = Object.assign({}, P, { traits: [...P.traits], weaponIdx: P.weapon ? carried.indexOf(P.weapon) : -1, carIdx: P.car ? V.indexOf(P.car) : -1,
    weapon: null, car: null, action: null, queue: [], swing: null, speech: null, sleeping: false });
  const keepG = ["min", "startMin", "waterOff", "powerOff", "heliAt", "heliDone", "powerMsg", "waterSet", "metaT", "weatherT", "rain", "zoom", "startBld",
    "corpses", "alarms", "built", "branches", "seed", "runId"];
  const g = {}; for (const k of keepG) g[k] = G[k];
  g.blood = G.blood.slice(-300);
  return { v: 1, when: Date.now(), name: P.name, occ: P.occ, day: daysSurvived(), seed: G.seed, size: W, runId: G.runId,
    tile: rle(tile), explored: rle(explored),
    objs: [...objs.values()], feats: [...feats.values()], floor: [...floorItems].filter(([, l]) => l.length),
    bld: buildings.map(b => b.alarmUsed ? 1 : 0),
    Z: Z.filter(z => z.alive).map(z => ({ x: z.x, y: z.y, hp: z.hp, maxhp: z.maxhp, type: z.type, col: z.col, pants: z.pants, skin: z.skin, hair: z.hair, fake: z.fake, face: z.face, spdJ: z.spdJ, down: z.down })),
    V, G: g, P: Pc, regions: REGION_ORDER.slice() };
}
function restore(d){
  CFG.W = CFG.H = d.size;
  genWorld(d.seed);
  REG_RESTORING = true; for (const k of d.regions || []) genRegionK(k); REG_RESTORING = false; PENDING_SPAWN = []; DEFER_SPAWN = false;
  tile.set(unrle(d.tile, W * H)); explored.set(unrle(d.explored, W * H));
  objs = new Map(d.objs.map(o => [ix(o.x, o.y), o]));
  feats = new Map(d.feats.map(f => [ix(f.x, f.y), f]));
  floorItems = new Map(d.floor);
  d.bld.forEach((u, k) => { if (buildings[k]) buildings[k].alarmUsed = !!u; });
  WRC.clear(); clearAllCaches(); flow = null;
  G = Object.assign({ sounds: [], vis: null, visZ: 0, anyChase: false, vit: {}, running: true, simT: 0, speedIdx: 0, fx: null, built: [], branches: {} }, d.G);
  G.zoom = snapZoom(G.zoom || 1.05);
  const traits = new Set(d.P.traits);
  P = Object.assign(newPlayer(d.P.name, d.P.occ, traits), d.P, { traits });
  for (const k in SKILLS) if (!P.sk[k]) P.sk[k] = { lvl: 0, xp: 0 };
  V = d.V || [];
  P.car = d.P.carIdx >= 0 ? V[d.P.carIdx] : null;
  P.weapon = d.P.weaponIdx >= 0 ? allCarried()[d.P.weaponIdx] || null : null;
  Z = d.Z.map(z => Object.assign(newZombie(z.x, z.y), z, { state: "idle" }));
  computeVitals(); computeVis();
  for (const id of ["vitals", "equip", "stamp", "speed"]) $(id).classList.remove("hidden");
  $("title").classList.add("hidden"); $("dead").classList.add("hidden"); hidePause();
  $("log").innerHTML = ""; vitalSig = "";
  say(`${P.name}. Day ${Math.floor(daysSurvived()) + 1} of the outbreak. The tape picks up where it left off.`);
}

// ---------- browser storage, with export/import as a fallback ----------
function readIndex(){ try { return JSON.parse(localStorage.getItem(SAVE_KEY + "index") || "{}"); } catch (e) { return {}; } }
function writeIndex(ix_){ try { localStorage.setItem(SAVE_KEY + "index", JSON.stringify(ix_)); } catch (e) {} }
function saveTo(slot, quiet){
  if (!G || !G.running || !P.alive) return false;
  try {
    const d = snapshot();
    localStorage.setItem(SAVE_KEY + slot, JSON.stringify(d));
    const idx = readIndex(); idx[slot] = { name: d.name, occ: d.occ, day: d.day, when: d.when, runId: d.runId }; writeIndex(idx);
    if (!quiet) say(slot === "auto" ? "Autosaved." : `Saved to slot ${slot}.`, "#d6f2c4");
    return true;
  } catch (e) {
    say("Couldn't save in this browser (storage blocked or full). Use Export save file instead.", "#ff9a8a");
    return false;
  }
}
function loadFrom(slot){
  try { const s = localStorage.getItem(SAVE_KEY + slot); if (!s) return say("That slot is empty."); restore(JSON.parse(s)); }
  catch (e) { console.error(e); alert("That save couldn't be loaded."); }
}
function deleteRun(runId){
  const idx = readIndex();
  for (const s of SLOTS) if (idx[s] && idx[s].runId === runId){ try { localStorage.removeItem(SAVE_KEY + s); } catch (e) {} delete idx[s]; }
  writeIndex(idx);
}
function exportSave(){
  const d = snapshot(), blob = new Blob([JSON.stringify(d)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `dead-quiet-${P.name.replace(/\W+/g, "-").toLowerCase()}-day${Math.floor(d.day) + 1}.json`;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function importSave(){
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
  inp.onchange = () => { const f = inp.files[0]; if (!f) return; f.text().then(t => { try { restore(JSON.parse(t)); } catch (e) { alert("That file isn't a Dead Quiet save."); } }); };
  inp.click();
}

// ---------- pause menu ----------
function ensurePause(){
  if ($("pause")) return;
  const d = el("div", "hidden"); d.id = "pause";
  d.innerHTML = `<div class="tape"><div class="stamp"><span>❚❚ PAUSE</span><span id="pstamp"></span></div><h1 id="ptitle">Paused</h1><div id="pbody"></div></div>`;
  document.body.appendChild(d);
}
function slotList(mode){
  const idx = readIndex(), box = el("div", "slots");
  for (const s of SLOTS){
    if (mode === "save" && s === "auto") continue;
    const m = idx[s];
    const r = el("button", "slot" + (m ? "" : " empty"), `<span>${s === "auto" ? "Autosave" : "Slot " + s}</span><span>${m ? `${esc(m.name)}, day ${Math.floor(m.day) + 1}` : "empty"}</span><span>${m ? new Date(m.when).toLocaleString() : ""}</span>`);
    r.onclick = () => { if (mode === "save"){ if (saveTo(s)) showPause("main"); } else if (m) loadFrom(s); };
    if (mode === "load" && !m) r.disabled = true;
    box.appendChild(r);
  }
  return box;
}
function showPause(view = "main", fromTitle = false){
  ensurePause();
  const p = $("pause"), body = $("pbody"); body.innerHTML = "";
  p.classList.remove("hidden"); p.dataset.title = fromTitle ? "1" : "";
  $("ptitle").textContent = view === "save" ? "Save game" : view === "load" ? "Load game" : "Paused";
  $("pstamp").textContent = fromTitle ? "" : ($("stamp").textContent.replace("● REC", "").trim());
  const btn = (label, fn, cls = "") => { const b = el("button", "pbtn " + cls, label); b.onclick = fn; body.appendChild(b); return b; };
  if (view === "main"){
    btn("Resume", hidePause, "primary");
    btn("Save game", () => showPause("save"));
    btn("Load game", () => showPause("load"));
    btn("Export save file", exportSave);
    btn("Import save file", importSave);
    btn("Quit to title", () => { saveTo("auto", true); G.running = false; hidePause(); for (const id of ["vitals", "equip", "stamp", "speed"]) $(id).classList.add("hidden"); closePanels(); $("title").classList.remove("hidden"); renderCreation(); });
    body.appendChild(el("p", "phint", "Your game also autosaves every five minutes. Saves live in this browser; export a file if you want a backup or to move it to another computer. Dying ends the run and erases its saves."));
  } else {
    body.appendChild(slotList(view));
    if (view === "load") btn("Import a save file instead", importSave);
    btn("Back", () => fromTitle ? hidePause() : showPause("main", false));
  }
}
function hidePause(){ const p = $("pause"); if (p) p.classList.add("hidden"); if (G) G.paused = false; }
function togglePause(){
  if (!G || !G.running) return;
  if (G.paused){ hidePause(); return; }
  G.paused = true; cancelActionsSoft(); showPause("main");
}
function cancelActionsSoft(){ for (const k in keys) keys[k] = false; rmb = false; }
let autoT = 0;
function autosaveTick(realDt){
  if (!G || !G.running || G.paused || !P.alive) return;
  autoT += realDt; if (autoT > 300){ autoT = 0; saveTo("auto", true); }
}
