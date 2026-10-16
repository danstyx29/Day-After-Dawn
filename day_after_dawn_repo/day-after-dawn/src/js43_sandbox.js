// ============================================================
// Part 43: the difficulty ladder and a Sandbox, as the original does it.
//  - Presets: Builder, Survivor, Canon (Apocalypse), Apocalypse+, Extinction, Sandbox.
//  - Population grows from a start multiplier to a peak by a set day.
//  - Loot is set per category like the original's ten sliders.
//  - Utilities and the helicopter follow the preset (the original's random first month on the easy end).
//  - Takedown odds now come from knife skill.
//  - Porch lights are proper wall lanterns; floor items show what they are.
// ============================================================
const LOOT_CATS = ["freshfood", "canned", "melee", "ranged", "ammo", "medical", "survival", "mechanics", "literature", "other"];
const LOOT_CAT_N = { freshfood: "Fresh food", canned: "Tinned and dry food", melee: "Melee weapons", ranged: "Guns", ammo: "Ammo", medical: "Medical", survival: "Survival gear", mechanics: "Mechanics", literature: "Books and magazines", other: "Everything else" };
function lootCat(id){
  const d = ITEMS[id]; if (!d) return "other";
  if (d.cat === "food" || d.cat === "drink") return d.fresh ? "freshfood" : "canned";
  if (d.cat === "weapon") return GUNS[id] ? "ranged" : "melee";
  if (d.cat === "ammo") return "ammo";
  if (d.cat === "med" || d.cat === "medical") return "medical";
  if (d.cat === "part" || ["wrench", "jack", "lugwrench", "engineparts", "gascan"].includes(id)) return "mechanics";
  if (d.cat === "book" || d.cat === "mag") return "literature";
  if (["tool", "bag", "clothing", "trap"].includes(d.cat) || ["water", "matches", "lighter", "batteries", "flashlight", "candle"].includes(id)) return "survival";
  return "other";
}
const BASECAT = () => Object.fromEntries(LOOT_CATS.map(k => [k, 1]));
Object.assign(PRESETS, {
  builder:    { n: "Builder", pop: .35, peak: .35, peakDay: 28, loot: 1.4, sprint: 0, kit: true, util: "original", d: "Few zombies, plenty to find, utilities last a random first month." },
  survivor:   { n: "Survivor", pop: .8, peak: .8, peakDay: 28, loot: 1.15, sprint: 0, kit: true, util: "original", d: "A starter kit, fewer dead, a little more to find, the original's utility timing." },
  apocalypse: { n: "Apocalypse (canon)", pop: 1, peak: 1, peakDay: 28, loot: .85, sprint: 0, kit: false, util: "ours", d: "Canon: no kit, scarcer loot, utilities fail within the first week or so." },
  apocplus:   { n: "Apocalypse+", pop: 1, peak: 1.5, peakDay: 28, loot: .7, sprint: 0, kit: false, util: "ours", d: "The original's ramp: the dead grow to one and a half times by day 28. Stingier loot." },
  extinction: { n: "Extinction", pop: 1.5, peak: 2, peakDay: 28, loot: .55, sprint: .2, kit: false, util: "early", d: "Brutal: more of them, growing, some sprint, almost nothing left, the lights go out fast." },
  sandbox:    { n: "Sandbox", pop: 1, peak: 1, peakDay: 28, loot: 1, sprint: 0, kit: false, util: "ours", d: "Set every number yourself below." },
});
const SANDBOX = { pop: 1, peak: 1.5, peakDay: 28, loot: 1, sprint: 0, kit: false, util: "ours", waterMin: 3, waterMax: 8, powerMin: 4, powerMax: 10, heliMin: 2, heliMax: 4, cat: BASECAT() };
function applyPreset(k){
  const p = k === "sandbox" ? Object.assign({}, PRESETS.sandbox, SANDBOX) : (PRESETS[k] || PRESETS.survivor);
  CFG.popMul = p.pop; CFG.popPeak = p.peak ?? p.pop; CFG.popPeakDay = p.peakDay || 28; CFG.lootMul = p.loot; CFG.sprinterChance = p.sprint; CFG.kitOn = p.kit;
  CFG.lootCat = k === "sandbox" ? Object.assign(BASECAT(), SANDBOX.cat) : BASECAT(); CFG.util = p.util || "ours"; PRESET_KEY = k;
}
// per-category loot: each roll is kept with (overall x category) probability; above 1, extra rolls come with the excess
function rollLoot(o, table){
  o.items = [];
  if (o.extra){ o.items.push(...o.extra); delete o.extra; }
  const L = LOOT[o.loot || table]; if (!L) return;
  const base = ri(L.rolls[0], L.rolls[1]), mul = CFG.lootMul || 1, cm = CFG.lootCat || null;
  for (let k = 0; k < base + (P.traits.has("lucky") && R() < .4 ? 1 : 0); k++){
    const id = wpick(L.items), m = mul * (cm ? cm[lootCat(id)] ?? 1 : 1);
    if (R() < Math.min(1, m)) o.items.push(makeItem(id));
    if (m > 1 && R() < m - 1) o.items.push(makeItem(wpick(L.items)));
  }
  fixLootStacks(o);
  o.lastT = G.min;
}
// utilities and the helicopter, by preset
function applyUtilities(){
  if (G && G.sandbox && PRESET_KEY === "sandbox" && !SANDBOX._loaded){ Object.assign(SANDBOX, G.sandbox); SANDBOX._loaded = true; applyPreset("sandbox"); }
  if (!G || G.utilSet) return; G.utilSet = true; if (PRESET_KEY === "sandbox"){ G.sandbox = JSON.parse(JSON.stringify(SANDBOX)); SANDBOX._loaded = true; }
  const u = PRESET_KEY === "sandbox" ? "sandbox" : CFG.util || "ours", day = 1440, s0 = G.startMin ?? G.min;
  const at = (d0, d1) => s0 + ri(d0, d1) * day + ri(6, 20) * 60;
  if (u === "original"){ G.waterOff = at(1, 30); G.powerOff = at(1, 30); G.heliAt = at(6, 9); }
  else if (u === "early"){ G.waterOff = at(1, 4); G.powerOff = at(2, 5); }
  else if (u === "sandbox"){ G.waterOff = at(SANDBOX.waterMin, SANDBOX.waterMax); G.powerOff = at(SANDBOX.powerMin, SANDBOX.powerMax); G.heliAt = at(SANDBOX.heliMin, SANDBOX.heliMax); }
}
// population growth toward the peak
let popAcc = 0;
function stepPopulation(dm){
  popAcc += dm; if (popAcc < 60) return; popAcc = 0;
  const start = CFG.popMul || 1, peak = CFG.popPeak ?? start; if (peak <= start + .001) return;
  const days = daysSurvived(), f = start + (peak - start) * Math.min(1, days / (CFG.popPeakDay || 28));
  let natural = 0, grown = 0; for (const z of Z){ if (!z.alive) continue; if (z.grown) grown++; else natural++; }
  const want = Math.round(natural * (f / start - 1));
  let n = Math.min(24, want - grown); if (n <= 0) return;
  for (let tries = 0; tries < n * 20 && n > 0; tries++){
    const a = rf(0, 6.283), r = rf(45, 70), x = P.x + Math.cos(a) * r, y = P.y + Math.sin(a) * r, i = ix(x | 0, y | 0);
    if (!inb(x | 0, y | 0) || y >= PK_Y0 || !pathZ(x | 0, y | 0) || G.vis[i]) continue;
    const z = newZombie((x | 0) + .5, (y | 0) + .5); z.grown = true; z.state = "wander"; z.tx = P.x + rf(-30, 30); z.ty = P.y + rf(-30, 30); Z.push(z); n--;
  }
}
// takedowns: chance from knife skill, much better from behind
function tryTakedown(){
  const z = takedownTarget(); if (!z) return false;
  cancelActions(); P.face = Math.atan2(z.y - P.y, z.x - P.x);
  const behind = angDiff(z.face, P.face) < 1.2;
  const ch = Math.min(.95, .15 + skill("blade") * .07 + (behind ? .3 : 0) + (P.sneaking ? .08 : 0));
  P.swing = { t: 0, dur: .55, hit: true, kind: "stab" }; z.stun = .7;
  setTimeout(() => {
    if (!z.alive) return;
    if (R() < ch){ killZombie(z, "blade"); noise(z.x, z.y, 2); addXP("blade", 6); addXP("sneak", 3); if (typeof sfxStab === "function") sfxStab(); }
    else { z.hp -= .6; z.aware = 1; z.state = "chase"; z.mem = CFG.zMemory; say("It twists away from the blade!", "#ffd27a"); noise(z.x, z.y, 6); }
  }, 330);
  return true;
}
// porch lights: a lantern on the wall beside the door, hidden while you're inside that house
function drawPorchLight(o, dim, a, pw, night){
  const [wx, wy] = o.wall || [o.x, o.y], b = bldId[ix(wx, wy)];
  if (b >= 0 && b === PLAYER_B && indoorsNow()) return;
  const dx = Math.sign(o.x - wx), dy = Math.sign(o.y - wy), fx = wx + .5 + dx * .52, fy = wy + .5 + dy * .52, lit = pw && night, sd = c => shade(c, dim);
  line3([fx - dx * .02, fy - dy * .02, 31], [fx + dx * .1, fy + dy * .1, 31], sd("#2a2a2a"), 1.4, a);
  boxW(fx + dx * .1 - .035, fy + dy * .1 - .035, fx + dx * .1 + .035, fy + dy * .1 + .035, 25, 31, lit ? "#ffe8b0" : sd("#c8c4b4"), a * (lit ? 1 : .85));
  boxW(fx + dx * .1 - .045, fy + dy * .1 - .045, fx + dx * .1 + .045, fy + dy * .1 + .045, 31, 32.5, sd("#2a2a2a"), a);
  if (lit){ const [sx, sy] = S(fx + dx * .1, fy + dy * .1, 28); LIGHTS.push([sx, sy, 3, "255,210,140"]); }
}
// floor items show the item itself
const ICONIMG = new Map();
function iconImg(id){ let im = ICONIMG.get(id); if (!im && typeof iconURL === "function"){ im = new Image(); im.src = iconURL(id); ICONIMG.set(id, im); } return im; }
function drawFloorStack(tx, ty, list){
  const it = list[0], im = iconImg(it.id), [sx, sy] = S(tx + .5, ty + .5, 2), s = 15 * zoom;
  ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(sx, sy + 2 * zoom, s * .45, s * .2, 0, 0, 7); ctx.fill();
  if (im && im.complete && im.naturalWidth) ctx.drawImage(im, sx - s / 2, sy - s * .8, s, s);
  else box(tx, ty, .36, 0, 5, "#c9b98e");
  if (list.length > 1){ ctx.fillStyle = "rgba(230,240,220,.85)"; ctx.font = `${Math.round(8 * zoom + 3)}px monospace`; ctx.fillText(list.length, sx + s * .35, sy - s * .5); }
}
// dawn mist
function stepMist(){ const hr = (G.min / 60) % 24; if (hr > 4.5 && hr < 7.5 && !G.rain && winterness() < .8){ const k = 1 - Math.abs(hr - 6) / 1.5; G.fog = Math.max(G.fog || 0, .22 * k); } }
// the creation screen: the full ladder and a Sandbox panel
(function presetUI(){
  const sel = document.getElementById("diff"); if (!sel) return;
  sel.innerHTML = ["builder", "survivor", "apocalypse", "apocplus", "extinction", "sandbox"].map(k => `<option value="${k}"${k === "survivor" ? " selected" : ""}>${PRESETS[k].n}${k === "survivor" ? " (starter kit)" : ""}</option>`).join("");
  const folder = document.querySelector("#title .folder"); if (!folder) return;
  const box2 = document.createElement("div"); box2.id = "sandboxpanel"; box2.style.cssText = "grid-column:1/-1;display:none;margin-top:8px;border-top:1px dashed #6a604a;padding-top:6px";
  const num = (k, label, v, step, min, max) => `<label style="margin-right:14px;white-space:nowrap">${label} <input data-k="${k}" type="number" step="${step}" min="${min}" max="${max}" value="${v}" style="width:58px;font:inherit"></label>`;
  box2.innerHTML = `<b>Sandbox</b><br>` + num("pop", "Zombies at start ×", 1, .1, 0, 4) + num("peak", "Peak ×", 1.5, .1, 0, 4) + num("peakDay", "Peak on day", 28, 1, 1, 120) + num("sprint", "Sprinters (0-1)", 0, .05, 0, 1) + num("loot", "Loot overall ×", 1, .05, 0, 4) + "<br>"
    + LOOT_CATS.map(c => num("cat." + c, LOOT_CAT_N[c] + " ×", 1, .05, 0, 4)).join("") + "<br>"
    + num("waterMin", "Water off from day", 3, 1, 0, 90) + num("waterMax", "to", 8, 1, 0, 90) + num("powerMin", "Power off from day", 4, 1, 0, 90) + num("powerMax", "to", 10, 1, 0, 90) + num("heliMin", "Helicopter from day", 2, 1, 0, 60) + num("heliMax", "to", 4, 1, 0, 60)
    + `<label style="white-space:nowrap"><input type="checkbox" data-k="kit"> Starter kit</label>`;
  folder.appendChild(box2);
  box2.addEventListener("input", e => { const k = e.target.dataset.k; if (!k) return; const v = e.target.type === "checkbox" ? e.target.checked : +e.target.value; if (k.startsWith("cat.")) SANDBOX.cat[k.slice(4)] = v; else SANDBOX[k] = v; });
  const desc = document.createElement("div"); desc.id = "presetdesc"; desc.style.cssText = "grid-column:1/-1;font-size:14px;opacity:.8;margin-top:4px"; folder.appendChild(desc);
  const upd = () => { box2.style.display = sel.value === "sandbox" ? "block" : "none"; desc.textContent = PRESETS[sel.value].n + ": " + PRESETS[sel.value].d; };
  sel.addEventListener("change", upd); upd();
})();
