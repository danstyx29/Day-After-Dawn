"use strict";
// ============================================================
// DEAD QUIET  - an isometric survival sandbox
// Part 1: config + data. Every tunable number lives here.
// ============================================================
const CFG = {
  W: 100, H: 100,                 // map size in tiles
  TW: 64, TH: 32, WALLH: 44,       // iso tile + wall height in px
  minPerSec: 1,                    // game minutes per real second at x1 (1 day = 24 real minutes)
  startDay: 14, startHour: 8,      // July 14th, 8am
  speeds: [1, 3, 8],               // fast forward steps
  sleepSpeed: 30,
  zombieCount: 230,
  sprinterChance: 0.0,             // set >0 for runners
  multiHit: false,
  infect: { scratch: 0.07, laceration: 0.25, bite: 1.0 },
  infectHours: [48, 72],
  waterOffDay: [17, 22],           // calendar days (game starts on day 14)
  powerOffDay: [18, 24],
  heliDay: [16, 18],
  walk: 2.1, run: 3.5, sneak: 1.25,
  zShamble: 0.62, zSprint: 3.6, zCrawl: 0.28,
  zSightDay: 11, zSightNight: 4.5,
  zMemory: 18,                     // seconds a zombie keeps tracking after losing sight
  playerSightDay: 19, playerSightNight: 5.5, flashRange: 13,
};

// ---------- tiny seeded RNG ----------
let _seed = 1;
function srand(s){ _seed = (s >>> 0) || 1; }
function rnd(){ _seed ^= _seed << 13; _seed >>>= 0; _seed ^= _seed >> 17; _seed ^= _seed << 5; _seed >>>= 0; return _seed / 4294967296; }
const R = Math.random; // gameplay randomness
function ri(a, b, f = R){ return a + Math.floor(f() * (b - a + 1)); }
function rf(a, b, f = R){ return a + f() * (b - a); }
function pick(arr, f = R){ return arr[Math.floor(f() * arr.length)]; }
function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
function wpick(list, f = R){ // [[item, weight],...]
  let t = 0; for (const e of list) t += e[1];
  let r = f() * t; for (const e of list){ r -= e[1]; if (r <= 0) return e[0]; }
  return list[list.length - 1][0];
}

// ---------- tiles ----------
const T = { GRASS:0, ROAD:1, WALK:2, FLOOR:3, WALL:4, DOOR:5, WIN:6, TREE:7, LOT:8, DIRT:9 };

// ---------- items ----------
// cat: food drink med weapon tool mat book mag bag misc
// food: hun (hunger restored), thi (thirst restored), unh (unhappiness change), bor (boredom change),
//       opener (needs a can opener tag), fresh/rot (days until stale/rotten)
const ITEMS = {
  beans:     {n:"Can of beans", w:0.6, cat:"food", hun:.32, unh:3, opener:true, empty:"emptycan"},
  soup:      {n:"Can of soup", w:0.6, cat:"food", hun:.28, thi:.05, opener:true, empty:"emptycan"},
  peaches:   {n:"Canned peaches", w:0.6, cat:"food", hun:.2, thi:.08, unh:-6, opener:true, empty:"emptycan"},
  tuna:      {n:"Can of tuna", w:0.4, cat:"food", hun:.22, opener:true, empty:"emptycan"},
  chips:     {n:"Bag of chips", w:0.2, cat:"food", hun:.12, thi:-.06, unh:-4, bor:-6},
  cereal:    {n:"Box of cereal", w:0.5, cat:"food", hun:.25, unh:2},
  crackers:  {n:"Crackers", w:0.2, cat:"food", hun:.14, thi:-.04},
  pbutter:   {n:"Peanut butter", w:0.5, cat:"food", hun:.3, unh:-2},
  candy:     {n:"Candy bar", w:0.1, cat:"food", hun:.07, unh:-12, bor:-4},
  bread:     {n:"Loaf of bread", w:0.4, cat:"food", hun:.3, fresh:3, rot:6},
  apple:     {n:"Apple", w:0.2, cat:"food", hun:.1, thi:.05, fresh:5, rot:10},
  banana:    {n:"Banana", w:0.2, cat:"food", hun:.12, fresh:3, rot:6},
  cheese:    {n:"Block of cheese", w:0.3, cat:"food", hun:.18, unh:-3, fresh:6, rot:14},
  ham:       {n:"Sliced ham", w:0.3, cat:"food", hun:.2, fresh:2, rot:4},
  leftovers: {n:"Leftover casserole", w:0.6, cat:"food", hun:.4, unh:-6, fresh:2, rot:4},
  milk:      {n:"Carton of milk", w:0.9, cat:"drink", thi:.35, hun:.06, fresh:3, rot:6},
  water:     {n:"Bottle of water", w:0.8, cat:"drink", thi:.55, empty:"bottle"},
  soda:      {n:"Can of soda", w:0.35, cat:"drink", thi:.32, unh:-6, bor:-3},
  juice:     {n:"Orange juice", w:0.6, cat:"drink", thi:.4, unh:-3, fresh:7, rot:14},
  beer:      {n:"Beer", w:0.4, cat:"drink", thi:.2, unh:-14, bor:-8},
  bottle:    {n:"Empty bottle", w:0.1, cat:"misc", tags:["fillable"]},
  emptycan:  {n:"Empty can", w:0.05, cat:"misc"},
  bandage:   {n:"Bandage", w:0.05, cat:"med", tags:["bandage"]},
  rags:      {n:"Ripped sheets", w:0.05, cat:"med", tags:["bandage"], dirtyRisk:.25},
  sheet:     {n:"Bed sheet", w:0.8, cat:"misc", rip:4},
  disinf:    {n:"Disinfectant", w:0.3, cat:"med", tags:["disinfect"], uses:6},
  vodka:     {n:"Bottle of vodka", w:0.8, cat:"drink", thi:.1, unh:-10, tags:["disinfect"], uses:4},
  pills:     {n:"Painkillers", w:0.1, cat:"med", tags:["painkiller"], uses:8},
  antibio:   {n:"Antibiotics", w:0.1, cat:"med", tags:["antibiotic"], uses:4},
  // weapons: skill, dmg[min,max], range, spd (swing seconds), end (endurance cost), cond, kd (knockdown), crit
  bat:       {n:"Baseball bat", w:1.5, cat:"weapon", skill:"longblunt", dmg:[.75,1.2], range:1.35, spd:1.05, end:.075, cond:16, kd:.5, crit:.12},
  golf:      {n:"Golf club", w:1.2, cat:"weapon", skill:"longblunt", dmg:[.55,.95], range:1.4, spd:.95, end:.06, cond:10, kd:.4, crit:.12},
  crowbar:   {n:"Crowbar", w:2.0, cat:"weapon", skill:"longblunt", dmg:[.7,1.1], range:1.2, spd:1.1, end:.08, cond:45, kd:.45, crit:.1, tags:["pry"]},
  pipe:      {n:"Lead pipe", w:1.8, cat:"weapon", skill:"longblunt", dmg:[.7,1.05], range:1.3, spd:1.1, end:.08, cond:25, kd:.5, crit:.1},
  hammer:    {n:"Hammer", w:1.0, cat:"weapon", skill:"shortblunt", dmg:[.45,.75], range:1.0, spd:.75, end:.04, cond:14, kd:.25, crit:.15, tags:["hammer","pry"]},
  pan:       {n:"Frying pan", w:1.4, cat:"weapon", skill:"shortblunt", dmg:[.45,.8], range:1.05, spd:.85, end:.05, cond:20, kd:.35, crit:.12},
  rollpin:   {n:"Rolling pin", w:0.8, cat:"weapon", skill:"shortblunt", dmg:[.35,.6], range:1.0, spd:.7, end:.035, cond:8, kd:.25, crit:.1},
  knife:     {n:"Kitchen knife", w:0.3, cat:"weapon", skill:"blade", dmg:[.4,.8], range:.9, spd:.55, end:.025, cond:6, kd:.05, crit:.3, tags:["opener","cut"]},
  hunting:   {n:"Hunting knife", w:0.4, cat:"weapon", skill:"blade", dmg:[.6,1.0], range:.95, spd:.55, end:.03, cond:14, kd:.05, crit:.32, tags:["opener","cut"]},
  screwdrv:  {n:"Screwdriver", w:0.3, cat:"weapon", skill:"blade", dmg:[.3,.6], range:.85, spd:.5, end:.02, cond:6, kd:.03, crit:.25, tags:["opener"]},
  axe:       {n:"Wood axe", w:3.0, cat:"weapon", skill:"axe", dmg:[1.3,2.2], range:1.25, spd:1.35, end:.13, cond:28, kd:.6, crit:.2, tags:["chop"]},
  hatchet:   {n:"Hatchet", w:1.2, cat:"weapon", skill:"axe", dmg:[.8,1.3], range:1.0, spd:.85, end:.06, cond:16, kd:.3, crit:.2, tags:["chop"]},
  shovel:    {n:"Shovel", w:2.0, cat:"weapon", skill:"longblunt", dmg:[.6,1.0], range:1.4, spd:1.1, end:.08, cond:18, kd:.55, crit:.08},
  opener:    {n:"Can opener", w:0.2, cat:"tool", tags:["opener"]},
  nails:     {n:"Box of nails", w:0.5, cat:"mat", stack:true},
  plank:     {n:"Plank", w:1.5, cat:"mat"},
  saw:       {n:"Saw", w:1.0, cat:"tool", tags:["saw"]},
  tweezers:  {n:"Tweezers", w:0.05, cat:"tool", tags:["tweezers"]},
  needle:    {n:"Needle and thread", w:0.05, cat:"med", tags:["suture"], uses:4},
  batteries: {n:"Batteries", w:0.1, cat:"misc"},
  watch:     {n:"Wristwatch", w:0.1, cat:"misc"},
  backpack:  {n:"Hiking backpack", w:0.9, cat:"bag", cap:20, red:.65},
  schoolbag: {n:"School bag", w:0.6, cat:"bag", cap:12, red:.45},
  duffel:    {n:"Duffel bag", w:0.8, cat:"bag", cap:17, red:.4},
  bk_carp:   {n:"Carpentry for Beginners", w:0.6, cat:"book", skill:"carpentry"},
  bk_aid:    {n:"The Field Medic's Handbook", w:0.6, cat:"book", skill:"firstaid"},
  bk_axe:    {n:"Lumberjack's Almanac", w:0.6, cat:"book", skill:"axe"},
  bk_sneak:  {n:"Hunting the Quiet Way", w:0.6, cat:"book", skill:"sneak"},
  bk_blunt:  {n:"Little League Coaching Manual", w:0.6, cat:"book", skill:"longblunt"},
  mag:       {n:"Gossip magazine", w:0.2, cat:"mag", bor:-30, unh:-12},
  comic:     {n:"Comic book", w:0.15, cat:"mag", bor:-35, unh:-15},
  novel:     {n:"Paperback novel", w:0.4, cat:"mag", bor:-50, unh:-20, long:true},
  cigs:      {n:"Cigarettes", w:0.1, cat:"misc", unh:-8, uses:10, smoke:true},
};
for (const k in ITEMS){ ITEMS[k].id = k; ITEMS[k].tags = ITEMS[k].tags || []; }

// ---------- loot tables: container -> weighted items, roll count ----------
const LOOT = {
  fridge:   {rolls:[1,4], items:[["milk",4],["water",4],["soda",5],["juice",3],["apple",3],["banana",2],["cheese",3],["ham",3],["leftovers",3],["beer",4],["bread",1]]},
  counter:  {rolls:[0,3], items:[["knife",5],["opener",4],["beans",4],["soup",4],["tuna",3],["peaches",2],["cereal",3],["crackers",3],["pbutter",2],["chips",3],["pan",2],["rollpin",2],["bottle",3],["bread",2],["candy",2],["vodka",1]]},
  oven:     {rolls:[0,1], items:[["pan",3],["leftovers",1]]},
  medcab:   {rolls:[1,3], items:[["bandage",6],["pills",4],["disinf",4],["antibio",1],["tweezers",2],["needle",2]]},
  wardrobe: {rolls:[0,3], items:[["sheet",6],["backpack",1],["schoolbag",2],["duffel",2],["bat",1],["golf",1]]},
  dresser:  {rolls:[0,3], items:[["sheet",4],["mag",3],["watch",2],["cigs",2],["batteries",2],["candy",1],["hunting",1]]},
  books:    {rolls:[1,4], items:[["novel",5],["mag",4],["comic",4],["bk_carp",2],["bk_aid",2],["bk_axe",1],["bk_sneak",1],["bk_blunt",1]]},
  crate:    {rolls:[1,4], items:[["hammer",3],["nails",4],["plank",3],["saw",2],["screwdrv",3],["crowbar",1],["pipe",2],["shovel",2],["hatchet",1],["axe",1]]},
  shelf_grocery:  {rolls:[2,6], items:[["beans",5],["soup",5],["tuna",4],["peaches",3],["chips",5],["cereal",4],["crackers",3],["pbutter",3],["candy",4],["soda",5],["water",5],["bread",2],["opener",1]]},
  shelf_pharmacy: {rolls:[2,5], items:[["bandage",6],["pills",5],["disinf",4],["antibio",2],["needle",2],["tweezers",2],["candy",3],["water",2],["mag",2],["comic",2]]},
  shelf_hardware: {rolls:[1,4], items:[["hammer",4],["nails",6],["plank",4],["saw",3],["screwdrv",3],["crowbar",2],["axe",1],["hatchet",2],["shovel",2],["pipe",2],["batteries",2],["bk_carp",1]]},
  corpse:   {rolls:[0,2], items:[["candy",3],["cigs",3],["watch",2],["bandage",2],["water",1],["chips",2],["knife",1],["hammer",1],["schoolbag",1]]},
};

// ---------- furniture / objects ----------
// cont: loot table, block: blocks movement, h: draw height, col: color
const OBJ = {
  fridge:   {n:"Fridge", cont:"fridge", block:true, h:40, col:"#d9dcd6", cap:30},
  counter:  {n:"Kitchen counter", cont:"counter", block:true, h:18, col:"#8a6a4a", cap:25},
  oven:     {n:"Stove", cont:"oven", block:true, h:18, col:"#3b3d40", cap:10},
  ksink:    {n:"Kitchen sink", block:true, h:18, col:"#9aa5ad", water:true},
  medcab:   {n:"Medicine cabinet", cont:"medcab", block:true, h:30, col:"#e8e8e0", cap:6},
  bsink:    {n:"Bathroom sink", block:true, h:16, col:"#e4e6e8", water:true},
  toilet:   {n:"Toilet", block:true, h:12, col:"#f0f0ee", toilet:true},
  bed:      {n:"Bed", block:true, h:10, col:"#6f7fa0", bed:true},
  wardrobe: {n:"Wardrobe", cont:"wardrobe", block:true, h:42, col:"#6b4a32", cap:30, dis:true},
  dresser:  {n:"Dresser", cont:"dresser", block:true, h:20, col:"#7b5a3c", cap:20, dis:true},
  sofa:     {n:"Sofa", block:true, h:12, col:"#7a3f3a", seat:true, dis:true},
  bookcase: {n:"Bookcase", cont:"books", block:true, h:40, col:"#5e4430", cap:20, dis:true},
  tv:       {n:"Television", block:true, h:16, col:"#26282b", tv:true},
  crate:    {n:"Storage crate", cont:"crate", block:true, h:16, col:"#9b7b4c", cap:30, dis:true},
  shelf:    {n:"Store shelf", cont:"shelf", block:true, h:30, col:"#8c9196", cap:40},
  checkout: {n:"Checkout counter", block:true, h:16, col:"#4a5560"},
  car:      {n:"Abandoned car", block:true, h:22, col:"#5a6470", car:true},
};

// ---------- skills ----------
const SKILLS = {
  fitness:   {n:"Fitness", grp:"Passive"},
  strength:  {n:"Strength", grp:"Passive"},
  running:   {n:"Running", grp:"Agility"},
  sneak:     {n:"Sneaking", grp:"Agility"},
  longblunt: {n:"Long blunt", grp:"Combat"},
  shortblunt:{n:"Short blunt", grp:"Combat"},
  blade:     {n:"Blades", grp:"Combat"},
  axe:       {n:"Axe", grp:"Combat"},
  carpentry: {n:"Carpentry", grp:"Crafting"},
  firstaid:  {n:"First aid", grp:"Survival"},
};
const XP_NEED = [75, 150, 300, 750, 1500, 3000, 4500, 6000, 7500, 9000];

// ---------- occupations ----------
const OCCS = {
  unemployed:{n:"Unemployed", pts:8, sk:{}, d:"No useful skills, but plenty of room for personal quirks.", shirt:"#6d7a63"},
  carpenter: {n:"Carpenter", pts:2, sk:{carpentry:3, shortblunt:1}, d:"Builds barricades fast and swings a hammer well.", shirt:"#a0683b"},
  nurse:     {n:"Nurse", pts:2, sk:{firstaid:3, sneak:1}, d:"Treats wounds quickly and they heal faster.", shirt:"#4f8a86"},
  lumberjack:{n:"Lumberjack", pts:0, sk:{axe:2, strength:1}, d:"Lethal with an axe and used to hard work.", shirt:"#8b2e2a"},
  burglar:   {n:"Burglar", pts:-2, sk:{sneak:3, running:1}, d:"Quiet on their feet and quick to slip away.", shirt:"#2f3238"},
  coach:     {n:"Little league coach", pts:0, sk:{longblunt:2, fitness:1, running:1}, d:"Knows how to swing a bat and keep going.", shirt:"#2c4f8a"},
};

// ---------- traits ----------
// cost > 0 = good trait that costs points, cost < 0 = bad trait that gives points
const TRAITS = {
  strong:     {n:"Strong", cost:6, d:"+2 strength. Carry more and hit harder."},
  athletic:   {n:"Athletic", cost:6, d:"+2 fitness. Tire much more slowly."},
  fastlearn:  {n:"Fast learner", cost:5, d:"Earn 30% more skill experience."},
  brave:      {n:"Brave", cost:4, d:"Panic builds at half the rate."},
  keenhear:   {n:"Keen hearing", cost:4, d:"Notice what's right behind you from further away."},
  lighteat:   {n:"Light eater", cost:3, d:"Get hungry 25% slower."},
  lucky:      {n:"Lucky", cost:4, d:"Find more in containers."},
  inconsp:    {n:"Inconspicuous", cost:4, d:"The dead are slower to notice you."},
  organized:  {n:"Organized", cost:4, d:"+4 carry capacity and faster transfers."},
  eagle:      {n:"Eagle eyed", cost:3, d:"See further."},
  weak:       {n:"Weak", cost:-6, d:"-2 strength."},
  unfit:      {n:"Unfit", cost:-6, d:"-2 fitness."},
  slowlearn:  {n:"Slow learner", cost:-5, d:"Earn 30% less skill experience."},
  cowardly:   {n:"Cowardly", cost:-3, d:"Panic builds nearly twice as fast."},
  hearty:     {n:"Hearty appetite", cost:-4, d:"Get hungry 25% faster."},
  clumsy:     {n:"Clumsy", cost:-3, d:"Your footsteps are louder."},
  consp:      {n:"Conspicuous", cost:-4, d:"The dead notice you from further away."},
  shortsight: {n:"Short sighted", cost:-3, d:"See a shorter distance."},
  thinskin:   {n:"Thin skinned", cost:-5, d:"Attacks get through to your skin more often."},
  restless:   {n:"Restless sleeper", cost:-3, d:"Get tired 20% faster."},
};

// ---------- body ----------
const PARTS = [
  ["head","Head",3],["neck","Neck",3],["torso_u","Upper torso",8],["torso_l","Lower torso",6],["groin","Groin",2],
  ["uarm_l","Left upper arm",7],["uarm_r","Right upper arm",7],["farm_l","Left forearm",10],["farm_r","Right forearm",10],
  ["hand_l","Left hand",9],["hand_r","Right hand",9],["thigh_l","Left thigh",4],["thigh_r","Right thigh",4],
  ["shin_l","Left shin",4],["shin_r","Right shin",4],["foot_l","Left foot",2],["foot_r","Right foot",2],
];
const PARTNAME = Object.fromEntries(PARTS.map(p => [p[0], p[1]]));
const WOUND = {
  scratch:   {n:"Scratch", bleed:.035, heal:36, pain:8},
  laceration:{n:"Laceration", bleed:.08, heal:80, pain:16},
  bite:      {n:"Bite", bleed:.11, heal:140, pain:24},
  glass:     {n:"Glass shard cut", bleed:.07, heal:60, pain:14},
};

// ---------- TV schedule (original text) ----------
const BROADCAST = {
  14:["...officials in Harlow County are asking residents to remain indoors while the cordon is reinforced.",
      "A doctor from the state health board says the illness spreads through bites and close contact. Do not approach the sick.",
      "Highway 9 and the Old Mill bridge are closed. Military checkpoints will turn back all traffic."],
  15:["Reports of looting downtown. The Governor has authorized the National Guard to use force.",
      "If a family member is sick, separate them from the household. We cannot stress this enough.",
      "Phone lines in the quarantine area are now down. Officials say the outage is temporary."],
  16:["This station will continue broadcasting for as long as we are able.",
      "Unconfirmed reports say the checkpoint at the county line was overrun last night.",
      "We have lost contact with our reporters in Harlow. If you can hear this, stay inside, stay quiet."],
  17:["THIS IS AN EMERGENCY BROADCAST. REMAIN IN YOUR HOMES. AWAIT FURTHER INSTRUCTIONS.",
      "THIS IS AN EMERGENCY BROADCAST. DO NOT ATTEMPT TO LEAVE THE QUARANTINE ZONE."],
};
