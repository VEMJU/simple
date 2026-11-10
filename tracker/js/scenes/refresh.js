/* Non-wash day: wet fingers scrunch one flat spot back into curl. No re-wash. */
(K => {
  // water beads on the fingers and palm, drawn in the hand's own frame so they ride along
  const wet = [[-26, -44, .6], [21, -40, .55], [-6, -2, .6], [12, 12, .5]]
    .map(([x, y, s]) => K.drop(x, y, s, '#a9dcee')).join('');
  // a few drops falling beside the spot (1.1s, so two falls per 2.2s loop)
  const air = [[114, 30, 0], [96, 50, -.4], [128, 18, -.8]]
    .map(([x, y, d]) => `<g class="a refresh-fall" style="--dur:1.1s;--d:${d}s">${K.drop(x, y, 1, '#a9dcee')}</g>`).join('');

  SCENES.refresh = {
    caption: 'Wet hands, scrunch just the flat spot.',
    zones: [],
    loop: 2.2,
    layers: `
      <path d="M134 98C130 76 140 58 160 50L170 60C156 70 150 84 152 100Z" fill="url(#sk-hair-flat)"/>
      <ellipse class="zone a" cx="150" cy="76" rx="19" ry="25" fill="${K.CORAL}" filter="url(#sk-blur)"/>
      ${air}
      ${K.hand('flat', 98, 156, 35, { cls: 'scrunch', style: '--up:translate(0,-40px);--dur:2.2s', extra: wet })}
      ${K.arrow('M64 134L90 98')}
    `,
    css: `
      .scene .refresh-fall { animation-name: refresh-fall; --dir: normal; --ease: ease-in; }
      @keyframes refresh-fall { 0% { transform: translateY(-4px); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(30px); opacity: 0; } }
    `,
  };
})(SceneKit);
