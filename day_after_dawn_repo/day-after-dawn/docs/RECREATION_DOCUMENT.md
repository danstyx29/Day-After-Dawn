# Day After Dawn: Recreation Document

> **About this project:** Day After Dawn is an independent, non-commercial fan project inspired by *Project Zomboid*. All of its code, art, names and text are original. It is not affiliated with or endorsed by The Indie Stone, who own Project Zomboid. Mentions of Project Zomboid in this document are research and commentary.

*The plan for recreating Project Zomboid, and how Day After Dawn actually works as built. Part A is the original blueprint (written 12 Oct 2026). Part B is the current design (last updated 16 Oct 2026, v1.10.2). Part C archives older versions of Part B sections, dated, so nothing is lost.*

**Contents**
- Part A: Recreation Blueprint (12 Oct 2026)
- Part B: As built (updated 16 Oct 2026)
  - B1 Difficulty survey against the original
  - B2 The ten difficulty options and where they stand
  - B3 Loot survey
  - B4 What Day After Dawn has that the original doesn't
  - B5 How crafting works
  - B6 How stealth and zombies work
  - B7 Research for future additions
  - B8 Future changelog and next steps
  - B9 Lighting, atmosphere and sound: survey and as built (v1.12)
  - B10 Performance design (v1.13)
- Part C: Archive of superseded sections (v1.6, 14 Oct 2026; v1.7, 15 Oct 2026)

---

# Part A: Recreation Blueprint (12 Oct 2026)

## Isometric Zombie Survival Sim: Full Recreation Blueprint

*A research document and build prompt for recreating the gameplay of Project Zomboid as an original game, built with Claude Opus 5.5.*

Prepared 13 October 2026. Reference version: Project Zomboid Build 42.20 (stable since 29 July 2026).

---

## 0. How to use this document

This document has two jobs.

1. **Research reference (Sections 1 to 8).** Everything you need to know about how Project Zomboid actually plays, broken down system by system, with starting numbers and notes on how to rebuild each part.
2. **The prompt pack (Section 11).** A master prompt that sets up the whole project, plus milestone prompts that walk Opus 5.5 through the build one playable step at a time, plus templates for tweaks and bug reports.

**Important reality check.** No single prompt will build a game this big in one go. Project Zomboid has been in development since 2011. What a single prompt *can* do is set up the project properly, lock in the design rules and then drive a long series of focused build sessions. That is what the prompt pack is designed for. Expect this to take many sessions across weeks, and treat each milestone as its own sitting.

**Recommended tool:** Claude Code (desktop app or terminal) running Opus 5.5, not the normal chat. Claude Code can create files, run the game, read errors and fix them in a loop. The chat app can only hand you code to paste. Put the master prompt in a file called `CLAUDE.md` in the project root so it is loaded into every session automatically.

**Copyright line:** game mechanics and systems (hunger meters, infection chances, isometric view, skill levels) are not protected. What *is* protected is the specific expression: the art, tiles, character models, sounds, music, UI icon designs, written lore, radio scripts, the map layout, character and place names and the mascot. This blueprint recreates the mechanics and replaces every piece of expression with your own. Section 8 has a full renaming table.

---

## 1. The game in one paragraph

Project Zomboid is an isometric, open world, single character survival sandbox set in a quarantined region of rural Kentucky in 1993, a few days into a zombie outbreak. There is no win condition. The opening screen literally tells the player "this is how you died", and the whole game is about how long you last and the story your survival tells. It is slow, systemic and punishing. One bite kills you. Hunger, thirst, boredom, depression, injuries, illness, weather, noise, darkness, broken utilities and slowly rotting food all pile up into a constant management problem, while a huge population of mostly slow, mostly stupid zombies gets drawn towards every noise you make.

### 1.1 Design pillars (what makes it feel like Zomboid)

These are the things that must survive any tweaks you make later. If one of these goes, it stops feeling like the game.

1. **Permadeath and inevitability.** Death is permanent and expected. The game is about stretching the clock, not winning.
2. **Simulation over scripting.** Almost nothing is a cutscene. Hordes form because sounds pulled zombies together. Food rots because time passed. Your character is sad because they read nothing for three days.
3. **Every action takes time.** Opening a can, bandaging a wound, moving items between containers, reading a book. Each one is a timed action with a progress bar that can be interrupted. This is the core of the tension.
4. **Noise is the main enemy.** Zombies are weak individually and terrifying in numbers, and numbers come from sound. Smashing a window, firing a gun, revving a car or a house alarm going off all have real cost.
5. **The world decays.** Power and water shut off. Food spoils. Grass grows over roads. Houses get broken into. The early game is looting a frozen moment in time; the late game is self sufficiency.
6. **The character is a person, not a superhero.** They get tired, scared, bored, fat, thin, sick, cold, wet, drunk and depressed. Their state directly changes how well they fight, move and work.
7. **Deep, readable systems.** Lots of systems, but all communicated through simple UI: status icons, a body diagram and right click menus.
8. **Sandbox customisation.** Almost every rule (zombie speed, loot rarity, utility shutoff, infection) is a setting, so players build the apocalypse they want.

### 1.2 Tone and setting (to replace with your own)

- Era: early 1990s American small town and countryside. No mobile phones or internet. VHS tapes, CRT TVs, landlines, cassette players. The era matters because it limits technology and gives a strong flavour.
- Mood: bleak but with dry, dark humour. Mundane suburbia turned into a graveyard.
- Story delivery: almost entirely environmental. Radio and TV broadcasts during the first days describe the outbreak and the government response falling apart, then go silent. Notes, newspapers, abandoned scenes and graffiti fill in the rest.
- Start: the player wakes up in a house in one of a handful of towns, with the outbreak already a few days old and the region sealed off by the military.

---

## 2. Version baseline

The current stable version of Project Zomboid is Build 42, which reached the public stable branch as version 42.20 on 29 July 2026. Build 42 is the biggest update in the game's history. Its main additions over Build 41, according to the official features overview, are:

- A full lighting overhaul with light bouncing off walls and leaking through windows and doors, and much darker nights.
- Ragdoll physics on zombies hit by cars, gunfire or explosions.
- A doubled map area with new towns, unique buildings in every town, basements, bunkers and skyscrapers up to 32 floors.
- Randomised wilderness beyond the map edges, so the world is close to endless.
- Interior doors and lights randomised per run, plus some houses already looted and trashed.
- Animals: sheep, chickens, pigs, cows, rats, rabbits, deer and raccoons, with tracking by prints and droppings, hunting and husbandry for meat, leather, eggs, milk and manure.
- Seasonal farming with realistic grow times and correct planting months.
- A more interactive fishing system where fish react to noise and can be attracted with chum.
- Voronoi noise driven zombie distribution that makes hordes more urban and natural.
- World seeds that control generated content.
- New game mode presets: Apocalypse (the canon default), Outbreak (faster), Rising (cosier) and Extinction (brutal).
- A big crafting overhaul: selectable ingredients, search by input or output, batch crafting, workstations and new skills including masonry, carving, knapping, blacksmithing, pottery and glassmaking.
- Melee weapons with separate head and handle condition plus blade sharpness, where heads can fall off.
- A new firearm aiming system with targeted body locations, affected by panic, stress and skill.
- Hundreds of new clothing items, containers, tents and sleeping bags, free 3D item placement, cartons for packing items and a liquid mixing system.
- Dynamic adaptive music and character vocal cues.

**Recommendation for your version:** build the Build 41 core first (it is smaller and is still the heart of the game), then add Build 42 features as later milestones. The milestone plan in Section 10 is ordered that way. Things like basements, animals, blacksmithing and skyscrapers are great late additions but they are not what makes the game feel like Zomboid on day one.

---

## 3. The core gameplay loop

### 3.1 Minute to minute

Move carefully through the world, look for threats, loot containers, deal with single zombies quietly, manage your status icons (eat, drink, rest, treat wounds), and retreat to safety before night or before a horde builds up.

### 3.2 Day to day

Pick a target area (a pharmacy, a hardware store, a police station), plan a route, go out, loot, come back, store items, cook, read a skill book, sleep. Barricade and expand your safehouse. Listen to the radio and TV while they still broadcast.

### 3.3 Week to month (the arc)

| Phase | Rough timing (default) | What the player is doing |
|---|---|---|
| Panic | Days 1 to 3 | Find a weapon, a bag, food and a safe room. Learn the area. |
| Scavenger | Days 3 to 14 | Clear a base, stockpile canned food and water, collect books and tools. Helicopter event hits around days 6 to 9. |
| Shutoff | Weeks 2 to 6 | Power and water fail. Fridges become useless. Need generators, rain barrels, fuel. |
| Builder | Months 1 to 3 | Farming, carpentry, walls, a vehicle, long range looting runs. |
| Self sufficient | Month 3+ | Farming through seasons, trapping, fishing, animals, crafting replacements for broken tools. Winter is the big threat. |

### 3.4 Failure

Almost always one of: getting surrounded, getting bitten, an infected scratch, a sprinting mistake into an unseen group, starvation or dehydration during a long trip, hypothermia, a fire, or a car crash. The death screen shows how long you survived and how many zombies you killed. Your corpse then rises as a zombie wearing your gear, so a new character can go and kill their old self and take their stuff back.

---

## 4. Systems deep dive

Each system below has: **how it works in the original**, **starting values** (my suggested numbers to begin tuning from, not datamined values) and **recreation notes**. All numbers should live in data files so you can tweak them without touching code.

### 4.1 Camera, view and movement

**How it works.** Fixed isometric camera (2:1 diamond tiles) with zoom levels. The world is made of square tiles stacked into floors. Walls between tiles hide what is behind them, and the camera cuts away upper floors and roofs when you go inside or upstairs. The player character is a fully animated 3D model rendered in the isometric view. Vision is a cone in front of the character: tiles outside your line of sight are darkened and do not show zombies, so you can be surprised from behind. Movement is WASD relative to the screen, with the mouse aiming. Hold a key to aim (which turns the character to face the cursor), shift to run, a sprint key, and a sneak toggle that makes you slower and quieter.

**Movement modes.** Walk, run, sprint (drains endurance fast), sneak (crouched, slow, quiet), aiming walk (slow, facing the cursor). Climbing over low fences and through windows is a timed action with a chance to trip or fall based on skills, weight and moodles.

**Starting values.**
- Walk 3.0 tiles/s, run 4.5 tiles/s, sprint 6.0 tiles/s, sneak 1.8 tiles/s, aim walk 1.5 tiles/s.
- Vision cone 120 degrees for full detail, peripheral up to 180 degrees with reduced detail, range 20 tiles by day, 6 to 10 tiles at night without light.

**Recreation notes.** Line of sight and the vision cone are central to the horror. Do them early. Use a shadowcasting field of view on the tile grid, then fade tiles that are out of sight to dark grey and hide any moving entity on them. Upper floor cutaway can start simple: hide every level above the player's current level and fade walls on the south and east side of rooms near the player.

### 4.2 The world and map

**How it works.** One large handmade map of a fictional quarantine zone: several small towns, a big city, farms, trailer parks, a military base, a prison, malls, warehouses and lots of forest and highway between them. Every building has interior rooms with a room type (kitchen, bedroom, bathroom, garage, store backroom, pharmacy) which drives what loot spawns in its containers. Buildings have locked and unlocked doors, windows that can be opened, smashed or climbed through, and curtains. Some houses have alarms. The map is streamed in chunks around the player and zombies outside the loaded area are tracked in a cheap abstract form.

Over time the world erodes: grass and vines grow across roads and walls, trees sprout in fields, the world gets visibly greener and messier over months.

**Recreation notes.**
- You cannot hand build a map that big. Use a **procedural town generator** with a few handmade "landmark" buildings (police station, hospital, warehouse, mall, gas station) placed into a generated street grid. Road grid, lots, houses picked from a set of room layout templates, then furniture placed by room type.
- Store the map as chunks (for example 32x32 tiles per chunk, 8 vertical levels). Only load chunks within a radius of the player.
- Every tile holds: floor, up to two walls (north and west edge, the classic isometric approach), an object (furniture, tree, container), and flags (blocks movement, blocks sight, is a door, is a window).
- Use a seed so a world can be regenerated identically.

### 4.3 Time, calendar and game speed

**How it works.** The game runs on a clock and calendar. Default is 1 real hour per in game day. The original starts in early July 1993 so the player gets summer first and winter months later. The player can fast forward through several speed steps when nothing is nearby, and the game drops back to normal speed if a zombie is spotted. Sleeping skips time until you wake.

**Recreation notes.** Make the simulation tick independent from frame rate. All needs, spoilage, crop growth and timed actions use in game minutes, not real seconds, so fast forward just runs more ticks. Make the starting date a setting.

### 4.4 Character creation

**How it works.**
1. Pick an **occupation**. Each one gives a set of starting skill levels, sometimes free traits, sometimes known recipes, and a point budget. Examples: police officer (aiming, reloading, nimble), carpenter (carpentry), nurse (first aid), lumberjack (axe skill, bonus with axes), burglar (can hotwire cars, nimble, sneak), chef (cooking, starts knowing recipes), unemployed (no skills, most points), fire officer (fitness, strength), engineer (can make traps and explosives), fitness instructor, farmer, fisherman, mechanic, electrician, veteran (aiming, never panics), security guard, and in Build 42 a rancher for animal care.
2. Pick **traits**. Positive traits cost points, negative traits give points. The total must not go below zero. Traits change almost every system: Strong, Athletic, Fast Learner, Lucky, Keen Hearing, Eagle Eyed, Light Eater, Brave, Thick Skinned, Graceful, Inconspicuous, Dextrous, Organized, Outdoorsman, Fast Reader, Wakeful, Iron Gut, Cat's Eyes on one side. Weak, Unfit, Obese, Short Sighted, Hard of Hearing, Clumsy, Conspicuous, Slow Learner, Smoker, Cowardly, Hemophobic, Agoraphobic, Claustrophobic, Prone to Illness, Weak Stomach, Restless Sleeper, Sleepyhead, Slow Reader, Thin Skinned, All Thumbs, Disorganized, Pacifist, Hearty Appetite and Insomniac on the other.
3. Customise appearance and clothing.
4. Pick a starting town.

**Starting values.** Occupation point budgets between -8 and +8, trait costs between 1 and 10. Unemployed gets the most points, specialist jobs give fewer.

**Recreation notes.** Store occupations and traits as data. Traits should be implemented as **modifiers** that other systems query, for example `stat_multiplier("hunger_rate")` returns 0.75 if the player has your equivalent of Light Eater. Doing it this way means a new trait is a data entry, not new code.

### 4.5 Core stats and needs

The character has hidden numeric stats. Each one feeds into a status icon (Section 4.6) when it crosses a threshold.

| Stat | Range | Rises from | Falls from | Main effects when bad |
|---|---|---|---|---|
| Hunger | 0 to 1 | Time (faster when exerting) | Eating | Slower healing, weakness, eventually health loss |
| Thirst | 0 to 1 | Time, heat, exertion, salty food | Drinking | Faster than hunger to kill you, weakness |
| Fatigue (tiredness) | 0 to 1 | Time awake, exertion | Sleep | Slower actions, worse combat, eventually passing out |
| Endurance | 1 to 0 | Rest | Running, sprinting, swinging weapons, carrying heavy load | Slower movement and attacks, can't sprint |
| Boredom | 0 to 100 | Doing nothing interesting, staying indoors | Reading, TV, music, cooking, going outside | Leads to unhappiness |
| Unhappiness | 0 to 100 | Boredom, eating bland or rotten food, wet, pain, killing | Good food, reading magazines/comics, alcohol, cigarettes for smokers | Slower actions, eventually severe depression |
| Stress | 0 to 1 | Zombies nearby, smoking withdrawal, injuries | Rest, sleeping, cigarettes | Worse aim, slower actions |
| Panic | 0 to 100 | Seeing zombies (scales with number and distance), trait dependent | Time away from zombies; drops as weeks pass (character "gets used to it") | Huge aim penalty, blurry vision at high level |
| Body temperature | ~35 to 40 °C | Heat, clothes, exertion, fever | Cold, wind, wet clothes | Hypothermia or hyperthermia, both can kill |
| Wetness | 0 to 100 | Rain, swimming | Drying near heat, changing clothes | Colder, unhappy, catching a cold |
| Weight | ~35 to 130 kg | Calorie surplus | Calorie deficit | Underweight and Overweight traits get added or removed |
| Health | 0 to 100 | Healing over time | Wounds, bleeding, sickness, starvation | Death at 0 |

**Starting values (per in game hour at rest).** Hunger +0.008, thirst +0.012, fatigue +0.025 awake, boredom +2 indoors with nothing to do. Multiply by 1.5 to 2.0 during heavy exertion. A fully rested character can stay awake around 16 to 18 hours before Tired appears.

**Recreation notes.** Put all stats in one `Stats` component. Every tick, run a list of small "stat processors" (hunger processor, temperature processor) that read traits and environment and change the stats. This keeps it easy to add new effects later.

### 4.6 Status icon system (the "moodles")

**How it works.** A column of small icons at the top right of the screen. Each icon shows one condition and has up to four severity levels, shown by colour and a background tint (green for good, yellow to red for bad). Hovering shows a short name and a one line description. They appear and disappear automatically as stats cross thresholds. This is the main way the game talks to the player. Around 20 core types exist, and Build 42 added a few, like a separate "food eaten" fullness one.

Core list: Hungry, Thirsty, Tired, Endurance (exhausted), Heavy Load, Panic, Stress, Bored, Unhappy, Pain, Bleeding, Injured, Sick (nausea, food poisoning or infection symptoms), Has a Cold, Drunk, Wet, Windchill, Hypothermia, Hyperthermia, Zombie Infection symptoms, Dead (on death), Stuffed (overeating, a positive one), Well Fed, Angry, plus the Build 42 additions.

**Thresholds (starting).** Level 1 at 0.15, level 2 at 0.25, level 3 at 0.45, level 4 at 0.70 of each stat's range, with custom thresholds per stat where it makes sense.

**Recreation notes.** Design your own icon art and names (see the renaming table). Data driven definitions: id, linked stat, thresholds, colour per level, tooltip text per level, and a list of gameplay effects per level, for example level 3 Tired gives `action_speed x0.8, melee_damage x0.85`.

### 4.7 Health and medical system

**How it works.** The body is split into 17 parts: head, neck, upper torso, lower torso, groin, and left and right upper arm, forearm, hand, thigh, shin and foot. Each part can have several injuries at once. The health panel shows a body diagram with injured parts highlighted and a list of injuries per part.

Injury types:
- **Scratch:** minor, bleeds a little, heals in a few days.
- **Laceration (deep cut):** bleeds more, heals slower, benefits from stitches.
- **Bite:** from zombies, always infected with the zombie virus (see 4.8).
- **Deep wound:** heavy bleeding, needs stitches, can have glass or debris stuck in it.
- **Glass shards:** from climbing through broken windows. Need removing with tweezers or by hand.
- **Bullet lodged:** needs removing with tweezers or suture needle holder.
- **Fracture:** from falls, car crashes or heavy hits. Needs a splint. Takes weeks to heal. Big speed or combat penalty depending on part.
- **Burn:** from fire. Needs bandaging. Prone to infection.
- **Wound infection (normal, not zombie):** happens if a wound is left dirty or unbandaged, treated with disinfectant or antibiotics.

Treatments: bandage (clean, dirty or ripped sheet), disinfectant (alcohol, disinfectant, wipes), stitches (needle and thread), splints (plank or branch plus ripped sheets), tweezers, painkillers, antibiotics, plantain/comfrey/garlic poultices from foraging. Dirty bandages must be changed. The First Aid skill makes treatment faster and wounds heal quicker.

Other conditions: food poisoning (from rotten or raw food), common cold (from wetness and cold), drunkenness, smoking withdrawal, nausea from corpse smell when many dead bodies are near.

**Starting values.**
- Scratch heals in 3 to 5 in game days, laceration 6 to 10, deep wound 10 to 15, fracture 20 to 40.
- Bleeding drains 0.5 to 3 health per in game hour depending on type.
- Unbandaged wounds: 10% chance per in game day of becoming normally infected, 30% if bandage is dirty.

**Recreation notes.** `BodyPart` objects each holding a list of `Injury` objects with type, severity, bleeding rate, bandaged flag, bandage dirty flag, infected flag, heal time remaining. The health panel is just a view onto that. This system has a lot of rules, so give it its own milestone and unit tests.

### 4.8 Zombie infection

**How it works.** Getting hurt by a zombie rolls for the virus. Under default settings the chances are 7% for a scratch, 25% for a laceration and 100% for a bite. The game never tells you directly that you rolled infected. Instead, symptoms appear gradually as moodles (queasy, feverish, sick) over about two to three in game days, health drops, and then the character dies and reanimates as a zombie. There is no cure in the base game. The same symptoms can occur from a normal wound infection or food poisoning, so for a scratch the player spends a day not knowing. Animals can't catch it.

Sandbox options change it: transmission can be "blood and saliva" (default rolls above), "saliva only" (only bites infect), "everyone's infected" (you turn on death no matter how you died) or "none". Mortality changes the time to death, from instant to never, and reanimation delay can also be changed.

**Starting values.** Scratch 7%, laceration 25%, bite 100%. Time from infection to death 48 to 72 in game hours. Reanimation 0 to 60 in game seconds after death.

**Recreation notes.** Roll once when the injury is created, store a hidden `infected` flag on the character. Give the infection a progression curve that drives fake looking symptoms. The uncertainty after a scratch is a big part of the game's drama, so don't show the roll result anywhere in the UI.

### 4.9 Zombies

**How it works.**

*Default "lore".* Slow shambling walkers, normal strength, normal toughness, poor cognition (can't open doors, only bash them), short to normal memory, normal sight and hearing. A random percentage can be set to sprinters. Some zombies are crawlers (legs damaged), some lie still and "play dead" until you get close. Zombies get weaker or slower in winter if that option is on.

*Senses.*
- **Sight:** a cone in front of them, reduced at night, in fog or rain, and by the player sneaking, being in darkness or behind cover.
- **Hearing:** every noisy action creates a "sound event" with a radius and a volume. Zombies inside the radius head towards the source. Examples: gunshot (huge), car engine and horn, smashing a window, house or car alarm, breaking down a door, chopping trees, generators, loud TV or radio, shouting.
- **Memory:** after losing sight of the player, a zombie walks to the last known position and searches for a while before giving up.

*Behaviour states.* Idle (standing, swaying), wandering, following a sound, chasing a seen player, attacking (lunging, grabbing), thumping (bashing a door, window or wall), eating corpses, fallen down, crawling.

*Attacks.* When in range a zombie lunges. If it connects, the player gets a hit on a random body part weighted by direction. Clothing protects against bites and scratches by body part. Getting attacked from behind is much more dangerous. Two or more zombies grabbing the player at once can trigger the "dragged down" death animation, which is an instant kill.

*Damage to the world.* Zombies bash doors, windows, barricades and player built walls. Each has hit points. Hordes can break almost anything given time.

*Population and migration.* Zombies are spread across the map with more in towns. They gather into groups over time ("rally group size") and drift between areas. Loud global meta events (gunshots far away, helicopters, alarms) pull them around. A "peak day" setting makes the population grow to a maximum some days into the game. Optional respawn slowly refills areas that the player hasn't visited for a while.

*Corpses.* Killed zombies leave corpses that rot, attract flies and make the player nauseous in large numbers, and can be burned or buried. Build 42 added dragging corpses around.

**Starting values.**
- Shambler 0.9 tiles/s, fast shambler 1.6 tiles/s, sprinter 5.0 tiles/s.
- Sight range 14 tiles by day, 5 at night, 90 degree cone. Hearing radius set by each sound event.
- Memory 30 to 90 in game seconds of searching after losing the player.
- Zombie health 1.5 to 2.5 "hits worth" on normal toughness. Headshots and stomps on downed zombies do bonus damage.
- Door bash: a wooden door takes 30 to 60 zombie hits.

**Recreation notes.** This is the biggest technical challenge. To get hundreds or thousands of zombies:
- Split zombies into **active** (near player, full AI, animation, pathfinding) and **virtual** (far away, stored only as a position and target, moved cheaply on a coarse grid). Promote to active when a chunk loads.
- Use a **flow field** or shared path for groups chasing the same target rather than one A* per zombie.
- Update far zombies less often (every 0.5 to 2 seconds) than near zombies (every frame).
- Sound events go into a spatial hash so zombies look up only nearby sounds.

### 4.10 Noise, light and stealth

**How it works.** Sneaking reduces footstep noise and the distance zombies notice you from. Being in darkness helps a lot, and so does turning lights off inside your base. Lights visible through windows at night (lamps, a TV glow, a fire) can attract attention. Running and sprinting are loud. Walking through tall grass and trees slows you but hides you a little. Traits like Inconspicuous and Conspicuous scale how easily you are spotted.

**Starting values (noise radius in tiles).**

| Action | Radius |
|---|---|
| Sneaking footsteps | 1 to 2 |
| Walking | 4 |
| Running | 8 |
| Sprinting | 12 |
| Shove or melee hit | 6 |
| Smashing a window | 20 |
| Bashing or breaking a door | 15 |
| Shouting | 25 |
| Car engine idle / driving / horn | 20 / 30 / 50 |
| Pistol shot | 50 |
| Shotgun or rifle shot | 70 to 100 |
| House alarm | 100 for several in game minutes |
| Generator running | 20 |
| Chopping a tree | 15 |

### 4.11 Combat

**Melee.** Hold the aim key and click to swing. Each weapon has: category (blunt, small blunt, long blade, short blade, axe, spear), damage range, swing time, range, hit arc, knockback power, crit chance, endurance cost, condition (durability), and whether it can hit multiple targets at once. Damage scales with the matching weapon skill, strength and character state (tired, panicked, exhausted). Swing timing and spacing matter more than speed. Weapons lose condition on hits and can break. In Build 42 some weapons track head and handle condition separately and blades go dull.

**Shove and stomp.** The spacebar (or an unarmed attack) shoves a zombie away, doing no damage but often knocking it down. Stomping a downed zombie's head finishes it with no weapon wear. Shove, step over, stomp is the bread and butter of early game fighting and uses very little endurance compared to swinging.

**Multi hit.** A sandbox option. When off (the default), most weapons only hit one zombie per swing, which makes groups much more dangerous.

**Firearms.** Pistols, revolvers, shotguns and rifles. Need ammo, magazines, loading, chambering and reloading (each a timed action). Accuracy depends on the Aiming skill, panic, stress, tiredness and distance. Reloading speed comes from the Reloading skill. Every shot is a huge sound event, so guns solve one problem and create a bigger one. Build 42 changed aiming to target specific body locations.

**Endurance in combat.** Every swing costs endurance. When endurance runs low the character slows down, swings become slow and weak, and the player can no longer sprint away. Fitness and strength reduce the cost.

**Starting values.**

| Action | Endurance cost |
|---|---|
| Light swing (knife, pan) | 3 to 5% |
| Medium swing (bat, pipe) | 6 to 10% |
| Heavy swing (axe, sledge) | 12 to 18% |
| Shove | 4 to 7% |
| Stomp | 2 to 3% |

- Base crit chance 10% to 30% depending on weapon, plus 2% per weapon skill level, x3 against zombies attacked from behind.
- Shove knockdown chance 30% base, +5% per strength level, +20% against zombies attacked from behind.

### 4.12 Skills and progression

**How it works.** Every skill has levels 0 to 10. XP is earned by doing the thing: swinging an axe trains Axe, cooking trains Cooking, building trains Carpentry. Skill books (volumes 1 to 5, each covering two levels) don't give XP, they give an **XP multiplier** for those levels once read. Recipe magazines teach specific recipes. Some TV and VHS programmes give small amounts of XP. Strength and Fitness are special passive skills that rise very slowly from exercise and activity and fall if neglected, and they also control your Weak/Strong and Unfit/Athletic traits.

Build 42 has roughly 30 to 35 skills grouped like this:

- **Passive:** Fitness, Strength.
- **Agility:** Sprinting/Running, Lightfooted, Nimble (move faster while aiming), Sneaking.
- **Combat:** Axe, Long Blunt, Short Blunt, Long Blade, Short Blade, Spear, Maintenance (slows weapon wear).
- **Firearm:** Aiming, Reloading.
- **Crafting:** Carpentry, Cooking, Electrical, Welding (metal walls and torch work), Blacksmithing (forge), Mechanics, Tailoring, Pottery, Glassmaking, Knapping, Carving, Masonry.
- **Farming and survival:** Agriculture, Animal Care, Butchering, Fishing, Trapping, Foraging, First Aid, Tracking.

**Starting values.**
- XP to reach each level: 75, 150, 300, 750, 1500, 3000, 4500, 6000, 7500, 9000 (cumulative growth, tune freely).
- Book multipliers: x3 for book 1, x5 book 2, x8 book 3, x12 book 4, x16 book 5 (only for the levels the book covers).
- Fast Learner trait +30% XP, Slow Learner -30%.

**Recreation notes.** Skills as data: id, group, xp curve, and a list of effects per level (action speed, success chance, unlocked recipes). Systems ask `skill_level("carpentry")` rather than knowing about XP.

### 4.13 Inventory

**How it works.** Weight based, not slot based. Every item has a weight. The character has a carry capacity based on strength. Going over it gives the Heavy Load icon which slows you and drains endurance. Bags (backpacks, duffel bags, school bags, hiking bags) are equipped on the back or held in hand and add capacity while reducing the weight of what's inside by a percentage. You can hold one item in your primary hand and one in the secondary (or one two handed item). There is a hotbar with slots provided by belts and holsters.

The inventory screen is two panels: your inventory (with tabs for each bag) on one side and the "loot" panel on the other, showing every container within reach (the floor, a fridge, a crate) as tabs. Moving items between them is a **timed action** that scales with weight and the Organized/Disorganized traits. Containers in the world each have their own capacity.

**Starting values.**
- Base carry capacity 8 + strength level x 1.0 (so 13 at average strength 5).
- Backpack: capacity 15 to 22, weight reduction 50% to 70%.
- Transfer time 0.5 in game seconds per weight unit, x0.7 if Organized.

**Recreation notes.** Containers are just item lists with capacity and a weight reduction value. Items stack by type where it makes sense. The two panel layout and drag to transfer are key to the feel. Don't skip the transfer timer.

### 4.14 Items and loot distribution

**How it works.** Thousands of items: food (canned, fresh, frozen, ingredients), drinks, medical supplies, weapons, tools, clothing, bags, books, magazines, building materials (planks, nails, screws, sheet metal), electronics (radios, batteries, generators), car parts, fuel cans, seeds, fishing gear, literature for boredom, and Build 42 adds many crafting materials.

Loot spawns according to **distribution tables keyed by room type and container type**. A kitchen counter rolls from kitchen counter items, a gun store locker rolls from gun store items, and so on. A global "loot rarity" setting scales everything, and specific categories (food, weapons, medical, literature) can be tuned separately in Build 42. Containers are filled the first time they are seen, not at world creation.

**Recreation notes.** Data files:
- `items/*.json` with id, display name, category, weight, icon, tags (for example `can_open_cans`, `sharp`, `liquid_container`) and category specific data (nutrition for food, damage stats for weapons, insulation for clothing).
- `loot_tables/*.json` mapping `room_type + container_type` to weighted item lists with roll counts.
- Use **tags** instead of exact item names in recipes, for example a recipe needs "any item with tag `can_opener`". This is how the original stays flexible and it will make your tweaks much easier.

### 4.15 Crafting and building

**How it works.**

*Recipes.* A crafting window lists recipes by category, shows required inputs, tools, skill levels and output, and greys out what you can't do. Some recipes must be learned first from magazines or occupation. Right click on an item shows quick crafts that use it. Build 42 rebuilt this: inputs are selectable, recipes are searchable by input or output, you can batch craft, and many recipes need a **workstation** nearby (workbench, forge, kiln, pottery wheel, anvil, drying rack). Build 42 also added a full tech tree: knapping stone tools, carving wooden parts, pottery for crucibles, blacksmithing metal items, masonry for stone and clay walls, glassmaking, food preservation, and weapons built from separate heads and handles.

*Building.* A separate build menu places constructions on the grid: wooden walls, floors, doors, windows frames, stairs, crates, furniture, rain collector barrels, compost bins, fences, and in later levels metal walls. Each costs materials (planks, nails, screws, sheet metal) and needs a skill level. Placement shows a ghost preview, then the character walks over and does a timed action. Player built objects have hit points that zombies can damage.

*Barricading.* Doors and windows can be barricaded with up to four planks (hammer and nails) or sheet metal. Each plank adds hit points against zombies. Barricades can be removed with a claw hammer or crowbar.

*Dismantling.* Furniture and objects can be disassembled for materials with the right tool (saw, screwdriver, hammer), which also trains skills.

**Recreation notes.** One recipe data format for everything: inputs (by tag and amount), tools (by tag, consumed or not), required skill levels, required workstation, time, XP awarded, outputs. Building pieces are recipes whose output is a world object instead of an item.

### 4.16 Food, cooking and nutrition

**How it works.** Every food has calories, carbs, fats, proteins, a hunger reduction value, unhappiness and boredom change, and a freshness timer. Fresh food goes fresh → stale → rotten. Fridges slow spoilage a lot and freezers stop it, but only while there's power. Canned and dry food lasts basically forever. Raw meat, fish and some vegetables must be cooked or risk food poisoning. Cooking happens on a stove, oven, microwave, campfire or barbecue, and can burn food if left too long.

Players can build "evolved recipes" by adding ingredients to a base (a pot of water becomes soup or stew, bread becomes a sandwich). Each added ingredient adds its nutrition, and the Cooking skill reduces waste and improves the result. Spices and good ingredients reduce unhappiness.

Calories control body weight. Eating too much makes you gain weight and eventually get the Overweight and Obese traits (slower, worse endurance). Too little makes you lose weight, with Underweight, Very Underweight and Emaciated (weaker, worse at everything). Weight changes slowly over weeks.

**Starting values.**
- Daily need 2,000 to 2,500 kcal at normal activity, up to 3,500 when very active.
- Weight change: roughly 1 kg per 7,700 kcal surplus or deficit (real world figure).
- Fresh to stale: bread 3 days, milk 3 days, meat 2 days, vegetables 4 to 7 days. Stale to rotten: double those. Fridge multiplier x0.3, freezer x0.

### 4.17 Water

**How it works.** Before the water shutoff, sinks, bathtubs and toilets give unlimited clean water. After the shutoff the remaining water in pipes and tanks is limited, then players have to collect rain in barrels (build them), take water from rivers, lakes and wells, and boil it (on a stove or campfire) or treat it with bleach to make it safe. Drinking tainted water causes sickness. Any container with the right tag can hold liquid (bottles, pots, buckets, bowls, water dispensers). Build 42 added mixing liquids.

### 4.18 Electricity and generators

**How it works.** Before the power shutoff, lights, fridges, ovens, TVs and radios in houses work. The shutoff date is random within a sandbox range. The radio's emergency broadcast gives a warning a couple of days before. After that, players need a **generator** (rare, heavy, needs to be found and moved with a car). Generators need fuel, make a lot of noise, produce dangerous fumes if run indoors, wear out over time and need the Electrical skill (or a magazine) to connect. They power everything within a radius around them. Fuel comes from gas station pumps (need power until the shutoff, then need a generator or are empty) and from siphoning car tanks.

**Starting values.** Generator radius 20 tiles horizontally and 3 levels vertically. Full tank lasts around 1 in game day under typical load. Water shutoff random between day 0 and day 30. Power shutoff random between day 14 and day 30 (based on the Apocalypse preset).

### 4.19 Farming, foraging, fishing, trapping and animals

**Farming.** Dig furrows with a trowel or shovel on grass or dirt, plant seeds, water them (rain helps), wait for growth stages, harvest. Crops can be hit by disease (mildew, flies, aphids) which needs treatment sprays. Build 42 made crops seasonal: each crop has good planting months and months where it will fail, and growth takes a realistic amount of time.

**Foraging.** A search mode that reveals small foraged items (berries, mushrooms, herbs, insects, stones, branches, medicinal plants) in a radius, based on the Foraging skill, terrain type, season, time of day and weather. Some berries and mushrooms are poisonous and the player only learns which ones with skill.

**Fishing.** Rod or spear in water tiles. Build 42 made it interactive: splashes show where fish are, noise scares them away, chum attracts them, and you need to manage the line while reeling in.

**Trapping.** Build traps (box traps, snares, cages, fish traps), bait them, place them in the right terrain away from your base, come back later to collect animals.

**Animals (Build 42).** Wild and farm animals with their own AI, needs (food, water, comfort), breeding, products (milk, eggs, wool), butchering into meat and leather, and tracking via prints and droppings.

### 4.20 Vehicles

**How it works.** Cars, vans, pickups, police cars, ambulances, sports cars. Each has a 2D overhead driving model in an isometric view, seats, a trunk, glove box, fuel tank, engine, battery, tyres, brakes, suspension, doors, windows, headlights and a radio. Every part has a condition. Most cars are locked and need a key (found on zombie bodies, in nearby houses or in the ignition) or **hotwiring** (needs Electrical and Mechanics skill or the burglar job). Driving makes a lot of noise. Crashes damage the car and can injure or kill the driver. Running over zombies damages the car. Parts can be swapped and repaired with the Mechanics skill (some parts need a magazine to learn that car type). Cars can tow trailers.

**Recreation notes.** Keep it simple and arcade like at first: a top down car physics model (velocity, steering angle, friction), turned into isometric positions for drawing. Add parts and conditions later.

### 4.21 Weather, seasons, temperature and clothing

**How it works.** A full weather system: sunny, cloudy, rain, heavy storms with thunder (thunder is a sound event), fog, snow, wind, and temperature that follows season and time of day. Rain makes you wet. Wind chill makes you colder. Snow piles up.

Clothing is layered with slots (hat, mask, eyes, neck, jacket, shirt, t-shirt, pants, underwear, socks, shoes, gloves, belt, back). Each item has insulation, wind resistance, water resistance, **bite defence and scratch defence per body part it covers**, a condition and holes. Zombie attacks can tear holes in clothes, reducing protection. Clothes get dirty and bloody and can be washed. The Tailoring skill lets you patch holes and add padding. Military, police and leather clothing gives good defence.

**Starting values.** Leather jacket: 40% scratch, 25% bite on torso and arms. Denim: 25% scratch, 10% bite on legs. Motorbike helmet: 80% scratch, 60% bite on head. Each hit has a chance to create a hole that removes the protection for that part.

### 4.22 World events and the "director"

**How it works.** Rather than scripted missions, a light "director" creates pressure:
- **Helicopter event:** an unseen helicopter flies over and then follows the player if they are outside, pulling every zombie in a wide area towards them. Default timing is once, between days 6 and 9, between 9 AM and 7 PM.
- **Meta sounds:** distant gunshots, screams and dog barks that the player hears but can't find, which move zombie groups around the map.
- **House and car alarms:** random chance when breaking into a house or a car.
- **Sleeping events:** a chance the character is woken by nightmares or noises, sometimes with a zombie at a window.
- **Power and water shutoff:** with radio warnings for power.
- **Fires:** from cooking or Molotovs, spreading across tiles.
- **Randomised stories:** small staged scenes placed around the world (a car crash, a camp site, a barricaded house with a body, a bandit hideout) that tell micro stories.

### 4.23 Radio, TV and environmental storytelling

**How it works.** In the first days, TV channels and radio stations broadcast news, government updates, a call in show, a cooking show and a "Life and Living" type channel whose programmes give small skill XP (this is genuinely useful). Broadcasts get more desperate each day, then stop. A separate emergency broadcast system on a radio frequency gives weather forecasts and the power warning. Amateur radio operators can sometimes be heard later.

**Recreation notes.** Write your own lore and broadcast scripts (this is one place where Opus 5.5 can help a lot). Store broadcasts as a schedule: channel, day, hour, list of lines, and optional effects (XP to a skill, reduce boredom).

### 4.24 Mental health and boredom

**How it works.** Staying indoors with nothing to do, eating the same bland food or doing repetitive tasks builds boredom. Boredom builds unhappiness, which slows everything down. Reading magazines and comics, watching TV, listening to music, cooking good food, going outside, drinking alcohol and smoking (for smokers) all help. Killing zombies, seeing corpses and being injured also wear on the mind early on, though the character slowly gets desensitised over weeks.

### 4.25 Sleep

**How it works.** Sleeping in a bed is best, sofas and floors are worse and can leave you sore or in pain. You can only sleep when tired enough (Insomniac and Restless Sleeper traits affect this). While you sleep, time skips fast, but zombies can arrive. Alarm clocks and watches let you set a wake up time. Waking up from a nightmare or sleeping in a bad spot gives pain or stress.

### 4.26 Death and persistence

**How it works.** On death, a "you died" screen shows survival time and kills. The save continues in the same world: the player can make a new character who spawns elsewhere in the same world. The old body reanimates (if the infection was the cause or "everyone's infected" is on) and keeps all its gear. The world keeps its state: looted houses, built bases, burned buildings.

### 4.27 Game modes and sandbox settings

**Presets in Build 42:** Apocalypse (canon default), Outbreak (faster progression), Rising (cosier), Extinction (brutal), plus Custom Sandbox where every option can be changed, and Challenges (for example a winter start, a skyscraper top start, an all sprinter world).

**Main sandbox options to support** (put all of these in one settings file):
- Population: zombie count multiplier (0 to 4), population start and peak multipliers, peak day, respawn hours and amount, rally group size and distance.
- Zombie lore: speed (shamblers, fast shamblers, sprinters, random with sprinter %), strength, toughness, transmission, mortality time, reanimation time, cognition (can open doors or not), memory, sight, hearing, environmental attacks, slow in cold, crawl under vehicles, drag down.
- Time: day length, start month, start time.
- World: water shutoff range, electricity shutoff range, loot rarity per category, erosion speed, nature abundance, farming speed, house alarm frequency, locked house frequency, generator spawn rate, vehicle spawn rate.
- Character: XP multiplier, starter kit, free trait points, stat decrease rate, injury severity, clothing degradation, rear vulnerability, multi hit, kill counts.
- Meta: helicopter frequency, meta event frequency, sleeping events, fire spread.

### 4.28 User interface

The UI is a big part of the feel. Key screens and elements:
- **HUD:** status icon column top right, small health/clock/temperature info, equipped primary and secondary items bottom left, hotbar along the bottom, timed action progress bar over the character's head.
- **Right click context menus** on everything in the world: open, loot, barricade, climb through, disassemble, drink from, plant, fill bottle, turn on. This is the main interaction method. Options appear only when they make sense and greyed out options explain what is missing.
- **Inventory and loot panels** (Section 4.13).
- **Health panel** with body diagram.
- **Skills panel** with level bars and multipliers.
- **Crafting window** and **build menu**.
- **Map** that starts unknown and gets filled in as you explore or read maps found in the world, with player annotations.
- **Info panel** showing traits, weight, temperature.
- **Speed controls** for fast forward.
- **Character creation** screens.
- **Death screen.**

### 4.29 Audio

- Ambience: wind, rain, birds by day, crickets by night, distant thunder.
- Zombie moans and footsteps, door thumps, window smashes.
- Player: footsteps on different surfaces, breathing when tired, coughs and sneezes, grunts when hit, and Build 42 style vocal cues.
- Weapons: swings, impacts, gunshots, reloads.
- Adaptive music: a calm exploration layer that rises in intensity when zombies are seen or chasing, and a stinger when one gets close unseen.
- Spatial audio: sound volume and panning from source position, muffled through walls.

---

## 5. What makes the "feel" right (details people forget)

These small things matter more than any single big feature. Make sure they are in the build.

1. **Nothing is instant.** Even eating a chocolate bar has a short progress bar. Any action is cancelled if you move or get attacked.
2. **Zombies notice you before you notice them** if you aren't careful. The vision cone and darkness are the reason.
3. **Doors and windows are tactical.** Closing doors behind you, opening windows quietly vs smashing them, curtains, climbing through a broken window and getting glass in your arm.
4. **Rear attacks are deadly.** Being grabbed from behind is the most common way to die. A zombie lunging from a blind spot should be a real threat.
5. **The first bite is the end.** No healing it. The silence after a bite should be heavy.
6. **Fear fades.** The character panics hard on day 1 and gets calmer by week 2. Don't make panic static.
7. **Loot makes sense.** Kitchens have food and knives, garages have tools, bathrooms have medicine. Players learn to read buildings.
8. **The world remembers.** Every looted container stays looted, every broken window stays broken, every corpse stays until it rots or is burned.
9. **The radio and TV fade out.** One of the most effective bits of storytelling in the game.
10. **Small comfort matters.** A good meal, a book, a TV show and a warm dry bed make a real numeric difference.

---

## 6. Recommended technical approach

### 6.1 Engine choice

**Recommended: Godot 4 (latest stable 4.x), using GDScript with static typing.**

Why it fits this project better than the alternatives when an AI agent is doing most of the building:
- Scenes, resources and project settings are plain text files, so Claude can read and write *everything* directly, including scenes, without needing to click around an editor.
- The engine is small, free and fast to start. Claude Code can run the game or headless tests from the terminal and read the output, which makes the build, run, fix loop work well.
- Good 2D and 3D, built in navigation, tilemaps and gridmaps, lighting and an orthographic camera.

**Alternative: Unity.** You already know Unity from your course, and it would work. The downside is that scenes and prefabs are big YAML files that are awkward for an agent to edit, and a lot of setup is normally done by clicking in the editor, so you'll end up doing more manual steps yourself. If you prefer Unity, swap the engine line in the master prompt and tell Claude to build scenes from code at runtime wherever possible.

### 6.2 Visual approach: 2.5D

The original draws the world from 2D isometric tile sprites and the characters as 3D models. For your build, the easier path is a **3D world laid out on a tile grid, viewed through a fixed orthographic camera at the classic isometric angle** (camera rotated 45 degrees around the vertical axis, tilted about 30 to 35 degrees down). This gives you:
- Correct draw ordering for free (the hardest part of real 2D isometric games).
- Real lighting and shadows for the night, flashlights and the Build 42 style lighting.
- Easy multi floor buildings and wall cutaways.
- Line of sight by raycasts.
- Characters animated with standard 3D animation.

Placeholder art first (boxes, capsules, coloured tiles), then swap in real art once systems work.

### 6.3 Architecture rules

1. **Simulation separate from presentation.** Game state (stats, items, zombie positions, world tiles) lives in plain data and logic classes. Nodes, meshes and UI just display it. This makes saving, testing and fast forward much easier.
2. **Data driven content.** Items, recipes, loot tables, traits, occupations, moodles, skills, zombie lore presets, sandbox settings and broadcasts all live in JSON (or Godot `.tres` resources) under a `data/` folder. Code never hardcodes an item name.
3. **Tags over names.** Recipes and actions check tags (`can_opener`, `sharp`, `hammer`, `fuel_container`).
4. **Fixed simulation tick.** For example 10 sim ticks per in game minute equivalent, decoupled from frame rate. Fast forward runs more ticks per frame.
5. **Timed action system.** A single `ActionQueue` on the character. Every action (eat, loot, bandage, build, transfer) is a `TimedAction` with duration, a progress callback, a completion callback and cancel rules. This is the backbone of the game.
6. **Event bus.** Sound events, damage events, item events. Systems subscribe rather than calling each other directly.
7. **Chunked world.** Fixed size chunks loaded around the player, saved to disk when unloaded.
8. **Two tier zombies.** Active and virtual (Section 4.9).
9. **Save system from early on.** Every system has `serialize()` and `deserialize()`.
10. **Debug tools from day one.** A debug overlay (FPS, tick time, zombie counts, stats), a console with commands (spawn zombie, give item, set time, heal, toggle god mode, set stat), and a sandbox settings file you can edit.

### 6.4 Suggested folder structure

```
project/
  CLAUDE.md               <- the master prompt (Section 11.1)
  docs/
    DESIGN.md             <- this blueprint, trimmed to the design parts
    PROGRESS.md           <- what is done, what is next, known bugs
    DECISIONS.md          <- short log of design and tech decisions
  data/
    items/  recipes/  loot/  traits/  occupations/  skills/
    moodles/  zombies/  sandbox/  broadcasts/  buildings/
  src/
    core/        (tick, time, events, save)
    world/       (chunks, tiles, generation, buildings, erosion)
    actors/      (player, zombies, animals, stats, body/health)
    systems/     (needs, temperature, infection, noise, vision, weather)
    items/       (inventory, containers, loot, crafting)
    ai/          (zombie brain, pathfinding, flow fields, hordes)
    vehicles/
    ui/
    debug/
  assets/
    placeholder/  models/  textures/  audio/  ui/
  tests/
```

### 6.5 Performance targets

- 60 FPS with 150 active zombies on screen on a mid range PC.
- 10,000+ virtual zombies tracked across the map.
- Chunk load under 50 ms.
- Fast forward x40 with no zombies nearby should stay smooth.

---

## 7. Asset plan (100% original or properly licensed)

### 7.1 Rules

- No assets, textures, sounds, music, fonts, UI icons or text taken from Project Zomboid or its mods.
- No reference images traced or copied. Describe the *style* you want in words instead ("muted early 90s suburban palette, slightly desaturated").
- Only use third party assets whose licence you have checked and that allow use in your own game. Keep a `CREDITS.md` file listing every asset and its licence.

### 7.2 Where to get assets

| Need | Options |
|---|---|
| Placeholder art | Procedural: Claude can generate simple meshes and coloured materials in code. Do this first. |
| 3D environment kits | Kenney (kenney.nl) packs are CC0 (free for any use). Other CC0 sources include Quaternius and Poly Haven. Always double check each pack's licence. |
| Your own models | You already model in Blender. Houses, furniture and props in a low poly style are well within reach and give the game its own identity. |
| Characters and animation | Your own Blender rig, or a CC0 low poly character pack plus animation retargeting. Check animation licences carefully. |
| Textures | Poly Haven (CC0), or hand painted pixel style textures like you did for Underwater Store. |
| Sound effects | Freesound (check each sound: CC0 is easiest, CC-BY needs credit), Kenney audio packs (CC0), or record your own. |
| Music | Write your own (you play piano, so a sparse melancholic piano soundtrack would suit this genre really well), or use properly licensed tracks. |
| UI icons | Draw your own. Status icons are a big part of the identity, so make them yours. |
| Fonts | Google Fonts / OFL licensed fonts. |

### 7.3 Art direction suggestion

Pick a look that is clearly yours. Options that would work well:
- **Low poly, flat shaded** with strong night lighting (cheap to make, very readable).
- **Pixel art textures on low poly models** (ties into your existing Roblox art direction and VHS overlay experience).
- **Muted painterly** close to the original's mood but in your own style.

A VHS or CRT post process filter, a strong colour grade for day and night, and good fog would go a long way, and you've already done similar work.

---

## 8. Renaming table (avoid protected names)

Use your own names for everything below. These are suggestions only.

| Original thing | Avoid | Replace with (example) |
|---|---|---|
| Game title | Project Zomboid | Your own title |
| Setting region | Knox Country / Knox County | A fictional county with your own name |
| The outbreak and the virus | Knox Event, Knox Infection | Your own name for the virus and event |
| Towns | Muldraugh, West Point, Riverside, Rosewood, Louisville, March Ridge etc | Generated or invented town names |
| Mascot | Spiffo (the raccoon) | Your own mascot, or none |
| Status icons | "Moodles" and their icon designs | Your own name (for example "Vitals") and your own icons |
| TV channels and shows | Life and Living TV, Triple-N, KnoxTalk etc | Your own channels and scripts |
| Emergency radio | AEBS | Your own emergency service name |
| Brand names on items | Any brands from the game | Invented brands |
| Item and weapon names | Generic names are fine (baseball bat, crowbar, hammer). Avoid the game's invented gun model names and branded items | Generic or your own invented names |
| Lore text, broadcasts, notes | Anything written in the game | Write fresh |
| Death screen phrase | "This is how you died" | Your own line |
| Developer name | The Indie Stone | Don't reference them in game |

Generic gameplay terms (scratch, laceration, sprinter, shambler, barricade, generator, sandbox) are fine to use.

---

## 9. Scope: what to build first and what to leave

**Must have for it to feel like the game (core):** isometric view with vision cone and darkness, a generated town with enterable buildings, shambling zombies with sight and hearing, sound events, melee with shove and stomp, endurance, timed actions, needs and status icons, body part health with bites and infection, weight based inventory with world containers and room based loot, barricading, food spoilage and power/water shutoff, skills with XP and books, permadeath with sandbox settings.

**Should have (makes it deep):** character creation with traits and jobs, full medical, cooking and nutrition with body weight, temperature and clothing protection, crafting and building, weather and seasons, the helicopter and meta events, generators, vehicles, farming and foraging, radio and TV.

**Nice to have (Build 42 extras and polish):** basements and tall buildings, animals and husbandry, the full crafting tech tree with workstations, weapon head and handle parts, endless wilderness, fishing minigame, ragdolls, adaptive music, 3D item placement, liquid mixing.

**Skip entirely (per your brief):** multiplayer, Steam integration, modding API, anti cheat, server tools.

---

## 10. Build roadmap (milestones)

Each milestone should end with something you can **play and test**. Don't move on until the current milestone works. The first point where it feels like "the game" is the end of M6.

| # | Milestone | Playable result |
|---|---|---|
| M0 | Project setup | Empty project runs, folder structure, `CLAUDE.md`, docs, debug console, sim tick, in game clock, git repo |
| M1 | World foundation | Chunked tile world, procedural small town (roads, lots, houses with rooms, doors, windows, furniture), isometric ortho camera with zoom, floor cutaway |
| M2 | Player and vision | Player moves (walk, run, sprint, sneak), collision, opens/closes doors, climbs through windows, vision cone and line of sight, day and night lighting, flashlight |
| M3 | Timed actions, stats and status icons | Action queue with progress bars and cancelling, all core needs ticking, status icon HUD with tooltips, eat/drink/sleep basic actions, fast forward controls |
| M4 | Zombies | Active and virtual zombies, sight, hearing, memory, wander, chase, lunge, door and window bashing, sound event system, debug view of senses |
| M5 | Combat and basic health | Melee weapons, shove, stomp, endurance cost, crits, knockdown, weapon condition, 17 body parts with scratch/laceration/bite, bleeding, bandages, death screen and reanimation |
| M6 | Inventory and loot | Weight based inventory, bags, hands, hotbar, world containers, two panel loot UI, transfer timers, room based loot tables, 80 to 120 starter items |
| M7 | Save/load and sandbox | Full save and load of world, player, zombies and containers. Sandbox settings file and a new game screen with presets |
| M8 | Full medical and infection | All injury types, treatments, healing over time, normal wound infection, the zombie virus with hidden roll and symptom progression, health panel UI |
| M9 | Survival systems | Food freshness and cooking, nutrition and body weight, water sources and boiling, power and water shutoffs, fridges, weather, temperature, wetness, clothing layers with protection and holes |
| M10 | Character and skills | Character creation with jobs, traits and points, all skills with XP and levels, skill books and recipe magazines, panic decay over time, boredom and unhappiness sources |
| M11 | Crafting and building | Recipe system and crafting window, build menu with ghost placement, carpentry, barricades, dismantling, rain barrels, generators |
| M12 | The director | Hordes and migration, meta sounds, helicopter event, house and car alarms, sleeping events, respawn and peak day settings, fires |
| M13 | Vehicles | Driving, keys and hotwiring, fuel and siphoning, parts and conditions, crashes, running over zombies, trunks |
| M14 | Living off the land | Farming with seasons, foraging mode, fishing, trapping |
| M15 | World story | Radio and TV schedule with your own scripts, emergency broadcasts, random staged stories, notes, map item and exploration map |
| M16 | Presentation pass | Real art, audio, adaptive music, UI skin, post processing, menus, settings |
| M17 | Build 42 extras | Basements and tall buildings, animals, workstation crafting tech tree, weapon parts, wilderness beyond the map, ragdolls, anything else you want |

After M17 you are into "make it your own" territory, using the tweak template in Section 11.5.

---

## 11. The prompt pack

### How to set this up

1. Install Claude Code and make sure you're using Opus 5.5.
2. Install Godot 4 (latest stable) and make sure the `godot` command works in your terminal (Claude Code will need to run it).
3. Create an empty project folder and `git init` it.
4. Save **this whole document** into that folder as `docs/DESIGN.md`.
5. Save the master prompt from 11.1 as `CLAUDE.md` in the project root.
6. Open Claude Code in that folder and paste the kickoff prompt from 11.2.
7. For each later milestone, start a fresh session and paste the matching milestone prompt from 11.3.

Fresh sessions per milestone keep the context clean. `CLAUDE.md`, `docs/DESIGN.md` and `docs/PROGRESS.md` carry everything across sessions.

---

### 11.1 Master prompt (save as `CLAUDE.md`)

```markdown
# Project brief for Claude

You are the lead developer, technical designer and gameplay programmer on a solo
game project. I am the owner and designer. You do the building, I play test and
make design calls.

## The game
We are making an original isometric open world zombie survival sandbox for
single player PC. Its gameplay is closely modelled on Project Zomboid (Build 42
era): permadeath, slow systemic survival, timed actions, needs and status icons,
body part injuries with a hidden infection roll, noise driven zombie AI, weight
based inventory with room based loot, barricading, crafting and building,
utilities shutting off, skills that level from use and books, and deep sandbox
settings. There is no win condition. The goal is to survive as long as possible.

The full research and design reference is in docs/DESIGN.md. Treat it as the
source of truth for how systems should behave. When DESIGN.md gives "starting
values", put them in data files as tunable defaults.

## Hard rules: original content only
- Never use, copy, recreate or reference any assets, sounds, music, icon designs,
  written lore, broadcast scripts, place names, brand names, mascot or map layout
  from Project Zomboid or its mods. Mechanics are fine. Expression is not.
- Use the replacement names in DESIGN.md section 8, or invent new ones and log
  them in docs/DECISIONS.md.
- Never put "Project Zomboid", "Knox", "Spiffo", "moodle" or the original town
  names in code, data, UI or comments that ship with the game. Comments in docs
  may reference the original only to explain where a mechanic came from.
- Only add third party assets I have approved, with their licence recorded in
  CREDITS.md. Default to procedural placeholder art.

## Tech stack
- Engine: Godot 4 (latest stable 4.x). Language: GDScript with static typing.
- 2.5D: a 3D world laid out on a tile grid, viewed by a fixed orthographic camera
  at an isometric angle (45 degree yaw, about 30 to 35 degree pitch).
- Target: Windows desktop, keyboard and mouse first. Controller later.
- Version control: git. Commit at the end of every working step with a clear
  message.

## Architecture rules (follow these strictly)
1. Simulation is separate from presentation. Game state lives in plain logic
   classes and data. Nodes only display it. Nothing important is stored only in
   a node.
2. Data driven. Items, recipes, loot tables, traits, occupations, skills, status
   icons, zombie lore presets, sandbox settings and broadcasts live under data/
   as JSON. Never hardcode content in scripts.
3. Tags over names. Recipes and actions check item tags, not item ids.
4. Fixed simulation tick decoupled from frame rate. All gameplay timers run in
   in game minutes so fast forward works by running more ticks.
5. All player activity that takes time goes through the TimedAction system with
   duration, progress, completion and cancel rules.
6. Systems talk through an event bus (sound, damage, item, time events) rather
   than calling each other directly.
7. World is chunked and streamed around the player.
8. Zombies are two tier: full AI when near the player, cheap virtual simulation
   when far away.
9. Every stateful system implements serialize() and deserialize() from the start.
10. Traits, moodles and skills apply effects through a shared modifier system
    that other systems query (for example get_modifier("hunger_rate")).
11. Keep it simple. Build the simplest version that meets the milestone, but
    structure it so it can grow. Don't add features I didn't ask for.

## Working method (every task)
1. Read docs/PROGRESS.md and the relevant sections of docs/DESIGN.md first.
2. Write a short plan (what files, what classes, what data, how I will test it)
   before writing code. For big tasks, show me the plan and wait for my OK.
3. Build in small vertical slices. After each slice, run the project (or the
   headless tests) and fix every error and warning before moving on.
4. Write unit tests for simulation logic (stats, injuries, infection rolls,
   inventory weight, loot rolls, recipes, save/load round trips). Put them in
   tests/ and run them.
5. Add debug tools for every system you build: overlay info and console
   commands so I can test it quickly.
6. When you finish, update docs/PROGRESS.md (done, next, known issues) and
   log any design or tech decisions in docs/DECISIONS.md.
7. End every task with a short summary: what you built, how to test it in game
   (exact keys and console commands), what is not done yet, and any decisions I
   need to make.

## Quality bar
- The game must always run. Never leave the project broken at the end of a task.
- No silent failures. Log clear errors when data is missing or invalid, and
  validate all data files on startup.
- Tunable numbers belong in data files, not in code.
- Readable code: clear names, small functions, a short comment at the top of
  each file explaining what it does.
- Performance targets: 60 FPS with 150 active zombies on screen, 10,000+
  virtual zombies tracked, chunk loads under 50 ms.

## When you are unsure
- If DESIGN.md covers it, follow DESIGN.md.
- If it is a small detail, pick the option most faithful to the feel described
  in DESIGN.md sections 1 and 5, and note it in DECISIONS.md.
- If it is a real design choice that changes how the game plays, ask me before
  building it.

## Things not to do
- Don't build multiplayer, networking, mod support or store integration.
- Don't delete or rewrite large working systems without asking.
- Don't change data values I have tuned unless I ask.
- Don't move to the next milestone on your own.
```

---

### 11.2 Kickoff prompt (paste into the first Claude Code session)

```
Read CLAUDE.md and all of docs/DESIGN.md carefully before doing anything.

We are starting milestone M0 (project setup). Do the following:

1. Confirm in a few sentences that you understand the game, the design pillars,
   the original content rules and the architecture rules. Point out anything in
   DESIGN.md that is unclear, contradicts itself or that you think is a
   technical risk, and suggest how to handle it.
2. Propose the full architecture: main autoloads/singletons, the core classes
   for the sim tick, game clock, event bus, TimedAction system, modifier system,
   data loader with validation, save system and debug console. Show it as a
   short list with one line per class and how they connect.
3. Wait for my OK.
4. Then build M0:
   - Godot 4 project with the folder structure from DESIGN.md section 6.4
   - Sim tick and in game clock (start date and day length from a sandbox
     settings JSON), with pause and fast forward x1, x2, x3, x4
   - Event bus
   - Data loader that loads and validates every JSON file in data/ and reports
     errors clearly
   - Debug overlay (FPS, sim tick time, in game date and time, speed) toggled
     with F3
   - Debug console toggled with ` (backtick) with a command registry and
     starter commands: help, time set, speed, quit
   - A minimal test runner that can be run headless from the terminal
   - docs/PROGRESS.md, docs/DECISIONS.md and CREDITS.md
   - .gitignore for Godot
5. Run the project and the tests, fix any errors, commit, then give me the end
   of task summary.
```

---

### 11.3 Milestone prompts

Use one per session. Each one assumes `CLAUDE.md` is loaded automatically.

**Template (use this shape for any milestone):**

```
Read docs/PROGRESS.md, then docs/DESIGN.md sections [X, Y, Z].

We are on milestone [M#: name]. The goal is: [one sentence playable result].

Must include:
- [feature]
- [feature]

Out of scope for this milestone: [list].

Plan first and wait for my OK. Then build it in vertical slices, running the
game and tests after each slice. Add debug commands for testing everything
you build. Finish with the end of task summary and update PROGRESS.md.
```

**M1: World foundation**
```
Read docs/PROGRESS.md, then DESIGN.md sections 4.1, 4.2, 6.2 and 6.3.

Milestone M1: World foundation. Goal: I can fly a debug camera around a
procedurally generated small town made of enterable buildings.

Must include:
- Chunked tile world (32x32 tiles per chunk, 8 levels), chunk loading and
  unloading around a focus point, seeded generation
- Tile data: floor, north wall, west wall, object, flags (blocks movement,
  blocks sight, door, window)
- Town generator: road grid, lots, houses from room layout templates (stored
  as data), room types (kitchen, bedroom, bathroom, living room, garage),
  doors, windows, basic furniture and container objects placed by room type,
  one or two simple two storey houses with stairs
- A few larger "landmark" templates: a small store, a gas station, a
  warehouse
- Orthographic isometric camera with smooth zoom
- Floor cutaway: hide levels above the focus level, fade south and east walls
  of the room near the focus point
- Placeholder art generated in code (coloured tiles, box walls, simple
  furniture shapes)
- Debug commands: regen [seed], tp x y z, chunk info overlay

Out of scope: player character, zombies, lighting.
Plan first and wait for my OK.
```

**M2: Player and vision**
```
Read docs/PROGRESS.md, then DESIGN.md sections 4.1, 4.10 and 5.

Milestone M2: Player and vision. Goal: I can walk my survivor around the town,
go in and out of houses, and the vision cone and darkness make it feel tense.

Must include:
- Placeholder player character (capsule with a facing indicator is fine)
- WASD movement relative to screen, mouse aim when holding right mouse,
  walk/run/sprint/sneak with speeds from data
- Collision with walls and objects, open/close doors, climb through open
  windows and over low fences as short timed actions (stub the TimedAction if
  M3 isn't done, but use its interface)
- Field of view: shadowcasting line of sight on the tile grid plus a vision
  cone, out of sight tiles faded dark, entities on unseen tiles hidden
- Day and night lighting tied to the in game clock, interior lights,
  flashlight toggle (F)
- Camera follows player, cutaway follows player level
- Debug: toggle FOV off, show vision cone, set time of day

Out of scope: zombies, needs, inventory.
Plan first and wait for my OK.
```

**M3: Timed actions, stats and status icons**
```
Read docs/PROGRESS.md, then DESIGN.md sections 4.3, 4.5, 4.6, 4.24, 4.25 and 5.

Milestone M3: Timed actions, stats and status icons. Goal: my character
gets hungry, thirsty, tired, bored and stressed over time, status icons
appear with tooltips, and I can eat, drink and sleep using timed actions.

Must include:
- Full TimedAction system: queue, progress bar above the character, cancel on
  move or damage, speed modifiers
- Stats component with all stats from DESIGN.md 4.5 and data driven
  "stat processors"
- Modifier system that traits, status icons and skills will use later
- Status icon definitions in data (id, linked stat, thresholds, colours,
  tooltip text per level, effects per level) and the HUD column top right
  with placeholder icons and hover tooltips
- Effects from status icons actually applied (slower actions, slower movement
  etc) through the modifier system
- Basic eat, drink and sleep actions (debug spawned food and water is fine),
  sleeping skips time and wakes when rested or when disturbed
- Fast forward that drops to x1 when a threat is visible (stub the check)
- Debug: stat set [name] [value], show all stats overlay

Out of scope: real items and inventory, health and injuries.
Plan first and wait for my OK.
```

**M4: Zombies**
```
Read docs/PROGRESS.md, then DESIGN.md sections 4.9, 4.10, 6.3 and 6.5.

Milestone M4: Zombies. Goal: the town has zombies that shamble around, notice
me by sight and sound, chase me, lose me and bash doors.

Must include:
- Zombie lore settings from the sandbox file (speed types incl. random with
  sprinter %, sight, hearing, memory, cognition)
- Sound event system with radius and volume, spatial lookup; hook up player
  footsteps by movement mode, door slams, window smash
- Zombie brain states: idle, wander, investigate sound, chase, search last
  known position, attack (lunge stub), thump door/window/barricade
- Zombie sight with cone, range, light level and sneak modifiers
- Pathfinding through buildings; shared flow field for many zombies chasing
  the same target
- Active vs virtual tiers with promotion/demotion when chunks load/unload,
  far zombies updated less often
- Population spawning by area density from sandbox multiplier, more in town
- Crawlers and a small chance of lying "fake dead" zombies
- Door and window hit points; zombies can break them
- Debug: spawn zombie [n] [type], show senses overlay, show sound events,
  zombie count overlay (active/virtual), freeze AI
- Performance check against the targets in CLAUDE.md, report the numbers

Out of scope: damage to the player (just log hits), combat.
Plan first and wait for my OK.
```

**M5: Combat and basic health**
```
Read docs/PROGRESS.md, then DESIGN.md sections 4.7, 4.8 (basic), 4.11,
4.26 and 5.

Milestone M5: Combat and basic health. Goal: I can fight zombies with a bat
or bare hands using shove and stomp, they can hurt and kill me, and on death
I get a death screen and my body rises.

Must include:
- Weapon definitions in data (category, damage, swing time, range, arc,
  knockback, crit, endurance cost, condition)
- Aim and swing, hit detection in an arc, multi hit as a sandbox option
- Shove (space), knockdown chance, stomp on downed zombies
- Endurance cost and low endurance penalties
- Zombie attacks: lunge, grab, rear attack bonus, drag down when grabbed by 2+
- 17 body parts, injuries (scratch, laceration, bite) chosen by hit direction,
  bleeding, simple bandage action, health drain and natural healing
- Hidden infection roll per injury from sandbox values (symptoms can be simple
  for now, full version comes in M8)
- Death screen with days survived and kills, reanimation of the player body
- Debug: god mode, give weapon, injure [part] [type], show hitboxes

Out of scope: full medical, inventory UI (equip weapons by debug command).
Plan first and wait for my OK.
```

**M6: Inventory and loot**
```
Read docs/PROGRESS.md, then DESIGN.md sections 4.13, 4.14 and 5.

Milestone M6: Inventory and loot. Goal: I can search houses, loot containers
that make sense for the room, manage weight and bags, and equip what I find.

Must include:
- Item definitions in data with tags; create 80 to 120 starter items across
  food, drinks, medical, weapons, tools, bags, clothing (basic), books,
  materials
- Containers (world and bags) with capacity and weight reduction, primary and
  secondary hand, two handed items, back slot, hotbar with belt slots
- Carry capacity from strength, Heavy Load status icon
- Two panel inventory/loot UI with tabs per container in reach, drag to
  transfer, transfer as timed actions
- Loot tables by room type and container type, rolled the first time a
  container is opened, global loot rarity setting
- Right click context menu framework for world objects and items (eat, drink,
  equip, open, loot, drop)
- Keys and locked doors basics
- Debug: give [item] [n], show loot table for container under cursor

At the end of M6, play the game for a full in game day yourself in a headless
or scripted test and report anything that feels broken.
Plan first and wait for my OK.
```

**M7 to M17** follow the template with these design sections:

| Milestone | DESIGN.md sections to read |
|---|---|
| M7 Save/load and sandbox | 4.26, 4.27, 6.3 |
| M8 Full medical and infection | 4.7, 4.8 |
| M9 Survival systems | 4.16, 4.17, 4.18, 4.21 |
| M10 Character and skills | 4.4, 4.12, 4.24 |
| M11 Crafting and building | 4.15, 4.18 (generators) |
| M12 The director | 4.9 (population), 4.22, 4.27 |
| M13 Vehicles | 4.20 |
| M14 Living off the land | 4.19 |
| M15 World story | 4.22 (stories), 4.23, 4.28 (map) |
| M16 Presentation pass | 4.28, 4.29, 7 |
| M17 Build 42 extras | 2, 4.15, 4.19 |

---

### 11.4 Session resume prompt (when you come back after a break)

```
Read CLAUDE.md, docs/PROGRESS.md and docs/DECISIONS.md. Run the game and the
tests and tell me the current state: what works, what is broken and what the
next step on the current milestone is. Don't change anything yet.
```

### 11.5 Tweak and feature request template (making it your own)

```
I want to change how [system] works.

Current behaviour: [what happens now]
What I want instead: [what should happen]
Why: [the feeling or gameplay goal, e.g. "nights should feel scarier"]
Must keep: [anything that shouldn't change]

First tell me which files, data and systems this touches, any knock on
effects on other systems or balance, and whether it should be a sandbox
option instead of a hard change. Wait for my OK, then build it, test it,
update DESIGN.md if the design changed, and log it in DECISIONS.md.
```

### 11.6 Bug report template

```
Bug: [one line]
Steps to reproduce: [1, 2, 3]
Expected: [...]
Actual: [...]
Errors in the output (if any): [paste]
Save file / seed (if relevant): [...]

Find the root cause before fixing. Add a test that fails because of this bug,
fix it, make the test pass, and check nothing else broke.
```

### 11.7 Balance pass prompt

```
Read DESIGN.md section 3.3 and 5. Write a scripted simulation that runs an
idle character, a cautious looter and a reckless fighter for 30 in game days
each, using current data values, and report: time to first hunger/thirst
icon, days of food in an average house, zombies killed per weapon break,
endurance per fight, how often scratches become infections, and when
utilities shut off. Compare against the phase timings in section 3.3 and
suggest data value changes. Don't apply them until I say so.
```

---

## 12. Tips for getting the best out of Opus 5.5

- **One milestone per session.** Long sessions drift. Fresh sessions plus `PROGRESS.md` work better.
- **Always ask for a plan first** on anything bigger than a small tweak. It is much cheaper to fix a plan than a pile of code.
- **Play test after every milestone yourself.** Claude can't feel whether a fight is tense. Write down what feels off in plain words and use the tweak template.
- **Give feelings, not just numbers.** "Zombies spot me way too easily at night" is a great prompt. Claude can then find the right values.
- **Keep the data files as your tuning playground.** Once the systems exist, you can change most of the game by editing JSON yourself without any prompting.
- **Commit often.** If a session goes wrong, `git reset` back to the last good commit instead of trying to untangle it.
- **Watch for scope creep.** If Claude starts building things from later milestones, tell it to stop and stick to the current one.
- **Your existing skills help.** You already know Blender, game feel work, atmosphere passes and VHS style overlays from your other projects. M16 is where those pay off.

---

## 13. Sources

Research for this document drew on the official Build 42.20 features overview (projectzomboid.com, The Indie Stone), the community PZ Wiki (pzwiki.net) pages on the zombie virus and the helicopter/metagame events, and community guides covering sandbox options, skills, combat, moodles and utility shutoffs (pzfans.com, xgamingserver.com, build42guide.wiki, projectzomboid.wiki, bisecthosting.com, logicservers.com, shockbyte.com). Starting values marked as such are suggestions for tuning and are not datamined from the game. Exact in game values change between patches, so treat them as a starting point and tune by feel.

---

# Part B: As built (updated 16 Oct 2026, v1.10.2)

## B1. Difficulty survey: Day After Dawn against the original (updated)

The original's column uses its default **Apocalypse** settings (Build 42). Our column is the **Canon** preset.

*Correction to v1.7:* the memory row said our zombies remembered you for 18 seconds. In practice they gave up the chase after 4.5 seconds and drifted off. As of 1.8 they behave as in the row below.

| What | The original | Day After Dawn | Verdict |
|---|---|---|---|
| Infection: scratch / laceration / bite | 7% / 25% / 100% | Same | Same |
| Infection to death | 2 to 3 days | 48 to 72 hours | Same |
| Zombie type | Shamblers | Shamblers | Same |
| One zombie per swing | Yes | Yes | Same |
| Dragged down when surrounded | On | On | Same |
| Path around obstacles, can't open doors | Yes | Yes | Same |
| Stealth rules | As researched | Matched in 1.6 | Same |
| Zombie sight by day | About 18 to 19 tiles | 18 (since 1.8) | Same |
| Window and fence lunges | On | On (since 1.8) | Same |
| Memory once sight is lost | About 6 seconds, then where they last sensed you | 6 seconds, then last seen plus heading, then a search (since 1.8) | Same |
| Doors, windows and planks | Minutes, 10 to 15 seconds, about 5× the window | Same (since 1.8) | Same |
| Thumping until it breaks or something distracts them | Yes | Yes (since 1.8) | Same |
| Hotbar slots from belts and holsters | Yes | Yes (since 1.8) | Same |
| Respawn | None | None | Same |
| **Population growth** | ×1.0 rising to ×1.5 by day 28 | Fixed | **Easier later on** |
| **Loot** | Most categories 0.6 to 0.8 | Canon ×0.85 (now applied properly) | **A little easier** |
| **Knife takedowns** | Chance from the knife skill | Our own odds | **Probably easier** |
| **Eye and sound meter** | Not in the original | On unless you pick Hardcore HUD | **Easier** (optional) |
| Water and power | Random, within the first month | 3 to 8 and 4 to 10 days in | Harder |
| Helicopter | Days 6 to 9 | Days 2 to 4 | Earlier |
| Length of a day | 1 real hour | 24 real minutes by default (selectable) | Different |

## B2. The ten difficulty options: where they stand

| # | Option | Status |
|---|---|---|
| 1 | Zombie sight to the original's range | **Done in 1.8** (18 tiles by day, 6 at night) |
| 2 | Window and fence lunges | **Done in 1.8** |
| 3 | Population growth | Explained below. Proposed for harder presets, waiting on your decision |
| 4 | Stingier loot | Surveyed (section 5). The multiplier was fixed so presets mean what they say. Harder presets proposed below |
| 5 | Takedown odds from knife skill | **On the future changelog** (section 10) |
| 6 | Hotbar from belts, holsters and slings | **Done in 1.8** |
| 7 | Hardcore HUD | **Done in 1.8** |
| 8 | Zombie memory as in the original | **Done in 1.8** |
| 9 | Utilities and helicopter on the original's schedule | Explained below. Not changed, because it would make the early game easier |
| 10 | Presets | Already in: Survivor, Apocalypse ("Canon"), Builder and Extinction. Missing: a Sandbox where you set every number |

**Population growth (option 3).** In the original the number of zombies in the world isn't fixed. It starts at the normal level and rises to one and a half times that by day 28. So the longer you survive, the more of them there are, and cleared towns slowly fill again from outside. Ours stays at its starting number for the whole run, which makes late game easier than the original. The natural home for this is the harder presets.

**Utilities and the helicopter (option 9).** In the original, water and power each fail on a random day within the first month, and the helicopter comes on day 6 to 9. Ours fail on days 3 to 8 (water) and 4 to 10 (power), and the helicopter comes on days 2 to 4.
- **What it would add:** uncertainty about when things fail, and a slower fade of civilisation.
- **What it would cost:** on average it gives you about a week more of running water and electricity.
- **Real time:** our default day is 24 real minutes against the original's hour, so in real time ours already fail far sooner.

My recommendation is a per-preset setting: the original's random window on an easier preset, and ours on Canon and above. I haven't changed it, because it would make Canon easier.

**A proposed preset ladder** (for your decision):

| Preset | Zombies | Growth | Loot | Utilities |
|---|---|---|---|---|
| Builder | ×0.35 | None | ×1.4 | Original's random month |
| Survivor | ×0.8 | None | ×1.15 | Original's random month |
| Canon (today) | ×1.0 | None | ×0.85 | Ours (days 3 to 10) |
| Apocalypse+ (new) | ×1.0 | To ×1.5 by day 28 | ×0.7 | Ours |
| Extinction | ×1.5 | To ×2.0 by day 28 | ×0.55 | Ours, earlier |

Plus a **Sandbox** that exposes every number: zombie count, growth, loot by category, sight, hearing, memory, sprinters, shutoff days and day length.

## B3. Loot survey

**Method:** every container in 60 houses and 8 of each shop type was rolled under each preset, twice. The table shows averages per building. Houses vary a lot from run to run, so treat house figures as about ±20%.

| Preset (loot) | House: calories | House: drinks | House: medical | House: guns | Corner store: calories | Pharmacy: medical |
|---|---|---|---|---|---|---|
| Builder (×1.4) | about 2,350 | 2.2 | 1.1 | 0.15 | about 12,200 | 27 |
| Survivor (×1.15) | about 1,950 | 1.6 | 0.95 | 0.15 | about 9,100 | 23 |
| Canon (×0.85) | about 1,300 | 1.2 | 0.65 | 0.1 | about 7,300 | 16 |
| Extinction (×0.7) | about 1,150 | 1.0 | 0.6 | 0.07 | about 6,000 | 14 |

**Other buildings:**
- **A gun store** holds 2 to 3 guns and 65 to 150 rounds.
- **A police station** holds about one gun and 70 rounds, plus nightsticks.
- **Hardware stores** carry tools and melee weapons, and no food.
- **An average house** has about 6 containers.

**Reading it:**
- **Houses:** our body-weight system burns about 2,100 calories a day, so on Canon an average house feeds you for about half a day. Survival depends on shops, farming, trapping and hunting, which is the right shape.
- **The original:** most houses have fridges full of food that spoils within days, plus cupboards of tins. My impression is that a house there carries rather more food early on and spoils faster, but I couldn't find hard numbers.
- **Calibrating:** before tuning further, I'd suggest playing a few days on Canon and Extinction to see whether food pressure feels right.

**Possible next steps for loot:**
- **Per-category multipliers,** as the original has (food, tinned food, weapons, medical, ammo, other).
- **Spoilage pressure:** fuller fridges early on that rot within days.
- **Gradual looting:** a slow fall in loot the further you are from where you started, since survivors have looted the nearest places first.

## B4. What Day After Dawn has that the original doesn't

- **The visibility eye and the sound meter.** These are now optional (Hardcore HUD hides them).
- **Knife takedown percentages:** ours, not the original's.
- **Herd moans and the search step:** chasing zombies moan and nearby zombies follow, and after losing you they search for 8 to 15 seconds. Both are our own tuning of behaviours the original has in other forms.
- **Lit windows:** they show you to zombies outside. The original works by sight through windows too; the strength is ours.
- **Automatic quality:** a technical feature, not gameplay.
- **Simplified versions of the original's systems:** body weight, fishing, trapping odds, farming (5 crops), animals (no feeding or breeding), blacksmithing and fire.

The hotbar, lunges, sight range and zombie memory used to be on this list and now match the original.

## B5. How crafting works

**Opening it.** Press B. Recipes are grouped into tabs (Survival, Medical, Tailoring, Cooking, Carpentry, Carving, Trapping, Fishing, Farming, Electrical, Primitive, Metalwork, Repair and Build), and you can search by name or by ingredient.

**Reading the list.** Each recipe has a dot:
- **Green:** you can make it now.
- **Amber:** you know it but something is missing.
- **Grey:** you haven't learned it.

**What a recipe needs.** Click a recipe to see each requirement with a tick or a cross:
1. **Ingredients:** used up, and taken from your pockets, bag and any container within reach (counters, shelves, crates, the floor, a car trunk). "Uses" means part of an item, like a length of thread.
2. **Tools:** kept. They work by what they do, so any knife or scissors cuts cloth and any hammer drives nails.
3. **Skill:** the level you need.
4. **Workstation:** cooking needs a fire or stove, smithing needs a forge and anvil, and firing clay needs a kiln. A table nearby speeds up ordinary crafting.
5. **Knowledge:** advanced recipes are learned from magazines, from your job or a trait (the Farmer job and Gardener trait know the crop sprays), or automatically once your skill is high enough.
6. **Ingredients you choose:** dishes like soup take a range of ingredients. More ingredients make it more filling, and more variety makes it nicer to eat.

**Building.** Use the Build tab and press "Place it", then click a spot nearby. A green or red preview shows whether it fits. New in 1.7 is the butcher hook (Carpentry 3).

**Out in the world.** Everything else is in the E menu:
- **Doors and windows:** barricade them, or weld metal over them.
- **Furniture and appliances:** strip them for scrap.
- **Ground:** dig clay at riverbanks and dig worms anywhere.
- **Rocks:** break off stones and flint.
- **Water:** fish there.
- **Traps:** bait them and empty them.
- **Plots:**
  - plant, water and harvest
  - pull weeds and spray disease
  - fertilise
- **Animals:**
  - butcher carcasses
  - milk, shear, collect eggs and pet livestock

---

## B6. How stealth and zombies work

**Two senses.** Zombies find you by sound and by sight. The sound meter and the eye show how much of each you're giving off, unless you play with the Hardcore HUD.

**Hearing.** A sound brings every zombie in its radius to investigate. They route to it and break through doors and windows on the way. Thumping draws more of them.

**Sight.** It works in steps:
1. A zombie has to have you in its narrow vision cone, within about 18 tiles by day (much less at night unless you're lit), and in line of sight.
2. Its awareness then builds, faster the more visible, central and close you are.
3. Half aware, it turns to look. Fully aware, it chases.

**Losing them.**
- About 6 seconds out of sight and a chaser goes to where it last saw you, a step further the way you were going.
- If a door or window is in the way, it starts thumping, and keeps at it until it breaks through, something distracts it, or about four minutes pass.
- Otherwise it searches for a while and gives up.

So:
- Break line of sight.
- Don't run for the obvious door.
- Make noise elsewhere to pull them off.
- Leave by another exit.

**Reach.** Nobody hits through walls or closed windows. Climbing through a window or over a fence next to an alerted zombie risks being grabbed.

**Staying unseen.**
- Approach from behind or the side.
- Crouch.
- Stay out of light: turn your flashlight off and switch house lights off with L.
- Use trees, bushes, fences, cars and furniture as cover.

**Animals.** They have their own senses, and gunshots scatter everything nearby.

## B7. Research for future additions (aim: a realistic, living world)

From this round's research into Build 42 and the plans for Build 43:

- **Animal husbandry in depth:** feeding troughs, water, hutches, breeding and young, stress (from zombies, engines, gunfire and crowding), leading animals with a rope, livestock trailers, and dung for compost.
- **Tracking skill:** footprints, droppings and resting spots shown in search mode (V), so you can follow deer.
- **Farming in depth:** dozens of crops with planting months, compost bins, a seed library, and preserving the harvest (jars, drying, freezers).
- **Brewing:** beer and wine, and fluid mixing in containers.
- **Glassmaking:** jars, bottles and windows from sand.
- **A cleaning system:** blood on floors and walls that you can scrub with a mop and bleach.
- **Vertical world:** skyscrapers up to 32 floors, sewers, tunnels and panic rooms.
- **Lighting:** light that bounces off walls and leaks through gaps, and shadows from the sun moving through the day.
- **New buildings and clothing:** SWAT gear, sports uniforms and more distinctive buildings.
- **Survivors (planned for Build 43):** other people with their own camps, trading and danger. The biggest step toward a world that feels lived in.

---

## B8. Future changelog and next steps

- **Done in 1.9:** population growth, the preset ladder and Sandbox, per-category loot, utilities by preset, and takedown odds.
- **Animal care:** feeding, breeding and stress. (Tracking added in 1.9.2.)
- **Farming extras:** more crops, compost and preserving food.
- **Taller buildings:** high-rises beyond 7 floors, and sewers.
- **Firearm extras:** gun attachments and ammo crafting.
- **Vehicles:** towing and mechanics magazines.
- **Brewing, glassmaking and cleaning blood.**
- **Survivors.**

## B9. Lighting, atmosphere and sound: survey and as built (16 Oct 2026, v1.12)

**What the original does** (research R30 to R32): light spreads from the sun and bulbs through rooms; windowless rooms stay dark at noon; sunset glow creeps red through windows; nights are darker with more contrast; your eyes adjust over 10 to 20 seconds; it uses warm 1990s bulbs; and the top-down identity is kept, not photorealism. Its ambience shifts between outdoors and indoors, and distant screams and dogs are atmosphere only.

| Area | Before 1.12 | Now (1.12) |
|---|---|---|
| Sun and shadows | One fixed "afternoon" angle drawn into the ground | The sun crosses the sky. Shadows swing west to east, stretch long at sunrise and sunset, shorten at noon, soften under cloud, and disappear at night. Tall props (water towers, silos, lamps, poles) cast them too |
| Colour by time of day | A flat olive grade, darker at night | Dawn pink, neutral day, golden hour, blue hour, moonlit blue night, greyer in rain |
| Interiors | All rooms lit the same | Lit by their windows: windowless rooms dark at noon, a red sunset glow in rooms with windows, lit rooms bright when the power is on |
| Eyes | Instant | Step into darkness and you're half blind, clearing over about 20 seconds; stepping into bright light gives a brief glare |
| Light colour | Warm lamps and windows | Plus cool fluorescent light from powered shops, headlight beams, and soft contact shadows under furniture |
| Clouds | None | Soft cloud shadows drift across the ground on clear days |
| Ground detail | Litter, cracks, stains, tufts, flowers | Plus weeds in pavement cracks and fallen leaves under trees |
| Life and motion | Trees sway, rain, dust motes, flies | Plus footprints in snow and mud for you and nearby zombies, dust when running on dry ground, falling leaves in autumn, fireflies on summer nights, bird flocks overhead, and a glance around when you stand still |
| Ambience | Wind, rain, birds, crickets, owls, dogs, creaks, a fridge, lamp buzz | Plus beds that follow where you are: leaves in the wind near trees, water near ponds, wind between buildings (stronger high up), indoor room tone, and an underground drone. One-shots: woodpeckers and thrush trills, frogs at night, a ticking clock, dripping taps, thumps heard from a basement, and distant screams and sirens early on (atmosphere only) |

**Performance:** measured on the same machine against the same scenarios, the game's own drawing time is within about 1ms of 1.11, because the shadow layer is drawn at half resolution and reused while the camera and sun are still. The full-screen colour layers cost more on a software renderer than on a graphics card, and automatic quality steps them down on slow machines.

| Scenario | Drawing time, 1.11 | Drawing time, 1.12 |
|---|---|---|
| Town by day | 11.6ms | 11.6ms |
| Night in rain | 22.7ms | 23.2ms |
| Forest | 2.8ms | 2.8ms |
| Mall upstairs | 10.9ms | 12.0ms |
| 60-zombie chase | 18.8ms | 18.8ms |
| Zoomed out | 17.0ms | 17.5ms |


## B10. Performance design (16 Oct 2026, v1.13)

How the game keeps its frame rate, after the 1.13 profiling pass:

- **Drawing:** the ground, walls, furniture, roofs and shadows are drawn once into cached images and reused. Effects that cover the whole screen use only ordinary translucent layers, never advanced blend modes, which force a graphics card to copy the screen. Colour grading for time of day, weather and the game's olive cast is combined in code into one layer plus the vignette.
- **Lower-resolution layers:** the night darkness layer and the sun-shadow layer are drawn at half resolution. The shadow layer is drawn larger than the screen and slid as you move.
- **Automatic quality and resolution:** effects step down on slow machines (since 1.7), and since 1.13 the internal resolution steps between 1.5× and 0.7× depending on frame time.
- **Simulation:** only zombies within about 150 tiles, plus any chasing you, are live. The rest are stored with their area and restored when you return, as the original stores zombies in unloaded chunks. Path searches are budgeted per frame. Buildings are indexed by map area and rooms by building, so nothing per frame scans the whole world.


---

# Part C: Archive of superseded sections

These are earlier versions of Part B sections, kept for the record. Where they disagree with Part B, Part B is current. For example, the v1.7 difficulty survey's memory row was corrected in v1.8.

## C1. From the v1.6 document (14 Oct 2026)

### 2. How crafting works

**Opening it.** Press B. Recipes are grouped into tabs (Survival, Medical, Tailoring, Cooking, Carpentry, Carving, Trapping, Fishing, Electrical, Primitive, Metalwork, Repair and Build), and you can search by name or by ingredient.

**Reading the list.** Each recipe has a coloured dot:
- **Green:** you can make it now.
- **Amber:** you know it but something is missing.
- **Grey:** you haven't learned it yet.

**What a recipe needs.** Click a recipe to see its requirements, each with a tick or a cross. They come in six kinds:
1. **Ingredients:** used up. They come from your pockets, your bag and any container within reach (counters, shelves, crates, the floor, a car trunk), as in the original. "Uses" means part of an item, such as one length of thread from a spool or a strip of duct tape.
2. **Tools:** kept, not used up. Tools work by what they do, so any knife or scissors cuts cloth, a hammer or stone hammer drives nails, and a shovel or trowel digs.
3. **Skill:** the level you need.
4. **Where:** some recipes need a workstation nearby. Cooking needs a fire or a working stove, smithing needs a forge and anvil, and firing clay needs a kiln. A table or counter nearby speeds up ordinary crafting.
5. **Knowledge:** advanced recipes must be learned first, from the right magazine (read it from your inventory). Many are also learned automatically a level or two above the skill they need.
6. **Ingredients you choose:** evolved dishes take a range (soup takes 2 to 5). Each one adds its nutrition, and variety makes the meal nicer to eat.

**Crafting.** Press Craft, Craft 5 or Craft all. Your character works through it as a timed action that is cancelled if you move or get hit, makes noise if it involves hammering, and earns XP.

**Building.** Use the Build tab, pick a recipe and press Place it. Then click a spot near you, which shows a green or red preview. Built walls and doors have hit points, and zombies will try to break through them.

**In the world.** Everything else is in the E menu where it belongs:
- **Doors and windows:** barricade them, or weld metal over them.
- **Furniture and appliances:** strip them for scrap.
- **Ground:** dig clay at riverbanks and dig worms anywhere.
- **Rocks:** break off stones and flint.
- **Water:** fish there.
- **Traps:** bait them and empty them.
- **Plots:** plant, water and harvest.
- **Noise devices:** set them, then switch them on or start the timer.

**A first-week path:**
1. Rip clothes into rags and make bandages.
2. Find a needle and thread to patch your clothes.
3. Get a hammer and nails for barricades and walls.
4. Find a screwdriver to strip electronics and fix up noise makers.
5. Get a shovel to start a farm plot and dig worms for fishing.
6. Later, with clay, stone and a magazine, set up a kiln and forge, and eventually make your own nails and blades.

---

### 3. How stealth works

**Two senses.** Zombies find you by sound and by sight. The sound meter shows how far your noise is carrying; the eye shows how visible you are.

**Hearing.** A sound draws every zombie within its radius to come and investigate. Footsteps are the constant one: sneak (C) to cut them to a whisper.

**Sight.** It works in steps:
1. A zombie has to have you in its vision cone (which is narrow), within range (about 18 tiles by day, much less at night) and in line of sight.
2. Its awareness then builds. How fast depends on how visible you are, how central you are in its view and how close you are.
3. Half aware, it turns and comes to look. Fully aware, it chases.

**Staying unseen.**
- Approach from behind or the side.
- Crouch.
- Stay out of light: turn your flashlight off, avoid street lamps, and switch house lights off with L.
- Use trees and bushes, and keep fences, cars and furniture between you and them.

**Losing a chase.** Break line of sight, turn corners and keep moving. A zombie that loses you searches where it last saw you, then gives up.

---

### 4. What's still not in, and good next steps
- **Bigger buildings:** two-storey malls and true high-rises with many floors.
- **Firearm extras:** gun attachments like scopes and suppressors, and ammo crafting. The original doesn't craft complete rounds either.
- **Animals:** living animals and livestock (Build 42). Trapping already gives game meat.
- **Farming extras:** crop diseases, compost and fertiliser.
- **Vehicles:** towing, and vehicle-specific mechanics magazines.
- **Weather and skills:** heat waves and tornadoes, a Nimble skill, and combat stances.

---

## C2. From the v1.7 document (15 Oct 2026)

### 2. Difficulty survey: Dead Quiet against the original

The original's column uses its default **Apocalypse** settings (Build 42). Where a number couldn't be confirmed from sources, the table says so.

| What | The original (Apocalypse) | Dead Quiet now | Verdict |
|---|---|---|---|
| Infection: scratch / laceration / bite | 7% / 25% / 100% | 7% / 25% / 100% | Same |
| Infection to death | 2 to 3 days | 48 to 72 hours | Same |
| Zombie type | Shamblers | Shamblers (sprinters off) | Same |
| One zombie per swing | Yes (multi-hit off) | Yes | Same |
| Dragged down when surrounded | On | On (3+ around, a third of their bites) | Same idea |
| Zombies path around obstacles, can't open doors | Yes (Navigate) | Yes, as of 1.7 | Same |
| Stealth: footsteps, gradual awareness, traits | As researched | Matched in 1.6 | Same |
| Respawn | None (Build 42 Apocalypse) | None | Same |
| **Zombie sight by day** | About 18 to 19 tiles | **11 tiles** | **Easier** |
| Zombie sight at night | Much shorter | 4.5 tiles (×1.7 if your light is on) | Probably easier |
| **Lunge and grab at windows and fences** | On | **Not implemented** | **Easier** |
| **Population growth** | ×1.0 rising to ×1.5 by day 28 | **Fixed density** | **Easier later on** |
| **Loot** | Stingy (most categories 0.6 to 0.8) | **Normal (×1.0)** | **Easier** |
| **Knife takedowns** | Knife instant kill, chance from Short Blade skill | 45% +5% per Blades level, +25% from behind, +10% sneaking | **Probably easier** |
| **Visibility eye and sound meter** | Not in the original | On screen | **Easier** (information) |
| **Hotbar** | Needs belts and holsters for slots | 5 free slots | **Easier** |
| Zombie memory once you break sight | Short (players report about 6 seconds) | 18 seconds, then searches where it last saw you | Harder |
| Water shuts off | Within the first month | 3 to 8 days in | Harder |
| Power shuts off | Within the first month | 4 to 10 days in | Harder |
| Helicopter event | Days 6 to 9 | Days 2 to 4 | Earlier |
| Length of a day | 1 real hour | 24 real minutes | Different (time moves 2.5× faster) |
| Zombie walking speed | Slower than a walking player (exact figure not confirmed) | 30% of your walking speed | Needs checking |

**Summary:** the core rules match (infection, combat, stealth, pathing, no respawn). The game is easier in five places:

- zombies don't see as far
- they don't grab through windows or over fences
- the population doesn't grow
- loot is more generous
- the eye, sound meter and free hotbar help

It's harder in three:

- zombies remember you longer
- water and power go out sooner
- the helicopter arrives sooner

---

### 3. Difficulty options for future patches

**Nothing here has been changed yet.** These are options to choose from, roughly in order of how much each would close the gap with the original. Each could be on by default, a sandbox setting, or a preset.

1. **Zombie sight to the original's range** (11 to 18 tiles by day, night scaled to match). This is the single biggest gap. It would make open streets in daylight much more dangerous, though sneaking and cover would still work.
2. **Window and fence lunges.** Zombies grab you as you climb through a window or vault a fence near them, which can turn into a bite or a drag-down. The original has this on by default.
3. **Population growth.** Start at today's density and rise ×1.5 by day 28, with hordes drifting toward towns you've cleared.
4. **Stingier loot** to the original's Apocalypse levels: food and medicine ×0.7, weapons and ammo ×0.6.
5. **Takedown odds** tied to the original's knife skill: lower at low Blades, from behind only, never on a zombie that's turning toward you.
6. **Belts and holsters for the hotbar.** Slots come from what you wear (belt 2, holster 1, back 1), as in the original.
7. **Optional HUD aids:** "Hardcore HUD" hides the eye and sound meter, and a softer option shows them only while sneaking.
8. **Memory to the original's.** Shorten zombie memory to about 6 seconds and let them follow sounds further (the original's 100-tile follow distance). Trades persistence for long-range attraction.
9. **Utilities and helicopter on the original's schedule** as an option, for those who want the first weeks to match.
10. **Presets** mirroring the original's: Apocalypse (all of the above), Survivor (today's game), Builder (gentler) and Sandbox (every number exposed).

---

### 4. What Dead Quiet has that the original doesn't

These are mechanics or rules that aren't in the original, or work differently:

- **The visibility eye and the sound meter.** The original shows neither. They're an information aid and the clearest "easier" item.
- **Free hotbar slots.** The original ties slots to belts and holsters.
- **Lit windows at night spotting you through glass.** The original's light makes you visible through windows too, but doesn't let light alone *attract* zombies. Ours works through sight only, so it's close, but the exact strength is our own tuning.
- **Takedown numbers.** The original has knife instant kills; our percentages are our own.
- **Searching where they last saw you.** A chasing zombie that loses you goes to search there. The original's zombies do something similar, but the 4.5-second switch is ours.
- **Herd moans.** Chasing zombies moan and nearby zombies follow the sound. The original moves hordes in other ways.
- **Automatic quality.** A technical feature, not gameplay.
- **Simplified systems that do exist in the original, in reduced form:** body weight, fishing, trapping odds, farming (5 crops rather than dozens), animals (no feeding, breeding or stress), blacksmithing, and fire.
- **Nothing major is invented outright.** Every survival system has a counterpart in the original; the differences are tuning and simplification.

---

### 5. How crafting works

**Opening it.** Press B. Recipes are grouped into tabs (Survival, Medical, Tailoring, Cooking, Carpentry, Carving, Trapping, Fishing, Farming, Electrical, Primitive, Metalwork, Repair and Build), and you can search by name or by ingredient.

**Reading the list.** Each recipe has a dot:
- **Green:** you can make it now.
- **Amber:** you know it but something is missing.
- **Grey:** you haven't learned it.

**What a recipe needs.** Click a recipe to see each requirement with a tick or a cross:
1. **Ingredients:** used up, and taken from your pockets, bag and any container within reach (counters, shelves, crates, the floor, a car trunk). "Uses" means part of an item, like a length of thread.
2. **Tools:** kept. They work by what they do, so any knife or scissors cuts cloth and any hammer drives nails.
3. **Skill:** the level you need.
4. **Workstation:** cooking needs a fire or stove, smithing needs a forge and anvil, and firing clay needs a kiln. A table nearby speeds up ordinary crafting.
5. **Knowledge:** advanced recipes are learned from magazines, from your job or a trait (the Farmer job and Gardener trait know the crop sprays), or automatically once your skill is high enough.
6. **Ingredients you choose:** dishes like soup take a range of ingredients. More ingredients make it more filling, and more variety makes it nicer to eat.

**Building.** Use the Build tab and press "Place it", then click a spot nearby. A green or red preview shows whether it fits. New in 1.7 is the butcher hook (Carpentry 3).

**Out in the world.** Everything else is in the E menu:
- **Doors and windows:** barricade them, or weld metal over them.
- **Furniture and appliances:** strip them for scrap.
- **Ground:** dig clay at riverbanks and dig worms anywhere.
- **Rocks:** break off stones and flint.
- **Water:** fish there.
- **Traps:** bait them and empty them.
- **Plots:**
  - plant, water and harvest
  - pull weeds and spray disease
  - fertilise
- **Animals:**
  - butcher carcasses
  - milk, shear, collect eggs and pet livestock

---

### 6. How stealth works

**Two senses.** Zombies find you by sound and by sight. The sound meter shows how far your noise is carrying; the eye shows how visible you are.

**Hearing.** A sound brings every zombie in its radius to investigate. As of 1.7 they find a way to it, breaking through doors and windows as needed. Footsteps are the constant sound: sneak (C) to cut them right down.

**Sight.** It works in steps:
1. A zombie has to have you in its narrow vision cone, within range and in line of sight.
2. Its awareness then builds, faster the more visible, central and close you are.
3. Half aware, it turns and comes to look. Fully aware, it chases.

**Staying unseen.**
- Approach from behind or the side.
- Crouch.
- Stay out of light: turn your flashlight off, avoid street lamps, and switch house lights off with L.
- Use trees and bushes, and keep fences, cars and furniture between you and them.

**Losing a chase.** Break line of sight, turn corners and keep moving. A zombie that loses you searches where it last saw you, then gives up.

**Animals.** They have their own senses. Deer notice you at 15 tiles walking, half that sneaking, and gunshots scatter everything nearby.

---

### 7. Research for future additions (aim: a realistic, living world)

From this round's research into Build 42 and the plans for Build 43:

- **Animal husbandry in depth:** feeding troughs, water, hutches, breeding and young, stress (from zombies, engines, gunfire and crowding), leading animals with a rope, livestock trailers, and dung for compost.
- **Tracking skill:** footprints, droppings and resting spots shown in search mode (V), so you can follow deer.
- **Farming in depth:** dozens of crops with planting months, compost bins, a seed library, and preserving the harvest (jars, drying, freezers).
- **Brewing:** beer and wine, and fluid mixing in containers.
- **Glassmaking:** jars, bottles and windows from sand.
- **A cleaning system:** blood on floors and walls that you can scrub with a mop and bleach.
- **Vertical world:** skyscrapers up to 32 floors, sewers, tunnels and panic rooms.
- **Lighting:** light that bounces off walls and leaks through gaps, and shadows from the sun moving through the day.
- **New buildings and clothing:** SWAT gear, sports uniforms and more distinctive buildings.
- **Survivors (planned for Build 43):** other people with their own camps, trading and danger. The biggest step toward a world that feels lived in.

---

### 8. What's still not in, and good next steps

- **The difficulty options** in section 3. Your call on which.
- **Animal care:** feeding, breeding, stress and the Tracking skill.
- **Farming extras:** more crops, compost and preserving food.
- **Taller buildings:** high-rises beyond 7 floors, and sewers.
- **Firearm extras:** gun attachments (scopes, suppressors) and ammo crafting. The original doesn't craft complete rounds either.
- **Vehicles:** towing, and mechanics magazines.
- **Brewing and glassmaking.**
- **Cleaning blood.**
- **Survivors.**

---
