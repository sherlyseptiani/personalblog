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
