// ============================================================
// Part 37: living animals.
// Wild: deer, rabbits and crows. Farms: cows, pigs, sheep, chickens.
// They graze, wander, notice you (sight and sound) and bolt. Zombies
// leave them alone, as in the original, but farm animals call out
// and the noise draws zombies in. Hunt them, butcher the carcass
// (a butcher hook gives the full yield and the hide), collect eggs,
// milk cows, shear sheep.
// ============================================================
Object.assign(SKILLS, { butchering: { n: "Butchering", grp: "Survival" }, husbandry: { n: "Animal Care", grp: "Survival" } });
const SPECIES = {
  deer:    { n: "deer", hp: 2.6, walk: .9, run: 4.6, flee: 15, wild: true, meat: ["rawsteak", 8], hide: "hide", h: 26 },
  rabbit:  { n: "rabbit", hp: .5, walk: .7, run: 4.2, flee: 6, wild: true, meat: ["rawsmallmeat", 3], hide: "hidesmall", h: 6 },
  crow:    { n: "crow", hp: .2, walk: .5, run: 5, flee: 6, wild: true, cosmetic: true, h: 4 },
  cow:     { n: "cow", hp: 6, walk: .4, run: 2.4, flee: 3, meat: ["rawsteak", 14], hide: "hide", call: "moo", h: 30 },
  pig:     { n: "pig", hp: 4, walk: .45, run: 2.6, flee: 3, meat: ["rawsteak", 9], hide: "hidesmall", call: "oink", h: 14 },
  sheep:   { n: "sheep", hp: 3, walk: .45, run: 2.6, flee: 4, meat: ["rawsteak", 6], hide: "hidesmall", call: "baa", h: 18 },
  chicken: { n: "chicken", hp: .4, walk: .5, run: 2.2, flee: 2.5, meat: ["rawsmallmeat", 2], call: "cluck", h: 7 },
};
Object.assign(ITEMS, {
  hide: { n: "Animal hide", w: 2, cat: "mat", tags: ["hide"] }, hidesmall: { n: "Small hide", w: .4, cat: "mat", tags: ["hide"] },
  wool: { n: "Raw wool", w: .3, cat: "mat", tags: [] }, egg: { n: "Egg", w: .06, cat: "food", tags: [], hun: .05, fresh: 12, sick: .08 },
  milkb: { n: "Bottle of milk", w: 1, cat: "drink", tags: [], thi: -.25, hun: .05, fresh: 3, empty: "bottle" },
  boiledegg: { n: "Boiled egg", w: .06, cat: "food", tags: [], hun: .07, unh: -2, fresh: 5 },
});
for (const k in ITEMS){ ITEMS[k].id = k; ITEMS[k].tags = ITEMS[k].tags || []; }
Object.assign(ICON, { hide: ["rags", "#8a6a48"], hidesmall: ["rags", "#a8846a"], wool: ["rags", "#e8e4dc"], egg: ["fruit", "#f0e8d8"], milkb: ["bottle", "#f4f4f0"], boiledegg: ["fruit", "#f8f0d8"] });
GROUPS.soupable.push("egg"); GROUPS.fryable.push("egg"); GROUPS.saladable.push("boiledegg");
RC.push(
  { id: "hidestrips", n: "Cut a hide into leather strips", cat: "Tailoring", in: [["hide", 1]], tools: ["cut"], out: [["leatherstrip", 4]], xp: { tailoring: 3 }, time: 6 },
  { id: "hidestrips2", n: "Cut a small hide into strips", cat: "Tailoring", in: [["hidesmall", 1]], tools: ["cut"], out: [["leatherstrip", 1]], xp: { tailoring: 1 }, time: 3 },
  { id: "spinwool", n: "Spin wool into thread", cat: "Tailoring", in: [["wool", 1]], skill: { tailoring: 1 }, out: [["thread", 1, { uses: 6 }]], xp: { tailoring: 3 }, time: 8 },
  { id: "boilegg", n: "Boil eggs", cat: "Cooking", in: [["egg", 1], ["water", 1]], station: "fire", out: [["boiledegg", 1]], xp: { cooking: 2 }, time: 6 },
);
ALLR.push(...RC.slice(-4));
OBJ.butcherhook = { n: "Butcher hook", block: true, h: 34, col: "#6a4a2e" };
OBJ.trough = { n: "Water trough", block: true, h: 8, col: "#6a6e72" };
BL.push({ id: "b_hook", n: "Butcher hook", cat: "Build", in: [["plank", 2], ["nails", 3], ["twine", 1]], tools: ["hammer"], skill: { carpentry: 3 }, obj: "butcherhook", time: 8, xp: { carpentry: 10 }, noise: 7, d: "Butcher a carcass next to it for the full yield and the hide." });
let AN = [];
function newAnimal(sp, x, y, pen){ return { sp, x, y, face: rf(0, 6.28), st: "graze", t: rf(1, 5), hp: SPECIES[sp].hp, anim: 0, pen: pen || null, buck: sp === "deer" && R() < .4, col: sp === "cow" ? (R() < .5 ? "holstein" : R() < .5 ? "angus" : "simmental") : null, callT: rf(10, 60), lact: sp === "cow" && R() < .5, woolT: 0, milkT: 0, eggT: 0, eggs: 0 }; }
// ---------- where they live ----------
function placeAnimals(R0){
  const free = (x, y) => inb(x, y) && [T.GRASS, T.DIRT].includes(tile[ix(x, y)]) && !objs.has(ix(x, y)) && bldId[ix(x, y)] < 0;
  const spot = (tries = 40) => { for (let k = 0; k < tries; k++){ const x = ri(R0.x0 + 4, R0.x1 - 4, rnd), y = ri(R0.y0 + 4, R0.y1 - 4, rnd); if (free(x, y) && !ZONE[ix(x, y)]) return [x, y]; } return null; };
  if (R0.kind === "wild" || R0.kind === "rural"){
    const groups = R0.kind === "wild" ? ri(1, 3, rnd) : ri(0, 2, rnd);
    for (let g = 0; g < groups; g++){ const s = spot(); if (!s) continue; const n = ri(2, 4, rnd); for (let k = 0; k < n; k++) AN.push(newAnimal("deer", s[0] + rf(-2, 2, rnd) + .5, s[1] + rf(-2, 2, rnd) + .5)); }
    for (let k = 0, n = ri(3, 8, rnd); k < n; k++){ const s = spot(); if (s) AN.push(newAnimal("rabbit", s[0] + .5, s[1] + .5)); }
  }
  for (let f = 0, n = ri(1, 3, rnd); f < n; f++){ const s = spot(); if (!s) continue; for (let k = 0, m = ri(3, 7, rnd); k < m; k++) AN.push(newAnimal("crow", s[0] + rf(-1.5, 1.5, rnd) + .5, s[1] + rf(-1.5, 1.5, rnd) + .5)); }
  const mine = PENDING_PENS.filter(p => p.x0 >= R0.x0 - 30 && p.x0 <= R0.x1 + 30 && p.y0 >= R0.y0 - 30 && p.y0 <= R0.y1 + 30); PENDING_PENS = PENDING_PENS.filter(p => !mine.includes(p));
  for (const p of mine){
    for (let k = 0; k < p.n; k++) AN.push(newAnimal(p.sp, rf(p.x0 + 1, p.x1, rnd), rf(p.y0 + 1, p.y1, rnd), { x0: p.x0 + 1, y0: p.y0 + 1, x1: p.x1, y1: p.y1 }));
  }
}
// a fenced pen next to a farm, with hay and water
let PENDING_PENS = [];
function farmPen(lx, ly, x1, y1){
  if (rnd() > .65) return;
  const px0 = lx, py0 = y1 + 2, px1 = lx + 11, py1 = y1 + 9;
  for (let y = py0; y <= py1; y++) for (let x = px0; x <= px1; x++){ const i = ix(x, y); if (!inb(x, y) || ![T.GRASS, T.DIRT, T.TREE].includes(tile[i]) || objs.has(i) || bldId[i] >= 0) return; }
  for (let y = py0; y <= py1; y++) for (let x = px0; x <= px1; x++){ tile[ix(x, y)] = rnd() < .3 ? T.DIRT : T.GRASS; ZONE[ix(x, y)] = 1; }
  for (let x = px0; x <= px1; x++) for (const y of [py0, py1]){ if (y === py0 && x === px0 + 5) continue; const o = placeObj("fence", x, y, -1); o.dir = null; o.horiz = true; }
  for (let y = py0 + 1; y < py1; y++) for (const x of [px0, px1]){ const o = placeObj("fence", x, y, -1); o.dir = null; o.horiz = false; }
  const sp = pick(["cow", "cow", "pig", "sheep", "chicken", "chicken"], rnd);
  for (const [x, y, t] of [[px0 + 2, py0 + 2, "hay"], [px1 - 2, py1 - 2, "trough"]]){ const o = placeObj(t, x, y, -1); delete o.dir; }
  PENDING_PENS.push({ sp, x0: px0, y0: py0, x1: px1 - 1, y1: py1 - 1, n: sp === "chicken" ? ri(4, 8, rnd) : ri(2, 5, rnd) });
}
// ---------- behaviour ----------
let anClock = 0;
function stepAnimals(dt){
  anClock += dt; if (anClock < .1) return; const d0 = anClock; anClock = 0;
  for (const a of AN){
    if (a.dead || a.gone) { if (a.gone && G.simT > a.gone){ a.gone = 0; a.x = a.hx; a.y = a.hy; a.fly = 0; a.st = "graze"; } continue; }
    const dx = P.x - a.x, dy = P.y - a.y, d = Math.abs(dx) + Math.abs(dy); if (d > 70) continue;
    const S2 = SPECIES[a.sp];
    a.t -= d0;
    if (a.fly){ a.fly += d0; a.x += Math.cos(a.face) * S2.run * d0; a.y += Math.sin(a.face) * S2.run * d0; if (a.fly > 4){ a.gone = G.simT + rf(40, 90); a.fly = 0; } continue; }
    // what scares it
    let threat = null;
    if (P.alive && !P.car){
      const pd = Math.hypot(dx, dy), range = S2.flee * (P.sneaking ? .5 : 1) * (ST.vis > .6 ? 1 : .8);
      if (pd < range && (pd < 2 || los(a.x, a.y, P.x, P.y))) threat = [P.x, P.y];
    }
    if (P.car && Math.hypot(dx, dy) < 8) threat = [P.x, P.y];
    if (!threat) for (const s of G.sounds) if (s.t > G.simT - .5 && s.r > 3 && (s.x - a.x) ** 2 + (s.y - a.y) ** 2 < (s.r * 1.3) ** 2){ threat = [s.x, s.y]; break; }
    if (!threat && (S2.wild || a.sp === "chicken") && typeof buckets !== "undefined"){ const bx = a.x | 0, by = a.y | 0;
      for (let oy = -3; oy <= 3 && !threat; oy++) for (let ox = -3; ox <= 3; ox++){ const bk = buckets.get((bx + ox) * 1000 + by + oy); if (!bk) continue; const z = bk.find(q => q.alive); if (z){ threat = [z.x, z.y]; break; } } }
    if (threat){
      if (a.sp === "crow"){ a.fly = .01; a.hx = a.hx ?? a.x; a.hy = a.hy ?? a.y; a.face = Math.atan2(a.y - threat[1], a.x - threat[0]) + rf(-.4, .4); if (typeof animalCall === "function") animalCall(a, "flap"); continue; }
      if (a.st !== "flee" && typeof animalCall === "function" && (a.sp === "deer" || S2.call)) animalCall(a, a.sp === "deer" ? "snort" : S2.call);
      a.st = "flee"; a.t = rf(3, 6); a.face = Math.atan2(a.y - threat[1], a.x - threat[0]) + rf(-.5, .5);
    }
    let spd = 0;
    if (a.st === "flee"){ spd = S2.run * (a.hp < S2.hp * .5 ? .6 : 1); if (a.t <= 0){ a.st = "graze"; a.t = rf(2, 6); } }
    else if (a.st === "walk"){ spd = S2.walk; if (a.t <= 0){ a.st = "graze"; a.t = rf(3, 9); } }
    else if (a.t <= 0){ a.st = "walk"; a.t = rf(1.5, 4); a.face = a.pen ? Math.atan2((a.pen.y0 + a.pen.y1) / 2 - a.y + rf(-3, 3), (a.pen.x0 + a.pen.x1) / 2 - a.x + rf(-3, 3)) : rf(0, 6.28); }
    if (spd){
      let nx = Math.cos(a.face) * spd * d0, ny = Math.sin(a.face) * spd * d0;
      if (a.pen){ if (a.x + nx < a.pen.x0 || a.x + nx > a.pen.x1){ a.face = Math.PI - a.face; nx = -nx; } if (a.y + ny < a.pen.y0 || a.y + ny > a.pen.y1){ a.face = -a.face; ny = -ny; } }
      const ox = a.x, oy = a.y; moveEnt(a, nx, ny, "z", a.sp === "cow" ? .45 : a.sp === "deer" ? .35 : .2);
      if (Math.hypot(a.x - ox, a.y - oy) < spd * d0 * .3){ a.face += rf(1, 2.5); }
      a.anim += Math.hypot(a.x - ox, a.y - oy) * (a.st === "flee" ? 3.2 : 4.5);
    }
    // farm animals call out, and the dead hear it
    if (S2.call){ a.callT -= d0; if (a.callT <= 0){ a.callT = rf(25, 70); if (typeof animalCall === "function") animalCall(a, S2.call); noise(a.x, a.y, a.sp === "chicken" ? 5 : 8); } }
    if (a.sp === "chicken" && G.min > (a.eggT || 0)){ a.eggT = G.min + 1440 * rf(.8, 1.3); a.eggs = Math.min(3, (a.eggs || 0) + 1); }
  }
}
// ---------- hunting ----------
function hurtAnimal(a, dmg){
  a.hp -= dmg; fxBlood(a.x, a.y, 5, P.face); addBlood(a.x, a.y, 1);
  if (a.hp <= 0){ a.dead = true; a.st = "dead"; a.deadT = G.min; addXP(a.sp === "deer" ? "aiming" : "sneak", 0); say(`The ${SPECIES[a.sp].n} goes down.`); return; }
  a.st = "flee"; a.t = rf(4, 7); a.face = Math.atan2(a.y - P.y, a.x - P.x);
}
function swingAnimals(w, reach){
  let best = null, bd = reach;
  for (const a of AN){ if (a.dead || a.gone || a.fly || SPECIES[a.sp].cosmetic) continue; const d = Math.hypot(a.x - P.x, a.y - P.y); if (d < bd && angDiff(Math.atan2(a.y - P.y, a.x - P.x), P.face) < 1.1 && reachClear(P.x, P.y, a.x, a.y)){ bd = d; best = a; } }
  if (!best) return false;
  hurtAnimal(best, rf(w.dmg[0], w.dmg[1]) * (1 + .1 * skill(w.skill)) * dmgMult()); sfx.hit(false); return true;
}
function rayAnimals(ox, oy, a, end, g){
  for (const an of AN){
    if (an.dead || an.gone || an.fly || SPECIES[an.sp].cosmetic) continue;
    const dx = an.x - ox, dy = an.y - oy, along = dx * Math.cos(a) + dy * Math.sin(a), off = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a));
    if (along > 0 && along < end && off < (an.sp === "rabbit" || an.sp === "chicken" ? .25 : .45)){ hurtAnimal(an, rf(g.dmg[0], g.dmg[1]) * 1.6); return true; }
  }
  return false;
}
// ---------- what you can do with them ----------
function animalOptions(out){
  for (const a of AN){
    if (a.gone || a.fly) continue; const d = Math.hypot(a.x - P.x, a.y - P.y); if (d > 1.6) continue;
    const S2 = SPECIES[a.sp], name = S2.n;
    if (a.dead){
      if (a.butchered) continue;
      const hook = [...Array(25)].some((_, k) => { const o = objs.get(ix(Math.floor(P.x) + (k % 5) - 2, Math.floor(P.y) + Math.floor(k / 5) - 2)); return o && o.type === "butcherhook"; });
      const knife = allCarried().some(it => matchesKey(it, "cut"));
      if (S2.meat) out.push({ label: knife ? `Butcher the ${name}${hook ? " on the hook" : " on the ground"}` : `Butcher the ${name} (needs a knife)`, off: !knife, fn: () => act("Butchering", a.sp === "cow" ? 20 : a.sp === "deer" ? 15 : 6, () => {
        const lvl = skill("butchering"), k = (hook ? 1 : .6) * (.8 + lvl * .04), n = Math.max(1, Math.round(S2.meat[1] * k));
        for (let q = 0; q < n; q++){ const it = makeItem(S2.meat[0]); it.age = 0; giveItem(it); }
        if (hook && S2.hide) giveItem(makeItem(S2.hide));
        a.butchered = true; addBlood(a.x, a.y, 3); addXP("butchering", 8); say(`${n} pieces of meat${hook && S2.hide ? " and the hide" : ""}.${hook ? "" : " A butcher hook would give more, and the hide."}`);
      }, { noise: 2, noiseEvery: 3 }) });
      continue;
    }
    if (a.sp === "chicken" && a.eggs > 0) out.push({ label: `Collect eggs (${a.eggs})`, fn: () => { for (let q = 0; q < a.eggs; q++){ const it = makeItem("egg"); it.age = 0; giveItem(it); } a.eggs = 0; addXP("husbandry", 2); } });
    if (a.sp === "cow" && a.lact && G.min > (a.milkT || 0)){ const b = allCarried().find(it => it.id === "bottle"); out.push({ label: b ? "Milk the cow" : "Milk the cow (needs an empty bottle)", off: !b, fn: () => act("Milking", 8, () => { removeItem(b); const m = makeItem("milkb"); m.age = 0; giveItem(m); a.milkT = G.min + 1440; addXP("husbandry", 4); }) }); }
    if (a.sp === "sheep" && G.min > (a.woolT || 0)){ const s = allCarried().some(it => matchesKey(it, "scissors")); out.push({ label: s ? "Shear the sheep" : "Shear the sheep (needs scissors)", off: !s, fn: () => act("Shearing", 12, () => { for (let q = 0; q < ri(2, 4); q++) giveItem(makeItem("wool")); a.woolT = G.min + 1440 * 10; addXP("husbandry", 6); }) }); }
    if (S2.call && !S2.wild) out.push({ label: `Pet the ${name}`, fn: () => { P.boredom = Math.max(0, (P.boredom || 0) - 8); P.unhappy = Math.max(0, (P.unhappy || 0) - 3); say(`The ${name} doesn't seem to mind.`); addXP("husbandry", 1); } });
  }
}
// ---------- drawing ----------
function drawAnimal(a){
  const S2 = SPECIES[a.sp], c = Math.cos(a.face), s = Math.sin(a.face), px = -s, py = c;
  const P3 = (f, l, z) => [a.x + c * f + px * l, a.y + s * f + py * l, z], L = (p, q, col, w) => line3(p, q, col, w, 1);
  const [sx, sy] = S(a.x, a.y, 0);
  if (a.fly){ const z = 4 + a.fly * 14, flap = Math.sin(G.simT * 22) * 4 * zoom, [bx, by] = S(a.x, a.y, z); ctx.fillStyle = "#1a1a1e"; ctx.beginPath(); ctx.ellipse(bx, by, 3 * zoom, 2 * zoom, 0, 0, 7); ctx.fill(); ctx.strokeStyle = "#1a1a1e"; ctx.lineWidth = 1.4 * zoom; ctx.beginPath(); ctx.moveTo(bx - 6 * zoom, by - flap); ctx.lineTo(bx, by); ctx.lineTo(bx + 6 * zoom, by - flap); ctx.stroke(); return; }
  const big = { cow: 1.2, deer: .9, pig: .85, sheep: .8 }[a.sp] || .3;
  ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(sx, sy, 10 * zoom * big + 3, 5 * zoom * big + 1.5, 0, 0, 7); ctx.fill();
  if (a.dead){
    const col = { deer: "#8a6a48", rabbit: "#8a7a6a", cow: a.col === "angus" ? "#1e1e20" : a.col === "simmental" ? "#8a5a34" : "#e8e4dc", pig: "#d8a090", sheep: "#e0dcd0", chicken: "#f0ece4", crow: "#1e1e22" }[a.sp];
    L(P3(-.35 * big, 0, 2), P3(.35 * big, 0, 2), col, 8 * big + 2); L(P3(.35 * big, 0, 2), P3(.6 * big, .2, 1), col, 4 * big + 1);
    if (a.butchered){ ctx.fillStyle = "rgba(120,20,16,.6)"; ctx.beginPath(); ctx.ellipse(sx, sy, 8 * zoom * big + 2, 4 * zoom * big + 1, 0, 0, 7); ctx.fill(); }
    return;
  }
  const ph = a.anim, mv = a.st === "flee" || a.st === "walk", graze = a.st === "graze";
  const leg = (f, l, off) => { const sw = mv ? Math.sin(ph + off) * .14 : 0; return [P3(f, l, S2.h * .55), P3(f + sw, l, 0)]; };
  switch (a.sp){
    case "deer": case "cow": {
      const col = a.sp === "deer" ? "#8a6a48" : a.col === "angus" ? "#1e1e20" : a.col === "simmental" ? "#8a5a34" : "#e8e4dc";
      const body = a.sp === "deer" ? .36 : .5, zB = S2.h * .62, wB = a.sp === "deer" ? 13 : 20;
      for (const [f, l, o] of [[-body * .8, -.1, 0], [-body * .8, .1, Math.PI], [body * .8, -.1, Math.PI], [body * .8, .1, 0]]){ const [p, q] = leg(f, l, o); L(p, q, shade(col, .75), a.sp === "deer" ? 2.2 : 3.4); }
      L(P3(-body, 0, zB), P3(body, 0, zB), col, wB);
      if (a.sp === "cow" && a.col === "holstein"){ for (const [f, l] of [[-.2, .05], [.15, -.06], [.32, .04]]) topEl(a.x + c * f + px * l, a.y + s * f + py * l, .08, zB + 2, "#1e1e20", 1); }
      L(P3(-body * .9, 0, zB + 1), P3(body * .9, 0, zB + 1), shade(col, 1.15), wB * .35);
      const hz = graze ? S2.h * .2 : S2.h * (a.sp === "deer" ? 1 : .8), hf = body + (graze ? .3 : .2);
      L(P3(body, 0, zB + 2), P3(hf, 0, hz), col, a.sp === "deer" ? 5.5 : 9);
      topEl(a.x + c * (hf + .06), a.y + s * (hf + .06), a.sp === "deer" ? .09 : .13, hz, shade(col, .9), 1);
      if (a.sp === "deer"){ L(P3(-body - .05, 0, zB + 2), P3(-body - .12, 0, zB + 4), "#f0ece4", 2.4); if (a.buck && !graze) for (const k of [-1, 1]){ L(P3(hf, .03 * k, hz + 2), P3(hf - .05, .12 * k, hz + 10), "#6a5a44", 1.2); L(P3(hf - .03, .08 * k, hz + 6), P3(hf + .05, .14 * k, hz + 9), "#6a5a44", 1); } }
      if (a.sp === "cow") for (const k of [-1, 1]) L(P3(hf, .04 * k, hz + 2), P3(hf, .1 * k, hz + 5), "#e8e0c8", 1.2);
      break;
    }
    case "pig": case "sheep": {
      const col = a.sp === "pig" ? "#d8a090" : "#e4e0d4", zB = S2.h * .65;
      for (const [f, l, o] of [[-.22, -.08, 0], [-.22, .08, Math.PI], [.22, -.08, Math.PI], [.22, .08, 0]]){ const [p, q] = leg(f, l, o); L(p, q, a.sp === "pig" ? "#c88878" : "#3a3430", 2); }
      if (a.sp === "sheep") for (let k = 0; k < 5; k++) topEl(a.x + c * (-.22 + k * .11), a.y + s * (-.22 + k * .11), .19, zB + (k % 2), col, 1);
      else L(P3(-.28, 0, zB), P3(.26, 0, zB), col, 15);
      const hf = .38, hz = graze ? 3 : zB;
      topEl(a.x + c * hf, a.y + s * hf, a.sp === "pig" ? .1 : .08, hz, a.sp === "pig" ? "#d09080" : "#3a3430", 1);
      if (a.sp === "pig") topEl(a.x + c * (hf + .08), a.y + s * (hf + .08), .05, hz, "#c87a6a", 1);
      break;
    }
    case "rabbit": { const hop = mv ? Math.abs(Math.sin(ph)) * 5 : 0; topEl(a.x, a.y, .12, 3 + hop, "#8a7a6a", 1); topEl(a.x + c * .12, a.y + s * .12, .07, 6 + hop, "#8a7a6a", 1); for (const k of [-1, 1]) L(P3(.12, .02 * k, 8 + hop), P3(.08, .03 * k, 14 + hop), "#8a7a6a", 1.4); topEl(a.x - c * .12, a.y - s * .12, .04, 4 + hop, "#f0ece4", 1); break; }
    case "chicken": { const peck = graze ? Math.max(0, Math.sin(G.simT * 6 + a.x * 3)) * 3 : 0; topEl(a.x, a.y, .1, 4, "#f0ece4", 1); L(P3(.06, 0, 5), P3(.12, 0, 8 - peck), "#f0ece4", 3); topEl(a.x + c * .14, a.y + s * .14, .03, 9 - peck, "#c83a2a", 1); L(P3(-.02, -.03, 3), P3(-.02, -.03, 0), "#e8a040", 1); L(P3(-.02, .03, 3), P3(-.02, .03, 0), "#e8a040", 1); break; }
    case "crow": { const peck = Math.max(0, Math.sin(G.simT * 5 + a.y * 2)) * 2; topEl(a.x, a.y, .07, 2.5, "#1e1e22", 1); L(P3(.04, 0, 3), P3(.1, 0, 4 - peck), "#1e1e22", 2.4); L(P3(-.05, 0, 3), P3(-.12, 0, 3.5), "#1e1e22", 1.6); break; }
  }
}
function drawDecor7(o, dim, a){
  const x = o.x, y = o.y, cx = x + .5, cy = y + .5, sd = c => shade(c, dim);
  if (o.type === "butcherhook"){ line3([cx, cy, 0], [cx, cy, 32], sd("#6a4a2e"), 3, a); line3([cx, cy, 32], [cx + .3, cy, 32], sd("#6a4a2e"), 2.4, a); line3([cx + .3, cy, 32], [cx + .3, cy, 24], sd("#8a8e92"), 1.2, a); return true; }
  if (o.type === "trough"){ boxW(x + .1, y + .3, x + .9, y + .7, 0, 7, sd("#6a6e72"), a); topR(x + .14, y + .34, x + .86, y + .66, 7.1, "#4a6a7a", a); return true; }
  return drawDecor8(o, dim, a);
}
// ---------- saving ----------
function animalsSave(){ return AN.filter(a => !(a.dead && a.butchered && G.min - a.deadT > 1440 * 3)).map(a => [a.sp, +a.x.toFixed(2), +a.y.toFixed(2), +a.hp.toFixed(2), a.dead ? 1 : 0, a.butchered ? 1 : 0, a.pen ? [a.pen.x0, a.pen.y0, a.pen.x1, a.pen.y1] : 0, a.buck ? 1 : 0, a.col, a.lact ? 1 : 0, Math.round(a.milkT || 0), Math.round(a.woolT || 0), a.eggs || 0, Math.round(a.deadT || 0)]); }
function animalsLoad(arr){
  if (!arr) return;
  AN = arr.map(r => { const a = newAnimal(r[0], r[1], r[2], r[6] ? { x0: r[6][0], y0: r[6][1], x1: r[6][2], y1: r[6][3] } : null); a.hp = r[3]; a.dead = !!r[4]; a.butchered = !!r[5]; a.buck = !!r[7]; a.col = r[8]; a.lact = !!r[9]; a.milkT = r[10]; a.woolT = r[11]; a.eggs = r[12]; a.deadT = r[13]; if (a.dead) a.st = "dead"; return a; });
}
