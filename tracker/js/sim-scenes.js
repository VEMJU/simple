/* The 3D guide's steps. sim3d.js plays them.
 *
 * A hand is a list of keys. Each key is a moment (t, in seconds) and where the
 * hand is then; the player glides between keys. A value you leave out carries
 * on from the key before. Keys under `both` are mirrored onto the right hand.
 *
 *   az, el   where on the head (az: 0 front, 90 above the ear, 180 back; el: degrees up)
 *   lift     metres off the skin (0 = touching)
 *   contact  1 = the fingertips touch that point, 0 = the palm does
 *   pitch    radians the wrist is raised off the head
 *   yaw      degrees the fingers are turned from "pointing up the head"
 *   roll     radians the hand is twisted round its fingers
 *   tilt     0 = palm faces the head, 1 = palm faces up, -1 = palm faces down
 *   circle   size of small circles on the spot, in degrees
 *   wig      size of a quick side-to-side wiggle, in degrees
 *   free     1 = ignore az/el and hold the hand in the air at x, y, z (metres);
 *            palm and fingers then give the directions the palm faces and the fingers point
 *   pose     a hand shape from POSES
 *
 * A scene also sets the hair: wet (0 to 1), cast (gel shine, 0 to 1), volume
 * (1 = normal), glow (zones lit while worked), plus fx ('shower' or 'spray'),
 * blob (product in a palm), arrows, and no (shows the "Don't" badge).
 */
export const POSES = {
  flat:    { f: [0.05, 0.05, 0.05], th: [0, 0, 0] },
  claw:    { f: [0.4, 0.8, 0.5],    th: [0.2, 0.2, 0.3] },
  rake:    { f: [0.25, 0.6, 0.4],   th: [0.1, 0.2, 0.2] },
  cup:     { f: [0.4, 0.5, 0.35],   th: [0.15, 0.2, 0.2] },
  clasp:   { f: [0.55, 0.5, 0.3],   th: [0.25, 0.3, 0.2] },
  grip:    { f: [0.8, 0.8, 0.45],   th: [0.35, 0.35, 0.3] },
  squeeze: { f: [0.95, 1.1, 0.6],   th: [0.4, 0.4, 0.4] },
  pinch:   { f: [1.0, 1.1, 0.6],    idx: [0.5, 0.7, 0.3],   th: [0.5, 0.3, 0.3] },
  point:   { f: [1.1, 1.2, 0.7],    idx: [0.1, 0.1, 0.05],  th: [0.5, 0.4, 0.3] },
};

const SH = 'Shampoo', CO = 'Conditioner', ST = 'Styling', DR = 'Dry and finish', DA = 'Every day';
const AWAY = { az: 110, el: -55, lift: 0.42, tilt: 0, yaw: 0, pitch: 0, contact: 0, circle: 0, pose: 'flat' };
const TIPS = { contact: 1, pitch: 0.5, pose: 'claw' };

/** One scrunch, 4.6 s long: cup under the curls, lift from elFrom to elTo, close, hold, let go. */
const scrunch = (t, az, elFrom, elTo) => [
  { t, az, el: elFrom, lift: 0.14, tilt: 0.75, yaw: 100, contact: 0, pitch: 0, pose: 'cup' },
  { t: t + 0.8, lift: 0.1 },
  { t: t + 2.0, el: elTo, lift: 0.05 },
  { t: t + 2.4, pose: 'squeeze' },
  { t: t + 3.4, pose: 'squeeze' },
  { t: t + 3.8, pose: 'cup' },
  { t: t + 4.6, el: elFrom, lift: 0.14 },
];

/** One gentle squeeze of the hair, 2.8 s long. */
const squeezeOut = (t, az, el) => [
  { t, az, el, lift: 0.1, tilt: 0.3, yaw: 70, contact: 0, pose: 'cup' },
  { t: t + 0.8, lift: 0.045 },
  { t: t + 1.4, pose: 'squeeze' },
  { t: t + 2.2, pose: 'cup' },
  { t: t + 2.8, lift: 0.1 },
];

/** Product in the left palm (r = blob radius in metres), then both palms rubbed together. */
const amount = (id, group, title, r, sizeText, rubText) => ({
  id, group, short: 'How much', title, cam: [0.18, 0.16, 1.0], wet: 1, dur: 7.4,
  blob: { hand: 0, r: r * 1.15, from: 0, to: 3.7 },
  parts: [{ from: 0, to: 3.3, text: sizeText }, { from: 3.3, to: 7.4, text: rubText }],
  left: [{ t: 0, free: 1, x: 0.06, y: -0.14, z: 0.24, palm: [0, 0.8, 0.6], fingers: [-0.6, 0.1, 0.5], pose: 'cup' }],
  right: [
    { t: 0, free: 1, x: 0.24, y: -0.06, z: 0.24, palm: [0, -0.8, -0.6], fingers: [-0.6, 0.1, 0.5], pose: 'flat' },
    { t: 2.7 },
    { t: 3.5, x: -0.05, y: -0.115 },
    { t: 3.7, circle: 4 },
    { t: 6.5, circle: 4 },
    { t: 6.7, circle: 0 },
    { t: 7.4, x: 0.24, y: -0.06 },
  ],
});

const sidesDown = [
  { t: 0, az: 88, el: 44, lift: 0.08, yaw: 50, contact: 0, pitch: 0, pose: 'flat' },
  { t: 0.5, lift: 0.022 },
  { t: 2.0, el: 2 },
  { t: 2.4, lift: 0.08 },
  { t: 3.2, el: 44 },
  { t: 3.6, lift: 0.022 },
];
const SIDE_ARROWS = [{ from: [86, 44], to: [86, 2], both: true }];
const BACK_UP = [{ from: [150, -42], to: [150, 0], lift: 0.1, both: true }];

export const SCENES = [
  /* ---------- Shampoo ---------- */
  {
    id: 'wet', group: SH, short: 'Wet', title: 'Wet your hair',
    cam: 'three', wet: 1, fx: 'shower', dur: 6,
    parts: [
      { from: 0, to: 3, text: 'Warm water, not hot.' },
      { from: 3, to: 6, text: 'Soak for about 30 seconds, until every part is wet.' },
    ],
  },
  amount('shampoo-amount', SH, 'Shampoo: about 1 teaspoon', 0.014,
    'About 1 teaspoon: a puddle the size of a large coin in your palm.',
    'Rub your hands together. Then press them onto the top of your head.'),
  {
    id: 'shampoo-top', group: SH, short: 'Top', title: 'Shampoo: small circles on top',
    cam: 'three', wet: 1, glow: ['top', 'fringe'], dur: 7,
    parts: [
      { from: 0, to: 2.6, text: 'Fingertip pads on the scalp, not nails. Start at the front hairline.' },
      { from: 2.6, to: 7, text: 'Small circles. Move back across the top. The skin gets washed, not the long hair.' },
    ],
    both: [
      { t: 0, az: 26, el: 42, lift: 0.1, yaw: -70, ...TIPS },
      { t: 0.6, lift: 0.004, circle: 4 },
      { t: 2.6, az: 28, el: 46 },
      { t: 6.2, az: 42, el: 72 },
      { t: 6.6, lift: 0.1, circle: 0 },
      { t: 7, az: 26, el: 42 },
    ],
  },
  {
    id: 'shampoo-back', group: SH, short: 'Back', title: 'Shampoo: crown, back, behind the ears',
    cam: 'back', wet: 1, glow: ['back', 'top'], dur: 9.6,
    parts: [
      { from: 0, to: 5.4, text: 'Small circles from the crown down the back, to the nape of your neck.' },
      { from: 5.4, to: 9.6, text: 'Then behind your ears.' },
    ],
    both: [
      { t: 0, az: 150, el: 62, lift: 0.1, ...TIPS },
      { t: 0.6, lift: 0.004, circle: 4 },
      { t: 3, az: 155, el: 10 },
      { t: 5, az: 160, el: -30 },
      { t: 5.4, lift: 0.08, circle: 0 },
      { t: 6.2, az: 114, el: -12 },
      { t: 6.7, lift: 0.004, circle: 3 },
      { t: 8.6, az: 114, el: -24 },
      { t: 9, lift: 0.1, circle: 0 },
      { t: 9.6, az: 150, el: 62 },
    ],
  },
  {
    id: 'shampoo-sides', group: SH, short: 'Sides', title: 'Shampoo: sides go down only',
    cam: 'three', wet: 1, glow: ['sideL', 'sideR'], dur: 3.4, arrows: SIDE_ARROWS,
    parts: [
      { from: 0, to: 1.7, text: 'Fingertips at the temple. Slide straight down to just above the ear.' },
      { from: 1.7, to: 3.4, text: 'Lift off, go back to the top, repeat. No circles here: circles puff the sides out.' },
    ],
    both: [
      { t: 0, az: 84, el: 46, lift: 0.004, ...TIPS },
      { t: 1.6, el: 2 },
      { t: 2.0, lift: 0.06 },
      { t: 2.9, el: 46 },
      { t: 3.4, lift: 0.004 },
    ],
  },
  {
    id: 'rinse', group: SH, short: 'Rinse', title: 'Rinse the shampoo out',
    cam: 'side', wet: 1, fx: 'shower', dur: 7,
    parts: [
      { from: 0, to: 3.5, text: 'Tip your head back a little. Let the water run through.' },
      { from: 3.5, to: 7, text: 'Gently squeeze the hair until the water runs clear. No rubbing.' },
    ],
    both: [...squeezeOut(0.5, 140, -15), ...squeezeOut(3.7, 125, 30), { t: 7, az: 140, el: -15 }],
  },

  /* ---------- Conditioner ---------- */
  amount('cond-amount', CO, 'Conditioner: a quarter-size blob', 0.012,
    'Squeeze some water out of your hair first. Then a blob the size of a quarter.',
    'Rub your hands together.'),
  {
    id: 'cond-ends', group: CO, short: 'Ends first', title: 'Conditioner: ends first, never the scalp',
    cam: [0.88, 0.12, -0.12], wet: 1, glow: ['back', 'top', 'fringe'], dur: 8,
    arrows: [{ from: [150, 12], to: [150, -36], both: true, lift: 0.08 }],
    parts: [
      { from: 0, to: 2.6, text: '"Ends" are the tips, the part farthest from your scalp. Slide your hands from the middle of the hair out to the tips.' },
      { from: 2.6, to: 5.2, text: 'Same on top: from the middle outward. Keep it off the skin.' },
      { from: 5.2, to: 8, text: 'Then the fringe: smooth down over the front pieces.' },
    ],
    both: [
      { t: 0, az: 150, el: 12, lift: 0.1, contact: 0, pitch: 0, pose: 'clasp' },
      { t: 0.5, lift: 0.035 },
      { t: 1.7, el: -36, lift: 0.05 },
      { t: 2.1, lift: 0.1 },
      { t: 2.9, az: 45, el: 76 },
      { t: 3.3, lift: 0.04 },
      { t: 4.4, el: 50, lift: 0.055 },
      { t: 4.8, lift: 0.1 },
      { t: 5.6, az: 14, el: 52 },
      { t: 6, lift: 0.035 },
      { t: 7, el: 22, lift: 0.04 },
      { t: 7.5, lift: 0.1 },
      { t: 8, az: 150, el: 12 },
    ],
  },
  {
    id: 'cond-scrunch', group: CO, short: 'Scrunch', title: 'Conditioner: scrunch it upward',
    cam: 'back', wet: 1, glow: ['back', 'top'], dur: 9.8, arrows: BACK_UP,
    parts: [
      { from: 0, to: 1.4, text: 'Scrunch: cup your hand under the tips of the curls.' },
      { from: 1.4, to: 2.4, text: 'Lift straight up toward your scalp. The hair folds into your palm.' },
      { from: 2.4, to: 4.7, text: 'Close your hand gently. Hold 1 to 2 seconds. Open and pull away.' },
      { from: 4.7, to: 9.8, text: 'Other side. Then the top and the fringe, 3 or 4 scrunches in all. Head upright. Never the sides.' },
    ],
    left: [...scrunch(0, 150, -48, -6), { t: 5.4, ...AWAY }],
    right: [{ t: 0, ...AWAY }, { t: 4.2, ...AWAY }, ...scrunch(4.7, 150, -48, -6), { t: 9.8, ...AWAY }],
  },
  {
    id: 'cond-rinse', group: CO, short: 'Wait, rinse', title: 'Wait, then rinse cool',
    cam: 'three', wet: 1, fx: 'shower', dur: 9,
    parts: [
      { from: 0, to: 3, text: 'Leave it on 2 to 3 minutes. Wash your body while you wait.' },
      { from: 3, to: 6, text: 'Rinse lightly with cool water, head tipped back a little. A tiny bit left in is fine.' },
      { from: 6, to: 9, text: 'Wash your face last and rinse your back, so no conditioner stays on your skin.' },
    ],
  },

  /* ---------- Styling ---------- */
  {
    id: 'no-towel', group: ST, short: 'No towel', title: 'Out of the shower: squeeze, do not rub',
    cam: 'side', wet: 1, dur: 7,
    parts: [
      { from: 0, to: 3.5, text: 'No towel rubbing. Squeeze the drips out with your hands.' },
      { from: 3.5, to: 7, text: 'Stop while it is still dripping wet. Put your shirt on now, fast, then style.' },
    ],
    both: [...squeezeOut(0.5, 140, -15), ...squeezeOut(3.7, 125, 30), { t: 7, az: 140, el: -15 }],
  },
  amount('cream-amount', ST, 'Cream: a pea to half a nickel', 0.0075,
    'Curl cream: between a pea and half a nickel. Clean hands, hair dripping wet.',
    'Rub your hands together. The cream goes on the fringe and the sides.'),
  {
    id: 'cream-fringe', group: ST, short: 'Cream: fringe', title: 'Cream: the fringe',
    cam: [-0.58, 0.1, 0.7], wet: 1, glow: ['fringe'], dur: 7.2,
    arrows: [{ from: [-4, 54], to: [-4, 24], lift: 0.07 }],
    parts: [
      { from: 0, to: 2.6, text: 'Squeeze the cream down the fringe, from the hairline to the tips.' },
      { from: 2.6, to: 7.2, text: 'Twist the front pieces into 2 or 3 curls. Leave them resting just over your brows.' },
    ],
    left: [
      { t: 0, az: 14, el: 54, lift: 0.1, yaw: -75, contact: 0, pitch: 0, roll: 0, pose: 'clasp' },
      { t: 0.5, lift: 0.03 },
      { t: 1.8, el: 24, lift: 0.04 },
      { t: 2.2, lift: 0.1 },
      { t: 2.8, az: 13, el: 30, lift: 0.09, contact: 0.6, pitch: 0.3, pose: 'pinch' },
      { t: 3.3, lift: 0.012 },
      { t: 4.0, roll: 1.4 },
      { t: 4.6, roll: 0 },
      { t: 5.2, roll: 1.4 },
      { t: 5.8, roll: 0 },
      { t: 6.3, lift: 0.1 },
      { t: 7.2, az: 14, el: 54, contact: 0, pitch: 0, pose: 'clasp' },
    ],
  },
  {
    id: 'cream-sides', group: ST, short: 'Cream: sides', title: 'Cream: sides pressed flat',
    cam: 'three', wet: 1, glow: ['sideL', 'sideR'], dur: 3.6, arrows: SIDE_ARROWS,
    parts: [
      { from: 0, to: 2, text: 'Sides: flat hands. Smooth the cream in.' },
      { from: 2, to: 3.6, text: 'Press flat and slide down toward your ears. No scrunching here.' },
    ],
    both: sidesDown,
  },
  amount('gel-amount', ST, 'Gel: a nickel-size blob', 0.0105,
    'Gel: a blob the size of a nickel. This goes on the top and the back.',
    'Rub until both palms are shiny and slippery all over. That is what "coated" means.'),
  {
    id: 'gel-glaze', group: ST, short: 'Gel: glaze', title: 'Gel 1: glaze over the surface',
    cam: [0.62, 0.36, 0.6], wet: 1, glow: ['top', 'back'], dur: 5.6,
    arrows: [{ from: [28, 56], to: [150, 45], both: true, lift: 0.075 }],
    parts: [
      { from: 0, to: 2.6, text: 'Flat hands. Lightly smooth over the top, front to back, like petting a dog.' },
      { from: 2.6, to: 5.6, text: 'Carry on down the back. Stay on the surface. Do not dig your fingers in.' },
    ],
    both: [
      { t: 0, az: 28, el: 56, lift: 0.12, contact: 0, pitch: 0, pose: 'flat' },
      { t: 0.6, lift: 0.05 },
      { t: 2.6, az: 150, el: 45 },
      { t: 4, az: 160, el: -15, lift: 0.055 },
      { t: 4.5, lift: 0.13 },
      { t: 5.6, az: 28, el: 56, lift: 0.12 },
    ],
  },
  {
    id: 'gel-squeeze', group: ST, short: 'Gel: squeeze', title: 'Gel 2: squeeze it down the hair',
    cam: 'back', wet: 1, glow: ['back', 'top'], dur: 7,
    arrows: [{ from: [150, 34], to: [150, -40], both: true, lift: 0.085 }],
    parts: [
      { from: 0, to: 3.4, text: 'Squeeze: fingers close together. Pull your hand down the hair, from the root toward the tip.' },
      { from: 3.4, to: 7, text: 'Like squeezing water down a ribbon. Squeeze goes down. Scrunch goes up.' },
    ],
    both: [
      { t: 0, az: 150, el: 34, lift: 0.1, contact: 0, pitch: 0, pose: 'clasp' },
      { t: 0.5, lift: 0.034 },
      { t: 1.0, pose: 'grip' },
      { t: 2.6, el: -40, lift: 0.05 },
      { t: 3.0, pose: 'clasp', lift: 0.1 },
      { t: 3.8, az: 120, el: 62 },
      { t: 4.2, lift: 0.034 },
      { t: 4.7, pose: 'grip' },
      { t: 6.0, az: 118, el: 12, lift: 0.045 },
      { t: 6.4, pose: 'clasp', lift: 0.1 },
      { t: 7, az: 150, el: 34 },
    ],
  },
  {
    id: 'no-rake', group: ST, short: "Don't rake", title: 'Do not rake', no: true,
    cam: 'back', wet: 1, dur: 3.6,
    parts: [{ from: 0, to: 3.6, text: 'Do not rake through with spread-out fingers. It pulls the curls apart and makes frizz.' }],
    left: [
      { t: 0, az: 150, el: 64, lift: 0.08, contact: 1, pitch: 0.5, pose: 'rake' },
      { t: 0.5, lift: 0.004 },
      { t: 2.4, el: -30 },
      { t: 2.8, lift: 0.08 },
      { t: 3.6, el: 64 },
    ],
  },
  {
    id: 'gel-scrunch', group: ST, short: 'Gel: scrunch', title: 'Gel 3: scrunch upward',
    cam: 'back', wet: 1, glow: ['back', 'top'], dur: 14.4, arrows: BACK_UP,
    parts: [
      { from: 0, to: 4.7, text: 'Cup under the curls, lift up to your head, close gently, hold 1 to 2 seconds, let go.' },
      { from: 4.7, to: 9.4, text: 'Other side. Do not drag your hand through the hair when you let go.' },
      { from: 9.4, to: 14.4, text: 'Then the top. One round is 5 or 6 scrunches: back, crown, top left, top right.' },
    ],
    left: [...scrunch(0, 150, -48, -6), ...scrunch(9.4, 115, 6, 48), { t: 14.4, ...AWAY }],
    right: [{ t: 0, ...AWAY }, { t: 4.2, ...AWAY }, ...scrunch(4.7, 150, -48, -6), { t: 10, ...AWAY }],
  },
  {
    id: 'gel-sides', group: ST, short: 'Gel: sides', title: 'Sides: only what is left on your hands',
    cam: 'three', wet: 1, glow: ['sideL', 'sideR'], dur: 3.6, arrows: SIDE_ARROWS,
    parts: [
      { from: 0, to: 2, text: 'If the sides puff or frizz: no new gel, only what is left on your hands.' },
      { from: 2, to: 3.6, text: 'Press flat over the cream and slide down.' },
    ],
    both: sidesDown,
  },

  /* ---------- Dry and finish ---------- */
  {
    id: 'hands-off', group: DR, short: 'Hands off', title: 'Hands off until 100% dry',
    cam: [0.6, 0.14, -0.68], wet: 0.35, cast: 1, dur: 11,
    parts: [
      { from: 0, to: 3.6, text: 'Do not touch it for 1.5 to 2 hours. It will feel stiff and crunchy. That is normal.' },
      { from: 3.6, to: 7.4, text: 'To check: press one fingertip at the roots on the back of your neck.' },
      { from: 7.4, to: 11, text: 'And at the crown. Cool, soft or darker means still damp: wait 15 to 20 minutes more.' },
    ],
    left: [
      { t: 0, ...AWAY }, { t: 3.4, ...AWAY },
      { t: 4.5, az: 170, el: -34, lift: 0.07, contact: 1, pitch: 0.4, pose: 'point' },
      { t: 5, lift: 0.008 },
      { t: 6.5, lift: 0.008 },
      { t: 7, lift: 0.07 },
      { t: 7.8, az: 168, el: 62 },
      { t: 8.2, lift: 0.008 },
      { t: 9.6, lift: 0.008 },
      { t: 10.1, lift: 0.08 },
      { t: 11, ...AWAY },
    ],
  },
  {
    id: 'crunch', group: DR, short: 'Break the crunch', title: 'Scrunch out the crunch',
    cam: 'back', wet: 0, cast: 0.5, glow: ['back', 'top'], dur: 9.8, arrows: BACK_UP,
    parts: [
      { from: 0, to: 4.7, text: 'Only when 100% dry. Dry hands: cup the curls and squeeze up gently.' },
      { from: 4.7, to: 9.8, text: 'Keep going round your head until the stiff feel is gone. The wet look turns soft.' },
    ],
    left: [...scrunch(0, 150, -46, -8), { t: 5.4, ...AWAY }],
    right: [{ t: 0, ...AWAY }, { t: 4.2, ...AWAY }, ...scrunch(4.7, 150, -46, -8), { t: 9.8, ...AWAY }],
  },
  {
    id: 'fluff', group: DR, short: 'Fluff roots', title: 'Fluff the roots on top',
    cam: [0.5, 0.4, 0.66], wet: 0, volume: 1.1, glow: ['top'], dur: 7.4,
    parts: [
      { from: 0, to: 0.8, text: 'Slide your fingertips in until they touch the scalp on top.' },
      { from: 0.8, to: 2.4, text: 'Wiggle a little, side to side, staying at the scalp.' },
      { from: 2.4, to: 3.8, text: 'Pull your fingers straight out. Do not comb them through the curls.' },
      { from: 3.8, to: 7.4, text: 'Repeat in 2 or 3 spots on top. Leave the sides alone if you want them flat.' },
    ],
    both: [
      { t: 0, az: 40, el: 62, lift: 0.1, yaw: -60, contact: 1, pitch: 0.6, pose: 'claw' },
      { t: 0.6, lift: 0.004 },
      { t: 0.8, wig: 4 },
      { t: 2.2, wig: 4 },
      { t: 2.4, wig: 0 },
      { t: 3, lift: 0.1 },
      { t: 3.8, az: 110, el: 66, yaw: 40 },
      { t: 4.3, lift: 0.004 },
      { t: 4.5, wig: 4 },
      { t: 5.9, wig: 4 },
      { t: 6.1, wig: 0 },
      { t: 6.7, lift: 0.1 },
      { t: 7.4, az: 40, el: 62, yaw: -60 },
    ],
  },
  {
    id: 'split', group: DR, short: 'Split curls', title: 'Split the big curls, place the fringe',
    cam: [0.12, 0.5, 0.78], wet: 0, volume: 1.1, glow: ['top', 'fringe'], dur: 6.4,
    parts: [
      { from: 0, to: 3, text: 'Take one big curl in both hands. Gently pull it apart into 2 or 3 smaller curls.' },
      { from: 3, to: 6.4, text: 'Fringe: split it into 2 or 3 curls resting just over your brows. Then stop touching.' },
    ],
    both: [
      { t: 0, az: 8, el: 58, lift: 0.09, yaw: -85, contact: 0.6, pitch: 0.3, pose: 'pinch' },
      { t: 0.6, lift: 0.03 },
      { t: 2.2, az: 24 },
      { t: 2.6, lift: 0.09 },
      { t: 3.4, az: 6, el: 30 },
      { t: 3.9, lift: 0.02 },
      { t: 5.2, az: 16 },
      { t: 5.6, lift: 0.09 },
      { t: 6.4, az: 8, el: 58 },
    ],
  },

  /* ---------- Every day ---------- */
  {
    id: 'refresh-spray', group: DA, short: 'Morning: spray', title: 'Morning: spray it damp',
    cam: 'three', wet: 0.4, fx: 'spray', dur: 7,
    parts: [
      { from: 0, to: 3.5, text: 'Spray with water until the hair is damp all over, not soaked.' },
      { from: 3.5, to: 7, text: 'Curls still look fine? Water only. Frizzy or dry? Add a pea of cream on just those spots.' },
    ],
  },
  {
    id: 'refresh-scrunch', group: DA, short: 'Morning: scrunch', title: 'Morning: scrunch and leave it',
    cam: 'back', wet: 0.4, glow: ['back', 'top'], dur: 9.8, arrows: BACK_UP,
    parts: [
      { from: 0, to: 4.7, text: 'Scrunch the top, back and fringe, pushing up gently.' },
      { from: 4.7, to: 9.8, text: 'Hands off for 15 to 30 minutes while it dries. Then fluff. No brush, no comb.' },
    ],
    left: [...scrunch(0, 150, -46, -8), { t: 5.4, ...AWAY }],
    right: [{ t: 0, ...AWAY }, { t: 4.2, ...AWAY }, ...scrunch(4.7, 150, -46, -8), { t: 9.8, ...AWAY }],
  },
  {
    id: 'night', group: DA, short: 'Night', title: 'Night',
    cam: 'three', wet: 0, dur: 6,
    parts: [
      { from: 0, to: 3, text: 'Go to bed with your hair fully dry. Damp hair on a pillow goes flat and frizzy.' },
      { from: 3, to: 6, text: 'Sleep on a satin pillowcase. Wash it once a week.' },
    ],
  },
];
