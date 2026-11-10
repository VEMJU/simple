/* Scene kit for the how-to animations.
 *
 * Every animation is one <svg viewBox="0 0 400 300">: a dark studio, a clay
 * mannequin bust with curly hair, a coral glow on the zone being worked, and
 * hands or props that move. Each file in js/scenes/ registers one scene:
 *
 *   SCENES.shampoo = {
 *     caption: 'Fingertips on the scalp, small circles',  // shown under the stage
 *     zones:   ['scalp'],      // coral glow: scalp | lengths | ends | fringe | sides
 *     loop:    2.4,            // seconds for one full visual cycle
 *     layers:  `...svg...`,    // drawn in front of the bust (hands, props, arrows)
 *     under:   `...svg...`,    // optional, drawn behind the bust
 *     hair:    true,           // false = draw no hair at all
 *     fringe:  true,           // false = the scene draws its own fringe
 *     bust:    true,           // false = no mannequin (object-only illustration)
 *     css:     `...`,          // optional extra keyframes; prefix names with the scene id
 *   };
 *
 * Motion: give an element class "a" plus one motion class (mv, orbit, scrunch,
 * squeeze, flow, fade). Timing and distances come from CSS variables
 * (--dur, --d, --from, --to, --up, --r ...), so the keyframes in app.css serve
 * every scene. Animations stay paused until the stage scrolls into view.
 */
const SCENES = {};

const SceneKit = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const n = v => Math.round(v * 10) / 10;
  const CORAL = '#ff5745';

  /* ---------- hair ---------- */

  /** One curl clump: a shaded ball with a curl highlight. `attrs` goes on the <g>. */
  const clump = (cx, cy, r, attrs = '') =>
    `<g ${attrs}><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sk-hair)"/>` +
    `<path d="M${n(cx - r * .45)} ${n(cy + r * .2)}a${n(r * .5)} ${n(r * .5)} 0 1 1 ${n(r * .65)} ${n(r * .3)}" ` +
    `fill="none" stroke="#d5d9de" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/></g>`;

  /** Clump positions [cx, cy, r], so scenes can redraw or animate parts of the hair. */
  const HAIR = {
    back:   [[148, 158, 13], [155, 177, 12], [166, 191, 11], [252, 158, 13], [245, 177, 12], [234, 191, 11]],
    outer:  [[257, 86, 16], [247, 68, 16], [231, 55, 16], [211, 48, 16], [189, 48, 16], [169, 55, 16], [153, 68, 16], [143, 86, 16]],
    inner:  [[236, 82, 15], [221, 67, 15], [200, 61, 15], [179, 67, 15], [164, 82, 15]],
    fringe: [[168, 99, 12], [184, 103, 12], [200, 105, 12], [216, 103, 12], [232, 99, 12]],
  };
  const clumps = list => list.map(c => clump(c[0], c[1], c[2])).join('');

  /* ---------- hands ---------- */

  const FOREARM = '<path d="M-12 14L-17 330H17L12 14Z"/>';
  const PALM = '<rect x="-18" y="-18" width="36" height="40" rx="14"/>';
  const THUMB = '<rect x="13" y="-17" width="9.6" height="30" rx="4.8" transform="rotate(-34 18 8)"/>';
  const finger = (x, len, rot = 0) =>
    `<rect x="${x}" y="${-10 - len}" width="8.6" height="${len}" rx="4.3"${rot ? ` transform="rotate(${rot} 0 -6)"` : ''}/>`;
  const KNUCKLE_LINES = '<path d="M-9 -38V-14M0.2 -42V-14M9.4 -38V-14" fill="none" stroke="#000" stroke-opacity=".13" stroke-width="1"/>';

  const HANDS = {
    // fingers together: gliding, pressing, cupping
    flat: FOREARM + PALM + finger(-18, 40) + finger(-8.8, 46) + finger(0.4, 44) + finger(9.6, 36) + THUMB + KNUCKLE_LINES,
    // fingers fanned, fingertips working: shampoo
    claw: FOREARM + PALM + finger(-4.3, 33, -21) + finger(-4.3, 37, -7) + finger(-4.3, 37, 7) + finger(-4.3, 31, 21) +
          '<rect x="13" y="-17" width="9.6" height="28" rx="4.8" transform="rotate(-52 18 8)"/>',
    // index finger out: placing fringe curls
    point: FOREARM + PALM + finger(-18, 48) + finger(-8.8, 14) + finger(0.4, 13) + finger(9.6, 11) +
           '<rect x="-6" y="-12" width="26" height="9.6" rx="4.8"/>',
  };

  /**
   * A hand with its forearm. The palm sits at (x, y); fingers point "up" before
   * rotation, the forearm trails off the frame. `rot` in degrees, `flip` mirrors
   * it for the other side. `cls`/`style` go on the moving group; `extra` is svg
   * drawn in the hand's own coordinates (cloth, droplets) so it moves with it.
   */
  const hand = (kind, x, y, rot = 0, { flip = false, cls = '', style = '', extra = '' } = {}) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})${flip ? ' scale(-1 1)' : ''}">` +
    `<g class="a ${cls}"${style ? ` style="${style}"` : ''}><use href="#sk-hand-${kind}"/>${extra}</g></g>`;

  /* ---------- props ---------- */

  /** White direction arrow along path `d`. */
  const arrow = (d, { cls = '', style = '' } = {}) =>
    `<path class="arrow ${cls ? 'a ' + cls : ''}" d="${d}" marker-end="url(#sk-arrowhead)"${style ? ` style="${style}"` : ''}/>`;

  /** Small circular "rub in circles" arrow centred on (x, y). */
  const spin = (x, y, r = 9, opts = {}) =>
    arrow(`M${n(x + r)} ${y}A${r} ${r} 0 1 1 ${n(x + r * .2)} ${n(y - r * .98)}`, opts);

  /** Red "don't" sign centred on (x, y). Put the forbidden thing underneath it. */
  const no = (x, y, r = 16) =>
    `<g class="no"><circle cx="${x}" cy="${y}" r="${r}"/><path d="M${n(x - r * .7)} ${n(y - r * .7)}L${n(x + r * .7)} ${n(y + r * .7)}"/></g>`;

  /** A liquid drop whose tip is at (x, y). */
  const drop = (x, y, s = 1, fill = '#9fd8ea', attrs = '') =>
    `<path ${attrs} d="M0 0C5 8 8 11 8 16A8 8 0 0 1 -8 16C-8 11 -5 8 0 0Z" transform="translate(${x} ${y}) scale(${s})" fill="${fill}"/>`;

  /** Falling water: `count` streams spread across [x1, x2], from y1 down to y2. */
  const water = (x1, x2, y1, y2, count = 6) => {
    let out = '';
    for (let i = 0; i < count; i++) {
      const x = n(x1 + (x2 - x1) * (count === 1 ? .5 : i / (count - 1)));
      out += `<path class="water a flow" d="M${x} ${y1}V${y2}" style="--d:${n(-i * .17)}s"/>`;
    }
    return out;
  };

  /**
   * A hair dryer whose barrel centre is at (x, y). Before rotation it blows "up";
   * rotate it to aim. tip: 'diffuser' (wide bowl, for curls) or 'nozzle' (narrow,
   * for pressing the sides flat). Moving air is drawn for you.
   */
  const dryer = (x, y, rot = 0, { tip = 'diffuser', cls = '', style = '' } = {}) => {
    const reach = tip === 'diffuser' ? -58 : -46;
    const air = [-11, 0, 11].map((dx, i) =>
      `<path class="air a flow" d="M${dx} ${reach}V${reach - (i === 1 ? 30 : 22)}" style="--d:${-i * .2}s"/>`).join('');
    const head = tip === 'diffuser'
      ? '<path d="M-14 -22L-31 -44Q0 -55 31 -44L14 -22Z" fill="#e7e9ec"/>' +
        '<path d="M-20 -47V-52M-7 -50V-56M7 -50V-56M20 -47V-52" fill="none" stroke="#e7e9ec" stroke-width="4" stroke-linecap="round"/>'
      : '<path d="M-13 -22L-9 -42H9L13 -22Z" fill="#3a4248"/>';
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><g class="a ${cls}"${style ? ` style="${style}"` : ''}>` +
      `<rect x="-7" y="16" width="14" height="46" rx="7" transform="rotate(20 0 22)" fill="url(#sk-tool)"/>` +
      `<rect x="-15" y="-24" width="30" height="52" rx="13" fill="url(#sk-tool)"/>` +
      `<rect x="-15" y="-8" width="30" height="5" fill="#fff" opacity=".14"/>${head}${air}</g></g>`;
  };

  /** A four-point shine sparkle centred on (x, y). Add cls 'fade' to make it twinkle. */
  const sparkle = (x, y, s = 1, { cls = '', style = '' } = {}) =>
    `<path class="c ${cls ? 'a ' + cls : ''}" d="M0 -9Q1.2 -1.2 9 0Q1.2 1.2 0 9Q-1.2 1.2 -9 0Q-1.2 -1.2 0 -9Z" ` +
    `transform="translate(${x} ${y}) scale(${s})" fill="#fff"${style ? ` style="${style}"` : ''}/>`;

  /* ---------- shared defs (mounted once per page) ---------- */

  const zone = (id, body, blur = 'sk-blur') => `<g id="sk-zone-${id}" filter="url(#${blur})">${body}</g>`;

  const DEFS = `
    <linearGradient id="sk-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#313c42"/><stop offset=".8" stop-color="#232b30"/><stop offset="1" stop-color="#1b2226"/></linearGradient>
    <linearGradient id="sk-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12171a"/><stop offset="1" stop-color="#1a2024"/></linearGradient>
    <radialGradient id="sk-vignette" cx=".5" cy=".42" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>
    <linearGradient id="sk-skin" gradientUnits="userSpaceOnUse" x1="130" y1="60" x2="275" y2="295"><stop offset="0" stop-color="#f3f4f6"/><stop offset=".45" stop-color="#cfd3d8"/><stop offset="1" stop-color="#8a9199"/></linearGradient>
    <linearGradient id="sk-arm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef0f2"/><stop offset=".55" stop-color="#d3d7dc"/><stop offset="1" stop-color="#a3a9b0"/></linearGradient>
    <radialGradient id="sk-hair" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#9aa1a9"/><stop offset=".6" stop-color="#6c737b"/><stop offset="1" stop-color="#4b5158"/></radialGradient>
    <linearGradient id="sk-tool" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b656d"/><stop offset="1" stop-color="#2a3136"/></linearGradient>
    <linearGradient id="sk-hair-flat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a9199"/><stop offset="1" stop-color="#5a6068"/></linearGradient>
    <filter id="sk-blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="sk-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3"/></filter>
    <marker id="sk-arrowhead" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker>

    <g id="sk-bust">
      <path d="M60 300C62 262 96 244 150 232L178 224V196H222V224L250 232C304 244 338 262 340 300Z" fill="url(#sk-skin)"/>
      <ellipse cx="200" cy="204" rx="26" ry="9" fill="#000" opacity=".28" filter="url(#sk-soft)"/>
      <ellipse cx="151" cy="130" rx="7" ry="12" fill="url(#sk-skin)"/><ellipse cx="249" cy="130" rx="7" ry="12" fill="url(#sk-skin)"/>
      <path d="M200 66C232 66 248 92 247 122C246 154 228 192 200 192C172 192 154 154 153 122C152 92 168 66 200 66Z" fill="url(#sk-skin)"/>
      <ellipse cx="184" cy="134" rx="20" ry="26" fill="#fff" opacity=".3" filter="url(#sk-blur)"/>
      <path d="M176 127Q200 120 224 127" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="5" stroke-linecap="round" filter="url(#sk-soft)"/>
      <path d="M200 132V151" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="200" cy="157" rx="8" ry="2.6" fill="#000" opacity=".13"/>
    </g>

    <g id="sk-hair-back">${clumps(HAIR.back)}</g>
    <g id="sk-hair-main">
      ${clumps(HAIR.outer)}${clumps(HAIR.inner)}
      <path d="M156 76C142 92 139 122 147 142C153 137 157 112 163 86Z" fill="url(#sk-hair-flat)"/>
      <path d="M244 76C258 92 261 122 253 142C247 137 243 112 237 86Z" fill="url(#sk-hair-flat)"/>
    </g>
    <g id="sk-hair-fringe">${clumps(HAIR.fringe)}</g>

    ${zone('scalp', `<ellipse cx="200" cy="78" rx="48" ry="25" fill="${CORAL}"/>`)}
    ${zone('lengths', `<path d="M144 92C147 34 253 34 256 92" fill="none" stroke="${CORAL}" stroke-width="30" stroke-linecap="round"/><path d="M150 158L164 190M250 158L236 190" fill="none" stroke="${CORAL}" stroke-width="20" stroke-linecap="round"/>`)}
    ${zone('ends', `<path d="M129 94C133 16 267 16 271 94" fill="none" stroke="${CORAL}" stroke-width="11" stroke-linecap="round"/><path d="M160 113Q200 122 240 113" fill="none" stroke="${CORAL}" stroke-width="8" stroke-linecap="round"/><path d="M139 166L160 200M261 166L240 200" fill="none" stroke="${CORAL}" stroke-width="10" stroke-linecap="round"/>`, 'sk-soft')}
    ${zone('fringe', `<ellipse cx="200" cy="102" rx="45" ry="17" fill="${CORAL}"/>`)}
    ${zone('sides', `<ellipse cx="150" cy="110" rx="12" ry="33" fill="${CORAL}"/><ellipse cx="250" cy="110" rx="12" ry="33" fill="${CORAL}"/>`)}

    ${Object.entries(HANDS).map(([k, v]) => `<g id="sk-hand-${k}" fill="url(#sk-arm)">${v}</g>`).join('')}
  `;

  /** Adds the shared gradients, bust, hair and hands to the page. Safe to call twice. */
  const mountDefs = () => {
    if (document.getElementById('sk-defs')) return;
    document.body.insertAdjacentHTML('beforeend',
      `<svg id="sk-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${DEFS}</defs></svg>`);
    const css = Object.values(SCENES).map(sc => sc.css || '').join('\n').trim();
    if (css) document.head.insertAdjacentHTML('beforeend', `<style id="sk-css">${css}</style>`);
  };

  /** Returns the full <svg> markup for a registered scene, or '' if it does not exist. */
  const render = id => {
    const s = SCENES[id];
    if (!s) return '';
    const hair = s.hair !== false;
    return `<svg class="scene" viewBox="0 0 400 300" role="img" aria-label="${esc(s.label || s.caption || id)}">
      <rect width="400" height="300" fill="url(#sk-bg)"/><rect y="234" width="400" height="66" fill="url(#sk-floor)"/>
      ${s.under || ''}
      ${hair ? '<use href="#sk-hair-back"/>' : ''}
      ${s.bust === false ? '' : '<use href="#sk-bust"/>'}
      ${hair ? '<use href="#sk-hair-main"/>' : ''}
      ${hair && s.fringe !== false ? '<use href="#sk-hair-fringe"/>' : ''}
      ${(s.zones || []).map(z => `<use href="#sk-zone-${z}" class="zone a"/>`).join('')}
      ${s.layers || ''}
      <rect width="400" height="300" fill="url(#sk-vignette)" pointer-events="none"/>
    </svg>`;
  };

  return { render, mountDefs, hand, arrow, spin, no, drop, water, dryer, sparkle, clump, clumps, HAIR, CORAL };
})();
