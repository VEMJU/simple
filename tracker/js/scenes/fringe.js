/* Styling: set the fringe. One fingertip parts it into five curls that drop forward, just over the brows. */
(K => {
  const LOOP = 5;
  // five hanging ringlets, spread from the centre so a clear coral gap shows between them
  const CURLS = K.HAIR.fringe.map(([x, y]) => [200 + (x - 200) * 1.5, y]);
  const GAPS = CURLS.slice(1).map(([x, y], j) => [(x + CURLS[j][0]) / 2, Math.min(y, CURLS[j][1])]);
  const HOP = [8, 28, 48, 68];                 // % of the loop where the finger strokes down each gap
  const DROP = [...HOP, HOP[3] + 4];           // the last gap frees the last two curls
  const BASE = GAPS[0];                        // resting pose: fingertip in the first gap, palm clear of the face

  // each curl starts lifted and bunched, then falls into place with a small overshoot
  const curlCss = CURLS.map(([x], i) => {
    const s = DROP[i], packed = `translate(${(200 - x) * .35}px, -12px)`, tw = Math.sign(x - 200) * 14 || 8;
    return `@keyframes fringe-c${i} { 0%, ${s + 2}% { transform: ${packed}; }
      ${s + 9}% { transform: translate(0, 6px) rotate(${tw}deg); } ${s + 14}%, 88% { transform: none; } 94%, 100% { transform: ${packed}; } }
    .scene .fringe-c${i} { animation-name: fringe-c${i}; --dir: normal; --dur: ${LOOP}s; }`;
  }).join('\n');

  // the fingertip dips into each gap and strokes down 14 units, pushing the curl forward
  const at = ([x, y], dy) => `translate(${x - BASE[0]}px, ${y - BASE[1] + dy}px)`;
  const hop = GAPS.map((g, j) => `${HOP[j]}% { transform: ${at(g, -4)}; } ${HOP[j] + 8}% { transform: ${at(g, 14)}; } ${HOP[j] + 12}% { transform: ${at(g, 4)}; }`).join(' ');
  const start = at(GAPS[0], -10);

  SCENES.fringe = {
    caption: 'One finger: split the fringe into five curls, falling forward.',
    zones: [],                                   // own glow below: behind the curls, above the brows
    fringe: false,
    loop: LOOP,
    css: `${curlCss}
      @keyframes fringe-hand { 0%, 100% { transform: ${start}; } ${hop} 90% { transform: ${start}; } }
      .scene .fringe-hand { animation-name: fringe-hand; --dir: normal; --dur: ${LOOP}s; }`,
    layers: `
      <ellipse class="zone a" cx="200" cy="106" rx="44" ry="15" fill="${K.CORAL}" filter="url(#sk-blur)"/>
      ${CURLS.map(([x, y], i) => `<g class="a c fringe-c${i}">${K.clump(x, y + 8, 7)}${K.clump(x, y, 8.5)}</g>`).join('')}
      <path d="M168 129Q180 123 193 127M207 127Q220 123 232 129" fill="none" stroke="#5f666e" stroke-width="3.5" stroke-linecap="round"/>
      ${K.arrow('M164 90Q200 85 236 90')}
      <!-- finger held nearly upright (rot 20): palm = tip - (7, -59), so it rides below the brows -->
      <g class="a fringe-hand">${K.hand('point', BASE[0] - 7, BASE[1] + 59, 20)}</g>
    `,
  };
})(SceneKit);
