# Day After Dawn: Future Plans

> **About this project:** Day After Dawn is an independent, non-commercial fan project inspired by *Project Zomboid*. All of its code, art, names and text are original. It is not affiliated with or endorsed by The Indie Stone, who own Project Zomboid. Mentions of Project Zomboid in this document are research and commentary.

*Every goal, idea, want, need and question you have raised since the project began on 12 Oct 2026, in the order you raised them. Each one is ticked off against the patch that dealt with it, so a reviewer can see when an idea was made and when it was resolved. Detailed plans for everything still open follow. Written 16 Oct 2026, current version 1.10.2.*

**How this was built:**
- **Sources:** your messages before v1.5 were read word for word from the saved conversation logs of 12 to 14 Oct. Later ones come from this conversation.
- **Statuses:** checked against the Changelog.
- **Dates:**
  - **Before v1.5:** exact, from the logs (UTC).
  - **From v1.5 on:** from file timestamps, so they may be off by a day around midnight.

**Legend:** ✅ done · 🟡 partly done or ongoing · ⬜ open · 💬 a question, answered · 📌 a standing rule you set

---

## 1. Your end goals

| # | Goal | First raised | Status | Where it stands |
|---|---|---|---|---|
| G1 | Recreate Project Zomboid's exact gameplay and core concept, with no copyrighted content, single-player, running in a browser | 12 Oct 23:28 | 🟡 | The core loop and nearly every major system are in (v1.0 to v1.10). The remaining gaps are in section 5 |
| G2 | Then make it your own with tweaks and additions | 12 Oct 23:28 | ✅ ongoing | Renamed Day After Dawn (v1.8), with our own presets and features |
| G3 | A realistic look, not blocky or cartoonish | 13 Oct 00:34, again 14 Oct 14:46 and 14 Oct (v1.6) | 🟡 | v1.0 models and rig, v1.4 neighbourhoods, v1.6 art shift, v1.7 atmosphere, v1.10 interiors, v1.12 lighting pass. Open: light bouncing through doorways (F10), character detail (F15) |
| G4 | Smooth, lag-free play | 13 Oct 23:44 (zoom lag), 14 Oct 18:25 ("top priority"), v1.6 ("no frame drops") | 🟡 | v1.2 zoom cache, v1.4 overhaul, v1.6 caches, v1.7 automatic quality, 1.10.1 light cap. Open: big chases, mall upper floors (F14) |
| G5 | A world with soul: unique towns, distinct buildings, filled interiors | 13 Oct 23:44, 14 Oct 14:46, 14 Oct 18:25, 16 Oct | 🟡 | v1.3 to v1.10. Open: high-rises (F1), more building types and interior variety (F16) |
| G6 | Thorough research and documentation, dated and kept in separate types | 12 Oct 23:28, every patch since, 16 Oct | ✅ ongoing | Research, Recreation Document, Changelog and this Future Plans document |
| G7 | Difficulty true to the original, with harder options, never easier without asking | 15 Oct | ✅ ongoing | v1.8 behaviour, v1.9 preset ladder and Sandbox |
| G8 | Move the project into a Git repo | 16 Oct | ⬜ | Plan in section 7 (F17) |

## 2. Standing rules you set

| Rule | Set |
|---|---|
| 📌 Include anything that would make the game better or more realistic, without hesitation, and report back all changes | 14 Oct 18:25 |
| 📌 Re-read the document and redo research every patch, then double-check | 13 Oct 23:44, repeated most patches |
| 📌 Don't make anything noticeably easier without asking first | 15 Oct (v1.7) |
| 📌 Number mini patches 1.x.x | 16 Oct (1.9.2) |
| 📌 Keep document types separate (research, changelog, recreation document) and date everything | 16 Oct |
| 📌 Respect time-boxed patches (a 24-minute round, then 3 to 5 minute mini patches) | 16 Oct |

## 3. Chronological ledger: everything you asked for

### 12 Oct 2026: the start
| # | Raised | Your request | Status | Dealt with in |
|---|---|---|---|---|
| L1 | 12 Oct 23:28 | Research the game fully (concept, design, components, gameplay, assets, functionality), and write an in-depth document including a complete prompt for recreating it | ✅ | 12 Oct: the Recreation Blueprint (now Part A of the Recreation Document) |
| L2 | 12 Oct 23:28 | Exact gameplay and core concept, no copyrighted content, doesn't need multiplayer or publishing | 🟡 ongoing | All versions (G1) |
| L3 | 12 Oct 23:47 | Recreate a rendition that runs in your browser | ✅ | v1.0 (Dead Quiet) |

### 13 Oct 2026: first feedback
| # | Raised | Your request | Status | Dealt with in |
|---|---|---|---|---|
| L4 | 13 Oct 00:22 | You can't tell what objects are, it's all squares: give them models | ✅ | v1.0 overhaul rounds (furniture models), extended every version since |
| L5 | 13 Oct 00:22 | The running animation and player design should look more realistic | ✅ | v1.0 overhaul (jointed character), v1.6 shading and poses, v1.7 more poses |
| L6 | 13 Oct 00:34 | Move away from the blocky look toward realism | 🟡 ongoing | v1.0, v1.4, v1.6, v1.7, v1.10 (G3) |
| L7 | 13 Oct 00:34 | Menus should be silky smooth (a delay when taking things from a fridge) | ✅ | v1.0 overhaul rounds. The exact change wasn't itemised; a short transfer time remains by design, scaled by weight, as in the original |
| L8 | 13 Oct 00:34 | Closing a door while fleeing says "something is in the way" even when you're through | ✅ | v1.0 overhaul. Q door hotkey and prompt in v1.2 |
| L9 | 13 Oct 00:34 | A Fallout 4 style condition screen: body model showing injured parts, plus hunger, thirst and other meters without clutter | ✅ | v1.1 (condition screen with body diagram) |
| L10 | 13 Oct 10:22 | Combat feedback: you can't tell if a swing hit or missed | ✅ | v1.1 (hit flashes, blood, shake), v1.5 tracers, v1.6 sounds |
| L11 | 13 Oct 10:22 | An inventory overhaul with item icons | ✅ | v1.1 (tabbed inventory, drawn icons) |
| L12 | 13 Oct 10:22 | The map is too small: random procedural generation | ✅ | v1.1 (county generator), v1.2 (endless world) |
| L13 | 13 Oct 10:22 | A pause menu to quit and resume | ✅ | v1.1 |
| L14 | 13 Oct 10:22 | Crafting and vehicles, as in the original | ✅ | v1.1 (first versions), v1.5 (car repair), v1.6 (full crafting) |
| L15 | 13 Oct 10:22 | Save files | ✅ | v1.1 (3 slots, autosave, export and import) |
| L16 | 13 Oct 23:44 | The nurse doesn't spawn with a medkit: verify every job's kit | ✅ | v1.2 (starter kits); re-audited in 1.10.2, all 10 jobs correct |
| L17 | 13 Oct 23:44 | Weird grey ungenerated terrain you walk under | ✅ | v1.2 (the endless world removed the map edge; the exact cause wasn't recorded in the logs) |
| L18 | 13 Oct 23:44 | Laggy zooming | ✅ | v1.2 (a cache per zoom level) |
| L19 | 13 Oct 23:44 | Generate new terrain as you approach the border, seamless and not laggy (a lower render distance is fine) | ✅ | v1.2 (endless regions), v1.4 (generated a little each frame) |
| L20 | 13 Oct 23:44 | More unique structures: hospitals, schools, skyscrapers(?), underground bunkers | ✅ | Hospitals, schools and bunkers in v1.2; high-rises of 9 to 14 floors in 1.11 |
| L21 | 13 Oct 23:44 | A door hotkey | ✅ | v1.2 (Q) |
| L22 | 13 Oct 23:44 | Review the research document, research everything not yet covered, and polish existing features | ✅ | v1.2 (Research Addendum, 14 Oct) |

### 14 Oct 2026: towns, floors, soul
| # | Raised | Your request | Status | Dealt with in |
|---|---|---|---|---|
| L23 | 14 Oct 14:46 | Grey formations on the grass: are they mountains? | ✅ | v1.3. They were ponds drawn with the concrete texture; water is now drawn sunken with moving glints |
| L24 | 14 Oct 14:46 | Give large buildings and objects real 3D presence | ✅ | v1.3 (building heights), v1.4 (pitched roofs) |
| L25 | 14 Oct 14:46 | Make each building type look distinct | ✅ | v1.3 (28 types, wall materials, named signs), v1.5 more types |
| L26 | 14 Oct 14:46 | Tune spawn rates so each town feels unique | ✅ | v1.3 (town plans) |
| L27 | 14 Oct 14:46 | A sound meter (a volume icon that changes colour) | ✅ | v1.3. Can be hidden with the Hardcore HUD since v1.8 |
| L28 | 14 Oct 14:46 | How feasible are multiple floors and skyscrapers, with zombies climbing stairs? | ✅ / 🟡 | v1.3 (1 to 7 floors, stairs, zombies follow you up). Skyscrapers open (F1) |
| L29 | 14 Oct 14:46 | Different building heights, so it looks like a city | ✅ | v1.3 |
| L30 | 14 Oct 14:46 | Question: can you barricade yourself in a house? | 💬 | Yes: planks since the early versions, metal sheets since v1.6, and zombies besiege barricades properly since v1.8 |
| L31 | 14 Oct 14:46 | A day/night cycle and a day counter | ✅ | Cycle since v1.0, counter in v1.3 |
| L32 | 14 Oct 14:46 | Multi-storey buildings like the original's | ✅ | v1.3, malls in v1.7 |
| L33 | 14 Oct 14:46 | Still less blocky and cartoonish | 🟡 ongoing | G3 |
| L34 | 14 Oct 14:46 | A third intensive research round: loops, survival, loot and crafting, map density, sound and stealth, atmosphere, difficulty, realism, generation, filler objects, house types | ✅ | v1.3 (Research v3, 14 Oct; rounds R1 to R14) |
| L35 | 14 Oct 14:46 | Overhaul all animations, models and smoothness; "identical and indistinguishable from the real thing" | 🟡 ongoing | v1.3 to v1.10 (G1, G3) |
| L36 | 14 Oct 18:25 | Lag when running into new chunks, especially zoomed out (top priority) | ✅ / 🟡 | v1.4 overhaul, v1.7 automatic quality, 1.10.1 light cap. Remaining weak spots in F14 |
| L37 | 14 Oct 18:25 | Upper floors lack the detail of the ground floor (rooms, cabinets) | ✅ | v1.4 (floor interiors), v1.10 (themed fill) |
| L38 | 14 Oct 18:25 | Survey the document for anything not yet included, research every detail, and add it | ✅ | v1.4 (clothing, temperature, seasons, generators, ropes, stories, foraging, presets and more) |
| L39 | 14 Oct 18:25 | More exterior variety: neighbourhoods and cities with soul, not cubes | ✅ | v1.4 (pitched roofs, house styles, porches, garages, yards) |
| L40 | 14 Oct 18:25 | Include anything that makes it better, and report back | 📌 | Standing rule |
| L41 | 14 Oct (approx.) | Firearms | ✅ | v1.5 |
| L42 | 14 Oct (approx.) | Car repair | ✅ | v1.5 |
| L43 | 14 Oct (approx.) | Malls | ✅ | v1.5; multi-floor in v1.7 |
| L44 | 14 Oct (approx.) | Cinemas | ✅ | v1.5; multiplex in malls in v1.7 |
| L45 | 14 Oct (approx.) | Gun stores | ✅ | v1.5 |
| L46 | 14 Oct (approx.) | Focus on world building | ✅ | v1.5 (junkyards, drive-ins, hunting lodges, water towers, cemeteries, squares, armouries) |
| L47 | 14 Oct (approx.) | Question: where are we on crafting? | 💬 | Answered after v1.5, which led to v1.6 |
| L48 | 14 Oct (approx.) | Explore the original's stealth; talk through options | 💬 | Options given, which led to v1.6 |
| L49 | 14 Oct (approx.) | Implement the original's stealth | ✅ | v1.6 |
| L50 | 14 Oct (approx.) | The visibility indicator | ✅ | v1.6 (optional since v1.8) |
| L51 | 14 Oct (approx.) | Crafting fully fleshed out like the original, then explain how it works | ✅ | v1.6 (78 recipes, 18 builds); the explainer is in the Recreation Document, B5 |
| L52 | 14 Oct (approx.) | Implement anything else that imitates the original (your permission) | ✅ | v1.6 (fire, continuing as a new survivor, hotbar, map notes, sleep events, body weight) |
| L53 | 14 Oct (approx.) | Shift the art slightly toward the original's | ✅ / 🟡 | v1.6, a first pass (G3) |
| L54 | 14 Oct (approx.) | A full performance overhaul, no frame drops | ✅ | v1.6 caches, v1.7 automatic quality |
| L55 | 14 Oct (approx.) | New animations and sound effects | ✅ | v1.6, v1.7 |
| L56 | 14 Oct (approx.) | Update the document, with a table of all releases at the bottom | ✅ | v1.6 onward (now in the Changelog) |

### 15 Oct 2026: behaviour and difficulty
| # | Raised | Your request | Status | Dealt with in |
|---|---|---|---|---|
| L57 | 15 Oct | Zombies investigating noise walk into walls: intentional? | ✅ | v1.7 (it wasn't; they route to the sound and break in) |
| L58 | 15 Oct | Survey difficulty and numbers against the original | ✅ | v1.7, corrected in v1.8 |
| L59 | 15 Oct | Create difficulty options for future patches | ✅ | v1.7 (10 options), all resolved by v1.9 |
| L60 | 15 Oct | What's in our game that isn't in the original? | ✅ | v1.7 audit, updated in v1.8 |
| L61 | 15 Oct | Many-floor malls | ✅ | v1.7 |
| L62 | 15 Oct | Living animals | ✅ | v1.7, plus tracking in 1.9.2 and 1.9.5 |
| L63 | 15 Oct | Crop disease | ✅ | v1.7 |
| L64 | 15 Oct | Review the document intensively; research future additions for a realistic world | ✅ | v1.7 |
| L65 | 15 Oct | Animation, audio, ambience, atmosphere and graphics updates | ✅ | v1.7 |
| L66 | 15 Oct | Don't make anything noticeably easier without asking | 📌 | Standing rule |
| L67 | 15 Oct | Zombies bunch against doors, and crouching in the next room breaks the chase too fast | ✅ | v1.8 (sieges, memory, door strength) |
| L68 | 15 Oct | You can hit and be hit through walls | ✅ | v1.8 |
| L69 | 15 Oct | Curtains can be opened from outside | ✅ | v1.8 (from inside only, or through an open or broken window) |
| L70 | 15 Oct | A zombie at a window doesn't break in, and hits you through the closed glass | ✅ | v1.8 |
| L71 | 15 Oct | Look into behaviour, pathing and difficulty against the original | ✅ | v1.8 |
| L72 | 15 Oct | Rename it "Day After Dawn" with "Dead Quiet" in small text beneath | ✅ | v1.8 |
| L73 | 15 Oct | Fences have gaps at corners | ✅ | v1.8 (joined corners, without the rung artefact) |
| L74 | 15 Oct | Option 1, sight range: explain it, and go ahead if it's positive | ✅ | v1.8 (18 tiles by day) |
| L75 | 15 Oct | Option 2, window and fence lunges (approved) | ✅ | v1.8 |
| L76 | 15 Oct | Option 3, population growth: "population of zombies?" | 💬 then ✅ | Explained in v1.8; built in v1.9 (Apocalypse+, Extinction, Sandbox) |
| L77 | 15 Oct | Option 4: more difficulty options with more zombies and stingier loot, plus a loot survey | ✅ | Loot survey and multiplier fix in v1.8; preset ladder in v1.9 |
| L78 | 15 Oct | Option 5, takedowns tied to skill: future changelog | ✅ | v1.9 |
| L79 | 15 Oct | Option 6, hotbar slots from belts and holsters (approved) | ✅ | v1.8 |
| L80 | 15 Oct | Option 7, Hardcore HUD (approved) | ✅ | v1.8 |
| L81 | 15 Oct | Option 8, the original's zombie memory (approved) | ✅ | v1.8 |
| L82 | 15 Oct | Option 9, utilities and helicopter schedule: explain it, and go ahead if it adds depth | 💬 then ✅ | Explained in v1.8; per preset in v1.9 (Canon unchanged, so it isn't easier) |
| L83 | 15 Oct | Option 10, presets: "we have this, don't we?" | 💬 then ✅ | Yes, four existed; the full ladder and Sandbox came in v1.9 |

### 16 Oct 2026: polish, audits and housekeeping
| # | Raised | Your request | Status | Dealt with in |
|---|---|---|---|---|
| L84 | 16 Oct | Weird grey objects (cubes at doors and on the floor) | ✅ | v1.9 (they were porch lights, now proper lanterns) |
| L85 | 16 Oct | Implement everything lined up (24 minutes) | 🟡 | v1.9 did presets, Sandbox, growth, loot categories, utilities and takedowns. The rest is open (section 5) |
| L86 | 16 Oct | Improve graphics, performance, QoL and atmosphere | 🟡 ongoing | v1.9 (floor item icons, click-to-equip hotbar, dawn mist) |
| L87 | 16 Oct | Quick mini patches (3 to 5 minutes each) | ✅ | 1.9.1 blood cleaning, 1.9.2 tracking, 1.9.3 burning bodies, 1.9.4 pyre fix, 1.9.5 tracking polish |
| L88 | 16 Oct | Number mini patches 1.x.x | 📌 | Standing rule |
| L89 | 16 Oct | Stuck on the bed after respawning | ✅ | v1.10 |
| L90 | 16 Oct | Multi-storey interiors filled thematically, not cluttered | ✅ | v1.10 |
| L91 | 16 Oct | Car sound about 20% quieter and less jarring | ✅ | v1.10 |
| L92 | 16 Oct | Some buildings completely empty | ✅ | v1.10, plus doorways and entrances in 1.10.1 |
| L93 | 16 Oct | Wall textures and collisions misplaced | ✅ | v1.10 (stray double walls removed) |
| L94 | 16 Oct | Check notes, double-check, redo research | ✅ | v1.10 |
| L95 | 16 Oct | Confirm the two unconfirmed items (tiny rooms, stress test) | ✅ | 1.10.1 |
| L96 | 16 Oct | A bug survey | ✅ | 1.10.1 (blocked doors and sealed buildings fixed) |
| L97 | 16 Oct | A performance survey | ✅ | 1.10.1 (light cap) |
| L98 | 16 Oct | Dust motes that follow your character | ✅ | 1.10.2 |
| L99 | 16 Oct | Investigate all kits | ✅ | 1.10.2 (all 10 correct) |
| L100 | 16 Oct | Make sure every trait works ("multiple have 0 effects") | ✅ / 🟡 | 1.10.2: all 23 measured working. Follow-up: strengthen the subtle ones (F12) |
| L101 | 16 Oct | Clean up the artefacts: merge duplicates, date everything, keep types separate | ✅ | 16 Oct (Research, Recreation Document, Changelog) |
| L102 | 16 Oct | Talk through moving to a Git repo | 💬 then 🟡 | Steps given 16 Oct. Repo package with setup and import scripts ready 16 Oct (v1.13); pushing to GitHub is the remaining step |
| L103 | 16 Oct | This Future Plans document | ✅ | 16 Oct |
| L104 | 16 Oct | Question: you have every old release saved; does that change anything? | 💬 | Yes. See section 7 and F17 |
| L105 | 16 Oct | Use 30 minutes on the biggest update lined up | ✅ | 1.11 (high-rises, hotel, barns and silos) |
| L106 | 16 Oct | A full lighting, environment, graphics, texture, animation, ambience and atmosphere pass, with a survey and new research, keeping the game's identity | ✅ | 1.12 (Recreation Document B9; research R30 to R32) |
| L107 | 16 Oct | The frame rate is sometimes abysmal: a full patch only on performance | ✅ | 1.13 (Recreation Document B10) |
| L108 | 16 Oct | Question: can the repository be public? Then: do a full clean-up sweep first | 💬 then ✅ | Answered 16 Oct; clean-up in 1.13.1 |

**Totals:** 108 items. 95 are done (fully or in part), 10 of those or others are partly done or ongoing (mostly the open-ended goals: realism, smoothness and "indistinguishable from the real thing"), 8 were questions (all answered), 3 are standing rules, and 1 is fully open (the Git repo). Some items count in more than one group.

| Status | Items | Notes |
|---|---|---|
| Done | 86 | |
| Partly done or ongoing | 14 | Mostly the open-ended goals: realism, smoothness and "indistinguishable from the real thing" |
| Questions answered | 8 | |
| Standing rules | 4 | |
| Fully open | 1 | The Git repo |

Some items are counted in more than one group.

---

## 4. What's still open, in one list

| # | Item | Raised by | When |
|---|---|---|---|
| F1 | True high-rises (beyond 7 floors) | You | 13 and 14 Oct |
| F2 | Other survivors (NPCs) | Research (Build 43 plans) | 15 Oct |
| F3 | Animal care in depth | Research | 15 Oct |
| F4 | Farming in depth and food preservation | Research | 15 Oct |
| F5 | Fresh food in fridges that spoils | Loot survey | 15 Oct |
| F6 | Firearm extras | Me | 15 Oct |
| F7 | Vehicle extras | Me | 15 Oct |
| F8 | Brewing and fluids | Research | 15 Oct |
| F9 | Glassmaking | Research | 15 Oct |
| F10 | Lighting overhaul | Research and G3 | 14 to 15 Oct |
| F11 | Sewers, tunnels and panic rooms | Research | 15 Oct |
| F12 | Strengthen the subtle traits | Me (trait audit) | 16 Oct |
| F13 | Gradual looting near where you start | Loot survey | 15 Oct |
| F14 | Performance weak spots | Performance survey | 16 Oct |
| F15 | Character art detail | You (G3) | 13 Oct |
| F16 | More building types and interior variety | You (G5) | 13 and 14 Oct |
| F17 | Git repo, the source package and release history | You | 16 Oct |
| F18 | Sandbox polish | Me | 16 Oct |
| F19 | A fuller cleaning system | Research | 15 Oct |
| F20 | Weather extremes | Me | 14 Oct (v1.6 roadmap) |
| F21 | The Nimble skill and combat stances | Me | 14 Oct (v1.6 roadmap) |
| F22 | Illness depth | Me | 16 Oct |

---

## 5. Detailed plans for every open item

### F1. True high-rises (raised by you, 13 and 14 Oct). 🟡 Mostly done in 1.11
- **Done in 1.11:** apartment towers (9 to 12 floors), office towers (9 to 14) and a hotel (8 to 10), with stair cores and floors generated on demand.
- **Still open:** towers taller than 15 floors (the storage scheme allows at most 15), out-of-order lifts, rooftop access and fire escapes.
- **Plan:**
  - **The buildings:** a high-rise generator for apartment towers, office towers and a hotel, 8 to 20 floors (the original reaches 32 in Build 42).
  - **Inside:** stairwells on every floor, a lobby, repeating floor plans with variation (apartments, offices, a few gutted floors), a roof with access, and fire escapes on the outside.
  - **Lifts:** out of order, since the power is unreliable.
- **Gameplay:**
  - **Floors:** each floor is a self-contained hunting ground.
  - **Stairwells:** they're choke points, and smashing a stair section cuts the building off, as you already can.
  - **Rooftops:** useful for looking out.
- **Performance:** floors are already generated only when visited. Zombie counts per floor would be capped, and floors far from you would be frozen.
- **Size:** large. **Research:** R10 and R26.

### F2. Other survivors (research R26: planned for the original's Build 43)
- **Plan:**
  - **The people:** wandering survivors, and camps with their own barricades and loot.
  - **What they do:** react to noise and zombies, and trade (food for ammo and so on).
  - **Attitude:** some are hostile and some friendly, and they remember how you treated them.
- **Gameplay:** this is the biggest single step toward a world that feels lived in. It needs dialogue-free behaviour (gestures and barks) to stay in the original's spirit.
- **Size:** very large. Best done after the Git move (F17) so it can live on its own branch.

### F3. Animal care in depth (research R24)
- **Now:** wild and farm animals exist, with hunting, butchering, eggs, milk, wool and tracking.
- **Plan:**
  - **Needs:** feed and water troughs, hunger and thirst.
  - **Lifecycle:** breeding and young.
  - **Stress:** from zombies, engines, gunfire and crowding, which lowers milk and eggs.
  - **Handling:** leading animals with a rope, and livestock trailers.
  - **Byproducts:** dung for compost.
  - **The Animal Care skill:** it would actually affect results.
- **Size:** medium to large.

### F4. Farming in depth and food preservation (research R25 and R26)
- **Now:** 5 crops with planting seasons, diseases, sprays, weeds and fertiliser.
- **Plan:**
  - **Crops:** a dozen or more, each with its own season and growth time.
  - **Tending:** compost bins (pairs with F3), and saving seeds from the harvest.
  - **Preserving:** jarring (needs jars, which ties to F9), drying racks, smoking meat, and freezers on a generator.
- **Size:** medium.

### F5. Fresh food in fridges that spoils (from the loot survey, 15 Oct)
- **Plan:** fridges start fuller with fresh food that rots within days, especially after the power goes. Tins and dry food stay scarce, giving the original's early rush to eat the fresh food first.
- **Effect:** the first days are slightly easier and later days harder. It needs your approval (📌).
- **Size:** small.

### F6. Firearm extras (my suggestion, 15 Oct)
- **Plan:**
  - **Attachments:** scopes for range and accuracy, suppressors for less noise (rare), and recoil pads.
  - **Upkeep:** gun parts for repair.
- **Note:** the original doesn't let you craft complete rounds, so ammo crafting would be a deliberate departure. It would be listed as such.
- **Size:** medium.

### F7. Vehicle extras (my suggestion, 15 Oct)
- **Plan:**
  - **Towing:** towing a car with a rope or chain.
  - **Trailers:** they pair with F3.
  - **Learning:** mechanics magazines that teach repairing specific makes.
  - **More vehicles:** pickup, van, police SUV, ambulance interiors.
  - **Storage:** using trunks as storage on the move.
- **Size:** medium.

### F8. Brewing and fluids (research R26)
- **Plan:**
  - **Fluids:** a fluid system where containers hold water, gasoline, milk and juice, with mixing.
  - **Brewing:** beer and wine with a fermentation timer.
  - **Clean water:** boiling and purifying.
- **Size:** medium.

### F9. Glassmaking (research R26)
- **Plan:** a furnace (already a station) melts sand into glass for jars (F4), bottles, and replacement panes for broken windows.
- **Size:** medium.

### F10. Lighting overhaul (research R4 and R26; goal G3). 🟡 Largely done in 1.12
- **Plan:**
  - **Interior light:** light that bounces and leaks through doorways and windows.
  - **The sun:** shadows that move through the day.
  - **Flashlights:** beams that light rooms properly.
  - **Lit rooms:** proper falloff at night.
  - **Performance:** cached light maps per room.
- **Size:** large. It's the biggest visual step toward the original's look.

### F11. Sewers, tunnels and panic rooms (research R26)
- **Plan:**
  - **Underground:** sewer networks under towns with manhole access, using the existing basement and floor system.
  - **Panic rooms:** in some houses.
  - **Tunnels:** a few maintenance tunnels between buildings.
- **Size:** large.

### F12. Strengthen the subtle traits (my suggestion from the trait audit, 16 Oct)
- **Now:** all 23 traits work, but a few are faint:
  - Athletic and Unfit only change stamina while running by about 10%.
  - Strong and Weak only change carry capacity by 2.
- **Plan:** move them toward the original's strength. For example, Athletic would also raise sprint speed and stamina recovery. Strong would add knockback and melee damage, and Weak would take them away.
- **Effect:** it changes difficulty both ways, so it needs your approval (📌).
- **Size:** small.

### F13. Gradual looting near where you start (from the loot survey, 15 Oct)
- **Plan:** buildings close to where you begin are slightly picked over, since other survivors looted them first. Loot recovers further out.
- **Effect:** harder early on, and it encourages exploring. Needs your approval.
- **Size:** small.

### F14. Performance weak spots (from the performance survey, 16 Oct). ✅ Addressed in 1.13
- **The two weakest spots:** big chases (about 8.6ms of simulation for 60 chasing zombies on top of a loaded area of about 2,400) and drawing the mall's upper floors.
- **Plan:**
  - spread zombie decision-making across frames
  - share route searches between neighbouring zombies
  - cache the floors below when you're upstairs
  - a cheaper simplified zombie at medium zoom
- **Size:** medium.

### F15. Character art detail (raised by you, 13 Oct; goal G3)
- **Plan:**
  - **Bodies:** fuller body shapes instead of line limbs, and clothing that shows its layers (jackets over shirts, visible backpacks and holsters).
  - **Variety:** more hair styles.
  - **Zombies:** visible decay and wounds.
  - **Movement:** smoother transitions between walking, running and sneaking.
- **Size:** large.

### F16. More building types and interior variety (raised by you, 13 and 14 Oct; goal G5). 🟡 Started in 1.11 (hotel, barns and silos)
- **Plan:**
  - **New places:** a prison, a military base, an airfield, a factory and warehouses with racking, farms with barns and silos, a hotel (pairs with F1), a radio station and a power station.
  - **More variety inside:** themed apartments (a student flat, a family home, a hoarder's place) and staged scenes that tell a story.
- **Size:** medium per batch.

### F17. Git repo, the source package and release history (raised by you, 16 Oct). 🟡 Package ready 16 Oct
- **Plan:** see section 7. Package the source, initialise the repo, import every old release as dated history, and tag versions.
- **Size:** small. It should come first, because it protects the source.

### F18. Sandbox polish (my suggestion, 16 Oct)
- **Plan:** sliders instead of number boxes, saving your own named presets, and showing each setting's value next to the original's default.
- **Size:** small.

### F19. A fuller cleaning system (research R26)
- **Now:** blood on the ground can be scrubbed up with rags (1.9.1).
- **Plan:**
  - **Tools:** mops and bleach.
  - **More surfaces:** blood on walls.
  - **Washing:** washing your clothes and yourself, since bloodied clothes would upset you a little.
- **Size:** small to medium.

### F20. Weather extremes (my suggestion, v1.6 roadmap)
- **Plan:** heat waves (thirst, heatstroke), cold snaps, heavier storms that knock out the power early, and thick fog banks.
- **Size:** medium.

### F21. The Nimble skill and combat stances (my suggestion, v1.6 roadmap)
- **Plan:** a Nimble skill for moving well while aiming or fighting, as in the original, plus combat stances and better shoves for space.
- **Size:** medium.

### F22. Illness depth (my suggestion, 16 Oct)
- **Plan:** food poisoning from spoiled food (pairs with F5), colds that turn into flu, and infected wounds that need disinfectant. These build on the existing wound, cold and sickness systems.
- **Size:** small to medium.

---

## 6. A suggested order for the next patches

| Patch | Contents | Why this order |
|---|---|---|
| 1.10.3 | F12 traits, F13 gradual looting, F5 fresh food (each needs your approval) | Small, and fits a mini patch |
| 1.11 | F17 the Git repo, then F14 performance | Protect the source first, then make room for bigger systems |
| 1.12 | F3 animal care plus F7 trailers | Builds directly on v1.7 animals |
| 1.13 | F4 farming depth plus F9 glassmaking plus F8 brewing | They share jars, fluids and stations |
| 1.14 | F1 high-rises plus F16 a first batch of new places | World building |
| 1.15 | F10 lighting plus F15 character detail | The big visual pass toward the original's look |
| 1.16 | F11 sewers and tunnels, F20 weather, F21 Nimble, F22 illness, F19 cleaning, F6 firearms, F18 Sandbox | Depth and polish |
| 2.0 | F2 survivors | The largest change, on its own branch |

---

## 7. The old releases and the Git repo (your question, 16 Oct)

Having every old release saved changes things for the better.

1. **A real history instead of a fresh start.** Each saved release becomes its own commit, in order, with its original date, tagged (v1.0 through v1.10.2). You could then compare any two versions, see exactly what changed between them, and track down which version introduced a bug.
2. **The early changelog can be filled in.** Versions 1.0 to 1.3 currently have only a one-line summary each. With the actual builds, I can compare them and write proper entries, checking every claim in the changelog against the real code.
3. **Performance across versions.** The same benchmark can run on every release, showing how speed changed over time.
4. **Each release is complete.** Every old HTML file contains all of that version's code, so nothing about those versions is lost, even though they were never split into separate source files.

**What it would take:**
- **Names:** a consistent name for each file (for example dead_quiet_v1.0.html), plus the version and date if a name doesn't make it clear.
- **The files:** upload them here, or put them straight into the repo.
- **Setup:** I'd write a short script that builds the repo's history from them, with the correct dates and tags, and then adds the current source on top.
