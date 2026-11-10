/* Wash day: shampoo. Fingertips make small circles on the scalp only. */
(K => {
  const bubbles = [[180, 52, 5, 0], [222, 55, 4, -.5], [201, 44, 6, -.9], [190, 68, 3.5, -.3], [213, 70, 4, -1.2]]
    .map(([x, y, r, d]) => `<circle class="a fade" cx="${x}" cy="${y}" r="${r}" fill="#fff" style="--o1:.1;--o2:.85;--dur:.9s;--d:${d}s"/>`).join('');

  SCENES.shampoo = {
    caption: 'Fingertips on the scalp, small circles. Not the lengths.',
    zones: ['scalp'],
    loop: 1.4,
    layers: `
      ${bubbles}
      ${K.hand('claw', 130, 82, 62, { cls: 'orbit', style: '--r:8px;--dur:1.4s' })}
      ${K.hand('claw', 270, 82, -62, { flip: true, cls: 'orbit', style: '--r:8px;--dur:1.4s;--d:-.7s' })}
      ${K.spin(150, 30)}${K.spin(250, 30)}
    `,
  };
})(SceneKit);
