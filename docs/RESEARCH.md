# Day After Dawn: Research

> **About this project:** Day After Dawn is an independent, non-commercial fan project inspired by *Project Zomboid*. All of its code, art, names and text are original. It is not affiliated with or endorsed by The Indie Stone, who own Project Zomboid. Mentions of Project Zomboid in this document are research and commentary.

*Everything learned about Project Zomboid (the original) while building Day After Dawn. Every entry is dated. First research: 12 Oct 2026. Last updated: 16 Oct 2026 (v1.12).*

**Contents**
1. Research rounds R1 to R32 (dated, newest last)
2. Research Addendum (written 14 Oct 2026)
3. Research v3 (written 14 Oct 2026)

The original research blueprint (12 Oct 2026) is kept in the Recreation Document, because it doubles as the specification of what to recreate.

---

## 1. Research rounds

Raw notes from each round, with sources. R1 to R14 fed the Addendum and Research v3 (sections 2 and 3).

### R1 (on or before 14 Oct 2026) Sound & stealth (sources: pzwiki Sneaking, pzfans Lightfooted, Steam discussions)
- Sneak (C): footstep sound radius x0.20, detection chance x0.40 (base). Sneaking skill multiplies sneak radius: lvl0 120% ... lvl10 40% -> effective 24%..8% of base footstep radius. Detection: lvl0 114% .. lvl10 48% (x0.40 base already applied in table: 114%? table = effective detection chance multiplier).
- Lightfooted skill: footstep noise factor 0.99 at lvl0 down to 0.20 at lvl10; applies walk/run/crouch. Separate from Sneaking. Barefoot quieter than shoes.
- Idle zombie needs player in its sight cone and within ~20 tiles to spot by sight.
- Killing a zombie (splat) / attack sounds alert zombies ~5-7 tiles.
- Combat noise draws "a block in every direction" in dense areas -> stealth is about avoiding fights; luring with noise (noisemakers) is "king".
- Keen Hearing = larger perception radius (see zombies behind you), Deaf = tiny. Trees rustle/shake when zombies move through them (inside hearing radius).
- Sandbox zombie hearing can be Pinpoint/Normal/Poor/Random; B42 complaints that hits aggro whole street with some "pinpoint" zombies.
- Zombies in PZ investigate sound location; new noise redirects.
- Metagame: distant gunshots/screams up to once a day; helicopter.
### R2 (on or before 14 Oct 2026) Zombie density & distribution (projectzomboid.com 42.20 overview, playerecho, build42guide, Steam)
- B42 heat map auto-generated FROM TILE TYPES: military tiles big radius + high multiplier, vacant tiles low. Hordes urban-focused.
- Voronoi noise overlay deletes spawns inside "cracks" -> zombie-free corridors between hotspots; seed-dependent. Indoor spawns handled separately from exterior heat map.
- Rosewood (small town) ~500 zombies, clustered at police station, fire station, school. Major towns 1-5k; Louisville ~40k; map ~50-90k.
- Default: populations migrate toward sound & respawn from neighbouring cells -> cleared towns don't stay clear.
- Industrial zones (warehouses, factories, storage) on town OUTSKIRTS.
- B42: engine noise carries ~70 tile radius. Vehicle liveries (police, work vans, race) carry matching trunk loot.
- Town identities: Rosewood (fire station 2-storey, police, bookstore, elementary school, prison lake), Riverside (gated community, river, hardware, VHS store, bookstore), Muldraugh (central, McCoy Logging, Rusty Rifle), West Point (dense, higher difficulty), Brandenburg (tornado town, destroyed train yard, military blockade), Echo Creek (rural, chicken farm, Gas 2 Go, gun store, festival). Every town has a few landmark POIs + residential blocks.
### R3 (on or before 14 Oct 2026) Loot (pzwiki Procedural distributions, pzfans room defines, bamboogaming loot finder, Steam)
- Pipeline: ROOM type -> furniture CONTAINER type -> procedural loot LIST(s). B42.19: 381 room prefixes, 1563 room*container bindings, ~1400-1420 procedural pools, 3223 lootable items.
- Each list: N rolls; each entry has a chance (not weight/percent), modified by sandbox loot rarity per CATEGORY (food, weapons, medical, literature, other...) and by local zombie population (more zombies = more loot).
- "Junk"/fluff tables: kitchen cabinets hold plates, glasses, utensils alongside food; bathroom cabinets have hair dye, gel, razors, rubber ducks; wardrobes clothes. Junk dilutes valuable rolls (realism + scarcity).
- Container generated when first loaded/seen (OnFillContainer). Options: stashChance (stash maps), isWorn/isTrash (lower condition), canBurn (food cooked/burnt), bags spawn with contents.
- Spoilable food spawns at the right age. Guns rare in B42, ammo more common.
- Item Stories mod idea: furniture/room stories; "furniturestore", "policestorage", "gunstore" rooms.
### R4 (on or before 14 Oct 2026) Lighting & atmosphere (projectzomboid.com 42.20 overview + "42 Techdoid" blog, projectzomboid.wiki lighting guide, Steam)
- B42 lighting: light bounces off walls, leaks through windows/doors/gaps; ambient interior light depends on exposure: a room with NO windows is dark even at noon; sunset glow comes in through windows with a red tint, creeping back & dimming as the sun goes down; opening a door to a lit room spills light into the corridor.
- 1990s-era bulbs: warm streetlights & exterior lights, porch/outdoor lamps on houses, neon signs on businesses (all die with the power cut). Lamp posts at crossroads/outside stores. Generators can relight nearby lamp posts.
- Nights far darker/blacker than B41: outside at night near pitch black without a light. Cat's Eyes trait: min 20% ambient + wider night vision cone.
- Light sources: flashlight (wide/narrow beam), craftable torch (sticks + torn sheets, burns out), candles, lanterns; eyes adapt to dark over 10-20 s.
- Crawlers/prone zombies easier to spot in good light; darkness = danger.
- Interior doors & light switch states randomized; some houses pre-looted/trashed ("house stories").
### R5 (on or before 14 Oct 2026) Map making / terrain generation (pzwiki Mapping, TileZed guide, Indie Stone forums, knoxify)
- Cells: 300x300 tiles (B41) -> 256x256 (B42). Each cell built from 3 images: base map (ground: dark/medium/light grass e.g. Dark Grass 90,100,35 Medium 117,117,47; dark asphalt = main roads, light asphalt = side roads/paths, dirt, gravel dirt, sand, water), vegetation map (dense forest, trees, "trees + grass", stray trees, bushes, grass clumps; black = none), ZombieSpawnMap (greyscale density at 1/10 scale).
- WorldEd "BMP to TMX" uses Rules.txt to turn colours into tiles + blend/edge rules (natural transitions grass<->sand<->dirt).
- Buildings are hand-made "lots" (.tbx in BuildingEd) placed on top: rooms with RoomDefs (room type names drive loot), furniture, walls, roofs (multi-floor).
- Detail layers: street_decoration, street_roadsigns, trashcontainers, floors_exterior_detailing (grime + traffic lines + curbs), fences (with corner posts, gates, double gates), hedges, power lines, HVAC units on roofs, vines on walls, posters, rugs, indoor lighting tiles. Furniture is movable/pick-up-able, can block zombies, destroyed by them.
- B42 has biome maps (forest types, foraging zones) generated automatically.
### R6 (on or before 14 Oct 2026) Towns & house types (pzwiki Muldraugh, guides-factory, notesread, Steam)
- Muldraugh: pop 3,566, 342 buildings of which 40 "special" (~12%); others = houses, warehouses, garages, mansions. Districts: residential (mostly small houses), 2 trailer parks (lower class; one with ~20 trailers + small motel), 2 gated communities (fenced), stores/offices dotted, elementary school, huge lumberyard, motel, Spiffo's burger diner, Cortman medical clinic, church, auto repair, police station (with basement), bar on first floor reached by stairs (balcony).
- West Point: gun store, Gigamart (big supermarket), 2 gas stations, auto repair, hardware, police, school, storage units, warehouses, many diners; LOTS of 2-storey houses, many with attached garages.
- March Ridge: rows of similar single-storey houses, restaurants, small stores, cinema, 2-storey apartment complexes (6 apartments per building).
- Rosewood: 2-storey fire station, police station w/ weapon lockers, bookstore, elementary school, Knox bank (2nd floor closets), apartments above downtown stores.
- Riverside: river, gated community, restaurant with 2nd-floor dining & staircase, hardware, VHS store, bookstore, trailer park.
- Louisville: mansions/Victorian houses with high fences, gated communities, malls (Grand Ohio Mall), hospital, offices, high-rises.
- Fences: low climbable vs tall unclimbable; metal bar fences; high fences around rich homes. Houses: multiple fireplaces, porches, garages, basements (B42).
- Industrial/storage units/lumberyards on outskirts. Restaurants, community center, movie theater, dormitories, library.
### R7 (on or before 14 Oct 2026) Difficulty scaling (supercraft sandbox from shipped Lua, pzfans presets, winternode, Steam)
- Presets B42: Apocalypse (canon: Normal pop 0.65, start 1.0x -> peak 1.5x on day 28, NO respawn, no multi-hit, rear vulnerability High, drag-down ON, mini-map OFF, scarce loot, no starter kit), Outbreak (same lethality, multi-hit, mini-map, longer utilities, faster farming, XP boosts, more loot, peak day 20), Rising (Low pop 0.15, weak/fragile shamblers, starter kit, easy climbing, respawn every 72h up to 10% after 16 unseen hours, homestead loot), Extinction (High 1.2, 1.5x->2x day 28, sprinters, tougher zombies, worse injuries/loot), Six Months Later (Insane 2.5 pop, world already decayed).
- Population labels: Insane 2.5, Very High 1.6, High 1.2, Normal 0.65, Low 0.15, None 0.
- Respawn defaults when enabled: RespawnHours 72, RespawnUnseenHours 16, RespawnMultiplier 0.1.
- Loot: per-category numeric multipliers (food, weapons, medical, literature, other...). Apocalypse "wants you scavenging constantly, and yet coming up empty". B42 Apocalypse more firearms (1993 Kentucky).
- Optional toggles: zombie lunge, fence lunge, sight/hearing (pinpoint/normal/poor/random), drag down, multi-hit, mini-map, starter kit, utilities shutoff windows, helicopter, XP multipliers.
### R8 (on or before 14 Oct 2026) Randomized stories / environmental storytelling (pzwiki Randomized stories, Building/Zone/Vehicle stories, Survivor, build history)
- 5 types: BUILDING stories (residential homes: Burnt (weight 3, alarm off), Burnt with corpses, Trashed, Barricaded Safehouse (barricaded from outside, more zombies inside, better loot, sometimes paired with annotated stash map), house party, birthday party, poker night, football night, band practice, police at house, locked in bathroom, bandit raid, Gunstore Siege, Police Siege, Dorm, Barn, Reverend...), VEHICLE stories (roads only: basic car crash, crash with corpse, flipped crash, burnt car, ambulance crash, police blockade (+shooting), changing tire w/ tools & tire on ground, construction site/roadworks with workers, trailer crash, crash horde, animal on road, bandits on road, wrecks = undrivable), ZONE stories (outdoor non-road: forest camp, forest camp eaten, burying camp, beach party, fishing trip (near water), BBQ party, hunter camp, survivalist camp, trapper camp, sad camp, tragic picnic, murder scene, old firepit, hermit camp, waste dump), SURVIVOR stories, TABLE stories (items arranged on tables).
- Situational zombie outfits/inventories: cops in police stations, firemen in burnt buildings, chefs in restaurant kitchens, doctors/nurses in hospitals, bride & groom in church, prisoners + police, workers at construction sites, survivor zeds wearing backpacks.
- Some houses pre-looted (empty, broken doors/windows), barricaded houses = loot + zombies.
- Fixed pileups at highway junctions (e.g., Rosewood-Muldraugh) besides random car stories.
### R9 (on or before 14 Oct 2026) Zombie behaviours & animation (pzwiki Zombie, Build 41 release notes, 41.30 changelog, Steam)
- Low fences: zombies FALL over them (tumble), ~4 s on the ground to get up -> window to stomp/escape; can LUNGE after vaulting (wide hitbox, stun / knockback / trip the player) unless shoved as they climb; pile-ups break small fences. Windows: zombies fall/climb through. Tall fences: players can climb with strength/fitness (drop off-hand item); zombies can't climb tall.
- Drag-down: group of zombies pulls player down, short animation + screams, instant death (number needed scales with zombie strength).
- Rear attacks far more dangerous (rear vulnerability). Grab -> player may shake free.
- Idle behaviours: feasting on recent corpses (crouched eating), lolling/leaning against walls, swaying idle, shuffling. Zombies tear down sheet ropes.
- Blood & dirt system progressively bloodies bodies and clothes (player & zombies). Injury visibly hampers movement (limp) and combat.
- Clothing protection differs by item (bite/scratch per body part).
- Situational outfits (cops, firemen, chefs, doctors, bride/groom, prisoners, construction workers, soldiers).
### R10 (on or before 14 Oct 2026) Multi-floor gameplay (Steam, pzbaseplanner stairs/sheet rope, projectzomboid.wiki sheet ropes)
- Upper floors = safest bases. Zombies WILL follow you up stairs if they spotted you, but NEVER randomly wander upstairs otherwise.
- Sheet rope: 1 sheet (+ nail, hammer) hung from an upper window; climb up/down (takes seconds, stamina, weight matters). Zombies cannot climb ropes but can tear them down. Rope goes if window breaks.
- Destroy stairs with sledgehammer (stairs built/destroyed as one unit) -> zombies can't reach upper floors; rebuild stairs needs Carpentry. Jumping from an upper floor risks fractures (broken legs).
- 2nd floor escapes: balconies, windows; bars above stores (first floor via staircase door), apartments above downtown stores, restaurants with upstairs dining.
- Zombies can break furniture used as barricades; can crawl under cars (B41) so car walls need a wall behind.
### R11 (on or before 14 Oct 2026) Design philosophy & loop (Medium essay, hypercritic review, TV Tropes, MCV interview, Jump Dash Roll, Gameoneer)
- No win condition; "These are the end-times. There was no hope of survival. This is how you died." Menu has no "New Game" (new implies hope). Death is the destination; the story is how long & what you built.
- Origin: devs concluded "we would die no matter what". Not a power fantasy: character stays fragile, exhaustible, human; one mistake ends a run.
- Realism chains: wet clothes too long -> cold -> coughing/sneezing -> noise -> zombies -> death. Fancy houses may have alarms. Running out of breath -> caught. Food poisoning from expired food. Standing near rotting corpses -> sickness. Muscle strain from exercise/combat needing hours of rest. Moving items takes time like real life.
- Loop: wake in random house, no guidance -> scavenge, fortify, learn; then grid/water shutoff forces hoarding & self-sufficiency; mid-game "ennui" is intentional; constant hyper-awareness (close doors, noise discipline). Best loot guarded by hordes.
- Emergency broadcast keeps occasional military chatter after other stations die.
### R12 (on or before 14 Oct 2026) Weather, seasons, erosion (pzwiki Weather, projectzomboid.wiki weather, freakhosting erosion, TV Tropes, Steam)
- Climate modelled on Kentucky humid subtropical; fronts drive weather: sunny, cloudy, rain (common in summer), thunderstorms (cold front into warm; thunder ATTRACTS zombies; AEBS radio announces), tropical storms (dark, windy), fog (warm fronts or cold mornings; outdoors only; severely cuts visibility), wind (visible in foliage sway, rain/snow direction, clouds; windchill in winter), snow (winter, raises calorie burn, blocks outdoor farming, collectors freeze).
- B42 rain collectors gather TAINTED water (boil or purification tablets).
- Erosion: grass overflows onto pavement, vines climb walls and cover windows (obscure vision), walls crack, pavement flakes, bushes/saplings grow on gravel/dirt roads (narrowing them), young trees sprout in roads; "5-6 months in things look really rough". Players can remove grass/vines.
- Zombies (option) decompose and get weaker/slower over months. Players desensitize to zombies (panic reduction peaks ~5 months).
- Seasons: spring = abundant foraging/fishing/trapping; winter = no foraging/farming, short days, deadly cold.
- World option: no car wrecks on roads; most roads mostly empty with occasional wrecks/pileups.
### R13 (on or before 14 Oct 2026) Foraging (pzfans foraging guide, build42guide foraging, gamerempire, bamboogaming DB)
- Search Mode (End key / radial): screen blurs except target radius; icons/eyeball appear on outdoor tiles in vision. Radius = 3 + 0.7*skill (3..10), aim x1.33, sneak x1.10, cap 15 with trait/profession bonuses; head/face coverings can cut radius up to 75%; sprinting cancels; darkness & rain cut yields.
- Focus categories unlock: firewood & stones 0, berries & mushrooms 0-3, insects/wild herbs/wild plants/trash 4, animals/crops 5, medicinal plants 6, fruits 7.
- Zones: Deep Forest (firewood weight 150, medicinal plants after rain), Forest (berries 30, mushrooms 30), Organic/Birch/PH/PR forests, Vegetation, Farm Land (fruits 25), Town Zone, Trailer Park, roads. B42: 1,678 forageables, 25 categories, 12 zone tables; clay, flint, dogbane, limestone feed crafting.
- Poison: generic berries base 5% poison, reduced per Foraging level; some always safe/always poisonous; Herbalist/Park Ranger identify. Winter (Dec-Feb): most food forage unfindable, firewood remains (+50% in fall).
### R14 (on or before 14 Oct 2026) Architecture (knoxplanning.org styles, Roanoke ranch guide, architecturaldesigns KY plans, gamerant, pzfans Riverside/West Point POI, supercraft West Point, Steam)
- Ranch (most common 1945-93): one storey, LOW-PITCHED roof (gable or hip), broad facade, porch roof supports, decorative shutters, attached garage or carport, brick veneer lower + siding upper or all brick, wide low chimney, earth tones, ivory trim.
- Farmhouse: white siding, gabled roof (often metal), full-width front porch with columns, 2 storeys. Craftsman: gables, porch columns. Colonial/2-storey suburban: symmetrical facade, shutters, attached garage. Prairie: low hip roof, extended eaves.
- PZ: West Point = dense downtown main street (Knox Bank, furniture shop, bookstore with APARTMENTS ABOVE as best safehouse, police, gun store, GigaMart), school campus west, industrial/storage SE edge, lake houses with garages, gardens, fences & shrubs.
- Riverside: commercial strip (Gigamart, clothes store next to furniture store, toy store, bookstore, shoe store "High Street Heels"), several restaurants (Spiffo's fast food, Joe's Grill, Sweet Pea, Beef Roundup), bar off the strip, multi-storey motel, police block with cells, big school, storage units + factory/warehouse SW, wrecking yard, ranger station, fire tower, country club.
- New towns: trailer park at edge, chicken restaurant, construction site, storage unit yard with registration office, mall with garage, clothes store, food court, Gigamart.
### R15 (14 Oct 2026) Firearms (pzfans best firearms 42.19, bisecthosting gun guide, vaagame B42 guns, build42guide combat, projectzomboid.wiki aiming)
- M9 pistol: 15x 9mm, dmg 0.6-1.0, noise 100. M1911 .45 noise 70, can jam. M36 revolver .38: quietest (30), cannot jam, slow reload (no magazine). D-E .44 noise 70-80. Shotgun JS-2000: 9 pellets, hits up to 9 targets, high hit chance, noise 200. Rifles (M1A, MSR788) range 40, dmg 1.2-2.0, piercing; M16 can hit 2. Two-handed long guns. Jamming (worse with condition), panic/stress hurt accuracy, Aiming & Reloading skills; B42 reticle with head/limb hits.
- Loot: gun stores (civilian pistols, shotguns, hunting rifles, ammo, mags; locked, storage rooms), police (pistols, shotguns, some rifles), military (M16, 5.56), hunting vehicles/lodges, army surplus stores, shooting range, prisons.
### R16 (14 Oct 2026) Vehicle mechanics (pzwiki Mechanics, Steam mechanics guide, pzfans, vaagame, xgamingserver)
- Mechanics UI at the hood (E). Standard car parts by level: L0 battery/headlights/radio (screwdriver), L1 tires (jack + lug wrench), L3 brakes & suspension (jack + wrench, tire off first), hood, trunk lid, windows, L4 engine repair (spare engine parts; salvaging sets engine 0%, needs >=10%) & doors, L5 muffler, windshields, gas tank.
- Battery charge (needed to start, lights drain) separate from condition. Bad muffler = louder. Low brakes = longer stops. Worn tires blow out. ~25 parts at L10 rebuild engine 0->100. Failed actions give 1 XP.
### R17 (14 Oct 2026) Landmarks (bisecthosting Valley Station, pzfans Louisville)
- Valley Station: Crossroads Mall (defining landmark), cinema "Star-E-Plex", shooting range, hunting lodge. Louisville: Grand Ohio Mall, 3 gun stores with storage areas, 2 army surplus stores, VHS stores. Gun shops are locked (entry methods matter).
### R18 (14 Oct 2026) Stealth detail (Steam stealth threads, traits guides: bisecthosting, Steam traits guide, mejoress)
- Zombie sight ~18-19 tiles default, vision cone ~ player LoS; closer to edge of range = less likely to spot; approach from behind/angle.
- Crouch (sneak) matters most; in cone while standing = almost always seen. Lying/sleeping zombies perceptive differently; feeding zombies oblivious.
- Inconspicuous: 50% spotting chance. Conspicuous: 200%. Graceful: 60% footstep radius. Clumsy: 120% footstep radius. Keen Hearing/Hard of Hearing/Deaf.
- B42: sneaking behind fences and cars gives cover. Zombies hear light switches. Breaking line of sight + turning corners loses them; follow distance limited.
- Sneaking XP only while sneaking near zombies undetected; Lightfooted from moving near zombies undetected. Zombies vary in perception. Music cue when spotted.
### R19 (14 Oct 2026) B42 crafting (pzfans metalworking, pype.org, guides-factory, build42guide recipes, bamboogaming, projectzomboid.wiki forging, gamemetahub)
- Crafting skills 42.20: Blacksmithing, Carpentry, Carving, Cooking, Electrical, Glassmaking, Knapping, Masonry, Mechanics, Pottery, Tailoring, Welding.
- Surfaces/stations: table/countertop (assembly, cooking prep, tailoring, first aid), workbench (adv carpentry, mechanics, electronics), forge (+anvil), furnace, pottery wheel + kiln, charcoal burning pile (shovel), grindstone (planks 4, nails 4, stone wheel; sharpens blades), butcher's table, drying rack.
- Magazines UNLOCK recipes; skill books only multiply XP. Some recipes auto-learn at skill level. Recipes searchable, batch craft, selectable inputs, nearby materials.
- Knapping: L1 stone blade + stone chisel, L3 flint saw, L4 large stone axe head, L5 stone drill + maul head, L6 long stone blade. Flint flakes.
- Primitive furnace: clay 6 + stone 4 + concrete; primitive forge: stone 10 + stone anvil (Masonry 2, from large stone) + concrete; primitive kiln: clay 20 + mason's trowel (kept). Clay dug from riverbanks with shovel. Charcoal from logs in burning pile.
- Smithing: forge iron bands from scrap at primitive forge with tongs + hammer (10 XP), nails, tools; casting needs ceramic crucibles (pottery) and molds.
### R20 (14 Oct 2026) Tailoring (pzfans tailoring guides, vaagame, Steam, setreadygame, blueprintedgaming)
- Needle (wears) + thread (spool ~20 uses) + fabric strip (ripped sheets / denim strips / leather strips). Inspect garment -> Patch Hole (if torn) or Add Padding (if intact); 2 Tailoring XP per sew; patch defence fixed by Tailoring level at sew time; leather best. Tailoring 8+: full restore with matching fabric (hole disappears). Scissors or sharp knife cut denim/leather clothes into strips. Tailoring 1: Pick Thread (strip -> 1-use thread).
### R21 (14 Oct 2026) Trapping (pzfans trap guides 42.19, gamerempire, Steam)
- Catch roll: rand 0-99 < trap weight + bait weight + Trapping*1.5; zone factor (deep forest 15, forest 12, vegetation 10, town 2). Rabbits/squirrels 19:00-05:00; birds/mice any time. Traps: snare (plank + 2 twine, keep saw; Trapping 1), stick trap (4 sticks + twine, Trapping 2, birds; bait worms/bread), box/crate trap (Carpentry 1 + Trapping 2), cage trap (5 wire, keep pliers; Trapping 3; weight 40), mouse trap. Bait: carrots 45, cabbage/lettuce 40, apple/corn/potato/tomato 35. Traps can break each hour deployed; staying near = bait eaten, no catch. Pot of water + 3 rabbit + veg = stew ~1.5 days.
### R22 (14-15 Oct 2026) PZ sandbox defaults (xgamingserver sandbox guide, winternode B42 settings, pzfans beginner guide 42.20.4 + server settings 42.19, low.ms, zerosrp)
- Apocalypse: Zombie Count Normal = population multiplier 0.65; start 1.0 -> peak 1.5 on day 28; respawn NONE in B42 Apocalypse (B41 default 72h/16h unseen/0.1). Multi Hit OFF, Drag Down ON, Zombie Lunge (fence/window grab) ON.
- Speed default Shamblers; Strength/Toughness Normal; Transmission Blood+Saliva; Cognition Navigate (path around obstacles, can't open doors); Memory Normal; Sight Normal; Hearing Normal.
- FollowSoundDistance 100 (how far they walk toward a heard sound), RallyGroupSize 20, RedistributeHours 12, ThumpOnConstruction true. Day length 1 hour (Apocalypse). Loot categories ~0.6-0.8 (Rare-ish).
### R23 (14-15 Oct 2026) Zombie navigation (Steam threads, zomboidpro, pzfans knock tactics, projectzomboid.wiki)
- B40: straight beeline to noise, sieging walls in the way. B41/42 Navigate: path around buildings to the exact noise spot (players even complain it's too precise); thump doors/windows/obstacles in path; Navigate+Use Doors opens doors. Memory ~6 s after losing you (player report). Sound passes through walls. Light itself not heard; light switch makes noise; lit rooms visible through windows. Rain masks movement slightly.
### R24 (14-15 Oct 2026) Animals B42 (pzfans wildlife 42.19, itemlevel, guides-factory husbandry, pzguide, bamboogaming, lastsaveprotocol, lootlore, projectzomboid.wiki hunting)
- Species: cow/bull, sheep/ram, pig/boar, chicken/rooster, turkey, rabbit, deer (always wild), raccoon, mice/rats. 10 species groups, 30 sex/life-stage records.
- Skills: Animal Care (living), Tracking (search mode: footprints, droppings, eat/rest signs), Butchering (corpses; butcher hook = full yield + leather; ground = less meat, no leather; hook needs Carpentry 3).
- Products: eggs (hutch), milk (cows/ewes only after giving birth), wool (shears), dung (compost), meat, leather, feathers, blood. Feed: troughs (hay, grass, veg), water trough. Rope to lead, trailers.
- Zombies do NOT attack animals by default; animal noise attracts zombies. Stress from zombies, engines, gunfire, crowding, slaughter in sight. Meta predator event (off by default) takes chickens at night.
- Deer: forest clearings + rural fields, alert and fast, hear you first. Farm pens around the map already hold cows, sheep, pigs, chickens.
### R25 (14-15 Oct 2026) Crop disease B42 (xgamingserver farming, pzfans sprays 42.19, build42guide farming, guides-factory, servers4gamers)
- Four: mildew (slows growth; more likely when dry, weedy, cursed), pest flies (more water loss), aphids (less yield; needs >~10C; underwatering reduces), slugs (less yield; slug repellent loot-only).
- Roll at each new growth phase: 2% base, halved by bonus yield, doubled by weeds/curse. Untreated levels rise every 2 h; at 60+ crop dies at next phase. Spreads to adjacent untreated crops.
- Cures: empty gardening spray can + milk (mildew) / tobacco or cigarettes (flies) / water + rubbing alcohol (aphids); 10 uses; learned via Farmer job, Gardener trait, Kentucky Farmer magazine, or Farming 6.
- Weeds raise disease risk + water loss; compost once helps; fertiliser 1st helps, 2nd hurts, 3rd curses. Seasonal sow windows (planting outside = cursed).
### R26 (14-15 Oct 2026) B42 features / B43 (primagames, pzwiki build 42, supercraft roadmap, g-portal)
- B42: basements, bunkers, panic rooms, sewers/tunnels; up to 32 floors; lighting overhaul (light bounces, leaks); crafting overhaul; brewing, pottery, metalworking; animals; fluid mixing; cleaning system; sit on furniture from all sides; seasonal crops; new clothing (SWAT, football); new POIs. B43: NPCs (planned).

### R27 (15 Oct 2026) Zombies at doors and windows, memory (Steam threads, zomboidpro, pzfans knock tactics)
- One zombie needs about 10 to 15 seconds for an unbarricaded window. A standard wooden house door can take one zombie around five minutes; a crowd is much faster.
- Once a zombie starts thumping a door it keeps going until the door breaks or another stimulus draws it away. If a zombie loses sight of you and a door is in the way, it attacks the door.
- Players report zombies losing track of you after about 6 seconds without sight.
- Build 40 zombies beelined in straight lines and besieged walls; Build 41/42 "Navigate" zombies path around obstacles but can't open doors.
- Whether curtains can be opened from outside in the original could not be confirmed.
- Used for: v1.8 (sieges, strength, memory, curtains).

### R28 (16 Oct 2026) Sandbox population and loot categories (xgamingserver sandbox guide, pzfans server tuning, guildorder sandbox options)
- Population is set by a start multiplier, a peak multiplier and the day the peak is reached (default around day 28).
- Loot rarity is set per category: fresh food, canned food, melee weapons, ranged weapons, ammo, medical, survival essentials, mechanics, literature, and other.
- Used for: v1.9 (preset ladder, Sandbox, population growth, per-category loot).

### R29 (16 Oct 2026) Building interiors (Steam workshop map changelogs, Steam discussions)
- Map makers for the original treat empty buildings and blank room definitions as bugs to fix, and add light fixtures to every building.
- Players dislike furniture packed so tight it blocks movement: interiors should be filled but walkable.
- Used for: v1.10 (interior fill pass, tidy pass).

### R30 (16 Oct 2026) B42 lighting and atmosphere (projectzomboid.com 42.20 features overview, 42 Techdoid blog, Steam dev news "light propagation", thegamer, games.gg, projectzomboid.wiki lighting guide, bisecthosting 42.20 notes)
- B41: one ambient light level by time of day, slightly reduced indoors; lights only lit their own room. B42: light propagates from bulbs and the sun across tiles (bounced light), leaks through windows, doors and gaps; rooms without windows are dark at noon; interiors lighten and darken with exposure; the sunset glow creeps through windows in a red tint and dims; opening a door to a lit room spills light into the corridor; the door glow reflects on a character's back.
- 1990s bulbs: warm streetlights and exterior lights. Nights darker, blacker, higher contrast between lit and dark; light bleeds through curtains from inside; wall switches show when lights are on.
- Coming from daylight into darkness you can't see crawlers immediately (eye adaptation). Zombies emerging from dark areas are harder to see.
- Not photorealistic: keeps its isometric top-down identity. Ragdolls when hit by cars, gunfire, explosions (42.20). Mods add rain shafts on the horizon, snow on roofs, filmic tone curves.
### R31 (16 Oct 2026) Ambience and sound design (Steam discussions on PZ meta events and the ambient sound update, gamegeeker review, H1Z1 audio blog, Cataclysm DDA ambient sounds thread, ambience libraries)
- PZ meta events: distant screams and dogs barking (do NOT attract zombies), gunshots, helicopters (DO attract hordes). Players praise the ambient shift between outdoors and indoors; zoom should not change sound volume.
- In PZ the sound design is load-bearing (sound attracts zombies), and the dynamic soundtrack builds dread.
- Good survival ambience: birds by day, crickets / owls / distant animals at night, weather beds, muffled indoors, underground beds (distant thumps), forest crunch underfoot, water laps and frogs near water, wind in foliage, flies, mechanical hums in towns.
### R32 (16 Oct 2026) 2D / isometric lighting techniques (frankforce 2D light mapping, gamedev.net isometric lighting articles, Game Developer "dynamic 2D character lighting", itch.io day/night projection devlog, Unity day-cycle lightmap discussion)
- Draw lights into a separate light map (gradient blobs in the light's colour), soften, then multiply (or add) it over the scene; colored lights fall out of this naturally; render the light map at half or quarter resolution for speed.
- Shadows belong between the background and the sprites, lights over everything. Entity shadows rotate and stretch with the sun's position through the day; buildings block light indoors.
- Day cycles can blend between a few baked looks (sunrise, midday, sunset) instead of fully real-time shadows.
- Used for: v1.12 (lighting, atmosphere and ambience pass).

---

## 2. Research Addendum (written 14 Oct 2026)

### Research Addendum: Gaps, Accuracy Audit and Roadmap

*Companion to Zomboid_Recreation_Blueprint.md. Written 13 October 2026 against Project Zomboid Build 42.20.*

This addendum does three things. It records new research on parts of the original game that the first blueprint skipped or only touched on. It audits every system currently in Dead Quiet against the original, so we know what is accurate, what is simplified and what is missing. And it sets out a prioritised roadmap with enough detail to build each item.

---

## 1. What the first blueprint missed

Reviewing the blueprint against what we have now built, these areas were thin or absent:

- Starting kits and what occupations really give you
- Car keys, hotwiring rules, gloveboxes and gas pumps
- Buildings beyond houses and shops, and the Build 42 underground (basements, bunkers, panic rooms)
- Clothing as a full system: insulation, wind, water and wetness
- Generators in detail
- Camera and zoom behaviour
- Saving a world that keeps growing

---

## 2. New research findings

### 2.1 Occupations and starting kits

- There are no classes in the original. Every character can learn every skill. The occupation sets starting skill levels and sometimes known recipes, and traits adjust costs and abilities.
- Occupations cost between 0 and 10 points depending on how strong they are, which pushes players to take negative traits.
- Starting items are not tied to jobs. The sandbox has an optional "starter kit" setting, and kits and job recipes keep changing between Build 42 updates.
- Examples from Build 42: carpenter gets +3 Carpentry; fire officer gets +2 Strength, +1 Fitness and axe proficiency; burglar gets Nimble, Sneaking and the ability to hotwire; veteran gets Aiming, Reloading and the Desensitized trait; nurse and doctor get First Aid.

**What this means for us:** a nurse spawning with no medkit is accurate to the original. We added per-job kits anyway because you asked for them, so treat them like the original's starter kit option. A future "Starter kits on/off" sandbox toggle would match the original exactly.

### 2.2 Vehicles

- **Keys:** each key works with exactly one car. Players most often find keys in the glovebox or already in the ignition. Others turn up on nearby zombie bodies, in nearby houses or on the ground beside the car.
- **Hotwiring:** this needs Electrical 1 and Mechanics 2, or the Burglar occupation. Burglars get the ability without those skill levels.
- **Hotwire success:** the success roll is driven by Electrical skill and engine quality. The attempt takes longer at low Electrical skill and can fail.
- **Car alarms:** hotwiring has a small chance to set off the car alarm, and higher Electrical lowers that chance.
- **Refuelling:** you can refuel from a gas pump or a gas can. Pumps stop working when the power goes, unless a generator powers the station.
- **Mechanics:** the numbered Mechanics books only speed up XP. The magazines are what teach you how to work on specific vehicle types.
- **Towing:** any car can be towed by another car.

### 2.3 Buildings, the underground and borderless maps

- **Endless wilderness:** Build 42 added borderless exploration beyond the premade map, with random wilderness generation.
- **Height limits lifted:** the map's height limits were removed, which allows basements and very tall buildings.
- **Basements and bunkers:** Build 42 brought procedural basements under houses, Cold War bunkers and panic rooms.
- **Fixed basements:** not every basement is random. Some unique buildings (police stations and others) have fixed basements built into the map.
- **Seeds:** map seeds mostly affect basements. They don't control everything; for example, the scattered "car stories" around the map are still random.
- **Real building types the original uses:** hospitals and medical clinics, schools, police and fire stations, gas stations, motels, churches, warehouses, malls, offices, apartment blocks, trailer parks, a prison, a military base, farms, and the Build 42 high-rises in the city.

### 2.4 Clothing, wetness and temperature

- **Clothing stats:** each item has insulation, wind resistance and water resistance for the body slots it covers. The game totals these across head, torso, hands, legs and feet.
- **Wetness stages:** damp at 15% total body wetness, wet at 40%, soaking at 70% and drenched at 90%. Rain, sweat and exertion all make you wet.
- **Wet clothes lose insulation.** Being wet also raises the risk of catching a cold.
- **Wind chill:** low temperature, high wind and wet clothing together are the fastest route to hypothermia.
- **Hypothermia** progresses through stages. It starts as discomfort, then stops natural healing and raises the cold risk, then slows walking and combat, and finally damages health.
- **Overheating:** heavy outfits cause overheating and faster tiring in warm weather.
- **Winter** brings shorter days, no outdoor farming and new cold, windchill and hypothermia status icons. Snow doesn't fill rain collectors, and sneezing from a cold attracts zombies.

### 2.5 Generators

- **Learning:** you must learn generators first, from a magazine, from the Electrician or Engineer occupation, or by reaching Electrical 3, which teaches it automatically.
- **Range:** 20 tiles horizontally. Build 41 reached 2 floors up and 2 down; Build 42's default is 3 floors up and 3 down.
- **Noise:** 20 to 25 tiles depending on the model, and walls or roofs don't silence it.
- **Fuel:** Build 41 burned about 11% of a tank per day even with nothing plugged in. Build 42 uses a sandbox fuel rate multiplied by the number of devices powered.
- **Repairs:** each piece of electrical scrap restores 4% plus half your Electrical level.
- **Danger:** running a generator indoors fills the building with carbon monoxide and kills you.
- **Gas stations:** a generator connected to a gas station makes its pumps work again, which is the long-term fuel solution.

---

## 3. Accuracy audit of what we have built

| System | Original | Dead Quiet now | Verdict |
|---|---|---|---|
| Occupations | Skills, traits, recipes. Kits are a sandbox option | 7 jobs with skills and starter kits. Mechanic added this round | Close. Add a kits on/off toggle and more jobs |
| Hotwiring | Electrical 1 + Mechanics 2, or Burglar. Can fail | Same rule, Electrical skill added, success chance from Electrical | Accurate. Car alarm chance still missing |
| Car keys | Ignition, glovebox, ground, bodies, houses | Ignition, glovebox, ground, nearby house containers | Accurate. Keys on zombie bodies still missing |
| Gas pumps | Need power, or a generator after shutoff | Need power. Fill cans or refuel a car nearby | Accurate until generators exist |
| Map | Handmade county plus random wilderness and seeded basements | Fully procedural endless county, seeded and streamed in 128 tile regions | Different by design. Plays the same way |
| Building variety | Many unique building types | Houses, 3 shop types, hospital, school, police, church, apartments, office, motel, warehouse, gas station, trailer park, farm, cabin, bunker, army checkpoint | Good. Missing fire station, mall, prison, military base |
| Underground | Real lower floors | Bunkers are grass-covered surface buildings that are always dark inside | Simplified. Needs a multi-floor system |
| Tall buildings | Floors up to 32 high | Single storey only | Missing. Needs a multi-floor system |
| Clothing and temperature | Full layered system | Not built | Missing. High priority |
| Generators | Full system | Not built | Missing. High priority |
| Zoom | Discrete zoom steps | Discrete steps with smooth animation, a cache per step and work spread across frames | Accurate and now smooth |
| Saving | Saves the whole world | Stores only what changed and rebuilds the rest from the seed | Better suited to an endless map |

---

## 4. Roadmap, in priority order

### 4.1 Clothing, wetness and temperature (next)

**Data:**
- Each clothing item gets: slots covered, insulation (0 to 1), wind resistance (0 to 1), water resistance (0 to 1), scratch defence, bite defence, weight and condition.
- About 30 starter items: t-shirt, sweater, hoodie, denim jacket, leather jacket, winter coat, raincoat, jeans, cargo pants, sweatpants, boots, sneakers, gloves, wool hat, scarf, motorbike helmet and so on.

**Body temperature model, every game minute:**
- Target skin temperature = air temperature + insulation bonus − wind chill × (1 − wind resistance) − wetness penalty + exertion heat + nearby heat sources (campfire, powered house).
- Body temperature drifts towards that target slowly.

**Wetness:**
- Rain adds wetness to exposed or non-waterproof slots, scaled by water resistance.
- Sweat adds wetness when you run hot.
- Clothes dry indoors, faster near heat.
- Insulation is multiplied by (1 − 0.7 × wetness).

**Status icons:**
- Wet: 15%, 40%, 70%, 90%.
- Cold and hypothermia, in four stages: discomfort, then no healing, then slower movement and combat, then health damage.
- Hot and hyperthermia, mirroring cold.

**Seasons:** the calendar already exists. Add a temperature curve by month, snow in winter, and shorter days.

**Combat link:** bites and scratches roll against the defence of the clothing on the body part that was hit (we already pick a body part). Holes reduce defence.

**UI:**
- A clothing section in the condition screen showing insulation and protection per body part, using the existing body diagram.
- Dress and undress actions in the inventory.

### 4.2 Generators

- **Getting one:** a generator item that is too heavy to pocket, so you drag it slowly or carry it in a car trunk. It spawns in warehouses, hardware stores and garages.
- **Knowledge:** you must learn it from a "Generators for Dummies" style magazine, the Electrician job, or Electrical 3.
- **Using it:** connect it, add fuel from a gas can, then turn it on.
- **Power:** a 20 tile radius powers lights, fridges, ovens and TVs, and makes gas pumps work.
- **Upkeep:** it burns about 11% of its fuel a day plus a little per powered device, and loses condition over time. Repair it with electrical scrap gained by dismantling radios and TVs, which also trains Electrical.
- **Noise:** a 20 tile sound radius every few seconds.
- **Danger:** running it indoors fills the building with carbon monoxide, causing sickness and then death.

### 4.3 Multi-floor buildings, stairs and real basements

This is the foundation for skyscrapers, basements, bunkers with real ladders, and second floors in houses.

- **Data:** tile arrays gain a level dimension. Start with three levels: −1, 0 and 1, later more.
- **Moving between floors:** stairs and ladders become interactable objects that move you between levels.
- **Rendering:** only the player's level and the levels below it are drawn. Levels above are hidden while indoors, just like roofs are now.
- **Zombies:** they path between floors using stairs.
- **Generation:** procedural basements under some houses (seeded, as in the original), second floors on large houses, 4 to 8 storey apartment and office towers in big towns, and bunkers rebuilt as real underground spaces reached by a hatch.

### 4.4 Smaller accuracy items

- **Car alarms:** a chance to trigger when smashing a car window or hotwiring.
- **Keys on bodies:** zombie corpses near cars sometimes carry that car's key.
- **Electrical skill uses:** dismantle radios, TVs and watches for electrical scrap and XP.
- **Car mechanics screen:** part conditions and swapping parts, gated by Mechanics skill and car-type magazines.
- **Towing** one car with another.
- **Sneezing and coughing:** a cold makes noise and draws zombies.
- **Fire:** campfires and stoves can spread fire if left unattended. Molotovs later.
- **More buildings:** fire station, mall, prison, military base, plus "car stories" (crash sites and police roadblocks) scattered on roads.

### 4.5 Living off the land (from the first blueprint, still to do)

- **Foraging mode:** reveals berries, mushrooms, herbs and branches, scaled by skill, terrain and season.
- **Fishing** in ponds, **trapping** with bait, and wild animals.
- **Farming** with seasons.

---

## 5. What changed in Dead Quiet this round

- **Starter kits for every job,** verified in testing for all seven. The nurse now starts with 3 bandages, disinfectant, painkillers, antibiotics, a needle and tweezers.
- **New Mechanic job,** which can hotwire straight away.
- **Grey floating terrain fixed.** It was a roof image cache that never cleared on zoom, so old roofs were drawn at the wrong size over roads.
- **Smooth zoom:** fixed zoom steps with an eased transition, a cache kept per step, and work spread over several frames. Returning to a zoom level you have used is now instant.
- **Endless procedural world:**
  - **How it streams:** the world is generated in 128 tile regions as you approach them, nearest first, one per frame.
  - **Region types:** towns, villages, civic centres (hospital, school, police and more), countryside (farms, gas stations, trailer parks, churches, army checkpoints) and wilderness (cabins and bunkers).
  - **Joins:** highways join every region seamlessly.
  - **Testing:** travelling 700 tiles generated 15 new regions with no black edge ever coming into view.
- **New buildings:** hospital, school, police station, church, apartment block, office, motel, warehouse, gas station with pumps, trailer park, cabin, bunker and army checkpoint. Each has its own rooms, furniture and loot.
- **Door hotkey:** Q (already in from last round) now has an on-screen prompt when you are near a door, and near a car the prompt tells you to press E.
- **Car keys** in ignitions, gloveboxes, on the ground and in nearby houses. Each key is named after its car's colour.
- **Accurate hotwiring rules,** and gas pumps that refuel cars and gas cans while the power is on.
- **Compact saves:** a save after exploring 27 regions dropped from about 2.5MB to about 360KB.

---

## 6. Sources

Project Zomboid community wiki (pzwiki.net) pages on cars and generators; guides at pzfans.com, xgamingserver.com, projectzomboid.wiki, build42guide.wiki, supercraft.host and zomboidpro.it.com; PCGamesN coverage of Build 42 map seeds and spawns; and Steam community discussions on car keys, hotwiring and Build 42 map generation. Build 42 details change between patches, so treat exact numbers as tuning starting points.

---

## 3. Research v3 (written 14 Oct 2026)

### Research Round 3: How Project Zomboid Builds Its World

*Third companion to the Recreation Blueprint and the Research Addendum. Written 14 October 2026 against Build 42.20.*

This round covers 13 areas: sound and stealth, zombie density, loot, lighting, map making, towns and houses, difficulty, environmental stories, zombie behaviour, multi-floor play, design philosophy, weather and decay, and foraging. Each section gives the findings, then what they mean for Dead Quiet, then where we stand.

---

## 1. Sound and stealth

**Findings**
- **Sneaking (C):** cuts your footstep sound radius to 20% and the chance of being spotted to 40%. The Sneaking skill scales that further, from 120% at level 0 down to 40% at level 10. So a level 10 sneaker makes about 8% of normal footstep noise.
- **Lightfooted:** a separate skill that quietens every footstep, walking or running, from 99% at level 0 to 20% at level 10. Going barefoot is quieter too.
- **Being seen:** an idle zombie needs you inside its sight cone and within about 20 tiles to see you.
- **Combat noise:** a kill or hit alerts zombies 5 to 7 tiles away. In a dense town one fight pulls in "a block in every direction", so stealth is mostly about not fighting, and luring with noise is the strongest tool.
- **Hearing:** zombies walk to where a sound came from, and a newer sound redirects them. Trees visibly shake when a zombie pushes through them.

**For Dead Quiet:** our footstep radii and sneak multiplier follow the same shape. Added this round: a **sound meter** showing how far your noise carries, and sound now travels between floors of a building.

**Still to do:** a separate Lightfooted skill, quieter barefoot movement, and trees rustling as zombies pass.

## 2. Zombie density

**Findings**
- **A heat map from tile types:** Build 42 builds its spawn map automatically from what's on each tile. Military areas get a big radius and multiplier, empty land gets few.
- **Quiet corridors:** a Voronoi noise layer then deletes spawns inside "cracks", creating quiet routes between hotspots. It varies by seed.
- **Indoors:** zombies inside buildings are handled separately from the outdoor map.
- **Scale:** a small town like Rosewood holds around 500 zombies, bunched at the police station, fire station and school. Bigger towns hold 1,000 to 5,000.
- **Layout:** industrial zones sit on town outskirts.

**For Dead Quiet:** regions already spawn by type (town 260, civic 200, village 110, countryside 45, wilderness 22), with extra in hospitals and police stations. Zombies inside buildings now dress for where they died.

**Still to do:** the Voronoi corridor layer, which would make sneaking through towns more interesting.

## 3. Loot and how it feeds crafting

**Findings**
- **How loot is chosen:** room type, then furniture type, then a loot list. Build 42 has 381 room types, 1,563 room and container pairs, about 1,400 loot lists and 3,223 items.
- **Rolls and chances:** each list rolls several times, and each entry's chance is scaled by the loot setting for its category and by how many zombies are nearby.
- **Junk:** containers are padded with junk. Kitchen cabinets hold plates and cutlery, bathroom cabinets hold razors, hair gel and rubber ducks. That dilutes the good rolls and makes finds feel real.
- **First look:** containers only fill when first seen. Food spawns at a believable age, and stashes are paired with hand-marked maps.

**For Dead Quiet:** we use the same room, container and list pipeline. This round added about 20 new lists (sports store, liquor store, video store, library, fire lockers, bank vault, post office, workshop, dumpsters, trash cans, mailboxes and police, ambulance and army trunks).

**Still to do:** junk filler items, loot scaled by nearby zombie count, and stash maps.

## 4. Lighting and atmosphere

**Findings**
- **Bounced light:** in Build 42 light bounces off walls and leaks through windows and doors.
- **Darkness indoors:** a room with no windows is dark even at noon.
- **Sunset:** the sunset glow comes in through windows with a red tint and slowly retreats.
- **Warm 1990s lighting:** streetlights and porch lights use warm 1990s bulbs, and businesses have neon. All of it dies with the power.
- **Nights:** nearly black outside.
- **Light sources:** flashlights (wide or narrow beam), craftable torches, candles and lanterns.

**For Dead Quiet:** added warm street lamps, porch lights, neon on bars, diners, video and liquor stores and the motel, and glowing traffic lights. All of these need power. Mornings are now tinted warm, evenings orange and nights blue, and windowless bunkers stay dark. A morning fog weather type was also added.

**Still to do:** light coming in through windows, and torches and candles.

## 5. How the map is made

**Findings**
- **Cells:** maps are built in cells, 300 by 300 tiles in Build 41 and 256 by 256 in Build 42.
- **Three images per cell:**
  - a ground image (three grass shades, dark asphalt main roads, light asphalt side roads, dirt, gravel, sand and water)
  - a vegetation image (dense forest, trees, stray trees, bushes, grass)
  - a greyscale zombie density image
- **Rules:** a rules file converts colours into tiles and blends the edges between them.
- **Buildings:** each one is hand-built as a "lot" with named rooms, placed on top of the ground.
- **Detail sets:** street decoration, road signs, trash containers, grime, traffic lines and curbs, fences with posts and gates, hedges, power lines, rooftop air-conditioning units, wall vines and posters.

**For Dead Quiet:** we generate the equivalent procedurally in 128-tile regions. This round added:
- curbs, crosswalks at town crossings, parking lines, manholes, cracks, oil stains, litter, grass tufts and flowers
- sunken water with banks and moving glints
- building shadows
- reeds at the water's edge and rocks in the wild
- utility poles with sagging wires along highways
- billboards, burnt-out wrecks and "Welcome to" signs

**Still to do:** sand and gravel ground types, blended edges between ground types, and vines on walls.

## 6. Towns and house types

**Findings**
- **Muldraugh:** 342 buildings, of which 40 (about 12%) are special.
- **Its districts:** small houses, two lower-class trailer parks, fenced gated communities, a motel, a diner, a clinic, a church, auto repair, a lumberyard, and a police station with a basement.
- **West Point:** many two-storey houses with garages, plus a gun store, supermarket, two gas stations, storage units and warehouses.
- **Other towns:** they add a cinema, apartment blocks, a bookstore, a video store, a bank, a two-storey fire station, apartments above shops, and a bar on the first floor reached by stairs.
- **Big cities:** Louisville has mansions behind high fences, malls and high-rises.

**For Dead Quiet:** towns now follow a plan instead of random rolls:
- a main street of six small businesses (diner, bar, bookstore, clothing, sports, liquor, video, laundromat, bank, corner store, post office, pharmacy, hardware)
- one or more civic buildings (police, fire station, school, clinic, library, church, hospital, post office)
- a special lot (gas station, motel, auto repair, warehouse, apartments, office, storage units, park, bank)
- houses in the remaining blocks

There are now 31 building types, each with its own wall material, a named sign, rooftop details and a sensible height. Houses get porch lights, mailboxes, flower beds, bushes, and picket or wooden fences. Some blocks hold a big two-storey home with hedges.

**Still to do:** garages, gated communities, a gun store, a cinema and a mall.

## 7. Difficulty

**Findings**
- **Apocalypse (canon):** normal population (0.65), rising from 1x to 1.5x by day 28. No respawning, no multi-hit, deadly attacks from behind, groups can drag you down, no minimap, scarce loot and no starter kit.
- **Outbreak:** the same danger with more loot and XP.
- **Rising:** low population, weak zombies, a starter kit, and respawning.
- **Extinction:** high population, rising from 1.5x to 2x, with sprinters.
- **Six Months Later:** an "Insane" population of 2.5x in an already decayed world.
- **When respawning is on:** zombies return every 72 hours, at up to 10% of the population, once an area has gone unseen for 16 hours.

**Still to do:** difficulty presets on the title screen. Population, loot, respawn, sprinters and the starter kit would all map onto existing settings.

## 8. Environmental stories

**Findings**
- **Five types:** building, vehicle, zone, survivor and table stories.
- **Building stories:** burnt houses, barricaded safehouses (more zombies inside, better loot, sometimes a stash map), house parties, poker nights, police sieges and trashed homes.
- **Vehicle stories:** crashes, flipped cars, ambulance crashes, police blockades, a tire change abandoned halfway, roadworks.
- **Zone stories:** fishing trips by water, forest camps, barbecues, hunters' camps.
- **Dressed for where they died:** police in the police station, firefighters, chefs, doctors, a bride and groom at the church.

**For Dead Quiet:** done so far are outfits (police with caps, firefighters with helmets, doctors and nurses, chefs, workers in hard hats, office workers, church goers, students, soldiers) and liveried vehicles outside buildings. Police cars, ambulances, fire trucks and school buses each carry matching trunk loot. Burnt-out wrecks sit on highways and army checkpoints on rural roads.

**Still to do:** a full story system, starting with barricaded safehouses, burnt houses, crash sites and forest camps.

## 9. Zombie behaviour

**Findings**
- **Fences:** zombies tumble over low fences and spend about 4 seconds on the ground, a window to stomp them or escape. They can lunge as they get up unless you shove them mid-climb.
- **Windows:** they fall through windows.
- **Groups:** a crowd can drag you down for an instant death.
- **Attacks from behind:** far more dangerous than attacks from the front.
- **Idle zombies:** they feed on fresh bodies and lean against walls.
- **Wear and injury:** blood and dirt build up on clothes over time, and injured characters limp.

**For Dead Quiet:** added fences you hop with E (wooden fences take longer and can make you slip). Zombies tumble over fences and lunge as they get up. Zombies now fall over and get back up, and killed zombies fall to the ground rather than vanishing into a lying pose. Idle zombies feed on fresh corpses.

**Still to do:** drag-downs, leaning against walls, and progressive blood and dirt.

## 10. Multiple floors

**Findings**
- **The safest bases:** upper floors.
- **Stairs:** zombies follow you up if they saw you go, but never wander up on their own.
- **Sheet ropes:** made from a sheet, a nail and a hammer, hung from a window. Zombies can't climb them but can tear them down.
- **Destroying the stairs:** a sledgehammer seals off the upper floors.
- **Jumping:** jumping from an upper floor risks broken legs.

**For Dead Quiet, built this round:**
- **Heights:** buildings are now 1 to 7 storeys. Offices reach 7, apartments 2 to 4, hospitals 2 to 3, and some houses 2. Warehouses and churches are taller single storeys.
- **Stairs and floors:** stairs connect the floors, and upper floors are generated the first time you climb. They get their own rooms, furniture, loot and zombies.
- **Following:** zombies only follow you upstairs if they were chasing you, and they can't see through floors.
- **Sound:** noise carries between floors at reduced range.
- **Saving:** saves keep every visited floor.
- **The view:** from upstairs the street is visible below.

**Still to do:** sheet ropes, destroying stairs, broken legs from jumping, and basements (the same system can go downward).

## 11. Design philosophy

The game opens with "These are the end-times. There was no hope of survival. This is how you died." There's no "New Game" button, because new implies hope. It isn't a power fantasy. Your character stays fragile, and small mistakes chain together. Wet clothes lead to a cold, sneezing makes noise and zombies follow. Fancy houses have alarms, expired food poisons you, rotting corpses make you sick, and exercise strains muscles. Moving things takes real time. After the power and water fail you're forced to hoard and become self-sufficient, and the boredom of the mid-game is deliberate.

**For Dead Quiet:** our framing, permadeath and shutoffs already follow this.

**Still to do:** colds, corpse sickness and muscle strain.

## 12. Weather, seasons and decay

**Findings**
- **Climate:** Kentucky's humid climate with weather fronts. There's rain, thunderstorms (thunder attracts zombies), tropical storms, wind you can see in the trees, fog on cold mornings that cuts visibility outdoors only, and snow.
- **Rainwater:** in Build 42, rain collectors give tainted water.
- **Decay:** over the months grass creeps onto roads, vines cover walls and windows, walls crack and saplings sprout in the road; five or six months in it all looks rough.
- **Getting used to it:** panic resistance builds up over about five months.

**For Dead Quiet:** added morning fog. It halves zombie sight range and veils the screen outdoors.

**Still to do:** seasons, snow, thunder, decay over time, and getting used to the dead.

## 13. Foraging

**Findings**
- **Search radius:** 3 tiles plus 0.7 per skill level (up to 10), with bonuses for aiming and sneaking. Rain, darkness and covered faces reduce it.
- **Categories by level:** firewood and stones at 0, berries and mushrooms early, insects, herbs and trash at 4, animals at 5, medicinal plants at 6 and fruit at 7.
- **Where things grow:** forest types, farmland and town zones each have their own weights.
- **Poison:** berries have a 5% poison chance that drops with skill.
- **Winter:** almost no food can be foraged.

**Still to do:** foraging. Our terrain already marks forest, farmland and towns, so it slots in cleanly.

---

## Priorities for the next rounds

1. **Clothing, wetness and temperature** (spec in the Research Addendum).
2. **Sheet ropes, destroying stairs and basements:** these complete the floors system.
3. **Generators**, which can also relight nearby street lamps and power gas pumps.
4. **Environmental stories:** barricaded safehouses, burnt houses, crash sites and camps.
5. **Foraging, then seasons and decay.**
6. **Difficulty presets on the title screen.**

## Sources

The Project Zomboid community wiki (pzwiki.net) pages on Sneaking, Procedural distributions, Mapping, TileZed, Muldraugh, Weather, Zombie, Randomized stories, Building stories, Zone stories, Vehicle stories and Survivor. Official posts on projectzomboid.com (Build 42.20 features overview, 42 Techdoid, Build 41 release notes and build history). Guides on pzfans.com, build42guide.wiki, projectzomboid.wiki, supercraft.host, playerecho.com, winternode.com, walawala.gg, guides-factory.com and notesread.com. The Indie Stone forums, Steam community discussions, the Knoxify project, and essays on Medium, Hypercritic, TV Tropes, MCV/Develop and Jump Dash Roll. Build 42 numbers change between patches, so treat them as starting points.
