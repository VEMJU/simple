/* Wash day: rinse. Water runs from the crown down both sides while fingers open the hair. */
(K => {
  // side runoff: starts where the water lands on the crown and hugs the hair down past the ears
  const sides = ['M170 58C152 70 145 92 145 120C145 150 150 176 158 202', 'M230 58C248 70 255 92 255 120C255 150 250 176 242 202'];
  const streams = K.water(170, 230, 31, 64, 5) + sides.map((d, i) =>
    `<path class="water a flow" d="${d}" style="--dur:.8s;--d:${-i * .4}s;stroke-width:4;stroke-opacity:.95"/>`).join('');

  // drips leaving the ends at the nape, one pair under each runoff
  const drips = [[158, 206, 0], [242, 206, -.4], [150, 198, -.2], [250, 198, -.6]]
    .map(([x, y, d]) => `<g class="a rinse-drip" style="--d:${d}s">${K.drop(x, y, .8, '#a9dcee')}</g>`).join('');

  const shower = `
    <rect x="192" y="-6" width="16" height="16" fill="url(#sk-tool)"/>
    <path d="M166 28Q166 6 200 6Q234 6 234 28Z" fill="url(#sk-tool)"/>
    <rect x="164" y="25" width="72" height="6" rx="3" fill="#7d878f"/>`;

  // streams sit behind the hands so the fingers stay readable
  // fingers slide up and out: opening the curls so water reaches the scalp (a glide, not a scrub)
  const lift = '--from:translate(6px,10px);--to:translate(-10px,-14px);--dur:1.2s';
  const liftR = '--from:translate(-6px,10px);--to:translate(10px,-14px);--dur:1.2s';

  SCENES.rinse = {
    caption: 'Lukewarm water, top to bottom, until it stops feeling slippery.',
    zones: ['scalp', 'lengths'],
    loop: 2.4,
    layers: `
      ${streams}
      ${K.hand('claw', 140, 88, 40, { cls: 'mv', style: lift })}
      ${K.hand('claw', 260, 88, -40, { flip: true, cls: 'mv', style: liftR })}
      ${shower}${drips}
      ${K.arrow('M120 150V198')}${K.arrow('M280 150V198')}
    `,
    css: `
      .scene .rinse-drip { animation-name: rinse-drip; --dir: normal; --ease: ease-in; --dur: .8s; }
      @keyframes rinse-drip { from { transform: translate(0, 0); opacity: 1; } to { transform: translate(0, 30px); opacity: 0; } }
    `,
  };
})(SceneKit);
