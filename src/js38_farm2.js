// ============================================================
// Part 38: crops get sick, weeds grow, seasons matter.
// Mildew (slower growth), pest flies (more water lost), aphids and
// slugs (smaller harvest). A 2% roll each time a crop reaches a new
// stage, doubled by weeds or planting out of season, halved after a
// good dose of fertiliser. Untreated disease worsens every hour,
// spreads to neighbouring plots, and at 60 kills the crop at its
// next stage. Sprays cure it; slug repellent is found, never made.
// ============================================================
Object.assign(ITEMS, {
  spraycan: NI("Empty gardening spray can", .3, "tool", ["spraycan"]), sp_mildew: NI("Mildew spray", .5, "tool", ["sp_mildew"], { uses: 10 }),
  sp_flies: NI("Pest flies spray", .5, "tool", ["sp_flies"], { uses: 10 }), sp_aphid: NI("Aphid spray", .5, "tool", ["sp_aphid"], { uses: 10 }),
  slugrep: NI("Slug repellent", .4, "tool", ["slugrep"], { uses: 10 }), fertilizer: NI("Bag of fertilizer", 2, "tool", ["fertilizer"], { uses: 4 }),
  mag_farm: NI("Farm & Garden Monthly, June 1993", .1, "mag", [], { teach: ["sp_mildew", "sp_flies", "sp_aphid"] }),
});
for (const k in ITEMS){ ITEMS[k].id = k; ITEMS[k].tags = ITEMS[k].tags || []; }
Object.assign(ICON, { spraycan: ["spray", "#4a8a4a"], sp_mildew: ["spray", "#e8e4dc"], sp_flies: ["spray", "#8a6a3a"], sp_aphid: ["spray", "#4a8aa8"], slugrep: ["spray", "#a83a3a"], fertilizer: ["box", "#6a8a3a"], mag_farm: ["book", "#6a8a3a"] });
TRAITS.gardener = { n: "Gardener", cost: 2, d: "Knows how to mix crop sprays, and crops fall sick a little less." };
OCCS.farmer = { n: "Farmer", pts: 2, sk: { farming: 3 }, d: "Knows the land, the seasons and the sprays.", shirt: "#6a5a3a" };
if (typeof KITS !== "undefined") KITS.farmer = [["trowel", 1], ["seed_carrot", 1], ["seed_potato", 1], ["wateringcan", 1]];
const SPRAYR = [
  { id: "sp_mildew", n: "Mix mildew spray", cat: "Farming", in: [["spraycan", 1], ["@milky", 1]], out: [["sp_mildew", 1]], learn: "mag_farm", learnFrom: "Farmers know this, or read Farm & Garden Monthly.", occ: ["farmer"], trait: "gardener", skill: { farming: 0 }, autoLvl: 6, xp: { farming: 4 }, time: 4 },
  { id: "sp_flies", n: "Mix pest flies spray", cat: "Farming", in: [["spraycan", 1], ["cigs", 1], ["water", 1]], out: [["sp_flies", 1]], learn: "mag_farm", learnFrom: "Farmers know this, or read Farm & Garden Monthly.", occ: ["farmer"], trait: "gardener", skill: { farming: 0 }, autoLvl: 6, xp: { farming: 4 }, time: 4 },
  { id: "sp_aphid", n: "Mix aphid spray", cat: "Farming", in: [["spraycan", 1], ["water", 1], ["disinf", 1]], out: [["sp_aphid", 1]], learn: "mag_farm", learnFrom: "Farmers know this, or read Farm & Garden Monthly.", occ: ["farmer"], trait: "gardener", skill: { farming: 0 }, autoLvl: 6, xp: { farming: 4 }, time: 4 },
];
GROUPS.milky = ["milk", "milkb"];
RC.push(...SPRAYR); ALLR.push(...SPRAYR);
if (!CRAFT_CATS.includes("Farming")) CRAFT_CATS.splice(CRAFT_CATS.indexOf("Fishing") + 1, 0, "Farming");
Object.assign(LOOT, { shed: LOOT.shed || { rolls: [1, 3], items: [] } });
for (const t of ["shed", "shelf_hardware", "workshop", "crate"]) if (LOOT[t]) LOOT[t].items.push(["spraycan", 2], ["fertilizer", 1], ["slugrep", .5], ["seed_carrot", 1], ["seed_cabbage", 1], ["seed_potato", 1], ["seed_tomato", 1], ["seed_radish", 1], ["mag_farm", .3]);
// when each crop can go in the ground (months, 1 = January)
const SOW = { seed_carrot: [3, 4, 5, 6, 7], seed_cabbage: [2, 3, 4, 8, 9], seed_potato: [3, 4, 5], seed_tomato: [4, 5, 6], seed_radish: [3, 4, 5, 6, 7, 8, 9] };
const MONTHS2 = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const gameMonth = () => new Date(1993, 6, 14 + Math.floor(G.min / 1440) - CFG.startDay).getMonth() + 1;
const DIS = { mildew: { n: "mildew", cure: "sp_mildew" }, flies: { n: "pest flies", cure: "sp_flies" }, aphids: { n: "aphids", cure: "sp_aphid" }, slugs: { n: "slugs", cure: "slugrep" } };
function plotStage(p){ return p >= .75 ? 3 : p >= .5 ? 2 : p >= .25 ? 1 : 0; }
function plotHour(o){
  if (!o.crop || o.dead) return;
  const outside = bldId[ix(o.x, o.y)] < 0;
  if (G.rain && outside) o.water = 1;
  const w = winterness(), sf = w > .72 ? 0 : 1 - w * .6;
  const dis = o.dis, L = o.disL || 0;
  // weeds come up on their own
  if (R() < .2 / 24) o.weeds = Math.min(3, (o.weeds || 0) + 1);
  const drain = (1 / 40) * (1 + (o.weeds || 0) * .2) * (dis === "flies" ? 1 + L / 50 : 1);
  if (o.water > 0){
    const before = plotStage(o.prog);
    o.prog = Math.min(1.05, o.prog + sf / (CROPS[o.crop].days * 24) * (dis === "mildew" ? 1 - L / 120 : 1) * (o.fert === 2 ? .8 : 1));
    o.water = Math.max(0, o.water - drain); o.dryH = 0;
    const after = plotStage(o.prog);
    if (after > before){
      if (dis && L >= 60){ o.dead = true; return; }
      // a chance of disease at each new stage
      if (!dis) for (const k of Object.keys(DIS)){
        if (k === "aphids" && (typeof airTemp === "function" ? airTemp() : 20) < 10) continue;
        let ch = .02 * ((o.weeds || 0) >= 2 ? 2 : 1) * (o.cursed ? 2 : 1) * (o.bonus ? .5 : 1) * (P.traits.has("gardener") ? .75 : 1) * (k === "mildew" && o.water < .3 ? 1.5 : 1);
        if (R() < ch){ o.dis = k; o.disL = 4; break; }
      }
    }
  } else if (++o.dryH > 72) o.dead = true;
  // disease worsens untreated; aphids back off when the plant is kept dry or it's cold
  if (o.dis){
    if (o.dis === "aphids" && (o.water < .25 || (typeof airTemp === "function" && airTemp() < 5))) o.disL = Math.max(0, o.disL - 2);
    else o.disL = Math.min(100, (o.disL || 0) + 1);
    if (o.disL <= 0){ o.dis = null; o.disL = 0; }
    // and spreads to the plot next door
    if (o.disL > 20 && R() < .03 * o.disL / 60){ for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]){ const n = objs.get(ix(o.x + dx, o.y + dy)); if (n && n.type === "plot" && n.crop && !n.dead && !n.dis){ n.dis = o.dis; n.disL = 3; break; } } }
  }
}
function plotOptions(o, out){
  if (!o.crop){
    const seeds = allCarried().filter(it => CROPS[it.id]); const seen = new Set(), m = gameMonth();
    for (const s of seeds){
      if (seen.has(s.id)) continue; seen.add(s.id);
      const ok = SOW[s.id].includes(m);
      out.push({ label: `Plant ${ITEMS[s.id].n.toLowerCase()}${ok ? "" : " (out of season: it will struggle)"}`, fn: () => act("Planting", 4, () => { removeItem(s); Object.assign(o, { crop: s.id, prog: 0, water: .6, dryH: 0, dead: false, dis: null, disL: 0, cursed: !ok, fert: 0, bonus: false, weeds: 0 }); addXP("farming", 3); say(ok ? "Planted. Keep it watered and the weeds down." : `Planted, but ${MONTHS2[m - 1]} is the wrong time for it. Expect a poor harvest.`); }) });
    }
    if (!seeds.length) out.push({ label: "Plant something (you have no seeds)", off: true });
    return;
  }
  const C = CROPS[o.crop];
  if (o.dead){ out.push({ label: "Clear the dead plants", fn: () => { Object.assign(o, { crop: null, dead: false, dis: null, disL: 0, weeds: 0, fert: 0, cursed: false, bonus: false }); } }); return; }
  const pct = Math.round(Math.min(1, o.prog) * 100), lv = skill("farming");
  let status = `${ITEMS[C.out].n}: ${pct >= 100 ? "ready to harvest" : pct + "% grown"}, ${o.water > .5 ? "well watered" : o.water > 0 ? "a bit dry" : "parched"}`;
  if (o.weeds) status += `, ${["", "a few weeds", "weedy", "choked with weeds"][o.weeds]}`;
  if (o.cursed) status += ", struggling (wrong season)";
  out.push({ label: status, off: true });
  if (o.dis) out.push({ label: lv >= 2 ? `Sick with ${DIS[o.dis].n} (${o.disL >= 60 ? "dying" : o.disL >= 30 ? "bad" : "early"})` : "Something's wrong with it. You can't tell what.", off: true });
  if (o.prog >= 1) out.push({ label: "Harvest", fn: () => act("Harvesting", 5, () => {
    let n = ri(...C.y) + (lv > 4 ? 1 : 0);
    if (o.bonus) n = Math.round(n * 1.25); if (o.cursed) n = Math.ceil(n * .5);
    if (o.dis === "aphids" || o.dis === "slugs") n = Math.max(1, Math.round(n * (1 - o.disL / 100)));
    for (let k = 0; k < n; k++){ const it = makeItem(C.out); it.age = 0; giveItem(it); }
    if (R() < .4 + lv * .05) giveItem(makeItem(o.crop));
    Object.assign(o, { crop: null, dis: null, disL: 0, weeds: 0, fert: 0, cursed: false, bonus: false }); addXP("farming", 8); say(`You harvest ${n} ${ITEMS[C.out].n.toLowerCase()}${n > 1 ? "s" : ""}.`); }) });
  if (o.weeds) out.push({ label: "Pull the weeds", fn: () => act("Weeding", 4, () => { o.weeds = 0; addXP("farming", 2); }) });
  const can = tagItem("watercan") || allCarried().find(it => it.id === "water" || it.id === "water_t");
  if (o.water < .9) out.push({ label: can ? `Water it (${ITEMS[can.id].n.toLowerCase()})` : "Water it (needs water)", off: !can, fn: () => act("Watering", 3, () => { if (can.id === "wateringcan"){ can.uses = (can.uses ?? 10) - 1; if (can.uses <= 0) say("The watering can is empty."); } else removeItem(can); o.water = 1; o.dryH = 0; addXP("farming", 1); }) });
  for (const [k, d] of Object.entries(DIS)){
    const sp = allCarried().find(it => it.id === d.cure && (it.uses ?? 10) > 0); if (!sp) continue;
    out.push({ label: `Spray with ${ITEMS[sp.id].n.toLowerCase()}`, fn: () => act("Spraying", 3, () => { sp.uses = (sp.uses ?? 10) - 1; if (o.dis === k){ o.disL -= 25; if (o.disL <= 0){ o.dis = null; o.disL = 0; say("That's cleared it up."); } else say("Better. It needs another dose."); } else say("It wasn't sick with that."); addXP("farming", 2); }) });
  }
  const fz = allCarried().find(it => it.id === "fertilizer" && (it.uses ?? 4) > 0);
  if (fz) out.push({ label: `Fertilize${o.fert ? ` (dose ${o.fert + 1}: too much can hurt it)` : ""}`, fn: () => act("Fertilizing", 3, () => { fz.uses = (fz.uses ?? 4) - 1; o.fert = (o.fert || 0) + 1; if (o.fert === 1){ o.bonus = true; say("A good feed."); } else if (o.fert === 2){ say("Too much. The leaves are yellowing."); } else { o.cursed = true; o.bonus = false; say("You've burned the roots."); } addXP("farming", 2); }) });
}
