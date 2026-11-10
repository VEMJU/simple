/* Finish: squeeze the dry gel cast until soft, then a little serum on the lengths and ends. */
(K => {
  // Crisp light shell over the outer curls: one outward-facing arc per clump, at radius r + gap.
  const rad = a => a * Math.PI / 180;
  const shell = gap => [...K.HAIR.outer, ...K.HAIR.back].map(([cx, cy, r]) => {
    const t = Math.atan2(cy - 112, cx - 200) * 180 / Math.PI, R = r + gap;
    const p = a => `${(cx + R * Math.cos(rad(a))).toFixed(1)} ${(cy + R * Math.sin(rad(a))).toFixed(1)}`;
    return `M${p(t - 58)}A${R} ${R} 0 0 1 ${p(t + 58)}`;
  }).join('');

  const sparkles = [[180, 40, 1.5, 0], [222, 42, 1.3, -.3], [201, 28, 1, -.15], [146, 178, 1.2, -.45], [256, 172, 1.2, -.6]]
    // wrapped: the sparkle's own transform places it, the group's animation scales it; dim in the still pose
    .map(([x, y, s, d]) => `<g class="a c cast-shine" style="--d:${d}s;opacity:.45">${K.sparkle(x, y, s)}</g>`).join('');

  // palms wrap the curled crown sides, clear of the flat down-perm sides and ears
  const grip = { cls: 'cast-hold', style: '--sx:.86;--sy:.8' };

  SCENES.cast = {
    caption: 'Fully dry? Squeeze until soft, then a little serum on the ends.',
    zones: ['lengths'],
    loop: 3.6,
    layers: `
      <g class="a cast-crust" fill="none" stroke="#eef6ff" stroke-linecap="round">
        <path d="${shell(3)}" stroke-width="4"/>
        <path d="${shell(7)}" stroke-width="2.5" stroke-opacity=".7" stroke-dasharray="2 5"/>
      </g>
      ${sparkles}
      ${K.hand('flat', 132, 78, 42, grip)}
      ${K.hand('flat', 268, 78, -42, { flip: true, ...grip })}
      ${K.arrow('M82 44H106')}${K.arrow('M318 44H294')}
      <g class="a cast-serum">${K.drop(314, 56, 1.4, '#ffc46b')}</g>
    `,
    // 0-30% stiff cast, 30-55% it melts away under three squeezes, then hands rest, shine and serum
    css: `
      .scene .cast-crust { animation-name: cast-crust; --dir: normal; --dur: 3.6s; }
      .scene .cast-shine { animation-name: cast-shine; --dir: normal; --dur: 3.6s; }
      .scene .cast-serum { animation-name: cast-serum; --dir: normal; --dur: 3.6s; }
      .scene .cast-hold { animation-name: cast-hold; --dir: normal; --dur: 3.6s; }
      @keyframes cast-crust { 0%, 30% { opacity: 1; } 55%, 96% { opacity: 0; } 100% { opacity: 1; } }
      @keyframes cast-shine { 0%, 55% { opacity: 0; transform: scale(.3); } 70% { opacity: 1; transform: scale(1.15); } 85% { opacity: .5; transform: scale(.8); } 96% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(.3); } }
      @keyframes cast-serum { 0%, 50% { opacity: 0; transform: none; } 60% { opacity: 1; transform: none; } 90%, 96% { opacity: 1; transform: translate(-3px, 8px); } 100% { opacity: 0; transform: translate(-3px, 8px); } }
      @keyframes cast-hold {
        0%, 18%, 36%, 55%, 100% { transform: scale(1); }
        9%, 27%, 45% { transform: scale(var(--sx), var(--sy)); }
      }
    `,
  };
})(SceneKit);
