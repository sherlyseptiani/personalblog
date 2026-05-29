// Homepage: posts grid, filtering, load more, idea widget, video color sync

const CATEGORIES = {
  essay:       { label: 'Essay',       color: '#7c8db5' },
  craft:       { label: 'Craft',       color: '#c08a64' },
  field:       { label: 'Field note',  color: '#6ba39a' },
  reading:     { label: 'Reading',     color: '#a07ab5' },
  systems:     { label: 'Systems',     color: '#3f7a8c' },
  science:     { label: 'Science',     color: '#5a8a82' },
  language:    { label: 'Language',    color: '#8a7ab8' },
  perspective: { label: 'Perspective', color: '#c08a64' },
  book:        { label: 'Book',        color: '#a07ab5' },
  personal:    { label: 'Personal',    color: '#d96b8a' },
  environment: { label: 'Environment', color: '#6ba39a' },
  animal:      { label: 'Animal',      color: '#6f9bd1' },
  others:      { label: 'Others',      color: '#94a3b8' },
  uncategorized: { label: 'Uncategorized', color: '#64748b' }
};

// 24 posts. Mix of thumb shapes and a few text-only cards.
const POSTS = [
  {
    id: 'quiet-software',
    title: "The case for quiet software",
    preview: "Notifications are the rain, the interface is the umbrella. A short argument for tools that whisper.",
    cat: 'essay', date: 'Apr 4', read: '12 min',
    thumb: 'tall', featured: true,
    art: { p1: '#1f2a3a', p2: '#4f6b85', kind: 'orb' }
  },
  {
    id: 'why-i-bookmark',
    title: "Why I still bookmark",
    preview: "Bookmarks are slow social media for one. Notes from twelve years of keeping a personal corner of the web.",
    cat: 'essay', date: 'Mar 28', read: '7 min',
    thumb: 'short',
    art: { p1: '#a59883', p2: '#4a3f30', kind: 'pages' }
  },
  {
    id: 'editor-feels',
    title: "Editor feels: friction is a feature",
    preview: "The best writing tools are the ones that resist a little. On Markdown, magnets, and intentional drag.",
    cat: 'craft', date: 'Mar 21', read: '9 min',
    thumb: 'square',
    art: { p1: '#c08a64', p2: '#5c3b25', kind: 'lines' }
  },
  // text-only highlight
  {
    id: 'aging-drafts',
    title: "On letting drafts age",
    preview: null, cat: 'essay', date: 'Mar 14', read: '4 min',
    textOnly: true,
    pull: "A draft is a kind of weather report. If you wait, the weather changes — but the place it describes stays the same."
  },
  {
    id: 'attention-weather',
    title: "The weather of attention",
    preview: "Some mornings the mind is overcast. Some afternoons it's bright and stupid. A field guide to your own focus.",
    cat: 'field', date: 'Mar 7', read: '11 min',
    thumb: 'tall',
    art: { p1: '#b3c4d6', p2: '#4a6178', kind: 'wave' }
  },
  {
    id: 'glassy-uis',
    title: "Glassy UIs and the long history of seeing through",
    preview: "From medieval reliquaries to liquid glass. Translucency is older and weirder than your icon set.",
    cat: 'craft', date: 'Feb 29', read: '14 min',
    thumb: 'short',
    art: { p1: '#dce6ec', p2: '#7d96aa', kind: 'glass' }
  },
  {
    id: 'reading-stack',
    title: "What I read in February",
    preview: "A perfectly ordinary stack of books, with one strange entry that's been rearranging my month.",
    cat: 'reading', date: 'Feb 25', read: '6 min',
    thumb: 'square',
    art: { p1: '#a07ab5', p2: '#3d2845', kind: 'spines' }
  },
  {
    id: 'systems-thinking',
    title: "Systems are sentences",
    preview: "How thinking about software like prose changes which parts you care about.",
    cat: 'systems', date: 'Feb 18', read: '10 min',
    thumb: 'tall',
    art: { p1: '#3f7a8c', p2: '#0f2630', kind: 'grid' }
  },
  // second batch (hidden until load more)
  {
    id: 'walks',
    title: "Walks I take when I'm stuck",
    preview: "Geography of the small block. On the four-block loop that has survived three apartments.",
    cat: 'field', date: 'Feb 11', read: '5 min',
    thumb: 'wide',
    art: { p1: '#6ba39a', p2: '#21443e', kind: 'topo' }
  },
  {
    id: 'taxonomy-restless',
    title: "A taxonomy of restlessness",
    preview: null, cat: 'essay', date: 'Feb 4', read: '8 min',
    textOnly: true,
    pull: "There is a restlessness that points at the work. There is another that points away. The trick is learning to tell them apart."
  },
  {
    id: 'tiny-tools',
    title: "Tiny tools and the maintenance of joy",
    preview: "I rewrote my note-taker for the third time this year. Notes from someone who knows it's a defense mechanism.",
    cat: 'craft', date: 'Jan 28', read: '9 min',
    thumb: 'short',
    art: { p1: '#c4b294', p2: '#5a4a30', kind: 'tools' }
  },
  {
    id: 'what-the-room-knows',
    title: "What the room knows",
    preview: "On environments that remember things for you, and the strange dignity of a desk left alone.",
    cat: 'field', date: 'Jan 21', read: '7 min',
    thumb: 'tall',
    art: { p1: '#8a9aab', p2: '#2c3a4c', kind: 'room' }
  },
  {
    id: 'reading-jan',
    title: "What I read in January",
    preview: "Three novels, one re-read, and an essay that made me retire a sentence I'd been saying for ten years.",
    cat: 'reading', date: 'Jan 14', read: '6 min',
    thumb: 'square',
    art: { p1: '#b594a0', p2: '#3e2a31', kind: 'spines' }
  },
  {
    id: 'small-pages',
    title: "In praise of small pages",
    preview: "Personal sites are vegetable gardens. They aren't trying to feed the world.",
    cat: 'essay', date: 'Jan 7', read: '8 min',
    thumb: 'wide',
    art: { p1: '#7d9b75', p2: '#28402a', kind: 'leaves' }
  },
  {
    id: 'tracking-less',
    title: "Software that doesn't track me",
    preview: "A short list of tools I trust, why I trust them, and the failure modes I've watched up close.",
    cat: 'systems', date: 'Dec 30', read: '13 min',
    thumb: 'short',
    art: { p1: '#3a4b66', p2: '#0e1726', kind: 'mesh' }
  },
  {
    id: 'reread',
    title: "On rereading",
    preview: null, cat: 'reading', date: 'Dec 23', read: '5 min',
    textOnly: true,
    pull: "Rereading is the only honest book review. The second time, the book stops trying to charm you — and that's when it starts telling the truth."
  },
  // third batch
  {
    id: 'commonplace',
    title: "Keeping a commonplace book in 2026",
    preview: "Why a paper notebook still wins the war for ideas, and how mine has changed shape.",
    cat: 'craft', date: 'Dec 16', read: '11 min',
    thumb: 'tall',
    art: { p1: '#c9b58a', p2: '#5a4625', kind: 'pages' }
  },
  {
    id: 'rules-i-broke',
    title: "Five writing rules I broke this year",
    preview: "Adverbs. Em-dashes. Long sentences. Long paragraphs. Caring what people thought.",
    cat: 'essay', date: 'Dec 9', read: '7 min',
    thumb: 'wide',
    art: { p1: '#a07882', p2: '#3a2530', kind: 'lines' }
  },
  {
    id: 'desk-archeology',
    title: "Desk archaeology",
    preview: "A tour of the things on my desk and what each one is doing, ranked by what they secretly are.",
    cat: 'field', date: 'Dec 2', read: '6 min',
    thumb: 'short',
    art: { p1: '#9b8f75', p2: '#3a3225', kind: 'objects' }
  },
  {
    id: 'long-now',
    title: "Long now, short week",
    preview: "Planning for the decade is easy. Planning for Thursday is a discipline.",
    cat: 'systems', date: 'Nov 25', read: '9 min',
    thumb: 'square',
    art: { p1: '#557a8c', p2: '#1a2c36', kind: 'grid' }
  },
  {
    id: 'first-paragraph',
    title: "The first paragraph problem",
    preview: null, cat: 'essay', date: 'Nov 18', read: '4 min',
    textOnly: true,
    pull: "Every first paragraph is a door. Most of them open onto the wrong room."
  },
  {
    id: 'reading-nov',
    title: "What I read in November",
    preview: "Heavier than usual. Two history books, a poetry collection, and a novel I'm still arguing with.",
    cat: 'reading', date: 'Nov 11', read: '7 min',
    thumb: 'short',
    art: { p1: '#8a6f9b', p2: '#2e2138', kind: 'spines' }
  },
  {
    id: 'edges',
    title: "The edges of things",
    preview: "Borders, deadlines, page margins. A little essay about how shapes contain what they contain.",
    cat: 'essay', date: 'Nov 4', read: '8 min',
    thumb: 'tall',
    art: { p1: '#b0bdc7', p2: '#4a5560', kind: 'wave' }
  },
  {
    id: 'workshop-notes',
    title: "Workshop notes: building in the open",
    preview: "After two months of building in public. What changed in the work, and what changed in me.",
    cat: 'craft', date: 'Oct 28', read: '12 min',
    thumb: 'wide',
    art: { p1: '#d39a64', p2: '#5c3a20', kind: 'tools' }
  }
];

// === Generate placeholder art SVGs ===
function artSvg(kind) {
  switch (kind) {
    case 'orb':
      return `<svg class="ph-art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
        <defs><radialGradient id="g1" cx="35%" cy="30%"><stop offset="0%" stop-color="#fff" stop-opacity="0.8"/><stop offset="60%" stop-color="#fff" stop-opacity="0.05"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
        <circle cx="100" cy="140" r="78" fill="url(#g1)"/>
        <circle cx="100" cy="140" r="78" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>
        <circle cx="100" cy="140" r="48" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/>
        <circle cx="100" cy="140" r="20" fill="rgba(255,255,255,0.15)"/>
      </svg>`;
    case 'pages':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        <g transform="translate(40,30) rotate(-6)"><rect width="80" height="100" fill="rgba(255,255,255,0.12)" rx="2"/><line x1="10" y1="20" x2="70" y2="20" stroke="rgba(255,255,255,0.3)" stroke-width="1"/><line x1="10" y1="30" x2="62" y2="30" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/><line x1="10" y1="40" x2="68" y2="40" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/><line x1="10" y1="50" x2="54" y2="50" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/></g>
        <g transform="translate(80,40) rotate(4)"><rect width="80" height="100" fill="rgba(255,255,255,0.2)" rx="2"/><line x1="10" y1="20" x2="70" y2="20" stroke="rgba(255,255,255,0.4)" stroke-width="1"/><line x1="10" y1="30" x2="58" y2="30" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/><line x1="10" y1="40" x2="66" y2="40" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/><line x1="10" y1="50" x2="60" y2="50" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/><line x1="10" y1="60" x2="50" y2="60" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/></g>
      </svg>`;
    case 'lines':
      return `<svg class="ph-art" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:18}).map((_,i)=>`<line x1="${10+i*10}" y1="20" x2="${10+i*10}" y2="180" stroke="rgba(255,255,255,${0.1+(i%3)*0.08})" stroke-width="1"/>`).join('')}
        <circle cx="100" cy="100" r="46" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      </svg>`;
    case 'wave':
      return `<svg class="ph-art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:14}).map((_,i)=>`<path d="M -10 ${60+i*16} Q 50 ${40+i*16}, 100 ${60+i*16} T 210 ${60+i*16}" fill="none" stroke="rgba(255,255,255,${0.08+i*0.015})" stroke-width="0.8"/>`).join('')}
      </svg>`;
    case 'glass':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        <rect x="40" y="30" width="120" height="90" rx="14" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
        <rect x="40" y="30" width="120" height="38" rx="14" fill="rgba(255,255,255,0.3)"/>
        <circle cx="60" cy="50" r="3" fill="rgba(255,255,255,0.6)"/>
        <circle cx="72" cy="50" r="3" fill="rgba(255,255,255,0.4)"/>
        <circle cx="84" cy="50" r="3" fill="rgba(255,255,255,0.3)"/>
        <line x1="55" y1="86" x2="145" y2="86" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>
        <line x1="55" y1="98" x2="125" y2="98" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
      </svg>`;
    case 'spines':
      return `<svg class="ph-art" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        ${[15,40,68,90,114,140,168].map((x,i)=>`<rect x="${x}" y="${30+(i%2)*8}" width="${18+(i%3)*4}" height="${140-(i%2)*10}" fill="rgba(255,255,255,${0.15+(i%4)*0.07})" rx="1"/>`).join('')}
        <line x1="10" y1="172" x2="190" y2="172" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
      </svg>`;
    case 'grid':
      return `<svg class="ph-art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
        <defs><pattern id="p1" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/></pattern></defs>
        <rect width="200" height="250" fill="url(#p1)"/>
        <rect x="40" y="60" width="120" height="60" fill="rgba(255,255,255,0.18)" rx="6"/>
        <rect x="40" y="130" width="80" height="60" fill="rgba(255,255,255,0.28)" rx="6"/>
        <rect x="130" y="130" width="30" height="60" fill="rgba(255,255,255,0.12)" rx="6"/>
      </svg>`;
    case 'topo':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:9}).map((_,i)=>`<ellipse cx="${110-i*5}" cy="${80+i*2}" rx="${50+i*10}" ry="${24+i*5}" fill="none" stroke="rgba(255,255,255,${0.25-i*0.02})" stroke-width="0.8"/>`).join('')}
      </svg>`;
    case 'tools':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        <rect x="30" y="60" width="60" height="8" rx="4" fill="rgba(255,255,255,0.35)"/>
        <rect x="40" y="40" width="40" height="8" rx="4" fill="rgba(255,255,255,0.25)"/>
        <circle cx="140" cy="60" r="22" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <line x1="155" y1="75" x2="180" y2="100" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
        <rect x="30" y="90" width="80" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
        <rect x="30" y="105" width="60" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
      </svg>`;
    case 'room':
      return `<svg class="ph-art" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
        <rect x="20" y="40" width="160" height="120" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <rect x="50" y="80" width="40" height="60" fill="rgba(255,255,255,0.18)"/>
        <rect x="110" y="100" width="50" height="40" fill="rgba(255,255,255,0.25)"/>
        <line x1="20" y1="160" x2="180" y2="160" stroke="rgba(255,255,255,0.3)"/>
        <circle cx="160" cy="60" r="14" fill="rgba(255,255,255,0.4)"/>
      </svg>`;
    case 'leaves':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:8}).map((_,i)=>{
          const x=30+i*22, y=60+(i%3)*20;
          return `<ellipse cx="${x}" cy="${y}" rx="14" ry="22" fill="rgba(255,255,255,${0.15+(i%3)*0.08})" transform="rotate(${i*23} ${x} ${y})"/>`;
        }).join('')}
      </svg>`;
    case 'mesh':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        ${Array.from({length:6}).map((_,r)=>Array.from({length:8}).map((_,c)=>`<circle cx="${20+c*22}" cy="${20+r*22}" r="2" fill="rgba(255,255,255,${0.4-Math.abs(r-2.5)*0.06})"/>`).join('')).join('')}
        ${Array.from({length:6}).map((_,r)=>Array.from({length:7}).map((_,c)=>`<line x1="${20+c*22}" y1="${20+r*22}" x2="${42+c*22}" y2="${20+r*22}" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/>`).join('')).join('')}
      </svg>`;
    case 'objects':
      return `<svg class="ph-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice">
        <rect x="20" y="80" width="60" height="40" fill="rgba(255,255,255,0.22)" rx="3"/>
        <circle cx="120" cy="100" r="22" fill="rgba(255,255,255,0.28)"/>
        <rect x="150" y="70" width="36" height="50" fill="rgba(255,255,255,0.18)" rx="4"/>
        <line x1="10" y1="125" x2="190" y2="125" stroke="rgba(255,255,255,0.4)"/>
      </svg>`;
    default:
      return `<svg class="ph-art" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice"><circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.2)"/></svg>`;
  }
}

function renderCard(p) {
  const cat = CATEGORIES[p.cat];
  const href = `A Curious Note - Post.html?id=${encodeURIComponent(p.id)}`;
  if (p.textOnly) {
    return `<a href="${href}" class="post-card text-only glass" data-cat="${p.cat}">
      <div class="meta-row">
        <span class="tag"><span class="tag-dot" style="background:${cat.color}"></span>${cat.label}</span>
      </div>
      <h3>${p.title}</h3>
      <div class="pull">${p.pull}</div>
      <div class="footline">
        <span>${p.date} · ${p.read}</span>
        <span class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
      </div>
    </a>`;
  }
  const art = p.art || {};
  return `<a href="${href}" class="post-card glass ${p.featured?'featured':''}" data-cat="${p.cat}">
    <div class="thumb ${p.thumb||'square'}">
      <div class="ph" style="--p1:${art.p1};--p2:${art.p2};">
        ${artSvg(art.kind || 'orb')}
        <div class="ph-overlay"></div>
        <div class="ph-label">${cat.label}</div>
      </div>
    </div>
    <div class="meta-row">
      <span class="tag"><span class="tag-dot" style="background:${cat.color}"></span>${cat.label}</span>
      <span class="meta-stat" style="font-size:11.5px;">${p.read}</span>
    </div>
    <h3>${p.title}</h3>
    <div class="preview">${p.preview}</div>
    <div class="footline">
      <span>${p.date}</span>
      <span class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
    </div>
  </a>`;
}

// === State ===
let visibleCount = 8;
let activeFilter = 'all';
const grid = document.getElementById('postsGrid');
const countEl = document.getElementById('postCount');
const loadBtn = document.getElementById('loadMore');

function getFiltered() {
  return activeFilter === 'all' ? POSTS : POSTS.filter(p => p.cat === activeFilter);
}

function render() {
  const list = getFiltered();
  const slice = list.slice(0, visibleCount);
  grid.innerHTML = slice.map(renderCard).join('');
  const total = list.length;
  const showing = Math.min(visibleCount, total);
  countEl.textContent = `Showing ${showing} of ${total}`;
  loadBtn.style.display = showing >= total ? 'none' : 'inline-flex';
}

// Filter buttons
document.getElementById('filters').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  document.querySelectorAll('#filters button').forEach(x => x.classList.toggle('active', x === b));
  activeFilter = b.dataset.filter;
  visibleCount = 8;
  render();
});

loadBtn.addEventListener('click', () => {
  visibleCount += 8;
  render();
});

render();

// === Idea widget ===
const ideaInput = document.getElementById('ideaInput');
const ideaCount = document.getElementById('ideaCount');
const ideaSend = document.getElementById('ideaSend');

ideaInput.addEventListener('input', () => {
  ideaCount.textContent = ideaInput.value.length;
});

ideaSend.addEventListener('click', () => {
  const v = ideaInput.value.trim();
  if (!v) { ideaInput.focus(); return; }
  ideaInput.value = '';
  ideaCount.textContent = '0';
  window.showToast('Idea sent — thanks for the spark.');
});

// === Video color sync ===
const video = document.getElementById('heroVideo');
const swatch = document.getElementById('videoSwatch');
const hexEl = document.getElementById('videoHex');
function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();}

window.bindVideoColorSync(video, {
  onColor(r,g,b) {
    swatch.style.background = `rgb(${r},${g},${b})`;
    hexEl.textContent = rgbToHex(r,g,b);
  }
});

// Some browsers throw on play() with autoplay — kickstart in case
video.play().catch(()=>{});

// === Notify-on-new-post button ===
// Persists subscription state. Requests browser notification permission when
// available; otherwise falls back to a simple "you'll be notified" confirmation.
const NOTIFY_KEY = 'acn-notify';
function setNotifyState(btn, on) {
  btn.classList.toggle('on', on);
  const label = btn.querySelector('.notify-label');
  const ico = btn.querySelector('svg');
  if (on) {
    label.textContent = "You'll be notified";
    ico.innerHTML = '<path d="M20 6 9 17l-5-5"/>';
    btn.setAttribute('aria-pressed', 'true');
  } else {
    label.textContent = 'Notify me on new posts';
    ico.innerHTML = '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>';
    btn.setAttribute('aria-pressed', 'false');
  }
}

window.toggleNotify = async function(btn) {
  const on = btn.classList.contains('on');
  if (on) {
    setNotifyState(btn, false);
    try { localStorage.removeItem(NOTIFY_KEY); } catch(e) {}
    window.showToast('Notifications off. You can re-enable any time.');
    return;
  }
  // Try the real Notification API; fall back gracefully.
  if ('Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotifyState(btn, true);
        try { localStorage.setItem(NOTIFY_KEY, '1'); } catch(e) {}
        window.showToast("Got it — I'll ping you when a new note goes up.");
        // Friendly preview ping
        try { new Notification('A Curious Note', { body: "You'll get a quiet ping for each new essay." }); } catch(e) {}
        return;
      }
      if (perm === 'denied') {
        window.showToast('Notifications blocked in your browser. Falling back to email.');
        return;
      }
    } catch(e) { /* fall through */ }
  }
  // No API or dismissed — still confirm
  setNotifyState(btn, true);
  try { localStorage.setItem(NOTIFY_KEY, '1'); } catch(e) {}
  window.showToast("Subscribed — you'll get a ping when a new note arrives.");
};

// restore state
const notifyBtn = document.getElementById('notifyBtn');
if (notifyBtn && localStorage.getItem(NOTIFY_KEY)) setNotifyState(notifyBtn, true);

// === Thumbnail SVG color variables (theme-aware) ===
function updateThumbColors() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
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
    document.documentElement.style.setProperty(key, val);
  });
}

// Listen for theme changes
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-theme') {
      updateThumbColors();
    }
  });
});
themeObserver.observe(document.documentElement, { attributes: true });
updateThumbColors();
