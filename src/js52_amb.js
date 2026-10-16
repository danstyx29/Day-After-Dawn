// ============================================================
// Part 52 (1.12): ambience that follows where you are.
// Continuous beds: wind in the leaves near trees, water lapping near
// ponds, wind whistling between buildings (louder high up), room tone
// indoors, a low drone underground. One-shots: woodpeckers and thrush
// trills in the woods, frogs at night by water, a ticking clock and a
// dripping tap in houses, distant screams in the first nights and sirens
// in the first days (atmosphere only: like the original's screams and
// barking dogs, these never draw zombies).
// ============================================================
const AMB2 = { env: { trees: 0, water: 0, town: 0 }, envT: 0, beds: null, woodT: 25, trillT: 6, frogT: 4, tickT: 1, tock: false, dripT: 6, screamT: 150, sirenT: 70, thumpT: 20 };
function ambBedsInit(){
  const ac = AMB.ac;
  const mk = (type, f, q) => { const s = ac.createBufferSource(); s.buffer = AUD.nb; s.loop = true; s.playbackRate.value = .7; const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ac.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(AUD.master); s.start(); return { s, fl, g }; };
  AMB2.beds = { leaves: mk("bandpass", 1500, .5), water: mk("lowpass", 420, .7), whistle: mk("bandpass", 720, 10), room: mk("lowpass", 150, .5), drone: mk("lowpass", 65, .9) };
}
function surveyEnv(){
  let trees = 0, water = 0, town = 0, n = 0;
  for (let dy = -7; dy <= 7; dy += 1) for (let dx = -7; dx <= 7; dx += 1){ const t = tile[ix((P.x | 0) + dx, (P.y | 0) + dy)]; n++; if (t === T.TREE) trees++; else if (t === T.WATER) water++; else if (t === T.WALL || t === T.ROAD || t === T.WALK || t === T.LOT) town++; }
  AMB2.env = { trees: Math.min(1, trees / n * 3), water: Math.min(1, water / n * 4), town: Math.min(1, town / n * 1.6) };
}
function playerRoomType(){ const [sx, sy] = sideTile(P.x, P.y), r = rooms[roomId[ix(sx, sy)]]; return r ? r.type : null; }
function ambienceBeds(dt){
  if (!audInit() || !G.running) return;
  if (!AMB2.beds) ambBedsInit();
  const t = atime(), set = (b, v) => AMB2.beds[b].g.gain.setTargetAtTime(AUD.muted ? 0 : v, t, .9);
  AMB2.envT -= dt; if (AMB2.envT <= 0){ AMB2.envT = 1.5; surveyEnv(); }
  const E = AMB2.env, inside = indoorsNow(), lvl = realXY(P.x, P.y).lvl, w = windNow(), hr = (G.min / 60) % 24, night = hr > 20.5 || hr < 5, days = daysSurvived();
  set("leaves", inside ? E.trees * .006 : E.trees * .045 * (.35 + w) * (1 + .45 * Math.sin(G.simT * .31) * Math.sin(G.simT * .13)));
  set("water", inside ? 0 : E.water * .05 * (1 + .3 * Math.sin(G.simT * .8)));
  set("whistle", (inside ? .25 : 1) * (E.town * Math.max(0, w - .35) * .02 + (lvl > 2 ? .006 * (lvl - 2) : 0)));
  set("room", inside && lvl >= 0 ? .012 : 0);
  set("drone", lvl < 0 ? .035 : 0);
  if (AUD.muted) return;
  const one = (pan, vol, muffle) => chain(pan, vol, muffle);
  // woods by day: a woodpecker now and then, thrush trills
  AMB2.woodT -= dt; AMB2.trillT -= dt;
  if (!night && !G.rain && E.trees > .35 && !inside){
    if (AMB2.woodT <= 0){ AMB2.woodT = rf(30, 80); const d = one(rf(-.9, .9), .1); for (let k = 0; k < ri(8, 14); k++) nburst(d, .015, 1800, 3, .5, "bandpass", k * .06); }
    if (AMB2.trillT <= 0){ AMB2.trillT = rf(4, 12); const d = one(rf(-.8, .8), .06), f = rf(2600, 3800); for (let k = 0; k < ri(4, 8); k++) otone(d, f * (1 - k * .03), f * (1 - k * .03) * .9, .05, .2, "sine", k * .07); }
  }
  // frogs at night near water
  AMB2.frogT -= dt;
  if (night && E.water > .1 && !inside && AMB2.frogT <= 0){ AMB2.frogT = rf(1.5, 5); const d = one(rf(-.8, .8), .07 * E.water + .03); const f = rf(170, 260); for (let k = 0; k < ri(2, 4); k++){ otone(d, f, f * .8, .09, .3, "square", k * .14); } }
  // a clock in the living room, a dripping tap
  const rt = inside ? playerRoomType() : null;
  AMB2.tickT -= dt;
  if ((rt === "living" || rt === "bedroom") && AMB2.tickT <= 0){ AMB2.tickT = 1; AMB2.tock = !AMB2.tock; const d = one(.2, .025); nburst(d, .012, AMB2.tock ? 2600 : 3200, 6, .6, "bandpass"); }
  AMB2.dripT -= dt;
  if ((rt === "bathroom" || rt === "kitchen") && AMB2.dripT <= 0){ AMB2.dripT = rf(2.5, 7); const d = one(-.2, .05); otone(d, rf(900, 1300), 500, .08, .4, "sine"); }
  // underground: a thump somewhere above
  AMB2.thumpT -= dt;
  if (lvl < 0 && AMB2.thumpT <= 0){ AMB2.thumpT = rf(18, 45); const d = one(rf(-.6, .6), .08, true); otone(d, 70, 40, .3, .7, "sine"); }
  // the first nights: screams far away; the first days: sirens
  AMB2.screamT -= dt; AMB2.sirenT -= dt;
  if (night && days < 12 && AMB2.screamT <= 0){ AMB2.screamT = rf(140, 320) * (1 + days / 4); const d = one(rf(-1, 1), .05, true), f = rf(500, 700); otone(d, f, f * 1.6, .9, .25, "sawtooth"); nburst(d, .9, 1400, 2, .15, "bandpass"); }
  if (days < 3 && AMB2.sirenT <= 0){ AMB2.sirenT = rf(90, 200); const d = one(rf(-1, 1), .035, true); for (let k = 0; k < 3; k++){ otone(d, 620, 1050, .9, .3, "sine", k * 1.8); otone(d, 1050, 620, .9, .3, "sine", k * 1.8 + .9); } }
}
