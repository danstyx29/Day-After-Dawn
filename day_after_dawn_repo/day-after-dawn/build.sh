#!/usr/bin/env bash
# Builds dist/day_after_dawn.html from src/. The order matters: later files
# override earlier definitions (the game was grown patch by patch).
set -e
cd "$(dirname "$0")"
mkdir -p dist
ORDER="js1_data.js js2_world.js js3_player.js js4_sim.js js5_render.js js7_art.js js8_worldart.js js9_ui2.js js10_world2.js js11_fx.js js12_inv.js js13_craft.js js14_vehicle.js js15_save.js js6_ui.js js16_regions.js js17_polish.js js18_world3.js js19_render3.js js20_life.js js21_perf.js js22_arch.js js23_interiors.js js24_systems.js js25_guns.js js26_mech.js js27_world4.js js28_stealth.js js29_craft.js js30_fire.js js31_audio.js js32_anim.js js33_artperf.js js34_qol.js js35_pathing.js js36_mall2.js js37_animals.js js38_farm2.js js39_atmos.js js40_quality.js js41_zombies2.js js42_hud.js js43_sandbox.js js44_clean.js js45_tracks.js js46_burn.js js47_fixes.js js48_motes.js js49_skyline.js js50_light.js js51_env.js js52_amb.js js53_perf.js "
{ cat src/head.html; echo "<script>"; for f in $ORDER; do cat "src/$f"; done; echo "</script></body></html>"; } > dist/day_after_dawn.html
if command -v node >/dev/null 2>&1; then
  sed -n '/<script>/,/<\/script>/p' dist/day_after_dawn.html | sed '1d;$d' > dist/.check.js && node --check dist/.check.js && rm -f dist/.check.js && echo "SYNTAX OK"
fi
echo "built dist/day_after_dawn.html"
