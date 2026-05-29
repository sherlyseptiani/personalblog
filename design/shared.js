// A Curious Note — shared scripts (theme + video color sync)

(function() {
  const root = document.documentElement;

  // === Theme persistence ===
  const stored = localStorage.getItem('acn-theme') || 'light';
  root.setAttribute('data-theme', stored);

  window.setTheme = function(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('acn-theme', theme); } catch(e) {}
    document.querySelectorAll('[data-theme-target]').forEach(b => {
      b.classList.toggle('active', b.dataset.themeTarget === theme);
    });
    // Update icon
    const tbtns = document.querySelectorAll('[data-theme-toggle]');
    tbtns.forEach(btn => {
      btn.innerHTML = theme === 'dark'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    });
  };
  window.setTheme(stored);

  window.toggleTheme = function() {
    const cur = root.getAttribute('data-theme');
    window.setTheme(cur === 'dark' ? 'light' : 'dark');
  };

  // === Video color sync ===
  // Samples the hero video each ~1s, picks a vivid color (cycling between
  // a few dominant hue regions over time) so the accent visibly shifts
  // between e.g. pink, blue, grey — instead of converging to a muddy average.
  window.bindVideoColorSync = function(video, opts) {
    opts = opts || {};
    const onColor = opts.onColor;
    const canvas = document.createElement('canvas');
    canvas.width = 48; canvas.height = 48;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let raf = 0;
    let lastSample = 0;
    let curR = 86, curG = 124, curB = 148;
    let bucketIdx = 0; // rotates through top buckets so the accent visibly shifts

    function lerp(a, b, t) { return a + (b - a) * t; }

    // RGB -> HSL (h in [0,360), s,l in [0,1])
    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0; const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
          case g: h = ((b - r) / d + 2) * 60; break;
          case b: h = ((r - g) / d + 4) * 60; break;
        }
      }
      return [h, s, l];
    }
    function hslToRgb(h, s, l) {
      h /= 360;
      let r, g, b;
      if (s === 0) { r = g = b = l; }
      else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1; if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return [r * 255, g * 255, b * 255];
    }

    function tick(now) {
      if (!lastSample) lastSample = now;
      if (now - lastSample > 1400 && video.readyState >= 2 && !video.paused) {
        lastSample = now;
        try {
          ctx.drawImage(video, 0, 0, 48, 48);
          const data = ctx.getImageData(0, 0, 48, 48).data;

          // 12 hue buckets, each tracks: weighted r,g,b sums + count + total saturation
          const N = 12;
          const buckets = Array.from({length: N}, () => ({ r:0, g:0, b:0, n:0, sat:0 }));
          let greyR=0, greyG=0, greyB=0, greyN=0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            const [h, s, l] = rgbToHsl(r, g, b);
            // Skip near-black / near-white
            if (l < 0.08 || l > 0.92) continue;
            if (s < 0.08) {
              greyR += r; greyG += g; greyB += b; greyN++;
              continue;
            }
            const bi = Math.floor(h / (360 / N)) % N;
            const bk = buckets[bi];
            // Weight by saturation so vivid pixels dominate the average
            const w = s;
            bk.r += r * w; bk.g += g * w; bk.b += b * w;
            bk.n += w; bk.sat += s;
          }

          // Score buckets by saturation × population (so we pick vivid AND present hues)
          const scored = buckets
            .map((bk, i) => ({ i, score: bk.sat, bk }))
            .filter(x => x.bk.n > 0 && x.score > 4)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

          let target;
          if (scored.length > 0) {
            // Rotate between the top buckets so the accent visibly shifts
            const choice = scored[bucketIdx % scored.length];
            bucketIdx++;
            const bk = choice.bk;
            let tr = bk.r / bk.n, tg = bk.g / bk.n, tb = bk.b / bk.n;
            // Boost saturation so the tint reads on screen
            const [h, s, l] = rgbToHsl(tr, tg, tb);
            const boostedS = Math.min(0.85, s * 1.55 + 0.18);
            const targetL = Math.min(0.62, Math.max(0.38, l));
            [tr, tg, tb] = hslToRgb(h, boostedS, targetL);
            target = [tr, tg, tb];
          } else if (greyN > 0) {
            // Pure grey scene — nudge toward slate
            target = [
              lerp(greyR / greyN, 120, 0.4),
              lerp(greyG / greyN, 140, 0.4),
              lerp(greyB / greyN, 160, 0.4)
            ];
          } else {
            target = [curR, curG, curB];
          }

          // Smooth toward target (slow lerp -> subtle shift)
          curR = lerp(curR, target[0], 0.35);
          curG = lerp(curG, target[1], 0.35);
          curB = lerp(curB, target[2], 0.35);
          const R = Math.round(curR), G = Math.round(curG), B = Math.round(curB);
          root.style.setProperty('--video-r', R);
          root.style.setProperty('--video-g', G);
          root.style.setProperty('--video-b', B);
          if (onColor) onColor(R, G, B);
        } catch (e) { /* tainted or unloaded */ }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  };
  // === Toast (auto-hide + manual close) ===
  function ensureToast() {
    let t = document.getElementById('acn-toast');
    if (t) return t;
    t = document.createElement('div');
    t.id = 'acn-toast';
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    t.innerHTML = `
      <span class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </span>
      <span id="acn-toast-msg"></span>
      <button class="toast-close" aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>`;
    document.body.appendChild(t);
    t.querySelector('.toast-close').addEventListener('click', () => t.classList.remove('show'));
    return t;
  }
  let toastTimer = 0;
  window.showToast = function(msg, opts) {
    const t = ensureToast();
    t.querySelector('#acn-toast-msg').textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    const dur = (opts && opts.duration) || 3200;
    toastTimer = setTimeout(() => t.classList.remove('show'), dur);
  };

  // === Thumbnail SVG color variables (theme-aware) ===
  function updateThumbColors() {
    const theme = root.getAttribute('data-theme') || 'light';
    const colors = {
      light: {
        '--thumb-purple': '#9869D3',
        '--thumb-purple-dark': '#7048B0',
        '--thumb-lavender': '#C4A8E8',
        '--thumb-lav-light': '#E0D4F8',
        '--thumb-pink': '#E8A0C0',
        '--thumb-pink-light': '#F4D0E4',
        '--thumb-blue': '#8CA8D8',
        '--thumb-blue-light': '#C4D8F4',
        '--thumb-teal': '#6BA39A',
        '--thumb-amber': '#C08A64',
        '--thumb-ink': 'rgba(15,10,40,0.75)',
        '--thumb-ink-light': 'rgba(15,10,40,0.45)',
        '--thumb-white': 'rgba(255,255,255,0.9)',
        '--thumb-white-mid': 'rgba(255,255,255,0.5)',
        '--thumb-white-subtle': 'rgba(255,255,255,0.2)'
      },
      dark: {
        '--thumb-purple': '#7a5eb0',
        '--thumb-purple-dark': '#5a4490',
        '--thumb-lavender': '#8a7ab8',
        '--thumb-lav-light': '#5a5080',
        '--thumb-pink': '#a08098',
        '--thumb-pink-light': '#705868',
        '--thumb-blue': '#6a88a8',
        '--thumb-blue-light': '#4a6888',
        '--thumb-teal': '#5a8a82',
        '--thumb-amber': '#a08060',
        '--thumb-ink': 'rgba(200,200,220,0.8)',
        '--thumb-ink-light': 'rgba(180,180,200,0.5)',
        '--thumb-white': 'rgba(40,45,60,0.9)',
        '--thumb-white-mid': 'rgba(50,55,70,0.6)',
        '--thumb-white-subtle': 'rgba(60,65,80,0.3)'
      },
      sepia: {
        '--thumb-purple': '#8a7a60',
        '--thumb-purple-dark': '#6a5a40',
        '--thumb-lavender': '#a09078',
        '--thumb-lav-light': '#c0b098',
        '--thumb-pink': '#b09080',
        '--thumb-pink-light': '#d0b0a0',
        '--thumb-blue': '#7a90a0',
        '--thumb-blue-light': '#9ab0c0',
        '--thumb-teal': '#6a8a7a',
        '--thumb-amber': '#a08050',
        '--thumb-ink': 'rgba(60,45,30,0.8)',
        '--thumb-ink-light': 'rgba(80,65,50,0.5)',
        '--thumb-white': 'rgba(250,245,235,0.9)',
        '--thumb-white-mid': 'rgba(240,235,225,0.6)',
        '--thumb-white-subtle': 'rgba(230,225,215,0.4)'
      }
    };
    const vars = colors[theme] || colors.light;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }

  // Update thumbnail colors on theme change
  const originalSetTheme = window.setTheme;
  window.setTheme = function(theme) {
    originalSetTheme(theme);
    updateThumbColors();
  };
  updateThumbColors();
})();

/* =====================================================================
   Search — glass "spotlight" overlay, shared across every page.
   Wires any nav button with aria-label="Search"; also opens on ⌘K / /.
   ===================================================================== */
(function() {
  const POST_PAGE = 'A Curious Note - Post.html';

  // Two-tone gradients per category (echoes the about-page sigils)
  const CAT = {
    essay:   { label: 'Essay',      c: ['#7c8db5', '#3d4d75'] },
    craft:   { label: 'Craft',      c: ['#f6c7a3', '#c08a64'] },
    field:   { label: 'Field note', c: ['#a7d8c5', '#6ba39a'] },
    reading: { label: 'Reading',    c: ['#c6b5e0', '#a07ab5'] },
    systems: { label: 'Systems',    c: ['#b3d0e8', '#3f7a8c'] },
    page:    { label: 'Page',       c: ['#f5b8c7', '#d96b8a'] }
  };

  // Searchable index (curated from the archive + section pages)
  const INDEX = [
    { t: 'The case for quiet software', cat: 'essay', read: '12 min', date: 'Apr 4', id: 'quiet-software', kw: 'notifications interface attention tools whisper' },
    { t: 'Why I still bookmark', cat: 'essay', read: '7 min', date: 'Mar 28', id: 'why-i-bookmark', kw: 'bookmarks web personal corner saving' },
    { t: 'Editor feels: friction is a feature', cat: 'craft', read: '9 min', date: 'Mar 21', id: 'editor-feels', kw: 'markdown writing tools drag intentional' },
    { t: 'On letting drafts age', cat: 'essay', read: '4 min', date: 'Mar 14', id: 'aging-drafts', kw: 'drafts weather waiting writing' },
    { t: 'The weather of attention', cat: 'field', read: '11 min', date: 'Mar 7', id: 'attention-weather', kw: 'focus mind field guide morning' },
    { t: 'Glassy UIs and the long history of seeing through', cat: 'craft', read: '14 min', date: 'Feb 29', id: 'glassy-uis', kw: 'glass translucency liquid design history icons' },
    { t: 'What I read in February', cat: 'reading', read: '6 min', date: 'Feb 25', id: 'reading-stack', kw: 'books reading stack month' },
    { t: 'Systems are sentences', cat: 'systems', read: '10 min', date: 'Feb 18', id: 'systems-thinking', kw: 'software prose structure thinking' },
    { t: "Walks I take when I'm stuck", cat: 'field', read: '5 min', date: 'Feb 11', id: 'walks', kw: 'walking block loop geography' },
    { t: 'A taxonomy of restlessness', cat: 'essay', read: '8 min', date: 'Feb 4', id: 'taxonomy-restless', kw: 'restlessness work focus' },
    { t: 'Tiny tools and the maintenance of joy', cat: 'craft', read: '9 min', date: 'Jan 28', id: 'tiny-tools', kw: 'tools notes rewrite joy software' },
    { t: 'What the room knows', cat: 'field', read: '7 min', date: 'Jan 21', id: 'what-the-room-knows', kw: 'environment desk memory room' },
    // Section pages
    { t: 'About — Sherly Septiani', cat: 'page', read: 'The writer', date: '', url: 'A Curious Note - About.html', kw: 'about bio writer brooklyn dog mochi contact say hi' },
    { t: 'Recommendations', cat: 'page', read: 'Honest picks', date: '', url: 'A Curious Note - Recommendations.html', kw: 'recommendations products skincare snacks bag shopee picks' }
  ];

  const SUGGESTED = ['quiet software', 'reading', 'craft', 'bookmark'];
  const RECENT_KEY = 'acn-recent-searches';
  const PAGE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/></svg>';
  const POST_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M9 9h7M9 13h7M9 17h4"/></svg>';

  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch(e) { return []; }
  }
  function pushRecent(q) {
    q = q.trim(); if (!q) return;
    let list = getRecent().filter(x => x.toLowerCase() !== q.toLowerCase());
    list.unshift(q); list = list.slice(0, 5);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch(e) {}
  }
  function clearRecent() { try { localStorage.removeItem(RECENT_KEY); } catch(e) {} }
  function delRecent(q) {
    const list = getRecent().filter(x => x !== q);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch(e) {}
  }

  function esc(s) { return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function highlight(title, q) {
    if (!q) return esc(title);
    const i = title.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(title);
    return esc(title.slice(0, i)) + '<mark>' + esc(title.slice(i, i + q.length)) + '</mark>' + esc(title.slice(i + q.length));
  }
  function hrefFor(item) { return item.url || (POST_PAGE + '?id=' + encodeURIComponent(item.id)); }

  let root, dialog, input, field, chipsWrap, body, activeCat = 'all', activeIdx = -1, navItems = [];

  function build() {
    root = document.createElement('div');
    root.className = 'acn-search-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Search');
    const cats = ['all'].concat(Object.keys(CAT));
    root.innerHTML =
      '<div class="acn-search-scrim" data-close></div>' +
      '<div class="acn-search-dialog">' +
        '<div class="acn-search-field">' +
          '<svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          '<input type="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search essays, notes & pages\u2026" aria-label="Search" />' +
          '<span class="acn-search-kbd"><kbd>esc</kbd> to close</span>' +
          '<button class="acn-search-clear" aria-label="Clear search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
        '</div>' +
        '<div class="acn-search-chips">' +
          cats.map(c => '<button class="acn-chip' + (c === 'all' ? ' active' : '') + '" data-cat="' + c + '">' +
            (c === 'all' ? 'All' : CAT[c].label) + '</button>').join('') +
        '</div>' +
        '<div class="acn-search-body"></div>' +
        '<div class="acn-search-foot">' +
          '<span class="hint"><kbd>\u2191</kbd><kbd>\u2193</kbd> navigate</span>' +
          '<span class="hint"><kbd>\u21B5</kbd> open</span>' +
          '<span class="spacer"></span>' +
          '<span class="hint"><kbd>\u2318</kbd><kbd>K</kbd> search</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    dialog = root.querySelector('.acn-search-dialog');
    input = root.querySelector('input');
    field = root.querySelector('.acn-search-field');
    chipsWrap = root.querySelector('.acn-search-chips');
    body = root.querySelector('.acn-search-body');

    root.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
    input.addEventListener('input', () => { syncClear(); render(); });
    root.querySelector('.acn-search-clear').addEventListener('click', () => {
      input.value = ''; syncClear(); render(); input.focus();
    });
    chipsWrap.addEventListener('click', e => {
      const b = e.target.closest('.acn-chip'); if (!b) return;
      activeCat = b.dataset.cat;
      chipsWrap.querySelectorAll('.acn-chip').forEach(x => x.classList.toggle('active', x === b));
      render();
    });
    body.addEventListener('mousemove', e => {
      const r = e.target.closest('[data-idx]'); if (!r) return;
      setActive(parseInt(r.dataset.idx, 10));
    });
    input.addEventListener('keydown', onKeys);
  }

  function syncClear() { field.classList.toggle('has-text', input.value.trim().length > 0); }

  function results(q) {
    const ql = q.toLowerCase();
    return INDEX.filter(it => {
      if (activeCat !== 'all' && it.cat !== activeCat) return false;
      if (!ql) return true;
      return (it.t + ' ' + (CAT[it.cat] ? CAT[it.cat].label : '') + ' ' + (it.kw || '')).toLowerCase().includes(ql);
    });
  }

  function render() {
    const q = input.value.trim();
    navItems = [];
    let html = '';

    if (!q && activeCat === 'all') {
      const recent = getRecent();
      if (recent.length) {
        html += '<div class="acn-search-secthead">Recent<button data-clear>Clear</button></div>';
        recent.forEach(r => {
          html += '<div class="acn-recent" data-q="' + esc(r) + '">' +
            '<svg class="rc-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
            '<span class="rc-text">' + esc(r) + '</span>' +
            '<button class="rc-del" data-del="' + esc(r) + '" aria-label="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
          '</div>';
        });
      }
      html += '<div class="acn-search-secthead">' + (recent.length ? 'Try' : 'Suggested') + '</div>';
      SUGGESTED.forEach(s => {
        html += '<div class="acn-recent" data-q="' + esc(s) + '">' +
          '<svg class="rc-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          '<span class="rc-text">' + esc(s) + '</span></div>';
      });
      body.innerHTML = html;
      wireBody();
      return;
    }

    const res = results(q);
    if (!res.length) {
      body.innerHTML =
        '<div class="acn-search-empty">' +
          '<div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></div>' +
          '<h4>Nothing here yet</h4>' +
          '<p>No notes match \u201c' + esc(q) + '\u201d. Try a different word, or browse by category above.</p>' +
        '</div>';
      return;
    }

    html += '<div class="acn-search-secthead">' + res.length + ' result' + (res.length > 1 ? 's' : '') + '</div>';
    res.forEach((it, i) => {
      const cat = CAT[it.cat] || CAT.essay;
      const sub = it.cat === 'page'
        ? (it.read || '')
        : cat.label + '<span class="sep"></span>' + it.read + (it.date ? '<span class="sep"></span>' + it.date : '');
      html +=
        '<a class="acn-result" href="' + hrefFor(it) + '" data-idx="' + i + '" style="--rc1:' + cat.c[0] + ';--rc2:' + cat.c[1] + ';">' +
          '<span class="r-dot">' + (it.cat === 'page' ? PAGE_ICON : POST_ICON) + '</span>' +
          '<span class="r-main"><span class="r-title">' + highlight(it.t, q) + '</span><span class="r-sub">' + sub + '</span></span>' +
          '<svg class="r-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
        '</a>';
    });
    body.innerHTML = html;
    navItems = Array.from(body.querySelectorAll('.acn-result'));
    activeIdx = -1;
    if (navItems.length) setActive(0);
  }

  function wireBody() {
    body.querySelectorAll('.acn-recent[data-q]').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.closest('[data-del]')) return;
        input.value = el.dataset.q; syncClear(); render(); input.focus();
      });
    });
    body.querySelectorAll('[data-del]').forEach(b => {
      b.addEventListener('click', e => { e.stopPropagation(); delRecent(b.dataset.del); render(); });
    });
    const clr = body.querySelector('[data-clear]');
    if (clr) clr.addEventListener('click', () => { clearRecent(); render(); });
    navItems = Array.from(body.querySelectorAll('.acn-recent'));
    activeIdx = -1;
  }

  function setActive(i) {
    if (!navItems.length) return;
    activeIdx = (i + navItems.length) % navItems.length;
    navItems.forEach((el, n) => el.classList.toggle('active', n === activeIdx));
  }

  function go(el) {
    if (!el) return;
    if (el.dataset.q !== undefined) { input.value = el.dataset.q; syncClear(); render(); input.focus(); return; }
    pushRecent(input.value);
    const href = el.getAttribute('href');
    if (href) window.location.href = href;
  }

  function onKeys(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); ensureVisible(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); ensureVisible(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && navItems[activeIdx]) go(navItems[activeIdx]);
      else if (navItems[0]) go(navItems[0]);
    } else if (e.key === 'Escape') { e.preventDefault(); close(); }
  }
  function ensureVisible() {
    const el = navItems[activeIdx]; if (!el) return;
    const r = el.getBoundingClientRect(), br = body.getBoundingClientRect();
    if (r.bottom > br.bottom) body.scrollTop += r.bottom - br.bottom + 8;
    else if (r.top < br.top) body.scrollTop -= br.top - r.top + 8;
  }

  let lastFocus = null;
  function open() {
    if (!root) build();
    lastFocus = document.activeElement;
    activeCat = 'all';
    chipsWrap.querySelectorAll('.acn-chip').forEach(x => x.classList.toggle('active', x.dataset.cat === 'all'));
    input.value = ''; syncClear(); render();
    root.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => setTimeout(() => input.focus(), 60));
  }
  function close() {
    if (!root) return;
    root.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.openSearch = open;
  window.closeSearch = close;

  function init() {
    document.querySelectorAll('[aria-label="Search"]').forEach(btn => {
      if (btn.closest('.acn-search-root')) return;
      btn.addEventListener('click', e => { e.preventDefault(); open(); });
    });
    document.addEventListener('keydown', e => {
      const open_ = root && root.classList.contains('open');
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open_ ? close() : open(); return; }
      if (e.key === '/' && !open_) {
        const t = e.target, tag = t && t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
        e.preventDefault(); open();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
