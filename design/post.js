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

// === Related posts (small subset) ===
const RELATED = [
  { id:'why-i-bookmark', title:"Why I still bookmark", date:'Mar 28', read:'7 min', cat:{label:'Essay', color:'#7c8db5'}, p1:'#a59883', p2:'#4a3f30' },
  { id:'editor-feels',   title:"Editor feels: friction is a feature", date:'Mar 21', read:'9 min', cat:{label:'Craft', color:'#c08a64'}, p1:'#c08a64', p2:'#5c3b25' },
  { id:'glassy-uis',     title:"Glassy UIs and the long history of seeing through", date:'Feb 29', read:'14 min', cat:{label:'Craft', color:'#c08a64'}, p1:'#dce6ec', p2:'#7d96aa' }
];

const relGrid = document.getElementById('relatedGrid');
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
