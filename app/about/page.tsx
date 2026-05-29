import type { Metadata } from 'next'
import Script from 'next/script'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About Sherly — A Curious Note',
  description: 'I write A Curious Note from my home in Jakarta, usually on quiet Sunday mornings, with a cup of tea nearby and my dog asleep at my feet.',
  keywords: ['about', 'Sherly Septiani', 'blog', 'frontend engineer', 'Jakarta', 'personal'],
  authors: [{ name: 'Sherly Septiani' }],
  creator: 'Sherly Septiani',
  openGraph: {
    type: 'profile',
    locale: 'en_US',
    url: 'https://acuriousnote.com/about',
    siteName: 'A Curious Note',
    title: 'About Sherly — A Curious Note',
    description: 'I write A Curious Note from my home in Jakarta, usually on quiet Sunday mornings, with a cup of tea nearby and my dog asleep at my feet.',
    images: [
      {
        url: 'https://acuriousnote.com/portrait.jpg',
        alt: 'Sherly - Author of A Curious Note',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Sherly — A Curious Note',
    description: 'I write A Curious Note from my home in Jakarta, usually on quiet Sunday mornings, with a cup of tea nearby and my dog asleep at my feet.',
    images: ['https://acuriousnote.com/portrait.jpg'],
  },
  alternates: {
    canonical: 'https://acuriousnote.com/about',
  },
}

export default function AboutPage() {
  return (
    <main className="wrap">

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
              src="/portrait.jpg"
            ></image-slot>
            <div className="pc-status">
              <span className="dot"></span>
              My dog, @glorythecorgi!
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
              I write A Curious Note from my home in Jakarta, usually on quiet Sunday mornings, with a cup of tea nearby and my dog asleep at my feet.
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
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT BODY ============ */}
      <section className="about-body" id="aboutBody">

        <a className="reading-strip glass reveal in" id="readingStrip" href="#" style={{ textDecoration: 'none' }}>
          <span className="rs-eyebrow"><span className="nico"></span>Currently reading</span>
          <span className="rs-sep"></span>
          <span className="rs-title">
            <em>The Icepick Surgeon</em> by Sam Kean
          </span>
          <span className="rs-progress">
            <span className="rs-bar" style={{ '--rs-pct': '51%' } as React.CSSProperties}><span></span></span>
            45 / 100
          </span>
        </a>

        <div className="about-masonry" id="aboutMasonry">

          <div className="about-card about-bio glass reveal in">
            <div className="card-eyebrow">
              <span className="sigil" style={{ '--sigil-a': '#f5b8c7', '--sigil-b': '#c6b5e0' } as React.CSSProperties}></span>
              <span className="eyebrow">The longer version</span>
            </div>
            <h3>An incomplete biography.</h3>
            <p>
              My name is Sherly, and I started this blog as a quiet place to keep the things I don’t want to forget:
              <em> fascinating facts, strange questions, half-finished thoughts, and small moments of wonder. </em>
              This blog is less about expertise and more about attention; a personal archive of things that made me
              pause long enough to care.
            </p>

            <p>
              By day, I work in technology as an <strong>frontend lead</strong>, building products and
              working with my beloved team of developers, who turn ideas into things that exist.
              When I’m not working or writing, I’m usually <em>reading, learning a new language,
              drinking tea, playing tennis, practicing piano, or spending time with my dog</em>.
            </p>

            <p>
              I don’t really write this blog to grow an audience. I write it so that years from now,
              I can return to these pages and remember what fascinated me, what I was learning,
              and who I was becoming at the time.
            </p>

            <p>
              Still, it would make me genuinely happy if people happen to stop by, read for a while, and leave with a new thought
              to carry around for the rest of the day.
            </p>
          </div>

          <div className="about-card glass reveal in r-d1">
            <div className="card-eyebrow">
              <span className="sigil" style={{ '--sigil-a': '#a7d8c5', '--sigil-b': '#b3d0e8' } as React.CSSProperties}></span>
              <span className="eyebrow">Quick facts</span>
            </div>
            <h3>The card-stock version.</h3>
            <div className="facts">
              <div className="fact"><span className="k">Based in</span><span className="v">Jakarta, ID <span className="accent">(mostly)</span></span></div>
              <div className="fact"><span className="k">Day job</span><span className="v">Frontend Engineer Lead</span></div>
              <div className="fact"><span className="k">Posting since</span><span className="v">Jan 2018 &middot; Issue 27</span></div>
            </div>
          </div>

          <div className="say-hi-panel reveal in r-d2">
            <div className="shp-blob shp-b1" aria-hidden="true"></div>
            <div className="shp-blob shp-b2" aria-hidden="true"></div>
            <div className="shp-blob shp-b3" aria-hidden="true"></div>
            <div className="shp-inner">
              <div className="shp-greet">Say Hi.<span className="shp-cursor">|</span></div>
              <div className="shp-sub">Reach me out on my social media account!</div>
              <div className="shp-socials">
                <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'sierli.septiani19@gmail.com'}`}>
                  <span className="sm-icon" style={{ '--sa': '#f5b8c7', '--sb': '#d96b8a' } as React.CSSProperties}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                  <span className="sm-text">
                    <span className="sm-label">Email</span>
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
                    <span className="sm-handle"> @shrlys</span>
                  </span>
                </a>
                <a href="https://www.instagram.com/sherlyseptiani">
                  <span className="sm-icon" style={{ '--sa': '#f6c7a3', '--sb': '#d96b8a' } as React.CSSProperties}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="sm-text">
                    <span className="sm-label">Instagram</span>
                    <span className="sm-handle"> @sherlyseptiani</span>
                  </span>
                </a>
                <a href="https://id.linkedin.com/in/sherly-septiani-31ba2959">
                  <span className="sm-icon" style={{ '--sa': '#6f9bd1', '--sb': '#3f5e8c' } as React.CSSProperties}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.34 17.34H5.67V9.67h2.67zM7 8.34a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1zm11.33 9H15.67V13.5c0-.94-.36-1.5-1.17-1.5-.88 0-1.49.6-1.49 1.5v3.84H10.34V9.67h2.67v1.1c.47-.78 1.36-1.27 2.5-1.27 1.93 0 2.82 1.3 2.82 3.34z" />
                    </svg>
                  </span>
                  <span className="sm-text">
                    <span className="sm-label">LinkedIn</span>
                  </span>
                </a>
                <a href="https://github.com/sherlyseptiani">
                  <span className="sm-icon" style={{ '--sa': '#a7d8c5', '--sb': '#3f5547' } as React.CSSProperties}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33s1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.16.57.67.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
                    </svg>
                  </span>
                  <span className="sm-text">
                    <span className="sm-label">GitHub</span>
                    <span className="sm-handle"> sherlyseptiani</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <a className="about-card glass reveal in recs-teaser" href="/recommendations" style={{ textDecoration: 'none', color: 'inherit' } as React.CSSProperties}>
            <div className="card-eyebrow">
              <span className="sigil" style={{ '--sigil-a': '#f5b8c7', '--sigil-b': '#c6b5e0' } as React.CSSProperties}></span>
              <span className="eyebrow">Recommended</span>
            </div>
            <h3>Things I quietly love.</h3>
            <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-2)', fontSize: '14.5px', margin: '-4px 0 18px' }}>
              A few small luxuries I&apos;ve kept around long enough to recommend &mdash;
              skincare, snacks, bags, and more.
            </p>
            <div className="recs-teaser-swatches" aria-hidden="true">
              <span style={{ background: 'linear-gradient(140deg,#f5b8c7,#d96b8a)' } as React.CSSProperties}></span>
              <span style={{ background: 'linear-gradient(140deg,#c6b5e0,#a07ab5)' } as React.CSSProperties}></span>
              <span style={{ background: 'linear-gradient(140deg,#f6c7a3,#c08a64)' } as React.CSSProperties}></span>
              <span style={{ background: 'linear-gradient(140deg,#a7d8c5,#6ba39a)' } as React.CSSProperties}></span>
              <span style={{ background: 'linear-gradient(140deg,#b3d0e8,#6f9bd1)' } as React.CSSProperties}></span>
            </div>
            <span className="recs-teaser-cta">
              See all recommendations
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>

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

          // Scroll-reveal — elements already have 'in' class for visibility
          // Animation is handled by CSS transition on initial render

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
