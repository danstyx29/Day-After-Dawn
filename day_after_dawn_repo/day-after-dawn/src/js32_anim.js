// ============================================================
// Part 32: animation. Poses for what you're doing, sitting and
// sleeping, flinching when hit, zombies pounding on doors and
// limping, and a cheap stand-in for zombies when zoomed far out.
// ============================================================
const TOOLART = { hammer: "hammer", saw: "saw", dig: "shovel", rip: "knife", sew: null, rustle: null, eat: null, drink: null, cook: "pan", click: null, fish: null };
function poseFor(){
  const o = {};
  if (P.sleeping) return { lying: true };
  if (P.sitting) return { mode: "sneak", lean: -.05, move: 0 };
  if (P.flinchT > 0) o.tip = -.3 * (P.flinchT / .3);
  const a = P.action; if (!a || a.quiet){ if (!P.moving && !P.sitting) o.headTilt = idleLook(); return o; }
  const k = a.fish ? "fish" : actionKind(a), t = G.simT;
  switch (k){
    case "hammer": case "saw": { const tool = TOOLART[k]; return Object.assign(o, { mode: k === "saw" ? "sneak" : "walk", lean: .25, weapon: tool && ITEMS[tool] ? weaponArt(tool) : null, swing: { kind: "swing", p: (t * (k === "saw" ? 1.6 : 2.2)) % 1 } }); }
    case "dig": return Object.assign(o, { mode: "walk", lean: .45 + Math.sin(t * 4) * .15, weapon: weaponArt("shovel"), swing: { kind: "swing", p: (t * 1.1) % 1 } });
    case undefined: if (/read/i.test(a.name || "")) return Object.assign(o, { lean: .12, lunge: true, headTilt: .45 }); if (/bandag|disinfect|stitch|splint|treat|clean the|apply|remov/i.test(a.name || "")) return Object.assign(o, { mode: "sneak", lean: .4, lunge: true, headTilt: .3 }); break;
    case "sew": case "rip": case "click": return Object.assign(o, { mode: "sneak", lean: .35, lunge: true, headTilt: Math.sin(t * 1.3) * .15 });
    case "eat": case "drink": return Object.assign(o, { lean: .08, lunge: Math.sin(t * 5) > -.2, headTilt: k === "drink" ? -.35 : Math.sin(t * 7) * .12 });
    case "cook": return Object.assign(o, { lean: .3, lunge: true, headTilt: .1 });
    case "rustle": return Object.assign(o, { lean: .35 + Math.sin(t * 3) * .12, lunge: true });
    case "fish": return Object.assign(o, { lean: .1, weapon: { len: 16, thick: 1, two: true, col: "#8a6a42" } });
  }
  if (/climb/i.test(a.name || "")) return Object.assign(o, { mode: "sneak", lean: .5 });
  if (a.craft || a.build) return Object.assign(o, { mode: "sneak", lean: .3, lunge: true });
  return o;
}
function drawPlayer(){
  if (P.car) return;
  const pose = poseFor(), outfit = playerOutfit();
  if (pose.lying){ drawLying(P.x, P.y, { face: P.face, shirt: outfit.shirt, pants: outfit.pants, skin: "#d9ae88", hair: "#3a2a1e" }); return; }
  const sw = P.swing ? { kind: P.swing.kind, p: P.swing.t / P.swing.dur } : null;
  const mode = pose.mode || (P.sneaking ? "sneak" : (P.running && P.moving) ? "run" : "walk");
  const g = gunOf(), aimG = g && rmb && !P.action;
  drawRig(P.x, P.y, {
    face: P.face, phase: P.walkPhase, move: pose.move ?? (P.moveBlend || 0), mode, idle: G.simT * 2,
    shirt: outfit.shirt, sleeve: outfit.shirt, pants: outfit.pants, shoes: outfit.shoes, skin: "#d9ae88", hair: "#3a2a1e", hat: outfit.hat, hatCol: outfit.hatCol,
    weapon: "weapon" in pose ? pose.weapon : P.weapon && !aimG ? (g ? gunArt(P.weapon.id) : weaponArt(P.weapon.id)) : null,
    swing: pose.swing || (sw && sw.kind !== "stomp" ? (sw.kind === "stab" ? { kind: "swing", p: sw.p } : sw) : null), stomp: sw && sw.kind === "stomp" ? sw.p : 0,
    blood: P.wounds.some(w => w.bleed && !w.bandaged), lean: pose.lean, lunge: pose.lunge, tip: pose.tip, headTilt: pose.headTilt,
  });
  if (aimG){
    const c = Math.cos(P.face), s = Math.sin(P.face), px = -s, py = c, len = g.two ? .78 : .5;
    const grip = [P.x + c * .32, P.y + s * .32, 27], tip = [P.x + c * (.32 + len), P.y + s * (.32 + len), 28];
    for (const k of [-1, 1]) line3([P.x + px * .13 * k, P.y + py * .13 * k, 29], grip, "#d9ae88", 2.4, 1);
    if (g.two) line3([P.x - c * .05, P.y - s * .05, 26], grip, "#4a3220", 3, 1);
    line3(grip, tip, P.weapon.id === "huntrifle" || P.weapon.id === "shotgun" ? "#3a2618" : "#18181a", g.two ? 2.4 : 2.8, 1);
  }
}
// zombies: pounding on what's in the way, limping, a cheap version far out
function drawZombie(z){
  const zf = z.flash > 0;
  const skin = z.skin || (z.skin = pick(["#8a977a", "#9a9a82", "#7f8c74", "#a39a86", "#8c8070", "#7a6a58", "#6a5a48"]));
  const hair = z.hair || (z.hair = pick(["#2a2622", "#4a3a2a", "#6a6a62", "#1a1816", "#7a5a3a", "#a8a090"]));
  if (z.down > 0) z.fallT = Math.min(1, (z.fallT || 0) + RDT * 3.4); else z.fallT = Math.max(0, (z.fallT || 0) - RDT * 2.2);
  if (zoom < .62 && !(z.fallT > 0) && !z.fake){
    const [sx, sy] = S(z.x, z.y, 0), h = 30 * zoom;
    ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(sx, sy, 4 * zoom, 2 * zoom, 0, 0, 7); ctx.fill();
    ctx.fillStyle = shade(z.pants, .9); ctx.fillRect(sx - 2.4 * zoom, sy - h * .45, 4.8 * zoom, h * .45);
    ctx.fillStyle = zf ? "#fff" : z.col; ctx.fillRect(sx - 3 * zoom, sy - h * .82, 6 * zoom, h * .4);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(sx, sy - h * .92, 2.6 * zoom, 0, 7); ctx.fill();
    return;
  }
  if (z.fake || z.type === "crawl" || (z.down > 0 && z.fallT >= 1)){
    drawLying(z.x, z.y, { face: z.face, shirt: z.col, pants: z.pants, skin, hair, crawl: z.type === "crawl" && z.down <= 0 && !z.fake, phase: z.anim, move: Math.min(1, (z.mv || 0) / 0.2) });
    return;
  }
  z.limp = z.limp ?? (R() < .3);
  const feeding = z.feast && z.state === "idle", bashing = z.bashAt && G.simT - z.bashAt < .6;
  const ph = z.limp ? z.anim + Math.sin(z.anim * 2) * .35 : z.anim;
  drawRig(z.x, z.y, {
    face: z.face, phase: ph, move: feeding || bashing ? 0 : Math.min(1, (z.mv || 0) / 0.35), mode: z.type === "sprint" && z.state === "chase" ? "sprint" : "zombie",
    shirt: zf ? "#f4f0e8" : z.col, sleeve: zf ? "#f4f0e8" : z.col, pants: zf ? "#e8e4dc" : z.pants, shoes: "#1e1c1a", skin: zf ? "#ffffff" : skin, hair,
    eyes: "#e8e0c0", lunge: z.lunge > 0 || bashing, blood: z.hp < z.maxhp || z.bloody || feeding, ragged: true, headTilt: (z.tiltH ?? (z.tiltH = rf(-1.2, 1.2))) + (bashing ? Math.sin(G.simT * 9) * .3 : 0) + (Math.sin(G.simT * 11 + z.x * 7.3) > .985 ? .6 : 0),
    lean: z.lunge > 0 ? .4 : feeding ? .95 + Math.sin(G.simT * 6 + z.x) * .08 : bashing ? .25 + Math.max(0, Math.sin(G.simT * 9)) * .3 : z.limp ? .12 : undefined,
    tip: z.fallT ? z.fallT * 1.45 : 0, hat: z.fallT > .3 ? null : z.hat, hatCol: z.hatCol,
  });
  if (z.burning > 0){ z.burning -= RDT; const [sx, sy] = S(z.x, z.y, 22); ctx.fillStyle = `rgba(255,${120 + Math.random() * 80 | 0},40,.7)`; ctx.beginPath(); ctx.ellipse(sx, sy - 6 * zoom, 5 * zoom, 12 * zoom, 0, 0, 7); ctx.fill(); }
}
// sitting down on chairs, benches, sofas and pews
function seatOptions(o, out){
  if (!OBJ[o.type].seat && o.type !== "sofa") return;
  out.push({ label: P.sitting ? "Stand up" : "Sit down", fn: () => { if (P.sitting){ P.sitting = false; return; } P.sitting = true; P.face = Math.atan2(o.y + .5 - P.y, o.x + .5 - P.x) + Math.PI; say("You sit for a moment."); } });
}
function stepAnim(dt){
  if (P.flinchT > 0) P.flinchT -= dt;
  if (P.sitting){ if (P.moving || P.action) P.sitting = false; else { P.boredom = Math.max(0, (P.boredom || 0) - dt * .02); P.endurance = Math.min(1, P.endurance + dt * .006); } }
}
