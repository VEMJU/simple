/* Drying: the sides. Nozzle blows straight down the side, flat palm presses it to the head. */
(K => {
  SCENES.sides = {
    caption: 'Sides: dry downward and press flat. No scrunching here.',
    // one custom glow on the worked (viewer's left) side only, instead of the two-sided kit zone
    layers: `
      <ellipse class="zone a" cx="150" cy="110" rx="12" ry="33" fill="${K.CORAL}" filter="url(#sk-blur)"/>
      ${K.hand('flat', 136, 136, 6, { cls: 'mv', style: '--from:translate(-12px,-6px);--to:translate(2px,6px);--dur:1.2s' })}
      ${K.dryer(116, 38, 170, { tip: 'nozzle', cls: 'mv', style: '--to:translate(0,-8px);--dur:1.2s' })}
      ${K.arrow('M97 100V152')}
    `,
    loop: 2.4,
  };
})(SceneKit);
