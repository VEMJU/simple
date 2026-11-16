/* The exact instructions for each 3D step, shown in the panel beside the model.
 * Keyed by the step ids in sim-scenes.js. To change the wording, edit here.
 *
 *   reps    how many times to do the movement
 *   time    how long it takes
 *   count   set only when one loop of the animation is one repetition:
 *           the model then shows "Rep 2 of 5" as it plays
 *   steps   the movement spelled out, in order
 *   avoid   the usual mistakes
 *
 * The numbers are guides for short permed hair, not rules. Close is fine.
 */
const SCRUNCH_HOW = [
  'Cup your hand like you are holding a tennis ball.',
  'Put it under the tips of the curls and lift straight up until your hand touches your head.',
  'Close your hand gently and count "one, two".',
  'Open your hand fully, then move it away.',
];

export const TOTAL = 'Whole wash day: about 15 minutes in the bathroom, then 1.5 to 2 hours of drying.';

export const DETAILS = {
  'wet': {
    reps: 'Once', time: 'About 30 seconds',
    steps: [
      'Set the water to warm. Hot water dries permed hair.',
      'Stand under it and let it run over the top, the back and both sides.',
      'Press the hair with your hand. If water squeezes out everywhere, it is wet enough.',
    ],
    avoid: 'Hot water. Starting the shampoo on hair that is only half wet.',
  },
  'shampoo-amount': {
    reps: 'One blob per wash. Rub your palms 3 or 4 times.', time: 'About 5 seconds',
    steps: [
      'Squeeze about 1 teaspoon into one palm: a puddle about as wide as a quarter coin.',
      'Press your palms together and rub 3 or 4 times, until both palms are covered.',
      'Go straight to the top of your head.',
    ],
    avoid: 'More than a teaspoon. Extra shampoo does not clean better, it only dries the curl.',
  },
  'shampoo-top': {
    reps: 'About 40 small circles: 20 at the hairline, 20 across the top', time: 'About 20 seconds',
    steps: [
      'Both hands, fingers bent, the soft pads of your fingertips on the skin.',
      'Front hairline first: circles the size of a coin, about 2 per second, for 10 seconds.',
      'Move your hands back 2 to 3 cm (1 inch) and repeat. Keep moving back until you reach the top, about 10 more seconds.',
      'Light to medium pressure: the skin should move a little under your fingers.',
    ],
    avoid: 'Nails. Big circles, which tangle the hair. Scrubbing the long hair itself.',
  },
  'shampoo-back': {
    reps: 'About 30 circles down the back, then about 10 behind the ears', time: 'About 20 seconds',
    steps: [
      'Start at the crown, the highest point at the back of your head.',
      'Small circles. Move down a little every 3 or 4 circles until you reach the nape of your neck. About 15 seconds.',
      'Then fingertips behind both ears: about 10 small circles, 5 seconds.',
    ],
    avoid: 'Skipping the nape and behind the ears. That is where itch and flakes start.',
  },
  'shampoo-sides': {
    reps: '4 or 5 slides, both sides at the same time', time: 'About 10 seconds', count: 5,
    steps: [
      'Fingertips at your temples, level with the top of your forehead.',
      'Slide straight down about 8 cm (3 inches) and stop just above your ears. One slide takes about 1 second.',
      'Lift your fingers off, go back to the top, slide again.',
      'Do 4 or 5 slides. That finishes the shampoo: about 1 minute in total.',
    ],
    avoid: 'Circles or pushing upward on the sides. That lifts the hair you want flat.',
  },
  'rinse': {
    reps: '4 or 5 gentle squeezes while the water runs', time: '30 to 60 seconds',
    steps: [
      'Tip your head back a little so the water runs backward, away from your face.',
      'Let it run for about 20 seconds without touching.',
      'Then gently squeeze handfuls of hair, 4 or 5 times around your head.',
      'You are done when the water runs clear and the hair no longer feels slippery.',
    ],
    avoid: 'Rubbing or wringing. A short rinse: leftover shampoo makes the scalp itch.',
  },
  'cond-amount': {
    reps: 'One blob. Rub your palms 3 or 4 times.', time: 'About 10 seconds',
    steps: [
      'First squeeze your hair once or twice, so water is not streaming off it.',
      'A blob the size of a quarter coin in one palm.',
      'Rub your palms together 3 or 4 times so it covers both palms and fingers.',
    ],
    avoid: 'Putting it on streaming-wet hair. It just slides off.',
  },
  'cond-ends': {
    reps: '2 slides on each area: back, top, fringe (6 slides in all)', time: 'About 20 seconds',
    steps: [
      'Back: hold the hair halfway down between your palms and fingers, and slide out to the tips. 2 times.',
      'Top: the same, from the middle of the hair outward to the tips. 2 times.',
      'Fringe: slide down from the middle of the fringe to the tips. 2 times.',
      'What is left on your hands can go on the middle of the hair. Nothing on the first 2 to 3 cm (1 inch) at the roots.',
    ],
    avoid: 'Conditioner on the scalp or roots. It makes the top flat and greasy.',
  },
  'cond-scrunch': {
    reps: '4 scrunches: back left, back right, top, fringe. Hold each 1 to 2 seconds.', time: 'About 15 seconds',
    steps: [...SCRUNCH_HOW, 'One scrunch each: back left, back right, top, fringe.'],
    avoid: 'Scrunching the sides. Flipping your head upside down.',
  },
  'cond-rinse': {
    reps: 'Once', time: 'Wait 2 to 3 minutes, then rinse for 10 to 15 seconds',
    steps: [
      'Leave the conditioner on for 2 to 3 minutes. Wash your body in that time.',
      'Turn the water cooler. Rinse for 10 to 15 seconds with your head tipped back.',
      'Stop when the hair feels smooth, not slimy. A tiny bit left in is fine.',
      'Now wash your face with your cleanser, and rinse your back.',
    ],
    avoid: 'Hot water for the last rinse. Conditioner left on your forehead or back.',
  },
  'no-towel': {
    reps: '4 to 6 gentle squeezes, once each', time: 'About 15 seconds',
    steps: [
      'Step out. Do not use the towel on your hair.',
      'Squeeze handfuls gently, once each: back left, back right, top, fringe.',
      'Stop when water no longer streams down but drops still fall. That is "dripping wet".',
      'Put your shirt on within 2 minutes. If the hair starts to dry, wet it again with your hands.',
    ],
    avoid: 'Rubbing with a towel. Wrapping it. Waiting until it is only damp.',
  },
  'cream-amount': {
    reps: 'One small blob for the fringe and both sides', time: 'About 5 seconds',
    steps: [
      'Squeeze out a blob between a pea and half a nickel.',
      'Rub your palms together 3 or 4 times.',
      'Fringe first, then the sides with what is left.',
    ],
    avoid: 'A full nickel or more. The fringe goes heavy and greasy.',
  },
  'cream-fringe': {
    reps: 'Squeeze down 2 times. Then 2 or 3 curls, each twisted 2 or 3 turns.', time: 'About 20 seconds',
    steps: [
      'Hold the fringe between your fingers and palm at the hairline. Slide down to the tips. 2 times.',
      'Pick up a piece about as wide as your finger.',
      'Twist it 2 or 3 turns, the way it already curls, then let go.',
      'Do that for 2 or 3 pieces across the fringe.',
      'Let them rest just over your brows. Do not touch them again until dry.',
    ],
    avoid: 'Twisting it tight like a rope. More than 3 turns. Combing the fringe.',
  },
  'cream-sides': {
    reps: '3 slides, both sides at the same time', time: 'About 10 seconds', count: 3,
    steps: [
      'Flat hands on the sides, level with your temples, fingers pointing up and back.',
      'Press lightly and slide down to your ears. About 1.5 seconds per slide.',
      'Lift off, go back up, repeat. 3 slides.',
    ],
    avoid: 'Scrunching the sides. Fresh cream here: what is left on your hands is enough.',
  },
  'gel-amount': {
    reps: 'One blob for the top and back. Rub your palms 5 or 6 times.', time: '5 to 10 seconds',
    steps: [
      'A blob the size of a nickel in one palm.',
      'Rub your palms together 5 or 6 times, fingers too.',
      'Both palms should look shiny and feel slippery all over, with no blob left in the middle.',
    ],
    avoid: 'Leaving a blob in one palm. It ends up as one crunchy patch.',
  },
  'gel-glaze': {
    reps: '2 passes, front to back', time: 'About 10 seconds', count: 2,
    steps: [
      'Flat hands, fingers together, at the front of the top.',
      'Glide back over the surface of the hair to the crown, barely pressing. About 2 seconds.',
      'Carry on down the back to the neck.',
      'Do the whole pass 2 times. The outside of the hair should look shiny.',
    ],
    avoid: 'Pressing hard. Digging your fingers in. Going back and forth: only front to back.',
  },
  'gel-squeeze': {
    reps: '5 sections, once each: back left, back right, crown, top left, top right', time: 'About 20 seconds',
    steps: [
      'Take a section of hair near the root between your palm and closed fingers.',
      'Squeeze lightly and pull your hand down to the tips. About 1.5 seconds.',
      'Let go at the tips and move to the next section.',
      'One time per section, 5 sections.',
    ],
    avoid: 'Spread fingers (that is raking). Squeezing the same section again and again: it pulls the curl straight.',
  },
  'no-rake': {
    reps: 'Never', time: '',
    steps: [
      'Raking is combing through the hair with your fingers spread apart.',
      'It splits each curl into thin, frizzy strands.',
      'If you already did it: wet that part again and scrunch it 2 times.',
    ],
    avoid: 'Raking, combing or brushing once the gel is in.',
  },
  'gel-scrunch': {
    reps: '5 or 6 scrunches: back left, back right, crown, top left, top right, plus one where it looks flat. Hold each 1 to 2 seconds.', time: 'About 25 seconds',
    steps: [
      ...SCRUNCH_HOW,
      'A squishing sound is good: it means the hair is wet enough.',
      'After the last scrunch, take your hands away and do not touch until dry.',
    ],
    avoid: 'More than 2 rounds. Scrunching the sides. Scrunching the fringe: it is already set with cream.',
  },
  'gel-sides': {
    reps: '2 slides per side, only if the sides puff', time: 'About 5 seconds', count: 2,
    steps: [
      'Look in the mirror. Sides lying flat? Skip this step.',
      'If they puff: flat hands, with only the gel still on them, at your temples.',
      'Press and slide down to your ears. 2 times.',
    ],
    avoid: 'New gel on the sides. Scrunching them.',
  },
  'hands-off': {
    reps: 'Check 2 spots for 2 seconds each. If damp, check again in 15 to 20 minutes.', time: '1.5 to 2 hours of air-drying',
    steps: [
      'After the last scrunch, set a timer for 90 minutes.',
      'Do not touch it, shake it or lean your head on anything.',
      'To check: one fingertip at the roots on the back of your neck, for 2 seconds. Then the same at the crown.',
      'Dry feels room temperature and stiff. Damp feels cool or soft.',
      'Still damp: wait 15 to 20 minutes and check again.',
    ],
    avoid: 'Hats, hoods or headphones. Touching it all over "just to check".',
  },
  'crunch': {
    reps: '8 to 10 gentle scrunches around your head', time: 'About 30 seconds',
    steps: [
      'Your hands must be dry.',
      'Cup a section of curls and squeeze upward gently for 1 second. You will feel the stiff shell crack.',
      'Move round: back, crown, top, fringe.',
      'Stop when nothing feels hard or crunchy any more.',
    ],
    avoid: 'Doing it while any spot is damp: it goes frizzy. Rubbing the curls between your hands.',
  },
  'fluff': {
    reps: '2 or 3 spots on top. Wiggle each for 2 to 3 seconds.', time: 'About 10 seconds',
    steps: [
      'Slide your fingertips in from underneath until they touch the scalp, like you are about to scratch your head.',
      'Wiggle about 1 cm side to side, 4 or 5 times, staying at the scalp.',
      'Pull your fingers straight out.',
      '2 or 3 spots: front of the top, middle, crown.',
    ],
    avoid: 'Pulling your fingers down through the curls. Fluffing the sides if you want them flat.',
  },
  'split': {
    reps: 'Only the 3 to 5 biggest curls, once each. The fringe into 2 or 3 curls.', time: 'About 15 seconds',
    steps: [
      'Find a curl that looks thick or heavy.',
      'Hold it near the tip with both hands and pull gently apart, so it splits in 2 from the tip up to the middle.',
      'Do this to 3 to 5 curls, no more.',
      'Fringe: split it into 2 or 3 curls resting just over your brows.',
      'Then hands off for the day.',
    ],
    avoid: 'Splitting every curl. The more you split, the frizzier it gets.',
  },
  'refresh-spray': {
    reps: '8 to 12 sprays', time: 'About 15 seconds',
    steps: [
      'Hold the bottle about 20 cm (8 inches) from your hair.',
      'Spray the top, the back and the fringe: 8 to 12 sprays in all.',
      'Touch it. It should feel damp, like after light rain, not dripping.',
      'Frizzy or dry spots only: rub a pea of cream between your palms and squeeze it into those spots.',
    ],
    avoid: 'Soaking it: that takes an hour to dry. Cream all over every morning: it builds up.',
  },
  'refresh-scrunch': {
    reps: '5 or 6 scrunches, 1 to 2 seconds each', time: 'About 20 seconds, then 15 to 30 minutes to dry',
    steps: [
      ...SCRUNCH_HOW,
      'Back left, back right, crown, top, fringe.',
      'Leave it alone for 15 to 30 minutes. Then fluff the roots on top.',
    ],
    avoid: 'A brush or comb. Touching it while it dries.',
  },
  'night': {
    reps: 'Every night', time: '',
    steps: [
      'Before bed, press a fingertip to the roots at the back. They must be fully dry.',
      'Sleep on a satin pillowcase.',
      'Wash the pillowcase once a week.',
      'In the morning, go to "Morning: spray".',
    ],
    avoid: 'Going to bed with damp hair.',
  },
};
