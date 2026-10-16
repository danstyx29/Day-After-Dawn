// ============================================================
// Part 6: audio, UI panels, input, game flow, main loop
// ============================================================
const sfx = (() => {
  let ac = null, master, nb;
  function init(){
    if (ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
    nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function env(g, vol, dur){ const t = ac.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function burst(dur, f, q, vol, type = "lowpass", delay = 0){
    if (!ac || vol <= 0.01) return;
    const s = ac.createBufferSource(); s.buffer = nb;
    const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ac.createGain(); s.connect(fl); fl.connect(g); g.connect(master);
    const t = ac.currentTime + delay; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.start(t); s.stop(t + dur + 0.05);
  }
  function tone(f0, f1, dur, vol, type = "sine", pan = 0){
    if (!ac || vol <= 0.01) return;
    const o = ac.createOscillator(); o.type = type; const t = ac.currentTime;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ac.createGain(); env(g, vol, dur);
    let node = g;
    if (ac.createStereoPanner){ const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); node = p; }
    o.connect(g); node.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  return {
    init,
    swing(){ burst(0.14, 1100, 0.8, 0.18, "bandpass"); },
    hit(crit){ burst(0.1, 260, 1, crit ? 0.7 : 0.45); tone(110, 45, 0.14, 0.35); },
    groan(v, pan){
      if (!ac || v <= 0.02) return;
      const o = ac.createOscillator(); o.type = "sawtooth"; const t = ac.currentTime, f = rf(70, 110);
      o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * rf(.75, .9), t + 1.1);
      const fl = ac.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = 520;
      const g = ac.createGain(); env(g, v * 0.22, 1.2);
      o.connect(fl); fl.connect(g);
      if (ac.createStereoPanner){ const p = ac.createStereoPanner(); p.pan.value = clamp(pan / 8, -1, 1); g.connect(p); p.connect(master); } else g.connect(master);
      o.start(t); o.stop(t + 1.3);
    },
    thump(v){ tone(80, 40, 0.2, v * 0.6); burst(0.1, 180, 1, v * 0.35); },
    glass(v){ burst(0.45, 3800, 0.6, v * 0.45, "highpass"); burst(0.2, 6000, 2, v * 0.3, "bandpass", 0.05); },
    door(){ tone(160, 110, 0.09, 0.12, "square"); },
    hurt(){ tone(320, 160, 0.3, 0.28, "sawtooth"); burst(0.15, 400, 1, 0.3); },
    heli(v){ for (let k = 0; k < 24; k++) burst(0.07, 90, 1, v * 0.5, "lowpass", k * 0.09); },
    alarm(v){ tone(950, 950, 0.4, v * 0.18, "square"); setTimeout(() => tone(720, 720, 0.4, v * 0.18, "square"), 450); },
    gunshot(){ burst(0.6, 380, 0.7, 0.32); },
  };
})();

// ---------- DOM helpers ----------
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function closePanels(){ for (const id of ["inv", "health", "skills", "map", "ctx", "craft", "mech"]) $(id).classList.add("hidden"); closeItemMenu(); }
const panelOpen = id => !$(id).classList.contains("hidden");
function toggle(id, render){ const open = panelOpen(id); closePanels(); if (!open){ $(id).classList.remove("hidden"); render && render(); } }

// ---------- containers in reach ----------
function rollLoot(o, table){
  o.items = [];
  if (o.extra){ o.items.push(...o.extra); delete o.extra; }
  const L = LOOT[o.loot || table]; if (!L) return;
  let n = ri(L.rolls[0], L.rolls[1]); if (CFG.lootMul && n > 0) n = Math.max(0, Math.round(n * CFG.lootMul + (R() - .5) * .6));
  if (P.traits.has("lucky")) n += R() < 0.4 ? 1 : 0;
  for (let k = 0; k < n; k++) o.items.push(makeItem(wpick(L.items)));
  fixLootStacks(o);
  o.lastT = G.min;
}
function nearbyContainers(){
  const out = [];
  const px = Math.floor(P.x), py = Math.floor(P.y);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
    const x = px + dx, y = py + dy; if (!inb(x, y)) continue;
    if (Math.hypot(x + .5 - P.x, y + .5 - P.y) > 1.6) continue;
    const o = objs.get(ix(x, y));
    if (o && OBJ[o.type].cont){
      if (!o.items) rollLoot(o, OBJ[o.type].cont === "shelf" ? "shelf_" + o.store : OBJ[o.type].cont);
      const mult = o.type === "fridge" && powerOn() ? 0.25 : 1;
      ageList(o.items, (G.min - (o.lastT ?? G.min)) * mult); o.lastT = G.min;
      out.push({ name: OBJ[o.type].n, list: o.items, cap: OBJ[o.type].cap });
    }
    const fl = floorItems.get(ix(x, y));
    if (fl && fl.length) out.push({ name: "Floor", list: fl, floor: true });
  }
  for (const c of G.corpses){
    if (Math.hypot(c.x - P.x, c.y - P.y) > 1.3) continue;
    if (!c.items) rollLoot(c, "corpse");
    out.push({ name: "Body", list: c.items });
  }
  if (!P.car){ const c = nearestCar(1.0); if (c && !c.locked && carLocal(c, P.x, P.y)[0] < -.3) out.push({ name: "Car trunk", list: rollTrunk(c), cap: 30 }); }
  else out.push({ name: "Glovebox", list: rollGlove(P.car), cap: 4 });
  return out;
}
// ---------- skills panel ----------
function renderSkills(){
  const p = $("skills"); p.innerHTML = "";
  const close = el("button", "close", "close"); close.onclick = closePanels; p.appendChild(close);
  p.appendChild(el("h2", "", "Skills"));
  let grp = "";
  for (const k in SKILLS){
    const s = SKILLS[k], st = P.sk[k];
    if (s.grp !== grp){ grp = s.grp; p.appendChild(el("h3", "", grp)); }
    const row = el("div", "skill");
    row.appendChild(el("span", "", esc(s.n) + (P.books[k] ? ` <span class="tag">x3</span>` : "")));
    const pips = el("div", "pips");
    for (let i = 0; i < 10; i++){
      const pi = el("i", i < st.lvl ? "on" : i === st.lvl ? "part" : "");
      if (i === st.lvl && st.lvl < 10) pi.style.setProperty("--p", Math.round(st.xp / XP_NEED[st.lvl] * 100) + "%");
      pips.appendChild(pi);
    }
    row.appendChild(pips); row.appendChild(el("span", "", st.lvl));
    p.appendChild(row);
  }
  p.appendChild(el("p", "", `Traits: ${[...P.traits].map(t => TRAITS[t].n).join(", ") || "none"}. Job: ${OCCS[P.occ].n}.`));
}

// ---------- map ----------
function renderMap(){
  const c = $("mapc"), m = c.getContext("2d"), s = c.width / W;
  m.fillStyle = "#2a2620"; m.fillRect(0, 0, c.width, c.height);
  const col = { [T.GRASS]: "#4f6a3a", [T.ROAD]: "#3e4144", [T.WALK]: "#8e8c86", [T.FLOOR]: "#b5a77d", [T.WALL]: "#1f1c18", [T.DOOR]: "#8a5a2e", [T.WIN]: "#7fa5b8", [T.TREE]: "#2f4a2a", [T.LOT]: "#55585b", [T.DIRT]: "#6b5a40", [T.WATER]: "#3a5a7a" };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    if (!explored[ix(x, y)]) continue;
    m.fillStyle = col[tile[ix(x, y)]]; m.fillRect(x * s, y * s, s, s);
  }
  m.fillStyle = "#ff5a4a"; m.beginPath(); m.arc(P.x * s, P.y * s, 4, 0, 7); m.fill();
  m.fillStyle = "#d8b45a"; for (const v of V) if (explored[ix(Math.floor(v.x), Math.floor(v.y))]) m.fillRect(v.x * s - 2, v.y * s - 2, 4, 4);
  m.font = "15px VT323, monospace"; m.textAlign = "center";
  for (const t of TOWNS){ let seen = false; for (let y = t.y0; y < t.y1 && !seen; y += 4) for (let x = t.x0; x < t.x1; x += 4) if (explored[ix(x, y)]){ seen = true; break; }
    if (seen){ m.fillStyle = "#000"; m.fillText(t.name, t.cx * s + 1, t.y0 * s - 3); m.fillStyle = "#e9e1cc"; m.fillText(t.name, t.cx * s, t.y0 * s - 4); } }
  m.fillStyle = "#ff5a4a"; m.beginPath(); m.arc(P.x * s, P.y * s, 4, 0, 7); m.fill();
}

// ---------- context menu ----------
let ctxOpts = [];
function openCtx(){
  ctxOpts = interactions();
  const m = $("ctx"); m.innerHTML = "";
  if (!ctxOpts.length){ say("Nothing to interact with here."); return; }
  ctxOpts.forEach((o, k) => {
    const d = el("div", o.off ? "off" : "", `<b>${k < 9 ? k + 1 : ""}</b><span>${esc(o.label)}</span>`);
    d.onclick = () => pickCtx(k); m.appendChild(d);
  });
  const [sx, sy] = S(P.x, P.y, 30);
  m.style.left = Math.min(sx + 30, innerWidth - 260) + "px"; m.style.top = Math.max(10, Math.min(sy - 40, innerHeight - 30 * ctxOpts.length - 20)) + "px";
  m.classList.remove("hidden");
}
function pickCtx(k){ const o = ctxOpts[k]; if (!o || o.off) return; $("ctx").classList.add("hidden"); o.fn && o.fn(); }

// ---------- HUD ----------
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const VCOL = ["", "#b5a442", "#c97c2c", "#b8412c", "#7a1a14"];
let vitalSig = "";
function updateHUD(){
  const day = Math.floor(G.min / 1440), mins = Math.floor(G.min % 1440);
  const dim = [31,28,31,30,31,30,31,31,30,31,30,31];
  let dd = day, mo = 6; while (dd > dim[mo]){ dd -= dim[mo]; mo = (mo + 1) % 12; }
  const hh = String(Math.floor(mins / 60)).padStart(2, "0"), mm = String(mins % 60).padStart(2, "0");
  $("stamp").innerHTML = `<span class="rec">● REC</span><br>${MONTHS[mo]} ${String(dd).padStart(2, " ")} ${1993 + Math.floor((Math.floor(G.min / 1440) - CFG.startDay + 194) / 365)}<br>${hh}:${mm}`;
  const sp = P.sleeping ? "▶▶▶ SLEEP" : G.speedIdx === 0 ? "▶ PLAY" : G.speedIdx === 1 ? "▶▶ x3" : "▶▶▶ x8";
  $("speed").textContent = sp + (G.rain ? "   RAIN" : "");
  const w = P.weapon ? ITEMS[P.weapon.id] : null;
  if (P.car) $("equip").innerHTML = carHUD(); else $("equip").innerHTML = `${w ? esc(w.n) + (GUNS[P.weapon.id] ? ` ${P.weapon.jammed ? "JAMMED" : (P.weapon.loaded || 0) + "/" + GUNS[P.weapon.id].cap} <span style="opacity:.7">(+${ammoCount(GUNS[P.weapon.id].ammo)})</span> ` : "") + `<span class="bar"><i style="width:${Math.round(P.weapon.cond / w.cond * 100)}%"></i></span>` : "Bare hands"}<br>` +
    `LOAD ${totalLoad().toFixed(1)}/${carryCap()}  ${P.sneaking ? "SNEAK" : P.running ? "RUN" : "WALK"}  ${P.flash ? "LIGHT" : ""}`;
  const sig = VITALS.map(v => G.vit[v.id]).join("") + (P.fullT > 0 ? "f" : "");
  if (sig !== vitalSig){
    vitalSig = sig;
    const box = $("vitals"); box.innerHTML = "";
    for (const v of VITALS){
      const l = G.vit[v.id]; if (!l) continue;
      const d = el("div", "vital", `<span class="tip">${esc(v.n[l - 1])}<small>${esc(v.d[l - 1])}</small></span><span class="ico" style="background:${VCOL[l]}">${v.ic}</span>`);
      box.appendChild(d);
    }
    if (P.fullT > 0) box.appendChild(el("div", "vital", `<span class="tip">Well fed<small>Feeling good.</small></span><span class="ico" style="background:#5f8f4a">😋</span>`));
  }
}

// ---------- input ----------
const keys = {}; let mouse = { x: 0, y: 0 }, rmb = false;
addEventListener("keydown", e => {
  if (!G || !G.running) return;
  if (G.paused){ if (e.key === "Escape") togglePause(); return; }
  if (e.target.tagName === "INPUT") return;
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (["w","a","s","d"].includes(k) && !$("ctx").classList.contains("hidden")) $("ctx").classList.add("hidden");
  if (k === " "){ e.preventDefault(); if (!P.car) shove(); }
  if (k === "c") P.sneaking = !P.sneaking;
  if (k === "q") quickDoor();
  if (k === "f"){ P.flash = !P.flash; sfx.door(); }
  if (k === "e"){ if (panelOpen("ctx")) $("ctx").classList.add("hidden"); else { closePanels(); openCtx(); } }
  if (k === "i") toggle("inv", renderInv);
  if (k === "h") toggle("health", renderHealth);
  if (k === "k") toggle("skills", renderSkills);
  if (k === "m") toggle("map", renderMap);
  if (k === "t"){ if (G.visZ > 0 || G.anyChase) say("You can't rush time with the dead this close."); else G.speedIdx = (G.speedIdx + 1) % CFG.speeds.length; }
  if (k === "escape"){ if (G.build) G.build = null; else if (["inv", "health", "skills", "map", "ctx", "craft"].some(panelOpen)) closePanels(); else togglePause(); }
  if (k === "b") toggle("craft", renderCraft);
  if (/^[1-9]$/.test(k) && panelOpen("ctx")) pickCtx(+k - 1);
  if (e.key === "Tab") e.preventDefault();
});
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
addEventListener("blur", () => { for (const k in keys) keys[k] = false; rmb = false; });
cv.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
cv.addEventListener("contextmenu", e => e.preventDefault());
cv.addEventListener("mousedown", e => {
  if (!G || !G.running || G.paused) return;
  closeItemMenu();
  if (e.button === 2){ if (G.build){ G.build = null; return; } rmb = true; }
  if (e.button === 0){ $("ctx").classList.add("hidden"); if (G.build){ placeBuild(); return; } if (P.car) return; aimAtMouse(); lmbDown = true; if (rmb && gunOf()) fireGun(); else swingWeapon(); }
});
addEventListener("mouseup", e => { if (e.button === 2) rmb = false; });
cv.addEventListener("wheel", e => zoomWheel(e), { passive: true });
function aimAtMouse(){ const [wx, wy] = toWorld(mouse.x, mouse.y + 30 * zoom); P.face = Math.atan2(wy - P.y, wx - P.x); }

// ---------- player movement ----------
function stepPlayer(dt){
  if (P.car){ driveStep(dt); return; }
  let ix_ = 0, iy_ = 0;
  if (keys.w){ ix_ -= 1; iy_ -= 1; } if (keys.s){ ix_ += 1; iy_ += 1; }
  if (keys.a){ ix_ -= 1; iy_ += 1; } if (keys.d){ ix_ += 1; iy_ -= 1; }
  const l = Math.hypot(ix_, iy_);
  P.moving = l > 0 && P.stagger <= 0;
  if (!P.moving) P.ramp = .45;
  P.running = !!keys.shift && !P.sneaking && P.endurance > 0.05;
  P.aiming = rmb;
  if (P.moving){
    if (P.action || P.queue.length) cancelActions();
    if (P.sleeping){ wake(); }
    let spd = P.sneaking ? CFG.sneak : P.running ? CFG.run * (1 + skill("running") * 0.02) : CFG.walk;
    spd *= moveMult2(); if (P.aiming) spd *= 0.6;
    P.ramp = Math.min(1, (P.ramp || .45) + dt * 6); spd *= P.ramp;
    const ox = P.x, oy = P.y;
    moveEnt(P, ix_ / l * spd * dt, iy_ / l * spd * dt, "p", 0.27);
    const stride = P.sneaking ? 0.75 : P.running ? 1.55 : 1.0;
    P.walkPhase += Math.hypot(P.x - ox, P.y - oy) * 2 * Math.PI / stride;
    if (!P.aiming && !P.swing){ const tf = Math.atan2(iy_, ix_), df = Math.atan2(Math.sin(tf - P.face), Math.cos(tf - P.face)); P.face += df * Math.min(1, dt * 15); }
    P.stepT = (P.stepT || 0) - dt;
    if (P.stepT <= 0){
      P.stepT = 0.45;
      let r = stepNoiseRadius();
      if (P.traits.has("clumsy")) r *= 1.3; if (G.rain) r *= 0.8;
      noise(P.x, P.y, r * footMul()); sfxStep();
      if (P.running) { addXP("running", 0.35); addXP("fitness", 0.08); }
      if (P.sneaking && G.visZ > 0) addXP("sneak", 0.6);
    }
  }
  P.moveBlend = (P.moveBlend || 0) + ((P.moving ? 1 : 0) - (P.moveBlend || 0)) * Math.min(1, dt * 9);
  if (P.aiming) aimAtMouse();
  if (P.stagger > 0) P.stagger -= dt;
  if (P.swingCd > 0) P.swingCd -= dt;
  if (P.shoveCd > 0) P.shoveCd -= dt;
  if (P.swing){
    P.swing.t += dt;
    if (P.swing.kind === "swing" && !P.swing.hit && P.swing.t >= P.swing.dur * 0.45){ P.swing.hit = true; resolveSwing(); }
    if (P.swing.t >= P.swing.dur){ P.swing = null; P.swingCd = 0.08; }
  }
  if (P.speech){ P.speech.t -= dt; if (P.speech.t <= 0) P.speech = null; }
}

// ---------- game flow ----------
function step(dt){
  G.simT += dt;
  const dm = dt * CFG.minPerSec;
  G.min += dm;
  P.resting = false;
  stepPlayer(dt);
  stepAction(dt);
  if (!G.running) return;
  stepZombies(dt);
  stepStairs(dt); stepFencesAndFeeding(dt); stepWeather2(dt); stepLife2(dt, dm); stepGuns(dt); stepStealth(dt); stepCraft2(dt, dm); stepFire(dt); stepQoL(dt, dm); stepAnimals(dt); stepAtmos(dt); stepZombies2(dt); applyUtilities(); stepPopulation(dm); stepMist(); stepTracks(dt); stepUnstick(dt); stepLight(dt); stepEnv(dt); stepZStream(dt);
  if (!G.running) return;
  computeVitals();
  stepNeeds(dt, dm);
  if (!G.running) return;
  stepDirector(dt, dm);
  craftStep(dt, dm);
  if (P.sleeping){
    const close = Z.some(z => z.alive && z.state === "chase" && Math.hypot(z.x - P.x, z.y - P.y) < 9);
    if (close) wake("Something woke you. You're not alone.");
    else if (P.fatigue <= 0.02){ wake(); say("You wake up feeling rested."); }
    else if (R() < 0.000003){ wake("A nightmare jolts you awake."); P.panic = 30; }
  }
  if ((G.visZ > 0 || (G.anyChase && Z.some(z => z.alive && z.state === "chase" && Math.hypot(z.x - P.x, z.y - P.y) < 20))) && G.speedIdx){ G.speedIdx = 0; say("Time slows. Something is near."); }
}

let last = 0, hudT = 0, visT = 0, slowAvg = 0, hovT = 0;
function frame(ts){
  const realDt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
  if (G && G.running && !G.paused){
    const mult = P.sleeping ? CFG.sleepSpeed : CFG.speeds[G.speedIdx];
    fxInit(); fxUpdate(realDt); autosaveTick(realDt);
    if (G.hitstop > 0) G.hitstop -= realDt; else for (let k = 0; k < mult && G.running; k++) step(realDt);
    regionTick(realDt); lifeFrame(realDt);
    visT -= realDt;
    if (visT <= 0){ computeVis(); visT = 0.06; }
    const r0 = performance.now(); render(); const rt = performance.now() - r0;
    slowAvg = slowAvg * 0.97 + rt * 0.03;
    if (slowAvg > 24 && !window.__lowRes && DPR > 1){ window.__lowRes = true; resize(); }
    hovT -= realDt;
    if (hovT <= 0){ hovT = 0.08; const lab = hoverLabel(mouse.x, mouse.y), hv = $("hover");
      if (lab && !panelOpen("inv")){ hv.textContent = lab; hv.style.left = (mouse.x + 16) + "px"; hv.style.top = (mouse.y + 12) + "px"; hv.classList.remove("hidden"); } else hv.classList.add("hidden"); }
    hudT -= realDt; if (hudT <= 0){ updateHUD(); hudT = 0.2; if (panelOpen("health")) updateCondition(); refreshInvIfMoved(); updatePrompt(); }
  }
  requestAnimationFrame(frame);
}

function die(cause){
  if (!P.alive) return;
  P.alive = false; G.running = false; cancelActions(); deleteRun(G.runId);
  // the body rises
  const z = newZombie(P.x, P.y); z.col = OCCS[P.occ].shirt; z.state = "idle"; Z.push(z);
  render();
  const d = daysSurvived(), days = Math.floor(d), hours = Math.floor((d - days) * 24);
  $("deadstamp").innerHTML = $("stamp").innerHTML.replace(/<span class="rec">.*?<\/span><br>/, "").replace("<br>", " &nbsp;");
  $("deadfacts").innerHTML = `${esc(P.name)}, ${esc(OCCS[P.occ].n.toLowerCase())}<br>Survived ${days} day${days === 1 ? "" : "s"} and ${hours} hour${hours === 1 ? "" : "s"}<br>Zombies killed: ${P.kills}<br><span style="color:#e9e1cc;font-family:var(--type);font-size:20px">${esc(cause)}</span>`;
  $("hover").classList.add("hidden");
  setTimeout(() => { $("dead").classList.remove("hidden"); for (const id of ["vitals", "equip", "stamp", "speed"]) $(id).classList.add("hidden"); closePanels(); }, 1600);
}

function startGame(name, occ, traits){
  const size = 2048;
  const st = ($("seed") ? $("seed").value : "").trim();
  const seed = st ? (/^\d+$/.test(st) ? +st : [...st].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) | 0, 7) >>> 0) : (Math.random() * 1e9) | 0;
  CFG.W = CFG.H = size; CFG.zombieCount = Math.round(size * size * 0.0135);
  genWorld(seed);
  P = newPlayer(name, occ, traits);
  applyPreset($("diff") ? $("diff").value : "survivor");
  giveKit();
  const startMin = CFG.startDay * 1440 + CFG.startHour * 60;
  const dayAt = (r) => ri(r[0], r[1]) * 1440 + ri(6, 20) * 60;
  G = { min: startMin, startMin, simT: 0, speedIdx: 0, zoom: 1.05, sounds: [], corpses: [], blood: [], alarms: [],
    vis: null, visZ: 0, anyChase: false, vit: {}, running: true,
    waterOff: dayAt(CFG.waterOffDay), powerOff: dayAt(CFG.powerOffDay), heliAt: ri(CFG.heliDay[0], CFG.heliDay[1]) * 1440 + ri(9, 17) * 60,
    metaT: rf(200, 500), weatherT: rf(100, 400), rain: false };
  G.seed = seed; G.runId = Math.random().toString(36).slice(2); G.built = []; G.branches = {};
  clearAllCaches(); autoT = 0; CAM = null;
  G.dayLen = +($("daylen") ? $("daylen").value : 1); CFG.minPerSec = G.dayLen; G.preset = PRESET_KEY;
  // start in a bedroom of a random house
  const allBeds = rooms.filter(r => r.type === "bedroom" && r.tiles.length && buildings[r.b].kind === "house");
  const nearMid = allBeds.filter(r => Math.abs(r.tiles[0][0] - W / 2) < 64 && Math.abs(r.tiles[0][1] - H / 2) < 64);
  const beds = nearMid.length ? nearMid : allBeds;
  const r = pick(beds);
  const free = r.tiles.filter(([x, y]) => !objs.has(ix(x, y)));
  const [sx, sy] = pick(free);
  P.x = sx + .5; P.y = sy + .5; G.startBld = r.b;
  Z = []; ZFROZEN.clear(); resetPerfIndex(); flow = null; AN = []; PENDING_PENS = [];
  initVehicles();
  spawnZombies(CFG.zombieCount);
  computeVitals(); computeVis();
  for (const id of ["vitals", "equip", "stamp", "speed"]) $(id).classList.remove("hidden");
  $("log").innerHTML = "";
  const town = TOWNS.find(t => P.x >= t.x0 - 4 && P.x <= t.x1 + 4 && P.y >= t.y0 - 4 && P.y <= t.y1 + 4);
  say(`${name}. ${town ? town.name + ', ' : ''}Harlow County. The fourth day of the quarantine. Seed ${seed}.`);
  setTimeout(() => say("Press E near things to interact, I for inventory. Stay quiet."), 2500);
}

// ---------- character creation ----------
let selOcc = "unemployed"; const selTraits = new Set();
const OPPOSITE = { strong: "weak", weak: "strong", athletic: "unfit", unfit: "athletic", fastlearn: "slowlearn", slowlearn: "fastlearn",
  brave: "cowardly", cowardly: "brave", lighteat: "hearty", hearty: "lighteat", inconsp: "consp", consp: "inconsp", eagle: "shortsight", shortsight: "eagle" };
function pointsLeft(){ let p = OCCS[selOcc].pts; for (const t of selTraits) p -= TRAITS[t].cost; return p; }
function renderCreation(){
  const occs = $("occs"); occs.innerHTML = "";
  for (const k in OCCS){
    const o = OCCS[k], d = el("div", "opt" + (k === selOcc ? " sel" : ""), `<span>${o.n}</span><span class="pts">${o.pts > 0 ? "+" : ""}${o.pts}</span>`);
    d.tabIndex = 0; d.onclick = () => { selOcc = k; renderCreation(); }; occs.appendChild(d);
  }
  const sk = Object.entries(OCCS[selOcc].sk).map(([s, v]) => `${SKILLS[s].n} +${v}`).join(", ");
  $("occdesc").textContent = OCCS[selOcc].d + (sk ? ` Starts with ${sk}.` : "") + kitText(selOcc);
  for (const [box, good] of [[$("ptraits"), true], [$("ntraits"), false]]){
    box.innerHTML = "";
    for (const k in TRAITS){
      const t = TRAITS[k]; if ((t.cost > 0) !== good) continue;
      const d = el("div", "opt" + (selTraits.has(k) ? " sel" : ""), `<span>${t.n}</span><span class="pts">${t.cost > 0 ? "-" : "+"}${Math.abs(t.cost)}</span>`);
      d.tabIndex = 0;
      d.onmouseenter = () => { $("traitdesc").textContent = t.d; };
      d.onclick = () => { if (selTraits.has(k)) selTraits.delete(k); else { selTraits.add(k); if (OPPOSITE[k]) selTraits.delete(OPPOSITE[k]); } $("traitdesc").textContent = t.d; renderCreation(); };
      box.appendChild(d);
    }
  }
  const p = pointsLeft();
  $("points").textContent = `Points left: ${p}`; $("points").className = "points" + (p < 0 ? " neg" : "");
  $("begin").disabled = p < 0;
}
$("begin").onclick = () => {
  if (pointsLeft() < 0) return;
  sfx.init();
  $("title").classList.add("hidden");
  startGame($("pname").value.trim() || "Sam Whitlock", selOcc, new Set(selTraits));
};
$("again").onclick = () => { $("dead").classList.add("hidden"); $("title").classList.remove("hidden"); renderCreation(); };
initTextures();
renderCreation();
$("loadbtn").onclick = () => showPause("load", true);
requestAnimationFrame(frame);
