// ============================================================
// Part 42: hotbar slots come from what you wear, as in the original.
// A belt gives two slots (one-handed weapons and tools), a holster one
// (pistols and revolvers), a rifle sling or a backpack one on your back
// (long weapons). Everyone starts with a belt on.
// And a Hardcore HUD: no visibility eye, no sound meter.
// ============================================================
Object.assign(ITEMS, {
  belt: NI("Leather belt", .2, "clothing", [], { slot: "belt", ins: 0, wind: 0, water: 0, bite: 0, scr: 0 }),
  holster: NI("Shoulder holster", .4, "clothing", [], { slot: "holster", ins: 0, wind: 0, water: 0, bite: 0, scr: 0 }),
  sling: NI("Rifle sling", .3, "clothing", [], { slot: "sling", ins: 0, wind: 0, water: 0, bite: 0, scr: 0 }),
});
for (const k of ["belt", "holster", "sling"]) ITEMS[k].id = k;
Object.assign(ICON, { belt: ["rags", "#4a3220"], holster: ["rags", "#2a2220"], sling: ["rags", "#4a5636"] });
addL("wardrobe", [["belt", 2]]); addL("dresser", [["belt", 1]]);
addL("locker_police", [["holster", 3]]); addL("armory", [["holster", 2], ["sling", 1]]);
addL("gunstore", [["holster", 2], ["sling", 2]]); addL("surplus", [["sling", 2], ["belt", 2], ["holster", 1]]); addL("army", [["sling", 2]]);
if (typeof KITS !== "undefined"){ if (KITS.police) KITS.police.push(["holster", 1, { worn: true }]); if (KITS.veteran) KITS.veteran.push(["sling", 1, { worn: true }]); }
const SLOT_NAME = { belt: "Belt", holster: "Holster", back: "Back" };
let HB = [];
function hotbarSlots(){
  const wn = worn(), has = s => wn.some(it => ITEMS[it.id].slot === s), slots = [];
  if (has("belt")) slots.push("belt", "belt");
  if (has("holster")) slots.push("holster");
  if (has("sling") || P.bag) slots.push("back");
  return slots;
}
function fitsSlot(it, s){
  const d = ITEMS[it.id]; if (!d) return false;
  const tool = (d.tags || []).some(t => ["hammer", "saw", "dig", "chop", "cut", "screwdriver", "wrench"].includes(t));
  if (d.cat !== "weapon" && !tool) return false;
  if (s === "holster") return it.id === "pistol9" || it.id === "revolver";
  if (s === "belt") return !d.two && d.w <= 2.5;
  if (s === "back") return !!d.two || d.w > 2.5;
  return false;
}
function hotbarItems(){
  const slots = hotbarSlots(), used = new Set(), carried = allCarried().filter(it => !it.worn);
  return slots.map((s, k) => {
    let it = HB[k] && carried.includes(HB[k]) && fitsSlot(HB[k], s) && !used.has(HB[k]) ? HB[k] : null;
    if (!it) it = carried.find(c => !used.has(c) && fitsSlot(c, s) && !(s === "belt" && slots.includes("holster") && (c.id === "pistol9" || c.id === "revolver")) && (c.cat !== "tool" || true) && (ITEMS[c.id].cat === "weapon" || s !== "back"))
      || carried.find(c => !used.has(c) && fitsSlot(c, s));
    if (it) used.add(it); HB[k] = it || null; return it || null;
  });
}
function updateHotbar(){
  let hb = $("hotbar");
  if (!hb){ hb = document.createElement("div"); hb.id = "hotbar"; document.body.appendChild(hb); }
  const show = G && G.running && P.alive && !P.car;
  hb.style.display = show ? "flex" : "none"; if (!show) return;
  const slots = hotbarSlots(), items = hotbarItems(), sig = slots.join(",") + "|" + items.map(it => it ? it.id + (it === P.weapon ? "*" : "") : "-").join(",");
  if (hb.dataset.sig === sig) return; hb.dataset.sig = sig; hb.innerHTML = "";
  if (!slots.length){ const s = document.createElement("div"); s.className = "hb"; s.style.width = "auto"; s.style.padding = "0 8px"; s.textContent = "No belt"; hb.appendChild(s); return; }
  slots.forEach((sl, k) => {
    const it = items[k], s = document.createElement("div"); s.className = "hb" + (it && it === P.weapon ? " on" : "");
    s.title = SLOT_NAME[sl] + (it ? ": " + ITEMS[it.id].n : "");
    s.innerHTML = `<span class="n">${k + 1}</span><span class="sl">${SLOT_NAME[sl][0]}</span>` + (it && typeof iconURL === "function" ? `<img src="${iconURL(it.id)}" width="30" height="30">` : "");
    s.onclick = () => { if (it){ P.weapon = P.weapon === it ? null : it; say(P.weapon ? `${ITEMS[it.id].n} in hand.` : "Hands free."); } };
    hb.appendChild(s);
  });
}
// ---------- Hardcore HUD ----------
let HARDHUD = false;
(function hardHudOption(){
  const folder = document.querySelector("#title .folder"); if (!folder || document.getElementById("hardhud")) return;
  const d = document.createElement("div"); d.style.cssText = "grid-column:1/-1;margin-top:6px";
  d.innerHTML = `<label style="cursor:pointer"><input type="checkbox" id="hardhud"> Hardcore HUD: no visibility eye and no sound meter. You judge it yourself, as in the original.</label>`;
  folder.appendChild(d);
  document.getElementById("hardhud").onchange = e => { HARDHUD = e.target.checked; };
})();
function applyHardHud(){ if (G && G.hardHUD === undefined) G.hardHUD = HARDHUD; document.body.classList.toggle("hardhud", !!(G && G.hardHUD)); }
// ---------- loot multipliers that mean what they say ----------
// Before, the multiplier scaled the number of rolls and was then rounded, so on containers that roll
// one to three items it barely did anything (x0.7 and x0.85 came out nearly the same). Now each roll
// is kept with that probability (and above 1, extra rolls are added with the excess probability).
function rollLoot(o, table){
  o.items = [];
  if (o.extra){ o.items.push(...o.extra); delete o.extra; }
  const L = LOOT[o.loot || table]; if (!L) return;
  const base = ri(L.rolls[0], L.rolls[1]), mul = CFG.lootMul || 1;
  let n = 0;
  for (let k = 0; k < base; k++){ if (R() < Math.min(1, mul)) n++; if (mul > 1 && R() < mul - 1) n++; }
  if (P.traits.has("lucky")) n += R() < 0.4 ? 1 : 0;
  for (let k = 0; k < n; k++) o.items.push(makeItem(wpick(L.items)));
  fixLootStacks(o);
  o.lastT = G.min;
}
// the creation screen is drawn early; draw it again now every job and trait exists (Farmer, Graceful, Hard of hearing, Gardener)
renderCreation();
