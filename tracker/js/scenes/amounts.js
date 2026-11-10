/* Reference: what pea, dime, quarter and teaspoon look like in an open palm. */
(K => {
  const MM = 2.6; // px per mm: the palm is drawn about 220 px wide, about 85 mm

  // One dollop on the palm: coin ring (true diameter), mound, label. h = height / width.
  const dollop = (cx, cy, mm, h, fill, label, d) => {
    const w = mm * MM, r = w / 2, ry = r * .45, t = w * h * 1.33, b = w * .46;
    return `
      <ellipse cx="${cx + 3}" cy="${cy + 3}" rx="${r}" ry="${ry}" fill="#000" opacity=".22" filter="url(#sk-soft)"/>
      <ellipse class="a amounts-r" cx="${cx}" cy="${cy}" rx="${r + 3}" ry="${ry + 2}" fill="none" stroke="#fff" stroke-width="2" style="--d:${d}s"/>
      <g class="a amounts-p" style="--d:${d}s">
        <path d="M${cx - b} ${cy}C${cx - b} ${cy - t} ${cx + b} ${cy - t} ${cx + b} ${cy}A${b} ${b * .45} 0 0 1 ${cx - b} ${cy}Z" fill="${fill}" stroke="#8a9199" stroke-width="1.2"/>
        <ellipse cx="${cx - b * .35}" cy="${cy - w * h * .62}" rx="${b * .22}" ry="${Math.max(1.5, w * h * .16)}" fill="#fff" opacity=".9"/>
      </g>
      ${K.sparkle(cx + r + 4, cy - Math.min(t * .75, 22) - 6, 1.1, { cls: 'amounts-s', style: `--d:${d}s` })}
      <text x="${cx}" y="${cy + ry + 18}" text-anchor="middle" style="fill:#2a3136;font-size:16px;font-weight:700">${label}</text>`;
  };

  // A capsule from base to tip, traced clockwise so every hand part shares one path and one gradient.
  const cap = (x0, y0, x1, y1, r) => {
    const l = Math.hypot(x1 - x0, y1 - y0), px = (y1 - y0) / l * r, py = -(x1 - x0) / l * r;
    return `M${x0 + px} ${y0 + py}L${x1 + px} ${y1 + py}A${r} ${r} 0 0 1 ${x1 - px} ${y1 - py}L${x0 - px} ${y0 - py}A${r} ${r} 0 0 1 ${x0 + px} ${y0 + py}Z`;
  };
  const HAND = 'M120 300C116 262 94 232 92 190C90 150 94 120 112 108Q200 96 290 108C306 120 310 150 308 190C306 232 284 262 282 300Z' +
    cap(130, 140, 120, 32, 23) + cap(176, 140, 173, 16, 24) + cap(222, 140, 228, 24, 23) + cap(268, 140, 284, 56, 20) + cap(150, 240, 58, 160, 25);

  SCENES.amounts = {
    caption: 'Pea, dime, quarter, teaspoon: sizes in your palm.',
    zones: [],
    bust: false,
    hair: false,
    loop: 3.2,
    css: `
      .scene .amounts-p { animation-name: amounts-pulse; --dir: normal; --dur: 3.2s; transform-box: fill-box; transform-origin: 50% 100%; }
      .scene .amounts-r { animation-name: amounts-ring; --dir: normal; --dur: 3.2s; stroke-opacity: .4; }
      @keyframes amounts-pulse { 0%, 30%, 100% { transform: scale(1); } 14% { transform: scale(1.12); } }
      @keyframes amounts-ring { 0%, 30%, 100% { stroke-opacity: .4; } 14% { stroke-opacity: 1; } }
      .scene .amounts-s { animation-name: amounts-flash; --dir: normal; --dur: 3.2s; opacity: 0; }
      @keyframes amounts-flash { 0%, 4%, 28%, 100% { opacity: 0; } 14% { opacity: 1; } }
    `,
    // The --d values put each dollop's pulse peak on its own quarter of the loop, smallest first.
    layers: `
      <path d="${HAND}" fill="url(#sk-arm)"/>
      <ellipse cx="200" cy="205" rx="90" ry="75" fill="#000" opacity=".1" filter="url(#sk-blur)"/>
      <path d="M104 138Q190 152 296 128M150 290Q118 240 136 186" fill="none" stroke="#000" stroke-opacity=".09" stroke-width="2" stroke-linecap="round"/>
      ${dollop(148, 156, 8, .9, '#f4f6f8', 'pea', -.45)}
      ${dollop(250, 156, 18, .14, '#ffc46b', 'dime', -2.85)}
      ${dollop(146, 240, 24, .34, '#f4f6f8', 'quarter', -2.05)}
      ${dollop(252, 240, 28, .55, '#f4f6f8', 'teaspoon', -1.25)}
    `,
  };
})(SceneKit);
