// ============================================================
// Part 28: stealth, as the original does it.
//  - Footsteps: walking 4 tiles, running 8. Sneaking cuts that to 20%
//    and the Sneaking skill scales it from 120% (lvl 0) to 40% (lvl 10).
//    Lightfooted 0.99 -> 0.20, Graceful 60%, Clumsy 120%, bare feet 80%.
//  - Being seen is not instant. Each zombie builds awareness of you
//    from your visibility (light, stance, cover, weather, traits), where
//    you are in its vision cone and how far away you are, and its own
//    perception. Half aware: it turns and shuffles over to look.
//    Fully aware: it chases. It loses you if you break line of sight
//    long enough, then searches where it last saw you.
//  - Your visibility shows as an eye next to the sound meter.
// ============================================================
Object.assign(TRAITS, {
  graceful: { n: "Graceful", cost: 4, d: "Footsteps 40% quieter." },
  hardhear: { n: "Hard of hearing", cost: -4, d: "You notice less around you and sounds are muffled." },
});
const lerpLvl = (a, b, lvl) => a + (b - a) * clamp(lvl, 0, 10) / 10;
// how far your footsteps carry
function stepNoiseRadius(){
  let r = P.running ? 8 : 4;
  if (P.sneaking) r = 4 * .2 * lerpLvl(1.2, .4, skill("sneak"));
  r *= lerpLvl(.99, .2, skill("lightfoot"));
  if (P.traits.has("graceful")) r *= .6;
  if (P.traits.has("clumsy")) r *= 1.2;
  if (typeof worn === "function" && !worn().some(it => ITEMS[it.id].slot === "shoes")) r *= .8;
  if (G.snow > .3 && !indoorsNow()) r *= .8;
  return Math.max(.25, r);
}
function footMul(){ return 1; }   // folded into stepNoiseRadius
// zombies' base sight range: day ~18 tiles, night far less; your flashlight lights you up
function zSightRange(){
  let r = isNight() ? CFG.zSightNight * (P.flash || P.torch ? 1.7 : 1) : CFG.zSightDay;
  if (P.traits.has("eagle")) r *= 1;   // trait is about your sight, not theirs
  return r;
}

// ---------- how visible you are right now (0 = invisible, 1 = standing in daylight) ----------
const ST = { vis: 1, light: 1, cover: 1, aware: 0, notice: 0, lastLightT: 0, lightCache: 1 };
function lightAtPlayer(){
  const dk = darknessBase(), inside = indoorsNow();
  let L = 1 - dk * 1.05;
  if (inside && dk < .2) L = .8;
  const [sx, sy] = sideTile(P.x, P.y);
  const b = inb(sx, sy) && tile[ix(sx, sy)] === T.FLOOR ? bldId[ix(sx, sy)] : -1;
  if (b >= 0 && dk > .2){ const B = buildings[b]; if (B.kind !== "bunker" && powerOn(P.x, P.y) && !B.lightsOff) L = Math.max(L, .85); }
  if (realXY(P.x, P.y).lvl < 0 && !powerOn(P.x, P.y)) L = Math.min(L, .08);
  // lamps, porch lights, candles and fires nearby
  if (dk > .2){
    const px = Math.floor(P.x), py = Math.floor(P.y);
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++){
      const o = objs.get(ix(px + dx, py + dy)); if (!o) continue;
      const d = Math.hypot(o.x + .5 - P.x, o.y + .5 - P.y);
      if (o.type === "lamp" && powerOn(o.x, o.y)) L = Math.max(L, .8 * (1 - d / 6.5));
      else if ((o.type === "porchlight" || o.type === "floorlamp") && powerOn(o.x, o.y)) L = Math.max(L, .7 * (1 - d / 4));
      else if (o.type === "candlelit") L = Math.max(L, .5 * (1 - d / 3));
      else if (o.type === "campfire" && o.fuel > 0) L = Math.max(L, .9 * (1 - d / 5));
    }
    if (G.fires) for (const f of G.fires.values()){ const d = Math.hypot(f.x + .5 - P.x, f.y + .5 - P.y); if (d < 6) L = Math.max(L, 1 - d / 6); }
  }
  if (P.flash || P.torch) L = Math.max(L, .65);
  return clamp(L, .05, 1);
}
// something solid and low between you and the zombie hides a crouching survivor
function coverBetween(z){
  if (!P.sneaking) return 1;
  const dx = z.x - P.x, dy = z.y - P.y, d = Math.hypot(dx, dy) || 1;
  for (const k of [.55, .95]){
    const x = P.x + dx / d * k, y = P.y + dy / d * k, o = objs.get(ix(x | 0, y | 0));
    if (o && OBJ[o.type].block && (OBJ[o.type].fence || ["hedge", "bush", "sandbag", "crate", "pcrate", "dumpster", "counter", "sofa", "table", "dtable", "woodwall", "rock", "hay", "armycrate", "tirepile"].includes(o.type))) return .35;
    for (const c of V){ if (Math.abs(c.x - x) < 1.1 && Math.abs(c.y - y) < 1.1){ const [u, w] = carLocal(c, x, y); if (Math.abs(u) < CAR_L && Math.abs(w) < CAR_W + .1) return .3; } }
  }
  return 1;
}
function foliageCover(){
  const px = Math.floor(P.x), py = Math.floor(P.y); let n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){ const i = ix(px + dx, py + dy); if (tile[i] === T.TREE) n++; const o = objs.get(i); if (o && (o.type === "bush" || o.type === "hedge" || o.type === "reeds")) n++; }
  return n ? Math.max(.55, 1 - n * .12) : 1;
}
function stepStealth(dt){
  if (!P.alive) return;
  ST.lastLightT -= dt; if (ST.lastLightT <= 0){ ST.lastLightT = .25; ST.lightCache = lightAtPlayer(); }
  ST.light = ST.lightCache;
  let v = .35 + .65 * ST.light;
  if (P.sneaking) v *= .4 * lerpLvl(1.14, .48, skill("sneak"));
  else if (P.running && P.moving) v *= 1.3;
  else if (!P.moving) v *= .85;
  v *= foliageCover();
  if (G.rain && !indoorsNow()) v *= .85;
  if (G.fog) v *= 1 - .45 * G.fog;
  if (P.traits.has("inconsp")) v *= .5; if (P.traits.has("consp")) v *= 2;
  ST.vis = v;
  // the eye fades back once nobody is looking
  ST.notice = Math.max(0, ST.notice - dt * .6);
  // Sneaking grows from moving unnoticed near the dead
  if (P.sneaking && P.moving && Z.some(z => z.alive && z.state !== "chase" && Math.abs(z.x - P.x) < 9 && Math.abs(z.y - P.y) < 9)) addXP("sneak", dt * .35);
}
// called for each zombie on its perception tick: replaces the old "see you instantly" check
function perceive(z, d, ad, same, sight, dtThink, dx, dy){
  if (!same || d > sight || !P.alive){ z.aware = Math.max(0, (z.aware || 0) - dtThink * .3); return; }
  z.perc = z.perc ?? rf(.6, 1.4);
  let cone = ad < .6 ? 1 : ad < 1.15 ? .6 : ad < 1.9 ? (d < 4 ? .25 : 0) : (d < 1.4 ? .5 : 0);
  if (cone <= 0){ z.aware = Math.max(0, (z.aware || 0) - dtThink * .3); return; }
  if (!los(z.x, z.y, P.x, P.y)){ z.aware = Math.max(0, (z.aware || 0) - dtThink * .3); if (z.state === "chase") z.seenT = (z.seenT || 0) + dtThink; return; }
  const distF = Math.pow(1 - d / sight, 1.3);
  let rate = 3.4 * ST.vis * cone * distF * z.perc * coverBetween(z);
  if (z.feast) rate *= .2;
  if (z.state === "idle" && (z.mv || 0) < .05) rate *= .75;
  if (d < 1.3 && ad < 1.15 && !P.sneaking) rate = 99;
  z.aware = Math.min(1.2, (z.aware || 0) + rate * dtThink);
  if (z.state === "chase"){ z.seenT = 0; z.lsx = P.x; z.lsy = P.y; z.mem = CFG.zMemory; z.tx = P.x; z.ty = P.y; return; }
  if (z.aware >= 1){
    groan(z, .6); z.state = "chase"; z.mem = CFG.zMemory; z.tx = P.x; z.ty = P.y; z.lsx = P.x; z.lsy = P.y; z.seenT = 0;
    ST.notice = 1; if (typeof musicStinger === "function" && !G.vis[ix(z.x | 0, z.y | 0)]) musicStinger();
  } else if (z.aware >= .35){
    // half sure: turn and shuffle over for a look
    z.face = Math.atan2(dy, dx); if (z.state !== "investigate" || R() < .3){ z.state = "investigate"; z.tx = P.x + rf(-1, 1); z.ty = P.y + rf(-1, 1); z.stuckT = 0; }
    ST.notice = Math.max(ST.notice, .55);
  }
}
// a chase that has lost sight of you for a while turns into a search of the last place it saw you
function chaseUpkeep(z, dt){
  if (z.state !== "chase") return;
  if ((z.seenT || 0) > 4.5 && z.lsx !== undefined){ z.state = "investigate"; z.tx = z.lsx + rf(-1.5, 1.5); z.ty = z.lsy + rf(-1.5, 1.5); z.searchT = rf(6, 12); z.aware = .3; }
  // chasers moan now and then, and the herd follows the sound
  z.herdT = (z.herdT ?? rf(1, 4)) - dt;
  if (z.herdT <= 0){ z.herdT = rf(3, 6); G.sounds.push({ x: z.x, y: z.y, r: 5.5, t: G.simT, herd: true }); }
}

// ---------- the eye ----------
function updateEye(){
  let e = $("eyem");
  if (!e){
    e = document.createElement("div"); e.id = "eyem"; e.className = "osd";
    e.innerHTML = `<svg viewBox="0 0 40 26" width="40" height="26"><path d="M2 13 Q20 -3 38 13 Q20 29 2 13Z" fill="none" stroke="currentColor" stroke-width="2.4"/><circle class="pupil" cx="20" cy="13" r="6" fill="currentColor"/></svg><span id="eyetxt">Hidden</span>`;
    document.body.appendChild(e);
  }
  const v = ST.vis, show = G && G.running && P.alive && !P.car;
  e.style.display = show ? "flex" : "none"; if (!show) return;
  const lv = v < .2 ? 0 : v < .42 ? 1 : v < .75 ? 2 : 3;
  const txt = ["Hidden", "Concealed", "Visible", "Exposed"][lv];
  const col = ST.notice > .8 ? "#ff5040" : ST.notice > .3 ? "#f0a040" : ["#7a8a7a", "#8ad08a", "#e8d060", "#f0c8a0"][lv];
  e.style.color = col; e.querySelector(".pupil").setAttribute("r", 2 + lv * 1.6);
  $("eyetxt").textContent = ST.notice > .8 ? "Spotted!" : ST.notice > .3 ? "Noticed..." : txt;
}

// ---------- quiet kills: a knife into an unaware zombie ----------
function takedownTarget(){
  const w = P.weapon && ITEMS[P.weapon.id]; if (!w || w.skill !== "blade") return null;
  let best = null, bd = 1.05;
  for (const z of Z){
    if (!z.alive || z.fake || z.state === "chase" || (z.aware || 0) >= .5) continue;
    const d = Math.hypot(z.x - P.x, z.y - P.y); if (d > bd) continue;
    if (angDiff(Math.atan2(z.y - P.y, z.x - P.x), P.face) > .9) continue;
    best = z; bd = d;
  }
  return best;
}
function tryTakedown(){
  const z = takedownTarget(); if (!z) return false;
  cancelActions(); P.face = Math.atan2(z.y - P.y, z.x - P.x);
  const behind = angDiff(z.face, P.face) < 1.2;
  const ch = .45 + skill("blade") * .05 + (behind ? .25 : 0) + (P.sneaking ? .1 : 0);
  P.swing = { t: 0, dur: .55, hit: true, kind: "stab" }; z.stun = .7;
  setTimeout(() => {
    if (!z.alive) return;
    if (R() < ch){ killZombie(z, "blade"); noise(z.x, z.y, 2); addXP("blade", 6); addXP("sneak", 3); bubble("..."); if (typeof sfxStab === "function") sfxStab(); }
    else { z.hp -= .6; z.aware = 1; z.state = "chase"; z.mem = CFG.zMemory; say("It twists away from the blade!", "#ffd27a"); noise(z.x, z.y, 6); }
  }, 330);
  return true;
}

// ---------- lures: shouting, the horn, things you throw ----------
addEventListener("keydown", e => {
  if (!G || !G.running || G.paused || (document.activeElement && document.activeElement.tagName === "INPUT")) return;
  const k = e.key.toLowerCase();
  if (k === "x" && !P.car){ noise(P.x, P.y, 25); bubble(pick(["HEY!", "OVER HERE!", "HEY! HEY!"])); P.panic = Math.min(100, (P.panic || 0) + 2); if (typeof sfxShout === "function") sfxShout(); }
  if (k === "q" && P.car){ noise(P.car.x, P.car.y, 50); if (typeof sfxHorn === "function") sfxHorn(); }
  if (k === "l" && !P.car) toggleLights();
});
for (const id of ["bottle", "emptycan", "junk_plate", "junk_mug", "junk_jar", "stone"]) if (ITEMS[id]) ITEMS[id].throwable = true;
function landThrow(t){
  const id = t.it.id, x = t.x, y = t.y;
  if (id === "molotov" && typeof igniteArea === "function"){ igniteArea(x, y, 1.6); noise(x, y, 20); if (typeof sfxGlass === "function") sfxGlass(1); return true; }
  if (id === "pipebomb" && typeof explode === "function"){ explode(x, y); return true; }
  const glassy = ["bottle", "junk_plate", "junk_mug", "junk_jar"].includes(id);
  noise(x, y, glassy ? 15 : id === "noisemaker" ? 24 : id === "emptycan" ? 12 : 10);
  if (glassy){ if (typeof sfxGlass === "function") sfxGlass(.6); else sfx.glass(.6); return true; }
  sfx.thump(.35);
  return false;
}
// ---------- light switches ----------
function toggleLights(){
  const [sx, sy] = sideTile(P.x, P.y); const b = inb(sx, sy) && tile[ix(sx, sy)] === T.FLOOR ? bldId[ix(sx, sy)] : -1;
  if (b < 0) return say("There's no light switch out here.");
  const B = buildings[b]; B.lightsOff = !B.lightsOff;
  noise(P.x, P.y, 2); if (typeof sfxClick === "function") sfxClick();
  say(B.lightsOff ? "You switch the lights off." : powerOn(P.x, P.y) ? "You switch the lights on. Anyone outside can see in." : "You flick the switch. Nothing. No power.");
  (G.lightsOff = G.lightsOff || {})[b] = B.lightsOff;
}
// lit rooms are bright at night (and visible from outside); bunkers and dead basements are dark
function darkness(){
  let d = darknessBase();
  if (P && tile){
    const rr = realXY(P.x, P.y); if (rr.lvl < 0) d = Math.max(d, powerOn(P.x, P.y) ? .3 : .86);
    const [sx, sy] = sideTile(P.x, P.y);
    if (inb(sx, sy) && tile[ix(sx, sy)] === T.FLOOR){ const b = bldId[ix(sx, sy)]; if (b >= 0){ const B = buildings[b];
      if (B.kind === "bunker" && !powerOn(P.x, P.y)) d = Math.max(d, .84);
      else if (d > .3 && powerOn(P.x, P.y) && !B.lightsOff && B.kind !== "bunker") d = Math.min(d, .3); } }
  }
  return d;
}
let PLAYER_B = -1, CUR_FEAT = null;
