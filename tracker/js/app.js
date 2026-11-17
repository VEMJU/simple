/* Simple: app logic.
   1 helpers   2 theme   3 views   4 hair plan   5 watch list   6 tracker   7 start */
(() => {
  'use strict';

  /* ---------- 1 helpers ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DAY = 864e5;

  // localStorage can be blocked (private mode). The app still works, it just forgets.
  const store = {
    get(key, fallback) {
      try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* keep working without saving */ }
    },
  };

  /* ---------- 2 theme ---------- */
  $('#themeBtn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* choice lasts for this visit only */ }
  });

  /* ---------- 3 views ---------- */
  const VIEWS = ['plan', 'watch', 'tracker', 'permit'];
  const tabs = $('.tabs');

  function show(view, { scroll = true } = {}) {
    if (!VIEWS.includes(view)) view = 'plan';
    VIEWS.forEach(v => { $('#view-' + v).hidden = v !== view; });
    $$('button', tabs).forEach(b => {
      if (b.dataset.view === view) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    tabs.style.setProperty('--i', VIEWS.indexOf(view));
    if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
    if (scroll) window.scrollTo(0, 0);
  }

  tabs.addEventListener('click', e => {
    const b = e.target.closest('button[data-view]');
    if (b) show(b.dataset.view);
  });
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));

  /* ---------- 4 hair plan ---------- */
  const fmtDate = d => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  function heroHtml() {
    const perm = new Date(HAIR.perm.date);
    const days = Math.max(0, Math.floor((Date.now() - perm) / DAY));
    const week = Math.floor(days / 7) + 1;
    const after = n => fmtDate(new Date(perm.getTime() + n * DAY));
    const mask = week <= HAIR.mask.weeklyFor
      ? `Deep condition weekly · week ${week} of ${HAIR.mask.weeklyFor}`
      : `Deep condition every ${HAIR.mask.thenEveryWeeks} weeks`;
    return `
      <div class="hero reveal">
        <p class="eyebrow">${esc(HAIR.perm.service)} · ${esc(HAIR.perm.stylist)}, ${esc(HAIR.perm.salon)} · ${fmtDate(perm)}</p>
        <h1>Keep the <em>curl.</em></h1>
        <div class="stats">
          <span class="chip accent">Day ${days}</span>
          <span class="chip">${esc(mask)}</span>
          <span class="chip">Fringe trim ${after(HAIR.trim.from)} to ${after(HAIR.trim.to)}</span>
        </div>
        <p class="motion-note"><a class="btn primary" href="sim.html">See every step in 3D</a></p>
      </div>`;
  }

  /** A step's video, recorded from the 3D guide. It loads only when played.
      Its own play button and slider sit clear of the captions in the picture. */
  function mediaHtml(step) {
    if (!step.clip) return '';
    return `<div class="step-media">
      <div class="stage">
        <video src="${esc(step.clip)}" poster="${esc(step.clip.replace(/\.mp4$/, '.jpg'))}" muted loop playsinline preload="none"></video>
        <button class="clip-play" type="button" aria-label="Play or pause the video for ${esc(step.title)}"></button>
      </div>
      <div class="clip-bar">
        <input class="clip-seek" type="range" min="0" max="1000" value="0" aria-label="Position in the video">
        <button class="clip-full" type="button" aria-label="Full screen" title="Full screen"></button>
      </div>
    </div>`;
  }

  const YT_ID = /^[\w-]{11}$/;

  function videoHtml(v) {
    if (!v || !YT_ID.test(v.id)) return '';
    const start = Math.max(0, Math.floor(v.start || 0));
    return `
      <a class="yt" href="https://www.youtube.com/watch?v=${v.id}${start ? `&t=${start}s` : ''}" target="_blank" rel="noopener"
         data-yt="${v.id}" data-start="${start}" data-title="${esc(v.title)}">
        <span class="thumb"><img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy"></span>
        <span>
          <span class="label">Watch how</span>
          <span class="t">${esc(v.title)}</span>
          <span class="c">${esc(v.channel)}${v.length ? ' · ' + esc(v.length) : ''}</span>
        </span>
      </a>`;
  }

  function stepHtml(step, i, numbered) {
    const media = mediaHtml(step);
    return `
      <article class="step glass reveal${media ? '' : ' no-media'}" id="step-${esc(step.id)}" style="--n:${Math.min(i, 6)}">
        ${media}
        <div class="step-body">
          <div class="step-head">
            ${numbered ? `<span class="num">${i + 1}</span>` : ''}
            <h3>${esc(step.title)}</h3>
            ${step.amount ? `<span class="chip accent">${esc(step.amount)}</span>` : ''}
          </div>
          <ul class="how">${step.how.map(line => `<li>${esc(line)}</li>`).join('')}</ul>
          ${step.why ? `<p class="why"><b>Why.</b> ${esc(step.why)}</p>` : ''}
          ${step.sim ? `<a class="btn small sim-link" href="sim.html#${esc(step.sim)}">See it in 3D</a>` : ''}
          ${videoHtml(step.video)}
        </div>
      </article>`;
  }

  const rowsHtml = (rows, pairs) => `
    <div class="card glass reveal">
      <ul class="rows${pairs ? ' pairs' : ''}">
        ${rows.map(r => `<li>${r.k ? `<span class="k">${esc(r.k)}</span>` : ''}<span class="v">${esc(r.v)}</span></li>`).join('')}
      </ul>
    </div>`;

  const sectionHtml = sec => `
    <section class="section" id="sec-${esc(sec.id)}">
      <header>
        <h2>${esc(sec.title)}</h2>
        ${sec.lede ? `<p class="lede">${esc(sec.lede)}</p>` : ''}
      </header>
      ${(sec.steps || []).map((s, i) => stepHtml(s, i, sec.numbered)).join('')}
      ${sec.rows ? rowsHtml(sec.rows, false) : ''}
      ${sec.pairs ? rowsHtml(sec.pairs, true) : ''}
    </section>`;

  const kitHtml = () => `
    <section class="section" id="sec-kit">
      <header><h2>The kit</h2><p class="lede">${esc(HAIR.kitNote)}</p></header>
      <div class="card glass reveal">
        <ul class="rows kit">
          ${HAIR.kit.map(p => `
            <li><a href="${esc(p.url)}" target="_blank" rel="noopener">
              <span class="role">${esc(p.role)}</span>
              <span class="name">${esc(p.name)}</span><span class="price">${esc(p.price)}</span>
            </a></li>`).join('')}
        </ul>
      </div>
      ${HAIR.videoNote ? `<p class="sources">${esc(HAIR.videoNote)}</p>` : ''}
      ${HAIR.sources.length ? `<p class="sources">Checked against: ${HAIR.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(' · ')}</p>` : ''}
    </section>`;

  function renderPlan() {
    const view = $('#view-plan');
    const jump = [...HAIR.sections.map(s => [s.id, s.short || s.title]), ['kit', 'Kit']]
      .map(([id, label]) => `<button class="chip" type="button" data-jump="sec-${esc(id)}">${esc(label)}</button>`).join('');
    view.innerHTML = heroHtml() + `<div class="jump">${jump}</div>` + HAIR.sections.map(sectionHtml).join('') + kitHtml();

    view.addEventListener('click', e => {
      const chip = e.target.closest('[data-jump]');
      if (chip) document.getElementById(chip.dataset.jump)?.scrollIntoView({ block: 'start' });
    });

    // Videos: tap the picture to play or pause, drag the slider to move through it.
    const clipOf = el => el.closest('.step-media')?.querySelector('video');
    view.addEventListener('click', e => {
      if (e.target.closest('.clip-full')) {
        const box = e.target.closest('.step-media');
        if (document.fullscreenElement) document.exitFullscreen();
        else if (box.requestFullscreen) box.requestFullscreen();   // the picture and its slider together
        else clipOf(box).webkitEnterFullscreen?.();                 // iPhone: only the video itself can fill the screen
        return;
      }
      const v = e.target.closest('.stage') && clipOf(e.target);
      if (v) { if (v.paused) v.play(); else v.pause(); }
    });
    ['play', 'pause'].forEach(type => view.addEventListener(type, e => {
      e.target.closest('.stage')?.classList.toggle('is-playing', type === 'play');
    }, true));   // media events do not bubble, so listen on the way down
    view.addEventListener('timeupdate', e => {
      const seek = e.target.closest('.step-media')?.querySelector('.clip-seek');
      if (seek && e.target.duration) seek.value = e.target.currentTime / e.target.duration * 1000;
    }, true);
    view.addEventListener('input', e => {
      const v = e.target.matches('.clip-seek') && clipOf(e.target);
      if (v && v.duration) v.currentTime = e.target.value / 1000 * v.duration;
    });

    // A video that scrolls out of view stops playing.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => { if (!en.isIntersecting) en.target.pause(); });
      }, { threshold: .2 });
      $$('video', view).forEach(v => io.observe(v));
    }
  }

  // YouTube videos play in place when the app is served from a web address. Opened as a
  // local file, YouTube refuses to embed, so the link opens YouTube instead.
  document.addEventListener('click', e => {
    const link = e.target.closest('a.yt');
    if (!link || !/^https?:$/.test(location.protocol) || !YT_ID.test(link.dataset.yt)) return;
    e.preventDefault();
    const frame = document.createElement('div');
    frame.className = 'yt-frame';
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${link.dataset.yt}?autoplay=1&rel=0&start=${Number(link.dataset.start) || 0}"
      title="${esc(link.dataset.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    link.replaceWith(frame);
  });

  /* ---------- 5 watch list ---------- */
  const WATCH_KEY = 'hair-watch-v1';

  function renderWatch() {
    const view = $('#view-watch');
    const done = new Set(store.get(WATCH_KEY, []));
    const groups = [...new Set(HAIR.watch.map(w => w.group))];

    const row = w => `
      <label class="watch-row glass${done.has(w.id) ? ' done' : ''}">
        <input type="checkbox" data-id="${esc(w.id)}"${done.has(w.id) ? ' checked' : ''}>
        <span class="txt">
          ${w.when ? `<span class="chip when">${esc(w.when)}</span>` : ''}
          <span class="if">${esc(w.if)}</span>
          <span class="then">${esc(w.then)}</span>
        </span>
      </label>`;

    view.innerHTML = `
      <div class="hero">
        <p class="eyebrow">Check these as you go</p>
        <h1>Watch <em>list.</em></h1>
        <div class="stats"><span class="chip accent" id="watchCount"></span></div>
      </div>
      ${groups.map(g => `<div class="watch-group"><h2>${esc(g)}</h2>${HAIR.watch.filter(w => w.group === g).map(row).join('')}</div>`).join('')}`;

    const count = () => { $('#watchCount').textContent = `${done.size} of ${HAIR.watch.length} handled`; };
    count();

    view.addEventListener('change', e => {
      const box = e.target.closest('input[data-id]');
      if (!box) return;
      if (box.checked) done.add(box.dataset.id); else done.delete(box.dataset.id);
      box.closest('.watch-row').classList.toggle('done', box.checked);
      store.set(WATCH_KEY, [...done]);
      count();
    });
  }

  /* ---------- 6 tracker ---------- */
  const TRACKER_KEY = 'tracker-v1';   // same key as the first version, so old entries carry over
  const LABELS = { plans: 'Plan', decisions: 'Decision', facts: 'Fact' };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2));

  /** Returns a safe copy of a stored or imported entry, or null if it is not one. */
  const cleanEntry = i => (i && typeof i.id === 'string' && LABELS[i.section] && typeof i.title === 'string')
    ? {
        id: i.id, section: i.section,
        title: i.title.slice(0, 200), note: String(i.note ?? ''),
        createdAt: Number(i.createdAt) || Date.now(), archivedAt: Number(i.archivedAt) || null,
      }
    : null;

  function loadTracker() {
    const saved = store.get(TRACKER_KEY, null);
    return saved && Array.isArray(saved.items)
      ? { items: saved.items.map(cleanEntry).filter(Boolean), lastReview: Number(saved.lastReview) || null }
      : { items: [], lastReview: null };
  }

  let state = loadTracker();
  let section = 'plans', query = '', editingId = null;

  const saveTracker = () => { store.set(TRACKER_KEY, state); renderTracker(); };

  function renderTracker() {
    const days = state.lastReview == null ? null : Math.floor((Date.now() - state.lastReview) / DAY);
    $('#reviewText').textContent = days == null ? 'No review yet'
      : days === 0 ? 'Reviewed today' : `Last review ${days} day${days === 1 ? '' : 's'} ago`;
    $('#review').classList.toggle('due', days == null || days >= 7);
    $$('#tSeg button').forEach(b => b.classList.toggle('active', b.dataset.sec === section));
    $('#add').hidden = section === 'archive' && !editingId;

    const q = query.trim().toLowerCase();
    const items = state.items
      .filter(it => q ? (it.title + ' ' + it.note).toLowerCase().includes(q)
        : section === 'archive' ? it.archivedAt : it.section === section && !it.archivedAt)
      .sort((a, b) => (b.archivedAt || b.createdAt) - (a.archivedAt || a.createdAt));

    const date = t => new Date(t).toLocaleDateString();
    $('#list').innerHTML = items.length ? items.map(it => `
      <li class="entry glass${it.archivedAt ? ' archived' : ''}" data-id="${esc(it.id)}">
        <div class="meta">${LABELS[it.section]} · ${date(it.createdAt)}${it.archivedAt ? ' · archived ' + date(it.archivedAt) : ''}</div>
        <div class="title">${esc(it.title)}</div>
        ${it.note ? `<div class="note">${esc(it.note)}</div>` : ''}
        <div class="actions">${it.archivedAt
          ? '<button class="btn small" type="button" data-act="restore">Restore</button><button class="btn small danger" type="button" data-act="delete">Delete</button>'
          : `<button class="btn small" type="button" data-act="edit">Edit</button><button class="btn small" type="button" data-act="archive">${it.section === 'plans' ? 'Done' : 'Archive'}</button>`}</div>
      </li>`).join('')
      : `<li class="entry glass empty">${q ? 'No matches.' : section === 'archive' ? 'Nothing archived yet.' : 'Nothing here yet. Add the first one above.'}</li>`;
  }

  function stopEditing() {
    editingId = null;
    $('#submitBtn').textContent = 'Add';
    $('#cancelBtn').hidden = true;
  }

  function initTracker() {
    $('#tSeg').addEventListener('click', e => {
      const b = e.target.closest('button[data-sec]');
      if (!b) return;
      section = b.dataset.sec;
      renderTracker();
    });
    $('#search').addEventListener('input', e => { query = e.target.value; renderTracker(); });
    $('#reviewBtn').addEventListener('click', () => { state.lastReview = Date.now(); saveTracker(); });

    $('#add').addEventListener('submit', e => {
      e.preventDefault();
      const title = $('#title').value.trim(), note = $('#note').value.trim();
      if (!title) return;
      if (editingId) {
        const it = state.items.find(i => i.id === editingId);
        if (it) { it.title = title; it.note = note; }
        stopEditing();
      } else {
        state.items.push({ id: uid(), section, title, note, createdAt: Date.now(), archivedAt: null });
      }
      $('#add').reset();
      saveTracker();
    });
    $('#cancelBtn').addEventListener('click', () => { stopEditing(); $('#add').reset(); renderTracker(); });

    $('#list').addEventListener('click', e => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const id = b.closest('li').dataset.id;
      const it = state.items.find(i => i.id === id);
      if (!it) return;
      switch (b.dataset.act) {
        case 'archive': it.archivedAt = Date.now(); break;
        case 'restore': it.archivedAt = null; break;
        case 'delete': state.items = state.items.filter(i => i.id !== id); break;
        case 'edit':
          editingId = id;
          $('#title').value = it.title;
          $('#note').value = it.note;
          $('#submitBtn').textContent = 'Save';
          $('#cancelBtn').hidden = false;
          renderTracker();
          $('#title').focus();
          return;
      }
      saveTracker();
    });

    $('#export').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
      a.download = `tracker-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    $('#import').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data || !Array.isArray(data.items)) throw new Error('not a tracker export');
        const have = new Set(state.items.map(i => i.id));
        // merge, never overwrite: entries already here win
        data.items.map(cleanEntry).filter(Boolean).forEach(i => { if (!have.has(i.id)) { have.add(i.id); state.items.push(i); } });
        if (Number(data.lastReview) > (state.lastReview || 0)) state.lastReview = Number(data.lastReview);
        saveTracker();
      } catch (err) {
        $('#list').innerHTML = '<li class="entry glass empty">That file is not a tracker export.</li>';
      }
      e.target.value = '';
    });

    renderTracker();
  }

  /* ---------- 7 permit: the study plan (js/permit-data.js, js/permit-questions.js) ---------- */
  const PERMIT_KEY = 'permit-v1';
  const shuffle = list => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const RING = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-track" cx="60" cy="60" r="52"/><circle class="ring-fill" cx="60" cy="60" r="52" pathLength="100"/></svg>';

  /** A short burst of confetti from an element: a day finished, a mock test passed. */
  function celebrate(el) {
    const r = el.getBoundingClientRect(), burst = document.createElement('div');
    burst.className = 'burst';
    burst.style.left = r.left + r.width / 2 + 'px';
    burst.style.top = r.top + r.height / 2 + 'px';
    burst.innerHTML = Array.from({ length: 18 }, (_, i) => `<i style="--a:${i * 20}deg;--d:${60 + Math.random() * 70}px"></i>`).join('');
    document.body.append(burst);
    setTimeout(() => burst.remove(), 1100);
  }

  function renderPermit() {
    const view = $('#view-permit'), P = PERMIT, QS = PERMIT_QUESTIONS, MOCK = P.mock, N = P.days.length;
    const saved = store.get(PERMIT_KEY, {});
    const setOf = v => new Set(Array.isArray(v) ? v : []);
    // done: ticked tasks. right: questions answered correctly last time. missed: answered wrongly last time.
    const done = setOf(saved.done), right = setOf(saved.right), missed = setOf(saved.missed);
    const mocks = Array.isArray(saved.mocks) ? saved.mocks : [];   // the latest mock test scores
    // miss: how often each question was missed. A right answer takes one off. Two or more makes a weak spot.
    const miss = saved.miss && typeof saved.miss === 'object' ? saved.miss : {};
    const picks = saved.picks && typeof saved.picks === 'object' ? saved.picks : {};   // the wrong answer chosen last time
    const weak = () => QS.filter(q => miss[q.id] >= 2).sort((a, b) => miss[b.id] - miss[a.id]);
    // The test date can be moved in the app. A moved date is saved and wins over the one in the data file.
    let moved = /^\d{4}-\d\d-\d\d$/.test(saved.date) ? saved.date : undefined;
    const testDate = moved || P.testDate;
    const save = () => store.set(PERMIT_KEY, { done: [...done], right: [...right], missed: [...missed], mocks, miss, picks, date: moved });
    const topic = id => P.topics.find(t => t.id === id);
    // the second, plainer explanation (js/permit-more.js); a sign question uses the sign's own meaning
    const more = q => PERMIT_MORE[q.id] || (q.sign ? PERMIT_SIGNS[q.sign].means : '');
    const tasks = [...P.days.flatMap(d => d.tasks), ...P.bring];
    const undone = list => list.filter(t => !done.has(t.id));

    // The days count back from the test date: the last day is the test.
    const [y, m, d] = testDate.split('-').map(Number);
    const dayDate = i => new Date(y, m - 1, d - (N - 1 - i));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daysTo = date => Math.round((date - today) / DAY);
    const fmtDay = date => date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const todayIndex = P.days.findIndex((_, i) => daysTo(dayDate(i)) === 0);
    const openDay = todayIndex >= 0 ? todayIndex : daysTo(dayDate(0)) > 0 ? 0 : N - 1;
    const sign = id => `<span class="sign">${PERMIT_SIGNS[id].svg}</span>`;
    const link = ([label, url]) => `<a class="btn small" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
    const QUIZ_LABEL = { mock: 'Start mock test', missed: 'Missed questions' };

    const taskHtml = t => `
      <li class="task">
        <label><input type="checkbox" data-task="${esc(t.id)}"${done.has(t.id) ? ' checked' : ''}><span>${esc(t.text)}</span></label>
        <div class="task-do">
          ${t.min ? `<span class="chip">${t.min} min</span>` : ''}
          ${(t.links || []).map(link).join('')}
          ${t.quiz ? `<button class="btn small" type="button" data-quiz="${esc(t.quiz)}">${QUIZ_LABEL[t.quiz] || 'Practice'}</button>` : ''}
          ${t.jump ? `<button class="btn small" type="button" data-jump="${esc(t.jump[0])}">${esc(t.jump[1])}</button>` : ''}
        </div>
      </li>`;
    const knowHtml = id => `
      <details class="know">
        <summary>Must know: ${esc(topic(id).title)} <span>${topic(id).know.length} points</span></summary>
        <ul class="how">${topic(id).know.map(k => `<li>${esc(k)}</li>`).join('')}</ul>
      </details>`;
    const dayHtml = (day, i) => `
      <details class="day glass" data-day="${i}"${i === openDay ? ' open' : ''}>
        <summary class="day-head">
          <span class="num">${i + 1}</span>
          <div>
            <p class="eyebrow">${esc(fmtDay(dayDate(i)))} · about ${day.tasks.reduce((n, t) => n + t.min, 0)} min</p>
            <h3>${esc(day.title)}</h3>
          </div>
          <span class="chip day-state"></span>
        </summary>
        <ul class="tasks">${day.tasks.map(taskHtml).join('')}</ul>
        ${day.topics.map(knowHtml).join('')}
      </details>`;
    const setRow = (id, title) => `
      <li><span class="k">${esc(title)}</span><span class="v" data-set="${esc(id)}"></span>
        <button class="btn small" type="button" data-quiz="${esc(id)}">Start</button>
        ${topic(id) ? `<span class="bar" data-bar="${esc(id)}"><i></i></span>` : ''}</li>`;
    const signCard = id => `
      <button class="sign-card glass" type="button">${sign(id)}
        <span class="cap"><b>${esc(PERMIT_SIGNS[id].name)}</b><span>${esc(PERMIT_SIGNS[id].means)}</span></span>
        <span class="tap">Tap to check</span>
      </button>`;
    const cover = what => `<button class="btn small" type="button" data-cover data-on="Hide the ${what}" data-off="Show the ${what}" aria-pressed="false">Hide the ${what}</button>`;
    const head = (id, title, lede, action = '') => `<section class="section" id="${id}"><header><h2>${title}</h2>${lede ? `<p class="lede">${lede}</p>` : ''}${action}</header>`;
    const JUMP = [['p-days', 'The plan'], ['p-practice', 'Practice'], ['p-numbers', 'Numbers'], ['p-signs', 'Signs'], ['p-after', 'Test day'], ['p-test', 'The test']];

    view.innerHTML = `
      <div class="hero reveal">
        <p class="eyebrow">${esc(P.state)} learner’s permit · Knowledge Test · ${esc(fmtDay(dayDate(N - 1)))}</p>
        <h1>1 week study for <em>permit.</em></h1>
        <div class="now glass">
          <div class="ring" id="pRing" role="img">${RING}<b id="pLeftN"></b><span id="pLeftT"></span></div>
          <div class="now-body">
            <p class="eyebrow" id="pNowEyebrow"></p>
            <h3 id="pNowTitle"></h3>
            <p class="now-next" id="pNowText"></p>
            <div class="stats"><span class="chip" id="pTasks"></span><span class="chip" id="pKnown"></span></div>
            <button class="btn primary" type="button" id="pNowGo"></button>
          </div>
        </div>
      </div>
      <div class="jump reveal" style="--n:2">${JUMP.map(([id, label]) => `<button class="chip" type="button" data-jump="${id}">${label}</button>`).join('')}</div>

      ${head('p-days', `The ${N} days`, 'Tick each task when it is done. It is saved on this device. If the test moves, change the date and the days move with it.',
        `<label class="date-pick">Test date <input type="date" id="pDate" value="${esc(testDate)}"></label>`)}
        ${P.days.map(dayHtml).join('')}
      </section>

      ${head('p-practice', 'Practice', `${QS.length} questions written from the manual. A question is mastered when your last answer to it was right.`)}
        <div class="card glass ready" id="pReady"></div>
        <div class="card glass"><ul class="rows sets">
          ${setRow('mock', 'Mock test')}${setRow('missed', 'Missed questions')}${P.topics.map(t => setRow(t.id, t.title)).join('')}
        </ul></div>
        <h3 class="sub" id="p-weak">Weak spots</h3>
        <div class="card glass weak" id="pWeak"></div>
        <div class="quiz glass" id="pQuiz" hidden></div>
      </section>

      ${head('p-numbers', 'Numbers', 'The easy points. Hide the answers, say each one out loud, then tap the row to check.',
        cover('answers') + ' <button class="btn small" type="button" data-print>Print the cheat sheet</button>')}
        ${P.numbers.map(g => `<h3 class="sub">${esc(g.title)}</h3>${rowsHtml(g.rows, true)}`).join('')}
        <h3 class="sub">Easy to mix up</h3>
        <div class="card glass"><ul class="how">${P.tricky.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      </section>

      ${head('p-signs', 'Signs', 'First the colour and shape rules, then the signs. Hide the meanings, say what a sign means, then tap it to check.', cover('meanings'))}
        <div class="card glass"><ul class="rows kinds">
          ${P.signKinds.map(([k, v, id]) => `<li>${sign(id)}<span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></li>`).join('')}
        </ul></div>
        ${P.signGroups.map(g => `<h3 class="sub">${esc(g.title)}</h3><div class="sign-grid">${g.ids.map(signCard).join('')}</div>`).join('')}
      </section>

      ${head('p-after', 'Test day', 'What goes in the folder, and what happens at the Driver License Center.')}
        <h3 class="sub">Papers you are waiting for</h3>
        <div class="card glass"><ul class="tasks">${P.papers.map(taskHtml).join('')}</ul></div>
        <h3 class="sub">In the folder</h3>
        <div class="card glass bring"><ul class="tasks">${P.bring.map(taskHtml).join('')}</ul></div>
        <h3 class="sub">On the day, and after</h3>
        ${rowsHtml(P.after, true)}
      </section>

      ${head('p-test', 'The test', 'What you are studying for.')}
        ${rowsHtml(P.facts, true)}
        <h3 class="sub">How to use this week</h3>
        <div class="card glass"><ul class="how">${P.method.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
        <p class="sources">Checked against PennDOT on Nov 16, 2026: ${P.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(' · ')}. Rules and fees change, so check PennDOT before you go.</p>
      </section>`;

    // Each part fades in as it scrolls into view.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      }), { rootMargin: '0px 0px -8% 0px' });
      $$('.section', view).forEach(el => { el.classList.add('fade'); io.observe(el); });
    }

    /** Fills in everything that changes: the countdown, the progress, today's card and each day's state. */
    function counts() {
      const left = daysTo(dayDate(N - 1)), nDone = tasks.length - undone(tasks).length;
      const nRight = QS.filter(q => right.has(q.id)).length, nMissed = QS.filter(q => missed.has(q.id)).length;
      // the ring: days left in the middle, the share of tasks done around it
      $('#pRing').style.setProperty('--p', nDone / tasks.length);
      $('#pRing').setAttribute('aria-label', `${Math.max(left, 0)} days to the test, ${nDone} of ${tasks.length} tasks done`);
      $('#pLeftN').textContent = left > 0 ? left : left === 0 ? 'Go' : '–';
      $('#pLeftT').textContent = left > 1 ? 'days left' : left === 1 ? 'day left' : left === 0 ? 'test day' : 'date passed';
      $('#pTasks').textContent = `${nDone} of ${tasks.length} tasks done`;
      $('#pKnown').textContent = `${nRight} of ${QS.length} questions mastered`;

      // today's card: an earlier day with tasks left comes first
      const late = P.days.findIndex((day, i) => daysTo(dayDate(i)) < 0 && undone(day.tasks).length);
      const at = late >= 0 ? late : openDay, todo = undone(P.days[at].tasks);
      $('#pNowEyebrow').textContent = left < 0 ? 'The test date has passed' : late >= 0 ? 'Catch up first' : todayIndex < 0 ? `Starts ${fmtDay(dayDate(0))}` : `Today · ${fmtDay(today)}`;
      $('#pNowTitle').textContent = `Day ${at + 1}: ${P.days[at].title}`;
      $('#pNowText').textContent = todo.length ? `Next: ${todo[0].text}` : at === N - 1 ? 'Everything is ticked. Go and pass.' : 'Everything for today is done. Come back tomorrow.';
      $('#pNowGo').textContent = todo.length ? `Continue · about ${todo.reduce((n, t) => n + t.min, 0)} min left` : 'Open the day';
      $('#pNowGo').dataset.goday = at;

      const last2 = mocks.slice(-2), ready = last2.length === 2 && last2.every(s => s >= MOCK.aim);
      $('#pReady').innerHTML = `
        <p class="k">${ready ? 'You are ready.' : 'Are you ready?'}</p>
        <p class="v">${ready ? `Your last two mock tests were ${MOCK.aim} of ${MOCK.size} or better.` : `You are ready when two mock tests in a row are ${MOCK.aim} of ${MOCK.size} or better. The real test needs ${MOCK.pass}.`}</p>
        ${mocks.length ? `<div class="stats">${mocks.map(s => `<span class="chip ${s >= MOCK.pass ? 'ok' : 'accent'}">${s}/${MOCK.size}</span>`).join('')}</div>` : ''}`;
      $('#pReady').classList.toggle('is-ready', ready);
      const spots = weak();
      $('#pWeak').innerHTML = spots.length
        ? `<ul class="how">${spots.slice(0, 12).map(q => `<li>${q.sign ? sign(q.sign) : ''}<b>${esc(q.q)}</b> ${esc(q.a[0])}.<span class="src">${esc(q.why)}</span>
            <details class="again"><summary>Explain it again</summary>
              ${picks[q.id] ? `<p>Last time you chose: ${esc(picks[q.id])}.</p>` : ''}<p>${esc(more(q))}</p></details></li>`).join('')}</ul>
           <p><button class="btn small" type="button" data-quiz="weak">Practice these</button></p>`
        : '<p>Nothing here yet. A question you miss twice is listed here with its answer, until you get it right again.</p>';

      $$('[data-set]', view).forEach(el => {
        const id = el.dataset.set, qs = QS.filter(q => q.t === id);
        el.textContent = id === 'mock' ? `${MOCK.size} questions like the real test, answers at the end. ${MOCK.pass} to pass.`
          : id === 'missed' ? (nMissed ? `${nMissed} to redo` : 'Nothing to redo right now.')
          : `${qs.filter(q => right.has(q.id)).length} of ${qs.length} mastered`;
      });
      $$('[data-bar]', view).forEach(el => {
        const qs = QS.filter(q => q.t === el.dataset.bar);
        el.style.setProperty('--p', qs.filter(q => right.has(q.id)).length / qs.length);
      });
      $$('.day', view).forEach(el => {
        const i = +el.dataset.day, n = P.days[i].tasks.length, k = n - undone(P.days[i].tasks).length, diff = daysTo(dayDate(i));
        const chip = $('.day-state', el);
        chip.textContent = k === n ? 'Done' : `${diff === 0 ? 'Today · ' : diff < 0 ? 'Catch up · ' : ''}${k}/${n}`;
        chip.classList.toggle('accent', k < n && diff <= 0);
        chip.classList.toggle('ok', k === n);
        el.classList.toggle('is-today', diff === 0);
      });
    }
    counts();

    /* The quiz: one question at a time, with the reason after each answer. */
    const box = $('#pQuiz');
    let quiz = null;
    // a mock test shows how long you have been at it
    const clock = () => { const s = Math.floor((Date.now() - quiz.t0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
    setInterval(() => { const c = $('[data-clock]', box); if (c && quiz) c.textContent = clock(); }, 1000);
    const quizHead = extra => `<div class="quiz-head"><span class="chip accent">${esc(quiz.title)}</span>${extra}<button class="btn small" type="button" data-quit>Close</button></div>`;

    function startQuiz(set) {
      let list, title = 'Mock test';
      if (set === 'mock') {   // the size of the real test, with a few sign questions in it
        list = shuffle([...shuffle(QS.filter(q => q.t === 'signs')).slice(0, MOCK.signs), ...shuffle(QS.filter(q => q.t !== 'signs')).slice(0, MOCK.size - MOCK.signs)]);
      } else if (set === 'missed' || set === 'weak') {
        title = set === 'weak' ? 'Weak spots' : 'Missed questions';
        list = shuffle(set === 'weak' ? weak() : QS.filter(q => missed.has(q.id))).slice(0, 15);
      } else {
        const ids = set.split(','), all = shuffle(QS.filter(q => ids.includes(q.t)));
        title = ids.map(id => topic(id).short).join(' + ');
        list = [...all.filter(q => !right.has(q.id)), ...all.filter(q => right.has(q.id))].slice(0, 15);   // not yet mastered first
      }
      // exam: a mock test shows no answers until the end, like the real test
      quiz = { set, title, list, exam: set === 'mock', t0: Date.now(), i: 0, score: 0, wrong: [], from: quiz ? quiz.from : window.scrollY };
      box.hidden = false;
      if (list.length) ask();
      else box.innerHTML = quizHead('') + '<h3 class="quiz-q">Nothing to redo right now.</h3><p>Questions you get wrong are collected here until you get them right.</p>';
      box.scrollIntoView({ block: 'start' });
    }

    function ask() {
      const q = quiz.list[quiz.i];
      quiz.opts = shuffle(q.a);
      box.innerHTML = `
        ${quizHead(`<span class="chip">Question ${quiz.i + 1} of ${quiz.list.length}</span>${quiz.exam ? `<span class="chip" data-clock>${clock()}</span>` : ''}`)}
        <div class="bar quiz-bar" style="--p:${quiz.i / quiz.list.length}"><i></i></div>
        <div class="quiz-body">
          ${q.sign ? `<div class="quiz-sign">${sign(q.sign)}</div>` : ''}
          <h3 class="quiz-q" tabindex="-1">${esc(q.q)}</h3>
          <div class="quiz-opts">${quiz.opts.map((a, i) => `<button class="opt" type="button" data-i="${i}"><kbd>${'ABCD'[i]}</kbd><span>${esc(a)}</span></button>`).join('')}</div>
          <div class="quiz-after" role="status">${quiz.exam ? '<p class="src">Mock test: you see the answers at the end.</p>' : ''}</div>
        </div>`;
    }
    const next = () => { if (++quiz.i < quiz.list.length) ask(); else finish(); $('.quiz-q', box).focus(); };

    function answer(btn) {
      const q = quiz.list[quiz.i], is = b => quiz.opts[b.dataset.i] === q.a[0], ok = is(btn);
      if (ok) { quiz.score++; right.add(q.id); missed.delete(q.id); if (miss[q.id]) miss[q.id]--; }
      else { right.delete(q.id); missed.add(q.id); quiz.wrong.push(q); miss[q.id] = (miss[q.id] || 0) + 1; picks[q.id] = quiz.opts[btn.dataset.i]; }
      save(); counts();
      if (quiz.exam) return next();
      $$('.opt', box).forEach(b => { b.disabled = true; b.classList.toggle('right', is(b)); });
      btn.classList.toggle('wrong', !ok);
      $('.quiz-bar', box).style.setProperty('--p', (quiz.i + 1) / quiz.list.length);
      $('.quiz-after', box).innerHTML = `
        <p class="verdict ${ok ? 'ok' : 'no'}">${ok ? 'Correct.' : 'Not this one.'}</p>
        <p>${esc(q.why)}</p>
        ${ok ? '' : `<p class="again-text">${esc(more(q))}</p>`}
        <p class="src">${esc(topic(q.t).title)}</p>
        <button class="btn primary" type="button" data-next>${quiz.i === quiz.list.length - 1 ? 'See the result' : 'Next question'}</button>`;
      $('[data-next]', box).focus();
    }

    function finish() {
      const mock = quiz.set === 'mock', n = quiz.list.length, pass = quiz.score >= MOCK.pass, clean = !quiz.wrong.length;
      if (mock) { mocks.push(quiz.score); mocks.splice(0, mocks.length - 8); save(); counts(); }
      box.innerHTML = `
        ${quizHead('')}
        <div class="quiz-body result">
          <div class="ring ${mock && !pass ? 'no' : 'ok'}" style="--p:${quiz.score / n}">${RING}<b>${quiz.score}</b><span>of ${n}</span></div>
          <h3 class="quiz-q" tabindex="-1">${mock ? (pass ? 'That would pass.' : 'That would not pass yet.') : clean ? 'All correct.' : 'Keep going.'}</h3>
          ${mock ? `<p>The real test needs ${MOCK.pass} of ${MOCK.size}. Aim for ${MOCK.aim} here. Your time: ${clock()}.</p>` : ''}
          ${clean ? '' : `<p class="src">To learn again:</p><ul class="how">${quiz.wrong.map(q => `<li>${q.sign ? sign(q.sign) : ''}<b>${esc(q.q)}</b> ${esc(q.a[0])}.${quiz.exam ? `<span class="src">${esc(q.why)}</span>` : ''}</li>`).join('')}</ul>`}
          <div class="quiz-end">
            <button class="btn primary" type="button" data-quiz="${esc(quiz.set)}">${mock ? 'Another mock test' : 'Go again'}</button>
            <button class="btn" type="button" data-quit>Close</button>
          </div>
        </div>`;
      if (mock ? pass : clean) celebrate($('.ring', box));
    }

    view.addEventListener('click', e => {
      const hit = sel => e.target.closest(sel);
      let el;
      if ((el = hit('[data-quiz]'))) startQuiz(el.dataset.quiz);
      else if ((el = hit('[data-jump]'))) document.getElementById(el.dataset.jump)?.scrollIntoView({ block: 'start' });
      else if ((el = hit('[data-goday]'))) { const day = $(`.day[data-day="${el.dataset.goday}"]`, view); day.open = true; day.scrollIntoView({ block: 'start' }); }
      else if ((el = hit('.opt'))) answer(el);
      else if (hit('[data-next]')) next();
      else if (hit('[data-quit]')) { box.hidden = true; window.scrollTo(0, quiz.from); quiz = null; }   // back to where the quiz was started
      else if (hit('[data-print]')) {   // prints only the numbers and the mix-ups, on one page (.print-sheet in the CSS)
        document.documentElement.classList.add('print-sheet');
        window.addEventListener('afterprint', () => document.documentElement.classList.remove('print-sheet'), { once: true });
        window.print();
      }
      else if ((el = hit('[data-cover]'))) {   // self-test: hide the answers, tap one to see it
        const sec = el.closest('.section'), on = sec.classList.toggle('cover');
        el.textContent = on ? el.dataset.off : el.dataset.on;
        el.setAttribute('aria-pressed', on);
        $$('.seen', sec).forEach(x => x.classList.remove('seen'));
      }
      else if ((el = hit('.cover .pairs li, .cover .sign-card'))) el.classList.add('seen');
    });
    view.addEventListener('change', e => {
      if (e.target.id === 'pDate' && e.target.value) { moved = e.target.value; save(); location.reload(); return; }   // every date on the page changes
      const t = e.target.closest('[data-task]');
      if (!t) return;
      if (t.checked) done.add(t.dataset.task); else done.delete(t.dataset.task);
      save(); counts();
      const group = t.closest('.day, .bring');   // the last tick of a day or of the folder list
      if (group && t.checked && !$('[data-task]:not(:checked)', group)) celebrate(t);
    });
    // A to D (or 1 to 4) answer the question on a keyboard.
    document.addEventListener('keydown', e => {
      if (!quiz || view.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      const i = Math.max('abcd'.indexOf(e.key.toLowerCase()), '1234'.indexOf(e.key));
      if (i >= 0) $(`.opt[data-i="${i}"]:enabled`, box)?.click();
    });
  }

  /* ---------- 8 start ---------- */
  renderPlan();
  renderWatch();
  initTracker();
  renderPermit();
  show(location.hash.slice(1), { scroll: false });

  // Without a connection the app opens from a saved copy (sw.js). The sign pictures are added to that
  // copy here, because the page only loads the ones you scroll to.
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* the app works as before, only not offline */ });
    const pics = Object.values(PERMIT_SIGNS).map(s => (s.svg.match(/src="([^"]+)"/) || [])[1]).filter(Boolean);
    caches.open('simple-v1').then(c => c.keys().then(saved => saved.length < pics.length && c.addAll(pics))).catch(() => {});
  }
})();
