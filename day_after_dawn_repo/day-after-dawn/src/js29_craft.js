// ============================================================
// Part 29: crafting, the way the original does it.
// One recipe format for everything: inputs (by item or tag or
// group, with amounts and "uses"), tools kept, skill levels,
// a workstation if needed, recipes you must learn from magazines,
// time, XP and outputs. Ingredients come from your inventory AND
// containers within reach. Batch crafting. Builds use the same rules.
// ============================================================
Object.assign(SKILLS, {
  tailoring: { n: "Tailoring", grp: "Crafting" }, trapping: { n: "Trapping", grp: "Survival" }, fishing: { n: "Fishing", grp: "Survival" },
  farming: { n: "Farming", grp: "Survival" }, knapping: { n: "Knapping", grp: "Crafting" }, carving: { n: "Carving", grp: "Crafting" },
  pottery: { n: "Pottery", grp: "Crafting" }, masonry: { n: "Masonry", grp: "Crafting" }, blacksmith: { n: "Blacksmithing", grp: "Crafting" }, welding: { n: "Welding", grp: "Crafting" },
});
const NI = (n, w, cat, tags = [], x = {}) => Object.assign({ n, w, cat, tags }, x);
Object.assign(ITEMS, {
  scissors: NI("Scissors", .2, "tool", ["scissors"]), thread: NI("Spool of thread", .1, "mat", ["thread"], { uses: 20 }), twine: NI("Twine", .1, "mat", ["twine"]),
  wire: NI("Wire", .2, "mat", ["wire"]), denim: NI("Denim strips", .1, "mat", ["fabric"]), leatherstrip: NI("Leather strips", .15, "mat", ["fabric"]),
  lighter: NI("Lighter", .05, "tool", ["firestarter"], { uses: 40 }), matches: NI("Box of matches", .05, "tool", ["firestarter"], { uses: 12 }),
  trowel: NI("Hand trowel", .4, "tool", ["dig"]), wateringcan: NI("Watering can", .8, "tool", ["watercan"], { uses: 10 }), fishrod: NI("Fishing rod", 1, "tool", ["fishing"]),
  pliers: NI("Pliers", .3, "tool", ["pliers"]), weldtorch: NI("Propane torch", 1.2, "tool", ["welding"], { uses: 30 }), weldmask: NI("Welder's mask", 1, "tool", ["weldmask"]),
  tongs: NI("Tongs", .6, "tool", ["tongs"]), whetstone: NI("Whetstone", .4, "tool", ["sharpen"]), stonehammer: NI("Stone hammer", 1, "tool", ["hammer"]),
  flint: NI("Flint", .2, "mat", ["flint"]), clay: NI("Clay", .5, "mat", ["clay"]), charcoal: NI("Charcoal", .3, "mat", ["charcoal"]), scrapmetal: NI("Scrap metal", .8, "mat", ["scrap"]),
  metalsheet: NI("Sheet metal", 3, "mat", ["metalsheet"]), ironbar: NI("Iron bar", 1.5, "mat", ["ironbar"]), stick: NI("Wooden stick", .3, "mat", ["stick"]),
  elecscrap: NI("Electronics scrap", .1, "mat", ["elec"]), gunpowder: NI("Gunpowder", .05, "mat", ["powder"]), gasbottle: NI("Bottle of gasoline", .9, "misc", ["gasbottle"]),
  molotov: NI("Molotov cocktail", 1, "misc", [], { throwable: true }), pipebomb: NI("Pipe bomb", 1.2, "misc", [], { throwable: true }),
  alarmclock: NI("Alarm clock", .3, "misc", ["clock"]), timer: NI("Timer", .2, "mat", ["timer"]), remote: NI("Remote controller", .2, "tool", ["remote"]),
  noisegen: NI("Noise generator", .6, "misc"), noisetimer: NI("Timed noise maker", .7, "misc"), remotenoise: NI("Remote noise maker", .7, "misc"),
  extinguisher: NI("Fire extinguisher", 3, "tool", ["extinguish"], { uses: 6 }), ducttape: NI("Duct tape", .2, "mat", ["tape"], { uses: 4 }), glue: NI("Glue", .1, "mat", ["glue"], { uses: 3 }),
  woodglue: NI("Wood glue", .2, "mat", ["woodglue"], { uses: 3 }), screws: NI("Box of screws", .2, "mat", ["screws"]), worm: NI("Worm", .01, "food", ["bait"], { hun: .01, unh: 10 }),
  seed_carrot: NI("Carrot seeds", .05, "seed"), seed_cabbage: NI("Cabbage seeds", .05, "seed"), seed_potato: NI("Seed potatoes", .3, "seed"), seed_tomato: NI("Tomato seeds", .05, "seed"), seed_radish: NI("Radish seeds", .05, "seed"),
  carrot: NI("Carrot", .1, "food", ["produce"], { hun: .06, fresh: 14 }), cabbage: NI("Cabbage", .8, "food", ["produce"], { hun: .12, fresh: 10 }), potato: NI("Potato", .3, "food", ["produce"], { hun: .1, fresh: 20, unh: 3 }),
  tomato: NI("Tomato", .2, "food", ["produce"], { hun: .05, thi: -.02, fresh: 7 }), radish: NI("Radish", .05, "food", ["produce"], { hun: .03, fresh: 8 }),
  deadrabbit: NI("Dead rabbit", 1.5, "misc", ["carcass"], { fresh: 2 }), deadsquirrel: NI("Dead squirrel", .6, "misc", ["carcass"], { fresh: 2 }), deadbird: NI("Dead bird", .3, "misc", ["carcass"], { fresh: 2 }),
  rawsmallmeat: NI("Raw game meat", .3, "food", ["rawmeat"], { hun: .1, raw: true, fresh: 2 }), smallmeat: NI("Cooked game meat", .3, "food", ["cookedmeat"], { hun: .14, unh: -4, fresh: 3 }),
  rawfish: NI("Raw fish", .6, "food", ["rawmeat"], { hun: .12, raw: true, fresh: 2 }), cookedfish: NI("Cooked fish", .5, "food", ["cookedmeat"], { hun: .16, unh: -6, fresh: 3 }),
  roastveg: NI("Roasted vegetables", .4, "food", [], { hun: .14, unh: -6, fresh: 3 }), salad: NI("Salad", .5, "food", [], { hun: .12, unh: -8, fresh: 2 }),
  sandwich: NI("Sandwich", .3, "food", [], { hun: .2, unh: -10, fresh: 2 }), souppot: NI("Pot of soup", 2, "food", [], { hun: .3, unh: -10, thi: -.1, fresh: 4, empty: "pot" }),
  stirfry: NI("Stir fry", .6, "food", [], { hun: .28, unh: -14, fresh: 3, empty: "pan" }), poultice: NI("Comfrey poultice", .1, "medical", ["poultice"]),
  bandana: NI("Rag bandana", .1, "clothing", [], { slot: "hat", ins: .06, wind: .05, water: .02, bite: .03, scr: .08 }),
  paddedvest: NI("Padded vest", 1.2, "clothing", [], { slot: "jacket", ins: .32, wind: .3, water: .1, bite: .38, scr: .55 }),
  claypot_raw: NI("Unfired clay pot", 1.5, "mat", ["unfired"]), crucible_raw: NI("Unfired crucible", 1, "mat", ["unfired"]), claybowl_raw: NI("Unfired clay bowl", .5, "mat", ["unfired"]),
  crucible: NI("Ceramic crucible", 1, "tool", ["crucible"]), bowl: NI("Bowl", .3, "tool", ["bowl"]),
  snaretrap: NI("Snare trap", .5, "trap"), boxtrap: NI("Box trap", 3, "trap"), sticktrap: NI("Stick trap", .6, "trap"), cagetrap: NI("Cage trap", 2.5, "trap"),
  spikedplank: NI("Spiked plank", 2, "weapon", [], { skill: "longblunt", dmg: [.9, 1.4], range: 1.3, spd: .95, end: .07, cond: 12, kd: .35, crit: .12, two: true }),
  club: NI("Wooden club", 1.2, "weapon", [], { skill: "shortblunt", dmg: [.6, .95], range: 1, spd: .7, end: .045, cond: 18, kd: .35, crit: .05 }),
  stoneknife: NI("Stone knife", .3, "weapon", ["cut"], { skill: "blade", dmg: [.4, .7], range: .8, spd: .45, end: .025, cond: 12, kd: 0, crit: .08 }),
  stoneaxe: NI("Stone axe", 2, "weapon", ["chop"], { skill: "axe", dmg: [.8, 1.3], range: 1.1, spd: .9, end: .06, cond: 18, kd: .25, crit: .1 }),
  stonespear: NI("Stone-tipped spear", 1.5, "weapon", [], { skill: "spear", dmg: [.95, 1.45], range: 1.55, spd: .8, end: .05, cond: 20, kd: .2, crit: .15, two: true }),
  machete: NI("Machete", 1.2, "weapon", ["cut", "chop"], { skill: "blade", dmg: [1.1, 1.65], range: 1.1, spd: .6, end: .045, cond: 45, kd: .1, crit: .2 }),
  metalspear: NI("Metal-tipped spear", 1.8, "weapon", [], { skill: "spear", dmg: [1.15, 1.7], range: 1.6, spd: .8, end: .05, cond: 40, kd: .25, crit: .18, two: true }),
  flintsaw: NI("Flint saw", .6, "tool", ["saw"]),
  mag_trap: NI("The Hunter Magazine", .1, "mag", [], { teach: ["cagetrap", "sticktrap", "boxtrap"] }), mag_fish: NI("Angler's Monthly", .1, "mag", [], { teach: ["fishrod2"] }),
  mag_elec1: NI("Electronics Hobbyist Vol. 1", .1, "mag", [], { teach: ["noisegen", "noisetimer", "timer"] }), mag_elec2: NI("Electronics Hobbyist Vol. 2", .1, "mag", [], { teach: ["remote", "remotenoise", "pipebomb"] }),
  mag_smith: NI("Iron Age Blacksmithing", .1, "mag", [], { teach: ["ironbar", "nails2", "machete", "metalspear", "tongs", "b_forge", "b_anvil"] }),
  mag_weld: NI("Metalwork Magazine", .1, "mag", [], { teach: ["metalbarricade", "b_metalwall", "metalsheet"] }), mag_cook: NI("Good Cooking Magazine", .1, "mag", [], { teach: ["stirfry", "roastveg"] }),
  mag_tailor: NI("Fashionably Late Magazine", .1, "mag", [], { teach: ["paddedvest", "leathergloves"] }), mag_herb: NI("Herbalist Magazine", .1, "mag", [], { teach: ["poultice"] }),
  mag_pottery: NI("Pottery for Beginners", .1, "mag", [], { teach: ["claypot", "crucible_raw", "claybowl", "b_kiln"] }),
});
for (const k in ITEMS){ ITEMS[k].id = k; ITEMS[k].tags = ITEMS[k].tags || []; }
if (ITEMS.needle && !ITEMS.needle.tags.includes("sewing")) ITEMS.needle.tags.push("sewing");
for (const k of ["shovel"]) if (ITEMS[k] && !ITEMS[k].tags.includes("dig")) ITEMS[k].tags.push("dig");
for (const k of ["knife", "hunting", "stoneknife", "machete"]) if (ITEMS[k] && !ITEMS[k].tags.includes("cut")) ITEMS[k].tags.push("cut");
for (const k of ["axe", "hatchet"]) if (ITEMS[k] && !ITEMS[k].tags.includes("chop")) ITEMS[k].tags.push("chop");
if (ITEMS.screwdrv && !ITEMS.screwdrv.tags.includes("screwdriver")) ITEMS.screwdrv.tags.push("screwdriver");
if (ITEMS.wrench && !ITEMS.wrench.tags.includes("wrench")) ITEMS.wrench.tags.push("wrench");
if (ITEMS.claypot === undefined) ITEMS.claypot = Object.assign(NI("Clay pot", 1.5, "tool", ["pot"]), { id: "claypot" });
Object.assign(ICON, {
  scissors: ["scissors", "#c8ccd0"], thread: ["roll", "#e8e0d0"], twine: ["roll", "#a8946a"], wire: ["roll", "#8a8e92"], denim: ["rags", "#3a5a8a"], leatherstrip: ["rags", "#6a4a30"],
  lighter: ["spray", "#c83a2a"], matches: ["box", "#c8a040"], trowel: ["shovel", "#8a8e92"], wateringcan: ["can", "#4a8a4a"], fishrod: ["bat", "#8a6a42"], pliers: ["screwdriver", "#c83a2a"],
  weldtorch: ["spray", "#2a5aa8"], weldmask: ["box", "#3a3a3a"], tongs: ["screwdriver", "#5a5e62"], whetstone: ["box", "#7a7870"], stonehammer: ["hammer", "#7a7870"], flint: ["can", "#5a5a5a"],
  clay: ["box", "#8a6a4a"], charcoal: ["box", "#1e1e1e"], scrapmetal: ["box", "#8a8e92"], metalsheet: ["plank", "#9aa0a4"], ironbar: ["pipe", "#5a5e62"], stick: ["plank", "#8a6a42"],
  elecscrap: ["battery", "#3a8a3a"], gunpowder: ["can", "#2a2a2a"], gasbottle: ["bottle", "#c8a030"], molotov: ["bottle", "#c86a2a"], pipebomb: ["pipe", "#3a3a3a"], alarmclock: ["watch", "#c83a2a"],
  timer: ["watch", "#5a5e62"], remote: ["battery", "#2a2a2a"], noisegen: ["noisemaker", "#3a8a3a"], noisetimer: ["noisemaker", "#c8a040"], remotenoise: ["noisemaker", "#c83a2a"],
  extinguisher: ["spray", "#c8302a"], ducttape: ["roll", "#8a8e92"], glue: ["bottle", "#e8e4dc"], woodglue: ["bottle", "#c8a060"], screws: ["nailbox", "#8a8e92"], worm: ["meat", "#c87a7a"],
  seed_carrot: ["box", "#e8862a"], seed_cabbage: ["box", "#7ac04a"], seed_potato: ["box", "#a8845a"], seed_tomato: ["box", "#d83a2a"], seed_radish: ["box", "#c83a5a"],
  carrot: ["fruit", "#e8862a"], cabbage: ["fruit", "#7ac04a"], potato: ["fruit", "#a8845a"], tomato: ["fruit", "#d83a2a"], radish: ["fruit", "#c83a5a"],
  deadrabbit: ["meat", "#8a7a6a"], deadsquirrel: ["meat", "#7a5a3a"], deadbird: ["meat", "#5a5a6a"], rawsmallmeat: ["meat", "#c8484a"], smallmeat: ["meat", "#8a4a2a"],
  rawfish: ["meat", "#8aa8b8"], cookedfish: ["meat", "#c8945a"], roastveg: ["dish", "#c8862a"], salad: ["dish", "#6aa84a"], sandwich: ["loaf", "#d8b878"], souppot: ["dish", "#a8682a"],
  stirfry: ["dish", "#c8862a"], poultice: ["rags", "#5a8a3a"], bandana: ["rags", "#c83a2a"], paddedvest: ["shirt", "#6a6a5a"], claypot_raw: ["can", "#8a6a4a"], crucible_raw: ["can", "#8a6a4a"],
  claybowl_raw: ["dish", "#8a6a4a"], crucible: ["can", "#b8845a"], bowl: ["dish", "#b8845a"], claypot: ["can", "#b8845a"], snaretrap: ["roll", "#a8946a"], boxtrap: ["box", "#8a6a42"],
  sticktrap: ["plank", "#8a6a42"], cagetrap: ["box", "#8a8e92"], spikedplank: ["bat", "#8a6a42"], club: ["bat", "#6a4a2a"], stoneknife: ["knife", "#7a7870"], stoneaxe: ["axe", "#7a7870"],
  stonespear: ["bat", "#8a6a42"], machete: ["knife", "#c8ccd0"], metalspear: ["bat", "#8a8e92"], flintsaw: ["saw", "#5a5a5a"],
  mag_trap: ["book", "#5a7a3a"], mag_fish: ["book", "#3a6a9a"], mag_elec1: ["book", "#3a8a8a"], mag_elec2: ["book", "#2a5a6a"], mag_smith: ["book", "#6a3a2a"], mag_weld: ["book", "#5a5e62"],
  mag_cook: ["book", "#c8862a"], mag_tailor: ["book", "#a83a7a"], mag_herb: ["book", "#4a8a3a"], mag_pottery: ["book", "#a8684a"],
});
// groups: anything that can stand in for "fabric", "a vegetable", "cotton clothing" and so on
const GROUPS = {
  cotton: ["tshirt", "flannel", "sweater", "hoodie", "sweatpants", "scarf", "woolhat", "bandana"], denimcloth: ["jeans", "denimjacket"], leathercloth: ["leatherjacket", "gloves", "boots"],
  fabric: ["rags", "denim", "leatherstrip"], veg: ["carrot", "cabbage", "potato", "tomato", "radish", "apple", "banana", "peaches"],
  soupable: ["carrot", "cabbage", "potato", "tomato", "radish", "rawsmallmeat", "smallmeat", "rawfish", "cookedfish", "beans", "tuna", "soup", "ham", "rawsteak", "peaches"],
  saladable: ["carrot", "cabbage", "tomato", "radish", "apple", "banana", "peaches", "cheese"], filling: ["cheese", "ham", "pbutter", "tuna", "cookedfish", "smallmeat"],
  fryable: ["carrot", "cabbage", "potato", "tomato", "radish", "rawsmallmeat", "smallmeat", "rawfish", "ham", "rawsteak"], bait: ["carrot", "cabbage", "potato", "tomato", "apple", "bread", "cheese", "pbutter", "cereal", "worm", "banana"],
  carcass: ["deadrabbit", "deadsquirrel", "deadbird"], unfired: ["claypot_raw", "crucible_raw", "claybowl_raw"], stone2: ["stone", "flint"], electronic: ["watch", "alarmclock", "batteries"],
  repairable: [], tape: ["ducttape", "glue"],
};
const matchesKey = (it, key) => { if (!it || !ITEMS[it.id] || it.worn) return false; if (key[0] === "@") return GROUPS[key.slice(1)].includes(it.id); return it.id === key || ITEMS[it.id].tags.includes(key); };
const keyLabel = k => k[0] === "@" ? ({ cotton: "Cotton clothing", denimcloth: "Denim clothing", leathercloth: "Leather clothing", fabric: "Fabric strips (rags, denim or leather)", veg: "Fruit or vegetables", soupable: "Soup ingredients", saladable: "Salad ingredients", filling: "Sandwich filling", fryable: "Stir fry ingredients", bait: "Bait", carcass: "A dead animal", unfired: "Unfired clay", stone2: "Stone or flint", electronic: "Electronics", tape: "Duct tape or glue" })[k.slice(1)] || k
  : ITEMS[k] ? ITEMS[k].n : ({ cut: "Knife or blade", hammer: "Hammer", saw: "Saw", pot: "Cooking pot", disinfect: "Disinfectant", ingredient: "Ingredient", sewing: "Needle", thread: "Thread", dig: "Shovel or trowel", screwdriver: "Screwdriver", wrench: "Wrench",
      pliers: "Pliers", welding: "Propane torch", weldmask: "Welder's mask", tongs: "Tongs", firestarter: "Lighter or matches", fishing: "Fishing rod", sharpen: "Whetstone", chop: "Axe", crucible: "Crucible", bowl: "Bowl", scissors: "Scissors", tape: "Duct tape", glue: "Glue", woodglue: "Wood glue", watercan: "Watering can", twine: "Twine", wire: "Wire", elec: "Electronics scrap", scrap: "Scrap metal", charcoal: "Charcoal", clay: "Clay", stick: "Wooden stick", fabric: "Fabric", flint: "Flint", powder: "Gunpowder", metalsheet: "Sheet metal", ironbar: "Iron bar", timer: "Timer", remote: "Remote", gasbottle: "Bottle of gasoline" })[k] || k;

// ---------- where ingredients come from: your pockets and anything within reach ----------
function craftPool(){
  const pool = allCarried().map(it => ({ it, list: null }));
  try { for (const c of nearbyContainers()) if (c.list && c.name !== "Glovebox") for (const it of c.list) pool.push({ it, list: c.list }); } catch (e) {}
  return pool;
}
const unitsOf = (it, mode) => mode === "use" ? (it.uses ?? ITEMS[it.id].uses ?? 1) : (it.qty || 1);
function countKey(pool, key, mode){ let n = 0; for (const e of pool) if (matchesKey(e.it, key)) n += unitsOf(e.it, mode); return n; }
function takeKey(pool, key, n, mode, got){
  for (const e of pool){
    if (n <= 0) break; if (!matchesKey(e.it, key) || e.gone) continue;
    const it = e.it, have = unitsOf(it, mode), take = Math.min(have, n); n -= take;
    if (mode === "use"){ it.uses = have - take; if (it.uses <= 0){ e.gone = true; dropEntry(e); } }
    else if (it.qty && it.qty > take){ it.qty -= take; }
    else { e.gone = true; dropEntry(e); const em = ITEMS[it.id].empty; if (em && mode !== "keep") giveItem(makeItem(em)); }
    if (got) got.push(it);
  }
}
function dropEntry(e){ if (e.list){ const k = e.list.indexOf(e.it); if (k >= 0) e.list.splice(k, 1); } else removeItem(e.it); }
// ---------- workstations ----------
const STATION_TYPES = {
  fire: o => (o.type === "campfire" && o.fuel > 0) || (o.type === "oven" && powerOn(o.x, o.y)) || (o.type === "forge" && o.lit),
  table: o => ["table", "dtable", "desk", "officedesk", "counter", "workbench", "picnic"].includes(o.type),
  workbench: o => o.type === "workbench", forge: o => o.type === "forge", anvil: o => o.type === "anvil", kiln: o => o.type === "kiln",
  water: o => (o.type === "ksink" || o.type === "bsink" || o.type === "tub") && (o.water !== 0),
};
const STATION_NAMES = { fire: "a fire or a working stove", table: "a table or counter", workbench: "a workbench", forge: "a forge", anvil: "an anvil", kiln: "a kiln", water: "water (a sink or the water's edge)" };
function stationNear(kind){
  const px = Math.floor(P.x), py = Math.floor(P.y);
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){
    const o = objs.get(ix(px + dx, py + dy)); if (o && STATION_TYPES[kind] && STATION_TYPES[kind](o) && Math.hypot(o.x + .5 - P.x, o.y + .5 - P.y) < 2.4) return true;
    if (kind === "water" && tile[ix(px + dx, py + dy)] === T.WATER && Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return true;
  }
  if (kind === "fire" && G.fires) for (const f of G.fires.values()) if (Math.hypot(f.x + .5 - P.x, f.y + .5 - P.y) < 2.2) return true;
  return false;
}
// ---------- learned recipes ----------
const knows = r => !r.learn || (r.trait && P.traits.has(r.trait)) || (P.knownR || []).includes(r.id) || (r.autoLvl && Object.entries(r.skill || {}).every(([s, l]) => skill(s) >= l + r.autoLvl)) || (r.occ && r.occ.includes(P.occ));
function learnRecipes(ids, from){ P.knownR = P.knownR || []; let n = 0; for (const id of ids) if (!P.knownR.includes(id)){ P.knownR.push(id); n++; } say(n ? `You read ${from} and learn ${n} new recipe${n > 1 ? "s" : ""}. Check the crafting menu (B).` : `Nothing in ${from} you don't already know.`, "#ffd27a"); }
// ---------- can I make it? ----------
function recipeState(r, pool){
  pool = pool || craftPool();
  const ins = (r.in || []).map(([k, n, mode]) => ({ k, n, mode, have: countKey(pool, k, mode) }));
  const tools = (r.tools || []).map(t => ({ k: t, have: pool.some(e => matchesKey(e.it, t)) }));
  const skills = Object.entries(r.skill || {}).map(([s, l]) => ({ s, l, have: skill(s) >= l }));
  const sts = recipeStations(r); const station = sts.length ? { k: sts.find(q => !stationNear(q)) || sts[0], have: sts.every(q => stationNear(q)) } : null;
  const evo = r.evolve ? { ...r.evolve, have: countKey(pool, r.evolve.group) } : null;
  const known = knows(r), target = r.target ? r.target() : true;
  const ok = known && ins.every(i => i.have >= i.n) && tools.every(t => t.have) && skills.every(s => s.have) && (!station || station.have) && (!evo || evo.have >= evo.min) && !!target;
  return { ok: !!ok, ins, tools, skills, station, evo, known: !!known, target };
}
function whyNot(r){
  const st = recipeState(r);
  if (st.ok) return null;
  if (!st.known) return `You don't know how. ${r.learnFrom || "Find the right magazine."}`;
  const s = st.skills.find(x => !x.have); if (s) return `Needs ${SKILLS[s.s].n} ${s.l}.`;
  if (st.station && !st.station.have) return `Needs ${STATION_NAMES[st.station.k]} nearby.`;
  const t = st.tools.find(x => !x.have); if (t) return `Needs ${keyLabel(t.k).toLowerCase()}.`;
  const i = st.ins.find(x => x.have < x.n); if (i) return `Needs ${i.n > 1 ? i.n + " " : ""}${keyLabel(i.k).toLowerCase()}.`;
  if (st.evo && st.evo.have < st.evo.min) return `Needs at least ${st.evo.min} ${keyLabel(st.evo.group).toLowerCase()}.`;
  if (!st.target) return r.noTarget || "Nothing to use it on.";
  return "Can't do that right now.";
}
function mainSkill(r){ const s = Object.keys(r.skill || r.xp || {})[0]; return s ? skill(s) : 0; }
function doCraft(r, times = 1){
  const why = whyNot(r); if (why) return say(why);
  const tm = Math.max(1, (r.time || 3) * (1 - Math.min(.5, mainSkill(r) * .045)) * (stationNear("table") && !r.station ? .85 : 1));
  act(r.n, tm, () => {
    if (whyNot(r)) return say("You no longer have what you need.");
    const pool = craftPool(), got = [];
    for (const [k, n, mode] of r.in || []) takeKey(pool, k, n, mode, got);
    let evoGot = [];
    if (r.evolve){ const n = Math.min(r.evolve.max, countKey(pool, r.evolve.group)); takeKey(pool, r.evolve.group, n, null, evoGot); }
    for (const t of r.useTools || []) takeKey(pool, t, 1, "use");
    if (r.fn) r.fn(got, evoGot);
    else for (const [id, n, extra] of r.out || []) for (let i = 0; i < n; i++){ const it = makeItem(id); if (ITEMS[id].fresh) it.age = 0; if (extra) Object.assign(it, typeof extra === "function" ? extra() : extra); if (ITEMS[id].uses && it.uses === undefined) it.uses = ITEMS[id].uses; giveItem(it); toast(it); }
    if (r.out && r.out[0] && r.evolve) { /* evolved outputs are made in fn */ }
    for (const [s, a] of Object.entries(r.xp || {})) addXP(s, a);
    if (typeof sfxCraftDone === "function") sfxCraftDone(r);
    if (times > 1 && !whyNot(r)) doCraft(r, times - 1);
    if (panelOpen("craft")) renderCraft();
  }, { noise: r.noise || 0, noiseEvery: r.noise ? 1.2 : 0, craft: r });
}
// evolved dishes add up what went in
function evolvedDish(id, items, base){
  const it = makeItem(id); it.age = 0;
  let hun = base.hun || 0, unh = base.unh || 0, thi = base.thi || 0;
  const kinds = new Set();
  for (const x of items){ const d = ITEMS[x.id]; hun += (x.hun ?? d.hun ?? 0) * (1 + skill("cooking") * .04); thi += (d.thi || 0); kinds.add(x.id); }
  unh -= kinds.size * 3 + skill("cooking");
  it.hun = Math.min(1, hun); it.unh = unh; it.thi = thi; it.ing = [...kinds].map(k => ITEMS[k].n.toLowerCase()).slice(0, 4).join(", ");
  giveItem(it); toast(it);
}

// ============================================================
// The recipes
// ============================================================
for (const k of ["scissors", "knife", "hunting", "stoneknife", "machete"]) if (ITEMS[k] && !ITEMS[k].tags.includes("cutcloth")) ITEMS[k].tags.push("cutcloth");
const RC = [];
const rr = (id, n, cat, o) => RC.push(Object.assign({ id, n, cat }, o));
const wornTarget = (test) => () => worn().find(test) || allCarried().find(it => ITEMS[it.id].cat === "clothing" && test(it));
const damagedWeapon = (test) => () => { const w = P.weapon; if (w && test(w) && (w.cond ?? 1) < ITEMS[w.id].cond) return w; return allCarried().find(it => ITEMS[it.id].cat === "weapon" && test(it) && (it.cond ?? 1) < ITEMS[it.id].cond); };
const isWood = it => ["bat", "spear", "club", "spikedplank", "rollpin", "stonespear", "spikedbat"].includes(it.id);
// ---- survival
rr("rags_cloth", "Rip clothing into rags", "Survival", { in: [["@cotton", 1]], out: [["rags", 3]], time: 3, d: "Cotton clothing you aren't wearing." });
rr("denimstrips", "Cut denim into strips", "Survival", { in: [["@denimcloth", 1]], tools: ["cutcloth"], out: [["denim", 3]], time: 4, d: "Needs scissors or a sharp knife." });
rr("leatherstrips", "Cut leather into strips", "Survival", { in: [["@leathercloth", 1]], tools: ["cutcloth"], out: [["leatherstrip", 2]], time: 5 });
rr("twine", "Twist rags into twine", "Survival", { in: [["rags", 2]], out: [["twine", 1]], time: 3, xp: { tailoring: 2 } });
rr("gasbottle", "Fill a bottle with gasoline", "Survival", { in: [["bottle", 1]], target: () => allCarried().find(it => it.id === "gascan" && (it.fuel || 0) >= .1), noTarget: "Needs a gas can with some fuel in it.",
  fn: () => { const can = allCarried().find(it => it.id === "gascan" && (it.fuel || 0) >= .1); can.fuel -= .1; giveItem(makeItem("gasbottle")); }, time: 2 });
rr("molotov", "Make a Molotov cocktail", "Survival", { in: [["gasbottle", 1], ["rags", 1]], out: [["molotov", 1]], time: 2, d: "Light it and throw it (it's thrown like any throwable). Sets fire to where it lands." });
// ---- medical
rr("poultice", "Make a comfrey poultice", "Medical", { in: [["herbs", 2], ["rags", 1]], out: [["poultice", 1]], skill: { firstaid: 1 }, learn: "mag_herb", learnFrom: "Learn it from the Herbalist magazine.", autoLvl: 2, xp: { firstaid: 4 }, time: 4, d: "Press it on a wound to speed healing." });
// ---- tailoring
rr("patch", "Patch a hole in your clothing", "Tailoring", { in: [["@fabric", 1], ["thread", 1, "use"]], tools: ["sewing"], target: wornTarget(it => (it.holes || 0) > 0), noTarget: "Nothing you have is torn.",
  fn: (got) => { const c = wornTarget(it => (it.holes || 0) > 0)(); const f = got.find(g => GROUPS.fabric.includes(g.id)) || { id: "rags" }; const lv = skill("tailoring");
    if (lv >= 8){ c.holes = Math.max(0, c.holes - 1); say(`You repair the ${ITEMS[c.id].n.toLowerCase()} good as new.`); }
    else { c.holes = Math.max(0, c.holes - 1); c.pad = Math.min(.5, (c.pad || 0) + ({ leatherstrip: .1, denim: .07, rags: .04 })[f.id] * (1 + lv * .08)); say(`You stitch a ${({ leatherstrip: "leather", denim: "denim", rags: "cloth" })[f.id]} patch over the hole.`); } }, xp: { tailoring: 2 }, time: 5 });
rr("pad", "Sew padding onto clothing", "Tailoring", { in: [["@fabric", 1], ["thread", 1, "use"]], tools: ["sewing"], skill: { tailoring: 1 }, target: wornTarget(it => !(it.holes > 0) && (it.pad || 0) < .45), noTarget: "Nothing worn that can take more padding.",
  fn: (got) => { const c = wornTarget(it => !(it.holes > 0) && (it.pad || 0) < .45)(); const f = got.find(g => GROUPS.fabric.includes(g.id)) || { id: "rags" }; c.pad = Math.min(.5, (c.pad || 0) + ({ leatherstrip: .1, denim: .07, rags: .04 })[f.id] * (1 + skill("tailoring") * .08)); say(`Padding sewn onto the ${ITEMS[c.id].n.toLowerCase()}. Bites and scratches have more to get through.`); }, xp: { tailoring: 2 }, time: 5 });
rr("pickthread", "Pick thread from fabric", "Tailoring", { in: [["@fabric", 1]], tools: ["sewing"], skill: { tailoring: 1 }, out: [["thread", 1, { uses: 2 }]], time: 3 });
rr("bandana", "Sew a rag bandana", "Tailoring", { in: [["rags", 2], ["thread", 1, "use"]], tools: ["sewing"], out: [["bandana", 1]], xp: { tailoring: 8 }, time: 5 });
rr("leathergloves", "Sew leather gloves", "Tailoring", { in: [["leatherstrip", 3], ["thread", 2, "use"]], tools: ["sewing"], skill: { tailoring: 2 }, learn: "mag_tailor", learnFrom: "Learn it from Fashionably Late magazine.", autoLvl: 2, out: [["gloves", 1]], xp: { tailoring: 10 }, time: 8 });
rr("paddedvest", "Sew a padded vest", "Tailoring", { in: [["rags", 6], ["thread", 3, "use"]], tools: ["sewing"], skill: { tailoring: 3 }, learn: "mag_tailor", learnFrom: "Learn it from Fashionably Late magazine.", autoLvl: 2, out: [["paddedvest", 1]], xp: { tailoring: 15 }, time: 12 });
// ---- carpentry and carving
rr("spearplank", "Carve a spear from a plank", "Carpentry", { in: [["plank", 1]], tools: ["cut"], out: [["spear", 1]], xp: { carpentry: 6 }, time: 7 });
rr("spikedplank", "Hammer nails into a plank", "Carpentry", { in: [["plank", 1], ["nails", 4]], tools: ["hammer"], skill: { carpentry: 1 }, out: [["spikedplank", 1]], xp: { carpentry: 6 }, time: 5, noise: 6 });
rr("sticks", "Carve a branch into sticks", "Carving", { in: [["branch", 1]], tools: ["cut"], out: [["stick", 2]], xp: { carving: 3 }, time: 3 });
rr("club", "Carve a wooden club", "Carving", { in: [["branch", 1]], tools: ["cut"], skill: { carving: 1 }, out: [["club", 1]], xp: { carving: 6 }, time: 6 });
rr("carvebowl", "Carve a wooden bowl", "Carving", { in: [["plank", 1]], tools: ["cut"], skill: { carving: 2 }, out: [["bowl", 1]], xp: { carving: 8 }, time: 8 });
rr("fishrod", "Make a fishing rod", "Fishing", { in: [["stick", 2], ["twine", 1]], out: [["fishrod", 1]], xp: { fishing: 4, carving: 2 }, time: 5 });
// ---- trapping
rr("snare", "Make a snare trap", "Trapping", { in: [["plank", 1], ["twine", 2]], tools: ["saw"], skill: { trapping: 1 }, out: [["snaretrap", 1]], xp: { trapping: 6 }, time: 6 });
rr("boxtrap", "Make a box trap", "Trapping", { in: [["plank", 3], ["nails", 6]], tools: ["hammer"], skill: { carpentry: 1, trapping: 1 }, learn: "mag_trap", learnFrom: "Learn it from The Hunter magazine.", autoLvl: 2, out: [["boxtrap", 1]], xp: { trapping: 8, carpentry: 4 }, time: 8, noise: 6 });
rr("sticktrap", "Make a stick trap (birds)", "Trapping", { in: [["stick", 4], ["twine", 1]], skill: { trapping: 2 }, learn: "mag_trap", learnFrom: "Learn it from The Hunter magazine.", autoLvl: 1, out: [["sticktrap", 1]], xp: { trapping: 6 }, time: 5 });
rr("cagetrap", "Make a cage trap", "Trapping", { in: [["wire", 5]], tools: ["pliers"], skill: { trapping: 3 }, learn: "mag_trap", learnFrom: "Learn it from The Hunter magazine.", autoLvl: 2, out: [["cagetrap", 1]], xp: { trapping: 10 }, time: 9 });
// ---- cooking
rr("cookmeat", "Cook game meat", "Cooking", { in: [["rawsmallmeat", 1]], station: "fire", out: [["smallmeat", 1]], xp: { cooking: 3 }, time: 5 });
rr("cookfish", "Cook a fish", "Cooking", { in: [["rawfish", 1]], station: "fire", fn: (got) => { const it = makeItem("cookedfish"); it.age = 0; if (got[0] && got[0].hun) it.hun = got[0].hun * 1.3; giveItem(it); toast(it); }, xp: { cooking: 3 }, time: 5 });
rr("butcher_rabbit", "Skin and gut a rabbit", "Cooking", { in: [["deadrabbit", 1]], tools: ["cut"], out: [["rawsmallmeat", 3]], xp: { cooking: 2, trapping: 1 }, time: 6 });
rr("butcher_squirrel", "Skin and gut a squirrel", "Cooking", { in: [["deadsquirrel", 1]], tools: ["cut"], out: [["rawsmallmeat", 2]], xp: { cooking: 2 }, time: 5 });
rr("butcher_bird", "Pluck and gut a bird", "Cooking", { in: [["deadbird", 1]], tools: ["cut"], out: [["rawsmallmeat", 1]], xp: { cooking: 1 }, time: 4 });
rr("soup", "Make a pot of soup", "Cooking", { in: [["pot", 1], ["water", 1]], evolve: { group: "@soupable", min: 2, max: 5 }, station: "fire", fn: (got, evo) => evolvedDish("souppot", evo, { hun: .05, thi: -.12, unh: -2 }), xp: { cooking: 8 }, time: 12, d: "Each ingredient you add makes it more filling. Variety makes it nicer to eat." });
rr("salad", "Make a salad", "Cooking", { in: [["bowl", 1]], evolve: { group: "@saladable", min: 2, max: 4 }, fn: (got, evo) => evolvedDish("salad", evo, { hun: 0, unh: -2 }), xp: { cooking: 4 }, time: 4 });
rr("sandwich", "Make a sandwich", "Cooking", { in: [["bread", 1]], evolve: { group: "@filling", min: 1, max: 2 }, fn: (got, evo) => evolvedDish("sandwich", evo, { hun: .12, unh: -4 }), xp: { cooking: 3 }, time: 3 });
rr("roastveg", "Roast vegetables", "Cooking", { evolve: { group: "@veg", min: 2, max: 4 }, station: "fire", learn: "mag_cook", learnFrom: "Learn it from Good Cooking magazine.", autoLvl: 1, skill: { cooking: 1 }, fn: (got, evo) => evolvedDish("roastveg", evo, { hun: .02, unh: -4 }), xp: { cooking: 6 }, time: 8 });
rr("stirfry", "Make a stir fry", "Cooking", { in: [["pan", 1]], evolve: { group: "@fryable", min: 2, max: 4 }, station: "fire", skill: { cooking: 2 }, learn: "mag_cook", learnFrom: "Learn it from Good Cooking magazine.", autoLvl: 1, fn: (got, evo) => evolvedDish("stirfry", evo, { hun: .04, unh: -6 }), xp: { cooking: 10 }, time: 10 });
// ---- electrical
rr("dismantle_watch", "Take a watch apart", "Electrical", { in: [["watch", 1]], tools: ["screwdriver"], out: [["elecscrap", 1]], xp: { electrical: 3 }, time: 4 });
rr("dismantle_clock", "Take an alarm clock apart", "Electrical", { in: [["alarmclock", 1]], tools: ["screwdriver"], out: [["elecscrap", 2]], xp: { electrical: 3 }, time: 5 });
rr("timer", "Build a timer", "Electrical", { in: [["alarmclock", 1], ["elecscrap", 1]], tools: ["screwdriver"], skill: { electrical: 1 }, learn: "mag_elec1", learnFrom: "Learn it from Electronics Hobbyist Vol. 1.", autoLvl: 2, out: [["timer", 1]], xp: { electrical: 8 }, time: 8 });
rr("noisegen", "Build a noise generator", "Electrical", { in: [["elecscrap", 2], ["batteries", 1]], tools: ["screwdriver"], skill: { electrical: 1 }, learn: "mag_elec1", learnFrom: "Learn it from Electronics Hobbyist Vol. 1.", autoLvl: 2, out: [["noisegen", 1]], xp: { electrical: 10 }, time: 10, d: "Set it down and switch it on: a loud wail for about a minute." });
rr("noisetimer", "Fit a noise generator with a timer", "Electrical", { in: [["noisegen", 1], ["timer", 1]], tools: ["screwdriver"], skill: { electrical: 2 }, learn: "mag_elec1", learnFrom: "Learn it from Electronics Hobbyist Vol. 1.", autoLvl: 2, out: [["noisetimer", 1]], xp: { electrical: 10 }, time: 6, d: "Goes off 30 seconds after you set it down." });
rr("remote", "Build a remote controller", "Electrical", { in: [["elecscrap", 2], ["batteries", 1], ["wire", 1]], tools: ["screwdriver"], skill: { electrical: 3 }, learn: "mag_elec2", learnFrom: "Learn it from Electronics Hobbyist Vol. 2.", autoLvl: 2, out: [["remote", 1]], xp: { electrical: 12 }, time: 10 });
rr("remotenoise", "Build a remote noise maker", "Electrical", { in: [["noisegen", 1], ["elecscrap", 1], ["wire", 1]], tools: ["screwdriver"], skill: { electrical: 3 }, learn: "mag_elec2", learnFrom: "Learn it from Electronics Hobbyist Vol. 2.", autoLvl: 2, out: [["remotenoise", 1]], xp: { electrical: 12 }, time: 8, d: "Set it down anywhere, walk away, press the remote." });
rr("gunpowder_s", "Pull gunpowder from shotgun shells", "Electrical", { in: [["shells", 4]], tools: ["screwdriver"], out: [["gunpowder", 1]], time: 5 });
rr("gunpowder_9", "Pull gunpowder from 9mm rounds", "Electrical", { in: [["ammo9", 10]], tools: ["screwdriver"], out: [["gunpowder", 1]], time: 6 });
rr("pipebomb", "Build a pipe bomb", "Electrical", { in: [["pipe", 1], ["gunpowder", 3], ["ducttape", 1, "use"]], skill: { electrical: 4 }, learn: "mag_elec2", learnFrom: "Learn it from Electronics Hobbyist Vol. 2.", autoLvl: 2, out: [["pipebomb", 1]], xp: { electrical: 15 }, time: 12, d: "Throw it. It goes off where it lands." });
// ---- primitive: knapping, pottery
rr("stoneknife", "Knap a stone knife", "Primitive", { in: [["flint", 1]], tools: ["stone"], out: [["stoneknife", 1]], xp: { knapping: 5 }, time: 6, noise: 3, d: "Strike flint with another stone." });
rr("stonehammer", "Make a stone hammer", "Primitive", { in: [["stone", 1], ["stick", 1], ["twine", 1]], skill: { knapping: 1 }, out: [["stonehammer", 1]], xp: { knapping: 6 }, time: 6 });
rr("stonespear", "Fit a stone tip to a spear", "Primitive", { in: [["spear", 1], ["flint", 1], ["twine", 1]], tools: ["stone"], skill: { knapping: 1 }, out: [["stonespear", 1]], xp: { knapping: 6 }, time: 7 });
rr("stoneaxe", "Make a stone axe", "Primitive", { in: [["flint", 1], ["stone", 1], ["stick", 1], ["twine", 1]], skill: { knapping: 2 }, out: [["stoneaxe", 1]], xp: { knapping: 8 }, time: 9 });
rr("flintsaw", "Make a flint saw", "Primitive", { in: [["flint", 2], ["stick", 1], ["twine", 1]], tools: ["stone"], skill: { knapping: 3 }, out: [["flintsaw", 1]], xp: { knapping: 10 }, time: 10 });
rr("claypot", "Shape a clay pot", "Primitive", { in: [["clay", 3]], out: [["claypot_raw", 1]], xp: { pottery: 5 }, time: 7, d: "Needs firing in a kiln." });
rr("claybowl", "Shape a clay bowl", "Primitive", { in: [["clay", 1]], out: [["claybowl_raw", 1]], xp: { pottery: 3 }, time: 4 });
rr("crucible_raw", "Shape a crucible", "Primitive", { in: [["clay", 2]], skill: { pottery: 1 }, out: [["crucible_raw", 1]], xp: { pottery: 6 }, time: 6 });
rr("fireclay", "Fire clay in the kiln", "Primitive", { in: [["@unfired", 1], ["charcoal", 1]], station: "kiln", fn: (got) => { const g = got.find(x => GROUPS.unfired.includes(x.id)); const out = { claypot_raw: "claypot", crucible_raw: "crucible", claybowl_raw: "bowl" }[g ? g.id : "claybowl_raw"]; const it = makeItem(out); giveItem(it); toast(it); }, xp: { pottery: 6 }, time: 15 });
// ---- metalwork
rr("charcoal", "Burn wood down to charcoal", "Metalwork", { in: [["log", 1]], station: "fire", out: [["charcoal", 3]], xp: { blacksmith: 2 }, time: 20 });
rr("canscrap", "Hammer cans flat into scrap", "Metalwork", { in: [["emptycan", 6]], tools: ["hammer"], out: [["scrapmetal", 1]], xp: { blacksmith: 1 }, time: 6, noise: 7 });
rr("tongs", "Forge a pair of tongs", "Metalwork", { in: [["scrapmetal", 2], ["charcoal", 1]], tools: ["hammer"], station: "forge", learn: "mag_smith", learnFrom: "Learn it from Iron Age Blacksmithing.", autoLvl: 1, skill: { blacksmith: 0 }, out: [["tongs", 1]], xp: { blacksmith: 8 }, time: 10, noise: 9 });
rr("ironbar", "Smelt scrap into an iron bar", "Metalwork", { in: [["scrapmetal", 3], ["charcoal", 2]], tools: ["crucible", "tongs"], station: "forge", learn: "mag_smith", learnFrom: "Learn it from Iron Age Blacksmithing.", autoLvl: 1, skill: { blacksmith: 0 }, out: [["ironbar", 1]], xp: { blacksmith: 10 }, time: 15 });
rr("nails2", "Forge nails", "Metalwork", { in: [["ironbar", 1], ["charcoal", 1]], tools: ["hammer", "tongs"], station: "anvil", stations: ["forge"], skill: { blacksmith: 1 }, learn: "mag_smith", learnFrom: "Learn it from Iron Age Blacksmithing.", autoLvl: 1, out: [["nails", 1, { qty: 30 }]], xp: { blacksmith: 10 }, time: 14, noise: 10 });
rr("metalsheet", "Hammer out a metal sheet", "Metalwork", { in: [["scrapmetal", 4], ["charcoal", 2]], tools: ["hammer", "tongs"], station: "anvil", stations: ["forge"], skill: { blacksmith: 2 }, learn: "mag_weld", learnFrom: "Learn it from Metalwork Magazine.", autoLvl: 1, out: [["metalsheet", 1]], xp: { blacksmith: 12 }, time: 16, noise: 10 });
rr("machete", "Forge a machete", "Metalwork", { in: [["ironbar", 2], ["charcoal", 2]], tools: ["hammer", "tongs"], station: "anvil", stations: ["forge"], skill: { blacksmith: 3 }, learn: "mag_smith", learnFrom: "Learn it from Iron Age Blacksmithing.", autoLvl: 2, out: [["machete", 1]], xp: { blacksmith: 18 }, time: 20, noise: 10 });
rr("metalspear", "Forge a metal spear tip", "Metalwork", { in: [["spear", 1], ["ironbar", 1], ["charcoal", 1]], tools: ["hammer", "tongs"], station: "anvil", stations: ["forge"], skill: { blacksmith: 2 }, learn: "mag_smith", learnFrom: "Learn it from Iron Age Blacksmithing.", autoLvl: 2, out: [["metalspear", 1]], xp: { blacksmith: 14 }, time: 16, noise: 10 });
// ---- repair
rr("tape", "Tape up a weapon", "Repair", { in: [["ducttape", 1, "use"]], target: damagedWeapon(it => !GUNS[it.id]), noTarget: "No damaged weapon to fix.", fn: () => fixWeapon(damagedWeapon(it => !GUNS[it.id])(), .3), time: 3 });
rr("glue", "Glue a weapon back together", "Repair", { in: [["glue", 1, "use"]], target: damagedWeapon(it => !GUNS[it.id]), noTarget: "No damaged weapon to fix.", fn: () => fixWeapon(damagedWeapon(it => !GUNS[it.id])(), .35), time: 4 });
rr("woodglue", "Wood-glue a wooden weapon", "Repair", { in: [["woodglue", 1, "use"]], target: damagedWeapon(isWood), noTarget: "No damaged wooden weapon.", fn: () => fixWeapon(damagedWeapon(isWood)(), .5), time: 4 });
rr("sharpen", "Sharpen a blade", "Repair", { tools: ["sharpen"], target: damagedWeapon(it => ["blade", "axe"].includes(ITEMS[it.id].skill)), noTarget: "No dull blade to sharpen.", fn: () => fixWeapon(damagedWeapon(it => ["blade", "axe"].includes(ITEMS[it.id].skill))(), .25, true), xp: { blade: 2 }, time: 5 });
rr("cleangun", "Clean and oil a gun", "Repair", { in: [["rags", 1]], target: damagedWeapon(it => !!GUNS[it.id]), noTarget: "No gun needs cleaning.", fn: () => { const g = damagedWeapon(it => !!GUNS[it.id])(); g.cond = Math.min(ITEMS[g.id].cond, (g.cond ?? 1) + ITEMS[g.id].cond * .12); g.jammed = false; say("Cleaned and oiled. It'll jam less."); }, xp: { reloading: 2 }, time: 6 });
function fixWeapon(w, frac, sharpen){
  const max = ITEMS[w.id].cond, r = w.repaired || 0, eff = frac * Math.max(.2, 1 - r * .2) * (1 + mainSkillFor(w) * .03);
  w.cond = Math.min(max, (w.cond ?? max) + max * eff); if (!sharpen) w.repaired = r + 1;
  say(`${ITEMS[w.id].n} patched up${w.repaired > 2 ? ", though each fix holds less well" : ""}.`);
}
const mainSkillFor = w => skill(ITEMS[w.id].skill || "carpentry");
// ---- older recipes join in with the same rules
function normalizeRecipe(r){
  if (Array.isArray(r.skill)) r.skill = { [r.skill[0]]: r.skill[1] };
  if (Array.isArray(r.xp)) r.xp = { [r.xp[0]]: r.xp[1] };
  if (r.station === "heat") r.station = "fire";
  if (r.in) r.in = r.in.map(([k, n, mode]) => [k === "disinfect" ? "disinfect" : k, n, mode]);
  r.cat = r.cat || "Survival";
  return r;
}
const ALLR = RECIPES.map(normalizeRecipe).filter(r => !RC.some(q => q.id === r.id)).concat(RC);
// stations as a list: everything listed must be near
const _stationNear = stationNear;
function recipeStations(r){ return [r.station, ...(r.stations || [])].filter(Boolean); }

// ============================================================
// Building: the same recipe rules, but the result goes in the world
// ============================================================
Object.assign(OBJ, {
  woodwall2: { n: "Sturdy wooden wall", block: true, h: 42, col: "#7a5a3a", hp: 90 }, logwall: { n: "Log wall", block: true, h: 40, col: "#6a4a2e", hp: 75 },
  metalwall: { n: "Metal wall", block: true, h: 44, col: "#8a9094", hp: 200 }, wooddoor: { n: "Wooden door", block: true, h: 40, col: "#8a6a42", hp: 60 },
  pshelf: { n: "Wooden shelves", cont: "pcrate", block: true, h: 30, col: "#8a6a42", cap: 30 }, bedrough: { n: "Rough bed", block: true, h: 10, col: "#8a6a42", bed: true },
  kiln: { n: "Primitive kiln", block: true, h: 26, col: "#8a6a4a" }, forge: { n: "Primitive forge", block: true, h: 20, col: "#6a6660" }, anvil: { n: "Stone anvil", block: true, h: 12, col: "#7a7870" },
  plot: { n: "Farm plot", block: false, h: 3, col: "#5a4028" },
  snaretrap: { n: "Snare trap", block: false, h: 4, col: "#a8946a" }, boxtrap: { n: "Box trap", block: false, h: 10, col: "#8a6a42" }, sticktrap: { n: "Stick trap", block: false, h: 8, col: "#8a6a42" }, cagetrap: { n: "Cage trap", block: false, h: 10, col: "#8a8e92" },
  noisegen: { n: "Noise generator", block: false, h: 6, col: "#3a8a3a" }, noisetimer: { n: "Timed noise maker", block: false, h: 6, col: "#c8a040" }, remotenoise: { n: "Remote noise maker", block: false, h: 6, col: "#c83a2a" },
});
const BL = BUILDS.map(b => normalizeRecipe(Object.assign({}, b, { cat: "Build" }))).concat([
  { id: "b_wall2", n: "Sturdy wooden wall", in: [["plank", 4], ["nails", 6]], tools: ["hammer"], skill: { carpentry: 2 }, obj: "woodwall2", time: 9, xp: { carpentry: 16 }, noise: 8, d: "Twice as tough as a plank wall." },
  { id: "b_logwall", n: "Log wall", in: [["log", 3], ["twine", 2]], obj: "logwall", time: 10, xp: { carpentry: 10 }, d: "Crude but strong, and no nails needed." },
  { id: "b_metalwall", n: "Metal wall", in: [["metalsheet", 2]], tools: ["welding", "weldmask"], useTools: ["welding"], skill: { welding: 2 }, learn: "mag_weld", learnFrom: "Learn it from Metalwork Magazine.", autoLvl: 1, obj: "metalwall", time: 12, xp: { welding: 20 }, noise: 8, d: "The toughest wall you can build." },
  { id: "b_door", n: "Wooden door", in: [["plank", 4], ["nails", 4]], tools: ["hammer"], skill: { carpentry: 3 }, obj: "wooddoor", time: 10, xp: { carpentry: 18 }, noise: 8, d: "Opens and closes. Put it in a gap in your walls." },
  { id: "b_fence", n: "Low wooden fence", in: [["plank", 2], ["nails", 2]], tools: ["hammer"], skill: { carpentry: 1 }, obj: "fence", time: 5, xp: { carpentry: 6 }, noise: 6, d: "Zombies tumble over it, which buys you a few seconds." },
  { id: "b_shelf", n: "Wooden shelves", in: [["plank", 3], ["nails", 4]], tools: ["hammer"], skill: { carpentry: 2 }, obj: "pshelf", time: 7, xp: { carpentry: 10 }, noise: 6 },
  { id: "b_bed", n: "Rough bed", in: [["plank", 4], ["nails", 4], ["sheet", 1]], tools: ["hammer"], skill: { carpentry: 1 }, obj: "bedrough", time: 9, xp: { carpentry: 10 }, noise: 6 },
  { id: "b_chair", n: "Wooden chair", in: [["plank", 2], ["nails", 2]], tools: ["hammer"], obj: "chair", time: 5, xp: { carpentry: 5 }, noise: 6 },
  { id: "b_table", n: "Wooden table", in: [["plank", 3], ["nails", 4]], tools: ["hammer"], skill: { carpentry: 1 }, obj: "table", time: 6, xp: { carpentry: 6 }, noise: 6, d: "A surface to craft on: tailoring and first aid go faster." },
  { id: "b_workbench", n: "Workbench", in: [["plank", 4], ["nails", 6]], tools: ["hammer"], skill: { carpentry: 1 }, obj: "workbench", time: 10, xp: { carpentry: 14 }, noise: 7, d: "Crafting surface with room for tools." },
  { id: "b_kiln", n: "Primitive kiln", in: [["clay", 12], ["stone", 4]], tools: ["dig"], learn: "mag_pottery", learnFrom: "Learn it from Pottery for Beginners.", autoLvl: 1, skill: { pottery: 0 }, obj: "kiln", time: 14, xp: { pottery: 15, masonry: 6 }, d: "Fires clay pots, bowls and crucibles." },
  { id: "b_forge", n: "Primitive forge", in: [["stone", 10], ["clay", 6]], learn: "mag_smith", learnFrom: "Learn it from Iron Age Blacksmithing.", autoLvl: 1, skill: { blacksmith: 0 }, obj: "forge", time: 16, xp: { masonry: 10, blacksmith: 5 }, d: "Smelts scrap metal into iron." },
  { id: "b_anvil", n: "Stone anvil", in: [["stone", 4]], tools: ["hammer"], skill: { masonry: 1 }, obj: "anvil", time: 10, xp: { masonry: 10 }, noise: 9, d: "Shape hot metal on it, next to a forge." },
  { id: "b_plot", n: "Dig a farm plot", tools: ["dig"], obj: "plot", time: 6, xp: { farming: 4 }, ground: true, d: "Dig a furrow in grass or dirt outside, then plant seeds in it." },
]);
for (const b of BL){ b.cat = "Build"; if (b.obj === "campfire"){ b.tools = (b.tools || []).concat("firestarter"); b.useTools = ["firestarter"]; } }
function buildTarget(){
  const [wx, wy] = toWorld(mouse.x, mouse.y);
  const tx = Math.floor(wx), ty = Math.floor(wy), def = G.build;
  if (!inb(tx, ty)) return { tx, ty, ok: false };
  const t = tile[ix(tx, ty)];
  let ok = (def && def.ground ? [T.GRASS, T.DIRT].includes(t) && bldId[ix(tx, ty)] < 0 : [T.GRASS, T.DIRT, T.LOT, T.WALK, T.ROAD, T.FLOOR, T.SAND, T.GRAVEL].includes(t)) && !objs.has(ix(tx, ty)) && !feats.has(ix(tx, ty));
  if (ok && Math.hypot(tx + .5 - P.x, ty + .5 - P.y) > 2.7) ok = false;
  if (ok && !(def && def.ground) && (Math.abs(tx + .5 - P.x) < .78 && Math.abs(ty + .5 - P.y) < .78)) ok = false;
  if (ok && Z.some(z => z.alive && Math.abs(z.x - tx - .5) < .8 && Math.abs(z.y - ty - .5) < .8)) ok = false;
  if (ok && V.some(v => Math.hypot(v.x - tx - .5, v.y - ty - .5) < 1.3)) ok = false;
  return { tx, ty, ok };
}
function placeBuild(){
  const def = G.build, { tx, ty, ok } = buildTarget();
  if (!ok) return say("You can't build there.");
  const why = whyNot(def); if (why) return say(why);
  P.face = Math.atan2(ty + .5 - P.y, tx + .5 - P.x);
  act(def.ground ? "Digging" : "Building", Math.max(2, (def.time || 5) * (1 - skill("carpentry") * .03)), () => {
    if (objs.has(ix(tx, ty)) || whyNot(def)) return;
    const pool = craftPool(); for (const [k, n, mode] of def.in || []) takeKey(pool, k, n, mode); for (const t of def.useTools || []) takeKey(pool, t, 1, "use");
    if (def.obj === "plot") tile[ix(tx, ty)] = T.DIRT;
    const o = placeObj(def.obj, tx, ty, roomId[ix(tx, ty)]);
    delete o.dir; o.built = true;
    if (OBJ[def.obj].hp) o.hp = OBJ[def.obj].hp + skill("carpentry") * 8;
    if (def.obj === "rainbarrel") o.water = 0;
    if (def.obj === "campfire") o.fuel = 90;
    if (OBJ[def.obj].cont) o.items = [];
    if (def.obj === "wooddoor"){ o.horiz = !(wallish2(tx, ty - 1) || wallish2(tx, ty + 1)); o.open = false; }
    (G.built = G.built || []).push(ix(tx, ty));
    invalidateGround(tx, ty);
    for (const [s, a] of Object.entries(def.xp || {})) addXP(s, a);
    if (whyNot(def)) G.build = null;
  }, { noise: def.noise || 0, noiseEvery: def.noise ? 1.1 : 0, build: def });
}
const wallish2 = (x, y) => { const t = tile[ix(x, y)]; if (t === T.WALL) return true; const o = objs.get(ix(x, y)); return !!(o && ["woodwall", "woodwall2", "logwall", "metalwall"].includes(o.type)); };

// ============================================================
// The crafting window (B)
// ============================================================
const CRAFT_CATS = ["All", "Survival", "Medical", "Tailoring", "Cooking", "Carpentry", "Carving", "Trapping", "Fishing", "Electrical", "Primitive", "Metalwork", "Repair", "Build"];
const CR = { cat: "All", sel: null, q: "" };
function renderCraft(){
  const p = $("craft"); p.innerHTML = ""; p.style.width = "min(1000px, 95vw)"; p.style.maxHeight = "86vh";
  const close = el("button", "close", "close"); close.onclick = closePanels; p.appendChild(close);
  const head = el("div", "i-head"); head.appendChild(el("div", "i-title", "Crafting")); p.appendChild(head);
  const tabs = el("div", "i-tabs"); tabs.style.flexWrap = "wrap";
  for (const c of CRAFT_CATS){ const b = el("button", CR.cat === c ? "on" : "", c); b.onclick = () => { CR.cat = c; CR.sel = null; renderCraft(); }; tabs.appendChild(b); }
  p.appendChild(tabs);
  const inp = document.createElement("input"); inp.placeholder = "Search by name or ingredient..."; inp.value = CR.q; inp.style.cssText = "width:100%;margin:6px 0;font:inherit;font-size:18px;padding:2px 6px;background:#1e2018;color:#d6f2c4;border:1px solid #4a5a3a";
  inp.onkeydown = e => e.stopPropagation(); inp.oninput = () => { CR.q = inp.value; renderCraftBody(); };
  p.appendChild(inp);
  const body = el("div", ""); body.id = "craftbody"; body.style.cssText = "display:flex;gap:12px;min-height:420px;max-height:62vh"; p.appendChild(body);
  renderCraftBody();
  setTimeout(() => { if (CR.q) inp.focus(); }, 0);
}
function craftList(){
  const q = CR.q.trim().toLowerCase();
  const src = CR.cat === "Build" ? BL : CR.cat === "All" ? ALLR.concat(BL) : ALLR.filter(r => r.cat === CR.cat);
  return src.filter(r => !q || r.n.toLowerCase().includes(q) || (r.in || []).some(([k]) => keyLabel(k).toLowerCase().includes(q)) || (r.out || []).some(([k]) => ITEMS[k] && ITEMS[k].n.toLowerCase().includes(q)) || (r.evolve && keyLabel(r.evolve.group).toLowerCase().includes(q)));
}
function renderCraftBody(){
  const body = $("craftbody"); if (!body) return; body.innerHTML = "";
  const pool = craftPool(), list = craftList().map(r => ({ r, st: recipeState(r, pool) }));
  list.sort((a, b) => (b.st.ok - a.st.ok) || (b.st.known - a.st.known) || a.r.n.localeCompare(b.r.n));
  const left = el("div", ""); left.style.cssText = "flex:0 0 42%;overflow-y:auto;border-right:1px solid #3a4a2a;padding-right:6px";
  if (!CR.sel || !list.some(x => x.r.id === CR.sel)) CR.sel = list.length ? list[0].r.id : null;
  for (const { r, st } of list){
    const row = el("div", ""); row.style.cssText = `display:flex;align-items:center;gap:8px;padding:2px 6px;cursor:pointer;${CR.sel === r.id ? "background:#3a4a2a" : ""}`;
    const dot = el("span", ""); dot.style.cssText = `width:10px;height:10px;border-radius:5px;flex:0 0 10px;background:${st.ok ? "#7ad06a" : st.known ? "#c8a040" : "#5a5a5a"}`;
    row.appendChild(dot);
    const out = r.out && r.out[0] && r.out[0][0];
    if (out && typeof iconURL === "function"){ const im = document.createElement("img"); im.src = iconURL(out); im.width = 22; im.height = 22; row.appendChild(im); }
    const nm = el("span", "", r.n); nm.style.opacity = st.known ? 1 : .55; row.appendChild(nm);
    row.onclick = () => { CR.sel = r.id; renderCraftBody(); };
    left.appendChild(row);
  }
  if (!list.length) left.appendChild(el("div", "", "Nothing matches."));
  body.appendChild(left);
  const right = el("div", ""); right.style.cssText = "flex:1;overflow-y:auto";
  const pick2 = list.find(x => x.r.id === CR.sel);
  if (pick2){
    const { r, st } = pick2;
    right.appendChild(el("div", "i-title", r.n));
    if (r.d) right.appendChild(el("div", "", r.d));
    const line = (ok, txt) => { const d = el("div", ""); d.innerHTML = `<span style="color:${ok ? "#8ad08a" : "#ff8a6a"}">${ok ? "✓" : "✗"}</span> ${txt}`; right.appendChild(d); };
    if (!st.known) line(false, `Not known yet. ${r.learnFrom || ""}`);
    if (st.ins.length){ right.appendChild(el("div", "", "<b>Uses up</b>")); right.lastChild.innerHTML = "<b>Uses up</b>"; for (const i of st.ins) line(i.have >= i.n, `${i.n > 1 || i.mode === "use" ? i.n + (i.mode === "use" ? " use" + (i.n > 1 ? "s" : "") + " of " : " × ") : ""}${keyLabel(i.k)} <span style="opacity:.6">(have ${i.have})</span>`); }
    if (st.evo){ right.appendChild(el("div", "")); right.lastChild.innerHTML = "<b>Add ingredients</b>"; line(st.evo.have >= st.evo.min, `${st.evo.min} to ${st.evo.max} × ${keyLabel(st.evo.group)} <span style="opacity:.6">(have ${st.evo.have})</span>`); }
    if (st.tools.length){ right.appendChild(el("div", "")); right.lastChild.innerHTML = "<b>Tools (kept)</b>"; for (const t of st.tools) line(t.have, keyLabel(t.k)); }
    if (st.skills.length){ right.appendChild(el("div", "")); right.lastChild.innerHTML = "<b>Skill</b>"; for (const s of st.skills) line(s.have, `${SKILLS[s.s].n} ${s.l} <span style="opacity:.6">(you: ${skill(s.s)})</span>`); }
    const sts = recipeStations(r); if (sts.length){ right.appendChild(el("div", "")); right.lastChild.innerHTML = "<b>Where</b>"; for (const s of sts) line(stationNear(s), "Next to " + STATION_NAMES[s]); }
    if (r.target && !st.target) line(false, r.noTarget || "Nothing to use it on");
    const xp = Object.entries(r.xp || {}).map(([s, a]) => `${SKILLS[s] ? SKILLS[s].n : s} +${a}`).join(", ");
    right.appendChild(el("div", "", `Takes about ${Math.round(r.time || 4)} seconds${xp ? ". Experience: " + xp : ""}.`)); right.lastChild.style.opacity = .7;
    const btns = el("div", ""); btns.style.marginTop = "8px";
    const mk = (label, fn) => { const b = el("button", "", label); b.style.cssText = "margin-right:8px;font-size:18px"; if (!st.ok){ b.disabled = true; b.style.opacity = .4; } b.onclick = fn; btns.appendChild(b); };
    if (r.obj) mk("Place it", () => startBuild(r));
    else { mk("Craft", () => { closePanels(); doCraft(r, 1); }); if (!r.target) { mk("Craft 5", () => { closePanels(); doCraft(r, 5); }); mk("Craft all", () => { closePanels(); doCraft(r, 99); }); } }
    right.appendChild(btns);
  }
  body.appendChild(right);
}

// ============================================================
// Out in the world: digging, rocks, fishing, traps, farming, salvage
// ============================================================
const hasTag = t => allCarried().some(it => matchesKey(it, t));
const tagItem = t => allCarried().find(it => matchesKey(it, t));
function groundOptions(out){
  if (P.car) return;
  const [sx, sy] = sideTile(P.x, P.y), t = tile[ix(sx, sy)], outside = bldId[ix(sx, sy)] < 0;
  if (!outside || !hasTag("dig")) return;
  const nearWater = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([dx, dy]) => tile[ix(sx + dx, sy + dy)] === T.WATER);
  if (nearWater && [T.GRASS, T.DIRT, T.SAND].includes(t)) out.push({ label: "Dig up clay from the bank", fn: () => act("Digging clay", 7, () => { const n = ri(1, 3); for (let k = 0; k < n; k++) giveItem(makeItem("clay")); addXP("pottery", 2); say(`You dig out ${n} lump${n > 1 ? "s" : ""} of clay.`); }, { noise: 3, noiseEvery: 2 }) });
  if ([T.GRASS, T.DIRT].includes(t)) out.push({ label: "Dig for worms", fn: () => act("Digging for worms", 6, () => { const n = ri(0, G.rain ? 4 : 2); for (let k = 0; k < n; k++) giveItem(makeItem("worm")); say(n ? `${n} worm${n > 1 ? "s" : ""}. Good bait.` : "Nothing but dirt."); addXP("farming", 1); }, { noise: 3, noiseEvery: 2 }) });
}
function waterOptions2(out){
  const rod = tagItem("fishing"), bait = allCarried().find(it => ["worm", "bread", "cheese", "rawsmallmeat", "smallmeat", "pbutter"].includes(it.id));
  out.push({ label: rod ? (bait ? `Fish here (bait: ${ITEMS[bait.id].n.toLowerCase()})` : "Fish here (no bait, poor odds)") : "Fish here (needs a fishing rod)", off: !rod, fn: () => goFish(false) });
  if (P.weapon && ["spear", "stonespear", "metalspear"].includes(P.weapon.id)) out.push({ label: "Try to spear a fish", fn: () => goFish(true) });
}
function goFish(spear){
  act(spear ? "Watching for fish" : "Fishing", spear ? 9 : 18, () => {
    const h = (G.min % 1440) / 60, dawnDusk = (h > 5 && h < 8) || (h > 18 && h < 21), lvl = skill("fishing");
    const bait = !spear && allCarried().find(it => ["worm", "bread", "cheese", "rawsmallmeat", "smallmeat", "pbutter"].includes(it.id));
    let ch = (spear ? .12 + lvl * .03 : (bait ? .3 : .1) + lvl * .05) + (dawnDusk ? .15 : 0) - winterness() * .2 - (G.sounds.some(s => s.t > G.simT - 10 && s.r > 8 && Math.hypot(s.x - P.x, s.y - P.y) < 15) ? .2 : 0);
    if (bait && R() < .7) removeItem(bait);
    if (R() < ch){ const it = makeItem("rawfish"); it.age = 0; const kg = rf(.3, 1 + lvl * .25); it.hun = .06 + kg * .08; it.kg = kg; giveItem(it); toast(it); say(`A ${kg < .6 ? "small" : kg < 1.4 ? "decent" : "big"} fish, about ${kg.toFixed(1)} kg.`); addXP("fishing", 5); }
    else { say(pick(["Nothing biting.", "A nibble, then nothing.", "It got away."])); addXP("fishing", 1); }
  }, { noise: 0, fish: true });
}
// traps you've set
const TRAP = { snaretrap: { w: 30, catches: ["deadrabbit", "deadsquirrel"], night: true, brk: .01 }, boxtrap: { w: 30, catches: ["deadrabbit", "deadsquirrel"], night: true, brk: .008 },
  cagetrap: { w: 40, catches: ["deadrabbit", "deadsquirrel"], night: true, brk: .004 }, sticktrap: { w: 30, catches: ["deadbird"], night: false, brk: 0 } };
const BAITW = { carrot: 45, cabbage: 40, potato: 35, tomato: 35, apple: 35, banana: 35, cheese: 30, pbutter: 30, cereal: 30, bread: 35, worm: 40 };
function trapOptions(o, out){
  const T2 = TRAP[o.type];
  if (o.catch) out.push({ label: `Take the ${ITEMS[o.catch].n.toLowerCase()}`, fn: () => { const it = makeItem(o.catch); it.age = 0; giveItem(it); toast(it); o.catch = null; addXP("trapping", 4); } });
  else if (!o.bait){ const b = allCarried().find(it => BAITW[it.id] && (T2.catches[0] === "deadbird" ? ["worm", "bread", "cereal"].includes(it.id) : it.id !== "worm")); out.push({ label: b ? `Bait it with ${ITEMS[b.id].n.toLowerCase()}` : "Bait it (no suitable bait)", off: !b, fn: () => { removeItem(b); o.bait = b.id; say("Baited. Leave it alone overnight, well away from it."); } }); }
  else out.push({ label: `Baited with ${ITEMS[o.bait].n.toLowerCase()}. Nothing yet.`, off: true });
  out.push({ label: "Pick the trap up", fn: () => { objs.delete(ix(o.x, o.y)); giveItem(makeItem(o.type)); if (o.bait) giveItem(makeItem(o.bait)); } });
}
function zoneWeight(x, y){
  if (ZONE[ix(x, y)]) return 2;
  let n = 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (tile[ix(x + dx, y + dy)] === T.TREE) n++;
  return n > 18 ? 15 : n > 8 ? 12 : 10;
}
function trapHour(o){
  const T2 = TRAP[o.type]; if (!T2) return;
  if (T2.brk && R() < T2.brk){ o.broken = true; }
  if (o.catch || !o.bait || o.broken) return;
  const h = (G.min % 1440) / 60, nightOk = !T2.night || h >= 19 || h < 5;
  if (Math.hypot(o.x - P.x, o.y - P.y) < 10){ if (R() < .2){ o.bait = null; } return; }
  if (!nightOk) return;
  const zw = zoneWeight(o.x, o.y), a = T2.w + (BAITW[o.bait] || 20) + skill("trapping") * 1.5;
  if (R() * 100 < a && R() * 100 < zw){ o.catch = T2.catches.length > 1 && R() < .4 ? T2.catches[1] : T2.catches[0]; o.bait = null; }
}
// farming
const CROPS = { seed_carrot: { out: "carrot", days: 18, y: [3, 5], col: "#e8862a" }, seed_cabbage: { out: "cabbage", days: 14, y: [1, 2], col: "#7ac04a" }, seed_potato: { out: "potato", days: 20, y: [3, 6], col: "#a8845a" },
  seed_tomato: { out: "tomato", days: 20, y: [3, 5], col: "#d83a2a" }, seed_radish: { out: "radish", days: 10, y: [3, 5], col: "#c83a5a" } };
function plotOptions(o, out){
  if (!o.crop){
    const seeds = allCarried().filter(it => CROPS[it.id]); const seen = new Set();
    for (const s of seeds){ if (seen.has(s.id)) continue; seen.add(s.id); out.push({ label: `Plant ${ITEMS[s.id].n.toLowerCase()}`, fn: () => act("Planting", 4, () => { removeItem(s); o.crop = s.id; o.prog = 0; o.water = .6; o.dryH = 0; o.dead = false; addXP("farming", 3); say("Planted. Keep it watered."); }) }); }
    if (!seeds.length) out.push({ label: "Plant something (you have no seeds)", off: true });
    return;
  }
  const C = CROPS[o.crop];
  if (o.dead){ out.push({ label: "Clear the dead plants", fn: () => { o.crop = null; o.dead = false; } }); return; }
  const pct = Math.round(Math.min(1, o.prog) * 100);
  out.push({ label: `${ITEMS[C.out].n}: ${pct >= 100 ? "ready to harvest" : pct + "% grown"}, ${o.water > .5 ? "well watered" : o.water > 0 ? "a bit dry" : "parched"}`, off: true });
  if (o.prog >= 1) out.push({ label: "Harvest", fn: () => act("Harvesting", 5, () => { const n = ri(...C.y) + (skill("farming") > 4 ? 1 : 0); for (let k = 0; k < n; k++){ const it = makeItem(C.out); it.age = 0; giveItem(it); } if (R() < .4 + skill("farming") * .05) giveItem(makeItem(o.crop)); o.crop = null; addXP("farming", 8); say(`You harvest ${n} ${ITEMS[C.out].n.toLowerCase()}${n > 1 ? "s" : ""}.`); }) });
  const can = tagItem("watercan") || allCarried().find(it => it.id === "water" || it.id === "water_t");
  if (o.water < .9) out.push({ label: can ? `Water it (${ITEMS[can.id].n.toLowerCase()})` : "Water it (needs water)", off: !can, fn: () => act("Watering", 3, () => { if (can.id === "wateringcan"){ can.uses = (can.uses ?? 10) - 1; if (can.uses <= 0) say("The watering can is empty."); } else removeItem(can); o.water = 1; o.dryH = 0; addXP("farming", 1); }) });
}
function plotHour(o){
  if (!o.crop || o.dead) return;
  const outside = bldId[ix(o.x, o.y)] < 0;
  if (G.rain && outside) o.water = 1;
  const w = winterness(), sf = w > .72 ? 0 : 1 - w * .6;
  if (o.water > 0){ o.prog = Math.min(1.05, o.prog + sf / (CROPS[o.crop].days * 24)); o.water = Math.max(0, o.water - 1 / 40); o.dryH = 0; }
  else if (++o.dryH > 72) o.dead = true;
}
// noise makers
function deviceOptions(o, out){
  if (o.type === "noisegen" && !(o.on > 0)) out.push({ label: "Switch it on", fn: () => { o.on = 50; say("It starts to wail. Time to leave."); } });
  if (o.type === "noisetimer" && !(o.arm > 0) && !(o.on > 0)) out.push({ label: "Start the timer (30 seconds)", fn: () => { o.arm = 30; say("Ticking. Thirty seconds."); } });
  if (o.type === "remotenoise") out.push({ label: o.on > 0 ? "It's going off" : "Armed. Use your remote from anywhere.", off: true });
  out.push({ label: "Pick it up", fn: () => { objs.delete(ix(o.x, o.y)); giveItem(makeItem(o.type)); G.devices = (G.devices || []).filter(i => i !== ix(o.x, o.y)); } });
}
function stepDevices(dt){
  for (const i of G.devices || []){
    const o = objs.get(i); if (!o) continue;
    if (o.arm > 0){ o.arm -= dt; if (o.arm <= 0){ o.arm = 0; o.on = 50; } }
    if (o.on > 0){ o.on -= dt; o.nT = (o.nT || 0) - dt; if (o.nT <= 0){ o.nT = 1; noise(o.x + .5, o.y + .5, 30); if (typeof sfxBeep === "function") sfxBeep(o); } }
  }
}
// salvage
const METAL_FURN = { shelf: [2, 3], locker: [2, 3], filecab: [1, 2], fridge: [2, 4], oven: [2, 3], washer: [2, 3], dryer: [2, 3], vending: [2, 4], gunlocker: [2, 3], boiler: [1, 2], ksink: [1, 1], pump: [3, 4] };
function salvageOptions(o, out){
  if (o.type === "tv") out.push({ label: hasTag("screwdriver") ? "Take the TV apart for electronics" : "Take the TV apart (needs a screwdriver)", off: !hasTag("screwdriver"), fn: () => act("Taking it apart", 8, () => { objs.delete(ix(o.x, o.y)); (G.removed = G.removed || []).push(ix(o.x, o.y)); invalidateGround(o.x, o.y); const n = ri(2, 4); for (let k = 0; k < n; k++) giveItem(makeItem("elecscrap")); giveItem(makeItem("wire")); addXP("electrical", 6); say(`${n} bits of electronics scrap and some wire.`); }, { noise: 3, noiseEvery: 2 }) });
  const M = METAL_FURN[o.type];
  if (M && !o.built && (hasTag("screwdriver") || hasTag("wrench"))) out.push({ label: `Strip the ${OBJ[o.type].n.toLowerCase()} for scrap metal`, fn: () => act("Stripping it for scrap", 10, () => { objs.delete(ix(o.x, o.y)); (G.removed = G.removed || []).push(ix(o.x, o.y)); invalidateGround(o.x, o.y); const n = ri(...M); for (let k = 0; k < n; k++) giveItem(makeItem("scrapmetal")); if (["fridge", "washer", "dryer", "vending", "oven"].includes(o.type)){ giveItem(makeItem("wire")); if (R() < .5) giveItem(makeItem("elecscrap")); } addXP("blacksmith", 2); say(`${n} pieces of scrap metal.`); }, { noise: 8, noiseEvery: 1.5 }) });
  if (o.type === "rock") out.push({ label: hasTag("hammer") ? "Break off some stones" : "Break off stones (needs a hammer)", off: !hasTag("hammer"), fn: () => act("Breaking rock", 6, () => { const n = ri(1, 3); for (let k = 0; k < n; k++) giveItem(makeItem("stone")); if (R() < .4) giveItem(makeItem("flint")); addXP("knapping", 2); say("A few good stones."); }, { noise: 9, noiseEvery: 1 }) });
}
function builtOptions2(o, out){
  if (TRAP[o.type]){ trapOptions(o, out); return true; }
  if (o.type === "plot"){ plotOptions(o, out); return true; }
  if (["noisegen", "noisetimer", "remotenoise"].includes(o.type)){ deviceOptions(o, out); return true; }
  if (o.type === "wooddoor"){ out.push({ label: o.open ? "Close the door" : "Open the door", fn: () => { o.open = !o.open; noise(o.x, o.y, 2); sfx.door(); invalidateGround(o.x, o.y); } }); return false; }
  if (["kiln", "forge", "anvil", "workbench"].includes(o.type)) out.push({ label: `A ${OBJ[o.type].n.toLowerCase()}. Craft next to it (B).`, off: true });
  salvageOptions(o, out);
  return false;
}
// a metal sheet over a door or window
function metalBarricadeOption(f, out){
  if ((f.type !== "door" && f.type !== "win") || f.metal || f.broken && f.type === "door") return;
  const ok = hasTag("welding") && hasTag("weldmask") && allCarried().some(it => it.id === "metalsheet");
  if (!ok && skill("welding") < 1) return;
  out.push({ label: ok ? "Weld a metal sheet over it" : "Weld a metal sheet over it (needs torch, mask, sheet metal)", off: !ok || skill("welding") < 1, fn: () => act("Welding", 10, () => {
    const s = allCarried().find(it => it.id === "metalsheet"); if (!s) return; removeItem(s); const tch = tagItem("welding"); tch.uses = (tch.uses ?? 30) - 2;
    f.metal = true; f.bar = 4; f.barHp = METAL_HP + skill("welding") * 20; f.open = false; addXP("welding", 12); say("Welded shut. Nothing's getting through that in a hurry."); }, { noise: 9, noiseEvery: 1 }) });
}
// using things from your inventory
function useLabel2(it){
  const d = ITEMS[it.id];
  if (d.cat === "trap") return "Set the trap here";
  if (["noisegen", "noisetimer", "remotenoise"].includes(it.id)) return "Set it down here";
  if (it.id === "remote") return "Press the button";
  if (it.id === "poultice") return "Press it on your wounds";
  if (d.cat === "mag" && d.teach) return "Read";
  return null;
}
function useItem2(it){
  const d = ITEMS[it.id];
  if (d.cat === "mag" && d.teach){ act("Reading", 6, () => { learnRecipes(d.teach, d.n); P.boredom = Math.max(0, (P.boredom || 0) - 10); }); return true; }
  if (d.cat === "trap" || ["noisegen", "noisetimer", "remotenoise"].includes(it.id)){
    const tx = Math.floor(P.x + Math.cos(P.face) * .9), ty = Math.floor(P.y + Math.sin(P.face) * .9);
    if (objs.has(ix(tx, ty)) || solidP(tx, ty)) { say("No room there."); return true; }
    if (d.cat === "trap" && (bldId[ix(tx, ty)] >= 0 || ![T.GRASS, T.DIRT, T.TREE, T.SAND].includes(tile[ix(tx, ty)]))) { say("Traps belong outside on grass or dirt."); return true; }
    act("Setting it down", 2, () => { removeItem(it); const o = placeObj(it.id, tx, ty, -1); delete o.dir; o.built = true; (G.built = G.built || []).push(ix(tx, ty)); if (d.cat !== "trap") (G.devices = G.devices || []).push(ix(tx, ty)); });
    return true;
  }
  if (it.id === "remote"){ let n = 0; for (const i of G.devices || []){ const o = objs.get(i); if (o && o.type === "remotenoise" && Math.hypot(o.x - P.x, o.y - P.y) < 90){ o.on = 50; n++; } } say(n ? "Click. Somewhere out there, something starts screaming." : "Click. Nothing in range."); return true; }
  if (it.id === "poultice"){ act("Applying the poultice", 4, () => { removeItem(it); P.pain = Math.max(0, (P.pain || 0) - 20); P.health = Math.min(100, P.health + 6); for (const w of P.wounds) w.poultice = true; say("Cool and green. The wounds feel calmer."); addXP("firstaid", 3); }); return true; }
  if (d.raw && d.cat === "food"){ P.sickness = Math.min(1, (P.sickness || 0) + .22); say("Raw... that might not sit well.", "#c8d88a"); }
  return false;
}
let craftHourAcc = 0;
function stepCraft2(dt, dm){
  stepDevices(dt);
  craftHourAcc += dm; if (craftHourAcc < 60) return; craftHourAcc -= 60;
  for (const i of G.built || []){ const o = objs.get(i); if (!o) continue; if (TRAP[o.type]) trapHour(o); else if (o.type === "plot") plotHour(o); }
}

// ---------- drawing the new things ----------
function drawDecor6(o, dim, a){
  const x = o.x, y = o.y, sd = c => shade(c, dim), cx = x + .5, cy = y + .5;
  switch (o.type){
    case "woodwall2": boxW(x + .04, y + .04, x + .96, y + .96, 0, 42, sd("#7a5a3a"), a); for (let k = 0; k < 4; k++) line3([x + .04, y + .96, 6 + k * 10], [x + .96, y + .96, 6 + k * 10], sd("#4a3424"), 1.4, a); return true;
    case "logwall": for (let k = 0; k < 5; k++) boxW(x + .02, y + .1, x + .98, y + .9, k * 8, k * 8 + 7.5, sd(k % 2 ? "#6a4a2e" : "#7a5634"), a); return true;
    case "metalwall": boxW(x + .02, y + .02, x + .98, y + .98, 0, 44, sd("#8a9094"), a); for (const u of [.33, .66]) line3([x + u, y + .98, 0], [x + u, y + .98, 44], sd("#5a5e62"), 1, a); return true;
    case "wooddoor": { const hz = o.horiz !== false; const c = sd("#8a6a42");
      if (!o.open) hz ? boxW(x, cy - .06, x + 1, cy + .06, 0, 38, c, a) : boxW(cx - .06, y, cx + .06, y + 1, 0, 38, c, a);
      else hz ? boxW(x, y, x + .12, y + 1, 0, 38, c, a) : boxW(x, y, x + 1, y + .12, 0, 38, c, a); return true; }
    case "pshelf": boxW(x + .1, y + .1, x + .9, y + .5, 0, 30, sd("#8a6a42"), a); for (const z of [10, 20]) line3([x + .1, y + .5, z], [x + .9, y + .5, z], sd("#5a4028"), 1.2, a); return true;
    case "bedrough": boxW(x + .05, y + .05, x + .95, y + .95, 0, 6, sd("#8a6a42"), a); boxW(x + .1, y + .1, x + .9, y + .9, 6, 9, sd("#d8d4c8"), a); return true;
    case "kiln": topEl(cx, cy, .44, 0, sd("#7a5a3a"), a); boxW(x + .14, y + .14, x + .86, y + .86, 0, 18, sd("#8a6a4a"), a); topEl(cx, cy, .3, 18, sd("#6a4a34"), a); topEl(cx, cy, .14, 18.2, "#1a120c", a); return true;
    case "forge": boxW(x + .08, y + .12, x + .92, y + .88, 0, 16, sd("#6a6660"), a); topR(x + .2, y + .25, x + .8, y + .75, 16.1, o.lit ? "#e86a2a" : sd("#2a2420"), a); return true;
    case "anvil": boxW(x + .3, y + .35, x + .7, y + .65, 0, 8, sd("#6a6862"), a); boxW(x + .18, y + .3, x + .82, y + .7, 8, 12, sd("#8a8882"), a); return true;
    case "plot": {
      topR(x + .05, y + .1, x + .95, y + .9, .5, sd("#4a3424"), a);
      for (const v of [.3, .5, .7]) line3([x + .1, y + v, 1], [x + .9, y + v, 1], sd("#3a2818"), 1.2, a);
      if (o.crop){ const C = CROPS[o.crop], p = Math.min(1, o.prog || 0);
        for (let k = 0; k < 6; k++){ const u = x + .18 + (k % 3) * .32, v = y + .28 + Math.floor(k / 3) * .4; const h = 1 + p * 9;
          if (o.dead){ line3([u, v, 1], [u, v, 3], "#6a5a3a", 1.2, a); continue; }
          topEl(u, v, .05 + p * .1, h, sd(o.dis && o.disL > 20 ? "#9a9a4a" : p < .3 ? "#7ac04a" : "#4a8a3a"), a); if (p >= 1) topEl(u + .04, v + .04, .05, h * .6, C.col, a); }
        if (o.dis === "mildew" && !o.dead) topR(x + .1, y + .15, x + .9, y + .85, 6, "rgba(235,235,225,.22)", a); }
      if (o.weeds) for (let k = 0; k < o.weeds * 3; k++){ const u = x + .12 + hash(o.x * 7 + k, o.y) * .76, v = y + .15 + hash(o.x, o.y * 5 + k) * .7; line3([u, v, 0], [u + .03, v, 3.5], sd("#5a7a2a"), 1.2, a); }
      return true;
    }
    case "snaretrap": line3([cx - .2, cy, 0], [cx + .2, cy, 4], sd("#a8946a"), 1, a); topEl(cx, cy, .12, .2, "rgba(0,0,0,0)", a); if (o.catch) topEl(cx, cy, .18, 3, sd("#8a7a6a"), a); return true;
    case "boxtrap": case "cagetrap": { const c = sd(o.type === "cagetrap" ? "#8a8e92" : "#8a6a42"); o.type === "cagetrap" ? (ctx.globalAlpha = a, boxW(x + .2, y + .3, x + .8, y + .7, 0, 10, c, .4 * a)) : boxW(x + .2, y + .3, x + .8, y + .7, 0, 10, c, a); if (o.catch) topEl(cx, cy, .15, 4, sd("#8a7a6a"), a); ctx.globalAlpha = 1; return true; }
    case "sticktrap": for (const [u, v] of [[-.2, -.2], [.2, -.2], [0, .2]]) line3([cx + u, cy + v, 0], [cx, cy, 8], sd("#8a6a42"), 1, a); if (o.catch) topEl(cx, cy, .1, 1, sd("#5a5a6a"), a); return true;
    case "noisegen": case "noisetimer": case "remotenoise": { boxW(x + .35, y + .38, x + .65, y + .62, 0, 6, sd(OBJ[o.type].col), a); if (o.on > 0 && Math.floor(G.simT * 4) % 2){ const [sx, sy] = S(cx, cy, 7); ctx.fillStyle = "#ff3a2a"; ctx.beginPath(); ctx.arc(sx, sy, 2 * zoom, 0, 7); ctx.fill(); } return true; }
  }
  return drawDecor7(o, dim, a);
}
// barricades: planks, or a welded sheet of metal
function planksThin(tx, ty, n, a, hz){
  if (CUR_FEAT && CUR_FEAT.metal){
    hz ? boxW(tx - .02, ty + B_ + .02, tx + 1.02, ty + B_ + .07, 3, 40, "#8a9094", a) : boxW(tx + B_ + .02, ty - .02, tx + B_ + .07, ty + 1.02, 3, 40, "#8a9094", a);
    for (const z of [8, 20, 32]) hz ? line3([tx, ty + B_ + .08, z], [tx + 1, ty + B_ + .08, z], "#5a5e62", 1.2, a) : line3([tx + B_ + .08, ty, z], [tx + B_ + .08, ty + 1, z], "#5a5e62", 1.2, a);
    return;
  }
  for (let k = 0; k < n; k++){
    const z = 9 + k * 7, d = k % 2 ? 5 : -5;
    const p = hz ? [[tx - .02, ty + B_ + .03, z], [tx + 1.02, ty + B_ + .03, z + d]] : [[tx + B_ + .03, ty + 1.02, z], [tx + B_ + .03, ty - .02, z + d]];
    line3(p[0], p[1], "#3a2a18", 5.2, a); line3(p[0], p[1], "#a5824f", 4, a);
  }
}
