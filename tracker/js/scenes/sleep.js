/* Night: sleep with fully dry hair on a satin pillowcase. Only the sheen and the stars move. */
(K => {
  // puffy pillow outline behind head and shoulders
  const PILLOW = 'M98 44Q200 28 302 44Q332 50 332 84Q324 160 332 236Q332 264 302 268Q200 282 98 268Q68 264 68 236Q76 160 68 84Q68 50 98 44Z';
  const stars = [[84, 26, 1, 0], [30, 96, .85, -.8], [58, 76, .7, -1.5]]
    .map(([x, y, s, d]) => K.sparkle(x, y, s, { cls: 'fade', style: `--o1:.2;--o2:1;--dur:1.2s;--d:${d}s` })).join('');

  SCENES.sleep = {
    caption: 'Dry hair, satin pillowcase.',
    zones: [],
    loop: 4,
    under: `
      <defs>
        <linearGradient id="sleep-satin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#eef2f7"/><stop offset=".5" stop-color="#b9c3cf"/><stop offset="1" stop-color="#7a8592"/>
        </linearGradient>
        <linearGradient id="sleep-shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <clipPath id="sleep-clip"><path d="${PILLOW}"/></clipPath>
      </defs>
      <path d="${PILLOW}" transform="translate(0 8)" fill="#000" opacity=".35" filter="url(#sk-blur)"/>
      <path d="${PILLOW}" fill="url(#sleep-satin)"/>
      <path d="${PILLOW}" transform="translate(200 156) scale(.93) translate(-200 -156)" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="5 4"/>
      <g clip-path="url(#sleep-clip)">
        <path d="M80 64Q120 92 128 150M320 72Q284 110 286 170M86 250Q136 232 152 204M314 250Q272 236 258 206"
          fill="none" stroke="#5f6874" stroke-opacity=".35" stroke-width="2.5" stroke-linecap="round"/>
        <!-- static gloss on the wings the bust leaves visible, so the still pose already reads as satin -->
        <path d="M84 70Q110 130 96 220M316 70Q290 130 304 220" stroke="#fff" stroke-opacity=".55" stroke-width="10"
          stroke-linecap="round" fill="none" filter="url(#sk-blur)"/>
        <!-- satin sheen: a tilted light band sweeping across both wings -->
        <rect class="a mv" x="-60" y="-80" width="110" height="460" fill="url(#sleep-shine)"
          style="--from:translate(60px,0) rotate(24deg);--to:translate(560px,0) rotate(24deg);--dir:normal;--ease:linear;--dur:4s"/>
      </g>
      <ellipse cx="200" cy="150" rx="70" ry="84" fill="#000" opacity=".3" filter="url(#sk-blur)"/>
      <path d="M44 18A22 22 0 1 0 60 56A18 18 0 1 1 44 18Z" fill="#f2efe2"/>
      ${stars}
      <!-- no wet hair to bed -->
      ${K.drop(352, 35, 1.3, '#a9dcee')}${K.no(352, 58, 22)}
    `,
    // closed eyes: asleep
    layers: `<path d="M178 142q8 5 16 0M206 142q8 5 16 0" fill="none" stroke="#8a929c" stroke-width="2.5" stroke-linecap="round"/>`,
  };
})(SceneKit);
