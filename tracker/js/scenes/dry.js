/* Drying: diffuser on low, swept slowly around the curls; hands stay off. */
(K => {
  // The whole dryer swings round the head centre (200,128), so it stays aimed at the curls.
  const sweep = 'transform-origin:200px 128px;--from:rotate(-30deg);--to:rotate(16deg);--dur:3s';
  // Two-headed arc behind the dryer: it goes back and forth, section to section.
  const path = K.arrow('M330 26A165 165 0 0 1 353 190').replace('marker-end', 'marker-start="url(#sk-arrowhead)" marker-end');

  SCENES.dry = {
    caption: 'Diffuser on low, moving slowly. Hands off until fully dry.',
    zones: ['lengths'],
    loop: 6,
    layers: `
      ${path}
      <g class="a mv" style="${sweep}">${K.dryer(338, 112, -76, { tip: 'diffuser' })}</g>
      <g transform="translate(68 216) scale(.72)">
        ${K.hand('flat', 0, 0, 28, { cls: 'dry-reach', style: '--dur:6s' })}
      </g>
      ${K.no(74, 196, 30)}
    `,
    // the small hand twitches toward the hair once a loop, and the "no" sign stays on it
    css: `
      .scene .dry-reach { animation-name: dry-reach; --dir: normal; }
      @keyframes dry-reach { 0%, 60%, 100% { transform: none; } 75% { transform: translate(0, -14px); } }
    `,
  };
})(SceneKit);
