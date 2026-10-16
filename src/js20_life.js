// ============================================================
// Part 20: life. Stairs and floors, fences, how loud you are,
// what day it is, fog, falling down, feeding zombies, the sound
// of the world, and smoother movement.
// ============================================================
let PLV = { x: 0, y: 0, lvl: 0, pk: null }, RDT = 1 / 60;

// ---------- stairs ----------
function stairLinks(i){
  const x = i % W, y = (i / W) | 0, o = objs.get(i); if (!o || o.type !== "stairs") return [];
  const r = realXY(x, y), b = bldId[i], out = [];
  if (b < 0) return out;
  const at = (k) => { if (k === 0) return ix(Math.round(r.x), Math.round(r.y)); const pk = PKMAP.get(b * 16 + k); return pk ? ix(Math.round(r.x) + pk.ox, Math.round(r.y) + pk.oy) : -1; };
  if (o.up){ const j = at(r.lvl + 1); if (j >= 0) out.push(j); }
  if (o.down || r.lvl > 0){ const j = at(r.lvl - 1); if (j >= 0) out.push(j); }
  return out;
}
function stairOptions(o, out){
  if (o.up) out.push({ label: "Go upstairs", fn: () => climb(o, 1) });
  if (o.down) out.push({ label: "Go downstairs", fn: () => climb(o, -1) });
}
function climb(o, dir){
  const r = realXY(o.x, o.y), b = bldId[ix(o.x, o.y)], k = r.lvl + dir;
  if (k < -1 || b < 0) return;
  let tx, ty;
  if (k === 0){ tx = Math.round(r.x); ty = Math.round(r.y); }
  else { const pk = ensureFloor(b, k); if (!pk) return say("The way up is blocked."); tx = Math.round(r.x) + pk.ox; ty = Math.round(r.y) + pk.oy; }
  act(dir > 0 ? "Climbing the stairs" : "Going downstairs", 1.1, () => {
    P.x = tx + .5; P.y = ty + .5; flow = null; G.visBox = null; G.vis.fill(0); computeVis(); CAM = null;
    noise(P.x, P.y, 3);
    if (k > 0 && !P.saidUp){ P.saidUp = true; say("Upstairs. Zombies only follow if they saw you come up."); }
  }, { noise: 3, noiseEvery: 1 });
}
// zombies chasing you take the stairs too
function stepStairs(dt){
  if (!flow) return;
  for (const z of Z){
    if (!z.alive || z.state !== "chase" || z.down > 0) continue;
    const [sx, sy] = sideTile(z.x, z.y), i = ix(sx, sy), o = objs.get(i);
    if (!o || o.type !== "stairs"){ z.stairT = 0; continue; }
    const here = flow[i]; let best = -1, bd = here < 0 ? 1e9 : here;
    for (const j of stairLinks(i)) if (flow[j] >= 0 && flow[j] < bd){ bd = flow[j]; best = j; }
    if (best < 0){ z.stairT = 0; continue; }
    z.stairT = (z.stairT || 0) + dt;
    if (z.stairT > 1.2){ z.x = best % W + .5; z.y = ((best / W) | 0) + .5; z.stairT = 0; z.mem = CFG.zMemory; }
  }
}
// path field: only the area near you, buffers reused, stairs connect floors
let FLOWQ = new Int32Array(24000), FLOWN = 0;
function buildFlow(){
  const maxD = 42;
  if (!FLOWBUF || FLOWBUF.length !== W * H){ FLOWBUF = new Int16Array(W * H).fill(-1); FLOWN = 0; }
  for (let k = 0; k < FLOWN; k++) FLOWBUF[FLOWQ[k]] = -1;
  flow = FLOWBUF;
  const [sx, sy] = sideTile(P.x, P.y);
  let h = 0, t = 0; flow[ix(sx, sy)] = 0; FLOWQ[t++] = ix(sx, sy);
  while (h < t){
    const i = FLOWQ[h++], x = i % W, y = (i / W) | 0, d = flow[i];
    if (d >= maxD) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
      const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue;
      const j = ix(nx, ny); if (flow[j] >= 0 || !pathZ(nx, ny)) continue;
      if (t >= FLOWQ.length) break;
      flow[j] = d + 1; FLOWQ[t++] = j;
    }
    const o = objs.get(i);
    if (o && o.type === "stairs") for (const j of stairLinks(i)){ if (flow[j] >= 0 || t >= FLOWQ.length) continue; flow[j] = d + 3; FLOWQ[t++] = j; }
  }
  FLOWN = t;
}
// sounds carry between floors of the same building
function noise(x, y, r){
  G.sounds.push({ x, y, r, t: G.simT });
  if (P && Math.hypot(x - P.x, y - P.y) < 1.7) G.pNoise = Math.max(G.pNoise || 0, r);
  const tx = Math.floor(x), ty = Math.floor(y);
  if (ty >= PK_Y0){
    const pk = pkAt(tx, ty); if (!pk) return;
    const rx = x - pk.ox, ry = y - pk.oy;
    G.sounds.push({ x: rx, y: ry, r: r * .6, t: G.simT });
    const B = buildings[pk.b];
    for (let k = 1; k < B.floors; k++){ if (k === pk.k) continue; const q = PKMAP.get(pk.b * 16 + k); if (q) G.sounds.push({ x: rx + q.ox, y: ry + q.oy, r: r * .5, t: G.simT }); }
  } else if (inb(tx, ty)){
    const b = bldId[ix(tx, ty)]; if (b < 0) return;
    const B = buildings[b]; if (!B.floors || B.floors < 2) return;
    for (let k = 1; k < B.floors; k++){ const q = PKMAP.get(b * 16 + k); if (q) G.sounds.push({ x: x + q.ox, y: y + q.oy, r: r * .55, t: G.simT }); }
  }
}

// ---------- fences ----------
function fenceOptions(o, out){ out.push({ label: o.type === "fencew" ? "Climb over the wooden fence" : "Hop over the fence", fn: () => climbFence(o) }); }
function climbFence(o){
  let tx = P.x, ty = P.y;
  if (o.horiz){ ty = P.y < o.y + .5 ? o.y + 1.25 : o.y - .25; tx = clamp(P.x, o.x + .2, o.x + .8); }
  else { tx = P.x < o.x + .5 ? o.x + 1.25 : o.x - .25; ty = clamp(P.y, o.y + .2, o.y + .8); }
  if (solidP(Math.floor(tx), Math.floor(ty))) return say("Something is in the way on the other side.");
  const tall = o.type === "fencew";
  act(tall ? "Climbing the fence" : "Hopping the fence", tall ? 1.6 : .8, () => {
    if (lungeGrab(o.x + .5, o.y + .5)) return;
    if (tall && R() < .12 - skill("fitness") * .01){ say("You slip and land hard.", "#ff9a8a"); P.endurance = Math.max(0, P.endurance - .2); }
    P.x = tx; P.y = ty; noise(P.x, P.y, tall ? 6 : 4);
  });
}
function canLand(x, y){
  if (!inb(x, y)) return false; const t = tile[ix(x, y)];
  if (t === T.WALL || t === T.WATER || t === T.VOID || t === T.TREE || t === T.WIN || t === T.DOOR) return false;
  const o = objs.get(ix(x, y)); return !(o && OBJ[o.type].block && !OBJ[o.type].fence);
}
function stepFencesAndFeeding(dt){
  for (const z of Z){
    if (!z.alive || Math.abs(z.x - P.x) > 50 || Math.abs(z.y - P.y) > 50) continue;
    const o = objs.get(ix(z.x | 0, z.y | 0));
    const onF = o && OBJ[o.type].fence;
    const across = onF && (o.horiz !== false ? Math.abs(Math.sin(z.face)) > .45 : Math.abs(Math.cos(z.face)) > .45);
    if (onF && across && !z.onFence && z.down <= 0 && z.state !== "idle"){
      z.onFence = true;
      // tumble over: land on the far side and lie there a few seconds
      let nx = z.x, ny = z.y;
      if (o.horiz !== false){ ny = o.y + .5 + (Math.sin(z.face) >= 0 ? .8 : -.8); } else { nx = o.x + .5 + (Math.cos(z.face) >= 0 ? .8 : -.8); }
      if (canLand(Math.floor(nx), Math.floor(ny))){ z.x = nx; z.y = ny; }
      z.down = rf(2.2, 3.6); z.getupLunge = true; noise(z.x, z.y, 4);
    } else if (!onF) z.onFence = false;
    if (z.getupLunge && z.down <= 0){ z.getupLunge = false; if (Math.hypot(P.x - z.x, P.y - z.y) < 1.8 && z.state === "chase"){ z.lunge = .25; z.atkCd = 0; } }
    // the idle ones feed on fresh bodies
    if (z.state === "idle" && !z.feast && G.corpses.length && R() < dt * .5){
      for (const c of G.corpses){ if (G.min - (c.t || 0) < 720 && Math.hypot(c.x - z.x, c.y - z.y) < 1.6){ z.feast = c; z.face = Math.atan2(c.y - z.y, c.x - z.x); break; } }
    }
    if (z.feast && z.state !== "idle") z.feast = null;
    if (z.mv > .05){ const zx = z.x | 0, zy = z.y | 0; for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]) if (tile[ix(zx + dx, zy + dy)] === T.TREE) TREESHAKE.set(ix(zx + dx, zy + dy), G.simT); }
  }
}

// ---------- weather: morning fog ----------
let fogT = 0;
function stepWeather2(dt){
  fogT -= dt; G.fog = G.fog || 0;
  if (fogT <= 0){
    fogT = 40;
    const hr = (G.min / 60) % 24;
    if (hr >= 4 && hr < 9 && !G.rain && R() < .3) G.fogTarget = rf(.5, 1);
    if (hr >= 10 && hr < 22) G.fogTarget = 0;
  }
  G.fog += ((G.fogTarget || 0) - G.fog) * Math.min(1, dt * .05);
}

// ---------- the sound meter and the day counter ----------
function updateMeters(){
  let sm = $("soundm");
  if (!sm){
    sm = document.createElement("div"); sm.id = "soundm"; sm.className = "osd";
    sm.innerHTML = `<svg viewBox="0 0 40 28" width="40" height="28"><path d="M3 10h6l7-6v20l-7-6H3z" fill="currentColor"/><path class="a1" d="M20 10q3 4 0 8" stroke="currentColor" stroke-width="2.4" fill="none"/><path class="a2" d="M24 6q6 8 0 16" stroke="currentColor" stroke-width="2.4" fill="none"/><path class="a3" d="M28 2q9 12 0 24" stroke="currentColor" stroke-width="2.4" fill="none"/></svg><span id="soundtxt">Quiet</span>`;
    document.body.appendChild(sm);
    const dc = document.createElement("div"); dc.id = "daycount"; dc.className = "osd"; document.body.appendChild(dc);
  }
  const n = G.pNoise || 0;
  G.pNoise = n * .55;
  const lv = n < .5 ? 0 : n < 3 ? 1 : n < 6.5 ? 2 : n < 13 ? 3 : 4;
  const cols = ["#7a8a7a", "#8ad08a", "#e8d060", "#f0a040", "#ff5040"], txt = ["Silent", "Quiet", "Audible", "Loud", "Very loud"];
  sm.style.color = cols[lv];
  sm.querySelector(".a1").style.opacity = lv >= 1 ? 1 : .2; sm.querySelector(".a2").style.opacity = lv >= 2 ? 1 : .2; sm.querySelector(".a3").style.opacity = lv >= 3 ? 1 : .2;
  $("soundtxt").textContent = txt[lv] + (n >= .5 ? ` ${Math.round(n)}m` : "");
  const show = G && G.running && P.alive;
  sm.style.display = show ? "flex" : "none";
  const dc = $("daycount"); dc.style.display = show ? "block" : "none";
  const r = realXY(P.x, P.y);
  dc.textContent = `DAY ${Math.floor(daysSurvived()) + 1}  ${seasonName().toUpperCase()}  ${Math.round(airTemp())}°C` + (r.lvl > 0 ? `  FLOOR ${r.lvl + 1}` : r.lvl < 0 ? "  BASEMENT" : "") + (G.search ? "  SEARCHING" : "");
}
function updatePrompt(){
  let pr = $("prompt"); if (!pr){ pr = el("div", "osd"); pr.id = "prompt"; document.body.appendChild(pr); }
  updateMeters(); updateEye(); updateHotbar(); applyHardHud();
  let txt = "";
  if (G && G.running && !G.paused && P.alive && !"inv,health,skills,map,ctx,craft".split(",").some(panelOpen)){
    if (P.car) txt = "E  car menu";
    else {
      let best = null, bd = 1.9, st = null, fe = null;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){
        const tx = Math.floor(P.x) + dx, ty = Math.floor(P.y) + dy, i = ix(tx, ty);
        const f = feats.get(i);
        if (f && f.type === "door" && !f.broken){ const d = Math.hypot(f.x + .5 - P.x, f.y + .5 - P.y); if (d < bd){ bd = d; best = f; } }
        const o = objs.get(i);
        if (o && o.type === "stairs" && Math.hypot(o.x + .5 - P.x, o.y + .5 - P.y) < 1.3) st = o;
        if (o && OBJ[o.type].fence && Math.hypot(o.x + .5 - P.x, o.y + .5 - P.y) < 1.0) fe = o;
      }
      if (st) txt = st.up && st.down ? "E  stairs (up or down)" : st.up ? "E  go upstairs" : "E  go downstairs";
      else if (best) txt = best.open ? "Q  close the door" : best.bar ? "Door is barricaded" : best.locked ? "Q  door is locked" : "Q  open the door";
      else if (fe) txt = "E  climb over the fence";
      else { const c = nearestCar(1.0); if (c) txt = c.locked && !hasKeyFor(c) ? "E  car is locked" : "E  get in the car"; }
    }
  }
  pr.textContent = txt; pr.style.opacity = txt ? 1 : 0;
}

// ---------- falling down, getting up, dying ----------
function drawZombie(z){
  const zf = z.flash > 0;
  const skin = z.skin || (z.skin = pick(["#8a977a", "#9a9a82", "#7f8c74", "#a39a86", "#8c8070", "#7a6a58", "#6a5a48"]));
  const hair = z.hair || (z.hair = pick(["#2a2622", "#4a3a2a", "#6a6a62", "#1a1816", "#7a5a3a", "#a8a090"]));
  if (z.down > 0) z.fallT = Math.min(1, (z.fallT || 0) + RDT * 3.4); else z.fallT = Math.max(0, (z.fallT || 0) - RDT * 2.2);
  if (z.fake || z.type === "crawl" || (z.down > 0 && z.fallT >= 1)){
    drawLying(z.x, z.y, { face: z.face, shirt: z.col, pants: z.pants, skin, hair, crawl: z.type === "crawl" && z.down <= 0 && !z.fake, phase: z.anim, move: Math.min(1, (z.mv || 0) / 0.2) });
    return;
  }
  const feeding = z.feast && z.state === "idle";
  drawRig(z.x, z.y, {
    face: z.face, phase: z.anim, move: feeding ? 0 : Math.min(1, (z.mv || 0) / 0.35), mode: z.type === "sprint" && z.state === "chase" ? "sprint" : "zombie",
    shirt: zf ? "#f4f0e8" : z.col, sleeve: zf ? "#f4f0e8" : z.col, pants: zf ? "#e8e4dc" : z.pants, shoes: "#1e1c1a", skin: zf ? "#ffffff" : skin, hair,
    eyes: "#e8e0c0", lunge: z.lunge > 0, blood: z.hp < z.maxhp || z.bloody || feeding, ragged: true, headTilt: z.tiltH ?? (z.tiltH = rf(-1.2, 1.2)),
    lean: z.lunge > 0 ? .4 : feeding ? .95 + Math.sin(G.simT * 6 + z.x) * .08 : undefined, tip: z.fallT ? z.fallT * 1.45 : 0, hat: z.fallT > .3 ? null : z.hat, hatCol: z.hatCol,
  });
}
function drawFalling(c){
  c.fall = Math.min(1, c.fall + RDT * 2.6);
  drawRig(c.x, c.y, { face: c.face, phase: 0, move: 0, mode: "zombie", shirt: c.col, sleeve: c.col, pants: c.pants, shoes: "#1e1c1a", skin: c.skin || "#7f8c74", hair: c.hair || "#2a2622", eyes: "#e8e0c0", ragged: true, blood: true, tip: c.fall * 1.5 });
}

// ---------- the sound of the world ----------
const AMB = { ac: null, wind: null, rain: null, birdT: 3, crT: 1 };
function ambInit(){
  if (AMB.ac) return;
  try { AMB.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  const ac = AMB.ac, len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  let b0 = 0; for (let i = 0; i < len; i++){ const w = Math.random() * 2 - 1; b0 = .985 * b0 + .015 * w; d[i] = b0 * 6; }
  const mk = (freq, q) => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = freq; f.Q.value = q; const g = ac.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(ac.destination); s.start(); return g; };
  AMB.wind = mk(420, .7); AMB.rain = mk(2600, .3);
}
function ambChirp(f0, f1, dur, vol, delay = 0){
  const ac = AMB.ac; if (!ac) return; const t = ac.currentTime + delay;
  const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * .2); g.gain.linearRampToValueAtTime(0, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + .05);
}
function stepAmbience(dt){
  if (!AMB.ac || !G || !G.running) return;
  const hr = (G.min / 60) % 24, indoors = (() => { const [sx, sy] = sideTile(P.x, P.y); return inb(sx, sy) && tile[ix(sx, sy)] === T.FLOOR; })();
  const k = indoors ? .35 : 1, t = AMB.ac.currentTime;
  AMB.wind.gain.setTargetAtTime((.035 + (G.rain ? .03 : 0)) * k, t, .8);
  AMB.rain.gain.setTargetAtTime(G.rain ? .05 * (indoors ? .5 : 1) : 0, t, .8);
  AMB.birdT -= dt; AMB.crT -= dt;
  if (hr > 5.5 && hr < 19 && !G.rain && AMB.birdT <= 0){ AMB.birdT = rf(2, 7); const f = rf(2200, 3600), n = ri(2, 5); for (let i = 0; i < n; i++) ambChirp(f, f * rf(1.1, 1.4), .09, .012 * k, i * .13); }
  if ((hr > 20.5 || hr < 5) && AMB.crT <= 0){ AMB.crT = rf(.5, 1.6); for (let i = 0; i < 3; i++) ambChirp(4400, 4300, .05, .006 * k, i * .07); }
}
addEventListener("keydown", ambInit, { once: true }); addEventListener("mousedown", ambInit, { once: true });

// ---------- regions follow your real position, never the upper-floor band ----------
function regionTick(dt){
  if (!REGIONS || !P) return;
  regT -= dt; if (regT > 0) return; regT = .2;
  const rp = realXY(P.x, P.y), M = 175; let best = null, bd = 1e9;
  for (let ry = Math.floor((rp.y - M) / REG); ry <= Math.floor((rp.y + M) / REG); ry++) for (let rx = Math.floor((rp.x - M) / REG); rx <= Math.floor((rp.x + M) / REG); rx++){
    if (rx < 0 || ry < 0 || rx >= RX || ry >= RY || ry * REG >= PK_Y0 || REGIONS[ry * RX + rx]) continue;
    const d = Math.hypot(rx * REG + 64 - rp.x, ry * REG + 64 - rp.y);
    if (d < bd){ bd = d; best = [rx, ry]; }
  }
  if (best){ const t0 = performance.now(); genRegion(best[0], best[1]); regGenMs = performance.now() - t0; regT = .05; }
}
// per-frame extras (called from the frame loop)
function lifeFrame(dt){
  RDT = dt;
  stepAmbience(dt); audioTick(dt); ambienceExtra(dt); ambienceBeds(dt); qualityTick();
}
(function texAliases2(){
  const A = { diner: "kitchen", kitchen2: "kitchen", barroom: "living", bookshop: "living", clothes: "bedroom", sportshop: "grocery", liquorshop: "grocery", videoshop: "bedroom",
    laundry: "pharmacy", banklobby: "grocery", vault: "hardware", postoffice: "grocery", garage2: "hardware", workshop: "hardware", library: "living", barn: "hardware", storageunit: "hardware" };
  for (const k in A){ TEX["floor_" + k] = TEX["floor_" + A[k]]; ROOMWALL[k] = ROOMWALL[k] || ROOMWALL[A[k]] || "#c8c4b8"; }
  Object.assign(ROOMWALL, { diner: "#e8d8c0", barroom: "#7a5a4a", bookshop: "#c8b898", library: "#c8b898", clothes: "#e0d4dc", laundry: "#d8e4e8", vault: "#9a9e9a", garage2: "#a8a49a", workshop: "#9a968a" });
})();
