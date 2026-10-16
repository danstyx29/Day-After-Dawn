// Part 44: cleaning blood (Build 42 style). Rags scrub it up; disinfectant or water makes it quicker.
function cleanOptions(out){
  const near = G.blood.filter(b => Math.hypot(b.x - P.x, b.y - P.y) < 1.8).length;
  if (!near) return;
  const rag = allCarried().find(it => it.id === "rags"), wet = allCarried().find(it => it.id === "disinf" || it.id === "water");
  out.push({ label: rag ? `Clean up the blood${wet ? ` (with ${ITEMS[wet.id].n.toLowerCase()})` : ""}` : "Clean up the blood (needs rags)", off: !rag, fn: () => act("Scrubbing", wet ? 4 : 7, () => {
    const before = G.blood.length; G.blood = G.blood.filter(b => Math.hypot(b.x - P.x, b.y - P.y) >= 1.8);
    if (R() < .5) removeItem(rag);
    if (wet && wet.id === "disinf"){ wet.uses = (wet.uses ?? 6) - 1; if (wet.uses <= 0) removeItem(wet); }
    say(before > G.blood.length ? "The floor's clean, more or less." : "Nothing left to scrub.");
  }, { noise: 1, noiseEvery: 2 }) });
}
