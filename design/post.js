// Post detail page logic

// === Reading mode ===
const readingBtn = document.getElementById('readingBtn');
function syncReadingBtn() {
  if (readingBtn) readingBtn.classList.toggle('active', document.documentElement.classList.contains('reading-mode'));
}
window.enterReading = function() {
  document.documentElement.classList.add('reading-mode');
  syncReadingBtn();
};
window.exitReading = function() {
  document.documentElement.classList.remove('reading-mode');
  syncReadingBtn();
};
window.toggleReading = function() {
  document.documentElement.classList.toggle('reading-mode');
  syncReadingBtn();
};

// keyboard: R toggles reading, Esc exits
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') exitReading();
  if (e.key.toLowerCase() === 'r' && !/input|textarea/i.test(e.target.tagName)) {
    window.toggleReading();
  }
});

// === Font size ===
let fontStep = parseInt(localStorage.getItem('acn-font-step') || '0', 10);
function applyFont() {
  // base 19px, step ±1px clamped
  fontStep = Math.max(-3, Math.min(4, fontStep));
  const px = 19 + fontStep;
  document.querySelector('.article').style.fontSize = px + 'px';
  try { localStorage.setItem('acn-font-step', String(fontStep)); } catch(e) {}
}
window.adjustFont = function(d) { fontStep += d; applyFont(); };
applyFont();

// === Font family ===
window.setFont = function(family) {
  const article = document.querySelector('.article');
  const map = {
    serif: 'var(--font-serif)',
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)'
  };
  article.style.fontFamily = map[family];
  try { localStorage.setItem('acn-font-family', family); } catch(e) {}
  document.querySelectorAll('[data-font-target]').forEach(b => {
    b.classList.toggle('active', b.dataset.fontTarget === family);
  });
};
const savedFont = localStorage.getItem('acn-font-family');
if (savedFont) window.setFont(savedFont);

// === Accent color (persists) ===
function applyAccent(rgbStr) {
  const [r, g, b] = rgbStr.split(',').map(s => parseInt(s.trim(), 10));
  document.documentElement.style.setProperty('--video-r', r);
  document.documentElement.style.setProperty('--video-g', g);
  document.documentElement.style.setProperty('--video-b', b);
  try { localStorage.setItem('acn-accent', rgbStr); } catch(e) {}
  document.querySelectorAll('#accentRow .swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === rgbStr);
  });
}
const savedAccent = localStorage.getItem('acn-accent');
if (savedAccent) applyAccent(savedAccent);
else applyAccent('86,124,148');

document.getElementById('accentRow').addEventListener('click', e => {
  const b = e.target.closest('.swatch');
  if (!b) return;
  applyAccent(b.dataset.color);
});

// === Theme panel toggle ===
const themePanel = document.getElementById('themePanel');
const themeBtn = document.getElementById('themeBtn');
function syncThemeBtn() {
  if (themeBtn) themeBtn.classList.toggle('active', themePanel.classList.contains('open'));
}
window.togglePanel = function() {
  themePanel.classList.toggle('open');
  syncThemeBtn();
};
document.addEventListener('click', e => {
  if (themePanel.classList.contains('open') &&
      !themePanel.contains(e.target) &&
      !e.target.closest('#themeBtn')) {
    themePanel.classList.remove('open');
    syncThemeBtn();
  }
});

// Mark active mode button on load
['light','sepia','dark'].forEach(t => {
  document.querySelectorAll(`[data-theme-target="${t}"]`).forEach(b =>
    b.classList.toggle('active', document.documentElement.dataset.theme === t)
  );
});

// === Reading progress + shrink rail on scroll ===
const progress = document.getElementById('readProgress');
const article = document.querySelector('.post-wrap');
const postControls = document.getElementById('postControls');
function updateProgress() {
  const rect = article.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const scrolled = -rect.top;
  const pct = Math.max(0, Math.min(1, scrolled / total));
  progress.style.width = (pct * 100) + '%';
  // Shrink rail once user has scrolled into the article
  if (postControls) postControls.classList.toggle('shrunk', window.scrollY > 240);
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// === TOC scrollspy ===
const tocLinks = document.querySelectorAll('#toc a');
const sectionIds = Array.from(tocLinks).map(a => a.getAttribute('href').slice(1));
const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
function updateToc() {
  const y = window.scrollY + 200;
  let active = sections[0];
  for (const s of sections) {
    if (s.offsetTop <= y) active = s;
  }
  if (!active) return;
  tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active.id));
}
window.addEventListener('scroll', updateToc, { passive: true });
updateToc();

// === Reactions ===
window.toggleReact = function(btn, kind) {
  btn.classList.toggle('active');
  const count = btn.querySelector('.count');
  let n = parseInt(count.textContent, 10);
  n += btn.classList.contains('active') ? 1 : -1;
  count.textContent = n;
};

// === Share / bookmark / idea ===
window.shareLink = function() {
  try { navigator.clipboard?.writeText?.(location.href); } catch(e) {}
  window.showToast('Link copied to clipboard.');
};
window.toggleBookmark = function() {
  const btn = document.getElementById('bookmarkBtn');
  const active = btn ? btn.classList.toggle('active') : true;
  window.showToast(active ? 'Bookmarked — saved to your library.' : 'Bookmark removed.');
};

const ideaSend = document.getElementById('ideaSend');
const ideaInput = document.getElementById('ideaInput');
if (ideaSend) {
  ideaSend.addEventListener('click', () => {
    if (!ideaInput.value.trim()) { ideaInput.focus(); return; }
    ideaInput.value = '';
    window.showToast('Thanks — I read every one.');
  });
}

// === Mark as read + Reading celebration ===
let celebrated = false;
const postEndEl = document.querySelector('.post-end');
if (postEndEl) {
  const readObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    // Show celebration if not already shown
    if (!celebrated) {
      celebrated = true;
      showFireworks();
      showThankYouModal();
    }
    // Mark as read in localStorage
    try {
      const stored = localStorage.getItem('acn-read') || '[]';
      const readList = JSON.parse(stored);
      const postId = new URLSearchParams(location.search).get('id') || 'current-post';
      if (!readList.includes(postId)) {
        readList.push(postId);
        localStorage.setItem('acn-read', JSON.stringify(readList));
      }
    } catch {}
    readObserver.disconnect();
  }, { threshold: 0.5 });
  readObserver.observe(postEndEl);
}

// Fireworks celebration
function showFireworks() {
  const canvas = document.createElement('canvas');
  canvas.className = 'fireworks-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1000;';
  document.body.appendChild(canvas);

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const particles = [];
  const colors = ['#c6b5e0', '#a7d8c5', '#f5b8c7', '#f6c7a3', '#b3d0e8', '#fff'];

  function createBurst(x, y) {
    const count = 24 + Math.random() * 16;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.5 + Math.random() * 2,
        decay: 0.015 + Math.random() * 0.01
      });
    }
  }

  let burstCount = 0;
  const maxBursts = 4;
  function launchBurst() {
    if (burstCount >= maxBursts) return;
    const x = (0.2 + Math.random() * 0.6) * rect.width;
    const y = (0.3 + Math.random() * 0.4) * rect.height;
    createBurst(x, y);
    burstCount++;
    setTimeout(launchBurst, 300 + Math.random() * 400);
  }
  launchBurst();

  function animate() {
    ctx.clearRect(0, 0, rect.width, rect.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.vx *= 0.98;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (particles.length > 0 || burstCount < maxBursts) {
      requestAnimationFrame(animate);
    } else {
      setTimeout(() => canvas.remove(), 500);
    }
  }
  animate();
}

// Thank you modal
function showThankYouModal() {
  const modal = document.createElement('div');
  modal.className = 'thank-you-modal';
  modal.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(var(--video-r),var(--video-g),var(--video-b),0.15);backdrop-filter:blur(8px);z-index:1001;animation:fadeIn 0.4s ease-out;padding:20px;';
  modal.innerHTML = `
    <div class="thank-you-content" style="background:var(--surface-1);border-radius:20px;padding:40px 48px;text-align:center;max-width:420px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.15);border:1px solid rgba(var(--video-r),var(--video-g),var(--video-b),0.2);animation:slideUp 0.5s cubic-bezier(0.16,1,0.3,1);">
      <div class="thank-you-icon" style="width:64px;height:64px;margin:0 auto 20px;color:var(--video-tint);animation:starPop 0.6s cubic-bezier(0.34,1.56,0.64,1);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:100%;height:100%;fill:rgba(var(--video-r),var(--video-g),var(--video-b),0.15);">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <h3 style="font-family:var(--font-serif);font-size:24px;margin:0 0 12px;color:var(--ink-1);font-weight:500;">Thank you for reading</h3>
      <p style="font-family:var(--font-serif);font-size:16px;font-style:italic;color:var(--ink-2);margin:0 0 20px;opacity:0.8;">The case for quiet software</p>
      <p style="font-size:14px;color:var(--ink-2);margin:0 0 28px;line-height:1.6;">You've reached the end. Hope you enjoyed the journey.</p>
      <button onclick="this.closest('.thank-you-modal').remove()" class="btn btn-primary" style="min-width:160px;">Continue exploring</button>
    </div>
  `;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  document.body.appendChild(modal);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes starPop { 0% { transform: scale(0) rotate(-20deg); } 70% { transform: scale(1.1) rotate(5deg); } 100% { transform: scale(1) rotate(0); } }
`;
document.head.appendChild(style);

// === Related posts (small subset) ===
const RELATED = [
  { id:'why-i-bookmark', title:"Why I still bookmark", date:'Mar 28', read:'7 min', cat:{label:'Essay', color:'#7c8db5'}, p1:'#a59883', p2:'#4a3f30' },
  { id:'editor-feels',   title:"Editor feels: friction is a feature", date:'Mar 21', read:'9 min', cat:{label:'Craft', color:'#c08a64'}, p1:'#c08a64', p2:'#5c3b25' },
  { id:'glassy-uis',     title:"Glassy UIs and the long history of seeing through", date:'Feb 29', read:'14 min', cat:{label:'Craft', color:'#c08a64'}, p1:'#dce6ec', p2:'#7d96aa' }
];

const relGrid = document.getElementById('relatedGrid');
if (relGrid) {
  relGrid.innerHTML = RELATED.map(r => `
    <a href="A Curious Note - Post.html?id=${r.id}" class="post-card glass">
      <div class="thumb short">
        <div class="ph" style="--p1:${r.p1};--p2:${r.p2};">
          <div class="ph-overlay"></div>
          <div class="ph-label">${r.cat.label}</div>
        </div>
      </div>
      <div class="meta-row">
        <span class="tag"><span class="tag-dot" style="background:${r.cat.color}"></span>${r.cat.label}</span>
        <span class="meta-stat" style="font-size:11.5px;">${r.read}</span>
      </div>
      <h3>${r.title}</h3>
      <div class="footline">
        <span>${r.date}</span>
        <span class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
      </div>
    </a>`).join('');
}
