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
  const VIEWS = ['plan', 'watch', 'tracker'];
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
      </div>`;
  }

  /** The picture for a step: your own image if one is listed in HAIR.images, else the animation. */
  function mediaHtml(sceneId) {
    const scene = SCENES[sceneId];
    const image = HAIR.images[sceneId];
    const caption = scene ? scene.caption : '';
    const inner = image ? `<img src="${esc(image)}" alt="${esc(caption)}" loading="lazy">` : SceneKit.render(sceneId);
    if (!inner) return '';
    return `<div class="step-media"><div class="stage">${inner}</div>${caption ? `<p class="stage-cap">${esc(caption)}</p>` : ''}</div>`;
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
    const media = step.scene ? mediaHtml(step.scene) : '';
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

    // Animations run only while their stage is on screen. If the device asks for
    // reduced motion they stay still, unless the user switches them on here.
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const still = reduced && document.documentElement.dataset.motion !== 'on';
    if (still) {
      $('.hero', view).insertAdjacentHTML('beforeend',
        '<p class="motion-note">Animations are paused because this device has reduced motion on. <button class="btn small" type="button" id="motionOn">Play them</button></p>');
      $('#motionOn').addEventListener('click', () => {
        try { localStorage.setItem('motion', 'on'); } catch (e) { /* lasts for this visit only */ }
        document.documentElement.dataset.motion = 'on';
        $('.motion-note', view).remove();
        startStages();
      });
    } else startStages();
  }

  function startStages() {
    const view = $('#view-plan');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => en.target.classList.toggle('is-playing', en.isIntersecting));
      }, { threshold: .5 });
      $$('.stage', view).forEach(stage => io.observe(stage));
    }
  }

  // Videos play in place when the app is served from a web address. Opened as a
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

  /* ---------- 7 start ---------- */
  SceneKit.mountDefs();
  renderPlan();
  renderWatch();
  initTracker();
  show(location.hash.slice(1), { scroll: false });
})();
