// ============================================================
// Part 7: art. Furniture models, doors, jointed character rig.
// ============================================================

// ---------- low level iso drawing helpers ----------
function poly(pts, col, a = 1){
  ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
}
function boxW(x0, y0, x1, y1, z0, z1, col, a = 1, topCol){
  const pL0 = S(x0, y1, z0), pB0 = S(x1, y1, z0), pR0 = S(x1, y0, z0);
  const pL1 = S(x0, y1, z1), pB1 = S(x1, y1, z1), pR1 = S(x1, y0, z1), pT1 = S(x0, y0, z1);
  poly([pL0, pB0, pB1, pL1], shade(col, 0.72), a);
  poly([pB0, pR0, pR1, pB1], shade(col, 0.88), a);
  poly([pT1, pR1, pB1, pL1], topCol || col, a);
}
const faceS = (x0, x1, y, z0, z1, col, a = 1) => poly([S(x0, y, z0), S(x1, y, z0), S(x1, y, z1), S(x0, y, z1)], col, a);
const faceE = (x, y0, y1, z0, z1, col, a = 1) => poly([S(x, y0, z0), S(x, y1, z0), S(x, y1, z1), S(x, y0, z1)], col, a);
const topR = (x0, y0, x1, y1, z, col, a = 1) => poly([S(x0, y0, z), S(x1, y0, z), S(x1, y1, z), S(x0, y1, z)], col, a);
function topEl(cx, cy, r, z, col, a = 1, ry){
  const [sx, sy] = S(cx, cy, z); ctx.globalAlpha = a; ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(sx, sy, r * hw * 1.414, (ry ?? r) * hh * 1.414, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
}
function line3(p, q, col, w, a = 1){
  const A = S(p[0], p[1], p[2]), B = S(q[0], q[1], q[2]);
  ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.8, w * zoom); ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.globalAlpha = 1;
}

// ---------- oriented furniture ----------
// local coords: u runs along the wall, v runs from the wall (0) into the room (1)
function frameOf(o){
  const [dx, dy] = o.dir || [0, 1];
  return { m: objFrame(o), vis: dy === 1 ? "S" : dx === 1 ? "E" : null };
}
// a model is built from parts, then drawn back to front
function Model(o, dim, a){
  const F = frameOf(o), parts = [];
  const api = {
    F, dim, a,
    part(u0, v0, u1, v1, z0, z1, col, deco, topCol){
      const p = F.m(u0, v0), q = F.m(u1, v1);
      parts.push({ x0: Math.min(p[0], q[0]), y0: Math.min(p[1], q[1]), x1: Math.max(p[0], q[0]), y1: Math.max(p[1], q[1]), z0, z1, col, deco, topCol });
    },
    // rectangle painted on the front face (only when the front faces the camera)
    front(u0, u1, v, z0, z1, col, alpha = 1){
      if (!F.vis) return;
      const p = F.m(u0, v), q = F.m(u1, v);
      if (F.vis === "S") faceS(p[0], q[0], p[1], z0, z1, shade(col, dim), a * alpha);
      else faceE(p[0], p[1], q[1], z0, z1, shade(col, dim), a * alpha);
    },
    frontLine(u0, z0, u1, z1, v, col, w){
      if (!F.vis) return;
      const p = F.m(u0, v), q = F.m(u1, v);
      line3([p[0], p[1], z0], [q[0], q[1], z1], shade(col, dim), w, a);
    },
    top(u0, v0, u1, v1, z, col){
      const p = F.m(u0, v0), q = F.m(u1, v0), r = F.m(u1, v1), s = F.m(u0, v1);
      poly([S(p[0], p[1], z), S(q[0], q[1], z), S(r[0], r[1], z), S(s[0], s[1], z)], shade(col, dim), a);
    },
    ell(u, v, r, z, col, ry){ const p = F.m(u, v); topEl(p[0], p[1], r, z, shade(col, dim), a, ry); },
    line(u0, v0, z0, u1, v1, z1, col, w){ const p = F.m(u0, v0), q = F.m(u1, v1); line3([p[0], p[1], z0], [q[0], q[1], z1], shade(col, dim), w, a); },
    draw(){
      parts.sort((A, B) => {
        if (A.z0 >= B.z1 - 0.01) return 1;
        if (B.z0 >= A.z1 - 0.01) return -1;
        return (A.x0 + A.x1 + A.y0 + A.y1) - (B.x0 + B.x1 + B.y0 + B.y1);
      });
      for (const p of parts){
        boxW(p.x0, p.y0, p.x1, p.y1, p.z0, p.z1, shade(p.col, dim), a, p.topCol ? shade(p.topCol, dim) : undefined);
        if (p.deco) p.deco();
      }
    },
  };
  return api;
}

const BOOKC = ["#8a2f2a", "#2f4f7a", "#c9a446", "#3f6a3f", "#d9d2c0", "#5a3a6a", "#b5652e", "#1f2a33"];
const PRODUCT = {
  grocery: ["#d24a32", "#e8c23a", "#3a7ac8", "#f0f0e8", "#5aa04a", "#c8681e", "#8a3a8a"],
  pharmacy: ["#f2f2ee", "#4a8ac8", "#e04848", "#7ac8b8", "#f0f0f0"],
  hardware: ["#e88a1e", "#7a8088", "#3a3a3e", "#c8b048", "#a83a2a"],
};

function drawObj(o, dim, a){
  const M = Model(o, dim, a), h = hash(o.x * 7 + 3, o.y * 11 + 5);
  const WOOD = "#7b5638", WOOD_D = "#5a3d27", WHITE = "#e2e3df", STEEL = "#8d969c";
  switch (o.type){
    case "fridge": {
      M.part(.1, .06, .9, .78, 0, 40, WHITE, () => {
        M.frontLine(.1, 27, .9, 27, .78, "#9aa0a0", 1.2);
        M.front(.74, .8, .78, 29, 37, "#7a8084");
        M.front(.74, .8, .78, 9, 24, "#7a8084");
        M.front(.1, .9, .78, 0, 2.5, "#55595a");
      });
      break;
    }
    case "oven": {
      M.part(.06, .02, .94, .16, 18, 26, "#cfd0cb", () => { for (const u of [.25, .42, .58, .75]) M.ell(u, .17, .03, 22, "#3a3a3a"); });
      M.part(.06, .06, .94, .9, 0, 18, WHITE, () => {
        for (const [u, v] of [[.3, .35], [.7, .35], [.3, .68], [.7, .68]]){ M.ell(u, v, .12, 18.05, "#3a3b3d"); M.ell(u, v, .07, 18.1, "#222"); }
        M.front(.22, .78, .9, 3, 12, "#1e1f22");
        M.front(.28, .72, .9, 5, 10, "#3c3226", 0.8);
        M.frontLine(.2, 14.5, .8, 14.5, .9, "#7a7a7a", 1.4);
      });
      break;
    }
    case "counter": case "ksink": {
      M.part(0, .04, 1, .84, 0, 16, WOOD, () => {
        M.front(.06, .47, .84, 2, 14, WOOD_D, 0.55);
        M.front(.53, .94, .84, 2, 14, WOOD_D, 0.55);
        M.front(.4, .44, .84, 9, 11, "#c8c0a8"); M.front(.56, .6, .84, 9, 11, "#c8c0a8");
      });
      M.part(0, .01, 1, .92, 16, 18, "#cdc5b0", () => {
        if (o.type === "ksink"){
          M.top(.18, .22, .82, .74, 18.05, "#9aa3a8"); M.top(.24, .28, .76, .68, 18.1, "#5e676c");
          M.line(.5, .12, 18, .5, .12, 25, STEEL, 1.6); M.line(.5, .12, 25, .5, .32, 24, STEEL, 1.6);
        } else if (h < .5){
          M.part(.15, .2, .35, .4, 18, 23, h < .25 ? "#b84a3a" : "#e8e2d0");
        }
      });
      break;
    }
    case "bsink": {
      M.part(.42, .25, .58, .45, 0, 13, WHITE);
      M.part(.15, .05, .85, .7, 13, 17, WHITE, () => {
        M.ell(.5, .4, .22, 17.05, "#b9c2c4", .16); M.ell(.5, .42, .15, 17.1, "#8a969a", .1);
        M.line(.5, .1, 17, .5, .1, 22, STEEL, 1.5); M.line(.5, .1, 22, .5, .24, 21, STEEL, 1.5);
      });
      break;
    }
    case "toilet": {
      M.part(.25, .02, .75, .26, 0, 20, WHITE, null, "#d0d2ce");
      M.part(.32, .26, .68, .78, 0, 9, WHITE, () => {
        M.ell(.5, .52, .2, 9.05, "#f2f2ee", .24); M.ell(.5, .53, .13, 9.1, "#8fb3c2", .16);
      });
      break;
    }
    case "bed": {
      const blanket = ["#7a3a3a", "#3a5a7a", "#5a6a3a", "#7a6a4a", "#5a4a6a"][(h * 5) | 0];
      M.part(.02, 0, .98, .1, 0, 17, WOOD_D);
      M.part(.04, .06, .96, 1, 0, 6, WOOD);
      M.part(.06, .08, .94, .99, 6, 10, "#e6e1d6");
      M.part(.14, .12, .86, .33, 10, 12.5, "#f5f3ee");
      M.part(.06, .4, .94, .99, 10, 11.2, blanket, () => { M.top(.06, .4, .94, .5, 11.25, shade(blanket, 1.25)); });
      break;
    }
    case "wardrobe": {
      M.part(.05, .04, .95, .62, 0, 43, WOOD, () => {
        M.front(.1, .48, .62, 4, 39, WOOD_D, 0.5); M.front(.52, .9, .62, 4, 39, WOOD_D, 0.5);
        M.front(.43, .46, .62, 20, 24, "#d4b46a"); M.front(.54, .57, .62, 20, 24, "#d4b46a");
      });
      M.part(.02, .02, .98, .66, 43, 46, WOOD_D);
      break;
    }
    case "dresser": {
      M.part(.06, .06, .94, .6, 0, 20, WOOD, () => {
        for (const [z0, z1] of [[2, 7], [8, 13], [14, 19]]){
          M.front(.1, .9, .6, z0, z1, WOOD_D, 0.45);
          M.front(.28, .34, .6, (z0 + z1) / 2 - .6, (z0 + z1) / 2 + .6, "#d4b46a"); M.front(.66, .72, .6, (z0 + z1) / 2 - .6, (z0 + z1) / 2 + .6, "#d4b46a");
        }
      });
      // lamp on top
      M.part(.66, .18, .82, .34, 20, 21.5, "#3a3a3a");
      M.part(.6, .12, .88, .4, 26, 31, "#e9dcae", () => { M.line(.74, .26, 21.5, .74, .26, 26, "#3a3a3a", 1); });
      break;
    }
    case "sofa": {
      const c = ["#7a3f3a", "#4a5a3a", "#5a4a3a", "#3a4a5a", "#6a5a4a"][(h * 5) | 0];
      M.part(.02, .02, .98, .34, 0, 18, shade(c, .85));
      M.part(.02, .2, .98, .95, 0, 8, c, () => { M.top(.49, .34, .51, .95, 8.05, shade(c, .7)); });
      M.part(0, .15, .14, .95, 0, 13, shade(c, .9));
      M.part(.86, .15, 1, .95, 0, 13, shade(c, .9));
      break;
    }
    case "bookcase": {
      M.part(.04, .04, .96, .44, 0, 42, WOOD, () => {
        M.front(.09, .91, .44, 2, 40, "#2a1e14");
        for (let s = 0; s < 4; s++){
          const z = 2 + s * 9.6;
          M.front(.09, .91, .44, z, z + 1.2, WOOD);
          let u = .1, k = s * 13 + ((h * 97) | 0);
          while (u < .86){
            const w = .045 + hash(k, 3) * .05, ht = 5.5 + hash(k, 7) * 2.5;
            if (hash(k, 9) > .12) M.front(u, Math.min(u + w, .9), .44, z + 1.2, z + 1.2 + ht, BOOKC[(hash(k, 1) * BOOKC.length) | 0]);
            u += w + .008; k++;
          }
        }
      });
      break;
    }
    case "tv": {
      M.part(.1, .12, .9, .78, 0, 9, "#4a3a2c", () => { M.front(.16, .84, .78, 1.5, 7.5, "#33271d"); });
      M.part(.32, .1, .68, .26, 10, 20, "#2a2b2e");
      M.part(.2, .24, .8, .72, 9, 23, "#35363a", () => {
        const on = powerOn() && G.vis[ix(o.x, o.y)];
        M.front(.25, .75, .72, 11, 21, on ? (Math.random() < .5 ? "#7d9ec8" : "#8fb0d8") : "#1e2a2e");
        M.front(.66, .72, .72, 9.6, 10.6, "#c8c8c8");
        M.line(.5, .48, 23, .3, .55, 33, "#9a9a9a", 1); M.line(.5, .48, 23, .72, .42, 32, "#9a9a9a", 1);
      });
      break;
    }
    case "medcab": {
      M.part(.18, 0, .82, .22, 17, 33, "#e8e8e2", () => {
        M.front(.2, .8, .22, 18, 32, "#b8c8cc", 0.8);
        M.front(.45, .55, .22, 21, 29, "#c83a32"); M.front(.37, .63, .22, 24, 26, "#c83a32");
      });
      break;
    }
    case "crate": {
      const x0 = o.x + .1, y0 = o.y + .1, x1 = o.x + .9, y1 = o.y + .9, c = shade("#9b7b4c", dim);
      boxW(x0, y0, x1, y1, 0, 15, c, a);
      for (const z of [5, 10]){ line3([x0, y1, z], [x1, y1, z], shade("#6a5030", dim), 1, a); line3([x1, y1, z], [x1, y0, z], shade("#6a5030", dim), 1, a); }
      line3([x0, y1, 0], [x1, y1, 15], shade("#6a5030", dim), 1.3, a); line3([x1, y1, 0], [x1, y0, 15], shade("#6a5030", dim), 1.3, a);
      for (const t of [.35, .65]) line3([x0 + (x1 - x0) * t, y0, 15], [x0 + (x1 - x0) * t, y1, 15], shade("#6a5030", dim), .8, a);
      break;
    }
    case "shelf": {
      const pal = PRODUCT[o.store] || PRODUCT.grocery;
      const stock = o.items ? Math.min(1, o.items.length / 3) : 1;
      const x0 = o.x + .08, y0 = o.y + .12, x1 = o.x + .92, y1 = o.y + .88, M2 = "#9aa0a4";
      for (const [px, py] of [[x0, y0], [x0, y1], [x1, y0]]) line3([px, py, 0], [px, py, 34], shade("#5a6066", dim), 1.6, a);
      for (let s = 0; s < 4; s++){
        const z = 1 + s * 9;
        boxW(x0, y0, x1, y1, z, z + 1.2, shade(M2, dim), a);
        let k = s * 5 + ((h * 31) | 0);
        for (let i = 0; i < 4; i++, k++){
          if (hash(k, o.x) > stock * 0.95) continue;
          const bx = x0 + .03 + i * .2, by = y0 + .08 + hash(k, 2) * .3;
          const ht = 3.5 + hash(k, 4) * 3.5;
          boxW(bx, by, bx + .15, by + .28, z + 1.2, z + 1.2 + ht, shade(pal[(hash(k, 6) * pal.length) | 0], dim), a);
        }
      }
      line3([x1, y1, 0], [x1, y1, 34], shade("#5a6066", dim), 1.6, a);
      break;
    }
    case "checkout": {
      M.part(0, .1, 1, .9, 0, 15, "#4a5560", () => {
        M.top(.05, .25, .55, .75, 15.05, "#1e2226");
        M.front(.05, .95, .9, 2, 13, "#5a6670", 0.6);
      });
      M.part(.62, .2, .92, .55, 15, 21, "#2e2e30", () => { M.top(.66, .24, .88, .4, 21.05, "#5a7a5a"); });
      break;
    }
    case "woodwall": case "pcrate": case "rainbarrel": case "campfire": drawBuilt(o, dim, a); return;
    case "car": drawCar(o, dim, a); return;
    default: { if (drawObj2(o, dim, a)) return; const d = OBJ[o.type]; boxW(o.x + .08, o.y + .08, o.x + .92, o.y + .92, 0, d.h, shade(d.col, dim), a); }
  }
  M.draw();
}

function drawCar(o, dim, a){
  const along = o.dir && o.dir[0] !== 0 ? "x" : "y";
  const c = shade(o.col || "#5a6470", dim), glass = shade("#3a4a5a", dim), tyre = "#141414";
  const L = (p, q, r, s) => along === "x" ? [o.x + p, o.y + q, o.x + r, o.y + s] : [o.x + q, o.y + p, o.x + s, o.y + r];
  // wheels
  for (const p of [-.15, .95]) for (const q of [.18, .82]){
    const [x0, y0] = L(p, q, 0, 0); const w = along === "x" ? [x0 + .3, y0] : [x0, y0 + .3];
    topEl((x0 + w[0]) / 2 + (along === "x" ? 0 : 0), (y0 + w[1]) / 2, .14, 3, tyre, a);
  }
  const b = L(-.4, .2, 1.4, .8);
  boxW(b[0], b[1], b[2], b[3], 2.5, 10, c, a);
  const cab = L(.05, .24, .95, .76);
  boxW(cab[0], cab[1], cab[2], cab[3], 10, 17, glass, a, c);
  // headlights / tail lights on visible ends
  const lights = (along === "x") ? () => { faceE(b[2], b[1] + .05, b[1] + .15, 6, 8.5, "#e8dca0", a); faceE(b[2], b[3] - .15, b[3] - .05, 6, 8.5, "#e8dca0", a); }
                                  : () => { faceS(b[0] + .05, b[0] + .15, b[3], 6, 8.5, "#e8dca0", a); faceS(b[2] - .15, b[2] - .05, b[3], 6, 8.5, "#e8dca0", a); };
  lights();
  if (along === "x") faceS(b[0] + .05, b[2] - .05, b[3], 9.5, 10.2, shade(c, .7), a); else faceE(b[2], b[1] + .05, b[3] - .05, 9.5, 10.2, shade(c, .7), a);
}

// ============================================================
// Character rig: jointed skeleton projected into the iso view
// ============================================================
const RIG = { U: 1 / 34, thigh: 8.2, shin: 8, upper: 6.6, fore: 6.2, sh: 4.3, hip: 2.3 };
function hull(pts){
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts){ while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--){ const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const GAIT = {
  walk:  { A: .38, K: .68, arm: .42, elb: .35, lean: .04, th0: 0, kn0: .08, bounce: 0 },
  run:   { A: .72, K: 1.7, arm: .85, elb: 1.45, lean: .26, th0: .05, kn0: .2, bounce: 1.6 },
  sneak: { A: .32, K: .6, arm: .18, elb: 1.0, lean: .38, th0: .42, kn0: 1.0, bounce: 0 },
  zombie:{ A: .3, K: .55, arm: 0, elb: .15, lean: .17, th0: .04, kn0: .15, bounce: 0 },
  sprint:{ A: .78, K: 1.8, arm: 0, elb: .3, lean: .32, th0: .05, kn0: .2, bounce: 1.8 },
};
const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

function drawRig(x, y, o){
  const z = zoom, K = 1.12, U = RIG.U * K;
  const cf = Math.cos(o.face), sf = Math.sin(o.face), rx = -sf, ry = cf;
  const cT = Math.cos(o.tip || 0), sT = Math.sin(o.tip || 0);
  const W3 = (fa, sb, h) => { if (o.tip){ const f2 = fa * cT - h * sT, h2 = Math.max(.3, fa * sT + h * cT); fa = f2; h = h2; } return [x + (cf * fa + rx * sb) * U, y + (sf * fa + ry * sb) * U, h * K]; };
  const Pj = p => S(p[0], p[1], p[2]);
  const g = GAIT[o.mode] || GAIT.walk, m = o.move ?? 0, ph = o.phase || 0;
  const L1 = RIG.thigh, L2 = RIG.shin;
  // legs
  const legs = [];
  let hipH = 0;
  for (let i = 0; i < 2; i++){
    const phi = ph + i * Math.PI;
    const asym = o.mode === "zombie" && i === 1 ? .55 : 1;
    let th = g.th0 + g.A * m * asym * Math.sin(phi);
    let kn = g.kn0 + g.K * m * Math.max(0, Math.cos(phi)) * asym;
    if (o.stomp && i === 1){ const p = o.stomp; th = p < .5 ? 1.0 * (p / .5) : 1.0 * (1 - (p - .5) / .5) * .4; kn = p < .5 ? 1.6 * (p / .5) : .2; }
    legs.push({ th, kn, reach: L1 * Math.cos(th) + L2 * Math.cos(th - kn) });
    hipH = Math.max(hipH, legs[i].reach);
  }
  if (o.stomp) hipH = legs[0].reach;
  hipH += g.bounce * m * Math.abs(Math.sin(ph));
  if (o.idle) hipH += Math.sin(o.idle) * .25;
  const lean = (o.lean ?? g.lean) * (o.mode === "sneak" ? 1 : (0.3 + 0.7 * m));
  const tilt = (fa, h) => [fa + (h - hipH) * Math.sin(lean), hipH + (h - hipH) * Math.cos(lean)];

  const parts = [];
  const depth = p => p[0] + p[1];
  const skin = o.skin, dk = (c, f) => shade(c, f);

  for (let i = 0; i < 2; i++){
    const s = i ? 1 : -1, { th, kn } = legs[i];
    const hip = W3(0, s * RIG.hip, hipH);
    const knA = L1 * Math.sin(th), knH = hipH - L1 * Math.cos(th);
    const anA = knA + L2 * Math.sin(th - kn), anH = Math.max(0.4, knH - L2 * Math.cos(th - kn));
    const knee = W3(knA, s * RIG.hip * 1.05, knH), ank = W3(anA, s * RIG.hip * 1.1, anH);
    const toe = W3(anA + 2.6, s * RIG.hip * 1.1, Math.max(0.3, anH - .4 + (anH > 1.5 ? -.6 : 0)));
    parts.push({ d: depth(knee), fn: (far) => {
      const pc = dk(o.pants, far ? .78 : 1);
      seg(hip, knee, pc, 3.3); seg(knee, ank, pc, 2.8); seg(ank, toe, dk(o.shoes, far ? .7 : 1), 2.4);
    } });
  }
  // pelvis + torso as volumes
  const sh = tilt(0, hipH + 12.5);
  const box8 = (fa0, fa1, sb, h0, h1, lean_) => {
    const pts = [];
    for (const fa of [fa0, fa1]) for (const sbb of [-sb, sb]) for (const h of [h0, h1]){
      const t = lean_ ? tilt(fa, h) : [fa, h];
      pts.push(Pj(W3(t[0], sbb, t[1])));
    }
    return hull(pts);
  };
  const center = W3(0, 0, hipH);
  parts.push({ d: depth(center) - 0.0005, fn: () => { poly(box8(-1.5, 1.7, 3.3, hipH - 2.6, hipH + 1.6, false), o.pants); } });
  parts.push({ d: depth(center), fn: () => {
    const hl = box8(-1.6, 2.0, RIG.sh - .3, hipH + 1, hipH + 12.6, true);
    poly(hl, o.shirt);
    // shading on the side away from the light
    ctx.save(); ctx.beginPath(); hl.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.clip();
    const sideP = Pj(W3(tilt(0, hipH + 7)[0], -RIG.sh * 1.6, tilt(0, hipH + 7)[1]));
    ctx.fillStyle = "rgba(0,0,0,.16)"; ctx.beginPath(); ctx.arc(sideP[0], sideP[1], 6 * z * K, 0, 7); ctx.fill();
    if (o.blood){ const bp = Pj(W3(tilt(1.5, hipH + 6)[0], 1, tilt(1.5, hipH + 6)[1])); ctx.fillStyle = "rgba(105,14,10,.8)"; ctx.beginPath(); ctx.ellipse(bp[0], bp[1], 3.4 * z, 4.4 * z, .5, 0, 7); ctx.fill(); }
    if (o.ragged){ ctx.fillStyle = "rgba(0,0,0,.25)"; const rp = Pj(W3(tilt(1, hipH + 2)[0], -2, tilt(1, hipH + 2)[1])); ctx.fillRect(rp[0] - 2 * z, rp[1] - 1 * z, 3 * z, 2 * z); }
    ctx.restore();
  } });

  // arms
  const hands = [];
  const arms = [];
  for (let i = 0; i < 2; i++){
    const s = i ? 1 : -1;
    let al, el;
    if (o.mode === "zombie" || o.mode === "sprint"){
      al = (o.lunge ? 1.55 : 1.22) + .1 * Math.sin(ph * .5 + i * 1.7); el = o.lunge ? .05 : .2 + .1 * i;
    } else {
      al = g.arm * m * Math.sin(ph + (1 - i) * Math.PI); el = g.elb * (o.mode === "walk" ? (0.4 + 0.6 * m) : 1);
      if (o.mode === "walk" && m < .1) { al = .05; el = .15; }
    }
    if (o.weapon && i === 1 && !o.swing){ al = .5; el = .7; }
    if (o.weapon && i === 0 && o.weapon.two && !o.swing){ al = .5; el = .7; }
    if (o.swing){
      const p = o.swing.p;
      if (o.swing.kind === "shove"){ al = .3 + 1.25 * Math.sin(p * Math.PI); el = .1; }
      else if (o.swing.kind === "swing" && (i === 1 || (o.weapon && o.weapon.two))){
        if (p < .35){ const t = ease(p / .35); al = .5 + 2.4 * t; el = .7 - .5 * t; }
        else if (p < .55){ const t = ease((p - .35) / .2); al = 2.9 - 2.4 * t; el = .2; }
        else { const t = (p - .55) / .45; al = .5; el = .2 + .5 * t; }
      }
    }
    const sp = tilt(0, hipH + 11.5);
    const shoulder = W3(sp[0], s * RIG.sh, sp[1]);
    const eA = sp[0] + RIG.upper * Math.sin(al + lean * .3), eH = sp[1] - RIG.upper * Math.cos(al + lean * .3);
    const hA = eA + RIG.fore * Math.sin(al + el + lean * .3), hH = eH - RIG.fore * Math.cos(al + el + lean * .3);
    const inward = o.weapon && o.weapon.two && (i === 0) ? .2 : 1;
    const elbow = W3(eA, s * RIG.sh * 1.08, eH), hand = W3(hA, s * RIG.sh * (o.mode === "zombie" ? .8 : 1.05) * inward, hH);
    hands[i] = { hand, al: al + el + lean * .3, shoulder, elbow };
    arms.push({ i, shoulder, elbow, hand });
  }
  // two handed weapons: left hand grips just below the right
  if (o.weapon && o.weapon.two){
    const r = hands[1];
    const dir = [Math.sin(r.al), -Math.cos(r.al)];
    const rh = r.hand;
    const lh = [rh[0] - (cf * dir[0]) * U * 2, rh[1] - (sf * dir[0]) * U * 2, rh[2] - dir[1] * 2 * K];
    arms[0].hand = lh;
    arms[0].elbow = [(arms[0].shoulder[0] + lh[0]) / 2 + rx * U * -1.5, (arms[0].shoulder[1] + lh[1]) / 2 + ry * U * -1.5, (arms[0].shoulder[2] + lh[2]) / 2 - 2];
  }
  for (const A of arms){
    parts.push({ d: depth(A.elbow) + 0.001, fn: (far) => {
      const sc = dk(o.sleeve || o.shirt, far ? .78 : 1);
      seg(A.shoulder, A.elbow, sc, 2.5);
      seg(A.elbow, A.hand, dk(o.sleeve === skin ? skin : (o.bareArms ? skin : sc), far ? .8 : 1), 2.2);
      const hp = Pj(A.hand); ctx.fillStyle = dk(skin, far ? .8 : 1); ctx.beginPath(); ctx.arc(hp[0], hp[1], 1.3 * z * K, 0, 7); ctx.fill();
    } });
  }
  // weapon
  if (o.weapon){
    const r = hands[1], al = r.al, w = o.weapon;
    const dirA = Math.sin(al), dirH = -Math.cos(al);
    const len = w.len, hand = r.hand;
    const tip = [hand[0] + cf * dirA * len * U, hand[1] + sf * dirA * len * U, hand[2] + dirH * len * K];
    const butt = [hand[0] - cf * dirA * 1.5 * U, hand[1] - sf * dirA * 1.5 * U, hand[2] - dirH * 1.5 * K];
    parts.push({ d: depth(tip) + 0.002, fn: () => {
      seg(butt, tip, w.col, w.thick);
      if (w.head){
        const hd = [tip[0] - cf * dirA * 2.5 * U, tip[1] - sf * dirA * 2.5 * U, tip[2] - dirH * 2.5 * K];
        const side = [rx * U * 3, ry * U * 3];
        seg([hd[0] - side[0] * .2, hd[1] - side[1] * .2, hd[2]], [hd[0] + side[0], hd[1] + side[1], hd[2]], w.head, 3.2);
      }
      if (w.pan){ const tp = Pj(tip); ctx.fillStyle = "#2a2a2c"; ctx.beginPath(); ctx.ellipse(tp[0], tp[1], 4 * z, 2.6 * z, 0, 0, 7); ctx.fill(); }
    } });
  }
  // head
  const nb = tilt(.3, hipH + 12.8), hc = tilt(.6 + (o.mode === "zombie" ? 1.2 : 0), hipH + 16.8 - (o.mode === "zombie" ? .8 : 0));
  const headW = W3(hc[0], o.headTilt || 0, hc[1]);
  parts.push({ d: depth(center) + 0.003, fn: () => {
    seg(W3(nb[0], 0, nb[1]), headW, skin, 2.2);
    const hp = Pj(headW), r = 3.25 * z * K;
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hp[0], hp[1], r, 0, 7); ctx.fill();
    // hair sits toward the back of the head
    const back = Pj(W3(hc[0] - 1.3, o.headTilt || 0, hc[1] + .9));
    ctx.save(); ctx.beginPath(); ctx.arc(hp[0], hp[1], r, 0, 7); ctx.clip();
    ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(back[0], back[1] - r * .25, r * 1.02, 0, 7); ctx.fill();
    // face toward camera: eyes
    if (cf + sf > -0.2){
      for (const s of [-1, 1]){
        const e = Pj(W3(hc[0] + 2.6, (o.headTilt || 0) + s * 1.15, hc[1] + .1));
        ctx.fillStyle = o.eyes || "#1a1410"; ctx.fillRect(e[0] - .55 * z, e[1] - .55 * z, 1.1 * z * K, 1.1 * z * K);
      }
      if (o.mode === "zombie"){ const mth = Pj(W3(hc[0] + 2.7, o.headTilt || 0, hc[1] - 1.6)); ctx.fillStyle = "#3a1210"; ctx.fillRect(mth[0] - 1 * z, mth[1] - .4 * z, 2 * z, 1.2 * z); }
    }
    ctx.restore();
    if (o.hat) drawHat(o.hat, o.hatCol || "#333", hp, r);
  } });

  // shadow
  const c0 = Pj(W3(0, 0, 0));
  ctx.fillStyle = "rgba(0,0,0,.32)"; ctx.beginPath(); ctx.ellipse(c0[0], c0[1], 8 * z, 4 * z, 0, 0, 7); ctx.fill();
  // far limbs darker: the side of the body further from the camera
  const cd = depth(center);
  parts.sort((A, B) => A.d - B.d);
  for (const p of parts) p.fn(p.d < cd - 0.002);

  function seg(a, b, col, w){
    const A = Pj(a), B = Pj(b), lw = w * z * K;
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
    if (lw > 2.2 && col[0] === "#"){ const o2 = lw * .17; ctx.strokeStyle = shade(col, 1.16); ctx.lineWidth = lw * .3; ctx.beginPath(); ctx.moveTo(A[0] - o2, A[1] - o2 * .5); ctx.lineTo(B[0] - o2, B[1] - o2 * .5); ctx.stroke(); }
  }
}

// weapon looks for the rig
function weaponArt(id){
  const w = ITEMS[id]; if (!w) return null;
  const base = { len: 9, col: "#8a6a42", thick: 1.6, two: false };
  switch (w.skill){
    case "longblunt": Object.assign(base, { len: 15, thick: 2.1, two: true }); break;
    case "axe": Object.assign(base, { len: id === "axe" ? 15 : 9, thick: 1.6, two: id === "axe", head: "#8a9096" }); break;
    case "shortblunt": Object.assign(base, { len: 8, thick: 1.6 }); break;
    case "blade": Object.assign(base, { len: 5.5, thick: 1.2, col: "#c8ccd0" }); break;
  }
  if (["crowbar", "pipe", "golf"].includes(id)) base.col = "#8a9096";
  if (id === "crowbar") base.col = "#7a3030";
  if (id === "hammer") base.head = "#6a6e72";
  if (id === "shovel") { base.head = "#6a6e72"; base.col = "#7a5a3a"; }
  if (id === "pan") { base.pan = true; base.col = "#2a2a2c"; base.len = 6; }
  return base;
}

function drawPlayer(){
  if (P.car) return;
  const sw = P.swing ? { kind: P.swing.kind, p: P.swing.t / P.swing.dur } : null;
  const mode = P.sneaking ? "sneak" : (P.running && P.moving) ? "run" : "walk";
  drawRig(P.x, P.y, {
    face: P.face, phase: P.walkPhase, move: P.moveBlend || 0, mode, idle: G.simT * 2,
    shirt: OCCS[P.occ].shirt, sleeve: OCCS[P.occ].shirt, pants: "#2e3a4a", shoes: "#2a2420", skin: "#d9ae88", hair: "#3a2a1e",
    weapon: P.weapon ? weaponArt(P.weapon.id) : null, swing: sw && sw.kind !== "stomp" ? sw : null, stomp: sw && sw.kind === "stomp" ? sw.p : 0,
    blood: P.wounds.some(w => w.bleed && !w.bandaged),
  });
}
function drawZombie(z){
  const zf = z.flash > 0;
  const skin = z.skin || (z.skin = pick(["#8a977a", "#9a9a82", "#7f8c74", "#a39a86", "#8c8070"]));
  if (z.fake || z.down > 0 || z.type === "crawl"){
    drawLying(z.x, z.y, { face: z.face, shirt: z.col, pants: z.pants, skin, hair: z.hair || "#2a2622", crawl: z.type === "crawl" && z.down <= 0 && !z.fake, phase: z.anim, move: Math.min(1, (z.mv || 0) / 0.2) });
    return;
  }
  drawRig(z.x, z.y, {
    face: z.face, phase: z.anim, move: Math.min(1, (z.mv || 0) / 0.35), mode: z.type === "sprint" && z.state === "chase" ? "sprint" : "zombie",
    shirt: zf ? "#f4f0e8" : z.col, sleeve: zf ? "#f4f0e8" : z.col, pants: zf ? "#e8e4dc" : z.pants, shoes: "#1e1c1a", skin: zf ? "#ffffff" : skin, hair: z.hair || (z.hair = pick(["#2a2622", "#4a3a2a", "#6a6a62", "#1a1816", "#7a5a3a"])),
    eyes: "#e8e0c0", lunge: z.lunge > 0, blood: z.hp < z.maxhp || z.bloody, ragged: true, headTilt: z.tiltH ?? (z.tiltH = rf(-1.2, 1.2)),
    lean: z.lunge > 0 ? .4 : undefined,
  });
}

// bodies on the ground (corpses, downed zombies, crawlers)
function drawLying(x, y, o){
  const z = zoom, K = 1.12, U = RIG.U * K;
  const cf = Math.cos(o.face), sf = Math.sin(o.face), rx = -sf, ry = cf;
  const W3 = (fa, sb, h) => [x + (cf * fa + rx * sb) * U, y + (sf * fa + ry * sb) * U, h * K];
  const Pj = p => S(p[0], p[1], p[2]);
  const seg = (a, b, col, w) => { const A = Pj(a), B = Pj(b); ctx.strokeStyle = col; ctx.lineWidth = w * z * K; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); };
  if (o.pool){ const c = Pj(W3(2, 0, 0)); ctx.fillStyle = "rgba(90,10,8,.55)"; ctx.beginPath(); ctx.ellipse(c[0], c[1], 14 * z, 7 * z, 0, 0, 7); ctx.fill(); }
  const lift = o.crawl ? 4 : 1.6;
  const reach = o.crawl ? Math.sin(o.phase * 1.4) * 3 * (o.move || 0.3) : 0;
  // legs
  for (const s of [-1, 1]){
    seg(W3(-2, s * 2, 1.5), W3(-10, s * 2.6, 1.4), o.pants, 3.2);
    seg(W3(-10, s * 2.6, 1.4), W3(-17, s * (3 + (o.crawl ? .8 : 0)), 1.2), o.pants, 2.8);
    seg(W3(-17, s * 3, 1.2), W3(-18.5, s * 3, 3), "#1e1c1a", 2.2);
  }
  const torso = hull([W3(-3, -3.2, 1), W3(-3, 3.2, 1), W3(10, -4, lift), W3(10, 4, lift), W3(-3, -3.2, 4), W3(-3, 3.2, 4), W3(10, -4, lift + 3), W3(10, 4, lift + 3)].map(Pj));
  poly(torso, o.shirt);
  // arms
  for (const s of [-1, 1]){
    const r = o.crawl ? reach * s : 0;
    const el = W3(o.crawl ? 14 + r : 6, s * 6.5, o.crawl ? 2 : 1.5), hd = W3(o.crawl ? 19 + r * 1.3 : 2, s * (o.crawl ? 4 : 8), 1.2);
    seg(W3(9, s * 4, lift + 1.5), el, o.shirt, 2.5); seg(el, hd, o.skin, 2.2);
  }
  const hc = Pj(W3(13.5, 0, lift + 2.5));
  ctx.fillStyle = o.skin; ctx.beginPath(); ctx.arc(hc[0], hc[1], 3.25 * z * K, 0, 7); ctx.fill();
  ctx.fillStyle = o.hair || "#2a2622"; ctx.beginPath(); ctx.arc(hc[0], hc[1] - 1 * z, 2.9 * z * K, Math.PI, 2 * Math.PI); ctx.fill();
}

// ---------- hover labels ----------
function hoverLabel(mx, my){
  if (!G || !P) return null;
  const vl = vehHover(mx, my); if (vl) return vl;
  for (const lift of [0, 14, 28]){
    const [wx, wy] = toWorld(mx, my + lift * zoom);
    const tx = Math.floor(wx), ty = Math.floor(wy);
    if (!inb(tx, ty)) continue;
    const z = Z.find(z => z.alive && G.vis[ix(z.x | 0, z.y | 0)] && Math.hypot(z.x - wx, z.y - wy) < .45);
    if (z) return z.fake ? "A body... is it moving?" : z.down > 0 ? "Zombie (knocked down)" : z.type === "crawl" ? "Crawling zombie" : "Zombie";
    const c = G.corpses.find(c => Math.hypot(c.x - wx, c.y - wy) < .5 && explored[ix(c.x | 0, c.y | 0)]);
    if (c && lift === 0) return "Dead body";
    const i = ix(tx, ty);
    if (!explored[i]) continue;
    const o = objs.get(i);
    if (o){
      let s = OBJ[o.type].n;
      if (OBJ[o.type].cont && o.items) s += o.items.length ? "" : " (empty)";
      return s;
    }
    const f = feats.get(i);
    if (f){
      if (f.type === "door") return (f.broken ? "Broken door" : f.open ? "Open door" : f.locked ? "Door (locked)" : "Door") + (f.bar ? `, ${f.bar} plank${f.bar > 1 ? "s" : ""}` : "");
      return (f.broken ? "Broken window" : f.open ? "Open window" : "Window") + (f.bar ? `, ${f.bar} plank${f.bar > 1 ? "s" : ""}` : "");
    }
    const fl = floorItems.get(i);
    if (fl && fl.length && lift === 0) return fl.length === 1 ? ITEMS[fl[0].id].n + " (on the floor)" : `${fl.length} items on the floor`;
    if (lift === 0 && tile[i] === T.TREE) return "Tree";
  }
  return null;
}
