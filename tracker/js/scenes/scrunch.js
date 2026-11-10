/* Wash day: gel. Cupped hands lift the curls toward the scalp and squeeze. */
(K => {
  SCENES.scrunch = {
    caption: 'Cup the ends, push up toward the scalp, squeeze, let go.',
    zones: ['lengths'],
    loop: 2.2,
    layers: `
      ${K.hand('flat', 118, 222, 16, { cls: 'scrunch', style: '--up:translate(0,-38px);--dur:2.2s' })}
      ${K.hand('flat', 282, 222, -16, { flip: true, cls: 'scrunch', style: '--up:translate(0,-38px);--dur:2.2s' })}
      ${K.arrow('M84 176V128')}${K.arrow('M316 176V128')}
    `,
  };
})(SceneKit);
