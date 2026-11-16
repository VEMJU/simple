/* Turns the 3D steps into the videos on the Hair plan. Not part of the app.
 *
 * How to re-record after changing a step:
 *   1. node tracker/tools/frame-server.js <folder-for-frames>
 *   2. open http://localhost:8765/sim.html and, in the console:
 *        (await import('./tools/record-videos.js')).record()          // every video
 *        (await import('./tools/record-videos.js')).record(['gel'])   // just some
 *      window.REC shows the progress.
 *   3. join each folder of frames:
 *        ffmpeg -framerate 30 -i <folder>/gel/%05d.jpg -c:v libx264 -crf 25 -preset slow
 *               -pix_fmt yuv420p -movflags +faststart tracker/media/gel.mp4
 *
 * One video per Hair plan step. Each 3D step inside it plays as:
 * title card (how many, how long) > the movement with its captions >
 * the key part again, slowly and close up > what to avoid.
 */
const W = 720, H = 900, FPS = 30, D = 1 / FPS;

/** Hair plan step id > the 3D steps it shows, in order. */
export const VIDEOS = {
  shampoo: ['wet', 'shampoo-amount', 'shampoo-top', 'shampoo-back', 'shampoo-sides'],
  rinse: ['rinse'],
  condition: ['cond-amount', 'cond-ends', 'cond-scrunch', 'cond-rinse'],
  blot: ['no-towel'],
  cream: ['cream-amount', 'cream-fringe', 'cream-sides'],
  gel: ['gel-amount', 'gel-glaze', 'gel-squeeze', 'no-rake', 'gel-scrunch'],
  sides: ['gel-sides'],
  dry: ['hands-off'],
  cast: ['crunch', 'fluff', 'split'],
  refresh: ['refresh-spray', 'refresh-scrunch'],
  sleep: ['night'],
  sizes: ['shampoo-amount', 'cond-amount', 'cream-amount', 'gel-amount'],
};
/** The part of a step worth seeing again slowly: [from, to] in the step's own seconds. */
const SLOW = {
  'shampoo-top': [0.4, 3.0], 'shampoo-sides': [0, 2.0], 'cond-ends': [0.3, 2.2], 'cond-scrunch': [0.6, 3.8],
  'cream-fringe': [2.8, 6.0], 'cream-sides': [0.3, 2.4], 'gel-glaze': [0.4, 4.2], 'gel-squeeze': [0.4, 3.0],
  'gel-scrunch': [0.6, 3.8], 'crunch': [0.6, 3.8], 'fluff': [0.4, 3.2], 'refresh-scrunch': [0.6, 3.8],
};
const LOOPS = { 'shampoo-sides': 2, 'cream-sides': 2, 'gel-sides': 2, 'no-rake': 2, 'gel-glaze': 2 };   // short loops play twice
const CAMS = { front: [0, 0.04, 0.9], side: [0.88, 0.06, 0.16], back: [0.3, 0.04, -0.92], three: [0.52, 0.1, 0.68], top: [0.3, 0.62, 0.52] };

export async function record(only = Object.keys(VIDEOS)) {
  const S = window.SIM;
  const st = window.REC = { video: '', n: 0, done: false, err: null, finished: [] };
  await document.fonts.load('600 52px Fraunces');
  await document.fonts.load('600 30px Figtree');
  S.renderer.setPixelRatio(1);
  S.renderer.setSize(W, H, false);
  S.camera.aspect = W / H;
  S.camera.updateProjectionMatrix();
  S.controls.enableDamping = false;
  S.flags.glow = false;   // natural hair colour in the videos; arrows and captions show where to work

  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const bg = g.createRadialGradient(W / 2, H * 0.25, 30, W / 2, H * 0.4, H * 0.9);
  bg.addColorStop(0, '#3d444d'); bg.addColorStop(1, '#16181c');

  const wrap = (text, maxW) => {
    const lines = []; let cur = '';
    for (const w of text.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const box = (x, y, w, h, r, fill) => { g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
  const DARK = 'rgba(14,16,20,.74)', CORAL = '#ff6b57', RED = '#d92d20';

  /** o = { label, badge, badgeColor, title, lines, caption, accent } */
  function overlay(o) {
    g.textAlign = 'left';
    if (o.label) { g.font = '600 20px Figtree'; g.fillStyle = 'rgba(255,255,255,.78)'; g.fillText(o.label.toUpperCase(), 36, 56); }
    if (o.badge) {
      g.font = '700 20px Figtree';
      const w = g.measureText(o.badge).width + 30;
      box(W - 36 - w, 30, w, 38, 19, o.badgeColor || CORAL);
      g.fillStyle = '#fff'; g.fillText(o.badge, W - 36 - w + 15, 56);
    }
    if (o.title) {
      g.font = '600 50px Fraunces'; const tl = wrap(o.title, W - 96);
      g.font = '500 26px Figtree'; const bl = (o.lines || []).filter(Boolean).flatMap(l => wrap(l, W - 100));
      const h = 44 + tl.length * 58 + (bl.length ? 8 + bl.length * 36 : 0) + 22;
      box(26, H - h - 34, W - 52, h, 26, DARK);
      if (o.accent) box(26, H - h - 34, 8, h, 4, o.accent);
      let y = H - h - 34 + 68;
      g.fillStyle = '#fff'; g.font = '600 50px Fraunces';
      tl.forEach(l => { g.fillText(l, 50, y); y += 58; });
      g.font = '500 26px Figtree'; g.fillStyle = 'rgba(255,255,255,.9)'; y -= 10;
      bl.forEach(l => { g.fillText(l, 52, y); y += 36; });
    }
    if (o.caption) {
      g.font = '600 30px Figtree'; const cl = wrap(o.caption, W - 112);
      const h = cl.length * 40 + 38;
      box(26, H - h - 34, W - 52, h, 22, DARK);
      g.fillStyle = '#fff'; let y = H - h - 34 + 48;
      cl.forEach(l => { g.fillText(l, 54, y); y += 40; });
    }
  }

  const wide = sc => ({ p: (Array.isArray(sc.cam) ? sc.cam : CAMS[sc.cam] || CAMS.three).map(v => v * 1.16), t: [0, -0.04, 0] });
  /** A camera close to the working hand, on the same side as the wide view. */
  function close(sc, t) {
    S.seek(t, 0);
    const vis = S.hands.filter(h => h.rig.visible).map(h => h.rig.position);
    if (!vis.length) return wide(sc);
    const far = vis.length > 1 && vis[0].distanceTo(vis[1]) > 0.2;
    const tx = far ? vis[0].x : vis.reduce((a, p) => a + p.x, 0) / vis.length;
    const ty = far ? vis[0].y : vis.reduce((a, p) => a + p.y, 0) / vis.length;
    const tz = far ? vis[0].z : vis.reduce((a, p) => a + p.z, 0) / vis.length;
    const w = wide(sc).p, d = [w[0] - tx, w[1] - ty, w[2] - tz], len = Math.hypot(...d);
    return { p: [tx + d[0] / len * 0.56, ty + d[1] / len * 0.56, tz + d[2] / len * 0.56], t: [tx * 0.7, ty, tz * 0.7] };
  }

  async function shot(t, dt, cam, ov) {
    S.camera.position.set(...cam.p);
    S.controls.target.set(...cam.t);
    S.seek(t, dt);
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.drawImage(S.renderer.domElement, 0, 0, W, H);
    overlay(ov);
    // toDataURL, not toBlob: toBlob waits for idle time, which a window in the background rarely gets
    const bin = atob(cv.toDataURL('image/jpeg', 0.88).split(',')[1]), jpg = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) jpg[i] = bin.charCodeAt(i);
    const res = await fetch(`http://localhost:8770/${st.video}/${String(st.n++).padStart(5, '0')}.jpg`, { method: 'POST', headers: { 'content-type': 'image/jpeg' }, body: jpg });
    if (!res.ok) throw new Error('frame server said ' + res.status);
  }

  async function playStep(id, { amountOnly = false } = {}) {
    const i = S.scenes.findIndex(s => s.id === id), sc = S.scenes[i], d = S.details[id] || {};
    S.showScene(i);
    const label = `${sc.group} · ${sc.short}`, cam = wide(sc);
    const to = amountOnly ? 3.3 : sc.dur;   // the sizes video shows each blob, not the rubbing
    const text = t => (sc.parts.find(p => t >= p.from && t < p.to) || sc.parts[sc.parts.length - 1]).text;
    const dont = sc.no ? { badge: "✕ Don't", badgeColor: RED } : {};

    for (let k = 0; k < 40; k++) await shot(0, D, cam, { label: sc.group, title: sc.title, lines: [d.reps && 'How many: ' + d.reps, d.time && 'How long: ' + d.time], ...dont });
    for (let loop = 0; loop < (LOOPS[id] || 1); loop++) {
      for (let t = 0; t < to; t += D) await shot(t, D, cam, { label, caption: text(t), ...dont });
    }
    if (SLOW[id] && !amountOnly) {
      const [a, b] = SLOW[id];
      for (let t = a; t < b; t += D * 0.4) await shot(t, D * 0.4, close(sc, t), { label, badge: 'Again, slowly', caption: text(t) });
    }
    if (d.avoid && !amountOnly) {
      for (let k = 0; k < 66; k++) await shot(to - D, D, cam, { label, title: 'Avoid', lines: [d.avoid], accent: RED });
    }
  }

  try {
    for (const name of only) {
      st.video = name; st.n = 0;
      for (const id of VIDEOS[name]) await playStep(id, { amountOnly: name === 'sizes' });
      st.finished.push(`${name}:${st.n}`);
    }
    st.done = true;
  } catch (e) { st.err = String(e); }
}
