// ============================================================
// Part 31: sound. Everything is synthesised; nothing is sampled.
// Sounds from the world pan to where they are, fade with distance
// and are muffled when a wall is in the way.
// ============================================================
const AUD = { ready: false, muted: false, master: null, music: null, nb: null, engine: null, actT: 0, groanT: 2, beatT: 0, breathT: 0, pianoT: 18, stingT: 0, pulse: null, drone: null };
function audInit(){
  if (AUD.ready) return true;
  if (!AMB.ac) return false;
  const ac = AMB.ac;
  AUD.master = ac.createGain(); AUD.master.gain.value = .9;
  AUD.lp = ac.createBiquadFilter(); AUD.lp.type = "lowpass"; AUD.lp.frequency.value = 20000;
  AUD.master.connect(AUD.lp); AUD.lp.connect(ac.destination);
  AUD.music = ac.createGain(); AUD.music.gain.value = .55; AUD.music.connect(AUD.master);
  const len = ac.sampleRate; AUD.nb = ac.createBuffer(1, len, ac.sampleRate); const d = AUD.nb.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AUD.ready = true; musicStart(); return true;
}
const atime = () => AMB.ac.currentTime;
// one-shot helpers routed through a panner and an optional muffle filter
function chain(pan, vol, muffle){
  const ac = AMB.ac, g = ac.createGain(); g.gain.value = vol;
  let head = g, tail = g;
  if (muffle){ const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 700; tail.connect(f); tail = f; }
  if (ac.createStereoPanner){ const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); tail.connect(p); tail = p; }
  tail.connect(AUD.master); return head;
}
function nburst(dest, dur, f, q, vol, type = "lowpass", delay = 0, f2){
  const ac = AMB.ac, s = ac.createBufferSource(); s.buffer = AUD.nb; s.playbackRate.value = rf(.8, 1.2);
  const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const t = atime() + delay;
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + Math.min(.02, dur * .2)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
}
function otone(dest, f0, f1, dur, vol, type = "sine", delay = 0){
  const ac = AMB.ac, o = ac.createOscillator(); o.type = type; const t = atime() + delay;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .05);
}
// where a sound sits relative to you
function spatial(x, y, range = 18){
  const r = realXY(P.x, P.y), sx = x, sy = y;
  const d = Math.hypot(sx - P.x, sy - P.y); if (d > range) return null;
  const pan = clamp(((sx - P.x) - (sy - P.y)) / 10, -1, 1), vol = Math.pow(1 - d / range, 1.6);
  const muffle = d > 1.5 && !los(P.x, P.y, sx, sy);
  return { pan, vol: vol * (muffle ? .55 : 1), muffle };
}
// ---------- footsteps ----------
function surfaceAt(){
  const [sx, sy] = sideTile(P.x, P.y), t = tile[ix(sx, sy)];
  if (G.snow > .3 && t !== T.FLOOR) return "snow";
  if (t === T.FLOOR){ const r = rooms[roomId[ix(sx, sy)]]; return r && ["bedroom", "office", "motelroom", "videoshop", "lobby2", "auditorium"].includes(r.type) ? "carpet" : r && ["kitchen", "bathroom", "ward", "reception", "lobby", "concourse", "grocery", "pharmacy"].includes(r.type) ? "tile" : "wood"; }
  return { [T.GRASS]: "grass", [T.DIRT]: "dirt", [T.ROAD]: "hard", [T.WALK]: "hard", [T.LOT]: "hard", [T.GRAVEL]: "gravel", [T.SAND]: "sand", [T.WATER]: "water" }[t] || "grass";
}
function sfxStep(){
  if (!audInit() || AUD.muted) return;
  const s = surfaceAt(), v = (P.sneaking ? .12 : P.running ? .5 : .28) * (P.traits.has("graceful") ? .7 : 1);
  const d = chain(rf(-.15, .15), v, false);
  switch (s){
    case "grass": nburst(d, .09, 900, .7, .5, "lowpass"); break;
    case "dirt": nburst(d, .08, 600, .9, .6, "lowpass"); otone(d, 90, 60, .06, .25); break;
    case "hard": nburst(d, .05, 2400, 1.2, .5, "bandpass"); otone(d, 140, 90, .04, .3); break;
    case "tile": nburst(d, .04, 3200, 2, .45, "bandpass"); otone(d, 220, 160, .03, .25); break;
    case "wood": otone(d, 120, 70, .08, .55, "triangle"); nburst(d, .05, 800, 1, .3, "bandpass"); break;
    case "carpet": nburst(d, .07, 500, .7, .35, "lowpass"); break;
    case "gravel": for (let k = 0; k < 3; k++) nburst(d, .03, rf(2000, 4000), 2, .4, "bandpass", k * .02); break;
    case "sand": nburst(d, .1, 1400, .6, .35, "lowpass"); break;
    case "snow": nburst(d, .12, 700, 1.4, .5, "bandpass", 0, 300); break;
    case "water": nburst(d, .14, 1200, .8, .55, "bandpass", 0, 500); break;
  }
}
// ---------- world sounds ----------
function sfxGlass(v = 1){ if (!audInit()) return; const d = chain(0, v * .6); nburst(d, .25, 4000, .7, .7, "highpass"); for (let k = 0; k < 7; k++) otone(d, rf(2500, 5200), rf(2400, 5000), rf(.08, .25), .12, "sine", rf(.02, .35)); }
function sfxDoor(open){ if (!audInit()) return; const d = chain(0, .5); if (open){ otone(d, rf(300, 420), rf(180, 260), .35, .06, "sawtooth"); nburst(d, .3, 900, 4, .15, "bandpass"); } else { otone(d, 110, 50, .14, .6, "triangle"); nburst(d, .1, 400, .8, .4); } }
function sfxClick(){ if (!audInit()) return; const d = chain(0, .4); nburst(d, .02, 3000, 3, .6, "bandpass"); }
function sfxShout(){ if (!audInit()) return; const d = chain(0, .5); for (const f of [220, 330, 440]) otone(d, f, f * .8, .45, .08, "sawtooth"); nburst(d, .4, 1200, 3, .2, "bandpass"); }
function sfxHorn(){ if (!audInit()) return; const d = chain(0, .5); otone(d, 392, 392, .7, .18, "square"); otone(d, 494, 494, .7, .14, "square"); }
function sfxBeep(o){ if (!audInit()) return; const s = spatial(o.x + .5, o.y + .5, 40); if (!s) return; const d = chain(s.pan, s.vol * .5, s.muffle); otone(d, 1800, 1800, .18, .2, "square"); otone(d, 1350, 1350, .18, .18, "square", .22); }
function sfxBoom(x, y){ if (!audInit()) return; const s = spatial(x, y, 120) || { pan: 0, vol: .3 }; const d = chain(s.pan, Math.max(.3, s.vol)); nburst(d, 1.4, 1800, .5, 1, "lowpass", 0, 80); otone(d, 70, 25, 1.2, .9, "sine"); }
function sfxWhoosh(x, y){ if (!audInit()) return; const s = spatial(x, y, 40) || { pan: 0, vol: .2 }; const d = chain(s.pan, s.vol); nburst(d, .8, 400, .6, .7, "lowpass", 0, 2400); }
function sfxStab(){ if (!audInit()) return; const d = chain(0, .5); nburst(d, .08, 700, 1.5, .5, "bandpass"); otone(d, 160, 60, .2, .3, "triangle"); }
function sfxCraftDone(){ if (!audInit() || AUD.muted) return; const d = chain(0, .25); otone(d, 660, 660, .12, .15, "triangle"); otone(d, 990, 990, .18, .12, "triangle", .08); }
function zombieGroan(z, intense){
  if (!audInit() || AUD.muted) return;
  const s = spatial(z.x, z.y, intense ? 22 : 16); if (!s) return;
  const ac = AMB.ac, d = chain(s.pan, s.vol * (intense ? .55 : .35), s.muffle), t = atime(), f = (z.pitch ??= rf(60, 105)), dur = intense ? rf(.5, .9) : rf(1, 1.8);
  const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(f * (intense ? 1.3 : 1), t); o.frequency.linearRampToValueAtTime(f * rf(.7, .9), t + dur);
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = rf(4, 7); lg.gain.value = f * .04; lfo.connect(lg); lg.connect(o.frequency);
  const f1 = ac.createBiquadFilter(); f1.type = "bandpass"; f1.frequency.value = rf(450, 650); f1.Q.value = 4;
  const f2 = ac.createBiquadFilter(); f2.type = "bandpass"; f2.frequency.value = rf(900, 1200); f2.Q.value = 5;
  const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + .15); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(d); o.start(t); lfo.start(t); o.stop(t + dur + .05); lfo.stop(t + dur + .05);
  nburst(d, dur * .8, 700, 1.2, .12, "bandpass");
}
// replace the old effects with the richer ones
sfx.glass = v => sfxGlass(v);
sfx.door = () => sfxDoor(false);
const _sfxHit = sfx.hit; sfx.hit = crit => { if (!audInit()) return _sfxHit(crit); const d = chain(0, .6); nburst(d, .12, 300, 1, crit ? .8 : .55); otone(d, 120, 40, .16, .5, "triangle"); nburst(d, .06, 1800, 2, .25, "bandpass"); };
sfx.groan = (v, pan) => {};
function groan(z, vol){ zombieGroan(z, vol > .5); }
// ---------- what you're doing ----------
function actionKind(a){
  if (!a) return null; if (a.craft && a.craft.noise) return "hammer";
  const n = (a.name || "").toLowerCase();
  if (/hammer|nail|barricad|build|wall|forg|smash|strip|break|weld|welding/.test(n)) return "hammer";
  if (/saw|plank/.test(n)) return "saw";
  if (/eat/.test(n)) return "eat"; if (/drink/.test(n)) return "drink";
  if (/sew|patch|stitch|padding|bandana|vest|glove/.test(n)) return "sew";
  if (/dig|plant|harvest|clay|worm/.test(n)) return "dig";
  if (/rip|cut|tear|twist/.test(n)) return "rip";
  if (/cook|boil|stew|soup|fry|roast|charcoal|burn/.test(n)) return "cook";
  if (/reload|loading|round/.test(n)) return "click";
  if (/search|loot|rummag|tak|apart/.test(n)) return "rustle";
  return null;
}
function actionSound(k){
  const d = chain(rf(-.1, .1), .35);
  switch (k){
    case "hammer": otone(d, 220, 90, .07, .7, "triangle"); nburst(d, .05, 2500, 2, .5, "bandpass"); return .45;
    case "saw": nburst(d, .32, 2600, 3, .5, "bandpass", 0, 1800); return .55;
    case "eat": for (let k = 0; k < 3; k++) nburst(d, .04, rf(1500, 3000), 2, .35, "bandpass", k * .05); return .7;
    case "drink": otone(d, 300, 180, .12, .3, "sine"); otone(d, 260, 160, .12, .25, "sine", .3); return .9;
    case "sew": nburst(d, .05, 4000, 4, .3, "bandpass"); return 1;
    case "dig": nburst(d, .2, 900, .8, .6, "lowpass", 0, 300); return .85;
    case "rip": nburst(d, .25, 1800, 1, .55, "bandpass", 0, 900); return .7;
    case "cook": for (let k = 0; k < 4; k++) nburst(d, .03, rf(3000, 6000), 3, .18, "bandpass", k * .07); return .35;
    case "click": nburst(d, .03, 3500, 4, .5, "bandpass"); return .4;
    case "rustle": nburst(d, .18, 2000, .6, .35, "bandpass"); return .5;
  }
  return 1;
}
// ---------- the engine ----------
function engineTick(){
  const c = P.car, ac = AMB.ac;
  if (c && c.on && !AUD.muted){
    if (!AUD.engine){ const o = ac.createOscillator(); o.type = "triangle"; const o2 = ac.createOscillator(); o2.type = "sine"; const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 260; f.Q.value = .4; const g = ac.createGain(); g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(AUD.master); o.start(); o2.start(); AUD.engine = { o, o2, g, f }; }
    const sp = Math.abs(c.v), f0 = 38 + sp * 7 + (c.cond < 30 ? Math.sin(G.simT * 13) * 4 : 0);
    AUD.engine.o.frequency.setTargetAtTime(f0, atime(), .1); AUD.engine.o2.frequency.setTargetAtTime(f0 * .5, atime(), .1);
    AUD.engine.f.frequency.setTargetAtTime(200 + sp * 32 + (typeof mufflerF === "function" ? (mufflerF(c) - 1) * 300 : 0), atime(), .35);
    AUD.engine.g.gain.setTargetAtTime(.056 + sp * .0045, atime(), .3);
  } else if (AUD.engine){ AUD.engine.g.gain.setTargetAtTime(0, atime(), .1); const e = AUD.engine; AUD.engine = null; setTimeout(() => { try { e.o.stop(); e.o2.stop(); } catch (x) {} }, 600); }
}
// ---------- music: a quiet drone, a pulse that rises with danger, a stinger ----------
function musicStart(){
  const ac = AMB.ac;
  const mk = (f, type, vol) => { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; const g = ac.createGain(); g.gain.value = vol; o.connect(g); return { o, g }; };
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600; lp.connect(AUD.music);
  const a = mk(55, "triangle", .05), b = mk(82.4, "triangle", .035), c = mk(55.3, "sine", .05);
  for (const x of [a, b, c]){ x.g.connect(lp); x.o.start(); }
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .05; lg.gain.value = 250; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
  AUD.drone = { lp, a, b, c };
  const pg = ac.createGain(); pg.gain.value = 0; pg.connect(AUD.music);
  const p1 = mk(41.2, "sawtooth", .08), p2 = mk(43.65, "sawtooth", .06); const pl = ac.createBiquadFilter(); pl.type = "lowpass"; pl.frequency.value = 220;
  p1.g.connect(pl); p2.g.connect(pl); pl.connect(pg); p1.o.start(); p2.o.start();
  const trem = ac.createOscillator(), tg = ac.createGain(); trem.frequency.value = 2; tg.gain.value = .5; trem.connect(tg); tg.connect(pg.gain); trem.start();
  AUD.pulse = { g: pg, trem };
}
function musicTick(dt){
  if (!AUD.pulse) return;
  const chasing = Z.reduce((n, z) => n + (z.alive && z.state === "chase" && Math.abs(z.x - P.x) < 30 && Math.abs(z.y - P.y) < 30 ? 1 : 0), 0);
  const target = AUD.muted ? 0 : Math.min(.55, chasing * .09);
  AUD.pulse.g.gain.setTargetAtTime(target, atime(), chasing ? .8 : 3);
  AUD.pulse.trem.frequency.setTargetAtTime(1.5 + Math.min(4, chasing * .4), atime(), 1);
  AUD.drone.lp.frequency.setTargetAtTime(chasing ? 900 : 600, atime(), 2);
  AUD.music.gain.setTargetAtTime(AUD.muted ? 0 : .55, atime(), .3);
  // a few lonely notes when it's quiet
  AUD.pianoT -= dt;
  if (AUD.pianoT <= 0 && !chasing){ AUD.pianoT = rf(16, 40); const notes = [220, 261.6, 293.7, 329.6, 392, 440, 523.3]; let t = 0; for (let k = 0; k < ri(2, 5); k++){ const f = pick(notes); piano(f, t); t += rf(.5, 1.2); } }
  AUD.stingT -= dt;
}
function piano(f, delay){ const d = AUD.music; otone(d, f, f, 2.4, .06, "sine", delay); otone(d, f * 2, f * 2, 1.4, .02, "sine", delay); otone(d, f * 3, f * 3, .8, .008, "triangle", delay); }
function musicStinger(){
  if (!audInit() || AUD.muted || AUD.stingT > 0) return; AUD.stingT = 6;
  const d = AUD.music; for (const f of [146.8, 155.6, 220, 233]) otone(d, f, f * .97, 1.6, .07, "sawtooth"); nburst(d, 1.2, 300, .5, .25, "lowpass", 0, 2000);
}
// ---------- the body ----------
function bodyTick(dt){
  AUD.beatT -= dt; AUD.breathT -= dt;
  if ((P.panic || 0) > 45 && AUD.beatT <= 0){ AUD.beatT = Math.max(.42, 1.1 - P.panic / 140); const d = chain(0, .5); otone(d, 60, 40, .12, .5, "sine"); otone(d, 55, 38, .12, .35, "sine", .16); }
  if (P.endurance < .3 && P.alive && AUD.breathT <= 0){ AUD.breathT = 1.4; const d = chain(0, .25); nburst(d, .5, 900, .6, .25, "bandpass", 0, 1400); nburst(d, .6, 700, .6, .2, "bandpass", .65, 400); }
}
function audioTick(dt){
  if (!audInit()) return;
  AUD.lp.frequency.setTargetAtTime(P.traits.has("hardhear") ? 1100 : 20000, atime(), .5);
  AUD.master.gain.setTargetAtTime(AUD.muted ? 0 : .9, atime(), .1);
  if (AUD.muted) { engineTick(); return; }
  // what you're doing
  const k = P.action && !P.action.quiet ? actionKind(P.action) : null;
  if (k){ AUD.actT -= dt; if (AUD.actT <= 0) AUD.actT = actionSound(k); } else AUD.actT = 0;
  // zombies nearby groan now and then
  AUD.groanT -= dt;
  if (AUD.groanT <= 0){
    AUD.groanT = rf(1.2, 3.5);
    let best = null, bd = 16;
    for (const z of Z){ if (!z.alive || z.fake) continue; const d = Math.abs(z.x - P.x) + Math.abs(z.y - P.y); if (d < bd && R() < .5){ bd = d; best = z; } }
    if (best) zombieGroan(best, best.state === "chase");
  }
  engineTick(); bodyTick(dt); musicTick(dt);
}
addEventListener("keydown", e => { if ((e.key === "n" || e.key === "N") && G && G.running && !(document.activeElement && document.activeElement.tagName === "INPUT")){ AUD.muted = !AUD.muted; say(AUD.muted ? "Sound off (N)." : "Sound on."); } });
