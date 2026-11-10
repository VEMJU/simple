/* Wash day: blot. A cotton T-shirt over each cupped hand squeezes the water up and out. */
(K => {
  // T-shirt cloth over the cupped palm (fingertips peek out, a corner hangs outward),
  // drawn in hand coordinates so it lifts and squeezes with the hand.
  const cloth =
    '<path d="M-29 -26Q-14 -40 0 -33Q14 -42 28 -30C31 -4 31 18 25 34Q13 43 2 37Q-8 44 -17 39L-29 66Q-38 63 -36 50C-37 22 -34 -4 -29 -26Z" fill="#eef0f2"/>' +
    '<path d="M-18 -26Q-8 6 -24 44M8 -30Q-2 2 6 34M22 -20Q14 -4 18 14" fill="none" stroke="#9aa2aa" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M-27 -27Q-14 -38 0 -31Q14 -40 26 -30" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
  const move = '--up:translate(0,-38px);--dur:2.2s';

  // Water squeezed out of the hair falls away; a thin dark edge keeps the drops visible on the clay.
  const drops = [[104, 264, 0], [124, 268, -.6], [296, 264, -.3], [276, 268, -.9]]
    .map(([x, y, d]) => `<g class="a blot-fall" style="--d:${d}s">${K.drop(x, y, 1.2, '#a9dcee', 'stroke="#1b2226" stroke-opacity=".5" stroke-width="1.5"')}</g>`).join('');

  SCENES.blot = {
    caption: 'Squeeze upward with a T-shirt. Never rub.',
    zones: ['lengths'],
    loop: 2.2,
    layers: `
      ${K.hand('flat', 118, 222, 16, { cls: 'scrunch', style: move, extra: cloth })}
      ${K.hand('flat', 282, 222, -16, { flip: true, cls: 'scrunch', style: move, extra: cloth })}
      ${drops}
      ${K.arrow('M76 186V134')}${K.arrow('M324 186V134')}
      ${K.no(66, 64, 28)}
      <path class="arrow" d="M47 52L85 58L47 66L85 72" marker-start="url(#sk-arrowhead)" marker-end="url(#sk-arrowhead)"/>
      <g class="no"><path d="M46 44L86 84"/></g> <!-- slash redrawn on top of the rubbing zigzag -->
    `,
    css: `
      .scene .blot-fall { animation-name: blot-fall; --dir: normal; --ease: ease-in; --dur: 1.1s; }
      @keyframes blot-fall { from { transform: translate(0, -6px); opacity: 1; } to { transform: translate(0, 26px); opacity: 0; } }
    `,
  };
})(SceneKit);
