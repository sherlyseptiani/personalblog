import Script from 'next/script'
import PostsGrid from '@/components/PostsGrid'
import Footer from '@/components/Footer'
import NotifyButton from '@/components/NotifyButton'
import VideoColorSync from '@/components/VideoColorSync'
import type { Post } from '@/lib/types'

async function getInitialPosts(): Promise<{ posts: Post[]; total: number }> {
  try {
    // Use internal API instead of direct Supabase to avoid env var issues
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    const res = await fetch(`${base}/api/posts?limit=8`, { next: { revalidate: 60 } })

    if (!res.ok) {
      console.error('[SSR] API error:', res.status, res.statusText)
      return { posts: [], total: 0 }
    }

    const json = await res.json()
    console.log('[SSR] API returned posts:', json.posts?.length || 0, 'total:', json.total)

    return { posts: json.posts ?? [], total: json.total ?? 0 }
  } catch (e) {
    console.error('[SSR] Exception:', e)
    return { posts: [], total: 0 }
  }
}

async function getRecentIdeas(): Promise<{ content: string }[]> {
  try {
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    const res = await fetch(`${base}/api/ideas/recent`, { next: { revalidate: 60 } })

    if (!res.ok) return []

    const json = await res.json()
    return json.ideas ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [{ posts, total }, recentIdeas] = await Promise.all([
    getInitialPosts(),
    getRecentIdeas(),
  ])

  // Generate issue info from total posts
  const issueNumber = total
  const now = new Date()
  const monthName = now.toLocaleDateString('en-US', { month: 'long' })
  const year = now.getFullYear()
  const issueLabel = `Issue ${issueNumber} · ${monthName} ${year}`

  return (
    <main className="wrap">

      {/* ============ HERO ============ */}
      <section className="hero" data-screen-label="hero">
        <div className="hero-video-bg" aria-hidden="true">
          <video
            id="heroVideo"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_145119_f4ec4d9f-3ecd-4116-baa3-26e8cf2df976.mp4"
            autoPlay
            muted
            loop
            playsInline
            crossOrigin="anonymous"
            preload="metadata"
          />
          <div className="tint"></div>
          <div className="scrim"></div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <div className="eyebrow">
              <span className="dot"></span>
              <span>{issueLabel}</span>
            </div>
            <h1>Notes from a <em>curious</em> mind.</h1>
            <p className="lede">
              A slow blog about the things I find fascinating — animals, history, astrophysics, science, technology, and languages. Occasionally, I leave pieces of my own experiences and perspectives here too.
            </p>
            <div className="hero-meta" style={{ marginTop: '8px' }}>
              <a href="#latest" className="btn btn-primary">
                Read latest
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <NotifyButton />
            </div>
          </div>
          <div className="hero-side"></div>
        </div>

        <div className="video-chip" title="The page accent is sampled from the video in real time">
          <span className="swatch" id="videoSwatch"></span>
          <span className="chip-text">
            <span className="label">Palette</span>
            <span className="val" id="videoHex">#567C94</span>
          </span>
        </div>
      </section>

      {/* ============ POSTS ============ */}
      <section className="posts-section" id="latest" data-screen-label="posts">
        <div className="dotgrid" aria-hidden="true"></div>
        <PostsGrid initialPosts={posts} initialTotal={total} />
      </section>

      {/* ============ FOOTER ============ */}
      <Footer
        sourcePage="homepage"
        showDescription
        showRecent
        initialIdeas={recentIdeas}
      />

      {/* Video color sync + notify button */}
      <VideoColorSync />

      <Script id="homepage-init" strategy="afterInteractive">{`
        (function() {
          var NOTIFY_KEY = 'acn-notify';
          function setNotifyState(btn, on) {
            btn.classList.toggle('on', on);
            var label = btn.querySelector('.notify-label');
            var ico = btn.querySelector('svg');
            if (on) {
              if (label) label.textContent = "You'll be notified";
              if (ico) ico.innerHTML = '<path d="M20 6 9 17l-5-5"/>';
              btn.setAttribute('aria-pressed', 'true');
            } else {
              if (label) label.textContent = 'Notify me on new posts';
              if (ico) ico.innerHTML = '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>';
              btn.setAttribute('aria-pressed', 'false');
            }
          }
          window.toggleNotify = async function(btn) {
            if (!btn) return;
            var on = btn.classList.contains('on');
            if (on) {
              setNotifyState(btn, false);
              try { localStorage.removeItem(NOTIFY_KEY); } catch(e) {}
              window.showToast && window.showToast('Notifications off.');
              return;
            }
            if ('Notification' in window) {
              try {
                var perm = await Notification.requestPermission();
                if (perm === 'granted') {
                  setNotifyState(btn, true);
                  try { localStorage.setItem(NOTIFY_KEY, '1'); } catch(e) {}
                  window.showToast && window.showToast("Got it — I'll ping you when a new note goes up.");
                  try { new Notification('A Curious Note', { body: "You'll get a quiet ping for each new essay." }); } catch(e) {}
                  return;
                }
              } catch(e) {}
            }
            setNotifyState(btn, true);
            try { localStorage.setItem(NOTIFY_KEY, '1'); } catch(e) {}
            window.showToast && window.showToast("Subscribed — you'll get a ping when a new note arrives.");
          };
          var notifyBtn = document.getElementById('notifyBtn');
          if (notifyBtn && localStorage.getItem(NOTIFY_KEY)) setNotifyState(notifyBtn, true);
        })();
      `}</Script>
    </main>
  )
}
