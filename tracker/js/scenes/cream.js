/* Curl cream: a small dab on the palm, flat hands press it down the sides from ear to ends. */
(K => {
  // hands press down to the ends, then lift off sideways (--off, --back) so the return never reads as a stroke up
  const press = (dx, out) => `--to:translate(${dx}px,56px);--off:translate(${dx + out}px,50px);--back:translate(${out}px,-6px)`;
  // quarter-size dab with a shadow so it reads on the pale palm; it is spread away during the slide
  const dab = `<g class="a cream-dab"><ellipse cx="0" cy="3" rx="14" ry="9" fill="#000" opacity=".28" filter="url(#sk-soft)"/>` +
    `<path d="M-13 3Q-13 -9 0 -10Q2 -16 6 -14Q4 -11 6 -8Q13 -5 13 3Q0 8 -13 3Z" fill="#f4f6f8" stroke="#aeb4bb" stroke-width="1.2"/>` +
    `<ellipse cx="-4" cy="-4" rx="4" ry="2.2" fill="#fff"/></g>`;

  SCENES.cream = {
    caption: 'Rub between palms, press through the middle and ends.',
    zones: ['lengths', 'ends'],
    loop: 2.4,
    layers: `
      ${K.hand('flat', 132, 124, 12, { cls: 'cream-press', style: press(14, -14), extra: dab })}
      ${K.hand('flat', 268, 124, -12, { flip: true, cls: 'cream-press', style: press(14, -14) })}
      ${K.arrow('M72 110L84 170')}${K.arrow('M328 110L316 170')}
    `,
    css: `
      .scene .cream-press { animation-name: cream-press; --dir: normal; --dur: 2.4s; }
      .scene .cream-dab { animation-name: cream-dab; --dir: normal; --dur: 2.4s; }
      @keyframes cream-press {
        0%, 6% { transform: translate(0, 0); }
        55% { transform: var(--to); }
        68% { transform: var(--off); }
        90% { transform: var(--back); }
        100% { transform: translate(0, 0); }
      }
      @keyframes cream-dab { 0%, 10% { opacity: 1; } 45%, 100% { opacity: 0; } }
    `,
  };
})(SceneKit);
