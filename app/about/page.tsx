import type { Metadata } from 'next'
import Script from 'next/script'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About Sherly — A Curious Note',
  description: 'Product designer, slow-blogger, and chronic re-arranger of bookmark folders.',
}

const aboutMobileStyles = `
/* ── Mobile hero: text left, avatar right ────────────────── */
@media (max-width: 800px) {
  .about-hero { min-height: 0; }
  .about-hero-inner {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 20px;
  }
  .about-headline {
    flex: 1;
    min-width: 0;
    order: -1;
  }
  .profile-card {
    width: 80px;
    height: 80px;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    flex-shrink: 0;
    order: 1;
  }
  .profile-card .pc-status { display: none; }
}

/* ── Tighter hero padding on phones ─────────────────────── */
@media (max-width: 600px) {
  .about-hero { padding: 28px 20px; }
  .about-card { padding: 20px 20px; }
  .about-masonry > .say-hi-panel .shp-inner { padding: 24px 20px; }
}

/* ── Headline cycling word on its own line ───────────────── */
@media (max-width: 600px) {
  .about-headline h1 { font-size: 34px; }
  .about-headline h1 .em-cycle {
    display: block;
    min-width: 0;
    width: 100%;
    margin-top: 2px;
  }
}

/* ── Say-hi socials: 1 column on narrow screens ──────────── */
@media (max-width: 560px) {
  .shp-socials { grid-template-columns: 1fr; }
}

/* ── Meta pills: slightly tighter on very small screens ───── */
@media (max-width: 420px) {
  .about-meta-row { gap: 6px; }
  .meta-pill { font-size: 11px; padding: 5px 10px; }
}

/* ── Reading strip: clean stacked layout on mobile ──────── */
@media (max-width: 600px) {
  .reading-strip {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 14px 16px;
  }
  .reading-strip .rs-title {
    font-size: 15px;
    flex: none;
    width: 100%;
  }
  .reading-strip .rs-progress {
    width: 100%;
    justify-content: flex-start;
  }
  .reading-strip .rs-bar {
    flex: 1;
    width: auto;
    min-width: 0;
  }
}
`

export default function AboutPage() {
  return (
    <main className="wrap">
      <style>{aboutMobileStyles}</style>

      {/* ============ ABOUT HERO ============ */}
      <section className="about-hero" data-screen-label="about-hero">
        <div className="color-mesh" aria-hidden="true">
          <div className="blob b1"></div>
          <div className="blob b2"></div>
          <div className="blob b3"></div>
          <div className="blob b4"></div>
          <div className="blob b5"></div>
          <div className="blob b6"></div>
        </div>

        <div className="about-hero-inner">
          <div className="profile-card floating">
            {/* image-slot web component loaded by image-slot.js */}
            <image-slot
              id="about-portrait"
              shape="rounded"
              radius="26"
              placeholder="Drop a portrait here"
            ></image-slot>
            <div className="pc-monogram" aria-hidden="true">S</div>
            <div className="pc-overlay" aria-hidden="true"></div>
            <div className="pc-status">
              <span className="dot"></span>
              Available for one new project
            </div>
          </div>

          <div className="about-headline">
            <div className="eyebrow">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg,#d96b8a,#6f9bd1)', display: 'inline-block' }}></span>
              <span>About the writer</span>
            </div>
            <h1>
              Hi, I&apos;m{' '}
              <span className="em-cycle" aria-label="a dog mom">
                <span className="word active">a dog mom</span>
                <span className="word">an avid reader</span>
                <span className="word">a programmer</span>
                <span className="word">a tennis player</span>
                <span className="word">a language learner</span>
                <span className="word">an animal lover</span>
                <span className="word">a science enthusiast</span>
              </span>
            </h1>
            <p className="role">
              I write A Curious Note from a small home in Jakarta, usually on quiet Sunday mornings, with a cup of tea nearby and my dog asleep at my feet.
            </p>
            <div className="about-meta-row">
              <span className="meta-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8z" />
                </svg>
                Jakarta, ID
              </span>
              <span className="meta-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Local time · <span id="localTime">–</span>
              </span>
              <span className="meta-pill">
                <span className="pill-color" style={{ background: 'var(--video-tint)' }}></span>
                Vibing on <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} id="aboutHex">#567C94</span>
              </span>
              <span className="meta-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M3 12h18M3 6h18M3 18h12" />
                </svg>
                Issue 27 · 142 essays
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT BODY ============ */}
      <section className="about-body" id="aboutBody">

        <a className="reading-strip glass reveal" id="readingStrip" href="#" style={{ textDecoration: 'none' }}>
          <span className="rs-eyebrow"><span className="nico"></span>Currently reading</span>
          <span className="rs-sep"></span>
          <span className="rs-title">
            <em>Four Thousand Weeks</em> by Oliver Burkeman
          </span>
          <span className="rs-progress">
            <span className="rs-bar" style={{ '--rs-pct': '51%' } as React.CSSProperties}><span></span></span>
            147 / 288
          </span>
        </a>

        <div className="about-masonry" id="aboutMasonry">

          <div className="about-card about-bio glass reveal">
            <div className="card-eyebrow">
              <span className="sigil" style={{ '--sigil-a': '#f5b8c7', '--sigil-b': '#c6b5e0' } as React.CSSProperties}></span>
              <span className="eyebrow">The longer version</span>
            </div>
            <h3>An incomplete biography.</h3>
            <p>
              I started this blog in 2018 as a way to keep myself honest about what I was actually
              thinking, rather than what I was performing online. Eight years later it&apos;s still a
              small, slightly stubborn project &mdash; no analytics, no sponsorships,
              no &ldquo;growth strategy&rdquo; beyond <em>writing more carefully than I&apos;d like</em>.
            </p>
            <p>
              By day I design product at a tools company you&apos;ve probably heard of.
              <strong> Before that:</strong> design systems at a fintech, agency life in Toronto,
              and a brief stint as a tea sommelier (long story). My favorite part of any
              project is the part where we sit around arguing about names.
            </p>
            <p>
              When I&apos;m not writing or designing I&apos;m usually <em>walking</em>,
              <em> cooking from old library books</em>, or quietly rearranging the furniture in
              my notes app.
            </p>
          </div>

          <div className="about-card glass reveal r-d1">
            <div className="card-eyebrow">
              <span className="sigil" style={{ '--sigil-a': '#a7d8c5', '--sigil-b': '#b3d0e8' } as React.CSSProperties}></span>
              <span className="eyebrow">Quick facts</span>
            </div>
            <h3>The card-stock version.</h3>
            <div className="facts">
              <div className="fact"><span className="k">Based in</span><span className="v">Brooklyn, NY <span className="accent">(mostly)</span></span></div>
              <div className="fact"><span className="k">Day job</span><span className="v">Senior product designer</span></div>
              <div className="fact"><span className="k">Posting since</span><span className="v">Jan 2018 &middot; Issue 27</span></div>
            </div>
          </div>

          <div className="say-hi-panel reveal r-d2">
            <div className="shp-blob shp-b1" aria-hidden="true"></div>
            <div className="shp-blob shp-b2" aria-hidden="true"></div>
            <div className="shp-blob shp-b3" aria-hidden="true"></div>
            <div className="shp-inner">
              <div className="shp-greet">Say Hi.<span className="shp-cursor">|</span></div>
              <div className="shp-sub">Reach me out on my social media account!</div>
              <div className="shp-socials">
                <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@acuriousnote.com'}`}>
                  <span className="sm-icon" style={{ '--sa': '#f5b8c7', '--sb': '#d96b8a' } as React.CSSProperties}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                  <span className="sm-text">
                    <span className="sm-label">Email</span>
                    <span className="sm-handle">sherly@…</span>
                  </span>
                </a>
                <a href="#">
                  <span className="sm-icon" style={{ '--sa': '#c6b5e0', '--sb': '#a07ab5' } as React.CSSProperties}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" />
                    </svg>
                  </span>
                  <span className="sm-text">
                    <span className="sm-label">X</span>
                    <span className="sm-handle">@a_curious_note</span>
                  </span>
                </a>
                <a href="#">
                  <span className="sm-icon" style={{ '--sa': '#f6c7a3', '--sb': '#d96b8a' } as React.CSSProperties}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="sm-text">
                    <span className="sm-label">Instagram</span>
                    <span className="sm-handle">@sherly</span>
                  </span>
                </a>
                <a href="#">
                  <span className="sm-icon" style={{ '--sa': '#6f9bd1', '--sb': '#3f5e8c' } as React.CSSProperties}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.34 17.34H5.67V9.67h2.67zM7 8.34a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1zm11.33 9H15.67V13.5c0-.94-.36-1.5-1.17-1.5-.88 0-1.49.6-1.49 1.5v3.84H10.34V9.67h2.67v1.1c.47-.78 1.36-1.27 2.5-1.27 1.93 0 2.82 1.3 2.82 3.34z" />
                    </svg>
                  </span>
                  <span className="sm-text">
                    <span className="sm-label">LinkedIn</span>
                    <span className="sm-handle">/in/sherly</span>
                  </span>
                </a>
                <a href="#">
                  <span className="sm-icon" style={{ '--sa': '#a7d8c5', '--sb': '#3f5547' } as React.CSSProperties}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33s1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.16.57.67.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
                    </svg>
                  </span>
                  <span className="sm-text">
                    <span className="sm-label">GitHub</span>
                    <span className="sm-handle">@curiousnote</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="about-card glass reveal">
            <div className="card-eyebrow">
              <span className="sigil" style={{ '--sigil-a': '#f5b8c7', '--sigil-b': '#c6b5e0' } as React.CSSProperties}></span>
              <span className="eyebrow">Recommended · For me</span>
            </div>
            <h3>Things I quietly love.</h3>
            <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-2)', fontSize: '14.5px', margin: '-4px 0 16px' }}>
              Tools, books, and a few small luxuries I&apos;ve kept around long enough to recommend.
            </p>
            <div className="recs-list">
              {[
                { color1: '#f5b8c7', color2: '#d96b8a', name: 'iA Writer', desc: 'A plain-text editor that has never asked me to rate it.' },
                { color1: '#c6b5e0', color2: '#a07ab5', name: 'Field Notes — Original Kraft 3-pack', desc: 'The pocket notebook I\'ve used through three apartments.' },
                { color1: '#b3d0e8', color2: '#6f9bd1', name: 'AeroPress Original', desc: 'Three-minute coffee that ruined cafés for me.' },
                { color1: '#a7d8c5', color2: '#6ba39a', name: 'Loop Quiet earplugs', desc: 'For Sunday mornings and the louder kind of café.' },
                { color1: '#f6c7a3', color2: '#c08a64', name: 'Four Thousand Weeks — Oliver Burkeman', desc: 'A time-management book for people who hate them.' },
              ].map(item => (
                <a key={item.name} className="rec-item" href="#" target="_blank" rel="noopener" style={{ '--ra': item.color1, '--rb': item.color2 } as React.CSSProperties}>
                  <span className="rec-thumb">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" />
                    </svg>
                  </span>
                  <span className="rec-info">
                    <span className="rec-name">{item.name}</span>
                    <span className="rec-desc">{item.desc}</span>
                  </span>
                  <span className="rec-cta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
            <div className="rec-disclosure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
              </svg>
              Affiliate links — I only recommend things I actually use.
            </div>
          </div>

          <div className="about-card glass reveal r-d1">
            <div className="card-eyebrow">
              <span className="sigil" style={{ '--sigil-a': '#f6c7a3', '--sigil-b': '#a7d8c5' } as React.CSSProperties}></span>
              <span className="eyebrow">Recommended · For Mochi</span>
            </div>
            <h3>The dog&apos;s wishlist.</h3>
            <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-2)', fontSize: '14.5px', margin: '-4px 0 16px' }}>
              Approved by my 18-pound co-editor. She is a tough critic.
            </p>
            <div className="recs-list">
              {[
                { color1: '#f6c7a3', color2: '#d96b8a', name: 'KONG Classic — medium', desc: 'The toy she has not destroyed. Stuff with peanut butter.' },
                { color1: '#a7d8c5', color2: '#6ba39a', name: 'Ruffwear Front Range Harness', desc: 'Reflective, padded, survived a year of subway escalators.' },
                { color1: '#f5b8c7', color2: '#a07ab5', name: 'Stewart Freeze-Dried Liver Treats', desc: 'One ingredient. One very motivated dog.' },
                { color1: '#b3d0e8', color2: '#6f9bd1', name: 'LickiMat Soother', desc: '15 minutes of peace, delivered via yogurt and silicone.' },
                { color1: '#c6b5e0', color2: '#d96b8a', name: 'Highwave AutoDogMug', desc: 'Travel water bottle. Press a button, dog drinks.' },
              ].map(item => (
                <a key={item.name} className="rec-item" href="#" target="_blank" rel="noopener" style={{ '--ra': item.color1, '--rb': item.color2 } as React.CSSProperties}>
                  <span className="rec-thumb">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <ellipse cx="12" cy="14" rx="7" ry="6" />
                      <path d="M5 14V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5" />
                    </svg>
                  </span>
                  <span className="rec-info">
                    <span className="rec-name">{item.name}</span>
                    <span className="rec-desc">{item.desc}</span>
                  </span>
                  <span className="rec-cta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
            <div className="rec-disclosure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
              </svg>
              Affiliate links — Mochi gets a treat, I get a small commission.
            </div>
          </div>

        </div>
      </section>

      <Footer sourcePage="about" />

      {/* About page scripts */}
      <Script src="/image-slot.js" strategy="afterInteractive" />
      <Script id="about-init" strategy="afterInteractive">{`
        (function() {
          // Live local time
          function updateLocal() {
            var t = new Date();
            var h = t.getHours() % 12 || 12;
            var m = String(t.getMinutes()).padStart(2,'0');
            var ap = t.getHours() >= 12 ? 'PM' : 'AM';
            var el = document.getElementById('localTime');
            if (el) el.textContent = h + ':' + m + ' ' + ap;
          }
          updateLocal();
          setInterval(updateLocal, 30000);

          // Accent hex pill
          function syncAccentPill() {
            var root = getComputedStyle(document.documentElement);
            var r = root.getPropertyValue('--video-r').trim() || '86';
            var g = root.getPropertyValue('--video-g').trim() || '124';
            var b = root.getPropertyValue('--video-b').trim() || '148';
            var hex = '#' + [r,g,b].map(function(v){return parseInt(v,10).toString(16).padStart(2,'0')}).join('').toUpperCase();
            var el = document.getElementById('aboutHex');
            if (el) el.textContent = hex;
          }
          syncAccentPill();
          setInterval(syncAccentPill, 2000);

          // Cycle headline words
          var words = document.querySelectorAll('.em-cycle .word');
          if (words.length > 1) {
            var i = 0;
            setInterval(function() {
              var cur = words[i];
              i = (i + 1) % words.length;
              var next = words[i];
              cur.classList.remove('active');
              cur.classList.add('outgoing');
              next.classList.remove('outgoing');
              next.classList.add('active');
              setTimeout(function(){ cur.classList.remove('outgoing'); }, 600);
            }, 3100);
          }

          // Scroll-reveal
          var io = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
              if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            });
          }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
          document.querySelectorAll('.reveal').forEach(function(el) { io.observe(el); });

          // Apply accent from localStorage
          var saved = localStorage.getItem('acn-accent');
          if (saved) {
            var parts = saved.split(',').map(function(s){ return parseInt(s.trim(),10); });
            if (parts.length === 3) {
              document.documentElement.style.setProperty('--video-r', parts[0]);
              document.documentElement.style.setProperty('--video-g', parts[1]);
              document.documentElement.style.setProperty('--video-b', parts[2]);
              syncAccentPill();
            }
          }
        })();
      `}</Script>
    </main>
  )
}

// TypeScript: declare image-slot as a valid JSX element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'image-slot': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string
        shape?: string
        radius?: string
        placeholder?: string
        src?: string
      }, HTMLElement>
    }
  }
}
