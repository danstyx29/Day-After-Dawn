// ============================================================
// Part 18: world generation v3.
// Town plans guarantee every town has a main street, civic buildings
// and its own mix; buildings get facades, signs, heights and stairs;
// streets get lamps, hydrants, mailboxes, poles and wires; upper floors
// are generated when you first climb to them.
// ============================================================

// ---------- new objects ----------
Object.assign(OBJ, {
  stairs:    { n: "Stairs", block: false, h: 36, col: "#8a6a48" },
  rack:      { n: "Clothes rack", cont: "clothes", block: true, h: 26, col: "#8a8e92", cap: 12 },
  washer:    { n: "Washing machine", block: true, h: 18, col: "#e6e8e4" },
  hay:       { n: "Hay bale", block: true, h: 12, col: "#c8a860" },
  lamp:      { n: "Street lamp", block: true, h: 60, col: "#4a4e52", light: 5.5 },
  hydrant:   { n: "Fire hydrant", block: true, h: 10, col: "#c8302a" },
  mailbox:   { n: "Mailbox", cont: "mail", block: true, h: 12, col: "#3a4a6a", cap: 3 },
  bench:     { n: "Bench", block: true, h: 9, col: "#6a4a30", seat: true },
  trashcan:  { n: "Trash can", cont: "trash", block: true, h: 12, col: "#5a5e52", cap: 6 },
  dumpster:  { n: "Dumpster", cont: "dumpster", block: true, h: 18, col: "#3a5a3a", cap: 30 },
  upole:     { n: "Utility pole", block: true, h: 70, col: "#5a4632" },
  bush:      { n: "Bush", block: true, h: 14, col: "#3e5a2e" },
  hedge:     { n: "Hedge", block: true, h: 20, col: "#34502a" },
  fence:     { n: "Picket fence", block: true, h: 12, col: "#e8e4dc", fence: true },
  fencew:    { n: "Wooden fence", block: true, h: 22, col: "#7a5a3a", fence: true },
  tlight:    { n: "Traffic light", block: true, h: 56, col: "#3a3e42" },
  stopsign:  { n: "Stop sign", block: true, h: 34, col: "#c8302a" },
  phonebooth:{ n: "Phone booth", block: true, h: 40, col: "#7a8a9a" },
  busstop:   { n: "Bus stop", block: true, h: 30, col: "#5a6a7a", seat: true },
  newsbox:   { n: "Newspaper box", cont: "news", block: true, h: 12, col: "#2a5a9a", cap: 4 },
  billboard: { n: "Billboard", block: true, h: 90, col: "#4a4e52" },
  polesign:  { n: "Sign", block: true, h: 64, col: "#4a4e52" },
  welcome:   { n: "Town sign", block: true, h: 26, col: "#2f5a3a" },
  swing:     { n: "Swing set", block: true, h: 30, col: "#8a3a2a" },
  slide:     { n: "Slide", block: true, h: 24, col: "#3a6aa8" },
  picnic:    { n: "Picnic table", block: true, h: 10, col: "#7a5a3a", seat: true },
  cart:      { n: "Shopping cart", block: true, h: 12, col: "#a8acb0" },
  flowerbed: { n: "Flower bed", block: false, h: 3, col: "#5a3e28" },
  porchlight:{ n: "Porch light", block: false, h: 0, col: "#e8d8a0", light: 3 },
  reeds:     { n: "Reeds", block: false, h: 0, col: "#6a7a3a" },
  rock:      { n: "Rock", block: true, h: 10, col: "#7a7870" },
  wreck:     { n: "Burnt-out wreck", block: true, h: 16, col: "#2a2624" },
});
Object.assign(FOOT, {
  lamp: [.4, .4, .6, .6], hydrant: [.35, .35, .65, .65], mailbox: [.35, .35, .65, .65], upole: [.4, .4, .6, .6], tlight: [.4, .4, .6, .6],
  stopsign: [.42, .42, .58, .58], polesign: [.38, .38, .62, .62], billboard: [.1, .4, .9, .6], newsbox: [.3, .3, .7, .7],
  trashcan: [.3, .3, .7, .7], bush: [.18, .18, .82, .82], rock: [.2, .25, .8, .75], wreck: [-.4, .15, 1.4, .85],
});
NOOFF.add && ["lamp", "hydrant", "upole", "tlight", "stopsign", "polesign", "billboard", "newsbox", "trashcan", "bush", "rock", "fence", "fencew", "hedge", "swing", "slide", "picnic", "cart", "welcome", "busstop", "phonebooth", "wreck", "flowerbed"].forEach(k => NOOFF.add(k));
Object.assign(LOOT, {
  trash:        { rolls: [0, 2], items: [["emptycan", 4], ["bottle", 3], ["mag", 2], ["chips", 1], ["candy", 1], ["sheet", 1]] },
  dumpster:     { rolls: [1, 4], items: [["emptycan", 5], ["bottle", 4], ["plank", 2], ["sheet", 2], ["mag", 2], ["leftovers", 2], ["pipe", 1], ["crowbar", 1], ["nails", 1]] },
  mail:         { rolls: [0, 1], items: [["mag", 4], ["comic", 2], ["novel", 1]] },
  news:         { rolls: [0, 2], items: [["mag", 5]] },
  clothes:      { rolls: [0, 2], items: [["sheet", 3], ["schoolbag", 2], ["duffel", 2], ["backpack", 1]] },
  shelf_sports: { rolls: [1, 3], items: [["bat", 4], ["golf", 3], ["hunting", 2], ["hatchet", 2], ["backpack", 3], ["duffel", 2], ["water", 2], ["axe", 1]] },
  shelf_liquor: { rolls: [2, 5], items: [["beer", 6], ["vodka", 4], ["soda", 4], ["chips", 3], ["cigs", 3], ["candy", 2]] },
  shelf_video:  { rolls: [1, 3], items: [["comic", 4], ["mag", 4], ["novel", 2], ["candy", 2], ["soda", 2], ["batteries", 2]] },
  library:      { rolls: [1, 4], items: [["novel", 5], ["bk_carp", 3], ["bk_aid", 3], ["bk_axe", 2], ["bk_sneak", 2], ["bk_blunt", 2], ["mag", 2]] },
  locker_fire:  { rolls: [1, 3], items: [["axe", 3], ["hatchet", 2], ["crowbar", 2], ["bandage", 3], ["water", 2], ["disinf", 1]] },
  vault:        { rolls: [0, 3], items: [["watch", 4], ["batteries", 2], ["cigs", 2], ["mag", 1]] },
  post:         { rolls: [1, 3], items: [["mag", 4], ["comic", 2], ["novel", 2], ["sheet", 1], ["batteries", 1]] },
  workshop:     { rolls: [1, 4], items: [["hammer", 3], ["nails", 4], ["screwdrv", 3], ["saw", 2], ["crowbar", 2], ["gascan", 3], ["pipe", 2], ["plank", 2]] },
  trunk_police: { rolls: [1, 3], items: [["nightstick", 3], ["bandage", 3], ["water", 2], ["hunting", 1], ["duffel", 1]] },
  trunk_amb:    { rolls: [2, 4], items: [["bandage", 5], ["disinf", 3], ["pills", 3], ["antibio", 2], ["needle", 2], ["tweezers", 1]] },
  trunk_army:   { rolls: [2, 4], items: [["water", 3], ["beans", 3], ["tuna", 2], ["bandage", 2], ["axe", 1], ["backpack", 1]] },
  trunk_fire:   { rolls: [1, 3], items: [["axe", 3], ["crowbar", 2], ["bandage", 2], ["water", 2]] },
});

// ---------- building specs for the new kinds ----------
Object.assign(SPEC, {
  firestation: { min: 5, rooms: ["garage2", "lockers", "staff", "office"], win: 3, doors: 2, lock: .3 },
  library:     { min: 6, rooms: ["library", "library", "office", "storage"], win: 3, doors: 2, lock: .3 },
  autorepair:  { min: 7, rooms: ["workshop", "office"], win: 5, doors: 2, lock: .4 },
  clinic:      { min: 4, rooms: ["reception", "ward", "office", "storage", "ward"], win: 3, doors: 1, lock: .2 },
  diner:       { min: 4, rooms: ["diner", "kitchen2", "storage"], win: 2, doors: 1, lock: .3 },
  bar:         { min: 4, rooms: ["barroom", "storage", "bathroom"], win: 3, doors: 1, lock: .4 },
  bookstore:   { min: 4, rooms: ["bookshop", "storage"], win: 2, doors: 1, lock: .4 },
  clothing:    { min: 4, rooms: ["clothes", "storage"], win: 2, doors: 1, lock: .4 },
  sports:      { min: 4, rooms: ["sportshop", "storage"], win: 2, doors: 1, lock: .5 },
  liquor:      { min: 4, rooms: ["liquorshop", "storage"], win: 2, doors: 1, lock: .5 },
  video:       { min: 4, rooms: ["videoshop", "storage"], win: 2, doors: 1, lock: .4 },
  laundromat:  { min: 4, rooms: ["laundry", "storage"], win: 2, doors: 1, lock: .3 },
  bank:        { min: 4, rooms: ["banklobby", "vault", "office"], win: 3, doors: 1, lock: .7 },
  post:        { min: 4, rooms: ["postoffice", "storage"], win: 2, doors: 1, lock: .5 },
  cornerstore: { min: 4, rooms: ["gasshop", "storage"], win: 2, doors: 1, lock: .4 },
  garage:      { min: 9, rooms: ["garage2"], win: 0, doors: 2, lock: .5 },
  barn:        { min: 30, rooms: ["barn"], win: 0, doors: 2, lock: 0 },
  storageunit: { min: 3, rooms: ["storageunit"], win: 0, doors: 1, lock: .8 },
});
Object.assign(FURN2, {
  garage2:     { wall: ["crate", "shelf", "locker", "crate"] },
  workshop:    { wall: ["crate", "crate", "shelf", "shelf", "crate"], rows: ["crate", 4, 3] },
  library:     { wall: ["bookcase", "bookcase", "bookcase", "bookcase", "bookcase"], rows: ["bookcase", 2, 3] },
  diner:       { wall: ["counter", "fridge", "sofa", "sofa", "counter"], rows: ["table", 2, 2] },
  kitchen2:    { wall: ["oven", "fridge", "counter", "ksink", "counter", "oven"] },
  barroom:     { wall: ["counter", "counter", "shelf", "sofa", "fridge"], rows: ["table", 2, 2] },
  bookshop:    { wall: ["bookcase", "bookcase", "bookcase", "counter"], rows: ["bookcase", 2, 2] },
  clothes:     { wall: ["wardrobe", "wardrobe", "counter", "dresser"], rows: ["rack", 2, 2] },
  sportshop:   { wall: ["shelf", "shelf", "locker", "counter"], rows: ["shelf", 2, 2] },
  liquorshop:  { wall: ["fridge", "fridge", "shelf", "counter"], rows: ["shelf", 2, 2] },
  videoshop:   { wall: ["bookcase", "bookcase", "counter", "tv"], rows: ["bookcase", 2, 2] },
  laundry:     { wall: ["washer", "washer", "washer", "washer", "washer"], rows: ["table", 3, 2] },
  banklobby:   { wall: ["counter", "counter", "filecab", "sofa"] },
  vault:       { wall: ["locker", "locker", "locker", "crate"] },
  postoffice:  { wall: ["counter", "crate", "crate", "shelf"] },
  barn:        { wall: ["crate", "hay", "hay", "crate", "hay"], rows: ["hay", 3, 3] },
  storageunit: { wall: ["crate", "crate", "shelf"] },
});
Object.assign(SHELF_STORE, { sports: "sports", liquor: "liquor", video: "video", cornerstore: "grocery", gas: "grocery", autorepair: "hardware" });

// ---------- names and looks ----------
const NAMES = {
  diner: ["Moonlight Diner", "Rosie's Diner", "The Blue Plate", "Starlite Grill", "Mel's Coffee Shop", "Route 9 Diner"],
  bar: ["Dusty's Tavern", "The Rusty Nail", "Last Call", "Hollow Pint", "Lucky Seven Bar"],
  bookstore: ["Pageturner Books", "Dog-Ear Books", "Chapter One"], clothing: ["Fashion Barn", "Thread & Co.", "Sunday Best"],
  sports: ["Big Bear Sports", "All-Star Sporting Goods", "Field & Stream Outfitters"], liquor: ["Bottle Shop", "Party Liquors", "Cork & Cap"],
  video: ["Video Planet", "Rewind Video", "Prime Time Rentals"], laundromat: ["Suds Laundromat", "Wash 'n' Go"], bank: ["Savings & Loan", "First County Bank"],
  post: ["U.S. Post Office"], cornerstore: ["Quik Stop", "Corner Mart", "Stop & Shop"], grocery: ["Food Fair", "Valu Grocer", "Harvest Market"],
  pharmacy: ["Rx Pharmacy", "Main St. Drugs", "Care Pharmacy"], hardware: ["Hammer Hardware", "True Value Tools", "County Hardware"],
  gas: ["Gas & Go", "Fuel Stop", "Speedway Gas"], motel: ["Starlight Motel", "Sleepy Hollow Motel", "Lucky Inn", "Hi-Way Motel"],
  autorepair: ["Pete's Auto Repair", "Brake & Muffler", "County Garage"], library: ["Public Library"], school: ["Elementary School", "Middle School", "High School"],
  hospital: ["County Hospital", "Mercy General"], clinic: ["Medical Clinic", "Walk-In Clinic"], police: ["Police Department", "Sheriff's Office"],
  firestation: ["Fire Department", "Fire Station 2"], church: ["First Baptist Church", "St. Mary's", "Grace Church"], office: ["Harlow Mutual Insurance", "Delta Office Park", "County Records"],
  warehouse: ["Mass Freight Co.", "County Storage", "Lumber Supply"], apartments: ["Oak Apartments", "Creekside Flats", "Maple Court"],
};
const SIGNCOL = {
  diner: ["#c83a3a", "#fff4d0"], bar: ["#2a2a3a", "#ff6a9a"], bookstore: ["#2a4a3a", "#f0e8c8"], clothing: ["#7a3a6a", "#fff"], sports: ["#1a4a8a", "#fff"],
  liquor: ["#4a2a1a", "#f0c840"], video: ["#1a1a4a", "#ffd030"], laundromat: ["#2a7aa8", "#fff"], bank: ["#2a3a4a", "#e8d8a0"], post: ["#1a3a7a", "#fff"],
  cornerstore: ["#c8302a", "#fff"], grocery: ["#2a6a2a", "#fff"], pharmacy: ["#fff", "#2a8a3a"], hardware: ["#c86a1a", "#fff"], gas: ["#c8302a", "#ffd030"],
  motel: ["#1a2a3a", "#ff5a7a"], autorepair: ["#3a3a3a", "#ffb030"], library: ["#4a3a2a", "#f0e8c8"], school: ["#7a2a1a", "#fff"], hospital: ["#fff", "#c8302a"],
  clinic: ["#fff", "#2a7aa8"], police: ["#1a2a4a", "#fff"], firestation: ["#9a1a1a", "#fff"], church: ["#f4f0e8", "#3a2a1a"], office: ["#2a3a4a", "#d8e8f0"],
  warehouse: ["#4a4e52", "#f0c840"], apartments: ["#3a2a22", "#f0e8c8"],
};
const NEON = new Set(["bar", "motel", "diner", "video", "liquor"]);
const FACADE = {
  hospital: ["stucco"], clinic: ["stucco"], school: ["brick"], police: ["block", "stone"], church: ["white"], apartments: ["brick", "brown", "stucco"],
  office: ["glass", "stone"], motel: ["pink", "white"], warehouse: ["metal"], gas: ["block"], trailer: ["trailer"], bunker: ["concrete"],
  firestation: ["brick"], library: ["stone"], autorepair: ["metal", "block"], diner: ["chrome", "white"], bar: ["brown", "brick"], bank: ["stone"],
  post: ["brick"], grocery: ["block", "brick"], pharmacy: ["block", "white"], hardware: ["block", "brown"], garage: [], barn: ["barn"], storageunit: ["metal"],
};
const FLOORS = { house: [1, 1, 1, 2, 2], apartments: [2, 3, 3, 4], office: [3, 4, 5, 6, 7], hospital: [2, 3, 3], school: [1, 2, 2], police: [1, 2],
  firestation: [2], library: [1, 2], bank: [1, 2], bar: [1, 2], clinic: [1, 2], clothing: [1, 2], bookstore: [1, 2] };
const HMUL = { warehouse: 1.45, autorepair: 1.3, grocery: 1.2, hardware: 1.2, pharmacy: 1.15, church: 1.35, barn: 1.5, firestation: 1.05, garage: .95 };
const UPPER = {
  house: ["bedroom", "bedroom", "bathroom", "bedroom"], apartments: ["living", "bedroom", "kitchen", "bathroom", "living", "bedroom", "kitchen", "bathroom"],
  office: ["office", "office", "office", "storage", "office"], hospital: ["ward", "ward", "office", "storage", "ward"], school: ["classroom", "classroom", "office", "classroom"],
  police: ["office", "lockers", "storage", "cell"], firestation: ["bunkroom", "staff", "bathroom"], library: ["library", "office"], bank: ["office", "office", "vault"],
  bar: ["living", "bedroom", "kitchen", "bathroom"], clinic: ["ward", "office", "storage"], clothing: ["storage", "office"], bookstore: ["bookshop", "storage"],
};
const OUTFIT = {
  police: [{ col: "#1e2a44", pants: "#14182a", hat: "cap", hatCol: "#1e2a44" }], sheriff: [{ col: "#8a7a5a", pants: "#3a3a2a", hat: "cap", hatCol: "#5a4a3a" }],
  hospital: [{ col: "#eceee8", pants: "#d0d4d0" }, { col: "#6ab0a8", pants: "#6ab0a8" }, { col: "#9ab8d8", pants: "#9ab8d8" }],
  clinic: [{ col: "#eceee8", pants: "#3a3e48" }, { col: "#6ab0a8", pants: "#6ab0a8" }],
  firestation: [{ col: "#8a6a2a", pants: "#5a4a2a", hat: "helmet", hatCol: "#c8a020" }],
  diner: [{ col: "#f0f0ea", pants: "#2a2a2a", hat: "chef", hatCol: "#f4f4f0" }, { col: "#d86a8a", pants: "#2a2a2a" }],
  warehouse: [{ col: "#d87a1a", pants: "#3a4a6a", hat: "hard", hatCol: "#e8c020" }], autorepair: [{ col: "#3a4a6a", pants: "#3a4a6a", hat: "cap", hatCol: "#8a2a2a" }],
  hardware: [{ col: "#c84a1a", pants: "#3a3a3a" }], church: [{ col: "#1a1a1c", pants: "#1a1a1c" }, { col: "#f0f0f0", pants: "#1a1a1c" }],
  bank: [{ col: "#3a3e48", pants: "#2a2e36" }], office: [{ col: "#3a3e48", pants: "#2a2e36" }, { col: "#c8c8d0", pants: "#2a2e36" }],
  school: [{ col: "#e8c040", pants: "#3a5a9a" }, { col: "#d84a4a", pants: "#2a2a3a" }, { col: "#4a9ad8", pants: "#3a3a3a" }, { col: "#7ac04a", pants: "#3a3a5a" }],
  bar: [{ col: "#2a2a2a", pants: "#2a3a5a" }, { col: "#6a2a2a", pants: "#2a2a2a" }], soldier: [{ col: "#4a5636", pants: "#3a4430", hat: "helmet", hatCol: "#4a5636" }],
};
function applyOutfit(z, kind){
  const list = OUTFIT[kind]; if (!list || R() < .25) return;
  const o = pick(list); z.col = o.col; z.pants = o.pants; if (o.hat){ z.hat = o.hat; z.hatCol = o.hatCol; }
}

// ---------- give every building its look, height, sign, roof props and (if tall) stairs ----------
let LOT_CTX = null;
function finishBuilding(b, kind, front){
  b.front = front || "top";
  const fl = FACADE[kind]; b.facade = fl && fl.length ? pick(fl, rnd) : (rnd() < .22 ? pick(["brick", "brown", "white"], rnd) : null);
  b.hmul = HMUL[kind] || 1;
  const w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1;
  b.floors = 1;
  const fr = FLOORS[kind];
  if (fr && w >= 6 && h >= 8) b.floors = pick(fr, rnd);
  if (kind === "house"){ const st = HOUSE_STYLE || pick(HOUSE_STYLES, rnd); b.floors = (st === "twostory" || st === "farmhouse") && w >= 8 && h >= 8 ? 2 : 1; b._style = st; }
  if (b.floors > 1 && !placeStairs(b)) b.floors = 1;
  if (b.floors > 1) b.hmul = 1;
  if (kind === "house") styleHouse(b.id, b._style);
  else if (kind === "church"){ b.roofType = "gable"; b.roofCol = "#2e3036"; }
  else if (kind === "motel"){ b.roofType = "hip"; b.roofCol = pick(ROOF_COLS, rnd); }
  else if (kind === "barn"){ b.roofType = "gable"; b.roofCol = "#5a5e62"; }
  else if (kind === "trailer"){ b.trim = "#c8c8c0"; }
  else if (b.floors <= 2 && rnd() < .35 && ["diner", "bar", "clinic", "library", "post", "bank", "firestation"].includes(kind)){ b.roofType = "hip"; b.roofCol = pick(ROOF_COLS, rnd); }
  if (NAMES[kind]){ const nm = pick(NAMES[kind], rnd); b.sign = { text: kind === "school" || kind === "library" ? `${(TOWN_CTX && TOWN_CTX.name || "County").split(" ")[0]} ${nm}` : nm, col: SIGNCOL[kind] || ["#2a2a2a", "#fff"], neon: NEON.has(kind) }; }
  // things on the roof
  b.props = [];
  const top = b.floors * CFG.WALLH * (b.floors > 1 ? 1 : b.hmul);
  const flat = !["house", "church", "motel", "trailer", "bunker", "barn"].includes(kind);
  if (kind === "house" && rnd() < .75) b.props.push({ t: "chimney", x: b.x0 + 1 + rnd() * (w - 3), y: b.y0 + 1 + rnd() * (h - 3) });
  if (kind === "house" && rnd() < .3) b.props.push({ t: "antenna", x: b.x0 + 2 + rnd() * (w - 4), y: b.y0 + 2 + rnd() * (h - 4) });
  if (kind === "church") b.props.push({ t: "steeple", x: (b.x0 + b.x1 + 1) / 2, y: b.front === "top" ? b.y0 + 2 : b.y1 - 1 });
  if (flat && kind !== "gas" && kind !== "storageunit"){
    const n = Math.max(1, Math.floor(w * h / 90));
    for (let k = 0; k < n; k++) b.props.push({ t: "ac", x: b.x0 + 1.5 + rnd() * (w - 3), y: b.y0 + 1.5 + rnd() * (h - 3) });
  }
  if (kind === "apartments" || (kind === "office" && rnd() < .5)) b.props.push({ t: "tank", x: b.x0 + 2 + rnd() * (w - 4), y: b.y0 + 2 + rnd() * (h - 4) });
  if (kind === "hospital") b.props.push({ t: "helipad", x: (b.x0 + b.x1 + 1) / 2, y: (b.y0 + b.y1 + 1) / 2 });
  if (b.sign && flat && b.front === "top" && kind !== "gas" && kind !== "motel") b.props.push({ t: "roofsign", x: b.x0 + 1, y: b.front === "top" ? b.y0 + .6 : b.y1 + .4, w: w - 2 });
  b.top = top;
  if (b.sign && ["diner", "bar", "bookstore", "clothing", "cornerstore", "video", "liquor", "laundromat", "sports", "post", "bank"].includes(kind)){ b.facade = pick(["brick", "brown", "brick", "stone", "stucco", "white", b.facade || "block"], rnd); b.trim = pick(["#3a3a36", "#d8d0bc", "#6a4a34"], rnd); }
  // vehicles in matching livery
  const liv = { police: ["police", "#1a1a1e"], hospital: ["amb", "#eceee8"], clinic: ["amb", "#eceee8"], firestation: ["fire", "#a81e1e"], school: ["bus", "#e8b020"] }[kind];
  if (liv) parkLivery(b, liv[0], liv[1]);
  if (kind === "gunstore"){ b.alarm = true; for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++){ const f = feats.get(ix(x, y)); if (f && f.type === "win") f.iron = true; if (f && f.type === "door" && (y === b.y0 || y === b.y1)) f.locked = true; } }
  if (kind === "surplus") for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++){ const o = objs.get(ix(x, y)); if (o && (o.type === "rack" || o.type === "crate")) o.loot = "surplus"; }
  if (kind === "house" && LOT_CTX) houseYard(b, LOT_CTX);
  if (kind === "house" && rnd() < .28) addBasement(b.id);
  if ((kind === "garage" || kind === "warehouse" || kind === "autorepair" || kind === "barn") && rnd() < .35){ const r = rooms.filter(r => r.b === b.id).sort((a, c) => c.tiles.length - a.tiles.length)[0]; if (r){ const t2 = r.tiles.find(([x, y]) => !objs.has(ix(x, y)) && !nearType(x, y, [T.DOOR], 1)); if (t2){ const g = placeObj("generator", t2[0], t2[1], r.id); delete g.dir; g.fuel = rf(0, .4); g.on = false; } } }
}
function placeStairs(b){
  const cands = [];
  for (let y = b.y0 + 1; y < b.y1; y++) for (let x = b.x0 + 1; x < b.x1; x++){
    const i = ix(x, y); if (tile[i] !== T.FLOOR || objs.has(i)) continue;
    const r = rooms[roomId[i]]; if (!r || r.type === "bathroom" || r.type === "cell" || r.type === "vault") continue;
    let walls = 0, wdir = null, bad = false;
    for (const [dx, dy] of [[0, -1], [-1, 0], [0, 1], [1, 0]]){ const t = tile[ix(x + dx, y + dy)]; if (t === T.WALL){ walls++; wdir = [dx, dy]; } if (t === T.DOOR || t === T.WIN) bad = true; }
    for (let dy = -1; dy <= 1 && !bad; dy++) for (let dx = -1; dx <= 1; dx++){ const t = tile[ix(x + dx, y + dy)]; if (t === T.DOOR) bad = true; }
    if (bad || walls !== 1) continue;
    // must stay clear of the BSP margins on the floors above: keep it two tiles in from the outside walls
    if (x < b.x0 + 2 || x > b.x1 - 2 || y < b.y0 + 2 || y > b.y1 - 2) continue;
    cands.push([x, y, wdir, r.type === "living" || r.type === "lobby" || r.type === "reception" ? 0 : 1]);
  }
  if (!cands.length) return false;
  cands.sort((a, c) => a[3] - c[3]);
  const [x, y, wd] = cands[Math.floor(rnd() * Math.min(cands.length, 4))];
  const o = placeObj("stairs", x, y, roomId[ix(x, y)]); o.dir = [-wd[0], -wd[1]]; o.up = true; o.down = false;
  b.stair = { x, y, dir: o.dir };
  return true;
}
function parkLivery(b, livery, col){
  const fy = b.front === "top" ? b.y0 - 2 : b.y1 + 2;
  for (let dy = 0; dy < 6; dy++) for (let dx = 0; dx < b.x1 - b.x0; dx++){
    for (const yy of [fy - dy * (b.front === "top" ? 1 : -1)]){
      const x = b.x0 + dx, y = yy; if (!inb(x, y)) continue;
      const t = tile[ix(x, y)]; if ((t !== T.ROAD && t !== T.LOT) || objs.has(ix(x, y))) continue;
      if (!(tile[ix(x - 1, y)] === t && tile[ix(x + 1, y)] === t)) continue;
      const o = placeObj("car", x, y, -1); o.col = col; o.livery = livery; o.dir = [1, 0]; return;
    }
  }
}
// porch light, mailbox, fences, flower beds, a car in the drive
function houseYard(b, L){
  const fy = b.front === "top" ? b.y0 : b.y1, out = b.front === "top" ? -1 : 1;
  for (let x = b.x0 + 1; x < b.x1; x++){
    if (tile[ix(x, fy)] !== T.DOOR) continue;
    const py = fy + out; if (!objs.has(ix(x + 1, py)) && tile[ix(x + 1, py)] === T.GRASS){ const o = placeObj("porchlight", x + 1, py, -1); delete o.dir; o.wall = [x, fy]; }
    break;
  }
  const my = b.front === "top" ? L.ly0 : L.ly1;
  for (let x = L.lx0 + 1; x <= L.lx1 - 1; x++) if (tile[ix(x, my)] === T.GRASS && !objs.has(ix(x, my)) && rnd() < .5){ const o = placeObj("mailbox", x, my, -1); delete o.dir; break; }
  if (rnd() < .45){
    const kind = rnd() < .55 ? "fence" : "fencew", back = b.front === "top" ? L.ly1 : L.ly0;
    const put = (x, y, horiz) => { if (!inb(x, y) || tile[ix(x, y)] !== T.GRASS || objs.has(ix(x, y))) return; const o = placeObj(kind, x, y, -1); o.dir = null; o.horiz = horiz; };
    for (let x = L.lx0; x <= L.lx1; x++) put(x, back, true);
    const ys = b.front === "top" ? [b.y0 + 2, L.ly1] : [L.ly0, b.y1 - 2];
    for (let y = Math.min(...ys); y <= Math.max(...ys); y++){ put(L.lx0, y, false); put(L.lx1, y, false); }
  }
  if (rnd() < .5){ for (let x = b.x0; x <= b.x1; x++){ const y = fy + out; if (tile[ix(x, y)] === T.GRASS && !objs.has(ix(x, y)) && rnd() < .35){ const o = placeObj("flowerbed", x, y, -1); delete o.dir; } } }
  for (let k = 0; k < 2; k++){ const x = L.lx0 + Math.floor(rnd() * (L.lx1 - L.lx0 + 1)), y = L.ly0 + Math.floor(rnd() * (L.ly1 - L.ly0 + 1)); if (tile[ix(x, y)] === T.GRASS && !objs.has(ix(x, y)) && !nearType(x, y, [T.DOOR, T.WIN, T.WALL], 1)){ const o = placeObj("bush", x, y, -1); delete o.dir; } }
}

// ---------- towns: a plan, not a dice roll per block ----------
let TOWN_CTX = null;
const CIVIC = ["police", "firestation", "school", "clinic", "library", "church", "hospital", "post"];
const SPECIAL = ["gas", "motel", "autorepair", "warehouse", "apartments", "office", "shops", "park", "storage", "bank"];
function townPlan(n, kind){
  const plan = [];
  const civ = CIVIC.slice().sort(() => rnd() - .5), spc = SPECIAL.slice().sort(() => rnd() - .5);
  if (kind === "village"){
    plan.push("mainstreet"); if (n > 2) plan.push(pick(["church", "gas", "post"], rnd)); if (n > 3 && rnd() < .5) plan.push("trailers");
  } else if (kind === "civic"){
    plan.push("mainstreet", civ[0], civ[1], spc[0]); if (n > 4) plan.push(civ[2], spc[1]); if (n > 6) plan.push(spc[2], "apartments");
  } else {
    plan.push("mainstreet"); if (n >= 6) plan.push("mainstreet");
    plan.push(civ[0]); if (n >= 4) plan.push(spc[0]); if (n >= 6) plan.push(civ[1], spc[1]); if (n >= 8) plan.push(rnd() < .5 ? civ[2] : spc[2]);
  }
  while (plan.length < n) plan.push(kind === "village" || rnd() < .85 ? "houses" : "houses2");
  return plan.slice(0, n);
}
function regionTown(R0, bx, by){
  const B = 30, w = bx * B + 3, h = by * B + 3;
  const fit = (hw, lo, hi, n, size) => { const o = [...Array(n + 1).keys()].sort(() => rnd() - .5); for (const i of o){ const s = hw - 1 - i * B; if (s >= lo + 3 && s + size <= hi - 3) return s; } return null; };
  const tx0 = fit(R0.hx, R0.x0, R0.x1, bx, w), ty0 = fit(R0.hy, R0.y0, R0.y1, by, h);
  if (tx0 == null || ty0 == null) return false;
  const t = { x0: tx0, y0: ty0, x1: tx0 + w, y1: ty0 + h, bx, by, B, name: townName(), kind: R0.kind, region: (R0.y0 / REG) * RX + R0.x0 / REG, cross: [] };
  t.cx = (t.x0 + t.x1) / 2; t.cy = (t.y0 + t.y1) / 2;
  TOWNS.push(t); TOWN_CTX = t;
  for (let y = t.y0 - 4; y <= t.y1 + 4; y++) for (let x = t.x0 - 4; x <= t.x1 + 4; x++){ if (tile[ix(x, y)] !== T.ROAD) tile[ix(x, y)] = T.GRASS; ZONE[ix(x, y)] = 1; }
  t.roadsX = []; t.roadsY = [];
  for (let i = 0; i <= bx; i++){ const x = t.x0 + 1 + i * B; vRoad(x, t.y0, t.y1); t.roadsX.push(x); }
  for (let j = 0; j <= by; j++){ const y = t.y0 + 1 + j * B; hRoad(y, t.x0, t.x1); t.roadsY.push(y); }
  for (const x of t.roadsX) for (const y of t.roadsY) t.cross.push([x, y]);
  // blocks next to the highway road get the busy stuff
  const blocks = [];
  for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++){
    const bx0 = t.x0 + 1 + i * B + 4, bx1 = t.x0 + 1 + (i + 1) * B - 4, by0 = t.y0 + 1 + j * B + 4, by1 = t.y0 + 1 + (j + 1) * B - 4;
    const dHwy = Math.min(Math.abs((bx0 + bx1) / 2 - R0.hx), Math.abs((by0 + by1) / 2 - R0.hy));
    blocks.push({ bx0, by0, bx1, by1, dHwy: dHwy + rnd() * 8 });
  }
  blocks.sort((a, c) => a.dHwy - c.dHwy);
  const plan = townPlan(blocks.length, R0.kind);
  blocks.forEach((bl, k) => blockGen(plan[k], bl.bx0, bl.by0, bl.bx1, bl.by1, rnd() < .5 ? "top" : "bottom", R0));
  TOWN_CTX = null;
  return true;
}
function blockGen(kind, x0, y0, x1, y1, front, R0){
  const W2 = x1 - x0 + 1, H2 = y1 - y0 + 1;
  const place = (w, h, k, fr = front, xo) => { const bx = xo ?? x0 + Math.floor((W2 - w) / 2), by = fr === "top" ? y0 : y1 - h + 1; const b = genBuilding(bx, by, bx + w - 1, by + h - 1, k, fr); return b; };
  const lot = (ya, yb) => { for (let y = ya; y <= yb; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS || tile[ix(x, y)] === T.TREE) tile[ix(x, y)] = T.LOT; };
  const back = (h) => front === "top" ? lot(y0 + h, y1) : lot(y0, y1 - h);
  switch (kind){
    case "houses": houseBlock(x0, y0, x1, y1); break;
    case "houses2": {
      const mid = Math.floor((x0 + x1) / 2), midy = Math.floor((y0 + y1) / 2);
      if (kind === "houses2"){ // a big two-storey home with fence and hedges on half the block
        for (const [ya, yb, fr] of [[y0, midy - 1, "top"], [midy + 1, y1, "bottom"]]){
          if (rnd() < .5){ LOT_CTX = { lx0: x0, ly0: ya, lx1: x1, ly1: yb }; const hw = 13, hh2 = Math.min(10, yb - ya); const hx = x0 + 4 + Math.floor(rnd() * 4), hy = fr === "top" ? ya + 1 : yb - hh2 + 1 - 1;
            buildHouse(hx, hy, hx + hw - 1, hy + hh2 - 1, fr); LOT_CTX = null;
            for (let x = x0; x <= x1; x++){ const y = fr === "top" ? ya : yb; if (tile[ix(x, y)] === T.GRASS && !objs.has(ix(x, y)) && (x < hx - 1 || x > hx + hw)){ const o = placeObj("hedge", x, y, -1); o.dir = null; o.horiz = true; } } }
          else for (const L of fr === "top" ? [[x0, ya, mid - 1, yb, "top"], [mid + 1, ya, x1, yb, "top"]] : [[x0, ya, mid - 1, yb, "bottom"], [mid + 1, ya, x1, yb, "bottom"]]) genLot(...L);
        }
        break;
      }
      for (const L of [[x0, y0, mid - 1, midy - 1, "top"], [mid + 1, y0, x1, midy - 1, "top"], [x0, midy + 1, mid - 1, y1, "bottom"], [mid + 1, midy + 1, x1, y1, "bottom"]]) if (rnd() < .95) genLot(...L);
      break;
    }
    case "mainstreet": {
      // a row of small businesses facing each road, three each side
      const kinds = ["diner", "bar", "bookstore", "clothing", "sports", "liquor", "video", "laundromat", "bank", "cornerstore", "pharmacy", "hardware", "post", "gunstore", "surplus"].sort(() => rnd() - .5);
      let k = 0;
      for (const fr of ["top", "bottom"]){
        const hgt = 10, sw = Math.floor(W2 / 3);
        for (let s = 0; s < 3; s++){
          const sx0 = x0 + s * sw, sx1 = s === 2 ? x1 : sx0 + sw - 2;
          const kind2 = kinds[k++ % kinds.length];
          if (kind2 === "pharmacy" || kind2 === "hardware") { const by = fr === "top" ? y0 : y1 - hgt; genStore(sx0, by, sx1, by + hgt, kind2, fr === "top" ? by : by + hgt); }
          else genBuilding(sx0, fr === "top" ? y0 : y1 - hgt + 1, sx1, fr === "top" ? y0 + hgt - 1 : y1, kind2, fr);
        }
      }
      for (let y = y0 + 11; y < y1 - 10; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS) tile[ix(x, y)] = T.LOT;
      for (let n = 0; n < 2; n++){ const x = x0 + 2 + Math.floor(rnd() * (W2 - 4)), y = y0 + 11; if (tile[ix(x, y)] === T.LOT && !objs.has(ix(x, y))){ const o = placeObj("dumpster", x, y, -1); delete o.dir; } }
      break;
    }
    case "shops": genCommercialR(x0, y0, x1, y1); { const y = y0 + 11; for (let n = 0; n < 3; n++){ const x = x0 + 3 + Math.floor(rnd() * (W2 - 6)); if (tile[ix(x, y)] === T.LOT && !objs.has(ix(x, y))){ const o = placeObj(rnd() < .6 ? "cart" : "dumpster", x, y, -1); delete o.dir; } } } break;
    case "park": genPark(x0, y0, x1, y1); parkProps(x0, y0, x1, y1); break;
    case "hospital": place(W2, H2, "hospital"); R0.extraZ = (R0.extraZ || 0) + 40; break;
    case "clinic": place(15, 13, "clinic"); back(13); break;
    case "school": place(W2, 17, "school"); back(17); playground(x0, front === "top" ? y0 + 18 : y0, x1, front === "top" ? y1 : y1 - 18); break;
    case "police": place(W2, 15, "police"); back(15); R0.extraZ = (R0.extraZ || 0) + 12; break;
    case "firestation": place(17, 15, "firestation"); back(15); break;
    case "library": place(19, 15, "library"); break;
    case "tower": raiseTower(place(15, 15, "tower")); break;
    case "officetower": raiseTower(place(15, 15, "officetower")); break;
    case "hotel": raiseTower(place(17, 15, "hotel")); break;
    case "church": place(13, 19, "church"); cemetery(x0, y0 + 2, x0 + 4, y1 - 2); cemetery(x1 - 4, y0 + 2, x1, y1 - 2); break;
    case "mall": mallGen(x0, y0, x1, y1, front, R0); break;
    case "cinema": cinemaGen(x0, y0, x1, y1, front, R0); break;
    case "square": townSquare(x0, y0, x1, y1); break;
    case "apartments": place(W2, 15, "apartments"); back(15); break;
    case "office": place(19, 17, "office"); back(17); break;
    case "warehouse": place(W2, 17, "warehouse"); back(17); break;
    case "autorepair": place(17, 13, "autorepair"); back(13); break;
    case "post": place(13, 11, "post"); back(11); break;
    case "bank": place(13, 12, "bank"); back(12); break;
    case "storage": { // rows of lock-up storage units
      for (let r = 0; r < 2; r++){ const by = r ? y1 - 6 : y0; for (let s = 0; s < 4; s++){ const sx = x0 + s * 6; genBuilding(sx, by, sx + 5, by + 6, "storageunit", r ? "top" : "bottom"); } }
      for (let y = y0 + 7; y < y1 - 6; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS) tile[ix(x, y)] = T.DIRT;
      break;
    }
    case "motel": genMotel(x0, front === "top" ? y0 : y1 - 8, x1, front === "top" ? y0 + 8 : y1, front); back(9);
      { const x = x1 - 1, y = front === "top" ? y0 + 10 : y1 - 10; if (!objs.has(ix(x, y))){ const o = placeObj("polesign", x, y, -1); delete o.dir; o.text = pick(NAMES.motel, rnd); o.col = SIGNCOL.motel; o.neon = true; } } break;
    case "gas": genGas(x0, y0, x1, y1, front); break;
    case "trailers": {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS) tile[ix(x, y)] = T.DIRT;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++){ const tx = x0 + 1 + i * 7, ty = y0 + 1 + j * 12; genBuilding(tx, ty, tx + 5, ty + 8, "trailer", j ? "bottom" : "top"); }
      break;
    }
  }
}
function parkProps(x0, y0, x1, y1){
  const put = (k, x, y) => { if (inb(x, y) && (tile[ix(x, y)] === T.GRASS || tile[ix(x, y)] === T.DIRT) && !objs.has(ix(x, y))){ tile[ix(x, y)] = T.GRASS; const o = placeObj(k, x, y, -1); delete o.dir; } };
  const cx = Math.floor((x0 + x1) / 2), cy = Math.floor((y0 + y1) / 2);
  put("swing", cx - 3, cy); put("slide", cx + 2, cy + 1); put("picnic", cx - 4, cy + 5); put("picnic", cx + 4, cy - 5); put("bench", cx, cy - 4); put("bench", cx + 1, cy + 5); put("trashcan", cx - 1, cy - 4);
}
function playground(x0, y0, x1, y1){
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (tile[ix(x, y)] === T.GRASS || tile[ix(x, y)] === T.TREE) tile[ix(x, y)] = T.GRASS;
  const cx = Math.floor((x0 + x1) / 2), cy = Math.floor((y0 + y1) / 2);
  for (const [k, dx, dy] of [["swing", -4, 0], ["slide", 3, 0], ["bench", 0, 2]]){ const x = cx + dx, y = cy + dy; if (!objs.has(ix(x, y))){ const o = placeObj(k, x, y, -1); delete o.dir; } }
}

// ---------- street furniture ----------
function placeTownDecor(t){
  const put = (k, x, y, extra) => { if (!inb(x, y) || objs.has(ix(x, y)) || feats.has(ix(x, y))) return null; if (nearType(x, y, [T.DOOR], 1)) return null; const o = placeObj(k, x, y, -1); delete o.dir; if (extra) Object.assign(o, extra); return o; };
  // sidewalk tiles beside each town road: lamps, hydrants, trash cans, news boxes, phone booths, bus stops
  let n = 0; const lamps = [];
  for (let y = t.y0 - 1; y <= t.y1 + 1; y++) for (let x = t.x0 - 1; x <= t.x1 + 1; x++){
    if (!inb(x, y) || tile[ix(x, y)] !== T.WALK) continue;
    n++;
    const h = hash3(WSEED, x * 3 + 1, y * 7 + 2) % 1000;
    if (h % 13 === 0 && !lamps.some(([lx, ly]) => Math.abs(lx - x) + Math.abs(ly - y) < 11)){ if (put("lamp", x, y)) lamps.push([x, y]); }
    else if (h < 18) put("hydrant", x, y);
    else if (h < 30) put("trashcan", x, y);
    else if (h < 36 && t.kind !== "village") put("newsbox", x, y);
    else if (h < 39) put("phonebooth", x, y);
    else if (h < 43) put("busstop", x, y);
  }
  // traffic lights (towns) or stop signs (villages) at crossings
  for (const [cx, cy] of t.cross){
    const corners = [[cx - 2, cy - 2], [cx + 2, cy + 2]];
    for (const [x, y] of corners) if (inb(x, y) && tile[ix(x, y)] === T.WALK) put(t.kind === "village" ? "stopsign" : "tlight", x, y);
  }
  // a welcome sign where the highway enters the town
  const wx = t.x0 - 3, wy = t.roadsY[0] + 3;
  if (inb(wx, wy) && tile[ix(wx, wy)] === T.GRASS) put("welcome", wx, wy, { text: t.name });
}
function placeRoadDecor(R0){
  const put = (k, x, y, extra) => { if (!inb(x, y) || x <= R0.x0 || y <= R0.y0 || x >= R0.x1 || y >= R0.y1) return null; const t = tile[ix(x, y)]; if (t !== T.GRASS && t !== T.DIRT && t !== T.TREE) return null; if (objs.has(ix(x, y)) || bldId[ix(x, y)] >= 0 || ZONE[ix(x, y)]) return null; tile[ix(x, y)] = T.GRASS; const o = placeObj(k, x, y, -1); delete o.dir; if (extra) Object.assign(o, extra); return o; };
  // utility poles every 10 tiles along both highways, wired together
  let prev = null;
  for (let x = R0.x0 + 3; x < R0.x1; x += 10){ const o = put("upole", x, R0.hy - 3); if (o){ if (prev) prev.wire = [o.x, o.y]; prev = o; } else prev = null; }
  prev = null;
  for (let y = R0.y0 + 3; y < R0.y1; y += 10){ const o = put("upole", R0.hx + 3, y); if (o){ if (prev) prev.wire = [o.x, o.y]; prev = o; } else prev = null; }
  // a billboard or two
  if (rnd() < .6) put("billboard", R0.x0 + 20 + Math.floor(rnd() * 80), R0.hy + 5, { text: pick(["STAY INDOORS", "SPIFFY CLEAN CARPETS", "KNOW YOUR NEIGHBOR", "JESUS SAVES", "EAT AT JOE'S", "GUNS & AMMO 2 MILES", "VOTE YES ON 4"], rnd) });
  // rocks and reeds in the wild
  for (let k = 0; k < 18; k++){ const x = ri(R0.x0 + 2, R0.x1 - 2, rnd), y = ri(R0.y0 + 2, R0.y1 - 2, rnd); if (tile[ix(x, y)] === T.GRASS && !ZONE[ix(x, y)] && !objs.has(ix(x, y)) && Math.abs(y - R0.hy) > 3 && Math.abs(x - R0.hx) > 3){ const o = placeObj("rock", x, y, -1); delete o.dir; } }
  for (let y = R0.y0 + 1; y < R0.y1; y++) for (let x = R0.x0 + 1; x < R0.x1; x++){
    if (tile[ix(x, y)] !== T.GRASS || objs.has(ix(x, y))) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => tile[ix(x + dx, y + dy)] === T.WATER) && hash3(WSEED, x, y) % 5 < 2){ const o = placeObj("reeds", x, y, -1); delete o.dir; }
  }
  // a burnt-out wreck now and then on the highway
  if (rnd() < .35){ const x = R0.x0 + 10 + Math.floor(rnd() * 100); if (tile[ix(x, R0.hy)] === T.ROAD && !objs.has(ix(x, R0.hy))){ const o = placeObj("wreck", x, R0.hy, -1); delete o.dir; } }
}

// ---------- vehicles with liveries ----------
function convertCars(){
  for (const [i, o] of [...objs]) if (o.type === "car"){
    objs.delete(i);
    const a = o.dir && o.dir[0] ? (R() < .5 ? 0 : Math.PI) : (R() < .5 ? Math.PI / 2 : -Math.PI / 2);
    const c = { x: o.x + .5, y: o.y + .5, a, v: 0, col: o.col, livery: o.livery || null, fuel: rf(.05, .7), cond: ri(35, 95), locked: R() < .55, key: false, on: false, hot: false, broken: false, trunk: null, glove: null, nT: 0, uid: Math.random().toString(36).slice(2, 9) };
    const keyItem = () => ({ id: "carkey", car: c.uid, label: c.livery === "police" ? "police" : c.livery === "amb" ? "ambulance" : (CAR_NAMES[c.col] || "old") });
    const roll = R();
    if (roll < .2) c.key = true;
    else if (roll < .45) c.gloveKey = true;
    else if (roll < .55){ const gx = o.x + ri(-1, 1), gy = o.y + (R() < .5 ? -2 : 2); if (inb(gx, gy) && tile[ix(gx, gy)] !== T.WALL){ const fl = floorItems.get(ix(gx, gy)) || []; fl.push(keyItem()); floorItems.set(ix(gx, gy), fl); } }
    else if (roll < .7){
      let best = null, bd = 18;
      for (let dy = -14; dy <= 14; dy += 2) for (let dx = -14; dx <= 14; dx += 2){ const q = objs.get(ix(o.x + dx, o.y + dy)); if (q && OBJ[q.type].cont && !q.items){ const d = Math.hypot(dx, dy); if (d < bd){ bd = d; best = q; } } }
      if (best) (best.extra = best.extra || []).push(keyItem());
    }
    V.push(c);
  }
}
function rollTrunk(c){ if (!c.trunk){ const o = {}; rollLoot(o, c.livery && LOOT["trunk_" + c.livery] ? "trunk_" + c.livery : "trunk"); c.trunk = o.items; } return c.trunk; }

// ---------- zombies dressed for where they died ----------
function spawnIn(x0, y0, x1, y1, n, soldiers){
  n = Math.round(n * (CFG.popMul || 1)); let made = 0;
  for (let tries = 0; made < n && tries < n * 30; tries++){
    const x = ri(x0 + 1, x1 - 1), y = ri(y0 + 1, y1 - 1), t = tile[ix(x, y)];
    if (t === T.WALL || t === T.TREE || t === T.WATER || t === T.DOOR || t === T.WIN || t === T.VOID) continue;
    const o = objs.get(ix(x, y)); if (o && OBJ[o.type].block) continue;
    if (P && G && Math.hypot(x - P.x, y - P.y) < 16) continue;
    const b = bldId[ix(x, y)];
    if (G && b >= 0 && b === G.startBld) continue;
    if (!ZONE[ix(x, y)] && R() < .85) continue;
    if (!(b >= 0) && inCrack(x, y) && R() < .85) continue;
    const z = newZombie(x + .5 + rf(-.2, .2), y + .5 + rf(-.2, .2));
    if (b >= 0){ applyOutfit(z, buildings[b].kind); if (buildings[b].kind === "police" && R() < .22) z.carry = [lootGun(R() < .6 ? "pistol9" : "revolver"), ammoItem(R() < .6 ? "ammo9" : "ammo38", ri(4, 14))]; }
    Z.push(z); made++;
  }
  for (const c of V) if (c.zKey && c.x >= x0 && c.x <= x1 && c.y >= y0 && c.y <= y1){ let best = null, bd = 25; for (const z of Z){ const d = Math.hypot(z.x - c.x, z.y - c.y); if (z.alive && d < bd){ bd = d; best = z; } } if (best){ best.carry = [{ id: "carkey", car: c.uid, label: CAR_NAMES[c.col] || "old" }]; c.zKey = false; } }
  if (soldiers) for (let k = 0; k < 8; k++){ const z = newZombie(soldiers[0] + rf(-4, 4) + .5, soldiers[1] + rf(-4, 4) + .5); if (solidZ(Math.floor(z.x), Math.floor(z.y))) continue; applyOutfit(z, "soldier"); z.col = "#4a5636"; z.pants = "#3a4430"; z.hat = "helmet"; z.hatCol = "#4a5636"; if (R() < .18) z.carry = [lootGun("m16"), ammoItem("ammo556", ri(5, 20))]; Z.push(z); }
}

// ============================================================
// Upper floors live in a reserved band at the bottom of the world
// (never generated as terrain) and are mapped back onto their
// building when drawn. They are generated when first visited.
// ============================================================
const PK_Y0 = 1792;
let PKS = [], PKMAP = new Map(), PKID = null, PK_ORDER = [], pkCur = { x: 4, y: PK_Y0 + 4, rowH: 0 };
function resetPockets(){ PKS = []; PKMAP = new Map(); PKID = new Int16Array(W * (H - PK_Y0)); PK_ORDER = []; pkCur = { x: 4, y: PK_Y0 + 4, rowH: 0 }; }
function pkAt(x, y){ if (!PKID || y < PK_Y0 || y >= H || x < 0 || x >= W) return null; const id = PKID[(y - PK_Y0) * W + x]; return id ? PKS[id - 1] : null; }
function realXY(x, y){ const pk = pkAt(Math.floor(x), Math.floor(y)); return pk ? { x: x - pk.ox, y: y - pk.oy, lvl: pk.k, pk } : { x, y, lvl: 0, pk: null }; }
function ensureFloor(b, k){ return PKMAP.get(b * 16 + k) || genFloor(b, k); }
function genFloor(b, k){
  const B = buildings[b]; if (!B || !B.stair || (k < 1 && !(k === -1 && B.basement)) || k >= B.floors) return null;
  const w = B.x1 - B.x0 + 1, h = B.y1 - B.y0 + 1;
  if (pkCur.x + w + 4 >= W){ pkCur.x = 4; pkCur.y += pkCur.rowH + 4; pkCur.rowH = 0; }
  if (pkCur.y + h + 4 >= H) return null;
  const px0 = pkCur.x, py0 = pkCur.y; pkCur.x += w + 4; pkCur.rowH = Math.max(pkCur.rowH, h);
  const pk = { b, k, ox: px0 - B.x0, oy: py0 - B.y0, x0: px0, y0: py0, x1: px0 + w - 1, y1: py0 + h - 1, id: PKS.length };
  PKS.push(pk); PKMAP.set(b * 16 + k, pk); PK_ORDER.push([b, k]);
  srand(hash3(WSEED, b * 17 + k, 4242) || 1);
  for (let y = py0 - 1; y <= pk.y1 + 1; y++) for (let x = px0 - 1; x <= pk.x1 + 1; x++){
    const i = ix(x, y); PKID[(y - PK_Y0) * W + x] = pk.id + 1;
    if (x < px0 || y < py0 || x > pk.x1 || y > pk.y1){ tile[i] = T.VOID; continue; }
    const e = x === px0 || x === pk.x1 || y === py0 || y === pk.y1;
    tile[i] = e ? T.WALL : T.FLOOR; bldId[i] = b; ZONE[i] = 1; roomId[i] = -1;
  }
  if (B.kind === "mall") return mallFloor(B, b, k, pk);
  const sx = B.stair.x + pk.ox, sy = B.stair.y + pk.oy;
  // interior walls, keeping clear of the stairwell
  const doors = [[sx, sy]], sp = { min: B.kind === "house" ? 3 : 4 };
  const nearDoor = (x, y) => doors.some(([dx, dy]) => Math.abs(dx - x) <= 1 && Math.abs(dy - y) <= 1);
  const split = (a0, b0, a1, b1, depth) => {
    const iw = a1 - a0 - 1, ih = b1 - b0 - 1, m = sp.min;
    const canV = iw >= 2 * m + 1, canH = ih >= 2 * m + 1;
    if ((!canV && !canH) || depth > 6 || (iw * ih < m * m * 3 && rnd() < .45)) return;
    const vert = canV && (!canH || iw > ih || (iw === ih && rnd() < .5));
    for (let tries = 0; tries < 10; tries++){
      if (vert){
        const c = ri(a0 + m + 1, a1 - m - 1, rnd);
        if (nearDoor(c, b0) || nearDoor(c, b1) || Math.abs(c - sx) <= 1) continue;
        for (let y = b0; y <= b1; y++) tile[ix(c, y)] = T.WALL;
        const d = ri(b0 + 1, b1 - 1, rnd); setDoor(c, d, false); doors.push([c, d]);
        split(a0, b0, c, b1, depth + 1); split(c, b0, a1, b1, depth + 1); return;
      }
      const c = ri(b0 + m + 1, b1 - m - 1, rnd);
      if (nearDoor(a0, c) || nearDoor(a1, c) || Math.abs(c - sy) <= 1) continue;
      for (let x = a0; x <= a1; x++) tile[ix(x, c)] = T.WALL;
      const d = ri(a0 + 1, a1 - 1, rnd); setDoor(d, c, false); doors.push([d, c]);
      split(a0, b0, a1, c, depth + 1); split(a0, c, a1, b1, depth + 1); return;
    }
  };
  split(px0, py0, pk.x1, pk.y1, 0);
  tile[ix(sx, sy)] = T.FLOOR;
  const winStep = B.kind === "office" ? 2 : 3;
  if (k > 0) for (let x = px0 + 1; x < pk.x1; x++) if ((x - px0) % winStep === 1){ for (const [y, oy] of [[py0, 1], [pk.y1, -1]]) if (tile[ix(x, y + oy)] === T.FLOOR && !nearType(x, y, [T.WIN], 1) && tile[ix(x - 1, y)] === T.WALL && tile[ix(x + 1, y)] === T.WALL) setWin(x, y); }
  if (k > 0) for (let y = py0 + 1; y < pk.y1; y++) if ((y - py0) % winStep === 1){ for (const [x, ox] of [[px0, 1], [pk.x1, -1]]) if (tile[ix(x + ox, y)] === T.FLOOR && !nearType(x, y, [T.WIN], 1) && tile[ix(x, y - 1)] === T.WALL && tile[ix(x, y + 1)] === T.WALL) setWin(x, y); }
  // rooms
  const found = [];
  for (let y = py0 + 1; y < pk.y1; y++) for (let x = px0 + 1; x < pk.x1; x++){
    if (tile[ix(x, y)] !== T.FLOOR || roomId[ix(x, y)] >= 0) continue;
    const r = { id: rooms.length, type: "bedroom", tiles: [], b }; rooms.push(r); found.push(r);
    const st = [[x, y]]; roomId[ix(x, y)] = r.id;
    while (st.length){ const [cx, cy] = st.pop(); r.tiles.push([cx, cy]); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = cx + dx, ny = cy + dy; if (tile[ix(nx, ny)] === T.FLOOR && roomId[ix(nx, ny)] < 0){ roomId[ix(nx, ny)] = r.id; st.push([nx, ny]); } } }
  }
  const list = k < 0 ? ["basement", "basement", "storage"] : UPPER[B.kind] || ["office", "storage"];
  found.sort((a, c) => c.tiles.length - a.tiles.length).forEach((r, i) => r.type = list[i % list.length]);
  const st = placeObj("stairs", sx, sy, roomId[ix(sx, sy)]); st.dir = B.stair.dir; st.down = k > 0; st.up = k < 0 || k < B.floors - 1;
  for (const r of found){ const F = FURN2[r.type] || ({ bedroom: { wall: ["bed", "wardrobe", "dresser"] }, bathroom: { wall: ["toilet", "bsink", "medcab"] }, kitchen: { wall: ["fridge", "oven", "ksink", "counter"] }, living: { wall: ["sofa", "tv", "bookcase"] } })[r.type]; if (!F) continue; furnishRoom(r, F.wall.slice()); if (F.rows) placeRows(r, ...F.rows); }
  for (const r of found) for (const [x, y] of r.tiles){ const o = objs.get(ix(x, y)); if (!o) continue; if (o.type === "shelf") o.store = SHELF_STORE[B.kind] || "hardware"; if (o.type === "locker" && B.kind === "police") o.loot = "locker_police"; if (o.type === "locker" && B.kind === "firestation") o.loot = "locker_fire"; if (o.type === "medcab" && B.kind === "hospital") o.loot = "medcab_hosp"; }
  for (let y = py0; y <= pk.y1; y++) for (let x = px0; x <= pk.x1; x++){ const i = ix(x, y); if (tile[i] === T.FLOOR) continue; for (let dy = -1; dy <= 1 && !perim[i]; dy++) for (let dx = -1; dx <= 1; dx++) if (bldId[ix(x + dx, y + dy)] !== b){ perim[i] = 1; break; } }
  if (typeof WRC !== "undefined") WRC.clear();
  // a few of them upstairs too, but not right at the top of the stairs
  const nz = k < 0 ? ri(0, 1) : { house: ri(0, 2), apartments: ri(2, 6), tower: ri(2, 6), officetower: ri(2, 5), hotel: ri(2, 5), office: ri(2, 5), hospital: ri(3, 7), school: ri(2, 5), police: ri(1, 3), firestation: ri(0, 2) }[B.kind] ?? ri(0, 3);
  for (let n = 0, tries = 0; n < nz && tries < 200; tries++){
    const r = pick(found); if (!r) break; const [x, y] = pick(r.tiles);
    if (Math.hypot(x - sx, y - sy) < 4 || objs.has(ix(x, y))) continue;
    const z = newZombie(x + .5, y + .5); applyOutfit(z, B.kind); Z.push(z); n++;
  }
  upperDecor(B, b, k, pk);
  return pk;
}
