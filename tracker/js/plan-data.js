/* The hair plan as data. app.js renders it; there is no logic in this file.
 *
 * To change the plan, edit the text here.
 * To replace an animation with your own picture, save it in media/ and list it
 * in `images`, for example:  images: { shampoo: 'media/shampoo.png' }
 * A step's `scene` is the id of an animation in js/scenes/.
 * A step's `video` is a YouTube video: { id, title, channel, start (seconds) }.
 * A step's `sim` is the id of a step in the 3D guide (sim.html, js/sim-scenes.js).
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
      lede: 'Every 2 to 4 days, when the scalp says so. Mornings look best: start about 2 hours before you leave.',
      steps: [
        {
          id: 'shampoo', title: 'Shampoo the scalp', amount: '1 teaspoon', scene: 'shampoo', sim: 'shampoo-top',
          how: ['Warm water, never hot. Soak the hair for about 30 seconds first.', 'Fingertip pads, not nails, small circles, about a minute: front hairline, top, crown and back, behind the ears.', 'Sides last: from the temple, slide straight down to just above the ear. No circles there.', 'Leave the long hair alone; the suds rinsing down clean it. No scalp scrubber until late November.'],
          why: 'Oil lives on the scalp. Scrubbing the lengths only dries the curl, and circles on the sides puff them out.',
          video: { id: '5-PRy2Jrc9Y', start: 98, title: 'How to Wash Your Hair Properly (shampoo part)', channel: 'TheSalonGuy' },
        },
        {
          id: 'rinse', title: 'Rinse well', scene: 'rinse', sim: 'rinse',
          how: ['Head tipped back a little, water running down the hair.', 'Squeeze gently until the water runs clear.'],
          why: 'Leftover shampoo dulls the hair and makes the scalp itch.',
        },
        {
          id: 'condition', title: 'Condition: ends first', amount: 'Quarter size', scene: 'condition', sim: 'cond-ends',
          how: ['Squeeze some water out, then rub the conditioner between your palms.', 'Ends first (the tips, the part farthest from the scalp): slide your hands from the middle of the hair out to the tips. Back, top, then fringe. Never on the scalp.', 'Scrunch upward 3 or 4 times: top, back, fringe. Not the sides. Head upright.', 'Knots? Loosen them gently with your fingers now, never later.', 'Leave it 2 to 3 minutes (wash your body), then rinse lightly with cool water. Wash your face last.'],
          why: 'Permed ends are the driest part. Conditioner left on skin can cause breakouts.',
          video: { id: '5-PRy2Jrc9Y', start: 301, title: 'How to Wash Your Hair Properly (conditioner part)', channel: 'TheSalonGuy' },
        },
        {
          id: 'blot', title: 'Squeeze, do not rub', scene: 'blot', sim: 'no-towel',
          how: ['No towel rubbing. Squeeze the drips out with your hands (a cotton T-shirt is fine too).', 'Stop while it is still dripping wet.', 'Put your shirt on now, fast, so you never pull it over styled hair.'],
          why: 'Rubbing makes frizz. Product on wetter hair gives tighter clumps.',
        },
        {
          id: 'cream', title: 'Curl cream: fringe and sides', amount: 'Pea to half a nickel', sim: 'cream-fringe',
          how: ['Clean hands. Rub the cream between your palms.', 'Fringe: squeeze it down from the hairline to the tips, then twist the front pieces into 2 or 3 curls resting just over your brows.', 'Sides: smooth it in, press flat and slide down toward your ears.'],
          why: 'Your own test: cream looks best on the fringe and sides. It is softer and less wet-looking than gel.',
        },
        {
          id: 'gel', title: 'Gel: top and back', amount: 'Nickel size', scene: 'scrunch', sim: 'gel-glaze',
          how: ['Rub it until both palms are shiny all over.', 'Glaze: flat hands lightly over the top and back, front to back, like petting a dog.', 'Squeeze: fingers close together, pull your hand down the hair from root toward tip. Never rake with spread fingers.', 'Scrunch: cup under the curls, lift up to your head, close gently, hold 1 to 2 seconds, let go. 5 or 6 around your head.'],
          why: 'Gel holds the curls in clumps while they dry. Squeeze goes down to spread it; scrunch goes up to shape.',
          video: { id: '436IXxrZPhI', start: 412, title: 'Curly Hair Routine (gel part; use less gel, skip the sectioning)', channel: 'Koby Lomax' },
        },
        {
          id: 'sides', title: 'Press the sides flat', scene: 'sides', sim: 'gel-sides',
          how: ['If the sides puff or frizz: only the gel left on your hands, pressed flat over the cream. No new gel.', 'Want to try fluffy sides? Scrunch them gently instead. They will puff and look wider; the down perm keeps them fairly straight.'],
          why: 'The sides had a down perm so they sit close to your head.',
        },
        {
          id: 'dry', title: 'Dry without touching', scene: 'dry', sim: 'hands-off',
          how: ['Hands off for about 1.5 to 2 hours. It will feel stiff and crunchy; that is the gel doing its job.', 'To check, press one fingertip at the roots on the back of your neck and at the crown. Cool, soft or darker means still damp.', 'Or a dryer on Warm and Low with a diffuser: cup the curls, hold 20 to 30 seconds, move on.'],
          why: 'Touching wet curls is where frizz comes from.',
        },
        {
          id: 'cast', title: 'Scrunch out the crunch, then fluff', scene: 'cast', sim: 'crunch',
          how: ['Only when 100% dry: dry hands, cup the curls and squeeze up gently until the stiff feel is gone.', 'Fluff the roots on top: fingertips in to the scalp, a small side-to-side wiggle, pull straight out.', 'Split big curls into 2 or 3 smaller ones. Split the fringe into 2 or 3 curls over your brows. Then stop touching.'],
          why: 'This turns the stiff, wet look into the dry, fluffy look you want.',
          video: { id: '3FN1nv1r8aU', title: 'How To: Scrunch Out The Crunch (25 seconds)', channel: 'Shruti Amin' },
        },
      ],
    },
    {
      id: 'morning', title: 'Every morning', short: 'Mornings',
      lede: '3 to 7 minutes. Do it first thing, so it dries while you get ready.',
      steps: [
        {
          id: 'refresh', title: 'Refresh', scene: 'refresh', sim: 'refresh-spray',
          how: ['Looks good? Leave it.', 'Curls fine but flat or messy: spray with water until damp, scrunch, let it dry.', 'Frizzy or dry spots: water, then a pea of curl cream on just those spots.', 'Hands off 15 to 30 minutes while it dries, then fluff. No brush, no comb.'],
          video: { id: 'z-HUJgdMcEE', title: 'Hair Tip: After your perm', channel: 'Curl Cult' },
        },
      ],
    },
    {
      id: 'night', title: 'Every night', short: 'Nights',
      steps: [
        { id: 'sleep', title: 'Sleep on satin', scene: 'sleep', sim: 'night', how: ['Hair fully dry.', 'Satin pillowcase. Wash it weekly.'], why: 'Going to bed dry is what protects the curl. Satin just cuts frizz.' },
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
    { role: 'Curl cream (using an OKAY Men cream for now)', name: 'Amos Professional Curling Essence 2X (check the box says Amos, not Mise-en-scène)', price: '~$16', url: 'https://www.amazon.com/dp/B0FMDQT1L2' },
    { role: 'Gel', name: 'Aussie Instant Freeze Gel, 7 oz tube (not the hairspray)', price: '~$5', url: 'https://www.amazon.com/dp/B000NFCWZ8' },
    { role: 'Shine (optional)', name: 'Garnier Fructis Sleek & Shine Serum', price: '~$7', url: 'https://www.amazon.com/s?k=Garnier+Fructis+Sleek+%26+Shine+Anti-Frizz+Serum+5.1+oz' },
    { role: 'Weekly deep conditioner', name: 'Aussie 3 Minute Miracle Moist', price: '~$7', url: 'https://www.amazon.com/s?k=Aussie+3+Minute+Miracle+Moist+16+oz' },
    { role: 'Morning refresh', name: 'Fine-mist spray bottle', price: '~$3', url: 'https://www.amazon.com/s?k=fine+mist+spray+bottle+hair' },
    { role: 'Optional', name: 'Satin pillowcase', price: '~$7', url: 'https://www.amazon.com/s?k=satin+pillowcase' },
  ],

  videoNote: 'The shampoo, conditioner and gel videos start at the right moment and were checked by reading what is said in them. Where a video differs from this plan, follow the plan.',

  sources: [
    { title: 'Arimino perm FAQ', url: 'https://www.arimino.co.jp/contact/faq/' },
    { title: 'Wella: does a perm damage hair', url: 'https://www.wella.com/professional/en-US/blog/hair-care/does-a-perm-damage-your-hair' },
    { title: 'Zotos perm FAQs', url: 'https://www.marlobeauty.com/pro2pro/18-professional-perm-faqs-answered-/a756/' },
    { title: 'Lab Muffin: how perming works', url: 'https://labmuffin.com/how-does-hair-straightening-and-perming-work/' },
    { title: 'Evans 2021, perm chemistry review', url: 'https://library.scconline.org/v072n01/132' },
  ],
};
