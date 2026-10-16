// Part 48 (1.10.2): dust motes belong to the room, not to you. Each sits over a floor tile and drifts slowly in place.
function drawMotes(){
  if (QUALITY < 2 || !indoorsNow() || darknessBase() > .3 || RV.inPocket) return;
  const px = P.x | 0, py = P.y | 0, t = G.simT;
  ctx.fillStyle = "rgba(255,245,220,1)";
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++){
    const tx = px + dx, ty = py + dy, i = ix(tx, ty); if (tile[i] !== T.FLOOR || !G.vis[i]) continue;
    const h = hash(tx * 17, ty * 31); if (h > .3) continue;
    const ph = h * 40, x = tx + .2 + hash(tx, ty * 7) * .6 + Math.sin(t * .13 + ph) * .22, y = ty + .2 + hash(tx * 3, ty) * .6 + Math.cos(t * .11 + ph * 1.3) * .22;
    const z = 6 + (Math.sin(t * .07 + ph * 2) * .5 + .5) * 28, [sx, sy] = S(x, y, z);
    ctx.globalAlpha = .18 + .17 * (Math.sin(t * .45 + ph) * .5 + .5); ctx.fillRect(sx, sy, Math.max(1, zoom * 1.1), Math.max(1, zoom * 1.1));
  }
  ctx.globalAlpha = 1;
}
