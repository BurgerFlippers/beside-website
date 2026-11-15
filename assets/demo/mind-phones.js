/*
 * MindMaintainer app demo: three standalone iPhone-sized web components.
 *
 *   <mind-one-thing></mind-one-thing>   "Today's one thing"
 *   <mind-trends></mind-trends>         "Trends"
 *   <mind-for-you></mind-for-you>       "For you"
 *
 * Load this one script; each element works on its own and needs nothing else on the page.
 * Trends data comes from trends-fixtures.js next to this file (exported from the app's Swift engine,
 * see tools/fixture-export). Copy and rules follow the MindMaintainer Swift sources and
 * docs/demo-page-handoff.md in the app repo. Nothing here reads real data, calls or sends messages.
 */
(() => {
  'use strict';
  if (customElements.get('mind-one-thing')) return;

  // iPhone 18 Pro: 402 × 874 pt (6.3" class, same as iPhone 17 Pro). Change here to resize every phone.
  const PHONE = { width: 402, height: 874, top: 62, bottom: 34, bezel: 11, radius: 56 };
  const SCRIPT_SRC = document.currentScript && document.currentScript.src;

  // ---------------------------------------------------------------- shared helpers

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startOfToday = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
  const daysBack = n => { const d = startOfToday(); d.setDate(d.getDate() - n); return d; };
  const shortDate = d => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  /** Julian day number of a local calendar date, like the app's `Day.jdn`. */
  const jdn = d => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5) + 2440588;
  const mod = (a, n) => ((a % n) + n) % n;

  let trendsPromise;
  function loadTrends() {
    if (window.MIND_TRENDS) return Promise.resolve(window.MIND_TRENDS);
    if (!trendsPromise) {
      trendsPromise = new Promise(resolve => {
        const s = document.createElement('script');
        s.src = new URL('trends-fixtures.js', SCRIPT_SRC || location.href).href;
        s.onload = () => resolve(window.MIND_TRENDS || null);
        s.onerror = () => resolve(null);
        document.head.append(s);
      });
    }
    return trendsPromise;
  }

  // ---------------------------------------------------------------- icons (SF Symbols stand-ins)

  const P = {
    walk: '<circle cx="13" cy="4" r="2"/><path d="m9 22 3-7 3 2v5"/><path d="m11 15 1-6 3 3 3 1"/><path d="m12 9-4 2-1 4"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    dance: '<circle cx="12" cy="4" r="2"/><path d="M5 5l4 4h6l4-5"/><path d="M12 9v5l-4 3 1 5"/><path d="m12 14 4 3-2 5"/>',
    stretch: '<circle cx="12" cy="4" r="2"/><path d="M4 9.5 12 10l8-.5"/><path d="M12 10v5l-3 7"/><path d="m12 15 3 7"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    moon: '<path d="M11 4a7 7 0 0 0 9 9 8.5 8.5 0 1 1-9-9Z"/><path d="M16 2.5h4l-4 4h4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    sparkles: '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z"/>',
    fork: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    carrot: '<path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/><path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/><path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/>',
    cup: '<path d="M10 2v2M14 2v2M6 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
    photo: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    note: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    medcase: '<path d="M12 11v4M14 13h-4M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2"/>',
    drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    signpost: '<path d="M12 3v3M12 13v8M6 6h12l3 3.5-3 3.5H6z"/>',
    sofa: '<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M4 18v2M20 18v2"/>',
    pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    back: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    circle: '<circle cx="12" cy="12" r="10"/>',
    checkFill: '<circle cx="12" cy="12" r="10.5" fill="currentColor" stroke="none"/><path d="m7.5 12.2 3 3 6-6.2" stroke="var(--check-ink)" stroke-width="2.4"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevUD: '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
    tube: '<path d="M9 2v17.5a2.5 2.5 0 0 0 5 0V2M7.5 2h7.5M9 15h5"/><path d="M17 6v12.5a2 2 0 0 0 4 0V6M16 6h6"/>',
    bubbles: '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    person: '<circle cx="12" cy="12" r="10.5" fill="currentColor" stroke="none" opacity=".35"/><circle cx="12" cy="9.5" r="3.5" fill="currentColor" stroke="none"/><path d="M5.5 19c1.4-2.4 3.8-3.6 6.5-3.6s5.1 1.2 6.5 3.6" fill="currentColor" stroke="none"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    addPerson: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  };
  const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name] || P.pill}</svg>`;
  const STATUS = `<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.1-1.2A10.4 10.4 0 0 0 8 .6 10.4 10.4 0 0 0 .9 3.4L2 4.6a8.7 8.7 0 0 1 6-2.4Zm0 3.3c1.4 0 2.6.5 3.6 1.4l1.1-1.2A7 7 0 0 0 8 3.9a7 7 0 0 0-4.7 1.8l1.1 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.3c.5 0 1 .2 1.3.5L8 10.7 6.7 9.3c.3-.3.8-.5 1.3-.5Z"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="18" height="9" rx="2.5"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" opacity=".4"/></svg>`;

  // ---------------------------------------------------------------- tasks (Engine/Planner/SidequestRules.swift, SidequestDemoRules.swift)

  // [id, category, regular title, smaller title]; instructions and minutes are not shown on these pages.
  const CATALOG = [
    ['colour-walk', 'movement', 'Spend a little time in nature', 'Find one thing in your favourite colour'],
    ['one-song', 'movement', 'Move gently to one favourite song', 'Take a short walk around your home'],
    ['new-view', 'movement', 'Take a five-minute walk or roll somewhere nearby', 'Move to a different comfortable spot in your room'],
    ['park-explorer', 'movement', 'Spend 15 minutes in a nearby park', 'Spend two minutes just outside your door'],
    ['tomorrow-you', 'sleep', 'Put one thing ready for tomorrow morning', 'Have a snack at least once today'],
    ['soft-landing', 'sleep', 'Dim the lights and unwind for five minutes tonight', 'Turn off the bedroom lights before bed'],
    ['morning-light', 'sleep', 'Take a five-minute daylight break outside', 'Open the curtains in the morning, close them in the evening'],
    ['cosy-corner', 'sleep', 'Tidy your bedroom', 'Tidy your bedside table'],
    ['easy-snack', 'nutrition', 'Have two easy foods you enjoy together', 'Put a familiar ready-to-eat snack within reach'],
    ['simple-meal', 'nutrition', 'Make a simple meal with three familiar foods', 'Take the first step to prepare a ready meal'],
    ['food-favour', 'nutrition', 'Ask someone to share an easy meal', 'Invite someone to share a snack'],
    ['send-song', 'social', 'Send a friend a song that reminds you of them', 'Send a short hello or an emoji to a friend'],
    ['tea-invite', 'social', 'Invite a friend over for a cup of tea', 'Tell a friend you would like to see them soon'],
    ['walk-talk', 'social', 'Ask a friend to join you for a short walk', 'Ask a friend for a quick call'],
    ['medicine-reminder', 'medicine', 'Check your existing medication reminder', 'Open your medication reminder and check its time'],
    ['medicine-stock', 'medicine', 'Check your medication supply', 'Find your regular medication and check the supply'],
    ['pharmacy-company', 'medicine', 'Ask someone to join a needed pharmacy visit', 'Ask someone if they can help with a pharmacy visit'],
    ['favourite-route', 'movement', 'Walk or roll a familiar route for ten minutes', 'Step outside for a moment'],
    ['stretch-break', 'movement', 'Take a three-minute stretch break', 'Relax your shoulders once'],
    ['quiet-song', 'sleep', 'Choose one calm song for your evening', 'Play a little calm music tonight'],
    ['morning-plan', 'sleep', 'Write down one easy thing for tomorrow morning', 'Choose your first small step for tomorrow'],
    ['easy-breakfast', 'nutrition', 'Put an easy breakfast ready for tomorrow', 'Choose one easy breakfast food'],
    ['food-check', 'nutrition', 'Find one easy meal you already have at home', 'Look in one cupboard for a snack'],
    ['shared-meal', 'nutrition', 'Invite someone to share a simple meal', 'Ask someone about eating together'],
    ['send-photo', 'social', 'Send a friend a photo of something you noticed', 'Send a friend one emoji'],
    ['thank-person', 'social', 'Thank someone for one small thing', 'Send a quick thank-you'],
    ['voice-hello', 'social', 'Send a friend a short voice hello', 'Tell someone you are thinking of them'],
    ['pharmacy-note', 'medicine', 'Save one question for your next pharmacy visit', 'Think of one medication question'],
    ['medicine-place', 'medicine', 'Check your medication is stored as instructed', 'Read the storage line on your medication'],
    ['medicine-routine', 'medicine', 'Review your next scheduled medication reminder', 'Check the next reminder in your tracker'],
  ].map(([id, category, regular, smaller]) => ({ id, category, regular, smaller }));
  const DEMO_EXTRA = [
    ['steady-wake', 'sleep', 'Get up at your usual time tomorrow', 'Check your usual alarm is set'],
    ['regular-meal', 'nutrition', 'Have a meal at your usual time today', 'Have a snack around your usual mealtime'],
    ['daylight-drink', 'movement', 'Have a drink outside or by an open window', 'Sit by a window for a minute'],
    ['small-errand', 'movement', 'Do one small errand outside your home', 'Take out the rubbish'],
    ['favourite-spot', 'movement', 'Visit a café, library or shop you like', 'Step out to your balcony, yard or stairwell'],
    ['new-street', 'movement', 'Walk down a street you rarely take', 'Look out at the street for a minute'],
    ['rest-break', 'sleep', 'Take a couple of breaks today', 'Sit or lie down for five minutes'],
    ['slow-breaths', 'sleep', 'Take ten minutes of slow, calm breathing', 'Take a short moment of calm breathing'],
    ['water-rest', 'nutrition', 'Remember to drink water throughout the day', "Get a glass of water when you're thirsty"],
  ].map(([id, category, regular, smaller]) => ({ id, category, regular, smaller }));
  const QUEST = Object.fromEntries([...CATALOG, ...DEMO_EXTRA].map(q => [q.id, q]));
  const SCORE_KINDS = ['sleep', 'rhythm', 'movement', 'daylight', 'places', 'body'];
  const SCORE_TITLE = { sleep: 'Sleep', rhythm: 'Rhythm', movement: 'Movement', daylight: 'Daylight', places: 'Getting out', body: 'Body' };
  const DEMO_POOLS = {
    sleep: ['soft-landing', 'cosy-corner', 'quiet-song'],
    rhythm: ['tomorrow-you', 'morning-plan', 'steady-wake', 'regular-meal'],
    movement: ['colour-walk', 'one-song', 'new-view', 'favourite-route', 'stretch-break'],
    daylight: ['morning-light', 'park-explorer', 'daylight-drink'],
    places: ['small-errand', 'favourite-spot', 'new-street'],
    body: ['slow-breaths', 'water-rest', 'rest-break'],
  };

  // BesideQuestStyle.brief: the short card text, [regular, smaller].
  const BRIEF = {
    'colour-walk': ['Spend a little time in nature.', 'Find one colourful thing nearby.'],
    'one-song': ['Move gently to a favourite song.', 'Take a short walk around your home.'],
    'new-view': ['Take a short walk somewhere nearby.', 'Move to a different spot in your room.'],
    'park-explorer': ['Spend a little time in a nearby park.', 'Step outside for a breath of fresh air.'],
    'favourite-route': ['Walk or roll a familiar route.', 'Step outside for a moment.'],
    'stretch-break': ['Gently stretch your shoulders, hands or feet.', 'Relax your shoulders once.'],
    'tomorrow-you': ['Put one thing ready for tomorrow morning.', 'Have a snack at least once today.'],
    'soft-landing': ['Dim the lights and unwind before bed.', 'Turn off the bedroom lights before bed.'],
    'morning-light': ['Take a little daylight break outside.', 'Open the curtains in the morning, close them in the evening.'],
    'cosy-corner': ['Tidy your bedroom.', 'Tidy your bedside table.'],
    'quiet-song': ['Listen to a calm song before bed.', 'Listen to a little calm music.'],
    'morning-plan': ['Leave a note with one easy morning action.', 'Choose one easy thing to do tomorrow.'],
    'easy-snack': ['Have two easy foods you enjoy together.', 'Put a familiar snack within reach.'],
    'simple-meal': ['Make an easy meal, like soup and bread.', 'Choose a ready meal or leftovers.'],
    'food-favour': ['Ask someone to share an easy meal.', 'Invite someone to share a snack.'],
    'easy-breakfast': ['Put an easy breakfast ready for tomorrow.', 'Choose a familiar breakfast food.'],
    'food-check': ['Find one easy meal you have at home.', 'Look in one cupboard for a snack.'],
    'shared-meal': ['Invite a friend to share a simple meal.', 'Ask someone about eating together.'],
    'send-song': ['Send a friend a song that made you think of them.', 'Send a friend a quick hello.'],
    'tea-invite': ['Invite a friend over for a cup of tea.', 'Tell a friend you would like to see them.'],
    'walk-talk': ['Ask a friend to join you for a short walk.', 'Ask a friend for a quick call.'],
    'send-photo': ['Send a friend a photo of something you noticed.', 'Send a friend one emoji.'],
    'thank-person': ['Thank someone for one small thing.', 'Send a quick thank-you.'],
    'voice-hello': ['Send a friend a short voice hello.', 'Tell someone you are thinking of them.'],
    'medicine-reminder': ['Check your existing medication reminder.', 'Check the time of your next reminder.'],
    'medicine-stock': ['Check whether your medication needs a refill.', 'Find your regular medication supply.'],
    'pharmacy-company': ['Ask someone to join a needed pharmacy visit.', 'Ask someone about pharmacy help.'],
    'pharmacy-note': ['Write one medication question for your pharmacist.', 'Think of one question for your pharmacist.'],
    'medicine-place': ['Check the storage instructions on your medication.', 'Read the storage line on the packaging.'],
    'medicine-routine': ['Check your reminder against your prescribed schedule.', 'Look at your next medication reminder.'],
    'steady-wake': ['Get up at your usual time tomorrow.', 'Check your usual alarm is set.'],
    'regular-meal': ['Have a meal at your usual time today.', 'Have a snack around your usual mealtime.'],
    'daylight-drink': ['Have a drink outside or by an open window.', 'Sit by a window for a minute.'],
    'small-errand': ['Do one small errand outside your home.', 'Take out the rubbish.'],
    'favourite-spot': ['Visit a café, library or shop you like.', 'Step out to your balcony, yard or stairwell.'],
    'slow-breaths': ['Take ten minutes of slow, calm breathing.', 'Take a short moment of calm breathing.'],
    'water-rest': ['Remember to drink water throughout the day.', "Get a glass of water when you're thirsty."],
    'new-street': ['Walk down a street you rarely take.', 'Look out at the street for a minute.'],
    'rest-break': ['Take a couple of breaks today.', 'Sit or lie down for five minutes.'],
  };
  const brief = (q, smaller) => (BRIEF[q.id] || [q.regular, q.smaller])[smaller ? 1 : 0];

  // BesideQuestStyle.visual
  const VISUAL = {
    walk: ['new-view', 'park-explorer', 'favourite-route', 'walk-talk'], leaf: ['colour-walk'], dance: ['one-song'],
    stretch: ['stretch-break'], shirt: ['tomorrow-you'], moon: ['soft-landing', 'quiet-song'], sun: ['morning-light', 'morning-plan'],
    sparkles: ['cosy-corner'], fork: ['food-favour', 'shared-meal', 'simple-meal', 'food-check'], carrot: ['easy-snack', 'easy-breakfast'],
    cup: ['tea-invite', 'daylight-drink'], photo: ['send-photo'], note: ['send-song'], heart: ['thank-person'], people: ['voice-hello'],
    medcase: ['pharmacy-company', 'pharmacy-note'], alarm: ['steady-wake'], clock: ['regular-meal'], trash: ['small-errand'],
    pin: ['favourite-spot'], wind: ['slow-breaths'], drop: ['water-rest'], signpost: ['new-street'], sofa: ['rest-break'],
  };
  const visualOf = {};
  for (const [name, ids] of Object.entries(VISUAL)) for (const id of ids) visualOf[id] = name;
  const visual = q => visualOf[q.id] || 'pill';

  const CATEGORY_COLOR = { sleep: 'var(--yellow)', movement: 'var(--mint)', nutrition: 'var(--peach)', social: 'var(--lavender)', medicine: 'var(--blue)' };
  const canInvite = q => q.category === 'social' || ['food-favour', 'shared-meal', 'pharmacy-company', 'walk-talk', 'colour-walk', 'park-explorer', 'new-view'].includes(q.id);
  function invitation(q) {
    switch (q.id) {
      case 'tea-invite': return 'Fancy a short visit or a cup of tea together? No big plans needed.';
      case 'food-favour': case 'shared-meal': return 'Would you like to have something easy to eat together? A ready meal is fine.';
      case 'pharmacy-company': return 'Could you keep me company on a pharmacy visit?';
      case 'thank-person': return 'Thanks for being there. I appreciate you.';
      case 'send-photo': return 'I noticed this and thought of you. How are you doing?';
      case 'voice-hello': return 'Hey, just wanted to say hello. How is your day going?';
      case 'send-song': return 'This song made me think of you. How are you doing?';
      case 'walk-talk': case 'colour-walk': case 'park-explorer': case 'new-view': return 'Fancy a short walk or a catch-up together? We can keep it easy.';
      default: return 'Fancy a quick catch-up? It would be nice to hear from you.';
    }
  }

  /** SidequestRules.make: today's live offer from yesterday's scores. */
  function liveOffer(day, signal) {
    const scores = (signal && signal.sc) || {};
    const forceSmall = signal && signal.step === 2;
    const min = keys => { const v = keys.map(k => scores[k]).filter(Number.isFinite); return v.length ? Math.min(...v) : null; };
    const candidates = [];
    const sleep = min(['sleep', 'rhythm']); if (sleep !== null) candidates.push(['sleep', sleep]);
    const movement = min(['movement', 'daylight']); if (movement !== null) candidates.push(['movement', movement]);
    candidates.sort((a, b) => a[1] === b[1] ? (a[0] < b[0] ? -1 : 1) : a[1] - b[1]);
    const small = forceSmall || (candidates.length > 0 && candidates[0][1] < 45);
    let categories, reason;
    if (candidates.length) {
      const first = candidates[0][0];
      categories = [first, first, first];
      if (candidates.length > 1 && candidates[1][1] < 80) categories[2] = candidates[1][0];
      reason = categories[2] !== first ? 'A little support for your sleep and movement, based on shared Health readings.'
        : first === 'sleep' ? 'A small way to support your sleep, based on shared Health readings.' : 'A little movement, based on shared Health readings.';
    } else {
      categories = ['movement', 'nutrition', 'social'];
      reason = 'No comparable Health readings yet. Here are three gentle ideas to choose from.';
    }
    const options = [];
    for (const category of categories) {
      const pool = CATALOG.filter(q => q.category === category && !options.some(o => o.id === q.id));
      if (pool.length) options.push(pool[mod(day, pool.length)]);
    }
    return { options, reason, startsSmall: small, selectedID: null, useSmaller: false, completed: false, alsoDone: [] };
  }

  /** SidequestDemoRules.preview: the six-category "Show more tasks (demo)" rule. */
  function demoPreview(day, scores) {
    const ranked = SCORE_KINDS.map((k, i) => [k, scores[k], i]).filter(r => Number.isFinite(r[1]))
      .sort((a, b) => a[1] === b[1] ? a[2] - b[2] : a[1] - b[1]);
    if (!ranked.length) return { focus: [], options: [], kinds: {}, easy: false };
    const first = ranked[0];
    const picks = [first[0], first[0], first[0]];
    if (ranked.length > 1 && ranked[1][1] < 80) picks[2] = ranked[1][0];
    const options = [], kinds = {};
    for (const kind of picks) {
      const pool = DEMO_POOLS[kind].map(id => QUEST[id]).filter(q => !options.some(o => o.id === q.id));
      if (!pool.length) continue;
      const q = pool[mod(day, pool.length)];
      options.push(q); kinds[q.id] = kind;
    }
    const focus = [];
    for (const k of picks) if (!focus.includes(k)) focus.push(k);
    return { focus, options, kinds, easy: first[1] < 50 };
  }

  // ---------------------------------------------------------------- people (demo contacts, never called or messaged)

  const PEOPLE = [
    { id: 'anna', name: 'Anna Virtanen', relation: 'close' },
    { id: 'konsta', name: 'Konsta', relation: 'friend' },
    { id: 'liisa', name: 'Liisa Koski', relation: 'friend' },
    { id: 'mikko', name: 'Mikko Laine', relation: 'friend' },
  ];
  const firstName = p => p.name.split(' ')[0];
  const TOPICS = [['groceries', 'Grocery shopping'], ['pharmacy', 'Pharmacy visits'], ['cleaning', 'Home cleaning'], ['social', 'Social contact']];
  /** MessageTemplates.reachOut */
  function reachOutText(topic, person) {
    const hi = person ? `Hi ${firstName(person)}! ` : 'Hi! ';
    switch (topic) {
      case 'groceries': return hi + 'Would you have time to go grocery shopping with me, or pick up a few things?';
      case 'pharmacy': return hi + 'Could you give me a hand with a visit to the pharmacy this week?';
      case 'cleaning': return hi + 'Would you have a little time to help me with a task at home?';
      case 'social': return hi + 'Would you like to go for a short walk or have a coffee this week?';
      default: return hi + 'I thought of you. How are you doing?';
    }
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
  }

  // ---------------------------------------------------------------- styles

  const STYLES = `
  :host { display: block; width: 100%; max-width: ${PHONE.width + 2 * PHONE.bezel}px; margin-inline: auto;
    --paper: #000; --surface: #1c1c1e; --fill: rgba(118,118,128,.24); --ink: #fff; --muted: rgba(235,235,245,.6);
    --tertiary: rgba(235,235,245,.3); --sep: rgba(84,84,88,.65); --accent: rgb(194,166,247); --action: rgb(112,71,179);
    --task: rgb(56,43,79); --lavender: rgb(56,41,77); --mint: rgb(48,38,69); --peach: rgb(46,36,61); --yellow: rgb(43,36,59);
    --blue: rgb(38,38,59); --check-ink: rgb(56,43,79); --r: 32px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif; -webkit-font-smoothing: antialiased;
    color: var(--ink); text-align: left; line-height: normal; letter-spacing: normal; }
  * { box-sizing: border-box; }
  button, input, select, textarea { font: inherit; color: inherit; letter-spacing: inherit; }
  button { cursor: pointer; background: none; border: 0; padding: 0; text-align: inherit; -webkit-tap-highlight-color: transparent; }
  button:disabled { cursor: default; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  [hidden] { display: none !important; }
  .fit { width: ${PHONE.width + 2 * PHONE.bezel}px; }
  .device { position: relative; width: ${PHONE.width + 2 * PHONE.bezel}px; height: ${PHONE.height + 2 * PHONE.bezel}px; padding: ${PHONE.bezel}px;
    border-radius: ${PHONE.radius + PHONE.bezel}px; background: #0b0a0d;
    box-shadow: inset 0 0 0 1.5px #4a4352, inset 0 0 0 4px #17151a, 0 30px 70px -20px rgba(0,0,0,.8); }
  .screen { position: relative; width: ${PHONE.width}px; height: ${PHONE.height}px; border-radius: ${PHONE.radius}px; overflow: hidden;
    background: var(--paper); isolation: isolate; }
  .status { position: absolute; inset: 0 0 auto; height: 54px; display: flex; align-items: center; justify-content: space-between;
    padding: 4px 34px 0 52px; font-size: 17px; font-weight: 600; z-index: 30; pointer-events: none; }
  .status-icons { display: flex; gap: 6px; align-items: center; fill: currentColor; }
  .island { position: absolute; left: 50%; top: 11px; width: 124px; height: 36px; margin-left: -62px; border-radius: 20px; background: #000; }
  .home { position: absolute; left: 50%; bottom: 8px; width: 140px; height: 5px; margin-left: -70px; border-radius: 3px; background: #fff; z-index: 40; pointer-events: none; }
  .nav { position: absolute; top: ${PHONE.top - 8}px; left: 0; right: 0; height: 52px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 12px 0 20px; z-index: 5; background: linear-gradient(var(--paper) 70%, transparent); }
  .nav-title { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: .36px; white-space: nowrap; }
  .nav-actions { display: flex; align-items: center; gap: 2px; }
  .content { position: absolute; top: ${PHONE.top + 44}px; left: 0; right: 0; bottom: 0; overflow-y: auto; overscroll-behavior: contain;
    padding-bottom: ${PHONE.bottom + 16}px; scrollbar-width: none; }
  .content::-webkit-scrollbar { display: none; }
  .ic { width: 1em; height: 1em; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
  .muted { color: var(--muted); } .tert { color: var(--tertiary); } .accent { color: var(--accent); }
  .sub { font-size: 15px; letter-spacing: -.24px; } .foot { font-size: 13px; letter-spacing: -.08px; }
  .cap { font-size: 12px; } .cap2 { font-size: 11px; letter-spacing: .06px; }
  .head { font-size: 17px; font-weight: 600; letter-spacing: -.43px; } .body { font-size: 17px; letter-spacing: -.43px; }
  .t3 { font-size: 20px; letter-spacing: -.45px; } .t2 { font-size: 22px; letter-spacing: -.26px; font-weight: 700; }
  .large { font-size: 34px; font-weight: 700; letter-spacing: .4px; }
  .num { font-variant-numeric: tabular-nums; }
  p { margin: 0; }
  .icon-btn { width: 44px; height: 44px; display: grid; place-items: center; color: var(--accent); font-size: 22px; border-radius: 22px; }
  .icon-btn:disabled { color: var(--tertiary); }
  .icon-btn .ic { stroke-width: 2; }
  .link { color: var(--accent); font-size: 15px; font-weight: 600; letter-spacing: -.24px; min-height: 44px; padding: 0 8px; align-self: center; }
  .primary { width: 100%; min-height: 54px; border-radius: 14px; background: var(--action); color: #fff; font-size: 17px; font-weight: 600;
    letter-spacing: -.43px; text-align: center; transition: opacity .15s; }
  .primary:active { opacity: .75; } .primary:disabled { opacity: .4; }
  .text-btn { color: var(--accent); font-size: 15px; letter-spacing: -.24px; min-height: 36px; }

  /* One thing */
  .stack { display: flex; flex-direction: column; gap: 12px; padding: 4px 16px 0; }
  .q-head { display: flex; align-items: center; gap: 4px; }
  .q-head > div:first-child { flex: 1; display: grid; gap: 2px; }
  .q-tools { display: flex; align-items: center; }
  .revert-btn { display: inline-flex; align-items: center; gap: 5px; min-height: 44px; padding: 0 6px 0 4px; color: var(--accent);
    font-size: 15px; font-weight: 600; letter-spacing: -.24px; white-space: nowrap; }
  .revert-btn .ic { font-size: 16px; stroke-width: 2.2; }
  .tile { position: relative; width: 100%; min-height: 150px; padding: 18px 24px; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 8px; border-radius: var(--r); background: var(--task); text-align: center; transition: opacity .2s, box-shadow .2s; }
  .tile .tile-icon { font-size: 36px; color: var(--accent); min-height: 40px; display: grid; place-items: center; }
  .tile .tile-icon .ic { stroke-width: 1.5; }
  .tile .brief { font-size: 17px; font-weight: 600; letter-spacing: -.43px; line-height: 1.29; }
  .tile.picked { box-shadow: inset 0 0 0 2px var(--accent); }
  .tile.faded { opacity: .35; }
  .tile .badge { position: absolute; top: 16px; right: 16px; font-size: 24px; color: var(--accent); }
  button.tile:active { transform: scale(.985); }
  .note { text-align: center; color: var(--accent); }
  .row-links { display: flex; justify-content: center; gap: 24px; padding-top: 4px; }

  /* Demo preview */
  .preview { display: flex; flex-direction: column; gap: 14px; min-height: 100%; padding: 4px 16px 0; }
  .panel { display: grid; gap: 6px; }
  .slider-row { display: grid; grid-template-columns: 82px 1fr 28px; gap: 10px; align-items: center; min-height: 30px; }
  .slider-row .num { text-align: right; }
  input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 30px; margin: 0; background: transparent; cursor: pointer; }
  input[type=range]::-webkit-slider-runnable-track { height: 4px; border-radius: 2px;
    background: linear-gradient(to right, var(--accent) var(--p), rgba(120,120,128,.36) var(--p)); }
  input[type=range]::-moz-range-track { height: 4px; border-radius: 2px; background: rgba(120,120,128,.36); }
  input[type=range]::-moz-range-progress { height: 4px; border-radius: 2px; background: var(--accent); }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; margin-top: -11px; border-radius: 50%; background: #fff;
    box-shadow: 0 .5px 4px rgba(0,0,0,.25), 0 3px 8px rgba(0,0,0,.15); }
  input[type=range]::-moz-range-thumb { width: 26px; height: 26px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 3px 8px rgba(0,0,0,.25); }
  .divider { height: .5px; background: var(--sep); margin: 2px 0; }
  .labeled { display: flex; justify-content: space-between; gap: 12px; }
  .labeled > :last-child { color: var(--muted); text-align: right; }
  .spacer { flex: 1; }
  .pv-cards { display: grid; gap: 8px; }
  .pv-card { display: flex; align-items: center; gap: 14px; min-height: 58px; padding: 10px 16px; border-radius: 18px; background: var(--task); }
  .pv-card > .ic { font-size: 22px; width: 30px; color: var(--accent); stroke-width: 1.6; }
  .pv-card .brief { font-size: 15px; font-weight: 600; letter-spacing: -.24px; }

  /* Trends */
  .page { display: flex; flex-direction: column; gap: 24px; padding: 4px 20px 0; }
  .day-label { font-size: 15px; font-weight: 600; min-width: 46px; text-align: center; font-variant-numeric: tabular-nums; letter-spacing: -.24px; }
  .controls { display: grid; gap: 12px; }
  .segmented { display: grid; grid-template-columns: repeat(3, 1fr); padding: 2px; border-radius: 9px; background: var(--fill); }
  .segmented button { min-height: 30px; border-radius: 7px; font-size: 13px; font-weight: 500; text-align: center; padding: 0 4px; letter-spacing: -.08px; }
  .segmented button[aria-checked=true] { background: #636366; font-weight: 600; box-shadow: 0 3px 8px rgba(0,0,0,.12); }
  .card { background: var(--surface); border-radius: var(--r); }
  .balance { padding: 20px; display: grid; gap: 16px; }
  .bal-top { display: flex; align-items: baseline; gap: 4px; }
  .bal-top .head { flex: 1; }
  .scale { position: relative; height: 18px; }
  .scale-bar { position: absolute; left: 0; right: 0; top: 5px; height: 8px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; }
  .scale-bar span { border-radius: 4px; }
  .dot { position: absolute; top: 0; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: inset 0 0 0 3px #000; }
  .ends { display: flex; justify-content: space-between; }
  .trend { display: grid; gap: 8px; }
  .trend .divider { margin: 4px 0; }
  .chart { display: block; width: 100%; height: 120px; overflow: visible; }
  .chart text { fill: var(--muted); font-size: 10px; font-family: inherit; }
  .demo-label { display: flex; gap: 6px; align-items: center; color: var(--accent); }
  .signals { display: grid; gap: 12px; }
  .signal { position: relative; padding: 4px 16px; }
  .signal + .signal::before { content: ""; position: absolute; top: 0; left: 58px; right: 0; height: .5px; background: var(--sep); }
  .sig-row { width: 100%; display: flex; align-items: center; gap: 14px; padding: 10px 0; }
  .sig-row > .ic { font-size: 22px; width: 28px; color: var(--accent); stroke-width: 1.7; }
  .sig-row .titles { flex: 1; display: grid; gap: 4px; }
  .sig-row .score { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .sig-row .chev { font-size: 14px; color: var(--accent); stroke-width: 2.6; transition: transform .2s; }
  .sig-row[aria-expanded=true] .chev { transform: rotate(90deg); }
  .sig-body { padding: 0 0 12px; display: grid; }
  .metric { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; font-size: 15px; letter-spacing: -.24px; }
  .metric > :last-child { color: var(--muted); text-align: right; }
  .sig-note { padding-top: 4px; }

  /* For you */
  .actions { display: grid; gap: 16px; padding: 4px 20px 0; }
  .action { display: flex; align-items: center; gap: 18px; min-height: 128px; padding: 22px; border-radius: var(--r); background: var(--task); width: 100%; }
  .action > .ic:first-child { font-size: 30px; width: 42px; color: var(--accent); stroke-width: 1.6; }
  .action .titles { flex: 1; display: grid; gap: 6px; }
  .action .t3 { font-weight: 700; }
  .action .chev { font-size: 13px; color: var(--muted); stroke-width: 3; }
  .action:active { opacity: .8; }

  /* Sheets, alerts and toasts */
  .layer { position: absolute; inset: 0; z-index: 20; pointer-events: none; }
  .layer.open { pointer-events: auto; }
  .scrim { position: absolute; inset: 0; background: rgba(0,0,0,.45); animation: fade .25s ease-out; }
  .sheet { --paper: #1c1c1e; --surface: #2c2c2e; --check-ink: #1c1c1e; position: absolute; left: 0; right: 0; bottom: 0; top: ${PHONE.top - 2}px;
    background: var(--paper); border-radius: 38px 38px 0 0; display: flex; flex-direction: column; overflow: hidden; }
  .sheet.enter { animation: rise .32s cubic-bezier(.2,.8,.2,1); }
  .grabber { position: absolute; top: 6px; left: 50%; width: 36px; height: 5px; margin-left: -18px; border-radius: 3px; background: rgba(235,235,245,.3); }
  .sheet-nav { display: grid; grid-template-columns: 70px 1fr 70px; align-items: center; min-height: 56px; padding: 8px 12px 0; }
  .sheet-nav h4 { margin: 0; text-align: center; font-size: 17px; font-weight: 600; letter-spacing: -.43px; }
  .sheet-nav .done { justify-self: end; color: var(--accent); font-size: 17px; font-weight: 600; min-height: 44px; padding: 0 8px; }
  .sheet-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 0 20px ${PHONE.bottom + 24}px; scrollbar-width: none; }
  .sheet-body::-webkit-scrollbar { display: none; }
  .alert-wrap { position: absolute; inset: 0; display: grid; place-items: center; }
  .alert { width: 270px; border-radius: 14px; background: rgba(37,37,39,.96); text-align: center; overflow: hidden; animation: pop .2s ease-out; }
  .alert .alert-text { padding: 19px 16px; display: grid; gap: 4px; }
  .alert h4 { margin: 0; font-size: 17px; font-weight: 600; letter-spacing: -.43px; }
  .alert p { font-size: 13px; line-height: 1.35; }
  .alert button { width: 100%; min-height: 44px; border-top: .5px solid var(--sep); color: var(--accent); font-size: 17px; text-align: center; }
  .alert button.bold { font-weight: 600; }
  .toast { position: absolute; left: 20px; right: 20px; bottom: ${PHONE.bottom + 16}px; z-index: 35; padding: 13px 16px; border-radius: 18px;
    background: rgba(58,58,60,.97); box-shadow: 0 10px 30px rgba(0,0,0,.45); font-size: 15px; line-height: 1.35; letter-spacing: -.24px;
    opacity: 0; transform: translateY(12px); transition: opacity .2s, transform .2s; pointer-events: none; }
  .toast.show { opacity: 1; transform: none; }
  @keyframes rise { from { transform: translateY(100%); } }
  @keyframes fade { from { opacity: 0; } }
  @keyframes pop { from { opacity: 0; transform: scale(1.1); } }
  @media (prefers-reduced-motion: reduce) { .sheet.enter, .scrim, .alert { animation: none; } .tile, .toast, .sig-row .chev { transition: none; } }

  /* Reach out, invite and Get support */
  .sheet-stack { display: flex; flex-direction: column; gap: 22px; padding-top: 6px; }
  .sheet-stack.wide { gap: 26px; }
  .quest-card { padding: 20px; border-radius: var(--r); display: grid; gap: 10px; }
  .people { display: grid; gap: 10px; }
  .person { display: flex; align-items: center; min-height: 72px; padding: 18px; border-radius: var(--r); background: var(--surface); width: 100%; }
  .person.selected { background: var(--mint); }
  .person .titles { flex: 1; display: grid; gap: 4px; }
  .person > .ic { font-size: 24px; color: var(--accent); }
  .person > .ic.off { color: var(--tertiary); }
  .menu { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; min-height: 44px; position: relative; color: var(--accent); font-size: 17px; letter-spacing: -.43px; }
  .menu select { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  .menu .ic { font-size: 13px; stroke-width: 2.4; }
  .menu:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 6px; }
  .disclosure { padding: 18px; border-radius: var(--r); background: var(--peach); }
  .disclosure > button { width: 100%; display: flex; justify-content: space-between; align-items: center; font-size: 17px; font-weight: 600; letter-spacing: -.43px; min-height: 24px; }
  .disclosure > button .ic { font-size: 14px; color: var(--accent); stroke-width: 2.6; transition: transform .2s; }
  .disclosure > button[aria-expanded=true] .ic { transform: rotate(90deg); }
  .disclosure .inner { display: grid; gap: 14px; padding-top: 14px; }
  textarea { width: 100%; min-height: 110px; padding: 10px; border: 0; border-radius: 14px; background: var(--surface); resize: none;
    font-size: 17px; line-height: 1.3; letter-spacing: -.43px; }
  textarea:focus { outline: 2px solid rgba(194,166,247,.6); outline-offset: 0; }
  .draft { padding: 18px; border-radius: var(--r); background: var(--surface); }
  .help-person { display: flex; align-items: center; gap: 16px; width: 100%; min-height: 104px; padding: 20px; border-radius: var(--r); }
  .help-person > .ic:first-child { font-size: 42px; }
  .help-person .titles { flex: 1; display: grid; gap: 5px; }
  .help-person .call { width: 50px; height: 50px; border-radius: 50%; display: grid; place-items: center; background: rgba(28,28,30,.7); font-size: 22px; }
  .help-person .call .ic { stroke-width: 1.8; }
  .emergency { display: flex; align-items: center; gap: 14px; padding: 18px; border-radius: var(--r); background: var(--surface); }
  .emergency > .ic { font-size: 30px; color: var(--muted); }
  .emergency .titles { display: grid; gap: 5px; }
  .loading { padding: 40px 20px; text-align: center; }
  `;

  // ---------------------------------------------------------------- base component

  class MindPhone extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>${STYLES}</style>
        <div class="fit"><div class="device" role="group" aria-roledescription="iPhone demo" aria-label="${esc(this.label)}">
          <div class="screen">
            <div class="status" aria-hidden="true"><span>9:41</span><span class="island"></span><span class="status-icons">${STATUS}</span></div>
            <header class="nav"><h3 class="nav-title"></h3><div class="nav-actions"></div></header>
            <div class="content"></div>
            <div class="layer"></div>
            <div class="toast" role="status" aria-live="polite"></div>
            <div class="home" aria-hidden="true"></div>
          </div>
        </div></div>`;
      this.$ = s => root.querySelector(s);
      root.addEventListener('click', e => {
        const t = e.target.closest('[data-act]');
        if (t && !t.disabled) this.act(t.dataset.act, t, e);
      });
      root.addEventListener('input', e => this.onInput(e.target));
      root.addEventListener('change', e => this.onChange(e.target));
      root.addEventListener('keydown', e => {
        if (e.key !== 'Escape' || !this.state.layer) return;
        e.stopPropagation();
        if (this.state.layer.id === 'replace') this.act('ro-keep'); else this.closeLayer();
      });
      const fit = this.$('.fit');
      const full = PHONE.width + 2 * PHONE.bezel;
      const resize = () => {
        const s = Math.min(1, (this.clientWidth || full) / full);
        fit.style.zoom = s === 1 ? '' : String(s);
      };
      new ResizeObserver(resize).observe(this);
      resize();
      this.state = { layer: null };
      this.init();
    }
    init() { this.render(); }
    onInput() {}
    onChange() {}
    act() {}
    render() {
      const v = this.view();
      this.$('.nav-title').textContent = v.title;
      this.$('.nav-actions').innerHTML = v.actions || '';
      const content = this.$('.content');
      const top = content.scrollTop;
      const key = this.shadowRoot.activeElement && this.shadowRoot.activeElement.dataset.k;
      content.innerHTML = v.body;
      content.scrollTop = top;
      this.renderLayer();
      this.refocus(key);
    }
    refocus(key) {
      if (!key) return;
      const el = this.shadowRoot.querySelector(`[data-k="${CSS.escape(key)}"]`);
      if (el && !el.closest('[inert]')) el.focus({ preventScroll: true });
    }
    renderLayer(enter = false) {
      const layer = this.$('.layer');
      const l = this.state.layer;
      const sheetBody = layer.querySelector('.sheet-body');
      const top = sheetBody ? sheetBody.scrollTop : 0;
      const key = this.shadowRoot.activeElement && this.shadowRoot.activeElement.dataset.k;
      const html = l ? this.layerView(l) : '';
      layer.classList.toggle('open', !!l);
      for (const el of [this.$('.content'), this.$('.nav')]) el.inert = !!l;
      if (!l) { layer.innerHTML = ''; return; }
      if (l.kind === 'alert') {
        layer.innerHTML = `<div class="scrim"></div><div class="alert-wrap"><div class="alert" role="alertdialog" aria-modal="true" aria-labelledby="al-t">
          <div class="alert-text"><h4 id="al-t">${esc(html.title)}</h4>${html.message ? `<p>${esc(html.message)}</p>` : ''}</div>
          ${html.buttons.map(b => `<button type="button" data-act="${b.act}" data-k="al-${b.act}" class="${b.bold ? 'bold' : ''}">${esc(b.label)}</button>`).join('')}
        </div></div>`;
      } else {
        layer.innerHTML = `<div class="scrim" data-act="close-layer"></div>
          <section class="sheet ${enter ? 'enter' : ''}" role="dialog" aria-modal="true" aria-labelledby="sh-t"><div class="grabber"></div>
            <header class="sheet-nav"><span></span><h4 id="sh-t">${esc(html.title)}</h4><button type="button" class="done" data-act="close-layer" data-k="sheet-done">Done</button></header>
            <div class="sheet-body">${html.body}</div></section>`;
        layer.querySelector('.sheet-body').scrollTop = enter ? 0 : top;
      }
      if (enter) {
        const first = layer.querySelector('.alert button, .sheet-nav .done');
        if (first) first.focus({ preventScroll: true });
      } else this.refocus(key);
    }
    openLayer(l) { this.returnFocus = this.shadowRoot.activeElement; this.state.layer = l; this.renderLayer(true); }
    closeLayer() {
      this.state.layer = null;
      this.renderLayer();
      if (this.returnFocus && this.returnFocus.isConnected) this.returnFocus.focus({ preventScroll: true });
    }
    toast(message) {
      const t = this.$('.toast');
      t.textContent = message;
      t.classList.add('show');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => t.classList.remove('show'), 3600);
    }
  }

  // ---------------------------------------------------------------- Reach out / Invite sheet (EverydaySocialView)

  /** Shared by For you (Reach out) and One thing (Invite someone). */
  class ReachOut {
    constructor(phone, quest = null, smaller = false) {
      this.phone = phone;
      this.quest = quest;
      this.smaller = smaller;
      this.inviting = !!quest && canInvite(quest);
      this.topic = '';
      this.writingHelp = false;
      this.personID = this.inviting ? this.people()[0].id : '';
      this.useSuggestion();
    }
    get selected() { return PEOPLE.find(p => p.id === this.personID) || null; }
    people() {
      const ordered = [...PEOPLE].sort((a, b) => {
        if (this.inviting && (a.relation === 'friend') !== (b.relation === 'friend')) return a.relation === 'friend' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      const visible = ordered.slice(0, 3);
      const sel = this.selected;
      if (sel && !visible.some(p => p.id === sel.id)) { visible.pop(); visible.push(sel); }
      return visible;
    }
    useSuggestion() {
      this.generated = this.inviting ? invitation(this.quest) : reachOutText(this.topic, this.selected);
      this.draft = this.generated;
    }
    refreshIfUnedited() { if (!this.draft || this.draft === this.generated) this.useSuggestion(); }
    get title() { return this.inviting ? 'Invite someone' : 'Reach out'; }
    body() {
      const sel = this.selected;
      const empty = !this.draft.trim();
      const intro = this.inviting
        ? `<div class="quest-card" style="background:${CATEGORY_COLOR[this.quest.category]}"><p class="t2">A little company for this?</p><p class="body">${esc(this.smaller ? this.quest.smaller : this.quest.regular)}</p></div>`
        : `<p class="t2">Who would you like to hear from?</p>`;
      const people = this.people().map(p => {
        const on = p.id === this.personID;
        return `<button type="button" class="person ${on ? 'selected' : ''}" data-act="ro-person" data-id="${p.id}" data-k="ro-${p.id}" aria-pressed="${on}">
          <span class="titles"><span class="head">${esc(p.name)}</span><span class="cap muted">${p.relation === 'friend' ? 'Friend' : 'Close person'}</span></span>
          ${icon(on ? 'checkFill' : 'circle', on ? '' : 'off')}</button>`;
      }).join('');
      const more = PEOPLE.length > 3 ? `<label class="menu"><span>${esc(sel && !this.people().slice(0, 3).some(p => p.id === sel.id) ? sel.name : 'More people')}</span>${icon('chevUD')}
        <select data-k="ro-more" data-role="ro-more" aria-label="More people"><option value="">Choose a person</option>${PEOPLE.map(p => `<option value="${p.id}" ${p.id === this.personID ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>` : '';
      let words = '';
      if (sel) {
        const topicName = this.topic ? TOPICS.find(t => t[0] === this.topic)[1] : 'Just say hello';
        words = `<div class="disclosure">
            <button type="button" data-act="ro-help" data-k="ro-help" aria-expanded="${this.writingHelp}">${this.inviting ? 'Change the words' : 'Help me write it'}${icon('chevR')}</button>
            ${this.writingHelp ? `<div class="inner">
              ${this.inviting ? '' : `<label class="menu"><span>${esc(topicName)}</span>${icon('chevUD')}<select data-role="ro-topic" data-k="ro-topic" aria-label="What would help?">
                <option value="" ${!this.topic ? 'selected' : ''}>Just say hello</option>${TOPICS.map(([id, t]) => `<option value="${id}" ${this.topic === id ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`}
              <textarea data-role="ro-draft" data-k="ro-draft" aria-label="Your message">${esc(this.draft)}</textarea>
              <button type="button" class="text-btn" data-act="ro-suggest" data-k="ro-suggest" style="justify-self:start">Use suggested words</button>
            </div>` : ''}
          </div>
          ${this.inviting ? `${this.writingHelp ? '' : `<p class="draft body">${esc(this.draft)}</p>`}
            <button type="button" class="primary" data-act="ro-send" data-k="ro-send" ${empty ? 'disabled' : ''}>Review invite to ${esc(sel.name)}</button>
            <p class="foot muted">You review and send it in Messages.</p>`
          : `<button type="button" class="primary" data-act="ro-send" data-k="ro-send" ${empty ? 'disabled' : ''}>Message ${esc(sel.name)}</button>
            <p class="foot muted">Your message is copied when you tap Message. In Messages, just paste it into the conversation and send.</p>`}`;
      }
      return `<div class="sheet-stack">${intro}<div class="people"><p class="head">Your people</p>${people}${more}</div>${words}</div>`;
    }
    act(name, el) {
      if (name === 'ro-person') { this.pick(el.dataset.id); return true; }
      if (name === 'ro-help') { this.writingHelp = !this.writingHelp; this.phone.renderLayer(); return true; }
      if (name === 'ro-suggest') {
        if (!this.draft || this.draft === this.generated) { this.useSuggestion(); this.phone.renderLayer(); }
        else this.phone.openConfirm();
        return true;
      }
      if (name === 'ro-send') { this.send(); return true; }
      return false;
    }
    pick(id) {
      if (!PEOPLE.some(p => p.id === id)) return;
      this.personID = id;
      this.refreshIfUnedited();
      if (!this.inviting) this.writingHelp = true;
      this.phone.renderLayer();
    }
    input(el) {
      if (el.dataset.role !== 'ro-draft') return false;
      this.draft = el.value;
      const send = this.phone.shadowRoot.querySelector('[data-act="ro-send"]');
      if (send) send.disabled = !this.draft.trim();
      return true;
    }
    change(el) {
      if (el.dataset.role === 'ro-topic') { this.topic = el.value; this.refreshIfUnedited(); this.phone.renderLayer(); return true; }
      if (el.dataset.role === 'ro-more') { if (el.value) this.pick(el.value); return true; }
      return false;
    }
    async send() {
      const sel = this.selected;
      if (!sel || !this.draft.trim()) return;
      const copied = await copyText(this.draft);
      this.phone.closeLayer();
      if (this.inviting) this.phone.toast(copied ? 'Copied. In the app you review and send it in Messages. Nothing is sent from here.' : 'Demo: in the app you review and send this in Messages. Nothing is sent from here.');
      else this.phone.toast(copied ? `Copied. In the app this opens ${firstName(sel)}'s conversation.` : `Demo: in the app this copies your message and opens ${firstName(sel)}'s conversation.`);
    }
  }

  /** Both pages with the Reach out sheet use the same layer handling. */
  const reachOutLayers = {
    openConfirm() { this.state.layer = { kind: 'alert', id: 'replace' }; this.renderLayer(true); },
    reachOutLayer(l) {
      if (l.id === 'replace') return { title: 'Replace your draft?', buttons: [{ act: 'ro-replace', label: 'Use suggested words' }, { act: 'ro-keep', label: 'Keep my words', bold: true }] };
      return { title: this.reach.title, body: this.reach.body() };
    },
    reachOutAct(name, el) {
      if (name === 'ro-replace' || name === 'ro-keep') {
        if (name === 'ro-replace') this.reach.useSuggestion();
        this.state.layer = { kind: 'sheet', id: 'reach' };
        this.renderLayer();
        const s = this.shadowRoot.querySelector('[data-k="ro-suggest"]');
        if (s) s.focus({ preventScroll: true });
        return true;
      }
      return this.state.layer && this.state.layer.id === 'reach' && this.reach.act(name, el);
    },
  };

  // ---------------------------------------------------------------- One thing

  class MindOneThing extends MindPhone {
    get label() { return "MindMaintainer app demo: Today's one thing"; }
    init() {
      this.day = jdn(startOfToday());
      this.state.offer = null;
      this.state.extraPick = null;
      this.state.preview = null;
      this.render();
      loadTrends().then(data => {
        // The web page only shows demo data: today's offer uses the Steady scenario.
        this.signal = data && data.sets && data.sets.steady ? data.sets.steady[0] : null;
        this.state.offer = liveOffer(this.day, this.signal);
        this.render();
      });
    }
    view() {
      const title = "Today's one thing";
      const offer = this.state.offer;
      if (!offer) return { title, body: '<p class="loading muted sub">Loading…</p>' };
      if (this.state.preview) return { title, body: this.previewView() };
      return { title, body: `<div class="stack">${this.questView(offer)}<button type="button" class="link" data-act="preview" data-k="preview">Show more tasks (demo)</button></div>` };
    }
    isDone(offer, id) { return (id === offer.selectedID && offer.completed) || offer.alsoDone.includes(id); }
    questView(offer) {
      const sel = offer.options.find(q => q.id === offer.selectedID);
      const finished = offer.completed;
      const head = `<div class="q-head"><div>
          <p class="sub muted">${!sel ? 'Pick the one that fits today' : finished ? 'Done for today' : 'Your choice for today'}</p>
          ${!sel ? '<p class="foot tert">You can also do more if you feel like it.</p>' : ''}
        </div><div class="q-tools">
          <button type="button" class="icon-btn" data-act="reason" data-k="reason" aria-label="Why these challenges?">${icon('info')}</button>
          ${sel ? `<button type="button" class="revert-btn" data-act="revert" data-k="revert" aria-description="Clears today's choice and anything marked done">${icon('back')}Revert</button>` : ''}
        </div></div>`;
      if (!sel) {
        return head + offer.options.map(q => `<button type="button" class="tile" data-act="choose" data-id="${q.id}" data-k="t-${q.id}"
            aria-label="${esc(brief(q, offer.startsSmall))}"><span class="tile-icon">${icon(visual(q))}</span><span class="brief">${esc(brief(q, offer.startsSmall))}</span></button>`).join('');
      }
      const tiles = offer.options.map(q => {
        const chosen = q.id === sel.id;
        const done = this.isDone(offer, q.id);
        const picked = chosen || this.state.extraPick === q.id;
        const border = picked && !(finished && chosen && this.state.extraPick);
        const cls = `tile ${border ? 'picked' : ''} ${chosen || done || finished ? '' : 'faded'}`;
        const text = brief(q, chosen ? offer.useSmaller : offer.startsSmall);
        const badge = done || chosen ? `<span class="badge" role="img" aria-label="${done ? 'Done' : 'Chosen'}">${icon(done ? 'checkFill' : 'circle')}</span>` : '';
        const inner = `<span class="tile-icon">${icon(visual(q))}</span><span class="brief">${esc(text)}</span>${badge}`;
        if (finished && !done) {
          return `<button type="button" class="${cls}" data-act="extra" data-id="${q.id}" data-k="t-${q.id}" aria-pressed="${this.state.extraPick === q.id}"
            aria-label="${esc(text)}, pick this as an extra">${inner}</button>`;
        }
        return `<div class="${cls}" role="group" aria-label="${esc(text)}${chosen ? ', chosen' : ''}${done ? ', done' : ''}">${inner}</div>`;
      }).join('');
      let after;
      if (!finished) {
        after = `<p class="sub note">A good choice. One small step is enough.</p>
          <button type="button" class="primary" data-act="done" data-k="done">Mark as done</button>
          <div class="row-links">${canInvite(sel) ? '<button type="button" class="text-btn" data-act="invite" data-k="invite">Invite someone</button>' : ''}
            <button type="button" class="text-btn" data-act="remind" data-k="remind">Remind me</button></div>`;
      } else {
        const extras = offer.alsoDone.length;
        const remaining = offer.options.filter(q => !this.isDone(offer, q.id));
        const praise = extras === 0 ? "Well done! You did today's one thing." : extras === 1 ? "One more done. That's a lot to be proud of." : 'All done. What a day. Remember to rest too.';
        after = `<p class="head note" role="status">${praise}</p>`;
        if (this.state.extraPick && remaining.some(q => q.id === this.state.extraPick)) {
          after += '<button type="button" class="primary" data-act="extra-done" data-k="extra-done">Mark as done</button>';
        } else if (remaining.length) {
          after += '<p class="sub muted" style="text-align:center">Feeling like a bit more? Pick another one above. Only if it feels good.</p>';
        }
      }
      return head + tiles + after;
    }
    previewView() {
      const scores = this.state.preview;
      const rows = SCORE_KINDS.map(k => {
        const v = Math.round(scores[k]);
        return `<label class="slider-row"><span class="foot">${SCORE_TITLE[k]}</span>
          <input type="range" min="0" max="100" step="1" value="${v}" data-kind="${k}" data-k="s-${k}" style="--p:${v}%" aria-label="${SCORE_TITLE[k]}">
          <span class="foot num muted" data-val="${k}">${v}</span></label>`;
      }).join('');
      return `<div class="preview">
        <div class="panel"><p class="sub" style="font-weight:600">Scores for this demo</p>${rows}<div class="divider"></div>
          <div class="pv-meta"></div>
          <p class="cap2 muted">The lowest scores choose the tasks. Below 50 they get easier. Demo only: your day is unchanged.</p></div>
        <div class="spacer"></div>
        <div class="pv-cards" aria-live="polite"></div>
        <button type="button" class="link" style="min-height:36px" data-act="hide" data-k="hide">Hide demo</button>
      </div>`;
    }
    renderPreviewResults() {
      const p = demoPreview(this.day, this.state.preview);
      const focus = p.focus.map(k => `${SCORE_TITLE[k]} ${Math.round(this.state.preview[k])}`).join(' · ');
      this.$('.pv-meta').innerHTML = `<div class="labeled foot"><span>Task focus</span><span>${esc(focus)}</span></div>
        <div class="labeled foot" style="margin-top:6px"><span>Task difficulty</span><span>${p.easy ? 'Easy' : 'Normal'}</span></div>`;
      this.$('.pv-cards').innerHTML = p.options.map(q => `<div class="pv-card">${icon(visual(q))}<div style="display:grid;gap:2px">
        <span class="cap muted">${SCORE_TITLE[p.kinds[q.id]]}</span><span class="brief">${esc(brief(q, p.easy))}</span></div></div>`).join('');
    }
    render() { super.render(); if (this.state.preview) this.renderPreviewResults(); }
    onInput(el) {
      if (el.dataset.kind && this.state.preview) {
        const v = Number(el.value);
        this.state.preview[el.dataset.kind] = v;
        el.style.setProperty('--p', `${v}%`);
        this.$(`[data-val="${el.dataset.kind}"]`).textContent = v;
        this.renderPreviewResults();
        return;
      }
      if (this.reach) this.reach.input(el);
    }
    onChange(el) { if (this.reach) this.reach.change(el); }
    act(name, el) {
      const offer = this.state.offer;
      if (this.reachOutAct(name, el)) return;
      switch (name) {
        case 'close-layer': this.closeLayer(); break;
        case 'reason': this.openLayer({ kind: 'alert', id: 'reason' }); break;
        case 'choose': offer.selectedID = el.dataset.id; offer.useSmaller = offer.startsSmall; this.render(); this.focusKey('done'); break;
        case 'revert':
          // SidequestDay.revert(): back to the untouched offer. No choice, nothing done, no extras; the same three options stay.
          Object.assign(offer, { selectedID: null, useSmaller: false, completed: false, alsoDone: [] });
          this.state.extraPick = null; this.render(); this.focusKey(`t-${offer.options[0].id}`); break;
        case 'done': offer.completed = true; this.render(); this.focusKey('reason'); break;
        case 'extra': this.state.extraPick = el.dataset.id; this.render(); this.focusKey('extra-done'); break;
        case 'extra-done':
          if (this.state.extraPick && !this.isDone(offer, this.state.extraPick)) offer.alsoDone.push(this.state.extraPick);
          this.state.extraPick = null; this.render(); break;
        case 'invite': {
          const q = offer.options.find(o => o.id === offer.selectedID);
          this.reach = new ReachOut(this, q, offer.useSmaller);
          this.openLayer({ kind: 'sheet', id: 'reach' });
          break;
        }
        case 'remind': this.toast('Demo: in the app this sets a reminder for your choice.'); break;
        case 'preview': {
          const measured = (this.signal && this.signal.sc) || {};
          this.state.preview = Object.fromEntries(SCORE_KINDS.map(k => [k, Number.isFinite(measured[k]) ? Math.min(100, Math.max(0, measured[k])) : 70]));
          this.$('.content').scrollTop = 0;
          this.render(); this.focusKey('s-sleep'); break;
        }
        case 'hide': this.state.preview = null; this.render(); this.focusKey('preview'); break;
      }
    }
    focusKey(k) { const el = this.shadowRoot.querySelector(`[data-k="${k}"]`); if (el) el.focus({ preventScroll: true }); }
    layerView(l) {
      if (l.id === 'reason') return { title: 'Why these challenges?', message: this.state.offer.reason, buttons: [{ act: 'close-layer', label: 'Done', bold: true }] };
      return this.reachOutLayer(l);
    }
  }
  Object.assign(MindOneThing.prototype, reachOutLayers);

  // ---------------------------------------------------------------- Trends

  const BALANCE = ['#8CCC80', '#EDC74D', '#E67340', '#B32938'];
  const balanceColor = v => v >= 80 ? BALANCE[0] : v >= 60 ? BALANCE[1] : v >= 40 ? BALANCE[2] : BALANCE[3];
  const SCENARIOS = [['steady', 'Steady'], ['someHarderDays', 'A few harder days'], ['harderStretch', 'A harder stretch']];
  const AREAS = [
    { id: 'sleep', title: 'Sleep', icon: 'moon', score: 'sleep', metrics: ['sleep', 'bedtime', 'wake', 'efficiency'], note: 'Compared with your own nights. Too little and too much both count.' },
    { id: 'rhythm', title: 'Daily rhythm', icon: 'history', score: 'rhythm', metrics: ['activeHours'], note: 'A steady daily rhythm is one of the clearest signs of how routines are going.' },
    { id: 'places', title: 'Getting out', icon: 'pin', score: 'places', metrics: ['timeAway', 'places'], note: 'Time away from home and places visited. Collected on this iPhone from install onward.' },
    { id: 'movement', title: 'Movement', icon: 'walk', score: 'movement', metrics: ['steps', 'exercise', 'walkingSpeed'], note: 'An iPhone left on the table counts fewer steps, so a single low day means little.' },
    { id: 'daylight', title: 'Daylight', icon: 'sun', score: 'daylight', metrics: ['daylight'], note: 'Time in daylight from Apple Watch, or estimated from daytime walking.' },
    { id: 'body', title: 'Body', icon: 'heart', score: 'body', metrics: ['heartRate', 'breathing', 'temperature', 'hrv'], note: 'Resting heart rate is the most reliable here. Heart rate variability is noisy on a watch.' },
    { id: 'mind', title: 'How you feel', icon: 'smile', score: null, metrics: ['stateOfMind', 'mindful', 'phq9', 'gad7'], note: 'What you log in the Health app. Not scored; it helps check the other signals.' },
    { id: 'food', title: 'Food', icon: 'fork', score: null, metrics: ['foodEnergy', 'water', 'protein', 'carbs', 'fat'], note: 'Only if you log food. Not scored. A missing log does not mean a skipped meal.' },
  ];
  /** BesideHealthMetric.text */
  function metricText(m, v) {
    if (v === undefined || v === null) return 'No entry for this day';
    if (m.id === 'bedtime' || m.id === 'wake') {
      const total = mod(Math.trunc((v + (m.id === 'bedtime' ? 18 : 0)) * 60), 1440);
      return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    }
    if (m.id === 'efficiency') return `${Math.round(v * 100)} %`;
    if (m.id === 'sleep' || m.id === 'timeAway') return `${Math.trunc(v)} h ${Math.round(v * 60) % 60} min`;
    return `${v.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${m.unit}`;
  }
  /** Monotone cubic path (like Swift Charts' .monotone) through [x, y] points. */
  function monotonePath(pts) {
    if (pts.length < 2) return '';
    const n = pts.length, d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    let path = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) {
      const h = (pts[i + 1][0] - pts[i][0]) / 3;
      path += ` C${(pts[i][0] + h).toFixed(1)},${(pts[i][1] + m[i] * h).toFixed(1)} ${(pts[i + 1][0] - h).toFixed(1)},${(pts[i + 1][1] - m[i + 1] * h).toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)}`;
    }
    return path;
  }

  class MindTrends extends MindPhone {
    get label() { return 'MindMaintainer app demo: Trends'; }
    init() {
      Object.assign(this.state, { offset: 0, scenario: 'steady', open: new Set() });
      this.bindScenarioKeys();
      this.data = undefined;
      this.render();
      loadTrends().then(data => { this.data = data; this.metrics = data ? Object.fromEntries(data.metrics.map(m => [m.id, m])) : {}; this.render(); });
    }
    get maxOffset() { return this.data ? this.data.sets.steady.length - 1 : 0; }
    get entry() { return this.data.sets[this.state.scenario][this.state.offset]; }
    view() {
      const o = this.state.offset;
      const actions = `<button type="button" class="icon-btn" data-act="prev" data-k="prev" aria-label="Previous day" ${!this.data || o >= this.maxOffset ? 'disabled' : ''}>${icon('chevL')}</button>
        <span class="day-label" aria-live="polite">${o === 0 ? 'Today' : shortDate(daysBack(o))}</span>
        <button type="button" class="icon-btn" data-act="next" data-k="next" aria-label="Next day" ${o === 0 ? 'disabled' : ''}>${icon('chevR')}</button>`;
      if (this.data === undefined) return { title: 'Trends', actions, body: '<p class="loading muted sub">Loading…</p>' };
      if (!this.data) return { title: 'Trends', actions, body: '<p class="loading muted sub">The demo data couldn’t be loaded.</p>' };
      const e = this.entry;
      const base = !!e.base;
      return { title: 'Trends', actions, body: `<div class="page">${this.controls()}${this.balance(e)}
        <div class="signals"><p class="t3" style="font-weight:700">Your signals</p><div class="card">${AREAS.map(a => this.signal(a, e, base)).join('')}</div></div>
        <p class="cap muted">${this.availability(e)}</p></div>` };
    }
    controls() {
      // The web page only shows demo data, so the app's "Switch to demo data" button and the
      // Send SMS demo are left out (docs/demo-page-handoff.md); the scenario picker is always visible.
      const s = this.state.scenario;
      return `<div class="controls"><p class="sub" id="scenario-label" style="font-weight:600">Change demo scenario</p>
        <div class="segmented" role="radiogroup" aria-labelledby="scenario-label">${SCENARIOS.map(([id, t]) =>
          `<button type="button" role="radio" aria-checked="${s === id}" data-act="scenario" data-id="${id}" data-k="sc-${id}" tabindex="${s === id ? 0 : -1}">${t}</button>`).join('')}</div>
      </div>`;
    }
    balance(e) {
      const v = e.bal;
      const has = typeof v === 'number';
      // balanceTitle with demo data: the reach-out step reads "A contact person would be notified" (the web only shows demo data).
      const title = !has ? 'Learning your usual' : e.step === 2 ? 'A contact person would be notified' : e.step === 1 ? 'A little support could help' : 'Your daily balance';
      const label = `Demo data · ${SCENARIOS.find(x => x[0] === this.state.scenario)[1]}`;
      return `<section class="card balance" aria-label="Daily balance">
        <div class="bal-top"><span class="head">Daily balance</span>${has ? `<span class="large num">${Math.round(v)}</span><span class="cap muted">/100</span>` : ''}</div>
        <p class="t3" style="font-weight:600">${title}</p>
        <div class="scale" aria-hidden="true"><div class="scale-bar">${BALANCE.map(c => `<span style="background:${c}"></span>`).join('')}</div>
          ${has ? `<span class="dot" style="left:calc((100% - 18px) * ${Math.min(1, Math.max(0, 1 - v / 100)).toFixed(4)})"></span>` : ''}</div>
        <div class="ends cap muted"><span>Your usual</span><span>More support</span></div>
        ${this.trend(e)}
        <p class="demo-label cap">${icon('tube')}${label}</p>
      </section>`;
    }
    trend(e) {
      const pts = e.chart || [];
      if (pts.length < 7) return '';
      const last = pts[pts.length - 1][2];
      const W = 322, H = 120, axisW = 26, labelH = 16, plotW = W - axisW, plotH = H - labelH;
      const slot = plotW / pts.length, y = v => plotH - (v / 100) * plotH;
      const grid = [0, 50, 100].map(g => `<line x1="0" x2="${plotW}" y1="${y(g)}" y2="${y(g)}" stroke="rgba(84,84,88,.65)" stroke-width=".5"/>
        <text x="${plotW + 5}" y="${y(g) + 3.5}">${g}</text>`).join('');
      const bars = pts.map(([, v], i) => `<rect x="${(i * slot + slot * .2).toFixed(1)}" y="${y(v).toFixed(1)}" width="${(slot * .6).toFixed(1)}" height="${(plotH - y(v)).toFixed(1)}" rx="2" fill="${balanceColor(v)}" fill-opacity=".55"/>`).join('');
      const line = monotonePath(pts.map(([, , a], i) => [i * slot + slot / 2, a]).filter(p => typeof p[1] === 'number').map(([x, a]) => [x, y(a)]));
      const labels = pts.map(([back], i) => i % 7 === 0 ? `<text x="${(i * slot).toFixed(1)}" y="${H - 2}">${shortDate(daysBack(back))}</text>` : '').join('');
      const drift = e.drift === 0 ? 'Every day this week was near your usual.' : `${e.drift} of the last 7 days were further from your usual.`;
      return `<div class="trend"><div class="divider"></div>
        <div class="bal-top"><span class="sub" style="font-weight:600;flex:1">Last 4 weeks</span>${typeof last === 'number' ? `<span class="sub muted num">7-day average ${Math.round(last)}</span>` : ''}</div>
        <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily balance for the last ${pts.length} days with a 7-day average">${grid}${bars}
          <path d="${line}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${labels}</svg>
        ${typeof e.drift === 'number' ? `<p class="cap muted">${drift}</p>` : ''}</div>`;
    }
    signal(a, e, base) {
      const score = a.score && base && e.sc ? e.sc[a.score] : undefined;
      const r = e.r || {};
      let summary;
      if (typeof score === 'number') summary = score >= 70 ? 'Close to your usual' : 'Different from your usual';
      else {
        const first = a.metrics.find(id => r[id] !== undefined);
        summary = first ? (a.score ? 'Learning your usual' : metricText(this.metrics[first], r[first])) : 'Nothing recorded for this day';
      }
      const open = this.state.open.has(a.id);
      const rows = a.metrics.map(id => `<div class="metric"><span>${esc(this.metrics[id].title)}</span><span>${esc(metricText(this.metrics[id], r[id]))}</span></div>`);
      if (a.id === 'rhythm') {
        for (const [t, key] of [['Bedtime regularity', 'bed'], ['Wake-up regularity', 'wake']]) {
          const s = e[key];
          if (s) rows.push(`<div class="metric"><span>${t}</span><span>± ${Math.round(s[0])} min${typeof s[1] === 'number' ? ` · usually ± ${Math.round(s[1])}` : ''}</span></div>`);
        }
      }
      return `<div class="signal"><button type="button" class="sig-row" data-act="area" data-id="${a.id}" data-k="area-${a.id}" aria-expanded="${open}" aria-controls="ar-${a.id}">
          ${icon(a.icon)}<span class="titles"><span class="head">${a.title}</span><span class="cap muted">${esc(summary)}</span></span>
          ${typeof score === 'number' ? `<span class="score">${Math.round(score)}</span>` : ''}${icon('chevR', 'chev')}</button>
        <div class="sig-body" id="ar-${a.id}" ${open ? '' : 'hidden'}>${rows.join('')}<p class="cap muted sig-note">${a.note}</p></div></div>`;
    }
    availability(e) {
      const total = this.data.metrics.length;
      const count = Object.keys(e.r || {}).length;
      return this.state.offset === 0 ? `Today is still in progress · ${count} of ${total} readings recorded so far.`
        : `${count} of ${total} readings shared for this day. Not every device or tracker records every type.`;
    }
    act(name, el) {
      switch (name) {
        case 'prev': if (this.state.offset < this.maxOffset) { this.state.offset++; this.render(); } break;
        case 'next': if (this.state.offset > 0) { this.state.offset--; this.render(); } break;
        case 'scenario': this.state.scenario = el.dataset.id; this.render(); break;
        case 'area': {
          const id = el.dataset.id;
          if (this.state.open.has(id)) this.state.open.delete(id); else this.state.open.add(id);
          this.render(); break;
        }
      }
    }
    bindScenarioKeys() {
      // Arrow keys move within the scenario picker, like a segmented control.
      this.shadowRoot.addEventListener('keydown', e => {
        const r = e.target.closest && e.target.closest('[data-act="scenario"]');
        if (!r || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        const i = SCENARIOS.findIndex(s => s[0] === this.state.scenario);
        const next = SCENARIOS[mod(i + (e.key === 'ArrowRight' ? 1 : -1), SCENARIOS.length)][0];
        this.state.scenario = next;
        this.render();
        const el = this.shadowRoot.querySelector(`[data-k="sc-${next}"]`);
        if (el) el.focus();
      });
    }
  }

  // ---------------------------------------------------------------- For you

  class MindForYou extends MindPhone {
    get label() { return 'MindMaintainer app demo: For you'; }
    view() {
      const card = (act, title, detail, ic) => `<button type="button" class="action" data-act="${act}" data-k="${act}">${icon(ic)}
        <span class="titles"><span class="t3">${title}</span><span class="sub muted">${detail}</span></span>${icon('chevR', 'chev')}</button>`;
      return { title: 'For you', body: `<div class="actions">
        ${card('reach', 'Reach out', 'A little company, in your own words.', 'bubbles')}
        ${card('support', 'Get support', 'Call someone you know, or find urgent help.', 'people')}</div>` };
    }
    act(name, el) {
      if (this.reachOutAct(name, el)) return;
      switch (name) {
        case 'close-layer': this.closeLayer(); break;
        case 'reach': this.reach = new ReachOut(this); this.openLayer({ kind: 'sheet', id: 'reach' }); break;
        case 'support': this.openLayer({ kind: 'sheet', id: 'support' }); break;
        case 'call': this.toast(`Demo: in the app this would call ${el.dataset.name}. No call is made from here.`); break;
      }
    }
    onInput(el) { if (this.reach) this.reach.input(el); }
    onChange(el) { if (this.reach) this.reach.change(el); }
    layerView(l) {
      if (l.id !== 'support') return this.reachOutLayer(l);
      const people = [...PEOPLE].sort((a, b) => (a.relation === 'close') === (b.relation === 'close') ? 0 : a.relation === 'close' ? -1 : 1);
      const role = p => p.relation === 'close' ? 'Loved one' : 'Friend';
      const emergency = (t, n, d) => `<div class="emergency">${icon('phone')}<div class="titles"><span class="head">${t}</span><span class="body num">${n}</span><span class="cap muted">${d}</span></div></div>`;
      return { title: 'Get support', body: `<div class="sheet-stack wide">
        <div style="display:grid;gap:8px"><p class="large">Your people</p><p class="body muted">You can call someone you know. You don't need to find the right words first.</p></div>
        ${people.map(p => `<button type="button" class="help-person" style="background:${p.relation === 'close' ? 'var(--mint)' : 'var(--lavender)'}" data-act="call" data-name="${esc(p.name)}" data-k="call-${p.id}" aria-label="Call ${esc(p.name)}, ${role(p)} (demo, no call is made)">
          ${icon('person')}<span class="titles"><span class="t2">${esc(p.name)}</span><span class="sub">${role(p)}</span></span><span class="call">${icon('phone')}</span></button>`).join('')}
        <div class="divider" style="margin-top:8px"></div>
        <div style="display:grid;gap:14px"><div style="display:grid;gap:4px"><p class="t2">Emergency</p><p class="sub muted">Demo · these numbers can't be called from here.</p></div>
          ${emergency('MIELI Crisis Helpline', '09 2525 0111', 'Confidential phone support, 24/7')}
          ${emergency('Emergency number', '112', 'Immediate danger to life or health')}</div>
      </div>` };
    }
  }
  Object.assign(MindForYou.prototype, reachOutLayers);

  customElements.define('mind-one-thing', MindOneThing);
  customElements.define('mind-trends', MindTrends);
  customElements.define('mind-for-you', MindForYou);
})();
