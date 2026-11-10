/* Wash day: conditioner. Flat hands smooth it down the lengths to the ends; the scalp stays clear. */
(K => {
  const dollop = '<ellipse cx="0" cy="-4" rx="12" ry="7" fill="#f4f6f8" stroke="#aab0b7" stroke-width="1"/>';

  SCENES.condition = {
    caption: 'Lengths and ends only, not the scalp. Smooth it down.',
    zones: ['lengths', 'ends'],
    loop: 3.2,
    layers: `
      ${K.no(200, 70, 15)}
      ${K.hand('flat', 140, 132, 12, { cls: 'mv', style: '--from:translate(0,0);--to:translate(4px,50px);--dur:1.6s', extra: dollop })}
      ${K.hand('flat', 260, 132, -12, { flip: true, cls: 'mv', style: '--from:translate(0,0);--to:translate(-4px,50px);--dur:1.6s' })}
      ${K.arrow('M100 120V200', { style: 'stroke-width:4' })}${K.arrow('M300 120V200', { style: 'stroke-width:4' })}
    `,
  };
})(SceneKit);
