// ============================================================
// Part 9: smooth inventory, body condition screen, doors
// ============================================================

// ---------- inventory: one click, drag and drop, near-instant ----------
function transferTime(it){ return (0.12 + ITEMS[it.id].w * 0.06) * (P.traits.has("organized") ? 0.7 : 1); }
const CAT_ICON = { food: "🥫", drink: "🥤", med: "✚", weapon: "🔨", tool: "🔧", mat: "🪵", book: "📕", mag: "📰", bag: "🎒", misc: "▫️" };
let invDrag = null, invSig = "";
const pending = new Set();

function openInv(){ closePanels(); $("inv").classList.remove("hidden"); renderInv(); }
function moveItem(it, from, to, done){
  if (pending.has(it)) return;
  pending.add(it);
  act("", transferTime(it), () => {
    pending.delete(it);
    const k = from.indexOf(it); if (k < 0) return;
    from.splice(k, 1);
    if (to === "player"){ giveItem(it); toast(it); } else to.push(it);
    if (P.weapon === it && to !== "player") P.weapon = null;
    done && done();
    if (panelOpen("inv")) renderInv();
  }, { quiet: true, onCancel: () => pending.delete(it) });
  if (panelOpen("inv")) renderInv();
}
function queueTake(it, c){ moveItem(it, c.list, "player"); }
function playerListOf(it){ return P.inv.includes(it) ? P.inv : P.bag && P.bag.items.includes(it) ? P.bag.items : null; }
function putItem(it, c){ const from = playerListOf(it); if (from) moveItem(it, from, c.list); }

function wireDrop(node, cont){
  node.addEventListener("dragover", e => { if (invDrag && (cont ? !invDrag.cont : !!invDrag.cont)){ e.preventDefault(); node.classList.add("over"); } });
  node.addEventListener("dragleave", () => node.classList.remove("over"));
  node.addEventListener("drop", e => {
    e.preventDefault(); node.classList.remove("over");
    if (!invDrag) return;
    if (cont && !invDrag.cont) putItem(invDrag.it, cont);
    else if (!cont && invDrag.cont) queueTake(invDrag.it, invDrag.cont);
    invDrag = null;
  });
}
function defaultUse(it){
  const d = ITEMS[it.id];
  if (d.cat === "weapon"){ P.weapon = P.weapon === it ? null : it; renderInv(); return; }
  if (d.cat === "bag" && !P.bag){ removeItem(it); P.bag = it; renderInv(); return; }
  if (useLabel(it) && canUse(it) === true) useItem(it);
}
function itemOptions(it){
  const d = ITEMS[it.id], opts = [];
  const ul = useLabel(it), cu = canUse(it);
  if (ul) opts.push({ label: cu === true ? ul : `${ul} (${cu})`, off: cu !== true, fn: () => useItem(it) });
  if (d.cat === "weapon") opts.push(P.weapon === it ? { label: "Unequip", fn: () => { P.weapon = null; } } : { label: "Equip in hand", fn: () => { P.weapon = it; } });
  if (d.cat === "bag" && !P.bag) opts.push({ label: "Wear on back", fn: () => { removeItem(it); P.bag = it; } });
  for (const c of nearbyContainers().filter(c => !c.floor).slice(0, 3)) opts.push({ label: `Put in ${c.name.toLowerCase()}`, fn: () => putItem(it, c) });
  opts.push({ label: "Drop on floor", fn: () => { const from = playerListOf(it); if (!from) return; const i = ix(P.x | 0, P.y | 0), fl = floorItems.get(i) || []; floorItems.set(i, fl); moveItem(it, from, fl); } });
  return opts;
}
function itemMenu(e, opts){
  closeItemMenu();
  const m = el("div", "itemmenu"); m.id = "itemmenu";
  for (const o of opts){
    const d = el("div", o.off ? "off" : "", esc(o.label));
    d.onclick = ev => { ev.stopPropagation(); if (o.off) return; closeItemMenu(); o.fn(); if (panelOpen("inv")) renderInv(); };
    m.appendChild(d);
  }
  m.style.left = Math.min(e.clientX, innerWidth - 220) + "px"; m.style.top = Math.min(e.clientY, innerHeight - 30 * opts.length - 10) + "px";
  document.body.appendChild(m);
  e.stopPropagation && e.stopPropagation();
}
function closeItemMenu(){ const m = $("itemmenu"); if (m) m.remove(); }
addEventListener("click", e => { if (!e.target.closest(".itemmenu")) closeItemMenu(); });
// keep the nearby list in step with where you are standing
function refreshInvIfMoved(){
  if (!panelOpen("inv") || invDrag) return;
  const sig = nearbyContainers().map(c => c.name + c.list.length).join("|");
  if (sig !== invSig) renderInv();
}

// ============================================================
// Condition screen: body model + needs
// ============================================================
const BODY = {
  head: null,
  neck: [[90,62],[110,62],[112,77],[88,77]],
  torso_u: [[62,80],[80,74],[100,72],[120,74],[138,80],[135,115],[134,150],[100,155],[66,150],[65,115]],
  torso_l: [[66,153],[100,158],[134,153],[132,178],[131,201],[100,206],[69,201],[68,178]],
  groin: [[69,204],[100,209],[131,204],[128,226],[100,242],[72,226]],
  uarm_r: [[60,82],[50,86],[42,100],[37,150],[54,152],[59,112],[62,100]],
  farm_r: [[37,154],[54,156],[50,212],[33,210]],
  hand_r: [[32,214],[50,216],[52,236],[44,250],[34,244],[30,230]],
  thigh_r: [[72,230],[99,245],[97,320],[77,320],[71,270]],
  shin_r: [[77,324],[97,324],[95,390],[81,390]],
  foot_r: [[80,394],[96,394],[98,408],[70,410],[72,402]],
};
for (const k of ["uarm", "farm", "hand", "thigh", "shin", "foot"]) BODY[k + "_l"] = BODY[k + "_r"].map(([x, y]) => [200 - x, y]);
let condUI = null, condSel = null;
const pct = v => Math.round(clamp(v, 0, 100));
const METERS = [
  ["Body", [["Health", () => P.health], ["Stamina", () => P.endurance * 100], ["Comfort", () => 100 - Math.min(100, P.pain * 1.4)]]],
  ["Needs", [["Fed", () => (1 - P.hunger) * 100], ["Hydrated", () => (1 - P.thirst) * 100], ["Rested", () => (1 - P.fatigue) * 100]]],
  ["Mind", [["Mood", () => 100 - P.unhappy], ["Engaged", () => 100 - P.boredom], ["Composure", () => 100 - P.panic]]],
];
function woundRank(w){ return w.type === "bite" ? 4 : w.type === "laceration" || w.type === "glass" ? 3 : 2; }
function partState(part){
  const ws = P.wounds.filter(w => w.part === part);
  if (!ws.length) return "ok";
  if (ws.some(w => w.inf)) return "infected";
  const open = ws.filter(w => !w.bandaged);
  if (!open.length) return "bandaged";
  const top = Math.max(...open.map(woundRank));
  return top === 4 ? "bite" : top === 3 ? "cut" : "scratch";
}
function buildCondition(){
  const p = $("health"); p.innerHTML = ""; p.className = "panel cond";
  const close = el("button", "close", "close"); close.onclick = closePanels; p.appendChild(close);
  const L = el("div", "c-left"), C = el("div", "c-mid"), Rt = el("div", "c-right");
  const head = el("div", "c-head"); L.appendChild(head);
  const meters = [];
  for (const [grp, list] of METERS){
    L.appendChild(el("div", "c-grp", grp));
    for (const [name, fn] of list){
      const m = el("div", "meter", `<div class="ml"><span>${name}</span><span class="mv"></span></div><div class="seg">${"<i></i>".repeat(12)}</div>`);
      L.appendChild(m); meters.push({ m, fn, v: m.querySelector(".mv"), segs: [...m.querySelectorAll("i")] });
    }
  }
  // body model
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 200 420"); svg.classList.add("body");
  svg.innerHTML = `<defs><pattern id="bandp" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" fill="rgba(235,235,225,.55)"/><rect width="2" height="6" fill="rgba(160,160,150,.6)"/></pattern></defs>
    <g class="grid">${[60, 140, 220, 300, 380].map(y => `<line x1="0" x2="200" y1="${y}" y2="${y}"/>`).join("")}</g>`;
  const parts = {};
  for (const [id] of PARTS){
    let shape;
    if (id === "head"){ shape = document.createElementNS(NS, "ellipse"); shape.setAttribute("cx", 100); shape.setAttribute("cy", 36); shape.setAttribute("rx", 21); shape.setAttribute("ry", 25); }
    else { shape = document.createElementNS(NS, "polygon"); shape.setAttribute("points", BODY[id].map(p => p.join(",")).join(" ")); }
    shape.classList.add("bp"); shape.dataset.part = id;
    shape.addEventListener("click", () => { condSel = condSel === id ? null : id; condUI.sig = ""; updateCondition(); });
    shape.addEventListener("mouseenter", () => { condUI.hover.textContent = PARTNAME[id]; });
    shape.addEventListener("mouseleave", () => { condUI.hover.textContent = ""; });
    const t = document.createElementNS(NS, "title"); t.textContent = PARTNAME[id]; shape.appendChild(t);
    svg.appendChild(shape); parts[id] = shape;
  }
  const hover = el("div", "c-hover");
  C.appendChild(svg); C.appendChild(hover);
  const chips = el("div", "chips"); C.appendChild(chips);
  const legend = el("div", "legend", `<span class="lg scratch"></span>scratch <span class="lg cut"></span>cut <span class="lg bite"></span>bite <span class="lg bandaged"></span>bandaged <span class="lg infected"></span>infected`);
  C.appendChild(legend);
  p.appendChild(L); p.appendChild(C); p.appendChild(Rt);
  condUI = { head, meters, parts, chips, right: Rt, hover, sig: "" };
  updateCondition();
}
function updateCondition(){
  if (!condUI || !panelOpen("health")) return;
  const U = condUI, hp = P.health;
  const bleeding = P.wounds.some(w => w.bleed && !w.bandaged);
  const word = bleeding ? "You're bleeding" : hp > 90 ? (P.wounds.length ? "Hurt, but holding up" : "You feel fine") : hp > 70 ? "You've been hurt" : hp > 45 ? "You're badly hurt" : hp > 25 ? "Critical condition" : "Close to death";
  const d = daysSurvived();
  U.head.innerHTML = `<div class="c-name">${esc(P.name)}</div><div class="c-sub">${esc(OCCS[P.occ].n)}, day ${Math.floor(d) + 1} of the outbreak</div><div class="c-word">${word}</div>`;
  for (const m of U.meters){
    const v = pct(m.fn()), on = Math.round(v / 100 * 12);
    m.v.textContent = v;
    m.m.className = "meter" + (v < 25 ? " low" : v < 50 ? " mid" : "");
    m.segs.forEach((s, k) => s.classList.toggle("on", k < on));
  }
  for (const [id, shape] of Object.entries(U.parts)){
    const st = partState(id), bleed = P.wounds.some(w => w.part === id && w.bleed && !w.bandaged);
    shape.setAttribute("class", `bp ${st}${bleed ? " bleed" : ""}${condSel === id ? " sel" : ""}`);
  }
  const act_ = VITALS.filter(v => G.vit[v.id] > 0).map(v => `<span class="chip l${G.vit[v.id]}">${esc(v.n[G.vit[v.id] - 1])}</span>`);
  if (P.fullT > 0) act_.unshift(`<span class="chip good">Well fed</span>`);
  if (P.painkill > 0) act_.push(`<span class="chip good">Painkillers</span>`);
  U.chips.innerHTML = act_.join("") || `<span class="chip good">Nothing out of the ordinary</span>`;
  // the treatment column only rebuilds when something actually changed
  const sig = condSel + "|" + P.wounds.map(w => w.part + w.type + +w.bandaged + +w.dirty + +w.inf + +!!w.glassIn + +!!w.stitched + +!!w.clean + +w.bleed).join(",") + "|" + supplySig() + (P.action ? P.action.name : "");
  if (sig !== U.sig){ U.sig = sig; renderTreatment(); }
}
function supplyCount(tag){ return allCarried().filter(it => ITEMS[it.id].tags.includes(tag)).reduce((s, it) => s + (it.uses ?? 1), 0); }
function supplySig(){ return ["bandage", "disinfect", "suture", "tweezers", "painkiller"].map(supplyCount).join("."); }
function renderTreatment(){
  const R_ = condUI.right; R_.innerHTML = "";
  const list = condSel ? P.wounds.filter(w => w.part === condSel) : P.wounds;
  R_.appendChild(el("div", "c-title", condSel ? esc(PARTNAME[condSel]) : "Injuries"));
  if (!list.length) R_.appendChild(el("div", "c-none", condSel ? "No injuries here." : "No injuries. Click a body part to inspect it."));
  for (const w of list){
    const box = el("div", "wound");
    const st = [];
    if (w.bleed && !w.bandaged) st.push(`<span class="t bad">bleeding</span>`);
    if (w.bandaged) st.push(`<span class="t">${w.dirty ? "dirty bandage" : "bandaged"}</span>`);
    if (w.inf) st.push(`<span class="t bad">infected</span>`);
    if (w.glassIn) st.push(`<span class="t bad">glass inside</span>`);
    if (w.stitched) st.push(`<span class="t">stitched</span>`);
    box.appendChild(el("div", "w-name", `${esc(WOUND[w.type].n)}${condSel ? "" : ` <span class="w-part">${esc(PARTNAME[w.part].toLowerCase())}</span>`}`));
    if (st.length) box.appendChild(el("div", "w-tags", st.join("")));
    const btns = el("div", "w-btns");
    const add = (label, ok, fn) => { const b = el("button", ok ? "" : "off", label); b.onclick = () => { if (!ok) return; fn(); condUI.sig = ""; }; btns.appendChild(b); };
    if (!w.bandaged || w.dirty) add(w.bandaged ? "Change bandage" : "Bandage", supplyCount("bandage") > 0, () => { if (w.bandaged) w.bandaged = false; bandage(w); });
    if (w.inf || !w.clean) add("Disinfect", supplyCount("disinfect") > 0, () => disinfect(w));
    if (w.glassIn) add("Remove glass", true, () => removeGlass(w));
    if ((w.type === "laceration" || w.type === "bite" || w.type === "glass") && !w.stitched) add("Stitch", supplyCount("suture") > 0, () => stitch(w));
    box.appendChild(btns);
    box.onmouseenter = () => condUI.parts[w.part].classList.add("hl");
    box.onmouseleave = () => condUI.parts[w.part].classList.remove("hl");
    R_.appendChild(box);
  }
  R_.appendChild(el("div", "c-title small", "Supplies"));
  const sup = [["Bandages", "bandage"], ["Disinfectant", "disinfect"], ["Needle and thread", "suture"], ["Tweezers", "tweezers"], ["Painkillers", "painkiller"]];
  R_.appendChild(el("div", "supplies", sup.map(([n, t]) => { const c = supplyCount(t); return `<div class="${c ? "" : "none"}"><span>${n}</span><span>${c}</span></div>`; }).join("")));
  const pills = findTag("painkiller");
  if (pills && P.pain > 8 && P.painkill <= 0){ const b = el("button", "wide", "Take painkillers"); b.onclick = () => { useItem(pills); condUI.sig = ""; }; R_.appendChild(b); }
  if (P.action && P.action.name) R_.appendChild(el("div", "c-doing", P.action.name + "..."));
}
function renderHealth(){ if (!condUI || !$("health").querySelector(".c-left")) buildCondition(); else { condUI.sig = ""; updateCondition(); } }
