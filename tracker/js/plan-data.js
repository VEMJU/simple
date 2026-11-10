/* The hair plan as data. app.js renders it; there is no logic in this file.
 *
 * To change the plan, edit the text here.
 * To replace an animation with your own picture, save it in media/ and list it
 * in `images`, for example:  images: { shampoo: 'media/shampoo.png' }
 * A step's `scene` is the id of an animation in js/scenes/.
 * A step's `video` is a YouTube video: { id, title, channel }.
 *
 * Checked on Nov 9-10, 2026 by web research with an independent re-check of
 * every claim (perm makers, cosmetic chemists, dermatology sources).
 */
const HAIR = {
  perm: { date: '2026-11-07T18:00:00', service: 'Cold perm + down perm', stylist: 'Jane', salon: 'Maison de Mi' },
  mask: { weeklyFor: 4, thenEveryWeeks: 2 },   // deep-conditioner rhythm, in weeks since the perm
  trim: { from: 42, to: 56 },                  // fringe trim window, in days since the perm
  images: {},

  sections: [
    {
      id: 'basics', title: 'How a cold perm works', short: 'Basics',
      rows: [
        { k: 'Curliest when wet', v: 'The curl is strongest wet and relaxes a little as it dries. So product goes on wet hair, and you leave it alone until it is dry.' },
        { k: 'The rods set the maximum', v: 'Nothing at home makes it tighter. Styling decides how much of the curl you keep when dry.' },
        { k: 'Skip curly-girl routines', v: 'Those are for naturally coily hair. You still shampoo, always rinse the conditioner out, and silicones are fine.' },
      ],
    },
    {
      id: 'wash', title: 'Wash day', numbered: true,
      lede: 'Every 2 to 4 days, when the scalp says so. Start 3 to 4 hours before bed if air-drying.',
      steps: [
        {
          id: 'shampoo', title: 'Shampoo the scalp', amount: '1 teaspoon', scene: 'shampoo',
          how: ['Lukewarm water, never hot. Soak the hair first.', 'Fingertip pads, not nails, for about a minute: hairline, crown, behind the ears, nape.', 'On the sides, stroke downward. Leave the lengths alone; the rinse cleans them.'],
          why: 'Oil lives on the scalp. Scrubbing the lengths only dries the curl.',
          video: { id: 'K55oE0fzxXM', title: 'SHOWER ROUTINE For Perm/Curly Hair (2023)', channel: 'LimitlessTommy' },
        },
        {
          id: 'rinse', title: 'Rinse well', scene: 'rinse',
          how: ['Head tilted back, water running down the hair.', 'Keep going until it stops feeling slippery.'],
          why: 'Leftover shampoo dulls the hair and makes the scalp itch.',
        },
        {
          id: 'condition', title: 'Condition and detangle', amount: 'Quarter size', scene: 'condition',
          how: ['Spread it over both palms. Lengths and ends only, most on the ends, nothing on the first inch of roots.', 'While it is in, detangle with your fingers, starting at the ends and working up.', 'Leave it 2 to 3 minutes, then rinse well.'],
          why: 'Permed ends are drier. This is the only time you detangle, ever.',
          video: { id: 'G0TWwaybYrI', title: 'How To Detangle Curly Hair', channel: 'Koby Lomax' },
        },
        {
          id: 'blot', title: 'Squeeze with a T-shirt', scene: 'blot',
          how: ['Squeeze handfuls upward in a cotton T-shirt, 10 to 15 times.', 'Stop as soon as it stops dripping. It should still look clearly wet.', 'Never rub, wring or wrap it.'],
          why: 'Rubbing makes frizz. Product on wetter hair gives tighter clumps.',
          video: { id: 'AFIXvud6IoU', title: 'HOW TO MICROPLOP', channel: 'Jordan Faith' },
        },
        {
          id: 'cream', title: 'Curl cream', amount: 'Nickel size', scene: 'cream',
          how: ['Rub it thin between your palms.', 'Ends first, then the middle. Not the roots, not the sides.', 'Add a small dab only where curls look undefined.'],
          why: 'The cream gives softness and shine. Too much weighs the curl down.',
          video: { id: 'vrvFjs3n3BQ', title: 'Washing And Styling My Perm', channel: 'HadieBoi' },
        },
        {
          id: 'gel', title: 'Gel, then scrunch', amount: 'Nickel size', scene: 'scrunch',
          how: ['Rub it thin on wet palms. Smooth it over the back, then the top, lifting the top layer.', 'Cup the ends, push up toward the scalp, squeeze, let go.', 'Fringe: only what is left on your hands. Never comb or rake after the gel.'],
          why: 'Gel holds the curls apart while they dry.',
          video: { id: '3FN1nv1r8aU', title: 'How To: Scrunch Out The Crunch (SOTC)', channel: 'Shruti Amin' },
        },
        {
          id: 'sides', title: 'Press the sides flat', scene: 'sides',
          how: ['Never scrunch the sides. Smooth them down with flat palms (the trace left on your hands is enough).', 'Drying them: press flat with your palm and aim the air downward, toward the jaw.', 'Hold your palm there until they cool.'],
          why: 'The sides had a down perm. Scrunching or lifting makes them puff out.',
          video: { id: 'n4ktly5Sxks', title: 'HOW TO STYLE A KOREAN MIDDLE PART (DOWN PERM)', channel: 'OPPAinSG' },
        },
        {
          id: 'fringe', title: 'Set the fringe', scene: 'fringe',
          how: ['Split it into 4 to 6 curl groups with one finger.', 'Twist each one loosely around your finger, the way it already curls.', 'Let them fall forward over the eyebrows. Do not touch until dry.'],
          video: { id: 'N1wMuk_aDic', title: 'Long Men’s Fringe on permed hair', channel: 'Serge Slavnov' },
        },
        {
          id: 'dry', title: 'Dry without touching', scene: 'dry',
          how: ['Air-dry hands off. Thick hair takes 3 hours or more.', 'Or a dryer on Warm (never Hot) and Low speed with a diffuser: cup the curls, hold 20 to 30 seconds, move on.', 'Before bed, press your fingertips to the roots at the back. Cool or damp means not dry yet.'],
          why: 'Touching wet curls is where frizz comes from. Damp hair on a pillow flattens and frizzes.',
          video: { id: 'YZjo8d-boeM', title: 'HOW TO USE HAIRDRYER DIFFUSER ON PERMED/CURLED HAIR!', channel: 'FjCuts' },
        },
        {
          id: 'cast', title: 'Break the cast', amount: 'Half a pump', scene: 'cast',
          how: ['Only when fully dry and cool: squeeze the curls until the stiff gel feel is gone.', 'Optional shine: half a pump of serum on your palms, ends only.', 'Skip the serum if the curls look loose. Never on roots or fringe.'],
          why: 'This is what turns stiff, wet-looking curls into soft, glossy ones.',
        },
      ],
    },
    {
      id: 'morning', title: 'Every morning', short: 'Mornings',
      lede: '3 to 7 minutes. Do it first thing, so it dries while you get ready.',
      steps: [
        {
          id: 'refresh', title: 'Refresh', scene: 'refresh',
          how: ['Looks good? Leave it.', 'A few flat or frizzy spots: wet hands or a few sprays of water, scrunch up, re-twist the fringe.', 'Whole head flat: mist until evenly damp, scrunch, dry hands off.', 'No hold: a pea of gel thinned with water, on damp hair only. No serum.'],
          video: { id: 'z-HUJgdMcEE', title: 'Hair Tip: After your perm', channel: 'Curl Cult' },
        },
      ],
    },
    {
      id: 'night', title: 'Every night', short: 'Nights',
      steps: [
        { id: 'sleep', title: 'Sleep on satin', scene: 'sleep', how: ['Hair fully dry.', 'Satin pillowcase. Wash it weekly.'], why: 'Going to bed dry is what protects the curl. Satin just cuts frizz.' },
      ],
    },
    {
      id: 'amounts', title: 'How much is that?', short: 'Amounts',
      steps: [
        {
          id: 'sizes', title: 'Sizes in your palm', scene: 'amounts',
          how: ['Pea: gel for a morning refresh.', 'Dime to nickel: curl cream, gel.', 'Quarter: conditioner.', 'Teaspoon (5 mL): shampoo. Measure a real one once, then you will know it by eye.'],
          video: { id: 'zrp9jSvsNIs', title: 'Too Much vs. Too Little vs. The Right Amount of Product', channel: 'Gena Marie' },
        },
      ],
    },
    {
      id: 'later', title: 'Weekly and beyond', short: 'Weekly',
      rows: [
        { k: 'Weekly', v: 'From wash 2: Aussie 3 Minute Miracle instead of the conditioner (never both), 3 minutes, mostly on the ends. Weekly for 4 weeks, then every 2 weeks.' },
        { k: 'When it feels coated', v: 'Not on a calendar. Gel stops holding, curls limp or greasy: shampoo twice that wash, then the 3 Minute Miracle.' },
        { k: 'Every 6 to 8 weeks', v: 'Fringe trim with Jane, around Dec 19 to Jan 2. Ask her to check the twice-permed ends and take only the growth.' },
        { k: 'Sides', v: 'The down perm fades first, after about 3 to 6 weeks. That is root growth, not you. Keep press-drying; a roots-only redo at a trim is optional.' },
        { k: 'Re-perm', v: 'When the curl will not come back even set wet with gel. Usually about 3 to 4 months (Feb to Mar 2027). Not sooner than 8 to 10 weeks.' },
      ],
    },
    {
      id: 'never', title: 'Never',
      rows: [
        { v: 'Brush or comb dry curls.' },
        { v: 'Flat iron, curling iron, or a dryer on Hot.' },
        { v: 'A hat, hood or headphones on damp hair.' },
        { v: 'Scrunch or diffuse the sides, or tuck damp sides behind your ears.' },
        { v: 'Wax or clay. They kill the shine.' },
        { v: 'Home perm or down-perm kits. Colour or bleach on this perm.' },
      ],
    },
    {
      id: 'fix', title: 'Fix one thing at a time', short: 'Fixes',
      pairs: [
        { k: 'Flat or greasy', v: 'Half the cream and the conditioner, no serum, rinse longer.' },
        { k: 'Frizzy', v: 'Product on wetter hair, hands off while drying, low airflow. Then a little more gel.' },
        { k: 'Crunchy', v: 'Normal before you squeeze. Still crunchy after: not fully dry, or too much gel.' },
        { k: 'Looser when dry', v: 'Normal for a cold perm. Less cream, more gel, apply wetter.' },
        { k: 'Sides sticking out', v: 'Wet the patch to the root, press flat, dry downward, hold until cool.' },
        { k: 'Flakes or itch', v: 'Wash a day sooner, rinse well. Lasts 2 weeks: a zinc pyrithione shampoo on the scalp only. Not Nizoral.' },
      ],
    },
    {
      id: 'next', title: 'After your next perm', short: 'Next perm',
      rows: [
        { k: 'First 48 hours', v: 'No shampoo on perm day. Keep it dry for 48 hours if easy; if it gets wet, nothing is ruined. Nothing tight on your head.' },
        { k: 'Tell the stylist', v: 'Both perm dates (Apr and Nov 2026). Ask her to cut or protect the twice-permed ends. Tighter curls: ask for smaller rods.' },
        { k: '1 to 2 days before', v: 'One double shampoo, no serum or gel after it.' },
      ],
    },
  ],

  watch: [
    { id: 'photo-before', group: 'Before the first wash', if: 'Photograph the dry hair: front, both sides, back.', then: 'Same light each time. You will compare against these.' },
    { id: 'scalp', group: 'Before the first wash', if: 'Check the hairline, nape and sides in a mirror.', then: 'Sore, blistered or weeping: wash gently, put nothing on it, see a doctor.' },
    { id: 'ask-jane', group: 'Before the first wash', if: 'Ask Jane how long her adjustment window is.', then: 'So you know the deadline before judging the curl.' },
    { id: 'tube', group: 'Before the first wash', if: 'Check the Amos tube directions.', then: 'If they differ from this plan (amount, wet or damp), follow the tube.' },

    { id: 'first-wash', group: 'First washes', when: 'Wash 1', if: 'Can come out a bit looser or frizzier.', then: 'Normal. Judge the curl after wash 2, not wash 1.' },
    { id: 'photo-wet', group: 'First washes', when: 'After wash 2', if: 'Photo soaking wet (before product), and again fully dry.', then: 'Curly wet but loose dry = styling. Nearly straight even wet = message Jane with both photos.' },
    { id: 'leave-in', group: 'First washes', when: 'After wash 2', if: 'Ends still feel dry or rough?', then: 'First one extra pea of cream on the last 2 inches. Still dry: a light leave-in on the ends only.' },
    { id: 'milbon', group: 'First washes', when: 'After wash 2', if: 'Not as soft and glossy as salon day?', then: 'Wash 3 with the Amos only, no gel. Still short: buy Milbon Wave Defining Cream 1 from the salon, pea size.' },
    { id: 'looser', group: 'First washes', when: 'By Nov 21', if: 'Most of the curl gone, or an area went straight?', then: 'Message Jane that day with photos.' },

    { id: 'mousse', group: 'Later', when: 'If needed', if: 'Curls go limp by day 2, after the free fixes for two washes?', then: 'Try a mousse on wet hair from the roots, a little gel on top, cream only on the last 2 inches.' },
    { id: 'hold', group: 'Later', when: 'Week 6 to 8', if: 'Curls stop holding?', then: 'Less cream, more gel on wet hair. Ask at the trim if weight can come off the top.' },
    { id: 'diffuser', group: 'Later', when: 'If needed', if: 'Air-drying keeps running into bedtime?', then: 'A clip-on diffuser (if you have a dryer) or the Conair Ionic Ceramic at Target, about $23.' },
    { id: 'swim', group: 'Later', when: 'Pool or sea', if: 'Conditioner in first, swim cap if you can.', then: 'Rinse right after, then shampoo and condition that day.' },
    { id: 'log', group: 'Later', when: 'Week 2 and month 2', if: 'Take a dry-hair photo.', then: 'Show them to Jane before the next perm.' },
  ],

  kitNote: 'About $58, or $65 with the pillowcase. A dryer is optional.',
  kit: [
    { role: 'Shampoo + conditioner', name: 'SheaMoisture Coconut & Hibiscus Curl & Shine', price: '~$18', url: 'https://www.amazon.com/dp/B00SG6NAHK' },
    { role: 'Curl cream', name: 'Amos Professional Curling Essence 2X (check the box says Amos, not Mise-en-scène)', price: '~$16', url: 'https://www.amazon.com/dp/B0FMDQT1L2' },
    { role: 'Gel', name: 'Aussie Instant Freeze Gel, 7 oz tube (not the hairspray)', price: '~$5', url: 'https://www.amazon.com/dp/B000NFCWZ8' },
    { role: 'Shine (optional)', name: 'Garnier Fructis Sleek & Shine Serum', price: '~$7', url: 'https://www.amazon.com/s?k=Garnier+Fructis+Sleek+%26+Shine+Anti-Frizz+Serum+5.1+oz' },
    { role: 'Weekly deep conditioner', name: 'Aussie 3 Minute Miracle Moist', price: '~$7', url: 'https://www.amazon.com/s?k=Aussie+3+Minute+Miracle+Moist+16+oz' },
    { role: 'Morning refresh', name: 'Fine-mist spray bottle', price: '~$3', url: 'https://www.amazon.com/s?k=fine+mist+spray+bottle+hair' },
    { role: 'Optional', name: 'Satin pillowcase', price: '~$7', url: 'https://www.amazon.com/s?k=satin+pillowcase' },
  ],

  videoNote: 'Videos were checked to exist and play; I picked them by title and channel, not by watching all of them. If one does not match the step, skip it.',

  sources: [
    { title: 'Arimino perm FAQ', url: 'https://www.arimino.co.jp/contact/faq/' },
    { title: 'Wella: does a perm damage hair', url: 'https://www.wella.com/professional/en-US/blog/hair-care/does-a-perm-damage-your-hair' },
    { title: 'Zotos perm FAQs', url: 'https://www.marlobeauty.com/pro2pro/18-professional-perm-faqs-answered-/a756/' },
    { title: 'Lab Muffin: how perming works', url: 'https://labmuffin.com/how-does-hair-straightening-and-perming-work/' },
    { title: 'Evans 2021, perm chemistry review', url: 'https://library.scconline.org/v072n01/132' },
  ],
};
