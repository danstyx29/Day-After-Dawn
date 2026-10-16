// Part 46 (1.9.3): burn the dead. Douse bodies with gasoline and light them: they're gone, and so is the sickness they cause.
function burnOptions(out){
  const near = G.corpses.filter(c => !c.rise && Math.hypot(c.x - P.x, c.y - P.y) < 1.8);
  if (!near.length) return;
  const can = allCarried().find(it => it.id === "gascan" && (it.fuel || 0) >= .05), fire = allCarried().find(it => matchesKey(it, "firestarter") && (it.uses ?? 1) > 0);
  out.push({ label: can && fire ? `Burn the bod${near.length > 1 ? "ies" : "y"} (${near.length})` : "Burn the bodies (needs a gas can and a lighter or matches)", off: !(can && fire), fn: () => act("Dousing with gasoline", 4, () => {
    can.fuel = Math.max(0, can.fuel - .05 * Math.min(4, near.length)); fire.uses = (fire.uses ?? 1) - 1; if (fire.uses <= 0) removeItem(fire);
    const cx = near[0].x, cy = near[0].y; G.corpses = G.corpses.filter(c => !near.includes(c));
    if (!G.fires) G.fires = new Map(); G.fires.set(ix(cx | 0, cy | 0), { x: cx | 0, y: cy | 0, life: 30, age: 0, fuelless: true, pyre: true }); if (typeof sfxWhoosh === "function") sfxWhoosh(cx, cy);
    noise(cx, cy, 10); P.unhappy = Math.max(0, (P.unhappy || 0) - 3); say("The smell is awful, but they won't rot here.");
  }, { noise: 1, noiseEvery: 2 }) });
}
