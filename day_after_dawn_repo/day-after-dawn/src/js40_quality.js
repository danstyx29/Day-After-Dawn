// ============================================================
// Part 40: automatic quality. The game watches its own frame time
// and steps optional visual effects down when a machine struggles,
// then back up when there's headroom. Gameplay never changes.
//   2 = everything   1 = cheaper grading, no sway or dust, fewer puddles   0 = bare
// ============================================================
let QUALITY = 2, qEma = 16, qSlowT = 0, qFastT = 0, qLast = 0;
function qualityTick(){
  const now2 = performance.now(), ft = qLast ? now2 - qLast : 16; qLast = now2;
  if (typeof window.QFIX === "number"){ QUALITY = window.QFIX; return; }
  if (ft > 250) return;                       // a tab switch or a pause, not a slow frame
  qEma = qEma * .92 + ft * .08;
  if (qEma > 24){ qSlowT += ft; qFastT = 0; if (qSlowT > 1500 && QUALITY > 0){ QUALITY--; qSlowT = 0; } }
  else if (qEma < 14){ qFastT += ft; qSlowT = 0; if (qFastT > 6000 && QUALITY < 2){ QUALITY++; qFastT = 0; } }
  else { qSlowT = 0; qFastT = 0; }
}
