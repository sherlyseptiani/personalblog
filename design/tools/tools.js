// Tools / The Workshop — interactions
// Cursor spotlight, a live Split Bill demo (tweened shares + per-mode accent),
// scroll reveals, a magnetic CTA, and the suggest-a-tool toast.
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- IDR formatting ----------
  function rp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(n)); }

  // ---------- Live demo data ----------
  const TOTAL = 500000;
  const MODES = {
    equal: {
      acc: '111,155,209', sub: 'Everyone included pays the same share.',
      shares: [250000, 250000], pct: null, status: 'Fully allocated · Rp 250.000 each'
    },
    custom: {
      acc: '192,138,100', sub: 'Type exactly what each person owes.',
      shares: [300000, 200000], pct: null, status: 'Fully allocated'
    },
    percentage: {
      acc: '160,122,181', sub: 'Give everyone a percentage of the whole.',
      shares: [300000, 200000], pct: [60, 40], status: '100% assigned · balanced'
    },
    itemized: {
      acc: '217,107,138', sub: 'Tap who shared each item; tax follows along.',
      shares: [300000, 200000], pct: null, status: '3 items · all assigned'
    }
  };
  let current = 'equal';

  const feature = $('#feature');
  const seg = $('#demoSeg');
  const sub = $('#demoSub');
  const statusEl = $('#demoStatus');
  const rows = $$('#demo .tl-person');
  const amtEls = rows.map(r => $('[data-amt]', r));
  const barEls = rows.map(r => $('[data-bar]', r));
  const pctEls = rows.map(r => $('[data-pct]', r));

  // tween each person's amount independently
  const tweens = [null, null];
  const shown = [250000, 250000];
  function setMode(mode, animate) {
    const m = MODES[mode]; if (!m) return;
    current = mode;
    feature.style.setProperty('--acc', m.acc);
    sub.textContent = m.sub;
    statusEl.textContent = m.status;
    $$('#demoSeg button').forEach(b => {
      const on = b.dataset.mode === mode;
      b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on));
    });
    rows.forEach((row, i) => {
      const target = m.shares[i];
      // bar width as proportion of total
      barEls[i].style.width = (target / TOTAL * 100).toFixed(1) + '%';
      // pct chip
      if (m.pct) { row.classList.add('show-pct'); pctEls[i].textContent = m.pct[i] + '%'; }
      else row.classList.remove('show-pct');
      // number tween
      if (tweens[i]) cancelAnimationFrame(tweens[i]);
      if (!animate || reduce) { shown[i] = target; amtEls[i].textContent = rp(target); return; }
      const from = shown[i], dur = 620, t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
        const v = from + (target - from) * e;
        shown[i] = v; amtEls[i].textContent = rp(v);
        if (k < 1) tweens[i] = requestAnimationFrame(step);
      };
      tweens[i] = requestAnimationFrame(step);
    });
  }

  seg.addEventListener('click', e => {
    const b = e.target.closest('button[data-mode]'); if (!b) return;
    if (b.dataset.mode === current) return;
    setMode(b.dataset.mode, true);
  });
  // keyboard: arrow nav across the segmented control
  seg.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const order = ['equal', 'custom', 'percentage', 'itemized'];
    let i = order.indexOf(current);
    i = e.key === 'ArrowRight' ? (i + 1) % 4 : (i + 3) % 4;
    setMode(order[i], true);
    const btn = seg.querySelector('button[data-mode="' + order[i] + '"]'); if (btn) btn.focus();
    e.preventDefault();
  });
  setMode('itemized', false); // boot to the tool's real default, no anim

  // auto-advance once after a beat to hint interactivity, unless user interacts first
  let userTouched = false;
  seg.addEventListener('pointerdown', () => { userTouched = true; });
  if (!reduce) {
    setTimeout(() => { if (!userTouched) setMode('equal', true); }, 1100);
  }

  // ---------- Cursor spotlight on hero + feature glow ----------
  const hero = $('#hero');
  if (!reduce) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      hero.classList.add('lit');
    });
    hero.addEventListener('pointerleave', () => hero.classList.remove('lit'));

    feature.addEventListener('pointermove', e => {
      const r = feature.getBoundingClientRect();
      feature.style.setProperty('--fmx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      feature.style.setProperty('--fmy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  // ---------- Token cloud: connector wires + gentle pointer drift ----------
  const cloud = $('#cloud');
  const wires = $('#wires');
  function drawWires() {
    if (!cloud || !wires) return;
    const live = $('#liveToken');
    const ghosts = $$('.tl-token.ghost', cloud);
    const cr = cloud.getBoundingClientRect();
    const c = live.getBoundingClientRect();
    const cx = c.left + c.width / 2 - cr.left, cy = c.top + c.height / 2 - cr.top;
    wires.innerHTML = ghosts.map(g => {
      const b = g.getBoundingClientRect();
      const gx = b.left + b.width / 2 - cr.left, gy = b.top + b.height / 2 - cr.top;
      return '<line x1="' + cx.toFixed(0) + '" y1="' + cy.toFixed(0) + '" x2="' + gx.toFixed(0) + '" y2="' + gy.toFixed(0) + '"/>';
    }).join('');
  }
  setTimeout(drawWires, 60);
  window.addEventListener('resize', drawWires);

  // subtle pointer drift on tokens (not scroll parallax)
  if (!reduce && cloud) {
    cloud.addEventListener('pointermove', e => {
      const r = cloud.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      $$('.tl-token', cloud).forEach((t, i) => {
        const depth = t.classList.contains('live') ? 10 : 16 + (i % 3) * 5;
        t.style.transform = 'translate(' + (dx * depth).toFixed(1) + 'px,' + (dy * depth).toFixed(1) + 'px)';
      });
      requestAnimationFrame(drawWires);
    });
    cloud.addEventListener('pointerleave', () => {
      $$('.tl-token', cloud).forEach(t => { t.style.transform = ''; });
      setTimeout(drawWires, 320);
    });
  }

  // live token → open tool
  $('#liveToken').addEventListener('click', () => { window.location.href = 'A Curious Note - Split Bill.html'; });

  // ghost tokens + soon cards → toast
  $$('[data-soon]').forEach(el => {
    el.addEventListener('click', () => {
      window.showToast && window.showToast('“' + el.dataset.soon + '” is still on the workbench — soon.');
    });
  });

  // ---------- Magnetic primary CTAs ----------
  if (!reduce) {
    $$('.btn-primary').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = 'translate(' + (dx * 6).toFixed(1) + 'px,' + (dy * 5 - 1).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  // ---------- Suggest a tool ----------
  $('#suggestForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#suggestInput');
    const v = input.value.trim();
    if (!v) { window.showToast && window.showToast('Type an idea first — anything counts.'); input.focus(); return; }
    window.showToast && window.showToast('Noted — thank you for the nudge. ✺');
    input.value = '';
    input.blur();
  });

  // ---------- Scroll reveals ----------
  const revealers = $$('.reveal');
  if (revealers.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealers.forEach(el => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealers.forEach(el => io.observe(el));
    }
  }
})();
